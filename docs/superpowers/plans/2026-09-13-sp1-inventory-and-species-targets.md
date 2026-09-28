# SP1 — Inventory Integrity + Sourced Species Targets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop corrupting inventory on lote launch, fix the dry-basis C:N and cost math, and replace hard-coded species targets with sourced targets. Everything is covered by behavioural tests.

**Architecture:**
- **New modules.** Four dependency-free UMD modules: `species-targets.js`, `recipe-version.js` (SP1 subset: tolerance), `launch-plan.js` and `inventory-consumption.js`. They load through the ordered `PROTECTED_APP_SCRIPTS` list and are consumed by `simulador-app.jsx` through the existing `typeof Global !== 'undefined' ? Global : require(...)` pattern.
- **Changed code.** The two launch paths ("Lanzar Lote", "Ejecutar Lote") are rebuilt on one launch plan plus an idempotent, append-only consumption record. `analyze()` in both the JSX and `recipe-optimizer.js` stops double-applying moisture.

**Tech Stack:**
- Plain JS (UMD IIFE), React JSX transpiled by `node build.js` (esbuild).
- `node:test` for units; mocha + `@firebase/rules-unit-testing` for rules.
- Playwright for e2e; `__harness.html` for browser verification without Firebase login.

**Spec:** `docs/superpowers/specs/2026-09-12-formulador-perito-evidence-ledger-design.md` (§1 D1–D7, D12, D15, D17–D19; §4; §6; §12; §13).

## Global Constraints

- **Directories.** All app paths are relative to `field-os-simulador/setas-os/`; run every `npm`/`node` command from that directory. Work in the worktree `.claude/worktrees/evidence-ledger` on a branch created from `design/formulador-perito-evidence-ledger`. Never switch branches in the main checkout; another session uses it.
- **React changes (ADR-0002).** Complete only when all four hold: the `.jsx` is edited, `node build.js` has run, the regenerated `simulador-app.js` **and** `sw.js` (the build restamps `CACHE_VERSION`) are in the same commit, and `node --test *.test.js` passes.
- **Module shape.** Every new module is an IIFE named `init<Name>`, builds an `api` object, and ends with `if (typeof module !== 'undefined' && module.exports) module.exports = api; if (typeof globalThis !== 'undefined') globalThis.Setas<Name> = api;`. No `import`, no `fetch`, no async work at load time.
- **Registration.** Every new module is added to `firebase/auth-gate.js` `PROTECTED_APP_SCRIPTS` after `"../historical-calibration.js"` and before `"../recipe-optimizer.js"`, in this order: `species-targets.js`, `recipe-version.js`, `launch-plan.js`, `inventory-consumption.js`. It goes into the `scripts` array in `firebase/auth-gate.test.js` (test "los motores operativos UMD esperan Auth…") and into `__harness.html`, in the same relative position (after `historical-calibration.js`).
- **Locating code.** Line numbers in `simulador-app.jsx` drift; `main` moved after the spec was written. Locate code with the quoted grep anchors in each task, never by line number alone.
- **Tests (spec §12).** New tests are behavioural: pure inputs and outputs. Regex-over-source tests are not acceptable evidence for anything in this plan. Existing regex tests that pin changed strings are updated, not deleted, unless the behaviour they pin is removed.
- **Copy.** UI copy is Spanish.
- **Units and basis.**
  - Recipe percentages are **dry basis**.
  - Inventory quantities are **as received**; bags are **units**.
  - Mass-balance tolerance is `MASS_BALANCE_TOLERANCE_PP = 0.5`.
  - The EB penalty band is 95–105 (a separate concept, named `EB_PENALTY_BALANCE_BAND`).
- **Data-class separation (ADR-0006).** Every target carries `source ∈ literature | kb | farm | legacy_unverified`. SP1 never writes `farm`. Values never silently substitute for each other.
- **Evidence (ADR-0004).** No change in this plan may make production evidence alter scores or ranking.
- **Protected files.** Do not edit `perito-scenarios.js` or `scoring.js` in SP1.
- **Knowledge base.** Edits to `knowledge_base/` require explicit user authorization (`knowledge_base/AGENTS.md:34`). Task 9 is gated on it.

---

### Task 1: `species-targets.js` — sourced targets module

**Files:**
- Create: `species-targets.js`
- Create: `species-targets.test.js`
- Modify: `firebase/auth-gate.js` (`PROTECTED_APP_SCRIPTS`)
- Modify: `firebase/auth-gate.test.js` (scripts array in the UMD-order test)
- Modify: `__harness.html` (script tag after `historical-calibration.js`)

**Interfaces:**
- Consumes: nothing.
- Produces `globalThis.SetasSpeciesTargets` / `require('./species-targets.js')` with:
  - `classifySubstrate(recipe: {id, p}[], ings: Ingredient[]) → 'bag_supplemented' | 'hardwood_block' | 'straw_unsupplemented' | null`
  - `resolveTargets({ speciesId, substrateClass, treatmentClass = 'any', legacySpp }) → ResolvedTargets | null`
  - `toSppEntry(legacyEntry, resolved) → SPP-shaped entry` (keeps all legacy keys; overwrites `cn_optimal`, `n_optimal`, `ph_optimal`, `moisture`, `supplementation_max`, `eb_baseline`, `eb_optimal`; adds `targets: resolved`)
  - `applyToSpp(spp, speciesId, recipe, ings, treatmentClass = 'any') → spp copy with that species replaced by toSppEntry(...)`
  - `CITATIONS`, `BASIS`, `SUPPLEMENTED_MIN_PCT`
- `ResolvedTargets = { speciesId, substrateClass, treatmentClass, resolvedClass, basis, fallback, cn{min,max,ideal,source,citations,tier}, nPct{…}, ph{min,max,…}, moisture{ideal,min,max,…}, supplementationMaxPct{value,…}, eb{baseline,optimal,…} }`

- [ ] **Step 1: Write the failing test**

```js
// species-targets.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('./species-targets.js');

const INGS = [
  { id: 'paja_trigo', role: 'base_carbono' },
  { id: 'aserrin_roble', role: 'base_carbono' },
  { id: 'salvado_trigo', role: 'suplemento_n' },
  { id: 'cascarilla_arroz', role: 'aireador' },
  { id: 'carbonato_calcio', role: 'aditivo_ph' },
];
const LEGACY = {
  p_eryngii: { name: 'Seta de Cardo', cn_optimal: { min: 40, max: 65, ideal: 50 }, n_optimal: { min: 0.8, max: 1.6, ideal: 1.2 }, ph_optimal: { min: 5.5, max: 7.0 }, moisture: { ideal: 63 }, eb_baseline: 60, eb_optimal: 90, supplementation_max: 25, spawn_rate: 5 },
  p_ostreatus_gris: { name: 'Orellana Gris', cn_optimal: { min: 25, max: 50, ideal: 35 }, n_optimal: { min: 0.8, max: 2.0, ideal: 1.4 }, ph_optimal: { min: 6.0, max: 7.5 }, moisture: { ideal: 65 }, eb_baseline: 90, eb_optimal: 130, supplementation_max: 20, spawn_rate: 8 },
  shiitake: { name: 'Shiitake', cn_optimal: { min: 35, max: 70, ideal: 50 }, n_optimal: { min: 0.6, max: 1.2, ideal: 0.9 }, ph_optimal: { min: 5.0, max: 6.0 }, moisture: { ideal: 60 }, eb_baseline: 50, eb_optimal: 100, supplementation_max: 20, spawn_rate: 5 },
  enoki: { name: 'Enoki', cn_optimal: { min: 25, max: 40, ideal: 27 }, n_optimal: { min: 1.2, max: 2.5, ideal: 1.8 }, ph_optimal: { min: 5.0, max: 7.0 }, moisture: { ideal: 65 }, eb_baseline: 60, eb_optimal: 90, supplementation_max: 30, spawn_rate: 10 },
  reishi: { name: 'Reishi', cn_optimal: { min: 35, max: 65, ideal: 50 }, n_optimal: { min: 0.7, max: 1.2, ideal: 0.9 }, ph_optimal: { min: 4.5, max: 6.0 }, moisture: { ideal: 60 }, eb_baseline: 30, eb_optimal: 60, supplementation_max: 15, spawn_rate: 5 },
};

test('classifySubstrate: suplementado ≥ 2% → bag_supplemented', () => {
  assert.equal(T.classifySubstrate([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], INGS), 'bag_supplemented');
});
test('classifySubstrate: sin suplemento y base mayoritaria de madera dura → hardwood_block', () => {
  assert.equal(T.classifySubstrate([{ id: 'aserrin_roble', p: 90 }, { id: 'cascarilla_arroz', p: 10 }], INGS), 'hardwood_block');
});
test('classifySubstrate: sin suplemento y base de paja → straw_unsupplemented', () => {
  assert.equal(T.classifySubstrate([{ id: 'paja_trigo', p: 98 }, { id: 'carbonato_calcio', p: 2 }], INGS), 'straw_unsupplemented');
});
test('classifySubstrate: receta vacía → null', () => {
  assert.equal(T.classifySubstrate([], INGS), null);
});

test('resolveTargets: eryngii bag_supplemented usa literatura (Li 2024), no los valores heredados', () => {
  const r = T.resolveTargets({ speciesId: 'p_eryngii', substrateClass: 'bag_supplemented', legacySpp: LEGACY });
  assert.equal(r.fallback, false);
  assert.equal(r.basis, 'mix_dry_excl_additives');
  assert.deepEqual([r.cn.min, r.cn.max, r.cn.ideal], [25, 40, 28]);
  assert.equal(r.cn.source, 'literature');
  assert.deepEqual(r.cn.citations, ['li2024']);
  assert.deepEqual([r.nPct.min, r.nPct.max], [1.2, 1.8]);
  assert.equal(r.supplementationMaxPct.value, 55);
  assert.equal(r.ph.source, 'legacy_unverified');
  assert.deepEqual([r.ph.min, r.ph.max], [5.5, 7.0]);
  assert.equal(r.eb.source, 'legacy_unverified');
});
test('resolveTargets: clase sin registro cae a defaultClass y marca fallback', () => {
  const r = T.resolveTargets({ speciesId: 'p_eryngii', substrateClass: 'straw_unsupplemented', legacySpp: LEGACY });
  assert.equal(r.fallback, true);
  assert.equal(r.resolvedClass, 'bag_supplemented');
  assert.equal(r.cn.max, 40);
});
test('resolveTargets: ostreatus paja sin suplementar admite C:N de paja (50–100)', () => {
  const r = T.resolveTargets({ speciesId: 'p_ostreatus_gris', substrateClass: 'straw_unsupplemented', legacySpp: LEGACY });
  assert.deepEqual([r.cn.min, r.cn.max], [50, 100]);
  assert.equal(r.nPct.max, 1.5);
  assert.equal(r.fallback, false);
});
test('resolveTargets: especie sin registros → todo legacy_unverified y fallback', () => {
  const r = T.resolveTargets({ speciesId: 'shiitake', substrateClass: 'hardwood_block', legacySpp: LEGACY });
  assert.equal(r.fallback, true);
  for (const k of ['cn', 'nPct', 'ph', 'moisture', 'supplementationMaxPct', 'eb']) assert.equal(r[k].source, 'legacy_unverified', k);
  assert.deepEqual([r.cn.min, r.cn.max, r.cn.ideal], [35, 70, 50]);
});
test('resolveTargets: enoki C:N con literatura (Han 2024) y reishi pH/humedad desde KB', () => {
  const e = T.resolveTargets({ speciesId: 'enoki', substrateClass: 'bag_supplemented', legacySpp: LEGACY });
  assert.equal(e.cn.source, 'literature'); assert.equal(e.cn.tier, 'high'); assert.equal(e.cn.ideal, 27);
  const r = T.resolveTargets({ speciesId: 'reishi', substrateClass: 'hardwood_block', legacySpp: LEGACY });
  assert.equal(r.ph.source, 'kb'); assert.deepEqual([r.ph.min, r.ph.max], [4.2, 5.3]);
  assert.equal(r.moisture.source, 'kb'); assert.equal(r.moisture.ideal, 67);
});
test('resolveTargets: especie desconocida → null', () => {
  assert.equal(T.resolveTargets({ speciesId: 'nope', substrateClass: null, legacySpp: LEGACY }), null);
});
test('toSppEntry conserva claves heredadas y sobreescribe objetivos', () => {
  const r = T.resolveTargets({ speciesId: 'p_eryngii', substrateClass: 'bag_supplemented', legacySpp: LEGACY });
  const e = T.toSppEntry(LEGACY.p_eryngii, r);
  assert.equal(e.name, 'Seta de Cardo'); assert.equal(e.spawn_rate, 5);
  assert.deepEqual(e.cn_optimal, { min: 25, max: 40, ideal: 28 });
  assert.deepEqual(e.n_optimal, { min: 1.2, max: 1.8, ideal: 1.7 });
  assert.deepEqual(e.moisture, { ideal: 65, min: 63, max: 68 });
  assert.equal(e.supplementation_max, 55);
  assert.equal(e.targets, r);
});
test('toSppEntry no inventa min/max de humedad cuando el heredado no los tiene', () => {
  const r = T.resolveTargets({ speciesId: 'shiitake', substrateClass: null, legacySpp: LEGACY });
  assert.deepEqual(T.toSppEntry(LEGACY.shiitake, r).moisture, { ideal: 60 });
});
test('applyToSpp no muta el SPP original y clasifica por receta', () => {
  const recipe = [{ id: 'aserrin_roble', p: 60 }, { id: 'salvado_trigo', p: 40 }];
  const out = T.applyToSpp(LEGACY, 'p_eryngii', recipe, INGS);
  assert.notEqual(out, LEGACY);
  assert.equal(LEGACY.p_eryngii.cn_optimal.max, 65);
  assert.equal(out.p_eryngii.cn_optimal.max, 40);
  assert.equal(out.p_eryngii.targets.substrateClass, 'bag_supplemented');
  assert.equal(out.shiitake, LEGACY.shiitake);
});
test('toda cita referenciada existe en CITATIONS', () => {
  for (const sp of Object.keys(LEGACY)) for (const cls of [null, 'bag_supplemented', 'straw_unsupplemented', 'hardwood_block']) {
    const r = T.resolveTargets({ speciesId: sp, substrateClass: cls, legacySpp: LEGACY });
    for (const k of ['cn', 'nPct', 'ph', 'moisture', 'supplementationMaxPct', 'eb']) {
      for (const c of r[k].citations) if (r[k].source === 'literature') assert.ok(T.CITATIONS[c], `${sp}.${k} cita ${c}`);
    }
  }
});
test('el módulo puede evaluarse de nuevo sin redeclarar globals', () => {
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, 'species-targets.js'), 'utf8');
  new Function(src)(); new Function(src)();
  assert.ok(globalThis.SetasSpeciesTargets.resolveTargets);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test species-targets.test.js`
Expected: FAIL with `Cannot find module './species-targets.js'`.

- [ ] **Step 3: Write the implementation**

```js
// species-targets.js
'use strict';

// Objetivos de formulación por especie × clase de sustrato × tratamiento.
// Base de cálculo: mezcla completa, base seca, sin aditivos de pH/estructura
// (la misma cantidad que calcula analyze()). Todo campo sin registro con fuente
// se deriva del SPP heredado y queda marcado legacy_unverified (ADR-0006).
(function initSpeciesTargets() {
const BASIS = 'mix_dry_excl_additives';
const SUPPLEMENTED_MIN_PCT = 2;
const SUPPLEMENT_WEIGHT = { suplemento_n: 1, suplemento_medio: 0.6 };
const HARDWOOD_IDS = new Set(['aserrin_roble', 'aserrin_alamo', 'aserrin_eucalipto']);

const CITATIONS = {
  li2024: { authors: 'Li et al.', year: 2024, title: 'Ginkgo leaf powder in Pleurotus eryngii cultivation (Life)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11123215/' },
  bellettini2019: { authors: 'Bellettini et al.', year: 2019, title: 'Factors affecting mushroom Pleurotus spp. (Saudi J Biol Sci)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6486501/' },
  han2024: { authors: 'Han et al.', year: 2024, title: 'Effects of C/N ratios on Flammulina velutipes (Life)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11122278/' },
  kb_ganoderma: { authors: 'knowledge_base', year: 2026, title: 'knowledge_base/01_species/ganoderma_lucidum.md', url: null },
};

const lit = (range, citations, tier, note) => ({ ...range, source: 'literature', citations, tier, ...(note ? { note } : {}) });
const kb = (range, citation) => ({ ...range, source: 'kb', citations: [citation], tier: 'low' });

const OSTREATUS_CLASSES = {
  straw_unsupplemented: {
    treatmentClass: 'any',
    cn: lit({ min: 50, max: 100, ideal: 80 }, ['bellettini2019'], 'medium'),
    nPct: lit({ min: 0.4, max: 1.5, ideal: 0.7 }, ['bellettini2019'], 'low', 'N típico de paja sin suplementar; inhibición micelial > 1.5%'),
  },
  bag_supplemented: {
    treatmentClass: 'any',
    cn: lit({ min: 25, max: 50, ideal: 35 }, ['bellettini2019'], 'medium'),
    nPct: lit({ min: 0.8, max: 1.5, ideal: 1.2 }, ['bellettini2019'], 'low', 'inhibición micelial > 1.5% base seca'),
  },
};

const TABLE = {
  p_eryngii: {
    defaultClass: 'bag_supplemented',
    classes: {
      bag_supplemented: {
        treatmentClass: 'any',
        cn: lit({ min: 25, max: 40, ideal: 28 }, ['li2024'], 'medium'),
        nPct: lit({ min: 1.2, max: 1.8, ideal: 1.7 }, ['li2024'], 'medium'),
        moisture: lit({ min: 63, max: 68, ideal: 65 }, ['bellettini2019', 'li2024'], 'medium'),
        supplementationMaxPct: lit({ value: 55 }, ['li2024'], 'medium'),
      },
    },
  },
  p_ostreatus_gris: { defaultClass: 'bag_supplemented', classes: OSTREATUS_CLASSES },
  p_ostreatus_blanco: { defaultClass: 'bag_supplemented', classes: OSTREATUS_CLASSES },
  enoki: { common: { cn: lit({ min: 25, max: 40, ideal: 27 }, ['han2024'], 'high') } },
  reishi: { common: { ph: kb({ min: 4.2, max: 5.3 }, 'kb_ganoderma'), moisture: kb({ min: 65, max: 70, ideal: 67 }, 'kb_ganoderma') } },
};

const legacyField = fields => ({ ...fields, source: 'legacy_unverified', citations: [], tier: 'unverified' });

const legacyTargets = sp => ({
  cn: legacyField({ min: sp.cn_optimal?.min, max: sp.cn_optimal?.max, ideal: sp.cn_optimal?.ideal }),
  nPct: legacyField({ min: sp.n_optimal?.min, max: sp.n_optimal?.max, ideal: sp.n_optimal?.ideal }),
  ph: legacyField({ min: sp.ph_optimal?.min, max: sp.ph_optimal?.max }),
  moisture: legacyField({ ideal: sp.moisture?.ideal, min: sp.moisture?.min ?? null, max: sp.moisture?.max ?? null }),
  supplementationMaxPct: legacyField({ value: sp.supplementation_max }),
  eb: legacyField({ baseline: sp.eb_baseline, optimal: sp.eb_optimal }),
});

const FIELDS = ['cn', 'nPct', 'ph', 'moisture', 'supplementationMaxPct', 'eb'];

function classifySubstrate(recipe = [], ings = []) {
  if (!Array.isArray(recipe) || recipe.length === 0) return null;
  const byId = new Map((ings || []).map(i => [i.id, i]));
  let supp = 0, base = 0, hardwood = 0;
  for (const r of recipe) {
    const g = byId.get(r.id);
    if (!g) continue;
    const p = parseFloat(r.p ?? r.pct) || 0;
    supp += p * (SUPPLEMENT_WEIGHT[g.role] || 0);
    if (g.role === 'base_carbono') {
      base += p;
      if (HARDWOOD_IDS.has(g.id)) hardwood += p;
    }
  }
  if (supp >= SUPPLEMENTED_MIN_PCT) return 'bag_supplemented';
  if (base > 0 && hardwood / base > 0.5) return 'hardwood_block';
  return 'straw_unsupplemented';
}

function resolveTargets({ speciesId, substrateClass = null, treatmentClass = 'any', legacySpp } = {}) {
  const sp = legacySpp && legacySpp[speciesId];
  if (!sp) return null;
  const entry = TABLE[speciesId] || {};
  const classes = entry.classes || {};
  const matches = rec => rec && (rec.treatmentClass === 'any' || rec.treatmentClass === treatmentClass);
  const exact = substrateClass && matches(classes[substrateClass]) ? classes[substrateClass] : null;
  const resolvedClass = exact ? substrateClass : (entry.defaultClass && matches(classes[entry.defaultClass]) ? entry.defaultClass : null);
  const classRecord = resolvedClass ? classes[resolvedClass] : {};
  const out = {
    speciesId, substrateClass, treatmentClass, resolvedClass,
    basis: BASIS,
    fallback: !exact,
  };
  const legacy = legacyTargets(sp);
  for (const f of FIELDS) out[f] = classRecord[f] || (entry.common && entry.common[f]) || legacy[f];
  return out;
}

function toSppEntry(legacyEntry, resolved) {
  if (!legacyEntry || !resolved) return legacyEntry;
  const m = resolved.moisture;
  return {
    ...legacyEntry,
    cn_optimal: { min: resolved.cn.min, max: resolved.cn.max, ideal: resolved.cn.ideal },
    n_optimal: { min: resolved.nPct.min, max: resolved.nPct.max, ideal: resolved.nPct.ideal },
    ph_optimal: { min: resolved.ph.min, max: resolved.ph.max },
    moisture: { ideal: m.ideal, ...(m.min != null ? { min: m.min } : {}), ...(m.max != null ? { max: m.max } : {}) },
    supplementation_max: resolved.supplementationMaxPct.value,
    eb_baseline: resolved.eb.baseline,
    eb_optimal: resolved.eb.optimal,
    targets: resolved,
  };
}

function applyToSpp(spp, speciesId, recipe, ings, treatmentClass = 'any') {
  if (!spp || !spp[speciesId]) return spp;
  const resolved = resolveTargets({ speciesId, substrateClass: classifySubstrate(recipe, ings), treatmentClass, legacySpp: spp });
  return { ...spp, [speciesId]: toSppEntry(spp[speciesId], resolved) };
}

const api = { BASIS, SUPPLEMENTED_MIN_PCT, CITATIONS, classifySubstrate, resolveTargets, toSppEntry, applyToSpp };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasSpeciesTargets = api;
}
})();
```

- [ ] **Step 4: Register the module**
  - In `firebase/auth-gate.js`, add `"../species-targets.js",` on the line after `"../historical-calibration.js",`.
  - In `firebase/auth-gate.test.js`, in the test `los motores operativos UMD esperan Auth y conservan su orden de dependencias`, add `'../species-targets.js'` to **both** script arrays, right after `'../historical-calibration.js'`.
  - In `__harness.html`, change `<script src="historical-calibration.js"></script><script src="recipe-optimizer.js"></script>` to `<script src="historical-calibration.js"></script><script src="species-targets.js"></script><script src="recipe-optimizer.js"></script>`.

- [ ] **Step 5: Run the tests**

Run: `node --test species-targets.test.js firebase/auth-gate.test.js`
Expected: PASS, all tests.

- [ ] **Step 6: Commit**

```bash
git add species-targets.js species-targets.test.js firebase/auth-gate.js firebase/auth-gate.test.js __harness.html
git commit -m "feat(setas-os): sourced species targets by substrate class (SP1)"
```

---

### Task 2: Dry-basis C:N/N (D18) and moisture-corrected cost (D6) in both `analyze()` implementations, plus the KB formulation gate

**Files:**
- Create: `test-support/jsx-extract.js`
- Create: `analyze-basis.test.js`
- Create: `species-targets-kb.test.js`
- Modify: `simulador-app.jsx` (`const analyze=` function), `recipe-optimizer.js` (`analyze`, lines ~15–60)
- Regenerate: `simulador-app.js`, `sw.js`

**Interfaces:**
- Consumes: `SetasSpeciesTargets.applyToSpp` (Task 1).
- Produces:
  - JSX `analyze(recipe, sKey, ings = INGS, spp = SPP)` (new 4th parameter; `sp = spp[sKey]`).
  - `recipe-optimizer.js` `analyze(recipe, sKey, ings, spp)` (unchanged signature).
  - Both compute C:N/N weighted by the dry-basis `p`, and `cost` as COP per kg of **dry** mix = `Σ (p/100) × cost / (1 − m)`, with `m` clamped to [0, 0.92].
  - `test-support/jsx-extract.js` exports `extractConsts(names: string[]) → object` of evaluated top-level `const` declarations from `simulador-app.jsx`.

- [ ] **Step 1: Write the JSX extraction helper**

```js
// test-support/jsx-extract.js
'use strict';
// Extrae declaraciones `const NOMBRE=` de nivel superior de simulador-app.jsx y las
// evalúa juntas, para probar funciones puras del JSX sin cargar React.
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'simulador-app.jsx'), 'utf8');

function sliceDeclaration(name) {
  const re = new RegExp(`(^|\\n)const ${name}\\s*=`);
  const m = re.exec(SRC);
  if (!m) throw new Error(`const ${name}= no encontrado en simulador-app.jsx`);
  const start = m.index + m[1].length;
  let i = SRC.indexOf('=', start) + 1;
  let depth = 0, inStr = null;
  for (; i < SRC.length; i++) {
    const c = SRC[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if ((c === ';' || c === '\n') && depth === 0) {
      const rest = SRC.slice(i + 1).trimStart();
      if (c === ';' || rest.startsWith('const ') || rest.startsWith('function ') || rest.startsWith('//')) break;
    }
  }
  return SRC.slice(start, i).replace(/;?\s*$/, ';');
}

function extractConsts(names) {
  const body = names.map(sliceDeclaration).join('\n') + `\nreturn { ${names.join(', ')} };`;
  // eslint-disable-next-line no-new-func
  return new Function(body)();
}

module.exports = { extractConsts };
```

- [ ] **Step 2: Write the failing tests**

```js
// analyze-basis.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const optimizer = require('./recipe-optimizer.js');

// Si falla con ReferenceError por otra constante de nivel superior que analyze usa,
// añade su nombre a esta lista (antes de 'analyze').
const JSX = extractConsts(['SPP', 'INGS', 'DENSOS', 'analyze']);

const FORMULA_B = [
  { id: 'tusa_maiz', p: 40 }, { id: 'paja_trigo', p: 15 }, { id: 'afrecho_cerveceria', p: 20 },
  { id: 'salvado_trigo', p: 15 }, { id: 'cascarilla_arroz', p: 5 }, { id: 'carbonato_calcio', p: 3 }, { id: 'yeso', p: 2 },
];

for (const [label, analyze] of [
  ['JSX', (r, s) => JSX.analyze(r, s, JSX.INGS, JSX.SPP)],
  ['recipe-optimizer', (r, s) => optimizer.analyze(r, s, JSX.INGS, JSX.SPP)],
]) {
  test(`${label}: C:N y N se ponderan por % base seca sin volver a descontar humedad (D18)`, () => {
    const a = analyze(FORMULA_B, 'p_eryngii');
    assert.ok(Math.abs(a.cn - 26.0) < 0.15, `cn=${a.cn}`);
    assert.ok(Math.abs(a.avgN - 1.73) < 0.01, `avgN=${a.avgN}`);
  });
  test(`${label}: costo por kg seco corrige la humedad del insumo (D6)`, () => {
    const g = JSX.INGS.find(i => i.id === 'borra_cafe');
    const a = analyze([{ id: 'borra_cafe', p: 100 }], 'p_ostreatus_gris');
    const expected = g.cost / (1 - Math.min(0.92, g.moisture / 100));
    assert.ok(Math.abs(a.cost - expected) < 0.01, `cost=${a.cost} esperado=${expected}`);
  });
}

test('JSX analyze usa el spp recibido (4º parámetro) para objetivos de especie', () => {
  const spp = { ...JSX.SPP, p_eryngii: { ...JSX.SPP.p_eryngii, eb_baseline: 1, eb_optimal: 2 } };
  const a = JSX.analyze(FORMULA_B, 'p_eryngii', JSX.INGS, spp);
  assert.equal(a.sp.eb_baseline, 1);
  assert.ok(a.eb <= 2);
});
```

```js
// species-targets-kb.test.js
'use strict';
// Las formulaciones validadas de knowledge_base/01_species/*.md deben caer dentro de
// sus propios objetivos. Este test habría detectado el conflicto eryngii C:N 40–65.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const { analyze } = require('./recipe-optimizer.js');
const T = require('./species-targets.js');

const { SPP, INGS } = extractConsts(['SPP', 'INGS']);

const KB_FORMULATIONS = [
  { source: 'pleurotus_eryngii.md · Fórmula A (roble)', speciesId: 'p_eryngii', recipe: [
    { id: 'aserrin_roble', p: 45 }, { id: 'salvado_trigo', p: 25 }, { id: 'cascarilla_soya', p: 15 },
    { id: 'cascarilla_arroz', p: 10 }, { id: 'carbonato_calcio', p: 3 }, { id: 'yeso', p: 2 }] },
  { source: 'pleurotus_eryngii.md · Fórmula B', speciesId: 'p_eryngii', recipe: [
    { id: 'tusa_maiz', p: 40 }, { id: 'paja_trigo', p: 15 }, { id: 'afrecho_cerveceria', p: 20 },
    { id: 'salvado_trigo', p: 15 }, { id: 'cascarilla_arroz', p: 5 }, { id: 'carbonato_calcio', p: 3 }, { id: 'yeso', p: 2 }] },
];

for (const f of KB_FORMULATIONS) {
  test(`${f.source} cae dentro de sus objetivos resueltos`, () => {
    const spp = T.applyToSpp(SPP, f.speciesId, f.recipe, INGS);
    const t = spp[f.speciesId].targets;
    const a = analyze(f.recipe, f.speciesId, INGS, spp);
    assert.ok(a.cn >= t.cn.min && a.cn <= t.cn.max, `C:N ${a.cn.toFixed(1)} fuera de ${t.cn.min}–${t.cn.max}`);
    assert.ok(a.avgN >= t.nPct.min && a.avgN <= t.nPct.max, `N ${a.avgN.toFixed(2)} fuera de ${t.nPct.min}–${t.nPct.max}`);
    assert.ok(a.suppP <= t.supplementationMaxPct.value, `suplementación ${a.suppP} > ${t.supplementationMaxPct.value}`);
    assert.equal(a.trichoderma, false);
  });
}
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test analyze-basis.test.js species-targets-kb.test.js`
Expected: FAIL.
- The `C:N y N se ponderan…` tests fail with `cn=34.5…` for both engines.
- The cost tests fail.
- The JSX `spp` test fails because `a.sp.eb_baseline` is 60.
- The KB test for Formula B fails on C:N 34.5 **only if** the targets are not applied (after Task 1 they are). The formula tests may already pass for A; that is acceptable.

If `extractConsts` throws `ReferenceError: X is not defined`, `X` is another top-level `const` that `analyze` uses: add it to the names list before `'analyze'`. If it throws `const X= no encontrado`, `X` is not a top-level declaration (e.g. it is local to `analyze`): remove it from the list. Re-run until the only failures are the assertions above.

- [ ] **Step 4: Fix the JSX `analyze`** (anchor: `const analyze=`)
  1. Change the signature `const analyze=(recipe,sKey,ings=INGS)=>` to `const analyze=(recipe,sKey,ings=INGS,spp=SPP)=>`. Inside the function, replace every `SPP[sKey]` with `spp[sKey]`.
  2. Replace the two lines starting `const dryFrac=p*(1-Math.min(0.92` and `if(g.cn>0&&!esAditivoSeco){wC+=g.c*dryFrac;` (and the two comment lines above them that begin `// C:N BASE SECA`) with:

```js
    // Los % de la receta ya están en base seca ("Porcentaje en base seca"): ponderar por p.
    // Descontar humedad aquí la aplicaba dos veces y subestimaba insumos húmedos (D18).
    if(g.cn>0&&!esAditivoSeco){wC+=g.c*p;wN+=g.n*p;nP+=p;}
```

  3. Replace the line starting `const cost=recipe.reduce(` with:

```js
  // COP por kg de mezcla SECA: el precio de bodega es por kg tal cual se recibe (D6).
  const cost=recipe.reduce((s,r)=>{const g=ings.find(i=>i.id===r.id);if(!g) return s;const m=Math.min(0.92,Math.max(0,(Number(g.moisture)||0)/100));return s+(g.cost/(1-m))*(parseFloat(r.p)||0)/100;},0);
```

  4. Replace the line `if(tot<95||tot>105) eb*=.95;` with `if(tot<EB_PENALTY_BALANCE_BAND.min||tot>EB_PENALTY_BALANCE_BAND.max) eb*=.95;`, and add this line directly above `const analyze=`:

```js
const EB_PENALTY_BALANCE_BAND={min:95,max:105}; // castigo de EB por balance muy fuera de 100 — no es la tolerancia de guardado
```

  Add `'EB_PENALTY_BALANCE_BAND'` to the `extractConsts` list in `analyze-basis.test.js`, before `'analyze'`.

- [ ] **Step 5: Mirror the fix in `recipe-optimizer.js` `analyze`**
  - Replace lines 28–29 (`const dryFrac = p * (1 - Math.min(0.92, …` and `if (g.cn > 0 && !esAditivoSeco) { wC += g.c * dryFrac; …`) with:

```js
      // % de receta en base seca: ponderar por p (D18).
      if (g.cn > 0 && !esAditivoSeco) { wC += g.c * p; wN += g.n * p; nP += p; }
```

  - Replace the `const cost = recipe.reduce((s, r) => { … g.cost * (parseFloat(r.p) || 0) / 100 … }, 0);` block with:

```js
    // COP por kg de mezcla seca (precio por kg tal cual se recibe) — D6.
    const cost = recipe.reduce((s, r) => {
      const g = ings.find(i => i.id === r.id);
      if (!g) return s;
      const m = Math.min(0.92, Math.max(0, (Number(g.moisture) || 0) / 100));
      return s + (g.cost / (1 - m)) * (parseFloat(r.p) || 0) / 100;
    }, 0);
```

  - Replace `if (tot < 95 || tot > 105)` with `if (tot < EB_PENALTY_BALANCE_BAND.min || tot > EB_PENALTY_BALANCE_BAND.max)`, and add `const EB_PENALTY_BALANCE_BAND = { min: 95, max: 105 };` at the top of the IIFE body.

- [ ] **Step 6: Build and run the full suite**

Run: `node build.js && node --test *.test.js`
Expected: `analyze-basis.test.js` and `species-targets-kb.test.js` PASS. Any other failure is caused by the corrected math changing a pinned number:
- Open each failing test.
- If it pins a C:N, N or cost value computed with the old double-moisture weighting, update the expected value to the dry-basis result, and add `// D18/D6: base seca` next to it.
- If it fails for any other reason, stop and report it; do not change unrelated expectations.

- [ ] **Step 7: Commit**

```bash
git add test-support/jsx-extract.js analyze-basis.test.js species-targets-kb.test.js simulador-app.jsx simulador-app.js sw.js recipe-optimizer.js
git add -u   # tests whose pinned values were updated in Step 6
git commit -m "fix(setas-os): dry-basis C:N/N and moisture-corrected cost in analyze (D18, D6)"
```

---

### Task 3: One mass-balance tolerance (`recipe-version.js`) and removal of the dead DOM fallback (D12, D17)

**Files:**
- Create: `recipe-version.js`
- Create: `recipe-version.test.js`
- Modify: `formulator-api.js`, `perito-scenarios.test.js` (assertions ~230–234), `firebase/auth-gate.js`, `firebase/auth-gate.test.js`, `__harness.html`
- Modify: `formulator-native-adapter.test.js` (only if a case relies on the DOM adapter)
- Modify: `.agents/skills/setas-formulation-engine/SKILL.md` at the repo root (the sentence saying to keep the DOM fallback)

**Interfaces:**
- Produces `globalThis.SetasRecipeVersion` with:
  - `MASS_BALANCE_TOLERANCE_PP = 0.5`
  - `totalPct(rows: {p?|pct?}[]) → number`
  - `isMassBalancedTotal(tot: number) → boolean`

  SP2 extends this module.
- `SetasFormulatorAPI`:
  - `getRecipe()` → `[]`, `getLockedIds()` → empty `Set`, `getState()` → `{ recipe: [], lockedIds: Set, batchWetKg: null, adapter: null }` when no native adapter is registered;
  - `applyRecipe`/`undoRecipe` → `{ ok: false, code: 'no_native_adapter', message: 'El Formulador no está listo para aplicar recetas.', adapter: null }` when no native adapter is registered;
  - validation tolerance comes from `SetasRecipeVersion.MASS_BALANCE_TOLERANCE_PP`.

- [ ] **Step 1: Write the failing tests**

```js
// recipe-version.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const RV = require('./recipe-version.js');

test('MASS_BALANCE_TOLERANCE_PP es 0.5', () => assert.equal(RV.MASS_BALANCE_TOLERANCE_PP, 0.5));
test('totalPct acepta p, pct y strings', () => {
  assert.equal(RV.totalPct([{ p: 60 }, { pct: '30' }, { p: '10.0' }]), 100);
});
test('isMassBalancedTotal: dentro de ±0.5 inclusive', () => {
  assert.equal(RV.isMassBalancedTotal(100.5), true);
  assert.equal(RV.isMassBalancedTotal(99.5), true);
  assert.equal(RV.isMassBalancedTotal(100.51), false);
  assert.equal(RV.isMassBalancedTotal(NaN), false);
});
```

Append to `formulator-native-adapter.test.js` (it already `require`s `./formulator-api.js`; add `require('./recipe-version.js');` at its top if absent):

```js
test('sin adaptador nativo: applyRecipe responde no_native_adapter y getState no toca el DOM', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const state = api.getState();
  if (state.adapter !== null) return; // otro test dejó un adaptador registrado; este caso no aplica
  assert.deepEqual(state.recipe, []);
  assert.equal(state.batchWetKg, null);
  const res = await api.applyRecipe([{ id: 'a', p: 60 }, { id: 'b', p: 40 }]);
  assert.equal(res.ok, false);
  assert.equal(res.code, 'no_native_adapter');
});

test('validateRecipe usa la tolerancia única de balance (±0.5)', () => {
  const api = globalThis.SetasFormulatorAPI;
  assert.equal(api.validateRecipe([{ id: 'a', p: 60 }, { id: 'b', p: 40.4 }]), null);
  assert.match(api.validateRecipe([{ id: 'a', p: 60 }, { id: 'b', p: 40.6 }]), /±0\.5%/);
});
```

If the existing tests in `formulator-native-adapter.test.js` register an adapter at module scope and never unregister it, place the no-adapter test first and call the unregister function returned by `registerNativeAdapter` in each existing test's cleanup, so the no-adapter case runs with no adapter.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test recipe-version.test.js formulator-native-adapter.test.js`
Expected: FAIL. `recipe-version.js` is not found; `code` is `undefined`; the `±0.5%` message does not match (current tolerance ±0.15).

- [ ] **Step 3: Write `recipe-version.js`**

```js
// recipe-version.js
'use strict';

// Identidad y reglas de versión de receta. SP1: tolerancia única de balance de masa.
(function initRecipeVersion() {
const MASS_BALANCE_TOLERANCE_PP = 0.5;

const totalPct = (rows = []) => (rows || []).reduce((s, r) => s + (parseFloat(r?.p ?? r?.pct) || 0), 0);
const isMassBalancedTotal = tot => Number.isFinite(tot) && Math.abs(tot - 100) <= MASS_BALANCE_TOLERANCE_PP + 1e-9;

const api = { MASS_BALANCE_TOLERANCE_PP, totalPct, isMassBalancedTotal };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasRecipeVersion = api;
}
})();
```

- [ ] **Step 4: Edit `formulator-api.js`**
  1. Delete the functions `rangeForName`, `numberForName`, `actionButton`, `setNativeValue`, `readRecipeFromDom`, `readLockedFromDom`, `readBatchWetKgFromDom`, `filterSnapshot`, `prepareCatalog`, `restoreCatalog`, `autoAdjustButton` and `mutateDom`, together with any helper used only by them.
  2. Replace `const RECIPE_TOTAL_TOLERANCE = 0.15;` with:

```js
  // Se lee al validar: recipe-version.js carga después de este archivo en el runtime protegido.
  const balanceTolerance = () => {
    const rv = globalThis.SetasRecipeVersion
      || (typeof require !== 'undefined' ? require('./recipe-version.js') : null);
    if (!rv) throw new Error('recipe-version.js no está cargado');
    return rv.MASS_BALANCE_TOLERANCE_PP;
  };
  const NO_ADAPTER = { ok: false, code: 'no_native_adapter', message: 'El Formulador no está listo para aplicar recetas.', adapter: null };
```

  3. In `validateRecipe`, replace both uses of `RECIPE_TOTAL_TOLERANCE` with a local `const tol = balanceTolerance();` declared at the start of the function.
  4. Replace `getRecipe`, `getLockedIds` and `getState` with:

```js
  const getRecipe = () => (nativeAdapter?.getRecipe ? nativeAdapter.getRecipe() : []);
  const getLockedIds = () => (nativeAdapter?.getLockedIds ? new Set(nativeAdapter.getLockedIds() || []) : new Set());
  const getState = () => ({
    recipe: getRecipe(),
    lockedIds: getLockedIds(),
    batchWetKg: nativeAdapter?.getBatchWetKg ? nativeAdapter.getBatchWetKg() : null,
    adapter: nativeAdapter ? 'native' : null,
  });
```

  5. In `applyRecipe`:
     - Immediately after the `validationError` check, insert `if (!nativeAdapter?.applyRecipe) return { ...NO_ADAPTER };`.
     - Change `adapter: nativeAdapter ? 'native' : 'dom'` in the validation return to `adapter: nativeAdapter ? 'native' : null`.
     - Delete the `else { result = await mutateDom(targetRecipe, options); }` branch.
     - Delete the `if (!nativeAdapter && typeof distance === 'function' …) { await mutateDom(…) }` rollback block; keep `return result;`.
  6. In `undoRecipe`, add `if (!nativeAdapter?.applyRecipe) return { ...NO_ADAPTER };` as its first line, and remove any `mutateDom` call in it.
  7. `names` parameters no longer used by readers can stay in call sites; do not change the public function list at the bottom except to keep `adapterType` returning `nativeAdapter ? 'native' : null`.
  8. Leave the locked-ingredient guard `> 0.15` in `applyRecipe` unchanged. It compares a locked row's percentage, not mass balance.

- [ ] **Step 5: Update the pinned assertions and docs**
  - In `perito-scenarios.test.js`, replace `assert.match(formulatorApi, /mutateDom/)` with `assert.match(formulatorApi, /no_native_adapter/)`.
  - In `.agents/skills/setas-formulation-engine/SKILL.md`, replace the sentence instructing to keep the DOM fallback with: `SetasFormulatorAPI requires the native adapter registered by simulador-app.jsx; without it, applyRecipe returns { ok:false, code:'no_native_adapter' }.`
  - Register `recipe-version.js` exactly as in Task 1 Step 4: in `auth-gate.js`, the auth-gate test arrays, and `__harness.html`, placed right after `species-targets.js`.

- [ ] **Step 6: Use the module in the JSX** (anchor: `const MASS_BALANCE_TOL=0.5;`)
  - Near the other UMD imports (anchor: `const { ` … `= (typeof SetasRecipeOptimizer !== 'undefined'`), add:

```js
const SetasRecipeVersionApi=(typeof SetasRecipeVersion!=='undefined'?SetasRecipeVersion:(typeof require!=='undefined'?require('./recipe-version.js'):null));
```

  - Replace `const MASS_BALANCE_TOL=0.5;` with `const MASS_BALANCE_TOL=SetasRecipeVersionApi.MASS_BALANCE_TOLERANCE_PP;`.
  - Total bar (anchor: `an.tot>=99&&an.tot<=101?'ok'`): replace `an.tot>=99&&an.tot<=101?'ok':an.tot<95||an.tot>105?'err':'warn'` with `isMassBalanced(an)?'ok':(an.tot<EB_PENALTY_BALANCE_BAND.min||an.tot>EB_PENALTY_BALANCE_BAND.max)?'err':'warn'`.
  - Chip (anchor: `(an.tot<97||an.tot>103)&&`): replace `(an.tot<97||an.tot>103)&&` with `!isMassBalanced(an)&&`.
  - Add `test-support/jsx-extract.js`-based coverage to `recipe-version.test.js`:

```js
test('el JSX usa la tolerancia del módulo', () => {
  const { extractConsts } = require('./test-support/jsx-extract.js');
  globalThis.SetasRecipeVersion = RV;
  const { isMassBalanced } = extractConsts(['SetasRecipeVersionApi', 'MASS_BALANCE_TOL', 'isMassBalanced']);
  assert.equal(isMassBalanced({ tot: 100.5 }), true);
  assert.equal(isMassBalanced({ tot: 100.6 }), false);
});
```

- [ ] **Step 7: Build and run everything**

Run: `node build.js && node --test *.test.js firebase/auth-gate.test.js`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add recipe-version.js recipe-version.test.js formulator-api.js formulator-native-adapter.test.js perito-scenarios.test.js firebase/auth-gate.js firebase/auth-gate.test.js __harness.html simulador-app.jsx simulador-app.js sw.js ../../.agents/skills/setas-formulation-engine/SKILL.md
git commit -m "fix(setas-os): single mass-balance tolerance; remove dead DOM adapter (D12, D17)"
```

---

### Task 4: Wire sourced targets, moisture, co-formulation key and batch economics into the Formulador (D5, D7, D8, D6 display)

**Files:**
- Modify: `simulador-app.jsx`
- Regenerate: `simulador-app.js`, `sw.js`
- Create: `formulador-targets-wiring.test.js`

**Interfaces:**
- Consumes:
  - `SetasSpeciesTargets.applyToSpp`, `classifySubstrate` (Task 1);
  - JSX `analyze(recipe, sKey, ings, spp)` (Task 2);
  - `calcBatch(recipe, n, kg, hObj, spawnCostKg, ings, dynSpawn, tr, eb, sKey, customFreshPrice, customBagConsumable)` (existing).
- Produces:
  - component-level `effectiveSPP` (`useMemo`);
  - `an.moistureTarget` (number, % wet);
  - `an.targets` (the `ResolvedTargets` of the active species);
  - `diagnose(a, sKey)` reads `a.sp`.

- [ ] **Step 1: Write the failing test** (pure functions only)

```js
// formulador-targets-wiring.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
globalThis.SetasSpeciesTargets = require('./species-targets.js');
globalThis.SetasRecipeVersion = require('./recipe-version.js');

const X = extractConsts(['SPP', 'INGS', 'DENSOS', 'EB_PENALTY_BALANCE_BAND', 'analyze', 'diagnose']);
const T = globalThis.SetasSpeciesTargets;
const FORMULA_A = [
  { id: 'aserrin_roble', p: 45 }, { id: 'salvado_trigo', p: 25 }, { id: 'cascarilla_soya', p: 15 },
  { id: 'cascarilla_arroz', p: 10 }, { id: 'carbonato_calcio', p: 3 }, { id: 'yeso', p: 2 }];

test('analyze expone moistureTarget y targets de la especie resuelta', () => {
  const spp = T.applyToSpp(X.SPP, 'p_eryngii', FORMULA_A, X.INGS);
  const a = X.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp);
  assert.equal(a.moistureTarget, 65);
  assert.equal(a.targets.cn.source, 'literature');
});

test('diagnose no marca "C:N alto/bajo" para la Fórmula A validada del KB (D8)', () => {
  const spp = T.applyToSpp(X.SPP, 'p_eryngii', FORMULA_A, X.INGS);
  const msgs = X.diagnose(X.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp), 'p_eryngii').map(m => m.tx);
  assert.ok(!msgs.some(t => /^C:N (bajo|alto)/.test(t)), msgs.join(' | '));
  assert.ok(msgs.some(t => /C:N óptimo/.test(t)));
});

test('diagnose cita la humedad objetivo resuelta, no un literal (D5)', () => {
  const spp = T.applyToSpp(X.SPP, 'p_eryngii', FORMULA_A, X.INGS);
  const msgs = X.diagnose(X.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp), 'p_eryngii').map(m => m.tx);
  assert.ok(!msgs.some(t => /67–68%/.test(t)), 'literal 67–68% debe desaparecer');
  assert.ok(msgs.some(t => /humedad objetivo 65%/.test(t)));
});
```

If `extractConsts` reports a missing top-level const that `diagnose` uses, add it to the list before `'diagnose'`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test formulador-targets-wiring.test.js`
Expected: FAIL. `a.moistureTarget` is `undefined`; the eryngii "C:N bajo" message is present; the `67–68%` literal is present.

- [ ] **Step 3: Implement in `analyze` and `diagnose`**
  - In `analyze`, add `moistureTarget:sp?.moisture?.ideal??null,targets:sp?.targets??null,` to the returned object (anchor: the `return{tot,avgN,cn,cost,eb,` line).
  - In `diagnose(a,sKey)`, set `const sp=a.sp||SPP[sKey];` at its top, and use `sp` wherever it currently reads `SPP[sKey]`.
  - Replace the line containing `Tenjo 2.580 msnm: humedad objetivo 67–68%` with:

```js
  s.push({t:'success',i:'△',tx:`Tenjo 2.580 msnm: humedad objetivo ${sp?.moisture?.ideal??'—'}%${sp?.targets?.moisture?.source==='legacy_unverified'?' (valor heredado sin verificar)':''}. Pasteurización sin presión: +25% tiempo. CWLP: pH≥12.`});
```

- [ ] **Step 4: Wire `effectiveSPP` into the Formulador component**
  - Next to the other UMD imports, add:

```js
const SetasSpeciesTargetsApi=(typeof SetasSpeciesTargets!=='undefined'?SetasSpeciesTargets:(typeof require!=='undefined'?require('./species-targets.js'):null));
```

  - In the component, directly **before** the `useMemo` that computes `an` (anchor: `const an=useMemo(`), add:

```js
  const effectiveSPP=useMemo(()=>SetasSpeciesTargetsApi.applyToSpp(SPP,sKey,recipe,effectiveINGS),[sKey,recipe,effectiveINGS]);
```

  - Change that `analyze(` call to pass `effectiveSPP` as the 4th argument.
  - Then pass `effectiveSPP` instead of `SPP` at every call inside this component that forwards an SPP object: `calcTreatment(an, sKey, SPP)` → `calcTreatment(an, sKey, effectiveSPP)`; `analyzeCoFormulation(recipe,coSpecConfig,effectiveINGS,SPP)` → `…,effectiveSPP)`. Find the rest with `grep -n "SPP)" simulador-app.jsx` and `grep -n ",SPP," simulador-app.jsx`, restricted to the Formulador component's line range: from `function SimuladorApp` or the component that declares `const an=useMemo(` to its closing.
  - Direct reads such as `SPP[sKey].cn_optimal` inside that component become `effectiveSPP[sKey].cn_optimal`.
  - Reads outside the component (species cards, species guide) keep `SPP`, which is the legacy catalog view and out of scope.
  - Update the eryngii `notes` text in the `SPP` literal: replace `C:N alto 40–65 (literatura Kim 2011)` with `C:N 25–40 en bolsa suplementada esterilizada (Li 2024)`. Keep the literal's `const SPP = {` / `};` shape unchanged for `perito-regression-report.js`.

- [ ] **Step 5: Moisture strip and batch moisture defaults (D5)**
  - Summary strip (anchor: `{an?.h!=null?`): replace that cell's value and provenance with:

```jsx
<span className="form-summary-v">{an?.moistureTarget!=null?`${an.moistureTarget}%`:'—'}</span>
<span className="os-provenance-line">{an?.targets?.moisture?.source==='legacy_unverified'?'Objetivo heredado':'Objetivo con fuente'}{bd?` · agua a añadir ${bd.agua.toFixed(1)} kg`:''}</span>
```

  - Change the label `<span className="form-summary-k">Humedad</span>` in that cell to `Humedad objetivo`.
  - Add an effect in the component so the batch moisture inputs follow the resolved target when the species or substrate class changes, unless the operator edited them:

```js
  const moistureTouched=useRef({hObj:false,prodH:false});
  useEffect(()=>{
    const t=an?.moistureTarget; if(t==null) return;
    if(!moistureTouched.current.hObj) setHObj(t);
    if(!moistureTouched.current.prodH) setProdH(t);
  },[sKey,an?.targets?.resolvedClass,an?.moistureTarget]);
```

  - In the `onChange` of the `bf-hobj` input, set `moistureTouched.current.hObj=true` before `setHObj`; in the `prod-h` input, set `moistureTouched.current.prodH=true` before `setProdH`. Import `useRef` if the component does not already destructure it from `React`.

- [ ] **Step 6: Co-formulation key (D7) and batch economics (D6)**
  - Replace `useState({p_ostreatus_gris:60,p_djamor_rosada:40})` with `useState({p_ostreatus_gris:60,p_djamor_rosa:40})`.
  - `bd` memo (anchor: `const bd=useMemo(()=>showBatch?calcBatch(`): pass the full argument list:

```js
  const bd=useMemo(()=>showBatch?calcBatch(recipe,numBags,kgBag,hObj,spawnCost,effectiveINGS,an?.dynSpawn,tr,an?.eb,sKey,vegPrice):null,[recipe,numBags,kgBag,showBatch,hObj,spawnCost,effectiveINGS,an?.dynSpawn,tr,an?.eb,sKey,vegPrice]);
```

  - `bd` is declared **before** `tr` in the current code; move the `const tr=useMemo(` line above the `bd` line so `tr` is initialised first.
  - `vegPrice` default: replace `useState(12000)` for `vegPrice` with `useState(null)`.
    - Its input (anchor: `vegPrice` input near "Precio venta") gets `value={vegPrice??''}`, `placeholder={String(DEFAULT_FRESH_PRICES[sKey]||22000)}`, and `onChange={e=>setVegPrice(e.target.value===''?null:Number(e.target.value))}`.
    - Replace every other `vegPrice` read used for revenue with `bd.freshPriceKg`: the margin block (anchor: `const revenue=yieldKg*vegPrice`) and the text `Precio venta ${vegPrice.toLocaleString()}`.
  - Cost labels: the strip cost cell (anchor: `$${Math.round(an.cost)}`) gets the provenance text `COP / kg seco`. In the bodega note (anchor: `catálogo: ${`), change `/kg` after `an.cost` to `/kg seco`.

- [ ] **Step 7: Build, run the tests, and verify in the harness**

Run: `node build.js && node --test *.test.js`
Expected: PASS. Update any regex test that pins a replaced string (`p_djamor_rosada`, the `an?.h` strip, the `67–68%` text, `vegPrice` text) to the new string.

Browser check (Firebase-free harness):

```bash
python3 -m http.server 8765 >/dev/null 2>&1 &
```

- Open `http://127.0.0.1:8765/__harness.html`.
- Pick *Seta de Cardo*, add the Formula A ingredients at 45/25/15/10/3/2, and confirm:
  - there is no "C:N bajo" message;
  - the strip shows `Humedad objetivo 65%`.
- Pick *Orellana Gris* with 100% `paja_trigo` + 0% supplement, and confirm that C:N ≈ 90 shows as optimal.
- Take a screenshot and read the words.
- Stop the server with `kill %1`.

- [ ] **Step 8: Commit**

```bash
git add simulador-app.jsx simulador-app.js sw.js formulador-targets-wiring.test.js
git add -u
git commit -m "feat(setas-os): Formulador uses sourced targets, moisture target, fixed economics (D5–D8)"
```

---

### Task 5: `launch-plan.js` — one launch plan for both paths (D1, D2, D4)

**Files:**
- Create: `launch-plan.js`
- Create: `launch-plan.test.js`
- Modify: `firebase/auth-gate.js`, `firebase/auth-gate.test.js`, `__harness.html` (after `recipe-version.js`)

**Interfaces:**
- Consumes: nothing (pure).
- Produces `globalThis.SetasLaunchPlan`:
  - `buildLaunchPlan(input) → LaunchPlan`
  - `input = { recipe: {id,p}[], bags: number, kgPerBag: number, moistureTarget: number /* % wet */, ingredients: {id,name,moisture,cost}[], inventoryLots: Lot[], moistureOverrides?: {[id]: number}, scaleG?: number, spawn?: { ingredientId: string, kg: number } | null, bagUnit?: { ingredientId: string, units: number } | null, unitIngredientIds?: string[] }`
  - `LaunchPlan = { totals: { wetKg, dryKg, asReceivedKg, intrinsicWaterKg, waterToAddKg }, items: { ingredientId, name, unidad:'kg', dryKg, asReceivedKg, intrinsicWaterKg, cost }[], spawnItem: { ingredientId, unidad:'kg', asReceivedKg } | null, unitItems: { ingredientId, unidad:'ud', units }[], allocations: { ingredientId, lotId, quantity, unidad }[], shortfalls: { ingredientId, needed, available, missing, unidad }[] }`
  - `unidadDe(lot, unitIngredientIds) → 'kg' | 'ud'`
  - `cantidadDisponible(lot) → number`
- `Lot = { id, ingredienteId, cantidadKgDisponible, activo, fechaIngreso?, fechaCompra?, unidad? }`

- [ ] **Step 1: Write the failing test**

```js
// launch-plan.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const LP = require('./launch-plan.js');

const INGS = [
  { id: 'paja_trigo', name: 'Paja de trigo', moisture: 12, cost: 2500 },
  { id: 'salvado_trigo', name: 'Salvado de trigo', moisture: 12, cost: 5000 },
  { id: 'carbonato_calcio', name: 'Carbonato de calcio', moisture: 0, cost: 3000 },
  { id: 'borra_cafe', name: 'Borra de café', moisture: 68, cost: 1200 },
];
const lot = (id, ingredienteId, qty, fecha, extra = {}) => ({ id, ingredienteId, cantidadKgDisponible: qty, activo: true, fechaIngreso: fecha, ...extra });

test('ingrediente pequeño se planifica en kg reales, nunca como gramos leídos como kg (D2)', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 98 }, { id: 'carbonato_calcio', p: 2 }],
    bags: 2, kgPerBag: 1.5, moistureTarget: 65, ingredients: INGS, inventoryLots: [],
  });
  const cal = plan.items.find(i => i.ingredientId === 'carbonato_calcio');
  // seco total = 3 × 0.35 = 1.05 kg; cal 2% = 0.021 kg con humedad 0
  assert.equal(cal.asReceivedKg, 0.021);
  assert.equal(plan.totals.dryKg, 1.05);
});

test('kg tal cual se recibe = seco / (1 − humedad del insumo)', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'borra_cafe', p: 100 }], bags: 1, kgPerBag: 1, moistureTarget: 60, ingredients: INGS, inventoryLots: [],
  });
  assert.equal(plan.items[0].dryKg, 0.4);
  assert.equal(plan.items[0].asReceivedKg, 1.25);   // 0.4 / 0.32
  assert.equal(plan.items[0].intrinsicWaterKg, 0.85);
  assert.equal(plan.totals.waterToAddKg, 0);         // agua total 0.6 < agua intrínseca 0.85
});

test('el plan existe aunque no haya lotes: lista completa y faltantes explícitos (D1)', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], bags: 10, kgPerBag: 1.5, moistureTarget: 65,
    ingredients: INGS, inventoryLots: [],
  });
  assert.equal(plan.items.length, 2);
  assert.equal(plan.shortfalls.length, 2);
  assert.equal(plan.allocations.length, 0);
  assert.ok(plan.shortfalls.every(s => s.available === 0 && s.missing === s.needed));
});

test('FIFO por fechaIngreso con respaldo a fechaCompra', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 2, kgPerBag: 2.5, moistureTarget: 60, ingredients: INGS,
    inventoryLots: [
      lot('nuevo', 'paja_trigo', 10, '2026-08-01'),
      { id: 'viejo', ingredienteId: 'paja_trigo', cantidadKgDisponible: 1, activo: true, fechaCompra: '2026-06-01' },
      lot('inactivo', 'paja_trigo', 50, '2026-01-01', { activo: false }),
    ],
  });
  // seco 2 kg → 2 / 0.88 = 2.273 kg tal cual
  assert.deepEqual(plan.allocations.map(a => [a.lotId, a.quantity]), [['viejo', 1], ['nuevo', 1.273]]);
  assert.equal(plan.shortfalls.length, 0);
});

test('bolsas se asignan en unidades contra lotes en unidades (D4)', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 6, kgPerBag: 1.5, moistureTarget: 65, ingredients: INGS,
    inventoryLots: [lot('b1', 'bolsa_unicorn_microfiltro', 4, '2026-08-01'), lot('b2', 'bolsa_unicorn_microfiltro', 100, '2026-08-02'), lot('p', 'paja_trigo', 100, '2026-08-01')],
    bagUnit: { ingredientId: 'bolsa_unicorn_microfiltro', units: 6 },
    unitIngredientIds: ['bolsa_unicorn_microfiltro'],
  });
  assert.deepEqual(plan.unitItems, [{ ingredientId: 'bolsa_unicorn_microfiltro', unidad: 'ud', units: 6 }]);
  const bagAlloc = plan.allocations.filter(a => a.unidad === 'ud');
  assert.deepEqual(bagAlloc.map(a => [a.lotId, a.quantity]), [['b1', 4], ['b2', 2]]);
});

test('lote marcado en kg nunca se usa para un ítem en unidades', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 1, kgPerBag: 1, moistureTarget: 65, ingredients: INGS,
    inventoryLots: [lot('b', 'bolsa_pp_plana', 20, '2026-08-01', { unidad: 'kg' }), lot('p', 'paja_trigo', 5, '2026-08-01')],
    bagUnit: { ingredientId: 'bolsa_pp_plana', units: 1 }, unitIngredientIds: ['bolsa_pp_plana'],
  });
  assert.equal(plan.shortfalls.find(s => s.ingredientId === 'bolsa_pp_plana').missing, 1);
});

test('spawn es un ítem másico aparte con su propia asignación', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 1, kgPerBag: 2, moistureTarget: 65, ingredients: INGS,
    inventoryLots: [lot('s', 'spawn_grano', 1, '2026-08-01'), lot('p', 'paja_trigo', 5, '2026-08-01')],
    spawn: { ingredientId: 'spawn_grano', kg: 0.16 },
  });
  assert.deepEqual(plan.spawnItem, { ingredientId: 'spawn_grano', unidad: 'kg', asReceivedKg: 0.16 });
  assert.ok(plan.allocations.some(a => a.lotId === 's' && a.quantity === 0.16));
});

test('humedad medida por insumo y redondeo de báscula se respetan', () => {
  const plan = LP.buildLaunchPlan({
    recipe: [{ id: 'paja_trigo', p: 100 }], bags: 1, kgPerBag: 1, moistureTarget: 65, ingredients: INGS, inventoryLots: [],
    moistureOverrides: { paja_trigo: 20 }, scaleG: 5,
  });
  // seco 0.35 / 0.80 = 0.4375 kg → báscula de 5 g → 0.44 kg
  assert.equal(plan.items[0].asReceivedKg, 0.44);
});

test('entradas inválidas fallan con mensaje claro', () => {
  assert.throws(() => LP.buildLaunchPlan({ recipe: [{ id: 'x', p: 100 }], bags: 1, kgPerBag: 1, moistureTarget: 65, ingredients: INGS }), /Ingrediente desconocido: x/);
  assert.throws(() => LP.buildLaunchPlan({ recipe: [], bags: 0, kgPerBag: 1, moistureTarget: 65, ingredients: INGS }), /bags/);
  assert.throws(() => LP.buildLaunchPlan({ recipe: [], bags: 1, kgPerBag: 1, moistureTarget: 100, ingredients: INGS }), /moistureTarget/);
});

test('unidadDe: explícita gana; si falta, ids de contenedores son ud', () => {
  assert.equal(LP.unidadDe({ ingredienteId: 'bolsa_pp_plana' }, ['bolsa_pp_plana']), 'ud');
  assert.equal(LP.unidadDe({ ingredienteId: 'bolsa_pp_plana', unidad: 'kg' }, ['bolsa_pp_plana']), 'kg');
  assert.equal(LP.unidadDe({ ingredienteId: 'paja_trigo' }, []), 'kg');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test launch-plan.test.js`
Expected: FAIL with `Cannot find module './launch-plan.js'`.

- [ ] **Step 3: Write the implementation**

```js
// launch-plan.js
'use strict';

// Plan de lanzamiento de lote: cantidades por insumo (base seca → kg tal cual se
// recibe, porque así se registra la bodega), ítems en unidades, asignación FIFO
// y faltantes. Puro: no toca inventario ni almacenamiento.
(function initLaunchPlan() {
const EPS = 1e-6;
const round3 = x => Math.round(x * 1000) / 1000;
const clampMoisture = pct => Math.min(0.92, Math.max(0, (Number(pct) || 0) / 100));
const lotTime = l => new Date(l.fechaIngreso || l.fechaCompra || 0).getTime() || 0;

const unidadDe = (lot, unitIngredientIds = []) =>
  lot.unidad || (unitIngredientIds.includes(lot.ingredienteId) ? 'ud' : 'kg');
const cantidadDisponible = lot => Number(lot.cantidadKgDisponible) || 0;

function allocate(inventoryLots, ingredientId, needed, unidad, unitIngredientIds) {
  const lots = inventoryLots
    .filter(l => l.activo && l.ingredienteId === ingredientId && cantidadDisponible(l) > EPS && unidadDe(l, unitIngredientIds) === unidad)
    .sort((a, b) => lotTime(a) - lotTime(b));
  const allocations = [];
  let remaining = needed;
  for (const l of lots) {
    if (remaining <= EPS) break;
    const take = Math.min(cantidadDisponible(l), remaining);
    allocations.push({ ingredientId, lotId: l.id, quantity: unidad === 'ud' ? take : round3(take), unidad });
    remaining -= take;
  }
  const missing = remaining > EPS ? (unidad === 'ud' ? remaining : round3(remaining)) : 0;
  return { allocations, missing };
}

function buildLaunchPlan({
  recipe = [], bags, kgPerBag, moistureTarget, ingredients = [], inventoryLots = [],
  moistureOverrides = {}, scaleG = 0, spawn = null, bagUnit = null, unitIngredientIds = [],
} = {}) {
  if (!(Number(bags) > 0) || !(Number(kgPerBag) > 0)) throw new Error('bags y kgPerBag deben ser > 0');
  if (!(Number(moistureTarget) > 0 && Number(moistureTarget) < 100)) throw new Error('moistureTarget fuera de rango (0–100)');
  const byId = new Map(ingredients.map(i => [i.id, i]));
  const unitIds = [...new Set([...(unitIngredientIds || []), ...(bagUnit ? [bagUnit.ingredientId] : [])])];

  const wetKg = bags * kgPerBag;
  const dryKg = wetKg * (1 - moistureTarget / 100);
  const items = [];
  let intrinsic = 0;
  for (const row of recipe) {
    const g = byId.get(row.id);
    if (!g) throw new Error(`Ingrediente desconocido: ${row.id}`);
    const pct = parseFloat(row.p ?? row.pct) || 0;
    if (pct <= 0) continue;
    const m = clampMoisture(moistureOverrides[row.id] ?? g.moisture);
    const itemDry = dryKg * pct / 100;
    let asReceived = itemDry / (1 - m);
    if (scaleG > 0) asReceived = Math.round((asReceived * 1000) / scaleG) * scaleG / 1000;
    const water = asReceived * m;
    intrinsic += water;
    items.push({
      ingredientId: g.id, name: g.name, unidad: 'kg',
      dryKg: round3(itemDry), asReceivedKg: round3(asReceived), intrinsicWaterKg: round3(water),
      cost: Math.round(asReceived * (Number(g.cost) || 0)),
    });
  }

  const spawnItem = spawn && spawn.kg > 0 ? { ingredientId: spawn.ingredientId, unidad: 'kg', asReceivedKg: round3(spawn.kg) } : null;
  const unitItems = bagUnit && bagUnit.units > 0 ? [{ ingredientId: bagUnit.ingredientId, unidad: 'ud', units: bagUnit.units }] : [];

  const allocations = [];
  const shortfalls = [];
  const need = [
    ...items.map(i => [i.ingredientId, i.asReceivedKg, 'kg']),
    ...(spawnItem ? [[spawnItem.ingredientId, spawnItem.asReceivedKg, 'kg']] : []),
    ...unitItems.map(u => [u.ingredientId, u.units, 'ud']),
  ];
  for (const [ingredientId, needed, unidad] of need) {
    const r = allocate(inventoryLots, ingredientId, needed, unidad, unitIds);
    allocations.push(...r.allocations);
    if (r.missing > 0) {
      const available = unidad === 'ud' ? needed - r.missing : round3(needed - r.missing);
      shortfalls.push({ ingredientId, needed, available, missing: r.missing, unidad });
    }
  }

  const totalWater = wetKg - dryKg;
  return {
    totals: {
      wetKg: round3(wetKg), dryKg: round3(dryKg),
      asReceivedKg: round3(items.reduce((s, i) => s + i.asReceivedKg, 0)),
      intrinsicWaterKg: round3(intrinsic),
      waterToAddKg: round3(Math.max(0, totalWater - intrinsic)),
    },
    items, spawnItem, unitItems, allocations, shortfalls,
  };
}

const api = { buildLaunchPlan, unidadDe, cantidadDisponible };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasLaunchPlan = api;
}
})();
```

- [ ] **Step 4: Register the module** as in Task 1 Step 4, right after `recipe-version.js`, in all three places.

- [ ] **Step 5: Run the tests**

Run: `node --test launch-plan.test.js firebase/auth-gate.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add launch-plan.js launch-plan.test.js firebase/auth-gate.js firebase/auth-gate.test.js __harness.html
git commit -m "feat(setas-os): pure launch plan with as-received kg, units and FIFO (D1, D2, D4)"
```

---

### Task 6: `inventory-consumption.js`, the append-only server record, and Firestore rules (D3, D19)

**Files:**
- Create: `inventory-consumption.js`
- Create: `inventory-consumption.test.js`
- Modify: `firebase/db.js` (add `guardarConsumoInventario`, delete `descontarInventarioFIFO`, update `window.SetasDB`)
- Modify: `firebase/firestore.rules` (add `inventory_consumptions`)
- Modify: `test/firestore.rules.test.js` (new `describe` block)
- Modify: `firebase/auth-gate.js`, `firebase/auth-gate.test.js`, `__harness.html` (after `launch-plan.js`)

**Interfaces:**
- Consumes: `LaunchPlan.allocations` / `.shortfalls` (Task 5).
- Produces `globalThis.SetasInventoryConsumption`:
  - `QUEUE_KEY = 'sdp_inventory_ops'`, `BANNER_AFTER_FAILURES = 3`
  - `buildConsumptionOp({ loteId, codigo, plan, createdAt }) → Op`
  - `enqueue(queue, op) → { queue, added: boolean }`
  - `applyLocal(lotes, op, { fecha, nota }) → { lotes, movimientos }`
  - `toRecord(op) → { schema, opId, loteId, codigo, allocations, shortfalls, createdAt }`
  - `syncDue({ queue, persist: (record) => Promise, now }) → Promise<queue>`
  - `isPendingForLote(queue, loteId) → boolean`
  - `failuresForBanner(queue) → Op[]`
  - `backoffMs(attempts) → number`
- `Op = { schema:'setas.inventory-consumption.v1', opId, loteId, codigo, allocations, shortfalls, createdAt, status:'pending'|'synced'|'failed', attempts, lastError, nextAttemptAt, syncedAt? }`
- `SetasDB.guardarConsumoInventario(record) → Promise<{ created: boolean }>`

- [ ] **Step 1: Write the failing test**

```js
// inventory-consumption.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const IC = require('./inventory-consumption.js');

const plan = {
  allocations: [
    { ingredientId: 'paja_trigo', lotId: 'L1', quantity: 1, unidad: 'kg' },
    { ingredientId: 'paja_trigo', lotId: 'L2', quantity: 0.5, unidad: 'kg' },
    { ingredientId: 'bolsa_pp_plana', lotId: 'B1', quantity: 2, unidad: 'ud' },
  ],
  shortfalls: [{ ingredientId: 'salvado_trigo', needed: 1, available: 0, missing: 1, unidad: 'kg' }],
};
const lotes = [
  { id: 'L1', ingredienteId: 'paja_trigo', cantidadKgDisponible: 1, activo: true },
  { id: 'L2', ingredienteId: 'paja_trigo', cantidadKgDisponible: 3, activo: true },
  { id: 'B1', ingredienteId: 'bolsa_pp_plana', cantidadKgDisponible: 20, activo: true },
  { id: 'X', ingredienteId: 'otro', cantidadKgDisponible: 9, activo: true },
];

test('buildConsumptionOp usa el loteId como identidad determinista', () => {
  const op = IC.buildConsumptionOp({ loteId: 'BIT_1', codigo: 'SDP-1', plan, createdAt: 1000 });
  assert.equal(op.opId, 'BIT_1');
  assert.equal(op.status, 'pending');
  assert.equal(op.attempts, 0);
  assert.equal(op.nextAttemptAt, 1000);
  assert.notEqual(op.allocations, plan.allocations);
  assert.throws(() => IC.buildConsumptionOp({ plan, createdAt: 1 }), /loteId/);
});

test('applyLocal descuenta por lote, desactiva agotados y no muta la entrada', () => {
  const op = IC.buildConsumptionOp({ loteId: 'BIT_1', codigo: 'SDP-1', plan, createdAt: 1000 });
  const { lotes: out, movimientos } = IC.applyLocal(lotes, op, { fecha: '2026-09-13', nota: 'Lote SDP-1' });
  assert.equal(out.find(l => l.id === 'L1').cantidadKgDisponible, 0);
  assert.equal(out.find(l => l.id === 'L1').activo, false);
  assert.equal(out.find(l => l.id === 'L2').cantidadKgDisponible, 2.5);
  assert.equal(out.find(l => l.id === 'B1').cantidadKgDisponible, 18);
  assert.equal(out.find(l => l.id === 'X'), lotes[3]);
  assert.equal(lotes[0].cantidadKgDisponible, 1);
  assert.deepEqual(movimientos.map(m => [m.id, m.loteInventarioId, m.kgMovidos, m.unidad]), [
    ['mov_lote_BIT_1_0', 'L1', 1, 'kg'], ['mov_lote_BIT_1_1', 'L2', 0.5, 'kg'], ['mov_lote_BIT_1_2', 'B1', 2, 'ud']]);
  assert.ok(movimientos.every(m => m.tipo === 'consumo_lote' && m.loteNum === 'SDP-1'));
});

test('enqueue es idempotente por opId', () => {
  const op = IC.buildConsumptionOp({ loteId: 'BIT_1', plan, createdAt: 1 });
  const a = IC.enqueue([], op);
  assert.equal(a.added, true);
  const b = IC.enqueue(a.queue, { ...op });
  assert.equal(b.added, false);
  assert.equal(b.queue.length, 1);
});

test('toRecord deja fuera el estado local de la cola', () => {
  const op = IC.buildConsumptionOp({ loteId: 'BIT_1', codigo: 'C', plan, createdAt: 5 });
  assert.deepEqual(Object.keys(IC.toRecord(op)).sort(), ['allocations', 'codigo', 'createdAt', 'loteId', 'opId', 'schema', 'shortfalls']);
});

test('syncDue marca synced al persistir y failed con backoff al fallar', async () => {
  const ok = IC.buildConsumptionOp({ loteId: 'OK', plan, createdAt: 0 });
  const bad = IC.buildConsumptionOp({ loteId: 'BAD', plan, createdAt: 0 });
  const seen = [];
  const queue = await IC.syncDue({
    queue: [ok, bad], now: 10_000,
    persist: async rec => { seen.push(rec.opId); if (rec.opId === 'BAD') throw new Error('offline'); },
  });
  assert.deepEqual(seen, ['OK', 'BAD']);
  assert.equal(queue.find(o => o.opId === 'OK').status, 'synced');
  const b = queue.find(o => o.opId === 'BAD');
  assert.equal(b.status, 'failed');
  assert.equal(b.attempts, 1);
  assert.equal(b.lastError, 'offline');
  assert.equal(b.nextAttemptAt, 10_000 + IC.backoffMs(1));
});

test('syncDue no reintenta antes de nextAttemptAt ni reenvía synced', async () => {
  const q0 = [
    { ...IC.buildConsumptionOp({ loteId: 'WAIT', plan, createdAt: 0 }), status: 'failed', attempts: 1, nextAttemptAt: 50_000 },
    { ...IC.buildConsumptionOp({ loteId: 'DONE', plan, createdAt: 0 }), status: 'synced' },
  ];
  let calls = 0;
  await IC.syncDue({ queue: q0, now: 10_000, persist: async () => { calls++; } });
  assert.equal(calls, 0);
});

test('backoff exponencial con tope de 1 h', () => {
  assert.equal(IC.backoffMs(1), 30_000);
  assert.equal(IC.backoffMs(2), 60_000);
  assert.equal(IC.backoffMs(20), 3_600_000);
});

test('isPendingForLote y failuresForBanner', () => {
  const q = [
    { ...IC.buildConsumptionOp({ loteId: 'A', plan, createdAt: 0 }) },
    { ...IC.buildConsumptionOp({ loteId: 'B', plan, createdAt: 0 }), status: 'failed', attempts: 3 },
    { ...IC.buildConsumptionOp({ loteId: 'C', plan, createdAt: 0 }), status: 'synced' },
  ];
  assert.equal(IC.isPendingForLote(q, 'A'), true);
  assert.equal(IC.isPendingForLote(q, 'C'), false);
  assert.deepEqual(IC.failuresForBanner(q).map(o => o.opId), ['B']);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test inventory-consumption.test.js`
Expected: FAIL with `Cannot find module './inventory-consumption.js'`.

- [ ] **Step 3: Write the implementation**

```js
// inventory-consumption.js
'use strict';

// Consumo de inventario por lote: una operación idempotente (identidad = loteId).
// La bodega de registro es localStorage sdp_lotes (no existe espejo en Firestore);
// el servidor guarda un registro append-only en inventory_consumptions/{loteId}.
(function initInventoryConsumption() {
const QUEUE_KEY = 'sdp_inventory_ops';
const SCHEMA = 'setas.inventory-consumption.v1';
const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 3_600_000;
const BANNER_AFTER_FAILURES = 3;
const round3 = x => Math.round(x * 1000) / 1000;

function buildConsumptionOp({ loteId, codigo = null, plan, createdAt }) {
  if (!loteId) throw new Error('loteId requerido para la operación de consumo');
  return {
    schema: SCHEMA, opId: loteId, loteId, codigo,
    allocations: (plan.allocations || []).map(a => ({ ...a })),
    shortfalls: (plan.shortfalls || []).map(s => ({ ...s })),
    createdAt, status: 'pending', attempts: 0, lastError: null, nextAttemptAt: createdAt,
  };
}

function enqueue(queue = [], op) {
  if (queue.some(o => o.opId === op.opId)) return { queue, added: false };
  return { queue: [...queue, op], added: true };
}

function applyLocal(lotes = [], op, { fecha = null, nota = '' } = {}) {
  const take = new Map();
  for (const a of op.allocations) take.set(a.lotId, (take.get(a.lotId) || 0) + a.quantity);
  const updated = lotes.map(l => {
    const t = take.get(l.id);
    if (!t) return l;
    const restante = Math.max(0, round3((Number(l.cantidadKgDisponible) || 0) - t));
    return { ...l, cantidadKgDisponible: restante, activo: restante > 0.0001 };
  });
  const movimientos = op.allocations.map((a, i) => ({
    id: `mov_lote_${op.opId}_${i}`, tipo: 'consumo_lote',
    ingredienteId: a.ingredientId, loteInventarioId: a.lotId, kgMovidos: a.quantity, unidad: a.unidad,
    loteNum: op.codigo, fecha, nota, timestamp: op.createdAt,
  }));
  return { lotes: updated, movimientos };
}

const toRecord = op => ({
  schema: op.schema, opId: op.opId, loteId: op.loteId, codigo: op.codigo,
  allocations: op.allocations, shortfalls: op.shortfalls, createdAt: op.createdAt,
});

const backoffMs = attempts => Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1));

async function syncDue({ queue = [], persist, now }) {
  let q = queue;
  for (const op of queue) {
    if (op.status === 'synced' || (op.nextAttemptAt || 0) > now) continue;
    try {
      await persist(toRecord(op));
      q = q.map(o => (o.opId === op.opId ? { ...o, status: 'synced', syncedAt: now, lastError: null } : o));
    } catch (err) {
      const attempts = (op.attempts || 0) + 1;
      q = q.map(o => (o.opId === op.opId
        ? { ...o, status: 'failed', attempts, lastError: String(err?.message || err), nextAttemptAt: now + backoffMs(attempts) }
        : o));
    }
  }
  return q;
}

const isPendingForLote = (queue = [], loteId) => queue.some(o => o.loteId === loteId && o.status !== 'synced');
const failuresForBanner = (queue = []) => queue.filter(o => o.status === 'failed' && o.attempts >= BANNER_AFTER_FAILURES);

const api = { QUEUE_KEY, SCHEMA, BANNER_AFTER_FAILURES, buildConsumptionOp, enqueue, applyLocal, toRecord, syncDue, backoffMs, isPendingForLote, failuresForBanner };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasInventoryConsumption = api;
}
})();
```

- [ ] **Step 4: Run the unit test**

Run: `node --test inventory-consumption.test.js`
Expected: PASS.

- [ ] **Step 5: Firestore layer and rules**
  - In `firebase/db.js`, delete the whole `export async function descontarInventarioFIFO(…) { … }` and remove `descontarInventarioFIFO` from the `window.SetasDB = { … }` object. Add, and include `guardarConsumoInventario` in `window.SetasDB`:

```js
// Registro append-only del consumo de un lote. La identidad es el loteId: reintentar
// nunca duplica (ADR-0005). No descuenta lotes en servidor — no existe espejo de bodega.
export async function guardarConsumoInventario(record) {
  if (!record?.opId || !Array.isArray(record.allocations)) throw new Error("Registro de consumo inválido.");
  const ref = doc(db, "inventory_consumptions", record.opId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return { created: false };
    tx.set(ref, { ...record, syncedAt: serverTimestamp() });
    return { created: true };
  });
}
```

  - In `firebase/firestore.rules`, add inside `match /databases/{database}/documents { … }`, next to `match /recetas/{id}`:

```
    // Consumo de inventario por lote: registro append-only; la identidad es el loteId.
    match /inventory_consumptions/{opId} {
      allow read: if signedIn();
      allow create: if signedIn()
        && request.resource.data.opId == opId
        && request.resource.data.allocations is list;
      allow update, delete: if false;
    }
```

  - Append to `test/firestore.rules.test.js`, reusing the file's existing `initializeTestEnvironment` setup pattern and `PROJECT_ID`/`RULES_PATH` constants. Copy its `before`/`after`/`beforeEach` shape from the `public_lotes` block:

```js
describe('firestore.rules · inventory_consumptions', function () {
  this.timeout(20000);
  let testEnv;
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { rules: fs.readFileSync(RULES_PATH, 'utf8'), host: '127.0.0.1', port: 8080 },
    });
  });
  after(async () => { await testEnv.cleanup(); });
  beforeEach(async () => { await testEnv.clearFirestore(); });

  const rec = { schema: 'setas.inventory-consumption.v1', opId: 'BIT_1', loteId: 'BIT_1', codigo: 'C', allocations: [], shortfalls: [], createdAt: 1 };

  it('un usuario autenticado crea el registro con opId == id del documento', async () => {
    const db = testEnv.authenticatedContext('u1').firestore();
    await assertSucceeds(setDoc(doc(db, 'inventory_consumptions/BIT_1'), rec));
  });
  it('rechaza opId distinto al id del documento', async () => {
    const db = testEnv.authenticatedContext('u1').firestore();
    await assertFails(setDoc(doc(db, 'inventory_consumptions/OTRO'), rec));
  });
  it('rechaza sin autenticación', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, 'inventory_consumptions/BIT_1'), rec));
  });
  it('no permite actualizar ni borrar un registro existente', async () => {
    await testEnv.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'inventory_consumptions/BIT_1'), rec); });
    const db = testEnv.authenticatedContext('u1').firestore();
    await assertFails(setDoc(doc(db, 'inventory_consumptions/BIT_1'), { ...rec, codigo: 'X' }));
    await assertFails(deleteDoc(doc(db, 'inventory_consumptions/BIT_1')));
  });
});
```

  If the existing `public_lotes` block uses a different emulator host/port or env var, use the same values it uses.

  - Register `inventory-consumption.js` as in Task 1 Step 4, right after `launch-plan.js`.

- [ ] **Step 6: Run the tests**

Run: `node --test inventory-consumption.test.js firebase/auth-gate.test.js` (expected: PASS). Then run `npm run test:rules` (expected: all rules tests PASS, including the 4 new ones).

If the Firebase emulator is not installed or cannot start in this environment, record in the task report: "rules tests not executed: <exact error>". CI workflow `.github/workflows/firestore-rules.yml` runs them on the PR.

- [ ] **Step 7: Commit**

```bash
git add inventory-consumption.js inventory-consumption.test.js firebase/db.js firebase/firestore.rules test/firestore.rules.test.js firebase/auth-gate.js firebase/auth-gate.test.js __harness.html
git commit -m "feat(setas-os): idempotent inventory consumption op with append-only record (D3, D19)"
```

---

### Task 7: Rebuild "Lanzar Lote" on the launch plan and consumption op (D1, D2, D3)

**Files:**
- Modify: `simulador-app.jsx` (`openProdLauncher`, `ejecutarLanzamientoProduccion`, launcher modal)
- Regenerate: `simulador-app.js`, `sw.js`
- Create: `launch-lote-records.test.js`
- Modify: `launch-plan.js` + `launch-plan.test.js` (add `buildLoteRecords`)

**Interfaces:**
- Consumes: `SetasLaunchPlan.buildLaunchPlan` (Task 5); `SetasInventoryConsumption.*` (Task 6); `SetasDB.guardarConsumoInventario` (Task 6); `an.moistureTarget` (Task 4).
- Produces:
  - `SetasLaunchPlan.buildLoteRecords({ form, plan, analysis, treatmentName, recipe, sKey, recipeName, score, now }) → { lote, bolsas }`. The lote includes the existing field set plus `ingredientLots: plan.allocations`.
  - Component helpers `persistConsumption(op)` and `runInventorySync()`, used again in Task 8.

- [ ] **Step 1: Move lote/bolsa construction into a pure function (test first)**
  - Open `ejecutarLanzamientoProduccion` (anchor: `const ejecutarLanzamientoProduccion`) and locate the object literals built as `const lote = { id: 'BIT_' + ts, …}` and the `bolsas` array (`id:'BOLSA_'+ts+'_'+i`).
  - Write this test, and copy the **exact current expressions** for `codigo` of each bag and `peseSeco` from that code into the implementation in Step 3:

```js
// launch-lote-records.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const LP = require('./launch-plan.js');

const form = { codigo: 'SDP-260913-ERY-R01', especie: 'Seta de Cardo', especieCientifico: 'Pleurotus eryngii', cepa: '', fechaMezcla: '2026-09-13', fechaInoculacion: '2026-09-13', numBolsas: 3, pesoHumedo: 1.5, humedad: 65, sala: 'martha_01', operador: 'Op', notas: '' };
const plan = { allocations: [{ ingredientId: 'paja_trigo', lotId: 'L1', quantity: 1.2, unidad: 'kg' }], shortfalls: [] };

test('buildLoteRecords produce el lote de Bitácora con trazabilidad de lotes de insumo', () => {
  const { lote, bolsas } = LP.buildLoteRecords({
    form, plan, analysis: { cn: 30.04, eb: 81.6, cost: 5123.4, dynSpawn: 6 }, treatmentName: 'Esterilización en Autoclave',
    recipe: [{ id: 'paja_trigo', p: 100 }], sKey: 'p_eryngii', recipeName: 'Prueba', score: 77, now: 1_700_000_000_000,
  });
  assert.equal(lote.id, 'BIT_1700000000000');
  assert.equal(lote.codigo, form.codigo);
  assert.equal(lote.numBolsas, 3);
  assert.equal(lote.peseSeco, 1.575);          // 3 × 1.5 × (1 − 0.65)
  assert.equal(lote.tratamiento, 'Esterilización en Autoclave');
  assert.equal(lote.estado, 'incubacion');
  assert.equal(lote.veredicto, '');
  assert.deepEqual(lote.ingredientLots, plan.allocations);
  assert.notEqual(lote.ingredientLots, plan.allocations);
  assert.equal(lote.recipeRef.sKey, 'p_eryngii');
  assert.equal(bolsas.length, 3);
  assert.ok(bolsas.every(b => b.loteId === lote.id && b.estado === 'sana' && b.pesoInicial === 1.5));
  assert.equal(new Set(bolsas.map(b => b.id)).size, 3);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test launch-lote-records.test.js`
Expected: FAIL with `LP.buildLoteRecords is not a function`.

- [ ] **Step 3: Implement `buildLoteRecords` in `launch-plan.js`**
  - Add this function before `const api =`. Replace the two `/* COPY */` expressions with the exact expressions from the current `ejecutarLanzamientoProduccion` (the bag code template and any extra lote fields present there that are not listed below; keep every existing field).
  - Add `buildLoteRecords` to `api`.

```js
function buildLoteRecords({ form, plan, analysis = null, treatmentName = null, recipe = [], sKey, recipeName = '', score = 0, now }) {
  const nb = Number(form.numBolsas) || 0;
  const kb = Number(form.pesoHumedo) || 0;
  const hm = Number(form.humedad) || 0;
  const loteId = 'BIT_' + now;
  const lote = {
    id: loteId,
    codigo: form.codigo,
    especie: form.especie,
    especieCientifico: form.especieCientifico,
    cepa: form.cepa,
    fechaMezcla: form.fechaMezcla,
    fechaInoculacion: form.fechaInoculacion,
    numBolsas: nb,
    pesoHumedo: kb,
    peseSeco: +(nb * kb * (1 - hm / 100)).toFixed(3),
    spawnPct: analysis?.dynSpawn || 8,
    humedad: hm,
    tratamiento: treatmentName || 'Pasteurización Térmica',
    costoIngKg: analysis ? Math.round(analysis.cost) : 0,
    operador: form.operador,
    objetivo: 'Lanzamiento directo desde Formulador',
    notas: form.notas,
    estado: 'incubacion',
    veredicto: '',
    sala: form.sala,
    ubicacion: form.sala,
    ingredientLots: (plan.allocations || []).map(a => ({ ...a })),
    recipeRef: {
      id: now,
      name: recipeName || `Receta ${form.especie} (${form.codigo})`,
      sKey,
      recipe: recipe.map(r => ({ ...r })),
      cn: analysis ? Number(analysis.cn).toFixed(1) : '—',
      eb: analysis ? Number(analysis.eb).toFixed(0) : '—',
      score: score || 0,
      cost: analysis ? Math.round(analysis.cost) : 0,
    },
    createdAt: new Date(now).toISOString(),   /* COPY: use the same createdAt expression as the current code if it differs */
  };
  const bolsas = Array.from({ length: nb }, (_, idx) => {
    const i = idx + 1;
    const nn = String(i).padStart(2, '0');   /* COPY: use the current bag-number expression */
    return {
      id: 'BOLSA_' + now + '_' + i, loteId, codigo: `${form.codigo}-B${nn}`, num: i, estado: 'sana',
      col25: null, col50: null, col100: null, pesoInicial: kb, fechaDescarte: null, motivoDescarte: '', observaciones: '', foto: null,
    };
  });
  return { lote, bolsas };
}
```

  After copying, adjust `launch-lote-records.test.js` **only** where it asserted a value that the copied expression legitimately changes (e.g. `createdAt` format), never the traceability assertions.

- [ ] **Step 4: Rewire `openProdLauncher`** (anchor: `const openProdLauncher`)
  - Add next to the other UMD imports:

```js
const SetasLaunchPlanApi=(typeof SetasLaunchPlan!=='undefined'?SetasLaunchPlan:(typeof require!=='undefined'?require('./launch-plan.js'):null));
const SetasInventoryConsumptionApi=(typeof SetasInventoryConsumption!=='undefined'?SetasInventoryConsumption:(typeof require!=='undefined'?require('./inventory-consumption.js'):null));
const UNIT_INGREDIENT_IDS=BAG_TYPES.map(b=>b.stockId).filter(Boolean);
```

  - Replace the block that builds `insumos` from `(bd?.items || [])`, including the `spawn_grano` push, with a plan computed independently of `showBatch`:

```js
    const nb=numBags||10, kb=kgBag||1.5;
    const humedadLote=an?.moistureTarget??hObj??65;
    const bagType=BAG_TYPES.find(b=>b.id===prodBagType);
    const plan=SetasLaunchPlanApi.buildLaunchPlan({
      recipe, bags:nb, kgPerBag:kb, moistureTarget:humedadLote, ingredients:effectiveINGS, inventoryLots:invLotes,
      spawn: an?.dynSpawn ? { ingredientId:'spawn_grano', kg: nb*kb*(an.dynSpawn/100) } : null,
      bagUnit: bagType?.stockId ? { ingredientId:bagType.stockId, units:nb } : null,
      unitIngredientIds: UNIT_INGREDIENT_IDS,
    });
    const faltante=id=>plan.shortfalls.find(s=>s.ingredientId===id);
    const insumos=[
      ...plan.items.map(i=>({id:i.ingredientId,name:i.name,krKg:i.asReceivedKg,unit:'kg',stockActual:stockActual(i.ingredientId,invLotes),ok:!faltante(i.ingredientId)})),
      ...(plan.spawnItem?[{id:plan.spawnItem.ingredientId,name:'Spawn (grano)',krKg:plan.spawnItem.asReceivedKg,unit:'kg',stockActual:stockActual(plan.spawnItem.ingredientId,invLotes),ok:!faltante(plan.spawnItem.ingredientId)}]:[]),
      ...plan.unitItems.map(u=>({id:u.ingredientId,name:bagType?.name||u.ingredientId,krKg:u.units,unit:'uds',stockActual:stockActual(u.ingredientId,invLotes),ok:!faltante(u.ingredientId)})),
    ];
```

  - Store `plan` in the form state: add `plan,` to the object passed to the form setter, next to `insumos`, and set `humedad: humedadLote`.
  - Remove the now-unused `const krKg = it.asIsKg || (parseFloat(it.unit) || 0);` logic entirely.

- [ ] **Step 5: Rewire `ejecutarLanzamientoProduccion`**

  Add component-level sync helpers once (near `saveMovimientos`):

```js
  const readInvOps=()=>{try{return JSON.parse(localStorage.getItem(SetasInventoryConsumptionApi.QUEUE_KEY)||'[]');}catch(e){return [];}};
  const [invOps,setInvOps]=useState(readInvOps);
  const saveInvOps=q=>{setInvOps(q);try{localStorage.setItem(SetasInventoryConsumptionApi.QUEUE_KEY,JSON.stringify(q));}catch(e){}};
  const runInventorySync=useCallback(async()=>{
    if(!window.SetasDB?.guardarConsumoInventario) return;
    const next=await SetasInventoryConsumptionApi.syncDue({queue:readInvOps(),now:Date.now(),persist:rec=>window.SetasDB.guardarConsumoInventario(rec)});
    saveInvOps(next);
  },[]);
  const registrarConsumo=({loteId,codigo,plan,fecha,nota})=>{
    const op=SetasInventoryConsumptionApi.buildConsumptionOp({loteId,codigo,plan,createdAt:Date.now()});
    const {queue,added}=SetasInventoryConsumptionApi.enqueue(readInvOps(),op);
    if(!added) return false;   // this lote was already discounted: never apply twice
    const r=SetasInventoryConsumptionApi.applyLocal(invLotes,op,{fecha,nota});
    setInvLotes(r.lotes);
    try{localStorage.setItem('sdp_lotes',JSON.stringify(r.lotes));}catch(e){}
    saveMovimientos([...invMovimientos,...r.movimientos]);
    saveInvOps(queue);
    runInventorySync();
    return true;
  };
```

If the component already has a helper that writes `sdp_lotes` together with `setInvLotes` (search for `localStorage.setItem('sdp_lotes'`), use that helper instead of the two inline lines.

Inside `ejecutarLanzamientoProduccion`:
  - delete the block that runs `consumirInventarioFIFOLocal`, writes `sdp_lotes`, builds `newMovs`, and the async loop calling `window.SetasDB.descontarInventarioFIFO`;
  - replace the `const lote = {…}` and bolsas construction with:

```js
    const now=Date.now();
    const {lote,bolsas}=SetasLaunchPlanApi.buildLoteRecords({form:f,plan:f.plan,analysis:an,treatmentName:tr?.name,recipe,sKey,recipeName:saveName,score:opt?opt.score:0,now});
    registrarConsumo({loteId:lote.id,codigo:lote.codigo,plan:f.plan,fecha:f.fechaInoculacion,nota:`Lote ${lote.codigo} (${lote.numBolsas} bolsas × ${lote.pesoHumedo} kg) · ${f.fechaInoculacion}`});
```

  Keep everything after the lote construction unchanged: `setBitLotes`, `setBitBolsas`, `guardarLote`, `guardarBolsas`, public trace, QR and navigation.

  Add retry triggers once in the component:

```js
  useEffect(()=>{runInventorySync();const on=()=>runInventorySync();window.addEventListener('online',on);window.addEventListener('setas-db-ready',on);return()=>{window.removeEventListener('online',on);window.removeEventListener('setas-db-ready',on);};},[runInventorySync]);
```

- [ ] **Step 6: Fix the launcher modal** (anchor: `data-testid="prod-launch-modal"`)
  - Change the `AccessibleModal` props from `isOpen`/`title=` to `label="Lanzador de producción de lote"` and keep `onClose`. Render the former title text as an `<h2>` as the first child.
  - Replace `allInsumosOk=f.insumos.every(i=>i.ok)` with `allInsumosOk=f.insumos.length>0&&f.insumos.every(i=>i.ok)`.
  - When `f.plan.shortfalls.length>0`, render above the table: `⚠ Faltan insumos en bodega: {f.plan.shortfalls.map(s=>`${s.ingredientId} (${s.missing} ${s.unidad})`).join(', ')}. Se descontará lo disponible.`
  - Keep the ` Stock suficiente para todo el batch` text only for `allInsumosOk`.

- [ ] **Step 7: Build, test and verify in the browser**

Run: `node build.js && node --test *.test.js`
Expected: PASS. Update regex tests in `production-launch.test.js` only if they pinned the removed FIFO block. The function names `openProdLauncher`/`ejecutarLanzamientoProduccion` and `data-testid="prod-launch-modal"` stay.

Harness check:
- `python3 -m http.server 8765 &` → `__harness.html`.
- In Bodega, seed or confirm `paja_trigo` stock. In the Formulador, pick Orellana Gris, build 98% `paja_trigo` + 2% `carbonato_calcio`, with the Batch "Calcular" toggle **off**, and click "Lanzar Lote".
- Confirm the modal lists both ingredients with kg values below 1 kg for carbonato (e.g. `0.03`), and a bag row in `uds`.
- Launch and confirm:
  - Bodega stock for `paja_trigo` dropped by exactly the listed kg;
  - `localStorage.sdp_inventory_ops` has one op with `opId` equal to the new lote id;
  - the new Bitácora lote has `ingredientLots`.
- Screenshot the modal and read it. Then `kill %1`.

- [ ] **Step 8: Commit**

```bash
git add launch-plan.js launch-plan.test.js launch-lote-records.test.js simulador-app.jsx simulador-app.js sw.js
git add -u
git commit -m "fix(setas-os): Lanzar Lote discounts the real plan once, with lot traceability (D1–D3)"
```

---

### Task 8: "Ejecutar Lote" on the same plan, creating a Bitácora lote, plus visible sync state (D15, D3)

**Files:**
- Modify: `simulador-app.jsx` (`ejecutarLote`, `confirmarEjecucion`, Bitácora lotes list, Bodega view)
- Regenerate: `simulador-app.js`, `sw.js`
- Create: `e2e/launch-inventory.spec.js`

**Interfaces:**
- Consumes: `buildLaunchPlan`, `buildLoteRecords` (Tasks 5, 7); `registrarConsumo`, `invOps`, `runInventorySync` (Task 7); `SetasInventoryConsumptionApi.isPendingForLote`, `failuresForBanner` (Task 6).
- Produces: none for later SP1 tasks.

- [ ] **Step 1: Rewire `ejecutarLote`** (anchor: `const ejecutarLote=`)
  - Replace the preview construction (mapping `prodRows` to `krKg:x.grR/1000` plus the bag push) with a plan:

```js
    const bagType=BAG_TYPES.find(b=>b.id===prodBagType);
    const moistureOverrides=Object.fromEntries(prodRows.filter(x=>x.m!=null).map(x=>[x.g.id,x.m]));
    const plan=SetasLaunchPlanApi.buildLaunchPlan({
      recipe, bags:parseInt(prodBags)||1, kgPerBag:prodKg||1.5, moistureTarget:prodH||an?.moistureTarget||65,
      ingredients:prodIngs, inventoryLots:invLotes, moistureOverrides, scaleG:(prodScaleG||0.1)*1000>=1?(prodScaleG||0.1)*1000:0,
      bagUnit: bagType?.stockId ? { ingredientId:bagType.stockId, units:parseInt(prodBags)||0 } : null,
      unitIngredientIds: UNIT_INGREDIENT_IDS,
    });
    const faltante=id=>plan.shortfalls.find(s=>s.ingredientId===id);
    const preview=[
      ...plan.items.map(i=>({id:i.ingredientId,name:i.name,krKg:i.asReceivedKg,stockActual:stockActual(i.ingredientId,invLotes),unit:'kg',ok:!faltante(i.ingredientId)})),
      ...plan.unitItems.map(u=>({id:u.ingredientId,name:bagType?.name||u.ingredientId,krKg:u.units,stockActual:stockActual(u.ingredientId,invLotes),unit:'uds',ok:!faltante(u.ingredientId)})),
    ];
    setLoteBatchConfirm({preview,plan,loteNum,fecha});
```

  - Before writing the `scaleG` line, read how `prodScaleG` is defined (anchor: `prodScaleG`). It is the scale resolution. If it is stored in **kg** (e.g. `0.1` = 100 g), use `scaleG:(prodScaleG||0.1)*1000`. If it is stored in **grams**, use `scaleG:prodScaleG||0`. Match the existing `roundG` helper's interpretation, and delete the conditional form above.
  - Confirm that `x.m` in `prodRows` is the operator-measured moisture percentage override; if it is a fraction, multiply it by 100.

- [ ] **Step 2: Rewire `confirmarEjecucion`** (anchor: `const confirmarEjecucion=`)
  - Delete the `consumirInventarioFIFOLocal`, `sdp_lotes`, movements and `descontarInventarioFIFO` loop.
  - Replace them with the shared flow, creating the Bitácora lote (D15) and still calling `crearLoteProduccion`:

```js
    const {preview,plan,loteNum,fecha}=loteBatchConfirm;
    const now=Date.now();
    const form={codigo:loteNum,especie:SPP[sKey]?.name||sKey,especieCientifico:SPP[sKey]?.scientific||'',cepa:'',fechaMezcla:fecha,fechaInoculacion:fecha,numBolsas:parseInt(prodBags)||1,pesoHumedo:prodKg||1.5,humedad:prodH||an?.moistureTarget||65,sala:selectedClimateRoom||'martha_01',operador:'Operario Granja Tenjo',notas:'Hoja de producción'};
    const {lote,bolsas}=SetasLaunchPlanApi.buildLoteRecords({form,plan,analysis:an,treatmentName:tr?.name,recipe,sKey,recipeName:saveName,score:opt?opt.score:0,now});
    registrarConsumo({loteId:lote.id,codigo:lote.codigo,plan,fecha,nota:`Lote ${lote.codigo} (${lote.numBolsas} bolsas × ${lote.pesoHumedo} kg) · ${fecha}`});
    setBitLotes(prev=>{const u=[lote,...prev];try{localStorage.setItem('sdp_bit_lotes',JSON.stringify(u));}catch(e){}return u;});
    setBitBolsas(prev=>{const u=[...bolsas,...prev];try{localStorage.setItem('sdp_bit_bolsas',JSON.stringify(u));}catch(e){}return u;});
    window.SetasBitacoraDB?.guardarLote?.(lote);
    window.SetasBitacoraDB?.guardarBolsas?.(bolsas);
```

  - Keep the existing `crearLoteProduccion` call and its `setLoteSyncErr` handling, and the existing post-confirm UI (closing the confirm dialog, flash). Match the exact `setBitLotes`/`setBitBolsas` write pattern used in `ejecutarLanzamientoProduccion`; if that code writes localStorage through a helper, use the same helper instead of the inline `localStorage.setItem` above.

- [ ] **Step 3: Visible sync state**
  - **Bitácora lotes list.** Where a lote's `codigo` is rendered in the lotes list (anchor: `{lote.codigo}</div>` inside the Bitácora table/cards), append:

```jsx
{SetasInventoryConsumptionApi.isPendingForLote(invOps,lote.id)&&<span className="chip" title="El consumo de bodega de este lote aún no se guardó en el servidor" style={{marginLeft:6}}>Pendiente de sincronizar inventario</span>}
```

  - **Bodega view.** At the top of the Bodega view (anchor: the first `className="inv-section"` rendered when the active tab is Bodega), add:

```jsx
{SetasInventoryConsumptionApi.failuresForBanner(invOps).length>0&&(
  <div role="alert" className="inv-section" style={{borderColor:'var(--status-error)'}}>
    <strong>Consumos de bodega sin guardar en el servidor</strong>
    <ul>{SetasInventoryConsumptionApi.failuresForBanner(invOps).map(o=>(<li key={o.opId}>{o.codigo||o.loteId} · {o.attempts} intentos · {o.lastError}</li>))}</ul>
    <button className="btn" style={{minHeight:44}} onClick={()=>{saveInvOps(readInvOps().map(o=>o.status==='failed'?{...o,nextAttemptAt:0}:o));runInventorySync();}}>Reintentar ahora</button>
  </div>
)}
```

- [ ] **Step 4: Remove dead inventory code**
  - Delete `consumirInventarioFIFOLocal` from `simulador-app.jsx` if `grep -n consumirInventarioFIFOLocal simulador-app.jsx` shows no remaining callers.
  - Leave `inventario.js` and `production-launch.test.js`'s FIFO test untouched; they are an independent module.

- [ ] **Step 5: E2E spec for the real app** (runs where `e2e/.auth` credentials exist; not in CI)

```js
// e2e/launch-inventory.spec.js
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace, seedLocalStorage, selectSpecies, addIngredientByName, setIngredientPct } = require('./helpers');

test('Lanzar Lote descuenta el plan exacto con Calcular apagado y deja trazabilidad', async ({ page }) => {
  await seedLocalStorage(page, {
    sdp_seeded: true,
    sdp_lotes: [
      { id: 'lp1', ingredienteId: 'paja_trigo', cantidadKgTotal: 50, precioPorKgCOP: 1200, fechaIngreso: '2026-06-01', cantidadKgDisponible: 50, activo: true },
      { id: 'lc1', ingredienteId: 'carbonato_calcio', cantidadKgTotal: 5, precioPorKgCOP: 3000, fechaIngreso: '2026-06-01', cantidadKgDisponible: 5, activo: true },
    ],
    sdp_inventory_ops: [],
  });
  await openApp(page);
  await goWorkspace(page, 'formular');
  await selectSpecies(page, 'p_ostreatus_gris');
  await addIngredientByName(page, 'Paja de trigo');
  await addIngredientByName(page, 'Carbonato de calcio');
  await setIngredientPct(page, 'Paja de trigo', 98);
  await setIngredientPct(page, 'Carbonato de calcio', 2);
  await page.getByRole('button', { name: /Lanzar Producción/ }).first().click();
  const modal = page.getByTestId('prod-launch-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Carbonato de calcio');
  await modal.getByRole('button', { name: /Lanzar/ }).last().click();
  const state = await page.evaluate(() => ({
    lotes: JSON.parse(localStorage.getItem('sdp_lotes')),
    ops: JSON.parse(localStorage.getItem('sdp_inventory_ops')),
    bit: JSON.parse(localStorage.getItem('sdp_bit_lotes')),
  }));
  expect(state.ops).toHaveLength(1);
  const op = state.ops[0];
  const paja = op.allocations.find(a => a.lotId === 'lp1');
  const cal = op.allocations.find(a => a.lotId === 'lc1');
  expect(cal.quantity).toBeLessThan(1);
  expect(state.lotes.find(l => l.id === 'lp1').cantidadKgDisponible).toBeCloseTo(50 - paja.quantity, 3);
  expect(state.lotes.find(l => l.id === 'lc1').cantidadKgDisponible).toBeCloseTo(5 - cal.quantity, 3);
  const lote = state.bit.find(l => l.id === op.loteId);
  expect(lote.ingredientLots.map(a => a.lotId).sort()).toEqual(['lc1', 'lp1']);
});
```

If the launch button or the modal's confirm button has different accessible names, use the names from `data-testid="prod-launch-modal"` markup and the button with `openProdLauncher`. Read them; do not guess.

- [ ] **Step 6: Build, test and verify in the browser**

Run: `node build.js && node --test *.test.js`
Expected: PASS.

Harness check, with the same recipe as in Task 7:
- **Ejecutar Lote path.** Open "Hoja de producción" and click "Ejecutar Lote", then confirm. Check that:
  - Bodega stock dropped by the listed kg;
  - a **new Bitácora lote** exists with `ingredientLots`;
  - `sdp_inventory_ops` gained one op.
- **Offline banner.** In the harness `window.SetasDB` is absent, so the op stays `pending` and the Bitácora chip "Pendiente de sincronizar inventario" shows. Then set `localStorage.sdp_inventory_ops` to one op with `status:'failed', attempts:3, lastError:'offline'`, reload, open Bodega, and confirm the banner and the "Reintentar ahora" button (at least 44 px tall).
- Screenshot both, read the words, then `kill %1`.

If Playwright credentials exist (`e2e/.auth/state.json`), run `npx playwright test e2e/launch-inventory.spec.js --project=chromium` and report the result. Otherwise report "e2e not run: no credentials".

- [ ] **Step 7: Commit**

```bash
git add simulador-app.jsx simulador-app.js sw.js e2e/launch-inventory.spec.js
git add -u
git commit -m "fix(setas-os): Ejecutar Lote uses the launch plan, creates the Bitácora lote, shows sync state (D15, D3)"
```

---

### Task 9: Knowledge base corrections (§13) — REQUIRES EXPLICIT USER AUTHORIZATION

> **Gate:** Do not start this task until the user has explicitly authorized editing `knowledge_base/` (per `knowledge_base/AGENTS.md:34`). If authorization is not recorded in the SDD ledger, mark the task `BLOCKED — awaiting KB authorization` and finish SP1 without it.

**Files:**
- Modify: `knowledge_base/01_species/pleurotus_eryngii.md` (Executive Summary line with "C:N 20:1 a 25:1"; the "Nutrición y Relación C:N" section; formulations table EB row)
- Modify: `knowledge_base/01_species/pleurotus_ostreatus.md` (add a "Relación C:N y nitrógeno por clase de sustrato" subsection under "Parámetros de Cultivo")
- Modify: `knowledge_base/CHANGELOG.md`

**Interfaces:** Consumes the Task 1 values (must match `species-targets.js` exactly).

- [ ] **Step 1: Read the KB editing rules**

Read `knowledge_base/AGENTS.md` in full and follow it: preserve YAML frontmatter and cross-references; update `last_reviewed` in the frontmatter to `2026-09-13`.

- [ ] **Step 2: Edit `pleurotus_eryngii.md`**
  - Executive Summary: replace `(C:N 20:1 a 25:1)` with `(C:N de mezcla ≈ 25:1 a 40:1, base seca, bolsa suplementada)`.
  - Replace the "Supported by" list and the paragraph of `## Nutrición y Relación C:N` with:

```markdown
**Consensus**
Supported by:
- Li et al. 2024 (Life, PMC11123215) — bolsas industriales medidas en C:N 25.5 (control) y 28.6 (mejor tratamiento)
- Bellettini et al. 2019 (Saudi J Biol Sci, PMC6486501)

*P. eryngii* se formula con una relación C:N de la mezcla completa de aproximadamente 25:1 a 40:1 (base seca, sin correctores de pH/estructura), con N total de 1.2 %–1.8 % y suplementación de hasta ~55 % en bolsa esterilizada. Estos valores describen la **mezcla suplementada**, no la materia prima base. El valor de 70–90:1 que a veces se cita para *P. ostreatus* corresponde a paja sin suplementar como base, no a un requisito de formulación. La alta carga de nitrógeno exige esterilización en autoclave (121 °C, 1.5–2 h) para evitar *Trichoderma*.
**Strength of evidence:** ★★★☆☆ (literatura primaria para C:N de bolsa; sin validación local todavía)
```

  - In the formulations table, replace the EB row value `85–110%` for Fórmula A with `85–110% (no validado localmente; Li 2024 midió 74–87%)`.

- [ ] **Step 3: Edit `pleurotus_ostreatus.md`**

Under `## Parámetros de Cultivo`, add:

```markdown
### Relación C:N y nitrógeno por clase de sustrato
Base de cálculo: mezcla completa, base seca, sin correctores de pH/estructura.

| Clase de sustrato | C:N de la mezcla | N total | Fuente |
|---|---|---|---|
| Paja sin suplementar (pasteurizada) | 50–100 : 1 | 0.4–1.5 % | Bellettini et al. 2019 |
| Bolsa suplementada | 25–50 : 1 | 0.8–1.5 % | Bellettini et al. 2019 |

Por encima de ~1.5 % de N (base seca) se inhibe el crecimiento micelial (Bellettini et al. 2019).
```

- [ ] **Step 4: Changelog and consistency check**
  - Append to `knowledge_base/CHANGELOG.md`, using its `YYYY-MM-DD | TYPE | Description` format: `2026-09-13 | CORRECTION | P. eryngii C:N de mezcla 25–40 (Li 2024); P. ostreatus C:N/N por clase de sustrato; se aclara que 70–90 es C:N de paja base.`
  - Run `python3 scripts/quality/check_kb_sync.py` from the repo root and include its output in the task report. It is report-only.
  - Run `node --test field-os-simulador/setas-os/species-targets.test.js field-os-simulador/setas-os/species-targets-kb.test.js`. Expected: PASS; the KB values now match the module.

- [ ] **Step 5: Commit**

```bash
git add knowledge_base/01_species/pleurotus_eryngii.md knowledge_base/01_species/pleurotus_ostreatus.md knowledge_base/CHANGELOG.md
git commit -m "docs(kb): correct eryngii/ostreatus C:N targets by substrate class (Li 2024, Bellettini 2019)"
```

---

## Rulings made while writing this plan

Each ruling states what was decided, why, and what it costs if wrong.

1. **Recipe percentages are dry basis; `analyze()` weights C:N/N by `p` (D18), in the JSX and in `recipe-optimizer.js`.**
   - *Why:* the UI declares dry basis ("Porcentaje en base seca", "Cierra la materia seca exactamente al 100%"), and `calcBatch` already treats `p` as a dry share.
   - *If wrong:* C:N/N of wet-ingredient recipes shift. The change is two lines per engine to revert, and the KB formulation test documents the expected values.
2. **localStorage `sdp_lotes` is the inventory of record; the server gets an append-only consumption record, and `descontarInventarioFIFO` is deleted (D19).**
   - *Why:* no code writes `inventario_lotes`, so the server FIFO always failed.
   - *If wrong* (someone seeded Firestore inventory by hand): that server inventory stops being decremented. The consumption records keep every allocation, so it can be replayed.
3. **All SP1 target records use `treatmentClass: 'any'`.**
   - *Why:* the treatment is not confirmed until SP3.
   - *If wrong:* targets don't distinguish pasteurized from sterilized until SP3, which is the same as today.
4. **Legacy target values are derived from the `SPP` literal, not copied, and the literal stays in the JSX.**
   - *Why:* no duplicated numbers, and `perito-regression-report.js` extracts `SPP` from the built file.
   - *If wrong:* none known.
5. ***P. eryngii* `nPct.min` is 1.2, not 1.3 as first drafted.**
   - *Why:* the KB's Formula A computes N 1.28%, and the spec requires validated formulations to pass.
   - *If wrong:* Formula A would be flagged "N bajo"; the fix is a one-value data change.
6. **Spawn is planned and allocated as a separate mass item (`spawn_grano`), as the old "Lanzar Lote" did.**
   - *If wrong:* farms that don't stock spawn in Bodega see a spawn shortfall line. It is informational in SP1.
7. **`ingredientLots` is written on the Bitácora lote already in SP1, ahead of SP2.**
   - *Why:* the plan computes it for free, and the evidence consumers already read that field.
   - *If wrong:* one extra field on new lotes.
8. **The two batch parameter sets (`numBags/kgBag/hObj` vs `prodBags/prodKg/prodH`) are not collapsed in SP1**; both now feed the same `buildLaunchPlan`.
   - *Why:* collapsing them is a UI restructuring that belongs to SP3's `<LaunchDialog>`, which unifies launch inputs.
   - *If wrong:* the two forms can still hold different values, but both launches are now correct for their own inputs.
9. **`firebase/db.js` keeps its intentional `MASS_BALANCE_TOL = 0.5` duplicate.**
   - *Why:* it is an ES module loaded before the UMD modules.
   - *If wrong:* the two could drift. The value is identical today.
10. **`scoring.js` and `perito-scenarios.js` are not edited in SP1.** Perito's own economy/cost basis is revisited in SP3, when those engines are deliberately touched.
    - *If wrong:* Perito scenario cost may still use the as-received price until SP3.
11. **KB edits (Task 9) are gated on explicit user authorization** (`knowledge_base/AGENTS.md:34`).
    - *If wrong:* none; SP1's code does not depend on the KB text.
