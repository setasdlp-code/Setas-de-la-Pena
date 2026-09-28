'use strict';
// Las formulaciones validadas de knowledge_base/01_species/*.md deben caer dentro de
// sus propios objetivos. Este test habría detectado el conflicto eryngii C:N 40–65.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractConsts } = require('./test-support/jsx-extract.js');
const { analyze } = require('./recipe-optimizer.js');
const T = require('./species-targets.js');

const { SPP, INGS } = extractConsts(['SPP', 'INGS']);

const KB_FORMULATIONS = [
  { source: 'pleurotus_eryngii.md · Fórmula A (roble)', speciesId: 'p_eryngii', recipe: [
    { id: 'aserrin_roble', p: 45 }, { id: 'salvado_trigo', p: 25 }, { id: 'cascarilla_soya', p: 15 },
    { id: 'cascarilla_arroz', p: 10 }, { id: 'carbonato_calcio', p: 3 }, { id: 'yeso', p: 2 }] },
  { source: 'pleurotus_eryngii.md · Fórmula B', speciesId: 'p_eryngii', recipe: [
    { id: 'tusa_maiz', p: 40 }, { id: 'paja_trigo', p: 15 }, { id: 'afrecho_cerveceria', p: 20 },
    { id: 'salvado_trigo', p: 15 }, { id: 'cascarilla_arroz', p: 5 }, { id: 'carbonato_calcio', p: 3 }, { id: 'yeso', p: 2 }] },
];

for (const f of KB_FORMULATIONS) {
  test(`${f.source} cae dentro de sus objetivos resueltos`, () => {
    const spp = T.applyToSpp(SPP, f.speciesId, f.recipe, INGS);
    const t = spp[f.speciesId].targets;
    const a = analyze(f.recipe, f.speciesId, INGS, spp);
    assert.ok(a.cn >= t.cn.min && a.cn <= t.cn.max, `C:N ${a.cn.toFixed(1)} fuera de ${t.cn.min}–${t.cn.max}`);
    assert.ok(a.avgN >= t.nPct.min && a.avgN <= t.nPct.max, `N ${a.avgN.toFixed(2)} fuera de ${t.nPct.min}–${t.nPct.max}`);
    assert.ok(a.suppP <= t.supplementationMaxPct.value, `suplementación ${a.suppP} > ${t.supplementationMaxPct.value}`);
    assert.equal(a.trichoderma, false);
  });
}
