# ADR-0006: Setpoints, validation bounds, literature targets and measurements are distinct classes

Status: Accepted
Date: 2026-08-29 (recorded 2026-08-30)

## Context

Once serialized, a target temperature, a sensor plausibility bound, a published
optimum, and a farm measurement are all just numbers. Collapsing any two of them is
easy, locally convenient, and destroys the ability to say how much confidence a
downstream claim deserves.

## Decision

Four data classes are maintained as distinct and are never silently substituted:

| Class | May be presented as |
|---|---|
| Setpoint | An intention. Never an observation. |
| Physical validation bound | A plausibility filter. Never a target. |
| Literature target | A cited reference with its tier. Never farm-measured. |
| Farm-measured distribution | Local evidence with its sample size. Never general truth. |

`cycle-evidence.js` encodes this in its `provenance` block
(`measured_calculated_from_bitacora`, `measured`, `snapshot`, `missing`). Physically
impossible telemetry is quarantined rather than silently averaged.

## Consequences

- Any structure carrying a cultivation parameter must carry its provenance.
- Dropping a provenance or tier field to simplify a shape is a defect.
- Enforcement is documented in the `agronomic-claims` skill
  (`.claude/skills/agronomic-claims/SKILL.md`), which loads automatically for agents
  touching scoring, evidence, or telemetry.

## Related — added 2026-08-30 after ADR-0007

The four classes above separate *kinds of number*. ADR-0007 found the same failure
mode one level up, in the words attached to those numbers: `low`/`medium`/`high`
names **three different scales**, and they are not interchangeable.

| Scale | Rates | Reaches `high` when |
|---|---|---|
| A — evidence confidence (`cycle-evidence.js`) | How much a body of evidence is worth | **Never** from observation — capped at `medium` by construction |
| B — `ebConfidence` (`scoring.js` `buildUncertainty()`) | How tight an EB prediction band should be | Under ADR-0007's promotion criteria |
| C — provenance confidence (`scoring.js` provenance block) | How a claim was derived — method, not evidence | The input had the better shape; no replication required |

Scale C is the sharpest illustration of this ADR's point: `provenance.eb.confidence`
and `provenance.stock.confidence` are the same field name in the same object on
different scales. It also currently reports `high` when no stock data exists at all
(`mode: 'unconstrained'`) — absence of data presenting as maximum confidence, which
is precisely the substitution this ADR forbids. ADR-0007 records it as open.

This belongs with this ADR because it is the same defect class: two distinct things
that serialize to identical-looking values, where collapsing them destroys the
ability to say what confidence a claim deserves. The operative rule — **never quote a
confidence level without naming which scale it came from** — extends the "never
silently substituted" principle from values to labels.

The `agronomic-claims` skill carries both this scale conflation and ADR-0007's
promotion criteria, and tracks which criteria the code actually enforces. Per that
skill, re-derive its gap table from the code rather than trusting it — the
implementation has moved since ADR-0007 was recorded.

## Source

`PRODUCTION_LEARNING_LOOP_V1.md`, "Safety/quality rule"; `cycle-evidence.js`
(`provenance`); `knowledge_base/AGENTS.md`, "Evidence and authority".
