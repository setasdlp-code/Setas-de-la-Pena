'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { createFieldEvent, contentEquals, canonicalizeTimestamp } = require('./field-events-model.js');

test('should create immutable FieldEvent with stable UUID', () => {
  const event = createFieldEvent(
    'lote_123',
    'incubation',
    'fruiting',
    'op_123',
    '2026-09-06T14:30:00Z'
  );

  assert.match(event.id, /^evt_/);
  assert.equal(event.type, 'batch_state_transition');
  assert.equal(event.batchId, 'lote_123');
  assert.deepEqual(event.attachmentIds, []);
  assert.equal(event.payload.from, 'incubation');
  assert.equal(event.payload.to, 'fruiting');
});

test('should normalize timestamps: Z vs .000Z', () => {
  const ts1 = canonicalizeTimestamp('2026-09-06T14:30:00Z');
  const ts2 = canonicalizeTimestamp('2026-09-06T14:30:00.000Z');
  assert.equal(ts1, ts2);
  assert.match(ts1, /\.\d{3}Z$/);
});

test('should reject invalid timestamps', () => {
  assert.throws(
    () => canonicalizeTimestamp('not-a-date'),
    /canonicalization_failed/
  );
});

test('should compare events with content normalization', () => {
  const event1 = {
    id: 'evt_1',
    type: 'batch_state_transition',
    batchId: 'lote_123',
    expectedBatchRevision: 12,
    occurredAt: '2026-09-06T14:30:00Z',
    operatorId: 'op_123',
    source: 'mobile_qr',
    payload: { from: 'incubation', to: 'fruiting', reasonCode: null, notes: null },
    attachmentIds: [],
    metadata: {},
  };

  const event2 = {
    ...event1,
    occurredAt: '2026-09-06T14:30:00.000Z', // Different representation
  };

  assert.equal(contentEquals(event1, event2), true);
});

test('should detect content mismatch', () => {
  const event1 = { id: 'evt_1', payload: { to: 'fruiting' } };
  const event2 = { id: 'evt_1', payload: { to: 'maturation' } };
  assert.equal(contentEquals(event1, event2), false);
});
