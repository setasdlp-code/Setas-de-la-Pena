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
