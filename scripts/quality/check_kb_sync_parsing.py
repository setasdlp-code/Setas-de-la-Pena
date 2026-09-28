#!/usr/bin/env python3
"""Parsing regression checks for check_kb_sync.py.

The checker's job is to surface real divergence for a human to triage. A
fabricated KB "value" defeats that twice over: it wastes the triage, and it
lends canonical authority to a number nobody wrote down. Each check below
pins a case where the extractor previously did exactly that against live
knowledge_base/ text.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load_checker():
    path = Path(__file__).resolve().parent / "check_kb_sync.py"
    spec = importlib.util.spec_from_file_location("check_kb_sync", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("No se pudo cargar check_kb_sync.py")
    module = importlib.util.module_from_spec(spec)
    # @dataclass resolves annotations via sys.modules[cls.__module__]; register
    # before exec or the decorator fails on a dynamically loaded module.
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def check_identifier_digits_are_not_values(m) -> None:
    """`paper_022`, `DEC-013`, `ADR-0007` are citation keys, not measurements."""
    for text in ("dispersión de Trichoderma (paper_022).", "definido por DEC-013", "per ADR-0007"):
        got = m.extract_candidates(text)
        if got:
            raise AssertionError(
                f"clave de cita leída como valor: {text!r} -> {[c.raw for c in got]}"
            )
    # The guard must not swallow real readings that merely sit next to words.
    for text, expected in (("Temperatura 13–24°C", 13.0), ("~350 ppm", 350.0), ("BE 50", 50.0)):
        got = m.extract_candidates(text)
        if not got or got[0].lo != expected:
            raise AssertionError(f"lectura legítima perdida: {text!r} -> {[c.raw for c in got]}")


def check_declining_prose_yields_no_value(m) -> None:
    """A KB line that refuses to fix a value must produce no candidate at all."""
    cases = (
        (
            "La composición 50/50 es una referencia de literatura, no la receta "
            "aprobada del lote 1; no existe todavía una meta de BE del proyecto.",
            r"\bBE\b",
        ),
        (
            "La humedad, ventilación, luz y CO₂ de la cámara deben definirse con la "
            "ficha del proveedor y un piloto instrumentado; los valores genéricos no "
            "se promueven aquí a estándar operacional.",
            r"CO[₂2]",
        ),
    )
    for prose, label in cases:
        if m.row_values(prose, label):
            raise AssertionError(f"prosa que niega un valor fue leída como fila: {prose[:60]!r}")


def check_co2_label_is_not_substring_of_words(m) -> None:
    """The CO₂ row pattern must not match Spanish words containing 'co'."""
    block = "Evaluable como ensayo secundario con costo bajo (paper_022)."
    if m.row_values(block, r"CO[₂2]"):
        raise AssertionError("el patrón de CO₂ hizo match dentro de una palabra ('como'/'costo')")


def check_live_kb_has_no_fabricated_values(m) -> None:
    """End-to-end: the two known fabrications must stay gone against real files."""
    lentinula = m.KB / "01_species" / "lentinula_edodes.md"
    block = m.section_blocks(lentinula.read_text(encoding="utf-8"), r"Fructificaci")
    for value in m.row_values(block, r"CO[₂2]"):
        if m.extract_candidates(value):
            raise AssertionError(f"lentinula CO₂ volvió a fabricar un valor desde: {value[:70]!r}")

    substrates = m.KB / "02_substrates" / "substrate_library.md"
    block = m.section_blocks(substrates.read_text(encoding="utf-8"), r"Master.s Mix — Shiitake")
    for value in m.row_values(block, r"\bBE\b"):
        if m.extract_candidates(value):
            raise AssertionError(f"masters_mix BE volvió a fabricar un valor desde: {value[:70]!r}")


def main() -> int:
    m = load_checker()
    for check in (
        check_identifier_digits_are_not_values,
        check_declining_prose_yields_no_value,
        check_co2_label_is_not_substring_of_words,
        check_live_kb_has_no_fabricated_values,
    ):
        check(m)
    print("check_kb_sync parsing: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
