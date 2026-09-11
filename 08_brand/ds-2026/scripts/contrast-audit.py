#!/usr/bin/env python3
"""WCAG 2.1 contrast gate for the Setas de la Peña DS-2026 palette.

Every pair the system actually uses is asserted here, with an expectation:
  ALLOW  — this pairing is sanctioned; it MUST meet its ratio.
  FORBID — this pairing is banned by the system; it MUST fail its ratio.
           (If one ever starts passing, the palette moved and the ban is stale.)

Exit 0 only when every expectation holds.
Run:  python3 scripts/contrast-audit.py [--md]
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOKEN_NAMES = ('PAPER', 'INK', 'INK_MUTED', 'RULE', 'SOIL', 'MOSS', 'RUST',
               'WARNING', 'WARNING_TEXT', 'PAPER_PANEL', 'PAPER_RECESSED',
               'MOSS_TINT', 'RUST_TINT', 'WARNING_TINT', 'SOIL_TINT', 'ACCENT_WARM')

def load_palette():
    css = (ROOT / 'tokens' / 'tokens.css').read_text()
    values = dict(re.findall(r'(--[a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;', css))
    palette = {name: values.get('--' + name.lower().replace('_', '-')) for name in TOKEN_NAMES}
    # Accent warm is intentionally OKLCH in the source; the rendered hex is the
    # documented fallback used for contrast checks.
    palette['ACCENT_WARM'] = '#BE512D'
    missing = [name for name, value in palette.items() if value is None]
    if missing:
        raise RuntimeError('missing canonical token(s): ' + ', '.join(missing))
    return palette

P = load_palette()

def lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def lum(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def ratio(a, b):
    la, lb = lum(P[a]), lum(P[b])
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

A, F = "ALLOW", "FORBID"
# (fg, bg, purpose, required-ratio, expectation)
PAIRS = [
    ("INK",          "PAPER",          "Body, headings, species names",          4.5, A),
    ("INK",          "PAPER_PANEL",    "Text on panels",                         4.5, A),
    ("INK",          "PAPER_RECESSED", "Text in recessed wells",                 4.5, A),
    ("INK_MUTED",    "PAPER",          "Captions, metadata values",              4.5, A),
    ("INK_MUTED",    "PAPER_PANEL",    "Metadata on panels",                     4.5, A),
    ("MOSS",         "PAPER",          "OK status text",                         4.5, A),
    ("MOSS",         "MOSS_TINT",      "OK text on OK banner",                   4.5, A),
    ("RUST",         "PAPER",          "Error status text",                      4.5, A),
    ("RUST",         "RUST_TINT",      "Error text on error banner",             4.5, A),
    ("SOIL",         "PAPER",          "Infill label text",                      4.5, A),
    ("PAPER",        "SOIL",           "Inverse text on soil block (signage)",   4.5, A),
    ("PAPER",        "MOSS",           "Text on solid moss fill",                4.5, A),
    ("PAPER",        "RUST",           "Text on solid rust fill",                4.5, A),
    ("INK",          "WARNING",        "Text on solid ochre fill",               4.5, A),
    ("WARNING_TEXT", "PAPER",          "Caution text (sanctioned ochre)",        4.5, A),
    ("WARNING_TEXT", "WARNING_TINT",   "Caution label on caution banner",        4.5, A),
    ("INK",          "WARNING_TINT",   "Caution banner text (sanctioned)",       4.5, A),
    ("RULE",         "PAPER",          "Hairlines, specimen frames (non-text)",  3.0, A),
    ("MOSS",         "PAPER",          "Meter fill (non-text)",                  3.0, A),
    ("ACCENT_WARM",  "PAPER",          "Archive accent — fill/underline/hairline (non-text)", 3.0, A),
    # --- Banned pairings. The system forbids these; the gate proves why. ---
    ("WARNING",      "PAPER",          "Ochre as TEXT — use WARNING_TEXT",       4.5, F),
    ("WARNING",      "WARNING_TINT",   "Ochre text on its own tint — use INK",   4.5, F),
    ("PAPER",        "WARNING",        "Paper on ochre fill — use INK",          4.5, F),
    ("WARNING",      "PAPER",          "Ochre hairline/meter alone — needs INK", 3.0, F),
    ("ACCENT_WARM",  "PAPER",          "Archive accent as TEXT — never; fails AA", 4.5, F),
]

rows = []
for fg, bg, why, req, exp in PAIRS:
    r = ratio(fg, bg)
    meets = r >= req
    ok = meets if exp == A else not meets
    rows.append((fg, bg, why, req, r, exp, meets, ok))

if "--md" in sys.argv:
    print("| Foreground | Background | Purpose | Needs | Ratio | Rule |")
    print("|---|---|---|---|---|---|")
    for fg, bg, why, req, r, exp, meets, ok in rows:
        verdict = "Sanctioned" if exp == A else "**Banned**"
        print(f"| `{fg}` | `{bg}` | {why} | {req}:1 | {r:.2f}:1 | {verdict} |")
else:
    for fg, bg, why, req, r, exp, meets, ok in rows:
        tag = "ok  " if ok else "BAD "
        kind = "allow " if exp == A else "forbid"
        print(f"{tag} [{kind}] {r:5.2f}:1 (need {req})  {fg} on {bg} — {why}")

bad = [x for x in rows if not x[7]]
# Assert the actual warning component uses the audited pair. This prevents a
# passing palette audit while a component regresses to raw ochre text.
component_css = (ROOT / 'components' / 'components.css').read_text()
component_contract = (
    re.search(r'\.sdp-alert--warn\s*\{[^}]*border-left-color:\s*var\(--status-warn\)[^}]*background:\s*var\(--status-warn-bg\)', component_css)
    and re.search(r'\.sdp-alert--warn\s+\.sdp-alert__label[^}]*\.sdp-alert--warn\s+\.sdp-alert__icon\s*\{\s*color:\s*var\(--status-warn-text\)', component_css)
)
if not component_contract:
    bad.append(('COMPONENT', 'WARNING', 'warning alert must use warning text on warning tint', 4.5, 0, 'ALLOW', False, False))
print(f"\n{len(rows)-len(bad)}/{len(rows)} expectations hold"
      f"{'' if not bad else '  — ' + str(len(bad)) + ' VIOLATED'}")
sys.exit(1 if bad else 0)
