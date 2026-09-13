'use strict';

/**
 * @file sw.js — Service Worker de Setas OS.
 *
 * Existe por una razón concreta de campo: sin él, un operario que cierra la
 * aplicación en una zona sin cobertura de Tenjo no puede volver a abrirla hasta
 * recuperar señal. El trabajo encolado en IndexedDB sobrevive, pero no puede
 * verlo ni añadir nada — que es justo cuando más lo necesita.
 *
 * No hay lista de assets escrita a mano. Una lista así se desincroniza en cuanto
 * alguien añade un módulo a auth-gate.js, y el fallo aparece meses después como
 * "la aplicación no abre sin señal". En su lugar: se precachea sólo lo mínimo
 * para arrancar, y todo lo demás se guarda a medida que se pide. Basta con que
 * el operario haya abierto la aplicación una vez con señal.
 *
 * CACHE_VERSION la estampa build.js con el hash de simulador-app.jsx, así que
 * cada reconstrucción invalida la caché entera y nadie queda con un shell viejo.
 */

// build:cache-version
const CACHE_VERSION = '7336831d9eee';
const CACHE = `setas-os-${CACHE_VERSION}`;

// Lo imprescindible para pintar algo y llegar al gate de autenticación.
const BOOT = ['./', './Setas OS v5.dc.html', './error-buffer.js', './favicon.svg'];

const CACHEABLE = /\.(?:js|css|otf|ttf|woff2?|svg|png|jpe?g|webp|json)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll falla entero si un solo recurso falla; aquí un asset ausente no
    // debe impedir que el service worker se instale.
    await Promise.all(BOOT.map(u => cache.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

/**
 * Sólo se toca lo estático y del mismo origen. Todo lo demás —Firestore, Auth,
 * la función de aceptación, cualquier CDN— pasa intacto: cachear una respuesta
 * de Firebase serviría datos viejos como si fueran actuales, que es peor que no
 * tener conexión.
 */
const shouldHandle = (request) => {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (request.mode === 'navigate') return true;
  return CACHEABLE.test(url.pathname);
};

self.addEventListener('fetch', (event) => {
  if (!shouldHandle(event.request)) return;   // sin respondWith: pasa a la red

  const isNavigation = event.request.mode === 'navigate';

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    if (isNavigation) {
      // Red primero para el documento: así un despliegue se ve de inmediato.
      // La caché sólo entra cuando no hay red, que es el caso que motiva todo esto.
      try {
        const fresh = await fetch(event.request);
        if (fresh && fresh.ok) cache.put(event.request, fresh.clone());
        return fresh;
      } catch (e) {
        return (await cache.match(event.request))
          || (await cache.match('./Setas OS v5.dc.html'))
          || Response.error();
      }
    }

    // Estáticos: se sirve lo cacheado al instante y se revalida por detrás, de
    // modo que la siguiente carga ya trae la versión nueva sin bloquear ésta.
    const cached = await cache.match(event.request);
    const network = fetch(event.request).then((res) => {
      // Nunca se guarda una respuesta opaca ni un error: quedaría cacheado un
      // fallo y el recurso parecería roto hasta que cambie la versión.
      if (res && res.ok && res.type === 'basic') cache.put(event.request, res.clone());
      return res;
    }).catch(() => null);

    return cached || (await network) || Response.error();
  })());
});
