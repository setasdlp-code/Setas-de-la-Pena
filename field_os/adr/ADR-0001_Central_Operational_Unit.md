# ADR-0001 — Central Operational Unit

## Status
Accepted

## Context

Field OS requires a single atomic unit around which all records, states, events and history are organized. Without a fixed anchor, traceability, sensor associations and operational events would attach to reality inconsistently, and the entire data model would inherit ambiguous granularity.

Setas de la Peña production moves physical objects — blocks, bags and jars — through cultivation, frequently handled together in groups. The question was whether the system should treat the group (batch) or the single physical object as the traceable object of record. This decision precedes and constrains every other structural decision, because it fixes the granularity at which reality is recorded.

## Decision

The **individual container** — a single block, bag or jar — is the atomic traceable object of Field OS.

The **batch** remains a valid grouping layer above the container, but it is a parent grouping, not the record anchor. Every operational event, state and history entry is anchored to an individual container. Batches organize containers; they do not replace them as the unit of record.

## Consequences

**Positive consequences.**
Traceability resolves to the finest operational grain that exists in reality: a single contaminated or exceptional object can be identified, isolated and explained without ambiguity. Biological, operational and knowledge traceability all attach to the same concrete object. Batch-level views remain fully available by aggregating their member containers, so no analytical capability is lost by choosing the finer grain.

**Tradeoffs.**
Per-container tracking imposes a higher identifier and data-entry burden than batch-only tracking. If capture is slow or granularity feels excessive relative to perceived value, records may go unrecorded, and traceability degrades precisely where it is supposed to be strongest. The finer grain raises the cost of every logged event.

**Operational implications.**
Each container must carry a persistent, unambiguous identifier consistent with the repository's Identifier Standard. The batch becomes a many-to-one parent of its containers. Some events may legitimately originate at the batch level and be inherited by member containers rather than entered per object; the mechanism for that inheritance is a downstream concern, but the anchor of record remains the container.

## Alternatives Considered

**The batch as the atomic unit.** Rejected because a batch masks intra-batch variation. Contamination, developmental divergence or handling exceptions routinely affect individual objects within an otherwise uniform batch; anchoring records to the batch would make those events unattributable and would permanently cap traceability above the grain at which problems actually occur.

**The physical zone (tent / chamber) as the unit.** Rejected because a zone is a location, not a produced object. Containers move between zones during a cultivation cycle; anchoring state to the zone would lose the identity and history of the objects passing through it and would conflate environmental state with object state.

**The cultivation cycle as the unit.** Rejected because a cycle spans multiple zones and many objects; it is a temporal grouping even coarser than the batch, and would sit even further from the concrete object that traceability must reach.

## Future Review

Reconsider this ADR only if the physical reality of production changes such that individual containers cease to be meaningfully distinguishable objects — for example, a shift to a continuous or bulk substrate format with no discrete units — or if sustained operational evidence shows that per-container capture is systematically not being performed, indicating the chosen grain is unworkable in practice rather than merely demanding. A change here invalidates the primary key of the entire model and must be treated as foundational.
