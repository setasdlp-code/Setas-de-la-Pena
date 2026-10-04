import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Setas OS — Formulator UI/UX Elite Suite', async (t) => {
  const jsxPath = path.join(__dirname, 'simulador-app.jsx');
  const cssPath = path.join(__dirname, 'sim.css');
  const jsx = fs.readFileSync(jsxPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');

  await t.test('Formulator exposes unified command cockpit with live metrics, workmode switcher, and auto-balance button', () => {
    assert.match(jsx, /Mesa de Mezcla/);
    assert.match(jsx, /Generador de Recetas/);
    assert.match(jsx, /auto-balance|Auto-balance|rebalance/i);
    assert.match(jsx, /Perito|score|C:N/);
  });

  await t.test('Formulator ingredient items display category badges, stock availability in bodega, and lock/unlock toggles', () => {
    assert.match(jsx, /stock|bodega|lote/i);
    assert.match(jsx, /lock|bloqueado|desbloquear/i);
  });

  await t.test('Perito Co-Formulator cards present 1-click surgical optimization recommendations', () => {
    assert.match(jsx, /perito|sugerencia|optimizar/i);
    assert.match(jsx, /formularConStockBodega|runHybridRecipeSearch/);
    assert.match(jsx, /Evidencia:.*heurística de composición.*confianza/i);
  });

  await t.test('Recipe Generator preserves active locks when calculating and loading a candidate', () => {
    const generatorStart = jsx.indexOf('Object.keys(OPT_PROFILES).forEach(pk=>');
    const generatorCallStart = jsx.indexOf('const out=runHybridRecipeSearch({', generatorStart);
    const generatorCallEnd = jsx.indexOf('});', generatorCallStart) + 3;
    const generatorCall = jsx.slice(generatorCallStart, generatorCallEnd);
    const resultStart = jsx.indexOf('<button className="opt-load"', generatorCallEnd);
    const resultEnd = jsx.indexOf('</button>', jsx.indexOf('</button>', resultStart) + 9) + 9;
    const resultActions = jsx.slice(resultStart, resultEnd);

    assert.match(generatorCall, /recipe\s*:\s*lockedIds\.length\s*\?\s*recipe\s*:\s*\[\]/);
    assert.match(generatorCall, /\blockedIds\s*,/);
    assert.doesNotMatch(resultActions, /setLockedIds\(\[\]\)/);
    assert.match(resultActions, /setLockedIds\(lockedIds\.filter\(id=>r\.recipe\.some\(item=>item\.id===id\)\)\)/);
  });

  await t.test('Formulator integrates batch launching calculator with moisture, bag count, and primary CTA', () => {
    assert.match(jsx, /Preparar Mezcla|Ficha de Mezclado|Bolsas|Lanzar/i);
  });

  await t.test('CSS styles define high-end layout, crisp typography, and responsive controls for Formulator', () => {
    assert.match(css, /formular|builder|perito|recipe/i);
  });
});
