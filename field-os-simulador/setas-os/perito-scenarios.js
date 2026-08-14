'use strict';
// Motor puro de escenarios para el Perito.
// Explora cambios de receta como estados completos y conserva alternativas
// multiobjetivo en vez de colapsarlas prematuramente a un único score.
(function () {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round2 = (v) => Math.round(v * 100) / 100;
  const round1 = (v) => Math.round(v * 10) / 10;

  const SCENARIO_PROFILES = {
    rescate: {
      maxSupp: 8,
      maxCafe: 8,
      forceLowRisk: true,
      spawnOverride: 20,
      preferTreatment: ['autoclave', 'thermal'],
    },
    produccion: {
      maxSupp: null,
      maxCafe: 15,
      forceLowRisk: true,
      spawnOverride: null,
      preferTreatment: ['thermal', 'autoclave'],
    },
    premium: {
      maxSupp: null,
      maxCafe: 20,
      forceLowRisk: false,
      spawnOverride: null,
      preferTreatment: ['autoclave'],
    },
  };

  // PARITY NOTE:
  // recipe-optimizer.js defines OPT_PROFILES.preferTreatment, but legacy
  // runAutoOptimizer never reads that field when filtering, scoring or ranking
  // candidates. It is intentionally retained as profile metadata and ignored
  // here until an explicit treatment-preference policy has tests. Do not add
  // treatment ranking from preferTreatment under the guise of legacy parity.

  const normalizeRecipe = (recipe = []) => {
    const clean = recipe
      .map(r => ({ id: r.id, p: Math.max(0, Number(r.p ?? r.pct) || 0) }))
      .filter(r => r.id && r.p > 0);
    const total = clean.reduce((s, r) => s + r.p, 0);
    if (!total) return [];
    return clean.map(r => ({ ...r, p: round2(r.p / total * 100) }));
  };

  const recipeMap = (recipe = []) => Object.fromEntries(
    normalizeRecipe(recipe).map(r => [r.id, r.p])
  );

  const canonicalRecipeKey = (recipe = [], precision = 2) => {
    const normalized = normalizeRecipe(recipe);
    const byId = new Map();
    normalized.forEach(r => byId.set(r.id, (byId.get(r.id) || 0) + r.p));
    return [...byId.entries()]
      .filter(([, p]) => p > 0)
      .sort(([a], [b]) => String(a).localeCompare(String(b)))
      .map(([id, p]) => `${id}:${Number(p).toFixed(precision)}`)
      .join('|');
  };

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

  const precioPonderado = (ingredienteId, lotes = []) => {
    const active = (lotes || []).filter(l =>
      l &&
      l.activo &&
      l.ingredienteId === ingredienteId &&
      Number(l.cantidadKgDisponible || 0) > 0
    );
    const totalKg = active.reduce((s, l) => s + Number(l.cantidadKgDisponible || 0), 0);
    if (!totalKg) return null;
    return active.reduce(
      (s, l) => s + Number(l.precioPorKgCOP || 0) * Number(l.cantidadKgDisponible || 0),
      0
    ) / totalKg;
  };

  const realCostFor = (recipe, ingredients = [], invLotes = []) => {
    let known = false;
    const total = recipe.reduce((sum, r) => {
      const pp = precioPonderado(r.id, invLotes);
      const g = ingredients.find(i => i.id === r.id);
      if (pp != null) known = true;
      const price = pp != null ? pp : Number(g?.cost || 0);
      return sum + price * (Number(r.p) || 0) / 100;
    }, 0);
    return { cost: Math.round(total), realCostKnown: known };
  };

  const resolveProfile = ({
    profileKey = 'produccion',
    species = null,
    maxSupp = null,
    maxCafe = null,
    forceLowRisk = null,
    spawnOverride = undefined,
  } = {}) => {
    const base = SCENARIO_PROFILES[profileKey] || SCENARIO_PROFILES.produccion;
    const speciesSupp = Number(species?.supplementation_max || 20);
    const profileSupp = base.maxSupp == null ? speciesSupp : Math.min(speciesSupp, base.maxSupp);
    return {
      profileKey,
      maxSupp: maxSupp == null ? profileSupp : Math.min(speciesSupp, Number(maxSupp)),
      maxCafe: maxCafe == null ? Number(base.maxCafe ?? 30) : Number(maxCafe),
      forceLowRisk: forceLowRisk == null ? !!base.forceLowRisk : !!forceLowRisk,
      spawnOverride: spawnOverride === undefined ? base.spawnOverride : spawnOverride,
      preferTreatment: base.preferTreatment,
    };
  };

  const dryTerms = g => {
    const dry = 1 - Math.min(0.92, Math.max(0, Number(g?.moisture || 0) / 100));
    return {
      dry,
      c: Number(g?.c || 0) * dry,
      n: Number(g?.n || 0) * dry,
    };
  };

  const makeStructuralSeed = (recipe, structuralMode, label, metadata = {}) => ({
    recipe,
    structuralMode,
    path: [{
      type: 'structural',
      label,
      structuralMode,
    }],
    metadata,
  });

  // Deterministic port of the three structural spaces inside legacy
  // runAutoOptimizer. The formulas, moisture correction, fixed mineral/aerator
  // percentages, split order and feasibility bounds intentionally match the
  // legacy enumerator. Filtering/scoring happens later in searchScenarios().
  const generateStructuralSeeds = ({
    targetKey,
    ingredients = [],
    spp = {},
    useStock = false,
    stockIds = new Set(),
    profileKey = 'produccion',
    maxSupp = null,
  } = {}) => {
    const sp = spp?.[targetKey];
    if (!sp) return [];

    const stock = stockIds instanceof Set ? stockIds : new Set(stockIds || []);
    const pool = useStock
      ? ingredients.filter(g => stock.has(g.id))
      : ingredients.filter(g => !Array.isArray(g.cs) || g.cs.length === 0 || g.cs.includes(targetKey));

    const bases = pool.filter(g =>
      g.role === 'base_carbono' &&
      (!Array.isArray(g.cs) || g.cs.length === 0 || g.cs.includes(targetKey)) &&
      Number(g.cn) > 0 &&
      Number(g.n) > 0
    );
    const supps = pool.filter(g =>
      (g.role === 'suplemento_n' || g.role === 'suplemento_medio') &&
      (!Array.isArray(g.cs) || g.cs.length === 0 || g.cs.includes(targetKey)) &&
      Number(g.cn) > 0 &&
      Number(g.n) > 0
    );
    const aers = pool.filter(g => g.role === 'aireador');

    // Intentionally mirrors legacy structural enumeration. Stock enforcement is
    // applied by the unified constraint pass after generation.
    const calAvail = ingredients.some(g => g.id === 'carbonato_calcio');
    const yesoAvail = ingredients.some(g => g.id === 'yeso');
    const profile = resolveProfile({ profileKey, species: sp, maxSupp });
    const suppLimit = profile.maxSupp;
    const aerOpts = [null, ...aers.slice(0, 2)];
    const calOpts = calAvail ? [0, 3] : [0];
    const yesoOpts = yesoAvail ? [0, 2] : [0];
    const tried = new Set();
    const seeds = [];
    const T = Number(sp.cn_optimal?.ideal);

    if (!Number.isFinite(T)) return [];

    // MODO 1: 1 base + 1 suplemento.
    bases.forEach(base => {
      supps.forEach(supp => {
        if (base.id === supp.id) return;
        aerOpts.forEach(aer => {
          calOpts.forEach(calP => {
            yesoOpts.forEach(yesoP => {
              const aerP = aer ? 10 : 0;
              const fixedPct = calP + yesoP + aerP;
              const remaining = 100 - fixedPct;
              if (remaining < 40) return;
              const enumKey = `1b1s|${base.id}|${supp.id}|${aer?.id || ''}|${calP}|${yesoP}`;
              if (tried.has(enumKey)) return;
              tried.add(enumKey);

              const b = dryTerms(base);
              const s = dryTerms(supp);
              const denom = (b.c - s.c) - T * (b.n - s.n);
              if (Math.abs(denom) < 0.001) return;
              const ps = remaining * (b.c - T * b.n) / denom;
              const pb = remaining - ps;
              if (ps < 2 || pb < 15 || ps > suppLimit || pb > 95) return;

              const rec = [
                { id: base.id, p: round1(pb) },
                { id: supp.id, p: round1(ps) },
              ];
              if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
              if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
              if (aer) rec.push({ id: aer.id, p: aerP });

              seeds.push(makeStructuralSeed(
                rec,
                '1b1s',
                `Semilla 1b1s · ${base.id} + ${supp.id}`,
                { enumKey, split: null, aeratorId: aer?.id || null, calP, yesoP }
              ));
            });
          });
        });
      });
    });

    // MODO 2: 2 bases + 1 suplemento.
    for (let bi = 0; bi < bases.length; bi++) {
      for (let bj = bi + 1; bj < bases.length; bj++) {
        const b1 = bases[bi];
        const b2 = bases[bj];
        supps.forEach(supp => {
          if (b1.id === supp.id || b2.id === supp.id) return;
          aerOpts.forEach(aer => {
            const aerP = aer ? 10 : 0;
            const calP = calAvail ? 3 : 0;
            const yesoP = yesoAvail ? 2 : 0;
            const fixedPct = calP + yesoP + aerP;
            const remaining = 100 - fixedPct;
            if (remaining < 40) return;

            [[0.5, 0.5], [0.6, 0.4], [0.4, 0.6]].forEach(([f1, f2]) => {
              const enumKey = `2b1s|${b1.id}|${b2.id}|${supp.id}|${aer?.id || ''}|${f1}`;
              if (tried.has(enumKey)) return;
              tried.add(enumKey);

              const d1 = dryTerms(b1);
              const d2 = dryTerms(b2);
              const ds = dryTerms(supp);
              const cBlend = d1.c * f1 + d2.c * f2;
              const nBlend = d1.n * f1 + d2.n * f2;
              const denom = (cBlend - ds.c) - T * (nBlend - ds.n);
              if (Math.abs(denom) < 0.001) return;
              const ps = remaining * (cBlend - T * nBlend) / denom;
              const pb = remaining - ps;
              if (ps < 2 || pb < 15 || ps > suppLimit || pb > 95) return;

              const rec = [
                { id: b1.id, p: round1(pb * f1) },
                { id: b2.id, p: round1(pb * f2) },
                { id: supp.id, p: round1(ps) },
              ];
              if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
              if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
              if (aer) rec.push({ id: aer.id, p: aerP });

              seeds.push(makeStructuralSeed(
                rec,
                '2b1s',
                `Semilla 2b1s · ${b1.id}/${b2.id} + ${supp.id}`,
                { enumKey, split: [f1, f2], aeratorId: aer?.id || null, calP, yesoP }
              ));
            });
          });
        });
      }
    }

    // MODO 3: 1 base + 2 suplementos.
    const suppSplits = [[0.6, 0.4], [0.5, 0.5]];
    bases.forEach(base => {
      for (let i = 0; i < supps.length; i++) {
        for (let j = i + 1; j < supps.length; j++) {
          const s1 = supps[i];
          const s2 = supps[j];
          if (base.id === s1.id || base.id === s2.id) continue;

          aerOpts.forEach(aer => {
            const aerP = aer ? 10 : 0;
            const calP = calAvail ? 3 : 0;
            const yesoP = yesoAvail ? 2 : 0;
            const fixedPct = calP + yesoP + aerP;
            const remaining = 100 - fixedPct;
            if (remaining < 35) return;

            suppSplits.forEach(([f1, f2]) => {
              const enumKey = `1b2s|${base.id}|${s1.id}|${s2.id}|${aer?.id || ''}|${f1}`;
              if (tried.has(enumKey)) return;
              tried.add(enumKey);

              const db = dryTerms(base);
              const d1 = dryTerms(s1);
              const d2 = dryTerms(s2);
              const cBlend = d1.c * f1 + d2.c * f2;
              const nBlend = d1.n * f1 + d2.n * f2;
              const denom = (db.c - cBlend) - T * (db.n - nBlend);
              if (Math.abs(denom) < 0.001) return;
              const psTotal = remaining * (db.c - T * db.n) / denom;
              const pb = remaining - psTotal;
              if (psTotal < 4 || psTotal > suppLimit || pb < 20 || pb > 85) return;

              const rec = [
                { id: base.id, p: round1(pb) },
                { id: s1.id, p: round1(psTotal * f1) },
                { id: s2.id, p: round1(psTotal * f2) },
              ];
              if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
              if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
              if (aer) rec.push({ id: aer.id, p: aerP });

              seeds.push(makeStructuralSeed(
                rec,
                '1b2s',
                `Semilla 1b2s · ${base.id} + ${s1.id}/${s2.id}`,
                { enumKey, split: [f1, f2], aeratorId: aer?.id || null, calP, yesoP }
              ));
            });
          });
        }
      }
    });

    return seeds;
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
    const stock = stockIds instanceof Set ? stockIds : new Set(stockIds || []);

    Object.keys(current).forEach(id => {
      if (locked.has(id)) return;
      deltas.forEach(delta => {
        if (current[id] + delta <= 0) return;
        out.push({
          type: 'delta',
          id,
          delta,
          lockedIds: [...locked],
          label: `${delta > 0 ? '+' : ''}${delta}% ${id}`,
        });
      });
    });

    ingredients.forEach(g => {
      if (!g?.id || current[g.id] > 0 || locked.has(g.id)) return;
      if (useStock && !stock.has(g.id)) return;
      const cap = Number.isFinite(roleCaps[g.role]) ? roleCaps[g.role] : 20;
      const value = Math.min(stepPct * 2, cap);
      if (value > 0) out.push({
        type: 'set',
        id: g.id,
        value,
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

  const confidenceScoreFor = scored => {
    const confidenceLevels = [
      scored?.uncertainty?.eb?.confidence,
      scored?.uncertainty?.risk?.confidence,
    ].filter(Boolean);
    if (!confidenceLevels.length) return 50;
    return Math.round(
      confidenceLevels.reduce(
        (s, x) => s + ({ low: 35, medium: 65, high: 90 }[x] || 50),
        0
      ) / confidenceLevels.length
    );
  };

  const roleTotals = (recipe, ingredients) => {
    const byId = new Map((ingredients || []).map(g => [g.id, g]));
    const totals = {};
    recipe.forEach(r => {
      const role = byId.get(r.id)?.role;
      if (!role) return;
      totals[role] = (totals[role] || 0) + Number(r.p || 0);
    });
    return totals;
  };

  const lockedCompositionMatches = (candidate, baseline, lockedIds) => {
    const locked = lockedIds instanceof Set ? lockedIds : new Set(lockedIds || []);
    if (!locked.size) return true;
    const a = recipeMap(candidate);
    const b = recipeMap(baseline);
    return [...locked].every(id => Math.abs((a[id] || 0) - (b[id] || 0)) < 0.011);
  };

  const constraintFailures = ({
    recipe,
    analysis,
    ingredients,
    profile,
    maxCost,
    useStock,
    stockIds,
    roleCaps,
    ingredientCaps,
    lockedIds,
    baselineRecipe,
  }) => {
    const failures = [];
    const stock = stockIds instanceof Set ? stockIds : new Set(stockIds || []);
    const map = recipeMap(recipe);

    if (useStock && Object.keys(map).some(id => !stock.has(id))) failures.push('stock');

    Object.entries(ingredientCaps || {}).forEach(([id, cap]) => {
      if (Number.isFinite(cap) && (map[id] || 0) > cap + 0.011) failures.push(`ingredient:${id}`);
    });

    const totals = roleTotals(recipe, ingredients);
    Object.entries(roleCaps || {}).forEach(([role, cap]) => {
      if (Number.isFinite(cap) && Number(totals[role] || 0) > cap + 0.011) failures.push(`role:${role}`);
    });

    // analyze() historically reports suppP from suplemento_n only. The unified
    // constraint must also count suplemento_medio or that role can bypass the
    // species/profile supplementation ceiling.
    const totalSupplementPct = Number(totals.suplemento_n || 0) + Number(totals.suplemento_medio || 0);
    if (totalSupplementPct > Number(profile.maxSupp) + 0.011) failures.push('maxSupp');
    if (Number(analysis?.cafeP || 0) > Number(profile.maxCafe) + 0.011) failures.push('maxCafe');
    if (Number(maxCost || 0) > 0 && Number(analysis?.cost || 0) > Number(maxCost)) failures.push('maxCost');

    if (!lockedCompositionMatches(recipe, baselineRecipe, lockedIds)) failures.push('locked');

    return [...new Set(failures)];
  };

  const evaluateScenario = ({
    recipe,
    context = {},
    analyze,
    score,
    history = [],
    ingredients = [],
    invLotes = [],
    profile,
    maxCost = 0,
    useStock = false,
    stockIds = new Set(),
    roleCaps = {},
    ingredientCaps = {},
    lockedIds = new Set(),
    baselineRecipe = [],
  }) => {
    if (typeof analyze !== 'function' || typeof score !== 'function') {
      throw new Error('evaluateScenario requiere analyze(recipe, context) y score(analysis, context).');
    }

    const normalized = normalizeRecipe(recipe);
    let analysis = analyze(normalized, context);
    if (!analysis) {
      return {
        score: 0,
        novelty: noveltyScore(normalized, history),
        confidenceScore: 0,
        analysis: null,
        provenance: {},
        constraintFailures: ['analysis'],
        allowed: false,
      };
    }

    if (useStock && invLotes.length) {
      const real = realCostFor(normalized, ingredients, invLotes);
      analysis = { ...analysis, cost: real.cost, realCostKnown: real.realCostKnown };
    }
    if (profile.spawnOverride != null) analysis = { ...analysis, dynSpawn: profile.spawnOverride };

    const failures = constraintFailures({
      recipe: normalized,
      analysis,
      ingredients,
      profile,
      maxCost,
      useStock,
      stockIds,
      roleCaps,
      ingredientCaps,
      lockedIds,
      baselineRecipe,
    });

    const scored = score(analysis, { ...context, recipe: normalized });
    const novelty = noveltyScore(normalized, history);
    const evidence = scored?.provenance || {};
    return {
      ...scored,
      novelty,
      confidenceScore: confidenceScoreFor(scored),
      analysis,
      provenance: evidence,
      riskScore: Number(scored?.breakdown?.risk ?? scored?.dimensions?.safety?.score ?? 50),
      constraintFailures: failures,
      allowed: failures.length === 0,
    };
  };

  const candidateSort = (a, b) =>
    Number(b.evaluation?.score || 0) - Number(a.evaluation?.score || 0) ||
    b.utility - a.utility ||
    canonicalRecipeKey(a.recipe).localeCompare(canonicalRecipeKey(b.recipe));

  const utilitySort = (a, b) =>
    b.utility - a.utility ||
    Number(b.evaluation?.score || 0) - Number(a.evaluation?.score || 0) ||
    canonicalRecipeKey(a.recipe).localeCompare(canonicalRecipeKey(b.recipe));

  const applyForceLowRisk = (candidates, forceLowRisk) => {
    if (!forceLowRisk) return candidates;
    const highEnough = candidates.filter(c => Number(c.evaluation?.riskScore ?? 50) >= 30);
    return highEnough.length ? highEnough : candidates;
  };

  const selectStructuralRoots = (candidates = [], limit = 4) => {
    const viable = candidates.filter(c => c.evaluation?.allowed);
    const selected = [];
    const seen = new Set();

    ['1b1s', '2b1s', '1b2s'].forEach(mode => {
      const best = viable.filter(c => c.structuralMode === mode).sort(utilitySort)[0];
      if (!best) return;
      const key = canonicalRecipeKey(best.recipe);
      if (!seen.has(key)) {
        seen.add(key);
        selected.push(best);
      }
    });

    viable.slice().sort(utilitySort).forEach(c => {
      if (selected.length >= limit) return;
      const key = canonicalRecipeKey(c.recipe);
      if (seen.has(key)) return;
      seen.add(key);
      selected.push(c);
    });

    return selected.slice(0, limit);
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
    searchMode = 'local',
    targetKey = context.sKey || null,
    spp = context.spp || {},
    invLotes = [],
    stockMap = {},
    profileKey = 'produccion',
    maxCost = 0,
    maxSupp = null,
    maxCafe = null,
    forceLowRisk = null,
    spawnOverride = undefined,
    structuralRootLimit = 4,
  }) => {
    if (!['local', 'global', 'hybrid'].includes(searchMode)) {
      throw new Error(`searchMode inválido: ${searchMode}`);
    }

    const baseRecipe = normalizeRecipe(recipe);
    const locked = lockedIds instanceof Set ? lockedIds : new Set(lockedIds || []);
    const stock = stockIds instanceof Set ? stockIds : new Set(stockIds || []);
    const species = spp?.[targetKey] || context.species || context.sp || null;
    const profile = resolveProfile({
      profileKey,
      species,
      maxSupp,
      maxCafe,
      forceLowRisk,
      spawnOverride,
    });

    let evaluationCount = 0;
    const evaluate = candidateRecipe => {
      evaluationCount += 1;
      return evaluateScenario({
        recipe: candidateRecipe,
        context,
        analyze,
        score,
        history,
        ingredients,
        invLotes,
        profile,
        maxCost,
        useStock,
        stockIds: stock,
        roleCaps,
        ingredientCaps,
        lockedIds: locked,
        baselineRecipe: baseRecipe,
      });
    };

    const baseline = {
      id: 'baseline',
      recipe: baseRecipe,
      path: [],
      structuralMode: null,
      evaluation: evaluate(baseRecipe),
    };
    baseline.utility = weightedUtility(baseline.evaluation, weights);

    // Legacy parity + inventory safety: when the operator explicitly requests
    // stock-only search and there is no active stock, there is no candidate
    // universe to explore. Keep the baseline for diagnostics/UI, but return no
    // alternatives instead of silently falling back to catalog ingredients.
    if (useStock && stock.size === 0) {
      return {
        baseline,
        searchMode,
        noStock: true,
        explored: 0,
        evaluations: evaluationCount,
        structural: { evaluated: 0, refinedRoots: [], rootLimit: structuralRootLimit },
        ranked: [],
        pareto: [],
        recommended: [],
        best: baseline,
        lockedIds: [...locked],
        profile: {
          profileKey: profile.profileKey,
          maxSupp: profile.maxSupp,
          maxCafe: profile.maxCafe,
          forceLowRisk: profile.forceLowRisk,
          spawnOverride: profile.spawnOverride,
        },
        diagnostics: {
          stockCount: 0,
          useStock: true,
          maxCost,
          stockMapKeys: Object.keys(stockMap || {}).length,
          allowedCount: 0,
        },
      };
    }

    const seen = new Set([canonicalRecipeKey(baseRecipe)]);
    const all = [baseline];
    let structuralCandidates = [];

    if (searchMode === 'global' || searchMode === 'hybrid') {
      const structuralSeeds = generateStructuralSeeds({
        targetKey,
        ingredients,
        spp,
        useStock,
        stockIds: stock,
        profileKey,
        maxSupp: profile.maxSupp,
      });

      // Gate requirement: every structural seed is evaluated before any beam
      // pruning. This prevents topology changes from being discarded only
      // because they begin outside the current local neighborhood.
      structuralSeeds.forEach((seed, i) => {
        const key = canonicalRecipeKey(seed.recipe);
        if (!key || seen.has(key)) return;
        seen.add(key);
        const candidate = {
          id: `s${i + 1}`,
          parentId: 'baseline',
          recipe: normalizeRecipe(seed.recipe),
          path: seed.path,
          structuralMode: seed.structuralMode,
          metadata: seed.metadata,
          evaluation: evaluate(seed.recipe),
        };
        candidate.utility = weightedUtility(candidate.evaluation, weights);
        candidate.type = classifyScenario(candidate, baseline);
        structuralCandidates.push(candidate);
        all.push(candidate);
      });
    }

    if (searchMode !== 'global') {
      let beam = searchMode === 'hybrid'
        ? [baseline, ...selectStructuralRoots(structuralCandidates, structuralRootLimit)]
        : [baseline];

      for (let gen = 0; gen < generations; gen++) {
        const next = [];
        beam.forEach(parent => {
          const mutations = makeMutations({
            recipe: parent.recipe,
            ingredients,
            stepPct,
            useStock,
            stockIds: stock,
            roleCaps,
            lockedIds: locked,
          });

          mutations.forEach(mutation => {
            const candidateRecipe = applyMutation(parent.recipe, mutation, ingredientCaps);
            const key = canonicalRecipeKey(candidateRecipe);
            if (!key || seen.has(key)) return;
            seen.add(key);

            const evaluation = evaluate(candidateRecipe);
            const candidate = {
              id: `g${gen + 1}-${seen.size}`,
              parentId: parent.id,
              recipe: candidateRecipe,
              path: [...parent.path, mutation],
              structuralMode: parent.structuralMode || null,
              evaluation,
            };
            candidate.utility = weightedUtility(evaluation, weights);
            candidate.type = classifyScenario(candidate, baseline);

            if (evaluation.allowed && dimensionVector(evaluation).safety >= 45) next.push(candidate);
            all.push(candidate);
          });
        });

        next.sort(utilitySort);
        beam = paretoFront(next).sort(utilitySort).slice(0, beamWidth);
        if (!beam.length) break;
      }
    }

    let allowed = all.filter(c => c.id !== 'baseline' && c.evaluation?.allowed);
    allowed = applyForceLowRisk(allowed, profile.forceLowRisk);

    const ranked = allowed.slice().sort(candidateSort).slice(0, 12);
    const viable = allowed.filter(c => dimensionVector(c.evaluation).safety >= 60);
    const pareto = paretoFront(viable).sort(utilitySort);

    const byType = {};
    pareto.forEach(c => { if (!byType[c.type]) byType[c.type] = c; });
    const recommended = Object.values(byType).slice(0, 4);

    return {
      baseline,
      searchMode,
      noStock: false,
      explored: all.length - 1,
      evaluations: evaluationCount,
      structural: {
        evaluated: structuralCandidates.length,
        refinedRoots: searchMode === 'hybrid'
          ? selectStructuralRoots(structuralCandidates, structuralRootLimit).map(c => c.id)
          : [],
        rootLimit: structuralRootLimit,
      },
      ranked,
      pareto,
      recommended,
      best: pareto[0] || ranked[0] || baseline,
      lockedIds: [...locked],
      profile: {
        profileKey: profile.profileKey,
        maxSupp: profile.maxSupp,
        maxCafe: profile.maxCafe,
        forceLowRisk: profile.forceLowRisk,
        spawnOverride: profile.spawnOverride,
      },
      diagnostics: {
        stockCount: stock.size,
        useStock,
        maxCost,
        stockMapKeys: Object.keys(stockMap || {}).length,
        allowedCount: allowed.length,
      },
    };
  };

  const api = {
    SCENARIO_PROFILES,
    normalizeRecipe,
    canonicalRecipeKey,
    recipeDistance,
    noveltyScore,
    precioPonderado,
    realCostFor,
    resolveProfile,
    generateStructuralSeeds,
    applyMutation,
    makeMutations,
    dimensionVector,
    dominates,
    paretoFront,
    weightedUtility,
    evaluateScenario,
    selectStructuralRoots,
    searchScenarios,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPeritoScenarios = api;
})();
