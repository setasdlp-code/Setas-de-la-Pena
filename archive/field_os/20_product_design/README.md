---
title: SdP Field OS — Product Design Phase (README)
document_id: PD-000
authority: product-design
category: product-design
version: 1.0
last_reviewed: 2026-07-06
status: active
governed_by:
  - PRODUCT_CANON.md
  - PRODUCT_ARCHITECTURE.md
  - DATA_MODEL.md
  - MODULE_MAP.md
  - USER_WORKFLOWS.md
  - SYSTEM_INTERACTIONS.md
  - RECIPE_SIMULATOR_INTEGRATION.md
  - FIELD_OS_MVP_ARCHITECTURE.md
  - PRODUCT_EXPERIENCE.md
  - DESIGN_REVIEW_PROTOCOL.md
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
---

# 20_product_design — SdP Field OS

## Product Design Phase — v1.0

---

## 0. Nature and scope

This folder holds the **Product Design phase** of Field OS. Its single job is to translate the already-approved product architecture into a coherent, production-ready operator experience: user journeys, experience cards, wireframes, prototypes, usability tests, and the design decisions that connect them.

This folder is **not** product governance and **not** software architecture. It originates no architectural decision. It designs *interaction, communication, and experience* on top of a foundation that is treated as fixed. When design and architecture appear to disagree, architecture governs and the design is corrected.

---

## 1. Why this folder exists

The architecture answers *what the product is and must never violate*. The experience layer (`PRODUCT_EXPERIENCE.md`) answers *what a real day should feel like*. Between that felt intent and a built interface there is a gap — screens, flows, copy, states, and the testing that proves they work. This folder is where that gap is closed, deliberately and traceably, without reopening settled questions.

The product must feel like **a quiet companion that remembers**, never an ERP and never a form-filling application. That standard is set by the architecture; realizing it faithfully in concrete artifacts is the work done here.

---

## 2. What belongs here

- User journeys that stage approved workflows (`USER_WORKFLOWS.md`) as lived sequences.
- Experience cards: the smallest unit of design intent for a single moment of interaction.
- Wireframes: low-fidelity structure and layout, never final visual design.
- Prototypes: interactive assemblies used to feel and test flows.
- Design reviews: applications of `DESIGN_REVIEW_PROTOCOL.md` to design artifacts.
- Usability tests: evidence that the design lowers friction and preserves traceability.
- Design decisions: the log of interaction/experience choices and their architectural justification.
- Assets: shared design-support material (design-system references, exports, screenshots).

## 3. What does NOT belong here

- Any change to an Accepted ADR, `PRODUCT_CANON.md`, `PRODUCT_ARCHITECTURE.md`, `DATA_MODEL.md`, `MODULE_MAP.md`, `USER_WORKFLOWS.md`, `SYSTEM_INTERACTIONS.md`, `RECIPE_SIMULATOR_INTEGRATION.md`, `FIELD_OS_MVP_ARCHITECTURE.md`, `PRODUCT_EXPERIENCE.md`, or `DESIGN_REVIEW_PROTOCOL.md`. These are **immutable** from here.
- New entities, new data fields, new modules, new system boundaries, or new invariants.
- Redesign of Field OS, the Recipe & Formulation Engine, or the Knowledge System.
- Source code, deployment, or implementation logic.
- Visual brand redesign. The design language is reused, not reinvented (see `DESIGN_SYSTEM_INTEGRATION.md`).

---

## 4. This folder translates architecture into experience

The direction of authority is one-way:

```
Approved Architecture  →  Experience  →  Design Artifacts  →  Implementation
        (fixed)                              (this folder)
```

Design flows **downstream** from architecture and never back into it. A design artifact may reveal a real architectural problem; when it does, the finding is raised for governance to decide — it is never resolved by editing an immutable document from inside this folder. This folder changes how the architecture is *experienced*, never *what the architecture is*.

---

## 5. Design principles

Every design decision in this folder must satisfy all of the following:

- **Lower cognitive load.** Ask for the least attention that still produces a faithful record.
- **Preserve traceability.** Every captured action stays attributable and reconstructable (INV-3).
- **Reduce documentation friction.** Capture must be lighter than the note-taking it replaces (US-2).
- **Respect operator attention.** The tool asks for attention only at the moment of an action, then returns it.
- **Preserve architectural boundaries.** Never blur Field OS, the Recipe & Formulation Engine, and the Knowledge System.
- **Feel like a quiet companion.** Calm, predictable, unhurried, trustworthy.
- **Never resemble an ERP.** No dense forms, no dashboards for their own sake, no bureaucratic surface.
- **Never expose unnecessary complexity.** The interface shows the object in hand, not the system behind it.

---

## 6. Rules

1. Do not redesign Field OS.
2. Do not redesign the Recipe & Formulation Engine.
3. Do not redesign the Knowledge System.
4. Do not modify any immutable document listed in §3.
5. Reuse the existing design system; create new components only when strictly necessary and justified.
6. Every design artifact traces back to a specific approved architecture or experience reference.

This folder exists only to transform an approved architecture into an excellent operator experience.

---

## 7. Contents

| Item | Purpose |
|------|---------|
| `README.md` | This document — charter and boundaries of the phase. |
| `DESIGN_SYSTEM_INTEGRATION.md` | How to reuse the existing design system for consistency. |
| `EXPERIENCE_BLUEPRINT.md` | The design workflow, from architecture to implementation. |
| `USER_JOURNEYS/` | Lived sequences that stage approved workflows. |
| `EXPERIENCE_CARDS/` | Smallest units of design intent per interaction moment. |
| `WIREFRAMES/` | Low-fidelity structure and layout. |
| `PROTOTYPES/` | Interactive assemblies for feeling and testing. |
| `DESIGN_REVIEWS/` | Protocol applications to design artifacts. |
| `USABILITY_TESTS/` | Evidence that the design works for the operator. |
| `DESIGN_DECISIONS/` | Log of interaction/experience decisions and their justification. |
| `ASSETS/` | Shared design-support material. |

Each subfolder carries its own `README.md` stating Purpose, Inputs, Outputs, Dependencies, Responsible role, and Relationship with the approved architecture.

---

## 8. Roles

- **Product Designer** — owns the artifacts in this folder; accountable for faithfulness to architecture and experience.
- **Design Reviewer** — applies `DESIGN_REVIEW_PROTOCOL.md`; issues Accept / Revise / Reject.
- **Architecture Owner** — sole authority over immutable documents; the only one who may change them, and only through governance, never from here.
