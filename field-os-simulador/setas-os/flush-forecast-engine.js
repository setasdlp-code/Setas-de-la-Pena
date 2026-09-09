'use strict';

/**
 * @file flush-forecast-engine.js — Motor Canónico de Pronóstico de Cosechas, Oleadas y Demanda B2B.
 *
 * Resuelve:
 * 1. Física estricta de materia seca vs húmeda en la Eficiencia Biológica (EB).
 * 2. Matriz biológica de distribución de oleadas (flushes 1, 2, 3) por especie.
 * 3. Cinética térmica de colonización (modelo Arrhenius / Q10) adaptada al clima de Tenjo (2.600 msnm).
 * 4. Cálculo veraz de requerimientos de inoculación (bolsas, sustrato y spawn).
 * 5. Emparejamiento semanal de oferta proyectada vs demanda comprometida con restaurantes B2B.
 * 6. Calibración empírica de flushes a partir de cosechas reales de Bitácora.
 * 7. Predictor de costo unitario de sustrato por kg de hongo fresco cosechado.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const round1 = (v) => Math.round(v * 10) / 10;
  const round2 = (v) => Math.round(v * 100) / 100;
  const round3 = (v) => Math.round(v * 1000) / 1000;

  /**
   * Parsea de manera segura fechas ISO, strings 'YYYY-MM-DD', timestamps y objetos Date.
   * Evita desplazamientos de zona horaria al forzar medio día local en strings solo-fecha,
   * y previene el error RangeError: Invalid time value ante cadenas ISO con sufijo horario.
   */
  const parseDateSafe = (d) => {
    if (!d) return null;
    if (d instanceof Date) return isNaN(d.getTime()) ? null : new Date(d);
    if (typeof d === 'string') {
      const trimmed = d.trim();
      if (!trimmed) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const parsed = new Date(trimmed + 'T12:00:00');
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      const parsed = new Date(trimmed);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof d === 'number') {
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  /**
   * Perfiles biológicos de distribución y temporalidad de oleadas (flushes)
   * verificados para las 9 especies de Setas OS bajo cultivo en sustrato lignocelulósico.
   */
  const SPECIES_FLUSH_PROFILES = {
    p_ostreatus_gris: {
      speciesKey: 'p_ostreatus_gris',
      name: 'Orellana Gris',
      scientific: 'Pleurotus ostreatus',
      flushes: [
        { flush: 1, pct: 0.60, daysAfterInoc: 32, label: '1ª Cosecha' },
        { flush: 2, pct: 0.28, daysAfterInoc: 46, label: '2ª Cosecha' },
        { flush: 3, pct: 0.12, daysAfterInoc: 60, label: '3ª Cosecha' },
      ],
      restDaysBetweenFlushes: 14,
      maxCommercialFlushes: 3,
      tBase: 5.0,
      tRef: 24,
      q10: 2.0,
      nominalIncubationDays: 20,
      nominalFirstFlushDays: 32,
      typicalMoisturePct: 65,
    },
    p_ostreatus_blanco: {
      speciesKey: 'p_ostreatus_blanco',
      name: 'Orellana Blanca',
      scientific: 'Pleurotus florida',
      flushes: [
        { flush: 1, pct: 0.60, daysAfterInoc: 35, label: '1ª Cosecha' },
        { flush: 2, pct: 0.27, daysAfterInoc: 50, label: '2ª Cosecha' },
        { flush: 3, pct: 0.13, daysAfterInoc: 65, label: '3ª Cosecha' },
      ],
      restDaysBetweenFlushes: 14,
      maxCommercialFlushes: 3,
      tBase: 6.0,
      tRef: 24,
      q10: 2.0,
      nominalIncubationDays: 22,
      nominalFirstFlushDays: 35,
      typicalMoisturePct: 65,
    },
    p_djamor_rosa: {
      speciesKey: 'p_djamor_rosa',
      name: 'Orellana Rosa',
      scientific: 'Pleurotus djamor',
      flushes: [
        { flush: 1, pct: 0.75, daysAfterInoc: 26, label: '1ª Cosecha (Explosiva 75%)' },
        { flush: 2, pct: 0.20, daysAfterInoc: 36, label: '2ª Cosecha' },
        { flush: 3, pct: 0.05, daysAfterInoc: 45, label: '3ª Cosecha (Descarte)' },
      ],
      restDaysBetweenFlushes: 9,
      maxCommercialFlushes: 2, // Se descarta tras 2ª oleada
      tBase: 11.0, // Termófila estricta: aborta primordios con T < 14°C
      tRef: 28,
      q10: 2.0,
      nominalIncubationDays: 16,
      nominalFirstFlushDays: 26,
      typicalMoisturePct: 67,
    },
    p_eryngii: {
      speciesKey: 'p_eryngii',
      name: 'Seta de Cardo',
      scientific: 'Pleurotus eryngii',
      flushes: [
        { flush: 1, pct: 0.80, daysAfterInoc: 46, label: '1ª Cosecha (Dominante 80%)' },
        { flush: 2, pct: 0.20, daysAfterInoc: 62, label: '2ª Cosecha' },
      ],
      restDaysBetweenFlushes: 16,
      maxCommercialFlushes: 2,
      tBase: 5.5,
      tRef: 24,
      q10: 2.0,
      nominalIncubationDays: 30,
      nominalFirstFlushDays: 46,
      typicalMoisturePct: 63,
    },
    shiitake: {
      speciesKey: 'shiitake',
      name: 'Shiitake',
      scientific: 'Lentinula edodes',
      flushes: [
        { flush: 1, pct: 0.55, daysAfterInoc: 92, label: '1ª Cosecha (Bloque pardeado)' },
        { flush: 2, pct: 0.30, daysAfterInoc: 122, label: '2ª Cosecha (Inmersión previa)' },
        { flush: 3, pct: 0.15, daysAfterInoc: 152, label: '3ª Cosecha' },
      ],
      restDaysBetweenFlushes: 21,
      requiresWaterImmersion: true,
      maxCommercialFlushes: 3,
      tBase: 6.5,
      tRef: 24,
      q10: 2.0,
      nominalIncubationDays: 60,
      nominalFirstFlushDays: 92,
      typicalMoisturePct: 60,
    },
    lions_mane: {
      speciesKey: 'lions_mane',
      name: 'Melena de León',
      scientific: 'Hericium erinaceus',
      flushes: [
        { flush: 1, pct: 0.70, daysAfterInoc: 38, label: '1ª Cosecha (70% biomasa)' },
        { flush: 2, pct: 0.25, daysAfterInoc: 54, label: '2ª Cosecha' },
        { flush: 3, pct: 0.05, daysAfterInoc: 68, label: '3ª Cosecha' },
      ],
      restDaysBetweenFlushes: 14,
      maxCommercialFlushes: 2,
      tBase: 6.0,
      tRef: 24,
      q10: 2.0,
      nominalIncubationDays: 24,
      nominalFirstFlushDays: 38,
      typicalMoisturePct: 65,
    },
    nameko: {
      speciesKey: 'nameko',
      name: 'Nameko',
      scientific: 'Pholiota nameko',
      flushes: [
        { flush: 1, pct: 0.50, daysAfterInoc: 55, label: '1ª Cosecha' },
        { flush: 2, pct: 0.38, daysAfterInoc: 80, label: '2ª Cosecha (Persistencia 80%)' },
        { flush: 3, pct: 0.12, daysAfterInoc: 100, label: '3ª Cosecha' },
      ],
      restDaysBetweenFlushes: 16,
      requiresWaterImmersion: true,
      maxCommercialFlushes: 3,
      tBase: 5.0,
      tRef: 24,
      q10: 2.0,
      nominalIncubationDays: 36,
      nominalFirstFlushDays: 55,
      typicalMoisturePct: 65,
    },
    enoki: {
      speciesKey: 'enoki',
      name: 'Enoki',
      scientific: 'Flammulina velutipes',
      flushes: [
        { flush: 1, pct: 0.85, daysAfterInoc: 48, label: '1ª Cosecha (Comercial 85%)' },
        { flush: 2, pct: 0.15, daysAfterInoc: 64, label: '2ª Cosecha' },
      ],
      restDaysBetweenFlushes: 12,
      maxCommercialFlushes: 1, // Producción comercial en botella se maneja a 1 sola oleada
      tBase: 3.5,
      tRef: 22,
      q10: 2.0,
      nominalIncubationDays: 26,
      nominalFirstFlushDays: 48,
      typicalMoisturePct: 65,
    },
    reishi: {
      speciesKey: 'reishi',
      name: 'Reishi',
      scientific: 'Ganoderma lucidum',
      flushes: [
        { flush: 1, pct: 0.72, daysAfterInoc: 115, label: '1ª Cosecha' },
        { flush: 2, pct: 0.28, daysAfterInoc: 165, label: '2ª Cosecha' },
      ],
      restDaysBetweenFlushes: 30,
      maxCommercialFlushes: 2,
      tBase: 10.0,
      tRef: 28,
      tOpt: 30,
      tMax: 36,
      q10: 2.0,
      nominalIncubationDays: 50,
      nominalFirstFlushDays: 115,
      typicalMoisturePct: 60,
    },
  };

  // Asignar cardinales térmicos estándar por defecto a especies si no están explícitos
  SPECIES_FLUSH_PROFILES.p_ostreatus_gris.tOpt = 25;
  SPECIES_FLUSH_PROFILES.p_ostreatus_gris.tMax = 32;
  SPECIES_FLUSH_PROFILES.p_ostreatus_blanco.tOpt = 26;
  SPECIES_FLUSH_PROFILES.p_ostreatus_blanco.tMax = 33;
  SPECIES_FLUSH_PROFILES.p_djamor_rosa.tOpt = 29;
  SPECIES_FLUSH_PROFILES.p_djamor_rosa.tMax = 35;
  SPECIES_FLUSH_PROFILES.p_eryngii.tOpt = 24;
  SPECIES_FLUSH_PROFILES.p_eryngii.tMax = 30;
  SPECIES_FLUSH_PROFILES.shiitake.tOpt = 25;
  SPECIES_FLUSH_PROFILES.shiitake.tMax = 30;
  SPECIES_FLUSH_PROFILES.lions_mane.tOpt = 24;
  SPECIES_FLUSH_PROFILES.lions_mane.tMax = 29;
  SPECIES_FLUSH_PROFILES.nameko.tOpt = 23;
  SPECIES_FLUSH_PROFILES.nameko.tMax = 28;
  SPECIES_FLUSH_PROFILES.enoki.tOpt = 22;
  SPECIES_FLUSH_PROFILES.enoki.tMax = 27;

  /**
   * Alias taxonómicos y claves operacionales canónicas de Setas OS.
   */
  const SPECIES_KEY_ALIASES = {
    orellana_gris: 'p_ostreatus_gris',
    orellana_blanca: 'p_ostreatus_blanco',
    orellana_rosa: 'p_djamor_rosa',
    seta_cardo: 'p_eryngii',
    melena_leon: 'lions_mane',
    pleurotus_ostreatus: 'p_ostreatus_gris',
    pleurotus_florida: 'p_ostreatus_blanco',
    pleurotus_djamor: 'p_djamor_rosa',
    pleurotus_eryngii: 'p_eryngii',
    hericium_erinaceus: 'lions_mane',
    lentinula_edodes: 'shiitake',
    flammulina_velutipes: 'enoki',
    pholiota_nameko: 'nameko',
    ganoderma_lucidum: 'reishi',
  };

  /**
   * Normaliza cualquier clave o alias de especie a la clave canónica del perfil de flushes.
   */
  const normalizeSpeciesKey = (key) => {
    if (!key || typeof key !== 'string') return 'p_ostreatus_gris';
    const clean = key.trim().toLowerCase();
    return SPECIES_KEY_ALIASES[clean] || (SPECIES_FLUSH_PROFILES[clean] ? clean : 'p_ostreatus_gris');
  };

  /**
   * Obtiene el perfil de oleadas por especie, con normalización de alias y fallback a Orellana Gris.
   */
  const getSpeciesFlushProfile = (speciesKey) => {
    const norm = normalizeSpeciesKey(speciesKey);
    return SPECIES_FLUSH_PROFILES[norm] || SPECIES_FLUSH_PROFILES.p_ostreatus_gris;
  };

  /**
   * Calcula el factor de retraso cinético térmico según temperatura de cámara
   * aplicando el coeficiente metabólico Q10 y el modelo biológico de temperaturas cardinales (CTMI).
   *
   * D(T) = D(T_ref) * Q10^((T_ref - T) / 10) para T <= T_opt
   *
   * @param {string} speciesKey Clave o alias de la especie
   * @param {number} ambientTemp Temperatura promedio del cuarto en °C
   * @returns {object} Factor térmico, advertencias y temperatura evaluada
   */
  const calcThermalDelayFactor = (speciesKey, ambientTemp) => {
    const profile = getSpeciesFlushProfile(speciesKey);
    const normKey = normalizeSpeciesKey(speciesKey);
    const temp = Number.isFinite(ambientTemp) ? ambientTemp : profile.tRef;
    const tRef = profile.tRef || 24;
    const tBase = profile.tBase || 5.0;
    const tOpt = profile.tOpt || (tRef + 1.0);
    const tMax = profile.tMax || 32.0;
    const q10 = profile.q10 || 2.0;

    // Alertas biológicas por umbrales térmicos
    let coldWarning = null;
    let heatWarning = null;
    let thermalArrest = false;

    if (temp <= tBase) {
      coldWarning = `Temperatura crítica (${temp}°C) por debajo del umbral biológico mínimo (${tBase}°C). Crecimiento detenido por frío.`;
      thermalArrest = true;
    } else if (temp <= tBase + 1.0) {
      coldWarning = `Temperatura crítica (${temp}°C) cercana al umbral biológico mínimo (${tBase}°C). Crecimiento detenido.`;
    } else if (normKey === 'p_djamor_rosa' && temp < 16.0) {
      coldWarning = `Especie termófila P. djamor a ${temp}°C (<16°C). Alto riesgo de aborto primoridial y letargia.`;
    }

    if (temp >= tMax) {
      heatWarning = `Temperatura extrema (${temp}°C) sobrepasa el límite letal vegetativo (${tMax}°C). Desnaturalización enzimática y paro metabólico.`;
      thermalArrest = true;
    } else if (temp > tOpt + 1.5) {
      heatWarning = `Estrés térmico por calor (${temp}°C > ${tOpt}°C). Tasa de crecimiento micelial reducida por gasto de respiración de mantenimiento.`;
    }

    let factor;
    if (thermalArrest) {
      factor = 3.5; // Paro térmico
    } else if (temp <= tOpt) {
      const exponent = (tRef - temp) / 10;
      const rawFactor = Math.pow(q10, exponent);
      factor = Math.max(0.65, Math.min(3.0, rawFactor));
    } else {
      // Régimen supra-óptimo: gasto respiratorio de mantenimiento penaliza el avance micelial
      const heatPenalty = 1.0 + ((temp - tOpt) / (tMax - tOpt)) * 1.5;
      factor = Math.min(3.0, Math.max(0.65, heatPenalty * 0.85));
    }

    return {
      speciesKey: normKey,
      factor: round2(factor),
      temp,
      tRef,
      tBase,
      tOpt,
      tMax,
      coldWarning,
      heatWarning,
      thermalArrest,
      isColdDelayed: factor > 1.15,
      isAccelerated: factor < 0.90,
      isHeatStressed: temp > tOpt,
    };
  };

  /**
   * Calcula con rigor biológico la masa seca, rendimiento fresco y desglose
   * de oleadas para un lote de cultivo.
   *
   * CORRIGE EL BUG de sobreestimación del ~285% al no confundir peso húmedo con materia seca.
   *
   * @param {object} lot Datos del lote
   * @param {object} options Opciones ambientales y de calibración
   * @returns {object} Proyección detallada de producción por oleada
   */
  const calculateLotYieldAndFlushes = (lot = {}, options = {}) => {
    const l = lot || {};
    const opts = options || {};
    const speciesKey = l.especie || l.sKey || l.speciesKey || opts.speciesKey || 'p_ostreatus_gris';
    const profile = getSpeciesFlushProfile(speciesKey);

    const bags = Math.max(1, parseInt(l.bags || l.numBolsas || opts.bags || 1, 10));
    const kgPerBag = Math.max(0.1, parseFloat(l.kgPerBag || l.pesoBolsa || opts.kgPerBag || 1.5));
    const moisturePct = Math.max(40, Math.min(85, parseFloat(l.moisture || l.humedad || opts.moisture || profile.typicalMoisturePct || 65)));
    const dryFraction = 1 - (moisturePct / 100);

    // Materia seca real
    let dryKgPerBag;
    let totalDryKg;
    if (Number.isFinite(parseFloat(l.peseSeco)) && parseFloat(l.peseSeco) > 0) {
      totalDryKg = parseFloat(l.peseSeco);
      dryKgPerBag = totalDryKg / bags;
    } else {
      dryKgPerBag = kgPerBag * dryFraction;
      totalDryKg = bags * dryKgPerBag;
    }

    // Eficiencia Biológica (EB %)
    const eb = Math.max(10, Math.min(250, parseFloat(l.eb || l.ebEstimada || opts.eb || 90)));

    // Factor de merma por contaminación prevista o medida
    const contamRate = clamp01(parseFloat(l.contamRate ?? (l.contPct != null ? l.contPct / 100 : opts.contamRate ?? 0)));
    const healthyFraction = 1 - contamRate;
    const healthyDryKg = totalDryKg * healthyFraction;

    // Rendimiento total de hongo fresco esperado (kg)
    const totalExpectedKg = healthyDryKg * (eb / 100);
    const expectedKgPerBag = dryKgPerBag * (eb / 100) * healthyFraction;

    // Ajuste térmico de días
    const ambientTemp = Number.isFinite(opts.ambientTemp) ? opts.ambientTemp : (l.ambientTemp ?? profile.tRef);
    const thermal = calcThermalDelayFactor(speciesKey, ambientTemp);
    const thermalFactor = thermal.factor;

    // Fecha base de inoculación
    const inocDateInput = l.fechaInoculacion || l.inocDate || opts.inocDate || new Date();
    const inocBase = parseDateSafe(inocDateInput) || new Date();

    // Desglose por oleadas y soporte de estado de avance
    const currentFlush = parseInt(l.currentFlush ?? opts.currentFlush ?? 0, 10);
    const lastFlushDateInput = l.lastFlushDate || opts.lastFlushDate || null;
    const lastFlushBase = parseDateSafe(lastFlushDateInput);

    const flushes = profile.flushes.map((f) => {
      const flushKg = totalExpectedKg * f.pct;
      let adjustedDays;
      let flushDate;
      const isPastHarvested = currentFlush > 0 && f.flush <= currentFlush;

      if (currentFlush > 0 && lastFlushBase && f.flush > currentFlush) {
        // Proyección dinámica de oleadas futuras a partir de la última fecha de cosecha real
        const flushesAhead = f.flush - currentFlush;
        const restDays = (profile.restDaysBetweenFlushes || 14) * flushesAhead;
        const restAdjusted = Math.round(restDays * thermalFactor);
        flushDate = new Date(lastFlushBase);
        flushDate.setDate(flushDate.getDate() + restAdjusted);
        adjustedDays = Math.round((flushDate.getTime() - inocBase.getTime()) / 86400000);
      } else {
        adjustedDays = Math.round(f.daysAfterInoc * thermalFactor);
        flushDate = new Date(inocBase);
        flushDate.setDate(flushDate.getDate() + adjustedDays);
      }

      return {
        flush: f.flush,
        pct: f.pct,
        pctTotal: f.pct * 100,
        kg: round2(flushKg),
        nominalDays: f.daysAfterInoc,
        adjustedDays,
        date: flushDate.toISOString().split('T')[0],
        label: f.label,
        isHarvested: isPastHarvested,
      };
    });

    return {
      totalKg: round2(totalExpectedKg),
      totalDryKg: round2(totalDryKg),
      healthyDryKg: round2(healthyDryKg),
      expectedKgPerBag: round3(expectedKgPerBag),
      wetKgPerBag: round2(kgPerBag),
      dryKgPerBag: round3(dryKgPerBag),
      moisturePct,
      eb: round1(eb),
      contamRate: round3(contamRate),
      speciesKey,
      speciesName: profile.name,
      thermalFactor,
      ambientTemp: thermal.temp,
      coldWarning: thermal.coldWarning,
      heatWarning: thermal.heatWarning,
      thermalArrest: thermal.thermalArrest,
      isHeatStressed: thermal.isHeatStressed,
      currentFlush,
      flushes,
      remainingFlushes: flushes.filter(f => !f.isHarvested),
      remainingExpectedKg: round2(flushes.filter(f => !f.isHarvested).reduce((acc, f) => acc + f.kg, 0)),
      // Compatibilidad directa con interfaces previas que esperan flush1, flush2, flush3
      flush1: flushes[0] ? { pct: flushes[0].pct, kg: flushes[0].kg } : { pct: 0.6, kg: 0 },
      flush2: flushes[1] ? { pct: flushes[1].pct, kg: flushes[1].kg } : { pct: 0.3, kg: 0 },
      flush3: flushes[2] ? { pct: flushes[2].pct, kg: flushes[2].kg } : { pct: 0.1, kg: 0 },
    };
  };

  /**
   * Calcula con precisión biológica los requerimientos de inoculación para cubrir un déficit comercial en kg.
   *
   * @param {number} deficitKg Kilogramos de hongo fresco requeridos
   * @param {string} speciesKey Clave de la especie
   * @param {object} options Opciones de formato de bolsa, EB, merma y oleada objetivo
   * @returns {object} Recomendación de siembra estructurada
   */
  const calculateSowingRequirement = (deficitKg, speciesKey = 'p_ostreatus_gris', options = {}) => {
    const deficit = Math.max(0, parseFloat(deficitKg) || 0);
    if (deficit <= 0) {
      return {
        bagsNeeded: 0,
        wetSubstrateKg: 0,
        drySubstrateKg: 0,
        spawnNeededKg: 0,
        yieldPerBagKg: 0,
        message: 'No hay déficit de cosecha; no se requieren bolsas adicionales.',
      };
    }

    const opts = options || {};
    const profile = getSpeciesFlushProfile(speciesKey);
    const kgPerBag = Math.max(0.5, parseFloat(opts.kgPerBag || 1.5));
    const moisturePct = Math.max(45, Math.min(80, parseFloat(opts.moisture || profile.typicalMoisturePct || 65)));
    const dryKgPerBag = kgPerBag * (1 - moisturePct / 100);

    // EB objetivo (default a valor base o provisto)
    const eb = Math.max(20, Math.min(200, parseFloat(opts.eb || 90)));
    const contamRate = clamp01(parseFloat(opts.contamRate ?? 0.05)); // 5% de contingencia estándar

    // Factor de oleada objetivo: si el pedido es para una fecha única de entrega,
    // normalmente se debe cubrir con la primera oleada comercial (F1)
    const firstFlushOnly = opts.firstFlushOnly === true || opts.targetFlush === 1;
    const targetFlushNumber = opts.targetFlush ? parseInt(opts.targetFlush, 10) : (firstFlushOnly ? 1 : null);
    const targetFlushObj = targetFlushNumber ? profile.flushes.find(f => f.flush === targetFlushNumber) : null;
    const flushFraction = targetFlushObj ? targetFlushObj.pct : 1.0;

    // Rendimiento esperado por bolsa
    const yieldPerBagKg = dryKgPerBag * (eb / 100) * (1 - contamRate) * flushFraction;
    const bagsNeeded = Math.ceil(deficit / Math.max(0.05, yieldPerBagKg));
    const wetSubstrateKg = round1(bagsNeeded * kgPerBag);
    const drySubstrateKg = round1(bagsNeeded * dryKgPerBag);

    // Spawn / micelio requerido (típicamente 7-8% según especie)
    const spawnRatePct = Math.max(3, Math.min(15, parseFloat(opts.spawnRate || 8)));
    const spawnNeededKg = round2(wetSubstrateKg * (spawnRatePct / 100));

    // Cálculo de fecha recomendada de siembra si hay fecha objetivo de entrega
    let recommendedSowDate = null;
    if (opts.targetDate) {
      const target = parseDateSafe(opts.targetDate);
      if (target) {
        const ambientTemp = Number.isFinite(opts.ambientTemp) ? opts.ambientTemp : profile.tRef;
        const thermal = calcThermalDelayFactor(speciesKey, ambientTemp);
        const targetDays = (targetFlushObj && targetFlushObj.daysAfterInoc) ? targetFlushObj.daysAfterInoc : profile.nominalFirstFlushDays;
        const daysToTarget = Math.round(targetDays * thermal.factor);

        const sow = new Date(target);
        sow.setDate(sow.getDate() - daysToTarget);
        recommendedSowDate = sow.toISOString().split('T')[0];
      }
    }

    const flushLabel = targetFlushObj ? ` (Oleada ${targetFlushObj.flush} · ${Math.round(targetFlushObj.pct * 100)}%)` : '';
    const message = `Inocular ${bagsNeeded} bolsas de ${kgPerBag} kg (${wetSubstrateKg} kg sustrato húmedo, ${drySubstrateKg} kg seco, ${spawnNeededKg} kg spawn al ${spawnRatePct}%) para cosechar ~${deficit} kg de ${profile.name} (EB ${eb}%)${flushLabel}.`;

    return {
      deficitKg: round2(deficit),
      bagsNeeded,
      wetSubstrateKg,
      drySubstrateKg,
      spawnNeededKg,
      yieldPerBagKg: round3(yieldPerBagKg),
      kgPerBag,
      eb,
      contamRate,
      speciesKey,
      speciesName: profile.name,
      targetFlush: targetFlushNumber,
      flushFraction,
      targetDate: opts.targetDate || null,
      recommendedSowDate,
      message,
    };
  };

  /**
   * Helper simplificado de recomendación de siembra para integración directa en UI.
   */
  const sowingRecommendation = (deficitKg, speciesKey = 'p_ostreatus_gris', options = {}) => {
    return calculateSowingRequirement(deficitKg, speciesKey, options).message;
  };

  /**
   * Obtiene la clave de semana ISO 8601 canónica (YYYY-Www) para cualquier fecha.
   */
  const getISOWeekKey = (dateInput) => {
    const d = parseDateSafe(dateInput);
    if (!d) return '2026-W01';
    d.setHours(0, 0, 0, 0);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day + 3);
    const thursdayYear = d.getFullYear();
    const firstThursday = new Date(thursdayYear, 0, 4);
    firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
    const weekNum = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
    return `${thursdayYear}-W${String(weekNum).padStart(2, '0')}`;
  };

  /**
   * Empareja las cosechas proyectadas por semana con los compromisos de venta a restaurantes B2B,
   * con soporte de balance global y desglose desagregado por especie.
   *
   * @param {Array<object>} projections Proyecciones de lotes (o lista de lotes activos)
   * @param {Array<object>} commitments Pedidos/compromisos semanales B2B
   * @returns {object} Balance de superávit, déficit, porcentaje de cobertura y desglose
   */
  const matchWeeklyCoverage = (projections = [], commitments = [], options = {}) => {
    const opts = options || {};
    const lotList = Array.isArray(projections) ? projections : [projections].filter(Boolean);
    const commList = Array.isArray(commitments) ? commitments : [];
    const excludeHarvested = opts.excludeHarvested === true || opts.onlyRemaining === true;

    // Normalizar todas las proyecciones a flushes con fechas
    const weeklySupply = {};
    const speciesSupplyTotals = {};

    lotList.forEach((item) => {
      const proj = item.flushes ? item : calculateLotYieldAndFlushes(item);
      const sKey = normalizeSpeciesKey(proj.speciesKey || item.especie || item.sKey || 'p_ostreatus_gris');
      (proj.flushes || []).forEach((f) => {
        if (!f.date) return;
        if (excludeHarvested && f.isHarvested) return;
        const weekKey = getISOWeekKey(f.date);

        if (!weeklySupply[weekKey]) {
          weeklySupply[weekKey] = { projectedKg: 0, lots: [], bySpecies: {} };
        }
        weeklySupply[weekKey].projectedKg += f.kg;
        weeklySupply[weekKey].lots.push({
          loteId: item.id || item.codigo || 'LOTE',
          flush: f.flush,
          kg: f.kg,
          date: f.date,
          speciesKey: sKey,
          isHarvested: !!f.isHarvested,
        });

        if (!weeklySupply[weekKey].bySpecies[sKey]) {
          weeklySupply[weekKey].bySpecies[sKey] = { projectedKg: 0, lots: [] };
        }
        weeklySupply[weekKey].bySpecies[sKey].projectedKg += f.kg;
        weeklySupply[weekKey].bySpecies[sKey].lots.push({
          loteId: item.id || item.codigo || 'LOTE',
          flush: f.flush,
          kg: f.kg,
          isHarvested: !!f.isHarvested,
        });

        speciesSupplyTotals[sKey] = (speciesSupplyTotals[sKey] || 0) + f.kg;
      });
    });

    // Mapear demanda comprometida
    const weeklyDemand = {};
    const speciesDemandTotals = {};

    commList.forEach((c) => {
      const weekKey = c.week || c.semana || '2026-W36';
      const kg = parseFloat(c.kg || c.cantidadKg || 0);
      const sKey = normalizeSpeciesKey(c.speciesKey || c.especie || c.sKey || 'p_ostreatus_gris');

      if (!weeklyDemand[weekKey]) {
        weeklyDemand[weekKey] = { committedKg: 0, customers: [], bySpecies: {} };
      }
      weeklyDemand[weekKey].committedKg += kg;
      weeklyDemand[weekKey].customers.push({
        cliente: c.cliente || c.customer || 'Restaurante',
        kg,
        speciesKey: sKey,
      });

      if (!weeklyDemand[weekKey].bySpecies[sKey]) {
        weeklyDemand[weekKey].bySpecies[sKey] = { committedKg: 0, customers: [] };
      }
      weeklyDemand[weekKey].bySpecies[sKey].committedKg += kg;
      weeklyDemand[weekKey].bySpecies[sKey].customers.push({
        cliente: c.cliente || c.customer || 'Restaurante',
        kg,
      });

      speciesDemandTotals[sKey] = (speciesDemandTotals[sKey] || 0) + kg;
    });

    const allWeeks = [...new Set([...Object.keys(weeklySupply), ...Object.keys(weeklyDemand)])].sort();

    let totalProjected = 0;
    let totalCommitted = 0;
    let totalDeficit = 0;
    let totalSurplus = 0;

    const weeks = allWeeks.map((weekKey) => {
      const proj = round1(weeklySupply[weekKey]?.projectedKg || 0);
      const comm = round1(weeklyDemand[weekKey]?.committedKg || 0);
      const balance = round1(proj - comm);
      const status = balance >= 0 ? 'superavit' : (proj / (comm || 1) >= 0.85 ? 'cobertura' : 'deficit');
      const badge = status === 'superavit' ? '🟢' : status === 'cobertura' ? '🟡' : '🔴';

      totalProjected += proj;
      totalCommitted += comm;
      if (balance >= 0) totalSurplus += balance;
      else totalDeficit += Math.abs(balance);

      // Desglose por especie dentro de la semana
      const weekSpeciesKeys = new Set([
        ...Object.keys(weeklySupply[weekKey]?.bySpecies || {}),
        ...Object.keys(weeklyDemand[weekKey]?.bySpecies || {}),
      ]);
      const weekBySpecies = {};
      weekSpeciesKeys.forEach((sKey) => {
        const sProj = round1(weeklySupply[weekKey]?.bySpecies?.[sKey]?.projectedKg || 0);
        const sComm = round1(weeklyDemand[weekKey]?.bySpecies?.[sKey]?.committedKg || 0);
        const sBalance = round1(sProj - sComm);
        const sStatus = sBalance >= 0 ? 'superavit' : (sProj / (sComm || 1) >= 0.85 ? 'cobertura' : 'deficit');
        weekBySpecies[sKey] = {
          projectedKg: sProj,
          committedKg: sComm,
          balanceKg: sBalance,
          status: sStatus,
          badge: sStatus === 'superavit' ? '🟢' : sStatus === 'cobertura' ? '🟡' : '🔴',
        };
      });

      return {
        week: weekKey,
        projectedKg: proj,
        committedKg: comm,
        balanceKg: balance,
        status,
        badge,
        lots: weeklySupply[weekKey]?.lots || [],
        customers: weeklyDemand[weekKey]?.customers || [],
        bySpecies: weekBySpecies,
      };
    });

    const overallBalance = round1(totalProjected - totalCommitted);
    const overallCoveragePct = totalCommitted > 0 ? round1((totalProjected / totalCommitted) * 100) : 100;

    // Desglose global por especie
    const allSpeciesKeys = new Set([...Object.keys(speciesSupplyTotals), ...Object.keys(speciesDemandTotals)]);
    const bySpecies = {};
    allSpeciesKeys.forEach((sKey) => {
      const sProj = round1(speciesSupplyTotals[sKey] || 0);
      const sComm = round1(speciesDemandTotals[sKey] || 0);
      const sBal = round1(sProj - sComm);
      const sCov = sComm > 0 ? round1((sProj / sComm) * 100) : 100;
      const sStatus = sBal >= 0 ? 'superavit' : (sCov >= 85 ? 'cobertura' : 'deficit');
      bySpecies[sKey] = {
        projectedKg: sProj,
        committedKg: sComm,
        balanceKg: sBal,
        cobertura: sCov,
        status: sStatus,
        badge: sStatus === 'superavit' ? '🟢' : sStatus === 'cobertura' ? '🟡' : '🔴',
      };
    });

    return {
      superavit: round1(totalSurplus),
      deficit: round1(totalDeficit),
      cobertura: overallCoveragePct,
      balanceTotalKg: overallBalance,
      totalProjectedKg: round1(totalProjected),
      totalCommittedKg: round1(totalCommitted),
      weeks,
      bySpecies,
    };
  };

  /**
   * Calibra empíricamente el perfil de oleadas de una especie a partir del historial
   * de cosechas reales registradas en la Bitácora.
   *
   * @param {string} speciesKey Especie a calibrar
   * @param {Array<object>} cosechas Lista de cosechas de Bitácora
   * @returns {object} Perfil de oleadas calibrado
   */
  const calibrateFlushProfileFromHarvests = (speciesKey, cosechas = []) => {
    const defaultProfile = getSpeciesFlushProfile(speciesKey);
    if (!Array.isArray(cosechas) || cosechas.length < 3) {
      return { profile: defaultProfile, isCalibrated: false, sampleCount: cosechas ? cosechas.length : 0 };
    }

    const flushKgs = { 1: 0, 2: 0, 3: 0 };
    let totalHarvestKg = 0;
    let validRecords = 0;

    cosechas.forEach((c) => {
      const fNum = parseInt(c.flush || c.numeroFlush || 1, 10);
      const isKg = c.unit === 'kg' || c.pesoFrescoKg != null;
      const raw = parseFloat(c.pesoFrescoKg ?? c.pesoFresco) || 0;
      const kg = isKg ? raw : raw / 1000;
      if (kg > 0 && fNum >= 1 && fNum <= 3) {
        flushKgs[fNum] += kg;
        totalHarvestKg += kg;
        validRecords++;
      }
    });

    if (totalHarvestKg <= 0 || validRecords < 3) {
      return { profile: defaultProfile, isCalibrated: false, sampleCount: validRecords };
    }

    // Ponderación bayesiana suave entre teoría y observación
    const sampleWeight = Math.min(0.70, validRecords / (validRecords + 6));
    const obsPcts = {
      1: flushKgs[1] / totalHarvestKg,
      2: flushKgs[2] / totalHarvestKg,
      3: flushKgs[3] / totalHarvestKg,
    };

    const calibratedFlushes = defaultProfile.flushes.map((f) => {
      const obsPct = obsPcts[f.flush] ?? f.pct;
      const blendedPct = round3(f.pct * (1 - sampleWeight) + obsPct * sampleWeight);
      return {
        ...f,
        pct: blendedPct,
      };
    });

    // Normalizar a suma 1.0
    const sum = calibratedFlushes.reduce((s, f) => s + f.pct, 0);
    const normalizedFlushes = calibratedFlushes.map((f) => ({
      ...f,
      pct: round3(f.pct / sum),
    }));

    return {
      profile: {
        ...defaultProfile,
        flushes: normalizedFlushes,
      },
      isCalibrated: true,
      sampleCount: validRecords,
      sampleWeight: round2(sampleWeight),
    };
  };

  /**
   * FUNCIONALIDAD 2: Predictor de costo unitario de sustrato por kg de hongo fresco.
   *
   * @param {number} substrateCostPerDryKg Costo del kg de sustrato seco en COP
   * @param {number} eb Eficiencia biológica estimada (ej. 90%)
   * @param {object} options Factores complementarios (costo bolsa, energía, spawn)
   * @returns {object} Costo estimado por kilogramo de seta fresca cosechada
   */
  const predictSubstrateCostPerFreshKg = (substrateCostPerDryKg, eb, options = {}) => {
    const opts = options || {};
    const costDry = Math.max(0, parseFloat(substrateCostPerDryKg) || 0);
    const ebVal = Math.max(10, Math.min(250, parseFloat(eb) || 90));
    const ebFraction = ebVal / 100;

    // Costo de sustrato por kg fresco cosechado
    const costSubstratePerFreshKg = round1(costDry / ebFraction);

    // Si se pasan costos integrales (spawn, energía, consumible)
    const spawnCostPerFreshKg = Number.isFinite(opts.spawnCostPerFreshKg) ? opts.spawnCostPerFreshKg : 0;
    const energyCostPerFreshKg = Number.isFinite(opts.energyCostPerFreshKg) ? opts.energyCostPerFreshKg : 0;
    const totalIncurredPerFreshKg = round1(costSubstratePerFreshKg + spawnCostPerFreshKg + energyCostPerFreshKg);

    return {
      costSubstratePerFreshKg,
      totalIncurredPerFreshKg,
      eb: ebVal,
      substrateCostPerDryKg: costDry,
    };
  };

  const api = {
    SPECIES_FLUSH_PROFILES,
    SPECIES_KEY_ALIASES,
    normalizeSpeciesKey,
    parseDateSafe,
    getSpeciesFlushProfile,
    getISOWeekKey,
    calcThermalDelayFactor,
    calculateLotYieldAndFlushes,
    calculateSowingRequirement,
    sowingRecommendation,
    matchWeeklyCoverage,
    calibrateFlushProfileFromHarvests,
    predictSubstrateCostPerFreshKg,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFlushForecast = api;
})();
