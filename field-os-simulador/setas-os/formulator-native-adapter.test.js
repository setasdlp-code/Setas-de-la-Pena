'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./mass-balance.js');
require('./formulator-api.js');

test('undo restaura borradores parciales y vacíos sin permitir aplicar recetas inválidas', async () => {
  const api = globalThis.SetasFormulatorAPI;
  for (const initial of [[], [{ id: 'paja_trigo', p: 45 }], [{ id: 'paja_trigo', p: 45 }, { id: 'salvado_trigo', p: 0 }]]) {
    let recipe = initial;
    const unregister = api.registerNativeAdapter({ getRecipe: () => recipe, getLockedIds: () => new Set(), applyRecipe: async r => { recipe = r; return { ok: true, recipe: r }; } });
    try {
      assert.equal((await api.applyRecipe(initial)).ok, false);
      assert.equal((await api.applyRecipe([{ id: 'paja_trigo', p: 80 }, { id: 'salvado_trigo', p: 20 }])).ok, true);
      const undo = await api.undoRecipe();
      assert.equal(undo.ok, true, undo.message);
      assert.deepEqual(recipe, initial);
      assert.equal(api.canUndo(), false);
    } finally { unregister(); }
  }
});

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

// --- Task 3: no DOM fallback — without a native adapter, the API reports a
// clear no-adapter result instead of touching the DOM. Runs first, before any
// test below registers an adapter, so the no-adapter precondition holds. ---

test('sin adaptador nativo: applyRecipe responde no_native_adapter y getState no toca el DOM', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const state = api.getState();
  assert.equal(state.adapter, null);
  assert.deepEqual(state.recipe, []);
  assert.equal(state.batchWetKg, null);
  const res = await api.applyRecipe([{ id: 'a', p: 60 }, { id: 'b', p: 40 }]);
  assert.equal(res.ok, false);
  assert.equal(res.code, 'no_native_adapter');
});

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

test('unregistering the native adapter reverts adapterType to null (no DOM fallback)', () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([]);
  const unregister = api.registerNativeAdapter(adapter);
  unregister();
  assert.equal(api.adapterType(), null);
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

test('validateRecipe usa la tolerancia única de balance (±0.5)', () => {
  const api = globalThis.SetasFormulatorAPI;
  assert.equal(api.validateRecipe([{ id: 'a', p: 60 }, { id: 'b', p: 40.4 }]), null);
  assert.match(api.validateRecipe([{ id: 'a', p: 60 }, { id: 'b', p: 40.6 }]), /±0\.5%/);
});

test('recipe reads are detached snapshots, not a writable handle to native state', () => {
  const api = globalThis.SetasFormulatorAPI;
  const initial = [{ id: 'paja_trigo', p: 100 }];
  const adapter = makeFakeAdapter(initial);
  const unregister = api.registerNativeAdapter(adapter);
  try {
    for (const snapshot of [api.getRecipe(), api.getState().recipe]) {
      snapshot[0].p = 25;
      snapshot.push({ id: 'kikuyo', p: 75 });
      assert.deepEqual(adapter.getRecipe(), [{ id: 'paja_trigo', p: 100 }]);
    }
  } finally { unregister(); }
});

test('apply owns its input and result so external edits cannot mutate the native recipe', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 100 }]);
  const unregister = api.registerNativeAdapter(adapter);
  try {
    const target = [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }];
    const result = await api.applyRecipe(target);
    assert.equal(result.ok, true);
    target[0].p = 5;
    target.push({ id: 'salvado_trigo', p: 55 });
    assert.deepEqual(adapter.getRecipe(), [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
    result.recipe[0].p = 10;
    assert.deepEqual(adapter.getRecipe(), [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
    assert.equal((await api.undoRecipe()).ok, true);
    assert.deepEqual(adapter.getRecipe(), [{ id: 'paja_trigo', p: 100 }]);
  } finally { unregister(); }
});

test('undo keeps its own before and after snapshots', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const initial = [{ id: 'paja_trigo', p: 100 }];
  let recipe = initial;
  const unregister = api.registerNativeAdapter({
    getRecipe: () => recipe,
    applyRecipe: async rows => {
      recipe = rows.map(row => ({ ...row }));
      return { recipe: rows.map(row => ({ ...row })) };
    },
  });
  try {
    const result = await api.applyRecipe([{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
    initial[0].p = 20;
    result.recipe[0].p = 10;
    const undo = await api.undoRecipe();
    assert.equal(undo.ok, true, undo.message);
    assert.deepEqual(recipe, [{ id: 'paja_trigo', p: 100 }]);
  } finally { unregister(); }
});

test('unregister clears the departing adapter undo history', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const unregister = api.registerNativeAdapter(makeFakeAdapter([{ id: 'paja_trigo', p: 100 }]));
  try {
    assert.equal((await api.applyRecipe([{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }])).ok, true);
    assert.equal(api.canUndo(), true);
  } finally { unregister(); }
  assert.equal(api.canUndo(), false);
});

test('replacing an adapter cannot import its history, and old cleanup cannot erase new history', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const target = [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }];
  const unregisterA = api.registerNativeAdapter(makeFakeAdapter([{ id: 'paja_trigo', p: 100 }]));
  let unregisterB;
  try {
    await api.applyRecipe(target);
    const adapterB = makeFakeAdapter(target);
    unregisterB = api.registerNativeAdapter(adapterB);
    assert.equal(api.canUndo(), false);
    assert.equal((await api.undoRecipe()).ok, false);
    assert.equal(adapterB.applyCalls, 0);
    await api.applyRecipe([{ id: 'paja_trigo', p: 70 }, { id: 'kikuyo', p: 30 }]);
    unregisterA();
    assert.equal(api.canUndo(), true);
    assert.equal((await api.undoRecipe()).ok, true);
    assert.deepEqual(adapterB.getRecipe(), target);
  } finally { unregisterA(); unregisterB?.(); }
});

test('a late async apply cannot create undo history in a later registration, even reusing the adapter object', async () => {
  const api = globalThis.SetasFormulatorAPI;
  for (const reuseAdapter of [false, true]) {
    let recipe = [{ id: 'paja_trigo', p: 100 }];
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const adapterA = { getRecipe: () => recipe, applyRecipe: async rows => { await gate; recipe = rows; return { recipe }; } };
    const unregisterA = api.registerNativeAdapter(adapterA);
    let unregisterB;
    try {
      const target = [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }];
      const pending = api.applyRecipe(target);
      unregisterA();
      const adapterB = reuseAdapter ? adapterA : makeFakeAdapter(target);
      unregisterB = api.registerNativeAdapter(adapterB);
      release();
      const result = await pending;
      assert.equal(result.ok, false, 'completion belongs to an expired registration');
      assert.equal(api.canUndo(), false);
      assert.deepEqual(adapterB.getRecipe(), target);
    } finally { release(); unregisterA(); unregisterB?.(); }
  }
});

test('accepted pct aliases and trimmed ids become numeric p rows without rescaling or moving a lock', async () => {
  const api = globalThis.SetasFormulatorAPI;
  const adapter = makeFakeAdapter([{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }]);
  adapter._setLockedIds(new Set(['paja_trigo']));
  const unregister = api.registerNativeAdapter(adapter);
  try {
    const target = [{ id: ' paja_trigo ', pct: '60' }, { id: 'kikuyo', pct: 40.4 }];
    assert.equal(api.validateRecipe(target), null);
    const result = await api.applyRecipe(target);
    assert.equal(result.ok, true, result.message);
    assert.deepEqual(adapter.getRecipe().map(({ id, p }) => ({ id, p })), [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40.4 }]);
    assert.deepEqual(target, [{ id: ' paja_trigo ', pct: '60' }, { id: 'kikuyo', pct: 40.4 }]);
  } finally { unregister(); }
});
