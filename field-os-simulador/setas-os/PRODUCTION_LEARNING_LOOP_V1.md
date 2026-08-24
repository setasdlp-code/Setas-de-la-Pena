# Setas OS — Production Learning Loop v1

Status: implementation foundation
Scope: internal use by Setas de la Peña

## Product decision

Setas OS is initially an internal production and learning system, not a multi-tenant farm SaaS. The primary value loop is:

`ingredient lot → recipe version → production batch → room cycle → telemetry/events → flushes → EB/contamination/cost → evidence → Perito context`

This deliberately deprioritizes billing, tenant administration, public APIs, customer onboarding and generic farm-management features.

## Contracts added in v1

### `room-cycle.js`

`setas.room-cycle.v1` associates a room, species, biological stage, one or more batches, a time window and environmental targets. Room targets remain separate from physical sensor validation limits.

### `telemetry-contract.js`

`setas.telemetry.v1` normalizes the initial operational metrics:

- `temperature_c`
- `rh_pct`
- `co2_ppm`
- `substrate_temperature_c`

Every reading carries room, device, timestamp, quality and optional calibration provenance. Physically impossible readings are quarantined rather than silently averaged.

### `cycle-evidence.js`

`setas.cycle-evidence.v1` reuses `SetasBitacora.calcLoteStats()` for measured/calculated production outcomes and combines them with RoomCycle-scoped telemetry. It preserves recipe snapshot and physical ingredient-lot traceability when supplied.

A single observational cycle is capped at `medium` confidence. `setas.historical-evidence.v1` can aggregate comparable records for Perito context, but observational history alone never receives `high` confidence.

### `experiment-model.js`

`setas.experiment.v1` declares hypothesis, control, treatments, primary metric, replication, randomization and fixed/blocking factors before execution.

A one-replicate trial is valid but explicitly `exploratory`. Comparative evidence requires randomization and at least three planned replicates per arm. The promotion gate additionally requires completed primary-metric evidence and ingredient/recipe traceability for every arm before results can become a `comparative_evidence_candidate`.

## Explicit non-goals of this PR

- no new navigation state;
- no React/UI changes;
- no Firestore collections yet;
- no automatic sensor ingestion yet;
- no autonomous actuator control;
- no change to `scoring.js` or `perito-scenarios.js` ranking;
- no automatic promotion of local observations into canonical agronomic claims.

## Next vertical

1. Persist `RoomCycle` and telemetry through the existing Firebase layer.
2. Bind Bitácora batches to RoomCycle and preserve recipe/inventory-lot snapshots.
3. Materialize `CycleEvidence` when a cycle/batch reaches a harvest or close milestone.
4. Pass `setas.historical-evidence.v1` into the explicit Perito input contract as contextual evidence only.
5. Add `Hoy` exceptions for stale sensors, invalid readings, environmental deviations and batches deviating materially from historical cycle duration.

## Safety/quality rule

Setpoints, physical validation bounds, literature targets and farm-measured historical distributions are different data classes. They must never be silently substituted for one another.
