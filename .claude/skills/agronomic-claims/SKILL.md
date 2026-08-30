---
name: agronomic-claims
description: Use when touching substrate scoring, recipe ranking, cycle evidence, telemetry, confidence levels, or any numeric cultivation parameter in Setas OS — and whenever asked to calibrate, tune, or improve predictions using production or batch data.
user-invocable: false
---

# Agronomic Claims

## Overview

Setas OS advises real cultivation decisions on a real farm. A number that looks
authoritative but is not measured can cost a harvest.

**Core principle: a value's authority comes from where it came from, not from how
useful it would be right now.** Four data classes look identical once they are
floats in a JSON file. They are not interchangeable, and nothing in this codebase
may silently convert one into another.

## The four data classes

| Class | What it is | May be presented as |
|---|---|---|
| **Setpoint** | A target the farm chose to aim for | An intention. Never as an observation. |
| **Physical validation bound** | The range a sensor reading must fall in to be believable | A plausibility filter. Never as a target. |
| **Literature target** | A value from published sources | A cited reference, with its tier. Never as farm-measured. |
| **Farm-measured distribution** | What this farm actually recorded | Local evidence, with its sample size. Never as a general truth. |

`cycle-evidence.js` already encodes this in its `provenance` block —
`measured_calculated_from_bitacora`, `measured`, `snapshot`, `missing`. Preserve
that distinction in anything you build downstream. Dropping provenance to
simplify a data shape is a defect, not a refactor.

## Confidence is capped, structurally

Read the actual rules in `cycle-evidence.js` before reasoning about confidence:

- `buildCycleEvidence()` → `completenessScore >= 3 ? 'medium' : 'low'`
- `buildHistoricalEvidence()` → `completed.length >= 3 && withEnvironment.length >= 2 ? 'medium' : 'low'`

**Neither function can return `high`, and that is deliberate.** A single
observational cycle is not a replicated causal experiment, and a pile of
observational cycles is still not one. Within this schema family, `high` is
reserved for formal experimental evidence per `experiment-model.js` — declared
hypothesis, control, `randomization`, `blockingFactors`, and replication, all
stated *before* execution. `classify()` there returns `'comparative'` only when
`randomization && minReplicates >= 3 && treatments.length >= 1`; anything less
stays `'exploratory'`. A one-replicate trial stays exploratory. Always.

### Two confidence scales share the same three words

This is the live trap in this codebase. `low` / `medium` / `high` name **two
different things**, and conflating them is exactly the substitution this skill
exists to prevent:

| Scale | Where | Can reach `high`? |
|---|---|---|
| Evidence confidence (`setas.cycle-evidence.v1`, `setas.historical-evidence.v1`) | `cycle-evidence.js` | **No** — capped at `medium` by construction |
| `ebConfidence`, the EB prediction band | `scoring.js` `buildUncertainty()` | **Yes** — `recentN >= 20 && sim >= 0.8` sets `'high'` (raised from `h.n >= 8` per ADR-0007, merged) |

`ebConfidence` is fed by `ctx.historyCalibration` (via
`recetario-model-bridge.js`), so farm-observational history **already** reaches
`'high'` on that scale and already narrows the displayed interval (`halfWidth`
0.08 at high vs 0.20 at low).

When you read "observational history never receives high confidence" in
`PRODUCTION_LEARNING_LOOP_V1.md`, it is describing the evidence scale, not
`ebConfidence`. Never quote a confidence level without naming which scale it came
from.

### What Scale B `high` is allowed to mean (ADR-0007, decided)

ADR-0007 ratified that `ebConfidence` **may** reach `high` from observational
history — Scale A may not, and that is unchanged. But `high` on Scale B now requires
all five of:

1. Categorical match on species/strain, substrate family, process, and operating
   envelope — not merely a close recipe-composition distance.
2. `n >= 20` independent completed lots.
3. A recent data window with no known material or process shift in it.
4. Interval width calibrated against **held-out** outcomes, not in-sample fit.
5. Coverage and error thresholds met **and displayed** beside the label.

Failing any one, `ebConfidence` caps at `medium` no matter how much history exists.

`high` here means *"this local band has repeatedly predicted comparable lots well."*
It never means *"the mechanism is proven"* or *"this transfers to another substrate,
strain, or regime."*

### The code does not enforce this yet

**A `high` label produced by the current build does not necessarily meet the bar
above.** The gaps, per ADR-0007's table — **a snapshot, actively being closed.**
Verify against the code before relying on any row; do not cite this table as the
current state:

| Criterion | Current code |
|---|---|
| Categorical match | Still approximated by recipe-distance `similarity`, not a categorical match — open |
| `n >= 20` recent lots | **Closed.** `scoring.js` gates `high` on `recentN >= EB_HIGH_MIN_RECENT_N` (20), not raw `h.n`. `historical-calibration.js`'s `weightedCalibration` computes `recentN` from `parseRowDate` against a `recencyWindowDays` window (default 365, flagged as a provisional value — not validated with Sebastián, worth revisiting). Absence of a parseable date on a row never counts it as recent. |
| Recency window | **Closed** as the 365-day count above. |
| "No known material/process shift" | Still open — no data source anywhere in the app for detecting a shift; this is the half of the ADR-0007 criterion #3 that `recentN` alone does not satisfy. Was left as an explicit gap, not silently assumed solved by the recency window. |
| Held-out calibration | Still open. `halfWidth` uses `h.sd` from the same in-sample pool that produced `meanEB` (`historical-calibration.js` `weightedCalibration`); `ground-truth-regression.js` is an offline harness, not wired into the live path. |
| Coverage/error displayed | Still open. Only a label and a static `note` string are shown. |

So: treat a live `high` as unverified against ADR-0007 until every row is closed —
a partially-closed table is still not the ratified bar. Do not cite it as evidence
that a prediction is trustworthy, and do not widen its use.

**When you read this, re-derive the gap rather than trusting the table.** ADR-0007
is the authority on the criteria; the code is the authority on what is enforced.
This skill is neither.

Closing any of these gaps is scoped work — confidence semantics and promotion
gating, not a new EB calculator and not a scoring redesign. ADR-0004's boundary
still holds: nothing here may change ranking or Escenario selection.

## Evidence is context for Perito, never an input to ranking

Production evidence reaches Perito as `context.historicalEvidence` and
`context.productionLearning`. It may inform an *explanation*. It may not touch:

- `scoring.js` (`scoreRecipe`, `assessSeverity`, `detectSeverity`)
- the source of `perito-scenarios.js`
- `historyCalibration`
- ranking weights or Escenario selection

Any calibration change must first be validated against ground-truth production
fixtures via `ground-truth-regression.js`. No corpus means no validation means no
calibration change — an absent fixture file is a blocker, not a pass.

## Evidence tiers and language

Per `knowledge_base/AGENTS.md`, every external finding carries a tier: Tier 1,
Tier 2, Tier 3/hypothesis, field-measured, or unverified. Carry the tier with the
value. A number that arrives without provenance is unverified by default — never
promote it by assumption.

**Never write "best", "always", or "optimal" about a cultivation parameter without
measured evidence behind it.** Prefer "measured at", "reported by", "targets".

Use the vocabulary in `CONTEXT.md`: Formulador, Perito, Escenario, Lote. Do not
reintroduce "optimizer" or "scenario generator" as user-facing terms — those name
the implementation split, not the concept.

## Rationalizations

| Excuse | Reality |
|---|---|
| "We have 40 real batches now, that's plenty to calibrate on" | Sample size is not study design. Observational batches have no control and no randomization; more of them raises precision on a confounded estimate. Run `experiment-model.js`. |
| "The literature value and our measurement are close, I'll use one field" | Then provenance is gone forever. Later readers cannot tell which farm the number came from. Keep both. |
| "Confidence 'medium' looks weak in the UI, 'high' reads better" | The cap is the product's honesty guarantee. Change the UI copy, never the cap. |
| "I'll let evidence nudge the ranking just slightly" | A slight nudge is still causal inference from observational data. This is the boundary ADR-0004 exists to hold. |
| "The band says `high`, so the prediction is solid" | Closer, but not fully. `high` now requires `recentN >= 20` within a 365-day window — better than the old `n >= 8` on any-age data — but categorical match, material/process-shift awareness, and held-out calibration are all still open. A `high` label still isn't the full ADR-0007 bar. |
| "ADR-0007 is decided, so I can raise the threshold now" | Decided ≠ scoped. Changing `buildUncertainty` gating is follow-up work with its own review, not a side effect of another task. |
| "The fixtures file is missing so the regression passed" | A vacuous pass is the failure mode the harness exists to catch. Missing corpus = blocked. |
| "The sensor bound and the setpoint are the same number anyway" | Today. They drift independently, and the day they diverge, conflating them silently quarantines valid readings or accepts impossible ones. |
| "This is just a UI change, the science rules don't apply" | If the UI renders a confidence level or a parameter, it is making a claim. It applies. |

## Red flags — stop

- About to change a threshold in `scoring.js` because recent batches suggest it
- About to return or hardcode `'high'` confidence on the evidence scale, or to
  quote a confidence level without saying which of the two scales it is on
- About to merge a literature value and a measured value into one field
- About to drop a `provenance` or tier field to simplify a shape
- About to write "optimal" about a substrate parameter
- Reporting a regression pass without confirming the fixture corpus exists
- Treating `LESSONS_LEARNED.md` or `CURRENT_OPERATIONS.md` as authority to change a
  canonical parameter — operational state does not silently amend a governing document

**Every one of these means: stop and ask the human.**

## Worked refusal

> **Request:** "Use the last few batches to improve the EB prediction."

> **Correct response:** The request spans two changes that must not be bundled.
>
> Recomputing what those batches *show* is fine — that is
> `buildHistoricalEvidence()`, capped at `medium`, surfaced as Perito context.
>
> Changing what Setas OS *predicts* means recalibrating scoring, which is blocked
> on two conditions: `ground-truth-fixtures.json` must hold enough real `ebReal`
> batches to be evidence rather than noise, and the change must be validated
> against that held-out corpus before it can influence ranking. Only
> `ground-truth-fixtures.example.json` exists today, so the gate cannot be
> satisfied.
>
> I can surface the batches as evidence now. Recalibration needs the corpus first
> — and that is a human decision, not an inference from a few batches.

## Editing the knowledge base

`knowledge_base/` content changes require explicit human authorization. An audit
reports findings; it does not apply them unless asked. Architectural changes go
through `DECISIONS.md`, not a casual CANON edit.
