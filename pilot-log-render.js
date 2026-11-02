'use strict';
// Pinta el registro del cultivo. Sin entradas válidas deja el estado vacío del HTML.
(() => {
  const root = document.querySelector('#registro');
  const list = root && root.querySelector('.pilot-log-entries');
  const log = window.SetasPilotLog;
  if (!list || !log || !Array.isArray(log.entries)) return;
  const STATUSES = ['medido', 'observado', 'estimado', 'por confirmar'];
  const text = value => typeof value === 'string' ? value.trim() : '';
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
  const entries = log.entries
    .filter(entry => entry && validDate(text(entry.date)) && text(entry.milestone))
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!entries.length) return;
  const dateFormat = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  for (const entry of entries) {
    const article = el('article', 'pilot-log-entry');
    const time = el('time', 't-label', dateFormat.format(new Date(`${entry.date}T00:00:00Z`)));
    time.dateTime = entry.date;
    const status = STATUSES.includes(text(entry.status)) ? text(entry.status) : 'por confirmar';
    article.append(time, el('h3', null, text(entry.milestone)), el('span', 'pilot-log-status', `Estado: ${status}`));
    if (text(entry.text)) article.append(el('p', null, text(entry.text)));
    const kitchen = entry.kitchen || {};
    if (text(kitchen.home)) article.append(el('p', 'pilot-log-kitchen', `En casa: ${text(kitchen.home)}`));
    article.append(el('p', 'pilot-log-kitchen', `Para un servicio: ${text(kitchen.service) || 'por medir'}`));
    list.append(article);
  }
  const empty = root.querySelector('.pilot-log-empty');
  if (empty) empty.hidden = true;
})();
