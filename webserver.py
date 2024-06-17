import http.server
import argparse
import os
import urllib.parse
import json
from PIL import Image

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_GET(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            if self.path.endswith('/jav'):
                return self.list_directory_json(path)
            else:
                return self.serve_index(path)
        else:
            return super().do_GET()

    def serve_index(self, path):
        index_path = os.path.join(path, 'index.html')
        if os.path.exists(index_path):
            self.path = 'index.html'
            return super().do_GET()
        else:
            return self.list_directory_json(path)

    def list_directory_json(self, path):
        if not os.path.isdir(path):
            path += os.sep + 'jav'
        try:
            directory_items = os.listdir(path)
        except OSError:
            self.send_error(404, "No permission to list directory")
            return None
        directory_items.sort(key=lambda a: a.lower())
        entries = []
        for item in directory_items:
            full_path = os.path.join(path, item)
            if os.path.isdir(full_path):
                item_type = "directory"
                thumbnail_url = None
            else:
                item_type = "file"
                if self.is_image_or_video(item):
                    thumbnail_url = os.path.join('thumbnails', urllib.parse.quote(item) + '.thumbnail')
                    self.generate_thumbnail(full_path, thumbnail_url)
                else:
                    thumbnail_url = None
            entries.append({
                "name": item,
                "type": item_type,
                "url": 'jav/' + urllib.parse.quote(item),
                "thumbnail_url": thumbnail_url
            })
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        response = json.dumps(entries).encode('utf-8')
        self.wfile.write(response)

    def is_image_or_video(self, filename):
        image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')
        video_extensions = ('.mpg', '.mp4', '.webm', '.ts', '.mkv', '.flv', '.avi')
        return filename.lower().endswith(image_extensions + video_extensions)

    def generate_thumbnail(self, filepath, thumbnail_url):
        thumbnail_path = os.path.join(self.directory, thumbnail_url)
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
        try:
            with Image.open(filepath) as img:
                img.thumbnail((100, 100))
                img.save(thumbnail_path)
        except OSError:
            pass  # Error handling for unsupported image types or corrupted files

    def translate_path(self, path):
        path = urllib.parse.unquote(path)
        directory = self.directory
        path = path.lstrip('/')
        full_path = os.path.join(directory, path)
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

    if not os.path.isdir(args.directory):
        print(f"Error: The directory '{args.directory}' does not exist.")
        exit(1)

    run(port=args.port, directory=args.directory)
