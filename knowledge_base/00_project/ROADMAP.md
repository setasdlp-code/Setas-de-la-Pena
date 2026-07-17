---
title: Roadmap
document_id: ROADMAP-001
version: 1.0
status: canonical
authority: governance
load_priority: on_request
owner: Setas de la Peña
last_reviewed: 2026-07-09
---

# Roadmap

## Purpose

This document describes the repository's trajectory over time: where it started, what has been completed, what remains structurally unresolved, and what a mature version of this system looks like. It is not a task list, and it is not a restatement of `ARCHITECTURE_STATUS.md`.

**Relationship to `ARCHITECTURE_STATUS.md`:** that document is a point-in-time declaration — the current maturity snapshot and freeze state, updated only when a phase completes. This document is the trajectory *between* those snapshots — the history that produced the current baseline, the debt that baseline still carries, and the direction it is moving in. The two coexist by design, the same way `FARM_BRAIN.md` (snapshot) and `CURRENT_OPERATIONS.md` (detail) coexist elsewhere in this repository. Neither restates the other.

---

## Current Architectural Baseline

As of Phase 2 (2026-07-09), the repository's governing structure is:

- A single, two-axis precedence model — **Normative Authority** and **Operational State** — defined once in `SETAS_DE_LA_PENA_CANON.md` §14, and referenced (never restated) by every other governance document.
- Governance and navigation documents that describe the *actual* filesystem, not an aspirational one (Option B, DEC-008) — the folders `05_laboratory/`, `10_living/`, and a top-level `operations/` tree that earlier governance drafts assumed never existed and are no longer claimed to.
- A decision log (`DECISIONS.md`, DEC-001 through DEC-010) that is the authoritative record of *why* the architecture is shaped the way it is, not just *what* it currently looks like.
- The beginning of an AI-native retrieval layer: `SYSTEM_MAP.md` (architectural synthesis), `/README.md` (human orientation), `INDEX.yaml` (machine-readable catalog, schema-stage), and a retrieval-strategy extension to `AI_AGENT_PROTOCOL.md` — collectively, Phase 2.

This baseline is the product of two prior phases, described below.

---

## Completed Milestones

| Phase | Period | Outcome |
|---|---|---|
| **Phase 0 — Initial Knowledge Base** | 2026-06-29 | Full knowledge base created: CANON, `README_MCP.md`, `FARM_BRAIN.md`, all domain folders (`01_species/` through `09_research/`), metadata YAMLs, bibliography. ~50 documents. |
| **Phase 1 — Governance Reconciliation** | 2026-07-08 – 2026-07-09 | Resolved a two-architecture split (real filesystem vs. an idealized, never-instantiated one), completed a deferred source-registry cleanup (DEC-007), and replaced three independently-drifting precedence statements with the single two-axis model in CANON §14 (DEC-009). Merged as PR #1. |
| **Phase 2 — AI-Native Retrieval Layer** | 2026-07-09 (in progress) | Adds a machine-readable document catalog schema, a cross-reference standard, a single-page architectural synthesis, a human orientation entry point, and an AI retrieval-strategy extension — authorized under `ARCHITECTURE_STATUS.md` Architectural Change Criterion #3 (DEC-010). |

---

## Repository Maturity

`ARCHITECTURE_STATUS.md` holds the current numeric/declared maturity snapshot; it is not reproduced here. What belongs in a roadmap is the *trend*:

- **Architecture:** moved from *internally inconsistent* (two competing folder models) to *reconciled* during Phase 1. Moving from *reconciled* to *machine-readable* during Phase 2.
- **Governance:** moved from *three divergent precedence statements* to *one canonical model with three referencing pointers* during Phase 1 (DEC-009). Stable since; no further change anticipated in Phase 2.
- **AI retrieval capability:** moved from *none* (Markdown-only, human-authored-and-read) to *schema-defined but unpopulated* during Phase 2. Full population is explicitly future work (see below) — a schema is not a capability until it is populated and used.
- **Operational knowledge:** unchanged by Phase 1 or Phase 2 — still growing through cultivation activity, as it always has, and correctly out of scope for architectural work.

---

## Future Phases (Not Yet Authorized)

These are candidates, not commitments. Each would require its own decision record under CANON §16 before implementation, the same way Phase 2 required DEC-010.

- **Full `INDEX.yaml` population** — every canonical document represented as a catalog entry, not just the schema and representative examples Phase 2 delivers. The largest single undertaking on this list, and the one that makes the retrieval layer actually load-bearing rather than illustrative.
- **`operations/` (System 2) instantiation** — the primary-evidence tree `KNOWLEDGE_ARCHITECTURE.md` describes as planned. Deferred, by prior decision (DEC-008's note on System 2), until the first production batch exists to generate evidence for it.
- **`README_MCP.md` reconciliation** — it still contains an informal, untouched precedence-like statement ("orden de autoridad") from before CANON §14's two-axis model existed. Not a broken link, not a blocking contradiction, but a loose thread the Phase 1 review flagged and Phase 2 did not touch, since it was outside both phases' authorized scope.
- **Identifier convention reconciliation** — `DECISIONS.md` entries use a 3-digit `DEC-NNN` format in practice; `IDENTIFIER_STANDARD.md` specifies 4-digit, zero-padded identifiers. Batch lot IDs (`2026-07-DJ-001`) encode date and species directly, which `IDENTIFIER_STANDARD.md` §11.4 explicitly prohibits for registered prefixes. Both are long-standing, pre-Phase-1 inconsistencies, deliberately left untouched by every phase so far under the explicit constraint "do not change identifier conventions."
- **Governance-layer consolidation** — `KNOWLEDGE_ARCHITECTURE.md`, `SYSTEM_FLOW.md`, and `ARCHITECTURE_STATUS.md` still overlap substantially in how they each describe the knowledge-maturity lifecycle. Flagged in the original Phase 1 audit as future work, not touched since, and not touched by Phase 2 either — `SYSTEM_MAP.md` addresses the *symptom* (a reader needing one page instead of three) without addressing the underlying redundancy.
- **CANON §14.1 tier-membership decoupling** — the Normative Authority list currently hardcodes which files belong to each tier directly inside CANON. At larger scale, adding a single new governance document would require editing CANON just to register it — a churn source CANON's own revision policy (§21) says should not exist. A future decision could move tier *membership* into `REPOSITORY_MAP.md` while keeping the tier *rule* in CANON §14 — mirroring how `IDENTIFIER_STANDARD.md` separates its rule from its prefix registry.

---

## Architectural Vision

The repository's stated purpose (CANON §20) is to be an inseparable pair with the physical farm: a system that "produces consistent, measurable results and can be understood, improved, expanded, or transferred without loss of operational continuity." Phase 0 built that system for human readers. Phase 1 made it internally consistent. Phase 2 begins making it legible to machines without changing what it says.

A mature version of this repository — at the scale of 1,500 documents, 20,000 commits, and multiple concurrent human and AI contributors — is one where:

- An AI agent discovers the canonical document for any topic through `INDEX.yaml` in one lookup, not a repository-wide search.
- Every cross-reference resolves, because the Cross-reference Standard (`CROSS_REFERENCE_STANDARD.md`) is followed at write-time, not audited at read-time.
- CANON changes rarely, because tier membership and other enumerable detail live in documents designed to change more often than CANON itself.
- Decision and change history scale past a single flat file, without losing the traceability that makes `DECISIONS.md` valuable today.
- The Operations/System 2 evidence tree exists and feeds the Knowledge Flow with real production data, closing the loop `SYSTEM_FLOW.md` §6 already describes conceptually.

None of this is being built speculatively ahead of need. Each item above is listed because a specific, named limitation already exists today — not because it might be useful eventually.

---

## Major Technical Debt

| Item | Origin | Status |
|---|---|---|
| `README_MCP.md`'s informal precedence language, unreconciled with CANON §14 | Pre-Phase-1 | Open — flagged, not fixed, out of scope for Phases 1–2 |
| CANON §14.1 hardcoded tier-membership lists (future churn risk) | Phase 1 design | Open — acceptable at current scale, named as a scaling risk |
| Flat, append-only `DECISIONS.md` / `CHANGELOG.md` (merge-conflict and readability risk at scale) | Phase 0 design | Open — acceptable at current scale |
| `KNOWLEDGE_ARCHITECTURE.md` / `SYSTEM_FLOW.md` / `ARCHITECTURE_STATUS.md` content overlap | Phase 0 design | Open — `SYSTEM_MAP.md` mitigates the symptom, not the cause |
| `operations/` (System 2) not yet instantiated | Phase 0 design, confirmed in Phase 1 (DEC-008) | Open by design — correctly deferred to first production batch |
| `DEC-NNN` 3-digit format vs. `IDENTIFIER_STANDARD.md`'s 4-digit specification | Phase 0 design | Open — explicitly out of scope per constraint in every phase so far |
| Batch lot ID scheme (`YYYY-MM-SP-NNN`) encodes date/species, contrary to `IDENTIFIER_STANDARD.md` §11.4 | Phase 0 design | Open — same constraint as above |
| `INDEX.yaml` is schema-only; not yet load-bearing for any real AI retrieval | Phase 2 design (intentional) | Open by design — full population is explicitly future work, not a defect |

---

## Success Criteria

Beyond `ARCHITECTURE_STATUS.md`'s existing criteria (traceability, reduced repeated mistakes, decision quality, consistency without frequent intervention), Phase 2 specifically is measured by:

- Whether an AI agent, given a query, can name the correct canonical document via `INDEX.yaml` before falling back to a full-repository search.
- Whether new cross-references added after Phase 2 follow the Cross-reference Standard without requiring correction.
- Whether `SYSTEM_MAP.md` stays synchronized with `REPOSITORY_MAP.md`/`SYSTEM_FLOW.md`/CANON §14 — a drift here is the clearest possible signal that this phase's design constraint (no independent authority) has been violated.

As with every prior phase: document count is not a success metric. A retrieval layer that exists but is never used by an agent would be a failed Phase 2, regardless of how complete it looks.

---

*This document is reviewed at phase boundaries — when a phase completes, or when a new phase is proposed and requires a decision record under CANON §16.*
