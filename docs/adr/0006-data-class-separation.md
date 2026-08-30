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

## Source

`PRODUCTION_LEARNING_LOOP_V1.md`, "Safety/quality rule"; `cycle-evidence.js`
(`provenance`); `knowledge_base/AGENTS.md`, "Evidence and authority".
