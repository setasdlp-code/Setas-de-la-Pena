'use strict';

/**
 * @file perito-workbench-core.js — Motor puro del Workbench Perito & Optimizador
 *
 * Proporciona:
 * 1. Diagnóstico causal de factores restrictivos y análisis contrafactual de oportunidad.
 * 2. Simulación y enriquecimiento de sugerencias delta con rangos de incertidumbre (ΔScore, ΔEB [low, high], ΔCosto, ΔC:N).
 * 3. Morphing e interpolación lineal de recetas R(alpha) = (1-alpha)R0 + alpha R1 respetando candados (lockedIds).
 * 4. Análisis de trayectoria de morphing a lo largo de alpha in [0, 1] identificando intervalos agronómicamente válidos.
 * 5. Clasificación y filtrado de fronteras Pareto multiobjetivo O(n^2).
 * 6. Definición de contexto físico invariante de Tenjo (2.600 msnm / 74.5 kPa).
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const round1 = (v) => Math.round(v * 10) / 10;
  const round2 = (v) => Math.round(v * 100) / 100;

  /**
   * Contexto físico invariable de Tenjo, Cundinamarca y parámetros de esterilización.
   */
  const TENJO_PHYSICAL_CONTEXT = Object.freeze({
    altitudeM: 2600,
    atmosphericPressureKPa: 74.5,
    waterBoilingPointC: 91.5,
    requiredSterilizationTempC: 121.1,
    requiredGaugePressurePsi: 19.03, // Vapor saturado a 121.1°C a 74.5 kPa barométrica
    standardSeaLevelGaugePressurePsi: 15.0,
    coldSpotF0TargetMin: 12.0,
  });

  /**
   * Identifica el factor restrictivo biológico/agronómico primario de la receta y estima
   * la oportunidad contrafactual de mejora al corregir dicho factor.
   *
   * @param {Object} an Análisis de la receta (cn, avgN, avgPh, eb, cost, suppP, trichoderma, etc.)
   * @param {Object} sp Perfil de la especie (cn_optimal, n_optimal, ph_optimal, supplementation_max)
   * @param {Object} [extra] Metadatos adicionales (treatment, batch, etc.)
   * @returns {Object} Diagnóstico con factor, severidad, explicación causal y oportunidad contrafactual.
   */
  const calcRestrictiveFactor = (an, sp, extra = {}) => {
    if (!an || !sp) {
      return {
        factor: 'none',
        severity: 'none',
        label: 'Sin receta activa',
        rationale: 'Ingresa ingredientes en la mesa de mezcla.',
        counterfactualOpportunity: null,
        actionRequired: null,
      };
    }

    const treatment = extra.treatment || an.treatment || {};
    const isAutoclave = treatment.col === 'autoclave' || String(treatment.id || treatment.name || '').toLowerCase().includes('autoclave');

    // 1. Inocuidad y riesgo sanitario extremo (Trichoderma / Sobrecalentamiento)
    if (an.trichoderma) {
      return {
        factor: 'trichoderma_risk',
        severity: 'critical',
        label: 'Riesgo Crítico de Contaminación (Trichoderma)',
        rationale: 'La concentración de azúcares solubles o nitrógeno no protegido supera el umbral de inocuidad.',
        counterfactualOpportunity: {
          metric: 'trichoderma',
          potentialEbGain: [25, 45],
          description: 'Inactivar moho verde mediante esterilización térmica a 19.03 psig o reducir suplementos solubles salva el 100% del lote.',
        },
        actionRequired: isAutoclave
          ? 'Reducir suplementos nitrogenados por debajo del límite de la especie.'
          : 'Aplicar esterilización térmica estricta en autoclave (121.1°C / 19.03 psig en Tenjo) o reducir suplementación.',
      };
    }

    // 2. Balance de masa
    if (an.tot != null && (an.tot < 97.0 || an.tot > 103.0)) {
      return {
        factor: 'mass_balance',
        severity: 'critical',
        label: `Masa desbalanceada (${an.tot.toFixed(1)}%)`,
        rationale: 'Los porcentajes de la receta en base seca deben sumar exactamente 100%.',
        counterfactualOpportunity: null,
        actionRequired: 'Ajustar la proporción de insumos hasta cerrar en 100%.',
      };
    }

    // 3. Suplementación agregada vs límite de la especie y tipo de tratamiento
    const suppMax = Number(sp.supplementation_max) || 20;
    const suppP = Number.isFinite(an.suppP) ? an.suppP : 0;
    if (suppP > suppMax) {
      const over = round1(suppP - suppMax);
      const isCritical = !isAutoclave && over > 3;
      return {
        factor: 'excess_supplementation',
        severity: isCritical ? 'critical' : 'warning',
        label: `Suplementación Excesiva (${suppP.toFixed(1)}% > ${suppMax}%)`,
        rationale: isAutoclave
          ? `La suma de suplementos supera el límite agronómico de ${sp.name || 'la especie'} (${suppMax}%), aumentando el riesgo de fermentación y calor excesivo en colonización.`
          : `Tratamiento no autoclave con suplementación (${suppP.toFixed(1)}%) superior al máximo seguro (${suppMax}%). Alto riesgo de colonización bacteriana o mancha verde.`,
        counterfactualOpportunity: {
          metric: 'suppP',
          current: suppP,
          target: suppMax,
          potentialEbGain: [5, 12],
          description: `Alinear la suplementación a ${suppMax}% reduce el riesgo térmico e incrementa la tasa de bolsas sanas a primera cosecha.`,
        },
        actionRequired: `Reducir la suplementación agregada en al menos ${over}% o asegurar autoclave con meseta térmica controlada.`,
      };
    }

    // 4. Nitrógeno excesivo
    const nMax = sp.n_optimal?.max || 2.2;
    if (an.avgN > nMax) {
      return {
        factor: 'excess_nitrogen',
        severity: 'critical',
        label: `Exceso de Nitrógeno (${an.avgN.toFixed(2)}% > ${nMax}%)`,
        rationale: 'El exceso de nitrógeno genera amonio libre fitotóxico para las hifas y alimenta bacterias competidoras.',
        counterfactualOpportunity: {
          metric: 'n',
          current: an.avgN,
          targetRange: [sp.n_optimal?.min || 1.0, nMax],
          potentialEbGain: [10, 20],
          description: `Disminuir el nitrógeno a ${nMax}% evita inhibición enzimática de lignocelulosa y previene el bloqueo de primordios.`,
        },
        actionRequired: 'Reducir suplementos nitrogenados y sustituir por base de carbono.',
      };
    }

    // 5. C:N demasiado bajo (Sustrato hiper-nutrido)
    const cnMin = sp.cn_optimal?.min || 25;
    if (an.cn < cnMin) {
      return {
        factor: 'low_cn',
        severity: 'critical',
        label: `Relación C:N deficiente (${an.cn.toFixed(1)}:1 < ${cnMin}:1)`,
        rationale: 'Sustrato hiper-suplementado con riesgo crítico de sobrecalentamiento en incubación y asfixia micelial.',
        counterfactualOpportunity: {
          metric: 'cn',
          current: an.cn,
          targetRange: [cnMin, sp.cn_optimal?.max || 45],
          potentialEbGain: [12, 25],
          description: `Elevar la relación C:N al rango óptimo permite una colonización uniforme sin choque térmico interno en la bolsa.`,
        },
        actionRequired: 'Diluir con base leñosa o pajas de cereal de alta relación C:N.',
      };
    }

    // 6. C:N demasiado alto (Falta de nutrición)
    const cnMax = sp.cn_optimal?.max || 50;
    if (an.cn > cnMax) {
      const idealCn = sp.cn_optimal?.ideal || Math.round((cnMin + cnMax) / 2);
      return {
        factor: 'high_cn',
        severity: 'warning',
        label: `Relación C:N muy alta (${an.cn.toFixed(1)}:1 > ${cnMax}:1)`,
        rationale: 'El micelio dispone de exceso de carbono pero carece de nitrógeno para síntesis proteica de carpóforos.',
        counterfactualOpportunity: {
          metric: 'cn',
          current: an.cn,
          targetRange: [cnMin, cnMax],
          targetIdeal: idealCn,
          potentialEbGain: [15, 30],
          description: `Ajustar C:N hacia ${idealCn}:1 incrementaría la Eficiencia Biológica estimada en +15–30 puntos porcentuales.`,
        },
        actionRequired: 'Añadir 5–15% de salvado de trigo, torta de soya o suplemento medio.',
      };
    }

    // 7. Nitrógeno insuficiente
    const nMin = sp.n_optimal?.min || 0.8;
    if (an.avgN < nMin) {
      return {
        factor: 'low_nitrogen',
        severity: 'warning',
        label: `Nitrógeno insuficiente (${an.avgN.toFixed(2)}% < ${nMin}%)`,
        rationale: 'El sustrato es excesivamente pobre en proteína para sostener oleadas secundarias y rendimiento comercial.',
        counterfactualOpportunity: {
          metric: 'n',
          current: an.avgN,
          targetRange: [nMin, nMax],
          potentialEbGain: [10, 22],
          description: `Alcanzar ${nMin}% de N asegura nutrición adecuada para la fructificación completa.`,
        },
        actionRequired: 'Complementar con salvado o harina proteica.',
      };
    }

    // 8. pH fuera de rango óptimo
    if (sp.ph_optimal && an.avgPh != null) {
      if (an.avgPh < sp.ph_optimal.min) {
        return {
          factor: 'acidic_ph',
          severity: 'warning',
          label: `pH ácido (${an.avgPh.toFixed(1)} < ${sp.ph_optimal.min})`,
          rationale: 'La acidez desacopla la actividad de las enzimas ligninolíticas (lacasas y peroxidasas).',
          counterfactualOpportunity: {
            metric: 'ph',
            current: an.avgPh,
            targetRange: [sp.ph_optimal.min, sp.ph_optimal.max],
            potentialEbGain: [4, 10],
            description: 'Tamponar el sustrato a pH neutro acelera la colonización y previene manchas ácidas.',
          },
          actionRequired: 'Añadir 1–2% de carbonato de calcio (CaCO₃) o cal agrícola.',
        };
      }
      if (an.avgPh > sp.ph_optimal.max) {
        return {
          factor: 'alkaline_ph',
          severity: 'warning',
          label: `pH alcalino (${an.avgPh.toFixed(1)} > ${sp.ph_optimal.max})`,
          rationale: 'El pH excesivamente básico inhibe el micelio y favorece bacterias termófilas competidoras.',
          counterfactualOpportunity: {
            metric: 'ph',
            current: an.avgPh,
            targetRange: [sp.ph_optimal.min, sp.ph_optimal.max],
            potentialEbGain: [4, 8],
            description: 'Reducir la alcalinidad estabiliza el microbioma favorable del sustrato.',
          },
          actionRequired: 'Añadir 1% de yeso agrícola (sulfato de calcio) y reducir cal.',
        };
      }
    }

    // 9. Digestibilidad o estructura subóptima
    if (an.avgDig != null && an.avgDig < 5.0) {
      return {
        factor: 'low_digestibility',
        severity: 'tip',
        label: `Baja digestibilidad (${an.avgDig.toFixed(1)}/10)`,
        rationale: 'Estructura excesivamente recalcitrante (alta lignina condensada). Colonización más lenta.',
        counterfactualOpportunity: {
          metric: 'digestibility',
          current: an.avgDig,
          target: 6.5,
          potentialEbGain: [3, 7],
          description: 'Incorporar pajas o rastrojos digestibles reduce los días a cosecha en 4–6 días.',
        },
        actionRequired: 'Combinar con sustratos más digestibles como paja de trigo o bagazo.',
      };
    }

    return {
      factor: 'optimal',
      severity: 'favorable',
      label: 'Parámetros en Rango Favorable',
      rationale: 'La fórmula satisface los requerimientos nutricionales, biológicos y de inocuidad de la especie.',
      counterfactualOpportunity: null,
      actionRequired: null,
    };
  };

  // Alias para compatibilidad regresiva
  const calcLiebigBottleneck = calcRestrictiveFactor;

  /**
   * Simula la aplicación de un ajuste a la receta y calcula los deltas exactos respecto al estado base,
   * incluyendo rangos de incertidumbre para ΔEB y nivel de confianza.
   *
   * @param {Object} options
   * @returns {Object} Simulación con { diff, resultingRecipe, resultingAn, resultingScore, isViable }
   */
  const simulateSuggestionDelta = ({
    recipe = [],
    apply = null,
    lockedIds = [],
    ingredients = [],
    applyOptToRecipe,
    analyze,
    score,
    baseAn,
    baseScore,
  }) => {
    if (!apply || typeof applyOptToRecipe !== 'function' || typeof analyze !== 'function' || typeof score !== 'function') {
      return null;
    }

    const nextRecipe = applyOptToRecipe(recipe, apply, lockedIds, ingredients);
    const nextAn = analyze(nextRecipe);
    const nextScoreObj = score(nextAn, { recipe: nextRecipe });
    const newScore = Number(nextScoreObj?.score || 0);
    const prevScore = Number(baseScore?.score != null ? baseScore.score : (baseScore || 0));

    const prevCost = Number(baseAn?.cost || 0);
    const newCost = Number(nextAn?.cost || 0);

    const prevEb = Number(baseAn?.eb || 0);
    const newEb = Number(nextAn?.eb || 0);

    const prevCn = Number(baseAn?.cn || 0);
    const newCn = Number(nextAn?.cn || 0);

    const deltaScore = Math.round((newScore - prevScore) * 10) / 10;
    const deltaCost = Math.round(newCost - prevCost);
    const deltaEb = Math.round((newEb - prevEb) * 10) / 10;
    const deltaCn = Math.round((newCn - prevCn) * 10) / 10;

    // Rango de incertidumbre agronómica en ΔEB:
    const prevEbLow = Number.isFinite(baseAn?.ebLow) ? baseAn.ebLow : Math.round(prevEb * 0.9);
    const prevEbHigh = Number.isFinite(baseAn?.ebHigh) ? baseAn.ebHigh : Math.round(prevEb * 1.1);
    const newEbLow = Number.isFinite(nextAn?.ebLow) ? nextAn.ebLow : Math.round(newEb * 0.9);
    const newEbHigh = Number.isFinite(nextAn?.ebHigh) ? nextAn.ebHigh : Math.round(newEb * 1.1);

    const deltaEbLow = Math.round((newEbLow - prevEbLow) * 10) / 10;
    const deltaEbHigh = Math.round((newEbHigh - prevEbHigh) * 10) / 10;
    const confidence = nextScoreObj?.uncertainty?.eb?.confidence || 'medium';

    // Comparativa de cambios por ingrediente
    const beforeMap = new Map((recipe || []).map(r => [r.id, Number(r.p || r.pct || 0)]));
    const afterMap = new Map((nextRecipe || []).map(r => [r.id, Number(r.p || r.pct || 0)]));
    const allIds = new Set([...beforeMap.keys(), ...afterMap.keys()]);

    const changes = Array.from(allIds).map(id => {
      const b = beforeMap.get(id) || 0;
      const a = afterMap.get(id) || 0;
      const ing = (ingredients || []).find(g => g.id === id);
      return {
        id,
        name: ing?.name || id,
        before: Math.round(b * 100) / 100,
        after: Math.round(a * 100) / 100,
        delta: Math.round((a - b) * 100) / 100,
      };
    }).filter(c => Math.abs(c.delta) > 0.01);

    const isViable = nextAn && nextAn.tot >= 97 && nextAn.tot <= 103 && !nextAn.trichoderma;

    return {
      resultingRecipe: nextRecipe,
      resultingAn: nextAn,
      resultingScore: nextScoreObj,
      diff: {
        deltaScore,
        deltaCost,
        deltaEb,
        deltaEbRange: [deltaEbLow, deltaEbHigh],
        confidence,
        deltaCn,
        newScore,
        newCost,
        newEb,
        newEbRange: [newEbLow, newEbHigh],
        newCn,
        changes,
      },
      isViable,
    };
  };

  /**
   * Interpola linealmente dos recetas R0 y R1 según R(alpha) = (1 - alpha) * R0 + alpha * R1.
   * Preserva estrictamente los ingredientes bloqueados fijándolos en su porcentaje de la receta A.
   * No aplica renormalización destructiva que distorsione los porcentajes bloqueados.
   *
   * @param {Array} recipeA Receta base actual
   * @param {Array} recipeB Receta candidata
   * @param {number} alpha Factor de interpolación en [0, 1]
   * @param {Array} [lockedIds=[]] IDs de ingredientes bloqueados que no deben alterarse
   * @returns {Array} Receta combinada con suma matemática exacta de 100%
   */
  const morphRecipes = (recipeA = [], recipeB = [], alpha = 0.5, lockedIds = []) => {
    const aClamped = Math.max(0, Math.min(1, parseFloat(alpha) || 0));
    const lockedSet = new Set(lockedIds || []);

    const mapA = new Map((recipeA || []).map(r => [r.id, Number(r.p || r.pct || 0)]));
    const mapB = new Map((recipeB || []).map(r => [r.id, Number(r.p || r.pct || 0)]));
    const allIds = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));

    let lockedSum = 0;
    for (const id of allIds) {
      if (lockedSet.has(id)) {
        lockedSum += (mapA.get(id) || 0);
      }
    }

    const availableBudget = Math.max(0, 100 - lockedSum);
    const preliminaryUnlocked = [];

    for (const id of allIds) {
      if (!lockedSet.has(id)) {
        const pA = mapA.get(id) || 0;
        const pB = mapB.get(id) || 0;
        const blended = ((1 - aClamped) * pA) + (aClamped * pB);
        preliminaryUnlocked.push({ id, p: blended });
      }
    }

    const sumUnlocked = preliminaryUnlocked.reduce((s, r) => s + r.p, 0);

    const result = [];
    // 1. Asignar los bloqueados invariantes
    for (const id of allIds) {
      if (lockedSet.has(id)) {
        const p = mapA.get(id) || 0;
        if (p > 0) result.push({ id, p: round2(p), locked: true });
      }
    }

    // 2. Asignar los no bloqueados preservando proporciones lineales
    for (const item of preliminaryUnlocked) {
      let finalP = item.p;
      if (lockedSum > 0 && sumUnlocked > 0 && Math.abs(sumUnlocked - availableBudget) > 0.001) {
        finalP = (item.p / sumUnlocked) * availableBudget;
      }
      if (finalP > 0.001) {
        result.push({ id: item.id, p: round2(finalP), locked: false });
      }
    }

    // Ajuste fino de residuos de redondeo (±0.1%) en el ingrediente desbloqueado principal
    const currentTot = result.reduce((s, r) => s + r.p, 0);
    const diff = round2(100 - currentTot);
    if (Math.abs(diff) > 0.001 && Math.abs(diff) <= 0.5) {
      const target = result.find(r => !r.locked) || result[0];
      if (target) target.p = round2(target.p + diff);
    }

    return result.filter(r => r.p > 0);
  };

  /**
   * Evalúa la trayectoria de morphing a lo largo de alpha in [0, 1] comprobando la factibilidad
   * agronómica paso a paso (C:N, N, suplementación máxima, etc.) para detectar estados no permitidos.
   *
   * @param {Object} options
   * @param {Array} options.recipeA Receta origen
   * @param {Array} options.recipeB Receta destino
   * @param {Array} [options.lockedIds] Ingredientes bloqueados
   * @param {Object} [options.species] Perfil de la especie
   * @param {Function} [options.analyzeFn] Función de análisis de receta
   * @param {number} [options.steps=10] Número de puntos a muestrear
   * @param {number} [options.requestedAlpha=0.5] Alpha solicitado
   * @returns {Object} { trajectory, feasibleInterval, isFeasibleAtRequestedAlpha, requestedRecipe }
   */
  const analyzeMorphTrajectory = ({
    recipeA = [],
    recipeB = [],
    lockedIds = [],
    species = {},
    analyzeFn = null,
    steps = 10,
    requestedAlpha = 0.5,
  }) => {
    const trajectory = [];
    const nSteps = Math.max(2, Math.min(50, steps));
    let firstFeasible = null;
    let lastFeasible = null;

    for (let i = 0; i <= nSteps; i++) {
      const alpha = round2(i / nSteps);
      const blended = morphRecipes(recipeA, recipeB, alpha, lockedIds);
      let isFeasible = true;
      const violations = [];
      let an = null;

      if (typeof analyzeFn === 'function') {
        an = analyzeFn(blended);
        if (an) {
          if (an.trichoderma) {
            isFeasible = false;
            violations.push('Riesgo de contaminación (Trichoderma)');
          }
          if (species?.supplementation_max && an.suppP > species.supplementation_max) {
            isFeasible = false;
            violations.push(`Suplementación (${an.suppP.toFixed(1)}%) supera el límite de la especie (${species.supplementation_max}%)`);
          }
          if (species?.cn_optimal) {
            const cnMin = species.cn_optimal.min * 0.8;
            const cnMax = species.cn_optimal.max * 1.25;
            if (an.cn < cnMin || an.cn > cnMax) {
              isFeasible = false;
              violations.push(`C:N (${an.cn.toFixed(1)}:1) fuera del intervalo admisible (${cnMin.toFixed(0)}–${cnMax.toFixed(0)}:1)`);
            }
          }
          if (species?.n_optimal) {
            if (an.avgN > species.n_optimal.max * 1.2) {
              isFeasible = false;
              violations.push(`Nitrógeno (${an.avgN.toFixed(2)}%) tóxico`);
            }
          }
        }
      }

      if (isFeasible) {
        if (firstFeasible === null) firstFeasible = alpha;
        lastFeasible = alpha;
      }

      trajectory.push({
        alpha,
        recipe: blended,
        isFeasible,
        violations,
        analysis: an,
      });
    }

    const reqBlend = morphRecipes(recipeA, recipeB, requestedAlpha, lockedIds);
    let isFeasibleAtRequestedAlpha = true;
    let requestedViolations = [];
    let requestedAn = null;
    if (typeof analyzeFn === 'function') {
      requestedAn = analyzeFn(reqBlend);
      if (requestedAn) {
        if (requestedAn.trichoderma) {
          isFeasibleAtRequestedAlpha = false;
          requestedViolations.push('Riesgo de contaminación (Trichoderma)');
        }
        if (species?.supplementation_max && requestedAn.suppP > species.supplementation_max) {
          isFeasibleAtRequestedAlpha = false;
          requestedViolations.push(`Suplementación excede límite (${species.supplementation_max}%)`);
        }
      }
    }

    return {
      trajectory,
      feasibleInterval: firstFeasible !== null ? [firstFeasible, lastFeasible] : null,
      isFeasibleAtRequestedAlpha,
      requestedViolations,
      requestedAnalysis: requestedAn,
      requestedRecipe: reqBlend,
    };
  };

  /**
   * Filtra un conjunto de candidatos reteniendo únicamente aquellos en la frontera de Pareto no dominada.
   * Objetivos: Maximizar Score, Maximizar EB, Minimizar Costo.
   * @param {Array} candidates Lista de candidatos con { score, eb, cost }
   * @returns {Array} Subconjunto no dominado
   */
  const filterParetoFrontier = (candidates = []) => {
    if (!Array.isArray(candidates) || candidates.length <= 1) return candidates || [];

    return candidates.filter((c1, i) => {
      const isDominated = candidates.some((c2, j) => {
        if (i === j) return false;
        const c2BetterOrEqualScore = (c2.score || 0) >= (c1.score || 0);
        const c2BetterOrEqualEb = (c2.eb || 0) >= (c1.eb || 0);
        const c2BetterOrEqualCost = (c2.cost || 999999) <= (c1.cost || 999999);

        const c2StrictlyBetter =
          (c2.score || 0) > (c1.score || 0) ||
          (c2.eb || 0) > (c1.eb || 0) ||
          (c2.cost || 999999) < (c1.cost || 999999);

        return c2BetterOrEqualScore && c2BetterOrEqualEb && c2BetterOrEqualCost && c2StrictlyBetter;
      });
      return !isDominated;
    });
  };

  const api = {
    TENJO_PHYSICAL_CONTEXT,
    calcRestrictiveFactor,
    calcLiebigBottleneck,
    simulateSuggestionDelta,
    morphRecipes,
    analyzeMorphTrajectory,
    filterParetoFrontier,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPeritoWorkbench = api;
  if (typeof window !== 'undefined') window.SetasPeritoWorkbench = api;
})();
