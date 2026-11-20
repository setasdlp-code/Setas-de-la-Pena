"""Pruebas estructurales del firmware de la incubadora del piloto de shiitake.

Variante por aire (DEC-023): sin sondas DS18B20 de núcleo ni mapa térmico.

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
        esperados = {"t_aire", "hr_aire", "co2", "rpm_ventilador"}
        self.assertEqual(esperados - ids, set())
        # DEC-023: sin núcleo, sin mapa térmico y sin diferencia núcleo-aire.
        retirados = {"t_base", "t_centro", "t_tope", "t_nucleo", "dt_nucleo_aire"}
        self.assertEqual(retirados & ids, set())

    def test_intervalo_maximo_60s(self):
        con_intervalo = 0
        for entrada in self.cfg["sensor"]:
            if "update_interval" in entrada:
                con_intervalo += 1
                self.assertLessEqual(self._segundos(self._sust(entrada["update_interval"])), 60, entrada)
        self.assertGreater(con_intervalo, 0)

    def test_nucleo_y_mapa_declarados_sin_sensor(self):
        # Sustituye a la prueba de la EMA del núcleo: sin sonda, el núcleo y el
        # mapa térmico se declaran «sin sensor» con un texto fijo, nunca con un
        # número (DEC-023).
        textos = {t["id"]: t for t in self.cfg.get("text_sensor", [])}
        for id_ in ("estado_nucleo", "estado_mapa_termico"):
            self.assertIn(id_, textos)
            self.assertEqual(textos[id_]["platform"], "template")
            self.assertRegex(textos[id_]["lambda"], r'return\s*\{\s*"sin sensor"\s*\}\s*;')
        # Ningún sensor numérico se refiere al núcleo, al sustrato ni al bloque.
        for id_, nodo in self._sensores_por_id().items():
            texto = (id_ + " " + str(nodo.get("name", ""))).lower()
            self.assertIsNone(re.search(r"n[uú]cleo|sustrato|bloque|substrate|core", texto), id_)

    def test_scd30_una_sola_compensacion(self):
        scd = [e for e in self.cfg["sensor"] if e.get("platform") == "scd30"]
        self.assertEqual(len(scd), 1)
        self.assertEqual(scd[0]["altitude_compensation"], "2600m")
        self.assertNotIn("ambient_pressure_compensation", scd[0])
        self.assertNotIn("ambient_pressure_compensation_source", scd[0])

    def test_sin_dallas_ni_one_wire(self):
        # Sustituye a la prueba de direcciones DS18B20 distintas: sin sondas no
        # queda bus 1-Wire, plataforma dallas ni marcadores de dirección.
        self.assertNotIn("one_wire", self.cfg)
        self.assertNotIn("dallas", self.cfg)
        plataformas = {e.get("platform") for e in self.cfg["sensor"]}
        self.assertFalse(plataformas & {"dallas", "dallas_temp"}, plataformas)
        sust = self.cfg["substitutions"]
        self.assertFalse([k for k in sust if k.startswith("addr_")], "quedan direcciones DS18B20")
        self.assertNotIn("onewire_pin", sust)

    def test_sin_referencias_a_nucleo_en_la_logica(self):
        # Ninguna lambda, condición o acción usa t_nucleo, el mapa o sus alarmas.
        logica = json.dumps({k: self.cfg.get(k) for k in
                             ("sensor", "binary_sensor", "climate", "interval", "esphome", "switch")},
                            ensure_ascii=False)
        for patron in (r"t_nucleo", r"dt_nucleo", r"t_base", r"t_centro", r"t_tope",
                       r"alarma_sobretemp_nucleo", r"alarma_dt_nucleo_aire", r"dallas"):
            self.assertIsNone(re.search(patron, logica), patron)
        binarios = {b["id"] for b in self.cfg["binary_sensor"]}
        self.assertEqual(binarios, set(self.ALARMAS))

    def test_sin_humidificador_ni_control_co2(self):
        for seccion in ("switch", "climate", "humidifier", "fan"):
            texto = json.dumps(self.cfg.get(seccion, []))
            self.assertIsNone(re.search(r"\b(hr_aire|co2)\b", texto), f"{seccion} usa HR o CO2 para control")

    def test_sensores_de_control_con_timeout(self):
        sensores = self._sensores_por_id()
        for id_ in ("t_aire",):
            filtros = sensores[id_]["filters"]
            tos = [f["timeout"] for f in filtros if isinstance(f, dict) and "timeout" in f]
            self.assertEqual(len(tos), 1, id_)
            self.assertEqual(tos[0]["timeout"], "120s", id_)
            self.assertIn(str(tos[0]["value"]).lower(), (".nan", "nan"), id_)


    # ------------------------------------------------------------------
    # Tarea 3: termostato, interbloqueo y alarmas
    # ------------------------------------------------------------------
    ALARMAS = ("alarma_sensor_invalido", "alarma_ventilador", "alarma_sobretemp_aire")

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

    def test_umbral_absoluto_del_aire(self):
        # Sustituye a los umbrales de núcleo: el único límite de temperatura es el
        # absoluto del aire, provisional (28 °C, sin banda de lote).
        lam = self._sust(self._binary("alarma_sobretemp_aire")["lambda"])
        self.assertRegex(lam, r"id\(t_aire\)\.state\s*>\s*28(\.0*)?\b")

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
        # Variante por aire: la ausencia de núcleo NO es alarma; solo el sensor de
        # control inválido lo es.
        lam = self._binary("alarma_sensor_invalido")["lambda"]
        self.assertRegex(lam, r"std::isnan\(\s*id\(t_aire\)\.state\s*\)")
        self.assertNotIn("nucleo", lam)
        self.assertEqual(re.findall(r"id\((\w+)\)", lam), ["t_aire"])

    def test_ventilador_tacometro(self):
        rpm = self._sensores_por_id()["rpm_ventilador"]
        self.assertEqual(rpm["pin"]["number"], "${fan_pin}")
        self.assertTrue(rpm["pin"]["mode"]["pullup"])
        self.assertEqual(self._segundos(rpm["update_interval"]), 10)

    # ------------------------------------------------------------------
    # Correcciones de la revisión final (reconciliadas)
    # ------------------------------------------------------------------
    def test_sin_reinicio_por_perdida_de_red(self):
        # ESPHome reinicia el ESP32 tras 15 min sin Home Assistant por defecto, y
        # cada reinicio apaga el termostato: el control debe seguir sin red.
        self.assertEqual(self.cfg["api"]["reboot_timeout"], "0s")
        self.assertEqual(self.cfg["wifi"]["reboot_timeout"], "0s")

    def test_reanudacion_tras_corte_sin_intervencion(self):
        # Spec §7: tras un corte el sistema retoma el control sin intervención.
        glob = next(g for g in self.cfg["globals"] if g["id"] == "arranque_ok")
        self.assertEqual(glob["initial_value"], "false")
        self.assertNotEqual(glob.get("restore_value"), True)
        habilitar = self._switch("habilitar_calefaccion")
        self.assertEqual(habilitar["restore_mode"], "RESTORE_DEFAULT_OFF")
        boot = json.dumps(self._on_boot())
        self.assertIn("${arranque_estabilizacion_s}", boot)
        self.assertIn("arranque_ok", boot)
        seguridad = json.dumps([i for i in self.cfg["interval"] if i["interval"] == "5s"])
        for clave in ("arranque_ok", "habilitar_calefaccion", "CLIMATE_MODE_HEAT"):
            self.assertIn(clave, seguridad)

    def test_heat_action_condicionada_a_alarmas(self):
        accion = json.dumps(self._climate("incubadora")["heat_action"])
        for alarma in self.ALARMAS:
            self.assertIn(alarma, accion)

    def test_alarma_sobretemp_aire(self):
        lam = self._binary("alarma_sobretemp_aire")["lambda"]
        self.assertIn("id(t_aire).state", lam)
        self.assertIn("${aire_max_c}", lam)
        self.assertEqual(self.cfg["substitutions"]["aire_max_c"], "28.0")

    def test_indicador_local_de_alarma(self):
        led = self._switch("indicador_alarma")
        self.assertEqual(led["restore_mode"], "ALWAYS_OFF")
        self.assertIn("indicador_alarma", json.dumps(self.cfg["interval"]))

    # ------------------------------------------------------------------
    # DEC-023: variante por aire y módulo de relés de disparo alto
    # ------------------------------------------------------------------
    def test_rotulo_banco_y_referencia_a_dec_023(self):
        with open(RUTA_YAML, encoding="utf-8") as f:
            cabecera = f.read(3000)
        self.assertIn("BANCO DE PRUEBAS / NO COMISIONADO", cabecera)
        self.assertIn("DEC-023", cabecera)
        self.assertIn("no comisionado", self.cfg["esphome"]["comment"])

    def test_identidad_del_nodo(self):
        self.assertEqual(self.cfg["substitutions"]["device_name"], "setas-incubacion-01")
        self.assertEqual(self.cfg["esphome"]["name"], "${device_name}")

    def test_rele_disparo_alto(self):
        self.assertEqual(self.cfg["substitutions"]["relay_active_low"], "false")
        pin = self._switch("rele_calefactor")["pin"]
        self.assertEqual(self._sust(pin["inverted"]), "false")
        self.assertEqual(self._sust(pin["number"]), "GPIO26")

    # Pines del ESP32 clásico que no deben usarse: arranque (lista de ESPHome
    # 2026.10.2, esp32/gpio_esp32.py), UART0, flash SPI y solo-entrada.
    PINES_ARRANQUE = {0, 2, 5, 12, 15}
    PINES_PROHIBIDOS = PINES_ARRANQUE | {1, 3} | set(range(6, 12)) | set(range(34, 40))

    def test_gpio_no_son_de_arranque_ni_flash(self):
        sust = self.cfg["substitutions"]
        usados = {}
        for clave in ("relay_heater_pin", "sda_pin", "scl_pin", "fan_pin", "alarm_led_pin"):
            m = re.fullmatch(r"GPIO(\d+)", sust[clave])
            self.assertIsNotNone(m, clave)
            usados[clave] = int(m.group(1))
        self.assertEqual(len(set(usados.values())), len(usados), f"GPIO repetido: {usados}")
        for clave, n in usados.items():
            self.assertNotIn(n, self.PINES_PROHIBIDOS, f"{clave}=GPIO{n}")
        # Los actuadores deben ser pines capaces de salida.
        for clave in ("relay_heater_pin", "alarm_led_pin"):
            self.assertLess(usados[clave], 34, clave)

    def test_protecciones_conservadas(self):
        # Resumen de lo que DEC-023 dice que no cambia, en una sola prueba.
        cfg = self.cfg
        self.assertEqual(cfg["wifi"]["reboot_timeout"], "0s")
        self.assertEqual(cfg["api"]["reboot_timeout"], "0s")
        self.assertEqual(self._switch("rele_calefactor")["restore_mode"], "ALWAYS_OFF")
        self.assertEqual(self._switch("indicador_alarma")["restore_mode"], "ALWAYS_OFF")
        boot = json.dumps(self._on_boot())
        self.assertIn('"switch.turn_off": "rele_calefactor"', boot)
        self.assertIn('"mode": "OFF"', boot)
        self.assertIn("${arranque_estabilizacion_s}", boot)
        self.assertIn("${fan_arranque_gracia_s}", boot)
        self.assertIn("timeout", json.dumps(self._sensores_por_id()["t_aire"]["filters"]))
        self.assertIn("${aire_max_c}", self._binary("alarma_sobretemp_aire")["lambda"])
        self.assertIn("rpm_ventilador", self._binary("alarma_ventilador")["lambda"])
        # Rehabilitación manual: tras una alarma (pasada la estabilización) el
        # interval apaga la habilitación; nada en el firmware la vuelve a encender.
        seguridad = cfg["interval"][0]["then"][0]["if"]
        self.assertIn('"switch.turn_off": "habilitar_calefaccion"', json.dumps(seguridad["then"]))
        todo = json.dumps(cfg)
        self.assertNotIn('"switch.turn_on": "habilitar_calefaccion"', todo)
        self.assertIsNone(re.search(r"habilitar_calefaccion\)\.(turn_on|publish_state)", todo))


if __name__ == "__main__":
    unittest.main()
