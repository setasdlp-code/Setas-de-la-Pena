'use strict';

/**
 * @file climate-alerts.js — Alertas de clima fuera de la app.
 *
 * La app ya detecta sensor caído y clima fuera de banda, pero solo con la
 * pantalla abierta. Esta función corre en el servidor, compara la última
 * lectura de cada sala con ciclo activo contra las bandas de ESE ciclo y avisa
 * por correo.
 *
 * Qué compara y qué no:
 *   - Bandas: solo `targets[metric].min/max` del ciclo de sala activo
 *     (room-cycle.js). Son consignas que la granja eligió; aquí no se inventa
 *     ni se ajusta ningún valor de cultivo.
 *   - Lectura: el documento `telemetria_salas/{roomId}` (último estado).
 *   - CO₂: solo si la lectura trae `co2_pressure_compensated === true`. El
 *     puente en vivo corrige por altitud las lecturas NDIR sin esa marca; aquí
 *     no se replica esa corrección, así que una lectura sin compensar no se
 *     evalúa en vez de avisar con un valor que no es comparable con la banda.
 *
 * Para no avisar por un pico, un desvío debe verse en dos corridas seguidas
 * (`dwellMs`) antes de abrir la alerta. Una alerta abierta se recuerda cada
 * `remindMs` y se avisa una vez cuando se resuelve.
 *
 * Todo lo externo se inyecta (`db`, `notify`, `now`): la lógica se prueba sin
 * red ni credenciales.
 */

const ALERTS = 'climate_alerts';
const CYCLES = 'room_cycles';
const LIVE = 'telemetria_salas';

const MIN = 60 * 1000;
const DEFAULTS = Object.freeze({
  staleMs: 30 * MIN,      // sin lecturas por más de esto → sensor caído
  dwellMs: 10 * MIN,      // el desvío debe sostenerse esto antes de avisar
  remindMs: 6 * 60 * MIN, // recordatorio mientras la alerta siga abierta
});

const METRICS = Object.freeze({
  temperature_c: { label: 'Temperatura', unit: '°C' },
  rh_pct: { label: 'Humedad relativa', unit: '%' },
  co2_ppm: { label: 'CO₂', unit: 'ppm' },
  substrate_temperature_c: { label: 'Temperatura de sustrato', unit: '°C' },
});

const toMs = (value) => {
  if (value == null) return null;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
};

const finite = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const readingAtMs = (live) => (live ? (toMs(live.last_updated) ?? toMs(live.created_at) ?? toMs(live.timestamp_local)) : null);

const alertId = (roomId, kind) => `${roomId}__${kind}`.replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 180);

/**
 * Condiciones presentes AHORA en las salas con ciclo activo. Puro.
 * @returns {Array<{id, roomId, cycleId, kind, metric?, value?, band?, direction?, detail}>}
 */
const detectConditions = ({ cycles = [], liveByRoom = {}, nowMs, staleMs = DEFAULTS.staleMs }) => {
  const out = [];
  const seenRooms = new Set();
  for (const cycle of cycles) {
    if (!cycle || cycle.state !== 'active' || cycle.deleted === true || cycle.deletedAt) continue;
    const roomId = String(cycle.roomId || '').trim();
    // Dos ciclos activos en la misma sala serían bandas contradictorias: se
    // evalúa el primero y el resto se ignora, en vez de avisar dos veces.
    if (!roomId || seenRooms.has(roomId)) continue;
    seenRooms.add(roomId);

    const live = liveByRoom[roomId] || null;
    const atMs = readingAtMs(live);
    if (atMs == null || nowMs - atMs > staleMs) {
      out.push({
        id: alertId(roomId, 'sensor_stale'), roomId, cycleId: cycle.id || null, kind: 'sensor_stale',
        detail: atMs == null
          ? 'No hay ninguna lectura registrada para la sala.'
          : `Última lectura hace ${Math.round((nowMs - atMs) / MIN)} min.`,
      });
      continue; // una lectura vieja no se compara contra la banda
    }

    for (const [metric, meta] of Object.entries(METRICS)) {
      const band = cycle.targets && cycle.targets[metric];
      const value = finite(live[metric]);
      if (!band || value == null) continue;
      if (metric === 'co2_ppm' && live.co2_pressure_compensated !== true) continue;
      const min = finite(band.min);
      const max = finite(band.max);
      const direction = min != null && value < min ? 'low' : max != null && value > max ? 'high' : null;
      if (!direction) continue;
      out.push({
        id: alertId(roomId, `out_of_band_${metric}`), roomId, cycleId: cycle.id || null,
        kind: 'out_of_band', metric, value, direction, band: { min, max },
        detail: `${meta.label} ${direction === 'low' ? 'por debajo' : 'por encima'} de la banda del ciclo: `
          + `${value} ${meta.unit} (banda ${min ?? '—'}–${max ?? '—'} ${meta.unit}).`,
      });
    }
  }
  return out;
};

/**
 * Compara las condiciones presentes con las alertas guardadas y decide qué
 * escribir y qué avisar. Puro.
 */
const planAlerts = ({ conditions = [], stored = [], nowMs, dwellMs = DEFAULTS.dwellMs, remindMs = DEFAULTS.remindMs }) => {
  const byId = new Map(stored.map(a => [a.id, a]));
  const present = new Set();
  const writes = [];
  const notifications = [];

  for (const c of conditions) {
    present.add(c.id);
    const prev = byId.get(c.id);
    const base = { ...c, lastSeenAt: nowMs };
    if (!prev || prev.status === 'resolved') {
      writes.push({ ...base, status: 'pending', firstSeenAt: nowMs, openedAt: null, lastNotifiedAt: null });
    } else if (prev.status === 'pending') {
      if (nowMs - prev.firstSeenAt >= dwellMs) {
        const alert = { ...base, status: 'open', firstSeenAt: prev.firstSeenAt, openedAt: nowMs, lastNotifiedAt: nowMs };
        writes.push(alert);
        notifications.push({ type: 'opened', alert });
      } else {
        writes.push({ ...base, status: 'pending', firstSeenAt: prev.firstSeenAt, openedAt: null, lastNotifiedAt: null });
      }
    } else { // open
      const due = prev.lastNotifiedAt == null || nowMs - prev.lastNotifiedAt >= remindMs;
      const alert = { ...base, status: 'open', firstSeenAt: prev.firstSeenAt, openedAt: prev.openedAt, lastNotifiedAt: due ? nowMs : prev.lastNotifiedAt };
      writes.push(alert);
      if (due) notifications.push({ type: 'reminder', alert });
    }
  }

  for (const prev of stored) {
    if (present.has(prev.id) || prev.status === 'resolved') continue;
    const alert = { ...prev, status: 'resolved', resolvedAt: nowMs };
    writes.push(alert);
    // Un desvío que nunca llegó a abrirse se cierra en silencio.
    if (prev.status === 'open') notifications.push({ type: 'resolved', alert });
  }

  return { writes, notifications };
};

const TITLES = { opened: 'ALERTA', reminder: 'Sigue abierta', resolved: 'Resuelta' };

const formatMessage = (notifications) => {
  const lines = notifications.map(({ type, alert }) => {
    const what = alert.kind === 'sensor_stale' ? 'Sensor sin lecturas' : 'Clima fuera de banda';
    return `[${TITLES[type]}] Sala ${alert.roomId} — ${what}. ${alert.detail}`;
  });
  const opened = notifications.filter(n => n.type !== 'resolved').length;
  const rooms = [...new Set(notifications.map(n => n.alert.roomId))].join(', ');
  return {
    subject: opened > 0 ? `Setas OS: alerta de clima en ${rooms}` : `Setas OS: clima normalizado en ${rooms}`,
    text: `${lines.join('\n')}\n\nLas bandas son las del ciclo de sala activo en Setas OS. Este aviso no modifica nada en la sala.`,
  };
};

/**
 * @param {object} deps
 * @param {FirebaseFirestore.Firestore} deps.db
 * @param {(msg: {subject: string, text: string}) => Promise<void>} deps.notify
 * @param {() => number} [deps.now]
 * @param {object} [deps.options] staleMs / dwellMs / remindMs
 */
const createCheckClimateAlerts = ({ db, notify, now = Date.now, options = {} }) => async () => {
  const cfg = { ...DEFAULTS, ...options };
  const nowMs = now();
  const [cyclesSnap, liveSnap, alertsSnap] = await Promise.all([
    db.collection(CYCLES).where('state', '==', 'active').get(),
    db.collection(LIVE).get(),
    db.collection(ALERTS).get(),
  ]);
  const cycles = cyclesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const liveByRoom = Object.fromEntries(liveSnap.docs.map(d => [d.id, d.data()]));
  const stored = alertsSnap.docs.map(d => ({ ...d.data(), id: d.id }));

  const conditions = detectConditions({ cycles, liveByRoom, nowMs, staleMs: cfg.staleMs });
  const { writes, notifications } = planAlerts({ conditions, stored, nowMs, dwellMs: cfg.dwellMs, remindMs: cfg.remindMs });

  // Avisar antes de guardar: si el correo falla, no se guarda nada y la
  // próxima corrida reintenta desde el mismo estado. El orden inverso dejaría
  // una alerta marcada como avisada que nadie recibió.
  if (notifications.length) await notify(formatMessage(notifications));
  await Promise.all(writes.map(({ id, ...data }) => db.collection(ALERTS).doc(id).set(data)));

  return {
    salasEvaluadas: new Set(cycles.filter(c => c.state === 'active').map(c => c.roomId)).size,
    condiciones: conditions.length,
    avisos: notifications.map(n => `${n.type}:${n.alert.id}`),
  };
};

module.exports = { createCheckClimateAlerts, detectConditions, planAlerts, formatMessage, DEFAULTS, ALERTS };
