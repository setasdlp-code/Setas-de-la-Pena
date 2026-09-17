'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const optimizer = require('./recipe-optimizer.js');

// Si falla con ReferenceError por otra constante de nivel superior que analyze usa,
// añade su nombre a esta lista (antes de 'analyze').
const JSX = extractConsts(['SPP', 'INGS', 'EB_PENALTY_BALANCE_BAND', 'analyze']);

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
