---
title: SdP Field OS — MVP-1 Architecture
document_id: PMVP-001
authority: product-implementation-blueprint
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
  - SYSTEM_INTERACTIONS.md
  - RECIPE_SIMULATOR_INTEGRATION.md
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
---

# FIELD_OS_MVP_ARCHITECTURE — SdP Field OS MVP-1

## Smallest Faithful Implementation — v1.0

---

## 0. Nature and scope

This is the implementation blueprint for **Field OS MVP-1** — the first usable version, built to be used every day in the laboratory and cultivation facility at Setas de la Peña. It designs the *smallest* system that delivers real operational value while remaining **completely faithful to the approved architecture**. It redesigns nothing: not Field OS, not the Recipe Simulator, not the Knowledge System.

MVP-1 preserves **every architectural invariant** (INV-1 … INV-11) and implements only the minimum needed to create operational memory. It prioritizes **simplicity, reliability, traceability, and speed of capture** over automation or intelligence. It assumes **one primary operator and one reviewer** and does not optimize for future scale (GR-1, GR-2 deferred).

It stays technology-agnostic: it defines capabilities, interactions, and properties (e.g. an append-only, immutable event store as a *property*, not a product), not frameworks, databases, or languages. Every capability maps to an existing DATA_MODEL entity, MODULE_MAP module, and USER_WORKFLOW.

---

## 1. Product goal

**MVP-1 exists to create a reliable, faithful record of what happened in production — the operational memory that does not exist today (OP-4; ADR-0002 ledger-first).**

It solves four real problems immediately:

1. **There is no trustworthy event history.** Today, what happened to each container lives in memory and scattered notes. MVP-1 makes every meaningful operation a captured, immutable fact.
2. **The remote reviewer is blind.** The operating model separates on-site work from remote decision-making; MVP-1 lets the reviewer see what actually happened without a phone call (US-3).
3. **There is no per-container traceability.** Contamination and divergence happen to individual objects; MVP-1 anchors every event to one container, so an exceptional object can be identified and explained (ADR-0001).
4. **Failures teach nothing.** MVP-1 records disposals and failures with the same standing as successes, so the operation learns (CANON §6).

MVP-1 does **not** advise, monitor, optimize, or automate. Its whole value is a fast, faithful record that later capabilities can build on (PC-04). If it captures reliably and is actually used, it succeeds.

---

## 2. Capabilities included

Only the capabilities required to create operational memory. Each maps to a workflow and is justified by the operational problem it solves.

- **Identity assignment (containers, batches).** Every container and batch gets a permanent, immutable identifier on creation. *Essential:* nothing can be traced or recorded without identity first (INV-2, PC-01; Identity & Registry). Uses the repository Identifier Standard.
- **Register a container (WF-1).** Bring a new object into record at inoculation, with its lineage and (optional) recipe reference. *Essential:* the container is the anchor of all history (ADR-0001).
- **Group containers into a batch (WF-2).** Fix batch membership at creation. *Essential:* real work happens in runs; batch grouping lets one action attribute to many containers without losing the anchor (PC-02).
- **Capture core operational events.** The governance-named events — inoculation, transfer, contamination, harvest, disposal — plus observation. *Essential:* these are the atoms of operational history (ADR-0001, ADR-0002; Capture / Ledger). Every event is immutable, attributed, container-anchored.
- **Record an observation (WF-3).** Capture a human perception as evidence. *Essential:* observation precedes intervention; the reviewer needs faithful sight of conditions (CANON P-08).
- **Record a harvest / disposal (WF-4).** Record the outcome and close a container's life. *Essential:* outcomes — including failures — are the payoff of traceability.
- **Reference an approved recipe (WF-6).** Attach a read-only Recipe Reference (Formulation ID + Version + Experimental Flag) to preparation. *Essential:* ties each batch's substrate to an exact formulation without opening the simulator (RECIPE_SIMULATOR_INTEGRATION §5; PC-08).
- **Review container and batch history (WF-7, WF-8).** Read-only history and derived state. *Essential:* the record is worthless if it can't be read back; this is what the reviewer uses (PC-12).
- **Produce a daily operational review (WF-9).** A read-only retrospective across the day. *Essential:* it is the reviewer's window and the moment evidence is readied for the Knowledge System.
- **Flag for future interpretation (WF-10).** A lightweight marker event. *Essential (cheap):* preserves the deferred-interpretation seam (PC-04) at near-zero cost, so nothing is lost while AI is deferred.
- **Operational Sessions.** The capture wrapper that makes the above fast (Section 4).
- **Operator attribution.** Every event carries who recorded it (PC-12; one operator, one reviewer).

**Invariant preservation.** Every capability above writes only immutable, append-only, container-anchored, attributed events through the single write path Identity → Capture → Records (INV-1..6). Recipe/sensor/knowledge stay external references (INV-7). The operator decides; MVP records (INV-10). Nothing here interprets before it records (INV-5). Deferred capability is reserved, not built (INV-8).

---

## 3. Capabilities explicitly deferred

Nothing below exists in MVP-1. Each exclusion is intentional and justified.

- **AI interpretation.** Deferred by ADR-0002; depends on a reliable record existing first (AI-1, AI-2 `Proposed`). Building it now would violate "evidence precedes interpretation" (PC-09) and rest on unvalidated assumptions.
- **Automation control.** Field OS never commands hardware (PC-08; ADR-0003). Adding control is a *boundary change*, not an MVP feature.
- **Advanced analytics.** Analytics is a downstream reader of a record that does not yet exist; premature (PC-04). Basic history review (WF-7/8) is included; analytics is not.
- **Scheduling / tasks.** Introduces the Task concept, which implies procedure enforcement — explicitly deferred (ADR-0002; DATA_MODEL §2.13).
- **Notifications / monitoring / alerting.** Monitoring is deferred (ADR-0002); it also depends on sensor trust that is `Proposed` (IN-3).
- **Optimization, recipe calculations, cost analysis.** These belong **permanently inside the Recipe Simulator**, never Field OS (RECIPE_SIMULATOR_INTEGRATION §8; PC-08). Putting them here would create a competing source of recipe truth (ADR-0003).
- **Automated sensor ingestion.** Sensor trustworthiness is `Proposed` (IN-3); MVP references environmental context only manually and lightly, if at all. Automated ingestion waits for validated sensing.
- **Multi-user, roles, permissions, concurrency.** Single operator + single reviewer is assumed; multi-user is `Proposed` (GR-2). No roles model is built.
- **Offline-sync sophistication.** Connectivity is `Proposed` (MO-3); MVP assumes capture must not be lost, but elaborate sync is deferred until connectivity is surveyed.

The common thread: MVP-1 excludes everything that interprets, controls, predicts, or scales, because none of it records reality — and recording reality is the whole job of the first version (ADR-0002).

---

## 4. Operational Sessions

**Operational Sessions are the primary interaction model of MVP-1** — a way to make capture fast and coherent. A Session is a bounded working period during which one operator records events. It is an **interaction construct, never a persistence construct**: a Session organizes work in the moment but stores nothing of its own — no session record, no persisted session-start or session-end entity. What persists is the events, each carrying its own operator attribution and timestamp. A Session, if ever needed after the fact, is *derived* by grouping events by operator and working period — reconstructed, not stored (INV-4). The container remains the anchor (INV-1); events preserve history, append-only (INV-3). **Sessions organize work; events preserve history.**

- **Session types.** (1) **Lab session** — spawn/agar/inoculation work in the laboratory. (2) **Cultivation session** — handling, observation, and harvest in the fruiting/facility zones. (3) **Review session** — the reviewer's read-only retrospective. Types differ only by the kinds of events typically captured; they share one model.
- **Session lifecycle.** *Start* (operator arrives, opens a session, which fixes operator + time context) → *Capture* (events recorded against containers/batches, inheriting the session's attribution and time) → *In-session review* (the operator glances back at their own entries) → *End* (the working period closes). Start and end frame the period for the operator in the moment; neither is stored as a record — only the events captured between them persist.
- **Session ownership.** A session belongs to exactly one operator and carries their attribution. One operator, one reviewer (no roles model).
- **Session outputs.** The real output is the set of immutable events captured during it. A "session summary" is a *derived, read-only view* of those events — never a separate stored record (INV-4).
- **Relationship with operational events.** The session is the capture context; every event captured is an ordinary Operational Event that carries its own operator attribution and timestamp. Remove the session and every event still stands, fully attributed — proof the session is an organizing frame, not an anchor and not a stored thing.
- **Relationship with containers.** A session touches many containers but owns none; each event still anchors to its one container (PC-01).
- **Relationship with batches.** A session may act on whole batches; batch-level events captured in a session inherit to members (R-3), with the loss-free caveat (DA-4 `Proposed`).
- **Why sessions improve the operator experience.** They attribute and time-stamp once instead of per event (speed, PC-05); they match the real rhythm of arriving, working, and leaving; they reduce repeated identification during a burst of work; and they give the reviewer a coherent "what happened in this work period" view — all without weakening any invariant.

---

## 5. Daily workflow

A normal working day, end to end:

```
Arrival                         operator reaches the lab / facility
      ↓
Start Session                   opens a Lab or Cultivation working period                    — organizes work; persists nothing
      ↓
Capture operations              register new containers (WF-1); group into batches (WF-2);
                                record inoculations, transfers, observations, contamination,
                                harvests, disposals (WF-3, WF-4); attach approved recipe
                                references (WF-6); flag anything notable (WF-10)              — immutable events (the only thing persisted)
      ↓
Review (in-session)             operator checks their own entries for faithfulness           — read-only
      ↓
End Session                     closes the working period                                    — organizes work; persists nothing
      ↓
Daily Operational Review        reviewer reads the day across containers/batches (WF-9)       — read-only
      ↓
Knowledge preparation           evidence and flagged/experimental results are readied for the
                                Knowledge System to evaluate — never auto-ingested            — hand-off, not a write
```

Two rules hold all day: everything captured is **immutable and append-only** (a correction is a new event), and the **Daily Operational Review interprets nothing automatically** — the reviewer reads evidence, and any decision or lesson re-enters as a new event (IF-8; PC-09). "Knowledge preparation" respects the repository rule that *new sources do not automatically update the repository*: evidence is prepared for evaluation, not pushed into knowledge.

---

## 6. Recipe integration

Operators use approved formulations **without ever opening the Recipe Simulator** (RECIPE_SIMULATOR_INTEGRATION §5).

Conceptually: MVP-1 presents a list of **approved** recipe references — those the Knowledge System has marked validated — each identified by Formulation ID and exact Version, with its expected properties (e.g. expected hydration/yield) and an Experimental Flag carried as read-only context. When registering a container or preparing a batch, the operator **selects an approved reference**; MVP records that reference on the event. No calculation, no simulator interface, no formulation editing happens in Field OS (PC-08).

For R&D, an operator may deploy an **experimental** reference to a real batch; the batch is captured normally but carries the Experimental Flag, segregating experimental evidence from production baselines in the same append-only record (RECIPE_SIMULATOR_INTEGRATION §6). The simulator's complexity stays entirely inside the simulator; Field OS holds only the stable, versioned reference — which is exactly what preserves traceability from container back to formulation version.

---

## 7. Success criteria

MVP-1 is operationally successful when these are true. Thresholds are targets for validating the relevant `Proposed` assumptions, not rigid contracts.

- **Daily adoption.** A session is opened on essentially every working day. *(Validates OP-4, US-2.)*
- **Capture speed.** Recording a routine event is fast enough that it is not skipped under time pressure — the single greatest risk to the ledger (US-2). *(Target: capture feels lighter than the note-taking it replaces.)*
- **Data completeness.** A high share of real operations are captured, and most containers carry a full lifecycle from creation to outcome. *(Validates OP-3.)*
- **Traceability.** Every container has an identity, a recipe reference where applicable, and an attributed event chain; every event resolves to one container and one operator. *(Validates INV-1/2; US-4.)*
- **Operator acceptance.** The caretaker keeps using it unprompted, and tolerates per-container identification in normal work. *(Validates US-2, US-4.)*
- **Reviewer usefulness.** The remote reviewer can answer "what happened" from the record alone, without contacting the caretaker. *(Validates US-3.)*
- **Repository usefulness.** The daily review reliably yields evidence the Knowledge System can evaluate — the operation is measurably learning (CANON §6).

If capture is reliable and the record is genuinely used for review, MVP-1 has done its job — regardless of how little else it does.

---

## 8. Implementation priority

**Level 1 — absolutely required (this *is* MVP-1).**
Identity assignment (containers, batches); container registration (WF-1); batch grouping (WF-2); capture of core events — inoculation, transfer, observation, contamination, harvest, disposal (WF-3, WF-4); operator attribution; Operational Sessions; approved recipe reference (WF-6); container and batch history review (WF-7, WF-8); daily operational review (WF-9); an append-only, immutable event store as a property of the system. *Rationale:* this is the minimum that creates operational memory and preserves every invariant.

**Level 2 — important, immediately after MVP.**
Flag-for-interpretation richness (WF-10 beyond a basic marker); manual environmental/sensor context (WF-5, light); experimental-flag segregation reporting for R&D; structured hand-off/export of prepared evidence to the Knowledge System; batch-level inheritance refinements. *Rationale:* increases usefulness and closes the evidence→knowledge loop, but is not required to record daily reality.

**Level 3 — future platform evolution.**
AI interpretation; monitoring, notifications, alerting; analytics; scheduling/tasks; automated sensor ingestion; multi-user, roles, permissions; automation control (a boundary change requiring ADR-0003 review). *Rationale:* all are deferred by governance (ADR-0002) or would cross an ownership boundary (ADR-0003); each becomes admissible only when the record exists and the relevant assumptions are validated (PC-04, PC-09).

---

*Document version: 1.0*
*Effective date: 2026-07-05*
*Authority: Field OS product implementation blueprint (MVP-1)*
*Governed by: PRODUCT_CANON.md, PRODUCT_ARCHITECTURE.md, DATA_MODEL.md, MODULE_MAP.md, USER_WORKFLOWS.md, SYSTEM_INTERACTIONS.md, RECIPE_SIMULATOR_INTEGRATION.md, ADR-0001, ADR-0002, ADR-0003, PRODUCT_ASSUMPTIONS.md*
*Smallest faithful implementation. Preserves all invariants. Assumes one operator and one reviewer; not optimized for scale. Redesigns nothing. Technology-agnostic — no frameworks, databases, or APIs.*
*Optimized for daily laboratory and cultivation use at Setas de la Peña.*
