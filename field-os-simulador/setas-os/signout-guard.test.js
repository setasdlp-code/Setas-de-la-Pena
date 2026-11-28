'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const guard = require('./signout-guard.js');
const deviceSync = require('./device-sync.js');

const memStorage = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    keys: () => [...m.keys()],
  };
};

test('sin colas ni escrituras a medias no hay trabajo pendiente', () => {
  const s = memStorage({ sdp_sync_queue: '[]', sdp_inventory_ops: JSON.stringify([{ opId: 'a', status: 'synced' }]) });
  const c = guard.pendingWork({ storage: s, fieldEntries: [{ status: 'confirmed' }, { status: 'rejected' }] });
  assert.equal(c.total, 0);
  assert.equal(guard.describeBlocked(c), null);
});

test('cada fuente de trabajo sin sincronizar bloquea el cierre de sesión', () => {
  assert.equal(guard.pendingWork({ storage: memStorage({ sdp_sync_queue: JSON.stringify([{ id: 'x', status: 'stuck' }]) }) }).sync, 1);
  assert.equal(guard.pendingWork({ storage: memStorage({ sdp_inventory_ops: JSON.stringify([{ opId: 'a', status: 'pending' }]) }) }).inventory, 1);
  assert.equal(guard.pendingWork({ storage: memStorage(), fieldEntries: [{ status: 'retry_wait' }, { status: 'queued' }] }).fieldEvents, 2);
  assert.equal(guard.pendingWork({ storage: memStorage({ sdp_pending_write_v1: '{"schema":"setas.local-write.v1"}' }) }).interruptedWrite, 1);
});

test('una cola ilegible cuenta como pendiente: ante la duda no se borra nada', () => {
  const c = guard.pendingWork({ storage: memStorage({ sdp_sync_queue: '{roto', sdp_inventory_ops: '{"no":"lista"}' }) });
  assert.ok(c.total >= 2);
  assert.match(guard.describeBlocked(c), /Bitácora ilegible/);
  assert.match(guard.describeBlocked(c), /Bodega ilegible/);
});

test('el mensaje de bloqueo nombra lo que falta sincronizar', () => {
  const s = memStorage({ sdp_sync_queue: JSON.stringify([{}, {}, {}]) });
  const msg = guard.describeBlocked(guard.pendingWork({ storage: s, fieldEntries: [{ status: 'retry_wait' }] }));
  assert.match(msg, /3 cambios de Bitácora/);
  assert.match(msg, /1 evento de campo/);
});

test('las claves sincronizadas salen de device-sync y el respaldo coincide con ellas', () => {
  const keys = guard.syncedLocalKeys(deviceSync);
  for (const c of Object.values(deviceSync.COLLECTIONS)) assert.ok(keys.includes(c.localKey), c.localKey);
  assert.ok(keys.includes(deviceSync.BASE_KEY));
  assert.ok(keys.includes(deviceSync.LEDGER_KEY));
  assert.ok(keys.includes('sdp_lotes'));
  assert.deepEqual([...keys].sort(), [...guard.FALLBACK_SYNCED_KEYS].sort());
  assert.deepEqual([...guard.syncedLocalKeys(null)].sort(), [...keys].sort());
});

test('clearSyncedLocal borra solo copias de Firestore y colas; conserva lo local', () => {
  const local = {
    setas_v6: '[{"receta":1}]', sdp_bit_tasks: '[1]', sdp_room_events: '[1]', sdp_experiments_v1: '[1]',
    sdp_culture_lineage_v1: '[1]', sdp_recovery_archive_v1: '{}', sdp_device_id: 'dev-1', sdp_seeded: '1',
  };
  const synced = { sdp_bit_lotes: '[1]', sdp_bit_bolsas: '[1]', sdp_inv_ledger: '[1]', sdp_sync_base_v1: '[1]', sdp_lotes: '[1]', sdp_sync_queue: '[]', sdp_inventory_ops: '[]' };
  const s = memStorage({ ...local, ...synced });
  const removed = guard.clearSyncedLocal(s, guard.syncedLocalKeys(deviceSync));
  assert.deepEqual([...removed].sort(), Object.keys(synced).sort());
  for (const [k, v] of Object.entries(local)) assert.equal(s.getItem(k), v, `${k} debe conservarse`);
});

test('auth-gate bloquea con trabajo pendiente y limpia la caché de Firestore al cerrar sesión', () => {
  const gate = fs.readFileSync(path.join(__dirname, 'firebase/auth-gate.js'), 'utf8');
  assert.match(gate, /"\.\.\/signout-guard\.js"/);
  const fn = gate.slice(gate.indexOf('async function cerrarSesion('));
  assert.ok(fn.length > 30, 'cerrarSesion debe existir');
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.ok(body.indexOf('pendingWork') > 0 && body.indexOf('pendingWork') < body.lastIndexOf('signOut(auth)'), 'revisa pendientes antes de cerrar sesión');
  assert.match(body, /clearIndexedDbPersistence/);
  assert.match(body, /clearSyncedLocal/);
  assert.match(gate, /signoutBtn\.addEventListener\("click", \(\) => cerrarSesion\(/);
  assert.match(gate, /window\.__setasSignOut = \(\) => cerrarSesion\(/);
  assert.doesNotMatch(gate, /=> signOut\(auth\)\)?;?\n/);
});
