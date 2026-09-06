'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const { createAcceptFieldEvent } = require('./accept-field-event.js');

initializeApp();
const db = getFirestore();

/**
 * `usuarios/{uid}.rol` no usa el vocabulario del flujo de trabajo: hoy sólo
 * distingue 'admin'. Se mapea al mínimo privilegio, de modo que un rol que
 * todavía no existe en ese documento no herede permisos por accidente.
 */
const ROLE_MAP = Object.freeze(Object.assign(Object.create(null), {
  admin: 'direccion',
  direccion: 'direccion',
  produccion: 'produccion',
  operario: 'operario',
}));

const resolveRole = async (uid) => {
  const snap = await db.collection('usuarios').doc(uid).get();
  const declared = snap.exists ? snap.data().rol : null;
  return (declared && ROLE_MAP[declared]) || 'operario';
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
