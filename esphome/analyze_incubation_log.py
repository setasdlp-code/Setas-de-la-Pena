"""Evalúa un registro de la incubadora contra los criterios de éxito del piloto.

Uso: python3 esphome/analyze_incubation_log.py registro.csv

Columnas: timestamp, t_aire, t_base, t_centro, t_tope, t_nucleo, heater_on.
Acepta decimales con coma y separador ',' o ';'. Imprime un JSON.
Criterios (spec 2026-10-13-piloto-shiitake-incubacion-design.md, sección 7):
  - dt_mapa: ΔT entre base, centro y tope ≤ 2 °C en ≥ 95 % de los intervalos.
  - nucleo_max: temperatura de núcleo ≤ 28 °C.
  - dt_nucleo_aire: diferencia núcleo - aire ≤ 5 °C.
"""
import csv
import json
import math
import sys

TEMPERATURAS = ("t_aire", "t_base", "t_centro", "t_tope", "t_nucleo")
UMBRAL_DT_MAPA_C = 2.0
FRACCION_MINIMA_MAPA = 0.95
UMBRAL_NUCLEO_C = 28.0
UMBRAL_DT_NUCLEO_AIRE_C = 5.0


def _numero(texto):
    """Devuelve un float o None si el valor está vacío, es 'nan' o no es numérico."""
    if texto is None:
        return None
    limpio = str(texto).strip().replace(",", ".")
    if not limpio:
        return None
    try:
        valor = float(limpio)
    except ValueError:
        return None
    return None if math.isnan(valor) else valor


def _criterio(valor, umbral, veredicto):
    return {"valor": valor, "umbral": umbral, "veredicto": veredicto}


def evaluate(rows, cobertura_minima=0.9):
    """Evalúa filas (dicts de texto) contra los criterios de éxito."""
    validos = []
    for fila in rows:
        valores = {k: _numero(fila.get(k)) for k in TEMPERATURAS}
        if all(v is not None for v in valores.values()):
            validos.append(valores)

    totales = len(rows)
    cobertura = len(validos) / totales if totales else 0.0
    suficiente = bool(validos) and cobertura >= cobertura_minima

    mapas = [max(v["t_base"], v["t_centro"], v["t_tope"])
             - min(v["t_base"], v["t_centro"], v["t_tope"]) for v in validos]
    fraccion_mapa = (sum(1 for m in mapas if m <= UMBRAL_DT_MAPA_C) / len(mapas)
                     if mapas else None)
    nucleo_max = max((v["t_nucleo"] for v in validos), default=None)
    dt_max = max((v["t_nucleo"] - v["t_aire"] for v in validos), default=None)

    def veredicto(cumple):
        if not suficiente:
            return "insuficiente"
        return "pasa" if cumple else "no_pasa"

    return {
        "intervalos_totales": totales,
        "intervalos_validos": len(validos),
        "cobertura": cobertura,
        "criterios": {
            "dt_mapa": _criterio(
                fraccion_mapa, FRACCION_MINIMA_MAPA,
                veredicto(fraccion_mapa is not None
                          and fraccion_mapa >= FRACCION_MINIMA_MAPA)),
            "nucleo_max": _criterio(
                nucleo_max, UMBRAL_NUCLEO_C,
                veredicto(nucleo_max is not None and nucleo_max <= UMBRAL_NUCLEO_C)),
            "dt_nucleo_aire": _criterio(
                dt_max, UMBRAL_DT_NUCLEO_AIRE_C,
                veredicto(dt_max is not None and dt_max <= UMBRAL_DT_NUCLEO_AIRE_C)),
        },
    }


def _leer_csv(ruta):
    with open(ruta, newline="", encoding="utf-8") as f:
        primera = f.readline()
        f.seek(0)
        separador = ";" if ";" in primera else ","
        return list(csv.DictReader(f, delimiter=separador))


def main(argv):
    if len(argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2
    print(json.dumps(evaluate(_leer_csv(argv[1])), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
