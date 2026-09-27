'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const lifecycle = require('./recipe-lifecycle.js');

const AT_1 = '2026-09-01T10:00:00-05:00';
const AT_2 = '2026-09-10T10:00:00-05:00';

const approvedRecipe = () => Object.freeze({
  recipeId: 'SHIITAKE-ASERRIN',
  version: 3,
  status: 'approved',
  name: 'Shiitake aserrín',
  sKey: 'shiitake',
  recipe: [
    { id: 'aserrin_roble', p: 80 },
    { id: 'salvado_trigo', p: 20 },
  ],
  cn: 32,
  eb: 1.8,
  cost: 4500,
  humedadObjetivo: 62,
  lifecycleLog: [
    { from: 'trial', to: 'approved', actor: 'sebastian', role: 'direccion', at: AT_1, reason: null },
  ],
});

test('una receta aprobada no se puede editar', () => {
  assert.throws(
    () => lifecycle.assertEditable(approvedRecipe()),
    /una receta aprobada no se edita: crea una versión nueva/,
  );
});

test('newVersionFrom devuelve v2 en draft conservando recipeId y anotando derivedFrom, sin mutar la original', () => {
  const original = approvedRecipe();
  const nueva = lifecycle.newVersionFrom(original, { cn: 30 }, { actor: 'ana', at: AT_2 });

  assert.equal(nueva.recipeId, 'SHIITAKE-ASERRIN');
  assert.equal(nueva.version, 4);
  assert.equal(nueva.status, 'draft');
  assert.equal(nueva.cn, 30);
  assert.deepEqual(nueva.derivedFrom, { recipeId: 'SHIITAKE-ASERRIN', version: 3 });

  // La original no se mutó: sigue aprobada, en v3, sin derivedFrom.
  assert.equal(original.status, 'approved');
  assert.equal(original.version, 3);
  assert.equal(original.derivedFrom, undefined);
  assert.equal(original.cn, 32);
});

test('approved no puede volver a draft', () => {
  assert.equal(lifecycle.canTransition('approved', 'draft'), false);
  assert.throws(
    () => lifecycle.assertTransition('approved', 'draft'),
    /Transición no permitida: approved → draft/,
  );
  // El único camino para cambiar una receta aprobada es versionarla.
  assert.ok(lifecycle.canTransition('approved', 'retired'));
});

test('un operario no puede aprobar ni retirar; dirección sí', () => {
  const trial = Object.freeze({ ...approvedRecipe(), status: 'trial', version: 2 });

  assert.throws(
    () => lifecycle.promote(trial, 'approved', { actor: 'op-1', role: 'operario', at: AT_2 }),
    /Sólo dirección puede promover/,
  );
  assert.throws(
    () => lifecycle.promote(approvedRecipe(), 'retired', { actor: 'op-1', role: 'operario', at: AT_2 }),
    /Sólo dirección puede promover/,
  );

  const aprobada = lifecycle.promote(trial, 'approved', { actor: 'sebastian', role: 'direccion', at: AT_2, reason: 'ensayo exitoso' });
  assert.equal(aprobada.status, 'approved');
  assert.equal(aprobada.lifecycleLog.at(-1).from, 'trial');
  assert.equal(aprobada.lifecycleLog.at(-1).to, 'approved');
  assert.equal(aprobada.lifecycleLog.at(-1).role, 'direccion');

  // draft→trial lo puede hacer cualquiera que formule (no exige dirección).
  const draft = Object.freeze({ ...approvedRecipe(), status: 'draft', version: 1, lifecycleLog: [] });
  const enEnsayo = lifecycle.promote(draft, 'trial', { actor: 'op-1', role: 'operario', at: AT_1 });
  assert.equal(enEnsayo.status, 'trial');
});

test('el snapshot congela los parámetros de producción y deja en null los que la receta no declara, sin inventarlos', () => {
  const receta = Object.freeze({
    recipeId: 'PLEUROTUS-PAJA',
    version: 1,
    status: 'approved',
    name: 'Pleurotus paja',
    sKey: 'pleurotus',
    recipe: [{ id: 'paja_arroz', p: 100 }],
    cn: 45,
    eb: 1.5,
    cost: 2000,
    humedadObjetivo: 65,
    // tratamiento y spawn NO se declaran: deben quedar null, no inventados.
  });
  const snap = lifecycle.buildProductionSnapshot(receta, { at: AT_1 });

  assert.equal(snap.schema, 'setas.recipe-snapshot.v1');
  assert.equal(snap.recipeId, 'PLEUROTUS-PAJA');
  assert.equal(snap.version, 1);
  assert.equal(snap.status, 'approved');
  assert.equal(snap.humedadObjetivo, 65);
  assert.equal(snap.tratamientoTermico, null);
  assert.equal(snap.spawnRatePct, null);
  assert.deepEqual(snap.ingredients, [{ id: 'paja_arroz', pct: 100 }]);
  assert.equal(snap.snapshotAt, AT_1);
});

test('editar la receta después de crear el snapshot no cambia el snapshot', () => {
  // Es el caso que motiva todo el módulo: el lote histórico debe seguir
  // diciendo la verdad aunque la receta cambie después de producir.
  const receta = approvedRecipe();
  const snap = lifecycle.buildProductionSnapshot(receta, { at: AT_1 });

  const editada = lifecycle.newVersionFrom(receta, { cn: 99, humedadObjetivo: 70 }, { actor: 'ana', at: AT_2 });
  const aprobadaEditada = lifecycle.promote(
    lifecycle.promote(editada, 'trial', { actor: 'ana', role: 'operario', at: AT_2 }),
    'approved', { actor: 'sebastian', role: 'direccion', at: AT_2 },
  );

  assert.equal(snap.cn, 32);
  assert.equal(snap.humedadObjetivo, 62);
  assert.equal(snap.version, 3);
  // La edición produjo una receta distinta (v4), el snapshot no se enteró.
  assert.equal(aprobadaEditada.version, 4);
  assert.equal(aprobadaEditada.cn, 99);
});

test('migrateLegacyRecipe es idempotente y marca legacy, no draft ni approved', () => {
  const cruda = { id: 1694000000000, name: 'Shiitake aserrín', sKey: 'shiitake', recipe: [{ id: 'aserrin_roble', p: 100 }], date: '2026-06-01', eb: 1.8, cn: 32, score: 78, cost: 4200 };
  const migrada = lifecycle.migrateLegacyRecipe(cruda);

  assert.equal(migrada.status, 'legacy');
  assert.equal(migrada.recipeId, 'SHIITAKE-ASERRIN');
  assert.equal(migrada.version, 1);
  assert.deepEqual(migrada.lifecycleLog, []);
  assert.notEqual(migrada.status, 'draft');
  assert.notEqual(migrada.status, 'approved');

  // Idempotente: si ya tiene status, se devuelve tal cual (misma referencia).
  const otraVez = lifecycle.migrateLegacyRecipe(migrada);
  assert.equal(otraVez, migrada);
});

test('describeSnapshot distingue visiblemente una receta sin versionar de una aprobada', () => {
  const legacySnap = lifecycle.buildProductionSnapshot(
    lifecycle.migrateLegacyRecipe({ name: 'Shiitake aserrín', recipe: [{ id: 'aserrin_roble', p: 100 }] }),
    { at: AT_1 },
  );
  const approvedSnap = lifecycle.buildProductionSnapshot(approvedRecipe(), { at: AT_1 });

  assert.equal(lifecycle.describeSnapshot(legacySnap), 'SHIITAKE-ASERRIN v1 · Sin versionar');
  assert.equal(lifecycle.describeSnapshot(approvedSnap), 'SHIITAKE-ASERRIN v3 · Aprobada');
  assert.notEqual(lifecycle.describeSnapshot(legacySnap), lifecycle.describeSnapshot(approvedSnap));
});

test('isProductionReady rechaza una receta en ensayo y explica por qué', () => {
  const enEnsayo = Object.freeze({ ...approvedRecipe(), status: 'trial' });
  const resultado = lifecycle.isProductionReady(enEnsayo);

  assert.equal(resultado.ready, false);
  assert.ok(resultado.reasons.some(r => r.includes('no está aprobada')));

  const aprobadaOk = lifecycle.isProductionReady(approvedRecipe());
  assert.equal(aprobadaOk.ready, true);
  assert.deepEqual(aprobadaOk.reasons, []);

  const sinIngredientes = Object.freeze({ ...approvedRecipe(), recipe: [] });
  const resultadoVacio = lifecycle.isProductionReady(sinIngredientes);
  assert.equal(resultadoVacio.ready, false);
  assert.ok(resultadoVacio.reasons.some(r => r.includes('no tiene ingredientes')));

  const desbalanceada = Object.freeze({ ...approvedRecipe(), recipe: [{ id: 'aserrin_roble', p: 40 }] });
  const resultadoDesbalanceado = lifecycle.isProductionReady(desbalanceada);
  assert.equal(resultadoDesbalanceado.ready, false);
  assert.ok(resultadoDesbalanceado.reasons.some(r => r.includes('balance de masa')));
});

test('el estado del ciclo de vida y la viabilidad del perito son independientes', () => {
  // Este módulo no lee ni deriva nada de la viabilidad del perito
  // (approved/review/hold de scoring.js / recetario-model-bridge.js): esa es
  // una opinión técnica sobre qué tan prometedora es la formulación, mientras
  // que el `status` de este módulo es la autorización de producción. Una
  // receta puede estar `approved` en el ciclo de vida con viabilidad `review`
  // del perito, y sigue siendo `approved` — promote()/isProductionReady() no
  // toman ni tocan ese campo en ningún momento.
  const receta = Object.freeze({ ...approvedRecipe(), peritoViability: 'review' });

  assert.equal(receta.status, 'approved');
  assert.equal(receta.peritoViability, 'review');
  assert.equal(lifecycle.isProductionReady(receta).ready, true);

  const retirada = lifecycle.promote(receta, 'retired', { actor: 'sebastian', role: 'direccion', at: AT_2 });
  assert.equal(retirada.status, 'retired');
  // La viabilidad del perito no cambió ni fue tocada por el ciclo de vida.
  assert.equal(retirada.peritoViability, 'review');
});
