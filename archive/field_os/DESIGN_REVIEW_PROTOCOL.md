---
title: SdP Field OS — Design Review Protocol
document_id: PREV-001
authority: product-governance
category: product-governance
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
  - FIELD_OS_MVP_ARCHITECTURE.md
  - PRODUCT_EXPERIENCE.md
  - ADR-0001_Central_Operational_Unit.md
  - ADR-0002_Product_Priority.md
  - ADR-0003_System_Boundary.md
  - PRODUCT_ASSUMPTIONS.md
supersedes: null
superseded_by: null
---

# DESIGN_REVIEW_PROTOCOL — SdP Field OS

## Permanent Design Review Protocol — v1.0

---

## 0. Nature and scope

This is the **permanent protocol** by which every future feature, interaction, screen, and workflow of Field OS is reviewed **before acceptance**. Its purpose is not to judge visual design. Its purpose is to verify that an implementation remains **faithful to the approved architecture and product experience**.

It reviews against intent, not taste. The approved documents — the ADRs, PRODUCT_CANON, PRODUCT_ARCHITECTURE, DATA_MODEL, MODULE_MAP, USER_WORKFLOWS, SYSTEM_INTERACTIONS, RECIPE_SIMULATOR_INTEGRATION, FIELD_OS_MVP_ARCHITECTURE, and PRODUCT_EXPERIENCE — are the standard. This protocol introduces no new principle; it operationalizes the ones already approved. When this protocol and an approved document appear to disagree, the approved document governs and this protocol is corrected.

A review produces one of three outcomes: **Accept**, **Revise** (return with specific failed checks), or **Reject** (the feature is contrary to intent and should not exist). Any single **BLOCKER** failure (Section 6) prevents acceptance regardless of other merits.

---

## 1. Review philosophy

An architecturally sound system decays one reasonable-sounding feature at a time. Each addition, judged alone, can seem helpful; the damage is cumulative and only visible against the original intent. Therefore every implementation is reviewed against product intent, always — not because builders are untrusted, but because drift is invisible from inside a single feature.

Three convictions ground the protocol:

1. **The architecture is fixed; the implementation is not.** Faithfulness is the builder's responsibility, and this protocol is how faithfulness is checked. A feature that violates an invariant is wrong even if it is well made and well liked.
2. **The product's value is operational memory and operator trust, not feature count.** A feature that adds capability while eroding capture speed, traceability, or calm is a net loss (ADR-0002; PRODUCT_EXPERIENCE §9).
3. **Review is cheap; drift is expensive.** Catching a violation at review costs a conversation; catching it after operators depend on it costs the record's integrity. The protocol is deliberately run early and often.

---

## 2. Review questions

Every feature must be answered against these mandatory questions. Each maps to an approved source; a "No" on a starred (★) question is a **BLOCKER**.

**Attention and friction (PRODUCT_EXPERIENCE §1, §4; PC-05)**
- Does this reduce, or at least not increase, the operator's attention cost at the point of work?
- ★ Does capture stay at least as fast as before? *(Capture speed is non-negotiable — US-2.)*
- Does it avoid demanding attention the biology did not (no nagging, no alerts serving the system)?

**Operational memory and traceability (PC-06, PC-11; INV-1, INV-2, INV-3)**
- ★ Does it preserve append-only, immutable history (corrections as new events, never edits)?
- ★ Does every fact it creates anchor to exactly one container and carry operator attribution?
- Does it increase, or at least preserve, traceability?
- ★ Does object identity remain persistent, unique, and non-encoding?

**Cognitive load and simplicity (PRODUCT_EXPERIENCE §1; PC-05)**
- Does it reduce thinking rather than add it?
- Does it avoid introducing unnecessary complexity or new concepts the operator must learn?

**Boundaries and knowledge (PC-07, PC-08; ADR-0003; INV-7)**
- ★ Does it stay inside Field OS's ownership — writing only operational evidence, never knowledge, recipes, or hardware commands?
- ★ Does it reference rather than duplicate what a neighbouring system owns?

**Judgment and interpretation (PC-09, PC-12; ADR-0002; INV-5, INV-10)**
- ★ Does it respect operator judgment — recording and at most presenting evidence, never deciding?
- ★ Does it keep evidence before interpretation (nothing interprets before or rewrites the record)?

**Deferral discipline (PC-04; ADR-0002; INV-8)**
- Is this actually needed now, or is it deferred capability being smuggled in early?
- If it reserves a future capability, does it do so without building it?

**Sessions (FIELD_OS_MVP_ARCHITECTURE §4; PRODUCT_EXPERIENCE §3)**
- ★ Does it keep sessions as interaction constructs that persist nothing — only events persist?

A feature that cannot answer every starred question with "Yes" is not accepted, however desirable it seems.

---

## 3. Experience review

Beyond the checklist, one holistic question: **does the feature still feel like "a quiet companion that remembers"?** (PRODUCT_EXPERIENCE §0). If using it makes the operator feel they are operating an application rather than doing cultivation that is quietly remembered, the feature has failed the experience review even if it passes every architectural check.

**Signs the experience is drifting — each is a warning, an accumulation is a Reject:**

- **Toward ERP.** The operator must configure, set up, or maintain the tool; the tool has become a second job. *(Violates PRODUCT_EXPERIENCE §1 calm, §5.)*
- **Dashboard-first.** The product opens onto metrics and overviews rather than the object in hand; browsing displaces working. *(Violates §4 attention design.)*
- **Form-filling.** Capture becomes a sequence of fields to complete rather than a light mark on a real thing; the operator serves the form. *(Violates §1 low friction, §8 "capture once".)*
- **Notification overload.** The tool interrupts to serve itself — alerts, badges, reminders the biology did not ask for. *(Violates §4, PC-09; note monitoring/alerting is deferred, ADR-0002.)*
- **Automation for its own sake.** The tool acts or decides because it can, not because an operational problem required it. *(Violates PC-12, ADR-0002.)*

The test is felt, not counted: if a designer cannot honestly say the feature keeps the tool a guest in the grow room, it is drifting.

---

## 4. Architecture review

Verify explicit consistency with each governing document. A conflict is a BLOCKER; the feature is revised until it conforms, or rejected.

- **PRODUCT_CANON.** No principle PC-01 … PC-12 is contradicted. The feature does not covertly reopen a settled decision; if it seems to require one, that is an ADR matter, not a feature (PRODUCT_CANON §5, §7).
- **PRODUCT_ARCHITECTURE.** Every invariant INV-1 … INV-11 holds. The feature fits the mental model (memory, not screens) and does not create a second write path or reverse the information flow (§1, §4, §7).
- **DATA_MODEL.** The feature introduces **no new persistent entity** and does not collapse conceptual entities into implementation shortcuts. It respects identity, relationships, and derived-not-stored state (§2–§6).
- **MODULE_MAP.** Responsibilities land in the correct module; the feature does not blur a module's boundary or invent a module. The single writer (Identity → Capture → Records) is preserved; boundaries stay read-only (§4, §7).
- **SYSTEM_INTERACTIONS.** Hand-offs match the approved flows; nothing edits or detaches a prior fact; any interpretation re-enters only as a new event (§2, §3, §6). Anything that would make Field OS a second writer, an owner of a neighbour's domain, or a controller of hardware is a **boundary change requiring ADR-0003 review**, not a feature (§7).

---

## 5. Implementation review

Before acceptance, the proposer must answer, in writing, four questions (FIELD_OS_MVP_ARCHITECTURE; ADR-0002):

1. **What operational problem does it solve?** Name the real problem in daily lab or cultivation work. "It would be nice" is not a problem. A feature with no operational problem is rejected regardless of quality.
2. **What existing workflow does it improve?** Point to a specific USER_WORKFLOW (WF-1 … WF-10) or the daily narrative it makes better. A feature that improves nothing that already exists is likely inventing need.
3. **Does it increase or decrease friction?** Net effect on capture speed and attention, stated honestly. A friction increase must be justified by a traceability or safety gain that outweighs it — and even then is suspect (US-2).
4. **Does it introduce unnecessary complexity?** New concepts, new configuration, new things to learn or maintain. If simpler achieves the same, the simpler wins (repository CANON P-02, simplicity over sophistication).

A feature that cannot give crisp answers to all four is not ready for review.

---

## 6. Acceptance criteria

A feature becomes part of Field OS only when all of the following are satisfied. **BLOCKER** items are absolute.

- **★ BLOCKER — Invariant safety.** No architectural invariant (INV-1 … INV-11) is violated. Verified against Section 4.
- **★ BLOCKER — Boundary safety.** Field OS writes only operational evidence; nothing crosses into owning knowledge, recipes, or control (ADR-0003; PC-08).
- **★ BLOCKER — History safety.** Append-only and immutable; no capability edits or deletes a prior fact (PC-11; INV-3).
- **★ BLOCKER — Judgment safety.** The feature does not decide for the operator; it records and at most presents evidence (PC-12; PC-09).
- **★ BLOCKER — Sessions persist nothing.** Only events persist (FIELD_OS_MVP_ARCHITECTURE §4).
- **Problem-solving.** A named operational problem and an improved existing workflow (Section 5).
- **Friction.** Capture speed is preserved or improved; measured, not asserted (target: the action is no slower than today, ideally faster — US-2).
- **Traceability completeness.** Any object or event it produces is fully identified and attributed (INV-1, INV-2).
- **Simplicity.** No unnecessary entity, concept, configuration, or module; the simplest form that solves the problem (CANON P-02).
- **Experience fidelity.** Passes the "quiet companion" test and shows none of the drift signs in Section 3.
- **Deferral honesty.** It is needed now; it does not smuggle in a deferred capability (PC-04; ADR-0002).
- **Assumption honesty.** It does not treat a `Proposed` assumption as settled truth (PC-09, PC-10) — e.g. it does not assume multi-user, reliable connectivity, or trusted automated sensing.

Where a criterion is measurable, it is measured on real use, not estimated: capture time per event, share of operations captured, share of containers with complete lifecycle, share of events attributed and recipe-referenced. A feature that cannot be measured against these is accepted provisionally and re-reviewed after real use.

---

## 7. Design debt

Indicators that the product is drifting from its philosophy. One is a caution; a cluster is a mandate to stop and correct. Design debt is tracked and reviewed like any other debt — it does not disappear by being ignored.

**Experience debt.**
- Operators start keeping notes *outside* Field OS — the surest sign capture friction has grown too high (US-2 failing in the field).
- Sessions are opened less often, or abandoned mid-day, without a physical reason.
- New operators need training or a manual to capture routine work.
- The tool has begun to notify, remind, or alert.

**Architecture debt.**
- A new persistent entity has appeared that is not in DATA_MODEL.
- A second write path into history exists, or something edits a prior fact.
- Field OS has begun to compute a recipe, hold knowledge as its own, or touch control — a boundary breach (ADR-0003).
- A `Proposed` assumption is being relied on as if validated (PC-10).

**Cognitive debt.**
- The operator is asked the same thing twice (violates "capture once").
- Capture has become field-filling; the number of required inputs per event is climbing.
- The product opens onto dashboards or overviews rather than the work.

**Deferral debt.**
- Deferred capabilities (AI interpretation, monitoring, scheduling, optimization, automation control) have crept in under other names.
- Interpretation is preceding or rewriting evidence anywhere.

When debt is found, the response is not to add more features to compensate but to return to the approved documents and correct the drift. The measure of the product's health is not how much it does, but how faithfully it still does the one thing it was built to do: **let the operator work while Field OS quietly, reliably remembers.**

---

## Appendix — One-page review checklist

Run for every feature, interaction, or workflow. Any ★ "No" blocks acceptance.

```
PROBLEM
[ ] Names a real operational problem in daily lab/cultivation work
[ ] Improves a specific existing workflow (WF-1…WF-10 / daily narrative)

FRICTION & ATTENTION
[ ] ★ Capture is no slower than today (measured)
[ ] Reduces or preserves attention cost at the point of work
[ ] No nagging, alerts, or notifications the biology did not require

MEMORY & TRACEABILITY
[ ] ★ Append-only, immutable; corrections are new events
[ ] ★ Every fact anchors to one container, with operator attribution
[ ] ★ Object identity persistent, unique, non-encoding
[ ] Traceability increased or preserved

BOUNDARIES
[ ] ★ Writes only operational evidence (no knowledge/recipe/control)
[ ] ★ References rather than duplicates a neighbour's data
[ ] ★ Not a boundary change (else → ADR-0003 review, not a feature)

JUDGMENT & INTERPRETATION
[ ] ★ Does not decide for the operator
[ ] ★ Evidence precedes interpretation; nothing rewrites the record

SESSIONS & DEFERRAL & ASSUMPTIONS
[ ] ★ Sessions persist nothing; only events persist
[ ] Needed now; no deferred capability smuggled in
[ ] No Proposed assumption treated as settled

EXPERIENCE
[ ] Still feels like "a quiet companion that remembers"
[ ] No drift toward ERP / dashboard-first / form-filling / notifications / automation-for-its-own-sake

OUTCOME:  [ ] Accept   [ ] Revise (list failed checks)   [ ] Reject
```

---

*Document version: 1.0*
*Effective date: 2026-07-05*
*Authority: Field OS product governance (design review)*
*Governed by: ADR-0001, ADR-0002, ADR-0003, PRODUCT_CANON.md, PRODUCT_ARCHITECTURE.md, DATA_MODEL.md, MODULE_MAP.md, USER_WORKFLOWS.md, SYSTEM_INTERACTIONS.md, RECIPE_SIMULATOR_INTEGRATION.md, FIELD_OS_MVP_ARCHITECTURE.md, PRODUCT_EXPERIENCE.md, PRODUCT_ASSUMPTIONS.md*
*Reviews implementations against approved intent, not visual taste. Introduces no new principle. A single BLOCKER failure prevents acceptance.*
