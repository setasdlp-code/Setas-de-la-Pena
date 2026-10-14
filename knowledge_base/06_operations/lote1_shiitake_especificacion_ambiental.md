---
title: Especificación Ambiental del Lote 1 de Shiitake — Plantilla Versionada
document_id: DOC-0122
category: operations
load_priority: selective
last_reviewed: 2026-10-13
confidence: low
primary_sources:
  - docs/superpowers/specs/2026-10-13-piloto-shiitake-incubacion-design.md
  - knowledge_base/06_operations/quality_control.md
related_documents:
  - piloto_shiitake_incubacion_protocolo.md
  - quality_control.md
  - ../01_species/lentinula_edodes.md
  - ../CURRENT_OPERATIONS.md
---

# Alcance y estado

**Estado: `PENDIENTE`. Ningún campo tiene valor.** Esta es la plantilla de la especificación versionada que el piloto de incubación exige antes de arrancar (ver `piloto_shiitake_incubacion_protocolo.md`). No contiene setpoints: los rangos de literatura de `01_species/lentinula_edodes.md` sirven para diseñar el piloto, no para controlar.

Mientras `setpoint_c` y `histeresis_c` sigan siendo el marcador `PENDIENTE_ESPECIFICACION_LOTE` en `esphome/incubadora_piloto.yaml`, ese firmware no compila. Eso es intencional.

# Reglas

- Todo campo obligatorio vacío bloquea el arranque del piloto; no se completa con una estimación silenciosa.
- Un cambio de cualquier valor crea una versión nueva (no se edita la anterior); la versión vigente es la última aprobada por Sebastián.
- La banda de temperatura no se copia de otra cepa ni de la literatura sin identificar la cepa.

# Especificación (versión 0 — sin aprobar)

| Campo | Valor | Alimenta |
|---|---|---|
| Cepa (nombre) | — | — |
| Cepa (código del proveedor) | — | — |
| Proveedor | Fungiilab (micelio nacional de *L. edodes*) | — |
| Lote de spawn | — | Trazabilidad (`YYYY-MM-LE-###`) |
| Fecha de elaboración del spawn | — | Trazabilidad |
| Clase térmica (fría, media o alta) | — | Elección de la banda |
| ¿Requiere choque frío? (sí o no) | — | Fase posterior de inducción |
| Banda de temperatura de incubación (°C) | — | Define `setpoint_c` |
| Histéresis (°C) | — | `histeresis_c` (`heat_deadband` y `heat_overrun`) |
| Dosis de inoculación (% del peso del bloque) | — | Registro del lote |
| Formulación (versión de receta) | — | `quality_control.md` |
| Masa del bloque | 2,0 kg (decisión del piloto) | Registro del lote |
| Número de bloques | 30 (decisión del piloto) | Registro del lote |
| Versión | 0 | — |
| Fecha de la versión | — | — |
| Aprobada por | — | — |

# Cómo se traduce al firmware

| Campo de la especificación | Sustitución en `esphome/incubadora_piloto.yaml` | Cómo se aplica |
|---|---|---|
| Banda de temperatura de incubación | `setpoint_c` | `esphome -s setpoint_c <°C> -s histeresis_c <°C> compile incubadora_piloto.yaml`, o editar la sustitución |
| Histéresis | `histeresis_c` | Igual que arriba |

Los límites de seguridad del núcleo (28 °C, de `01_species/lentinula_edodes.md`; y 5 °C sobre el aire, de la spec del piloto §5.3) no dependen de la cepa en este piloto; si la especificación exige otros, es un cambio de diseño y se registra como tal.
