'use strict';
// Estado del nodo (setas.node-status.v1): solo lectura, por la ruta existente
// publicador → Firestore (telemetria_salas / telemetria_lecturas).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createPublisherHandler, createFirestorePublisher, ROOMS } = require('./telemetry-publisher/publisher.js');
const { parseFirestoreRoomDoc } = require('./live-telemetry-bridge.js');

const TOKEN = 'test-only-token-000000000000000000000000';
const CLOUDLAB = 'setas-cloudlab-01';
const nodeStatus = (over = {}) => ({
  schema: 'setas.node-status.v1', observed_at: new Date().toISOString(), commissioned: false,
  control_state: 'auto', heating_enabled: true, uptime_s: 600,
  relays: { light: false, circulation: true, heat: true, spare: false },
  relay_on_s: { light: 0, circulation: 300, heat: 200 }, alarms: [],
  setpoints: { consigna_id: 'rc-test-1@20261114T150000Z', heat_setpoint_c: 13.5, hysteresis_c: 0.5, temp_max_c: 24 },
  ...over,
});

function memoryFirestore() {
  const docs = new Map();
  const db = { collection: name => ({ doc: id => `${name}/${id}` }), runTransaction: async fn => {
    const writes = [];
    await fn({ get: async ref => ({ exists: docs.has(ref), data: () => docs.get(ref) }), set: (ref, data, options) => writes.push([ref, data, options]) });
    for (const [ref, data, options] of writes) docs.set(ref, options?.merge ? { ...docs.get(ref), ...data } : data);
  } };
  return { db, docs };
}

async function fixture(t, publish) {
  const devices = { [CLOUDLAB]: { roomId: 'cloudlab_844', token: TOKEN }, sht31: { roomId: 'martha_01', token: TOKEN } };
  const server = http.createServer(createPublisherHandler({ devices, publish }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = (data, device = CLOUDLAB) => fetch(`${base}/api/telemetry`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Setas-Device': device, Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(data) });
  send.base = base;
  return send;
}

test('node status travels with readings into the room document and history', async t => {
  const { db, docs } = memoryFirestore();
  const send = await fixture(t, createFirestorePublisher({ db, serverTimestamp: () => 'server-time' }));
  const at = new Date().toISOString();
  assert.equal((await send({ observed_at: at, readings: [{ metric: 'temperature_c', value: 14, observed_at: at }], node_status: nodeStatus({ observed_at: at }) })).status, 200);
  const room = docs.get('telemetria_salas/cloudlab_844');
  const st = room.device_readings[CLOUDLAB].node_status;
  assert.equal(st.relays.heat, true);
  assert.equal(st.setpoints.temp_max_c, 24);
  assert.equal(st.provenance, 'reported');
  assert.equal(room.metric_readings.temperature_c.value, 14);
  const rows = [...docs].filter(([ref]) => ref.startsWith('telemetria_lecturas/')).map(([, d]) => d);
  assert.equal(rows.length, 2);
  const statusRow = rows.find(r => r.record_type === 'node_status');
  assert.equal(statusRow.device_id, CLOUDLAB);
  assert.equal(statusRow.metric, undefined, 'status history is not a measurement');
  // The live bridge keeps reading metrics unaffected by the extra key.
  assert.equal(parseFirestoreRoomDoc('cloudlab_844', room).length, 1);
});

test('status-only packet (invalid sensor) still publishes the alarm', async t => {
  const { db, docs } = memoryFirestore();
  const send = await fixture(t, createFirestorePublisher({ db, serverTimestamp: () => 'server-time' }));
  const at = new Date().toISOString();
  const st = nodeStatus({ observed_at: at, control_state: 'alarm', alarms: ['sensor_invalid'], relays: { light: false, circulation: false, heat: false, spare: false } });
  assert.equal((await send({ observed_at: at, readings: [], node_status: st })).status, 200);
  assert.deepEqual(docs.get('telemetria_salas/cloudlab_844').device_readings[CLOUDLAB].node_status.alarms, ['sensor_invalid']);
  assert.equal(parseFirestoreRoomDoc('cloudlab_844', docs.get('telemetria_salas/cloudlab_844')), null, 'no fabricated reading');
});

test('node status retries are idempotent, conflicts rejected, older snapshots never win', async t => {
  const { db, docs } = memoryFirestore();
  let tick = 0;
  const send = await fixture(t, createFirestorePublisher({ db, serverTimestamp: () => ++tick }));
  const at = new Date().toISOString();
  const packetWith = st => ({ observed_at: st.observed_at, readings: [], node_status: st });
  assert.equal((await send(packetWith(nodeStatus({ observed_at: at })))).status, 200);
  const original = JSON.stringify([...docs]);
  assert.equal((await send(packetWith(nodeStatus({ observed_at: at })))).status, 200);
  assert.equal(JSON.stringify([...docs]), original, 'unchanged retry rewrites nothing');
  assert.equal((await send(packetWith(nodeStatus({ observed_at: at, relays: { light: false, circulation: true, heat: false, spare: false } })))).status, 409);
  assert.equal(JSON.stringify([...docs]), original);
  const older = new Date(Date.parse(at) - 60000).toISOString();
  assert.equal((await send(packetWith(nodeStatus({ observed_at: older, heating_enabled: false, control_state: 'disabled' })))).status, 200);
  assert.equal(docs.get('telemetria_salas/cloudlab_844').device_readings[CLOUDLAB].node_status.observed_at, at);
});

test('invalid or unprofiled node status never persists', async t => {
  let writes = 0;
  const send = await fixture(t, async () => { writes++; });
  const at = new Date().toISOString();
  const base = { observed_at: at, readings: [{ metric: 'temperature_c', value: 14, observed_at: at }] };
  assert.equal((await send({ ...base, node_status: nodeStatus({ relays: { humidifier: true } }) })).status, 422, 'relay outside profile');
  assert.equal((await send({ ...base, node_status: nodeStatus({ alarms: ['invented'] }) })).status, 422, 'alarm outside profile');
  assert.equal((await send({ ...base, node_status: nodeStatus({ relays: { heat: 'on' } }) })).status, 422);
  assert.equal((await send({ ...base, node_status: nodeStatus({ observed_at: new Date(Date.now() + 3600000).toISOString() }) })).status, 422, 'future status');
  assert.equal((await send({ ...base, node_status: 'heat=on' })).status, 422);
  assert.equal((await send({ observed_at: at, readings: [] })).status, 422, 'empty packet without status');
  // martha_01 has no control profile yet: it may not report a node status.
  assert.equal((await send({ ...base, node_status: nodeStatus() }, 'sht31')).status, 422);
  assert.equal(writes, 0);
});

test('publisher exposes no route that could reach a relay and replies with no commands', async t => {
  const send = await fixture(t, async () => {});
  for (const url of ['/api/actuators/override', '/api/commands', '/api/node-status']) {
    const r = await fetch(`${send.base}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(r.status, 404, url);
  }
  const body = await (await send({ observed_at: new Date().toISOString(), temperature_c: 14, node_status: nodeStatus() })).json();
  assert.deepEqual(Object.keys(body).sort(), ['count', 'node_status', 'success']);
});

test('allowed rooms come from node-control-profiles.json, not code', () => {
  const config = require('./node-control-profiles.json');
  assert.deepEqual([...ROOMS].sort(), [...config.rooms].sort());
  for (const p of Object.values(config.profiles)) assert.ok(ROOMS.has(p.roomId), p.roomId);
});
