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
let initializeApp, applicationDefault, getAuth;
try {
  ({ initializeApp, applicationDefault } = require('firebase-admin/app'));
  ({ getAuth } = require('firebase-admin/auth'));
} catch (e) {
  const admin = require('firebase-admin');
  initializeApp = admin.initializeApp.bind(admin);
  applicationDefault = admin.credential ? admin.credential.applicationDefault.bind(admin.credential) : admin.applicationDefault?.bind(admin);
  getAuth = admin.auth ? admin.auth.bind(admin) : null;
}

function getCliCredential() {
  try {
    const Configstore = require('configstore');
    const cs = new Configstore('firebase-tools');
    const tokens = cs.get('tokens');
    if (tokens && tokens.access_token) {
      return {
        getAccessToken: async () => ({
          access_token: tokens.access_token,
          expires_in: 3600,
        }),
      };
    }
  } catch (_) {
    // Configstore no disponible o sin tokens
  }
  return null;
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Uso: node asignar-sync-claim.js <uid-o-email>');
    process.exit(1);
  }

  let app;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = initializeApp({ credential: applicationDefault(), projectId: 'sdlp-os' });
  } else {
    const cliCred = getCliCredential();
    if (cliCred) {
      app = initializeApp({ credential: cliCred, projectId: 'sdlp-os' });
    } else {
      app = initializeApp({ credential: applicationDefault(), projectId: 'sdlp-os' });
    }
  }

  const auth = getAuth ? getAuth(app) : app.auth();

  const user = target.includes('@')
    ? await auth.getUserByEmail(target)
    : await auth.getUser(target);

  await auth.setCustomUserClaims(user.uid, {
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
