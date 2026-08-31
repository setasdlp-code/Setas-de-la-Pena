---
title: Cronograma de Producción
document_id: DOC-0032
category: operations
load_priority: selective
last_reviewed: 2026-07-14
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

Production scheduling framework for *Lentinula edodes* as the primary species. The current stage is pre-production. Staggered production begins only after autoclave commissioning, substrate validation, spawn verification and a complete pilot cycle. Cadence is determined by measured biological efficiency, long incubation time, fruiting capacity and operator workload.

# Core Principles

- Production is batch-based and fully traceable, with each batch assigned a unique lot identifier at inoculation.
- Production cadence is determined by: market demand, laboratory capacity, fruiting capacity, available spawn, and operator workload—not by fixed calendar dates.
- Current production target: sustainable weekly harvest capability before scaling to additional modules or species.
- Maximum capacity is constrained by number of active fruiting modules, current spawn production capacity, and operator attention bandwidth.

# Technical Details

## Ciclo Shiitake — Marco Inicial de Tiempos

| Fase | Duración de referencia |
|---|---|
| Preparación, esterilización e inoculación | Día 0; duración depende de la carga validada |
| Incubación y colonización | 30–120 días según cepa y formulación |
| Pardeamiento / maduración | Incluido en la maduración del bloque; no inducir antes de completarlo |
| Inducción | Según cepa; reducción térmica y/o inmersión documentada |
| Primera cosecha | Aproximadamente 90–150 días desde inoculación como marco conservador |
| Intervalo entre flushes | Determinado por rehidratación y respuesta del bloque |
| Ciclo total | Varios meses; validar localmente antes de fijar cadencia |

No se establece todavía una proyección semanal de rendimiento. La BE de referencia del repositorio es 40–70%, pero la capacidad y el rendimiento de Setas de la Peña permanecen sin validar.

## Modelo de escalonamiento

El primer lote será piloto y aislado. El segundo lote puede iniciarse cuando el primero muestre colonización sana, el ciclo de esterilización haya quedado documentado y el proceso de inoculación no presente contaminación. La cadencia quincenal o mensual se define después del primer ciclo completo; no se hereda del antiguo cronograma de *P. djamor*.

## Production Milestone Sequence (Representative Timeline, Actual Dates Determined by Phase Completion)

Production progresses through phases determined by successful completion of preceding phase, not by calendar deadlines. Each phase is validated before advancing.

| Phase | Activities | Duration | Prerequisites |
|---|---|---|---|
| **Phase 1: Infrastructure** | CLOUDLAB installation, sensor testing, HA configuration | Duration determined by equipment arrival and testing completion | Equipment received and functional |
| **Phase 2: Laboratory Setup** | SAB configuration, agar work, tissue cloning technique development | Duration determined by operator skill development | SAB operational and contamination protocols established |
| **Phase 3: Spawn Acquisition** | Obtain shiitake spawn with identified strain and supplier; validate quality | Duration determined by supplier lead time and spawn viability validation | Spawn received and tested for viability and contamination |
| **Phase 4: First Batch Inoculation** | Substrate preparation, inoculation of first batch | Single batch, no scaling | Spawn validated and substrate protocols established |
| **Phase 5: First Cycle Completion** | Incubation, fruiting, first harvest | Complete documentation of all observations | First batch reaches harvest milestone |
| **Phase 6: Second Batch Initiation** | Inoculation of second staggered batch | Begins only after first batch incubation is stable | First batch colonization within target parameters |
| **Phase 7: Stable Production** | Continuous staggered batches; review cadence and scaling feasibility | Ongoing review based on measured performance | Minimum three complete production cycles documented with BE within acceptance range |

# Production Capacity Planning

Capacity is determined by validated operational constraints, not aspirational targets.

**Current Phase 1 Constraints:**
- Laboratory capacity: inoculation capacity not yet validated
- Fruiting capacity: two modules available, environmental suitability for shiitake pending validation
- Substrate capacity: autoclave in site but not commissioned; sterilization throughput unknown until validation
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
