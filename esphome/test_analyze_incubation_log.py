"""Pruebas del analizador de registros de la incubadora del piloto."""
import csv
import json
import os
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyze_incubation_log import evaluate  # noqa: E402

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      "analyze_incubation_log.py")
COLUMNAS = ["timestamp", "t_aire", "t_base", "t_centro", "t_tope",
            "t_nucleo", "heater_on"]


def fila(i=0, aire=23.0, base=22.0, centro=22.5, tope=23.0, nucleo=26.0):
    return {"timestamp": f"2026-11-01T00:{i // 60:02d}:{i % 60:02d}",
            "t_aire": str(aire), "t_base": str(base), "t_centro": str(centro),
            "t_tope": str(tope), "t_nucleo": str(nucleo), "heater_on": "1"}


def veredictos(resultado):
    return {k: v["veredicto"] for k, v in resultado["criterios"].items()}


class AnalizadorTest(unittest.TestCase):
    def test_todo_dentro_de_limites_pasa(self):
        r = evaluate([fila(i) for i in range(100)])
        self.assertEqual(veredictos(r), {"dt_mapa": "pasa", "nucleo_max": "pasa",
                                         "dt_nucleo_aire": "pasa"})
        self.assertEqual(r["intervalos_totales"], 100)
        self.assertEqual(r["intervalos_validos"], 100)

    def test_dt_mapa_umbral_95(self):
        malo = dict(base=21.0, tope=24.0)  # mapa de 3 °C
        con_94 = [fila(i) for i in range(94)] + [fila(i, **malo) for i in range(6)]
        con_95 = [fila(i) for i in range(95)] + [fila(i, **malo) for i in range(5)]
        self.assertEqual(veredictos(evaluate(con_94))["dt_mapa"], "no_pasa")
        self.assertEqual(veredictos(evaluate(con_95))["dt_mapa"], "pasa")

    def test_nucleo_sobre_28_no_pasa(self):
        filas = [fila(i) for i in range(99)] + [fila(99, aire=25.0, nucleo=28.1)]
        v = veredictos(evaluate(filas))
        self.assertEqual(v["nucleo_max"], "no_pasa")
        self.assertEqual(v["dt_nucleo_aire"], "pasa")

    def test_nucleo_exactamente_28_pasa(self):
        filas = [fila(i, aire=25.0, nucleo=28.0) for i in range(100)]
        self.assertEqual(veredictos(evaluate(filas))["nucleo_max"], "pasa")

    def test_dt_nucleo_aire_sobre_5_no_pasa(self):
        filas = [fila(i) for i in range(99)] + [fila(99, aire=21.9, nucleo=27.0)]
        v = veredictos(evaluate(filas))
        self.assertEqual(v["dt_nucleo_aire"], "no_pasa")
        self.assertEqual(v["nucleo_max"], "pasa")

    def test_filas_invalidas_no_cuentan_como_pasa(self):
        vacia = {"timestamp": "2026-11-01T01:00:00", "t_aire": "", "t_base": "nan",
                 "t_centro": "", "t_tope": "", "t_nucleo": "", "heater_on": "0"}
        filas = [fila(i) for i in range(50)] + [dict(vacia) for _ in range(50)]
        r = evaluate(filas)
        self.assertEqual(r["cobertura"], 0.5)
        self.assertEqual(set(veredictos(r).values()), {"insuficiente"})

    def test_sin_filas_es_insuficiente(self):
        r = evaluate([])
        self.assertEqual(r["cobertura"], 0.0)
        self.assertEqual(set(veredictos(r).values()), {"insuficiente"})

    def test_decimal_con_coma(self):
        filas = [fila(i, aire="23,0", base="22,0", centro="22,5", tope="23,0",
                      nucleo="26,0") for i in range(100)]
        r = evaluate(filas)
        self.assertEqual(r["intervalos_validos"], 100)
        self.assertEqual(r["criterios"]["nucleo_max"]["valor"], 26.0)

    def test_cli_json(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = os.path.join(tmp, "registro.csv")
            with open(ruta, "w", newline="", encoding="utf-8") as f:
                w = csv.DictWriter(f, fieldnames=COLUMNAS)
                w.writeheader()
                w.writerows(fila(i) for i in range(20))
            r = subprocess.run([sys.executable, SCRIPT, ruta],
                               capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        salida = json.loads(r.stdout)
        for clave in ("intervalos_totales", "cobertura", "criterios"):
            self.assertIn(clave, salida)
        self.assertEqual(salida["intervalos_totales"], 20)


if __name__ == "__main__":
    unittest.main()
