'use strict';
// Ingredients are readable at the base quantity without JavaScript.
(() => {
  const number = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
  const species = document.body.dataset.speciesLabel;
  const freshLabel = document.body.dataset.freshLabel;
  document.querySelectorAll('.species-recipes .recipe').forEach(recipe => {
    const scale = recipe.querySelector('.recipe-scale');
    const status = recipe.querySelector('.recipe-scale-status');
    const yieldLabel = recipe.querySelector('[data-yield]');
    const baseWeight = Number(recipe.dataset.mushroomGrams);
    scale.hidden = false;
    status.hidden = false;
    function update(factor) {
      recipe.querySelectorAll('[data-amounts]').forEach(el => {
        const value = Number(el.dataset.amounts.split('|')[factor - 1]);
        el.textContent = `${number.format(value)} ${el.dataset.unit}`;
      });
      yieldLabel.textContent = `${4 * factor} porciones · ${number.format(baseWeight * factor)} g de ${species} ${freshLabel}`;
      status.textContent = factor === 1
        ? 'Cantidades de la receta base. Los rendimientos están pendientes de medición.'
        : `Cantidades para ${4 * factor} porciones previstas. Cocinar por tandas y ajustar el líquido; los tiempos no se multiplican.`;
    }
    scale.addEventListener('change', event => {
      const factor = Number(event.target.value);
      if ([1, 2, 3].includes(factor)) update(factor);
    });
    update(Number(scale.querySelector('input:checked').value));
  });
  const print = document.querySelector('#print-recipes');
  if (print) {
    print.hidden = false;
    print.addEventListener('click', () => window.print());
  }
  function openLinkedRecipe() {
    const target = document.getElementById(location.hash.slice(1));
    if (target?.matches('.recipe')) target.querySelector('details').open = true;
  }
  document.querySelectorAll('.recipe-shortcuts a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.hash.slice(1));
      if (target?.matches('.recipe')) target.querySelector('details').open = true;
    });
  });
  window.addEventListener('hashchange', openLinkedRecipe);
  openLinkedRecipe();
  // Print collapsed recipes as well, then restore the reader's open/closed state.
  let closed = [];
  window.addEventListener('beforeprint', () => {
    closed = [...document.querySelectorAll('.recipe-details:not([open])')];
    closed.forEach(details => { details.open = true; });
  });
  window.addEventListener('afterprint', () => {
    closed.forEach(details => { details.open = false; });
    closed = [];
  });
})();
