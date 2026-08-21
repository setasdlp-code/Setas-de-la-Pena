'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  normalizeRecipe,
  recipeDistance,
  noveltyScore,
  applyMutation,
  paretoFront,
  searchScenarios,
  selectRecommended,
  dominantBaseKey,
} = require('./perito-scenarios.js');

const ingredients = [
  { id: 'sawdust', name: 'Aserrín', role: 'base' },
  { id: 'bran', name: 'Salvado', role: 'supplement' },
  { id: 'husk', name: 'Cascarilla', role: 'air' },
  { id: 'corncob', name: 'Tuza', role: 'air' },
];

const analyze = (recipe) => {
  const p = Object.fromEntries(recipe.map(r => [r.id, r.p]));
  const bran = p.bran || 0;
  const air = (p.husk || 0) + (p.corncob || 0);
  const base = p.sawdust || 0;
  return {
    bran,
    air,
    base,
    sp: { supplementation_max: 20 },
    trichoderma: bran > 28,
    suppP: bran,
    tot: recipe.reduce((s, r) => s + r.p, 0),
  };
};

const score = (an) => {
  const safety = an.trichoderma ? 35 : Math.max(55, 96 - Math.max(0, an.bran - 20) * 3);
  const agronomy = Math.max(0, 65 + Math.min(an.bran, 20) * 1.4 + Math.min(an.air, 15) * 0.7 - Math.max(0, an.air - 25));
  const economy = Math.max(0, 95 - an.bran * 1.4);
  return {
    score: Math.round((safety + agronomy + economy) / 3),
    dimensions: {
      safety: { score: Math.round(safety), status: safety >= 80 ? 'approved' : 'review' },
      agronomy: { score: Math.round(agronomy), status: 'acceptable' },
      economy: { score: Math.round(economy), status: 'acceptable' },
    },
    uncertainty: {
      eb: { confidence: 'medium' },
      risk: { confidence: 'medium' },
    },
    provenance: { score: { type: 'test-model' } },
  };
};

test('normaliza receta a 100 sin perder proporciones', () => {
  const r = normalizeRecipe([{ id: 'a', p: 70 }, { id: 'b', p: 20 }]);
  assert.ok(Math.abs(r.reduce((s, x) => s + x.p, 0) - 100) < 0.02);
  assert.ok(r[0].p > r[1].p);
});

test('distancia y novedad detectan recetas diferentes', () => {
  const a = [{ id: 'a', p: 80 }, { id: 'b', p: 20 }];
  const b = [{ id: 'a', p: 50 }, { id: 'c', p: 50 }];
  assert.ok(recipeDistance(a, b) > 0.4);
  assert.equal(noveltyScore(a, [{ recipe: a }]), 0);
  assert.ok(noveltyScore(b, [{ recipe: a }]) > 50);
});

test('mutación reequilibra el resto de la receta', () => {
  const r = applyMutation(
    [{ id: 'sawdust', p: 90 }, { id: 'bran', p: 10 }],
    { type: 'set', id: 'husk', value: 10 }
  );
  const m = Object.fromEntries(r.map(x => [x.id, x.p]));
  assert.ok(Math.abs(r.reduce((s, x) => s + x.p, 0) - 100) < 0.02);
  assert.equal(Math.round(m.husk), 10);
  assert.ok(m.sawdust < 90);
});

test('mutación preserva ingredientes fijados', () => {
  const r = applyMutation(
    [{ id: 'sawdust', p: 70 }, { id: 'bran', p: 20 }, { id: 'husk', p: 10 }],
    { type: 'set', id: 'corncob', value: 8, lockedIds: ['bran'] },
    { bran: 20, corncob: 20 }
  );
  const m = Object.fromEntries(r.map(x => [x.id, x.p]));
  assert.ok(Math.abs(m.bran - 20) < 0.05);
  assert.ok(Math.abs(r.reduce((s, x) => s + x.p, 0) - 100) < 0.05);
});

test('Pareto conserva tradeoffs reales', () => {
  const cs = [
    { id: 'a', evaluation: { dimensions: { safety: { score: 90 }, agronomy: { score: 80 }, economy: { score: 60 } } } },
    { id: 'b', evaluation: { dimensions: { safety: { score: 80 }, agronomy: { score: 90 }, economy: { score: 60 } } } },
    { id: 'c', evaluation: { dimensions: { safety: { score: 70 }, agronomy: { score: 70 }, economy: { score: 50 } } } },
  ];
  const ids = paretoFront(cs).map(x => x.id);
  assert.deepEqual(ids.sort(), ['a', 'b']);
});

test('búsqueda explora escenarios completos y devuelve alternativas', () => {
  const recipe = [{ id: 'sawdust', p: 90 }, { id: 'bran', p: 10 }];
  const out = searchScenarios({
    recipe,
    ingredients,
    analyze,
    score,
    history: [{ recipe }],
    generations: 3,
    beamWidth: 12,
    stepPct: 5,
    roleCaps: { supplement: 20, air: 20, base: 100 },
    ingredientCaps: { bran: 20, husk: 20, corncob: 20 },
  });
  assert.ok(out.explored > 5);
  assert.ok(out.pareto.length > 0);
  assert.ok(out.best.utility >= out.baseline.utility || out.best.evaluation.novelty > 0);
  assert.ok(out.recommended.length > 0);
  assert.ok(out.recommended.every(x => x.path.length > 0));
});

test('búsqueda completa conserva porcentaje de ingrediente fijado', () => {
  const recipe = [{ id: 'sawdust', p: 70 }, { id: 'bran', p: 20 }, { id: 'husk', p: 10 }];
  const out = searchScenarios({
    recipe,
    ingredients,
    analyze,
    score,
    generations: 2,
    beamWidth: 10,
    stepPct: 4,
    lockedIds: new Set(['bran']),
    roleCaps: { supplement: 20, air: 20, base: 100 },
    ingredientCaps: { bran: 20, husk: 20, corncob: 20 },
  });
  assert.deepEqual(out.lockedIds, ['bran']);
  for (const c of out.pareto) {
    const bran = c.recipe.find(r => r.id === 'bran');
    assert.ok(bran);
    assert.ok(Math.abs(bran.p - 20) < 0.05);
  }
});

test('modo solo bodega no propone ingredientes fuera de stock', () => {
  const out = searchScenarios({
    recipe: [{ id: 'sawdust', p: 90 }, { id: 'bran', p: 10 }],
    ingredients,
    analyze,
    score,
    generations: 1,
    stepPct: 5,
    useStock: true,
    stockIds: new Set(['sawdust', 'bran', 'husk']),
  });
  assert.equal(out.pareto.some(x => x.recipe.some(r => r.id === 'corncob')), false);
});

test('Perito consume SetasFormulatorAPI y no conoce controles internos del Formulador', () => {
  const bridge = fs.readFileSync(path.join(__dirname, 'perito-scenarios-bridge.js'), 'utf8');
  const formulatorApi = fs.readFileSync(path.join(__dirname, 'formulator-api.js'), 'utf8');
  const hook = fs.readFileSync(path.join(__dirname, 'perito-scoring-hook.js'), 'utf8');

  assert.match(bridge, /import '\.\/formulator-api\.js';/);
  assert.match(bridge, /SetasFormulatorAPI/);
  assert.match(bridge, /formulator\.applyRecipe/);
  assert.match(bridge, /formulator\.undoRecipe/);
  assert.match(bridge, /formulator\.getState/);
  assert.doesNotMatch(bridge, /applyRecipeViaDom/);
  assert.doesNotMatch(bridge, /aria-label\^=\"Porcentaje de /);
  assert.doesNotMatch(bridge, /Agregar \$\{name\} a la receta/);
  assert.doesNotMatch(bridge, /Quitar \$\{name\} de la receta/);

  assert.match(formulatorApi, /globalThis\.SetasFormulatorAPI/);
  assert.match(formulatorApi, /registerNativeAdapter/);
  assert.match(formulatorApi, /const applyRecipe = async/);
  assert.match(formulatorApi, /const undoRecipe = async/);
  assert.match(formulatorApi, /adapterType/);
  assert.match(formulatorApi, /mutateDom/);

  assert.match(bridge, /SetasPeritoScenarios\.searchScenarios/);
  assert.match(bridge, /localStorage\.getItem\('setas_workmode'\)/);
  assert.match(bridge, /g\.cs\.includes\(sKey\)/);
  assert.match(bridge, /rawTotal < 99 \|\| rawTotal > 101/);
  assert.match(bridge, /__bridgeRecompute:\s*true/);
  assert.match(bridge, /historyCalibrationFor\(context\.sKey/);
  assert.doesNotMatch(bridge, /blendedEB:\s*detail\.baseline/);
  assert.match(hook, /import '\.\/perito-scenarios-bridge\.js';/);
});

// ── selectRecommended — diversidad de base primero, type como criterio
// secundario de relleno (no de selección primaria) ──────────────────
test('selectRecommended prioriza combinaciones de base no vistas antes de repetir una', () => {
  const mk = (id, group, type) => ({ id, recipe: [{ id: group, p: 100 }], type });
  const groupKeyFor = c => c.recipe[0].id;
  // Orden = orden de utilidad (ya viene ordenado por el llamador).
  const candidates = [
    mk('c1', 'baseA', 'rendimiento'),
    mk('c2', 'baseA', 'economia'),
    mk('c3', 'baseB', 'rendimiento'),
    mk('c4', 'baseA', 'alternativa'),
  ];
  const out = selectRecommended(candidates, { groupKeyFor, limit: 4 });
  assert.deepEqual(out.map(c => c.id), ['c1', 'c3', 'c2', 'c4']);
});

// ── dominantBaseKey — la identidad estructural de una receta cuenta solo
// bases con participación real, no cualquier base_carbono presente ──────
// Caso real encontrado con el catálogo de producción: 8 de 12 tarjetas de
// "Generador de recetas" para Orellana Gris eran kikuyo 30-35% + hojarasca
// 44-51% + UN relleno distinto cada vez al 1.6-12% (cáscara de plátano,
// sms, paja de soya, tallo de floricultura...). structKeyFor (que contaba
// cualquier base_carbono presente) las veía como 4-8 "grupos distintos" —
// dominantBaseKey debe verlas como una sola receta real.
test('dominantBaseKey ignora bases_carbono minoritarias — mismo relleno al 5-12% no cuenta como base distinta', () => {
  const roleById = new Map([
    ['kikuyo', 'base_carbono'], ['hojarasca', 'base_carbono'],
    ['cascara_platano', 'base_carbono'], ['sms', 'base_carbono'], ['paja_soya', 'base_carbono'],
  ]);
  const variant = filler => [
    { id: 'kikuyo', p: 32 }, { id: 'hojarasca', p: 49 }, { id: filler, p: 8 },
  ];
  const keys = new Set([
    dominantBaseKey(variant('cascara_platano'), roleById),
    dominantBaseKey(variant('sms'), roleById),
    dominantBaseKey(variant('paja_soya'), roleById),
  ]);
  assert.equal(keys.size, 1, `variantes con solo el relleno menor distinto deben compartir clave; hubo ${keys.size}: ${[...keys]}`);
  assert.equal([...keys][0], 'hojarasca+kikuyo');
});

test('dominantBaseKey sí distingue recetas con distintas bases dominantes', () => {
  const roleById = new Map([
    ['kikuyo', 'base_carbono'], ['hojarasca', 'base_carbono'],
    ['retamo_espinoso', 'base_carbono'], ['carton_corrugado', 'base_carbono'],
  ]);
  const a = dominantBaseKey([{ id: 'kikuyo', p: 32 }, { id: 'hojarasca', p: 49 }, { id: 'retamo_espinoso', p: 8 }], roleById);
  const b = dominantBaseKey([{ id: 'retamo_espinoso', p: 39 }, { id: 'carton_corrugado', p: 26 }, { id: 'hojarasca', p: 8 }], roleById);
  assert.notEqual(a, b);
});

test('selectRecommended prefiere un type no visto sobre repetir type, aunque tenga menor utilidad', () => {
  const mk = (id, group, type) => ({ id, recipe: [{ id: group, p: 100 }], type });
  const groupKeyFor = c => c.recipe[0].id;
  const candidates = [
    mk('c1', 'baseA', 'rendimiento'),
    mk('c2', 'baseA', 'rendimiento'), // mayor utilidad que c3, pero repite type
    mk('c3', 'baseA', 'economia'),    // menor utilidad, pero type nuevo
  ];
  const out = selectRecommended(candidates, { groupKeyFor, limit: 2 });
  assert.deepEqual(out.map(c => c.id), ['c1', 'c3']);
});
