---
title: Control de Calidad
category: operations
load_priority: selective
last_reviewed: 2026-07-16
confidence: medium
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - Internal protocols
related_documents:
  - production_schedule.md
  - batch_tracking.md
  - LESSONS_LEARNED.md
  - 02_substrates/contamination.md
  - 04_facility/fruiting.md
---

# Architectural Context

This document implements the Continuous Improvement philosophy defined in `SETAS_DE_LA_PENA_CANON.md` (Section 18). Quality control validates two distinct outcomes: (1) process reproducibility—whether production procedures generate consistent environmental conditions and biological responses across cycles, and (2) product fitness—whether harvested output meets market and safety specifications. Acceptance thresholds define operational decisions; when metrics fall below thresholds, root-cause investigation is triggered per CANON Section 13.

# Executive Summary

Quality control in Setas de la Peña covers three integrated areas: process validation (environmental parameters within target range), product specification (harvested fruiting body characteristics), and knowledge capture (batch results documented and reviewed for process improvement). Quality is constructed in the process, not verified only at harvest. Consistent, reproducible process generates consistent product.

# Core Principles

- Quality is constructed through process reproducibility, not through final inspection alone. Process validation prevents defects rather than detecting them.
- Inconsistent product quality damages reputation more rapidly than high price. Consistency is the primary commercial quality metric.
- Without batch log data, true quality control is impossible. Batch logs provide the measurement foundation for acceptance decisions and continuous improvement.
- Quality control identifies both batch-level performance and systemic process gaps. Metrics exceeding thresholds trigger root-cause analysis and SOP review.

# Technical Details

## Parámetros de Proceso — Criterios de Aceptación

| Parámetro | Rango Aceptable (P. djamor) | Alerta si: |
|---|---|---|
| HR Fructificación | 85–90% | <82% o >92% |
| T° Fructificación | 20–30°C | <18°C o >32°C |
| CO₂ Fructificación | 500–1,500 ppm | >2,000 ppm |
| Ventilación | 5–8 ACH provisional tras commissioning | CO₂ >2.000 ppm, caudal no medido o morfología anómala |
| Contaminación por lote | <10% de bloques | >15% = revisar proceso |
| BE por lote | Línea base local pendiente | Registrar todos los lotes; fijar umbral tras tres lotes comparables |

## Clasificación de Producto Final

### Calidad Premium (para restaurantes, mercado gourmet)
- Caps intactos, sin daño físico
- Color uniforme (rosa vibrante en P. djamor)
- Sin manchas, sin signos de sobre-maduración
- Cosechado antes de liberar esporas
- Peso: caps >3 cm diámetro
- Aroma: fresco, característico de la especie

### Calidad Estándar (para mercado local, cocina)
- Caps con pequeños defectos cosméticos
- Color uniforme pero posible inicio de palidecer
- Sin contaminación ni deterioro

### Descarte (No vender)
- Caps dañados significativamente
- Color irregular o manchas
- Signos de inicio de deterioro
- Olor anormal

## Pre-Harvest Quality Checklist

```
☐ Cap color matches species standard (vibrant pink for P. djamor)
☐ Cap margins beginning to curl upward (spore release has not begun)
☐ No dark spots or unusual discoloration on caps
☐ Aroma is fresh and species-characteristic; no sour, vinegary, or off odors
☐ Hands washed and gloves donned before harvest begins
☐ Scales calibrated and zero-checked before weighing harvest
☐ Harvest containers are clean and contamination-free
```

## Post-Harvest Quality Checklist

```
☐ Fresh weight recorded in batch log within 10 minutes of harvest
☐ Quality grade assigned: Premium / Standard / Discard per specifications
☐ Block inspection completed: bases clean, stipe remnants removed, no bacterial slime visible
☐ Photograph taken of representative sample before processing
☐ Product placed in refrigeration (4°C) if not sold/delivered same day
☐ Storage conditions and duration recorded in batch log
☐ BE calculation completed within 24 hours; result recorded in batch log
☐ Yield figures entered into digital batch tracking spreadsheet
```

## Almacenamiento del Producto Cosechado

| Condición | Duración |
|---|---|
| Temperatura ambiente (Tenjo ~16°C) | 24–48h |
| Refrigerador (4°C) | 5–7 días |
| Deshidratado | 6–12 meses |
| Congelado (blanqueado) | 3–6 meses |

## Success Metrics & Acceptance Thresholds

See also: `SETAS_DE_LA_PENA_CANON.md`, Section 13 (Success Metrics).

| Metric | Definition | Threshold | Document | Review Trigger |
|---|---|---|---|---|
| **Biological Efficiency (BE)** | Fresh yield / dry substrate weight × 100 | Sin umbral local hasta completar tres lotes comparables | batch_tracking.md | Desviación frente a la línea base una vez establecida |
| **Contamination Rate** | Contaminated blocks / total blocks × 100 | <10% target; ≤15% acceptable | batch_tracking.md | Above 15% for two consecutive cycles |
| **Grade A Yield** | Grade A product / total fresh yield × 100 | ≥80% | batch_tracking.md | Below 80% for two consecutive cycles |
| **Flushes per Block** | Number of harvests per block, typically P. djamor | ≥2 expected; ≥1 minimum acceptable | batch_tracking.md | Only 1 flush or block exhaustion before secondary flush |
| **Production Module Weekly Yield** | Fresh kilograms / module / week, measured over complete batch cycle | Baseline established during first complete cycle; target determined post-Phase 1 | batch_tracking.md | Declining trend or 20% variance from baseline |
| **Knowledge Capture Rate** | Production cycles generating validated additions to knowledge base / total cycles | ≥1 per cycle | batch_tracking.md | See Section: Process Validation |

## Process Validation

Quality control validates process reproducibility by tracking whether standardized procedures generate consistent results across multiple batches. Process validation occurs during batch review phase.

**Process Validation Checklist:**

```
☐ Colonization timeline: Within ±3 days of projected timeline for species/substrate
☐ Fruiting induction: Within ±2 days of projected timeline
☐ First flush timing: Within ±3 days of projected timeline
☐ Environmental parameters maintained: HR within target range ≥90% of fruiting phase
☐ Environmental parameters maintained: CO₂ within target range ≥90% of fruiting phase
☐ Ventilation control: CO₂ within range and extractor/airflow response logged per commissioning baseline
☐ Contamination isolated: No cross-contamination to adjacent blocks or modules
☐ Product characteristics uniform: Cap size, color, morphology consistent within batch
```

Process reproducibility enables isolation of variables and identification of causation. A batch that generates inconsistent results without documented causation cannot be used to update procedures.

**Knowledge Capture Rate:**

Knowledge Capture Rate = Batches generating validated additions to knowledge base / total batches completed.

A validated addition is defined as:

- Documented unexpected observation with identified causation, OR
- Confirmed procedure refinement supported by measured performance data, OR
- New hypothesis generated and logged for field testing, OR
- Resolved question from `09_research/unresolved_questions.md`

Minimum target: ≥1 validated addition per production cycle. Cycles generating no new knowledge represent incomplete documentation or insufficient observation depth, triggering review of batch logging thoroughness.

# Quality Review Cycle

Quality control operates as an integrated review process:

```
Batch Completion
    ↓
Calculate BE, Contamination Rate, Grade Distribution
    ↓
Compare to Acceptance Thresholds
    ↓
IF all metrics within threshold:
  → Document as validated cycle
  → Archive batch log
  → Continue to next batch
    ↓
IF any metric exceeds threshold:
  → Initiate Root-Cause Analysis (CANON Section 18)
  → Review batch log for unexpected observations
  → Investigate process deviations
  → Document findings in batch log
  → Update relevant SOP or record decision
  → Archive updated documentation
```

Root-cause analysis is initiated when any metric falls below threshold for two consecutive cycles, per CANON Section 13.

# Best Practices

- Photograph each lot at three critical moments: at inoculation/setup, at first pins appearance, at first harvest. Photographs document morphology consistency and serve as visual quality baseline.
- Maintain cold chain from harvest through delivery if customer requires. Document storage conditions and duration to correlate with post-sale product feedback.
- Record customer feedback as quality data. Organize by product grade, batch ID, and delivery conditions to identify product-quality drivers.
- Calculate BE within 24 hours of batch completion while data context is fresh.
- Compare batch results to previous three batches to identify trends requiring investigation.

# Common Failure Modes

- Harvesting late (after spore release)—product loses color vibrancy, weight decreases, quality drops irreversibly.
- Failing to clean block stipe/stalk remnants after flush 1—bacterial contamination propagates to secondary flush, reducing yield or rendering blocks unviable.
- Storing at ambient temperature—fruit body respiration and dehydration rapidly reduce saleable weight and visual quality within 24–48 hours.
- Skipping BE calculation—eliminates ability to identify substrate or process problems; comparison across batches becomes impossible.
- Recording quality grades without photographic evidence—visual quality assessment becomes subjective and non-reproducible.

# Open Questions

- What post-harvest processing (vacuum sealing, drying, freeze processing) optimizes product shelf life for target market?
- Should product be graded individually or by batch, and at what point in the value chain (harvest, packaging, delivery)?
- What customer feedback metrics (freshness, aroma, appearance, cooking performance) correlate most strongly with BE and environmental parameters?
