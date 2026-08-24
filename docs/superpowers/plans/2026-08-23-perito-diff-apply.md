# Perito Diff-Style Apply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When Perito proposes a scenario card, show only what would *change* relative to the recipe currently open in Formulador (ingredients added, removed, or re-percentaged) instead of printing the full proposed recipe as an undifferentiated list.

**Architecture:** `perito-scenarios-bridge.js`'s `render(result, names)` already has both recipes in scope when it builds each scenario card: `result.baseline.recipe` (current) and `c.recipe` (proposed), for every `c` in `result.recommended`. Add a pure `diffRecipes(baselineRecipe, scenarioRecipe)` function (id-based set comparison, no DOM) and a pure `recipeDiffHtml(diff, names)` renderer, then swap the card's current `recipeText(c.recipe, names)` line for the diff renderer. Style added/removed/changed rows with the existing semantic CSS tokens (`--status-active`, `--status-error`, `--status-attention` + their `-bg` companions) already defined in `fieldos-tokens.css`, matching how the rest of the app signals positive/negative/warning states.

**Tech Stack:** Plain JS (`perito-scenarios-bridge.js`), `node:test`, Playwright for the DOM-dependent parts (`render()` itself can't be unit-tested — no jsdom/happy-dom in this repo's devDependencies, only Playwright for real-DOM checks).

**Spec:** This plan implements one of three workstreams scoped during a `/grill-with-docs` session on 2026-08-23 (see [`CONTEXT.md`](../../../CONTEXT.md)). No separate spec file exists; this plan header is the spec record.

## Global Constraints

- `perito-scenarios.test.js` (lines ~161-187) structurally asserts `perito-scenarios-bridge.js` still calls `formulator.applyRecipe`/`undoRecipe`/`getState` and contains no raw DOM-adapter internals — don't touch `applyScenario`'s call to `formulator.applyRecipe` in a way that removes those tokens.
- `recipeText`/`deltaText`/`esc` (existing helpers in `perito-scenarios-bridge.js`, lines 140-155) stay as-is; `recipeText` is still used for the accessibility/plain-text summary inside `deltaText`'s callers elsewhere — only the scenario card's *display* line changes, not the underlying helpers.
- No jsdom/happy-dom is available in this repo — any test that needs `document`/`innerHTML` must be a Playwright e2e test, not a `node:test` unit test.

---

### Task 1: `diffRecipes` — pure id-based recipe diff

**Files:**
- Modify: `field-os-simulador/setas-os/perito-scenarios-bridge.js` (add function near `recipeText`, after line 155)
- Test: `field-os-simulador/setas-os/perito-scenarios-diff.test.js` (new)

**Interfaces:**
- Produces: `diffRecipes(baselineRecipe, scenarioRecipe)` → `{ added: [{id,p}], removed: [{id,p}], changed: [{id,fromP,toP}] }`, where `baselineRecipe`/`scenarioRecipe` are `[{id,p}]` arrays (the existing recipe shape used throughout the app).

- [ ] **Step 1: Write the failing test**

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'perito-scenarios-bridge.js'), 'utf8');
const match = source.match(/const diffRecipes = \(baseline[\s\S]*?\n  \};/);
assert.ok(match, 'diffRecipes not found in perito-scenarios-bridge.js');
// eslint-disable-next-line no-eval
const diffRecipes = (0, eval)(`(${match[0].replace(/^const diffRecipes = /, '')})`);

test('ingredients only in the scenario are added', () => {
  const baseline = [{ id: 'paja_trigo', p: 100 }];
  const scenario = [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }];
  const diff = diffRecipes(baseline, scenario);
  assert.deepEqual(diff.added, [{ id: 'kikuyo', p: 40 }]);
  assert.deepEqual(diff.removed, []);
});

test('ingredients only in the baseline are removed', () => {
  const baseline = [{ id: 'paja_trigo', p: 60 }, { id: 'hojarasca', p: 40 }];
  const scenario = [{ id: 'paja_trigo', p: 60 }];
  const diff = diffRecipes(baseline, scenario);
  assert.deepEqual(diff.removed, [{ id: 'hojarasca', p: 40 }]);
  assert.deepEqual(diff.added, []);
});

test('ingredients in both with a different percentage are changed', () => {
  const baseline = [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }];
  const scenario = [{ id: 'paja_trigo', p: 50 }, { id: 'kikuyo', p: 50 }];
  const diff = diffRecipes(baseline, scenario);
  assert.deepEqual(diff.changed, [
    { id: 'paja_trigo', fromP: 60, toP: 50 },
    { id: 'kikuyo', fromP: 40, toP: 50 },
  ]);
});

test('identical percentage is not reported as changed', () => {
  const baseline = [{ id: 'paja_trigo', p: 60 }];
  const scenario = [{ id: 'paja_trigo', p: 60 }];
  const diff = diffRecipes(baseline, scenario);
  assert.deepEqual(diff.changed, []);
  assert.deepEqual(diff.added, []);
  assert.deepEqual(diff.removed, []);
});

test('a fully identical recipe produces an empty diff', () => {
  const recipe = [{ id: 'paja_trigo', p: 60 }, { id: 'kikuyo', p: 40 }];
  const diff = diffRecipes(recipe, recipe.map(r => ({ ...r })));
  assert.deepEqual(diff, { added: [], removed: [], changed: [] });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test perito-scenarios-diff.test.js`
Expected: FAIL with `diffRecipes not found in perito-scenarios-bridge.js` (the assertion in the test file itself, since the function doesn't exist yet).

- [ ] **Step 3: Implement `diffRecipes`**

Insert immediately after `recipeText`'s definition (after line 144) in `perito-scenarios-bridge.js`:

```js
  const diffRecipes = (baseline = [], scenario = []) => {
    const baseMap = new Map(baseline.map(r => [r.id, Number(r.p)]));
    const scenMap = new Map(scenario.map(r => [r.id, Number(r.p)]));
    const added = [];
    const removed = [];
    const changed = [];
    scenMap.forEach((p, id) => {
      if (!baseMap.has(id)) added.push({ id, p });
    });
    baseMap.forEach((p, id) => {
      if (!scenMap.has(id)) removed.push({ id, p });
    });
    baseMap.forEach((fromP, id) => {
      if (scenMap.has(id)) {
        const toP = scenMap.get(id);
        if (Math.round(fromP * 10) !== Math.round(toP * 10)) changed.push({ id, fromP, toP });
      }
    });
    return { added, removed, changed };
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd field-os-simulador/setas-os && node --test perito-scenarios-diff.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
cd field-os-simulador/setas-os
git add perito-scenarios-bridge.js perito-scenarios-diff.test.js
git commit -m "feat: add diffRecipes to compute added/removed/changed ingredients for a Perito scenario"
```

---

### Task 2: `recipeDiffHtml` renderer and card wiring

**Files:**
- Modify: `field-os-simulador/setas-os/perito-scenarios-bridge.js`
- Test: `field-os-simulador/setas-os/perito-scenarios-diff.test.js` (extend)

**Interfaces:**
- Consumes: `diffRecipes` from Task 1, `esc` (existing helper, line ~35), `names` (id→name map, already passed into `render`).
- Produces: `recipeDiffHtml(diff, names)` → an HTML string with one row per added/removed/changed ingredient, tagged `data-diff-kind="added|removed|changed"` for e2e targeting (Task 3).

- [ ] **Step 1: Write the failing test (string-shape assertions)**

Append to `perito-scenarios-diff.test.js`:

```js
const rendererMatch = source.match(/const recipeDiffHtml = \(diff[\s\S]*?\n  \};/);
assert.ok(rendererMatch, 'recipeDiffHtml not found in perito-scenarios-bridge.js');
const escFn = s => String(s ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const recipeDiffHtml = (0, eval)(`(function(esc){ return (${rendererMatch[0].replace(/^const recipeDiffHtml = /, '')}); })`)(escFn);

test('recipeDiffHtml renders one tagged row per added ingredient', () => {
  const html = recipeDiffHtml({ added: [{ id: 'kikuyo', p: 40 }], removed: [], changed: [] }, { kikuyo: 'Kikuyo' });
  assert.match(html, /data-diff-kind="added"/);
  assert.match(html, /Kikuyo/);
  assert.match(html, /40\.0%/);
});

test('recipeDiffHtml renders one tagged row per removed ingredient', () => {
  const html = recipeDiffHtml({ added: [], removed: [{ id: 'hojarasca', p: 40 }], changed: [] }, { hojarasca: 'Hojarasca' });
  assert.match(html, /data-diff-kind="removed"/);
  assert.match(html, /Hojarasca/);
});

test('recipeDiffHtml renders a from-to row per changed ingredient', () => {
  const html = recipeDiffHtml({ added: [], removed: [], changed: [{ id: 'paja_trigo', fromP: 60, toP: 50 }] }, { paja_trigo: 'Paja de trigo' });
  assert.match(html, /data-diff-kind="changed"/);
  assert.match(html, /60\.0%.*50\.0%|60\.0%\s*→\s*50\.0%/);
});

test('recipeDiffHtml reports no changes with a plain message', () => {
  const html = recipeDiffHtml({ added: [], removed: [], changed: [] }, {});
  assert.match(html, /[Ss]in cambios/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd field-os-simulador/setas-os && node --test perito-scenarios-diff.test.js`
Expected: FAIL with `recipeDiffHtml not found in perito-scenarios-bridge.js`.

- [ ] **Step 3: Implement `recipeDiffHtml`**

Insert immediately after `diffRecipes` (after Task 1's block):

```js
  const recipeDiffHtml = (diff, names) => {
    const row = (kind, id, text, color, bg) =>
      `<div data-diff-kind="${kind}" style="display:flex;justify-content:space-between;gap:8px;padding:2px 6px;margin:2px 0;border-radius:3px;background:${bg};color:${color};font-family:var(--font-mono);font-size:11px">${esc(names[id] || id)}<span>${text}</span></div>`;
    const parts = [
      ...diff.added.map(r => row('added', r.id, `+ ${Number(r.p).toFixed(1)}%`, 'var(--status-active)', 'var(--status-active-bg, transparent)')),
      ...diff.removed.map(r => row('removed', r.id, `− ${Number(r.p).toFixed(1)}%`, 'var(--status-error)', 'var(--status-error-bg, transparent)')),
      ...diff.changed.map(r => row('changed', r.id, `${Number(r.fromP).toFixed(1)}% → ${Number(r.toP).toFixed(1)}%`, 'var(--status-attention)', 'var(--status-attention-bg)')),
    ];
    if (!parts.length) return `<div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-500)">Sin cambios respecto a la receta actual.</div>`;
    return parts.join('');
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd field-os-simulador/setas-os && node --test perito-scenarios-diff.test.js`
Expected: PASS (9 tests total from Task 1 + Task 2).

- [ ] **Step 5: Wire it into the scenario card**

In `render()`, replace this line (in the `rows.map` template, currently reading):

```js
          <div style="font-family:var(--font-mono);font-size:11px;line-height:1.45;margin-top:4px">${recipeText(c.recipe, names)}</div>
```

with:

```js
          <div style="margin-top:4px">${recipeDiffHtml(diffRecipes(result.baseline.recipe, c.recipe), names)}</div>
```

- [ ] **Step 6: Run the full unit suite (regression check)**

Run: `cd field-os-simulador/setas-os && node --test *.test.js`
Expected: PASS — in particular `perito-scenarios.test.js`'s structural contract, since `applyScenario`/`formulator.applyRecipe` calls weren't touched, only the card's display line.

- [ ] **Step 7: Commit**

```bash
cd field-os-simulador/setas-os
git add perito-scenarios-bridge.js perito-scenarios-diff.test.js
git commit -m "feat: show a diff (added/removed/changed) instead of the full recipe on Perito scenario cards"
```

---

### Task 3: E2E proof the diff renders in a real scenario card

**Files:**
- Modify: `field-os-simulador/setas-os/e2e/optimizer.spec.js`

**Interfaces:**
- Consumes: `openApp`, `goWorkspace`, `seedLocalStorage` from `e2e/helpers.js`; `data-diff-kind` attributes from Task 2.

- [ ] **Step 1: Write the e2e assertion**

Add to `field-os-simulador/setas-os/e2e/optimizer.spec.js` (reuse whatever fixture that file already uses to get to a state with an open recipe and visible Perito scenarios — follow the file's existing pattern for seeding a recipe via `seedLocalStorage`/`E2E_RECETA_CARGADA` from `fixtures.js`, matching the convention seen in `hostile-navigation.spec.js`):

```js
test('las tarjetas de escenario del Perito muestran un diff, no la receta completa', async ({ page }) => {
  await seedLocalStorage(page, { setas_v6: [E2E_RECETA_CARGADA] });
  await openApp(page);
  await goWorkspace(page, 'formular');
  await page.getByRole('tab', { name: 'Recetario' }).click();
  await page.locator(`[data-recipe-id="${E2E_RECETA_CARGADA.id}"]`).getByRole('button', { name: 'Cargar' }).click();
  await goWorkspace(page, 'bitacora');
  const anyDiffRow = page.locator('[data-diff-kind]').first();
  await expect(anyDiffRow).toBeVisible({ timeout: 10000 });
});
```

Adjust the navigation steps to whichever workspace actually hosts `#bl-perito` in this build if it differs from `bitacora` — confirm by searching `simulador-app.jsx` for `id="bl-perito"` before finalizing this step, since the plan's earlier research only confirmed the id exists, not which workspace renders it.

- [ ] **Step 2: Run the e2e suite**

Run: `cd field-os-simulador/setas-os && npx playwright test optimizer.spec.js`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd field-os-simulador/setas-os
git add e2e/optimizer.spec.js
git commit -m "test(e2e): assert Perito scenario cards render a diff view"
```

---

## Self-Review Notes

- **Spec coverage:** confirmed scope was "diff-style apply, showing only what would change." Task 1 computes the diff, Task 2 renders and wires it in, Task 3 proves it in a real browser. Covered.
- **Placeholder scan:** none — every step has runnable code. Task 3 Step 1 flags one open fact (which workspace hosts `#bl-perito`) as an explicit verification instruction rather than a guess, since the research pass confirmed the DOM id but not its containing workspace tab.
- **Type consistency:** `diffRecipes` output shape (`{added,removed,changed}`) matches what `recipeDiffHtml` consumes across both tasks.
- **CSS tokens:** `--status-active`, `--status-error`, `--status-attention`/`--status-attention-bg` reused from `fieldos-tokens.css` rather than inventing new colors, per the research pass. `--status-active-bg`/`--status-error-bg` are referenced with a `transparent` fallback since the research only confirmed `--status-attention-bg` exists by that exact name in `fieldos-tokens.css` — if the other two `-bg` tokens don't exist under that name, the `var(...)` fallback keeps the row background transparent rather than breaking.
