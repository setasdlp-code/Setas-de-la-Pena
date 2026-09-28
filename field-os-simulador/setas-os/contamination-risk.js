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
        note: 'CO2 ≥ 2000 ppm se usa como indicador indirecto de aire estancado, no como toxicidad directa al patógeno.'
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
        return {
          ts,
          temperature_c: Number.isFinite(temperature_c) ? temperature_c : null,
          rh_pct: Number.isFinite(rh_pct) ? rh_pct : null,
          co2_ppm: Number.isFinite(co2_ppm) ? co2_ppm : null
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts);
  }

  /**
   * Extrae métricas de exposición climática de una serie temporal, robusto a huecos,
   * datos faltantes y series desordenadas.
   *
   * @param {Array<{t:*, temperature_c?:number, rh_pct?:number, co2_ppm?:number}>} series
   * @param {object} [opts]
   * @param {number} [opts.now] Epoch ms del "ahora" (obligatorio para determinismo; no usa Date.now()).
   * @param {number} [opts.windowHours=72] Ventana hacia atrás desde `now`.
   * @returns {object} Resumen de exposición con horas por criterio y cobertura.
   */
  function extractClimateExposure(series, opts = {}) {
    const now = Number.isFinite(opts.now) ? opts.now : toTimestamp(opts.now);
    const windowHours = Number.isFinite(opts.windowHours) && opts.windowHours > 0 ? opts.windowHours : 72;

    const result = {
      windowHours,
      highHumidityHours: 0,
      saturationHours: 0,
      warmHours: 0,
      hotHours: 0,
      condensationEvents: 0,
      stagnationHours: 0,
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
    const stagnationCo2 = EXPOSURE_THRESHOLDS.stagnationCo2Ppm.value;
    const condDelta = EXPOSURE_THRESHOLDS.condensationDeltaC.value;

    let coverageMs = 0;
    let prevPoint = null;
    let prevDewPoint = null;
    let wasCondensing = false;

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
        // Última lectura: se le atribuye un pequeño intervalo simétrico si hay un
        // punto previo cercano, o se ignora si es un punto aislado.
        if (prevPoint && (p.ts - prevPoint.ts) <= gapMaxMs) {
          segmentMs = Math.min(gapMaxMs, p.ts - prevPoint.ts);
        } else {
          segmentMs = 0;
        }
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

      // Condensación: la temperatura actual cae por debajo (o muy cerca) del punto de
      // rocío calculado en la lectura anterior (agua se condensa sobre superficies frías).
      // Se cuenta como EVENTO discreto (transición hacia la zona de condensación), no por
      // cada lectura sostenida dentro de ella, para no inflar el conteo en tramos largos.
      if (prevDewPoint != null && p.temperature_c != null) {
        const isCondensing = (p.temperature_c - prevDewPoint) < condDelta;
        if (isCondensing && !wasCondensing) {
          result.condensationEvents += 1;
        }
        wasCondensing = isCondensing;
      } else {
        wasCondensing = false;
      }

      if (p.temperature_c != null && p.rh_pct != null) {
        const dp = calcDewPoint(p.temperature_c, p.rh_pct);
        prevDewPoint = dp;
      } else {
        prevDewPoint = null;
      }

      prevPoint = p;
    }

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
    result.coverageRatio = windowHours > 0 ? Math.round((result.coverageHours / windowHours) * 1000) / 1000 : 0;

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
  const PATHOGEN_RISK_MODELS = Object.freeze({
    trichoderma: {
      id: 'trichoderma',
      susceptibleStages: ['incubation', 'colonization'],
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
    bacillus: {
      id: 'bacillus',
      susceptibleStages: ['fruiting'],
      earlyStageBoost: false,
      factors: [
        {
          id: 'condensationEvents',
          label: 'Eventos de condensación (agua libre)',
          weight: 0.45,
          normalizeCount: 6,
          provenance: {
            class: 'heuristic',
            source: 'Bacillus spp. asociado a exceso de agua/condensación en sustrato (consistente con nota de humedad máxima en contamination-workflow.js)',
            note: 'Heurístico interno.'
          }
        },
        {
          id: 'saturationHours',
          label: 'Horas de saturación (RH ≥98%)',
          weight: 0.35,
          normalizeHours: 24,
          provenance: {
            class: 'heuristic',
            source: 'Saturación prolongada favorece condiciones anaeróbicas superficiales asociadas a bacteriosis',
            note: 'Heurístico interno.'
          }
        },
        {
          id: 'stagnationHours',
          label: 'Horas de aire estancado (CO2 ≥2000 ppm)',
          weight: 0.20,
          normalizeHours: 24,
          provenance: {
            class: 'heuristic',
            source: 'Estancamiento agrava condiciones de baja oxigenación superficial',
            note: 'Heurístico interno.'
          }
        }
      ]
    },
    mycogone: {
      id: 'mycogone',
      susceptibleStages: ['induction', 'fruiting'],
      earlyStageBoost: false,
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
   * @param {string} [context.stage] Etapa del ciclo de vida (incubation/induction/fruiting/colonization...).
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
    const factors = [];
    let weightedSum = 0;
    let weightTotal = 0;

    for (const f of model.factors) {
      const normalized = factorNormalizedValue(f, safeExposure);
      const contribution = Math.round(normalized * f.weight * 100 * 100) / 100; // en puntos de 0-100
      weightedSum += normalized * f.weight;
      weightTotal += f.weight;
      factors.push({
        id: f.id,
        label: f.label,
        contribution,
        value: factorRawValue(f.id, safeExposure),
        provenance: f.provenance
      });
    }

    let baseScore = weightTotal > 0 ? (weightedSum / weightTotal) * 100 : 0;

    // Modificador por etapa de susceptibilidad: si la etapa actual no es susceptible,
    // se atenúa el score (persiste como riesgo latente bajo, no cero).
    const stage = ctx.stage || null;
    const stageSusceptible = stage ? model.susceptibleStages.includes(stage) : true;
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

    const exposure = extractClimateExposure(series, { now, windowHours });

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
    PATHOGEN_RISK_MODELS,
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
