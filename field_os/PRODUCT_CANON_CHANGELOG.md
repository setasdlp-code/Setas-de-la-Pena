---
title: SdP Field OS — Product Canon Governance Change Log
document_id: PCANON-CL-001
authority: product-foundation
category: product-architecture
status: living
tracks: PRODUCT_CANON.md
---

# PRODUCT_CANON — Governance Change Log

This log records every governance modification to `PRODUCT_CANON.md`. It is not a rewrite record; it explains *what changed*, *why*, and *which governance artifact supports the change*. No entry introduces a new architectural decision, a new assumption, or implementation.

---

## v1.0 → v1.1 — Governance audit and refinement (2026-07-05)

The change was a governance audit, not a rewrite. Unchanged sections (§3 Scope, principles PC-01…PC-10, §6 What is not canon) were preserved. Every modification is derivable from an Accepted ADR, PRODUCT_ASSUMPTIONS.md, or existing repository governance.

### 1. Document hierarchy corrected (§1, §5) — Review Area 1

**What changed.** §5 was retitled *Document hierarchy and relationship to ADRs and Assumptions* and rewritten. v1.0 listed a precedence order that placed PRODUCT_CANON **above** the ADRs. v1.1 replaces this with the intended governance flow — Repository Governance → Accepted ADRs → Validated Product Assumptions → PRODUCT_CANON → Product Architecture → Implementation — and states explicitly that the Canon does **not** supersede the ADRs, that ADRs remain the authoritative record of architectural decisions, and that **an apparent contradiction triggers review of the relevant ADR first**, never an edit of the Canon to disagree with a standing ADR. §1's precedence sentence was clarified to say the Canon takes precedence only over documents *downstream* of it (product architecture, implementation), never over the ADRs or repository governance above it.

**Why.** v1.0's numbered precedence inverted the governance flow and contradicted the Canon's own §2 statement that it "depends on" the ADRs. The inversion would have let a derived document override its own source.

**Supporting artifact.** ADR-0001/0002/0003 (each is the "authoritative record" of its decision, per its own structure); repository authority-order convention (ADRs are accepted decisions, canon expresses derived principles).

### 2. New principle PC-11 — Historical traceability (§4) — Review Area 2

**What changed.** Added PC-11: "Operational history is cumulative; state never replaces it." Every persistent operational object stays historically traceable; Field OS preserves accumulated history, not only current state; events are appended, never overwritten; current state is derived from history. Existing principles were **not** renumbered (stable identifiers preserved).

**Why.** The principle was already implicit across governance and met the "only if fully supported" bar, so it was elevated to an explicit principle.

**Supporting artifact.** ADR-0001 (operational events, states, and **history entries** anchor to the container; biological/operational/knowledge traceability attach to the same object); ADR-0002 (v1 core is a **write-optimized event log** — append-only history, not mutable state); repository CANON §6 (production "fully traceable"; lot records maintained "from substrate preparation through final sale or disposal"; "failure documentation is as operationally valuable as production documentation"); principles.md #4 ("Sin trazabilidad, no hay aprendizaje ni control de calidad"); CANON P-04.

### 3. New principle PC-12 — Operator authority (§4) — Review Area 3

**What changed.** Added PC-12: "The operator remains the primary decision-maker." Field OS supports judgment, never replaces professional responsibility; automation exists to reduce friction and improve traceability, never to obscure accountability; the operator interprets, the system records and (where permitted) executes.

**Why.** Repository governance already carries an explicit human-centered principle; the task's condition ("only include if derivable from existing governance") is met.

**Supporting artifact.** Repository CANON §7 ("Automation … does not replace operational judgment"; "The operator interprets; the automation executes"; "Human observation remains the primary diagnostic tool"); principles.md #3 ("Automatización como Redundancia, no como Reemplazo"; "El cuidador puede intervenir manualmente en cualquier momento"); ADR-0002 (no decision logic in v1; read/query "in service of human review rather than automation"); ADR-0003 (Field OS never issues hardware commands).

### 4. Canonical-scope verification (§8 preamble) — Review Area 5

**What changed.** Added a statement that every principle is derived from an Accepted ADR, supported by repository governance, or both — and that **no principle depends exclusively on a `Proposed` assumption**.

**Why.** To make the scope guarantee auditable on the face of the document.

**Verification result.** PC-01…PC-08 derive from Accepted ADRs. PC-09/PC-10 derive from the assumption-governance *discipline* (the lifecycle method), not from any single assumption's unvalidated content — permissible, since the discipline is itself established governance. PC-11/PC-12 are each supported by an Accepted ADR **and** repository governance. **No principle rests on a `Proposed` assumption.** Pass.

### 5. Amendment policy expanded (§7) — Review Area 7

**What changed.** §7 now specifies: **who may propose** (any operator/maintainer/AI collaborator; adoption reserved to the product-foundation owner); **what evidence is required** (a superseding/amended ADR, a `Validated` assumption, or revised repository governance — evidence on a `Proposed`/`Observed` assumption is insufficient by PC-09/PC-10); **which artifacts are reviewed first and in order** (1 repository governance → 2 grounding ADR → 3 PRODUCT_ASSUMPTIONS); and **conditions per principle**, with new trigger clauses added for PC-11 and PC-12.

**Why.** v1.0 stated triggers but not the procedure, proposer, or evidentiary bar. Review Area 7 asked for all four.

**Supporting artifact.** PRODUCT_ASSUMPTIONS lifecycle (only `Validated` informs canon); repository CANON §16 (decision process — evidence, alternatives, documentation; reversals need the same rigor as the original decision); CANON §21 (revision only when governing principles change).

### 6. Traceability matrix expanded (§8) — Review Area 6

**What changed.** The matrix now carries three columns per principle — **Supporting ADR(s)**, **Supporting repository governance**, **Dependent future documents** (`PRODUCT_ARCHITECTURE`, `DATA_MODEL`, `MODULE_MAP`, `ROADMAP`) — and adds rows for PC-11 and PC-12. The dependent-documents column is explicitly documentation only.

**Why.** Review Area 6 requested the expansion, to make each principle's upstream support and downstream reach traceable.

**Supporting artifact.** The ADRs and repository governance cited in each row.

### 7. Sources and metadata (frontmatter, §2, footer)

**What changed.** `version` → 1.1, `supersedes` → "1.0"; repository governance added to `sources`. §2 now lists repository governance as a permitted derivation source. Footer updated.

**Why.** PC-11/PC-12 derive in part from repository governance; the task authorizes "Existing repository governance" as a source. Metadata must reflect it.

**Supporting artifact.** Task derivation scope; repository CANON and principles.md.

---

## Terminology recommendation — "Substrate Simulator" (Review Area 4)

Provided as a recommendation only. **No rename was performed.** PC-07 continues to use "substrate simulator," matching ADR-0003's exact term; the term cannot be changed in the Canon without first amending ADR-0003, which fixes it.

- **Current term:** *Substrate Simulator* ("simulador de sustrato"; file `simulador_sustrato_v4.0.html`).
- **Recommended term:** *Recipe & Formulation Engine* (or *Recipe Simulator* / "Simulador de Recetas").
- **Reason.** ADR-0003 itself defines the system's function as "recipe and formulation logic," and the repository already uses "Simulador de Recetas" (`recipe-recommender.js`, `PLAN_MAESTRO_Prototipos_Simulador.md`). The tool computes multi-species recipes and formulations, not only substrate; "Substrate Simulator" understates its scope and a split term ("substrate" vs. "recipe") already exists in the repository, creating an inconsistency.
- **Repository impact.** A rename touches: **ADR-0003** (fixes the term — a change requires ADR amendment, not a unilateral edit); `PRODUCT_CANON.md` PC-07 and matrix; file names (`simulador_sustrato_*.html`); `PLAN_MAESTRO_Prototipos_Simulador.md` and related plan docs; and knowledge-base references. Because it originates in an Accepted ADR, treat this as an **ADR-0003 amendment proposal**, evaluated under §7, before any term is changed anywhere.

---

*Change log maintained alongside PRODUCT_CANON.md. Each future amendment appends a dated entry above.*
