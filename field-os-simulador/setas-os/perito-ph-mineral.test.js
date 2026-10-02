'use strict';
// Punto 3 del análisis del Perito: dosis de minerales de pH y regla "Sin mineral".
// Antes la corrección de pH resolvía la cantidad hasta el centro del rango y
// proponía carbonato de calcio al 10,7–12 % (supplementation.md documenta
// 0,5–1 %), y "Sin mineral estabilizador" solo se disparaba cuando SÍ había
// calcio en la receta.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');

globalThis.generateOptimizer = RO.generateOptimizer;
globalThis.applyOptToRecipe = RO.applyOptToRecipe;
globalThis.calcTreatment = RO.calcTreatment;
globalThis.createRecipeEvaluator = RO.createRecipeEvaluator;
const X = extractConsts(['SPP', 'INGS', 'EB_PENALTY_BALANCE_BAND', 'analyze', 'blendEBWithHistory', 'autoImproveIsBetter', 'AUTO_IMPROVE_PAIR_POOL', 'autoImproveOps', 'autoImproveRecipeDetailed', 'autoImproveRecipe']);

const byId = new Map(X.INGS.map(g => [g.id, g]));
const isPhMineral = id => byId.get(id)?.role === 'aditivo_ph';
const opsOf = apply => (Array.isArray(apply) ? apply : apply ? [apply] : []);

const perito = (sKey, recipe, stockIds = new Set()) => {
  const spp = T.applyToSpp(X.SPP, sKey, recipe, X.INGS);
  const an = X.analyze(recipe, sKey, X.INGS, spp);
  return RO.generateOptimizer(an, sKey, stockIds, recipe, X.INGS, [], an.eb, true, {}, spp, {});
};

// Barrido: bases × suplementos × especies, con y sin minerales.
const sweep = () => {
  const out = [];
  for (const sKey of ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_eryngii', 'shiitake', 'lions_mane', 'reishi']) {
    const bases = X.INGS.filter(g => g.role === 'base_carbono' && g.cs?.includes(sKey)).slice(0, 5);
    const supps = X.INGS.filter(g => g.role === 'suplemento_n' && g.cs?.includes(sKey)).slice(0, 2);
    for (const b of bases) for (const s of supps) for (const p of [5, 20]) for (const extra of [[], [{ id: 'yeso', p: 1 }], [{ id: 'carbonato_calcio', p: 0.5 }], [{ id: 'carbonato_calcio', p: 2 }]]) {
      const extraP = extra.reduce((t, e) => t + e.p, 0);
      out.push({ sKey, recipe: [{ id: b.id, p: 100 - p - extraP }, { id: s.id, p }, ...extra] });
    }
  }
  return out;
};

test('ninguna sugerencia lleva un mineral de pH por encima de su dosis típica documentada', () => {
  let checked = 0;
  for (const { sKey, recipe } of sweep()) {
    for (const it of perito(sKey, recipe).items) {
      for (const op of [...opsOf(it.apply), ...opsOf(it.comboApply)]) {
        if (!isPhMineral(op.id)) continue;
        const dose = RO.PH_MINERAL_DOSES[op.id];
        assert.ok(dose, `${it.label}: ${op.id} sin dosis documentada no debe tener cantidad automática`);
        const cur = Number(recipe.find(r => r.id === op.id)?.p) || 0;
        const target = op.mode === 'set' ? op.value : cur + (op.delta || 0);
        assert.ok(target <= dose.max + 1e-9, `${sKey} ${JSON.stringify(recipe)} · ${it.label}: ${op.id} → ${target}% > ${dose.max}%`);
        assert.ok(target >= cur, `${it.label}: no debe bajar ${op.id} (${cur}% → ${target}%)`);
        checked++;
      }
    }
  }
  assert.ok(checked > 20, `muy pocas sugerencias de mineral verificadas (${checked})`);
});

test('regresión: "Centrar pH" ya no propone carbonato al 10,7 %', () => {
  const recipe = [{ id: 'tusa_maiz', p: 70 }, { id: 'salvado_trigo', p: 28 }, { id: 'yeso', p: 1 }, { id: 'carbonato_calcio', p: 1 }];
  const it = perito('p_ostreatus_gris', recipe).items.find(i => i.label === 'Centrar pH');
  assert.ok(it);
  assert.equal(it.apply, null, 'el carbonato ya está en el tope de su dosis típica');
  assert.match(it.action, /dosis típica documentada 0,5–1 %/);
});

test('pH ácido con carbonato disponible: lo propone dentro de la dosis y avisa si no alcanza el rango', () => {
  const it = perito('shiitake', [{ id: 'aserrin_roble', p: 80 }, { id: 'salvado_trigo', p: 20 }]).items.find(i => i.icon === '↑pH');
  assert.deepEqual(it.apply, { mode: 'set', id: 'carbonato_calcio', value: 1 });
  assert.equal(it.capped, true);
  assert.match(it.riskIfIgnored, /no lleva el pH estimado al rango/);
});

test('mineral sin dosis documentada (ceniza en bodega): sugerencia sin cantidad automática', () => {
  const stock = new Set(['aserrin_alamo', 'salvado_trigo', 'ceniza_vegetal']);
  const it = perito('p_ostreatus_gris', [{ id: 'aserrin_alamo', p: 80 }, { id: 'salvado_trigo', p: 20 }], stock).items.find(i => i.icon === '↑pH');
  assert.equal(it.apply, null);
  assert.match(it.action, /sin dosis de referencia/);
});

test('"Sin mineral buffer de pH" no aparece si hay yeso o carbonato en la receta', () => {
  for (const { sKey, recipe } of sweep()) {
    const hasMineral = recipe.some(r => r.id === 'yeso' || isPhMineral(r.id));
    if (!hasMineral) continue;
    const it = perito(sKey, recipe).items.find(i => /Sin mineral/.test(i.label));
    assert.equal(it, undefined, `${sKey} ${JSON.stringify(recipe)}`);
  }
});

test('"Sin mineral buffer de pH" aparece sin mineral y sin aviso de calcio, una sola vez', () => {
  // Shiitake va a autoclave: el aviso de calcio (sustrato no estéril) no aplica.
  const recipe = [{ id: 'aserrin_roble', p: 85 }, { id: 'salvado_trigo', p: 15 }];
  const items = perito('shiitake', recipe).items;
  const mineralCards = items.filter(i => opsOf(i.apply).some(op => isPhMineral(op.id)));
  assert.equal(mineralCards.length, 1, items.map(i => `${i.label}: ${JSON.stringify(i.apply)}`).join(' | '));
  assert.ok(!items.some(i => i.label === 'Calcio mineral bajo el mínimo funcional'));
});

test('sin textos sin fuente en las tarjetas de mineral', () => {
  for (const { sKey, recipe } of sweep()) {
    for (const it of perito(sKey, recipe).items) {
      const text = `${it.action} ${it.effect} ${it.delta || ''}`;
      assert.doesNotMatch(text, /bajo costo, alto impacto|\+5% consistencia|No se detecta mineral/, it.label);
    }
  }
});

test('Auto-mejorar no sube el carbonato por encima de su dosis documentada', () => {
  const dose = RO.PH_MINERAL_DOSES.carbonato_calcio;
  for (const [sKey, recipe] of [
    ['shiitake', [{ id: 'aserrin_roble', p: 80 }, { id: 'salvado_trigo', p: 20 }]],
    ['p_ostreatus_gris', [{ id: 'aserrin_alamo', p: 80 }, { id: 'salvado_trigo', p: 20 }]],
    ['p_ostreatus_gris', [{ id: 'tusa_maiz', p: 70 }, { id: 'salvado_trigo', p: 28 }, { id: 'yeso', p: 1 }, { id: 'carbonato_calcio', p: 1 }]],
  ]) {
    const resolveSpp = r => T.applyToSpp(X.SPP, sKey, r, X.INGS);
    const out = X.autoImproveRecipe({
      recipe, sKey, ings: X.INGS, optimizerINGS: X.INGS, spp: resolveSpp(recipe), resolveSpp,
      stockIds: new Set(), lockedIds: [], useStock: false, usageCounts: {}, histStats: null,
    });
    const ca = Number(out.find(r => r.id === 'carbonato_calcio')?.p) || 0;
    assert.ok(ca <= dose.max + 0.05, `${sKey}: carbonato ${ca}%`);
  }
});

test('la dosis documentada cita su fuente en la base de conocimiento', () => {
  for (const [id, dose] of Object.entries(RO.PH_MINERAL_DOSES)) {
    assert.ok(isPhMineral(id), id);
    assert.match(dose.source, /^knowledge_base\//);
    assert.ok(dose.min > 0 && dose.max >= dose.min);
  }
});
