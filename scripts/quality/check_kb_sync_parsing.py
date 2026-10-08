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


def check_be_reference_is_found(m) -> None:
    """Los tres umbrales de BE deben leer la frase que el KB sí documenta.

    Apuntaban a filas de tabla inexistentes, así que salían como "no hay
    fuente" mientras production_schedule.md documenta 40–70% y el app usa
    80/100/70. Un hueco de cobertura y una divergencia real se triagean
    distinto; esto fija que se reporte la segunda.
    """
    point = next(p for p in m.KPI_SYNC_POINTS if p.app_source == "KPI.beTarget")
    candidates, _ = m.kb_candidates_for(point.kb_file, point.kb_section_pattern, point.kb_row_pattern)
    if not candidates:
        raise AssertionError("la BE de referencia del KB dejó de encontrarse")
    if not any(c.lo == 40 and c.hi == 70 for c in candidates):
        raise AssertionError(f"se esperaba leer 40–70 de la BE de referencia, se leyó {[c.raw for c in candidates]}")


def check_yield_per_block_stays_unsourced(m) -> None:
    """800 g/bloque no tiene fuente, y el rango de empaque no es su fuente.

    "Empacar en bolsas (500–1,000 g por bloque)" es masa de sustrato empacado,
    no cosecha fresca. Apuntar ahí el KPI haría que el checker declarara que
    coincide comparando magnitudes distintas — daría por validado un número
    que nadie midió. El punto debe seguir existiendo (para que el hueco se
    reporte) y seguir sin candidatos.
    """
    point = next(p for p in m.KPI_SYNC_POINTS if p.app_source == "KPI.yieldPerBlock")
    candidates, combined = m.kb_candidates_for(point.kb_file, point.kb_section_pattern, point.kb_row_pattern)
    if candidates or combined:
        raise AssertionError(
            f"yieldPerBlock quedó con fuente: {[c.raw for c in candidates]} — "
            "verificar que no se cableó al rango de empaque"
        )


def check_latex_ranges_are_read_as_ranges(m) -> None:
    """`$85\\text{–}90\\text{ °C}$` es un rango, no dos valores sueltos.

    09_research escribe números en LaTeX. Sin desenvolver \\text{}, el guion
    del rango queda oculto y 85–90 se lee como 85 y 90: suficiente para
    reportar 88 °C como divergencia estando dentro del rango documentado.
    """
    got = m.extract_candidates(r"a $85\text{–}90\text{ °C}$ durante 2 a 3 horas")
    if not any(c.lo == 85 and c.hi == 90 for c in got):
        raise AssertionError(f"rango LaTeX no leído como rango: {[c.raw for c in got]}")


def check_documented_extractions_are_compared(m) -> None:
    """Hericium/Reishi sí tienen cinética de extracción documentada.

    El checker afirmaba en bloque que extraction-factors.json no tiene
    contraparte en knowledge_base/. deep_research_synthesis_2026.md §1 la tiene
    para Hericium/Reishi, y el app la contradice en varios parámetros.
    """
    if not m.EXTRACTION_SYNC_POINTS:
        raise AssertionError("se perdieron los puntos de extracción documentados")
    for point in m.EXTRACTION_SYNC_POINTS:
        candidates, _ = m.kb_candidates_for(point.kb_file, point.kb_section_pattern, point.kb_row_pattern)
        if not candidates:
            raise AssertionError(f"sin candidatos para {point.entity} / {point.parameter}")
    # Las especies sin fuente no deben quedar cubiertas por accidente.
    covered = {s for (s, _m) in m.EXTRACTION_COVERED_PARAMS}
    for species in ("p_ostreatus_gris", "shiitake"):
        if species in covered:
            raise AssertionError(f"{species} no tiene fuente documentada y quedó marcada como cubierta")


def check_ostreatus_air_and_core_rows_resolve(m) -> None:
    """La incubación de ostreatus se desdobló en aire (consigna) y núcleo
    (vigilancia). Los dos patrones de fila tienen que seguir encontrando su
    fila: si alguno deja de hacerlo, el punto cae a "(no source found)" y la
    comparación se pierde SIN que el reporte lo diga como divergencia. Es el
    mismo modo de fallo que un hueco en silencio, y por eso se vigila aquí.
    """
    points = {
        p.parameter: p
        for p in m.SPECIES_SYNC_POINTS
        if p.entity == "pleurotus_ostreatus" and "Incubaci" in p.parameter
    }
    for name in ("Incubación temperatura de aire", "Incubación techo de núcleo"):
        if name not in points:
            raise AssertionError(f"falta el punto de sincronía '{name}' para ostreatus")
        candidates, _ = m.kb_candidates_for(
            points[name].kb_file, points[name].kb_section_pattern, points[name].kb_row_pattern
        )
        if not candidates:
            raise AssertionError(
                f"'{name}': el patrón de fila ya no encuentra su fila en la ficha de ostreatus; "
                "la comparación se perdería en silencio"
            )
    # El techo de núcleo ya está cableado en la app (KB_SPP.incCoreMaxT), así
    # que el punto pasó de reportar un hueco a comparar de verdad. Lo que se
    # vigila ahora es que siga comparando: si el getter volviera a dar None, el
    # punto degradaría a "ausente en la app" y la divergencia dejaría de
    # detectarse — silencio, no alerta.
    core = points["Incubación techo de núcleo"]
    app_data = m.load_app_data()
    app_value = core.app_getter(app_data)
    if app_value is None:
        raise AssertionError(
            "KB_SPP ya no define incCoreMaxT: el punto volvería a reportar un hueco "
            "en vez de comparar, y una divergencia de techo de núcleo pasaría inadvertida"
        )
    # Y que el número siga siendo el del KB. El checker ya lo compara, pero un
    # fallo aquí es más legible que una fila de divergencia en el reporte.
    candidates, _ = m.kb_candidates_for(core.kb_file, core.kb_section_pattern, core.kb_row_pattern)
    kb_values = {c.lo for c in candidates} | {c.hi for c in candidates}
    if app_value not in kb_values:
        raise AssertionError(
            f"el techo de núcleo de la app ({app_value}) no aparece en la fila del KB "
            f"(valores leídos: {sorted(kb_values)})"
        )


def main() -> int:
    m = load_checker()
    for check in (
        check_ostreatus_air_and_core_rows_resolve,
        check_identifier_digits_are_not_values,
        check_declining_prose_yields_no_value,
        check_co2_label_is_not_substring_of_words,
        check_live_kb_has_no_fabricated_values,
        check_be_reference_is_found,
        check_yield_per_block_stays_unsourced,
        check_latex_ranges_are_read_as_ranges,
        check_documented_extractions_are_compared,
    ):
        check(m)
    print("check_kb_sync parsing: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
