# Perito recommendation review contract

Apply this checklist to every new or changed recommendation.

## Input provenance

- Identify species and recipe revision.
- Preserve ingredient identity, percentage, basis, and locked state.
- Identify batch scale and bag parameters when they affect quantities.
- State inventory snapshot or explicitly mark it unavailable.
- Include process capabilities that constrain feasibility.
- Distinguish farm history from general cultivation evidence.

## Constraint evaluation

- Evaluate mass balance before ranking.
- Separate incompatible, unavailable, and merely suboptimal ingredients.
- State which limits are hard constraints and which are target ranges.
- Keep unknown values unknown; do not silently coerce them to zero.
- Make unit conversions and wet/dry basis transitions explicit.

## Proposed change

- Name the exact ingredient changes and percentages.
- Respect locked ingredients and operator anchors.
- Rebalance unlocked ingredients deterministically.
- Return a complete candidate recipe, not only prose.
- Re-score the candidate through the same canonical scoring path.
- Report relevant metrics before and after applying the change.

## Explanation and confidence

- Link each recommendation to the constraint or objective that triggered it.
- Attach evidence provenance and applicability.
- Explain confidence from evidence quality and comparability; never use confidence as decorative certainty.
- Label extrapolation, sparse samples, and experimental rules.
- Prefer “insufficient evidence” over unsupported precision.

## Ranking

- Filter infeasible candidates before optimizing soft objectives.
- Document objective weights and deterministic tie-breakers.
- Avoid duplicate scenarios with cosmetically different labels.
- Preserve meaningful diversity among recommended alternatives.
- Explain trade-offs such as cost versus predicted performance or inventory use.

## Apply, recompute, and undo

- Apply through `SetasFormulatorAPI`, preferring the registered native adapter.
- Keep the tested DOM path as a fallback unless an approved migration explicitly removes it.
- Recompute suggestions from the resulting state after apply.
- Verify predicted and actual rescoring agree.
- Ensure undo restores recipe and locked state.

## Minimum regression fixture

Record:

1. Input species and recipe.
2. Inventory and process context used.
3. Expected constraint classification.
4. Expected proposed recipe or bounded property.
5. Expected before/after score or metric direction.
6. Evidence/confidence behavior.
7. Deterministic result on a repeated run.

Avoid brittle assertions against entire prose strings when structured fields express the behavior more directly.
