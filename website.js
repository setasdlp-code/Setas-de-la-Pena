'use strict';
const species = {
  shiitake: { code: 'SP. 001', name: 'Shiitake', latin: 'Lentinula edodes', image: 'shiitake', category: 'Una especie para la cocina', description: 'Una de las especies insignia de Setas de la Peña. Conoce la especie y algunas ideas para acercarla a tu cocina.', profile: 'Sabor sabroso y umami intenso, con notas ligeramente ahumadas según la guía de Smallhold.', use: 'La referencia propone utilizarlo en sopas y otras preparaciones cocinadas. Una invitación a explorar sabor y textura.', culinary: true },
  melena: { code: 'SP. 002', name: 'Melena de león', latin: 'Hericium erinaceus', image: 'lions-mane', category: 'Una especie para explorar', description: 'Su silueta singular le da nombre. Una de las protagonistas de nuestro archivo de hongos, con una textura que invita a probar otras preparaciones.', profile: 'Textura suave y esponjosa; notas dulces y sabrosas descritas por Smallhold.', use: 'La guía propone desmenuzarla, prepararla en piezas o incorporarla a sopas. Consulta la referencia para conocer sus ejemplos.', culinary: true },
  orellana: { code: 'SP. 003', name: 'Orellana gris', latin: 'Pleurotus ostreatus', image: 'grey-mushroom', category: 'Una especie versátil', description: 'También conocida como hongo ostra. Su forma y sus láminas le dan una identidad reconocible dentro del archivo.', profile: 'La guía de Smallhold describe las orellanas azules como sabrosas, con umami y una textura consistente. Es una referencia de ese producto, no una evaluación de nuestra cosecha.', use: 'Saltear o asar son las propuestas de la guía para las orellanas. Las características concretas dependen del producto y la preparación.', culinary: true },
  reishi: { code: 'SP. 004', name: 'Reishi', latin: 'Ganoderma lucidum', image: 'reishi', category: 'Archivo de hongos', description: 'Una especie de referencia en el universo visual de Setas de la Peña. Esta ficha invita a observar su forma y reconocer su nombre científico.', profile: 'Identidad de la especie: Ganoderma lucidum.', use: 'Esta ficha documenta la especie. No incluye recomendaciones de consumo ni atribuye propiedades medicinales.', culinary: false }
};
const dialog = document.querySelector('#species-dialog');
let opener;
const imagePath = item => `08_brand/ds-2026/assets/img/species/${item.image}.png`;
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
  image.src = imagePath(item);
  image.alt = `Ilustración de ${item.name.toLowerCase()}`;
  document.querySelector('#dialog-source').hidden = !item.culinary;
  document.querySelector('#dialog-full-page').hidden = key !== 'shiitake';
  document.querySelector('#dialog-order').hidden = key !== 'shiitake';
  document.querySelector('#species-dialog .availability-note').textContent = key === 'shiitake'
    ? 'Consulta las presentaciones y condiciones de entrega en la ficha de shiitake.'
    : 'Disponibilidad, formatos y precios por confirmar.';
  dialog.scrollTop = 0;
  dialog.showModal();
}
document.querySelectorAll('[data-species]').forEach(button => button.addEventListener('click', () => openSpecies(button.dataset.species, button)));
document.querySelectorAll('[data-hero]').forEach(button => button.addEventListener('click', () => {
  const item = species[button.dataset.hero];
  document.querySelectorAll('[data-hero]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  document.querySelector('#hero-image').src = imagePath(item);
  document.querySelector('#hero-image').alt = `Ilustración de ${item.name.toLowerCase()}`;
  document.querySelector('#hero-name').textContent = item.name;
  document.querySelector('#hero-latin').textContent = item.latin;
  document.querySelector('#hero-code').textContent = item.code;
  document.querySelector('#hero-status').textContent = `Especie de portada: ${item.name}.`;
}));
// Filtros de la colección: categoría + preparación. La guía solo ordena ideas de referencia; no crea disponibilidad.
const preparations = {
  sopa: { label: 'sopa o caldo', reasons: {
    shiitake: { text: 'Smallhold lo propone para sopas y otras preparaciones cocinadas.', link: ['recetas.html#receta-sopa', 'Ver la sopa de coco y jengibre'] },
    melena: { text: 'La guía de Smallhold propone incorporarla a sopas.' } } },
  saltear: { label: 'saltear', reasons: {
    shiitake: { text: 'Nuestras recetas de arepa y patacones lo saltean.', link: ['recetas.html#receta-arepa', 'Ver la arepa con shiitake'] },
    orellana: { text: 'La guía de Smallhold propone saltear las orellanas. Su descripción corresponde a otra variedad; no es una cata de la orellana gris.' } } },
  asar: { label: 'asar', reasons: {
    orellana: { text: 'La guía de Smallhold propone asar las orellanas. Su descripción corresponde a otra variedad; no es una cata de la orellana gris.' } } },
  desmenuzar: { label: 'desmenuzar o en piezas', reasons: {
    melena: { text: 'La guía de Smallhold propone desmenuzarla o prepararla en piezas.' } } }
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
