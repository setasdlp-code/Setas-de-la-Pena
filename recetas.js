'use strict';
document.querySelector('#year').textContent = new Date().getFullYear();
function revealRecipe() {
  const recipe = document.getElementById(location.hash.slice(1));
  if (!recipe?.classList.contains('recipe')) return;
  recipe.querySelector('details').open = true;
}
window.addEventListener('hashchange', revealRecipe);
revealRecipe();
// Clicking the current fragment should reopen a recipe the reader has collapsed.
document.querySelectorAll('.recipe-shortcuts a').forEach(link => link.addEventListener('click', () => {
  document.querySelector(link.getAttribute('href')).querySelector('details').open = true;
}));

// Cantidades ajustables: cada receta tiene su propio factor, calculado siempre desde los valores base.
const recipeData = window.SetasRecipes || {};
const scaleInfo = window.SetasRecipeScales || { values: [], labels: {} };
const startParams = new URLSearchParams(location.search);
function applyScale(article, scale, updateUrl) {
  const model = Object.hasOwn(recipeData, article.id) ? recipeData[article.id] : null;
  if (!model || !scaleInfo.values.includes(scale)) return;
  const rendered = model.render(scale);
  article.querySelector('[data-yield]').textContent = rendered.yield;
  article.querySelectorAll('[data-ing]').forEach(li => { li.textContent = rendered.ingredients[li.dataset.ing]; });
  const grams = model.grams * scale;
  const cta = article.querySelector('.recipe-cta a');
  const target = new URL(cta.href);
  target.searchParams.set('scale', String(scale));
  if (startParams.get('purpose') === 'restaurante') target.searchParams.set('purpose', 'restaurante');
  cta.href = target.href;
  article.querySelector('.recipe-cta p').textContent = `Prepararás una consulta con ${grams} g de shiitake fresco limpio${scale > 1 ? ` (${scaleInfo.labels[scale].toLowerCase()}, ×${scale})` : ', la cantidad de esta receta'}. Podrás cambiarla.`;
  const status = article.querySelector('.recipe-scale-status');
  status.textContent = scale === 1 ? 'Cantidades de la receta base. Son estimaciones pendientes de prueba.' : `Cantidades para ${scaleInfo.labels[scale].toLowerCase()} (×${scale}). Son estimaciones pendientes de prueba; el tiempo y los consejos de cocción son los de la receta base y pueden cambiar con más cantidad.`;
  status.hidden = false;
  article.querySelector(`input[name="scale-${article.id}"][value="${scale}"]`).checked = true;
  if (updateUrl) {
    const url = new URL(location.href);
    if (scale === 1) { url.searchParams.delete('recipe'); url.searchParams.delete('scale'); }
    else { url.searchParams.set('recipe', article.id); url.searchParams.set('scale', String(scale)); }
    history.replaceState(null, '', url);
  }
}
document.querySelectorAll('.recipe').forEach(article => {
  if (!Object.hasOwn(recipeData, article.id)) return;
  article.querySelector('.recipe-scale').hidden = false;
  article.querySelectorAll(`input[name="scale-${article.id}"]`).forEach(radio => radio.addEventListener('change', () => applyScale(article, Number(radio.value), true)));
});
// Un enlace compartido identifica receta y factor; no se aplica a las demás recetas.
const sharedRecipe = startParams.get('recipe');
if (sharedRecipe && /^[123]$/.test(startParams.get('scale') || '')) {
  const article = document.getElementById(sharedRecipe);
  if (article?.classList.contains('recipe')) applyScale(article, Number(startParams.get('scale')), false);
}
document.querySelector('#print-recipes').addEventListener('click', () => window.print());
const closedDetails = new Set();
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('details').forEach(detail => {
    if (!detail.open) closedDetails.add(detail);
    detail.open = true;
  });
});
window.addEventListener('afterprint', () => {
  closedDetails.forEach(detail => { detail.open = false; });
  closedDetails.clear();
});
