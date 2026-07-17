---
title: SdP Field OS — Experience Blueprint
document_id: PD-002
authority: product-design
category: product-design
version: 1.0
last_reviewed: 2026-07-06
status: active
governed_by:
  - PRODUCT_CANON.md
  - PRODUCT_ARCHITECTURE.md
  - USER_WORKFLOWS.md
  - SYSTEM_INTERACTIONS.md
  - PRODUCT_EXPERIENCE.md
  - DESIGN_REVIEW_PROTOCOL.md
supersedes: null
superseded_by: null
---

# EXPERIENCE_BLUEPRINT — SdP Field OS

## The Product Design workflow — v1.0

---

## 0. Nature and scope

This document describes **how design work moves** in this folder: the ordered path from approved architecture to implementable design, and the rule that every artifact along it must trace back to an approved source. It is the process map for the phase, not a design artifact itself.

---

## 1. The workflow

```
        Architecture            (fixed — the immutable documents)
             ↓
        Experience              (PRODUCT_EXPERIENCE.md — the felt intent)
             ↓
        Experience Cards        (EXPERIENCE_CARDS/ — intent for one moment)
             ↓
        Wireframes              (WIREFRAMES/ — structure and layout)
             ↓
        Prototype               (PROTOTYPES/ — interactive assembly)
             ↓
        Usability Testing       (USABILITY_TESTS/ — evidence it works)
             ↓
        Implementation          (handoff to the build; outside this folder)
```

User journeys (`USER_JOURNEYS/`) run alongside the top of this flow: they stage approved workflows as lived sequences and set the context that experience cards then decompose. Design reviews (`DESIGN_REVIEWS/`) and design decisions (`DESIGN_DECISIONS/`) run across every stage — reviews gate movement to the next stage, decisions record why each fork was taken.

---

## 2. What each stage does

- **Architecture → Experience.** No work originates here; both are read as fixed inputs. Experience translates the architecture into a felt standard for a real day.
- **Experience → Experience Cards.** The felt standard is decomposed into single interaction moments, each captured as one card with its architectural reference.
- **Experience Cards → Wireframes.** Cards are given low-fidelity structure: what is on the surface, in what hierarchy, in what sequence. No final visual design.
- **Wireframes → Prototype.** Wireframes are assembled into an interactive flow that can be felt and tested end to end.
- **Prototype → Usability Testing.** The prototype is put in front of realistic use to prove it lowers friction, preserves traceability, and stays calm.
- **Testing → Implementation.** Validated design is handed to the build. Handoff reuses the design system (`DESIGN_SYSTEM_INTEGRATION.md`).

---

## 3. Traceability rule

**Every design decision traces back to approved architecture.** Each artifact — journey, card, wireframe, prototype, test — cites the specific invariant, principle, workflow, or experience section it serves (e.g. INV-3, PC-08, a `USER_WORKFLOWS.md` step, a `PRODUCT_EXPERIENCE.md` section). An artifact that cannot cite its source is not yet ready; a decision that contradicts its source is a defect.

The flow is strictly one-way. When testing or design work surfaces a genuine problem in an immutable document, the finding is escalated to governance — it is recorded in `DESIGN_DECISIONS/` as an open issue and never resolved by editing the immutable document from here.

---

## 4. Gating

Movement between stages is gated by `DESIGN_REVIEW_PROTOCOL.md`. A review returns **Accept**, **Revise**, or **Reject**; any single BLOCKER prevents advancing. Design does not skip ahead of an unresolved architectural conflict.

---

## Purpose / Inputs / Outputs / Dependencies / Role / Architecture relationship

- **Purpose.** Define the ordered design workflow and enforce traceability from every artifact to approved architecture.
- **Inputs.** The immutable documents; `PRODUCT_EXPERIENCE.md`; `USER_WORKFLOWS.md`; `SYSTEM_INTERACTIONS.md`.
- **Outputs.** The stage sequence, the traceability rule, and the gating rule the whole folder follows.
- **Dependencies.** `DESIGN_REVIEW_PROTOCOL.md`; `DESIGN_SYSTEM_INTEGRATION.md`; all subfolders.
- **Responsible role.** Product Designer (runs the workflow); Design Reviewer (gates each stage).
- **Relationship with the approved architecture.** Architecture is the fixed head of the flow. The blueprint routes design strictly downstream of it and guarantees each artifact points back to it.
