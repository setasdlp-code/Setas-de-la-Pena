'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  canonicalRecipeKey,
  generateStructuralSeeds,
  cheapSeedRank,
  searchScenarios,
} = require('./perito-scenarios.js');

const SPP = {
  test: {
    name: 'Test',
    cn_optimal: { min: 25, max: 50, ideal: 35 },
    n_optimal: { min: 0.8, max: 2.0, ideal: 1.4 },
    supplementation_max: 24,
    spawn_rate: 8,
    moisture: { ideal: 65 },
  },
};

const INGS = [
  { id: 'base_a', name: 'Base A', role: 'base_carbono', cat: 'madera', c: 48, n: 0.6, cn: 80, moisture: 12, cost: 400, cs: ['test'] },
  { id: 'base_b', name: 'Base B', role: 'base_carbono', cat: 'madera', c: 50, n: 0.9, cn: 56, moisture: 18, cost: 600, cs: ['test'] },
  { id: 'supp_a', name: 'Supp A', role: 'suplemento_n', cat: 'salvado', c: 45, n: 3.0, cn: 15, moisture: 12, cost: 900, cs: ['test'] },
  { id: 'supp_b', name: 'Supp B', role: 'suplemento_medio', cat: 'salvado', c: 43, n: 2.3, cn: 19, moisture: 9, cost: 1100, cs: ['test'] },
  { id: 'air', name: 'Air', role: 'aireador', cat: 'aireador', c: 45, n: 0.4, cn: 90, moisture: 10, cost: 250, cs: ['test'] },
  { id: 'carbonato_calcio', name: 'Cal', role: 'aditivo_ph', cat: 'adit', c: 0, n: 0, cn: 0, moisture: 0, cost: 3000, cs: ['test'] },
  { id: 'yeso', name: 'Yeso', role: 'aditivo_estructura', cat: 'adit', c: 0, n: 0, cn: 0, moisture: 0, cost: 2200, cs: ['test'] },
];

const dry = g => {
  const f = 1 - Math.min(0.92, Math.max(0, (g.moisture || 0) / 100));
  return { c: g.c * f, n: g.n * f };
};

// Independent reference implementation of the legacy structural enumerator.
// It deliberately repeats the closed-form formulas so the production helper
// cannot make this parity test pass by calling itself.
function legacyStructuralReference({ targetKey, ingredients, spp, profileKey = 'produccion' }) {
  const sp = spp[targetKey];
  const bases = ingredients.filter(g => g.role === 'base_carbono' && g.cs.includes(targetKey) && g.cn > 0 && g.n > 0);
  const supps = ingredients.filter(g => ['suplemento_n', 'suplemento_medio'].includes(g.role) && g.cs.includes(targetKey) && g.cn > 0 && g.n > 0);
  const aers = ingredients.filter(g => g.role === 'aireador');
  const calAvail = ingredients.some(g => g.id === 'carbonato_calcio');
  const yesoAvail = ingredients.some(g => g.id === 'yeso');
  const profileMax = profileKey === 'rescate' ? 8 : null;
  const suppLimit = profileMax != null ? Math.min(sp.supplementation_max || 20, profileMax) : (sp.supplementation_max || 20);
  const aerOpts = [null, ...aers.slice(0, 2)];
  const calOpts = calAvail ? [0, 3] : [0];
  const yesoOpts = yesoAvail ? [0, 2] : [0];
  const T = sp.cn_optimal.ideal;
  const out = [];
  const tried = new Set();

  bases.forEach(base => supps.forEach(supp => {
    if (base.id === supp.id) return;
    aerOpts.forEach(aer => calOpts.forEach(calP => yesoOpts.forEach(yesoP => {
      const aerP = aer ? 10 : 0;
      const remaining = 100 - calP - yesoP - aerP;
      if (remaining < 40) return;
      const key = `1b1s|${base.id}|${supp.id}|${aer?.id || ''}|${calP}|${yesoP}`;
      if (tried.has(key)) return;
      tried.add(key);
      const b = dry(base), s = dry(supp);
      const denom = (b.c - s.c) - T * (b.n - s.n);
      if (Math.abs(denom) < 0.001) return;
      const ps = remaining * (b.c - T * b.n) / denom;
      const pb = remaining - ps;
      if (ps < 2 || pb < 15 || ps > suppLimit || pb > 95) return;
      const rec = [{ id: base.id, p: Math.round(pb * 10) / 10 }, { id: supp.id, p: Math.round(ps * 10) / 10 }];
      if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
      if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
      if (aer) rec.push({ id: aer.id, p: aerP });
      out.push({ mode: '1b1s', recipe: rec });
    })));
  }));

  for (let bi = 0; bi < bases.length; bi++) {
    for (let bj = bi + 1; bj < bases.length; bj++) {
      const b1 = bases[bi], b2 = bases[bj];
      supps.forEach(supp => {
        aerOpts.forEach(aer => {
          const aerP = aer ? 10 : 0;
          const calP = calAvail ? 3 : 0;
          const yesoP = yesoAvail ? 2 : 0;
          const remaining = 100 - calP - yesoP - aerP;
          if (remaining < 40) return;
          [[0.5, 0.5], [0.6, 0.4], [0.4, 0.6]].forEach(([f1, f2]) => {
            const key = `2b1s|${b1.id}|${b2.id}|${supp.id}|${aer?.id || ''}|${f1}`;
            if (tried.has(key)) return;
            tried.add(key);
            const d1 = dry(b1), d2 = dry(b2), ds = dry(supp);
            const cBlend = d1.c * f1 + d2.c * f2;
            const nBlend = d1.n * f1 + d2.n * f2;
            const denom = (cBlend - ds.c) - T * (nBlend - ds.n);
            if (Math.abs(denom) < 0.001) return;
            const ps = remaining * (cBlend - T * nBlend) / denom;
            const pb = remaining - ps;
            if (ps < 2 || pb < 15 || ps > suppLimit || pb > 95) return;
            const rec = [
              { id: b1.id, p: Math.round(pb * f1 * 10) / 10 },
              { id: b2.id, p: Math.round(pb * f2 * 10) / 10 },
              { id: supp.id, p: Math.round(ps * 10) / 10 },
            ];
            if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
            if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
            if (aer) rec.push({ id: aer.id, p: aerP });
            out.push({ mode: '2b1s', recipe: rec });
          });
        });
      });
    }
  }

  const splits = [[0.6, 0.4], [0.5, 0.5]];
  bases.forEach(base => {
    for (let i = 0; i < supps.length; i++) {
      for (let j = i + 1; j < supps.length; j++) {
        const s1 = supps[i], s2 = supps[j];
        aerOpts.forEach(aer => {
          const aerP = aer ? 10 : 0;
          const calP = calAvail ? 3 : 0;
          const yesoP = yesoAvail ? 2 : 0;
          const remaining = 100 - calP - yesoP - aerP;
          if (remaining < 35) return;
          splits.forEach(([f1, f2]) => {
            const key = `1b2s|${base.id}|${s1.id}|${s2.id}|${aer?.id || ''}|${f1}`;
            if (tried.has(key)) return;
            tried.add(key);
            const db = dry(base), d1 = dry(s1), d2 = dry(s2);
            const cBlend = d1.c * f1 + d2.c * f2;
            const nBlend = d1.n * f1 + d2.n * f2;
            const denom = (db.c - cBlend) - T * (db.n - nBlend);
            if (Math.abs(denom) < 0.001) return;
            const psTotal = remaining * (db.c - T * db.n) / denom;
            const pb = remaining - psTotal;
            if (psTotal < 4 || psTotal > suppLimit || pb < 20 || pb > 85) return;
            const rec = [
              { id: base.id, p: Math.round(pb * 10) / 10 },
              { id: s1.id, p: Math.round(psTotal * f1 * 10) / 10 },
              { id: s2.id, p: Math.round(psTotal * f2 * 10) / 10 },
            ];
            if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
            if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
            if (aer) rec.push({ id: aer.id, p: aerP });
            out.push({ mode: '1b2s', recipe: rec });
          });
        });
      }
    }
  });

  return out;
}

function analyze(recipe) {
  const byId = new Map(INGS.map(g => [g.id, g]));
  let wC = 0, wN = 0, drySum = 0, suppP = 0, cafeP = 0, baseBP = 0;
  recipe.forEach(r => {
    const g = byId.get(r.id);
    if (!g) return;
    const frac = r.p * (1 - Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)));
    if (g.cn > 0 && !g.role.startsWith('aditivo_')) {
      wC += g.c * frac;
      wN += g.n * frac;
      drySum += frac;
    }
    if (['suplemento_n', 'suplemento_medio'].includes(g.role)) suppP += r.p;
    if (g.cat === 'cafe') cafeP += r.p;
    if (g.id === 'base_b') baseBP += r.p;
  });
  const avgN = drySum ? wN / drySum : 0;
  const avgC = drySum ? wC / drySum : 0;
  const cn = avgN ? avgC / avgN : 0;
  return { cn, suppP, cafeP, baseBP, dynSpawn: 8 };
}

function score(an) {
  const cnFit = Math.max(0, 100 - Math.abs(an.cn - 35) * 4);
  // base_b deliberately earns a strong structural reward after 30%.
  const structure = an.baseBP > 30 ? 24 : an.baseBP * 0.15;
  const agronomy = Math.min(100, cnFit * 0.75 + structure);
  const safety = an.suppP > 24 ? 40 : 90;
  const economy = 75;
  return {
    score: Math.round(agronomy * 0.55 + safety * 0.30 + economy * 0.15),
    dimensions: {
      safety: { score: safety },
      agronomy: { score: Math.round(agronomy) },
      economy: { score: economy },
    },
    breakdown: { risk: safety },
    uncertainty: { eb: { confidence: 'medium' }, risk: { confidence: 'medium' } },
  };
}

test('canonicalRecipeKey ordena IDs y usa precisión fija', () => {
  const a = [{ id: 'b', p: 20 }, { id: 'a', p: 80 }];
  const b = [{ id: 'a', p: 80.0001 }, { id: 'b', p: 19.9999 }];
  assert.equal(canonicalRecipeKey(a), 'a:80.00|b:20.00');
  assert.equal(canonicalRecipeKey(a), canonicalRecipeKey(b));
});

test('generateStructuralSeeds reproduce exactamente 1b1s/2b1s/1b2s legacy', () => {
  const expected = legacyStructuralReference({ targetKey: 'test', ingredients: INGS, spp: SPP });
  const actual = generateStructuralSeeds({ targetKey: 'test', ingredients: INGS, spp: SPP });
  const e = expected.map(x => `${x.mode}|${canonicalRecipeKey(x.recipe)}`).sort();
  const a = actual.map(x => `${x.structuralMode}|${canonicalRecipeKey(x.recipe)}`).sort();
  assert.deepEqual(a, e);
  assert.ok(a.some(x => x.startsWith('1b1s|')));
  assert.ok(a.some(x => x.startsWith('2b1s|')));
  assert.ok(a.some(x => x.startsWith('1b2s|')));
});

test('solver estructural descarta denominadores degenerados e inviables', () => {
  const degenerate = [
    { id: 'b1', role: 'base_carbono', c: 48, n: 1, cn: 48, moisture: 0, cs: ['test'] },
    { id: 's1', role: 'suplemento_n', c: 48, n: 1, cn: 48, moisture: 0, cs: ['test'] },
  ];
  assert.deepEqual(generateStructuralSeeds({ targetKey: 'test', ingredients: degenerate, spp: SPP }), []);

  const impossible = [
    { id: 'b1', role: 'base_carbono', c: 50, n: 0.2, cn: 250, moisture: 0, cs: ['test'] },
    { id: 's1', role: 'suplemento_n', c: 48, n: 0.21, cn: 229, moisture: 0, cs: ['test'] },
  ];
  assert.deepEqual(generateStructuralSeeds({ targetKey: 'test', ingredients: impossible, spp: SPP }), []);
});

test('híbrido introduce segunda base ausente por encima de 30%; local corto no llega', () => {
  const baseArgs = {
    recipe: [{ id: 'base_a', p: 82 }, { id: 'supp_a', p: 18 }],
    context: { sKey: 'test' },
    targetKey: 'test',
    spp: SPP,
    ingredients: INGS,
    analyze,
    score,
    generations: 3,
    beamWidth: 10,
    stepPct: 4,
    profileKey: 'premium',
    forceLowRisk: false,
    roleCaps: {
      base_carbono: 100,
      suplemento_n: 24,
      suplemento_medio: 24,
      aditivo_ph: 8,
      aditivo_estructura: 15,
      aireador: 30,
    },
  };
  const local = searchScenarios({ ...baseArgs, searchMode: 'local' });
  const hybrid = searchScenarios({ ...baseArgs, searchMode: 'hybrid' });

  assert.equal(local.ranked.some(c => (c.recipe.find(r => r.id === 'base_b')?.p || 0) > 30), false);
  assert.equal(hybrid.ranked.some(c => (c.recipe.find(r => r.id === 'base_b')?.p || 0) > 30), true);
  assert.ok(hybrid.ranked[0].evaluation.score >= local.ranked[0].evaluation.score);
  assert.ok(hybrid.structural.evaluated > hybrid.structural.refinedRoots.length);
  assert.ok(hybrid.structural.refinedRoots.length <= 4);
});

test('híbrido puede introducir suplemento ausente mediante semilla estructural', () => {
  const out = searchScenarios({
    recipe: [{ id: 'base_a', p: 88 }, { id: 'supp_a', p: 12 }],
    context: { sKey: 'test' },
    targetKey: 'test',
    spp: SPP,
    ingredients: INGS,
    analyze,
    score,
    searchMode: 'hybrid',
    generations: 1,
    beamWidth: 8,
    profileKey: 'premium',
    forceLowRisk: false,
    roleCaps: {
      base_carbono: 100,
      suplemento_n: 24,
      suplemento_medio: 24,
      aditivo_ph: 8,
      aditivo_estructura: 15,
      aireador: 30,
    },
  });
  assert.equal(out.ranked.some(c => c.recipe.some(r => r.id === 'supp_b')), true);
});

test('stock, costo real, maxSupp/maxCafe y spawnOverride se aplican en el pipeline común', () => {
  const lots = [
    { ingredienteId: 'base_a', activo: true, cantidadKgDisponible: 100, precioPorKgCOP: 400 },
    { ingredienteId: 'supp_a', activo: true, cantidadKgDisponible: 30, precioPorKgCOP: 5000 },
  ];
  const out = searchScenarios({
    recipe: [{ id: 'base_a', p: 90 }, { id: 'supp_a', p: 10 }],
    context: { sKey: 'test' },
    targetKey: 'test',
    spp: SPP,
    ingredients: INGS,
    analyze,
    score,
    searchMode: 'local',
    generations: 1,
    useStock: true,
    stockIds: new Set(['base_a', 'supp_a']),
    invLotes: lots,
    profileKey: 'rescate',
    maxCost: 1000,
    maxSupp: 8,
    maxCafe: 8,
    spawnOverride: 20,
    roleCaps: { base_carbono: 100, suplemento_n: 24, suplemento_medio: 24 },
  });

  assert.equal(out.profile.spawnOverride, 20);
  assert.equal(out.ranked.every(c => c.recipe.every(r => ['base_a', 'supp_a'].includes(r.id))), true);
  assert.equal(out.ranked.every(c => c.evaluation.analysis.dynSpawn === 20), true);
  assert.equal(out.ranked.every(c => c.evaluation.analysis.suppP <= 8.011), true);
  assert.equal(out.ranked.every(c => c.evaluation.analysis.cost <= 1000), true);
});

test('ranking es determinista y ranked usa score mientras Pareto se conserva separado', () => {
  const args = {
    recipe: [{ id: 'base_a', p: 82 }, { id: 'supp_a', p: 18 }],
    context: { sKey: 'test' },
    targetKey: 'test',
    spp: SPP,
    ingredients: INGS,
    analyze,
    score,
    searchMode: 'hybrid',
    generations: 2,
    beamWidth: 10,
    profileKey: 'premium',
    forceLowRisk: false,
    roleCaps: {
      base_carbono: 100,
      suplemento_n: 24,
      suplemento_medio: 24,
      aditivo_ph: 8,
      aditivo_estructura: 15,
      aireador: 30,
    },
  };
  const a = searchScenarios(args);
  const b = searchScenarios(args);
  assert.deepEqual(a.ranked.map(c => canonicalRecipeKey(c.recipe)), b.ranked.map(c => canonicalRecipeKey(c.recipe)));
  assert.ok(a.ranked.length <= 12);
  for (let i = 1; i < a.ranked.length; i++) {
    assert.ok(a.ranked[i - 1].evaluation.score >= a.ranked[i].evaluation.score);
  }
  assert.ok(Array.isArray(a.pareto));
  assert.ok(Array.isArray(a.recommended));
});

test('todas las semillas se evalúan antes de reducir a cuatro raíces de refinamiento', () => {
  let calls = 0;
  const countedScore = an => {
    calls += 1;
    return score(an);
  };
  const seeds = generateStructuralSeeds({ targetKey: 'test', ingredients: INGS, spp: SPP });
  const out = searchScenarios({
    recipe: [{ id: 'base_a', p: 82 }, { id: 'supp_a', p: 18 }],
    context: { sKey: 'test' },
    targetKey: 'test',
    spp: SPP,
    ingredients: INGS,
    analyze,
    score: countedScore,
    searchMode: 'hybrid',
    generations: 0,
    profileKey: 'premium',
    forceLowRisk: false,
    structuralRootLimit: 4,
    roleCaps: {
      base_carbono: 100,
      suplemento_n: 24,
      suplemento_medio: 24,
      aditivo_ph: 8,
      aditivo_estructura: 15,
      aireador: 30,
    },
  });

  // baseline + every distinct structural seed is scored before root selection.
  assert.equal(calls, out.evaluations);
  assert.equal(out.structural.evaluated, seeds.length);
  assert.equal(out.evaluations, 1 + seeds.length);
  assert.ok(out.structural.refinedRoots.length <= 4);
});

test('modo bodega con stock vacío devuelve noStock sin caer al catálogo', () => {
  const out = searchScenarios({
    recipe: [{ id: 'base_a', p: 82 }, { id: 'supp_a', p: 18 }],
    context: { sKey: 'test' },
    targetKey: 'test',
    spp: SPP,
    ingredients: INGS,
    analyze,
    score,
    searchMode: 'hybrid',
    generations: 3,
    useStock: true,
    stockIds: new Set(),
    profileKey: 'produccion',
  });
  assert.equal(out.noStock, true);
  assert.deepEqual(out.ranked, []);
  assert.deepEqual(out.pareto, []);
  assert.equal(out.evaluations, 1);
});

test('precio ponderado de lotes solo sustituye costo en modo stock', () => {
  const analyzeWithCost = recipe => ({ ...analyze(recipe), cost: 777 });
  const lots = [
    { ingredienteId: 'base_a', activo: true, cantidadKgDisponible: 100, precioPorKgCOP: 5000 },
    { ingredienteId: 'supp_a', activo: true, cantidadKgDisponible: 100, precioPorKgCOP: 9000 },
  ];
  const common = {
    recipe: [{ id: 'base_a', p: 80 }, { id: 'supp_a', p: 20 }],
    context: { sKey: 'test' },
    targetKey: 'test',
    spp: SPP,
    ingredients: INGS,
    analyze: analyzeWithCost,
    score,
    searchMode: 'local',
    generations: 0,
    invLotes: lots,
    profileKey: 'premium',
    forceLowRisk: false,
  };
  const catalog = searchScenarios({ ...common, useStock: false });
  const stock = searchScenarios({
    ...common,
    useStock: true,
    stockIds: new Set(['base_a', 'supp_a']),
  });
  assert.equal(catalog.baseline.evaluation.analysis.cost, 777);
  assert.notEqual(stock.baseline.evaluation.analysis.cost, 777);
  assert.equal(stock.baseline.evaluation.analysis.realCostKnown, true);
});

// Regression coverage for the production incident found manually: with the
// real ~87-ingredient catalog, generateStructuralSeeds() produced 47,401
// seeds for a single species/profile, and searchScenarios({searchMode:
// 'hybrid'}) took 61.8s / 50,099 evaluations to finish because it evaluated
// every seed against SetasScoring before pruning, plus makeMutations() added
// one "insert ingredient" mutation per compatible catalog ingredient per
// beam member per generation on top of that. Both are now capped.
const LARGE_SPP = {
  test: SPP.test,
};
const LARGE_INGS = (() => {
  const list = [];
  for (let i = 0; i < 15; i++) {
    list.push({ id: `lbase_${i}`, name: `Base ${i}`, role: 'base_carbono', c: 46 + (i % 5), n: 0.4 + i * 0.03, cn: 60 + i * 2, moisture: 10 + (i % 4), cost: 300 + i * 20, cs: ['test'] });
  }
  for (let i = 0; i < 15; i++) {
    list.push({ id: `lsupp_${i}`, name: `Supp ${i}`, role: i % 2 === 0 ? 'suplemento_n' : 'suplemento_medio', c: 44 + (i % 3), n: 2 + i * 0.1, cn: 12 + i, moisture: 8 + (i % 5), cost: 700 + i * 30, cs: ['test'] });
  }
  return list;
})();

test('generateStructuralSeeds genera muchas más semillas que un cap razonable con catálogos de tamaño realista', () => {
  const seeds = generateStructuralSeeds({ targetKey: 'test', ingredients: LARGE_INGS, spp: LARGE_SPP, profileKey: 'produccion' });
  // 15 bases x 15 suplementos ya produce ~150 semillas con solo 1b1s/2b1s/1b2s
  // — el catálogo real (34 bases x 33 suplementos para orellana gris) llegó
  // a 47,401. No hace falta reproducir esa escala aquí: basta con confirmar
  // que un catálogo de tamaño moderado ya excede con holgura un cap chico,
  // para que el siguiente test pueda fijar structuralSeedCap explícitamente
  // y probar que el motor respeta ese cap en vez de evaluarlas todas.
  assert.ok(seeds.length > 50, `se esperaban >50 semillas con 15 bases x 15 suplementos, hubo ${seeds.length}`);
});

test('searchScenarios en modo hybrid acota semillas evaluadas y no explota con catálogos grandes', () => {
  const base = LARGE_INGS.find(g => g.id === 'lbase_0');
  const supp = LARGE_INGS.find(g => g.id === 'lsupp_0');
  const t0 = Date.now();
  const out = searchScenarios({
    recipe: [{ id: base.id, p: 82 }, { id: supp.id, p: 18 }],
    context: { sKey: 'test' },
    targetKey: 'test',
    spp: LARGE_SPP,
    ingredients: LARGE_INGS,
    analyze,
    score,
    searchMode: 'hybrid',
    generations: 3,
    beamWidth: 14,
    stepPct: 4,
    profileKey: 'produccion',
    forceLowRisk: false,
    structuralSeedCap: 40,
    roleCaps: { base_carbono: 100, suplemento_n: 24, suplemento_medio: 24 },
  });
  const ms = Date.now() - t0;

  assert.equal(out.structural.capped, true);
  assert.equal(out.structural.seedCap, 40);
  assert.equal(out.structural.evaluated, 40);
  assert.ok(out.structural.generated > out.structural.seedCap, 'el cap solo tiene sentido si de verdad se generaron más semillas de las evaluadas');
  // Bound, not a strict perf assertion (machine-dependent): this used to take
  // 61.8s / 50k+ evaluations on the real catalog before capping. A few
  // hundred ms / a few thousand evaluations on a synthetic 30-ingredient
  // catalog confirms the cap is actually engaged, not just present in the API.
  assert.ok(ms < 10000, `la búsqueda tardó ${ms}ms — el cap no está evitando la explosión combinatoria`);
  assert.ok(out.evaluations < 5000, `${out.evaluations} evaluaciones — demasiadas para un catálogo de 30 ingredientes con el cap activo`);
  assert.ok(out.ranked.length > 0);
});

test('cheapSeedRank ordena de forma determinista sin llamar al motor de scoring', () => {
  const seeds = generateStructuralSeeds({ targetKey: 'test', ingredients: LARGE_INGS, spp: LARGE_SPP, profileKey: 'produccion' }).slice(0, 50);
  const ranked1 = cheapSeedRank(seeds, LARGE_INGS);
  const ranked2 = cheapSeedRank(seeds, LARGE_INGS);
  assert.deepEqual(ranked1.map(s => canonicalRecipeKey(s.recipe)), ranked2.map(s => canonicalRecipeKey(s.recipe)));
  assert.equal(ranked1.length, seeds.length);
});
