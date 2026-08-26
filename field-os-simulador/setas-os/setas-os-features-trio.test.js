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
});
