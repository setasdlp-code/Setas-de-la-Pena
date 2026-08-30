# ADR-0007: `low`/`medium`/`high` names two different confidence scales

Status: **Proposed — open question, requires a human scientific decision**
Date: recorded 2026-08-30

## Context

While verifying claims for the `agronomic-claims` skill, a conflict surfaced between
two subsystems that use the same three words for different quantities.

**Scale A — evidence confidence.** `cycle-evidence.js` caps confidence at `medium` by
construction:

```js
// buildCycleEvidence()
const confidence = completenessScore >= 3 ? 'medium' : 'low';

// buildHistoricalEvidence()
const confidence = completed.length >= 3 && withEnvironment.length >= 2 ? 'medium' : 'low';
```

Neither function can return `high`. `PRODUCTION_LEARNING_LOOP_V1.md` states the
rationale: observational history alone never earns high confidence, which is reserved
for formal experimental designs per `experiment-model.js` (`classify()` returns
`'comparative'` only when `randomization && minReplicates >= 3 && treatments.length >= 1`).

**Scale B — `ebConfidence`, the EB prediction band.** `scoring.js` `buildUncertainty()`
reaches `high` from observational history:

```js
if (h.n >= 8 && sim >= 0.8) ebConfidence = 'high';
else if (h.n >= 3 && sim >= 0.6) ebConfidence = 'medium';
```

`h` is `ctx.historyCalibration`, fed from real batch history via
`recetario-model-bridge.js:84`. The level is not cosmetic — it narrows the interval
the user sees, from `|eb| * 0.20` at low to `|eb| * 0.08` at high.

So farm-observational history **already** produces a `high` confidence label and a
tighter predicted range, on a scale that shares its vocabulary with one that forbids
exactly that.

## Why this is not simply a bug

Scale B predates the production learning vertical. That vertical explicitly listed
"no scoring/ranking recalibration" as a non-goal and left `scoring.js` and
`historyCalibration` untouched by design (ADR-0004). The behavior was inherited, not
introduced — and no record shows it was evaluated against the evidence-confidence
rule when that rule was written.

The two scales also measure genuinely different things. Scale A rates *how much a
body of evidence is worth*. Scale B rates *how tight a prediction interval should be
given similar past recipes*. A defensible position exists in which both are correct
as they stand and only the shared vocabulary is wrong.

## Options

1. **Rename only.** Keep both behaviors; give Scale B distinct terms (e.g.
   `bandWidth: wide | moderate | narrow`) so no reader conflates them. Cheapest;
   resolves the ambiguity without touching predictions shown to users.
2. **Cap Scale B at `medium`.** Make `ebConfidence` obey the same rule as evidence
   confidence. Widens intervals for well-sampled recipes — more conservative, and a
   visible change to what users are shown.
3. **Ratify Scale B explicitly.** Document that interval width may be tightened by
   observational similarity while evidence weight may not, and record why the
   distinction is sound.

## Decision

**None yet.** This is a scientific call about how the farm's own history may narrow a
prediction shown to an operator. It is not a refactor and must not be resolved by an
agent.

Until it is decided: never quote a confidence level without naming which scale it
came from, and do not make the two scales interact.

## Consequences (interim, while unresolved)

- Both behaviors stay exactly as they are. No agent may change either scale as a
  side effect of other work.
- Any UI rendering a confidence level must make its scale unambiguous to the reader.
- The `agronomic-claims` skill carries this as a red flag, so an agent touching
  either subsystem is warned before it can conflate them.
- Whichever option is chosen, ADR-0004's boundary is unaffected: this concerns
  interval width and labelling, not ranking or Escenario selection.

## Source

`field-os-simulador/setas-os/scoring.js:208-232`;
`field-os-simulador/setas-os/cycle-evidence.js`;
`field-os-simulador/setas-os/recetario-model-bridge.js:84`;
`field-os-simulador/setas-os/experiment-model.js:54-55`;
`PRODUCTION_LEARNING_LOOP_V1.md`.
