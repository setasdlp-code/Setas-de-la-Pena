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
const { validateReceipt, DEFAULT_INITIAL_STATE } = require('./shared/field-event-contracts.js');
// Misma normalización que usa la ficha del lote en el navegador. Si el servidor
// interpretara `estado` de otra forma, la hoja ofrecería transiciones que el
// servidor rechaza — el lote se vería en un estado y se validaría contra otro.
const { normalizeLifecycleState } = require('./shared/batch-sheet.js');

const BATCHES = 'lotes_produccion';
const EVENTS = 'field_events';
const CONTAINERS = 'contenedores';

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

    const isV2 = event.schemaVersion === 2 || payload.schemaVersion === 2;
    const isContainer = isV2 && event.entityType === 'container';
    if (isContainer && !event.entityId) {
      throw fail('invalid_envelope', 'entityId requerido para evento de contenedor');
    }

    // La identidad del operario viene de la sesión, nunca del payload: aceptarla
    // del cliente permitiría firmar un evento a nombre de otra persona.
    const operatorId = auth.uid;
    const operatorRole = await resolveRole(operatorId);

    const eventRef = db.collection(EVENTS).doc(event.id);
    const batchRef = db.collection(BATCHES).doc(event.batchId);
    const containerRef = isContainer ? db.collection(CONTAINERS).doc(event.entityId) : null;

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
      const currentBatchRevision = Number.isInteger(batch.revision) ? batch.revision : 0;

      if (isContainer) {
        const containerSnap = await tx.get(containerRef);
        const container = containerSnap.exists ? containerSnap.data() : null;

        const currentContainerState = container
          ? (container.lifecycleState || normalizeLifecycleState(container.estado, DEFAULT_INITIAL_STATE))
          : DEFAULT_INITIAL_STATE;
        const currentContainerRevision = container && Number.isInteger(container.revision)
          ? container.revision
          : 0;

        if (event.expectedEntityRevision !== null && event.expectedEntityRevision !== undefined) {
          if (event.expectedEntityRevision !== currentContainerRevision) {
            throw fail('revision_conflict', `esperaba revisión de contenedor ${event.expectedEntityRevision}, va en ${currentContainerRevision}`);
          }
        }

        if (event.expectedBatchRevision !== null && event.expectedBatchRevision !== undefined) {
          if (event.expectedBatchRevision !== currentBatchRevision) {
            throw fail('revision_conflict', `esperaba ${event.expectedBatchRevision}, el lote va en ${currentBatchRevision}`);
          }
        }

        const targetTo = event.payload?.to;
        const targetFrom = event.payload?.from || currentContainerState;
        if (targetTo) {
          validateTransition({ state: currentContainerState }, targetFrom, targetTo, operatorRole);
        }

        const nextContainerRevision = currentContainerRevision + 1;
        const nextBatchRevision = currentBatchRevision + 1;

        const receipt = {
          eventId: event.id,
          acceptedAt: new Date().toISOString(),
          entityRevisionAfter: nextContainerRevision,
          batchRevisionAfter: nextBatchRevision,
          serverEventPath: `${EVENTS}/${event.id}`,
        };
        validateReceipt(receipt);

        const containerPatch = {
          id: event.entityId,
          batchId: event.batchId,
          lifecycleState: targetTo || currentContainerState,
          revision: nextContainerRevision,
          updatedAt: new Date().toISOString(),
          lastEventId: event.id,
        };
        if (event.payload?.reasonCode) containerPatch.lastReasonCode = event.payload.reasonCode;
        if (event.payload?.notes) containerPatch.lastNotes = event.payload.notes;

        const batchPatch = {
          revision: nextBatchRevision,
          updatedAt: new Date().toISOString(),
          lastEventId: event.id,
        };

        tx.set(containerRef, containerPatch, { merge: true });
        tx.set(batchRef, batchPatch, { merge: true });
        tx.set(eventRef, { ...event, operatorId, accountId, receipt });

        return receipt;
      }

      // Flujo v1 / eventos de lote:
      const currentBatchState = batch.lifecycleState
        || normalizeLifecycleState(batch.estado, DEFAULT_INITIAL_STATE);

      if (event.expectedBatchRevision !== currentBatchRevision) {
        throw fail('revision_conflict', `esperaba ${event.expectedBatchRevision}, el lote va en ${currentBatchRevision}`);
      }

      validateTransition({ state: currentBatchState }, event.payload.from, event.payload.to, operatorRole);

      const nextRevision = currentBatchRevision + 1;
      const receipt = {
        eventId: event.id,
        acceptedAt: new Date().toISOString(),
        batchRevisionAfter: nextRevision,
        serverEventPath: `${EVENTS}/${event.id}`,
      };
      if (isV2) {
        receipt.entityRevisionAfter = nextRevision;
      }
      validateReceipt(receipt);

      tx.set(batchRef, { lifecycleState: event.payload.to, revision: nextRevision }, { merge: true });
      tx.set(eventRef, { ...event, operatorId, accountId, receipt });

      return receipt;
    });
  };
};

module.exports = { createAcceptFieldEvent, DEFAULT_INITIAL_STATE, BATCHES, EVENTS, CONTAINERS };
