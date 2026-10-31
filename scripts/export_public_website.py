#!/usr/bin/env python3
"""Export only public dependencies; build hashed commercial assets, never read hosting credentials."""
import argparse
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://setas-de-la-pena.pages.dev'
ROUTES = {'index.html': 'home.html', 'design-system.html': 'index.html'}
CLEAN = {'/home': 'index.html', '/shiitake': 'shiitake.html', '/recetas': 'recetas.html', '/recetas-eryngii': 'recetas-eryngii.html', '/recetas-melena': 'recetas-melena.html', '/manual': 'manual.html', '/typography': 'typography.html'}
SPECIES_PAGES = {f'/especies/{slug}': f'especies/{slug}.html' for slug in ('shiitake', 'melena-de-leon', 'eryngii')}
CLEAN.update(SPECIES_PAGES)
PUBLIC_PAGES = {'/setas': 'setas.html', '/cocina': 'cocina.html', '/restaurantes': 'restaurantes.html', '/mundo-micelar': 'mundo-micelar.html'}
CLEAN.update(PUBLIC_PAGES)
COMMERCIAL = {'index.html', 'shiitake.html', 'recetas.html', 'recetas-eryngii.html', 'recetas-melena.html', '404.html', *SPECIES_PAGES.values(), *PUBLIC_PAGES.values()}
SEEDS = ['index.html', 'shiitake.html', 'recetas.html', 'recetas-eryngii.html', 'recetas-melena.html', 'typography.html', 'design-system.html', 'manual.html',
         *SPECIES_PAGES.values(), *PUBLIC_PAGES.values(), '404.html', 'robots.txt', 'sitemap.xml', 'assets/social/setas-de-la-pena.png',
         '08_brand/ds-2026/brand-kit/assets/firma-setas-de-la-pena-original.png']
ATTR = re.compile(r'\b(?:href|src)\s*=\s*([\'"])(.*?)\1', re.I)
CSS = re.compile(r'url\(\s*[\'"]?([^\)\'"]+)[\'"]?\s*\)|@import\s+[\'"]([^\'"]+)[\'"]')
IMPORT = re.compile(r'@import\s+[\'"]([^\'"]+)[\'"]\s*;')
URL = re.compile(r'url\(\s*[\'"]?([^\)\'"]+)[\'"]?\s*\)')


def local_target(source, value):
    url = urlsplit(value.replace('&amp;', '&'))
    if url.scheme or url.netloc or not url.path:
        return None
    if url.path in CLEAN:
        target = ROOT / CLEAN[url.path]
    elif url.path == '/':
        target = ROOT / 'design-system.html'
    else:
        target = (ROOT / unquote(url.path.lstrip('/')) if url.path.startswith('/') else source.parent / unquote(url.path)).resolve()
    if not target.is_relative_to(ROOT) or target.suffix.lower() not in {'.html', '.css', '.js', '.png', '.webp', '.svg', '.ttf', '.otf', '.woff', '.woff2', '.md', '.json', '.txt', '.xml'}:
        raise ValueError(f'Unsupported public dependency: {source.relative_to(ROOT)} -> {value}')
    if not target.is_file():
        raise FileNotFoundError(f'{source.relative_to(ROOT)} -> {value}')
    return target


class Exporter:
    def __init__(self, output):
        self.output = output
        self.records = {}
        self.generated = {}
        self.image_sets = {}
        self.css_inputs = set()

    def write(self, file, raw, source):
        destination = self.output / file
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(raw)
        self.records[file] = {'source': source, 'file': file, 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
        return '/' + file

    def versioned(self, raw, source, kind, stem=None, suffix=None):
        stem = stem or source.stem
        suffix = suffix or source.suffix
        digest = hashlib.sha256(raw).hexdigest()[:12]
        return self.write(f'_assets/{kind}/{stem}.{digest}{suffix}', raw, source.relative_to(ROOT).as_posix())

    def asset(self, source):
        if source in self.generated:
            return self.generated[source]
        raw = source.read_bytes()
        if source.suffix in {'.ttf', '.otf'}:
            from fontTools.ttLib import TTFont
            from fontTools.ttLib.woff2 import haveBrotli
            if not haveBrotli:
                raise RuntimeError('WOFF2 requires Brotli. Install scripts/requirements-public-website.txt in the build environment.')
            font = TTFont(io.BytesIO(raw), recalcTimestamp=False)
            font.flavor = 'woff2'
            buffer = io.BytesIO()
            font.save(buffer)
            raw = buffer.getvalue()
            kind, suffix = 'fonts', '.woff2'
        else:
            kind, suffix = ('js' if source.suffix == '.js' else 'images'), source.suffix
        result = self.versioned(raw, source, kind, suffix=suffix)
        self.generated[source] = result
        return result

    def flatten_css(self, source, parents=()):
        if source in parents:
            raise ValueError(f'Cyclic CSS import: {source}')
        self.css_inputs.add(source.relative_to(ROOT).as_posix())
        content = source.read_text()
        # Expand each import at its original position; rebase every URL from its own file.
        pieces, start = [], 0
        for match in IMPORT.finditer(content):
            pieces.append(self.rebase_css(source, content[start:match.start()]))
            target = local_target(source, match.group(1))
            if not target:
                raise ValueError('Commercial CSS must use local imports only.')
            pieces.append(self.flatten_css(target, parents + (source,)))
            start = match.end()
        pieces.append(self.rebase_css(source, content[start:]))
        result = '\n'.join(pieces)
        if '@import' in re.sub(r'/\*.*?\*/', '', result, flags=re.S):
            raise ValueError('Unsupported CSS import syntax; no imports may remain in the commercial bundle.')
        return result

    def rebase_css(self, source, content):
        def rewrite(match):
            target = local_target(source, match.group(1))
            if not target:
                return match.group(0)
            value = self.asset(target)
            return f'url("{value}")'
        content = URL.sub(rewrite, content)
        return re.sub(r'format\([\'"](?:truetype|opentype)[\'"]\)', 'format("woff2")', content)

    def bundle_css(self):
        content = self.flatten_css(ROOT / 'commercial.css')
        # Reuse the pinned build tool already installed for this repository, without changing Setas OS.
        result = subprocess.run(['node', str(ROOT / 'scripts/minify_public_css.cjs')], input=content, text=True, capture_output=True, check=True)
        return self.versioned(result.stdout.encode(), ROOT / 'commercial.css', 'css', stem='commercial', suffix='.css')

    def responsive(self, source):
        if source in self.image_sets:
            return self.image_sets[source]
        from PIL import Image
        image = Image.open(source)
        image.load()
        variants = []
        maximum = min(image.width, 1280)
        for width in sorted({min(w, maximum) for w in (320, 640, 960, maximum)}):
            size = (width, round(image.height * width / image.width))
            resized = image.resize(size, Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            resized.save(buffer, format='WEBP', quality=86, method=6)
            value = self.versioned(buffer.getvalue(), source, 'images', stem=f'{source.stem}-{width}', suffix='.webp')
            variants.append((value, width))
        result = (variants[-1][0], ', '.join(f'{url} {width}w' for url, width in variants))
        self.image_sets[source] = result
        return result

    def html(self, source, content, css_bundle):
        relative = source.relative_to(ROOT).as_posix()
        commercial = relative in COMMERCIAL
        if commercial:
            def image(match):
                tag = match.group(0)
                src = re.search(r'\bsrc=([\'"])(.*?)\1', tag)
                target = local_target(source, src.group(2)) if src else None
                if not target or target.suffix not in {'.png', '.webp'}:
                    return tag
                url, srcset = self.responsive(target)
                tag = tag.replace(src.group(0), f'src="{url}"', 1)
                # Each source already provides intrinsic dimensions. Sizes reflect responsive columns.
                sizes = '96px' if 'journal-mushroom' in tag else '(max-width: 650px) 90vw, (max-width: 1000px) 46vw, 600px'
                return tag[:-1] + f' srcset="{srcset}" sizes="{sizes}">'
            content = re.sub(r'<img\b[^>]*>', image, content)

        def rewrite(match):
            value = match.group(2)
            if value.startswith('/_assets/'):
                return match.group(0)
            target = local_target(source, value)
            if not target:
                return match.group(0)
            if commercial and target == ROOT / 'commercial.css':
                new = css_bundle
            elif commercial and target.suffix == '.js':
                new = self.asset(target)
            elif target.relative_to(ROOT).as_posix() in {'index.html', 'shiitake.html', 'recetas.html', 'design-system.html'}:
                new = {'index.html': '/home', 'shiitake.html': '/shiitake', 'recetas.html': '/recetas', 'design-system.html': '/'}[target.relative_to(ROOT).as_posix()]
            else:
                return match.group(0)
            value = re.sub(r'^[^?#]*', new, value, count=1)
            return match.group(0).replace(match.group(2), value, 1)
        return ATTR.sub(rewrite, content)

    def export(self):
        self.output.mkdir(parents=True, exist_ok=True)
        if any(self.output.iterdir()):
            raise ValueError('Use a new empty output directory; existing artifacts are preserved.')
        css_bundle = self.bundle_css()
        queue, seen = [ROOT / seed for seed in SEEDS], set()
        while queue:
            source = queue.pop()
            if source in seen:
                continue
            seen.add(source)
            relative = source.relative_to(ROOT).as_posix()
            raw = source.read_bytes()
            if source.suffix in {'.html', '.css'}:
                content = raw.decode()
                # Transform first: optimized commercial dependencies are already recorded.
                if source.suffix == '.html':
                    content = self.html(source, content, css_bundle)
                values = [m.group(2) for m in ATTR.finditer(content)] if source.suffix == '.html' else [m.group(1) or m.group(2) for m in CSS.finditer(content)]
                for value in values:
                    if value.startswith('/_assets/'):
                        continue
                    target = local_target(source, value)
                    if target:
                        queue.append(target)
                raw = content.encode()
            self.write(ROUTES.get(relative, relative), raw, relative)
        self.write('_headers', (ROOT / 'public-headers.txt').read_bytes(), 'public-headers.txt')
        self.write('_redirects', (ROOT / 'public-redirects.txt').read_bytes(), 'public-redirects.txt')
        records = sorted(self.records.values(), key=lambda r: r['file'])
        audit = {'result': 'exported locally; not deployed', 'routes': {'/': 'index.html', '/home': 'home.html', '/shiitake': 'shiitake.html', '/recetas': 'recetas.html', '/recetas-eryngii': 'recetas-eryngii.html', '/recetas-melena': 'recetas-melena.html', '/manual': 'manual.html', **SPECIES_PAGES, **PUBLIC_PAGES},
                 'commercialCss': css_bundle, 'cssInputs': sorted(self.css_inputs), 'files': records}
        (self.output.parent / 'export-audit.json').write_text(json.dumps(audit, indent=2, ensure_ascii=False)+'\n')
        print(json.dumps({'output': str(self.output), 'files': len(records), 'bytes': sum(r['bytes'] for r in records)}))


def export(output):
    Exporter(output).export()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.is_relative_to(ROOT):
        parser.error('Output must be outside the source repository.')
    export(output)
