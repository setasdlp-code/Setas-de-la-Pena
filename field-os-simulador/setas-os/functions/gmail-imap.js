'use strict';

/**
 * @file gmail-imap.js — Lee correos recientes de Gmail por IMAP.
 *
 * Usa una contraseña de aplicación de Google (la misma que fetch_gmail.py),
 * guardada como secreto de Firebase: nunca vive en el repositorio. Sólo lee;
 * no marca, mueve ni borra correos.
 */

const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

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
          out.push({
            messageId: parsed.messageId || '',
            from: parsed.from ? parsed.from.text : '',
            subject: parsed.subject || '',
            date: parsed.date ? parsed.date.toISOString() : null,
            text: String(parsed.text || stripHtml(parsed.html)).slice(0, MAX_TEXTO),
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

module.exports = { createGmailFetcher, stripHtml };
