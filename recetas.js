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
