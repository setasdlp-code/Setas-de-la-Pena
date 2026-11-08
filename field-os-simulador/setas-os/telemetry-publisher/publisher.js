'use strict';
const { createHash, timingSafeEqual } = require('node:crypto');
const { adaptESP32Payload, METRIC_ALIASES } = require('../esp32-telemetry-adapter.js');
const { validateTelemetry } = require('../telemetry-contract.js');
const ROOMS = new Set(['martha_01', 'cloudlab_844', 'incubacion_01']);
const digest = value => createHash('sha256').update(value).digest();

function validateDevices(devices) {
  if (!devices || typeof devices !== 'object' || Array.isArray(devices) || !Object.keys(devices).length) throw new Error('Device assignments are required');
  for (const [id, device] of Object.entries(devices)) {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || !device || !ROOMS.has(device.roomId) || typeof device.token !== 'string' || device.token.length < 32) throw new Error('Invalid device assignment: use an allowed room and a token of at least 32 characters');
  }
  return devices;
}

// Writes raw sensor readings. The browser bridge owns CO2 compensation.
// Every metric keeps its own device, observation time and compensation flag.
function createFirestorePublisher({ db, serverTimestamp }) {
  return async readings => {
    const roomId = readings[0].room_id;
    const roomRef = db.collection('telemetria_salas').doc(roomId);
    const points = new Map();
    const conflict = () => Object.assign(new Error('Conflicting observation identity'), { code: 'observation_conflict' });
    for (const reading of readings) {
      const historyId = digest(JSON.stringify([reading.room_id, reading.device_id, reading.metric, reading.observed_at])).toString('hex');
      const point = {
        room_id: roomId, metric: reading.metric, value: reading.value, unit: reading.unit,
        observed_at: reading.observed_at, device_id: reading.device_id,
        source: 'esp32_hardware', quality: 'valid',
        co2_pressure_compensated: reading.co2_pressure_compensated === true,
      };
      if (points.has(historyId) && JSON.stringify(points.get(historyId)) !== JSON.stringify(point)) throw conflict();
      points.set(historyId, point);
    }
    await db.runTransaction(async tx => {
      const snap = await tx.get(roomRef);
      // Firestore requires all reads before writes. Repeated observations are
      // immutable, including their original receipt time.
      const history = await Promise.all([...points].map(async ([id, point]) => {
        const ref = db.collection('telemetria_lecturas').doc(id);
        return { ref, point, existing: await tx.get(ref) };
      }));
      for (const { point, existing } of history) {
        if (existing.exists && Object.entries(point).some(([key, value]) => existing.data()[key] !== value)) throw conflict();
      }
      const additions = history.filter(row => !row.existing.exists);
      if (!additions.length) return;
      const previous = snap.exists ? snap.data() : {};
      const metrics = { ...(previous.metric_readings || {}) };
      for (const { point, ref } of additions) {
        tx.set(ref, { ...point, received_at: serverTimestamp() });
        const { room_id, ...metricPoint } = point;
        const oldTime = Date.parse(metrics[point.metric]?.observed_at);
        if (!Number.isFinite(oldTime) || Date.parse(point.observed_at) >= oldTime) metrics[point.metric] = metricPoint;
      }
      tx.set(roomRef, { room_id: roomId, metric_readings: metrics, last_updated: serverTimestamp() }, { merge: true });
    });
  };
}

function createPublisherHandler({ devices, publish, now = Date.now }) {
  validateDevices(devices);
  if (typeof publish !== 'function') throw new Error('Publisher is required');
  return async (req, res) => {
    const reply = (code, body) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
    if (req.method !== 'POST' || req.url !== '/api/telemetry') return reply(404, { error: 'not_found' });
    const deviceId = req.headers['x-setas-device'];
    const device = typeof deviceId === 'string' && Object.hasOwn(devices, deviceId) ? devices[deviceId] : null;
    const auth = req.headers.authorization || '';
    if (!device || !auth.startsWith('Bearer ') || !timingSafeEqual(digest(auth.slice(7)), digest(device.token))) return reply(401, { error: 'unauthorized' });
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reply(415, { error: 'json_required' });
    try {
      const chunks = [];
      let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 16384) return reply(413, { error: 'payload_too_large' });
        chunks.push(chunk);
      }
      let packet;
      try { packet = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return reply(400, { error: 'invalid_json' }); }
      if (!packet || typeof packet !== 'object' || Array.isArray(packet)) return reply(400, { error: 'invalid_packet' });
      if ((packet.room_id && packet.room_id !== device.roomId) || (packet.device_id && packet.device_id !== deviceId)) return reply(403, { error: 'assignment_mismatch' });
      // Require a sensor clock: receipt time must never masquerade as observation.
      if (!packet.observed_at || !Number.isFinite(Date.parse(packet.observed_at))) return reply(422, { error: 'observation_time_required' });
      const entries = Array.isArray(packet.readings) ? packet.readings.map(item => item?.value) : Object.entries(packet).filter(([key]) => Object.hasOwn(METRIC_ALIASES, key)).map(([, value]) => value);
      if (!entries.length || entries.some(value => typeof value !== 'number' || !Number.isFinite(value))) return reply(422, { error: 'numeric_measurements_required' });
      const readings = adaptESP32Payload({ ...packet, room_id: device.roomId, device_id: deviceId, source: 'esp32_hardware' });
      if (!readings.length || readings.some(r => validateTelemetry(r).length || r.quality !== 'valid' || Date.parse(r.observed_at) > now() + 60000)) return reply(422, { error: 'invalid_measurements' });
      try { await publish(readings); } catch (err) {
        if (err.code === 'observation_conflict') return reply(409, { error: 'observation_conflict', retryable: false });
        return reply(503, { error: 'persistence_unavailable', retryable: true });
      }
      return reply(200, { success: true, count: readings.length });
    } catch { if (!res.writableEnded) return reply(400, { error: 'invalid_request' }); }
  };
}
module.exports = { createPublisherHandler, createFirestorePublisher, validateDevices };
