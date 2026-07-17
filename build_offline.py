#!/usr/bin/env python3
"""
build_offline.py — Setas de la Peña
Crea simulador_sustrato_v4_OFFLINE.html con TODO inlinado:
React, ReactDOM, Babel, html2pdf, fuentes y CSS locales.

Uso:
  cd "ruta/a/Setas de la Peña"
  python3 build_offline.py
"""

import base64, re, sys, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent

# ── Dependencias CDN ────────────────────────────────────────────────────
CDN = {
    "react":    "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
    "react-dom":"https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
    "babel":    "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js",
    "html2pdf": "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
    # JetBrains Mono — las 3 variantes que usa el app
    "jb-400":   "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2",
    "jb-500":   "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTPlmUsaaDhw.woff2",
    "jb-700":   "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjO1mUsaaDhw.woff2",
}

# ── Archivos locales ────────────────────────────────────────────────────
DS_BASE = HERE / "_ds" / "setas-de-la-pe-a-design-system-2b03b4d8-b6d6-43ca-8854-319bf2d66e17" / "design"
LOCAL_FILES = {
    "colors_css":  DS_BASE / "colors_and_type.css",
    "sim_css":     HERE / "recipe-sim-v2.css",
    "recommender": HERE / "recipe-recommender.js",
}
FONT_FILES = {
    "GayaPatched-Regular":        DS_BASE / "fonts" / "GayaPatched-Regular.otf",
    "GayaPatched-Italic":         DS_BASE / "fonts" / "GayaPatched-Italic.otf",
    "PPObjectSans-Heavy":         DS_BASE / "fonts" / "PPObjectSans-Heavy.otf",
    "PPObjectSans-HeavySlanted":  DS_BASE / "fonts" / "PPObjectSans-HeavySlanted.otf",
    "PPObjectSans-Regular":       DS_BASE / "fonts" / "PPObjectSans-Regular.otf",
    "PPObjectSans-Slanted":       DS_BASE / "fonts" / "PPObjectSans-Slanted.otf",
}

INPUT_HTML  = HERE / "simulador_sustrato_v4.0.html"
OUTPUT_HTML = HERE / "simulador_sustrato_v4_OFFLINE.html"

# ── Helpers ─────────────────────────────────────────────────────────────
def fetch(name, url):
    print(f"  ↓ {name}…", end=" ", flush=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        print(f"{len(data):,} bytes ✓")
        return data
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

def read(path):
    p = Path(path)
    if not p.exists():
        print(f"  ✗ No encontrado: {p}")
        sys.exit(1)
    return p.read_text(encoding="utf-8")

def read_b64(path):
    return base64.b64encode(Path(path).read_bytes()).decode()

# ── 1. Descargar CDN ────────────────────────────────────────────────────
print("\n[1/4] Descargando dependencias CDN…")
cdn_js   = {k: fetch(k, v).decode("utf-8") for k, v in CDN.items() if not k.startswith("jb-")}
jb_fonts = {k: fetch(k, v) for k, v in CDN.items() if k.startswith("jb-")}

# ── 2. Leer archivos locales ────────────────────────────────────────────
print("\n[2/4] Leyendo archivos locales…")
colors_css  = read(LOCAL_FILES["colors_css"])
sim_css     = read(LOCAL_FILES["sim_css"])
recommender = read(LOCAL_FILES["recommender"])

# Fuentes locales → base64
font_faces = []
mime_map = {".otf": "font/otf", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf"}
for family, path in FONT_FILES.items():
    if Path(path).exists():
        b64 = read_b64(path)
        mime = mime_map.get(Path(path).suffix, "font/otf")
        data_uri = f"data:{mime};base64,{b64}"
        print(f"  ✓ {family}")
        font_faces.append((family, data_uri, Path(path).suffix))
    else:
        print(f"  ✗ No encontrado: {path}")

# Mapeo de nombres de familia reales (los que usa colors_and_type.css)
# Reemplazar URLs de fuentes en el CSS del design system por data URIs
def inline_fonts_in_css(css):
    for family, data_uri, ext in font_faces:
        fname = Path(family + ext).name  # e.g. "GayaPatched-Regular.otf"
        # Reemplazar la ruta relativa por data URI
        css = css.replace(f"fonts/{fname}", data_uri)
        css = css.replace(f"./fonts/{fname}", data_uri)
    return css

colors_css_inlined = inline_fonts_in_css(colors_css)

# ── 3. Construir CSS de fuentes JetBrains Mono ─────────────────────────
jb_css = ""
for weight, key in [(400,"jb-400"), (500,"jb-500"), (700,"jb-700")]:
    b64 = base64.b64encode(jb_fonts[key]).decode()
    jb_css += f"""@font-face {{
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: {weight};
  font-display: swap;
  src: url(data:font/woff2;base64,{b64}) format('woff2');
}}\n"""

# ── 4. Manipular el HTML fuente ─────────────────────────────────────────
print("\n[3/4] Ensamblando HTML…")
html = read(INPUT_HTML)

# Eliminar todos los <link> externos y <script src> externos que vamos a inlinar
def remove_tag(text, pattern):
    return re.sub(pattern, "", text, flags=re.DOTALL)

# Quitar Google Fonts links
html = re.sub(r'<link[^>]+fonts\.googleapis[^>]*>', '', html)
html = re.sub(r'<link[^>]+fonts\.gstatic[^>]*>', '', html)
# Quitar link del design system CSS
html = re.sub(r'<link[^>]+colors_and_type\.css[^>]*>', '', html)
# Quitar link de recipe-sim-v2.css
html = re.sub(r'<link[^>]+recipe-sim-v2\.css[^>]*>', '', html)
# Quitar scripts CDN externos
html = re.sub(r'<script[^>]+unpkg\.com[^>]*></script>', '', html)
html = re.sub(r'<script[^>]+cdnjs\.cloudflare[^>]*></script>', '', html)
# Quitar script src local recipe-recommender.js
html = re.sub(r'<script[^>]+recipe-recommender\.js[^>]*></script>', '', html)

# Insertar todo justo antes de </head>
inline_block = f"""
<!-- ═══ OFFLINE BUNDLE — generado por build_offline.py ═══ -->
<style>
/* JetBrains Mono — inlinado */
{jb_css}
</style>
<style>
/* Design System: colors_and_type.css — inlinado */
{colors_css_inlined}
</style>
<style>
/* recipe-sim-v2.css — inlinado */
{sim_css}
</style>
<script>
/* recipe-recommender.js — inlinado */
{recommender}
</script>
<script>
/* React {cdn_js['react'][:40].split('*')[0].strip()[:60]} */
{cdn_js['react']}
</script>
<script>
/* ReactDOM */
{cdn_js['react-dom']}
</script>
<script>
/* Babel standalone */
{cdn_js['babel']}
</script>
<script>
/* html2pdf */
{cdn_js['html2pdf']}
</script>
<!-- ═══════════════════════════════════════════════════════ -->
"""

html = html.replace("</head>", inline_block + "</head>", 1)

# ── 5. Escribir resultado ────────────────────────────────────────────────
print(f"\n[4/4] Escribiendo {OUTPUT_HTML.name}…")
OUTPUT_HTML.write_text(html, encoding="utf-8")
size_mb = OUTPUT_HTML.stat().st_size / 1024 / 1024
print(f"\n✅  {OUTPUT_HTML.name}")
print(f"   Tamaño: {size_mb:.1f} MB")
print(f"   Ruta:   {OUTPUT_HTML}")
print("\nPara usar online: sube este único archivo a cualquier hosting")
print("(Netlify Drop, GitHub Pages, servidor propio, etc.)\n")
