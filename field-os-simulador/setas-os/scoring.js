'use strict';
// ── scoring.js — matriz de puntajes única para el simulador de sustrato ──
// Módulo puro: sin dependencias del DOM, de React ni de INGS/SPP globales.
// Reemplaza recipeScore, calcRiskScore, el compuesto de generateOptimizer
// y el resultScore de runAutoOptimizer por una sola función auditable.
//
// Consumido por simulador-app.jsx vía <script src="./scoring.js"> (global
// SetasScoring) y por scoring.test.js vía require() en Node.
//
// IIFE: el runtime .dc de "Setas OS v5.dc.html" clona el <body> original
// (donde vive este <script>, dentro de <x-dc><helmet>) dentro de #dc-root
// para hidratarlo — ver el mismo comentario en firebase/auth-gate.js. Esa
// clonación reinserta el <script> en el DOM y el navegador lo re-ejecuta,
// así que sin este wrapper los `const` de nivel superior chocaban en la
// segunda ejecución ("Identifier 'clamp01to100' has already been declared").
// Al envolver todo en una función, cada ejecución tiene su propio scope de
// bloque — la segunda solo vuelve a asignar globalThis.SetasScoring, sin
// redeclarar nada.
(function () {

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
// ctx.blendedEB: override opcional — EB mezclado con el promedio real de
// lotes históricos de la especie (ver blendEBWithHistory en
// simulador-app.jsx), ponderado por cuántos lotes reales hay registrados.
// Antes este componente siempre usaba an.eb puro (100% teórico) aunque el
// usuario ya tuviera cosechas reales registradas para esa especie — el
// gauge del Formulador sí mostraba el EB mezclado, pero el score del
// Perito lo ignoraba. Sin ctx.blendedEB (caso por defecto, todos los
// llamadores existentes) el comportamiento es idéntico a antes.
const scoreYield = (an, ctx = {}) => {
  const sp = an.sp;
  if (!sp) return 0;
  const range = Math.max(1, sp.eb_optimal - sp.eb_baseline);
  const ebUsed = ctx.blendedEB != null ? ctx.blendedEB : an.eb;
  const norm = (ebUsed - sp.eb_baseline) / range;
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
    yield: scoreYield(an, ctx),
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
  // severity: 0..1, qué tan lejos está el peor parámetro fuera de su rango
  // óptimo (ver detectSeverity.overDist). Antes el techo era un valor fijo
  // (55/88) sin importar si el C:N estaba apenas fuera de rango o el doble
  // del máximo — dos recetas muy distintas caían en el mismo score. Ahora el
  // techo baja proporcionalmente a esa distancia, así que la magnitud real
  // del problema se refleja en el número, no solo en si cruzó el umbral.
  const severity = clamp01to100((ctx.severity || 0) * 100) / 100;
  // Techos por severidad: viven aquí, no en cada llamador, para que el
  // Perito y el optimizador queden protegidos por igual (bug original:
  // runAutoOptimizer no aplicaba estos clamps y podía rankear #1 una receta
  // que el Perito marcaría crítica).
  let score = Math.round(clamp01to100(raw));
  if (criticals > 0) {
    const cap = Math.round(SEVERITY_CAPS.critical - severity * 30); // 55 → hasta 25
    score = Math.min(score, Math.max(10, cap));
  } else if (warnings > 0) {
    const cap = Math.round(SEVERITY_CAPS.warning - severity * 15); // 88 → hasta 73
    score = Math.min(score, cap);
  }

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

// ── detectSeverity: única fuente de las banderas críticas/warning ──
// Antes eran dos copias manuales de las mismas 10 condiciones: una aquí
// (assessSeverity, define los techos de score) y otra en generateOptimizer
// en simulador-app.jsx (define qué ítems ve el usuario). Coincidían por
// casualidad de mantenimiento, no por construcción — un umbral tocado en
// un solo lado habría reproducido el mismo bug que ya se corrigió una vez
// entre Perito y Optimizador, esta vez entre el score y su propia lista de
// ítems. Ahora ambos consumidores llaman a esta función; generateOptimizer
// solo decide QUÉ TEXTO/ACCIÓN mostrar por cada bandera en true, nunca
// redefine la condición.
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
  // Umbral bajado de 0.08 a 0.05: la banda anterior dejaba en silencio (sin
  // ítem ni penalización) recetas moderadamente desviadas del ideal, lo que
  // se percibía como "el Perito no dice nada distinto" entre recetas que en
  // realidad sí variaban.
  const cnWarn = cnInRange && cnDist > 0.05;

  const nInRange = an.avgN >= sp.n_optimal.min && an.avgN <= sp.n_optimal.max;
  const nDist = Math.abs(an.avgN - sp.n_optimal.ideal) / Math.max(0.01, sp.n_optimal.max - sp.n_optimal.min);
  const nWarn = nInRange && nDist > 0.06;

  const ebWarn = an.eb < sp.eb_optimal * 0.95 && an.suppP < sp.supplementation_max - 3;

  // overDist (0..1+): qué tan lejos está el peor parámetro FUERA de su rango
  // óptimo, normalizado por el ancho del rango. 0 = justo en el borde, 1 =
  // desviado un rango completo más allá del borde. Antes ningún consumidor
  // sabía si un "crítico" apenas cruzó el límite o lo duplicó — el techo de
  // score y los deltas de corrección trataban ambos casos igual.
  const cnWidth = Math.max(0.01, sp.cn_optimal.max - sp.cn_optimal.min);
  const cnOverDist = cnHigh ? (an.cn - sp.cn_optimal.max) / cnWidth
    : cnLow ? (sp.cn_optimal.min - an.cn) / cnWidth : 0;
  const nWidth = Math.max(0.01, sp.n_optimal.max - sp.n_optimal.min);
  const nOverDist = nHigh ? (an.avgN - sp.n_optimal.max) / nWidth
    : nLow ? (sp.n_optimal.min - an.avgN) / nWidth : 0;
  const phWidth = sp.ph_optimal ? Math.max(0.01, sp.ph_optimal.max - sp.ph_optimal.min) : 1;
  const phOverDist = phHigh ? (an.avgPh - sp.ph_optimal.max) / phWidth
    : phLow ? (sp.ph_optimal.min - an.avgPh) / phWidth : 0;
  const overDist = Math.max(cnOverDist, nOverDist, phOverDist);

  return {
    cnHigh, cnLow, nLow, nHigh, trichoderma, phLow, phHigh, cnWarn, nWarn, ebWarn,
    cnDist, nDist, cnOverDist, nOverDist, phOverDist, overDist,
  };
};

// ── assessSeverity: criticals/warnings derivables solo de an/sp ──
// Deliberadamente NO replica la condición "hay un ingrediente en stock que
// lo resuelva" que el aviso de EB sin explotar tenía en el código original:
// aquí el hecho de que la receta esté por debajo de su EB potencial cuenta
// como warning siempre, sin importar si hay un insumo a mano para corregirlo.
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

  // severity: 0..1+, qué tan lejos del borde está el peor parámetro fuera de
  // rango (ver detectSeverity.overDist). Trichoderma no tiene magnitud propia
  // — se trata como el caso más severo posible.
  const severity = f.trichoderma ? 1 : Math.min(1, f.overDist || 0);

  return { criticals, warnings, severity };
};

const api = { scoreRecipe, assessSeverity, detectSeverity };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasScoring = api;
}

})();
