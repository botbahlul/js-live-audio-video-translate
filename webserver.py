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
import html
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
#       -> stream media from the origin server (the Referer/User-Agent headers from yt-dlp
#          are included, the Range header is passed through, and .m3u8 playlists are rewritten
#          so that the segments also pass through /proxy)
#
# The proxy only serves URLs registered via /resolve or those that appear
# within a playlist resulting from /resolve; it does not serve arbitrary URLs.
# ---------------------------------------------------------------------------

# A single file containing both video and audio, so that <video> can play it without needing to be merged via FFmpeg.
YTDLP_FORMAT = "b[ext=mp4][protocol=https]/b[ext=mp4][protocol=http]/b[protocol^=m3u8]/b"
RESOLVE_TIMEOUT = 60       # seconds, time limit for yt-dlp/streamlink
UPSTREAM_TIMEOUT = 30      # seconds, connection timeout to the origin server
MAX_TARGETS = 20000        # limit on the number of URLs remembered by the proxy
DEFAULT_UA = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
              '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')
DIRECT_MEDIA_RE = re.compile(r'\.(m3u8|mp4|m4v|webm)$', re.I)
URI_ATTR_RE = re.compile(r'URI="([^"]+)"')

EXTRA_YTDLP_ARGS = []      # populated from --cookies-from-browser

# "Open Local Files" sends a .ts that the browser cannot play itself to the server, which keeps the
# one most recent file here (inside the served folder, hidden from listings) and remuxes it with ffmpeg.
LOCAL_CACHE_DIR = '.local_cache'

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


def resolve_ytdlp_bak(page_url):
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


def resolve_ytdlp(page_url):
    base = ytdlp_command()
    if not base:
        raise ResolveError('yt-dlp belum terpasang (pip install -U yt-dlp)')

    cmd = base + [
        '-J',
        '--no-playlist',
        '--no-warnings',
        '--extractor-args', 'generic:impersonate',
        '-f', YTDLP_FORMAT
    ] + EXTRA_YTDLP_ARGS + [page_url]

    out = run_cmd(cmd)

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

    headers = {
        k: v for k, v in (info.get('http_headers') or {}).items()
        if k.lower() not in ('accept-encoding', 'host')
    }

    is_hls = 'm3u8' in protocol or '.m3u8' in media_url.lower().split('?')[0]

    return {
        'url': media_url,
        'headers': headers,
        'title': info.get('title') or '',
        'is_live': bool(info.get('is_live')),
        'hls': is_hls
    }


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


# ---------------------------------------------------------------------------
# .ts playback: browsers cannot play MPEG-TS, so /stream_ts remuxes it to fragmented MP4 on the fly.
# H.264 video and AAC audio are only copied (fast, no quality loss); anything else
# (e.g. MPEG-2 video or MP2/AC3 audio from DVB recordings) is converted to H.264 / AAC,
# because the browser cannot play those inside MP4 either.
# ---------------------------------------------------------------------------
def probe_codecs(path):
    try:
        p = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name',
                            '-of', 'json', path],
                           capture_output=True, text=True, timeout=30, stdin=subprocess.DEVNULL)
        streams = json.loads(p.stdout).get('streams', [])
    except (OSError, ValueError, subprocess.TimeoutExpired):
        return '', ''
    first = lambda kind: next((s.get('codec_name', '') for s in streams if s.get('codec_type') == kind), '')
    return first('video'), first('audio')


def ts_remux_command(ffmpeg, path):
    video_codec, audio_codec = probe_codecs(path)
    cmd = [ffmpeg, '-hide_banner', '-loglevel', 'error', '-fflags', '+genpts', '-i', path,
           '-map', '0:v:0?', '-map', '0:a:0?', '-sn', '-dn']    # no subtitle/data streams: they break the MP4 muxer
    if video_codec in ('h264', ''):
        cmd += ['-c:v', 'copy']
    else:
        cmd += ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p']
    # AAC inside MPEG-TS is ADTS; MP4 needs it unwrapped. ffmpeg does NOT do this by itself when writing
    # fragmented MP4 to a pipe: without the bitstream filter the output stops after a fraction of a second.
    cmd += ['-c:a', 'copy', '-bsf:a', 'aac_adtstoasc'] if audio_codec == 'aac' else ['-c:a', 'aac', '-b:a', '128k']
    cmd += ['-f', 'mp4', '-movflags', 'frag_keyframe+empty_moov+default_base_moof', 'pipe:1']
    return cmd, video_codec, audio_codec


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
        if parsed.path == '/play_video':
            return self.handle_play_video(parsed)
        # --- PASTIKAN ROUTE STREAM_TS ADA DI SINI ---
        if parsed.path == '/stream_ts':
            return self.handle_stream_ts(parsed)
        if parsed.path == '/find_media':
            return self.handle_find_media(parsed)
        if parsed.path == '/upload_media':
            return self.handle_upload_check(parsed)

        decoded_path = urllib.parse.unquote(self.path)
        if self.path.startswith('/is_directory'):
            self.check_is_directory()
        else:
            full_path = self.translate_path(self.path)

            if os.path.isdir(full_path):
                index_path = os.path.join(full_path, 'index.html')
                if os.path.exists(index_path):
                    self.path = os.path.join(self.path, 'index.html')
                    return super().do_GET()
                else:
                    self.create_directory_listing(full_path)
            # --- HANDLER FILE SINGLE (FIX PARSER RANGE REQUEST) ---
            elif os.path.isfile(full_path):
                # --- HANDLER BERKAS MEDIA (ANTI-DOWNLOAD BROWSER & FIX PLAY .TS) ---
                lower_path = full_path.lower()
                if lower_path.endswith(('.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.ts')):
                    # Tentukan tipe data MIME yang sah
                    ctype = 'video/mp4'
                    if lower_path.endswith('.webm'): ctype = 'video/webm'
                    elif lower_path.endswith('.mkv'): ctype = 'video/x-matroska'
                    elif lower_path.endswith('.avi'): ctype = 'video/x-msvideo'
                    elif lower_path.endswith('.mov'): ctype = 'video/quicktime'
                    elif lower_path.endswith('.flv'): ctype = 'video/x-flv'
                    elif lower_path.endswith('.ts'): ctype = 'video/mp2t'

                    file_size = os.path.getsize(full_path)
                    range_header = self.headers.get('Range')

                    # 1. JIKA BROWSER MEMINTA PARTIAL STREAMING (RANGE REQUEST)
                    if range_header and range_header.startswith("bytes="):
                        try:
                            # FIX BERHASIL: Ambil bagian kanan setelah tanda "=" (indeks 1) lalu pecah dengan "-"
                            bytes_value = range_header.strip().split("=")[1]
                            ranges = bytes_value.split("-")
                            start_byte = int(ranges[0]) if ranges[0] else 0
                            end_byte = int(ranges[1]) if ranges[1] else file_size - 1
                        except (ValueError, IndexError):
                            start_byte = 0
                            end_byte = file_size - 1

                        if start_byte >= file_size:
                            self.send_error(416, "Requested Range Not Satisfiable")
                            return

                        end_byte = min(end_byte, file_size - 1)
                        content_length = end_byte - start_byte + 1

                        # Balas dengan kode HTTP 206 Partial Content (Kunci utama mematikan auto-download)
                        self.send_response(206)
                        self.send_header('Content-Type', ctype)
                        self.send_header('Accept-Ranges', 'bytes')
                        self.send_header('Content-Range', f'bytes {start_byte}-{end_byte}/{file_size}')
                        self.send_header('Content-Length', str(content_length))
                        self.end_headers()

                        # Salurkan bongkahan memori video secara bertahap
                        with open(full_path, 'rb') as f:
                            f.seek(start_byte)
                            remaining = content_length
                            while remaining > 0:
                                chunk_size = min(64 * 1024, remaining)
                                chunk = f.read(chunk_size)
                                if not chunk:
                                    break
                                self.wfile.write(chunk)
                                remaining -= len(chunk)
                        return
                    else:
                        # 2. REQUEST REGULER TANPA HEADER RANGE
                        self.send_response(200)
                        self.send_header('Content-Type', ctype)
                        self.send_header('Accept-Ranges', 'bytes')
                        self.send_header('Content-Length', str(file_size))
                        self.end_headers()
                        with open(full_path, 'rb') as f:
                            shutil.copyfileobj(f, self.wfile)
                        return
                
                # Sediakan file non-video lewat handler default bawaan Python
                return super().do_GET()
            else:
                self.send_error(404, self.path + " file not found")

    def handle_play_video(self, parsed):
        """Serves HTML video player and handles live remuxing for non-native formats like .ts"""
        qs = urllib.parse.parse_qs(parsed.query)
        video_url = (qs.get('file') or [''])[0].strip()
        
        if not video_url:
            self.send_error(400, "Missing file parameter")
            return
            
        decoded_url = urllib.parse.unquote(video_url)
        file_name = decoded_url.split('/')[-1]
        lower_name = file_name.lower()
        file_name = html.escape(file_name)      # shown inside the HTML below
        
        # --- SOLUSI STRATEGI BARU JIKA USER AKSES FILE COCOK DI TAB BARU ---
        # 1. Jika formatnya .ts, buat halaman khusus yang mengarah ke endpoint live remuxer
        if lower_name.endswith('.ts'):
            html_player = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Live Remuxing: {file_name}</title>
                <style>
                    body, html {{ margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }}
                    video {{ width: 100%; height: 100%; object-fit: contain; }}
                </style>
            </head>
            <body>
                <!-- Mengarahkan source ke endpoint streaming khusus .ts -->
                <video controls autoplay name="media">
                    <source src="/stream_ts?file={urllib.parse.quote(decoded_url)}" type="video/mp4">
                </video>
            </body>
            </html>
            """
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(html_player.encode('utf-8'))
            return

        # 2. Blok proteksi otomatis untuk format yang benar-benar tidak bisa diputar browser (MKV, AVI, FLV)
        if lower_name.endswith(('.mkv', '.avi', '.flv', '.mov')):
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Unsupported Format</title>
                <style>
                    body {{ background: #1e1e1e; color: #fff; font-family: sans-serif; text-align: center; padding-top: 100px; }}
                    .box {{ background: #2d2d2d; display: inline-block; padding: 30px; border-radius: 8px; border-top: 5px solid #ff3333; }}
                </style>
                <script>
                    let time = 4;
                    setInterval(() => {{
                        time--;
                        document.getElementById('timer').innerText = time;
                        if(time <= 0) window.close();
                    }}, 1000);
                </script>
            </head>
            <body>
                <div class="box">
                    <h2>Unsupported Browser Format!</h2>
                    <p>Format <b>{file_name}</b> membutuhkan pemutar desktop (seperti VLC).</p>
                    <p>Silakan putar di halaman utama menggunakan fitur Embed Player.</p>
                    <p>Tab ini akan menutup dalam <span id="timer" style="color:#ff9900;font-weight:bold;">4</span> detik...</p>
                </div>
            </body>
            </html>
            """
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))
            return

        # Jika format asli adalah MP4/WebM bawaan
        html_player = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Playing: {file_name}</title>
            <style>
                body, html {{ margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }}
                video {{ width: 100%; height: 100%; object-fit: contain; }}
            </style>
        </head>
        <body>
            <video controls autoplay name="media">
                <source src="{html.escape(video_url)}" type="video/mp4">
            </video>
        </body>
        </html>
        """
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(html_player.encode('utf-8'))


    def is_inside_root(self, full_path):
        # translate_path() does not stop "..", so the endpoints that open files check it explicitly
        root = os.path.normcase(os.path.abspath(self.directory))
        target = os.path.normcase(os.path.abspath(full_path))
        return target == root or target.startswith(root + os.sep)

    def handle_stream_ts(self, parsed):
        # .ts -> fragmented MP4 piped straight to the browser (see ts_remux_command)
        qs = urllib.parse.parse_qs(parsed.query)
        video_rel_path = (qs.get('file') or [''])[0].strip()
        full_path = self.translate_path(video_rel_path)

        if not video_rel_path or not self.is_inside_root(full_path) or not os.path.isfile(full_path):
            self.send_error(404, "File video tidak ditemukan")
            return
        ffmpeg = shutil.which('ffmpeg')
        if not ffmpeg:
            self.send_error(503, "ffmpeg tidak ditemukan di PATH")
            return

        cmd, video_codec, audio_codec = ts_remux_command(ffmpeg, full_path)
        print('stream_ts: %s | video=%s audio=%s -> %s' % (
            video_rel_path, video_codec or '?', audio_codec or '-',
            'copy' if '-c:v' in cmd and cmd[cmd.index('-c:v') + 1] == 'copy' else 'convert to H.264'))
        proc = subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        threading.Thread(target=_pump_stderr, args=('ffmpeg', proc), daemon=True).start()

        self._no_ranges = True      # a pipe cannot be seeked; do not advertise Accept-Ranges
        try:
            # Wait for the first bytes before sending the headers, so an ffmpeg failure becomes a
            # real error response instead of an empty "video" in the browser.
            first = proc.stdout.read1(64 * 1024)
            if not first:
                self.send_error(500, "ffmpeg gagal memproses file ini (lihat console server)")
                return
            self.send_response(200)
            self.send_header('Content-Type', 'video/mp4')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(first)
            while True:
                chunk = proc.stdout.read1(64 * 1024)
                if not chunk:
                    break
                self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass    # player closed / video changed
        except OSError as e:
            print('stream_ts terputus:', e)
        finally:
            _kill_session((proc,))

    def handle_find_media(self, parsed):
        # A browser File object has no real path. This looks for a file with the same name (and size)
        # inside the served folder, so that "Open Local Files" can hand it to /stream_ts.
        qs = urllib.parse.parse_qs(parsed.query)
        name = (qs.get('name') or [''])[0]
        if not name or '/' in name or '\\' in name:
            return self.send_json(400, {'ok': False, 'error': 'parameter name tidak valid'})
        try:
            size = int((qs.get('size') or [''])[0])
        except ValueError:
            size = None

        root = os.path.abspath(self.directory)
        wanted = os.path.normcase(name)
        fallback = None
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if not d.startswith('.')]    # skip .thumbnails etc.
            for fn in filenames:
                if os.path.normcase(fn) != wanted:
                    continue
                full = os.path.join(dirpath, fn)
                rel = '/' + os.path.relpath(full, root).replace(os.sep, '/')
                try:
                    same_size = size is None or os.path.getsize(full) == size
                except OSError:
                    continue
                if same_size:
                    return self.send_json(200, {'ok': True, 'path': rel, 'exact': True})
                fallback = fallback or rel
        if fallback:
            return self.send_json(200, {'ok': True, 'path': fallback, 'exact': False})
        self.send_json(404, {'ok': False, 'error': 'File "%s" tidak ada di folder yang disajikan server. '
                                                  'Salin file itu ke folder tersebut (mis. videos/) lalu buka lagi.' % name})

    # ----- /upload_media: a file picked with "Open Local Files" that is not in the served folder -----
    def is_local_client(self):
        return self.client_address[0] in ('127.0.0.1', '::1', '::ffff:127.0.0.1')

    def upload_cache_path(self, name, size):
        digest = hashlib.sha1(('%s|%d' % (name, size)).encode('utf-8')).hexdigest()[:16]
        return os.path.join(self.directory, LOCAL_CACHE_DIR, digest + '.ts')

    def parse_upload_query(self, parsed):
        qs = urllib.parse.parse_qs(parsed.query)
        name = (qs.get('name') or [''])[0]
        try:
            size = int((qs.get('size') or [''])[0])
        except ValueError:
            size = -1
        if not name.lower().endswith('.ts') or size < 0:
            return None, None
        return name, size

    def handle_upload_check(self, parsed):
        # has this exact file (name + size) been sent before? then it does not have to be sent again
        name, size = self.parse_upload_query(parsed)
        if name is None:
            return self.send_json(400, {'ok': False, 'error': 'parameter tidak valid (hanya file .ts)'})
        path = self.upload_cache_path(name, size)
        if os.path.isfile(path) and os.path.getsize(path) == size:
            return self.send_json(200, {'ok': True, 'cached': True,
                                        'path': '/' + LOCAL_CACHE_DIR + '/' + os.path.basename(path)})
        self.send_json(404, {'ok': False})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/upload_media':
            return self.handle_upload_media(parsed)
        self.send_error(404, 'endpoint POST tidak dikenal')

    def handle_upload_media(self, parsed):
        # Only from this computer, and only with a custom header: a web page on another site cannot add that
        # header without a CORS preflight, which this server never answers.
        if not self.is_local_client() or self.headers.get('X-Upload') != '1':
            return self.send_json(403, {'ok': False, 'error': 'upload hanya diizinkan dari komputer ini (localhost)'})
        name, size = self.parse_upload_query(parsed)
        try:
            length = int(self.headers.get('Content-Length', ''))
        except ValueError:
            length = -1
        if name is None or length != size:
            return self.send_json(400, {'ok': False, 'error': 'parameter tidak valid (hanya .ts; size harus sama dengan Content-Length)'})

        cache_dir = os.path.join(self.directory, LOCAL_CACHE_DIR)
        os.makedirs(cache_dir, exist_ok=True)
        target = self.upload_cache_path(name, size)
        for fn in os.listdir(cache_dir):            # only the most recent file is kept
            old = os.path.join(cache_dir, fn)
            if old != target:
                try:
                    os.remove(old)
                except OSError:
                    pass                            # e.g. still open in ffmpeg on Windows
        if shutil.disk_usage(cache_dir).free < size + 200 * 1024 * 1024:
            return self.send_json(507, {'ok': False, 'error': 'ruang disk tidak cukup untuk menyalin file ini'})

        tmp = target + '.part'
        received = 0
        try:
            with open(tmp, 'wb') as f:
                while received < size:
                    chunk = self.rfile.read(min(1024 * 1024, size - received))
                    if not chunk:
                        break
                    f.write(chunk)
                    received += len(chunk)
            if received != size:
                raise OSError('koneksi terputus (%d dari %d byte)' % (received, size))
            os.replace(tmp, target)
        except OSError as e:
            print('upload_media gagal:', e)
            try:
                os.remove(tmp)
            except OSError:
                pass
            try:
                self.send_json(500, {'ok': False, 'error': str(e)})
            except OSError:
                pass
            return
        print('upload_media: %s (%d byte) -> %s' % (name, size, os.path.basename(target)))
        self.send_json(200, {'ok': True, 'path': '/' + LOCAL_CACHE_DIR + '/' + os.path.basename(target)})

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
             '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k',   # ADTS audio cannot be copied to MP4
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
            pass    # player closed / video changes
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

        # --- FILTER OUT DOTFILES AND DOTFOLDERS HERE ---
        # This completely skips any file or folder starting with a "." (like .thumbnails)
        directory_items = [item for item in directory_items if not item.startswith('.')]

        directory_items.sort(key=lambda a: a.lower())
        for item in directory_items:
            full_path = os.path.join(path, item)
            if os.path.isdir(full_path):
                item_type = "directory"
                thumbnail_url = "/folder.png"
            else:
                item_type = "file"
                if self.is_image_or_video(item):
                    # 1. Buat folder .thumbnails lokal secara absolut sesuai folder video berada
                    thumbnails_dir = os.path.join(path, '.thumbnails')
                    os.makedirs(thumbnails_dir, exist_ok=True)
                    
                    thumbnail_filename = item + '.png'
                    
                    # 2. BEST PRACTICE: Define `thumbnail_path` directly using `os.path.join` (DO NOT use `translate_path`)
                    thumbnail_path = os.path.join(thumbnails_dir, thumbnail_filename)
                    
                    # 3. URL for use in the <img src="..."> tag in the browser
                    # Use a path relative to the current folder so the browser doesn't get confused
                    thumbnail_url = urllib.parse.quote(os.path.join('.thumbnails', thumbnail_filename).replace('\\', '/'))
                    
                    # 4. Generate only if the physical thumbnail file does not yet exist
                    if not os.path.exists(thumbnail_path):
                        # modify the thumbnail generation function so that it accepts a physical path directly
                        self.generate_thumbnail_fixed(full_path, thumbnail_path)
                else:
                    thumbnail_url = "/file.png"
            entries.append({
                "name": item,
                "type": item_type,
                "url": urllib.parse.quote(os.path.join('/', os.path.relpath(full_path, self.directory)).replace('\\', '/')),
                "thumbnail_url": thumbnail_url
            })
        return entries

    def generate_directory_listing_html_bak(self, entries):
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


    def generate_directory_listing_html(self, entries):
        entries_html = ""
        for entry in entries:
            thumbnail_img = f'<img src="{entry["thumbnail_url"]}" alt="{entry["name"]} thumbnail" style="width:128px; vertical-align:middle; margin-right:10px;">' if entry["thumbnail_url"] else ""
            
            if entry["name"].lower().endswith(('.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.ts')):
                # URL untuk mengelabui IDM di tab baru
                play_url = f"/play_video?file={urllib.parse.quote(entry['url'])}"
                
                entries_html += f'''
                <div style="margin-bottom: 15px;">
                    {thumbnail_img}
                    <!-- href mengarah ke play_url (IDM bypass), onclick menangani play langsung di tab yang sama -->
                    <a href="{play_url}" target="_blank" onclick="handleVideoClick(event, '{entry["url"]}');" style="font-size: 16px; color: #0066cc; text-decoration: none;">
                        {entry["name"]}
                    </a>
                </div>
                '''
            else:
                entries_html += f'''
                <div style="margin-bottom: 15px;">
                    {thumbnail_img}
                    <a href="{entry["url"]}" style="font-size: 16px; color: #0066cc; text-decoration: none;">
                        {entry["name"]}
                    </a>
                </div>
                '''

        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Directory Listing</title>
    <script>
        function handleVideoClick(event, rawVideoUrl) {{
            // Jika diklik kiri biasa (bukan klik tengah, bukan Ctrl+Klik / Cmd+Klik)
            if (!event.ctrlKey && !event.metaKey && event.button === 0) {{
                event.preventDefault(); // Batalkan fungsi target="_blank" (jangan buka tab baru)
                
                // Gunakan unescape/decode URL agar siap dibaca oleh engine resolve
                var cleanUrl = decodeURIComponent(rawVideoUrl);
                
                // Kirim perintah play langsung ke halaman utama (embed player)
                if (window.parent && typeof window.parent.embed_via_backend === 'function') {{
                    window.parent.embed_via_backend(cleanUrl, 'auto');
                }} else if (typeof embed_via_backend === 'function') {{
                    embed_via_backend(cleanUrl, 'auto');
                }} else {{
                    // Fallback jika tidak berada di dalam iframe player utama
                    window.location.href = "/play_video?file=" + encodeURIComponent(cleanUrl);
                }}
            }}
            // Jika klik tengah atau Ctrl+Klik, biarkan berjalan normal (href /play_video akan memicu tab baru tanpa di-intercept IDM)
        }}
    </script>
</head>
<body>
    <h1>Directory Listing</h1>
    <div id="directory-listing" style="padding: 20px;">
        {entries_html}
    </div>
</body>
</html>
"""
        return html_content


    def is_image_or_video(self, filename):
        image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')
        video_extensions = ('.mpg', '.mpeg', '.mp4', '.webm', '.ts', '.mkv', '.flv', '.avi', '.wmv', '.ogv', '.ts')
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

    def generate_thumbnail_fixed(self, filepath, thumbnail_path):
        """Generates thumbnail using the exact physical absolute paths provided."""
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
        try:
            if self.is_video(filepath):
                # Get video duration using ffprobe
                command = [
                    'ffprobe', '-hide_banner', '-loglevel', 'error', '-v', 'error',
                    '-show_entries', 'format=duration', '-of', 'json', filepath
                ]
                result = subprocess.run(command, capture_output=True, text=True)
                duration_info = json.loads(result.stdout)
                duration = float(duration_info['format']['duration'])
                middle_time = duration / 4
                
                # Extract frame using ffmpeg
                command = [
                    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-v', 'error',
                    '-ss', str(middle_time), '-i', filepath, '-vf', 'thumbnail,scale=128:-1',
                    '-frames:v', '1', '-q:v', '2', thumbnail_path
                ]
                subprocess.run(command, check=True)
            else:
                # Handle image thumbnailing using PIL
                with Image.open(filepath) as img:
                    img.thumbnail((128, 128))
                    img.save(thumbnail_path, format="PNG")
        except Exception as e:
            print(f"Unexpected error generating thumbnail for {os.path.basename(filepath)}: {e}")
            self.generate_default_thumbnail(thumbnail_path)


    def generate_default_thumbnail(self, thumbnail_path):
        # file.png lives in the served folder, not in the root of the disk; if it cannot be read, use a plain
        # placeholder, so that one unreadable video can no longer break the whole directory listing
        try:
            with Image.open(os.path.join(self.directory, "file.png")) as img:
                img.thumbnail((128, 128))
                img.save(thumbnail_path, format="PNG")
        except Exception as e:
            print(f"file.png tidak bisa dipakai untuk thumbnail default ({e}), memakai kotak abu-abu")
            Image.new('RGB', (128, 72), (90, 90, 90)).save(thumbnail_path, format="PNG")

    def is_video(self, filename):
        video_extensions = ('.mpg', '.mpeg', '.mp4', '.webm', '.ts', '.mkv', '.flv', '.avi', '.wmv', '.ogv', '.ts')
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
    shutil.rmtree(LOCAL_CACHE_DIR, ignore_errors=True)      # leftovers of the previous run
    server_address = (host, port)
    httpd = server_class(server_address, handler_class)
    print('yt-dlp     :', ' '.join(ytdlp_command() or ['NOT FOUND (pip install -U yt-dlp)']))
    print('streamlink :', ' '.join(streamlink_command() or ['NOT FOUND (pip install -U streamlink)']))
    print(f'Starting httpd server on {host or "0.0.0.0"}:{port}, serving directory {directory}')
    httpd.serve_forever()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Simple HTTP Server with Custom Headers')
    parser.add_argument('-p', '--port', type=int, default=8080, help='Port to run the server on (default: 8080)')
    parser.add_argument('-d', '--directory', type=str, default='.', help='Directory to serve (default: current directory)')
    parser.add_argument('-H', '--host', type=str, default='', help='Bind address (default: all interfaces). Use 127.0.0.1 if only accessed from this machine')
    parser.add_argument('-C', '--cookies-from-browser', type=str, default=None, metavar='BROWSER', help='Forward to yt-dlp, e.g. firefox or chrome (for sites that require login))')
    args = parser.parse_args()
    if args.cookies_from_browser:
        EXTRA_YTDLP_ARGS.extend(['--cookies-from-browser', args.cookies_from_browser])
    run(port=args.port, directory=args.directory, host=args.host)
