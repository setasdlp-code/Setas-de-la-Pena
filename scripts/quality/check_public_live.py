#!/usr/bin/env python3
"""Read-only HTTPS verification of the exact validated Pages export; no browser fixtures or sends."""
import argparse
import concurrent.futures
import hashlib
import json
import re
import struct
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit, parse_qs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--artifact', required=True, type=Path)
    parser.add_argument('--base', default='https://setas-de-la-pena.pages.dev')
    parser.add_argument('--report', required=True, type=Path)
    args = parser.parse_args()
    base = args.base.rstrip('/')
    if urlsplit(base).scheme != 'https':
        parser.error('Live checks require HTTPS with normal certificate verification.')
    manifest = json.loads((args.artifact.parent / 'export-audit.json').read_text())
    report = {'base': base, 'files': [], 'routes': [], 'messageSent': False, 'syntheticProductionData': False}

    def fetch(path):
        request = urllib.request.Request(base + '/' + path.lstrip('/'), headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache'})
        try:
            response = urllib.request.urlopen(request, timeout=45)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            body = response.read()
            return response.status, dict((k.lower(), v) for k, v in response.headers.items()), body, response.url

    def check_file(entry):
        status, headers, body, url = fetch(entry['file'])
        assert status == 200, (entry['file'], status)
        assert hashlib.sha256(body).hexdigest() == entry['sha256'], f"SHA mismatch: {entry['file']}"
        assert headers.get('x-robots-tag') == 'noindex, nofollow', (entry['file'], headers.get('x-robots-tag'))
        cache = headers.get('cache-control', '')
        if entry['file'].startswith('_assets/'):
            assert re.search(r'\.[a-f0-9]{12}\.', entry['file']), entry['file']
            assert 'max-age=31536000' in cache and 'immutable' in cache, (entry['file'], cache)
        else:
            assert 'immutable' not in cache, (entry['file'], cache)
        return {'file': entry['file'], 'status': status, 'sha256': entry['sha256'], 'cacheControl': cache, 'robots': headers['x-robots-tag']}

    public_files = [entry for entry in manifest['files'] if entry['file'] not in {'_headers', '_redirects'}]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        report['files'] = list(pool.map(check_file, public_files))
    product_routes = [(route.lstrip('/'), file) for route, file in manifest['routes'].items()
                      if route in {'/', '/home', '/shiitake', '/recetas', '/recetas-melena', '/recetas-eryngii'}
                      or route.startswith('/especies/')]
    for route, file in product_routes:
        status, headers, body, url = fetch(route)
        assert status == 200, route
        assert body == (args.artifact / file).read_bytes(), route
        assert 'immutable' not in headers.get('cache-control', ''), route
        if route:
            text = body.decode()
            canonical = f'https://setas-de-la-pena.pages.dev/{route}'
            assert f'<link rel="canonical" href="{canonical}">' in text, route
            assert f'<meta property="og:url" content="{canonical}">' in text, route
            assert 'summary_large_image' in text and 'application/ld+json' in text, route
            assert 'typography-trials' not in text, route
        report['routes'].append({'route': '/'+route, 'status': status, 'exactValidatedHtml': True})
    for route in ['nonexistent-audit-20261015', 'nested/nonexistent-audit-20261015', '_headers', '_redirects']:
        status, headers, body, url = fetch(route)
        assert status == 404, (route, status)
        assert 'No encontramos esta página' in body.decode(), route
        assert headers.get('x-robots-tag') == 'noindex, nofollow', route
        report['routes'].append({'route': '/'+route, 'status': status, 'custom404': True})
    status, headers, body, _ = fetch('robots.txt')
    assert status == 200 and 'text/plain' in headers.get('content-type', '')
    assert 'Sitemap: https://setas-de-la-pena.pages.dev/sitemap.xml' in body.decode()
    status, headers, body, _ = fetch('sitemap.xml')
    assert status == 200 and 'xml' in headers.get('content-type', '')
    locations = [node.text for node in ET.fromstring(body).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    expected_locations = [node.text for node in ET.fromstring((args.artifact / 'sitemap.xml').read_bytes()).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    assert locations == expected_locations
    _, _, png, _ = fetch('assets/social/setas-de-la-pena.png')
    assert struct.unpack('>II', png[16:24]) == (1200,630)
    query = 'recipe=receta-arepa&scale=3&purpose=restaurante&pairing=bricolage'
    status, _, _, url = fetch('shiitake.html?' + query)
    assert status == 200 and urlsplit(url).path == '/shiitake', url
    assert parse_qs(urlsplit(url).query) == parse_qs(query), url
    for route, final in [('ds','/'),('marca','/manual'),('web','/home')]:
        status, _, _, url = fetch(route)
        assert status == 200 and urlsplit(url).path == final, (route,url)
    report['discovery'] = {'robots': 'passed', 'sitemap': locations, 'socialImage': [1200,630], 'legacyQueryRedirect': 'passed', 'aliases': 'passed'}
    report['result'] = 'passed'
    args.report.write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n')
    print(json.dumps({'result':'passed','files':len(report['files']),'routes':len(report['routes']),'report':str(args.report)}))


if __name__ == '__main__':
    main()
