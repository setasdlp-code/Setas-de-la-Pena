'use strict';

// Canonical, dependency-free URL contract for the Setas OS shell and React
// surface. The shell remains the owner of navigation state; this module only
// makes its public route representation deterministic and reversible.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SetasOSNavigation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const VIEWS = Object.freeze([
    'home',
    'inicio',
    'catalogo',
    'formular',
    'inventario',
    'produccion',
    'schedule',
    'clima',
    'bitacora',
    'labExtraction',
    'bioCheck',
    'aprender',
  ]);

  const VIEW_SET = new Set(VIEWS);
  const VIEW_ALIASES = Object.freeze({
    camaras: 'clima',
    iot: 'clima',
    telemetria: 'clima',
    optimizar: 'formular',
    hoy: 'home',
    lotes: 'bitacora',
    salas: 'clima',
    recetas: 'catalogo',
    conocimiento: 'aprender',
    // El Recetario se fusionó con el Catálogo de especies en una sola vista
    // (2026-09). Se conserva como alias para no romper enlaces ni marcadores.
    dashboard: 'catalogo',
  });

  const DESTINATION_ROUTES = Object.freeze({
    hoy: Object.freeze(['home', 'inicio']),
    lotes: Object.freeze(['bitacora', 'schedule']),
    salas: Object.freeze(['clima']),
    inventario: Object.freeze(['inventario']),
    recetas: Object.freeze(['catalogo', 'formular', 'produccion']),
    conocimiento: Object.freeze(['aprender', 'labExtraction', 'bioCheck']),
  });

  function normalizeView(value, fallback = 'home') {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    const normalized = VIEW_ALIASES[trimmed] || trimmed;
    return VIEW_SET.has(normalized) ? normalized : fallback;
  }

  function searchFrom(locationLike) {
    if (typeof locationLike === 'string') {
      return locationLike.startsWith('?') ? locationLike : new URL(locationLike, 'https://setas.local').search;
    }
    return locationLike && typeof locationLike.search === 'string' ? locationLike.search : '';
  }

  function readLocation(locationLike) {
    const params = new URLSearchParams(searchFrom(locationLike));
    return Object.freeze({
      view: normalizeView(params.get('view')),
    });
  }

  function destinationForView(value, fallback = 'hoy') {
    const view = normalizeView(value, null);
    if (!view) return fallback;
    const match = Object.entries(DESTINATION_ROUTES).find(([, routes]) => routes.includes(view));
    return match ? match[0] : fallback;
  }

  function viewForDestination(destination, fallback = 'home') {
    const routes = DESTINATION_ROUTES[destination];
    return routes ? routes[0] : normalizeView(destination, fallback);
  }

  function navigate(win, requestedView, options = {}) {
    const view = normalizeView(requestedView, null);
    if (!view || !win || !win.location || !win.history) return null;

    const url = new URL(win.location.href);
    url.searchParams.set('view', view);
    if (url.href !== win.location.href) {
      const method = options.replace === true ? 'replaceState' : 'pushState';
      win.history[method](null, '', url);
    }
    return view;
  }

  function resolveOperationalTarget(locationLike) {
    const ti = (typeof module !== 'undefined' && module.exports)
      ? require('./trace-identity.js')
      : (typeof globalThis !== 'undefined' ? globalThis.SetasTraceIdentity : null);

    if (!ti || typeof ti.resolveTraceIdentity !== 'function') {
      return null;
    }

    const identity = ti.resolveTraceIdentity(locationLike);
    return identity && identity.valid ? identity : null;
  }

  return Object.freeze({
    VIEWS,
    VIEW_ALIASES,
    DESTINATION_ROUTES,
    normalizeView,
    destinationForView,
    viewForDestination,
    readLocation,
    resolveOperationalTarget,
    navigate,
  });
});
