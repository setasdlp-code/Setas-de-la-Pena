---
title: Registro de Decisiones — Setas de la Peña
category: meta
load_priority: selective
last_reviewed: 2026-07-17
---

# DECISIONS

Registro estructurado de decisiones operacionales, de ingeniería y de negocio que afectan el diseño del sistema. Cada decisión sigue el proceso definido en `SETAS_DE_LA_PENA_CANON.md` §16. Las decisiones aquí registradas no se revierten sin seguir el mismo proceso.

**Formato:** Cada decisión incluye contexto, alternativas evaluadas, decisión tomada, justificación y criterio de revisión.

---

## DEC-001 — Arquitectura de Automatización: ESP32 + ESPHome + Home Assistant

**Fecha:** 2026-06-29
**Estado:** Activa
**Área:** Automatización / Infraestructura

**Problema:** Seleccionar plataforma de automatización ambiental para control de T°, HR, CO₂ y FAE en cámaras de cultivo.

**Alternativas evaluadas:**

| Opción | Ventajas | Desventajas |
|---|---|---|
| Inkbird IBS-TH2 Plus (solo monitoreo) | Costo bajo, simple | Solo lectura — no actúa sobre actuadores |
| AC Infinity controller integrado | Plug-and-play | Cerrado, sin integración HA, limitado a sus dispositivos |
| Arduino + sensores custom | Flexible | Curva de desarrollo alta, sin OTA, no cloud |
| **ESP32 + ESPHome + HA** | Modular, OTA, integración amplia, comunidad activa | Requiere configuración inicial |

**Decisión:** ESP32 + ESPHome + Home Assistant en RPi4.

**Justificación:** Cumple los siete principios de ingeniería en orden de prioridad. No crea lock-in de proveedor. Permite OTA updates sin acceso físico. Integración con múltiples sensores y actuadores. Monitoreo y logging desde cualquier dispositivo. Comunidad y documentación amplia reduce riesgo de mantenimiento.

**Criterio de revisión:** Si ESPHome o HA introduce cambios que rompen compatibilidad con hardware existente, o si surge una alternativa que cumpla los mismos criterios a menor TCO, evaluar migración.

**Documentos afectados:** `05_equipment/environmental_control.md`

---

## DEC-002 — Sensor T/HR Principal: Sensirion SHT3x

**Fecha:** 2026-06-29
**Estado:** Activa
**Área:** Sensores / Automatización

**Problema:** Seleccionar sensor de temperatura y humedad relativa primario para módulos de producción.

**Alternativas evaluadas:**

| Opción | Precisión HR | Precio | Notas |
|---|---|---|---|
| VIVOSUN H05 integrado | ±30–35% (sesgo medido) | $0 (incluido) | **Descartado** — no confiable |
| Inkbird IBS-TH2 Plus | ±3% | Bajo | Válido como backup — no I²C |
| DHT22 | ±2–5% | Bajo | Reconocido por deriva en humedad alta |
| **SHT3x (Sensirion)** | ±2% | Medio | I²C, IP, compatibilidad ESPHome nativa |
| SHT31-D | ±2% | Medio | Similar al SHT3x — misma familia |

**Decisión:** SHT3x vía sonda AC Infinity como sensor primario. Inkbird como backup de verificación.

**Justificación:** Sensirion es el estándar de referencia en precisión para HR en aplicaciones exigentes. Dirección I²C fija 0x44. Compatible con ESPHome sin librería externa. Protección IP adecuada para ambiente húmedo. La sonda AC Infinity preserva el conector compatible con el ecosistema.

**Criterio de revisión:** Si se mide deriva superior al ±3% respecto al valor de referencia en campo, evaluar recalibración o sustitución.

**Documentos afectados:** `05_equipment/environmental_control.md`, `metadata/equipment.yaml`

---

## DEC-003 — Descarte del Sensor VIVOSUN H05

**Fecha:** 2026-06-29
**Estado:** Activa — **PERMANENTE hasta nueva medición de campo**
**Área:** Sensores

**Problema:** El sensor de HR integrado en el humidificador VIVOSUN H05 reporta lecturas consistentemente superiores al valor real.

**Evidencia:** Comparación cruzada con Inkbird IBS-TH2 Plus (sensor de referencia alternativo) mostró sesgo de +30–35% en lecturas de HR. El H05 reporta 90% cuando la HR real está entre 55–60%.

**Decisión:** El sensor H05 integrado está operacionalmente descartado. El humidificador H05 continúa en uso en modo manual. Su lectura de HR no se usa para ninguna decisión operacional.

**Justificación:** Un sesgo de +30–35% invierte la lógica de control: el operador ajustaría hacia abajo creyendo que HR es alta, cuando en realidad es baja. Esto genera caps resecas y pérdida de producción. El riesgo de usar la lectura supera cualquier conveniencia.

**Criterio de revisión:** Si se adquiere y calibra el H05 contra referencia certificada y se demuestra sesgo <±5%, re-evaluar. No reversar sin medición documentada.

**Documentos afectados:** `FARM_BRAIN.md`, `05_equipment/martha.md`, `metadata/equipment.yaml`

---

## DEC-004 — Especie Prioritaria Fase 1: Pleurotus djamor

**Fecha:** 2026-06-29
**Estado:** Activa
**Área:** Producción / Estrategia

**Problema:** Seleccionar especie primaria para producción en Fase 1, considerando las condiciones de Tenjo (2600m, 12–22°C), infraestructura disponible (sin autoclave), y tiempo de ciclo.

**Alternativas evaluadas:**

| Especie | T° Fruiting | Sustrato | Ciclo | Autoclave | Riesgo |
|---|---|---|---|---|---|
| P. ostreatus | 10–21°C | Paja | 35–50d | No | Bajo |
| **P. djamor** | 20–30°C | Paja | 28–40d | No | Bajo |
| H. erinaceus | 18–24°C | Master's Mix | 60–90d | Sí | Alto |
| L. edodes | 10–16°C | Serrín supl. | 90–150d | Sí | Alto |

**Decisión:** P. djamor como especie #1. P. ostreatus como alternativa de validación si temperatura en Tenjo resulta insuficiente para djamor.

**Justificación:** Ciclo corto (7–10 días desde pins), alta tolerancia a CO₂, no requiere autoclave, BE de 80–130% en paja de trigo. Adaptación tropical permite operar sin calefacción en épocas cálidas. Precio premium en mercado gourmet colombiano.

**Riesgo conocido:** T° nocturna en Tenjo puede bajar de 18°C en invierno andino — monitorear con Inkbird. Si T° nocturna <18°C sostenida, introducir calefactor PTC.

**Criterio de revisión:** Si BE promedio de tres lotes consecutivos es <70%, o si temperatura ambiente impide alcanzar 20°C sin calefacción activa, re-evaluar introducir P. ostreatus primero.

**Documentos afectados:** `FARM_BRAIN.md`, `01_species/pleurotus_djamor.md`, `metadata/species.yaml`

---

## DEC-005 — Sustrato Inicial: Paja de Trigo Pasteurizada

**Fecha:** 2026-06-29
**Estado:** Activa
**Área:** Producción / Sustratos

**Problema:** Seleccionar sustrato para Fase 1 dado que no existe autoclave y el insumo debe ser localmente disponible.

**Decisión:** 100% paja de trigo pasteurizada + 1–2% yeso (CaSO₄·2H₂O), spawn al 15% del peso seco.

**Justificación:** Pasteurización no requiere autoclave. Paja de trigo disponible en Sabana de Bogotá. BE de 80–130% con P. djamor documentada en literatura Tier 1. Eucalipto explícitamente excluido — inhibidor comprobado.

**Criterio de revisión:** Tras tres lotes, comparar BE real con proyección. Si BE <70%, investigar calidad de paja local como causa antes de cambiar sustrato.

**Documentos afectados:** `02_substrates/substrate_library.md`, `02_substrates/pasteurization.md`

---

## DEC-006 — Control de ventilación: CO₂ + relay ESP32

**Fecha:** 2026-06-29
**Estado:** Activa
**Área:** Automatización / FAE

**Problema:** Seleccionar un mecanismo de ventilación que responda al estado real de la cámara y permita demostrar el intercambio de aire efectivo.

**Alternativas evaluadas:**

| Opción | Variable de control | Monitoreo | Limitación |
|---|---|---|---|
| Timer mecánico | Tiempo fijo | No | No demuestra ACH ni responde a CO₂ |
| Timer digital | Tiempo fijo | Parcial | Repite un ciclo aunque cambien caudal, filtros o carga |
| **CO₂ + relay ESP32/HA** | CO₂, con línea base de caudal | Sí — log continuo | Requiere commissioning y límites locales de seguridad |

**Decisión:** Relay controlado por ESP32/ESPHome, con control primario por CO₂ y límites locales de seguridad. La línea base se define después de medir el caudal efectivo instalado y calcular ACH con el volumen y el duty cycle reales. El timer mecánico queda descartado como control principal.

**Justificación:** Un intervalo ON/OFF no equivale a cambios de aire por hora. El caudal nominal se reduce con ductos, filtros, curvas y compuertas, y la demanda cambia con la carga biológica. CO₂, caudal efectivo y morfología permiten validar la respuesta real; el relay aporta registro y alertas.

**Criterio de revisión:** Revisar después del commissioning o si la curva de CO₂, la HR o la morfología muestran que la línea base no mantiene el rango provisional.

**Documentos afectados:** `FARM_BRAIN.md`, `05_equipment/environmental_control.md`

---

## DEC-007 — Convención de Registro de Fuentes: Esquema Único (no SRC-)

**Fecha:** 2026-07-04
**Estado:** Activa
**Área:** Arquitectura de conocimiento / Meta

**Problema:** Al curar la guía IMiBio 2019 se creó un registro `SRC-0004.md` en una carpeta nueva `11_sources/`, introduciendo un segundo esquema de IDs en paralelo al catálogo existente (`paper_/book_/web_`) de `09_research/literature_index.md`. Había que decidir la convención única de registro de fuentes.

**Alternativas evaluadas:**

| Opción | Ventajas | Desventajas |
|---|---|---|
| A — Consolidar en `paper_/book_/web_/guide_` (índice existente) | Un solo índice, sin carpeta nueva, mínima superficie | Registros menos detallados por fuente |
| B — Adoptar `SRC-####` global + `11_sources/` | Registro rico por fuente, esquema unificado | Requiere migrar catálogo existente; más estructura |
| C — Mantener ambos con regla explícita | Índice ligero + registro detallado | Dos esquemas que mantener sincronizados |

**Decisión:** Opción A. La convención `SRC-####` y la carpeta `11_sources/` quedan descartadas. Las fuentes se catalogan bajo el esquema único `paper_/book_/web_/guide_` en `09_research/literature_index.md`, con cita APA en `references/bibliography.md`. La guía IMiBio se registró como `guide_001`.

**Justificación:** P-02 (simplicidad sobre sofisticación) y CANON §Documentación: dos esquemas de IDs para el mismo tipo de objeto crean pasivo de mantenimiento y riesgo de desincronización. El volumen actual de fuentes no justifica registros por-archivo. Se prefirió mejorar el índice existente sobre crear una jerarquía nueva.

**Criterio de revisión:** Si el ritmo de curaduría exige registros extensos por fuente de forma recurrente (metadatos, auditoría de dominios, cross-refs por cada fuente), re-evaluar la opción C con una regla de sincronización documentada.

**Limpieza completada (2026-07-08):** la carpeta `knowledge_base/11_sources/` (incluido el tombstone `SRC-0004.md`) fue eliminada con `git rm` — su contenido permanece recuperable en la historia de git. La línea correspondiente se retiró de `REPOSITORY_MAP.md`. Ver `CHANGELOG.md` 2026-07-08.

**Limpieza de alias completada (2026-07-16):** los alias activos `SRC-0005` / `SRC-0006` fueron reemplazados por `paper_006` / `book_005`. Las menciones que permanecen en esta decisión y en el changelog son historia de la migración, no identificadores vigentes.

**Documentos afectados:** `09_research/literature_index.md`, `references/bibliography.md`, `knowledge_base/11_sources/` (eliminada)

---

## DEC-008 — Reconciliación de Arquitectura: la documentación de gobernanza refleja el filesystem real

**Fecha:** 2026-07-08
**Estado:** Activa
**Área:** Arquitectura de conocimiento / Meta

**Problema:** La auditoría de onboarding detectó dos arquitecturas paralelas no reconciliadas. La capa de gobernanza en inglés (`00_project/REPOSITORY_MAP.md`, `AI_AGENT_PROTOCOL.md`, `KNOWLEDGE_ARCHITECTURE.md`, `SYSTEM_FLOW.md`) describe una estructura de carpetas idealizada que **no existe** (`05_laboratory/`, `10_living/`, un árbol `operations/` de nivel superior), mientras que el filesystem real y todos los documentos de dominio usan `05_equipment/`, documentos vivos en la raíz de `knowledge_base/`, `10_ai_workflows/` y `11_sources/`. Un agente que siga el `REPOSITORY_MAP` canónico no encuentra los documentos vivos centrales y puede aplicar un orden de precedencia incorrecto.

**Alternativas evaluadas:**

| Opción | Ventajas | Desventajas |
|---|---|---|
| A — Mover el filesystem para que coincida con la gobernanza (`05_equipment`→`05_laboratory`, vivos→`10_living/`, crear `operations/`) | Alinea con el diseño idealizado en inglés | Invierte decenas de cross-references que ya son correctos; mueve muchos archivos; riesgo alto para historia y enlaces |
| B — Corregir los documentos de gobernanza para reflejar el filesystem real | Mínimos movimientos de archivos; mínimas referencias rotas; preserva historia; solo cambian ~3–4 archivos de navegación (los menos referenciados) | La estructura idealizada en inglés se descarta como aspiracional |

**Decisión:** Opción B. **Los documentos de gobernanza y navegación deben reflejar el filesystem real, no una estructura aspiracional.** Cuando un documento de gobernanza y el filesystem discrepen sobre una ruta o nombre de carpeta, el filesystem es la verdad y el documento de gobernanza se corrige.

**Justificación:** P-02 (simplicidad sobre sofisticación) y P-04 (documentación como infraestructura): un mapa de navegación que apunta a carpetas inexistentes es un pasivo, no un activo. La opción B satisface simultáneamente cuatro restricciones de migración: minimiza movimientos de archivos, minimiza referencias rotas, preserva la historia de git (ediciones en sitio, no movimientos) y prioriza la mantenibilidad al concentrar el cambio en la capa de navegación. La capa `05_laboratory/`/`10_living/`/`operations/` era aspiracional y nunca se instanció; adoptarla ahora requeriría reescribir la estructura funcional del repositorio.

**Alcance de esta decisión (Fase 1):** correcciones de rutas en `REPOSITORY_MAP.md`, `AI_AGENT_PROTOCOL.md`, `KNOWLEDGE_ARCHITECTURE.md`, `SYSTEM_FLOW.md` y `EDITORIAL_GUIDELINES.md`. No se renombran ni mueven carpetas. No se cambian parámetros de cultivo ni convenciones de identificadores.

**Nota sobre el sistema "Operations" (System 2):** El árbol `operations/` descrito en `KNOWLEDGE_ARCHITECTURE.md` y `SYSTEM_FLOW.md` queda marcado como **planificado, aún no instanciado**. Su instanciación se difiere hasta el primer lote de producción (ver plan de migración, Fase 3). Hasta entonces, las plantillas de registro operacional viven en `06_operations/` (`daily_operational_review_template.md`, `daily_ai_review.md`).

**Criterio de revisión:** Si en el futuro se decide adoptar formalmente la estructura idealizada (p. ej. una carpeta `operations/` real o un `05_laboratory/` dedicado), esta decisión se revisa mediante el proceso de CANON §16 y las carpetas se mueven con `git mv` para preservar historia.

**Documentos afectados:** `00_project/REPOSITORY_MAP.md`, `00_project/KNOWLEDGE_ARCHITECTURE.md`, `00_project/SYSTEM_FLOW.md`, `00_project/EDITORIAL_GUIDELINES.md`

**Nota de corrección (2026-07-09):** `00_project/AI_AGENT_PROTOCOL.md` no requirió corrección de rutas bajo el alcance de esta decisión — su §4/§6 no contenían referencias de ruta rotas. El documento sí fue corregido posteriormente, pero por un motivo distinto (jerarquía de precedencia, no rutas) bajo DEC-009.

---

## DEC-009 — Jerarquía de Precedencia Canónica: modelo de dos ejes (Autoridad Normativa vs. Estado Operacional)

**Fecha:** 2026-07-08
**Estado:** Activa
**Área:** Arquitectura de conocimiento / Meta

**Problema:** `SETAS_DE_LA_PENA_CANON.md` §14, `AI_AGENT_PROTOCOL.md` §6 y `EDITORIAL_GUIDELINES.md` §4 definían tres órdenes de precedencia distintos y mutuamente contradictorios. La discrepancia sustantiva: `AI_AGENT_PROTOCOL` colocaba `DECISIONS.md` por encima del CANON (rango 1), mientras que el CANON y su propia política de revisión (§16, §21) sostienen que una decisión no puede anular un principio de gobernanza — una decisión opera dentro de los principios, no por encima de ellos. Además, el CANON no incluía `DECISIONS.md` en su lista, y ninguno de los tres distinguía entre "qué documento tiene razón en un conflicto" (autoridad normativa) y "qué está pasando ahora mismo" (estado operacional) — dos preguntas distintas que los documentos mezclaban en una sola lista lineal.

**Alternativas evaluadas:**

| Opción | Ventajas | Desventajas |
|---|---|---|
| A — Mantener las tres listas y remendar solo las contradicciones obvias | Cambio mínimo | No resuelve la mezcla conceptual autoridad/estado; deja la puerta abierta a nuevas divergencias |
| B — Elegir una de las tres listas existentes como única fuente | Cambio pequeño | Ninguna de las tres modela correctamente la diferencia entre autoridad normativa y estado operacional actual (`FARM_BRAIN.md`/`CURRENT_OPERATIONS.md` no son "menos autoritativos", son "más recientes pero no vinculantes") |
| **C — Modelo de dos ejes: Autoridad Normativa + Estado Operacional, definido una sola vez en CANON §14** | Resuelve la mezcla conceptual; una sola fuente de verdad; los tres documentos que antes restababan la jerarquía ahora la referencian | Requiere editar el CANON (autorización del owner) |

**Decisión:** Opción C. `SETAS_DE_LA_PENA_CANON.md` §14 es la única fuente de verdad para precedencia documental, estructurada en dos ejes independientes:

- **Autoridad Normativa** (§14.1) — determina qué documento prevalece en un conflicto: CANON → Estándares de Gobernanza (`EDITORIAL_GUIDELINES`, `SYSTEM_FLOW`, `AI_AGENT_PROTOCOL`, `KNOWLEDGE_ARCHITECTURE`, `IDENTIFIER_STANDARD`, `REPOSITORY_MAP`, `README_MCP`) → `DECISIONS.md` → Conocimiento Canónico (`01_species/`…`05_equipment/`) → SOPs y Workflows (`06_operations/`, `10_ai_workflows/`) → Lecciones y Registro Histórico (`LESSONS_LEARNED.md`, `CHANGELOG.md`) → Biblioteca de Investigación (`09_research/`, `references/`) → Negocio y Marca (`07_business/`, `08_brand/`) → Archivo/material obsoleto.
- **Estado Operacional** (§14.2) — describe qué está pasando ahora: `CURRENT_OPERATIONS.md` → `FARM_BRAIN.md` → registros de lote → revisiones diarias → exports de sensores. Nunca anula la Autoridad Normativa, sin importar qué tan reciente sea.

`AI_AGENT_PROTOCOL.md` §6, `EDITORIAL_GUIDELINES.md` §4 y `SYSTEM_FLOW.md` §11 se corrigieron para referenciar CANON §14 en lugar de restablecer una jerarquía propia.

**Justificación:** P-02 (simplicidad) y P-04 (documentación como infraestructura): tres listas de precedencia divergentes son un pasivo activo — un agente puede aplicar un orden incorrecto según qué documento cargue primero. Separar autoridad normativa de estado operacional resuelve la confusión de fondo (un documento operacional como `FARM_BRAIN.md` es más *actual* pero nunca más *autoritativo* que el CANON o una SOP vigente) sin necesidad de mantener listas paralelas. Investigación (`09_research/`) informa decisiones pero no las anula sin revisión formal (CANON §16); una lección (`LESSONS_LEARNED.md`) es autoritativa solo tras convertirse en decisión o incorporarse a un documento canónico.

**Criterio de revisión:** Si la operación demuestra que el modelo de dos ejes es insuficiente para un caso real de conflicto, se revisa mediante el proceso de CANON §16.

**Documentos afectados:** `SETAS_DE_LA_PENA_CANON.md` (§14), `00_project/AI_AGENT_PROTOCOL.md` (§6), `00_project/EDITORIAL_GUIDELINES.md` (§4), `00_project/SYSTEM_FLOW.md` (§11)

---

## DEC-010 — Autorización Arquitectónica de Fase 2: Transformación a Sistema de Conocimiento AI-Nativo

**Fecha:** 2026-07-09
**Estado:** Activa
**Área:** Arquitectura de conocimiento / Meta

**Problema:** `ARCHITECTURE_STATUS.md` declara la arquitectura como **Frozen** y establece que "no se deben crear nuevos documentos arquitectónicos a menos que exista una necesidad operacional demostrada que no pueda resolverse dentro de la estructura actual." La Fase 2 propone crear varios documentos nuevos en la capa de gobernanza/arquitectura (`SYSTEM_MAP.md`, `ROADMAP.md`, `CROSS_REFERENCE_STANDARD.md`, `INDEX.yaml`) y extender `AI_AGENT_PROTOCOL.md`. Bajo `EDITORIAL_GUIDELINES.md` §5.7, esto se clasifica como cambio **Arquitectónico**, que requiere decisión formal en `DECISIONS.md` antes de implementarse — el mismo proceso usado para DEC-008 y DEC-009 en Fase 1.

**Evidencia:** El repositorio no tiene actualmente ningún catálogo legible por máquina de sus documentos, ni una especificación unificada de recuperación para agentes de IA. `AI_AGENT_PROTOCOL.md`, `SYSTEM_FLOW.md` y `REPOSITORY_MAP.md` fueron diseñados y estabilizados en Fase 1 para consumo humano y de agentes vía lectura de Markdown; ninguno anticipa un índice estructurado ni relaciones máquina-legibles entre documentos (`depends_on`, `implemented_by`, `supersedes`).

**Alternativas evaluadas:**

| Opción | Ventajas | Desventajas |
|---|---|---|
| A — No crear nuevos documentos; forzar el contenido de Fase 2 dentro de archivos existentes (p. ej. anexar el índice máquina-legible dentro de `REPOSITORY_MAP.md`) | Cumple la letra de "Architecture: Frozen" sin excepción | Distorsiona el alcance declarado de los documentos existentes (`REPOSITORY_MAP.md` es explícitamente "navigation layer only... must never become a knowledge document" — un catálogo YAML con relaciones máquina-legibles no es navegación, es un tipo de contenido distinto) |
| **B — Autorizar la expansión bajo el Criterio Arquitectónico #3 de `ARCHITECTURE_STATUS.md`** ("una nueva capacidad no puede representarse en la arquitectura existente sin distorsión") | Evidencia concreta y verificable de que la capacidad (catálogo legible por máquina, especificación de recuperación IA) no existe hoy; preserva el alcance de cada documento existente; sigue el mismo proceso formal que ya validó DEC-008/DEC-009 | Requiere una entrada formal de decisión antes de proceder (fricción menor, intencional) |

**Decisión:** Opción B. Se autoriza la Fase 2 — creación de `00_project/SYSTEM_MAP.md`, `/README.md`, `00_project/ROADMAP.md`, `00_project/CROSS_REFERENCE_STANDARD.md`, `INDEX.yaml`, y una extensión de sección en `AI_AGENT_PROTOCOL.md` — bajo el Criterio Arquitectónico #3 de `ARCHITECTURE_STATUS.md`. Esta autorización es la precondición para cada documento listado; ningún documento de Fase 2 se crea sin esta entrada de decisión precedente.

**Alcance explícito de esta decisión:**
- **Autoriza:** la creación de los cinco artefactos listados arriba, y una actualización de mantenimiento a `ARCHITECTURE_STATUS.md` (tabla de estado y cifras de madurez) al cierre de Fase 2.
- **No autoriza:** cambios a parámetros de cultivo, convenciones de identificadores, movimiento de carpetas, ni reestructuración de documentos de gobernanza existentes más allá de las ediciones puntuales aprobadas (una línea en `EDITORIAL_GUIDELINES.md` §5.4 apuntando a `CROSS_REFERENCE_STANDARD.md`; la nueva sección en `AI_AGENT_PROTOCOL.md`).
- **No autoriza:** modificar el modelo de dos ejes de CANON §14 — permanece intacto salvo que surja un bloqueador de implementación, en cuyo caso se documentaría una decisión separada antes de tocarlo.
- **No autoriza:** poblar `INDEX.yaml` como catálogo completo — solo esquema y ejemplos representativos; la población completa queda pendiente de una fase futura (ver `ROADMAP.md`).

**Justificación:** CANON P-02 (simplicidad) y `ARCHITECTURE_STATUS.md` mismo ("Document count is not a success metric") exigen que cualquier expansión arquitectónica esté justificada por una capacidad ausente, no por preferencia estética. La Fase 2 cumple el Criterio #3 porque el catálogo legible por máquina y la especificación de recuperación de IA son capacidades que genuinamente no existen en ningún documento actual — intentar encajarlas en `REPOSITORY_MAP.md` o `AI_AGENT_PROTOCOL.md` sin extensión formal distorsionaría el alcance declarado de esos documentos (Opción A, descartada).

**Criterio de revisión:** Si la Fase 2 no logra demostrar valor operacional medible (uso real de `INDEX.yaml` o del retrieval spec por agentes de IA) dentro de un ciclo de revisión, se reevalúa si los documentos creados deben archivarse, consolidarse o mantenerse, siguiendo el proceso de CANON §16.

**Documentos afectados:** `ARCHITECTURE_STATUS.md` (evolución de política, actualización diferida al cierre de Fase 2), y todos los documentos de Fase 2 listados arriba.

---

## DEC-011 — Arquitectura de INDEX.yaml: Infraestructura Generada, no Catálogo Mantenido a Mano

**Fecha:** 2026-07-09
**Estado:** Activa
**Área:** Arquitectura de conocimiento / Meta

**Problema:** DEC-010 autorizó `INDEX.yaml` solo en etapa de esquema, difiriendo explícitamente la población completa a "una fase futura" con su propia decisión CANON §16. La pregunta que quedaba sin resolver no era *cuándo* poblar `INDEX.yaml` a mano, sino *qué es* arquitectónicamente `INDEX.yaml`: ¿un documento editorial que además contiene datos estructurados, o un artefacto generado derivado determinísticamente del repositorio? Son categorías distintas, con modos de fallo distintos, y la gobernanza del repositorio aún no había decidido cuál de las dos es.

**Evidencia:**
- La mayoría del esquema de `INDEX.yaml` ya duplica datos que existen en el origen: `title`, `category`, `confidence`, `supersedes`/`superseded_by` ya son campos de frontmatter en los documentos mismos; `related_documents` ya existe como frontmatter en la mayoría de documentos de dominio hoy.
- Los datos equivalentes a `source_documents` ya existen en línea en la sección "References" de cada documento de dominio, como tags `[paper_001]`/`[book_007]`/`[guide_002]` — una convención ya consistente y parseable, no una que haya que inventar.
- Ningún documento del repositorio tiene hoy `canonical`, `topics`, `keywords`, `depends_on` ni `implemented_by` como frontmatter — existen solo dentro del esquema de `INDEX.yaml`, sin hogar de origen propio.
- No existe herramienta de validación, CI, ni generador en el repositorio hoy — cualquier arquitectura de generación es infraestructura nueva, no una conexión a algo que ya funciona.
- `IDENTIFIER_STANDARD.md` §5.3 ya registra un prefijo `DOC` ("Repository Document") sin usar, mientras el esquema actual de `INDEX.yaml` usa una convención kebab-case no relacionada — dos gramáticas de identificador paralelas para el mismo tipo de objeto, el mismo problema estructural que DEC-007 ya resolvió una vez para IDs de fuentes de investigación.
- CANON §14.1 declara la membresía de niveles como listas de prosa en Markdown, no como datos estructurados — `ROADMAP.md` ya nombra este hecho específico ("CANON §14.1 tier-membership decoupling") como deuda técnica abierta, independiente de esta decisión.
- `CROSS_REFERENCE_STANDARD.md` §4 diseña hoy para corregir el desfase después de detectado ("si una referencia en el cuerpo del texto y una entrada aquí discrepan, la referencia en el cuerpo gobierna"), no para prevenirlo — una admisión explícita de que la arquitectura actual espera que `INDEX.yaml` se desactualice y confía en que alguien lo note.

**Alternativas evaluadas:**

| Opción | Ventajas | Desventajas |
|---|---|---|
| A — Mantener el esquema sin poblar indefinidamente | Cero riesgo adicional; ya es el estado autorizado por DEC-010 | Nunca satisface el propio criterio de éxito de `ROADMAP.md` para la Fase 2 ("una capa de recuperación que existe pero nunca es usada por un agente sería una Fase 2 fallida"); es un punto de paso correcto, no un destino permanente |
| B — Clasificar `INDEX.yaml` como infraestructura generada (artefacto derivado determinísticamente del frontmatter y de CANON §14), población manual descartada como modelo de mantenimiento | Elimina el desfase por construcción para la mayoría de los campos; mantiene una sola fuente de verdad por dato (P-02); dirección consistente con cómo el repositorio ya trata otros datos derivados (`references/bibliography.md`, `metadata/*.yaml`) | Requiere infraestructura nueva (generador, validación, posiblemente CI) antes de dar ningún beneficio — coste real, no trivial |
| C — Arquitectura alternativa (base de datos, búsqueda por embeddings, o abandonar `INDEX.yaml`) | — | Base de datos es infraestructura desproporcionada a la escala actual (~70-100 documentos) y contradice el aplazamiento explícito de migración a almacenamiento estructurado en `KNOWLEDGE_ARCHITECTURE.md`; embeddings sacrifican los campos estructurados y atribuibles (`source_documents`, `confidence`) que exige la disciplina de citación de CANON §9; abandonar `INDEX.yaml` repite el fallo de la Opción A sin evidencia de que la capacidad haya fallado, solo de que aún no se ha probado |

**Decisión:** Opción B. `INDEX.yaml` se clasifica arquitectónicamente como **infraestructura generada** — un artefacto derivado determinísticamente del repositorio (frontmatter de los documentos de origen más la tabla de membresía de niveles de CANON §14) — y no como contenido editorial mantenido a mano. La población manual completa queda descartada permanentemente como modelo de mantenimiento, independientemente de cuándo se autorice la población.

**Alcance explícito de esta decisión:**
- **Autoriza únicamente:** la dirección arquitectónica — que `INDEX.yaml`, cuando se popule, sea un artefacto generado y no un documento mantenido a mano.
- **No autoriza:** la implementación del generador.
- **No autoriza:** la construcción de CI.
- **No autoriza:** la población completa de `INDEX.yaml`.
- **No autoriza:** la migración o adición de campos de frontmatter en documentos de origen.
- **No autoriza:** cambios a CANON §14 — la tabla de membresía de niveles que el generador necesitaría puede vivir como configuración interna del generador o en `REPOSITORY_MAP.md`, sin tocar CANON.
- Cada uno de los puntos anteriores requiere su propia decisión de seguimiento bajo el proceso de CANON §16 antes de implementarse, siguiendo el mismo patrón que DEC-010 ya estableció para la Fase 2.

**Justificación:** Poblar `INDEX.yaml` a mano violaría los tres principios que DEC-010 ya invocó para diferir la población: **P-02** (simplicidad) porque escribir a mano `title`/`path`/`category`/`confidence`/`supersedes` cuando esos hechos ya viven en el frontmatter de origen crea una segunda copia sincronizada manualmente — la misma forma de fallo que la Fase 1 ya corrigió para las reglas de autoridad (DEC-008/DEC-009), reaparecida un nivel más abajo; **P-04** (documentación como infraestructura) porque un catálogo poblado a mano y sin validar es un pasivo activo — una entrada obsoleta no es silencio, es una afirmación falsa con apariencia de infraestructura confiable; **P-05** (medición antes que optimización) porque poblar ~70 entradas es una inversión de optimización sustancial hecha antes de cualquier señal de uso real que la justifique. Un artefacto generado resuelve los tres a la vez: el dato vive una sola vez, en su origen; una entrada desactualizada se vuelve estructuralmente imposible en vez de solo detectable después.

**Criterio de revisión:** Si en el futuro se determina que un artefacto generado es inviable (p. ej. el volumen de campos de juicio editorial —`topics`, `keywords`, `depends_on`, `implemented_by`— resulta demasiado alto para justificar la infraestructura de generación), esta decisión se revisa mediante el proceso de CANON §16, con evidencia concreta del fallo, no por preferencia.

**Documentos afectados:** únicamente `DECISIONS.md` (esta entrada). Ningún otro documento se modifica por esta decisión — específicamente, `INDEX.yaml`, `AI_AGENT_PROTOCOL.md`, `CROSS_REFERENCE_STANDARD.md`, `ROADMAP.md` y `ARCHITECTURE_STATUS.md` permanecen intactos hasta que una decisión de seguimiento autorice cada paso de implementación listado arriba.

---

## DEC-012 — Línea Base de Validación de Recuperación (Retrieval Validation Baseline)

**Fecha:** 2026-07-09
**Estado:** Activa
**Área:** Recuperación de IA / Validación

**Problema:** DEC-010 y DEC-011 autorizaron `INDEX.yaml` en etapa de esquema y su clasificación como infraestructura generada, pero ninguna decisión había medido aún si la capa de recuperación actual funciona en la práctica. Esta decisión registra la primera medición — Baseline v0 — y fija el vocabulario de métricas para toda medición futura, sin autorizar todavía la implementación del generador descrito en `INDEX_GENERATION_SPEC.md`.

**Evidencia — Baseline v0 (5 consultas de prueba):**

| Métrica | Resultado |
|---|---|
| Tasa de descubrimiento de documento canónico | 5/5 |
| Tasa de uso de fallback (búsqueda completa del repositorio) | 3/5 |
| Fricción de recuperación | 2/5 |
| Corrección de resolución de autoridad | 5/5 |
| Detección de conflictos | No medida en Baseline v0 |
| Reporte de confianza | 5/5 |

**Vocabulario fijo de métricas** (único vocabulario válido para reportar resultados de recuperación en este repositorio; Baseline v1 y sucesivas deben usar estos nombres, no métricas ad hoc):
1. Tasa de descubrimiento de documento canónico
2. Tasa de fallback
3. Fricción de recuperación
4. Corrección de resolución de autoridad
5. Detección de conflictos
6. Reporte de confianza

**Decisión:** Se registra Baseline v0 con los resultados de arriba y se fija el vocabulario de seis métricas como estándar del repositorio. **Baseline v1 debe realizarse antes de que cualquier decisión autorice la implementación del generador** — Baseline v0, con solo 5 consultas, es señal inicial, no evidencia suficiente para justificar esa inversión (CANON P-05).

**Regla — tolerancia cero en resolución de autoridad:** la corrección de resolución de autoridad no admite margen de error. Un solo resultado incorrecto en esta métrica, en cualquier baseline futuro, exige investigación inmediata — no se promedia ni se compensa con buenos resultados en las demás métricas, porque CANON §14 depende de esta corrección para toda la jerarquía de precedencia del repositorio.

**Regla — umbrales numéricos diferidos:** los umbrales de aceptación para tasa de fallback y detección de conflictos quedan deliberadamente sin definir hasta Baseline v1. Fijar un umbral con una sola medición de 5 consultas sería optimización antes de medición (P-05).

**Corrección importante — método de prueba para detección de conflictos:** esta decisión **no autoriza introducir conflictos deliberados en documentos canónicos del repositorio** para poblar la métrica de detección de conflictos. Cualquier prueba futura de detección de conflictos debe usar fixtures sintéticos, snapshots de prueba aislados, conflictos históricos ya resueltos (p. ej. los que motivaron DEC-009), u otro método que no pueda contaminar el conocimiento canónico del repositorio.

**Alcance explícito de esta decisión:**
- **Autoriza únicamente:** (a) registrar Baseline v0; (b) fijar el vocabulario de las seis métricas; (c) exigir Baseline v1 antes de cualquier decisión de implementación del generador.
- **No autoriza:** implementación del generador; CI; población de `INDEX.yaml`; migración de frontmatter; cambios a CANON; creación de infraestructura de pruebas sintéticas; creación de `RETRIEVAL_VALIDATION_PROTOCOL.md` ni ningún otro documento nuevo.

**Criterio de revisión:** al completarse Baseline v1, esta entrada se revisa para fijar los umbrales diferidos arriba y para decidir, con evidencia de más de un ciclo, si la implementación del generador queda justificada.

**Documentos afectados:** únicamente `DECISIONS.md` (esta entrada). `INDEX.yaml`, `INDEX_GENERATION_SPEC.md`, `AI_AGENT_PROTOCOL.md`, CANON, `ROADMAP.md` y `ARCHITECTURE_STATUS.md` permanecen intactos.

---

## DEC-013 — Fuente canónica integrada y calidad automática

**Fecha:** 2026-07-17
**Estado:** Activa
**Área:** Arquitectura de repositorio / Calidad

**Problema:** La base de conocimiento existía simultáneamente en `setasdlp-code/Knowledge-Base` y dentro del monorepo `setasdlp-code/Setas-de-la-Pena`, con divergencias científicas, operativas y arquitectónicas. Mantener edición bidireccional produciría nuevas contradicciones. DEC-012, además, no autorizaba todavía CI.

**Alternativas evaluadas:**

| Opción | Ventaja | Riesgo |
|---|---|---|
| Mantener dos copias editables | Separación aparente | Divergencia recurrente y autoridad ambigua |
| Submódulo privado | Historial aislado | Mayor fricción de clonación, permisos y edición |
| **Monorepo canónico + remoto histórico** | Una sola ruta de cambio y CI integrado | Requiere una reconciliación inicial explícita |

**Decisión:** `setasdlp-code/Setas-de-la-Pena/knowledge_base` es la copia canónica integrada. `setasdlp-code/Knowledge-Base` se conserva como referencia histórica y fuente de la reconciliación de 2026-07-17, pero no recibe ediciones independientes. Se autoriza CI para validar estructura, formatos, rutas, secretos, archivos excluidos y regresiones científicas/FAE conocidas.

**Límites:** Esta decisión no autoriza el generador de `INDEX.yaml`, su población completa, automatización física, cambios de parámetros productivos ni publicación de PDFs fuente. Los datos de ejemplo de ECC no constituyen evidencia operacional.

**Justificación:** Una sola copia editable elimina el conflicto de autoridad. El CI verifica propiedades deterministas sin presentar inferencias biológicas como hechos ni ampliar el alcance aprobado por DEC-012.

**Criterio de revisión:** Revisar si el monorepo se vuelve inmanejable, si los permisos requieren separar la documentación o si una herramienta demuestra que un submódulo/subtree reduce fricción sin reintroducir duplicidad.

**Documentos afectados:** `README.md`, `knowledge_base/`, `.github/workflows/quality.yml`, `scripts/quality/`.

---

## Plantilla para nuevas decisiones

```markdown
## DEC-NNN — Título

**Fecha:** YYYY-MM-DD
**Estado:** Activa / Revisada / Revertida
**Área:** [Automatización / Producción / Negocio / Investigación / etc.]

**Problema:** [Qué había que decidir y por qué importaba]

**Alternativas evaluadas:**
[Tabla comparativa mínima con 2 opciones]

**Decisión:** [Qué se decidió]

**Justificación:** [Por qué — en términos de los principios del Canon]

**Criterio de revisión:** [Qué condición activaría re-evaluación]

**Documentos afectados:** [Lista de archivos que reflejan esta decisión]
```

---

*Las decisiones se revisan solo cuando el criterio de revisión se cumple o cuando nueva evidencia Tier 1 contradice la justificación original.*
*El proceso de revisión sigue `SETAS_DE_LA_PENA_CANON.md` §16.*
