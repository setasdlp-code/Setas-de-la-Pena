'use strict';

/**
 * @file bag-photo-store.js — Fotos de bolsas en IndexedDB.
 *
 * Las fotos vivían como data URL dentro de cada bolsa en localStorage
 * (`sdp_bit_bolsas`), compartiendo la cuota de ~5 MB con lotes, bolsas,
 * cosechas y la cola de sincronización: al llenarse, dejaban de guardarse los
 * registros de cultivo. Aquí viven aparte, por id de bolsa. Siguen siendo
 * locales al dispositivo (nunca suben a Firestore, igual que antes).
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const DB_NAME = 'setas-bag-photos';
  const DB_VERSION = 1;
  const STORE = 'photos';

  const isPhoto = v => typeof v === 'string' && v.startsWith('data:image/');

  /** Separa las fotos en línea: bolsas sin `foto` + mapa { bolsaId: dataUrl }. */
  const splitInlinePhotos = bolsas => {
    const inline = {};
    const stripped = (Array.isArray(bolsas) ? bolsas : []).map(b => {
      if (!b || !isPhoto(b.foto)) return b;
      const { foto, ...rest } = b;
      inline[b.id] = foto;
      return rest;
    });
    return { stripped, inline };
  };

  /** Reinyecta las fotos en las bolsas (para el respaldo descargable). */
  const withPhotos = (bolsas, photoMap) =>
    (Array.isArray(bolsas) ? bolsas : []).map(b =>
      b && photoMap && isPhoto(photoMap[b.id]) ? { ...b, foto: photoMap[b.id] } : b);

  const createStore = (options = {}) => {
    const idb = 'indexedDB' in options
      ? options.indexedDB
      : (typeof globalThis !== 'undefined' ? globalThis.indexedDB : undefined);
    const dbName = options.dbName || DB_NAME;
    const available = !!idb;

    const open = () => new Promise((resolve, reject) => {
      if (!available) { reject(new Error('bag_photo_store_unavailable')); return; }
      const req = idb.open(dbName, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('bag_photo_store_blocked'));
    });

    // Una transacción por operación: o se aplican todos los cambios o ninguno.
    const run = async (mode, work) => {
      const db = await open();
      try {
        return await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, mode);
          let result;
          tx.oncomplete = () => resolve(result);
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error || new Error('bag_photo_tx_aborted'));
          result = work(tx.objectStore(STORE));
        });
      } finally { db.close(); }
    };

    const putMany = async photoMap => {
      const entries = Object.entries(photoMap || {});
      if (entries.some(([id, v]) => !id || !isPhoto(v))) throw new Error('bag_photo_invalid');
      if (!entries.length) { if (!available) throw new Error('bag_photo_store_unavailable'); return; }
      await run('readwrite', store => { entries.forEach(([id, v]) => store.put(v, id)); });
    };

    const get = async id => {
      if (!available) return null;
      const box = await run('readonly', store => {
        const out = { value: null };
        const req = store.get(id);
        req.onsuccess = () => { out.value = req.result === undefined ? null : req.result; };
        return out;
      });
      return box.value;
    };

    const getAll = async () => {
      if (!available) return {};
      return run('readonly', store => {
        const out = {};
        const req = store.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) return;
          out[cursor.key] = cursor.value;
          cursor.continue();
        };
        return out;
      });
    };

    const removeMany = async ids => {
      if (!available || !ids || !ids.length) return;
      await run('readwrite', store => { ids.forEach(id => store.delete(id)); });
    };

    const clear = async () => {
      if (!available) return;
      await run('readwrite', store => { store.clear(); });
    };

    return { available, putMany, get, getAll, removeMany, clear };
  };

  const api = { DB_NAME, createStore, splitInlinePhotos, withPhotos, isPhoto };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasBagPhotos = api;
})();
