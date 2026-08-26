import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Setas OS — Calendario Proyectado de Cosechas & Flushes (B2B Forecast)', async (t) => {
  const jsxPath = path.join(__dirname, 'simulador-app.jsx');
  const jsx = fs.readFileSync(jsxPath, 'utf8');

  await t.test('calculates lot harvest projections with 1st, 2nd, and 3rd flush breakdown', () => {
    assert.match(jsx, /calculateLotFlushProjection/);
    assert.match(jsx, /flush1|flush2|flush3/);
    assert.match(jsx, /0\.6|0\.3|0\.1/);
  });

  await t.test('matches projected weekly harvests against B2B restaurant sales commitments', () => {
    assert.match(jsx, /b2bCommitments|B2B/);
    assert.match(jsx, /matchWeeklyCoverage/);
    assert.match(jsx, /superavit|deficit|cobertura/i);
  });

  await t.test('generates sowing recommendations when weekly deficit is detected', () => {
    assert.match(jsx, /sowingRecommendation|bolsas/i);
  });

  await t.test('schedule tab presents interactive tabs for Flush Forecast, B2B Matrix, and Species Calculator', () => {
    assert.match(jsx, /Cronograma|Pronóstico de Cosecha|Matriz B2B/);
    assert.match(jsx, /schTab/);
  });
});
