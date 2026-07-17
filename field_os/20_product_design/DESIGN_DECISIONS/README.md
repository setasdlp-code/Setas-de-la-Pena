---
title: SdP Field OS — Design Decisions
document_id: PD-016
authority: product-design
category: product-design
version: 1.0
last_reviewed: 2026-07-06
status: active
governed_by:
  - PRODUCT_EXPERIENCE.md
  - DESIGN_REVIEW_PROTOCOL.md
supersedes: null
superseded_by: null
---

# DESIGN_DECISIONS

## What lives here

**Design decisions** — the append-only log of interaction and experience choices: the decision, the options considered, the rationale, the architectural reference that justifies it, and any escalated open issue. These are **design** decisions only; they are never architectural decisions (those are ADRs, and immutable from here).

- **Purpose.** Record why each design fork was taken and keep every decision traceable to an approved source.
- **Inputs.** Outputs of reviews and usability tests; the immutable documents cited as justification; any new-component justification from `DESIGN_SYSTEM_INTEGRATION.md`.
- **Outputs.** A durable decision record per choice; the register of open issues escalated to governance.
- **Dependencies.** `DESIGN_REVIEWS/`, `USABILITY_TESTS/`, `EXPERIENCE_BLUEPRINT.md`.
- **Responsible role.** Product Designer (records); Design Reviewer (validates justification).
- **Relationship with the approved architecture.** Downstream and subordinate. A design decision may cite, but never override, an ADR or any immutable document. When a decision needs an architectural change, it is logged as an open issue for governance — the decision log does not make that change.
