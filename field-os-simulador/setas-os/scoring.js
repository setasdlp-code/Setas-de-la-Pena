'use strict';
// ── scoring.js — matriz de puntajes única para el simulador de sustrato ──
// Módulo puro: sin dependencias del DOM, de React ni de INGS/SPP globales.
// Además del score histórico, expone dimensiones operativas, incertidumbre,
// procedencia y calibración para que el Perito no confunda heurística con medición.
(function () {

const clamp01to100 = (v) => Math.max(0, Math.min(100, v));
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const nearIdeal = (value, { min, max, ideal }) => {
  const side = value < ideal ? Math.max(1e-6, ideal - min) : Math.max(1e-6, max - ideal);
  const ratio = Math.abs(value - ideal) / side;
  if (ratio <= 1) return 100 - ratio * 10;
  return clamp01to100(90 - (ratio - 1) * 90);
};

// Digestibilidad ponderada de la mezcla (an.avgDig, escala 0-10). A diferencia
// de C:N/N — que runAutoOptimizer resuelve algebraicamente al valor ideal para
// CUALQUIER combinación de ingredientes, saturando esos dos componentes a
// ~100 y dejando que el costo decida el desempate por descarte — la
// digestibilidad varía de verdad entre combinaciones y no se auto-satura.
// Sin dato (fixtures/llamadores que no la calculan) es neutral: no penaliza.
const scoreDigestibility = (an) => {
  if (!Number.isFinite(an.avgDig)) return 100;
  return clamp01to100((an.avgDig / 10) * 100);
};

const scoreNutrition = (an) => {
  const sp = an.sp;
  if (!sp) return 0;
  const cnScore = nearIdeal(an.cn, sp.cn_optimal);
  const nScore = nearIdeal(an.avgN, sp.n_optimal);
  // pH sigue siendo una estimación de mezcla; pesa poco y su confianza se
  // declara explícitamente en buildUncertainty().
  const phScore = sp.ph_optimal
    ? nearIdeal(an.avgPh, { ...sp.ph_optimal, ideal: (sp.ph_optimal.min + sp.ph_optimal.max) / 2 })
    : 50;
  const digScore = scoreDigestibility(an);
  return clamp01to100(cnScore * 0.45 + nScore * 0.30 + phScore * 0.15 + digScore * 0.10);
};

const COST_BREAKPOINTS = [
  { below: 800, score: 100 },
  { below: 1500, score: 85 },
  { below: 2500, score: 65 },
  { below: 3500, score: 45 },
  { below: 5500, score: 25 },
];
const scoreCost = (an) => {
  const cost = an.cost || 0;
  const hit = COST_BREAKPOINTS.find((b) => cost < b.below);
  return hit ? hit.score : 10;
};

const scoreRisk = (an, treatment) => {
  const sp = an.sp;
  if (!sp) return 50;
  let pen = 0;
  if (an.trichoderma) pen += 35;
  const suppOver = Math.max(0, an.suppP - sp.supplementation_max);
  if (suppOver > 0 && treatment && treatment.col !== 'autoclave') pen += 20 + suppOver * 3;
  else if (suppOver > 0) pen += 8 + suppOver * 1.5;
  if (an.cafeP > 25) pen += 12;
  else if (an.cafeP > 20) pen += 5;
  if (an.densaP > 60 && an.airP < 10) pen += 15;
  else if (an.densaP > 40 && an.airP < 8) pen += 8;
  if (sp.ph_optimal) {
    if (an.avgPh < sp.ph_optimal.min - 0.5 || an.avgPh > sp.ph_optimal.max + 0.5) pen += 12;
    else if (an.avgPh < sp.ph_optimal.min || an.avgPh > sp.ph_optimal.max) pen += 5;
  }
  if (an.incompat && an.incompat.length > 0) pen += an.incompat.length * 5;
  if (treatment && treatment.col === 'cwlp' && an.suppP > 12) pen += 10;
  if (an.tot < 97 || an.tot > 103) pen += 5;
  return clamp01to100(100 - pen);
};

const scoreTreatment = (an, treatment) => {
  if (!treatment) return 50;
  if (an.trichoderma) return treatment.col === 'autoclave' ? 100 : 10;
  const sp = an.sp;
  if (sp && an.suppP >= (sp.supplementation_max || 20) && treatment.col === 'autoclave') return 95;
  if (an.suppP > 12 && treatment.col === 'cwlp') return 40;
  return 65;
};

const scoreMassBalance = (an) => {
  const tot = an.tot;
  if (tot == null) return 100;
  if (tot >= 99 && tot <= 101) return 100;
  if (tot >= 97 && tot <= 103) return 70;
  return 40;
};

// Cobertura cuantitativa opcional de bodega. Si el llamador pasa cantidades,
// el score mide kg disponibles / kg requeridos; si no, conserva el fallback
// histórico por presencia de IDs para compatibilidad.
const getBatchDryKg = (ctx) => {
  if (Number.isFinite(ctx.batchDryKg) && ctx.batchDryKg > 0) return ctx.batchDryKg;
  if (Number.isFinite(ctx.batchWetKg) && ctx.batchWetKg > 0 && Number.isFinite(ctx.targetMoisturePct)) {
    return ctx.batchWetKg * (1 - Math.max(0, Math.min(92, ctx.targetMoisturePct)) / 100);
  }
  return null;
};

const getStockDetail = (ctx) => {
  const recipe = ctx.recipe || [];
  if (!recipe.length) return { score: 100, mode: 'none', limiting: [] };

  if (ctx.stockCoverageById && typeof ctx.stockCoverageById === 'object') {
    let weighted = 0;
    let weightSum = 0;
    const limiting = [];
    recipe.forEach((r) => {
      const w = Math.max(0, Number(r.p) || 0);
      const cov = clamp01(Number(ctx.stockCoverageById[r.id] ?? 0));
      weighted += cov * w;
      weightSum += w;
      if (cov < 0.999) limiting.push({ id: r.id, coverage: cov });
    });
    const score = weightSum > 0 ? Math.round((weighted / weightSum) * 100) : 100;
    return { score, mode: 'coverage', limiting };
  }

  const batchDryKg = getBatchDryKg(ctx);
  if (batchDryKg && ctx.stockKgById && typeof ctx.stockKgById === 'object') {
    let weighted = 0;
    let weightSum = 0;
    const limiting = [];
    recipe.forEach((r) => {
      const pct = Math.max(0, Number(r.p) || 0);
      const requiredDryKg = batchDryKg * pct / 100;
      const moisture = Math.max(0, Math.min(92, Number(ctx.ingredientMoistureById?.[r.id]) || 0));
      const availableWetKg = Math.max(0, Number(ctx.stockKgById[r.id]) || 0);
      const availableDryKg = availableWetKg * (1 - moisture / 100);
      const coverage = requiredDryKg > 0 ? clamp01(availableDryKg / requiredDryKg) : 1;
      weighted += coverage * pct;
      weightSum += pct;
      if (coverage < 0.999) limiting.push({ id: r.id, coverage, requiredDryKg, availableDryKg });
    });
    const score = weightSum > 0 ? Math.round((weighted / weightSum) * 100) : 100;
    return { score, mode: 'quantity', limiting, batchDryKg };
  }

  const stockIds = ctx.stockIds;
  if (!stockIds || stockIds.size === 0) return { score: 100, mode: 'unconstrained', limiting: [] };
  const inStock = recipe.filter((r) => stockIds.has(r.id)).length;
  return {
    score: Math.round((inStock / recipe.length) * 100),
    mode: 'presence',
    limiting: recipe.filter((r) => !stockIds.has(r.id)).map((r) => ({ id: r.id, coverage: 0 })),
  };
};
const scoreStock = (ctx) => getStockDetail(ctx).score;

const resolveCalibration = (an, ctx = {}) => {
  if (ctx.blendedEB != null) {
    return {
      eb: Number(ctx.blendedEB),
      source: 'preblended',
      weight: null,
      history: ctx.historyCalibration || null,
    };
  }
  const h = ctx.historyCalibration;
  if (!h || !Number.isFinite(h.meanEB) || !Number.isFinite(h.n) || h.n <= 0) {
    return { eb: an.eb, source: 'theoretical', weight: 0, history: null };
  }
  const similarity = clamp01(Number.isFinite(h.similarity) ? h.similarity : 0.5);
  const sampleWeight = h.n / (h.n + 5);
  const weight = Math.min(0.65, similarity * sampleWeight);
  return {
    eb: an.eb * (1 - weight) + h.meanEB * weight,
    source: 'history-blend',
    weight,
    history: h,
  };
};

const scoreYield = (an, ctx = {}) => {
  const sp = an.sp;
  if (!sp) return 0;
  const range = Math.max(1, sp.eb_optimal - sp.eb_baseline);
  const ebUsed = resolveCalibration(an, ctx).eb;
  const norm = (ebUsed - sp.eb_baseline) / range;
  return clamp01to100(norm * 100);
};

const DEFAULT_WEIGHTS = {
  nutrition: 0.18,
  yield: 0.15,
  cost: 0.12,
  risk: 0.25,
  treatment: 0.12,
  massBalance: 0.08,
  stock: 0.1,
};
const SEVERITY_CAPS = { critical: 55, warning: 88 };

const confidenceRank = { low: 0, medium: 1, high: 2 };
const minConfidence = (...levels) => levels.reduce((a, b) => confidenceRank[b] < confidenceRank[a] ? b : a, 'high');

const buildUncertainty = (an, ctx, calibration) => {
  const sp = an.sp;
  const h = calibration.history;
  let ebConfidence = 'low';
  let halfWidth = Math.max(15, Math.abs(calibration.eb) * 0.20);
  if (h && Number.isFinite(h.n)) {
    const sim = clamp01(Number.isFinite(h.similarity) ? h.similarity : 0.5);
    if (h.n >= 8 && sim >= 0.8) ebConfidence = 'high';
    else if (h.n >= 3 && sim >= 0.6) ebConfidence = 'medium';
    if (Number.isFinite(h.sd) && h.sd > 0) halfWidth = Math.max(h.sd * 1.5, Math.abs(calibration.eb) * (ebConfidence === 'high' ? 0.08 : 0.12));
    else halfWidth = Math.abs(calibration.eb) * (ebConfidence === 'high' ? 0.10 : ebConfidence === 'medium' ? 0.15 : 0.20);
  }
  const eb = {
    central: Math.round(calibration.eb),
    low: Math.max(0, Math.round(calibration.eb - halfWidth)),
    high: Math.max(0, Math.round(calibration.eb + halfWidth)),
    confidence: ebConfidence,
    source: calibration.source,
    note: ebConfidence === 'low'
      ? 'Estimación heurística; usar como rango comparativo, no como rendimiento garantizado.'
      : 'Rango ajustado con resultados históricos comparables de Setas de la Peña.',
  };

  let phTrend = 'sin referencia';
  if (sp?.ph_optimal) {
    phTrend = an.avgPh < sp.ph_optimal.min ? 'tendencia ácida'
      : an.avgPh > sp.ph_optimal.max ? 'tendencia alcalina'
      : 'tendencia dentro del rango';
  }
  const ph = {
    trend: phTrend,
    confidence: 'low',
    note: 'El pH de mezcla no se promedia linealmente con precisión. Confirmar en sustrato hidratado y, si aplica, después del tratamiento.',
  };

  const risk = {
    confidence: 'medium',
    observed: false,
    note: 'Riesgo inferido por reglas de composición y tratamiento; no equivale a contaminación observada.',
  };

  return { eb, ph, risk };
};

const buildDimensions = (breakdown, ctx, an) => {
  const safetyScore = Math.round(clamp01to100(
    breakdown.risk * 0.55 + breakdown.treatment * 0.30 + breakdown.massBalance * 0.15
  ));
  const agronomyScore = Math.round(clamp01to100(
    breakdown.nutrition * 0.55 + breakdown.yield * 0.45
  ));
  const economyScore = Math.round(clamp01to100(
    breakdown.cost * 0.60 + breakdown.stock * 0.40
  ));
  const suppUnsafe = !!(an.sp && an.suppP > an.sp.supplementation_max && ctx.treatment?.col !== 'autoclave');
  const blocked = !!an.trichoderma || suppUnsafe || breakdown.massBalance < 70;
  const viability = blocked ? 'hold' : safetyScore >= 80 ? 'approved' : safetyScore >= 60 ? 'review' : 'hold';
  return {
    safety: { score: safetyScore, status: viability },
    agronomy: { score: agronomyScore, status: agronomyScore >= 85 ? 'strong' : agronomyScore >= 65 ? 'acceptable' : 'weak' },
    economy: { score: economyScore, status: economyScore >= 80 ? 'efficient' : economyScore >= 55 ? 'acceptable' : 'expensive_or_unavailable' },
  };
};

const buildProvenance = (ctx, uncertainty, calibration, stockDetail) => ({
  score: { type: 'heuristic-model', confidence: 'medium', source: 'SetasScoring rules + species/ingredient catalog' },
  eb: {
    type: calibration.source === 'history-blend' || calibration.source === 'preblended' ? 'model+field-data' : 'heuristic-model',
    confidence: uncertainty.eb.confidence,
    sampleSize: calibration.history?.n || null,
    similarity: calibration.history?.similarity ?? null,
  },
  ph: { type: 'directional-estimate', confidence: 'low', requiresMeasurement: true },
  risk: { type: 'rule-inference', confidence: 'medium', observed: false },
  stock: { type: stockDetail.mode === 'quantity' || stockDetail.mode === 'coverage' ? 'quantity-aware' : 'presence-only', confidence: stockDetail.mode === 'presence' ? 'low' : 'high' },
  catalog: ctx.provenance || null,
});

const scoreRecipe = (an, ctx = {}) => {
  const stockDetail = getStockDetail(ctx);
  const calibration = resolveCalibration(an, ctx);
  const breakdown = {
    nutrition: scoreNutrition(an),
    yield: scoreYield(an, ctx),
    cost: scoreCost(an),
    risk: scoreRisk(an, ctx.treatment),
    treatment: scoreTreatment(an, ctx.treatment),
    massBalance: scoreMassBalance(an),
    stock: stockDetail.score,
  };
  const weights = { ...DEFAULT_WEIGHTS, ...(ctx.weights || {}) };
  const raw = Object.keys(breakdown).reduce((sum, key) => sum + breakdown[key] * (weights[key] || 0), 0);
  const criticals = ctx.criticals || 0;
  const warnings = ctx.warnings || 0;
  const severity = clamp01to100((ctx.severity || 0) * 100) / 100;
  let score = Math.round(clamp01to100(raw));
  if (criticals > 0) {
    const cap = Math.round(SEVERITY_CAPS.critical - severity * 30);
    score = Math.min(score, Math.max(10, cap));
  } else if (warnings > 0) {
    const cap = Math.round(SEVERITY_CAPS.warning - severity * 15);
    score = Math.min(score, cap);
  }
  const status = criticals > 0 ? 'critical'
    : score >= 85 && warnings === 0 ? 'excellent'
    : score >= 65 ? 'good'
    : score >= 40 ? 'needs_work' : 'critical';

  const dimensions = buildDimensions(breakdown, ctx, an);
  const uncertainty = buildUncertainty(an, ctx, calibration);
  const provenance = buildProvenance(ctx, uncertainty, calibration, stockDetail);
  const confidence = minConfidence(uncertainty.eb.confidence, uncertainty.ph.confidence, uncertainty.risk.confidence);

  return {
    score, status, breakdown, weights, caps: SEVERITY_CAPS,
    dimensions,
    confidence,
    uncertainty,
    provenance,
    stockDetail,
    calibration,
  };
};

const detectSeverity = (an) => {
  const sp = an && an.sp;
  if (!sp) return null;
  const cnHigh = an.cn > sp.cn_optimal.max;
  const cnLow = an.cn < sp.cn_optimal.min;
  const nLow = an.avgN < sp.n_optimal.min;
  const nHigh = an.avgN > sp.n_optimal.max && !an.trichoderma;
  const trichoderma = !!an.trichoderma;
  const phLow = !!(sp.ph_optimal && an.avgPh < sp.ph_optimal.min);
  const phHigh = !!(sp.ph_optimal && an.avgPh > sp.ph_optimal.max);
  const cnInRange = an.cn >= sp.cn_optimal.min && an.cn <= sp.cn_optimal.max;
  const cnDist = Math.abs(an.cn - sp.cn_optimal.ideal) / Math.max(0.01, sp.cn_optimal.max - sp.cn_optimal.min);
  const cnWarn = cnInRange && cnDist > 0.05;
  const nInRange = an.avgN >= sp.n_optimal.min && an.avgN <= sp.n_optimal.max;
  const nDist = Math.abs(an.avgN - sp.n_optimal.ideal) / Math.max(0.01, sp.n_optimal.max - sp.n_optimal.min);
  const nWarn = nInRange && nDist > 0.06;
  const ebWarn = an.eb < sp.eb_optimal * 0.95 && an.suppP < sp.supplementation_max - 3;
  const cnWidth = Math.max(0.01, sp.cn_optimal.max - sp.cn_optimal.min);
  const cnOverDist = cnHigh ? (an.cn - sp.cn_optimal.max) / cnWidth : cnLow ? (sp.cn_optimal.min - an.cn) / cnWidth : 0;
  const nWidth = Math.max(0.01, sp.n_optimal.max - sp.n_optimal.min);
  const nOverDist = nHigh ? (an.avgN - sp.n_optimal.max) / nWidth : nLow ? (sp.n_optimal.min - an.avgN) / nWidth : 0;
  const phWidth = sp.ph_optimal ? Math.max(0.01, sp.ph_optimal.max - sp.ph_optimal.min) : 1;
  const phOverDist = phHigh ? (an.avgPh - sp.ph_optimal.max) / phWidth : phLow ? (sp.ph_optimal.min - an.avgPh) / phWidth : 0;
  const overDist = Math.max(cnOverDist, nOverDist, phOverDist);
  return { cnHigh, cnLow, nLow, nHigh, trichoderma, phLow, phHigh, cnWarn, nWarn, ebWarn, cnDist, nDist, cnOverDist, nOverDist, phOverDist, overDist };
};

const assessSeverity = (an) => {
  const f = detectSeverity(an);
  if (!f) return { criticals: 0, warnings: 0, severity: 0 };
  let criticals = 0;
  let warnings = 0;
  if (f.cnHigh) criticals++;
  if (f.cnLow) criticals++;
  if (f.nLow) criticals++;
  if (f.nHigh) criticals++;
  if (f.trichoderma) criticals++;
  if (f.phLow) criticals++;
  if (f.phHigh) criticals++;
  if (f.cnWarn) warnings++;
  if (f.nWarn) warnings++;
  if (f.ebWarn) warnings++;
  const severity = f.trichoderma ? 1 : Math.min(1, f.overDist || 0);
  return { criticals, warnings, severity };
};

const api = { scoreRecipe, assessSeverity, detectSeverity };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof globalThis !== 'undefined') globalThis.SetasScoring = api;

})();
