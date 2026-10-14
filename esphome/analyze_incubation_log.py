#!/usr/bin/env python3
"""Evalúa un registro CSV de la incubadora contra los criterios de éxito del piloto.

Uso:
    python3 esphome/analyze_incubation_log.py registro.csv

Criterios (provisionales, spec 2026-10-13-piloto-shiitake-incubacion-design.md §7):
  - dt_mapa:        ΔT entre base, centro y parte superior ≤ 2 °C en ≥ 95 % de los intervalos válidos.
  - nucleo_max:     temperatura de núcleo ≤ 28 °C en todos los intervalos válidos.
  - dt_nucleo_aire: núcleo − aire ≤ 5 °C en todos los intervalos válidos.

Un intervalo es válido si todas las columnas de temperatura son numéricas y finitas.
Con cobertura (válidos / totales) menor que `cobertura_minima`, o sin datos, todos
los veredictos son "insuficiente": un registro con huecos nunca da "pasa".
"""

import csv
import json
import math
import sys

COLUMNAS_TEMPERATURA = ("t_aire", "t_base", "t_centro", "t_tope", "t_nucleo")
COLUMNAS_REQUERIDAS = ("timestamp",) + COLUMNAS_TEMPERATURA + ("heater_on",)

UMBRAL_DT_MAPA_C = 2.0
FRACCION_DT_MAPA = 0.95
UMBRAL_NUCLEO_C = 28.0
UMBRAL_DT_NUCLEO_AIRE_C = 5.0
_EPS = 1e-9  # tolerancia de coma flotante en las comparaciones con el umbral


def _numero(texto):
    """Convierte un campo a float finito (acepta coma decimal) o devuelve None."""
    if texto is None:
        return None
    limpio = str(texto).strip().replace(",", ".")
    if not limpio:
        return None
    try:
        valor = float(limpio)
    except ValueError:
        return None
    return valor if math.isfinite(valor) else None


def _criterio(valor, umbral, veredicto):
    return {"valor": valor, "umbral": umbral, "veredicto": veredicto}


def evaluate(rows, cobertura_minima=0.9):
    """Evalúa las filas de un registro (lista de dicts de cadenas) y devuelve el informe."""
    validas = []
    for fila in rows:
        valores = {c: _numero(fila.get(c)) for c in COLUMNAS_TEMPERATURA}
        if all(v is not None for v in valores.values()):
            validas.append(valores)

    totales = len(rows)
    cobertura = len(validas) / totales if totales else 0.0

    dentro_mapa = 0
    nucleo_max = None
    dt_nucleo_aire_max = None
    for v in validas:
        mapa = (v["t_base"], v["t_centro"], v["t_tope"])
        if round(max(mapa) - min(mapa), 9) <= UMBRAL_DT_MAPA_C + _EPS:
            dentro_mapa += 1
        nucleo_max = v["t_nucleo"] if nucleo_max is None else max(nucleo_max, v["t_nucleo"])
        dif = round(v["t_nucleo"] - v["t_aire"], 9)
        dt_nucleo_aire_max = dif if dt_nucleo_aire_max is None else max(dt_nucleo_aire_max, dif)

    fraccion_mapa = dentro_mapa / len(validas) if validas else None
    suficiente = bool(validas) and cobertura >= cobertura_minima - _EPS

    def veredicto(cumple):
        return ("pasa" if cumple else "no_pasa") if suficiente else "insuficiente"

    criterios = {
        "dt_mapa": _criterio(
            fraccion_mapa,
            FRACCION_DT_MAPA,
            veredicto(suficiente and fraccion_mapa >= FRACCION_DT_MAPA - _EPS),
        ),
        "nucleo_max": _criterio(
            nucleo_max,
            UMBRAL_NUCLEO_C,
            veredicto(suficiente and nucleo_max <= UMBRAL_NUCLEO_C + _EPS),
        ),
        "dt_nucleo_aire": _criterio(
            dt_nucleo_aire_max,
            UMBRAL_DT_NUCLEO_AIRE_C,
            veredicto(suficiente and dt_nucleo_aire_max <= UMBRAL_DT_NUCLEO_AIRE_C + _EPS),
        ),
    }
    return {
        "intervalos_totales": totales,
        "intervalos_validos": len(validas),
        "cobertura": cobertura,
        "criterios": criterios,
    }


def _leer_csv(ruta):
    with open(ruta, newline="", encoding="utf-8-sig") as f:
        encabezado = f.readline()
        delimitador = ";" if encabezado.count(";") > encabezado.count(",") else ","
        f.seek(0)
        lector = csv.DictReader(f, delimiter=delimitador)
        faltantes = [c for c in COLUMNAS_REQUERIDAS if c not in (lector.fieldnames or [])]
        if faltantes:
            raise ValueError("faltan columnas en el CSV: " + ", ".join(faltantes))
        return list(lector)


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 1:
        print("uso: analyze_incubation_log.py registro.csv", file=sys.stderr)
        return 2
    try:
        filas = _leer_csv(argv[0])
    except (OSError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(evaluate(filas), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
