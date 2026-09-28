'use strict';

/**
 * @file sync-queue.js — Cola de sincronización de la Bitácora para Setas OS.
 *
 * Hoy cada escritura de la bitácora es fire-and-forget: se guarda en
 * localStorage, se lanza la llamada a Firestore (firebase/bitacora-sync.js) y,
 * si falla, el error queda en un booleano que nadie reintenta. En una sala sin
 * señal eso significa que el toque registrado se pierde para el servidor sin
 * que el operario se entere — y si sospecha que puede perderse, vuelve al
 * papel y no regresa.
 *
 * La regla que este módulo hace cumplir es: acción → se guarda localmente
 * primero → la interfaz confirma → se encola → se sincroniza cuando haya red.
 * El operario debe poder ver siempre "Sincronizado" o "N cambios pendientes",
 * nunca tener que preguntarse si un toque se perdió.
 *
 * Es lógica pura (mismo patrón UMD que batch-sheet.js / task-engine.js): no
 * toca React, ni red, ni DOM, ni localStorage. Sólo transforma estructuras de
 * datos — quien persiste la cola y quien llama a la red es la app.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // Los nombres deben coincidir EXACTAMENTE con las funciones exportadas por
  // firebase/bitacora-sync.js: es el contrato real de lo que se puede
  // encolar. Un tipo que no está aquí no tiene función que lo sincronice.
  const OP_TYPES = Object.freeze([
    'guardarLote',
    'actualizarLote',
    'guardarBolsas',
    'actualizarBolsa',
    'guardarCosecha',
    'eliminarCosecha',
    'eliminarLoteCascade',
  ]);

  // Cinco fallos no es falta de red intermitente, es un problema real que el
  // operario debe ver en vez de un reintento infinito silencioso.
  const MAX_ATTEMPTS = 5;

  // Tope duro de la cola: si algo se desincroniza mucho tiempo, es mejor
  // avisar ruidosamente que dejar crecer localStorage sin límite.
  const MAX_QUEUE = 500;

  const BACKOFF_CAP_MS = 300000; // 5 minutos

  // Se duplica aquí el saneado de foto que hace stripFoto en
  // firebase/bitacora-sync.js: este módulo es puro y no puede importar ese
  // archivo (que sí toca red/Firebase), pero una foto en base64 dentro de
  // args reventaría igual la cuota de localStorage donde se persiste la cola
  // — el motivo por el que stripFoto existe aplica también aquí, antes de
  // que el dato llegue a la red.
  const stripFoto = obj => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const { foto, ...rest } = obj;
    return rest;
  };

  const sanitizeArgs = args => (args || []).map(arg => stripFoto(arg));

  /**
   * Crea una operación de cola congelada. Valida el contrato: tipo conocido,
   * key no vacía (es lo que permite fusionar repeticiones sobre el mismo
   * objeto) y args como array. El id es determinista si no se pasa, para que
   * encolar la misma operación dos veces sea reconocible.
   */
  const createOperation = ({ type, key, args, at, id } = {}) => {
    if (!OP_TYPES.includes(type)) {
      throw new Error(`Tipo de operación desconocido: ${type}`);
    }
    if (!key) throw new Error('key es requerida para encolar una operación');
    if (!Array.isArray(args)) throw new Error('args debe ser un array');

    const atMs = at != null ? at : Date.now();
    const opId = id || `${type}:${key}:${atMs}`;

    return Object.freeze({
      id: opId,
      type,
      key,
      args: Object.freeze(sanitizeArgs(args)),
      at: atMs,
      attempts: 0,
      status: 'pending',
      nextAttemptAt: atMs,
      lastError: null,
    });
  };

  const isDeleteType = type => type === 'eliminarCosecha' || type === 'eliminarLoteCascade';
  const isUpdateType = type => type === 'actualizarLote' || type === 'actualizarBolsa';

  /**
   * Fusiona los campos de dos operaciones actualizarLote/actualizarBolsa
   * sobre la misma key: gana el valor más reciente por campo, pero la
   * operación resultante conserva la POSICIÓN de la primera para no alterar
   * el orden respecto a otras operaciones en la cola (FIFO por llegada).
   *
   * args tiene la forma [idObjeto, fields] en ambas funciones de
   * bitacora-sync.js: se conserva el idObjeto de la más antigua y se
   * combinan los `fields`.
   */
  const mergeUpdateOps = (existing, incoming) => {
    const existingFields = existing.args[1] || {};
    const incomingFields = incoming.args[1] || {};
    const mergedFields = { ...existingFields, ...incomingFields };
    return Object.freeze({
      ...existing,
      args: Object.freeze([existing.args[0], Object.freeze(mergedFields)]),
      at: incoming.at,
      // se re-arma desde 'pending': un cambio nuevo sobre la misma key
      // reemplaza cualquier reintento en curso de la versión anterior.
      attempts: 0,
      status: 'pending',
      nextAttemptAt: incoming.at,
      lastError: null,
    });
  };

  /**
   * Encola una operación sin mutar la cola existente. Reglas de negocio:
   *
   *   - FIFO por orden de llegada.
   *   - actualizarLote/actualizarBolsa repetidos sobre la misma key se
   *     fusionan (no duplican la cola) conservando la posición original.
   *   - un eliminar* sobre una key descarta lo anterior de esa key: no tiene
   *     sentido sincronizar cambios de algo que se va a borrar.
   *   - la cola llena lanza en vez de descartar en silencio: perder trabajo
   *     sin decirlo es justo lo que este módulo existe para evitar.
   */
  const enqueue = (queue, operation) => {
    const current = queue || [];

    if (isDeleteType(operation.type)) {
      const withoutKey = current.filter(op => op.key !== operation.key);
      if (withoutKey.length >= MAX_QUEUE) {
        throw new Error(`La cola de sincronización está llena (máximo ${MAX_QUEUE} operaciones)`);
      }
      return [...withoutKey, operation];
    }

    if (isUpdateType(operation.type)) {
      const idx = current.findIndex(op => op.type === operation.type && op.key === operation.key);
      if (idx !== -1) {
        const next = [...current];
        next[idx] = mergeUpdateOps(current[idx], operation);
        return next;
      }
    }

    if (current.length >= MAX_QUEUE) {
      throw new Error(`La cola de sincronización está llena (máximo ${MAX_QUEUE} operaciones)`);
    }
    return [...current, operation];
  };

  /** Primera operación pendiente lista para intentarse ahora, o null. */
  const nextPending = (queue, nowMs) => {
    const now = nowMs != null ? nowMs : Date.now();
    return (queue || []).find(op => op.status === 'pending' && op.nextAttemptAt <= now) || null;
  };

  /** Sincronizada = fuera de la cola. */
  const markSynced = (queue, id) => (queue || []).filter(op => op.id !== id);

  /**
   * Descarta de la cola cualquier operación cuya key esté en `keys`, sin
   * importar su tipo. Existe para el borrado en cascada de un lote: sus
   * bolsas y cosechas tienen sus propias keys ('bolsa:'+id, 'cosecha:'+id),
   * así que enqueue() con isDeleteType (que sólo descarta la key exacta del
   * borrado, 'lote:'+loteId) no las alcanza. Sin este purgado, una
   * actualizarBolsa/guardarCosecha pendiente de un lote ya borrado localmente
   * puede ejecutarse después de eliminarLoteCascade (o revivirse vía
   * retryStuck) y resucitar en Firestore un documento que ya no existe en la
   * app — huérfano que bitacora-sync.js nunca relee ni reconcilia.
   */
  const purgeKeys = (queue, keys) => {
    const keySet = new Set(keys || []);
    if (keySet.size === 0) return queue || [];
    return (queue || []).filter(op => !keySet.has(op.key));
  };

  /**
   * Registra un fallo con retroceso exponencial (tope 5 min). Al llegar a
   * MAX_ATTEMPTS la operación pasa a 'stuck' y deja de reintentarse sola:
   * fallar cinco veces no es falta de red, es algo que el operario debe ver.
   */
  const markFailed = (queue, id, error, nowMs) => {
    const now = nowMs != null ? nowMs : Date.now();
    const message = error && error.message ? error.message : String(error);
    return (queue || []).map(op => {
      if (op.id !== id) return op;
      const attempts = op.attempts + 1;
      const stuck = attempts >= MAX_ATTEMPTS;
      // El retroceso se calcula siempre con la misma fórmula, aunque quede
      // sin efecto cuando la operación pasa a 'stuck' (nextPending nunca la
      // devuelve por status, no por esta fecha).
      const nextAttemptAt = now + Math.min(Math.pow(2, attempts) * 1000, BACKOFF_CAP_MS);
      return Object.freeze({
        ...op,
        attempts,
        lastError: message,
        status: stuck ? 'stuck' : 'pending',
        nextAttemptAt,
      });
    });
  };

  /** Revive las operaciones 'stuck' a 'pending' con attempts=0 (botón manual). */
  const retryStuck = (queue, nowMs) => {
    const now = nowMs != null ? nowMs : Date.now();
    return (queue || []).map(op => (op.status === 'stuck'
      ? Object.freeze({ ...op, status: 'pending', attempts: 0, nextAttemptAt: now, lastError: op.lastError })
      : op));
  };

  const stats = (queue, nowMs) => {
    const now = nowMs != null ? nowMs : Date.now();
    const current = queue || [];
    const pendingOps = current.filter(op => op.status === 'pending');
    const stuckOps = current.filter(op => op.status === 'stuck');
    const oldestPendingAt = pendingOps.length
      ? pendingOps.reduce((min, op) => (op.at < min ? op.at : min), pendingOps[0].at)
      : null;
    return {
      pending: pendingOps.length,
      stuck: stuckOps.length,
      total: current.length,
      oldestPendingAt,
      oldestPendingAgeMs: oldestPendingAt != null ? now - oldestPendingAt : null,
    };
  };

  /** Texto corto para el operario: nunca debe preguntarse si algo se perdió. */
  const describeForOperator = ({ pending = 0, stuck = 0 } = {}) => {
    if (pending === 0 && stuck === 0) return 'Sincronizado';
    const pendingLabel = pending === 1 ? '1 cambio pendiente' : `${pending} cambios pendientes`;
    if (stuck === 0) return pendingLabel;
    const stuckLabel = stuck === 1 ? '1 sin sincronizar' : `${stuck} sin sincronizar`;
    return `${stuckLabel} · requiere revisión`;
  };

  const serialize = queue => JSON.stringify(queue || []);

  const isValidOperation = op => op
    && typeof op === 'object'
    && OP_TYPES.includes(op.type)
    && typeof op.key === 'string' && op.key.length > 0
    && Array.isArray(op.args)
    && typeof op.id === 'string'
    && typeof op.at === 'number'
    && typeof op.attempts === 'number'
    && (op.status === 'pending' || op.status === 'stuck')
    && typeof op.nextAttemptAt === 'number';

  /**
   * Una cola corrupta no puede impedir que la app arranque: si el JSON está
   * dañado devuelve [] en vez de lanzar, y descarta entradas con forma
   * inválida conservando las válidas.
   */
  const deserialize = raw => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidOperation);
  };

  const api = {
    OP_TYPES,
    MAX_ATTEMPTS,
    MAX_QUEUE,
    createOperation,
    enqueue,
    nextPending,
    markSynced,
    purgeKeys,
    markFailed,
    retryStuck,
    stats,
    describeForOperator,
    serialize,
    deserialize,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasSyncQueue = api;
})();
