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

function compositionShares(recipe = [], ings = []) {
  const byId = new Map((ings || []).map(i => [i.id, i]));
  let supp = 0, base = 0, hardwood = 0, medium = 0;
  for (const r of recipe) {
    const g = byId.get(r.id);
    if (!g) continue;
    const p = parseFloat(r.p ?? r.pct) || 0;
    supp += p * (SUPPLEMENT_WEIGHT[g.role] || 0);
    if (g.role === 'suplemento_medio' && p > 0) medium += p;
    if (g.role === 'base_carbono') {
      base += p;
      if (HARDWOOD_IDS.has(g.id)) hardwood += p;
    }
  }
  return { supp, base, hardwood, medium };
}

const unsupplementedClass = ({ base, hardwood }) => (base > 0 && hardwood / base > 0.5 ? 'hardwood_block' : 'straw_unsupplemented');

function classifySubstrate(recipe = [], ings = []) {
  if (!Array.isArray(recipe) || recipe.length === 0) return null;
  const shares = compositionShares(recipe, ings);
  if (shares.supp >= SUPPLEMENTED_MIN_PCT) return 'bag_supplemented';
  return unsupplementedClass(shares);
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

// Etiqueta de procedencia de un campo resuelto (ADR-0006): un valor heredado
// sin verificar nunca se presenta como sourced, y un valor con fuente tomado de
// la clase por defecto (fallback: la clase de sustrato real no tiene registro)
// se presenta como objetivo genérico, no como objetivo con fuente.
function targetSourceLabel(targets, field) {
  const rec = targets && targets[field];
  if (!rec) return null;
  if (rec.source === 'legacy_unverified') return 'Objetivo heredado';
  if (targets.fallback === true) return 'Objetivo genérico';
  return 'Objetivo con fuente';
}

// ── Descripción legible de la clase de sustrato ──
// La clase decide qué rangos objetivo se usan, y cruzar el umbral de
// suplementación los cambia de golpe (en orellana, C:N 50–100 → 25–50). Estas
// funciones no clasifican distinto ni alteran ningún rango: solo describen la
// clase vigente, la del otro lado del umbral y el cambio que produce un
// ajuste, para que el Perito lo diga en vez de dejar un salto sin explicar.
const CLASS_LABELS = {
  straw_unsupplemented: 'paja sin suplementar',
  bag_supplemented: 'bolsa suplementada',
  hardwood_block: 'bloque de madera dura',
};
// Banda de AVISO de interfaz alrededor del umbral (puntos porcentuales). No es
// un objetivo agronómico ni tiene fuente: solo decide cuándo advertir que la
// receta está cerca de cambiar de clase.
const THRESHOLD_NOTICE_BAND_PP = 1;

const classLabel = cls => CLASS_LABELS[cls] || cls || null;

function citationText(rec) {
  if (!rec || !Array.isArray(rec.citations) || !rec.citations.length) return null;
  return rec.citations.map(id => {
    const c = CITATIONS[id];
    return c ? `${c.authors} ${c.year}` : id;
  }).join('; ');
}

const pickRange = rec => (rec ? { min: rec.min, max: rec.max, ideal: rec.ideal, source: rec.source, tier: rec.tier, citation: citationText(rec) } : null);

// Objetivos de una clase tal como los usa el modelo. null cuando la especie no
// tiene registros por clase (todo heredado o común): ahí el umbral no cambia
// ningún objetivo y no hay nada que explicar.
function classTargetsSummary(resolved) {
  if (!resolved || !resolved.resolvedClass) return null;
  return {
    substrateClass: resolved.substrateClass,
    resolvedClass: resolved.resolvedClass,
    label: classLabel(resolved.resolvedClass),
    substrateLabel: classLabel(resolved.substrateClass),
    fallback: resolved.fallback === true,
    cn: pickRange(resolved.cn),
    nPct: pickRange(resolved.nPct),
  };
}

function describeSubstrateClass({ speciesId, recipe, ings, legacySpp, treatmentClass = 'any' } = {}) {
  if (!Array.isArray(recipe) || !recipe.length) return null;
  const shares = compositionShares(recipe, ings);
  const substrateClass = classifySubstrate(recipe, ings);
  const current = classTargetsSummary(resolveTargets({ speciesId, substrateClass, treatmentClass, legacySpp }));
  if (!current) return null;
  const above = shares.supp >= SUPPLEMENTED_MIN_PCT;
  const otherClass = above ? unsupplementedClass(shares) : 'bag_supplemented';
  const other = classTargetsSummary(resolveTargets({ speciesId, substrateClass: otherClass, treatmentClass, legacySpp }));
  const alternative = other && other.resolvedClass !== current.resolvedClass
    ? { ...other, direction: above ? 'below' : 'above' }
    : null;
  const distancePp = Math.abs(shares.supp - SUPPLEMENTED_MIN_PCT);
  return {
    ...current,
    supplementPct: Math.round(shares.supp * 10) / 10,
    hasMediumSupplement: shares.medium > 0,
    thresholdPct: SUPPLEMENTED_MIN_PCT,
    distancePp: Math.round(distancePp * 10) / 10,
    nearThreshold: !!alternative && distancePp <= THRESHOLD_NOTICE_BAND_PP,
    alternative,
  };
}

// Cambio de clase entre dos objetivos resueltos (p. ej. receta actual y la que
// deja una sugerencia). null si la clase que fija los rangos no cambia.
function describeClassChange(fromTargets, toTargets) {
  const from = classTargetsSummary(fromTargets);
  const to = classTargetsSummary(toTargets);
  if (!from || !to || from.resolvedClass === to.resolvedClass) return null;
  return { from, to };
}

const api = {
  BASIS, SUPPLEMENTED_MIN_PCT, THRESHOLD_NOTICE_BAND_PP, CITATIONS, CLASS_LABELS,
  classifySubstrate, resolveTargets, toSppEntry, applyToSpp, targetSourceLabel,
  describeSubstrateClass, describeClassChange,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasSpeciesTargets = api;
}
})();
