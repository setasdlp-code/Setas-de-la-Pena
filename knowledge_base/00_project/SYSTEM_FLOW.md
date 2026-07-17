---
title: System Flow
document_id: SYS-001
version: 1.1
status: canonical
authority: architectural
load_priority: always
owner: Setas de la Peña
last_reviewed: 2026-07-09
---

# System Flow

## 1. Purpose

This document is the master systems map of Setas de la Peña. It describes how biology, operations, information, and knowledge move through the organization and how each subsystem connects to every other subsystem.

It exists so that any human operator or AI assistant can understand the complete architecture of the project before reading any individual operational document. The CANON (`SETAS_DE_LA_PENA_CANON.md`) defines how the project thinks. The Editorial Guidelines (`EDITORIAL_GUIDELINES.md`) define how the repository is maintained. This document defines how the system behaves as an integrated whole.

This is not an SOP, a workflow, or a production manual. It does not specify temperatures, recipes, or equipment. It specifies structure and flow. Implementation belongs to subordinate documents, which are referenced wherever detail is required.

---

## 2. Scope

This document describes the operating model at the system level: the four subsystems, the flows that pass through them, the loops that connect them, and the document boundaries that govern each.

It excludes all implementation detail. Biological parameters reside in `01_species/`. Substrate and procedure detail resides in `02_substrates/` and `06_operations/`. Equipment and automation detail resides in `05_equipment/`. Facility structure resides in `04_facility/`. Where this document names a stage, the authoritative procedure for that stage lives elsewhere and is cited.

This document changes only when the system architecture changes — not when procedures, parameters, or equipment change.

---

## 3. System Overview

Setas de la Peña operates as four interconnected subsystems.

```
        ┌─────────────────┐         ┌─────────────────┐
        │   BIOLOGICAL    │◄───────►│   OPERATIONAL   │
        │     SYSTEM      │         │     SYSTEM      │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │   KNOWLEDGE     │◄───────►│    BUSINESS     │
        │     SYSTEM      │         │     SYSTEM      │
        └─────────────────┘         └─────────────────┘
```

**Biological System.** The living process: genetics, mycelial expansion, substrate colonization, fruiting, and the organism's response to its environment. It defines the constraints all other subsystems must satisfy (CANON §15).

**Operational System.** The physical and procedural execution: procurement, substrate preparation, sterilization, inoculation, incubation, fruiting management, quality control, packaging, and distribution. It converts biological requirements into repeatable action.

**Knowledge System.** The repository and its processes: observation, documentation, experiment, validation, decision, and SOP maintenance. It preserves operational continuity and converts experience into transferable knowledge (CANON §19).

**Business System.** Market relationships, pricing, distribution channels, supplier records, and financial metrics. It connects production output to economic viability.

No subsystem operates independently. The biological process sets the constraints; operations execute within them; the knowledge system records and improves the execution; the business system funds and directs the whole. A change in any subsystem propagates to the others. This document maps those propagation paths.

---

## 4. Biological Flow

The biological lifecycle proceeds from genetic origin to consumer. Each stage is a controlled transition of living material; each transition carries contamination risk and a traceability obligation.

```
Wild specimen (optional)
   ↓   Field collection of a target phenotype for new genetics.
Tissue collection
   ↓   Sterile excision of internal tissue, free of surface contaminants.
Agar
   ↓   Mycelium isolated and grown on nutrient medium; morphology assessed.
Transfers
   ↓   Sectoring and cleaning to isolate vigorous, contaminant-free mycelium.
Master culture
   ↓   A verified, preserved reference culture; the genetic anchor.
Working culture
   ↓   Routine-use cultures derived from the master for daily expansion.
Liquid culture (optional)
   ↓   Suspended mycelium for rapid, even inoculation of grain.
Master grain
   ↓   First-generation grain spawn carrying verified genetics.
Production grain
   ↓   Expanded grain spawn at the volume required for production runs.
Bulk substrate
   ↓   Grain spawn inoculated into prepared bulk substrate.
Incubation
   ↓   Full mycelial colonization of the substrate in the dark.
Fruiting
   ↓   Environmental shift triggers primordia formation and mushroom growth.
Harvest
   ↓   Mature fruit bodies removed at the defined maturity stage.
Processing
   ↓   Cleaning, grading, drying, or further preparation by product line.
Distribution
   ↓   Graded product moved to the customer channel.
Customer
```

The early stages (wild specimen through master culture) belong to the laboratory progression defined in CANON §5 and `04_facility/laboratory.md`. Genetic stages are unlocked in phase order; full axenic capability is a later-phase capability, not a starting requirement. Species-specific transition parameters reside in `01_species/`. Substrate transitions reside in `02_substrates/`. The biological flow defines what must happen; the operational flow (§5) defines how it is executed.

---

## 5. Operational Flow

The operational flow is the physical execution layer that realizes the biological flow under defined procedure.

```
Planning
   ↓   Production targets, batch scheduling, resource allocation.
Raw material procurement
   ↓   Substrate components, grain, consumables sourced per phase need.
Substrate preparation
   ↓   Hydration, mixing, and supplementation to specification.
Sterilization / Pasteurization
   ↓   Substrate rendered selective per the chosen method.
Inoculation
   ↓   Spawn introduced; lot identifier assigned at this point.
Incubation
   ↓   Colonization monitored under controlled conditions.
Fruiting
   ↓   FAE, humidity, and light managed to induce and sustain fruiting.
Harvest
   ↓   Fruit bodies collected; yield recorded against the lot.
Quality Control
   ↓   Grading, contamination assessment, threshold verification.
Packaging
   ↓   Product packaged by line; lot identifier carried forward.
Storage
   ↓   Conditioned holding pending dispatch.
Distribution
```

Each stage maps to authoritative procedure: substrate and method detail in `02_substrates/`; environmental management in `05_equipment/environmental_control.md`; quality thresholds in `06_operations/quality_control.md`; lot handling in `06_operations/batch_tracking.md`. The lot identifier assigned at inoculation (CANON §6) is the spine that links every downstream operational stage back to the biological origin (§9).

The operational flow runs continuously per CANON Priority 3 (production continuity). Modularity (CANON §17) ensures that a fault at one stage or in one module does not halt the others.

---

## 6. Knowledge Flow

Every production cycle is simultaneously a learning cycle. The knowledge flow runs in parallel with the operational flow and converts execution into durable, transferable knowledge.

```
Observation
   ↓   A measured or witnessed event during operations.
Documentation
   ↓   The observation is recorded against its lot and context.
Experiment
   ↓   A controlled, single-variable test addresses an identified gap.
Validation
   ↓   Results are measured over a meaningful number of cycles.
Lessons Learned
   ↓   Validated insight is captured in LESSONS_LEARNED.md.
Decision
   ↓   A formal choice is recorded with rationale in DECISIONS.md.
SOP Update
   ↓   The validated change is written into the relevant procedure.
Knowledge Base
   ↓   The repository now reflects the improved practice.
Improved Production
```

This flow is the practical implementation of CANON §18 (Continuous Improvement) and the Editorial Guidelines knowledge lifecycle (§14). Knowledge matures stage by stage; no observation becomes an SOP change without passing through experiment, validation, and decision. A cycle that produces mushrooms but no validated documented learning represents an irreversible opportunity cost (CANON §13, Knowledge Growth). Production and learning are not separate activities — they are the same cycle viewed through two lenses.

---

## 7. Information Flow

Information is distinct from knowledge. Information is raw signal; knowledge is validated, structured, and transferable. This section describes how signal is generated, aggregated, and refined into knowledge.

```
   Sensors ──────────┐
   Operators ────────┤
   Laboratory ───────┼──► Batch Tracking ──► Quality Control ──► Current Operations
                     │                                                  │
                     │                                                  ▼
                     │                                           Lessons Learned
                     │                                                  │
                     └──────────────────────────────────────────►      ▼
                                                              Knowledge Base ──► Business Metrics
```

- **Sensors** generate continuous environmental data (temperature, humidity, CO₂), logged per CANON §7. Sensor validity is a precondition; disqualified or biased sensors produce information that is operationally invalid.
- **Operators** generate observational data: morphology, anomalies, manual readings, interventions.
- **Laboratory** generates culture-state data: viability, contamination, transfer history.
- **Batch Tracking** binds all of the above to a lot identifier, producing a coherent per-batch record.
- **Quality Control** converts batch records into pass/fail and grade outcomes against thresholds.
- **Current Operations** (`CURRENT_OPERATIONS.md`) holds the detailed live operational state.
- **Lessons Learned** captures validated operational insight from the cycle.
- **Knowledge Base** is the structured, authoritative repository.
- **Business Metrics** derive economic and performance indicators from validated production data.

**Data becomes knowledge** when it is bound to a lot, assessed against a threshold, validated across cycles, and written into an authoritative document. Unbound, unvalidated, or unsourced data is information only and carries no operational authority (CANON §13, Priority 2 — Data Integrity).

---

## 8. Decision Flow

Decisions convert information and observation into committed action. Every non-trivial decision follows the process defined in CANON §16 and is recorded in `DECISIONS.md`.

```
Observation
   ↓
Problem Definition
   ↓
Evidence Collection   (Tier 1 preferred; source and confidence rated)
   ↓
Alternative Evaluation   (minimum two; engineering priority order, CANON §15)
   ↓
Decision   (simplest acceptable solution)
   ↓
Implementation
   ↓
Measurement
   ↓
Review
   ↓
Documentation   → DECISIONS.md
```

No decision is permanent. Reversal requires the same process and the same documentation as the original (CANON §16). The decision flow is the control mechanism that keeps the operational and biological flows aligned with the project's governing principles. Decisions that affect system architecture also trigger review of this document.

---

## 9. Traceability Architecture

Traceability is the requirement that every unit of product be linkable to its complete biological and operational history. It is the structural property that makes failure analysis, recall, and knowledge attribution possible.

```
Original tissue
   ↓
Master culture
   ↓
Working plate
   ↓
Liquid culture
   ↓
Master grain
   ↓
Production grain
   ↓
Production block
   ↓
Harvest
   ↓
Customer batch
```

Every production batch must remain traceable to its biological origin. The lot identifier assigned at inoculation (CANON §6) carries forward through harvest, packaging, and distribution; the culture lineage carries backward through grain, plate, and master culture to the original tissue. Lot Traceability is a 100% threshold metric (CANON §13). The authoritative traceability procedure resides in `06_operations/batch_tracking.md`. This architecture is what allows a defect observed at the customer batch to be attributed to a specific culture, grain generation, or production decision.

---

## 10. Feedback Loops

The subsystems are connected by closed feedback loops. The system improves by closing these loops, not by adding activity.

```
   Laboratory ──► Operations ──► Quality ──► Knowledge ──► Business
        ▲                                                     │
        └─────────────────────────────────────────────────────┘
```

- **Laboratory → Operations.** Culture quality and genetics determine production performance.
- **Operations → Quality.** Execution determines yield, grade, and contamination outcomes.
- **Quality → Knowledge.** Outcomes against thresholds generate lessons, experiments, and decisions.
- **Knowledge → Business.** Validated capability informs pricing, product mix, and scaling readiness.
- **Business → Laboratory.** Market demand and capital direct which genetics and capabilities the laboratory develops next.

Secondary loops operate within this primary loop: quality outcomes feed back into operations within a single cycle; decisions feed back into laboratory and equipment configuration. A loop that is not closed — an observation never documented, a decision never measured, a metric never reviewed — is a break in the improvement architecture (CANON §18, §19).

---

## 11. System Boundaries

Each subsystem is governed by a defined document type. The governance chain establishes which document holds authority over what.

```
CANON                  — how the project thinks (architectural authority)
   ↓
EDITORIAL GUIDELINES   — how the repository is maintained (editorial authority)
   ↓
SYSTEM_FLOW            — how the subsystems connect (this document)
   ↓
Roadmaps               — phase sequencing and capability unlock
   ↓
Operational Documents  — current state and procedures
   ↓
SOPs                   — how specific procedures are performed
   ↓
Batch Records          — what happened in each production cycle
   ↓
Lessons Learned        — what was learned from doing it
```

This document sits between governance and operations. It does not override the CANON or the Editorial Guidelines; it translates their principles into a system map. It does not specify procedure; it points to the SOPs that do. The diagram above describes which document type governs a given subsystem — it is not a restatement of document precedence. Document precedence in conflict is resolved exclusively by `SETAS_DE_LA_PENA_CANON.md` Section 14, the single source of truth for precedence. Where this document and a subordinate document disagree on a procedure, the subordinate document governs the procedure and this document is corrected to match the system structure.

---

## 12. Failure Containment

Modularity exists so that a failure in one subsystem or module is contained rather than propagated (CANON §3 P-06, §17). The system is designed so that the consequence of any single failure is bounded.

```
Laboratory contamination
   ↓   Does not compromise incubation in unrelated modules.

Equipment failure
   ↓   Does not compromise documentation or batch records.

Sensor failure
   ↓   Does not halt production; manual fallback resumes operation.

Central control failure
   ↓   Modules continue under last-known parameters until intervention.

Knowledge loss
   ↓   Prevented through documentation; a documented system is recoverable.
```

Each failure mode has a bounded blast radius and a documented recovery procedure (CANON §17). A failure mode without a documented recovery procedure is an open risk item tracked in `09_research/unresolved_questions.md`. Containment is a design property, established before installation, not a response improvised after failure.

---

## 13. Continuous Improvement Model

The subsystems and flows above operate within a single continuous improvement cycle. This cycle is the system's mode of operation, not a periodic event.

```
Plan ──► Build ──► Operate ──► Observe ──► Measure ──► Document ──► Improve ──► (repeat)
```

- **Plan** — define targets and the next validated capability.
- **Build** — construct or configure the required module or procedure.
- **Operate** — run production within the biological and operational flows.
- **Observe** — capture signal through the information flow.
- **Measure** — assess outcomes against defined thresholds (CANON §13).
- **Document** — record results, decisions, and lessons in their authoritative files.
- **Improve** — implement validated change through the knowledge and decision flows.

This model is the system-level expression of CANON §18 (Continuous Improvement) and §20 (Closing Principle). The CANON states that the primary product of the project is a continuously improving cultivation system; this cycle is the mechanism by which that improvement occurs. Each loop closes the feedback loops of §10 and advances the knowledge flow of §6.

---

## 14. Closing Principle

Setas de la Peña is an integrated adaptive system, not a collection of independent cultivation procedures. The biological, operational, knowledge, and business subsystems are coupled: each constrains and informs the others, and none retains its value in isolation.

Biology defines the constraints. Engineering and operations execute within them. The knowledge system records the execution and converts it into transferable capability. The business system funds and directs the whole. These four evolve together through the feedback loops and improvement cycle mapped in this document.

A reader who understands this map understands how the project behaves. The individual documents explain how each component operates; this document explains how the system holds together. The two are read in that order.

---

*Document version: 1.1*
*Status: Canonical — architectural bridge between the CANON, the Editorial Guidelines, and the operational knowledge base.*
*Authority: Architectural — subordinate to `SETAS_DE_LA_PENA_CANON.md` and `EDITORIAL_GUIDELINES.md`; superior to operational documents.*
*This document may only be revised through the decision process defined in CANON Section 16.*
