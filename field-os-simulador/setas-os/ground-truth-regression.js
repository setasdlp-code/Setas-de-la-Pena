'use strict';
// Arnés de regresión contra evidencia real de campo. Compara lo que analyze()
// predice para una receta contra el EB real que un lote produjo, para poder
// detectar si un cambio a scoring.js/perito-scenarios.js empeora la
// predicción en vez de solo "no romper tests sintéticos". No incluye datos
// reales: el corpus (ground-truth-fixtures.json) se puebla aparte, cuando
// haya suficientes lotes con ebReal registrado para que el promedio sea
// evidencia y no ruido de 2-3 puntos.

const loadFixtures = (raw) => {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    return { fixtures: [], skipped: 0, error: 'json_invalido' };
  }
  if (!Array.isArray(parsed)) return { fixtures: [], skipped: 0, error: 'no_es_array' };
  const fixtures = [];
  let skipped = 0;
  parsed.forEach((f) => {
    const valid = f && typeof f.sKey === 'string' && f.sKey
      && Array.isArray(f.recipe) && f.recipe.length > 0
      && Number.isFinite(Number(f.ebReal));
    if (valid) fixtures.push(f);
    else skipped += 1;
  });
  return { fixtures, skipped, error: null };
};

// analyzeFn(fixture) -> an | null · scoreFn(an, fixture) -> {score, status, ...}
// Inyectados por el llamador (igual que weightedCalibration inyecta
// recipeDistanceFn) para que este módulo no dependa de qué catálogo
// (sintético en tests, de producción en el reporte real) se está usando.
const evaluateFixture = (fixture, { analyzeFn, scoreFn }) => {
  const actualEB = Number(fixture?.ebReal);
  if (!Number.isFinite(actualEB)) return { fixture, error: 'fixture_sin_ebReal' };
  const an = analyzeFn(fixture);
  if (!an) return { fixture, error: 'analyze_failed' };
  const scored = scoreFn(an, fixture) || {};
  const predictedEB = an.eb;
  return {
    fixture,
    predictedEB,
    actualEB,
    absErrorEB: Math.abs(predictedEB - actualEB),
    score: Number.isFinite(scored.score) ? scored.score : null,
    status: scored.status || null,
  };
};

const summarizeFixtureRun = (results) => {
  const ok = (results || []).filter((r) => r && !r.error && Number.isFinite(r.absErrorEB));
  const failed = (results || []).length - ok.length;
  if (!ok.length) return { n: 0, meanAbsErrorEB: null, maxAbsErrorEB: null, failed };
  const errors = ok.map((r) => r.absErrorEB);
  return {
    n: ok.length,
    meanAbsErrorEB: errors.reduce((a, b) => a + b, 0) / ok.length,
    maxAbsErrorEB: Math.max(...errors),
    failed,
  };
};

const api = { loadFixtures, evaluateFixture, summarizeFixtureRun };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasGroundTruthRegression = api;
}
