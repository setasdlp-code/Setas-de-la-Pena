'use strict';

/**
 * @file gmail-smtp.js — Envía un correo de aviso por el SMTP de Gmail.
 *
 * Usa la misma cuenta y contraseña de aplicación que gmail-imap.js (secreto de
 * Firebase; nunca vive en el repositorio). Solo envía texto plano a los
 * destinatarios configurados.
 */

const nodemailer = require('nodemailer');

/**
 * @returns {(msg: {subject: string, text: string}) => Promise<void>}
 */
function createGmailNotifier({ user, password, to }) {
  const recipients = String(to || '').trim() || user;
  return async function notify({ subject, text }) {
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user, pass: password },
    });
    try {
      await transport.sendMail({ from: user, to: recipients, subject, text });
    } finally {
      transport.close();
    }
  };
}

module.exports = { createGmailNotifier };
