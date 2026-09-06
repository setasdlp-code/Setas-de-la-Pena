'use strict';

/**
 * @file field-events-model.js — Modelo inmutable de eventos de campo para Setas OS.
 *
 * Crea eventos de transición de estado a partir de un escaneo QR, canonicaliza
 * marcas de tiempo para comparar idempotencia y autoriza la transición contra
 * la máquina de estados de SetasOSWorkflow.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const workflow = isNode
    ? require('./setas-os-workflow.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasOSWorkflow : null);

  // Clases de transición: quién puede llevar un lote a cada tipo de destino.
  const EXCEPTION_TARGETS = new Set(['quarantine', 'failed']);
  const DISCARD_TARGETS = new Set(['discarded']);

  const ROLE_PERMISSIONS = Object.freeze({
    direccion: Object.freeze(['advance', 'exception', 'discard']),
    produccion: Object.freeze(['advance', 'exception']),
    operario: Object.freeze(['advance']),
  });

  const transitionClass = (to) => {
    if (DISCARD_TARGETS.has(to)) return 'discard';
    if (EXCEPTION_TARGETS.has(to)) return 'exception';
    return 'advance';
  };

  /**
   * UUID v4 sin dependencias externas: el navegador carga este archivo con una
   * etiqueta <script> clásica, sin bundler que pueda resolver `require`.
   */
  const generateEventId = () => {
    const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
    if (c && typeof c.randomUUID === 'function') return `evt_${c.randomUUID()}`;
    if (c && typeof c.getRandomValues === 'function') {
      const b = c.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const hex = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
      return `evt_${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    throw new Error('crypto_unavailable: no se puede generar un id de evento estable');
  };

  const canonicalizeTimestamp = (ts) => {
    if (!ts) return null;
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`canonicalization_failed: marca de tiempo inválida "${ts}"`);
    }
    return date.toISOString();
  };

  const createFieldEvent = (batchId, from, to, operatorId, occurredAt, expectedBatchRevision = null) => Object.freeze({
    schemaVersion: 1,
    id: generateEventId(),
    type: 'batch_state_transition',
    batchId,
    expectedBatchRevision,
    occurredAt: canonicalizeTimestamp(occurredAt),
    operatorId,
    source: 'mobile_qr',
    payload: Object.freeze({ from, to, reasonCode: null, notes: null }),
    attachmentIds: Object.freeze([]),
    metadata: Object.freeze({}),
  });

  const contentEquals = (submitted, stored) => {
    const normalize = (obj) => {
      const { receipt, ...eventOnly } = obj;
      return JSON.stringify({
        id: eventOnly.id,
        schemaVersion: eventOnly.schemaVersion ?? 1,
        type: eventOnly.type,
        batchId: eventOnly.batchId,
        expectedBatchRevision: eventOnly.expectedBatchRevision ?? null,
        occurredAt: canonicalizeTimestamp(eventOnly.occurredAt),
        operatorId: eventOnly.operatorId,
        source: eventOnly.source,
        payload: eventOnly.payload,
        attachmentIds: eventOnly.attachmentIds ?? [],
        metadata: eventOnly.metadata ?? {},
      });
    };
    return normalize(submitted) === normalize(stored);
  };

  /**
   * Autoriza la transición contra la máquina de estados y el rol del operario.
   *
   * Autoriza sobre la transición, no sobre un nombre de acción: ACTIONS_BY_STATE
   * no expone `advance_stage` en todos los estados que DEFAULT_TRANSITIONS sí
   * permite avanzar (p. ej. `inoculated`), así que consultarlo bloquearía el
   * flujo principal Inoculación → Incubación.
   */
  const validateTransition = (batch, from, to, operatorRole) => {
    if (!batch || typeof batch.state !== 'string') {
      throw new Error('batch_not_found: se requiere un lote con estado');
    }
    if (from !== batch.state) {
      throw new Error(`invalid_state_transition: el lote está en ${batch.state}, no en ${from}`);
    }
    if (!workflow.canTransition(from, to)) {
      throw new Error(`invalid_state_transition: ${from} → ${to} no está permitido`);
    }

    const permitted = ROLE_PERMISSIONS[operatorRole];
    if (!permitted) {
      throw new Error(`unknown_role: rol desconocido "${operatorRole}"`);
    }
    const required = transitionClass(to);
    if (!permitted.includes(required)) {
      throw new Error(`unauthorized_action: el rol ${operatorRole} no puede ejecutar una transición de tipo ${required}`);
    }
    return true;
  };

  const api = {
    ROLE_PERMISSIONS,
    transitionClass,
    generateEventId,
    createFieldEvent,
    canonicalizeTimestamp,
    contentEquals,
    validateTransition,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldEvents = api;
})();
