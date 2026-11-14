'use strict';

/**
 * @file climate-alerts-view.js — Alertas de clima del servidor dentro de la app.
 *
 * La función programada (functions/climate-alerts.js) guarda cada alerta en
 * `climate_alerts/{roomId}__{kind}` y avisa por correo. Este módulo convierte
 * esos documentos en lo que muestran Hoy y la vista de sala:
 *   - abiertas: status 'open' (las 'pending' aún no superan el dwell y no se
 *     muestran, igual que no se avisan por correo);
 *   - historial: las entradas `history` (aperturas y resoluciones) de todas
 *     las alertas, de la más reciente a la más antigua.
 *
 * No recalcula bandas ni lecturas: muestra lo que el servidor decidió.
 * Lógica pura (patrón UMD): sin React, red, DOM ni localStorage.
 */
(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const METRIC_LABELS = Object.freeze({
    temperature_c: 'Temperatura',
    rh_pct: 'Humedad relativa',
    co2_ppm: 'CO₂',
    substrate_temperature_c: 'Temperatura de sustrato',
  });

  const toMs = (value) => {
    if (value == null) return null;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  };

  const titleOf = (alert) => {
    if (!alert) return '';
    if (alert.kind === 'sensor_stale') return 'Sensor sin lecturas';
    const label = METRIC_LABELS[alert.metric] || alert.metric || 'Clima';
    return `${label} fuera de banda`;
  };

  const normalize = (raw) => {
    if (!raw || typeof raw !== 'object') return null;
    const roomId = String(raw.roomId || '').trim();
    if (!roomId) return null;
    return {
      id: String(raw.id || ''),
      roomId,
      kind: raw.kind || null,
      metric: raw.metric || null,
      status: raw.status || null,
      detail: raw.detail || '',
      title: titleOf(raw),
      openedAt: toMs(raw.openedAt),
      lastSeenAt: toMs(raw.lastSeenAt),
      resolvedAt: toMs(raw.resolvedAt),
      history: Array.isArray(raw.history) ? raw.history : [],
    };
  };

  /**
   * @param {Array<object>} docs documentos de climate_alerts (con id)
   * @param {{roomId?: string, historyLimit?: number}} [opts]
   * @returns {{open: Array, history: Array}}
   */
  const summarizeClimateAlerts = (docs, opts = {}) => {
    const roomId = opts.roomId || null;
    const historyLimit = Number.isFinite(opts.historyLimit) ? opts.historyLimit : 20;
    const alerts = (Array.isArray(docs) ? docs : []).map(normalize).filter(Boolean)
      .filter(a => !roomId || a.roomId === roomId);

    const open = alerts.filter(a => a.status === 'open')
      .sort((a, b) => (a.kind === 'sensor_stale' ? -1 : 0) - (b.kind === 'sensor_stale' ? -1 : 0)
        || (b.openedAt || 0) - (a.openedAt || 0));

    const history = [];
    for (const a of alerts) {
      for (const h of a.history) {
        const at = toMs(h && h.at);
        if (at == null || (h.type !== 'opened' && h.type !== 'resolved')) continue;
        history.push({ alertId: a.id, roomId: a.roomId, title: a.title, type: h.type, at, detail: h.detail || '' });
      }
    }
    history.sort((x, y) => y.at - x.at);
    return { open, history: history.slice(0, historyLimit) };
  };

  const api = { summarizeClimateAlerts, titleOf, METRIC_LABELS };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasClimateAlertsView = api;
})();
