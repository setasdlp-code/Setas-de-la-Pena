'use strict';

// Objetivos de formulación por especie × clase de sustrato × tratamiento.
// Base de cálculo: mezcla completa, base seca, sin aditivos de pH/estructura
// (la misma cantidad que calcula analyze()). Todo campo sin registro con fuente
// se deriva del SPP heredado y queda marcado legacy_unverified (ADR-0006).
(function initSpeciesTargets() {
const BASIS = 'mix_dry_excl_additives';
const SUPPLEMENTED_MIN_PCT = 2;
const SUPPLEMENT_WEIGHT = { suplemento_n: 1, suplemento_medio: 0.6 };
const HARDWOOD_IDS = new Set(['aserrin_roble', 'aserrin_alamo', 'aserrin_eucalipto']);

const CITATIONS = {
  li2024: { authors: 'Li et al.', year: 2024, title: 'Ginkgo leaf powder in Pleurotus eryngii cultivation (Life)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11123215/' },
  bellettini2019: { authors: 'Bellettini et al.', year: 2019, title: 'Factors affecting mushroom Pleurotus spp. (Saudi J Biol Sci)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6486501/' },
  han2024: { authors: 'Han et al.', year: 2024, title: 'Effects of C/N ratios on Flammulina velutipes (Life)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11122278/' },
  kb_ganoderma: { authors: 'knowledge_base', year: 2026, title: 'knowledge_base/01_species/ganoderma_lucidum.md', url: null },
};

const lit = (range, citations, tier, note) => ({ ...range, source: 'literature', citations, tier, ...(note ? { note } : {}) });
const kb = (range, citation) => ({ ...range, source: 'kb', citations: [citation], tier: 'low' });

const OSTREATUS_CLASSES = {
  straw_unsupplemented: {
    treatmentClass: 'any',
    cn: lit({ min: 50, max: 100, ideal: 80 }, ['bellettini2019'], 'medium'),
    nPct: lit({ min: 0.4, max: 1.5, ideal: 0.7 }, ['bellettini2019'], 'low', 'N típico de paja sin suplementar; inhibición micelial > 1.5%'),
  },
  bag_supplemented: {
    treatmentClass: 'any',
    cn: lit({ min: 25, max: 50, ideal: 35 }, ['bellettini2019'], 'medium'),
    nPct: lit({ min: 0.8, max: 1.5, ideal: 1.2 }, ['bellettini2019'], 'low', 'inhibición micelial > 1.5% base seca'),
  },
};

const TABLE = {
  p_eryngii: {
    defaultClass: 'bag_supplemented',
    classes: {
      bag_supplemented: {
        treatmentClass: 'any',
        cn: lit({ min: 25, max: 40, ideal: 28 }, ['li2024'], 'medium'),
        nPct: lit({ min: 1.2, max: 1.8, ideal: 1.7 }, ['li2024'], 'medium'),
        moisture: lit({ min: 63, max: 68, ideal: 65 }, ['bellettini2019', 'li2024'], 'medium'),
        supplementationMaxPct: lit({ value: 55 }, ['li2024'], 'medium'),
      },
    },
  },
  p_ostreatus_gris: { defaultClass: 'bag_supplemented', classes: OSTREATUS_CLASSES },
  p_ostreatus_blanco: { defaultClass: 'bag_supplemented', classes: OSTREATUS_CLASSES },
  enoki: { common: { cn: lit({ min: 25, max: 40, ideal: 27 }, ['han2024'], 'high') } },
  reishi: { common: { ph: kb({ min: 4.2, max: 5.3 }, 'kb_ganoderma'), moisture: kb({ min: 65, max: 70, ideal: 67 }, 'kb_ganoderma') } },
};

const legacyField = fields => ({ ...fields, source: 'legacy_unverified', citations: [], tier: 'unverified' });

const legacyTargets = sp => ({
  cn: legacyField({ min: sp.cn_optimal?.min, max: sp.cn_optimal?.max, ideal: sp.cn_optimal?.ideal }),
  nPct: legacyField({ min: sp.n_optimal?.min, max: sp.n_optimal?.max, ideal: sp.n_optimal?.ideal }),
  ph: legacyField({ min: sp.ph_optimal?.min, max: sp.ph_optimal?.max }),
  moisture: legacyField({ ideal: sp.moisture?.ideal, min: sp.moisture?.min ?? null, max: sp.moisture?.max ?? null }),
  supplementationMaxPct: legacyField({ value: sp.supplementation_max }),
  eb: legacyField({ baseline: sp.eb_baseline, optimal: sp.eb_optimal }),
});

const FIELDS = ['cn', 'nPct', 'ph', 'moisture', 'supplementationMaxPct', 'eb'];

function classifySubstrate(recipe = [], ings = []) {
  if (!Array.isArray(recipe) || recipe.length === 0) return null;
  const byId = new Map((ings || []).map(i => [i.id, i]));
  let supp = 0, base = 0, hardwood = 0;
  for (const r of recipe) {
    const g = byId.get(r.id);
    if (!g) continue;
    const p = parseFloat(r.p ?? r.pct) || 0;
    supp += p * (SUPPLEMENT_WEIGHT[g.role] || 0);
    if (g.role === 'base_carbono') {
      base += p;
      if (HARDWOOD_IDS.has(g.id)) hardwood += p;
    }
  }
  if (supp >= SUPPLEMENTED_MIN_PCT) return 'bag_supplemented';
  if (base > 0 && hardwood / base > 0.5) return 'hardwood_block';
  return 'straw_unsupplemented';
}

function resolveTargets({ speciesId, substrateClass = null, treatmentClass = 'any', legacySpp } = {}) {
  const sp = legacySpp && legacySpp[speciesId];
  if (!sp) return null;
  const entry = TABLE[speciesId] || {};
  const classes = entry.classes || {};
  const matches = rec => rec && (rec.treatmentClass === 'any' || rec.treatmentClass === treatmentClass);
  const exact = substrateClass && matches(classes[substrateClass]) ? classes[substrateClass] : null;
  const resolvedClass = exact ? substrateClass : (entry.defaultClass && matches(classes[entry.defaultClass]) ? entry.defaultClass : null);
  const classRecord = resolvedClass ? classes[resolvedClass] : {};
  const out = {
    speciesId, substrateClass, treatmentClass, resolvedClass,
    basis: BASIS,
    fallback: !exact,
  };
  const legacy = legacyTargets(sp);
  for (const f of FIELDS) out[f] = classRecord[f] || (entry.common && entry.common[f]) || legacy[f];
  return out;
}

function toSppEntry(legacyEntry, resolved) {
  if (!legacyEntry || !resolved) return legacyEntry;
  const m = resolved.moisture;
  return {
    ...legacyEntry,
    cn_optimal: { min: resolved.cn.min, max: resolved.cn.max, ideal: resolved.cn.ideal },
    n_optimal: { min: resolved.nPct.min, max: resolved.nPct.max, ideal: resolved.nPct.ideal },
    ph_optimal: { min: resolved.ph.min, max: resolved.ph.max },
    moisture: { ideal: m.ideal, ...(m.min != null ? { min: m.min } : {}), ...(m.max != null ? { max: m.max } : {}) },
    supplementation_max: resolved.supplementationMaxPct.value,
    eb_baseline: resolved.eb.baseline,
    eb_optimal: resolved.eb.optimal,
    targets: resolved,
  };
}

function applyToSpp(spp, speciesId, recipe, ings, treatmentClass = 'any') {
  if (!spp || !spp[speciesId]) return spp;
  const resolved = resolveTargets({ speciesId, substrateClass: classifySubstrate(recipe, ings), treatmentClass, legacySpp: spp });
  return { ...spp, [speciesId]: toSppEntry(spp[speciesId], resolved) };
}

const api = { BASIS, SUPPLEMENTED_MIN_PCT, CITATIONS, classifySubstrate, resolveTargets, toSppEntry, applyToSpp };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasSpeciesTargets = api;
}
})();
