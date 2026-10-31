'use strict';

/**
 * @file import-purchase-emails.js — Trae correos de compra de Gmail a la
 * bandeja de Bodega (colección `correos_compra`).
 *
 * Sólo CREA un documento por correo, con estado `nueva`. Nunca registra una
 * compra ni toca stock: eso lo hace una persona en Compra → Correos, después
 * de revisar los ítems (ver purchase-email-inbox.js).
 *
 * Idempotente: el id del documento sale del encabezado Message-ID, y se usa
 * `create()`, que falla si ya existe. Correr dos veces sobre la misma ventana
 * (o cruzarse con un archivo de fetch_gmail.py importado a mano) no duplica.
 *
 * La lectura de Gmail se inyecta (`fetchMessages`), así que la lógica se
 * prueba sin red ni credenciales. El adaptador IMAP real está en gmail-imap.js.
 */

const COLECCION = 'correos_compra';
const PROVEEDORES = 'inventario_proveedores';
const ALREADY_EXISTS = 6; // código gRPC de Firestore

const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * @param {object} deps
 * @param {FirebaseFirestore.Firestore} deps.db
 * @param {(q: {since: Date, senders: string[]}) => Promise<Array<{messageId,from,subject,date,text,factura?,adjuntos?,adjuntoTexto?}>>} deps.fetchMessages
 * @param {object} [deps.inbox] purchase-email-inbox.js (por defecto, la copia de shared/)
 * @param {() => number} [deps.now]
 * @param {number} [deps.ventanaDias] cuántos días hacia atrás se revisan en cada corrida
 */
function createImportPurchaseEmails({ db, fetchMessages, inbox, now = () => Date.now(), ventanaDias = 3 } = {}) {
  if (!db || typeof fetchMessages !== 'function') throw new Error('createImportPurchaseEmails requiere db y fetchMessages');
  // shared/ es generado por `npm run functions:sync` y no está en git: sólo se
  // carga si quien llama no trae el módulo (las pruebas lo traen de la raíz).
  const api = inbox || require('./shared/purchase-email-inbox.js');

  return async function importPurchaseEmails() {
    const provSnap = await db.collection(PROVEEDORES).get();
    const proveedores = provSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !p.deleted);
    const senders = api.senderKeysFor(proveedores);
    const since = new Date(now() - ventanaDias * DIA_MS);

    const mensajes = await fetchMessages({ since, senders });
    const resumen = { revisados: mensajes.length, creados: 0, existentes: 0, ignorados: 0 };

    for (const m of mensajes) {
      if (!api.isPurchaseEmail({ from: m.from, subject: m.subject }, { proveedores })) {
        resumen.ignorados++;
        continue;
      }
      const correo = api.normalizeCorreo({
        messageId: m.messageId,
        from: m.from,
        subject: m.subject,
        date: m.date,
        body: m.text,
        factura: m.factura,
        adjuntos: m.adjuntos,
        adjuntoTexto: m.adjuntoTexto,
        origen: 'gmail',
      });
      if (!correo) { resumen.ignorados++; continue; }
      const doc = api.ajustarTamano({
        ...correo,
        estado: api.ESTADOS.NUEVA,
        importadoEn: new Date(now()).toISOString(),
      });
      try {
        await db.collection(COLECCION).doc(correo.id).create(doc);
        resumen.creados++;
      } catch (err) {
        if (err && (err.code === ALREADY_EXISTS || err.code === 'already-exists')) resumen.existentes++;
        else throw err;
      }
    }
    return resumen;
  };
}

module.exports = { createImportPurchaseEmails, COLECCION };
