# ADR-0002 — Product Priority

## Status
Accepted

## Context

Field OS could plausibly begin life as any of several different products: a ledger that records what happened, an advisor that tells the caretaker what to do, a monitor that watches conditions and alerts on deviation, or a procedure engine that enforces correct execution of steps. These are not merely features to sequence; each implies a different core, a different primary interaction, and a different thing the system fundamentally *is* at first release.

A first version cannot credibly be all of them. The team needed to fix what capability is built and validated first, and what the rest of the system defers to. The choice had to reflect the operational reality that Setas de la Peña is run by a caretaker in Tenjo while decisions are guided remotely, where the immediate gap is a reliable record of what actually happened.

## Decision

The first usable version of Field OS is an **operational ledger**: it records what happened.

Advisory, monitoring and procedure-enforcement capabilities are explicitly deferred. Field OS v1 exists to capture operational evidence — a trustworthy, queryable account of events against the individual container — before it attempts to interpret, prescribe or enforce anything.

## Consequences

**Positive consequences.**
The system starts by producing the one asset every later capability depends on: an accurate operational record. An advisor, a monitor and a procedure engine all require reliable event history to function; building the ledger first means those later capabilities inherit real data rather than assumptions. It also delivers immediate, verifiable value — a faithful account of production — without depending on parameters, thresholds or decision logic being correct.

**Tradeoffs.**
A ledger that only records, without guiding the caretaker, can be perceived as low-value data entry, especially if capture is slow. That perception risk is real and directly threatens adoption: an abandoned ledger records nothing. The value of v1 is therefore contingent on capture being fast and on the record being genuinely used for review.

**Operational implications.**
The core of v1 is a write-optimized event log oriented toward fast, faithful capture, with read and query in service of human review rather than automation. No decision logic, no thresholds and no step-enforcement belong in v1. Crucially, the deferred capabilities must not be architected out: the ledger must be shaped so that advice, monitoring and procedure enforcement can later read from it, not so that adding them requires rebuilding the core.

## Alternatives Considered

**Advisor first (tell the caretaker what to do now).** Rejected because advice presupposes a trustworthy account of current and past state. Building prescription on top of an absent or unreliable record would produce confident guidance grounded in nothing, and would couple v1's value to the correctness of parameters that are still being validated.

**Monitor first (ingest sensors, alert on deviation).** Rejected because alerting without an operational record produces signals that cannot be situated in what the caretaker was actually doing. Monitoring is most useful once events and conditions can be correlated, which requires the ledger to exist.

**Procedure engine first (enforce SOP/checklist execution).** Rejected because enforcing correct execution presumes both stable procedures and a record against which execution is judged. Enforcement is the heaviest commitment and the least reversible; imposing it before the ledger exists risks constraining operations around procedures that have not yet been validated by recorded experience.

## Future Review

Reconsider this ADR once the ledger is in reliable daily use and operational evidence is accumulating faithfully — at which point the priority question reopens as *which deferred capability comes next* (advisor, monitor or procedure engine), not whether the ledger was the right start. Reconsider sooner only if evidence shows the pure-ledger framing is causing abandonment, indicating that some minimal guidance must accompany capture for the record to be maintained at all.
