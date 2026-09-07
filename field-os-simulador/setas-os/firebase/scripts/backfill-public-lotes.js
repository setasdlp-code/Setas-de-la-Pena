#!/usr/bin/env node
// Backfill de una sola vez: publica en public_lotes/ (ficha pública de
// trazabilidad, ver public-trace-sync.js) los lotes y cosechas que ya
// existían en bitacora_lotes/bitacora_cosechas ANTES de que ese sync
// automático empezara a correr.
//
// Por qué existe: public-trace-sync.js solo se dispara hacia adelante —
// al crear/actualizar un lote o registrar una cosecha desde la app. Los
// lotes creados antes de ese cambio nunca disparan esas escrituras, así
// que su QR impreso apunta a un documento público que no existe (nunca
// hasta que alguien los edite manualmente en Bitácora). Este script
// recorre todo bitacora_lotes una sola vez y llena el hueco.
//
// Usa Admin SDK: escribe directo, sin pasar por firestore.rules — por eso
// aplica aquí, en Node, la MISMA sanitización que public-trace-sync.js
// aplica en el cliente (nunca costo, proveedor, receta completa, notas de
// operador). No te saltes esa función aunque el Admin SDK ignore las
// reglas: el propósito es que el documento público nunca cargue datos
// internos, no solo que la escritura esté permitida.
//
// Requiere una clave de cuenta de servicio (Firebase Console → Configuración
// del proyecto → Cuentas de servicio → Generar nueva clave privada) — NUNCA
// commitear ese JSON al repo.
//
// Uso:
//   npm install --no-save firebase-admin
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
//     node firebase/scripts/backfill-public-lotes.js
//
// Es idempotente (setDoc con merge:true) — correrlo dos veces no duplica
// nada, solo re-escribe los mismos documentos.
let initializeApp, applicationDefault, getFirestore, FieldValue;
try {
  ({ initializeApp, applicationDefault } = require('firebase-admin/app'));
  ({ getFirestore, FieldValue } = require('firebase-admin/firestore'));
} catch (e) {
  const admin = require('firebase-admin');
  initializeApp = admin.initializeApp.bind(admin);
  applicationDefault = admin.credential ? admin.credential.applicationDefault.bind(admin.credential) : admin.applicationDefault?.bind(admin);
  getFirestore = () => admin.firestore();
  FieldValue = admin.firestore.FieldValue;
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

// Idéntico a sanearLote/sanearCosecha en public-trace-sync.js — si cambias
// el esquema público allá, cambia también aquí.
const sanearLote = (lote) => ({
  codigo: String(lote.codigo || '').slice(0, 64),
  especie: String(lote.especie || '').slice(0, 128),
  especieCientifico: String(lote.especieCientifico || '').slice(0, 128),
  fechaInoculacion: String(lote.fechaInoculacion || '').slice(0, 32),
  numBolsas: Number.isFinite(Number(lote.numBolsas))
    ? Math.max(0, Math.min(100000, Math.floor(Number(lote.numBolsas))))
    : null,
  estado: String(lote.estado || 'incubacion').slice(0, 32),
});

const sanearCosecha = (cosecha) => ({
  fecha: String(cosecha.fecha || '').slice(0, 32),
  pesoFresco: Number.isFinite(Number(cosecha.pesoFresco))
    ? Math.max(0, Math.min(10000000, Number(cosecha.pesoFresco)))
    : 0,
  calidad: Number.isFinite(Number(cosecha.calidad))
    ? Math.max(0, Math.min(5, Math.floor(Number(cosecha.calidad))))
    : null,
  flush: Number.isFinite(Number(cosecha.flush))
    ? Math.max(1, Math.floor(Number(cosecha.flush)))
    : 1,
});

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  let app;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = initializeApp({ credential: applicationDefault(), projectId: 'sdlp-os' });
  } else {
    const cliCred = getCliCredential();
    app = initializeApp({ credential: cliCred || applicationDefault(), projectId: 'sdlp-os' });
  }
  const db = getFirestore(app);

  const lotesSnap = await db.collection('bitacora_lotes').get();
  console.log(`${lotesSnap.size} lote(s) encontrados en bitacora_lotes.`);

  let lotesEscritos = 0;
  let cosechasEscritas = 0;
  let lotesSinCodigo = 0;

  for (const loteDoc of lotesSnap.docs) {
    const lote = loteDoc.data();
    if (!lote.codigo) {
      lotesSinCodigo += 1;
      console.warn(`  ⚠ omitido — sin campo "codigo": bitacora_lotes/${loteDoc.id}`);
      continue;
    }

    const loteSaneado = { ...sanearLote(lote), syncedAt: FieldValue.serverTimestamp() };
    console.log(`  → public_lotes/${lote.codigo}${dryRun ? ' (dry-run, no se escribe)' : ''}`);
    if (!dryRun) {
      await db.collection('public_lotes').doc(lote.codigo).set(loteSaneado, { merge: true });
    }
    lotesEscritos += 1;

    const cosechasSnap = await db.collection('bitacora_cosechas')
      .where('loteId', '==', loteDoc.id)
      .get();
    for (const cosechaDoc of cosechasSnap.docs) {
      const cosecha = cosechaDoc.data();
      const cosechaSaneada = { ...sanearCosecha(cosecha), syncedAt: FieldValue.serverTimestamp() };
      if (!dryRun) {
        await db.collection('public_lotes').doc(lote.codigo)
          .collection('cosechas').doc(String(cosechaDoc.id))
          .set(cosechaSaneada, { merge: true });
      }
      cosechasEscritas += 1;
    }
  }

  console.log('');
  console.log(dryRun ? '── Dry-run terminado, nada se escribió ──' : '── Backfill terminado ──');
  console.log(`Lotes publicados: ${lotesEscritos}`);
  console.log(`Cosechas publicadas: ${cosechasEscritas}`);
  if (lotesSinCodigo) console.log(`Lotes omitidos (sin código): ${lotesSinCodigo}`);
}

main().catch((err) => {
  console.error('Error en el backfill:', err.message || err);
  process.exit(1);
});
