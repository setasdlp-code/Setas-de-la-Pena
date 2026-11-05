'use strict';
(() => {
 const recipes = [...document.querySelectorAll('.study-detail .recipe')];
 const cards = [...document.querySelectorAll('.study-card')];
 const toolbar = document.querySelector('.study-detail-toolbar');
 const references = document.querySelector('.study-references');
 const ids = recipes.map(recipe => recipe.id);
 document.getElementById('year').textContent = new Date().getFullYear();
 function showSelection(focus) {
  const id = location.hash.slice(1);
  if (ids.includes(id) || !id || id === 'preparaciones') {
   const active = ids.includes(id) ? id : null;
   recipes.forEach(recipe => { recipe.hidden = recipe.id !== active; recipe.querySelector('details').open = true; });
   toolbar.hidden = !active;
   cards.forEach(card => { if (card.hash === '#' + active) card.setAttribute('aria-current', 'true'); else card.removeAttribute('aria-current'); });
   if (active && focus) requestAnimationFrame(() => { const heading = document.querySelector('#' + id + ' h2'); heading.focus({ preventScroll: true }); heading.scrollIntoView({ block: 'start' }); });
  } else if (id === 'conservacion') {
   references.open = true;
   if (focus) requestAnimationFrame(() => document.getElementById('conservacion').scrollIntoView({ block: 'start' }));
  }
 }
 cards.forEach(card => card.addEventListener('click', () => {
  recipes.forEach(recipe => { recipe.hidden = '#' + recipe.id !== card.hash; recipe.querySelector('details').open = true; });
  toolbar.hidden = false;
  // The same fragment can be selected again after browsing back to the index.
  if (location.hash === card.hash) showSelection(true);
 }));
 document.querySelectorAll('a[href="#conservacion"]').forEach(link => link.addEventListener('click', () => { references.open = true; }));
 window.addEventListener('hashchange', () => showSelection(true));
 showSelection(Boolean(location.hash));
 document.getElementById('study-print').addEventListener('click', () => window.print());
})();
