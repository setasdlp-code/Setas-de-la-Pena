"""Pruebas del analizador de registros de incubación (datos sintéticos)."""

import csv
import json
import os
import subprocess
import sys
import tempfile
import unittest

import analyze_incubation_log as aly

AQUI = os.path.dirname(os.path.abspath(__file__))
CLI = os.path.join(AQUI, "analyze_incubation_log.py")


def fila(t_aire=24.0, t_base=23.5, t_centro=24.0, t_tope=24.5, t_nucleo=26.0, heater_on="0", n=0):
    return {
        "timestamp": f"2026-10-20T00:{n // 60:02d}:{n % 60:02d}",
        "t_aire": str(t_aire),
        "t_base": str(t_base),
        "t_centro": str(t_centro),
        "t_tope": str(t_tope),
        "t_nucleo": str(t_nucleo),
        "heater_on": heater_on,
    }


def filas_buenas(n=100):
    # ΔT mapa 1 °C; núcleo 26 °C; núcleo-aire 2 °C
    return [fila(n=i) for i in range(n)]


def veredictos(res):
    return {k: v["veredicto"] for k, v in res["criterios"].items()}


class EvaluateTest(unittest.TestCase):
    def test_todo_dentro_de_limites_pasa(self):
        rows = [fila(t_aire=23.0, t_base=22.0, t_centro=23.0, t_tope=24.0, t_nucleo=26.0, n=i) for i in range(100)]
        res = aly.evaluate(rows)
        self.assertEqual(res["intervalos_totales"], 100)
        self.assertEqual(res["intervalos_validos"], 100)
        self.assertEqual(res["cobertura"], 1.0)
        # núcleo-aire = 3 °C
        self.assertEqual(veredictos(res), {"dt_mapa": "pasa", "nucleo_max": "pasa", "dt_nucleo_aire": "pasa"})

    def test_dt_mapa_umbral_95(self):
        def serie(buenas):
            rows = filas_buenas(100)
            for i in range(100 - buenas):  # ΔT 3 °C en los intervalos malos
                rows[i] = fila(t_base=22.0, t_tope=25.0, n=i)
            return rows

        self.assertEqual(aly.evaluate(serie(94))["criterios"]["dt_mapa"]["veredicto"], "no_pasa")
        self.assertEqual(aly.evaluate(serie(95))["criterios"]["dt_mapa"]["veredicto"], "pasa")

    def test_dt_mapa_exactamente_2_cuenta_como_dentro(self):
        # 22.3 - 20.3 = 2.0000000000000004 en coma flotante: no debe contar como > 2.
        rows = [fila(t_base=20.3, t_centro=21.0, t_tope=22.3, n=i) for i in range(100)]
        self.assertEqual(aly.evaluate(rows)["criterios"]["dt_mapa"]["veredicto"], "pasa")

    def test_nucleo_sobre_28_no_pasa(self):
        rows = filas_buenas(100)
        rows[10] = fila(t_nucleo=28.1, n=10)
        res = aly.evaluate(rows)
        self.assertEqual(res["criterios"]["nucleo_max"]["veredicto"], "no_pasa")
        self.assertEqual(res["criterios"]["nucleo_max"]["valor"], 28.1)
        self.assertEqual(aly.evaluate(filas_buenas(100))["criterios"]["nucleo_max"]["veredicto"], "pasa")

    def test_nucleo_exactamente_28_pasa(self):
        rows = filas_buenas(100)
        rows[3] = fila(t_nucleo=28.0, n=3)
        self.assertEqual(aly.evaluate(rows)["criterios"]["nucleo_max"]["veredicto"], "pasa")

    def test_dt_nucleo_aire_sobre_5_no_pasa(self):
        rows = filas_buenas(100)
        rows[10] = fila(t_aire=22.0, t_nucleo=27.1, n=10)  # 5,1 °C
        res = aly.evaluate(rows)
        self.assertEqual(res["criterios"]["dt_nucleo_aire"]["veredicto"], "no_pasa")
        rows[10] = fila(t_aire=22.0, t_nucleo=27.0, n=10)  # 5,0 °C
        self.assertEqual(aly.evaluate(rows)["criterios"]["dt_nucleo_aire"]["veredicto"], "pasa")

    def test_filas_invalidas_no_cuentan_como_pasa(self):
        rows = filas_buenas(50)
        for i in range(25):
            rows.append({k: "" for k in fila()})
        for i in range(25):
            r = fila(n=i)
            r["t_nucleo"] = "nan"
            rows.append(r)
        res = aly.evaluate(rows)
        self.assertEqual(res["intervalos_totales"], 100)
        self.assertEqual(res["cobertura"], 0.5)
        self.assertEqual(
            veredictos(res),
            {"dt_mapa": "insuficiente", "nucleo_max": "insuficiente", "dt_nucleo_aire": "insuficiente"},
        )

    def test_sin_filas_es_insuficiente(self):
        res = aly.evaluate([])
        self.assertEqual(res["intervalos_totales"], 0)
        self.assertEqual(res["cobertura"], 0.0)
        self.assertEqual(set(veredictos(res).values()), {"insuficiente"})

    def test_columna_ausente_es_insuficiente(self):
        rows = [{k: v for k, v in fila(n=i).items() if k != "t_nucleo"} for i in range(100)]
        self.assertEqual(set(veredictos(aly.evaluate(rows)).values()), {"insuficiente"})

    def test_valores_no_finitos_son_invalidos(self):
        rows = filas_buenas(100)
        rows[0] = fila(t_base="inf", n=0)
        rows[1] = fila(t_centro="-inf", n=1)
        res = aly.evaluate(rows, cobertura_minima=0.99)
        self.assertEqual(res["intervalos_validos"], 98)

    def test_decimal_con_coma(self):
        rows = [fila(t_aire="22,5", t_base="22,0", t_centro="22,5", t_tope="23,0", t_nucleo="26,5", n=i)
                for i in range(100)]
        res = aly.evaluate(rows)
        self.assertEqual(res["intervalos_validos"], 100)
        self.assertEqual(res["criterios"]["nucleo_max"]["valor"], 26.5)
        self.assertEqual(res["criterios"]["dt_nucleo_aire"]["valor"], 4.0)

    def test_cobertura_minima_configurable(self):
        rows = filas_buenas(80) + [{k: "" for k in fila()} for _ in range(20)]
        self.assertEqual(set(veredictos(aly.evaluate(rows)).values()), {"insuficiente"})  # 0,8 < 0,9
        self.assertEqual(set(veredictos(aly.evaluate(rows, cobertura_minima=0.8)).values()), {"pasa"})


class CliTest(unittest.TestCase):
    def _correr(self, filas, delimitador=","):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = os.path.join(tmp, "registro.csv")
            with open(ruta, "w", newline="", encoding="utf-8") as f:
                w = csv.DictWriter(f, fieldnames=list(fila()), delimiter=delimitador)
                w.writeheader()
                w.writerows(filas)
            return subprocess.run([sys.executable, CLI, ruta], capture_output=True, text=True)

    def test_cli_json(self):
        r = self._correr(filas_buenas(100))
        self.assertEqual(r.returncode, 0, r.stderr)
        salida = json.loads(r.stdout)
        for clave in ("intervalos_totales", "cobertura", "criterios"):
            self.assertIn(clave, salida)
        self.assertEqual(salida["intervalos_totales"], 100)

    def test_cli_csv_punto_y_coma_con_coma_decimal(self):
        filas = [fila(t_aire="22,5", t_base="22,0", t_centro="22,5", t_tope="23,0", t_nucleo="26,5", n=i)
                 for i in range(100)]
        r = self._correr(filas, delimitador=";")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(json.loads(r.stdout)["intervalos_validos"], 100)

    def test_cli_columnas_faltantes_falla(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = os.path.join(tmp, "registro.csv")
            with open(ruta, "w", encoding="utf-8") as f:
                f.write("timestamp,t_aire\n2026-10-20T00:00:00,22\n")
            r = subprocess.run([sys.executable, CLI, ruta], capture_output=True, text=True)
        self.assertEqual(r.returncode, 2)
        self.assertIn("t_nucleo", r.stderr)


if __name__ == "__main__":
    unittest.main()
