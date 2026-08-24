'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeRoomCycle, validateRoomCycle, isActiveAt, containsBatch } = require('./room-cycle.js');

const base = (overrides = {}) => ({
  id: 'RC_1', roomId: 'ROOM_CLOUDLAB', speciesId: 'lions_mane', batchIds: ['BIT_1'],
  stage: 'fruiting', state: 'active', startAt: '2026-08-24T08:00:00-05:00',
  targets: { temperature_c: { min: 16, target: 18, max: 20 }, rh_pct: { min: 90, max: 96 } },
  ...overrides,
});

test('RoomCycle válido normaliza ids duplicados y conserva targets', () => {
  const cycle = normalizeRoomCycle(base({ batchIds: ['BIT_1', 'BIT_1', 'BIT_2'] }));
  assert.deepEqual(cycle.batchIds, ['BIT_1', 'BIT_2']);
  assert.equal(cycle.schema, 'setas.room-cycle.v1');
  assert.equal(cycle.targets.temperature_c.target, 18);
  assert.deepEqual(validateRoomCycle(cycle), []);
});

test('RoomCycle rechaza cierre sin fin, fechas invertidas y targets incoherentes', () => {
  const errors = validateRoomCycle(base({
    state: 'closed', endAt: '2026-08-23T08:00:00-05:00',
    targets: { rh_pct: { min: 95, target: 90, max: 92 } },
  }));
  assert.ok(errors.includes('endAt precedes startAt'));
  assert.ok(errors.some(e => e.includes('rh_pct: min exceeds max')));
  assert.ok(errors.some(e => e.includes('rh_pct: target below min')));
  assert.ok(validateRoomCycle(base({ state: 'closed', endAt: null })).includes('closed cycle requires endAt'));
});

test('RoomCycle resuelve pertenencia temporal y de lote', () => {
  const cycle = normalizeRoomCycle(base({ endAt: '2026-08-24T20:00:00-05:00' }));
  assert.equal(isActiveAt(cycle, '2026-08-24T12:00:00-05:00'), true);
  assert.equal(isActiveAt(cycle, '2026-08-25T12:00:00-05:00'), false);
  assert.equal(containsBatch(cycle, 'BIT_1'), true);
  assert.equal(containsBatch(cycle, 'BIT_X'), false);
});
