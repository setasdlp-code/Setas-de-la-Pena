'use strict';

/**
 * @file thermal-mapping.js — Calificación térmica del prototipo de incubación
 * con datos MEDIDOS: offsets de sondas por co-ubicación y uniformidad
 * base–centro–tope.
 *
 * Fuente: knowledge_base/10_ai_workflows/OAP-0001-modular-incubation-validation.md
 * («Instrumentación» y «Secuencia térmica») y 04_facility/incubation.md.
 *   - Comparar las sondas (tres DS18B20 y el SHT45) 48–72 h en un mismo punto y
 *     registrar offsets ANTES de ubicarlas.
 *   - Ensayos de 72 h (vacío, masa simulada) registrando cada 30–60 s.
 *   - Criterio provisional: ΔT base–centro–tope ≤2 °C durante ≥95 % de
 *     intervalos después de estabilización, con los offsets aplicados. Es un
 *     gate de uniformidad del prototipo, no un setpoint de cultivo, y está
 *     pendiente de validación de campo.
 *
 * Decisiones de cálculo (declaradas, no tomadas de la KB):
 *   - offset de una sonda = mediana de (sonda − referencia) en la ventana; la
 *     referencia por defecto es la mediana del grupo en cada instante, o una
 *     sonda elegida. Corregido = lectura − offset.
 *   - un instante sin las tres posiciones cuenta como intervalo NO demostrado
 *     (no se descarta del denominador).
 * Este módulo calcula; la decisión sobre el gate es humana.
 */
(function (root) {
  const KEY = 'sdp_thermal_mapping_v1';
  const SCHEMA = 'setas.thermal-mapping.v1';

  const CRITERIA = Object.freeze({
    maxDeltaC: 2.0,
    minFraction: 0.95,
    minColocationH: 48,
    minTestH: 72,
    origin: 'OAP-0001 / incubation.md: criterio provisional de uniformidad del prototipo, pendiente de validación de campo; no es setpoint de cultivo.',
  });
  const TEST_TYPES = Object.freeze({ vacio: 'Vacío 72 h', carga_simulada: 'Masa térmica simulada 72 h', ciclo_biologico: 'Ciclo biológico' });
  const POSITIONS = Object.freeze(['base', 'centro', 'tope']);

  const text = (v) => (typeof v === 'string' ? v.trim() : '');
  const finite = (v) => typeof v === 'number' && Number.isFinite(v);
  const round = (v, d = 2) => (finite(v) ? Math.round(v * 10 ** d) / 10 ** d : null);
  const fail = (m) => { throw new Error(m); };
  const quantile = (sorted, q) => {
    if (!sorted.length) return null;
    const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  };
  const median = (values) => quantile([...values].sort((a, b) => a - b), 0.5);

  function windowIndexes(data, startMin, endMin) {
    const idx = [];
    for (let i = 0; i < data.t.length; i++) {
      if ((startMin === null || data.t[i] >= startMin) && (endMin === null || data.t[i] <= endMin)) idx.push(i);
    }
    return idx;
  }

  /**
   * Offsets por co-ubicación. `reference`: 'median' (mediana del grupo en cada
   * instante con todas las sondas) o el nombre de una columna.
   */
  function computeOffsets(data, { probes = [], reference = 'median', startMin = null, endMin = null } = {}) {
    if (!data || !Array.isArray(data.t)) fail('Faltan los datos de la comparación.');
    if (probes.length < 2) fail('Seleccionar al menos dos sondas para compararlas.');
    if (probes.some((p) => !Array.isArray(data.values[p]))) fail('Una sonda seleccionada no existe en el archivo.');
    if (reference !== 'median' && !probes.includes(reference)) fail('La sonda de referencia debe estar entre las comparadas.');
    const idx = windowIndexes(data, startMin, endMin).filter((i) => probes.every((p) => finite(data.values[p][i])));
    const diffs = Object.fromEntries(probes.map((p) => [p, []]));
    idx.forEach((i) => {
      const ref = reference === 'median' ? median(probes.map((p) => data.values[p][i])) : data.values[reference][i];
      probes.forEach((p) => diffs[p].push(data.values[p][i] - ref));
    });
    const durationH = idx.length > 1 ? (data.t[idx[idx.length - 1]] - data.t[idx[0]]) / 60 : 0;
    const result = {};
    probes.forEach((p) => {
      const s = [...diffs[p]].sort((a, b) => a - b);
      result[p] = { offsetC: round(quantile(s, 0.5), 3), p05C: round(quantile(s, 0.05), 3), p95C: round(quantile(s, 0.95), 3), n: s.length };
    });
    const reasons = [];
    if (!idx.length) reasons.push('No hay instantes con todas las sondas válidas.');
    else if (durationH < CRITERIA.minColocationH) reasons.push(`La comparación cubre ${round(durationH, 1)} h; OAP-0001 pide 48–72 h en un mismo punto.`);
    return { status: reasons.length ? 'insuficiente' : 'ok', reasons, probes: result, reference, samples: idx.length, durationH: round(durationH, 1),
      windowStartMin: idx.length ? data.t[idx[0]] : null, windowEndMin: idx.length ? data.t[idx[idx.length - 1]] : null };
  }

  /**
   * Uniformidad base–centro–tope tras estabilización con offsets aplicados.
   * @returns {{status:'cumple'|'no_cumple'|'insuficiente', reasons, metrics}}
   */
  function evaluateMap(data, { positions = {}, offsets = null, stabilizationMin = null, criteria = CRITERIA } = {}) {
    if (!data || !Array.isArray(data.t) || !data.t.length) fail('Faltan los datos del ensayo.');
    const cols = POSITIONS.map((k) => positions[k]);
    if (cols.some((c) => !text(c))) fail('Asignar las columnas de base, centro y tope.');
    if (new Set(cols).size !== cols.length) fail('Base, centro y tope deben ser sondas distintas.');
    if (cols.some((c) => !Array.isArray(data.values[c]))) fail('Una columna asignada no existe en el archivo.');
    if (!finite(stabilizationMin)) fail('Declarar el fin de la estabilización (el criterio se aplica después).');
    const reasons = [];
    const add = (severity, message) => reasons.push({ severity, message });
    const missingOffsets = cols.filter((c) => !offsets || !finite(offsets[c]));
    if (missingOffsets.length) add('insufficient', `Sin offset registrado para ${missingOffsets.join(', ')}: OAP-0001 no permite interpretar gradientes sin offsets.`);
    const totalH = (data.t[data.t.length - 1] - data.t[0]) / 60;
    if (totalH < criteria.minTestH) add('insufficient', `El ensayo dura ${round(totalH, 1)} h; la secuencia térmica pide ${criteria.minTestH} h.`);
    if (stabilizationMin < data.t[0] || stabilizationMin >= data.t[data.t.length - 1]) add('insufficient', 'El fin de estabilización queda fuera del registro.');
    const idx = windowIndexes(data, stabilizationMin, null);
    const deltas = [];
    let within = 0, missing = 0;
    const worst = { deltaC: null, atMin: null, hot: null, cold: null };
    idx.forEach((i) => {
      const vals = cols.map((c) => data.values[c][i]);
      if (vals.some((v) => !finite(v))) { missing++; return; }
      const corr = vals.map((v, k) => v - (finite(offsets?.[cols[k]]) ? offsets[cols[k]] : 0));
      const hi = Math.max(...corr), lo = Math.min(...corr), d = hi - lo;
      deltas.push(d);
      if (d <= criteria.maxDeltaC + 1e-9) within++;
      if (worst.deltaC === null || d > worst.deltaC) Object.assign(worst, { deltaC: round(d), atMin: data.t[i], hot: POSITIONS[corr.indexOf(hi)], cold: POSITIONS[corr.indexOf(lo)] });
    });
    const intervals = idx.length;
    const fraction = intervals ? within / intervals : null;
    const sorted = [...deltas].sort((a, b) => a - b);
    const metrics = { intervals, within, missing, fraction: round(fraction, 4), totalH: round(totalH, 1), afterStabilizationH: intervals ? round((data.t[idx[idx.length - 1]] - stabilizationMin) / 60, 1) : 0,
      p95DeltaC: round(quantile(sorted, 0.95)), maxDeltaC: worst.deltaC, worst, maxDeltaAllowedC: criteria.maxDeltaC, minFraction: criteria.minFraction };
    if (!intervals) add('insufficient', 'No hay intervalos después de la estabilización.');
    if (missing) add('note', `${missing} intervalo(s) sin las tres posiciones cuentan como no demostrados.`);
    let status;
    if (reasons.some((r) => r.severity === 'insufficient')) status = 'insuficiente';
    else if (fraction >= criteria.minFraction) status = 'cumple';
    else { status = 'no_cumple'; add('fail', `ΔT ≤ ${criteria.maxDeltaC} °C en ${round(fraction * 100, 1)} % de los intervalos (mínimo ${criteria.minFraction * 100} %). Peor ΔT ${worst.deltaC} °C entre ${worst.hot} y ${worst.cold}. Cambiar una sola variable por ensayo.`); }
    return { status, reasons, metrics };
  }

  // ── registros (inmutables) ─────────────────────────────────────────────
  const ID_RE = /^[A-Za-z0-9._-]{1,64}$/;
  function compactData(data, cols) {
    return { timeKind: data.timeKind, t: data.t.map((x) => round(x, 4)), values: Object.fromEntries(cols.map((c) => [c, data.values[c].map((v) => (finite(v) ? round(v, 3) : null))])), columns: cols };
  }

  function createOffsetsRecord(records, { id, label, data, probes, reference = 'median', startMin = null, endMin = null, sourceFile = '' }, { at = new Date().toISOString(), by } = {}) {
    if (!ID_RE.test(id || '') || records.some((r) => r.id === id)) fail('ID inválido o repetido.');
    if (!text(by)) fail('Indicar el responsable.');
    const result = computeOffsets(data, { probes, reference, startMin, endMin });
    if (result.status !== 'ok') fail(result.reasons.join(' '));
    return { schema: SCHEMA, kind: 'offsets', id, label: text(label), at, by: text(by), sourceFile: text(sourceFile), reference, timeKind: data.timeKind,
      windowStartMin: result.windowStartMin, windowEndMin: result.windowEndMin, durationH: result.durationH, samples: result.samples, probes: result.probes };
  }

  function createMapRecord(records, { id, unitId, testType, offsetSetId, data, positions, stabilizationMin, sourceFile = '', notes = '' }, { at = new Date().toISOString(), by } = {}) {
    if (!ID_RE.test(id || '') || records.some((r) => r.id === id)) fail('ID inválido o repetido.');
    if (!text(by)) fail('Indicar el responsable.');
    if (!text(unitId)) fail('Identificar la caja o unidad ensayada.');
    if (!TEST_TYPES[testType]) fail('Tipo de ensayo inválido.');
    const offsetSet = records.find((r) => r.kind === 'offsets' && r.id === offsetSetId);
    if (!offsetSet) fail('Seleccionar un registro de offsets: los gradientes no se interpretan sin offsets.');
    if (offsetSet.timeKind === 'datetime' && data.timeKind === 'datetime' && offsetSet.windowEndMin > data.t[0]) fail('Los offsets deben medirse antes del ensayo, con las sondas juntas.');
    const cols = POSITIONS.map((k) => positions[k]);
    // Las columnas del ensayo deben ser las mismas sondas comparadas (mismo nombre/dirección).
    const offsets = Object.fromEntries(cols.map((c) => [c, offsetSet.probes[c]?.offsetC]));
    const evaluation = evaluateMap(data, { positions, offsets, stabilizationMin });
    return { schema: SCHEMA, kind: 'map', id, unitId: text(unitId), testType, offsetSetId, at, by: text(by), sourceFile: text(sourceFile), notes: text(notes),
      positions: { ...positions }, stabilizationMin, data: compactData(data, cols), status: evaluation.status, metrics: evaluation.metrics, reasons: evaluation.reasons };
  }

  /** Re-evalúa un ensayo guardado con sus datos y los offsets referenciados. */
  function reevaluate(records, mapRecord) {
    const offsetSet = records.find((r) => r.kind === 'offsets' && r.id === mapRecord.offsetSetId);
    const offsets = offsetSet ? Object.fromEntries(Object.entries(offsetSet.probes).map(([k, v]) => [k, v.offsetC])) : null;
    return evaluateMap(mapRecord.data, { positions: mapRecord.positions, offsets, stabilizationMin: mapRecord.stabilizationMin });
  }

  const validRecord = (r) => r && r.schema === SCHEMA && ID_RE.test(r.id || '') && ['offsets', 'map'].includes(r.kind) && text(r.by) && Number.isFinite(Date.parse(r.at))
    && (r.kind === 'offsets' ? r.probes && typeof r.probes === 'object' : r.data && Array.isArray(r.data.t) && r.positions);
  function readRecords(storage) {
    const raw = storage.getItem(KEY);
    if (raw === null) return [];
    let records;
    try { records = JSON.parse(raw); } catch { fail('El registro de mapa térmico está dañado. Conservar un respaldo antes de corregirlo.'); }
    if (!Array.isArray(records) || records.some((r) => !validRecord(r)) || new Set(records.map((r) => r.id)).size !== records.length) {
      fail('El registro de mapa térmico no tiene un formato válido. No se sobrescribió.');
    }
    return records;
  }

  /** Estado del gate térmico de una unidad: vacío y carga simulada deben cumplir. */
  function unitSummary(records) {
    const maps = records.filter((r) => r.kind === 'map');
    const units = [...new Set(maps.map((r) => r.unitId))];
    return units.map((unitId) => {
      const latest = (type) => maps.filter((r) => r.unitId === unitId && r.testType === type).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).pop() || null;
      const tests = Object.fromEntries(Object.keys(TEST_TYPES).map((type) => { const r = latest(type); return [type, r ? { id: r.id, status: reevaluate(records, r).status } : null]; }));
      const required = ['vacio', 'carga_simulada'];
      const status = required.every((type) => tests[type]?.status === 'cumple') ? 'cumple_ensayos_sin_biologico'
        : required.some((type) => tests[type]?.status === 'no_cumple') ? 'no_cumple' : 'pendiente';
      return { unitId, tests, status };
    });
  }

  const api = { KEY, SCHEMA, CRITERIA, TEST_TYPES, POSITIONS, computeOffsets, evaluateMap, createOffsetsRecord, createMapRecord, reevaluate, readRecords, unitSummary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SetasThermalMapping = api;
})(globalThis);
