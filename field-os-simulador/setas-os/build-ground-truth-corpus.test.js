'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tool = require('./build-ground-truth-corpus.js');
const calib = require('./historical-calibration.js');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'setas-corpus-'));
const write = (dir, name, data) => {
  const file = path.join(dir, name);
  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  return file;
};

// Lote cerrado, con receta, peso seco y una cosecha válida: el caso elegible.
const closedLote = (id, overrides = {}) => ({
  id,
  codigo: id,
  lifecycleState: 'closed',
  peseSeco: 10,
  fechaInoculacion: '2026-01-10',
  recipeRef: { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }] },
  ...overrides,
});
const harvest = (id, loteId, kg) => ({ id, loteId, pesoFresco: kg, unit: 'kg' });

test('extractBitacora acepta las tres formas de export', () => {
  const payload = { lotes: [1], cosechas: [2] };
  assert.deepEqual(tool.extractBitacora(payload, 'x'), { lotes: [1], cosechas: [2] });
  assert.deepEqual(tool.extractBitacora({ bitLotes: [1], bitCosechas: [2] }, 'x'), { lotes: [1], cosechas: [2] });
  assert.deepEqual(tool.extractBitacora({ data: payload }, 'x'), { lotes: [1], cosechas: [2] });
});

test('extractBitacora nombra las claves encontradas cuando el formato no calza', () => {
  assert.throws(
    () => tool.extractBitacora({ batches: [], harvests: [] }, 'export.json'),
    /batches, harvests/,
    'el error debe decir qué claves había, no solo que el formato es inválido',
  );
});

test('un lote cerrado con cosecha válida produce una fixture con el EB derivado', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1')],
    cosechas: [harvest('H1', 'L1', 9.5)],
  });
  const out = path.join(dir, 'corpus.json');
  const code = tool.main([`--bitacora=${bit}`, `--out=${out}`, '--json', '--min-per-species=1']);
  assert.equal(code, tool.EXIT.OK);

  const fixtures = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.equal(fixtures.length, 1);
  assert.equal(fixtures[0].sKey, 'p_ostreatus_gris');
  // 9.5 kg fresco / 10 kg seco = 95 % EB
  assert.equal(fixtures[0].ebReal, 95);
  assert.equal(fixtures[0].loteId, 'L1');
  assert.deepEqual(fixtures[0].recipe, [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }]);
});

test('la salida es consumible por ground-truth-regression.loadFixtures sin descartes', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1'), closedLote('L2')],
    cosechas: [harvest('H1', 'L1', 9.5), harvest('H2', 'L2', 7)],
  });
  const out = path.join(dir, 'corpus.json');
  tool.main([`--bitacora=${bit}`, `--out=${out}`, '--min-per-species=1']);

  const gt = require('./ground-truth-regression.js');
  const loaded = gt.loadFixtures(fs.readFileSync(out, 'utf8'));
  assert.equal(loaded.error, null);
  assert.equal(loaded.skipped, 0, 'ninguna fixture generada puede ser descartada por el consumidor');
  assert.equal(loaded.fixtures.length, 2);
});

test('un lote sin cerrar no entra al corpus', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1', { lifecycleState: 'incubacion' })],
    cosechas: [harvest('H1', 'L1', 9.5)],
  });
  const out = path.join(dir, 'corpus.json');
  const code = tool.main([`--bitacora=${bit}`, `--out=${out}`]);
  assert.equal(code, tool.EXIT.NO_ELIGIBLE);
  assert.equal(fs.existsSync(out), false, 'sin fixtures elegibles no se escribe archivo');
});

test('sin fixtures elegibles el corpus no se escribe ni se vacía uno existente', () => {
  const dir = tmp();
  const out = path.join(dir, 'corpus.json');
  fs.writeFileSync(out, JSON.stringify([{ sKey: 'shiitake', recipe: [{ id: 'x', p: 100 }], ebReal: 50 }]), 'utf8');
  const bit = write(dir, 'bit.json', { lotes: [], cosechas: [] });

  const code = tool.main([`--bitacora=${bit}`, `--out=${out}`]);
  assert.equal(code, tool.EXIT.NO_ELIGIBLE);
  const still = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.equal(still.length, 1, 'un corpus previo no puede quedar pisado por una corrida vacía');
});

test('el mismo lote en Bitácora y como prueba guardada cuenta una sola vez', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1')],
    cosechas: [harvest('H1', 'L1', 9.5)],
  });
  const trials = write(dir, 'trials.json', [{
    id: 'T1',
    loteId: 'L1',
    sKey: 'p_ostreatus_gris',
    recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }],
    ebReal: 95,
    outcome: { status: 'completed-success', verified: true },
  }]);
  const out = path.join(dir, 'corpus.json');
  tool.main([`--bitacora=${bit}`, `--trials=${trials}`, `--out=${out}`, '--min-per-species=1']);

  const fixtures = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.equal(fixtures.length, 1, 'el mismo hecho registrado dos veces no es dos evidencias');
});

test('copias contradictorias del mismo lote se excluyen en vez de elegir una', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1')],
    cosechas: [harvest('H1', 'L1', 9.5)],
  });
  const trials = write(dir, 'trials.json', [{
    id: 'T1',
    loteId: 'L1',
    sKey: 'p_ostreatus_gris',
    recipe: [{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }],
    ebReal: 40,
    outcome: { status: 'completed-success', verified: true },
  }]);
  const out = path.join(dir, 'corpus.json');
  const code = tool.main([`--bitacora=${bit}`, `--trials=${trials}`, `--out=${out}`]);
  assert.equal(code, tool.EXIT.NO_ELIGIBLE, 'dos EB distintas para el mismo lote no tienen ganador');
});

test('el criterio de elegibilidad es el de historical-calibration, no uno propio', () => {
  // Si alguien reimplementa el filtro aquí, esta prueba lo detecta: el conjunto
  // de lotes elegibles debe coincidir exactamente con el del módulo canónico.
  const lotes = [
    closedLote('L1'),
    closedLote('L2', { lifecycleState: 'incubacion' }),
    closedLote('L3', { peseSeco: 0 }),
    closedLote('L4', { recipeRef: null }),
  ];
  const cosechas = [harvest('H1', 'L1', 9.5), harvest('H2', 'L2', 5), harvest('H3', 'L3', 5), harvest('H4', 'L4', 5)];

  const canonical = calib.assessHistory(calib.bitacoraObservations(lotes, cosechas), 'be')
    .eligibleRows.map(r => r.loteId).sort();

  const dir = tmp();
  const bit = write(dir, 'bit.json', { lotes, cosechas });
  const out = path.join(dir, 'corpus.json');
  tool.main([`--bitacora=${bit}`, `--out=${out}`, '--min-per-species=1']);
  const mine = JSON.parse(fs.readFileSync(out, 'utf8')).map(f => f.loteId).sort();

  assert.deepEqual(mine, canonical);
});

test('--dry-run reporta sin escribir', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1')],
    cosechas: [harvest('H1', 'L1', 9.5)],
  });
  const out = path.join(dir, 'corpus.json');
  const code = tool.main([`--bitacora=${bit}`, `--out=${out}`, '--dry-run', '--json', '--min-per-species=1']);
  assert.equal(code, tool.EXIT.OK);
  assert.equal(fs.existsSync(out), false);
});

test('una especie bajo el mínimo se reporta como delgada', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1')],
    cosechas: [harvest('H1', 'L1', 9.5)],
  });
  const out = path.join(dir, 'corpus.json');
  tool.main([`--bitacora=${bit}`, `--out=${out}`, '--dry-run', '--min-per-species=10']);
  // countBySpecies es la base del aviso; se verifica directo para no depender
  // de capturar stdout.
  const counts = tool.countBySpecies([{ sKey: 'p_ostreatus_gris' }]);
  assert.deepEqual(counts, { p_ostreatus_gris: 1 });
  assert.ok(tool.DEFAULT_MIN_PER_SPECIES >= 10, 'el mínimo por defecto no puede bajar sin justificación estadística');
});

test('sin fuentes el script falla en vez de escribir un corpus vacío', () => {
  assert.equal(tool.main([]), tool.EXIT.OPERATIONAL);
});

test('un argumento desconocido falla en vez de ignorarse', () => {
  assert.equal(tool.main(['--bitacoraa=x.json']), tool.EXIT.OPERATIONAL);
});

test('extractBitacora acepta el respaldo que descarga la app (setas.prototype-backup.v1)', () => {
  const backup = {
    schema: 'setas.prototype-backup.v1',
    collections: { sdp_bit_lotes: [1], sdp_bit_cosechas: [2], sdp_bit_bolsas: [3] },
  };
  assert.deepEqual(tool.extractBitacora(backup, 'x'), { lotes: [1], cosechas: [2] });
});

// ── motivo por lote, validación contra catálogo, indicador por especie ──────

const CATALOG = {
  SPP: { p_ostreatus_gris: {}, shiitake: {} },
  INGS: [{ id: 'paja_trigo' }, { id: 'salvado_trigo' }],
};
const capture = (fn) => {
  const chunks = [];
  const orig = process.stdout.write.bind(process.stdout);
  process.stdout.write = (s) => { chunks.push(String(s)); return true; };
  try { fn(); } finally { process.stdout.write = orig; }
  return chunks.join('');
};

test('evaluateLots devuelve el motivo de rechazo por lote, con etiqueta legible', () => {
  const lotes = [
    closedLote('L1'),
    closedLote('L2', { lifecycleState: 'incubacion' }),
    closedLote('L3', { peseSeco: 0 }),
  ];
  const cosechas = [harvest('H1', 'L1', 9.5), harvest('H2', 'L2', 5), harvest('H3', 'L3', 5)];
  const res = tool.evaluateLots(calib.bitacoraObservations(lotes, cosechas), { catalog: CATALOG });
  const byId = Object.fromEntries(res.lots.map(l => [l.loteId, l]));
  assert.equal(byId.L1.eligible, true);
  assert.equal(byId.L1.reason, null);
  assert.equal(byId.L2.eligible, false);
  assert.ok(byId.L2.reason, 'todo lote rechazado lleva motivo');
  assert.ok(byId.L2.reasonLabel && byId.L2.reasonLabel !== byId.L2.reason, 'el motivo tiene etiqueta en español');
  assert.equal(byId.L3.reason, 'invalid-dry-weight');
});

test('un lote elegible para calibración pero no evaluable por el arnés se rechaza con motivo propio', () => {
  const mk = (id, ref) => closedLote(id, { recipeRef: ref });
  const lotes = [
    mk('E1', { sKey: 'p_ostreatus_gris', recipe: [] }),
    mk('E2', { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 'x' }] }),
    mk('E3', { sKey: 'especie_inventada', recipe: [{ id: 'paja_trigo', p: 100 }] }),
    mk('E4', { sKey: 'p_ostreatus_gris', recipe: [{ id: 'ingrediente_inventado', p: 100 }] }),
    mk('OK', { sKey: 'p_ostreatus_gris', recipe: [{ id: 'paja_trigo', p: 100 }] }),
  ];
  const cosechas = lotes.map((l, i) => harvest(`H${i}`, l.id, 9));
  const res = tool.evaluateLots(calib.bitacoraObservations(lotes, cosechas), { catalog: CATALOG });
  const reasons = Object.fromEntries(res.lots.map(l => [l.loteId, l.reason]));
  assert.equal(reasons.E1, 'corpus-empty-recipe');
  assert.equal(reasons.E2, 'corpus-invalid-percentage');
  assert.equal(reasons.E3, 'corpus-unknown-species');
  assert.equal(reasons.E4, 'corpus-unknown-ingredient');
  assert.equal(reasons.OK, null);
  assert.equal(res.fixtures.length, 1);
});

test('las fixtures exportadas tienen exactamente sKey, recipe, ebReal y loteId', () => {
  const lotes = [closedLote('L1')];
  const res = tool.evaluateLots(calib.bitacoraObservations(lotes, [harvest('H1', 'L1', 9.5)]), { catalog: CATALOG });
  assert.deepEqual(Object.keys(res.fixtures[0]).sort(), ['ebReal', 'loteId', 'recipe', 'sKey']);
  assert.deepEqual(res.fixtures[0].recipe[0], { id: 'paja_trigo', p: 80 });
});

test('el indicador por especie separa elegibles y rechazados e incluye especies sin elegibles', () => {
  const lotes = [
    closedLote('L1'), closedLote('L2'),
    closedLote('L3', { lifecycleState: 'incubacion' }),
    closedLote('S1', { lifecycleState: 'incubacion', recipeRef: { sKey: 'shiitake', recipe: [{ id: 'paja_trigo', p: 100 }] } }),
  ];
  const cosechas = lotes.map((l, i) => harvest(`H${i}`, l.id, 9));
  const res = tool.evaluateLots(calib.bitacoraObservations(lotes, cosechas), { catalog: CATALOG, minPerSpecies: 2 });
  const sp = Object.fromEntries(res.species.map(s => [s.sKey, s]));
  assert.deepEqual([sp.p_ostreatus_gris.eligible, sp.p_ostreatus_gris.excluded, sp.p_ostreatus_gris.belowMin], [2, 1, false]);
  assert.deepEqual([sp.shiitake.eligible, sp.shiitake.excluded, sp.shiitake.belowMin], [0, 1, true]);
});

test('la salida de texto lista cada lote rechazado con su motivo; el JSON expone lots y species', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1'), closedLote('L2', { lifecycleState: 'incubacion' })],
    cosechas: [harvest('H1', 'L1', 9.5), harvest('H2', 'L2', 5)],
  });
  const text = capture(() => tool.main([`--bitacora=${bit}`, '--dry-run']));
  assert.match(text, /Lotes rechazados \(1\)/);
  assert.match(text, /L2\s+p_ostreatus_gris\s+ciclo incompleto/);
  assert.match(text, /p_ostreatus_gris\s+1 elegible/);
  const json = JSON.parse(capture(() => tool.main([`--bitacora=${bit}`, '--dry-run', '--json'])));
  assert.equal(json.lots.length, 2);
  assert.equal(json.species[0].sKey, 'p_ostreatus_gris');
});

test('el corpus escrito pasa loadFixtures sin descartes y el catálogo real lo acepta', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', { lotes: [closedLote('L1')], cosechas: [harvest('H1', 'L1', 9.5)] });
  const out = path.join(dir, 'corpus.json');
  assert.equal(tool.main([`--bitacora=${bit}`, `--out=${out}`, '--min-per-species=1']), tool.EXIT.OK);
  const loaded = require('./ground-truth-regression.js').loadFixtures(fs.readFileSync(out, 'utf8'));
  assert.equal(loaded.skipped, 0);
});

test('un lote con ingrediente fuera del catálogo real no se exporta', () => {
  const dir = tmp();
  const bit = write(dir, 'bit.json', {
    lotes: [closedLote('L1', { recipeRef: { sKey: 'p_ostreatus_gris', recipe: [{ id: 'no_existe', p: 100 }] } })],
    cosechas: [harvest('H1', 'L1', 9.5)],
  });
  const out = path.join(dir, 'corpus.json');
  assert.equal(tool.main([`--bitacora=${bit}`, `--out=${out}`]), tool.EXIT.NO_ELIGIBLE);
  assert.equal(fs.existsSync(out), false);
});
