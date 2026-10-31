'use strict';

/**
 * @file purchase-email-inbox.js — Bandeja de correos de compra para Bodega.
 *
 * Los proveedores confirman pedidos por correo (Homecenter, MercadoLibre,
 * Rappi, o un proveedor local que escribe desde Gmail). Antes, la única forma
 * de llevar eso a Bodega era copiar el texto y pegarlo en Compra → "Pegar
 * texto". Este módulo es la mitad pura de la importación automática:
 *
 *   - decide qué correo parece una compra (remitente conocido + asunto);
 *   - le da a cada correo un id estable derivado del encabezado Message-ID,
 *     para que importarlo dos veces (o desde dos equipos, o desde el archivo
 *     de fetch_gmail.py y desde la función programada) no duplique nada;
 *   - proyecta la bandeja: correos nuevos que ninguna compra referencia aún;
 *   - empareja el remitente con un proveedor registrado, sin crear ninguno.
 *
 * DECISIÓN DE DISEÑO — un correo nunca registra una compra solo. Un correo
 * es una confirmación de pedido, no una entrega: se revisa en el formulario
 * de Compra y por defecto entra como "Por recibir". Además, el cuerpo de un
 * correo es texto de un tercero que pasa por un modelo de lenguaje; que una
 * persona confirme cada ítem es lo que impide que un correo hostil mueva
 * stock.
 *
 * Lo usan el cliente (Compra) y la función programada de Firebase
 * (functions/shared/, vía `npm run functions:sync`). Lógica pura, mismo patrón
 * UMD que purchases.js: sin React, red, DOM ni localStorage.
 * Se prueba con `node --test purchase-email-inbox.test.js`.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const ESTADOS = Object.freeze({
    NUEVA: 'nueva',
    IMPORTADA: 'importada',
    DESCARTADA: 'descartada',
  });

  // Un correo sólo avanza: nueva → importada | descartada. Un equipo atrasado
  // no puede devolver a la bandeja algo que otro ya importó.
  const RANGO_ESTADO = Object.freeze({ nueva: 0, importada: 1, descartada: 1 });

  // Remitentes conocidos de antemano (los mismos de fetch_gmail.py). Los
  // proveedores registrados suman el suyo con `remitenteCorreo`.
  const DEFAULT_SENDER_DOMAINS = Object.freeze([
    'homecenter.com.co',
    'mercadolibre.com',
    'mercadolibre.com.co',
    'mercadopago.com',
    'rappi.com',
    'rappimail.com',
  ]);

  const SUBJECT_KEYWORDS = Object.freeze([
    'pedido', 'orden', 'compra', 'factura', 'confirmaci', 'recibo', 'pago', 'cotizaci', 'despacho', 'envío', 'envio',
  ]);

  // Dominios de correo personal: identificar al proveedor por el dominio
  // juntaría a todos los que escriben desde Gmail. Para estos se usa la
  // dirección completa.
  const FREE_MAIL_DOMAINS = Object.freeze([
    'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.es', 'outlook.com', 'outlook.es',
    'live.com', 'yahoo.com', 'yahoo.es', 'icloud.com', 'me.com', 'protonmail.com', 'proton.me',
  ]);

  const MAX_CUERPO = 6000;

  /** Dirección de correo de un encabezado From ("Nombre <a@b.com>" → "a@b.com"). */
  const senderAddress = from => {
    const s = String(from || '');
    const angle = s.match(/<([^<>\s]+@[^<>\s]+)>/);
    const bare = angle ? angle[1] : (s.match(/[^\s<>"',;]+@[^\s<>"',;]+/) || [''])[0];
    return bare.trim().toLowerCase();
  };

  const senderDomain = from => {
    const addr = senderAddress(from);
    const at = addr.lastIndexOf('@');
    return at >= 0 ? addr.slice(at + 1) : '';
  };

  /**
   * Clave con la que se reconoce a un remitente: el dominio de una empresa, o
   * la dirección completa si escribe desde un correo personal.
   */
  const senderKey = from => {
    const domain = senderDomain(from);
    if (!domain) return '';
    return FREE_MAIL_DOMAINS.includes(domain) ? senderAddress(from) : domain;
  };

  /** "ventas.homecenter.com.co" coincide con "homecenter.com.co"; una dirección completa, sólo consigo misma. */
  const keyMatches = (from, key) => {
    const k = String(key || '').trim().toLowerCase().replace(/^@/, '');
    if (!k) return false;
    if (k.includes('@')) return senderAddress(from) === k;
    const domain = senderDomain(from);
    return domain === k || domain.endsWith('.' + k);
  };

  /** Claves de remitente que cuentan como proveedor: las conocidas + las de cada proveedor. */
  const senderKeysFor = (proveedores = []) => {
    const keys = new Set(DEFAULT_SENDER_DOMAINS);
    for (const p of proveedores || []) {
      const k = String((p && p.remitenteCorreo) || '').trim().toLowerCase().replace(/^@/, '');
      if (k) keys.add(k);
    }
    return [...keys];
  };

  const hasPurchaseKeyword = subject => {
    const s = String(subject || '').toLowerCase();
    return SUBJECT_KEYWORDS.some(k => s.includes(k));
  };

  /**
   * ¿Parece una compra? Remitente conocido Y asunto de pedido/factura. Un
   * proveedor registrado con `remitenteCorreo` cuenta aunque el asunto no
   * diga nada — un proveedor local escribe "Hola, ya le mando lo suyo".
   */
  const isPurchaseEmail = ({ from, subject } = {}, { proveedores = [] } = {}) => {
    const registrado = (proveedores || []).some(p => p && p.remitenteCorreo && keyMatches(from, p.remitenteCorreo));
    if (registrado) return true;
    const conocido = DEFAULT_SENDER_DOMAINS.some(d => keyMatches(from, d));
    return conocido && hasPurchaseKeyword(subject);
  };

  /** Proveedor cuyo `remitenteCorreo` coincide, sólo si es inequívoco. Nunca crea uno. */
  const matchProveedor = (proveedores = [], from) => {
    const hits = (proveedores || []).filter(p => p && p.remitenteCorreo && keyMatches(from, p.remitenteCorreo));
    return hits.length === 1 ? hits[0].id : '';
  };

  const normalizeMessageId = raw => String(raw || '').trim().replace(/^<|>$/g, '').trim().toLowerCase();

  // FNV-1a de 32 bits, dos pasadas con semillas distintas → 64 bits en hex.
  // Síncrono y sin dependencias para que el cliente y la función de Node
  // calculen exactamente el mismo id.
  const fnv1a = (str, seed) => {
    let h = seed >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  };
  const hash64 = str => fnv1a(str, 0x811c9dc5) + fnv1a(str, 0x01000193 ^ 0x5bd1e995);

  /**
   * Id estable de un correo. Con Message-ID (lo normal) es un hash de ese
   * encabezado. Sin él, un hash de remitente+asunto+fecha+cuerpo: estable
   * entre importaciones, a diferencia del número de secuencia IMAP que usaba
   * fetch_gmail.py, que cambia entre sesiones.
   */
  const correoId = ({ messageId, from, subject, date, body } = {}) => {
    const mid = normalizeMessageId(messageId);
    const basis = mid
      ? 'mid:' + mid
      : 'sin-mid:' + [senderAddress(from), String(subject || '').trim(), String(date || '').trim(), String(body || '').trim().slice(0, 500)].join('|');
    return 'mail_' + hash64(basis);
  };

  // Colombia no tiene horario de verano: UTC−5 todo el año.
  const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

  /** Fecha calendario en Bogotá (YYYY-MM-DD) de un instante, o null si no se entiende. */
  const bogotaDate = input => {
    if (input == null || input === '') return null;
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    const d = input instanceof Date ? input : new Date(input);
    const t = d.getTime();
    if (!Number.isFinite(t)) return null;
    return new Date(t + BOGOTA_OFFSET_MS).toISOString().slice(0, 10);
  };

  const todayBogota = (nowMs = Date.now()) => bogotaDate(new Date(nowMs));

  /**
   * Forma canónica de un correo de compra. Acepta lo que escribe
   * fetch_gmail.py ({from, subject, date, body, messageId?}), lo que guarda la
   * función programada y lo que ya está en localStorage.
   */
  const normalizeCorreo = raw => {
    if (!raw || typeof raw !== 'object') return null;
    const from = String(raw.from ?? raw.remitente ?? '').trim();
    const subject = String(raw.subject ?? raw.asunto ?? '').trim();
    const body = String(raw.body ?? raw.cuerpo ?? '').slice(0, MAX_CUERPO);
    const dateRaw = raw.rawDate ?? raw.date ?? raw.fecha ?? null;
    const messageId = normalizeMessageId(raw.messageId);
    if (!from && !subject && !body.trim()) return null;
    const estado = Object.values(ESTADOS).includes(raw.estado) ? raw.estado : ESTADOS.NUEVA;
    return {
      id: raw.id && String(raw.id).startsWith('mail_') ? String(raw.id) : correoId({ messageId, from, subject, date: dateRaw, body }),
      messageId: messageId || null,
      remitente: from,
      remitenteClave: senderKey(from),
      asunto: subject,
      fecha: bogotaDate(dateRaw),
      cuerpo: body,
      estado,
      compraId: raw.compraId || null,
      origen: raw.origen || 'archivo',
      importadoEn: raw.importadoEn || null,
    };
  };

  /**
   * Lo que se guarda en el equipo: un correo que ya salió de la bandeja sólo
   * necesita su id y su estado (para no volver a mostrarse), no el cuerpo de
   * hasta 6 KB. Sin esto, `sdp_correos_compra` crece con cada correo y termina
   * agotando la cuota de localStorage que comparten compras y lotes.
   */
  const compactCorreos = (correos = []) =>
    (correos || []).map(c => (c && c.estado !== ESTADOS.NUEVA && c.cuerpo) ? { ...c, cuerpo: '' } : c);

  /** Fecha más reciente en que la función programada trajo un correo de Gmail, o null. */
  const ultimoImportadoGmail = (correos = []) =>
    (correos || []).reduce((max, c) => {
      const t = c && c.origen === 'gmail' && c.importadoEn ? String(c.importadoEn) : '';
      return t > (max || '') ? t : max;
    }, null);

  /**
   * Correos de un archivo de fetch_gmail.py ({emails:[...]}) o una lista suelta.
   * Lanza si el archivo no tiene esa forma, para que la interfaz lo diga.
   */
  const correosFromFile = json => {
    const list = Array.isArray(json) ? json : (json && Array.isArray(json.emails) ? json.emails : null);
    if (!list) throw new Error('El archivo no tiene la forma de fetch_gmail.py (falta la lista "emails").');
    return mergeCorreos([], list.map(e => normalizeCorreo({ ...e, origen: 'archivo' })).filter(Boolean));
  };

  /**
   * Une correos por id. Gana el estado más avanzado (un correo importado en
   * otro equipo no vuelve a la bandeja); a igual estado, gana el que llega.
   */
  const mergeCorreos = (actuales = [], entrantes = []) => {
    const byId = new Map();
    for (const c of actuales || []) if (c && c.id) byId.set(c.id, c);
    for (const c of entrantes || []) {
      if (!c || !c.id) continue;
      const prev = byId.get(c.id);
      if (!prev) { byId.set(c.id, c); continue; }
      const rPrev = RANGO_ESTADO[prev.estado] ?? 0;
      const rNew = RANGO_ESTADO[c.estado] ?? 0;
      if (rNew > rPrev) byId.set(c.id, { ...prev, ...c });
      else if (rNew === rPrev) byId.set(c.id, { ...prev, ...c, estado: prev.estado, compraId: prev.compraId || c.compraId || null });
      // rNew < rPrev: el entrante está atrasado; se conserva el avanzado.
    }
    return [...byId.values()];
  };

  const canTransition = (desde, hacia) =>
    desde === ESTADOS.NUEVA && (hacia === ESTADOS.IMPORTADA || hacia === ESTADOS.DESCARTADA);

  /** Marca un correo; devuelve la lista nueva. Una transición inválida no cambia nada. */
  const markCorreo = (correos = [], id, estado, { compraId = null } = {}) =>
    (correos || []).map(c => (c && c.id === id && canTransition(c.estado, estado))
      ? { ...c, estado, compraId: compraId || c.compraId || null }
      : c);

  /**
   * Bandeja: correos nuevos que ninguna compra referencia todavía, el más
   * reciente primero. Mirar `origenCorreoId` en las compras cubre el caso de
   * otro equipo que ya importó el correo pero cuyo cambio de estado aún no
   * llegó.
   */
  const inboxPending = (correos = [], compras = []) => {
    const usados = new Set((compras || []).map(c => c && c.origenCorreoId).filter(Boolean));
    return (correos || [])
      .filter(c => c && c.estado === ESTADOS.NUEVA && !usados.has(c.id))
      .slice()
      .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
  };

  /** ¿Ya hay una compra registrada desde este correo? */
  const compraFromCorreo = (compras = [], id) =>
    (compras || []).find(c => c && c.origenCorreoId === id) || null;

  /** Texto que se entrega al lector de facturas (el mismo de "Pegar texto"). */
  const textoParaParseo = correo => {
    if (!correo) return '';
    return [
      `De: ${correo.remitente || ''}`,
      `Asunto: ${correo.asunto || ''}`,
      `Fecha: ${correo.fecha || ''}`,
      '',
      correo.cuerpo || '',
    ].join('\n').trim();
  };

  /**
   * Líneas del formulario que `registrarCompra` dejaría por fuera, con el
   * motivo. Un pedido de Homecenter trae bolsas, guantes o unidades sin kilos:
   * antes esas líneas desaparecían sin aviso.
   */
  const droppedLines = (items = []) => {
    const out = [];
    for (const it of items || []) {
      if (!it) continue;
      const kg = parseFloat(it.kg);
      const tieneAlgo = it.ingId || (it.kg !== '' && it.kg != null) || (it.precio !== '' && it.precio != null) || it.textoOriginal;
      if (!tieneAlgo) continue;
      if (!it.ingId) out.push({ uid: it.uid, motivo: 'sin ingrediente', texto: it.textoOriginal || '' });
      else if (!(kg > 0)) out.push({ uid: it.uid, motivo: 'sin kilos', texto: it.textoOriginal || '' });
    }
    return out;
  };

  const api = {
    ESTADOS,
    DEFAULT_SENDER_DOMAINS,
    SUBJECT_KEYWORDS,
    FREE_MAIL_DOMAINS,
    senderAddress,
    senderDomain,
    senderKey,
    keyMatches,
    senderKeysFor,
    hasPurchaseKeyword,
    isPurchaseEmail,
    matchProveedor,
    normalizeMessageId,
    correoId,
    bogotaDate,
    todayBogota,
    normalizeCorreo,
    compactCorreos,
    ultimoImportadoGmail,
    correosFromFile,
    mergeCorreos,
    canTransition,
    markCorreo,
    inboxPending,
    compraFromCorreo,
    textoParaParseo,
    droppedLines,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPurchaseEmailInbox = api;
})();
