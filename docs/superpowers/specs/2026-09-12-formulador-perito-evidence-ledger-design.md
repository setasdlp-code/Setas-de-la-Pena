# Formulador + Perito — Recipe Evidence Ledger

Status: design approved in brainstorming, pending written-spec review
Date: 2026-09-12
Scope: `field-os-simulador/setas-os/` (Formulador, Perito, launch → inventory → Bitácora), plus `knowledge_base/01_species/` corrections
Base: `main` @ `be83124`
Binding decisions this spec extends (never contradicts): ADR-0003 (localStorage cache + Firebase persistence), ADR-0004 (evidence is context, not score), ADR-0005 (deterministic document IDs), ADR-0006 (data-class separation), ADR-0007 (three confidence scales), `PRODUCTION_LEARNING_LOOP_V1.md`, `ARCHITECTURE.md`, ADR-0002 (static shell, one esbuild step).

---

## 1. Problem

An audit of the Formulador and Perito (2026-09-12) found that Perito is more capable than it looks, but the chain from recipe to batch to harvest to Perito is broken at every hop. It also found that inventory is being corrupted today.

Confirmed defects (line numbers refer to `simulador-app.jsx` unless noted):

| # | Defect | Evidence |
|---|---|---|
| D1 | "Lanzar Lote" discounts nothing when the Batch "Calcular" toggle is off: `bd` is `null`, the ingredient list is empty, and the modal reports "Stock suficiente". | `bd` gated on `showBatch` (5943); launcher reads `bd?.items` (6361) |
| D2 | Ingredients under 0.5 kg are discounted as that many kg. `calcBatch` items carry `kr` and a display string `unit:"89 g"`, but no `asIsKg`, so the launcher falls back to `parseFloat("89 g")`, which reads as 89 kg. | 1515 vs 6364 |
| D3 | Inventory sync diverges silently. The local discount applies immediately; each Firestore FIFO discount is a separate transaction, and a failure produces only a `console.warn`, which can leave some ingredients discounted and others not. | 6436–6444; `firebase/db.js:62` |
| D4 | Unit items (bags) are stored as unit counts in `cantidadKgDisponible`, and nothing declares that. | 4193, 6245 |
| D5 | Moisture is never evaluated. The summary strip reads a non-existent `an.h` field, so it always shows "—". Moisture targets disagree across the code: 67, 65/63/60 and the literal string "67–68%". | 10474, 1383, 1513 |
| D6 | Cost uses the as-received price as if it were dry-basis (`g.cost × p`), which understates wet inputs. | 1286 |
| D7 | The co-formulation default key `p_djamor_rosada` does not exist (the species key is `p_djamor_rosa`), so 40% of the default weight goes nowhere. | 5011 |
| D8 | Species targets are hard-coded and wrong for *P. eryngii*: C:N 40–65 rejects every validated eryngii formulation. | 1024–1034; §15 |
| D9 | Recipes have no identity. Saved recipes use `id: Date.now()`, and every launch stores a fresh `recipeRef.id = ts` that links to no Recetario entry and records no consumed ingredient lots. | 5789, 6471 |
| D10 | Perito panels inject HTML into a React-owned node, re-inject via MutationObservers, and rewrite React's "COLAPSO TRICHODERMA" text through a TreeWalker. The operator can see two contradictory verdicts. | `perito-ui-bridge.js:115–128, 240`; `perito-scenarios-bridge.js:394` |
| D11 | `perito-scoring-hook.js` monkey-patches `SetasScoring.scoreRecipe`, so verdicts fire for trial candidates scored by `autoImprove` that were never applied. | `perito-scoring-hook.js:18–31`; 6141–6171 |
| D12 | There are five mass-balance tolerances (±0.5, 97–103, 99–101, 95–105, ±0.15). | 1337, 11252, 10858, 1298; `formulator-api.js:12` |
| D13 | Three verdict vocabularies coexist: `scoring.js` status, `SCORE_MAP`, and the human `lote.veredicto` dropdown. | `scoring.js:394–396`; 2013; 9176 |
| D14 | The EB prediction-accuracy gate `perito-regression-report.js` is built and tested but inert: no corpus, no CI wiring. The prediction made for each lote is never stored, so per-lote error cannot be computed. | `ground-truth-fixtures.example.json` only |
| D15 | "Ejecutar Lote" (Hoja de producción) discounts inventory but creates no Bitácora lote, leaving an evidence gap. | 6249–6285 |
| D16 | "+ Crear prueba" saves without the balance and species gate, in the same shape as an approved recipe (violates UX v2 §9.3). | 11175 |
| D17 | The `formulator-api.js` DOM fallback targets `input[type="range"][aria-label^="Porcentaje de "]`, which no longer exists. | `formulator-api.js:100–168` |

The consumer side of the evidence loop already exists and waits for data the Formulador never writes. `cycle-evidence.js:122` filters on `recipeSnapshot.versionId`, and `production-learning-bridge.js:78–79` reads `lote.recipeSnapshot` and `lote.ingredientLots`. This spec makes the producer side fulfil those existing contracts.

## 2. Goals and success criteria

1. **Inventory integrity.** Launching any lote from either path discounts exactly the as-received quantity per ingredient, in that ingredient's unit, once, and converges with Firestore or visibly reports that it has not. *Verified by* `launch-plan.test.js`, `inventory-consumption.test.js`, and a Playwright scenario on seeded inventory.
2. **Sourced targets.** Every species target shown or used carries its source and basis. *Verified by* a test that runs the knowledge base's validated formulations through `analyze()` and asserts they fall inside their own targets.
3. **Recipe lineage.** 100% of lotes created after SP2 carry `recipeSnapshot.versionId` and `ingredientLots`. *Verified by* unit tests on lote construction and a Playwright launch scenario.
4. **One verdict.** The Formulador shows exactly one Perito verdict, rendered by React from a pure object. No Perito code injects into or observes React-owned DOM. *Verified by* `perito-verdict.test.js` and deletion of the bridges.
5. **Safe launches.** Every critical finding at launch is resolved by an applied fix, a confirmed process change, or a recorded acknowledgement. The treatment actually used is confirmed for every lote.
6. **Evidence per version.** Each recipe version shows its real record: n lotes (traceable vs inferred), real EB, contamination rate, cost per kg of mushroom, and prediction error, with Scale A confidence.
7. **Accuracy gate.** Changes to scoring, the scenario engine, the optimizer or targets run the EB regression gate against real harvests in CI, without real data ever entering the public repo.

## 3. Non-goals

- The "Hoy" daily screen. Its task list is built from the shell's demo `containers`, not real Bitácora lotes (`Setas OS v5.dc.html:3640`), so integrating it waits on unifying the two notebooks.
- An objective selector (replicate / cost / yield / risk), UX v2 §9.
- Any change to Perito ranking or scoring driven by production evidence (ADR-0004). Evidence is measured and displayed; recalibration remains a separate, human-approved decision under ADR-0007.
- A redesign of the Formulador screen layout.
- Hard launch blocks for biological risk (the §4 decision is acknowledgement, not a block).
- Semantic versioning of recipes.

## 4. Decisions

| Decision | Source |
|---|---|
| Species targets: neither the code nor the KB wins outright. Targets are keyed by species × substrate class × treatment, each carrying basis, source, citations and tier. Unverifiable values keep today's numbers labelled `legacy_unverified`. | Literature research, 2026-09-12 (§15) |
| Recipe lifecycle is `borrador → prueba → aprobada`, plus `archivada`. Only `admin` or `direccion` may approve or archive. Approving with fewer than 3 traceable lotes requires a written reason. Evidence is shown at approval. | User |
| Critical findings require acknowledgement at launch, not a block, and each finding offers mitigations: smallest recipe change, process change, and closer monitoring. | User |
| Mitigation rules cover only the critical findings that exist today and cite the KB. | Accepted adjustment |
| The operator confirms the treatment actually used for every lote. | Accepted adjustment |
| Monitoring checks appear in Bitácora only. | User (non-goal: Hoy) |
| Legacy recipes import as `prueba` with `legacy: true`. Past lotes link only on exact content match (`method: 'inferred_exact'`). Nothing is deleted or rewritten. | User delegated → recommendation |
| Architecture: extract the domain logic into small, tested plain-JS modules; React renders them. | User delegated → recommendation |
| Ingredients declare `unidad: 'kg' \| 'ud'`. | External review, verified (D4) |
| The inventory discount becomes one idempotent operation per lote. | External review, verified and extended (D3) |
| `peritoVerdictAtLaunch` is a new immutable lote field; the existing `veredicto` stays as the human post-harvest verdict. | External review, verified (D13) |
| The prediction at launch is snapshotted on the lote. | External review, adapted (D14) |
| Target data is embedded in `species-targets.js`, with no separate JSON fetch. | External review (sync load) |
| Readable labels `SDP-REC-###` and `vN` are for display; the content hash stays the identity. | External review, adapted |
| **Rejected:** discounting inventory on a dry-matter basis. Inventory lots are recorded as received, so dry-matter discounting would under-discount wet inputs. | Review item rejected |
| **Rejected:** blocking launch on a Perito "blocked" verdict; it contradicts the user decision. The verdict vocabulary also avoids "approved", to keep it distinct from recipe status. | Review item rejected |
| **Rejected:** automatically feeding the error back into optimizer weights (ADR-0004). | Review item rejected |

## 5. Architecture

### 5.1 Modules

All new modules are dependency-free plain JS with a dual export (`module.exports` for `node:test`, and `window.Setas*` for the browser). They are loaded synchronously through the existing ordered script list in `firebase/auth-gate.js` (alongside `historical-calibration.js`). None fetches data at startup.

| Module | Global | Responsibility | Depends on |
|---|---|---|---|
| `species-targets.js` | `SetasSpeciesTargets` | Embedded target table; `classifySubstrate(recipe, ings)`; `resolveTargets({speciesId, substrateClass, treatment})` | none |
| `recipe-version.js` | `SetasRecipeVersion` | `canonicalize`, `versionId`, lifecycle transition rules, `MASS_BALANCE_TOLERANCE_PP`, legacy import mapping | none |
| `launch-plan.js` | `SetasLaunchPlan` | `buildLaunchPlan(...)`: per-ingredient dry/as-received quantities, unit handling, FIFO allocations, shortfalls | `species-targets.js` (moisture) |
| `inventory-consumption.js` | `SetasInventoryConsumption` | Idempotent consumption op: build, apply locally, pending queue, retry, reconcile | `launch-plan.js` output shape |
| `perito-verdict.js` | `SetasPeritoVerdict` | `buildVerdict(...)`, the finding catalog, `snapshotAtLaunch(...)` | `species-targets.js`, `perito-mitigations.js` |
| `perito-mitigations.js` | `SetasPeritoMitigations` | Embedded mitigation catalog for critical finding codes, with KB citations | none |
| `recipe-evidence.js` | `SetasRecipeEvidence` | Per-version record: lotes, real EB, contamination, cost/kg mushroom, residuals, Scale A confidence | `cycle-evidence.js`, Bitácora stats |

Existing modules changed: `simulador-app.jsx` (consumes the modules, renders `<PeritoPanel>` and `<LaunchDialog>`), `perito-scenarios.js` (adds a `mustClear` option), `formulator-api.js` (dead DOM fallback removed), `firebase/db.js` (recipe versions, consumption op), `firebase/firestore.rules`, and `recetario-model-bridge.js` (reads versions).

Deleted: `perito-ui-bridge.js`, `perito-scenarios-bridge.js`, `perito-scoring-hook.js`, and their side-effect imports in `firebase/error-monitor.js`. Their tests are replaced by `perito-verdict.test.js` and React-level behaviour tests. Any logic in them that is still needed (stock coverage, batch kg context) moves into `perito-verdict.js` as pure functions.

### 5.2 Data flow after all four sub-projects

```
Formulador state (recipe, species, treatment)
  → analyze() + SetasSpeciesTargets.resolveTargets()
  → SetasPeritoVerdict.buildVerdict()            (useMemo, synchronous)
  → searchScenarios({mustClear})                 (debounced 400 ms, only when critical findings exist)
  → <PeritoPanel verdict mitigations/>
Guardar → SetasRecipeVersion (versionId) → recipe_versions/{versionId} (+ cache)
Lanzar  → buildLaunchPlan → <LaunchDialog> (treatment confirm, finding resolutions, shortfall ack)
        → lote {recipeSnapshot{versionId…}, ingredientLots, peritoVerdictAtLaunch, monitoring}
        → inventory_consumptions/{loteId} (one transaction, retry-safe)
Cosecha → Bitácora → cycle-evidence / SetasRecipeEvidence.forVersion(versionId)
        → Recetario card, approval dialog, Formulador "ya produjiste esta versión"
CI      → perito corpus (read-only, runtime) → perito-regression-report gate
```

## 6. SP1 — Stop the bleeding + sourced species targets

### 6.1 `species-targets.js`

**Record shape (one per species × substrate class × treatment class):**

```js
{
  speciesId: 'p_eryngii',
  substrateClass: 'bag_supplemented',        // see classifySubstrate
  treatmentClass: 'sterilized',              // 'pasteurized' | 'sterilized' | 'any'
  basis: 'mix_dry_excl_additives',           // the quantity analyze() computes
  cn:       { min: 25, max: 40, ideal: 28, source: 'literature', citations: ['li2024'], tier: 'medium' },
  nPct:     { min: 1.3, max: 1.8, ideal: 1.7, source: 'literature', citations: ['li2024'], tier: 'medium' },
  ph:       { min: 5.5, max: 7.0, source: 'legacy_unverified', citations: [], tier: 'unverified' },
  moisture: { ideal: 65, min: 63, max: 68, source: 'literature', citations: ['bellettini2019','li2024'], tier: 'medium' },
  supplementationMaxPct: { value: 55, source: 'literature', citations: ['li2024'], tier: 'medium' },
  eb:       { baseline: 60, optimal: 90, source: 'legacy_unverified', citations: [], tier: 'low', note: 'consistent with li2024 measured 74–87' },
}
```

- `source` ∈ `literature | kb | farm | legacy_unverified`. `farm` values are never written by this spec; they are reserved for a future ADR-0007-gated promotion.
- `tier` ∈ `high | medium | low | unverified` expresses how well the cited sources support the exact range. It is a data-quality label, not one of the ADR-0007 confidence scales, and is never shown as "confianza".
- `CITATIONS` is an embedded map from citation id to `{authors, year, title, url}`.
- **Classification.** `classifySubstrate(recipe, ings)` returns:
  - `straw_unsupplemented` when the dominant base is straw/stubble and the supplement share is below 2%;
  - `bag_supplemented` when the supplement share is 2% or more on a lignocellulosic base;
  - `hardwood_block` when the dominant base is hardwood sawdust with no supplement.

  Category names come from the existing ingredient catalog; the implementation plan confirms the exact category keys.
- **Resolution.** `resolveTargets` tries an exact match, then `treatmentClass: 'any'`, then the species default record, and marks `fallback: true` on the result whenever it did not match exactly. The UI shows "objetivo genérico" for fallbacks.
- **Initial table.**
  - *P. eryngii* and *P. ostreatus* (gris and blanco) get per-class values from §15.
  - Enoki's C:N 25–40, ideal 27, is marked `literature` (Han 2024).
  - Reishi pH 4.2–5.3 and moisture 65–70 are marked `kb`.
  - Every other value is carried over from today's `SPP` as `legacy_unverified`.
  - `SPP` in the JSX keeps its non-target fields (name, notes, spawn rate, difficulty); target fields are read only through `resolveTargets`.
- **Consumers switched:** `analyze()`, `diagnose()`, `calcTreatment`, `calcBatch`, `recipe-optimizer.js` and `scoring.js`. The Trichoderma threshold (N > 1.15 × max without autoclave) now uses the resolved `nPct.max`.

### 6.2 `launch-plan.js`

```js
buildLaunchPlan({
  recipe,            // [{id, p}] dry-basis percentages
  speciesId, treatmentClass,
  bags, kgPerBag,    // wet kg per bag
  moistureTarget,    // from resolveTargets, never a literal
  ingredients,       // catalog with moisture, unidad, price per unidad (as received)
  inventoryLots,     // active lots
  bagType,           // optional unit item {stockId, unitsPerBag: 1}
}) → {
  totals: { wetKg, dryKg, waterToAddKg },
  items: [{ ingredientId, unidad: 'kg', dryKg, asReceivedKg, intrinsicWaterKg, cost }],
  unitItems: [{ ingredientId, unidad: 'ud', units }],
  allocations: [{ ingredientId, lotId, quantity, unidad }],   // FIFO
  shortfalls: [{ ingredientId, needed, available, unidad }],
}
```

- **Basis rule.** Inventory is recorded as received. Mass items are discounted in `asReceivedKg = dryKg / (1 − moisture)`, the same formula `calcBatch` already uses for `kr`. Unit items are discounted in units. A display string is never parsed.
- **Always computed.** The plan is computed for every launch, independent of the "Calcular" toggle (fixes D1, D2).
- **FIFO order.** One ordering key, `fechaIngreso` falling back to `fechaCompra`, is shared by local and server FIFO. `firebase/db.js:62` currently orders by `fechaCompra` only.
- **Both paths.** "Lanzar Lote" and "Ejecutar Lote" both call `buildLaunchPlan` and both create a Bitácora lote (fixes D15). The two batch parameter sets (`numBags/kgBag/hObj` vs `prodBags/prodKg/prodH`) collapse into one launch input.
- **Units.** `unidad` is added to the ingredient catalog and inventory lots, defaulting to `'kg'`. The bag stock ids are `'ud'`. The stored field name `cantidadKgDisponible` is kept for compatibility and read only through `cantidadDisponible(lot)`, which honours `unidad`.

### 6.3 `inventory-consumption.js`

- **Operation.** `{ opId: loteId, loteId, allocations, unitAllocations, createdAt, status: 'pending' | 'synced' | 'failed', attempts, lastError }`.
- **Local apply.** Allocations are applied to `sdp_lotes` immediately, movements are written to `sdp_movimientos`, and the op is stored in `sdp_inventory_ops` with status `pending`.
- **Server apply.** `SetasDB.aplicarConsumo(op)` runs **one** Firestore transaction that:
  1. reads `inventory_consumptions/{loteId}`, and exits as a no-op if it already exists;
  2. reads every affected `inventario_lotes` doc;
  3. validates availability;
  4. writes all decrements plus the consumption doc.

  This replaces the per-ingredient `descontarInventarioFIFO` calls.
- **Lot identity.** The implementation plan must verify whether local lot ids equal Firestore doc ids.
  - If they do, the server applies the same allocations by id.
  - If they do not, the server recomputes FIFO per ingredient with the shared ordering key, returns the applied allocations, and the client replaces its local allocations with the server's on sync.
- **Retry.** Retries happen on app load, on `online`, and after each successful write, with exponential backoff capped at 1 h. Deterministic ids make retries safe (ADR-0005).
- **Failure is visible.** Bitácora shows a "Pendiente de sincronizar inventario" badge on the lote. After 3 failures, Bodega shows a banner listing failed ops with the error. An "insuficiente en servidor" error is surfaced, never swallowed.

### 6.4 Other SP1 fixes

- **Moisture (D5).** `analyze()` returns `moistureTarget` from `resolveTargets`. The summary strip shows the target moisture and `waterToAddKg`. `calcBatch`, `Batch` and `diagnose()` read the same value; the literal "67–68%" is removed.
- **Cost (D6).** `analyze().costPerKgDry = Σ (p_i/100) × price_i / (1 − m_i)`. Labels say "costo / kg seco". `calcBatch` receives `tr`, `eb` and `sKey`, so energy cost is included. Batch margin uses `DEFAULT_FRESH_PRICES[speciesId]` unless the user overrides it.
- **D7.** The key is fixed to `p_djamor_rosa`, and stored co-formulation configs are migrated on read.
- **D12.** `MASS_BALANCE_TOLERANCE_PP = 0.5`, exported from `recipe-version.js`, is used by the save/launch gate, the balance chip, the total bar and `formulator-api.js`. The scoring EB penalty band (95–105) is a separate concept and gets a named constant `EB_PENALTY_BALANCE_BAND` in `scoring.js`.
- **D17.** The DOM fallback is removed from `formulator-api.js`. `applyRecipe` rejects with `no_native_adapter` when no native adapter is registered. The `setas-formulation-engine` skill text is updated to match.

## 7. SP2 — Recipe identity and lifecycle

### 7.1 `setas.recipe-version.v1`

```js
{
  schema: 'setas.recipe-version.v1',
  versionId: 'rv_3f9a0c21d4e8b7a6',     // content hash, identity
  parentVersionId: 'rv_…' | null,
  recipeCode: 'SDP-REC-007',             // family label, display only
  versionNumber: 3,                      // display only
  name: 'Eryngii bolsa salvado 30',
  speciesId: 'p_eryngii',
  treatmentClass: 'sterilized',
  ingredients: [{ id: 'aserrin_roble', pct: 60.0 }, …],   // sorted by id, pct rounded to 0.1
  status: 'borrador' | 'prueba' | 'aprobada' | 'archivada',
  legacy: false,
  legacySource: null | { store: 'setas_v6' | 'recetas', id },
  createdBy, createdAt,
  approval: null | { by, at, reason: string | null, evidenceAtApproval: { traceableLotes, inferredLotes, ebRealMean, contaminationRate } },
  archived: null | { by, at, reason },
  analysisAtSave: { cn, nPct, costPerKgDry, ebPredicted, targetsRef },   // informative snapshot
}
```

- **Identity.** `versionId = 'rv_' + fnv1a64hex(canonicalJSON({speciesId, treatmentClass, ingredients}))`. The name is excluded, so renaming does not create a version. The hash is an identity, not a security control. Tests assert:
  - determinism across ingredient order and percentage representation (`30`, `30.0`, `"30"`);
  - that different content gives different ids across a generated corpus.
- **Immutability.** Content fields (`speciesId`, `treatmentClass`, `ingredients`, `versionId`, `parentVersionId`, `recipeCode`, `versionNumber`) are immutable. Editing any content in the Formulador produces a new `borrador` whose `parentVersionId` is the loaded version. Saving identical content resolves to the existing version.
- **Labels.** `recipeCode` is assigned for a new family (no parent) as the local cache maximum + 1; `versionNumber` is the family maximum + 1. Duplicate labels from offline devices are tolerated because identity is `versionId`. The UI appends the first 4 hash characters when two versions in a family share a number.

### 7.2 Lifecycle

| Transition | Who | Preconditions |
|---|---|---|
| create `borrador` | any signed-in user | species picked, mass balance within tolerance |
| `borrador → prueba` | any signed-in user | same as create |
| `prueba → aprobada` | `admin` or `direccion` | `approval.by = uid`; `reason` required when `evidenceAtApproval.traceableLotes < 3` |
| `borrador` / `prueba` / `aprobada` → `archivada` | `admin` or `direccion` | `archived.reason` required |

- **Launching.** A `borrador` cannot launch. "Lanzar" on a `borrador` offers one action, "Pasar a prueba y lanzar", which runs the transition and then opens the launch dialog. Lotes launched from `prueba` are marked experimental in Bitácora and Recetario.
- **Creating.** "Guardar" creates a `borrador`. "+ Crear prueba" creates a `prueba` under the same gate (fixes D16).
- **Recetario.** Groups versions by `recipeCode`, shows a status chip, puts `aprobada` first, and hides `archivada` behind a filter. Approval and archive actions are shown only to `admin` and `direccion`.

### 7.3 Storage

- **Firestore.** `recipe_versions/{versionId}`, cached in localStorage `setas_recipe_versions` (ADR-0003, ADR-0005). Writes are local-first with a visible sync error, matching today's `saveR` behaviour.
- **Lote fields.** At launch, the Bitácora lote (`sdp_bit_lotes` / `bitacora_lotes`) and the production lote (`lotes_produccion`) both receive:
  - `recipeSnapshot`: the full immutable version content, including `versionId`, `recipeCode`, `versionNumber` and `status` at launch;
  - `ingredientLots`: the applied allocations `[{ingredientId, lotId, quantity, unidad}]`.

  In `lotes_produccion`, `recetaSnapshot` continues to be written for compatibility and mirrors `recipeSnapshot.ingredients` in the `{id, pct}` shape its rule validates.
- **Readers.** `recetario-model-bridge.js` and `production-learning-bridge.js` read `recipeSnapshot` first. Their existing fallbacks (`recetaSnapshot`, `recipeRef`) remain for legacy lotes.

### 7.4 Legacy migration (idempotent, non-destructive)

- **Recipes.** On load, each `setas_v6` entry and each `recetas` doc is canonicalized and upserted as `prueba` with `legacy: true` and `legacySource`. Deterministic ids make repeated runs no-ops. Source records are not modified or deleted. Legacy entries that fail the balance or species check import as `borrador` with `legacy: true` and a "revisar" chip.
- **Lotes.** Each past lote without `recipeSnapshot.versionId` whose `recipeRef.recipe` canonicalizes to a known `versionId` gets a link document `recipe_version_links/{loteId} = { loteId, versionId, method: 'inferred_exact', createdAt }` (cached in `sdp_recipe_links`). Lote documents are not edited, which respects the `recetaSnapshot` immutability rule. Lotes without an exact match stay unlinked and continue to feed similarity-based calibration.

## 8. SP3 — One Perito verdict, mitigations and launch acknowledgement

### 8.1 `setas.perito-verdict.v1`

```js
buildVerdict({ recipe, speciesId, treatmentClass, analysis, targets, stock, batch, history }) → {
  schema: 'setas.perito-verdict.v1',
  versionId,                                   // of the recipe as currently composed
  status: 'ok' | 'atencion' | 'critico',
  score,                                       // single score, from scoring.js
  eb: { predicted, min, max, confidence },     // Scale B (ADR-0007), labelled "EB estimada"
  findings: [{
    code, severity: 'critical' | 'warning' | 'info',
    message,                                   // Spanish UI copy
    measured: { value, unit },
    target: { min, max, source, tier, fallback },
    mitigations: [ /* §8.2 */ ],
  }],
  context: { stockCoverage, historicalSimilar },   // informative only (ADR-0004)
  targetsRef, modelVersion, computedAt,
}
```

- **Critical finding codes** (today's `diagnose()` errors, 1356–1374):
  - `trichoderma_risk`
  - `supplementation_exceeds_treatment`
  - `ph_too_acidic`
  - `anaerobic_structure`

  Warnings (C:N out of range, N low/high, pH slightly alkaline, and so on) are `warning` and never require acknowledgement.
- **Status.** `critico` if any critical finding exists, `atencion` if any warning exists, otherwise `ok`. This vocabulary maps from `scoring.js` status and replaces `SCORE_MAP` wording in the Formulador. The human `lote.veredicto` dropdown is untouched and relabelled "Veredicto post-cosecha".
- **Rendering.** `<PeritoPanel>` renders the verdict. Score and EB appear once, in the panel header; duplicate score/EB displays elsewhere on the Formulador screen are removed. `historicalSimilar` uses the L1 similarity from `historical-calibration.js`; the Jaccard "Ya probaste algo parecido" logic (6070–6094) is deleted.
- **Timing.** The verdict is computed in a `useMemo` from applied state only, so `autoImprove` trial candidates never produce a verdict (fixes D11).

### 8.2 Mitigations (`perito-mitigations.js`)

**Catalog entry:**

```js
trichoderma_risk: {
  citations: ['kb:pleurotus_eryngii#tratamiento', …],
  recipeChange: { reduce: ['category:suplemento'], increase: ['category:base_carbono'] },
  processChange: { treatmentClass: 'sterilized', label: 'Autoclave 121 °C × 90 min' },
  monitoring: [{ day: 5, action: 'Revisar bolsas por moho verde (Trichoderma)' },
               { day: 10, action: 'Revisar bolsas por moho verde; aislar las afectadas' }],
}
```

Every catalog value must cite a `knowledge_base/` section. If the KB lacks a citable basis for a mitigation, that mitigation is omitted rather than invented, and the implementation plan records the gap.

**Mitigations offered per critical finding, in this order:**

1. **`recipe_change`.**
   - `searchScenarios({ ..., mustClear: [code] })` returns candidates for which `buildVerdict` no longer reports the code. The result is the candidate with the minimum L1 distance to the current recipe.
   - It is shown as a diff (ingredient Δpp) with ΔEB estimate and Δcost/kg dry.
   - "Aplicar" goes through the native adapter and creates a new `borrador` (the original is untouched).
   - The search runs debounced (400 ms) and only while a critical finding exists, with a time budget of 300 ms of main-thread work per run, yielding between beam generations.
   - If no candidate clears the finding, the panel shows "Sin arreglo cercano en la receta" and offers only the other mitigation kinds.
2. **`process_change`**, when the catalog defines one and it differs from the current treatment.
3. **`monitoring`**, attached only if the operator launches with an acknowledgement.

`perito-scenarios.js` gains the `mustClear` option: it filters candidates through an injected predicate so that the engine does not import `perito-verdict.js`. Existing profiles and ranking are unchanged.

### 8.3 `<LaunchDialog>`

The dialog is built on `AccessibleModal` with its real props (`label`, `onClose`, `children`), fixing the dropped title and accessible name. All controls are at least 44 px, and 56 px in gloves mode. Sections, in order:

1. **Receta.** Version label, status chip; an experimental notice for `prueba`; a promote action for `borrador`.
2. **Plan de pesaje.** From `buildLaunchPlan`: as-received kg (or units) per ingredient, the lots consumed, and water to add.
3. **Tratamiento.** A required radio choice among treatment options, pre-selected with the suggestion. The chosen value is stored as `treatmentConfirmed`.
4. **Riesgos.** One row per critical finding. Each row must reach one resolution before "Lanzar" enables:
   - the recipe change was applied (the dialog closes and the Formulador shows the new draft);
   - the process change was confirmed (the treatment selection matches the catalog's `processChange`); or
   - "Entiendo el riesgo" is ticked, with a required reason `autoclave_disponible | prueba_controlada | otro`, where `otro` requires a note.
5. **Stock.** Shortfalls are listed. Launching requires the acknowledgement "Stock no registrado en bodega". Allocations still consume what is available, and the shortfall is recorded on the lote.

**Hard blocks (unchanged physics):** no species, mass balance outside tolerance, or version still `borrador`.

### 8.4 Lote fields written at launch

```js
peritoVerdictAtLaunch: {            // immutable after create
  schema: 'setas.perito-verdict-at-launch.v1',
  versionId, status, score,
  eb: { predicted, min, max, confidence },
  findings: [{ code, severity, measured, target }],
  resolutions: [{ code, kind: 'mitigation_applied' | 'process_change' | 'acknowledged',
                  reason: null | 'autoclave_disponible' | 'prueba_controlada' | 'otro', note, by, at }],
  treatmentSuggested, treatmentConfirmed,
  stockShortfalls: [...], stockAcknowledged: boolean,
  targetsRef, modelVersion, computedAt,
},
monitoring: [{ code, day, dueDate, action, doneAt: null, doneBy: null }],   // only for acknowledged findings
```

Bitácora lote detail shows a "Vigilancia reforzada" section when `monitoring` is non-empty. Each check can be marked done, and marking one also records an observation event through the existing Bitácora observation path.

## 9. SP4 — Evidence loop and accuracy gate

### 9.1 `recipe-evidence.js`

`forVersion(versionId, { lotes, bolsas, cosechas, links, consumptions })` returns:

```js
{
  schema: 'setas.recipe-evidence.v1',
  versionId,
  lotes: { traceable: n, inferred: n, completed: n },
  ebReal: { mean, sd, n },                     // from SetasBitacora.calcLoteStats, completed lotes
  contaminationRate: { value, bags },          // contaminated bags / total bags
  costPerKgMushroom: { value, n },             // consumed allocation cost / fresh kg harvested
  predictionError: { mae, meanResidual, n },   // ebReal − peritoVerdictAtLaunch.eb.predicted, traceable lotes only
  confidence: 'low' | 'medium',                // Scale A (ADR-0007), never high
}
```

- **Confidence** is not redefined here. It is taken from `cycle-evidence.js` `buildHistoricalEvidence(records, { recipeVersionId })` over the version's traceable records, so Scale A keeps one implementation.

- Inferred lotes are counted and shown separately, and are excluded from `predictionError`. All numbers display their `n`.
- **Where it is shown:**
  - the Recetario version card;
  - the approval dialog, where it is copied into `approval.evidenceAtApproval`;
  - the Formulador, when the composed recipe's `versionId` matches an existing version: "Ya produjiste esta versión: …". Non-identical recipes continue to show "similar", from L1.
- **Constraint.** Nothing in this module influences `scoring.js`, ranking, or `searchScenarios` ordering (ADR-0004).

### 9.2 Accuracy gate

- **Corpus builder.** `scripts/perito-corpus.js` (Node, `firebase-admin`, read-only) reads `bitacora_lotes`, bolsas and cosechas, plus `recipe_versions`, and emits fixtures in the shape `perito-regression-report.js` consumes: `{ sKey, recipe, ebReal, loteId }`, plus `ebPredictedAtLaunch` when present. It writes only to a path passed by argument (a runner temp dir); it never writes inside the repo.
- **Local command.** `npm run perito:gate` builds the corpus with local credentials and runs the report. The output path is git-ignored.
- **CI.** A job in `.github/workflows/field-os-simulador-quality.yml` runs on changes to `scoring.js`, `perito-scenarios.js`, `recipe-optimizer.js`, `species-targets.js`, `perito-verdict.js` or `historical-calibration.js`.
  - It uses the GitHub secret `SETAS_FIRESTORE_READONLY_SA`: a service account restricted to Firestore read (`roles/datastore.viewer`), created by the user.
  - When the secret is absent (fork PRs), the job prints "Perito accuracy gate skipped: no read-only credentials" and succeeds.
  - When the corpus has fewer than 5 completed lotes, the gate reports without failing.
- **Data never leaves the runner.** The repository is public. The corpus exists only in the runner's temp dir for the job's duration; it is never uploaded as an artifact, cached, or committed. The report prints only aggregate metrics (n, MAE, mean residual, baseline delta). If `perito-regression-report.js` currently prints per-lote rows, an `--aggregate-only` flag is added and used in CI.

## 10. Firestore rules changes (`firebase/firestore.rules`)

- Add `function isDireccionOrAdmin() { return signedIn() && role() in ['admin', 'direccion']; }`.
- **`recipe_versions/{versionId}`:**
  - **read:** `signedIn()`.
  - **create:** `signedIn()`; `request.resource.data.versionId == versionId`; `status in ['borrador', 'prueba']`; `createdBy == request.auth.uid`; `masaBalanceada(ingredientes)` (see note).
  - **update:** content fields unchanged, and the transition is one of the following:
    - `borrador → prueba` by a signed-in user;
    - `prueba → aprobada` by `isDireccionOrAdmin()` with `approval.by == request.auth.uid`, where `approval.reason is string` whenever `approval.evidenceAtApproval.traceableLotes < 3`;
    - any status `→ archivada` by `isDireccionOrAdmin()` with `archived.reason is string`.
  - **delete:** `false`.
- **`recipe_version_links/{loteId}`:** read signed-in; create signed-in with `method == 'inferred_exact'`; no update or delete.
- **`inventory_consumptions/{loteId}`:** read signed-in; create signed-in; no update or delete. Transactional validation of lot decrements stays client-side in the transaction, as today.
- **`bitacora_lotes` and `lotes_produccion`:** `recipeSnapshot` (SP2) and `peritoVerdictAtLaunch` (SP3), once present, are immutable on update (same pattern as the existing `recetaSnapshot` rule). The implementation plan verifies whether `bitacora_lotes` already has a match block and adds one if absent, without loosening any existing permission.
- **Note on `masaBalanceada`.** The rule sums only the first 8 ingredients (`getPct(…, 0..7)`). The implementation plan must check the maximum ingredient count the Formulador allows. If it can exceed 8, either extend the function or add `ingredients.size() <= N` with a matching UI limit. Recipes above the limit must not silently pass or silently fail.
- Rules tests are added under `test/firestore.rules.test.js` for every transition and immutability case.

## 11. Error handling

| Situation | Behaviour |
|---|---|
| Firestore write of a recipe version fails | Local cache keeps the version; inline "No se sincronizó con el servidor: …" as today; retried on next save or load. |
| Consumption op fails | §6.3: visible pending badge; retries; after 3 failures, a Bodega banner with the error. Never swallowed. |
| Server reports insufficient stock during the consumption transaction | Op marked `failed` with the shortfall; lote keeps its local record; Bodega banner asks for a stock correction. |
| `resolveTargets` falls back | Result carries `fallback: true`; UI shows "objetivo genérico" next to the affected ranges. |
| `searchScenarios` finds no candidate that clears a finding | "Sin arreglo cercano en la receta"; other mitigation kinds still offered. |
| Mitigation catalog lacks a citable KB basis | That mitigation kind is omitted for the finding; the gap is listed in the plan's KB follow-ups. |
| Legacy recipe fails canonical validation | Imported as `borrador`, `legacy: true`, "revisar" chip. |
| Non-authorized user attempts approve or archive | Button hidden; rules reject if forced; error surfaced. |

## 12. Testing strategy

All new module tests are behavioural `node:test` tests with pure inputs and outputs. Reading source files with regexes is not an acceptable test for anything in this spec.

- **`species-targets.test.js`:**
  - resolution order and the `fallback` flag;
  - classification of representative recipes;
  - the KB validated-formulation test: the *P. eryngii* Formula A (C:N ≈ 36.9) and Formula B (≈ 26.0) from `pleurotus_eryngii.md`, run through `analyze()`, fall inside the resolved targets for their class. Every future KB validated formulation is added to this fixture.
- **`recipe-version.test.js`:**
  - canonicalization and id determinism; no collisions on a generated corpus;
  - every lifecycle transition, allowed and denied;
  - legacy mapping, including the `borrador` fallback.
- **`launch-plan.test.js`:**
  - D1 and D2 regressions: a small ingredient, e.g. 89 g, is allocated as 0.089 kg;
  - unit items; the moisture basis; FIFO order with mixed `fechaIngreso`/`fechaCompra`; shortfalls.
- **`inventory-consumption.test.js`:** local apply, the pending queue, idempotent retry, failure states, and server-allocation replacement (with a fake transport, following the `field-event-mock-transport.js` pattern).
- **`perito-verdict.test.js`:** each critical code triggers and clears at its threshold, status derivation, the snapshot shape, and that a verdict is never produced for unapplied candidates.
- **`perito-mitigations.test.js`:** every catalog entry has at least one citation, and `mustClear` search returns the minimum-L1 candidate that clears the code, or none.
- **`recipe-evidence.test.js`:** aggregation with traceable, inferred and legacy lotes; residual and MAE use traceable lotes only; the confidence cap.
- **Rules tests:** §10.
- **Playwright (`e2e/`):**
  - launch from a balanced recipe on seeded inventory with the "Calcular" toggle off; assert exact per-lot decrements and the lote's `recipeSnapshot.versionId` and `ingredientLots`;
  - a critical-finding launch requires a resolution before "Lanzar" enables;
  - save → reload → Recetario shows the version with its status;
  - apply mitigation → new draft → the original version is unchanged.
- **Existing regex-based tests** touching removed code (the Perito bridges, `formulador-blocking-clarity.test.js` strings that change) are replaced by the behavioural tests above, not kept alongside them.
- **React changes** follow ADR-0002: edit the `.jsx`, run `node build.js`, commit the regenerated `simulador-app.js`, and pass `node --test *.test.js`.

## 13. Knowledge base corrections

These go through the repository's normal KB review process, as part of SP1.

- **`knowledge_base/01_species/pleurotus_eryngii.md:32`:**
  - state the supplemented, sterilized mix C:N as about 25–40 (dry basis, whole mix), citing Li et al. 2024;
  - reword the *P. ostreatus* "70–90" as the C:N of unsupplemented straw base, not a formulation requirement;
  - remove the ★★★★★ rating unless a source that states the number is cited (Rodríguez Estrada & Royse 2007 contains no C:N claim);
  - mark Formula A's EB of 85–110% as not locally validated (measured 74–87%, Li 2024).
- **`knowledge_base/01_species/pleurotus_ostreatus.md`:** add mix C:N and N% targets per substrate class, including N > 1.5% dry-basis mycelial inhibition (Bellettini et al. 2019).
- **`knowledge_base/01_species/ganoderma_lucidum.md`:** no correction; it becomes the source for reishi pH and moisture.

## 14. Sub-project boundaries and delivery

Each sub-project gets its own implementation plan, branch, PR, and review. Each is shippable on its own.

| SP | Contains | Depends on | Done when |
|---|---|---|---|
| SP1 | §6 (targets, launch plan, consumption op, D5–D7, D12, D15, D17) and §13 KB corrections | none | Goals 1–2 verified |
| SP2 | §7 (recipe versions, lifecycle, storage, legacy migration, lote lineage) and §10 rules for `recipe_versions`, links, and `recipeSnapshot` immutability | SP1 (`launch-plan` allocations feed `ingredientLots`) | Goal 3 verified |
| SP3 | §8 (verdict, mitigations, launch dialog, lote snapshot, bridge deletion) and §10 `peritoVerdictAtLaunch` immutability | SP1 (targets), SP2 (`versionId`) | Goals 4–5 verified |
| SP4 | §9 (recipe evidence, corpus, CI gate) | SP2 (lineage), SP3 (`peritoVerdictAtLaunch`) | Goals 6–7 verified |

**Actions reserved for the user:**
- create the read-only Firestore service account and add the `SETAS_FIRESTORE_READONLY_SA` secret (SP4);
- deploy Firestore rules (`firebase/README.md`);
- review the KB corrections.

## 15. Appendix — species target research summary (2026-09-12)

The research compared code `SPP` values, KB files and literature on the quantity `analyze()` computes: whole-mix C:N and N%, dry basis, excluding pH and structure additives.

| Species · parameter | Code | KB | Literature | Verdict |
|---|---|---|---|---|
| *P. eryngii* · mix C:N | 40–65 | 20–25 | 25.5 control, 28.6 best industrial bags (Li 2024) | Both off; ≈25–40 |
| *P. eryngii* · N% | 0.8–1.6 | 1.5–2.0 | ≈1.7 implied (Li 2024) | KB |
| *P. eryngii* · supplementation max | 25% | formulas use 35–40% | ≈52% control (Li 2024) | Code too low |
| *P. eryngii* · moisture | 63 | 63–66 | 65–68 (Bellettini), 65 (Li) | ≈OK, code at low edge |
| *P. eryngii* · EB | 60–90 | 85–110 | 74–87 (Li 2024) | Code closer |
| *P. ostreatus* · mix C:N | 25–50 | 70–90 | residues 25–50; pre-treated straw 50–100 (Bellettini) | Depends on substrate class |
| *P. ostreatus* · N% max | 2.0 | — | mycelial inhibition > 1.5 (Bellettini) | Code high |
| Enoki · C:N | 25–40, ideal 27 | — | 27 best, 108% BE (Han 2024) | Code |
| Reishi · pH / moisture | 4.5–6.0 / 60 | 4.2–5.3 / 65–70 | — | KB plausible |
| Shiitake, lion's mane, nameko, *P. djamor* | — | — | not verified | `legacy_unverified` |

KB formulations run through the code's method: *P. eryngii* Formula A gives C:N 36.9 and N 1.28%; Formula B gives C:N 26.0 and N 1.73%.

Sources:
- Li et al. 2024, *Life*, PMC11123215 — https://pmc.ncbi.nlm.nih.gov/articles/PMC11123215/
- Bellettini et al. 2019, *Saudi J Biol Sci*, PMC6486501 — https://pmc.ncbi.nlm.nih.gov/articles/PMC6486501/
- Han et al. 2024, *Life*, PMC11122278 — https://pmc.ncbi.nlm.nih.gov/articles/PMC11122278/
- Rodríguez Estrada & Royse 2007 — https://pubmed.ncbi.nlm.nih.gov/16973354/
- Oak/eucalyptus sawdust for shiitake, PMC11575786 — https://pmc.ncbi.nlm.nih.gov/articles/PMC11575786/
