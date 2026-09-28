'use strict';

/**
 * @file biological-clock.js — Reloj Biológico Térmico de Setas OS.
 *
 * Modelo de "tiempo térmico" (grados-hora) para reemplazar el conteo de días
 * calendario por una medida basada en la temperatura realmente experimentada
 * por el sustrato/micelio. Un lote a 15°C constante no avanza al mismo ritmo
 * biológico que uno a 24°C, aunque hayan transcurrido los mismos días de reloj.
 *
 * Todas las constantes propias de este módulo (tabla `TBASE_TABLE`) llevan
 * `provenance` explícito por especie, según las reglas de
 * `.claude/skills/agronomic-claims/SKILL.md`: nunca se afirma "óptimo" sobre
 * un parámetro no medido, y la confianza de cualquier resultado se limita a
 * 'low' | 'medium' (nunca 'high') — esto es tiempo térmico estimado, no un
 * ensayo experimental replicado.
 *
 * Reutiliza `flush-forecast-engine.js` (SPECIES_FLUSH_PROFILES) para tOpt/tMax
 * y para los conteos de días nominales de incubación y primera cosecha; no
 * duplica esas tablas.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  // ---------------------------------------------------------------------
  // Dependencia opcional: flush-forecast-engine.js (perfiles de especie)
  // ---------------------------------------------------------------------
  let FlushForecast = null;
  if (isNode) {
    try {
      // eslint-disable-next-line global-require
      FlushForecast = require('./flush-forecast-engine.js');
    } catch (e) {
      FlushForecast = null;
    }
  } else if (typeof globalThis !== 'undefined' && globalThis.SetasFlushForecast) {
    FlushForecast = globalThis.SetasFlushForecast;
  }

  const round1 = (v) => Math.round(v * 10) / 10;
  const round2 = (v) => Math.round(v * 100) / 100;
  const round3 = (v) => Math.round(v * 1000) / 1000;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /**
   * Fallback mínimo de perfiles de especie, usado únicamente si
   * flush-forecast-engine.js no está disponible en el entorno de ejecución.
   * No sustituye ni duplica esa tabla: solo evita que este módulo falle
   * cuando se lo importa de manera aislada (p.ej. pruebas unitarias sueltas).
   */
  const FALLBACK_SPECIES_PROFILES = {
    p_ostreatus_gris: { name: 'Orellana Gris', tOpt: 25, tMax: 32, nominalIncubationDays: 20, nominalFirstFlushDays: 32 },
    p_ostreatus_blanco: { name: 'Orellana Blanca', tOpt: 26, tMax: 33, nominalIncubationDays: 22, nominalFirstFlushDays: 35 },
    p_djamor_rosa: { name: 'Orellana Rosa', tOpt: 29, tMax: 35, nominalIncubationDays: 16, nominalFirstFlushDays: 26 },
    p_eryngii: { name: 'Seta de Cardo', tOpt: 24, tMax: 30, nominalIncubationDays: 30, nominalFirstFlushDays: 46 },
    shiitake: { name: 'Shiitake', tOpt: 25, tMax: 30, nominalIncubationDays: 60, nominalFirstFlushDays: 92 },
    lions_mane: { name: 'Melena de León', tOpt: 24, tMax: 29, nominalIncubationDays: 24, nominalFirstFlushDays: 38 },
    nameko: { name: 'Nameko', tOpt: 23, tMax: 28, nominalIncubationDays: 36, nominalFirstFlushDays: 55 },
    enoki: { name: 'Enoki', tOpt: 22, tMax: 27, nominalIncubationDays: 26, nominalFirstFlushDays: 48 },
    reishi: { name: 'Reishi', tOpt: 30, tMax: 36, nominalIncubationDays: 50, nominalFirstFlushDays: 115 },
  };

  const normalizeSpeciesKey = (key) => {
    if (FlushForecast && typeof FlushForecast.normalizeSpeciesKey === 'function') {
      return FlushForecast.normalizeSpeciesKey(key);
    }
    if (!key || typeof key !== 'string') return 'p_ostreatus_gris';
    const clean = key.trim().toLowerCase().replace(/[-\s]+/g, '_');
    return FALLBACK_SPECIES_PROFILES[clean] ? clean : 'p_ostreatus_gris';
  };

  const getSpeciesProfileRaw = (speciesId) => {
    const norm = normalizeSpeciesKey(speciesId);
    if (FlushForecast && typeof FlushForecast.getSpeciesFlushProfile === 'function') {
      return { key: norm, profile: FlushForecast.getSpeciesFlushProfile(norm), fromFallback: false };
    }
    return { key: norm, profile: FALLBACK_SPECIES_PROFILES[norm] || FALLBACK_SPECIES_PROFILES.p_ostreatus_gris, fromFallback: true };
  };

  /**
   * Temperatura base (tBase) del modelo de tiempo térmico, POR ESPECIE.
   *
   * No es el mismo campo `tBase` de `flush-forecast-engine.js` — ese describe
   * el umbral de retardo cinético (Q10) para la velocidad de colonización.
   * Este es el umbral de cero crecimiento biológico neto usado para integrar
   * grados-hora efectivos. Se mantienen separados a propósito para no
   * mezclar dos modelos distintos en un solo campo.
   *
   * Todas las entradas son estimaciones heurísticas de literatura general de
   * cultivo (no ensayos propios de la finca) y por eso su `provenance.class`
   * es 'heuristic' con confianza 'low'; no representan un óptimo medido.
   */
  const TBASE_TABLE = Object.freeze({
    p_ostreatus_gris: { tBaseC: 10, provenance: { class: 'heuristic', source: 'Rango general de género Pleurotus en literatura de cultivo comercial', note: 'No calibrado con datos de finca; umbral aproximado de cese de crecimiento micelial/fructificación por frío.' } },
    p_ostreatus_blanco: { tBaseC: 10, provenance: { class: 'heuristic', source: 'Rango general de género Pleurotus en literatura de cultivo comercial', note: 'Extrapolado de P. ostreatus; no medido en finca.' } },
    p_djamor_rosa: { tBaseC: 15, provenance: { class: 'heuristic', source: 'Literatura de cultivo de Pleurotus djamor (especie termófila)', note: 'Especie termófila estricta; umbral más alto que otros Pleurotus. No medido en finca.' } },
    p_eryngii: { tBaseC: 10, provenance: { class: 'heuristic', source: 'Rango general de género Pleurotus en literatura de cultivo comercial', note: 'Extrapolado de P. ostreatus; no medido en finca.' } },
    shiitake: { tBaseC: 10, provenance: { class: 'heuristic', source: 'Literatura de cultivo de Lentinula edodes', note: 'No calibrado con datos de finca.' } },
    lions_mane: { tBaseC: 12, provenance: { class: 'heuristic', source: 'Literatura de cultivo de Hericium erinaceus', note: 'No calibrado con datos de finca.' } },
    nameko: { tBaseC: 10, provenance: { class: 'heuristic', source: 'Extrapolado de rango general de hongos de sustrato lignocelulósico de clima templado', note: 'Sin referencia específica de Pholiota nameko disponible en la base de conocimiento; valor provisional.' } },
    enoki: { tBaseC: 8, provenance: { class: 'heuristic', source: 'Literatura general de Flammulina velutipes (especie psicrófila)', note: 'Fructifica a temperaturas más bajas que el resto del catálogo; valor provisional, no medido en finca.' } },
    reishi: { tBaseC: 15, provenance: { class: 'heuristic', source: 'Literatura de cultivo de Ganoderma lucidum', note: 'No calibrado con datos de finca.' } },
  });

  const DEFAULT_TBASE = { tBaseC: 10, provenance: { class: 'heuristic', source: 'Valor genérico de respaldo (especie no catalogada)', note: 'Se usó porque la especie solicitada no tiene entrada propia en TBASE_TABLE.' } };

  /**
   * Construye el perfil térmico (tBase/tOpt/tMax) de una especie combinando
   * TBASE_TABLE (propio de este módulo) con tOpt/tMax de flush-forecast-engine.
   */
  const getThermalProfile = (speciesId) => {
    const { key, profile, fromFallback } = getSpeciesProfileRaw(speciesId);
    const tbaseEntry = TBASE_TABLE[key] || DEFAULT_TBASE;
    const tOpt = Number.isFinite(profile.tOpt) ? profile.tOpt : (Number.isFinite(profile.tRef) ? profile.tRef + 1 : 24);
    const tMax = Number.isFinite(profile.tMax) ? profile.tMax : 32;
    const tBase = tbaseEntry.tBaseC;
    // tRef: temperatura ambiente de referencia usada por flush-forecast-engine.js
    // para derivar nominalIncubationDays/nominalFirstFlushDays. No es tOpt: los
    // conteos de días nominales están calibrados a tRef, no al óptimo (ver
    // stageRequirement más abajo).
    const tRef = Number.isFinite(profile.tRef) ? profile.tRef : tOpt;

    return {
      speciesId: key,
      speciesName: profile.name || key,
      tBase,
      tOpt: tBase < tOpt ? tOpt : tBase + 1, // garantiza tOpt > tBase
      tMax: tMax > tOpt ? tMax : tOpt + 1, // garantiza tMax > tOpt
      tRef,
      tBaseProvenance: tbaseEntry.provenance,
      tOptTMaxSource: fromFallback
        ? { class: 'heuristic', source: 'Tabla de respaldo interna de biological-clock.js', note: 'flush-forecast-engine.js no estaba disponible al cargar este módulo.' }
        : { class: 'heuristic', source: 'flush-forecast-engine.js SPECIES_FLUSH_PROFILES.tOpt/tMax', note: 'Cardinales térmicos usados por el motor de pronóstico de oleadas; no llevan cita de literatura primaria asociada, no representan un óptimo medido ni validado en finca.' },
      nominalIncubationDays: Number.isFinite(profile.nominalIncubationDays) ? profile.nominalIncubationDays : null,
      nominalFirstFlushDays: Number.isFinite(profile.nominalFirstFlushDays) ? profile.nominalFirstFlushDays : null,
      nominalMaturationDays: Number.isFinite(profile.nominalMaturationDays) ? profile.nominalMaturationDays : null,
      usedFallbackProfile: fromFallback,
    };
  };

  /**
   * Cardinales térmicos de FRUCTIFICACIÓN por especie, tomados de
   * knowledge_base/01_species/*.md — distintos de los cardinales MICELIALES
   * (tOpt/tMax de flush-forecast-engine.js) que ya se usaban para todas las
   * etapas. Sin esta tabla, la etapa 'induction' (inducción/fructificación) se
   * evaluaba con la curva micelial (p.ej. tOpt 24–25 °C para P. eryngii),
   * cuando la fructificación real ocurre a temperaturas más bajas (14–16 °C
   * para P. eryngii según la KB), generando falsos "retraso_termico".
   *
   * Solo se listan especies con un valor de fructificación explícito en la
   * KB. Para las demás, getStageThermalProfile() cae de vuelta a la curva
   * micelial y fuerza confidence 'low' (ver stageThermalProfile.usedFruitingCardinalFallback).
   */
  const FRUITING_CARDINALS = Object.freeze({
    p_eryngii: {
      tOptC: 15,
      tMaxC: 20,
      provenance: {
        class: 'literature_target',
        source: 'knowledge_base/01_species/pleurotus_eryngii.md',
        note: 'Temperatura de fructificación óptima reportada 14–16 °C (tOpt=15 como punto medio). tMax no está reportado explícitamente en la KB; se aproxima por el mismo margen tOpt→tMax de la curva micelial de la especie.',
      },
    },
    p_ostreatus_gris: {
      tOptC: 17.5,
      tMaxC: 24,
      provenance: {
        class: 'literature_target',
        source: 'knowledge_base/01_species/pleurotus_ostreatus.md',
        note: 'Fructifica 13–24 °C; óptimo comercial citado 15–20 °C / 15–22 °C según la fuente referenciada en la KB (tOpt=17.5 como punto medio de 15–20 °C).',
      },
    },
    p_ostreatus_blanco: {
      tOptC: 17.5,
      tMaxC: 24,
      provenance: {
        class: 'literature_target',
        source: 'knowledge_base/01_species/pleurotus_ostreatus.md',
        note: 'Extrapolado de P. ostreatus (misma ficha de especie en la KB); no hay ficha separada para la variedad blanca.',
      },
    },
    p_djamor_rosa: {
      tOptC: 26,
      tMaxC: 30,
      provenance: {
        class: 'literature_target',
        source: 'knowledge_base/01_species/pleurotus_djamor.md',
        note: 'Rango de fructificación citado 22–30 °C (Salmones 2017; guide_002); especie termófila, sin validación local.',
      },
    },
    lions_mane: {
      tOptC: 18,
      tMaxC: 23,
      provenance: {
        class: 'literature_target',
        source: 'knowledge_base/01_species/hericium_erinaceus.md',
        note: 'Referencia experimental acotada de 18±2 °C; Tabi et al. 2021 evaluó 15/20/25 °C con respuesta dependiente del aislamiento/cepa — no es un óptimo universal.',
      },
    },
    reishi: {
      tOptC: 29,
      tMaxC: 34,
      provenance: {
        class: 'literature_target',
        source: 'knowledge_base/01_species/ganoderma_lucidum.md',
        note: 'Fructificación óptima citada 27–32 °C (rango 20–34 °C); <20 °C deforma el carpóforo (Cenicafé 2005).',
      },
    },
  });

  /**
   * Perfil térmico a usar para INTEGRAR telemetría real durante una etapa
   * dada: para 'induction' usa FRUITING_CARDINALS si la especie tiene un
   * valor citado en la KB; si no, cae de vuelta a la curva micelial de
   * getThermalProfile() y marca `usedFruitingCardinalFallback: true` para que
   * el llamador pueda (a) forzar confidence 'low' y (b) suprimir la alerta
   * 'retraso_termico' en esa condición (ver buildLotBiologicalClock).
   */
  const getStageThermalProfile = (speciesId, normStage) => {
    const base = getThermalProfile(speciesId);
    if (normStage !== 'induction') {
      return { ...base, usedFruitingCardinalFallback: false };
    }
    const cardinal = FRUITING_CARDINALS[base.speciesId];
    if (cardinal && Number.isFinite(cardinal.tOptC)) {
      const tOpt = cardinal.tOptC;
      const tMax = (Number.isFinite(cardinal.tMaxC) && cardinal.tMaxC > tOpt) ? cardinal.tMaxC : tOpt + 1;
      const tBase = base.tBase < tOpt ? base.tBase : tOpt - 1;
      return {
        ...base,
        tBase,
        tOpt,
        tMax,
        tOptTMaxSource: cardinal.provenance,
        usedFruitingCardinalFallback: false,
      };
    }
    return { ...base, usedFruitingCardinalFallback: true };
  };

  // ---------------------------------------------------------------------
  // Utilidades de fecha/tiempo (robustas ante ISO string, ms epoch, Date)
  // ---------------------------------------------------------------------
  const toMillis = (t) => {
    if (t instanceof Date) return isNaN(t.getTime()) ? NaN : t.getTime();
    if (typeof t === 'number') return Number.isFinite(t) ? t : NaN;
    if (typeof t === 'string' && t.trim()) {
      const parsed = new Date(t.trim());
      return isNaN(parsed.getTime()) ? NaN : parsed.getTime();
    }
    return NaN;
  };

  /**
   * Tasa de crecimiento térmico relativa (adimensional, 0..1) para una
   * temperatura dada, según el modelo de temperaturas cardinales:
   * 0 por debajo de tBase, asciende linealmente tBase→tOpt (tasa 1 en tOpt),
   * desciende linealmente tOpt→tMax hasta 0, y 0 por encima de tMax.
   *
   * @param {number} tempC Temperatura en °C
   * @param {{tBase:number, tOpt:number, tMax:number}} profile Cardinales térmicos
   * @returns {number} Tasa relativa de crecimiento (0..1)
   */
  const thermalRate = (tempC, profile) => {
    if (!Number.isFinite(tempC) || !profile) return 0;
    const { tBase, tOpt, tMax } = profile;
    if (!Number.isFinite(tBase) || !Number.isFinite(tOpt) || !Number.isFinite(tMax)) return 0;
    if (tempC <= tBase) return 0;
    if (tempC >= tMax) return 0;
    if (tempC <= tOpt) {
      const span = tOpt - tBase;
      if (span <= 0) return tempC >= tOpt ? 1 : 0;
      return clamp((tempC - tBase) / span, 0, 1);
    }
    const span = tMax - tOpt;
    if (span <= 0) return 0;
    return clamp((tMax - tempC) / span, 0, 1);
  };

  /**
   * Integra tiempo térmico (grados-hora) sobre una serie de telemetría.
   * Prefiere `substrate_temperature_c` sobre `temperature_c` cuando ambas
   * estén presentes en un punto. Ignora puntos inválidos/NaN. No integra a
   * través de huecos mayores a `opts.maxGapMinutes` (default 90 min):
   * ese tiempo se reporta aparte en `gapHours`, no se asume constante.
   *
   * @param {Array<{t:(string|number|Date), temperature_c?:number, substrate_temperature_c?:number}>} series
   * @param {{tBase:number, tOpt:number, tMax:number}} profile Cardinales térmicos de la especie
   * @param {{maxGapMinutes?:number}} [opts]
   * @returns {object} Resumen de tiempo térmico acumulado, con `confidence`/`basis`
   */
  const accumulateThermalTime = (series, profile, opts = {}) => {
    const maxGapMinutes = Number.isFinite(opts.maxGapMinutes) ? opts.maxGapMinutes : 90;
    const maxGapMs = maxGapMinutes * 60 * 1000;

    const points = (Array.isArray(series) ? series : [])
      .map((p) => {
        if (!p) return null;
        const ms = toMillis(p.t);
        const temp = Number.isFinite(p.substrate_temperature_c)
          ? p.substrate_temperature_c
          : (Number.isFinite(p.temperature_c) ? p.temperature_c : NaN);
        if (!Number.isFinite(ms) || !Number.isFinite(temp)) return null;
        return { ms, temp, usedSubstrate: Number.isFinite(p.substrate_temperature_c) };
      })
      .filter(Boolean)
      .sort((a, b) => a.ms - b.ms);

    const empty = {
      effectiveDegreeHours: 0,
      rawDegreeHours: 0,
      hoursObserved: 0,
      gapHours: 0,
      heatStressHours: 0,
      coldHours: 0,
      meanTempC: null,
      pointCount: points.length,
      usedSubstrateTemp: points.some((p) => p.usedSubstrate),
      confidence: 'low',
      basis: points.length === 0 ? 'sin_telemetria' : 'telemetria_insuficiente_para_integrar',
    };

    if (points.length < 2) return empty;

    let effectiveDegreeHours = 0;
    let rawDegreeHours = 0;
    let hoursObserved = 0;
    let gapHours = 0;
    let heatStressHours = 0;
    let coldHours = 0;
    let weightedTempSum = 0;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const deltaMs = curr.ms - prev.ms;
      if (deltaMs <= 0) continue; // duplicados o desorden residual, se ignoran

      const deltaHours = deltaMs / 3600000;

      if (deltaMs > maxGapMs) {
        gapHours += deltaHours;
        continue;
      }

      const rate1 = thermalRate(prev.temp, profile);
      const rate2 = thermalRate(curr.temp, profile);
      effectiveDegreeHours += ((rate1 + rate2) / 2) * deltaHours;

      const raw1 = Math.max(0, prev.temp - profile.tBase);
      const raw2 = Math.max(0, curr.temp - profile.tBase);
      rawDegreeHours += ((raw1 + raw2) / 2) * deltaHours;

      const avgTemp = (prev.temp + curr.temp) / 2;
      if (avgTemp > profile.tMax) heatStressHours += deltaHours;
      if (avgTemp < profile.tBase) coldHours += deltaHours;

      weightedTempSum += avgTemp * deltaHours;
      hoursObserved += deltaHours;
    }

    const meanTempC = hoursObserved > 0 ? round2(weightedTempSum / hoursObserved) : null;
    // Confianza: 'medium' solo con una ventana observada razonable y sin
    // huecos dominantes; nunca 'high' — esto sigue siendo telemetría de un
    // solo lote/serie, no un ensayo replicado (ver agronomic-claims SKILL.md).
    const gapShare = hoursObserved + gapHours > 0 ? gapHours / (hoursObserved + gapHours) : 1;
    const confidence = (hoursObserved >= 24 && gapShare <= 0.25) ? 'medium' : 'low';

    return {
      effectiveDegreeHours: round2(effectiveDegreeHours),
      rawDegreeHours: round2(rawDegreeHours),
      hoursObserved: round2(hoursObserved),
      gapHours: round2(gapHours),
      heatStressHours: round2(heatStressHours),
      coldHours: round2(coldHours),
      meanTempC,
      pointCount: points.length,
      usedSubstrateTemp: points.some((p) => p.usedSubstrate),
      confidence,
      basis: 'integracion_trapezoidal_telemetria',
    };
  };

  /**
   * Tabla única de mapeo entre estados/etapas (canónicos en inglés, per
   * setas-os-workflow.js NORMAL_STATES/EXCEPTION_STATES, y variantes legacy en
   * español, insensibles a acentos/mayúsculas) y las etapas del reloj
   * biológico térmico:
   *
   * - 'incubation': colonización del sustrato (incluye 'inoculated': un lote
   *   recién inoculado ya empezó a acumular tiempo térmico de colonización).
   * - 'induction': bucket combinado de inducción + fructificación (no
   *   distingue floración de cosecha).
   * - 'maturation': maduración postcolonización (p.ej. pardeamiento de
   *   shiitake) — etapa PROPIA, nunca se confunde con 'induction'.
   * - 'no_aplica': estados de proceso normal previos a inoculación
   *   (planned/mix_prepared/thermal_treatment/cooling), reposo entre oleadas,
   *   o estados de excepción/terminales (quarantine/discarded/failed/closed).
   *   Ninguno de estos corresponde a una etapa proyectable del reloj
   *   biológico térmico.
   *
   * Única tabla de esta clase en el módulo (reemplaza el STAGE_ALIASES
   * anterior, que además mapeaba 'maturation' incorrectamente a 'induction').
   */
  const LIFECYCLE_STAGE_MAP = Object.freeze({
    incubation: 'incubation',
    incubacion: 'incubation',
    colonization: 'incubation',
    colonizacion: 'incubation',
    inoculated: 'incubation',
    inoculado: 'incubation',

    induction: 'induction',
    induccion: 'induction',
    fruiting: 'induction',
    fructificacion: 'induction',
    pinning: 'induction',

    maturation: 'maturation',
    maduracion: 'maturation',

    planned: 'no_aplica',
    planificado: 'no_aplica',
    mix_prepared: 'no_aplica',
    mezcla_preparada: 'no_aplica',
    thermal_treatment: 'no_aplica',
    tratamiento_termico: 'no_aplica',
    cooling: 'no_aplica',
    enfriamiento: 'no_aplica',
    resting: 'no_aplica',
    reposo: 'no_aplica',

    quarantine: 'no_aplica',
    cuarentena: 'no_aplica',
    discarded: 'no_aplica',
    descartado: 'no_aplica',
    failed: 'no_aplica',
    fallido: 'no_aplica',
    closed: 'no_aplica',
    cerrado: 'no_aplica',
  });

  /**
   * Normaliza un estado/etapa (canónico o legacy en español,
   * mayúsculas/minúsculas y acentos indistintos) a la etapa del reloj
   * biológico térmico correspondiente, vía LIFECYCLE_STAGE_MAP. Usada tanto
   * para el parámetro `stage` de stageRequirement()/projectStageCompletion()
   * como para el `lifecycleState` de un lote en buildLotBiologicalClock()
   * (mapLifecycleStateToStage es un alias de esta misma función: una sola
   * tabla, un solo comportamiento).
   */
  const normalizeStage = (stage) => {
    if (!stage || typeof stage !== 'string') return 'incubation';
    const clean = stage.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return LIFECYCLE_STAGE_MAP[clean] || 'incubation';
  };

  /**
   * Requerimiento térmico (en horas-grado tOpt-equivalentes) de una etapa
   * del ciclo, derivado de los conteos de días nominales ya presentes en
   * `flush-forecast-engine.js` (no se re-estiman aquí).
   *
   * - 'incubation': `nominalIncubationDays` × 24
   * - 'induction'/'fruiting': (`nominalFirstFlushDays` - `nominalIncubationDays`) × 24
   *
   * @param {string} speciesId
   * @param {string} stage 'incubation' | 'induction' | 'fruiting' (alias soportados)
   * @returns {{requiredHours:number, stage:string, provenance:object, confidence:string}}
   */
  const stageRequirement = (speciesId, stage) => {
    const thermalProfile = getThermalProfile(speciesId);
    const normStage = normalizeStage(stage);

    if (normStage === 'no_aplica') {
      return {
        stage: 'no_aplica',
        speciesId: thermalProfile.speciesId,
        requiredHours: null,
        confidence: 'low',
        provenance: {
          class: 'heuristic',
          source: 'biological-clock.js LIFECYCLE_STAGE_MAP',
          note: 'Este estado del lote (planificación, mezcla, tratamiento térmico, enfriamiento, reposo, cuarentena o un estado terminal) no corresponde a ninguna etapa del reloj biológico térmico; no se proyecta tiempo térmico.',
        },
      };
    }

    const { nominalIncubationDays, nominalFirstFlushDays, nominalMaturationDays } = thermalProfile;

    // Las duraciones nominales (nominalIncubationDays/nominalFirstFlushDays)
    // de flush-forecast-engine.js están definidas asumiendo la temperatura
    // ambiente de referencia tRef, NO tOpt. Escalar por thermalRate(tRef) evita
    // que un lote sostenido exactamente a tRef (rate<1) se lea como retrasado
    // frente a un requerimiento calculado a rate=1 (tOpt).
    const refTemp = Number.isFinite(thermalProfile.tRef) ? thermalProfile.tRef : thermalProfile.tOpt;
    const rateAtRef = thermalRate(refTemp, thermalProfile);
    const effectiveRate = rateAtRef > 0 ? rateAtRef : 1;

    if (normStage === 'maturation') {
      if (!Number.isFinite(nominalMaturationDays) || nominalMaturationDays <= 0) {
        return {
          stage: 'maturation',
          speciesId: thermalProfile.speciesId,
          requiredHours: null,
          confidence: 'low',
          provenance: {
            class: 'heuristic',
            source: 'biological-clock.js',
            note: 'Ninguna especie del catálogo tiene definida una duración nominal de maduración postcolonización (p.ej. pardeamiento de shiitake); no se proyecta esta etapa hasta contar con ese dato.',
          },
        };
      }
      return {
        stage: 'maturation',
        speciesId: thermalProfile.speciesId,
        requiredHours: round1(nominalMaturationDays * 24 * effectiveRate),
        confidence: 'low',
        provenance: {
          class: 'heuristic',
          source: 'flush-forecast-engine.js SPECIES_FLUSH_PROFILES.nominalMaturationDays, escalado por thermalRate(tRef)',
          note: 'nominalMaturationDays × 24 × thermalRate(tRef) — sin cita de literatura primaria, etiquetado heurístico.',
        },
      };
    }

    let days = null;
    let note;
    if (normStage === 'incubation') {
      days = nominalIncubationDays;
      note = 'nominalIncubationDays × 24 × thermalRate(tRef, curva micelial) — nominalIncubationDays de flush-forecast-engine.js está calibrado a tRef, no a tOpt.';
    } else {
      days = (Number.isFinite(nominalIncubationDays) && Number.isFinite(nominalFirstFlushDays))
        ? nominalFirstFlushDays - nominalIncubationDays
        : null;
      note = '(nominalFirstFlushDays - nominalIncubationDays) × 24 × thermalRate(tRef, curva micelial) — ventana desde fin de colonización hasta primera cosecha, calibrada a tRef.';
    }

    if (!Number.isFinite(days) || days <= 0) {
      // Respaldo genérico si faltan campos nominales para la especie.
      days = normStage === 'incubation' ? 21 : 14;
      return {
        stage: normStage,
        speciesId: thermalProfile.speciesId,
        requiredHours: round1(days * 24 * effectiveRate),
        confidence: 'low',
        provenance: { class: 'heuristic', source: 'Valor de respaldo genérico de biological-clock.js', note: `Faltaban campos nominales de días en el perfil de especie; se usó un valor genérico (${days} días) escalado por thermalRate(tRef).` },
      };
    }

    return {
      stage: normStage,
      speciesId: thermalProfile.speciesId,
      requiredHours: round1(days * 24 * effectiveRate),
      // Capado en 'low': tOpt/tMax/tRef (tOptTMaxSource) y los conteos de días
      // nominales no llevan cita de literatura primaria — son heurísticos del
      // motor de pronóstico de oleadas, no un valor medido ni validado en finca.
      confidence: 'low',
      provenance: {
        class: 'heuristic',
        source: 'flush-forecast-engine.js SPECIES_FLUSH_PROFILES (nominalIncubationDays / nominalFirstFlushDays), escalado por thermalRate(tRef)',
        note,
      },
    };
  };

  const addHours = (date, hours) => new Date(date.getTime() + hours * 3600000);
  const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

  // Bogotá = UTC-5 fijo, sin horario de verano (mismo enfoque que
  // toBogotaDateStr en harvest-calendar.js; no se importa desde ahí para no
  // acoplar este módulo a ese archivo, se replica el helper mínimo).
  const BOGOTA_OFFSET_MS = 5 * 3600000;
  const toBogotaDateStr = (d) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    const shifted = new Date(d.getTime() - BOGOTA_OFFSET_MS);
    const y = shifted.getUTCFullYear();
    const mo = String(shifted.getUTCMonth() + 1).padStart(2, '0');
    const da = String(shifted.getUTCDate()).padStart(2, '0');
    return `${y}-${mo}-${da}`;
  };

  /**
   * Proyecta el avance y la fecha de finalización probable de una etapa
   * de cultivo usando tiempo térmico en lugar de días de calendario.
   *
   * @param {object} params
   * @param {string} params.speciesId
   * @param {string} params.stage
   * @param {(string|number|Date)} params.stageStartAt Inicio de la etapa
   * @param {Array<object>} params.series Telemetría de temperatura del lote
   * @param {(string|number|Date)} params.now Instante de evaluación (nunca Date.now() implícito)
   * @param {number} [params.lookbackHours=72] Ventana reciente para estimar la tasa térmica media
   * @returns {object} Proyección con progreso, fechas, estado y resumen en español
   */
  const STAGE_LABEL_ES = {
    incubation: 'incubación',
    induction: 'inducción/fructificación',
    maturation: 'maduración',
    no_aplica: 'no aplicable',
  };

  const projectStageCompletion = ({ speciesId, stage, stageStartAt, series, now, lookbackHours = 72 } = {}) => {
    const normStage = normalizeStage(stage);
    const requirement = stageRequirement(speciesId, stage);
    const thermalProfile = getStageThermalProfile(speciesId, normStage);
    const startMs = toMillis(stageStartAt);
    const nowMs = toMillis(now);

    const base = {
      speciesId: thermalProfile.speciesId,
      speciesName: thermalProfile.speciesName,
      stage: requirement.stage,
      requiredHours: requirement.requiredHours,
      requirementProvenance: requirement.provenance,
      usedFruitingCardinalFallback: !!thermalProfile.usedFruitingCardinalFallback,
    };

    // 'no_aplica' (estados de proceso/excepción) o 'maturation' sin duración
    // nominal definida para la especie: no hay requerimiento numérico contra
    // el cual proyectar, así que no se intenta (ver finding #3).
    if (!Number.isFinite(requirement.requiredHours)) {
      return {
        ...base,
        status: 'no_aplica',
        progressPct: null,
        effectiveDegreeHours: 0,
        confidence: 'low',
        resumen: `${thermalProfile.speciesName}: la etapa "${requirement.stage}" no se proyecta con el reloj biológico térmico (${requirement.provenance.note})`,
      };
    }

    if (!Number.isFinite(startMs) || !Number.isFinite(nowMs)) {
      return {
        ...base,
        status: 'sin_datos',
        progressPct: null,
        effectiveDegreeHours: 0,
        confidence: 'low',
        resumen: 'No se pudo proyectar: falta una fecha válida de inicio de etapa o de evaluación (now).',
      };
    }

    const startDate = new Date(startMs);
    const nowDate = new Date(nowMs);

    // Telemetría desde el inicio de la etapa hasta ahora, y solo esa (no se
    // integra tiempo térmico anterior al comienzo de la etapa evaluada).
    const seriesInStage = (Array.isArray(series) ? series : []).filter((p) => {
      const ms = toMillis(p && p.t);
      return Number.isFinite(ms) && ms >= startMs && ms <= nowMs;
    });

    const totalAcc = accumulateThermalTime(seriesInStage, thermalProfile);

    if (totalAcc.pointCount < 2 || totalAcc.hoursObserved <= 0) {
      return {
        ...base,
        status: 'sin_datos',
        progressPct: 0,
        effectiveDegreeHours: 0,
        hoursObserved: totalAcc.hoursObserved,
        gapHours: totalAcc.gapHours,
        confidence: 'low',
        resumen: `Sin telemetría suficiente desde el inicio de la etapa (${requirement.stage}) para proyectar el avance térmico.`,
      };
    }

    const progressPct = round1(clamp((totalAcc.effectiveDegreeHours / requirement.requiredHours) * 100, 0, 999));
    const remainingHours = Math.max(0, requirement.requiredHours - totalAcc.effectiveDegreeHours);

    // Tasa térmica media reciente (ventana lookbackHours) para proyectar el cierre.
    const lookbackStartMs = nowMs - lookbackHours * 3600000;
    const seriesLookback = seriesInStage.filter((p) => toMillis(p.t) >= lookbackStartMs);
    const lookbackAcc = accumulateThermalTime(seriesLookback.length >= 2 ? seriesLookback : seriesInStage, thermalProfile);
    const meanRate = lookbackAcc.hoursObserved > 0 ? lookbackAcc.effectiveDegreeHours / lookbackAcc.hoursObserved : 0;

    let projectedCompletionDate = null;
    if (progressPct >= 100) {
      projectedCompletionDate = nowDate;
    } else if (meanRate > 0.001) {
      const hoursToCompletion = remainingHours / meanRate;
      projectedCompletionDate = addHours(nowDate, hoursToCompletion);
    }

    // Proyección ingenua de calendario: como si la etapa avanzara al ritmo
    // nominal (1 hora térmica por hora real), a partir de su inicio.
    const naiveCompletionDate = addHours(startDate, requirement.requiredHours);

    let deltaDaysVsCalendar = null;
    if (projectedCompletionDate) {
      deltaDaysVsCalendar = round1((projectedCompletionDate.getTime() - naiveCompletionDate.getTime()) / 86400000);
    }

    let status;
    if (progressPct >= 100) {
      status = 'listo_probable';
    } else if (!projectedCompletionDate) {
      status = 'retrasado'; // Sin tasa térmica positiva reciente: no se está avanzando.
    } else if (deltaDaysVsCalendar !== null && deltaDaysVsCalendar > 1) {
      status = 'retrasado';
    } else {
      status = 'en_curso';
    }

    // requirement.confidence ya está capado en 'low' (finding #17); se conserva
    // la fórmula completa (en vez de fijar 'low' directo) para que, si algún
    // día se relaja ese cap con evidencia real, la confianza de la etapa siga
    // exigiendo también telemetría suficiente y (para 'induction') un
    // cardinal de fructificación citado, no solo uno de los tres factores.
    const stageProfileConfidence = thermalProfile.usedFruitingCardinalFallback ? 'low' : 'medium';
    const confidence = (totalAcc.confidence === 'medium' && requirement.confidence === 'medium' && stageProfileConfidence === 'medium') ? 'medium' : 'low';

    const dateLabel = (d) => (d ? (toBogotaDateStr(d) || 'indeterminada') : 'indeterminada');
    const stageLabel = STAGE_LABEL_ES[requirement.stage] || requirement.stage;
    let resumen;
    if (status === 'listo_probable') {
      resumen = `${thermalProfile.speciesName}: etapa de ${stageLabel} completa según tiempo térmico acumulado (${progressPct}% del requerimiento estimado).`;
    } else if (status === 'retrasado') {
      resumen = `${thermalProfile.speciesName}: avance térmico de ${progressPct}% en la etapa de ${stageLabel}, por debajo del ritmo calendario esperado` + (projectedCompletionDate ? ` (cierre probable ${dateLabel(projectedCompletionDate)}, ${Math.abs(deltaDaysVsCalendar)} día(s) después de lo calculado por calendario).` : ', sin tasa térmica positiva reciente para proyectar cierre.');
    } else {
      resumen = `${thermalProfile.speciesName}: avance térmico de ${progressPct}% en la etapa de ${stageLabel}` + (projectedCompletionDate ? `, cierre probable ${dateLabel(projectedCompletionDate)}.` : '.');
    }

    return {
      ...base,
      status,
      progressPct,
      effectiveDegreeHours: totalAcc.effectiveDegreeHours,
      rawDegreeHours: totalAcc.rawDegreeHours,
      hoursObserved: totalAcc.hoursObserved,
      gapHours: totalAcc.gapHours,
      heatStressHours: totalAcc.heatStressHours,
      coldHours: totalAcc.coldHours,
      meanTempC: totalAcc.meanTempC,
      meanThermalRate: round3(meanRate),
      remainingHours: round1(remainingHours),
      projectedCompletionDate: dateLabel(projectedCompletionDate),
      naiveCalendarCompletionDate: dateLabel(naiveCompletionDate),
      deltaDaysVsCalendar,
      confidence,
      resumen,
    };
  };

  // mapLifecycleStateToStage es un alias directo de normalizeStage: una sola
  // tabla (LIFECYCLE_STAGE_MAP, definida arriba junto a normalizeStage) para
  // ambos usos, sin una segunda tabla duplicada que pueda desincronizarse.
  const mapLifecycleStateToStage = normalizeStage;

  /**
   * Construye el reloj biológico completo de un lote: proyección de etapa
   * más alertas operativas derivadas del tiempo térmico (p.ej. estrés por
   * calor sostenido dentro de la ventana reciente).
   *
   * @param {object} lot {id, speciesId, lifecycleState|estado, stageStartAt|startAt}
   * @param {Array<object>} series Telemetría de temperatura del lote
   * @param {{now:(string|number|Date), lookbackHours?:number, maxGapMinutes?:number}} options
   * @returns {object} {lotId, speciesId, stage, projection, alerts}
   */
  const buildLotBiologicalClock = (lot = {}, series = [], options = {}) => {
    const l = lot || {};
    const opts = options || {};
    const speciesId = l.speciesId || l.especie || l.sKey || 'p_ostreatus_gris';
    const lifecycleState = l.lifecycleState || l.estado || 'incubation';
    const stage = mapLifecycleStateToStage(lifecycleState);
    const lotLabel = l.id || l.codigo || 'sin ID';

    // Estados de proceso normal (planned/mix_prepared/thermal_treatment/
    // cooling), reposo entre oleadas, o estados de excepción/terminales
    // (quarantine/discarded/failed/closed): ninguno corresponde a una etapa
    // del reloj biológico térmico. Se corta aquí, sin invocar
    // projectStageCompletion con fechas que no describen ninguna etapa real.
    if (stage === 'no_aplica') {
      return {
        lotId: l.id || l.codigo || null,
        speciesId: getThermalProfile(speciesId).speciesId,
        lifecycleState,
        stage: 'no_aplica',
        projection: {
          status: 'no_aplica',
          progressPct: null,
          effectiveDegreeHours: 0,
          confidence: 'low',
          resumen: `Lote ${lotLabel} en estado "${lifecycleState}": este estado no corresponde a ninguna etapa del reloj biológico térmico (colonización, inducción/fructificación o maduración); no se proyecta.`,
        },
        alerts: [],
      };
    }

    // fechaInoculacion marca el inicio de la INCUBACIÓN, no el de una etapa
    // posterior. Usarla como respaldo de stageStartAt para 'induction' o
    // 'maturation' cuenta horas de incubación como si fueran horas de esa
    // etapa. Solo se usa como respaldo cuando la etapa evaluada es, en
    // efecto, incubación.
    const explicitStageStartAt = l.stageStartAt || l.startAt || null;
    const stageStartAt = explicitStageStartAt || (stage === 'incubation' ? (l.fechaInoculacion || null) : null);
    const now = opts.now;

    let projection = projectStageCompletion({
      speciesId,
      stage,
      stageStartAt,
      series,
      now,
      lookbackHours: Number.isFinite(opts.lookbackHours) ? opts.lookbackHours : 72,
    });

    if (!explicitStageStartAt && stage !== 'incubation' && projection.status !== 'no_aplica') {
      projection = {
        ...projection,
        status: 'sin_datos',
        progressPct: null,
        resumen: `No se puede proyectar la etapa "${stage}" del lote ${lotLabel}: falta la fecha de inicio de esta etapa (stageStartAt/startAt). No se usa fechaInoculacion como respaldo porque marca el inicio de incubación, no el de esta etapa.`,
      };
    }

    const alerts = [];
    if (Number.isFinite(projection.heatStressHours) && projection.heatStressHours > 6) {
      alerts.push({
        level: 'warning',
        code: 'heat_stress_sostenido',
        message: `Estrés térmico por calor: ${projection.heatStressHours} h por encima de tMax en la ventana evaluada del lote ${lotLabel}.`,
      });
    }
    if (Number.isFinite(projection.coldHours) && projection.coldHours > 6) {
      alerts.push({
        level: 'info',
        code: 'frio_prolongado',
        message: `Temperatura por debajo de tBase durante ${projection.coldHours} h en la ventana evaluada: el avance de la etapa se detiene en esos periodos.`,
      });
    }
    // 'retraso_termico' se suprime cuando la etapa evaluada no es incubación
    // y el perfil térmico usado cayó al respaldo de curva micelial (sin
    // cardinal de fructificación citado en la KB, ver FRUITING_CARDINALS):
    // en ese caso la confianza ya es 'low' y no hay base suficiente para
    // levantar una alerta operativa de retraso.
    if (projection.status === 'retrasado' && !(projection.stage !== 'incubation' && projection.usedFruitingCardinalFallback)) {
      alerts.push({
        level: 'warning',
        code: 'retraso_termico',
        message: projection.resumen,
      });
    }
    if (projection.status === 'sin_datos') {
      alerts.push({
        level: 'info',
        code: 'telemetria_insuficiente',
        message: `No hay telemetría suficiente del lote ${lotLabel} desde el inicio de la etapa para proyectar su reloj biológico.`,
      });
    }

    return {
      lotId: l.id || l.codigo || null,
      speciesId: projection.speciesId,
      lifecycleState,
      stage: projection.stage,
      projection,
      alerts,
    };
  };

  const api = {
    TBASE_TABLE,
    FRUITING_CARDINALS,
    LIFECYCLE_STAGE_MAP,
    normalizeStage,
    thermalRate,
    accumulateThermalTime,
    stageRequirement,
    projectStageCompletion,
    buildLotBiologicalClock,
    getThermalProfile,
    toBogotaDateStr,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasBiologicalClock = api;
  if (typeof window !== 'undefined') window.SetasBiologicalClock = api;
})();
