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

    # --- Tarea 3: termostato, interbloqueo y alarmas ---
    ALARMAS = ("alarma_sobretemp_nucleo", "alarma_dt_nucleo_aire",
               "alarma_sensor_invalido", "alarma_ventilador",
               "alarma_sobretemp_aire")

    def _binario(self, id_):
        return buscar(self.cfg["binary_sensor"], id=id_)

    def test_termostato_usa_aire_y_arranca_apagado(self):
        termostato = buscar(self.cfg["climate"], id="incubadora")
        self.assertIsNotNone(termostato, "falta el climate incubadora")
        self.assertEqual(termostato["sensor"], "t_aire")
        pasos = self.cfg["esphome"]["on_boot"]["then"]
        control = [p["climate.control"] for p in pasos if "climate.control" in p]
        self.assertTrue(any(c["id"] == "incubadora" and c["mode"] == "OFF"
                            for c in control), "on_boot no apaga el termostato")

    def test_sin_setpoint_operativo_hardcodeado(self):
        texto = str(self.cfg["climate"])
        self.assertNotIn("default_target_temperature", texto)
        self.assertNotIn("preset", texto)

    def test_umbrales_nucleo(self):
        self.assertIn("28", self._binario("alarma_sobretemp_nucleo")["lambda"])
        self.assertIn("5.0", self._binario("alarma_dt_nucleo_aire")["lambda"])

    def test_sensor_invalido_cubre_aire_y_nucleo(self):
        codigo = self._binario("alarma_sensor_invalido")["lambda"]
        self.assertIn("isnan(id(t_aire).state)", codigo)
        self.assertIn("isnan(id(t_nucleo).state)", codigo)

    def test_interbloqueo_apaga_calefactor(self):
        seguridad = [i for i in self.cfg["interval"] if i["interval"] == "5s"]
        self.assertEqual(len(seguridad), 1)
        paso = seguridad[0]["then"][0]["if"]
        condicion = str(paso["condition"])
        for alarma in self.ALARMAS:
            self.assertIn(alarma, condicion)
        acciones = str(paso["then"])
        self.assertIn("rele_calefactor", acciones)
        self.assertIn("switch.turn_off", acciones)

    def test_heat_action_condicionada_a_alarmas(self):
        accion = buscar(self.cfg["climate"], id="incubadora")["heat_action"]
        texto = str(accion)
        for alarma in self.ALARMAS:
            self.assertIn(alarma, texto)

    def test_ventilador_con_estabilizacion_de_arranque(self):
        codigo = self._binario("alarma_ventilador")["lambda"]
        self.assertIn("id(arranque_ok)", codigo)
        self.assertNotIn("millis", codigo)  # millis() se desborda cada ~49,7 días
        self.assertIn("${fan_min_rpm}", codigo)
        self.assertEqual(self.cfg["substitutions"]["fan_min_rpm"], "500")
        self.assertEqual(self.cfg["substitutions"]["arranque_estabilizacion_s"], "90")
        self.assertIsNotNone(sensor_por_id(self.cfg, "rpm_ventilador"))

    # --- Corrección tras la revisión final ---
    def test_sin_reinicio_por_perdida_de_red(self):
        # C1: ESPHome reinicia el ESP32 tras 15 min sin Home Assistant por defecto.
        self.assertEqual(self.cfg["api"]["reboot_timeout"], "0s")
        self.assertEqual(self.cfg["wifi"]["reboot_timeout"], "0s")

    def test_reanudacion_tras_corte_sin_intervencion(self):
        # I2: spec §7 — tras un corte el sistema retoma el control solo.
        glob = buscar(self.cfg["globals"], id="arranque_ok")
        self.assertIsNotNone(glob)
        self.assertEqual(glob["initial_value"], "false")
        self.assertNotEqual(glob.get("restore_value"), True)
        habilitar = buscar(self.cfg["switch"], id="habilitar_calefaccion")
        self.assertEqual(habilitar["restore_mode"], "RESTORE_DEFAULT_OFF")
        boot = str(self.cfg["esphome"]["on_boot"]["then"])
        self.assertIn("${arranque_estabilizacion_s}", boot)
        self.assertIn("arranque_ok", boot)
        seguridad = [i for i in self.cfg["interval"] if i["interval"] == "5s"][0]
        texto = str(seguridad)
        for clave in ("arranque_ok", "habilitar_calefaccion", "CLIMATE_MODE_HEAT"):
            self.assertIn(clave, texto)

    def test_alarma_sobretemp_aire(self):
        # I3: spec §5.3 y §7 — el aire sobre el límite apaga el calefactor.
        codigo = self._binario("alarma_sobretemp_aire")["lambda"]
        self.assertIn("id(t_aire).state", codigo)
        self.assertIn("${aire_max_c}", codigo)
        self.assertEqual(self.cfg["substitutions"]["aire_max_c"], "28.0")

    def test_indicador_local_de_alarma(self):
        # I4: spec §5.3 — indicador local en la incubadora.
        led = buscar(self.cfg["switch"], id="indicador_alarma")
        self.assertIsNotNone(led)
        self.assertEqual(led["restore_mode"], "ALWAYS_OFF")
        seguridad = [i for i in self.cfg["interval"] if i["interval"] == "5s"][0]
        self.assertIn("indicador_alarma", str(seguridad))


if __name__ == "__main__":
    unittest.main()
