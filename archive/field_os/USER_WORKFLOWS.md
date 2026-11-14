---
title: SdP Field OS — User Workflows
document_id: PFLOW-001
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
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
---

# USER_WORKFLOWS — SdP Field OS

## Operational Workflows — v1.0

---

## 0. Nature and scope

This document defines **how humans interact with Field OS at the workflow level** — each workflow expressed as a sequence of *intention → input → system responsibility → resulting record*. It is not a screen map, UI design, software architecture, or a checklist SOP. It names no screen, button, layout, framework, database, or implementation, and it describes no visual interface.

Its purpose is to define **how Field OS captures operational reality through human use while preserving traceability and append-only history**. It introduces no new module (MODULE_MAP is fixed), no new entity, no new principle, and no AI decision-making.

It is derived from and subordinate to the approved governance (PRODUCT_CANON PC-01 … PC-12, PRODUCT_ARCHITECTURE, DATA_MODEL, MODULE_MAP, the three ADRs, PRODUCT_ASSUMPTIONS). Where a workflow rests on a `Proposed` assumption, it is marked open (PC-09, PC-10).

---

## 1. Workflow grammar and shared rules

**Roles.** Two roles appear. The **Operator (on-site caretaker)** performs physical work and records it. The **Reviewer (remote operator)** reads and reviews the record. These roles come from the operating model (US-1, US-3) and are `Proposed`; this document uses them as *who does what*, and does **not** fix a permissions, concurrency, or multi-user model (GR-2 open). Every recorded action is attributed to an operator identity (accountability, PC-12).

**Every workflow is a sequence:** an *intention* a human holds → the *input* they supply → the *system responsibility* Field OS discharges → the *resulting record* (or, for reviews, the read-only understanding). Field OS records; the human decides (PC-12).

**Shared rules that bind every workflow below:**

- **Identity first.** Nothing is recorded about an object that is not first identified (DM-1; Identity & Registry). A workflow that cannot resolve the required identifier cannot anchor its record.
- **Append-only, immutable.** Every captured fact becomes an immutable event; corrections are new events, never edits (PC-11; DM-2).
- **Faithful, low-friction capture.** Capture records what is real with minimal burden; it never blocks the operation to demand more than traceability requires (PC-05).
- **Never fabricate.** Missing information is never invented. Field OS records what is known, marks what is absent, and asks for more **only** when the gap affects traceability, safety, operational decisions, or confidence (repository AI-agent discipline; PC-09). Uncommitted input holds no evidentiary standing until promoted to an event (DM temporary state, DATA_MODEL §6).
- **Reference, never own.** Any external context (recipe, sensor, knowledge, location, equipment) enters only as a read-only reference; Field OS never authors or commands it (PC-07, PC-08; ADR-0003).
- **Interpretation is deferred and downstream.** No workflow advises, prescribes, enforces, or acts automatically. Deferred AI/automation may later *read* the resulting records but never precedes or rewrites them (PC-03, PC-04, PC-09; ADR-0002).

Each workflow states its Deferred AI/automation behavior and its Failure/incomplete-data handling explicitly; where they simply apply the shared rules, that is noted.

---

## 2. Workflows

### WF-1 — Register a new container
- **User role.** Operator (on-site).
- **Operational context.** A new physical object (block, bag, jar) is created, typically at inoculation.
- **Trigger.** A container comes into existence and must enter the record.
- **Goal.** Bring the container into record with a permanent identity from inception.
- **Required identifiers.** A new **Container** identifier (Identifier Standard); operator attribution; optional parent **Batch** identifier; inherited **Species/Strain** lineage reference; optional **Recipe** reference.
- **Required modules.** Identity & Registry, Capture / Ledger, Containers; optionally Knowledge Boundary (lineage) and Recipe & Formulation Boundary.
- **Input information.** The creation moment; the biological lineage the container inherits; optional batch membership; optional recipe reference.
- **System responsibilities.** Assign an immutable, non-encoding identity; record an immutable creation event anchored to the container; attach optional references; begin the container's history.
- **Output records.** A Container entity with identity; a creation Operational Event.
- **Traceability outcome.** The container is traceable from inception; biological lineage is inherited through its parent chain (Identifier Standard §8).
- **Deferred AI/automation behavior.** None. A future advisor may later read the container's origin; nothing acts now.
- **Failure / incomplete-data handling.** If identity cannot be assigned, the container does not enter record (identity-first). If lineage that biological traceability requires is missing, flag the gap rather than fabricate it; capture may proceed with the gap marked only if traceability is not broken.
- **Supporting PRODUCT_CANON.** PC-01, PC-05, PC-11. **Supporting ADRs.** ADR-0001. **DATA_MODEL entities.** Container; Species/Strain; Recipe Reference. **MODULE_MAP modules.** Identity & Registry, Capture / Ledger, Containers.

### WF-2 — Group containers into a batch
- **User role.** Operator.
- **Operational context.** Containers are produced or handled together in a run.
- **Trigger.** A set of containers is created together and should be grouped.
- **Goal.** Form a batch with fixed membership above the container anchor.
- **Required identifiers.** A new **Batch** identifier; the member **Container** identifiers; operator attribution.
- **Required modules.** Identity & Registry, Batches, Containers, Capture / Ledger.
- **Input information.** Which containers belong to the batch, known at creation.
- **System responsibilities.** Assign batch identity; fix membership at creation; establish the Batch→Container parent relationship (R-1); enable batch-level events to be inherited by members (R-3).
- **Output records.** A Batch entity; the membership relationship; optionally batch-level events.
- **Traceability outcome.** Member histories aggregate to the batch without the batch ever becoming the anchor (PC-02).
- **Deferred AI/automation behavior.** None.
- **Failure / incomplete-data handling.** If membership is ambiguous (OP-2, DA-4 `Proposed`), record only the unambiguous members and flag the rest; never assign a container to a batch on assumption.
- **Supporting PRODUCT_CANON.** PC-02. **Supporting ADRs.** ADR-0001. **DATA_MODEL entities.** Batch; Container; R-1, R-3. **MODULE_MAP modules.** Identity & Registry, Batches, Containers.

### WF-3 — Record an observation
- **User role.** Operator.
- **Operational context.** Routine inspection or noticing a condition on an object.
- **Trigger.** A human perceives something about a container worth recording.
- **Goal.** Capture the perception as immutable evidence, distinct from any interpretation.
- **Required identifiers.** The **Container** identifier; operator attribution; optional **Sensor Reading** references.
- **Required modules.** Observations, Capture / Ledger, Operational Records; optionally Automation Boundary.
- **Input information.** The perceived condition, at its moment; optional corroborating sensor context.
- **System responsibilities.** Fix an immutable Observation event; attribute it; attach optional sensor references; append to the container's history.
- **Output records.** An Observation event.
- **Traceability outcome.** The perception is permanently anchored to a container, an operator, and a moment (observation precedes intervention).
- **Deferred AI/automation behavior.** None now. A future review capability may read observations; no automatic action is taken on any reading (repository CANON P-08; PC-09).
- **Failure / incomplete-data handling.** Record only what was perceived; never infer cause or diagnosis (PC-09). A partial observation is recorded as partial.
- **Supporting PRODUCT_CANON.** PC-03, PC-05, PC-09. **Supporting ADRs.** ADR-0002. **DATA_MODEL entities.** Observation; Sensor Reading. **MODULE_MAP modules.** Observations, Capture / Ledger, Operational Records.

### WF-4 — Record a harvest
- **User role.** Operator.
- **Operational context.** End of a container's productive life.
- **Trigger.** A harvest or a disposal occurs.
- **Goal.** Record the outcome and close the container's life.
- **Required identifiers.** The **Container** identifier; operator attribution.
- **Required modules.** Harvest, Capture / Ledger, Operational Records, Containers.
- **Input information.** The outcome (harvest or disposal) and what was faithfully observed of it.
- **System responsibilities.** Fix an immutable outcome event; mark the container's terminal transition; preserve a recorded failure with the same standing as a success (CANON §6).
- **Output records.** A Harvest/outcome event; a closed container life whose history is retained.
- **Traceability outcome.** The outcome is permanently tied to the container; failures remain visible for learning.
- **Deferred AI/automation behavior.** Yield grading and analysis are external/deferred; Field OS records the outcome only.
- **Failure / incomplete-data handling.** Record the outcome faithfully even if partial; grading against parameters is external knowledge (PC-08), not fabricated here.
- **Supporting PRODUCT_CANON.** PC-11. **Supporting ADRs.** ADR-0001. **DATA_MODEL entities.** Harvest; Container. **MODULE_MAP modules.** Harvest, Capture / Ledger, Operational Records, Containers.

### WF-5 — Attach a sensor reading / environmental context
- **User role.** Operator (or an automatic reference at capture time).
- **Operational context.** An event needs the environmental conditions under which it occurred.
- **Trigger.** A recorded event or observation should be situated in sensor context.
- **Goal.** Attach a read-only sensor reference to the event.
- **Required identifiers.** The **Event/Observation** being contextualized; the external sensor source identity.
- **Required modules.** Automation Boundary, References, Capture / Ledger.
- **Input information.** The sensor reading to reference.
- **System responsibilities.** Attach the reading as a read-only reference on the event; never command or alter the automation layer.
- **Output records.** A Sensor Reading reference bound to an immutable event.
- **Traceability outcome.** The event is situated in the conditions under which it happened, without importing control authority.
- **Deferred AI/automation behavior.** Monitoring and alerting on sensor data are deferred (ADR-0002); the seam stays read-only when that is later added (PC-04).
- **Failure / incomplete-data handling.** Sensor trustworthiness is `Proposed` (IN-3): the reading is context, not owned truth. If the reading is unavailable, the event remains valid without it.
- **Supporting PRODUCT_CANON.** PC-08. **Supporting ADRs.** ADR-0003. **DATA_MODEL entities.** Sensor Reading. **MODULE_MAP modules.** Automation Boundary, References, Capture / Ledger.

### WF-6 — Reference a recipe / formulation
- **User role.** Operator.
- **Operational context.** A container or batch is prepared to a formulation.
- **Trigger.** A preparation event needs to record which recipe was used.
- **Goal.** Record *that* a recipe was used, by reference.
- **Required identifiers.** The **Container/Batch** identifier; the external **Recipe** identity.
- **Required modules.** Recipe & Formulation Boundary, References, Capture / Ledger.
- **Input information.** The recipe reference.
- **System responsibilities.** Attach the recipe as a read-only reference on the preparation event; never compute or own a formulation.
- **Output records.** A Recipe Reference bound to a preparation event.
- **Traceability outcome.** Preparation is linked to the formulation authority; the recipe's own truth stays external (no competing source).
- **Deferred AI/automation behavior.** None.
- **Failure / incomplete-data handling.** If the recipe identity is unknown, record the preparation event and flag the missing reference rather than fabricate one (PC-08, PC-09).
- **Supporting PRODUCT_CANON.** PC-07, PC-08. **Supporting ADRs.** ADR-0003. **DATA_MODEL entities.** Recipe Reference. **MODULE_MAP modules.** Recipe & Formulation Boundary, References, Capture / Ledger. *(Term "Recipe & Formulation Engine" rename is a pending ADR-0003 amendment proposal, not adopted.)*

### WF-7 — Review container history
- **User role.** Reviewer (remote operator) or Operator.
- **Operational context.** Understanding what happened to a specific container.
- **Trigger.** A need to see a container's full record and current condition.
- **Goal.** Read the container's complete history and derived state.
- **Required identifiers.** The **Container** identifier.
- **Required modules.** Review / Query, Operational Records, References.
- **Input information.** Which container to review.
- **System responsibilities.** Project the container's events into an ordered history and a derived state, read-only; present referenced context beside the record.
- **Output records.** **None** — review is read-only and creates no record. Any decision that results is captured separately as a new event (see WF-9/WF-10).
- **Traceability outcome.** The full, immutable lineage of events for the container is visible and reproducible.
- **Deferred AI/automation behavior.** Advisory surfacing is deferred; review shows evidence, not advice (PC-04).
- **Failure / incomplete-data handling.** Gaps in history are shown as gaps, never filled by inference (PC-09, DM-3).
- **Supporting PRODUCT_CANON.** PC-11, PC-12. **Supporting ADRs.** ADR-0002. **DATA_MODEL entities.** Operational Record; State model. **MODULE_MAP modules.** Review / Query, Operational Records.

### WF-8 — Review batch history
- **User role.** Reviewer or Operator.
- **Operational context.** Understanding a batch as a whole.
- **Trigger.** A need to see aggregated batch activity and state.
- **Goal.** Read the batch's aggregated history and derived state.
- **Required identifiers.** The **Batch** identifier (resolving to member **Container** identifiers).
- **Required modules.** Review / Query, Operational Records, Batches.
- **Input information.** Which batch to review.
- **System responsibilities.** Aggregate member histories plus batch-level events into a batch view, read-only, without raising the batch above the container as anchor.
- **Output records.** None (read-only).
- **Traceability outcome.** Batch-level understanding that always resolves back to individual container histories.
- **Deferred AI/automation behavior.** Deferred; no batch-level advice or scoring now.
- **Failure / incomplete-data handling.** Ambiguous membership (DA-4 `Proposed`) is shown as ambiguous; aggregation never assumes membership.
- **Supporting PRODUCT_CANON.** PC-02, PC-11. **Supporting ADRs.** ADR-0001, ADR-0002. **DATA_MODEL entities.** Batch; R-1, R-3. **MODULE_MAP modules.** Review / Query, Operational Records, Batches.

### WF-9 — Produce an operational review
- **User role.** Reviewer (remote operator).
- **Operational context.** Periodic retrospective across the operation (the review the ledger exists to serve).
- **Trigger.** A review cadence or a need to understand the operation's state.
- **Goal.** See a faithful, evidence-based account of what happened across a scope, to support decisions.
- **Required identifiers.** The review scope (an operation-wide or time-bounded set of **Container/Batch** identifiers).
- **Required modules.** Review / Query, Operational Records, References (and Knowledge Boundary for side-by-side context).
- **Input information.** The scope to review.
- **System responsibilities.** Aggregate the relevant evidence read-only and present it beside referenced knowledge; support the human's judgment without making it (PC-12).
- **Output records.** The review itself is read-only understanding and creates no record. If the operator reaches a decision or a lesson, that is captured as a **new** event/evidence through Capture — it never overwrites the record it read (PC-09; DM-2).
- **Traceability outcome.** Decisions become traceable to the evidence that informed them, as new events, preserving the fact→decision chain.
- **Deferred AI/automation behavior.** An AI-generated review is deferred (AI-1, AI-2 `Proposed`); when added it will read the same evidence and produce interpretation that re-enters only as new evidence (PC-04, PC-09). No automated decision is made.
- **Failure / incomplete-data handling.** The review reflects the evidence that exists; missing evidence is presented as absent, never inferred.
- **Supporting PRODUCT_CANON.** PC-03, PC-09, PC-12. **Supporting ADRs.** ADR-0002. **DATA_MODEL entities.** Operational Record; State model. **MODULE_MAP modules.** Review / Query, Operational Records, Knowledge Boundary.

### WF-10 — Flag an item for future interpretation
- **User role.** Operator or Reviewer.
- **Operational context.** Something warrants later analysis but no decision is made now (observation precedes intervention).
- **Trigger.** An anomaly or item of interest is noticed.
- **Goal.** Mark an item so future interpretation can find it, **without** deciding or acting now.
- **Required identifiers.** The target **Container** or **Event** identifier; operator attribution.
- **Required modules.** Capture / Ledger, Operational Records; reserved for later reading by AI Interpretation.
- **Input information.** What is being flagged and why (as recorded fact, not diagnosis).
- **System responsibilities.** Record the flag as an immutable evidence marker anchored to its target; take no automatic action and reach no conclusion.
- **Output records.** A flag event (a marker kind of Operational Event/Observation) in the record.
- **Traceability outcome.** The item is permanently marked and discoverable by later interpretation, with its author and moment preserved.
- **Deferred AI/automation behavior.** The deferred AI Interpretation module may later read flags (PC-04); it does not act now, and flagging creates no task and triggers no automation (per instruction: no task automation yet).
- **Failure / incomplete-data handling.** If the target cannot be identified, the flag cannot be anchored (identity-first); record what is known and request the identifier only if traceability requires it.
- **Supporting PRODUCT_CANON.** PC-04, PC-09. **Supporting ADRs.** ADR-0002. **DATA_MODEL entities.** Operational Event/Observation; AI Review (deferred consumer). **MODULE_MAP modules.** Capture / Ledger, Operational Records, AI Interpretation (deferred).

---

## 3. Workflow traceability roll-up

| # | Workflow | Role | Output record | PRODUCT_CANON | ADR(s) | MODULE_MAP modules |
|---|----------|------|---------------|---------------|--------|--------------------|
| WF-1 | Register a new container | Operator | Container + creation event | PC-01, PC-05, PC-11 | ADR-0001 | Identity & Registry, Capture, Containers |
| WF-2 | Group into a batch | Operator | Batch + membership | PC-02 | ADR-0001 | Identity & Registry, Batches, Containers |
| WF-3 | Record an observation | Operator | Observation event | PC-03, PC-05, PC-09 | ADR-0002 | Observations, Capture, Records |
| WF-4 | Record a harvest | Operator | Harvest/outcome event | PC-11 | ADR-0001 | Harvest, Capture, Records, Containers |
| WF-5 | Attach sensor context | Operator | Sensor reference on event | PC-08 | ADR-0003 | Automation Boundary, References, Capture |
| WF-6 | Reference a recipe | Operator | Recipe reference on event | PC-07, PC-08 | ADR-0003 | Recipe & Formulation Boundary, References, Capture |
| WF-7 | Review container history | Reviewer/Operator | none (read-only) | PC-11, PC-12 | ADR-0002 | Review / Query, Records |
| WF-8 | Review batch history | Reviewer/Operator | none (read-only) | PC-02, PC-11 | ADR-0001, ADR-0002 | Review / Query, Records, Batches |
| WF-9 | Produce an operational review | Reviewer | none; decisions captured as new events | PC-03, PC-09, PC-12 | ADR-0002 | Review / Query, Records, Knowledge Boundary |
| WF-10 | Flag for future interpretation | Operator/Reviewer | flag event | PC-04, PC-09 | ADR-0002 | Capture, Records, AI Interpretation (deferred) |

Two properties hold across all ten workflows: every workflow that writes does so through the single write path **Identity → Capture → Records** and produces only immutable, append-only records (PC-11, PC-06); and no workflow interprets, advises, or acts automatically — interpretation is deferred and may only read the resulting records later (PC-03, PC-04, PC-09).

---

*Document version: 1.0*
*Effective date: 2026-07-05*
*Authority: Field OS product architecture (user workflows)*
*Governed by: PRODUCT_CANON.md, PRODUCT_ARCHITECTURE.md, DATA_MODEL.md, MODULE_MAP.md, ADR-0001, ADR-0002, ADR-0003, PRODUCT_ASSUMPTIONS.md*
*Describes operational workflows as intention → input → system responsibility → resulting record. No screens, UI, implementation, or AI decision-making. Introduces no new module, entity, or principle.*
*Valid independent of any language, framework, database, interface, or deployment model.*
