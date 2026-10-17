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


if __name__ == "__main__":
    unittest.main()
