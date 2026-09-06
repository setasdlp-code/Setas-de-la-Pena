'use strict';

/**
 * @file field-qr-resolve.js — Lectura de la etiqueta QR de un lote.
 *
 * Resolver es sólo leer: escanear no registra nada ni cambia el estado del
 * lote. La transición la crea el operario al confirmarla en la hoja de acción.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const model = isNode ? require('./field-events-model.js') : globalThis.SetasFieldEvents;
  const getWorkflow = () => (isNode ? require('./setas-os-workflow.js') : globalThis.SetasOSWorkflow);

  // Formatos aceptados. Una cadena suelta no se acepta como código: es
  // indistinguible de un QR de otro sistema, y aceptarla haría que escanear
  // cualquier etiqueta ajena abriera la hoja de acción de un lote arbitrario.
  const TRACE_URL = /^https?:\/\/(?:www\.)?setasdelapena\.com\/trace\/([A-Za-z0-9_-]{1,64})\/?$/;
  const SETAS_SCHEME = /^setas:lote:([A-Za-z0-9_-]{1,64})$/;

  const parseBatchRef = (text) => {
    const raw = typeof text === 'string' ? text.trim() : '';
    const match = raw.match(TRACE_URL) || raw.match(SETAS_SCHEME);
    if (!match) throw new Error(`invalid_qr_payload: no es una etiqueta de lote ("${raw.slice(0, 40)}")`);
    return { batchId: decodeURIComponent(match[1]) };
  };

  /**
   * @param {string} text        contenido crudo del QR
   * @param {(batchId:string) => Promise<object|null>} lookup
   * @param {string} operatorRole
   * @returns {Promise<{batch: object, allowedTransitions: string[]}>}
   */
  const resolveBatch = async (text, lookup, operatorRole) => {
    const { batchId } = parseBatchRef(text);

    const batch = await lookup(batchId);
    if (!batch) throw new Error(`batch_not_found: ${batchId}`);

    const state = batch.workflowState || batch.state || null;
    const workflow = getWorkflow();
    const candidates = (state && workflow.DEFAULT_TRANSITIONS[state]) || [];

    const permitted = model.ROLE_PERMISSIONS[operatorRole];
    if (!permitted) throw new Error(`unknown_role: rol desconocido "${operatorRole}"`);

    // Un estado terminal no es un error: simplemente no ofrece transiciones.
    const allowedTransitions = candidates.filter(to => permitted.includes(model.transitionClass(to)));

    return { batch, batchId, state, allowedTransitions };
  };

  const api = { parseBatchRef, resolveBatch, TRACE_URL, SETAS_SCHEME };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldQrResolve = api;
})();
