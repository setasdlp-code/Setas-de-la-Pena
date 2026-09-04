#!/usr/bin/env node
// Asigna el custom claim `sync_service: true` a una cuenta de Firebase Auth,
// necesario para que esa cuenta pueda escribir en public_lotes/ bajo las
// reglas endurecidas (ver firebase/firestore.rules → isSyncService()).
//
// Por qué existe: public-trace-sync.js corre dentro de la sesión normal de
// cada operador (no hay un backend/servicio separado en esta app), así que
// sin este paso NINGUNA cuenta puede sincronizar la ficha pública después de
// desplegar las reglas nuevas — solo isAdmin() (rol admin en usuarios/{uid})
// seguiría funcionando. Corre este script una vez por cada cuenta operativa
// que deba sincronizar lotes/cosechas a la ficha pública.
//
// Requiere una clave de cuenta de servicio (Firebase Console → Configuración
// del proyecto → Cuentas de servicio → Generar nueva clave privada) — NUNCA
// commitear ese JSON al repo.
//
// Uso:
//   npm install --no-save firebase-admin
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
//     node firebase/scripts/asignar-sync-claim.js <uid-o-email>
//
// Alternativa considerada: mover la escritura de public_lotes a una Cloud
// Function con Admin SDK (el cliente solo pide la sincronización, nunca
// escribe directo a Firestore) — evita este paso de aprovisionamiento por
// completo, a costa de desplegar y mantener una función. Ver PR para el
// detalle de esta alternativa.
const admin = require('firebase-admin');

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Uso: node asignar-sync-claim.js <uid-o-email>');
    process.exit(1);
  }

  admin.initializeApp({ credential: admin.credential.applicationDefault() });

  const user = target.includes('@')
    ? await admin.auth().getUserByEmail(target)
    : await admin.auth().getUser(target);

  await admin.auth().setCustomUserClaims(user.uid, {
    ...user.customClaims,
    sync_service: true,
  });

  console.log(`sync_service=true asignado a ${user.email || user.uid}.`);
  console.log('La cuenta debe cerrar sesión y volver a iniciarla (o forzar refresh del ID token) para que el claim tome efecto.');
}

main().catch((err) => {
  console.error('Error asignando el claim:', err.message || err);
  process.exit(1);
});
