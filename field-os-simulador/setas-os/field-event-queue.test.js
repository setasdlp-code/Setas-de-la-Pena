'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Setup fake-indexeddb for Node.js testing
require('fake-indexeddb/auto');

const { initializeQueue, persistFieldEvent, getReservation, releaseReservation, queryPendingByStatus, recoverEventsByAccount } = require('./field-event-queue.js');

test('FieldEventQueue', async (t) => {
  let db;

  t.before(async () => {
    db = await initializeQueue('test-queue');
  });

  t.after(async () => {
    db.close();
    indexedDB.deleteDatabase('test-queue');
  });

  await t.test('should create ObjectStores on initialization', async () => {
    const stores = db.objectStoreNames;
    assert.ok(Array.from(stores).includes('field_events'));
    assert.ok(Array.from(stores).includes('queue_entries'));
    assert.ok(Array.from(stores).includes('pending_batch_transitions'));
    assert.ok(Array.from(stores).includes('auth_receipts'));
  });

  await t.test('should persist event, queue entry, and reservation atomically', async () => {
    const event = {
      id: 'evt_test_1',
      type: 'batch_state_transition',
      batchId: 'lote_123',
      payload: { from: 'incubation', to: 'fruiting' },
      operatorId: 'op_123',
    };
    const queueEntry = {
      eventId: 'evt_test_1',
      accountId: 'account_123',
      status: 'pending',
    };

    await persistFieldEvent(db, event, queueEntry, 'account_123');

    // Verify event was written
    const storedEvent = await new Promise((resolve, reject) => {
      const tx = db.transaction('field_events', 'readonly');
      const store = tx.objectStore('field_events');
      const req = store.get('evt_test_1');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    assert.ok(storedEvent, 'Event should be stored');
    assert.equal(storedEvent.id, 'evt_test_1');
  });

  await t.test('should prevent duplicate reservation for same batch', async () => {
    const event1 = {
      id: 'evt_dup_1',
      type: 'batch_state_transition',
      batchId: 'lote_dup',
      payload: { from: 'incubation', to: 'fruiting' },
      operatorId: 'op_123',
    };
    const queueEntry1 = {
      eventId: 'evt_dup_1',
      accountId: 'account_123',
      status: 'pending',
    };

    await persistFieldEvent(db, event1, queueEntry1, 'account_123');

    // Try to persist another event for the same batch
    const event2 = {
      id: 'evt_dup_2',
      type: 'batch_state_transition',
      batchId: 'lote_dup',
      payload: { from: 'incubation', to: 'maturation' },
      operatorId: 'op_456',
    };
    const queueEntry2 = {
      eventId: 'evt_dup_2',
      accountId: 'account_123',
      status: 'pending',
    };

    try {
      await persistFieldEvent(db, event2, queueEntry2, 'account_123');
      assert.fail('Should throw error for duplicate reservation');
    } catch (e) {
      assert.match(e.message, /batch_already_has_pending_transition/);
    }
  });

  await t.test('should get reservation by accountId and batchId', async () => {
    const event = {
      id: 'evt_res_1',
      type: 'batch_state_transition',
      batchId: 'lote_res',
      payload: { from: 'incubation', to: 'fruiting' },
      operatorId: 'op_123',
    };
    const queueEntry = {
      eventId: 'evt_res_1',
      accountId: 'account_res',
      status: 'pending',
    };

    await persistFieldEvent(db, event, queueEntry, 'account_res');

    const reservation = await getReservation(db, 'account_res', 'lote_res');
    assert.ok(reservation, 'Reservation should exist');
    assert.equal(reservation.eventId, 'evt_res_1');
    assert.equal(reservation.accountId, 'account_res');
    assert.equal(reservation.batchId, 'lote_res');
  });

  await t.test('should return null for non-existent reservation', async () => {
    const reservation = await getReservation(db, 'account_xyz', 'lote_xyz');
    assert.equal(reservation, null);
  });

  await t.test('should release reservation', async () => {
    const event = {
      id: 'evt_rel_1',
      type: 'batch_state_transition',
      batchId: 'lote_rel',
      payload: { from: 'incubation', to: 'fruiting' },
      operatorId: 'op_123',
    };
    const queueEntry = {
      eventId: 'evt_rel_1',
      accountId: 'account_rel',
      status: 'pending',
    };

    await persistFieldEvent(db, event, queueEntry, 'account_rel');

    // Release the reservation, naming the event that owns it
    const released = await releaseReservation(db, 'account_rel', 'lote_rel', 'evt_rel_1');
    assert.equal(released, 'released');

    // Verify it's gone
    const reservation = await getReservation(db, 'account_rel', 'lote_rel');
    assert.equal(reservation, null);
  });

  await t.test('should not release a reservation owned by a newer event', async () => {
    const event = {
      id: 'evt_guard_new',
      batchId: 'lote_guard',
      type: 'batch_state_transition',
    };
    const queueEntry = {
      eventId: 'evt_guard_new',
      accountId: 'account_guard',
      status: 'pending',
    };

    await persistFieldEvent(db, event, queueEntry, 'account_guard');

    // A delayed response for an older event must not release the newer reservation
    const released = await releaseReservation(db, 'account_guard', 'lote_guard', 'evt_guard_old');
    assert.equal(released, 'not_owner', 'debe distinguirse de "no existía"');

    const reservation = await getReservation(db, 'account_guard', 'lote_guard');
    assert.ok(reservation, 'la reserva del evento nuevo debe seguir viva');
    assert.equal(reservation.eventId, 'evt_guard_new');
  });

  await t.test('should report an absent reservation distinctly from a foreign one', async () => {
    const outcome = await releaseReservation(db, 'account_none', 'lote_none', 'evt_whatever');
    assert.equal(outcome, 'absent');
  });

  await t.test('should require expectedEventId to release', async () => {
    await assert.rejects(
      () => releaseReservation(db, 'account_guard', 'lote_guard'),
      /expectedEventId/
    );
  });

  await t.test('should query pending entries by status', async () => {
    const event1 = {
      id: 'evt_pend_1',
      type: 'batch_state_transition',
      batchId: 'lote_p1',
      payload: { from: 'incubation', to: 'fruiting' },
      operatorId: 'op_123',
    };
    const queueEntry1 = {
      eventId: 'evt_pend_1',
      accountId: 'account_pend',
      status: 'pending',
    };

    const event2 = {
      id: 'evt_pend_2',
      type: 'batch_state_transition',
      batchId: 'lote_p2',
      payload: { from: 'fruiting', to: 'harvest' },
      operatorId: 'op_123',
    };
    const queueEntry2 = {
      eventId: 'evt_pend_2',
      accountId: 'account_pend',
      status: 'confirmed',
    };

    await persistFieldEvent(db, event1, queueEntry1, 'account_pend');
    await persistFieldEvent(db, event2, queueEntry2, 'account_pend');

    const pending = await queryPendingByStatus(db, 'pending');
    const pendingIds = pending.map(p => p.eventId);

    assert.ok(pendingIds.includes('evt_pend_1'));
    assert.ok(!pendingIds.includes('evt_pend_2'));
  });

  await t.test('should recover events by account', async () => {
    const event1 = {
      id: 'evt_rec_1',
      type: 'batch_state_transition',
      batchId: 'lote_rec_1',
      payload: { from: 'incubation', to: 'fruiting' },
      operatorId: 'op_123',
    };
    const queueEntry1 = {
      eventId: 'evt_rec_1',
      accountId: 'account_rec_1',
      status: 'pending',
    };

    const event2 = {
      id: 'evt_rec_2',
      type: 'batch_state_transition',
      batchId: 'lote_rec_2',
      payload: { from: 'fruiting', to: 'harvest' },
      operatorId: 'op_456',
    };
    const queueEntry2 = {
      eventId: 'evt_rec_2',
      accountId: 'account_rec_2',
      status: 'pending',
    };

    await persistFieldEvent(db, event1, queueEntry1, 'account_rec_1');
    await persistFieldEvent(db, event2, queueEntry2, 'account_rec_2');

    const recovered = await recoverEventsByAccount(db, 'account_rec_1');
    const recoveredIds = recovered.map(r => r.event.id);

    assert.ok(recoveredIds.includes('evt_rec_1'));
    assert.ok(!recoveredIds.includes('evt_rec_2'));
  });
});
