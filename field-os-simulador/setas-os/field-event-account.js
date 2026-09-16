'use strict';

/**
 * @file field-event-account.js — Ciclo de vida del cuaderno de campo frente a
 * los cambios de sesión.
 *
 * Cerrar sesión no es descartar trabajo. Un operario que pierde la señal en el
 * campo y cierra la aplicación debe encontrar sus eventos intactos al volver:
 * lo único que termina es el envío, nunca el registro.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const queue = isNode ? require('./field-event-queue.js') : globalThis.SetasFieldEventQueue;

  const RESUMABLE = new Set(['pending', 'retry_wait']);

  const putEntry = (db, entry) => new Promise((resolve, reject) => {
    const tx = db.transaction('queue_entries', 'readwrite');
    tx.objectStore('queue_entries').put(entry);
    tx.onabort = () => reject(tx.error || new Error('transaction_aborted: putEntry'));
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });

  /**
   * Rearma los eventos de una cuenta tras volver a entrar.
   * Un `retry_wait` cuya espera venció al estar la sesión cerrada vuelve a
   * `pending`, para que el primer ciclo lo tome sin esperar otro backoff.
   */
  const recoverAccount = async (db, accountId, now = Date.now) => {
    const all = await queue.recoverEventsByAccount(db, accountId);
    const resumable = all.filter(({ queueEntry }) => RESUMABLE.has(queueEntry.status));

    for (const { queueEntry } of resumable) {
      if (queueEntry.status === 'retry_wait' && (queueEntry.nextAttemptAt || 0) <= now()) {
        await putEntry(db, { ...queueEntry, status: 'pending' });
      }
    }
    return resumable;
  };

  /**
   * @param {object} deps
   * @param {IDBDatabase} deps.db
   * @param {(accountId: string) => object} deps.createEngine
   */
  const createAccountSession = ({ db, createEngine, now = Date.now }) => {
    let currentAccountId = null;
    let engine = null;

    return {
      current: () => currentAccountId,
      engine: () => engine,

      /**
       * @param {string|null} nextAccountId  null = cierre de sesión
       */
      async switchTo(nextAccountId) {
        // Detener y esperar lo que esté en vuelo. Una respuesta que llegue
        // después se reconcilia contra la cuenta que la originó, porque el
        // motor que la envió lleva su accountId dentro.
        if (engine) await engine.stop();
        engine = null;

        currentAccountId = nextAccountId;
        if (!nextAccountId) return { accountId: null, recovered: [] };

        const recovered = await recoverAccount(db, nextAccountId, now);
        engine = createEngine(nextAccountId);
        return { accountId: nextAccountId, recovered };
      },
    };
  };

  const api = { createAccountSession, recoverAccount, RESUMABLE };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldEventAccount = api;
})();
