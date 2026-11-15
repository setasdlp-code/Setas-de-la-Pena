'use strict';
// Pronóstico de EB congelado en un lote (setas.eb-forecast.v1).
//
// Guarda exactamente el pronóstico que el usuario vio en el Formulador
// (recipeEBForecast → scoreRecipe().uncertainty.eb: centro, banda, confianza
// en escala B), no la banda interna por CV de analyze(), que no se muestra.
// Se captura una vez, al crear el lote, y no se reemplaza: sirve para medir
// después cuánto acertó el Perito contra el resultado final elegible del lote.
//
// No es calibración ni evidencia de ranking (ADR-0004): solo se lee para
// comparar predicho contra real. Complementa, sin duplicar, el
// setas.experimental-prediction.v1 de perito-composition-scenarios.js, que
// solo existe para recetas con pellets de composición estimada.
(function () {
  const SCHEMA = 'setas.eb-forecast.v1';
  const FIELD = 'forecastSnapshot';
  // Se resuelve al llamar, no al cargar: no impone orden de carga en el shell.
  const calibration = () => (typeof require === 'function'
    ? require('./historical-calibration.js')
    : globalThis.SetasHistoricalCalibration);

  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

  // FNV-1a de 32 bits: estable entre navegador y node, sin dependencias.
  const fnv1a = (text) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  };

  // Huella de la receta y de los valores efectivos que la analizaron: si un
  // insumo o el objetivo de especie cambia de valor, la huella cambia aunque la
  // receta (ids y %) sea la misma.
  const recipeFingerprint = ({ recipe = [], ings = [], sp = null } = {}) => {
    const rows = (recipe || [])
      .filter((r) => Number(r?.p) > 0)
      .map((r) => {
        const g = (ings || []).find((x) => x.id === r.id) || {};
        return [r.id, Number(r.p), g.c, g.n, g.ph, g.moisture, g.role, g.dig, g.cra];
      })
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const targets = sp ? [sp.cn_optimal, sp.n_optimal, sp.ph_optimal, sp.eb_baseline, sp.eb_optimal, sp.supplementation_max] : null;
    return 'fnv1a:' + fnv1a(JSON.stringify([rows, targets]));
  };

  // Supuestos que condicionan el pronóstico. El pH siempre es calculado: la app
  // no recibe mediciones de pH de mezcla.
  const assumptionsFor = ({ recipe = [], ings = [] } = {}) => {
    const out = [{ code: 'ph-calculated', note: 'pH calculado como promedio ponderado; no medido.' }];
    (recipe || []).filter((r) => Number(r?.p) > 0).forEach((r) => {
      const g = (ings || []).find((x) => x.id === r.id);
      if (!g) return;
      if (g.compositionStatus === 'estimated' || g.analysisProxyId) {
        out.push({ code: 'estimated-composition', ingredientId: g.id, note: `Composición de ${g.name} estimada, sin análisis del lote.` });
      }
    });
    return out;
  };

  const captureForecast = ({ forecast, analysis, recipe, sKey, ings, sp, at, modelVersion, build = null } = {}) => {
    if (!at || !modelVersion) throw new Error('El pronóstico requiere fecha y versión del modelo');
    // `central` es lo que muestra la UI; `value` (sin redondear) solo como respaldo.
    const central = num(forecast?.central ?? forecast?.value);
    const low = num(forecast?.low);
    const high = num(forecast?.high);
    if (central == null || low == null || high == null) return null;
    return JSON.parse(JSON.stringify({
      schema: SCHEMA,
      capturedAt: at,
      modelVersion,
      build,
      sKey,
      recipe: (recipe || []).map((r) => ({ id: r.id, p: Number(r.p) })),
      recipeFingerprint: recipeFingerprint({ recipe, ings, sp: sp || analysis?.sp || null }),
      shown: { central: Math.round(central), low, high },
      confidence: { scale: 'B', level: forecast?.confidence || 'low' },
      source: forecast?.source || 'theoretical',
      historyN: num(forecast?.history?.n) || 0,
      rawModelEB: num(analysis?.eb),
      validation: forecast?.validation || 'unvalidated',
      assumptions: assumptionsFor({ recipe, ings }),
    }));
  };

  // Escritura única en el cliente: un lote que ya tiene pronóstico no lo
  // reemplaza ni lo borra. La regla de Firestore aplica lo mismo en servidor.
  const protectForecast = (lote, fields) => {
    if (!fields || !(FIELD in fields) || !lote || lote[FIELD] == null) return fields;
    const { [FIELD]: _ignored, ...rest } = fields;
    return rest;
  };

  // Compara el pronóstico con el EB final del lote. Solo cuenta un resultado
  // final elegible (mismo criterio que historical-calibration.js): cosecha
  // parcial o lote abierto → sin error todavía.
  const evaluateForecast = (lote, cosechas = []) => {
    const f = lote?.[FIELD];
    if (!f || f.schema !== SCHEMA) return { status: 'sin-pronostico', forecast: null };
    const out = calibration().batchOutcome(lote, cosechas || []);
    const row = { ...out, ebReal: out.be, loteId: lote.id, recipe: f.recipe, ...(out.exclusionReason ? { exclusionReason: out.exclusionReason } : {}) };
    const cls = calibration().classifyOutcome(row, 'ebReal');
    if (!cls.eligible) return { status: 'pendiente', reason: cls.reason, forecast: f, actualEB: null, errorAbs: null, inBand: null };
    const actual = cls.eb;
    return {
      status: 'evaluado',
      forecast: f,
      actualEB: actual,
      errorAbs: Math.abs(actual - f.shown.central),
      inBand: actual >= f.shown.low && actual <= f.shown.high,
    };
  };

  const api = { SCHEMA, FIELD, recipeFingerprint, assumptionsFor, captureForecast, protectForecast, evaluateForecast };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasEbForecast = api;
})();
