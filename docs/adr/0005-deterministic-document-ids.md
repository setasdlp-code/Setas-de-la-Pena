# ADR-0005: Deterministic document IDs where a stable identity exists

Status: Accepted
Date: 2026-08-29 (recorded 2026-08-30)

## Context

Field devices retry. With generated IDs, a retried write creates a duplicate cycle,
telemetry point, or evidence record, silently inflating sample counts — which then
corrupt any statistic computed over them.

## Decision

Writes use deterministic document IDs wherever a stable natural identity exists:

- `CycleEvidence` → `cycleId + batchId`
- telemetry → `room_id__device_id__metric__observed_at`
- room cycles → `id`

Upserts replace by key rather than appending.

## Consequences

- Retries are idempotent; no deduplication pass is needed downstream.
- Sample sizes in `buildHistoricalEvidence()` mean what they say.
- Changing an identity key is a migration, not a refactor — existing documents will
  not collide with the new scheme.

## Related — added 2026-08-30 after ADR-0007

ADR-0007 promotes `ebConfidence` to `high` only at `n >= 20` recent lots. That makes
count integrity load-bearing for a user-visible claim: an inflated count now buys a
narrower interval, not just a wrong-looking number.

It also exposes a scope limit in this ADR that was harmless until 0007 existed. The
two confidence scales count **different pools**, and only one of them is covered here:

| Scale | Counting pool | Covered by this ADR |
|---|---|---|
| A — evidence confidence | `setas.cycle-evidence.v1` records, via `buildHistoricalEvidence()` | **Yes** — written through `upsertBy` with `cycleId + batchId` |
| B — `ebConfidence` band width | Bitácora rows, via `bitacoraEBRows()` → `weightedCalibration()` | **No** — derived from `sdp_bit_lotes` / `sdp_bit_cosechas`, keyed by `lote.id` |

Scale B's `n` and `recentN` are counted by iterating `bitLotes`, one row per lote.
That is single-valued only insofar as Bitácora itself holds one record per lote —
a property this ADR's scheme does not establish, because Bitácora lote and cosecha
writes are not among the three identity keys decided above.

This is recorded as a known limit, not a decision to change the keys. Extending
deterministic identity to Bitácora writes would be a new decision, and by the terms
of this ADR a migration rather than a refactor.

## Source

`PRODUCTION_LEARNING_LOOP_V1.md`, "Persistence vertical";
`production-learning-bridge.js` (`upsertBy`, `keyFn`);
`historical-calibration.js` (`bitacoraEBRows`, `weightedCalibration`) for the
Scale B pool referenced above.
