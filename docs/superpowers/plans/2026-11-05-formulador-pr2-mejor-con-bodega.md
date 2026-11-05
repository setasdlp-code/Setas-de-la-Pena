# Formulador PR 2 — "Mejor con Bodega + Para mejorar, conseguir…" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** At the top of the Formulador, show the best recipe Bodega can make today as two picks (Más producción, Más barata por kg de seta). Below them, list up to 3 catalog ingredients worth buying, each with its gain.

**Architecture:** A new pure UMD module `formulador-best.js` (global `SetasFormuladorBest`) turns the full pool of safe candidates from two `searchScenarios` runs (Bodega only, and catalog) into picks, coverage and suggestions. `searchScenarios` gains an opt-in `includePool` so the picker sees every allowed candidate, not just the 12 ranked by the old score. A new `MejorConBodegaPanel` in `simulador-app.jsx` runs the search on the main thread, deferred, and renders the result.

**Tech Stack:** UMD modules + `node --test`; React in `simulador-app.jsx` bundled by `node build.js` (esbuild); Playwright browser tests under `e2e/`.

**Spec:** `docs/superpowers/specs/2026-11-05-formulador-mejor-receta-design.md` (PR 2 section, "Decisions from review", and the tie-rule decision below).

## Decisions made after the spec (2026-11-05)

- **Tie rule: near-exact (Sebastián, 2026-11-05).** Two candidates tie on EB only when `|EB_a − EB_b| < 1` pt; among tied candidates "Más producción" goes to the lower cost per kg of fresh mushroom. This replaces the spec's band-wide tie (`< halfWidth`).
  - Evidence: with today's Scale-B band (±15–26 pts at confidence `low`), the band-wide tie merged both picks into one recipe for Gris (catalog) and Shiitake (catalog). On Gris with Bodega only, it picked EB 106 when Bodega reaches EB 120.
  - "Para mejorar" shows an EB gain when it is ≥ 1 pt. The card still shows each pick's band, so the uncertainty stays visible.
- **No worker (Claude ruling).** `perito-workbench-worker.js` has its own simplified analyze (`eb = eb_baseline + suppP·1.5`), and no app code loads it. The search runs on the main thread, deferred, the way `optimalAn` already runs a catalog search there (~340 ms catalog + ~10 ms Bodega-only, measured in node on a laptop). The worker's fake analyze is reported in the PR as a finding, not fixed.
- **No search weights (Claude ruling).** `weights` only reweight the old score's dimensions (safety/agronomy/economy/confidence/novelty), not EB or cost. Picks come from the full safe pool of the default search: 945 candidates for catalog Gris, 247 for Bodega-only Gris. The PR states that the picks are chosen from a search steered by the existing score.

## Global Constraints

- App lives in `field-os-simulador/setas-os/`. After any `simulador-app.jsx` edit, run `node build.js` and commit `simulador-app.js` + `sw.js`.
- Spanish UI, infinitive microcopy, no tuteo: "Para mejorar, conseguir…", "Usar esta receta".
- Autoclave marker text exactly: **"requiere autoclave (no habilitado)"**, visible on the pick card itself.
- "Safe" = `evaluation.allowed === true` AND `dimensionVector(evaluation).safety >= 45` (re-applied by the picker; `allowed` alone does not imply it).
- EB = kg fresh mushroom per 100 kg dry substrate. Cost per kg seta = `costPerKgFreshMushroom(costPerDryKg, eb)` from `perito-economy.js`.
- One cost basis: `calculateFifoRecipeCost(recipe, ingredients, invLotes)` (FIFO over Bodega lots, catalog price otherwise). A candidate with `unpricedIds.length > 0` cannot win "Más barata"; its card names the unpriced ingredients.
- Band label names its scale: e.g. "EB est. 103–155 · confianza baja (escala B)". Never "óptimo", "mejor" as a claim about the field, or a band narrower than `evaluation.uncertainty.eb`.
- EB at `eb_optimal` (within 0.05) is labelled "al tope del modelo". It is not a measured best.
- Batch size never affects ranking. The planned batch (`numBags`, `kgBag`, `hObj`) is used only for "alcanza para N bolsas" and "kg a conseguir".
- Generador › Escenarios and Co-Formulación keep today's ordering. `ranked`, `pareto` and `recommended` must be identical with `includePool` on or off.
- `npm run test:unit`, `npm run test:gates`, `npm run test:browser` green before the PR. `perito:regression` will report "no corpus". Say so in the PR; it is not a pass.

## Review Focus

1. **Empty Bodega** (no lots, empty `stockMap`): the panel says that Bodega has nothing compatible for this species, and still shows "Para mejorar" from the catalog run. It must not crash or show a blank card.
2. **Everything unpriced:** "Más barata" says no priced recipe exists (and names the unpriced ingredients). "Más producción" still shows.
3. **Species with sterilization required** (shiitake): every pick carries the autoclave marker. No pick is hidden for it.
4. **Lots with `activo: false` or 0 kg** do not count toward stock or "alcanza para".
5. **Species change while a search is pending:** the panel never shows the previous species' picks.

Tests for these are placed in Tasks 2–4.

---

### Task 1: `searchScenarios` returns the full allowed pool on request

**Files:**
- Modify: `field-os-simulador/setas-os/perito-scenarios.js` (`searchScenarios` params ~L1507 and return ~L1842)
- Modify: `field-os-simulador/setas-os/simulador-app.jsx` (`runHybridRecipeSearch` ~L4823: accept and forward `includePool=false`)
- Test: `field-os-simulador/setas-os/perito-scenarios-pool.test.js` (new)

**Interfaces:**
- Produces: `searchScenarios({..., includePool = false})`; when true, the result has `pool: Candidate[]` = the internal `allowed` list after `applyForceLowRisk`, plus `baseline` if `baseline.evaluation.allowed`. Each `Candidate` = `{id, recipe:[{id,p}], evaluation}` with `evaluation.analysis.eb`, `evaluation.uncertainty.eb {low,high,central,confidence}`, `evaluation.allowed`. When false, there is no `pool` key.

- [ ] **Step 1: Write the failing test.**
  - Use the app-faithful setup from `formulador-baseline.test.js`: canonical `analyze`, `T.applyToSpp`, a `score` adapter using `SetasScoring.scoreRecipe` with `RO.calcTreatment`, and `searchMode:'hybrid', generations:3, beamWidth:14, stepPct:4, recipe:[]`. Run it for Gris with the catalog filtered by `cs`.
  - `test('includePool expone todas las candidatas permitidas')`: `out.pool.length > out.ranked.length`, every `c.evaluation.allowed === true`, and `out.pool.length >= out.diagnostics.allowedCount`.
  - `test('includePool no cambia ranked, pareto ni recommended')`: run once with the flag and once without. `canonicalRecipeKey` lists of `ranked`, `pareto` and `recommended` must be `deepStrictEqual`, and `'pool' in off` must be false.
- [ ] **Step 2: Run** `node --test perito-scenarios-pool.test.js`. Expected: FAIL (`out.pool` undefined).
- [ ] **Step 3: Implement** the param and the return field. In `runHybridRecipeSearch`, forward `includePool` to `engine.searchScenarios`.
- [ ] **Step 4: Run** `node --test perito-scenarios-pool.test.js && node build.js && npm run test:unit`. Expected: PASS, including `formulador-baseline.test.js` unchanged.
- [ ] **Step 5: Commit** `feat(perito): searchScenarios puede devolver todas las candidatas permitidas` (include rebuilt bundle + sw.js).

### Task 2: Picks — `formulador-best.js` core

**Files:**
- Create: `field-os-simulador/setas-os/formulador-best.js` (UMD; `globalThis.SetasFormuladorBest`; `module.exports`)
- Test: `field-os-simulador/setas-os/formulador-best.test.js` (new)

**Interfaces:**
- Consumes: Task 1 `Candidate`; `calculateFifoRecipeCost` (from `globalThis.SetasPeritoScenarios` or `require('./perito-scenarios.js')`); `costPerKgFreshMushroom` (from `globalThis.SetasEconomy` or `require('./perito-economy.js')`), resolved **at call time**, because `perito-economy.js` arrives via an ES-module import that may load after the bundle; `dimensionVector`, `canonicalRecipeKey` from perito-scenarios.
- Produces:
  - `EB_TIE_PTS = 1`; `isEbTie(ebA, ebB) → boolean` (`Math.abs(a−b) < EB_TIE_PTS`).
  - `annotateCandidate(c, {ingredients, invLotes, ebOptimal, calcTreatment, sKey, spp}) → Annotated`, where `Annotated = {key, recipe, eb, band:{low,high,confidence}, costPerDryKg, costPerKgSeta|null, unpricedIds, costProvenance, requiresAutoclave, atModelCap, safe}`.
    - `requiresAutoclave` = `calcTreatment(an, sKey, {...spp,[sKey]:an.sp})?.col === 'autoclave'`.
    - `atModelCap` = `eb >= ebOptimal − 0.05`.
    - `safe` = Global Constraints definition.
    - `costPerKgSeta` is null when `unpricedIds.length` is non-zero.
  - `selectPicks(annotated[]) → {produccion: Annotated|null, barata: Annotated|null, same: boolean, safeCount}`.
    - Considers only `safe`.
    - `produccion` = max EB. Among `isEbTie` with that max, take the lowest non-null `costPerKgSeta` (null last), then `key` ascending.
    - `barata` = lowest non-null `costPerKgSeta`, ties broken by higher EB, then `key`.
    - `same` = both share a `key`.
  - `reasonLine(pick, other, which:'produccion'|'barata') → string`, numeric and no tuteo. Shapes:
    - produccion vs barata: "EB +{d} pts sobre la más barata · ${Δ} más por kg de seta". Show "$ igual" when |Δ| < 1.
    - barata vs produccion: "${Δ} menos por kg de seta · EB {−d} pts". "EB igual" when tied.
    - same: "Más producción y más barata a la vez".
    - Round EB to integers and $ to thousands separators (`es-CO`).
- [ ] **Step 1: Write failing tests** with synthetic `Annotated`/`Candidate` objects (no search):
  - `isEbTie(120, 119.2)` true; `isEbTie(120, 119)` false.
  - `selectPicks`: unsafe candidate with top EB is ignored (`safety` 44).
  - Two candidates EB 120.0 / 119.5 → produccion is the cheaper of the two; EB 120 / 118 → the EB-120 one even if it costs more.
  - All unpriced → `barata === null`, `produccion` set (Review Focus 2).
  - Empty input → both null, `safeCount 0`.
  - `same` true when one candidate wins both.
  - `annotateCandidate`: shiitake `calcTreatment` stub returning `{col:'autoclave'}` sets `requiresAutoclave`; EB 129.97 with `ebOptimal` 130 sets `atModelCap`; a recipe with an ingredient whose catalog `cost` is 0 gives `costPerKgSeta === null` and lists it in `unpricedIds`.
  - `reasonLine` strings match exactly for one produccion and one barata case.
- [ ] **Step 2: Run** `node --test formulador-best.test.js`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** the functions above.
- [ ] **Step 4: Run** `node --test formulador-best.test.js`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(formulador): elegir Más producción y Más barata por kg de seta`.

### Task 3: Coverage and "Para mejorar, conseguir…"

**Files:**
- Modify: `field-os-simulador/setas-os/formulador-best.js`
- Test: `field-os-simulador/setas-os/formulador-best.test.js`

**Interfaces:**
- Produces:
  - `stockKgById(invLotes, stockMap) → {[id]: kg}`.
    - Sums `cantidadKgDisponible` of lots with `activo !== false` and kg > 0.
    - For an id with no such lot, uses `Number(stockMap[id])` when > 0.
    - Lots first, never both: this avoids double counting when Bodega mirrors lots into `stockMap`.
  - `kgPerBagById(recipe, ingredients, {kgPerBag, moisturePct}) → {[id]: kgAsReceived}`. Uses the `launch-plan.js` math: dry per bag = `kgPerBag·(1−h/100)`; item = `dry·p/100 / (1−m)`, with `m = clamp(moisture/100, 0, 0.92)`. Spawn is excluded.
  - `bagsCovered(recipe, ingredients, stockKg, batch) → integer`: `floor(min_i stockKg[i]/perBag[i])`, 0 if any ingredient has no stock.
  - `shortfall(recipe, ingredients, stockKg, {numBags,kgPerBag,moisturePct}) → [{id, kg}]`: kg to get for the planned batch, `ceil` to 0.1 kg, only entries > 0.
  - `improvements({stockPicks, catalogAnnotated, stockKg, ingredients, batch, limit=3}) → Improvement[]`, where `Improvement = {annotated, kind:'eb'|'costo', deltaEb, deltaCostPerKgSeta|null, toBuy:[{id,kg}]}`.
    - A candidate qualifies when it is `safe`, `shortfall` for the planned batch is non-empty (it needs something Bodega lacks or is short of), and it beats the stock picks:
      - `'eb'`: `eb − stockPicks.produccion.eb >= EB_TIE_PTS`;
      - `'costo'`: `costPerKgSeta < stockPicks.barata.costPerKgSeta` by ≥ 1 %.
    - With no stock picks (empty Bodega), every safe catalog candidate qualifies as `'eb'` with `deltaEb` null.
    - Order: `'eb'` by `deltaEb` desc first, then `'costo'` by saving desc.
    - Dedupe by the sorted set of `toBuy` ids, so three suggestions are not three variants of the same purchase. Then take `limit`.
- [ ] **Step 1: Write failing tests:**
  - `stockKgById` ignores `activo:false` and 0-kg lots (Review Focus 4), and uses `stockMap` only for ids without lots.
  - `bagsCovered` for eucalipto 80 / salvado 20, `kgPerBag 2.5`, `moisturePct 65`, stock eucalipto 10 kg (moisture from catalog) gives the value computed by hand in the test from the formula; missing salvado → 0.
  - `shortfall` rounds up to 0.1.
  - `improvements` drops a candidate whose ingredients are all fully in stock; keeps an `'eb'` candidate 1.0 pt above and drops one 0.9 pt above; dedupes two candidates that both only need `harina_soya`; caps at 3; empty Bodega (`stockPicks` both null) still returns catalog suggestions (Review Focus 1).
- [ ] **Step 2: Run** `node --test formulador-best.test.js`. Expected: FAIL on the new tests.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `node --test formulador-best.test.js`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(formulador): cobertura de Bodega y sugerencias para mejorar`.

### Task 4: `computeBestWithBodega` — two searches end to end

**Files:**
- Modify: `field-os-simulador/setas-os/formulador-best.js`
- Modify: `field-os-simulador/setas-os/firebase/auth-gate.js` (`PROTECTED_APP_SCRIPTS`: add `"../formulador-best.js"` right after `"../perito-scenarios.js"`)
- Modify: `field-os-simulador/setas-os/__harness.html` (script tag after `perito-scenarios.js`)
- Test: `field-os-simulador/setas-os/formulador-best-search.test.js` (new)

**Interfaces:**
- Consumes: Tasks 1–3. A `search(params) → result` function. In the app it is `p => runHybridRecipeSearch({...p, includePool:true})`; in tests it is a node equivalent built like Task 1's setup.
- Produces: `computeBestWithBodega({search, sKey, spp, ingredients, invLotes, stockMap, calcTreatment, batch}) → {stock:{produccion, barata, same, safeCount, bags:{produccion, barata}}, improvements, noStock:boolean, explored:{stock, catalog}}`.
  - It runs `search({targetKey:sKey, useStock:true, ...})` only when the stock id set is non-empty. Otherwise `noStock: true` and the stock picks are null.
  - It always runs `search({useStock:false, ...})`.
  - Both runs use the same `invLotes`, so costs share one basis.
  - `ebOptimal` = `spp[sKey].eb_optimal`.
  - `auth-gate.js` is under `firebase/`. This edit is the minimum needed to load the module and touches no credentials. `harness-scripts.test.js` enforces that the harness matches.
- [ ] **Step 1: Write failing tests** with the real catalog and canonical analyze:
  - Gris; Bodega lots for `aserrin_eucalipto` 200 kg, `salvado_trigo` 40 kg, `retamo_espinoso` 4 kg, `carbonato_calcio` 5 kg, `yeso` 5 kg, all priced.
  - Assert:
    - the stock picks use only ids in stock;
    - `produccion.eb >= every safe stock candidate's eb − 1` (recompute from `search(...).pool`);
    - `barata.costPerKgSeta <=` every priced safe stock candidate's;
    - each improvement's `toBuy` is non-empty and includes an id not in stock or short for the batch;
    - `improvements.length <= 3`.
  - Shiitake with `aserrin_roble`/`salvado_trigo`/`carbonato_calcio` stock: `stock.produccion.requiresAutoclave === true` (Review Focus 3).
  - No lots and an empty `stockMap`: `noStock === true`, `improvements.length > 0`, no throw (Review Focus 1).
  - `node --test harness-scripts.test.js` passes after the loader edits.
- [ ] **Step 2: Run** `node --test formulador-best-search.test.js`. Expected: FAIL (`computeBestWithBodega` missing).
- [ ] **Step 3: Implement**, then add the module to `auth-gate.js` and `__harness.html`.
- [ ] **Step 4: Run** `node --test formulador-best-search.test.js harness-scripts.test.js && npm run test:unit`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(formulador): buscar la mejor receta con Bodega y qué conseguir`.

### Task 5: `MejorConBodegaPanel` at the top of the Formulador

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx`. Mount inside the `tab==='formular'&&builderSubTab==='formular'` area (~L15375, after the species context select, shown once `hasPickedSpecies`).
- Create: `field-os-simulador/setas-os/e2e/formulador-mejor-bodega.browser.cjs` (pattern: `e2e/formulator-decisions.browser.cjs`)
- Modify: `field-os-simulador/setas-os/package.json` (`test:browser`: append the new file)

**Interfaces:**
- Consumes: `SetasFormuladorBest.computeBestWithBodega`; app state `sKey`, `searchSPP`, `optimizerINGS`, `invLotes`, `stockMap` (the same stock the Generador uses), `numBags`, `kgBag`, `hObj`, `setRecipe`, `setLockedIds`, `calcTreatment`; `runHybridRecipeSearch` with `includePool:true`.
- Produces: DOM `data-testid`s: `best-bodega-panel`, `best-pick-produccion`, `best-pick-barata`, `best-pick-use` (one per card), `best-improvements`, `best-improvement` (each row), `best-autoclave-badge`.

Behavior:
- Compute in a `useEffect` deferred with `setTimeout(…, 0)` and show a "Calculando la mejor receta con Bodega…" state. Keep a request counter and drop results whose `sKey` or counter is stale (Review Focus 5). Key the effect on `sKey`, `invLotes`, `stockMap`, `optimizerINGS` and `searchSPP` only. Batch inputs re-derive bags and kg from the stored result without a new search.
- Each card shows:
  - title "Más producción (con Bodega)" or "Más barata por kg de seta (con Bodega)";
  - the recipe as "Nombre p · Nombre p…";
  - "EB est. {low}–{high} · confianza {baja|media|alta} (escala B)", plus "· al tope del modelo" when `atModelCap`;
  - "${costPerKgSeta}/kg seta", or "sin precio: {names}";
  - "alcanza para {N} bolsas";
  - the `reasonLine`;
  - the autoclave badge when `requiresAutoclave`;
  - button "Usar esta receta", which calls `setRecipe(pick.recipe.map(r=>({...r})))` and `setLockedIds([])`.
- When `same`, render one card titled "Más producción y más barata (con Bodega)".
- When `noStock`, render "Bodega no tiene insumos compatibles con {especie}." in place of the cards.
- "Para mejorar, conseguir…" shows up to 3 rows: "+ {Nombre} {kg} kg …" for each `toBuy`, then "→ EB +{d} pts" or "→ ${saving} menos por kg de seta", then the "Usar esta receta" button.
- Mesa de Mezcla, Perito fix cards and Auto-mejorar stay below, unchanged.

- [ ] **Step 1: Write the failing browser test** (seed `sdp_seeded`, the draft with `hasPickedSpecies:true` and `sKey:'p_ostreatus_gris'`, plus Bodega lots in `localStorage['sdp_lotes']` (read through `SetasPrototype.read`, ~L7449; `stockMap` is derived from these lots at ~L8400, so no separate seed is needed)):
  - the panel becomes visible within 10 s;
  - the "Más producción" card text matches `/EB est\. \d+–\d+ · confianza .* \(escala B\)/` and `/alcanza para \d+ bolsas/`;
  - clicking its "Usar esta receta" makes `SetasFormulatorAPI.getRecipe()` equal the card's recipe ids;
  - `best-improvement` count ≤ 3;
  - switching species to shiitake shows `best-autoclave-badge` with text "requiere autoclave (no habilitado)" and no Gris recipe ids;
  - there are no `pageerror` events;
  - repeat once at 375×812 (mobile) and assert the panel has no horizontal overflow (`scrollWidth <= clientWidth`).
- [ ] **Step 2: Run** `node build.js && node e2e/formulador-mejor-bodega.browser.cjs`. Expected: FAIL (panel not found).
- [ ] **Step 3: Implement** the panel and styles. Reuse existing card and button classes from the Formulador; add CSS only where none fits.
- [ ] **Step 4: Run** `node build.js && node e2e/formulador-mejor-bodega.browser.cjs && npm run test:unit`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(formulador): vista Mejor con Bodega y Para mejorar, conseguir…` (with bundle + sw.js + package.json).

### Task 6: Calmer path below — "Avanzado" and shorter fix cards

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx` (Generador sub-tab ~L15240 / panel ~L16582; Co-Formulación toggle ~L15264; Perito fix cards)
- Test: the existing `e2e/formulator-action-hierarchy.browser.cjs`, `e2e/perito-panel-unified.browser.cjs` and `e2e/perito-alternatives.browser.cjs` must stay green. Add assertions to `e2e/formulador-mejor-bodega.browser.cjs`.

**Interfaces:**
- Produces: a `<details data-testid="formulador-avanzado">` titled "Avanzado" holding the Generador's mode selector and the Co-Formulación toggle. Fix cards show recommendation + ΔEB first, with evidence and caveat lines inside a collapsed `<details>` titled "Ver evidencia".

- [ ] **Step 1: Add failing assertions:**
  - `formulador-avanzado` exists and is closed by default;
  - the Co-Formulación toggle is not visible until it is opened;
  - on a recipe with a fix card, the card's evidence text is not visible until "Ver evidencia" is clicked.
- [ ] **Step 2: Run** `node build.js && node e2e/formulador-mejor-bodega.browser.cjs`. Expected: FAIL on the new assertions.
- [ ] **Step 3: Implement.** If an existing browser test fails only because a control moved inside "Avanzado", update that test to open "Avanzado" first and ledger the change as a ruling. Never delete an assertion.
- [ ] **Step 4: Run** `node build.js && npm run test:unit && npm run test:gates && npm run test:browser`. Expected: all PASS.
- [ ] **Step 5: Commit** `refactor(formulador): Generador y Co-Formulación pasan a Avanzado; evidencia plegada`.

### Task 7: Verify and open the PR

- [ ] Run `npm run test:unit`, `npm run test:gates`, `npm run test:browser` and `npm run perito:regression`. Record outputs; the last is expected to say "no corpus".
- [ ] Manual check in the preview (`setas-os-v5-local`), at desktop and mobile width, with seeded Bodega: Gris and Shiitake. Take a screenshot for the PR.
- [ ] PR description (template `.github/pull_request_template.md`, Spanish) states:
  - the new opt-in ranking is a product decision, not evidence (ADR-0004), and Escenarios ordering is unchanged (Task 1 test);
  - the tie rule decision and its evidence;
  - the band is Scale B;
  - the worker finding (its fake analyze), not fixed;
  - picks come from a search steered by the existing score;
  - `perito:regression` did not run for lack of a corpus.
