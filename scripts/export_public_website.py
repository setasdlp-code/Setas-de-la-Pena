#!/usr/bin/env python3
"""Export the static public site and its referenced local assets; never read hosting config."""
import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
ROUTES = {'index.html': 'home.html', 'design-system.html': 'index.html'}
SEEDS = ['index.html', 'shiitake.html', 'recetas.html', 'typography.html', 'design-system.html', 'manual.html']
ATTR = re.compile(r'\b(?:href|src)\s*=\s*([\'"])(.*?)\1', re.I)
CSS = re.compile(r'url\(\s*[\'"]?([^\)\'"]+)[\'"]?\s*\)|@import\s+[\'"]([^\'"]+)[\'"]')

def local_target(source, value):
    url = urlsplit(value.replace('&amp;', '&'))
    if url.scheme or url.netloc or not url.path:
        return None
    target = (ROOT / unquote(url.path.lstrip('/')) if url.path.startswith('/') else source.parent / unquote(url.path)).resolve()
    if not target.is_relative_to(ROOT) or target.suffix.lower() not in {'.html', '.css', '.js', '.png', '.webp', '.svg', '.ttf', '.otf', '.woff', '.woff2', '.md'}:
        raise ValueError(f'Unsupported public dependency: {source.relative_to(ROOT)} -> {value}')
    if not target.is_file():
        raise FileNotFoundError(f'{source.relative_to(ROOT)} -> {value}')
    return target

def export(output):
    output.mkdir(parents=True, exist_ok=True)
    if any(output.iterdir()):
        raise ValueError('Use a new empty output directory; existing artifacts are preserved.')
    queue = [ROOT / seed for seed in SEEDS]
    seen = set()
    records = []
    while queue:
        source = queue.pop()
        if source in seen:
            continue
        seen.add(source)
        relative = source.relative_to(ROOT).as_posix()
        destination = output / ROUTES.get(relative, relative)
        destination.parent.mkdir(parents=True, exist_ok=True)
        raw = source.read_bytes()
        if source.suffix in {'.html', '.css'}:
            content = raw.decode()
            values = [m.group(2) for m in ATTR.finditer(content)] if source.suffix == '.html' else [m.group(1) or m.group(2) for m in CSS.finditer(content)]
            for value in values:
                target = local_target(source, value)
                if target:
                    queue.append(target)
            if source.suffix == '.html':
                def rewrite(match):
                    value = match.group(2)
                    target = local_target(source, value)
                    if target and target.relative_to(ROOT).as_posix() in ROUTES:
                        route = ROUTES[target.relative_to(ROOT).as_posix()]
                        # All mapped links originate in root pages in the current graph.
                        route = '/'+route if source.parent != ROOT else route
                        value = re.sub(r'^[^?#]*', route, value, count=1)
                    return match.group(0).replace(match.group(2), value, 1)
                content = ATTR.sub(rewrite, content)
            raw = content.encode()
        destination.write_bytes(raw)
        records.append({'source': relative, 'file': destination.relative_to(output).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)})
    audit = {'result': 'exported locally; not deployed', 'routes': {'/': 'index.html', '/home': 'home.html', '/shiitake': 'shiitake.html', '/recetas': 'recetas.html', '/manual': 'manual.html'}, 'files': sorted(records, key=lambda r: r['file'])}
    (output.parent / 'export-audit.json').write_text(json.dumps(audit, indent=2, ensure_ascii=False)+'\n')
    print(json.dumps({'output': str(output), 'files': len(records), 'bytes': sum(r['bytes'] for r in records)}))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.is_relative_to(ROOT):
        parser.error('Output must be outside the source repository.')
    export(output)
