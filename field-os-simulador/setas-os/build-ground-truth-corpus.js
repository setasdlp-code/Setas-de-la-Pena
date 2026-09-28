#!/usr/bin/env node
'use strict';
// Construye ground-truth-fixtures.json — el corpus de lotes reales contra el que
// perito-regression-report.js mide si un cambio al modelo predice mejor o peor.
//
// Por qué existe: sin corpus, `perito-regression-report.js` sale con código 1 y
// ningún cambio a analyze() / scoring.js / perito-scenarios.js es verificable.
// Los ~1000 tests unitarios dicen que el motor sigue funcionando; ninguno dice
// que siga acertando. Este script es el puente entre Bitácora y esa compuerta.
//
// REGLA DE DISEÑO: este script NO decide qué lote es válido. Esa decisión ya
// existe y es canónica — `historical-calibration.js` (`bitacoraObservations`,
// `batchOutcome`, `assessHistory`), el contrato documentado en
// HISTORY_ELIGIBILITY.md. Duplicar aquí ese criterio crearía una segunda
// definición de "resultado final elegible", que es exactamente el defecto que
// ese módulo se creó para eliminar. Aquí solo se lee, se delega y se reporta.
//
// Uso:
//   node build-ground-truth-corpus.js --bitacora=<export.json> [--trials=<export.json>]
//                                     [--out=<ruta>] [--min-per-species=N]
//                                     [--json] [--dry-run]
//
// Formatos de entrada aceptados (--bitacora):
//   { "lotes": [...], "cosechas": [...] }        ← export directo
//   { "bitLotes": [...], "bitCosechas": [...] }  ← nombres del estado de React
//   { "data": { "lotes": [...], "cosechas": [...] } }
// Cada lote necesita `recipeRef: { sKey, recipe: [{id, p}] }`, `peseSeco`,
// `lifecycleState` cerrado, y cosechas con `id` + `pesoFresco`. Los que no lo
// tengan no se descartan en silencio: salen listados con su razón.
//
// Formato de --trials: array de pruebas guardadas del Recetario
//   [{ id, sKey, recipe:[{id,p}], ebReal, outcome:{status,verified} }]
//
// Códigos de salida:
//   0  corpus escrito con al menos una fixture elegible
//   1  ninguna fixture elegible — no se escribe nada (un corpus vacío es peor
//      que ningún corpus: haría pasar la compuerta sin validar nada)
//   2  error de operación (archivo ausente, JSON inválido, argumentos malos)

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const calib = require('./historical-calibration.js');

const EXIT = { OK: 0, NO_ELIGIBLE: 1, OPERATIONAL: 2 };

// Umbral por defecto: por debajo de esto el promedio es ruido, no evidencia.
// No bloquea la escritura — advierte. La decisión de calibrar con n bajo es
// del humano, pero tiene que ser una decisión consciente y no un descuido.
const DEFAULT_MIN_PER_SPECIES = 10;

// ── args ──────────────────────────────────────────────────────────
const parseArgs = (argv) => {
  const opts = {
    bitacora: null,
    trials: null,
    out: path.join(HERE, 'ground-truth-fixtures.json'),
    minPerSpecies: DEFAULT_MIN_PER_SPECIES,
    json: false,
    dryRun: false,
  };
  for (const arg of argv) {
    const [flag, ...rest] = arg.split('=');
    const value = rest.join('=');
    switch (flag) {
      case '--bitacora': opts.bitacora = value; break;
      case '--trials': opts.trials = value; break;
      case '--out': opts.out = path.resolve(value); break;
      case '--min-per-species': opts.minPerSpecies = Number(value); break;
      case '--json': opts.json = true; break;
      case '--dry-run': opts.dryRun = true; break;
      case '--help': case '-h': opts.help = true; break;
      default:
        throw new Error(`argumento desconocido: ${flag}`);
    }
  }
  if (!Number.isFinite(opts.minPerSpecies) || opts.minPerSpecies < 0) {
    throw new Error(`--min-per-species inválido: ${opts.minPerSpecies}`);
  }
  return opts;
};

const readJson = (file, label) => {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch (err) {
    throw new Error(`no se pudo leer ${label} (${file}): ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${label} no es JSON válido (${file}): ${err.message}`);
  }
};

// Acepta las tres formas en que el export puede venir, sin adivinar más allá
// de eso: si no aparecen ambos arreglos, se dice qué claves sí había.
const extractBitacora = (payload, file) => {
  const root = payload && typeof payload === 'object' && payload.data && !Array.isArray(payload.data)
    ? payload.data
    : payload;
  if (!root || typeof root !== 'object') {
    throw new Error(`${file}: se esperaba un objeto con lotes y cosechas`);
  }
  const lotes = root.lotes || root.bitLotes;
  const cosechas = root.cosechas || root.bitCosechas;
  if (!Array.isArray(lotes) || !Array.isArray(cosechas)) {
    const keys = Object.keys(root).join(', ') || '(vacío)';
    throw new Error(
      `${file}: faltan los arreglos de lotes y cosechas. Claves encontradas: ${keys}. ` +
      'Se aceptan {lotes,cosechas}, {bitLotes,bitCosechas} o {data:{lotes,cosechas}}.'
    );
  }
  return { lotes, cosechas };
};

// Las pruebas del Recetario ya traen ebReal y outcome; se les normaliza el
// nombre del campo a `be` para que una sola pasada de assessHistory pueda
// deduplicar entre fuentes (un lote registrado en Bitácora y guardado también
// como prueba es el mismo hecho, y contarlo dos veces infla la evidencia).
const trialObservations = (trials, file) => {
  if (!Array.isArray(trials)) throw new Error(`${file}: se esperaba un arreglo de pruebas guardadas`);
  return trials.filter(Boolean).map((t) => ({
    loteId: t.loteId || null,
    sourceId: t.id || null,
    source: 'trial',
    codigo: t.name || t.codigo || '',
    sKey: t.sKey,
    recipe: Array.isArray(t.recipe) ? t.recipe : [],
    fecha: t.date || t.fecha || null,
    be: t.ebReal,
    outcome: t.outcome,
    ...(!t.sKey ? { exclusionReason: 'missing-recipe-reference' } : {}),
  }));
};

const toFixture = (row) => ({
  sKey: row.sKey,
  recipe: (row.recipe || []).map((r) => ({ id: r.id, p: Number(r.p ?? r.pct) })),
  ebReal: row.be,
  loteId: row.loteId || row.sourceId || null,
  source: row.source,
  ...(row.codigo ? { codigo: row.codigo } : {}),
  ...(row.fecha ? { fecha: row.fecha } : {}),
});

const countBySpecies = (fixtures) => {
  const counts = {};
  fixtures.forEach((f) => { counts[f.sKey] = (counts[f.sKey] || 0) + 1; });
  return counts;
};

// ── main ──────────────────────────────────────────────────────────
const main = (argv) => {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    return EXIT.OPERATIONAL;
  }

  if (opts.help || (!opts.bitacora && !opts.trials)) {
    process.stderr.write(
      'Uso: node build-ground-truth-corpus.js --bitacora=<export.json> [--trials=<export.json>]\n' +
      '                                       [--out=<ruta>] [--min-per-species=N] [--json] [--dry-run]\n' +
      'Se requiere al menos una fuente. Ver el encabezado del archivo para los formatos aceptados.\n'
    );
    return opts.help ? EXIT.OK : EXIT.OPERATIONAL;
  }

  let observations = [];
  const sources = [];

  try {
    if (opts.bitacora) {
      const { lotes, cosechas } = extractBitacora(readJson(opts.bitacora, 'export de Bitácora'), opts.bitacora);
      const rows = calib.bitacoraObservations(lotes, cosechas);
      observations = observations.concat(rows);
      sources.push({ kind: 'bitacora', file: opts.bitacora, lotes: lotes.length, cosechas: cosechas.length, rows: rows.length });
    }
    if (opts.trials) {
      const rows = trialObservations(readJson(opts.trials, 'export de pruebas'), opts.trials);
      observations = observations.concat(rows);
      sources.push({ kind: 'trials', file: opts.trials, rows: rows.length });
    }
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    return EXIT.OPERATIONAL;
  }

  // Única decisión de elegibilidad, delegada al módulo canónico.
  const report = calib.assessHistory(observations, 'be');
  const fixtures = report.eligibleRows.map(toFixture);
  const counts = countBySpecies(fixtures);
  const thin = Object.entries(counts).filter(([, n]) => n < opts.minPerSpecies);

  const summary = {
    sources,
    observed: report.total,
    eligible: report.eligibleN,
    excluded: report.excludedN,
    exclusionReasons: report.exclusionReasons,
    bySpecies: counts,
    minPerSpecies: opts.minPerSpecies,
    thinSpecies: thin.map(([sKey, n]) => ({ sKey, n })),
    out: opts.dryRun ? null : opts.out,
  };

  if (!fixtures.length) {
    if (opts.json) process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    process.stderr.write(
      `SIN FIXTURES ELEGIBLES: ${report.total} observación(es), 0 elegible(s).\n` +
      `${calib.describeHistory(report)}\n` +
      'No se escribió nada. Un corpus vacío haría pasar la compuerta sin validar nada,\n' +
      'que es precisamente la falla que perito-regression-report.js existe para evitar.\n'
    );
    return EXIT.NO_ELIGIBLE;
  }

  if (!opts.dryRun) {
    try {
      fs.writeFileSync(opts.out, `${JSON.stringify(fixtures, null, 2)}\n`, 'utf8');
    } catch (err) {
      process.stderr.write(`no se pudo escribir ${opts.out}: ${err.message}\n`);
      return EXIT.OPERATIONAL;
    }
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    const lines = [];
    sources.forEach((s) => lines.push(`fuente ${s.kind}: ${s.file} → ${s.rows} observación(es)`));
    lines.push(calib.describeHistory(report));
    lines.push('');
    lines.push('Corpus por especie:');
    Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
      .forEach(([sKey, n]) => lines.push(`  ${sKey.padEnd(22)} ${String(n).padStart(3)}${n < opts.minPerSpecies ? '  ← bajo el mínimo' : ''}`));
    lines.push('');
    lines.push(opts.dryRun ? `(dry-run) ${fixtures.length} fixture(s) NO escritas` : `${fixtures.length} fixture(s) → ${opts.out}`);
    if (thin.length) {
      lines.push('');
      lines.push(
        `AVISO: ${thin.length} especie(s) con menos de ${opts.minPerSpecies} lote(s). ` +
        'Con esa n el error promedio es ruido, no evidencia: sirve para detectar que un\n' +
        'cambio rompió algo, no para afirmar que el modelo mejoró. Calibrar constantes\n' +
        'contra estas especies requiere decirlo explícitamente en el PR.'
      );
    }
    process.stdout.write(`${lines.join('\n')}\n`);
  }

  return EXIT.OK;
};

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { main, extractBitacora, trialObservations, toFixture, countBySpecies, EXIT, DEFAULT_MIN_PER_SPECIES };
