---
title: Farm Brain — Setas de la Peña
category: project
load_priority: always
last_reviewed: 2026-07-16
confidence: low
---

# Setas de la Peña — Farm Brain

**Ubicación:** Tenjo, Cundinamarca, Colombia (~2.600 m s. n. m.)  
**Operación prevista:** Sebastián remoto + operador in situ; SOPs y Home Assistant.  
**Estado de evidencia:** la última fotografía de campo documentada es del 2026-06-29. El estado físico actual debe verificarse antes de planear producción.

## Estado Operacional

| Área | Estado verificable al 2026-07-16 |
|---|---|
| Lotes activos | No hay lotes activos documentados; confirmar en campo |
| Martha Tent | Último reporte: prototipo con control manual; estado actual por verificar |
| CLOUDLAB 844 | Último reporte: pedido con llegada estimada en julio; recepción/instalación por verificar |
| Automatización | Diseño documentado; montaje, commissioning y operación por verificar |
| Spawn y paja | Compra, proveedor y disponibilidad actual no confirmados |

**Especie prioritaria de diseño:** *Pleurotus djamor*.  
**Proceso inicial propuesto:** paja de trigo pasteurizada; BE local pendiente de validación.

## Hardware Crítico — Regla de Estado

Ningún equipo se considera recibido, instalado, configurado u operativo solo por tener una fecha estimada de entrega. La fuente estructurada es `metadata/equipment.yaml`; todos los componentes requieren inventario físico y evidencia de prueba.

| Función | Equipo previsto | Estado actual |
|---|---|---|
| Cámara producción | CLOUDLAB 844 | Verificación requerida |
| Humidificación | AC Infinity T7 / VIVOSUN H05 | Verificación requerida; nunca usar HR del H05 |
| Extracción | AC Infinity H4 ×2 | Verificación requerida; commissioning pendiente |
| T/HR | SHT3x + Inkbird | Presencia y funcionamiento por verificar |
| CO₂ | SCD30 ×2 | Presencia, calibración y compensación por verificar |
| Control local | ESP32-WROOM-32 ×3 | Presencia y firmware por verificar |
| Hub central | RPi4 + Home Assistant | Estado contradictorio previo; verificar físicamente |

## Restricciones Críticas

- El sensor HR integrado del VIVOSUN H05 está descartado por sesgo observado de +30–35%.
- No usar eucalipto en la formulación inicial de *P. djamor*.
- Ventilación: objetivo provisional 5–8 ACH, calculado con caudal efectivo y volumen; no inferir ACH desde un timer.
- Para *P. djamor*: 20–30°C, HR 85–90%, CO₂ 500–1.500 ppm y alarma >2.000 ppm, sujetos a validación.
- SCD30: configurar y comprobar `altitude_compensation: 2600`.
- Sustratos suplementados de alto riesgo requieren esterilización; la Fase 1 propuesta usa paja pasteurizada.

## Bloqueantes

1. Inventario físico y fotográfico de cámaras, actuadores, sensores, controladores y consumibles.
2. Confirmar si RPi4/HA y ESP32 están montados y qué configuración ejecutan.
3. Commissioning de ventilación: volumen, caudal efectivo, mezcla, respuesta de CO₂ y efecto en HR.
4. Verificar proveedor y lote de spawn (`QST-0008`) y paja (`QST-0013`).
5. Registrar lecturas reales de T°, HR y CO₂ antes de fijar fecha del primer lote.

## Prioridad Inmediata — 16 a 22 de julio de 2026

1. Completar inventario físico con foto, ubicación, número de serie y estado de prueba.
2. Actualizar `metadata/equipment.yaml` desde evidencia de campo.
3. Confirmar topología y software de RPi4/HA/ESP32.
4. Ejecutar banco de pruebas y commissioning ambiental sin material biológico.
5. Cotizar spawn y paja; no iniciar lote sin trazabilidad `GS-XXXX`, `SB-XXXX`, `BL-XXXX` y `BT-XXXX`.

## Roadmap — No equivale a estado actual

| Fase | Hito de salida |
|---|---|
| Verificación | Inventario y lecturas actuales confirmados |
| Prototipo | Cámara estable y commissioning documentado |
| Producción Fase 1 | Primeros lotes trazables y línea base de BE/contaminación |
| Escala | Economía validada antes de recinto/autoclave adicionales |
| Laboratorio | LAF, esterilización y spawn propio validados |

*Fuente operacional de detalle: `CURRENT_OPERATIONS.md`. Actualizar ambos documentos solo con evidencia fechada.*
