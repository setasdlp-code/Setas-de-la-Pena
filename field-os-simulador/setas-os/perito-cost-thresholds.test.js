'use strict';
// Umbrales de costo sin fuente. El panel calificaba el costo por kg seco contra
// $800/$2.000 ("Ajustar" en 2 de cada 3 recetas del catálogo, mediana $2.547),
// el Generador manual contra $1.000, y el tip "Oportunidad de costo" se activaba
// con costo > $800 y solo proponía suplementos de menos de $700 (95 % de las
// recetas). La base de conocimiento no tiene objetivo de costo con fuente
// (07_business/pricing.md: costo por kg desconocido; la comparación válida es
// COP/kg vendible con lotes reales). scoring.js no se toca: afecta veredicto y
// ranking y queda pendiente hasta tener ese dato.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = require('./species-targets.js');
const RO = require('./recipe-optimizer.js');
const cat = require('./substrate-catalog.js');
Object.assign(globalThis, cat);
globalThis.SetasScoring = require('./scoring.js');
const { analyze } = require('./substrate-analysis.js');

const SK = 'p_ostreatus_gris';
const RECIPE = [{ id: 'paja_trigo', p: 84 }, { id: 'salvado_trigo', p: 15 }, { id: 'yeso', p: 1 }];
const run = (recipe, stockIds, lockedIds = []) => {
  const spp = T.applyToSpp(cat.SPP, SK, recipe, cat.INGS);
  const an = analyze(recipe, SK, cat.INGS, spp);
  return RO.generateOptimizer(an, SK, stockIds, recipe, cat.INGS, lockedIds, an.eb, true, {}, spp, {});
};
const tipOf = o => o.items.find(i => i.label === 'Oportunidad de costo');
const ing = id => cat.INGS.find(g => g.id === id);
const costPerKgN = g => (g.cost / Math.max(0.08, 1 - Math.min(0.92, (g.moisture || 0) / 100))) / (g.n / 100);

test('sin bodega no hay "Oportunidad de costo" (antes salía en el 95 % de las recetas)', () => {
  assert.equal(tipOf(run(RECIPE, new Set())), undefined);
  assert.equal(tipOf(run(RECIPE, new Set(['paja_trigo', 'salvado_trigo', 'yeso']))), undefined);
});

test('aparece solo si en bodega hay un suplemento compatible que aporta N más barato', () => {
  const it = tipOf(run(RECIPE, new Set(['paja_trigo', 'salvado_trigo', 'yeso', 'estierc_gallina_deshid'])));
  assert.ok(it, 'debe aparecer con estiércol de gallina en bodega');
  assert.equal(it.costComparison.altId, 'estierc_gallina_deshid');
  assert.equal(it.costComparison.currentId, 'salvado_trigo');
  assert.ok(Math.abs(it.costComparison.altCostPerKgN - costPerKgN(ing('estierc_gallina_deshid'))) < 1e-6);
  assert.ok(it.costComparison.altCostPerKgN < it.costComparison.currentCostPerKgN);
  assert.match(it.action, /en bodega/);
  assert.equal(it.apply, null);
});

test('no propone suplementos incompatibles con la especie, bloqueados ni ya presentes', () => {
  // Harina de soya no es compatible con orellana en el catálogo.
  assert.equal(tipOf(run(RECIPE, new Set(['paja_trigo', 'salvado_trigo', 'yeso', 'harina_soya']))), undefined);
  const stock = new Set(['paja_trigo', 'salvado_trigo', 'yeso', 'estierc_gallina_deshid']);
  assert.equal(tipOf(run(RECIPE, stock, ['estierc_gallina_deshid'])), undefined);
  const withIt = [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 10 }, { id: 'estierc_gallina_deshid', p: 9 }, { id: 'yeso', p: 1 }];
  assert.equal(tipOf(run(withIt, stock)), undefined);
});

test('sin suplemento de N en la receta no hay comparación', () => {
  assert.equal(tipOf(run([{ id: 'paja_trigo', p: 100 }], new Set(['paja_trigo', 'estierc_gallina_deshid']))), undefined);
});

test('el código ya no juzga el costo contra $800, $700, $1.000 ni $2.000', () => {
  const opt = fs.readFileSync(path.join(__dirname, 'recipe-optimizer.js'), 'utf8');
  assert.doesNotMatch(opt, /an\.cost\s*>\s*800/);
  assert.doesNotMatch(opt, /g\.cost\s*<\s*700/);
  const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  assert.doesNotMatch(jsx, /cost\s*<\s*800|cost\s*<\s*2000|cost\s*<\s*1000/);
  assert.match(jsx, /data-testid="metric-no-target"/);
  assert.match(jsx, /\{l:'Costo \/ kg seco',.*neutral:true/);
});

test('scoring.js conserva sus tramos de costo (pendiente: requiere COP/kg vendible real)', () => {
  const scoring = fs.readFileSync(path.join(__dirname, 'scoring.js'), 'utf8');
  assert.match(scoring, /\{ below: 800, score: 100 \}/);
});
