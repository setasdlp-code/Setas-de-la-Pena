'use strict';
const species = {
  shiitake: { code: 'SP. 001', name: 'Shiitake', latin: 'Lentinula edodes', image: 'shiitake', category: 'Una especie para la cocina', description: 'Conoce el shiitake por su sabor y textura, y explora ideas para cocinarlo.', profile: 'Umami intenso, con notas ligeramente ahumadas.', use: 'Para sopas y otras preparaciones cocinadas. Explora su sabor y su textura.', culinary: true },
  melena: { code: 'SP. 002', name: 'Melena de león', latin: 'Hericium erinaceus', image: 'lions-mane', category: 'Una especie para explorar', description: 'Su silueta singular le da nombre. Una de las protagonistas de nuestro archivo de hongos, con una textura que invita a probar otras preparaciones.', profile: 'Textura suave y esponjosa, con notas dulces y sabrosas.', use: 'Desmenúzala, prepárala en piezas o incorpórala a una sopa.', culinary: true },
  eryngii: { code: 'SP. 003', name: 'Eryngii', latin: 'Pleurotus eryngii', image: 'cardo', category: 'Una especie para explorar', description: 'También conocido como seta de cardo o king trumpet. Su pie grueso y sus láminas son protagonistas de esta ficha.', profile: 'Pie carnoso y textura firme.', use: 'Córtalo a lo largo para saltear o en rodajas para asar.', culinary: true }
};
const dialog = document.querySelector('#species-dialog');
let opener;
// Reuse the responsive image already present in the collection, including exported variants.
function setSpeciesImage(image, key) {
  const source = document.querySelector(`.specimen-button[data-species="${key}"] img`);
  image.src = source.src;
  if (source.srcset) image.srcset = source.srcset;
  else image.removeAttribute('srcset');
  image.sizes = '(max-width: 650px) 90vw, 550px';
}
function openSpecies(key, button) {
  const item = species[key];
  if (!item) return;
  opener = button;
  document.querySelector('#dialog-code').textContent = `${item.code} · Ficha de especie`;
  for (const field of ['title', 'latin', 'description', 'category', 'profile', 'use']) {
    document.querySelector(`#dialog-${field}`).textContent = field === 'title' ? item.name : item[field];
  }
  document.querySelector('#dialog-profile-label').textContent = item.culinary ? 'Perfil de referencia' : 'Identidad';
  document.querySelector('#dialog-use-label').textContent = item.culinary ? 'En la cocina' : 'En el archivo';
  const image = document.querySelector('#dialog-image');
  setSpeciesImage(image, key);
  image.alt = `Ilustración de ${item.name.toLowerCase()}`;
  document.querySelector('#dialog-source').hidden = !item.culinary;
  const sourceNote = document.querySelector('#dialog-source-note');
  sourceNote.hidden = !item.culinary;
  sourceNote.textContent = 'Perfil de referencia de la especie; no corresponde a una cata de nuestra cosecha.';
  const editorial = document.querySelector('#dialog-full-page');
  const routes = { shiitake: 'shiitake', melena: 'melena-de-leon', eryngii: 'eryngii' };
  const editorialURL = new URL(`/especies/${routes[key]}`, location.origin);
  const pairing = new URLSearchParams(location.search).get('pairing');
  if (['mono', 'bricolage', 'libre'].includes(pairing)) editorialURL.searchParams.set('pairing', pairing);
  editorial.href = editorialURL.href;
  editorial.textContent = `Leer la ficha de ${item.name.toLowerCase()} ↗`;
  editorial.hidden = false;
  document.querySelector('#dialog-order').hidden = key !== 'shiitake';
  document.querySelector('#species-dialog .availability-note').textContent = key === 'shiitake'
    ? 'Disponibilidad, presentaciones y entrega por confirmar. Prepara tu consulta en la ficha de shiitake.'
    : 'Disponibilidad, formatos y precios por confirmar.';
  dialog.scrollTop = 0;
  dialog.showModal();
}
document.querySelectorAll('[data-species]').forEach(button => button.addEventListener('click', () => openSpecies(button.dataset.species, button)));
// Preparation filters suggest sourced uses; they never imply stock.
const preparations = {
  sopa: { label: 'sopa o caldo', reasons: {
    shiitake: { text: 'Para sopas y otras preparaciones cocinadas.', link: ['/recetas#receta-sopa', 'Ver la sopa de coco y jengibre'] },
    melena: { text: 'Incorpórala a una sopa para explorar su textura.' } } },
  saltear: { label: 'saltear', reasons: {
    shiitake: { text: 'Nuestras recetas de arepa y patacones lo saltean.', link: ['/recetas#receta-arepa', 'Ver la arepa con shiitake'] },
    eryngii: { text: 'Corta el eryngii a lo largo para saltearlo.' } } },
  asar: { label: 'asar', reasons: {
    eryngii: { text: 'Prueba el eryngii en rodajas a la parrilla.' } } },
  desmenuzar: { label: 'desmenuzar o en piezas', reasons: {
    melena: { text: 'Desmenúzala o prepárala en piezas.' } } }
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
        link.href = entry.link[0];
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
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')]
    .filter(element => element.getClientRects().length > 0);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if ((!event.shiftKey && document.activeElement === last) || (event.shiftKey && document.activeElement === first)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
});
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => opener?.focus());
document.querySelector('#year').textContent = new Date().getFullYear();
