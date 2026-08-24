# Formulador Native Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the DOM-scraping path Perito uses to read/write Formulador's recipe (`formulator-api.js`'s `mutateDom`, which clicks buttons and types into range inputs with frame waits) with a native adapter that reads/writes Formulador's real React state directly, so applying a Perito scenario is instant and doesn't depend on the DOM structure.

**Architecture:** `formulator-api.js` already has an adapter seam (`registerNativeAdapter(adapter)`, requiring `adapter.getRecipe()` and `adapter.applyRecipe(targetRecipe, options)`) that fully replaces the DOM path once a native adapter is registered — no changes to `formulator-api.js` itself are needed. The only new code is in `simulador-app.jsx`: construct an adapter object backed by the Formulador component's own `recipe`/`lockedIds`/`numBags`/`kgBag` state (via refs, to avoid stale closures across renders) and register it once on mount via `useEffect`. The DOM path stays in `formulator-api.js` as a fallback for any host page that never registers a native adapter (e.g. `climate-bench.html`, if it loads `formulator-api.js` standalone) — it must not be deleted.

**Tech Stack:** Plain JS (`formulator-api.js`), React 18 via the DCLogic/esbuild pipeline (`simulador-app.jsx`), `node:test` for unit tests, Playwright for e2e.

**Spec:** This plan implements one of three workstreams scoped during a `/grill-with-docs` session on 2026-08-23 (see [`CONTEXT.md`](../../../CONTEXT.md) for the resulting "Perito"/"Formulador" vocabulary). No separate spec file exists; this plan header is the spec record.

## Global Constraints

- Any edit to `simulador-app.jsx` requires regenerating the bundle: `node build.js`, then `node --test *.test.js`, both from `field-os-simulador/setas-os/`, and the regenerated `simulador-app.js` must be committed alongside the `.jsx` change (`build.test.js` checks a SHA-256 of the source embedded in the bundle).
- Do not remove `mutateDom` or the DOM fallback path from `formulator-api.js` — `perito-scenarios.test.js` (lines ~161-187) asserts it's still present, and it must survive when no native adapter is registered.
- Do not touch `perito-scenarios-bridge.js` in this plan — it already calls only `formulator.applyRecipe`/`undoRecipe`/`getState`/`adapterType`, all adapter-agnostic; no change needed there for this workstream.
- Follow the navigation contract in `ARCHITECTURE.md` §1 (`goTab`/`goBitTab`, never raw `setTab`/`setBitTab`) — not touched by this plan, but don't regress it while editing nearby code.

---

### Task 1: Native adapter registration in Formulador

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx` (insert after the existing `useState` declarations for `recipe` (line 1773), `search`/`cat` (1774-1775), `numBags`/`kgBag` (1776-1777), and after `lockedIds` (1829)/`pantryIds` (1832)/`disabledIngIds` (1834)/`usePantry` (1859) — insert the new code block immediately after line 1859, before the first `useMemo` that consumes `recipe`)
- Test: `field-os-simulador/setas-os/formulator-native-adapter.test.js` (new)

**Interfaces:**
- Consumes: existing state setters `setRecipe` (line 1773), `lockedIds`/`setLockedIds` (line 1829), `numBags`/`kgBag` (lines 1776-1777); existing global `globalThis.SetasFormulatorAPI.registerNativeAdapter` (already implemented in `formulator-api.js`, no change).
- Produces: `globalThis.SetasFormulatorAPI.adapterType()` returns `'native'` whenever this component is mounted; `getRecipe()`/`getLockedIds()`/`getState()`/`applyRecipe(targetRecipe)` all delegate to the live Formulador state instead of the DOM.

- [ ] **Step 1: Write the failing test for the adapter contract**

This test exercises `formulator-api.js`'s existing delegation logic against a **fake** adapter object with the exact shape the real one will have — it does not need React or a DOM, since `registerNativeAdapter`'s native path never touches `document`. It fails initially only because the file doesn't exist yet; once created it documents (and locks in) the exact contract Task 2's real adapter must satisfy.

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test formulator-native-adapter.test.js`
Expected: FAIL — `Cannot find module './formulator-native-adapter.test.js'` is not the failure (the file exists once you write it); the actual expected failure at this point is none, since `registerNativeAdapter`/`getRecipe`/`getState`/`applyRecipe`/`adapterType` already exist and work generically in `formulator-api.js` today. **If this test passes immediately, that's correct** — it confirms the existing adapter-seam infrastructure already satisfies the contract Task 2's real adapter needs to meet. Note the result and proceed to Task 2; there is nothing to "make pass" here, this step is establishing the contract as a regression guard, not driving new production code (the TDD red step doesn't apply to already-correct infrastructure).

- [ ] **Step 3: Commit the contract test**

```bash
cd field-os-simulador/setas-os
git add formulator-native-adapter.test.js
git commit -m "test: lock in formulator-api.js native adapter delegation contract"
```

---

### Task 2: Wire the real adapter into `simulador-app.jsx`

**Files:**
- Modify: `field-os-simulador/setas-os/simulador-app.jsx`

**Interfaces:**
- Consumes: `recipe`/`setRecipe` (line 1773), `lockedIds` (line 1829), `numBags`/`kgBag` (lines 1776-1777), `globalThis.SetasFormulatorAPI.registerNativeAdapter` (verified working by Task 1's test).
- Produces: nothing new consumed by other tasks — this is the end-to-end wiring.

- [ ] **Step 1: Add refs that track the latest recipe/lockedIds/batch size**

Insert immediately after the `usePantry` declaration (line 1859) in `simulador-app.jsx`:

```js
  const recipeRef=React.useRef(recipe);
  React.useEffect(()=>{recipeRef.current=recipe;},[recipe]);
  const lockedIdsRef=React.useRef(lockedIds);
  React.useEffect(()=>{lockedIdsRef.current=lockedIds;},[lockedIds]);
  const batchRef=React.useRef({numBags,kgBag});
  React.useEffect(()=>{batchRef.current={numBags,kgBag};},[numBags,kgBag]);
```

Refs are required because `registerNativeAdapter` is called once (empty dependency array, see Step 2) — without refs, the adapter's closures would keep referencing the `recipe`/`lockedIds`/`numBags`/`kgBag` values from the render that registered it, going stale on every subsequent edit. `setRecipe` itself is stable across renders (React guarantees `useState` setter identity), so writes don't need a ref — only reads do.

- [ ] **Step 2: Register the native adapter on mount**

Immediately after the refs from Step 1:

```js
  React.useEffect(()=>{
    const api=globalThis.SetasFormulatorAPI;
    if(!api||typeof api.registerNativeAdapter!=='function') return;
    const adapter={
      getRecipe:()=>recipeRef.current,
      getLockedIds:()=>new Set(lockedIdsRef.current),
      getBatchWetKg:()=>batchRef.current.numBags*batchRef.current.kgBag,
      applyRecipe:async(targetRecipe)=>{
        setRecipe(targetRecipe);
        return{recipe:targetRecipe};
      },
    };
    const unregister=api.registerNativeAdapter(adapter);
    return()=>{if(typeof unregister==='function')unregister();};
  },[]);
```

`applyRecipe` intentionally does not touch `lockedIds`: a scenario's recipe was generated respecting the locks Perito read via `getState()` (mirroring the DOM path's existing behavior, which verifies locked ingredients aren't changed by more than 0.15% rather than clearing locks — see `formulator-api.js`'s `mutateDom`). If a future scenario needs to change locks, that's a separate, explicit `adapter` method to add later — not implied by this task.

- [ ] **Step 3: Rebuild the bundle and run the full test suite**

```bash
cd field-os-simulador/setas-os
node build.js
node --test *.test.js
```

Expected: `build.test.js` passes (hash matches the freshly generated bundle); `formulator-native-adapter.test.js` from Task 1 still passes; `perito-scenarios.test.js`'s structural contract (bridge still references `formulator.applyRecipe`/`undoRecipe`/`getState`, `formulator-api.js` still contains `mutateDom`) still passes untouched, since neither file was modified.

- [ ] **Step 4: Commit**

```bash
cd field-os-simulador/setas-os
git add "Setas OS v5.dc.html" simulador-app.jsx simulador-app.js
git commit -m "feat: register native Formulador adapter, replacing DOM scraping for Perito apply"
```

(`Setas OS v5.dc.html` is included only if `node build.js` touches the shell file's embedded bundle reference — check `git status` before committing; if it's unchanged, drop it from the `add`.)

---

### Task 3: E2E proof the native path is live and instant

**Files:**
- Modify: `field-os-simulador/setas-os/e2e/optimizer.spec.js` (add a test to the existing file, following its established `openApp`/`goWorkspace` conventions)

**Interfaces:**
- Consumes: `openApp`, `goWorkspace` from `e2e/helpers.js` (existing); `window.SetasFormulatorAPI.adapterType()` (now returns `'native'` once Formulador mounts, per Task 2).

- [ ] **Step 1: Write the e2e assertion**

Add to `field-os-simulador/setas-os/e2e/optimizer.spec.js`:

```js
test('Formulador registra el adaptador nativo del Perito al montar', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');
  const adapterType = await page.evaluate(() => window.SetasFormulatorAPI?.adapterType?.());
  expect(adapterType).toBe('native');
});
```

- [ ] **Step 2: Run the e2e suite**

Run: `cd field-os-simulador/setas-os && npx playwright test optimizer.spec.js`
Expected: PASS. If it fails with `adapterType` still `'dom'`, the `useEffect` from Task 2 either isn't mounting (check the component tree — confirm this hook lives in the component that owns `recipe`/`setRecipe`, not a parent/sibling) or `node build.js` wasn't re-run after the JSX edit.

- [ ] **Step 3: Commit**

```bash
cd field-os-simulador/setas-os
git add e2e/optimizer.spec.js
git commit -m "test(e2e): assert Formulador's native Perito adapter is registered on mount"
```

---

## Self-Review Notes

- **Spec coverage:** the confirmed scope item was "native state API, replacing the DOM bridge... in scope now." Task 1 locks in the existing delegation contract, Task 2 implements the real adapter, Task 3 proves it end-to-end in a real browser. Covered.
- **Placeholder scan:** none — every step has runnable code.
- **Type consistency:** `adapter.getRecipe()`/`getLockedIds()`/`getBatchWetKg()`/`applyRecipe(targetRecipe)` match the shape `formulator-api.js`'s existing `registerNativeAdapter` already requires and calls (verified in Task 1's research, not redesigned here).
