'use strict';
// Preparation filters suggest sourced uses; they never imply stock.
const preparations = {
  sopa: { label: 'sopa o caldo', reasons: {
    shiitake: { text: 'Para sopas y otras preparaciones cocinadas.', link: ['/recetas#receta-sopa', 'Ver la sopa de coco y jengibre'] },
    melena: { text: 'Melena en un mote de ñame y ahuyama.', link: ['/recetas-melena#melena-mote', 'Cocinar el mote de melena'] } } },
  saltear: { label: 'saltear', reasons: {
    shiitake: { text: 'Nuestras recetas de arepa y patacones lo saltean.', link: ['/recetas#receta-arepa', 'Ver la arepa con shiitake'] },
    eryngii: { text: 'Láminas de eryngii doradas a la plancha, con papas chorreadas.', link: ['/recetas-eryngii#eryngii-laminas', 'Cocinar las láminas de eryngii'] } } },
  asar: { label: 'asar', reasons: {
    eryngii: { text: 'Cintas de eryngii a la parrilla, con panela y limón mandarino.', link: ['/recetas-eryngii#eryngii-chuzos', 'Cocinar los chuzos de eryngii'] } } },
  desmenuzar: { label: 'desmenuzar o en piezas', reasons: {
    melena: { text: 'Melena en tajadas, dentro de un envuelto de maíz y pipián.', link: ['/recetas-melena#melena-envuelto', 'Cocinar el envuelto de melena'] } } }
};
const filterState = { prep: 'any' };
function applyFilters() {
  const prep = preparations[filterState.prep];
  let count = 0;
  document.querySelectorAll('.species-card').forEach(card => {
    const speciesKey = card.querySelector('[data-species]').dataset.species;
    const inPrep = !prep || (card.dataset.uses || '').split(' ').includes(filterState.prep);
    card.hidden = !inPrep;
    if (!card.hidden) count++;
    const reason = card.querySelector('.card-reason');
    if (!reason) return;
    reason.replaceChildren();
    const entry = prep?.reasons[speciesKey];
    reason.hidden = card.hidden || !entry;
    if (!reason.hidden) {
      reason.append(entry.text);
      const note = document.createElement('sup');
      const citation = document.createElement('a');
      citation.href = '#source-culinary';
      citation.textContent = '[1]';
      citation.setAttribute('aria-label', 'Ver nota 1: referencia culinaria');
      note.append(citation);
      reason.append(' ', note);
      if (entry.link) {
        const link = document.createElement('a');
        link.className = 'text-link';
        const target = new URL(entry.link[0], location.origin);
        const pairing = new URLSearchParams(location.search).get('pairing');
        if (['mono', 'bricolage', 'libre'].includes(pairing)) target.searchParams.set('pairing', pairing);
        link.href = target.href;
        link.textContent = `${entry.link[1]} ↗`;
        reason.append(' ', link);
      }
    }
  });
  document.querySelectorAll('[data-prep]').forEach(button => {
    const active = button.dataset.prep === filterState.prep;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#filter-empty').hidden = count !== 0;
  document.querySelector('#filter-reset').hidden = filterState.prep === 'any';
  document.querySelector('#filter-status').textContent = count === 0 ? 'Ninguna especie coincide con los filtros.' : `${count} ${count === 1 ? 'especie visible' : 'especies visibles'}${prep ? ` para ${prep.label}` : ''}.`;
}
document.querySelectorAll('[data-prep]').forEach(button => button.addEventListener('click', () => { filterState.prep = button.dataset.prep; applyFilters(); }));
document.querySelector('#filter-reset').addEventListener('click', () => {
  filterState.prep = 'any';
  applyFilters();
  document.querySelector('[data-prep="any"]').focus();
});
document.querySelector('#prep-guide').hidden = false;
document.querySelector('#year').textContent = new Date().getFullYear();
