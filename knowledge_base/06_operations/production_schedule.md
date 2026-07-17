---
title: Cronograma de Producción
category: operations
load_priority: selective
last_reviewed: 2026-06-30
confidence: medium
primary_sources:
  - Internal planning
  - Species parameters from knowledge_base
related_documents:
  - batch_tracking.md
  - quality_control.md
  - 04_facility/workflow.md
  - 07_business/economics.md
---

# Architectural Context

This document implements the Production Philosophy and Automation Philosophy defined in `SETAS_DE_LA_PENA_CANON.md` (Sections 6–7). Production scheduling is determined by operational capacity and biological constraints, not by fixed calendar dates. Batch timing is reviewed after each production cycle and adjusted based on measured performance.

# Executive Summary

Production scheduling framework for P. djamor as primary species. Staggered production (batches initiated in sequence) enables continuous harvests rather than single-cycle flush patterns. Production cadence is determined by measured biological efficiency, available fruiting capacity, laboratory maturity, and validated spawn availability.

# Core Principles

- Production is batch-based and fully traceable, with each batch assigned a unique lot identifier at inoculation.
- Production cadence is determined by: market demand, laboratory capacity, fruiting capacity, available spawn, and operator workload—not by fixed calendar dates.
- Current production target: sustainable weekly harvest capability before scaling to additional modules or species.
- Maximum capacity is constrained by number of active fruiting modules, current spawn production capacity, and operator attention bandwidth.

# Technical Details

## Ciclo P. djamor — Resumen de Tiempos

| Fase | Duración |
|---|---|
| Preparación + Inoculación | Día 0 (4–6h trabajo) |
| Incubación | 10–18 días |
| Inducción fruiting | Días 14–18 |
| Flush 1 | Días 22–27 desde inoculación |
| Intervalo entre flushes | 10–14 días |
| Flush 2 | Días 35–42 |
| Flush 3 (si aplica) | Días 48–58 |
| **Ciclo total** | **~55–60 días** |

## Staggered Production Model (Example: 2 Fruiting Modules, Batches Initiated Every 2 Weeks)

```
WEEK      1    2    3    4    5    6    7    8    9    10
BATCH A  [I]──────[F]──[C1]──────[C2]──────[C3]
BATCH B        [I]──────[F]──[C1]──────[C2]──────[C3]

[I] = Inoculation
[F] = Fruiting Induction
[C1] = First Harvest
[C2] = Second Harvest (post-rehydration)
[C3] = Third Harvest
```

With 2 active fruiting modules and batches initiated every 2 weeks: **harvests generally become available every 1–2 weeks** beginning in week 5, based on actual biological performance and module readiness. Timing is validated during initial production cycles and adjusted according to measured biological efficiency.

## Proyección de Yield (10 bloques de 1 kg sustrato seco por lote)

| Supuesto | Valor |
|---|---|
| Peso sustrato seco por bloque | 1 kg |
| BE total objetivo | 80% |
| Yield fresco por bloque | 800 g |
| Yield por lote (10 bloques) | ~8 kg frescos |
| Yield por flush (F1 más grande) | ~4–5 kg |

**Con 2 lotes escalonados: ~4–5 kg/semana en estado estable.**

## Production Milestone Sequence (Representative Timeline, Actual Dates Determined by Phase Completion)

Production progresses through phases determined by successful completion of preceding phase, not by calendar deadlines. Each phase is validated before advancing.

| Phase | Activities | Duration | Prerequisites |
|---|---|---|---|
| **Phase 1: Infrastructure** | CLOUDLAB installation, sensor testing, HA configuration | Duration determined by equipment arrival and testing completion | Equipment received and functional |
| **Phase 2: Laboratory Setup** | SAB configuration, agar work, tissue cloning technique development | Duration determined by operator skill development | SAB operational and contamination protocols established |
| **Phase 3: Spawn Acquisition** | Obtain P. djamor spawn; validate supplier quality | Duration determined by supplier lead time and spawn viability validation | Spawn received and tested for viability and contamination |
| **Phase 4: First Batch Inoculation** | Substrate preparation, inoculation of first batch | Single batch, no scaling | Spawn validated and substrate protocols established |
| **Phase 5: First Cycle Completion** | Incubation, fruiting, first harvest | Complete documentation of all observations | First batch reaches harvest milestone |
| **Phase 6: Second Batch Initiation** | Inoculation of second staggered batch | Begins only after first batch incubation is stable | First batch colonization within target parameters |
| **Phase 7: Stable Production** | Continuous staggered batches; review cadence and scaling feasibility | Ongoing review based on measured performance | Minimum three complete production cycles documented with BE within acceptance range |

# Production Capacity Planning

Capacity is determined by validated operational constraints, not aspirational targets.

**Current Phase 1 Constraints:**
- Laboratory capacity: SAB operation produces spawn for 1–2 batches per week (capacity to increase upon Phase 2 validation)
- Fruiting capacity: 2 production modules currently operational
- Substrate capacity: Pasteurization throughput supports 10–20 kg dry weight per week
- Operator attention bandwidth: Estimated 15–20 hours per week per operator

**Scaling Triggers (Phase-Dependent):**
- Do not initiate second species until three documented production cycles of primary species are complete with BE within acceptance range
- Do not add fruiting modules until spawn production capacity is demonstrated at 150% of planned consumption
- Do not increase inoculation frequency until laboratory contamination rate is consistently <5%

# Production Cadence Review

Production timing is reviewed after each completed batch cycle and documented in batch log. The following parameters are evaluated:

- Actual colonization duration vs. projected duration
- Actual fruiting induction timeline vs. projected timeline
- Actual yield (BE) vs. projected yield
- Contamination rate vs. acceptance threshold

Adjustments to production cadence are made based on these measurements and documented in the relevant production log.

# Best Practices

- Do not scale to more than 2 simultaneous batches until minimum three complete documented production cycles are completed.
- Adjust timing based on measured biological efficiency observed in early production cycles.
- Coordinate harvests with known customer demand; do not accumulate product without distribution channel.
- Document all timing deviations from projected schedule and investigate causation.

# Common Failure Modes

- Initiating multiple simultaneous batches before first batch is complete—creates management complexity and information loss.
- Absence of customer demand before first harvest—validates need for market development coordination before production readiness.
- Underestimation of substrate preparation time—delays downstream inoculation phases.
- Scaling inoculation frequency based on theoretical capacity rather than validated field data—results in contamination escalation and batch loss.

# Open Questions

- What is the target sustainable production volume (kg/week) for Phase 1 based on identified market demand?
- What is the laboratory spawn production capacity constraint at current SAB configuration?
- What contamination rate threshold triggers re-evaluation of inoculation frequency?

# Knowledge Loop

Every production cycle is also a knowledge-generation cycle:

```
Production
    ↓
Harvest
    ↓
Batch Review (Yield, BE, Contamination Rate)
    ↓
Lessons Learned (Documented Observations)
    ↓
Decision (Process Adjustment or Validation)
    ↓
SOP Update (if Causation Established)
```

Batch logs serve as primary data source. Timing deviations, unexpected biological responses, and successful practices are captured during or immediately after each phase transition and reviewed at batch completion.

# References

- SETAS_DE_LA_PENA_CANON.md, Sections 6–7 (Production Philosophy, Automation Philosophy)
- batch_tracking.md (lot numbering and logging system)
- quality_control.md (acceptance thresholds and performance metrics)
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
