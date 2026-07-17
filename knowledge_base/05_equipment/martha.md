---
title: Martha Tent — Setup de Prototipo
category: equipment
load_priority: selective
last_reviewed: 2026-07-16
confidence: low
primary_sources:
  - Internal records
  - AC Infinity documentation
related_documents:
  - environmental_control.md
  - 04_facility/fruiting.md
  - 00_project/current_state.md
---

# Executive Summary
La Martha Tent 63" (Terra Fungus) está destinada a prototipado y validación. El último reporte (2026-06-29) la describía con control manual de HR; presencia, montaje y funcionamiento actuales requieren verificación de campo.

# Technical Details

## Especificaciones Martha Tent

| Parámetro | Valor |
|---|---|
| Modelo | Terra Fungus 63" |
| Dimensiones | ~160×60×155 cm (L×W×H) |
| Volumen aprox. | ~149 L |
| Luces | Integradas (verificar espectro) |
| Material | Malla + cubierta plástica |

## Rol Operativo

La Martha Tent funciona como:
- **Experimental platform:** Pruebas de nuevas especies o sustratos en escala controlada.
- **Prototype environment:** Validación de arquitecturas de control antes de escalado.
- **Validation platform:** Desarrollo de procedimientos ambientales transferibles a fruiting modules de mayor escala.

Data from Martha Tent experiments informs long-term decisions sobre environmental strategy para CLOUDLAB 844 y arquitectura futura.

## Equipos Reportados en Martha Tent — Verificar

| Equipo | Modelo | Estado |
|---|---|---|
| Humidificador | VIVOSUN H05 | Último reporte: modo manual; verificar |
| Sensores T/HR | Inkbird IBS-TH2 Plus ×2 | Último reporte: funcionales; verificar |
| Automatización | ESP32 previsto | Estado físico/configuración por verificar |

## VIVOSUN H05 — Notas Críticas
- Sensor integrado: **DESCARTADO** — sesgo de +30–35% HR.
- Siempre operar en **modo manual %** usando lectura de Inkbird como referencia.
- Tanque: 5L (~20h a plena carga). Verificar nivel diariamente.
- Agua: filtrada <30 ppm TDS es apta. No requiere destilada.
- Rol futuro posible: backup, solo si H05 y T7 se confirman físicamente y superan prueba funcional.

## Rutina Manual Provisional — Solo si el montaje se confirma

```
RUTINA DIARIA — MARTHA TENT (Sin Automatización)
1. Verificar lectura Inkbird (app BLE):
   - HR objetivo: 85–90%
   - T° objetivo: según especie activa
2. Si HR < 83%: encender H05 en modo manual
3. Si HR > 90%: apagar H05; verificar FAE
4. Verificar agua en H05 — rellenar si necesario
5. Inspección visual: pins, contaminación, estado general
6. Registrar en bitácora: HR, T°, observaciones
```

## Sensor Positioning & Redundant Sensing

Sensor placement in Martha Tent reflects principles of environmental monitoring applicable to larger fruiting modules:

- **SHT3x probe:** Positioned at mid-canopy height, inside protective shield to avoid direct humidifier spray.
- **SCD30:** Mounted in shielded enclosure with sampling tube inlet at vegetative layer height.
- **Redundant measurement:** Inkbird IBS-TH2 Plus as independent validation point — delta tolerance ±0.5°C / ±3% RH indicates sensor agreement.

These positioning principles transfer directly to environmental control documentation when larger modules are implemented. Ver: `environmental_control.md`.

## Plan de Upgrade — Martha Tent con ESP32
Después de confirmar recepción e inventario:
1. Instalar SHT3x + SCD30 en Martha Tent con posicionamiento validado.
2. Conectar T7 (reemplaza H05) a relay ESP32
3. Conectar H4 a relay ESP32
4. Flashear ESPHome y conectar a HA
5. Automatizar HR y FAE bajo parámetros de P. djamor

Resultados de este upgrade informarán el despliegue de automatización en CLOUDLAB 844.

# Best Practices
- Nunca confiar en el sensor integrado del H05 — siempre usar Inkbird como referencia.
- Revisar dos veces al día (mañana y tarde) mientras no haya automatización.
- Documentar cualquier desviación de parámetros con hora exacta.
- Mantener probe shields limpios — sedimento o biofilm distorsiona lecturas SHT3x.

# References
- VIVOSUN H05 manual.
- Inkbird IBS-TH2 Plus documentation.
- `environmental_control.md` — arquitectura general de sensores y control.
