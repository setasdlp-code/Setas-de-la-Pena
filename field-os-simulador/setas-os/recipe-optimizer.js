'use strict';
// ── recipe-optimizer.js — motor de optimización y diagnóstico de recetas de sustrato ──
// Módulo puro: sin dependencias de React ni del DOM. Recibe sus datos (INGS, SPP,
// receta actual, inventarios) como argumentos explícitos.
(function () {

  const SetasScoring = (typeof require !== 'undefined')
    ? require('./scoring.js')
    : (globalThis.SetasScoring || {});

  const getEffectiveINGS = (ings) => (ings && ings.length) ? ings : (typeof globalThis !== 'undefined' && globalThis.INGS ? globalThis.INGS : []);
  const getEffectiveSPP = (spp) => spp || (typeof globalThis !== 'undefined' && globalThis.SPP ? globalThis.SPP : {});

  // ── analyze — análisis nutricional, fisicoquímico y estimación de EB ──
  const analyze = (recipe, sKey, ings, spp) => {
    if (!recipe || !recipe.length) return null;
    const effectiveINGS = getEffectiveINGS(ings);
    const effectiveSPP = getEffectiveSPP(spp);
    const tot = recipe.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    if (!tot) return null;
    let wC = 0, wN = 0, wPh = 0, wDig = 0, wCra = 0, nP = 0, suppP = 0, baseP = 0, addP = 0, cafeP = 0, manP = 0, airP = 0, densaP = 0, incompat = [];
    const DENSOS = ['aserrin_roble', 'aserrin_eucalipto', 'aserrin_pino', 'aserrin_pino_compostado', 'borra_cafe', 'afrecho_cerveceria', 'chips_poda_urbana', 'guadua', 'carton_corrugado', 'pulpa_papel'];
    recipe.forEach(r => {
      const g = effectiveINGS.find(i => i.id === r.id);
      if (!g) return;
      const p = parseFloat(r.p) || 0;
      const esAditivoSeco = (g.role === 'aditivo_ph' || g.role === 'aditivo_estructura');
      const dryFrac = p * (1 - Math.min(0.92, Math.max(0, (g.moisture || 0) / 100)));
      if (g.cn > 0 && !esAditivoSeco) { wC += g.c * dryFrac; wN += g.n * dryFrac; nP += dryFrac; }
      wPh += g.ph * p; wDig += g.dig * p; wCra += g.cra * p;
      if (g.role === 'suplemento_n') suppP += p;
      if (g.role === 'base_carbono') baseP += p;
      if (['aditivo_ph', 'aditivo_estructura', 'aditivo_micronutriente'].includes(g.role)) addP += p;
      if (g.role === 'aireador') airP += p;
      if (g.cat === 'cafe') cafeP += p;
      if (g.cat === 'est') manP += p;
      if (DENSOS.includes(g.id)) densaP += p;
      if (sKey && g.cs && !g.cs.includes(sKey) && g.cn > 0) incompat.push(g.name);
    });
    const avgN = nP ? wN / nP : 0;
    const cn = avgN > 0 ? (nP ? wC / nP : 0) / avgN : 0;
    const avgPh = tot ? wPh / tot : 7;
    const avgDig = tot ? wDig / tot : 5;
    const avgCra = tot ? wCra / tot : 3;
    const cost = recipe.reduce((s, r) => {
      const g = effectiveINGS.find(i => i.id === r.id);
      return g ? s + (g.cost * (parseFloat(r.p) || 0) / 100) : s;
    }, 0);
    const sp = effectiveSPP[sKey];
    let eb = 0, trichoderma = false, dynSpawn = sp?.spawn_rate || 8;
    if (sp) {
      const cF = Math.max(0, 1 - Math.pow(Math.abs(cn - sp.cn_optimal.ideal) / ((sp.cn_optimal.max - sp.cn_optimal.min) / 2), 1.5));
      const nF = Math.max(0, 1 - Math.pow(Math.abs(avgN - sp.n_optimal.ideal) / ((sp.n_optimal.max - sp.n_optimal.min) / 2), 1.5));
      eb = sp.eb_baseline + (sp.eb_optimal - sp.eb_baseline) * (cF * 0.6 + nF * 0.4);
      const needsAutoclave = suppP > sp.supplementation_max;
      const nThresh = needsAutoclave ? sp.n_optimal.max * 1.2 : sp.n_optimal.max * 1.15;
      if (avgN > nThresh && !needsAutoclave) { trichoderma = true; eb *= 0.45; }
      else if (avgN > nThresh && needsAutoclave) { eb *= 0.80; }
      else if (needsAutoclave) eb *= 0.85;
      if (incompat.length) eb *= 0.9;
      if (tot < 95 || tot > 105) eb *= 0.95;
      var phF = 1;
      if (sp.ph_optimal) {
        if (avgPh < sp.ph_optimal.min) phF = Math.max(0.70, 1 - (sp.ph_optimal.min - avgPh) * 0.12);
        else if (avgPh > sp.ph_optimal.max) phF = Math.max(0.80, 1 - (avgPh - sp.ph_optimal.max) * 0.10);
      }
      var aerF = 1;
      if (densaP > 60 && airP < 10) aerF = 0.85;
      else if (densaP > 40 && airP < 8) aerF = 0.93;
      const isLigninSpp = ['shiitake', 'reishi'].includes(sKey);
      var digF = isLigninSpp ? 1 : (avgDig >= 6 ? 1 : Math.max(0.85, 1 - (6 - avgDig) * 0.03));
      eb = eb * phF * aerF * digF;
      var ebMods = { phF, aerF, digF };
      var ebCvVal = 0.18;
      if (ebMods.phF < 0.95) ebCvVal += 0.05;
      if (ebMods.aerF < 0.95) ebCvVal += 0.05;
      if (ebMods.digF < 0.95) ebCvVal += 0.04;
      if (incompat.length) ebCvVal += 0.08;
      if (suppP > sp.supplementation_max) ebCvVal += 0.10;
      if (trichoderma) ebCvVal = 0.50;
      ebCvVal = Math.min(trichoderma ? 0.50 : 0.40, ebCvVal);
      var ebLow = Math.round(eb * (1 - ebCvVal));
      var ebHigh = Math.round(eb * (1 + ebCvVal));
      var ebIndex = Math.round(Math.max(0, Math.min(100, (eb - sp.eb_baseline) / Math.max(1, sp.eb_optimal - sp.eb_baseline) * 100)));
      dynSpawn = Math.min(15, (sp.spawn_rate || 8) + Math.floor(suppP / 5));
    }
    const eucPct = recipe.reduce((s, r) => r.id === 'aserrin_eucalipto' ? s + (parseFloat(r.p) || 0) : s, 0);
    const pescPct = recipe.reduce((s, r) => r.id === 'harina_pescado' ? s + (parseFloat(r.p) || 0) : s, 0);
    return {
      tot, avgN, cn, cost, eb, suppP, baseP, addP, cafeP, manP, airP, densaP, incompat, sp, trichoderma, dynSpawn, avgPh, avgDig, avgCra, eucPct, pescPct,
      ebLow: typeof ebLow !== 'undefined' ? ebLow : Math.round(eb),
      ebHigh: typeof ebHigh !== 'undefined' ? ebHigh : Math.round(eb),
      ebIndex: typeof ebIndex !== 'undefined' ? ebIndex : 0,
      ebMods: typeof ebMods !== 'undefined' ? ebMods : null
    };
  };

  // ── setPctProportional — fija un ingrediente y reescala los libres a 100% ──
  const setPctProportional = (recipe, id, v, lockedIds = []) => {
    v = Math.max(0, Math.min(80, v));
    const others = recipe.filter(r => r.id !== id);
    const lockedSum = others.filter(r => lockedIds.includes(r.id)).reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    const free = others.filter(r => !lockedIds.includes(r.id));
    const sumFree = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    const remaining = Math.max(0, 100 - v - lockedSum);
    let found = false; const next = [];
    recipe.forEach(r => {
      if (r.id === id) { next.push({ ...r, p: Math.round(v * 10) / 10 }); found = true; }
      else if (lockedIds.includes(r.id)) { next.push(r); }
      else { const np = sumFree === 0 ? (remaining / Math.max(1, free.length)) : (parseFloat(r.p) / sumFree) * remaining; next.push({ ...r, p: Math.round(np * 10) / 10 }); }
    });
    if (!found) next.push({ id, p: Math.round(v * 10) / 10 });
    return next;
  };

  // ── solveTargetPct — busca el % exacto que lleva una métrica a su objetivo ──
  const solveTargetPct = (recipe, sKey, ings, id, metric, target, lockedIds = [], spp = null) => {
    const effectiveINGS = getEffectiveINGS(ings);
    const effectiveSPP = getEffectiveSPP(spp);
    const readM = a => !a ? null : (metric === 'cn' ? a.cn : metric === 'n' ? a.avgN : a.avgPh);
    const g = effectiveINGS.find(i => i.id === id);
    const sp = effectiveSPP[sKey];
    const vMax = g && (g.role === 'suplemento_n' || g.role === 'suplemento_medio') && sp
      ? Math.min(55, sp.supplementation_max || 20)
      : (g && ROLE_CAP_INCREASE[g.role] != null ? ROLE_CAP_INCREASE[g.role] : 55);
    let best = null, bestDist = Infinity;
    const evalAt = v => {
      const cand = setPctProportional(recipe, id, v, lockedIds);
      const a = analyze(cand, sKey, effectiveINGS, effectiveSPP);
      const val = readM(a); if (val == null) return;
      const d = Math.abs(val - target);
      if (d < bestDist) { bestDist = d; best = { pct: Math.round(v * 10) / 10, val, an: a }; }
    };
    for (let v = 0.5; v <= vMax; v += 1) evalAt(v);
    if (best) { const c = best.pct; for (let v = Math.max(0, c - 1.5); v <= Math.min(vMax, c + 1.5); v += 0.1) evalAt(v); }
    return best;
  };

  const METRIC_LABEL = { cn: 'C:N', n: 'N', ph: 'pH' };
  const fmtMetric = (metric, v) => metric === 'cn' ? `${v.toFixed(1)}:1` : metric === 'n' ? `${v.toFixed(2)}%` : v.toFixed(1);

  // ── scoreAn — puente hacia SetasScoring ──
  const scoreAn = (an, extraCtx = {}) => {
    if (!an || !an.sp) return { score: 0, status: 'sin_receta', breakdown: null, weights: null, caps: null };
    const sev = SetasScoring.assessSeverity ? SetasScoring.assessSeverity(an) : { criticals: 0, warnings: 0, severity: 0 };
    return SetasScoring.scoreRecipe ? SetasScoring.scoreRecipe(an, { ...extraCtx, criticals: sev.criticals, warnings: sev.warnings, severity: sev.severity }) : { score: 0, status: 'sin_receta' };
  };

  // ── normalizeRecipe — rebalancear a 100% respetando bloqueos ──
  const normalizeRecipe = (rec, lockedIds = []) => {
    const locked = rec.filter(r => lockedIds.includes(r.id));
    const free = rec.filter(r => !lockedIds.includes(r.id));
    const lockedSum = locked.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    const freeSum = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    const remaining = Math.max(0, 100 - lockedSum);
    if (freeSum <= 0) return rec;
    return rec.map(r => {
      if (lockedIds.includes(r.id)) return r;
      return { ...r, p: Math.round(((parseFloat(r.p) || 0) / freeSum) * remaining * 10) / 10 };
    });
  };

  // ── capFreeIngredient — aplica un tope a un ingrediente después de normalizar ──
  const capFreeIngredient = (rec, id, cap, lockedIds = []) => {
    const item = rec.find(r => r.id === id);
    if (!item || lockedIds.includes(id) || (parseFloat(item.p) || 0) <= cap) return rec;
    const excess = (parseFloat(item.p) || 0) - cap;
    const others = rec.filter(r => r.id !== id && !lockedIds.includes(r.id));
    const othersSum = others.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
    return rec.map(r => {
      if (r.id === id) return { ...r, p: cap };
      if (lockedIds.includes(r.id) || othersSum <= 0) return r;
      const add = excess * (parseFloat(r.p) || 0) / othersSum;
      return { ...r, p: Math.round(((parseFloat(r.p) || 0) + add) * 10) / 10 };
    });
  };

  const ROLE_CAP_ADD = { base_carbono: 80, suplemento_n: 20, suplemento_medio: 30, aditivo_ph: 10, aditivo_arrancador: 10, aditivo_estructura: 15, aditivo_micronutriente: 5, aireador: 15 };
  const ROLE_CAP_INCREASE = { base_carbono: 90, suplemento_n: 25, suplemento_medio: 35, aditivo_ph: 12, aditivo_arrancador: 12, aditivo_estructura: 18, aditivo_micronutriente: 6, aireador: 18 };
  const capForRole = (id, map, fallback, ings) => {
    const effectiveINGS = getEffectiveINGS(ings);
    const g = effectiveINGS.find(x => x.id === id);
    return (g && map[g.role] != null) ? map[g.role] : fallback;
  };

  // ── applyOptToRecipe — aplica una sugerencia a una receta ──
  const applyOptToRecipe = (rec, apply, locked = [], ings) => {
    if (!apply) return rec;
    const effectiveINGS = getEffectiveINGS(ings);
    if (Array.isArray(apply)) return apply.reduce((r, a) => applyOptToRecipe(r, a, locked, effectiveINGS), rec);
    const { mode, id, delta, value } = apply;
    const existing = rec.find(r => r.id === id);
    if (mode === 'set') {
      return setPctProportional(rec, id, value, locked);
    }
    if (mode === 'add') {
      if (existing) {
        const curP = parseFloat(existing.p) || 0;
        const normalized = normalizeRecipe(rec.map(r => r.id === id ? { ...r, p: curP + delta } : r), locked);
        return capFreeIngredient(normalized, id, capForRole(id, ROLE_CAP_ADD, 45, effectiveINGS), locked);
      } else {
        const free = rec.filter(r => !locked.includes(r.id));
        const sumFree = free.reduce((s, r) => s + (parseFloat(r.p) || 0), 0);
        const scale = Math.max(0, sumFree - delta) / Math.max(1, sumFree);
        return [...rec.map(r => locked.includes(r.id) ? r : { ...r, p: Math.round((parseFloat(r.p) || 0) * scale * 10) / 10 }), { id, p: delta }];
      }
    } else if (mode === 'increase') {
      const cur = existing ? (parseFloat(existing.p) || 0) : 0;
      const normalized = normalizeRecipe(rec.map(r => r.id === id ? { ...r, p: cur + delta } : r), locked);
      return capFreeIngredient(normalized, id, capForRole(id, ROLE_CAP_INCREASE, 60, effectiveINGS), locked);
    } else if (mode === 'decrease') {
      const cur = existing ? (parseFloat(existing.p) || 0) : 0;
      return normalizeRecipe(rec.map(r => r.id === id ? { ...r, p: Math.max(0, cur - delta) } : r).filter(r => r.p > 0.1), locked);
    }
    return normalizeRecipe(rec, locked);
  };

  // ── calcMaxBatchFromStock — kg húmedos máximos producibles según bodega ──
  const calcMaxBatchFromStock = (recipe, stockMap, batchKgWet = 10, hObj = 65, ings) => {
    const effectiveINGS = getEffectiveINGS(ings);
    const dry = batchKgWet * (1 - hObj / 100);
    let max = Infinity;
    recipe.forEach(r => {
      const g = effectiveINGS.find(x => x.id === r.id);
      if (!g) return;
      const dryNeed = dry * (r.p / 100);
      const wetNeed = dryNeed / (1 - Math.min(0.92, (g.moisture || 0) / 100));
      const available = stockMap[g.id] || 0;
      if (wetNeed > 0) max = Math.min(max, available / wetNeed);
    });
    return Number.isFinite(max) ? Math.floor(max * batchKgWet) : 0;
  };

  // ── quantifyItem — reescribe ítem con % objetivo exacto vía solveTargetPct ──
  const quantifyItem = (item, recipe, sKey, ings, lockedIds, spp) => {
    if (!item.apply || !item.apply.id || !item._solve) return item;
    const effectiveINGS = getEffectiveINGS(ings);
    const effectiveSPP = getEffectiveSPP(spp);
    const { metric, target } = item._solve; const id = item.apply.id;
    const g = effectiveINGS.find(i => i.id === id); if (!g) return item;
    const res = solveTargetPct(recipe, sKey, effectiveINGS, id, metric, target, lockedIds, effectiveSPP);
    if (!res) return item;
    const cur = recipe.find(r => r.id === id); const curP = cur ? parseFloat(cur.p) || 0 : 0;
    const noChange = cur && Math.abs(res.pct - curP) < 0.15;
    const verb = !cur ? 'Agregar' : noChange ? 'Ya está en' : res.pct > curP ? 'Subir' : 'Bajar';
    item.action = `${verb} <b>${g.name}</b> a <b>${res.pct}%</b>${cur ? ` (actual ${curP.toFixed(0)}%)` : ' (nuevo)'}`;
    item.delta = `→ ${METRIC_LABEL[metric]} ${fmtMetric(metric, res.val)}`;
    item.apply = noChange ? null : { mode: 'set', id, value: res.pct };
    const sp = effectiveSPP[sKey];
    let inRange = true;
    if (sp) {
      if (metric === 'cn' && sp.cn_optimal) inRange = res.val >= sp.cn_optimal.min && res.val <= sp.cn_optimal.max;
      else if (metric === 'n' && sp.n_optimal) inRange = res.val >= sp.n_optimal.min && res.val <= sp.n_optimal.max;
      else if (metric === 'ph' && sp.ph_optimal) inRange = res.val >= sp.ph_optimal.min && res.val <= sp.ph_optimal.max;
    }
    if (!inRange) {
      item.capped = true;
      item.riskIfIgnored = (item.riskIfIgnored ? item.riskIfIgnored + ' · ' : '') + `${g.name} solo no alcanza el rango seguro (tope de suplementación) — se necesita un segundo ingrediente o ampliar bodega.`;
    }
    return item;
  };

  // ── generateOptimizer — motor de diagnóstico basado en reglas ──
  const generateOptimizer = (an, sKey, stockIds = new Set(), recipe = [], ings, lockedIds = [], blendedEB = null, useStock = true, appliedIcons = {}, spp) => {
    const effectiveINGS = getEffectiveINGS(ings);
    const effectiveSPP = getEffectiveSPP(spp);
    if (!an || !an.sp) return { score: 0, status: 'sin_receta', items: [] };
    const sp = an.sp; const items = [];
    const flags = SetasScoring.detectSeverity ? SetasScoring.detectSeverity(an) : {};
    const scaledDelta = (base, overDist) => Math.round(base * (1 + Math.min(1.5, Math.max(0, overDist || 0))));
    const recommendedIds = new Set();
    const bestStock = (filter, sortFn = (a, b) => 0) => {
      const candidates = effectiveINGS.filter(g => g.cs && g.cs.includes(sKey) && filter(g)).sort(sortFn);
      const inStock = useStock ? candidates.filter(g => stockIds.size === 0 || stockIds.has(g.id)) : [];
      const pool = inStock.length > 0 ? inStock : candidates;
      if (!pool.length) return null;
      const inRecipe = recipe && recipe.length ? pool.find(g => recipe.some(r => r.id === g.id)) : null;
      if (inRecipe) { recommendedIds.add(inRecipe.id); return inRecipe; }
      const top = pool[0];
      if (recommendedIds.has(top.id) && pool.length > 1) {
        const alt = pool.find(g => !recommendedIds.has(g.id));
        if (alt) { recommendedIds.add(alt.id); return alt; }
      }
      recommendedIds.add(top.id);
      return top;
    };

    if (flags.cnHigh) {
      const best = bestStock(g => g.n >= 1.5 && g.role !== 'base_carbono', (a, b) => b.n - a.n);
      const inRec = recipe?.find(r => best && r.id === best.id);
      items.push({
        priority: 'critical', icon: '↓C:N',
        label: 'C:N demasiado alto',
        action: best ? `Aumentar <b>${best.name}</b> (N=${best.n}%) — ${inRec ? 'ya en receta, sube %' : 'agregar a receta'}` : `Reducir base de carbono`,
        effect: `C:N ${an.cn.toFixed(1)}:1 > máximo ${sp.cn_optimal.max}:1 · ideal ${sp.cn_optimal.ideal}:1 · colonización tardía`,
        delta: `C:N actual ${an.cn.toFixed(0)} → objetivo ${sp.cn_optimal.ideal}`,
        apply: best ? { mode: inRec ? 'increase' : 'add', id: best.id, delta: scaledDelta(7, flags.cnOverDist) } : null
      });
    }
    if (flags.cnLow) {
      const best = bestStock(g => g.cn > 60 && g.role === 'base_carbono', (a, b) => b.cn - a.cn);
      const inRec = recipe?.find(r => best && r.id === best.id);
      items.push({
        priority: 'critical', icon: '↑C:N',
        label: 'C:N demasiado bajo',
        action: best ? `Aumentar <b>${best.name}</b> (C:N ${best.cn}:1)` : `Reducir suplementos N`,
        effect: `C:N ${an.cn.toFixed(1)}:1 < mínimo ${sp.cn_optimal.min}:1 · exceso N → riesgo contaminación`,
        delta: `C:N actual ${an.cn.toFixed(0)} → objetivo ${sp.cn_optimal.ideal}`,
        apply: best ? { mode: inRec ? 'increase' : 'add', id: best.id, delta: scaledDelta(8, flags.cnOverDist) } : null
      });
    }
    if (flags.nLow) {
      const best = bestStock(g => g.n >= 2 && g.role !== 'base_carbono', (a, b) => a.cost - b.cost);
      const inRec = recipe?.find(r => best && r.id === best.id);
      items.push({
        priority: 'critical', icon: '↑N',
        label: 'Nitrógeno insuficiente',
        action: best ? `${inRec ? 'Aumentar' : 'Agregar'} <b>${best.name}</b> (N=${best.n}%, $${best.cost}/kg)` : 'Agregar suplemento nitrogenado',
        effect: `N ${an.avgN.toFixed(2)}% < mínimo ${sp.n_optimal.min}% · colonización lenta y EB reducida`,
        delta: `N ${an.avgN.toFixed(2)}% → objetivo >${sp.n_optimal.min}%`,
        apply: best ? { mode: inRec ? 'increase' : 'add', id: best.id, delta: scaledDelta(8, flags.nOverDist) } : null
      });
    }
    if (flags.nHigh) {
      const base = bestStock(g => g.cn > 80 && g.role === 'base_carbono', (a, b) => b.cn - a.cn);
      const suppInRec = recipe?.filter(r => { const g = effectiveINGS.find(i => i.id === r.id); return g && g.n >= 2 && g.role !== 'base_carbono'; }) || [];
      items.push({
        priority: 'critical', icon: '↓N',
        label: 'Exceso de Nitrógeno',
        action: suppInRec.length > 0 ? `Reducir <b>${effectiveINGS.find(g => g.id === suppInRec[0]?.id)?.name || 'suplementos'}</b> en 5–8%` : `Aumentar base de carbono`,
        effect: `N ${an.avgN.toFixed(2)}% > máximo ${sp.n_optimal.max}% · riesgo bacterias y moho verde`,
        delta: `N ${an.avgN.toFixed(2)}% → objetivo <${sp.n_optimal.max}%`,
        apply: suppInRec.length > 0 ? { mode: 'decrease', id: suppInRec[0].id, delta: scaledDelta(6, flags.nOverDist) } : (base ? { mode: 'increase', id: base.id, delta: scaledDelta(8, flags.nOverDist) } : null)
      });
    }
    if (flags.trichoderma) {
      items.push({
        priority: 'critical', icon: '⚠',
        label: 'Riesgo Trichoderma',
        action: 'Esterilizar en autoclave 121°C × 90 min, o reducir N total por debajo del umbral',
        effect: `N crítico sin esterilización → EB cae ~85% · Trichoderma compite activamente con el micelio`,
        delta: 'Acción inmediata requerida', apply: null
      });
    }
    if (flags.phLow) {
      const best = bestStock(g => g.ph > 7.5, (a, b) => b.ph - a.ph);
      items.push({
        priority: 'critical', icon: '↑pH',
        label: 'pH demasiado ácido',
        action: best ? `Agregar <b>${best.name}</b> 1–3% (pH ${best.ph})` : 'Agregar carbonato de calcio 1–2%',
        effect: `pH ${an.avgPh.toFixed(1)} < mínimo ${sp.ph_optimal.min} · enzimas del micelio trabajan a rendimiento parcial`,
        delta: `pH ${an.avgPh.toFixed(1)} → objetivo ${((sp.ph_optimal.min + sp.ph_optimal.max) / 2).toFixed(1)}`,
        apply: best ? { mode: 'add', id: best.id, delta: scaledDelta(2, flags.phOverDist) } : null
      });
    }
    if (flags.phHigh) {
      const cafe = bestStock(g => g.ph < 6 && g.n >= 0.5, (a, b) => a.ph - b.ph);
      items.push({
        priority: 'critical', icon: '↓pH',
        label: 'pH demasiado alcalino',
        action: cafe ? `Agregar <b>${cafe.name}</b> 8–15% (pH ${cafe.ph})` : 'Incorporar borra de café o aserrín (ácidos)',
        effect: `pH ${an.avgPh.toFixed(1)} > máximo ${sp.ph_optimal.max} · inhibe enzimas y favorece bacterias`,
        delta: `pH ${an.avgPh.toFixed(1)} → objetivo ${((sp.ph_optimal.min + sp.ph_optimal.max) / 2).toFixed(1)}`,
        apply: cafe ? { mode: 'add', id: cafe.id, delta: scaledDelta(10, flags.phOverDist) } : null
      });
    }

    const cnDist = flags.cnDist;
    if (flags.cnWarn) {
      const subir = an.cn > sp.cn_optimal.ideal;
      const ing = subir
        ? bestStock(g => g.n >= 1.5 && g.role !== 'base_carbono', (a, b) => b.n - a.n)
        : bestStock(g => g.cn > 60 && g.role === 'base_carbono', (a, b) => b.cn - a.cn);
      const inRec = recipe?.find(r => ing && r.id === ing.id);
      if (ing) items.push({
        priority: 'warning', icon: subir ? '→N' : '→C',
        label: 'Afinar C:N al ideal',
        action: `${inRec ? 'Subir %' : 'Agregar'} <b>${ing.name}</b> en 3–5%`,
        effect: `C:N ${an.cn.toFixed(1)}:1 · ideal ${sp.cn_optimal.ideal}:1 · acercarse al centro sube EB ~${Math.round(cnDist * 15)}%`,
        delta: `+${Math.round(cnDist * 15)}% EB estimada`,
        apply: { mode: inRec ? 'increase' : 'add', id: ing.id, delta: 4 }
      });
    }
    const nDist = flags.nDist;
    if (flags.nWarn) {
      const subir = an.avgN < sp.n_optimal.ideal;
      const ing = subir
        ? bestStock(g => g.n >= 2 && g.role !== 'base_carbono', (a, b) => a.cost - b.cost)
        : bestStock(g => g.cn > 60 && g.role === 'base_carbono', (a, b) => b.cn - a.cn);
      const inRec = recipe?.find(r => ing && r.id === ing.id);
      if (ing) items.push({
        priority: 'warning', icon: subir ? '→N+' : '→N-',
        label: 'Afinar Nitrógeno',
        action: `${subir ? (inRec ? 'Aumentar' : 'Agregar') : 'Reducir'} <b>${ing.name}</b> en 3–5%`,
        effect: `N ${an.avgN.toFixed(2)}% · ideal ${sp.n_optimal.ideal}% · diferencia del ${Math.round(nDist * 100)}% del rango`,
        delta: `N → ${sp.n_optimal.ideal}% (+EB)`,
        apply: { mode: subir ? (inRec ? 'increase' : 'add') : 'decrease', id: ing.id, delta: 4 }
      });
    }
    if (flags.ebWarn) {
      const margen = sp.supplementation_max - an.suppP;
      const ing = bestStock(g => g.n >= 2 && g.role === 'suplemento_n', (a, b) => a.cost - b.cost);
      const inRec = recipe?.find(r => ing && r.id === ing.id);
      if (ing) {
        const d = Math.min(8, Math.round(margen)); items.push({
          priority: 'warning', icon: '↑EB',
          label: 'Potencial de EB sin explotar',
          action: `${inRec ? 'Aumentar' : 'Agregar'} <b>${ing.name}</b> ${d}% · quedan ${Math.round(margen)}% de margen seguro`,
          effect: `EB actual ${an.eb.toFixed(0)}% · máximo especie ${sp.eb_optimal}% · suplementación dentro de límite seguro`,
          delta: `EB ${an.eb.toFixed(0)}% → ~${Math.min(sp.eb_optimal, an.eb + Math.round(margen * 1.5)).toFixed(0)}%`,
          apply: { mode: inRec ? 'increase' : 'add', id: ing.id, delta: d }
        });
      }
    }
    if (sp.ph_optimal) {
      const phIdeal = (sp.ph_optimal.min + sp.ph_optimal.max) / 2;
      const phDist = Math.abs(an.avgPh - phIdeal) / Math.max(0.01, sp.ph_optimal.max - sp.ph_optimal.min);
      if (phDist > 0.08 && an.avgPh >= sp.ph_optimal.min && an.avgPh <= sp.ph_optimal.max) {
        const subir = an.avgPh < phIdeal;
        const ajuste = subir
          ? bestStock(g => g.ph > 7.5, (a, b) => b.ph - a.ph)
          : bestStock(g => g.ph < 6, (a, b) => a.ph - b.ph);
        items.push({
          priority: 'tip', icon: subir ? 'pH+' : 'pH-',
          label: 'Centrar pH',
          action: ajuste ? `Agregar <b>${ajuste.name}</b> 1–2% adicional` : (subir ? 'Agregar CaCO₃ 0.5–1%' : 'Agregar borra de café 5–8%'),
          effect: `pH ${an.avgPh.toFixed(1)} · centro ideal ${phIdeal.toFixed(1)} · pH centrado mejora rendimiento enzimático ~5%`,
          delta: `pH ${an.avgPh.toFixed(1)} → ${phIdeal.toFixed(1)}`,
          apply: ajuste ? { mode: 'add', id: ajuste.id, delta: 2 } : null
        });
      }
    }
    if (an.cost > 800) {
      const alt = bestStock(g => g.role === 'suplemento_n' && g.cost < 700 && g.n >= 1.5, (a, b) => a.cost - b.cost);
      if (alt) items.push({
        priority: 'tip', icon: '$↓',
        label: 'Oportunidad de costo',
        action: `<b>${alt.name}</b> ($${alt.cost}/kg, N=${alt.n}%) como suplemento parcial en bodega`,
        effect: `Costo actual $${Math.round(an.cost)}/kg · sustitución parcial puede bajar 20–30%`,
        delta: `$${Math.round(an.cost)} → ~$${Math.round(an.cost * 0.75)}/kg`,
        apply: null
      });
    }
    if (an.addP < 2) {
      const m = bestStock(g => g.role === 'aditivo_ph') || effectiveINGS.find(g => g.role === 'aditivo_ph' && g.cs && g.cs.includes(sKey));
      if (m) items.push({
        priority: 'tip', icon: 'Ca',
        label: 'Sin mineral estabilizador',
        action: `Agregar <b>${m.name}</b> 1–2% · bajo costo, alto impacto`,
        effect: `Sin minerales detectados · CaCO₃ estabiliza pH y aporta calcio para pared celular del micelio`,
        delta: 'pH más estable · micelio más vigoroso',
        apply: { mode: 'add', id: m.id, delta: 2 }
      });
    }
    if (an.avgDig < 6) {
      const dig = bestStock(g => g.dig >= 7 && g.role === 'base_carbono', (a, b) => b.dig - a.dig);
      if (dig) items.push({
        priority: 'tip', icon: 'Dig',
        label: 'Baja digestibilidad',
        action: `Incorporar <b>${dig.name}</b> (dig. ${dig.dig}/10) reemplazando parte de la base`,
        effect: `Digestibilidad ${an.avgDig.toFixed(1)}/10 · sustrato difícil para el micelio · pajas finas mejoran colonización`,
        delta: `Dig. ${an.avgDig.toFixed(1)} → ${dig.dig}/10`,
        apply: { mode: 'add', id: dig.id, delta: 10 }
      });
    }

    items.push({
      priority: 'info', icon: '⛰',
      label: 'Tenjo 2.600 msnm',
      action: 'Pasteurización: extender tiempo +25% (agua hierve ~92°C). CWLP: verificar pH≥12 antes de sumergir.',
      effect: 'La altitud no afecta incubación ni fructificación — solo el tratamiento térmico.',
      delta: null, apply: null
    });

    if (recipe && recipe.length) {
      const phIdeal = sp.ph_optimal ? (sp.ph_optimal.min + sp.ph_optimal.max) / 2 : null;
      items.forEach(it => {
        if (!it.apply || !it.apply.id) return;
        const ic = it.icon || '';
        let solve = null;
        if (ic === '→N' || ic === '→C' || ic.indexOf('C:N') >= 0) solve = { metric: 'cn', target: sp.cn_optimal.ideal };
        else if (ic.toLowerCase().indexOf('ph') >= 0 && phIdeal != null) solve = { metric: 'ph', target: phIdeal };
        else if (ic.indexOf('N') >= 0) solve = { metric: 'n', target: sp.n_optimal.ideal };
        if (solve) { it._solve = solve; quantifyItem(it, recipe, sKey, effectiveINGS, lockedIds, effectiveSPP); delete it._solve; }
      });
    }

    const WHY_MAP = { '↓C:N': 'La relación C:N determina velocidad de colonización y rendimiento. Alto C:N = carbono sin aprovechar.', '↑C:N': 'C:N bajo = exceso de nitrógeno, el nutriente que activa mohos competidores.', '↑N': 'El nitrógeno es el nutriente limitante para el crecimiento del micelio.', '↓N': 'Exceso de N activa bacterias y Trichoderma que colonizan más rápido que el micelio.', '⚠': 'Trichoderma colapsa el bloque — compite más rápido que cualquier micelio de seta.', '↑pH': 'pH ácido bloquea enzimas hidrolíticas del micelio que degradan la lignina.', '↓pH': 'pH alcalino inhibe el crecimiento y favorece bacterias contaminantes.', '↑EB': 'EB no explotada = dinero en el sustrato que el hongo no puede aprovechar.', 'Ca': 'Sin minerales, el pH cae durante la incubación y el micelio pierde vigor a mitad del ciclo.', '$↓': 'El costo de ingredientes es el mayor gasto variable de la producción.', 'Dig': 'Baja digestibilidad requiere más energía del micelio, aumentando el riesgo de contaminación.', '→N': 'N y C:N están relacionados: ajustar uno afecta el otro en la misma receta.', '→C': 'La base de carbono define la estructura física y el C:N base del sustrato.' };
    const RISK_MAP = { '↓C:N': 'Colonización lenta, EB reducida, mayor ventana de contaminación.', '↑C:N': 'Exceso de N → bacterias → olor a amoniaco → contaminación del lote completo.', '↑N': 'EB reducida 30–50%. En casos extremos, colapso completo del bloque.', '↓N': 'Sin corrección: probabilidad alta de Trichoderma y pérdida del lote.', '⚠': 'Sin autoclave: pérdida del lote completo en 5–10 días de colonización.', '↑pH': 'Colonización parcial, EB reducida, mayor riesgo bacteriano.', '↓pH': 'Bloqueo enzimático completo en pH>8 para la mayoría de Pleurotus.', '↑EB': 'Receta subóptima — EB 20–40% menor a lo posible con los ingredientes disponibles.', 'Ca': 'pH variable lote-a-lote — resultados inconsistentes.', 'Dig': 'Colonización 50–100% más lenta; mayor riesgo de contaminación por exposición prolongada.', '→N': 'EB por debajo del potencial óptimo de la especie.', '→C': 'C:N alejado del ideal reduce la eficiencia biológica estimada.' };
    const OVERDIST_BY_ICON = { '↓C:N': flags.cnOverDist, '↑C:N': flags.cnOverDist, '↑N': flags.nOverDist, '↓N': flags.nOverDist, '↑pH': flags.phOverDist, '↓pH': flags.phOverDist };

    items.forEach(it => {
      if (!it.why && WHY_MAP[it.icon]) it.why = WHY_MAP[it.icon];
      if (!it.riskIfIgnored && RISK_MAP[it.icon]) it.riskIfIgnored = RISK_MAP[it.icon];
      const od = OVERDIST_BY_ICON[it.icon];
      if (od != null && od > 0 && it.riskIfIgnored) {
        it.riskIfIgnored += ` · desviación actual: ${Math.round(Math.min(150, od * 100))}% más allá del límite.`;
      }
    });

    const tr13 = calcTreatment(an, sKey, effectiveSPP);
    const { score, status: statusFromScore } = scoreAn(an, { treatment: tr13, recipe, stockIds, blendedEB });

    const SIDE_EFFECT_FLAGS = ['cnHigh', 'cnLow', 'nLow', 'nHigh', 'phLow', 'phHigh'];
    const FLAG_OWNER_ICON = { cnHigh: '↓C:N', cnLow: '↑C:N', nLow: '↑N', nHigh: '↓N', phLow: '↑pH', phHigh: '↓pH' };
    const FLAG_LABEL = { cnHigh: 'C:N demasiado alto', cnLow: 'C:N demasiado bajo', nLow: 'N insuficiente', nHigh: 'exceso de N', phLow: 'pH ácido', phHigh: 'pH alcalino' };
    const phIdealForCombo = sp.ph_optimal ? (sp.ph_optimal.min + sp.ph_optimal.max) / 2 : null;
    const FLAG_FIX = {
      cnHigh: () => ({ ing: bestStock(g => g.n >= 1.5 && g.role !== 'base_carbono', (a, b) => b.n - a.n), metric: 'cn', target: sp.cn_optimal.ideal }),
      cnLow: () => ({ ing: bestStock(g => g.cn > 60 && g.role === 'base_carbono', (a, b) => b.cn - a.cn), metric: 'cn', target: sp.cn_optimal.ideal }),
      nLow: () => ({ ing: bestStock(g => g.n >= 2 && g.role !== 'base_carbono', (a, b) => a.cost - b.cost), metric: 'n', target: sp.n_optimal.ideal }),
      nHigh: () => ({ ing: bestStock(g => g.cn > 80 && g.role === 'base_carbono', (a, b) => b.cn - a.cn), metric: 'n', target: sp.n_optimal.ideal }),
      phLow: () => ({ ing: bestStock(g => g.ph > 7.5, (a, b) => b.ph - a.ph), metric: 'ph', target: phIdealForCombo }),
      phHigh: () => ({ ing: bestStock(g => g.ph < 6 && g.n >= 0.5, (a, b) => a.ph - b.ph), metric: 'ph', target: phIdealForCombo }),
    };

    if (recipe && recipe.length) {
      items.forEach(it => {
        if (!it.apply || (it.priority !== 'critical' && it.priority !== 'warning')) return;
        try {
          const candidate = applyOptToRecipe(recipe, it.apply, lockedIds, effectiveINGS);
          const a2 = analyze(candidate, sKey, effectiveINGS, effectiveSPP);
          if (!a2) return;
          const s2 = scoreAn(a2, { treatment: calcTreatment(a2, sKey, effectiveSPP), recipe: candidate, stockIds });
          it.predictedScore = s2.score;
          const newFlags = SetasScoring.detectSeverity ? SetasScoring.detectSeverity(a2) || {} : {};
          const worsened = SIDE_EFFECT_FLAGS.filter(k => newFlags[k] && !flags[k] && FLAG_OWNER_ICON[k] !== it.icon);
          if (worsened.length) {
            it.sideEffect = `Ojo: aplicar esto puede generar ${worsened.map(k => FLAG_LABEL[k]).join(' y ')}.`;
            const fixKey = worsened[0];
            const fix = FLAG_FIX[fixKey] ? FLAG_FIX[fixKey]() : null;
            if (fix && fix.ing && fix.target != null) {
              const res2 = solveTargetPct(candidate, sKey, effectiveINGS, fix.ing.id, fix.metric, fix.target, lockedIds, effectiveSPP);
              if (res2) {
                const secondApply = { mode: 'set', id: fix.ing.id, value: res2.pct };
                const candidate2 = applyOptToRecipe(candidate, secondApply, lockedIds, effectiveINGS);
                const a3 = analyze(candidate2, sKey, effectiveINGS, effectiveSPP);
                if (a3) {
                  const s3 = scoreAn(a3, { treatment: calcTreatment(a3, sKey, effectiveSPP), recipe: candidate2, stockIds });
                  if (s3.score > it.predictedScore) {
                    it.comboApply = [it.apply, secondApply];
                    it.comboPredictedScore = s3.score;
                    it.comboLabel = `Aplicar junto con ${fix.ing.name} — evita ${FLAG_LABEL[fixKey]}`;
                  }
                }
              }
            }
          }
        } catch (e) { /* candidato inválido */ }
      });
    }

    const hasTips = items.some(s => s.priority === 'tip');
    if (score >= 85 && !hasTips && recipe && recipe.length) {
      const mineral = effectiveINGS.filter(g => g.role === 'aditivo_ph' && g.cs && g.cs.includes(sKey))[0];
      if (mineral && !recipe.find(r => r.id === mineral.id)) {
        items.push({
          priority: 'tip', icon: 'Ca',
          label: 'Afinar con mineral estabilizador',
          action: `Agregar <b>${mineral.name}</b> 1–2% · estabiliza pH durante toda la incubación`,
          effect: `Receta ya óptima · CaCO₃ amortigua la caída de pH por ácidos del micelio y reduce variabilidad lote-a-lote`,
          delta: 'pH estable +5% consistencia EB',
          apply: { mode: 'add', id: mineral.id, delta: 2 }
        });
      } else {
        items.push({
          priority: 'tip', icon: '$↓',
          label: 'Refinamiento de costo',
          action: 'Revisar si algún suplemento se puede sustituir por un residuo local más barato sin perder N',
          effect: `Receta dentro de óptimo · oportunidad es bajar costo manteniendo C:N y N`,
          delta: null, apply: null
        });
      }
    }

    if (stockIds && stockIds.size > 0) {
      items.forEach(it => {
        const apOps = Array.isArray(it.apply) ? it.apply : (it.apply ? [it.apply] : []);
        if (apOps.some(op => op.id && !stockIds.has(op.id))) it.notInStock = true;
      });
    }

    items.forEach(it => {
      if (it.apply && appliedIcons[it.icon] > 0) it.repeatedApply = appliedIcons[it.icon];
    });

    items.sort((a, b) => (b.predictedScore ?? -1) - (a.predictedScore ?? -1));
    return { score, status: statusFromScore, items };
  };

  // ── Costos energéticos de procesamiento ──
  const ENERGY_COST = {
    autoclave: { cop_per_kg_humedo: 187, kwh_per_kg: .234, detalle: 'Autoclave 3.5 kW · ciclo 90 min · 15 kg/ciclo · tarifa $800/kWh' },
    thermal: { cop_per_kg_humedo: 640, kwh_per_kg: .800, detalle: 'Resistencia + agua · 6–8 h · sostenida 65–75°C núcleo · tarifa $800/kWh' },
    cwlp: { cop_per_kg_humedo: 0, kwh_per_kg: 0, detalle: 'Cal en frío — sin consumo eléctrico significativo' },
  };

  const energyCostPerKgSeco = (col, sKey) => {
    const e = ENERGY_COST[col]; if (!e) return 0;
    const hFactor = ['shiitake', 'lions_mane', 'reishi', 'nameko'].includes(sKey) ? 0.40 : 0.35;
    return Math.round(e.cop_per_kg_humedo / hFactor);
  };

  const calcTreatment = (a, sKey, spp) => {
    if (!a) return null;
    const effectiveSPP = getEffectiveSPP(spp);
    const { suppP, manP, cafeP, avgN, trichoderma, dynSpawn } = a; const sp = effectiveSPP[sKey];
    let score = 0, reasons = [];
    if (trichoderma) { score += 3; reasons.push('⚠ Colapso Trichoderma — N crítico sin esterilización'); }
    if (suppP > (sp?.supplementation_max || 20)) { score += 2; reasons.push(`Supl ${suppP.toFixed(0)}% > máx`); }
    else if (suppP > 15) { score += 1; reasons.push('Supl alta'); }
    if (avgN > 2.5) { score += 2; reasons.push(`N ${avgN.toFixed(2)}%`); }
    else if (avgN > 1.8) { score += 1; reasons.push('N elevado'); }
    if (['shiitake', 'lions_mane', 'reishi', 'nameko'].includes(sKey)) { score += 2; reasons.push(`${sp?.name} requiere esterilización`); }
    if (manP > 20) { score += 1; reasons.push('Estiércol alto'); }
    if (cafeP > 0 && cafeP <= 30) { score -= .5; reasons.push('Café pre-pasteurizado'); }
    const spawn = dynSpawn || sp?.spawn_rate || 8;
    const ec = col => ({ ...ENERGY_COST[col], cop_per_kg_seco: energyCostPerKgSeco(col, sKey) });
    if (score >= 2) return { name: 'Esterilización en Autoclave', temp: '121°C / 18.5–19 PSI', time: '90–120 min', spawn, col: 'autoclave', reasons, prep: 'Empacar bolsas, esterilizar, enfriar 4–6h antes de inocular.', alt: '△ Tenjo (2.580 msnm): 15 PSI manométricos NO alcanzan 121°C reales a esta altitud — mantener 18.5–19 PSI manométricos constantes, o verificar con sensor de núcleo a 121°C real.', energy: ec('autoclave') };
    if (score >= .5) return { name: 'Pasteurización Térmica', temp: 'Núcleo 65–75°C', time: '6–8 h (base 5–6 h +25% altitud)', spawn, col: 'thermal', reasons, prep: 'Sumergir el sustrato y sostener el NÚCLEO entre 65–75°C de forma constante. Verificar con termómetro de pincho en el centro de la masa, no solo el agua.', alt: '△ Tenjo (2.580 msnm): el agua hierve a ~91°C, por lo que la transferencia de calor al núcleo es más lenta — se aplica un factor de +25% sobre el tiempo de receta estándar para garantizar pasteurización efectiva en el centro.', energy: ec('thermal') };
    return { name: 'CWLP — Cal en Frío', temp: 'Ambiente (~14°C Tenjo)', time: '18–24 h inmersión', spawn, col: 'cwlp', reasons, prep: '150–200 g cal / 100 L agua. Sumergir, escurrir, inocular.', alt: '△ Tenjo: CWLP funciona independiente de altitud. Verificar pH≥12 antes de sumergir.', energy: ec('cwlp') };
  };

  // ── Perfiles de optimización ──
  // Antes había un tercer perfil "premium" casi idéntico a "producción" (mismo suppLimit,
  // mismo espacio de combinaciones) — se fusionó porque no aportaba resultados distintos.
  const OPT_PROFILES = {
    rescate: { label: 'Rescate', maxSupp: 8, maxCafe: 8, forceLowRisk: true, spawnOverride: 20, description: 'Spón viejo, sustrato dudoso o primera prueba. Minimiza contaminación.', color: 'var(--accent-blue-grey)' },
    produccion: { label: 'Producción', maxSupp: null, maxCafe: 20, forceLowRisk: false, spawnOverride: null, description: 'Explora todo el espacio de recetas viables — EB, costo y estabilidad, sin recorte artificial.', color: 'var(--accent-olive)' },
  };

  const precioPonderado = (ingredienteId, lotes) => {
    if (!lotes || !lotes.length) return null;
    const active = lotes.filter(l => l && l.activo && l.ingredienteId === ingredienteId && (l.cantidadKgDisponible || 0) > 0);
    const totalKg = active.reduce((s, l) => s + l.cantidadKgDisponible, 0);
    if (!totalKg) return null;
    return active.reduce((s, l) => s + l.precioPorKgCOP * l.cantidadKgDisponible, 0) / totalKg;
  };

  // ── runAutoOptimizer — generador de recetas por enumeración combinatoria ──
  const runAutoOptimizer = (targetKey, invLotes = [], maxCost = 0, effectiveINGS = [], useStock = true, profileKey = 'produccion', stockMap = {}, spp = null) => {
    const ings = getEffectiveINGS(effectiveINGS);
    const effectiveSPP = getEffectiveSPP(spp);
    const sp = effectiveSPP[targetKey];
    if (!sp) return { results: [], noStock: false };
    const profile = OPT_PROFILES[profileKey] || OPT_PROFILES.produccion;
    const stockIds = new Set(invLotes.filter(l => l && l.activo && l.cantidadKgDisponible > 0).map(l => l.ingredienteId));
    const hasStock = stockIds.size > 0;
    if (useStock && !hasStock) return { results: [], noStock: true };
    const pool = useStock ? ings.filter(g => stockIds.has(g.id)) : ings.filter(g => g.cs && g.cs.includes(targetKey));
    const bases = pool.filter(g => g.role === 'base_carbono' && g.cs && g.cs.includes(targetKey) && g.cn > 0 && g.n > 0);
    const supps = pool.filter(g => (g.role === 'suplemento_n' || g.role === 'suplemento_medio') && g.cs && g.cs.includes(targetKey) && g.cn > 0 && g.n > 0);
    const aers = pool.filter(g => g.role === 'aireador');
    const calAvail = ings.some(g => g.id === 'carbonato_calcio');
    const yesoAvail = ings.some(g => g.id === 'yeso');
    const suppLimit = profile.maxSupp != null ? Math.min(sp.supplementation_max || 20, profile.maxSupp) : (sp.supplementation_max || 20);
    const cafeLimit = profile.maxCafe != null ? profile.maxCafe : 30;
    const results = [];
    const tried = new Set();

    const realCostFor = (rec) => {
      let known = false;
      const total = rec.reduce((s, r) => {
        const pp = precioPonderado(r.id, invLotes);
        const g = ings.find(i => i.id === r.id);
        if (pp != null) known = true;
        const price = pp != null ? pp : (g ? g.cost : 0);
        return s + price * (parseFloat(r.p) || 0) / 100;
      }, 0);
      return known ? Math.round(total) : null;
    };

    const evalRec = (rec) => {
      const an0 = analyze(rec, targetKey, ings, effectiveSPP);
      if (!an0) return;
      const realCost = useStock ? realCostFor(rec) : null;
      const an = realCost != null ? { ...an0, cost: realCost } : an0;
      if (profile.spawnOverride != null) an.dynSpawn = profile.spawnOverride;
      const suppOverLimit = an.suppP > suppLimit;
      if (suppOverLimit && profileKey === 'rescate') return;
      if (an.cafeP > cafeLimit) return;
      if (maxCost > 0 && an.cost > maxCost) return;
      const tr = calcTreatment(an, targetKey, effectiveSPP);
      const { score: resultScore, breakdown } = scoreAn(an, { treatment: tr, recipe: rec, stockIds: useStock ? stockIds : undefined });
      const maxKgWet = Object.keys(stockMap).length > 0 ? calcMaxBatchFromStock(rec, stockMap, 10, sp.moisture?.ideal || 65, ings) : null;
      results.push({ recipe: rec, an, score: resultScore, riskScore: breakdown ? breakdown.risk : 50, treatmentName: tr?.name || '', maxKgWet, suppOverLimit, realCostKnown: realCost != null });
    };

    const aerOpts = [null, ...aers.slice(0, 2)];
    const calOpts = calAvail ? [0, 3] : [0];
    const yesoOpts = yesoAvail ? [0, 2] : [0];

    // MODO 1: 1 base + 1 suplemento
    bases.forEach(base => {
      supps.forEach(supp => {
        if (base.id === supp.id) return;
        aerOpts.forEach(aer => {
          calOpts.forEach(calP => {
            yesoOpts.forEach(yesoP => {
              const aerP = aer ? 10 : 0; const fixedPct = calP + yesoP + aerP; const remaining = 100 - fixedPct;
              if (remaining < 40) return;
              const key = `1b1s|${base.id}|${supp.id}|${aer?.id || ''}|${calP}|${yesoP}`;
              if (tried.has(key)) return; tried.add(key);
              const T = sp.cn_optimal.ideal;
              const bDry1 = 1 - Math.min(0.92, Math.max(0, (base.moisture || 0) / 100));
              const sDry1 = 1 - Math.min(0.92, Math.max(0, (supp.moisture || 0) / 100));
              const bCe1 = base.c * bDry1, bNe1 = base.n * bDry1, sCe1 = supp.c * sDry1, sNe1 = supp.n * sDry1;
              const denom = (bCe1 - sCe1) - T * (bNe1 - sNe1);
              if (Math.abs(denom) < 0.001) return;
              const ps = remaining * (bCe1 - T * bNe1) / denom; const pb = remaining - ps;
              if (ps < 2 || pb < 15 || ps > suppLimit || pb > 95) return;
              const rec = [{ id: base.id, p: Math.round(pb * 10) / 10 }, { id: supp.id, p: Math.round(ps * 10) / 10 }];
              if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
              if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
              if (aer) rec.push({ id: aer.id, p: aerP });
              evalRec(rec);
            });
          });
        });
      });
    });

    // MODO 2: 2 bases + 1 suplemento
    for (let bi = 0; bi < bases.length; bi++) {
      for (let bj = bi + 1; bj < bases.length; bj++) {
        const b1 = bases[bi], b2 = bases[bj];
        supps.forEach(supp => {
          if (b1.id === supp.id || b2.id === supp.id) return;
          aerOpts.forEach(aer => {
            const aerP = aer ? 10 : 0, calP = calAvail ? 3 : 0, yesoP = yesoAvail ? 2 : 0;
            const fixedPct = calP + yesoP + aerP; const remaining = 100 - fixedPct;
            if (remaining < 40) return;
            [[0.5, 0.5], [0.6, 0.4], [0.4, 0.6]].forEach(([f1, f2]) => {
              const key = `2b1s|${b1.id}|${b2.id}|${supp.id}|${aer?.id || ''}|${f1}`;
              if (tried.has(key)) return; tried.add(key);
              const b1Dry2 = 1 - Math.min(0.92, Math.max(0, (b1.moisture || 0) / 100));
              const b2Dry2 = 1 - Math.min(0.92, Math.max(0, (b2.moisture || 0) / 100));
              const sDry2 = 1 - Math.min(0.92, Math.max(0, (supp.moisture || 0) / 100));
              const cBlend = b1.c * b1Dry2 * f1 + b2.c * b2Dry2 * f2, nBlend = b1.n * b1Dry2 * f1 + b2.n * b2Dry2 * f2;
              const sCe2 = supp.c * sDry2, sNe2 = supp.n * sDry2, T = sp.cn_optimal.ideal;
              const denom = (cBlend - sCe2) - T * (nBlend - sNe2);
              if (Math.abs(denom) < 0.001) return;
              const ps = remaining * (cBlend - T * nBlend) / denom; const pb = remaining - ps;
              if (ps < 2 || pb < 15 || ps > suppLimit || pb > 95) return;
              const rec = [{ id: b1.id, p: Math.round(pb * f1 * 10) / 10 }, { id: b2.id, p: Math.round(pb * f2 * 10) / 10 }, { id: supp.id, p: Math.round(ps * 10) / 10 }];
              if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
              if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
              if (aer) rec.push({ id: aer.id, p: aerP });
              evalRec(rec);
            });
          });
        });
      }
    }

    // MODO 3: 1 base + 2 suplementos
    const suppSplits = [[0.6, 0.4], [0.5, 0.5]];
    bases.forEach(base => {
      for (let i = 0; i < supps.length; i++) {
        for (let j = i + 1; j < supps.length; j++) {
          const s1 = supps[i], s2 = supps[j];
          if (base.id === s1.id || base.id === s2.id) continue;
          aerOpts.forEach(aer => {
            const aerP = aer ? 10 : 0; const calP = calAvail ? 3 : 0; const yesoP = yesoAvail ? 2 : 0;
            const fixedPct = calP + yesoP + aerP; const remaining = 100 - fixedPct;
            if (remaining < 35) return;
            suppSplits.forEach(([f1, f2]) => {
              const key = `1b2s|${base.id}|${s1.id}|${s2.id}|${aer?.id || ''}|${f1}`;
              if (tried.has(key)) return;
              tried.add(key);
              const bDry3 = 1 - Math.min(0.92, Math.max(0, (base.moisture || 0) / 100));
              const s1Dry3 = 1 - Math.min(0.92, Math.max(0, (s1.moisture || 0) / 100));
              const s2Dry3 = 1 - Math.min(0.92, Math.max(0, (s2.moisture || 0) / 100));
              const cBlend = s1.c * s1Dry3 * f1 + s2.c * s2Dry3 * f2;
              const nBlend = s1.n * s1Dry3 * f1 + s2.n * s2Dry3 * f2;
              const T = sp.cn_optimal.ideal;
              const cb = base.c * bDry3, nb = base.n * bDry3;
              const denom = (cb - cBlend) - T * (nb - nBlend);
              if (Math.abs(denom) < 0.001) return;
              const psTotal = remaining * (cb - T * nb) / denom;
              const pb = remaining - psTotal;
              if (psTotal < 4 || psTotal > suppLimit || pb < 20 || pb > 85) return;
              const ps1 = Math.round(psTotal * f1 * 10) / 10;
              const ps2 = Math.round(psTotal * f2 * 10) / 10;
              const rec = [{ id: base.id, p: Math.round(pb * 10) / 10 }, { id: s1.id, p: ps1 }, { id: s2.id, p: ps2 }];
              if (calP > 0) rec.push({ id: 'carbonato_calcio', p: calP });
              if (yesoP > 0) rec.push({ id: 'yeso', p: yesoP });
              if (aer) rec.push({ id: aer.id, p: aerP });
              evalRec(rec);
            });
          });
        }
      }
    });

    const filteredResults = profile.forceLowRisk
      ? (() => { const hi = results.filter(r => r.riskScore >= 30); return hi.length > 0 ? hi : results; })()
      : results;

    // Dedup por composición real (ids + % redondeado al entero), no por score/cn/costo —
    // ese bucketing colapsaba recetas con ingredientes distintos que caían en el mismo rango.
    const seen = new Set();
    const deduped = filteredResults.sort((a, b) => b.score - a.score)
      .filter(r => {
        const k = r.recipe.map(i => `${i.id}:${Math.round(parseFloat(i.p) || 0)}`).sort().join('|');
        if (seen.has(k)) return false; seen.add(k); return true;
      });

    // Diversidad estructural: sin esto, el top-30 quedaba dominado por 1-2 pares de
    // ingredientes base que puntúan mejor, repetidos con variantes triviales de un solo
    // suplemento distinto (el resto del score apenas se mueve). Se agrupa por la identidad
    // de los ingredientes base_carbono de cada receta y se limita cuántos resultados puede
    // aportar un mismo grupo en la primera pasada; si sobra espacio en el límite de 30, se
    // rellena con lo que quede (mejor score primero) para no acortar la lista cuando la
    // especie/catálogo realmente no ofrece más variedad estructural.
    const roleById = new Map(ings.map(g => [g.id, g.role]));
    const groupKeyFor = rec => rec.filter(i => roleById.get(i.id) === 'base_carbono').map(i => i.id).sort().join('+') || 'sin_base';
    const RESULT_LIMIT = 30;
    const PER_GROUP_CAP = 3;
    const groupCounts = new Map();
    const diverse = [];
    const leftovers = [];
    deduped.forEach(r => {
      const k = groupKeyFor(r.recipe);
      const count = groupCounts.get(k) || 0;
      if (count < PER_GROUP_CAP) { groupCounts.set(k, count + 1); diverse.push(r); }
      else leftovers.push(r);
    });
    const top = diverse.concat(leftovers).slice(0, RESULT_LIMIT).sort((a, b) => b.score - a.score);
    const diag = {
      stockIds: stockIds.size,
      poolSize: pool.length,
      bases: bases.length,
      supps: supps.length,
      aers: aers.length,
      tried: tried.size,
      resultsRaw: results.length,
      suppLimit,
      profileKey,
      targetKey,
      baseNames: bases.map(g => g.name),
      suppNames: supps.map(g => g.name),
    };
    return { results: top, noStock: false, stockCount: stockIds.size, diag };
  };

  const api = {
    analyze,
    setPctProportional,
    solveTargetPct,
    normalizeRecipe,
    capFreeIngredient,
    ROLE_CAP_ADD,
    ROLE_CAP_INCREASE,
    capForRole,
    applyOptToRecipe,
    calcMaxBatchFromStock,
    quantifyItem,
    generateOptimizer,
    ENERGY_COST,
    energyCostPerKgSeco,
    calcTreatment,
    OPT_PROFILES,
    precioPonderado,
    runAutoOptimizer,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasRecipeOptimizer = api;

})();
