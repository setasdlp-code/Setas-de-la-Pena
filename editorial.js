'use strict';
// Editorial pages remain fully readable without scripting.
const printEditorial = document.querySelector('#print-editorial');
if (printEditorial) {
  printEditorial.hidden = false;
  printEditorial.addEventListener('click', () => window.print());
}
const editorialYear = document.querySelector('#year');
if (editorialYear) editorialYear.textContent = new Date().getFullYear();
