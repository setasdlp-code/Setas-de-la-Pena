#!/usr/bin/env node
'use strict';
// Reporte de deriva del modelo sobre recetas de referencia.
//
// Corre las recetas PRESETS de substrate-catalog.js por analyze()+scoreRecipe()
// del árbol de trabajo y de una revisión base, y lista qué cambió en EB
// predicha, C:N, score y status.
//
// ESTO NO ES VALIDACIÓN. Las recetas de referencia no tienen EB medida: el
// reporte dice que la salida del modelo se movió, no si ahora acierta más o
// menos. La validación contra lotes reales es perito-regression-report.js y
// sigue saliendo con código 1 mientras no exista ground-truth-fixtures.json.
// Sirve para que un cambio al catálogo, a analyze() o a scoring.js llegue al PR
// con su efecto a la vista en vez de pasar como un no-op aparente.
//
// Las dos corridas usan las mismas recetas (las del árbol de trabajo); cada una
// usa su propio catálogo SPP/INGS, su analyze() y su scoring. Así un cambio de
// composición de un ingrediente también aparece como deriva.
//
// Uso:
//   node perito-drift-report.js [--baseline=<rev>] [--fail-on-drift] [--json]
//
// Códigos de salida:
//   0  reporte emitido (haya o no deriva)
//   2  hubo deriva y se pidió --fail-on-drift
//   4  error de operación (revisión base rota, catálogo no cargable)

const path = require('node:path');
const {
  loadProductionCatalog, loadProductionAnalyze, materializeBaseline, resolveRev,
} = require('./perito-regression-report.js');

const HERE = __dirname;
const EXIT = { OK: 0, DRIFT: 2, OPERATIONAL: 4 };
const NOT_VALIDATION = 'Deriva sobre recetas de referencia. No es validación: ninguna tiene EB medida.';

const parseArgs = (argv) => {
  const opts = { baseline: 'HEAD~1', failOnDrift: false, json: false };
  argv.forEach((arg) => {
    const [flag, ...rest] = arg.split('=');
    const value = rest.join('=');
    switch (flag) {
      case '--baseline': opts.baseline = value; break;
      case '--fail-on-drift': opts.failOnDrift = true; break;
      case '--json': opts.json = true; break;
      case '--help': case '-h': opts.help = true; break;
      default: opts.unknown = (opts.unknown || []).concat(arg);
    }
  });
  return opts;
};

const loadReferenceRecipes = (dir) => {
  const { PRESETS } = require(path.join(dir, 'substrate-catalog.js'));
  const keys = Object.keys(PRESETS || {});
  if (!keys.length) throw new Error('substrate-catalog.js: PRESETS vacío');
  return keys.map((key) => ({ key, sKey: PRESETS[key].s, recipe: PRESETS[key].i }));
};

// Una corrida del modelo de `dir` sobre las recetas dadas.
const runModel = (dir, recipes) => {
  const legacy = require(path.join(dir, 'recipe-optimizer.js'));
  const scoring = require(path.join(dir, 'scoring.js'));
  const { SPP, INGS } = loadProductionCatalog(dir);
  const { analyze } = loadProductionAnalyze(dir, legacy);
  const known = new Set(INGS.map((i) => i.id));

  return recipes.map(({ key, sKey, recipe }) => {
    const missing = recipe.map((r) => r.id).filter((id) => !known.has(id));
    if (!SPP[sKey]) return { key, sKey, error: `especie ausente: ${sKey}` };
    if (missing.length) return { key, sKey, error: `ingrediente ausente: ${missing.join(', ')}` };
    try {
      const an = analyze(recipe, sKey, INGS, SPP);
      if (!an) return { key, sKey, error: 'analyze devolvió vacío' };
      const sev = scoring.assessSeverity(an);
      const scored = scoring.scoreRecipe(an, {
        treatment: legacy.calcTreatment(an, sKey, SPP),
        recipe,
        criticals: sev.criticals,
        warnings: sev.warnings,
        severity: sev.severity,
      }) || {};
      return {
        key,
        sKey,
        eb: Number.isFinite(an.eb) ? an.eb : null,
        cn: Number.isFinite(an.cn) ? an.cn : null,
        score: Number.isFinite(scored.score) ? scored.score : null,
        status: scored.status || null,
      };
    } catch (e) {
      return { key, sKey, error: `excepción: ${e.message}` };
    }
  });
};

const FIELDS = ['eb', 'cn', 'score', 'status', 'error'];
const EPS = 1e-9;
const differs = (a, b) => (
  typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) > EPS : (a ?? null) !== (b ?? null)
);

const buildDrift = (current, baseline) => {
  const before = new Map(baseline.map((r) => [r.key, r]));
  const drift = [];
  current.forEach((now) => {
    const prev = before.get(now.key);
    if (!prev) return;
    const changed = FIELDS.filter((f) => differs(now[f], prev[f]));
    if (changed.length) drift.push({ key: now.key, sKey: now.sKey, changed, before: prev, after: now });
  });
  return drift;
};

const show = (v) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : (v ?? 'n/a'));

const printReport = (report) => {
  const out = [NOT_VALIDATION, `base ${report.baseline} · ${report.n} receta(s) de referencia`, ''];
  if (!report.drift.length) out.push('Sin deriva: EB, C:N, score y status iguales a la base en todas las recetas.');
  else {
    out.push(`Recetas con deriva: ${report.drift.length} de ${report.n}`);
    report.drift.forEach((d) => {
      out.push(`  ~ ${d.key} (${d.sKey})`);
      d.changed.forEach((f) => out.push(`      ${f}: ${show(d.before[f])} → ${show(d.after[f])}`));
    });
  }
  const failed = report.current.filter((r) => r.error);
  if (failed.length) {
    out.push('', `Recetas no evaluables en el árbol de trabajo: ${failed.length}`);
    failed.forEach((r) => out.push(`  ✗ ${r.key}: ${r.error}`));
  }
  process.stdout.write(`${out.join('\n')}\n`);
};

const HELP = `Uso: node perito-drift-report.js [opciones]
  --baseline=<rev>   revisión con la que comparar (default HEAD~1)
  --fail-on-drift    salir con código 2 si alguna receta cambió
  --json             emite el reporte como JSON
${NOT_VALIDATION}`;

const main = (argv) => {
  const opts = parseArgs(argv);
  if (opts.help) { process.stdout.write(`${HELP}\n`); return EXIT.OK; }
  if (opts.unknown) {
    process.stderr.write(`opción no reconocida: ${opts.unknown.join(', ')}\n${HELP}\n`);
    return EXIT.OPERATIONAL;
  }
  let base;
  try {
    const recipes = loadReferenceRecipes(HERE);
    const current = runModel(HERE, recipes);
    const rev = resolveRev(opts.baseline);
    base = materializeBaseline(opts.baseline);
    const baseline = runModel(base.dir, recipes);
    const report = {
      validation: false,
      note: NOT_VALIDATION,
      baseline: rev,
      n: recipes.length,
      drift: buildDrift(current, baseline),
      current,
    };
    if (opts.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else printReport(report);
    return report.drift.length && opts.failOnDrift ? EXIT.DRIFT : EXIT.OK;
  } catch (e) {
    process.stderr.write(`perito-drift-report: ${e.message}\n`);
    return EXIT.OPERATIONAL;
  } finally {
    if (base) base.cleanup();
  }
};

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { parseArgs, loadReferenceRecipes, runModel, buildDrift, main, EXIT, NOT_VALIDATION };
