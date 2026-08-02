---
title: SdP Field OS — Conceptual Module Map
document_id: PMOD-001
authority: product-architecture
category: product-architecture
version: 1.1
last_reviewed: 2026-07-27
status: active
governed_by:
  - PRODUCT_CANON.md
  - PRODUCT_ARCHITECTURE.md
  - DATA_MODEL.md
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - ADR-0004_V1_Scope_Expansion.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
amendment_log:
  - "v1.0 → v1.1 (2026-07-27): added §4.5 Monitoring / Climate Alert, §5.2 Role-Scoped Presentation, §5.3 Inventory Visibility — all per ADR-0004, each with an explicit caveat (IN-3 and GR-2 remain Proposed; inventory data was initially mocked)."
  - "v1.1 (2026-07-27, same day): §5.3 updated — /api/inventory shipped as a real store, replacing the mock. Caveat updated: the store is real, but stock quantities are operator-entered and unaudited (no history of changes, no reconciliation)."
---

# MODULE_MAP — SdP Field OS

## Conceptual Module Map — v1.0

---

## 0. Nature and scope

This document defines the **conceptual modules** of SdP Field OS — the clusters of responsibility required to operate the information model in DATA_MODEL.md. It is not UI design, software architecture, a screen map, or a database design. It names no screen, navigation, frontend, backend, or technology, and it is written to remain valid if the software is rewritten.

Its single purpose is to fix **what each part of Field OS is responsible for**, so that future UI and technical architecture can be built without confusing responsibilities.

**A module is not an entity and not a screen.** DATA_MODEL entities (Container, Event, …) are *what exists*; modules are *clusters of responsibility over what exists*. A "Containers module" owns the conceptual rules and lifecycle of the Container entity — it is not a table and not a page.

This document is derived from and subordinate to the approved governance (PRODUCT_CANON PC-01 … PC-12, PRODUCT_ARCHITECTURE §5 and INV-1 … INV-11, DATA_MODEL, the three ADRs, PRODUCT_ASSUMPTIONS). It introduces no new module unsupported by those documents, no new principle, and no implementation decision. Where a responsibility rests on a `Proposed` assumption, it is marked open (PC-09, PC-10).

---

## 1. Module tiers

The modules fall into five tiers by the kind of responsibility they hold. Authority flows the same way the information does (DATA_MODEL §7): identity and capture at the base, boundaries at the edges, review on top, interpretation deferred.

```
                       ┌─────────────────────────┐
   Access tier         │   Review / Query        │   (read-only, serves humans)
                       └─────────────────────────┘
   Deferred tier       │   AI Interpretation      │   (reserved by PC-04, not built)
                       └─────────────────────────┘
   Domain tier    Containers · Batches · Observations · Harvest
                  (own the conceptual lifecycle/rules of each owned entity)
   Foundation tier  Identity & Registry · Capture / Ledger · Operational Records
                  (own the mechanics of operational memory)
   Boundary tier    References ▸ Knowledge Boundary · Recipe & Formulation Boundary · Automation Boundary
                  (read-only seams to external authorities — own references, never the external objects)
```

| Module | Tier | Owns | ADR anchor |
|--------|------|------|------------|
| Identity & Registry | Foundation | identity of owned entities | ADR-0001 |
| Capture / Ledger | Foundation | the act of recording Events | ADR-0002 |
| Operational Records | Foundation | cumulative history + derived state | ADR-0002, ADR-0003 |
| Containers | Domain | Container lifecycle & anchoring rules | ADR-0001 |
| Batches | Domain | Batch grouping & inheritance rules | ADR-0001 |
| Observations | Domain | observation-as-evidence rules | ADR-0002 |
| Harvest | Domain | outcome-event rules | ADR-0001 |
| References | Boundary | reference objects (umbrella) | ADR-0003 |
| Knowledge Boundary | Boundary | Knowledge References | ADR-0003 |
| Recipe & Formulation Boundary | Boundary | Recipe References | ADR-0003 |
| Automation Boundary | Boundary | Sensor Reading references | ADR-0003 |
| Monitoring / Climate Alert *(added 2026-07-27; IN-3 `Proposed`)* | Boundary | Chamber Climate Alert | ADR-0004 |
| Review / Query | Access | nothing new (read-only) | ADR-0002 |
| Role-Scoped Presentation *(added 2026-07-27; GR-2 `Proposed`, presentation-only)* | Access | Operator Role (client-side view scoping) | ADR-0004 |
| Inventory Visibility *(added 2026-07-27; real store, unaudited quantities)* | Access | Inventory Item (read-only signal) | ADR-0004 |
| AI Interpretation | Deferred | nothing in the foundation | ADR-0002 |

---

## 2. Foundation tier

### 2.1 Identity & Registry
- **Purpose.** Establish and preserve the persistent, unique identity of every owned entity for its whole life (DM-1, DM-8).
- **Responsibilities.** Assign identity at entity creation; guarantee immutability, non-reassignment, and non-encoding of identifiers; maintain the registry of identified objects; uphold the repository Identifier Standard as the single scheme.
- **Objects owned.** The identity of Containers, Batches, Operational Events (and specializations), and Operator attribution.
- **Objects consumed.** Requests to bring a new object into record; the repository Identifier Standard (as reference).
- **Objects produced.** Identified objects other modules can refer to.
- **Inputs.** "An object must enter record."
- **Outputs.** A durable identity bound to that object.
- **Dependencies.** Repository Identifier Standard.
- **Boundaries.** Does not record events, hold history, or derive state; does not mint identity for referenced (external) entities.
- **Deferred capabilities.** None of its own; it must issue identity in a way that later deferred entities (e.g. Task) can also be identified without a new scheme (PC-04).
- **Related DATA_MODEL entities.** Identity model (§3); all owned entities.
- **Supporting PRODUCT_CANON.** PC-01, PC-11. **Supporting ADRs.** ADR-0001. *(RE-3, the adequacy of the Standard for containers, is `Proposed` — this module uses the Standard and flags gaps rather than extending it.)*

### 2.2 Capture / Ledger
- **Purpose.** Record operational Events faithfully and with low friction, as an append-only log — the core Field OS capability (ADR-0002).
- **Responsibilities.** Accept operational moments and observations; fix each as an immutable Event attributed to an Operator with its context references; append, never overwrite; treat a correction as a new event.
- **Objects owned.** The act of writing Events; the Events, Observations, and Harvests it creates.
- **Objects consumed.** Identified objects (from Identity & Registry); context references (from the Boundary tier).
- **Objects produced.** Immutable Events appended to the record.
- **Inputs.** An operational moment or observation to be recorded.
- **Outputs.** New immutable history.
- **Dependencies.** Identity & Registry; References (for context); Operational Records (as the store it feeds).
- **Boundaries.** Does not interpret, advise, prescribe, or enforce (ADR-0002); does not derive state; does not edit or delete history.
- **Deferred capabilities.** Must leave room to later capture procedure-step (Task) events and monitoring-triggered events without reshaping the log (PC-04).
- **Related DATA_MODEL entities.** Operational Event, Observation, Harvest.
- **Supporting PRODUCT_CANON.** PC-03, PC-05, PC-11. **Supporting ADRs.** ADR-0002.

### 2.3 Operational Records
- **Purpose.** Hold the cumulative history and derive current and historical state from it; this is the operational evidence Field OS owns (DM-2, DM-3; PC-06).
- **Responsibilities.** Preserve the append-only history intact; derive state as a projection of events (never a stored replacement); aggregate per-container histories into batch/operation history; offer history as evidence for review.
- **Objects owned.** The Operational Record — the cumulative, immutable history and the derived state read from it.
- **Objects consumed.** Events from Capture / Ledger.
- **Objects produced.** History views (per container, batch, operation) and derived state.
- **Inputs.** Appended Events.
- **Outputs.** History and derived state for review and (later) interpretation.
- **Dependencies.** Capture / Ledger (source of events).
- **Boundaries.** Never edited from outside; never overwrites history with state (INV-4); does not own knowledge or interpretation.
- **Deferred capabilities.** Must support later read access by monitoring and advisory capabilities without reshaping the history (PC-04).
- **Related DATA_MODEL entities.** Operational Event; State model (§6).
- **Supporting PRODUCT_CANON.** PC-06, PC-11. **Supporting ADRs.** ADR-0002, ADR-0003.

---

## 3. Domain tier

Domain modules own the **conceptual lifecycle and rules** of one owned entity family (DATA_MODEL §2, §5). They sit on the Foundation tier; they add no new storage and no screens. They exist so entity-specific rules have a clear home.

### 3.1 Containers
- **Purpose.** Own the rules that make the individual container the atomic anchor of record (PC-01).
- **Responsibilities.** Govern container creation, the anchoring of every event to exactly one container, container state as derived from its events, terminal transition (harvest/disposal), and permanent historical preservation.
- **Objects owned.** Container lifecycle and anchoring rules.
- **Objects consumed.** Container identity (Identity & Registry); events (Capture); history (Records).
- **Objects produced.** A coherent per-container history and derived state.
- **Inputs.** Container-level operational moments.
- **Outputs.** Container history and state.
- **Dependencies.** Identity & Registry, Capture, Records; Batches (optional parent).
- **Boundaries.** Never allows a coarser grouping to become the anchor (ADR-0001); never deletes a container record.
- **Deferred capabilities.** None; container-grain feasibility at scale is an open assumption (GR-1, `Proposed`).
- **Related DATA_MODEL entities.** Container.
- **Supporting PRODUCT_CANON.** PC-01, PC-02, PC-11. **Supporting ADRs.** ADR-0001.

### 3.2 Batches
- **Purpose.** Own the grouping of containers above the anchor, and the semantics of batch-level events (PC-02).
- **Responsibilities.** Govern batch formation and fixed membership at creation; define how batch-level events are inherited by member containers; derive batch state by aggregating members plus batch-level events.
- **Objects owned.** Batch lifecycle, membership, and inheritance rules.
- **Objects consumed.** Batch identity; member containers; events; history.
- **Objects produced.** Batch grouping context and aggregated history.
- **Inputs.** Batch-level operational moments; member-container creation.
- **Outputs.** Batch history and derived state.
- **Dependencies.** Identity & Registry, Capture, Records, Containers.
- **Boundaries.** Never becomes the anchor of record; inheritance must not fabricate per-container facts — loss-free inheritance is a `Proposed` assumption (DA-4), so this module treats inheritance as available, not universal.
- **Deferred capabilities.** None.
- **Related DATA_MODEL entities.** Batch; Relationship R-1, R-3.
- **Supporting PRODUCT_CANON.** PC-02. **Supporting ADRs.** ADR-0001.

### 3.3 Observations
- **Purpose.** Own the rules that make a recorded human perception first-class evidence (observation precedes intervention).
- **Responsibilities.** Govern observation capture as a kind of Event; keep observation as *evidence*, distinct from interpretation; allow corroborating referenced Sensor Readings.
- **Objects owned.** Observation-as-evidence rules.
- **Objects consumed.** Container identity; Operator attribution; optional Sensor Reading references.
- **Objects produced.** Immutable Observation events.
- **Inputs.** A caretaker's perception of an object's condition.
- **Outputs.** Observation evidence in the record.
- **Dependencies.** Capture, Records, Automation Boundary (for corroboration).
- **Boundaries.** Never converts an observation into a prescription or automatic action (PC-09; CANON P-08); never edits a recorded observation.
- **Deferred capabilities.** Observations must remain readable by later advisory/monitoring capabilities (PC-04).
- **Related DATA_MODEL entities.** Observation.
- **Supporting PRODUCT_CANON.** PC-03, PC-05, PC-09. **Supporting ADRs.** ADR-0002. *(Repository CANON P-08.)*

### 3.4 Harvest
- **Purpose.** Own the rules of the outcome event that closes a container's productive life (ADR-0001).
- **Responsibilities.** Govern harvest and disposal as recorded outcomes; preserve a recorded failure with the same standing as a recorded success (CANON §6); mark terminal transition of the container.
- **Objects owned.** Outcome-event (harvest/disposal) rules.
- **Objects consumed.** Container identity; events; history.
- **Objects produced.** Immutable Harvest/outcome events; a closed container life.
- **Inputs.** A harvest or disposal moment.
- **Outputs.** Outcome evidence feeding downstream (external) aggregation and knowledge.
- **Dependencies.** Capture, Records, Containers.
- **Boundaries.** Does not compute yield knowledge or grade against parameters — that is external knowledge (PC-08); records the outcome only.
- **Deferred capabilities.** None; downstream analysis is deferred/external.
- **Related DATA_MODEL entities.** Harvest.
- **Supporting PRODUCT_CANON.** PC-11. **Supporting ADRs.** ADR-0001.

---

## 4. Boundary tier

Boundary modules hold the **read-only reference seams** to the three neighbouring authorities (ADR-0003's three inbound reads). They own the *reference*, never the external object (PC-08). "References" is the umbrella; the three named seams are its concrete instances.

### 4.1 References *(umbrella)*
- **Purpose.** Provide operational context to events by holding read-only references to external authorities, so a fact can be situated without Field OS owning its context (PC-07, PC-08).
- **Responsibilities.** Acquire, attach, and preserve context references on events; enforce the "reference, never own" rule at the product boundary.
- **Objects owned.** Recipe References, Sensor Reading references, Room/Zone references, Equipment references, Knowledge References — the *references only*.
- **Objects consumed.** Read access to the external authorities.
- **Objects produced.** Context references for the Capture / Ledger module.
- **Inputs.** A need for context on an event.
- **Outputs.** Attachable, immutable references.
- **Dependencies.** The external authorities (read-only).
- **Boundaries.** Owns nothing external; never writes to, commands, or authors the neighbouring systems.
- **Deferred capabilities.** Reference paths must be provable before reliance — inbound read seams (IN-1) are `Proposed`; this module treats seams as required, their realization as open.
- **Related DATA_MODEL entities.** Recipe Reference, Sensor Reading, Room/Zone, Equipment, Knowledge Reference, Species/Strain.
- **Supporting PRODUCT_CANON.** PC-07, PC-08. **Supporting ADRs.** ADR-0003.

### 4.2 Knowledge Boundary
- **Purpose.** The read seam to the Knowledge System — cultivation parameters, species/strain identity, sources, lessons (PC-08; ADR-0003).
- **Responsibilities.** Hold Knowledge References that link records outward; carry inherited genetic identity (Species/Strain) via lineage; never author or own knowledge.
- **Objects owned.** Knowledge References.
- **Objects consumed.** Read access to the Knowledge System.
- **Objects produced.** Outward knowledge links on records.
- **Inputs.** A record's need to cite knowledge.
- **Outputs.** Read-only knowledge links.
- **Dependencies.** Knowledge System (read-only).
- **Boundaries.** Never becomes the authority for knowledge or parameters (AI-3); direction is always Field OS → Knowledge System.
- **Deferred capabilities.** Parameters that a future advisor would consume stay in the Knowledge System, reachable but external (PC-04, AI-3).
- **Related DATA_MODEL entities.** Knowledge Reference; Species/Strain.
- **Supporting PRODUCT_CANON.** PC-08. **Supporting ADRs.** ADR-0003.

### 4.3 Recipe & Formulation Boundary
- **Purpose.** The read seam to the Recipe & Formulation Engine (the substrate simulator of ADR-0003) — recipe and formulation logic (PC-07, PC-08).
- **Responsibilities.** Hold Recipe References that record *that* a container was prepared to a recipe; never compute or own formulations.
- **Objects owned.** Recipe References.
- **Objects consumed.** Read access to the Recipe & Formulation Engine.
- **Objects produced.** Recipe references on preparation events.
- **Inputs.** A preparation event needing a recipe reference.
- **Outputs.** Read-only recipe links.
- **Dependencies.** Recipe & Formulation Engine (read-only).
- **Boundaries.** Never computes a formulation internally (ADR-0003 alternative rejected); no competing source of recipe truth.
- **Deferred capabilities.** None.
- **Related DATA_MODEL entities.** Recipe Reference.
- **Supporting PRODUCT_CANON.** PC-07, PC-08. **Supporting ADRs.** ADR-0003. *(Terminology: "Recipe & Formulation Engine" rename is a pending ADR-0003 amendment proposal, not adopted.)*

### 4.4 Automation Boundary
- **Purpose.** The read seam to the Automation Layer (sensors and physical control) — reads sensor data, never commands hardware (PC-08; ADR-0003; IN-2).
- **Responsibilities.** Hold Sensor Reading references as context; keep control authority entirely with the automation layer.
- **Objects owned.** Sensor Reading references.
- **Objects consumed.** Read access to sensor data.
- **Objects produced.** Sensor context on events/observations.
- **Inputs.** An event/observation needing environmental context.
- **Outputs.** Read-only sensor references.
- **Dependencies.** Automation Layer (read-only).
- **Boundaries.** Never issues a control command; never becomes the controller (ADR-0003 alternative rejected). Referenced-reading trustworthiness is `Proposed` (IN-3) — referenced as context, not owned truth.
- **Deferred capabilities.** Broader monitoring/alerting beyond §4.5's narrow escalation surface remains deferred (ADR-0002); the seam must remain read-only regardless (PC-08, ADR-0003).
- **Related DATA_MODEL entities.** Sensor Reading.
- **Supporting PRODUCT_CANON.** PC-08. **Supporting ADRs.** ADR-0003.

### 4.5 Monitoring / Climate Alert *(added 2026-07-27, ADR-0004)*
- **Purpose.** Detect an unresolved climate deviation read via the Automation Boundary and escalate it after a fixed window — the first, narrow instance of the "monitor" capability ADR-0002 named but deferred.
- **Responsibilities.** Read Sensor Reading references (never own or command); derive an alert when a chamber is out of range; escalate the alert to a persistent, non-dismissable signal past a fixed unresolved window; surface escalated alerts to Review/Query.
- **Objects owned.** Chamber Climate Alert (current-state, not append-only history).
- **Objects consumed.** Sensor Reading references (Automation Boundary); Room/Zone references.
- **Objects produced.** Alert/escalation state for Review/Query to surface.
- **Inputs.** A Sensor Reading read via the Automation Boundary.
- **Outputs.** An alert, escalated past the fixed window.
- **Dependencies.** Automation Boundary (source of Sensor Reading references).
- **Boundaries.** Never commands hardware (ADR-0003 unchanged); never writes an Operational Event on the ledger — an alert is derived monitoring state, not a captured fact about a container.
- **Deferred capabilities.** Everything beyond this one escalation surface — correlating alerts with operational events, prescriptive guidance, or any control action — remains deferred (ADR-0002; PC-08, PC-09).
- **Caveat.** `IN-3` (sensor trustworthiness) remains `Proposed`, Low confidence. This module is scoped in as a logged owner risk-acceptance (ADR-0004), not because sensor trust was validated. Its output must not be presented or relied on as a validated safety signal until `IN-3` resolves.
- **Related DATA_MODEL entities.** Chamber Climate Alert (§2.16); Sensor Reading (§2.8).
- **Supporting PRODUCT_CANON.** none directly (no principle claims sensor trust). **Supporting ADRs.** ADR-0004 (scope), ADR-0003 (read-only boundary preserved).

---

## 5. Access tier

### 5.1 Review / Query
- **Purpose.** Serve the human review the record exists for — the caretaker who writes and the remote operator who reads and reviews — supporting decisions without making them (ADR-0002 "read and query in service of human review"; PC-12; US-3).
- **Responsibilities.** Provide read-only retrospective access to history, derived state, and referenced knowledge side by side, so a human can see, question, and explain what happened.
- **Objects owned.** Nothing new; read-only over owned and referenced data.
- **Objects consumed.** History and derived state (Records); references (Boundary tier).
- **Objects produced.** Human-facing understanding (not stored interpretation).
- **Inputs.** A human's need to review the operation.
- **Outputs.** Retrospective, evidence-based views (conceptual, not screens).
- **Dependencies.** Operational Records; Boundary tier.
- **Boundaries.** Never writes; never decides; never advises or prescribes (that is deferred and belongs to Interpretation). Read/write role differences (US-3) are `Proposed`, so no roles model is fixed here.
- **Deferred capabilities.** Must leave room for later advisory/monitoring surfacing to read from the same evidence without a rebuild (PC-04).
- **Related DATA_MODEL entities.** Operational Record; State model.
- **Supporting PRODUCT_CANON.** PC-12. **Supporting ADRs.** ADR-0002.

### 5.2 Role-Scoped Presentation *(added 2026-07-27, ADR-0004)*
- **Purpose.** Present a subset of modules to an Operator based on a selected Role — a first, deliberately narrow slice of the multi-user surface (`GR-2`).
- **Responsibilities.** Read the Operator's selected Role; hide modules a Role is not scoped to see in the client.
- **Objects owned.** Nothing new beyond the Role concept on Operator (DATA_MODEL §2.6). No permission or authorization object exists.
- **Objects consumed.** Operator Role (client-side selection).
- **Objects produced.** A filtered module view, in the client only.
- **Inputs.** A Role selection.
- **Outputs.** Which modules are rendered.
- **Dependencies.** None server-side — this module has no dependency on an authorization service because none exists yet.
- **Boundaries.** **Not an access-control boundary.** It changes what renders, never what an API call is permitted to do. Every ledger/photo endpoint remains reachable by any caller regardless of the Role selected in the UI.
- **Deferred capabilities.** Server-enforced roles, permissions, and concurrency control (`GR-2`) — the actual authorization model — remain entirely deferred. This module must not be mistaken for that.
- **Caveat.** `GR-2` (multi-user) remains `Proposed`, Low confidence. Scoped in as a logged owner risk-acceptance (ADR-0004) for presentation only.
- **Related DATA_MODEL entities.** Operator (§2.6, Role extension).
- **Supporting PRODUCT_CANON.** PC-12 (the operator remains the decision-maker; a Role label does not change that). **Supporting ADRs.** ADR-0004.

### 5.3 Inventory Visibility *(added 2026-07-27, ADR-0004)*
- **Purpose.** Surface a low-stock signal for Bodega insumos on Inicio — a first, narrow slice of inventory, not the full procurement/stock domain.
- **Responsibilities.** Read Inventory Item records; surface a banner when an item is below a minimum.
- **Objects owned.** Nothing beyond the Inventory Item visibility itself. Note: the underlying store (`server/inventory-store.mjs`) does provide a write path (register/update a lot's quantity) — that capability belongs to Inventory Item's own store, not to this Access-tier visibility module, which only reads and surfaces.
- **Objects consumed.** Inventory Item (§2.17), backed by a real store as of 2026-07-27 (`/api/inventory`).
- **Objects produced.** A low-stock banner for Review/Query-style surfaces.
- **Inputs.** Inventory Item stock status.
- **Outputs.** A visibility signal.
- **Dependencies.** `/api/inventory` (real, current-state store).
- **Boundaries.** Read-only from this module's perspective; not connected to Container, Batch, or Event.
- **Deferred capabilities.** Procurement, reconciliation against real purchases/consumption, and an audit trail of stock changes (today, an update overwrites in place with no history) remain out of scope.
- **Caveat.** The data source is real, not a claim that displayed quantities are accurate — they are operator-entered and unaudited (ADR-0004 required follow-up: reconciliation/audit trail).
- **Related DATA_MODEL entities.** Inventory Item (§2.17).
- **Supporting PRODUCT_CANON.** none directly. **Supporting ADRs.** ADR-0004.

---

## 6. Deferred tier

### 6.1 AI Interpretation *(deferred — reserved by PC-04)*
- **Purpose.** Later, turn the record into advice, monitoring, or lessons (advisor / monitor / procedure engine — all deferred by ADR-0002). Evidence precedes interpretation (PC-09).
- **Responsibilities (reserved).** Read the record and external knowledge; produce interpretations (e.g. AI Reviews, lessons) that may re-enter as new evidence but never rewrite the record.
- **Objects owned.** Nothing in the foundation.
- **Objects consumed.** Operational Records; external knowledge (read-only).
- **Objects produced.** Deferred interpretation artifacts, reachable from the record.
- **Inputs.** The accumulated record, once it is in reliable use.
- **Outputs.** Advice/monitoring/lessons (future).
- **Dependencies.** Operational Records; Knowledge Boundary.
- **Boundaries.** Never precedes or edits evidence (PC-09, PC-03); never becomes the decision-maker (PC-12); its deferral must not be architected out (PC-04).
- **Deferred capabilities.** The entire module — its value depends on a reliable record existing first (AI-1, AI-2, `Proposed`).
- **Related DATA_MODEL entities.** AI Review / Interpretation artifact (§2.14).
- **Supporting PRODUCT_CANON.** PC-04, PC-09. **Supporting ADRs.** ADR-0002.

---

## 7. Cross-module interactions

The only write path into history runs **Identity & Registry → Capture / Ledger → Operational Records**; nothing else writes history. The Domain tier shapes *what rules* apply to that write for each entity family but does not create a second write path. The Boundary tier feeds *context* into Capture and is otherwise read-only outward. The Access tier and Deferred tier are strictly read-only over the record; the arrow never reverses into it (INV-3, INV-4; DATA_MODEL §7). Any interpretation that matters operationally re-enters only as a *new* event through Capture, never as an edit.

This single-writer, many-reader shape is the module-level expression of "history is append-only" (PC-11) and "Field OS writes only operational evidence" (PC-06).

---

## 8. Module traceability roll-up

| Module | DATA_MODEL entities | PRODUCT_CANON | ADR(s) | Future documents |
|--------|---------------------|---------------|--------|------------------|
| Identity & Registry | all owned entities; Identity model | PC-01, PC-11 | ADR-0001 | `USER_WORKFLOWS`, `TECHNICAL_ARCHITECTURE` |
| Capture / Ledger | Event, Observation, Harvest | PC-03, PC-05, PC-11 | ADR-0002 | `USER_WORKFLOWS`, `TECHNICAL_ARCHITECTURE` |
| Operational Records | Event; State model | PC-06, PC-11 | ADR-0002, ADR-0003 | `TECHNICAL_ARCHITECTURE` |
| Containers | Container | PC-01, PC-02, PC-11 | ADR-0001 | `USER_WORKFLOWS` |
| Batches | Batch; R-1, R-3 | PC-02 | ADR-0001 | `USER_WORKFLOWS` |
| Observations | Observation | PC-03, PC-05, PC-09 | ADR-0002 | `USER_WORKFLOWS` |
| Harvest | Harvest | PC-11 | ADR-0001 | `USER_WORKFLOWS` |
| References | all referenced entities | PC-07, PC-08 | ADR-0003 | `TECHNICAL_ARCHITECTURE` |
| Knowledge Boundary | Knowledge Reference; Species/Strain | PC-08 | ADR-0003 | `TECHNICAL_ARCHITECTURE` |
| Recipe & Formulation Boundary | Recipe Reference | PC-07, PC-08 | ADR-0003 | `TECHNICAL_ARCHITECTURE` |
| Automation Boundary | Sensor Reading | PC-08 | ADR-0003 | `TECHNICAL_ARCHITECTURE` |
| Review / Query | Operational Record; State | PC-12 | ADR-0002 | `USER_WORKFLOWS`, `TECHNICAL_ARCHITECTURE` |
| AI Interpretation *(deferred)* | AI Review artifact | PC-04, PC-09 | ADR-0002 | `ROADMAP` |
| Monitoring / Climate Alert *(added 2026-07-27; IN-3 `Proposed`)* | Chamber Climate Alert | — | ADR-0004, ADR-0003 | `TECHNICAL_ARCHITECTURE` |
| Role-Scoped Presentation *(added 2026-07-27; GR-2 `Proposed`, presentation-only)* | Operator Role | PC-12 | ADR-0004 | `TECHNICAL_ARCHITECTURE` |
| Inventory Visibility *(added 2026-07-27; real store, unaudited quantities)* | Inventory Item | — | ADR-0004 | `TECHNICAL_ARCHITECTURE` |

---

*Document version: 1.1*
*Effective date: 2026-07-27 (supersedes v1.0 of 2026-07-05)*
*Authority: Field OS product architecture (module map)*
*Governed by: PRODUCT_CANON.md, PRODUCT_ARCHITECTURE.md, DATA_MODEL.md, ADR-0001, ADR-0002, ADR-0003, ADR-0004, PRODUCT_ASSUMPTIONS.md*
*Defines conceptual responsibility clusters, not screens, services, or storage. §§4.5, 5.2, 5.3 are new modules introduced by ADR-0004 (2026-07-27), each carrying its own caveat; every other module is unchanged from v1.0.*
*Valid independent of any language, framework, database, interface, or deployment model.*
