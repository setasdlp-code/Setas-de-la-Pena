'use strict';

/**
 * @file gmail-imap.js — Lee correos recientes de Gmail por IMAP.
 *
 * Usa una contraseña de aplicación de Google (la misma que fetch_gmail.py),
 * guardada como secreto de Firebase: nunca vive en el repositorio. Sólo lee;
 * no marca, mueve ni borra correos.
 *
 * Las facturas electrónicas de la DIAN llegan como adjunto (ZIP con PDF + XML,
 * o PDF suelto) y el cuerpo sólo dice "adjunto factura": los adjuntos se leen
 * con invoice-attachments.js y al correo se le agrega `factura` (líneas del
 * XML), `adjuntos` (qué llegó) y `adjuntoTexto` (texto del PDF).
 */

const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { leerAdjuntos } = require('./invoice-attachments.js');

const MAX_MENSAJES = 200;
const MAX_TEXTO = 6000;

const stripHtml = html => String(html || '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|tr|div|li)>/gi, '\n')
  .replace(/<\/td>/gi, ' | ')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'")
  .replace(/\n{3,}/g, '\n\n')
  .trim();

/**
 * Texto de un PDF con pdf-parse (se carga al primer uso: la mayoría de las
 * corridas no traen PDFs sin XML). Quita los separadores de página que agrega.
 */
async function pdfToText(buf) {
  let parser;
  try {
    const { PDFParse } = require('pdf-parse');
    parser = new PDFParse({ data: new Uint8Array(buf) });
    const r = await parser.getText();
    return String((r && r.text) || '').replace(/^-- \d+ of \d+ --$/gm, '').trim();
  } catch (err) {
    // leerAdjuntos no lanza: sin esto, una instalación rota de pdf-parse sólo
    // se vería como PDFs "ilegibles" en la bandeja.
    console.warn('[importarCorreosCompra] no se pudo leer un PDF adjunto:', err && err.message);
    throw err;
  } finally {
    if (parser) await parser.destroy().catch(() => {});
  }
}

/**
 * @returns {(q: {since: Date, senders: string[]}) => Promise<Array>}
 */
function createGmailFetcher({ user, password }) {
  return async function fetchMessages({ since, senders }) {
    if (!user || !password) throw new Error('Falta GMAIL_USER o el secreto GMAIL_APP_PASSWORD.');
    if (!senders || !senders.length) return [];
    const client = new ImapFlow({
      host: 'imap.gmail.com', port: 993, secure: true,
      auth: { user, pass: password },
      logger: false,
    });
    await client.connect();
    const out = [];
    try {
      const lock = await client.getMailboxLock('INBOX', { readOnly: true });
      try {
        const query = senders.length === 1
          ? { since, from: senders[0] }
          : { since, or: senders.map(s => ({ from: s })) };
        const uids = (await client.search(query, { uid: true })) || [];
        const recientes = uids.slice(-MAX_MENSAJES);
        if (!recientes.length) return out;
        for await (const msg of client.fetch(recientes, { source: true }, { uid: true })) {
          const parsed = await simpleParser(msg.source);
          const { factura, adjuntos, adjuntoTexto } = await leerAdjuntos(parsed.attachments || [], { pdfToText });
          out.push({
            messageId: parsed.messageId || '',
            from: parsed.from ? parsed.from.text : '',
            subject: parsed.subject || '',
            date: parsed.date ? parsed.date.toISOString() : null,
            text: String(parsed.text || stripHtml(parsed.html)).slice(0, MAX_TEXTO),
            factura,
            adjuntos,
            adjuntoTexto,
          });
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => {});
    }
    return out;
  };
}

module.exports = { createGmailFetcher, stripHtml, pdfToText };
