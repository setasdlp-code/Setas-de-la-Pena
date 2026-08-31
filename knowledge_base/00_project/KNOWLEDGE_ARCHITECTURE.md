---
title: Knowledge Architecture
document_id: ARCH-KA-001
category: architecture
version: 1.1
status: canonical
authority: architecture
load_priority: always
owner: Setas de la Peña
last_reviewed: 2026-08-13
---

# Knowledge Architecture

## Purpose

This document defines the permanent information architecture of the Setas de la Peña repository. It formalizes the separation between the Knowledge Base and Operations, and defines how external research can influence project thinking without being prematurely promoted to operational authority.

---

## Foundational Principle

The repository consists of two complementary but independent systems.

**System 1 — Knowledge Base**
Contains organizational knowledge at explicitly declared maturity and authority levels: principles, standards, SOPs, research synthesis, active research knowledge, and architectural decisions. Knowledge documents interpret evidence. They do not archive raw operational history.

**System 2 — Operations**
Contains primary operational evidence: daily records, batch logs, sensor exports, photographs, measurements, and production history. Operational records capture what happened. They do not replace validated knowledge.

Evidence and knowledge are different information assets. They serve different purposes and must be maintained separately.

- Operational records generate evidence.
- Scientific literature contributes external evidence.
- Knowledge documents interpret evidence at an explicit maturity level.
- Research knowledge may influence hypotheses, measurement plans, experiments, and design evaluation without becoming an operational standard.
- Knowledge must never be treated as raw operational history.
- Operational history must never replace validated knowledge.

---

## Repository Responsibilities

| | **Knowledge Base** | **Operations** |
|---|---|---|
| **Purpose** | Preserve curated organizational and research knowledge with explicit maturity | Preserve primary operational evidence |
| **Authority** | Variable by document/status; only approved normative documents govern operations | Evidential — records what occurred |
| **Typical update frequency** | Research layers may evolve frequently; stable/normative layers change deliberately | Continuous — updated through cultivation activity |
| **Examples** | CANON, SOPs, species parameters, substrate library, research synthesis, active research knowledge, editorial guidelines, architectural documents | Daily reviews, AI review logs, batch records, experiment records, sensor exports, photographs, measurements, maintenance logs, quality records |
| **Expected permanence** | High for stable knowledge; intermediate for active research knowledge | Variable — records accumulate continuously; may migrate to database |

---

## Knowledge Maturity and Authority

The Knowledge Base does not use a binary distinction between "accepted" and "rejected" information. Verified information may be useful before it is ready to govern operations.

The following maturity states are recognized:

1. **DISCOVERY** — candidate information identified from a source, search, practitioner report, vendor document, synthesis, or other discovery channel. It is not evidence until its provenance and claim are verified.
2. **EVIDENCE** — a claim has been traced to a source representation and its meaning, scope, and limitations have been checked sufficiently for research use.
3. **APPLICABLE INSIGHT** — verified evidence identifies a mechanism, relationship, boundary condition, design principle, variable, or alternative that is plausibly relevant to Setas de la Peña. It does not prescribe an operational action.
4. **PROJECT HYPOTHESIS** — Setas de la Peña has identified an applicable insight as worth testing, measuring, modeling, or comparing under project conditions.
5. **VALIDATED PRACTICE** — project evidence and/or sufficiently applicable scientific evidence support an approved operational practice, setpoint, specification, or SOP requirement.
6. **STABLE KNOWLEDGE** — a validated finding has remained reliable across the relevant operating context and belongs in a stable domain document.
7. **CANON** — only fundamental principles and architectural rules formally approved at CANON authority.

Maturity and authority are separate. An `APPLICABLE INSIGHT` may be highly credible scientific evidence while still having no authority to change a setpoint. A `PROJECT HYPOTHESIS` may strongly shape an experiment while remaining non-normative.

---

## Dual Knowledge Flow

Operational evidence and external research mature through different paths. They converge only when a project practice is being adopted or revised.

### Operational path

```
Observation
    ↓
Operational Record
    ↓
Review / Analysis
    ↓
Lesson Learned
    ↓
Project Hypothesis or Decision
    ↓
Validation
    ↓
Validated Practice
    ↓
Stable Knowledge
    ↓
CANON  ← only when fundamental principles change
```

### Research path

```
Discovery
    ↓
Source / provenance verification
    ↓
Claim verification
    ↓
Evidence quality + applicability assessment
    ↓
Applicable Insight
    ↓
Project Hypothesis / Design Implication / Measurement Opportunity
    ↓
Local validation or decision review when required
    ↓
Validated Practice
    ↓
Stable Knowledge
```

External research does not need to contradict current practice to become useful project knowledge. It may enter the active research layer when it identifies a relevant mechanism, variable, alternative, constraint, or testable relationship.

No research path may bypass the validation and decision gates required to modify mandatory SOP actions, operational setpoints, construction authorization, safety limits, procurement authorization, or CANON-level principles.

---

## Active Research Knowledge Layer

`09_research/active_research_knowledge.md` is the canonical registry for verified research knowledge that is relevant to the project but not yet operationally authoritative.

It may contain four project-facing outputs:

- **Applicable insight** — what the evidence suggests is relevant.
- **Project hypothesis** — what Setas de la Peña should test or model.
- **Design implication** — what a designer or engineer should consider without treating it as an approved specification.
- **Measurement opportunity** — what variable, interaction, or boundary condition should be measured locally.

Every entry must preserve provenance and distinguish:

- what the source actually demonstrates;
- the applicability limits;
- the project interpretation;
- the next validation action, if any;
- whether the entry may influence retrieval, experimental design, Setas OS model development, or design evaluation.

Active research knowledge has **advisory research authority only**. It cannot silently override a decision, SOP, approved setpoint, safety rule, purchase authorization, or construction specification.

---

## Operations Directory

> **Status: PLANNED — not yet instantiated.** As of 2026-07-08 the project is
> pre-production (zero active batches), so no `operations/` directory exists yet.
> This section defines the *target* structure of System 2. Its instantiation is
> deferred until the first production batch (see `DECISIONS.md` DEC-008 and the
> migration plan, Phase 3). Until then, the operational-record **templates** live
> in `06_operations/` — `daily_operational_review_template.md` (TMP-001) and
> `daily_ai_review.md` (TMP-002) — and live tactical state is captured in
> `CURRENT_OPERATIONS.md` at the knowledge_base root.

When instantiated, the `operations/` directory stores primary operational evidence. Its purpose is to preserve the factual record of what occurred during cultivation.

It will include:

- Daily operational reviews
- AI-generated review summaries
- Batch records
- Experiment records
- Sensor data exports
- Photographs and media
- Measurements and observations
- Production history
- Maintenance logs
- Quality records

Operations records are the raw material from which organizational knowledge is eventually extracted. They are not knowledge documents. Future databases or structured data systems may replace these records without affecting repository architecture or the Knowledge Base.

---

## Knowledge Base

The `knowledge_base/` directory stores curated organizational knowledge. Its purpose is to preserve what Setas de la Peña knows, what it is actively investigating, and what has been formally accepted as operationally authoritative without conflating those states.

It contains:

- Foundational principles (CANON)
- Architectural and governance documents
- Editorial and formatting standards
- Species parameters and cultivation protocols
- Substrate library and validated procedures
- Knowledge domains derived from operational evidence
- Research synthesis and literature integration
- Active research knowledge
- Organizational decisions

The Knowledge Base must remain compact, curated, and highly searchable. It is not an archive. Raw operational evidence and undifferentiated source dumps do not belong in the stable knowledge layer. Research content may enter before local validation only when its maturity, provenance, applicability, and authority are explicit.

---

## Architectural Benefits

This separation and maturity model provides:

- **Evidence vs. authority distinction** — a claim may be useful without being operationally authoritative.
- **Higher research recall** — novel mechanisms and variables remain available to agents, engineering, experiments, and Setas OS development.
- **Protection against false promotion** — setpoints and SOP requirements retain high evidence and approval thresholds.
- **Controlled repository growth** — raw operational volume does not inflate the Knowledge Base.
- **AI retrieval quality** — agents can retrieve both stable knowledge and explicitly labeled active research knowledge.
- **Traceability** — project-facing insights can be traced back to source claims or operational evidence.
- **Governance clarity** — maturity, evidence quality, applicability, and authority are independent fields rather than one binary status.
- **Database compatibility** — Operations can migrate to structured storage without architectural impact.
- **Long-term maintainability** — stable knowledge remains compact while research remains discoverable and actionable.

---

## Rules

1. The Knowledge Base must never become an archive of operational records.
2. Operations must never become a repository of validated knowledge.
3. Operational records may reference Knowledge Base documents by document ID.
4. Knowledge Base documents may cite operational evidence as the source of a validated finding.
5. Research findings may enter the active research layer before local validation when provenance, evidence quality, applicability, maturity, and non-authoritative status are explicit.
6. A research finding does not need to contradict current practice to become an applicable insight or project hypothesis.
7. Applicable insights and project hypotheses may guide experiments, measurement plans, design evaluation, and model development; they may not silently modify mandatory operational practice.
8. Changes to active SOP requirements, safety rules, setpoints, procurement authorization, construction authorization, or CANON continue to require their existing approval and validation processes.
9. Neither Operations nor active research knowledge replaces stable normative knowledge.
10. Cross-references between systems and maturity states are permitted and encouraged for traceability.

---

## Future Evolution

The systems and maturity layers evolve at different rates.

**Stable and normative Knowledge Base documents** evolve deliberately when evidence validates a change and the applicable approval process is completed.

**Active research knowledge** may evolve more frequently as literature is verified, applicability changes, hypotheses are tested, or new mechanisms are discovered. Entries must be revised, promoted, superseded, or rejected rather than silently disappearing.

**Operations** evolves continuously. Records are added through cultivation activity without restriction. Volume is expected to grow indefinitely.

The architecture therefore optimizes simultaneously for precision in operational authority and recall in research knowledge.

---

## Closing Principle

Setas de la Peña preserves operational evidence, active research knowledge, and stable organizational knowledge as distinct information states.

A claim can be scientifically useful before it is locally validated. Its usefulness must be preserved without granting it authority it has not earned.
