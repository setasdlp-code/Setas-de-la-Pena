'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./formulator-api.js');

// Prefer the real recipeDistance from perito-scenarios.js over a hand-rolled
// stand-in, so the new guard tests exercise the exact threshold behavior
// production code relies on.
globalThis.SetasPeritoScenarios = require('./perito-scenarios.js');

const makeFakeAdapter = (initial = []) => {
  let recipe = initial;
  let lockedIds = new Set();
  let numBags = 6;
  let kgBag = 1.5;
  let applyCalls = 0;
  return {
    getRecipe: () => recipe,
    getLockedIds: () => lockedIds,
    getBatchWetKg: () => numBags * kgBag,
    applyRecipe: async (targetRecipe) => { applyCalls++; recipe = targetRecipe; return { recipe }; },
    _setLockedIds: (ids) => { lockedIds = ids; },
    _setBatch: (n, k) => { numBags = n; kgBag = k; },
    get applyCalls() { return applyCalls; },
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

// --- Final-review fixes: native applyRecipe success reporting + shared guards ---

test('applyRecipe on a native adapter reports ok:true and records an undoable transaction', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const initial = [{ id: 'paja_trigo', p: 100 }];
  let recipe = initial;
  const adapter = {
    getRecipe: () => recipe,
    getLockedIds: () => new Set(),
    getBatchWetKg: () => 9,
    // Mirrors the fixed simulador-app.jsx adapter: reports ok:true on success.
    applyRecipe: async (target) => { recipe = target; return { ok: true, recipe: target, adapter: 'native' }; },
  };
  const unregister = api.registerNativeAdapter(adapter);
  try {
    const target = [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }];
    const result = await api.applyRecipe(target, {});
    assert.equal(result.ok, true);
    assert.equal(api.canUndo(), true, 'a successful native apply must be undoable');

    const undoResult = await api.undoRecipe({});
    assert.equal(undoResult.ok, true);
    assert.deepEqual(adapter.getRecipe(), initial, 'undo should restore the adapter to its prior recipe');
  } finally {
    unregister();
  }
});

test('applyRecipe rejects a stale scenario and never delegates to the native adapter', async () => {
  const api = globalThis.SetasFormulatorAPI;
  // Current recipe on the adapter is far (>0.012 recipeDistance) from what
  // the caller expected it to be when the scenario was computed.
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 100 }]);
  const expectedRecipe = [{ id: 'paja_trigo', p: 50 }, { id: 'kikuyo', p: 50 }];
  const unregister = api.registerNativeAdapter(adapter);
  try {
    const target = [{ id: 'paja_trigo', p: 55 }, { id: 'kikuyo', p: 45 }];
    const result = await api.applyRecipe(target, { expectedRecipe });
    assert.equal(result.ok, false);
    assert.ok(result.message);
    assert.equal(adapter.applyCalls, 0, 'the staleness guard must short-circuit before delegating');
  } finally {
    unregister();
  }
});

test('applyRecipe allows a stale scenario through when options.force is true', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 100 }]);
  const expectedRecipe = [{ id: 'paja_trigo', p: 50 }, { id: 'kikuyo', p: 50 }];
  const unregister = api.registerNativeAdapter(adapter);
  try {
    const target = [{ id: 'paja_trigo', p: 55 }, { id: 'kikuyo', p: 45 }];
    const result = await api.applyRecipe(target, { expectedRecipe, force: true });
    assert.equal(adapter.applyCalls, 1, 'force:true must bypass the staleness guard');
    assert.deepEqual(result.recipe, target);
  } finally {
    unregister();
  }
});

test('applyRecipe rejects a target that moves a locked ingredient by more than 0.15%', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
  adapter._setLockedIds(new Set(['paja_trigo']));
  const unregister = api.registerNativeAdapter(adapter);
  try {
    const target = [{ id: 'paja_trigo', p: 55 }, { id: 'kikuyo', p: 45 }];
    const result = await api.applyRecipe(target, {});
    assert.equal(result.ok, false);
    assert.ok(result.message);
    assert.equal(adapter.applyCalls, 0, 'the locked-ingredient guard must short-circuit before delegating');
  } finally {
    unregister();
  }
});

test('applyRecipe allows a target that keeps a locked ingredient within 0.15%', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
  adapter._setLockedIds(new Set(['paja_trigo']));
  const unregister = api.registerNativeAdapter(adapter);
  try {
    // 0.1 percentage point drift on the locked ingredient — within tolerance,
    // should not false-positive on floating-point noise.
    const target = [{ id: 'paja_trigo', p: 60.1 }, { id: 'kikuyo', p: 39.9 }];
    await api.applyRecipe(target, {});
    assert.equal(adapter.applyCalls, 1, 'a within-tolerance locked ingredient must not block delegation');
  } finally {
    unregister();
  }
});

test('applyRecipe rejects non-finite, non-positive, duplicate, or unbalanced recipes before the native adapter writes state', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 100 }]);
  const unregister = api.registerNativeAdapter(adapter);
  try {
    const invalidRecipes = [
      [{ id: 'paja_trigo', p: 110 }],
      [{ id: 'paja_trigo', p: 50 }, { id: 'paja_trigo', p: 50 }],
      [{ id: 'paja_trigo', p: Number.NaN }, { id: 'kikuyo', p: 100 }],
      [{ id: 'paja_trigo', p: 100 }, { id: 'kikuyo', p: 0 }],
    ];
    for (const recipe of invalidRecipes) {
      const result = await api.applyRecipe(recipe, { force: true });
      assert.equal(result.ok, false, `debe rechazar ${JSON.stringify(recipe)}`);
    }
    assert.equal(adapter.applyCalls, 0, 'la validación debe ejecutar antes de escribir el estado nativo');
    assert.deepEqual(adapter.getRecipe(), [{ id: 'paja_trigo', p: 100 }]);
  } finally {
    unregister();
  }
});
