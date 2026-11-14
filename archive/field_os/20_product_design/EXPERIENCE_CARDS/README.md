---
title: SdP Field OS — Experience Cards
document_id: PD-011
authority: product-design
category: product-design
version: 1.0
last_reviewed: 2026-07-06
status: active
governed_by:
  - PRODUCT_EXPERIENCE.md
  - USER_WORKFLOWS.md
  - DATA_MODEL.md
supersedes: null
superseded_by: null
---

# EXPERIENCE_CARDS

## What lives here

**Experience cards** — the smallest unit of design intent. One card describes a single moment of interaction: the operator's intent at that moment, what the tool asks for, what it must not ask for, the expected feel, and the architectural reference the moment serves. Cards decompose journeys into designable atoms.

- **Purpose.** Capture design intent for one interaction moment, precisely and traceably, before any layout is drawn.
- **Inputs.** `USER_JOURNEYS/` (context), `PRODUCT_EXPERIENCE.md` (register and principles), `USER_WORKFLOWS.md` and `DATA_MODEL.md` (what the moment records).
- **Outputs.** One card per moment; each cites its invariant/principle/workflow reference. Cards feed `WIREFRAMES/`.
- **Dependencies.** A staged journey; `EXPERIENCE_BLUEPRINT.md`; `DESIGN_SYSTEM_INTEGRATION.md`.
- **Responsible role.** Product Designer.
- **Relationship with the approved architecture.** Downstream. A card expresses how an approved moment should feel; it never introduces a field, entity, or action the architecture does not define. Every card must name its source reference.
