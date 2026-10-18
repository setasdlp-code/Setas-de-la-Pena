'use strict';

/**
 * @file sw.js — Service Worker de Setas OS.
 *
 * Existe por una razón concreta de campo: sin él, un operario que cierra la
 * aplicación en una zona sin cobertura de Tenjo no puede volver a abrirla hasta
 * recuperar señal. El trabajo encolado en IndexedDB sobrevive, pero no puede
 * verlo ni añadir nada — que es justo cuando más lo necesita.
 *
 * build.js genera la lista de assets de runtime. Si una versión anterior ya
 * guardó la app autenticada, la actualización se guarda completa antes de
 * activar. Una instalación nueva sólo descarga BOOT: el gate sigue aplazando
 * las solicitudes del runtime hasta que el usuario inicia sesión.
 *
 * CACHE_VERSION la estampa build.js con el hash de los assets de runtime:
 * también cambian de versión los despliegues de sólo CSS, módulos o vendor.
 */

// build:cache-version
const CACHE_VERSION = '73f5abb350fd';
const CACHE = `setas-os-${CACHE_VERSION}`;

// build:release-assets
const RELEASE_ASSETS = ["./Setas%20OS%20v5.dc.html","./_standalone_imgs/banner-botanico-sketch.jpg","./_standalone_imgs/banner.png","./_standalone_imgs/cardo.png","./_standalone_imgs/enoki.png","./_standalone_imgs/grey-mushroom.png","./_standalone_imgs/lions-mane.png","./_standalone_imgs/logo-sdlp.png","./_standalone_imgs/mountain-juaica.jpg","./_standalone_imgs/mountain-juaica.png","./_standalone_imgs/nameko.png","./_standalone_imgs/orellana-blanca.png","./_standalone_imgs/orellana-rosa.png","./_standalone_imgs/reishi.png","./_standalone_imgs/shiitake.png","./actuator-controller.js","./anomaly-thresholds.js","./assets/fonts/GayaPatched-Black.otf","./assets/fonts/GayaPatched-BlackItalic.otf","./assets/fonts/GayaPatched-Bold.otf","./assets/fonts/GayaPatched-BoldItalic.otf","./assets/fonts/GayaPatched-Light.otf","./assets/fonts/GayaPatched-LightItalic.otf","./assets/fonts/GayaPatched-Medium.otf","./assets/fonts/GayaPatched-MediumItalic.otf","./assets/fonts/GayaPatched-Thin.otf","./assets/fonts/GayaPatched-ThinItalic.otf","./assets/fonts/IBMPlexMono-Medium.ttf","./assets/fonts/IBMPlexMono-Regular.ttf","./assets/fonts/IBMPlexMono-SemiBold.ttf","./assets/fonts/IBMPlexSans-Bold.ttf","./assets/fonts/IBMPlexSans-Light.ttf","./assets/fonts/IBMPlexSans-Medium.ttf","./assets/fonts/IBMPlexSans-Regular.ttf","./assets/fonts/IBMPlexSans-SemiBold.ttf","./assets/logo-sdlp.png","./assets/mountain-juaica.jpg","./assets/mountain-juaica.png","./assets/screenshots/screenshot_bitacora.png","./assets/screenshots/screenshot_control.png","./assets/screenshots/screenshot_formular.png","./assets/screenshots/screenshot_mobile_home.png","./assets/screenshots/screenshot_produccion.png","./assets/tokens/swiss-botanical-tokens.css","./batch-sheet.js","./batch-traceability.js","./biological-clock.js","./bitacora-model.js","./bridge-protocol.js","./build-ground-truth-corpus.js","./build.js","./capture_screenshots.js","./climate-bench.html","./climate-math.js","./climate-sparkline.js","./co-cultivation-matrix.js","./contamination-risk.js","./contamination-workflow.js","./cultivation-copilot.js","./cycle-evidence.js","./day-close.js","./device-sync.js","./ds-2026/assets/fonts/GayaPatched-Black.otf","./ds-2026/assets/fonts/GayaPatched-BlackItalic.otf","./ds-2026/assets/fonts/GayaPatched-Bold.otf","./ds-2026/assets/fonts/GayaPatched-BoldItalic.otf","./ds-2026/assets/fonts/GayaPatched-Italic.otf","./ds-2026/assets/fonts/GayaPatched-Light.otf","./ds-2026/assets/fonts/GayaPatched-LightItalic.otf","./ds-2026/assets/fonts/GayaPatched-Medium.otf","./ds-2026/assets/fonts/GayaPatched-MediumItalic.otf","./ds-2026/assets/fonts/GayaPatched-Regular.otf","./ds-2026/assets/fonts/GayaPatched-Thin.otf","./ds-2026/assets/fonts/GayaPatched-ThinItalic.otf","./ds-2026/assets/fonts/IBMPlexMono-Medium.ttf","./ds-2026/assets/fonts/IBMPlexMono-Regular.ttf","./ds-2026/assets/fonts/IBMPlexMono-SemiBold.ttf","./ds-2026/assets/fonts/IBMPlexSans-Bold.ttf","./ds-2026/assets/fonts/IBMPlexSans-Light.ttf","./ds-2026/assets/fonts/IBMPlexSans-Medium.ttf","./ds-2026/assets/fonts/IBMPlexSans-Regular.ttf","./ds-2026/assets/fonts/IBMPlexSans-SemiBold.ttf","./ds-2026/assets/icons/alert.svg","./ds-2026/assets/icons/atmosphere.svg","./ds-2026/assets/icons/check.svg","./ds-2026/assets/icons/clock.svg","./ds-2026/assets/icons/droplet.svg","./ds-2026/assets/icons/flask.svg","./ds-2026/assets/icons/leaf.svg","./ds-2026/assets/icons/mushroom.svg","./ds-2026/assets/icons/package.svg","./ds-2026/assets/icons/provenance-calculated.svg","./ds-2026/assets/icons/provenance-estimated.svg","./ds-2026/assets/icons/provenance-manual.svg","./ds-2026/assets/icons/provenance-measured.svg","./ds-2026/assets/icons/provenance-pending.svg","./ds-2026/assets/icons/provenance-simulated.svg","./ds-2026/assets/icons/provenance-target.svg","./ds-2026/assets/icons/room.svg","./ds-2026/assets/icons/substrate-bag.svg","./ds-2026/assets/icons/sync-error.svg","./ds-2026/assets/icons/sync-offline.svg","./ds-2026/assets/icons/sync-pending.svg","./ds-2026/assets/icons/sync-synced.svg","./ds-2026/assets/icons/thermometer.svg","./ds-2026/assets/img/reishi-botanical-engraving.jpg","./ds-2026/assets/img/reishi-botanical-engraving.png","./ds-2026/assets/img/species/cardo.png","./ds-2026/assets/img/species/enoki.png","./ds-2026/assets/img/species/grey-mushroom.png","./ds-2026/assets/img/species/lions-mane.png","./ds-2026/assets/img/species/nameko.png","./ds-2026/assets/img/species/orellana-blanca.png","./ds-2026/assets/img/species/orellana-rosa.png","./ds-2026/assets/img/species/reishi.png","./ds-2026/assets/img/species/shiitake.png","./ds-2026/assets/textures/paper-fibre.png","./ds-2026/assets/textures/paper-grain.png","./ds-2026/components/base.css","./ds-2026/components/components.css","./ds-2026/components/core/color.css","./ds-2026/components/core/foundations.css","./ds-2026/components/core/grid.css","./ds-2026/components/core/interaction.css","./ds-2026/components/core/layout.css","./ds-2026/components/core/spacing.css","./ds-2026/components/core/typography.css","./ds-2026/components/editorial.css","./ds-2026/components/instrument.css","./ds-2026/components/market/archive.css","./ds-2026/components/market/packaging.css","./ds-2026/components/market/traceability.css","./ds-2026/components/operations/capture.css","./ds-2026/components/operations/event.css","./ds-2026/components/operations/inventory.css","./ds-2026/components/operations/lot.css","./ds-2026/components/operations/room.css","./ds-2026/components/operations/sync.css","./ds-2026/components/operations/task.css","./ds-2026/components/operations/telemetry.css","./ds-2026/components/operations/thermal.css","./ds-2026/components/shared/action.css","./ds-2026/components/shared/actions.css","./ds-2026/components/shared/figure.css","./ds-2026/components/shared/forms.css","./ds-2026/components/shared/metadata.css","./ds-2026/components/shared/provenance.css","./ds-2026/components/shared/reading.css","./ds-2026/components/shared/segment.css","./ds-2026/components/shared/species.css","./ds-2026/components/shared/status.css","./ds-2026/components/shared/view-state.css","./ds-2026/distribution-manifest.json","./ds-2026/index.css","./ds-2026/market.css","./ds-2026/operations.css","./ds-2026/tokens/colors.json","./ds-2026/tokens/domain.json","./ds-2026/tokens/fonts.css","./ds-2026/tokens/primitives.json","./ds-2026/tokens/semantic.json","./ds-2026/tokens/spacing.json","./ds-2026/tokens/tokens.css","./ds-2026/tokens/typography.json","./error-buffer.js","./esp32-telemetry-adapter.js","./experiment-model.js","./extraction-factors.json","./favicon.svg","./field-action-sheet.js","./field-event-account.js","./field-event-callable-transport.js","./field-event-contracts.js","./field-event-mock-transport.js","./field-event-queue.js","./field-event-reconcile.js","./field-event-sync.js","./field-events-model.js","./field-qr-events.js","./field-qr-resolve.js","./fieldos-tokens.css","./firebase/ai-logic.js","./firebase/auth-gate.js","./firebase/bitacora-sync.js","./firebase/db.js","./firebase/error-monitor.js","./firebase/eventos-cultivo-sync.js","./firebase/firebase-auth-bootstrap.js","./firebase/firebase-config.js","./firebase/firebase-init.js","./firebase/public-trace-sync.js","./firebase/remote-sync.js","./firebase/scripts/asignar-sync-claim.js","./firebase/scripts/backfill-public-lotes.js","./firebase/telemetria-sync.js","./flush-forecast-engine.js","./formulator-api.js","./ground-truth-regression.js","./guia-setas-os.html","./harvest-calendar.js","./historical-calibration.js","./ingredient-market-costs.js","./ingredient-promotion-registry.js","./ingredient-provenance.js","./ingredient-research-candidates.js","./inventario.js","./inventory-consumption.js","./inventory-entries.js","./inventory-ledger.js","./launch-plan.js","./live-telemetry-bridge.js","./lot-record.js","./mass-balance.js","./navigation-state.js","./operational-metrics.js","./perito-context.js","./perito-economy-bridge.js","./perito-economy.js","./perito-evidence.js","./perito-readiness.js","./perito-regression-report.js","./perito-scenarios-bridge.js","./perito-scenarios.js","./perito-scoring-hook.js","./perito-ui-bridge.js","./perito-workbench-core.js","./perito-workbench-worker.js","./playwright.config.js","./post-harvest-engine.js","./probe-callable.js","./production-learning-bridge.js","./production-readiness.js","./prototype-readiness.js","./provenance.js","./public-trace-dto.js","./public/trace.html","./purchases.js","./qr-mini.js","./recetario-firestore-snapshot.js","./recetario-model-bridge.js","./recipe-lifecycle.js","./recipe-optimizer.js","./recipe-recommender.js","./room-cycle-targets.js","./room-cycle.js","./room-state.js","./scoring.js","./sensor-health.js","./setas-os-legacy.css","./setas-os-workflow.js","./setas-os.json","./sim.css","./simulador-app.js","./species-targets.js","./sterilization-kinetics.js","./substrate-analysis.js","./substrate-catalog.js","./substrate-diagnosis.js","./support.js","./sweep-journal.js","./sync-merge.js","./sync-queue.js","./task-engine.js","./telemetry-contract.js","./theme-lab.html","./today-exceptions.js","./trace-identity.js","./utils/storage.js","./ux-v2-preview.html","./vendor/firebase/firebase-app.js","./vendor/firebase/firebase-auth.js","./vendor/firebase/firebase-firestore.js","./vendor/jsQR.js","./vendor/lucide.min.js","./vendor/react-dom.production.min.js","./vendor/react.production.min.js","./vision-diagnosis.js"];

// Lo imprescindible para pintar algo y llegar al gate de autenticación.
const BOOT = ['./', './Setas OS v5.dc.html', './error-buffer.js', './favicon.svg', './vendor/jsQR.js', './_standalone_imgs/logo-sdlp.png'];

const CACHEABLE = /\.(?:js|css|otf|ttf|woff2?|svg|png|jpe?g|webp|json)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll es atómico: si falla la descarga o la cuota, el worker anterior
    // sigue activo con su caché completa. Nunca activar una versión parcial.
    try {
      const previous = (await caches.keys()).filter(n => n.startsWith('setas-os-') && n !== CACHE);
      const bundleUrl = new URL('./simulador-app.js', self.location.href);
      const warmed = await Promise.all(previous.map(async name => !!(await (await caches.open(name)).match(bundleUrl))));
      // Normalizar antes de deduplicar: BOOT contiene espacios y la lista
      // generada los codifica; addAll rechaza dos Requests con la misma URL.
      const urls = [...new Set([...BOOT, ...(warmed.some(Boolean) ? RELEASE_ASSETS : [])]
        .map(u => new URL(u, self.location.href).href))];
      await cache.addAll(urls.map(u => new Request(u, { cache: 'reload' })));
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('setas-os-') && n !== CACHE).map(n => caches.delete(n)));
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
        if (fresh && fresh.ok) {
          try { await cache.put(event.request, fresh.clone()); } catch {}
        }
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
    const network = fetch(event.request).then(async (res) => {
      // Nunca se guarda una respuesta opaca ni un error: quedaría cacheado un
      // fallo y el recurso parecería roto hasta que cambie la versión.
      if (res && res.ok && res.type === 'basic') {
        // La cuota no debe convertir una respuesta online válida en un error.
        try { await cache.put(event.request, res.clone()); } catch {}
      }
      return res;
    }).catch(() => null);
    // El navegador puede cerrar el worker al devolver el hit de caché. Mantener
    // viva la revalidación evita perder un asset recién actualizado al reabrir.
    event.waitUntil(network.then(() => {}));

    return cached || (await network) || Response.error();
  })());
});
