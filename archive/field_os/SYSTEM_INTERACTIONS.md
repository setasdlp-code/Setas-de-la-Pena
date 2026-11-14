---
title: SdP Field OS — System Interactions
document_id: PINT-001
authority: product-architecture
category: product-architecture
version: 1.0
last_reviewed: 2026-07-05
status: active
governed_by:
  - PRODUCT_CANON.md
  - PRODUCT_ARCHITECTURE.md
  - DATA_MODEL.md
  - MODULE_MAP.md
  - USER_WORKFLOWS.md
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
---

# SYSTEM_INTERACTIONS — SdP Field OS

## Conceptual Module Collaboration — v1.0

---

## 0. Nature and scope

This document describes **how the conceptual modules of Field OS collaborate to transform operational reality into organizational knowledge.** It describes *conceptual interactions*, not software components, services, APIs, screens, or implementation. It names no technology and remains valid if the software is rewritten.

It is derived from and subordinate to the approved conceptual definition — PRODUCT_CANON (PC-01 … PC-12), PRODUCT_ARCHITECTURE (INV-1 … INV-11), DATA_MODEL, MODULE_MAP, USER_WORKFLOWS, and the three ADRs. It introduces no new module, entity, principle, or decision. The modules referenced are exactly those fixed in MODULE_MAP; the invariants referenced are those fixed in PRODUCT_ARCHITECTURE §7.

The through-line: **reality enters as identified fact, accumulates as immutable history, is offered as evidence, and only then — downstream and externally — becomes knowledge that supports the operator's decisions.** Nothing in the collaboration reverses that arrow.

---

## 1. System responsibilities

Field OS discharges seven major responsibilities. Each lives in one or more MODULE_MAP modules; together they turn operational moments into traceable memory.

- **Identity** — establish and preserve the permanent identity of every owned object. *(Identity & Registry; PC-01, INV-2.)*
- **Registration** — bring a real object (container, batch) into record under the rules of its kind. *(Containers, Batches on Identity & Registry; PC-01, PC-02.)*
- **Capture** — fix operational moments as immutable, attributed events. *(Capture / Ledger; PC-03, PC-05, PC-11.)*
- **Reference** — situate events in external context without owning it. *(References ▸ Knowledge / Recipe & Formulation / Automation Boundaries; PC-07, PC-08, INV-7.)*
- **Record-keeping** — preserve cumulative history and derive state from it. *(Operational Records; PC-06, PC-11, INV-3/4.)*
- **Review** — serve the evidence back to humans for judgment, read-only. *(Review / Query; PC-12, INV-10.)*
- **Interpretation (future)** — read the record to produce advice, monitoring, or lessons. *(AI Interpretation, deferred; PC-04, PC-09.)*
- **Traceability** — the cross-cutting property that every fact resolves to one object, one operator, one moment, and can be reached again. It is not a single module; it *emerges* when Identity, Registration, Capture, and Record-keeping cooperate correctly. *(INV-1; ADR-0001; repository traceability governance.)*

**How they cooperate.** Registration asks Identity for a durable name; Capture writes only against identified objects and borrows context from Reference; Record-keeping accumulates what Capture writes and derives state without altering it; Review reads what Record-keeping holds; Interpretation (later) reads the same record and returns only new evidence. Traceability is the guarantee that survives every one of these hand-offs because none of them ever edits or detaches a prior fact.

---

## 2. Interaction flows

Each interaction gives Initiator, Receiver, Information exchanged, Responsibility transferred, Objects affected, and Traceability implication. No APIs; these are conceptual hand-offs of responsibility.

**IF-1 — Registration requests identity.**
- *Initiator.* Containers / Batches (Domain). *Receiver.* Identity & Registry. *Information exchanged.* "An object must enter record." *Responsibility transferred.* Minting a permanent, immutable identity. *Objects affected.* Container / Batch (identity assigned). *Traceability.* The object becomes referenceable for its whole life; nothing may be recorded about it before this (INV-2, PC-01).

**IF-2 — Boundary supplies context to Capture.**
- *Initiator.* Capture / Ledger (needs context). *Receiver.* References ▸ Knowledge / Recipe / Automation Boundary. *Information exchanged.* Read-only references (recipe, sensor, location, equipment, knowledge). *Responsibility transferred.* None over the external object — only a reference is handed across. *Objects affected.* The event being formed (gains context references). *Traceability.* The event is situated in its conditions without importing external authority (PC-07, PC-08, INV-7).

**IF-3 — Capture appends to the record.**
- *Initiator.* Capture / Ledger. *Receiver.* Operational Records. *Information exchanged.* A new immutable, attributed event. *Responsibility transferred.* Custody of the fact passes from the act of writing to the cumulative history. *Objects affected.* Operational Event (created); the object's history (extended). *Traceability.* The single write path advances by one appended, immutable fact (INV-3, PC-11, PC-06).

**IF-4 — Domain rules shape the write.**
- *Initiator.* Capture / Ledger. *Receiver.* Containers / Batches / Observations / Harvest (Domain). *Information exchanged.* The entity-specific rules governing this event (anchoring, membership, evidence-not-interpretation, terminal transition). *Responsibility transferred.* Correct application of the entity's lifecycle rules — not a second write path. *Objects affected.* The event and the object whose rules apply. *Traceability.* Guarantees the event anchors to exactly one container and obeys its kind's rules (PC-01, PC-02).

**IF-5 — Records serve evidence to Review.**
- *Initiator.* Review / Query (on human demand). *Receiver.* Operational Records. *Information exchanged.* History and derived state, read-only. *Responsibility transferred.* None — Records retains ownership; Review only reads. *Objects affected.* None modified. *Traceability.* The immutable history is projected into a faithful account; gaps show as gaps (INV-4, PC-12).

**IF-6 — Review presents evidence to the human.**
- *Initiator.* Review / Query. *Receiver.* Operator / Reviewer (human). *Information exchanged.* Evidence beside referenced knowledge. *Responsibility transferred.* Judgment stays with the human; the system supports, never decides. *Objects affected.* None. *Traceability.* Decisions, if made, re-enter as new events (IF-8), preserving the fact→decision chain (PC-12, PC-09).

**IF-7 — Records offered to Interpretation (deferred).**
- *Initiator.* AI Interpretation (future). *Receiver.* Operational Records + Knowledge Boundary. *Information exchanged.* History and external knowledge, read-only. *Responsibility transferred.* None over the record. *Objects affected.* None modified. *Traceability.* Interpretation reads evidence but never precedes or edits it (PC-04, PC-09).

**IF-8 — Interpretation or decision re-enters as new evidence.**
- *Initiator.* Operator (or, later, AI Interpretation via the operator). *Receiver.* Capture / Ledger. *Information exchanged.* A new fact (a decision, a lesson, a flag). *Responsibility transferred.* Back to the normal write path as a *new* event. *Objects affected.* A new Operational Event; never a prior one. *Traceability.* The loop closes without reversal: conclusions become new, attributable facts, not edits (INV-3, PC-11).

---

## 3. Event propagation

A single operational moment — an **observation** — propagating through the conceptual system, described as responsibilities, not implementation:

```
Human perceives a condition        (intention — Operator)
        ↓   the target must be identified first
Identity & Registry                (guarantees the container's identity exists)  — INV-2
        ↓   entity rules apply
Observations (Domain)              (this is evidence, not interpretation)          — PC-09
        ↓   optional context borrowed
Automation Boundary / References   (attach read-only sensor context)              — PC-08
        ↓   the fact is fixed
Capture / Ledger                   (immutable, attributed Observation event)      — PC-11
        ↓   custody passes to history
Operational Records                (append to history; derive state, never overwrite) — INV-3/4
        ↓   offered on demand
Review / Query                     (human sees evidence beside knowledge)         — PC-12
        ↓   downstream, read-only, deferred
AI Interpretation (future)         (may read to produce a lesson)                 — PC-04
        ↓   conclusion re-enters as a NEW fact
Knowledge Boundary → Knowledge System  (lesson matures externally)               — PC-08
        ↓
Operator decision → Capture (new event)   (loop closes without reversal)         — PC-12, INV-3
```

Three responsibilities govern the whole propagation: the fact is **identified before recorded**, **fixed immutably once recorded**, and **never edited by anything downstream** — review, interpretation, and knowledge all read it, and anything they conclude returns only as a new event. This is event propagation as a chain of custody, not a data pipeline.

---

## 4. Read / write responsibilities

For each module: what it Reads, Writes, References, Never modifies, Never owns. "Writes" means *creates immutable records*; only one module writes history.

| Module | Reads | Writes | References | Never modifies | Never owns |
|--------|-------|--------|-----------|----------------|------------|
| Identity & Registry | the registry of identified objects | new identities (assign-once) | the repository Identifier Standard | an identifier after assignment | referenced (external) objects' identities |
| Capture / Ledger | identified objects; context references | immutable Events (incl. Observation, Harvest) | recipe/sensor/knowledge/location context | any prior event | knowledge, recipes, control |
| Operational Records | the event history | derived state (as projection) | — | the append-only history | knowledge or interpretation |
| Containers | container events & history | — (rules, not a write path) | Batch (parent), Species/Strain | the anchor grain | the referenced context |
| Batches | member histories; batch events | — (rules) | member Containers | the container's role as anchor | member objects' authority |
| Observations | perceptions; optional sensor refs | — (via Capture) | Sensor Readings | a recorded observation | interpretation |
| Harvest | container state | — (via Capture) | — | a recorded outcome | yield knowledge/grading |
| References (umbrella) | external authorities (read-only) | references onto events | all external context | external objects | any external object |
| Knowledge Boundary | Knowledge System | Knowledge References | knowledge/parameters/lineage | knowledge | knowledge authority |
| Recipe & Formulation Boundary | Recipe & Formulation Engine | Recipe References | formulations | recipes | recipe logic |
| Automation Boundary | sensor data | Sensor Reading references | environmental data | sensor/control state | hardware/control |
| Review / Query | history, derived state, references | — (read-only) | knowledge for context | anything | anything |
| AI Interpretation *(deferred)* | Operational Records; knowledge | — (only via new events, IF-8) | knowledge | the record | the record |

The table encodes the load-bearing shape: **exactly one write path into history** (Identity → Capture → Records), every other module a reader or a rule-holder, and every Boundary a read-only reference (INV-3, INV-6, PC-06, PC-08).

---

## 5. Boundary interactions

Field OS's conceptual relationships with the five neighbours, per ADR-0003 and PC-06/07/08. Direction is always Field OS *reads* the first three and *owns* only operational evidence.

- **Knowledge System.** Field OS reads cultivation parameters, species/strain lineage, sources, and (later) lessons, holding them as Knowledge References. It never authors or owns knowledge; parameters a future advisor needs stay here, external (PC-08, AI-3). Conclusions matured from Field OS evidence flow *out* to the Knowledge System, never back as edits to the record.
- **Recipe & Formulation Engine.** Field OS reads recipe/formulation identity and records *that* a recipe was used, as Recipe References. It never computes or owns a formulation — no competing source of recipe truth (PC-07, PC-08). *(The rename to "Recipe & Formulation Engine" is a pending ADR-0003 amendment proposal, not adopted; the neighbour is the substrate simulator of ADR-0003.)*
- **Automation Layer.** Field OS reads sensor data and holds it as Sensor Reading references for context. It never issues a control command and never becomes the controller (PC-08; IN-2). Referenced-reading trust is `Proposed` (IN-3), so sensor data is context, not owned truth.
- **Operational Records.** This is what Field OS *owns* and writes: the cumulative operational evidence. It is intended to correspond to the repository's `operations/` role for primary operational evidence (RE-2), but because RE-2 is `Proposed`, the ownership is fixed while the repository home of that evidence remains open.
- **AI Workflows.** The repository's reusable AI workflows and the maturation path treat the Operational Record as *input* and produce reviews/lessons as *output*. Field OS provides the record; it does not own the workflow logic, and interpretation stays downstream of evidence (PC-09). This is deferred (ADR-0002) and reserved, not built into the foundation (PC-04).

Across all five, the rule is identical: **read from three, write to one, own none of the neighbours.** Any interaction that would have Field OS write outside operational evidence, compute a recipe, or command hardware is a *boundary change* requiring ADR-0003 review — not an interaction this document may introduce.

---

## 6. Invariant preservation

How module collaboration keeps each invariant true. None is preserved by a single module; each is a property of the hand-offs.

- **Persistent identity (INV-2, PC-01).** Identity & Registry mints identity once; every other module refers to objects only by that identity and none may reissue or reformat it. Preserved because registration always precedes capture (IF-1 before IF-3).
- **Append-only history (INV-3, PC-11).** Capture only ever *adds* events; Records never lets an external module edit history; downstream modules (Review, Interpretation) are read-only. Preserved because there is a single write path and the arrow never reverses (IF-3, IF-8).
- **Evidence integrity (INV-5, PC-03, PC-09).** Observations and Capture fix perception as fact before any interpretation exists; Interpretation reads but returns only new events. Preserved because interpretation is structurally downstream of evidence (IF-7, IF-8).
- **Traceability (INV-1, ADR-0001).** Domain rules force every event to anchor to exactly one container and one operator; Records keeps the chain intact. Preserved because Capture writes only against identified objects with attribution (IF-1, IF-4).
- **Knowledge separation (INV-7, PC-08).** The Boundary modules hand across references only; no module writes to a neighbour. Preserved because context enters as read-only reference and conclusions leave as external knowledge, never as owned data (IF-2, §5).
- **Operator responsibility (INV-10, PC-12).** Review presents evidence but never decides; any decision re-enters as an attributed event. Preserved because the system supports judgment and records its outcome, never substitutes for it (IF-6, IF-8).

The common mechanism: **no hand-off ever edits or detaches a prior fact.** Every invariant rests on that single discipline.

---

## 7. Future extension points

The conceptual seams where future capabilities may connect **without changing this architecture**. These are identified, not designed (PC-04; ADR-0002 defers the capabilities themselves).

- **AI Interpretation.** Connects as a *reader* of Operational Records and Knowledge (IF-7); returns only new evidence through Capture (IF-8). Seam already reserved as the deferred module; no architectural change needed.
- **Analytics.** Connects as a read-only consumer of history and derived state (the Review/Records seam). It aggregates evidence; it never writes history or owns knowledge.
- **Decision Support.** Connects downstream of Review: reads evidence and referenced knowledge, surfaces options to the operator, and never decides (PC-12). The seam is the same read path Review uses.
- **Planning / Scheduling.** Connects as a reader of records and knowledge and would introduce the reserved **Task** concept (DATA_MODEL §2.13) — admissible later because the record was shaped not to design it out (PC-04). It must remain a reader and a producer of *new* events, never an editor of history.
- **Automation (beyond reading).** The Automation Boundary is already a read seam. Any capability that would have Field OS *command* hardware is **not** an extension point — it is a boundary change requiring ADR-0003 review, because it crosses the ownership line (PC-08).

**The rule for every seam:** a future capability may connect only as a **reader of evidence and knowledge**, and may affect the record only by producing **new, attributed events** through the existing write path. Anything that would make Field OS a second writer of history, an owner of knowledge or recipes, or a controller of hardware is not an extension — it is a change to the ADRs. That single constraint is what lets capabilities be added for years without disturbing the conceptual architecture.

---

*Document version: 1.0*
*Effective date: 2026-07-05*
*Authority: Field OS product architecture (system interactions)*
*Governed by: PRODUCT_CANON.md, PRODUCT_ARCHITECTURE.md, DATA_MODEL.md, MODULE_MAP.md, USER_WORKFLOWS.md, ADR-0001, ADR-0002, ADR-0003, PRODUCT_ASSUMPTIONS.md*
*Describes conceptual module collaboration. No software components, APIs, UI, or implementation. Introduces no new module, entity, or principle.*
*Valid independent of any language, framework, database, interface, or deployment model.*
