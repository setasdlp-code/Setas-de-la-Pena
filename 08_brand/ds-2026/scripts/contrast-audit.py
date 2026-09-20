#!/usr/bin/env python3
"""WCAG contrast contract for DS-2026 · Criterio Edition.

Palette values come from tokens/primitives.json. No color is duplicated here.
ALLOW pairs must meet their threshold; FORBID pairs must remain below it so
the documented ban cannot silently become stale after a palette change.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOKENS = json.loads((ROOT / "tokens" / "primitives.json").read_text())
PRIM = TOKENS["color"]["primitive"]
DER = TOKENS["color"]["derived"]

P = {
    "PAPER": PRIM["paper-100"]["value"],
    "PAPER_PANEL": PRIM["paper-50"]["value"],
    "PAPER_RECESSED": PRIM["paper-200"]["value"],
    "INK": PRIM["ink-900"]["value"],
    "INK_700": PRIM["ink-700"]["value"],
    "INK_MUTED": PRIM["ink-500"]["value"],
    "RULE": PRIM["rule-500"]["value"],
    "SOIL": PRIM["bark-700"]["value"],
    "MOSS": PRIM["moss-700"]["value"],
    "SLATE": PRIM["slate-500"]["value"],
    "CORAL_500": PRIM["coral-500"]["value"],
    "CORAL_700": PRIM["coral-700"]["value"],
    "WARNING": PRIM["warning"]["value"],
    "WARNING_TEXT": PRIM["warning-text"]["value"],
    "MOSS_TINT": DER["moss-tint"]["value"],
    "CORAL_TINT": DER["coral-tint"]["value"],
    "WARNING_TINT": DER["warning-tint"]["value"],
    "SOIL_TINT": DER["bark-tint"]["value"],
}

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

ALLOW, FORBID = "ALLOW", "FORBID"
# fg, bg, purpose, required ratio, expectation
PAIRS = [
    ("INK", "PAPER", "Primary body and headings", 4.5, ALLOW),
    ("INK", "PAPER_PANEL", "Text on panels", 4.5, ALLOW),
    ("INK", "PAPER_RECESSED", "Text in recessed wells", 4.5, ALLOW),
    ("INK_700", "PAPER", "Strong secondary text", 4.5, ALLOW),
    ("INK_MUTED", "PAPER", "Metadata and captions", 4.5, ALLOW),
    ("INK_MUTED", "PAPER_PANEL", "Metadata on panels", 4.5, ALLOW),
    ("MOSS", "PAPER", "OK / active status text", 4.5, ALLOW),
    ("MOSS", "MOSS_TINT", "OK text on OK tint", 4.5, ALLOW),
    ("SLATE", "PAPER", "Information text", 4.5, ALLOW),
    ("CORAL_700", "PAPER", "Terracotta text and error state", 4.5, ALLOW),
    ("CORAL_700", "CORAL_TINT", "Error text on error tint", 4.5, ALLOW),
    ("PAPER_PANEL", "CORAL_700", "Small text on accessible terracotta action fill", 4.5, ALLOW),
    ("SOIL", "PAPER", "Earth/infill text", 4.5, ALLOW),
    ("PAPER_PANEL", "SOIL", "Inverse text on bark surface", 4.5, ALLOW),
    ("PAPER_PANEL", "MOSS", "Text on primary moss action fill", 4.5, ALLOW),
    ("INK", "WARNING", "Dark text on solid caution fill", 4.5, ALLOW),
    ("WARNING_TEXT", "PAPER", "Caution text / thin caution marker", 4.5, ALLOW),
    ("WARNING_TEXT", "WARNING_TINT", "Caution text on caution tint", 4.5, ALLOW),
    ("INK", "WARNING_TINT", "Body text on caution tint", 4.5, ALLOW),
    ("RULE", "PAPER", "Legacy specimen rule (non-text)", 3.0, ALLOW),
    ("MOSS", "PAPER", "OK graphical marker", 3.0, ALLOW),
    ("CORAL_500", "PAPER", "Decorative terracotta rule/fill", 3.0, ALLOW),

    # Explicitly banned uses.
    ("WARNING", "PAPER", "Ochre as small text", 4.5, FORBID),
    ("WARNING", "PAPER", "Ochre as standalone thin marker", 3.0, FORBID),
    ("PAPER", "WARNING", "Light text on ochre fill", 4.5, FORBID),
    ("CORAL_500", "PAPER", "Coral 500 as small text", 4.5, FORBID),
    ("PAPER_PANEL", "CORAL_500", "Light small text on Coral 500 button", 4.5, FORBID),
    ("INK", "CORAL_500", "Dark small text on Coral 500 button", 4.5, FORBID),
]

rows = []
for fg, bg, purpose, need, rule in PAIRS:
    r = ratio(fg, bg)
    meets = r >= need
    ok = meets if rule == ALLOW else not meets
    rows.append((fg, bg, purpose, need, r, rule, ok))

if "--md" in sys.argv:
    print("| Foreground | Background | Purpose | Needs | Ratio | Contract |")
    print("|---|---|---|---:|---:|---|")
    for fg, bg, purpose, need, r, rule, ok in rows:
        print(f"| `{fg}` | `{bg}` | {purpose} | {need}:1 | {r:.2f}:1 | {'Sanctioned' if rule == ALLOW else '**Banned**'} |")
else:
    for fg, bg, purpose, need, r, rule, ok in rows:
        print(f"{'ok  ' if ok else 'BAD '} [{rule.lower():6}] {r:5.2f}:1 (need {need})  {fg} on {bg} — {purpose}")

bad = [row for row in rows if not row[-1]]
print(f"\n{len(rows)-len(bad)}/{len(rows)} contrast expectations hold" + ("" if not bad else f" — {len(bad)} VIOLATED"))
sys.exit(1 if bad else 0)
