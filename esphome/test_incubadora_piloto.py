"""Pruebas estructurales del firmware de la incubadora del piloto de shiitake.

Ejecutar:
    ESPHOME_BIN=<ruta a esphome> python3 -m unittest discover -s esphome -p "test_*.py" -v
"""

import os
import shutil
import subprocess
import tempfile
import unittest

import yaml

AQUI = os.path.dirname(os.path.abspath(__file__))
RUTA_YAML = os.path.join(AQUI, "incubadora_piloto.yaml")
RUTA_SECRETOS = os.path.join(AQUI, "secrets.example.yaml")


class _Cargador(yaml.SafeLoader):
    """SafeLoader que devuelve cadenas para las etiquetas propias de ESPHome."""


def _etiqueta_a_cadena(cargador, sufijo, nodo):
    if isinstance(nodo, yaml.ScalarNode):
        valor = cargador.construct_scalar(nodo)
    elif isinstance(nodo, yaml.SequenceNode):
        valor = cargador.construct_sequence(nodo)
    else:
        valor = cargador.construct_mapping(nodo)
    return f"{sufijo} {valor}"


for _etiqueta in ("!secret", "!lambda", "!include"):
    _Cargador.add_constructor(
        _etiqueta,
        lambda c, n, e=_etiqueta: _etiqueta_a_cadena(c, e, n),
    )


def cargar_yaml(ruta: str) -> dict:
    """Carga un YAML de ESPHome; `!secret`, `!lambda` e `!include` quedan como cadenas."""
    with open(ruta, encoding="utf-8") as f:
        return yaml.load(f, Loader=_Cargador)  # noqa: S506 - cargador seguro propio


def _esphome_bin():
    ruta = os.environ.get("ESPHOME_BIN", "")
    return ruta if ruta and os.path.isfile(ruta) and os.access(ruta, os.X_OK) else None


class IncubadoraYamlTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cfg = cargar_yaml(RUTA_YAML)

    def _switch(self, id_):
        for sw in self.cfg.get("switch", []):
            if sw.get("id") == id_:
                return sw
        self.fail(f"no existe el switch {id_}")

    def test_carga_yaml(self):
        self.assertIsInstance(self.cfg, dict)
        for clave in ("esphome", "esp32", "wifi", "api", "ota", "logger"):
            self.assertIn(clave, self.cfg)

    def test_rele_arranca_apagado(self):
        self.assertEqual(self._switch("rele_calefactor")["restore_mode"], "ALWAYS_OFF")

    def test_secretos_no_literales(self):
        valores = {
            "wifi.ssid": self.cfg["wifi"]["ssid"],
            "wifi.password": self.cfg["wifi"]["password"],
            "api.encryption.key": self.cfg["api"]["encryption"]["key"],
            "ota[0].password": self.cfg["ota"][0]["password"],
        }
        for nombre, valor in valores.items():
            self.assertIsInstance(valor, str, nombre)
            self.assertTrue(valor.startswith("!secret "), f"{nombre} no es !secret: {valor!r}")

    @unittest.skipUnless(_esphome_bin(), "ESPHOME_BIN no apunta a un ejecutable: se omite `esphome config`")
    def test_esphome_config_valido(self):
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(RUTA_YAML, os.path.join(tmp, "incubadora_piloto.yaml"))
            shutil.copy(RUTA_SECRETOS, os.path.join(tmp, "secrets.yaml"))
            r = subprocess.run(
                [_esphome_bin(), "config", "incubadora_piloto.yaml"],
                cwd=tmp,
                capture_output=True,
                text=True,
                timeout=600,
            )
        self.assertEqual(r.returncode, 0, r.stdout[-2000:] + r.stderr[-2000:])


if __name__ == "__main__":
    unittest.main()
