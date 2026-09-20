#!/usr/bin/env python3
"""Structural integrity gate for DS-2026 · Criterio Edition.

Validates canonical contracts without mutating generated artifacts.
Run: python3 scripts/validate.py
"""
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
fails = []
DECL = re.compile(r'(?<!var\()(--[\w-]+)\s*:')

def read_json(path):
    try:
        return json.loads(path.read_text())
    except Exception as exc:
        fails.append(f"{path.name} does not parse: {exc}")
        return {}

# 1 · CSS variable references
defined = set()
css_sources = list((ROOT / "tokens").glob("*.css")) + list((ROOT / "components").rglob("*.css"))
for p in css_sources:
    defined |= set(DECL.findall(p.read_text()))
used = {}
scan_files = list((ROOT / "components").rglob("*.css")) + list((ROOT / "mockups").rglob("*.html"))
for entry in ("index.css", "operations.css", "market.css"):
    p = ROOT / entry
    if p.exists():
        scan_files.append(p)
for p in scan_files:
    for v in re.findall(r'var\((--[\w-]+)', p.read_text()):
        used.setdefault(v, set()).add(str(p.relative_to(ROOT)))
missing = {k: v for k, v in used.items() if k not in defined}
print(f"1 · token refs          {len(used):>3} used · {len(defined):>3} defined · {len(missing)} undefined")
for k, refs in sorted(missing.items()):
    fails.append(f"undefined token {k} used in {', '.join(sorted(refs))}")

# 2 · font faces resolve locally
fonts_css = ROOT / "tokens" / "fonts.css"
faces = re.findall(r"url\(['\"]?([^'\")]+)", fonts_css.read_text())
bad_fonts = [u for u in faces if not (fonts_css.parent / u).resolve().exists()]
print(f"2 · font files          {len(faces):>3} referenced · {len(bad_fonts)} missing")
fails += [f"missing font file {u}" for u in bad_fonts]

# 3 · mockup local assets resolve
asset_refs = 0
missing_assets = []
for p in (ROOT / "mockups").rglob("*.html"):
    for src in re.findall(r'(?:src|href)="([^"]+)"', p.read_text()):
        if src.startswith(("http", "#", "data:")):
            continue
        asset_refs += 1
        if not (p.parent / src).resolve().exists():
            missing_assets.append(f"{src} referenced by {p.relative_to(ROOT)}")
print(f"3 · mockup assets       {asset_refs:>3} referenced · {len(missing_assets)} missing")
fails += [f"missing asset {x}" for x in missing_assets]

# 4 · token JSON parses
token_json_paths = sorted((ROOT / "tokens").glob("*.json"))
json_docs = {p.name: read_json(p) for p in token_json_paths}
print(f"4 · token JSON          {len(token_json_paths):>3} files")

# 5 · semantic references resolve to canonical primitive/derived colors
primitives = json_docs.get("primitives.json", {})
semantic = json_docs.get("semantic.json", {})
known_color_refs = {
    f"color.primitive.{k}" for k in primitives.get("color", {}).get("primitive", {})
} | {
    f"color.derived.{k}" for k in primitives.get("color", {}).get("derived", {})
}
bad_refs = []
for group, items in semantic.get("semantic", {}).items():
    for name, spec in items.items():
        value = str(spec.get("value", ""))
        m = re.fullmatch(r"\{([^}]+)\}", value)
        if not m or m.group(1) not in known_color_refs:
            bad_refs.append(f"{group}.{name} -> {value}")
print(f"5 · semantic refs       {len(bad_refs)} invalid")
fails += [f"invalid semantic reference {x}" for x in bad_refs]

# 6 · generated artifacts exactly match compiler output (check mode does not write)
proc = subprocess.run(
    ["node", "scripts/build-tokens.mjs", "--check"],
    cwd=ROOT, capture_output=True, text=True
)
print(f"6 · generated tokens    {'clean' if proc.returncode == 0 else 'DRIFT'}")
if proc.returncode != 0:
    fails.append("generated token artifacts drifted from JSON sources: " + (proc.stderr.strip() or proc.stdout.strip()))

# 7 · distribution manifest is complete and internally valid
manifest_path = ROOT / "distribution-manifest.json"
manifest = read_json(manifest_path)
declared = ["distribution-manifest.json", *manifest.get("files", []), *manifest.get("tokens", []), *manifest.get("components", [])]
dupes = sorted({x for x in declared if declared.count(x) > 1})
missing_declared = [x for x in declared if not (ROOT / x).exists()]
bad_trees = [x for x in manifest.get("assetTrees", []) if not (ROOT / x).is_dir()]
print(f"7 · distribution        {len(declared):>3} files · {len(manifest.get('assetTrees', []))} trees · {len(dupes)+len(missing_declared)+len(bad_trees)} problem(s)")
fails += [f"distribution duplicate {x}" for x in dupes]
fails += [f"distribution source missing {x}" for x in missing_declared]
fails += [f"distribution asset tree missing {x}" for x in bad_trees]

# 8 · domain contract remains presentation-agnostic
domain = json_docs.get("domain.json", {})
domain_raw = json.dumps(domain, ensure_ascii=False)
presentation_leaks = []
for needle in ("var(--", "px solid", "border:", "background:", "font-size:"):
    if needle in domain_raw:
        presentation_leaks.append(needle)
print(f"8 · domain purity       {len(presentation_leaks)} presentation leak(s)")
fails += [f"domain.json contains presentation syntax {x}" for x in presentation_leaks]

# 9 · typography invariants
typography = json_docs.get("typography.json", {})
scale = typography.get("scale", {})
def px(role):
    raw = str(scale.get(role, {}).get("size", "0"))
    m = re.fullmatch(r"([0-9.]+)px", raw)
    return float(m.group(1)) if m else None
type_errors = []
if (px("micro-screen") or 0) < 11: type_errors.append("micro-screen must be >= 11px")
if (px("label") or 0) < 11: type_errors.append("label must be >= 11px")
if (px("data") or 0) < 13: type_errors.append("data must be >= 13px")
if (px("body") or 0) < 16: type_errors.append("body must be >= 16px")
if "lot-code-print" not in scale: type_errors.append("lot-code-print role is required")
if scale.get("micro-print", {}).get("use", "").lower().find("lot code") >= 0:
    type_errors.append("micro-print must not be used for lot codes")
print(f"9 · typography          {len(type_errors)} invariant violation(s)")
fails += type_errors

# 10 · public entrypoints exist and import canonical token layer
entry_errors = []
for name in ("index.css", "operations.css", "market.css"):
    p = ROOT / name
    if not p.exists():
        entry_errors.append(f"missing {name}")
    elif 'tokens/tokens.css' not in p.read_text():
        entry_errors.append(f"{name} must import tokens/tokens.css")
print(f"10 · public entrypoints {len(entry_errors)} problem(s)")
fails += entry_errors

print()
if fails:
    print(f"FAILED — {len(fails)} problem(s):")
    for problem in fails:
        print("  !", problem)
    sys.exit(1)
print("all structural checks pass")
