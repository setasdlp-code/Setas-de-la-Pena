'use strict';

/**
 * @file co-cultivation-matrix.js — Matriz de Co-Cultivo e Intersección Climática
 * para Setas OS (Tenjo, Cundinamarca).
 *
 * Resuelve:
 * 1. Definición de perfiles climáticos 4D (T, HR, CO2, Lux) en lógica difusa trapezoidal para 9 especies.
 * 2. Cálculo de compatibilidad por intersección difusa y cuello de botella de Liebig (Ley del Mínimo).
 * 3. Penalizaciones biológicas cruzadas (esporulación masiva, deformación por CO2, encharcamiento).
 * 4. Clasificación en los 4 clusters operacionales de granja modular.
 * 5. Optimizador Minimax de setpoints de cámara para policultivo simultáneo.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  /**
   * Parámetros climáticos óptimos y tolerables de fructificación para las 9 especies de Setas OS.
   * Formato de rangos trapezoidales [min, opt_low, opt_high, max]:
   * - tempC: [a, b, c, d]
   * - rhPct: [a, b, c, d]
   * - co2Ppm: [a, b, c, d] (en CO2, 'd' es el límite crítico antes de aborto o atrofia)
   * - lux: [a, b, c, d]
   */
  const SPECIES_CLIMATE_PROFILES = {
    orellana_gris: {
      id: 'orellana_gris',
      name: 'Orellana Gris (P. ostreatus)',
      cluster: 'cluster_templado_orellanas',
      tempC: [12, 16, 20, 24],
      rhPct: [80, 85, 90, 95],
      co2Ppm: [400, 600, 900, 1200],
      lux: [500, 800, 1500, 2000],
      sporeLoad: 'muy_alta', // Carga de esporas masiva en madurez
      co2Sensitivity: 'muy_alta', // Tallo largo y sombrero pequeño si CO2 > 1000
    },
    orellana_blanca: {
      id: 'orellana_blanca',
      name: 'Orellana Blanca (P. florida / ostreatus)',
      cluster: 'cluster_templado_orellanas',
      tempC: [15, 18, 23, 27],
      rhPct: [80, 85, 90, 95],
      co2Ppm: [400, 600, 900, 1200],
      lux: [500, 800, 1500, 2000],
      sporeLoad: 'alta',
      co2Sensitivity: 'alta',
    },
    orellana_rosa: {
      id: 'orellana_rosa',
      name: 'Orellana Rosa (P. djamor)',
      cluster: 'cluster_termófilo_tropical',
      tempC: [20, 23, 28, 32], // Termófila estricta
      rhPct: [80, 85, 92, 98],
      co2Ppm: [400, 600, 1000, 1400],
      lux: [600, 1000, 1800, 2500],
      sporeLoad: 'alta',
      co2Sensitivity: 'alta',
    },
    seta_cardo: {
      id: 'seta_cardo',
      name: 'Seta de Cardo (P. eryngii)',
      cluster: 'cluster_templado_orellanas',
      tempC: [12, 15, 19, 22],
      rhPct: [82, 86, 92, 96],
      co2Ppm: [500, 800, 1500, 2200], // Tolera mayor CO2 para engrosar el estípite
      lux: [400, 600, 1000, 1500],
      sporeLoad: 'baja',
      co2Sensitivity: 'moderada',
    },
    shiitake: {
      id: 'shiitake',
      name: 'Shiitake (Lentinula edodes)',
      cluster: 'cluster_templado_especializado',
      tempC: [14, 17, 21, 25],
      rhPct: [75, 82, 88, 93], // Prefiere HR ligeramente menor para evitar pardeamiento bacteriano
      co2Ppm: [400, 600, 1000, 1400],
      lux: [400, 700, 1200, 1800],
      sporeLoad: 'moderada',
      co2Sensitivity: 'moderada',
    },
    melena_leon: {
      id: 'melena_leon',
      name: 'Melena de León (Hericium erinaceus)',
      cluster: 'cluster_templado_especializado',
      tempC: [15, 18, 22, 25],
      rhPct: [85, 90, 95, 98], // Muy vulnerable al secado de espinas
      co2Ppm: [400, 600, 900, 1200], // Se vuelve coraliforme si CO2 > 1000
      lux: [300, 500, 900, 1200],
      sporeLoad: 'baja',
      co2Sensitivity: 'muy_alta',
    },
    reishi: {
      id: 'reishi',
      name: 'Reishi (Ganoderma lucidum)',
      cluster: 'cluster_termófilo_tropical',
      tempC: [21, 24, 29, 33],
      rhPct: [75, 82, 90, 95],
      co2Ppm: [800, 1500, 3000, 5000], // Alto CO2 induce astas 'antlers'
      lux: [500, 1000, 1800, 2500],
      sporeLoad: 'muy_alta',
      co2Sensitivity: 'baja',
    },
    enoki: {
      id: 'enoki',
      name: 'Enoki (Flammulina velutipes)',
      cluster: 'cluster_frío_andino',
      tempC: [8, 11, 15, 18], // Friófilo estricto
      rhPct: [85, 90, 95, 98],
      co2Ppm: [1000, 2000, 4000, 6000], // Fructificación comercial requiere alto CO2
      lux: [100, 200, 400, 600],
      sporeLoad: 'baja',
      co2Sensitivity: 'baja',
    },
    nameko: {
      id: 'nameko',
      name: 'Nameko (Pholiota nameko)',
      cluster: 'cluster_frío_andino',
      tempC: [10, 13, 17, 20],
      rhPct: [88, 92, 96, 100], // Requiere película mucilaginosa húmeda
      co2Ppm: [400, 600, 900, 1300],
      lux: [400, 700, 1100, 1600],
      sporeLoad: 'moderada',
      co2Sensitivity: 'alta',
    },
  };

  /**
   * Función de pertenencia difusa trapezoidal.
   * @param {number} x Valor evaluado
   * @param {number[]} range [a, b, c, d]
   * @returns {number} Grado de satisfacción [0.0 - 1.0]
   */
  const evalTrapezoid = (x, [a, b, c, d]) => {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1.0;
    if (x > a && x < b) return (x - a) / (b - a);
    return (d - x) / (d - c);
  };

  /**
   * Calcula la intersección o solapamiento dimensional entre dos especies para un eje climático.
   * Combina la máxima satisfacción simultánea alcanzable (Dubois & Prade: sup_x min(muA, muB))
   * con el índice de solapamiento de área Jaccard fuzzy para penalizar ventanas estrechas.
   *
   * @param {number[]} rangeA [a, b, c, d]
   * @param {number[]} rangeB [a, b, c, d]
   * @returns {number} Grado de compatibilidad en este eje [0.0 - 1.0]
   */
  const calcAxisOverlap = (rangeA, rangeB) => {
    // Si los rangos tolerables no se tocan, solapamiento nulo
    if (rangeA[3] <= rangeB[0] || rangeB[3] <= rangeA[0]) return 0;

    const minVal = Math.min(rangeA[0], rangeB[0]);
    const maxVal = Math.max(rangeA[3], rangeB[3]);
    const steps = 40;
    const step = (maxVal - minVal) / steps;

    let maxMinSat = 0;
    let sumIntersection = 0;
    let sumUnion = 0;

    for (let i = 0; i <= steps; i += 1) {
      const x = minVal + (i * step);
      const muA = evalTrapezoid(x, rangeA);
      const muB = evalTrapezoid(x, rangeB);
      const inter = Math.min(muA, muB);
      const uni = Math.max(muA, muB);

      if (inter > maxMinSat) maxMinSat = inter;
      sumIntersection += inter;
      sumUnion += uni;
    }

    const jaccard = sumUnion > 0 ? (sumIntersection / sumUnion) : 0;
    return Math.min(1.0, Math.max(0, (0.75 * maxMinSat) + (0.25 * jaccard)));
  };

  /**
   * Penalizaciones biológicas entre pares de especies por riesgos agronómicos cruzados.
   */
  const calcBiologicalPenalties = (speciesA, speciesB) => {
    let penalty = 0;
    const reasons = [];

    // 1. Conflicto por esporulación masiva de Pleurotus sobre Melena de León o Shiitake
    const isPleurotusHeavy = ['orellana_gris', 'orellana_blanca'].includes(speciesA.id) || ['orellana_gris', 'orellana_blanca'].includes(speciesB.id);
    const isDelicate = ['melena_leon', 'shiitake'].includes(speciesA.id) || ['melena_leon', 'shiitake'].includes(speciesB.id);
    if (isPleurotusHeavy && isDelicate) {
      penalty += 0.15;
      reasons.push('Esporulación masiva de Orellana puede manchar o deformar las espinas de Melena de León o sombreros de Shiitake.');
    }

    // 2. Conflicto por incompatibilidad morfogenética de CO2 (ej. Orellana/Melena vs Reishi/Enoki)
    const needsHighFae = ['orellana_gris', 'melena_leon'].includes(speciesA.id) || ['orellana_gris', 'melena_leon'].includes(speciesB.id);
    const needsHighCo2 = ['reishi', 'enoki'].includes(speciesA.id) || ['reishi', 'enoki'].includes(speciesB.id);
    if (needsHighFae && needsHighCo2) {
      penalty += 0.25;
      reasons.push('Conflicto crítico de ventilación: una especie requiere alta tasa FAE (<800 ppm) y la otra requiere acumulación de CO2 (>2000 ppm).');
    }

    // 3. Conflicto de HR saturada (Melena de León / Nameko >95%) vs Shiitake (<85% para evitar pseudomonas/pardeamiento)
    const needsWet = ['nameko', 'melena_leon'].includes(speciesA.id) || ['nameko', 'melena_leon'].includes(speciesB.id);
    const needsDryer = ['shiitake'].includes(speciesA.id) || ['shiitake'].includes(speciesB.id);
    if (needsWet && needsDryer) {
      penalty += 0.10;
      reasons.push('Humedad extrema requerida (>92%) incrementa riesgo de bacteriosis en Shiitake.');
    }

    return { penalty, reasons };
  };

  /**
   * Calcula la compatibilidad pairwise entre dos especies.
   * Aplica la Ley del Mínimo de Liebig: Compat = 0.5 * Min(Ejes) + 0.5 * Promedio(Ejes) - Penalizaciones.
   *
   * @param {string} keyA
   * @param {string} keyB
   * @returns {object} Puntuación de compatibilidad (0-100), detalles por eje y veredicto
   */
  const calcPairwiseCompatibility = (keyA, keyB) => {
    const spA = SPECIES_CLIMATE_PROFILES[keyA];
    const spB = SPECIES_CLIMATE_PROFILES[keyB];

    if (!spA || !spB) {
      return { score: 0, verdict: 'INCOMPATIBLE', details: 'Especie no encontrada' };
    }

    if (keyA === keyB) {
      return {
        speciesA: spA.name,
        speciesB: spB.name,
        score: 100,
        verdict: 'COMPATIBLE (MONOCULTIVO)',
        bottleneckAxis: 'ninguno',
        axes: { temp: 1.0, rh: 1.0, co2: 1.0, lux: 1.0 },
        penalties: [],
      };
    }

    const oTemp = calcAxisOverlap(spA.tempC, spB.tempC);
    const oRh = calcAxisOverlap(spA.rhPct, spB.rhPct);
    const oCo2 = calcAxisOverlap(spA.co2Ppm, spB.co2Ppm);
    const oLux = calcAxisOverlap(spA.lux, spB.lux);

    const axes = {
      temperatura: Math.round(oTemp * 100) / 100,
      humedad: Math.round(oRh * 100) / 100,
      co2: Math.round(oCo2 * 100) / 100,
      luz: Math.round(oLux * 100) / 100,
    };

    // Identificar eje cuello de botella (Liebig)
    let minVal = 1.0;
    let bottleneck = 'temperatura';
    Object.entries(axes).forEach(([axis, val]) => {
      if (val < minVal) {
        minVal = val;
        bottleneck = axis;
      }
    });

    const avgOverlap = (oTemp + oRh + oCo2 + oLux) / 4.0;
    const baseScore = (0.50 * minVal) + (0.50 * avgOverlap);

    const { penalty, reasons } = calcBiologicalPenalties(spA, spB);
    const finalScore = Math.max(0, Math.min(100, Math.round((baseScore - penalty) * 100)));

    let verdict = 'INCOMPATIBLE';
    let badge = '🔴';
    if (finalScore >= 75) {
      verdict = 'ALTA COMPATIBILIDAD';
      badge = '🟢';
    } else if (finalScore >= 55) {
      verdict = 'COMPATIBLE CON COMPROMISO';
      badge = '🟡';
    }

    return {
      speciesA: spA.name,
      speciesB: spB.name,
      score: finalScore,
      verdict,
      badge,
      bottleneckAxis: bottleneck,
      axes,
      penalties: reasons,
    };
  };

  /**
   * Genera la matriz de compatibilidad 9x9 completa para todas las especies.
   */
  const generateFullMatrix = () => {
    const keys = Object.keys(SPECIES_CLIMATE_PROFILES);
    const matrix = {};

    keys.forEach((kA) => {
      matrix[kA] = {};
      keys.forEach((kB) => {
        matrix[kA][kB] = calcPairwiseCompatibility(kA, kB);
      });
    });

    return matrix;
  };

  /**
   * Optimizador Minimax de Setpoints de Cámara para un grupo de especies en co-cultivo.
   * Encuentra los valores (T, HR, CO2, Lux) que maximizan el bienestar mínimo de cualquier especie seleccionada.
   *
   * @param {string[]} speciesKeys Array de claves de especies presentes en la carpa
   * @returns {object} Setpoints recomendados, puntuación grupal y alertas
   */
  const optimizeChamberSetpoints = (speciesKeys = []) => {
    const validKeys = (Array.isArray(speciesKeys) ? speciesKeys : [])
      .filter((k) => SPECIES_CLIMATE_PROFILES[k]);

    if (validKeys.length === 0) {
      return null;
    }

    if (validKeys.length === 1) {
      const sp = SPECIES_CLIMATE_PROFILES[validKeys[0]];
      return {
        species: [sp.name],
        groupScore: 100,
        verdict: 'ÓPTIMO (MONOCULTIVO)',
        setpoints: {
          tempC: Math.round((sp.tempC[1] + sp.tempC[2]) / 2 * 10) / 10,
          rhPct: Math.round((sp.rhPct[1] + sp.rhPct[2]) / 2),
          co2Ppm: Math.round((sp.co2Ppm[1] + sp.co2Ppm[2]) / 2),
          lux: Math.round((sp.lux[1] + sp.lux[2]) / 2),
        },
        bottlenecks: [],
      };
    }

    // Evaluar compatibilidad de todos los pares
    let minPairScore = 100;
    let sumPairScore = 0;
    let pairCount = 0;
    const allPenalties = new Set();
    const bottlenecks = [];

    for (let i = 0; i < validKeys.length; i += 1) {
      for (let j = i + 1; j < validKeys.length; j += 1) {
        const pair = calcPairwiseCompatibility(validKeys[i], validKeys[j]);
        minPairScore = Math.min(minPairScore, pair.score);
        sumPairScore += pair.score;
        pairCount += 1;
        pair.penalties.forEach((p) => allPenalties.add(p));
        if (pair.score < 55) {
          bottlenecks.push(`Incompatibilidad entre ${pair.speciesA} y ${pair.speciesB} en ${pair.bottleneckAxis} (Score: ${pair.score}%)`);
        }
      }
    }

    const groupScore = Math.round((minPairScore * 0.6) + ((sumPairScore / pairCount) * 0.4));

    // Búsqueda en grilla Minimax para setpoints ideales
    const profiles = validKeys.map((k) => SPECIES_CLIMATE_PROFILES[k]);

    // Función minimax para un eje: encuentra el setpoint que maximiza el mínimo de satisfacción
    const solveMinimaxAxis = (axisProp, startVal, endVal, steps) => {
      let bestVal = startVal;
      let maxMinSat = -1;
      const stepSize = (endVal - startVal) / steps;

      for (let s = 0; s <= steps; s += 1) {
        const candidate = startVal + (s * stepSize);
        let minSatForCandidate = 1.0;
        profiles.forEach((p) => {
          const sat = evalTrapezoid(candidate, p[axisProp]);
          if (sat < minSatForCandidate) minSatForCandidate = sat;
        });

        if (minSatForCandidate > maxMinSat) {
          maxMinSat = minSatForCandidate;
          bestVal = candidate;
        }
      }
      return { bestVal, satisfaction: maxMinSat };
    };

    const optT = solveMinimaxAxis('tempC', 8, 32, 48);
    const optRh = solveMinimaxAxis('rhPct', 70, 100, 30);
    const optCo2 = solveMinimaxAxis('co2Ppm', 400, 3000, 52);
    const optLux = solveMinimaxAxis('lux', 100, 2500, 48);

    let verdict = 'CO-CULTIVO FACTIBLE';
    let badge = '🟢';
    if (groupScore < 50) {
      verdict = 'ALTO RIESGO DE MERMA / RECOMIENDA SEPARAR';
      badge = '🔴';
    } else if (groupScore < 70) {
      verdict = 'CO-CULTIVO CON RENDIMIENTO SUB-ÓPTIMO';
      badge = '🟡';
    }

    return {
      species: profiles.map((p) => p.name),
      groupScore,
      verdict,
      badge,
      satisfaction: {
        temperatura: Math.round(optT.satisfaction * 100),
        humedad: Math.round(optRh.satisfaction * 100),
        co2: Math.round(optCo2.satisfaction * 100),
        luz: Math.round(optLux.satisfaction * 100),
      },
      setpoints: {
        tempC: Math.round(optT.bestVal * 10) / 10,
        rhPct: Math.round(optRh.bestVal),
        co2Ppm: Math.round(optCo2.bestVal / 50) * 50,
        lux: Math.round(optLux.bestVal / 50) * 50,
      },
      biologicalAlerts: Array.from(allPenalties),
      bottlenecks,
    };
  };

  const api = {
    SPECIES_CLIMATE_PROFILES,
    calcPairwiseCompatibility,
    generateFullMatrix,
    optimizeChamberSetpoints,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasCoCultivation = api;
  if (typeof window !== 'undefined') window.SetasCoCultivation = api;
})();
