import http.server
import argparse
import os
import urllib.parse
import json
from PIL import Image
import subprocess

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_GET(self):
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

def run(server_class=http.server.HTTPServer, handler_class=CustomHTTPRequestHandler, port=8080, directory='.'):
    os.chdir(directory)
    handler_class.directory = directory
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd server on port {port}, serving directory {directory}')
    httpd.serve_forever()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Simple HTTP Server with Custom Headers')
    parser.add_argument('-p', '--port', type=int, default=8080, help='Port to run the server on (default: 8080)')
    parser.add_argument('-d', '--directory', type=str, default='.', help='Directory to serve (default: current directory)')
    args = parser.parse_args()
    run(port=args.port, directory=args.directory)
