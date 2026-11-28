'use strict';
/**
 * @file signout-guard.js — Qué pasa con los datos locales al cerrar sesión.
 *
 * Cerrar sesión dejaba todo en el dispositivo: la siguiente cuenta heredaba
 * las copias locales, la caché de Firestore y la cola de envíos, y los
 * sincronizaba a su propio nombre. La regla ahora es:
 *
 *   1. Si hay trabajo sin sincronizar (cola de Bitácora, consumos de Bodega,
 *      eventos de campo de esta cuenta, o una escritura local a medias), no se
 *      cierra la sesión: borrar ahí perdería cambios que el servidor no tiene.
 *   2. Si no lo hay, se borran SOLO las copias de lo que vive en Firestore
 *      (colecciones de device-sync, su base de fusión y el libro de Bodega) y
 *      la caché de Firestore. Al volver a entrar se descargan de nuevo.
 *
 * Lo que solo existe en este dispositivo no se toca: recetas guardadas
 * (setas_v6), tareas, eventos de sala, planes de experimento, linaje de
 * cultivos, el archivo de recuperación y las fotos de bolsas (IndexedDB).
 * Borrarlo lo perdería para siempre.
 *
 * Lógica pura (patrón UMD): no toca red, DOM ni Firebase. auth-gate.js la usa.
 */
(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  // Estados finales de una entrada de la cola de eventos de campo: confirmada
  // por el servidor, o decidida por él (rechazada) o por el operario.
  const FIELD_EVENT_TERMINAL = Object.freeze(['confirmed', 'rejected', 'cancelled']);

  const SYNC_QUEUE_KEY = 'sdp_sync_queue';
  const INVENTORY_OPS_KEY = 'sdp_inventory_ops';
  // Escritura local interrumpida de prototype-readiness.js: sin recuperar,
  // sus cambios todavía no llegaron ni a las colecciones locales.
  const PENDING_WRITE_KEY = 'sdp_pending_write_v1';
  // Inventario derivado del libro de asientos (device-sync recalcula sdp_lotes).
  const DERIVED_KEYS = Object.freeze(['sdp_lotes']);

  // Respaldo si device-sync.js no está cargado. signout-guard.test.js verifica
  // que coincida con lo que device-sync declara.
  const FALLBACK_SYNCED_KEYS = Object.freeze([
    'sdp_bit_lotes', 'sdp_bit_bolsas', 'sdp_bit_cosechas',
    'sdp_movimientos', 'sdp_compras', 'sdp_proveedores', 'sdp_inv_reservas',
    'sdp_room_cycles', 'sdp_production_readiness', 'sdp_autoclave_qualification_v1', 'sdp_thermal_mapping_v1',
    'sdp_sync_base_v1', 'sdp_inv_ledger', 'sdp_lotes',
  ]);

  const parseList = raw => {
    if (raw == null || raw === '') return [];
    let value;
    try { value = JSON.parse(raw); } catch (e) { return null; }
    return Array.isArray(value) ? value : null;
  };

  /**
   * Cuenta el trabajo local que el servidor todavía no tiene.
   * Una cola ilegible cuenta como pendiente: ante la duda no se borra nada.
   *
   * @param {object} p
   * @param {{getItem(k:string):string|null}} p.storage
   * @param {Array<{status?:string}>} [p.fieldEntries] entradas de la cola de
   *        eventos de campo de la cuenta actual (field-event-queue.js)
   */
  const pendingWork = ({ storage, fieldEntries = [] } = {}) => {
    const get = k => (storage && typeof storage.getItem === 'function' ? storage.getItem(k) : null);
    const sync = parseList(get(SYNC_QUEUE_KEY));
    const inventory = parseList(get(INVENTORY_OPS_KEY));
    const counts = {
      // sync-queue.js saca de la cola lo sincronizado: todo lo que queda
      // (pending o stuck) falta en el servidor.
      sync: sync === null ? 1 : sync.length,
      inventory: inventory === null ? 1 : inventory.filter(op => !op || op.status !== 'synced').length,
      fieldEvents: (Array.isArray(fieldEntries) ? fieldEntries : [])
        .filter(e => !e || !FIELD_EVENT_TERMINAL.includes(e.status)).length,
      interruptedWrite: get(PENDING_WRITE_KEY) ? 1 : 0,
      unreadableSync: sync === null,
      unreadableInventory: inventory === null,
    };
    counts.total = counts.sync + counts.inventory + counts.fieldEvents + counts.interruptedWrite;
    return counts;
  };

  /** Mensaje para el operario cuando no se puede cerrar sesión todavía. */
  const describeBlocked = (counts) => {
    if (!counts || !counts.total) return null;
    const parts = [];
    if (counts.unreadableSync) parts.push('una cola de Bitácora ilegible');
    else if (counts.sync) parts.push(counts.sync === 1 ? '1 cambio de Bitácora' : `${counts.sync} cambios de Bitácora`);
    if (counts.unreadableInventory) parts.push('una cola de Bodega ilegible');
    else if (counts.inventory) parts.push(counts.inventory === 1 ? '1 consumo de Bodega' : `${counts.inventory} consumos de Bodega`);
    if (counts.fieldEvents) parts.push(counts.fieldEvents === 1 ? '1 evento de campo' : `${counts.fieldEvents} eventos de campo`);
    if (counts.interruptedWrite) parts.push('un guardado local interrumpido');
    return `No se puede cerrar sesión todavía: hay ${parts.join(', ')} sin sincronizar. `
      + 'Conecta el equipo a internet y espera a que diga "Sincronizado", '
      + 'o revisa los cambios atascados antes de cerrar sesión.';
  };

  /**
   * Claves locales que son copia de Firestore, según device-sync.js.
   * @param {object} [deviceSync] window.SetasDeviceSync
   */
  const syncedLocalKeys = (deviceSync) => {
    if (!deviceSync || !deviceSync.COLLECTIONS) return [...FALLBACK_SYNCED_KEYS];
    const keys = Object.values(deviceSync.COLLECTIONS).map(c => c && c.localKey).filter(Boolean);
    if (deviceSync.BASE_KEY) keys.push(deviceSync.BASE_KEY);
    if (deviceSync.LEDGER_KEY) keys.push(deviceSync.LEDGER_KEY);
    keys.push(...DERIVED_KEYS);
    return [...new Set(keys)];
  };

  /**
   * Borra las copias sincronizadas y las colas (ya vacías: pendingWork lo exige).
   * Devuelve las claves borradas.
   */
  const clearSyncedLocal = (storage, keys) => {
    const toRemove = [...new Set([...(keys || []), SYNC_QUEUE_KEY, INVENTORY_OPS_KEY])];
    const removed = [];
    for (const key of toRemove) {
      if (storage.getItem(key) === null) continue;
      storage.removeItem(key);
      removed.push(key);
    }
    return removed;
  };

  const api = {
    FIELD_EVENT_TERMINAL,
    FALLBACK_SYNCED_KEYS,
    pendingWork,
    describeBlocked,
    syncedLocalKeys,
    clearSyncedLocal,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasSignoutGuard = api;
})();
