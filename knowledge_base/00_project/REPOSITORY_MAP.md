---
title: Repository Map
document_id: DOC-0003
version: 1.2
status: canonical
authority: navigation
load_priority: always
owner: Setas de la Peña
last_reviewed: 2026-07-16
---

# Repository Map

## 1. Purpose

This document is the canonical navigation index for the Setas de la Peña knowledge system. It points to authoritative locations and contains no domain knowledge of its own.

---

## 2. Actual Knowledge Base Layout

```text
knowledge_base/
├── SETAS_DE_LA_PENA_CANON.md    Foundational principles
├── CURRENT_OPERATIONS.md        Verified current state and blockers
├── DECISIONS.md                 Accepted decisions and rationale
├── LESSONS_LEARNED.md           Validated learning from evidence
├── CHANGELOG.md                 Knowledge-base change history
├── FARM_BRAIN.md                Compact operational context
├── README_MCP.md                Retrieval guide for the MCP layer
├── 00_project/                  Architecture and governance
├── 01_species/                  Species knowledge
├── 02_substrates/               Substrates and processing
├── 03_spawn/                    Culture and spawn roadmap
├── 04_facility/                 Facility and workflow design
├── 05_equipment/                Equipment and environmental control
├── 06_operations/               SOPs, quality, scheduling, and tracking
├── 07_business/                 Market, pricing, economics, suppliers
├── 08_brand/                    Identity, illustration, packaging
├── 09_research/                 Literature catalogue and synthesis
├── 10_ai_workflows/             Reusable assisted-work templates
├── metadata/                    Structured equipment, KPI, species, substrate data
└── references/                  Bibliography
```

Raw operational evidence belongs in a future root-level `operations/` store, as defined by `KNOWLEDGE_ARCHITECTURE.md`. That store has not been instantiated because the repository does not yet contain a real production cycle.

---

## 3. Authority Map

| Question | Authoritative location |
|---|---|
| What is the project and what is non-negotiable? | `../SETAS_DE_LA_PENA_CANON.md` |
| What is happening now? | `../CURRENT_OPERATIONS.md` |
| What decisions have been accepted? | `../DECISIONS.md` |
| What has been learned from evidence? | `../LESSONS_LEARNED.md` |
| How is knowledge separated from raw evidence? | `KNOWLEDGE_ARCHITECTURE.md` |
| What is the verified maturity state? | `ARCHITECTURE_STATUS.md` |
| How should documents be written and governed? | `EDITORIAL_GUIDELINES.md` |
| How should an AI agent behave? | `AI_AGENT_PROTOCOL.md` |
| How are objects identified and traced? | `IDENTIFIER_STANDARD.md` |
| How does information move through the system? | `SYSTEM_FLOW.md` |
| What species and cultivation ranges are documented? | `../01_species/` |
| What substrates and treatments are documented? | `../02_substrates/` |
| How are culture and spawn handled? | `../03_spawn/` |
| What facility design is planned? | `../04_facility/` |
| What equipment and controls are defined? | `../05_equipment/` |
| What production procedures exist? | `../06_operations/` |
| What business assumptions exist? | `../07_business/` |
| What brand rules apply? | `../08_brand/` |
| What scientific evidence supports a claim? | `../09_research/` and `../references/bibliography.md` |

---

## 4. Stability Classes

| Class | Meaning | Expected change rate |
|---|---|---|
| Canonical | Principles, architecture, governance, and standards | Rare, formally reviewed |
| Stable | Curated domain knowledge supported by evidence | Occasional |
| Living | Current state, decisions, lessons, and workflow templates | As work changes |
| Operational evidence | Raw records of what occurred | Continuous once operations begin |

An external source can inform stable knowledge but does not prove local performance. Local observations must enter the operational evidence store before they can mature into lessons, decisions, or SOP changes.

---

## 5. Retrieval Paths

### Starting current work

```text
CURRENT_OPERATIONS.md
  └── relevant procedure in 06_operations/
      └── relevant equipment or species document
          └── source or decision when the claim needs verification
```

### Investigating contamination

```text
06_operations/quality_control.md
  ├── 02_substrates/contamination.md
  ├── 03_spawn/
  ├── LESSONS_LEARNED.md
  └── 09_research/
```

### Planning environmental control

```text
CURRENT_OPERATIONS.md
  ├── 05_equipment/environmental_control.md
  ├── 04_facility/
  ├── metadata/equipment.yaml
  └── DECISIONS.md
```

### Creating a new operational record

```text
IDENTIFIER_STANDARD.md
  └── 06_operations/batch_tracking.md
      └── future operations/ record
          └── daily review and later validation
```

---

## 6. Entry Points

### Human collaborator

1. `REPOSITORY_MAP.md`
2. `../SETAS_DE_LA_PENA_CANON.md`
3. `../CURRENT_OPERATIONS.md`
4. `ARCHITECTURE_STATUS.md`
5. Task-relevant domain documents

### AI agent

1. `AI_AGENT_PROTOCOL.md`
2. `REPOSITORY_MAP.md`
3. `../SETAS_DE_LA_PENA_CANON.md`
4. `../CURRENT_OPERATIONS.md`
5. `IDENTIFIER_STANDARD.md`
6. Task-relevant documents and their cited evidence

---

## 7. Repository Health Rules

- Navigation references must resolve to real committed paths.
- A topic must have one authoritative location; derivative summaries must point back to it.
- Provisional and field-verified values must remain explicitly distinguishable.
- Source PDFs, credentials, captures, generated reports, and raw sensor exports are not part of the Git knowledge base.
- `climate-bench/` remains a separate repository and is excluded here.
- The absence of an operational evidence store must not be represented as operational maturity.
- Update this map whenever committed directories or canonical entry points change.

---

## 8. Closing Principle

Every important question should have one authoritative answer, and every navigation path in this document must point to something that actually exists.
