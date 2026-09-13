'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
globalThis.SetasSpeciesTargets = require('./species-targets.js');
globalThis.SetasRecipeVersion = require('./recipe-version.js');

// DENSOS es un `const` local dentro de `analyze` (no de nivel superior) — no se
// puede extraer con `extractConsts`, y `analyze` no lo necesita desde afuera.
const X = extractConsts(['SPP', 'INGS', 'DEFAULT_FRESH_PRICES', 'calcBatch', 'EB_PENALTY_BALANCE_BAND', 'SetasSpeciesTargetsApi', 'analyze', 'diagnose']);
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
  // diagnose(a,sKey) devuelve {main,sugs} — los mensajes viven en .sugs.
  const msgs = X.diagnose(X.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp), 'p_eryngii').sugs.map(m => m.tx);
  assert.ok(!msgs.some(t => /^C:N (bajo|alto)/.test(t)), msgs.join(' | '));
  assert.ok(msgs.some(t => /C:N óptimo/.test(t)));
});

test('diagnose cita la humedad objetivo resuelta, no un literal (D5)', () => {
  const spp = T.applyToSpp(X.SPP, 'p_eryngii', FORMULA_A, X.INGS);
  const msgs = X.diagnose(X.analyze(FORMULA_A, 'p_eryngii', X.INGS, spp), 'p_eryngii').sugs.map(m => m.tx);
  assert.ok(!msgs.some(t => /67–68%/.test(t)), 'literal 67–68% debe desaparecer');
  assert.ok(msgs.some(t => /humedad objetivo 65%/.test(t)));
});

test('diagnose marca "(objetivo genérico)" en la humedad cuando la clase de sustrato cae al objetivo por defecto (I3)', () => {
  const STRAW = [{ id: 'paja_trigo', p: 97 }, { id: 'carbonato_calcio', p: 3 }];
  const sppStraw = T.applyToSpp(X.SPP, 'p_eryngii', STRAW, X.INGS);
  assert.equal(sppStraw.p_eryngii.targets.fallback, true);
  const tenjo = sp => X.diagnose(X.analyze(sp === sppStraw ? STRAW : FORMULA_A, 'p_eryngii', X.INGS, sp), 'p_eryngii').sugs.map(m => m.tx).find(t => /^Tenjo/.test(t));
  assert.match(tenjo(sppStraw), /humedad objetivo 65% \(objetivo genérico\)/);
  const sppA = T.applyToSpp(X.SPP, 'p_eryngii', FORMULA_A, X.INGS);
  assert.doesNotMatch(tenjo(sppA), /objetivo genérico|heredado/);
});

// ── Regresión: calcBatch.freshPriceKg no debe colapsar a 0 cuando no hay
// override de precio (D6). vegPrice en el Formulador ahora es `null` por
// defecto — si esta guarda vuelve a tratar null/undefined como "$0 válido"
// en vez de "sin override", la proyección de ingresos se rompe en silencio
// para todo el mundo que no haya tecleado un precio manual. ──
test('calcBatch.freshPriceKg cae al precio por defecto de la especie cuando customFreshPrice es null', () => {
  const b = X.calcBatch(FORMULA_A, 6, 1.5, 65, 12000, X.INGS, 8, null, 85, 'p_eryngii', null);
  assert.equal(b.freshPriceKg, X.DEFAULT_FRESH_PRICES.p_eryngii);
});

test('calcBatch.freshPriceKg cae al precio por defecto de la especie cuando customFreshPrice es undefined', () => {
  const b = X.calcBatch(FORMULA_A, 6, 1.5, 65, 12000, X.INGS, 8, null, 85, 'p_eryngii', undefined);
  assert.equal(b.freshPriceKg, X.DEFAULT_FRESH_PRICES.p_eryngii);
});

test('calcBatch.freshPriceKg respeta un override positivo explícito', () => {
  const b = X.calcBatch(FORMULA_A, 6, 1.5, 65, 12000, X.INGS, 8, null, 85, 'p_eryngii', 30000);
  assert.equal(b.freshPriceKg, 30000);
});

test('calcBatch.freshPriceKg con override explícito en 0 usa 0 (comportamiento actual de la guarda: 0 es un valor válido, no "sin override")', () => {
  const b = X.calcBatch(FORMULA_A, 6, 1.5, 65, 12000, X.INGS, 8, null, 85, 'p_eryngii', 0);
  assert.equal(b.freshPriceKg, 0);
});
