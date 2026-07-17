---
title: Changelog — Knowledge Base Setas de la Peña
category: meta
load_priority: selective
version_format: YYYY-MM-DD | TYPE | Description
last_reviewed: 2026-07-09
---

# CHANGELOG

Registro cronológico de cambios significativos a la knowledge base, equipos, SOPs, especies activas y arquitectura del sistema. No registra eventos de producción individuales (esos van en batch logs). Registra cambios que afectan cómo opera el proyecto.

**Tipos de entrada:**
- `[ARCH]` — Cambio de arquitectura o documento estructural
- `[EQUIP]` — Adición, retiro o reconfiguración de equipo
- `[SOP]` — Nuevo SOP o modificación de procedimiento existente
- `[SPECIES]` — Cambio de estado de especie (activar, retirar, agregar)
- `[DECISION]` — Decisión operacional mayor (ver también DECISIONS.md)
- `[KB]` — Adición o modificación de documento en knowledge base
- `[BIZ]` — Cambio de proveedor, precio, cliente, o condición de mercado

---

## 2026

### 2026-07-17

| Tipo | Descripción |
|---|---|
| `[DECISION]` | **DEC-013:** `Setas-de-la-Pena/knowledge_base` pasa a ser la copia canónica integrada; `Knowledge-Base` queda como referencia histórica sin edición bidireccional. |
| `[ARCH]` | Reconciliados `SYSTEM_MAP`, `ROADMAP`, `CROSS_REFERENCE_STANDARD`, `INDEX_GENERATION_SPEC` e `INDEX.yaml` desde el remoto documental, preservando los límites de DEC-012. |
| `[KB]` | Reaplicadas sobre la arquitectura remota las correcciones científicas de `paper_001`, `paper_002` y `paper_007`, la limpieza de alias y la trazabilidad bibliográfica. |
| `[SOP]` | Reconciliada la ventilación: 5–8 ACH permanece provisional; se retira el timer fijo como control y se exige caudal efectivo, CO₂ y commissioning. |
| `[EQUIP]` | Inventario fusionado: autoclave All American confirmado en sitio el 2026-07-10 como `EQ-0011`, todavía sin commissioning ni ciclo validado. |
| `[ARCH]` | Añadida calidad automática para formatos, rutas, secretos, archivos prohibidos, smoke tests y regresiones conocidas. No autoriza automatización física ni generación de `INDEX.yaml`. |

### 2026-07-16

| Tipo | Descripción |
|---|---|
| `[KB]` | Peritaje de fuentes: `paper_001` corregido a Zurbano et al. 2017; se retiró como respaldo de paja de trigo, BE 80–130% y FAE. `paper_002` (Mori 2008, celular/preclínico) se separó de `paper_007` (Mori 2009, ensayo clínico pequeño). |
| `[SOP]` | Ventilación corregida: ACH se calcula con caudal efectivo, duty cycle y volumen. El ciclo fijo 5/20 fue retirado; control por CO₂ y commissioning obligatorio. |
| `[ARCH]` | Identificadores operacionales alineados con `PREFIX-XXXX`; se registraron `STD`, `TMP`, `WF`, `DOR`, `AIR`, `QST` e `INC`. |
| `[EQUIP]` | Los pedidos sin evidencia reciente se clasificaron `verification_required`; una fecha de entrega no prueba recepción. |

### 2026-07-10

| Tipo | Descripción |
|---|---|
| `[EQUIP]` | **Operational Consistency Pass 1 (C2), reconciliado:** `04_facility/home_rnd_lab.md`, `05_equipment/autoclaves.md`, `metadata/equipment.yaml` — autoclave All American presente físicamente en sitio (garaje; confirmado por el propietario, 2026-07-10); capacidad de 44 L atribuida al propietario, modelo y capacidad nominal oficial pendientes de confirmar contra la placa del equipo; puesta en marcha (banco de pruebas) pendiente; validación de ciclos de esterilización pendiente; no utilizado todavía en producción. |
| `[SOP]` | **C3/C5:** `CURRENT_OPERATIONS.md` — CO₂ de colonización ya no se presenta como objetivo de control <2000 ppm (bolsa sellada es tolerante, no controlada); HR de fructificación corregida de 90–95% a 85–90% (canónico en `01_species/pleurotus_djamor.md`). |
| `[SPECIES]` | **C5/M2/M3:** `metadata/species.yaml` alineado con sus documentos canónicos — `pleurotus_djamor.humidity_percent` a [85,90]; `hericium_erinaceus.be_range_percent` a [80,120] (sustrato primario Master's Mix); `pleurotus_ostreatus.co2_ppm_max` a 1000. |
| `[SOP]` | **H2:** `CURRENT_OPERATIONS.md` — plantilla de lote activo corregida de código de especie "SP" a "DJ" para P. djamor, conforme a `06_operations/batch_tracking.md` (fuente canónica de numeración de lotes). |
| `[SOP]` | **H7:** `03_spawn/grain_spawn.md` — disparador de inicio de Fase 2 corregido de tres a un ciclo de producción documentado, conforme a `03_spawn/laboratory_roadmap.md` §9. |
| `[SOP]` | **M4:** `03_spawn/lc.md` — reconciliada contradicción interna entre "usar en 30 días o descartar" y "vida útil de 2–3 meses"; 30 días queda como recomendación operacional de vigor, 2–3 meses como techo de vida útil refrigerada (conforme a `culture_storage.md`). |
| `[SOP]` | **M5:** `06_operations/batch_tracking.md` — añadidos campos de tipo/apariencia de contaminante y día de detección a la plantilla de bitácora de lote, referenciando `02_substrates/contamination.md`. |
| `[KB]` | **M6, reconciliado:** `08_brand/packaging.md` — eliminada distinción de política no sustentada entre un límite "conservador" de 5 días y una observación interna de 5–7 días; la etiqueta remite ahora directamente a la duración de refrigeración de `06_operations/quality_control.md` (5–7 días), con el valor final de etiqueta marcado como pendiente de validación (ver también la verificación INVIMA pendiente en el mismo documento). |

### 2026-07-08

| Tipo | Descripción |
|---|---|
| `[DECISION]` | **DEC-008** — Reconciliación de arquitectura (Opción B): los documentos de gobernanza/navegación deben reflejar el filesystem real, no una estructura aspiracional. Descarta las carpetas idealizadas `05_laboratory/`, `10_living/` y el árbol `operations/` de nivel superior. |
| `[ARCH]` | `00_project/REPOSITORY_MAP.md` — corregidas todas las rutas fantasma: `05_laboratory/`→`05_equipment/`; documentos vivos (`CURRENT_OPERATIONS`, `DECISIONS`, `LESSONS_LEARNED`) a la raíz de `knowledge_base/`; añadidos `10_ai_workflows/` y ubicación de docs vivos/metadata/references. |
| `[ARCH]` | `00_project/KNOWLEDGE_ARCHITECTURE.md` — la sección "Operations Directory" (System 2) marcada como *PLANNED — not yet instantiated*; se enruta a plantillas de `06_operations/` y a `CURRENT_OPERATIONS.md` hasta el primer lote. |
| `[ARCH]` | `00_project/EDITORIAL_GUIDELINES.md` — corregida referencia rota `02_substrates/masters_mix.md` → `substrate_library.md`. |
| `[KB]` | **Cierre de DEC-007:** eliminada la carpeta `knowledge_base/11_sources/` (tombstone `SRC-0004.md`) con `git rm`; contenido recuperable en historia de git. Retirada su línea de `REPOSITORY_MAP.md`. Los alias `SRC-####` en documentos de dominio se difieren a la unificación de identificadores (Fase 2). |
| `[DECISION]` | **Tarea 1.7 completada — DEC-009:** jerarquía de precedencia canónica reconciliada. Adoptado modelo de dos ejes: **Autoridad Normativa** (qué documento prevalece en un conflicto) vs. **Estado Operacional** (qué está pasando ahora; nunca anula la autoridad normativa). Sin cambios a parámetros de cultivo, convenciones de identificadores ni estructura de carpetas. |
| `[ARCH]` | `SETAS_DE_LA_PENA_CANON.md` §14 — reescrita como única fuente de verdad de precedencia: §14.1 Autoridad Normativa (9 niveles, incluye `DECISIONS.md` y Estándares de Gobernanza), §14.2 Estado Operacional (5 niveles), §14.3 Interacción entre los dos ejes. |
| `[ARCH]` | `00_project/AI_AGENT_PROTOCOL.md` §6 — reemplazada tabla de jerarquía propia por referencia a CANON §14. |
| `[ARCH]` | `00_project/EDITORIAL_GUIDELINES.md` §4 — reemplazado diagrama de jerarquía propio por referencia a CANON §14. |
| `[ARCH]` | `00_project/SYSTEM_FLOW.md` §11 — aclarado que el diagrama describe el gobierno por subsistema, no precedencia; referencia CANON §14 como fuente exclusiva de precedencia. |

### 2026-06-29

| Tipo | Descripción |
|---|---|
| `[ARCH]` | Creación inicial de la knowledge base completa — 50 documentos |
| `[ARCH]` | Creación de `SETAS_DE_LA_PENA_CANON.md` — documento arquitectural máximo |
| `[ARCH]` | Creación de `README_MCP.md` — reglas de recuperación para modelos de lenguaje |
| `[ARCH]` | Creación de `FARM_BRAIN.md` — snapshot operacional, carga siempre |
| `[ARCH]` | Adición de `load_priority` en frontmatter de todos los documentos |
| `[KB]` | Creación de `metadata/species.yaml`, `equipment.yaml`, `substrates.yaml`, `kpis.yaml` |
| `[KB]` | Creación de `09_research/literature_database.md` — 5 papers, 4 libros, 4 recursos web |
| `[KB]` | Creación de `references/bibliography.md` — bibliografía completa APA |
| `[EQUIP]` | Pedidos Amazon confirmados: CLOUDLAB 844, T7, SHT3x ×2, ESP32 ×3, SCD30 ×2, TICONN ×2, H4 ×2 |
| `[DECISION]` | ESP32 + ESPHome seleccionado sobre soluciones comerciales cerradas |
| `[DECISION]` | SHT3x (Sensirion) seleccionado como sensor T/HR principal |
| `[DECISION]` | VIVOSUN H05 sensor HR descartado — sesgo confirmado +30–35% |
| `[DECISION]` | P. djamor seleccionado como especie prioritaria Fase 1 |
| `[DECISION]` | Paja de trigo pasteurizada seleccionada como sustrato inicial |
| `[DECISION]` | Timer mecánico descartado como mecanismo de control FAE |
| `[ARCH]` | Creación de `CHANGELOG.md`, `DECISIONS.md`, `CURRENT_OPERATIONS.md`, `LESSONS_LEARNED.md` |

### 2026-07-04

| Tipo | Descripción |
|---|---|
| `[KB]` | **(Reconstrucción de rastro)** Registro de fuente SRC-0004 / `guide_001` (Grassi et al. 2019, IMiBio) — guía de extensión; valor en diseño de planta e IPM, no en parámetros biológicos. Curaduría: incorporación acotada. |
| `[KB]` | **(Reconstrucción de rastro)** Registro de fuente SRC-0005 / `paper_006` (Rodríguez Valencia & Jaramillo López 2005, Cenicafé/FNC) en índice, base de literatura y bibliografía. Fuente Tier 2 colombiana, ★★★★★ para *L. edodes* y *G. lucidum*. |
| `[KB]` | **(Reconstrucción de rastro)** `02_substrates/substrate_library.md` — nueva sección "Subproductos de Café (Colombia)": C/N de materias primas (pulpa 31, borra 33, aserrín tallo 47, salvado trigo 21, maíz 34), formulaciones T2 (shiitake, 57,6%) y T12/T13/T14 (ganoderma), humedad 62,5%, partícula 0,5–2 cm. Fuente: SRC-0005. |
| `[KB]` | **(Reconstrucción de rastro)** `01_species/ganoderma_lucidum.md` — parámetros por etapa precisados (pH 4,2–5,3, primordios 30°C, HR escalonada 90→70–80→30–40%, CO₂ ~350 ppm disparador de píleo, luz 50–450 lux, fruiting óptimo 27–32°C); open question de temperatura en Tenjo resuelta (requiere calefacción → Fase 2). `confidence` a `high`. Fuente: SRC-0005. |
| `[KB]` | Registro de fuente SRC-0006 / `book_005` (Piepenbring 2015, *Introducción a la Micología en los Trópicos*, APS Press) como referencia académica `on_request` en `bibliography.md`, `literature_index.md` y `literature_database.md`. Curaduría: reference-tier, sin impacto operacional. |
| `[KB]` | `01_species/ganoderma_lucidum.md` — nota nomenclatural *G. lingzhi* (Cao et al. 2012) sin. *G. lucidum*; relevante para etiquetado/claims INVIMA. Fuente: SRC-0006. |
| `[SOP]` | `02_substrates/sterilization.md` — añadida ruta artesanal de vapor a presión atmosférica (5 h desde ebullición local, ~91°C a 2.600 m) marcada como *pasteurización intensa*, NO esterilización; estado *Supported Hypothesis*, requiere banco de pruebas en Tenjo. Fuente: SRC-0005 (Cenicafé, paper_006). |
| `[KB]` | `01_species/lentinula_edodes.md` (U-3) — incubación 20–25°C (óptimo 25°C, rango 21–27°C); tasa de inoculación 3,6% comercial / 5–7,5% propia; sustrato de café (formulación T2, ~57%); nota de cepas tolerantes a calor L54/L4055 como *conflicting evidence* al rango 10–16°C; variante corta de choque térmico (12°C, 2–4 h). Fuente: SRC-0005. |
| `[KB]` | `02_substrates/contamination.md` (U-5) — causa específica de *Neurospora* (sustrato dejado en el esterilizador); baja capacidad antagónica del shiitake → esterilización obligatoria. Fuente: SRC-0005. |
| `[KB]` | `04_facility/incubation.md` + `fruiting.md` (U-6) — dimensionamiento 1 m³/3,7 kg de sustrato; desinfección de cuarto (formol 0,3% + CaCO₃); cobertura de plástico por clima (negro incubación / transparente fructificación, clima frío). Fuente: SRC-0005. |
| `[KB]` | `02_substrates/supplementation.md` (U-7) — compuestos de calcio (CaCO₃/CaSO₄) mínimo funcional ≥0,6% para estabilizar producción y estimular crecimiento hifal. Fuente: SRC-0005 (Royse & Sánchez vía Cenicafé). |
| `[KB]` | `metadata/substrates.yaml` — nuevas entradas `coffee_substrate_shiitake_t2` y `coffee_substrate_ganoderma_t12` (composición, C/N, BE, `validation_status: needs_field_validation_tenjo`); bloque `calcium_compounds` (mín. 0,6%). Sync cross-reference SRC-0005. |
| `[KB]` | `metadata/species.yaml` — `ganoderma_lucidum` actualizado (fruiting 27–32°C, incubación 25–32°C, pH 4,2–5,3, HR escalonada, CO₂ trigger 350 ppm, luz 50–450 lux, `requires_active_heating_tenjo: true`); `lentinula_edodes` (incubación óptima 25°C, tasa inoculación 3,6–7,5%, cepas L54/L4055, sustrato café). Sync cross-reference SRC-0005. |
| `[KB]` | Incorporados 5 PDFs subidos por el usuario a `09_research/literature_database.md`, `literature_index.md` y `references/bibliography.md`: `book_006` (Chang, Buswell & Miles 1993, *Genetics and Breeding of Edible Mushrooms* — genética/mating types, hibridación Pleurotus, mejoramiento Lentinula; referencia de fondo para spawn propio Fase 3), `book_007` (Chang & Miles 2004, *Mushrooms: Cultivation, Nutritional Value, Medicinal Effect and Environmental Impact* 2ª ed. — antes en "literatura pendiente"; capítulos dedicados Pleurotus/Lentinula/Ganoderma), `guide_002` (ICAR-DMR 2020, *Growing Oyster Mushroom* — protocolo cuantificado P. djamor: spawn 3%/10%, cultivo madre 25±2°C/pH 7, BE 80–100%), `guide_003` (MushWorld 2004, *Mushroom Growers' Handbook 1* — spawn de grano, sala limpia, growing houses, plagas, poscosecha), `guide_004` (Chang ca. 2010, UNAPCAEM Training Manual — plantilla pedagógica). PDFs originales archivados en `09_research/source_pdfs/`. |
| `[KB]` | `01_species/pleurotus_djamor.md` — nueva sección "Cultivo Madre y Spawn" con datos de guide_002 (PDA/MEA 25±2°C pH 7, spawn 15–20 días, tasa inoculación 3%/10%); nota de precaución sobre cifra "CO₂ >1,500 ppm" de guide_002 (interpretada como techo de tolerancia, no objetivo — mantener 500–1,500 ppm como rango operacional). |

---

## Plantilla de entrada

```
### YYYY-MM-DD

| Tipo | Descripción |
|---|---|
| `[TIPO]` | Descripción concisa del cambio. Referencia a documento afectado si aplica. |
```

---

*Este archivo se actualiza cada vez que un cambio significativo ocurre en el proyecto.*
*Eventos de producción van en `06_operations/batch_tracking.md`.*
