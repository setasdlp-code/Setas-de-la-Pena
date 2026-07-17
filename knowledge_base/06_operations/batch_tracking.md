---
title: Trazabilidad y Seguimiento de Lotes
category: operations
load_priority: selective
last_reviewed: 2026-06-30
confidence: high
primary_sources:
  - Internal protocols
related_documents:
  - production_schedule.md
  - quality_control.md
  - LESSONS_LEARNED.md
  - DECISIONS.md
  - 04_facility/workflow.md
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

# Technical Details

## Sistema de Numeración de Lotes

```
Formato: [AÑO]-[MES]-[ESPECIE]-[NÚMERO]
Ejemplos:
  2026-07-DJ-001  → Julio 2026, P. djamor, lote 1
  2026-08-LE-001  → Agosto 2026, L. edodes, lote 1
  2026-07-HE-001  → Julio 2026, H. erinaceus, lote 1
```

## Batch Log Template

```
═══════════════════════════════════════════════════════════
LOT ID: ________________  MODULE: ______  DATE LOGGED: _______
═══════════════════════════════════════════════════════════
SPECIES: ________________________________
SUBSTRATE: ______________________________
DRY SUBSTRATE WEIGHT: ___________ kg
SPAWN SOURCE & WEIGHT: _____________ kg  (____%)
BLOCKS PRODUCED: ___

INOCULATION DATE: __________________  INOCULATED BY: _______

--- COLONIZATION PHASE ---
Day  3: Colonization ____%  Contamination _____ T°___°C  Observations:
Day  7: Colonization ____%  Contamination _____ T°___°C  Observations:
Day 14: Colonization ____%  Contamination _____ T°___°C  Observations:
Day 21: Colonization ____%  Contamination _____ T°___°C  Observations:
Blocks Discarded (Contaminated): ___
Contaminant Type/Appearance (if any — see contamination.md, Guía de Identificación Visual): _______________
Day Detected (days since inoculation — see contamination.md, Momentos de Contaminación): ___
Actual Colonization Timeline vs. Projected: ________________

--- FRUITING PHASE ---
Fruiting Induction Date: __________________
First Pins Observed Date: ___________
Fruiting Module/Chamber: _________________
Initial Parameters: HR___% T°___°C CO₂___ppm FAE Cycles/hr:___

FLUSH 1:
  Harvest Date: ____________
  Fresh Weight: ____________ g
  Quality Grade: Premium___ Standard___ Discard___
  Observations: 
  
FLUSH 2:
  Rehydration Date: _____________
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

--- KNOWLEDGE GENERATION ---
Unexpected Observations (Describe any anomalies, deviations from expected parameters, or novel responses):
_________________________________________________________________________

Decision Triggered (Did this batch reveal a process gap, suggest an SOP change, or generate a new hypothesis?):
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
