'use strict';

/**
 * @file actuator-controller.js — Motor de lógica de actuación y control ambiental para Setas OS.
 *
 * Gobierna los relés de potencia (Hosyond 2ch) para:
 * 1. Humidificador (AC Infinity CloudForge T7 / H05): Relay Ch1
 *    - Control Bang-Bang con histéresis amplia y protección anti-ciclo corto (120s).
 *    - Corte automático por riesgo de condensación libre (ΔT aire-rocío < 0.8°C).
 * 2. Extractor FAE (AC Infinity Cloudline H4): Relay Ch2
 *    - Pulsos cortos de 30 a 45 segundos (previene colapso de humedad en 3 m³).
 *    - Disparo por CO2 acumulado (> max target) o ciclo periódico de línea base (5-8 ACH).
 *    - Enclavamiento de seguridad: suspende extracción si HR < 75%.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  // Tiempos canónicos de protección de relés y dinámica de carpa (en milisegundos)
  const CONSTANTS = {
    HUMIDIFIER_MIN_IDLE_MS: 120 * 1000,    // 120 segundos mínimo apagado
    HUMIDIFIER_MIN_RUN_MS: 60 * 1000,      // 60 segundos mínimo encendido
    FAE_PULSE_DURATION_MS: 35 * 1000,      // 35 segundos de pulso FAE
    FAE_MIN_IDLE_MS: 90 * 1000,            // 90 segundos cooldown entre pulsos
    FAE_PERIODIC_INTERVAL_MS: 15 * 60 * 1000, // 15 min intervalo de pulso de renovación
    CONDENSATION_SAFETY_DELTA_C: 0.8,      // ΔT mínimo aire - rocío
    CRITICAL_LOW_RH_PCT: 75.0              // Enclavamiento: no extraer si HR < 75%
  };

  /**
   * Calcula el punto de rocío a partir de temperatura y humedad relativa (Magnus-Tetens).
   * @param {number} tC Temperatura en °C
   * @param {number} rhPct Humedad relativa en %
   * @returns {number|null}
   */
  const calcDewPoint = (tC, rhPct) => {
    const t = Number(tC);
    const rh = Number(rhPct);
    if (!Number.isFinite(t) || !Number.isFinite(rh) || rh <= 0 || rh > 100) return null;
    const a = 17.27;
    const b = 237.3;
    const gamma = (a * t) / (b + t) + Math.log(rh / 100);
    const dp = (b * gamma) / (a - gamma);
    return Math.round(dp * 10) / 10;
  };

  /**
   * Evalúa el estado deseado de los actuadores a partir de métricas y objetivos.
   *
   * @param {object} params
   * @param {object} params.metrics Lecturas ambientales ({ temp, rh, co2, vpd, dewPoint })
   * @param {object} params.targets Bandas objetivo ({ temperature_c, rh_pct, co2_ppm })
   * @param {object} [params.currentState] Estado previo de actuadores
   * @param {number} [params.now] Timestamp actual en ms
   * @returns {object} Decisiones de actuación y eventos generados
   */
  const evaluateActuators = (options) => {
    const opts = options || {};
    const metrics = opts.metrics || {};
    const targets = opts.targets || {};
    const currentState = opts.currentState || {};
    const now = opts.now != null && Number.isFinite(Number(opts.now)) ? Number(opts.now) : Date.now();
    const temp = Number(metrics.temp);
    const rh = Number(metrics.rh);
    const co2 = Number(metrics.co2);
    const vpd = Number(metrics.vpd);
    let dewPoint = Number(metrics.dewPoint);

    // Si dewPoint no fue enviado pero temp y rh son válidos, derivarlo psicrométricamente
    if (!Number.isFinite(dewPoint) && Number.isFinite(temp) && Number.isFinite(rh) && rh > 0) {
      const safeRh = Math.min(100, Math.max(0.1, rh));
      const derived = calcDewPoint(temp, safeRh);
      if (derived != null) dewPoint = derived;
    }

    const rhTargets = {
      min: targets.rh_pct?.min ?? 85,
      max: targets.rh_pct?.max ?? 95,
      target: targets.rh_pct?.target ?? 90
    };
    const co2Targets = {
      min: targets.co2_ppm?.min ?? 400,
      max: targets.co2_ppm?.max ?? 900,
      target: targets.co2_ppm?.target ?? 600
    };

    const prevHum = currentState.humidifier || { state: 'OFF', lastChangeMs: 0, lastOffMs: 0 };
    const prevFae = currentState.fae || { state: 'OFF', pulseStartMs: 0, lastPulseEndMs: 0 };

    const events = [];

    // ─────────────────────────────────────────────────────────────
    // 1. CONTROL DE HUMIDIFICACIÓN (Relay Ch1 - T7 / H05)
    // ─────────────────────────────────────────────────────────────
    let nextHumState = prevHum.state;
    let humReason = prevHum.reason || 'Nominal';

    const humTimeSinceChange = now - (prevHum.lastChangeMs || 0);
    const humTimeSinceOff = now - (prevHum.lastOffMs ?? 0);

    // Verificación de riesgo de condensación
    const hasDewPoint = Number.isFinite(temp) && Number.isFinite(dewPoint);
    const condensationRisk = hasDewPoint && (temp - dewPoint < CONSTANTS.CONDENSATION_SAFETY_DELTA_C);

    if (prevHum.state === 'ON') {
      // Condiciones de apagado
      if (condensationRisk) {
        nextHumState = 'OFF';
        humReason = `Corte de seguridad anti-condensación (ΔT = ${(temp - dewPoint).toFixed(1)}°C < 0.8°C)`;
      } else if (Number.isFinite(rh) && rh >= (rhTargets.target || 90)) {
        if (humTimeSinceChange >= CONSTANTS.HUMIDIFIER_MIN_RUN_MS) {
          nextHumState = 'OFF';
          humReason = `Target de humedad alcanzado (${rh}% >= ${rhTargets.target}%)`;
        }
      }
    } else {
      // prevHum.state === 'OFF' -> Condiciones de encendido
      const canTurnOn = humTimeSinceOff >= CONSTANTS.HUMIDIFIER_MIN_IDLE_MS;

      if (!condensationRisk && canTurnOn) {
        if (Number.isFinite(rh) && rh < (rhTargets.min || 85)) {
          nextHumState = 'ON';
          humReason = `Humedad por debajo del umbral mínimo (${rh}% < ${rhTargets.min}%)`;
        } else if (Number.isFinite(vpd) && vpd > 0.50) {
          nextHumState = 'ON';
          humReason = `VPD alto (${vpd} kPa > 0.50 kPa - riesgo de desecación)`;
        }
      } else if (!canTurnOn && Number.isFinite(rh) && rh < (rhTargets.min || 85)) {
        humReason = `Espera de protección anti-ciclo corto (${Math.ceil((CONSTANTS.HUMIDIFIER_MIN_IDLE_MS - humTimeSinceOff) / 1000)}s restantes)`;
      }
    }

    if (nextHumState !== prevHum.state) {
      events.push({
        relay: 'ch1',
        device: 'humidifier_t7',
        from: prevHum.state,
        to: nextHumState,
        reason: humReason,
        timestamp: now
      });
    }

    const nextHum = {
      state: nextHumState,
      reason: humReason,
      lastChangeMs: nextHumState !== prevHum.state ? now : prevHum.lastChangeMs,
      lastOffMs: nextHumState === 'OFF' && prevHum.state === 'ON' ? now : (prevHum.lastOffMs ?? 0)
    };

    // ─────────────────────────────────────────────────────────────
    // 2. CONTROL DE EXTRACCIÓN FAE (Relay Ch2 - Cloudline H4)
    // ─────────────────────────────────────────────────────────────
    let nextFaeState = prevFae.state;
    let faeReason = prevFae.reason || 'Nominal';

    const faePulseElapsed = now - (prevFae.pulseStartMs || 0);
    const faeTimeSinceLastPulse = now - (prevFae.lastPulseEndMs ?? 0);

    if (prevFae.state === 'ON') {
      // En pulso de extracción -> verificar si debe terminar
      if (faePulseElapsed >= CONSTANTS.FAE_PULSE_DURATION_MS) {
        nextFaeState = 'OFF';
        faeReason = `Fin de pulso FAE (${Math.round(CONSTANTS.FAE_PULSE_DURATION_MS / 1000)}s completados)`;
      } else if (Number.isFinite(rh) && rh < CONSTANTS.CRITICAL_LOW_RH_PCT) {
        nextFaeState = 'OFF';
        faeReason = `Corte de emergencia: HR cayó a nivel crítico (${rh}% < 75%)`;
      }
    } else {
      // prevFae.state === 'OFF' -> verificar si se debe disparar un nuevo pulso
      const isCooldownOver = faeTimeSinceLastPulse >= CONSTANTS.FAE_MIN_IDLE_MS;
      const isRhSafe = !Number.isFinite(rh) || rh >= CONSTANTS.CRITICAL_LOW_RH_PCT;

      if (isCooldownOver && isRhSafe) {
        // Disparo 1: CO2 acumulado
        if (Number.isFinite(co2) && co2 > (co2Targets.max || 900)) {
          nextFaeState = 'ON';
          faeReason = `Disparo FAE por CO2 elevado (${co2} ppm > ${co2Targets.max} ppm)`;
        }
        // Disparo 2: Ciclo periódico de renovación horaria (5-8 ACH)
        else if (faeTimeSinceLastPulse >= CONSTANTS.FAE_PERIODIC_INTERVAL_MS) {
          nextFaeState = 'ON';
          faeReason = `Pulso periódico de ventilación de línea base (15 min intervalo)`;
        }
      }
    }

    if (nextFaeState !== prevFae.state) {
      events.push({
        relay: 'ch2',
        device: 'extractor_h4',
        from: prevFae.state,
        to: nextFaeState,
        reason: faeReason,
        timestamp: now
      });
    }

    const nextFae = {
      state: nextFaeState,
      reason: faeReason,
      pulseStartMs: nextFaeState === 'ON' && prevFae.state === 'OFF' ? now : (nextFaeState === 'ON' ? (prevFae.pulseStartMs || now) : 0),
      lastPulseEndMs: nextFaeState === 'OFF' && prevFae.state === 'ON' ? now : (prevFae.lastPulseEndMs ?? 0)
    };

    return {
      humidifier: nextHum,
      fae: nextFae,
      events,
      commands: {
        relay_ch1_humidifier: nextHum.state,
        relay_ch2_fae: nextFae.state
      }
    };
  };

  const api = {
    CONSTANTS,
    calcDewPoint,
    evaluateActuators
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasActuators = api;
})();
