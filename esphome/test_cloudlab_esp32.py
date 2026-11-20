"""Pruebas estructurales del firmware de control de CLOUDLAB 844.

Cubre cloudlab_esp32.yaml (raíz del repo) y el paquete común
esphome/modulo-fructificacion.package.yaml. No prueban hardware.

Ejecutar:
    ESPHOME_BIN=<ruta a esphome> python3 -m unittest esphome/test_cloudlab_esp32.py -v
"""

import json
import math
import os
import re
import shutil
import subprocess
import tempfile
import unittest

import yaml

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
RUTA_NODO = os.path.join(RAIZ, "cloudlab_esp32.yaml")
RUTA_PAQUETE = os.path.join(AQUI, "modulo-fructificacion.package.yaml")
DIR_PUBLICADOR = os.path.join(RAIZ, "field-os-simulador", "setas-os", "telemetry-publisher")
RUTA_PUBLICACION = os.path.join(DIR_PUBLICADOR, "esphome-publish.package.yaml")
RUTA_SECRETOS = os.path.join(AQUI, "secrets.example.yaml")
RUTA_PERFILES = os.path.join(RAIZ, "field-os-simulador", "setas-os", "node-control-profiles.json")
RUTA_KB_CONTROL = os.path.join(RAIZ, "knowledge_base", "05_equipment", "environmental_control.md")
RUTA_PROTOCOLO = os.path.join(AQUI, "PROTOCOLO_BANCO_CLOUDLAB.md")

# Valores SOLO de prueba para `esphome config`; NO son consignas.
VALORES_SOLO_PRUEBA = {
    "heat_setpoint_c": "18.5",
    "histeresis_c": "0.5",
    "temp_max_c": "24.0",
    "consigna_id": "prueba@20261114T000000Z",
}

# Pines de arranque del ESP32 según ESPHome 2026.10.2
# (esphome/components/esp32/gpio_esp32.py: _ESP32_STRAPPING_PINS).
PINES_ARRANQUE = {0, 2, 5, 12, 15}
# GPIO14: pulso en arranque atribuido, NO verificado; GPIO16/17: UART2 del
# MH-Z19C (DOC-0026) y PSRAM en WROVER; 6-11 flash; 34-39 solo entrada.
PINES_EVITADOS = PINES_ARRANQUE | {14, 16, 17} | set(range(6, 12)) | set(range(34, 40))
PINES_CANDIDATOS = {18, 19, 25, 26, 27, 32, 33}
RELES = ("rele_luz", "rele_circulacion", "rele_calefaccion", "rele_reserva")


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


for _etiqueta in ("!secret", "!lambda", "!include", "!extend"):
    _Cargador.add_constructor(_etiqueta, lambda c, n, e=_etiqueta: _etiqueta_a_cadena(c, e, n))


def cargar_yaml(ruta):
    with open(ruta, encoding="utf-8") as f:
        return yaml.load(f, Loader=_Cargador)  # noqa: S506 - cargador seguro propio


def leer(ruta):
    with open(ruta, encoding="utf-8") as f:
        return f.read()


def _esphome_bin():
    ruta = os.environ.get("ESPHOME_BIN", "")
    return ruta if ruta and os.path.isfile(ruta) and os.access(ruta, os.X_OK) else None


def _segundos(valor):
    m = re.fullmatch(r"(\d+)\s*s", str(valor).strip())
    if not m:
        raise AssertionError(f"duración no reconocida: {valor!r}")
    return int(m.group(1))


class CloudlabYamlTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.nodo = cargar_yaml(RUTA_NODO)
        cls.pkg = cargar_yaml(RUTA_PAQUETE)
        cls.texto_nodo = leer(RUTA_NODO)
        cls.texto_pkg = leer(RUTA_PAQUETE)
        with open(RUTA_PERFILES, encoding="utf-8") as f:
            cls.perfil = json.load(f)["profiles"]["cloudlab_844"]

    def _switch(self, id_):
        for sw in self.pkg.get("switch", []):
            if sw.get("id") == id_:
                return sw
        self.fail(f"no existe el switch {id_}")

    def _sust(self, valor):
        sust = {**self.pkg.get("substitutions", {}), **self.nodo.get("substitutions", {})}
        return re.sub(r"\$\{(\w+)\}", lambda m: str(sust[m.group(1)]), str(valor))

    def _sensor(self, id_):
        for s in self.nodo["sensor"]:
            for clave in ("temperature", "humidity", "co2"):
                hijo = s.get(clave)
                if isinstance(hijo, dict) and hijo.get("id") == id_:
                    return hijo
        self.fail(f"no existe el sensor {id_}")

    def _binary(self, id_):
        for b in self.pkg.get("binary_sensor", []):
            if b.get("id") == id_:
                return b
        self.fail(f"no existe el binary_sensor {id_}")

    # --- Rótulo y estructura ---------------------------------------------
    def test_rotulo_banco_de_pruebas(self):
        for texto in (self.texto_nodo, self.texto_pkg):
            self.assertIn("STATUS: BANCO DE PRUEBAS / NO COMISIONADO", texto)

    def test_incluye_paquetes_de_control_y_publicacion(self):
        paquetes = self.nodo["packages"]
        self.assertEqual(paquetes["modulo"], "!include esphome/modulo-fructificacion.package.yaml")
        self.assertEqual(
            paquetes["publicacion"],
            "!include field-os-simulador/setas-os/telemetry-publisher/esphome-publish.package.yaml",
        )
        for ruta in (RUTA_PAQUETE, RUTA_PUBLICACION):
            self.assertTrue(os.path.isfile(ruta), ruta)

    def test_secretos_no_literales(self):
        valores = [
            self.nodo["wifi"]["ssid"], self.nodo["wifi"]["password"], self.nodo["wifi"]["ap"]["password"],
            self.nodo["api"]["encryption"]["key"], self.nodo["ota"][0]["password"],
        ]
        for v in valores:
            self.assertTrue(str(v).startswith("!secret "), v)
        secretos = cargar_yaml(RUTA_SECRETOS)
        for clave in ("wifi_ssid", "wifi_password", "ap_password", "api_encryption_key", "ota_password",
                      "setas_publisher_url", "setas_publisher_authorization"):
            self.assertIn(clave, secretos)

    # --- Relés -------------------------------------------------------------
    def test_reles_disparo_alto_arrancan_apagados_y_no_se_exponen(self):
        for id_ in RELES:
            sw = self._switch(id_)
            self.assertEqual(sw["platform"], "gpio", id_)
            self.assertEqual(sw["restore_mode"], "ALWAYS_OFF", id_)
            self.assertIs(sw["pin"]["inverted"], False, id_)
            self.assertIs(sw.get("internal"), True, f"{id_} no debe poder mandarse por la API")
            self.assertNotIn("name", sw, id_)
        sin_comentarios = re.sub(r"#.*", "", self.texto_nodo + self.texto_pkg)
        self.assertNotIn("RESTORE_DEFAULT_ON", sin_comentarios)
        self.assertNotIn("inverted: true", sin_comentarios)

    def test_pines_de_reles_seguros_y_distintos(self):
        pines = []
        for id_ in RELES:
            pin = self._sust(self._switch(id_)["pin"]["number"])
            m = re.fullmatch(r"GPIO(\d+)", pin)
            self.assertIsNotNone(m, pin)
            n = int(m.group(1))
            self.assertNotIn(n, PINES_EVITADOS, f"{id_}: GPIO{n}")
            self.assertIn(n, PINES_CANDIDATOS, f"{id_}: GPIO{n}")
            pines.append(n)
        self.assertEqual(len(set(pines)), len(pines))
        self.assertNotRegex(self.texto_nodo, r"relay_\w+_pin:\s*GPIO1[24]\b")

    def test_espejos_de_estado_solo_lectura(self):
        espejos = [b for b in self.pkg["binary_sensor"] if "(estado)" in str(b.get("name", ""))]
        self.assertEqual(len(espejos), 4)
        for b in espejos:
            self.assertEqual(b["platform"], "template")

    def test_sin_camino_de_escritura_a_reles(self):
        # Solo dos entradas del operador: permisos, no relés.
        plantillas = sorted(s["id"] for s in self.pkg["switch"] if s["platform"] == "template")
        self.assertEqual(plantillas, ["circulacion_continua", "habilitar_calefaccion"])
        for cfg in (self.nodo, self.pkg):
            for bloque in ("number", "select", "output", "fan", "light", "servo"):
                self.assertNotIn(bloque, cfg, bloque)
            api = cfg.get("api", {}) or {}
            self.assertNotIn("actions", api)
            self.assertNotIn("services", api)
        self.assertNotIn("http_request.get", self.texto_nodo + self.texto_pkg + leer(RUTA_PUBLICACION))
        nodo_switches = self.nodo.get("switch", [])
        self.assertEqual(nodo_switches, [], "los relés solo se declaran en el paquete")

    def test_humidificador_y_extractor_no_controlados(self):
        texto = (self.texto_nodo + self.texto_pkg).lower()
        ids = json.dumps([s.get("id") for s in self.pkg["switch"]]).lower()
        for prohibido in ("humid", "extract", "t7", "h4", "pwm", "ledc"):
            self.assertNotIn(prohibido, ids)
        self.assertNotRegex(texto, r"platform:\s*(ledc|gp8403|mcp4725)")
        self.assertIn("pendiente", texto)
        self.assertIn("cloudforge t7", texto)
        self.assertIn("cloudline h4", texto)

    # --- Sensor de control -------------------------------------------------
    def test_sensor_de_control_publica_nan_por_timeout(self):
        t = self._sensor("room_temp")
        filtros = t["filters"]
        self.assertEqual(len(filtros), 1, "sin media móvil: ignora NaN y prolonga valores viejos")
        self.assertTrue(math.isnan(float(filtros[0]["timeout"]["value"])))
        self.assertLessEqual(_segundos(self._sust(filtros[0]["timeout"]["timeout"])), 120)
        lam = self._binary("alarma_sensor_invalido")["lambda"]
        self.assertIn("std::isnan(id(room_temp).state)", lam)
        self.assertEqual(self.pkg["climate"][0]["sensor"], "room_temp")

    # --- Consignas sin valor por defecto -----------------------------------
    def test_consignas_son_marcadores(self):
        sust = self.pkg["substitutions"]
        for clave in ("heat_setpoint_c", "histeresis_c", "temp_max_c"):
            with self.assertRaises(ValueError, msg=clave):
                float(sust[clave])
        self.assertTrue(sust["consigna_id"].startswith("PENDIENTE"))
        self.assertIsNone(re.search(r"default_target_temperature\w*:\s*[-+]?\d", self.texto_pkg))
        # El techo se valida como número al configurar (analog_threshold).
        self.assertEqual(self._binary("alarma_sobretemp")["threshold"], "${temp_max_c}")

    def test_provisionales_no_promovidos(self):
        sust = {**self.pkg["substitutions"], **self.nodo["substitutions"]}
        for viejo in ("hr_min", "hr_max", "co2_max", "temp_min", "temp_max", "luz_on_hora_provisional"):
            self.assertNotIn(viejo, sust)
        self.assertEqual(sust["luz_on_hora"], "-1")
        self.assertEqual(sust["luz_off_hora"], "-1")
        self.assertNotRegex(self.texto_nodo, r"above:\s*92")

    # --- Histéresis y tiempos mínimos --------------------------------------
    def test_histeresis_y_tiempos_minimos_del_rele(self):
        clima = self.pkg["climate"][0]
        self.assertEqual(clima["heat_deadband"], "${histeresis_c}")
        self.assertEqual(clima["heat_overrun"], "${histeresis_c}")
        off = _segundos(self._sust(clima["min_heating_off_time"]))
        run = _segundos(self._sust(clima["min_heating_run_time"]))
        idle = _segundos(self._sust(clima["min_idle_time"]))
        self.assertEqual((off, run, idle), (300, 60, 30))
        # Fuente: plantilla de knowledge_base (DOC-0026).
        kb = leer(RUTA_KB_CONTROL)
        for linea in ("min_heating_off_time: 300s", "min_heating_run_time: 60s", "min_idle_time: 30s"):
            self.assertIn(linea, kb)

    # --- Arranque, interbloqueo y rehabilitación ---------------------------
    def test_arranque_apaga_y_estabiliza(self):
        boot = json.dumps(self.pkg["esphome"]["on_boot"])
        for id_ in RELES:
            self.assertIn(f'"switch.turn_off": "{id_}"', boot)
        self.assertIn('"mode": "OFF"', boot)
        self.assertIn("${arranque_estabilizacion_s}", boot)
        self.assertIn("arranque_ok", boot)
        glob = {g["id"]: g for g in self.pkg["globals"]}
        self.assertEqual(glob["arranque_ok"]["initial_value"], "false")
        self.assertNotEqual(glob["arranque_ok"].get("restore_value"), True)

    def test_interbloqueo_apaga_calefaccion_y_exige_rehabilitar(self):
        seguridad = [i for i in self.pkg["interval"] if i["interval"] == "5s"]
        self.assertEqual(len(seguridad), 1)
        acc = next(p["if"] for p in seguridad[0]["then"] if "if" in p and "or" in p["if"]["condition"])
        condicion = json.dumps(acc["condition"])
        for alarma in ("alarma_sensor_invalido", "alarma_sobretemp"):
            self.assertIn(alarma, condicion)
        entonces = json.dumps(acc["then"])
        self.assertIn('"switch.turn_off": "rele_calefaccion"', entonces)
        self.assertIn('"mode": "OFF"', entonces)
        self.assertIn('"switch.turn_off": "habilitar_calefaccion"', entonces)
        self.assertIn("arranque_ok", entonces)
        sino = json.dumps(acc["else"])
        self.assertIn("CLIMATE_MODE_HEAT", sino)
        self.assertIn("habilitar_calefaccion", sino)
        habilitar = self._switch("habilitar_calefaccion")
        self.assertEqual(habilitar["restore_mode"], "RESTORE_DEFAULT_OFF")
        self.assertIn("bloqueo_por_alarma", json.dumps(habilitar["on_turn_on"]))

    def test_calefactor_solo_con_circulacion_y_sin_alarmas(self):
        scripts = {s["id"]: s for s in self.pkg["script"]}
        arrancar = json.dumps(scripts["calefaccion_arrancar"])
        self.assertLess(arrancar.index("rele_circulacion"), arrancar.index('"switch.turn_on": "rele_calefaccion"'))
        for alarma in ("alarma_sensor_invalido", "alarma_sobretemp"):
            self.assertIn(alarma, arrancar)
        self.assertIn("CLIMATE_ACTION_HEATING", arrancar)

    def test_sin_reinicio_por_perdida_de_red(self):
        self.assertEqual(self.nodo["wifi"]["reboot_timeout"], "0s")
        self.assertEqual(self.nodo["api"]["reboot_timeout"], "0s")

    # --- Estado publicado --------------------------------------------------
    def test_estado_del_nodo_coincide_con_el_perfil(self):
        lam = next(json.dumps(i) for i in self.pkg["interval"] if "setas.node-status.v1" in json.dumps(i))
        reles = sorted(set(re.findall(r'relays\[\\"(\w+)\\"\]', lam)))
        alarmas = sorted(set(re.findall(r'alarms\.add\(\\"(\w+)\\"\)', lam)))
        self.assertEqual(reles, sorted(r["id"] for r in self.perfil["relays"]))
        self.assertEqual(alarmas, sorted(self.perfil["alarms"]))
        self.assertIn("setas_node_status", lam)
        self.assertIn("setas_node_status", leer(RUTA_PUBLICACION))
        gpio = {r["id"]: r["gpio"] for r in self.perfil["relays"]}
        nodo_sust = self.nodo["substitutions"]
        self.assertEqual(gpio["heat"], nodo_sust["relay_calefaccion_pin"])
        self.assertEqual(gpio["circulation"], nodo_sust["relay_circulacion_pin"])
        self.assertEqual(gpio["light"], nodo_sust["relay_luz_pin"])
        self.assertEqual(gpio["spare"], nodo_sust["relay_reserva_pin"])
        self.assertEqual(self.perfil["deviceId"], nodo_sust["sensor_device_id"])

    def test_scd30_compensado_declarado(self):
        self.assertEqual(self.nodo["substitutions"]["setas_co2_pressure_compensated"], "true")
        scd30 = next(s for s in self.nodo["sensor"] if s.get("platform") == "scd30")
        self.assertEqual(scd30["altitude_compensation"], "2600m")
        self.assertNotIn("ambient_pressure_compensation", scd30)

    def test_protocolo_de_banco_cubre_los_ensayos(self):
        texto = leer(RUTA_PROTOCOLO).lower()
        for tema in ("polaridad", "flotante", "desconect", "reinicio en caliente", "wifi", "tiempos mínimos",
                     "carpa vacía", "sin carga"):
            self.assertIn(tema, texto, tema)

    # --- ESPHome real (opcional) -------------------------------------------
    def _esphome_config(self, sustituciones=None):
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(RUTA_NODO, os.path.join(tmp, "cloudlab_esp32.yaml"))
            os.makedirs(os.path.join(tmp, "esphome"))
            shutil.copy(RUTA_PAQUETE, os.path.join(tmp, "esphome"))
            destino = os.path.join(tmp, "field-os-simulador", "setas-os", "telemetry-publisher")
            os.makedirs(destino)
            for nombre in os.listdir(DIR_PUBLICADOR):
                if nombre.endswith(".yaml"):
                    shutil.copy(os.path.join(DIR_PUBLICADOR, nombre), destino)
            shutil.copy(RUTA_SECRETOS, os.path.join(tmp, "secrets.yaml"))
            cmd = [_esphome_bin()]
            for clave, valor in (sustituciones or {}).items():
                cmd += ["-s", clave, valor]
            cmd += ["config", "cloudlab_esp32.yaml"]
            return subprocess.run(cmd, cwd=tmp, capture_output=True, text=True, timeout=600)

    @unittest.skipUnless(_esphome_bin(), "ESPHOME_BIN no apunta a un ejecutable: se omite `esphome config`")
    def test_esphome_config_valido_con_consignas_de_prueba(self):
        r = self._esphome_config(VALORES_SOLO_PRUEBA)
        self.assertEqual(r.returncode, 0, r.stdout[-3000:] + r.stderr[-3000:])
        # ESPHome avisa con WARNING si un pin es de arranque (strapping).
        self.assertIsNone(re.search(r"WARNING.*strapping", r.stdout + r.stderr, re.IGNORECASE))

    @unittest.skipUnless(_esphome_bin(), "ESPHOME_BIN no apunta a un ejecutable: se omite `esphome config`")
    def test_esphome_config_rechaza_sin_consignas(self):
        r = self._esphome_config()
        self.assertNotEqual(r.returncode, 0, "los marcadores PENDIENTE_* no deben validar")


if __name__ == "__main__":
    unittest.main()
