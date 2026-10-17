"""Pruebas del firmware ESPHome de la incubadora del piloto de shiitake."""
import os
import shutil
import subprocess
import tempfile
import unittest

import yaml

AQUI = os.path.dirname(os.path.abspath(__file__))
YAML_PATH = os.path.join(AQUI, "incubadora_piloto.yaml")
SECRETS_EJEMPLO = os.path.join(AQUI, "secrets.example.yaml")
ESPHOME_BIN = os.environ.get("ESPHOME_BIN", "")


class _Loader(yaml.SafeLoader):
    """Loader que acepta las etiquetas de ESPHome (!secret, !lambda, !include)."""


def _etiqueta(loader, sufijo, nodo):
    if isinstance(nodo, yaml.ScalarNode):
        return f"!{sufijo} {loader.construct_scalar(nodo)}"
    if isinstance(nodo, yaml.SequenceNode):
        return loader.construct_sequence(nodo, deep=True)
    return loader.construct_mapping(nodo, deep=True)


_Loader.add_multi_constructor("!", _etiqueta)


def cargar_yaml(ruta: str) -> dict:
    with open(ruta, encoding="utf-8") as f:
        return yaml.load(f, Loader=_Loader)


def buscar(lista, **criterio):
    """Primer elemento de una lista de dicts que cumple todos los campos."""
    for elemento in lista:
        if all(elemento.get(k) == v for k, v in criterio.items()):
            return elemento
    return None


def _segundos(valor) -> float:
    """Convierte '30s' o '1min' a segundos."""
    texto = str(valor).strip()
    if texto.endswith("min"):
        return float(texto[:-3]) * 60
    if texto.endswith("ms"):
        return float(texto[:-2]) / 1000
    if texto.endswith("s"):
        return float(texto[:-1])
    raise ValueError(f"duración no soportada: {valor}")


def plataformas(cfg, plataforma):
    return [s for s in cfg.get("sensor", []) if s.get("platform") == plataforma]


def sensor_por_id(cfg, id_):
    """Busca un sensor por id, también entre los sub-sensores de una plataforma."""
    for s in cfg.get("sensor", []):
        if s.get("id") == id_:
            return s
        for valor in s.values():
            if isinstance(valor, dict) and valor.get("id") == id_:
                return valor
    return None


class IncubadoraYamlTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cfg = cargar_yaml(YAML_PATH)

    def test_carga_yaml(self):
        for clave in ("esphome", "esp32", "wifi", "api", "ota", "logger"):
            self.assertIn(clave, self.cfg)

    def test_rele_arranca_apagado(self):
        rele = buscar(self.cfg["switch"], id="rele_calefactor")
        self.assertIsNotNone(rele, "falta el switch rele_calefactor")
        self.assertEqual(rele["restore_mode"], "ALWAYS_OFF")

    def test_secretos_no_literales(self):
        valores = [
            self.cfg["wifi"]["ssid"],
            self.cfg["wifi"]["password"],
            self.cfg["api"]["encryption"]["key"],
            self.cfg["ota"][0]["password"],
        ]
        for valor in valores:
            self.assertTrue(str(valor).startswith("!secret "), valor)

    @unittest.skipUnless(
        ESPHOME_BIN and os.path.exists(ESPHOME_BIN),
        "ESPHOME_BIN no apunta a un ejecutable de esphome",
    )
    def test_esphome_config_valido(self):
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(YAML_PATH, os.path.join(tmp, "incubadora_piloto.yaml"))
            shutil.copy(SECRETS_EJEMPLO, os.path.join(tmp, "secrets.yaml"))
            r = subprocess.run(
                [ESPHOME_BIN, "config", "incubadora_piloto.yaml"],
                cwd=tmp, capture_output=True, text=True,
            )
        self.assertEqual(r.returncode, 0, r.stdout[-2000:] + r.stderr[-2000:])

    # --- Tarea 2: sensores ---
    def test_sensores_presentes(self):
        for id_ in ("t_aire", "hr_aire", "t_base", "t_centro", "t_tope",
                    "t_nucleo", "co2", "dt_nucleo_aire"):
            self.assertIsNotNone(sensor_por_id(self.cfg, id_), f"falta {id_}")

    def test_intervalo_maximo_60s(self):
        for s in self.cfg["sensor"]:
            if "update_interval" in s:
                self.assertLessEqual(_segundos(s["update_interval"]), 60, s)

    def test_ema_en_nucleo(self):
        nucleo = sensor_por_id(self.cfg, "t_nucleo")
        ema = None
        for filtro in nucleo["filters"]:
            if isinstance(filtro, dict) and "exponential_moving_average" in filtro:
                ema = filtro["exponential_moving_average"]
        self.assertIsNotNone(ema, "t_nucleo sin exponential_moving_average")
        self.assertEqual(ema["alpha"], 0.1)

    def test_scd30_una_sola_compensacion(self):
        scd = plataformas(self.cfg, "scd30")[0]
        self.assertEqual(scd["altitude_compensation"], "2600m")
        self.assertNotIn("ambient_pressure_compensation", scd)

    def test_direcciones_ds18b20_distintas(self):
        sustituciones = self.cfg["substitutions"]
        direcciones = []
        for s in plataformas(self.cfg, "dallas_temp"):
            crudo = str(s["address"])
            if crudo.startswith("${"):
                crudo = sustituciones[crudo[2:-1]]
            direcciones.append(str(crudo).lower())
        self.assertEqual(len(direcciones), 4)
        self.assertEqual(len(set(direcciones)), 4, "dirección DS18B20 duplicada")

    def test_sensores_de_control_con_timeout(self):
        for id_ in ("t_aire", "t_nucleo"):
            filtros = sensor_por_id(self.cfg, id_)["filters"]
            timeouts = [f["timeout"] for f in filtros
                        if isinstance(f, dict) and "timeout" in f]
            self.assertTrue(timeouts, f"{id_} sin filtro timeout")
            self.assertLessEqual(_segundos(timeouts[0]["timeout"]), 120)

    def test_sin_humidificador_ni_control_co2(self):
        for dominio in ("switch", "climate", "humidifier", "fan", "output", "light"):
            texto = str(self.cfg.get(dominio, ""))
            self.assertNotIn("hr_aire", texto, dominio)
            self.assertNotIn("co2", texto, dominio)


if __name__ == "__main__":
    unittest.main()
