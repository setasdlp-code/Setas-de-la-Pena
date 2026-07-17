---
title: System Map
document_id: SYSMAP-001
version: 1.0
status: canonical
authority: navigation
load_priority: on_request
owner: Setas de la Peña
last_reviewed: 2026-07-09
---

# System Map

## 0. What This Document Is — and Is Not

This document is a single-page architectural drawing of the Setas de la Peña repository. It exists so a human or an AI agent can see the whole system — folders, document categories, authority model, and the four flows — in one place, at a glance.

**This document carries no independent authority and states no rule of its own.** Every substantive claim below is a pointer to, or a visual summary of, one of three authoritative sources:

- `SETAS_DE_LA_PENA_CANON.md` — authority model (§14)
- `00_project/SYSTEM_FLOW.md` — knowledge, decision, evidence, and operational flows
- `00_project/REPOSITORY_MAP.md` — folder hierarchy, document categories, navigation

If anything in this document ever appears to conflict with one of those three, **the source document governs, and this document is in error and must be corrected to match it.** This is a deliberate design constraint, not an oversight: Phase 1 of this repository's governance work (DEC-008, DEC-009) existed specifically to eliminate documents that independently restated authority or structure and drifted apart from each other. This document must not reintroduce that failure mode. For that reason, `SYSTEM_MAP.md` is **not** registered in CANON §14.1's Normative Authority list — it has nothing to contribute to a conflict, because it makes no claim that isn't already made, and ranked, elsewhere. A discrepancy here is a bug report against this file, not a precedence question.

Because of this, `SYSTEM_MAP.md` requires no independent maintenance discipline beyond one rule: **whenever `REPOSITORY_MAP.md`, `SYSTEM_FLOW.md`, or CANON §14 change structurally, this document must be checked for drift.**

---

## 1. Folder Hierarchy

*Source: `REPOSITORY_MAP.md` §2. Reproduced here for at-a-glance orientation; `REPOSITORY_MAP.md` is authoritative for navigation detail.*

```
knowledge_base/
├── SETAS_DE_LA_PENA_CANON.md      ← governing principles (CANON §14: precedence)
├── README_MCP.md                   ← LLM loading-priority rules
├── FARM_BRAIN.md                   ← operational snapshot (Operational State)
├── CURRENT_OPERATIONS.md           ← granular field state (Operational State)
├── DECISIONS.md                    ← decision log (DEC-001 … DEC-010)
├── LESSONS_LEARNED.md              ← validated field lessons
├── CHANGELOG.md                    ← chronological change log
├── INDEX.yaml                      ← machine-readable document catalog (schema-stage)
│
├── 00_project/        Architectural & governance documents
│   ├── SYSTEM_MAP.md          ← this document
│   ├── ROADMAP.md             ← trajectory, maturity, technical debt
│   ├── CROSS_REFERENCE_STANDARD.md
│   ├── REPOSITORY_MAP.md, AI_AGENT_PROTOCOL.md, EDITORIAL_GUIDELINES.md,
│   │   SYSTEM_FLOW.md, KNOWLEDGE_ARCHITECTURE.md, IDENTIFIER_STANDARD.md,
│   │   ARCHITECTURE_STATUS.md
│   └── mission.md, principles.md, current_state.md, glossary.md
├── 01_species/         Species knowledge (Canonical Knowledge)
├── 02_substrates/      Substrate formulations (Canonical Knowledge)
├── 03_spawn/           Spawn production, laboratory roadmap (Canonical Knowledge)
├── 04_facility/        Physical infrastructure, laboratory (Canonical Knowledge)
├── 05_equipment/       Equipment, sensors, automation (Canonical Knowledge)
├── 06_operations/      Production SOPs, review templates (SOPs and Workflows)
├── 07_business/        Commercial and financial records (Business and Brand)
├── 08_brand/           Brand identity and communication (Business and Brand)
├── 09_research/        Scientific evidence and literature (Research Library)
├── 10_ai_workflows/    Reusable human–AI workflow library (SOPs and Workflows)
├── metadata/           Structured data (species, substrates, equipment, KPIs)
└── references/         Bibliography (Research Library)
```

`/README.md`, at the true repository root, orients new arrivals and points into this tree — see §5 below.

---

## 2. Document Categories

*Source: `REPOSITORY_MAP.md` §4 (categories, stability class) and CANON §14.1/§14.2 (authority tier). This table exists so a reader doesn't have to cross-reference both documents separately.*

| Folder / Document | Category | Stability | Normative Authority Tier (CANON §14.1) |
|---|---|---|---|
| `SETAS_DE_LA_PENA_CANON.md` | Architectural | Canonical | 1 — CANON |
| `EDITORIAL_GUIDELINES.md`, `SYSTEM_FLOW.md`, `AI_AGENT_PROTOCOL.md`, `KNOWLEDGE_ARCHITECTURE.md`, `IDENTIFIER_STANDARD.md`, `REPOSITORY_MAP.md`, `README_MCP.md` | Governance | Canonical | 2 — Governance Standards |
| `DECISIONS.md` | Meta | Living | 3 — Decisions |
| `01_species/`, `02_substrates/`, `03_spawn/`, `04_facility/`, `05_equipment/` | Knowledge Domain | Stable | 4 — Canonical Knowledge |
| `06_operations/`, `10_ai_workflows/` | Operational / Workflow | Stable | 5 — SOPs and Workflows |
| `LESSONS_LEARNED.md`, `CHANGELOG.md` | Meta | Living / Selective | 6 — Lessons and Historical Records |
| `09_research/`, `references/` | Research | Stable | 7 — Research Library |
| `07_business/`, `08_brand/` | Operational / Reference | Stable | 8 — Business and Brand |
| — | — | — | 9 — Archive / deprecated |
| `CURRENT_OPERATIONS.md`, `FARM_BRAIN.md`, batch records, daily reviews, sensor exports | Meta / Operational | Living | Operational State (CANON §14.2 — a separate axis, not ranked against Normative Authority) |

---

## 3. Authority Model

*Source: CANON §14 in full. This is a visual summary only — see CANON §14.1–14.3 for the authoritative text, including the rule that Operational State never overrides Normative Authority regardless of recency.*

```
NORMATIVE AUTHORITY (§14.1)              OPERATIONAL STATE (§14.2)
  — which document wins a conflict —       — what is happening now —

  1. CANON                                 1. CURRENT_OPERATIONS.md
  2. Governance Standards (7 docs)          2. FARM_BRAIN.md
  3. DECISIONS.md                          3. Batch records
  4. Canonical Knowledge                   4. Daily reviews
  5. SOPs and Workflows                    5. Sensor exports
  6. Lessons and Historical Records
  7. Research Library                       Never overrides Normative
  8. Business and Brand                     Authority, however recent.
  9. Archive / deprecated                   (§14.3)
```

Conflicts between documents at different tiers are resolved by the higher tier. Conflicts at the same tier are flagged as a documentation inconsistency and resolved through the decision process (CANON §16) — not silently, and not by list order.

---

## 4. Knowledge, Decision, Evidence, and Operational Flows

*Source: `SYSTEM_FLOW.md` §4–8. Each flow below is a compressed pointer, not a restatement — consult `SYSTEM_FLOW.md` for the full description, stage definitions, and cross-references to authoritative SOPs.*

**Knowledge Flow** (`SYSTEM_FLOW.md` §6):
```
Observation → Documentation → Experiment → Validation
  → Lessons Learned → Decision → SOP Update → Knowledge Base → Improved Production
```

**Decision Flow** (`SYSTEM_FLOW.md` §8, CANON §16):
```
Observation → Problem Definition → Evidence Collection → Alternative Evaluation
  → Decision → Implementation → Measurement → Review → Documentation (DECISIONS.md)
```

**Evidence / Information Flow** (`SYSTEM_FLOW.md` §7):
```
Sensors, Operators, Laboratory → Batch Tracking → Quality Control
  → Current Operations → Lessons Learned → Knowledge Base → Business Metrics
```

**Operational Flow** (`SYSTEM_FLOW.md` §5):
```
Planning → Procurement → Substrate Prep → Sterilization/Pasteurization → Inoculation
  → Incubation → Fruiting → Harvest → Quality Control → Packaging → Storage → Distribution
```

The **Biological Flow** (`SYSTEM_FLOW.md` §4) and **Traceability Architecture** (`SYSTEM_FLOW.md` §9) are omitted here for brevity — they concern the biological/lot-identifier lineage rather than the document architecture this map covers, and are not duplicated in summary form to avoid drift in the identifier chain. See `SYSTEM_FLOW.md` directly.

---

## 5. Relationships Between Major Document Classes

```
CANON (principles)
   │  authorizes / is interpreted by
   ▼
Governance Standards (structure, editorial rules, agent behavior, identifiers, navigation)
   │  authorizes / recorded in
   ▼
DECISIONS.md (why a choice was made — DEC-001 … DEC-010)
   │  implemented as
   ▼
Canonical Knowledge (species, substrates, spawn, facility, equipment)
   │  executed via
   ▼
SOPs and Workflows (06_operations/, 10_ai_workflows/)
   │  generates
   ▼
Lessons and Historical Records (LESSONS_LEARNED.md, CHANGELOG.md)
   │  validated against
   ▼
Research Library (09_research/, references/)

Business and Brand draw on Canonical Knowledge and Decisions but do not feed back
into them directly — see CANON §14.1 tier 8 and SYSTEM_FLOW.md §3 (Business System).

Operational State (FARM_BRAIN.md, CURRENT_OPERATIONS.md, batch records, daily reviews,
sensor exports) runs alongside every tier above as a separate axis (CANON §14.2) —
it reports current reality and feeds the Knowledge Flow (§4 above) as raw observation,
but never substitutes for Normative Authority.
```

`/README.md` and `INDEX.yaml` are the two Phase 2 additions that sit outside this chain: `/README.md` is a pure entry point (orients toward this map and `REPOSITORY_MAP.md`), and `INDEX.yaml` is a machine-readable mirror of the categories and relationships already described in §2 and §5 above — see `INDEX.yaml`'s own header comment for the same non-authority disclaimer that governs this document.

---

*This document is canonical in the sense of being the repository's designated single-page synthesis — it is not canonical in the CANON §14.1 sense of holding independent normative authority. It is reviewed whenever `REPOSITORY_MAP.md`, `SYSTEM_FLOW.md`, or CANON §14 change.*
