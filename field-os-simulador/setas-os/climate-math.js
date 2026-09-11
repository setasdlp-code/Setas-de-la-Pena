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
   * Mapeo canónico de alias taxonómicos y nombres del sistema a tasas de respiración.
   */
  const SPECIES_KEY_ALIASES = {
    p_ostreatus_gris: 'orellana_gris',
    p_ostreatus_blanco: 'orellana_blanca',
    p_djamor_rosa: 'orellana_rosa',
    p_eryngii: 'seta_cardo',
    lions_mane: 'melena_leon',
    pleurotus_ostreatus: 'orellana_gris',
    pleurotus_florida: 'orellana_blanca',
    pleurotus_djamor: 'orellana_rosa',
    pleurotus_eryngii: 'seta_cardo',
    hericium_erinaceus: 'melena_leon',
    lentinula_edodes: 'shiitake',
    flammulina_velutipes: 'enoki',
    pholiota_nameko: 'nameko',
    ganoderma_lucidum: 'reishi',
  };

  /**
   * Resuelve cualquier clave o alias a la clave de perfil respiratorio correspondiente.
   */
  const resolveSpeciesKey = (key) => {
    if (!key || typeof key !== 'string') return 'orellana_gris';
    const clean = key.trim().toLowerCase();
    if (SPECIES_RESPIRATION_RATES[clean]) return clean;
    return SPECIES_KEY_ALIASES[clean] || 'orellana_gris';
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
    const opts = options || {};
    const mass = Math.max(0, parseFloat(biomassKg) || 0);
    const normKey = resolveSpeciesKey(speciesKey);
    const rCo2 = SPECIES_RESPIRATION_RATES[normKey] || SPECIES_RESPIRATION_RATES.default;
    const targetPpm = Math.max(500, parseFloat(opts.targetPpm || 800));
    const outdoorPpm = Math.max(380, parseFloat(opts.outdoorPpm || 420));
    const roomVolumeM3 = Math.max(0.5, parseFloat(opts.roomVolumeM3 || 10.0));
    const fanRatedCfm = Math.max(10, parseFloat(opts.fanRatedCfm || 140.0));
    const cyclePeriodMin = Math.max(1, parseFloat(opts.cyclePeriodMin || 10.0));
    const minAch = Math.max(1, parseFloat(opts.minAch || 4.0));

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

  /**
   * Calcula la Humedad Absoluta (AH) del aire en gramos de agua por metro cúbico (g/m³).
   * AH = (216.7 * VPact_hPa) / (T + 273.15)
   *
   * @param {number} tempC Temperatura en °C
   * @param {number} rhPct Humedad relativa [0 - 100%]
   * @returns {number|null} Humedad absoluta en g/m³
   */
  const calcAbsoluteHumidity = (tempC, rhPct) => {
    if (tempC == null || rhPct == null) return null;
    const t = parseFloat(tempC);
    const rh = parseFloat(rhPct);
    if (!Number.isFinite(t) || !Number.isFinite(rh)) return null;
    const actKpa = calcVPact(t, rh);
    if (actKpa == null) return null;
    const vpActHpa = actKpa * 10; // 1 kPa = 10 hPa
    const ah = (216.7 * vpActHpa) / (t + 273.15);
    return Math.round(ah * 100) / 100;
  };

  /**
   * Calcula la Temperatura de Bulbo Húmedo (Wet-Bulb Temperature) en °C
   * mediante la ecuación empírica de Stull (2011).
   *
   * @param {number} tempC Temperatura de bulbo seco en °C
   * @param {number} rhPct Humedad relativa [0 - 100%]
   * @returns {number|null} Temperatura de bulbo húmedo en °C
   */
  const calcWetBulbTemp = (tempC, rhPct) => {
    if (tempC == null || rhPct == null) return null;
    const t = parseFloat(tempC);
    const rh = parseFloat(rhPct);
    if (!Number.isFinite(t) || !Number.isFinite(rh)) return null;
    const clampedRh = Math.max(1, Math.min(100, rh));

    // Stull (2011)
    const tw = t * Math.atan(0.151977 * Math.pow(clampedRh + 8.313659, 0.5)) +
      Math.atan(t + clampedRh) -
      Math.atan(clampedRh - 1.676331) +
      0.00391838 * Math.pow(clampedRh, 1.5) * Math.atan(0.023101 * clampedRh) -
      4.686035;

    return Math.round(tw * 10) / 10;
  };

  /**
   * Calcula la entalpía específica del aire húmedo (kJ/kg de aire seco).
   * h = 1.006 * T + w * (2501 + 1.86 * T), donde w es la relación de mezcla (kg agua / kg aire seco).
   *
   * @param {number} tempC Temperatura en °C
   * @param {number} rhPct Humedad relativa [0 - 100%]
   * @param {number} [pressureHpa=745.0] Presión barométrica local en hPa
   * @returns {number|null} Entalpía en kJ/kg
   */
  const calcAirEnthalpy = (tempC, rhPct, pressureHpa = TENJO_NOMINAL_PRESSURE_HPA) => {
    if (tempC == null || rhPct == null) return null;
    const t = parseFloat(tempC);
    const rh = parseFloat(rhPct);
    if (!Number.isFinite(t) || !Number.isFinite(rh)) return null;
    const actKpa = calcVPact(t, rh);
    const pKpa = (parseFloat(pressureHpa) || TENJO_NOMINAL_PRESSURE_HPA) / 10;
    if (actKpa == null) return null;

    // Relación de mezcla w: w = 0.622 * (VPact / (P_tot - VPact))
    const pDry = Math.max(1, pKpa - actKpa);
    const w = (0.622 * actKpa) / pDry;

    // Entalpía: h = 1.006 * T + w * (2501 + 1.86 * T)
    const h = (1.006 * t) + (w * (2501 + 1.86 * t));
    return Math.round(h * 10) / 10;
  };

  /**
   * Cálculo de reposición hídrica por ventilación (Demanda de Humidificación).
   * Resuelve el déficit de agua (L/h) generado al renovar el aire húmedo de la carpa
   * con aire exterior más seco o frío de la Sabana de Bogotá.
   *
   * @param {object} params
   * @param {number} [params.faeM3h] Caudal de ventilación en m³/h
   * @param {number} [params.faeCfm] Alternativamente, caudal en CFM
   * @param {number} [params.indoorTempC=18.0] Temperatura deseada del cuarto
   * @param {number} [params.indoorRhPct=90.0] Humedad relativa objetivo (%)
   * @param {number} [params.outdoorTempC=14.0] Temperatura del aire exterior tomado
   * @param {number} [params.outdoorRhPct=65.0] Humedad relativa exterior (%)
   * @returns {object} Tasa de humidificación requerida en L/h, g/h y dimensionamiento
   */
  const calcHumidificationDemand = (params = {}) => {
    const p = params || {};
    const indoorT = parseFloat(p.indoorTempC ?? 18.0);
    const indoorRh = Math.max(10, Math.min(100, parseFloat(p.indoorRhPct ?? 90.0)));
    const outdoorT = parseFloat(p.outdoorTempC ?? 14.0);
    const outdoorRh = Math.max(10, Math.min(100, parseFloat(p.outdoorRhPct ?? 65.0)));

    let m3h = null;
    if (p.faeM3h != null && Number.isFinite(parseFloat(p.faeM3h))) {
      m3h = Math.max(0, parseFloat(p.faeM3h));
    } else if (p.faeCfm != null && Number.isFinite(parseFloat(p.faeCfm))) {
      m3h = Math.max(0, parseFloat(p.faeCfm) * 1.69901);
    } else if (p.roomVolumeM3 != null && (p.airChangesPerHour != null || p.ach != null)) {
      const vol = Math.max(0, parseFloat(p.roomVolumeM3));
      const ach = Math.max(0, parseFloat(p.airChangesPerHour ?? p.ach));
      m3h = vol * ach;
    } else {
      m3h = 25.0; // Caudal representativo de 15 CFM
    }

    const ahIndoor = calcAbsoluteHumidity(indoorT, indoorRh);
    const ahOutdoor = calcAbsoluteHumidity(outdoorT, outdoorRh);

    // Déficit hídrico por m³ de aire renovado (g/m³)
    const moistureDeficitGPerM3 = Math.max(0, ahIndoor - ahOutdoor);
    const waterLossGramsPerHour = Math.round(m3h * moistureDeficitGPerM3);
    const waterLossLitersPerHour = Math.round((waterLossGramsPerHour / 1000) * 100) / 100;

    // Margen de absorción / condensación en ductos (factor 1.25x de seguridad)
    const recommendedHumidifierCapLPerH = waterLossLitersPerHour > 0
      ? Math.max(0.5, Math.round(waterLossLitersPerHour * 1.25 * 10) / 10)
      : 0;

    return {
      faeM3h: Math.round(m3h * 10) / 10,
      indoor: { tempC: indoorT, rhPct: indoorRh, absoluteHumidityGm3: ahIndoor },
      outdoor: { tempC: outdoorT, rhPct: outdoorRh, absoluteHumidityGm3: ahOutdoor },
      moistureDeficitGm3: Math.round(moistureDeficitGPerM3 * 100) / 100,
      waterLossGramsPerHour,
      waterLossLitersPerHour,
      recommendedHumidifierCapLPerH,
      recommendation: waterLossLitersPerHour > 0
        ? `Para mantener ${indoorRh}% HR a ${indoorT}°C con extracción de ${Math.round(m3h)} m³/h, el humidificador debe nebulizar al menos ${recommendedHumidifierCapLPerH} L/h de agua desmineralizada.`
        : `Sin renovación forzada de aire, el déficit hídrico por ventilación es 0 L/h. Mantener nebulización base mínima según infiltración.`,
    };
  };

  const api = {
    calcVPsat,
    calcVPact,
    calcVPD,
    calcDewPoint,
    calcAbsoluteHumidity,
    calcWetBulbTemp,
    calcAirEnthalpy,
    calcHumidificationDemand,
    evalClimateHealth,
    generateSvgPolyline,
    calcBarometricCO2Correction,
    calcDynamicFAE,
    SPECIES_RESPIRATION_RATES,
    SPECIES_KEY_ALIASES,
    resolveSpeciesKey,
    SEA_LEVEL_PRESSURE_HPA,
    TENJO_NOMINAL_PRESSURE_HPA
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasClimate = api;
  if (typeof window !== 'undefined') window.SetasClimate = api;
})();
