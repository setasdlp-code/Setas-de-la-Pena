---
title: Changelog — Knowledge Base Setas de la Peña
category: meta
load_priority: selective
version_format: YYYY-MM-DD | TYPE | Description
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
| `[KB]` | **(Reconstrucción de rastro)** Registro de `paper_006` (Rodríguez Valencia & Jaramillo López 2005, Cenicafé/FNC) en índice, base de literatura y bibliografía. Fuente Tier 2 colombiana para *L. edodes* y *G. lucidum*. |
| `[KB]` | **(Reconstrucción de rastro)** `02_substrates/substrate_library.md` — nueva sección "Subproductos de Café (Colombia)": C/N de materias primas (pulpa 31, borra 33, aserrín tallo 47, salvado trigo 21, maíz 34), formulaciones T2 (shiitake, 57,6%) y T12/T13/T14 (ganoderma), humedad 62,5%, partícula 0,5–2 cm. Fuente: `paper_006`. |
| `[KB]` | **(Reconstrucción de rastro)** `01_species/ganoderma_lucidum.md` — parámetros por etapa precisados (pH 4,2–5,3, primordios 30°C, HR escalonada 90→70–80→30–40%, CO₂ ~350 ppm disparador de píleo, luz 50–450 lux, fruiting óptimo 27–32°C); open question de temperatura en Tenjo resuelta (requiere calefacción → Fase 2). Fuente: `paper_006`. |
| `[KB]` | Registro de `book_005` (Piepenbring 2015, *Introducción a la Micología en los Trópicos*, APS Press) como referencia académica `on_request` en `bibliography.md`, `literature_index.md` y `literature_database.md`. Curaduría: reference-tier, sin impacto operacional. |
| `[KB]` | `01_species/ganoderma_lucidum.md` — nota nomenclatural *G. lingzhi* (Cao et al. 2012) sin. *G. lucidum*; relevante para etiquetado/claims INVIMA. Fuente: `book_005`. |
| `[SOP]` | `02_substrates/sterilization.md` — añadida ruta artesanal de vapor a presión atmosférica (5 h desde ebullición local, ~91°C a 2.600 m) marcada como *pasteurización intensa*, NO esterilización; estado *Supported Hypothesis*, requiere banco de pruebas en Tenjo. Fuente: `paper_006`. |
| `[KB]` | `01_species/lentinula_edodes.md` (U-3) — incubación 20–25°C (óptimo 25°C, rango 21–27°C); tasa de inoculación 3,6% comercial / 5–7,5% propia; sustrato de café (formulación T2, ~57%); nota de cepas tolerantes a calor L54/L4055 como *conflicting evidence* al rango 10–16°C; variante corta de choque térmico (12°C, 2–4 h). Fuente: `paper_006`. |
| `[KB]` | `02_substrates/contamination.md` (U-5) — causa específica de *Neurospora* (sustrato dejado en el esterilizador); baja capacidad antagónica del shiitake → esterilización obligatoria. Fuente: `paper_006`. |
| `[KB]` | `04_facility/incubation.md` + `fruiting.md` (U-6) — dimensionamiento 1 m³/3,7 kg de sustrato; desinfección de cuarto (formol 0,3% + CaCO₃); cobertura de plástico por clima (negro incubación / transparente fructificación, clima frío). Fuente: `paper_006`. |
| `[KB]` | `02_substrates/supplementation.md` (U-7) — compuestos de calcio (CaCO₃/CaSO₄) mínimo funcional ≥0,6% para estabilizar producción y estimular crecimiento hifal. Fuente: `paper_006` (Royse & Sánchez vía Cenicafé). |
| `[KB]` | `metadata/substrates.yaml` — nuevas entradas `coffee_substrate_shiitake_t2` y `coffee_substrate_ganoderma_t12` (composición, C/N, BE, `validation_status: needs_field_validation_tenjo`); bloque `calcium_compounds` (mín. 0,6%). Referencia: `paper_006`. |
| `[KB]` | `metadata/species.yaml` — `ganoderma_lucidum` actualizado (fruiting 27–32°C, incubación 25–32°C, pH 4,2–5,3, HR escalonada, CO₂ trigger 350 ppm, luz 50–450 lux, `requires_active_heating_tenjo: true`); `lentinula_edodes` (incubación óptima 25°C, tasa inoculación 3,6–7,5%, cepas L54/L4055, sustrato café). Referencia: `paper_006`. |
| `[KB]` | Incorporadas 5 fuentes a `09_research/literature_database.md`, `literature_index.md` y `references/bibliography.md`: `book_006`, `book_007`, `guide_002`, `guide_003` y `guide_004`. Los PDF completos permanecen en un caché local excluido de Git; el repositorio conserva citas, alcance y hallazgos curados. |
| `[KB]` | `01_species/pleurotus_djamor.md` — nueva sección "Cultivo Madre y Spawn" con datos de guide_002 (PDA/MEA 25±2°C pH 7, spawn 15–20 días, tasa inoculación 3%/10%); nota de precaución sobre cifra "CO₂ >1,500 ppm" de guide_002 (interpretada como techo de tolerancia, no objetivo — mantener 500–1,500 ppm como rango operacional). |

### 2026-07-16

| Tipo | Descripción |
|---|---|
| `[KB]` | Peritaje de fuentes: `paper_001` corregido a Zurbano et al. 2017; se retiró como respaldo de paja de trigo, BE 80–130% y FAE. `paper_002` (Mori 2008, celular/preclínico) se separó de `paper_007` (Mori 2009, ensayo clínico pequeño). |
| `[SOP]` | Ventilación corregida: ACH se calcula con caudal efectivo, duty cycle y volumen. El ciclo fijo 5/20 fue retirado; control por CO₂ y commissioning obligatorio. |
| `[ARCH]` | Identificadores operacionales migrados a `PREFIX-XXXX`; se registraron `STD`, `TMP`, `WF`, `DOR`, `AIR`, `QST` e `INC`. |
| `[EQUIP]` | Estados de inventario cambiados a `verification_required`; fechas de entrega se conservan como datos históricos, no como prueba de recepción. |
| `[ARCH]` | `FARM_BRAIN.md` y `CURRENT_OPERATIONS.md` actualizados al 2026-07-16 con confianza baja y verificación de campo como bloqueante. |

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
