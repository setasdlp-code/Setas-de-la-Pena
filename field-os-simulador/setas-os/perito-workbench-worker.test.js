'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const workerApi = require('./perito-workbench-worker.js');

test('Worker handleWorkerMessage responde a PING con PONG y conserva requestId', () => {
  const res = workerApi.handleWorkerMessage({ type: 'PING', requestId: 'req-42' });
  assert.equal(res.type, 'PONG');
  assert.equal(res.requestId, 'req-42');
});

test('Worker FILTER_PARETO descarta candidatos dominados de forma determinista', () => {
  const candidates = [
    { id: 'c1', score: 85, eb: 110, cost: 600 },
    { id: 'c2', score: 92, eb: 140, cost: 950 },
    { id: 'c3', score: 80, eb: 100, cost: 1000 }, // dominado
  ];
  const res = workerApi.handleWorkerMessage({
    type: 'FILTER_PARETO',
    requestId: 'req-pareto-1',
    payload: { candidates },
  });

  assert.equal(res.type, 'PARETO_COMPLETE');
  assert.equal(res.requestId, 'req-pareto-1');
  assert.equal(res.paretoFrontier.length, 2);
  assert.ok(res.paretoFrontier.some(c => c.id === 'c1'));
  assert.ok(res.paretoFrontier.some(c => c.id === 'c2'));
  assert.ok(!res.paretoFrontier.some(c => c.id === 'c3'));
});

test('Worker SEARCH_SCENARIOS calcula escenarios por perfil sin bloquear el hilo', () => {
  const res = workerApi.handleWorkerMessage({
    type: 'SEARCH_SCENARIOS',
    requestId: 'req-search-99',
    payload: {
      targetKey: 'p_ostreatus_gris',
      recipe: [],
      lockedIds: [],
      ingredients: [
        { id: 'paja_trigo', name: 'Paja', role: 'base_carbono', cn: 80, n: 0.6, moisture: 10, cost: 400 },
        { id: 'salvado_trigo', name: 'Salvado', role: 'suplemento_n', cn: 16, n: 2.8, moisture: 12, cost: 1200 },
      ],
      spp: {
        p_ostreatus_gris: {
          name: 'Orellana Gris',
          supplementation_max: 20,
          cn_optimal: { min: 30, max: 45, ideal: 38 },
          n_optimal: { min: 1.0, max: 2.0 },
          eb_baseline: 80,
          eb_optimal: 120,
        },
      },
      profileKeys: ['produccion'],
    },
  });

  assert.equal(res.type, 'SEARCH_COMPLETE');
  assert.equal(res.requestId, 'req-search-99');
  assert.ok(res.byProfile);
  assert.ok(Array.isArray(res.byProfile.produccion));
});

test('Protocolo de descarte por requestId: solicitudes obsoletas se ignoran correctamente', () => {
  let activeRequestId = 0;
  let lastProcessedState = null;

  const dispatch = (id) => {
    activeRequestId = id;
  };

  const onResponse = (res) => {
    if (res.requestId !== activeRequestId) {
      // Ignorada por obsoleta
      return false;
    }
    lastProcessedState = res.requestId;
    return true;
  };

  // Disparo 1 (e.g. usuario mueve slider a pos 1)
  dispatch(1);
  // Inmediatamente disparo 2 (usuario mueve slider a pos 2)
  dispatch(2);

  // Llega respuesta rezagada de 1: debe ser descartada
  const handled1 = onResponse({ type: 'SEARCH_COMPLETE', requestId: 1 });
  assert.equal(handled1, false, 'La respuesta 1 debe ser descartada');
  assert.equal(lastProcessedState, null);

  // Llega respuesta de 2: debe ser aceptada
  const handled2 = onResponse({ type: 'SEARCH_COMPLETE', requestId: 2 });
  assert.equal(handled2, true, 'La respuesta 2 debe ser aceptada');
  assert.equal(lastProcessedState, 2);
});
