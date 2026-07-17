---
title: Cross-Reference Standard
document_id: XREF-001
version: 1.0
status: canonical
authority: editorial
load_priority: on_request
owner: Setas de la Peña
last_reviewed: 2026-07-09
---

# Cross-Reference Standard

## 1. Purpose

This document formalizes a rule already stated briefly in `EDITORIAL_GUIDELINES.md` §5.4 ("Preference for References") but never fully specified: **every concept has exactly one canonical home, and every other document that touches that concept references it rather than repeating it.**

This is not a new principle. It is the existing principle, made operational: a determination procedure for *which* document is canonical when more than one plausibly could be, a formal reference syntax, and a rule for keeping machine-readable relationships (`INDEX.yaml`) synchronized with the in-body citations that already exist across the repository.

`EDITORIAL_GUIDELINES.md` §5.4 remains the governing editorial principle. This document is its implementation detail, not a replacement — see §5.4 for the principle, this document for the mechanics.

---

## 2. Determining the Canonical Home

When the same concept appears to be defined, or definable, in more than one document, the canonical home is the document that ranks **highest in CANON §14.1's Normative Authority order** among the candidates. This reuses the ranking that already exists — it does not create a second one.

Two clarifying rules:

- **Specificity beats generality within the same tier.** If two documents in the same CANON §14.1 tier both plausibly cover a concept (e.g., a species profile and a substrate document both touch on field capacity), the more specific document — the one whose defined scope in `EDITORIAL_GUIDELINES.md` §7 (Document Responsibilities) most closely matches the concept — is canonical. A parameter that is fundamentally about substrate composition belongs in `02_substrates/`, even if a species document also mentions it in passing.
- **A tie at the same tier and same specificity is a documentation inconsistency**, not a cross-reference question — resolve it through the decision process (CANON §16), the same as any same-tier conflict under §14.1.

**Worked example from this repository:** Fresh Air Exchange (FAE) parameters for *P. djamor* appear in `01_species/pleurotus_djamor.md`, `05_equipment/environmental_control.md`, `06_operations/quality_control.md`, and `metadata/kpis.yaml`. The canonical home is `01_species/pleurotus_djamor.md` — it is the species profile, and FAE tolerance is a biological parameter of the species (CANON §10: "stable knowledge... stored in species files"). `environmental_control.md` should implement the parameter (how to achieve it), `quality_control.md` should reference it as an acceptance threshold, and `kpis.yaml` should carry it as structured data — none of the three should restate the underlying biological rationale.

---

## 3. Reference Syntax

Two forms are permitted, matching `EDITORIAL_GUIDELINES.md` §5.4 exactly — this document does not introduce a third:

- **Inline document reference:** `` See `02_substrates/substrate_library.md` `` — a plain-text pointer using the exact filename, in backticks, optionally with a section number (`` see CANON §14 ``, `` `06_operations/quality_control.md` §Acceptance Thresholds ``). This is the form already used throughout the repository (CANON §14.3, `AI_AGENT_PROTOCOL.md` §6, `SYSTEM_MAP.md`) and is the **preferred** form going forward, because it survives a plain-text or non-wiki-aware reader.
- **Wiki-style reference:** `[[document_name]]` — reserved for future tooling that can resolve it (e.g., a rendered documentation site). Not currently used anywhere in this repository; do not introduce it without first confirming a renderer exists that resolves it, since an unresolved `[[...]]` reference is worse than a plain-text one — it looks like a broken feature rather than a plain sentence.

A reference must always name the **file**, not just a concept ("see the substrate library" is insufficient; "see `02_substrates/substrate_library.md`" is required). This is what makes a reference machine-verifiable and what allows `INDEX.yaml`'s `related_documents`/`depends_on` fields to be checked against the prose that generated them.

---

## 4. Relationship Between In-Body References and `INDEX.yaml`

Once `INDEX.yaml` is populated beyond the schema-and-examples stage delivered in Phase 2, the following rule applies:

- Every in-body reference of the form described in §3 above **should** have a corresponding entry in the referencing document's `INDEX.yaml` `related_documents` (symmetric) or `depends_on` (asymmetric — this document's claims depend on the referenced one) field.
- The reverse is not required: `INDEX.yaml` may carry relationships (e.g., `implemented_by`, `supersedes`) that have no natural in-body prose form. `INDEX.yaml` is permitted to know more structure than the prose states explicitly.
- `INDEX.yaml` is a **mirror**, never a source. If an in-body reference and an `INDEX.yaml` entry disagree about a relationship, the in-body reference governs, and `INDEX.yaml` is corrected — the same non-authority discipline that governs `SYSTEM_MAP.md` (§0 of that document) applies here to relationship data specifically.

This rule is prescriptive for future population work; it does not retroactively require auditing the ~70 existing documents now. That audit is future work (see `ROADMAP.md`, "Full `INDEX.yaml` population").

---

## 5. Checklist Before Adding a Cross-Reference

For a human editor or an AI agent in Documentation Edit Mode, before adding or modifying a cross-reference:

```
☐ Does the referenced concept already have a canonical home per §2 above?
☐ Am I citing the file by name (§3), not just describing it in prose?
☐ If I am defining the concept here for the first time, does a higher-tier
  document (CANON §14.1) already claim it? If so, this is not a new
  canonical home — reference the existing one instead.
☐ If this document and another at the same tier both define the concept,
  has that been flagged as a documentation inconsistency (§2) rather than
  silently resolved by picking one?
☐ Am I duplicating content that the canonical home already states, rather
  than referencing it? (EDITORIAL_GUIDELINES §5.4 — the principle this
  document implements.)
```

---

## 6. What This Standard Does Not Do

- It does not require rewriting any existing document. No file is touched by the introduction of this standard beyond the single pointer added to `EDITORIAL_GUIDELINES.md` §5.4.
- It does not introduce a new precedence order — §2 above reuses CANON §14.1 exactly as written.
- It does not mandate immediate `INDEX.yaml` population — §4 is prescriptive for future work, not a retroactive audit requirement.
- It does not apply to Operational State documents (`CURRENT_OPERATIONS.md`, `FARM_BRAIN.md`, batch records) in the same way — those describe current reality and may reference canonical documents, but are not themselves eligible to be a concept's "canonical home," per CANON §14.2 and §14.3.

---

*This document is reviewed only when the reference syntax or determination procedure itself needs to change — it is a standard, not living content. See `EDITORIAL_GUIDELINES.md` §5.4 for the governing principle.*
