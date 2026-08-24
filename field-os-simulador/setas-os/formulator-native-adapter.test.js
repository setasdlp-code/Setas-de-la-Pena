'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./formulator-api.js');

const makeFakeAdapter = (initial = []) => {
  let recipe = initial;
  let lockedIds = new Set();
  let numBags = 6;
  let kgBag = 1.5;
  return {
    getRecipe: () => recipe,
    getLockedIds: () => lockedIds,
    getBatchWetKg: () => numBags * kgBag,
    applyRecipe: async (targetRecipe) => { recipe = targetRecipe; return { recipe }; },
    _setLockedIds: (ids) => { lockedIds = ids; },
    _setBatch: (n, k) => { numBags = n; kgBag = k; },
  };
};

test('registerNativeAdapter switches adapterType to native', () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 60 }]);
  const unregister = api.registerNativeAdapter(adapter);
  try {
    assert.equal(api.adapterType(), 'native');
  } finally {
    unregister();
  }
});

test('getRecipe/getLockedIds/getState delegate to the native adapter, not the DOM', () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
  adapter._setLockedIds(new Set(['paja_trigo']));
  adapter._setBatch(8, 2);
  const unregister = api.registerNativeAdapter(adapter);
  try {
    assert.deepEqual(api.getRecipe(), [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
    assert.deepEqual([...api.getLockedIds()], ['paja_trigo']);
    const state = api.getState();
    assert.deepEqual(state.recipe, [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
    assert.equal(state.batchWetKg, 16);
    assert.equal(state.adapter, 'native');
  } finally {
    unregister();
  }
});

test('applyRecipe delegates to the native adapter and skips DOM mutation', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 100 }]);
  const unregister = api.registerNativeAdapter(adapter);
  try {
    const target = [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }];
    await api.applyRecipe(target, { source: 'test' });
    assert.deepEqual(adapter.getRecipe(), target);
  } finally {
    unregister();
  }
});

test('unregistering the native adapter reverts adapterType to dom', () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([]);
  const unregister = api.registerNativeAdapter(adapter);
  unregister();
  assert.equal(api.adapterType(), 'dom');
});
