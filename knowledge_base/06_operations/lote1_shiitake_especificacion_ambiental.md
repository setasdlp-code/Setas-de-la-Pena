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

**Estado: BORRADOR v1, sin aprobar.** Es la especificación versionada que el piloto de incubación exige antes de arrancar (ver `piloto_shiitake_incubacion_protocolo.md`). La cepa es **no identificada** (DEC-019): lo que depende de ella queda como propuesta provisional o como "desconocido", y se caracteriza en el piloto. Ningún valor está aprobado hasta que Sebastián lo apruebe.

Mientras `setpoint_c` y `histeresis_c` sigan siendo el marcador `PENDIENTE_ESPECIFICACION_LOTE` en `esphome/incubadora_piloto.yaml`, ese firmware no compila. Eso es intencional. El objetivo de temperatura se aplica en cada arranque desde el preset `Lote`, de modo que tras un corte de energía manda siempre la especificación vigente y no un valor guardado en la memoria del equipo.

# Reglas

- Todo campo obligatorio vacío bloquea el arranque del piloto; no se completa con una estimación silenciosa.
- Un cambio de cualquier valor crea una versión nueva (no se edita la anterior); la versión vigente es la última aprobada por Sebastián.
- La banda de temperatura no se copia de otra cepa como si fuera de esta. Excepción del lote 1 (DEC-019): se propone una banda provisional dentro del rango de diseño del KB, marcada como tal, mientras la cepa no esté identificada.

# Especificación (versión 1 — borrador sin aprobar)

| Campo | Valor | Alimenta |
|---|---|---|
| Cepa (nombre) | No identificada (DEC-019) | — |
| Cepa (código del proveedor) | No disponible | — |
| Proveedor | Fungiilab (micelio nacional de *L. edodes*) | — |
| Lote de spawn | Por registrar al recibir (etiqueta o factura). Obligatorio | Trazabilidad (`YYYY-MM-LE-###`) |
| Fecha de elaboración del spawn | Por registrar al recibir. Obligatoria | Trazabilidad |
| Clase térmica (fría, media o alta) | Desconocida: se caracteriza en el piloto | Elección de la banda |
| ¿Requiere choque frío? (sí o no) | Desconocido: se prueba por grupos en la inducción | Fase posterior de inducción |
| Banda de temperatura de incubación (°C) | Propuesta provisional, sin aprobar: objetivo del aire de 22 °C dentro del rango de diseño de 20–24 °C | Define `setpoint_c` |
| Histéresis (°C) | Propuesta: 0,5 °C (valor técnico, se valida en las fases 1 y 2) | `histeresis_c` (`heat_deadband` y `heat_overrun`) |
| Dosis de inoculación (% del peso del bloque) | Por decidir. Referencia de literatura: 3,6 % con spawn comercial y 5–7,5 % con spawn propio (paper_006); sin validar | Registro del lote |
| Formulación (versión de receta) | Pendiente de aprobación | `quality_control.md` |
| Masa del bloque | 2,0 kg (decisión del piloto) | Registro del lote |
| Número de bloques | 30 (decisión del piloto) | Registro del lote |
| Versión | 1 (borrador) | — |
| Fecha de la versión | 2026-10-25 | — |
| Aprobada por | Pendiente (Sebastián) | — |

# Cómo se traduce al firmware

| Campo de la especificación | Sustitución en `esphome/incubadora_piloto.yaml` | Cómo se aplica |
|---|---|---|
| Banda de temperatura de incubación | `setpoint_c` | `esphome -s setpoint_c <°C> -s histeresis_c <°C> compile incubadora_piloto.yaml`, o editar la sustitución |
| Histéresis | `histeresis_c` | Igual que arriba |
| Límite de aire | `aire_max_c` | 28,0 °C, provisional (mismo tope que el KB da al núcleo); se ajusta con la banda aprobada |

Los límites de seguridad del núcleo (28 °C, de `01_species/lentinula_edodes.md`; y 5 °C sobre el aire, de la spec del piloto §5.3) no dependen de la cepa en este piloto; si la especificación exige otros, es un cambio de diseño y se registra como tal.

# Tensión de la banda propuesta

El KB documenta que el calor metabólico del micelio puede subir el núcleo del bloque 4–8 °C sobre el aire (paper_026). Con el aire a 22 °C el núcleo podría llegar a 26–30 °C, cerca de la alarma de 28 °C. Si ocurre en las fases 2 o 4, la alarma apaga el calefactor y exige ventilar más o bajar el objetivo; se registra como dato del piloto y no como falla. Las búsquedas web coinciden en que el micelio crece mejor cerca de 24–27 °C y no encontraron un umbral letal (`../09_research/shiitake_verificacion_web_2026-10-25.md`), de modo que el límite de 28 °C en el núcleo es una decisión de diseño conservadora.
