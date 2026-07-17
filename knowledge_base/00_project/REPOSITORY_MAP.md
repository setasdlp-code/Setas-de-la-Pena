---
title: Repository Map
document_id: MAP-001
version: 1.1
status: canonical
authority: navigation
load_priority: always
owner: Setas de la Peña
---

# Repository Map

## 1. Purpose

This document is the navigation index for the Setas de la Peña Knowledge System. It identifies where authoritative information lives and defines the reading order for new contributors and AI agents. It contains no knowledge of its own.

---

## 2. Repository Architecture

```
SETAS_DE_LA_PENA_CANON.md          ← Project philosophy and immutable principles
  └─ EDITORIAL_GUIDELINES.md       ← Governance: writing rules, authority levels
       └─ SYSTEM_FLOW.md           ← Architecture: how information moves
            └─ AI_AGENT_PROTOCOL.md ← Agent behavior and constraints
                 └─ IDENTIFIER_STANDARD.md ← ID format and traceability rules
                      └─ REPOSITORY_MAP.md  ← This document (navigation layer)
                           │
                           ├─ 00_project/        Architectural & governance documents
                           ├─ 01_species/         Species knowledge
                           ├─ 02_substrates/      Substrate formulations
                           ├─ 03_spawn/           Spawn production and laboratory roadmap
                           ├─ 04_facility/        Physical infrastructure and laboratory
                           ├─ 05_equipment/       Equipment, sensors, automation
                           ├─ 06_operations/      Production SOPs and review templates
                           ├─ 07_business/        Commercial and financial records
                           ├─ 08_brand/           Brand identity and communication
                           ├─ 09_research/        Scientific evidence and literature
                           └─ 10_ai_workflows/    Reusable human–AI workflow library

     Living documents (CURRENT_OPERATIONS.md, DECISIONS.md, LESSONS_LEARNED.md,
     FARM_BRAIN.md, CHANGELOG.md) and MCP retrieval rules (README_MCP.md) live at
     the knowledge_base/ root, alongside metadata/ and references/.
```

---

## 3. Authority Map

| Question | Authoritative Document |
|---|---|
| What is this project and why does it exist? | `SETAS_DE_LA_PENA_CANON.md` |
| What are the writing and governance rules? | `EDITORIAL_GUIDELINES.md` |
| How is the repository structured? | `SYSTEM_FLOW.md` |
| How should an AI agent behave here? | `AI_AGENT_PROTOCOL.md` |
| How are objects identified and traced? | `IDENTIFIER_STANDARD.md` |
| Where is everything located? | `REPOSITORY_MAP.md` (this document) |
| What is happening today? | `CURRENT_OPERATIONS.md` (knowledge_base root) |
| What decisions have been made? | `DECISIONS.md` (knowledge_base root) |
| What has been learned from failures or experiments? | `LESSONS_LEARNED.md` (knowledge_base root) |
| What species do we cultivate? | `01_species/` |
| What substrate formulations are approved? | `02_substrates/` |
| How is spawn produced? | `03_spawn/` |
| What is the physical infrastructure? | `04_facility/` |
| What are the laboratory protocols? | `03_spawn/laboratory_roadmap.md`, `04_facility/laboratory.md` |
| What are the production SOPs? | `06_operations/` |
| What are the business and commercial records? | `07_business/` |
| What are the brand guidelines? | `08_brand/` |
| What scientific evidence supports our methods? | `09_research/` |

---

## 4. Document Categories

| Document | Category | Stability |
|---|---|---|
| `SETAS_DE_LA_PENA_CANON.md` | Architectural | Canonical |
| `EDITORIAL_GUIDELINES.md` | Governance | Canonical |
| `SYSTEM_FLOW.md` | Architectural | Canonical |
| `AI_AGENT_PROTOCOL.md` | Governance | Canonical |
| `IDENTIFIER_STANDARD.md` | Technical Standard | Canonical |
| `REPOSITORY_MAP.md` | Navigation | Canonical |
| `01_species/` | Knowledge Domain | Stable |
| `02_substrates/` | Knowledge Domain | Stable |
| `03_spawn/` | Knowledge Domain | Stable |
| `04_facility/` | Knowledge Domain | Stable |
| `05_equipment/` | Knowledge Domain | Stable |
| `06_operations/` | Operational | Stable |
| `07_business/` | Operational | Stable |
| `08_brand/` | Reference | Stable |
| `09_research/` | Research | Stable |
| `10_ai_workflows/` | Workflow Library | Stable |
| `CURRENT_OPERATIONS.md` | Living Document | Living |
| `DECISIONS.md` | Living Document | Living |
| `LESSONS_LEARNED.md` | Living Document | Living |

---

## 5. Repository Stability Levels

Three stability classes apply across the entire repository.

| Class | Description | Change Frequency |
|---|---|---|
| **Canonical** | Defines long-term principles and architecture. Modified only through formal governance. | Rare |
| **Stable** | Contains validated operational knowledge. Updated when procedures or evidence change. | Occasional |
| **Living** | Represents current operations, active observations, and ongoing learning. | Continuous |

Knowledge matures through stability levels as it is validated:

```
Living
  └─ Stable
       └─ Canonical   ← Only when foundational principles change
```

Promotion requires explicit authority as defined in `EDITORIAL_GUIDELINES.md`. Demotion does not occur; deprecated content is archived.

---

## 6. Information Retrieval Guide

| Request | Start Here |
|---|---|
| What is the work status right now? | `CURRENT_OPERATIONS.md` (knowledge_base root) |
| What is the project philosophy? | `SETAS_DE_LA_PENA_CANON.md` |
| What is the substrate recipe? | `02_substrates/` |
| How do we produce spawn? | `03_spawn/` |
| What are the cultivation parameters for a species? | `01_species/` |
| What are the production procedures? | `06_operations/` |
| What has gone wrong and what did we learn? | `LESSONS_LEARNED.md` → `06_operations/` |
| Why was a method changed? | `DECISIONS.md` |
| What does the science say? | `09_research/` |
| What does the facility look like? | `04_facility/` |
| What are the lab sterilization protocols? | `02_substrates/sterilization.md`, `05_equipment/autoclaves.md` |
| What are the editing rules for this repository? | `EDITORIAL_GUIDELINES.md` |
| How do I assign an identifier? | `IDENTIFIER_STANDARD.md` |
| How does knowledge move through the system? | `SYSTEM_FLOW.md` |
| What should an AI agent do or avoid? | `AI_AGENT_PROTOCOL.md` |
| What are our commercial objectives? | `07_business/` |
| What is the brand voice and identity? | `08_brand/` |

---

## 7. Navigation Decision Tree

```
What do I need?
│
├─ Project philosophy or non-negotiables
│    └─ SETAS_DE_LA_PENA_CANON.md
│
├─ Repository organization or document location
│    └─ REPOSITORY_MAP.md  (this document)
│
├─ System or information architecture
│    └─ SYSTEM_FLOW.md
│
├─ AI agent behavior or constraints
│    └─ AI_AGENT_PROTOCOL.md
│
├─ Current work status
│    └─ CURRENT_OPERATIONS.md  (knowledge_base root)
│
├─ Operational procedures
│    └─ 06_operations/ → relevant SOP
│
├─ Lessons from previous work or failures
│    └─ LESSONS_LEARNED.md  (knowledge_base root)
│
├─ Strategic rationale behind a method change
│    └─ DECISIONS.md  (knowledge_base root)
│
├─ Scientific evidence
│    └─ 09_research/
│
└─ Domain knowledge (species, substrates, spawn, facility, lab, brand, business)
     └─ Relevant domain directory (01_ through 08_)
```

---

## 8. Typical Navigation Paths

### Starting today's work

```
REPOSITORY_MAP.md
  └─ CURRENT_OPERATIONS.md  (knowledge_base root)
       └─ Relevant SOP in 06_operations/
            └─ Batch record (BT / BL / HV identifiers per IDENTIFIER_STANDARD.md)
```

### Investigating contamination

```
REPOSITORY_MAP.md
  └─ LESSONS_LEARNED.md  (knowledge_base root)
       └─ 06_operations/
            └─ 03_spawn/
                 └─ 09_research/
```

### Planning infrastructure changes

```
REPOSITORY_MAP.md
  └─ SYSTEM_FLOW.md
       └─ 04_facility/
            └─ 05_equipment/
                 └─ 07_business/
```

### Onboarding a new biological line

```
REPOSITORY_MAP.md
  └─ IDENTIFIER_STANDARD.md  (assign SP → MC identifiers)
       └─ 01_species/
            └─ 04_facility/laboratory.md
                 └─ 03_spawn/
                      └─ CURRENT_OPERATIONS.md  (knowledge_base root)
```

---

## 9. Repository Lifecycle

Knowledge moves through the system in a defined sequence. This flow is authoritative in `SYSTEM_FLOW.md`.

```
Field or production observation
  └─ CURRENT_OPERATIONS.md     ← Captured immediately
       └─ LESSONS_LEARNED.md   ← Formalized as a lesson
            └─ DECISIONS.md    ← Converted to an operational decision
                 └─ 06_operations/ (SOP) ← Encoded as procedure
                      └─ Knowledge Domain ← Becomes stable reference
                           └─ CANON      ← Only when foundational principles change
```

Documents move from living to stable to canonical as their content is validated. Canonicalization is rare and requires explicit authority.

---

## 10. Repository Entry Points

### New Human Collaborator

| Order | Document | Purpose |
|---|---|---|
| 1 | `REPOSITORY_MAP.md` | Understand the navigation system |
| 2 | `SETAS_DE_LA_PENA_CANON.md` | Understand project philosophy |
| 3 | `SYSTEM_FLOW.md` | Understand repository architecture |
| 4 | `EDITORIAL_GUIDELINES.md` | Understand writing and governance rules |
| 5 | `IDENTIFIER_STANDARD.md` | Understand how objects are identified |
| 6 | `CURRENT_OPERATIONS.md` (knowledge_base root) | Understand current work status |
| 7 | Relevant Knowledge Domain | Read domain-specific material |

### AI Agent

| Order | Document | Purpose |
|---|---|---|
| 1 | `AI_AGENT_PROTOCOL.md` | Behavioral rules and constraints |
| 2 | `REPOSITORY_MAP.md` | Navigation structure |
| 3 | `SETAS_DE_LA_PENA_CANON.md` | Project philosophy and non-negotiables |
| 4 | `SYSTEM_FLOW.md` | Information architecture |
| 5 | `IDENTIFIER_STANDARD.md` | Traceability requirements |
| 6 | Task-relevant documents | Domain-specific retrieval |

---

## 11. Repository Health Checklist

A repository in good health satisfies all of the following:

- ✓ One authoritative source per topic — no duplicated responsibilities
- ✓ No duplicated knowledge across documents
- ✓ Consistent terminology throughout all domains
- ✓ All internal references resolve to existing documents
- ✓ Complete biological and operational traceability via identifiers
- ✓ Living documents actively maintained and current
- ✓ Stable documents periodically reviewed for accuracy
- ✓ Canonical documents modified only through formal governance
- ✓ All new objects registered with identifiers before use
- ✓ Knowledge promoted through stability levels as validated

---

## 12. Maintenance Rules

- This document contains only references. It holds no knowledge of its own.
- Do not summarize, reproduce, or paraphrase content from other documents.
- Update this document only when repository organization changes: directories are added, renamed, or removed; documents are promoted or reclassified.
- Changes to individual domain documents do not require updates to this map.
- Version increments follow the same rules as all governed documents in this repository (`EDITORIAL_GUIDELINES.md`).

---

## 13. Closing Principle

The Repository Map exists to reduce navigation cost while preserving a single source of truth for every topic.

Every question has one authoritative answer. This document tells you where to find it.

---

*This document is canonical. It is a navigation layer only and must never become a knowledge document.*
