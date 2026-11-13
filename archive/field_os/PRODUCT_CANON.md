---
title: SdP Field OS — Product Canon
document_id: PCANON-001
authority: product-foundation
category: product-architecture
version: 1.1
last_reviewed: 2026-07-05
status: canonical
supersedes: "1.0"
superseded_by: null
sources:
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
  - ../knowledge_base/SETAS_DE_LA_PENA_CANON.md
  - ../knowledge_base/00_project/principles.md
---

# PRODUCT_CANON — SdP Field OS

## Product Constitution — v1.1

---

## 1. Purpose

This document defines the enduring principles that govern the SdP Field OS product. It is the product constitution: the small set of foundational commitments that every later product decision, document, and implementation must respect.

It governs the Field OS product only. It does not describe features, schemas, interfaces, or implementation — those belong in subordinate product documents. In any conflict of product principle, this document takes precedence over the documents *downstream* of it — product architecture and implementation — but never over the ADRs, validated assumptions, or repository governance from which it derives. The full order of authority is defined in Section 5.

The purpose of the Canon is to keep the product coherent across time, across personnel changes, and across technical iterations, so that what Field OS fundamentally *is* does not drift as it grows.

---

## 2. Derivation and constraint

This Canon was built **only from existing governance** — the Field OS product foundation and the repository governance above it:

- **ADR-0001 — Central Operational Unit** (Accepted)
- **ADR-0002 — Product Priority** (Accepted)
- **ADR-0003 — System Boundary** (Accepted)
- **PRODUCT_ASSUMPTIONS.md** — the assumption governance and lifecycle discipline
- **Repository governance** — the repository architecture canon (`SETAS_DE_LA_PENA_CANON.md`) and operational principles (`principles.md`), which sit above the product foundation and which the human-centered and traceability principles derive from

It introduces **no new architectural decision** and **no new assumption**. Every principle below is a distillation of a decision already accepted in an ADR, or of the governance method already established in PRODUCT_ASSUMPTIONS. Where those documents are silent, this Canon is silent.

One rule from PRODUCT_ASSUMPTIONS constrains the Canon directly: **only Validated assumptions may inform canon.** Every assumption in PRODUCT_ASSUMPTIONS is currently `Proposed`. Therefore no assumption has been elevated to a canonical statement here. The Canon rests on the three Accepted ADRs, and on the discipline that keeps unvalidated belief out of it. What the assumptions cover remains open question, recorded in Section 6 as explicitly *not* canon.

---

## 3. Scope

The Canon states governing product principles only. It intentionally excludes: the current release plan, event vocabularies, identifiers' concrete form, user-interface and capture mechanics, integration mechanisms, and any decision an ADR marks as downstream. A commitment that could be revised without reopening an ADR does not belong in the Canon.

The distinction is deliberate. A principle that belongs in a feature spec is not canon — it is design. A decision that belongs in the Canon is not a feature — it is a foundation.

---

## 4. Canonical principles

These principles do not expire. They are revised only through the amendment process in Section 7, and only when the ADR that grounds them is itself reconsidered.

### Unit of record — from ADR-0001

**PC-01 — The individual container is the atomic unit of record.**
A single block, bag, or jar is the object to which every operational event, state, and history entry is anchored. Traceability resolves to the finest grain that exists in physical reality, so that an individual exceptional object can be identified, isolated, and explained without ambiguity.

**PC-02 — The batch groups containers; it never replaces them as the anchor.**
The batch is a valid parent layer above the container. Batch-level events may be inherited by member containers, but the container remains the object of record. No grouping — batch, zone, or cycle — may become the anchor in the container's place.

### Record before interpretation — from ADR-0002

**PC-03 — Field OS records reality before it interprets, prescribes, or enforces.**
The product's foundation is a faithful, queryable account of what happened. Any capability that advises, monitors, or enforces is built on top of that record, never in place of it.

**PC-04 — Deferred capability is preserved, not designed out.**
Capabilities not built in the current phase — advice, monitoring, procedure enforcement — must remain reachable from the operational record without rebuilding its core. The record is shaped so later capabilities read from it.

**PC-05 — The record's value depends on faithful, low-friction capture.**
A record that is not maintained records nothing. The fidelity of capture and the cost of capture are first-order product concerns, not implementation details; nothing may be added that degrades the faithful, low-friction recording of reality.

### System boundary — from ADR-0003

**PC-06 — Field OS is the operational execution layer, and owns operational evidence alone.**
Its single responsibility is recording operational reality. It holds operational state and no other domain's state.

**PC-07 — The direction of authority is fixed: three inbound reads, one outbound write.**
Field OS reads from the Knowledge System (knowledge and parameters), the substrate simulator (recipe and formulation logic), and the sensor and automation layer (environmental data). It writes back to operational evidence. This direction is foundational; the mechanism of each seam is not.

**PC-08 — Field OS is never the authority for knowledge, recipes, or hardware commands.**
It consumes its neighbours' outputs; it does not own, compute, or override them. It never becomes the authoritative source of cultivation knowledge, never computes formulations internally, and never issues control commands to hardware. Each neighbouring system retains sole authority over its own domain.

### Governance of belief — from PRODUCT_ASSUMPTIONS

**PC-09 — Canon rests on accepted decisions and validated evidence, never on unvalidated assumption.**
Fact, decision, and assumption are kept distinct. A belief that has not been validated is an open question, not a foundation, and may not be written into this Canon or relied upon as if settled.

**PC-10 — Belief is traceable and must mature before it hardens.**
Assumptions remain open — `Proposed`, then `Observed` — until testing makes them `Validated`. Only a `Validated` assumption may enter canon. A `Rejected` assumption is retained, not deleted, and triggers review of every decision it touched. This is how the product converts belief into foundation without losing the trail.

### Historical traceability — from ADR-0001, ADR-0002, and repository governance

**PC-11 — Operational history is cumulative; state never replaces it.**
Every persistent operational object remains historically traceable for its entire life. Field OS preserves the accumulated record of what happened to each container, not only its current state. History is cumulative: events are appended, never overwritten, and current state is a reading *derived* from that history rather than a substitute for it. A record of failure is preserved with the same standing as a record of success.

### Operator authority — from repository governance, ADR-0002, and ADR-0003

**PC-12 — The operator remains the primary decision-maker.**
Field OS supports human judgment; it never replaces professional responsibility. Its purpose is to reduce the friction of capture and to strengthen traceability — never to obscure who decided or who is accountable. Automation, and any later advisory or monitoring capability, augment observation and execute what the operator directs; they do not substitute for the operator's interpretation of the biology. The operator interprets; the system records and, where permitted, executes.

---

## 5. Document hierarchy and relationship to ADRs and Assumptions

The Field OS product foundation is governed by a single directed flow of authority. Each layer derives from the one above it and constrains the one below:

```
Repository Governance
        ↓
Accepted ADRs
        ↓
Validated Product Assumptions
        ↓
PRODUCT_CANON   (this document)
        ↓
Product Architecture
        ↓
Implementation
```

PRODUCT_CANON does **not** supersede the ADRs. It sits *below* them in the governance flow and *above* product architecture and implementation. Its authority is to express the enduring principles the accepted decisions imply and to constrain everything downstream of it — not to outrank the decisions it is derived from.

The roles are distinct and must not be conflated:

- **The ADRs remain the authoritative record of every architectural decision** — its context, alternatives, decision, and consequences. Where the question is *what was decided*, the ADR governs.
- **PRODUCT_CANON expresses the enduring principles derived from those decisions** — the commitments that must remain true across phases. Where the question is *what must always hold*, the Canon governs, within the bounds the ADRs set.
- **Validated Product Assumptions** sit between the ADRs and the Canon: only an assumption in `Validated` state may inform this Canon (PC-09, PC-10). None is validated yet, so the Canon currently rests on the ADRs alone plus the repository governance above them.
- **Repository governance** — the repository's own architecture canon and operational principles — sits above the entire product foundation. Because Field OS reads from but is not the Knowledge System (PC-06 to PC-08), this product Canon governs the product and never overrides repository governance where the two meet.

**If an apparent contradiction arises between PRODUCT_CANON and an ADR, the ADR is reviewed first.** The Canon is a derivation: a conflict means either the derivation is wrong — in which case the Canon is corrected — or the underlying decision has changed, which is an ADR matter resolved under ADR review, not by editing the Canon to disagree with its source. PRODUCT_CANON is never amended to contradict an ADR that still stands.

---

## 6. What is explicitly not canon

To keep the Canon honest, the following are recorded as **not** canonical:

- **"Field OS v1 is only a ledger" as a permanent state.** The enduring principle is *record before interpretation* (PC-03, PC-04). ADR-0002 itself provides that once the ledger is in reliable use, the priority question reopens as *which deferred capability comes next.* The ledger-first sequencing is an accepted current-phase decision, subject to that ADR's future review — not a permanent constraint of the Canon.
- **Every belief still in `Proposed` state in PRODUCT_ASSUMPTIONS.** In particular the low-confidence assumptions the assumptions document itself flags — device availability and usability (MO-2), field connectivity (MO-3), caretaker acceptance of per-container identification (US-4), batch-event inheritance without loss (DA-4), sensor trustworthiness (IN-3), and multi-user expansion (GR-2) — are open questions. They may constrain the product later, but only after validation, and only through the amendment process below.

Nothing in this section weakens PC-01 to PC-12. It marks the boundary between what is settled and what is still being earned.

---

## 7. Amendment policy

This Canon changes only when the foundational philosophy of the product changes — when a grounding ADR is reconsidered or superseded, when a newly `Validated` assumption shows a principle to be incorrect or insufficient, or when the repository governance a principle derives from is itself revised. Feature work, schema evolution, interface changes, and phase transitions do not modify the Canon.

**Who may propose an amendment.** Any operator, product maintainer, or AI collaborator working within the repository may propose one. A proposal is a request for review, not a change; no principle changes on proposal alone. Adopting an amendment is a governance act reserved to the product-foundation owner (the authority named in the footer), following the review below.

**What evidence is required.** A proposal must cite the specific governance artifact that forces the change — a superseding or amended ADR, an assumption whose PRODUCT_ASSUMPTIONS entry has reached `Validated` state, or a revised repository-governance principle. It must demonstrate that an existing principle is wrong, incomplete, or contradicted by validated reality, not merely that product practice has moved on. Evidence resting on a `Proposed` or `Observed` assumption is insufficient by PC-09 and PC-10.

**Which artifacts must be reviewed first, and in what order.** Before any edit to this Canon, review upstream in governance-flow order:

1. **Repository governance** (`SETAS_DE_LA_PENA_CANON.md`, `principles.md`) — is the principle still supported above?
2. **The grounding ADR(s)** named in the traceability matrix (Section 8) — does the decision still stand as written? If the conflict is with an ADR, the ADR is reviewed and, if necessary, amended *first*; the Canon is not edited to contradict a standing ADR.
3. **PRODUCT_ASSUMPTIONS** — has the relevant assumption reached `Validated`, or is it still open?

Only after these are reconciled may the Canon be amended.

**Under which conditions a principle may change.** The condition-specific triggers mirror each grounding source's own review clause:

- **PC-01, PC-02** — reopened only if production ceases to consist of discrete, individually distinguishable containers, or if sustained evidence shows per-container capture is unworkable in practice (ADR-0001).
- **PC-03, PC-04, PC-05** — reopened only if evidence shows the record-first framing is causing abandonment, or once the deferred-capability priority is formally reopened (ADR-0002). The principle of recording before interpreting survives such a reopening; only the current phase does not.
- **PC-06, PC-07, PC-08** — reopened only if the ownership of a neighbouring domain changes: the Knowledge System, simulator, or automation layer retired, absorbed, or redefined (ADR-0003).
- **PC-09, PC-10** — reopened only if the assumption-governance discipline in PRODUCT_ASSUMPTIONS is itself replaced.
- **PC-11** — reopened only if operational history ceases to be the object of record — for example, if ADR-0002's append-only ledger model is superseded — or if repository traceability governance (CANON §6; principles.md #4) is revised.
- **PC-12** — reopened only if repository automation and decision governance (CANON §7; principles.md #3) is revised, or if an ADR reassigns decision authority away from the operator.

An adopted amendment carries the same rigor as an ADR: it names the artifact that forces the change, and it is recorded, versioned, and dated in this document and in the Governance Change Log.

---

## 8. Principle traceability

Every principle satisfies the canonical-scope rule: each is derived from an Accepted ADR, supported by repository governance, or both. No principle depends exclusively on a `Proposed` assumption. PC-09 and PC-10 derive from the assumption-governance *discipline* itself (not from any single assumption's content); PC-11 and PC-12 are supported by both an Accepted ADR and repository governance.

The **Dependent future documents** column is documentation only — it names the downstream artifacts each principle is expected to constrain, not a commitment to produce them.

| Principle | Supporting ADR(s) | Supporting repository governance | Dependent future documents |
|-----------|-------------------|----------------------------------|-----------------------------|
| PC-01 | ADR-0001 | CANON §6 (lot traceability); `IDENTIFIER_STANDARD.md`; principles #4 | `DATA_MODEL`, `PRODUCT_ARCHITECTURE` |
| PC-02 | ADR-0001 | CANON §6 (batch = lot grouping) | `DATA_MODEL`, `MODULE_MAP` |
| PC-03 | ADR-0002 | CANON §7 (operator interprets); CANON P-08 (observation precedes intervention) | `PRODUCT_ARCHITECTURE`, `ROADMAP` |
| PC-04 | ADR-0002 | CANON P-03 (modularity / upgrade without cascade) | `PRODUCT_ARCHITECTURE`, `MODULE_MAP`, `ROADMAP` |
| PC-05 | ADR-0002 | CANON P-04 (documentation as infrastructure); principles #4 | `PRODUCT_ARCHITECTURE`, `DATA_MODEL` |
| PC-06 | ADR-0003 | Repository folder-role separation (knowledge vs. operations vs. software) | `MODULE_MAP`, `PRODUCT_ARCHITECTURE` |
| PC-07 | ADR-0003 | CANON §7 (sensor → … → log chain) | `MODULE_MAP`, `DATA_MODEL`, `PRODUCT_ARCHITECTURE` |
| PC-08 | ADR-0003 | principles #7 (technical source of truth); folder-role separation | `MODULE_MAP`, `PRODUCT_ARCHITECTURE` |
| PC-09 | ADR-0001, ADR-0002, ADR-0003 (via PRODUCT_ASSUMPTIONS discipline) | CANON P-01 (verifiability over assumption); principles #1 | `ROADMAP`, `PRODUCT_ARCHITECTURE` |
| PC-10 | via PRODUCT_ASSUMPTIONS lifecycle | CANON §16 (decision process); CANON P-01 | `ROADMAP`; PRODUCT_ASSUMPTIONS (living) |
| PC-11 | ADR-0001 (history entries), ADR-0002 (append-only ledger) | CANON §6 (records from prep to disposal; failure documented); principles #4; CANON P-04 | `DATA_MODEL`, `PRODUCT_ARCHITECTURE` |
| PC-12 | ADR-0002 (human review, no decision logic), ADR-0003 (no hardware commands) | CANON §7 (automation ≠ judgment; operator interprets); principles #3 | `PRODUCT_ARCHITECTURE`, `ROADMAP` |

---

*Document version: 1.1*
*Effective date: 2026-07-05*
*Supersedes: v1.0*
*Authority: Field OS product foundation*
*Built only from: ADR-0001, ADR-0002, ADR-0003, PRODUCT_ASSUMPTIONS.md, and repository governance (SETAS_DE_LA_PENA_CANON.md, principles.md)*
*Introduces no new architectural decision and no new assumption.*
*This document may only be revised through the amendment process defined in Section 7.*
