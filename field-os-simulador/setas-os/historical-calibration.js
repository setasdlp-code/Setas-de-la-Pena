'use strict';

// El runtime .dc puede volver a evaluar scripts al reconstruir el shell.
// Mantener las declaraciones en un scope privado hace la carga idempotente.
(function initHistoricalCalibration() {

// Deriva filas de eficiencia biológica REAL a partir de la Bitácora.
// BE = kg frescos cosechados / kg secos de sustrato × 100 — misma fórmula que
// calcLoteStats en simulador-app.jsx. Un lote solo aporta una fila cuando puede
// producir un BE honesto: necesita peso seco, receta asociada y al menos una
// cosecha registrada. Los lotes aún en incubación se excluyen: reportarían BE 0
// y hundirían la media en vez de no opinar.
const bitacoraEBRows = (bitLotes, bitCosechas) => {
  if (!Array.isArray(bitLotes) || !Array.isArray(bitCosechas)) return [];
  const rows = [];
  for (const lote of bitLotes) {
    const peseSeco = parseFloat(lote && lote.peseSeco) || 0;
    const ref = lote && lote.recipeRef;
    if (peseSeco <= 0 || !ref || !ref.sKey) continue;
    const cosechas = bitCosechas.filter((c) => c && c.loteId === lote.id);
    if (!cosechas.length) continue;
    const totalFresco = cosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0) / 1000;
    if (totalFresco <= 0) continue;
    rows.push({
      loteId: lote.id,
      codigo: lote.codigo || '',
      sKey: ref.sKey,
      recipe: Array.isArray(ref.recipe) ? ref.recipe : [],
      be: (totalFresco / peseSeco) * 100,
    });
  }
  return rows;
};

const recipePctMap = (recipe) => {
  const rows = (Array.isArray(recipe) ? recipe : []).filter((r) => r && r.id);
  if (!rows.length) return new Map();
  const map = new Map();
  rows.forEach((r) => {
    const raw = r.p ?? r.pct;
    const pct = Number.isFinite(Number(raw)) ? Math.max(0, Number(raw)) : 0;
    map.set(r.id, (map.get(r.id) || 0) + pct);
  });
  const total = [...map.values()].reduce((sum, pct) => sum + pct, 0);
  if (total > 0) {
    map.forEach((pct, id) => map.set(id, pct / total * 100));
  } else {
    // Compatibilidad con registros antiguos que guardaban IDs sin porcentajes:
    // no inventa una composición dominante y reparte el peso por igual.
    const equalPct = 100 / map.size;
    map.forEach((_, id) => map.set(id, equalPct));
  }
  return map;
};

// Similitud de Manhattan sobre proporciones normalizadas. A diferencia de
// Jaccard, distingue recetas con los mismos IDs pero porcentajes biológicamente
// distintos. Equivale a 1 - recipeDistance() del motor de escenarios.
const recipeOverlap = (recipeA, recipeB) => {
  const a = recipePctMap(recipeA);
  const b = recipePctMap(recipeB);
  if (!a.size || !b.size) return 0;
  const ids = new Set([...a.keys(), ...b.keys()]);
  let l1 = 0;
  ids.forEach((id) => { l1 += Math.abs((a.get(id) || 0) - (b.get(id) || 0)); });
  return Math.max(0, Math.min(1, 1 - l1 / 200));
};

const NEUTRAL_SIMILARITY = 0.5; // sin receta activa no hay evidencia de parecido
const WEIGHT_CAP = 0.65;
const PRIOR_N = 5; // n/(n+5): la evidencia tiene que acumularse para pesar

// Mezcla histórica a partir de lotes REALES de Bitácora. Misma forma de retorno
// que el historicalEBFor original para no tocar sus consumidores, pero con la
// curva suave de scoring.js — min(0.65, similitud · n/(n+5)) — en vez de
// min(0.7, 0.25n), que saturaba con solo 3 lotes.
const historicalEB = (sKey, rows, recipe = null) => {
  const empty = { n: 0, avg: null, meanEB: null, sd: null, subs: [], weight: 0, matched: false, similarity: 0 };
  if (!sKey || !Array.isArray(rows) || !rows.length) return empty;

  let pool = rows.filter((r) => r && r.sKey === sKey && Number.isFinite(r.be));
  if (!pool.length) return empty;

  let matched = false;
  let similarity = NEUTRAL_SIMILARITY;
  if (recipe && recipe.length) {
    const scored = pool.map((r) => ({ r, ov: recipeOverlap(recipe, r.recipe) }));
    const overlapping = scored.filter((s) => s.ov > 0);
    if (overlapping.length) {
      matched = true;
      pool = overlapping.map((s) => s.r);
      similarity = overlapping.reduce((s, x) => s + x.ov, 0) / overlapping.length;
    } else {
      similarity = 0; // misma especie, receta ajena: no aporta evidencia
    }
  }

  const n = pool.length;
  const avg = pool.reduce((s, r) => s + r.be, 0) / n;
  const variance = pool.reduce((s, r) => s + (r.be - avg) ** 2, 0) / n;
  return {
    n,
    avg,
    meanEB: avg, // alias — resolveCalibration en scoring.js lee h.meanEB, no h.avg
    sd: Math.sqrt(variance),
    subs: [...new Set(pool.map((r) => r.codigo).filter(Boolean))],
    weight: Math.min(WEIGHT_CAP, similarity * (n / (n + PRIOR_N))),
    matched,
    similarity,
  };
};

// Adapta bitacoraEBRows() a la forma {recipe, ebReal} que ya esperan los
// bridges de presentación (perito-scenarios-bridge.js, recetario-model-bridge.js,
// perito-ui-bridge.js) en su pool de setas_v6/ebReal, para que puedan mezclar
// ambas fuentes de evidencia real en un mismo arreglo sin reescribir su propia
// ponderación por similitud.
const bitacoraAsTrialRows = (sKey, bitLotes, bitCosechas) =>
  bitacoraEBRows(bitLotes, bitCosechas)
    .filter((r) => r.sKey === sKey)
    .map((r) => ({ recipe: r.recipe, ebReal: r.be, source: 'bitacora', loteId: r.loteId }));

const CALIBRATION_SIMILARITY_THRESHOLD = 0.55;
const CALIBRATION_WEIGHT_FLOOR = 0.08;

// Fórmula única de calibración por similitud para los bridges de presentación
// (perito-scenarios-bridge.js, recetario-model-bridge.js, perito-ui-bridge.js),
// que antes tenían tres implementaciones divergentes: dos medían similitud por
// solapamiento de IDs (Jaccard, ignora proporciones) y una por distancia L1
// ponderada por porcentaje. Se adopta esta última — recipeDistanceFn se pasa
// inyectada, normalmente SetasPeritoScenarios.recipeDistance, la misma métrica
// que ya usa el motor de búsqueda para novelty — porque dos recetas con los
// mismos ingredientes en proporciones muy distintas no son evidencia fuerte
// entre sí para EB, que depende de esas proporciones.
const weightedCalibration = (recipe, rows, recipeDistanceFn) => {
  if (!Array.isArray(rows) || !rows.length || typeof recipeDistanceFn !== 'function') return null;
  const comparable = rows.map((r) => ({ ...r, similarity: Math.max(0, 1 - recipeDistanceFn(recipe, r.recipe)) }));
  const selected = comparable.filter((r) => r.similarity >= CALIBRATION_SIMILARITY_THRESHOLD);
  const pool = selected.length ? selected : comparable;
  const weights = pool.map((r) => Math.max(CALIBRATION_WEIGHT_FLOOR, r.similarity));
  const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
  const meanEB = pool.reduce((sum, r, i) => sum + Number(r.ebReal) * weights[i], 0) / weightSum;
  const variance = pool.reduce((sum, r, i) => sum + (Number(r.ebReal) - meanEB) ** 2 * weights[i], 0) / weightSum;
  const similarity = pool.reduce((sum, r, i) => sum + r.similarity * weights[i], 0) / weightSum;
  return {
    n: pool.length,
    meanEB,
    sd: Math.sqrt(Math.max(0, variance)),
    similarity: Math.max(0, Math.min(1, similarity)),
    matched: selected.length > 0,
  };
};

const api = { bitacoraEBRows, historicalEB, recipeOverlap, bitacoraAsTrialRows, weightedCalibration };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasHistoricalCalibration = api;
}
})();
