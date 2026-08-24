# Setas OS — Production Learning Loop v1

Status: implementation foundation + persistence vertical
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

## Persistence and operational bridge

### Firestore

The existing `firebase/db.js` now persists the learning loop in three explicit collections:

- `room_cycles`
- `telemetry_readings`
- `cycle_evidence`

Writes use deterministic document IDs where a stable identity exists, so retries do not create duplicate cycles, telemetry points or evidence records.

### `production-learning-bridge.js`

This bridge keeps localStorage as the immediate operational cache while using the existing Firebase layer as persistence. It:

1. validates and stores RoomCycles;
2. validates, normalizes and stores telemetry;
3. resolves a Bitácora batch and only its own bags/harvests;
4. verifies that the batch belongs to the requested RoomCycle;
5. materializes `CycleEvidence` from Bitácora + cycle telemetry + recipe/ingredient traceability;
6. persists the evidence with a stable `cycleId + batchId` identity;
7. builds `setas.historical-evidence.v1` for the active species.

The bridge is loaded from `firebase/db.js` after `window.SetasDB` is published, so it can remain independent from React navigation and component lifecycle.

## Perito integration boundary

`SetasPeritoScenarios.searchScenarios()` is wrapped at runtime only to add:

- `context.historicalEvidence`
- `context.productionLearning`

The returned scenario result also exposes those two fields for explanation/UI work.

This version does **not** modify `scoring.js`, `perito-scenarios.js`, `historyCalibration`, ranking weights or recipe selection. Production evidence is contextual only. A later calibration change must be separately validated against ground-truth fixtures before it can influence ranking.

## Explicit non-goals of this PR

- no new navigation state;
- no React/UI changes;
- no automatic hardware/sensor transport ingestion yet;
- no autonomous actuator control;
- no change to `scoring.js` or the source of `perito-scenarios.js`;
- no automatic promotion of local observations into canonical agronomic claims;
- no causal inference from observational production history.

## Next vertical

1. Trigger `CycleEvidence` materialization automatically at defined harvest/close milestones instead of requiring an explicit bridge call.
2. Add a sensor adapter for ESP32 payloads that maps hardware messages into `setas.telemetry.v1` before persistence.
3. Add `Hoy` exceptions for stale sensors, quarantined readings, environmental deviations and batches deviating materially from historical cycle duration.
4. Surface the contextual evidence in Perito explanations without changing recommendation scores.
5. Only after sufficient comparable cycles exist, evaluate a separately gated calibration model against held-out production data.

## Safety/quality rule

Setpoints, physical validation bounds, literature targets and farm-measured historical distributions are different data classes. They must never be silently substituted for one another.
