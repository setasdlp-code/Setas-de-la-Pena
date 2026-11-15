'use strict';

/**
 * @file today-exceptions.js — Excepciones de la Banda 1 de Hoy que no venían
 * del motor de umbrales de clima.
 *
 * El motor de anomalías (anomaly-thresholds.js) ya cubre clima fuera de banda,
 * deriva y sensor sin lecturas. Lo que quedaba sin superficie:
 *
 *   - sincronización: cambios atascados en la cola, sin acceso al servidor,
 *     cambios esperando red durante horas (ADR-0009);
 *   - Bodega: lotes con más consumo registrado que existencia (sobregiro);
 *   - sensores: lecturas físicamente imposibles que el contrato de telemetría
 *     pone en cuarentena y el puente descartaba sin avisar;
 *   - lotes: incubación más larga que la referencia;
 *   - nodos de control (solo lectura, setas.node-status.v1): alarma activa del
 *     nodo, nodo sin enlace, consigna del nodo distinta del ciclo de sala y sala
 *     fuera de banda con la calefacción comandada. Cada fila dice qué pasa, en
 *     qué objeto, por qué se muestra ahora y la siguiente acción. Nunca ofrece
 *     una acción de escritura hacia el nodo.
 *
 * La referencia de incubación declara de dónde sale (agronomic-claims):
 *   - "farm": historial de la granja — los días de colonización medidos
 *     (`diasCol`, promedio de col100 por bolsa) de otros lotes de la misma
 *     especie. Se usa con al menos MIN_FARM_LOTS lotes y el aviso aparece al
 *     superar el mayor valor observado: nunca se declara un umbral que la
 *     granja no midió.
 *   - "catalog": duración nominal del catálogo (flush-forecast-engine.js),
 *     una referencia heurística. El aviso es "superó la referencia", no
 *     "está atrasado".
 *   Una especie sin perfil propio no recibe referencia: no se usa la de otra.
 *
 * Lógica pura (patrón UMD): sin React, red, DOM ni localStorage.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;
  const flushRef = () => (isNode ? require('./flush-forecast-engine.js') : (glob && glob.SetasFlushForecast) || null);
  const bitacoraRef = () => (isNode ? require('./bitacora-model.js') : (glob && glob.SetasBitacora) || null);
  const batchSheetRef = () => (isNode ? require('./batch-sheet.js') : (glob && glob.SetasBatchSheet) || null);
  const anomalyRef = () => (isNode ? require('./anomaly-thresholds.js') : (glob && glob.SetasAnomaly) || null);
  const nodeAutomationRef = () => (isNode ? require('./node-automation.js') : (glob && glob.SetasNodeAutomation) || null);

  const HOUR_MS = 3600000;
  const DAY_MS = 86400000;

  // Umbrales operativos (no agronómicos): cuánto puede esperar un cambio sin
  // red, o el equipo sin leer el servidor, antes de pedir atención.
  const PENDING_WARN_MS = 2 * HOUR_MS;
  const OFFLINE_WARN_MS = 2 * HOUR_MS;
  // Ventana de lecturas en cuarentena que se informan.
  const QUARANTINE_WINDOW_MS = HOUR_MS;
  // Mínimo de lotes con colonización medida para usar el historial propio.
  const MIN_FARM_LOTS = 3;

  const SEVERITY_RANK = Object.freeze({ alarma: 0, vigilar: 1 });

  // Estados de incubación en el vocabulario canónico; el legado de
  // `lote.estado` se traduce con batch-sheet.normalizeLifecycleState, el mismo
  // que usa la ficha del lote.
  const INCUBATION_STATES = Object.freeze(['inoculated', 'incubation']);
  const lifecycleStateOf = lote => {
    const bs = batchSheetRef();
    const raw = lote.lifecycleState || lote.estado;
    if (bs && typeof bs.normalizeLifecycleState === 'function') return bs.normalizeLifecycleState(raw, null);
    return raw || null;
  };

  const METRIC_LABEL = Object.freeze({
    temperature_c: 'temperatura',
    rh_pct: 'humedad relativa',
    co2_ppm: 'CO₂',
    substrate_temperature_c: 'temperatura de sustrato',
  });

  const plural = (n, one, many) => (n === 1 ? one : many);
  const hoursLabel = ms => {
    const h = Math.floor(ms / HOUR_MS);
    if (h < 24) return `${h} h`;
    const d = Math.floor(h / 24);
    return `${d} ${plural(d, 'día', 'días')}`;
  };

  // flush-forecast-engine.normalizeSpeciesKey devuelve orellana gris para
  // cualquier especie que no conoce; aquí una especie desconocida no tiene
  // referencia, así que se resuelve solo con la tabla de alias.
  const canonicalSpecies = key => {
    if (!key || typeof key !== 'string') return null;
    const flush = flushRef();
    const clean = key.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-\s]+/g, '_');
    const aliases = (flush && flush.SPECIES_KEY_ALIASES) || {};
    if (aliases[clean]) return aliases[clean];
    return clean;
  };

  const speciesKeyOf = lote => (lote && (lote.sKey || lote.especie || lote.speciesId)) || null;

  // Misma convención que batch-sheet.js (daysBetween): una fecha sin hora es
  // medianoche UTC, así el día de incubación coincide con el de la ficha.
  const parseMs = v => {
    if (v == null || v === '') return null;
    const ms = typeof v === 'number' ? v : Date.parse(v);
    return Number.isFinite(ms) ? ms : null;
  };

  /**
   * Referencia de incubación para una especie.
   * @returns {null | { days:number, source:'farm'|'catalog', n?:number, label:string }}
   */
  const incubationReference = (speciesKey, { lotes = [], bolsas = [], excludeId = null } = {}) => {
    if (!speciesKey) return null;
    const bitacora = bitacoraRef();
    const flush = flushRef();
    const norm = canonicalSpecies;
    const target = norm(speciesKey);
    if (!target) return null;

    if (bitacora && typeof bitacora.calcLoteStats === 'function') {
      const measured = (lotes || [])
        .filter(l => l && l.id !== excludeId && norm(speciesKeyOf(l)) === target)
        .map(l => {
          try { return bitacora.calcLoteStats(l, (bolsas || []).filter(b => b.loteId === l.id), []).diasCol; } catch (e) { return null; }
        })
        .filter(d => Number.isFinite(d));
      if (measured.length >= MIN_FARM_LOTS) {
        const max = Math.max(...measured);
        return {
          days: Math.round(max * 10) / 10,
          source: 'farm',
          n: measured.length,
          label: `máximo medido en ${measured.length} lotes de la granja`,
        };
      }
    }

    const profiles = flush && flush.SPECIES_FLUSH_PROFILES;
    const profile = profiles && profiles[target];
    if (profile && Number.isFinite(profile.nominalIncubationDays)) {
      return {
        days: profile.nominalIncubationDays,
        source: 'catalog',
        label: 'referencia del catálogo, heurística: la granja aún no tiene historial propio',
      };
    }
    return null;
  };

  const syncExceptions = ({ syncStats, remoteSync, now }) => {
    const out = [];
    const s = syncStats || {};
    if ((s.stuck || 0) > 0) {
      out.push({
        id: 'sync:stuck',
        kind: 'sync',
        severity: 'alarma',
        title: `${s.stuck} ${plural(s.stuck, 'cambio sin sincronizar', 'cambios sin sincronizar')}`,
        detail: 'Fallaron varios intentos de envío. Los demás equipos no ven estos cambios hasta que se envíen.',
        action: { type: 'retrySync', label: 'Reintentar' },
      });
    }
    if ((s.pending || 0) > 0 && Number.isFinite(s.oldestPendingAgeMs) && s.oldestPendingAgeMs > PENDING_WARN_MS) {
      out.push({
        id: 'sync:pending',
        kind: 'sync',
        severity: 'vigilar',
        title: `${s.pending} ${plural(s.pending, 'cambio espera', 'cambios esperan')} conexión desde hace ${hoursLabel(s.oldestPendingAgeMs)}`,
        detail: 'Se enviarán solos cuando haya red. Hasta entonces los demás equipos no los ven.',
      });
    }
    const r = remoteSync || {};
    if (r.status === 'error') {
      out.push({
        id: 'sync:remote-error',
        kind: 'sync',
        severity: 'alarma',
        title: 'Sin acceso al servidor',
        detail: `Se muestran los datos de este equipo; pueden no ser los de los demás.${r.error ? ` (${r.error})` : ''}`,
      });
    } else if (r.online === false && Number.isFinite(r.lastServerAt) && now - r.lastServerAt > OFFLINE_WARN_MS) {
      out.push({
        id: 'sync:offline',
        kind: 'sync',
        severity: 'vigilar',
        title: `Sin conexión desde hace ${hoursLabel(now - r.lastServerAt)}`,
        detail: 'Lo que se ve es lo último que este equipo leyó del servidor.',
      });
    }
    return out;
  };

  const overdrawExceptions = ({ overdrawnLots }) => {
    const lots = (overdrawnLots || []).filter(l => l && (Number(l.sobregiroKg) || 0) > 0);
    if (!lots.length) return [];
    return [{
      id: 'bodega:overdraw',
      kind: 'bodega',
      severity: 'alarma',
      title: `Recuento necesario en ${lots.length} ${plural(lots.length, 'lote', 'lotes')} de Bodega`,
      detail: `Dos equipos descontaron los mismos kilos: ${lots.map(l => `${l.name || l.ingredienteId || l.id} (${(Number(l.sobregiroKg) || 0).toFixed(1)} kg de más)`).join(', ')}.`,
      action: { type: 'goBodega', label: 'Abrir Bodega' },
    }];
  };

  /**
   * @param {Array<{roomId, deviceId, metric, at:number, value, reasons?:string[]}>} rejected
   *   lecturas rechazadas por el contrato de telemetría
   */
  const quarantineExceptions = ({ rejected, now }) => {
    const groups = new Map();
    for (const r of rejected || []) {
      if (!r || !Number.isFinite(r.at) || now - r.at > QUARANTINE_WINDOW_MS) continue;
      const key = `${r.roomId || '?'}|${r.deviceId || '?'}|${r.metric || '?'}`;
      const g = groups.get(key) || { roomId: r.roomId, deviceId: r.deviceId, metric: r.metric, count: 0, last: null };
      g.count += 1;
      if (!g.last || r.at > g.last.at) g.last = r;
      groups.set(key, g);
    }
    return [...groups.values()].map(g => ({
      id: `sensor:quarantine:${g.roomId}:${g.deviceId}:${g.metric}`,
      kind: 'sensor',
      severity: 'alarma',
      title: `Sensor ${g.deviceId || 'sin id'} (${g.roomId || 'sala sin id'}): ${g.count} ${plural(g.count, 'lectura imposible', 'lecturas imposibles')} de ${METRIC_LABEL[g.metric] || g.metric}`,
      detail: `Valores fuera del rango físico del sensor en la última hora${g.last && g.last.value != null ? ` (último: ${g.last.value})` : ''}. No se usan para alertas de clima: revisar la conexión o la sonda.`,
      action: { type: 'goIoT', label: 'Ver sensores' },
    }));
  };

  const incubationExceptions = ({ lotes, bolsas, now }) => {
    const out = [];
    for (const lote of lotes || []) {
      if (!lote || !INCUBATION_STATES.includes(lifecycleStateOf(lote))) continue;
      const startMs = parseMs(lote.fechaInoculacion);
      if (startMs == null) continue;
      const days = Math.floor((now - startMs) / DAY_MS);
      const ref = incubationReference(speciesKeyOf(lote), { lotes, bolsas, excludeId: lote.id });
      if (!ref || days <= ref.days) continue;
      const loteBolsas = (bolsas || []).filter(b => b.loteId === lote.id && b.estado !== 'contaminada' && b.estado !== 'descartada');
      // Todas las bolsas vivas ya colonizadas: la incubación terminó aunque el
      // estado del lote no se haya avanzado.
      if (loteBolsas.length && loteBolsas.every(b => b.col100)) continue;
      out.push({
        id: `lote:incubation:${lote.id}`,
        kind: 'lote',
        severity: 'vigilar',
        title: `${lote.codigo || lote.id}: día ${days} de incubación`,
        detail: `Supera ${ref.days} días (${ref.label}). Revisar colonización y temperatura de sustrato.`,
        provenance: ref.source === 'farm'
          ? { class: 'farm-measured', n: ref.n, days: ref.days }
          : { class: 'literature-heuristic', days: ref.days },
        action: { type: 'openLote', loteId: lote.id, label: 'Abrir lote' },
      });
    }
    return out;
  };

  // ── Nodos de control (solo lectura) ─────────────────────────────────────────
  // Tiempo que una sala debe estar fuera de banda de temperatura, con la
  // calefacción comandada, para pedir atención. NO es un valor nuevo: es la
  // permanencia con la que anomaly-thresholds ya declara real un desvío de
  // temperatura (DEFAULT_DWELL_MS.temperature_c). Se mide desde que la sala salió
  // de banda (`since` de la alerta del motor), así que solo endurece la regla si
  // se configura un valor mayor. Si anomaly-thresholds no está disponible y no se
  // pasa `nodeOutOfBandMs`, la regla no se evalúa: no se inventa otro.
  const defaultNodeOutOfBandMs = () => {
    const a = anomalyRef();
    const v = a && a.DEFAULT_DWELL_MS && a.DEFAULT_DWELL_MS.temperature_c;
    return Number.isFinite(v) ? v : null;
  };

  const MIN_MS = 60000;
  const durationLabel = ms => {
    if (!Number.isFinite(ms)) return 'tiempo desconocido';
    if (ms < HOUR_MS) return `${Math.max(1, Math.round(ms / MIN_MS))} min`;
    return hoursLabel(ms);
  };
  const ageLabel = ms => (Number.isFinite(ms) ? `hace ${durationLabel(ms)}` : 'sin hora válida');

  const nodeRow = ({ id, severity, title, room, why, next, provenance = { class: 'reported' } }) => ({
    id,
    kind: 'nodo',
    severity,
    title,
    object: { type: 'room', id: room.roomId, name: room.roomName || room.roomId },
    why,
    next,
    detail: `${why} ${next}`,
    provenance,
    action: { type: 'openRoom', roomId: room.roomId, label: 'Abrir sala' },
  });

  /**
   * @param {object} args
   * @param {object[]} args.nodeRooms  salidas de node-automation.buildRoomAutomation
   * @param {object[]} [args.alerts]   alertas activas del motor de anomalías (liveTelemetry.alerts)
   * @param {number} args.now
   * @param {number} [args.nodeOutOfBandMs]
   */
  const nodeExceptions = ({ nodeRooms, alerts, now, nodeOutOfBandMs }) => {
    const out = [];
    const outOfBandMs = Number.isFinite(nodeOutOfBandMs) ? nodeOutOfBandMs : defaultNodeOutOfBandMs();
    const auto = nodeAutomationRef();
    for (const room of nodeRooms || []) {
      if (!room || room.automation !== 'profile') continue;
      const roomName = room.roomName || room.roomId;
      for (const node of room.nodes || []) {
        const link = node.link || {};
        const who = node.deviceId || 'sin id';
        if (link.state === 'offline') {
          const commissioned = node.valid && node.commissioned === true && room.profile && room.profile.commissioned === true;
          const lastAlarms = node.valid && node.alarms && node.alarms.length ? ` Última alarma reportada: ${node.alarms.map(a => a.code).join(', ')}.` : '';
          const bench = commissioned ? '' : ' Es un nodo de banco de pruebas, no comisionado.';
          out.push(nodeRow({
            id: `node:offline:${room.roomId}:${who}`,
            severity: commissioned ? 'alarma' : 'vigilar',
            title: `${roomName}: nodo ${who} sin enlace`,
            room,
            why: `Su último estado es ${ageLabel(link.ageMs)} (el umbral es ${durationLabel(link.offlineMs)} sin reportar).${lastAlarms}${bench}`,
            next: 'Revisar alimentación y WiFi del nodo. Sin enlace Setas OS no ve sus relés ni sus alarmas.',
          }));
          continue;
        }
        if (!node.valid) continue;
        if (node.alarms.length && (link.state === 'fresh' || link.state === 'stale')) {
          const n = node.alarms.length;
          out.push(nodeRow({
            id: `node:alarm:${room.roomId}:${who}`,
            severity: 'alarma',
            title: `${roomName}: ${n} ${plural(n, 'alarma activa', 'alarmas activas')} del nodo ${who}`,
            room,
            why: `${node.alarms.map(a => a.description).join('; ')}. Último estado ${ageLabel(link.ageMs)}${link.state === 'stale' ? ' (obsoleto)' : ''}.`,
            next: 'Abrir la sala y revisar la causa. Cualquier rehabilitación se hace a mano en el nodo: Setas OS solo lee.',
          }));
        }
        if (node.comparison && node.comparison.state === 'mismatch') {
          out.push(nodeRow({
            id: `node:setpoint:${room.roomId}:${who}`,
            severity: 'vigilar',
            title: `${roomName}: la consigna del nodo ${who} no coincide con el ciclo activo`,
            room,
            why: `${auto ? auto.describeDifferences(node.comparison) : 'La consigna difiere'}. Estado ${ageLabel(link.ageMs)}.`,
            next: auto ? auto.RECOMPILE_ACTION : 'Recompilar y volver a cargar el firmware del nodo con las consignas del ciclo activo.',
          }));
        }
      }

      // Fuera de banda con calefacción comandada: necesita un estado al día (no
      // se afirma "comandada" con un estado viejo) y la alerta de temperatura que
      // el motor de anomalías ya dispara con sus bandas efectivas.
      const heating = (room.nodes || []).find(n => n.valid && n.link && n.link.state === 'fresh' && n.heatCommanded);
      if (heating && Number.isFinite(outOfBandMs)) {
        const alert = (alerts || []).find(a => a && a.roomId === room.roomId && a.metric === 'temperature_c'
          && a.kind === 'band' && (a.status == null || a.status === 'activa')
          && Number.isFinite(a.since) && now - a.since >= outOfBandMs);
        if (alert) {
          const elapsed = now - alert.since;
          out.push(nodeRow({
            id: `node:oob-heat:${room.roomId}`,
            severity: 'alarma',
            title: `${roomName}: temperatura fuera de banda desde hace ${durationLabel(elapsed)} con la calefacción comandada`,
            room,
            why: `${alert.metricLabel || 'Temperatura'} ${alert.value} ${alert.unit || '°C'} ${alert.direction === 'low' ? 'por debajo de' : 'por encima de'} ${alert.limit} ${alert.unit || '°C'}, y el nodo ${heating.deviceId} reporta el relé de calefacción comandado (${ageLabel(heating.link.ageMs)}).`,
            next: 'Comprobar que la calefacción entregue calor y que el sensor esté bien ubicado: Setas OS ve el comando, no el contacto ni la potencia.',
            provenance: { class: 'reported+measured', outOfBandMs: elapsed, thresholdMs: outOfBandMs },
          }));
        }
      }
    }
    return out;
  };

  /**
   * Excepciones para la Banda 1 de Hoy, ordenadas por severidad.
   */
  const buildTodayExceptions = ({
    now = Date.now(),
    lotes = [],
    bolsas = [],
    syncStats = null,
    remoteSync = null,
    overdrawnLots = [],
    rejected = [],
    nodeRooms = [],
    alerts = [],
    nodeOutOfBandMs,
  } = {}) => [
    ...syncExceptions({ syncStats, remoteSync, now }),
    ...overdrawExceptions({ overdrawnLots }),
    ...quarantineExceptions({ rejected, now }),
    ...incubationExceptions({ lotes, bolsas, now }),
    ...nodeExceptions({ nodeRooms, alerts, now, nodeOutOfBandMs }),
  ].sort((a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9));

  /**
   * Qué avisar como notificación: solo alarmas que este equipo no avisó ya.
   * `notified` es el conjunto de ids avisados; se devuelve el nuevo conjunto
   * para que una alarma que se resuelve y vuelve se avise otra vez.
   */
  const notificationsToSend = (items, notified = new Set()) => {
    const current = (items || []).filter(i => i && (i.severity === 'alarma' || i.severity === 'critico'));
    const ids = new Set(current.map(i => i.id));
    return {
      send: current.filter(i => !notified.has(i.id)),
      notified: ids,
    };
  };

  const api = {
    PENDING_WARN_MS,
    OFFLINE_WARN_MS,
    QUARANTINE_WINDOW_MS,
    MIN_FARM_LOTS,
    defaultNodeOutOfBandMs,
    nodeExceptions,
    incubationReference,
    buildTodayExceptions,
    notificationsToSend,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasTodayExceptions = api;
})();
