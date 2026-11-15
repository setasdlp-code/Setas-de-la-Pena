'use strict';
// SETAS OS — contrato canónico de telemetría para sensores de sala/sustrato.
// Los límites físicos sirven solo para validar calidad de lectura; NO son targets
// de cultivo y nunca deben reutilizarse como setpoints.
(function () {
  const SCHEMA = 'setas.telemetry.v1';
  const VALID_QUALITY = new Set(['valid', 'suspect', 'quarantined', 'calibration_due', 'missing']);
  const METRICS = {
    temperature_c: { unit: '°C', physicalMin: -20, physicalMax: 80 },
    rh_pct: { unit: '%RH', physicalMin: 0, physicalMax: 100 },
    co2_ppm: { unit: 'ppm', physicalMin: 0, physicalMax: 60000 },
    substrate_temperature_c: { unit: '°C', physicalMin: -20, physicalMax: 90 },
  };

  const normalizeTimestamp = (value) => {
    const d = value ? new Date(value) : null;
    return d && Number.isFinite(d.getTime()) ? d.toISOString() : null;
  };

  const normalizeTelemetry = (raw = {}) => {
    const metric = raw.metric || null;
    const spec = METRICS[metric];
    const value = Number(raw.value);
    const reasons = Array.isArray(raw.quality_reasons) ? [...raw.quality_reasons] : [];
    let quality = VALID_QUALITY.has(raw.quality) ? raw.quality : 'valid';

    if (!Number.isFinite(value)) {
      quality = 'missing';
      reasons.push('non_numeric_value');
    } else if (spec && (value < spec.physicalMin || value > spec.physicalMax)) {
      quality = 'quarantined';
      reasons.push('outside_physical_range');
    }

    return {
      schema: SCHEMA,
      room_id: String(raw.room_id || '').trim(),
      device_id: String(raw.device_id || '').trim(),
      metric,
      value: Number.isFinite(value) ? value : null,
      unit: raw.unit || spec?.unit || null,
      observed_at: normalizeTimestamp(raw.observed_at),
      quality,
      quality_reasons: [...new Set(reasons)],
      calibration_id: raw.calibration_id || null,
      // Dónde está montado el sensor dentro de la sala (declarado, no medido).
      position: typeof raw.position === 'string' && raw.position.trim() ? raw.position.trim().slice(0, 40) : null,
      source: raw.source || 'measured',
      co2_pressure_compensated: raw.co2_pressure_compensated === true,
      received_at: normalizeTimestamp(raw.received_at),
    };
  };

  const validateTelemetry = (raw = {}) => {
    const reading = normalizeTelemetry(raw);
    const errors = [];
    if (!reading.room_id) errors.push('missing room_id');
    if (!reading.device_id) errors.push('missing device_id');
    if (!METRICS[reading.metric]) errors.push(`unsupported metric: ${reading.metric}`);
    if (!reading.observed_at) errors.push('invalid observed_at');
    if (reading.value == null) errors.push('missing numeric value');
    if (!VALID_QUALITY.has(reading.quality)) errors.push(`invalid quality: ${reading.quality}`);
    if (METRICS[reading.metric] && reading.unit !== METRICS[reading.metric].unit) {
      errors.push(`${reading.metric}: expected unit ${METRICS[reading.metric].unit}`);
    }
    return errors;
  };

  const readingBelongsToCycle = (reading, cycle) => {
    const r = normalizeTelemetry(reading);
    if (!cycle || r.room_id !== cycle.roomId || !r.observed_at || !cycle.startAt) return false;
    const t = new Date(r.observed_at).getTime();
    const start = new Date(cycle.startAt).getTime();
    const end = cycle.endAt ? new Date(cycle.endAt).getTime() : Infinity;
    return Number.isFinite(t) && Number.isFinite(start) && t >= start && t <= end;
  };

  const percentile = (sorted, p) => {
    if (!sorted.length) return null;
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };

  const aggregateTelemetry = (readings = []) => {
    const grouped = {};
    readings.map(normalizeTelemetry).forEach((r) => {
      if (!METRICS[r.metric]) return;
      if (!grouped[r.metric]) grouped[r.metric] = { all: [], valid: [] };
      grouped[r.metric].all.push(r);
      if (r.value != null && r.quality === 'valid') grouped[r.metric].valid.push(r.value);
    });

    return Object.fromEntries(Object.entries(grouped).map(([metric, group]) => {
      const values = group.valid.slice().sort((a, b) => a - b);
      const qualityCounts = group.all.reduce((acc, r) => {
        acc[r.quality] = (acc[r.quality] || 0) + 1;
        return acc;
      }, {});
      const mean = values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;
      return [metric, {
        unit: METRICS[metric].unit,
        count: group.all.length,
        validCount: values.length,
        qualityCounts,
        min: values.length ? values[0] : null,
        max: values.length ? values[values.length - 1] : null,
        mean,
        p05: percentile(values, 0.05),
        p50: percentile(values, 0.50),
        p95: percentile(values, 0.95),
      }];
    }));
  };

  // ---------------------------------------------------------------------------
  // Estado del nodo (setas.node-status.v1) — SOLO LECTURA.
  // Lo que el firmware de control dice que está haciendo: estado COMANDADO de
  // cada relé (no medición del contacto), alarmas activas y consigna vigente.
  // Setas OS lo muestra y lo cruza con el ciclo; nunca lo usa para mandar un
  // relé. Procedencia: 'reported' (declarado por el firmware), distinta de
  // 'measured'. Los nombres de relés y alarmas válidos los fija el perfil de la
  // sala (node-control-profiles.json), no este código.
  // ---------------------------------------------------------------------------
  const NODE_STATUS_SCHEMA = 'setas.node-status.v1';
  const NODE_CONTROL_STATES = new Set(['starting', 'auto', 'disabled', 'locked', 'alarm']);
  const CODE_RE = /^[a-z][a-z0-9_]{0,31}$/;
  const CONSIGNA_RE = /^[A-Za-z0-9_.:@-]{1,80}$/;
  const SETPOINT_TEMPS = ['heat_setpoint_c', 'hysteresis_c', 'temp_max_c'];
  const SETPOINT_HOURS = ['light_on_hour', 'light_off_hour'];
  const MAX_RELAYS = 8;
  const MAX_ALARMS = 16;

  const isPlainObject = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const finiteOrNull = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);

  const normalizeNodeStatus = (raw = {}) => {
    const src = isPlainObject(raw) ? raw : {};
    const relays = {};
    if (isPlainObject(src.relays)) for (const [k, v] of Object.entries(src.relays)) relays[k] = v;
    const onSeconds = {};
    if (isPlainObject(src.relay_on_s)) for (const [k, v] of Object.entries(src.relay_on_s)) onSeconds[k] = v;
    const sp = isPlainObject(src.setpoints) ? src.setpoints : {};
    const setpoints = { consigna_id: typeof sp.consigna_id === 'string' ? sp.consigna_id : null };
    for (const key of SETPOINT_TEMPS) setpoints[key] = finiteOrNull(sp[key]);
    for (const key of SETPOINT_HOURS) setpoints[key] = finiteOrNull(sp[key]);
    return {
      schema: src.schema || null,
      observed_at: normalizeTimestamp(src.observed_at),
      commissioned: src.commissioned === true,
      control_state: src.control_state || null,
      heating_enabled: src.heating_enabled === true,
      uptime_s: finiteOrNull(src.uptime_s),
      relays,
      relay_on_s: onSeconds,
      alarms: Array.isArray(src.alarms) ? [...src.alarms] : [],
      setpoints,
      provenance: 'reported',
    };
  };

  /**
   * Valida un estado de nodo. Con `profile` (entrada de node-control-profiles.json)
   * exige que relés y alarmas sean los declarados para la sala.
   * @returns {string[]} errores; vacío si es válido
   */
  const validateNodeStatus = (raw, profile = null) => {
    const errors = [];
    if (!isPlainObject(raw)) return ['node_status must be an object'];
    const s = normalizeNodeStatus(raw);
    if (s.schema !== NODE_STATUS_SCHEMA) errors.push(`schema must be ${NODE_STATUS_SCHEMA}`);
    if (!s.observed_at) errors.push('invalid observed_at');
    if (!NODE_CONTROL_STATES.has(s.control_state)) errors.push(`invalid control_state: ${s.control_state}`);
    if (raw.commissioned !== undefined && typeof raw.commissioned !== 'boolean') errors.push('commissioned must be boolean');
    if (raw.heating_enabled !== undefined && typeof raw.heating_enabled !== 'boolean') errors.push('heating_enabled must be boolean');
    if (raw.uptime_s !== undefined && !(Number.isInteger(raw.uptime_s) && raw.uptime_s >= 0)) errors.push('uptime_s must be a non-negative integer');

    const allowedRelays = profile && Array.isArray(profile.relays) ? new Set(profile.relays.map(r => r.id)) : null;
    const relayKeys = Object.keys(s.relays);
    if (!relayKeys.length) errors.push('relays required');
    if (relayKeys.length > MAX_RELAYS) errors.push('too many relays');
    for (const [k, v] of Object.entries(s.relays)) {
      if (!CODE_RE.test(k)) errors.push(`invalid relay id: ${k}`);
      else if (allowedRelays && !allowedRelays.has(k)) errors.push(`relay not in room profile: ${k}`);
      if (typeof v !== 'boolean') errors.push(`relay ${k}: state must be boolean`);
    }
    for (const [k, v] of Object.entries(s.relay_on_s)) {
      if (!Object.hasOwn(s.relays, k)) errors.push(`relay_on_s: unknown relay ${k}`);
      if (!(Number.isInteger(v) && v >= 0)) errors.push(`relay_on_s ${k}: must be a non-negative integer`);
    }

    const allowedAlarms = profile && isPlainObject(profile.alarms) ? new Set(Object.keys(profile.alarms)) : null;
    if (raw.alarms !== undefined && !Array.isArray(raw.alarms)) errors.push('alarms must be an array');
    if (s.alarms.length > MAX_ALARMS) errors.push('too many alarms');
    for (const code of s.alarms) {
      if (typeof code !== 'string' || !CODE_RE.test(code)) errors.push(`invalid alarm code: ${code}`);
      else if (allowedAlarms && !allowedAlarms.has(code)) errors.push(`alarm not in room profile: ${code}`);
    }
    if (new Set(s.alarms).size !== s.alarms.length) errors.push('duplicate alarm code');
    if (s.control_state === 'alarm' && !s.alarms.length) errors.push('control_state alarm requires an active alarm');

    const sp = isPlainObject(raw.setpoints) ? raw.setpoints : null;
    if (!sp) errors.push('setpoints required');
    else {
      if (typeof sp.consigna_id !== 'string' || !CONSIGNA_RE.test(sp.consigna_id)) errors.push('setpoints.consigna_id invalid');
      const t = METRICS.temperature_c;
      for (const key of SETPOINT_TEMPS) {
        if (sp[key] === undefined) continue;
        const v = sp[key];
        if (typeof v !== 'number' || !Number.isFinite(v) || v < t.physicalMin || v > t.physicalMax) errors.push(`setpoints.${key} invalid`);
      }
      if (sp.hysteresis_c !== undefined && !(sp.hysteresis_c > 0)) errors.push('setpoints.hysteresis_c must be positive');
      for (const key of SETPOINT_HOURS) {
        if (sp[key] === undefined) continue;
        if (!Number.isInteger(sp[key]) || sp[key] < 0 || sp[key] > 24) errors.push(`setpoints.${key} invalid`);
      }
    }
    return errors;
  };

  /** Estados de nodo del documento `telemetria_salas/{roomId}` (device_readings[*].node_status). */
  const nodeStatusesFromRoomDoc = (data = {}) => {
    const out = [];
    const devices = isPlainObject(data?.device_readings) ? data.device_readings : {};
    for (const [deviceId, entry] of Object.entries(devices)) {
      if (!isPlainObject(entry?.node_status)) continue;
      out.push({ device_id: deviceId, position: entry.position || null, ...normalizeNodeStatus(entry.node_status) });
    }
    return out;
  };

  /**
   * Resumen del estado reportado durante un ciclo de sala, para cruzarlo con la
   * calidad de cosecha. `heat_on_fraction` usa los contadores relay_on_s entre
   * muestras consecutivas del mismo arranque (uptime creciente); un reinicio
   * corta el tramo. Es estado comandado, no energía medida.
   */
  const summarizeNodeStatus = (statuses = [], cycle = null, relayId = 'heat') => {
    const start = cycle?.startAt ? Date.parse(cycle.startAt) : -Infinity;
    const end = cycle?.endAt ? Date.parse(cycle.endAt) : Infinity;
    const rows = (statuses || []).map(normalizeNodeStatus)
      .filter(s => s.observed_at && Date.parse(s.observed_at) >= start && Date.parse(s.observed_at) <= end)
      .sort((a, b) => a.observed_at.localeCompare(b.observed_at));
    const alarmCounts = {};
    let alarmSamples = 0; let onSeconds = 0; let spanSeconds = 0; let restarts = 0;
    const consignas = new Set();
    rows.forEach((s, i) => {
      if (s.alarms.length) alarmSamples++;
      s.alarms.forEach(code => { alarmCounts[code] = (alarmCounts[code] || 0) + 1; });
      if (s.setpoints.consigna_id) consignas.add(s.setpoints.consigna_id);
      const prev = rows[i - 1];
      if (!prev) return;
      if (s.uptime_s == null || prev.uptime_s == null || s.uptime_s < prev.uptime_s) { restarts++; return; }
      const dOn = Number(s.relay_on_s[relayId]) - Number(prev.relay_on_s[relayId]);
      const dUp = s.uptime_s - prev.uptime_s;
      if (Number.isFinite(dOn) && dOn >= 0 && dUp > 0 && dOn <= dUp) { onSeconds += dOn; spanSeconds += dUp; }
    });
    return {
      provenance: 'reported',
      relay: relayId,
      samples: rows.length,
      first_at: rows[0]?.observed_at || null,
      last_at: rows[rows.length - 1]?.observed_at || null,
      on_fraction: spanSeconds > 0 ? onSeconds / spanSeconds : null,
      covered_seconds: spanSeconds,
      restarts,
      alarm_samples: alarmSamples,
      alarm_counts: alarmCounts,
      consigna_ids: [...consignas],
      commissioned: rows.length ? rows.every(s => s.commissioned) : false,
    };
  };

  const api = {
    SCHEMA, METRICS, VALID_QUALITY, normalizeTelemetry, validateTelemetry, readingBelongsToCycle, aggregateTelemetry,
    NODE_STATUS_SCHEMA, NODE_CONTROL_STATES, normalizeNodeStatus, validateNodeStatus, nodeStatusesFromRoomDoc, summarizeNodeStatus,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasTelemetry = api;
})();
