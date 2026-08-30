# ADR-0007: `low`/`medium`/`high` names two different confidence scales

Status: **Decided (Scale B promotion criteria) — partially implemented (2 of 5)**
Date: recorded 2026-08-30; decision recorded 2026-08-30; gap table re-derived from
code 2026-08-30, after criterion 2 and the recency half of criterion 3 landed.

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
reaches `high` from observational history. As it stood when this conflict surfaced:

```js
// state at time of conflict — superseded, see gap table
if (h.n >= 8 && sim >= 0.8) ebConfidence = 'high';
else if (h.n >= 3 && sim >= 0.6) ebConfidence = 'medium';
```

The `high` branch now reads `recentN >= EB_HIGH_MIN_RECENT_N && sim >= 0.8` with
`EB_HIGH_MIN_RECENT_N = 20`. The snippet above is kept because it is the behavior
the decision below was made against.

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
**Re-derived from code on 2026-08-30**, after the `n >= 20` and recency work landed;
the earlier version of this table described the pre-implementation state and is
superseded. Current code: `scoring.js:210-232` (`buildUncertainty`) and
`historical-calibration.js:174-200` (`weightedCalibration`).

| Criterion | Current state | Gap |
|---|---|---|
| Same species/substrate/process/envelope | Species enforced via `sKey` upstream (`recetario-model-bridge.js:50`). Substrate/process/envelope match is *approximated* by recipe-composition distance (`similarity >= 0.55` to enter the pool, `>= 0.8` to promote), not an explicit categorical match. | **Open, unchanged.** Distance-based similarity is a proxy, not the same guarantee as matching on substrate family/process/envelope directly. |
| `n >= 20` | **Closed.** `EB_HIGH_MIN_RECENT_N = 20`; promotion requires `recentN >= 20 && sim >= 0.8` (`scoring.js`). | None — and the implementation is *stricter* than this ADR asked: it requires 20 **recent** lots, not 20 of any age. `h.n` (total pool) still drives `medium` and the band width. |
| Recent data window | **Closed.** `RECENCY_WINDOW_DAYS = 365`; `weightedCalibration` counts `recentN` as pool rows whose `fecha` parses inside the window. A row with no parseable date never counts as recent — absence of evidence does not promote. | The 365-day value is provisional and flagged in-code as not validated against the farm's real substrate/process drift cycle. |
| No known material/process shift | Not implemented. No data source anywhere in the app detects a material or process change. | **Open.** This is the half of criterion 3 that `recentN` does not satisfy; recency is a proxy for stability, not a check for it. Left explicit rather than treated as solved by the window. |
| Calibrated against held-out outcomes | Not implemented in the live path. `ground-truth-regression.js` evaluates predictions against real `ebReal` fixtures, but is **offline** — it is not imported by `scoring.js`, `historical-calibration.js`, or `recetario-model-bridge.js`. `halfWidth` derives from `h.sd` on the same in-sample pool that produced `meanEB`. | **Open, unchanged.** Would need held-out validation integrated into the promotion decision itself, not run as a separate report. |
| Coverage/error thresholds displayed | Not implemented. Only the `confidence` label and a static `note` string are shown (`scoring.js:238-241`). No interval-coverage or error metric is computed. (The `coverage` identifiers in `scoring.js` refer to ingredient-stock coverage — unrelated.) | **Open, unchanged.** Needs a coverage/error computation and a UI surface. |

**Net:** two of five criteria are enforced. A live `high` label now means "≥20 similar
lots within 365 days," which is materially closer to the decision than the original
`n >= 8` on any-age data — but it is still short of the full bar, because categorical
matching, shift detection, held-out calibration, and coverage display are all open.

**Re-derive this table rather than trusting it.** It has already drifted once between
what the ADR recorded and what the code did.

## Consequences

- Scale A and Scale B remain **distinct scales** measuring different things — that
  part of the original context is unchanged. Never quote a confidence level without
  naming which scale it came from.
- Scale B's `high` now has a concrete, checkable definition instead of "enough rows,
  enough similarity." The code enforces two of its five criteria (see gap table
  above) — until the rest land, a live-shown `high` label still does not certify
  that this bar was met.
- The `agronomic-claims` skill should carry the *new* criteria (not just the
  scale-conflation warning) as its reference for what `ebConfidence: high` is
  supposed to mean once implemented.
- Implementing the remaining gap-table items is separate follow-up work — flagged
  explicitly rather than silently deferred. ADR-0004's boundary (no ranking or
  Escenario-selection changes) constrains that work.
- ADR-0005 records a related limit: the Scale B pool is counted from Bitácora rows,
  which its deterministic-ID scheme does not cover. `recentN >= 20` gating rests on
  those counts.

## Source

`field-os-simulador/setas-os/scoring.js:208-232`;
`field-os-simulador/setas-os/cycle-evidence.js`;
`field-os-simulador/setas-os/recetario-model-bridge.js:45-84`;
`field-os-simulador/setas-os/historical-calibration.js:100-152`;
`field-os-simulador/setas-os/ground-truth-regression.js`;
`field-os-simulador/setas-os/experiment-model.js:54-55`;
`PRODUCTION_LEARNING_LOOP_V1.md`.
