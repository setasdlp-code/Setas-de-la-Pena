'use strict';

/**
 * @file invoice-attachments.js — Lee las facturas que llegan como adjunto.
 *
 * Una factura electrónica de la DIAN casi nunca viene en el cuerpo del correo
 * ("adjunto factura"): viene como un ZIP con el PDF y el XML (UBL 2.1), o como
 * un PDF suelto. Este módulo saca de esos adjuntos lo que el lector de
 * facturas necesita — las líneas (descripción, cantidad, unidad, precio
 * unitario) y un resumen (número, fecha, proveedor, NIT, total) — en un objeto
 * pequeño que cabe holgado en un documento de `correos_compra`.
 *
 * Sin dependencias (sólo `zlib` de Node), para que las pruebas corran con
 * `node --test` sin instalar nada. gmail-imap.js le pasa los adjuntos que
 * entrega mailparser.
 *
 * SEGURIDAD — el XML y el ZIP vienen de un tercero:
 *   - El XML no pasa por un parser con entidades (nada de XXE ni "billion
 *     laughs"): se recorre con expresiones acotadas y sólo se decodifican las
 *     cinco entidades predefinidas y las numéricas.
 *   - El ZIP se lee con topes de entradas, tamaño por entrada y tamaño total;
 *     `inflateRawSync` corta en `maxOutputLength` (bombas de compresión).
 *   - Nada de esto registra una compra: el resultado sólo prellena el
 *     formulario que una persona revisa.
 */

const zlib = require('zlib');

const LIMITES = Object.freeze({
  maxAdjuntos: 10,             // adjuntos por correo que se miran
  maxBytesAdjunto: 15 * 1024 * 1024,
  maxEntradasZip: 50,
  maxBytesEntrada: 5 * 1024 * 1024,   // descomprimido, por entrada
  maxBytesZip: 20 * 1024 * 1024,      // descomprimido, total
  maxLineas: 150,
  maxDescripcion: 200,
  maxTextoPdf: 6000,
});

// ── ZIP ───────────────────────────────────────────────────────────────────

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

/**
 * Entradas de un ZIP: [{nombre, datos: Buffer}]. Sólo las que pasa `filtro`
 * (por nombre). Lanza si el archivo no es un ZIP legible; las entradas que
 * exceden los topes o usan un método desconocido se saltan.
 */
function leerZip(buf, { filtro = () => true, limites = LIMITES } = {}) {
  if (!Buffer.isBuffer(buf) || buf.length < 22) throw new Error('ZIP vacío o truncado');
  // El registro de fin de directorio está en los últimos 22 + 65535 bytes.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('ZIP sin directorio central');
  const total = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = [];
  let usados = 0;
  for (let n = 0; n < total && n < limites.maxEntradasZip; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== CEN_SIG) break;
    const metodo = buf.readUInt16LE(p + 10);
    const comprimido = buf.readUInt32LE(p + 20);
    const tamano = buf.readUInt32LE(p + 24);
    const lenNombre = buf.readUInt16LE(p + 28);
    const lenExtra = buf.readUInt16LE(p + 30);
    const lenComent = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const nombre = buf.slice(p + 46, p + 46 + lenNombre).toString('utf8');
    p += 46 + lenNombre + lenExtra + lenComent;

    if (nombre.endsWith('/') || !filtro(nombre)) continue;
    if (tamano > limites.maxBytesEntrada || usados + tamano > limites.maxBytesZip) continue;
    if (local + 30 > buf.length || buf.readUInt32LE(local) !== LOC_SIG) continue;
    const inicio = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const crudo = buf.slice(inicio, inicio + comprimido);
    let datos;
    try {
      if (metodo === 0) datos = crudo;
      else if (metodo === 8) datos = zlib.inflateRawSync(crudo, { maxOutputLength: limites.maxBytesEntrada });
      else continue;
    } catch (_) { continue; }
    usados += datos.length;
    out.push({ nombre, datos });
  }
  return out;
}

// ── XML (UBL 2.1 de la DIAN) ─────────────────────────────────────────────

const decodeEntities = s => String(s || '')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&');
function safeChar(cp) {
  try { return Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ''; } catch (_) { return ''; }
}

/** Texto plano de un nodo: CDATA desenvuelto, entidades decodificadas, espacios colapsados. */
const textoNodo = s => {
  const raw = String(s || '');
  const cdata = raw.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return (cdata ? cdata[1] : decodeEntities(raw.replace(/<[^>]*>/g, ' '))).replace(/\s+/g, ' ').trim();
};

const tagRe = (tag, flags = '') => new RegExp(`<(?:[\\w.-]+:)?${tag}\\b([^>]*)>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}\\s*>`, flags);

/** Primer elemento `tag` (con o sin prefijo de espacio de nombres): {attrs, inner} o null. */
const primero = (xml, tag) => {
  const m = String(xml || '').match(tagRe(tag));
  return m ? { attrs: m[1], inner: m[2] } : null;
};
const todos = (xml, tag) => [...String(xml || '').matchAll(tagRe(tag, 'g'))].map(m => ({ attrs: m[1], inner: m[2] }));
const texto = (xml, tag) => { const n = primero(xml, tag); return n ? textoNodo(n.inner) : ''; };
const attr = (attrs, name) => { const m = String(attrs || '').match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"|\\b${name}\\s*=\\s*'([^']*)'`)); return m ? decodeEntities(m[1] ?? m[2]) : ''; };
const num = s => { const n = parseFloat(String(s || '').trim()); return Number.isFinite(n) ? n : null; };

// Códigos de unidad UN/ECE (rec. 20) que usan las facturas colombianas.
const UNIDADES = Object.freeze({
  KGM: 'kg', GRM: 'g', TNE: 't', LBR: 'lb', MGM: 'mg',
  LTR: 'L', MLT: 'mL', MTQ: 'm³',
  MTR: 'm', CMT: 'cm', MTK: 'm²',
  NIU: 'und', EA: 'und', C62: 'und', '94': 'und', H87: 'und', ZZ: 'und', UN: 'und',
  BG: 'bolsa', BX: 'caja', PK: 'paquete', SA: 'saco', DZN: 'docena', PR: 'par', SET: 'juego', RO: 'rollo',
});
// A kilogramos, cuando la unidad es de masa.
const A_KG = Object.freeze({ KGM: 1, GRM: 0.001, TNE: 1000, LBR: 0.45359237, MGM: 1e-6 });

const TIPOS = Object.freeze({ Invoice: 'factura', CreditNote: 'nota_credito', DebitNote: 'nota_debito' });

/**
 * El documento DIAN dentro de un XML. Casi siempre llega envuelto en un
 * `AttachedDocument`, con la factura real como texto (CDATA o escapado) en un
 * `cbc:Description`. Ese mismo sobre trae también la respuesta de validación
 * de la DIAN (`ApplicationResponse`), que no es la factura.
 * Devuelve {tipo, xml} o null.
 */
function desenvolverDian(xml) {
  const s = String(xml || '');
  const raiz = s.replace(/^﻿/, '').replace(/<\?xml[\s\S]*?\?>/, '').replace(/<!--[\s\S]*?-->/g, '')
    // Un DOCTYPE no se interpreta: se quita, y "&entidad;" queda literal.
    .replace(/<!DOCTYPE[^\[>]*(\[[\s\S]*?\])?\s*>/i, '').trimStart();
  const m = raiz.match(/^<(?:[\w.-]+:)?(\w+)\b/);
  const nombre = m ? m[1] : '';
  if (TIPOS[nombre]) return { tipo: TIPOS[nombre], xml: raiz };
  if (nombre !== 'AttachedDocument') return null;
  // Candidatos: bloques CDATA (pueden contener `</cbc:Description>` adentro,
  // así que se buscan primero) y luego Descriptions escapadas.
  const candidatos = [...s.matchAll(/<!\[CDATA\[([\s\S]*?)\]\]>/g)].map(x => x[1]);
  for (const d of todos(s.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, ''), 'Description')) candidatos.push(decodeEntities(d.inner));
  for (const c of candidatos) {
    const dentro = desenvolverDian(c);
    if (dentro) return dentro;
  }
  return null;
}

const recorta = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const redondea = (n, d = 4) => (n == null ? null : Math.round(n * 10 ** d) / 10 ** d);

/**
 * Resumen y líneas de una factura electrónica DIAN. Devuelve null si el XML no
 * es una factura, nota crédito o nota débito.
 *
 * Una nota crédito no es una compra: se devuelve con su tipo, para que la
 * bandeja lo diga, pero sin líneas.
 */
function parseDianXml(xml, { limites = LIMITES } = {}) {
  const doc = desenvolverDian(xml);
  if (!doc) return null;
  const x = doc.xml;
  const lineaTag = { factura: 'InvoiceLine', nota_credito: 'CreditNoteLine', nota_debito: 'DebitNoteLine' }[doc.tipo];
  const cantTag = { factura: 'InvoicedQuantity', nota_credito: 'CreditedQuantity', nota_debito: 'DebitedQuantity' }[doc.tipo];

  // Cabecera: todo lo que está antes de la primera línea (las líneas también
  // tienen cbc:ID y montos que no son los del documento).
  const corte = x.search(new RegExp(`<(?:[\\w.-]+:)?${lineaTag}\\b`));
  const cab = corte >= 0 ? x.slice(0, corte) : x;
  const sinFirma = cab.replace(tagRe('UBLExtensions', 'g'), '');
  const prov = primero(sinFirma, 'AccountingSupplierParty');
  const provXml = prov ? prov.inner : '';
  const nitNodo = primero(provXml, 'CompanyID');
  const totales = primero(sinFirma, 'LegalMonetaryTotal');
  const pagable = totales ? primero(totales.inner, 'PayableAmount') : null;

  const lineas = [];
  let omitidas = 0;
  if (doc.tipo !== 'nota_credito') {
    for (const l of todos(x, lineaTag)) {
      if (lineas.length >= limites.maxLineas) { omitidas++; continue; }
      const sinImpuestos = l.inner.replace(tagRe('TaxTotal', 'g'), '').replace(tagRe('WithholdingTaxTotal', 'g'), '');
      const cant = primero(sinImpuestos, cantTag);
      const item = primero(sinImpuestos, 'Item');
      const precio = primero(sinImpuestos, 'Price');
      const codigo = cant ? attr(cant.attrs, 'unitCode').toUpperCase() : '';
      const cantidad = cant ? num(textoNodo(cant.inner)) : null;
      let precioUnitario = precio ? num(texto(precio.inner, 'PriceAmount')) : null;
      const base = precio ? num(texto(precio.inner, 'BaseQuantity')) : null;
      if (precioUnitario != null && base && base > 0) precioUnitario /= base;
      const total = num(texto(sinImpuestos.replace(tagRe('Price', 'g'), ''), 'LineExtensionAmount'));
      if (precioUnitario == null && total != null && cantidad) precioUnitario = total / cantidad;
      const descripcion = recorta(
        (item && (texto(item.inner, 'Description') || texto(item.inner, 'Name'))) || texto(sinImpuestos, 'Note') || '',
        limites.maxDescripcion,
      );
      if (!descripcion && cantidad == null) continue;
      const linea = {
        descripcion,
        cantidad: redondea(cantidad),
        unidad: UNIDADES[codigo] || (codigo ? codigo.toLowerCase() : ''),
        unidadCodigo: codigo || null,
        precioUnitario: redondea(precioUnitario, 2),
        total: redondea(total, 2),
      };
      if (A_KG[codigo] && cantidad != null) {
        linea.kg = redondea(cantidad * A_KG[codigo]);
        if (precioUnitario != null) linea.precioKg = redondea(precioUnitario / A_KG[codigo], 2);
      }
      lineas.push(linea);
    }
  }

  return {
    tipo: doc.tipo,
    numero: recorta(texto(sinFirma, 'ID'), 60),
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(texto(sinFirma, 'IssueDate')) ? texto(sinFirma, 'IssueDate') : null,
    proveedor: recorta(texto(provXml, 'RegistrationName') || texto(provXml, 'Name'), 120),
    nit: nitNodo ? recorta(textoNodo(nitNodo.inner), 20) : '',
    moneda: recorta(texto(sinFirma, 'DocumentCurrencyCode') || (pagable ? attr(pagable.attrs, 'currencyID') : ''), 3) || null,
    total: pagable ? redondea(num(textoNodo(pagable.inner)), 2) : null,
    lineas,
    lineasOmitidas: omitidas,
  };
}

// ── Adjuntos de un correo ────────────────────────────────────────────────

const esPdf = (nombre, tipo) => /\.pdf$/i.test(nombre || '') || /application\/pdf/i.test(tipo || '');
const esZip = (nombre, tipo) => /\.zip$/i.test(nombre || '') || /application\/(x-)?zip/i.test(tipo || '');
const esXml = (nombre, tipo) => /\.xml$/i.test(nombre || '') || /(application|text)\/xml/i.test(tipo || '');

/**
 * Lee los adjuntos de un correo. `adjuntos` es lo que entrega mailparser:
 * [{filename, contentType, content: Buffer}]. `pdfToText` (opcional, async)
 * convierte un PDF en texto; sólo se usa si ningún XML trajo líneas.
 *
 * Devuelve lo que se guarda en el documento:
 *   - adjuntos: [{nombre, tipo, bytes, estado}] — qué llegó y qué se pudo leer;
 *   - factura: resumen y líneas del XML DIAN, o null;
 *   - adjuntoTexto: texto del PDF (recortado) cuando no hubo XML con líneas.
 * Nunca lanza: un adjunto ilegible queda marcado y el correo se importa igual.
 */
async function leerAdjuntos(adjuntos = [], { pdfToText = null, limites = LIMITES } = {}) {
  const resumen = [];
  const xmls = [];
  const pdfs = [];
  const nota = (nombre, tipo, bytes, estado) => {
    const r = { nombre: recorta(String(nombre || '(sin nombre)'), 120), tipo, bytes: bytes || 0, estado };
    resumen.push(r);
    return r;
  };

  for (const a of (adjuntos || []).slice(0, limites.maxAdjuntos)) {
    if (!a || !Buffer.isBuffer(a.content)) continue;
    const nombre = a.filename || '';
    const bytes = a.content.length;
    const tipo = esZip(nombre, a.contentType) ? 'zip' : esXml(nombre, a.contentType) ? 'xml' : esPdf(nombre, a.contentType) ? 'pdf' : null;
    if (!tipo) continue; // imágenes de firma, logos, etc.
    if (bytes > limites.maxBytesAdjunto) { nota(nombre, tipo, bytes, 'muy_grande'); continue; }
    if (tipo === 'xml') { xmls.push({ datos: a.content, r: nota(nombre, 'xml', bytes, 'sin_lineas') }); continue; }
    if (tipo === 'pdf') { pdfs.push({ datos: a.content, r: nota(nombre, 'pdf', bytes, 'sin_leer') }); continue; }
    const r = nota(nombre, 'zip', bytes, 'sin_lineas');
    try {
      const entradas = leerZip(a.content, { filtro: n => esXml(n) || esPdf(n), limites });
      for (const e of entradas) {
        if (esXml(e.nombre)) xmls.push({ datos: e.datos, r });
        else pdfs.push({ datos: e.datos, r: nota(`${nombre} › ${e.nombre}`, 'pdf', e.datos.length, 'sin_leer') });
      }
    } catch (_) {
      r.estado = 'ilegible';
    }
  }

  let factura = null;
  for (const { datos, r } of xmls) {
    let f = null;
    try { f = parseDianXml(datos.toString('utf8'), { limites }); } catch (_) { f = null; }
    if (!f) continue;
    if (f.tipo === 'nota_credito') { r.estado = 'nota_credito'; factura = factura || f; continue; }
    if (f.lineas.length) r.estado = 'leido';
    // Gana el primer documento con líneas.
    if (!factura || (!factura.lineas.length && f.lineas.length)) factura = f;
  }

  let adjuntoTexto = '';
  if (!(factura && factura.lineas.length) && typeof pdfToText === 'function') {
    for (const { datos, r } of pdfs) {
      try {
        const t = String((await pdfToText(datos)) || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
        if (t) {
          r.estado = 'leido';
          adjuntoTexto = recorta(adjuntoTexto ? `${adjuntoTexto}\n\n${t}` : t, limites.maxTextoPdf);
        } else r.estado = 'sin_texto';
      } catch (_) {
        r.estado = 'ilegible';
      }
      if (adjuntoTexto.length >= limites.maxTextoPdf) break;
    }
  }

  return { adjuntos: resumen, factura, adjuntoTexto };
}

module.exports = { LIMITES, UNIDADES, leerZip, desenvolverDian, parseDianXml, leerAdjuntos, decodeEntities };
