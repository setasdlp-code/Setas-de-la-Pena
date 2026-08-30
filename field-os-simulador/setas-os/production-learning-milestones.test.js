'use strict';
// Verifica que CycleEvidence se materialice automáticamente en los hitos de
// cosecha (harvest) y cierre de ciclo (cycle-close), sin duplicar registros y
// sin producir evidencia para lotes que no pertenecen al ciclo solicitado.
// production-learning-bridge.js corre en el navegador (localStorage/window);
// aquí se emula ese entorno mínimamente para ejercitarlo bajo `node --test`.
import test from 'node:test';
import assert from 'node:assert/strict';

class FakeStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

globalThis.localStorage = new FakeStorage();
globalThis.window = new EventTarget();
globalThis.SetasDB = {};
globalThis.SetasBitacoraDB = { guardarCosecha: async (cosecha) => cosecha };

const bridgeMod = await import('./production-learning-bridge.js');
const bridge = bridgeMod.default || globalThis.SetasProductionLearning;

const readJson = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const resetStorage = () => {
  localStorage.clear();
};

const seedBatch = ({ batchId, cosechas = [] }) => {
  writeJson('sdp_bit_lotes', [
    ...readJson('sdp_bit_lotes'),
    { id: batchId, codigo: `SDP-${batchId}`, peseSeco: 2, costoIngKg: 1500, fechaInoculacion: '2026-08-01' },
  ]);
  writeJson('sdp_bit_bolsas', [
    ...readJson('sdp_bit_bolsas'),
    { id: `${batchId}_B1`, loteId: batchId, estado: 'sana', col100: '2026-08-16' },
  ]);
  writeJson('sdp_bit_cosechas', [...readJson('sdp_bit_cosechas'), ...cosechas]);
};

test('SetasProductionLearning expone los hitos de harvest y cycle-close', () => {
  assert.equal(typeof bridge.onHarvestRecorded, 'function');
  assert.equal(typeof bridge.onCycleClosed, 'function');
});

test('hito de cosecha: materializa CycleEvidence una sola vez por lote+ciclo', () => {
  resetStorage();
  const cycle = bridge.upsertRoomCycle({
    id: 'RC_HARVEST', roomId: 'ROOM_1', speciesId: 'lions_mane', batchIds: ['BIT_H'],
    stage: 'fruiting', state: 'active', startAt: '2026-08-01T00:00:00-05:00',
  });
  seedBatch({ batchId: 'BIT_H', cosechas: [{ id: 'COS_1', loteId: 'BIT_H', flush: 1, pesoFresco: 500, fecha: '2026-08-20' }] });

  bridge.onHarvestRecorded({ batchId: 'BIT_H' });

  const evidence = readJson('sdp_cycle_evidence_v1');
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].sourceId, cycle.id);
  assert.equal(evidence[0].batchId, 'BIT_H');
  assert.equal(evidence[0].metrics.total_fresh_kg, 0.5);
});

test('hito de cosecha: re-disparar el mismo hito no duplica el registro (idempotente)', () => {
  resetStorage();
  bridge.upsertRoomCycle({
    id: 'RC_HARVEST2', roomId: 'ROOM_1', speciesId: 'lions_mane', batchIds: ['BIT_H2'],
    stage: 'fruiting', state: 'active', startAt: '2026-08-01T00:00:00-05:00',
  });
  seedBatch({ batchId: 'BIT_H2', cosechas: [{ id: 'COS_2', loteId: 'BIT_H2', flush: 1, pesoFresco: 300, fecha: '2026-08-20' }] });

  bridge.onHarvestRecorded({ batchId: 'BIT_H2' });
  bridge.onHarvestRecorded({ batchId: 'BIT_H2' });

  const evidence = readJson('sdp_cycle_evidence_v1');
  assert.equal(evidence.length, 1);
});

test('hito de cosecha: un lote sin ciclo asociado no produce evidencia', () => {
  resetStorage();
  seedBatch({ batchId: 'BIT_ORPHAN', cosechas: [{ id: 'COS_3', loteId: 'BIT_ORPHAN', flush: 1, pesoFresco: 300, fecha: '2026-08-20' }] });

  assert.doesNotThrow(() => bridge.onHarvestRecorded({ batchId: 'BIT_ORPHAN' }));

  const evidence = readJson('sdp_cycle_evidence_v1');
  assert.equal(evidence.length, 0);
});

test('materializeCycleEvidence sigue rechazando un lote que no pertenece al ciclo (verificación de propiedad)', () => {
  resetStorage();
  bridge.upsertRoomCycle({
    id: 'RC_OWNER', roomId: 'ROOM_1', speciesId: 'lions_mane', batchIds: ['BIT_OWNED'],
    stage: 'fruiting', state: 'active', startAt: '2026-08-01T00:00:00-05:00',
  });
  seedBatch({ batchId: 'BIT_FOREIGN', cosechas: [] });

  assert.throws(
    () => bridge.materializeCycleEvidence({ cycleId: 'RC_OWNER', batchId: 'BIT_FOREIGN' }),
    /no pertenece al ciclo/,
  );
  assert.equal(readJson('sdp_cycle_evidence_v1').length, 0);
});

test('hito de cierre de ciclo: upsertRoomCycle con state closed materializa evidencia para cada lote del ciclo', () => {
  resetStorage();
  seedBatch({ batchId: 'BIT_CLOSE', cosechas: [{ id: 'COS_4', loteId: 'BIT_CLOSE', flush: 1, pesoFresco: 700, fecha: '2026-08-20' }] });

  bridge.upsertRoomCycle({
    id: 'RC_CLOSE', roomId: 'ROOM_1', speciesId: 'lions_mane', batchIds: ['BIT_CLOSE'],
    stage: 'fruiting', state: 'closed',
    startAt: '2026-08-01T00:00:00-05:00', endAt: '2026-08-24T00:00:00-05:00',
  });

  const evidence = readJson('sdp_cycle_evidence_v1');
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].sourceId, 'RC_CLOSE');
  assert.equal(evidence[0].batchId, 'BIT_CLOSE');
});

test('hito de cierre de ciclo: re-guardar el mismo ciclo cerrado no duplica evidencia', () => {
  resetStorage();
  seedBatch({ batchId: 'BIT_CLOSE2', cosechas: [{ id: 'COS_5', loteId: 'BIT_CLOSE2', flush: 1, pesoFresco: 200, fecha: '2026-08-20' }] });

  const input = {
    id: 'RC_CLOSE2', roomId: 'ROOM_1', speciesId: 'lions_mane', batchIds: ['BIT_CLOSE2'],
    stage: 'fruiting', state: 'closed',
    startAt: '2026-08-01T00:00:00-05:00', endAt: '2026-08-24T00:00:00-05:00',
  };
  bridge.upsertRoomCycle(input);
  bridge.upsertRoomCycle(input);

  assert.equal(readJson('sdp_cycle_evidence_v1').length, 1);
});

test('el hito de cosecha se dispara automáticamente al envolver SetasBitacoraDB.guardarCosecha', async () => {
  resetStorage();
  globalThis.SetasBitacoraDB.__productionLearningWrapped = false;
  globalThis.SetasBitacoraDB.guardarCosecha = async (cosecha) => cosecha;
  bridge.upsertRoomCycle({
    id: 'RC_WRAP', roomId: 'ROOM_1', speciesId: 'lions_mane', batchIds: ['BIT_WRAP'],
    stage: 'fruiting', state: 'active', startAt: '2026-08-01T00:00:00-05:00',
  });
  seedBatch({ batchId: 'BIT_WRAP', cosechas: [] });
  window.dispatchEvent(new CustomEvent('setas-bitacora-db-ready'));

  const cosecha = { id: 'COS_WRAP', loteId: 'BIT_WRAP', flush: 1, pesoFresco: 400, fecha: '2026-08-20' };
  writeJson('sdp_bit_cosechas', [...readJson('sdp_bit_cosechas'), cosecha]);
  await globalThis.SetasBitacoraDB.guardarCosecha(cosecha);

  const evidence = readJson('sdp_cycle_evidence_v1');
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].batchId, 'BIT_WRAP');
});
