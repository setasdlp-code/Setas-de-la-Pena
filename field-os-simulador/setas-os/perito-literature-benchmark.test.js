'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const B = require('./perito-literature-benchmark.js');

const tmp = (content) => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lit-')), 'b.json');
  if (content !== undefined) fs.writeFileSync(f, typeof content === 'string' ? content : JSON.stringify(content));
  return f;
};
const entry = (extra = {}) => ({ id: 'e1', study: 'S', sKey: 'shiitake', recipe: [{ id: 'aserrin_roble', p: 80 }, { id: 'salvado_trigo', p: 20 }], ebReported: 60, useInMetrics: true, ...extra });

test('benchmark ausente, vacío o inválido sale con 1, nunca con 0', () => {
  assert.equal(B.run({ file: tmp() }).exit, B.EXIT.NO_BENCHMARK);
  assert.equal(B.run({ file: tmp({ entries: [] }) }).exit, B.EXIT.NO_BENCHMARK);
  assert.equal(B.run({ file: tmp('{no') }).exit, B.EXIT.NO_BENCHMARK);
});

test('una entrada no evaluable ensucia la corrida salvo que se acepte explícitamente', () => {
  const file = tmp({ entries: [entry(), entry({ id: 'e2', recipe: [{ id: 'no_existe', p: 100 }] })] });
  const out = B.run({ file });
  assert.equal(out.exit, B.EXIT.DIRTY);
  assert.deepEqual(out.unevaluable.map((x) => x.id), ['e2']);
  assert.equal(B.run({ file, allowSkipped: true }).exit, B.EXIT.OK);
});

test('las exclusiones declaradas se reportan y no entran en las métricas', () => {
  const out = B.run({ file: tmp({ entries: [entry(), entry({ id: 'z', useInMetrics: false, excludedReason: 'denominador' })] }) });
  assert.equal(out.exit, B.EXIT.OK);
  assert.deepEqual(out.excluded, [{ id: 'z', reason: 'denominador' }]);
  assert.equal(out.variants[0].rows.length, 1);
});

test('la cobertura usa la banda visible de scoring', () => {
  const out = B.run({ file: tmp({ entries: [entry()] }) });
  const scoring = require('./scoring.js');
  const { analyze } = require('./substrate-analysis.js');
  const band = scoring.scoreRecipe(analyze(entry().recipe, 'shiitake'), { historyCalibration: null, __bridgeRecompute: true }).uncertainty.eb;
  assert.deepEqual(out.variants[0].rows[0].band, { low: band.low, high: band.high });
});

test('el benchmark del repo: Zhou excluida, H-B fuera de límites por presets de otras especies', () => {
  const out = B.run({ file: path.join(__dirname, 'literature-eb-benchmark.json') });
  assert.equal(out.exit, B.EXIT.OK);
  assert.ok(out.excluded.some((x) => x.id.startsWith('zhou2025')));
  const hb = out.variants.find((v) => v.key === 'H-B');
  assert.equal(hb.limits.withinLimits, false);
  assert.ok(hb.limits.presetShiftsOverLimit.some((s) => s.id === 'melena_leon_bioest'));
  assert.ok(out.header.includes('No valida'));
});

test('las variantes no modifican el catálogo de producción', () => {
  const cat = require('./substrate-catalog.js');
  const before = JSON.stringify(cat.INGS.find((g) => g.id === 'aserrin_roble'));
  B.run({ file: path.join(__dirname, 'literature-eb-benchmark.json') });
  assert.equal(JSON.stringify(cat.INGS.find((g) => g.id === 'aserrin_roble')), before);
});
