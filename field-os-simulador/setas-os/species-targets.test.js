'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('./species-targets.js');

const INGS = [
  { id: 'paja_trigo', role: 'base_carbono' },
  { id: 'aserrin_roble', role: 'base_carbono' },
  { id: 'salvado_trigo', role: 'suplemento_n' },
  { id: 'cascarilla_arroz', role: 'aireador' },
  { id: 'carbonato_calcio', role: 'aditivo_ph' },
];
const LEGACY = {
  p_eryngii: { name: 'Seta de Cardo', cn_optimal: { min: 40, max: 65, ideal: 50 }, n_optimal: { min: 0.8, max: 1.6, ideal: 1.2 }, ph_optimal: { min: 5.5, max: 7.0 }, moisture: { ideal: 63 }, eb_baseline: 60, eb_optimal: 90, supplementation_max: 25, spawn_rate: 5 },
  p_ostreatus_gris: { name: 'Orellana Gris', cn_optimal: { min: 25, max: 50, ideal: 35 }, n_optimal: { min: 0.8, max: 2.0, ideal: 1.4 }, ph_optimal: { min: 6.0, max: 7.5 }, moisture: { ideal: 65 }, eb_baseline: 90, eb_optimal: 130, supplementation_max: 20, spawn_rate: 8 },
  shiitake: { name: 'Shiitake', cn_optimal: { min: 35, max: 70, ideal: 50 }, n_optimal: { min: 0.6, max: 1.2, ideal: 0.9 }, ph_optimal: { min: 5.0, max: 6.0 }, moisture: { ideal: 60 }, eb_baseline: 50, eb_optimal: 100, supplementation_max: 20, spawn_rate: 5 },
  enoki: { name: 'Enoki', cn_optimal: { min: 25, max: 40, ideal: 27 }, n_optimal: { min: 1.2, max: 2.5, ideal: 1.8 }, ph_optimal: { min: 5.0, max: 7.0 }, moisture: { ideal: 65 }, eb_baseline: 60, eb_optimal: 90, supplementation_max: 30, spawn_rate: 10 },
  reishi: { name: 'Reishi', cn_optimal: { min: 35, max: 65, ideal: 50 }, n_optimal: { min: 0.7, max: 1.2, ideal: 0.9 }, ph_optimal: { min: 4.5, max: 6.0 }, moisture: { ideal: 60 }, eb_baseline: 30, eb_optimal: 60, supplementation_max: 15, spawn_rate: 5 },
};

test('classifySubstrate: suplementado ≥ 2% → bag_supplemented', () => {
  assert.equal(T.classifySubstrate([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], INGS), 'bag_supplemented');
});
test('classifySubstrate: sin suplemento y base mayoritaria de madera dura → hardwood_block', () => {
  assert.equal(T.classifySubstrate([{ id: 'aserrin_roble', p: 90 }, { id: 'cascarilla_arroz', p: 10 }], INGS), 'hardwood_block');
});
test('classifySubstrate: sin suplemento y base de paja → straw_unsupplemented', () => {
  assert.equal(T.classifySubstrate([{ id: 'paja_trigo', p: 98 }, { id: 'carbonato_calcio', p: 2 }], INGS), 'straw_unsupplemented');
});
test('classifySubstrate: receta vacía → null', () => {
  assert.equal(T.classifySubstrate([], INGS), null);
});

test('resolveTargets: eryngii bag_supplemented usa literatura (Li 2024), no los valores heredados', () => {
  const r = T.resolveTargets({ speciesId: 'p_eryngii', substrateClass: 'bag_supplemented', legacySpp: LEGACY });
  assert.equal(r.fallback, false);
  assert.equal(r.basis, 'mix_dry_excl_additives');
  assert.deepEqual([r.cn.min, r.cn.max, r.cn.ideal], [25, 40, 28]);
  assert.equal(r.cn.source, 'literature');
  assert.deepEqual(r.cn.citations, ['li2024']);
  assert.deepEqual([r.nPct.min, r.nPct.max], [1.2, 1.8]);
  assert.equal(r.supplementationMaxPct.value, 55);
  assert.equal(r.ph.source, 'legacy_unverified');
  assert.deepEqual([r.ph.min, r.ph.max], [5.5, 7.0]);
  assert.equal(r.eb.source, 'legacy_unverified');
});
test('resolveTargets: clase sin registro cae a defaultClass y marca fallback', () => {
  const r = T.resolveTargets({ speciesId: 'p_eryngii', substrateClass: 'straw_unsupplemented', legacySpp: LEGACY });
  assert.equal(r.fallback, true);
  assert.equal(r.resolvedClass, 'bag_supplemented');
  assert.equal(r.cn.max, 40);
});
test('resolveTargets: ostreatus paja sin suplementar admite C:N de paja (50–100)', () => {
  const r = T.resolveTargets({ speciesId: 'p_ostreatus_gris', substrateClass: 'straw_unsupplemented', legacySpp: LEGACY });
  assert.deepEqual([r.cn.min, r.cn.max], [50, 100]);
  assert.equal(r.nPct.max, 1.5);
  assert.equal(r.fallback, false);
});
test('resolveTargets: especie sin registros → todo legacy_unverified y fallback', () => {
  const r = T.resolveTargets({ speciesId: 'shiitake', substrateClass: 'hardwood_block', legacySpp: LEGACY });
  assert.equal(r.fallback, true);
  for (const k of ['cn', 'nPct', 'ph', 'moisture', 'supplementationMaxPct', 'eb']) assert.equal(r[k].source, 'legacy_unverified', k);
  assert.deepEqual([r.cn.min, r.cn.max, r.cn.ideal], [35, 70, 50]);
});
test('resolveTargets: enoki C:N con literatura (Han 2024) y reishi pH/humedad desde KB', () => {
  const e = T.resolveTargets({ speciesId: 'enoki', substrateClass: 'bag_supplemented', legacySpp: LEGACY });
  assert.equal(e.cn.source, 'literature'); assert.equal(e.cn.tier, 'high'); assert.equal(e.cn.ideal, 27);
  const r = T.resolveTargets({ speciesId: 'reishi', substrateClass: 'hardwood_block', legacySpp: LEGACY });
  assert.equal(r.ph.source, 'kb'); assert.deepEqual([r.ph.min, r.ph.max], [4.2, 5.3]);
  assert.equal(r.moisture.source, 'kb'); assert.equal(r.moisture.ideal, 67);
});
test('resolveTargets: especie desconocida → null', () => {
  assert.equal(T.resolveTargets({ speciesId: 'nope', substrateClass: null, legacySpp: LEGACY }), null);
});
test('toSppEntry conserva claves heredadas y sobreescribe objetivos', () => {
  const r = T.resolveTargets({ speciesId: 'p_eryngii', substrateClass: 'bag_supplemented', legacySpp: LEGACY });
  const e = T.toSppEntry(LEGACY.p_eryngii, r);
  assert.equal(e.name, 'Seta de Cardo'); assert.equal(e.spawn_rate, 5);
  assert.deepEqual(e.cn_optimal, { min: 25, max: 40, ideal: 28 });
  assert.deepEqual(e.n_optimal, { min: 1.2, max: 1.8, ideal: 1.7 });
  assert.deepEqual(e.moisture, { ideal: 65, min: 63, max: 68 });
  assert.equal(e.supplementation_max, 55);
  assert.equal(e.targets, r);
});
test('toSppEntry no inventa min/max de humedad cuando el heredado no los tiene', () => {
  const r = T.resolveTargets({ speciesId: 'shiitake', substrateClass: null, legacySpp: LEGACY });
  assert.deepEqual(T.toSppEntry(LEGACY.shiitake, r).moisture, { ideal: 60 });
});
test('applyToSpp no muta el SPP original y clasifica por receta', () => {
  const recipe = [{ id: 'aserrin_roble', p: 60 }, { id: 'salvado_trigo', p: 40 }];
  const out = T.applyToSpp(LEGACY, 'p_eryngii', recipe, INGS);
  assert.notEqual(out, LEGACY);
  assert.equal(LEGACY.p_eryngii.cn_optimal.max, 65);
  assert.equal(out.p_eryngii.cn_optimal.max, 40);
  assert.equal(out.p_eryngii.targets.substrateClass, 'bag_supplemented');
  assert.equal(out.shiitake, LEGACY.shiitake);
});
test('toda cita referenciada existe en CITATIONS', () => {
  for (const sp of Object.keys(LEGACY)) for (const cls of [null, 'bag_supplemented', 'straw_unsupplemented', 'hardwood_block']) {
    const r = T.resolveTargets({ speciesId: sp, substrateClass: cls, legacySpp: LEGACY });
    for (const k of ['cn', 'nPct', 'ph', 'moisture', 'supplementationMaxPct', 'eb']) {
      for (const c of r[k].citations) if (r[k].source === 'literature') assert.ok(T.CITATIONS[c], `${sp}.${k} cita ${c}`);
    }
  }
});
test('el módulo puede evaluarse de nuevo sin redeclarar globals', () => {
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, 'species-targets.js'), 'utf8');
  new Function(src)(); new Function(src)();
  assert.ok(globalThis.SetasSpeciesTargets.resolveTargets);
});
