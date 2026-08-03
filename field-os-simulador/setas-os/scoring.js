'use strict';
// ── scoring.js — matriz de puntajes única para el simulador de sustrato ──
// Módulo puro: sin dependencias del DOM, de React ni de INGS/SPP globales.
// Reemplaza recipeScore, calcRiskScore, el compuesto de generateOptimizer
// y el resultScore de runAutoOptimizer por una sola función auditable.
//
// Consumido por simulador-app.jsx vía <script src="./scoring.js"> (global
// SetasScoring) y por scoring.test.js vía require() en Node.

const clamp01to100 = (v) => Math.max(0, Math.min(100, v));

// ── Cercanía a un valor ideal dentro de un rango [min,max] ──
// Corrige la asimetría de la fórmula original (distancia / rango completo):
// normaliza por el semi-rango a cada lado del ideal, así que value===ideal
// da 100 y value===min o value===max dan ambos 90 (no 40/60 según el lado).
// Fuera de [min,max] sigue penalizando con la misma pendiente más allá del
// borde, hasta 0.
const nearIdeal = (value, { min, max, ideal }) => {
  const side = value < ideal ? Math.max(1e-6, ideal - min) : Math.max(1e-6, max - ideal);
  const ratio = Math.abs(value - ideal) / side; // 0 en ideal, 1 en el borde
  if (ratio <= 1) return 100 - ratio * 10; // 100 → 90 dentro del rango óptimo
  return clamp01to100(90 - (ratio - 1) * 90); // sigue cayendo fuera del rango
};

// ── Componente: nutrition (C:N, N%, pH respecto a los óptimos de la especie) ──
const scoreNutrition = (an) => {
  const sp = an.sp;
  if (!sp) return 0;
  const cnScore = nearIdeal(an.cn, sp.cn_optimal);
  const nScore = nearIdeal(an.avgN, sp.n_optimal);
  const phScore = sp.ph_optimal
    ? nearIdeal(an.avgPh, { ...sp.ph_optimal, ideal: (sp.ph_optimal.min + sp.ph_optimal.max) / 2 })
    : 50;
  return clamp01to100(cnScore * 0.5 + nScore * 0.35 + phScore * 0.15);
};

// ── Componente: cost (COP/kg de sustrato) ──
// Escala única: el código original tenía dos tablas de umbrales incompatibles
// (recipeScore vs runAutoOptimizer) sobre la misma variable an.cost, así que
// un mismo costo caía en categorías opuestas según qué fórmula lo evaluara.
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

// ── Componente: risk (penalizaciones por factores de riesgo real) ──
// Reemplaza calcRiskScore. La original declaraba (recipe,an,sKey,treatment,
// ings) pero solo leía an y treatment — firma real reducida a lo que se usa.
const scoreRisk = (an, treatment) => {
  const sp = an.sp;
  if (!sp) return 50; // sin especie: no hay base para evaluar riesgo
  let pen = 0;
  if (an.trichoderma) pen += 35;
  // Penalización proporcional al exceso, no plana: absorbe lo que en el
  // código original era un suppPenalty=(suppP-límite)*3 aplicado por fuera
  // de la fórmula, solo dentro de runAutoOptimizer — invisible en el Perito
  // y no reconstruible desde ningún breakdown.
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

// ── Componente: treatment (¿el tratamiento elegido es el correcto para el riesgo?) ──
// Unifica dos definiciones homónimas que coexistían con lógicas distintas:
// generateOptimizer.treatmentScore13 evaluaba riesgo real (Trichoderma, supP);
// runAutoOptimizer.treatScore solo miraba si coincidía con profile.preferTreatment.
// Deliberadamente NO toma `profile`: una entrada opcional que solo uno de los
// dos llamadores recordaba pasar reproducía el mismo bug que se está
// corrigiendo (mismo an+treatment, score distinto según quién preguntara) —
// se detectó en verificación manual: la receta #1 del Optimizador (perfil
// producción, prefería autoclave) puntuaba 92 pero el Perito, sin `profile`,
// la puntuaba 89 para la MISMA receta recién cargada. OPT_PROFILES sigue
// vivo para decidir qué candidatos generar/filtrar — solo se sacó del score.
const scoreTreatment = (an, treatment) => {
  if (!treatment) return 50;
  if (an.trichoderma) return treatment.col === 'autoclave' ? 100 : 10;
  const sp = an.sp;
  if (sp && an.suppP >= (sp.supplementation_max || 20) && treatment.col === 'autoclave') return 95;
  if (an.suppP > 12 && treatment.col === 'cwlp') return 40;
  return 65;
};

// ── Componente: massBalance (¿el total de la receta cierra en ~100%?) ──
const scoreMassBalance = (an) => {
  const tot = an.tot;
  if (tot == null) return 100;
  if (tot >= 99 && tot <= 101) return 100;
  if (tot >= 97 && tot <= 103) return 70;
  return 40;
};

// ── Componente: stock (cobertura de la receta con el inventario disponible) ──
// Sin restricción de bodega (stockIds vacío), no penaliza. ctx.recipe es la
// lista cruda de ingredientes {id,...} — an (salida de analyze()) no la trae.
const scoreStock = (ctx) => {
  const stockIds = ctx.stockIds;
  if (!stockIds || stockIds.size === 0) return 100;
  const recipe = ctx.recipe || [];
  if (recipe.length === 0) return 100;
  const inStock = recipe.filter((r) => stockIds.has(r.id)).length;
  return Math.round((inStock / recipe.length) * 100);
};

// ── Componente: yield (aprovechamiento de EB respecto a la especie) ──
// Corrige el bug de recipeScore: sin Math.max(0,…), un EB muy por debajo
// de eb_baseline producía un componente negativo que arrastraba el score
// total a valores negativos.
const scoreYield = (an) => {
  const sp = an.sp;
  if (!sp) return 0;
  const range = Math.max(1, sp.eb_optimal - sp.eb_baseline);
  const norm = (an.eb - sp.eb_baseline) / range;
  return clamp01to100(norm * 100);
};

// Vector de pesos por defecto. Provisional — el usuario decide la calibración
// final al migrar generateOptimizer/runAutoOptimizer a consumir este módulo.
// Suman 1.00; los 7 componentes son ortogonales (a diferencia del código
// original, donde recipeScore ya incluía EB y costo y el compuesto los volvía
// a sumar por separado). Un llamador puede override parcial vía ctx.weights.
const DEFAULT_WEIGHTS = {
  nutrition: 0.18,
  yield: 0.15,
  cost: 0.12,
  risk: 0.25,
  treatment: 0.12,
  massBalance: 0.08,
  stock: 0.1,
};

// Techos de score por severidad de los items del Perito (criticals/warnings).
// Viven a nivel de módulo —junto a los pesos— para que sean tan fáciles de
// encontrar y ajustar como el resto de la calibración.
const SEVERITY_CAPS = { critical: 55, warning: 88 };

const scoreRecipe = (an, ctx = {}) => {
  const breakdown = {
    nutrition: scoreNutrition(an),
    yield: scoreYield(an),
    cost: scoreCost(an),
    risk: scoreRisk(an, ctx.treatment),
    treatment: scoreTreatment(an, ctx.treatment),
    massBalance: scoreMassBalance(an),
    stock: scoreStock(ctx),
  };
  const weights = { ...DEFAULT_WEIGHTS, ...(ctx.weights || {}) };
  const raw = Object.keys(breakdown).reduce(
    (sum, key) => sum + breakdown[key] * (weights[key] || 0),
    0
  );
  const criticals = ctx.criticals || 0;
  const warnings = ctx.warnings || 0;
  // Techos por severidad: viven aquí, no en cada llamador, para que el
  // Perito y el optimizador queden protegidos por igual (bug original:
  // runAutoOptimizer no aplicaba estos clamps y podía rankear #1 una receta
  // que el Perito marcaría crítica).
  let score = Math.round(clamp01to100(raw));
  if (criticals > 0) score = Math.min(score, SEVERITY_CAPS.critical);
  else if (warnings > 0) score = Math.min(score, SEVERITY_CAPS.warning);

  // status coherente con los techos: 'excellent' es inalcanzable si hay
  // warnings (techo 88 < 85 no aplica, así que se excluye explícitamente) y
  // 'critical' se reserva para cuando de verdad hay items críticos, no solo
  // para scores bajos por otras razones.
  const status = criticals > 0
    ? 'critical'
    : score >= 85 && warnings === 0
    ? 'excellent'
    : score >= 65
    ? 'good'
    : score >= 40
    ? 'needs_work'
    : 'critical';

  return { score, status, breakdown, weights, caps: SEVERITY_CAPS };
};

// ── assessSeverity: criticals/warnings derivables solo de an/sp ──
// Réplica de las condiciones que generateOptimizer usa para marcar items
// como 'critical'/'warning' (fuera de rango vs. dentro de rango pero lejos
// del ideal), pero sin la búsqueda de ingredientes alternativos en el
// catálogo — esa parte es asesoría para el usuario, no señal de severidad.
// Deliberadamente NO replica la condición "hay un ingrediente en stock que
// lo resuelva" que el aviso de EB sin explotar tenía en el código original:
// aquí el hecho de que la receta esté por debajo de su EB potencial cuenta
// como warning siempre, sin importar si hay un insumo a mano para corregirlo.
const assessSeverity = (an) => {
  const sp = an && an.sp;
  if (!sp) return { criticals: 0, warnings: 0 };
  let criticals = 0;
  let warnings = 0;

  if (an.cn > sp.cn_optimal.max) criticals++;
  if (an.cn < sp.cn_optimal.min) criticals++;
  if (an.avgN < sp.n_optimal.min) criticals++;
  if (an.avgN > sp.n_optimal.max && !an.trichoderma) criticals++;
  if (an.trichoderma) criticals++;
  if (sp.ph_optimal && an.avgPh < sp.ph_optimal.min) criticals++;
  if (sp.ph_optimal && an.avgPh > sp.ph_optimal.max) criticals++;

  const cnInRange = an.cn >= sp.cn_optimal.min && an.cn <= sp.cn_optimal.max;
  const cnDist = Math.abs(an.cn - sp.cn_optimal.ideal) / (sp.cn_optimal.max - sp.cn_optimal.min);
  if (cnInRange && cnDist > 0.08) warnings++;

  const nInRange = an.avgN >= sp.n_optimal.min && an.avgN <= sp.n_optimal.max;
  const nDist = Math.abs(an.avgN - sp.n_optimal.ideal) / Math.max(0.01, sp.n_optimal.max - sp.n_optimal.min);
  if (nInRange && nDist > 0.1) warnings++;

  if (an.eb < sp.eb_optimal * 0.95 && an.suppP < sp.supplementation_max - 3) warnings++;

  return { criticals, warnings };
};

const api = { scoreRecipe, assessSeverity };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasScoring = api;
}
