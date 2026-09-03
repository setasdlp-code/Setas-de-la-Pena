---
title: Control Ambiental — ESP32 / ESPHome / Home Assistant
document_id: DOC-0026
category: equipment
load_priority: selective
last_reviewed: 2026-09-03
confidence: high
primary_sources:
  - ESPHome documentation
  - Home Assistant documentation
  - Sensirion SHT4x and SCD30 documentation
  - EC Buying MH-Z19C NDIR documentation
  - Analog Devices DS18B20 documentation
  - Shi et al. 2026 (paper_026)
  - Internal design Setas de la Peña
related_documents:
  - martha.md
  - hardware_inventory_august_2026.md
  - ../04_facility/fruiting.md
  - ../04_facility/incubation.md
  - ../09_research/active_research_knowledge.md
  - ../09_research/incubation_module_engineering_review_2026-08-05.md
  - ../10_ai_workflows/OAP-0001-modular-incubation-validation.md
  - ../00_project/current_state.md
---

# Executive Summary

El sistema de automatización ambiental de Setas de la Peña usa ESP32 con ESPHome por módulo, con supervisión central en Home Assistant. Cada módulo debe ejecutar localmente sus funciones críticas aunque Home Assistant o la red fallen.

En fructificación, el sistema registra T/HR y CO₂ y acciona humidificación y extracción cuando la especificación del lote lo autoriza. En incubación, controla únicamente calefacción y circulación de aire; la HR es diagnóstica y no autoriza humidificación dentro de cajas con bolsas selladas.

# Core Principles

- ESP32 por módulo = autonomía local. Home Assistant = supervisión, históricos y alarmas.
- Toda la electrónica de potencia, PSU y relés queda fuera de la zona húmeda o dentro de gabinete adecuado.
- Banco de pruebas antes de producción.
- Ningún umbral biológico se hereda de otra especie, cepa o fase.
- Cada automatización declara sensor de control, banda, histéresis, límites, estado ante datos inválidos y comportamiento tras pérdida de energía.
- Las protecciones térmicas físicas funcionan sin ESP32, Wi‑Fi ni software.
- La instalación eléctrica debe revisarse frente al RETIE vigente y usar protección diferencial de alta sensibilidad cuando corresponda por condición húmeda o mojada.
- Referencia arquitectónica: CANON, sección 7 — Automation Philosophy.

# Technical Details

## Arquitectura General

```
[Sensores locales] ──► [ESP32 + ESPHome] ──► [Actuadores locales]
                              │
                              └── Wi‑Fi ──► [Home Assistant / históricos]
```

Home Assistant no debe cerrar el lazo de control térmico primario. Una pérdida de red no debe interrumpir la lectura local ni modificar el estado seguro definido para el módulo.

## Sensores

### SHT3x existente — fructificación y redundancia

- Interfaz I²C; dirección usual 0x44.
- Componente ESPHome: `sht3xd`.
- Verificar pinout antes de conectar.
- Mantener como sensor disponible si ya fue comprado y pasa comparación de banco.

### SHT45 / familia SHT4x — referencia para fructificación e incubación

- **Sonda Klanata SHT45 (Inox IP67):** Sonda con cuerpo cilíndrico de acero inoxidable microporoso y cable apantallado de 1,0 m. Sensor de referencia dentro de la carpa de fructificación CLOUDLAB 844. Interfaz I²C (0x44).
- **Sensirion SHT45 Breakouts (I²C):** Para monitoreo de aire en el módulo de incubación y banco de pruebas.
- Precisión de fábrica: ±1,0% RH y ±0,1 °C.
- Componente ESPHome: `sht4x`.
- Usar versión con membrana PTFE integrada o cuerpo inox poroso; una placa electrónica desnuda expuesta no es admisible en zona húmeda.
- El calentador interno del sensor se usa únicamente para ciclos documentados de secado/desorción tras condensación; no como calefacción del recinto.
- La HR dentro de las cajas de incubación con bolsas selladas es diagnóstica; no activa actuadores.

### DS18B20 — mapa térmico y telemetría de núcleo (Shi et al. 2026 — paper_026; ARK-012)

- Componente ESPHome: `dallas_temp` sobre bus `one_wire`.
- Resistencia pull-up de 4,7 kΩ entre 3,3 V y pin de datos.
- Usar dirección hexadecimal fija de cada sonda en el YAML (no indexación por orden de escaneo).
- **Mapa térmico:** Tres sondas para monitorear gradiente vertical (base, centro, superior).
- **Sonda de núcleo:** Una sonda inox de 100 mm insertada en el centro geométrico de un bloque representativo (lote indicador). Monitorea el calor metabólico acumulado; el firmware debe aplicar un filtro de media móvil ponderada (`exponential_moving_average` con $\alpha \approx 0,1$) para alertar si $T_{núcleo} > 28\ ^\circ\text{C}$ o si $\Delta T (núcleo - aire) > 5\ ^\circ\text{C}$.

### Sensores de CO₂ NDIR — Sensirion SCD30 y EC Buying MH-Z19C

#### Sensirion SCD30
- Interfaz I²C; dirección 0x61.
- Componente ESPHome: `scd30`.
- Estrategia de altitud: `altitude_compensation: 2600` (o corrección barométrica en tiempo real; nunca ambas sumadas).

#### EC Buying MH-Z19C
- Interfaz UART serial (pines hardware UART2: GPIO16 RX, GPIO17 TX).
- Componente ESPHome: `mhz19`.
- **Regla crítica CANON §7:** Desactivar calibración automática de línea base (`automatic_baseline_calibration: false`). El ciclo de cultivo fúngico nunca expone el sensor a 400 ppm exterior sostenido; el ABC activo corrompe la escala.
- **Factor de altitud para Tenjo:** A 2.600 m s.n.m. (~75 kPa vs 101,3 kPa al nivel del mar), la densidad molecular de gas es menor. La lectura de ppm óptico debe multiplicarse en ESPHome por un factor de calibración barométrica:
  $$f_{altitud} = \frac{1013,25\ \text{hPa}}{740\ \text{hPa}} \approx 1,369$$
- Trayecto de muestreo protegido de condensación directa mediante tubo desecante o cámara de mezcla.

### Inkbird IBS-TH2 Plus — redundancia
- Lectura Bluetooth independiente en campo. Comparación periódica contra SHT45 e informe de deriva.

## Actuadores de Fructificación

### AC Infinity CloudForge T7 — humidificación
- Control por relé o señal digital ON/OFF cuando el lote tenga banda y ciclo aprobados.
- Capacidad de 15 L con manguera de distribución flexible hacia la parte superior de la carpa.
- No usar la lectura del sensor integrado del H05 para lazo cerrado.

### AC Infinity Cloudline H4 IP65 — extracción / FAE
- Control ON/OFF o PWM. Caudal calibrado considerando contrapresión de ducto y menor densidad de aire en altitud.
- Sincronizado con lectura compensada de CO₂ y control de humedad.

## Actuadores de Incubación

### Malla Radiante QuietWarmth (90W, 120V) / PTC en Plenum
- Elemento de calentamiento de baja densidad de potencia superficial para evitar puntos calientes.
- Conectado a través de relé con aislamiento galvánico (módulo Hosyond).
- Interbloqueo obligatorio: termostato bimetálico de corte físico a 35 °C y fusible térmico independiente del microcontrolador.

### Ventilador de circulación

- Debe operar antes o simultáneamente con el PTC.
- Incluir señal de funcionamiento cuando sea posible: tacómetro, presostato o sensor de corriente.
- Un ventilador detenido debe bloquear la calefacción.
- La circulación interna no sustituye la ventilación necesaria para retirar calor y CO₂.

## ESPHome — Fructificación, Base de Instrumentación

```yaml
# setas_martha_01.yaml — ESP32 carpa 1

esphome:
  name: setas-martha-01
  friendly_name: Martha 01

esp32:
  board: esp32dev

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

api:
  encryption:
    key: !secret api_key

ota:
  password: !secret ota_password

i2c:
  sda: GPIO21
  scl: GPIO22
  scan: true

sensor:
  - platform: sht3xd
    temperature:
      name: "Martha01 Temperatura"
    humidity:
      name: "Martha01 Humedad"
    address: 0x44
    update_interval: 30s

  - platform: scd30
    co2:
      name: "Martha01 CO2"
    temperature:
      name: "Martha01 CO2 Temp"
    humidity:
      name: "Martha01 CO2 HR"
    altitude_compensation: 2600
    update_interval: 30s

switch:
  - platform: gpio
    name: "Martha01 Humidificador"
    pin: GPIO26
    id: relay_humidificador
    restore_mode: ALWAYS_OFF

  - platform: gpio
    name: "Martha01 Extractor"
    pin: GPIO27
    id: relay_extractor
    restore_mode: ALWAYS_OFF

# Si se implementa compensación por presión ambiente en SCD30,
# retirar `altitude_compensation` y documentar la fuente de presión.
# No añadir ciclos de FAE o HR hasta aprobar la especificación del lote.
```

## ESPHome — Prototipo de Incubación

Esta plantilla deja la calefacción apagada en cada arranque. La banda térmica se configura únicamente después de aprobar la especificación de cepa/lote y verificar las protecciones físicas.

```yaml
# setas_incubacion_prototipo_01.yaml

esphome:
  name: setas-incubacion-prototipo-01
  friendly_name: Incubacion Prototipo 01

esp32:
  board: esp32dev

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

api:
  encryption:
    key: !secret api_key

ota:
  password: !secret ota_password

i2c:
  sda: GPIO21
  scl: GPIO22
  scan: true

one_wire:
  - platform: gpio
    pin: GPIO4
    id: bus_incubacion

sensor:
  - platform: sht4x
    temperature:
      name: "Incubacion Aire Temperatura"
      id: t_aire_incubacion
    humidity:
      name: "Incubacion Aire HR"
    address: 0x44
    precision: High
    heater_max_duty: 0.0
    update_interval: 30s

  # Después de leer las direcciones en el log, crear tres entradas
  # `dallas_temp` con `one_wire_id: bus_incubacion` y dirección fija:
  # - base
  # - centro
  # - parte superior/carga
  # Registrar el offset medido de cada sonda; no inventar direcciones.

switch:
  - platform: gpio
    name: "Incubacion Calefactor"
    id: relay_calefactor
    pin: GPIO26
    restore_mode: ALWAYS_OFF

  - platform: gpio
    name: "Incubacion Ventilador"
    id: relay_ventilador
    pin: GPIO27
    restore_mode: ALWAYS_OFF

climate:
  - platform: thermostat
    name: "Incubacion Control Termico"
    id: control_termico_incubacion
    sensor: t_aire_incubacion
    min_heating_off_time: 300s
    min_heating_run_time: 60s
    min_idle_time: 30s
    startup_delay: true
    heat_action:
      - switch.turn_on: relay_ventilador
      - delay: 5s
      - switch.turn_on: relay_calefactor
    idle_action:
      - switch.turn_off: relay_calefactor
      - delay: 30s
      - switch.turn_off: relay_ventilador
    default_preset: Arranque seguro
    on_boot_restore_from: default_preset
    preset:
      - name: Arranque seguro
        default_target_temperature_low: !secret incubation_qualification_target_c
        mode: OFF
```

El archivo no incluye direcciones ficticias de DS18B20. Deben capturarse del log del equipo físico y fijarse antes del ensayo. `incubation_qualification_target_c` queda en `secrets.yaml` y no constituye un setpoint biológico aprobado.

## Interbloqueos y Estado Seguro

| Condición | Respuesta requerida |
|---|---|
| Arranque o retorno de energía | Calefactor OFF; control térmico en modo OFF |
| Sensor principal inválido o desconectado | Calefactor OFF y alarma |
| Ventilador detenido | Calefactor OFF por interbloqueo independiente cuando sea posible |
| Sobretemperatura de aire o placa | Corte por termostato físico; ESPHome solo registra/alarma |
| Wi‑Fi o Home Assistant ausente | Control local continúa con último modo explícitamente autorizado |
| Relé de control pegado | Termostato físico/fusible térmico limita el evento |
| Reinicio repetitivo del ESP32 | Calefactor permanece OFF por `restore_mode` y preset de arranque |
| Condensación en sensor o gabinete | Calefacción inhibida hasta inspección y secado |

## Automatización Home Assistant

En preproducción, Home Assistant registra sensores, muestra alarmas y permite pruebas manuales. No desplegar automatizaciones con umbrales heredados. Cada configuración aprobada debe declarar:

- especie, cepa, lote y fase;
- banda, histéresis y fuente de aprobación;
- sensor de control y sensores de verificación;
- condición de datos inválidos;
- límites físicos y de software;
- estrategia de compensación del SCD30;
- offsets y direcciones de sensores;
- versión, fecha y responsable;
- respuesta a pérdida de red y energía.

## Protección Física

| Componente | Requisito | Ubicación |
|---|---|---|
| Gabinete de electrónica | Grado adecuado al polvo/humedad real; prensaestopas y alivio de tensión | Fuera del módulo |
| ESP32, PSU y relés | Separados de condensación y del flujo caliente | Gabinete externo |
| Protección de circuito | Interruptor/protección dimensionada y RCD/GFCI cuando aplique conforme al RETIE | Tablero o alimentación del módulo |
| SHT45/SHT4x | Membrana PTFE o capuchón permeable; sin contacto directo con agua | Aire del módulo |
| DS18B20 | Sonda identificada y fijada sin crear punto de compresión en bolsa | Base/centro/tope |
| SCD30 | Protegido; muestreo que no atrape condensación | Temporal durante calificación |
| PTC y fusible térmico | Plenum adecuado, accesible para inspección y separado de materiales combustibles | Externo |

## Plan de Validación

```
1. Armar ESP32 + sensores sin actuadores energizados.
2. Verificar I²C y registrar direcciones 1-Wire.
3. Comparar SHT45 y DS18B20 durante 48–72 h en un mismo punto; registrar offsets.
4. Verificar membrana/capuchón del SHT45 y procedimiento posterior a condensación/HR extrema.
5. Seleccionar y documentar una sola estrategia de compensación del SCD30.
6. Probar desconexión de SHT45 y cada DS18B20.
7. Probar relés con carga segura y verificar `restore_mode: ALWAYS_OFF`.
8. Probar corte/retorno de energía: calefactor debe permanecer OFF.
9. Integrar ventilador y confirmar interbloqueo antes del PTC.
10. Ejecutar 72 h vacío y 72 h con masa simulada.
11. Verificar protección diferencial y revisión eléctrica aplicable.
12. Solo después: ciclo biológico piloto con mapa térmico y CO₂.
```

# Best Practices

- Nunca instalar código no probado en producción activa.
- Mantener configuraciones y `secrets.yaml` fuera de exposición pública.
- Etiquetar GPIO, relés, fusibles, sensores y dirección física.
- Registrar versión de firmware, offsets, compensaciones y fecha de cambio.
- No usar el calentador interno del SHT4x como control de condensación del módulo.
- Retener una configuración de referencia y repetir comparación después de reemplazar sensor, cable o firmware.

# Common Failure Modes

| Problema | Causa | Acción |
|---|---|---|
| SHT4x no aparece | Pinout, alimentación o bus I²C | Verificar cableado y escáner I²C |
| DS18B20 inestable | Falta de pull-up, cable largo o dirección no fijada | Instalar 4,7 kΩ y usar dirección física |
| Gradiente aparente pequeño | Offsets entre DS18B20 no medidos | Repetir comparación conjunta y corregir interpretación |
| Lectura HR alta tras condensación | Sensor mojado o creep por HR extrema | Retirar causa; aplicar recuperación documentada y comparar antes de reutilizar |
| SCD30 incoherente | Compensación duplicada o muestreo con condensación | Mantener una sola compensación y revisar trayecto de muestra |
| Relé activo al reinicio | Lógica invertida o `restore_mode` ausente | Corregir lógica y repetir prueba de corte |
| PTC energizado sin flujo | Interbloqueo inexistente | Desenergizar; no operar hasta instalar protección |
| ESP32 desconectado de HA | Wi‑Fi inestable | Mantener control local; corregir cobertura sin cambiar seguridad |

# Open Questions

- ¿Qué módulo físico SHT45 con membrana o capuchón protegido y disponible localmente pasa el banco de pruebas?
- ¿Qué método de confirmación de flujo se usará para el ventilador del PTC?
- ¿Qué potencia de PTC resulta de los ensayos vacío, carga simulada y carga biológica?
- ¿Qué límites físicos de temperatura se fijarán después de medir materiales y cepa?
- ¿Se mantendrá altitud fija o se integrará presión ambiente para el SCD30?

# References

- Shi, Y., et al. (2026). Modeling core substrate temperature dynamics and metabolic heat dissipation in mushroom solid-state cultivation using time-series EWMA. *Computers and Electronics in Agriculture*, 218, 108722. [paper_026]
- ESPHome Documentation: `sht4x`, `sht3xd`, `mhz19`, `one_wire`, `dallas_temp`, `scd30`, `thermostat` and GPIO switch components.
- Sensirion. SHT4x datasheet, revision 04/2025; SHT45 product specification; SCD30 documentation.
- Winsen Electronics / EC Buying. MH-Z19C NDIR CO2 module user's manual (v1.6).
- Analog Devices. DS18B20 product documentation.
- Home Assistant Documentation.
- AC Infinity CloudForge T7 and Cloudline H4 manuals.
- RETIE vigente, Resolución 40284 del 23 de junio de 2026.
- `../09_research/incubation_module_engineering_review_2026-08-05.md` — límites y justificación de ingeniería.

## Cálculo de Renovaciones de Aire con Operación Cíclica

Para ventilación intermitente en carpa o cámara:

$$\text{ACH}_{\text{estimado}} = \frac{Q_{\text{efectivo medido}} \times \text{duty\_cycle} \times 60}{V_{\text{cámara}}}$$

donde:
- $\text{duty\_cycle} = \frac{t_{\text{ON}}}{t_{\text{ON}} + t_{\text{OFF}}}$.
- El caudal efectivo requerido oscila entre 8,5 CFM y 13,6 CFM según especie, biomasa activa y densidad de carga, verificado siempre mediante lectura de CO₂ compensada barométricamente.
