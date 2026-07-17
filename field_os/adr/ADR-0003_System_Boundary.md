# ADR-0003 — System Boundary

## Status
Accepted

## Context

Field OS exists alongside three established parts of the Setas de la Peña system: the Knowledge System (validated organizational knowledge and cultivation parameters), the substrate simulator (recipe and formulation logic), and the sensor and automation layer (environmental data and physical control). Without an explicit boundary, Field OS would tend to absorb responsibilities from its neighbours — accumulating knowledge, computing recipes, or issuing hardware commands — and the separations the repository is built to preserve would erode.

The system needed a decision about where Field OS stops: what it owns, what it merely reads, and what it must never become. This boundary determines integration seams, ownership of state, and which repository responsibilities Field OS is permanently forbidden from taking on.

## Decision

Field OS is the **operational execution layer**.

It **reads from** the Knowledge System (knowledge and parameters), the substrate simulator (recipe and formulation logic), and the sensor and automation layer (environmental data). It **writes back primarily to operational evidence** — the record of what happened in production.

Field OS is **not** the Knowledge System, **not** the simulator, and **not** the automation controller. It consumes their outputs and owns operational state alone. It is never the authoritative source for knowledge, recipes or hardware commands.

## Consequences

**Positive consequences.**
Each neighbouring system retains sole authority over its own domain, and Field OS gains a single, well-defined responsibility: recording operational reality. The separation the repository mandates — validated knowledge, recipe logic and physical control kept distinct — is preserved at the product boundary rather than left to convention. State ownership is unambiguous: three inbound read seams, one outbound write target.

**Tradeoffs.**
Because Field OS owns only operational evidence, capabilities that might feel natural to add — computing a formulation inline, adjusting a parameter, sending a control command — are deliberately out of scope and must be satisfied by the systems that own them. This can feel like friction: the operationally convenient move is sometimes the one the boundary forbids.

**Operational implications.**
Field OS integrates through three inbound read relationships and one outbound write relationship. It reads knowledge and parameters, reads recipe and formulation outputs, and reads sensor data; it writes operational evidence. It holds operational state only and defers to each neighbour as the authority for that neighbour's domain. The read mechanism for each source, and whether sensor data is ingested into operational evidence or only referenced, are integration questions downstream of this boundary — but the direction of authority is fixed here.

## Alternatives Considered

**Field OS includes the automation/control layer (it commands relays and environmental hardware).** Rejected because merging execution-of-record with physical control would place hardware command authority inside a system whose purpose is to record, coupling the integrity of the operational record to the reliability of control actuation and collapsing a separation the repository requires.

**Field OS includes the recipe/simulation logic (it computes formulations internally).** Rejected because it would duplicate and eventually diverge from the substrate simulator, creating two competing sources of formulation truth and dissolving the simulator's ownership of recipe logic.

**Field OS as operational-only consumer that owns nothing.** Rejected as under-specified: it correctly bars Field OS from owning knowledge or recipes, but leaves unclear what Field OS *does* own. The accepted decision is stronger — Field OS owns operational evidence and nothing else — which both bounds it and gives it a definite responsibility.

## Future Review

Reconsider this ADR only if the ownership of a neighbouring domain changes — for example, if the substrate simulator or the automation layer is retired, absorbed, or redefined such that its responsibilities have no other home. Any proposal to let Field OS write outside operational evidence, or to compute recipes or issue hardware commands internally, is a boundary change and must be evaluated against this record before being accepted, since it directly threatens the separations the repository exists to protect.
