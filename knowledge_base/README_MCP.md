---
title: README_MCP — Instrucciones de Recuperación para Modelos de Lenguaje
document_id: DOC-0052
category: project
load_priority: always
last_reviewed: 2026-07-24
---

# README_MCP — Instrucciones de Recuperación para Modelos de Lenguaje

**Proyecto:** Setas de la Peña — Cultivo de setas gourmet y medicinales, Tenjo, Colombia
**Este archivo define cómo navegar la knowledge base de forma eficiente.**

---

## Regla Principal

**Carga siempre `FARM_BRAIN.md` primero.** Contiene el estado operacional actual, restricciones críticas, bottlenecks y prioridades. Si la pregunta se puede responder con el Farm Brain, no cargues archivos adicionales.

---

## Jerarquía de Carga

### ALWAYS LOAD
```
knowledge_base/FARM_BRAIN.md
```
Snapshot operacional: instalación actual, hardware, especies, restricciones críticas, bottlenecks, roadmap.

---

### RETRIEVE SELECTIVELY
Cargar solo si la pregunta lo requiere específicamente.

| Si la pregunta es sobre... | Cargar |
|---|---|
| Parámetros de cultivo de una especie | `01_species/{especie}.md` |
| Sustratos, recetas, pasteurización | `02_substrates/{tema}.md` |
| Spawn, agar, liquid culture | `03_spawn/{tema}.md` |
| Layout, zonas, workflow de producción | `04_facility/{tema}.md` |
| Sensores, ESPHome, autoclave, LAF | `05_equipment/{tema}.md` |
| QC, trazabilidad, limpieza, cronograma | `06_operations/{tema}.md` |
| Datos estructurados (especies, equipos, KPIs) | `metadata/{archivo}.yaml` |

---

### USE ONLY WHEN REQUESTED
No cargar por defecto — solo si el usuario pregunta explícitamente sobre estos temas.

| Si la pregunta es sobre... | Cargar |
|---|---|
| Marca, identidad visual, packaging | `08_brand/{tema}.md` |
| Precios, mercado, proveedores, economía | `07_business/{tema}.md` |
| Literatura científica, resúmenes de investigación | `09_research/{tema}.md` |
| Citas bibliográficas específicas | `references/bibliography.md` |

---

## Reglas de Uso

**1. Farm Brain first.**
Antes de buscar en documentos específicos, verifica si el Farm Brain ya responde la pregunta. La mayoría de preguntas operacionales cotidianas están ahí.

**2. Prefiere documentos operacionales sobre investigación.**
Para decisiones de cultivo, el orden de autoridad es:
1. `FARM_BRAIN.md` (decisiones ya tomadas, estado actual)
2. `01_species/`, `02_substrates/`, `05_equipment/` (protocolos operacionales)
3. `09_research/` (justificación científica, solo si se necesita)
4. `references/bibliography.md` (citas formales, solo si se piden)

**3. No repitas contenido entre archivos.**
Si `01_species/lentinula_edodes.md` referencia `02_substrates/substrate_library.md`, no cargues ambos completos — carga el más relevante para la pregunta.

**4. Usa research para revisar SOPs, no para operaciones cotidianas.**
`09_research/research_summaries.md` y `literature_database.md` son para validar o actualizar protocolos, no para responder "¿a qué temperatura pasteurizo?"

**5. Cita siempre la fuente y nivel de confianza.**
Al dar información técnica, indica de dónde viene:
- `[FARM_BRAIN]` — decisión operacional tomada
- `[01_species/lentinula_edodes.md]` — evidencia curada para la especie prioritaria
- `[book_007, capítulo 13]` — respaldo bibliográfico; no equivale a setpoint aprobado
- `[estimado, ★★★☆☆]` — dato no verificado en campo

**6. Cuando haya incertidumbre, dilo.**
Si el dato no está en la knowledge base o es una estimación, indicarlo explícitamente. Ver `09_research/unresolved_questions.md` para preguntas actualmente sin respuesta.

---

## Restricciones Críticas (Resumen Rápido)

Estas restricciones aplican en TODOS los documentos y respuestas:

- [DESCARTADO] VIVOSUN H05 como sensor de HR — nunca usar su lectura; sesgo medido de +30–35%.
- [DESCARTADO] Timer mecánico como respaldo de FAE.
- [BLOQUEO] No iniciar el lote 1 sin spawn de shiitake trazable, formulación aprobada y ciclo de autoclave validado con carga representativa.
- [BLOQUEO] No convertir minutos de ventilador en cambios de aire por hora sin volumen efectivo y caudal medido bajo presión.
- [BLOQUEO] No fijar temperatura, HR, CO₂, luz o choque frío universales para shiitake antes de identificar la cepa y aprobar la especificación del lote.
- [REGULATORIO] No publicar claims medicinales sin evidencia específica y revisión de requisitos INVIMA.
- [OBLIGATORIO] SCD30: `altitude_compensation: 2600` en ESPHome.
- [ESTADO] *Lentinula edodes* es la especie prioritaria de arranque; *P. djamor* permanece como candidato futuro.

---

## División de Responsabilidades Claude / ChatGPT

| Tarea | Herramienta |
|---|---|
| Parámetros técnicos, automatización, SOPs, protocolos | **Claude + esta knowledge base** |
| Copywriting, marketing, posts redes sociales | **ChatGPT** |
| Generación de imágenes, packaging visual | **ChatGPT + DALL-E** |
| Documentación interna, análisis, decisiones técnicas | **Claude** |

---

## Estructura de la Knowledge Base

```
knowledge_base/
├── FARM_BRAIN.md          ← CARGAR SIEMPRE
├── README_MCP.md          ← Este archivo
├── 00_project/            mission, principles, glossary, current_state
├── 01_species/            djamor, erinaceus, ostreatus, edodes, lucidum
├── 02_substrates/         substrate_library, pasteurization, sterilization,
│                          supplementation, contamination
├── 03_spawn/              grain_spawn, agar, lc, culture_storage
├── 04_facility/           master_blueprint, fruiting, incubation,
│                          laboratory, workflow
├── 05_equipment/          environmental_control, martha, autoclaves,
│                          laminar_flow, mixers
├── 06_operations/         quality_control, batch_tracking,
│                          production_schedule, cleaning
├── 07_business/           economics, colombian_market, suppliers, pricing
├── 08_brand/              identity, illustration_style, packaging
├── 09_research/           literature_database, literature_index,
│                          research_summaries, unresolved_questions
├── references/            bibliography.md
└── metadata/              species.yaml, equipment.yaml,
                           substrates.yaml, kpis.yaml
```

---

*Este archivo no se actualiza frecuentemente — es la arquitectura de la knowledge base, no el estado operacional. Para estado operacional, ver `FARM_BRAIN.md`.*
