'use strict';
// Motor puro de escenarios para el Perito.
// Explora cambios de receta como estados completos y conserva alternativas
// multiobjetivo en vez de colapsarlas prematuramente a un único score.
(function () {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round2 = (v) => Math.round(v * 100) / 100;

  const normalizeRecipe = (recipe = []) => {
    const clean = recipe
      .map(r => ({ id: r.id, p: Math.max(0, Number(r.p ?? r.pct) || 0) }))
      .filter(r => r.id && r.p > 0);
    const total = clean.reduce((s, r) => s + r.p, 0);
    if (!total) return [];
    return clean.map(r => ({ ...r, p: round2(r.p / total * 100) }));
  };

  const recipeMap = (recipe = []) => Object.fromEntries(normalizeRecipe(recipe).map(r => [r.id, r.p]));

  const recipeDistance = (a = [], b = []) => {
    const aa = recipeMap(a);
    const bb = recipeMap(b);
    const ids = new Set([...Object.keys(aa), ...Object.keys(bb)]);
    let l1 = 0;
    ids.forEach(id => { l1 += Math.abs((aa[id] || 0) - (bb[id] || 0)); });
    return clamp(l1 / 200, 0, 1);
  };

  const noveltyScore = (recipe, history = []) => {
    if (!history.length) return 100;
    const nearest = Math.min(...history.map(h => recipeDistance(recipe, h.recipe || h)));
    return Math.round(clamp(nearest * 160, 0, 100));
  };

  const applyMutation = (recipe, mutation, caps = {}) => {
    const map = recipeMap(recipe);
    const id = mutation.id;
    if (!id) return normalizeRecipe(recipe);
    const locked = new Set(mutation.lockedIds || []);
    if (locked.has(id)) return normalizeRecipe(recipe);

    const current = map[id] || 0;
    const requested = mutation.type === 'set'
      ? Number(mutation.value)
      : current + Number(mutation.delta || 0);
    const lockedTotal = Object.keys(map)
      .filter(k => k !== id && locked.has(k))
      .reduce((s, k) => s + map[k], 0);
    const cap = Number.isFinite(caps[id]) ? caps[id] : 100;
    const target = clamp(requested, 0, Math.min(cap, Math.max(0, 100 - lockedTotal)));
    map[id] = target;

    const otherIds = Object.keys(map).filter(k => k !== id);
    const adjustable = otherIds.filter(k => !locked.has(k));
    const room = Math.max(0, 100 - target - lockedTotal);
    const adjustableTotal = adjustable.reduce((s, k) => s + map[k], 0);

    if (!adjustable.length && room > 0.01) return normalizeRecipe(recipe);
    adjustable.forEach(k => {
      map[k] = adjustableTotal > 0
        ? map[k] / adjustableTotal * room
        : room / Math.max(1, adjustable.length);
    });

    return normalizeRecipe(Object.entries(map).map(([rid, p]) => ({ id: rid, p })));
  };

  const makeMutations = ({
    recipe = [],
    ingredients = [],
    stepPct = 4,
    useStock = false,
    stockIds = new Set(),
    roleCaps = {},
    lockedIds = new Set(),
  } = {}) => {
    const current = recipeMap(recipe);
    const out = [];
    const deltas = [-stepPct, stepPct];
    const locked = lockedIds instanceof Set ? lockedIds : new Set(lockedIds || []);

    Object.keys(current).forEach(id => {
      if (locked.has(id)) return;
      deltas.forEach(delta => {
        if (current[id] + delta <= 0) return;
        out.push({
          type: 'delta', id, delta,
          lockedIds: [...locked],
          label: `${delta > 0 ? '+' : ''}${delta}% ${id}`,
        });
      });
    });

    ingredients.forEach(g => {
      if (!g?.id || current[g.id] > 0 || locked.has(g.id)) return;
      if (useStock && stockIds.size && !stockIds.has(g.id)) return;
      const cap = Number.isFinite(roleCaps[g.role]) ? roleCaps[g.role] : 20;
      const value = Math.min(stepPct * 2, cap);
      if (value > 0) out.push({
        type: 'set', id: g.id, value,
        lockedIds: [...locked],
        label: `Añadir ${value}% ${g.name || g.id}`,
      });
    });
    return out;
  };

  const dimensionVector = (evaluation = {}) => {
    const d = evaluation.dimensions || {};
    return {
      safety: Number(d.safety?.score ?? evaluation.safety ?? 0),
      agronomy: Number(d.agronomy?.score ?? evaluation.agronomy ?? 0),
      economy: Number(d.economy?.score ?? evaluation.economy ?? 0),
      confidence: Number(evaluation.confidenceScore ?? 50),
      novelty: Number(evaluation.novelty ?? 0),
    };
  };

  const dominates = (a, b, objectives = ['safety', 'agronomy', 'economy']) => {
    const av = dimensionVector(a);
    const bv = dimensionVector(b);
    const neverWorse = objectives.every(k => av[k] >= bv[k]);
    const strictlyBetter = objectives.some(k => av[k] > bv[k]);
    return neverWorse && strictlyBetter;
  };

  const paretoFront = (candidates = [], objectives) => candidates.filter((c, i) =>
    !candidates.some((other, j) => j !== i && dominates(other.evaluation, c.evaluation, objectives))
  );

  const weightedUtility = (evaluation, weights = {}) => {
    const v = dimensionVector(evaluation);
    const w = {
      safety: 0.30,
      agronomy: 0.30,
      economy: 0.18,
      confidence: 0.12,
      novelty: 0.10,
      ...weights,
    };
    return Object.keys(w).reduce((s, k) => s + (v[k] || 0) * w[k], 0);
  };

  const classifyScenario = (candidate, baseline) => {
    const c = dimensionVector(candidate.evaluation);
    const b = dimensionVector(baseline.evaluation);
    if (c.safety < 60) return 'descartar';
    if (c.novelty >= 55 && c.agronomy >= b.agronomy - 8) return 'experimental';
    if (c.economy >= b.economy + 8 && c.agronomy >= b.agronomy - 5) return 'economia';
    if (c.agronomy >= b.agronomy + 5) return 'rendimiento';
    if (c.safety >= b.safety + 5) return 'conservadora';
    return 'alternativa';
  };

  const evaluateScenario = ({ recipe, context = {}, analyze, score, history = [] }) => {
    if (typeof analyze !== 'function' || typeof score !== 'function') {
      throw new Error('evaluateScenario requiere analyze(recipe, context) y score(analysis, context).');
    }
    const normalized = normalizeRecipe(recipe);
    const analysis = analyze(normalized, context);
    const scored = score(analysis, { ...context, recipe: normalized });
    const novelty = noveltyScore(normalized, history);
    const evidence = scored?.provenance || {};
    const confidenceLevels = [scored?.uncertainty?.eb?.confidence, scored?.uncertainty?.risk?.confidence]
      .filter(Boolean);
    const confidenceScore = confidenceLevels.length
      ? Math.round(confidenceLevels.reduce((s, x) => s + ({ low: 35, medium: 65, high: 90 }[x] || 50), 0) / confidenceLevels.length)
      : 50;
    return { ...scored, novelty, confidenceScore, analysis, provenance: evidence };
  };

  const searchScenarios = ({
    recipe,
    context = {},
    ingredients = [],
    analyze,
    score,
    history = [],
    generations = 4,
    beamWidth = 18,
    stepPct = 4,
    useStock = false,
    stockIds = new Set(),
    roleCaps = {},
    ingredientCaps = {},
    lockedIds = new Set(),
    weights = {},
  }) => {
    const baseRecipe = normalizeRecipe(recipe);
    const locked = lockedIds instanceof Set ? lockedIds : new Set(lockedIds || []);
    const baseline = {
      id: 'baseline',
      recipe: baseRecipe,
      path: [],
      evaluation: evaluateScenario({ recipe: baseRecipe, context, analyze, score, history }),
    };
    baseline.utility = weightedUtility(baseline.evaluation, weights);

    let beam = [baseline];
    const seen = new Set([JSON.stringify(recipeMap(baseRecipe))]);
    const all = [baseline];

    for (let gen = 0; gen < generations; gen++) {
      const next = [];
      beam.forEach(parent => {
        const mutations = makeMutations({
          recipe: parent.recipe,
          ingredients,
          stepPct,
          useStock,
          stockIds,
          roleCaps,
          lockedIds: locked,
        });
        mutations.forEach(mutation => {
          const candidateRecipe = applyMutation(parent.recipe, mutation, ingredientCaps);
          const key = JSON.stringify(recipeMap(candidateRecipe));
          if (seen.has(key)) return;
          seen.add(key);
          const evaluation = evaluateScenario({ recipe: candidateRecipe, context, analyze, score, history });
          const candidate = {
            id: `g${gen + 1}-${seen.size}`,
            parentId: parent.id,
            recipe: candidateRecipe,
            path: [...parent.path, mutation],
            evaluation,
          };
          candidate.utility = weightedUtility(evaluation, weights);
          candidate.type = classifyScenario(candidate, baseline);
          if (dimensionVector(evaluation).safety >= 45) next.push(candidate);
          all.push(candidate);
        });
      });
      next.sort((a, b) => b.utility - a.utility);
      beam = paretoFront(next).sort((a, b) => b.utility - a.utility).slice(0, beamWidth);
      if (!beam.length) break;
    }

    const viable = all.filter(c => c.id !== 'baseline' && dimensionVector(c.evaluation).safety >= 60);
    const pareto = paretoFront(viable).sort((a, b) => b.utility - a.utility);
    const byType = {};
    pareto.forEach(c => { if (!byType[c.type]) byType[c.type] = c; });
    const recommended = Object.values(byType).slice(0, 4);

    return {
      baseline,
      explored: all.length - 1,
      pareto,
      recommended,
      best: pareto[0] || baseline,
      lockedIds: [...locked],
    };
  };

  const api = {
    normalizeRecipe,
    recipeDistance,
    noveltyScore,
    applyMutation,
    makeMutations,
    dimensionVector,
    dominates,
    paretoFront,
    weightedUtility,
    evaluateScenario,
    searchScenarios,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPeritoScenarios = api;
})();
