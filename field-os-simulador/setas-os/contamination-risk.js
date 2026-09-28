'use strict';

/**
 * @file contamination-risk.js — Índice predictivo de riesgo de contaminación para Setas OS.
 *
 * Motor de PREVENCIÓN, no de diagnóstico: estima presión de riesgo a partir de exposición
 * climática histórica (72 h por defecto) antes de que aparezcan síntomas visibles.
 *
 * IMPORTANTE (ver .claude/skills/agronomic-claims/SKILL.md):
 * - Este módulo produce un ÍNDICE HEURÍSTICO DE RIESGO, no una probabilidad ni un
 *   diagnóstico. `confidence` nunca es 'high' aquí: es Scale A (evidencia), y esta
 *   heurística ni siquiera alcanza el piso de esa escala (no hay experimento controlado
 *   detrás). Cada resultado incluye `disclaimer` recordándolo explícitamente.
 * - Cada peso/umbral declara su `provenance` ({ class: 'literature_target'|'heuristic',
 *   source, note }). Nunca se presenta un heurístico como validado por literatura.
 * - Los ids de patógeno deben coincidir con las claves de PATHOGENS_CATALOG en
 *   contamination-workflow.js; el texto de síntomas/protocolo vive allí, no se duplica aquí.
 */

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SetasContaminationRisk = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  // --- Dependencias con fallback (Node require / globals de navegador) ---
  let ClimateMath = null;

  if (isNode) {
    try { ClimateMath = require('./climate-math.js'); } catch (e) { ClimateMath = null; }
  }
  if (!ClimateMath && typeof globalThis !== 'undefined' && globalThis.SetasClimate) {
    ClimateMath = globalThis.SetasClimate;
  }

  // contamination-workflow.js se resuelve de forma PEREZOSA (en cada llamada,
  // no al cargar este módulo). En el navegador, auth-gate.js carga este
  // archivo dentro de PROTECTED_APP_SCRIPTS, que se ejecuta ANTES que
  // DC_RUNTIME_SCRIPTS (donde vive contamination-workflow.js) — ver
  // firebase/auth-gate.js. Si PATHOGENS_CATALOG se capturara aquí arriba en
  // tiempo de carga, quedaría congelado en `{}` para siempre en el navegador
  // real, aunque contamination-workflow.js termine cargando un instante
  // después. Node no tiene este problema (require es síncrono e inmediato),
  // pero se usa la misma función perezosa en ambos entornos por consistencia.
  const resolveContaminationWorkflow = () => {
    if (isNode) {
      try { return require('./contamination-workflow.js'); } catch (e) { /* no disponible */ }
    }
    if (typeof globalThis !== 'undefined' && globalThis.SetasContaminationWorkflow) {
      return globalThis.SetasContaminationWorkflow;
    }
    return null;
  };

  const getPathogensCatalog = () => {
    const workflow = resolveContaminationWorkflow();
    return (workflow && workflow.PATHOGENS_CATALOG) || {};
  };

  // Fallback mínimo de calcDewPoint si el módulo climático no está disponible
  // (mantiene el módulo utilizable en aislamiento, p.ej. en tests unitarios parciales).
  const calcDewPoint = (ClimateMath && typeof ClimateMath.calcDewPoint === 'function')
    ? ClimateMath.calcDewPoint
    : function fallbackDewPoint(tC, rhPct) {
      const t = Number(tC);
      const rh = Number(rhPct);
      if (!Number.isFinite(t) || !Number.isFinite(rh) || rh <= 0) return null;
      const clampedRh = Math.max(0.1, Math.min(100, rh));
      const gamma = ((17.27 * t) / (t + 237.3)) + Math.log(clampedRh / 100);
      const denominator = 17.27 - gamma;
      if (denominator === 0) return null;
      return Math.round(((237.3 * gamma) / denominator) * 10) / 10;
    };

  // ---------------------------------------------------------------------
  // Umbrales de exposición climática. Todos heurísticos de manejo de cultivo,
  // no derivados de un experimento controlado en esta granja.
  // ---------------------------------------------------------------------
  const EXPOSURE_THRESHOLDS = Object.freeze({
    highHumidityRh: {
      value: 95,
      provenance: {
        class: 'heuristic',
        source: 'Práctica de manejo de sala de fructificación (umbral operativo interno)',
        note: 'HR ≥ 95% se usa como proxy de superficie húmeda prolongada, no como valor publicado específico por patógeno.'
      }
    },
    saturationRh: {
      value: 98,
      provenance: {
        class: 'heuristic',
        source: 'Práctica de manejo de sala de fructificación (umbral operativo interno)',
        note: 'HR ≥ 98% se trata como saturación funcional del aire (cercana a condensación).'
      }
    },
    warmTempC: {
      value: 25,
      provenance: {
        class: 'heuristic',
        source: 'Rango térmico habitual de competidores mesófilos de crecimiento rápido (Trichoderma/Neurospora)',
        note: 'Umbral heurístico de manejo; no es un óptimo de crecimiento medido en literatura específica citada aquí.'
      }
    },
    hotTempC: {
      value: 28,
      provenance: {
        class: 'heuristic',
        source: 'Rango térmico de alta actividad de competidores mesófilos',
        note: 'Umbral heurístico de alerta térmica, no un LD50 ni óptimo publicado.'
      }
    },
    stagnationCo2Ppm: {
      value: 2000,
      provenance: {
        class: 'heuristic',
        source: 'Proxy operativo de FAE insuficiente (Setas OS calcDynamicFAE / calcBarometricCO2Correction)',
        note: 'Umbral POR DEFECTO. CO2 ≥ 2000 ppm se usa como indicador indirecto de aire estancado en inducción/fructificación, no como toxicidad directa al patógeno. Ver STAGNATION_CO2_THRESHOLDS_BY_SPECIES para overrides por especie (p.ej. eryngii, que requiere 1500–2500 ppm como TARGET fisiológico de tallo) y el gating por etapa en scorePathogenRisk (hallazgo #15): el factor de estancamiento solo cuenta en inducción/fructificación, nunca en incubación, donde CO2 alto es normal y esperado (p.ej. >5000 ppm en incubación de eryngii, knowledge_base/01_species/pleurotus_eryngii.md).'
      }
    },
    condensationDeltaC: {
      value: 0.8,
      provenance: {
        class: 'heuristic',
        source: 'Consistente con el margen de riesgo de condensación usado en climate-math.js evalClimateHealth',
        note: 'Mismo margen ΔT aire-rocío < 0.8°C usado en el resto de Setas OS para señalar agua libre en superficie.'
      }
    },
    gapMaxMinutes: {
      value: 90,
      provenance: {
        class: 'heuristic',
        source: 'Convención operativa de continuidad de telemetría de Setas OS',
        note: 'Huecos de telemetría > 90 min se excluyen del conteo de horas de exposición para no inventar datos.'
      }
    }
  });

  // ---------------------------------------------------------------------
  // Umbral de estancamiento por CO2, por especie (hallazgo #15).
  // La KB prescribe 1,500–2,500 ppm de CO2 como TARGET fisiológico durante
  // el desarrollo del tallo de eryngii (knowledge_base/01_species/
  // pleurotus_eryngii.md), y CO2 alto (>5,000 ppm) es NORMAL durante
  // incubación de cualquier especie. Usar el umbral genérico de 2000 ppm sin
  // distinción de especie/etapa marcaba como "estancamiento" un rango que en
  // eryngii es precisamente el objetivo de manejo. El umbral por especie aquí
  // se fija POR ENCIMA del rango prescrito (nunca dentro de él); el gating
  // por etapa (solo inducción/fructificación) vive en scorePathogenRisk.
  // ---------------------------------------------------------------------
  const STAGNATION_CO2_THRESHOLDS_BY_SPECIES = Object.freeze({
    default: {
      value: 2000,
      provenance: {
        class: 'heuristic',
        source: 'Proxy operativo de FAE insuficiente (Setas OS calcDynamicFAE / calcBarometricCO2Correction)',
        note: 'Umbral por defecto para especies sin override específico en esta tabla.'
      }
    },
    p_eryngii: {
      value: 3000,
      provenance: {
        class: 'literature_target',
        source: 'knowledge_base/01_species/pleurotus_eryngii.md',
        note: 'KB prescribe 1,500–2,500 ppm de CO2 como TARGET fisiológico durante el desarrollo del tallo (día 1-6: 1,800–2,500 ppm) para lograr la morfología comercial de tallo grueso. 3000 ppm se fija por ENCIMA de ese rango objetivo, como umbral de estancamiento real, para no contar el CO2 deseado como riesgo.'
      }
    }
  });

  function getStagnationCo2Threshold(speciesId) {
    const key = typeof speciesId === 'string' ? speciesId.trim().toLowerCase() : '';
    return STAGNATION_CO2_THRESHOLDS_BY_SPECIES[key] || STAGNATION_CO2_THRESHOLDS_BY_SPECIES.default;
  }

  // ---------------------------------------------------------------------
  // Utilidades de series temporales
  // ---------------------------------------------------------------------

  function toTimestamp(t) {
    if (t == null) return NaN;
    if (t instanceof Date) return t.getTime();
    if (typeof t === 'number') return Number.isFinite(t) ? t : NaN;
    const parsed = Date.parse(t);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function sanitizeSeries(series, windowStartMs, windowEndMs) {
    if (!Array.isArray(series)) return [];
    return series
      .map((r) => {
        if (!r || typeof r !== 'object') return null;
        const ts = toTimestamp(r.t);
        if (!Number.isFinite(ts)) return null;
        if (ts < windowStartMs || ts > windowEndMs) return null;
        const temperature_c = Number(r.temperature_c);
        const rh_pct = Number(r.rh_pct);
        const co2_ppm = r.co2_ppm != null ? Number(r.co2_ppm) : null;
        const substrate_temperature_c = r.substrate_temperature_c != null ? Number(r.substrate_temperature_c) : null;
        const surface_temperature_c = r.surface_temperature_c != null ? Number(r.surface_temperature_c) : null;
        return {
          ts,
          temperature_c: Number.isFinite(temperature_c) ? temperature_c : null,
          rh_pct: Number.isFinite(rh_pct) ? rh_pct : null,
          co2_ppm: Number.isFinite(co2_ppm) ? co2_ppm : null,
          substrate_temperature_c: Number.isFinite(substrate_temperature_c) ? substrate_temperature_c : null,
          surface_temperature_c: Number.isFinite(surface_temperature_c) ? surface_temperature_c : null
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts);
  }

  /**
   * Extrae métricas de exposición climática de una serie temporal, robusto a huecos,
   * datos faltantes y series desordenadas.
   *
   * @param {Array<{t:*, temperature_c?:number, rh_pct?:number, co2_ppm?:number, substrate_temperature_c?:number, surface_temperature_c?:number}>} series
   * @param {object} [opts]
   * @param {number} [opts.now] Epoch ms del "ahora" (obligatorio para determinismo; no usa Date.now()).
   * @param {number} [opts.windowHours=72] Ventana hacia atrás desde `now`.
   * @param {string} [opts.speciesId] Usado para elegir el umbral de estancamiento por CO2
   *   (ver STAGNATION_CO2_THRESHOLDS_BY_SPECIES); sin ella se usa el umbral por defecto.
   * @returns {object} Resumen de exposición con horas por criterio y cobertura.
   */
  function extractClimateExposure(series, opts = {}) {
    const now = Number.isFinite(opts.now) ? opts.now : toTimestamp(opts.now);
    const windowHours = Number.isFinite(opts.windowHours) && opts.windowHours > 0 ? opts.windowHours : 72;
    const stagnationThreshold = getStagnationCo2Threshold(opts.speciesId);

    const result = {
      windowHours,
      highHumidityHours: 0,
      saturationHours: 0,
      warmHours: 0,
      hotHours: 0,
      // null hasta que se confirme si hay o no sensor de superficie/sustrato
      // en la serie (hallazgo #14); nunca queda en 0 por defecto cuando no
      // hay forma de saberlo.
      condensationEvents: 0,
      stagnationHours: 0,
      stagnationCo2ThresholdPpm: stagnationThreshold.value,
      stagnationCo2Provenance: stagnationThreshold.provenance,
      tempSwingMax: null,
      coverageHours: 0,
      coverageRatio: 0,
      readingCount: 0,
      gapCount: 0
    };

    if (!Number.isFinite(now)) {
      return result;
    }

    const windowEndMs = now;
    const windowStartMs = now - windowHours * 3600 * 1000;

    const points = sanitizeSeries(series, windowStartMs, windowEndMs);
    result.readingCount = points.length;

    if (points.length === 0) {
      return result;
    }

    const gapMaxMs = EXPOSURE_THRESHOLDS.gapMaxMinutes.value * 60 * 1000;
    const highRh = EXPOSURE_THRESHOLDS.highHumidityRh.value;
    const satRh = EXPOSURE_THRESHOLDS.saturationRh.value;
    const warmT = EXPOSURE_THRESHOLDS.warmTempC.value;
    const hotT = EXPOSURE_THRESHOLDS.hotTempC.value;
    const stagnationCo2 = stagnationThreshold.value;
    const condDelta = EXPOSURE_THRESHOLDS.condensationDeltaC.value;

    let coverageMs = 0;
    let wasCondensing = false;
    let condensationEventsCount = 0;
    let hasSurfaceSensor = false;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      // Duración representada por esta lectura: hasta la siguiente lectura,
      // truncada a gapMaxMinutes para no contar huecos de telemetría como exposición real.
      let segmentMs = 0;
      if (i < points.length - 1) {
        const rawGap = points[i + 1].ts - p.ts;
        if (rawGap <= gapMaxMs) {
          segmentMs = rawGap;
        } else {
          result.gapCount += 1;
          segmentMs = 0; // no se cuenta el hueco
        }
      } else {
        // Última lectura: NO se le atribuye ningún segmento propio. No hay
        // una siguiente lectura que delimite cuánto tiempo describe, y el
        // intervalo hasta ella ya quedó contado por la lectura anterior.
        // Antes se le sumaba un intervalo simétrico adicional aquí, lo que
        // duplicaba el último tramo y podía llevar coverageRatio por encima
        // de 1.0 (hallazgo #5: 73h de cobertura sobre una ventana de 72h).
        segmentMs = 0;
      }

      const segmentHours = segmentMs / 3600000;
      coverageMs += segmentMs;

      if (p.rh_pct != null) {
        if (p.rh_pct >= highRh) result.highHumidityHours += segmentHours;
        if (p.rh_pct >= satRh) result.saturationHours += segmentHours;
      }
      if (p.temperature_c != null) {
        if (p.temperature_c >= warmT) result.warmHours += segmentHours;
        if (p.temperature_c >= hotT) result.hotHours += segmentHours;
      }
      if (p.co2_ppm != null && p.co2_ppm >= stagnationCo2) {
        result.stagnationHours += segmentHours;
      }

      // Condensación (hallazgo #14): se necesita una temperatura de
      // SUPERFICIE/SUSTRATO real, no la del aire. A RH alta, el aire mismo
      // oscila por debajo de su propio punto de rocío recién calculado con
      // cualquier ruido de sensor (a RH>=90%, ~0.6°C ya alcanza), lo que
      // antes saturaba el conteo de eventos en condiciones normales de
      // fructificación. El agua se condensa quien SÍ está frío: la
      // superficie del sustrato/bloque, no el aire que la rodea. Se cuenta
      // como EVENTO discreto (transición hacia la zona de condensación), no
      // por cada lectura sostenida, para no inflar el conteo en tramos largos.
      const surfaceTemp = p.substrate_temperature_c != null
        ? p.substrate_temperature_c
        : (p.surface_temperature_c != null ? p.surface_temperature_c : null);

      if (surfaceTemp != null) hasSurfaceSensor = true;

      if (surfaceTemp != null && p.temperature_c != null && p.rh_pct != null) {
        const dp = calcDewPoint(p.temperature_c, p.rh_pct);
        const isCondensing = dp != null && (surfaceTemp - dp) < condDelta;
        if (isCondensing && !wasCondensing) {
          condensationEventsCount += 1;
        }
        wasCondensing = isCondensing;
      } else {
        // Sin sensor de superficie o sin datos suficientes en esta lectura:
        // no se puede afirmar ni descartar condensación en este punto.
        wasCondensing = false;
      }
    }

    // Sin NINGÚN sensor de superficie/sustrato en toda la serie, no hay base
    // física para afirmar 0 eventos de condensación (sería inventar un dato
    // que nunca se midió). condensationEvents queda null; el factor de
    // riesgo correspondiente lo trata como "sin evidencia" (contribución 0
    // con nota explícita), nunca como "sin riesgo confirmado".
    result.condensationEvents = hasSurfaceSensor ? condensationEventsCount : null;

    // tempSwingMax: máxima oscilación (max-min) dentro de cualquier ventana móvil de 24 h.
    let tempSwingMax = null;
    const windowMs24h = 24 * 3600 * 1000;
    let left = 0;
    // Deque simple O(n) para max y min en ventana deslizante
    const maxDeque = [];
    const minDeque = [];
    for (let right = 0; right < points.length; right++) {
      const pr = points[right];
      if (pr.temperature_c == null) continue;

      while (maxDeque.length && points[maxDeque[maxDeque.length - 1]].temperature_c <= pr.temperature_c) maxDeque.pop();
      maxDeque.push(right);
      while (minDeque.length && points[minDeque[minDeque.length - 1]].temperature_c >= pr.temperature_c) minDeque.pop();
      minDeque.push(right);

      while (left < right && pr.ts - points[left].ts > windowMs24h) {
        left++;
        while (maxDeque.length && maxDeque[0] < left) maxDeque.shift();
        while (minDeque.length && minDeque[0] < left) minDeque.shift();
      }

      if (maxDeque.length && minDeque.length) {
        const swing = points[maxDeque[0]].temperature_c - points[minDeque[0]].temperature_c;
        if (tempSwingMax == null || swing > tempSwingMax) tempSwingMax = swing;
      }
    }
    result.tempSwingMax = tempSwingMax;

    result.coverageHours = Math.round((coverageMs / 3600000) * 100) / 100;
    // Clamp defensivo: con la corrección del hallazgo #5 coverageMs ya no
    // debería poder superar windowHours, pero se deja el tope explícito para
    // que coverageRatio nunca reporte más del 100% de la ventana evaluada.
    result.coverageHours = Math.min(result.coverageHours, windowHours);
    result.coverageRatio = windowHours > 0 ? Math.round((result.coverageHours / windowHours) * 1000) / 1000 : 0;
    result.coverageRatio = Math.min(result.coverageRatio, 1);

    // Redondeo final de horas acumuladas a 2 decimales
    for (const k of ['highHumidityHours', 'saturationHours', 'warmHours', 'hotHours', 'stagnationHours']) {
      result[k] = Math.round(result[k] * 100) / 100;
    }

    return result;
  }

  // ---------------------------------------------------------------------
  // Modelos de riesgo por patógeno: factores ponderados + susceptibilidad por etapa.
  // Todos heurísticos salvo que se indique lo contrario explícitamente en provenance.
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // normalizeStage (hallazgo #6) — la comparación de etapa contra
  // susceptibleStages era sensible a mayúsculas/idioma: un `stage` en
  // español ('incubacion') no coincidía con el valor canónico en inglés
  // ('incubation') del catálogo de modelos, así que el multiplicador de
  // etapa-no-susceptible (0.4x) se aplicaba de forma incorrecta (p.ej.
  // Trichoderma en incubación real caía de 25 a ~10). Mismo enfoque de
  // normalización case/acento-insensible que SetasBiologicalClock.normalizeStage
  // (biological-clock.js), pero con tabla PROPIA: ese motor funde
  // 'fruiting'→'induction' y 'resting'→'no_aplica' para el reloj térmico, lo
  // cual perdería exactamente las distinciones de etapa que los modelos de
  // este archivo necesitan (p.ej. cobweb/mycogone distinguen 'induction' de
  // 'fruiting'; Trichoderma ahora distingue 'resting' de 'no_aplica'). Por
  // eso NO se delega en ese motor: se mantiene una tabla local equivalente,
  // en el mismo espíritu, para el vocabulario de etapa que usa este módulo.
  // Un estado desconocido devuelve null (no se asume ninguna etapa) en vez
  // de caer silenciosamente a 'incubation' como hacía la comparación previa.
  // ---------------------------------------------------------------------
  const STAGE_CATEGORY_MAP = Object.freeze({
    // Canónicos (setas-os-workflow.js NORMAL_STATES) y legacy en español.
    incubation: 'incubation',
    incubacion: 'incubation',
    inoculated: 'incubation',
    inoculado: 'incubation',
    colonization: 'colonization',
    colonizacion: 'colonization',
    induction: 'induction',
    induccion: 'induction',
    pinning: 'induction',
    fruiting: 'fruiting',
    fructificacion: 'fruiting',
    maturation: 'maturation',
    maduracion: 'maturation',
    resting: 'resting',
    descanso: 'resting',
    reposo: 'resting',
    // Estados de proceso/excepción/terminales: no corresponden a ninguna
    // etapa biológica susceptible; se devuelven explícitamente como null.
    planned: null,
    planificado: null,
    mix_prepared: null,
    mezcla_preparada: null,
    thermal_treatment: null,
    tratamiento_termico: null,
    cooling: null,
    enfriamiento: null,
    quarantine: null,
    cuarentena: null,
    discarded: null,
    descartado: null,
    failed: null,
    fallido: null,
    closed: null,
    cerrado: null,
  });

  function normalizeStage(stage) {
    if (!stage || typeof stage !== 'string') return null;
    const clean = stage.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (Object.prototype.hasOwnProperty.call(STAGE_CATEGORY_MAP, clean)) {
      return STAGE_CATEGORY_MAP[clean];
    }
    return null; // desconocido: no se asume ninguna etapa
  }

  // ---------------------------------------------------------------------
  // Relevancia por especie/género de un modelo de patógeno (hallazgo #13):
  // Mycogone perniciosa está reportada mayoritariamente como patógeno de
  // Agaricus bisporus; este catálogo de especies no cultiva Agaricus
  // (solo Pleurotus/Lentinula/Ganoderma), así que su score no debería
  // dominar el ranking de patógenos de un lote de esas especies sin
  // evidencia propia. `default` heurístico (no medido en esta granja).
  // ---------------------------------------------------------------------
  function speciesGenusRelevance(speciesId, relevanceMap) {
    if (!relevanceMap) return 1;
    const id = typeof speciesId === 'string' ? speciesId.trim().toLowerCase() : '';
    const isAgaricus = id.startsWith('a_') || id.includes('agaricus') || id.includes('bisporus');
    if (isAgaricus) {
      return Number.isFinite(relevanceMap.agaricus) ? relevanceMap.agaricus : 1;
    }
    return Number.isFinite(relevanceMap.default) ? relevanceMap.default : 1;
  }

  const PATHOGEN_RISK_MODELS = Object.freeze({
    trichoderma: {
      id: 'trichoderma',
      // 'maturation' y 'resting' agregados (hallazgo #6): el bloque de
      // reposo entre oleadas es una ventana clásica de Trichoderma (sustrato
      // ya colonizado, sin actividad de fructificación activa que lo proteja,
      // igual que la maduración postcolonización).
      susceptibleStages: ['incubation', 'colonization', 'maturation', 'resting'],
      earlyStageBoost: true,
      factors: [
        {
          id: 'warmHours',
          label: 'Horas cálidas (≥25°C)',
          weight: 0.45,
          normalizeHours: 48,
          provenance: {
            class: 'heuristic',
            source: 'Trichoderma spp. crece agresivamente en rangos mesófilos cálidos (observación general de manejo, no ensayo controlado propio)',
            note: 'Peso heurístico; no calibrado contra incidencia real de esta granja.'
          }
        },
        {
          id: 'hotHours',
          label: 'Horas calientes (≥28°C)',
          weight: 0.30,
          normalizeHours: 24,
          provenance: {
            class: 'heuristic',
            source: 'Refuerzo heurístico sobre warmHours para picos térmicos',
            note: 'Heurístico interno, sin cita de literatura específica confiable.'
          }
        },
        {
          id: 'stagnationHours',
          label: 'Horas de aire estancado (CO2 ≥2000 ppm)',
          weight: 0.25,
          normalizeHours: 24,
          provenance: {
            class: 'heuristic',
            source: 'Proxy de FAE deficiente asociado a favorecer competidores de crecimiento rápido',
            note: 'Heurístico interno.'
          }
        }
      ]
    },
    neurospora: {
      id: 'neurospora',
      susceptibleStages: ['incubation', 'colonization'],
      earlyStageBoost: true,
      factors: [
        {
          id: 'warmHours',
          label: 'Horas cálidas (≥25°C)',
          weight: 0.40,
          normalizeHours: 48,
          provenance: {
            class: 'heuristic',
            source: 'Neurospora sitophila favorecida por temperaturas cálidas y humedad (observación general de manejo)',
            note: 'Heurístico interno; peso no calibrado con datos propios.'
          }
        },
        {
          id: 'hotHours',
          label: 'Horas calientes (≥28°C)',
          weight: 0.35,
          normalizeHours: 24,
          provenance: {
            class: 'heuristic',
            source: 'Refuerzo heurístico sobre warmHours',
            note: 'Heurístico interno.'
          }
        },
        {
          id: 'highHumidityHours',
          label: 'Horas de humedad alta (RH ≥95%)',
          weight: 0.25,
          normalizeHours: 48,
          provenance: {
            class: 'heuristic',
            source: 'Filtros de bolsa comprometidos + alta humedad favorecen germinación de ascosporas (observación general)',
            note: 'Heurístico interno.'
          }
        }
      ]
    },
    cobweb: {
      id: 'cobweb',
      susceptibleStages: ['induction', 'fruiting'],
      earlyStageBoost: false,
      factors: [
        {
          id: 'highHumidityHours',
          label: 'Horas de humedad alta (RH ≥95%)',
          weight: 0.45,
          normalizeHours: 48,
          provenance: {
            class: 'heuristic',
            source: 'Dactylium/Cladobotryum favorecidos por HR muy alta y agua libre (consistente con protocolo de salting y reducción de HR en contamination-workflow.js)',
            note: 'Heurístico interno; consistente con manejo de campo documentado, no un estudio propio.'
          }
        },
        {
          id: 'stagnationHours',
          label: 'Horas de aire estancado (CO2 ≥2000 ppm)',
          weight: 0.30,
          normalizeHours: 24,
          provenance: {
            class: 'heuristic',
            source: 'Aire estancado favorece acumulación de esporas y humedad superficial',
            note: 'Heurístico interno.'
          }
        },
        {
          id: 'condensationEvents',
          label: 'Eventos de condensación',
          weight: 0.25,
          normalizeCount: 6,
          provenance: {
            class: 'heuristic',
            source: 'Agua libre superficial favorece desarrollo de micelio parásito',
            note: 'Heurístico interno.'
          }
        }
      ]
    },
    // Bacillus (hallazgo #12): PATHOGENS_CATALOG.bacillus (contamination-workflow.js)
    // lo describe como grano/sustrato húmedo, grasoso, de olor agrio, por
    // esterilización deficiente o exceso de agua en la MEZCLA — un problema
    // de preparación/incubación, no de condensación en sala de
    // fructificación (eso es mancha bacteriana por Pseudomonas tolaasii,
    // patógeno distinto, no catalogado aquí). El modelo anterior usaba
    // condensationEvents/saturationHours de fructificación como drivers
    // principales, prediciendo el patógeno equivocado. La causa real
    // (falla de autoclave, exceso de agua al mezclar) no es observable
    // desde telemetría ambiental de sala: los pesos aquí son
    // deliberadamente bajos y el clima solo aporta una señal MUY débil.
    bacillus: {
      id: 'bacillus',
      susceptibleStages: ['incubation'],
      earlyStageBoost: true,
      factors: [
        {
          id: 'warmHours',
          label: 'Horas cálidas (≥25°C) en incubación',
          weight: 0.5,
          normalizeHours: 48,
          provenance: {
            class: 'heuristic',
            source: 'Catálogo (contamination-workflow.js): Bacillus subtilis/B. cereus asociado a grano/sustrato húmedo por esterilización deficiente o exceso de agua en la mezcla, no a condensación de fructificación',
            note: 'Proxy MUY débil: temperatura de sala no mide humedad de sustrato ni eficacia de esterilización. Peso bajo a propósito; confidence de este módulo nunca sube de "low" (ver agronomic-claims).'
          }
        },
        {
          id: 'stagnationHours',
          label: 'Horas de aire estancado (CO2 alto) en incubación',
          weight: 0.5,
          normalizeHours: 24,
          provenance: {
            class: 'heuristic',
            source: 'Aire estancado en sala de incubación puede coincidir con bolsas de grano mal preparadas con exceso de actividad metabólica/humedad, pero es un proxy indirecto',
            note: 'Proxy débil, no una medición de humedad de sustrato. Peso bajo a propósito; el diagnóstico real requiere inspección física del grano/bolsa, no telemetría de sala.'
          }
        }
      ]
    },
    mycogone: {
      id: 'mycogone',
      susceptibleStages: ['induction', 'fruiting'],
      earlyStageBoost: false,
      // Hallazgo #13: Mycogone perniciosa está reportada mayoritariamente
      // como patógeno de Agaricus bisporus en la literatura de cultivo
      // comercial; este catálogo de especies no cultiva Agaricus (solo
      // Pleurotus/Lentinula/Ganoderma), así que su relevancia real para los
      // lotes de esta granja es menor de lo que el score climático crudo
      // sugiere. Sin este ajuste, mycogone dominaba el ranking de patógenos
      // en lotes de fructificación pese a no ser el riesgo dominante
      // esperado para estas especies.
      speciesRelevance: {
        agaricus: 1.0,
        default: 0.3,
        provenance: {
          class: 'heuristic',
          source: 'Mycogone perniciosa (Burbuja Húmeda) reportada mayoritariamente en Agaricus bisporus; sin evidencia propia de incidencia en Pleurotus/Lentinula/Ganoderma en esta granja',
          note: 'Peso 0.3 heurístico para especies no-Agaricus (todo el catálogo actual de la granja); no calibrado contra incidencia real propia. No reduce a 0: el patógeno puede afectar otros géneros, solo con menor frecuencia reportada.'
        }
      },
      factors: [
        {
          id: 'highHumidityHours',
          label: 'Horas de humedad alta (RH ≥95%)',
          weight: 0.40,
          normalizeHours: 48,
          provenance: {
            class: 'heuristic',
            source: 'Mycogone perniciosa favorecida por HR alta prolongada (observación general de manejo)',
            note: 'Heurístico interno.'
          }
        },
        {
          id: 'stagnationHours',
          label: 'Horas de aire estancado (CO2 ≥2000 ppm)',
          weight: 0.35,
          normalizeHours: 24,
          provenance: {
            class: 'heuristic',
            source: 'Aire estancado favorece acumulación de esporas en superficie de sustrato',
            note: 'Heurístico interno.'
          }
        },
        {
          id: 'condensationEvents',
          label: 'Eventos de condensación',
          weight: 0.25,
          normalizeCount: 6,
          provenance: {
            class: 'heuristic',
            source: 'Agua libre superficial asociada a desarrollo de burbuja húmeda',
            note: 'Heurístico interno.'
          }
        }
      ]
    }
  });

  const PREVENTIVE_ACTIONS_BY_FACTOR = Object.freeze({
    warmHours: [
      'Bajar temperatura de sala hacia el rango objetivo de la etapa actual.',
      'Revisar aislamiento térmico y carga solar de la sala.'
    ],
    hotHours: [
      'Activar enfriamiento adicional o revisar falla de equipo de clima.',
      'Priorizar inspección visual de bolsas/bloques más expuestos al calor.'
    ],
    highHumidityHours: [
      'Reducir humedad relativa objetivo 2-4 puntos y aumentar recirculación suave de aire.',
      'Revisar nebulización: ciclos más cortos o menor caudal.'
    ],
    saturationHours: [
      'Verificar y corregir fugas o exceso de nebulización que satura el ambiente.',
      'Aumentar FAE para romper la capa de aire saturado cerca de la superficie.'
    ],
    stagnationHours: [
      'Aumentar ciclo de FAE (ver calcDynamicFAE) para romper estancamiento de CO2.',
      'Revisar extractor/ductos por obstrucciones.'
    ],
    condensationEvents: [
      'Eliminar agua libre visible en bolsas/bloques y bandejas de drenaje.',
      'Reducir oscilación térmica día/noche para evitar cruces bajo el punto de rocío.'
    ],
    tempSwingMax: [
      'Estabilizar el control de temperatura para reducir oscilaciones día/noche.'
    ]
  });

  function clamp01to100(n) {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function levelFromScore(score) {
    if (score >= 75) return 'crítico';
    if (score >= 50) return 'alto';
    if (score >= 25) return 'moderado';
    return 'bajo';
  }

  function factorRawValue(factorId, exposure) {
    switch (factorId) {
      case 'warmHours': return exposure.warmHours;
      case 'hotHours': return exposure.hotHours;
      case 'highHumidityHours': return exposure.highHumidityHours;
      case 'saturationHours': return exposure.saturationHours;
      case 'stagnationHours': return exposure.stagnationHours;
      case 'condensationEvents': return exposure.condensationEvents;
      case 'tempSwingMax': return exposure.tempSwingMax;
      default: return null;
    }
  }

  function factorNormalizedValue(factorDef, exposure) {
    const raw = factorRawValue(factorDef.id, exposure);
    if (raw == null || !Number.isFinite(raw)) return 0;
    if (factorDef.normalizeHours) {
      return Math.max(0, Math.min(1, raw / factorDef.normalizeHours));
    }
    if (factorDef.normalizeCount) {
      return Math.max(0, Math.min(1, raw / factorDef.normalizeCount));
    }
    return 0;
  }

  /**
   * Calcula el puntaje de riesgo heurístico (0-100) para un patógeno dado, a partir de
   * la exposición climática y el contexto de manejo del lote/sala.
   *
   * @param {string} pathogenId Debe coincidir con una clave de PATHOGENS_CATALOG.
   * @param {object} exposure Salida de extractClimateExposure().
   * @param {object} [context]
   * @param {string} [context.stage] Etapa del ciclo de vida (canónico inglés o legacy español,
   *   case/acento-insensible vía normalizeStage: incubation/induction/fruiting/maturation/resting/...).
   * @param {string} [context.speciesId] Usado para el ajuste de relevancia por especie/género
   *   (hallazgo #13, p.ej. Mycogone perniciosa en especies no-Agaricus).
   * @param {number} [context.daysSinceInoculation]
   * @param {object} [context.roomHistory] { contaminationEventsLast30d, pathogenIds:[] }
   * @param {number} [context.substratePh]
   * @returns {object} { pathogenId, score, level, factors, preventiveActions, confidence, disclaimer }
   */
  function scorePathogenRisk(pathogenId, exposure, context = {}) {
    const model = PATHOGEN_RISK_MODELS[pathogenId];
    const ctx = context || {};
    const disclaimer = 'Índice heurístico de riesgo de contaminación, NO una probabilidad ni un diagnóstico. ' +
      'No reemplaza inspección visual ni protocolos de bioseguridad de contamination-workflow.js.';

    if (!model) {
      return {
        pathogenId: pathogenId || 'desconocido',
        score: 0,
        level: 'sin_datos',
        factors: [],
        preventiveActions: [],
        confidence: 'low',
        disclaimer
      };
    }

    const safeExposure = exposure && typeof exposure === 'object' ? exposure : {};
    // Categoría de etapa normalizada (hallazgo #6) — usada tanto para el
    // multiplicador de susceptibilidad por etapa más abajo como para el
    // gating del factor stagnationHours (hallazgo #15).
    const stageCategory = ctx.stage ? normalizeStage(ctx.stage) : null;
    const factors = [];
    let weightedSum = 0;
    let weightTotal = 0;

    for (const f of model.factors) {
      // Hallazgo #15: CO2 alto es normal (y a menudo deseable) fuera de
      // inducción/fructificación — p.ej. >5000 ppm es rutinario en
      // incubación (knowledge_base/01_species/pleurotus_eryngii.md). El
      // factor de estancamiento solo cuenta cuando la etapa evaluada es
      // 'induction' o 'fruiting'; en cualquier otra etapa (o etapa
      // desconocida) contribuye 0 en vez de sobre-contar CO2 esperado como
      // riesgo de contaminación.
      const stagnationGated = f.id === 'stagnationHours' && stageCategory !== 'induction' && stageCategory !== 'fruiting';
      const normalized = stagnationGated ? 0 : factorNormalizedValue(f, safeExposure);
      const contribution = Math.round(normalized * f.weight * 100 * 100) / 100; // en puntos de 0-100
      weightedSum += normalized * f.weight;
      weightTotal += f.weight;
      const factorEntry = {
        id: f.id,
        label: f.label,
        contribution,
        value: factorRawValue(f.id, safeExposure),
        provenance: f.provenance
      };
      if (stagnationGated) {
        factorEntry.note = 'CO2 alto es normal fuera de inducción/fructificación (p.ej. incubación); no se cuenta como estancamiento en esta etapa.';
      }
      if (f.id === 'condensationEvents' && safeExposure.condensationEvents == null) {
        factorEntry.note = 'sin sensor de superficie';
      }
      factors.push(factorEntry);
    }

    let baseScore = weightTotal > 0 ? (weightedSum / weightTotal) * 100 : 0;

    // Hallazgo #13: relevancia por especie/género (p.ej. Mycogone en
    // especies no-Agaricus) atenúa el score ANTES del multiplicador de
    // etapa, para que un patógeno poco relevante para la especie del lote
    // no domine el ranking solo por exposición climática favorable.
    let speciesMultiplier = 1;
    if (model.speciesRelevance) {
      speciesMultiplier = speciesGenusRelevance(ctx.speciesId, model.speciesRelevance);
    }
    baseScore *= speciesMultiplier;

    // Modificador por etapa de susceptibilidad: si la etapa actual no es susceptible,
    // se atenúa el score (persiste como riesgo latente bajo, no cero). Usa
    // stageCategory (normalizado, hallazgo #6), no el `stage` crudo: una
    // etapa desconocida (stageCategory null) se trata igual que "sin dato de
    // etapa" (susceptible por defecto), en vez de fallar la comparación
    // silenciosamente por mayúsculas/idioma como antes.
    const stageSusceptible = stageCategory ? model.susceptibleStages.includes(stageCategory) : true;
    let stageMultiplier = stageSusceptible ? 1.0 : 0.4;

    // Refuerzo temprano: si el modelo marca earlyStageBoost y estamos en los primeros días,
    // se incrementa ligeramente el score (ventana crítica de colonización).
    if (model.earlyStageBoost && Number.isFinite(ctx.daysSinceInoculation) && ctx.daysSinceInoculation <= 5) {
      stageMultiplier *= 1.15;
    }

    let score = clamp01to100(baseScore * stageMultiplier);

    // Historial de la sala: eventos previos del mismo patógeno elevan el score (memoria de esporas).
    const roomHistory = ctx.roomHistory && typeof ctx.roomHistory === 'object' ? ctx.roomHistory : null;
    if (roomHistory) {
      const priorEvents = Number(roomHistory.contaminationEventsLast30d) || 0;
      const pathogenIds = Array.isArray(roomHistory.pathogenIds) ? roomHistory.pathogenIds : [];
      const samePathogenHistory = pathogenIds.includes(pathogenId);
      if (samePathogenHistory && priorEvents > 0) {
        const historyBoost = Math.min(15, priorEvents * 5);
        score = clamp01to100(score + historyBoost);
        factors.push({
          id: 'roomHistory',
          label: `Historial de sala: ${priorEvents} evento(s) previos del mismo patógeno en 30 días`,
          contribution: historyBoost,
          value: priorEvents,
          provenance: {
            class: 'heuristic',
            source: 'Memoria de inóculo residual en sala (esporas persistentes)',
            note: 'Heurístico interno, no calibrado contra tasa real de reincidencia de esta granja.'
          }
        });
      }
    }

    factors.sort((a, b) => (b.contribution || 0) - (a.contribution || 0));

    const preventiveActions = [];
    const seenActions = new Set();
    for (const f of factors) {
      const actions = PREVENTIVE_ACTIONS_BY_FACTOR[f.id];
      if (!actions) continue;
      for (const a of actions) {
        if (!seenActions.has(a)) {
          seenActions.add(a);
          preventiveActions.push(a);
        }
      }
      if (preventiveActions.length >= 4) break;
    }
    if (preventiveActions.length === 0) {
      preventiveActions.push('Sin factores de exposición climática relevantes detectados; mantener monitoreo visual de rutina.');
    }

    return {
      pathogenId,
      score: Math.round(score * 10) / 10,
      level: levelFromScore(score),
      factors,
      preventiveActions,
      confidence: 'low',
      disclaimer
    };
  }

  function coverageConfidence(coverageRatio) {
    // Nunca 'high': esta heurística no cumple el piso de evidencia de Scale A.
    return coverageRatio >= 0.5 ? 'medium' : 'low';
  }

  /**
   * Evalúa el riesgo de contaminación de un lote a partir de su serie climática.
   *
   * @param {object} params
   * @param {object} params.lot { id/lotId, stage, daysSinceInoculation, substratePh, ... }
   * @param {Array} params.series Serie climática cruda [{t, temperature_c, rh_pct, co2_ppm}].
   * @param {object} [params.roomHistory]
   * @param {number} params.now Epoch ms de referencia (obligatorio, no se infiere internamente).
   * @param {number} [params.windowHours=72]
   * @returns {object}
   */
  function assessLotRisk({ lot = {}, series = [], roomHistory = null, now, windowHours = 72 } = {}) {
    const lotId = (lot && (lot.id || lot.lotId)) || null;
    const disclaimer = 'Índice heurístico de riesgo de contaminación, NO una probabilidad ni un diagnóstico. ' +
      'No reemplaza inspección visual ni protocolos de bioseguridad de contamination-workflow.js.';

    const speciesId = (lot && (lot.speciesId || lot.especie || lot.sKey)) || null;
    const exposure = extractClimateExposure(series, { now, windowHours, speciesId });

    if (!exposure.readingCount) {
      return {
        lotId,
        overallScore: 0,
        overallLevel: 'sin_datos',
        pathogens: [],
        topFactors: [],
        coverage: exposure,
        confidence: 'low',
        disclaimer: disclaimer + ' Sin lecturas de telemetría en la ventana evaluada: no es posible estimar exposición.'
      };
    }

    const context = {
      stage: lot.stage || lot.lifecycleState || null,
      speciesId,
      daysSinceInoculation: Number.isFinite(lot.daysSinceInoculation) ? lot.daysSinceInoculation : undefined,
      roomHistory,
      substratePh: lot.substratePh
    };

    const pathogenIds = Object.keys(PATHOGEN_RISK_MODELS);
    const pathogens = pathogenIds
      .map((pid) => scorePathogenRisk(pid, exposure, context))
      .sort((a, b) => b.score - a.score);

    const overallScore = pathogens.length ? pathogens[0].score : 0;
    const overallLevel = pathogens.length ? pathogens[0].level : 'sin_datos';

    const topFactorsMap = new Map();
    for (const p of pathogens) {
      for (const f of p.factors) {
        const prev = topFactorsMap.get(f.id);
        if (!prev || f.contribution > prev.contribution) {
          topFactorsMap.set(f.id, f);
        }
      }
    }
    const topFactors = Array.from(topFactorsMap.values())
      .sort((a, b) => (b.contribution || 0) - (a.contribution || 0))
      .slice(0, 5);

    let confidence = coverageConfidence(exposure.coverageRatio);
    let finalDisclaimer = disclaimer;
    if (exposure.coverageRatio < 0.5) {
      finalDisclaimer += ` Cobertura de telemetría baja (${Math.round(exposure.coverageRatio * 100)}% de la ventana de ${windowHours} h): el índice puede subestimar exposición real.`;
    }

    return {
      lotId,
      overallScore,
      overallLevel,
      pathogens,
      topFactors,
      coverage: exposure,
      confidence,
      disclaimer: finalDisclaimer
    };
  }

  /**
   * Agrega el riesgo de varios lotes de una sala.
   *
   * @param {object} params
   * @param {string} [params.roomId]
   * @param {Array<object>} params.lots Lotes de la sala; cada uno puede traer su propia `series`,
   *   o se puede pasar una única `series` compartida a nivel de sala.
   * @param {Array} [params.series] Serie climática de la sala, usada como fallback si un lote no trae la suya.
   * @param {object} [params.roomHistory]
   * @param {number} params.now
   * @returns {object}
   */
  function assessRoomRisk({ roomId = null, lots = [], series = [], roomHistory = null, now, windowHours = 72 } = {}) {
    const disclaimer = 'Índice heurístico de riesgo de contaminación agregado por sala, NO una probabilidad ni un diagnóstico.';

    if (!Array.isArray(lots) || lots.length === 0) {
      return {
        roomId,
        overallScore: 0,
        overallLevel: 'sin_datos',
        lots: [],
        topFactors: [],
        confidence: 'low',
        disclaimer
      };
    }

    const lotResults = lots.map((lot) => {
      const lotSeries = Array.isArray(lot.series) ? lot.series : series;
      return assessLotRisk({ lot, series: lotSeries, roomHistory, now, windowHours });
    });

    const withData = lotResults.filter((r) => r.overallLevel !== 'sin_datos');
    const overallScore = withData.length ? Math.max(...withData.map((r) => r.overallScore)) : 0;
    const overallLevel = withData.length ? levelFromScore(overallScore) : 'sin_datos';

    const topFactorsMap = new Map();
    for (const r of lotResults) {
      for (const f of r.topFactors) {
        const prev = topFactorsMap.get(f.id);
        if (!prev || f.contribution > prev.contribution) {
          topFactorsMap.set(f.id, f);
        }
      }
    }
    const topFactors = Array.from(topFactorsMap.values())
      .sort((a, b) => (b.contribution || 0) - (a.contribution || 0))
      .slice(0, 5);

    // Confianza de sala: 'medium' solo si TODOS los lotes con datos tienen cobertura adecuada.
    const confidence = withData.length && withData.every((r) => r.confidence === 'medium') ? 'medium' : 'low';

    return {
      roomId,
      overallScore,
      overallLevel,
      lots: lotResults,
      topFactors,
      confidence,
      disclaimer
    };
  }

  const api = {
    EXPOSURE_THRESHOLDS,
    STAGNATION_CO2_THRESHOLDS_BY_SPECIES,
    PATHOGEN_RISK_MODELS,
    normalizeStage,
    getStagnationCo2Threshold,
    extractClimateExposure,
    scorePathogenRisk,
    assessLotRisk,
    assessRoomRisk,
    getPathogensCatalog
  };

  // PATHOGENS_CATALOG se expone como propiedad de solo lectura resuelta en
  // cada acceso (no en la carga del módulo) para que consultarla después de
  // que contamination-workflow.js termine de cargar siempre vea el catálogo
  // real, sin importar el orden de <script> en el navegador.
  Object.defineProperty(api, 'PATHOGENS_CATALOG', {
    enumerable: true,
    get: getPathogensCatalog
  });

  return api;
});
