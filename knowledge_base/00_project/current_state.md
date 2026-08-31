---
title: Snapshot Histórico del Proyecto — 2026-06-29
document_id: DOC-0001
category: project
load_priority: on_request
last_reviewed: 2026-07-24
status: superseded
superseded_by: ../CURRENT_OPERATIONS.md
confidence: high
primary_sources:
  - Internal records
  - Amazon order history
related_documents:
  - mission.md
  - 05_equipment/environmental_control.md
  - 04_facility/master_blueprint.md
  - 09_research/unresolved_questions.md
---

# Estado del documento

Este snapshot fue supersedido por `../CURRENT_OPERATIONS.md` y `../FARM_BRAIN.md`. Conserva el estado observado el 2026-06-29 como registro histórico; no gobierna compras, especie activa, setpoints ni prioridades. DEC-013, del 2026-07-14, estableció *Lentinula edodes* como especie prioritaria de arranque y dejó *P. djamor* como candidato futuro.

# Executive Summary
Estado operacional histórico a junio 2026. Fase de prototipado activa con Martha Tent; producción en CLOUDLAB 844 en preparación (equipo en tránsito). Sistema de automatización ESP32/ESPHome diseñado, pendiente de banco de pruebas.

# Core Principles
Este documento se actualiza con cada cambio de estado significativo. Representa la fotografía operacional más reciente del proyecto.

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

## Especies — selección histórica supersedida

La tabla siguiente registra la planificación del 2026-06-29 y no representa la estrategia vigente.

| Especie | Estado histórico |
|---|---|
| P. djamor | Selección del 2026-06-29; supersedida por DEC-013 |
| H. erinaceus | Objetivo secundario — requiere control muy preciso |
| L. edodes (Shiitake) | Figuraba a mediano plazo; pasó a prioridad de arranque por DEC-013 |
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

## Prioridades históricas (semana del 29 jun 2026; supersedidas)
1. Recibir pedidos Amazon (28 jun, 3–18 jul)
2. Armar banco de pruebas ESP32 + sensores
3. Compra de spawn de *P. djamor* propuesta entonces; tarea cancelada por DEC-013

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
- Órdenes Amazon: registro interno