#!/usr/bin/env python3
"""Reports divergence between knowledge_base/ values and the values Setas OS actually uses.

REPORTS ONLY. This script never edits knowledge_base/ or app data files — see
knowledge_base/AGENTS.md, which requires explicit human authorization for any
canonical edit. Its job is to surface candidate divergences for a human to
triage, not to resolve them.

Three finding categories (per sync point):
  - value_mismatch              : both sides define the parameter, values disagree
  - present_in_kb_absent_in_app : knowledge_base documents it, the app has no value
  - present_in_app_absent_from_kb: the app hard-codes it, knowledge_base has no source

Each value_mismatch is further tagged "real" or "representation". A
"representation" tag means the numbers most likely encode the same underlying
fact in a different shape (a single point drawn from a documented range, a
range built from several documented sub-rows) rather than a genuine
disagreement — still reported, but lower severity for triage.

This checker is NOT wired into scripts/quality/run.sh or
.github/workflows/quality.yml yet. A first run against real data surfaces
expected noise (e.g. extraction-factors.json has no knowledge_base source at
all) that needs human triage before this can gate anything.
"""

from __future__ import annotations

import ast
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parents[2]
KB = ROOT / "knowledge_base"
SETAS_OS = ROOT / "field-os-simulador/setas-os"
SHELL_HTML = SETAS_OS / "Setas OS v5.dc.html"
EXTRACTION_FACTORS = SETAS_OS / "extraction-factors.json"

# ---------------------------------------------------------------------------
# Number / range parsing
# ---------------------------------------------------------------------------

# Order matters: thousands-comma group (1,000) before decimal-comma (11,5)
# before plain decimal/integer. Spanish source text mixes both comma usages.
NUM = r"\d{1,3}(?:,\d{3})+|\d+,\d{1,2}(?!\d)|\d+(?:\.\d+)?"
RANGE_RE = re.compile(rf"({NUM})\s*[–—-]\s*({NUM})")
BOUND_RE = re.compile(rf"([<>≥≤~])\s*({NUM})")
SINGLE_RE = re.compile(NUM)


def parse_number(token: str) -> float:
    if re.fullmatch(r"\d{1,3}(?:,\d{3})+", token):
        token = token.replace(",", "")
    elif "," in token:
        token = token.replace(",", ".")
    return float(token)


@dataclass
class Candidate:
    lo: float
    hi: float
    kind: str  # "range" | "bound_lt" | "bound_gt" | "approx" | "single"
    raw: str


def extract_candidates(text: str) -> list[Candidate]:
    """Extract every plausible numeric range/bound reading from a text cell.

    KB prose often states a headline figure alongside a parenthetical
    alternate ("27–32°C óptimo (rango 20–34°C)"); both are kept as
    candidates so a value_mismatch is only raised when NONE of the
    documented readings match what the app uses.
    """
    candidates: list[Candidate] = []
    consumed = [False] * len(text)

    def mark(m: re.Match) -> None:
        for i in range(m.start(), m.end()):
            consumed[i] = True

    for m in RANGE_RE.finditer(text):
        lo, hi = parse_number(m.group(1)), parse_number(m.group(2))
        candidates.append(Candidate(min(lo, hi), max(lo, hi), "range", m.group(0)))
        mark(m)

    for m in BOUND_RE.finditer(text):
        if any(consumed[m.start() : m.end()]):
            continue
        val = parse_number(m.group(2))
        sym = m.group(1)
        kind = "bound_lt" if sym in "<≤" else "bound_gt" if sym in ">≥" else "approx"
        candidates.append(Candidate(val, val, kind, m.group(0)))
        mark(m)

    for m in SINGLE_RE.finditer(text):
        if any(consumed[m.start() : m.end()]):
            continue
        val = parse_number(m.group(0))
        candidates.append(Candidate(val, val, "single", m.group(0)))
        mark(m)

    return candidates


# ---------------------------------------------------------------------------
# knowledge_base markdown extraction
# ---------------------------------------------------------------------------

HEADING_RE = re.compile(r"^#{1,6}\s+(.*)$", re.MULTILINE)
ROW_RE = re.compile(r"^\|\s*([^|\n]+?)\s*\|\s*([^|\n]+?)\s*\|\s*$", re.MULTILINE)


def section_blocks(text: str, title_pattern: str) -> str:
    """Concatenate the body of every heading whose title matches title_pattern."""
    heads = list(HEADING_RE.finditer(text))
    blocks = []
    for i, m in enumerate(heads):
        if re.search(title_pattern, m.group(1), re.IGNORECASE):
            start = m.end()
            end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
            blocks.append(text[start:end])
    return "\n".join(blocks)


def row_values(block: str, label_pattern: str) -> list[str]:
    """Return the value cells of every table row whose label matches label_pattern.

    Falls back to prose/bullet lines containing label_pattern when the
    section has no markdown table (e.g. narrative "Research Consensus"
    paragraphs, or a plain bullet list of best practices).
    """
    values = []
    for m in ROW_RE.finditer(block):
        label = m.group(1).strip()
        if re.fullmatch(r"-+", label):
            continue
        if re.search(label_pattern, label, re.IGNORECASE):
            values.append(m.group(2))
    if values:
        return values
    for line in block.splitlines():
        stripped = line.strip().lstrip("-*").strip()
        if not stripped or stripped.startswith("|"):
            continue
        if re.search(label_pattern, stripped, re.IGNORECASE):
            values.append(stripped)
    return values


def kb_candidates_for(
    kb_file: Path, section_pattern: str, row_pattern: str
) -> tuple[list[Candidate], Candidate | None]:
    """Return (per-row candidates, combined multi-row candidate or None).

    The combined candidate handles cases like Ganoderma's HR, which is
    documented as three separate stage rows (inducción / formación /
    estadio final) but used by the app as a single aggregate range.
    """
    text = kb_file.read_text(encoding="utf-8")
    block = section_blocks(text, section_pattern)
    values = row_values(block, row_pattern)
    all_candidates: list[Candidate] = []
    for value_text in values:
        all_candidates.extend(extract_candidates(value_text))
    combined = None
    if len(values) > 1 and all_candidates:
        combined = Candidate(
            min(c.lo for c in all_candidates),
            max(c.hi for c in all_candidates),
            "combined",
            " ; ".join(values),
        )
    return all_candidates, combined


# ---------------------------------------------------------------------------
# App-side JS object-literal extraction (Setas OS v5.dc.html)
# ---------------------------------------------------------------------------


def extract_js_object(text: str, const_name: str) -> object:
    """Pull `const NAME = { ... };` or `const NAME = [ ... ];` out of the HTML
    shell and parse it as a Python literal.

    The object literals here (KB_SPP, KB_SUB, KPI, SPECIES) use bare
    identifier keys and JS true/false — close enough to a Python literal
    that quoting keys and swapping booleans lets ast.literal_eval do the
    real parsing, instead of hand-rolling a JSON5 parser.
    """
    marker = f"const {const_name} ="
    start = text.index(marker) + len(marker)
    while text[start] in " \t\n":
        start += 1
    open_ch = text[start]
    close_ch = {"{": "}", "[": "]"}[open_ch]
    depth = 0
    in_str: str | None = None
    i = start
    while i < len(text):
        ch = text[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == in_str:
                in_str = None
        elif ch in "'\"":
            in_str = ch
        elif ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                i += 1
                break
        i += 1
    raw = text[start:i]
    quoted = re.sub(r"(?<=[{,\s])([A-Za-z_][A-Za-z0-9_]*)\s*:", r'"\1":', raw)
    quoted = re.sub(r"\btrue\b", "True", quoted)
    quoted = re.sub(r"\bfalse\b", "False", quoted)
    return ast.literal_eval(quoted)


def load_app_data() -> dict:
    text = SHELL_HTML.read_text(encoding="utf-8")
    return {
        "SPECIES": extract_js_object(text, "SPECIES"),
        "KB_SPP": extract_js_object(text, "KB_SPP"),
        "KB_SUB": extract_js_object(text, "KB_SUB"),
        "KPI": extract_js_object(text, "KPI"),
    }


# ---------------------------------------------------------------------------
# Comparison
# ---------------------------------------------------------------------------

TOLERANCE = {
    "°C": (1.0, 0.0),
    "%": (2.0, 0.0),
    "ppm": (50.0, 0.05),
    "C:N": (2.0, 0.0),
    "g": (2.0, 0.05),
}
DEFAULT_TOLERANCE = (0.5, 0.05)


def tolerance_for(unit: str, scale: float) -> float:
    abs_tol, rel_tol = TOLERANCE.get(unit, DEFAULT_TOLERANCE)
    return max(abs_tol, rel_tol * max(abs(scale), 1.0))


@dataclass
class Finding:
    category: str  # value_mismatch | present_in_kb_absent_in_app | present_in_app_absent_from_kb
    severity: str  # real | representation | info
    entity: str
    parameter: str
    unit: str
    kb_value: str
    kb_source: str
    app_value: str
    app_source: str
    note: str = ""


@dataclass
class SyncPoint:
    entity: str
    parameter: str
    unit: str
    kb_file: Path
    kb_section_pattern: str
    kb_row_pattern: str
    app_source: str
    app_getter: Callable[[dict], object]  # -> float | tuple[float, float] | None


def app_range(value) -> tuple[float, float]:
    if isinstance(value, (list, tuple)):
        return float(min(value)), float(max(value))
    return float(value), float(value)


def evaluate_sync_point(point: SyncPoint, app_data: dict, findings: list[Finding]) -> None:
    kb_rel = point.kb_file.relative_to(ROOT).as_posix()
    try:
        app_value = point.app_getter(app_data)
    except (KeyError, IndexError):
        app_value = None

    candidates, combined = kb_candidates_for(
        point.kb_file, point.kb_section_pattern, point.kb_row_pattern
    )

    if not candidates:
        if app_value is not None:
            findings.append(
                Finding(
                    category="present_in_app_absent_from_kb",
                    severity="info",
                    entity=point.entity,
                    parameter=point.parameter,
                    unit=point.unit,
                    kb_value="(no source found)",
                    kb_source=kb_rel,
                    app_value=str(app_value),
                    app_source=point.app_source,
                    note="No matching table row found under the expected KB section/label.",
                )
            )
        return

    if app_value is None:
        findings.append(
            Finding(
                category="present_in_kb_absent_in_app",
                severity="info",
                entity=point.entity,
                parameter=point.parameter,
                unit=point.unit,
                kb_value="; ".join(c.raw for c in candidates),
                kb_source=kb_rel,
                app_value="(absent)",
                app_source=point.app_source,
                note="App does not define a value for this parameter.",
            )
        )
        return

    alo, ahi = app_range(app_value)
    tol_lo = tolerance_for(point.unit, alo)
    tol_hi = tolerance_for(point.unit, ahi)

    pool = list(candidates)
    if combined is not None:
        pool.append(combined)

    for c in pool:
        if abs(c.lo - alo) <= tol_lo and abs(c.hi - ahi) <= tol_hi:
            return  # in sync, no finding

    is_app_point = alo == ahi
    for c in pool:
        is_kb_point = c.lo == c.hi
        if is_app_point and not is_kb_point:
            if c.lo - tol_lo <= alo <= c.hi + tol_hi:
                findings.append(
                    _mismatch(
                        point, kb_rel, c, app_value, "representation",
                        "App uses a single point that falls inside the KB-documented range.",
                    )
                )
                return
        if is_kb_point and not is_app_point:
            if alo - tol_lo <= c.lo <= ahi + tol_hi:
                findings.append(
                    _mismatch(
                        point, kb_rel, c, app_value, "representation",
                        "KB documents a single point that falls inside the app's range.",
                    )
                )
                return

    closest = min(pool, key=lambda c: abs(c.lo - alo) + abs(c.hi - ahi))
    findings.append(_mismatch(point, kb_rel, closest, app_value, "real", ""))


def _mismatch(
    point: SyncPoint, kb_rel: str, candidate: Candidate, app_value, severity: str, note: str
) -> Finding:
    return Finding(
        category="value_mismatch",
        severity=severity,
        entity=point.entity,
        parameter=point.parameter,
        unit=point.unit,
        kb_value=candidate.raw,
        kb_source=kb_rel,
        app_value=str(app_value),
        app_source=point.app_source,
        note=note,
    )


# ---------------------------------------------------------------------------
# Sync point catalog
#
# Hand-curated on purpose (mirrors check_repository.py's style of explicit,
# named checks) rather than a generic NLP matcher: species/substrate docs
# use inconsistent phrasing between files, so a fuzzy auto-matcher would
# produce more false positives than a short, reviewable list of known
# comparison points. Extend this list as new KB<->app value pairs emerge.
# ---------------------------------------------------------------------------


def species_point(key: str, label: str, unit: str, kb_file: str, section: str, row: str, app_key: str) -> SyncPoint:
    return SyncPoint(
        entity=key,
        parameter=label,
        unit=unit,
        kb_file=KB / "01_species" / kb_file,
        kb_section_pattern=section,
        kb_row_pattern=row,
        app_source=f"KB_SPP.{key}.{app_key}",
        app_getter=lambda d, k=key, a=app_key: d["KB_SPP"][k][a],
    )


SPECIES_SYNC_POINTS: list[SyncPoint] = [
    # Pleurotus djamor
    species_point("pleurotus_djamor", "Fructificación temperatura", "°C", "pleurotus_djamor.md",
                  r"Fructificaci", r"^Temperatura$", "fruitT"),
    species_point("pleurotus_djamor", "Incubación temperatura", "°C", "pleurotus_djamor.md",
                  r"Incubaci", r"^Temperatura$", "incT"),
    species_point("pleurotus_djamor", "Fructificación HR", "%", "pleurotus_djamor.md",
                  r"Fructificaci", r"^HR$", "hr"),
    species_point("pleurotus_djamor", "Fructificación CO2", "ppm", "pleurotus_djamor.md",
                  r"Fructificaci", r"CO", "co2"),
    # Pleurotus ostreatus
    species_point("pleurotus_ostreatus", "Fructificación temperatura", "°C", "pleurotus_ostreatus.md",
                  r"Fructificaci", r"^Temperatura$", "fruitT"),
    species_point("pleurotus_ostreatus", "Incubación temperatura", "°C", "pleurotus_ostreatus.md",
                  r"Incubaci", r"^Temperatura$", "incT"),
    species_point("pleurotus_ostreatus", "Fructificación HR", "%", "pleurotus_ostreatus.md",
                  r"Fructificaci", r"^HR$", "hr"),
    species_point("pleurotus_ostreatus", "Fructificación CO2", "ppm", "pleurotus_ostreatus.md",
                  r"Fructificaci", r"CO", "co2"),
    # Hericium erinaceus
    species_point("hericium_erinaceus", "Fructificación temperatura", "°C", "hericium_erinaceus.md",
                  r"Fructificaci", r"^Temperatura$", "fruitT"),
    species_point("hericium_erinaceus", "Incubación temperatura", "°C", "hericium_erinaceus.md",
                  r"Incubaci", r"^Temperatura$", "incT"),
    species_point("hericium_erinaceus", "Fructificación HR", "%", "hericium_erinaceus.md",
                  r"Fructificaci", r"^HR$", "hr"),
    species_point("hericium_erinaceus", "Fructificación CO2", "ppm", "hericium_erinaceus.md",
                  r"Fructificaci", r"CO", "co2"),
    # Lentinula edodes
    species_point("lentinula_edodes", "Fructificación temperatura", "°C", "lentinula_edodes.md",
                  r"Fructificaci", r"^Temperatura$", "fruitT"),
    species_point("lentinula_edodes", "Incubación temperatura", "°C", "lentinula_edodes.md",
                  r"Incubaci", r"^Temperatura$", "incT"),
    species_point("lentinula_edodes", "Fructificación HR", "%", "lentinula_edodes.md",
                  r"Fructificaci", r"^HR$", "hr"),
    species_point("lentinula_edodes", "Fructificación CO2", "ppm", "lentinula_edodes.md",
                  r"Fructificaci", r"CO", "co2"),
    # Ganoderma lucidum (fruiting/induction share one heading; incubation labels differ)
    species_point("ganoderma_lucidum", "Fructificación temperatura", "°C", "ganoderma_lucidum.md",
                  r"Inducci|Fructificaci", r"Temperatura", "fruitT"),
    species_point("ganoderma_lucidum", "Incubación temperatura", "°C", "ganoderma_lucidum.md",
                  r"Incubaci", r"Temperatura", "incT"),
    species_point("ganoderma_lucidum", "Fructificación HR", "%", "ganoderma_lucidum.md",
                  r"Inducci|Fructificaci", r"^HR", "hr"),
    species_point("ganoderma_lucidum", "Fructificación CO2", "ppm", "ganoderma_lucidum.md",
                  r"Inducci|Fructificaci", r"CO", "co2"),
]


def substrate_point(key: str, label: str, unit: str, section: str, row: str, app_key: str) -> SyncPoint:
    return SyncPoint(
        entity=key,
        parameter=label,
        unit=unit,
        kb_file=KB / "02_substrates" / "substrate_library.md",
        kb_section_pattern=section,
        kb_row_pattern=row,
        app_source=f"KB_SUB.{key}.{app_key}",
        app_getter=lambda d, k=key, a=app_key: d["KB_SUB"][k][a],
    )


SUBSTRATE_SYNC_POINTS: list[SyncPoint] = [
    substrate_point("wheat_straw", "Biological efficiency", "%",
                     r"Paja de Trigo", r"\bBE\b", "be"),
    substrate_point("masters_mix", "Biological efficiency", "%",
                     r"Master.s Mix — Shiitake", r"\bBE\b", "be"),
    substrate_point("coffee_shiitake", "Biological efficiency", "%",
                     r"Subproductos de Caf", r"rendimiento", "be"),
    substrate_point("coffee_shiitake", "C:N ratio", "C:N",
                     r"Subproductos de Caf", r"C/N", "cn"),
]


def kpi_point(label: str, unit: str, kb_file: str, section: str, row: str, app_key: str) -> SyncPoint:
    return SyncPoint(
        entity="KPI",
        parameter=label,
        unit=unit,
        kb_file=KB / kb_file,
        kb_section_pattern=section,
        kb_row_pattern=row,
        app_source=f"KPI.{app_key}",
        app_getter=lambda d, a=app_key: d["KPI"][a],
    )


KPI_SYNC_POINTS: list[SyncPoint] = [
    kpi_point("BE objetivo", "%", "06_operations/production_schedule.md",
              r".", r"BE total objetivo", "beTarget"),
    kpi_point("Yield por bloque", "g", "06_operations/production_schedule.md",
              r".", r"Yield fresco por bloque", "yieldPerBlock"),
    kpi_point("Umbral de contaminación", "%", "02_substrates/contamination.md",
              r"Best Practices", r"contaminaci", "contamMax"),
    # No known KB source for these three as of this writing — routed through
    # the same empty-candidates path as everything else (instead of a
    # special-cased footnote) so they surface as regular
    # present_in_app_absent_from_kb findings, and so a future KB edit that
    # adds a matching row is picked up automatically.
    kpi_point("BE óptimo", "%", "06_operations/production_schedule.md",
              r".", r"BE.*[oó]ptim|[oó]ptim.*BE", "beOptimal"),
    kpi_point("BE de alerta", "%", "06_operations/production_schedule.md",
              r".", r"BE.*alert|alert.*BE", "beAlert"),
    kpi_point("Umbral de alerta de contaminación", "%", "02_substrates/contamination.md",
              r"Best Practices", r"15%|alerta", "contamAlert"),
]


# ---------------------------------------------------------------------------
# extraction-factors.json coverage (whole-file present-in-app-absent-from-kb)
# ---------------------------------------------------------------------------


def check_extraction_factors(findings: list[Finding]) -> None:
    if not EXTRACTION_FACTORS.exists():
        return
    data = json.loads(EXTRACTION_FACTORS.read_text(encoding="utf-8"))
    for species_key, species_data in data.items():
        for method_key, method_data in species_data.get("methods", {}).items():
            params = [
                k
                for k in ("yield_factor", "cost_per_liter_solvent", "optimal_alcohol_pct",
                          "optimal_time_hrs", "optimal_temp_c")
                if k in method_data
            ]
            findings.append(
                Finding(
                    category="present_in_app_absent_from_kb",
                    severity="info",
                    entity=species_key,
                    parameter=f"extraction method '{method_key}'",
                    unit="mixed",
                    kb_value="(no source found)",
                    kb_source="knowledge_base/ (no extraction-methodology numbers documented)",
                    app_value=", ".join(f"{p}={method_data[p]}" for p in params),
                    app_source=f"extraction-factors.json:{species_key}.methods.{method_key}",
                    note=(
                        "extraction-factors.json has no known counterpart anywhere in "
                        "knowledge_base/; these numbers are not traceable to a canonical source."
                    ),
                )
            )


# ---------------------------------------------------------------------------
# Species catalog coverage (KB has a species file the app never models)
# ---------------------------------------------------------------------------


def check_species_catalog(app_data: dict, findings: list[Finding]) -> None:
    app_keys = {s["key"] for s in app_data["SPECIES"]}
    kb_keys = {p.stem for p in (KB / "01_species").glob("*.md")}
    for missing in sorted(kb_keys - app_keys):
        findings.append(
            Finding(
                category="present_in_kb_absent_in_app",
                severity="info",
                entity=missing,
                parameter="species catalog entry",
                unit="n/a",
                kb_value="(full species profile documented)",
                kb_source=f"knowledge_base/01_species/{missing}.md",
                app_value="(absent)",
                app_source="SPECIES / KB_SPP",
                note="knowledge_base documents this species; the app's SPECIES/KB_SPP catalog does not include it.",
            )
        )
    for missing in sorted(app_keys - kb_keys):
        findings.append(
            Finding(
                category="present_in_app_absent_from_kb",
                severity="info",
                entity=missing,
                parameter="species catalog entry",
                unit="n/a",
                kb_value="(no source found)",
                kb_source=f"knowledge_base/01_species/{missing}.md (missing)",
                app_value="(modeled in SPECIES / KB_SPP)",
                app_source="SPECIES / KB_SPP",
                note="The app models this species; knowledge_base has no matching species file.",
            )
        )


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

CATEGORY_LABELS = {
    "value_mismatch": "Value mismatch",
    "present_in_kb_absent_in_app": "Present in KB, absent in app",
    "present_in_app_absent_from_kb": "Present in app, absent from KB",
}


def print_report(findings: list[Finding]) -> None:
    by_category: dict[str, list[Finding]] = {}
    for f in findings:
        by_category.setdefault(f.category, []).append(f)

    for category in ("value_mismatch", "present_in_kb_absent_in_app", "present_in_app_absent_from_kb"):
        items = by_category.get(category, [])
        if not items:
            continue
        print(f"\n== {CATEGORY_LABELS[category]} ({len(items)}) ==")
        for f in items:
            severity_tag = f"[{f.severity}]" if f.category == "value_mismatch" else ""
            print(f"  {severity_tag} {f.entity} / {f.parameter}")
            print(f"      KB  ({f.kb_source}): {f.kb_value}")
            print(f"      App ({f.app_source}): {f.app_value}")
            if f.note:
                print(f"      note: {f.note}")

    real = sum(1 for f in findings if f.category == "value_mismatch" and f.severity == "real")
    representation = sum(
        1 for f in findings if f.category == "value_mismatch" and f.severity == "representation"
    )
    kb_only = sum(1 for f in findings if f.category == "present_in_kb_absent_in_app")
    app_only = sum(1 for f in findings if f.category == "present_in_app_absent_from_kb")
    print(
        f"\nSummary: {real} real mismatch(es), {representation} representation-only "
        f"mismatch(es), {kb_only} KB-only, {app_only} app-only. "
        f"({len(findings)} finding(s) total.)"
    )


def main() -> int:
    app_data = load_app_data()
    findings: list[Finding] = []

    for point in SPECIES_SYNC_POINTS + SUBSTRATE_SYNC_POINTS + KPI_SYNC_POINTS:
        evaluate_sync_point(point, app_data, findings)

    check_extraction_factors(findings)
    check_species_catalog(app_data, findings)

    print_report(findings)

    fail_on_mismatch = "--fail-on-mismatch" in sys.argv
    real_mismatches = sum(
        1 for f in findings if f.category == "value_mismatch" and f.severity == "real"
    )
    if fail_on_mismatch and real_mismatches:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
