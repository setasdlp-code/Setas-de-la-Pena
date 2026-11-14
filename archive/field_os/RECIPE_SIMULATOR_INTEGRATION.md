---
title: SdP — Recipe Simulator ↔ Field OS Integration Contract
document_id: PINTEG-001
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
  - SYSTEM_INTERACTIONS.md
  - ADR-0003_System_Boundary.md
  - ADR-0002_Product_Priority.md
  - ADR-0001_Central_Operational_Unit.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
---

# RECIPE_SIMULATOR_INTEGRATION — SdP

## Architectural Contract: Recipe Simulator ↔ Field OS — v1.0

---

## 0. Nature and scope

This document is the **architectural contract** between the existing Recipe Simulator and SdP Field OS. It determines how the simulator — a working, independent product — fits into the long-term SdP ecosystem **without being redesigned or rewritten**. It is an architecture document: it describes responsibilities and boundaries, not implementation, frameworks, databases, or APIs.

It respects and derives from the approved, immutable governance: ADR-0003 (system boundary), ADR-0002 (record-first), ADR-0001 (container anchor), PRODUCT_CANON (PC-07, PC-08 especially), PRODUCT_ARCHITECTURE (INV-6/7), DATA_MODEL (Recipe Reference), MODULE_MAP (Recipe & Formulation Boundary), SYSTEM_INTERACTIONS (§5). It introduces no new product principle and changes nothing inside the simulator.

The SdP platform is three independent subsystems:

```
SdP Platform
├── Knowledge System            — validated knowledge (authority on what is true)
├── Recipe & Formulation Engine — the Recipe Simulator (authority on formulation logic)
└── Field OS                    — operational execution (authority on what happened)
```

*(Terminology: "Recipe & Formulation Engine" is the same subsystem as the "Recipe Simulator"; the rename is a pending ADR-0003 amendment proposal, not yet adopted. Both names denote the substrate simulator of ADR-0003.)*

---

## 1. Role of the Recipe Simulator

The Recipe Simulator is **the authority for formulation reasoning** — the subsystem that decides *what a substrate recipe is* and computes the consequences of a formulation. Its responsibility is substrate engineering and formulation logic: composing ingredients, computing ratios and expected properties, versioning formulations, and holding the ingredient knowledge that formulation requires.

Fundamentally, it answers the question *"what should this substrate be, and what should it do?"* — a **predictive and design-time** responsibility. It reasons about recipes *before and independent of* any physical batch. It is not a record of what happened; it is a model of what a formulation is expected to be. That distinction — model of intent versus record of reality — is the entire basis of its separation from Field OS.

This document defines that responsibility as **permanent**: it belongs inside the simulator regardless of how the ecosystem evolves, because ADR-0003 fixes the simulator as the owner of recipe and formulation logic and forbids Field OS from computing formulations (PC-08).

---

## 2. Relationship with Field OS

**The conceptual boundary.** The simulator owns *formulation intent*; Field OS owns *operational reality*; the Knowledge System owns *validated truth*. The simulator computes what a recipe is; Field OS records that a recipe was used and what happened; the Knowledge System decides whether a recipe is validated. No subsystem owns another's domain (ADR-0003).

Field OS relates to the simulator exactly as ADR-0003 and PC-07/PC-08 prescribe: it **reads** recipe/formulation outputs and **references** them on operational events. It never computes, edits, or owns a formulation.

**Ownership of each concept:**

| Concept | Owner | Why |
|---------|-------|-----|
| Recipes | Recipe Simulator | recipe logic is the simulator's domain (ADR-0003; PC-08) |
| Formulations | Recipe Simulator | formulation reasoning is design-time, not a record |
| Ingredient libraries | Recipe Simulator | ingredient knowledge is an input to formulation |
| Experimental formulations | Recipe Simulator | authored and versioned where formulations live |
| Recipe versions | Recipe Simulator | version identity belongs to the object's owner |
| Recipe selection | **Shared, by role** | the *options* are the simulator's; the *approval status* is the Knowledge System's; the *act of choosing one for a batch* is an operator decision **recorded** by Field OS (PC-12) |
| Batch execution | Field OS | executing a batch is operational reality (ADR-0001, ADR-0002) |
| Observations | Field OS | observations are operational evidence (PC-03) |
| Results (operational) | Field OS | what actually happened is Field OS evidence |
| Results (predicted) | Recipe Simulator | expected yield/hydration are formulation predictions |
| Results (validated) | Knowledge System | whether a result confirms a formulation is a validation verdict |
| Operational history | Field OS | append-only history is Field OS's alone (PC-06, PC-11) |

The boundary rule in one line: **the simulator says what a recipe should be; Field OS records what a recipe did; neither may become the other.**

---

## 3. Information exchange

Only *references and expected values* cross from the simulator into Field OS, held read-only on operational events (PC-08; DATA_MODEL Recipe Reference). No formulation logic and no operational history ever cross. There are no APIs or formats here — these are conceptual objects.

**What crosses simulator → Field OS (read-only, as context on events):**

| Object | Meaning at the boundary |
|--------|--------------------------|
| Recipe Reference | a pointer to a specific formulation used to prepare a container/batch |
| Formulation ID | the stable identity of the formulation being referenced |
| Recipe Version | the exact, immutable version referenced — so history ties to *that* formulation, not a later edit |
| Expected Hydration | a predicted property, carried as context beside the operational event |
| Expected Yield | a prediction, recorded as expectation — never as a result |
| Experimental Flag | marks the formulation as experimental vs. production, so records can be segregated |

**What crosses Field OS → Knowledge System (operational evidence, not to the simulator):**
- Observations and outcomes that *reference* a recipe, so the Knowledge System can evaluate how a formulation performed. This is the evidence path; it flows to the validation authority, **not back into the simulator** as a write.

**What never crosses any boundary:**
- The simulator's **internal calculation logic** never leaves the simulator; Field OS never replicates a formula (PC-08).
- **Operational history** never enters the simulator; the simulator holds no container-level events, operator identities, or ledger data.
- **Write authority** never crosses: Field OS never writes to the simulator, and the simulator never writes to the operational record (ADR-0003 — three inbound reads, one outbound write; Field OS's single write target is operational evidence).
- **Predicted values never become results**, and **results never overwrite predictions** — expected and actual are kept distinct on the record (PC-09).

---

## 4. Research workflow — lifecycle of a new formulation

Derived from repository governance: the knowledge-ingestion rule that *new sources do not automatically update the repository*, and the maturation path (Observation → Operational Record → Daily AI Review → Lesson → Decision → SOP → Knowledge Domain → Stable Knowledge). A formulation earns production status the same way any belief matures into knowledge.

```
Idea                                   (a researcher's hypothesis)
      ↓   authored where formulations live
Recipe Simulator                       (composes an experimental formulation)      — Simulator owns it
      ↓   marked experimental
Experimental formulation (versioned)   (carries an Experimental Flag)              — Simulator
      ↓   crosses as a read-only reference
Recipe Reference (experimental)        (Formulation ID + Version + Experimental)   — boundary object
      ↓   deployed to a real batch
Experiment → Substrate Batch           (Field OS records batch execution)          — Field OS owns the reality
      ↓   the batch is observed
Operational observations & harvest     (immutable, container-anchored evidence)    — Field OS
      ↓   evidence flows to the validation authority
Evidence → Knowledge System            (evaluated: reliability, evidence level,
                                        conflict with existing knowledge)          — Knowledge System owns the verdict
      ↓   if it passes evaluation
Validated formulation                  (Knowledge System marks it validated)       — Knowledge System
      ↓   status promotes the simulator's recipe
Production recipe                       (simulator recipe now approved for
                                        production; future batches reference it)    — Simulator object, KS-approved
```

Three ownerships are preserved end to end: the **simulator** owns the formulation object across its whole version history; **Field OS** owns the experiment's operational reality; the **Knowledge System** owns the validation verdict that turns an experimental formulation into a production one. No subsystem shortcuts another — a formulation cannot promote itself, and operational evidence cannot rewrite a formulation. This is also, by construction, how any drift between a simulator recipe and validated reality is reconciled over time: the Knowledge System is the arbiter, and promotion only happens through evidence — **without redesigning the simulator.**

---

## 5. Production workflow — consuming formulations without simulator complexity

In production, **operators never "use the simulator."** They reference an **approved formulation** and nothing more.

- The set of formulations available for production is those the Knowledge System has marked **validated/approved**; the simulator's experimental and in-progress work is not offered for production selection.
- Choosing a formulation for a batch is an operator decision (PC-12), recorded by Field OS as a **Recipe Reference** on the batch (USER_WORKFLOWS WF-6). The operator selects from approved options; they do not compute or open a formulation.
- Only the stable boundary objects (Formulation ID, Version, Expected properties, Experimental Flag = production) travel with the reference. The simulator's calculation complexity stays entirely inside the simulator and is never exposed at the point of operational work (PC-05 low-friction capture; PC-08).

The result: production consumes formulations as **named, versioned, approved references**. The simulator's sophistication is invisible to the operator, and the operational record still ties every batch to an exact formulation version.

---

## 6. Research mode — R&D without touching production records

A conceptual **R&D mode** lets researchers explore formulations without contaminating operational reality.

- **Exploration lives in the simulator.** Creating, iterating, and comparing formulations happens inside the simulator and produces **no Field OS records** — design-time reasoning is not operational history (PC-03: evidence is *recorded reality*, and un-deployed formulations are not reality).
- **Physical experiments still produce records, clearly flagged.** The moment an experimental formulation is deployed to a real batch, ordinary Field OS capture applies (WF-1, WF-6) — but the batch carries the **Experimental Flag**, so experimental evidence is segregated from production baselines. There is no separate ledger; the same append-only history holds both, distinguished by the flag (PC-11, INV-3).
- **Separation without duplication.** Research mode is a *stance*, not a second system: researchers work in the simulator (no operational trace) and, when they run a real experiment, that reality is recorded once, flagged, and traceable. Production baselines stay clean because experimental records are marked, not because they live elsewhere.

This keeps experimentation fluid in the simulator while protecting the integrity and interpretability of production evidence.

---

## 7. Long-term architecture — three cooperating systems

```
Knowledge System        — authority on validated truth
      │  constrains and approves ↓        ↑ receives evidence for validation
Recipe & Formulation Engine (Simulator) — authority on formulation logic
      │  supplies recipe references ↓     ↑ (no write back)
Field OS                — authority on operational reality
```

**Responsibilities.** The Knowledge System defines what is validated and approved, and constrains what production may use. The Simulator reasons about formulations within that knowledge and supplies versioned recipe references. Field OS executes and records reality, referencing recipes and emitting evidence. **Authority flows down** (knowledge constrains formulation; approved formulation is referenced by execution); **evidence flows up** (operational reality feeds the Knowledge System's validation, which in turn governs future formulations).

**Why they remain independent.** Each subsystem is the single source of truth for exactly one domain (validated knowledge, formulation logic, operational reality). Merging any two would create a competing source of truth — the precise failure ADR-0003 rejects: a Field OS that computed recipes would diverge from the simulator; a simulator that held operational history would blur intent and reality. Independence also isolates failure (one subsystem can change or fail without collapsing the others) and preserves clean traceability, because every fact has exactly one owner. The relationship is deliberately stable: it should remain valid for years precisely because no subsystem depends on another's internals — only on the thin, read-only references that cross between them.

---

## 8. Future evolution — capabilities that belong in the simulator, not Field OS

These future capabilities belong **permanently inside the Recipe Simulator**, never in Field OS:

- **Optimization** — searching for better formulations.
- **Cost analysis** (formulation-level) — the ingredient cost of a recipe. *(Business-level pricing remains in the business/knowledge domain; this is the formulation's own cost reasoning.)*
- **Ingredient substitution** — reasoning about alternative ingredients within a formulation.
- **Predictive modeling** — forecasting a formulation's expected behavior.
- **Experimental formulation** — authoring and versioning new recipes.

**Why they stay outside Field OS.** Every one of these is **formulation reasoning** — computing or predicting *what a recipe should be*. That is the simulator's domain by ADR-0003, and placing it in Field OS would make Field OS compute formulations, violating PC-08 and creating a second, diverging source of recipe truth (the alternative ADR-0003 explicitly rejected). It would also contradict ADR-0002: Field OS is record-first and records reality; optimization, prediction, and substitution are *not* recordings of reality — they are design-time reasoning that must precede and stay separate from the operational ledger. Field OS may *reference* the outputs of these capabilities (a better recipe becomes a new Recipe Reference), but it must never host the reasoning that produces them.

The enduring test for any future capability: **if it decides what a recipe should be, it belongs in the simulator; if it records what actually happened, it belongs in Field OS; if it decides what is validated, it belongs in the Knowledge System.** A capability that appears to need two of these is really two capabilities at a boundary, and the boundary — not the capability — is authoritative.

---

## 9. Traceability preservation (summary)

Traceability holds across the three systems because every operational batch in Field OS carries an **immutable Recipe Reference** — Formulation ID + exact Version + Experimental Flag. Consequently: each container's substrate is traceable to a precise, unchangeable formulation version in the simulator; each formulation's real-world performance is traceable to the container-anchored evidence in Field OS; and each validated formulation is traceable to the evidence the Knowledge System evaluated. Because recipe versions are referenced immutably (never mutated in place), later edits to a formulation cannot rewrite the history of batches that used an earlier version (PC-11, INV-3). This satisfies the repository's requirement to preserve biological, operational, and knowledge traceability — across the boundary, not despite it.

---

*Document version: 1.0*
*Effective date: 2026-07-05*
*Authority: SdP product architecture (integration contract)*
*Governed by: ADR-0003, ADR-0002, ADR-0001, PRODUCT_CANON.md, PRODUCT_ARCHITECTURE.md, DATA_MODEL.md, MODULE_MAP.md, USER_WORKFLOWS.md, SYSTEM_INTERACTIONS.md, PRODUCT_ASSUMPTIONS.md*
*Does not redesign, rewrite, or specify the existing Recipe Simulator. No implementation, frameworks, databases, or APIs. Defines a stable architectural relationship intended to remain valid for many years.*
