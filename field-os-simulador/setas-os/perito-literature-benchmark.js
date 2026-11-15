#!/usr/bin/env node
'use strict';
// Benchmark EXPLORATORIO del Perito contra EB publicadas (literature-eb-benchmark.json).
//
// Qué es: compara la predicción de EB de la versión actual del modelo y de
// variantes nombradas (hipótesis H-A, H-B) aplicadas en memoria, contra EB que
// reporta la literatura. Reporta por tratamiento y por estudio, y comprueba
// límites de deterioro fijados antes de evaluar.
//
// Qué NO es: validación. Son pocos tratamientos de pocos estudios, con cepas,
// procesos y denominadores distintos a los de Tenjo. No lee ni escribe
// ground-truth-fixtures.json y no satisface la compuerta perito:regression.
// Ninguna variante cambia producción: se evalúan sobre copias en memoria.
//
// Uso: node perito-literature-benchmark.js [--file=<ruta>] [--json] [--allow-skipped]
//
// Salida: 0 evaluado · 1 benchmark ausente, vacío o inválido · 2 error de
// operación · 3 entradas no evaluables o resultados no finitos (salvo --allow-skipped).

const fs = require('node:fs');
const path = require('node:path');
const catalog = require('./substrate-catalog.js');
const { analyze } = require('./substrate-analysis.js');
const scoring = require('./scoring.js');
const { evaluateFixture } = require('./ground-truth-regression.js');

const EXIT = { OK: 0, NO_BENCHMARK: 1, OPERATIONAL: 2, DIRTY: 3 };
const HEADER = 'Benchmark exploratorio de literatura. No valida ni aprueba cambios.';
// Límites fijados antes de evaluar (diseño 2026-11-12, rev. 2 §5.3).
const LIMITS = { maxTreatmentWorseningEB: 5, maxOtherSpeciesPresetShiftEB: 5 };

// Material denso que no es madera: una exención de aireación "solo madera" no
// aplica si la receta contiene alguno (espejo de DENSOS en substrate-analysis.js).
const NON_WOOD_DENSE = ['borra_cafe', 'afrecho_cerveceria', 'chips_poda_urbana', 'guadua', 'carton_corrugado', 'pulpa_papel'];
const isWood = (id) => /^aserrin_/.test(id) || /^pellets_/.test(id);

const withOak = (ings) => ings.map((g) => (g.id === 'aserrin_roble' ? { ...g, c: 53.8, n: 0.48, cn: 53.8 / 0.48 } : g));

// Cada variante devuelve el análisis que produciría; nada se escribe en el catálogo.
const VARIANTS = {
  actual: { label: 'Versión actual', analyze: (recipe, sKey, ings) => analyze(recipe, sKey, ings) },
  'H-A': {
    label: 'H-A: sin castigo de aireación para shiitake en madera',
    analyze: (recipe, sKey, ings) => {
      const an = analyze(recipe, sKey, ings);
      if (!an || sKey !== 'shiitake') return an;
      const ids = recipe.filter((r) => Number(r.p) > 0).map((r) => r.id);
      const woodOnly = ids.some(isWood) && !ids.some((id) => NON_WOOD_DENSE.includes(id));
      const aerF = an.ebMods?.aerF;
      if (!woodOnly || !(aerF > 0) || aerF >= 1) return an;
      return { ...an, eb: an.eb / aerF, ebMods: { ...an.ebMods, aerF: 1 } };
    },
  },
  'H-B': { label: 'H-B: roble con C 53,8 % y N 0,48 % (El Sebaaly 2024)', analyze: (recipe, sKey, ings) => analyze(recipe, sKey, withOak(ings)) },
};
VARIANTS['H-A+H-B'] = {
  label: 'H-A + H-B',
  analyze: (recipe, sKey, ings) => VARIANTS['H-A'].analyze(recipe, sKey, withOak(ings)),
};

// La banda que ve el usuario (recipeEBForecast sin historial), no la de analyze().
const visibleBand = (an) => scoring.scoreRecipe(an, { historyCalibration: null, __bridgeRecompute: true }).uncertainty.eb;

const parseArgs = (argv) => {
  const opts = { file: path.join(__dirname, 'literature-eb-benchmark.json'), json: false, allowSkipped: false };
  for (const a of argv) {
    if (a.startsWith('--file=')) opts.file = path.resolve(a.slice(7));
    else if (a === '--json') opts.json = true;
    else if (a === '--allow-skipped') opts.allowSkipped = true;
    else throw new Error(`Argumento desconocido: ${a}`);
  }
  return opts;
};

const loadBenchmark = (file) => {
  if (!fs.existsSync(file)) return { error: 'benchmark ausente' };
  let raw;
  try { raw = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return { error: 'JSON inválido' }; }
  const entries = Array.isArray(raw?.entries) ? raw.entries : null;
  if (!entries || !entries.length) return { error: 'benchmark vacío' };
  return { entries };
};

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

const evaluateVariant = (key, entries, ings) => {
  const v = VARIANTS[key];
  const rows = [];
  const unevaluable = [];
  for (const e of entries) {
    if (!e.useInMetrics) continue;
    const known = e.recipe.every((r) => ings.some((g) => g.id === r.id)) && catalog.SPP[e.sKey];
    // Adaptador explícito y en memoria: ebReported → ebReal, solo para reutilizar evaluateFixture.
    const r = known ? evaluateFixture({ ...e, ebReal: e.ebReported }, {
      analyzeFn: (f) => v.analyze(f.recipe, f.sKey, ings),
      scoreFn: (an) => visibleBand(an),
    }) : { error: 'ingrediente-o-especie-desconocida' };
    if (r.error || !Number.isFinite(r.predictedEB) || !Number.isFinite(r.absErrorEB)) {
      unevaluable.push({ id: e.id, reason: r.error || 'resultado-no-finito' });
      continue;
    }
    const an = v.analyze(e.recipe, e.sKey, ings);
    const band = visibleBand(an);
    rows.push({ id: e.id, study: e.study, reported: e.ebReported, predicted: r.predictedEB, error: r.absErrorEB,
      band: { low: band.low, high: band.high }, inBand: e.ebReported >= band.low && e.ebReported <= band.high });
  }
  const byStudy = {};
  rows.forEach((r) => { (byStudy[r.study] = byStudy[r.study] || []).push(r.error); });
  return {
    key, label: v.label, rows, unevaluable,
    meanAbsErrorEB: mean(rows.map((r) => r.error)),
    maxAbsErrorEB: rows.length ? Math.max(...rows.map((r) => r.error)) : null,
    inBand: rows.filter((r) => r.inBand).length,
    byStudy: Object.fromEntries(Object.entries(byStudy).map(([k, xs]) => [k, { n: xs.length, meanAbsErrorEB: mean(xs) }])),
  };
};

// Presets de otras especies: cuánto movería su EB cada variante (H-B toca un insumo compartido).
const presetShifts = (key, ings) => Object.entries(catalog.PRESETS)
  .filter(([, p]) => p.s !== 'shiitake')
  .map(([id, p]) => {
    const before = analyze(p.i, p.s, ings);
    const after = VARIANTS[key].analyze(p.i, p.s, ings);
    return before && after ? { id, sKey: p.s, before: before.eb, after: after.eb, delta: after.eb - before.eb } : null;
  })
  .filter((x) => x && Math.abs(x.delta) > 1e-9);

const run = (opts) => {
  const loaded = loadBenchmark(opts.file);
  if (loaded.error) return { exit: EXIT.NO_BENCHMARK, error: loaded.error };
  const ings = catalog.INGS;
  const variants = Object.keys(VARIANTS).map((k) => evaluateVariant(k, loaded.entries, ings));
  const base = variants[0];
  variants.forEach((v) => {
    const worse = v.rows.map((r) => {
      const b = base.rows.find((x) => x.id === r.id);
      return b ? { id: r.id, delta: r.error - b.error } : null;
    }).filter((x) => x && x.delta > LIMITS.maxTreatmentWorseningEB);
    const shifts = presetShifts(v.key, ings);
    const bigShifts = shifts.filter((s) => Math.abs(s.delta) > LIMITS.maxOtherSpeciesPresetShiftEB);
    v.limits = { treatmentsWorsened: worse, otherSpeciesPresetShifts: shifts, presetShiftsOverLimit: bigShifts,
      withinLimits: !worse.length && !bigShifts.length };
  });
  const excluded = loaded.entries.filter((e) => !e.useInMetrics).map((e) => ({ id: e.id, reason: e.excludedReason || 'useInMetrics=false' }));
  const unevaluable = base.unevaluable;
  const dirty = unevaluable.length > 0 || !base.rows.length;
  return {
    exit: dirty && !opts.allowSkipped ? EXIT.DIRTY : EXIT.OK,
    header: HEADER, limits: LIMITS, excluded, unevaluable, variants,
  };
};

const f1 = (x) => (x == null ? '—' : x.toFixed(1));
const render = (out) => {
  const lines = [out.header, ''];
  for (const v of out.variants) {
    lines.push(`${v.label}`);
    lines.push(`  error medio ${f1(v.meanAbsErrorEB)} · máximo ${f1(v.maxAbsErrorEB)} · dentro de la banda visible ${v.inBand}/${v.rows.length}`);
    for (const r of v.rows) lines.push(`    ${r.id}: publicada ${r.reported} · predicha ${f1(r.predicted)} (${r.band.low}–${r.band.high}) · error ${f1(r.error)}`);
    for (const [s, x] of Object.entries(v.byStudy)) lines.push(`    estudio ${s}: n=${x.n} · error medio ${f1(x.meanAbsErrorEB)}`);
    const l = v.limits;
    if (l.treatmentsWorsened.length) lines.push(`    empeora > ${out.limits.maxTreatmentWorseningEB} pts: ${l.treatmentsWorsened.map((x) => `${x.id} (+${f1(x.delta)})`).join(', ')}`);
    if (l.otherSpeciesPresetShifts.length) lines.push(`    mueve presets de otras especies: ${l.otherSpeciesPresetShifts.map((x) => `${x.id} ${x.delta >= 0 ? '+' : ''}${f1(x.delta)}`).join(', ')}`);
    lines.push(`    dentro de los límites fijados: ${l.withinLimits ? 'sí' : 'no'}`);
    lines.push('');
  }
  if (out.excluded.length) lines.push(`Excluidas de las métricas (declarado): ${out.excluded.map((x) => `${x.id} — ${x.reason}`).join('; ')}`);
  if (out.unevaluable.length) lines.push(`NO EVALUABLES: ${out.unevaluable.map((x) => `${x.id} (${x.reason})`).join(', ')}`);
  return lines.join('\n');
};

if (require.main === module) {
  let out;
  try { out = run(parseArgs(process.argv.slice(2))); } catch (e) { console.error(e.message); process.exit(EXIT.OPERATIONAL); }
  if (out.error) { console.error(`${HEADER}\n${out.error} — nada que comparar.`); process.exit(out.exit); }
  const opts = parseArgs(process.argv.slice(2));
  console.log(opts.json ? JSON.stringify(out, null, 2) : render(out));
  process.exit(out.exit);
}

module.exports = { run, render, loadBenchmark, VARIANTS, LIMITS, EXIT, HEADER };
