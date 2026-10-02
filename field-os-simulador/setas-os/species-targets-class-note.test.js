'use strict';
// describeSubstrateClass / describeClassChange: explican la clase de sustrato
// y el salto de objetivos en el umbral de suplementación sin cambiar ninguna
// clasificación ni rango (punto 2 del análisis del Perito).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('./species-targets.js');
const { SPP, INGS } = require('./substrate-catalog.js');

const describe = (speciesId, recipe) => T.describeSubstrateClass({ speciesId, recipe, ings: INGS, legacySpp: SPP });
const pajaSalvado = s => (s ? [{ id: 'paja_trigo', p: 100 - s }, { id: 'salvado_trigo', p: s }] : [{ id: 'paja_trigo', p: 100 }]);

test('describeSubstrateClass coincide con la clasificación y los rangos que usa el modelo', () => {
  for (const s of [0, 1, 1.5, 2, 3, 10, 20]) {
    const recipe = pajaSalvado(s);
    const d = describe('p_ostreatus_gris', recipe);
    const resolved = T.applyToSpp(SPP, 'p_ostreatus_gris', recipe, INGS).p_ostreatus_gris.targets;
    assert.equal(d.substrateClass, T.classifySubstrate(recipe, INGS));
    assert.equal(d.resolvedClass, resolved.resolvedClass);
    assert.deepEqual([d.cn.min, d.cn.max], [resolved.cn.min, resolved.cn.max]);
    assert.deepEqual([d.nPct.min, d.nPct.max], [resolved.nPct.min, resolved.nPct.max]);
  }
});

test('orellana a 1,5 % de salvado: paja sin suplementar, aviso de umbral y la clase del otro lado', () => {
  const d = describe('p_ostreatus_gris', pajaSalvado(1.5));
  assert.equal(d.label, 'paja sin suplementar');
  assert.equal(d.supplementPct, 1.5);
  assert.equal(d.thresholdPct, T.SUPPLEMENTED_MIN_PCT);
  assert.equal(d.nearThreshold, true);
  assert.equal(d.alternative.direction, 'above');
  assert.equal(d.alternative.label, 'bolsa suplementada');
  assert.deepEqual([d.alternative.cn.min, d.alternative.cn.max], [25, 50]);
  assert.equal(d.cn.citation, 'Bellettini et al. 2019');
});

test('orellana a 2 % y 3 %: bolsa suplementada, aviso hacia abajo; a 10 % ya no avisa', () => {
  for (const s of [2, 3]) {
    const d = describe('p_ostreatus_gris', pajaSalvado(s));
    assert.equal(d.resolvedClass, 'bag_supplemented');
    assert.equal(d.nearThreshold, true, `s=${s}`);
    assert.equal(d.alternative.direction, 'below');
    assert.equal(d.alternative.label, 'paja sin suplementar');
  }
  assert.equal(describe('p_ostreatus_gris', pajaSalvado(10)).nearThreshold, false);
  assert.equal(describe('p_ostreatus_gris', pajaSalvado(0)).nearThreshold, false);
});

test('los suplementos medios se ponderan como en classifySubstrate', () => {
  const d = describe('p_ostreatus_gris', [{ id: 'paja_trigo', p: 97 }, { id: 'paja_soya', p: 3 }]);
  assert.equal(d.supplementPct, 1.8);
  assert.equal(d.hasMediumSupplement, true);
  assert.equal(d.resolvedClass, 'straw_unsupplemented');
});

test('sin cambio de objetivos al cruzar el umbral no hay alternativa ni aviso', () => {
  // Eryngii solo tiene registro de bolsa suplementada: ambos lados del umbral
  // resuelven a la misma clase, el umbral no cambia ningún rango.
  const e = describe('p_eryngii', pajaSalvado(1.5));
  assert.equal(e.resolvedClass, 'bag_supplemented');
  assert.equal(e.fallback, true);
  assert.equal(e.alternative, null);
  assert.equal(e.nearThreshold, false);
  // Madera dura en orellana: sin registro propio, cae a bolsa suplementada.
  const h = describe('p_ostreatus_gris', [{ id: 'aserrin_alamo', p: 99 }, { id: 'salvado_trigo', p: 1 }]);
  assert.equal(h.substrateLabel, 'bloque de madera dura');
  assert.equal(h.label, 'bolsa suplementada');
  assert.equal(h.alternative, null);
});

test('especie sin registros por clase o receta vacía: null', () => {
  assert.equal(describe('shiitake', [{ id: 'aserrin_roble', p: 100 }]), null);
  assert.equal(describe('p_ostreatus_gris', []), null);
});

test('describeSubstrateClass no altera la clasificación ni los rangos', () => {
  const recipe = pajaSalvado(1.5);
  const before = JSON.stringify(T.applyToSpp(SPP, 'p_ostreatus_gris', recipe, INGS).p_ostreatus_gris);
  describe('p_ostreatus_gris', recipe);
  assert.equal(JSON.stringify(T.applyToSpp(SPP, 'p_ostreatus_gris', recipe, INGS).p_ostreatus_gris), before);
  assert.equal(T.SUPPLEMENTED_MIN_PCT, 2);
});

test('describeClassChange: detecta el cambio paja → bolsa con los rangos nuevos; null si no cambia', () => {
  const targetsOf = r => T.applyToSpp(SPP, 'p_ostreatus_gris', r, INGS).p_ostreatus_gris.targets;
  const change = T.describeClassChange(targetsOf(pajaSalvado(0)), targetsOf([{ id: 'paja_trigo', p: 90 }, { id: 'sms', p: 10 }]));
  assert.equal(change.from.label, 'paja sin suplementar');
  assert.equal(change.to.label, 'bolsa suplementada');
  assert.deepEqual([change.to.cn.min, change.to.cn.max], [25, 50]);
  assert.equal(T.describeClassChange(targetsOf(pajaSalvado(5)), targetsOf(pajaSalvado(10))), null);
  assert.equal(T.describeClassChange(null, targetsOf(pajaSalvado(5))), null);
});
