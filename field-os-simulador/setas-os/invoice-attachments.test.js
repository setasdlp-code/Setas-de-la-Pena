'use strict';

// Lectura de facturas adjuntas (functions/invoice-attachments.js). Todas las
// facturas, ZIP y PDF de aquí son sintéticos: ningún correo real.
const test = require('node:test');
const assert = require('node:assert/strict');
const zlib = require('zlib');
const att = require('./functions/invoice-attachments.js');

// ── Fábricas sintéticas ──────────────────────────────────────────────────

/** ZIP mínimo (sin CRC: el lector no lo exige). `store` guarda sin comprimir. */
function zip(entries) {
  const locales = [];
  const centrales = [];
  let off = 0;
  for (const { name, data, store } of entries) {
    const n = Buffer.from(name, 'utf8');
    const raw = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const comp = store ? raw : zlib.deflateRawSync(raw);
    const loc = Buffer.alloc(30);
    loc.writeUInt32LE(0x04034b50, 0); loc.writeUInt16LE(20, 4); loc.writeUInt16LE(store ? 0 : 8, 8);
    loc.writeUInt32LE(comp.length, 18); loc.writeUInt32LE(raw.length, 22); loc.writeUInt16LE(n.length, 26);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(store ? 0 : 8, 10);
    cen.writeUInt32LE(comp.length, 20); cen.writeUInt32LE(raw.length, 24); cen.writeUInt16LE(n.length, 28); cen.writeUInt32LE(off, 42);
    locales.push(loc, n, comp);
    centrales.push(cen, n);
    off += 30 + n.length + comp.length;
  }
  const cd = Buffer.concat(centrales);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(off, 16);
  return Buffer.concat([...locales, cd, eocd]);
}

const linea = ({ id, desc, cant, unit, precio, base = '1.00', total }) => `
  <cac:InvoiceLine>
    <cbc:ID>${id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${unit}">${cant}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${total}</cbc:LineExtensionAmount>
    <cac:TaxTotal><cbc:TaxAmount currencyID="COP">999.00</cbc:TaxAmount>
      <cac:TaxSubtotal><cbc:TaxableAmount currencyID="COP">${total}</cbc:TaxableAmount><cbc:TaxAmount currencyID="COP">999.00</cbc:TaxAmount>
      <cac:TaxCategory><cbc:Percent>19.00</cbc:Percent><cac:TaxScheme><cbc:ID>01</cbc:ID><cbc:Name>IVA</cbc:Name></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${desc}</cbc:Description>
      <cac:StandardItemIdentification><cbc:ID schemeID="999">SKU-${id}</cbc:ID></cac:StandardItemIdentification>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${precio}</cbc:PriceAmount>
      <cbc:BaseQuantity unitCode="${unit}">${base}</cbc:BaseQuantity>
    </cac:Price>
  </cac:InvoiceLine>`;

const invoice = ({ raiz = 'Invoice', lineas = [], numero = 'SETP990001234' } = {}) => `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<${raiz} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${raiz}-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent>
    <sts:DianExtensions xmlns:sts="dian:gov:co:facturaelectronica:Structures-2-1">
      <sts:InvoiceSource><cbc:IdentificationCode listAgencyID="6">CO</cbc:IdentificationCode></sts:InvoiceSource>
      <sts:SoftwareProvider><sts:ProviderID>800000000</sts:ProviderID></sts:SoftwareProvider>
    </sts:DianExtensions>
  </ext:ExtensionContent></ext:UBLExtension></ext:UBLExtensions>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>10</cbc:CustomizationID>
  <cbc:ProfileExecutionID>2</cbc:ProfileExecutionID>
  <cbc:ID>${numero}</cbc:ID>
  <cbc:UUID schemeName="CUFE-SHA384">abc123</cbc:UUID>
  <cbc:IssueDate>2026-10-28</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty><cbc:AdditionalAccountID>1</cbc:AdditionalAccountID><cac:Party>
    <cac:PartyName><cbc:Name>Agroinsumos Ficticios</cbc:Name></cac:PartyName>
    <cac:PartyTaxScheme><cbc:RegistrationName>Agroinsumos Ficticios S.A.S. &amp; Cía</cbc:RegistrationName>
      <cbc:CompanyID schemeAgencyID="195" schemeID="7" schemeName="31">900000001</cbc:CompanyID></cac:PartyTaxScheme>
  </cac:Party></cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty><cac:Party><cac:PartyTaxScheme><cbc:RegistrationName>Cliente de Prueba</cbc:RegistrationName>
    <cbc:CompanyID>111111111</cbc:CompanyID></cac:PartyTaxScheme></cac:Party></cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">136000.00</cbc:LineExtensionAmount>
    <cbc:PayableAmount currencyID="COP">161840.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${lineas.join('')}
</${raiz}>`;

const LINEAS = [
  linea({ id: 1, desc: 'Cal agrícola dolomita bulto', cant: '50.00', unit: 'KGM', precio: '2000.00', total: '100000.00' }),
  linea({ id: 2, desc: 'Yeso agrícola &lt;fino&gt;', cant: '20000', unit: 'GRM', precio: '1.80', total: '36000.00' }),
  linea({ id: 3, desc: 'Bolsas de polipropileno x100', cant: '2', unit: '94', precio: '30000.00', base: '2', total: '30000.00' }),
];

// El sobre que de verdad manda la DIAN: la factura va como CDATA dentro de un
// AttachedDocument, junto con la respuesta de validación (que no es la factura).
const attached = inv => `<?xml version="1.0" encoding="UTF-8"?>
<AttachedDocument xmlns="urn:oasis:names:specification:ubl:schema:xsd:AttachedDocument-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>AD-1</cbc:ID>
  <cac:SenderParty><cac:PartyTaxScheme><cbc:RegistrationName>Agroinsumos Ficticios</cbc:RegistrationName></cac:PartyTaxScheme></cac:SenderParty>
  <cac:Attachment><cac:ExternalReference><cbc:MimeCode>text/xml</cbc:MimeCode>
    <cbc:Description><![CDATA[${inv}]]></cbc:Description>
  </cac:ExternalReference></cac:Attachment>
  <cac:ParentDocumentLineReference><cbc:LineID>1</cbc:LineID><cac:DocumentReference><cbc:ID>SETP990001234</cbc:ID>
    <cac:Attachment><cac:ExternalReference><cbc:Description><![CDATA[<?xml version="1.0"?><ApplicationResponse><cbc:ID>1</cbc:ID></ApplicationResponse>]]></cbc:Description></cac:ExternalReference></cac:Attachment>
  </cac:DocumentReference></cac:ParentDocumentLineReference>
</AttachedDocument>`;

const escapeXml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── XML ──────────────────────────────────────────────────────────────────

test('parseDianXml: factura UBL suelta → cabecera y líneas', () => {
  const f = att.parseDianXml(invoice({ lineas: LINEAS }));
  assert.equal(f.tipo, 'factura');
  assert.equal(f.numero, 'SETP990001234');
  assert.equal(f.fecha, '2026-10-28');
  assert.equal(f.proveedor, 'Agroinsumos Ficticios S.A.S. & Cía');
  assert.equal(f.nit, '900000001');
  assert.equal(f.moneda, 'COP');
  assert.equal(f.total, 161840);
  assert.equal(f.lineas.length, 3);
  assert.deepEqual(f.lineas[0], {
    descripcion: 'Cal agrícola dolomita bulto', cantidad: 50, unidad: 'kg', unidadCodigo: 'KGM',
    precioUnitario: 2000, total: 100000, kg: 50, precioKg: 2000,
  });
  // Gramos → kilos, y el precio por gramo → precio por kilo.
  assert.equal(f.lineas[1].descripcion, 'Yeso agrícola <fino>');
  assert.equal(f.lineas[1].kg, 20);
  assert.equal(f.lineas[1].precioKg, 1800);
  // BaseQuantity 2: el precio es por 2 unidades.
  assert.equal(f.lineas[2].unidad, 'und');
  assert.equal(f.lineas[2].precioUnitario, 15000);
  assert.equal(f.lineas[2].kg, undefined);
});

test('parseDianXml: AttachedDocument con la factura en CDATA (ignora la ApplicationResponse)', () => {
  const f = att.parseDianXml(attached(invoice({ lineas: LINEAS })));
  assert.equal(f.tipo, 'factura');
  assert.equal(f.lineas.length, 3);
  assert.equal(f.numero, 'SETP990001234');
});

test('parseDianXml: AttachedDocument con la factura escapada (sin CDATA)', () => {
  const inv = invoice({ lineas: LINEAS });
  const xml = attached('X').replace('<![CDATA[X]]>', escapeXml(inv));
  const f = att.parseDianXml(xml);
  assert.equal(f.lineas.length, 3);
  assert.equal(f.lineas[1].descripcion, 'Yeso agrícola <fino>');
});

test('parseDianXml: una nota crédito no trae líneas de compra', () => {
  const nc = invoice({ raiz: 'CreditNote', numero: 'NC-1' }).replace('</CreditNote>',
    '<cac:CreditNoteLine><cbc:ID>1</cbc:ID><cbc:CreditedQuantity unitCode="KGM">5</cbc:CreditedQuantity><cac:Item><cbc:Description>Devolución</cbc:Description></cac:Item></cac:CreditNoteLine></CreditNote>');
  const f = att.parseDianXml(nc);
  assert.equal(f.tipo, 'nota_credito');
  assert.deepEqual(f.lineas, []);
});

test('parseDianXml: XML que no es de la DIAN → null; entidades externas no se resuelven', () => {
  assert.equal(att.parseDianXml('<html><body>hola</body></html>'), null);
  assert.equal(att.parseDianXml(''), null);
  const xxe = invoice({ lineas: [linea({ id: 1, desc: '&xxe;', cant: '1', unit: 'KGM', precio: '1', total: '1' })] })
    .replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '<?xml version="1.0"?><!DOCTYPE Invoice [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>');
  const f = att.parseDianXml(xxe);
  // La factura se lee, pero la entidad queda literal: nunca se abre un archivo.
  assert.equal(f.lineas[0].descripcion, '&xxe;');
});

test('parseDianXml: respeta el tope de líneas y de largo de descripción', () => {
  const muchas = Array.from({ length: 160 }, (_, i) => linea({ id: i + 1, desc: 'x'.repeat(500), cant: '1', unit: 'KGM', precio: '1', total: '1' }));
  const f = att.parseDianXml(invoice({ lineas: muchas }));
  assert.equal(f.lineas.length, att.LIMITES.maxLineas);
  assert.equal(f.lineasOmitidas, 10);
  assert.ok(f.lineas[0].descripcion.length <= att.LIMITES.maxDescripcion);
});

// ── ZIP ──────────────────────────────────────────────────────────────────

test('leerZip: entradas deflate y stored, filtro por nombre', () => {
  const z = zip([
    { name: 'fv0900000001.xml', data: '<a/>' },
    { name: 'fv0900000001.pdf', data: '%PDF-1.4', store: true },
    { name: 'carpeta/', data: '' },
    { name: 'leeme.txt', data: 'nada' },
  ]);
  const e = att.leerZip(z, { filtro: n => /\.(xml|pdf)$/.test(n) });
  assert.deepEqual(e.map(x => [x.nombre, x.datos.toString()]), [['fv0900000001.xml', '<a/>'], ['fv0900000001.pdf', '%PDF-1.4']]);
});

test('leerZip: una bomba de compresión se salta sin agotar memoria', () => {
  const z = zip([{ name: 'bomba.xml', data: Buffer.alloc(8 * 1024 * 1024, 0x41) }]);
  // El encabezado dice 8 MB; si mintiera, maxOutputLength corta igual.
  assert.deepEqual(att.leerZip(z), []);
  const mentiroso = zip([{ name: 'bomba.xml', data: Buffer.alloc(8 * 1024 * 1024, 0x41) }]);
  const cen = mentiroso.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  mentiroso.writeUInt32LE(10, cen + 24); // tamaño descomprimido falso
  assert.deepEqual(att.leerZip(mentiroso), []);
});

test('leerZip: lo que no es ZIP lanza', () => {
  assert.throws(() => att.leerZip(Buffer.from('no soy un zip, sólo texto suficiente para pasar el mínimo')));
});

// ── Correo completo ──────────────────────────────────────────────────────

const adj = (filename, contentType, content) => ({ filename, contentType, content: Buffer.isBuffer(content) ? content : Buffer.from(content) });

test('leerAdjuntos: ZIP DIAN (PDF + XML) → líneas del XML, el PDF no se lee', async () => {
  let llamadasPdf = 0;
  const r = await att.leerAdjuntos([
    adj('logo.png', 'image/png', Buffer.alloc(10)),
    adj('z900000001.zip', 'application/zip', zip([
      { name: 'fv0900000001.pdf', data: '%PDF-1.4 sintetico' },
      { name: 'ad0900000001.xml', data: attached(invoice({ lineas: LINEAS })) },
    ])),
  ], { pdfToText: async () => { llamadasPdf++; return 'texto'; } });
  assert.equal(llamadasPdf, 0);
  assert.equal(r.factura.lineas.length, 3);
  assert.equal(r.adjuntoTexto, '');
  assert.deepEqual(r.adjuntos.map(a => [a.tipo, a.estado]), [['zip', 'leido'], ['pdf', 'sin_leer']]);
});

test('leerAdjuntos: PDF suelto → texto del PDF (recortado)', async () => {
  const r = await att.leerAdjuntos([adj('factura.pdf', 'application/pdf', '%PDF-1.4')], {
    pdfToText: async buf => { assert.ok(Buffer.isBuffer(buf)); return 'FACTURA SETP1\nCal agrícola 50 kg $2.000\n' + 'z'.repeat(10000); },
  });
  assert.equal(r.factura, null);
  assert.ok(r.adjuntoTexto.startsWith('FACTURA SETP1'));
  assert.ok(r.adjuntoTexto.length <= att.LIMITES.maxTextoPdf);
  assert.equal(r.adjuntos[0].estado, 'leido');
});

test('leerAdjuntos: nunca lanza; adjuntos ilegibles quedan marcados', async () => {
  const r = await att.leerAdjuntos([
    adj('roto.zip', 'application/zip', 'esto no es un zip pero tiene más de veintidós bytes'),
    adj('roto.pdf', 'application/pdf', 'x'),
    adj('otro.xml', 'text/xml', '<html/>'),
    null,
    { filename: 'sin-contenido.pdf' },
  ], { pdfToText: async () => { throw new Error('pdf dañado'); } });
  assert.equal(r.factura, null);
  assert.equal(r.adjuntoTexto, '');
  assert.deepEqual(r.adjuntos.map(a => a.estado), ['ilegible', 'ilegible', 'sin_lineas']);
});

test('leerAdjuntos: sin pdfToText el PDF queda registrado pero sin leer', async () => {
  const r = await att.leerAdjuntos([adj('f.pdf', 'application/pdf', '%PDF')]);
  assert.deepEqual(r.adjuntos, [{ nombre: 'f.pdf', tipo: 'pdf', bytes: 4, estado: 'sin_leer' }]);
});
