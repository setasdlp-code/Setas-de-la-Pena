---
title: Setas de la Peña — Canon Architecture Document
document_id: STD-0002
authority: highest
category: architecture
load_priority: always
version: 1.2
last_reviewed: 2026-06-29
status: canonical
supersedes: null
superseded_by: null
---

# SETAS DE LA PEÑA — CANON

## Architectural Reference Document — v1.2

---

## 1. Purpose

This document defines the architectural principles governing the Setas de la Peña knowledge base, operational system, and decision-making processes. It does not describe cultivation procedures, equipment specifications, or business operations. Those are defined in subordinate documents.

Every AI assistant, human operator, or external collaborator interacting with this knowledge base must read this document before consulting operational documentation. This document takes precedence over all other documents in cases of philosophical or architectural conflict.

The purpose of this document is to ensure that the project thinks consistently across time, across personnel changes, and across technological iterations.

---

## 1.1 Scope

This document defines governing principles only. It intentionally excludes operational procedures, standard operating procedures (SOPs), substrate formulations, species parameters, equipment specifications, recipes, experimental results, and production records. Those topics belong in their respective subordinate documents within the knowledge base hierarchy defined in Section 11.

The CANON defines governing principles. Operational documents define implementation. A principle that belongs in an SOP is not a principle — it is a procedure. A procedure that belongs in the CANON is not a procedure — it is an architectural decision. These categories must not be conflated.

---

## 2. Mission

Operate a modular, technically documented mushroom cultivation system in Tenjo, Cundinamarca, Colombia, capable of producing gourmet and medicinal fungi with measurable quality parameters, traceable production records, and incremental automation — at a scale that is profitable, recoverable from failure, and expandable without structural redesign.

The mission is not growth for its own sake. The mission is to build a system that produces reliable results and can be understood, maintained, and improved by operators with limited prior expertise.

---

## 3. Core Principles

These principles apply to every decision, every document, and every system configuration in this project. They do not expire. They are revised only through the formal decision process defined in Section 16.

**P-01 — Verifiability over assumption.**
No operational parameter is accepted without a cited source or field-measured value. Estimates are labeled as estimates. Unverified data is labeled as unverified.

**P-02 — Simplicity over sophistication.**
When two solutions solve the same problem, the simpler solution is preferred. Complexity is introduced only when simplicity provably fails.

**P-03 — Modularity over integration.**
Systems are designed so that individual components can fail, be replaced, or be upgraded without cascading effects on other components.

**P-04 — Documentation as infrastructure.**
An undocumented decision, procedure, or system configuration is treated as nonexistent from an operational continuity perspective. If it is not written, it does not exist.

**P-05 — Measurement before optimization.**
No process is optimized before baseline performance is measured and recorded. Optimization without measurement is speculation.

**P-06 — Isolation of failure.**
System design must prevent single-point failures from propagating. Each module, chamber, sensor network, and production batch operates with sufficient independence that its failure does not terminate operations in other modules.

**P-07 — Technical language is mandatory.**
All internal documentation, operator communications, and AI-generated content must use technical-agronomic register. Mystical, animistic, or pseudoscientific language is prohibited in all project documents.

**P-08 — Observation precedes intervention.**
Unexpected biological behaviour is investigated before corrective action is taken. An anomaly is first characterized — documented, photographed, and assessed against known parameters — before the environment, substrate, or procedure is modified in response. Operational changes modify the minimum number of variables necessary to preserve causal interpretation. A change that resolves an anomaly but cannot be causally attributed to a specific variable produces no transferable knowledge.

---

## 4. Infrastructure Philosophy

Physical infrastructure is designed around four constraints specific to this project's operating environment: altitude (2600 m a.s.l.), remote management (operator is not physically present), limited initial capital, and the requirement for incremental expansion.

Infrastructure decisions follow this priority order:

1. The infrastructure must not introduce biological contamination risk.
2. The infrastructure must function reliably under the environmental conditions of Tenjo.
3. The infrastructure must be maintainable by on-site personnel without specialist tools.
4. The infrastructure must be expandable by adding modules without redesigning the base system.

Infrastructure is built to production requirements, not aspirational requirements. A system component is not purchased until the preceding phase has validated the need for it.

Environmental control is applied to production modules rather than entire buildings whenever technically and economically feasible. Conditioning smaller, well-defined volumes reduces biological risk by limiting the consequences of a single control failure, reduces operating costs by minimizing the energy required to maintain target parameters, reduces capital expenditure by deferring building-scale HVAC investment, and reduces energy consumption by matching conditioning capacity to actual biological demand. Module-level control also increases flexibility: individual modules can be taken offline, reconfigured, or operated at different parameters without affecting adjacent production.

Physical infrastructure phases are defined in `04_facility/master_blueprint.md`. No phase is initiated before the preceding phase has produced at least one documented production cycle.

---

## 5. Laboratory Philosophy

Laboratory capability is the technological foundation of this project. It is also a progression, not a starting requirement. The project is designed to produce commercially viable product beginning with minimal laboratory infrastructure, expanding capability as each phase is validated.

The roadmap is:

**Phase 1** — Still Air Box (SAB). Agar work. Tissue cloning. Commercial spawn. No pressure sterilization. No laminar flow. Operations begin here.

**Phase 2** — Internal grain spawn production. Pressure sterilization. Reduced dependency on commercial spawn suppliers.

**Phase 3** — Laminar Flow Hood (LAF). Full axenic technique. Contamination risk substantially reduced at scale.

**Phase 4** — Long-term culture library and strain preservation. Proprietary genetics. Multi-species production with internally maintained culture stock.

Laboratory capabilities are unlocked in sequence. No phase is initiated before the preceding phase is operationally stable. This sequencing exists to prevent contamination risk expansion before operators have the skills to manage it.

Laminar flow is an operational evolution, not a prerequisite for beginning agar work. Agar technique is developed under SAB discipline in Phase 1 precisely so that the skills are in place before the equipment arrives.

Laboratory equipment specifications are defined in `04_facility/laboratory.md` and `05_equipment/laminar_flow.md`.

---

## 6. Production Philosophy

Production is batch-based and fully traceable. Each batch is assigned a unique lot identifier at inoculation. Lot records are maintained from substrate preparation through final sale or disposal.

Production volume is scaled only after the current scale has demonstrated measurable biological efficiency (BE) and contamination rate within defined acceptance thresholds. Scaling into non-validated conditions is a risk category, not a growth strategy.

A batch that does not meet quality thresholds is not sold. It is composted, and the cause of failure is documented. Failure documentation is as operationally valuable as production documentation.

Acceptance thresholds are defined in `06_operations/quality_control.md`. Batch tracking procedures are defined in `06_operations/batch_tracking.md`.

Production of a second species is not initiated before the primary species has completed a minimum of three documented production cycles with BE within the defined acceptance range.

---

## 7. Automation Philosophy

Automation exists to enforce consistency in environmental parameters that exceed human attention capacity over continuous operation. It does not replace operational judgment.

The automation architecture follows this design hierarchy:

**Sensor** → **Microcontroller** → **Actuator** → **Log** → **Alert**

Every automated action must produce a log entry. Every log entry must be accessible to the operator without specialist tools. Automation that cannot be monitored is not implemented.

Automation augments observation. It never replaces biological understanding. Automation exists to increase consistency, traceability, and environmental stability across continuous operation — not to substitute for operator knowledge of what the biology requires. Human observation remains the primary diagnostic tool. A reading outside expected range is an observation prompt, not an automatic trigger for corrective action. The operator interprets; the automation executes.

Automation is introduced incrementally. Manual operation is the baseline. Automation is validated against manual operation before replacing it. If automation fails, manual operation resumes without production interruption.

No single control point governs all production modules. If the central Home Assistant instance fails, individual modules continue operating under last-known parameters until the operator intervenes.

Automation architecture is defined in `05_equipment/environmental_control.md`. ESPHome configuration templates are maintained in that document.

The following sensor decisions are permanent until superseded by field-validated alternatives:

- VIVOSUN H05 integrated humidity sensor: **disqualified**. Bias of +30–35% relative humidity renders its readings operationally invalid.
- SCD30 CO₂ sensor: configured with `altitude_compensation: 2600` at all times.
- SHT3x (Sensirion): primary temperature and humidity sensor for all production modules.

---

## 8. Purchasing Philosophy

Purchasing decisions are governed by a single constraint: acquire only what is needed for the current phase, validated by the requirements of the preceding phase.

Capital expenditure follows this evaluation sequence:

1. Define the problem the purchase solves.
2. Confirm that no existing equipment can solve the problem.
3. Identify the minimum specification that solves the problem.
4. Evaluate local availability before importing.
5. Acquire the minimum quantity required for phase validation.

The project does not purchase equipment in anticipation of future phases without documented evidence that the current phase has been completed and the next phase is operationally justified.

The project treats used industrial equipment as a legitimate acquisition category when it significantly accelerates operational maturity. Industrial equipment — autoclaves, laminar flow hoods, environmental control units — is built to standards that frequently exceed the reliability of new consumer-grade alternatives. Such equipment may represent a strategic acquisition when it does not compromise maintainability (parts and service documentation are available), documentation (operating specifications can be verified), or reliability (equipment condition can be assessed prior to acquisition). Equipment age alone is never a rejection criterion. The evaluation criteria are condition, documentation, and fitness for purpose.

Vendor relationships are documented in `07_business/suppliers.md`. All supplier records include price, quality assessment, and lead time verified through direct transaction, not estimate.

---

## 9. Research Philosophy

Research serves two functions in this project: justification of current operational parameters and identification of parameters requiring field validation.

Research sources are classified into three tiers:

**Tier 1** — Peer-reviewed journals, university extension publications, government agricultural agencies.

**Tier 2** — Technical books by recognized subject-matter experts, equipment manufacturer specifications, national research institutions.

**Tier 3** — Practitioner communities, online forums, unverified cultivation reports.

Tier 3 sources are used only for hypothesis generation, not for operational parameter setting. Any parameter derived from a Tier 3 source must be validated through field measurement before incorporation into SOPs.

Research findings are not incorporated into SOPs without explicit citation and evidence strength rating. The rating system uses a five-star scale defined in `09_research/literature_database.md`.

Research priorities are determined by operational bottlenecks rather than academic completeness. The project does not pursue research because a topic is interesting or because published literature is incomplete. It pursues research because a specific, identified gap in current knowledge is limiting current or future production capability. Unresolved operational questions take precedence over general cultivation science. When a bottleneck is resolved, the corresponding research question is closed and a new bottleneck identifies the next research priority.

The project maintains a list of operationally relevant unresolved questions in `09_research/unresolved_questions.md`. This list is a living document. Questions are not removed until field data or Tier 1/2 literature resolves them.

---

## 10. Knowledge Management Philosophy

Documentation is treated as physical infrastructure. Losing a documented procedure, decision rationale, or system configuration is operationally equivalent to losing the physical asset those documents describe.

Knowledge in this project is classified into three stability categories:

**Stable knowledge** — Biological parameters, chemical processes, physical laws. Changes only when contradicted by new Tier 1 evidence. Stored in species files (`01_species/`), substrate files (`02_substrates/`), and research summaries (`09_research/research_summaries.md`).

**Operational knowledge** — Current equipment configuration, active SOPs, production schedules, batch logs. Changes as the project evolves. Stored in `05_equipment/`, `06_operations/`, and `FARM_BRAIN.md`.

**Dynamic knowledge** — Current priorities, active bottlenecks, pending decisions, this week's tasks. Changes weekly or faster. Stored exclusively in `FARM_BRAIN.md` and batch logs.

These three categories must not be mixed within a single document. A document that conflates stable biological parameters with dynamic operational priorities creates maintenance liability.

---

## 11. Documentation Architecture

The knowledge base follows a strict document hierarchy. Each document type has a defined scope. Scope violations — where a document contains content outside its defined type — are treated as documentation debt and corrected at the next review cycle.

| Document Type | Scope | Examples |
|---|---|---|
| Canon (this document) | Defines how the project thinks | `SETAS_DE_LA_PENA_CANON.md` |
| Architecture | Defines system structure and load rules | `README_MCP.md` |
| Operational Snapshot | Current state, priorities, constraints | `FARM_BRAIN.md` |
| SOP | How a specific procedure is performed | `02_substrates/pasteurization.md` |
| Species Profile | Stable biological parameters per species | `01_species/*.md` |
| Decision Log | Why a specific decision was made | Embedded in `FARM_BRAIN.md` decisions table |
| Research Entry | What the literature states, with evidence rating | `09_research/literature_database.md` |
| Batch Log | What happened in a specific production cycle | `06_operations/batch_tracking.md` |
| Metadata | Structured data for programmatic access | `metadata/*.yaml` |

**SOPs describe HOW work is performed.**
**Decision logs describe WHY a choice was made.**
**Batch logs describe WHAT happened.**
**Research documents describe WHAT is known.**
**The Canon defines HOW the project thinks.**

No document substitutes for another. A SOP that explains why a procedure exists is mixing types. A batch log that includes a SOP is mixing types.

---

## 12. Strategic Priorities

Strategic priorities are ordered. When resources — time, capital, or attention — are constrained, higher-priority items take precedence over lower-priority items without exception.

**Priority 1 — Biological containment.**
Preventing contamination propagation between batches, between modules, and between phases. No production activity proceeds if contamination containment protocols cannot be maintained.

**Priority 2 — Data integrity.**
Sensor calibration, batch record accuracy, and environmental log continuity. Production data that cannot be trusted invalidates all optimization decisions derived from it.

**Priority 3 — Production continuity.**
Maintaining at least one active production module at all times once Phase 1 is established. Production interruptions are acceptable for infrastructure upgrades; they are not acceptable due to preventable operational failures.

**Priority 4 — Market development.**
Building and maintaining customer relationships, pricing, and distribution channels. This priority does not supersede Priorities 1–3. Product is not sold that does not meet quality thresholds, regardless of commercial pressure.

**Priority 5 — Scale expansion.**
Adding production modules, species, or infrastructure phases. Expansion is initiated only when Priorities 1–4 are stable at current scale.

---

## 13. Success Metrics

The following metrics define operational success. They are evaluated per production cycle and tracked over time.

| Metric | Definition | Threshold | Document |
|---|---|---|---|
| Biological Efficiency (BE) | Fresh yield / dry substrate weight × 100 | ≥80% | `06_operations/quality_control.md` |
| Contamination Rate | Contaminated blocks / total blocks × 100 | ≤10% | `06_operations/quality_control.md` |
| Grade A Yield | Grade A product / total fresh yield × 100 | ≥80% | `06_operations/quality_control.md` |
| Sensor Uptime | Hours with valid sensor readings / total hours | ≥95% | `05_equipment/environmental_control.md` |
| Lot Traceability | Lots with complete records / total lots | 100% | `06_operations/batch_tracking.md` |
| Ventilation Control Compliance | Hours with CO₂ in target range and extractor response available / total fruiting hours | ≥90% after commissioning | `05_equipment/environmental_control.md` |
| Knowledge Growth | Validated additions to the knowledge base generated during each production cycle | ≥1 per cycle | `09_research/literature_database.md`, batch logs |

Knowledge Growth is tracked because accumulated operational knowledge is a strategic asset. A production cycle that yields mushrooms but produces no validated, documented learning represents an irreversible opportunity cost. The cumulative knowledge base determines the project's capacity to diagnose future problems, train future operators, and expand into new species or processes without starting from zero.

Metrics below threshold for two consecutive cycles trigger a root-cause analysis. Root-cause analysis results are documented in the batch log and, if the finding has systemic implications, in the relevant SOP.

---

## 14. Document Precedence Rules

When two documents contain conflicting information, precedence is resolved in this order:

1. `SETAS_DE_LA_PENA_CANON.md` (this document)
2. `README_MCP.md`
3. `FARM_BRAIN.md`
4. Species profiles (`01_species/`)
5. Substrate SOPs (`02_substrates/`)
6. Equipment documentation (`05_equipment/`)
7. Operations SOPs (`06_operations/`)
8. Research summaries (`09_research/`)
9. Business documents (`07_business/`)
10. Brand documents (`08_brand/`)

A conflict between documents at different precedence levels is resolved by the higher-precedence document. A conflict between documents at the same level is flagged as a documentation inconsistency and resolved through the decision process defined in Section 16. The resolved position is documented in both affected files and in `FARM_BRAIN.md`.

---

## 15. Engineering Philosophy

Engineering decisions in this project follow a fixed priority order. This order is not renegotiated for individual decisions. An engineering choice that satisfies a lower-priority requirement at the cost of a higher-priority requirement is rejected.

**1. Biological Safety**
The system must not create conditions that increase contamination risk, pathogen exposure, or chemical hazard. This requirement supersedes all others.

**2. Reliability**
The system must perform its defined function under expected operating conditions without failure. A system that is theoretically optimal but fails under field conditions has zero operational value.

**3. Maintainability**
The system must be diagnosable and repairable by on-site personnel without specialist tools or remote expert support. Maintainability is evaluated at design time, not after installation.

**4. Modularity**
Components are designed to be replaced, upgraded, or removed without redesigning adjacent components. Proprietary integration that creates vendor lock-in is avoided unless no modular alternative exists.

**5. Scalability**
The system architecture accommodates addition of modules, sensors, and production capacity without structural redesign. Scalability is a design constraint, not a future upgrade.

**6. Total Cost of Ownership**
Acquisition cost is evaluated alongside operating cost, maintenance cost, and replacement cost over a three-year horizon. A lower-cost component with higher failure rate or replacement cost is not automatically preferred.

**7. Operational Efficiency**
Efficiency improvements — reduced labor, faster cycles, lower energy consumption — are implemented after the preceding six requirements are satisfied. Efficiency optimization that compromises reliability is rejected.

The biological system defines the engineering constraints. Engineering does not redefine biology. When a biological requirement — a specific humidity range, a CO₂ threshold, a substrate sterilization temperature — conflicts with an engineering preference for simplicity or cost reduction, the biological requirement prevails. The engineering response is to find a solution that meets the biological constraint, not to renegotiate the constraint.

This order exists because biological and reliability failures have recovery costs that exceed the savings produced by optimization. A contaminated production batch eliminates the value of every efficiency gain in that cycle. A failed sensor producing invalid data renders all decisions based on that data operationally invalid.

---

## 16. Decision-Making Philosophy

Every non-trivial operational, engineering, or business decision follows this process:

```
Problem
  ↓
Evidence (Tier 1 preferred; source and confidence rating documented)
  ↓
Constraints (budget, timeline, available infrastructure, operator capability)
  ↓
Alternatives (minimum two; evaluated against engineering priority order)
  ↓
Simplest acceptable solution (defined as: lowest complexity that satisfies all hard constraints)
  ↓
Measurement plan (how success will be evaluated and over what timeframe)
  ↓
Documentation (decision, rationale, and measurement results recorded in FARM_BRAIN.md)
```

No decision is permanent. Every decision is subject to revision when new Tier 1 evidence, changed operational constraints, or measured performance data justifies revision. The revision process follows the same sequence as the original decision.

Reversing a previous decision requires the same documentation as making the original decision. Undocumented reversals are treated as decision-making failures, not operational flexibility.

---

## 17. Risk Management

Risk management in this project is governed by the principle that reducing systemic risk is more important than maximizing production output. A production decision that increases contamination risk, sensor failure probability, or operator error rate is not justified by projected yield increases.

**Redundancy policy:**
Every critical measurement point has a backup sensor. Every critical actuator (humidifier, extractor) has a defined manual fallback procedure. Redundancy is not optional for parameters that directly govern biological outcomes.

**Single points of failure:**
System design explicitly identifies single points of failure and documents the failure consequence and recovery procedure. A component is classified as a single point of failure if its failure stops production in more than one module simultaneously or destroys active batch data.

**Failure isolation:**
Production modules are isolated so that a contamination event, sensor failure, or power interruption in one module does not propagate to adjacent modules. Shared infrastructure — central Home Assistant instance, shared air handling — is designed with fallback states that allow continued operation under degraded central coordination.

**Recovery:**
Every failure mode identified in equipment and operations documents includes a documented recovery procedure. Recovery procedures are written for execution by on-site personnel without remote operator support. A failure mode without a documented recovery procedure is an open risk item and is tracked in `09_research/unresolved_questions.md` until resolved.

**Risk escalation:**
If an on-site operator encounters a condition not covered by existing SOPs, the default action is to halt the affected process, isolate the affected module, and contact the remote operator. Proceeding under undocumented conditions is not within operator authority.

---

## 18. Continuous Improvement

Improvement in this project follows a structured cycle. Improvement is not implemented based on intuition or anecdotal observation.

The cycle is:

**Measure** → current baseline performance against defined metrics.
**Identify** → specific gap between current performance and target threshold.
**Hypothesize** → specific, testable explanation for the gap.
**Test** → controlled change to a single variable while holding others constant.
**Measure** → performance under modified conditions over a statistically meaningful number of cycles.
**Document** → results, conclusions, and decision to adopt, reject, or iterate.

Changes to SOPs, equipment configuration, or species parameters are implemented only after this cycle produces documented evidence of improvement. Simultaneous changes to multiple variables in the same production cycle invalidate the measurement cycle.

---

## 19. Knowledge as Infrastructure

The knowledge base is the operational continuity plan for this project. Personnel changes, equipment failures, and production interruptions are recoverable if the knowledge base is complete and current. They may not be recoverable if the knowledge base is incomplete.

The following events require immediate knowledge base updates:

- Any equipment addition, removal, or reconfiguration.
- Any change to a production SOP, regardless of magnitude.
- Any resolved unresolved question in `09_research/unresolved_questions.md`.
- Any decision made via the process defined in Section 16.
- Any production cycle with results outside defined thresholds, including the root-cause finding.
- Any new supplier, price change, or supply chain disruption.

`FARM_BRAIN.md` is the canonical current-state document. It is updated whenever any of the above events occurs. A `FARM_BRAIN.md` that is more than two weeks out of date is operationally unreliable.

All other documents in the knowledge base are updated on the schedule defined by their content type:

- Species profiles: updated when Tier 1 literature supersedes existing parameters.
- Equipment documents: updated when equipment is modified or replaced.
- SOPs: updated when a production cycle produces evidence that the current procedure produces suboptimal or unsafe outcomes.
- Research documents: updated when new literature is incorporated.
- Business documents: updated when market conditions, pricing, or supplier data changes.

---

## 20. Closing Principle

The primary product of Setas de la Peña is not only mushrooms. It is a continuously improving cultivation system capable of producing mushrooms predictably, documenting its own evolution, and preserving operational knowledge over time.

The physical farm and the knowledge base are inseparable components of the same system. A productive farm without a current, accurate knowledge base is a system whose value cannot be transferred, recovered from failure, or expanded beyond the limits of the individuals currently operating it. A knowledge base without an active farm is an abstraction with no empirical grounding. Neither is complete without the other.

Every principle in this document exists to enforce a single outcome: that the system produces consistent, measurable results and can be understood, improved, expanded, or transferred without loss of operational continuity.

When a decision, procedure, or configuration is not documented, it is not part of the system. It is a liability.

---

## 21. Revision Policy

This document changes only when the architectural philosophy of the project changes. Operational improvements, infrastructure additions, workflow refinements, new recipes, experimental results, and production data must never modify the CANON unless they reveal a need to alter the governing principles of the project.

The distinction is deliberate. Operational knowledge evolves continuously; architectural principles do not. A project that revises its governing principles each time production conditions change has no governing principles — it has preferences. Architectural stability is intentional. It is what allows operational documents to change freely without losing structural coherence.

A proposed revision to this document must demonstrate that an existing principle is incorrect, insufficient, or in conflict with observed project reality — not merely that operational practice has evolved. Revisions follow the decision process defined in Section 16.

---

*Document version: 1.2*
*Effective date: 2026-06-29*
*Next scheduled review: 2026-12-29*
*Authority: Chief Knowledge Architect — Setas de la Peña*
*Supersedes: v1.1*
*This document may only be revised through the decision process defined in Section 16.*
