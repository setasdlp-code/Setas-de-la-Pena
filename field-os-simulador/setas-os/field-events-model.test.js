'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

const {
  createFieldEvent,
  contentEquals,
  canonicalizeTimestamp,
  validateTransition,
  transitionClass,
} = require('./field-events-model.js');

test('should create immutable FieldEvent with stable UUID', () => {
  const event = createFieldEvent('lote_123', 'incubation', 'fruiting', 'op_123', '2026-09-06T14:30:00Z');

  assert.match(event.id, /^evt_[0-9a-f-]{36}$/);
  assert.equal(event.type, 'batch_state_transition');
  assert.equal(event.batchId, 'lote_123');
  assert.deepEqual(event.attachmentIds, []);
  assert.equal(event.payload.from, 'incubation');
  assert.equal(event.payload.to, 'fruiting');
  assert.ok(Object.isFrozen(event));
});

test('should generate a distinct id per event', () => {
  const a = createFieldEvent('l', 'incubation', 'fruiting', 'op', '2026-09-06T14:30:00Z');
  const b = createFieldEvent('l', 'incubation', 'fruiting', 'op', '2026-09-06T14:30:00Z');
  assert.notEqual(a.id, b.id);
});

test('should normalize timestamps: Z vs .000Z', () => {
  const ts1 = canonicalizeTimestamp('2026-09-06T14:30:00Z');
  const ts2 = canonicalizeTimestamp('2026-09-06T14:30:00.000Z');
  assert.equal(ts1, ts2);
  assert.match(ts1, /\.\d{3}Z$/);
});

test('should reject invalid timestamps', () => {
  assert.throws(() => canonicalizeTimestamp('not-a-date'), /canonicalization_failed/);
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
  const event2 = { ...event1, occurredAt: '2026-09-06T14:30:00.000Z' };

  assert.equal(contentEquals(event1, event2), true);
});

test('should ignore a server receipt when comparing content', () => {
  const base = {
    id: 'evt_1', type: 'batch_state_transition', batchId: 'l', expectedBatchRevision: 1,
    occurredAt: '2026-09-06T14:30:00Z', operatorId: 'op', source: 'mobile_qr',
    payload: { from: 'incubation', to: 'fruiting', reasonCode: null, notes: null },
    attachmentIds: [], metadata: {},
  };
  const stored = { ...base, receipt: { eventId: 'evt_1', acceptedAt: '2026-09-06T15:00:00Z' } };
  assert.equal(contentEquals(base, stored), true);
});

test('should detect content mismatch', () => {
  const a = { id: 'evt_1', payload: { to: 'fruiting' } };
  const b = { id: 'evt_1', payload: { to: 'maturation' } };
  assert.equal(contentEquals(a, b), false);
});

// --- Task 3: transition authorization -------------------------------------

test('headline flow inoculated -> incubation is allowed for every real role', () => {
  for (const role of ['operario', 'produccion', 'direccion']) {
    assert.equal(
      validateTransition({ state: 'inoculated' }, 'inoculated', 'incubation', role),
      true,
      `el rol ${role} debería poder avanzar de inoculated a incubation`
    );
  }
});

test('classifies transitions by destination', () => {
  assert.equal(transitionClass('incubation'), 'advance');
  assert.equal(transitionClass('quarantine'), 'exception');
  assert.equal(transitionClass('failed'), 'exception');
  assert.equal(transitionClass('discarded'), 'discard');
});

test('only direccion may discard', () => {
  assert.equal(validateTransition({ state: 'quarantine' }, 'quarantine', 'discarded', 'direccion'), true);
  assert.throws(
    () => validateTransition({ state: 'quarantine' }, 'quarantine', 'discarded', 'operario'),
    /unauthorized_action/
  );
  assert.throws(
    () => validateTransition({ state: 'quarantine' }, 'quarantine', 'discarded', 'produccion'),
    /unauthorized_action/
  );
});

test('operario may not send a batch to an exception state', () => {
  assert.equal(validateTransition({ state: 'incubation' }, 'incubation', 'quarantine', 'produccion'), true);
  assert.throws(
    () => validateTransition({ state: 'incubation' }, 'incubation', 'quarantine', 'operario'),
    /unauthorized_action/
  );
});

test('unknown role is rejected, never silently allowed', () => {
  for (const role of ['banana', 'standard', 'supervisor', undefined]) {
    assert.throws(
      () => validateTransition({ state: 'incubation' }, 'incubation', 'fruiting', role),
      /unknown_role/,
      `el rol ${role} no debería autorizarse`
    );
  }
});

test('should reject invalid state transition', () => {
  assert.throws(
    () => validateTransition({ state: 'incubation' }, 'incubation', 'planned', 'direccion'),
    /invalid_state_transition/
  );
});

test('should reject if from state does not match batch current state', () => {
  assert.throws(
    () => validateTransition({ state: 'fruiting' }, 'incubation', 'maturation', 'direccion'),
    /invalid_state_transition/
  );
});

// --- Task 3: browser loadability (F1 regression gate) ----------------------

test('both field-event modules load under a classic script tag', () => {
  for (const file of ['field-event-queue.js', 'field-events-model.js']) {
    const sandbox = { window: {}, indexedDB: {}, crypto, console };
    sandbox.globalThis = sandbox;
    sandbox.SetasOSWorkflow = require('./setas-os-workflow.js');
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });

    const published = Object.keys(sandbox).filter(k => k.startsWith('SetasFieldEvent'));
    assert.ok(published.length > 0, `${file} debería publicar un global`);
  }

  assert.ok(true);
});

test('browser-loaded model can create an event without require', () => {
  const sandbox = { window: {}, crypto, console };
  sandbox.globalThis = sandbox;
  sandbox.SetasOSWorkflow = require('./setas-os-workflow.js');
  vm.runInNewContext(fs.readFileSync('field-events-model.js', 'utf8'), sandbox, { filename: 'field-events-model.js' });

  const event = sandbox.SetasFieldEvents.createFieldEvent('l1', 'inoculated', 'incubation', 'op', '2026-09-06T14:30:00Z');
  assert.match(event.id, /^evt_/);
  // deepEqual falla entre realms del vm: el Array del sandbox tiene otro prototipo.
  assert.equal(event.attachmentIds.length, 0);
  assert.equal(
    sandbox.SetasFieldEvents.validateTransition({ state: 'inoculated' }, 'inoculated', 'incubation', 'operario'),
    true
  );
});
