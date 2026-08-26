import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Setas OS Features Trio & SVG Icons Suite', async (t) => {
  const jsxPath = path.join(__dirname, 'simulador-app.jsx');
  const jsx = fs.readFileSync(jsxPath, 'utf8');

  await t.test('AppIcon component defines high-end SVG vector icons', () => {
    assert.match(jsx, /const AppIcon=\(\{name,/);
    assert.match(jsx, /case 'print':/);
    assert.match(jsx, /case 'qr':/);
    assert.match(jsx, /case 'tag':/);
    assert.match(jsx, /case 'globe':/);
    assert.match(jsx, /case 'trace':/);
    assert.match(jsx, /case 'sprout':/);
    assert.match(jsx, /case 'harvest':/);
    assert.match(jsx, /case 'pantry':/);
    assert.match(jsx, /case 'temp':/);
    assert.match(jsx, /case 'camera':/);
    assert.match(jsx, /case 'alert':/);
    assert.match(jsx, /case 'droplet':/);
    assert.match(jsx, /case 'wind':/);
    assert.match(jsx, /case 'chevron-left':/);
    assert.match(jsx, /case 'chevron-right':/);
  });

  await t.test('ColonizationScaleSelector implements 10% to 100% fine scale and biological quick actions', () => {
    assert.match(jsx, /const ColonizationScaleSelector=\(\{/);
    assert.match(jsx, /const steps=\[10,20,30,40,50,60,70,80,90,100\]/);
    assert.match(jsx, /col-scale-container/);
    assert.match(jsx, /col-step-chip/);
    assert.match(jsx, /Primordios/);
    assert.match(jsx, /Riego OK/);
    assert.match(jsx, /Ventilación/);
  });

  await t.test('PublicTraceabilityModal renders origin, species, and organic certification', () => {
    assert.match(jsx, /const PublicTraceabilityModal=\(\{/);
    assert.match(jsx, /Trazabilidad de Origen · Tenjo, Colombia/);
    assert.match(jsx, /2\.587 msnm/);
    assert.match(jsx, /Sustrato 100% Botánico Limpio/);
    assert.match(jsx, /publicTraceModalLoteId/);
  });

  await t.test('formularConStockBodega handler is integrated in simulador-app.jsx', () => {
    assert.match(jsx, /const formularConStockBodega=\(\)=>\{/);
    assert.match(jsx, /runHybridRecipeSearch\(\{/);
    assert.match(jsx, /useStock:\s*true/);
    assert.match(jsx, /calcMaxBatchFromStock/);
    assert.match(jsx, /Formular con Stock/);
  });

  await t.test('Field Audit QR Mode integrates batch carousel and colonization selector', () => {
    assert.match(jsx, /Ronda de Campo · Registro Rápido/);
    assert.match(jsx, /Lote anterior/);
    assert.match(jsx, /Siguiente lote/);
    assert.match(jsx, /ColonizationScaleSelector/);
    assert.match(jsx, /Ver Ficha Pública QR/);
  });

  await t.test('Stock-aware auto-recipe generates viable formulas with bodega inventory', async () => {
    const peritoMod = await import('./perito-scenarios.js');
    const perito = peritoMod.default || peritoMod;

    const SPP = {
      p_ostreatus_gris: { name: 'Orellana gris', cn_optimal: { min: 22, max: 40, ideal: 30 }, n_optimal: { min: 1.0, max: 2.2, ideal: 1.5 }, moisture: { min: 65, max: 75, ideal: 68 }, eb_baseline: 90, supplementation_max: 25 },
    };
    const INGS = [
      { id: 'paja_trigo', name: 'Paja de trigo', role: 'base_carbono', cn: 90, n: 0.5, c: 45, moisture: 12, cost: 2500, cs: ['p_ostreatus_gris'] },
      { id: 'salvado_trigo', name: 'Salvado de trigo', role: 'suplemento_n', cn: 16, n: 2.8, c: 45, moisture: 12, cost: 5000, cs: ['p_ostreatus_gris'] },
    ];
    const stockIds = new Set(['paja_trigo', 'salvado_trigo']);

    const seeds = perito.generateStructuralSeeds({
      targetKey: 'p_ostreatus_gris',
      ingredients: INGS,
      spp: SPP,
      useStock: true,
      stockIds,
      profileKey: 'produccion'
    });

    assert.ok(seeds.length > 0, 'Must generate structural seeds when bodega has base and supplement in stock');
    const hasPajaAndSalvado = seeds.some(s => s.recipe.some(r => r.id === 'paja_trigo') && s.recipe.some(r => r.id === 'salvado_trigo'));
    assert.ok(hasPajaAndSalvado, 'Must generate balanced combinations of in-stock base and supplement');
  });
});
