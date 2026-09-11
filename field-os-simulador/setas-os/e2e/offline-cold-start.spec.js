'use strict';

/**
 * La razón de ser del service worker: que un operario en una zona sin cobertura
 * de Tenjo pueda cerrar la aplicación y volver a abrirla.
 *
 * Antes de esto, recargar sin señal daba la pantalla de error de red del
 * navegador y el trabajo encolado quedaba inalcanzable hasta recuperar
 * cobertura — justo cuando más falta hacía.
 */

const { test, expect } = require('@playwright/test');

const APP = '/Setas%20OS%20v5.dc.html';

test('la aplicación arranca en frío sin conexión', async ({ page, context }) => {
  test.setTimeout(90_000);

  // Primera visita con señal: es cuando el service worker se instala y la caché
  // se llena con lo que la aplicación va pidiendo.
  await page.goto(APP);
  await page.locator('#setas-auth-gate').waitFor({ state: 'hidden', timeout: 25000 });
  await page.locator('main.app-main').waitFor({ state: 'visible' });

  const activated = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'unsupported';
    const reg = await navigator.serviceWorker.ready;
    return reg.active ? 'active' : 'inactive';
  });
  expect(activated, 'el service worker debe quedar activo tras la primera visita').toBe('active');

  // Segunda carga todavía con señal: deja en caché lo que la primera pidió.
  await page.reload();
  await page.locator('main.app-main').waitFor({ state: 'visible' });

  // Se corta la señal y el operario cierra y reabre la aplicación.
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });

  // Sin service worker esto era la pantalla de error del navegador.
  expect(response, 'debe haber una respuesta, no un fallo de red').not.toBeNull();

  const shellLoaded = await page.evaluate(() => ({
    title: document.title,
    hasRoot: !!document.querySelector('#root, .sim-root, main.app-main, #setas-auth-gate'),
    servedByWorker: !!navigator.serviceWorker.controller,
  }));

  expect(shellLoaded.hasRoot, 'el documento se sirvió desde la caché, no un error de red').toBe(true);
  expect(shellLoaded.servedByWorker, 'el service worker debe estar controlando la página').toBe(true);

  await context.setOffline(false);
});

test('el service worker no intercepta las peticiones a Firebase', async ({ page }) => {
  // Cachear una respuesta de Firestore o de la función de aceptación serviría
  // estado viejo como si fuera actual — peor que no tener conexión.
  await page.goto(APP);
  await page.locator('#setas-auth-gate').waitFor({ state: 'hidden', timeout: 25000 });
  await page.evaluate(() => navigator.serviceWorker.ready);

  const cachedUrls = await page.evaluate(async () => {
    const names = await caches.keys();
    const urls = [];
    for (const n of names) {
      const keys = await (await caches.open(n)).keys();
      for (const req of keys) urls.push(req.url);
    }
    return urls;
  });

  const foreign = cachedUrls.filter(u => !u.includes('127.0.0.1') && !u.includes('localhost'));
  expect(foreign, `no debe cachearse nada de otro origen: ${foreign.join(', ')}`).toEqual([]);

  // Se comprueba el HOST, no la ruta: la aplicación tiene su propio directorio
  // `firebase/` con código local que sí debe cachearse. Filtrar por subcadena
  // marcaba esos ficheros como si fueran respuestas del backend.
  const REMOTE = /(googleapis\.com|cloudfunctions\.net|firebaseio\.com|firebaseapp\.com)$/;
  const backend = cachedUrls.filter((u) => REMOTE.test(new URL(u).hostname));
  expect(backend, 'ninguna respuesta del backend de Firebase debe quedar en caché').toEqual([]);

  // Y el código local de la aplicación sí debe estar, o no habría arranque offline.
  expect(cachedUrls.some(u => u.endsWith('/simulador-app.js')),
    'el bundle debe quedar cacheado para poder arrancar sin señal').toBe(true);
});
