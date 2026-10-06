'use strict';

/**
 * @file device-sync.js — Planificador de la sincronización entre dispositivos.
 *
 * Une las tres piezas puras de ADR-0009 con el almacenamiento de la app:
 *
 *   - sync-merge.js        fusión a tres bandas de documentos;
 *   - inventory-entries.js libro de asientos de Bodega;
 *   - sync-queue.js        cola de envíos (la misma que usa Bitácora).
 *
 * No toca localStorage ni la red: recibe una función `read(clave)` y devuelve
 * qué claves escribir y qué operaciones encolar. La app persiste las claves en
 * una sola escritura atómica (SetasPrototype.persist) y encola las
 * operaciones; así esta lógica se prueba en Node.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const dep = (name, file) => (isNode ? require(file) : globalThis[name]);
  const mergeApi = () => dep('SetasSyncMerge', './sync-merge.js');
  const entriesApi = () => dep('SetasInventoryEntries', './inventory-entries.js');
  const queueApi = () => dep('SetasSyncQueue', './sync-queue.js');

  const BASE_KEY = 'sdp_sync_base_v1';
  const LEDGER_KEY = 'sdp_inv_ledger';
  const LOTS_KEY = 'sdp_lotes';
  const LEDGER_COLLECTION = 'inventario_asientos';

  const RESERVATION_RANK = Object.freeze({ held: 0, expired: 1, released: 2, consumed: 3 });
  const CYCLE_STATE_RANK = Object.freeze({ planned: 0, active: 1, cancelled: 2, closed: 3 });

  // Colección de Firestore → clave local y reglas de fusión.
  const COLLECTIONS = Object.freeze({
    bitacora_lotes: { localKey: 'sdp_bit_lotes', resolvers: () => ({ lifecycleEvents: mergeApi().unionList }) },
    // La foto vive solo en el dispositivo que la tomó (no sube a Firestore).
    bitacora_bolsas: { localKey: 'sdp_bit_bolsas', ignore: ['foto'] },
    bitacora_cosechas: { localKey: 'sdp_bit_cosechas' },
    inventario_movimientos: { localKey: 'sdp_movimientos' },
    inventario_compras: { localKey: 'sdp_compras' },
    inventario_proveedores: { localKey: 'sdp_proveedores' },
    // Una reserva solo avanza: held → expired/released/consumed.
    inventario_reservas: { localKey: 'sdp_inv_reservas', resolvers: () => ({ status: mergeApi().byRank(RESERVATION_RANK) }) },
    // Ciclos de sala: un ciclo cerrado o cancelado no vuelve a activo.
    room_cycles: { localKey: 'sdp_room_cycles', resolvers: () => ({ state: mergeApi().byRank(CYCLE_STATE_RANK) }) },
  });

  const BODEGA_COLLECTIONS = Object.freeze(['inventario_movimientos', 'inventario_compras', 'inventario_proveedores', 'inventario_reservas']);
  // Colecciones cuyos cambios locales se envían entre lecturas del servidor.
  // Bitácora no está: sus escrituras ya se encolan una por una.
  const LOCAL_PASS_COLLECTIONS = Object.freeze([...BODEGA_COLLECTIONS, 'room_cycles']);
  const ALL_COLLECTIONS = Object.freeze([...Object.keys(COLLECTIONS), LEDGER_COLLECTION]);

  const specFor = collection => {
    const c = COLLECTIONS[collection];
    if (!c) return null;
    return { localKey: c.localKey, ignore: c.ignore || [], resolvers: c.resolvers ? c.resolvers() : {} };
  };

  /** ids con una operación ya en cola, por colección de Firestore. */
  const pendingDocIds = queue => {
    const out = {};
    const add = (c, id) => { if (id == null) return; (out[c] = out[c] || new Set()).add(String(id)); };
    for (const op of queue || []) {
      const a = op.args || [];
      switch (op.type) {
        case 'guardarLote': add('bitacora_lotes', a[0] && a[0].id); break;
        case 'actualizarLote': add('bitacora_lotes', a[0]); break;
        case 'guardarBolsas': (a[0] || []).forEach(b => add('bitacora_bolsas', b && b.id)); break;
        case 'actualizarBolsa': add('bitacora_bolsas', a[0]); break;
        case 'guardarCosecha': add('bitacora_cosechas', a[0] && a[0].id); break;
        case 'eliminarCosecha': add('bitacora_cosechas', a[0]); break;
        case 'eliminarLoteCascade':
          add('bitacora_lotes', a[0]);
          (a[1] || []).forEach(id => add('bitacora_bolsas', id));
          (a[2] || []).forEach(id => add('bitacora_cosechas', id));
          break;
        case 'crearDocumento':
        case 'actualizarDocumento':
        case 'eliminarDocumento': {
          const [c, id] = String(a[0] || '').split('/');
          add(c, id);
          break;
        }
        case 'crearAsientoInventario': add(LEDGER_COLLECTION, a[0] && a[0].id); break;
        default: break;
      }
    }
    return out;
  };

  /**
   * Traduce lo que decidió la fusión a operaciones de cola. Bitácora reutiliza
   * sus tipos y claves de siempre, para que una actualización nueva se fusione
   * con la que ya estaba en cola en vez de llegar después y pisarla.
   */
  const opsForPushes = (collection, pushes) => (pushes || []).map(p => {
    const id = p.id;
    const path = `${collection}/${id}`;
    if (collection === 'bitacora_lotes') {
      const key = 'lote:' + id;
      if (p.op === 'create') return { type: 'guardarLote', key, args: [p.doc] };
      if (p.op === 'update') return { type: 'actualizarLote', key, args: [id, p.fields] };
      return { type: 'eliminarLoteCascade', key, args: [id, [], []] };
    }
    if (collection === 'bitacora_bolsas') {
      const key = 'bolsa:' + id;
      if (p.op === 'create') return { type: 'guardarBolsas', key, args: [[p.doc]] };
      if (p.op === 'update') return { type: 'actualizarBolsa', key, args: [id, p.fields] };
      return { type: 'eliminarDocumento', key, args: [path] };
    }
    if (collection === 'bitacora_cosechas') {
      const key = 'cosecha:' + id;
      if (p.op === 'create') return { type: 'guardarCosecha', key, args: [p.doc] };
      if (p.op === 'update') return { type: 'actualizarDocumento', key, args: [path, p.fields] };
      return { type: 'eliminarCosecha', key, args: [id] };
    }
    const key = `${collection}:${id}`;
    if (p.op === 'create') return { type: 'crearDocumento', key, args: [path, p.doc] };
    if (p.op === 'update') return { type: 'actualizarDocumento', key, args: [path, p.fields] };
    return { type: 'eliminarDocumento', key, args: [path] };
  });

  const readBase = (read, collection) => (read(BASE_KEY) || [])
    .filter(r => r && r.collection === collection && r.doc)
    .map(r => r.doc);

  const writeBase = (read, collection, docs) => [
    ...(read(BASE_KEY) || []).filter(r => r && r.collection !== collection),
    ...docs.map(doc => ({ collection, id: doc.id, doc })),
  ];

  /**
   * Libro de Bodega: primero convierte en asientos lo que cambió en
   * `sdp_lotes` desde la última vez, después une lo que llegó del servidor y
   * proyecta la lista de lotes de nuevo.
   */
  const planLedger = ({ read, remote = null, pending, ctx }) => {
    const E = entriesApi();
    const ledger = read(LEDGER_KEY) || [];
    const lotes = read(LOTS_KEY) || [];
    const captured = E.captureChanges(ledger, lotes, ctx);
    const merged = E.mergeEntries([...ledger, ...captured], remote || []);
    const projected = E.project(merged);

    const entries = [];
    const { sameValue } = mergeApi();
    if (!sameValue(merged, ledger)) entries.push([LEDGER_KEY, merged]);
    // Solo se reescribe la lista de lotes si cambió de verdad (no por el orden
    // de las claves): cada reescritura dispara un render de Bodega.
    const byId = new Map(lotes.map(l => [String(l.id), l]));
    const lotsChanged = projected.length !== lotes.length
      || projected.some(p => !sameValue(p, byId.get(String(p.id))));
    if (lotsChanged) entries.push([LOTS_KEY, projected]);

    const remoteIds = remote ? new Set(remote.map(e => String(e.id))) : null;
    const pend = pending[LEDGER_COLLECTION] || new Set();
    // Sin lectura del servidor todavía, solo se envía lo capturado ahora; con
    // ella, todo asiento que el servidor no tenga.
    const toSend = remoteIds ? merged.filter(e => !remoteIds.has(e.id)) : captured;
    const ops = toSend.filter(e => !pend.has(e.id)).map(e => ({
      type: 'crearAsientoInventario', key: `${LEDGER_COLLECTION}:${e.id}`, args: [e],
    }));
    return { entries, ops, captured: captured.length, overdrawn: E.overdrawn(projected).map(l => l.id) };
  };

  /**
   * Fusiona una lectura del servidor.
   *
   * @param {object} p
   * @param {string}   p.collection  colección de Firestore
   * @param {object[]} p.docs        documentos leídos (lápidas incluidas)
   * @param {boolean}  p.fromCache
   * @param {Function} p.read        clave local → array
   * @param {object[]} p.queue       cola de sincronización actual
   * @param {object}   p.ctx         { deviceId, at, nonce } para el libro
   * @returns {{ entries: Array<[string, any[]]>, ops: object[], removed: string[], conflicts: object[], overdrawn?: string[] }}
   */
  const planSnapshot = ({ collection, docs = [], fromCache = false, read, queue = [], ctx }) => {
    const pending = pendingDocIds(queue);
    if (collection === LEDGER_COLLECTION) {
      const r = planLedger({ read, remote: docs, pending, ctx });
      return { entries: r.entries, ops: r.ops, removed: [], conflicts: [], overdrawn: r.overdrawn };
    }
    const spec = specFor(collection);
    if (!spec) throw new Error(`Colección no sincronizable: ${collection}`);
    const local = read(spec.localKey) || [];
    const base = readBase(read, collection);
    const res = mergeApi().mergeCollection({
      local, base, remote: docs, fromCache, pendingIds: pending[collection] || new Set(), spec,
    });
    const entries = [];
    if (res.changed) entries.push([spec.localKey, res.local]);
    if (!mergeApi().sameValue(res.base, base)) entries.push([BASE_KEY, writeBase(read, collection, res.base)]);
    return { entries, ops: opsForPushes(collection, res.pushes), removed: res.removed, conflicts: res.conflicts };
  };

  /**
   * Cambios hechos en este dispositivo entre dos lecturas del servidor. Para
   * los documentos de Bodega se usa la base como versión remota; solo se
   * llama para colecciones que ya tuvieron una lectura del servidor (`seen`),
   * o un dispositivo recién actualizado enviaría su copia completa como si
   * fuera nueva y pisaría la de los demás.
   */
  const planLocal = ({ read, queue = [], ctx, seen = [] }) => {
    const pending = pendingDocIds(queue);
    const ledger = planLedger({ read, remote: null, pending, ctx });
    const entries = [...ledger.entries];
    const ops = [...ledger.ops];
    for (const collection of LOCAL_PASS_COLLECTIONS) {
      if (!seen.includes(collection)) continue;
      const spec = specFor(collection);
      const local = read(spec.localKey) || [];
      const base = readBase(read, collection);
      const res = mergeApi().mergeCollection({
        local, base, remote: base, fromCache: true, pendingIds: pending[collection] || new Set(), spec,
      });
      ops.push(...opsForPushes(collection, res.pushes));
    }
    return { entries, ops, overdrawn: ledger.overdrawn };
  };

  /**
   * Encola sin lanzar: una cola llena deja el resto para la próxima pasada
   * (la fusión vuelve a encontrar lo que falta enviar).
   */
  const enqueueAll = (queue, ops, at) => {
    const Q = queueApi();
    let q = queue || [];
    let dropped = 0;
    ops.forEach((op, i) => {
      try {
        q = Q.enqueue(q, Q.createOperation({ ...op, at: at != null ? at + i : undefined }));
      } catch (err) {
        dropped += 1;
      }
    });
    return { queue: q, dropped };
  };

  /**
   * Texto corto para el operario sobre la lectura del servidor. Las lecturas
   * son en vivo: con red y sin error, lo que se ve es lo que hay.
   */
  const describeRemote = ({ status, online = true, lastServerAt = null, now = Date.now() } = {}) => {
    if (status === 'error') return 'Sin acceso al servidor · mostrando datos de este equipo';
    if (lastServerAt == null) return 'Sin lectura del servidor todavía';
    if (online !== false) return 'Al día con el servidor';
    const min = Math.max(0, Math.floor((now - lastServerAt) / 60000));
    if (min < 60) return `Sin conexión · última lectura hace ${min} min`;
    return `Sin conexión · última lectura hace ${Math.floor(min / 60)} h`;
  };

  const api = {
    BASE_KEY,
    LEDGER_KEY,
    LEDGER_COLLECTION,
    COLLECTIONS,
    BODEGA_COLLECTIONS,
    LOCAL_PASS_COLLECTIONS,
    ALL_COLLECTIONS,
    pendingDocIds,
    opsForPushes,
    planSnapshot,
    planLocal,
    enqueueAll,
    describeRemote,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasDeviceSync = api;
})();
