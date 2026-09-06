'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

const {
  ERROR_CODES,
  DEFAULT_INITIAL_STATE,
  RECEIPT_FIELDS,
  isRetryable,
  buildRequestEnvelope,
  validateReceipt,
} = require('./field-event-contracts.js');

const validEvent = () => ({
  schemaVersion: 1,
  id: 'evt_1',
  type: 'batch_state_transition',
  batchId: 'lote_1',
  expectedBatchRevision: 3,
  occurredAt: '2026-09-06T14:30:00.000Z',
  operatorId: 'op_1',
  source: 'mobile_qr',
  payload: { from: 'inoculated', to: 'incubation', reasonCode: null, notes: null },
  attachmentIds: [],
  metadata: {},
});

const validReceipt = () => ({
  eventId: 'evt_1',
  acceptedAt: '2026-09-06T14:31:00.000Z',
  batchRevisionAfter: 4,
  serverEventPath: 'field_events/evt_1',
});

test('envelope carries schemaVersion, accountId and the event', () => {
  const env = buildRequestEnvelope(validEvent(), 'account_1');
  assert.equal(env.schemaVersion, 1);
  assert.equal(env.accountId, 'account_1');
  assert.equal(env.event.id, 'evt_1');
});

test('el sobre lleva exactamente los campos del contrato, ni uno más', () => {
  // El sobre es el contrato de cable. Un campo de más entra sin que nada falle
  // y queda ahí para siempre: la única defensa es fijar la forma exacta.
  const env = buildRequestEnvelope(validEvent(), 'account_1');
  assert.deepEqual(Object.keys(env).sort(), ['accountId', 'event', 'schemaVersion']);
});

test('envelope rejects attachments — v1 defers photos entirely', () => {
  const withAttachment = { ...validEvent(), attachmentIds: ['photo_1'] };
  assert.throws(() => buildRequestEnvelope(withAttachment, 'account_1'), /attachmentIds/);
});

test('envelope rejects a missing attachmentIds array', () => {
  const { attachmentIds, ...noField } = validEvent();
  assert.throws(() => buildRequestEnvelope(noField, 'account_1'), /attachmentIds/);
});

test('envelope requires an accountId', () => {
  assert.throws(() => buildRequestEnvelope(validEvent(), ''), /accountId/);
});

test('validateReceipt accepts a complete receipt', () => {
  assert.equal(validateReceipt(validReceipt()), true);
});

test('validateReceipt rejects a receipt missing any required field', () => {
  for (const field of RECEIPT_FIELDS) {
    const partial = validReceipt();
    delete partial[field];
    assert.throws(
      () => validateReceipt(partial),
      new RegExp(`incomplete_event_record.*${field}`),
      `debería rechazar un recibo sin "${field}"`
    );
  }
});

test('validateReceipt rejects a non-positive or non-integer revision', () => {
  for (const bad of [0, -1, 2.5, '4']) {
    const r = { ...validReceipt(), batchRevisionAfter: bad };
    assert.throws(() => validateReceipt(r), /incomplete_event_record/, `revisión inválida: ${bad}`);
  }
});

test('validateReceipt rejects a missing receipt', () => {
  assert.throws(() => validateReceipt(null), /incomplete_event_record/);
});

test('only network_error is retryable', () => {
  assert.equal(isRetryable('network_error'), true);
  for (const code of Object.keys(ERROR_CODES)) {
    if (code === 'network_error') continue;
    assert.equal(isRetryable(code), false, `${code} no debería reintentarse`);
  }
});

test('an unknown error code is rejected rather than assumed terminal', () => {
  assert.throws(() => isRetryable('not_a_code'), /unknown_error_code/);
});

test('contracts load with neither indexedDB nor firebase present', () => {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync('field-event-contracts.js', 'utf8'), sandbox, {
    filename: 'field-event-contracts.js',
  });

  assert.ok(sandbox.SetasFieldEventContracts, 'debería publicar su global');
  assert.equal(sandbox.SetasFieldEventContracts.isRetryable('network_error'), true);
});

test('exports DEFAULT_INITIAL_STATE as inoculated', () => {
  assert.equal(DEFAULT_INITIAL_STATE, 'inoculated');
});
