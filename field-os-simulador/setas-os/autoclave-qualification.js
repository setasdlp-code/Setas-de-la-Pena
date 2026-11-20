'use strict';

/**
 * @file autoclave-qualification.js — Calificación del All American 1941X con
 * datos MEDIDOS: corridas PQ-1 (penetración térmica), estudios PQ-2 (controles
 * A/B de sustrato y placas C del spawn) y compuertas G1–G5.
 *
 * Fuente de los criterios: knowledge_base/06_operations/operational_commissioning.md
 * («Matriz de demostración Go / No-Go — 1941X y shiitake» y «PQ-1 — Ficha
 * candidata de tres corridas»). Los umbrales son la propuesta del propietario
 * del 2026-11-03: candidatos NO verificados, que solo cuentan cuando un humano
 * aprueba la versión del protocolo que los contiene. Este módulo calcula y
 * aplica lo que el protocolo aprobado declara; no aprueba nada por sí mismo.
 *
 * Qué distingue de sterilization-kinetics.js: aquel SIMULA una penetración con
 * un modelo; este EVALÚA series reales de dataloggers. Una simulación nunca
 * alimenta este módulo ni cierra una compuerta.
 *
 * Contrato de datos: un registro de eventos sólo-anexar (`setas.autoclave-
 * qualification.v1`) en localStorage `sdp_autoclave_qualification_v1`. El estado
 * (protocolos, configuraciones de carga, corridas, revisiones de compuertas) se
 * deriva plegando los eventos: nada se sobrescribe y cada cambio queda con
 * fecha y responsable. Eso permite detectar, por ejemplo, una meseta redefinida
 * después de cargar los datos (PQ-1, nota 2: no recortar a posteriori).
 *
 * Definiciones (operational_commissioning.md, PQ-1):
 *   - ΔT = T_sat(P_abs) − T_cámara, con P_abs = P_manométrica_corregida +
 *     P_ambiente_absoluta medida. T_sat por IAPWS-IF97 región 4 (formulación
 *     identificada; IAPWS R7-97(2012), Tier 1). Criterio en magnitud |ΔT|.
 *   - t_lag = (producto alcanza el objetivo térmico) − (cámara alcanza el
 *     mismo objetivo), por sonda; luego el máximo de las sondas. Entre corridas:
 *     rango (máx − mín) de esos máximos.
 *   - F₀ = ∫ 10^((T − T_ref)/z) dt por sonda de producto, sólo dentro de la
 *     meseta declarada (sin crédito previo), integración trapezoidal. El cruce
 *     de la meta es el más tardío de las sondas (= primer cruce del mínimo).
 *   - Indicadores: un IB procesado negativo sólo se interpreta con su control
 *     positivo sin procesar del mismo lote; un control que no cumple invalida
 *     la corrida y rompe la serie.
 *   - Serie: las últimas `runsRequired` corridas de una configuración, con el
 *     mismo protocolo, todas conformes; una fallida o inválida reinicia.
 *   - PQ-2: 0/n contaminadas en A y B al completar la duración fijada (15–21
 *     días); en C, blancos sin crecimiento, placas sin contaminantes y salto
 *     micelial antes del límite. No identifica causa ni certifica pureza.
 */
(function (root) {
  const KEY = 'sdp_autoclave_qualification_v1';
  const SCHEMA = 'setas.autoclave-qualification.v1';
  const KPA_PER_PSI = 6.894757293168;
  const BOGOTA_OFFSET_MIN = -300; // Colombia: UTC−5 todo el año, sin horario de verano.
  const MAX_ROWS = 20000;
  const LOAD_MASS_TOLERANCE_KG = 0.05; // redondeo de pesaje, no una tolerancia de proceso.

  const CANDIDATE_ORIGIN = 'Propuesta del propietario del 2026-11-03 (operational_commissioning.md, ficha PQ-1). '
    + 'Candidato no verificado: cuenta solo dentro de un protocolo aprobado.';

  // Valores candidatos de la ficha PQ-1. thermalTargetC y maxGapMin no tienen
  // valor candidato en la base de conocimiento: el protocolo debe declararlos.
  const CANDIDATE_PROTOCOL = Object.freeze({
    tRefC: 121.1,
    zC: 10,
    f0TargetMin: 15.0,
    chamberMinC: 120.1,
    maxAbsDeltaTC: 1.0,
    maxLagRangeMin: 10,
    runsRequired: 3,
    minProductProbes: 2,
    ciPerRun: 3,
    ibPerRun: 3,
    controlsPerRun: 1,
    ibReadHours: 48,
    controlMaxHours: 24,
    thermalTargetC: null,
    maxGapMin: null,
  });
  const PROTOCOL_FIELDS = Object.keys(CANDIDATE_PROTOCOL);

  const GATES = Object.freeze([
    { id: 'G1', label: 'Seguridad mecánica y manometría', requiredForRelease: true },
    { id: 'G2', label: 'Penetración térmica (PQ-1)', requiredForRelease: true },
    { id: 'G3', label: 'Integridad de bolsa y asepsia (PQ-2 A/B)', requiredForRelease: true },
    { id: 'G4', label: 'Pureza y vigor del spawn (PQ-2 C)', requiredForRelease: true },
    { id: 'G5', label: 'Rol y tamaño de lote', requiredForRelease: false },
  ]);
  const GATE_IDS = GATES.map((g) => g.id);
  const G5_BLOCKS_PER_WEEK_LIMIT = 30; // matriz G5: sobre 30 bloques/semana exige alternativa validada.

  // PQ-2 (matriz G3/G4): ventana de observación A/B de 15–21 días a 23 °C y
  // salto micelial < 5 días en placa C, propuesta del propietario 2026-11-03.
  // El estudio fija n, duración exacta, tolerancia térmica y frecuencia de
  // lectura ANTES de empezar; la tolerancia y la frecuencia no tienen candidato.
  const PQ2_CANDIDATE = Object.freeze({ observationDaysMin: 15, observationDaysMax: 21, incubationTempC: 23, maxJumpDays: 5 });
  const DAY_MS = 86400000;
  const PQ2_STATES = Object.freeze({
    A: ['limpia', 'contaminada'], B: ['limpia', 'contaminada'],
    P: ['sin_salto', 'salto', 'contaminada'], K: ['sin_crecimiento', 'con_crecimiento'],
  });
  const pq2Units = (study) => (study.kind === 'AB'
    ? [...Array.from({ length: study.nPerGroup }, (_, i) => `A${i + 1}`), ...Array.from({ length: study.nPerGroup }, (_, i) => `B${i + 1}`)]
    : [...Array.from({ length: study.plates }, (_, i) => `P${i + 1}`), ...Array.from({ length: study.blanks }, (_, i) => `K${i + 1}`)]);

  const EVENT_TYPES = Object.freeze([
    'protocol.drafted', 'protocol.approved', 'configuration.defined',
    'run.registered', 'run.plateau_changed', 'run.data_imported',
    'run.indicators_recorded', 'run.deviation_recorded', 'gate.reviewed',
    'pq2.defined', 'pq2.reading',
  ]);

  // ── utilidades ──────────────────────────────────────────────────────────
  const text = (v) => (typeof v === 'string' ? v.trim() : '');
  const finite = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));
  const num = (v) => (finite(v) ? Number(v) : null);
  const round = (v, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 10 ** d) / 10 ** d);
  const isoMs = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? Date.parse(v) : NaN);
  const bogotaDate = (ms) => new Date(ms + BOGOTA_OFFSET_MIN * 60000).toISOString().slice(0, 10);
  const fail = (message) => { throw new Error(message); };

  // ── IAPWS-IF97 región 4 (línea de saturación) ───────────────────────────
  const N = [
    0.11670521452767e4, -0.72421316703206e6, -0.17073846940092e2, 0.12020824702470e5,
    -0.32325550322333e7, 0.14915108613530e2, -0.48232657361591e4, 0.40511340542057e6,
    -0.23855557567849, 0.65017534844798e3,
  ];
  /** Temperatura de saturación (°C) a una presión absoluta en kPa. IF97 ec. 31. */
  function saturationTemperatureC(pAbsKpa) {
    const p = Number(pAbsKpa);
    if (!Number.isFinite(p) || p < 0.611213 || p > 22064) return null;
    const beta = Math.pow(p / 1000, 0.25);
    const E = beta * beta + N[2] * beta + N[5];
    const F = N[0] * beta * beta + N[3] * beta + N[6];
    const G = N[1] * beta * beta + N[4] * beta + N[7];
    const D = (2 * G) / (-F - Math.sqrt(F * F - 4 * E * G));
    const T = (N[9] + D - Math.sqrt((N[9] + D) ** 2 - 4 * (N[8] + N[9] * D))) / 2;
    return T - 273.15;
  }
  /** Presión de saturación (kPa absolutos) a una temperatura en °C. IF97 ec. 30. */
  function saturationPressureKpa(tC) {
    const T = Number(tC) + 273.15;
    if (!Number.isFinite(T) || T < 273.15 || T > 647.096) return null;
    const th = T + N[8] / (T - N[9]);
    const A = th * th + N[0] * th + N[1];
    const B = N[2] * th * th + N[3] * th + N[4];
    const C = N[5] * th * th + N[6] * th + N[7];
    return Math.pow((2 * C) / (-B + Math.sqrt(B * B - 4 * A * C)), 4) * 1000;
  }

  // ── lectura del CSV del datalogger ──────────────────────────────────────
  const MINUTE_HEADER = /^(t_?min|min|minutos?|elapsed_?min|tiempo_?min)$/i;
  const SECOND_HEADER = /^(t_?s|t_?sec|s|seg|segundos?|elapsed_?s|tiempo_?s)$/i;
  const TIME_HEADER = /^(fecha|hora|fecha_?hora|time|timestamp|datetime|date|tiempo)/i;

  function splitLine(line, delimiter) {
    const out = [];
    let cur = '', quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted;
      } else if (ch === delimiter && !quoted) { out.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }

  /** Minutos en el eje «hora local de Tenjo» (ingenua). Null si no se reconoce. */
  function parseClockMinutes(raw) {
    const s = text(raw);
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2})(?:[.,](\d+))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i);
    let y, mo, d, h, mi, se, frac, zone;
    if (m) [, y, mo, d, h, mi, se, frac, zone] = m;
    else {
      m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!m) return null;
      [, d, mo, y, h, mi, se] = m; // día primero (convención colombiana)
    }
    const ms = Date.UTC(+y, +mo - 1, +d, +h, +mi, +(se || 0), frac ? Math.round(Number('0.' + frac) * 1000) : 0);
    const check = new Date(ms);
    if (check.getUTCFullYear() !== +y || check.getUTCMonth() !== +mo - 1 || check.getUTCDate() !== +d || +h > 23) return null;
    let minutes = ms / 60000;
    if (zone) {
      const offset = zone.toUpperCase() === 'Z' ? 0 : (zone[0] === '-' ? -1 : 1) * (Number(zone.slice(1, 3)) * 60 + Number(zone.replace(':', '').slice(3, 5)));
      minutes = minutes - offset + BOGOTA_OFFSET_MIN; // a UTC y de ahí a hora de Bogotá
    }
    return minutes;
  }

  function parseNumber(raw, decimalComma) {
    let s = text(raw);
    if (!s || /^(nan|na|n\/a|--?|null)$/i.test(s)) return null;
    if (decimalComma) s = s.replace(/\./g, '').replace(',', '.');
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return undefined;
    return Number(s);
  }

  /**
   * Convierte el CSV exportado por un datalogger en series por columna.
   * Acepta separador `,`, `;` (con coma decimal) o tabulador; tiempo como
   * fecha-hora (ISO o DD/MM/AAAA) o como minutos/segundos transcurridos.
   */
  function parseLoggerCsv(rawText) {
    const lines = String(rawText || '').replace(/^﻿/, '').split(/\r?\n/)
      .filter((l) => l.trim() && !l.trim().startsWith('#'));
    if (lines.length < 2) fail('El archivo no tiene encabezado y datos.');
    const head = lines[0];
    const delimiter = head.includes('\t') ? '\t' : (head.split(';').length > head.split(',').length ? ';' : ',');
    const decimalComma = delimiter === ';';
    const header = splitLine(head, delimiter).map((h) => h.replace(/^"|"$/g, ''));
    if (header.length < 2 || header.some((h) => !h)) fail('El encabezado debe nombrar cada columna.');
    if (new Set(header).size !== header.length) fail('El encabezado repite nombres de columna.');
    let timeIndex = header.findIndex((h) => MINUTE_HEADER.test(h) || SECOND_HEADER.test(h));
    if (timeIndex < 0) timeIndex = header.findIndex((h) => TIME_HEADER.test(h));
    if (timeIndex < 0) timeIndex = 0;
    const timeHeader = header[timeIndex];
    const timeKind = MINUTE_HEADER.test(timeHeader) || SECOND_HEADER.test(timeHeader) ? 'elapsed' : 'datetime';
    const columns = header.filter((_, i) => i !== timeIndex);
    if (lines.length - 1 > MAX_ROWS) fail(`El archivo supera ${MAX_ROWS} filas. Exportar con un intervalo mayor o recortar fuera de la corrida.`);
    const t = [];
    const values = Object.fromEntries(columns.map((c) => [c, []]));
    let unreadable = 0;
    lines.slice(1).forEach((line, idx) => {
      const cells = splitLine(line, delimiter);
      const rawTime = cells[timeIndex];
      let minutes;
      if (timeKind === 'elapsed') {
        const v = parseNumber(rawTime, decimalComma);
        minutes = Number.isFinite(v) ? (SECOND_HEADER.test(timeHeader) ? v / 60 : v) : null;
      } else minutes = parseClockMinutes(rawTime);
      if (minutes === null || minutes === undefined) fail(`Fila ${idx + 2}: tiempo «${text(rawTime)}» no reconocido.`);
      if (t.length && minutes <= t[t.length - 1]) fail(`Fila ${idx + 2}: el tiempo no avanza respecto de la fila anterior. Revisar duplicados u orden.`);
      t.push(minutes);
      header.forEach((h, i) => {
        if (i === timeIndex) return;
        const v = parseNumber(cells[i], decimalComma);
        if (v === undefined) unreadable++;
        values[h].push(Number.isFinite(v) ? v : null);
      });
    });
    const warnings = unreadable ? [`${unreadable} celda(s) no numérica(s) se tomaron como dato ausente.`] : [];
    return { timeKind, timeColumn: timeHeader, columns, t, values, rows: t.length, warnings };
  }

  /** Lleva un instante declarado (meseta) al eje de minutos de los datos. */
  function toAxisMinutes(value, timeKind) {
    if (timeKind === 'elapsed') return finite(value) ? Number(value) : null;
    return parseClockMinutes(value);
  }

  // ── cálculo sobre series ────────────────────────────────────────────────
  function windowPoints(t, v, s, e) {
    const pts = [];
    for (let i = 0; i < t.length; i++) if (t[i] >= s && t[i] <= e && Number.isFinite(v[i])) pts.push([t[i], v[i]]);
    return pts;
  }
  function coverage(t, v, s, e) {
    const pts = windowPoints(t, v, s, e);
    if (!pts.length) return { samples: 0, maxGapMin: null };
    let gap = Math.max(pts[0][0] - s, e - pts[pts.length - 1][0]);
    for (let i = 1; i < pts.length; i++) gap = Math.max(gap, pts[i][0] - pts[i - 1][0]);
    return { samples: pts.length, maxGapMin: gap };
  }
  /** Primer instante (interpolado) en que la serie alcanza `target`. */
  function firstCrossing(t, v, target) {
    let prev = null;
    for (let i = 0; i < t.length; i++) {
      if (!Number.isFinite(v[i])) continue;
      if (v[i] >= target) {
        if (!prev) return { atMin: t[i], censored: true }; // ya estaba sobre el objetivo al empezar el registro
        return { atMin: prev[0] + ((target - prev[1]) * (t[i] - prev[0])) / (v[i] - prev[1]), censored: false };
      }
      prev = [t[i], v[i]];
    }
    return null;
  }
  function accumulateF0(t, v, s, e, p) {
    const pts = windowPoints(t, v, s, e);
    const L = (T) => Math.pow(10, (T - p.tRefC) / p.zC);
    let total = 0, crossAt = null;
    for (let i = 1; i < pts.length; i++) {
      const dt = pts[i][0] - pts[i - 1][0];
      const inc = ((L(pts[i - 1][1]) + L(pts[i][1])) / 2) * dt;
      if (crossAt === null && inc > 0 && total + inc >= p.f0TargetMin) crossAt = pts[i - 1][0] + ((p.f0TargetMin - total) / inc) * dt;
      total += inc;
    }
    return { totalMin: total, crossAtMin: crossAt === null ? null : crossAt - s, samples: pts.length };
  }

  // ── protocolo ───────────────────────────────────────────────────────────
  function protocolProblems(params = {}) {
    const p = params;
    const problems = [];
    PROTOCOL_FIELDS.forEach((k) => { if (!finite(p[k])) problems.push(`Falta ${k}.`); });
    if (problems.length) return problems;
    if (Number(p.zC) <= 0) problems.push('z debe ser positivo.');
    ['runsRequired', 'minProductProbes', 'ciPerRun', 'ibPerRun', 'controlsPerRun'].forEach((k) => {
      if (!Number.isInteger(Number(p[k])) || Number(p[k]) < 1) problems.push(`${k} debe ser un entero ≥ 1.`);
    });
    ['f0TargetMin', 'maxAbsDeltaTC', 'maxLagRangeMin', 'ibReadHours', 'controlMaxHours', 'maxGapMin'].forEach((k) => {
      if (Number(p[k]) <= 0) problems.push(`${k} debe ser positivo.`);
    });
    if (Number(p.controlMaxHours) > Number(p.ibReadHours)) problems.push('El límite del control positivo no puede superar la lectura de los IB.');
    return problems;
  }
  const normalizeParams = (params) => Object.fromEntries(PROTOCOL_FIELDS.map((k) => [k, num(params?.[k])]));

  // ── plegado de eventos ──────────────────────────────────────────────────
  function emptyState() {
    return { protocols: {}, configurations: {}, runs: {}, studies: {}, gateReviews: Object.fromEntries(GATE_IDS.map((g) => [g, []])), events: 0 };
  }

  function applyEvent(state, ev) {
    const p = ev.payload || {};
    const at = ev.at, by = ev.by;
    const needsRun = ev.type.startsWith('run.') && ev.type !== 'run.registered';
    if (needsRun && !state.runs[p.runId]) fail(`Evento ${ev.id}: corrida inexistente.`);
    if (ev.type === 'protocol.approved' && !state.protocols[p.protocolId]) fail(`Evento ${ev.id}: protocolo inexistente.`);
    if (ev.type === 'gate.reviewed' && !GATE_IDS.includes(p.gateId)) fail(`Evento ${ev.id}: compuerta desconocida.`);
    if (ev.type === 'run.registered' && !(p.plateau && typeof p.plateau === 'object')) fail(`Evento ${ev.id}: meseta ausente.`);
    if (ev.type === 'run.data_imported' && !(p.data && Array.isArray(p.data.t) && p.mapping && Array.isArray(p.mapping.products))) fail(`Evento ${ev.id}: datos ausentes.`);
    if (ev.type === 'pq2.reading' && !(state.studies[p.studyId] && p.units && typeof p.units === 'object')) fail(`Evento ${ev.id}: estudio PQ-2 inexistente.`);
    switch (ev.type) {
      case 'protocol.drafted':
        state.protocols[p.protocolId] = { id: p.protocolId, title: text(p.title), params: normalizeParams(p.params),
          microbiologicalBasis: text(p.microbiologicalBasis), draftedAt: at, draftedBy: by, approval: null,
          origin: text(p.origin) || CANDIDATE_ORIGIN };
        break;
      case 'protocol.approved':
        state.protocols[p.protocolId].approval = { at, by, effectiveAt: p.effectiveAt || at, reference: text(p.reference) };
        break;
      case 'configuration.defined':
        state.configurations[p.configurationId] = { id: p.configurationId, equipmentId: text(p.equipmentId),
          bagCount: Number(p.bagCount), wetMassPerBagKg: Number(p.wetMassPerBagKg), bagType: text(p.bagType),
          recipeVersion: text(p.recipeVersion), loadArrangement: text(p.loadArrangement), heatSource: text(p.heatSource),
          notes: text(p.notes), definedAt: at, definedBy: by };
        break;
      case 'run.registered':
        state.runs[p.runId] = { id: p.runId, configurationId: p.configurationId, protocolId: p.protocolId,
          executedAt: p.executedAt, operator: text(p.operator), ambientPressureKpa: Number(p.ambientPressureKpa),
          pressureUnit: p.pressureUnit, gaugeCorrection: Number(p.gaugeCorrection),
          plateau: { kind: p.plateau.kind, start: p.plateau.start, end: p.plateau.end },
          plateauHistory: [{ at, by, start: p.plateau.start, end: p.plateau.end }],
          imports: [], data: null, mapping: null, indicators: null, deviations: {}, registeredAt: at, registeredBy: by };
        break;
      case 'run.plateau_changed': {
        const run = state.runs[p.runId];
        run.plateau = { kind: run.plateau.kind, start: p.start, end: p.end };
        run.plateauHistory.push({ at, by, start: p.start, end: p.end, reason: text(p.reason) });
        break;
      }
      case 'run.data_imported': {
        const run = state.runs[p.runId];
        run.data = { timeKind: p.data.timeKind, t: p.data.t, values: p.data.values, columns: p.data.columns };
        run.mapping = { chamber: p.mapping.chamber, products: [...p.mapping.products], pressure: p.mapping.pressure };
        run.imports.push({ at, by, fileName: text(p.fileName), rows: p.data.t.length });
        break;
      }
      case 'run.indicators_recorded':
        state.runs[p.runId].indicators = { ...p.indicators, recordedAt: at, recordedBy: by };
        break;
      case 'run.deviation_recorded':
        state.runs[p.runId].deviations[p.deviationId] = { id: p.deviationId, description: text(p.description),
          status: p.status, resolution: text(p.resolution), at, by };
        break;
      case 'pq2.defined': {
        const study = { id: p.studyId, kind: p.kind, startedAt: p.startedAt, configurationId: p.configurationId || null,
          thermalRunRef: text(p.thermalRunRef), spawnLot: text(p.spawnLot), medium: text(p.medium),
          nPerGroup: Number(p.nPerGroup) || 0, plates: Number(p.plates) || 0, blanks: Number(p.blanks) || 0,
          observationDays: Number(p.observationDays), maxJumpDays: p.kind === 'C' ? Number(p.maxJumpDays) : null,
          incubationTempC: Number(p.incubationTempC), tempToleranceC: Number(p.tempToleranceC), readingIntervalDays: Number(p.readingIntervalDays),
          readings: [], definedAt: at, definedBy: by };
        study.units = pq2Units(study);
        state.studies[p.studyId] = study;
        break;
      }
      case 'pq2.reading':
        state.studies[p.studyId].readings.push({ readAt: p.readAt, tempC: Number(p.tempC), units: { ...p.units }, notes: text(p.notes), at, by });
        break;
      case 'gate.reviewed':
        state.gateReviews[p.gateId].push({ gateId: p.gateId, status: p.status, reference: text(p.reference),
          notes: text(p.notes), details: p.details || {}, at, by, effectiveAt: p.effectiveAt || at });
        state.gateReviews[p.gateId].sort((a, b) => isoMs(a.effectiveAt) - isoMs(b.effectiveAt));
        break;
      default: break;
    }
    state.events++;
    return state;
  }

  const validEnvelope = (ev) => ev && ev.schema === SCHEMA && text(ev.id) && EVENT_TYPES.includes(ev.type)
    && Number.isFinite(isoMs(ev.at)) && text(ev.by) && ev.payload && typeof ev.payload === 'object';

  function foldEvents(events) {
    const state = emptyState();
    [...events].sort((a, b) => isoMs(a.at) - isoMs(b.at)).forEach((ev) => applyEvent(state, ev));
    return state;
  }

  function readEvents(storage) {
    const raw = storage.getItem(KEY);
    if (raw === null) return [];
    let events;
    try { events = JSON.parse(raw); } catch { fail('El registro de calificación del autoclave está dañado. Conservar un respaldo antes de corregirlo.'); }
    const invalid = () => fail('El registro de calificación del autoclave no tiene un formato válido. No se sobrescribió.');
    if (!Array.isArray(events) || events.some((e) => !validEnvelope(e)) || new Set(events.map((e) => e.id)).size !== events.length) invalid();
    // Un evento que referencia algo inexistente (p. ej. restaurado de un respaldo
    // editado a mano) no debe llegar a la interfaz.
    try { foldEvents(events); } catch { invalid(); }
    return events;
  }

  // ── estado de compuertas en el tiempo ──────────────────────────────────
  // La fecha efectiva es cuándo se concluyó la evidencia; puede registrarse después.
  function gateStatusAt(state, gateId, ms) {
    const reviews = (state.gateReviews[gateId] || []).filter((r) => isoMs(r.effectiveAt) <= ms);
    const last = reviews[reviews.length - 1] || null;
    return { status: last ? last.status : 'abierto', review: last };
  }
  function protocolApprovedAt(protocol) { return protocol?.approval ? isoMs(protocol.approval.effectiveAt) : NaN; }

  // ── evaluación de una corrida ──────────────────────────────────────────
  /**
   * @returns {{runId,status:'conforme'|'no_conforme'|'invalida'|'pendiente',reasons:Array,metrics:object}}
   * Prioridad: inválida > no conforme > pendiente > conforme. Un criterio
   * incumplido es definitivo; una corrida pendiente aún no cuenta.
   */
  function evaluateRun(state, runId, nowMs = Date.now()) {
    const run = state.runs[runId];
    if (!run) fail('Corrida no registrada.');
    const reasons = [];
    const add = (severity, code, message) => reasons.push({ severity, code, message });
    const protocol = state.protocols[run.protocolId];
    const p = protocol?.params;
    const execMs = isoMs(run.executedAt);
    const metrics = { plateau: null, coverage: {}, chamber: null, deltaT: null, lag: null, f0: null, indicators: null };

    // Contexto: protocolo aprobado y G1 cerrada ANTES de ejecutar.
    if (!protocol) add('pending', 'protocol_missing', 'La corrida no referencia un protocolo registrado.');
    else if (!protocol.approval) add('pending', 'protocol_unapproved', 'El protocolo aún no está aprobado: sus criterios siguen pendientes.');
    else if (protocolApprovedAt(protocol) > execMs) add('invalid', 'protocol_after_run', 'La corrida se ejecutó antes de aprobar el protocolo; no cuenta para la serie.');
    if (gateStatusAt(state, 'G1', execMs).status !== 'cerrado') {
      add('invalid', 'g1_open_at_run', 'G1 (seguridad y manometría) no estaba cerrada al ejecutar: un ensayo presurizado con G1 abierta no cuenta.');
    }
    if (!state.configurations[run.configurationId]) add('invalid', 'configuration_missing', 'La configuración de carga no está registrada.');
    const openDeviations = Object.values(run.deviations).filter((d) => d.status !== 'cerrada');
    if (openDeviations.length) add('pending', 'deviation_open', `${openDeviations.length} desviación(es) abierta(s) sin explicar.`);

    // Datos
    if (!run.data) add('pending', 'data_missing', 'Faltan los datos del datalogger.');
    if (run.imports.length > 1 && !Object.values(run.deviations).some((d) => d.status === 'cerrada')) {
      add('pending', 'data_replaced', 'Los datos se reemplazaron después de la primera carga: documentar y cerrar una desviación que lo explique.');
    }
    const firstImportMs = run.imports.length ? isoMs(run.imports[0].at) : NaN;
    if (Number.isFinite(firstImportMs) && run.plateauHistory.some((h, i) => i > 0 && isoMs(h.at) > firstImportMs)) {
      add('invalid', 'plateau_changed_after_data', 'La meseta se redefinió después de cargar los datos. La ficha PQ-1 no permite recortar la meseta a posteriori.');
    }

    if (run.data && p) {
      const d = run.data;
      const s = toAxisMinutes(run.plateau.start, d.timeKind);
      const e = toAxisMinutes(run.plateau.end, d.timeKind);
      if (run.plateau.kind !== d.timeKind) add('invalid', 'plateau_time_base', 'La meseta usa una base de tiempo distinta a la del archivo (hora o minutos transcurridos).');
      else if (s === null || e === null || e <= s) add('invalid', 'plateau_invalid', 'El inicio y fin de meseta no son válidos.');
      else if (s < d.t[0] || e > d.t[d.t.length - 1]) add('invalid', 'plateau_outside_data', 'La meseta declarada queda fuera del registro del datalogger.');
      else {
        metrics.plateau = { startMin: s, endMin: e, durationMin: round(e - s, 1) };
        const chamber = d.values[run.mapping.chamber] || [];
        const products = run.mapping.products.map((id) => ({ id, v: d.values[id] || [] }));
        const pressure = d.values[run.mapping.pressure] || [];
        if (products.length < p.minProductProbes) add('invalid', 'product_probes', `El protocolo exige ${p.minProductProbes} sonda(s) de producto; hay ${products.length}.`);
        const channels = [['Cámara', run.mapping.chamber, chamber], ['Presión', run.mapping.pressure, pressure], ...products.map((x) => [`Producto ${x.id}`, x.id, x.v])];
        channels.forEach(([label, id, v]) => {
          const c = coverage(d.t, v, s, e);
          metrics.coverage[id] = { label, samples: c.samples, maxGapMin: round(c.maxGapMin, 2) };
          if (!c.samples) add('invalid', 'channel_empty', `${label}: sin lecturas dentro de la meseta.`);
          else if (c.maxGapMin > p.maxGapMin) add('invalid', 'channel_gap', `${label}: hueco de ${round(c.maxGapMin, 1)} min dentro de la meseta (máximo del protocolo ${p.maxGapMin} min). Sin datos continuos el criterio no se demuestra.`);
        });

        // Cámara y ΔT de vapor saturado
        const ch = windowPoints(d.t, chamber, s, e);
        if (ch.length) {
          const temps = ch.map((x) => x[1]);
          metrics.chamber = { minC: round(Math.min(...temps)), maxC: round(Math.max(...temps)), belowMin: temps.filter((x) => x < p.chamberMinC).length };
          if (metrics.chamber.belowMin) add('fail', 'chamber_below_min', `Cámara bajo ${p.chamberMinC} °C en ${metrics.chamber.belowMin} lectura(s) de la meseta (mínimo ${metrics.chamber.minC} °C).`);
        }
        const factor = run.pressureUnit === 'psig' ? KPA_PER_PSI : 1;
        const deltas = [];
        for (let i = 0; i < d.t.length; i++) {
          if (d.t[i] < s || d.t[i] > e || !Number.isFinite(pressure[i]) || !Number.isFinite(chamber[i])) continue;
          const tsat = saturationTemperatureC((pressure[i] + run.gaugeCorrection) * factor + run.ambientPressureKpa);
          if (tsat !== null) deltas.push(tsat - chamber[i]);
        }
        if (deltas.length) {
          const maxAbs = Math.max(...deltas.map(Math.abs));
          metrics.deltaT = { n: deltas.length, minC: round(Math.min(...deltas)), maxC: round(Math.max(...deltas)), maxAbsC: round(maxAbs) };
          if (maxAbs > p.maxAbsDeltaTC) add('fail', 'delta_t', `|ΔT| vapor saturado − cámara llegó a ${round(maxAbs)} °C (máximo ${p.maxAbsDeltaTC} °C). Posible aire residual, error de presión o de sonda: investigar.`);
        } else add('invalid', 'delta_t_missing', 'No hay lecturas simultáneas de presión y cámara dentro de la meseta para calcular ΔT.');

        // Retardo térmico
        const chamberReach = firstCrossing(d.t, chamber, p.thermalTargetC);
        const probeLags = {};
        let maxLag = null;
        if (!chamberReach) add('fail', 'chamber_not_reached', `La cámara no alcanzó el objetivo térmico de ${p.thermalTargetC} °C.`);
        else if (chamberReach.censored) add('invalid', 'chamber_censored', 'El registro empezó con la cámara sobre el objetivo térmico: no se conoce cuándo lo alcanzó.');
        products.forEach(({ id, v }) => {
          const reach = firstCrossing(d.t, v, p.thermalTargetC);
          if (!reach) { probeLags[id] = { reachedMin: null, lagMin: null }; add('fail', 'product_not_reached', `Sonda ${id}: el producto no alcanzó ${p.thermalTargetC} °C.`); return; }
          if (reach.censored) { probeLags[id] = { reachedMin: reach.atMin, lagMin: null }; add('invalid', 'product_censored', `Sonda ${id}: el registro empezó con el producto sobre el objetivo.`); return; }
          const lag = chamberReach && !chamberReach.censored ? reach.atMin - chamberReach.atMin : null;
          probeLags[id] = { reachedMin: reach.atMin, lagMin: round(lag, 1) };
          if (lag !== null) maxLag = maxLag === null ? lag : Math.max(maxLag, lag);
        });
        metrics.lag = { targetC: p.thermalTargetC, chamberReachedMin: chamberReach ? chamberReach.atMin : null, probes: probeLags, maxLagMin: round(maxLag, 1) };

        // Letalidad acumulada en la meseta
        const f0 = {};
        products.forEach(({ id, v }) => { const r = accumulateF0(d.t, v, s, e, p); f0[id] = { totalMin: round(r.totalMin, 2), crossAtMin: round(r.crossAtMin, 1) }; });
        const ids = Object.keys(f0);
        if (ids.length) {
          const cold = ids.reduce((a, b) => (f0[b].totalMin < f0[a].totalMin ? b : a));
          const allCross = ids.every((id) => f0[id].crossAtMin !== null);
          metrics.f0 = { tRefC: p.tRefC, zC: p.zC, targetMin: p.f0TargetMin, probes: f0, coldProbe: cold, minTotalMin: f0[cold].totalMin,
            crossAtMin: allCross ? Math.max(...ids.map((id) => f0[id].crossAtMin)) : null };
          if (!allCross) add('fail', 'f0_not_reached', `F₀ en el punto más frío (${cold}) fue ${f0[cold].totalMin} min; la meta es ${p.f0TargetMin} min dentro de la meseta.`);
        }
      }
    }

    // Indicadores
    const ind = run.indicators;
    if (!ind) add('pending', 'indicators_missing', 'Faltan los resultados de integradores químicos e indicadores biológicos.');
    else if (p) {
      const ci = Array.isArray(ind.ci) ? ind.ci : [];
      const ib = Array.isArray(ind.ib) ? ind.ib : [];
      const controls = Array.isArray(ind.controls) ? ind.controls : [];
      const count = (list, value) => list.filter((x) => x.result === value).length;
      metrics.indicators = {
        ci: { pass: count(ci, 'pass'), fail: count(ci, 'fail'), pending: count(ci, 'pending'), required: p.ciPerRun },
        ib: { negative: count(ib, 'negativo'), positive: count(ib, 'positivo'), pending: count(ib, 'pendiente'), required: p.ibPerRun },
        controls: { positive: count(controls, 'positivo'), negative: count(controls, 'negativo'), pending: count(controls, 'pendiente'), required: p.controlsPerRun },
      };
      const runDate = Number.isFinite(execMs) ? bogotaDate(execMs) : null;
      [['ci', 'integradores químicos'], ['ib', 'indicadores biológicos']].forEach(([k, label]) => {
        const lot = ind.lots?.[k] || {};
        if (!text(lot.lot) || !/^\d{4}-\d{2}-\d{2}$/.test(lot.expiry || '') || !text(lot.ifu)) add('pending', `${k}_lot`, `Registrar lote, caducidad e IFU de los ${label}.`);
        else if (runDate && lot.expiry < runDate) add('invalid', `${k}_expired`, `Los ${label} estaban vencidos el día de la corrida (${lot.expiry}).`);
      });
      if (metrics.indicators.ci.fail) add('fail', 'ci_fail', `${metrics.indicators.ci.fail} integrador(es) químico(s) no viraron conforme a la IFU.`);
      if (ci.length < p.ciPerRun) add('pending', 'ci_count', `Se registraron ${ci.length} de ${p.ciPerRun} integradores químicos.`);
      else if (metrics.indicators.ci.pending) add('pending', 'ci_pending', 'Hay integradores químicos sin leer.');

      const badControls = controls.filter((c) => c.result === 'negativo' || (c.result === 'positivo' && !(finite(c.firstPositiveHours) && Number(c.firstPositiveHours) <= p.controlMaxHours)));
      if (badControls.length) add('invalid', 'control_failed', `Control positivo sin crecimiento o fuera de ${p.controlMaxHours} h: la corrida es inválida y rompe la serie.`);
      else if (controls.length < p.controlsPerRun) add('pending', 'control_count', `Se registraron ${controls.length} de ${p.controlsPerRun} controles positivos.`);
      else if (metrics.indicators.controls.pending) add('pending', 'control_pending', 'El control positivo aún no tiene lectura.');

      if (metrics.indicators.ib.positive) add('fail', 'ib_positive', `${metrics.indicators.ib.positive} indicador(es) biológico(s) procesado(s) con crecimiento: el ciclo no inactivó las esporas de referencia.`);
      if (ib.length < p.ibPerRun) add('pending', 'ib_count', `Se registraron ${ib.length} de ${p.ibPerRun} indicadores biológicos procesados.`);
      else {
        const early = ib.filter((x) => x.result === 'negativo' && !(finite(x.readHours) && Number(x.readHours) >= p.ibReadHours));
        if (metrics.indicators.ib.pending || early.length) add('pending', 'ib_pending', `Los IB negativos solo se declaran tras ${p.ibReadHours} h de lectura válida.`);
      }
    }
    if (Number.isFinite(execMs) && execMs > nowMs) add('invalid', 'future_run', 'La fecha de la corrida está en el futuro.');

    const has = (sev) => reasons.some((r) => r.severity === sev);
    const status = has('invalid') ? 'invalida' : has('fail') ? 'no_conforme' : has('pending') ? 'pendiente' : 'conforme';
    return { runId, configurationId: run.configurationId, protocolId: run.protocolId, executedAt: run.executedAt, status, reasons, metrics };
  }

  // ── serie PQ-1 de una configuración ────────────────────────────────────
  function evaluateSeries(state, configurationId, nowMs = Date.now()) {
    const runs = Object.values(state.runs).filter((r) => r.configurationId === configurationId)
      .sort((a, b) => isoMs(a.executedAt) - isoMs(b.executedAt));
    const evaluations = runs.map((r) => evaluateRun(state, r.id, nowMs));
    const last = evaluations[evaluations.length - 1] || null;
    const protocol = last ? state.protocols[last.protocolId] : null;
    const required = protocol?.params?.runsRequired || CANDIDATE_PROTOCOL.runsRequired;
    let streak = 0;
    for (let i = evaluations.length - 1; i >= 0; i--) {
      if (evaluations[i].status !== 'conforme' || evaluations[i].protocolId !== last.protocolId) break;
      streak++;
    }
    const window = evaluations.slice(-required);
    const lags = window.map((e) => e.metrics.lag?.maxLagMin).filter((x) => Number.isFinite(x));
    const lagRange = lags.length ? round(Math.max(...lags) - Math.min(...lags), 1) : null;
    const reasons = [];
    let status;
    if (!last) { status = 'sin_corridas'; reasons.push('No hay corridas registradas para esta configuración.'); }
    else if (last.status === 'pendiente') { status = 'en_curso'; reasons.push('La última corrida está pendiente de datos o indicadores.'); }
    else if (last.status === 'invalida' || last.status === 'no_conforme') {
      status = 'no_go';
      reasons.push(`La última corrida es ${last.status === 'invalida' ? 'inválida' : 'no conforme'}: investigar, documentar la corrección y reiniciar la serie.`);
    } else if (streak < required) { status = 'en_curso'; reasons.push(`${streak} de ${required} corridas consecutivas conformes.`); }
    else if (lagRange === null || lagRange > protocol.params.maxLagRangeMin) {
      status = 'no_go';
      reasons.push(`El rango del retardo térmico entre las ${required} corridas es ${lagRange} min (máximo ${protocol.params.maxLagRangeMin} min): reproducibilidad no demostrada.`);
    } else { status = 'conforme'; reasons.push(`${required} corridas consecutivas conformes con el protocolo ${last.protocolId}.`); }
    const totals = window.reduce((acc, e) => {
      const i = e.metrics.indicators;
      if (i) { acc.ci += i.ci.pass; acc.ib += i.ib.negative; acc.controls += i.controls.positive; }
      return acc;
    }, { ci: 0, ib: 0, controls: 0 });
    return { configurationId, status, reasons, required, streak, lagRangeMin: lagRange, protocolId: last?.protocolId || null, evaluations, windowTotals: totals };
  }

  // ── estudios PQ-2 (G3: controles A/B; G4: placas C del spawn) ───────────
  /**
   * A/B: sustrato procesado sin spawn, sellado (A) o abierto y resellado en el
   * entorno de inoculación (B). Conforme: 0/n contaminadas en ambos grupos al
   * completar la duración fijada. C: placas del lote de spawn y blancos; los
   * blancos no crecen, ninguna placa se contamina y todas muestran salto
   * micelial antes del límite. No identifica causa ni certifica pureza absoluta.
   */
  function evaluateStudy(state, studyId, nowMs = Date.now()) {
    const st = state.studies[studyId];
    if (!st) fail('Estudio PQ-2 no registrado.');
    const reasons = [];
    const add = (severity, code, message) => reasons.push({ severity, code, message });
    const startMs = isoMs(st.startedAt);
    const readings = st.readings;
    const dayOf = (r) => (isoMs(r.readAt) - startMs) / DAY_MS;
    const lastDay = readings.length ? dayOf(readings[readings.length - 1]) : 0;
    let maxGap = 0, prev = 0;
    readings.forEach((r) => { maxGap = Math.max(maxGap, dayOf(r) - prev); prev = dayOf(r); });
    const temps = readings.map((r) => r.tempC);
    const metrics = { readings: readings.length, lastDay: round(lastDay, 1), maxGapDays: round(maxGap, 1),
      tempMinC: temps.length ? round(Math.min(...temps), 1) : null, tempMaxC: temps.length ? round(Math.max(...temps), 1) : null,
      contaminated: [], jumpDays: {}, blanksWithGrowth: [] };
    if (!readings.length) add('pending', 'no_readings', 'Sin lecturas registradas.');
    const outOfRange = readings.filter((r) => Math.abs(r.tempC - st.incubationTempC) > st.tempToleranceC);
    if (outOfRange.length) add('invalid', 'temp_out', `${outOfRange.length} lectura(s) con incubación fuera de ${st.incubationTempC} ± ${st.tempToleranceC} °C: condiciones del estudio no cumplidas.`);
    if (maxGap > st.readingIntervalDays) add('invalid', 'reading_gap', `Hueco de ${round(maxGap, 1)} días entre lecturas (máximo ${st.readingIntervalDays}).`);
    st.units.forEach((u) => {
      const states = readings.map((r) => r.units[u]);
      if (states.includes('contaminada')) metrics.contaminated.push(u);
      if (u.startsWith('K') && states.includes('con_crecimiento')) metrics.blanksWithGrowth.push(u);
      if (u.startsWith('P')) {
        const first = readings.find((r) => r.units[u] === 'salto');
        metrics.jumpDays[u] = first ? round(dayOf(first), 1) : null;
      }
    });
    if (st.kind === 'AB') {
      const a = metrics.contaminated.filter((u) => u.startsWith('A')).length, b = metrics.contaminated.filter((u) => u.startsWith('B')).length;
      metrics.contaminatedA = a; metrics.contaminatedB = b;
      if (a + b) add('fail', 'ab_contaminated', `Contaminación en A ${a}/${st.nPerGroup} y B ${b}/${st.nPerGroup}. A orienta a proceso, bolsa, sello o enfriamiento; B frente a A, a manipulación. Un bloque no atribuye causa.`);
    } else {
      if (metrics.blanksWithGrowth.length) add('invalid', 'blank_growth', `Blanco(s) con crecimiento (${metrics.blanksWithGrowth.join(', ')}): medio o manipulación no aptos; el estudio es inválido.`);
      const plates = metrics.contaminated.filter((u) => u.startsWith('P'));
      if (plates.length) add('fail', 'plate_contaminated', `Placa(s) con contaminantes detectables: ${plates.join(', ')}.`);
      Object.entries(metrics.jumpDays).forEach(([u, d]) => {
        if (d !== null && d >= st.maxJumpDays) add('fail', 'jump_late', `${u}: salto micelial al día ${d} (límite < ${st.maxJumpDays} días).`);
        else if (d === null && lastDay >= st.maxJumpDays) add('fail', 'jump_missing', `${u}: sin salto micelial a los ${st.maxJumpDays} días.`);
        else if (d === null) add('pending', 'jump_pending', `${u}: aún sin salto micelial.`);
      });
    }
    if (readings.length && lastDay < st.observationDays) add('pending', 'duration', `Día ${round(lastDay, 1)} de ${st.observationDays}: el estudio se cierra solo al completar la duración fijada.`);
    if (readings.some((r) => isoMs(r.readAt) > nowMs)) add('invalid', 'future_reading', 'Hay lecturas con fecha futura.');
    const has = (sev) => reasons.some((r) => r.severity === sev);
    const status = has('invalid') ? 'invalida' : has('fail') ? 'no_conforme' : has('pending') ? 'pendiente' : 'conforme';
    return { studyId, kind: st.kind, status, reasons, metrics };
  }

  // ── liberación para producción ─────────────────────────────────────────
  /**
   * Responde si una carga planificada puede esterilizarse con un ciclo
   * calificado. Requiere G1–G4 cerradas por un humano (G2 además con una serie
   * PQ-1 conforme vigente para esa configuración) y la misma carga calificada.
   * G5 gobierna escala y capital comercial: se informa, no bloquea un piloto.
   */
  function assessRelease(state, { configurationId = null, plannedBags = null, plannedWetKgPerBag = null } = {}, nowMs = Date.now()) {
    const gates = GATES.map((g) => ({ ...g, ...gateStatusAt(state, g.id, nowMs) }));
    const config = configurationId ? state.configurations[configurationId] : null;
    const series = config ? evaluateSeries(state, configurationId, nowMs) : null;
    const g2 = gates.find((g) => g.id === 'G2');
    if (g2.status === 'cerrado' && (g2.review?.details?.configurationId !== configurationId || series?.status !== 'conforme')) {
      g2.status = 'abierto';
      g2.effectiveNote = series && series.status !== 'conforme'
        ? 'G2 se cerró, pero la serie PQ-1 vigente de esta configuración ya no es conforme.'
        : 'El cierre de G2 corresponde a otra configuración de carga.';
    }
    // G3/G4 valen mientras su estudio PQ-2 siga conforme (una lectura posterior
    // con contaminación los reabre en la práctica).
    [['G3', 'AB'], ['G4', 'C']].forEach(([id, kind]) => {
      const gate = gates.find((g) => g.id === id);
      const studyId = gate.review?.details?.studyId;
      if (gate.status !== 'cerrado') return;
      const study = studyId && state.studies[studyId]?.kind === kind ? evaluateStudy(state, studyId, nowMs) : null;
      if (!study || study.status !== 'conforme') {
        gate.status = 'abierto';
        gate.effectiveNote = study ? `${id} se cerró, pero el estudio ${studyId} ya no es conforme.` : `${id} no referencia un estudio PQ-2 registrado.`;
      }
    });
    const open = gates.filter((g) => g.requiredForRelease && g.status !== 'cerrado');
    let status = 'released', detail;
    if (!configurationId) { status = 'unknown'; detail = 'Seleccionar la configuración de carga calificada del autoclave.'; }
    else if (!config) { status = 'unknown'; detail = 'La configuración de carga seleccionada no está registrada.'; }
    else if (series.status === 'no_go') { status = 'blocked'; detail = `PQ-1 ${config.id}: ${series.reasons[0]}`; }
    else if (open.length) { status = 'unknown'; detail = `Compuertas abiertas antes de inocular: ${open.map((g) => `${g.id} ${g.label}`).join(' · ')}.`; }
    else if (finite(plannedBags) && Number(plannedBags) !== config.bagCount
      || finite(plannedWetKgPerBag) && Math.abs(Number(plannedWetKgPerBag) - config.wetMassPerBagKg) > LOAD_MASS_TOLERANCE_KG) {
      status = 'unknown';
      detail = `La carga planificada (${plannedBags} × ${plannedWetKgPerBag} kg) no es la calificada (${config.bagCount} × ${config.wetMassPerBagKg} kg). No extrapolar: evaluar representatividad o calificar esa carga.`;
    } else detail = `Ciclo calificado para ${config.id} (${config.bagCount} × ${config.wetMassPerBagKg} kg): G1–G4 cerradas y serie PQ-1 conforme. No autoriza producción comercial ni ventas.`;
    return { status, detail, configurationId, gates, series };
  }

  /**
   * Mejor liberación disponible para una carga entre todas las configuraciones
   * registradas (la primera liberada; si ninguna, la primera evaluada). Resumen
   * serializable para mostrar y guardar junto a una autorización humana.
   */
  function bestReleaseForLoad(events, { plannedBags = null, plannedWetKgPerBag = null } = {}, nowMs = Date.now()) {
    const state = foldEvents(events);
    const releases = Object.keys(state.configurations).map((id) => assessRelease(state, { configurationId: id, plannedBags, plannedWetKgPerBag }, nowMs));
    const best = releases.find((r) => r.status === 'released') || releases.find((r) => r.status === 'blocked') || releases[0];
    return best ? { status: best.status, detail: best.detail, configurationId: best.configurationId }
      : { status: 'unknown', detail: 'No hay configuraciones de carga calificadas: G1–G4 abiertas.', configurationId: null };
  }

  // ── creación de eventos (validación) ───────────────────────────────────
  const ID_RE = /^[A-Za-z0-9._-]{1,64}$/;
  function validPlateau(plateau) {
    if (!plateau || !['datetime', 'elapsed'].includes(plateau.kind)) return false;
    const s = toAxisMinutes(plateau.start, plateau.kind), e = toAxisMinutes(plateau.end, plateau.kind);
    return s !== null && e !== null && e > s;
  }

  function validEffective(p, at) {
    if (p.effectiveAt === undefined || p.effectiveAt === null || p.effectiveAt === '') return true;
    const ms = isoMs(p.effectiveAt);
    return Number.isFinite(ms) && ms <= isoMs(at);
  }

  function validateEvent(state, type, p, at, nowMs) {
    const atMs = isoMs(at);
    if (!validEffective(p, at)) fail('La fecha efectiva debe ser válida y no posterior al registro.');
    switch (type) {
      case 'protocol.drafted': {
        if (!ID_RE.test(p.protocolId || '')) fail('ID de protocolo inválido (letras, números, punto, guion; máx. 64).');
        if (state.protocols[p.protocolId]?.approval) fail('Ese protocolo ya está aprobado. Un cambio requiere una versión nueva con otro ID.');
        const problems = protocolProblems(p.params);
        if (problems.length) fail('Protocolo incompleto: ' + problems.join(' '));
        break;
      }
      case 'protocol.approved': {
        const pr = state.protocols[p.protocolId];
        if (!pr) fail('Protocolo no registrado.');
        if (pr.approval) fail('El protocolo ya está aprobado.');
        if (!text(p.reference)) fail('La aprobación necesita una referencia (documento o acta).');
        if (!pr.microbiologicalBasis) fail('Antes de aprobar, documentar el fundamento microbiológico: organismo objetivo, resistencia térmica, T_ref, z, carga inicial y reducción requerida (matriz G2).');
        break;
      }
      case 'configuration.defined':
        if (!ID_RE.test(p.configurationId || '')) fail('ID de configuración inválido.');
        if (state.configurations[p.configurationId]) fail('La configuración ya existe y es inmutable. Un cambio de carga exige una configuración nueva.');
        if (!text(p.equipmentId)) fail('Indicar el equipo.');
        if (!(Number.isInteger(Number(p.bagCount)) && Number(p.bagCount) > 0)) fail('El número de bolsas debe ser un entero positivo.');
        if (!(finite(p.wetMassPerBagKg) && Number(p.wetMassPerBagKg) > 0)) fail('Indicar la masa húmeda por bolsa en kg.');
        if (!text(p.loadArrangement)) fail('Describir el arreglo de carga (posiciones, rejilla, orientación).');
        break;
      case 'run.registered':
        if (!ID_RE.test(p.runId || '')) fail('ID de corrida inválido.');
        if (state.runs[p.runId]) fail('Ya existe una corrida con ese ID.');
        if (!state.configurations[p.configurationId]) fail('Seleccionar una configuración de carga registrada.');
        if (!state.protocols[p.protocolId]) fail('Seleccionar un protocolo registrado.');
        if (!Number.isFinite(isoMs(p.executedAt)) || isoMs(p.executedAt) > nowMs) fail('Fecha de ejecución inválida o futura.');
        if (!text(p.operator)) fail('Indicar el operador.');
        if (!(finite(p.ambientPressureKpa) && Number(p.ambientPressureKpa) >= 50 && Number(p.ambientPressureKpa) <= 110)) fail('Registrar la presión ambiente absoluta medida (kPa, 50–110). No se supone la nominal de Tenjo.');
        if (!['psig', 'kPa'].includes(p.pressureUnit)) fail('Unidad del manómetro: psig o kPa.');
        if (!finite(p.gaugeCorrection)) fail('Registrar la corrección del manómetro según su certificado (0 si el certificado no indica corrección).');
        if (!validPlateau(p.plateau)) fail('Declarar inicio y fin de meseta antes de cargar los datos; el fin debe ser posterior al inicio.');
        break;
      case 'run.plateau_changed': {
        const run = state.runs[p.runId];
        if (!run) fail('Corrida no registrada.');
        if (!validPlateau({ kind: run.plateau.kind, start: p.start, end: p.end })) fail('Meseta inválida.');
        if (!text(p.reason)) fail('Explicar por qué cambia la meseta.');
        break;
      }
      case 'run.data_imported': {
        const run = state.runs[p.runId];
        if (!run) fail('Corrida no registrada.');
        const d = p.data, m = p.mapping;
        if (!d || !Array.isArray(d.t) || !d.t.length || !d.values || !['datetime', 'elapsed'].includes(d.timeKind)) fail('Datos del datalogger inválidos.');
        if (!m || !text(m.chamber) || !text(m.pressure) || !Array.isArray(m.products) || !m.products.length) fail('Asignar columnas de cámara, presión y al menos una sonda de producto.');
        const cols = [m.chamber, m.pressure, ...m.products];
        if (new Set(cols).size !== cols.length) fail('Cada columna puede tener un solo rol.');
        if (cols.some((c) => !Array.isArray(d.values[c]) || d.values[c].length !== d.t.length)) fail('Una columna asignada no existe en el archivo.');
        if (d.timeKind !== run.plateau.kind) fail('El archivo usa otra base de tiempo que la meseta declarada.');
        // Errores de captura se rechazan aquí, sin guardar: una corrida inválida
        // guardada rompería la serie aunque el ensayo físico fuera correcto.
        const first = d.t[0], last = d.t[d.t.length - 1];
        const s = toAxisMinutes(run.plateau.start, run.plateau.kind), e = toAxisMinutes(run.plateau.end, run.plateau.kind);
        if (s < first || e > last) fail('La meseta declarada queda fuera del registro del archivo. Revisar la meseta o el archivo antes de guardar.');
        const params = state.protocols[run.protocolId]?.params;
        if (params && m.products.length < params.minProductProbes) fail(`El protocolo exige ${params.minProductProbes} sonda(s) de producto.`);
        if (d.timeKind === 'datetime' && Math.abs(first - (isoMs(run.executedAt) / 60000 + BOGOTA_OFFSET_MIN)) > 24 * 60) {
          fail('La fecha del archivo no coincide con la fecha de la corrida (más de 24 h de diferencia).');
        }
        break;
      }
      case 'run.indicators_recorded': {
        if (!state.runs[p.runId]) fail('Corrida no registrada.');
        const ind = p.indicators || {};
        const okList = (list, values) => Array.isArray(list) && list.every((x) => x && text(x.position) && values.includes(x.result));
        if (!okList(ind.ci, ['pass', 'fail', 'pending']) || !okList(ind.ib, ['negativo', 'positivo', 'pendiente']) || !okList(ind.controls, ['positivo', 'negativo', 'pendiente'])) {
          fail('Cada indicador necesita posición y un resultado válido.');
        }
        break;
      }
      case 'run.deviation_recorded':
        if (!state.runs[p.runId]) fail('Corrida no registrada.');
        if (!ID_RE.test(p.deviationId || '')) fail('ID de desviación inválido.');
        if (!text(p.description)) fail('Describir la desviación.');
        if (!['abierta', 'cerrada'].includes(p.status)) fail('Estado de desviación: abierta o cerrada.');
        if (p.status === 'cerrada' && !text(p.resolution)) fail('Una desviación cerrada necesita su resolución.');
        break;
      case 'gate.reviewed': {
        if (!GATE_IDS.includes(p.gateId)) fail('Compuerta desconocida.');
        if (!['cerrado', 'abierto'].includes(p.status)) fail('Estado de compuerta: cerrado o abierto.');
        if (p.status === 'abierto' && !text(p.notes)) fail('Explicar por qué la compuerta sigue o vuelve a quedar abierta.');
        if (p.status === 'cerrado') {
          if (!text(p.reference)) fail('Cerrar una compuerta exige una referencia de evidencia.');
          const det = p.details || {};
          if (p.gateId === 'G1' && (!text(det.calibrationCertificate) || !text(det.inspectionReport))) {
            fail('G1 exige el certificado de calibración del manómetro (error, incertidumbre, corrección) y el informe técnico de integridad del servicio competente.');
          }
          if (p.gateId === 'G2') {
            if (!state.configurations[det.configurationId]) fail('G2 se cierra para una configuración de carga registrada.');
            const series = evaluateSeries(state, det.configurationId, Math.min(atMs, nowMs));
            const latestRun = Math.max(...series.evaluations.map((e) => isoMs(e.executedAt)));
            if (p.effectiveAt && isoMs(p.effectiveAt) < latestRun) fail('La fecha efectiva de G2 no puede ser anterior a la última corrida de la serie.');
            if (series.status !== 'conforme') fail(`G2 no puede cerrarse: serie PQ-1 de ${det.configurationId} ${series.status.replace('_', ' ')}. ${series.reasons[0]}`);
          }
          [['G3', 'AB', 'controles A/B'], ['G4', 'C', 'placas C del spawn']].forEach(([id, kind, label]) => {
            if (p.gateId !== id) return;
            const study = state.studies[det.studyId];
            if (!study || study.kind !== kind) fail(`${id} se cierra con un estudio PQ-2 de ${label} registrado.`);
            const ev = evaluateStudy(state, det.studyId, Math.min(atMs, nowMs));
            if (ev.status !== 'conforme') fail(`${id} no puede cerrarse: estudio ${det.studyId} ${ev.status.replace('_', ' ')}. ${ev.reasons[0]?.message || ''}`);
          });
          if (p.gateId === 'G5') {
            if (!finite(det.plannedBlocksPerWeek)) fail('G5 exige los bloques por semana planificados.');
            if (Number(det.plannedBlocksPerWeek) > G5_BLOCKS_PER_WEEK_LIMIT && !text(det.alternativeValidation)) {
              fail(`Sobre ${G5_BLOCKS_PER_WEEK_LIMIT} bloques/semana, G5 exige la validación de una alternativa de mayor volumen.`);
            }
          }
        }
        break;
      }
      case 'pq2.defined': {
        if (!ID_RE.test(p.studyId || '')) fail('ID de estudio inválido.');
        if (state.studies[p.studyId]) fail('El estudio ya existe y es inmutable: n, duración, tolerancia y frecuencia se fijan antes de empezar.');
        if (!['AB', 'C'].includes(p.kind)) fail('Tipo de estudio: AB (controles de sustrato) o C (placas del spawn).');
        if (!Number.isFinite(isoMs(p.startedAt)) || isoMs(p.startedAt) > atMs) fail('Indicar el inicio del estudio (no futuro).');
        const pos = (k, label) => { if (!(finite(p[k]) && Number(p[k]) > 0)) fail(`Indicar ${label}.`); };
        const posInt = (k, label) => { if (!(Number.isInteger(Number(p[k])) && Number(p[k]) > 0)) fail(`Indicar ${label} (entero ≥ 1).`); };
        if (!finite(p.incubationTempC)) fail('Indicar la temperatura de incubación.');
        pos('tempToleranceC', 'la tolerancia térmica (°C)');
        pos('readingIntervalDays', 'la frecuencia máxima entre lecturas (días)');
        pos('observationDays', 'la duración fijada (días)');
        if (p.kind === 'AB') {
          posInt('nPerGroup', 'n por grupo');
          if (!state.configurations[p.configurationId]) fail('Vincular la configuración de carga con que se procesaron los controles.');
          if (!text(p.thermalRunRef)) fail('Indicar la corrida térmica que procesó los controles.');
          const d = Number(p.observationDays);
          if (d < PQ2_CANDIDATE.observationDaysMin || d > PQ2_CANDIDATE.observationDaysMax) fail(`La duración A/B debe quedar dentro de la ventana ${PQ2_CANDIDATE.observationDaysMin}–${PQ2_CANDIDATE.observationDaysMax} días.`);
        } else {
          if (!text(p.spawnLot)) fail('Indicar el lote de spawn.');
          posInt('plates', 'el número de placas con spawn');
          posInt('blanks', 'el número de blancos sin spawn');
          pos('maxJumpDays', 'el límite de salto micelial (días)');
        }
        break;
      }
      case 'pq2.reading': {
        const st = state.studies[p.studyId];
        if (!st) fail('Estudio PQ-2 no registrado.');
        const ms = isoMs(p.readAt);
        if (!Number.isFinite(ms) || ms > atMs || ms < isoMs(st.startedAt)) fail('La lectura debe quedar entre el inicio del estudio y ahora.');
        if (st.readings.length && ms <= isoMs(st.readings[st.readings.length - 1].readAt)) fail('Las lecturas se registran en orden: esta es anterior a la última.');
        if (!finite(p.tempC)) fail('Registrar la temperatura de incubación medida en la lectura.');
        const units = p.units || {};
        st.units.forEach((u) => { if (!PQ2_STATES[u[0]].includes(units[u])) fail(`Registrar el estado de ${u}.`); });
        if (Object.keys(units).some((u) => !st.units.includes(u))) fail('La lectura incluye unidades que el estudio no declaró.');
        break;
      }
      default: fail('Tipo de evento desconocido.');
    }
  }

  /**
   * Valida y construye un evento nuevo contra el estado actual. No escribe:
   * quien llama lo anexa (SetasPrototype.persist en la app).
   */
  function createEvent(events, type, payload, { at = new Date().toISOString(), by, id, nowMs = Date.now() } = {}) {
    if (!EVENT_TYPES.includes(type)) fail('Tipo de evento desconocido.');
    if (!text(by)) fail('Indicar el responsable del registro.');
    if (!text(id)) fail('Falta el identificador del evento.');
    if (!Number.isFinite(isoMs(at)) || isoMs(at) > nowMs + 60000) fail('Fecha del registro inválida.');
    if (events.length && isoMs(at) < Math.max(...events.map((e) => isoMs(e.at)))) fail('El registro es sólo-anexar: la fecha no puede ser anterior al último evento.');
    const state = foldEvents(events);
    validateEvent(state, type, payload || {}, at, nowMs);
    const event = { schema: SCHEMA, id: text(id), type, at, by: text(by), payload: JSON.parse(JSON.stringify(payload || {})) };
    if (!validEnvelope(event)) fail('Evento inválido.');
    return event;
  }

  /** Resumen para la interfaz: compuertas, configuraciones y su serie. */
  function summarize(events, nowMs = Date.now()) {
    const state = foldEvents(events);
    const configurations = Object.values(state.configurations).map((c) => ({ ...c, series: evaluateSeries(state, c.id, nowMs) }));
    const gates = GATES.map((g) => ({ ...g, ...gateStatusAt(state, g.id, nowMs), history: state.gateReviews[g.id] }));
    const next = gates.find((g) => g.requiredForRelease && g.status !== 'cerrado') || null;
    const studies = Object.values(state.studies).map((st) => ({ ...st, evaluation: evaluateStudy(state, st.id, nowMs) }));
    return { state, gates, configurations, protocols: Object.values(state.protocols), studies, next };
  }

  const api = {
    KEY, SCHEMA, CANDIDATE_PROTOCOL, CANDIDATE_ORIGIN, GATES, EVENT_TYPES, G5_BLOCKS_PER_WEEK_LIMIT, PQ2_CANDIDATE, PQ2_STATES,
    saturationTemperatureC, saturationPressureKpa, parseLoggerCsv, toAxisMinutes,
    protocolProblems, foldEvents, readEvents, createEvent, evaluateRun, evaluateSeries, evaluateStudy, assessRelease, bestReleaseForLoad, summarize, gateStatusAt,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SetasAutoclaveQualification = api;
})(globalThis);
