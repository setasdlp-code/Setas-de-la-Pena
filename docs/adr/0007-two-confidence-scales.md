# ADR-0007: `low`/`medium`/`high` names two different confidence scales

Status: **Decided (Scale B promotion criteria) — implementation pending**
Date: recorded 2026-08-30; decision recorded 2026-08-30

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

**Option 3, ratified with explicit promotion criteria for Scale B `high`** (recorded
by Sebastián, 2026-08-30). Observational history may reach `high` for the `ebConfidence`
prediction-band width, but never for Scale A (evidence confidence) — that distinction
from the original context stands. What's new is that Scale B's own `high` is no longer
just "enough similar rows," it requires all of:

1. Same species/strain, substrate family, process, and operating envelope as the
   recipe being scored — not merely similar by recipe-composition distance.
2. Sufficient local replication: **`n ≥ 20`** independent completed lots (not 8).
3. Recent data window, with no known material or process shift in that window.
4. The prediction interval is calibrated against **held-out** outcomes — evaluated
   on data the interval-width calculation didn't itself use — not just in-sample fit
   against the same rows that produced the mean/variance.
5. Coverage and error thresholds are met, and shown alongside the confidence label —
   not just the label alone.

Failing any of these, `ebConfidence` is capped at `medium`, regardless of how much
history exists. The ADR's own distinction is the right framing for what `high` means
here: **"this local band has repeatedly predicted comparable lots well"** — never
**"the mechanism is proven"** or **"this band transfers to a different substrate,
strain, or operating regime."** Scale A's semantics (never `high` from observation
alone) are unaffected and unchanged by this decision.

## Gap Between This Decision and the Current Implementation

Recorded so implementation work has a concrete starting point, not vague intent.
Current code: `scoring.js:210-231` (`buildUncertainty`) and
`historical-calibration.js:135-152` (`weightedCalibration`).

| Criterion | Current state | Gap |
|---|---|---|
| Same species/substrate/process/envelope | Species enforced via `sKey` upstream (`recetario-model-bridge.js:62`). Substrate/process/envelope match is *approximated* by recipe-composition distance (`similarity`), not an explicit categorical match. | Distance-based similarity is a proxy, not the same guarantee as matching on substrate family/process/envelope directly. |
| `n ≥ 20` | Threshold is `h.n >= 8` for `high` (`scoring.js:217`). | Threshold too low by this decision; needs raising, and `weightedCalibration`'s `n` (`historical-calibration.js:146`) is the pool size to gate on. |
| Recent data window, no material/process shift | No recency filter or shift detection anywhere in `weightedCalibration` or its callers. | Not implemented at all. |
| Calibrated against held-out outcomes | `ground-truth-regression.js` exists and evaluates predictions against real `ebReal` fixtures — but it's an **offline** reporting harness, not wired into the live `buildUncertainty` calculation. `halfWidth` is derived from `h.sd` on the same in-sample pool that produced `meanEB` (`scoring.js:219`). | Live path has no held-out validation; would need `ground-truth-regression.js`'s approach (or similar) integrated into the confidence-promotion decision itself, not just run as a separate report. |
| Coverage/error thresholds displayed | Only `confidence` label and a static `note` string are shown (`scoring.js:226-230`). No coverage or error metric is computed or surfaced. | Not implemented; needs a coverage/error computation and a UI surface for it. |

**Scope note**: per direction from Sebastián, implementing this is scoped as
*confidence semantics + promotion criteria* — tightening `buildUncertainty`'s gating
logic and surfacing coverage/error alongside the existing label — not a new EB
calculator or a broader scoring redesign. ADR-0004's boundary (no ranking/Escenario
selection changes) still applies.

## Consequences

- Scale A and Scale B remain **distinct scales** measuring different things — that
  part of the original context is unchanged. Never quote a confidence level without
  naming which scale it came from.
- Scale B's `high` now has a concrete, checkable definition instead of "enough rows,
  enough similarity." The code does not yet enforce it (see gap table above) —
  until it does, live-shown `high` labels may not actually meet this bar.
- The `agronomic-claims` skill should carry the *new* criteria (not just the
  scale-conflation warning) as its reference for what `ebConfidence: high` is
  supposed to mean once implemented.
- Implementing the gap-table items is separate follow-up work, not done as part of
  recording this decision — flagged explicitly rather than silently deferred.

## Source

`field-os-simulador/setas-os/scoring.js:208-232`;
`field-os-simulador/setas-os/cycle-evidence.js`;
`field-os-simulador/setas-os/recetario-model-bridge.js:45-84`;
`field-os-simulador/setas-os/historical-calibration.js:100-152`;
`field-os-simulador/setas-os/ground-truth-regression.js`;
`field-os-simulador/setas-os/experiment-model.js:54-55`;
`PRODUCTION_LEARNING_LOOP_V1.md`.
