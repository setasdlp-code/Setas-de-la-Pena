'use strict';
// compareNodeSetpoints: la consigna que REPORTA el nodo frente a la banda del
// ciclo de sala activo. Bandas de PRUEBA: no son consignas de la granja.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildNodeSubstitutions, compareNodeSetpoints, SETPOINT_TOLERANCE_C } = require('./room-node-setpoints.js');
const profiles = require('./node-control-profiles.json');

const profile = profiles.profiles.cloudlab_844;
const NOW = Date.parse('2026-11-14T15:00:00Z');
const cycle = (targets, extra = {}) => ({
  id: 'rc-test-1', roomId: 'cloudlab_844', speciesId: 'p_ostreatus_gris', batchIds: ['L-1'],
  stage: 'fruiting', state: 'active', startAt: '2026-11-01T00:00:00Z', targets, ...extra,
});
const BAND = { temperature_c: { min: 13, max: 24, source: 'kb-operational' } };
const compare = (setpoints, cycles = [cycle(BAND)], roomId = 'cloudlab_844') =>
  compareNodeSetpoints({ setpoints, roomId, cycles, now: NOW });

test('la consigna compilada desde el ciclo coincide con el ciclo (ida y vuelta con buildNodeSubstitutions)', () => {
  const built = buildNodeSubstitutions({ profile, cycles: [cycle(BAND)], operator: { histeresis_c: 0.5 }, now: NOW });
  assert.equal(built.ok, true);
  const s = built.substitutions;
  const r = compare({
    consigna_id: s.consigna_id, heat_setpoint_c: Number(s.heat_setpoint_c), hysteresis_c: Number(s.histeresis_c), temp_max_c: Number(s.temp_max_c),
  });
  assert.equal(r.state, 'match');
  assert.deepEqual(r.differences, []);
  assert.deepEqual(r.band, { min: 13, max: 24, source: 'kb-operational' });
  assert.equal(r.cycle.id, 'rc-test-1');
  assert.equal(r.compiledForCycleId, 'rc-test-1');
});

test('techo del nodo distinto de la banda: mismatch con los dos valores', () => {
  const r = compare({ consigna_id: 'rc-test-1@20261114T150000Z', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 26 });
  assert.equal(r.state, 'mismatch');
  assert.deepEqual(r.differences, [{ field: 'temp_max_c', label: 'techo de temperatura', reported: 26, expected: 24 }]);
});

test('arranque distinto de min + histéresis: mismatch, con la histéresis que reporta el nodo', () => {
  const r = compare({ consigna_id: 'x@1', heat_setpoint_c: 14.5, hysteresis_c: 0.5, temp_max_c: 24 });
  assert.equal(r.state, 'mismatch');
  assert.deepEqual(r.differences.map(d => [d.field, d.reported, d.expected]), [['heat_setpoint_c', 14.5, 13.5]]);
});

test('el nodo se compiló para otra banda: ambas diferencias', () => {
  const r = compare({ consigna_id: 'rc-viejo@20261001T000000Z', heat_setpoint_c: 17, hysteresis_c: 1, temp_max_c: 20 });
  assert.equal(r.state, 'mismatch');
  assert.deepEqual(r.differences.map(d => d.field).sort(), ['heat_setpoint_c', 'temp_max_c']);
  assert.equal(r.compiledForCycleId, 'rc-viejo');
});

test('diferencias menores que la precisión de la consigna (3 decimales) son la misma consigna', () => {
  assert.equal(SETPOINT_TOLERANCE_C, 0.001);
  const r = compare({ consigna_id: 'a@1', heat_setpoint_c: 13.5004, hysteresis_c: 0.5, temp_max_c: 24.0004 });
  assert.equal(r.state, 'match');
  const r2 = compare({ consigna_id: 'a@1', heat_setpoint_c: 13.502, hysteresis_c: 0.5, temp_max_c: 24 });
  assert.equal(r2.state, 'mismatch');
});

test('sin ciclo activo de la sala no hay con qué comparar (no se declara coincidencia)', () => {
  const r = compare({ consigna_id: 'a@1', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 24 }, []);
  assert.equal(r.state, 'no_cycle');
  assert.equal(r.cycle, null);
  assert.deepEqual(r.differences, []);
});

test('ciclo de otra sala, cerrado o aún no iniciado no cuenta como activo', () => {
  const sp = { consigna_id: 'a@1', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 24 };
  assert.equal(compare(sp, [cycle(BAND, { roomId: 'martha_01' })]).state, 'no_cycle');
  assert.equal(compare(sp, [cycle(BAND, { state: 'closed', endAt: '2026-11-10T00:00:00Z' })]).state, 'no_cycle');
  assert.equal(compare(sp, [cycle(BAND, { startAt: '2026-12-01T00:00:00Z' })]).state, 'no_cycle');
});

test('ciclo sin banda de temperatura, o sin min o max: no_band', () => {
  const sp = { consigna_id: 'a@1', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 24 };
  assert.equal(compare(sp, [cycle({ rh_pct: { min: 85, max: 95, source: 'manual' } })]).state, 'no_band');
  assert.equal(compare(sp, [cycle({ temperature_c: { max: 24, source: 'manual' } })]).state, 'no_band');
  assert.equal(compare(sp, [cycle({ temperature_c: { min: 25, max: 20, source: 'manual' } })]).state, 'no_band');
});

test('el nodo no reportó consigna: no_setpoints, nunca match', () => {
  assert.equal(compare({ consigna_id: 'a@1' }).state, 'no_setpoints');
  assert.equal(compare({}).state, 'no_setpoints');
  assert.equal(compare(null).state, 'no_setpoints');
  // Solo arranque y sin histéresis: no se puede derivar nada comparable.
  assert.equal(compare({ consigna_id: 'a@1', heat_setpoint_c: 13.5 }).state, 'no_setpoints');
});

test('solo techo reportado: se compara el techo', () => {
  assert.equal(compare({ temp_max_c: 24 }).state, 'match');
  assert.equal(compare({ temp_max_c: 23 }).state, 'mismatch');
});

test('la procedencia de la banda del ciclo viaja con la comparación', () => {
  const r = compare({ temp_max_c: 24 }, [cycle({ temperature_c: { min: 13, max: 24, source: 'kb-literature' } })]);
  assert.equal(r.band.source, 'kb-literature');
});

test('entradas inválidas no lanzan', () => {
  assert.equal(compareNodeSetpoints().state, 'no_cycle');
  assert.equal(compareNodeSetpoints({ roomId: 'cloudlab_844', now: NaN }).state, 'no_cycle');
});
