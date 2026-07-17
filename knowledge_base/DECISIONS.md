---
title: Registro de Decisiones — Setas de la Peña
category: meta
load_priority: selective
---

# DECISIONS

Registro estructurado de decisiones operacionales, de ingeniería y de negocio que afectan el diseño del sistema. Cada decisión sigue el proceso definido en `SETAS_DE_LA_PENA_CANON.md` §16. Las decisiones aquí registradas no se revierten sin seguir el mismo proceso.

**Formato:** Cada decisión incluye contexto, alternativas evaluadas, decisión tomada, justificación y criterio de revisión.

---

## DEC-0001 — Arquitectura de Automatización: ESP32 + ESPHome + Home Assistant

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

## DEC-0002 — Sensor T/HR Principal: Sensirion SHT3x

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

## DEC-0003 — Descarte del Sensor VIVOSUN H05

**Fecha:** 2026-06-29
**Estado:** Activa — **PERMANENTE hasta nueva medición de campo**
**Área:** Sensores

**Problema:** El sensor de HR integrado en el humidificador VIVOSUN H05 reporta lecturas consistentemente superiores al valor real.

**Evidencia:** Comparación cruzada con Inkbird IBS-TH2 Plus (sensor de referencia alternativo) mostró sesgo de +30–35% en lecturas de HR. El H05 reporta 90% cuando la HR real está entre 55–60%.

**Decisión:** El sensor H05 integrado está operacionalmente descartado. Si el humidificador H05 está presente y supera inspección, solo se autoriza en modo manual. Su lectura de HR no se usa para ninguna decisión operacional.

**Justificación:** Un sesgo de +30–35% invierte la lógica de control: el operador ajustaría hacia abajo creyendo que HR es alta, cuando en realidad es baja. Esto genera caps resecas y pérdida de producción. El riesgo de usar la lectura supera cualquier conveniencia.

**Criterio de revisión:** Si se adquiere y calibra el H05 contra referencia certificada y se demuestra sesgo <±5%, re-evaluar. No reversar sin medición documentada.

**Documentos afectados:** `FARM_BRAIN.md`, `05_equipment/martha.md`, `metadata/equipment.yaml`

---

## DEC-0004 — Especie Prioritaria Fase 1: Pleurotus djamor

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

**Justificación:** Ciclo corto (7–10 días desde pins), tolerancia operacional a CO₂ dentro del rango provisional adoptado y posibilidad de usar paja pasteurizada sin autoclave. guide_002 reporta BE potencial de 80–100%, pero la paja y el proceso locales aún requieren validación. La adaptación tropical puede reducir calefacción en épocas cálidas; la temperatura nocturna sigue siendo un riesgo.

**Riesgo conocido:** T° nocturna en Tenjo puede bajar de 18°C en invierno andino — monitorear con Inkbird. Si T° nocturna <18°C sostenida, introducir calefactor PTC.

**Criterio de revisión:** Si BE promedio de tres lotes consecutivos es <70%, o si temperatura ambiente impide alcanzar 20°C sin calefacción activa, re-evaluar introducir P. ostreatus primero.

**Documentos afectados:** `FARM_BRAIN.md`, `01_species/pleurotus_djamor.md`, `metadata/species.yaml`

---

## DEC-0005 — Sustrato Inicial: Paja de Trigo Pasteurizada

**Fecha:** 2026-06-29
**Estado:** Activa
**Área:** Producción / Sustratos

**Problema:** Seleccionar sustrato para Fase 1 dado que no existe autoclave y el insumo debe ser localmente disponible.

**Decisión:** 100% paja de trigo pasteurizada + 1–2% yeso (CaSO₄·2H₂O), spawn al 15% del peso seco.

**Justificación:** La pasteurización no requiere autoclave y la paja es un insumo regional plausible, sujeto a cotización y trazabilidad de proveedor. guide_002 (fuente institucional Tier 2) reporta BE potencial de 80–100% para *P. djamor* sobre pajas agrícolas; no constituye validación con paja de Tenjo. Eucalipto permanece excluido de la formulación inicial.

**Criterio de revisión:** Tras tres lotes, comparar BE real con proyección. Si BE <70%, investigar calidad de paja local como causa antes de cambiar sustrato.

**Documentos afectados:** `02_substrates/substrate_library.md`, `02_substrates/pasteurization.md`

---

## DEC-0006 — Control de Ventilación: CO₂ + Relay ESP32

**Fecha:** 2026-06-29
**Estado:** Activa
**Área:** Automatización / FAE

**Problema:** Seleccionar el mecanismo de control de ventilación para módulos de fructificación sin confundir un ciclo de temporizador con cambios de aire reales.

**Alternativas evaluadas:**

| Opción | Variable controlada | Monitoreo | Fallo seguro |
|---|---|---|---|
| Timer mecánico analógico | ±2–5 min | No | No — si falla, no hay alerta |
| Timer digital | ±1 min | No | No |
| **Relay ESP32 + sensor CO₂** | CO₂ + línea base de caudal | Sí — log continuo | Sí — alerta y límite local |

**Decisión:** Relay controlado por ESP32/ESPHome, con control primario por CO₂ y límites locales de seguridad. La velocidad o línea base se define después de medir caudal efectivo y hacer commissioning. Timer mecánico descartado como control principal.

**Justificación:** `ACH = caudal efectivo × duty cycle × 60 / volumen`; por tanto, los minutos ON/OFF no determinan ACH sin conocer el caudal instalado. El relay ESP32 permite registrar estado y responder al CO₂, mientras el control local conserva un límite de seguridad si HA o la red fallan.

**Criterio de revisión:** Si el relay falla más de una vez por mes, revisar calidad del hardware o introducir relay redundante.

**Documentos afectados:** `FARM_BRAIN.md`, `05_equipment/environmental_control.md`

---

## DEC-0007 — Convención de Registro de Fuentes: Esquema Único (no SRC-)

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

**Limpieza completada (2026-07-16):** eliminado el tombstone `SRC-0004.md`; `guide_001` permanece como registro único.

**Documentos afectados:** `09_research/literature_index.md`, `references/bibliography.md`

---

## Plantilla para nuevas decisiones

```markdown
## DEC-XXXX — Título

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
