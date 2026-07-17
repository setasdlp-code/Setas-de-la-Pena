---
title: Knowledge Architecture
document_id: ARCH-KA-001
version: 1.0
status: canonical
authority: architecture
load_priority: always
owner: Setas de la Peña
---

# Knowledge Architecture

## Purpose

This document defines the permanent information architecture of the Setas de la Peña repository. It formalizes the separation between two independent but complementary systems: the Knowledge Base and Operations. This separation is an architectural decision, not a filing convention.

---

## Foundational Principle

The repository consists of two complementary but independent systems.

**System 1 — Knowledge Base**
Contains validated organizational knowledge: principles, standards, SOPs, research synthesis, and architectural decisions. Knowledge documents interpret validated evidence. They do not archive it.

**System 2 — Operations**
Contains primary operational evidence: daily records, batch logs, sensor exports, photographs, measurements, and production history. Operational records capture what happened. They do not replace validated knowledge.

Evidence and knowledge are different information assets. They serve different purposes and must be maintained separately.

- Operational records generate evidence.
- Knowledge documents interpret validated evidence.
- Knowledge must never be treated as raw operational history.
- Operational history must never replace validated knowledge.

---

## Repository Responsibilities

| | **Knowledge Base** | **Operations** |
|---|---|---|
| **Purpose** | Preserve validated organizational knowledge | Preserve primary operational evidence |
| **Authority** | Canonical — governs decisions and agent behavior | Evidential — records what occurred |
| **Typical update frequency** | Infrequent — updated when evidence validates a change | Continuous — updated through daily cultivation activity |
| **Examples** | CANON, SOPs, species parameters, substrate library, research synthesis, editorial guidelines, architectural documents | Daily reviews, AI review logs, batch records, experiment records, sensor exports, photographs, measurements, maintenance logs, quality records |
| **Expected permanence** | High — documents are stable and compact | Variable — records accumulate continuously; may migrate to database |

---

## Knowledge Flow

Operational evidence matures into organizational knowledge through validation. Knowledge must never bypass this process.

```
Observation
    ↓
Operational Record
    ↓
Daily AI Review
    ↓
Lesson Learned
    ↓
Decision
    ↓
SOP
    ↓
Knowledge Domain
    ↓
Stable Knowledge
    ↓
CANON  ← only when fundamental principles change
```

A single observation does not justify an SOP. A lesson learned is not a standard until it has been validated across multiple cycles. CANON-level principles represent the highest tier of validated knowledge and change rarely.

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

The `knowledge_base/` directory stores validated organizational knowledge. Its purpose is to preserve what has been learned and formally accepted as true for Setas de la Peña.

It contains:

- Foundational principles (CANON)
- Architectural and governance documents
- Editorial and formatting standards
- Species parameters and cultivation protocols
- Substrate library and validated procedures
- Knowledge domains derived from operational evidence
- Research synthesis and literature integration
- Organizational decisions

The Knowledge Base must remain compact, curated, and highly searchable. It is not an archive. Documents enter the Knowledge Base only after evidence has been validated.

---

## Architectural Benefits

This separation produces the following structural benefits:

- **Evidence vs. knowledge distinction** — roles of each document type are unambiguous
- **Controlled repository growth** — operational volume does not inflate the Knowledge Base
- **AI retrieval quality** — agents load validated knowledge without filtering through raw evidence
- **Traceability** — every knowledge document can be traced back to operational evidence
- **Governance simplicity** — each system has clear authority and update criteria
- **Database compatibility** — Operations can migrate to structured storage without architectural impact
- **Long-term maintainability** — the Knowledge Base remains stable as operations scale

---

## Rules

1. The Knowledge Base must never become an archive of operational records.
2. Operations must never become a repository of validated knowledge.
3. Operational records may reference Knowledge Base documents by document ID.
4. Knowledge Base documents may cite operational evidence as the source of a validated finding.
5. Neither system replaces the other.
6. Cross-references between systems are permitted and encouraged for traceability.

---

## Future Evolution

The two systems evolve at different rates and through different mechanisms.

**Knowledge Base** evolves slowly. Documents change only when operational evidence has been validated and a formal determination is made that existing knowledge requires revision. Changes should be infrequent and deliberate.

**Operations** evolves continuously. Records are added through daily cultivation activity without restriction. Volume is expected to grow indefinitely.

Both systems are equally important to the organization. Their responsibilities remain permanently separated regardless of how either system scales.

---

## Closing Principle

The Setas de la Peña repository preserves two complementary forms of organizational memory.

**Operations** preserves what happened.

**Knowledge Base** preserves what has been learned.

Both are essential. Neither should replace the other.
