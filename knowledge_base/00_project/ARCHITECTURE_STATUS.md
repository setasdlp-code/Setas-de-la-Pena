---
title: Architecture Status
document_id: DOC-0002
version: 1.1
status: canonical
authority: governance
load_priority: always
owner: Setas de la Peña
last_reviewed: 2026-07-16
---

# Architecture Status

## Purpose

This document records the verified maturity of the Setas de la Peña knowledge system. Architectural completeness, operational readiness, and automation readiness are evaluated separately; none implies the others.

---

## Current Status

| Component | Verified status | Meaning |
|---|---|---|
| Repository package | Version-controlled baseline ready | The reviewed scope passes machine checks and can form the initial private baseline |
| Knowledge architecture | Established | Domain boundaries, governance documents, navigation, and identifier rules exist |
| Governance | Established | Authority, editorial, identifier, and agent rules are documented |
| Operational knowledge | `verification_required` | Procedures and parameters include provisional values that require local trials |
| Research | Curated, continuous | Sources are catalogued and synthesized; local source PDFs are not versioned |
| AI workflow library | Draft, usable for assisted work | Templates exist but are not evidence of autonomous operation |
| ECC automation | Blocked pending commissioning | Automated actions remain disabled until sensors, ventilation, inventory, and manual override are verified |

The repository baseline is suitable for private version control. That does not constitute evidence of a commissioned production system.

---

## Core Architecture

| Document | Purpose | Status | Authority |
|---|---|---|---|
| `REPOSITORY_MAP.md` | Canonical index and navigation | Corrected and reviewed | Navigation |
| `SETAS_DE_LA_PENA_CANON.md` | Foundational principles | Canonical | Canonical |
| `EDITORIAL_GUIDELINES.md` | Document and evidence standards | Canonical | Editorial |
| `SYSTEM_FLOW.md` | Information and operational flow | Canonical | Structural |
| `AI_AGENT_PROTOCOL.md` | Agent behavior and retrieval rules | Canonical | Agent behavior |
| `IDENTIFIER_STANDARD.md` | Identifier and traceability conventions | Canonical | Governance |
| `KNOWLEDGE_ARCHITECTURE.md` | Separation of validated knowledge and raw evidence | Canonical | Architecture |

---

## Maturity Assessment

Percentages are deliberately not used. A numerical score would imply a measurement model that the project has not defined.

| Area | Assessment | Evidence or gap |
|---|---|---|
| Structure | Verified | Repository map matches the committed directory layout |
| Navigation | Verified | Canonical entry points resolve to existing files |
| Identifier policy | Defined | Operational adoption must be confirmed as new records are created |
| Research traceability | Corrected | Literature records and bibliography use the retained `paper_`/`book_`/`web_`/`guide_` scheme |
| Biological parameters | Provisional where labeled | Local validation is pending for substrate, yield, and environmental ranges |
| Equipment inventory | Structured | Physical identity and installation performance still require field verification |
| Sensor control | Not commissioned | ECC correctly blocks automated actions |
| Operational evidence store | Planned, not instantiated | Create `operations/` when the first real batch or sensor record is captured |

---

## Known Preconditions Before Automation

The following blockers are authoritative until completed in the field:

- Verify inventory against physical equipment and canonical equipment IDs.
- Cross-check every sensor against a trusted reference.
- Measure effective installed airflow and calculate ACH from actual volume and duty cycle.
- Test fail-safe behavior and manual override.
- Record at least one real operational cycle using the traceability model.
- Promote provisional thresholds only after documented evidence supports the change.

---

## Repository Growth Model

```text
Observation
    ↓
Operational Record
    ↓
Repeated Evidence
    ↓
Lesson Learned
    ↓
Decision
    ↓
SOP
    ↓
Stable Knowledge
    ↓
CANON  ← only when fundamental principles change
```

A single observation does not justify an SOP, and an external reference does not by itself validate local performance.

---

## Evolution Policy

The current architecture should be changed only when:

1. Repeated operational evidence demonstrates a structural limitation.
2. Governance must change to reflect actual organizational practice.
3. A required capability cannot be represented without distorting an existing domain.

Routine work should strengthen traceability, current-state accuracy, and field validation before adding new architecture.

---

## Review Cadence

Review this status after commissioning and at least every six to twelve months. Each review must distinguish document quality from verified operational performance.
