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

## Source

`PRODUCTION_LEARNING_LOOP_V1.md`, "Persistence vertical";
`production-learning-bridge.js` (`upsertBy`, `keyFn`).
