'use strict';
// Gaya + IBM Plex is the default; query parameters opt into alternate treatments.
const pairing = new URLSearchParams(location.search).get('pairing');
if (['bricolage', 'libre', 'mono'].includes(pairing)) {
  document.documentElement.dataset.pairing = pairing;
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) return;
    const target = new URL(href, location.href);
    if (target.origin === location.origin && /\/(index|shiitake|recetas)\.html$/.test(target.pathname)) {
      target.searchParams.set('pairing', pairing);
      link.href = target.href;
    }
  });
}
