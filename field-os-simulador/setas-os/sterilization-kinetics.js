'use strict';

/**
 * @file sterilization-kinetics.js — Motor de Cinética de Esterilización Térmica en Altitud
 * para Setas OS (Tenjo, Cundinamarca a 2.600 msnm / 74.5 kPa).
 *
 * Modela:
 * 1. Termodinámica de vapor saturado en altitud (Antoine / IAPWS).
 * 2. Cálculo exacto de presión manométrica (psig) para autoclave (All American 1941X).
 * 3. Tasa de letalidad térmica e integral de esterilización F0 (Bigelow / Ball).
 * 4. Curvas de penetración térmica al núcleo del sustrato según peso de bolsa y humedad.
 * 5. Validación de ciclo y dictamen de inocuidad microbiológica contra Geobacillus stearothermophilus y Bacillus subtilis.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  // Constantes físicas y de referencia
  const TENJO_ALTITUDE_M = 2600;
  const TENJO_NOMINAL_ATM_KPA = 74.50; // 558.8 mmHg = 10.805 psia = 745 hPa
  const SEA_LEVEL_ATM_KPA = 101.325;   // 14.696 psia = 1013.25 hPa
  const T_REF_STERILIZATION = 121.11;  // 250.0 °F
  const Z_VALUE_SPORES = 10.0;         // °C para endosporas bacterianas
  const PSI_TO_KPA = 6.894757;
  const KPA_TO_PSI = 1 / PSI_TO_KPA;
  const TARGET_F0_MIN = 12.0;          // Minutos F0 para esterilidad comercial (reducción 6D-8D)
  const D_STEAROTHERMOPHILUS_121 = 1.8; // Valor D (minutos) a 121.1°C
  const D_SUBTILIS_121 = 0.6;           // Valor D (minutos) a 121.1°C

  /**
   * Calcula la temperatura de ebullición del agua libre / vapor saturado a una presión absoluta en kPa.
   * Utiliza la ecuación de Antoine para agua en el rango de 1 a 150 °C.
   *
   * @param {number} absPressureKpa Presión absoluta en kPa
   * @returns {number} Temperatura de saturación del vapor en °C
   */
  const calcBoilingTempFromAbsPressure = (absPressureKpa) => {
    const pKpa = Math.max(10, parseFloat(absPressureKpa) || TENJO_NOMINAL_ATM_KPA);
    const pMmHg = pKpa * (760 / SEA_LEVEL_ATM_KPA);
    // Antoine: log10(P_mmHg) = 8.07131 - (1730.63 / (T + 233.426))
    const tC = (1730.63 / (8.07131 - Math.log10(pMmHg))) - 233.426;
    return Math.round(tC * 100) / 100;
  };

  /**
   * Calcula la temperatura del vapor saturado dentro del autoclave a partir de la lectura
   * manométrica en PSI y la presión atmosférica local (Tenjo 74.5 kPa por defecto).
   *
   * @param {number} gaugePressurePsi Presión manométrica leída en el manómetro del autoclave (psig)
   * @param {number} [ambientPressureKpa=74.50] Presión barométrica local
   * @returns {number} Temperatura del vapor en °C
   */
  const calcSteamSatTemp = (gaugePressurePsi, ambientPressureKpa = TENJO_NOMINAL_ATM_KPA) => {
    const gaugePsi = Math.max(0, parseFloat(gaugePressurePsi) || 0);
    const pAbsKpa = (gaugePsi * PSI_TO_KPA) + (parseFloat(ambientPressureKpa) || TENJO_NOMINAL_ATM_KPA);
    return calcBoilingTempFromAbsPressure(pAbsKpa);
  };

  /**
   * Calcula la presión manométrica en PSI requerida para alcanzar una temperatura de vapor objetivo
   * a la altitud de Tenjo (o presión ambiente provista).
   *
   * @param {number} [targetTempC=121.11] Temperatura objetivo del vapor (°C)
   * @param {number} [ambientPressureKpa=74.50] Presión barométrica local
   * @returns {number} Presión manométrica en psig
   */
  const calcRequiredGaugePressurePsi = (targetTempC = T_REF_STERILIZATION, ambientPressureKpa = TENJO_NOMINAL_ATM_KPA) => {
    const t = parseFloat(targetTempC) || T_REF_STERILIZATION;
    // Antoine invertido: P_mmHg = 10^(8.07131 - 1730.63 / (t + 233.426))
    const pMmHg = Math.pow(10, 8.07131 - (1730.63 / (t + 233.426)));
    const pAbsKpa = pMmHg * (SEA_LEVEL_ATM_KPA / 760);
    const gaugeKpa = Math.max(0, pAbsKpa - (parseFloat(ambientPressureKpa) || TENJO_NOMINAL_ATM_KPA));
    return Math.round(gaugeKpa * KPA_TO_PSI * 100) / 100;
  };

  /**
   * Tasa de letalidad térmica instantánea (L) relativa a 121.11 °C con z = 10.0 °C.
   * L = 10^((T - 121.11) / z)
   *
   * @param {number} tempC Temperatura en °C
   * @param {number} [z=10.0] Valor z de resistencia térmica
   * @returns {number} Tasa de letalidad instantánea (min equivalentes por minuto)
   */
  const calcThermalLethalityRate = (tempC, z = Z_VALUE_SPORES) => {
    const t = parseFloat(tempC) || 0;
    if (t < 80.0) return 0; // Letalidad despreciable bajo 80°C frente a esporas
    return Math.pow(10, (t - T_REF_STERILIZATION) / z);
  };

  /**
   * Factor de compensación de tiempo de sostenimiento si el autoclave se opera a 15.0 psig
   * en lugar de la presión correcta (19.04 psig) en Tenjo.
   *
   * @param {number} [ambientPressureKpa=74.50]
   * @returns {object} Factor de tiempo y temperaturas comparativas
   */
  const calcTimeCompFactorAt15Psi = (ambientPressureKpa = TENJO_NOMINAL_ATM_KPA) => {
    const tempAt15 = calcSteamSatTemp(15.0, ambientPressureKpa);
    const rateAt15 = calcThermalLethalityRate(tempAt15);
    const rateAtTarget = calcThermalLethalityRate(T_REF_STERILIZATION);
    const factor = rateAt15 > 0 ? (rateAtTarget / rateAt15) : 999;
    return {
      tempAt15Psi: tempAt15,
      rateAt15Psi: Math.round(rateAt15 * 10000) / 10000,
      factor: Math.round(factor * 100) / 100,
      lethalityLossPct: Math.round((1 - rateAt15 / rateAtTarget) * 1000) / 10,
      requiredHoldMinFor60MinEquivalent: Math.round(60 * factor),
    };
  };

  /**
   * Simulación minuto a minuto de penetración térmica al núcleo del sustrato y letalidad acumulada F0.
   * Basado en el modelo de conducción transitoria de Ball & Stoforos:
   * T_core(t) = T_steam - j_h * (T_steam - T_0) * 10^(-t / f_h)
   *
   * @param {object} params
   * @param {number} [params.holdTimeMin=90] Minutos de sostenimiento a presión de régimen
   * @param {number} [params.gaugePressurePsi=19.04] Presión manométrica (psig)
   * @param {number} [params.bagKg=2.0] Peso húmedo de la bolsa (kg)
   * @param {number} [params.moisturePct=65] Humedad del sustrato (%)
   * @param {number} [params.ambientPressureKpa=74.50] Presión barométrica local
   * @param {number} [params.initialTempC=18.0] Temperatura inicial del sustrato
   * @param {number} [params.comeUpTimeMin=25] Tiempo de purga y elevación de presión
   * @returns {object} Simulación detallada con perfil temporal y F0 total
   */
  const simulateCorePenetration = (params = {}) => {
    const holdTimeMin = Math.max(10, parseInt(params.holdTimeMin || 90, 10));
    const gaugePressurePsi = Math.max(0, parseFloat(params.gaugePressurePsi ?? 19.04));
    const bagKg = Math.max(0.5, Math.min(5.0, parseFloat(params.bagKg || 2.0)));
    const moisturePct = Math.max(40, Math.min(80, parseFloat(params.moisturePct || 65)));
    const ambientPressureKpa = parseFloat(params.ambientPressureKpa || TENJO_NOMINAL_ATM_KPA);
    const initialTempC = parseFloat(params.initialTempC || 18.0);
    const comeUpTimeMin = Math.max(10, parseInt(params.comeUpTimeMin || 25, 10));
    const coolDownTimeMin = 45; // tiempo de enfriamiento natural dentro del autoclave

    const steamTemp = calcSteamSatTemp(gaugePressurePsi, ambientPressureKpa);

    // Parámetros de penetración térmica según masa y humedad
    // Mayor humedad facilita transferencia por condensación intersticial; mayor masa incrementa el radio r
    const moistureCorrection = 1.0 - ((moisturePct - 60) * 0.005);
    const fh = Math.round((32 + (bagKg * 18.5)) * moistureCorrection);
    const jh = 1.55;

    let f0Accumulated = 0;
    let peakCoreTemp = initialTempC;
    const timeline = [];

    const totalSimulationMin = comeUpTimeMin + holdTimeMin + coolDownTimeMin;

    for (let t = 0; t <= totalSimulationMin; t += 1) {
      // 1. Temperatura de la cámara de vapor
      let currentChamberTemp = initialTempC;
      if (t < comeUpTimeMin) {
        currentChamberTemp = initialTempC + ((steamTemp - initialTempC) * (t / comeUpTimeMin));
      } else if (t <= comeUpTimeMin + holdTimeMin) {
        currentChamberTemp = steamTemp;
      } else {
        const coolT = t - (comeUpTimeMin + holdTimeMin);
        currentChamberTemp = Math.max(ambientPressureKpa <= 75 ? 91.5 : 100, steamTemp - (coolT * 0.65));
      }

      // 2. Temperatura en el núcleo (cold spot)
      let currentCoreTemp = initialTempC;
      if (t > 15) {
        const effectiveTime = t - 10;
        const deltaT = steamTemp - initialTempC;
        const approach = jh * deltaT * Math.pow(10, -effectiveTime / fh);
        currentCoreTemp = Math.min(currentChamberTemp, steamTemp - approach);
        currentCoreTemp = Math.max(initialTempC, currentCoreTemp);
      }

      if (t > comeUpTimeMin + holdTimeMin) {
        // Enfriamiento en el núcleo (inercia térmica alta)
        const coolProgress = (t - (comeUpTimeMin + holdTimeMin)) / coolDownTimeMin;
        currentCoreTemp = Math.max(initialTempC, currentCoreTemp - (coolProgress * 15));
      }

      if (currentCoreTemp > peakCoreTemp) {
        peakCoreTemp = currentCoreTemp;
      }

      // 3. Tasa de letalidad y acumulación de F0
      const lethalityRate = calcThermalLethalityRate(currentCoreTemp, Z_VALUE_SPORES);
      f0Accumulated += lethalityRate * (1.0); // dt = 1 min

      if (t % 5 === 0 || t === totalSimulationMin) {
        timeline.push({
          minute: t,
          chamberTemp: Math.round(currentChamberTemp * 10) / 10,
          coreTemp: Math.round(currentCoreTemp * 10) / 10,
          lethalityRate: Math.round(lethalityRate * 1000) / 1000,
          f0Cumulative: Math.round(f0Accumulated * 100) / 100,
        });
      }
    }

    return {
      holdTimeMin,
      gaugePressurePsi,
      bagKg,
      moisturePct,
      ambientPressureKpa,
      steamTemp: Math.round(steamTemp * 10) / 10,
      peakCoreTemp: Math.round(peakCoreTemp * 10) / 10,
      f0Total: Math.round(f0Accumulated * 10) / 10,
      targetF0: TARGET_F0_MIN,
      isSterile: f0Accumulated >= TARGET_F0_MIN,
      timeline,
    };
  };

  /**
   * Dictamen microbiológico y agronómico de un ciclo de autoclave.
   *
   * @param {object} params Parámetros de ciclo de autoclave
   * @returns {object} Dictamen de inocuidad y recomendaciones operativas
   */
  const validateAutoclaveCycle = (params = {}) => {
    const sim = simulateCorePenetration(params);
    const f0 = sim.f0Total;
    const required19Psi = calcRequiredGaugePressurePsi(T_REF_STERILIZATION, sim.ambientPressureKpa);

    const logReductStearo = Math.round((f0 / D_STEAROTHERMOPHILUS_121) * 10) / 10;
    const logReductSubtilis = Math.round((f0 / D_SUBTILIS_121) * 10) / 10;

    let verdict = 'INSUFICIENTE';
    let badge = '🔴';
    let riskLevel = 'alto';
    let recommendations = [];

    if (f0 >= 15.0) {
      verdict = 'ESTERILIZACIÓN COMPLETA (MARGEN ROBUSTO)';
      badge = '🟢';
      riskLevel = 'seguro';
      recommendations.push('Ciclo óptimo para sustrato altamente suplementado (>20% salvado/soya). Inocuidad garantizada.');
    } else if (f0 >= TARGET_F0_MIN) {
      verdict = 'ESTERILIZACIÓN COMERCIAL ADECUADA';
      badge = '🟢';
      riskLevel = 'seguro';
      recommendations.push('Cumple con el estándar de 6D de reducción de G. stearothermophilus. Proceder a enfriamiento.');
    } else if (f0 >= 6.0) {
      verdict = 'SUB-ESTERILIZADO (RIESGO MODERADO)';
      badge = '🟡';
      riskLevel = 'moderado';
      recommendations.push('Letalidad insuficiente para el núcleo. Riesgo de brote de Bacillus sour rot en bolsas interiores.');
      recommendations.push(`Aumentar el tiempo de meseta en al menos ${Math.round((TARGET_F0_MIN - f0) * 4)} minutos.`);
    } else {
      verdict = 'CONTAMINACIÓN INMINENTE (FALLO CRÍTICO)';
      badge = '🔴';
      riskLevel = 'critico';
      recommendations.push('El núcleo no alcanzó la temperatura letal durante tiempo suficiente. No inocular spawn en este lote.');
      if (sim.gaugePressurePsi < 18.0) {
        recommendations.push(`A 2.600 msnm la presión debe ser ${required19Psi} psi manométricos para llegar a 121°C reales.`);
      }
    }

    return {
      ...sim,
      verdict,
      badge,
      riskLevel,
      requiredGaugePressurePsi: required19Psi,
      logReductionStearothermophilus: logReductStearo,
      logReductionSubtilis: logReductSubtilis,
      recommendations,
    };
  };

  const api = {
    TENJO_ALTITUDE_M,
    TENJO_NOMINAL_ATM_KPA,
    SEA_LEVEL_ATM_KPA,
    T_REF_STERILIZATION,
    Z_VALUE_SPORES,
    TARGET_F0_MIN,
    calcBoilingTempFromAbsPressure,
    calcSteamSatTemp,
    calcRequiredGaugePressurePsi,
    calcThermalLethalityRate,
    calcTimeCompFactorAt15Psi,
    simulateCorePenetration,
    validateAutoclaveCycle,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasSterilization = api;
  if (typeof window !== 'undefined') window.SetasSterilization = api;
})();
