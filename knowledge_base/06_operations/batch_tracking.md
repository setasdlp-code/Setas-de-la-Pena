---
title: Trazabilidad y Seguimiento de Lotes
document_id: DOC-0030
category: operations
load_priority: selective
last_reviewed: 2026-09-03
confidence: high
primary_sources:
  - Internal protocols
  - Rocha 2025 (paper_022 — ARK-002..004)
  - Gaitán-Hernández et al. 2014 (paper_023 — ARK-005..007)
  - Shi et al. 2026 (paper_026 — ARK-012)
related_documents:
  - production_schedule.md
  - quality_control.md
  - LESSONS_LEARNED.md
  - DECISIONS.md
  - 04_facility/workflow.md
  - ../09_research/active_research_knowledge.md
---

# Architectural Context

This document implements the Documentation as Infrastructure principle defined in `SETAS_DE_LA_PENA_CANON.md` (Section 3, Principle P-04). Batch logs are the permanent operational record. Traceability is the foundation of reproducibility and knowledge generation. Logs produce both learning units and production records.

# Executive Summary

Traceability system for batches from inoculation through sale or disposal. Enables identification of performance variation causation, contamination source tracking, and continuous knowledge base development. Each production batch is simultaneously a production unit and a learning unit, generating both biological data and validated additions to the knowledge base.

# Core Principles

- Each lot is assigned a unique identifier at inoculation. Without unique identification, traceability is impossible and learning is lost.
- Record observations in real time or immediately after observation, not from memory at end of day.
- Batch log data are the most operationally valuable assets of the cultivation system. A production batch that generates no documented learning represents an irreversible opportunity cost.
- Batches generate three categories of recorded information: biological data (yield, timing, contamination), operational observations (process deviations, unexpected responses), and validated knowledge (new SOP findings or decision triggers).
- **Parámetros experimentales mínimos obligatorios (ARK-007):** Toda ficha de lote debe registrar el modelo de bolsa y tamaño de poro de filtro, masa húmeda por bloque, contenido de humedad inicial (% FC), geometría del bloque, absorción hídrica neta en inducción y pico de temperatura en el núcleo.

# Technical Details

## Sistema de Numeración de Lotes

```
Formato: [AÑO]-[MES]-[ESPECIE]-[NÚMERO]
Ejemplos:
  2026-09-LE-001  → Septiembre 2026, L. edodes, lote 1 (especie prioritaria)
  2026-09-HE-001  → Septiembre 2026, H. erinaceus, lote 1
  2026-09-PO-001  → Septiembre 2026, P. ostreatus, lote 1
```

## Batch Log Template

```
═══════════════════════════════════════════════════════════
LOT ID: ________________  MODULE: ______  DATE LOGGED: _______
═══════════════════════════════════════════════════════════
SPECIES: ________________________________  STRAIN / CLASS: _______________
SPAWN SUPPLIER & LOT: ___________________  SPAWN MATRIX: [Rye/Wheat/Millet/Supp]
SPAWN INOCULATION RATE: _____ kg (____% dry weight)

SUBSTRATE FORMULATION: __________________________________
BASE DRY WEIGHT: _____ kg  |  SUPPLEMENT DRY WEIGHT: _____ kg
MINERAL BUFFER (Gypsum/CaCO3): _____ g (___%)
TARGET MOISTURE (FC): ____%  |  MEASURED MOISTURE: ____%
TOTAL WET WEIGHT PRE-STERILIZATION: _____ kg

CONTAINER & GEOMETRY (ARK-007):
  Bag Model / Brand: ___________________  Filter Pore Size: _____ µm
  Wet Fill Mass per Unit: _____ kg/block  Total Blocks: _____
  Block Dimensions (L × W × H): ____ × ____ × ____ cm

STERILIZATION CYCLE RECORD:
  Equipment: All American 1941X  |  Target: 121 °C (15 psi) × _____ min
  Autoclave Exhaust & Dwell Profile: ______________________
  Sterilization Date: ____________  Operator: _____________

INOCULATION DATE: __________________  INOCULATED BY: _______

--- COLONIZATION PHASE (Shi et al. 2026 / ARK-012) ---
Day  3: Colonization ____% | Core T°: ___°C | Room T°: ___°C | Obs:
Day  7: Colonization ____% | Core T°: ___°C | Room T°: ___°C | Obs:
Day 14: Colonization ____% | Core T°: ___°C | Room T°: ___°C | Obs:
Day 21: Colonization ____% | Core T°: ___°C | Room T°: ___°C | Obs:
Day 28: Colonization ____% | Core T°: ___°C | Room T°: ___°C | Obs:
Popcorning / Browning Date (Shiitake): _____________________
Peak Core Temp Observed: _____ °C on Day ____ (ΔT core-air: _____ °C)
Blocks Discarded (Contaminated): ___
Contaminant Type/Appearance: _______________________________
Day Detected: ___ | Probable Root Cause: ___________________

--- INDUCTION & FRUITING PHASE (Rocha 2025 / ARK-002..004) ---
Induction Date: __________________
Induction Method: [Immersion / Cold Room / Injection]
  Pre-Induction Block Mass (M_pre avg): ________ g
  Post-Induction Block Mass (M_post avg): _______ g
  Net Water Absorbed (ΔM): _______ g  (______% mass increase)
  If Injection Used: Needle Thermal Sterilization Verified? [YES / NO]
  Water Temp: _____ °C | Duration: _____ hours

First Pins Observed Date: ___________
Fruiting Module/Chamber: _________________
Target Environment: HR: ___% | T°: ___°C | CO₂: ___ ppm | FAE: ___ CFM

FLUSH 1:
  Harvest Date: ____________
  Fresh Weight: ____________ g
  Cap Diam / Stem Ratio: Premium___ Standard___ Discard___
  Observations: 
  
FLUSH 2:
  Rehydration Date: _____________  Method: _________________
  Pre-Mass: _____ g  |  Post-Mass: _____ g  |  ΔM: _____ g
  Harvest Date: ____________
  Fresh Weight: ____________ g
  Observations:
  
FLUSH 3 (if applicable):
  Harvest Date: ____________
  Fresh Weight: ____________ g
  Observations:

--- BATCH RESULTS ---
Total Fresh Yield: _________ g
Biological Efficiency (BE): _______ %  [Calculation: Total fresh / dry substrate weight × 100]
Contamination Rate: _______ %  [Calculation: Contaminated blocks / total blocks × 100]
Flushes Completed: ___
Days from Inoculation to First Harvest: ___
Days Total Cycle: ___

--- KNOWLEDGE GENERATION ---
Unexpected Observations (Describe any anomalies, deviations, or novel responses):
_________________________________________________________________________

Decision Triggered (Did this batch reveal a process gap, suggest an SOP change?):
_________________________________________________________________________

Lessons Learned (Validated finding or confirmed practice):
_________________________________________________________________________

Cross-Reference to:
  - LESSONS_LEARNED.md (if applicable)
  - DECISIONS.md (if decision was triggered)

═══════════════════════════════════════════════════════════
```

## Digital Recording (Alternative to Paper)

Shared spreadsheet (Google Sheets) accessible to Sebastián and on-site operator:
- One sheet per month
- One row per lot
- Columns: Lot ID | Species | Substrate | Inoculation Date | Blocks | Yield F1 | Yield F2 | Yield F3 | Total Fresh | BE | Contamination Rate | Unexpected Observations | Decision Triggered | Status

## Environmental Data Integration

Home Assistant exports sensor data to CSV or InfluxDB for correlation analysis:
- Average humidity during fruiting phase
- Maximum CO₂ recorded during fruiting
- Temperature min/max during fruiting
- FAE cycle frequency and compliance
- Correlate with yield per lot to identify environmental impact on biological efficiency

Sensor data is reviewed alongside batch results to validate environmental parameter effectiveness and identify causation for yield variation.

# Knowledge Loop Integration

Batch logs feed the continuous improvement cycle defined in CANON Section 18:

```
Batch Completion
    ↓
Unexpected Observations & Decision Triggers Documented
    ↓
Reviewed Against Baseline Parameters
    ↓
Root Cause Analysis (if metrics exceed thresholds)
    ↓
Documented in LESSONS_LEARNED.md
    ↓
Decision Recorded in DECISIONS.md
    ↓
SOP Updated (if causation established)
```

Metrics below threshold for two consecutive cycles trigger formal root-cause analysis per CANON Section 13.

# Best Practices

- Assign unique lot identifier at inoculation; physically mark each block with lot identifier + block number using permanent marker.
- Photograph each lot at three minimum points: at inoculation setup, at first pins appearance, at first harvest. Document anomalies photographically.
- Record observations immediately or within 2 hours of observation (not from end-of-day memory).
- Calculate BE after each batch completes; retain calculation for substrate performance comparison.
- Transfer paper logs to digital record (Google Sheets) within 24 hours of batch completion.

# Common Failure Modes

- Recording observations many hours after occurrence—introduces inaccuracy and loses detail.
- Failure to calculate BE—eliminates ability to benchmark substrate formulations and identify productivity trends.
- Loss of batch log for problematic lot—eliminates ability to extract learning from failure and prevents future diagnosis of recurrent issues.
- Incomplete documentation of unexpected observations—eliminates contextual data needed for root-cause analysis.

# Open Questions

- Should environmental data (HA sensor logs) be automatically imported into batch log template at batch completion?
- What is the minimum threshold for "unexpected observation" requiring documented root-cause analysis?
- Should individual operator be recorded in batch log for quality control attribution?
