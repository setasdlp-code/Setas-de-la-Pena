---
title: Instantánea Histórica del Proyecto — 2026-06-29
category: project
load_priority: selective
last_reviewed: 2026-07-16
confidence: historical
status: superseded
superseded_by: ../CURRENT_OPERATIONS.md
primary_sources:
  - Internal records
  - Amazon order history
related_documents:
  - mission.md
  - 05_equipment/environmental_control.md
  - 04_facility/master_blueprint.md
  - 09_research/unresolved_questions.md
---

# Executive Summary
Instantánea histórica de lo reportado el 2026-06-29. No debe usarse como estado actual: fechas estimadas de entrega y estados de equipos no fueron confirmados posteriormente. La fuente vigente es `CURRENT_OPERATIONS.md`.

# Core Principles
Este documento se conserva para trazabilidad histórica. No se actualiza ni gobierna operaciones actuales.

# Technical Details

## Fase Actual: Prototipado → Pre-Producción

### Infraestructura Activa
| Componente | Estado |
|---|---|
| Martha Tent 63" (Terra Fungus) | Activa — fructificadora prototipo |
| VIVOSUN H05 (humidificador) | Activo — modo manual (sensor integrado descartado) |
| Inkbird IBS-TH2 Plus ×2 | Activos — sensores referencia T/HR |
| Control HR | **Manual** hasta instalar T7 + relay |
| Automatización ESP32/ESPHome | **Diseñada, no instalada** — pendiente banco de pruebas |

### Equipo en Tránsito (Amazon)
| Equipo | Llegada Estimada |
|---|---|
| AC Infinity CloudForge T7 | ~28 jun 2026 |
| AC Infinity SHT3x ×2 | ~28 jun 2026 |
| ESP32-WROOM-32 ×3 | ~28 jun 2026 |
| Sensirion SCD30 ×2 | ~28 jun 2026 |
| TICONN IP67 ×2 | ~28 jun 2026 |
| AC Infinity CLOUDLAB 844 | ~6 jul 2026 |
| AC Infinity Cloudline H4 ×2 | 3–18 jul 2026 |

**Total invertido fase producción: US$869.69**

### Pendiente de Comprar
- Fusibles ATC/ATO (1A, 2A, 3A)
- Recinto PIR/PUR ~2.5×2.5×2.2m (cotizar FrigoMaster)
- Calefactor cerámico PTC para recinto

## Especies
| Especie | Estado |
|---|---|
| P. djamor | **Prioridad #1** — primera en producción |
| H. erinaceus | Objetivo secundario — requiere control muy preciso |
| L. edodes (Shiitake) | Objetivo a mediano plazo |
| P. ostreatus | Posible para validar sistema antes de djamor |
| G. lucidum | Largo plazo / medicinal |

## Spawn
- Pendiente de costificación y compra para primer lote de producción.
- Estimados: P. djamor ~50–100k COP (10 bolsas), Shiitake ~150–200k COP.

## Automatización — Próximos Pasos
1. Recibir hardware (fin junio / inicio julio)
2. Armar banco de pruebas: ESP32 + SHT3x + SCD30 + relay
3. Validar I²C, ESPHome, estabilidad >85% HR por varios días
4. Instalar en Martha Tent como piloto
5. Replicar a CLOUDLAB 844 tras validación

## Bottlenecks Actuales
- Control de HR depende de operador (manual) hasta instalar T7 + relay
- Banco de pruebas pendiente → no se puede validar automatización en campo
- Spawn no comprado → no hay producción activa

## Prioridades Inmediatas (semana del 29 jun 2026)
1. Recibir pedidos Amazon (28 jun, 3–18 jul)
2. Armar banco de pruebas ESP32 + sensores
3. Comprar spawn P. djamor para primer lote

# Best Practices
- Actualizar este archivo cada vez que cambie el estado de un componente.
- Marcar equipo como "activo" solo cuando esté instalado y validado, no solo recibido.

# Common Failure Modes
- Instalar en producción sin banco de pruebas → riesgo de fallo silencioso en sensores.
- No actualizar este documento → el cuidador opera con información obsoleta.

# Open Questions
- ¿Cuántas carpas en la primera fase de producción real? (1 o 2 CLOUDLAB 844)
- ¿Recinto PIR/PUR o cuarto adaptado? (pendiente cotización FrigoMaster)

# References
- Comprobantes de pedido almacenados fuera de Git por contener datos personales y referencias de compra.
