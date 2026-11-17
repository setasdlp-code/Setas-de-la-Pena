'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createPublisherHandler, createFirestorePublisher } = require('./telemetry-publisher/publisher.js');
const { createLiveTelemetryBridge, parseFirestoreRoomDoc } = require('./live-telemetry-bridge.js');
const TOKEN = 'test-only-token-000000000000000000000000';
const devices = { sht31: { roomId: 'martha_01', token: TOKEN } };
const packet = () => ({ observed_at: new Date().toISOString(), temperature_c: 18, rh_pct: 85, co2_ppm: 600, co2_pressure_compensated: true });

async function fixture(t, publish) {
  const server = http.createServer(createPublisherHandler({ devices, publish }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return (data, options = {}) => fetch(`http://127.0.0.1:${server.address().port}/api/telemetry`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Setas-Device': 'sht31', Authorization: `Bearer ${TOKEN}`, ...options.headers }, body: JSON.stringify(data) });
}

test('publisher binds authenticated node to room and awaits durable acceptance', async t => {
  let received;
  const send = await fixture(t, async readings => { received = readings; });
  const response = await send(packet());
  assert.equal(response.status, 200);
  assert.equal(received.length, 3);
  assert.ok(received.every(r => r.device_id === 'sht31' && r.room_id === 'martha_01'));
  assert.equal(received.find(r => r.metric === 'co2_ppm').co2_pressure_compensated, true);
});

test('unauthorized, cross-room, missing, impossible and oversized packets never persist', async t => {
  let writes = 0;
  const send = await fixture(t, async () => { writes++; });
  assert.equal((await send(packet(), { headers: { Authorization: 'Bearer wrong' } })).status, 401);
  assert.equal((await send({ ...packet(), room_id: 'cloudlab_844' })).status, 403);
  assert.equal((await send({ ...packet(), device_id: 'other' })).status, 403);
  assert.equal((await send({ temperature_c: 18 })).status, 422);
  assert.equal((await send({ ...packet(), temperature_c: null })).status, 422);
  assert.equal((await send({ ...packet(), rh_pct: 101 })).status, 422);
  assert.equal((await send({ ...packet(), temperature_c: '18' })).status, 422);
  assert.equal((await send({ ...packet(), padding: 'x'.repeat(17000) })).status, 413);
  assert.equal(writes, 0);
});

test('Firestore failure returns retryable 503 without exposing internal errors', async t => {
  const send = await fixture(t, async () => { throw new Error('private server detail'); });
  const response = await send(packet());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'persistence_unavailable', retryable: true });
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

test('HTTP to Firestore document to live bridge preserves partial sensor times and compensated CO2', async t => {
  const { db, docs } = memoryFirestore();
  const publish = createFirestorePublisher({ db, serverTimestamp: () => 'server-time' });
  const send = await fixture(t, publish);
  const first = packet();
  assert.equal((await send(first)).status, 200);
  assert.equal((await send(first)).status, 200);
  assert.equal(docs.size, 4, 'same device/metric/time retry is idempotent');
  const later = new Date(Date.parse(first.observed_at) + 1000).toISOString();
  assert.equal((await send({ observed_at: later, temperature_c: 19 })).status, 200);
  assert.equal((await send({ observed_at: new Date(Date.parse(first.observed_at) - 1000).toISOString(), rh_pct: 80 })).status, 200);
  const doc = docs.get('telemetria_salas/martha_01');
  assert.equal(doc.metric_readings.rh_pct.value, 85);
  assert.equal(doc.metric_readings.co2_ppm.observed_at, first.observed_at);
  let snapshot;
  const bridge = createLiveTelemetryBridge({ transports: [{ kind: 'firestore' }], factories: { firestore: (cfg, handlers) => { snapshot = handlers.onSnapshot; return { close() {} }; } } });
  bridge.start();
  t.after(() => bridge.stop());
  snapshot({ martha_01: doc });
  assert.equal(bridge.getSample('martha_01').temperature_c, 19);
  assert.equal(bridge.getSample('martha_01').rh_pct, 85);
  assert.equal(bridge.getSample('martha_01').co2_ppm, 600);
  assert.equal(bridge.getSnapshot().rooms.martha_01.latest.co2_ppm.observed_at, first.observed_at);
  assert.equal(parseFirestoreRoomDoc('martha_01', doc).length, 3);
});

test('unchanged retries preserve receipt time; conflicts cannot rewrite measured history', async t => {
  const { db, docs } = memoryFirestore();
  let tick = 0;
  const send = await fixture(t, createFirestorePublisher({ db, serverTimestamp: () => ++tick }));
  const first = packet();
  assert.equal((await send(first)).status, 200);
  const original = JSON.stringify([...docs]);
  assert.equal((await send(first)).status, 200);
  assert.equal(JSON.stringify([...docs]), original);
  assert.equal((await send({ ...first, rh_pct: 20 })).status, 409);
  assert.equal(JSON.stringify([...docs]), original);
  assert.equal((await send({ observed_at: first.observed_at, readings: [
    { metric: 'rh_pct', value: 30 }, { metric: 'rh_pct', value: 40 },
  ] })).status, 409);
  assert.equal(JSON.stringify([...docs]), original);
});

test('two nodes in one room keep their own readings, positions and a spread between them', async t => {
  const { db, docs } = memoryFirestore();
  const publish = createFirestorePublisher({ db, serverTimestamp: () => 'server-time' });
  const roomDevices = {
    'nodo-bloques': { roomId: 'cloudlab_844', token: TOKEN, position: 'altura bloques' },
    'nodo-niebla': { roomId: 'cloudlab_844', token: TOKEN, position: 'salida de niebla' },
  };
  const server = http.createServer(createPublisherHandler({ devices: roomDevices, publish }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const send = (device, data) => fetch(`http://127.0.0.1:${server.address().port}/api/telemetry`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Setas-Device': device, Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(data) });
  const at = new Date().toISOString();
  // A node cannot relabel itself: the position in its own packet is ignored.
  assert.equal((await send('nodo-bloques', { observed_at: at, temperature_c: 18, rh_pct: 86, position: 'inventada' })).status, 200);
  assert.equal((await send('nodo-niebla', { observed_at: at, temperature_c: 16.5, rh_pct: 95 })).status, 200);
  const doc = docs.get('telemetria_salas/cloudlab_844');
  assert.equal(doc.device_readings['nodo-bloques'].position, 'altura bloques');
  assert.equal(doc.device_readings['nodo-bloques'].metrics.temperature_c.value, 18);
  assert.equal(doc.device_readings['nodo-niebla'].metrics.rh_pct.value, 95);
  const history = [...docs].filter(([ref]) => ref.startsWith('telemetria_lecturas/')).map(([, data]) => data);
  assert.equal(history.length, 4);
  assert.ok(history.every(row => row.position === roomDevices[row.device_id].position));

  let snapshot;
  const bridge = createLiveTelemetryBridge({ transports: [{ kind: 'firestore' }], factories: { firestore: (cfg, handlers) => { snapshot = handlers.onSnapshot; return { close() {} }; } } });
  bridge.start();
  t.after(() => bridge.stop());
  snapshot({ cloudlab_844: doc });
  const room = bridge.getSnapshot().rooms.cloudlab_844;
  assert.deepEqual(Object.keys(room.devices).sort(), ['nodo-bloques', 'nodo-niebla']);
  assert.equal(room.devices['nodo-niebla'].position, 'salida de niebla');
  assert.equal(room.devices['nodo-bloques'].latest.temperature_c.value, 18);
  assert.equal(room.devices['nodo-bloques'].freshMetrics.temperature_c, true);
  assert.equal(room.spread.temperature_c.delta, 1.5);
  assert.equal(room.spread.rh_pct.count, 2);
  assert.equal(room.spread.co2_ppm, undefined, 'no spread without two fresh nodes');
});

test('device position must be a short plain label', () => {
  const base = { roomId: 'martha_01', token: TOKEN };
  assert.throws(() => createPublisherHandler({ devices: { n: { ...base, position: '<script>' } }, publish: async () => {} }), /position/);
  assert.throws(() => createPublisherHandler({ devices: { n: { ...base, position: 'x'.repeat(41) } }, publish: async () => {} }), /position/);
  assert.doesNotThrow(() => createPublisherHandler({ devices: { n: { ...base, position: 'Estante 2, atrás' } }, publish: async () => {} }));
});
