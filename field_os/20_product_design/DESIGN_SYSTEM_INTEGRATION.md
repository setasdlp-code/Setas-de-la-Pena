---
title: SdP Field OS — Design System Integration
document_id: PD-001
authority: product-design
category: product-design
version: 1.0
last_reviewed: 2026-07-06
status: active
governed_by:
  - PRODUCT_EXPERIENCE.md
  - FIELD_OS_MVP_ARCHITECTURE.md
  - DESIGN_REVIEW_PROTOCOL.md
references:
  - ../../design-system-documentation.md
  - ../../_ds/
supersedes: null
superseded_by: null
---

# DESIGN_SYSTEM_INTEGRATION — SdP Field OS

## How to reuse the existing design system — v1.0

---

## 0. Nature and scope

This document governs how every artifact in `20_product_design/` uses the **existing** Setas de la Peña design system. Its objective is a single word: **consistency**. It does not define, extend, or improve the design language. It requires that the design language already established for the brand and the Recipe Simulator be reused faithfully so that Field OS feels like part of one coherent whole, not a second product.

The design system is a **reused input**, not an output of this folder.

---

## 1. Principle: reuse, do not redesign

The visual and interaction language already exists (see `design-system-documentation.md`: Paper/Ink/Moss token palette, type scale, spacing, component patterns, editorial voice). It is treated here the same way the architecture is treated: as an approved foundation. Designers reuse it; they do not reopen it. Consistency is what lets a gloved, time-pressed operator move without relearning — predictability is a form of respect (`PRODUCT_EXPERIENCE.md` §1).

---

## 2. What to reuse, unchanged

- **Typography.** Reuse the existing type families and scale. No new fonts, no new sizes outside the scale.
- **Color.** Reuse the existing Paper (surface), Ink (text/stroke), and Moss (accent) tokens and their assigned roles. Success/emphasis states come from the tokens already defined.
- **Spacing.** Reuse the existing spacing scale. Layout rhythm follows the established steps, not ad-hoc values.
- **Interaction patterns.** Reuse the established patterns for capture, confirmation, and navigation. The same action must always feel the same.
- **Editorial language.** Reuse the established voice — technical, calm, agronomic. Never mystical, never hippie, never marketing-loud. Copy is part of the design system and is held to it.

---

## 3. When a new component is allowed

New components are a last resort, permitted only when **all** of the following hold:

1. No existing component or composition of existing components can serve the interaction.
2. The need is driven by an approved workflow or experience requirement, not by preference.
3. The new component is built from existing tokens (type, color, spacing) — it introduces a new *pattern*, never a new *language*.
4. The addition is logged in `DESIGN_DECISIONS/` with its justification and, once stable, proposed back to the design system for adoption.

A new component that could have been an existing one is a defect, not a feature.

---

## 4. Consistency with the Recipe Simulator

Field OS and the Recipe & Formulation Engine must feel like one family. Where the Simulator has already established a pattern for an equivalent moment (a value display, a confirmation, a state indicator), Field OS reuses that pattern rather than inventing a parallel one. This folder does not redesign the Simulator; it aligns to it.

---

## Purpose / Inputs / Outputs / Dependencies / Role / Architecture relationship

- **Purpose.** Guarantee visual and interaction consistency by mandating reuse of the existing design system.
- **Inputs.** `design-system-documentation.md`, the `_ds/` design-system export, `PRODUCT_EXPERIENCE.md`, established Recipe Simulator patterns.
- **Outputs.** Binding reuse rules; the criteria and log-path for any strictly necessary new component.
- **Dependencies.** The existing design system; `PRODUCT_EXPERIENCE.md`; `DESIGN_REVIEW_PROTOCOL.md` (reviews check reuse).
- **Responsible role.** Product Designer (applies rules); Design Reviewer (enforces at review).
- **Relationship with the approved architecture.** Downstream and subordinate. Reusing the design system is how the *felt form* required by the architecture is delivered without introducing a competing visual language. It never alters architecture or the design system itself.
