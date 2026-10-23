#!/usr/bin/env python3
"""Loopback-only source/export server for clean routes and genuine static 404 checks."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, source=False, **kwargs):
        self.source = source
        super().__init__(*args, **kwargs)

    def translate_path(self, path):
        route = unquote(urlsplit(path).path)
        mapping = {'/': 'design-system.html' if self.source else 'index.html',
                   '/home': 'index.html' if self.source else 'home.html',
                   '/shiitake': 'shiitake.html', '/recetas': 'recetas.html', '/recetas-eryngii': 'recetas-eryngii.html', '/recetas-melena': 'recetas-melena.html',
                   '/manual': 'manual.html', '/typography': 'typography.html',
                   **{f'/especies/{slug}': f'especies/{slug}.html' for slug in ('shiitake', 'melena-de-leon', 'eryngii')}}
        return super().translate_path('/' + mapping[route] if route in mapping else path)

    def end_headers(self):
        self.send_header('X-Robots-Tag', 'noindex, nofollow')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'public, max-age=31536000, immutable' if urlsplit(self.path).path.startswith('/_assets/') else 'public, max-age=0, must-revalidate')
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def send_error(self, code, message=None, explain=None):
        custom = Path(self.directory) / '404.html'
        if code != 404 or not custom.is_file():
            return super().send_error(code, message, explain)
        body = custom.read_bytes()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', type=Path, required=True)
    parser.add_argument('--port', type=int, default=4187)
    parser.add_argument('--source', action='store_true')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(args.directory.resolve()), source=args.source))
    print(f'Public website test server ready on port {args.port}', flush=True)
    server.serve_forever()
