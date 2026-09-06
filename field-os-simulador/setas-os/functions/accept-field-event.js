'use strict';

/**
 * @file accept-field-event.js — Aceptación autoritativa de eventos de campo.
 *
 * Toda lectura que gobierna la decisión ocurre DENTRO de la transacción. Leer
 * el lote antes de abrirla dejaría una ventana en la que otro operario avanza
 * el mismo lote entre la lectura y la escritura, y ninguna de las dos
 * transiciones vería a la otra.
 */

// Copias sincronizadas desde la raíz por `npm run functions:sync`: el paquete
// que Firebase despliega sólo incluye functions/, así que no puede alcanzar los
// módulos compartidos por su ruta original. La fuente de verdad sigue siendo la
// raíz; shared/ es generado y está en .gitignore.
const { contentEquals, validateTransition } = require('./shared/field-events-model.js');
const { validateReceipt } = require('./shared/field-event-contracts.js');

// Los lotes creados antes del cuaderno de campo no llevan workflowState.
// El estado inicial lo decide el servidor: si lo tomara del `from` del evento,
// un cliente podría declarar `fruiting` en un lote recién creado y saltarse
// las etapas intermedias.
const DEFAULT_INITIAL_STATE = 'inoculated';

const BATCHES = 'lotes_produccion';
const EVENTS = 'field_events';

const fail = (code, detail) => {
  const err = new Error(detail ? `${code}: ${detail}` : code);
  err.code = code;
  return err;
};

/**
 * @param {object} deps
 * @param {FirebaseFirestore.Firestore} deps.db
 * @param {(uid: string) => Promise<string>} deps.resolveRole rol de flujo del operario
 */
const createAcceptFieldEvent = ({ db, resolveRole }) => {
  /**
   * @param {{schemaVersion:number, accountId:string, event:object}} payload
   * @param {{uid:string}} auth
   * @returns {Promise<object>} recibo
   */
  return async function acceptFieldEvent(payload, auth) {
    if (!auth || !auth.uid) throw fail('unauthenticated');

    const { event, accountId } = payload || {};
    if (!event || !event.id || !event.batchId) throw fail('invalid_envelope');
    if (!accountId) throw fail('invalid_envelope', 'accountId requerido');
    if (!Array.isArray(event.attachmentIds) || event.attachmentIds.length !== 0) {
      throw fail('invalid_envelope', 'attachmentIds debe estar vacío en v1');
    }

    // La identidad del operario viene de la sesión, nunca del payload: aceptarla
    // del cliente permitiría firmar un evento a nombre de otra persona.
    const operatorId = auth.uid;
    const operatorRole = await resolveRole(operatorId);

    const eventRef = db.collection(EVENTS).doc(event.id);
    const batchRef = db.collection(BATCHES).doc(event.batchId);

    return db.runTransaction(async (tx) => {
      const storedSnap = await tx.get(eventRef);

      if (storedSnap.exists) {
        const stored = storedSnap.data();
        if (!stored.receipt) throw fail('incomplete_event_record', event.id);

        // Reenvío: el mismo evento debe devolver su recibo original, no crear
        // una segunda transición. Es lo que hace segura la reentrega tras una
        // respuesta perdida.
        if (!contentEquals({ ...event, operatorId }, { ...stored, receipt: undefined })) {
          throw fail('content_mismatch', event.id);
        }
        return stored.receipt;
      }

      const batchSnap = await tx.get(batchRef);
      if (!batchSnap.exists) throw fail('batch_not_found', event.batchId);

      const batch = batchSnap.data();
      const currentState = batch.workflowState || DEFAULT_INITIAL_STATE;
      const currentRevision = Number.isInteger(batch.revision) ? batch.revision : 0;

      if (event.expectedBatchRevision !== currentRevision) {
        throw fail('revision_conflict', `esperaba ${event.expectedBatchRevision}, el lote va en ${currentRevision}`);
      }

      validateTransition({ state: currentState }, event.payload.from, event.payload.to, operatorRole);

      const nextRevision = currentRevision + 1;
      const receipt = {
        eventId: event.id,
        acceptedAt: new Date().toISOString(),
        batchRevisionAfter: nextRevision,
        serverEventPath: `${EVENTS}/${event.id}`,
      };
      validateReceipt(receipt);

      tx.set(batchRef, { workflowState: event.payload.to, revision: nextRevision }, { merge: true });
      tx.set(eventRef, { ...event, operatorId, accountId, receipt });

      return receipt;
    });
  };
};

module.exports = { createAcceptFieldEvent, DEFAULT_INITIAL_STATE, BATCHES, EVENTS };
