'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('./harvest-quality-criteria.js');

const REPO = path.resolve(__dirname, '../..');
const kb = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');
const normalize = (s) => s.replace(/\s+/g, ' ').toLowerCase();

test('cada criterio documentado cita literalmente el documento de la KB', () => {
  const shiitake = C.criteriaFor('shiitake');
  assert.equal(shiitake.status, 'documented');
  const text = normalize(kb(shiitake.source.file));
  assert.ok(text.includes('clasificación del producto'), 'sección citada');
  Object.values(shiitake.grades).forEach((grade) => {
    assert.ok(text.includes(normalize(grade.kbLabel)), `la KB nombra "${grade.kbLabel}"`);
    grade.criteria.forEach((line) => assert.ok(text.includes(normalize(line)), `criterio no encontrado en la KB: ${line}`));
  });
  // La KB dice que NO hay umbrales numéricos: la tabla no debe inventarlos.
  assert.equal(shiitake.numericThresholds, null);
  assert.ok(text.includes(normalize(shiitake.thresholdNote)));
});

test('eryngii: criterio parcial (solo grado A por peso de unidad), citado de la ficha de especie', () => {
  const e = C.criteriaFor('p_eryngii');
  assert.equal(e.status, 'partial');
  const text = normalize(kb(e.source.file));
  assert.ok(text.includes(normalize('Grado A > 80 g por unidad')));
  assert.deepEqual(Object.keys(e.grades), ['primera']);
  // Sin criterio para segunda ni descarte.
  assert.equal(e.grades.segunda, undefined);
});

test('una especie sin criterio documentado se declara undocumented; nunca se inventa un umbral', () => {
  ['p_ostreatus_gris', 'p_ostreatus_blanco', 'p_djamor_rosa', 'lions_mane', 'reishi', 'enoki', 'nameko', 'especie_desconocida', '', null, undefined].forEach((key) => {
    const c = C.criteriaFor(key);
    assert.equal(c.status, 'undocumented', String(key));
    assert.equal(c.numericThresholds, null);
    assert.deepEqual(Object.keys(c.grades), []);
    assert.equal(c.source, null);
  });
  assert.match(C.criteriaFor('p_djamor_rosa').thresholdNote, /retirados/);
});

test('el informe de vacíos lista toda especie del catálogo sin criterio completo', () => {
  const gaps = C.gapReport().map((g) => g.speciesKey);
  assert.deepEqual(gaps.sort(), ['enoki', 'lions_mane', 'nameko', 'p_djamor_rosa', 'p_eryngii', 'p_ostreatus_blanco', 'p_ostreatus_gris', 'reishi']);
  assert.equal(C.gapReport().find((g) => g.speciesKey === 'p_eryngii').status, 'partial');
  assert.ok(!gaps.includes('shiitake'));
});

test('SPECIES_KEYS coincide con las especies del catálogo (ninguna queda fuera del informe)', () => {
  const catalog = fs.readFileSync(path.join(__dirname, 'substrate-catalog.js'), 'utf8');
  const spp = catalog.slice(catalog.indexOf('const SPP={'), catalog.indexOf('const SPP={') + 6000);
  const keys = [...spp.matchAll(/^\s{2}([a-z_]+):\{name:/gm)].map((m) => m[1]);
  assert.deepEqual([...C.SPECIES_KEYS].sort(), keys.sort());
});

test('no se usa «Grade A Yield ≥ 80 %» como umbral (hipótesis no aprobada)', () => {
  const src = fs.readFileSync(path.join(__dirname, 'harvest-quality-criteria.js'), 'utf8');
  assert.ok(!/minFirstGradePct|gradeAYieldTarget/.test(src));
  Object.values(C.REGISTRY).forEach((entry) => assert.ok(!JSON.stringify(entry).includes('80 %')));
});

test('resolveSpeciesKey: clave directa, receta vinculada o nombre exacto del catálogo; nunca por parecido', () => {
  const spp = { shiitake: { name: 'Shiitake' }, p_ostreatus_gris: { name: 'Orellana Gris' } };
  assert.equal(C.resolveSpeciesKey({ sKey: 'shiitake' }, spp), 'shiitake');
  assert.equal(C.resolveSpeciesKey({ recipeRef: { sKey: 'p_eryngii' } }, spp), 'p_eryngii');
  assert.equal(C.resolveSpeciesKey({ especie: 'Orellana Gris' }, spp), 'p_ostreatus_gris');
  assert.equal(C.resolveSpeciesKey({ especie: 'orellana gris' }, spp), null);
  assert.equal(C.resolveSpeciesKey({ especie: 'Shiitake' }), null, 'sin catálogo no se adivina');
  assert.equal(C.resolveSpeciesKey({ sKey: 'inexistente' }, spp), null);
  assert.equal(C.resolveSpeciesKey(null, spp), null);
});
