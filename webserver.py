import http.server
import argparse
import os
import urllib.parse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        print(f"Translated path: {path}")  # Debug print
        f = None
        if 'Range' in self.headers:
            self.range_request = True
            self.range_header = self.headers['Range']
            self.bytes_range = self.range_header.replace('bytes=', '').split('-')
            self.start_byte = int(self.bytes_range[0])
            self.end_byte = int(self.bytes_range[1]) if self.bytes_range[1] else None
        else:
            self.range_request = False

        if os.path.isdir(path):
            # Serve index.html if it exists
            index_path = os.path.join(path, 'index.html')
            if os.path.exists(index_path):
                path = index_path
            else:
                print(f"Directory requested, serving directory listing: {path}")  # Debug print
                return self.list_directory(path)

        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
            fs = self.send_range(f) if self.range_request else self.send_file(f)
            return fs
        except OSError as e:
            print(f"Error opening file: {e}")  # Debug print
            self.send_error(404, "File not found")
            return None

    def send_file(self, f):
        self.send_response(200)
        self.send_header("Content-type", self.guess_type(f.name))
        self.send_header("Content-Length", str(self.get_file_size(f)))
        self.end_headers()
        return f

    def send_range(self, f):
        self.send_response(206)
        self.send_header("Content-type", self.guess_type(f.name))
        file_size = self.get_file_size(f)
        if self.end_byte is None or self.end_byte >= file_size:
            self.end_byte = file_size - 1
        self.send_header("Content-Range", f"bytes {self.start_byte}-{self.end_byte}/{file_size}")
        self.send_header("Content-Length", str(self.end_byte - self.start_byte + 1))
        self.end_headers()
        f.seek(self.start_byte)
        return f

    def get_file_size(self, f):
        f.seek(0, 2)
        file_size = f.tell()
        f.seek(0)
        return file_size

    def translate_path(self, path):
        # Decode the URL-encoded path
        path = urllib.parse.unquote(path)
        # Get the directory this handler is set to serve
        directory = self.directory
        # Remove the leading slash to prevent issues with os.path.join
        path = path.lstrip('/')
        # Join the directory and the path
        full_path = os.path.join(directory, path)
        # Normalize the path for Windows
        full_path = os.path.normpath(full_path)
        print(f"Full path after normalization: {full_path}")  # Debug print
        return full_path

def run(server_class=http.server.HTTPServer, handler_class=CustomHTTPRequestHandler, port=8080, directory='.'):
    os.chdir(directory)  # Change the working directory to the specified directory
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

    # Verify the directory exists
    if not os.path.isdir(args.directory):
        print(f"Error: The directory '{args.directory}' does not exist.")
        exit(1)

    run(port=args.port, directory=args.directory)
