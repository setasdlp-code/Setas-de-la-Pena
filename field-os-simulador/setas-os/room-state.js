'use strict';

/**
 * @file room-state.js — La sala como objeto vivo en Setas OS.
 *
 * Hoy una sala es sólo un string (`lote.sala`) y una entrada estática de
 * configuración (ROOMS_CONFIG en simulador-app.jsx). Eso responde "¿cómo se
 * llama la sala?" pero no "¿qué hay dentro ahora mismo, en qué etapa, con
 * qué ambiente, y qué toca hacer con ella?". Este módulo deriva esa
 * respuesta a partir de los lotes, bolsas, eventos de sala y telemetría que
 * ya existen en la app — no introduce un nuevo objeto persistido, sólo una
 * proyección.
 *
 * Es lógica pura (mismo patrón UMD que task-engine.js / batch-sheet.js):
 * no persiste nada, no toca localStorage ni Firebase, no lee `window` salvo
 * por el envoltorio UMD, y se prueba con `node --test room-state.test.js`.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // Igual que en task-engine.js / batch-sheet.js: la dependencia se resuelve
  // en cada llamada, no al cargar el módulo, porque auth-gate.js carga los
  // scripts en listas de <script> cuyo orden entre listas no está garantizado.
  const batchSheetRef = () => (isNode ? require('./batch-sheet.js') : (glob && glob.SetasBatchSheet) || null);

  const HOUR_MS = 3600000;
  const DAY_MS = 86400000;

  const ROOM_STATUS = Object.freeze({
    empty: 'empty',
    occupied: 'occupied',
    needs_sanitation: 'needs_sanitation',
  });

  const ROOM_STATUS_LABELS = Object.freeze({
    empty: 'Vacía y lista',
    occupied: 'Ocupada',
    needs_sanitation: 'Vacía sin sanitizar',
  });

  const SANITATION_GRACE_HOURS = 24;
  const TELEMETRY_LIVE_MIN = 15;
  const TELEMETRY_STALE_MIN = 120;

  // Un lote en estado terminal ya no está físicamente en la sala: cerrarlo,
  // descartarlo o marcarlo fallido no deja bolsas dentro que sanitizar.
  const TERMINAL_LOTE_STATES = Object.freeze(['closed', 'discarded', 'failed']);

  // "Presente" = todavía físicamente en la sala. Una bolsa contaminada o
  // aislada sigue ahí hasta que alguien la descarta o se cosecha; sólo
  // descartada/cosechada implican que ya salió.
  const PRESENT_EXCLUDED_BAG_STATES = Object.freeze(['descartada', 'cosechada']);

  // "Activa" = además de presente, sana para efectos de ocupación operativa:
  // ni contaminada, ni aislada (bajo observación), ni ya retirada.
  const ACTIVE_EXCLUDED_BAG_STATES = Object.freeze(['contaminada', 'descartada', 'cosechada', 'aislada']);

  /** El estado del lote sale de lifecycleState; si falta, se normaliza vía batch-sheet.js. */
  const resolveLoteState = lote => {
    if (lote.lifecycleState) return lote.lifecycleState;
    const batchSheet = batchSheetRef();
    if (batchSheet && typeof batchSheet.normalizeLifecycleState === 'function') {
      return batchSheet.normalizeLifecycleState(lote.estado, 'inoculated');
    }
    return lote.lifecycleState || 'inoculated';
  };

  /** Reusa el vocabulario de etiquetas de batch-sheet.js; si no está cargado, muestra el código crudo. */
  const stateLabelFor = state => {
    const batchSheet = batchSheetRef();
    if (batchSheet && batchSheet.STATE_LABELS && batchSheet.STATE_LABELS[state]) {
      return batchSheet.STATE_LABELS[state];
    }
    return state;
  };

  const parseAt = value => {
    if (value == null) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  };

  /**
   * Días en la etapa actual del lote: se derivan del último evento de
   * transición *hacia ese estado* en `lote.lifecycleEvents`. Si el lote no
   * trae ese historial, o ninguna transición coincide, no se inventa un
   * número — se deja `null` para que la UI no muestre un dato falso.
   */
  const daysInStageFor = (lote, state, nowMs) => {
    const eventos = Array.isArray(lote.lifecycleEvents) ? lote.lifecycleEvents : null;
    if (!eventos) return null;
    const transiciones = eventos
      .filter(e => e && e.to === state && parseAt(e.at) != null)
      .map(e => parseAt(e.at));
    if (!transiciones.length) return null;
    const lastMs = Math.max(...transiciones);
    return Math.max(0, Math.floor((nowMs - lastMs) / DAY_MS));
  };

  const bagWord = n => (n === 1 ? 'bolsa aislada' : 'bolsas aisladas');

  const SEVERITY_RANK = Object.freeze({ critical: 0, warning: 1, info: 2 });

  const sortAlerts = alerts => alerts.slice().sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  /**
   * Congela recursivamente (un nivel de arreglos/objetos anidados es
   * suficiente aquí: la forma del contrato no tiene más profundidad que
   * batches[]/alerts[]/nextAction/environment).
   */
  const deepFreeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  };

  /**
   * Proyecta el estado vivo de UNA sala a partir de los lotes/bolsas/eventos
   * de toda la finca. No asume que `room` traiga más que `{ id, name }`: el
   * resto de ROOMS_CONFIG (tamaño, tipo de sensor, etc.) se ignora aquí.
   */
  const buildRoomState = ({ room, lotes = [], bolsas = [], events = [], telemetry = null, nowMs } = {}) => {
    if (!room || !room.id) throw new Error('room.id es requerido para proyectar el estado de una sala');
    if (typeof nowMs !== 'number' || !Number.isFinite(nowMs)) {
      throw new Error('nowMs es requerido (número, reloj inyectado) — buildRoomState no cae a Date.now()');
    }

    const roomId = room.id;
    const roomName = room.name || roomId;

    // Ocupación: lotes cuya ubicación (en cualquiera de sus tres alias
    // legados) apunta a esta sala, excluyendo los que ya terminaron su ciclo.
    const loteEntries = lotes
      .filter(l => (l.sala || l.ubicacion || l.roomId) === roomId)
      .map(l => ({ lote: l, state: resolveLoteState(l) }))
      .filter(({ state }) => !TERMINAL_LOTE_STATES.includes(state));

    let bagsPresentTotal = 0;
    let bagsActiveTotal = 0;
    let bagsIsolatedTotal = 0;
    const activeBagsByState = new Map(); // preserva orden de aparición para desempate de dominantStage

    const batches = loteEntries.map(({ lote, state }) => {
      const loteBolsas = bolsas.filter(b => b.loteId === lote.id);
      let bagsPresent;
      let bagsActive;
      let bagsIsolated;
      if (loteBolsas.length) {
        bagsPresent = loteBolsas.filter(b => !PRESENT_EXCLUDED_BAG_STATES.includes(b.estado)).length;
        bagsActive = loteBolsas.filter(b => !ACTIVE_EXCLUDED_BAG_STATES.includes(b.estado)).length;
        bagsIsolated = loteBolsas.filter(b => b.estado === 'aislada').length;
      } else {
        // Sin registro de bolsas individuales: se cae al conteo declarado del
        // lote (mismo patrón que batch-sheet.js), sin poder distinguir
        // presentes de activas ni detectar aisladas.
        const declared = parseInt(lote.numBolsas, 10) || 0;
        bagsPresent = declared;
        bagsActive = declared;
        bagsIsolated = 0;
      }

      bagsPresentTotal += bagsPresent;
      bagsActiveTotal += bagsActive;
      bagsIsolatedTotal += bagsIsolated;
      activeBagsByState.set(state, (activeBagsByState.get(state) || 0) + bagsActive);

      return {
        batchId: lote.id,
        code: lote.codigo || lote.id,
        state,
        stateLabel: stateLabelFor(state),
        bagsPresent,
        bagsActive,
        daysInStage: daysInStageFor(lote, state, nowMs),
      };
    });

    batches.sort((a, b) => {
      const da = a.daysInStage == null ? -Infinity : a.daysInStage;
      const db = b.daysInStage == null ? -Infinity : b.daysInStage;
      return db - da;
    });

    let dominantStage = null;
    let dominantCount = -1;
    activeBagsByState.forEach((count, state) => {
      if (count > dominantCount) {
        dominantCount = count;
        dominantStage = state;
      }
    });
    const dominantStageLabel = dominantStage ? stateLabelFor(dominantStage) : null;

    // Eventos de sala: pueden llegar desordenados (distintas fuentes los
    // registran); se ordenan aquí antes de buscar el último de cada tipo.
    const roomEvents = events
      .filter(e => e && e.roomId === roomId)
      .slice()
      .sort((a, b) => (parseAt(a.at) || 0) - (parseAt(b.at) || 0));

    const lastOfType = type => {
      const matches = roomEvents.filter(e => e.type === type && parseAt(e.at) != null);
      if (!matches.length) return null;
      return matches[matches.length - 1].at;
    };

    const lastSanitizedAtRaw = lastOfType('room_sanitized');
    const lastEmptiedAtRaw = lastOfType('room_emptied');
    const lastSanitizedMs = parseAt(lastSanitizedAtRaw);
    const lastEmptiedMs = parseAt(lastEmptiedAtRaw);

    const occupied = batches.length > 0;
    let status;
    if (occupied) {
      status = ROOM_STATUS.occupied;
    } else if (
      lastEmptiedMs != null &&
      (lastSanitizedMs == null || lastEmptiedMs > lastSanitizedMs) &&
      (nowMs - lastEmptiedMs) > SANITATION_GRACE_HOURS * HOUR_MS
    ) {
      status = ROOM_STATUS.needs_sanitation;
    } else {
      status = ROOM_STATUS.empty;
    }

    // Telemetría: `none` significa que NUNCA llegó una lectura, no que sea
    // vieja. Una lectura de hace seis horas se sigue mostrando, marcada como
    // vieja y con su edad: decirle al operario "sala sin lecturas" cuando el
    // nodo publicó esta mañana y murió después le esconde justo el dato que
    // necesita para saber que el nodo se cayó.
    const telemetryEntry = telemetry && telemetry[roomId];
    const lastUpdateMs = telemetryEntry ? parseAt(telemetryEntry.lastUpdateAt) : null;
    let environment = null;
    let environmentAgeMin = null;
    let environmentFreshness = 'none';
    if (telemetryEntry && telemetryEntry.latest && lastUpdateMs != null) {
      environment = telemetryEntry.latest;
      environmentAgeMin = Math.round((nowMs - lastUpdateMs) / 60000);
      environmentFreshness = environmentAgeMin <= TELEMETRY_LIVE_MIN ? 'live' : 'stale';
    }

    // Pasadas dos horas, los minutos dejan de decir nada: "hace 1.440 min" no
    // se lee, "hace 24 h" sí.
    const describeAge = min => (min > TELEMETRY_STALE_MIN
      ? `hace ${Math.floor(min / 60)} h`
      : `hace ${min} min`);

    const alerts = [];

    if (occupied && environmentFreshness === 'none') {
      alerts.push({ code: 'sin_telemetria', severity: 'warning', detail: 'Sala ocupada sin lecturas ambientales' });
    } else if (occupied && environmentFreshness === 'stale') {
      alerts.push({ code: 'telemetria_vieja', severity: 'warning', detail: `Última lectura ${describeAge(environmentAgeMin)}` });
    }

    let sanitationDetail = null;
    if (status === ROOM_STATUS.needs_sanitation) {
      const hoursVacia = Math.floor((nowMs - lastEmptiedMs) / HOUR_MS);
      sanitationDetail = `Sala vacía sin sanitizar desde hace ${hoursVacia} h`;
      alerts.push({ code: 'sin_sanitizar', severity: 'warning', detail: sanitationDetail });
    }

    let isolationDetail = null;
    if (bagsIsolatedTotal > 0) {
      isolationDetail = `${bagsIsolatedTotal} ${bagWord(bagsIsolatedTotal)} dentro de la sala`;
      alerts.push({ code: 'bolsas_aisladas', severity: 'critical', detail: isolationDetail });
    }

    const distinctStages = new Set(batches.map(b => b.state));
    if (distinctStages.size > 2) {
      const labels = [...distinctStages].map(stateLabelFor);
      alerts.push({ code: 'mezcla_de_etapas', severity: 'info', detail: `Mezcla de etapas: ${labels.join(', ')}` });
    }

    const sortedAlerts = sortAlerts(alerts);

    let nextAction = null;
    if (status === ROOM_STATUS.needs_sanitation) {
      nextAction = { action: 'sanitize_room', label: 'Sanitizar sala', reason: sanitationDetail };
    } else if (bagsIsolatedTotal > 0) {
      nextAction = { action: 'review_isolated', label: 'Revisar bolsas aisladas', reason: isolationDetail };
    } else if (occupied && (environmentFreshness === 'none' || environmentFreshness === 'stale')) {
      const sensorAlert = sortedAlerts.find(a => a.code === 'sin_telemetria' || a.code === 'telemetria_vieja');
      nextAction = { action: 'check_sensor_node', label: 'Revisar nodo de sensores', reason: sensorAlert ? sensorAlert.detail : null };
    } else if (status === ROOM_STATUS.empty) {
      nextAction = { action: 'assign_batch', label: 'Asignar lote', reason: 'Sala lista y sin ocupar' };
    }

    const result = {
      roomId,
      name: roomName,
      status,
      statusLabel: ROOM_STATUS_LABELS[status],
      batches,
      batchCount: batches.length,
      bagsPresent: bagsPresentTotal,
      bagsActive: bagsActiveTotal,
      bagsIsolated: bagsIsolatedTotal,
      dominantStage,
      dominantStageLabel,
      environment,
      environmentAgeMin,
      environmentFreshness,
      lastSanitizedAt: lastSanitizedMs != null ? new Date(lastSanitizedMs).toISOString() : null,
      lastEmptiedAt: lastEmptiedMs != null ? new Date(lastEmptiedMs).toISOString() : null,
      alerts: sortedAlerts,
      nextAction,
      generatedAt: new Date(nowMs).toISOString(),
    };

    return deepFreeze(result);
  };

  /**
   * Proyecta el tablero de todas las salas, ordenado para que lo primero que
   * vea el operario sea lo que más urge: salas con alerta crítica, luego con
   * advertencia, y dentro de cada grupo las más ocupadas primero.
   */
  const buildRoomBoard = ({ rooms = [], lotes = [], bolsas = [], events = [], telemetry = null, nowMs } = {}) => {
    const roomList = Array.isArray(rooms) ? rooms : Object.values(rooms || {});
    const states = roomList.map(room => buildRoomState({ room, lotes, bolsas, events, telemetry, nowMs }));

    const severityRank = state => {
      if (state.alerts.some(a => a.severity === 'critical')) return 0;
      if (state.alerts.some(a => a.severity === 'warning')) return 1;
      return 2;
    };

    return states.slice().sort((a, b) => {
      const ra = severityRank(a);
      const rb = severityRank(b);
      if (ra !== rb) return ra - rb;
      if (b.bagsActive !== a.bagsActive) return b.bagsActive - a.bagsActive;
      return a.name.localeCompare(b.name, 'es');
    });
  };

  const api = {
    ROOM_STATUS,
    ROOM_STATUS_LABELS,
    SANITATION_GRACE_HOURS,
    TELEMETRY_LIVE_MIN,
    TELEMETRY_STALE_MIN,
    buildRoomState,
    buildRoomBoard,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasRoomState = api;
})();
