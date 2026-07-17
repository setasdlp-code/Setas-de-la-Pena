---
title: SdP Field OS — Conceptual Data Model
document_id: PDATA-001
authority: product-architecture
category: product-architecture
version: 1.0
last_reviewed: 2026-07-05
status: active
governed_by:
  - PRODUCT_CANON.md
  - PRODUCT_ARCHITECTURE.md
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
references:
  - ../knowledge_base/00_project/IDENTIFIER_STANDARD.md
supersedes: null
superseded_by: null
---

# DATA_MODEL — SdP Field OS

## Conceptual Information Model — v1.0

---

## 0. Nature and scope

This document defines **the language of the product** — every persistent concept that exists inside SdP Field OS, what identifies it, how the concepts relate, and how they preserve operational memory. It is a *conceptual information model*, not a database schema, ER diagram, API specification, or software architecture. It names no storage, format, or technology and is written to remain valid if the software is rewritten entirely.

It is **derived from and subordinate to** the approved governance: PRODUCT_CANON (PC-01 … PC-12), PRODUCT_ARCHITECTURE (INV-1 … INV-11, §1–§8), the three Accepted ADRs, and PRODUCT_ASSUMPTIONS. It introduces no new entity beyond what governance supports, no new principle, and no new decision. Where a concept rests on a `Proposed` assumption, this document marks it open rather than settling it (PC-09, PC-10).

After reading this document, an engineering team should understand exactly *what exists* inside Field OS before making any implementation decision.

---

## 1. Data model principles

Every principle below is derived; none is invented here.

**DM-1 — Identity precedes state.** A persistent concept acquires a stable identity before any state is attributed to it. Nothing is recorded about an object that does not first exist as an identified object. *(PC-01; ARCHITECTURE INV-2, §5.1 Identity module; IDENTIFIER_STANDARD §3.)*

**DM-2 — History is append-only and immutable.** Recorded facts are added, never altered or removed. A correction is a new fact that supersedes, not an edit of the old one. *(PC-11; ARCHITECTURE INV-3; IDENTIFIER_STANDARD §11.2.)*

**DM-3 — State is derived, never a replacement for history.** Current state is a reading computed from the accumulated events; storing "the current truth" never overwrites the events it came from. *(PC-11; ARCHITECTURE INV-4, §5.3.)*

**DM-4 — Evidence precedes interpretation.** The model records *what happened* as fact, kept distinct from any interpretation of it; interpretation is downstream and never mutates the evidence. *(PC-03, PC-09; ARCHITECTURE INV-5, §4.)*

**DM-5 — Relationships are first-class concepts.** A relationship between two entities carries meaning, ownership, and persistence of its own, and is modeled explicitly rather than as an afterthought of the entities it joins. *(ARCHITECTURE §3; IDENTIFIER_STANDARD §6 parent-child chain.)*

**DM-6 — Knowledge remains external.** Cultivation knowledge, recipes, genetic identity, and environmental control are referenced, never owned. The model holds *pointers* to them, not authority over them. *(PC-07, PC-08; ARCHITECTURE INV-7, §6.)*

**DM-7 — Field OS records only operational evidence.** The only entities the model *owns* are the operational objects, the events that happen to them, and their derived state. Everything else is a reference. *(PC-06; ARCHITECTURE INV-6, §6.)*

**DM-8 — Persistent identity is permanent and non-reassignable.** An identifier, once assigned, is never modified, reused, or made to encode meaning. *(IDENTIFIER_STANDARD §11; ARCHITECTURE INV-2.)*

**DM-9 — Deferred concepts are reserved, not modeled as owned.** Concepts that belong to deferred capability (advice, monitoring, procedure enforcement) are named and reserved so the model can admit them later without reshaping, but they are not owned entities in the foundation. *(PC-04; ARCHITECTURE INV-8, §2.11.)*

**DM-10 — Fact, interpretation, and assumption stay distinct**, and nothing unvalidated is modeled as settled truth. *(PC-09, PC-10; ARCHITECTURE INV-11.)*

---

## 2. Entity catalog

Entities are grouped by ownership: **Owned** (Field OS is the authority), **Referenced** (a pointer to an object owned by a neighbouring authority), and **Reserved/Deferred** (named for the future, not owned now). Each entity gives Purpose, Identity, Owner, Lifecycle, Persistence, Relationships. No implementation fields are defined.

### A. Owned entities

#### 2.1 Container
- **Purpose.** The single physical object of production (block, bag, jar); the atomic object to which every event, state, and history entry is anchored. *(PC-01; ARCHITECTURE §2.1.)*
- **Identity.** A persistent, unique, immutable identifier under the repository Identifier Standard (§3).
- **Owner.** Field OS.
- **Lifecycle.** Enters record at creation (e.g. inoculation); accumulates events through its cultivation life; reaches a terminal event (harvest completion or disposal). Its record outlives the physical object.
- **Persistence.** Permanent; never deleted.
- **Relationships.** Child of at most one Batch; subject of Events; inherits genetic identity (Species/Strain) through its parent chain; may carry referenced Recipe, Room/Zone, Sensor, Equipment context on its events.

#### 2.2 Batch
- **Purpose.** A grouping of containers produced or handled together; organizes containers but never anchors record. *(PC-02; ARCHITECTURE §2.2.)*
- **Identity.** A persistent, unique, immutable identifier (Identifier Standard).
- **Owner.** Field OS.
- **Lifecycle.** Formed when member containers are created together; membership fixed at creation; persists as parent context.
- **Persistence.** Permanent.
- **Relationships.** Parent of many Containers; may originate batch-level Events inherited by members (loss-free inheritance is a `Proposed` assumption, DA-4 — modeled as *possible*, not assumed).

#### 2.3 Operational Event
- **Purpose.** A recorded fact of what happened — the atom of operational history and the core of what Field OS writes. Governance-named kinds include inoculation, transfer, contamination, harvest, disposal, observation. *(ADR-0001, ADR-0002; PC-11; ARCHITECTURE §2.3.)*
- **Identity.** A persistent identifier and an immutable position in the history of the object it is anchored to.
- **Owner.** Field OS.
- **Lifecycle.** Created at (or as faithfully near as capture allows to) the moment it occurs; immutable thereafter. A correction is a new event.
- **Persistence.** Permanent and immutable. The set of event kinds is expected bounded and enumerable (DA-2, `Proposed`) — modeled as stable-but-revisable.
- **Relationships.** Anchored to exactly one Container (or inherited from a Batch); attributed to one Operator; may reference Room/Zone, Recipe, Sensor Reading, Equipment, Knowledge as context.

#### 2.4 Observation
- **Purpose.** A recorded human perception of an object's condition — first-class because observation precedes intervention and remote decision-making depends on faithful sight of what the caretaker sees. *(CANON P-08; OP-4; ARCHITECTURE §2.4.)*
- **Identity.** A specialization of Operational Event; carries event identity.
- **Owner.** Field OS.
- **Lifecycle / Persistence.** As Operational Event: fixed at its moment, immutable, permanent. It is evidence, never interpretation.
- **Relationships.** Anchored to a Container; attributed to an Operator; may carry referenced Sensor Readings as corroboration.

#### 2.5 Harvest
- **Purpose.** The recorded outcome event of a container's productive life. *(ADR-0001; ARCHITECTURE §2.5.)*
- **Identity.** A specialization of Operational Event.
- **Owner.** Field OS.
- **Lifecycle / Persistence.** A late-stage event; immutable; permanent. A container reaches harvest or disposal; a recorded failure has the same standing as a recorded success (CANON §6).
- **Relationships.** Anchored to a Container; feeds downstream (external) aggregation and knowledge.

#### 2.6 Operator (attribution)
- **Purpose.** The actor to whom recorded events are attributed and who interprets and decides; the primary decision-maker the system supports but never replaces. *(PC-12; ARCHITECTURE §2.6; IDENTIFIER_STANDARD §9.3 operator attribution.)*
- **Identity.** A persistent attribution identity used to sign events. This document models the Operator only as *authorship and accountability*; a roles/permissions/concurrency model is **not** defined here because single-user (US-1, US-3) and multi-user (GR-2) are `Proposed`.
- **Owner.** Field OS owns the attribution; the human is not a Field OS object.
- **Lifecycle / Persistence.** The attribution persists, immutable, with each event it signed.
- **Relationships.** Author of Events and Observations; the party Evidence and Knowledge serve.

### B. Referenced entities *(read-only pointers; authority is external — DM-6, PC-08, ADR-0003)*

#### 2.7 Recipe Reference
- **Purpose.** A pointer to a recipe/formulation owned by the Recipe & Formulation Engine (the substrate simulator of ADR-0003). Records *that* a container was prepared to a recipe; never computes or owns it. *(PC-07, PC-08; ARCHITECTURE §2.8.)*
- **Identity.** The external recipe's own identity, held as a reference on the event that used it.
- **Owner.** External (Recipe & Formulation Engine). Field OS owns only the reference.
- **Lifecycle / Persistence.** Bound at preparation; the reference persists immutably on its event; the recipe's own lifecycle is external.
- **Relationships.** Attached to preparation Events on Containers/Batches.

#### 2.8 Sensor Reading
- **Purpose.** Environmental data from the Automation Layer, used to situate events; Field OS may reference/ingest but never commands hardware. *(PC-08; IN-2; ARCHITECTURE §2.9.)*
- **Identity.** The reading's source identity/time, held as context.
- **Owner.** External (Automation Layer). Trustworthiness is a `Proposed` assumption (IN-3) — referenced as context, not owned truth.
- **Lifecycle / Persistence.** Once attached to an immutable event, the referenced reading persists with it.
- **Relationships.** Attached as context to Events/Observations.

#### 2.9 Room / Zone
- **Purpose.** The physical location where an event occurred — context, never the anchor (a zone is a location, not a produced object; rejected as unit of record). *(ADR-0001; ARCHITECTURE §2.7.)*
- **Identity.** External facility identity, referenced.
- **Owner.** External (facility/knowledge domain).
- **Lifecycle / Persistence.** The reference persists on the event that used it; the zone definition is external.
- **Relationships.** Referenced by Events as the "where."

#### 2.10 Equipment
- **Purpose.** A referenced piece of infrastructure involved in an event (e.g. the vessel or instrument of a handling step). Equipment specifications live in the knowledge/equipment domain, not in Field OS.
- **Identity.** External equipment identity (Identifier Standard infrastructure prefix), referenced.
- **Owner.** External. Field OS never owns equipment definitions or state (PC-08).
- **Lifecycle / Persistence.** The reference persists on its event; equipment's own lifecycle is external.
- **Relationships.** Referenced as context by Events.

#### 2.11 Knowledge Reference
- **Purpose.** A first-class *pointer* from an operational record to external knowledge — a parameter, species fact, source, or (later) a lesson. It is how a record links outward without owning knowledge. *(PC-08; ARCHITECTURE §3 knowledge axis, §6.)*
- **Identity.** The external knowledge object's own identity (knowledge-record prefix, Identifier Standard §10), held as a reference.
- **Owner.** External (Knowledge System).
- **Lifecycle / Persistence.** The reference persists immutably where it was made; the knowledge's lifecycle is external.
- **Relationships.** Links Events/records to Knowledge; the direction is always Field OS → external, read-only.

#### 2.12 Species / Strain (genetic identity)
- **Purpose.** The biological identity a container carries. Per the Identifier Standard, genetic identity is **not** encoded in the operational identifier; it is metadata held on the biological-material (Master Culture) record and **inherited through the parent-child chain**. *(IDENTIFIER_STANDARD §8.3.)*
- **Identity.** External biological-material identity, referenced/inherited — not a Field OS-owned entity.
- **Owner.** External (biological material / knowledge domain).
- **Lifecycle / Persistence.** Inherited by a container from its lineage; the reference persists via the lineage chain.
- **Relationships.** A specialized Knowledge Reference reached through Container lineage; supports biological traceability (Identifier Standard §8).

### C. Reserved / deferred concepts *(named, not owned — DM-9, PC-04)*

#### 2.13 Task / Procedure step *(deferred)*
Implies procedure enforcement, explicitly deferred (ADR-0002). Reserved so it can later read from the record without a rebuild (PC-04); **not** an owned entity in the foundation. Modeled here only to hold its place.

#### 2.14 AI Review / Interpretation artifact *(deferred)*
An interpretation produced by *reading* the record (repository maturation path: record → daily AI review → lesson). Interpretation follows evidence and never precedes or rewrites it (PC-09, PC-03). Largely deferred (AI-1, AI-2 `Proposed`); its output may re-enter as new evidence, but the interpretation layer is downstream and owns nothing in the record.

---

## 3. Identity model

**Entity identifiers.** Every owned persistent entity (Container, Batch, Operational Event and its specializations, Operator attribution) carries a unique, permanent identifier governed by the repository **Identifier Standard** (`00_project/IDENTIFIER_STANDARD.md`). This document does **not** define formats; the Standard owns the format (`PREFIX-XXXX`), the registry of prefixes, and the assignment rules.

**Identity lifetime.** An identifier is assigned when the entity enters record and lives forever — it persists after the physical object is gone and after the entity reaches a terminal state (DM-1, DM-8; Identifier Standard §11.1 permanence).

**Identity stability.** An identifier is immutable and non-encoding: never modified, corrected, reformatted, reused, or made to carry meaning, even to fix an error (DM-8; Identifier Standard §11.2 immutability, §11.3 non-reassignment, §11.4 non-encoding). Because identity never encodes state, state may change freely without touching identity (this is what makes DM-1 and DM-3 coexist).

**Identity ownership.** Field OS owns the identity of the *operational* entities it creates (Containers, Batches, Events, Operator attribution). It does **not** mint identity for referenced entities — Recipe, Sensor, Room/Zone, Equipment, Knowledge, Species/Strain keep the identity assigned by their owning authority (DM-6, DM-7).

**Relationship with repository identifiers.** Field OS identity is a *use* of the single repository Identifier Standard, not a parallel scheme (RE-3 — the adequacy of the Standard for containers is a `Proposed` assumption; the model therefore *uses* the Standard and flags any gap as an open question rather than inventing an extension). Genetic identity (Species/Strain) is inherited through the Standard's parent-child chain and stored as biological-material metadata, never in the operational identifier (Identifier Standard §8.3).

---

## 4. Relationship model

Relationships are first-class (DM-5). Each is described by Type, Meaning, Cardinality, Ownership, Persistence, and Traceability implication.

**R-1 — Batch ⟶ Container (parent–child).**
- *Meaning.* A batch groups containers; the container remains the anchor of record. *Cardinality.* one Batch to many Containers; a Container belongs to at most one Batch. *Ownership.* Field OS. *Persistence.* permanent. *Traceability.* enables batch-level aggregation without ever raising the anchor above the container (PC-02, ADR-0001).

**R-2 — Operational Event ⟶ Container (anchoring / historical).**
- *Meaning.* every recorded fact happens to exactly one object; the ordered set of a container's events *is* its history. *Cardinality.* many Events to one Container. *Ownership.* Field OS. *Persistence.* permanent, immutable, append-only. *Traceability.* the spine of operational memory (PC-11, INV-3).

**R-3 — Batch-level Event ⟶ member Containers (inherited historical).**
- *Meaning.* an event logged once at batch level applies to its members. *Cardinality.* one Event to many Containers. *Ownership.* Field OS. *Persistence.* permanent. *Traceability.* reduces per-object capture where events are truly uniform — but loss-free inheritance is `Proposed` (DA-4), so the relationship is modeled as *available*, not assumed universal.

**R-4 — Operational Event ⟶ Operator (attribution).**
- *Meaning.* every fact is attributed to the actor who recorded it. *Cardinality.* many Events to one Operator. *Ownership.* Field OS. *Persistence.* permanent, immutable with the event. *Traceability.* preserves accountability (PC-12; Identifier Standard §9.3).

**R-5 — Operational Event ⟶ referenced context (Recipe / Sensor / Room / Equipment).**
- *Meaning.* an event cites the formulation, conditions, location, or infrastructure under which it happened. *Cardinality.* many Events to many references. *Ownership.* the reference is Field OS's; the referenced object is external. *Persistence.* the reference persists immutably on the event. *Traceability.* situates a fact in its operational context without importing external authority (PC-07, PC-08; ARCHITECTURE §3 operational axis).

**R-6 — Record ⟶ Knowledge (knowledge relationship).**
- *Meaning.* a record points outward to a parameter, source, or lesson. *Cardinality.* many records to many knowledge objects. *Ownership.* the reference is Field OS's; knowledge is external. *Persistence.* the reference persists where made. *Traceability.* always Field OS → external, read-only; never inward ownership (PC-08; ARCHITECTURE §3 knowledge axis).

**R-7 — Container ⟶ Species/Strain (lineage / genetic traceability).**
- *Meaning.* a container inherits biological identity through its lineage chain. *Cardinality.* many Containers to one genetic identity. *Ownership.* external (biological material). *Persistence.* via the parent-child chain. *Traceability.* biological traceability inherited, not re-declared per object (Identifier Standard §8).

---

## 5. Lifecycle model

For each owned entity: Creation, Evolution, State transitions, Retirement, Historical preservation, Deletion policy. No implementation.

**Container.** *Creation* — enters record at inoculation/creation with an assigned identity. *Evolution* — accumulates events; its state advances through cultivation stages as read from those events. *State transitions* — stage/location/condition change as new events arrive; transitions are *derived*, never stored as overwrites (DM-3). *Retirement* — a terminal event (harvest completion or disposal) closes its productive life. *Historical preservation* — full event history retained after retirement and after the physical object is gone. *Deletion policy* — never deleted (PC-11; Identifier Standard permanence).

**Batch.** *Creation* — formed when members are created together. *Evolution* — may accrue batch-level events. *State transitions* — derived from members' and batch-level events. *Retirement* — reached when all members are retired. *Historical preservation* — persists as the durable grouping of members' histories. *Deletion policy* — never deleted.

**Operational Event (incl. Observation, Harvest).** *Creation* — recorded at its moment. *Evolution* — none; an event never changes (DM-2). *State transitions* — not applicable; supersession is a *new* event. *Retirement* — none; events do not retire. *Historical preservation* — permanent and immutable. *Deletion policy* — never deleted or edited; corrections are additive.

**Operator (attribution).** *Creation* — established as an attribution identity. *Evolution* — none to the attribution itself. *State transitions* — none modeled (no roles/permissions here). *Retirement* — an attribution may cease to be used but its signed events persist. *Historical preservation* — every authored event retains its attribution. *Deletion policy* — never deleted.

**Referenced entities** do not have a Field OS lifecycle; only their *references* persist, immutably, on the events that used them. Their own lifecycles belong to their owning authorities.

---

## 6. State model

**Current state.** What is presently true of an object (its stage, location, condition). It is a **derived reading**, computed from the object's accumulated events (DM-3; INV-4).

**Historical state.** What was true at any past moment — reconstructable by reading the event history up to that moment. Because history is immutable, historical state is stable and reproducible (DM-2).

**Derived state.** Any view — current or historical, per-container or per-batch — produced by projecting events. Derivation reads history; it never writes back into it (INV-4). Batch state is derived by aggregating member histories plus batch-level events.

**Immutable history.** The append-only sequence of events is the single source from which all state is derived. It is never edited; it only grows (DM-2; PC-11).

**Temporary state.** Information in the act of capture that has **not yet** been committed as an event. It is provisional and holds no evidentiary standing until promoted to an immutable event (Identifier Standard §2 exempts un-promoted temporary observations). Once promoted, it becomes permanent history; if discarded before promotion, it never entered the record.

**How state is derived from events.** For any object, order its events by their recorded moments and fold them into a projection: each event advances the reading. The projection is the state; the events remain the truth. Two readers folding the same history obtain the same state, and any past state can be recovered by folding a prefix of the history. This is the mechanism that lets current state be useful while history stays authoritative (PC-11; ARCHITECTURE §5.3).

---

## 7. Information flow

Derived from PRODUCT_ARCHITECTURE §4; Field OS owns only the upstream portion.

```
Observation / operational moment
        ↓   faithful, low-friction capture (DM-... PC-05)
Operational Event                       ── owned
        ↓   append-only (DM-2)
Operational Record  (per-object history) ── owned
        ↓   aggregated across objects
Operational History (batch / operation)  ── owned
        ↓   ──────────  boundary of what Field OS owns  ──────────
Evidence            ── the history offered for review; evidence precedes interpretation (DM-4)
        ↓   interpretation (human review; later AI review) — downstream, non-mutating
Knowledge System    ── external authority (DM-6, PC-08)
        ↓
Future operational decisions   ── made by the operator, supported not replaced (PC-12)
        ↓
Future operations   ── generate new observations, closing the loop
```

Load-bearing properties, all derived: Field OS owns only through Operational History; the flow never reverses into the record (downstream artifacts may *become new events* but never edit prior ones); and everything past Evidence is deferred capability (ADR-0002) partly resting on `Proposed` assumptions — the model guarantees only that the record is shaped so those steps can read from it (PC-04).

---

## 8. Entity dependencies

For each entity: Depends on · Creates · Consumes · References · Never owns · Future modules depending on it.

| Entity | Depends on | Creates | Consumes | References | Never owns | Future modules |
|--------|-----------|---------|----------|-----------|------------|----------------|
| Container | Identity model; Batch (optional parent) | its Event history | assigned identity | Recipe, Room, Sensor, Equipment, Species/Strain | knowledge, recipes, control | MODULE_MAP, USER_WORKFLOWS |
| Batch | Identity model | grouping context; batch-level events | member containers | — | the container's role as anchor | MODULE_MAP, USER_WORKFLOWS |
| Operational Event | Container (anchor); Operator (author) | operational history | identity, context refs | Recipe, Sensor, Room, Equipment, Knowledge | the referenced objects | MODULE_MAP, USER_WORKFLOWS, TECHNICAL_ARCHITECTURE |
| Observation | Operational Event | evidence | perception + optional Sensor refs | Sensor Reading | interpretation | USER_WORKFLOWS |
| Harvest | Operational Event; Container | outcome evidence | — | — | downstream aggregation | USER_WORKFLOWS |
| Operator (attribution) | Identity model | event attribution | — | — | a permissions/roles model (open) | USER_WORKFLOWS |
| Recipe Reference | Recipe & Formulation Engine | a reference on events | external recipe identity | the recipe | recipe/formulation logic | MODULE_MAP, TECHNICAL_ARCHITECTURE |
| Sensor Reading | Automation Layer | a reference on events | external sensor data | the reading | sensor data / control | TECHNICAL_ARCHITECTURE |
| Room / Zone | facility domain | a reference on events | external location identity | the zone | facility definition | MODULE_MAP |
| Equipment | equipment/knowledge domain | a reference on events | external equipment identity | the equipment | equipment definition | MODULE_MAP |
| Knowledge Reference | Knowledge System | outward links | external knowledge identity | the knowledge object | knowledge | MODULE_MAP, TECHNICAL_ARCHITECTURE |
| Species / Strain | biological-material lineage | inherited identity | genetic metadata | Master Culture record | genetic authority | USER_WORKFLOWS |
| Task *(deferred)* | — | — | — | (future) record | — (reserved) | ROADMAP, MODULE_MAP |
| AI Review *(deferred)* | Operational Record | interpretations (later evidence) | history + knowledge | record, knowledge | the record | ROADMAP, MODULE_MAP |

---

## 9. Traceability matrix

For each entity: supporting Canon principle(s), ADR(s), PRODUCT_ARCHITECTURE section(s), and dependent future documents.

| Entity | PRODUCT_CANON | ADR(s) | PRODUCT_ARCHITECTURE | Dependent future documents |
|--------|---------------|--------|----------------------|-----------------------------|
| Container | PC-01, PC-02, PC-11 | ADR-0001 | §2.1, §3, INV-1/2 | `MODULE_MAP`, `USER_WORKFLOWS`, `TECHNICAL_ARCHITECTURE` |
| Batch | PC-02 | ADR-0001 | §2.2, §3 | `MODULE_MAP`, `USER_WORKFLOWS` |
| Operational Event | PC-03, PC-11 | ADR-0001, ADR-0002 | §2.3, §4, INV-3/5 | `MODULE_MAP`, `USER_WORKFLOWS`, `TECHNICAL_ARCHITECTURE` |
| Observation | PC-03, PC-05, PC-09 | ADR-0002 | §2.4 | `USER_WORKFLOWS` |
| Harvest | PC-11 | ADR-0001 | §2.5 | `USER_WORKFLOWS` |
| Operator (attribution) | PC-12 | ADR-0002, ADR-0003 | §2.6, INV-10 | `USER_WORKFLOWS` |
| Recipe Reference | PC-07, PC-08 | ADR-0003 | §2.8, §6 | `MODULE_MAP`, `TECHNICAL_ARCHITECTURE` |
| Sensor Reading | PC-08 | ADR-0003 | §2.9, §6 | `TECHNICAL_ARCHITECTURE` |
| Room / Zone | PC-08 | ADR-0001, ADR-0003 | §2.7 | `MODULE_MAP` |
| Equipment | PC-08 | ADR-0003 | §2.10 (ref. §6) | `MODULE_MAP` |
| Knowledge Reference | PC-08 | ADR-0003 | §3, §6 | `MODULE_MAP`, `TECHNICAL_ARCHITECTURE` |
| Species / Strain | PC-08 | ADR-0003 | §3 (knowledge axis) | `USER_WORKFLOWS` |
| Identity model | PC-01, PC-11 | ADR-0001 | §5.1, INV-2; Identifier Standard | all future engineering docs |
| Relationships (first-class) | PC-01, PC-02, PC-11 | ADR-0001, ADR-0003 | §3 | `MODULE_MAP`, `TECHNICAL_ARCHITECTURE` |
| State (derived) | PC-11 | ADR-0002 | §1, §5.3, INV-4 | `TECHNICAL_ARCHITECTURE` |
| Deferred concepts (Task, AI Review) | PC-04 | ADR-0002 | §2.11, §5.6, INV-8 | `ROADMAP`, `MODULE_MAP` |

---

*Document version: 1.0*
*Effective date: 2026-07-05*
*Authority: Field OS product architecture (information model)*
*Governed by: PRODUCT_CANON.md, PRODUCT_ARCHITECTURE.md, ADR-0001, ADR-0002, ADR-0003, PRODUCT_ASSUMPTIONS.md*
*References: knowledge_base/00_project/IDENTIFIER_STANDARD.md*
*Derived only from approved governance. Defines conceptual product entities, not database entities. Introduces no new entity, principle, or decision.*
*Valid independent of any language, framework, database, interface, or deployment model.*
