'use strict';
// Species text and all plate notes remain readable without scripting.
(() => {
  const page = document.querySelector('.editorial-page');
  if (!page) return;

  // The complete text is open in HTML for reading and printing without JS.
  page.querySelectorAll('details').forEach(details => { details.open = false; });

  page.querySelectorAll('.editorial-plate').forEach(plate => {
    const points = [...plate.querySelectorAll('[data-point]')];
    const notes = [...plate.querySelectorAll('[data-plate-note]')];
    if (!points.length || points.some(point => !notes.some(note => note.id === point.getAttribute('aria-controls')))) return;

    const select = point => {
      points.forEach(button => button.setAttribute('aria-pressed', String(button === point)));
      notes.forEach(note => { note.hidden = note.id !== point.getAttribute('aria-controls'); });
    };
    select(points[0]);
    points.forEach(point => {
      point.hidden = false;
      point.addEventListener('click', () => select(point));
    });
    const hint = plate.querySelector('.figure-hint');
    if (hint) hint.hidden = false;
  });

  // Citations and older shared fragments also reach text inside closed details.
  const revealFragment = (fragment, scroll = false) => {
    let id;
    try { id = decodeURIComponent(fragment.slice(1)); } catch { return; }
    const target = id && document.getElementById(id);
    if (!target || !page.contains(target)) return;
    for (let node = target; node && page.contains(node); node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
  };
  page.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) revealFragment(link.getAttribute('href'), location.hash === link.getAttribute('href'));
  });
  window.addEventListener('hashchange', () => revealFragment(location.hash, true));
  if (location.hash) document.fonts.ready.then(() => revealFragment(location.hash, true));

  const printButton = page.querySelector('#print-editorial');
  if (printButton) {
    printButton.hidden = false;
    printButton.addEventListener('click', () => window.print());
  }
  const year = page.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Print the whole reference text, then restore the reader's chosen state.
  let printState;
  window.addEventListener('beforeprint', () => {
    if (printState) return;
    printState = [...page.querySelectorAll('details')].map(details => [details, details.open]);
    printState.forEach(([details]) => { details.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printState?.forEach(([details, open]) => { details.open = open; });
    printState = undefined;
  });
})();
