'use strict';
// Editorial pages remain fully readable without scripting.
// Keep the overview open on a wide screen; native details stay open without JS.
const editorialWide = window.matchMedia('(min-width: 1000px)');
document.querySelectorAll('.editorial-data').forEach(details => { details.open = editorialWide.matches; });
const printEditorial = document.querySelector('#print-editorial');
if (printEditorial) {
  printEditorial.hidden = false;
  printEditorial.addEventListener('click', () => window.print());
}
const editorialYear = document.querySelector('#year');
if (editorialYear) editorialYear.textContent = new Date().getFullYear();

// Include the reference data on paper and restore the reader's accordion state.
let editorialPrintState;
window.addEventListener('beforeprint', () => {
  if (editorialPrintState) return;
  editorialPrintState = [...document.querySelectorAll('.editorial-data')].map(details => [details, details.open]);
  editorialPrintState.forEach(([details]) => { details.open = true; });
});
window.addEventListener('afterprint', () => {
  editorialPrintState?.forEach(([details, open]) => { details.open = open; });
  editorialPrintState = undefined;
});
