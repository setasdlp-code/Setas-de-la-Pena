'use strict';
// ── bridge-protocol.js — contrato único de postMessage entre el shell (Setas OS
// v5.dc.html) y el iframe del Banco Climático (climate-bench.html) ──
//
// Antes de este archivo, cada lado inventaba su propio shape de mensaje por
// separado: el hijo→padre (climate-alert) y el padre→hijo (clima-visibility,
// agregado después) no compartían ni una constante ni una validación. Este
// archivo es la única fuente de verdad — cargado por AMBOS documentos vía
// <script src="bridge-protocol.js">, no importado por un bundler — así que
// un mensaje nuevo se agrega en un solo lugar en vez de reinventarse.
//
// Cómo agregar un mensaje nuevo:
//   1. Añadir una entrada a BRIDGE_MESSAGES con su source/kind/direction/shape.
//   2. Emisor: sendBridgeMessage(targetWindow, BRIDGE_MESSAGES.TU_MENSAJE, { ...payload }).
//   3. Receptor: en el listener de 'message', usar isBridgeMessage(event.data, BRIDGE_MESSAGES.TU_MENSAJE)
//      antes de leer los campos del payload.
(function () {
  const BRIDGE_MESSAGES = {
    // climate-bench.html → Setas OS v5.dc.html
    // Disparado por notifyParent() cuando un incidente de cámara llega a
    // severidad "crítico" — alimenta el registro de clima y el badge de
    // Control en el shell.
    CLIMATE_ALERT: {
      source: 'climate-bench',
      kind: 'climate-alert',
      direction: 'child-to-parent',
      // payload: { chamber: string, phase: string, metric: string, detail: string, at: string }
    },
    // Setas OS v5.dc.html → climate-bench.html
    // Disparado desde renderVals() cada vez que cambia el workspace activo del
    // shell — le dice al iframe (1x1px, siempre montado) si debe pintar su DOM
    // (workspace 'control') o solo seguir simulando en segundo plano (para no
    // perder alertas mientras el usuario está en Formular/Producción/Bitácora).
    CLIMA_VISIBILITY: {
      source: 'setas-os-shell',
      kind: 'clima-visibility',
      direction: 'parent-to-child',
      // payload: { active: boolean }
    },
  };

  // ¿Este event.data corresponde al mensaje `def`? Uso: dentro de un listener
  // de 'message', filtrar por source+kind antes de confiar en el resto del payload.
  const isBridgeMessage = (data, def) => !!data && !!def && data.source === def.source && data.kind === def.kind;

  // Envía un mensaje del contrato a targetWindow (contentWindow de un iframe, o
  // window.parent). payload son los campos adicionales definidos en el `shape`
  // de `def` — source/kind los pone esta función, no hace falta repetirlos.
  const sendBridgeMessage = (targetWindow, def, payload) => {
    if (!targetWindow || !def) return;
    try {
      targetWindow.postMessage(Object.assign({ source: def.source, kind: def.kind }, payload), '*');
    } catch (e) { /* target ya no existe / cross-origin inesperado */ }
  };

  const api = { BRIDGE_MESSAGES, isBridgeMessage, sendBridgeMessage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasBridgeProtocol = api;
})();
