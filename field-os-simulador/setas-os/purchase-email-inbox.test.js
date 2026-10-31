'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const inbox = require('./purchase-email-inbox.js');

// Correos sintéticos: nunca correo real en el repositorio.
const HOMECENTER = {
  from: 'Homecenter <pedidos@ventas.homecenter.com.co>',
  subject: 'Confirmación de tu pedido #12345',
  date: 'Fri, 30 Oct 2026 21:15:00 -0500',
  body: 'Cal agrícola 25 kg — $38.000',
  messageId: '<ABC123@mail.homecenter.com.co>',
};

test('senderAddress y senderKey: dominio de empresa, dirección completa para correo personal', () => {
  assert.equal(inbox.senderAddress('Homecenter <Pedidos@Homecenter.com.co>'), 'pedidos@homecenter.com.co');
  assert.equal(inbox.senderAddress('aserrio@gmail.com'), 'aserrio@gmail.com');
  assert.equal(inbox.senderKey(HOMECENTER.from), 'ventas.homecenter.com.co');
  assert.equal(inbox.senderKey('Don Jaime <aserrio.tenjo@gmail.com>'), 'aserrio.tenjo@gmail.com');
  assert.equal(inbox.senderKey('sin correo'), '');
});

test('keyMatches: subdominios sí, dominios parecidos no', () => {
  assert.equal(inbox.keyMatches(HOMECENTER.from, 'homecenter.com.co'), true);
  assert.equal(inbox.keyMatches('x@nothomecenter.com.co', 'homecenter.com.co'), false);
  assert.equal(inbox.keyMatches('a@gmail.com', 'b@gmail.com'), false);
  assert.equal(inbox.keyMatches('A@Gmail.com', 'a@gmail.com'), true);
  assert.equal(inbox.keyMatches('a@x.com', ''), false);
});

test('isPurchaseEmail: remitente conocido + asunto, o proveedor registrado', () => {
  assert.equal(inbox.isPurchaseEmail(HOMECENTER), true);
  assert.equal(inbox.isPurchaseEmail({ from: HOMECENTER.from, subject: 'Ofertas de la semana' }), false);
  assert.equal(inbox.isPurchaseEmail({ from: 'tio@gmail.com', subject: 'Factura' }), false);
  const proveedores = [{ id: 'prov_1', nombre: 'Aserrío', remitenteCorreo: 'aserrio.tenjo@gmail.com' }];
  assert.equal(inbox.isPurchaseEmail({ from: 'Aserrío <aserrio.tenjo@gmail.com>', subject: 'hola' }, { proveedores }), true);
});

test('matchProveedor: sólo una coincidencia inequívoca, nunca inventa', () => {
  const provs = [
    { id: 'p1', remitenteCorreo: 'homecenter.com.co' },
    { id: 'p2', remitenteCorreo: 'rappi.com' },
  ];
  assert.equal(inbox.matchProveedor(provs, HOMECENTER.from), 'p1');
  assert.equal(inbox.matchProveedor(provs, 'x@mercadolibre.com'), '');
  assert.equal(inbox.matchProveedor([...provs, { id: 'p3', remitenteCorreo: 'ventas.homecenter.com.co' }], HOMECENTER.from), '');
});

test('correoId: estable por Message-ID, sin importar mayúsculas ni <>', () => {
  const a = inbox.correoId({ messageId: '<ABC123@mail.homecenter.com.co>' });
  const b = inbox.correoId({ messageId: 'abc123@mail.homecenter.com.co' });
  assert.equal(a, b);
  assert.match(a, /^mail_[0-9a-f]{16}$/);
  assert.notEqual(a, inbox.correoId({ messageId: 'otro@x' }));
});

test('correoId sin Message-ID: estable por contenido, no por número de secuencia IMAP', () => {
  const e = { from: 'a@b.com', subject: 'Pedido', date: '2026-10-01', body: 'x' };
  assert.equal(inbox.correoId({ ...e, id: 'imap_1' }), inbox.correoId({ ...e, id: 'imap_99' }));
  assert.notEqual(inbox.correoId(e), inbox.correoId({ ...e, body: 'y' }));
});

test('bogotaDate: 9:15 pm en Colombia sigue siendo el mismo día (no el de UTC)', () => {
  assert.equal(inbox.bogotaDate('Fri, 30 Oct 2026 21:15:00 -0500'), '2026-10-30');
  assert.equal(inbox.bogotaDate('2026-10-31T01:00:00Z'), '2026-10-30');
  assert.equal(inbox.bogotaDate('2026-10-15'), '2026-10-15');
  assert.equal(inbox.bogotaDate('no es fecha'), null);
  assert.equal(inbox.todayBogota(Date.parse('2026-11-01T03:00:00Z')), '2026-10-31');
});

test('normalizeCorreo: forma de fetch_gmail.py → forma canónica', () => {
  const c = inbox.normalizeCorreo(HOMECENTER);
  assert.equal(c.estado, 'nueva');
  assert.equal(c.fecha, '2026-10-30');
  assert.equal(c.remitenteClave, 'ventas.homecenter.com.co');
  assert.equal(c.messageId, 'abc123@mail.homecenter.com.co');
  assert.equal(c.id, inbox.correoId({ messageId: HOMECENTER.messageId }));
  assert.equal(inbox.normalizeCorreo({}), null);
  assert.equal(inbox.normalizeCorreo({ ...HOMECENTER, body: 'x'.repeat(10000) }).cuerpo.length, 6000);
});

test('correosFromFile: acepta {emails:[...]}, deduplica, rechaza otra forma', () => {
  const list = inbox.correosFromFile({ emails: [HOMECENTER, { ...HOMECENTER, id: 'imap_7' }] });
  assert.equal(list.length, 1);
  assert.equal(list[0].origen, 'archivo');
  assert.throws(() => inbox.correosFromFile({ foo: [] }), /emails/);
});

test('mergeCorreos: un correo importado no vuelve a "nueva" con una copia atrasada', () => {
  const nueva = inbox.normalizeCorreo(HOMECENTER);
  const importada = { ...nueva, estado: 'importada', compraId: 'compra_1' };
  assert.equal(inbox.mergeCorreos([importada], [nueva])[0].estado, 'importada');
  assert.equal(inbox.mergeCorreos([nueva], [importada])[0].estado, 'importada');
  assert.equal(inbox.mergeCorreos([nueva], [importada])[0].compraId, 'compra_1');
});

test('markCorreo: sólo nueva → importada | descartada', () => {
  const c = inbox.normalizeCorreo(HOMECENTER);
  const [imp] = inbox.markCorreo([c], c.id, 'importada', { compraId: 'compra_9' });
  assert.equal(imp.estado, 'importada');
  assert.equal(imp.compraId, 'compra_9');
  const [igual] = inbox.markCorreo([imp], c.id, 'descartada');
  assert.equal(igual.estado, 'importada');
  assert.equal(inbox.canTransition('descartada', 'nueva'), false);
});

test('inboxPending: oculta lo ya importado en otro equipo (compra con origenCorreoId)', () => {
  const a = inbox.normalizeCorreo(HOMECENTER);
  const b = inbox.normalizeCorreo({ ...HOMECENTER, messageId: 'b@x', date: '2026-10-29' });
  const c = { ...inbox.normalizeCorreo({ ...HOMECENTER, messageId: 'c@x' }), estado: 'descartada' };
  const pend = inbox.inboxPending([b, a, c], [{ id: 'compra_1', origenCorreoId: 'otro' }]);
  assert.deepEqual(pend.map(x => x.id), [a.id, b.id]);
  assert.deepEqual(inbox.inboxPending([a, b], [{ id: 'compra_1', origenCorreoId: a.id }]).map(x => x.id), [b.id]);
  assert.equal(inbox.compraFromCorreo([{ id: 'k', origenCorreoId: a.id }], a.id).id, 'k');
});

test('textoParaParseo incluye remitente, asunto, fecha y cuerpo', () => {
  const t = inbox.textoParaParseo(inbox.normalizeCorreo(HOMECENTER));
  assert.match(t, /De: Homecenter/);
  assert.match(t, /Asunto: Confirmación/);
  assert.match(t, /Fecha: 2026-10-30/);
  assert.match(t, /Cal agrícola/);
});

test('droppedLines: avisa las líneas que no se registrarían, ignora la fila vacía', () => {
  const out = inbox.droppedLines([
    { uid: 1, ingId: '', kg: '', precio: '' },
    { uid: 2, ingId: '', kg: '3', precio: '1000', textoOriginal: 'Guantes nitrilo' },
    { uid: 3, ingId: 'cal', kg: '', precio: '500' },
    { uid: 4, ingId: 'cal', kg: '25', precio: '1500' },
  ]);
  assert.deepEqual(out, [
    { uid: 2, motivo: 'sin ingrediente', texto: 'Guantes nitrilo' },
    { uid: 3, motivo: 'sin kilos', texto: '' },
  ]);
});

test('compactCorreos: quita el cuerpo de lo que ya salió de la bandeja, conserva lo nuevo', () => {
  const nueva = inbox.normalizeCorreo(HOMECENTER);
  const importada = { ...inbox.normalizeCorreo({ ...HOMECENTER, messageId: 'z@x' }), estado: 'importada' };
  const [n, i] = inbox.compactCorreos([nueva, importada]);
  assert.equal(n.cuerpo, nueva.cuerpo);
  assert.equal(i.cuerpo, '');
  assert.equal(i.id, importada.id);
  assert.equal(i.estado, 'importada');
});

test('ultimoImportadoGmail: sólo cuenta lo que trajo la función programada', () => {
  const a = { ...inbox.normalizeCorreo({ ...HOMECENTER, origen: 'gmail', importadoEn: '2026-10-30T10:00:00Z' }) };
  const b = { ...inbox.normalizeCorreo({ ...HOMECENTER, messageId: 'q@x', origen: 'gmail', importadoEn: '2026-10-31T10:00:00Z' }) };
  const archivo = { ...inbox.normalizeCorreo({ ...HOMECENTER, messageId: 'r@x', importadoEn: '2026-11-30T10:00:00Z' }) };
  assert.equal(inbox.ultimoImportadoGmail([a, b, archivo]), '2026-10-31T10:00:00Z');
  assert.equal(inbox.ultimoImportadoGmail([archivo]), null);
});

// ── Facturas adjuntas ────────────────────────────────────────────────────

const FACTURA = {
  tipo: 'factura', numero: 'SETP990001234', fecha: '2026-10-28',
  proveedor: 'Agroinsumos Ficticios S.A.S.', nit: '900000001', moneda: 'COP', total: 161840,
  lineas: [
    { descripcion: 'Cal agrícola dolomita', cantidad: 50, unidad: 'kg', unidadCodigo: 'KGM', precioUnitario: 2000, total: 100000, kg: 50, precioKg: 2000 },
    { descripcion: 'Bolsas de polipropileno x100', cantidad: 2, unidad: 'und', unidadCodigo: '94', precioUnitario: 15000, total: 30000 },
  ],
  lineasOmitidas: 0,
};
const DIAN = { ...HOMECENTER, subject: 'Factura electrónica SETP990001234', body: 'Adjunto factura. Cal agrícola 50 kg', factura: FACTURA, adjuntos: [{ nombre: 'z.zip', tipo: 'zip', bytes: 1200, estado: 'leido' }] };

test('textoParaParseo: con líneas del XML usa las líneas y no el cuerpo', () => {
  const t = inbox.textoParaParseo(inbox.normalizeCorreo(DIAN));
  assert.match(t, /Factura electrónica SETP990001234 del 2026-10-28/);
  assert.match(t, /Proveedor: Agroinsumos Ficticios S\.A\.S\. \(NIT 900000001\)/);
  assert.match(t, /- Cal agrícola dolomita — 50 kg — \$2\.000 por kg — total \$100\.000 antes de IVA/);
  assert.match(t, /- Bolsas de polipropileno x100 — 2 und — \$15\.000 por und/);
  // El cuerpo repetiría la cal: no entra.
  assert.doesNotMatch(t, /Adjunto factura/);
});

test('textoParaParseo: sin XML usa el texto del PDF; sin nada, el cuerpo', () => {
  const pdf = inbox.normalizeCorreo({ ...HOMECENTER, body: 'adjunto factura', adjuntoTexto: 'FACTURA SETP1\nYeso 20 kg $1.800' });
  assert.match(inbox.textoParaParseo(pdf), /Factura adjunta \(PDF\):\nFACTURA SETP1/);
  assert.doesNotMatch(inbox.textoParaParseo(pdf), /adjunto factura/);
  const solo = inbox.normalizeCorreo({ ...HOMECENTER, factura: { ...FACTURA, lineas: [] } });
  assert.match(inbox.textoParaParseo(solo), /Cal agrícola 25 kg — \$38\.000/);
  // Una nota crédito no se lee como compra.
  const nc = inbox.normalizeCorreo({ ...HOMECENTER, factura: { ...FACTURA, tipo: 'nota_credito' } });
  assert.equal(inbox.tieneLineasFactura(nc), false);
  assert.match(inbox.textoParaParseo(nc), /Cal agrícola 25 kg/);
});

test('normalizeCorreo: la factura y los adjuntos pasan con topes; basura se descarta', () => {
  const c = inbox.normalizeCorreo({
    ...DIAN,
    factura: { ...FACTURA, numero: 'x'.repeat(500), lineas: Array.from({ length: 400 }, () => ({ descripcion: 'y'.repeat(900), cantidad: 'no', kg: 2 })) },
    adjuntos: Array.from({ length: 50 }, () => ({ nombre: 'n'.repeat(900), tipo: 'pdf', bytes: -3, estado: 'leido' })),
    adjuntoTexto: 'z'.repeat(20000),
  });
  assert.equal(c.factura.numero.length, 60);
  assert.equal(c.factura.lineas.length, 150);
  assert.equal(c.factura.lineasOmitidas, 250);
  assert.equal(c.factura.lineas[0].descripcion.length, 200);
  assert.equal(c.factura.lineas[0].cantidad, null);
  assert.equal(c.adjuntos.length, 20);
  assert.equal(c.adjuntos[0].bytes, 0);
  assert.equal(c.adjuntoTexto.length, 6000);
  assert.equal(inbox.normalizeCorreo({ ...HOMECENTER, factura: { tipo: 'otra' } }).factura, null);
  assert.deepEqual(inbox.normalizeCorreo(HOMECENTER).adjuntos, []);
  // El peor caso, con todos los topes llenos, cabe holgado en Firestore (1 MiB).
  assert.ok(Buffer.byteLength(JSON.stringify(c)) < inbox.MAX_BYTES_DOC);
});

test('ajustarTamano: suelta texto del PDF y líneas antes de pasarse del tope', () => {
  const c = inbox.normalizeCorreo({ ...DIAN, adjuntoTexto: 'p'.repeat(6000) });
  assert.equal(inbox.ajustarTamano(c), c);
  const chico = inbox.ajustarTamano(c, 1500);
  assert.equal(chico.adjuntoTexto, '');
  assert.ok(Buffer.byteLength(JSON.stringify(chico)) <= 1500);
  assert.equal(chico.factura.lineas.length + chico.factura.lineasOmitidas, 2);
});

test('compactCorreos: también quita la factura y el texto del PDF de lo que ya salió', () => {
  const nueva = inbox.normalizeCorreo({ ...DIAN, adjuntoTexto: 'pdf' });
  const [i] = inbox.compactCorreos([{ ...nueva, estado: inbox.ESTADOS.IMPORTADA }]);
  assert.equal(i.factura, null);
  assert.equal(i.adjuntoTexto, '');
  assert.deepEqual(inbox.compactCorreos([nueva])[0].factura, nueva.factura);
});

test('resumenAdjuntos: dice qué se leyó del adjunto', () => {
  assert.equal(inbox.resumenAdjuntos(inbox.normalizeCorreo(DIAN)), 'Factura electrónica SETP990001234: 2 ítems leídos del XML.');
  assert.equal(inbox.resumenAdjuntos(inbox.normalizeCorreo({ ...HOMECENTER, adjuntoTexto: 'x' })), 'Factura en PDF adjunto: se lee su texto.');
  assert.equal(inbox.resumenAdjuntos(inbox.normalizeCorreo({ ...HOMECENTER, factura: { ...FACTURA, tipo: 'nota_credito', numero: 'NC1' } })), 'Nota crédito NC1 adjunta: no es una compra.');
  assert.match(inbox.resumenAdjuntos(inbox.normalizeCorreo({ ...HOMECENTER, adjuntos: [{ nombre: 'f.pdf', tipo: 'pdf', bytes: 3, estado: 'sin_leer' }] })), /Adjunto sin leer \(f\.pdf\)/);
  assert.equal(inbox.resumenAdjuntos(inbox.normalizeCorreo(HOMECENTER)), '');
});
