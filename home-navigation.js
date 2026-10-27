'use strict';
// Preserve previously shared homepage fragments after moving sections to their own pages.
(() => {
  const routes = { '#coleccion': '/setas', '#cuaderno': '/setas', '#en-la-cocina': '/cocina', '#para-chefs': '/restaurantes', '#origen': '/home', '#aprender': '/mundo-micelar' };
  function resolveSection() {
    const target = routes[location.hash];
    const fragment = location.hash === '#origen' ? '#inicio' : location.hash;
    if (target && !document.getElementById(location.hash.slice(1))) location.replace(`${target}${location.search}${fragment}`);
  }
  window.addEventListener('hashchange', resolveSection);
  resolveSection();
})();
