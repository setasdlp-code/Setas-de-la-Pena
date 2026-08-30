# ADR-0004: Production evidence is Perito context, never an input to ranking

Status: Accepted
Date: 2026-08-29 (recorded 2026-08-30)

## Context

Once the farm accumulates real cycle outcomes, the obvious move is to feed them back
into recipe scoring. That move infers causality from observational data: production
batches have no control arm, no randomization, and confounded conditions.

## Decision

`SetasPeritoScenarios.searchScenarios()` is wrapped at runtime to attach
`context.historicalEvidence` and `context.productionLearning`. Production evidence is
**contextual only**. This boundary does not modify:

- `scoring.js`
- the source of `perito-scenarios.js`
- `historyCalibration`
- ranking weights or Escenario selection

Any future calibration change must be separately validated against ground-truth
production fixtures before it may influence ranking.

## Consequences

- Perito can *explain* using real outcomes without its recommendations drifting on
  confounded data.
- Improving predictions from production data is gated on a real fixture corpus and an
  explicit, separately-reviewed decision.
- Scenario ordering is a regression surface: a change that alters ranking while
  claiming to be display-only violates this ADR.

## Related

ADR-0007 records a pre-existing exception discovered after this boundary was drawn.

## Source

`PRODUCTION_LEARNING_LOOP_V1.md`, "Perito integration boundary" and
"Explicit non-goals"; `production-learning-bridge.js:122-138`.
