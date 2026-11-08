'use strict';
// Progressive enhancement: the complete recipes remain readable without JavaScript.
(() => {
  const grid = document.querySelector('.minimal-public .recipe-grid');
  if (!grid) return;
  const recipes = [...document.querySelectorAll('.minimal-public .recipe-grid > .recipe')];
  if (!recipes.length) return;
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const picker = document.querySelector('.recipe-picker');
  if (picker) picker.removeAttribute('id');
  const regionalContext = document.querySelector('#cocina-colombiana');
  if (regionalContext) {
    const guide = create('details', 'recipe-guide');
    guide.append(create('summary', '', 'Notas de la cocina colombiana'));
    [...document.querySelectorAll('.recipe-grid')].at(-1).after(guide);
    guide.append(regionalContext);
  }
  const safety = document.querySelector('main > .recipe-safety');
  const gallery = create('section', 'recipe-gallery');
  gallery.id = 'recetas';
  gallery.setAttribute('aria-labelledby', 'recipe-gallery-title');
  const heading = create('div', 'recipe-gallery-heading');
  const title = create('h2', '', 'Elige qué cocinar.');
  title.id = 'recipe-gallery-title';
  const searchLabel = create('label', 'recipe-search-label', 'Buscar una receta');
  const search = create('input', 'recipe-search');
  search.type = 'search';
  search.name = 'buscar';
  search.autocomplete = 'off';
  search.placeholder = 'Nombre o ingrediente…';
  search.value = new URL(location.href).searchParams.get('buscar') || '';
  searchLabel.append(search);
  heading.append(title, searchLabel);
  const status = create('p', 'recipe-gallery-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const previews = create('div', 'recipe-preview-grid');
  const noResults = create('div', 'recipe-empty');
  noResults.hidden = true;
  noResults.append(create('p', '', 'No encontramos esa receta. Prueba con otro ingrediente.'));
  const clear = create('button', '', 'Ver todas las recetas');
  clear.type = 'button';
  noResults.append(clear);
  const bar = create('nav', 'recipe-focusbar');
  bar.hidden = true;
  bar.setAttribute('aria-label', 'Navegar entre recetas');
  const browse = create('a', 'recipe-browse-link', '← Todas las recetas');
  browse.href = '#recetas';
  browse.textContent = 'Todas las recetas';
  const selectLabel = create('label', 'recipe-switcher', 'Cambiar receta');
  const select = create('select');
  select.name = 'plato';
  selectLabel.append(select);
  const print = create('button', 'recipe-print-current', 'Imprimir esta receta');
  print.type = 'button';
  bar.append(browse, selectLabel, print);
  const entries = recipes.map(recipe => {
    const name = recipe.querySelector('h2').textContent.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
    const link = create('a', 'recipe-preview');
    link.href = `#${recipe.id}`;
    const image = recipe.querySelector('.recipe-illustration img')?.cloneNode(true);
    if (image) {
      image.alt = '';
      image.loading = 'lazy';
      image.removeAttribute('fetchpriority');
      link.append(image);
    }
    const copy = create('div', 'recipe-preview-copy');
    copy.append(create('h3', '', name));
    const time = [...recipe.querySelectorAll('.recipe-meta > div')].find(row => /tiempo/i.test(row.querySelector('dt')?.textContent || ''))?.querySelector('dd')?.textContent;
    if (time) copy.append(create('p', 'recipe-preview-time', time));
    const action = create('span', 'recipe-preview-action', 'Ver receta ');
    const arrow = create('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    action.append(arrow);
    copy.append(action);
    link.append(copy);
    previews.append(link);
    select.append(new Option(name, recipe.id));
    recipe.tabIndex = -1;
    if (safety) {
      const note = safety.cloneNode(true);
      note.classList.add('recipe-focus-safety');
      recipe.querySelector('.recipe-details > summary').after(note);
    }
    return { recipe, link, terms: normalize(`${name} ${recipe.querySelector('.recipe-heading > p:not(.t-label)')?.textContent || ''} ${recipe.querySelector('.recipe-ingredients')?.textContent || ''}`) };
  });
  gallery.append(heading, status, previews, noResults);
  (picker || grid).before(gallery);
  grid.before(bar);
  if (picker) picker.hidden = true;
  let selected = null;
  let printing = false;
  function filter(updateURL = false) {
    const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    entries.forEach(entry => {
      entry.link.hidden = !words.every(word => entry.terms.includes(word));
      if (!entry.link.hidden) visible++;
    });
    status.textContent = `${visible} ${visible === 1 ? 'receta' : 'recetas'}${words.length ? ' para tu búsqueda' : ' para explorar'}`;
    noResults.hidden = visible !== 0;
    if (updateURL) {
      const url = new URL(location.href);
      if (search.value.trim()) url.searchParams.set('buscar', search.value.trim());
      else url.searchParams.delete('buscar');
      history.replaceState(null, '', url);
    }
  }
  function sync(moveFocus = false) {
    if (printing) return;
    // A browse/guide fragment takes precedence over a shared quantity query.
    const id = location.hash.slice(1) || new URL(location.href).searchParams.get('recipe');
    const target = id ? document.getElementById(id) : null;
    selected = target?.closest('.recipe') || null;
    const url = new URL(location.href);
    if (location.hash && url.searchParams.has('recipe') && url.searchParams.get('recipe') !== selected?.id) {
      url.searchParams.delete('recipe');
      url.searchParams.delete('scale');
      history.replaceState(null, '', url);
    }
    document.body.classList.toggle('recipe-is-selected', Boolean(selected));
    gallery.hidden = Boolean(selected);
    bar.hidden = !selected;
    const bottomPrint = document.querySelector('#print-recipes');
    if (bottomPrint) bottomPrint.textContent = selected ? 'Imprimir esta receta' : 'Imprimir recetas';
    entries.forEach(({ recipe }) => { recipe.hidden = recipe !== selected; });
    if (selected) {
      selected.querySelector('.recipe-details').open = true;
      select.value = selected.id;
      if (moveFocus) {
        selected.focus({ preventScroll: true });
        selected.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    } else if (moveFocus && location.hash === '#recetas') {
      search.focus({ preventScroll: true });
      gallery.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
  search.addEventListener('input', () => filter(true));
  clear.addEventListener('click', () => { search.value = ''; filter(true); search.focus(); });
  select.addEventListener('change', () => { location.hash = select.value; });
  print.addEventListener('click', () => window.print());
  previews.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link && link.hash === location.hash && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) sync(true);
  });
  window.addEventListener('hashchange', () => sync(true));
  window.addEventListener('popstate', () => { search.value = new URL(location.href).searchParams.get('buscar') || ''; filter(); sync(); });
  window.addEventListener('beforeprint', () => {
    printing = true;
    entries.forEach(({ recipe }) => { recipe.hidden = Boolean(selected) && recipe !== selected; });
  });
  window.addEventListener('afterprint', () => {
    printing = false;
    // Restore visibility only; the recipe scripts restore disclosure state.
    entries.forEach(({ recipe }) => { recipe.hidden = recipe !== selected; });
  });
  document.body.classList.add('recipe-showcase-ready');
  filter();
  sync();
})();
