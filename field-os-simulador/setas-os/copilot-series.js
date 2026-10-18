'use strict';

/**
 * @file copilot-series.js — Construcción de series medidas para el Copiloto de cultivo.
 *
 * Filtra `liveTelemetry.snapshot.rooms` para que el Copiloto, el reloj biológico
 * y el motor de riesgo de contaminación solo reciban telemetría real, fresca y
 * con suficientes puntos. Nunca sintetiza lecturas cuando no hay sensores.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const api = factory();
    module.exports = api;
    if (typeof globalThis !== 'undefined') {
      globalThis.SetasCopilotSeries = api;
    }
  } else {
    root.SetasCopilotSeries = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  // Provisional — Stage 1.4 / Stage 3 revisarán la ventana de frescura y el mínimo de muestras.
  const DEFAULT_MAX_AGE_MS = 30 * 60 * 1000;
  const DEFAULT_MIN_POINTS = 6;
  const COPILOT_METRICS = ['temperature_c', 'rh_pct', 'co2_ppm'];
  const FALLBACK_STEP_MS = 5 * 60 * 1000;

  function resolveTimestampMs(rawT) {
    if (typeof rawT === 'number' && Number.isFinite(rawT)) return rawT;
    if (typeof rawT === 'string' && rawT.trim()) {
      const parsed = Date.parse(rawT);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  }

  function resolveMetricNewestMs(room, metric, nowMs) {
    if (room && room.metricAgeMs && Number.isFinite(room.metricAgeMs[metric])) {
      return nowMs - room.metricAgeMs[metric];
    }
    const reading = room && room.latest && room.latest[metric];
    if (reading) {
      const fromObserved = resolveTimestampMs(reading.observed_at ?? reading.t ?? reading.timestamp);
      if (fromObserved != null) return fromObserved;
    }
    if (room && Number.isFinite(room.ageMs)) {
      return nowMs - room.ageMs;
    }
    if (room && Number.isFinite(room.lastUpdateAt)) {
      return room.lastUpdateAt;
    }
    return null;
  }

  function extractMetricPoints(room, metric, nowMs) {
    const seriesContainer = room && room.series;
    if (!seriesContainer) return [];
    const raw = seriesContainer[metric];
    if (!raw) return [];

    const list = typeof raw.points === 'function'
      ? raw.points()
      : (Array.isArray(raw) ? raw : []);
    if (!list.length) return [];

    const first = list[0];
    if (first && typeof first === 'object') {
      const points = [];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (!item || typeof item !== 'object') continue;
        const t = resolveTimestampMs(item.t ?? item.observed_at ?? item.timestamp);
        const v = Number.isFinite(item.v) ? item.v : (Number.isFinite(item.value) ? item.value : null);
        if (t != null && v != null) {
          points.push({ t, v });
        }
      }
      return points;
    }

    if (typeof first === 'number') {
      const newestT = resolveMetricNewestMs(room, metric, nowMs);
      if (newestT == null) return [];
      const numericValues = list.filter((n) => typeof n === 'number' && Number.isFinite(n));
      const n = numericValues.length;
      return numericValues.map((v, i) => ({
        t: newestT - (n - 1 - i) * FALLBACK_STEP_MS,
        v,
      }));
    }

    return [];
  }

  /**
   * Construye las series por sala para el Copiloto únicamente a partir de salas
   * medidas, frescas y con suficientes lecturas.
   *
   * @param {object} snapshotRooms Mapa `liveTelemetry.snapshot.rooms`
   * @param {object} [options]
   * @param {number} [options.nowMs]
   * @param {number} [options.maxAgeMs] Provisional: 30 min por defecto
   * @param {number} [options.minPoints] Provisional: 6 puntos por defecto
   * @returns {{ seriesByRoom: Record<string, Array<{t:number, temperature_c?:number, rh_pct?:number, co2_ppm?:number}>>, stateByRoom: Record<string, 'measured'|'stale'|'missing'|'insufficient'> }}
   */
  function buildCopilotSeriesByRoom(snapshotRooms, options = {}) {
    const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
    const maxAgeMs = Number.isFinite(options.maxAgeMs) ? options.maxAgeMs : DEFAULT_MAX_AGE_MS;
    const minPoints = Number.isFinite(options.minPoints) ? options.minPoints : DEFAULT_MIN_POINTS;

    const seriesByRoom = {};
    const stateByRoom = {};

    if (!snapshotRooms || typeof snapshotRooms !== 'object') {
      return { seriesByRoom, stateByRoom };
    }

    for (const [roomId, room] of Object.entries(snapshotRooms)) {
      if (!room || typeof room !== 'object') {
        stateByRoom[roomId] = 'missing';
        continue;
      }

      const pointsByMetric = {};
      let anyPoints = false;
      const freshMetrics = [];

      for (const metric of COPILOT_METRICS) {
        const pts = extractMetricPoints(room, metric, nowMs);
        pointsByMetric[metric] = pts;
        if (pts.length > 0) {
          anyPoints = true;
          const newest = pts[pts.length - 1];
          const ageMs = nowMs - newest.t;
          if (Number.isFinite(ageMs) && ageMs <= maxAgeMs) {
            freshMetrics.push(metric);
          }
        }
      }

      if (!anyPoints) {
        stateByRoom[roomId] = 'missing';
        continue;
      }

      if (freshMetrics.length === 0) {
        stateByRoom[roomId] = 'stale';
        continue;
      }

      const maxFreshLen = Math.max(...freshMetrics.map((m) => pointsByMetric[m].length));
      if (maxFreshLen < minPoints) {
        stateByRoom[roomId] = 'insufficient';
        continue;
      }

      const anchorMetric = freshMetrics.reduce((best, m) => (
        pointsByMetric[m].length > pointsByMetric[best].length ? m : best
      ), freshMetrics[0]);
      const anchorPoints = pointsByMetric[anchorMetric];

      const merged = [];
      for (let i = 0; i < anchorPoints.length; i++) {
        const entry = { t: anchorPoints[i].t };
        for (const metric of COPILOT_METRICS) {
          if (!freshMetrics.includes(metric)) continue;
          const pts = pointsByMetric[metric];
          const pt = pts[i];
          if (pt && Number.isFinite(pt.v)) {
            entry[metric] = pt.v;
          }
        }
        merged.push(entry);
      }

      stateByRoom[roomId] = 'measured';
      seriesByRoom[roomId] = merged;
    }

    return { seriesByRoom, stateByRoom };
  }

  return {
    DEFAULT_MAX_AGE_MS,
    DEFAULT_MIN_POINTS,
    COPILOT_METRICS,
    buildCopilotSeriesByRoom,
  };
});
