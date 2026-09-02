'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const navigation = require('./navigation-state.js');

test('normalizes only known Setas OS views and preserves supported aliases', () => {
  assert.equal(navigation.normalizeView('formular'), 'formular');
  assert.equal(navigation.normalizeView('telemetria'), 'clima');
  assert.equal(navigation.normalizeView('optimizar'), 'formular');
  assert.equal(navigation.normalizeView('unknown'), 'home');
  assert.equal(navigation.normalizeView('unknown', null), null);
});

test('reads the view route without allowing arbitrary query values into navigation state', () => {
  assert.deepEqual(navigation.readLocation('?view=bitacora&trace=L-26'), { view: 'bitacora' });
  assert.deepEqual(navigation.readLocation('?view=camaras'), { view: 'clima' });
  assert.deepEqual(navigation.readLocation('?view=not-a-view'), { view: 'home' });
});

test('writes a canonical view while preserving unrelated deep-link context', () => {
  const calls = [];
  const win = {
    location: { href: 'https://setas.example/Setas%20OS%20v5.dc.html?trace=L-26&view=home' },
    history: {
      pushState: (...args) => calls.push(['pushState', ...args]),
      replaceState: (...args) => calls.push(['replaceState', ...args]),
    },
  };

  assert.equal(navigation.navigate(win, 'inventario'), 'inventario');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'pushState');
  assert.match(String(calls[0][3]), /trace=L-26/);
  assert.match(String(calls[0][3]), /view=inventario/);
});

test('does not create a duplicate history entry for the current canonical route', () => {
  const calls = [];
  const win = {
    location: { href: 'https://setas.example/?view=clima' },
    history: {
      pushState: (...args) => calls.push(['pushState', ...args]),
      replaceState: (...args) => calls.push(['replaceState', ...args]),
    },
  };

  assert.equal(navigation.navigate(win, 'iot'), 'clima');
  assert.equal(calls.length, 0);
});

test('supports replace semantics for state normalization only', () => {
  const calls = [];
  const win = {
    location: { href: 'https://setas.example/?view=home' },
    history: {
      pushState: (...args) => calls.push(['pushState', ...args]),
      replaceState: (...args) => calls.push(['replaceState', ...args]),
    },
  };

  navigation.navigate(win, 'dashboard', { replace: true });
  assert.equal(calls[0][0], 'replaceState');
});
