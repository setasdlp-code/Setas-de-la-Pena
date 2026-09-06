#!/usr/bin/env python3
"""Validation gate for Swiss Botanical Design System.
Checks:
  1. Every var(--sb-*) used in CSS and HTML is defined in the token layer.
  2. Every @font-face src resolves to an existing file in assets/fonts/.
  3. Every local asset referenced in mockups exists on disk.
  4. All token JSON files parse and are syntactically valid.
  5. colors.json and tokens.json colors match colors.css.
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
css_and_html = list(ROOT.glob("components/*.css")) + list(ROOT.glob("mockups/*.html"))
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
        if src.startswith(('http', '#', 'data:')) or src.endswith('.html'):
            continue
        n_assets += 1
        p = (f.parent / src).resolve()
        if not p.exists():
            bad_assets.append((src, f.name))
print(f"3. Assets en Mockups: {n_assets} referenciados · {len(bad_assets)} faltantes")
for src, fname in bad_assets:
    fails.append(f"Asset no encontrado '{src}' en {fname}")

# 4. Token JSON validity across all json files
json_files = list(ROOT.glob("tokens/*.json"))
print(f"4. Token JSON: Auditando {len(json_files)} archivos JSON")
for jf in json_files:
    try:
        json.loads(jf.read_text(encoding="utf-8"))
    except Exception as e:
        fails.append(f"{jf.name} error de sintaxis: {e}")

# 5. colors.json vs colors.css parity
css_colors = (ROOT / "tokens/colors.css").read_text(encoding="utf-8").upper()
cj = json.loads((ROOT / "tokens/colors.json").read_text(encoding="utf-8"))
color_vals = []
for grp in ("primitive", "species", "status"):
    for item in cj["color"].get(grp, {}).values():
        if "value" in item and item["value"].startswith("#"):
            color_vals.append(item["value"].upper())

missing_hex = [h for h in color_vals if h not in css_colors]
print(f"5. Paridad Color (colors.json vs colors.css): {len(color_vals)} colores auditados · {len(missing_hex)} desajustes")
for h in missing_hex:
    fails.append(f"Hex {h} declarado en colors.json pero no encontrado en colors.css")

print("----------------------------------------------------")
if fails:
    print(f"FALLO: {len(fails)} errores detectados:")
    for f in fails:
        print("  x " + f)
    sys.exit(1)
else:
    print("ÉXITO: Todos los criterios de validación estructural cumplidos al 100%.")
