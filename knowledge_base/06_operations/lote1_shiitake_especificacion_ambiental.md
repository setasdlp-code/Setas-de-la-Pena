---
title: Especificación Ambiental del Lote 1 de Shiitake — Plantilla Versionada
document_id: DOC-0122
category: operations
load_priority: selective
last_reviewed: 2026-10-17
confidence: low
primary_sources:
  - docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md
  - ../01_species/lentinula_edodes.md
related_documents:
  - piloto_shiitake_incubacion_protocolo.md
  - quality_control.md
  - ../CURRENT_OPERATIONS.md
  - ../04_facility/incubation.md
---

# Estado

**PENDIENTE.** No hay valores aprobados. Este documento es la plantilla que debe completarse antes de inocular el lote 1. Ningún campo se llena con valores de literatura: la banda depende de la cepa y su clase térmica (`../01_species/lentinula_edodes.md`).

El firmware (`esphome/incubadora_piloto.yaml`) no trae objetivo de temperatura: el termostato arranca apagado y, tras 90 s de estabilización con las alarmas limpias, se reanuda solo si el operador lo dejó habilitado ("Calefacción habilitada"). Esta especificación define qué se carga en el equipo.

# Especificación (versión 0, sin aprobar)

| Campo | Valor | Fuente exigida |
|---|---|---|
| Versión y fecha | v0 — pendiente | — |
| Aprobada por | pendiente | Sebastián |
| Cepa (nombre y código) | pendiente | Ficha de Fungiilab |
| Proveedor | Fungiilab (micelio nacional de *L. edodes*, bolsa de 2 kg) | Decisión del piloto |
| Lote de spawn y fecha de elaboración | pendiente | Etiqueta o factura |
| Matriz del inóculo (grano o aserrín) | pendiente | Ficha de Fungiilab |
| Clase térmica (fría, media o alta) | pendiente | Ficha de Fungiilab |
| Requiere choque frío | pendiente | Ficha de Fungiilab |
| Banda de temperatura de incubación | pendiente | Ficha y prueba de cámara |
| Histéresis (`histeresis_c`) | pendiente | Ensayo de las fases 1 y 2 |
| Dosis de inoculación | pendiente | Fungiilab (referencia de diseño: 5–7 % del peso del bloque, sin validar) |
| Formulación del sustrato | pendiente | Aprobación formal |
| Masa del bloque | 2,0 kg | Decisión del piloto |
| Número de bloques | 30 (60 kg de sustrato húmedo) | Decisión del piloto |
| Ciclo de autoclave validado | pendiente | Ciclo con carga representativa (All American 1941X, 39 L) |

# Cómo se aplica al firmware

| Campo de la especificación | Dónde se carga |
|---|---|
| Banda de temperatura | Objetivo del termostato `incubadora`, fijado por el operador desde Home Assistant o la API tras cargar la versión aprobada. El firmware no trae objetivo. |
| Histéresis | Sustitución `histeresis_c` de `esphome/incubadora_piloto.yaml` (arranca en 0,5 °C, valor técnico y no biológico) |
| Alerta de núcleo | Fija en el firmware: 28 °C y 5 °C sobre el aire (valores del KB para el piloto) |
| Límite de aire | Sustitución `aire_max_c` (28,0 °C, provisional; se ajusta con la banda aprobada) |

# Control de cambios

Cada cambio de la especificación crea una versión nueva con fecha y aprobador. No se edita una versión aprobada.
