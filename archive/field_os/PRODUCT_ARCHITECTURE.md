---
title: SdP Field OS — Product Architecture
document_id: PARCH-001
authority: product-architecture
category: product-architecture
version: 1.0
last_reviewed: 2026-07-05
status: active
governed_by:
  - PRODUCT_CANON.md
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
---

# PRODUCT_ARCHITECTURE — SdP Field OS

## Conceptual Architecture — v1.0

---

## 0. Nature and scope of this document

This document describes **how the product thinks** — the conceptual architecture of SdP Field OS as an operational system. It is not software architecture, system design, or implementation planning. It names no language, framework, database, interface, or deployment model, and it is written to remain valid if the software is rewritten entirely.

It is **derived from and subordinate to** the approved governance: PRODUCT_CANON (PC-01 … PC-12), the three Accepted ADRs, and PRODUCT_ASSUMPTIONS. It introduces no new architectural decision. Where governance is silent or rests on a `Proposed` assumption, this document marks the matter as open rather than settling it (PC-09, PC-10). This document sits below PRODUCT_CANON and above the future engineering documents (`DATA_MODEL`, `MODULE_MAP`, `ROADMAP`); it is the bridge between product governance and software engineering.

---

## 1. Mental model

**Field OS is an operational memory system, not a collection of screens.** Its purpose is to hold a faithful, cumulative account of what happened in production, anchored to the real objects it happened to, so that the operation can be reviewed, explained, and improved over time. Everything the product *is* follows from that: it remembers before it interprets, and it interprets before anyone decides.

The model is built from seven concepts and the way they relate:

- **Operational objects** — the things that *exist* in production: the individual container above all, and the batch that groups containers. Objects have identity and persist through time.
- **Operational events** — the things that *happen* to objects: inoculation, transfer, contamination, harvest, disposal, observation. An event is a fact fixed at a moment and attributed to an object.
- **Operational state** — what is *currently true* of an object: its stage, location, condition. State is not stored as a replacement for what came before; it is a **reading derived from the accumulated events** (PC-11).
- **Operational history** — the *cumulative* sequence of events for an object across its whole life. History only grows; events are appended, never overwritten (PC-11).
- **Operational evidence** — the history offered as a trustworthy account: the thing Field OS owns and is responsible for (PC-06). Evidence is *recorded reality*, kept distinct from any interpretation of it (PC-03, PC-09).
- **Knowledge** — cultivation parameters, species facts, recipes, and lessons. Knowledge is **external**: Field OS reads it but never owns or authors it (PC-08, ADR-0003).
- **Decisions** — the operational choices the operation makes. Field OS **supports** decisions with evidence and referenced knowledge; the operator makes them (PC-12). Field OS records that a decision happened; it does not make the decision.

**How they relate, in one line:** events happen to objects → events accumulate into history → history is offered as evidence → evidence, read beside external knowledge, supports the operator's decisions → decisions produce new operations, which produce new events. Interpretation (including AI review) sits *after* evidence and *before* decision, and never rewrites the record it reads.

This memory is the asset every later capability depends on. Advice, monitoring, and procedure enforcement are deferred (ADR-0002) but must remain reachable from this memory without reshaping it (PC-04).

---

## 2. Core objects

These are **conceptual product objects**, not database entities. Each is described by Purpose, Lifecycle, Ownership, Relationships, and Persistence. "Owned" means Field OS is the authority for the object; "Referenced" means Field OS holds a pointer to an object owned by a neighbouring system (ADR-0003, PC-07, PC-08).

### 2.1 Container — *owned, atomic unit of record*
- **Purpose.** The single physical object of production — a block, bag, or jar — and the atomic object to which every event, state, and history entry is anchored (PC-01, ADR-0001).
- **Lifecycle.** Comes into record at creation (e.g. inoculation), accumulates events through its cultivation life, and reaches a terminal event (harvest completion, disposal). Its history persists after the physical object is gone.
- **Ownership.** Owned by Field OS. It carries a persistent, unambiguous identity that survives the whole cycle (PC-11 identity; DA-1 — the persistence of that identity through handling is a `Proposed` assumption, so this document asserts the *requirement* of identity, not the *means*).
- **Relationships.** Child of at most one Batch (PC-02). Subject of Events. Target of referenced Sensor Readings, Recipe References, and Room/Zone context.
- **Persistence.** Permanent. A container's record is never deleted; a terminal event closes its life without erasing its history (PC-11).

### 2.2 Batch — *owned, grouping above the container*
- **Purpose.** A grouping of containers produced or handled together. It organizes containers; it is never the anchor of record (PC-02, ADR-0001).
- **Lifecycle.** Formed when its member containers are created together; membership is fixed at creation. Persists as the parent context for its members.
- **Ownership.** Owned by Field OS.
- **Relationships.** Parent of many Containers. May be the origin of batch-level Events that are *inherited* by member containers — with the caveat that loss-free inheritance is a `Proposed` assumption (DA-4); the architecture allows inheritance but does not assume it is always lossless.
- **Persistence.** Permanent, as the durable grouping of its members' histories.

### 2.3 Event — *owned, the unit of history*
- **Purpose.** A recorded fact about what happened — inoculation, transfer, contamination, harvest, disposal, and observation are the governance-named kinds (ADR-0001, ADR-0002). The Event is the atom of the operational ledger.
- **Lifecycle.** Created at (or as close as faithful capture allows to) the moment it occurs; once recorded it is **immutable** and append-only (PC-11). A correction is a new event, never an overwrite.
- **Ownership.** Owned by Field OS. This is the core of what Field OS writes (PC-06).
- **Relationships.** Anchored to exactly one Container (or inherited from a Batch to its members). Attributed to an Operator. May reference a Room/Zone, a Recipe Reference, or a Sensor Reading as context.
- **Persistence.** Permanent and immutable. The set of event kinds is expected to be bounded and enumerable (DA-2, `Proposed`), so the architecture treats the vocabulary as stable-but-revisable, not fixed forever.

### 2.4 Observation — *owned, an event of human perception*
- **Purpose.** A recorded human perception of an object's condition. Governance treats observation as first-class: observation precedes intervention (repository CANON P-08), and the record exists precisely because remote decision-making needs faithful sight of what the caretaker sees (OP-4).
- **Lifecycle.** A kind of Event: fixed at its moment, immutable thereafter.
- **Ownership.** Owned by Field OS.
- **Relationships.** Anchored to a Container; attributed to an Operator; may carry referenced Sensor Readings as corroboration. It is *evidence*, not interpretation (PC-09).
- **Persistence.** Permanent and immutable.

### 2.5 Harvest — *owned, a terminal-stage event*
- **Purpose.** The recorded outcome event of a container's productive life (named among the meaningful events in ADR-0001).
- **Lifecycle.** A specialized Event near the end of a container's cycle; immutable once recorded. A container may reach harvest or, alternatively, disposal — both are recorded outcomes, and a recorded failure has the same standing as a recorded success (PC-11; repository CANON §6).
- **Ownership.** Owned by Field OS.
- **Relationships.** Anchored to a Container; contributes to Batch-level and knowledge-level aggregation downstream (external).
- **Persistence.** Permanent and immutable.

### 2.6 Operator — *owned as attribution, not as a permissions model*
- **Purpose.** The actor to whom recorded events are attributed, and the party who interprets and decides. The operator remains the primary decision-maker (PC-12); Field OS supports judgment, never replaces responsibility.
- **Lifecycle.** Present as the author/attribution of every record. The current model is a single on-site caretaker with a remote operator who reads and reviews (US-1, US-3) — both `Proposed`; a multi-user expansion is possible but unvalidated (GR-2). This document therefore defines the Operator only as *authorship and accountability*, and does not assume a roles, permissions, or concurrency model.
- **Ownership.** The attribution is owned by Field OS; the human is not a Field OS object.
- **Relationships.** Author of Events and Observations; the decision-maker that Evidence and Knowledge serve.
- **Persistence.** Attribution persists with each event it authored (immutable, like the event).

### 2.7 Room / Zone — *referenced context, never the anchor*
- **Purpose.** The physical location where handling or an event occurs. A zone is a location, not a produced object, and was explicitly rejected as the unit of record (ADR-0001).
- **Lifecycle.** Referenced as context on events; containers move between zones during a cycle.
- **Ownership.** Not owned as an authority by Field OS beyond its use as event context; facility definition lives in the knowledge/facility domain.
- **Relationships.** Referenced by Events as the "where."
- **Persistence.** The *reference* persists on the event that used it (immutable); the definition of the zone is external.

### 2.8 Recipe Reference — *referenced, never owned*
- **Purpose.** A pointer to a recipe/formulation owned by the Recipe & Formulation Engine (the substrate simulator of ADR-0003). Field OS records *that* a container was prepared to a given recipe; it never computes or owns the recipe (PC-08, PC-07).
- **Lifecycle.** Bound to a container/batch at preparation as a reference; immutable on the event that used it.
- **Ownership.** Referenced. Authority stays with the Recipe & Formulation Engine.
- **Relationships.** Attached to preparation Events on Containers/Batches.
- **Persistence.** The reference persists immutably within the record; the recipe's own lifecycle is external.

### 2.9 Sensor Reading — *referenced/consumed, never owned as control*
- **Purpose.** Environmental data from the Automation Layer, used to situate operational events (ADR-0003 permits reading sensor data; IN-2). Field OS may reference or ingest readings but never commands hardware.
- **Lifecycle.** Produced by the sensor layer; referenced or copied into the record as context at a moment.
- **Ownership.** Referenced/consumed. Authority and control stay with the Automation Layer (PC-08). Trustworthiness of referenced readings is a `Proposed` assumption (IN-3), so the architecture references sensor data *as context*, not as owned truth.
- **Relationships.** Attached as context to Events/Observations.
- **Persistence.** A referenced reading, once attached to an immutable event, persists with it.

### 2.10 Recipe & Formulation Engine, Knowledge, Automation — *external references*
These are not Field OS objects; they are the neighbouring authorities Field OS reads from. They appear here only to be named as **referenced**, never owned (Section 6).

### 2.11 Deferred objects — reserved, not owned in the foundation
Governance defers advice, monitoring, and procedure enforcement (ADR-0002). Two commonly expected objects therefore belong to *deferred capability*, not to the record-first foundation:

- **Task / Procedure step.** Implies procedure enforcement, which is explicitly deferred. The architecture **reserves its place** so it can later read from the record without a rebuild (PC-04), but Field OS does not own Tasks in v1.
- **AI Review.** An *interpretation* artifact produced by reading the record (repository maturation path: record → daily AI review → lesson). Interpretation always follows evidence and never precedes or rewrites it (PC-09, PC-03). AI review is largely deferred (AI-1, AI-2 — `Proposed`); its output may re-enter as evidence, but the interpretation layer is downstream and does not own the record.

---

## 3. Relationships

The objects relate along five conceptual axes. None of this describes storage.

**Parent–child.** Batch → Container is the only ownership hierarchy (PC-02). A container belongs to at most one batch; a batch groups many containers. No coarser grouping (zone, cycle) ever becomes a parent-of-record (ADR-0001).

**Historical.** Container → Event(s) is the spine of the model. Each container owns an ordered, append-only sequence of events that is its history (PC-11). A batch's history is the aggregation of its members' histories, plus batch-level events inherited downward (DA-4, with the loss-free caveat). History is cumulative and directional: later events never edit earlier ones.

**Traceability.** Every recorded fact resolves to a single concrete object (PC-01). From any container one can reach its full history; from any event one can reach the object it happened to and the operator who recorded it. This is the finest-grain traceability the physical reality supports, and biological, operational, and knowledge traceability all attach to the same object (ADR-0001; repository governance instruction to preserve traceability).

**Operational.** Events reference the operational context in which they occurred — Room/Zone (where), Recipe Reference (to what formulation), Sensor Reading (under what conditions), Operator (by whom). These are *context references* on immutable events, not owned sub-objects.

**Knowledge.** Field OS records point *outward* to knowledge and recipes but never inward-own them. A Recipe Reference links an event to an externally owned formulation; a future interpretation may link a record to an externally owned lesson or parameter. The direction is always Field OS → external authority, read-only (PC-07, PC-08).

---

## 4. Information lifecycle

Information matures along a single directed path, derived from ADR-0002 (record first), PC-03/PC-09 (evidence precedes interpretation), PC-11 (cumulative history), ADR-0003/PC-08 (knowledge external), and the repository maturation path (Observation → Operational Record → Daily AI Review → Lesson Learned → Decision → SOP → Knowledge Domain → Stable Knowledge → CANON).

```
Observation / operational moment
        ↓   (faithful, low-friction capture — PC-05)
Operational Event                     ── owned by Field OS
        ↓   (append-only — PC-11)
Operational Record (cumulative history)  ── owned by Field OS
        ↓   ────────────  boundary of what Field OS owns  ────────────
Interpretation  (human review; later, AI review)   ── evidence precedes interpretation, PC-09
        ↓
Evidence / Lesson Learned
        ↓
Knowledge System   ── external authority, PC-08 / ADR-0003
        ↓
Operational Decision   ── made by the operator, supported not replaced, PC-12
        ↓
Future Operations   ── which generate new observations, closing the loop
```

Three properties of this lifecycle are load-bearing and derived, not chosen here:

1. **Field OS owns only the first two-and-a-half steps** — up to and including the Operational Record. Interpretation, knowledge, and decision are downstream; knowledge is external (PC-06, PC-08).
2. **The arrow never reverses into the record.** Interpretation, evidence, knowledge, and decisions may *cite* the record and may themselves *become new events* (a decision is recorded as it happens), but nothing edits a prior event (PC-11). State is re-derived from history; it does not overwrite it.
3. **The exact ordering is not assumed beyond what governance supports.** Everything downstream of the Operational Record is deferred capability (ADR-0002) and partly rests on `Proposed` assumptions (AI-1, AI-2); the architecture guarantees only that the record is shaped so these steps can read from it later (PC-04).

---

## 5. Module responsibilities

These are **conceptual modules** — clusters of responsibility, not components, services, or screens. No UI is described. Each module is defined by Purpose, Inputs, Outputs, Objects owned/consumed/produced, and Interactions.

### 5.1 Identity module
- **Purpose.** Establish and preserve the persistent, unambiguous identity of every Container and Batch for its whole life (PC-01, PC-11; DA-1; repository Identifier Standard).
- **Inputs.** A request to bring a new object into record.
- **Outputs.** A durable identity bound to the object.
- **Owns.** The identity of Containers and Batches. **Consumes.** The repository Identifier Standard as a reference. **Produces.** Identified objects.
- **Interactions.** Every other module refers to objects by the identity this module guarantees.

### 5.2 Capture / Ledger module
- **Purpose.** Record operational Events faithfully and with low friction, as an append-only log (ADR-0002 core; PC-03, PC-05, PC-11).
- **Inputs.** Operational moments and observations, attributed to an Operator, with context references.
- **Outputs.** Immutable Events appended to the record.
- **Owns.** Events, Observations, Harvests. **Consumes.** Identified objects (from 5.1); context references (from 5.4). **Produces.** The growing Operational Record.
- **Interactions.** Feeds the Record module; draws context from the Reference module; is the sole writer of history.

### 5.3 Operational Record module
- **Purpose.** Hold the cumulative history and derive current state from it (PC-11). This is the operational evidence Field OS owns (PC-06).
- **Inputs.** Events from the Capture module.
- **Outputs.** History (for a container, a batch, the operation) and state as a *derived reading*.
- **Owns.** The Operational Record — the evidence. **Consumes.** Events. **Produces.** History views and derived state.
- **Interactions.** Read by the Review module and by any (deferred) interpretation; never edited from outside.

### 5.4 Reference / Boundary module
- **Purpose.** Hold read-only references to the neighbouring authorities — Knowledge System, Recipe & Formulation Engine, Automation Layer — so events can be given context without Field OS owning that context (ADR-0003; PC-07, PC-08).
- **Inputs.** Read access to the three external systems.
- **Outputs.** Recipe References, Room/Zone context, Sensor Readings as attachable context.
- **Owns.** Nothing external — only the *reference*, on the record. **Consumes.** External knowledge, recipes, sensor data. **Produces.** Context references for the Capture module.
- **Interactions.** Supplies context to Capture; enforces the "reference, never own" rule at the product boundary.

### 5.5 Review / Query module
- **Purpose.** Serve the human review the record exists for — the caretaker who writes and the remote operator who reads (ADR-0002 "read and query in service of human review"; US-3). It supports decisions; it does not make them (PC-12).
- **Inputs.** The Operational Record; referenced knowledge for side-by-side context.
- **Outputs.** Retrospective views that let a human see, question, and explain what happened.
- **Owns.** Nothing new; it is read-only over owned and referenced data. **Consumes.** History, state, references. **Produces.** Human-facing understanding (not stored interpretation).
- **Interactions.** Reads the Record and Reference modules; is the surface through which evidence supports operator decisions.

### 5.6 Interpretation module *(deferred — reserved by PC-04)*
- **Purpose.** Later, turn the record into advice, monitoring, or lessons (advisor / monitor / procedure engine — all deferred by ADR-0002; AI-1/AI-2 `Proposed`). Evidence precedes interpretation (PC-09).
- **Inputs.** The Operational Record; external knowledge.
- **Outputs.** Interpretations (e.g. AI Reviews, lessons) that may re-enter as new evidence but never rewrite the record.
- **Owns.** Nothing in the foundation. **Consumes.** History and knowledge. **Produces.** Deferred outputs, reachable from the record without a rebuild.
- **Interactions.** Reads the Record; its very deferral shapes the Capture and Record modules so it can be added later (PC-04).

---

## 6. System boundaries

Derived directly from ADR-0003 and PC-06/PC-07/PC-08.

**What Field OS owns.** Operational evidence and nothing else: the Events, Observations, Harvests, the cumulative Operational Record, and the identity and derived state of Containers and Batches. It is the authority for *what happened*.

**What Field OS references (reads, never owns).**
- **Knowledge System** — cultivation parameters, species facts, lessons. Field OS reads knowledge to give records context and to support decisions; it never authors or owns knowledge (PC-08). Parameters an advisor would use live here, not in Field OS (AI-3).
- **Recipe & Formulation Engine** — the recipe/formulation authority (the substrate simulator named in ADR-0003; a rename to *Recipe & Formulation Engine* is a pending ADR-0003 amendment proposal, recorded in the Canon change log — not yet adopted). Field OS references recipes; it never computes formulations (PC-08).
- **Automation Layer** — sensors and physical control (ESP32 / Home Assistant domain). Field OS may read or reference sensor data but never issues a control command (PC-08; IN-2). Referenced-reading trustworthiness is an open assumption (IN-3).

**What Field OS never owns.** Cultivation knowledge, recipe/formulation logic, and hardware-control authority. Each stays with the neighbour that owns it; Field OS consumes their outputs and defers to them as authorities (ADR-0003).

**Relationship with Operational Records (the repository role).** What Field OS writes is operational evidence, which is intended to correspond to the repository's `operations/` role for primary operational evidence (RE-2). Because RE-2 is a `Proposed` assumption, this document fixes the *ownership* (Field OS owns operational evidence) but leaves the *repository home* of that evidence open until validated.

**Relationship with AI Workflows.** The repository's reusable AI workflows (`10_ai_workflows/`) and the maturation path treat the Operational Record as their input and produce reviews/lessons as output. Field OS provides the record; it does not own the workflow logic, and interpretation remains downstream of evidence (PC-09). This capability is deferred (ADR-0002) and reserved, not built into the foundation (PC-04).

---

## 7. Product invariants

Architectural properties that must hold regardless of any future implementation. **No invariant is invented here**; each traces to PRODUCT_CANON or an Accepted ADR.

| # | Invariant | Traces to |
|---|-----------|-----------|
| INV-1 | **The individual container is the atomic anchor of record.** Every event, state, and history entry resolves to one container. | PC-01, PC-02 · ADR-0001 |
| INV-2 | **Objects retain a persistent, unambiguous identity** for their whole life. | PC-01, PC-11 · ADR-0001 |
| INV-3 | **Operational history is cumulative and immutable.** Events are appended, never overwritten; corrections are new events. | PC-11 · ADR-0002 |
| INV-4 | **State never replaces history.** Current state is a reading *derived from* history, not a substitute for it. | PC-11 |
| INV-5 | **Evidence precedes interpretation.** The record of what happened is captured before anything advises, prescribes, or enforces. | PC-03, PC-09 · ADR-0002 |
| INV-6 | **Field OS writes only operational evidence.** It owns operational state alone. | PC-06, PC-07 · ADR-0003 |
| INV-7 | **Knowledge, recipes, and control remain external.** Field OS references them and never becomes their authority. | PC-08 · ADR-0003 |
| INV-8 | **Deferred capability is preserved, not designed out.** The record is shaped so advice, monitoring, and procedure enforcement can later read from it without a rebuild. | PC-04 · ADR-0002 |
| INV-9 | **Capture remains faithful and low-friction.** Nothing may be added that degrades the faithful, low-cost recording of reality. | PC-05 · ADR-0002 |
| INV-10 | **The operator remains the primary decision-maker.** The system supports judgment and preserves accountability; it never replaces responsibility. | PC-12 · ADR-0002, ADR-0003 |
| INV-11 | **Fact, interpretation, and assumption stay distinct**, and nothing unvalidated is treated as settled truth. | PC-09, PC-10 |

---

## 8. Architectural traceability

For each major architectural concept: its supporting Canon principle(s), ADR(s), repository governance, and the future documents that depend on it. The "future documents" column is documentation only.

| Architectural concept | PRODUCT_CANON | ADR(s) | Repository governance | Dependent future documents |
|-----------------------|---------------|--------|------------------------|-----------------------------|
| Operational memory system (Mental model, §1) | PC-03, PC-09, PC-11 | ADR-0002 | CANON §6 (traceability); principles #4 | `DATA_MODEL`, `MODULE_MAP`, `ROADMAP` |
| Container as atomic object (§2.1, §3) | PC-01, PC-02 | ADR-0001 | Identifier Standard; CANON §6 | `DATA_MODEL`, `MODULE_MAP` |
| Batch as grouping (§2.2, §3) | PC-02 | ADR-0001 | CANON §6 (lot grouping) | `DATA_MODEL` |
| Event / immutable history (§2.3, §7 INV-3/4) | PC-11 | ADR-0001, ADR-0002 | CANON §6; principles #4; CANON P-04 | `DATA_MODEL` |
| Observation-first capture (§2.4) | PC-03, PC-05 | ADR-0002 | CANON P-08 (observation precedes intervention) | `DATA_MODEL`, `ROADMAP` |
| Persistent identity (§2.1, §5.1, INV-2) | PC-01, PC-11 | ADR-0001 | Identifier Standard | `DATA_MODEL`, `MODULE_MAP` |
| Operator authority & attribution (§2.6, INV-10) | PC-12 | ADR-0002, ADR-0003 | CANON §7; principles #3 | `PRODUCT_ARCHITECTURE` follow-ons; `ROADMAP` |
| Reference-not-own boundary (§2.8–2.10, §6) | PC-06, PC-07, PC-08 | ADR-0003 | Folder-role separation; principles #7 | `MODULE_MAP`, `DATA_MODEL` |
| Information lifecycle (§4) | PC-03, PC-04, PC-09, PC-11 | ADR-0002, ADR-0003 | Repository maturation path; CANON §16 | `ROADMAP`, `MODULE_MAP` |
| Conceptual modules (§5) | PC-05, PC-06, PC-07 | ADR-0002, ADR-0003 | CANON §7 (sensor→…→log) | `MODULE_MAP` |
| Deferred capability reserved (§2.11, §5.6, INV-8) | PC-04 | ADR-0002 | CANON P-03 (modularity) | `ROADMAP`, `MODULE_MAP` |
| Product invariants (§7) | PC-01…PC-12 | ADR-0001, ADR-0002, ADR-0003 | CANON §21 (stability of principles) | all future engineering documents |

---

*Document version: 1.0*
*Effective date: 2026-07-05*
*Authority: Field OS product architecture*
*Governed by: PRODUCT_CANON.md, ADR-0001, ADR-0002, ADR-0003, PRODUCT_ASSUMPTIONS.md*
*Derived only from approved governance. Introduces no new architectural decision, no new assumption, and no implementation.*
*Valid independent of any language, framework, database, interface, or deployment model.*
