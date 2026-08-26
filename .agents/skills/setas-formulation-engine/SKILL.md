---
name: setas-formulation-engine
description: Audit, debug, test, and improve the Setas OS Formulador, recipe scoring and optimization, co-formulation, and evidence-based Perito recommendations. Use for changes involving mass balance, ingredient percentages or locks, species constraints, C:N/N/BE/moisture/pH/cost metrics, scenario ranking, confidence or evidence, inventory-aware suggestions, historical calibration, recommendation application, or regressions in field-os-simulador/setas-os formulation logic. Do not use for purely visual redesigns.
---

# Setas Formulation Engine

Improve formulation logic without inventing biological facts, weakening safety constraints, or coupling domain decisions to rendered UI.

## Start with the canonical system

1. Run `git status --short` and `git diff` before editing. Treat existing changes as work to integrate, never discard them casually.
2. Read `/AGENTS.md`, `/SETAS_OS_CANONICAL.md`, `field-os-simulador/setas-os/setas-os.json`, and the relevant architecture or implementation plan.
3. Work in `field-os-simulador/setas-os/` unless documentation, CI, or integration changes are explicitly required.
4. Never extend historical simulators or repositories as the active implementation.
5. Read [references/engine-map.md](references/engine-map.md) to select the smallest source and test surface.

## Classify the request

Determine which behavior is actually wrong before proposing code:

- **Calculation:** normalization, dry/wet basis, mass balance, metric derivation, units, rounding, or tolerance.
- **Constraint:** species compatibility, process capability, inventory, locked ingredients, lifecycle, or operator limits.
- **Optimization:** candidate generation, objective weights, tie-breaking, diversity, feasibility, or determinism.
- **Recommendation:** severity, proposed change, before/after outcome, confidence, evidence, or explanation.
- **Integration:** Formulador state, native adapter, Perito bridge, apply/undo, recalculation, persistence, or stale state.
- **Calibration:** historical evidence, experimental eligibility, sample sufficiency, leakage, or promotion of observations into defaults.

If the expected behavior is ambiguous, ask for the target species, recipe state, undesired output, and desired operational outcome before editing.

## Establish evidence and invariants

Write down the invariant that the patch must preserve or restore. Use repository evidence in this order:

1. Accepted product or architecture contracts.
2. Existing executable tests and fixtures.
3. Structured knowledge-base data and cited cultivation sources.
4. Farm history that records comparable conditions and provenance.
5. Explicitly labeled assumptions or hypotheses.

Never manufacture biological thresholds, ingredient composition, expected yield, or confidence. If evidence is missing or conflicting, preserve uncertainty in the output and recommend data collection rather than encoding a false constant.

Separate:

- **Hard feasibility constraints** that must never be violated.
- **Soft objectives** used to rank feasible recipes.
- **Warnings** that require operator judgment.
- **Experimental evidence** that must not look equivalent to an approved production rule.

## Design the change

Prefer pure, deterministic transformations with explicit inputs and outputs. A recommendation must be traceable to the exact state it evaluated and should expose:

```js
{
  assessment,
  constraints,
  recommendations,
  proposedChanges,
  confidence,
  evidence
}
```

Apply these guardrails:

- Keep domain state out of DOM text and compiled bundles.
- Preserve locked ingredients, operator constraints, and mass balance.
- Recompute the full recipe after applying a proposal; do not patch displayed metrics.
- Reject or clearly flag proposed states that violate hard constraints.
- Make ranking deterministic, including documented tie-breakers.
- Keep units and wet/dry basis explicit at boundaries.
- Avoid changing several weights or thresholds in one patch unless a fixture isolates each effect.
- Retain adapter fallbacks and compatibility paths required by existing tests.

For the detailed review checklist, read [references/recommendation-contract.md](references/recommendation-contract.md).

## Implement test-first

1. Add the smallest failing regression test that reproduces the bad recipe or suggestion.
2. Assert the domain outcome, not incidental UI text or implementation details.
3. Include a before/after result for recommendation changes.
4. Cover the nearest boundary: exact tolerance, zero/empty input, locked percentage, insufficient inventory, missing evidence, or equal-score candidates.
5. Make the smallest source change that satisfies the invariant.
6. Add a higher-level wiring or Playwright test only when the defect crosses the state/UI boundary.

Useful properties to test when relevant:

- Percentages sum to the canonical total within tolerance.
- Inputs are not mutated unexpectedly.
- Repeated runs return the same ranking.
- Applying a proposal and rescoring matches its predicted result.
- Undo restores recipe and lock state.
- A hard-constraint failure cannot rank above a feasible candidate.
- Missing evidence lowers or withholds confidence rather than fabricating support.

## Validate

Run focused tests first, then the complete Setas OS suite:

```bash
cd field-os-simulador/setas-os
node --test <focused-test>.test.js
npm test
```

After every edit to `simulador-app.jsx`, regenerate and verify the committed bundle:

```bash
cd field-os-simulador/setas-os
node build.js
npm test
```

Run the relevant Playwright recipe flow when behavior is perceptible in the application. Inspect the final diff file by file and report any biological assumption, remaining uncertainty, or calibration limitation.

## Deliver

Summarize:

- The faulty invariant and root cause.
- The corrected behavior and why it is biologically and operationally defensible.
- Tests covering regression and boundaries.
- Evidence used, assumptions retained, and data still needed.
- Any effect on approved versus experimental recipes.

Do not claim improved yield, safety, or production performance unless verified evidence supports that claim.
