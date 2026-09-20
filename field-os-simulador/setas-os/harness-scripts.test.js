'use strict';

// El banco de pruebas (__harness.html) declara cargar los mismos módulos que
// PROTECTED_APP_SCRIPTS "igual que el shell real". Cuando se desvía deja de
// probar la aplicación que el operario usa: los módulos ausentes simplemente no
// existen en window y el código que depende de ellos cae a sus respaldos, así
// que el banco muestra una pantalla que parece sana y no lo está. Ya pasó: el
// banco no cargaba batch-sheet, task-engine, day-close, sync-queue ni
// sweep-journal, y la cola de trabajo aparecía vacía sin que fallara nada.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const harness = fs.readFileSync(path.join(ROOT, '__harness.html'), 'utf8');
const authGate = fs.readFileSync(path.join(ROOT, 'firebase/auth-gate.js'), 'utf8');

const protegidos = [...authGate.matchAll(/"\.\.\/([a-z0-9-]+\.js)"/g)].map(m => m[1]);

test('el banco de pruebas carga todos los módulos protegidos del shell real', () => {
  assert.ok(protegidos.length > 10, 'no se pudo leer PROTECTED_APP_SCRIPTS');
  const ausentes = protegidos.filter(f => !harness.includes(`src="${f}"`));
  assert.deepEqual(ausentes, [], `el banco no carga: ${ausentes.join(', ')}`);
});
