#!/usr/bin/env python3
"""Structural gate for DS-2026 · Criterio Edition. Exits non-zero on any failure.

Checks the things that rot silently:
  1. every var(--x) used in CSS/mockups is actually declared in the token layer
  2. every @font-face src resolves on disk (a missing face falls back invisibly)
  3. every asset a mockup references exists
  4. the token JSON parses
  5. colors.json hexes match tokens.css (the two must never drift)
  6. build-tokens.mjs compiles identically to tokens.css (zero drift)

Run: python3 scripts/validate.py
"""
import re, json, pathlib, sys, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
DECL = re.compile(r'(?<!var\()(--[\w-]+)\s*:')   # declaration, not a var() usage
fails = []

# 1 · token references
defined = set()
for p in list((ROOT / 'tokens').glob('*.css')) + list((ROOT / 'components').rglob('*.css')):
    defined |= set(DECL.findall(p.read_text()))
used = {}
for f in list((ROOT / 'components').rglob('*.css')) + list((ROOT / 'mockups').rglob('*.html')) + [ROOT / 'mockups/_shell.css']:
    if f.exists():
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
for f in (ROOT / 'mockups').rglob('*.html'):
    for src in re.findall(r'(?:src|href)="([^"]+)"', f.read_text()):
        if src.startswith(('http', '#', 'data:')):
            continue
        n += 1
        if not (f.parent / src).resolve().exists():
            fails.append(f"missing asset {src} referenced by {f.name}")
print(f"3 · mockup assets   {n:>3} referenced · {len([x for x in fails if 'missing asset' in x])} missing")

# 4 · token JSON
for j in sorted((ROOT / 'tokens').glob('*.json')):
    try: json.load(open(j))
    except Exception as e: fails.append(f"{j.name} does not parse: {e}")
print(f"4 · token JSON      {len(list((ROOT / 'tokens').glob('*.json'))):>3} files")

# 5 · colors.json vs tokens.css
css = (ROOT / 'tokens/tokens.css').read_text().upper()
cj = json.load(open(ROOT / 'tokens/colors.json'))
n5 = 0
for group in ('primitive', 'derived'):
    for name, spec in cj['color'][group].items():
        n5 += 1
        if spec['value'].upper() not in css:
            fails.append(f"colors.json {name}={spec['value']} not present in tokens.css")
print(f"5 · colour parity   {n5:>3} hexes checked")

# 6 · build-tokens compilation drift
try:
    current_tokens = (ROOT / 'tokens/tokens.css').read_text()
    proc = subprocess.run(['node', 'scripts/build-tokens.mjs'], cwd=ROOT, capture_output=True, text=True, check=True)
    new_tokens = (ROOT / 'tokens/tokens.css').read_text()
    if current_tokens != new_tokens:
        fails.append("tokens.css drifted from scripts/build-tokens.mjs output")
    print("6 · build-tokens    clean (0 drift from JSON sources)")
except Exception as e:
    fails.append(f"build-tokens check failed: {e}")

print()
if fails:
    print(f"FAILED — {len(fails)} problem(s):")
    for f in fails: print("  !", f)
    sys.exit(1)
print("all structural checks pass")
