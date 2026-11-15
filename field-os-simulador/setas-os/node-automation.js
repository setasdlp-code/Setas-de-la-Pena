'use strict';

/**
 * @file node-automation.js — Qué hace la automatización del nodo ESP32 de una
 * sala, SOLO LECTURA.
 *
 * Opción A (DEC-001): el control vive en el firmware del nodo y Setas OS solo
 * lee. Este módulo convierte el último `setas.node-status.v1` de cada nodo (el
 * contrato de telemetry-contract.js) en un modelo de vista que la ficha de sala
 * y la cola de Hoy pintan. No manda nada a un relé ni a un nodo, no calcula
 * consignas nuevas y no inventa estado:
 *
 *   - Una sala sin perfil en node-control-profiles.json es "sala sin
 *     automatización" (hoy Martha e incubación).
 *   - Una sala con perfil pero sin ningún estado recibido es "sin datos del
 *     nodo": nunca se muestra un relé apagado, una alarma limpia ni "en rango".
 *   - Los relés son el estado COMANDADO por el firmware (procedencia
 *     `reported`), no la medición del contacto.
 *   - La antigüedad del último estado se juzga con los umbrales de frescura que
 *     ya usa sensor-health.js (DEFAULT_FRESH_MS → obsoleto; DEFAULT_OFFLINE_MS →
 *     sin enlace). No hay un umbral propio.
 *   - La consigna que reporta el nodo se compara con la banda del ciclo de sala
 *     activo con room-node-setpoints.compareNodeSetpoints.
 *
 * PROFILES es una copia de lo que la interfaz necesita de
 * node-control-profiles.json (la fuente, que también lee el publicador y el
 * verificador de ESPHome); node-automation.test.js falla si difieren.
 *
 * Patrón UMD como el resto de módulos puros; los demás módulos se resuelven en
 * cada llamada para no depender del orden de carga.
 */
(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : {};
  const telemetryRef = () => (isNode ? require('./telemetry-contract.js') : glob.SetasTelemetry) || null;
  const healthRef = () => (isNode ? require('./sensor-health.js') : glob.SetasSensorHealth) || null;
  const setpointsRef = () => (isNode ? require('./room-node-setpoints.js') : glob.SetasRoomNodeSetpoints) || null;

  const MIN_MS = 60000;
  // El relé de calefacción en el contrato (mismo id que usa summarizeNodeStatus).
  const HEAT_RELAY_ID = 'heat';

  const PROFILES = Object.freeze({
    cloudlab_844: Object.freeze({
      roomId: 'cloudlab_844',
      label: 'CLOUDLAB 844',
      deviceId: 'setas-cloudlab-01',
      commissioned: false,
      status: 'BANCO DE PRUEBAS / NO COMISIONADO',
      heating: Object.freeze({ metric: 'temperature_c' }),
      relays: Object.freeze([
        Object.freeze({ id: 'light', label: 'Luz LED 12 V' }),
        Object.freeze({ id: 'circulation', label: 'Circulación GDSTIME' }),
        Object.freeze({ id: 'heat', label: 'Calefacción' }),
        Object.freeze({ id: 'spare', label: 'Reserva (sin carga)' }),
      ]),
      alarms: Object.freeze({
        sensor_invalid: 'Sensor de control inválido (NaN): calefacción OFF',
        over_temperature: 'Temperatura en o sobre el techo de la banda: calefacción OFF',
        heating_locked: 'Calefacción bloqueada tras alarma: rehabilitar a mano',
      }),
    }),
  });

  const CONTROL_STATE_LABELS = Object.freeze({
    starting: 'Arrancando: el firmware aún no habilita el control',
    auto: 'Automático',
    disabled: 'Calefacción deshabilitada',
    locked: 'Calefacción bloqueada tras alarma',
    alarm: 'En alarma',
  });

  const LINK_LABELS = Object.freeze({
    fresh: 'Al día',
    stale: 'Obsoleto',
    offline: 'Sin enlace',
    no_data: 'Sin datos del nodo',
    unknown: 'Antigüedad desconocida',
  });

  const NO_AUTOMATION_LABEL = 'Sala sin automatización';
  const NO_DATA_LABEL = 'Sin datos del nodo';

  const profileForRoom = roomId => (roomId && Object.hasOwn(PROFILES, roomId) ? PROFILES[roomId] : null);

  const resolveNow = now => (typeof now === 'function' ? now() : (now == null ? Date.now() : (now instanceof Date ? now.getTime() : Number(now))));

  const ageLabel = ms => {
    if (!Number.isFinite(ms)) return 'sin datos';
    if (ms < MIN_MS) return `hace ${Math.max(1, Math.round(ms / 1000))} s`;
    if (ms < 3600000) return `hace ${Math.round(ms / MIN_MS)} min`;
    if (ms < 86400000) return `hace ${Math.round(ms / 3600000)} h`;
    return `hace ${Math.round(ms / 86400000)} d`;
  };

  const durationLabel = ms => {
    if (!Number.isFinite(ms)) return 'tiempo desconocido';
    if (ms < 3600000) return `${Math.max(1, Math.round(ms / MIN_MS))} min`;
    const h = Math.floor(ms / 3600000);
    if (h < 24) return `${h} h`;
    const d = Math.floor(h / 24);
    return `${d} ${d === 1 ? 'día' : 'días'}`;
  };

  const num = n => String(Math.round(n * 1000) / 1000).replace('.', ',');

  /**
   * Antigüedad del último estado de un nodo con los umbrales de sensor-health.
   * @returns {{ state: 'fresh'|'stale'|'offline'|'no_data'|'unknown', ageMs: number|null, observedAt: string|null, label: string, freshMs: number|null, offlineMs: number|null }}
   */
  const evaluateNodeLink = (observedAt, { now, freshMs, offlineMs } = {}) => {
    const health = healthRef();
    const fresh = Number.isFinite(freshMs) ? freshMs : (health ? health.DEFAULT_FRESH_MS : null);
    const offline = Number.isFinite(offlineMs) ? offlineMs : (health ? health.DEFAULT_OFFLINE_MS : null);
    const at = observedAt ? Date.parse(observedAt) : NaN;
    const base = { freshMs: fresh, offlineMs: offline };
    if (!Number.isFinite(at)) return { ...base, state: 'no_data', ageMs: null, observedAt: null, label: LINK_LABELS.no_data };
    const nowMs = resolveNow(now);
    const ageMs = Number.isFinite(nowMs) ? Math.max(0, nowMs - at) : null;
    const iso = new Date(at).toISOString();
    // Sin umbrales de sensor-health no se declara frescura: no se inventa otro.
    if (ageMs == null || fresh == null || offline == null) return { ...base, state: 'unknown', ageMs, observedAt: iso, label: LINK_LABELS.unknown };
    const state = ageMs <= fresh ? 'fresh' : ageMs <= offline ? 'stale' : 'offline';
    return { ...base, state, ageMs, observedAt: iso, label: LINK_LABELS[state] };
  };

  // Qué hacer ante una discrepancia: el firmware se compila con las consignas
  // del ciclo (room-node-setpoints.buildNodeSubstitutions); Setas OS no las manda.
  const RECOMPILE_ACTION = 'Recompilar y volver a cargar el firmware del nodo con las consignas del ciclo activo.';

  /** "techo de temperatura: el nodo reporta 22 °C y el ciclo activo pide 24 °C; …" */
  const describeDifferences = comparison => (comparison && comparison.differences ? comparison.differences : [])
    .map(d => `${d.label}: el nodo reporta ${num(d.reported)} °C y el ciclo activo pide ${num(d.expected)} °C`)
    .join('; ');

  /**
   * Texto de la comparación de consigna. Una discrepancia siempre dice qué hacer:
   * recompilar el firmware.
   */
  const describeComparison = comparison => {
    if (!comparison) return null;
    if (comparison.state === 'match') {
      return 'La consigna del nodo coincide con la banda de temperatura del ciclo activo.';
    }
    if (comparison.state === 'mismatch') return `${describeDifferences(comparison)}. ${RECOMPILE_ACTION}`;
    if (comparison.state === 'no_cycle') return 'No hay un ciclo de sala activo con el que comparar la consigna del nodo.';
    if (comparison.state === 'no_band') return `El ciclo activo no tiene una banda de temperatura utilizable para comparar${comparison.reason ? ` (${comparison.reason})` : ''}.`;
    if (comparison.state === 'no_setpoints') return 'El nodo no reportó consigna de temperatura: no se puede comparar con el ciclo.';
    return null;
  };

  /**
   * Vista de un nodo a partir de su `node_status` crudo (como llega de Firestore).
   * @param {object} args
   * @param {string} args.roomId
   * @param {string} args.deviceId
   * @param {object} args.rawStatus      node_status tal como se guardó
   * @param {object} [args.profile]      perfil de la sala (por defecto el de roomId)
   * @param {string|null} [args.position]
   * @param {object[]} [args.cycles]     ciclos de sala
   * @param {number|Date|Function} [args.now]
   */
  const buildNodeView = ({ roomId, deviceId, rawStatus, profile = profileForRoom(roomId), position = null, cycles = [], now } = {}) => {
    const telemetry = telemetryRef();
    const nowMs = resolveNow(now);
    const base = { roomId, deviceId: deviceId || null, position, knownDevice: !!(profile && profile.deviceId === deviceId) };
    if (!telemetry || !profile) return { ...base, valid: false, errors: ['contrato de estado de nodo no disponible'], link: evaluateNodeLink(null, { now: nowMs }) };

    const errors = telemetry.validateNodeStatus(rawStatus, profile);
    const status = telemetry.normalizeNodeStatus(rawStatus);
    const link = evaluateNodeLink(status.observed_at, { now: nowMs });
    // Un estado que no cumple el contrato de la sala no se presenta como cierto.
    if (errors.length) return { ...base, valid: false, errors, link, observedAt: status.observed_at };

    const relays = profile.relays.map(r => ({
      id: r.id,
      label: r.label,
      on: typeof status.relays[r.id] === 'boolean' ? status.relays[r.id] : null,
    }));
    const alarms = status.alarms.map(code => ({ code, description: profile.alarms[code] || code }));
    const cmp = setpointsRef();
    const comparison = cmp
      ? cmp.compareNodeSetpoints({ setpoints: status.setpoints, roomId, cycles, now: nowMs })
      : null;
    return {
      ...base,
      valid: true,
      errors: [],
      link,
      observedAt: status.observed_at,
      commissioned: status.commissioned,
      controlState: status.control_state,
      controlStateLabel: CONTROL_STATE_LABELS[status.control_state] || status.control_state,
      heatingEnabled: status.heating_enabled,
      uptimeS: status.uptime_s,
      relays,
      heatCommanded: status.relays[HEAT_RELAY_ID] === true,
      alarms,
      setpoints: status.setpoints,
      comparison,
      comparisonText: describeComparison(comparison),
      provenance: 'reported',
    };
  };

  /**
   * Vista de la automatización de una sala.
   * @param {object} args
   * @param {string} args.roomId
   * @param {string} [args.roomName]
   * @param {Array<{device_id:string, position?:string|null, node_status:object}>} [args.statusRows] estados del documento de la sala
   * @param {object[]} [args.cycles]
   * @param {number|Date|Function} [args.now]
   * @returns {{ roomId, roomName, automation: 'none'|'profile', label: string|null, profile: object|null, nodes: object[], noData: boolean, noDataLabel: string|null }}
   */
  const buildRoomAutomation = ({ roomId, roomName = null, statusRows = [], cycles = [], now } = {}) => {
    const profile = profileForRoom(roomId);
    const name = roomName || (profile && profile.label) || roomId || null;
    if (!profile) {
      return { roomId, roomName: name, automation: 'none', label: NO_AUTOMATION_LABEL, profile: null, nodes: [], noData: false, noDataLabel: null };
    }
    const nowMs = resolveNow(now);
    const nodes = (statusRows || [])
      .filter(row => row && row.node_status && typeof row.node_status === 'object')
      .map(row => buildNodeView({ roomId, deviceId: row.device_id, rawStatus: row.node_status, profile, position: row.position || null, cycles, now: nowMs }))
      .sort((a, b) => Number(b.knownDevice) - Number(a.knownDevice) || String(a.deviceId).localeCompare(String(b.deviceId)));
    return {
      roomId,
      roomName: name,
      automation: 'profile',
      label: null,
      profile,
      nodes,
      noData: nodes.length === 0,
      noDataLabel: nodes.length === 0 ? NO_DATA_LABEL : null,
    };
  };

  const api = {
    PROFILES,
    CONTROL_STATE_LABELS,
    LINK_LABELS,
    NO_AUTOMATION_LABEL,
    NO_DATA_LABEL,
    HEAT_RELAY_ID,
    profileForRoom,
    evaluateNodeLink,
    RECOMPILE_ACTION,
    describeDifferences,
    describeComparison,
    buildNodeView,
    buildRoomAutomation,
    ageLabel,
    durationLabel,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasNodeAutomation = api;
})();
