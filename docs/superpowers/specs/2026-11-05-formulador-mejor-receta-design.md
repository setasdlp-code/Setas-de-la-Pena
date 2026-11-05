# Formulador: "Mejor con Bodega + Si consigues…" — design

Date: 2026-11-05 · Owner: Sebastián · Status: draft for approval

## Intent and why

Sebastián finds the Formulador complicated and does not trust its reasoning. What he
actually wants from it is two answers:

1. **What is the best recipe I can make today with what is in Bodega?**
2. **What ingredients could I get to do better, and how much better?**

Today there are three separate ways to reach a recommendation (Perito fix cards,
Auto-mejorar, Generador with four modes), about 15–20 controls on the path, each using a
different search, and the engines underneath disagree with each other (two `analyze`
copies, three cost formulas, two EB bands, two history paths). Some outputs are plainly
wrong. Observed on Orellana Gris, eucalyptus 80 / wheat bran 20:
- ΔEB intervals that do not contain their own estimate or are inverted:
  `+53.8 [+54, +55]`, `+0.3 [+1, +1]`, `+2.6 [+5, +1]`, and labelled "%" although they
  are EB points. (Correction 2026-11-05: the projected EB of 119 itself is **not** a bug —
  Orellana Gris `eb_optimal` is 130; EB above 100 is normal.)
- A C:N "fix" that adds retamo espinoso at 80.5% — i.e. replaces the base, worded as
  "agregar", above the 80% `ROLE_CAP_ADD.base_carbono`, while Bodega holds 4 kg.

## Goals

- One primary path in the Formulador that answers both questions above.
- "Best" is shown as **two picks**, not one blended score:
  - **Más producción** — highest estimated EB among safe recipes.
  - **Más barata por kg de seta** — lowest ingredient cost per kg of fresh mushroom
    expected (cost per kg substrate ÷ expected yield per kg substrate).
  - If both are the same recipe, show it once.
  - **Tie rule:** EB differences that fall inside the EB uncertainty band count as a tie;
    among tied candidates the cheaper one wins "Más producción".
- "Si consigues…" lists catalog ingredients not (or not sufficiently) in Bodega whose
  addition improves either pick, with the improvement and what to buy (kg for the planned
  batch).
- Every number on the path (EB, cost, C:N, risk) comes from one formula each, so the
  same recipe shows the same values everywhere.
- Fix the clear engine defects found in the audit.

## Non-goals

- No recalibration of EB or scoring from farm data. There is no ground-truth corpus yet
  (`ground-truth-fixtures.json` absent); per ADR-0004/0007 and the agronomic-claims
  rules, that is blocked until lot 1+ harvests exist.
- No new search engine (that was option B, deferred until harvest data exists).
- No changes to the knowledge base or to sourced agronomic constants.
- No removal of Mesa de Mezcla (hand-editing), Co-Formulación, or Generador modes —
  they move out of the main path, not out of the app.

## Anti-goals (would be failure even if it "works")

- Predictions for existing recipes shift without a documented reason.
- A pick presented with more certainty than the model has (e.g., narrow band, "best",
  "óptimo").
- A suggestion to buy an ingredient that is incompatible or forbidden for the species, or
  that breaks the sterilization rules already enforced.
- The pilot team's current lot-1 recipe scores differently after PR 1 without that
  difference being one of the listed bug fixes.

## Constraints

- Canonical app: `field-os-simulador/setas-os/`; `simulador-app.jsx` → `node build.js`
  bundle; merge `main` with `scripts/git/merge-main.sh`.
- ADR-0004: production evidence never feeds ranking. This design changes ranking on
  purpose (new objective = product decision, not evidence-driven); the PR must say so
  explicitly since Escenario ordering is a regression surface.
- ADR-0007: confidence labels must name their scale; EB band is Scale B.
- Mobile use on the farm (existing mobile gates must keep passing).
- Spanish UI, infinitive microcopy (no tuteo) — note the sketch's "Si consigues…" needs a
  non-tuteo wording, e.g. "Si se consigue…" / "Para mejorar, conseguir…".

## Approaches considered

- **A — Rebuild the path on the existing engines (chosen).** Fix defects and consolidate
  duplicate formulas first, then build the new view on `searchScenarios`. Fastest to a
  usable view; predictions change only where provably wrong; low risk during the pilot.
  Cost: the 7-factor score and Auto-mejorar/fix-card logic remain underneath.
- **B — One new recommendation engine, then the view.** Cleanest, every number agrees by
  design, explanations natively numeric. Rejected for now: several times the work, and
  every prediction shifts with no field data to tell whether it got better. Revisit after
  lot 1 + a few harvests; PR 1 of A removes duplication B would need removed anyway.
- **C — UI simplification only.** Rejected: wrong recommendations stay wrong.

## Design (approach A), two PRs

### PR 1 — Engine correctness and consolidation

Goal: one formula per metric on the recommendation path; listed bugs fixed; everything
else numerically unchanged and proven so by tests.

1. **Single `analyze`.** `substrate-analysis.js` is canonical (it is what the UI uses).
   `recipe-optimizer.js`'s internal copy is removed; optimizer functions take the
   canonical one. Today the copies differ (no `suppEffectiveP` in the optimizer copy), so
   any path that relied on the copy changes — list those diffs in the PR.
2. **Single supplement %.** `suppEffectiveP` (medio at 0.6) everywhere it decides
   treatment/risk; `hybridSupplementPct` (jsx) and `runAutoOptimizer` caps follow it.
3. **Single cost basis.** One function for cost per kg substrate (pick: the moisture-
   aware FIFO cost from `calculateFifoRecipeCost` when stock lots exist, catalog price
   otherwise, with provenance saying which). New derived metric: **cost per kg fresh
   mushroom** = cost per kg dry substrate ÷ (EB/100). Pareto's `100/(1+cost/1000)`
   transform and `realCostFor` stop being separate formulas.
4. **Single EB band.** The band shown on the path is `scoring.js` `buildUncertainty`
   (Scale B); `analyze`'s ebLow/High is either removed from display or made identical.
5. **Single history path.** Pick one of `historicalEB` (jsx) / `weightedCalibration`
   (bridges) so main panel and bridge panels show the same EB. Today both have no data,
   so this is numerically invisible now but prevents divergence after lot 1.
6. **Bugs** (root-cause each with a failing test first):
   - EB displayed above the species' optimal / ΔEB shown as 119% with a ±0.5 band.
   - C:N fix proposing a new ingredient at ~80% (a fix should not replace the base;
     cap new-ingredient additions by role limits already declared per category).
   - Duplicated `maxCost` line (optimizer :1299-1300).
   - `getStockDetail('unconstrained')` scoring 100 is **not** changed (ADR-0004
     territory, noted as open).
7. **Dead code.** Remove `runAutoOptimizer`, legacy `computeParetoFrontier`,
   `recipe-recommender.js` if confirmed unused by tests/harness consumers.
8. **Proof of no unintended change:** snapshot test over a fixed set of recipes
   (including the current lot-1 shiitake recipe and the seeded examples) capturing EB,
   band, cost, C:N, N, score before/after; every diff must map to an item above.
   `perito-regression` cannot run (no corpus) — state that in the PR, don't report a pass.

### PR 2 — The new main view

Top of the Formulador, after choosing species:

```
Especie ▸ [Orellana Gris]      Lote planeado: [20] bolsas × [2.5] kg

MÁS PRODUCCIÓN (con Bodega)            MÁS BARATA POR KG DE SETA (con Bodega)
 Aserrín eucalipto 78 · Salvado 17…     …
 EB est. 60–75% · $X/kg seta            EB est. … · $Y/kg seta
 alcanza para N bolsas                   alcanza para N bolsas
 [Usar esta receta]                      [Usar esta receta]

PARA MEJORAR, CONSEGUIR…
 + Cascarilla de café 6 kg  → EB +8 pts (fuera del rango de empate) · $/kg seta −Z
 + Salvado de trigo 10 kg  → alcanza para 2× bolsas
```

- Mechanics: run `searchScenarios` twice — stock-only and catalog — with the new
  objective. "Para mejorar" = catalog winners whose recipe uses ingredients missing or
  short in Bodega and that beat the stock pick outside the tie band (or on cost/coverage).
  Show at most 3, each with the delta and the kg to buy for the planned batch.
- Each pick has a one-line numeric reason ("gana por EB +6 y $X menos por kg"), and
  the EB band with its confidence label (Scale B named).
- "Usar esta receta" loads it into Mesa de Mezcla for hand-editing.
- Mesa de Mezcla, Perito fix cards and Auto-mejorar stay below as the editing area.
  Generador's extra modes and Co-Formulación move behind "Avanzado".
- Fix cards get trimmed: recommendation + delta first; evidence/caveat lines collapsed.
- Search must stay fast enough on a phone (existing worker `perito-workbench-worker.js`
  is the place to run it off the main thread).

## Decisions from review (2026-11-05)

Decided by Sebastián:

- **Safe / autoclave.** Recipes that require autoclave are included in the picks and in
  "Para mejorar", visibly marked **"requiere autoclave (no habilitado)"** — the All
  American 1941X is on site but No-Go (G1–G5 pending, `knowledge_base/CURRENT_OPERATIONS.md`).
  "Safe" otherwise = passes the existing hard feasibility rules in `searchScenarios`
  (`constraintFailures`: compatibility, sterilization-required treatment blocks, role
  limits) and the existing `safety >= 45` filter. The marker reads from the treatment
  the engine already computes (`calcTreatment`), not a new rule. Builder's call how the
  marker looks; it must be visible on the pick card, not only in a detail view.
- **Batch size is ignored for ranking.** Picks are the best recipe regardless of the
  planned batch; each pick shows how many bags its current Bodega stock covers
  ("alcanza para N bolsas"). "Para mejorar" suggestions give kg to buy for the planned
  batch as information only. The planned-batch input is kept for that display.

Calls made by Claude (correctable):

- **Scope of the new objective.** The two-pick ranking is opt-in, used only by the new
  view. Generador › Escenarios and co-formulation keep today's ordering and tests.
- **Tie rule (single function).** Two candidates tie on EB when
  `|EB_a − EB_b| < halfWidth` of the stock pick's Scale-B band (`buildUncertainty`).
  Among tied candidates "Más producción" goes to the lower cost per kg fresh mushroom.
  "Para mejorar" shows an EB gain only when it is outside that tie band.
- **Units.** EB = kg fresh mushroom per kg dry substrate (×100). Cost per kg fresh
  mushroom = cost per kg dry substrate ÷ (EB/100).
- **Mixed pricing.** Per-ingredient: FIFO over Bodega lots where they exist, catalog
  price otherwise; provenance records which. An ingredient with no price at all
  excludes that recipe from "Más barata" and is flagged on the card.
- **Bug fix expected behavior.** ΔEB is shown in points, not %, and its interval always
  contains the estimate (see Revisions below — the "EB above optimum" item was wrong).
  A fix may not add a new ingredient above its category's declared role limit; if no
  fix fits within limits, the card says so instead of proposing one.
- **Compatibility authority.** The predicate used by `constraintFailures` in
  `perito-scenarios.js` is authoritative for "incompatible/forbidden".
- **Band display change.** Moving the displayed band to `buildUncertainty` visibly
  changes ranges on existing recipes; accepted as a consolidation change and listed in
  the PR 1 description.
- Planned-batch defaults, worker integration, and which dead code to delete: builder.

## Revisions from planning (2026-11-05, Claude — supersede PR 1 items above)

Found while planning; they narrow PR 1, they don't change what Sebastián chose.

- **`substrate-analysis.js` is not edited in PR 1.** Its header makes
  `npm run perito:regression` mandatory for any change, and that gate cannot run (no
  corpus). `analyze` already cannot exceed `eb_optimal` (all factors ≤ 1), so no clamp.
- **Bug 1 replaced:** the defect is the ΔEB interval in `simulateSuggestionDelta`
  (`perito-workbench-core.js` ~L325-330), built as (newLow−prevLow, newHigh−prevHigh).
  Fix: interval = (newLow − prevHigh, newHigh − prevLow) from the Scale-B band, so it
  always contains the point estimate; display in "pts", not "%".
- **Bug 2 refined:** new-ingredient additions must respect `ROLE_CAP_ADD`; an
  alternative that introduces a new `base_carbono` is worded as a base replacement
  ("Reemplazar base por …") and shows the kg in Bodega when known.
- **Item 2 (single supplement %) deferred.** The only live divergent copy is the
  Generador's `hybridSupplementPct`, a conservative search cap; changing it alters
  Escenarios, which this work keeps as is.
- **Item 3 (cost) narrowed.** `calculateFifoRecipeCost` already does per-ingredient
  FIFO + catalog with provenance; it becomes the single cost basis for the new view.
  PR 1 adds `unpricedIds` to it (a zero-price ingredient currently looks free) and
  `costPerKgFreshMushroom`. Escenarios' Pareto transform stays (its ordering is kept).
- **Item 5 (single history path) deferred.** Swapping which calibration feeds the main
  panel touches `historyCalibration`/Scale-B gating — ADR-0004/0007 territory that needs
  its own review and real lots. Both paths are empty today, so nothing diverges yet.
- **Lot-1 recipe is not representable.** DOC-0127 (pellets 80 / salvado 20 + 1%
  Ca(OH)₂) uses hardwood pellets and hydrated lime, neither in `substrate-catalog.js`.
  The snapshot uses aserrín de roble 80 / salvado 20 / carbonato 1 as a labelled proxy.
  Adding those two ingredients is catalog/KB work, out of scope.

## Left to the builder

- Exact component structure and where in the jsx the new view mounts.
- Wording of microcopy within the no-tuteo rule.
- Snapshot fixture set beyond the required recipes.
- Whether the history-path unification picks `weightedCalibration` or `historicalEB`
  (prefer `weightedCalibration`: it already has the ADR-0007 recency gating).
