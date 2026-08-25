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
- Toda la electrónica (ESP32, relay, PSU) va FUERA de la carpa (caja estanca IP67).
- **Física de gases y altitud (Tenjo, 2.600 m s.n.m. / ~74 kPa):**
  - Para sensores NDIR sin registro interno de altitud como el `MH-Z19C`, aplicar en firmware el factor de compensación barométrica: `filters: - multiply: 1.369`.
  - **Desactivar obligatoriamente el autocalibrado (ABC):** `automatic_baseline_calibration: false`.
  - Para `SCD30`: configurar `altitude_compensation: 2600`.
- **Protección de relés electromecánicos (Hosyond):** Prohibido el control PID de alta frecuencia. Usar histéresis amplia y tiempo mínimo de reposo anti-ciclo corto (`min_idle_time: 120s`). En reinicio: `restore_mode: ALWAYS_OFF`.
- **Dinámica FAE:** El extractor H4 (212 CFM) debe regularse físicamente a velocidad 1–2 y operar en pulsos cortos para no colapsar la humedad en la carpa de 3 m³.
- Banco de pruebas en mesa (48–72h) antes de instalar en campo.
- Las protecciones críticas operan localmente aunque fallen Wi‑Fi o Home Assistant.
- **Automation augments observation.** La automatización asiste la consistencia; no sustituye el juicio biológico.

# Technical Details

## Arquitectura del Sistema

```
[SHT45 / SHT3x Sonda] (I²C) ──┐
[MH-Z19C CO₂] (UART) ─────────┤
[Inkbird BLE (Auditoría)] ────│──► [ESP32 WROOM-32] ──► WiFi ──► [Home Assistant / RPi4]
                              │         │
[T7 Humidificador] ───────────┤         ├──► [Relay Hosyond Ch1] ──► T7 ON/OFF
[H4 Extractor FAE] ───────────┘         └──► [Relay Hosyond Ch2] ──► H4 ON/OFF (Pulsos)
```

## Sensores

### Klanata SHT45 (Sonda T/HR Acero Inoxidable 304, IP67)
- Chip: Sensirion SHT45
- Interfaz: I²C, dirección 0x44 (3.3V)
- ESPHome component: `sht4x`
- Precisión: ±0.1°C / ±1.0% RH (alta precisión con resistencia a condensación)
- Ubicación: A la altura de los bloques, protegida de rocío directo del humidificador.
- Longitud máxima recomendada de cable I²C sin repetidor: ≤ 1.5 m.

### Sensirion SHT3x / AC Infinity (Sonda T/HR Secundaria)
- Chip: Sensirion SHT3x
- Interfaz: I²C, dirección 0x44
- ESPHome component: `sht3xd`
- Precisión: ±0.2°C / ±2% RH

### Winsen / EC Buying MH-Z19C (NDIR CO₂) — Sensor Principal
- Chip: MH-Z19C NDIR
- Interfaz: UART (TX/RX), 9600 baudios
- ESPHome component: `mhz19`
- Rango: 400–5.000 ppm (±50 ppm + 5% lectura)
- **Ajustes obligatorios Tenjo:**
  - `automatic_baseline_calibration: false` (evita que el sensor tome el ambiente de cultivo como 400 ppm exterior).
  - `filters: - multiply: 1.369` (ajuste por presión barométrica a 2.600 m s.n.m., $P_0/P_{Tenjo} = 101.3/74.0$).

### Sensirion SCD30 (NDIR CO₂ / T / HR — Alternativa I²C)
- Interfaz: I²C, dirección 0x61
- ESPHome component: `scd30`
- Parámetro crítico: `altitude_compensation: 2600`
- `automatic_self_calibration: false`

### Inkbird IBS-TH2 Plus (BLE — Verificación Cruzada y Auditoría)
- Conectividad Bluetooth independiente hacia app móvil.
- Utilizado para auditoría y validación semanal cruzada vs. SHT45 (delta aceptable: ≤ ±0.5°C / ≤ ±3% HR).

## Variables Derivadas y Calidad del Dato

- Calcular punto de rocío y VPD del aire a partir de T/HR como variables diagnósticas.
- Marcar como inválidos los datos durante condensación, desconexión, calentamiento inicial o valores físicamente imposibles.
- Registrar ubicación del sensor, fecha de verificación, offset aplicado y referencia utilizada.
- No controlar por VPD hasta contar con temperatura superficial y validación biológica local.
- Conservar mínimo, máximo, duración fuera de banda y estado de actuadores; el promedio por sí solo oculta eventos críticos.

## Actuadores y Potencia

### AC Infinity CloudForge T7 (Humidificador 15L)
- Control: Relay simple ON/OFF (Hosyond 2ch optoacoplado).
- Modo operativo: Manual % al 100% (el ESP32 gobierna los ciclos).
- Banda de histéresis: ON si HR < 83%, OFF si HR ≥ 89%.
- Calidad de agua: Filtrada / desmineralizada (< 30 ppm TDS) para evitar depósitos minerales en hongos y sensores.

### AC Infinity Cloudline H4 (Extractor FAE 4")
- Control: Relay simple ON/OFF conmutado en pulsos.
- Regulación física: Potenciómetro/controlador EC ajustado a **Velocidad 1 o 2**.
- Lógica: Pulsos de 30–45s cuando CO₂ > 800 ppm (o ciclo periódico de línea base). Previene el vaciado violento de humedad de la carpa de 3 m³. Objetivo óptimo de fructificación: 500–800 ppm.

### Malla Radiante QuietWarmth Float (Incubadora 100L)
- Potencia: 120V / 90W con placa difusora de aluminio y lámina dieléctrica.
- Control: Conmutación por relé con histéresis de 1.0°C (ON < 23.5°C, OFF ≥ 24.5°C) y `min_idle_time: 180s`.
- Seguridad: Fusible térmico bimetálico en serie (corte físico a > 32°C).

## Dinámica Térmica y Selección de Especies en Tenjo
- Noches en Tenjo: 6–10°C. Carpa CLOUDLAB 844 no aislada térmicamente.
- **Especies óptimas para arranque:** *Pleurotus ostreatus* (14–20°C) y *Hericium erinaceus* (15–20°C).
- *Pleurotus djamor* (20–28°C) requiere aislamiento o calefacción de ambiente si la temperatura de carpa desciende de 18°C.

## Dimensionamiento y Commissioning de Ventilación

El CLOUDLAB 844 mide 120 × 120 × 200 cm: volumen aproximado **3,02 m³ / 106,6 ft³**. Para el objetivo provisional de 5–8 cambios de aire por hora:

`Q efectivo requerido (CFM) = ACH × volumen (ft³) / 60`

| Objetivo provisional | Caudal efectivo medio requerido |
|---|---:|
| 5 ACH | 8,5 CFM |
| 8 ACH | 13,6 CFM |

### Compensación por Altitud (2,600 m s.n.m.) — CRÍTICO

Los ventiladores son máquinas de "volumen constante" — un ventilador de 100 CFM mueve 100 CFM tanto a nivel del mar como a 2,600m. **Sin embargo**, a 2,600m ese mismo volumen contiene ~26% menos masa de aire (menos O₂ entrando, menos masa de CO₂ siendo extraída).

**Factor de corrección por densidad:**

`CFM ajustado = CFM nivel del mar / (P_Tenjo / P_nivel_mar) = CFM / 0.74`

**Ejemplo práctico con pérdidas:**

| Parámetro | Cálculo |
|-----------|---------|
| ACH objetivo | 6 (medio del rango) |
| CFM nivel del mar | 106.6 × 6 / 60 = **10.7 CFM** |
| CFM ajustado altitud (÷0.74) | **14.4 CFM** |
| CFM con pérdidas (filtros/ductos, η=0.8) | **~18 CFM** |

**Equipo recomendado:** Ventiladores de flujo mixto con motor EC (serie **AC Infinity Cloudline** o clones). Silenciosos, alta presión estática, controlador de velocidad. Extraer aire (presión negativa) desde la parte superior.

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

## ESPHome — Configuración Base (Carpa CLOUDLAB 844 / Martha)

```yaml
# cloudlab_esp32.yaml — ESP32 Carpa CLOUDLAB 844

esphome:
  name: setas-cloudlab-01
  friendly_name: CLOUDLAB 01

esp32:
  board: esp32dev
  framework:
    type: arduino

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  reboot_timeout: 15min  # Mantiene lógica local si se cae el WiFi

api:
  encryption:
    key: !secret api_key

ota:
  password: !secret ota_password

# Bus I2C para sonda Klanata SHT45 (o Sensirion SHT3x)
i2c:
  sda: GPIO21
  scl: GPIO22
  scan: true
  frequency: 100kHz

# Bus UART para sensor NDIR MH-Z19C
uart:
  rx_pin: GPIO16
  tx_pin: GPIO17
  baud_rate: 9600

sensor:
  # Sonda principal T/HR SHT45 (Klanata IP67)
  - platform: sht4x
    temperature:
      name: "CLOUDLAB01 Temperatura"
      id: cloudlab_temp
    humidity:
      name: "CLOUDLAB01 Humedad"
      id: cloudlab_hum
    address: 0x44
    heater_max_duty_cycle: 0.0  # Usar solo si se detecta condensación persistente
    update_interval: 30s

  # Sensor NDIR CO2 MH-Z19C con compensación Tenjo (2.600 msnm)
  - platform: mhz19
    co2:
      name: "CLOUDLAB01 CO2"
      id: cloudlab_co2
      filters:
        - multiply: 1.369   # Factor barométrico: 101.3 kPa / 74.0 kPa
    temperature:
      name: "CLOUDLAB01 MHZ Temp"
    automatic_baseline_calibration: false  # OBLIGATORIO: Evita descalibración en cultivo
    update_interval: 30s

switch:
  # Relé Ch1: Humidificador CloudForge T7 (Modo 100% Manual conmutado)
  - platform: gpio
    name: "CLOUDLAB01 Humidificador"
    pin: GPIO26
    id: relay_humidificador
    restore_mode: ALWAYS_OFF  # Failsafe: Siempre apagado tras reinicio

  # Relé Ch2: Extractor Cloudline H4 (Velocidad física baja en potenciómetro)
  - platform: gpio
    name: "CLOUDLAB01 Extractor FAE"
    pin: GPIO27
    id: relay_extractor
    restore_mode: ALWAYS_OFF
```

`automatic_baseline_calibration: false` es obligatorio en el `MH-Z19C` para evitar que el algoritmo ABC asuma como 400 ppm el nivel más bajo de una cámara donde el micelio mantiene niveles elevados. El filtro `multiply: 1.369` compensa la menor densidad molecular por presión atmosférica a 2.600 m s.n.m. en Tenjo.

## Automatización Home Assistant (Supervisión y Control)

```yaml
# control_ambiental_cloudlab01.yaml
automation:
  - alias: "CLOUDLAB01 — Encender Humidificador"
    trigger:
      platform: numeric_state
      entity_id: sensor.cloudlab01_humedad
      below: 83
    action:
      service: switch.turn_on
      target:
        entity_id: switch.cloudlab01_humidificador

  - alias: "CLOUDLAB01 — Apagar Humidificador"
    trigger:
      platform: numeric_state
      entity_id: sensor.cloudlab01_humedad
      above: 89
    action:
      service: switch.turn_off
      target:
        entity_id: switch.cloudlab01_humidificador

  - alias: "CLOUDLAB01 — Alivio de CO2 por Pulsos"
    trigger:
      platform: numeric_state
      entity_id: sensor.cloudlab01_co2
      above: 850  # Óptimo fructificación: 500-800 ppm; alarma >1000 ppm
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.cloudlab01_extractor_fae
      - delay: "00:00:40"
      - service: switch.turn_off
        target:
          entity_id: switch.cloudlab01_extractor_fae
```

## Protección Física

| Componente | IP | Ubicación |
|---|---|---|
| TICONN (caja electrónica) | IP67 | Fuera de carpa |
| H4 extractor | IP65 | Fuera de carpa / línea de extracción |
| Klanata SHT45 sonda | IP67 Acero 304 | Dentro de carpa, protegida de spray |
| MH-Z19C | IP30 | Dentro caja estanca con puerto de muestreo protegido |
| Prensaestopas | IP68 | Entradas inferiores de caja TICONN |

## Estados Seguros Locales (Fail-Safe)

| Falla | Respuesta mínima local a validar |
|---|---|
| SHT45 inválido/desconectado | Apagar humidificador inmediatamente; mantener ventilación de línea base; generar alarma móvil. |
| MH-Z19C inválido/desconectado | Conmutar extractor a pulsos periódicos de línea base (ej. 30s cada 15 min); alarmar. |
| Wi‑Fi o Home Assistant caído | ESP32 continúa ejecutando control local autónomo con setpoints locales. |
| Reinicio de ESP32 | Actuadores inician en `ALWAYS_OFF` respetando tiempo anti-ciclo corto. |
| Fuga de agua / Condensación | Corte de humidificación y protección de electrónica; inspección manual. |
| Sobretemperatura en incubadora | Desconexión por relé y corte mecánico físico por fusible térmico bimetálico. |

## Plan de Validación (Banco de Pruebas)

```
1. Armar: ESP32 + SHT45 (I2C) + MH-Z19C (UART) + Relé Hosyond 2ch en mesa de trabajo.
2. Flashear ESPHome con compensación barométrica (x1.369) y ABC desactivado.
3. Verificar dirección I²C (0x44 para SHT45) y recepción de tramas UART (9600 baud).
4. Operar 48–72h continuas → verificar estabilidad de lectura sin drift.
5. Simular >85% HR en cámara de prueba → confirmar lectura SHT45.
6. Probar relay T7 y relay H4 con comandos locales y remotos.
7. Simular pérdida de Wi-Fi, desconexión de sensor y reinicio eléctrico; verificar estados seguros.
8. Solo tras validación: instalar en carpa CLOUDLAB 844.
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
