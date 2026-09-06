'use strict';

/**
 * @file field-event-contracts.js — Contratos compartidos entre el cliente de campo
 * y la Cloud Function de aceptación.
 *
 * Sin E/S y sin dependencias: este archivo se carga tanto con una etiqueta
 * <script> en el navegador como con require() en el servidor, de modo que
 * ambos lados no puedan divergir en el vocabulario de errores ni en la forma
 * del recibo.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const ERROR_CODES = Object.freeze({
    content_mismatch: 'content_mismatch',
    revision_conflict: 'revision_conflict',
    invalid_state_transition: 'invalid_state_transition',
    unauthorized_action: 'unauthorized_action',
    unknown_role: 'unknown_role',
    incomplete_event_record: 'incomplete_event_record',
    batch_not_found: 'batch_not_found',
    batch_already_has_pending_transition: 'batch_already_has_pending_transition',
    canonicalization_failed: 'canonicalization_failed',
    network_error: 'network_error',
  });

  // Sólo un fallo de transporte se reintenta. Cualquier otro código describe una
  // decisión del servidor: repetirlo daría siempre el mismo resultado y dejaría
  // la reserva del lote retenida indefinidamente.
  const RETRYABLE_CODES = Object.freeze(['network_error']);

  const RECEIPT_FIELDS = Object.freeze(['eventId', 'acceptedAt', 'batchRevisionAfter', 'serverEventPath']);

  const SCHEMA_VERSION = 1;
  const DEFAULT_INITIAL_STATE = 'inoculated';

  const isRetryable = (code) => {
    if (!ERROR_CODES[code]) {
      throw new Error(`unknown_error_code: "${code}" no pertenece al vocabulario compartido`);
    }
    return RETRYABLE_CODES.includes(code);
  };

  /**
   * Envuelve un evento para enviarlo al servidor.
   * Rechaza adjuntos: v1 no los soporta y dejarlos pasar aquí los haría llegar
   * a un servidor que no sabe almacenarlos.
   */
  const buildRequestEnvelope = (event, accountId) => {
    if (!event || typeof event !== 'object') {
      throw new Error('invalid_envelope: se requiere un evento');
    }
    if (!accountId) {
      throw new Error('invalid_envelope: se requiere accountId');
    }
    if (!Array.isArray(event.attachmentIds) || event.attachmentIds.length !== 0) {
      throw new Error('invalid_envelope: attachmentIds debe estar vacío en v1');
    }
    return Object.freeze({ schemaVersion: SCHEMA_VERSION,
    DEFAULT_INITIAL_STATE, accountId, event });
  };

  /**
   * Verifica que un recibo del servidor esté completo antes de confiar en él.
   * Un recibo parcial es peor que ninguno: el cliente marcaría el evento como
   * confirmado sin poder reconciliar la revisión del lote.
   */
  const validateReceipt = (receipt) => {
    if (!receipt || typeof receipt !== 'object') {
      throw new Error('incomplete_event_record: recibo ausente');
    }
    for (const field of RECEIPT_FIELDS) {
      if (receipt[field] === undefined || receipt[field] === null || receipt[field] === '') {
        throw new Error(`incomplete_event_record: falta "${field}" en el recibo`);
      }
    }
    const rev = receipt.batchRevisionAfter;
    if (!Number.isInteger(rev) || rev <= 0) {
      throw new Error('incomplete_event_record: batchRevisionAfter debe ser un entero positivo');
    }
    return true;
  };

  const api = {
    SCHEMA_VERSION,
    DEFAULT_INITIAL_STATE,
    ERROR_CODES,
    RETRYABLE_CODES,
    RECEIPT_FIELDS,
    isRetryable,
    buildRequestEnvelope,
    validateReceipt,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldEventContracts = api;
})();
