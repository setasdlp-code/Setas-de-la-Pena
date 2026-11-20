'use strict';
const { createHash, timingSafeEqual } = require('node:crypto');
const { adaptESP32Payload, METRIC_ALIASES } = require('../esp32-telemetry-adapter.js');
const { validateTelemetry, validateNodeStatus, normalizeNodeStatus } = require('../telemetry-contract.js');
// Allowed rooms and per-room node profiles live in configuration, not code:
// adding a room is an entry in node-control-profiles.json (see esphome/CONTRATO_NODOS.md).
const NODE_PROFILES = require('../node-control-profiles.json');
const ROOMS = new Set(NODE_PROFILES.rooms);
const digest = value => createHash('sha256').update(value).digest();

function validateDevices(devices) {
  if (!devices || typeof devices !== 'object' || Array.isArray(devices) || !Object.keys(devices).length) throw new Error('Device assignments are required');
  for (const [id, device] of Object.entries(devices)) {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || !device || !ROOMS.has(device.roomId) || typeof device.token !== 'string' || device.token.length < 32) throw new Error('Invalid device assignment: use an allowed room and a token of at least 32 characters');
    // Optional mounting position inside the room (e.g. "altura bloques"). Declared by the operator, never inferred.
    if (device.position !== undefined && (typeof device.position !== 'string' || !/^[\p{L}\p{N} _.,\-]{1,40}$/u.test(device.position))) throw new Error('Invalid device position: use up to 40 letters, digits, spaces or . , _ -');
  }
  return devices;
}

// Writes raw sensor readings and, when a control node reports it, its
// read-only node status (setas.node-status.v1). The browser bridge owns CO2
// compensation. Every metric keeps its own device, observation time and
// compensation flag. Node status never becomes a command: there is no route
// back to the node.
function createFirestorePublisher({ db, serverTimestamp }) {
  return async (readings, meta = {}) => {
    const roomId = meta.roomId || readings[0].room_id;
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
      if (reading.position) point.position = reading.position;
      if (points.has(historyId) && JSON.stringify(points.get(historyId)) !== JSON.stringify(point)) throw conflict();
      points.set(historyId, point);
    }
    // Node status history shares telemetria_lecturas (no new collection, no rule
    // change), distinguished by record_type; it has no `metric` and no `value`.
    let statusRow = null;
    if (meta.nodeStatus) {
      const status = normalizeNodeStatus(meta.nodeStatus);
      const id = digest(JSON.stringify(['node_status', roomId, meta.deviceId, status.observed_at])).toString('hex');
      statusRow = { id, point: { record_type: 'node_status', room_id: roomId, device_id: meta.deviceId, observed_at: status.observed_at, source: 'esp32_firmware', status } };
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
        // Position is descriptive metadata: relabelling a node must not turn a retry into a conflict.
        if (existing.exists && Object.entries(point).some(([key, value]) => key !== 'position' && existing.data()[key] !== value)) throw conflict();
      }
      let statusAddition = null;
      if (statusRow) {
        const ref = db.collection('telemetria_lecturas').doc(statusRow.id);
        const existing = await tx.get(ref);
        if (existing.exists && JSON.stringify(existing.data().status) !== JSON.stringify(statusRow.point.status)) throw conflict();
        if (!existing.exists) statusAddition = { ref, point: statusRow.point };
      }
      const additions = history.filter(row => !row.existing.exists);
      if (!additions.length && !statusAddition) return;
      const previous = snap.exists ? snap.data() : {};
      const metrics = { ...(previous.metric_readings || {}) };
      // Per-device snapshot: two nodes in one room must not overwrite each other.
      // `metric_readings` stays as the room headline for older readers.
      const deviceReadings = {};
      for (const [id, entry] of Object.entries(previous.device_readings || {})) deviceReadings[id] = { ...entry, metrics: { ...(entry.metrics || {}) } };
      for (const { point, ref } of additions) {
        tx.set(ref, { ...point, received_at: serverTimestamp() });
        const { room_id, ...metricPoint } = point;
        const oldTime = Date.parse(metrics[point.metric]?.observed_at);
        if (!Number.isFinite(oldTime) || Date.parse(point.observed_at) >= oldTime) metrics[point.metric] = metricPoint;
        const dev = deviceReadings[point.device_id] || (deviceReadings[point.device_id] = { metrics: {} });
        dev.position = point.position || null;
        const devOld = Date.parse(dev.metrics[point.metric]?.observed_at);
        if (!Number.isFinite(devOld) || Date.parse(point.observed_at) >= devOld) dev.metrics[point.metric] = metricPoint;
      }
      if (statusAddition) {
        tx.set(statusAddition.ref, { ...statusAddition.point, received_at: serverTimestamp() });
        const dev = deviceReadings[meta.deviceId] || (deviceReadings[meta.deviceId] = { metrics: {} });
        dev.position = meta.position || dev.position || null;
        // A delayed status packet stays in history but cannot replace a newer snapshot.
        const oldStatus = Date.parse(dev.node_status?.observed_at);
        if (!Number.isFinite(oldStatus) || Date.parse(statusAddition.point.observed_at) >= oldStatus) dev.node_status = statusAddition.point.status;
      }
      tx.set(roomRef, { room_id: roomId, metric_readings: metrics, device_readings: deviceReadings, last_updated: serverTimestamp() }, { merge: true });
    });
  };
}

function createPublisherHandler({ devices, publish, now = Date.now, profiles = NODE_PROFILES.profiles }) {
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
      // Optional read-only node status. Only rooms with a control profile may
      // report one, and its relays/alarms must be those the profile declares.
      let nodeStatus = null;
      if (packet.node_status !== undefined) {
        const profile = profiles && Object.hasOwn(profiles, device.roomId) ? profiles[device.roomId] : null;
        if (!profile) return reply(422, { error: 'node_status_without_profile' });
        if (validateNodeStatus(packet.node_status, profile).length || Date.parse(packet.node_status.observed_at) > now() + 60000) return reply(422, { error: 'invalid_node_status' });
        nodeStatus = packet.node_status;
      }
      const entries = Array.isArray(packet.readings) ? packet.readings.map(item => item?.value) : Object.entries(packet).filter(([key]) => Object.hasOwn(METRIC_ALIASES, key)).map(([, value]) => value);
      // A status-only packet is valid: an invalid sensor sends no reading, and
      // its alarm must still reach Setas OS.
      if ((!entries.length && !nodeStatus) || entries.some(value => typeof value !== 'number' || !Number.isFinite(value))) return reply(422, { error: 'numeric_measurements_required' });
      // Position comes from the gateway's private assignment, never from the node's own packet.
      const readings = entries.length ? adaptESP32Payload({ ...packet, readings: Array.isArray(packet.readings) ? packet.readings.map(item => ({ ...item, position: undefined })) : packet.readings, room_id: device.roomId, device_id: deviceId, position: device.position || null, source: 'esp32_hardware' }) : [];
      if ((!readings.length && !nodeStatus) || readings.some(r => validateTelemetry(r).length || r.quality !== 'valid' || Date.parse(r.observed_at) > now() + 60000)) return reply(422, { error: 'invalid_measurements' });
      try { await publish(readings, { roomId: device.roomId, deviceId, position: device.position || null, nodeStatus }); } catch (err) {
        if (err.code === 'observation_conflict') return reply(409, { error: 'observation_conflict', retryable: false });
        return reply(503, { error: 'persistence_unavailable', retryable: true });
      }
      return reply(200, { success: true, count: readings.length, node_status: Boolean(nodeStatus) });
    } catch { if (!res.writableEnded) return reply(400, { error: 'invalid_request' }); }
  };
}
module.exports = { createPublisherHandler, createFirestorePublisher, validateDevices, ROOMS };
