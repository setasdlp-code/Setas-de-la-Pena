'use strict';

/**
 * @file perito-workbench-core.js — Motor puro del Workbench Perito & Optimizador
 *
 * Proporciona:
 * 1. Diagnóstico dinámico de cuellos de botella según la Ley del Mínimo de Liebig.
 * 2. Simulación y enriquecimiento de sugerencias delta (ΔScore, ΔEB, ΔCosto, ΔC:N) sin mutar estado.
 * 3. Morphing e interpolación convexa de recetas respetando candados (lockedIds).
 * 4. Clasificación y filtrado de fronteras Pareto multiobjetivo.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  /**
   * Identifica el cuello de botella biológico primario de la receta según la Ley del Mínimo de Liebig.
   * @param {Object} an Análisis de la receta (cn, avgN, avgPh, eb, cost, etc.)
   * @param {Object} sp Perfil de la especie (cn_optimal, n_optimal, ph_optimal)
   * @param {Object} [extra] Metadatos adicionales (altitud, bolsas, etc.)
   * @returns {Object} { factor, severity, label, rationale, actionRequired }
   */
  const calcLiebigBottleneck = (an, sp, extra = {}) => {
    if (!an || !sp) {
      return { factor: 'none', severity: 'none', label: 'Sin receta activa', rationale: 'Ingresa ingredientes en la mesa de mezcla.', actionRequired: null };
    }

    // 1. Inocuidad y riesgo sanitario extremo (Trichoderma / Esterilización)
    if (an.trichoderma) {
      return {
        factor: 'trichoderma_risk',
        severity: 'critical',
        label: 'Riesgo Crítico de Contaminación (Trichoderma)',
        rationale: 'La carga de suplementación o nutrientes solubles favorece moho verde. Requiere autoclave a 121.1°C (19.04 psig en Tenjo).',
        actionRequired: 'Reducir suplementación nitrogenada o aplicar esterilización térmica estricta.',
      };
    }

    // 2. Balance de masas
    if (an.tot != null && (an.tot < 97 || an.tot > 103)) {
      return {
        factor: 'mass_balance',
        severity: 'critical',
        label: `Masa desbalanceada (${an.tot.toFixed(1)}%)`,
        rationale: 'Los porcentajes de la receta en base seca deben sumar exactamente 100%.',
        actionRequired: 'Ajustar la proporción de insumos hasta alcanzar 100%.',
      };
    }

    // 3. Nitrógeno excesivo (Toxicidad e inhibición)
    const nMax = sp.n_optimal?.max || 2.2;
    if (an.avgN > nMax) {
      return {
        factor: 'excess_nitrogen',
        severity: 'critical',
        label: `Exceso de Nitrógeno (${an.avgN.toFixed(2)}% > ${nMax}%)`,
        rationale: 'El exceso de nitrógeno genera amonio tóxico para el micelio y dispara bacterias competidoras.',
        actionRequired: 'Reducir suplementos (salvado, soya) y aumentar base de carbono.',
      };
    }

    // 4. C:N demasiado bajo
    const cnMin = sp.cn_optimal?.min || 25;
    if (an.cn < cnMin) {
      return {
        factor: 'low_cn',
        severity: 'critical',
        label: `Relación C:N muy baja (${an.cn.toFixed(1)}:1 < ${cnMin}:1)`,
        rationale: 'Sustrato hiper-suplementado. Altísimo riesgo de sobrecalentamiento en incubación y pérdida de lote.',
        actionRequired: 'Diluir la mezcla con base leñosa o paja de alta relación C:N.',
      };
    }

    // 5. C:N demasiado alto (Falta de nutrición)
    const cnMax = sp.cn_optimal?.max || 50;
    if (an.cn > cnMax) {
      return {
        factor: 'high_cn',
        severity: 'warning',
        label: `Relación C:N deficiente (${an.cn.toFixed(1)}:1 > ${cnMax}:1)`,
        rationale: 'El micelio no dispondrá de suficiente nitrógeno para formar primordios y fructificar con buen rendimiento.',
        actionRequired: 'Agregar 5-15% de un suplemento nitrogenado (salvado de trigo o torta de soya).',
      };
    }

    // 6. Nitrógeno insuficiente
    const nMin = sp.n_optimal?.min || 0.8;
    if (an.avgN < nMin) {
      return {
        factor: 'low_nitrogen',
        severity: 'warning',
        label: `Nitrógeno insuficiente (${an.avgN.toFixed(2)}% < ${nMin}%)`,
        rationale: 'Crecimiento vegetativo lento y baja eficiencia biológica esperada.',
        actionRequired: 'Complementar con salvado o harina proteica.',
      };
    }

    // 7. pH fuera de rango
    if (sp.ph_optimal && an.avgPh != null) {
      if (an.avgPh < sp.ph_optimal.min) {
        return {
          factor: 'acidic_ph',
          severity: 'warning',
          label: `pH ácido (${an.avgPh.toFixed(1)} < ${sp.ph_optimal.min})`,
          rationale: 'La acidez inhibe la actividad enzimática de lignocelulosa.',
          actionRequired: 'Agregar 1-2% de carbonato de calcio (CaCO₃) o cal agrícola.',
        };
      }
      if (an.avgPh > sp.ph_optimal.max) {
        return {
          factor: 'alkaline_ph',
          severity: 'warning',
          label: `pH alcalino (${an.avgPh.toFixed(1)} > ${sp.ph_optimal.max})`,
          rationale: 'Favorece contaminación bacteriana (*Bacillus sour rot*).',
          actionRequired: 'Añadir 1% de yeso agrícola (sulfato de calcio) o reducir correctores alcalinos.',
        };
      }
    }

    // 8. Digestibilidad sub-óptima
    if (an.avgDig != null && an.avgDig < 5.0) {
      return {
        factor: 'low_digestibility',
        severity: 'tip',
        label: `Baja digestibilidad (${an.avgDig.toFixed(1)}/10)`,
        rationale: 'Estructura excesivamente recalcitrante (alto contenido de lignina condensada). Colonización más lenta.',
        actionRequired: 'Combinar con sustratos más digestibles como pajas o bagazos.',
      };
    }

    return {
      factor: 'optimal',
      severity: 'favorable',
      label: 'Parámetros en Rango Favorable',
      rationale: 'La fórmula satisface los requerimientos nutricionales y biológicos de la especie.',
      actionRequired: null,
    };
  };

  /**
   * Simula la aplicación de un ajuste a la receta y calcula los deltas exactos respecto al estado base.
   * @param {Object} options
   * @param {Array} options.recipe Receta actual
   * @param {Object} options.apply Transformación propuesta ({ id, delta } o función)
   * @param {Array} options.lockedIds IDs bloqueados
   * @param {Array} options.ingredients Catálogo de ingredientes
   * @param {Function} options.applyOptToRecipe Función pura de aplicación existente
   * @param {Function} options.analyze Función de análisis
   * @param {Function} options.score Función de scoring
   * @param {Object} options.baseAn Análisis previo
   * @param {Object} options.baseScore Score previo
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
        deltaCn,
        newScore,
        newCost,
        newEb,
        newCn,
        changes,
      },
      isViable,
    };
  };

  /**
   * Interpola o realiza "morphing" entre dos recetas A y B según un factor alfa [0, 1].
   * Respeta los ingredientes bloqueados fijándolos en su porcentaje de la receta base.
   * @param {Array} recipeA Receta base actual
   * @param {Array} recipeB Receta candidata
   * @param {number} alpha Factor de interpolación (0 = 100% A, 1 = 100% B)
   * @param {Array} [lockedIds=[]] IDs de ingredientes que no deben alterarse
   * @returns {Array} Receta interpolada normalizada a 100%
   */
  const morphRecipes = (recipeA = [], recipeB = [], alpha = 0.5, lockedIds = []) => {
    const aClamped = Math.max(0, Math.min(1, parseFloat(alpha) || 0));
    const lockedSet = new Set(lockedIds || []);

    const mapA = new Map((recipeA || []).map(r => [r.id, Number(r.p || r.pct || 0)]));
    const mapB = new Map((recipeB || []).map(r => [r.id, Number(r.p || r.pct || 0)]));
    const allIds = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));

    let lockedSum = 0;
    const preliminary = [];

    // Asignar bloqueados exactamente de receta A
    for (const id of allIds) {
      const pA = mapA.get(id) || 0;
      const pB = mapB.get(id) || 0;
      if (lockedSet.has(id)) {
        lockedSum += pA;
        preliminary.push({ id, p: pA, locked: true });
      } else {
        const blended = ((1 - aClamped) * pA) + (aClamped * pB);
        preliminary.push({ id, p: blended, locked: false });
      }
    }

    const availableBudget = Math.max(0, 100 - lockedSum);
    const nonLockedSum = preliminary.filter(r => !r.locked).reduce((s, r) => s + r.p, 0);

    const result = preliminary.map(r => {
      if (r.locked) return { id: r.id, p: Math.round(r.p * 10) / 10 };
      const normalized = nonLockedSum > 0 ? (r.p / nonLockedSum) * availableBudget : 0;
      return { id: r.id, p: Math.round(normalized * 10) / 10 };
    }).filter(r => r.p > 0);

    // Ajuste de residuo de redondeo al insumo desbloqueado de mayor peso
    const currentTot = result.reduce((s, r) => s + r.p, 0);
    const diff = Math.round((100 - currentTot) * 10) / 10;
    if (Math.abs(diff) > 0 && Math.abs(diff) <= 1.0) {
      const target = result.find(r => !lockedSet.has(r.id)) || result[0];
      if (target) target.p = Math.round((target.p + diff) * 10) / 10;
    }

    return result;
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
    calcLiebigBottleneck,
    simulateSuggestionDelta,
    morphRecipes,
    filterParetoFrontier,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPeritoWorkbench = api;
  if (typeof window !== 'undefined') window.SetasPeritoWorkbench = api;
})();
