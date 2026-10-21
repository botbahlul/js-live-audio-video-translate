import http.server
import argparse
import os
import re
import sys
import json
import shutil
import hashlib
import threading
import subprocess
import importlib.util
import urllib.parse
import urllib.request
import urllib.error
from collections import OrderedDict
from PIL import Image

# ---------------------------------------------------------------------------
# Backend resolver (yt-dlp / streamlink) + proxy
#
#   GET /resolve?url=<page/video>&engine=auto|yt-dlp|streamlink
#       -> JSON {ok, engine, title, is_live, kind: "hls"|"file", url: "/proxy?id=..."}
#   GET /proxy?id=<id>
#       -> Streams media from the source server (includes original Referer/User-Agent
#          headers from yt-dlp, forwards Range requests, and rewrites .m3u8
#          playlists so that segments are also routed through /proxy)
#
# The proxy only handles URLs registered via /resolve or those appearing within
# a playlist returned by /resolve; it does not support arbitrary URLs.
# ---------------------------------------------------------------------------

# A single file containing both video and audio, allowing the <video> element
# to play the content without requiring an FFmpeg merge.

YTDLP_FORMAT = "b[ext=mp4][protocol=https]/b[ext=mp4][protocol=http]/b[protocol^=m3u8]/b"
RESOLVE_TIMEOUT = 60       # seconds, time limit for yt-dlp/streamlink
UPSTREAM_TIMEOUT = 30      # seconds, connection timeout to the origin server
MAX_TARGETS = 20000        # limit on the number of URLs remembered by the proxy
DEFAULT_UA = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
              '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')
DIRECT_MEDIA_RE = re.compile(r'\.(m3u8|mp4|m4v|webm)$', re.I)
URI_ATTR_RE = re.compile(r'URI="([^"]+)"')

EXTRA_YTDLP_ARGS = []      # populated from --cookies-from-browser

PROXY_TARGETS = OrderedDict()   # id -> (url, headers)
PROXY_LOCK = threading.Lock()

# Streams that do not have a single URL (e.g., HLS with separate audio / "hls-multi"):
# streamlink -> stdout -> ffmpeg -> fragmented MP4 -> /live
LIVE_TARGETS = OrderedDict()    # id -> page_url
LIVE_SESSIONS = []              # [(streamlink process, ffmpeg process)]
LIVE_LOCK = threading.Lock()
LIVE_PREFIX_RE = re.compile(r'^(hls|hlsvariant|httpstream|dash)://(.+)$', re.I)


class ResolveError(Exception):
    pass


def register_target(url, headers):
    key = hashlib.sha1((url + json.dumps(headers, sort_keys=True)).encode('utf-8')).hexdigest()[:20]
    with PROXY_LOCK:
        PROXY_TARGETS[key] = (url, headers)
        PROXY_TARGETS.move_to_end(key)
        while len(PROXY_TARGETS) > MAX_TARGETS:
            PROXY_TARGETS.popitem(last=False)
    return key


def rewrite_m3u8(text, base_url, headers):
    def proxify(ref):
        ref = ref.strip()
        if ref.lower().startswith('data:'):
            return ref
        absolute = urllib.parse.urljoin(base_url, ref)
        if urllib.parse.urlparse(absolute).scheme not in ('http', 'https'):
            return ref
        return '/proxy?id=' + register_target(absolute, headers)

    out = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            out.append(line)
        elif s.startswith('#'):
            out.append(URI_ATTR_RE.sub(lambda m: 'URI="%s"' % proxify(m.group(1)), line))
        else:
            out.append(proxify(s))
    return '\n'.join(out) + '\n'


def _find_tool(binary, module):
    exe = shutil.which(binary)
    if exe:
        return [exe]
    if importlib.util.find_spec(module):
        return [sys.executable, '-m', module]
    return None


def ytdlp_command():
    return _find_tool('yt-dlp', 'yt_dlp')


def streamlink_command():
    return _find_tool('streamlink', 'streamlink_cli')


def run_cmd(cmd, timeout=RESOLVE_TIMEOUT):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8',
                           errors='replace', timeout=timeout)
    except subprocess.TimeoutExpired:
        raise ResolveError('timeout (> %d detik)' % timeout)
    except OSError as e:
        raise ResolveError(str(e))
    if p.returncode != 0:
        lines = (p.stderr or p.stdout or '').strip().splitlines()
        raise ResolveError(lines[-1] if lines else 'exit code %d' % p.returncode)
    return p.stdout


def resolve_ytdlp(page_url):
    base = ytdlp_command()
    if not base:
        raise ResolveError('yt-dlp belum terpasang (pip install -U yt-dlp)')
    out = run_cmd(base + ['-J', '--no-playlist', '--no-warnings', '-f', YTDLP_FORMAT]
                  + EXTRA_YTDLP_ARGS + [page_url])
    try:
        info = json.loads(out)
    except ValueError:
        raise ResolveError('output yt-dlp bukan JSON yang valid')
    if info.get('entries'):
        info = next((e for e in info['entries'] if e), info)
    media_url = info.get('url')
    if not media_url:
        raise ResolveError('yt-dlp tidak memberi satu URL yang bisa diputar langsung')
    protocol = info.get('protocol') or ''
    if 'dash' in protocol:
        raise ResolveError('format DASH (mpd) tidak bisa diputar <video> biasa')
    headers = {k: v for k, v in (info.get('http_headers') or {}).items()
               if k.lower() not in ('accept-encoding', 'host')}
    is_hls = 'm3u8' in protocol or '.m3u8' in media_url.lower().split('?')[0]
    return {'url': media_url, 'headers': headers, 'title': info.get('title') or '',
            'is_live': bool(info.get('is_live')), 'hls': is_hls}


def resolve_streamlink(page_url):
    base = streamlink_command()
    if not base:
        raise ResolveError('streamlink belum terpasang (pip install -U streamlink)')
    try:
        out = run_cmd(base + ['--stream-url', page_url, 'best'])
    except ResolveError as e:
        # "hls-multi" streams (video + audio separated, e.g., Vidio) do not have a single URL.
        if 'cannot be translated to a URL' in str(e):
            if not shutil.which('ffmpeg'):
                raise ResolveError('stream ini butuh ffmpeg (video dan audio terpisah), '
                                   'tetapi ffmpeg tidak ada di PATH')
            return {'pipe': page_url, 'url': None, 'headers': {}, 'title': '',
                    'is_live': True, 'hls': False}
        raise
    lines = [l.strip() for l in out.splitlines() if l.strip()]
    media_url = lines[-1] if lines else ''
    if not media_url.startswith(('http://', 'https://')):
        raise ResolveError('streamlink tidak mengembalikan URL')
    return {'url': media_url, 'headers': {}, 'title': '', 'is_live': True,
            'hls': 'm3u8' in media_url.lower()}


ENGINES = {
    'yt-dlp': [('yt-dlp', resolve_ytdlp)],
    'streamlink': [('streamlink', resolve_streamlink)],
    'auto': [('yt-dlp', resolve_ytdlp), ('streamlink', resolve_streamlink)],
}


def resolve(page_url, engine):
    # The streamlink prefixes (hls://, hlsvariant://, ...) are for streamlink only; the URLs contained within them must be http(s).
    prefixed = LIVE_PREFIX_RE.match(page_url)
    parsed = urllib.parse.urlparse(prefixed.group(2) if prefixed else page_url)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc:
        raise ResolveError('URL harus diawali http:// atau https://')
    if prefixed:
        engine = 'streamlink'

    if not prefixed and DIRECT_MEDIA_RE.search(parsed.path):
        res = {'url': page_url, 'headers': {}, 'title': '', 'is_live': False,
               'hls': parsed.path.lower().endswith('.m3u8')}
        used = 'direct'
    else:
        errors = []
        res, used = None, None
        for name, fn in ENGINES.get(engine, ENGINES['auto']):
            try:
                res, used = fn(page_url), name
                break
            except ResolveError as e:
                errors.append('%s: %s' % (name, e))
        if res is None:
            raise ResolveError(' | '.join(errors))

    if res.get('pipe'):
        key = hashlib.sha1(res['pipe'].encode('utf-8')).hexdigest()[:20]
        with LIVE_LOCK:
            LIVE_TARGETS[key] = res['pipe']
            while len(LIVE_TARGETS) > 200:
                LIVE_TARGETS.popitem(last=False)
        return {'ok': True, 'engine': used, 'title': res['title'], 'is_live': True,
                'kind': 'file', 'url': '/live?id=' + key}

    key = register_target(res['url'], res['headers'])
    return {'ok': True, 'engine': used, 'title': res['title'], 'is_live': res['is_live'],
            'kind': 'hls' if res['hls'] else 'file', 'url': '/proxy?id=' + key}


def _pump_stderr(name, proc):
    # drain stderr so the pipe doesn't fill up, and display the error message
    try:
        for raw in proc.stderr:
            line = raw.decode('utf-8', 'replace').rstrip()
            if line:
                print('[%s] %s' % (name, line))
    except (OSError, ValueError):
        pass


def _kill_session(session):
    for proc in session:
        try:
            if proc.poll() is None:
                proc.kill()
        except OSError:
            pass
    for proc in session:
        try:
            proc.wait(timeout=5)
        except (subprocess.TimeoutExpired, OSError):
            pass


def stop_live_sessions():
    with LIVE_LOCK:
        old = list(LIVE_SESSIONS)
    for s in old:
        _kill_session(s)


class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # /live cannot be seeked; if an ad is played, the browser will spawn many new processes
        if not getattr(self, '_no_ranges', False):
            self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def log_message(self, fmt, *args):
        # HLS segments can result in hundreds of requests; avoid flooding the console
        if self.path.startswith('/proxy'):
            return
        super().log_message(fmt, *args)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/resolve':
            return self.handle_resolve(parsed)
        if parsed.path == '/proxy':
            return self.handle_proxy(parsed)
        if parsed.path == '/live':
            return self.handle_live(parsed)

        print('self.path =', self.path)
        decoded_path = urllib.parse.unquote(self.path)
        print(f"Requested path = self.path = {self.path}")
        print(f"Decoded requested path = {decoded_path}")
        print('self.translate_path(decoded_path) =', self.translate_path(decoded_path))

        if self.path.startswith('/is_directory'):
            self.check_is_directory()
        else:
            full_path = self.translate_path(self.path)
            print(f"Full path = {full_path}")

            if os.path.isdir(full_path):
                index_path = os.path.join(full_path, 'index.html')
                if os.path.exists(index_path):
                    print(f"Serving index.html at {index_path}")
                    self.path = os.path.join(self.path, 'index.html')
                    return super().do_GET()
                else:
                    print(f"Serving directory listing for {full_path}")
                    self.create_directory_listing(full_path)
            elif os.path.isfile(full_path):
                return super().do_GET()
            else:
                self.send_error(404, self.path + " file not found")

    # ----- /resolve -----------------------------------------------------
    def send_json(self, status, obj):
        body = json.dumps(obj).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def handle_resolve(self, parsed):
        qs = urllib.parse.parse_qs(parsed.query)
        page_url = (qs.get('url') or [''])[0].strip()
        engine = (qs.get('engine') or ['auto'])[0]
        if not page_url:
            return self.send_json(400, {'ok': False, 'error': 'parameter url kosong'})
        print('resolve:', page_url, '| engine =', engine)
        try:
            payload = resolve(page_url, engine)
        except ResolveError as e:
            print('resolve gagal:', e)
            return self.send_json(502, {'ok': False, 'error': str(e)})
        self.send_json(200, payload)

    # ----- /proxy -------------------------------------------------------
    def handle_proxy(self, parsed):
        qs = urllib.parse.parse_qs(parsed.query)
        key = (qs.get('id') or [''])[0]
        with PROXY_LOCK:
            target = PROXY_TARGETS.get(key)
        if not target:
            return self.send_error(404, 'proxy id tidak dikenal atau sudah kedaluwarsa')
        url, headers = target

        req_headers = {'User-Agent': DEFAULT_UA}
        req_headers.update(headers)
        req_headers['Accept-Encoding'] = 'identity'
        client_range = self.headers.get('Range')
        if client_range:
            req_headers['Range'] = client_range

        try:
            resp = urllib.request.urlopen(urllib.request.Request(url, headers=req_headers),
                                          timeout=UPSTREAM_TIMEOUT)
        except urllib.error.HTTPError as e:
            return self.send_error(e.code, 'upstream: %s' % e.reason)
        except (urllib.error.URLError, OSError, ValueError) as e:
            return self.send_error(502, 'upstream gagal: %s' % e)

        try:
            ctype = resp.headers.get('Content-Type', '')
            final_url = resp.geturl()
            looks_like_playlist = ('mpegurl' in ctype.lower() or
                                   urllib.parse.urlparse(final_url).path.lower().endswith('.m3u8'))
            if looks_like_playlist:
                body = resp.read(5 * 1024 * 1024)
                text = body.decode('utf-8', 'replace')
                if text.lstrip().startswith('#EXTM3U'):
                    body = rewrite_m3u8(text, final_url, headers).encode('utf-8')
                    ctype = 'application/vnd.apple.mpegurl'
                self.send_response(200)
                self.send_header('Content-Type', ctype or 'application/octet-stream')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body)
                return

            self.send_response(resp.status)
            self.send_header('Content-Type', ctype or 'application/octet-stream')
            for h in ('Content-Length', 'Content-Range', 'Last-Modified'):
                v = resp.headers.get(h)
                if v:
                    self.send_header(h, v)
            self.end_headers()
            while True:
                chunk = resp.read(64 * 1024)
                if not chunk:
                    break
                self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass    # player closes connection (seek/change video), normal
        except OSError as e:
            print('proxy terputus:', e)
        finally:
            resp.close()

    # ----- /live: streamlink -> ffmpeg -> fragmented MP4 ------------------
    def handle_live(self, parsed):
        qs = urllib.parse.parse_qs(parsed.query)
        key = (qs.get('id') or [''])[0]
        with LIVE_LOCK:
            page_url = LIVE_TARGETS.get(key)
        if not page_url:
            return self.send_error(404, 'live id tidak dikenal atau sudah kedaluwarsa')
        sl = streamlink_command()
        ffmpeg = shutil.which('ffmpeg')
        if not sl or not ffmpeg:
            return self.send_error(503, 'streamlink dan ffmpeg harus terpasang')

        stop_live_sessions()    # only one active player at a time; previous session terminated
        sl_proc = subprocess.Popen(sl + ['-O', '--loglevel', 'error', page_url, 'best'],
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        ff_proc = subprocess.Popen(
            [ffmpeg, '-hide_banner', '-loglevel', 'error', '-i', 'pipe:0',
             '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k',   # audio ADTS tidak bisa di-copy ke MP4
             '-f', 'mp4', '-movflags', 'frag_keyframe+empty_moov+default_base_moof', 'pipe:1'],
            stdin=sl_proc.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        sl_proc.stdout.close()  # so that SIGPIPE reaches the streamlink when ffmpeg stops
        session = (sl_proc, ff_proc)
        with LIVE_LOCK:
            LIVE_SESSIONS.append(session)
        for name, proc in (('streamlink', sl_proc), ('ffmpeg', ff_proc)):
            threading.Thread(target=_pump_stderr, args=(name, proc), daemon=True).start()

        self._no_ranges = True
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'video/mp4')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            while True:
                chunk = ff_proc.stdout.read1(64 * 1024)
                if not chunk:
                    break
                self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass    # player closed / change video
        except OSError as e:
            print('live terputus:', e)
        finally:
            _kill_session(session)
            with LIVE_LOCK:
                if session in LIVE_SESSIONS:
                    LIVE_SESSIONS.remove(session)

    # ----- old section (unchanged) -----------------------------------
    def check_is_directory(self):
        query_components = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        path = query_components.get("path", [None])[0]
        if path:
            full_path = self.translate_path(path)
            is_directory = os.path.isdir(full_path)
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            response = json.dumps({"is_directory": is_directory}).encode('utf-8')
            self.wfile.write(response)
        else:
            self.send_error(400, "Bad request: path parameter is missing")

    def create_directory_listing(self, path):
        entries = self.get_directory_entries(path)
        html_content = self.generate_directory_listing_html(entries)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))

    def get_directory_entries(self, path):
        entries = []
        try:
            directory_items = os.listdir(path)
        except OSError:
            self.send_error(404, "No permission to list directory")
            return entries

        directory_items.sort(key=lambda a: a.lower())
        for item in directory_items:
            full_path = os.path.join(path, item)
            if os.path.isdir(full_path):
                item_type = "directory"
                thumbnail_url = "/folder.png"
            else:
                item_type = "file"
                if self.is_image_or_video(item):
                    thumbnails_dir = os.path.join(path, '.thumbnails')
                    os.makedirs(thumbnails_dir, exist_ok=True)
                    thumbnail_filename = item + '.png'
                    thumbnail_url = urllib.parse.quote(os.path.join('.thumbnails', thumbnail_filename))
                    thumbnail_path = self.translate_path(thumbnail_url)
                    if not os.path.exists(thumbnail_path):
                        self.generate_thumbnail(full_path, thumbnail_url)
                else:
                    thumbnail_url = "/file.png"
            entries.append({
                "name": item,
                "type": item_type,
                "url": urllib.parse.quote(os.path.join('/', os.path.relpath(full_path, self.directory)).replace('\\', '/')),
                "thumbnail_url": thumbnail_url
            })
        return entries

    def generate_directory_listing_html(self, entries):
        entries_html = ""
        for entry in entries:
            #print('entry =', entry)
            thumbnail_img = f'<img src="{entry["thumbnail_url"]}" alt="{entry["name"]} thumbnail">' if entry["thumbnail_url"] else ""
            entries_html += f'''
            <div>
                {thumbnail_img}
                <a href="{entry["url"]}">{entry["name"]}</a>
            </div>
            '''

        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Directory Listing</title>
</head>
<body>
    <h1>Directory Listing</h1>
    <div id="directory-listing">
        {entries_html}
    </div>
</body>
</html>

"""
        #print("Generated HTML:", html_content)
        return html_content

    def is_image_or_video(self, filename):
        image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')
        video_extensions = ('.mpg', '.mpeg', '.mp4', '.webm', '.ts', '.mkv', '.flv', '.avi', '.wmv', '.ogv')
        return filename.lower().endswith(image_extensions + video_extensions)

    def generate_thumbnail(self, filepath, thumbnail_url):
        thumbnail_path = urllib.parse.unquote(self.translate_path(thumbnail_url))
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
        try:
            if self.is_video(filepath):
                command = [
                    'ffprobe', '-hide_banner', '-loglevel', 'error', '-v', 'error',
                    '-show_entries', 'format=duration', '-of', 'json', filepath
                ]
                result = subprocess.run(command, capture_output=True, text=True)
                duration_info = json.loads(result.stdout)
                duration = float(duration_info['format']['duration'])
                middle_time = duration / 4
                command = [
                    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-v', 'error',
                    '-ss', str(middle_time), '-i', filepath, '-vf', 'thumbnail,scale=128:-1',
                    '-frames:v', '1', '-q:v', '2', thumbnail_path
                ]
                subprocess.run(command, check=True)
            else:
                with Image.open(filepath) as img:
                    img.thumbnail((128, 128))
                    img.save(thumbnail_path, format="PNG")
        except subprocess.CalledProcessError as e:
            print(f"Failed to generate thumbnail: {e}")
            self.generate_default_thumbnail(thumbnail_path)
        except OSError as e:
            print(f"OSError generating thumbnail: {e}")
            self.generate_default_thumbnail(thumbnail_path)
        except Exception as e:
            print(f"Unexpected error generating thumbnail: {e}")
            self.generate_default_thumbnail(thumbnail_path)

    def generate_default_thumbnail(self, thumbnail_path):
        with Image.open("/file.png") as img:
            img.thumbnail((128, 128))
            img.save(thumbnail_path, format="PNG")

    def is_video(self, filename):
        video_extensions = ('.mpg', '.mpeg', '.mp4', '.webm', '.ts', '.mkv', '.flv', '.avi', '.wmv', '.ogv')
        return filename.lower().endswith(video_extensions)

    def translate_path(self, path):
        path = urllib.parse.unquote(path)
        path = path.lstrip('/')
        full_path = os.path.join(self.directory, path.replace('/', os.sep))
        full_path = os.path.normpath(full_path)
        return full_path


def run(server_class=http.server.ThreadingHTTPServer, handler_class=CustomHTTPRequestHandler,
        port=8080, directory='.', host=''):
    os.chdir(directory)
    handler_class.directory = directory
    server_address = (host, port)
    httpd = server_class(server_address, handler_class)
    print('yt-dlp     :', ' '.join(ytdlp_command() or ['TIDAK DITEMUKAN (pip install -U yt-dlp)']))
    print('streamlink :', ' '.join(streamlink_command() or ['TIDAK DITEMUKAN (pip install -U streamlink)']))
    print(f'Starting httpd server on {host or "0.0.0.0"}:{port}, serving directory {directory}')
    httpd.serve_forever()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Simple HTTP Server with Custom Headers')
    parser.add_argument('-p', '--port', type=int, default=8080, help='Port to run the server on (default: 8080)')
    parser.add_argument('-d', '--directory', type=str, default='.', help='Directory to serve (default: current directory)')
    parser.add_argument('--host', type=str, default='',
                        help='Alamat bind (default: semua interface). Pakai 127.0.0.1 kalau hanya diakses dari mesin ini')
    parser.add_argument('--cookies-from-browser', type=str, default=None, metavar='BROWSER',
                        help='Teruskan ke yt-dlp, mis. firefox atau chrome (untuk situs yang butuh login)')
    args = parser.parse_args()
    if args.cookies_from_browser:
        EXTRA_YTDLP_ARGS.extend(['--cookies-from-browser', args.cookies_from_browser])
    run(port=args.port, directory=args.directory, host=args.host)
