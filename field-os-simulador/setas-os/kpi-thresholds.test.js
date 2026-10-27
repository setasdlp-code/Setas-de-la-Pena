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

test('beKeyFromScientific: solo nombres cientificos con fila en la KB', () => {
  assert.equal(K.beKeyFromScientific('Pleurotus ostreatus'), 'pleurotus_ostreatus');
  assert.equal(K.beKeyFromScientific(' Ganoderma  lucidum '), 'ganoderma_lucidum');
  assert.equal(K.beKeyFromScientific('Pleurotus florida'), null);
  assert.equal(K.beKeyFromScientific(undefined), null);
});

test('worstBeStatus: cada especie contra sus umbrales, devuelve la peor', () => {
  // Ganoderma 12 % cumple su meta (10); Pleurotus 35 % esta bajo su alerta (40).
  const r = K.worstBeStatus([
    { speciesKey: 'ganoderma_lucidum', be: 12 },
    { speciesKey: 'pleurotus_ostreatus', be: 35 },
  ]);
  assert.equal(r.status, 'alert');
  assert.equal(r.speciesKey, 'pleurotus_ostreatus');
  assert.equal(r.bySpecies.find(x => x.speciesKey === 'ganoderma_lucidum').status, 'ok');
  // El numero de lotes de cada especie no cambia el resultado (antes, el promedio de umbrales si).
  const many = K.worstBeStatus([
    { speciesKey: 'ganoderma_lucidum', be: 12 },
    ...Array.from({ length: 5 }, () => ({ speciesKey: 'pleurotus_ostreatus', be: 65 })),
  ]);
  assert.equal(many.status, 'ok');
  // Una Ganoderma sana sola no es alerta (con el escalar 40/55/70 si lo era).
  assert.equal(K.worstBeStatus([{ speciesKey: 'ganoderma_lucidum', be: 12 }]).status, 'ok');
  // Especie sin fila -> fallback; BE ausente se ignora; sin datos -> null.
  const fb = K.worstBeStatus([{ speciesKey: null, be: 50 }, { speciesKey: 'pleurotus_djamor', be: null }]);
  assert.equal(fb.source, 'fallback');
  assert.equal(fb.status, 'warn');
  assert.equal(K.worstBeStatus([]), null);
  assert.equal(K.worstBeStatus([{ speciesKey: 'pleurotus_djamor', be: undefined }]), null);
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

test('la app colorea la contaminacion solo con el semaforo del modulo, sin cortes propios', () => {
  const src = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  // Cortes sueltos (>15, >20, >=20) se desalinean de la KB: todo pasa por contamLevelOf/contamColor.
  assert.doesNotMatch(src, /contPct\s*>=?\s*[1-9]/); // >0 ("tiene contaminacion") si vale
  assert.doesNotMatch(src, /avgCont\s*>=?\s*[1-9]/);
  assert.match(src, /const contamLevelOf=pct=>SetasKpiThresholdsApi\?SetasKpiThresholdsApi\.contamLevel\(pct\):null;/);
  assert.ok((src.match(/contamColor\(/g) || []).length >= 4, 'tabla, ficha, comparativa y resumen de Bitacora');
});

test('Bitacora colorea la EB por especie con nota de literatura, sin cortes fijos', () => {
  const src = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  assert.doesNotMatch(src, /\.be\s*>=?\s*[1-9]/, 'cortes de EB fijos (>80, >60) ignoran la especie');
  assert.ok((src.match(/beColorFor\(lote,stats\?\.be\)/g) || []).length >= 2, 'tabla de lotes y comparador');
  assert.match(src, /beWorstOf\(wd\.map/, 'resumen: peor especie');
  assert.equal((src.match(/\{BE_LIT_NOTE\}<\/div>/g) || []).length, 2, 'nota visible bajo ambas tablas');
  assert.match(src, /lote\.recipeRef\?\.sKey/, 'lotes del Formulador guardan la especie en recipeRef');
  const shell = fs.readFileSync(path.join(__dirname, 'Setas OS v5.dc.html'), 'utf8');
  assert.doesNotMatch(shell, /rendSpp|rendSub|mixThresholds/, 'filas de BE del shell eliminadas (sin vista desde c7257bfd)');
});
