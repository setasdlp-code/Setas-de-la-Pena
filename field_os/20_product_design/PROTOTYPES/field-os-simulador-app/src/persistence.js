(function bootstrapFieldStore() {
  'use strict';

  const API_URL = '/api/state';
  const ALLOWED_KEY = /^(sdp_|setas_|sim_)[a-z0-9_:-]+$/i;
  const memory = new Map();
  let mode = 'starting';
  let syncTimer = null;
  let syncQueue = Promise.resolve();

  const entriesObject = () => Object.fromEntries(memory.entries());

  const collectLegacyState = () => {
    const entries = {};
    try {
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (key && ALLOWED_KEY.test(key)) entries[key] = window.localStorage.getItem(key);
      }
    } catch (_) {
      // Algunos navegadores bloquean localStorage; la migración es opcional.
    }
    return entries;
  };

  const clearLegacyState = (keys) => {
    try {
      for (const key of keys) window.localStorage.removeItem(key);
    } catch (_) {
      // El servidor ya es la fuente de verdad aunque la limpieza local no sea posible.
    }
  };

  const showOfflineBanner = () => {
    if (document.getElementById('field-store-warning')) return;
    const banner = document.createElement('div');
    banner.id = 'field-store-warning';
    banner.setAttribute('role', 'alert');
    banner.textContent = 'Servidor de datos no disponible: los cambios de esta sesión no se guardarán.';
    Object.assign(banner.style, {
      position: 'fixed', inset: '0 0 auto 0', zIndex: '2000', padding: '9px 14px',
      background: '#8B1A1A', color: '#fff', font: '700 12px/1.3 system-ui, sans-serif',
      textAlign: 'center'
    });
    document.body.appendChild(banner);
  };

  const requestSync = (useBeacon = false) => {
    if (mode !== 'server') return Promise.resolve(false);
    const body = JSON.stringify({ entries: entriesObject() });

    if (useBeacon && navigator.sendBeacon) {
      return Promise.resolve(navigator.sendBeacon(
        API_URL,
        new Blob([body], { type: 'application/json' })
      ));
    }

    syncQueue = syncQueue.then(async () => {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true
      });
      if (!response.ok) throw new Error(`Persistencia HTTP ${response.status}`);
      return true;
    }).catch((error) => {
      console.warn('No fue posible sincronizar Field OS.', error);
      return false;
    });
    return syncQueue;
  };

  const scheduleSync = () => {
    if (mode !== 'server') return;
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => requestSync(false), 180);
  };

  const ready = (async () => {
    try {
      const response = await fetch(API_URL, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`Persistencia HTTP ${response.status}`);
      const payload = await response.json();
      const serverEntries = payload.entries && typeof payload.entries === 'object'
        ? payload.entries
        : {};
      const legacyEntries = collectLegacyState();
      const initialEntries = Object.keys(serverEntries).length > 0 ? serverEntries : legacyEntries;

      for (const [key, value] of Object.entries(initialEntries)) {
        if (ALLOWED_KEY.test(key) && typeof value === 'string') memory.set(key, value);
      }

      mode = 'server';
      if (Object.keys(serverEntries).length === 0 && Object.keys(legacyEntries).length > 0) {
        await requestSync(false);
      }
      clearLegacyState(Object.keys(legacyEntries));
      document.documentElement.dataset.persistence = 'server';
    } catch (error) {
      mode = 'memory';
      document.documentElement.dataset.persistence = 'memory';
      console.warn('Field OS inició sin persistencia central.', error);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showOfflineBanner, { once: true });
      } else {
        showOfflineBanner();
      }
    }
  })();

  window.FieldStore = Object.freeze({
    ready,
    get mode() { return mode; },
    getItem(key) {
      return memory.has(String(key)) ? memory.get(String(key)) : null;
    },
    setItem(key, value) {
      const normalizedKey = String(key);
      if (!ALLOWED_KEY.test(normalizedKey)) throw new Error(`Clave no permitida: ${normalizedKey}`);
      memory.set(normalizedKey, String(value));
      scheduleSync();
    },
    removeItem(key) {
      memory.delete(String(key));
      scheduleSync();
    },
    flush() {
      window.clearTimeout(syncTimer);
      return requestSync(false);
    }
  });

  window.addEventListener('pagehide', () => {
    window.clearTimeout(syncTimer);
    requestSync(true);
  });
})();
