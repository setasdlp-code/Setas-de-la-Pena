#!/usr/bin/env python3
"""Validation gate for Swiss Botanical Design System.
Checks:
  1. Every var(--sb-*) used in CSS and HTML is defined in the token layer.
  2. Every @font-face src resolves to an existing file in assets/fonts/.
  3. Every local asset referenced in mockups exists on disk.
  4. tokens.json parses and is syntactically valid.
  5. tokens.json colors match colors.css.
Exits non-zero on failure.
"""
import re, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DECL = re.compile(r'(?<!var\()(--sb-[\w-]+)\s*:')
fails = []

print("=== Validando Sistema de Diseño Swiss Botanical ===")

# 1. Token definitions vs usages
defined = set()
for f in ROOT.glob("tokens/*.css"):
    defined |= set(DECL.findall(f.read_text(encoding="utf-8")))
for f in ROOT.glob("components/*.css"):
    defined |= set(DECL.findall(f.read_text(encoding="utf-8")))

used = {}
css_and_html = list(ROOT.glob("tokens/*.css")) + list(ROOT.glob("components/*.css")) + list(ROOT.glob("mockups/*.html"))
for f in css_and_html:
    for v in re.findall(r'var\((--sb-[\w-]+)', f.read_text(encoding="utf-8")):
        used.setdefault(v, set()).add(f.name)

missing = {k: v for k, v in used.items() if k not in defined}
print(f"1. Tokens: {len(used)} usados · {len(defined)} declarados · {len(missing)} huérfanos")
for k, v in sorted(missing.items()):
    fails.append(f"Token indefinido {k} en: {', '.join(sorted(v))}")

# 2. Font faces
faces = re.findall(r"url\('([^']+)'\)", (ROOT / "tokens/typography.css").read_text(encoding="utf-8"))
bad_fonts = []
for u in faces:
    p = (ROOT / "tokens" / u).resolve()
    if not p.exists():
        bad_fonts.append(u)
print(f"2. Fuentes: {len(faces)} referenciadas · {len(bad_fonts)} faltantes")
for u in bad_fonts:
    fails.append(f"Archivo de fuente no encontrado: {u}")

# 3. Mockup assets
n_assets = 0
bad_assets = []
for f in ROOT.glob("mockups/*.html"):
    for src in re.findall(r'(?:src|href)="([^"]+)"', f.read_text(encoding="utf-8")):
        if src.startswith(('http', '#', 'data:', 'mailto:', 'tel:')):
            continue
        n_assets += 1
        p = (f.parent / src.split('#')[0].split('?')[0]).resolve()
        if not p.exists():
            bad_assets.append((src, f.name))
print(f"3. Assets en Mockups: {n_assets} referenciados · {len(bad_assets)} faltantes")
for src, fname in bad_assets:
    fails.append(f"Asset no encontrado '{src}' en {fname}")

# 4. tokens.json validity
tj = {}
try:
    tj = json.loads((ROOT / "tokens/tokens.json").read_text(encoding="utf-8"))
    print("4. tokens.json: Válido y estructurado correctamente")
except Exception as e:
    fails.append(f"tokens.json error de sintaxis: {e}")

# 5. Full named-token parity, including aliases, type, spacing and motion.
css_tokens = {}
for f in ROOT.glob('tokens/*.css'):
    raw = re.sub(r'/\*.*?\*/', '', f.read_text(encoding='utf-8'), flags=re.S)
    # Only the base declaration: reduced-motion overrides are intentional.
    for name, value in re.findall(r'(--sb-[\w-]+)\s*:\s*([^;]+);', raw):
        css_tokens.setdefault(name, value.strip())
json_tokens = tj.get('tokens', {})
for name in sorted(css_tokens.keys() | json_tokens.keys()):
    if css_tokens.get(name) != json_tokens.get(name):
        fails.append(f'Paridad CSS/JSON: {name}')
print(f'5. Paridad nominal: {len(css_tokens)} tokens CSS / {len(json_tokens)} JSON')

print("----------------------------------------------------")
if fails:
    print(f"FALLO: {len(fails)} errores detectados:")
    for f in fails:
        print("  x " + f)
    sys.exit(1)
else:
    print("ÉXITO: Todos los criterios de validación estructural cumplidos al 100%.")
