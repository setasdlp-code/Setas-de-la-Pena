'use strict';

/** Pure policy and persistence boundary for the QR field quick actions. */
(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const globalRef = typeof globalThis !== 'undefined' ? globalThis : this;

  const ACTION_BY_EVENT = Object.freeze({
    observacion: 'inspection',
    riego: 'riego',
    contaminacion: 'contamination',
    cosecha_parcial: 'harvest',
  });

  const requiredAction = tipo => ACTION_BY_EVENT[tipo] || null;
  const isAllowed = (sheet, tipo) => {
    const action = requiredAction(tipo);
    return Boolean(action && sheet && Array.isArray(sheet.actions)
      && sheet.actions.some(candidate => candidate.action === action && !candidate.blockedBy));
  };

  /**
   * Persist only complete quick events. Harvest and contamination deliberately
   * return capture_required: their structured forms own canonical persistence.
   */
  const persistQuickEvent = async ({ tipo, lote, bag = null, nota = '', sheet, batchSheetApi, eventDb, event = null, awaitPersistence = true } = {}) => {
    if (!lote || !isAllowed(sheet, tipo)) throw new Error('qr_action_not_allowed');
    if (tipo === 'contaminacion' || tipo === 'cosecha_parcial') {
      return { status: 'capture_required', event: null };
    }
    if (!batchSheetApi || typeof batchSheetApi.buildCultivoEvento !== 'function') {
      throw new Error('batch_sheet_api_unavailable');
    }
    if (!eventDb || typeof eventDb.registrarEvento !== 'function') {
      throw new Error('eventos_cultivo_db_unavailable');
    }
    const operatorId = lote.operatorId || lote.operador || 'operario_local';
    const persistedEvent = event || batchSheetApi.buildCultivoEvento({
      batchId: lote.id, bagId: bag && bag.id, tipo, operatorId, nota,
    });
    const syncPromise = Promise.resolve().then(() => eventDb.registrarEvento(persistedEvent));
    if (!awaitPersistence) return { status: 'pending', event: persistedEvent, syncPromise };
    await syncPromise;
    return { status: 'persisted_local_or_server', event: persistedEvent };
  };

  const api = { ACTION_BY_EVENT, requiredAction, isAllowed, persistQuickEvent };
  if (isNode) module.exports = api;
  if (globalRef) globalRef.SetasFieldQrEvents = api;
})();
