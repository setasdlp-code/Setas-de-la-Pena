'use strict';
// Vista "Mejor con Bodega": elección de Más producción y Más barata por kg de
// seta, cobertura de Bodega y sugerencias "Para mejorar, conseguir…".
const { test } = require('node:test');
const assert = require('node:assert/strict');
const B = require('./formulador-best.js');

const ann = (key, eb, costPerKgSeta, extra = {}) => ({
  key, recipe: [{ id: key, p: 100 }], eb, band: { low: eb - 20, high: eb + 20, confidence: 'low' },
  costPerDryKg: costPerKgSeta == null ? null : costPerKgSeta * eb / 100, costPerKgSeta,
  unpricedIds: costPerKgSeta == null ? [key] : [], costProvenance: 'catalog',
  requiresAutoclave: false, atModelCap: false, safe: true, ...extra,
});

test('isEbTie: empate solo bajo 1 pt', () => {
  assert.equal(B.EB_TIE_PTS, 1);
  assert.equal(B.isEbTie(120, 119.2), true);
  assert.equal(B.isEbTie(120, 119), false);
});

test('selectPicks ignora candidatas no seguras', () => {
  const r = B.selectPicks([ann('a', 130, 100, { safe: false }), ann('b', 110, 200)]);
  assert.equal(r.produccion.key, 'b');
  assert.equal(r.safeCount, 1);
});

test('selectPicks: empate casi exacto lo gana la más barata', () => {
  const r = B.selectPicks([ann('cara', 120, 900), ann('barata', 119.5, 400), ann('lejos', 100, 100)]);
  assert.equal(r.produccion.key, 'barata');
  assert.equal(r.barata.key, 'lejos');
  assert.equal(r.same, false);
});

test('selectPicks: 2 pts de diferencia no es empate', () => {
  const r = B.selectPicks([ann('alta', 120, 900), ann('baja', 118, 400)]);
  assert.equal(r.produccion.key, 'alta');
  assert.equal(r.barata.key, 'baja');
});

test('selectPicks: todo sin precio deja barata en null', () => {
  const r = B.selectPicks([ann('a', 120, null), ann('b', 110, null)]);
  assert.equal(r.barata, null);
  assert.equal(r.produccion.key, 'a');
});

test('selectPicks: sin candidatas', () => {
  assert.deepStrictEqual(B.selectPicks([]), { produccion: null, barata: null, same: false, safeCount: 0 });
});

test('selectPicks: una receta gana ambas', () => {
  const r = B.selectPicks([ann('a', 120, 100), ann('b', 100, 300)]);
  assert.equal(r.same, true);
});

const INGS = [
  { id: 'aserrin_eucalipto', cost: 200, moisture: 30, role: 'base_carbono' },
  { id: 'salvado_trigo', cost: 1200, moisture: 12, role: 'suplemento_n' },
  { id: 'regalo', cost: 0, moisture: 10, role: 'aireador' },
];
const cand = (recipe, eb, { safety = 80, allowed = true } = {}) => ({
  id: 'x', recipe,
  evaluation: {
    allowed, dimensions: { safety: { score: safety } },
    analysis: { eb, sp: {} }, uncertainty: { eb: { low: eb - 26, high: eb + 26, confidence: 'low' } },
  },
});
const opts = (col = 'thermal') => ({
  ingredients: INGS, invLotes: [], ebOptimal: 130, sKey: 'p_ostreatus_gris', spp: {},
  calcTreatment: () => ({ col }),
});

test('annotateCandidate: costo, banda, seguridad', () => {
  const a = B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 80 }, { id: 'salvado_trigo', p: 20 }], 100), opts());
  assert.equal(a.eb, 100);
  assert.deepStrictEqual(a.band, { low: 74, high: 126, confidence: 'low' });
  assert.ok(a.costPerDryKg > 0);
  assert.equal(a.costPerKgSeta, a.costPerDryKg);
  assert.equal(a.safe, true);
  assert.equal(a.requiresAutoclave, false);
  assert.equal(a.atModelCap, false);
  assert.equal(B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 100 }], 100, { safety: 44 }), opts()).safe, false);
  assert.equal(B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 100 }], 100, { allowed: false }), opts()).safe, false);
});

test('annotateCandidate: autoclave y tope del modelo', () => {
  const a = B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 100 }], 129.97), opts('autoclave'));
  assert.equal(a.requiresAutoclave, true);
  assert.equal(a.atModelCap, true);
});

test('annotateCandidate: insumo sin precio no es gratis', () => {
  const a = B.annotateCandidate(cand([{ id: 'aserrin_eucalipto', p: 90 }, { id: 'regalo', p: 10 }], 100), opts());
  assert.equal(a.costPerKgSeta, null);
  assert.deepStrictEqual(a.unpricedIds, ['regalo']);
});

test('reasonLine: textos numéricos sin tuteo', () => {
  const prod = ann('p', 129.4, 3990);
  const bar = ann('b', 125.1, 2060);
  assert.equal(B.reasonLine(prod, bar, 'produccion'), 'EB +4 pts sobre la más barata · $1.930 más por kg de seta');
  assert.equal(B.reasonLine(bar, prod, 'barata'), '$1.930 menos por kg de seta · EB −4 pts');
  assert.equal(B.reasonLine(prod, prod, 'produccion'), 'Más producción y más barata a la vez');
  assert.equal(B.reasonLine(ann('t', 120.2, 500), ann('u', 120, 500.4), 'produccion'), 'EB igual a la más barata · $ igual por kg de seta');
  assert.equal(B.reasonLine(ann('t', 120.2, 500), ann('u', 120, 500.4), 'barata'), '$ igual por kg de seta · EB igual');
});
