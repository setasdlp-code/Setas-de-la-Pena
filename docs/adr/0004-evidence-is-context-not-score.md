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

## Related — amended 2026-08-30 after ADR-0007

ADR-0007 records a pre-existing exception discovered after this boundary was drawn.
It is worth stating precisely, because the unqualified reading of this ADR is wrong.

This ADR's "does not modify" list describes what the **production learning bridge**
leaves untouched. It was never a claim that no observational data reaches the user's
screen. A separate, older path already did: `historyCalibration` feeds
`scoring.js` `buildUncertainty()`, where farm history sets `ebConfidence` and thereby
the width of the EB interval a user sees. That path predates this vertical and was
inherited, not introduced by it.

So the boundary this ADR draws is narrower than "production evidence never affects
output":

- **Holds.** Production evidence does not enter ranking, Escenario selection, scoring
  weights, or evidence confidence (Scale A). That is the boundary and it is intact.
- **Does not hold.** Observational history may narrow the displayed EB prediction
  band (Scale B). ADR-0007 ratified this deliberately, under promotion criteria,
  rather than treating it as a violation to be closed.

The Consequences below should be read with that carve-out. "Recommendations do not
drift on confounded data" is about *ranking and evidence weight*, not about interval
width, which is governed by ADR-0007.

## Source

`PRODUCTION_LEARNING_LOOP_V1.md`, "Perito integration boundary" and
"Explicit non-goals"; `production-learning-bridge.js:122-138`.
