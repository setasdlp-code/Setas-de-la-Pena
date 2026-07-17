# PRODUCT_ASSUMPTIONS — SdP Field OS

## Purpose

This document records **assumptions, not decisions**. It exposes the beliefs on which the approved ADRs and any future product constitution rest, so that each can be scrutinized, tracked and validated before it hardens into canon.

Nothing here changes the ADRs (ADR-0001 Central Operational Unit, ADR-0002 Product Priority, ADR-0003 System Boundary). Nothing here decides anything new. Each entry states what is believed, why, on what evidence, how confident we are, how it could be tested, and what breaks if it is wrong.

Confidence levels: **High** (strong evidence, low doubt) · **Medium** (plausible, partial evidence) · **Low** (belief with little or no direct evidence).

---

## Governance metadata

This document is a **living governance artifact**, not a static list. Every assumption below carries six governance fields in addition to its narrative. They exist to make validation traceable — to answer, for any assumption, *what state it is in, who is accountable for it, where it came from, how it will be tested, what event should trigger that test, and how often it should be revisited.*

- **Status** — the assumption's position in its lifecycle. Allowed values: `Proposed` · `Observed` · `Validated` · `Rejected` · `Retired`. Every assumption currently defaults to **Proposed** (none has yet been tested against reality). Transitions are defined in *Assumption Lifecycle* at the end of this document.
- **Owner** — the role accountable for validating the assumption. Allowed values: `Founder` · `Operations` · `Laboratory` · `Research` · `Field OS`.
- **Origin** — where the belief originated. Allowed values: `ADR` · `Repository` · `Operational Experience` · `Scientific Literature` · `Product Design` · `User Interview`.
- **Validation Method** — how the assumption can realistically be tested (e.g. operational observation, pilot deployment, field testing, software prototype, laboratory experiment, longitudinal operational data, user interview, scientific evidence).
- **Validation Trigger** — the event that should prompt validation (e.g. first production deployment, ten completed batches, first external user, first laboratory season, hardware integration, multi-user deployment).
- **Review Frequency** — how often the assumption should be revisited absent a trigger. Values: `Never` · `Quarterly` · `After milestone` · `After deployment` · `After production season`.

The consolidated ranking of what to validate first is in *Assumption Validation Priorities*.

---

## Operational

### OP-1 — Discrete containers are the real unit of production
**Assumption:** Production consists of physically discrete, individually distinguishable objects (blocks, bags, jars) throughout the cultivation cycle.
**Why we believe it is true:** Current and planned production uses bagged/blocked substrate and jars; these are handled as separate objects.
**Supporting evidence:** Equipment records referencing bags and filters; substrate and spawn documentation organized around discrete containers.
**Confidence level:** High.
**How it can be validated:** Confirm on site that every object passing through production carries or can carry a distinct identity, and that no bulk/continuous format is planned.
**Consequences if false:** ADR-0001's atomic unit is invalid; the data model's primary key must change.
**Related ADRs:** ADR-0001.
**Status:** Proposed.
**Owner:** Operations.
**Origin:** Operational Experience.
**Validation Method:** Operational observation on site across a full cycle.
**Validation Trigger:** First production deployment.
**Review Frequency:** After production season.

### OP-2 — Batches are a stable grouping above containers
**Assumption:** Containers are consistently produced and moved in batches, and batch membership is knowable at creation time.
**Why we believe it is true:** Inoculation and substrate preparation are done in runs, not per single object.
**Supporting evidence:** Operational planning documents describe batch-oriented preparation and scheduling.
**Confidence level:** Medium.
**How it can be validated:** Observe whether every container can be assigned to exactly one batch at creation without ambiguity.
**Consequences if false:** Batch-to-container inheritance (OP-2 → data model) becomes unreliable; more events must be captured per container.
**Related ADRs:** ADR-0001.
**Status:** Proposed.
**Owner:** Operations.
**Origin:** Operational Experience.
**Validation Method:** Operational observation of batch assignment during preparation.
**Validation Trigger:** Ten completed batches.
**Review Frequency:** After production season.

### OP-3 — Most operational events are worth recording at container grain
**Assumption:** The events that matter for traceability (inoculation, transfer, contamination, harvest, disposal) occur at or can be attributed to the container level.
**Why we believe it is true:** Contamination and developmental divergence are observed on individual objects.
**Supporting evidence:** Cultivation experience and lessons-learned notes reference per-object outcomes.
**Confidence level:** Medium.
**How it can be validated:** Log a real cycle and check what fraction of meaningful events naturally resolve to a single container.
**Consequences if false:** Container-grain capture imposes cost without proportional traceability benefit; batch grain may suffice.
**Related ADRs:** ADR-0001, ADR-0002.
**Status:** Proposed.
**Owner:** Operations.
**Origin:** Operational Experience.
**Validation Method:** Operational observation — one fully logged cultivation cycle analysed for event grain.
**Validation Trigger:** First fully logged production cycle.
**Review Frequency:** After production season.

### OP-4 — A record of "what happened" is the current operational gap
**Assumption:** The most valuable first capability is a faithful record of events, because that record does not reliably exist today.
**Why we believe it is true:** Operations are run by a caretaker while decisions are guided remotely, creating a gap between action and visibility.
**Supporting evidence:** Remote-operation context; absence of a systematic operational log in the repository.
**Confidence level:** High.
**How it can be validated:** Confirm with the caretaker and remote operator that missing/unreliable event history is a real, felt problem.
**Consequences if false:** ADR-0002's ledger-first priority solves a non-problem; an advisor or monitor may be the true first need.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Founder.
**Origin:** Operational Experience.
**Validation Method:** User interview with caretaker and remote operator.
**Validation Trigger:** First production deployment.
**Review Frequency:** After deployment.

---

## Users

### US-1 — The primary user is a single on-site caretaker
**Assumption:** v1 is used chiefly by one caretaker in Tenjo who performs the physical work and the logging.
**Why we believe it is true:** Current operating model is one caretaker on site, operator remote.
**Supporting evidence:** Project memory on remote operation from Tenjo.
**Confidence level:** High.
**How it can be validated:** Confirm staffing and who is expected to enter records day to day.
**Consequences if false:** Multi-user roles, permissions and concurrency assumptions change the capture design.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Founder.
**Origin:** Operational Experience.
**Validation Method:** User interview / staffing confirmation.
**Validation Trigger:** First production deployment.
**Review Frequency:** After milestone.

### US-2 — The caretaker will log events if capture is fast
**Assumption:** Adoption depends primarily on capture speed; a fast enough ledger will be used consistently.
**Why we believe it is true:** Data-entry burden is the classic failure mode of operational logs.
**Supporting evidence:** General operational-tooling experience; ADR-0002 names this risk explicitly.
**Confidence level:** Medium.
**How it can be validated:** Measure real logging compliance against capture time in a trial.
**Consequences if false:** The ledger is abandoned and records nothing; ADR-0002's value collapses regardless of design quality.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** Product Design.
**Validation Method:** Pilot deployment measuring logging compliance against capture time.
**Validation Trigger:** First production deployment.
**Review Frequency:** After deployment.

### US-3 — Caretaker and remote operator have different needs from the same record
**Assumption:** The caretaker primarily writes; the remote operator primarily reads and reviews.
**Why we believe it is true:** The operating model separates physical execution from decision-making.
**Supporting evidence:** Remote-operation context in project memory.
**Confidence level:** Medium.
**How it can be validated:** Interview both parties on what each needs to enter versus see.
**Consequences if false:** A single-role capture design may miss the review needs that justify the ledger.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Founder.
**Origin:** Operational Experience.
**Validation Method:** User interview with both caretaker and remote operator.
**Validation Trigger:** First production deployment.
**Review Frequency:** After milestone.

### US-4 — Users accept per-container identification in the field
**Assumption:** The caretaker will tolerate identifying individual containers (label/scan/select) during normal work.
**Why we believe it is true:** Per-container traceability is the point of ADR-0001.
**Supporting evidence:** None direct yet; inferred from the decision.
**Confidence level:** Low.
**How it can be validated:** Trial a container-identification method during real handling and measure friction and error rate.
**Consequences if false:** Container-grain logging is not performed; traceability degrades exactly where ADR-0001 promises strength.
**Related ADRs:** ADR-0001.
**Status:** Proposed.
**Owner:** Operations.
**Origin:** ADR.
**Validation Method:** Field testing of a container-identification method under real handling.
**Validation Trigger:** First production deployment.
**Review Frequency:** After deployment.

---

## Data

### DA-1 — Every container can carry a persistent unique identifier
**Assumption:** A stable, unambiguous identifier per container is feasible and survives the cultivation cycle.
**Why we believe it is true:** The repository maintains an Identifier Standard for persistent objects.
**Supporting evidence:** IDENTIFIER_STANDARD.md exists in the knowledge base.
**Confidence level:** Medium.
**How it can be validated:** Apply the Identifier Standard to real containers and confirm identifiers persist through handling, moisture and transfers.
**Consequences if false:** Container identity is lost mid-cycle; the atomic unit cannot be tracked reliably.
**Related ADRs:** ADR-0001.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** Repository.
**Validation Method:** Field testing — identifiers applied to real containers through a full cycle.
**Validation Trigger:** First production deployment.
**Review Frequency:** After deployment.

### DA-2 — Operational events fit a bounded, enumerable vocabulary
**Assumption:** The set of event types worth recording in v1 is small and stable enough to define up front.
**Why we believe it is true:** Cultivation follows repeatable stages with recurring event kinds.
**Supporting evidence:** SOP-like structure in operations documentation.
**Confidence level:** Medium.
**How it can be validated:** Draft the v1 event vocabulary and test it against a full logged cycle for gaps.
**Consequences if false:** The ledger's schema churns; capture design cannot stabilize.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** Product Design.
**Validation Method:** Software prototype — draft vocabulary tested against a full logged cycle.
**Validation Trigger:** First fully logged production cycle.
**Review Frequency:** After milestone.

### DA-3 — Operational evidence is separable from knowledge, recipes and sensor data
**Assumption:** What Field OS writes (operational evidence) can be cleanly distinguished from what it reads (knowledge, formulations, sensor data).
**Why we believe it is true:** The repository already separates these responsibilities by design.
**Supporting evidence:** REPOSITORY_MAP.md and folder-role separation; ADR-0003.
**Confidence level:** High.
**How it can be validated:** Categorize a sample of real records and confirm each falls unambiguously on one side of the boundary.
**Consequences if false:** ADR-0003's write target blurs; Field OS begins absorbing neighbouring domains' data.
**Related ADRs:** ADR-0003.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** Repository.
**Validation Method:** Operational observation — sample records categorized against the boundary.
**Validation Trigger:** First production deployment.
**Review Frequency:** After milestone.

### DA-4 — Batch-level events can be inherited by member containers without loss
**Assumption:** Some events logged once at batch level correctly apply to all member containers.
**Why we believe it is true:** Batch operations (e.g. shared substrate prep) affect all members identically.
**Supporting evidence:** Batch-oriented preparation in operations docs.
**Confidence level:** Low.
**How it can be validated:** Identify which real events are truly uniform across a batch versus which vary per container.
**Consequences if false:** Inheritance introduces false records; per-container capture cannot be reduced as hoped.
**Related ADRs:** ADR-0001.
**Status:** Proposed.
**Owner:** Operations.
**Origin:** Operational Experience.
**Validation Method:** Operational observation — classify real events as batch-uniform vs. per-container.
**Validation Trigger:** Ten completed batches.
**Review Frequency:** After production season.

---

## Mobile

### MO-1 — Capture happens at the point of physical work
**Assumption:** Records are entered where the containers are handled, not later at a desk.
**Why we believe it is true:** Faithful, fast capture requires proximity to the object and the moment.
**Supporting evidence:** ADR-0002 emphasizes fast, faithful capture; single on-site caretaker (US-1).
**Confidence level:** Medium.
**How it can be validated:** Observe where and when the caretaker would realistically log during a shift.
**Consequences if false:** Deferred/batched entry reduces record fidelity and undermines the ledger's value.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** Product Design.
**Validation Method:** Operational observation of logging moments during a real shift.
**Validation Trigger:** First production deployment.
**Review Frequency:** After deployment.

### MO-2 — A handheld device is available and usable in the growing environment
**Assumption:** The caretaker has a mobile device that functions in humid, gloved, hands-busy conditions.
**Why we believe it is true:** Mobile capture is the natural fit for point-of-work logging.
**Supporting evidence:** None direct yet.
**Confidence level:** Low.
**How it can be validated:** Confirm device availability and test usability under real environmental conditions (humidity, gloves).
**Consequences if false:** Point-of-work capture (MO-1) is impractical; a different capture channel is needed.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Operations.
**Origin:** Product Design.
**Validation Method:** Field testing of device usability under humidity and gloved handling.
**Validation Trigger:** Hardware integration.
**Review Frequency:** After deployment.

### MO-3 — Connectivity may be intermittent at the point of capture
**Assumption:** Network access in the growing space cannot be assumed continuous.
**Why we believe it is true:** Growing environments are frequently poorly covered; the facility is in Tenjo.
**Supporting evidence:** General facility conditions; no confirmed connectivity survey.
**Confidence level:** Low.
**How it can be validated:** Survey connectivity in each zone where logging would occur.
**Consequences if false (i.e. connectivity is reliable):** Offline-tolerant capture is unnecessary and can be simplified — a favourable failure. If assumed reliable but is not, records are lost at the moment of capture.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Operations.
**Origin:** Operational Experience.
**Validation Method:** Field testing — connectivity survey per growing zone.
**Validation Trigger:** First production deployment.
**Review Frequency:** After deployment.

---

## AI

### AI-1 — Advisory/monitoring capability is genuinely deferrable
**Assumption:** Useful AI-driven advice and monitoring can wait until the ledger exists, without losing their eventual value.
**Why we believe it is true:** Advice and alerts depend on reliable event history to be meaningful.
**Supporting evidence:** ADR-0002's rationale that later capabilities inherit the ledger's data.
**Confidence level:** Medium.
**How it can be validated:** Confirm no near-term operational decision strictly requires automated advice before a record exists.
**Consequences if false:** Deferring AV/monitoring withholds value the operation needs now; priority ordering is wrong.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Founder.
**Origin:** ADR.
**Validation Method:** Operational observation of decisions taken during ledger-only operation.
**Validation Trigger:** Ledger in reliable daily use (post-milestone).
**Review Frequency:** After milestone.

### AI-2 — The ledger will be structured enough to feed future AI later
**Assumption:** Recording "what happened" now produces data an advisor/monitor can later consume without a rebuild.
**Why we believe it is true:** ADR-0002 explicitly requires not architecting deferred capabilities out.
**Supporting evidence:** ADR-0002 consequences section.
**Confidence level:** Medium.
**How it can be validated:** Sketch a future advisor's data needs and check the v1 event model can satisfy them.
**Consequences if false:** The ledger must be re-shaped to enable AI, contradicting ADR-0002's intent.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** ADR.
**Validation Method:** Software prototype — future advisor data needs checked against the v1 event model.
**Validation Trigger:** After milestone (before scoping the next capability).
**Review Frequency:** After milestone.

### AI-3 — Cultivation parameters usable by future AI live in the Knowledge System
**Assumption:** The parameters an advisor would reason over are owned and maintained outside Field OS.
**Why we believe it is true:** ADR-0003 places knowledge and parameters outside the Field OS boundary.
**Supporting evidence:** Species/parameter documentation in the knowledge base; ADR-0003.
**Confidence level:** High.
**How it can be validated:** Confirm parameter authority remains in the Knowledge System as AI features are scoped.
**Consequences if false:** Field OS is pulled toward owning knowledge, breaching ADR-0003.
**Related ADRs:** ADR-0003.
**Status:** Proposed.
**Owner:** Research.
**Origin:** ADR.
**Validation Method:** Operational observation — parameter authority confirmed during AI feature scoping.
**Validation Trigger:** First AI feature scoped (post-milestone).
**Review Frequency:** After milestone.

---

## Growth

### GR-1 — Container volume will grow but stay individually trackable
**Assumption:** As production scales, containers remain identifiable individually rather than becoming too numerous to track per object.
**Why we believe it is true:** Modular scaling plans preserve discrete units.
**Supporting evidence:** Modular scaling and prototype planning documents.
**Confidence level:** Medium.
**How it can be validated:** Project container counts at target scale and test whether per-container capture remains feasible.
**Consequences if false:** ADR-0001's grain becomes operationally unsustainable at scale; batch grain may be forced.
**Related ADRs:** ADR-0001, ADR-0002.
**Status:** Proposed.
**Owner:** Operations.
**Origin:** Repository.
**Validation Method:** Longitudinal operational data — container counts tracked against scale targets.
**Validation Trigger:** Multi-user deployment.
**Review Frequency:** After production season.

### GR-2 — The single-caretaker model may expand to multiple users
**Assumption:** Growth could introduce additional caretakers or sites entering records concurrently.
**Why we believe it is true:** Scaling production usually scales staffing.
**Supporting evidence:** Scaling plans; no committed staffing model beyond current caretaker.
**Confidence level:** Low.
**How it can be validated:** Confirm staffing trajectory against production targets.
**Consequences if false (stays single-user):** Multi-user concerns can be deferred — favourable. If growth is assumed away but occurs, capture design lacks needed multi-user handling.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Founder.
**Origin:** Product Design.
**Validation Method:** User interview / staffing trajectory review against production targets.
**Validation Trigger:** Multi-user deployment.
**Review Frequency:** After milestone.

### GR-3 — Deferred capabilities are added in priority order, not all at once
**Assumption:** After the ledger, advisor/monitor/procedure capabilities are introduced sequentially as the record matures.
**Why we believe it is true:** ADR-0002 frames the next question as "which capability comes next."
**Supporting evidence:** ADR-0002 future-review section.
**Confidence level:** Medium.
**How it can be validated:** Confirm no external pressure forces simultaneous delivery of multiple capabilities.
**Consequences if false:** The ledger-first sequencing is compressed, raising the risk it warned against.
**Related ADRs:** ADR-0002.
**Status:** Proposed.
**Owner:** Founder.
**Origin:** ADR.
**Validation Method:** Operational observation of delivery pressure after the ledger stabilizes.
**Validation Trigger:** After milestone (ledger in daily use).
**Review Frequency:** After milestone.

---

## Infrastructure

### IN-1 — Field OS can read from all three neighbouring systems
**Assumption:** Integration seams to the Knowledge System, the simulator and the sensor/automation layer are technically reachable.
**Why we believe it is true:** All three exist in or alongside the repository today.
**Supporting evidence:** Knowledge base, simulator HTML artifacts, and sensor/automation planning all present in the workspace.
**Confidence level:** Medium.
**How it can be validated:** Prove a read path from each source into a Field OS context.
**Consequences if false:** ADR-0003's three inbound read seams cannot be realized; Field OS is isolated from its inputs.
**Related ADRs:** ADR-0003.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** ADR.
**Validation Method:** Software prototype — a proven read path from each of the three sources.
**Validation Trigger:** Hardware integration.
**Review Frequency:** After milestone.

### IN-2 — Sensor data can be referenced or ingested without owning the automation layer
**Assumption:** Field OS can use sensor data while control remains with the ESP32/HA layer.
**Why we believe it is true:** ADR-0003 forbids Field OS from commanding hardware but allows reading sensor data.
**Supporting evidence:** Automation architecture (ESP32/ESPHome, HA on RPi4) documented in project memory; ADR-0003.
**Confidence level:** Medium.
**How it can be validated:** Confirm a read-only data path from the sensor layer that carries no control authority.
**Consequences if false:** Using sensor data forces Field OS toward the control layer, breaching ADR-0003.
**Related ADRs:** ADR-0003.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** ADR.
**Validation Method:** Software prototype — a read-only sensor path carrying no control authority.
**Validation Trigger:** Hardware integration.
**Review Frequency:** After milestone.

### IN-3 — Existing sensor data will be trustworthy enough to reference
**Assumption:** Sensor inputs Field OS may reference are reliable enough to sit beside operational evidence.
**Why we believe it is true:** Functional Inkbird sensors are in use.
**Supporting evidence:** Project memory: VIVOSUN H05 discarded for bias; Inkbirds functional; HR control in manual pending T7/relay.
**Confidence level:** Low.
**How it can be validated:** Assess accuracy/coverage of the sensor set intended for reference.
**Consequences if false:** Referenced sensor data misleads review; better to reference less until sensing matures.
**Related ADRs:** ADR-0003.
**Status:** Proposed.
**Owner:** Laboratory.
**Origin:** Operational Experience.
**Validation Method:** Laboratory experiment / field testing of sensor accuracy and coverage.
**Validation Trigger:** Hardware integration.
**Review Frequency:** After production season.

---

## Repository

### RE-1 — Field OS belongs outside the knowledge base, as software
**Assumption:** Field OS product artifacts live in a software area separate from `knowledge_base/`.
**Why we believe it is true:** The repository separates validated knowledge from software product development.
**Supporting evidence:** Project instructions distinguishing `knowledge_base/`, `operations/`, and `software/simulator/field_os/`; ADR-0003's boundary.
**Confidence level:** High.
**How it can be validated:** Confirm the intended home for Field OS artifacts with the repository owner.
**Consequences if false:** ADRs and product docs are misfiled, blurring the separation ADR-0003 protects.
**Related ADRs:** ADR-0003.
**Status:** Proposed.
**Owner:** Founder.
**Origin:** Repository.
**Validation Method:** Operational observation — intended home confirmed with the repository owner.
**Validation Trigger:** First production deployment.
**Review Frequency:** After milestone.

### RE-2 — Operational evidence maps to the repository's `operations/` role
**Assumption:** What Field OS writes corresponds to the repository's designated home for primary operational evidence.
**Why we believe it is true:** The repository defines `operations/` as primary operational evidence.
**Supporting evidence:** Folder roles in project instructions.
**Confidence level:** Medium.
**How it can be validated:** Confirm whether Field OS output is stored in, exported to, or merely aligned with `operations/`.
**Consequences if false:** Field OS's write target has no clear repository home, risking duplication or drift.
**Related ADRs:** ADR-0002, ADR-0003.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** Repository.
**Validation Method:** Operational observation — write target reconciled against the `operations/` role.
**Validation Trigger:** First production deployment.
**Review Frequency:** After milestone.

### RE-3 — The Identifier Standard can govern Field OS container IDs
**Assumption:** The repository's existing Identifier Standard is adequate to identify Field OS's atomic unit.
**Why we believe it is true:** The standard exists precisely for persistent objects.
**Supporting evidence:** IDENTIFIER_STANDARD.md in `00_project/`.
**Confidence level:** Medium.
**How it can be validated:** Check the standard against the container-identification needs of ADR-0001.
**Consequences if false:** Container identity requires a scheme the standard does not cover, forcing an extension or exception.
**Related ADRs:** ADR-0001.
**Status:** Proposed.
**Owner:** Field OS.
**Origin:** Repository.
**Validation Method:** Software prototype — the Identifier Standard checked against ADR-0001's container needs.
**Validation Trigger:** First production deployment.
**Review Frequency:** After milestone.

### RE-4 — ADRs and product docs do not duplicate knowledge-base content
**Assumption:** Field OS architecture records can stay distinct from canonical knowledge documents without overlap.
**Why we believe it is true:** The repository prohibits duplicating knowledge across documents.
**Supporting evidence:** Repository instructions on non-duplication and authority order.
**Confidence level:** Medium.
**How it can be validated:** Review Field OS docs against canonical documents for overlapping claims.
**Consequences if false:** Knowledge duplicates across the boundary, creating conflicting sources of truth.
**Related ADRs:** ADR-0003.
**Status:** Proposed.
**Owner:** Research.
**Origin:** Repository.
**Validation Method:** Operational observation — Field OS docs reviewed against canonical documents for overlap.
**Validation Trigger:** After milestone.
**Review Frequency:** Quarterly.

---

## Open note

Every assumption above is a candidate for validation before the product constitution (PRODUCT_CANON) is written. Low-confidence assumptions — notably US-4, DA-4, MO-2, MO-3, IN-3, and GR-2 — carry the most risk of silently invalidating an ADR and should be tested first.

---

# Assumption Validation Priorities

This ranking orders every assumption by **urgency of validation**, combining operational risk (what breaks if the assumption is false) with current confidence (how much doubt remains). High-risk, low-confidence assumptions rank first, because they are the ones most likely to silently invalidate an approved ADR. A high-confidence assumption may still rank early when it is foundational and cheap to confirm.

*Operational Risk* here means the severity of consequence if the assumption proves false, independent of how likely that is. *Recommended Validation Order* is the sequence in which validation effort should be spent.

| Order | ID | Confidence | Operational Risk | Expected Validation Method |
|------|------|-----------|------------------|----------------------------|
| 1 | US-2 | Medium | High | Pilot deployment (logging compliance vs. capture time) |
| 2 | US-4 | Low | High | Field testing of container identification |
| 3 | DA-1 | Medium | High | Field testing of persistent identifiers through a cycle |
| 4 | OP-4 | High | High | User interview (caretaker + remote operator) |
| 5 | MO-2 | Low | High | Field testing of device usability (humidity, gloves) |
| 6 | MO-3 | Low | Medium | Field testing — connectivity survey per zone |
| 7 | DA-4 | Low | Medium | Operational observation — batch-uniform vs. per-container events |
| 8 | IN-3 | Low | Medium | Laboratory experiment / field testing of sensor accuracy |
| 9 | OP-1 | High | High | Operational observation on site |
| 10 | US-1 | High | Medium | User interview / staffing confirmation |
| 11 | OP-2 | Medium | Medium | Operational observation of batch assignment |
| 12 | OP-3 | Medium | Medium | Operational observation — one fully logged cycle |
| 13 | US-3 | Medium | Medium | User interview (both parties) |
| 14 | DA-2 | Medium | Medium | Software prototype — vocabulary vs. logged cycle |
| 15 | MO-1 | Medium | Medium | Operational observation of logging moments |
| 16 | DA-3 | High | Medium | Operational observation — sample records categorized |
| 17 | IN-1 | Medium | Medium | Software prototype — read path from each source |
| 18 | IN-2 | Medium | Medium | Software prototype — read-only sensor path |
| 19 | RE-3 | Medium | Medium | Software prototype — Identifier Standard vs. ADR-0001 needs |
| 20 | RE-2 | Medium | Medium | Operational observation — write target vs. `operations/` |
| 21 | GR-1 | Medium | Medium | Longitudinal operational data — container counts vs. scale |
| 22 | GR-2 | Low | Low | User interview / staffing trajectory review |
| 23 | AI-1 | Medium | Medium | Operational observation during ledger-only operation |
| 24 | AI-2 | Medium | Medium | Software prototype — advisor data needs vs. event model |
| 25 | GR-3 | Medium | Medium | Operational observation of delivery pressure |
| 26 | AI-3 | High | Medium | Operational observation during AI feature scoping |
| 27 | RE-4 | Medium | Medium | Operational observation — docs reviewed for overlap |
| 28 | RE-1 | High | Low | Operational observation — confirm home with owner |

Reading the ranking: items 1–8 are the validation front line — mostly low-confidence assumptions whose failure would directly undermine an ADR, plus the two cheapest high-confidence checks (OP-4, then OP-1) that gate the ledger-first premise. Items 9–21 firm up the operational and integration model once the front line clears. Items 22–28 are lower urgency — either favourable-if-false (GR-2), naturally deferred to a later phase (AI-1, AI-2, GR-3, AI-3), or high-confidence housekeeping (RE-1).

This table is itself a living view: as assumptions change Status, they leave the queue (once `Validated` or `Rejected`) and the order below them advances.

---

# Assumption Lifecycle

Assumptions are not permanent. Each one moves through a defined lifecycle as evidence accumulates, and its **Status** field records where it currently sits. The lifecycle exists so that the maturing of belief into knowledge is visible and traceable — and so that no assumption hardens into PRODUCT_CANON without having earned it.

```
Proposed
   ↓
Observed
   ↓
Validated
   ↓
Rejected
   ↓
Retired
```

The arrows show the normal direction of travel, not a rigid single track: an assumption can reach `Rejected` from `Observed` or `Validated`, and `Retired` can be reached from any settled state. The states mean:

- **Proposed** — the assumption is stated and reasoned about but has not yet been tested against reality. Every assumption in this document currently sits here. This is the default and the honest starting point.
- **Observed** — real-world signal has begun to bear on the assumption (a first deployment, a logged cycle, a survey), but the evidence is partial or not yet conclusive. The assumption is being watched, not yet confirmed.
- **Validated** — the assumption has been tested by its Validation Method and the evidence supports it. A validated assumption is a candidate to inform PRODUCT_CANON. Its Confidence should be raised to reflect the evidence.
- **Rejected** — testing showed the assumption to be false or unsupportable. A rejected assumption is retained in this document (never deleted) with its evidence, because its consequences — often an impact on an ADR — must be surfaced and addressed, not hidden.
- **Retired** — the assumption is no longer live: it has been superseded, folded into canon, or made irrelevant by a change in product reality. It stays on record for traceability but no longer drives validation work.

**When transitions should occur:**

- **Proposed → Observed** — when the assumption's *Validation Trigger* fires and first evidence starts arriving, even before a verdict is possible. Recording this transition prevents an assumption from sitting untested after the event that should have exercised it.
- **Observed → Validated** — when the *Validation Method* has been carried out and the evidence clearly supports the assumption. Update Confidence at the same time.
- **Observed → Rejected** (or **Validated → Rejected**) — when evidence contradicts the assumption. A rejection should trigger review of every ADR named in *Related ADRs*, since a false assumption may undermine an accepted decision. This is the transition that most needs to be loud.
- **→ Retired** — from any settled state, when the assumption is absorbed into PRODUCT_CANON, replaced by a newer assumption, or made moot by a change in the product or operation. Retiring records that the assumption's job is done; it does not erase its history.

A **Review Frequency** cadence governs assumptions that are waiting on a trigger or sitting in `Observed`: it is the safeguard that a low-confidence assumption is periodically reconsidered rather than forgotten. `Never` marks an assumption stable enough to move only on an explicit trigger; the other cadences (`Quarterly`, `After milestone`, `After deployment`, `After production season`) tie the review rhythm to the operational and product calendar.

Only assumptions that have reached **Validated** should be allowed to inform the writing of PRODUCT_CANON. Everything still `Proposed` or `Observed` remains an open question, and anything `Rejected` is a warning to re-examine the decision it touched.
