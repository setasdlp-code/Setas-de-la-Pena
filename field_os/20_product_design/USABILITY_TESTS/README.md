---
title: SdP Field OS — Usability Tests
document_id: PD-015
authority: product-design
category: product-design
version: 1.0
last_reviewed: 2026-07-06
status: active
governed_by:
  - PRODUCT_EXPERIENCE.md
  - USER_WORKFLOWS.md
supersedes: null
superseded_by: null
---

# USABILITY_TESTS

## What lives here

**Usability tests** — plans, sessions, and findings that put prototypes in front of realistic use. Tests prove the design meets the experience standard: capture is lighter than the note-taking it replaces (US-2), traceability is preserved (INV-3), and the tool stays calm and predictable under a real, gloved, time-pressed operator.

- **Purpose.** Produce evidence that a design lowers friction, preserves traceability, and respects attention — before implementation.
- **Inputs.** `PROTOTYPES/`; `PRODUCT_EXPERIENCE.md` (the standards to test against); representative operator tasks from `USER_WORKFLOWS.md`.
- **Outputs.** Test plans and findings with pass/fail against experience criteria; findings feed `DESIGN_DECISIONS/` and may return an artifact to an earlier stage.
- **Dependencies.** A prototype to test; defined success criteria drawn from the experience document.
- **Responsible role.** Product Designer (with operator participants).
- **Relationship with the approved architecture.** Downstream. Tests validate the *experience* of approved behavior. A test can reveal an architectural problem; that finding is escalated to governance and logged as an open issue — never resolved by editing an immutable document.
