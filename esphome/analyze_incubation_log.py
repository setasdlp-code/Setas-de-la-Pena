"""Evalúa un registro de la incubadora contra los criterios de éxito del piloto.

Uso: python3 esphome/analyze_incubation_log.py registro.csv

Columnas obligatorias: timestamp (ISO 8601), t_aire, heater_on.
Columnas opcionales: t_base, t_centro, t_tope (mapa térmico) y t_nucleo.
Con DEC-023 la incubadora piloto no tiene sondas DS18B20: el registro trae
solo el aire, y los criterios de mapa y de núcleo salen con veredicto
"sin_sensor" (valor null). Nunca se estiman. Si un grupo opcional está en la
cabecera, se exige en cada fila como antes.
Acepta decimales con coma si el separador es ';' (con separador ',' los
decimales con coma desplazan las columnas y esas filas se invalidan).
Imprime un JSON. Una fila es válida si su timestamp se lee y las temperaturas
presentes son numéricas. La cobertura es el menor de dos valores: filas
válidas sobre filas presentes, e intervalos con dato sobre los esperados entre
la primera y la última fila (un hueco largo no cuenta como "pasa").
Criterios (spec 2026-10-13-piloto-shiitake-incubacion-design.md, sección 7):
  - dt_mapa: ΔT entre base, centro y tope ≤ 2 °C en ≥ 95 % de los intervalos.
  - nucleo_max: temperatura de núcleo ≤ 28 °C.
  - dt_nucleo_aire: diferencia núcleo - aire ≤ 5 °C.
El JSON trae además t_aire_min y t_aire_max (descriptivos, sin veredicto: no
hay banda de lote aprobada).
"""
import csv
import json
import math
import sys
from datetime import datetime, timezone

COLUMNAS_MAPA = ("t_base", "t_centro", "t_tope")
COLUMNAS_NUCLEO = ("t_nucleo",)
TEMPERATURAS = ("t_aire",) + COLUMNAS_MAPA + COLUMNAS_NUCLEO
COLUMNAS_REQUERIDAS = ("timestamp", "t_aire", "heater_on")
SIN_SENSOR = "sin_sensor"
INTERVALO_ESPERADO_S = 60
MINIMO_INTERVALOS_VALIDOS = 30
UMBRAL_DT_MAPA_C = 2.0
FRACCION_MINIMA_MAPA = 0.95
UMBRAL_NUCLEO_C = 28.0
UMBRAL_DT_NUCLEO_AIRE_C = 5.0
_EPS = 1e-9  # tolerancia de coma flotante: 22.3 - 20.3 no debe contar como > 2


def _numero(texto):
    """Devuelve un float finito o None (vacío, 'nan', 'inf' o no numérico)."""
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


def _fecha(texto):
    """Devuelve un datetime sin zona horaria (en UTC) o None si no se puede leer."""
    try:
        fecha = datetime.fromisoformat(str(texto).strip())
    except (ValueError, TypeError):
        return None
    if fecha.tzinfo is not None:
        fecha = fecha.astimezone(timezone.utc).replace(tzinfo=None)
    return fecha


def _criterio(valor, umbral, veredicto):
    return {"valor": valor, "umbral": umbral, "veredicto": veredicto}


def _grupo_presente(rows, columnas):
    """Un grupo opcional está presente si alguna fila trae alguna de sus columnas.

    Sin filas no se sabe qué sensores había: se tratan como presentes y los
    criterios salen "insuficiente", no "sin_sensor".
    """
    if not rows:
        return True
    return any(c in fila for fila in rows for c in columnas)


def evaluate(rows, cobertura_minima=0.9,
             minimo_intervalos_validos=MINIMO_INTERVALOS_VALIDOS,
             intervalo_esperado_s=INTERVALO_ESPERADO_S):
    """Evalúa filas (dicts de texto) contra los criterios de éxito."""
    hay_mapa = _grupo_presente(rows, COLUMNAS_MAPA)
    hay_nucleo = _grupo_presente(rows, COLUMNAS_NUCLEO)
    exigidas = (("t_aire",) + (COLUMNAS_MAPA if hay_mapa else ())
                + (COLUMNAS_NUCLEO if hay_nucleo else ()))
    validos = []
    fechas = []
    for fila in rows:
        fecha = _fecha(fila.get("timestamp"))
        if fecha is not None:
            fechas.append(fecha)
        # Una fila con campos de más (la clave None de DictReader) tiene las
        # columnas desplazadas: no se puede confiar en ningún valor.
        if fecha is None or None in fila:
            continue
        valores = {k: _numero(fila.get(k)) for k in exigidas}
        if all(v is not None for v in valores.values()):
            validos.append(valores)
            validos[-1]["_fecha"] = fecha

    totales = len(rows)
    cobertura_filas = len(validos) / totales if totales else 0.0
    esperados = (int((max(fechas) - min(fechas)).total_seconds()
                     // intervalo_esperado_s) + 1) if fechas else 0
    unicas = sorted({v["_fecha"] for v in validos})
    cobertura_tiempo = min(1.0, len(unicas) / esperados) if esperados else 0.0
    cobertura = min(cobertura_filas, cobertura_tiempo)
    hueco_max_s = max(((b - a).total_seconds() for a, b in zip(unicas, unicas[1:])),
                      default=0.0)
    suficiente = (len(validos) >= minimo_intervalos_validos
                  and cobertura >= cobertura_minima - _EPS)

    mapas = [max(v["t_base"], v["t_centro"], v["t_tope"])
             - min(v["t_base"], v["t_centro"], v["t_tope"])
             for v in validos] if hay_mapa else []
    fraccion_mapa = (sum(1 for m in mapas if round(m, 9) <= UMBRAL_DT_MAPA_C + _EPS)
                     / len(mapas) if mapas else None)
    nucleo_max = (max((v["t_nucleo"] for v in validos), default=None)
                  if hay_nucleo else None)
    dt_max = (max((round(v["t_nucleo"] - v["t_aire"], 9) for v in validos),
                  default=None) if hay_nucleo else None)

    def veredicto(cumple, presente=True):
        if not presente:
            return SIN_SENSOR
        if not suficiente:
            return "insuficiente"
        return "pasa" if cumple else "no_pasa"

    return {
        "intervalos_totales": totales,
        "intervalos_validos": len(validos),
        "cobertura": cobertura,
        "cobertura_filas": cobertura_filas,
        "cobertura_tiempo": cobertura_tiempo,
        "hueco_max_s": hueco_max_s,
        "t_aire_min": min((v["t_aire"] for v in validos), default=None),
        "t_aire_max": max((v["t_aire"] for v in validos), default=None),
        "criterios": {
            "dt_mapa": _criterio(
                fraccion_mapa, FRACCION_MINIMA_MAPA,
                veredicto(fraccion_mapa is not None
                          and fraccion_mapa >= FRACCION_MINIMA_MAPA - _EPS, hay_mapa)),
            "nucleo_max": _criterio(
                nucleo_max, UMBRAL_NUCLEO_C,
                veredicto(nucleo_max is not None
                          and nucleo_max <= UMBRAL_NUCLEO_C + _EPS, hay_nucleo)),
            "dt_nucleo_aire": _criterio(
                dt_max, UMBRAL_DT_NUCLEO_AIRE_C,
                veredicto(dt_max is not None
                          and dt_max <= UMBRAL_DT_NUCLEO_AIRE_C + _EPS, hay_nucleo)),
        },
    }


def _leer_csv(ruta):
    with open(ruta, newline="", encoding="utf-8-sig") as f:  # utf-8-sig: BOM de Excel
        primera = f.readline()
        f.seek(0)
        separador = ";" if primera.count(";") > primera.count(",") else ","
        lector = csv.DictReader(f, delimiter=separador)
        cabecera = lector.fieldnames or []
        faltan = [c for c in COLUMNAS_REQUERIDAS if c not in cabecera]
        if faltan:
            raise ValueError("faltan columnas en la cabecera: " + ", ".join(faltan))
        # Un grupo opcional va completo o no va: un mapa a medias es un error de
        # exportación, no un sensor ausente.
        mapa = [c for c in COLUMNAS_MAPA if c in cabecera]
        if mapa and len(mapa) != len(COLUMNAS_MAPA):
            raise ValueError("mapa térmico incompleto en la cabecera: faltan "
                             + ", ".join(c for c in COLUMNAS_MAPA if c not in cabecera))
        return list(lector)


def main(argv):
    if len(argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2
    try:
        filas = _leer_csv(argv[1])
    except (OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(json.dumps(evaluate(filas), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
