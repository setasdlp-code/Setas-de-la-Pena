'use strict';
// Punto 6 del análisis del Perito: dirección de las sugerencias y alternativa
// cuando el ingrediente sugerido llega a su tope. Antes, si el suplemento ya
// pasaba su tope, el buscador de dosis solo podía bajarlo y la tarjeta movía la
// métrica en contra del objetivo ("C:N demasiado alto → bajar rastrojo de
// soya": C:N 52 → 59; 315 casos en el barrido), y con el suplemento en el tope
// las tarjetas críticas quedaban sin botón (49 casos).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');
const cat = require('./substrate-catalog.js');
Object.assign(globalThis, cat);
globalThis.SetasScoring = require('./scoring.js');
const { analyze } = require('./substrate-analysis.js');

const metricOf = it => {
  const ic = it.icon || '';
  if (ic === '→N' || ic === '→C' || ic.includes('C:N')) return 'cn';
  if (ic.toLowerCase().includes('ph')) return 'ph';
  if (ic.includes('N')) return 'n';
  return null;
};
const read = (a, m) => (m === 'cn' ? a.cn : a.avgN);
const critOf = an => globalThis.SetasScoring.assessSeverity(an).criticals;

const setup = (sKey, recipe, { stockIds = new Set(), useStock = false, lockedIds = [], optimizerINGS = cat.INGS } = {}) => {
  const resolveSpp = r => T.applyToSpp(cat.SPP, sKey, r, cat.INGS);
  const evaluate = RO.createRecipeEvaluator({ sKey, ings: cat.INGS, resolveSpp, stockIds, analyzeFn: analyze, blendEB: a => a.eb });
  const spp = resolveSpp(recipe);
  const an = analyze(recipe, sKey, cat.INGS, spp);
  const opt = RO.generateOptimizer(an, sKey, stockIds, recipe, optimizerINGS, lockedIds, an.eb, useStock, {}, spp, {}, evaluate);
  return { evaluate, spp, an, opt, target: m => (m === 'cn' ? spp[sKey].cn_optimal.ideal : spp[sKey].n_optimal.ideal) };
};

const sweep = () => {
  const out = [];
  for (const sKey of ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_eryngii', 'shiitake', 'lions_mane']) {
    const bases = cat.INGS.filter(g => g.role === 'base_carbono' && g.cs?.includes(sKey)).slice(0, 6);
    const supps = cat.INGS.filter(g => (g.role === 'suplemento_n' || g.role === 'suplemento_medio') && g.cs?.includes(sKey)).slice(0, 4);
    for (const b of bases) for (const s of supps) for (const p of [3, 20, 28, 40]) out.push({ sKey, recipe: [{ id: b.id, p: 100 - p }, { id: s.id, p }] });
  }
  return out;
};

test('ninguna sugerencia de C:N o N aleja la métrica de su objetivo', () => {
  let checked = 0;
  for (const { sKey, recipe } of sweep()) {
    const { evaluate, an, opt, target } = setup(sKey, recipe);
    for (const it of opt.items) {
      const m = metricOf(it);
      if (!it.apply || (m !== 'cn' && m !== 'n')) continue;
      const after = evaluate(RO.applyOptToRecipe(recipe, it.apply, [], cat.INGS)).an;
      assert.ok(Math.abs(read(after, m) - target(m)) <= Math.abs(read(an, m) - target(m)) + 1e-6,
        `${sKey} ${JSON.stringify(recipe)} · ${it.label}: ${m} ${read(an, m).toFixed(2)} → ${read(after, m).toFixed(2)} (objetivo ${target(m)})`);
      checked++;
    }
  }
  assert.ok(checked > 100, `muy pocas sugerencias verificadas (${checked})`);
});

test('ningún crítico de C:N o N queda sin botón y sin explicación', () => {
  for (const { sKey, recipe } of sweep()) {
    for (const it of setup(sKey, recipe).opt.items) {
      const m = metricOf(it);
      if (it.priority !== 'critical' || (m !== 'cn' && m !== 'n') || it.apply) continue;
      assert.ok(it.sameAdjustmentAs || /Ningún otro ingrediente compatible/.test(it.riskIfIgnored || ''),
        `${sKey} ${JSON.stringify(recipe)} · ${it.label}: ${it.action}`);
    }
  }
});

test('una alternativa nunca agrega críticos ni baja el score respecto de la receta actual', () => {
  let alternatives = 0;
  for (const { sKey, recipe } of sweep()) {
    const { evaluate, opt } = setup(sKey, recipe);
    const base = evaluate(recipe);
    for (const it of opt.items.filter(i => i.alternativeFor)) {
      const after = evaluate(RO.applyOptToRecipe(recipe, it.apply, [], cat.INGS));
      assert.ok(critOf(after.an) <= critOf(base.an) && after.score >= base.score, `${sKey} ${JSON.stringify(recipe)} · ${it.label}`);
      assert.notEqual(it.apply.id, it.alternativeFor);
      alternatives++;
    }
  }
  assert.ok(alternatives > 20, `muy pocas alternativas (${alternatives})`);
});

test('regresión: rastrojo de soya sobre su tope ya no propone bajarlo; propone otro ingrediente que baja el C:N', () => {
  const recipe = [{ id: 'paja_trigo', p: 72 }, { id: 'paja_soya', p: 28 }];
  const { evaluate, an, opt } = setup('p_ostreatus_gris', recipe);
  const it = opt.items.find(i => i.label === 'C:N demasiado alto');
  assert.ok(it && it.apply, opt.items.map(i => `${i.label}: ${i.action}`).join(' | '));
  assert.equal(it.alternativeFor, 'paja_soya');
  assert.doesNotMatch(it.action, /Bajar <b>Paja \/ rastrojo de soya/);
  assert.ok(evaluate(RO.applyOptToRecipe(recipe, it.apply, [], cat.INGS)).an.cn < an.cn);
});

test('alternativa respeta bloqueos y, con bodega, prefiere ingredientes en stock', () => {
  const recipe = [{ id: 'paja_trigo', p: 72 }, { id: 'paja_soya', p: 28 }];
  const free = setup('p_ostreatus_gris', recipe).opt.items.find(i => i.label === 'C:N demasiado alto');
  const lockedAlt = setup('p_ostreatus_gris', recipe, { lockedIds: [free.apply.id] }).opt.items.find(i => i.label === 'C:N demasiado alto');
  assert.ok(!lockedAlt.apply || lockedAlt.apply.id !== free.apply.id);
  const stock = new Set(['paja_trigo', 'paja_soya', 'salvado_trigo']);
  const inStock = setup('p_ostreatus_gris', recipe, { stockIds: stock, useStock: true }).opt.items.find(i => i.label === 'C:N demasiado alto');
  assert.ok(inStock.apply, inStock.action);
  assert.ok(stock.has(inStock.apply.id), `con bodega propone ${inStock.apply.id}`);
});

test('ajuste que llega a su tope sin entrar en rango: ofrece completar con un segundo ingrediente', () => {
  const recipe = [{ id: 'aserrin_eucalipto', p: 90 }, { id: 'borra_cafe', p: 10 }];
  const { evaluate, opt } = setup('p_ostreatus_gris', recipe);
  const it = opt.items.find(i => i.label === 'C:N demasiado alto');
  assert.ok(it.capped && it.comboFromCap, it.action);
  assert.equal(it.comboApply.length, 2);
  assert.notEqual(it.comboApply[1].id, it.comboApply[0].id);
  const one = evaluate(RO.applyOptToRecipe(recipe, it.apply, [], cat.INGS));
  const both = evaluate(RO.applyOptToRecipe(recipe, it.comboApply, [], cat.INGS));
  assert.equal(it.comboPredictedScore, both.score);
  assert.ok(both.score > one.score || critOf(both.an) < critOf(one.an));
  assert.match(it.comboLabel, /^Completar con /);
});

test('dos tarjetas con el mismo ajuste: el botón queda en una y la otra la remite', () => {
  for (const { sKey, recipe } of sweep()) {
    const actionable = setup(sKey, recipe).opt.items.filter(i => i.apply && (i.priority === 'critical' || i.priority === 'warning'));
    const keys = actionable.map(i => JSON.stringify(i.apply));
    assert.equal(new Set(keys).size, keys.length, `${sKey} ${JSON.stringify(recipe)}`);
  }
  const items = setup('p_ostreatus_gris', [{ id: 'aserrin_eucalipto', p: 90 }, { id: 'borra_cafe', p: 10 }]).opt.items;
  const n = items.find(i => i.label === 'Nitrógeno insuficiente');
  assert.equal(n.sameAdjustmentAs, 'C:N demasiado alto');
  assert.equal(n.apply, null);
  assert.equal(n.comboApply, null);
});

test('sin alternativa posible lo dice en la tarjeta', () => {
  const it = setup('p_ostreatus_gris', [{ id: 'guadua', p: 70 }, { id: 'borra_cafe', p: 30 }], { lockedIds: ['guadua', 'borra_cafe'], optimizerINGS: cat.INGS.filter(g => ['guadua', 'borra_cafe'].includes(g.id)) }).opt.items.find(i => i.label === 'C:N demasiado alto');
  assert.equal(it.apply, null);
  assert.match(it.action, /no acerca C:N al objetivo/);
  assert.match(it.riskIfIgnored, /Ningún otro ingrediente compatible acerca C:N al objetivo sin empeorar el veredicto/);
});

test('la marca "tope alcanzado" no queda en una alternativa que deja la métrica en rango', () => {
  const { opt, spp } = setup('p_ostreatus_gris', [{ id: 'paja_trigo', p: 72 }, { id: 'paja_soya', p: 28 }]);
  const it = opt.items.find(i => i.label === 'C:N demasiado alto');
  const range = spp.p_ostreatus_gris.cn_optimal;
  const val = parseFloat(it.delta.replace(/[^\d.]+/, ''));
  assert.ok(val >= range.min && val <= range.max, it.delta);
  assert.equal(it.capped, false);
});
