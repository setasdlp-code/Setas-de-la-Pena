'use strict';

/**
 * @file post-harvest-engine.js — Motor de Fisiología Poscosecha y Cadena de Frío
 * para Setas OS (Tenjo, Cundinamarca).
 *
 * Modela:
 * 1. Tasa de respiración aeróbica post-cosecha (Q10) y producción de calor vital (W/kg).
 * 2. Pérdida de peso por transpiración cuticular según VPD y HR de almacenamiento (% pérdida/día).
 * 3. Predictor de vida útil comercial (Shelf-Life en días) y modo de fallo limitante.
 * 4. Comparativa de pérdida de valor comercial (2-4°C vs 8-12°C vs 18-20°C Sabana).
 * 5. Especificaciones de empaque en atmósfera modificada (MAP microperforado anti-fog).
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  // Parámetros fisiológicos poscosecha por especie
  const SPECIES_POSTHARVEST_PROFILES = {
    orellana_gris: {
      id: 'orellana_gris',
      name: 'Orellana Gris (P. ostreatus)',
      r4Co2: 55.0, // mg CO2 / kg h a 4°C
      q10: 2.8,    // Coeficiente térmico de respiración
      kTransp: 14.5, // % pérdida peso / día / kPa VPD
      baseShelfLifeDays4C: 10.0,
      maxWeightLossPct: 5.5,
      browningSensitivity: 'alta',
      packagingType: 'bopp_microperforado',
      targetOtr: 35000, // cm3 / m2 day atm
    },
    orellana_blanca: {
      id: 'orellana_blanca',
      name: 'Orellana Blanca (P. florida)',
      r4Co2: 50.0,
      q10: 2.7,
      kTransp: 13.5,
      baseShelfLifeDays4C: 9.0,
      maxWeightLossPct: 5.5,
      browningSensitivity: 'muy_alta',
      packagingType: 'bopp_microperforado',
      targetOtr: 35000,
    },
    orellana_rosa: {
      id: 'orellana_rosa',
      name: 'Orellana Rosa (P. djamor)',
      r4Co2: 75.0,
      q10: 3.1,
      kTransp: 16.0,
      baseShelfLifeDays4C: 5.0, // Muy perecedera, pierde color rápido
      maxWeightLossPct: 5.0,
      browningSensitivity: 'muy_alta',
      packagingType: 'bopp_microperforado_alta_tasa',
      targetOtr: 45000,
    },
    seta_cardo: {
      id: 'seta_cardo',
      name: 'Seta de Cardo (P. eryngii)',
      r4Co2: 30.0,
      q10: 2.3,
      kTransp: 6.5, // Estípite denso y cutícula resistente
      baseShelfLifeDays4C: 18.0,
      maxWeightLossPct: 6.5,
      browningSensitivity: 'baja',
      packagingType: 'bopp_microperforado_estándar',
      targetOtr: 25000,
    },
    shiitake: {
      id: 'shiitake',
      name: 'Shiitake (Lentinula edodes)',
      r4Co2: 38.0,
      q10: 2.4,
      kTransp: 8.0,
      baseShelfLifeDays4C: 15.0,
      maxWeightLossPct: 6.0,
      browningSensitivity: 'moderada',
      packagingType: 'bopp_microperforado_estándar',
      targetOtr: 28000,
    },
    melena_leon: {
      id: 'melena_leon',
      name: 'Melena de León (Hericium erinaceus)',
      r4Co2: 45.0,
      q10: 2.6,
      kTransp: 18.0, // Gran superficie por espinas, desecación rápida
      baseShelfLifeDays4C: 8.0,
      maxWeightLossPct: 4.5,
      browningSensitivity: 'muy_alta', // Espinas se tornan amarillas/marrones
      packagingType: 'bopp_microperforado_alta_humedad',
      targetOtr: 32000,
    },
    reishi: {
      id: 'reishi',
      name: 'Reishi (Ganoderma lucidum)',
      r4Co2: 12.0,
      q10: 1.8,
      kTransp: 3.0, // Cuerpo leñoso suberoso
      baseShelfLifeDays4C: 45.0,
      maxWeightLossPct: 10.0,
      browningSensitivity: 'nula',
      packagingType: 'papel_kraft_o_polipropileno',
      targetOtr: 15000,
    },
    enoki: {
      id: 'enoki',
      name: 'Enoki (Flammulina velutipes)',
      r4Co2: 42.0,
      q10: 2.5,
      kTransp: 11.0,
      baseShelfLifeDays4C: 14.0,
      maxWeightLossPct: 5.5,
      browningSensitivity: 'moderada',
      packagingType: 'al_vacio_parcial_o_microperforado',
      targetOtr: 30000,
    },
    nameko: {
      id: 'nameko',
      name: 'Nameko (Pholiota nameko)',
      r4Co2: 48.0,
      q10: 2.6,
      kTransp: 14.0,
      baseShelfLifeDays4C: 7.0,
      maxWeightLossPct: 5.0,
      browningSensitivity: 'alta',
      packagingType: 'termoformado_anti_fog',
      targetOtr: 32000,
    },
  };

  /**
   * Presión de vapor de saturación según Tetens (kPa).
   */
  const calcVPsat = (tempC) => 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));

  /**
   * Déficit de presión de vapor en almacenamiento (kPa).
   */
  const calcStorageVPD = (tempC, rhPct) => {
    const sat = calcVPsat(tempC);
    const clampedRh = Math.max(10, Math.min(100, parseFloat(rhPct) || 90));
    return Math.max(0, sat * (1 - (clampedRh / 100)));
  };

  /**
   * Calcula la tasa de respiración aeróbica poscosecha y el calor vital emitido.
   *
   * @param {string} speciesKey
   * @param {number} tempC Temperatura de almacenamiento en °C
   * @param {number} [batchKg=1.0] Masa del lote en kg
   * @returns {object} Tasa de CO2 (mg/kg h), calor vital (Watts) y factor de aceleración
   */
  const calcPostHarvestRespiration = (speciesKey, tempC, batchKg = 1.0) => {
    const sp = SPECIES_POSTHARVEST_PROFILES[speciesKey] || SPECIES_POSTHARVEST_PROFILES.orellana_gris;
    const t = parseFloat(tempC) || 4.0;
    const mass = Math.max(0.01, parseFloat(batchKg) || 1.0);

    // Ley de Van 't Hoff / Q10: R(T) = R_4 * Q10^((T - 4) / 10)
    const deltaExponent = (t - 4.0) / 10.0;
    const accelFactor = Math.pow(sp.q10, deltaExponent);
    const respirationMgKgH = sp.r4Co2 * accelFactor;

    // Calor vital: 1 mg CO2 = ~10.7 J de calor de oxidación glucolítica
    // Watts por kg = (mg CO2 / kg h) * 10.7 J / 3600 s = mg * 0.002972
    const vitalHeatWattsPerKg = respirationMgKgH * 0.0029722;
    const totalVitalHeatWatts = vitalHeatWattsPerKg * mass;

    return {
      species: sp.name,
      tempC: t,
      batchKg: mass,
      r4Co2: sp.r4Co2,
      q10: sp.q10,
      respirationMgKgH: Math.round(respirationMgKgH * 10) / 10,
      accelerationFactor: Math.round(accelFactor * 100) / 100,
      vitalHeatWattsPerKg: Math.round(vitalHeatWattsPerKg * 1000) / 1000,
      totalVitalHeatWatts: Math.round(totalVitalHeatWatts * 10) / 10,
    };
  };

  /**
   * Calcula la tasa de transpiración y pérdida de peso cuticular (% pérdida por día).
   * Si el hongo está empacado (isPackaged = true), la película BOPP/termoformado retiene un microclima
   * de 95-97% HR, reduciendo drásticamente la tasa de desecación frente a hongos expuestos al aire libre.
   *
   * @param {string} speciesKey
   * @param {number} tempC Temperatura en °C
   * @param {number} [rhPct=90] Humedad relativa en cámara de almacenamiento (%)
   * @param {boolean} [isPackaged=true] Indica si el producto está en empaque comercial (BOPP/punnet)
   * @returns {object} VPD, % pérdida diaria y días hasta merma comercial
   */
  const calcTranspirationLoss = (speciesKey, tempC, rhPct = 90, isPackaged = true) => {
    const sp = SPECIES_POSTHARVEST_PROFILES[speciesKey] || SPECIES_POSTHARVEST_PROFILES.orellana_gris;
    // En empaque microperforado, la humedad de equilibrio interna se mantiene en ~96%
    const effectiveRh = isPackaged ? Math.max(rhPct, 96.0) : parseFloat(rhPct) || 90.0;
    const vpd = calcStorageVPD(tempC, effectiveRh);

    // Si está empacado, el empaque impone una resistencia difusiva adicional (factor 0.35x sobre el aire libre)
    const packagingBarrierFactor = isPackaged ? 0.35 : 1.0;
    const weightLossPctPerDay = sp.kTransp * vpd * packagingBarrierFactor;
    const daysToCriticalMerma = weightLossPctPerDay > 0
      ? (sp.maxWeightLossPct / weightLossPctPerDay)
      : 99.0;

    return {
      species: sp.name,
      tempC,
      rhPct,
      effectiveRh,
      isPackaged,
      storageVpdKpa: Math.round(vpd * 1000) / 1000,
      weightLossPctPerDay: Math.round(weightLossPctPerDay * 100) / 100,
      maxAllowedWeightLossPct: sp.maxWeightLossPct,
      daysToDesiccationLimit: Math.round(daysToCriticalMerma * 10) / 10,
    };
  };

  /**
   * Predictor completo de vida útil comercial (Shelf-Life) según condiciones de almacenamiento.
   * Modela los tres modos de deterioro concurrentes:
   * 1. Desecación / pérdida de peso por transpiración cuticular.
   * 2. Consumo de carbohidratos de reserva (manitol/trehalosa) por respiración acelerada.
   * 3. Senescencia enzimática (pardeamiento PPO y pérdida de firmeza).
   *
   * @param {string} speciesKey
   * @param {number} tempC Temperatura (°C)
   * @param {number} [rhPct=90] Humedad relativa (%)
   * @param {object} [options={}] Opciones adicionales
   * @param {boolean} [options.isPackaged=true] Si cuenta con empaque comercial
   * @returns {object} Días de vida comercial, modo de fallo limitante y recomendaciones de empaque
   */
  const predictShelfLife = (speciesKey, tempC, rhPct = 90, options = {}) => {
    const sp = SPECIES_POSTHARVEST_PROFILES[speciesKey] || SPECIES_POSTHARVEST_PROFILES.orellana_gris;
    const t = parseFloat(tempC) || 4.0;
    const rh = parseFloat(rhPct) || 90.0;
    const isPackaged = options.isPackaged ?? true;

    // 1. Límite por transpiración
    const transp = calcTranspirationLoss(speciesKey, t, rh, isPackaged);
    const slTransp = transp.daysToDesiccationLimit;

    // 2. Límite por respiración metabólica (reserva de ~35 g/kg de manitol oxidable)
    const resp = calcPostHarvestRespiration(speciesKey, t, 1.0);
    // Consumo de 35 g azúcar = 51.3 g CO2 = 51,300 mg CO2
    const slResp = Math.max(1.0, 51300 / (resp.respirationMgKgH * 24));

    // 3. Límite por senescencia enzimática (PPO / pardeamiento)
    const q10Enzymatic = 2.4;
    const slSenesc = Math.max(0.5, sp.baseShelfLifeDays4C * Math.pow(q10Enzymatic, -(t - 4.0) / 10.0));

    // El factor limitante es el mínimo de los tres (Ley del Mínimo)
    let limitingFactor = 'senescencia_pardeamiento';
    let minDays = slSenesc;

    if (slTransp < minDays) {
      minDays = slTransp;
      limitingFactor = 'desecacion_perdida_peso';
    }
    if (slResp < minDays) {
      minDays = slResp;
      limitingFactor = 'agotamiento_metabolico_azucares';
    }

    const marketableDays = Math.max(0.5, Math.round(minDays * 10) / 10);

    // Comparativa de vida útil en los 3 escenarios operativos típicos
    const coldRoom4C = Math.round(sp.baseShelfLifeDays4C * 10) / 10;
    const domesticFridge10C = Math.max(1.0, Math.round(sp.baseShelfLifeDays4C * Math.pow(q10Enzymatic, -0.6) * 10) / 10);
    const ambientSabana18C = Math.max(0.5, Math.round(sp.baseShelfLifeDays4C * Math.pow(q10Enzymatic, -1.4) * 10) / 10);

    let statusBadge = '🟢';
    if (marketableDays < 3.0) statusBadge = '🔴';
    else if (marketableDays < 6.0) statusBadge = '🟡';

    return {
      speciesId: sp.id,
      speciesName: sp.name,
      storageTempC: t,
      storageRhPct: rh,
      marketableShelfLifeDays: marketableDays,
      limitingFactor,
      statusBadge,
      componentLimits: {
        diasPorDesecacion: Math.round(slTransp * 10) / 10,
        diasPorRespiracion: Math.round(slResp * 10) / 10,
        diasPorSenescenciaPPO: Math.round(slSenesc * 10) / 10,
      },
      respiration: resp,
      transpiration: transp,
      scenariosComparison: {
        cuartoFrio_4C: coldRoom4C,
        neveraDomestica_10C: domesticFridge10C,
        ambienteSabana_18C: ambientSabana18C,
        lossRatioAmbienteVsFrio: Math.round((1 - (ambientSabana18C / coldRoom4C)) * 100),
      },
      packagingRecommendation: {
        type: sp.packagingType,
        targetOtr: `${sp.targetOtr} cm³/m²·día·atm`,
        antiFogRequired: true,
        guidance: 'Película BOPP láser microperforada con aditivo anti-fog. Previene hipoxia anaeróbica (<1% O2) y condensación libre.',
      },
    };
  };

  const api = {
    SPECIES_POSTHARVEST_PROFILES,
    calcPostHarvestRespiration,
    calcTranspirationLoss,
    predictShelfLife,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPostHarvest = api;
  if (typeof window !== 'undefined') window.SetasPostHarvest = api;
})();
