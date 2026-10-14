"""Pruebas estructurales del firmware de la incubadora del piloto de shiitake.

Ejecutar:
    ESPHOME_BIN=<ruta a esphome> python3 -m unittest discover -s esphome -p "test_*.py" -v
"""

import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest

import yaml

AQUI = os.path.dirname(os.path.abspath(__file__))
RUTA_YAML = os.path.join(AQUI, "incubadora_piloto.yaml")
RUTA_SECRETOS = os.path.join(AQUI, "secrets.example.yaml")
# Valores de prueba para `esphome config`; NO son parámetros operativos.
VALORES_SOLO_PRUEBA = {"setpoint_c": "20.0", "histeresis_c": "0.5"}


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

    def _esphome_config(self, sustituciones=None):
        """Ejecuta `esphome config` sobre una copia del YAML con secretos de ejemplo."""
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(RUTA_YAML, os.path.join(tmp, "incubadora_piloto.yaml"))
            shutil.copy(RUTA_SECRETOS, os.path.join(tmp, "secrets.yaml"))
            cmd = [_esphome_bin()]
            for clave, valor in (sustituciones or {}).items():
                cmd += ["-s", clave, valor]
            cmd += ["config", "incubadora_piloto.yaml"]
            return subprocess.run(cmd, cwd=tmp, capture_output=True, text=True, timeout=600)

    @unittest.skipUnless(_esphome_bin(), "ESPHOME_BIN no apunta a un ejecutable: se omite `esphome config`")
    def test_esphome_config_valido(self):
        # Valores SOLO de prueba para validar la estructura: el YAML no trae setpoint
        # ni histéresis (los fija la especificación del lote).
        r = self._esphome_config(VALORES_SOLO_PRUEBA)
        self.assertEqual(r.returncode, 0, r.stdout[-2000:] + r.stderr[-2000:])

    @unittest.skipUnless(_esphome_bin(), "ESPHOME_BIN no apunta a un ejecutable: se omite `esphome config`")
    def test_esphome_config_rechaza_marcador_de_setpoint(self):
        # Sin especificación de lote (setpoint_c/histeresis_c son marcadores) la
        # configuración NO debe compilar: el piloto no arranca sin esa especificación.
        r = self._esphome_config()
        self.assertNotEqual(r.returncode, 0, "el marcador PENDIENTE_ESPECIFICACION_LOTE no debe validar")

    # ------------------------------------------------------------------
    # Tarea 2: sensores
    # ------------------------------------------------------------------
    def _sust(self, valor):
        """Resuelve `${nombre}` con las sustituciones del YAML."""
        sust = self.cfg.get("substitutions", {})
        return re.sub(r"\$\{(\w+)\}", lambda m: str(sust[m.group(1)]), str(valor))

    def _sensores_por_id(self):
        """Mapa id -> definición, incluyendo sensores anidados (temperature:, humidity:, co2:)."""
        encontrados = {}

        def visitar(nodo):
            if isinstance(nodo, dict):
                if "id" in nodo and ("filters" in nodo or "name" in nodo or "lambda" in nodo
                                     or "unit_of_measurement" in nodo):
                    encontrados[nodo["id"]] = nodo
                for v in nodo.values():
                    visitar(v)
            elif isinstance(nodo, list):
                for v in nodo:
                    visitar(v)

        visitar(self.cfg.get("sensor", []))
        return encontrados

    @staticmethod
    def _segundos(texto):
        m = re.fullmatch(r"\s*([\d.]+)\s*(ms|s|min|h)\s*", str(texto))
        assert m, f"intervalo no reconocido: {texto!r}"
        return float(m.group(1)) * {"ms": 0.001, "s": 1, "min": 60, "h": 3600}[m.group(2)]

    def test_sensores_presentes(self):
        ids = set(self._sensores_por_id())
        esperados = {"t_aire", "hr_aire", "t_base", "t_centro", "t_tope", "t_nucleo", "co2", "dt_nucleo_aire"}
        self.assertEqual(esperados - ids, set())

    def test_intervalo_maximo_60s(self):
        con_intervalo = 0
        for entrada in self.cfg["sensor"]:
            if "update_interval" in entrada:
                con_intervalo += 1
                self.assertLessEqual(self._segundos(self._sust(entrada["update_interval"])), 60, entrada)
        self.assertGreater(con_intervalo, 0)

    def test_ema_en_nucleo(self):
        filtros = self._sensores_por_id()["t_nucleo"]["filters"]
        ema = [f["exponential_moving_average"] for f in filtros
               if isinstance(f, dict) and "exponential_moving_average" in f]
        self.assertEqual(len(ema), 1)
        self.assertEqual(ema[0]["alpha"], 0.1)

    def test_scd30_una_sola_compensacion(self):
        scd = [e for e in self.cfg["sensor"] if e.get("platform") == "scd30"]
        self.assertEqual(len(scd), 1)
        self.assertEqual(scd[0]["altitude_compensation"], "2600m")
        self.assertNotIn("ambient_pressure_compensation", scd[0])
        self.assertNotIn("ambient_pressure_compensation_source", scd[0])

    def test_direcciones_ds18b20_distintas(self):
        dallas = [e for e in self.cfg["sensor"] if e.get("platform") == "dallas_temp"]
        direcciones = [str(self._sust(e["address"])).lower() for e in dallas]
        self.assertEqual(len(direcciones), 4)
        duplicadas = {d for d in direcciones if direcciones.count(d) > 1}
        self.assertFalse(duplicadas, f"dirección DS18B20 duplicada: {sorted(duplicadas)}")

    def test_sin_humidificador_ni_control_co2(self):
        for seccion in ("switch", "climate", "humidifier", "fan"):
            texto = json.dumps(self.cfg.get(seccion, []))
            self.assertIsNone(re.search(r"\b(hr_aire|co2)\b", texto), f"{seccion} usa HR o CO2 para control")

    def test_sensores_de_control_con_timeout(self):
        sensores = self._sensores_por_id()
        for id_ in ("t_aire", "t_nucleo"):
            filtros = sensores[id_]["filters"]
            tos = [f["timeout"] for f in filtros if isinstance(f, dict) and "timeout" in f]
            self.assertEqual(len(tos), 1, id_)
            self.assertEqual(tos[0]["timeout"], "120s", id_)
            self.assertIn(str(tos[0]["value"]).lower(), (".nan", "nan"), id_)


    # ------------------------------------------------------------------
    # Tarea 3: termostato, interbloqueo y alarmas
    # ------------------------------------------------------------------
    ALARMAS = ("alarma_sobretemp_nucleo", "alarma_dt_nucleo_aire", "alarma_sensor_invalido", "alarma_ventilador")

    def _climate(self, id_):
        for c in self.cfg.get("climate", []):
            if c.get("id") == id_:
                return c
        self.fail(f"no existe el climate {id_}")

    def _binary(self, id_):
        for b in self.cfg.get("binary_sensor", []):
            if b.get("id") == id_:
                return b
        self.fail(f"no existe el binary_sensor {id_}")

    def _on_boot(self):
        entradas = self.cfg["esphome"].get("on_boot", [])
        return entradas if isinstance(entradas, list) else [entradas]

    def test_termostato_usa_aire_y_arranca_apagado(self):
        self.assertEqual(self._climate("incubadora")["sensor"], "t_aire")
        acciones = [a for e in self._on_boot() for a in e.get("then", [])]
        control = [a["climate.control"] for a in acciones if isinstance(a, dict) and "climate.control" in a]
        self.assertTrue(
            any(c.get("id") == "incubadora" and c.get("mode") == "OFF" for c in control),
            "falta on_boot con climate.control mode OFF (caso límite 2)",
        )
        apagados = [a["switch.turn_off"] for a in acciones if isinstance(a, dict) and "switch.turn_off" in a]
        self.assertIn("rele_calefactor", apagados)

    def test_sin_setpoint_operativo_hardcodeado(self):
        marcador = self.cfg["substitutions"]["setpoint_c"]
        with self.assertRaises(ValueError):
            float(marcador)
        with self.assertRaises(ValueError):
            float(self.cfg["substitutions"]["histeresis_c"])
        with open(RUTA_YAML, encoding="utf-8") as f:
            texto = f.read()
        self.assertIsNone(
            re.search(r"default_target_temperature\w*:\s*[-+]?\d", texto),
            "default_target_temperature con número literal",
        )

    def test_umbrales_nucleo(self):
        self.assertRegex(self._binary("alarma_sobretemp_nucleo")["lambda"], r">\s*28(\.0*)?\b")
        self.assertRegex(self._binary("alarma_dt_nucleo_aire")["lambda"], r">\s*5(\.0*)?\b")

    def test_interbloqueo_apaga_calefactor(self):
        seguridad = [i for i in self.cfg["interval"] if "switch.turn_off" in json.dumps(i)]
        self.assertEqual(len(seguridad), 1)
        self.assertLessEqual(self._segundos(seguridad[0]["interval"]), 5)
        acc = seguridad[0]["then"][0]["if"]
        condicion = json.dumps(acc["condition"])
        for alarma in self.ALARMAS:
            self.assertIn(alarma, condicion)
        self.assertIn("or", acc["condition"], "las alarmas deben unirse con `or`")
        entonces = json.dumps(acc["then"])
        self.assertIn('"switch.turn_off": "rele_calefactor"', entonces)
        self.assertIn('"mode": "OFF"', entonces)  # reencendido solo por el operador

    def test_gracia_arranque_ventilador(self):
        # La gracia se mide con un indicador que se activa tras `fan_arranque_gracia_s`
        # desde el arranque (sin depender de millis(), que se reinicia a los 49 días).
        arranque = json.dumps(self._on_boot())
        self.assertIn("${fan_arranque_gracia_s}", arranque)
        indicador = re.search(r"id\((\w+)\)\s*=\s*true", arranque)
        self.assertIsNotNone(indicador, "on_boot no activa el indicador de gracia")
        lam = self._binary("alarma_ventilador")["lambda"]
        self.assertIn(indicador.group(1), lam)
        self.assertIn("${fan_min_rpm}", lam)
        # Antes de terminar la gracia la alarma no dispara (devuelve false).
        self.assertRegex(lam, r"if\s*\(\s*!\s*id\(" + indicador.group(1) + r"\)\s*\)\s*return\s+false")
        # Si el tacómetro es NaN o cae bajo el mínimo, después de la gracia, sí.
        self.assertIn("isnan", lam)

    def test_alarma_sensor_invalido(self):
        lam = self._binary("alarma_sensor_invalido")["lambda"]
        self.assertIn("t_aire", lam)
        self.assertIn("t_nucleo", lam)
        self.assertIn("isnan", lam)

    def test_ventilador_tacometro(self):
        rpm = self._sensores_por_id()["rpm_ventilador"]
        self.assertEqual(rpm["pin"]["number"], "${fan_pin}")
        self.assertTrue(rpm["pin"]["mode"]["pullup"])
        self.assertEqual(self._segundos(rpm["update_interval"]), 10)


if __name__ == "__main__":
    unittest.main()
