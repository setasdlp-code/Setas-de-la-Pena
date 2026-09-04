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
  ]);

  const VIEW_SET = new Set(VIEWS);
  const VIEW_ALIASES = Object.freeze({
    camaras: 'clima',
    iot: 'clima',
    telemetria: 'clima',
    optimizar: 'formular',
    // El Recetario se fusionó con el Catálogo de especies en una sola vista
    // (2026-09). Se conserva como alias para no romper enlaces ni marcadores.
    dashboard: 'catalogo',
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

  return Object.freeze({
    VIEWS,
    VIEW_ALIASES,
    normalizeView,
    readLocation,
    navigate,
  });
});
