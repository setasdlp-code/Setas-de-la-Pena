'use strict';
// Punto 4 del análisis del Perito: Auto-mejorar corrige varios críticos y es
// reversible. Antes solo aceptaba un paso si subía el score; con varios
// críticos el tope de severidad deja el score igual al corregir uno solo, y
// Auto-mejorar se detenía con la receta en "No ejecutar".
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');

globalThis.generateOptimizer = RO.generateOptimizer;
globalThis.applyOptToRecipe = RO.applyOptToRecipe;
globalThis.calcTreatment = RO.calcTreatment;
globalThis.createRecipeEvaluator = RO.createRecipeEvaluator;
const X = extractConsts(['SPP', 'INGS', 'EB_PENALTY_BALANCE_BAND', 'analyze', 'blendEBWithHistory',
  'autoImproveIsBetter', 'AUTO_IMPROVE_PAIR_POOL', 'autoImproveOps', 'autoImproveRecipeDetailed', 'autoImproveRecipe']);

const run = (sKey, recipe, extra = {}) => {
  const resolveSpp = r => T.applyToSpp(X.SPP, sKey, r, X.INGS);
  return X.autoImproveRecipeDetailed({
    recipe, sKey, ings: X.INGS, optimizerINGS: X.INGS, spp: resolveSpp(recipe), resolveSpp,
    stockIds: new Set(), lockedIds: [], useStock: false, usageCounts: {}, histStats: null, ...extra,
  });
};
const evaluatorFor = sKey => RO.createRecipeEvaluator({
  sKey, ings: X.INGS, resolveSpp: r => T.applyToSpp(X.SPP, sKey, r, X.INGS), blendEB: a => a.eb, analyzeFn: X.analyze,
});
const criticalsOf = (sKey, recipe) => globalThis.SetasScoring.assessSeverity(evaluatorFor(sKey)(recipe).an).criticals;

test('autoImproveIsBetter: menos críticos sin bajar score, o más score con los mismos críticos', () => {
  const b = X.autoImproveIsBetter;
  assert.equal(b({ criticals: 1, score: 46 }, { criticals: 3, score: 46 }), true);
  assert.equal(b({ criticals: 2, score: 50 }, { criticals: 2, score: 46 }), true);
  assert.equal(b({ criticals: 2, score: 46 }, { criticals: 2, score: 46 }), false);
  assert.equal(b({ criticals: 1, score: 40 }, { criticals: 3, score: 46 }), false, 'no cambiar críticos por score');
  assert.equal(b({ criticals: 3, score: 60 }, { criticals: 2, score: 46 }), false, 'nunca agregar críticos');
});

test('regresión: con tres críticos y score topado, Auto-mejorar baja críticos (antes se quedaba en 3)', () => {
  const recipe = [{ id: 'bagazo_caña', p: 97 }, { id: 'pulpa_cafe', p: 3 }];
  const r = run('p_ostreatus_gris', recipe);
  assert.equal(r.before.criticals, 3);
  assert.ok(r.after.criticals < 3, `críticos ${r.before.criticals} → ${r.after.criticals}`);
  assert.ok(r.after.score >= r.before.score);
  assert.equal(r.after.criticals, criticalsOf('p_ostreatus_gris', r.recipe), 'el resumen coincide con la receta resultante');
});

test('usa la corrección combinada cuando un ajuste solo crearía otro crítico', () => {
  const r = run('shiitake', [{ id: 'guadua', p: 95 }, { id: 'salvado_trigo', p: 5 }]);
  assert.equal(r.after.criticals, 0);
  assert.ok(r.steps.some(st => st.labels.some(l => /^Aplicar junto con/.test(l))), r.steps.map(s => s.labels.join('+')).join(' → '));
});

test('cada paso registrado avanza y nunca empeora: menos críticos o más score', () => {
  for (const [sKey, recipe] of [
    ['p_ostreatus_gris', [{ id: 'paja_trigo', p: 97 }, { id: 'borra_cafe', p: 3 }]],
    ['p_ostreatus_gris', [{ id: 'aserrin_alamo', p: 95 }, { id: 'salvado_trigo', p: 5 }]],
    ['shiitake', [{ id: 'chips_poda_urbana', p: 60 }, { id: 'salvado_trigo', p: 40 }]],
    ['lions_mane', [{ id: 'aserrin_roble', p: 97 }, { id: 'salvado_arroz', p: 3 }]],
  ]) {
    const r = run(sKey, recipe);
    for (const st of r.steps) assert.ok(X.autoImproveIsBetter(st.after, st.before), `${sKey}: ${JSON.stringify(st)}`);
    assert.ok(r.after.score >= r.before.score && r.after.criticals <= r.before.criticals);
    for (const st of r.steps) assert.ok(st.ingredientIds.length >= 1 && st.labels.length >= 1);
  }
});

test('sin ajuste que avance: devuelve la misma receta y cero pasos', () => {
  const recipe = [{ id: 'guadua', p: 70 }, { id: 'borra_cafe', p: 30 }];
  const r = run('p_ostreatus_gris', recipe, { lockedIds: ['guadua', 'borra_cafe'], optimizerINGS: X.INGS.filter(g => ['guadua', 'borra_cafe'].includes(g.id)) });
  assert.equal(r.steps.length, 0);
  assert.deepEqual(r.recipe, recipe);
  assert.deepEqual(r.after, r.before);
});

test('respeta los ingredientes bloqueados', () => {
  const recipe = [{ id: 'bagazo_caña', p: 97 }, { id: 'pulpa_cafe', p: 3 }];
  const r = run('p_ostreatus_gris', recipe, { lockedIds: ['pulpa_cafe'] });
  assert.equal(r.recipe.find(x => x.id === 'pulpa_cafe').p, 3);
});

test('autoImproveRecipe sigue devolviendo solo la receta (compatibilidad)', () => {
  const recipe = [{ id: 'bagazo_caña', p: 97 }, { id: 'pulpa_cafe', p: 3 }];
  const sKey = 'p_ostreatus_gris';
  const resolveSpp = r => T.applyToSpp(X.SPP, sKey, r, X.INGS);
  const args = { recipe, sKey, ings: X.INGS, optimizerINGS: X.INGS, spp: resolveSpp(recipe), resolveSpp, stockIds: new Set(), lockedIds: [], useStock: false, usageCounts: {}, histStats: null };
  assert.deepEqual(X.autoImproveRecipe(args), X.autoImproveRecipeDetailed(args).recipe);
});

test('el componente guarda la receta previa en el historial antes de aplicar Auto-mejorar', () => {
  const jsx = require('node:fs').readFileSync(require('node:path').join(__dirname, 'simulador-app.jsx'), 'utf8');
  const body = jsx.slice(jsx.indexOf('const autoImprove=()=>{'), jsx.indexOf('const autoImproveSummary='));
  assert.match(body, /setRecipeHistory\(h=>\[\.\.\.h,recipe\]\);\s*setRecipe\(res\.recipe\)/);
  assert.match(body, /setUsageCounts/);
  assert.match(body, /setAutoImproveResult/);
});

test('applyOptToRecipe no modifica un ingrediente bloqueado aunque sea el objetivo del ajuste', () => {
  const recipe = [{ id: 'bagazo_caña', p: 97 }, { id: 'pulpa_cafe', p: 3 }];
  for (const apply of [
    { mode: 'set', id: 'pulpa_cafe', value: 10 },
    { mode: 'increase', id: 'pulpa_cafe', delta: 5 },
    { mode: 'decrease', id: 'pulpa_cafe', delta: 2 },
    { mode: 'add', id: 'pulpa_cafe', delta: 5 },
  ]) {
    assert.deepEqual(RO.applyOptToRecipe(recipe, apply, ['pulpa_cafe'], X.INGS), recipe, apply.mode);
  }
  // Un ajuste sobre otro ingrediente sigue funcionando y deja el bloqueado igual.
  const next = RO.applyOptToRecipe(recipe, { mode: 'add', id: 'salvado_trigo', delta: 10 }, ['pulpa_cafe'], X.INGS);
  assert.equal(next.find(r => r.id === 'pulpa_cafe').p, 3);
  assert.ok(next.some(r => r.id === 'salvado_trigo'));
});
