'use strict';

// Lógica de la función programada importarCorreosCompra, con un Firestore
// falso en memoria y un lector de Gmail falso: sin red ni credenciales.
const test = require('node:test');
const assert = require('node:assert/strict');
const inbox = require('./purchase-email-inbox.js');
const { createImportPurchaseEmails } = require('./functions/import-purchase-emails.js');

const fakeDb = (proveedores = []) => {
  const cols = { inventario_proveedores: new Map(proveedores.map(p => [p.id, p])), correos_compra: new Map() };
  return {
    cols,
    collection(name) {
      const m = cols[name] || (cols[name] = new Map());
      return {
        async get() { return { docs: [...m.entries()].map(([id, data]) => ({ id, data: () => data })) }; },
        doc(id) {
          return {
            async create(data) {
              if (m.has(id)) { const e = new Error('exists'); e.code = 6; throw e; }
              m.set(id, data);
            },
          };
        },
      };
    },
  };
};

const MSGS = [
  { messageId: '<a1@homecenter.com.co>', from: 'Homecenter <pedidos@homecenter.com.co>', subject: 'Confirmación de pedido', date: '2026-10-30T20:00:00Z', text: 'Cal agrícola 25 kg' },
  { messageId: '<a2@homecenter.com.co>', from: 'Homecenter <news@homecenter.com.co>', subject: 'Ofertas de la semana', date: '2026-10-30T20:00:00Z', text: 'promo' },
  { messageId: '<b1@gmail.com>', from: 'Aserrío <aserrio.tenjo@gmail.com>', subject: 'Le mando lo suyo', date: '2026-10-30T22:00:00Z', text: 'Aserrín 200 kg' },
];

test('crea un documento por correo de compra, ignora publicidad, idempotente', async () => {
  const db = fakeDb([{ id: 'prov_1', nombre: 'Aserrío', remitenteCorreo: 'aserrio.tenjo@gmail.com' }]);
  let pedido;
  const importar = createImportPurchaseEmails({
    db, inbox, now: () => Date.parse('2026-10-31T12:00:00Z'),
    fetchMessages: async q => { pedido = q; return MSGS; },
  });
  const r1 = await importar();
  assert.deepEqual(r1, { revisados: 3, creados: 2, existentes: 0, ignorados: 1 });
  assert.ok(pedido.senders.includes('aserrio.tenjo@gmail.com'));
  assert.ok(pedido.senders.includes('homecenter.com.co'));
  assert.equal(pedido.since.toISOString(), '2026-10-28T12:00:00.000Z');

  const docs = [...db.cols.correos_compra.values()];
  assert.ok(docs.every(d => d.estado === 'nueva' && d.origen === 'gmail'));
  assert.ok(db.cols.correos_compra.has(inbox.correoId({ messageId: 'a1@homecenter.com.co' })));
  assert.equal(docs.find(d => d.messageId === 'b1@gmail.com').fecha, '2026-10-30');

  const r2 = await importar();
  assert.deepEqual(r2, { revisados: 3, creados: 0, existentes: 2, ignorados: 1 });
});

test('un correo ya importado en la app no vuelve a "nueva"', async () => {
  const db = fakeDb();
  const id = inbox.correoId({ messageId: 'a1@homecenter.com.co' });
  db.cols.correos_compra.set(id, { estado: 'importada', compraId: 'compra_1' });
  const importar = createImportPurchaseEmails({ db, inbox, fetchMessages: async () => [MSGS[0]] });
  const r = await importar();
  assert.equal(r.existentes, 1);
  assert.equal(db.cols.correos_compra.get(id).estado, 'importada');
});

test('un error que no es "ya existe" se propaga', async () => {
  const db = fakeDb();
  db.collection = name => ({
    async get() { return { docs: [] }; },
    doc() { return { async create() { const e = new Error('boom'); e.code = 14; throw e; } }; },
  });
  const importar = createImportPurchaseEmails({ db, inbox, fetchMessages: async () => [MSGS[0]] });
  await assert.rejects(importar(), /boom/);
});

test('guarda la factura leída del adjunto, con el documento muy por debajo de 1 MiB', async () => {
  const db = fakeDb();
  const factura = {
    tipo: 'factura', numero: 'SETP1', fecha: '2026-10-28', proveedor: 'Ficticio', nit: '900000001', moneda: 'COP', total: 1000,
    lineas: Array.from({ length: 150 }, (_, i) => ({ descripcion: 'Ítem '.repeat(40) + i, cantidad: 1, unidad: 'kg', unidadCodigo: 'KGM', precioUnitario: 1, total: 1, kg: 1, precioKg: 1 })),
    lineasOmitidas: 0,
  };
  const importar = createImportPurchaseEmails({
    db, inbox,
    fetchMessages: async () => [{ ...MSGS[0], subject: 'Factura electrónica SETP1', text: 'adjunto factura', factura, adjuntos: [{ nombre: 'f.zip', tipo: 'zip', bytes: 900, estado: 'leido' }], adjuntoTexto: '' }],
  });
  assert.equal((await importar()).creados, 1);
  const [doc] = [...db.cols.correos_compra.values()];
  assert.equal(doc.factura.lineas.length, 150);
  assert.deepEqual(doc.adjuntos, [{ nombre: 'f.zip', tipo: 'zip', bytes: 900, estado: 'leido' }]);
  assert.ok(Buffer.byteLength(JSON.stringify(doc)) < 200 * 1024);
  assert.match(inbox.textoParaParseo(doc), /Ítem/);
});
