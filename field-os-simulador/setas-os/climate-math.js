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
    generateSvgPolyline
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasClimate = api;
})();
