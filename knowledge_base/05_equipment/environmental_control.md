---
title: Control Ambiental — ESP32 / ESPHome / Home Assistant
category: equipment
load_priority: selective
last_reviewed: 2026-08-23
confidence: medium
primary_sources:
  - ESPHome documentation
  - Home Assistant documentation
  - Internal design Setas de la Peña
  - Sensirion SCD30 and SHT3x technical documentation
  - 09_research/incubation_fruiting_chambers_2026.md
related_documents:
  - martha.md
  - 04_facility/fruiting.md
  - 00_project/current_state.md
---

# Executive Summary
La arquitectura prevista usa ESP32 con ESPHome por módulo y Home Assistant en RPi4 para supervisión. El estado físico y la configuración actuales requieren verificación; este documento define el diseño y el commissioning, no certifica que el sistema esté instalado.

# Core Principles
- ESP32 por carpa = autonomía local. HA = supervisión, no dependencia.
- Toda la electrónica (ESP32, relay, PSU) va FUERA de la carpa (IP67).
- Compensar altitud Tenjo (2600 m s.n.m.) en SCD30 — parámetro `altitude_compensation` en ESPHome.
- Banco de pruebas antes de producción — no instalar directamente en campo.
- Un sensor de control se declara representativo solo después de mapeo multipunto con carga real.
- Las protecciones críticas operan localmente aunque fallen Wi‑Fi o Home Assistant.
- **Automation augments observation.** Automation never replaces biological understanding.
- Cada módulo de control ambiental debe operar independientemente si supervisión central falla. Referencia: CANON, sección 7 — Automation Philosophy.

# Technical Details

## Arquitectura del Sistema

```
[SHT3x Sonda]──┐
[SCD30 CO₂]───┤
[Inkbird BLE]  │──► [ESP32 WROOM-32] ──► WiFi ──► [Home Assistant / RPi4]
               │         │
[T7 Humid.]───┤         ├──► [Relay 2ch] ──► T7 ON/OFF
[H4 Extract.]─┘         └──► [Relay 2ch] ──► H4 ON/OFF
```

## Sensores

### AC Infinity SHT3x (Sonda T/HR)
- Chip: Sensirion SHT3x
- Interfaz: I²C, dirección 0x44
- ESPHome component: `sht3xd`
- Precisión: ±0.2°C / ±2% RH
- Verificar pinout con multímetro antes de instalar
- Sin resistencias pull-up externas inicialmente

### Sensirion SCD30 (CO₂)
- Interfaz: I²C, dirección 0x61
- ESPHome component: `scd30`
- **Parámetro crítico:** `altitude_compensation: 2600` (Tenjo)
- Precisión: ±30 ppm + 3% del valor
- Calienta en ~2 min — dar tiempo antes de leer
- ESPHome ignora `altitude_compensation` si también se configura `ambient_pressure_compensation`; seleccionar un método y documentarlo.
- `automatic_self_calibration` no debe quedar implícita: desactivar hasta validar que el sensor ve periódicamente una referencia exterior conocida, o ejecutar calibración forzada con referencia trazable.
- Proteger de gotas y condensación sin encerrar en un volumen muerto.

### Inkbird IBS-TH2 Plus (BLE — Redundancia)
- No integrado en ESP32 ESPHome directamente
- App de teléfono para lectura
- Comparar vs SHT3x semanalmente (delta aceptable: ±0.5°C / ±3% HR)

## Variables Derivadas y Calidad del Dato

- Calcular punto de rocío y VPD del aire a partir de T/HR como variables diagnósticas.
- Marcar como inválidos los datos durante condensación, desconexión, calentamiento inicial o valores físicamente imposibles.
- Registrar ubicación del sensor, fecha de verificación, offset aplicado y referencia utilizada.
- No controlar por VPD hasta contar con temperatura superficial y validación biológica local.
- Conservar mínimo, máximo, duración fuera de banda y estado de actuadores; el promedio por sí solo oculta eventos críticos.

## Actuadores

### AC Infinity T7 (Humidificador)
- Control: relay simple ON/OFF
- Modo operativo: manual % (no usar sensor integrado H05 — descartado)
- Lógica ESPHome: ON si HR < (setpoint - 2%), OFF si HR > setpoint

### AC Infinity H4 (Extractor — FAE)
- Control: relay simple ON/OFF
- Caudal nominal máximo del fabricante: 212 CFM; no equivale al caudal instalado
- Control primario: CO₂, con límites de seguridad y una línea base definida durante commissioning
- No existe un ciclo fijo validado para producción

## Dimensionamiento y Commissioning de Ventilación

El CLOUDLAB 844 mide 120 × 120 × 200 cm: volumen aproximado **2,88 m³ / 101,7 ft³**. Para el objetivo provisional de 5–8 cambios de aire por hora:

`Q efectivo requerido (CFM) = ACH × volumen (ft³) / 60`

| Objetivo provisional | Caudal efectivo medio requerido |
|---|---:|
| 5 ACH | 8,5 CFM |
| 8 ACH | 13,6 CFM |

Con operación intermitente:

`ACH estimado = Q efectivo medido × duty_cycle × 60 / volumen`

donde `duty_cycle = tiempo ON / (tiempo ON + tiempo OFF)`. El caudal efectivo debe medirse en la instalación con filtros, ductos, curvas y compuertas; no debe sustituirse por los 212 CFM nominales del H4. El commissioning debe:

1. Medir caudal efectivo en al menos tres velocidades.
2. Confirmar mezcla de aire y ausencia de zonas muertas.
3. Registrar respuesta del CO₂ con cámara cargada.
4. Definir velocidad/línea base mínima y control por CO₂.
5. Verificar que la ventilación no saque HR del rango.
6. Mapear CO₂ y T/HR en entrada, salida, centro, varias alturas y esquina remota con cámara vacía y cargada.
7. Confirmar que el sensor permanente representa la exposición de los cuerpos fructíferos y no el aire recién impulsado o extraído.

Fuentes de ingeniería: [CDC — definición y fórmula de ACH](https://stacks.cdc.gov/view/cdc/157087/cdc_157087_DS1.pdf), [AC Infinity — CLOUDLAB 844](https://acinfinity.com/cloudlab-844-advance-grow-tent-4x4-thickest-poles-and-canvas-48-x-48-x-80/), [AC Infinity — CLOUDLINE H4](https://acinfinity.com/cloudline-h4-humidity-proof-inline-fan-4-with-speed-controller/).

## ESPHome — Configuración Base (P. djamor)

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
    automatic_self_calibration: false  # Activar solo si el protocolo de referencia se valida
    update_interval: 30s

switch:
  - platform: gpio
    name: "Martha01 Humidificador"
    pin: GPIO26
    id: relay_humidificador

  - platform: gpio
    name: "Martha01 Extractor"
    pin: GPIO27
    id: relay_extractor

# No fijar un intervalo de producción antes del commissioning.
# El control por CO2 y el failsafe se configuran después de medir caudal efectivo.
```

`automatic_self_calibration: false` evita que el algoritmo ASC asuma una referencia mínima inadecuada en una cámara que podría no alcanzar aire exterior conocido. La calibración forzada requiere exponer el sensor a una referencia fiable y documentar fecha/valor. Ver documentación oficial de ESPHome y Sensirion.

## Automatización Home Assistant

```yaml
# control_hr_martha01.yaml
automation:
  - alias: "Martha01 — Control HR"
    trigger:
      platform: numeric_state
      entity_id: sensor.martha01_humedad
      below: 83
    action:
      service: switch.turn_on
      target:
        entity_id: switch.martha01_humidificador

  - alias: "Martha01 — Apagar Humidificador"
    trigger:
      platform: numeric_state
      entity_id: sensor.martha01_humedad
      above: 90
    action:
      service: switch.turn_off
      target:
        entity_id: switch.martha01_humidificador
```

## Protección Física

| Componente | IP | Ubicación |
|---|---|---|
| TICONN (caja electrónica) | IP67 | Fuera de carpa |
| H4 extractor | IP65 | Puede ir dentro o fuera |
| SHT3x sonda | Acero inox | Dentro de carpa, protegida |
| SCD30 | IP30 | Dentro caja IP67 con tubo de muestreo |
| Prensaestopas | IP68 | Entradas TICONN |

Una caja IP67 no debe sellar al SCD30 respecto al aire que se quiere medir. El diseño de muestreo debe permitir intercambio representativo, evitar condensación y minimizar volumen muerto; validar el tiempo de respuesta del conjunto completo, no solo del sensor desnudo.

## Estados Seguros Locales

| Falla | Respuesta mínima local a validar |
|---|---|
| SHT3x inválido/desconectado | Apagar humidificador; conservar ventilación segura; alarmar |
| SCD30 inválido/desconectado | Pasar a línea base de ventilación validada; alarmar; no mantener último valor indefinidamente |
| Wi‑Fi/HA caído | Continuar límites locales e histórico temporal si es posible |
| Reinicio de ESP32 | Actuadores arrancan en estado seguro y respetan anti-ciclo corto |
| Condensación/fuga de agua | Cortar humidificación y proteger electrónica; inspección manual |
| Sobretemperatura | Desactivar calefacción, aumentar retirada de calor dentro de límites biológicos y alarmar |

## Plan de Validación (Banco de Pruebas)

```
1. Armar: ESP32 + SHT3x + SCD30 en mesa de trabajo
2. Flashear ESPHome, conectar a HA
3. Verificar dirección I²C (escáner: debe aparecer 0x44 y 0x61)
4. Operar 48–72h continuas → verificar estabilidad de lectura
5. Simular >85% HR en zona cerrada → confirmar lectura SHT3x
6. Probar relay T7 y relay H4 con comandos HA
7. Solo después de validación: instalar en Martha Tent
8. Repetir 48–72h con carga real y sensores temporales multipunto
9. Simular pérdida de Wi‑Fi, sensor inválido, reinicio y sobretemperatura
```

# Best Practices
- Nunca instalar código no probado en producción activa.
- Mantener backups de configuración ESPHome en repositorio (git o carpeta del proyecto).
- Documentar dirección GPIO de cada relay en etiqueta física en la caja.

# Common Failure Modes
| Problema | Causa | Solución |
|---|---|---|
| SHT3x no aparece en I²C | Pinout incorrecto o sin pull-ups | Verificar con multímetro; agregar 4.7kΩ |
| SCD30 lecturas erráticas | Sin compensación de altitud | Agregar `altitude_compensation: 2600` |
| Relay no activa | Pin GPIO incorrecto o relay activo bajo (LOW) | Verificar lógica de relay; invertir si necesario |
| ESP32 se desconecta de HA | WiFi inestable | Verificar señal WiFi en ubicación de caja |

# Open Questions
- ¿Cuántos ESP32 por RPi4 sin degradar HA? (Estimado: hasta 10–15 sin problema)
- ¿Sensor de fuga de agua necesario en zona electrónica?
- ¿Qué pin GPIO usar para relay en ESP32 ACEIRMC específico?

# References
- ESPHome Documentation. https://esphome.io
- Home Assistant Documentation. https://home-assistant.io
- Sensirion SCD30 Datasheet.
- AC Infinity T7 Manual.
- ESPHome. *SCD30 CO₂, Temperature and Relative Humidity Sensor*. https://esphome.io/components/sensor/scd30/
- ESPHome. *SHT3X-D Temperature+Humidity Sensor*. https://esphome.io/components/sensor/sht3xd/
- Sensirion. *SCD30 product specifications, interface description and field calibration note*. https://sensirion.com/products/catalog/SCD30
- Sensirion. *SHT3x datasheet and SHT/STS design-in guide*. https://sensirion.com/products/downloads
- `09_research/incubation_fruiting_chambers_2026.md`.
