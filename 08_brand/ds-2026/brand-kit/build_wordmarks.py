"""Build review wordmarks from the existing DS fonts; no font binaries are copied."""
import hashlib
import json
from pathlib import Path
from xml.sax.saxutils import escape

from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent
DS = ROOT.parent
OUTPUT = ROOT / "assets"
OUTPUT.mkdir(exist_ok=True)
PRIMITIVES = json.loads((DS / "tokens/primitives.json").read_text())["color"]["primitive"]


def outline(text, filename, size, x, baseline):
    font = TTFont(DS / "assets/fonts" / filename)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    svg = SVGPathPen(glyphs)
    bounds = BoundsPen(glyphs)
    for letter in text:
        name = cmap[ord(letter)]
        matrix = (scale, 0, 0, -scale, x, baseline)
        glyphs[name].draw(TransformPen(svg, matrix))
        glyphs[name].draw(TransformPen(bounds, matrix))
        x += font["hmtx"][name][0] * scale
    font.close()
    return svg.getCommands(), bounds.bounds, x


layouts = {
    "horizontal": [("Setas", "GayaPatched-Bold.otf", 100, 0, 100),
                   ("de la Peña", "GayaPatched-Medium.otf", 100, None, 100)],
    "stacked": [("Setas", "GayaPatched-Bold.otf", 160, 0, 145),
                ("de la Peña", "GayaPatched-Medium.otf", 96, 0, 250)],
}
manifest = {"purpose": "Firmas para revisión interna. Confirmar licencia comercial de Gaya antes de distribución externa.",
            "name": "Setas de la Peña", "fonts": {}, "files": []}
for filename in ("GayaPatched-Bold.otf", "GayaPatched-Medium.otf"):
    manifest["fonts"][filename] = hashlib.sha256((DS / "assets/fonts" / filename).read_bytes()).hexdigest()

for layout, lines in layouts.items():
    paths, boxes, cursor = [], [], 0
    for text, filename, size, x, baseline in lines:
        path, box, cursor = outline(text, filename, size, cursor + 18 if x is None else x, baseline)
        paths.append(path)
        boxes.append(box)
    pad = 16
    left = min(b[0] for b in boxes) - pad
    top = min(b[1] for b in boxes) - pad
    width = max(b[2] for b in boxes) - left + pad
    height = max(b[3] for b in boxes) - top + pad
    for pigment, token in (("moss", "moss-700"), ("ink", "ink-900"), ("paper", "paper-50")):
        name = f"wordmark-{layout}-{pigment}.svg"
        fill = PRIMITIVES[token]["value"]
        body = "\n".join(f'  <path d="{escape(p)}"/>' for p in paths)
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{left:.3f} {top:.3f} {width:.3f} {height:.3f}" role="img" aria-labelledby="title desc">
  <title id="title">Setas de la Peña</title>
  <desc id="desc">Firma {layout}, Gaya Bold y Medium, color {pigment}. Revisión interna.</desc>
  <metadata>Generado desde las fuentes existentes del DS. Licencia comercial pendiente de verificación.</metadata>
  <g fill="{fill}">
{body}
  </g>
</svg>
'''
        (OUTPUT / name).write_text(svg)
        manifest["files"].append({"file": name, "token": token, "color": fill,
                                  "sha256": hashlib.sha256(svg.encode()).hexdigest()})
(OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
print(f"Generated {len(manifest['files'])} SVG wordmarks.")
