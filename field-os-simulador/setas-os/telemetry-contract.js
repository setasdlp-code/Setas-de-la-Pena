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
      source: raw.source || 'measured',
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

  const api = { SCHEMA, METRICS, VALID_QUALITY, normalizeTelemetry, validateTelemetry, readingBelongsToCycle, aggregateTelemetry };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasTelemetry = api;
})();
