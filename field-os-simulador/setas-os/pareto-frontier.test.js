import test from 'node:test';
import assert from 'node:assert/strict';
import optimizer from './recipe-optimizer.js';

const SPP = {
  p_ostreatus_gris: {
    name: 'Orellana Gris',
    cn_optimal: { min: 25, ideal: 32, max: 45 },
    n_optimal: { min: 0.9, ideal: 1.3, max: 1.9 },
    eb_baseline: 65,
    eb_optimal: 95,
    supplementation_max: 20
  },
  p_djamor_rosada: {
    name: 'Orellana Rosada',
    cn_optimal: { min: 28, ideal: 35, max: 48 },
    n_optimal: { min: 0.8, ideal: 1.1, max: 1.6 },
    eb_baseline: 55,
    eb_optimal: 85,
    supplementation_max: 15
  }
};

const INGS = [
  { id: 'paja_trigo', name: 'Paja de trigo', cat: 'paja', role: 'base_carbono', c: 45, n: 0.6, cn: 75, ph: 7.0, dig: 6, cra: 3, moisture: 10, cost: 900, cs: ['p_ostreatus_gris', 'p_djamor_rosada'] },
  { id: 'bagazo_cana', name: 'Bagazo de caña', cat: 'bagazo', role: 'base_carbono', c: 44, n: 0.4, cn: 110, ph: 6.5, dig: 5, cra: 3, moisture: 12, cost: 650, cs: ['p_ostreatus_gris', 'p_djamor_rosada'] },
  { id: 'aserrin_roble', name: 'Aserrín de roble', cat: 'maderas', role: 'base_carbono', c: 50, n: 0.25, cn: 200, ph: 6.0, dig: 4, cra: 2, moisture: 15, cost: 450, cs: ['p_ostreatus_gris', 'p_djamor_rosada'] },
  { id: 'salvado_trigo', name: 'Salvado de trigo', cat: 'salvados', role: 'suplemento_n', c: 42, n: 2.6, cn: 16.1, ph: 6.8, dig: 8, cra: 2, moisture: 12, cost: 1800, cs: ['p_ostreatus_gris', 'p_djamor_rosada'] },
  { id: 'harina_soya', name: 'Harina de soya', cat: 'harinas', role: 'suplemento_n', c: 48, n: 6.8, cn: 7.0, ph: 6.6, dig: 9, cra: 2, moisture: 8, cost: 3400, cs: ['p_ostreatus_gris', 'p_djamor_rosada'] },
  { id: 'yeso_agricola', name: 'Yeso agrícola', cat: 'adit', role: 'aditivo_estructura', c: 0, n: 0, cn: 0, ph: 7.2, dig: 5, cra: 1, moisture: 0, cost: 700, cs: ['p_ostreatus_gris', 'p_djamor_rosada'] }
];

test('Substrate Cost vs. Biological Efficiency Pareto Frontier Suite', async (t) => {
  const { computeParetoFrontier } = optimizer;

  await t.test('computeParetoFrontier returns non-dominated points sorted by cost ascending', () => {
    const res = computeParetoFrontier('p_ostreatus_gris', INGS, SPP, {
      freshPricePerKg: 12000,
      kgBag: 1.5,
      moistureSubstrate: 0.67
    });

    assert.ok(res, 'Debe devolver un resultado de frontera');
    assert.ok(Array.isArray(res.points), 'res.points debe ser un arreglo');
    assert.ok(res.points.length >= 2, 'Debe generar al menos 2 puntos no-dominados');

    for (let i = 1; i < res.points.length; i++) {
      const prev = res.points[i - 1];
      const cur = res.points[i];
      assert.ok(cur.costPerKgDry >= prev.costPerKgDry, `El coste debe ser no decreciente: ${cur.costPerKgDry} >= ${prev.costPerKgDry}`);
      assert.ok(cur.eb > prev.eb, `El EB debe ser estrictamente creciente: ${cur.eb} > ${prev.eb}`);
    }
  });

  await t.test('Cada receta en la frontera de Pareto cumple balance de masa (100% ± 0.5%)', () => {
    const res = computeParetoFrontier('p_ostreatus_gris', INGS, SPP);
    res.points.forEach((p, idx) => {
      const tot = p.recipe.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
      assert.ok(Math.abs(tot - 100) <= 0.5, `Punto ${idx} (${p.baseName} + ${p.suppName}) debe sumar 100%: total=${tot}`);
    });
  });

  await t.test('Identifica hitos clave: Económica (minCost), Máximo Margen y Máximo Rendimiento (maxEB)', () => {
    const res = computeParetoFrontier('p_ostreatus_gris', INGS, SPP, { freshPricePerKg: 12000 });
    assert.ok(res.milestones.minCost, 'Debe identificar el hito de menor coste');
    assert.ok(res.milestones.maxMargin, 'Debe identificar el hito de máximo margen bruto');
    assert.ok(res.milestones.maxEB, 'Debe identificar el hito de máximo rendimiento biológico');

    assert.equal(res.milestones.minCost.costPerKgDry, res.points[0].costPerKgDry);
    assert.equal(res.milestones.maxEB.eb, res.points[res.points.length - 1].eb);
    assert.ok(res.milestones.maxMargin.grossMarginPerBag > 0, 'El margen bruto debe ser positivo');
  });

  await t.test('Funciona limpiamente para otras especies del catálogo (ej. Pleurotus djamor / Rosada)', () => {
    const res = computeParetoFrontier('p_djamor_rosada', INGS, SPP);
    assert.ok(res.points.length >= 1, 'Debe generar frontera para P. djamor');
    assert.equal(res.speciesKey, 'p_djamor_rosada');
  });
});
