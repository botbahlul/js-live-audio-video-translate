import http.server
import argparse
import os
import time
import urllib.parse
import json
from PIL import Image
from moviepy.editor import VideoFileClip

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_GET(self):
        # self.path is current URL path being requested by client browser
        print('self.path =', self.path)
        decoded_path = urllib.parse.unquote(self.path)
        print(f"Requested path = self.path = {self.path}")
        print(f"Decoded requested path = {decoded_path}")
        print('self.translate_path(decoded_path) =', self.translate_path(decoded_path))

        if self.path.startswith('/is_directory'):
            self.check_is_directory()
        else:
            # full_path is current actual LOCAL path on drive that being requested by client browser
            full_path = self.translate_path(self.path)
            print(f"Full path = {full_path}")

            if os.path.isdir(full_path):
                #self.create_list_and_index(full_path)
                self.create_list_json(full_path)  # Create list.json
                index_path = os.path.join(full_path, 'index.html')
                if os.path.exists(index_path):
                    print(f"Serving index.html at {index_path}")
                    self.path = os.path.join(self.path, 'index.html')
                    return super().do_GET()
                else:
                    print(f"index.html file not found, creating index.html for path =", self.path)
                    self.path = os.path.join(self.path, 'index.html')
                    self.create_index_html(full_path)  # Create index.html
                    return super().do_GET()
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

    def create_list_and_index(self, path):
        self.create_list_json(path)  # Create list.json
        self.create_index_html(path)  # Create index.html

    def create_index_html(self, path):
        index_html_content = """
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Directory Listing</title>
        <script>
			document.addEventListener('DOMContentLoaded', function() {
				async function load(list_json_path_url) {
					console.log('list_json_path_url =', list_json_path_url);
					let obj = await (await fetch(list_json_path_url)).json();
					console.log('obj =', obj);
					const directoryListing = document.getElementById('directory-listing');
					directoryListing.innerHTML = ''; // Clear existing content
					obj.forEach(item => {
						const itemElement = document.createElement('div');
						if (item.thumbnail_url) {
							const img = document.createElement('img');
							img.src = item.thumbnail_url;
							img.alt = `${item.name} thumbnail`;
							itemElement.appendChild(img);
						}
						
						if (item.type === 'directory') {
							const link = document.createElement('a');
							link.href = item.url;
							link.textContent = item.name;
							itemElement.appendChild(link);
						}
						else {
							const link = document.createElement('a');
							link.href = item.url;
							link.textContent = item.name;
							itemElement.appendChild(link);
						}
						directoryListing.appendChild(itemElement);
					});
				}

				function checkIsDirectory(path) {
					return fetch(`/is_directory?path=${encodeURIComponent(path)}`)
						.then(response => {
							if (!response.ok) {
								throw new Error('Network response was not ok');
							}
							return response.json();
						})
						.then(data => data.is_directory)
						.catch(error => {
							console.error('Failed to check if path is a directory:', error);
							throw error;
						});
				}

				// Initial load
				let window_location_href = window.location.href;
				console.log('window_location_href =', window_location_href);
				let window_location_href_url = new URL(window_location_href);
				console.log('window_location_href_url =', window_location_href_url);
				const url_origin = window_location_href_url.origin;
				console.log('url_origin =', url_origin);
				let list_json_path = '.list.json';
				console.log('list_json_path =', list_json_path);
				if (window_location_href.endsWith("index.html")) {
					let base_window_location_href = url_origin + window_location_href_url.pathname.substring(0, window_location_href_url.pathname.lastIndexOf('/') + 1);
					console.log('base_window_location_href =', base_window_location_href);
					let list_json_path_url = base_window_location_href + '/' + encodeURI(list_json_path);
					console.log('list_json_path_url =', list_json_path_url);
					load(list_json_path_url);
				}
				else {
					let base_window_location_href = url_origin + window_location_href_url.pathname;
					console.log('base_window_location_href =', base_window_location_href);
					let list_json_path_url = base_window_location_href + '/' + encodeURI(list_json_path);
					console.log('list_json_path_url =', list_json_path_url);
					load(list_json_path_url);
				}

				var link = document.querySelectorAll("a");
				link.forEach(a => {
					a.onclick = async (event) => {
						event.preventDefault();
						console.log(a.href + ' was clicked');
						console.log('link.href =', a.href);
						if (await checkIsDirectory(a.href)) {
							const url_origin = new URL(window.location.href).origin;
							console.log('url_origin =', url_origin);
							let list_json_path = '.list.json';
							window.location.href = url_origin + a.href;
							let list_json_path_url = url_origin + a.href + '/' + encodeURI(list_json_path);
							console.log('list_json_path_url =', list_json_path_url);
							console.log('link.href === "directory": load(' + list_json_path_url + ')');
							load(encodeURI(list_json_path_url));
						}
					};
				});
			});
		</script>
	</head>
	<body>
		<h1>Directory Listing</h1>
		<div id="directory-listing"></div>
	</body>
</html>

"""
        with open(os.path.join(path, 'index.html'), 'w', encoding='utf-8') as index_file:
            index_file.write(index_html_content.strip())

    def create_list_json(self, path):
        print('create_list_json for path =', path)
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
                thumbnail_url = "/folder.png"
            else:
                item_type = "file"
                if self.is_image_or_video(item):
                    print(item + ' is image or video file')
                    # Ensure .thumbnails directory exists
                    print('path =', path)
                    thumbnails_dir = '/.thumbnails'
                    print('thumbnails_dir =', thumbnails_dir)
                    os.makedirs(thumbnails_dir, exist_ok=True)

                    thumbnail_filename = item + '.png'
                    print('thumbnail_filename =', thumbnail_filename)
                    thumbnail_url = urllib.parse.quote(os.path.join('/.thumbnails', thumbnail_filename))
                    print('thumbnail_url =', thumbnail_url)
                    print('self.translate_path(thumbnail_url) =', self.translate_path(thumbnail_url))
                    thumbnail_path = self.translate_path(thumbnail_url)
                    print('thumbnail_path =', thumbnail_path)

                    # Check if thumbnail already exists
                    print('os.path.exists(thumbnail_path) =', os.path.exists(thumbnail_path))
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

        # Save the JSON to a file
        json_file_path = os.path.join(path, '.list.json')
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(entries, json_file, ensure_ascii=False, indent=4)
        print(f"Directory listing saved to {json_file_path}")

    def serve_index(self, path):
        index_path = os.path.join(path, 'index.html')
        print("index_path =", index_path)
        if os.path.exists(index_path):
            self.path = 'index.html'
            return super().do_GET()
        else:
            self.send_error(404, "Index file not found")
            return None

    def is_image_or_video(self, filename):
        image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')
        video_extensions = ('.mpg', '.mp4', '.webm', '.ts', '.mkv', '.flv', '.avi')
        return filename.lower().endswith(image_extensions + video_extensions)

    def generate_thumbnail(self, filepath, thumbnail_url):
        # Decode the URL-encoded characters
        print('generate_thumbnail(self, filepath, thumbnail_url)')
        print('filepath =', filepath)
        print('thumbnail_url =', thumbnail_url)
        print('self.translate_path(thumbnail_url) =', self.translate_path(thumbnail_url))
        thumbnail_path = urllib.parse.unquote(self.translate_path(thumbnail_url))
        print('thumbnail_path =', thumbnail_path)
        thumbnail_filename = os.path.basename(thumbnail_path)
        print('thumbnail_filename =', thumbnail_filename)

        # Adjust thumbnail path for the .thumbnails directory
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
        try:
            print(f"Generating thumbnail for: {filepath}, saving to: {thumbnail_path}")

            if self.is_video(filepath):
                # Extract a frame from the middle of the video
                with VideoFileClip(filepath) as video:
                    duration = video.duration
                    frame_time = duration / 2  # Middle of the video
                    frame = video.get_frame(frame_time)
                    frame_image = Image.fromarray(frame)
                    frame_image.thumbnail((128, 128))
                    frame_image.save(thumbnail_path, format="PNG")
            else:
                # Generate thumbnail for image
                with Image.open(filepath) as img:
                    img.thumbnail((128, 128))
                    img.save(thumbnail_path, format="PNG")

            print(f"Thumbnail created for {filepath}")
        except OSError as e:
            print(f"Failed to generate thumbnail for {filepath}. OSError: {e}")
            with Image.open("/file.png") as img:
                img.thumbnail((128, 128))
                img.save(thumbnail_path, format="PNG")
        except Exception as e:
            print(f"An unexpected error occurred while generating thumbnail for {filepath}. Error: {e}")

    def is_video(self, filename):
        video_extensions = ('.mpg', '.mp4', '.webm', '.ts', '.mkv', '.flv', '.avi')
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
