#!/usr/bin/env python3
"""Structural gate for DS-2026. Exits non-zero on any failure.

Checks the things that rot silently:
  1. every var(--x) used in CSS/mockups is actually declared in the token layer
  2. every @font-face src resolves on disk (a missing face falls back invisibly)
  3. every asset a mockup references exists
  4. the token JSON parses
  5. colors.json names and values match tokens.css exactly
  6. every mockup is registered and visibly declares illustrative content

Run: python3 scripts/validate.py
"""
import re, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DECL = re.compile(r'(?<!var\()(--[\w-]+)\s*:')   # declaration, not a var() usage
fails = []

# 1 · token references
defined = set()
for f in ['tokens/tokens.css', 'tokens/fonts.css', 'components/base.css', 'components/components.css', 'components/editorial.css', 'components/instrument.css']:
    defined |= set(DECL.findall((ROOT / f).read_text()))
used = {}
for f in list(ROOT.glob('components/*.css')) + list(ROOT.glob('mockups/*.html')) + [ROOT / 'mockups/_shell.css']:
    for v in re.findall(r'var\((--[\w-]+)', f.read_text()):
        used.setdefault(v, set()).add(f.name)
missing = {k: v for k, v in used.items() if k not in defined}
print(f"1 · token refs      {len(used):>3} used · {len(defined):>3} defined · {len(missing)} undefined")
for k, v in sorted(missing.items()):
    fails.append(f"undefined token {k} used in {', '.join(sorted(v))}")

# 2 · font faces
faces = re.findall(r"url\('([^']+)'\)", (ROOT / 'tokens/fonts.css').read_text())
bad = [u for u in faces if not (ROOT / 'tokens' / u).resolve().exists()]
print(f"2 · font files      {len(faces):>3} referenced · {len(bad)} missing")
fails += [f"missing font file {u}" for u in bad]

# 3 · mockup assets
n = 0
for f in ROOT.glob('mockups/*.html'):
    for src in re.findall(r'(?:src|href)="([^"]+)"', f.read_text()):
        if src.startswith(('http', '#', 'data:')):
            continue
        n += 1
        if not (f.parent / src).resolve().exists():
            fails.append(f"missing asset {src} referenced by {f.name}")
print(f"3 · mockup assets   {n:>3} referenced · {len([x for x in fails if 'missing asset' in x])} missing")

# 4 · token JSON
for j in sorted(ROOT.glob('tokens/*.json')):
    try: json.load(open(j))
    except Exception as e: fails.append(f"{j.name} does not parse: {e}")
print(f"4 · token JSON      {len(list(ROOT.glob('tokens/*.json'))):>3} files")

# 5 · colors.json vs tokens.css — compare the corresponding declaration, not
# merely whether a hex appears somewhere in the file. Swapped token values must
# fail even when both colours remain present.
css_text = (ROOT / 'tokens/tokens.css').read_text()
css_values = dict(re.findall(r'^\s*(--[\w-]+)\s*:\s*([^;]+);', css_text, re.MULTILINE))
cj = json.load(open(ROOT / 'tokens/colors.json'))
n5 = 0
def kebab(name):
    return re.sub(r'(?<!^)(?=[A-Z])', '-', name).lower()

for group in ('primitive', 'derived'):
    for name, spec in cj['color'][group].items():
        n5 += 1
        token = f"--{kebab(name)}"
        actual = css_values.get(token, '').strip().upper()
        expected = spec['value'].upper()
        if actual != expected:
            fails.append(f"colour drift {token}: colors.json={expected}, tokens.css={actual or 'MISSING'}")

for name, spec in cj['color']['semantic'].items():
    n5 += 1
    token = f"--{kebab(name)}"
    ref = spec['value'].strip('{}').split('.')[-1]
    expected = f"VAR(--{kebab(ref)})".upper()
    actual = css_values.get(token, '').strip().upper()
    if actual != expected:
        fails.append(f"semantic colour drift {token}: colors.json={expected}, tokens.css={actual or 'MISSING'}")
print(f"5 · colour parity   {n5:>3} named tokens checked")

# 6 · manifest and prototype-content contract
manifest = json.load(open(ROOT / 'mockups/manifest.json'))
registered = [item['file'] for item in manifest]
html_files = sorted(f"mockups/{p.name}" for p in ROOT.glob('mockups/*.html'))
if len(registered) != len(set(registered)):
    fails.append('mockup manifest contains duplicate file entries')
if set(registered) != set(html_files):
    missing_from_manifest = sorted(set(html_files) - set(registered))
    missing_on_disk = sorted(set(registered) - set(html_files))
    if missing_from_manifest: fails.append(f"mockups absent from manifest: {', '.join(missing_from_manifest)}")
    if missing_on_disk: fails.append(f"manifest entries absent on disk: {', '.join(missing_on_disk)}")
for rel in registered:
    html = (ROOT / rel).read_text()
    if 'data-content-status="illustrative"' not in html:
        fails.append(f"{rel} does not declare illustrative content")
print(f"6 · mockup contract {len(registered):>3} registered · illustrative status required")

print()
if fails:
    print(f"FAILED — {len(fails)} problem(s):")
    for f in fails: print("  !", f)
    sys.exit(1)
print("all structural checks pass")
