'use strict';

/**
 * Guardas sobre los LLAMADORES, no sobre las funciones.
 *
 * Las pruebas de paridad existentes comparan buildActionSheetModel contra la
 * regla del servidor y pasan. No sirvieron de nada: cuatro PRs introdujeron
 * rutas que ni siquiera llaman a esa función — derivaban el estado con una
 * tabla local paralela, el rol desde props.isAdmin, y escribían lifecycleState
 * directamente. La red estaba bajo la función y el problema pasó por al lado.
 *
 * Estas pruebas miran el fuente de simulador-app.jsx. Es tosco, pero es la
 * única forma de afirmar "no existe ninguna otra ruta", que es justo lo que
 * hace falta.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const APP = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');

/** Líneas de código, sin comentarios, para no marcar la propia documentación. */
const codeLines = () => APP.split('\n')
  .map((line, i) => ({ n: i + 1, text: line }))
  .filter(({ text }) => {
    const t = text.trim();
    return t && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
  });

test('ninguna ruta del cliente escribe lifecycleState ni revision', () => {
  // Las reglas desplegadas las deniegan, y updateBitLote escribe primero en
  // local y sincroniza después: el rechazo llega a un aviso lateral mientras la
  // pantalla ya muestra el lote cambiado. El operario ve un estado que el
  // servidor no tiene. Sólo acceptFieldEvent puede escribirlos.
  // Sólo claves de objeto: `x.revision : 0` dentro de un ternario es una
  // lectura y no debe marcarse.
  const offenders = codeLines().filter(({ text }) =>
    /(^|[{,])\s*(lifecycleState|revision)\s*:/.test(text));

  assert.deepEqual(offenders.map(o => `${o.n}: ${o.text.trim().slice(0, 80)}`), [],
    'encola la transición con confirmTransition en vez de escribir el campo');
});

test('el estado del lote sale de la regla compartida, no de una tabla local', () => {
  // Hubo una `legacyLifecycle` local sin `activo`, y cada llamador ponía su
  // propio respaldo: 'incubation' en un sitio, 'planned' en otro, undefined en
  // un tercero. Para un lote recién creado el servidor decía 'inoculated'.
  assert.ok(!/const legacyLifecycle\s*=/.test(APP),
    'la tabla local reintroduce la divergencia: usa SetasBatchSheet.normalizeLifecycleState');

  const offenders = codeLines().filter(({ text }) => /legacyLifecycle\s*\[/.test(text));
  assert.deepEqual(offenders.map(o => `${o.n}: ${o.text.trim().slice(0, 80)}`), []);
});

test('el rol del operario tiene una sola procedencia', () => {
  // La hoja filtraba las transiciones con un rol derivado de props.isAdmin
  // mientras el encolado usaba el de la sesión: ofrecía acciones que el envío
  // rechazaba, sin explicación en pantalla.
  const offenders = codeLines().filter(({ text }) =>
    /isAdmin[^\n]*\?\s*'(direccion|produccion|operario)'/.test(text));

  assert.deepEqual(offenders.map(o => `${o.n}: ${o.text.trim().slice(0, 80)}`), [],
    'usa getFieldOperatorRole(), que lee usuarios/{uid}.rol de la sesión');
});

test('getFieldOperatorRole sigue siendo la única puerta al rol', () => {
  assert.match(APP, /const getFieldOperatorRole = \(\) =>/,
    'si desaparece, el rol vuelve a derivarse en cada sitio');
  assert.match(APP, /mapWorkflowRole/,
    'debe traducir con la tabla compartida que aplica la Cloud Function');
});
