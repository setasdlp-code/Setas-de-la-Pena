'use strict';

/**
 * @file live-telemetry-bridge.js — Puente único de telemetría en vivo para Setas OS.
 *
 * Antes de este archivo había tres medios canales sin nadie que los uniera:
 *   · `firebase/telemetria-sync.js` exportaba `subscribeToLiveClimate()` — escrito,
 *     probado y jamás invocado por la app.
 *   · El "Hub IoT" solo aceptaba un JSON pegado a mano en un <textarea>.
 *   · Las curvas del cockpit venían de `liveMonitor()` en el shell, que sintetiza
 *     senoides con una semilla del id de cámara. Bonitas, pero inventadas.
 *
 * Este módulo es el punto único por donde entra telemetría real, venga por donde
 * venga, y del que salen (a) muestras normalizadas, (b) series listas para pintar
 * curvas y (c) el estado de conexión.
 *
 * ── Transportes ──────────────────────────────────────────────────────────────
 * `websocket`  Frames JSON crudos del nodo/gateway ESP32. Latencia mínima.
 * `mqtt`       MQTT sobre WebSocket (mqtt.js / Paho). Topic `setas/<sala>/<nodo>/<metrica>`.
 * `firestore`  `onSnapshot` sobre `telemetria_salas` — sobrevive a NAT, firewalls
 *              y al celular del operario, y trae el último estado al abrir la app.
 *
 * Los transportes NO se turnan: se conectan todos a la vez y todos ingieren. El
 * deduplicado por identidad de lectura (sala+nodo+métrica+timestamp) hace que el
 * solapamiento sea inofensivo, y así el failover es emergente en vez de una
 * máquina de estados frágil — si el WebSocket muere, Firestore ya venía llenando
 * el mismo buffer y la curva no tiene un hueco. `activeSource` solo informa cuál
 * es el transporte fresco de mayor prioridad, para mostrarlo en la UI.
 *
 * ── Compensación por altitud ─────────────────────────────────────────────────
 * Los NDIR (SCD30, MH-Z19C, Senseair S8) miden absorción óptica, que depende de
 * la densidad molar del gas. A 2.600 msnm (Tenjo, ~745 hPa) un sensor sin
 * compensar subestima el CO₂ ~26 %: 700 ppm reales se leen como ~515 ppm. Toda
 * lectura de `co2_ppm` que no venga ya compensada por el firmware pasa por
 * `climate-math.calcBarometricCO2Correction()` ANTES de tocar buffers, umbrales
 * o UI — si se compensara más tarde, las alertas de CO₂ dispararían tarde y el
 * histórico quedaría en dos escalas distintas.
 *
 * Todo lo externo (sockets, timers, reloj) entra por inyección para que el
 * módulo se pruebe en Node sin abrir un solo socket.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const telemetryContract = isNode
    ? require('./telemetry-contract.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasTelemetry : null);

  const telemetryAdapter = isNode
    ? require('./esp32-telemetry-adapter.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasTelemetryAdapter : null);

  const climateMath = isNode
    ? require('./climate-math.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasClimate : null);

  // Tenjo, Cundinamarca — 2.600 msnm. Presión nominal usada cuando el nodo no
  // reporta barómetro propio. Ver TENJO_NOMINAL_PRESSURE_HPA en climate-math.
  const TENJO_ALTITUDE_M = 2600;
  const TENJO_PRESSURE_HPA = climateMath ? climateMath.TENJO_NOMINAL_PRESSURE_HPA : 745.0;

  const SERIES_METRICS = ['temperature_c', 'rh_pct', 'co2_ppm', 'substrate_temperature_c'];
  const DEFAULT_SERIES_CAPACITY = 288;   // 24 h a una muestra cada 5 min
  const DEFAULT_SERIES_WINDOW_MS = 24 * 60 * 60 * 1000;
  const DEFAULT_FRESH_MS = 90 * 1000;    // un transporte sin datos por más de esto deja de ser "fresco"
  const DEFAULT_BACKOFF_MS = 2000;
  const DEFAULT_MAX_BACKOFF_MS = 60000;
  const DEFAULT_STABLE_AFTER_MS = 60000; // una conexión que dura esto se considera sana

  const TRANSPORT_PRIORITY = { websocket: 0, mqtt: 1, firestore: 2, manual: 3 };

  const nowIso = (ms) => new Date(ms).toISOString();

  /**
   * Buffer circular de serie temporal. Guarda { t, v } y descarta por capacidad
   * y por ventana — una pestaña abierta una semana no debe crecer sin techo.
   */
  const createSeriesBuffer = ({ capacity = DEFAULT_SERIES_CAPACITY, windowMs = DEFAULT_SERIES_WINDOW_MS } = {}) => {
    let points = [];
    return {
      push(t, v) {
        if (!Number.isFinite(t) || !Number.isFinite(v)) return;
        // La telemetría puede llegar desordenada (Firestore reenvía un lote viejo
        // tras una reconexión). Se inserta en orden para que la curva no zigzaguee.
        if (points.length && t < points[points.length - 1].t) {
          const idx = points.findIndex((p) => p.t > t);
          if (idx === -1) points.push({ t, v }); else points.splice(idx, 0, { t, v });
        } else {
          points.push({ t, v });
        }
        const cutoff = t - windowMs;
        if (points.length > capacity || (points.length && points[0].t < cutoff)) {
          points = points.filter((p) => p.t >= cutoff).slice(-capacity);
        }
      },
      // ¿Ya existe una muestra en este instante exacto? Evita duplicados cuando
      // dos transportes entregan la misma lectura.
      has(t) { return points.some((p) => p.t === t); },
      values() { return points.map((p) => p.v); },
      points() { return points.map((p) => ({ t: p.t, v: p.v })); },
      last() { return points.length ? points[points.length - 1] : null; },
      size() { return points.length; },
      clear() { points = []; },
      /**
       * Reduce la serie a `buckets` promedios uniformes en el tiempo. Sin esto,
       * 288 puntos en un sparkline de 280 px pintan más ruido que señal.
       */
      downsample(buckets = 24) {
        if (points.length === 0) return [];
        if (points.length <= buckets) return points.map((p) => p.v);
        const first = points[0].t;
        const span = Math.max(1, points[points.length - 1].t - first);
        const acc = Array.from({ length: buckets }, () => ({ sum: 0, n: 0 }));
        points.forEach((p) => {
          const idx = Math.min(buckets - 1, Math.floor(((p.t - first) / span) * buckets));
          acc[idx].sum += p.v;
          acc[idx].n += 1;
        });
        // Los huecos se rellenan con el último valor conocido: una cámara sin
        // lecturas en un tramo no debe abrir un agujero en la polilínea.
        let lastKnown = points[0].v;
        return acc.map((b) => {
          if (b.n === 0) return lastKnown;
          lastKnown = b.sum / b.n;
          return lastKnown;
        });
      },
    };
  };

  /**
   * Compensación barométrica de CO₂ por altitud. Devuelve la lectura con el
   * valor corregido y la trazabilidad de la corrección (`co2_correction`), para
   * que la UI pueda mostrar el crudo si el operario duda del número.
   */
  const compensateCo2Reading = (reading, { pressureHpa = TENJO_PRESSURE_HPA, tempC = 18.0, altitudeM = TENJO_ALTITUDE_M } = {}) => {
    if (!reading || reading.metric !== 'co2_ppm' || !Number.isFinite(reading.value)) return reading;
    // El firmware pudo compensar ya (el SCD30 lo hace si se le pasa la presión
    // ambiente). Compensar dos veces inflaría el CO₂ un 36 % adicional.
    if (reading.co2_pressure_compensated === true || reading.source === 'esp32_sensor_compensated') return reading;
    if (!climateMath || typeof climateMath.calcBarometricCO2Correction !== 'function') return reading;

    const correction = climateMath.calcBarometricCO2Correction(reading.value, pressureHpa, tempC);
    return Object.assign({}, reading, {
      value: correction.correctedPpm,
      raw_value: correction.rawPpm,
      co2_pressure_compensated: true,
      co2_correction: {
        rawPpm: correction.rawPpm,
        correctedPpm: correction.correctedPpm,
        factor: correction.totalCorrectionFactor,
        baroFactor: correction.baroFactor,
        pressureHpa: correction.pressureHpa,
        tempC: correction.tempC,
        altitudeM,
        deltaPpm: correction.deltaPpm,
      },
    });
  };

  /**
   * Parseo de un mensaje MQTT al shape que entiende el adaptador ESP32.
   * Acepta topic `setas/<sala>/<nodo>/<metrica>` con payload numérico o JSON, y
   * también un payload JSON completo publicado en `setas/<sala>/<nodo>/state`.
   */
  const parseMqttMessage = (topic, payload) => {
    const parts = String(topic || '').split('/').filter(Boolean);
    if (parts.length < 3) return null;
    const [, roomId, deviceId, metricRaw] = parts;
    if (!roomId || !deviceId) return null;

    let body = payload;
    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { body = JSON.parse(trimmed); } catch (e) { body = trimmed; }
      } else {
        body = trimmed;
      }
    }

    // Payload agregado: { temperature_c, rh_pct, co2_ppm, ... }
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      return Object.assign({ room_id: roomId, device_id: deviceId }, body);
    }

    // Payload escalar sobre un topic por métrica.
    const value = Number(body);
    if (!metricRaw || !Number.isFinite(value)) return null;
    return { room_id: roomId, device_id: deviceId, [metricRaw]: value };
  };

  /**
   * Aplana el documento vivo de `telemetria_salas/{roomId}` (lo que escribe
   * `pushClimateReading`) al mismo shape plano del ESP32.
   */
  const parseFirestoreRoomDoc = (roomId, data = {}) => {
    if (!data || typeof data !== 'object') return null;
    const observedAt = data.timestamp_local
      || (data.created_at && typeof data.created_at.toDate === 'function' ? data.created_at.toDate().toISOString() : null)
      || (data.last_updated && typeof data.last_updated.toDate === 'function' ? data.last_updated.toDate().toISOString() : null);
    const packet = {
      room_id: data.room_id || roomId,
      device_id: data.device_id || `firestore-${roomId}`,
      observed_at: observedAt,
      source: 'firestore_snapshot',
    };
    if (data.temperature_c != null) packet.temperature_c = Number(data.temperature_c);
    if (data.rh_pct != null) packet.rh_pct = Number(data.rh_pct);
    if (data.co2_ppm != null) packet.co2_ppm = Number(data.co2_ppm);
    if (data.substrate_temperature_c != null) packet.substrate_temperature_c = Number(data.substrate_temperature_c);
    // Firestore guarda lo que ya se compensó al escribir; no recompensar.
    if (data.co2_pressure_compensated === true) packet.co2_pressure_compensated = true;
    const hasMetric = ['temperature_c', 'rh_pct', 'co2_ppm', 'substrate_temperature_c'].some((k) => packet[k] != null);
    return hasMetric ? packet : null;
  };

  /**
   * Crea el puente. Nada se conecta hasta llamar `start()`.
   *
   * @param {object} options
   * @param {Array}  [options.transports] [{ kind:'websocket'|'mqtt'|'firestore', url, topics, enabled, priority }]
   * @param {object} [options.factories] Fábricas inyectables { websocket(url,handlers), mqtt(cfg,handlers), firestore(handlers) }
   * @param {Array}  [options.cycles] RoomCycles activos, para asociar lecturas y evaluar bandas
   * @param {number} [options.pressureHpa] Presión barométrica local (default 745 hPa · Tenjo)
   * @param {Function} [options.onSample] (roomId, sample) cada vez que una sala tiene datos nuevos
   * @param {Function} [options.onReading] (reading) por cada lectura normalizada
   * @param {Function} [options.onStatus] (status) en cada cambio de conexión
   * @param {Function} [options.clock] Reloj inyectable
   * @param {Function} [options.setTimeoutFn] / [options.clearTimeoutFn] Timers inyectables
   */
  const createLiveTelemetryBridge = (options = {}) => {
    const clock = typeof options.clock === 'function' ? options.clock : Date.now;
    const setTimeoutFn = options.setTimeoutFn || (typeof setTimeout === 'function' ? setTimeout : null);
    const clearTimeoutFn = options.clearTimeoutFn || (typeof clearTimeout === 'function' ? clearTimeout : null);
    const factories = options.factories || {};
    const onSample = typeof options.onSample === 'function' ? options.onSample : null;
    const onReading = typeof options.onReading === 'function' ? options.onReading : null;
    const onStatus = typeof options.onStatus === 'function' ? options.onStatus : null;
    const freshMs = Number.isFinite(options.freshMs) ? options.freshMs : DEFAULT_FRESH_MS;
    const baseBackoffMs = Number.isFinite(options.backoffMs) ? options.backoffMs : DEFAULT_BACKOFF_MS;
    const maxBackoffMs = Number.isFinite(options.maxBackoffMs) ? options.maxBackoffMs : DEFAULT_MAX_BACKOFF_MS;
    const stableAfterMs = Number.isFinite(options.stableAfterMs) ? options.stableAfterMs : DEFAULT_STABLE_AFTER_MS;
    const seriesCapacity = Number.isFinite(options.seriesCapacity) ? options.seriesCapacity : DEFAULT_SERIES_CAPACITY;
    const seriesWindowMs = Number.isFinite(options.seriesWindowMs) ? options.seriesWindowMs : DEFAULT_SERIES_WINDOW_MS;
    let pressureHpa = Number.isFinite(options.pressureHpa) ? options.pressureHpa : TENJO_PRESSURE_HPA;
    let cycles = Array.isArray(options.cycles) ? options.cycles.slice() : [];

    const configured = (Array.isArray(options.transports) ? options.transports : [])
      .filter((t) => t && t.kind && t.enabled !== false)
      .map((t) => Object.assign({}, t, {
        priority: Number.isFinite(t.priority) ? t.priority : (TRANSPORT_PRIORITY[t.kind] != null ? TRANSPORT_PRIORITY[t.kind] : 9),
      }))
      .sort((a, b) => a.priority - b.priority);

    // Estado por transporte: conexión viva, intentos de reconexión, última entrega.
    const links = configured.map((cfg) => ({
      cfg,
      kind: cfg.kind,
      priority: cfg.priority,
      state: 'idle',        // idle | connecting | live | retrying | failed | stopped
      handle: null,
      attempts: 0,
      timer: null,
      lastDataAt: null,
      lastErrorAt: null,
      lastError: null,
      openedAt: null,
      framesIn: 0,
      readingsIn: 0,
    }));

    // Estado por sala: series por métrica, última muestra agregada y el registro
    // de identidades ya vistas (deduplicado entre transportes).
    const roomsState = new Map();
    let running = false;
    let statusRevision = 0;

    const roomEntry = (roomId) => {
      if (!roomsState.has(roomId)) {
        roomsState.set(roomId, {
          id: roomId,
          series: SERIES_METRICS.reduce((acc, m) => {
            acc[m] = createSeriesBuffer({ capacity: seriesCapacity, windowMs: seriesWindowMs });
            return acc;
          }, {}),
          latest: {},           // metric -> reading normalizada
          sample: {},           // shape plano para el motor de anomalías
          lastUpdateAt: null,
          sources: {},          // kind -> timestamp de última entrega
          seen: new Set(),      // ids de lectura ya ingeridas
        });
      }
      return roomsState.get(roomId);
    };

    const emitStatus = () => {
      if (!onStatus) return;
      try { onStatus(getStatus()); } catch (e) { /* la UI no debe tumbar el puente */ }
    };

    /**
     * Punto de entrada único de datos. Todo transporte (y el webhook manual del
     * Hub IoT) termina aquí.
     *
     * @param {object|Array} rawPacket Payload crudo, en cualquiera de los shapes que entiende el adaptador
     * @param {object} [meta] { source: 'websocket'|'mqtt'|'firestore'|'manual' }
     * @returns {Array} lecturas normalizadas efectivamente aceptadas
     */
    const ingest = (rawPacket, meta = {}) => {
      const source = meta.source || 'manual';
      const at = clock();
      if (!telemetryAdapter) return [];

      const adapted = telemetryAdapter.adaptESP32Payload(rawPacket, { cycles, now: nowIso(at) });
      if (!adapted.length) return [];

      const accepted = [];
      const touchedRooms = new Set();

      adapted.forEach((reading) => {
        if (!reading.room_id || !reading.metric) return;
        // El contrato ya marcó `quarantined` lo que está fuera de rango físico
        // (un SHT31 desconectado reporta -45 °C). No entra al buffer ni dispara
        // umbrales, pero sí queda registrado como incidencia de calidad.
        if (reading.quality === 'quarantined' || reading.quality === 'missing') {
          if (onReading) { try { onReading(Object.assign({}, reading, { ingest_source: source, rejected: true })); } catch (e) { /* noop */ } }
          return;
        }

        const entry = roomEntry(reading.room_id);
        const observedMs = reading.observed_at ? Date.parse(reading.observed_at) : at;
        const stamp = Number.isFinite(observedMs) ? observedMs : at;

        // Deduplicado entre transportes: la misma lectura puede llegar por el
        // WebSocket y, dos segundos después, por el snapshot de Firestore.
        // El device_id entra en la identidad porque dos nodos de la misma sala
        // publicando en el minuto exacto (ESPHome alinea sus envíos) colisionan
        // en `metric@stamp` y uno de los dos desaparecería del histórico.
        const identity = `${reading.device_id}:${reading.metric}@${stamp}`;
        if (entry.seen.has(identity)) return;
        entry.seen.add(identity);
        // El Set se poda por tamaño; no hace falta precisión histórica, solo
        // cubrir la ventana en la que dos transportes pueden solaparse.
        if (entry.seen.size > seriesCapacity * SERIES_METRICS.length * 2) {
          entry.seen = new Set(Array.from(entry.seen).slice(-seriesCapacity * SERIES_METRICS.length));
        }

        // Compensación por altitud ANTES de buffers y umbrales.
        const refTemp = Number.isFinite(entry.sample.temperature_c) ? entry.sample.temperature_c : 18.0;
        const finalReading = Object.assign(
          compensateCo2Reading(reading, { pressureHpa, tempC: refTemp }),
          { ingest_source: source, ingested_at: nowIso(at) }
        );

        if (entry.series[finalReading.metric]) entry.series[finalReading.metric].push(stamp, finalReading.value);
        entry.latest[finalReading.metric] = finalReading;
        entry.sample[finalReading.metric] = finalReading.value;
        entry.sample.observed_at = finalReading.observed_at;
        entry.lastUpdateAt = at;
        entry.sources[source] = at;

        accepted.push(finalReading);
        touchedRooms.add(finalReading.room_id);
        if (onReading) { try { onReading(finalReading); } catch (e) { /* noop */ } }
      });

      if (accepted.length && onSample) {
        touchedRooms.forEach((roomId) => {
          const entry = roomsState.get(roomId);
          try { onSample(roomId, Object.assign({}, entry.sample), entry); } catch (e) { /* noop */ }
        });
      }
      return accepted;
    };

    // ── Ciclo de vida de un transporte ────────────────────────────────────────
    const markLive = (link) => {
      link.state = 'live';
      link.openedAt = clock();
      link.lastError = null;
      emitStatus();
    };

    const markData = (link, count) => {
      link.framesIn += 1;
      link.readingsIn += count;
      link.lastDataAt = clock();
      // Datos recibidos = el enlace sirve de verdad. Solo aquí (y tras una
      // conexión que se sostuvo, ver onClose) se reinicia el backoff: un socket
      // que abre y cae en el mismo instante es un enlace que parpadea, y
      // reiniciarle el backoff al abrir lo convierte en un martillo contra el
      // gateway justo cuando el gateway ya está en problemas.
      link.attempts = 0;
      if (link.state !== 'live') markLive(link);
    };

    const scheduleReconnect = (link) => {
      if (!running || !setTimeoutFn) return;
      link.attempts += 1;
      link.state = 'retrying';
      // Backoff exponencial con jitter: sin el jitter, tres cámaras que pierden
      // el mismo router reconectan en el mismo milisegundo, para siempre.
      const delay = Math.min(maxBackoffMs, baseBackoffMs * Math.pow(2, Math.min(link.attempts - 1, 6)));
      const jittered = Math.round(delay * (0.75 + Math.random() * 0.5));
      link.timer = setTimeoutFn(() => { link.timer = null; connectLink(link); }, jittered);
      emitStatus();
    };

    const handlersFor = (link) => ({
      onOpen: () => markLive(link),
      onError: (err) => {
        link.lastError = err && err.message ? err.message : String(err || 'error');
        link.lastErrorAt = clock();
        emitStatus();
      },
      onClose: () => {
        if (!running) { link.state = 'stopped'; emitStatus(); return; }
        link.handle = null;
        // Una conexión que se sostuvo `stableAfterMs` cuenta como sana: su caída
        // empieza de nuevo desde el backoff mínimo en vez de heredar la escalada
        // de una racha de fallos vieja.
        if (link.openedAt != null && clock() - link.openedAt >= stableAfterMs) link.attempts = 0;
        link.openedAt = null;
        scheduleReconnect(link);
      },
      // WebSocket: un frame JSON (o un array de frames).
      onMessage: (raw) => {
        let payload = raw;
        if (typeof raw === 'string') {
          try { payload = JSON.parse(raw); } catch (e) { return; }
        }
        markData(link, ingest(payload, { source: link.kind }).length);
      },
      // MQTT: (topic, payload).
      onMqttMessage: (topic, payload) => {
        const packet = parseMqttMessage(topic, payload);
        if (!packet) return;
        markData(link, ingest(packet, { source: 'mqtt' }).length);
      },
      // Firestore: el mapa completo { [roomId]: doc } de `subscribeToLiveClimate`.
      onSnapshot: (roomsMap) => {
        const packets = Object.entries(roomsMap || {})
          .map(([roomId, data]) => parseFirestoreRoomDoc(roomId, data))
          .filter(Boolean);
        if (!packets.length) return;
        markData(link, ingest(packets, { source: 'firestore' }).length);
      },
    });

    const connectLink = (link) => {
      if (!running) return;
      const factory = factories[link.kind];
      if (typeof factory !== 'function') {
        link.state = 'failed';
        link.lastError = `sin fábrica para el transporte "${link.kind}"`;
        emitStatus();
        return;
      }
      link.state = 'connecting';
      emitStatus();
      try {
        link.handle = factory(link.cfg, handlersFor(link));
        // Una fábrica puede resolver sincrónicamente (tests, Firestore) sin
        // llamar onOpen; si devolvió un handle, el enlace ya está en pie.
        if (link.handle && link.state === 'connecting') markLive(link);
      } catch (err) {
        link.lastError = err && err.message ? err.message : String(err);
        link.lastErrorAt = clock();
        scheduleReconnect(link);
      }
    };

    const closeLink = (link) => {
      // `!= null` y no un truthy check: un id de timer puede ser 0 (lo es en la
      // primera reconexión con timers inyectados) y `if (link.timer)` dejaba ese
      // reintento vivo después de stop(), reconectando un puente ya detenido.
      if (link.timer != null && clearTimeoutFn) { clearTimeoutFn(link.timer); link.timer = null; }
      const handle = link.handle;
      link.handle = null;
      link.state = 'stopped';
      if (!handle) return;
      try {
        if (typeof handle === 'function') handle();
        else if (typeof handle.close === 'function') handle.close();
        else if (typeof handle.unsubscribe === 'function') handle.unsubscribe();
        else if (typeof handle.end === 'function') handle.end();
      } catch (e) { /* el transporte ya estaba muerto */ }
    };

    /**
     * Transporte autoritativo: el de mayor prioridad que entregó datos dentro de
     * la ventana de frescura. Es solo una etiqueta para la UI — todos los
     * transportes vivos siguen ingiriendo.
     */
    const activeSource = () => {
      const at = clock();
      const fresh = links
        .filter((l) => l.state === 'live' && l.lastDataAt != null && at - l.lastDataAt <= freshMs)
        .sort((a, b) => a.priority - b.priority);
      return fresh.length ? fresh[0].kind : null;
    };

    const getStatus = () => {
      const at = clock();
      const active = activeSource();
      return {
        running,
        revision: ++statusRevision,
        activeSource: active,
        // `degradado` = hay transportes configurados y alguno vivo, pero ninguno
        // entregó datos recientes. Distinto de `offline` (nada conectado): en
        // degradado la UI sigue mostrando la última curva conocida, atenuada.
        connectivity: !running ? 'detenido'
          : active ? 'en_vivo'
          : links.some((l) => l.state === 'live' || l.state === 'connecting') ? 'degradado'
          : 'offline',
        pressureHpa,
        altitudeM: TENJO_ALTITUDE_M,
        transports: links.map((l) => ({
          kind: l.kind,
          priority: l.priority,
          state: l.state,
          attempts: l.attempts,
          framesIn: l.framesIn,
          readingsIn: l.readingsIn,
          lastDataAt: l.lastDataAt,
          staleMs: l.lastDataAt != null ? at - l.lastDataAt : null,
          fresh: l.lastDataAt != null && at - l.lastDataAt <= freshMs,
          lastError: l.lastError,
        })),
        rooms: Array.from(roomsState.values()).map((r) => ({
          id: r.id,
          lastUpdateAt: r.lastUpdateAt,
          staleMs: r.lastUpdateAt != null ? at - r.lastUpdateAt : null,
          metrics: Object.keys(r.latest),
          sources: Object.keys(r.sources),
        })),
      };
    };

    /** Muestra agregada de una sala, lista para el motor de anomalías. */
    const getSample = (roomId) => {
      const entry = roomsState.get(roomId);
      if (!entry) return null;
      const at = clock();
      return Object.assign({}, entry.sample, {
        room_id: roomId,
        lastUpdateAt: entry.lastUpdateAt,
        ageMs: entry.lastUpdateAt != null ? at - entry.lastUpdateAt : null,
        sources: Object.keys(entry.sources),
        co2_correction: entry.latest.co2_ppm ? entry.latest.co2_ppm.co2_correction || null : null,
      });
    };

    /**
     * Curvas listas para pintar. Devuelve valores crudos, la versión reducida a
     * `buckets` y la polilínea SVG con los mismos parámetros que ya usa el
     * dashboard, para no duplicar la lógica de proyección.
     */
    const getSeries = (roomId, metric, { buckets = 24, width = 280, height = 56, padding = 0, yMin = null, yMax = null } = {}) => {
      const entry = roomsState.get(roomId);
      const buffer = entry && entry.series[metric];
      if (!buffer || buffer.size() === 0) return { values: [], points: [], polyline: '', last: null, count: 0 };
      const values = buffer.downsample(buckets);
      return {
        values,
        points: buffer.points(),
        polyline: climateMath ? climateMath.generateSvgPolyline(values, null, { width, height, padding, yMin, yMax }) : '',
        last: buffer.last(),
        count: buffer.size(),
      };
    };

    /** Instantánea completa para el render: métricas, series y frescura por sala. */
    const getSnapshot = ({ buckets = 24 } = {}) => {
      const at = clock();
      const rooms = {};
      roomsState.forEach((entry, roomId) => {
        rooms[roomId] = {
          id: roomId,
          sample: getSample(roomId),
          ageMs: entry.lastUpdateAt != null ? at - entry.lastUpdateAt : null,
          series: SERIES_METRICS.reduce((acc, m) => {
            acc[m] = entry.series[m].downsample(buckets);
            return acc;
          }, {}),
          latest: Object.assign({}, entry.latest),
        };
      });
      return { at, status: getStatus(), rooms };
    };

    const start = () => {
      if (running) return;
      running = true;
      links.forEach(connectLink);
      emitStatus();
    };

    const stop = () => {
      running = false;
      links.forEach(closeLink);
      emitStatus();
    };

    return {
      start,
      stop,
      ingest,
      getStatus,
      getSnapshot,
      getSample,
      getSeries,
      activeSource,
      isRunning: () => running,
      setCycles: (next) => { cycles = Array.isArray(next) ? next.slice() : []; },
      setPressureHpa: (hpa) => { if (Number.isFinite(hpa)) pressureHpa = hpa; },
      knownRooms: () => Array.from(roomsState.keys()),
      resetRoom: (roomId) => { roomsState.delete(roomId); },
      _links: links,
    };
  };

  // ── Fábricas reales de transporte (navegador) ───────────────────────────────
  // Se separan de `createLiveTelemetryBridge` para que el puente se pruebe con
  // fábricas falsas y la app use estas sin condicionales dentro del núcleo.

  const browserWebSocketFactory = (cfg, handlers) => {
    const WS = typeof WebSocket !== 'undefined' ? WebSocket : null;
    if (!WS) throw new Error('WebSocket no disponible en este entorno');
    const socket = new WS(cfg.url, cfg.protocols);
    socket.onopen = () => handlers.onOpen();
    socket.onerror = (e) => handlers.onError(e);
    socket.onclose = () => handlers.onClose();
    socket.onmessage = (event) => handlers.onMessage(event.data);
    return { close: () => socket.close() };
  };

  // mqtt.js expone `mqtt.connect()`; sobre WSS el broker debe publicar el
  // listener websocket (Mosquitto: `listener 9001` + `protocol websockets`).
  const browserMqttFactory = (cfg, handlers) => {
    const mqttLib = typeof globalThis !== 'undefined' ? globalThis.mqtt : null;
    if (!mqttLib || typeof mqttLib.connect !== 'function') throw new Error('mqtt.js no está cargado');
    const client = mqttLib.connect(cfg.url, Object.assign({ reconnectPeriod: 0 }, cfg.mqttOptions || {}));
    const topics = Array.isArray(cfg.topics) && cfg.topics.length ? cfg.topics : ['setas/+/+/#'];
    client.on('connect', () => { client.subscribe(topics, () => handlers.onOpen()); });
    client.on('message', (topic, payload) => handlers.onMqttMessage(topic, payload && payload.toString ? payload.toString() : payload));
    client.on('error', (err) => handlers.onError(err));
    client.on('close', () => handlers.onClose());
    return { close: () => client.end(true) };
  };

  // Firestore: se apoya en `subscribeToLiveClimate`, que existía en
  // firebase/telemetria-sync.js desde el primer día y que hasta ahora nadie
  // invocaba. Hay dos formas de llegar a él: `window.SetasFirebase` lo publica
  // ya curriado con la instancia de db (firma de 1 argumento), y el módulo
  // crudo la expone con firma (db, cb). Se aceptan ambas para no acoplar el
  // puente al orden en que se inicializa Firebase.
  const firestoreFactory = (cfg, handlers) => {
    const onSnap = (roomsMap) => handlers.onSnapshot(roomsMap);
    const g = typeof globalThis !== 'undefined' ? globalThis : {};
    let unsubscribe = null;

    if (typeof cfg.subscribe === 'function') {
      unsubscribe = cfg.subscribe(onSnap);
    } else if (g.SetasFirebase && typeof g.SetasFirebase.subscribeToLiveClimate === 'function') {
      unsubscribe = g.SetasFirebase.subscribeToLiveClimate(onSnap);
    } else {
      const sync = cfg.sync || g.SetasTelemetriaSync;
      const db = cfg.db || (g.SetasFirebase ? g.SetasFirebase.db : null);
      if (!sync || typeof sync.subscribeToLiveClimate !== 'function') throw new Error('telemetria-sync no está disponible');
      if (!db) throw new Error('Firestore no inicializado');
      unsubscribe = sync.subscribeToLiveClimate(db, onSnap);
    }

    handlers.onOpen();
    return { close: () => { try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (e) { /* noop */ } } };
  };

  const browserFactories = {
    websocket: browserWebSocketFactory,
    mqtt: browserMqttFactory,
    firestore: firestoreFactory,
  };

  const api = {
    createLiveTelemetryBridge,
    createSeriesBuffer,
    compensateCo2Reading,
    parseMqttMessage,
    parseFirestoreRoomDoc,
    browserFactories,
    browserWebSocketFactory,
    browserMqttFactory,
    firestoreFactory,
    SERIES_METRICS,
    TRANSPORT_PRIORITY,
    TENJO_ALTITUDE_M,
    TENJO_PRESSURE_HPA,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasLiveBridge = api;
})();
