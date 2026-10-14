# Piloto de shiitake: control de temperatura de la incubadora — Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDO: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`).

**Objetivo:** entregar el firmware ESPHome de la incubadora del piloto, el analizador de sus registros y los documentos de campo (especificación de lote y protocolo de ensayos) que permiten validar el diseño antes de inocular.

**Arquitectura:** un archivo ESPHome autónomo por incubadora (el lazo de control y las protecciones de software viven en el ESP32, sin depender de Home Assistant). Un script Python evalúa los registros exportados contra los criterios de éxito del diseño. Los documentos van en `knowledge_base/06_operations/`. Las protecciones físicas y la instalación eléctrica son trabajo de Sebastián en sitio y no son código: el protocolo de la Tarea 5 las lista como compuertas.

**Tecnología:** ESPHome (YAML), Python 3 con `unittest` y PyYAML, Markdown del KB.

**Spec:** `docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md` (aprobada).

## Restricciones globales

Se aplican a todas las tareas. Los valores se copian de la spec.

- Control local en ESP32 con ESPHome. Home Assistant solo supervisa y guarda históricos. Si falla la red o Home Assistant, el control sigue funcionando.
- El relé del calefactor arranca en OFF y el termostato arranca apagado tras cualquier reinicio o corte de energía.
- La incubadora no controla humedad ni CO₂. HR y CO₂ solo se registran como diagnóstico.
- Alerta de núcleo: temperatura de núcleo > 28 °C o diferencia núcleo–aire > 5 °C. Filtro de media móvil exponencial con α ≈ 0,1 sobre la sonda de núcleo.
- Registro local cada 60 s como máximo.
- SCD30: una sola estrategia de compensación, altitud fija de 2600 m. No combinar con presión ambiente.
- Sensor inválido, ventilador detenido o sobretemperatura apagan el calefactor y generan alarma.
- No hay setpoint aprobado. La banda y la histéresis salen de una especificación de lote versionada, definida a partir de la cepa. Ningún archivo de este plan fija un setpoint operativo.
- Criterios de éxito (provisionales): ΔT entre base, centro y parte superior ≤ 2 °C durante ≥ 95 % de los intervalos; núcleo ≤ 28 °C; diferencia núcleo–aire ≤ 5 °C.
- Rama de trabajo nueva a partir de `kb/inventario-cable-calefactor-silicona`. Nunca se commitea en `main`. Commits en español, con el pie de atribución de la sesión.
- Los cambios al KB actualizan `knowledge_base/CHANGELOG.md` y pasan `python3 scripts/quality/check_repository.py`.

## Revisión de casos límite

Cinco condiciones que la spec implica y ninguna prueba de tarea cubre por sí sola. Cada una tiene su prueba en la tarea dueña del código.

1. Un sensor deja de actualizar pero conserva su último valor (no devuelve NaN): el calefactor debe apagarse. Prueba en la Tarea 3.
2. Reinicio con el termostato restaurado en modo calefacción desde la memoria flash: debe arrancar apagado. Prueba en la Tarea 3.
3. El ventilador tarda en arrancar tras el encendido y el tacómetro marca cero un momento: el calefactor no debe oscilar ni quedar bloqueado para siempre. Prueba en la Tarea 3.
4. Dos DS18B20 con la misma dirección, o una dirección sin reemplazar: la configuración debe rechazarse, no asignar lecturas cruzadas. Prueba en la Tarea 2.
5. Registros con huecos, filas en blanco o decimales con coma: el analizador no debe dar un "pasa" con datos insuficientes. Prueba en la Tarea 4.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `esphome/incubadora_piloto.yaml` | Firmware de la incubadora: sensores, relé, termostato, interbloqueos y alarmas |
| `esphome/secrets.example.yaml` | Plantilla de secretos para validar la configuración (sin valores reales) |
| `esphome/test_incubadora_piloto.py` | Pruebas estructurales del YAML y validación con `esphome config` |
| `esphome/analyze_incubation_log.py` | `evaluate()` y CLI: evalúa un CSV de registro contra los criterios de éxito |
| `esphome/test_analyze_incubation_log.py` | Pruebas del analizador con datos sintéticos |
| `knowledge_base/06_operations/lote1_shiitake_especificacion_ambiental.md` | Plantilla versionada de la especificación del lote 1 |
| `knowledge_base/06_operations/piloto_shiitake_incubacion_protocolo.md` | Protocolo de las fases 0–4, ensayos de fallo, compuertas y hojas de registro |

Las pruebas se ejecutan con `ESPHOME_BIN=<ruta a esphome> python3 -m unittest discover -s esphome -p "test_*.py" -v`. Si `ESPHOME_BIN` no existe, las pruebas de `esphome config` se omiten con aviso, no pasan en silencio.

---

### Tarea 1: Esqueleto del firmware y validación de arranque seguro

**Archivos:**
- Crear: `esphome/incubadora_piloto.yaml`
- Crear: `esphome/secrets.example.yaml`
- Crear: `esphome/test_incubadora_piloto.py`

**Interfaces:**
- Produce: `esphome/incubadora_piloto.yaml` con los ids `rele_calefactor` (switch GPIO) y `incubadora` (climate thermostat), y las sustituciones de pines. Las tareas 2 y 3 añaden sensores y lógica a este mismo archivo.
- Produce: en `test_incubadora_piloto.py`, la función `cargar_yaml(ruta: str) -> dict` (PyYAML con constructores para `!secret`, `!lambda` e `!include` que devuelven cadenas) y la clase `IncubadoraYamlTest`. Las tareas 2 y 3 añaden métodos a esa clase.

- [ ] **Paso 0: Crear la rama.** `git switch -c feature/piloto-incubadora-esphome` desde `kb/inventario-cable-calefactor-silicona`.

- [ ] **Paso 1: Escribir la prueba que falla.** En `esphome/test_incubadora_piloto.py`, clase `IncubadoraYamlTest` con:
  - `test_carga_yaml`: `cargar_yaml("esphome/incubadora_piloto.yaml")` devuelve un `dict` con las claves `esphome`, `esp32`, `wifi`, `api`, `ota`, `logger`.
  - `test_rele_arranca_apagado`: el switch con id `rele_calefactor` tiene `restore_mode == "ALWAYS_OFF"`.
  - `test_secretos_no_literales`: `wifi.ssid`, `wifi.password`, `api.encryption.key` y `ota[0].password` son cadenas que empiezan por `!secret `.
  - `test_esphome_config_valido`: ejecuta `$ESPHOME_BIN config esphome/incubadora_piloto.yaml` con `secrets.example.yaml` copiado como `secrets.yaml` en un directorio temporal junto a una copia del YAML, y exige código de salida 0. Se omite con `skipUnless` si `ESPHOME_BIN` no apunta a un ejecutable.

- [ ] **Paso 2: Ejecutar y ver el fallo.** Comando: `ESPHOME_BIN=/tmp/claude-0/esphome-venv/bin/esphome python3 -m unittest esphome.test_incubadora_piloto -v`. Esperado: FAIL (no existe el YAML).

- [ ] **Paso 3: Crear el YAML y la plantilla de secretos.**
  - `esphome/incubadora_piloto.yaml`: `esphome.name: incubadora-piloto`, `esp32` placa `esp32dev` con framework `esp-idf`, `wifi`, `api` con cifrado, `ota`, `logger`, un `switch` GPIO `rele_calefactor` en `GPIO26` con `restore_mode: ALWAYS_OFF` e `inverted` controlado por la sustitución `relay_active_low` (valor inicial `"true"`; se confirma en el banco, el módulo Hosyond no está verificado), y un `climate` `thermostat` con id `incubadora` que usa el sensor de la Tarea 2. Como el sensor aún no existe, esta tarea declara solo el switch y los bloques de conectividad; el termostato se añade en la Tarea 3. Banner de cabecera: `STATUS: BANCO DE PRUEBAS / NO COMISIONADO`, igual que `cloudlab_esp32.yaml`.
  - `secrets.example.yaml`: claves `wifi_ssid`, `wifi_password`, `api_key` (base64 de 32 bytes), `ota_password`, con valores ficticios.

- [ ] **Paso 4: Ejecutar y ver que pasa.** Mismo comando. Esperado: 4 pruebas OK.

- [ ] **Paso 5: Commit.** `git add esphome && git commit -m "feat(esphome): esqueleto de la incubadora del piloto con relé en OFF al arrancar"`.

---

### Tarea 2: Sensores de temperatura, mapa térmico y CO₂ de diagnóstico

**Archivos:**
- Modificar: `esphome/incubadora_piloto.yaml`
- Modificar: `esphome/test_incubadora_piloto.py`

**Interfaces:**
- Consume: `cargar_yaml`, `IncubadoraYamlTest` (Tarea 1).
- Produce: sensores con estos ids: `t_aire` (SHT45, control), `hr_aire`, `t_base`, `t_centro`, `t_tope` (DS18B20), `t_nucleo` (DS18B20 con EMA α 0,1), `co2` (SCD30), y un sensor `dt_nucleo_aire` (plantilla, `t_nucleo - t_aire`). Sustituciones `addr_base`, `addr_centro`, `addr_tope`, `addr_nucleo` con marcadores distintos entre sí (`"0x0000000000000001"` a `"0x0000000000000004"`), que se reemplazan por las direcciones reales tras el escaneo en el banco.

- [ ] **Paso 1: Escribir las pruebas que fallan.** Métodos nuevos en `IncubadoraYamlTest`:
  - `test_sensores_presentes`: existen sensores con los ids de arriba.
  - `test_intervalo_maximo_60s`: todo sensor con `update_interval` lo tiene ≤ 60 s.
  - `test_ema_en_nucleo`: `t_nucleo` tiene el filtro `exponential_moving_average` con `alpha == 0.1`.
  - `test_scd30_una_sola_compensacion`: el SCD30 tiene `altitude_compensation == "2600m"` y no tiene `ambient_pressure_compensation`.
  - `test_direcciones_ds18b20_distintas`: las cuatro direcciones, ya resueltas las sustituciones, son distintas entre sí. Si dos coinciden, la prueba falla con "dirección DS18B20 duplicada" (caso límite 4). Que sigan siendo marcadores se vigila en el protocolo (Tarea 5), no en esta prueba.
  - `test_sin_humidificador_ni_control_co2`: ningún `switch`, `climate`, `humidifier` ni `fan` referencia `hr_aire` o `co2` como sensor de control.

- [ ] **Paso 2: Ejecutar y ver los fallos.**

- [ ] **Paso 3: Implementar.** Añadir al YAML `i2c` (SDA `GPIO21`, SCL `GPIO22`), `one_wire` plataforma `gpio` en `GPIO4`, el SHT45 con la plataforma `sht4x` (intervalo 30 s), cuatro `dallas_temp` con `address` tomada de las sustituciones, el SCD30 con `altitude_compensation: 2600m` y los sensores derivados. Los DS18B20 usan la dirección fija de la sustitución, nunca el índice de escaneo. Añadir `pullup` 4,7 kΩ como comentario de hardware (es resistencia física, no configuración).
  - Todo sensor de control (`t_aire`, `t_nucleo`) lleva `filters` con `timeout: 120s` y valor `.nan` para que un sensor congelado se vea como inválido (caso límite 1).

- [ ] **Paso 4: Ejecutar y ver que pasan.** Incluye `esphome config` válido.

- [ ] **Paso 5: Commit.** `feat(esphome): sensores de aire, mapa térmico, núcleo y CO₂ de diagnóstico`.

---

### Tarea 3: Termostato, interbloqueo con el ventilador y alarmas

**Archivos:**
- Modificar: `esphome/incubadora_piloto.yaml`
- Modificar: `esphome/test_incubadora_piloto.py`

**Interfaces:**
- Consume: ids de sensores de la Tarea 2 y `rele_calefactor` de la Tarea 1.
- Produce: `rpm_ventilador` (sensor `pulse_counter` en `GPIO25` con pull-up interno, 2 pulsos por vuelta, intervalo 10 s), `alarma_sobretemp_nucleo`, `alarma_dt_nucleo_aire`, `alarma_sensor_invalido`, `alarma_ventilador` (todos `binary_sensor` plantilla) y un `interval` de 5 s que apaga el calefactor ante cualquier alarma. Sustituciones `setpoint_c` y `histeresis_c` sin valor por defecto operativo, `fan_min_rpm: "500"` (valor mío, a validar en el banco) y `fan_arranque_gracia_s: "20"`.

- [ ] **Paso 1: Escribir las pruebas que fallan.** Métodos nuevos:
  - `test_termostato_usa_aire_y_arranca_apagado`: el climate `incubadora` usa `t_aire` como sensor y hay un `on_boot` que ejecuta `climate.control` con `mode: "OFF"` (caso límite 2).
  - `test_sin_setpoint_operativo_hardcodeado`: `setpoint_c` es un marcador no numérico (por ejemplo `"PENDIENTE_ESPECIFICACION_LOTE"`) y el YAML no contiene `default_target_temperature` con un número literal.
  - `test_umbrales_nucleo`: `alarma_sobretemp_nucleo` compara con `28` y `alarma_dt_nucleo_aire` con `5` en su lambda.
  - `test_interbloqueo_apaga_calefactor`: el `interval` de seguridad contiene `switch.turn_off: rele_calefactor` condicionado a la unión de las cuatro alarmas.
  - `test_gracia_arranque_ventilador`: `alarma_ventilador` usa `fan_arranque_gracia_s`, de modo que un tacómetro en cero durante el arranque no dispara la alarma antes de ese tiempo (caso límite 3).
  - `test_esphome_config_valido` sigue pasando.

- [ ] **Paso 2: Ejecutar y ver los fallos.**

- [ ] **Paso 3: Implementar.** Añadir el termostato `thermostat` (`min_heating_off_time`, `min_heating_run_time`, `heat_deadband` y `heat_overrun` tomados de `histeresis_c`), el `pulse_counter` del ventilador, los cuatro `binary_sensor` y el `interval`. `alarma_sensor_invalido` es verdadero si `t_aire` o `t_nucleo` es NaN. El `interval` apaga el calefactor y pone el climate en `OFF` ante cualquier alarma, y no lo vuelve a encender solo: requiere acción del operador. Esa elección de reencendido manual es mía.

- [ ] **Paso 4: Ejecutar y ver que pasan.**

- [ ] **Paso 5: Commit.** `feat(esphome): termostato, interbloqueo con el ventilador y alarmas de núcleo`.

---

### Tarea 4: Analizador de registros contra los criterios de éxito

**Archivos:**
- Crear: `esphome/analyze_incubation_log.py`
- Crear: `esphome/test_analyze_incubation_log.py`

**Interfaces:**
- Produce: `evaluate(rows: list[dict[str, str]], cobertura_minima: float = 0.9) -> dict` y un CLI `python3 esphome/analyze_incubation_log.py registro.csv`, que imprime el resultado como JSON.
- Columnas de entrada del CSV: `timestamp` (ISO 8601), `t_aire`, `t_base`, `t_centro`, `t_tope`, `t_nucleo`, `heater_on` (0 o 1). Se aceptan decimales con coma.
- Salida de `evaluate`: `{"intervalos_totales": int, "intervalos_validos": int, "cobertura": float, "criterios": {"dt_mapa": {...}, "nucleo_max": {...}, "dt_nucleo_aire": {...}}}`. Cada criterio lleva `valor`, `umbral` y `veredicto` en `{"pasa", "no_pasa", "insuficiente"}`.

- [ ] **Paso 1: Escribir las pruebas que fallan.** Pruebas con filas sintéticas:
  - `test_todo_dentro_de_limites_pasa`: 100 filas con ΔT de mapa ≤ 2 °C, núcleo en 26 °C y diferencia núcleo–aire de 3 °C devuelven `pasa` en los tres criterios.
  - `test_dt_mapa_umbral_95`: 94 de 100 intervalos con ΔT ≤ 2 °C da `no_pasa`; 95 de 100 da `pasa`.
  - `test_nucleo_sobre_28_no_pasa`: un intervalo con `t_nucleo` de 28,1 °C da `no_pasa` en `nucleo_max`.
  - `test_dt_nucleo_aire_sobre_5_no_pasa`: diferencia de 5,1 °C da `no_pasa`.
  - `test_filas_invalidas_no_cuentan_como_pasa`: con 50 % de filas en blanco o `nan`, la cobertura es 0,5 y los tres veredictos son `insuficiente`, nunca `pasa` (caso límite 5).
  - `test_decimal_con_coma`: `"22,5"` se interpreta como 22,5.
  - `test_cli_json`: ejecutar el CLI con un CSV temporal imprime un JSON con las claves `intervalos_totales`, `cobertura` y `criterios`.

- [ ] **Paso 2: Ejecutar y ver los fallos.** `python3 -m unittest esphome.test_analyze_incubation_log -v`. Esperado: FAIL (módulo inexistente).

- [ ] **Paso 3: Implementar `evaluate`.** Un intervalo es válido si los seis valores de temperatura son numéricos. El mapa térmico usa `max(base, centro, tope) - min(base, centro, tope)`. La cobertura es válidos / totales; si es menor que `cobertura_minima`, todos los veredictos son `insuficiente`. Los umbrales son 2, 28 y 5 °C, y 0,95 para la fracción del mapa.

- [ ] **Paso 4: Ejecutar y ver que pasan.**

- [ ] **Paso 5: Commit.** `feat(esphome): analizador de registros de incubación`.

---

### Tarea 5: Especificación del lote 1 y protocolo de ensayos

**Archivos:**
- Crear: `knowledge_base/06_operations/lote1_shiitake_especificacion_ambiental.md`
- Crear: `knowledge_base/06_operations/piloto_shiitake_incubacion_protocolo.md`
- Modificar: `knowledge_base/CHANGELOG.md`
- Modificar: `knowledge_base/CURRENT_OPERATIONS.md`

**Interfaces:**
- Consume: los ids y sustituciones de las Tareas 1 a 3 (para citar qué parámetro de la especificación alimenta qué sustitución) y el CLI de la Tarea 4 (para citar cómo se evalúan los registros).

- [ ] **Paso 1: Obtener el siguiente DOC id libre.** `grep -rhoE 'DOC-[0-9]{4}' knowledge_base | sort -u | tail -1`. Usar los dos siguientes. Copiar el front matter (`title`, `document_id`, `category: operations`, `load_priority`, `last_reviewed`, `confidence`) de `knowledge_base/06_operations/quality_control.md`.

- [ ] **Paso 2: Escribir la especificación del lote 1.** Plantilla versionada con campos vacíos y obligatorios: cepa (nombre y código), proveedor (Fungiilab) y lote de spawn, fecha de elaboración, clase térmica, requiere choque frío (sí o no), banda de temperatura de incubación, histéresis, dosis de inoculación, formulación y masa del bloque (2,0 kg), número de bloques (30), versión y fecha. Indica qué sustitución del YAML alimenta cada campo (`setpoint_c`, `histeresis_c`). Estado inicial: `PENDIENTE`, sin valores.

- [ ] **Paso 3: Escribir el protocolo.** Secciones: compuertas físicas previas (termostato bimetálico de 35 °C, fusible térmico, protección diferencial, revisión RETIE, medición de la resistencia de cada cable, DS18B20 comparadas 48–72 h, escaneo de direcciones y cobertura Wi‑Fi); fases 0 a 4 con duración y criterio de paso, copiadas de la sección 6 de la spec; ensayos de fallo de la fase 3 (sensor desconectado, ventilador detenido, corte y retorno de energía) con el resultado esperado "calefactor apagado"; cómo exportar el registro y evaluarlo con el CLI; plantilla de hoja de registro del lote (cepa, spawn, masa del bloque, fechas, contaminación, sensor). Citar la spec como fuente.

- [ ] **Paso 4: Actualizar `CHANGELOG.md` y `CURRENT_OPERATIONS.md`.** Entrada `[KB]` en la fecha de hoy con los dos documentos. En `CURRENT_OPERATIONS.md`, apuntar la especificación del lote 1 como pendiente en la sección "Especificación ambiental del lote 1".

- [ ] **Paso 5: Verificar.** `python3 scripts/quality/check_repository.py`. Esperado: `Quality gate passed`.

- [ ] **Paso 6: Commit.** `docs(kb): especificación del lote 1 y protocolo de ensayos del piloto de incubación`.

---

## Verificación final

- [ ] `ESPHOME_BIN=/tmp/claude-0/esphome-venv/bin/esphome python3 -m unittest discover -s esphome -p "test_*.py" -v`: todas las pruebas pasan.
- [ ] `python3 scripts/quality/check_repository.py`: pasa.
- [ ] `git push -u origin <rama>`. No se abre pull request sin que Sebastián lo pida.

## Fuera de este plan (trabajo en sitio, no código)

Instalación eléctrica, compra de DS18B20, termostato y fusible térmico, medición de resistencia de los cables, escaneo de direcciones DS18B20, definición de las aberturas pasivas, obtención de la cepa y los ensayos físicos. El protocolo de la Tarea 5 los ordena como compuertas.
