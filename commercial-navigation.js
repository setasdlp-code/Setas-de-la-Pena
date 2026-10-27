'use strict';
// Keep historic shared-link context without loading typography experiments.
(() => {
  const pairing = new URLSearchParams(location.search).get('pairing');
  if (!['mono', 'bricolage', 'libre'].includes(pairing)) return;
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.getAttribute('href').startsWith('#')) return;
    const target = new URL(link.href);
    if (target.origin === location.origin && /^\/(home|setas|cocina|restaurantes|proyecto|mundo-micelar|shiitake|recetas|recetas-eryngii|recetas-melena|especies\/(shiitake|melena-de-leon|eryngii))$/.test(target.pathname)) {
      target.searchParams.set('pairing', pairing);
      link.href = target.href;
    }
  });
})();
