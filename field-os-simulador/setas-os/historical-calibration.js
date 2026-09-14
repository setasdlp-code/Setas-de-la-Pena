'use strict';

// El runtime .dc puede volver a evaluar scripts al reconstruir el shell.
// Mantener las declaraciones en un scope privado hace la carga idempotente.
(function initHistoricalCalibration() {

// Final-outcome contract. Numeric EB alone is never proof of a completed cycle.
// "verified" records an explicit operator confirmation, not scientific confidence.
const finiteEB = value => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 400 ? n : null;
};
const finiteNonnegative = value => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
// Same aliases and lifecycleState precedence as batch-sheet.normalizeLifecycleState.
const isCompletedBatch = lote => ['closed', 'completado', 'cerrado'].includes(lote?.lifecycleState || lote?.estado);
const confirmedOutcome = eb => ({status: eb === 0 ? 'completed-zero-yield' : 'completed-success', verified: true});
const sourceIdentity = row => {
  const batch = row?.loteId || row?.batchId;
  if (batch) return `batch:${batch}`;
  const id = row?.sourceId || row?.id;
  return id ? `${row.source || 'trial'}:${id}` : null;
};
const classifyOutcome = (row, field = 'ebReal') => {
  const eb = finiteEB(row?.[field]);
  const declared = row?.outcome;
  const status = eb == null ? 'missing' :
    ['completed-success', 'completed-zero-yield'].includes(declared?.status) ? declared.status : 'partial';
  const reason = row?.exclusionReason || (eb == null ? 'missing-or-invalid-eb' :
    status === 'partial' ? 'incomplete-outcome' :
    declared?.verified !== true ? 'unverified-outcome' :
    (status === 'completed-zero-yield') !== (eb === 0) ? 'outcome-value-mismatch' :
    !sourceIdentity(row) ? 'missing-source-identity' :
    !Array.isArray(row?.recipe) ? 'missing-recipe-reference' : null);
  return {status, eb, eligible: !reason, reason};
};
const assessHistory = (rows = [], field = 'ebReal') => {
  const observations = (Array.isArray(rows) ? rows : []).map(row => ({row, ...classifyOutcome(row, field)}));
  const groups = new Map();
  observations.filter(x => sourceIdentity(x.row)).forEach(x => {
    const key = sourceIdentity(x.row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(x);
  });
  groups.forEach(group => {
    // Conflicting final copies have no ordering authority. Exclude all of them.
    const signature = x => JSON.stringify([x.eb, x.status, x.eligible, x.reason, x.row.sKey || x.row.speciesId || null,
      [...recipePctMap(x.row.recipe)].sort(([a], [b]) => a.localeCompare(b))]);
    const conflict = new Set(group.map(signature)).size > 1;
    group.forEach((x, i) => {
      if (conflict || i > 0) { x.eligible = false; x.reason = conflict ? 'conflicting-source-records' : 'duplicate-source-record'; }
    });
  });
  const eligibleRows = observations.filter(x => x.eligible).map(x => ({...x.row, [field]:x.eb}));
  const exclusionReasons = {};
  observations.filter(x => !x.eligible).forEach(x => { exclusionReasons[x.reason] = (exclusionReasons[x.reason] || 0) + 1; });
  return {eligibleRows, observations, total: observations.length, eligibleN: eligibleRows.length,
    excludedN: observations.length - eligibleRows.length, exclusionReasons};
};
const EXCLUSION_LABELS = {
  'missing-or-invalid-eb':'EB ausente o inválida', 'incomplete-outcome':'ciclo incompleto o sin cierre confirmado',
  'unverified-outcome':'resultado sin verificar', 'outcome-value-mismatch':'resultado y EB inconsistentes',
  'missing-source-identity':'sin identidad de origen', 'duplicate-source-record':'registro duplicado',
  'conflicting-source-records':'copias de origen contradictorias', 'invalid-dry-weight':'peso seco ausente o inválido',
  'invalid-harvest':'cosecha inválida o sin identidad', 'missing-recipe-reference':'sin referencia de receta o especie',
};
const describeHistory = report => `${report?.eligibleN || 0} resultado(s) final(es) elegible(s) · ${report?.excludedN || 0} excluido(s)` +
  Object.entries(report?.exclusionReasons || {}).map(([reason, n]) => ` · ${EXCLUSION_LABELS[reason] || reason}: ${n}`).join('');

// Shared derivation for calibration and contextual cycle evidence. A closed room
// stage is not a completed batch. No harvest is missing, never an inferred zero.
const batchOutcome = (lote, cosechas = []) => {
  const dry = finiteNonnegative(lote?.peseSeco ?? lote?.pesoSeco ?? lote?.peso_seco ?? lote?.dryWeightKg);
  let reason = dry == null || dry <= 0 ? 'invalid-dry-weight' : null;
  const unique = new Map();
  for (const c of cosechas) {
    const weight = finiteNonnegative(c?.pesoFresco);
    const kg = weight == null ? null : c.unit === 'kg' ? weight : !c.unit || c.unit === 'g' ? weight / 1000 : null;
    if (!c?.id || kg == null || (unique.has(c.id) && unique.get(c.id) !== kg)) reason = 'invalid-harvest';
    else unique.set(c.id, kg);
  }
  const verifiedZero = lote?.outcome?.status === 'completed-zero-yield' && lote.outcome.verified === true;
  const fresh = unique.size ? [...unique.values()].reduce((a,b) => a+b, 0) : verifiedZero ? 0 : null;
  if (verifiedZero && fresh > 0) reason = 'outcome-value-mismatch';
  const be = !reason && fresh != null ? finiteEB(fresh / dry * 100) : null;
  const closed = isCompletedBatch(lote);
  const outcome = be == null ? {status:'missing', verified:false} :
    closed && (be > 0 || verifiedZero) ? confirmedOutcome(be) : {status:'partial', verified:false};
  return {be, outcome, ...(reason ? {exclusionReason:reason} : {})};
};
const bitacoraObservations = (bitLotes, bitCosechas) => {
  if (!Array.isArray(bitLotes) || !Array.isArray(bitCosechas)) return [];
  return bitLotes.filter(Boolean).map(lote => {
    const ref = lote.recipeRef;
    return {loteId:lote.id, source:'bitacora', codigo:lote.codigo || '', sKey:ref?.sKey,
      recipe:Array.isArray(ref?.recipe) ? ref.recipe : [], fecha:lote.fechaInoculacion || null,
      ...batchOutcome(lote, bitCosechas.filter(c => c && c.loteId === lote.id)),
      ...(!ref?.sKey ? {exclusionReason:'missing-recipe-reference'} : {})};
  });
};
const bitacoraEBRows = (bitLotes, bitCosechas) => assessHistory(bitacoraObservations(bitLotes, bitCosechas), 'be').eligibleRows;

// Date.UTC() no valida rangos: mes 13 o día 32 se normalizan hacia adelante
// en vez de fallar, así que una fecha con dígitos fuera de rango produciría
// silenciosamente OTRA fecha válida en vez de null. Se valida por ida y
// vuelta: si la fecha reconstruida no coincide con los componentes de
// entrada, se descarta.
const utcFromParts = (year, month1to12, day) => {
  const ms = Date.UTC(year, month1to12 - 1, day);
  const d = new Date(ms);
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month1to12 - 1 || d.getUTCDate() !== day) return null;
  return ms;
};

// Analiza fechas en los dos formatos que produce esta app: ISO (fechaInoculacion
// de Bitácora, "AAAA-MM-DD") y es-CO (date de setas_v6, "D/M/AAAA" via
// toLocaleDateString). Devuelve null ante cualquier formato no reconocido o
// componente fuera de rango — una fecha ambigua nunca debe contarse como
// "reciente" por accidente; se excluye del recentN en vez de arriesgar una
// fecha mal interpretada.
const parseRowDate = (value) => {
  if (!value || typeof value !== 'string') return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return utcFromParts(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const esCo = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (esCo) return utcFromParts(Number(esCo[3]), Number(esCo[2]), Number(esCo[1]));
  return null;
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
  const eligibility = assessHistory((Array.isArray(rows) ? rows : []).filter(r => r?.sKey === sKey), 'be');
  const empty = { eligibility, n: 0, avg: null, meanEB: null, sd: null, subs: [], weight: 0, matched: false, similarity: 0 };
  if (!sKey || !Array.isArray(rows) || !rows.length) return empty;

  let pool = eligibility.eligibleRows;
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
    eligibility,
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
const bitacoraAsTrialRows = (sKey, bitLotes, bitCosechas, {includeIncomplete = false} = {}) =>
  (includeIncomplete ? bitacoraObservations(bitLotes, bitCosechas) : bitacoraEBRows(bitLotes, bitCosechas))
    .filter(r => r.sKey === sKey)
    .map(r => ({...r, ebReal:r.be}));

const CALIBRATION_SIMILARITY_THRESHOLD = 0.55;
const CALIBRATION_WEIGHT_FLOOR = 0.08;
// ADR-0007: ventana de "reciente" para promover ebConfidence a 'high'. Valor
// provisional (1 año) — no validado con Sebastián; ajustar si el ciclo real
// de deriva de sustrato/proceso es más corto o más largo que esto.
const RECENCY_WINDOW_DAYS = 365;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Fórmula única de calibración por similitud para los bridges de presentación
// (perito-scenarios-bridge.js, recetario-model-bridge.js, perito-ui-bridge.js),
// que antes tenían tres implementaciones divergentes: dos medían similitud por
// solapamiento de IDs (Jaccard, ignora proporciones) y una por distancia L1
// ponderada por porcentaje. Se adopta esta última — recipeDistanceFn se pasa
// inyectada, normalmente SetasPeritoScenarios.recipeDistance, la misma métrica
// que ya usa el motor de búsqueda para novelty — porque dos recetas con los
// mismos ingredientes en proporciones muy distintas no son evidencia fuerte
// entre sí para EB, que depende de esas proporciones.
//
// recentN (ADR-0007): cuenta filas del pool con fecha reconocible dentro de
// RECENCY_WINDOW_DAYS desde `now`. Una fila sin fecha parseable NUNCA cuenta
// como reciente — la ausencia de dato no se trata como "sí es reciente".
// No implementa detección de cambio de material/proceso (ADR-0007 lo deja
// como brecha abierta, fuera de alcance de este cambio).
const weightedCalibration = (recipe, rows, recipeDistanceFn, options = {}) => {
  if (!Array.isArray(rows) || !rows.length || typeof recipeDistanceFn !== 'function') return null;
  const eligibility = assessHistory(rows);
  const validRows = eligibility.eligibleRows;
  if (!validRows.length) return null;
  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const recencyWindowDays = Number.isFinite(options.recencyWindowDays) ? options.recencyWindowDays : RECENCY_WINDOW_DAYS;
  const comparable = validRows.map((r) => {
    const rawDist = recipeDistanceFn(recipe, r.recipe);
    const dist = Number.isFinite(Number(rawDist)) ? Math.max(0, Math.min(1, Number(rawDist))) : 1;
    return { ...r, similarity: 1 - dist };
  });
  const selected = comparable.filter((r) => r.similarity >= CALIBRATION_SIMILARITY_THRESHOLD);
  const pool = selected.length ? selected : comparable;
  const weights = pool.map((r) => Math.max(CALIBRATION_WEIGHT_FLOOR, r.similarity));
  const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
  const meanEB = pool.reduce((sum, r, i) => sum + Number(r.ebReal) * weights[i], 0) / weightSum;
  const variance = pool.reduce((sum, r, i) => sum + (Number(r.ebReal) - meanEB) ** 2 * weights[i], 0) / weightSum;
  const similarity = pool.reduce((sum, r, i) => sum + r.similarity * weights[i], 0) / weightSum;
  const recentN = pool.reduce((count, r) => {
    const ms = parseRowDate(r.fecha);
    if (ms == null) return count;
    const daysAgo = (now - ms) / MS_PER_DAY;
    return daysAgo >= 0 && daysAgo <= recencyWindowDays ? count + 1 : count;
  }, 0);
  return {
    n: pool.length,
    recentN,
    eligibility,
    meanEB,
    sd: Math.sqrt(Math.max(0, variance)),
    similarity: Math.max(0, Math.min(1, similarity)),
    matched: selected.length > 0,
  };
};

const api = { finiteEB, confirmedOutcome, classifyOutcome, assessHistory, describeHistory, batchOutcome, bitacoraObservations, bitacoraEBRows, historicalEB, recipeOverlap, bitacoraAsTrialRows, weightedCalibration, parseRowDate, RECENCY_WINDOW_DAYS };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasHistoricalCalibration = api;
}
})();
