# Formulador PR 1 — Engine correctness and consolidation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Perito's malformed ΔEB intervals and over-cap "alternative" fixes, show one EB band everywhere, make the optimizer use the canonical `analyze`, add the cost pieces PR 2 needs, and delete dead engines — with a committed before/after snapshot proving every numeric change is intended.

**Architecture:** All engines are UMD modules in `field-os-simulador/setas-os/` (browser global + `module.exports`), tested with `node --test`. `simulador-app.jsx` is compiled by `node build.js` into `simulador-app.js` and `sw.js` (both versioned — always rebuild, never hand-edit). A snapshot test over fixed recipes is committed on untouched code first; later tasks update it only with diffs they name.

**Tech Stack:** Vanilla JS (UMD), React via JSX bundle, `node:test`, Playwright browser checks (`npm run test:browser`).

**Spec:** `docs/superpowers/specs/2026-11-05-formulador-mejor-receta-design.md` (read the "Revisions from planning" section — it supersedes PR 1 items 1–8 where they differ).

## Global Constraints

- Do **not** edit `substrate-analysis.js` (its mandatory gate `npm run perito:regression` cannot run: no `ground-truth-fixtures.json`). Do not report that gate as passed; state it could not run.
- Do not change `scoring.js` scoring/ranking, `historyCalibration`, or Escenarios ordering (ADR-0004/0007).
- Spanish UI, infinitive microcopy, no tuteo.
- Any `simulador-app.jsx` edit → `node build.js` → commit `simulador-app.js` and `sw.js` with it.
- Work dir for all commands: `field-os-simulador/setas-os/`.
- Branch off `main`; merge `main` only via `sh scripts/git/merge-main.sh` (repo root).

## Review Focus

1. **Recipe whose band has no history** (every recipe today): ΔEB interval must still contain the estimate — Task 2 test covers items from both seeded species.
2. **Suggestion that removes an ingredient** (ΔEB negative): interval ordering `low ≤ point ≤ high` must hold for negative deltas — Task 2 adds a negative case.
3. **Ingredient with price 0 / missing `cost`** in Bodega or catalog: must surface in `unpricedIds`, never read as free — Task 4.
4. **EB = 0 or missing** when computing cost per kg fresh mushroom: return `null`, never `Infinity`/`NaN` — Task 4.
5. **Recipe with `suplemento_medio` ingredients** (where the two `analyze` copies differ): snapshot diff must be listed, and treatment pick must follow `suppEffectiveP` — Task 5 fixture includes one.

---

### Task 1: Baseline snapshot on untouched code

**Files:**
- Create: `formulador-baseline.test.js`
- Create: `formulador-baseline.fixture.json` (generated)

**Interfaces:**
- Produces: `formulador-baseline.fixture.json` — array of `{ name, sKey, recipe, proxyOf?, analyze: {eb, ebLow, ebHigh, cn, avgN, cost, suppEffectiveP}, score: {score, eb: {low, high, central, confidence}}, treatment, items: [{icon, priority, action, apply, deltaEb, deltaEbRange}] }`. Later tasks regenerate it with `UPDATE_BASELINE=1` and must name each diff in their commit message.

- [ ] **Step 1: Write the snapshot test.** It loads `substrate-catalog.js` (`INGS`, `SPP`), `scoring.js`, `recipe-optimizer.js`, `perito-workbench-core.js`; for each recipe below builds the evaluator with `createRecipeEvaluator`, runs `generateOptimizer(an, sKey, new Set(), recipe, INGS, [], null, false, {}, SPP, {}, evaluate)`, and for each item with `apply` runs `simulateSuggestionDelta({ recipe, apply: item.apply, ingredients: INGS, applyOptToRecipe, evaluate })`. With `UPDATE_BASELINE=1` it writes the fixture; otherwise `assert.deepStrictEqual(actual, fixture)`. Round numbers to 1 decimal before comparing.

  Recipes (dry-basis %):
  - `gris-euc-salvado`: `p_ostreatus_gris`, aserrin_eucalipto 80 / salvado_trigo 20 (the observed case).
  - `shiitake-lote1-proxy`: `shiitake`, aserrin_roble 80 / salvado_trigo 20 / carbonato_calcio 1, `proxyOf: "DOC-0127 pellets 80 / salvado 20 / Ca(OH)2 1 — pellets y cal hidratada no están en el catálogo"`.
  - `gris-paja-balanceada`: `p_ostreatus_gris`, paja_trigo 85 / salvado_trigo 12 / carbonato_calcio 2 / yeso 1.
  - `gris-suplemento-medio`: `p_ostreatus_gris`, one base + one ingredient with `role:'suplemento_medio'` from the catalog at 25% (pick the first such id in `INGS`), remainder base.
  - `blanca-n-alto`: `p_ostreatus_blanco`, aserrin_eucalipto 70 / harina_pescado 30 (if `harina_pescado` is incompatible, use salvado_trigo 30).

- [ ] **Step 2: Generate the fixture**
  Run: `UPDATE_BASELINE=1 node --test formulador-baseline.test.js` then `node --test formulador-baseline.test.js`
  Expected: second run PASS. Inspect the fixture: `gris-euc-salvado` must show the malformed intervals (e.g. a `deltaEbRange` not containing `deltaEb`). If it doesn't, stop and report — the bug reproduction failed.

- [ ] **Step 3: Commit**
  ```bash
  git add formulador-baseline.test.js formulador-baseline.fixture.json
  git commit -m "test(perito): snapshot de referencia del Formulador antes de consolidar motores"
  ```

### Task 2: ΔEB interval that contains its estimate, shown in points

**Files:**
- Modify: `perito-workbench-core.js` (~L319-330, `simulateSuggestionDelta`)
- Modify: `simulador-app.jsx:2127` (ΔEB line)
- Test: `perito-workbench-core.test.js`, `formulador-baseline.fixture.json`

**Interfaces:**
- Produces: `simulateSuggestionDelta(...).diff.deltaEbRange: [low, high]` with `low ≤ deltaEb ≤ high`, in EB points. Band source per state: `scoreObj.uncertainty.eb.{low,high}` when present (Scale B), else `an.ebLow/ebHigh`, else ±10%.

- [ ] **Step 1: Failing test** `simulateSuggestionDelta: el rango de ΔEB contiene la estimación (positivo y negativo)` — using the real catalog and evaluator on `gris-euc-salvado`, for every item with `apply`: `assert.ok(r[0] <= d && d <= r[1])` where `d = diff.deltaEb`, `r = diff.deltaEbRange`. Add one hand-built `apply` that removes salvado_trigo (negative ΔEB) and assert the same.
- [ ] **Step 2: Run** `node --test perito-workbench-core.test.js` → FAIL on the containment assertion.
- [ ] **Step 3: Implement.** In `simulateSuggestionDelta`, take prev/new bands from the evaluated score objects (`baseEval.scoreObj` / `nextScoreObj`) per the Interfaces rule, then `deltaEbLow = newLow − prevHigh`, `deltaEbHigh = newHigh − prevLow` (round to 0.1). Keep `deltaEbLow`/`deltaEbHigh` field names.
- [ ] **Step 4: jsx label.** At `simulador-app.jsx:2127` render `ΔEB: +X pts [a, b]` — replace the `%` suffixes on `deltaEb` and the range with ` pts`; keep `({Math.round(newEb)}%)`.
- [ ] **Step 5: Run** `node --test perito-workbench-core.test.js perito-score-context.test.js` → PASS. Then `UPDATE_BASELINE=1 node --test formulador-baseline.test.js`; `git diff formulador-baseline.fixture.json` must change only `deltaEbRange` values.
- [ ] **Step 6: Build and commit**
  ```bash
  node build.js
  git add perito-workbench-core.js perito-workbench-core.test.js simulador-app.jsx simulador-app.js sw.js formulador-baseline.fixture.json
  git commit -m "fix(perito): el rango de ΔEB contiene su estimación y se muestra en puntos

  Diff de snapshot: solo deltaEbRange."
  ```

### Task 3: Alternatives respect role caps and say "reemplazar base"

**Files:**
- Modify: `recipe-optimizer.js` (`searchMetricFix` ~L1028-1067, `actionFor` ~L1070-1075, alternative block ~L1083-1090)
- Test: `recipe-optimizer.test.js`

**Interfaces:**
- Consumes: `capForRole(id, map, fallback, ings)`, `ROLE_CAP_ADD`, `ROLE_CAP_INCREASE` (same file).
- Produces: alternative items whose `apply.value ≤ capForRole(id, cur ? ROLE_CAP_INCREASE : ROLE_CAP_ADD, 100, ings)`; `it.replacesBase = true` when the added ingredient is new and `role === 'base_carbono'`.

- [ ] **Step 1: Failing tests.**
  - `alternativa nunca supera el tope de rol`: on `gris-euc-salvado` with `useStock=false`, every item with `alternativeFor` has `apply.value <= capForRole(apply.id, ROLE_CAP_ADD, 100, INGS)` when the id is not in the recipe.
  - `alternativa que introduce una base nueva se redacta como reemplazo`: build a recipe where the only C:N alternative is a new `base_carbono`; assert `item.replacesBase === true` and `item.action` contains `Reemplazar base por` and does not contain `agregar`.
- [ ] **Step 2: Run** `node --test recipe-optimizer.test.js` → FAIL.
- [ ] **Step 3: Implement.** In `searchMetricFix`, `continue` when `res.pct` exceeds the cap above. In `actionFor`, when the ingredient is new and `role === 'base_carbono'`, return `Reemplazar base por <b>${name}</b> (<b>${pct}%</b>)`; set `it.replacesBase = true` in the alternative block. When `stockIds` was provided and the ingredient is not in it, append ` · no está en Bodega`.
- [ ] **Step 4: Run** `node --test recipe-optimizer.test.js` → PASS; regenerate baseline; diffs only in `items[].action/apply` of affected recipes.
- [ ] **Step 5: Commit** (`fix(perito): alternativas dentro del tope de rol; base nueva se presenta como reemplazo` + list of snapshot diffs).

### Task 4: Cost pieces — unpriced ingredients and cost per kg fresh mushroom

**Files:**
- Modify: `perito-scenarios.js` (`calculateFifoRecipeCost` ~L174-256)
- Modify: `perito-economy.js` (add function + export at L98)
- Test: `perito-fifo-costing.test.js`, `perito-economy.test.js`

**Interfaces:**
- Produces: `calculateFifoRecipeCost(...).unpricedIds: string[]` — ids whose needed kg includes any portion priced from a catalog `cost` that is missing, non-finite or ≤ 0 (FIFO-allocated portions with a lot price are priced).
- Produces: `SetasPeritoEconomy.costPerKgFreshMushroom(costPerDryKg: number, ebPct: number): number|null` = `costPerDryKg / (ebPct/100)`, rounded to integer COP; `null` when either input is not finite or `ebPct <= 0`.

- [ ] **Step 1: Failing tests.**
  - `calculateFifoRecipeCost marca insumos sin precio`: catalog with one ingredient `cost: 0`, no lots → `unpricedIds` equals `[thatId]`; with a lot covering it fully → `[]`.
  - `costPerKgFreshMushroom`: `(1000, 80) → 1250`; `(1000, 0) → null`; `(NaN, 80) → null`; `(1000, undefined) → null`.
- [ ] **Step 2: Run** both test files → FAIL.
- [ ] **Step 3: Implement** both; additive fields only — existing return values unchanged.
- [ ] **Step 4: Run** `node --test perito-fifo-costing.test.js perito-economy.test.js perito-scenarios.test.js` → PASS; baseline unchanged.
- [ ] **Step 5: Commit** (`feat(perito): costo por kg de seta fresca y marca de insumos sin precio`).

### Task 5: Optimizer uses the canonical `analyze`

**Files:**
- Modify: `recipe-optimizer.js` (remove local `analyze` L16-~115; keep `api.analyze`)
- Test: `recipe-optimizer-parity.test.js`, `formulador-baseline.fixture.json`

**Interfaces:**
- Produces: `SetasRecipeOptimizer.analyze === SetasSubstrateAnalysis.analyze` (same function reference). Resolution order like `scoring.js` at the top of the file: `globalThis.SetasSubstrateAnalysis` in browser, `require('./substrate-analysis.js')` in Node. All internal call sites keep passing `(recipe, sKey, effectiveINGS, effectiveSPP)`.

- [ ] **Step 1: Failing test** in `recipe-optimizer-parity.test.js`: `el optimizador usa el analyze canónico` → `assert.equal(legacy.analyze, require('./substrate-analysis.js').analyze)`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Replace the local copy with the canonical reference. `analyzeCoFormulation` and every `analyze(...)` call in the file use it. Confirm `__harness.html` loads `substrate-analysis.js` before `recipe-optimizer.js` (it does, L69 vs L85) and check the shell's load order the same way.
- [ ] **Step 4: Run** `npm run test:unit` → PASS (fix tests that asserted the old copy's divergent values only if the new value is what `substrate-analysis.js` returns). Regenerate baseline; expected diffs limited to recipes with `suplemento_medio` (`gris-suplemento-medio`) and their `treatment`. Any other diff: stop and investigate.
- [ ] **Step 5: Commit** (`refactor(perito): el optimizador usa el analyze canónico` + snapshot diff list).

### Task 6: One EB band on every Formulador surface

**Files:**
- Modify: `simulador-app.jsx` L1728-1729, L16767, L17024, L17534 (sites reading `an.ebLow/ebHigh` directly)
- Test: `e2e/formulator-review.browser.cjs` (extend) or new `ebBandFor` unit test if extracted

**Interfaces:**
- Consumes: `recipeEBForecast(an, historical)` (jsx ~L4387) → `{low, high, central, confidence, value, history}`.
- Produces: jsx helper `ebBandFor(an, forecast) → {low, high}` returning `forecast.low/high` when present, else `recipeEBForecast(an, null)`'s band. All four sites use it; L4325/L4695 already prefer `forecast`.

- [ ] **Step 1: Failing check.** Extend `e2e/formulator-review.browser.cjs`: on the `gris-euc-salvado` draft, the EB range text in the Perito gauge and in the flush chart (L1754 `EB {low}–{high}%`) are equal.
- [ ] **Step 2: Run** `node e2e/formulator-review.browser.cjs` → FAIL (chart shows `analyze` band).
- [ ] **Step 3: Implement** `ebBandFor` next to `recipeEBForecast` and replace the four sites. L1781's "± incertidumbre" text derives from the same band.
- [ ] **Step 4: Build and run** `node build.js && node e2e/formulator-review.browser.cjs && node e2e/perito-panel-unified.browser.cjs` → PASS.
- [ ] **Step 5: Commit** (`fix(formulador): una sola banda de EB en todas las vistas` — note: visible range change on existing recipes, accepted in spec).

### Task 7: Remove dead engines

**Files:**
- Modify: `recipe-optimizer.js` (delete `runAutoOptimizer` ~L1259-1340 incl. the duplicated `maxCost` line, `computeParetoFrontier` ~L213, `OPT_PROFILES` if only they use it; drop from `api`)
- Delete: `recipe-recommender.js`, `recipe-recommender.test.js`, `pareto-frontier.test.js`
- Modify: `__harness.html:68`, `hybrid-migration-source.test.js`, `recipe-optimizer.test.js`, `scoring.test.js`, `perito-scenarios.js`, `scoring.js` — only lines referencing the removed names
- Regenerate: `sw.js` via `node build.js`

**Interfaces:**
- Produces: no remaining code reference to `runAutoOptimizer`, `computeParetoFrontier` (optimizer's), `SetasRecipeRecommender`.

- [ ] **Step 1: Inventory.** `grep -n "runAutoOptimizer\|computeParetoFrontier\|recipe-recommender\|SetasRecipeRecommender\|OPT_PROFILES" *.js *.jsx *.html e2e/*` — classify each hit as code vs comment. If `perito-scenarios.js` or `scoring.js` *calls* one of them (not a comment), stop and report instead of deleting.
- [ ] **Step 2: Delete** per Files; in `hybrid-migration-source.test.js` keep any assertion that the jsx does not call the removed engines.
- [ ] **Step 3: Run** `node build.js && npm run test:unit && npm run test:gates` → PASS; baseline unchanged; repeat the grep → no code hits.
- [ ] **Step 4: Commit** (`chore(perito): eliminar motores sin uso (runAutoOptimizer, Pareto legado, recipe-recommender)`).

### Task 8: Full verification and PR

- [ ] **Step 1:** `npm run test:unit && npm run test:gates && npm run test:browser` → all PASS. Record counts.
- [ ] **Step 2:** `npm run perito:regression` → expected to fail for missing corpus; record the message verbatim.
- [ ] **Step 3:** Manual check in the harness (`__harness.html?view=formular`, draft `gris-euc-salvado`): every ΔEB shows `pts` with an interval containing the estimate; no alternative above 80% for a new base; retamo-type case reads "Reemplazar base por…".
- [ ] **Step 4:** Open PR to `main`. Body: what changed; snapshot diff per task; "Escenarios ordering unchanged" claim backed by `perito-scenarios*.test.js` passing; `perito:regression` could not run (no corpus) — not a pass; deferred items (supplement %, history path, lot-1 catalog ingredients).
