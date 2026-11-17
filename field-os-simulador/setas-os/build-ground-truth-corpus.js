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
//                                     [--json] [--dry-run] [--no-catalog]
//
// Formatos de entrada aceptados (--bitacora):
//   { "lotes": [...], "cosechas": [...] }        ← export directo
//   { "bitLotes": [...], "bitCosechas": [...] }  ← nombres del estado de React
//   { "data": { "lotes": [...], "cosechas": [...] } }
//   respaldo descargado desde la app (setas.prototype-backup.v1)
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
    noCatalog: false,
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
      case '--no-catalog': opts.noCatalog = true; break;
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
  // Respaldo descargado desde la app ("Descargar respaldo"): las colecciones
  // vienen bajo sus claves de localStorage.
  const backup = root.collections && typeof root.collections === 'object' ? root.collections : {};
  const lotes = root.lotes || root.bitLotes || backup.sdp_bit_lotes;
  const cosechas = root.cosechas || root.bitCosechas || backup.sdp_bit_cosechas;
  if (!Array.isArray(lotes) || !Array.isArray(cosechas)) {
    const keys = Object.keys(root).join(', ') || '(vacío)';
    throw new Error(
      `${file}: faltan los arreglos de lotes y cosechas. Claves encontradas: ${keys}. ` +
      'Se aceptan {lotes,cosechas}, {bitLotes,bitCosechas}, {data:{lotes,cosechas}} o el respaldo descargado desde la app.'
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

// Formato exacto que consume ground-truth-regression.loadFixtures y el ejemplo
// ground-truth-fixtures.example.json: solo estos cuatro campos. La trazabilidad
// (fuente, código, fecha, motivo) vive en el reporte por lote, no en el corpus.
const toFixture = (row, eb) => ({
  sKey: row.sKey,
  recipe: (row.recipe || []).map((r) => ({ id: r.id, p: Number(r.p ?? r.pct) })),
  ebReal: eb,
  loteId: row.loteId || row.sourceId || null,
});

const countBySpecies = (fixtures) => {
  const counts = {};
  fixtures.forEach((f) => { counts[f.sKey] = (counts[f.sKey] || 0) + 1; });
  return counts;
};

// Motivos propios de este script. NO redefinen elegibilidad: `historical-calibration`
// decide qué es un resultado final. Estos solo detectan lotes que esa decisión
// acepta pero que el arnés de regresión no podría evaluar (receta vacía, especie
// o ingrediente fuera del catálogo de producción). Sin este filtro el lote entraría
// al corpus y reaparecería como "fixture descartada" o "no evaluable" en el reporte.
const CORPUS_REASON_LABELS = {
  'corpus-empty-recipe': 'receta vacía',
  'corpus-invalid-percentage': 'porcentaje de ingrediente ausente o inválido',
  'corpus-unknown-species': 'especie fuera del catálogo de producción',
  'corpus-unknown-ingredient': 'ingrediente fuera del catálogo de producción',
};
const reasonLabel = (reason) => (reason ? (CORPUS_REASON_LABELS[reason] || calib.EXCLUSION_LABELS?.[reason] || reason) : null);

const corpusReason = (fixture, catalog) => {
  if (!fixture.recipe.length) return 'corpus-empty-recipe';
  if (fixture.recipe.some((r) => !r.id || !Number.isFinite(r.p) || r.p <= 0)) return 'corpus-invalid-percentage';
  if (!catalog) return null;
  if (!Object.prototype.hasOwnProperty.call(catalog.SPP, fixture.sKey)) return 'corpus-unknown-species';
  const known = new Set(catalog.INGS.map((i) => i.id));
  if (fixture.recipe.some((r) => !known.has(r.id))) return 'corpus-unknown-ingredient';
  return null;
};

const NO_SPECIES = '(sin especie)';

// Una pasada: elegibilidad canónica → filtro de evaluabilidad → resultado por lote,
// fixtures exportables e indicador por especie.
const evaluateLots = (observations, { catalog = null, minPerSpecies = DEFAULT_MIN_PER_SPECIES } = {}) => {
  const report = calib.assessHistory(observations, 'be');
  const lots = [];
  const fixtures = [];
  report.observations.forEach((x) => {
    const { row } = x;
    let reason = x.eligible ? null : x.reason;
    let fixture = null;
    if (x.eligible) {
      fixture = toFixture(row, x.eb);
      reason = corpusReason(fixture, catalog);
      if (reason) fixture = null;
    }
    if (fixture) fixtures.push(fixture);
    lots.push({
      loteId: row.loteId || row.sourceId || null,
      source: row.source || null,
      codigo: row.codigo || null,
      sKey: row.sKey || null,
      eligible: !reason,
      reason,
      reasonLabel: reasonLabel(reason),
    });
  });

  const exclusionReasons = {};
  lots.filter((l) => !l.eligible).forEach((l) => { exclusionReasons[l.reason] = (exclusionReasons[l.reason] || 0) + 1; });

  const bySpecies = new Map();
  lots.forEach((l) => {
    const key = l.sKey || NO_SPECIES;
    if (!bySpecies.has(key)) bySpecies.set(key, { sKey: key, eligible: 0, excluded: 0 });
    bySpecies.get(key)[l.eligible ? 'eligible' : 'excluded'] += 1;
  });
  const species = [...bySpecies.values()]
    .map((s) => ({ ...s, belowMin: s.eligible < minPerSpecies }))
    .sort((a, b) => a.sKey.localeCompare(b.sKey));

  return {
    lots, fixtures, species, exclusionReasons,
    total: lots.length, eligibleN: fixtures.length, excludedN: lots.length - fixtures.length,
  };
};

const reasonSummary = (reasons) => Object.entries(reasons)
  .map(([reason, n]) => `${reasonLabel(reason)}: ${n}`).join(' · ');

const printRejected = (lots, write) => {
  const rejected = lots.filter((l) => !l.eligible);
  if (!rejected.length) return;
  write('');
  write(`Lotes rechazados (${rejected.length}):`);
  rejected.forEach((l) => write(
    `  ${String(l.loteId || '(sin id)').padEnd(22)} ${String(l.sKey || NO_SPECIES).padEnd(20)} ${l.reasonLabel}`
  ));
};

const printSpecies = (species, minPerSpecies, write) => {
  write('Lotes elegibles por especie:');
  species.forEach((s) => write(
    `  ${s.sKey.padEnd(22)} ${String(s.eligible).padStart(3)} elegible(s) · ${String(s.excluded).padStart(3)} rechazado(s)` +
    `${s.belowMin ? `  ← bajo el mínimo (${minPerSpecies})` : ''}`
  ));
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
      '                                       [--out=<ruta>] [--min-per-species=N] [--json] [--dry-run] [--no-catalog]\n' +
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

  // Catálogo de producción: el mismo que usa perito-regression-report.js. Si no
  // carga es un error, no un pase: validar contra nada reintroduciría las
  // fixtures "no evaluables" que este filtro existe para evitar.
  let catalog = null;
  if (!opts.noCatalog) {
    try {
      catalog = require('./perito-regression-report.js').loadProductionCatalog(HERE);
    } catch (err) {
      process.stderr.write(`no se pudo cargar el catálogo de producción: ${err.message}\n(usa --no-catalog para omitir esa validación, bajo tu responsabilidad)\n`);
      return EXIT.OPERATIONAL;
    }
  }

  // Elegibilidad canónica (historical-calibration) + evaluabilidad por el arnés.
  const result = evaluateLots(observations, { catalog, minPerSpecies: opts.minPerSpecies });
  const { fixtures } = result;
  const counts = countBySpecies(fixtures);
  const thin = result.species.filter((s) => s.belowMin);

  const summary = {
    sources,
    observed: result.total,
    eligible: result.eligibleN,
    excluded: result.excludedN,
    exclusionReasons: result.exclusionReasons,
    catalogValidated: Boolean(catalog),
    bySpecies: counts,
    species: result.species,
    lots: result.lots,
    minPerSpecies: opts.minPerSpecies,
    thinSpecies: thin.map((s) => ({ sKey: s.sKey, n: s.eligible })),
    out: opts.dryRun ? null : opts.out,
  };

  const lines = [];
  const emit = (l = '') => lines.push(l);
  sources.forEach((s) => emit(`fuente ${s.kind}: ${s.file} → ${s.rows} observación(es)`));
  emit(`${result.eligibleN} lote(s) elegible(s) · ${result.excludedN} rechazado(s)` +
    (result.excludedN ? ` · ${reasonSummary(result.exclusionReasons)}` : ''));
  if (!catalog) emit('AVISO: --no-catalog — especies e ingredientes NO se validaron contra el catálogo de producción.');
  printRejected(result.lots, emit);
  emit();
  printSpecies(result.species, opts.minPerSpecies, emit);

  if (!fixtures.length) {
    if (opts.json) process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    process.stderr.write(
      `SIN FIXTURES ELEGIBLES: ${result.total} observación(es), 0 elegible(s).\n${lines.join('\n')}\n` +
      'No se escribió nada. Un corpus vacío haría pasar la compuerta sin validar nada,\n' +
      'que es precisamente la falla que perito-regression-report.js existe para evitar.\n'
    );
    return EXIT.NO_ELIGIBLE;
  }

  // Ida y vuelta por el consumidor real: si loadFixtures descartara algo, el
  // corpus escrito no sería el que se cree haber validado.
  const serialized = `${JSON.stringify(fixtures, null, 2)}\n`;
  const roundTrip = require('./ground-truth-regression.js').loadFixtures(serialized);
  if (roundTrip.error || roundTrip.skipped || roundTrip.fixtures.length !== fixtures.length) {
    process.stderr.write(`el corpus no sobrevive a ground-truth-regression.loadFixtures (descartadas: ${roundTrip.skipped}, error: ${roundTrip.error}). No se escribió nada.\n`);
    return EXIT.OPERATIONAL;
  }

  if (!opts.dryRun) {
    try {
      fs.writeFileSync(opts.out, serialized, 'utf8');
    } catch (err) {
      process.stderr.write(`no se pudo escribir ${opts.out}: ${err.message}\n`);
      return EXIT.OPERATIONAL;
    }
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    emit();
    emit(opts.dryRun ? `(dry-run) ${fixtures.length} fixture(s) NO escritas` : `${fixtures.length} fixture(s) → ${opts.out}`);
    if (thin.length) {
      emit();
      emit(
        `AVISO: ${thin.length} especie(s) con menos de ${opts.minPerSpecies} lote(s) elegible(s). ` +
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

module.exports = { main, extractBitacora, trialObservations, toFixture, countBySpecies, evaluateLots, corpusReason, EXIT, DEFAULT_MIN_PER_SPECIES };
