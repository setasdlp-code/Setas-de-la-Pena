'use strict';

/**
 * @file climate-math.js — Motor de cálculos psicrométricos y ambientales para Setas OS.
 *
 * Provee fórmulas de física ambiental (Tetens / Magnus) para:
 * 1. Presión de vapor de saturación (VPsat) y actual (VPact) en kPa.
 * 2. Déficit de presión de vapor (VPD) en kPa.
 * 3. Punto de rocío (Dew Point) en °C.
 * 4. Diagnóstico de balance de transpiración y riesgo de condensación / desecación.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  /**
   * Calcula la Presión de Vapor de Saturación (VPsat) a una temperatura dada en °C.
   * Fórmula de Magnus-Tetens: VPsat = 0.61078 * exp((17.27 * T) / (T + 237.3)) [kPa]
   * @param {number} tC Temperatura en °C
   * @returns {number|null} Presión en kPa
   */
  const calcVPsat = (tC) => {
    const t = Number(tC);
    if (!Number.isFinite(t)) return null;
    return 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
  };

  /**
   * Calcula la Presión de Vapor Actual (VPact) a partir de T (°C) y HR (%RH).
   * @param {number} tC Temperatura en °C
   * @param {number} rhPct Humedad relativa [0 - 100%]
   * @returns {number|null} Presión en kPa
   */
  const calcVPact = (tC, rhPct) => {
    const sat = calcVPsat(tC);
    const rh = Number(rhPct);
    if (sat == null || !Number.isFinite(rh)) return null;
    const clampedRh = Math.max(0, Math.min(100, rh));
    return sat * (clampedRh / 100);
  };

  /**
   * Calcula el Déficit de Presión de Vapor (VPD) en kPa.
   * VPD = VPsat - VPact
   * @param {number} tC Temperatura en °C
   * @param {number} rhPct Humedad relativa [0 - 100%]
   * @returns {number|null} VPD en kPa (redondeado a 2 decimales para UI)
   */
  const calcVPD = (tC, rhPct) => {
    const sat = calcVPsat(tC);
    const act = calcVPact(tC, rhPct);
    if (sat == null || act == null) return null;
    const vpd = Math.max(0, sat - act);
    return Math.round(vpd * 100) / 100;
  };

  /**
   * Calcula el Punto de Rocío (Dew Point) en °C.
   * gamma(T, HR) = (17.27 * T) / (T + 237.3) + ln(HR / 100)
   * Tdp = (237.3 * gamma) / (17.27 - gamma)
   * @param {number} tC Temperatura en °C
   * @param {number} rhPct Humedad relativa [0 - 100%]
   * @returns {number|null} Temperatura de rocío en °C (redondeada a 1 decimal)
   */
  const calcDewPoint = (tC, rhPct) => {
    const t = Number(tC);
    const rh = Number(rhPct);
    if (!Number.isFinite(t) || !Number.isFinite(rh) || rh <= 0) return null;
    const clampedRh = Math.max(0.1, Math.min(100, rh));

    const gamma = ((17.27 * t) / (t + 237.3)) + Math.log(clampedRh / 100);
    const denominator = 17.27 - gamma;
    if (denominator === 0) return null;

    const tdp = (237.3 * gamma) / denominator;
    return Math.round(tdp * 10) / 10;
  };

  /**
   * Evalúa el estado agronómico y balance de transpiración a partir de VPD y T/HR.
   * @param {object} params
   * @param {number} params.tC
   * @param {number} params.rhPct
   * @param {number} [params.co2Ppm]
   * @param {object} [params.targets] Bandas objetivo del RoomCycle
   * @returns {object} Diagnóstico con estado, advertencias y nivel de alerta
   */
  const evalClimateHealth = ({ tC, rhPct, co2Ppm, targets = {} } = {}) => {
    const vpd = calcVPD(tC, rhPct);
    const dewPoint = calcDewPoint(tC, rhPct);
    const alerts = [];

    // Margen de condensación
    let condensationRisk = false;
    if (tC != null && dewPoint != null) {
      const deltaT = tC - dewPoint;
      if (deltaT < 0.8) {
        condensationRisk = true;
        alerts.push({
          level: 'warning',
          metric: 'dew_point',
          msg: `Riesgo de condensación libre (ΔT aire-rocío = ${deltaT.toFixed(1)}°C < 0.8°C)`
        });
      }
    }

    // Evaluación de VPD
    let vpdStatus = 'optimo'; // 'optimo', 'bajo' (exceso humedad/estancado), 'alto' (desecacion)
    if (vpd != null) {
      if (vpd < 0.08) {
        vpdStatus = 'bajo';
        alerts.push({
          level: 'warning',
          metric: 'vpd',
          msg: `VPD muy bajo (${vpd.toFixed(2)} kPa). Transpiración detenida, riesgo de bacteriosis.`
        });
      } else if (vpd > 0.55) {
        vpdStatus = 'alto';
        alerts.push({
          level: 'warning',
          metric: 'vpd',
          msg: `VPD alto (${vpd.toFixed(2)} kPa). Riesgo de deshidratación y agrietamiento de primordios.`
        });
      }
    }

    // Evaluación de CO2
    if (co2Ppm != null) {
      const co2Target = targets.co2_ppm;
      if (co2Target?.max != null && co2Ppm > co2Target.max) {
        alerts.push({
          level: 'alert',
          metric: 'co2_ppm',
          msg: `CO2 acumulado (${co2Ppm} ppm > ${co2Target.max} ppm). Aumentar FAE / extracción.`
        });
      }
    }

    // Evaluación de Temp y HR frente a targets
    if (tC != null && targets.temperature_c) {
      const tb = targets.temperature_c;
      if (tb.min != null && tC < tb.min) alerts.push({ level: 'alert', metric: 'temperature_c', msg: `Temperatura baja (${tC}°C < ${tb.min}°C)` });
      if (tb.max != null && tC > tb.max) alerts.push({ level: 'alert', metric: 'temperature_c', msg: `Temperatura alta (${tC}°C > ${tb.max}°C)` });
    }

    if (rhPct != null && targets.rh_pct) {
      const rb = targets.rh_pct;
      if (rb.min != null && rhPct < rb.min) alerts.push({ level: 'alert', metric: 'rh_pct', msg: `Humedad insuficiente (${rhPct}% < ${rb.min}%)` });
      if (rb.max != null && rhPct > rb.max) alerts.push({ level: 'alert', metric: 'rh_pct', msg: `Humedad saturada (${rhPct}% > ${rb.max}%)` });
    }

    const hasAlerts = alerts.some(a => a.level === 'alert');
    const hasWarnings = alerts.some(a => a.level === 'warning');

    return {
      vpd,
      dewPoint,
      vpdStatus,
      condensationRisk,
      alerts,
      severity: hasAlerts ? 'critical' : hasWarnings ? 'warning' : 'optimal'
    };
  };

  // Constantes para ventilación y corrección barométrica NDIR
  const SEA_LEVEL_PRESSURE_HPA = 1013.25;
  const TENJO_NOMINAL_PRESSURE_HPA = 745.0; // 74.5 kPa a 2.600 msnm

  // Tasas de respiración fúngica en fructificación activa (mg CO2 / kg hongo fresco / h)
  const SPECIES_RESPIRATION_RATES = {
    orellana_gris: 1400,
    orellana_blanca: 1300,
    orellana_rosa: 1600,
    seta_cardo: 800,
    shiitake: 650,
    melena_leon: 750,
    nameko: 600,
    enoki: 500,
    reishi: 400,
    default: 1000
  };

  /**
   * Corrección barométrica para sensores de CO2 tipo NDIR (MH-Z19C, SCD30, Senseair S8) en altitud.
   * La ley de Beer-Lambert depende de la densidad molar del gas; a 745 hPa (Tenjo) el sensor no compensado
   * subestima la concentración de CO2 en ~26.5% (factor 1.360x).
   *
   * @param {number} rawPpm Lectura directa del sensor NDIR sin calibrar en ppm
   * @param {number} [pressureHpa=745.0] Presión barométrica local en hPa
   * @param {number} [tempC=18.0] Temperatura actual de la carpa en °C
   * @returns {object} Concentración corregida y factor multiplicador
   */
  const calcBarometricCO2Correction = (rawPpm, pressureHpa = TENJO_NOMINAL_PRESSURE_HPA, tempC = 18.0) => {
    const raw = Math.max(0, parseFloat(rawPpm) || 0);
    const pLocal = Math.max(500, Math.min(1100, parseFloat(pressureHpa) || TENJO_NOMINAL_PRESSURE_HPA));
    const tLocal = parseFloat(tempC) || 18.0;

    // Factor barométrico primario: P0 / P_local
    const baroFactor = SEA_LEVEL_PRESSURE_HPA / pLocal;

    // Corrección secundaria por temperatura de calibración (estándar NDIR calibrado a 20°C / 293.15 K)
    const tFactor = (tLocal + 273.15) / (20.0 + 273.15);

    const totalFactor = baroFactor * tFactor;
    const correctedPpm = Math.round(raw * totalFactor);

    return {
      rawPpm: raw,
      correctedPpm,
      pressureHpa: pLocal,
      tempC: tLocal,
      baroFactor: Math.round(baroFactor * 1000) / 1000,
      totalCorrectionFactor: Math.round(totalFactor * 1000) / 1000,
      deltaPpm: correctedPpm - raw
    };
  };

  /**
   * Cálculo dinámico de renovación de aire fresco (FAE - Fresh Air Exchange) por biomasa fúngica activa.
   * Balance de masas de CO2 en cámara cerrada:
   * Q_CFM = (0.43754 * M_bio * R_CO2) / (C_target - C_outdoor)
   *
   * @param {number} biomassKg Biomasa fúngica fresca en fructificación activa (kg)
   * @param {string} [speciesKey='orellana_gris'] Clave de la especie cultivada
   * @param {object} [options={}] Parámetros de la cámara y extractor
   * @param {number} [options.targetPpm=800] Concentración objetivo de CO2 en la carpa (ppm)
   * @param {number} [options.outdoorPpm=420] Concentración exterior de aire fresco (ppm)
   * @param {number} [options.roomVolumeM3=10.0] Volumen físico de la carpa o cuarto (m³)
   * @param {number} [options.fanRatedCfm=140.0] Caudal efectivo del extractor (ej. AC Infinity 4" ~140 CFM)
   * @param {number} [options.cyclePeriodMin=10.0] Duración del ciclo de temporizador (minutos)
   * @param {number} [options.minAch=4.0] Renovaciones por hora mínimas por convección / capa límite
   * @returns {object} Caudales requeridos, renovaciones y temporización recomendada del extractor
   */
  const calcDynamicFAE = (biomassKg, speciesKey = 'orellana_gris', options = {}) => {
    const mass = Math.max(0, parseFloat(biomassKg) || 0);
    const rCo2 = SPECIES_RESPIRATION_RATES[speciesKey] || SPECIES_RESPIRATION_RATES.default;
    const targetPpm = Math.max(500, parseFloat(options.targetPpm || 800));
    const outdoorPpm = Math.max(380, parseFloat(options.outdoorPpm || 420));
    const roomVolumeM3 = Math.max(0.5, parseFloat(options.roomVolumeM3 || 10.0));
    const fanRatedCfm = Math.max(10, parseFloat(options.fanRatedCfm || 140.0));
    const cyclePeriodMin = Math.max(1, parseFloat(options.cyclePeriodMin || 10.0));
    const minAch = Math.max(1, parseFloat(options.minAch || 4.0));

    const deltaPpm = Math.max(50, targetPpm - outdoorPpm);

    // 1. Caudal FAE por remoción de CO2 metabólico (CFM)
    // 0.43754 convierte (kg * mg/kg*h) / ppm a CFM a presión de altitud (~74.5 kPa)
    const qCfmCo2 = (0.43754 * mass * rCo2) / deltaPpm;

    // 2. Caudal mínimo por renovación de volumen de aire (ACH convección / anti-estancamiento)
    // 1 m3/h = 0.5886 CFM
    const qCfmM3hToCfm = 0.588578;
    const qCfmMinAch = (roomVolumeM3 * minAch) * qCfmM3hToCfm / 60;

    // Caudal requerido gobernante
    const requiredCfm = Math.max(qCfmCo2, qCfmMinAch);
    const requiredM3h = requiredCfm * 1.69901;

    // ACH resultante
    const effectiveAch = Math.round((requiredM3h / roomVolumeM3) * 10) / 10;

    // Ciclo de trabajo del extractor
    const dutyCyclePct = Math.min(100, Math.round((requiredCfm / fanRatedCfm) * 1000) / 10);
    const onTimeSec = Math.round((dutyCyclePct / 100) * cyclePeriodMin * 60);
    const offTimeSec = Math.max(0, Math.round(cyclePeriodMin * 60 - onTimeSec));

    return {
      biomassKg: mass,
      speciesKey,
      respirationRateMgKgH: rCo2,
      targetPpm,
      outdoorPpm,
      roomVolumeM3,
      requiredCfm: Math.round(requiredCfm * 10) / 10,
      requiredM3h: Math.round(requiredM3h * 10) / 10,
      effectiveAch,
      fanRatedCfm,
      dutyCyclePct,
      schedule: {
        cyclePeriodMin,
        onTimeSec,
        offTimeSec,
        onTimeMin: Math.round((onTimeSec / 60) * 10) / 10,
        offTimeMin: Math.round((offTimeSec / 60) * 10) / 10,
        recommendation: dutyCyclePct >= 95
          ? 'Extractor al 100% continuo o adicionar segundo extractor'
          : `Encender ${Math.round(onTimeSec / 60 * 10)/10} min cada ${cyclePeriodMin} min`
      }
    };
  };

  /**
   * Genera coordenadas de trazado SVG para una serie temporal.
   */
  const generateSvgPolyline = (readings = [], metric = 'value', { width = 300, height = 80, padding = 10, yMin = null, yMax = null } = {}) => {
    if (!Array.isArray(readings) || readings.length === 0) return '';

    const valid = readings
      .map(r => typeof r === 'object' ? (r[metric] ?? r.value) : r)
      .filter(v => typeof v === 'number' && Number.isFinite(v));

    if (valid.length === 0) return '';

    const computedMin = yMin != null ? yMin : Math.min(...valid);
    const computedMax = yMax != null ? yMax : Math.max(...valid);
    const range = computedMax - computedMin || 1;

    const plotW = width - (padding * 2);
    const plotH = height - (padding * 2);

    return valid.map((val, idx) => {
      const x = padding + (idx / Math.max(1, valid.length - 1)) * plotW;
      const normalizedY = (val - computedMin) / range;
      const y = (height - padding) - (normalizedY * plotH);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const api = {
    calcVPsat,
    calcVPact,
    calcVPD,
    calcDewPoint,
    evalClimateHealth,
    generateSvgPolyline,
    calcBarometricCO2Correction,
    calcDynamicFAE,
    SPECIES_RESPIRATION_RATES,
    SEA_LEVEL_PRESSURE_HPA,
    TENJO_NOMINAL_PRESSURE_HPA
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasClimate = api;
  if (typeof window !== 'undefined') window.SetasClimate = api;
})();
