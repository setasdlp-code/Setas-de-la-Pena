#!/usr/bin/env node
'use strict';
// Reporte de regresión del perito contra evidencia real de campo.
//
// Corre el corpus de ground-truth-fixtures.json a través de analyze()+scoreRecipe()
// del árbol de trabajo Y de una revisión base (por defecto HEAD~1), y compara
// meanAbsErrorEB / maxAbsErrorEB entre ambos. Sirve como compuerta ("gate") para
// cambios a scoring.js / perito-scenarios.js / recipe-optimizer.js: si tocar el
// modelo empeora la predicción contra lotes reales, esto lo dice en vez de
// dejar que solo pasen los tests sintéticos.
//
// NO modifica el contrato de inyección de ground-truth-regression.js: este script
// es únicamente un llamador que provee analyzeFn/scoreFn, igual que lo hace
// ground-truth-regression.test.js con su catálogo sintético — solo que aquí el
// catálogo es el de producción (SPP/INGS extraídos de simulador-app.js).
//
// Uso:
//   node perito-regression-report.js [--baseline=<rev>] [--fixtures=<ruta>]
//                                    [--tolerance=<eb>] [--max-mean=<eb>]
//                                    [--max-max=<eb>] [--allow-skipped] [--json]
//
// Códigos de salida:
//   0  corpus evaluado, sin regresión ni umbrales excedidos
//   1  SIN CORPUS: ground-truth-fixtures.json ausente, vacío o inválido.
//      Esto es un fallo deliberado. Un "pass" sin corpus sería vacuo, y ese
//      pass vacuo es exactamente la falla que esta herramienta existe para evitar.
//   2  regresión respecto a la base, o umbral absoluto excedido
//   3  corpus sucio: fixtures descartadas por loadFixtures, o fixtures que
//      analyze() no pudo evaluar (usar --allow-skipped para degradar a aviso)
//   4  error de operación (catálogo no extraíble, revisión base rota, etc.)

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const HERE = __dirname;

const git = (args, cwd = HERE) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// Dónde vive este directorio dentro del repo, preguntado a git en vez de
// hardcodeado: los pathspec de `git archive` se resuelven desde la raíz.
const repoLocation = () => ({
  toplevel: git(['rev-parse', '--show-toplevel']),
  reldir: git(['rev-parse', '--show-prefix']).replace(/\/$/, ''),
});

const EXIT = { OK: 0, NO_CORPUS: 1, REGRESSION: 2, DIRTY_CORPUS: 3, OPERATIONAL: 4 };
const NO_CORPUS_MSG = 'no corpus — regression not validated';

// ── args ──────────────────────────────────────────────────────────
const parseArgs = (argv) => {
  const opts = {
    baseline: 'HEAD~1',
    fixtures: path.join(HERE, 'ground-truth-fixtures.json'),
    tolerance: 0,
    maxMean: null,
    maxMax: null,
    allowSkipped: false,
    json: false,
  };
  argv.forEach((arg) => {
    const [flag, ...rest] = arg.split('=');
    const value = rest.join('=');
    switch (flag) {
      case '--baseline': opts.baseline = value; break;
      case '--fixtures': opts.fixtures = path.resolve(value); break;
      case '--tolerance': opts.tolerance = Number(value); break;
      case '--max-mean': opts.maxMean = Number(value); break;
      case '--max-max': opts.maxMax = Number(value); break;
      case '--allow-skipped': opts.allowSkipped = true; break;
      case '--no-baseline': opts.baseline = null; break;
      case '--json': opts.json = true; break;
      case '--help': case '-h': opts.help = true; break;
      default: opts.unknown = (opts.unknown || []).concat(arg);
    }
  });
  return opts;
};

// ── catálogo de producción ────────────────────────────────────────
// SPP e INGS viven como literales de nivel superior en simulador-app.js (bundle
// de navegador: no se puede require()). Se recortan por sus delimitadores en
// columna 0 y se evalúan aislados en un contexto vacío — sin React, sin DOM.
const extractLiteral = (src, name, open, close) => {
  const startMark = `\nconst ${name} = ${open}\n`;
  const start = src.indexOf(startMark);
  if (start < 0) throw new Error(`no se encontró la declaración "const ${name} = ${open}" en simulador-app.js`);
  const endMark = `\n${close};\n`;
  const end = src.indexOf(endMark, start);
  if (end < 0) throw new Error(`no se encontró el cierre "${close};" de ${name} en simulador-app.js`);
  return src.slice(start + 1, end + endMark.length);
};

const loadProductionCatalog = (dir) => {
  const src = fs.readFileSync(path.join(dir, 'simulador-app.js'), 'utf8');
  const code = `${extractLiteral(src, 'SPP', '{', '}')}\n${extractLiteral(src, 'INGS', '[', ']')}\n;({ SPP, INGS })`;
  const { SPP, INGS } = vm.runInNewContext(code, {}, { timeout: 5000 });
  if (!SPP || !Object.keys(SPP).length) throw new Error('SPP extraído está vacío');
  if (!Array.isArray(INGS) || !INGS.length) throw new Error('INGS extraído está vacío');
  return { SPP, INGS };
};

// ── una corrida del modelo (árbol de trabajo o revisión base) ─────
// Provee analyzeFn/scoreFn al arnés exactamente como lo espera evaluateFixture.
const runModel = (dir, fixtures) => {
  const legacy = require(path.join(dir, 'recipe-optimizer.js'));
  const scoring = require(path.join(dir, 'scoring.js'));
  const harness = require(path.join(dir, 'ground-truth-regression.js'));
  const { SPP, INGS } = loadProductionCatalog(dir);

  const analyzeFn = (fixture) => legacy.analyze(fixture.recipe, fixture.sKey, INGS, SPP);
  const scoreFn = (an, fixture) => {
    const sev = scoring.assessSeverity(an);
    const treatment = legacy.calcTreatment(an, fixture.sKey, SPP);
    return scoring.scoreRecipe(an, {
      treatment,
      recipe: fixture.recipe,
      criticals: sev.criticals,
      warnings: sev.warnings,
      severity: sev.severity,
    });
  };

  const results = fixtures.map((f) => {
    try {
      return harness.evaluateFixture(f, { analyzeFn, scoreFn });
    } catch (e) {
      return { fixture: f, error: `excepcion: ${e.message}` };
    }
  });
  return { results, summary: harness.summarizeFixtureRun(results) };
};

// ── revisión base ─────────────────────────────────────────────────
const materializeBaseline = (rev) => {
  const { toplevel, reldir } = repoLocation();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'perito-baseline-'));
  try {
    const tar = execFileSync('git', ['archive', rev, '--', reldir], {
      cwd: toplevel, maxBuffer: 512 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
    });
    execFileSync('tar', ['-x', '-C', tmp], { input: tar, maxBuffer: 512 * 1024 * 1024 });
  } catch (e) {
    fs.rmSync(tmp, { recursive: true, force: true });
    const detail = (e.stderr && e.stderr.toString().trim()) || e.message;
    throw new Error(`git archive ${rev} -- ${reldir} falló: ${detail}`);
  }
  const dir = path.join(tmp, reldir);
  const cleanup = () => fs.rmSync(tmp, { recursive: true, force: true });
  if (!fs.existsSync(path.join(dir, 'scoring.js'))) {
    cleanup();
    throw new Error(`la revisión ${rev} no contiene ${reldir}/scoring.js`);
  }
  return { dir, cleanup };
};

const resolveRev = (rev) => git(['rev-parse', '--short', rev]);

// ── presentación ──────────────────────────────────────────────────
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : 'n/a');
const signed = (v, d = 3) => (Number.isFinite(v) ? `${v >= 0 ? '+' : ''}${v.toFixed(d)}` : 'n/a');

const buildDelta = (current, base) => {
  if (!base) return null;
  const d = (a, b) => (Number.isFinite(a) && Number.isFinite(b) ? a - b : null);
  return {
    meanAbsErrorEB: d(current.meanAbsErrorEB, base.meanAbsErrorEB),
    maxAbsErrorEB: d(current.maxAbsErrorEB, base.maxAbsErrorEB),
  };
};

// meanAbsErrorEB solo se mueve si cambia el EB que predice analyze(). Un cambio
// que toca únicamente scoring.js mueve score/status y dejaría el delta de EB en
// 0.000 — parecería un no-op. Por eso se diffean también score y status por lote.
const buildScoreShifts = (current, baseline) => {
  if (!baseline) return null;
  const key = (r) => `${(r.fixture && r.fixture.loteId) || ''}|${r.fixture && r.fixture.sKey}`;
  const before = new Map(baseline.results.map((r) => [key(r), r]));
  const shifts = [];
  current.results.forEach((r) => {
    const b = before.get(key(r));
    if (!b) return;
    if (r.score !== b.score || r.status !== b.status) {
      shifts.push({
        loteId: (r.fixture && r.fixture.loteId) || '(sin loteId)',
        sKey: r.fixture && r.fixture.sKey,
        scoreBefore: b.score, scoreAfter: r.score,
        statusBefore: b.status, statusAfter: r.status,
      });
    }
  });
  return shifts;
};

const printReport = (report) => {
  const { corpus, current, baseline, delta, verdict } = report;
  const line = (s = '') => process.stdout.write(`${s}\n`);
  line('── Regresión del perito contra evidencia de campo ──────────────');
  line(`corpus:          ${corpus.path}`);
  line(`fixtures usadas: ${corpus.loaded}`);
  line(`fixtures skipped (loadFixtures, forma inválida): ${corpus.skipped}`);
  line(`fixtures no evaluables (analyze/score falló):    ${current.failed}`);
  line();
  const baseLabel = baseline ? `base ${baseline.rev}` : 'base n/a';
  line(`métrica            actual        ${baseLabel.padEnd(13)} delta`);
  line(`meanAbsErrorEB     ${fmt(current.meanAbsErrorEB).padEnd(13)} ${fmt(baseline && baseline.summary.meanAbsErrorEB).padEnd(13)} ${signed(delta && delta.meanAbsErrorEB)}`);
  line(`maxAbsErrorEB      ${fmt(current.maxAbsErrorEB).padEnd(13)} ${fmt(baseline && baseline.summary.maxAbsErrorEB).padEnd(13)} ${signed(delta && delta.maxAbsErrorEB)}`);
  line();
  if (report.perFixture && report.perFixture.length) {
    line('por lote:');
    report.perFixture.forEach((r) => {
      if (r.error) { line(`  ✗ ${r.loteId} (${r.sKey}) — ${r.error}`); return; }
      line(`  · ${r.loteId} (${r.sKey}) pred ${fmt(r.predictedEB, 2)} vs real ${fmt(r.actualEB, 2)} → |err| ${fmt(r.absErrorEB, 2)}  [score ${r.score ?? 'n/a'} ${r.status ?? ''}]`);
    });
    line();
  }
  if (report.scoreShifts && report.scoreShifts.length) {
    line(`score/status cambiados vs ${baseline.rev} (${report.scoreShifts.length}):`);
    report.scoreShifts.forEach((s) => {
      line(`  ~ ${s.loteId} (${s.sKey}) score ${s.scoreBefore} → ${s.scoreAfter} · status ${s.statusBefore} → ${s.statusAfter}`);
    });
    line();
  }
  verdict.notes.forEach((n) => line(n));
  line(`veredicto: ${verdict.ok ? 'OK' : 'FALLO'} (exit ${verdict.exitCode})`);
};

// ── main ──────────────────────────────────────────────────────────
const HELP = `perito-regression-report — compuerta de regresión del perito contra lotes reales

  node perito-regression-report.js [opciones]

  --baseline=<rev>   revisión con la que comparar (default HEAD~1)
  --no-baseline      no comparar; solo reportar métricas actuales
  --fixtures=<ruta>  corpus alterno (default ./ground-truth-fixtures.json)
  --tolerance=<eb>   aumento permitido de meanAbsErrorEB vs base (default 0)
  --max-mean=<eb>    umbral absoluto de meanAbsErrorEB
  --max-max=<eb>     umbral absoluto de maxAbsErrorEB
  --allow-skipped    fixtures descartadas → aviso en vez de fallo
  --json             emite el reporte como JSON

  exit 0 ok · 1 ${NO_CORPUS_MSG} · 2 regresión · 3 corpus sucio · 4 error operativo`;

const main = (argv) => {
  const opts = parseArgs(argv);
  if (opts.help) { process.stdout.write(`${HELP}\n`); return EXIT.OK; }
  if (opts.unknown) {
    process.stderr.write(`opción no reconocida: ${opts.unknown.join(', ')}\n${HELP}\n`);
    return EXIT.OPERATIONAL;
  }

  // ── Compuerta crítica: sin corpus no hay validación posible. ────
  // Salir 0 aquí convertiría esta herramienta en un sello de goma.
  let raw;
  try {
    raw = fs.readFileSync(opts.fixtures, 'utf8');
  } catch (_) {
    process.stderr.write(`${NO_CORPUS_MSG}: ${opts.fixtures} no existe.\n`);
    process.stderr.write('Poblarlo con lotes reales (sKey + recipe + ebReal) — ver ground-truth-fixtures.example.json.\n');
    return EXIT.NO_CORPUS;
  }

  const harness = require(path.join(HERE, 'ground-truth-regression.js'));
  const { fixtures, skipped, error } = harness.loadFixtures(raw);
  if (error) {
    process.stderr.write(`${NO_CORPUS_MSG}: ${opts.fixtures} es inválido (${error}).\n`);
    return EXIT.NO_CORPUS;
  }
  if (!fixtures.length) {
    process.stderr.write(`${NO_CORPUS_MSG}: ${opts.fixtures} no tiene ninguna fixture usable`
      + `${skipped ? ` (${skipped} descartada(s) por forma inválida)` : ' (corpus vacío)'}.\n`);
    return EXIT.NO_CORPUS;
  }

  let current;
  try {
    current = runModel(HERE, fixtures);
  } catch (e) {
    process.stderr.write(`error evaluando el árbol de trabajo: ${e.message}\n`);
    return EXIT.OPERATIONAL;
  }

  let baseline = null;
  let baselineNote = null;
  if (opts.baseline) {
    let handle = null;
    try {
      const rev = resolveRev(opts.baseline);
      handle = materializeBaseline(opts.baseline);
      baseline = { rev, ...runModel(handle.dir, fixtures) };
    } catch (e) {
      const detail = String(e.message).replace(/\s+/g, ' ').trim();
      baselineNote = `⚠ base ${opts.baseline} no evaluable (${detail}) — delta no calculado, la compuerta de regresión NO corrió.`;
    } finally {
      if (handle) handle.cleanup();
    }
  } else {
    baselineNote = '⚠ --no-baseline: delta no calculado, la compuerta de regresión NO corrió.';
  }

  const delta = buildDelta(current.summary, baseline && baseline.summary);
  const scoreShifts = buildScoreShifts(current, baseline);

  // ── veredicto ─────────────────────────────────────────────────
  const notes = [];
  let exitCode = EXIT.OK;
  const fail = (code, msg) => { notes.push(`✗ ${msg}`); if (code > exitCode) exitCode = code; };

  if (baselineNote) notes.push(baselineNote);

  if (skipped > 0) {
    const msg = `${skipped} fixture(s) descartadas por loadFixtures (forma inválida): no entran al promedio.`;
    if (opts.allowSkipped) notes.push(`⚠ ${msg} (tolerado por --allow-skipped)`);
    else fail(EXIT.DIRTY_CORPUS, msg);
  }
  if (current.summary.failed > 0) {
    const msg = `${current.summary.failed} fixture(s) cargadas pero no evaluables por analyze()/scoreRecipe().`;
    if (opts.allowSkipped) notes.push(`⚠ ${msg} (tolerado por --allow-skipped)`);
    else fail(EXIT.DIRTY_CORPUS, msg);
  }
  if (baseline && baseline.summary.n !== current.summary.n) {
    notes.push(`⚠ la base evaluó ${baseline.summary.n} fixture(s) y el árbol actual ${current.summary.n}: el delta compara conjuntos distintos.`);
  }
  if (delta && Number.isFinite(delta.meanAbsErrorEB)
      && delta.meanAbsErrorEB > opts.tolerance + 1e-9) {
    fail(EXIT.REGRESSION, `meanAbsErrorEB empeoró ${signed(delta.meanAbsErrorEB)} EB vs ${baseline.rev} (tolerancia ${opts.tolerance}).`);
  }
  if (Number.isFinite(opts.maxMean) && Number.isFinite(current.summary.meanAbsErrorEB)
      && current.summary.meanAbsErrorEB > opts.maxMean) {
    fail(EXIT.REGRESSION, `meanAbsErrorEB ${fmt(current.summary.meanAbsErrorEB)} excede --max-mean=${opts.maxMean}.`);
  }
  if (Number.isFinite(opts.maxMax) && Number.isFinite(current.summary.maxAbsErrorEB)
      && current.summary.maxAbsErrorEB > opts.maxMax) {
    fail(EXIT.REGRESSION, `maxAbsErrorEB ${fmt(current.summary.maxAbsErrorEB)} excede --max-max=${opts.maxMax}.`);
  }
  if (scoreShifts && scoreShifts.length) {
    notes.push(`⚠ ${scoreShifts.length} lote(s) cambiaron score/status vs ${baseline.rev}`
      + ' — verificar que el cambio sea intencional (por sí solo no falla la compuerta).');
  }
  if (!notes.length) notes.push('✓ sin regresión respecto a la base, sin fixtures descartadas y sin cambios de score/status.');

  const report = {
    corpus: { path: opts.fixtures, loaded: fixtures.length, skipped },
    current: current.summary,
    baseline: baseline && { rev: baseline.rev, summary: baseline.summary },
    delta,
    scoreShifts,
    perFixture: current.results.map((r) => ({
      loteId: (r.fixture && r.fixture.loteId) || '(sin loteId)',
      sKey: r.fixture && r.fixture.sKey,
      predictedEB: r.predictedEB,
      actualEB: r.actualEB,
      absErrorEB: r.absErrorEB,
      score: r.score,
      status: r.status,
      error: r.error,
    })),
    verdict: { ok: exitCode === EXIT.OK, exitCode, notes },
  };

  if (opts.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else printReport(report);
  return exitCode;
};

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { parseArgs, extractLiteral, loadProductionCatalog, buildDelta, main, EXIT, NO_CORPUS_MSG };
