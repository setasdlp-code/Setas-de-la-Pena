// Carga DS-2026, el sistema vivo, en esta plantilla.
//
// Antes cargaba los tokens de field-os-identity con `base = '../..'`. Esa
// capa quedó congelada; DS-2026 es la que se mantiene, la que las compuertas
// verifican y la que usa la aplicación. _ds2026-compat.css traduce el
// vocabulario que estas plantillas usan y el sistema no publica.
(() => {
  const DS = '../../../ds-2026';
  const hojas = [DS + '/tokens/fonts.css', DS + '/index.css', '../_ds2026-compat.css'];
  for (const href of hojas) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.onerror = () => console.error('ds-base.js: no cargó ' + href);
    document.head.appendChild(l);
  }
})();
