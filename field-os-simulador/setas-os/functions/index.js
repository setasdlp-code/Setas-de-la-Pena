'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const { createAcceptFieldEvent } = require('./accept-field-event.js');
const { mapWorkflowRole } = require('./shared/field-event-contracts.js');

initializeApp();
const db = getFirestore();

/**
 * El rol de flujo de trabajo sale de `usuarios/{uid}.rol` a través de la tabla
 * compartida, la misma que usa el cliente para decidir qué acciones ofrece.
 */
const resolveRole = async (uid) => {
  const snap = await db.collection('usuarios').doc(uid).get();
  return mapWorkflowRole(snap.exists ? snap.data().rol : null);
};

const acceptFieldEvent = createAcceptFieldEvent({ db, resolveRole });

// Los códigos del contrato compartido viajan como `details.code` para que el
// cliente decida reintentar o no sin tener que interpretar el mensaje.
const TERMINAL = 'failed-precondition';
const HTTPS_STATUS = Object.freeze(Object.assign(Object.create(null), {
  unauthenticated: 'unauthenticated',
  batch_not_found: 'not-found',
  invalid_envelope: 'invalid-argument',
  unauthorized_action: 'permission-denied',
  unknown_role: 'permission-denied',
}));

exports.acceptFieldEvent = onCall(async (request) => {
  try {
    return await acceptFieldEvent(request.data, request.auth);
  } catch (err) {
    const code = err.code || 'internal';
    throw new HttpsError(HTTPS_STATUS[code] || TERMINAL, err.message, { code });
  }
});
