'use strict';
const species = {
  shiitake: { code: 'SP. 001', name: 'Shiitake', latin: 'Lentinula edodes', image: 'shiitake', category: 'Una especie para la cocina', description: 'Conoce el shiitake por su sabor y textura, y explora ideas para cocinarlo.', profile: 'Umami intenso, con notas ligeramente ahumadas.', use: 'Para sopas y otras preparaciones cocinadas. Explora su sabor y su textura.', culinary: true },
  melena: { code: 'SP. 002', name: 'Melena de león', latin: 'Hericium erinaceus', image: 'lions-mane', category: 'Una especie para explorar', description: 'Su silueta singular le da nombre. Una de las protagonistas de nuestro archivo de hongos, con una textura que invita a probar otras preparaciones.', profile: 'Textura suave y esponjosa, con notas dulces y sabrosas.', use: 'Desmenúzala, prepárala en piezas o incorpórala a una sopa.', culinary: true },
  orellana: { code: 'SP. 003', name: 'Orellana gris', latin: 'Pleurotus ostreatus', image: 'grey-mushroom', category: 'Una especie versátil', description: 'También conocida como hongo ostra. Su forma y sus láminas le dan una identidad reconocible dentro del archivo.', profile: 'Su forma y sus láminas son protagonistas de esta ficha.', use: 'Salteadas o asadas: dos maneras de explorar las orellanas en la cocina.', culinary: true },
  reishi: { code: 'SP. 004', name: 'Reishi', latin: 'Ganoderma lucidum', image: 'reishi', category: 'Archivo de hongos', description: 'Una especie de referencia en el universo visual de Setas de la Peña. Esta ficha invita a observar su forma y reconocer su nombre científico.', profile: 'Identidad de la especie: Ganoderma lucidum.', use: 'Esta ficha documenta la especie. No incluye recomendaciones de consumo ni atribuye propiedades medicinales.', culinary: false }
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
  sourceNote.textContent = key === 'orellana'
    ? 'La referencia culinaria corresponde a otra variedad de orellana; no es una cata de la orellana gris ni de nuestra cosecha.'
    : 'Perfil de referencia de la especie; no corresponde a una cata de nuestra cosecha.';
  document.querySelector('#dialog-full-page').hidden = key !== 'shiitake';
  document.querySelector('#dialog-order').hidden = key !== 'shiitake';
  document.querySelector('#species-dialog .availability-note').textContent = key === 'shiitake'
    ? 'Disponibilidad, presentaciones y entrega por confirmar. Prepara tu consulta en la ficha de shiitake.'
    : 'Disponibilidad, formatos y precios por confirmar.';
  dialog.scrollTop = 0;
  dialog.showModal();
}
document.querySelectorAll('[data-species]').forEach(button => button.addEventListener('click', () => openSpecies(button.dataset.species, button)));
document.querySelectorAll('[data-hero]').forEach(button => button.addEventListener('click', () => {
  const item = species[button.dataset.hero];
  document.querySelectorAll('[data-hero]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  setSpeciesImage(document.querySelector('#hero-image'), button.dataset.hero);
  document.querySelector('#hero-image').alt = `Ilustración de ${item.name.toLowerCase()}`;
  document.querySelector('#hero-name').textContent = item.name;
  document.querySelector('#hero-latin').textContent = item.latin;
  document.querySelector('#hero-code').textContent = item.code;
  document.querySelector('#hero-status').textContent = `Especie de portada: ${item.name}.`;
  document.querySelector('#hero-note').hidden = button.dataset.hero === 'shiitake';
}));
// Filtros de la colección: categoría + preparación. La guía solo ordena ideas de referencia; no crea disponibilidad.
const preparations = {
  sopa: { label: 'sopa o caldo', reasons: {
    shiitake: { text: 'Para sopas y otras preparaciones cocinadas.', link: ['/recetas#receta-sopa', 'Ver la sopa de coco y jengibre'] },
    melena: { text: 'Incorpórala a una sopa para explorar su textura.' } } },
  saltear: { label: 'saltear', reasons: {
    shiitake: { text: 'Nuestras recetas de arepa y patacones lo saltean.', link: ['/recetas#receta-arepa', 'Ver la arepa con shiitake'] },
    orellana: { text: 'Saltea las orellanas para tu próximo plato.' } } },
  asar: { label: 'asar', reasons: {
    orellana: { text: 'Prueba las orellanas asadas.' } } },
  desmenuzar: { label: 'desmenuzar o en piezas', reasons: {
    melena: { text: 'Desmenúzala o prepárala en piezas.' } } }
};
const filterState = { category: 'culinary', prep: 'any' };
function applyFilters() {
  const prep = preparations[filterState.prep];
  let count = 0;
  document.querySelectorAll('.species-card').forEach(card => {
    const speciesKey = card.querySelector('[data-species]').dataset.species;
    const inCategory = filterState.category === 'all' || card.dataset.category === filterState.category;
    const inPrep = !prep || (card.dataset.uses || '').split(' ').includes(filterState.prep);
    card.hidden = !(inCategory && inPrep);
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
  document.querySelectorAll('[data-filter]').forEach(button => {
    const active = button.dataset.filter === filterState.category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-prep]').forEach(button => {
    const active = button.dataset.prep === filterState.prep;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#filter-empty').hidden = count !== 0;
  document.querySelector('#filter-reset').hidden = filterState.category === 'all' && filterState.prep === 'any';
  document.querySelector('#filter-status').textContent = count === 0 ? 'Ninguna especie coincide con los filtros.' : `${count} ${count === 1 ? 'especie visible' : 'especies visibles'}${prep ? ` para ${prep.label}` : ''}.`;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filterState.category = button.dataset.filter; applyFilters(); }));
document.querySelectorAll('[data-prep]').forEach(button => button.addEventListener('click', () => { filterState.prep = button.dataset.prep; applyFilters(); }));
document.querySelector('#filter-reset').addEventListener('click', () => {
  filterState.category = 'all';
  filterState.prep = 'any';
  applyFilters();
  document.querySelector('[data-filter="all"]').focus();
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
document.querySelector('#dialog-journal').addEventListener('click', () => {
  const target = document.querySelector('#journal-title');
  target.tabIndex = -1;
  opener = target;
  dialog.close();
  location.hash = 'cuaderno';
  target.focus({preventScroll: true});
});
document.querySelector('#year').textContent = new Date().getFullYear();
