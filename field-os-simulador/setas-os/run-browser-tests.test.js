'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { listScripts, selectScripts } = require('./run-browser-tests.cjs');
const pkg = require('./package.json');

test('descubre los scripts de navegador de e2e/', () => {
  const scripts = listScripts();
  assert.ok(scripts.length > 0);
  scripts.forEach((f) => assert.match(f, /\.browser\.cjs$/));
  assert.deepEqual(scripts, [...scripts].sort());
});

test('el filtro selecciona por subcadena y sin filtro devuelve todo', () => {
  const all = ['a-perito.browser.cjs', 'b-room.browser.cjs', 'c-otro.browser.cjs'];
  assert.deepEqual(selectScripts(all, []), all);
  assert.deepEqual(selectScripts(all, ['perito', 'room']), all.slice(0, 2));
  assert.deepEqual(selectScripts(all, ['nada']), []);
});

test('npm run test:browser usa el runner, no una cadena con &&', () => {
  assert.equal(pkg.scripts['test:browser'], 'node run-browser-tests.cjs');
});
