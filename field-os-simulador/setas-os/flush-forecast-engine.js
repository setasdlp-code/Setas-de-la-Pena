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
      q10: 2.0,
      nominalIncubationDays: 50,
      nominalFirstFlushDays: 115,
      typicalMoisturePct: 60,
    },
  };

  /**
   * Obtiene el perfil de oleadas por especie, con fallback a Orellana Gris.
   */
  const getSpeciesFlushProfile = (speciesKey) => {
    return SPECIES_FLUSH_PROFILES[speciesKey] || SPECIES_FLUSH_PROFILES.p_ostreatus_gris;
  };

  /**
   * Calcula el factor de retraso cinético térmico según temperatura de cámara
   * aplicando el coeficiente metabólico Q10 = 2.0.
   *
   * D(T) = D(T_ref) * Q10^((T_ref - T) / 10)
   *
   * @param {string} speciesKey Clave de la especie
   * @param {number} ambientTemp Temperatura promedio del cuarto en °C
   * @returns {object} Factor térmico, advertencias y temperatura evaluada
   */
  const calcThermalDelayFactor = (speciesKey, ambientTemp) => {
    const profile = getSpeciesFlushProfile(speciesKey);
    const temp = Number.isFinite(ambientTemp) ? ambientTemp : profile.tRef;
    const tRef = profile.tRef || 24;
    const tBase = profile.tBase || 5.0;
    const q10 = profile.q10 || 2.0;

    // Alerta biológica si la temperatura se acerca a tBase
    let coldWarning = null;
    if (temp <= tBase + 1.0) {
      coldWarning = `Temperatura crítica (${temp}°C) cercana al umbral biológico mínimo (${tBase}°C). Crecimiento detenido.`;
    } else if (speciesKey === 'p_djamor_rosa' && temp < 16.0) {
      coldWarning = `Especie termófila P. djamor a ${temp}°C (<16°C). Alto riesgo de aborto primoridial y letargia.`;
    }

    const exponent = (tRef - temp) / 10;
    const rawFactor = Math.pow(q10, exponent);
    // Factor acotado entre 0.65 (aceleración por calor controlado) y 3.0 (retraso severo por frío)
    const factor = Math.max(0.65, Math.min(3.0, rawFactor));

    return {
      factor: round2(factor),
      temp,
      tRef,
      coldWarning,
      isColdDelayed: factor > 1.15,
      isAccelerated: factor < 0.90,
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
    const speciesKey = lot.especie || lot.sKey || lot.speciesKey || options.speciesKey || 'p_ostreatus_gris';
    const profile = getSpeciesFlushProfile(speciesKey);

    const bags = Math.max(1, parseInt(lot.bags || lot.numBolsas || options.bags || 1, 10));
    const kgPerBag = Math.max(0.1, parseFloat(lot.kgPerBag || lot.pesoBolsa || options.kgPerBag || 1.5));
    const moisturePct = Math.max(40, Math.min(85, parseFloat(lot.moisture || lot.humedad || options.moisture || profile.typicalMoisturePct || 65)));
    const dryFraction = 1 - (moisturePct / 100);

    // Materia seca real
    let dryKgPerBag;
    let totalDryKg;
    if (Number.isFinite(parseFloat(lot.peseSeco)) && parseFloat(lot.peseSeco) > 0) {
      totalDryKg = parseFloat(lot.peseSeco);
      dryKgPerBag = totalDryKg / bags;
    } else {
      dryKgPerBag = kgPerBag * dryFraction;
      totalDryKg = bags * dryKgPerBag;
    }

    // Eficiencia Biológica (EB %)
    const eb = Math.max(10, Math.min(250, parseFloat(lot.eb || lot.ebEstimada || options.eb || 90)));

    // Factor de merma por contaminación prevista o medida
    const contamRate = clamp01(parseFloat(lot.contamRate ?? (lot.contPct != null ? lot.contPct / 100 : options.contamRate ?? 0)));
    const healthyFraction = 1 - contamRate;
    const healthyDryKg = totalDryKg * healthyFraction;

    // Rendimiento total de hongo fresco esperado (kg)
    const totalExpectedKg = healthyDryKg * (eb / 100);
    const expectedKgPerBag = dryKgPerBag * (eb / 100) * healthyFraction;

    // Ajuste térmico de días
    const ambientTemp = Number.isFinite(options.ambientTemp) ? options.ambientTemp : (lot.ambientTemp ?? profile.tRef);
    const thermal = calcThermalDelayFactor(speciesKey, ambientTemp);
    const thermalFactor = thermal.factor;

    // Fecha base de inoculación
    const inocDateStr = lot.fechaInoculacion || lot.inocDate || options.inocDate || new Date().toISOString().split('T')[0];
    const inocBase = new Date(inocDateStr + 'T12:00:00');

    // Desglose por oleadas
    const flushes = profile.flushes.map((f) => {
      const flushKg = totalExpectedKg * f.pct;
      const adjustedDays = Math.round(f.daysAfterInoc * thermalFactor);
      const flushDate = new Date(inocBase);
      flushDate.setDate(flushDate.getDate() + adjustedDays);

      return {
        flush: f.flush,
        pct: f.pct,
        pctTotal: f.pct * 100,
        kg: round2(flushKg),
        nominalDays: f.daysAfterInoc,
        adjustedDays,
        date: flushDate.toISOString().split('T')[0],
        label: f.label,
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
      flushes,
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
   * @param {object} options Opciones de formato de bolsa, EB y merma
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

    const profile = getSpeciesFlushProfile(speciesKey);
    const kgPerBag = Math.max(0.5, parseFloat(options.kgPerBag || 1.5));
    const moisturePct = Math.max(45, Math.min(80, parseFloat(options.moisture || profile.typicalMoisturePct || 65)));
    const dryKgPerBag = kgPerBag * (1 - moisturePct / 100);

    // EB objetivo (default a valor base o provisto)
    const eb = Math.max(20, Math.min(200, parseFloat(options.eb || 90)));
    const contamRate = clamp01(parseFloat(options.contamRate ?? 0.05)); // 5% de contingencia estándar

    // Rendimiento esperado por bolsa
    const yieldPerBagKg = dryKgPerBag * (eb / 100) * (1 - contamRate);
    const bagsNeeded = Math.ceil(deficit / Math.max(0.05, yieldPerBagKg));
    const wetSubstrateKg = round1(bagsNeeded * kgPerBag);
    const drySubstrateKg = round1(bagsNeeded * dryKgPerBag);

    // Spawn / micelio requerido (típicamente 7-8% según especie)
    const spawnRatePct = Math.max(3, Math.min(15, parseFloat(options.spawnRate || 8)));
    const spawnNeededKg = round2(wetSubstrateKg * (spawnRatePct / 100));

    // Cálculo de fecha recomendada de siembra si hay fecha objetivo de entrega
    let recommendedSowDate = null;
    if (options.targetDate) {
      const target = new Date(options.targetDate + 'T12:00:00');
      const ambientTemp = Number.isFinite(options.ambientTemp) ? options.ambientTemp : profile.tRef;
      const thermal = calcThermalDelayFactor(speciesKey, ambientTemp);
      const daysToF1 = Math.round(profile.nominalFirstFlushDays * thermal.factor);

      const sow = new Date(target);
      sow.setDate(sow.getDate() - daysToF1);
      recommendedSowDate = sow.toISOString().split('T')[0];
    }

    const message = `Inocular ${bagsNeeded} bolsas de ${kgPerBag} kg (${wetSubstrateKg} kg sustrato húmedo, ${drySubstrateKg} kg seco, ${spawnNeededKg} kg spawn al ${spawnRatePct}%) para cosechar ~${deficit} kg de ${profile.name} (EB ${eb}%).`;

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
      targetDate: options.targetDate || null,
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
   * Empareja las cosechas proyectadas por semana con los compromisos de venta a restaurantes B2B.
   *
   * @param {Array<object>} projections Proyecciones de lotes (o lista de lotes activos)
   * @param {Array<object>} commitments Pedidos/compromisos semanales B2B
   * @returns {object} Balance de superávit, déficit, porcentaje de cobertura y desglose
   */
  const matchWeeklyCoverage = (projections = [], commitments = []) => {
    const lotList = Array.isArray(projections) ? projections : [projections].filter(Boolean);
    const commList = Array.isArray(commitments) ? commitments : [];

    // Normalizar todas las proyecciones a flushes con fechas
    const weeklySupply = {};
    lotList.forEach((item) => {
      const proj = item.flushes ? item : calculateLotYieldAndFlushes(item);
      (proj.flushes || []).forEach((f) => {
        if (!f.date) return;
        const d = new Date(f.date + 'T12:00:00');
        // Identificador de semana: YYYY-Www
        const year = d.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const dayOfYear = Math.floor((d - firstDayOfYear) / 86400000);
        const weekNum = Math.ceil((dayOfYear + firstDayOfYear.getDay() + 1) / 7);
        const weekKey = `${year}-W${String(weekNum).padStart(2, '0')}`;

        if (!weeklySupply[weekKey]) weeklySupply[weekKey] = { projectedKg: 0, lots: [] };
        weeklySupply[weekKey].projectedKg += f.kg;
        weeklySupply[weekKey].lots.push({
          loteId: item.id || item.codigo || 'LOTE',
          flush: f.flush,
          kg: f.kg,
          date: f.date,
        });
      });
    });

    // Mapear demanda comprometida
    const weeklyDemand = {};
    commList.forEach((c) => {
      const weekKey = c.week || c.semana || '2026-W36';
      const kg = parseFloat(c.kg || c.cantidadKg || 0);
      if (!weeklyDemand[weekKey]) weeklyDemand[weekKey] = { committedKg: 0, customers: [] };
      weeklyDemand[weekKey].committedKg += kg;
      weeklyDemand[weekKey].customers.push({
        cliente: c.cliente || c.customer || 'Restaurante',
        kg,
      });
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

      return {
        week: weekKey,
        projectedKg: proj,
        committedKg: comm,
        balanceKg: balance,
        status,
        badge,
        lots: weeklySupply[weekKey]?.lots || [],
        customers: weeklyDemand[weekKey]?.customers || [],
      };
    });

    const overallBalance = round1(totalProjected - totalCommitted);
    const overallCoveragePct = totalCommitted > 0 ? round1((totalProjected / totalCommitted) * 100) : 100;

    return {
      superavit: round1(totalSurplus),
      deficit: round1(totalDeficit),
      cobertura: overallCoveragePct,
      balanceTotalKg: overallBalance,
      totalProjectedKg: round1(totalProjected),
      totalCommittedKg: round1(totalCommitted),
      weeks,
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
      const kg = (parseFloat(c.pesoFresco) || 0) / 1000;
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
    const costDry = Math.max(0, parseFloat(substrateCostPerDryKg) || 0);
    const ebVal = Math.max(10, Math.min(250, parseFloat(eb) || 90));
    const ebFraction = ebVal / 100;

    // Costo de sustrato por kg fresco cosechado
    const costSubstratePerFreshKg = round1(costDry / ebFraction);

    // Si se pasan costos integrales (spawn, energía, consumible)
    const spawnCostPerFreshKg = Number.isFinite(options.spawnCostPerFreshKg) ? options.spawnCostPerFreshKg : 0;
    const energyCostPerFreshKg = Number.isFinite(options.energyCostPerFreshKg) ? options.energyCostPerFreshKg : 0;
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
    getSpeciesFlushProfile,
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
