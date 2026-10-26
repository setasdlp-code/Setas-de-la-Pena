const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const K = require('./kpi-thresholds.js');

test('umbrales de BE por especie coinciden con la tabla de la KB', () => {
  const kb = fs.readFileSync(path.join(__dirname, '../../knowledge_base/06_operations/production_schedule.md'), 'utf8');
  const rows = { pleurotus_ostreatus: 'P. ostreatus', pleurotus_djamor: 'P. djamor', lentinula_edodes: 'Shiitake', hericium_erinaceus: 'Hericium', ganoderma_lucidum: 'Ganoderma' };
  for (const [key, label] of Object.entries(rows)) {
    const line = kb.split('\n').find(l => l.startsWith('| ' + label));
    assert.ok(line, `fila ${label} en la KB`);
    const [alert, target, optimal] = line.split('|').slice(2, 5).map(c => Number(c.trim()));
    assert.deepEqual({ alert: K.BE_THRESHOLDS[key].alert, target: K.BE_THRESHOLDS[key].target, optimal: K.BE_THRESHOLDS[key].optimal }, { alert, target, optimal }, key);
  }
});

test('especie desconocida o ausente cae a 40/55/70', () => {
  for (const k of ['nope', undefined, null, 'toString']) {
    const t = K.beThresholds(k);
    assert.deepEqual([t.alert, t.target, t.optimal, t.source], [40, 55, 70, 'fallback']);
  }
});

test('classifyBe respeta los cortes por especie', () => {
  const gan = K.beThresholds('ganoderma_lucidum');
  assert.equal(K.classifyBe(12, gan), 'ok');
  assert.equal(K.classifyBe(15, gan), 'optimal');
  assert.equal(K.classifyBe(4.9, gan), 'alert');
  const ost = K.beThresholds('pleurotus_ostreatus');
  assert.equal(K.classifyBe(79.9, ost), 'ok');
  assert.equal(K.classifyBe(80, ost), 'optimal');
  assert.equal(K.classifyBe(59, ost), 'warn');
  assert.equal(K.classifyBe(39, ost), 'alert');
  assert.equal(K.classifyBe(NaN, ost), null);
  assert.equal(K.classifyBe(60), 'ok');
});

test('mixThresholds: una especie = la suya; mezcla = promedio; vacio = fallback', () => {
  assert.deepEqual(K.mixThresholds(['pleurotus_djamor']), { alert: 30, target: 50, optimal: 70, source: 'species' });
  const m = K.mixThresholds(['pleurotus_djamor', 'pleurotus_ostreatus']);
  assert.deepEqual([m.alert, m.target, m.optimal], [35, 55, 75]);
  assert.equal(K.mixThresholds([]).source, 'fallback');
  assert.equal(K.mixThresholds(['x', 'pleurotus_djamor']).source, 'mixed');
});

test('contamLevel: verde <=5, ambar >5-10, rojo >10, parada >=15', () => {
  const cases = [[0, 'green'], [5, 'green'], [5.1, 'amber'], [10, 'amber'], [10.1, 'red'], [14.9, 'red'], [15, 'stop'], [40, 'stop']];
  for (const [pct, lvl] of cases) assert.equal(K.contamLevel(pct), lvl, String(pct));
  for (const bad of [null, undefined, '', NaN, -1, 'x']) assert.equal(K.contamLevel(bad), null, String(bad));
});

test('los niveles de contaminacion coinciden con la KB', () => {
  const kb = fs.readFileSync(path.join(__dirname, '../../knowledge_base/02_substrates/contamination.md'), 'utf8');
  assert.match(kb, /\| Verde \| ≤5 %/);
  assert.match(kb, /\| Ámbar \| 5–10 %/);
  assert.match(kb, /\| Rojo \| >10 %/);
  assert.match(kb, /\| Crítico \| ≥15–20 %/);
});
