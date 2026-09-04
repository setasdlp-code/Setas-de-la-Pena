#!/usr/bin/env python3
"""Generate a botanical line plate of Hericium erinaceus (melena de león).

The repo ships a photographic engraving for Ganoderma lucidum but nothing for
Hericium, and the system forbids shipping a component with placeholder imagery.

Drawn in the engraving idiom: every form is a closed path filled with PAPER and
stroked in INK, painted back-to-front, so nearer spines occlude farther ones.
That occlusion is what separates a specimen plate from a scribble — without it
overlapping outlines read as noise.

Deterministic: seeded, so regenerating gives byte-identical output.
Run: python3 scripts/gen-hericium.py
"""
import math, random, pathlib

random.seed(1886)

W, H   = 400, 520
PAPER  = "#FAF5E9"
INK    = "#222222"
CX     = 202          # centre of the fruiting body
TOP    = 92           # crown of the dome
SHOULDER = 246        # where the spine mass begins
RX     = 128

def dome():
    """Upper body: irregular crown, shallow shoulder. Closed, paper-filled."""
    pts = []
    n = 26
    for i in range(n + 1):
        u = i / n                              # 0 = left, 1 = right
        a = math.pi * (1 - u)                  # sweep the top half
        r = RX * (1 + random.uniform(-0.045, 0.045))
        x = CX + math.cos(a) * r
        y = SHOULDER - math.sin(a) * (SHOULDER - TOP) * (1 + random.uniform(-0.05, 0.05))
        pts.append((x, y))
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(len(pts) - 1):
        p0, p1 = pts[i], pts[i + 1]
        mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
        d += f" Q{p0[0]:.1f} {p0[1]:.1f} {mx:.1f} {my:.1f}"
    d += f" L{pts[-1][0]:.1f} {pts[-1][1]:.1f}"
    # shoulder: a shallow sag back to the left
    d += f" Q{CX:.1f} {SHOULDER + 30:.1f} {pts[0][0]:.1f} {pts[0][1]:.1f} Z"
    return d

def spine(x, y0, length, w, lean):
    """One pendent tooth: tapered, slightly curved.

    Deliberately NOT closed with Z. The path is filled (SVG closes it
    implicitly) but the base edge is never stroked — a stroked base would
    draw a little rectangle where each tooth meets the mass, which is the
    tell-tale of a comb rather than a specimen.
    """
    tx = x + lean
    return (f'M{x - w/2:.1f} {y0:.1f} '
            f'C{x - w*0.62:.1f} {y0 + length*0.52:.1f} {tx - w*0.10:.1f} {y0 + length*0.86:.1f} {tx:.1f} {y0 + length:.1f} '
            f'C{tx + w*0.10:.1f} {y0 + length*0.86:.1f} {x + w*0.62:.1f} {y0 + length*0.52:.1f} {x + w/2:.1f} {y0:.1f}')

ROWS = [   # (depth t, count, y-offset from shoulder, length scale, stroke)
    (1.00, 13, -46, 0.46, 0.7),
    (0.75, 15, -32, 0.62, 0.9),
    (0.50, 17, -20, 0.78, 1.05),
    (0.25, 19,  -9, 0.92, 1.2),
    (0.00, 21,   2, 1.00, 1.4),
]

layers = []
for t, count, dy, lscale, sw in ROWS:
    paths = []
    for i in range(count):
        u = (i + 0.5) / count
        edge = abs(u - 0.5) * 2                      # 0 centre → 1 flank
        spread = RX * (0.90 - 0.16 * t)
        x = CX + (u - 0.5) * 2 * spread + random.uniform(-7, 7)
        # The base follows the cushion's underside: deepest at the centre,
        # riding up around the flanks. Jittered so no two teeth share a line.
        y0 = SHOULDER + dy + (1 - edge ** 2) * 20 - edge * 34 + random.uniform(-9, 9)
        length = (176 - 104 * edge ** 1.5) * lscale * random.uniform(0.82, 1.16)
        w = (15 - 6.0 * edge) * (1 - 0.20 * t) * random.uniform(0.88, 1.12)
        lean = (u - 0.5) * 34 * random.uniform(0.6, 1.35)
        if length > 24:
            paths.append(spine(x, y0, length, w, lean))
    layers.append((sw, paths))

body_svg = ""
for sw, paths in layers:                              # back row first
    body_svg += f'\n    <g stroke-width="{sw}">\n      ' + "\n      ".join(
        f'<path d="{p}"/>' for p in paths) + "\n    </g>"

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"
     role="img" aria-label="Hericium erinaceus — botanical plate">
  <title>Hericium erinaceus</title>
  <desc>Ink line plate. Cushion-shaped fruiting body with pendent spines, attached to substrate at upper left.</desc>
  <g fill="{PAPER}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
    <!-- woody attachment -->
    <path d="M116 160 C100 149 82 141 58 137 L49 141 L47 156 L54 160 C68 170 90 176 112 172 Z"/>
    <g fill="none" stroke-width="0.8">
      <path d="M58 140 C74 146 90 154 104 163"/>
      <path d="M55 148 C70 155 84 162 96 169"/>
      <path d="M62 134 C76 139 90 146 102 154"/>
    </g>
    <!-- fruiting body -->
    <path d="{dome()}"/>
    <!-- pendent spines, back to front -->{body_svg}
  </g>
</svg>
'''
out = pathlib.Path(__file__).resolve().parent.parent / "assets/img/hericium-erinaceus-plate.svg"
out.write_text(svg)
n = sum(len(p) for _, p in layers)
print(f"wrote assets/img/hericium-erinaceus-plate.svg  ({n} spines in {len(ROWS)} depth rows, {len(svg)} bytes)")
