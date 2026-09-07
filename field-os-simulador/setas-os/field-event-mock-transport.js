'use strict';

/**
 * @file field-event-mock-transport.js — Servidor de aceptación simulado.
 *
 * Permite ejercitar el ciclo completo del cuaderno de campo (guardado local →
 * envío → confirmación, y también el conflicto) sin desplegar la Cloud
 * Function, que exige el plan Blaze.
 *
 * Reproduce el mismo contrato que functions/accept-field-event.js: un id ya
 * aceptado devuelve su recibo original en vez de volver a avanzar el lote, y
 * una revisión desfasada produce revision_conflict. Si se comportara de forma
 * más indulgente que el servidor real, el prototipo enseñaría un flujo que
 * después falla en producción.
 *
 * Todo recibo que emite lleva `simulated: true`. La interfaz debe distinguirlo:
 * el sentido de este cuaderno es que "confirmado" signifique que el servidor lo
 * tiene, y un simulacro que se presente como confirmación real destruye
 * exactamente la garantía que la función existe para dar.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const getContracts = () => (isNode
    ? require('./field-event-contracts.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasFieldEventContracts : null));

  const STORAGE_KEY = 'setas.field.mock-server.v1';

  const memoryStore = () => {
    let value = null;
    return { getItem: () => value, setItem: (_k, v) => { value = v; } };
  };

  const defaultStorage = () => {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
    } catch (e) { /* acceso denegado (modo privado): se cae a memoria */ }
    return memoryStore();
  };

  const load = (storage) => {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        accepted: (parsed && parsed.accepted) || {},
        revisions: (parsed && parsed.revisions) || {},
      };
    } catch (e) {
      return { accepted: {}, revisions: {} };
    }
  };

  const save = (storage, state) => {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* cuota o modo privado */ }
  };

  const fail = (code) => Object.assign(new Error(code), { code });

  /**
   * @param {object} [opts]
   * @param {Storage} [opts.storage]  inyectable para pruebas
   * @param {() => string} [opts.now] reloj inyectable
   * @returns {{transport: Function, reset: Function, stateOf: Function}}
   */
  const createMockTransport = ({ storage = defaultStorage(), now = () => new Date().toISOString() } = {}) => {
    const transport = async (envelope) => {
      const contracts = getContracts();
      const { event } = envelope || {};
      if (!event || !event.id || !event.batchId) throw fail('invalid_envelope');
      if (!Array.isArray(event.attachmentIds) || event.attachmentIds.length !== 0) {
        throw fail('invalid_envelope');
      }

      const state = load(storage);

      // Reenvío del mismo evento: devuelve el recibo original sin avanzar nada.
      if (state.accepted[event.id]) return state.accepted[event.id];

      const current = state.revisions[event.batchId] || 0;
      if ((event.expectedBatchRevision || 0) !== current) throw fail('revision_conflict');

      const next = current + 1;
      const receipt = {
        eventId: event.id,
        acceptedAt: now(),
        batchRevisionAfter: next,
        serverEventPath: `field_events/${event.id}`,
        workflowState: event.payload && event.payload.to,
        simulated: true,
      };
      if (contracts && typeof contracts.validateReceipt === 'function') contracts.validateReceipt(receipt);

      state.revisions[event.batchId] = next;
      state.accepted[event.id] = receipt;
      save(storage, state);
      return receipt;
    };

    return {
      transport,
      reset: () => save(storage, { accepted: {}, revisions: {} }),
      stateOf: (batchId) => (load(storage).revisions[batchId] || 0),
    };
  };

  const api = { createMockTransport, STORAGE_KEY };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldEventMockTransport = api;
})();
