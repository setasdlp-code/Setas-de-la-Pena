'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
globalThis.SetasSpeciesTargets = require('./species-targets.js');
globalThis.SetasRecipeVersion = require('./recipe-version.js');

// DENSOS es un `const` local dentro de `analyze` (no de nivel superior) — no se
// puede extraer con `extractConsts`, y `analyze` no lo necesita desde afuera.
const X = extractConsts(['SPP', 'INGS', 'EB_PENALTY_BALANCE_BAND', 'analyze', 'diagnose']);
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
