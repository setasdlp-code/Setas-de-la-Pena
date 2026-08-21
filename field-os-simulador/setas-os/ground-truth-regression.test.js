'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const legacy = require('./recipe-optimizer.js');
const scoring = require('./scoring.js');
const { loadFixtures, evaluateFixture, summarizeFixtureRun } = require('./ground-truth-regression.js');

// Catálogo sintético mínimo, igual en espíritu al de recipe-optimizer-parity.test.js
// — solo para probar el arnés en sí. Los fixtures REALES (ground-truth-fixtures.json,
// aún no existe: no hay datos de campo suficientes) deben correr contra el catálogo
// de producción, no este.
const SPP = {
  p_ostreatus_gris: {
    name: 'Orellana Gris',
    cn_optimal: { min: 25, max: 50, ideal: 35 },
    n_optimal: { min: 0.8, max: 2.0, ideal: 1.4 },
    ph_optimal: { min: 6.0, max: 7.5 },
    eb_baseline: 90,
    eb_optimal: 130,
    supplementation_max: 20,
    spawn_rate: 8,
    moisture: { ideal: 65 },
  },
};
const INGS = [
  { id: 'paja_trigo', name: 'Paja de trigo', cn: 80, n: 0.6, c: 48, moisture: 12, ph: 6.8, dig: 7, cra: 3, role: 'base_carbono', cost: 400, cs: ['p_ostreatus_gris'] },
  { id: 'salvado_trigo', name: 'Salvado de trigo', cn: 15, n: 2.5, c: 45, moisture: 12, ph: 6.5, dig: 8, cra: 4, role: 'suplemento_n', cost: 900, cs: ['p_ostreatus_gris'] },
];
const analyzeFn = fixture => legacy.analyze(fixture.recipe, fixture.sKey, INGS, SPP);
const scoreFn = (an, fixture) => {
  const sev = scoring.assessSeverity(an);
  const treatment = legacy.calcTreatment(an, fixture.sKey, SPP);
  return scoring.scoreRecipe(an, { treatment, recipe: fixture.recipe, criticals: sev.criticals, warnings: sev.warnings, severity: sev.severity });
};

// ── loadFixtures ──────────────────────────────────────────────────
test('loadFixtures descarta entradas sin ebReal, sKey o receta — no ensucia el promedio con basura', () => {
  const raw = JSON.stringify([
    { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], ebReal: 95 },
    { sKey: 'p_ostreatus_gris', recipe: [], ebReal: 95 },
    { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 100 }] },
    { recipe: [{ id: 'paja_trigo', p: 100 }], ebReal: 95 },
  ]);
  const { fixtures, skipped, error } = loadFixtures(raw);
  assert.equal(error, null);
  assert.equal(fixtures.length, 1);
  assert.equal(skipped, 3);
});

test('loadFixtures reporta json_invalido en vez de reventar con JSON malformado', () => {
  const { fixtures, error } = loadFixtures('{ esto no es json [');
  assert.equal(fixtures.length, 0);
  assert.equal(error, 'json_invalido');
});

test('loadFixtures reporta no_es_array si la raíz no es un arreglo', () => {
  const { fixtures, error } = loadFixtures(JSON.stringify({ sKey: 'x' }));
  assert.equal(fixtures.length, 0);
  assert.equal(error, 'no_es_array');
});

// ── evaluateFixture ───────────────────────────────────────────────
test('evaluateFixture compara el EB predicho por analyze() contra el ebReal real de campo', () => {
  const fixture = { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }], ebReal: 95 };
  const result = evaluateFixture(fixture, { analyzeFn, scoreFn });
  assert.equal(result.error, undefined);
  assert.ok(Number.isFinite(result.predictedEB));
  assert.equal(result.actualEB, 95);
  assert.ok(Math.abs(result.absErrorEB - Math.abs(result.predictedEB - 95)) < 1e-9);
  assert.ok(Number.isFinite(result.score));
});

test('evaluateFixture marca error explícito en vez de NaN silencioso cuando falta ebReal', () => {
  const fixture = { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 100 }] };
  const result = evaluateFixture(fixture, { analyzeFn, scoreFn });
  assert.equal(result.error, 'fixture_sin_ebReal');
});

// ── summarizeFixtureRun ───────────────────────────────────────────
test('summarizeFixtureRun promedia solo los resultados válidos, no los que fallaron', () => {
  const results = [{ absErrorEB: 4 }, { absErrorEB: 8 }, { error: 'fixture_sin_ebReal' }];
  const s = summarizeFixtureRun(results);
  assert.equal(s.n, 2);
  assert.equal(s.meanAbsErrorEB, 6);
  assert.equal(s.maxAbsErrorEB, 8);
  assert.equal(s.failed, 1);
});

test('summarizeFixtureRun con 0 resultados válidos no divide por cero', () => {
  const s = summarizeFixtureRun([]);
  assert.equal(s.n, 0);
  assert.equal(s.meanAbsErrorEB, null);
  assert.equal(s.maxAbsErrorEB, null);
});

// ── Corpus real de campo ──────────────────────────────────────────
// ground-truth-fixtures.json aún no existe: no hay suficientes lotes reales
// con ebReal registrado para construirlo honestamente (Bitácora se conectó
// al motor en este mismo ciclo de trabajo). Cuando exista, correr sus
// fixtures requiere el catálogo INGS/SPP de producción (no el sintético de
// arriba) — extraerlo de simulador-app.js es el siguiente paso, no antes de
// que haya datos reales que justifiquen construirlo.
test('reporta el estado del corpus de campo real — 0 fixtures aún es válido, no un fallo', () => {
  const fixturesPath = path.join(__dirname, 'ground-truth-fixtures.json');
  if (!fs.existsSync(fixturesPath)) {
    console.log('  → ground-truth-fixtures.json no existe todavía: 0 fixtures reales.');
    return;
  }
  const raw = fs.readFileSync(fixturesPath, 'utf8');
  const { fixtures, skipped, error } = loadFixtures(raw);
  assert.equal(error, null, `ground-truth-fixtures.json es inválido: ${error}`);
  if (skipped > 0) console.log(`  → ${skipped} fixture(s) descartadas por forma inválida`);
  console.log(`  → ${fixtures.length} fixture(s) reales cargadas (aún sin correr contra el catálogo de producción)`);
});
