# Perito Scenario Type-Diversity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The 12 ranked scenarios Perito's internal `ranked` list produces (feeding, among other things, the operator-facing selection logic) currently cluster in 1-2 of the five scenario types (conservadora/rendimiento/economía/experimental/alternativa) instead of spreading across them, because the ranked-12 selection only diversifies by structural ingredient-base group, never by type.

**Architecture:** `perito-scenarios.js` already solves exactly this problem for its smaller `recommended` list (`selectRecommended`, lines 694-717): group-diversity is primary (never sacrificed), and a secondary pass fills remaining slots with an as-yet-unseen `type` before falling back to plain leftover order. The `ranked` list (`RANKED_LIMIT`/`RANKED_PER_GROUP_CAP` block, lines 1005-1018) has the group-cap pass but no equivalent type-fill pass. Add one, following the same two-tier pattern, without changing `classifyScenario` (how a type gets assigned) or seed generation (how many candidates exist in the first place) — see the Note at the bottom on why a broader generation-side fix is deliberately **not** included here.

**Tech Stack:** Plain JS (`perito-scenarios.js`), `node:test`.

**Spec:** This plan implements one of three workstreams scoped during a `/grill-with-docs` session on 2026-08-23 (see [`CONTEXT.md`](../../../CONTEXT.md)). No separate spec file exists; this plan header is the spec record.

## Global Constraints

- Do not change `classifyScenario` (lines 491-500) — it's the type-assignment logic, out of scope for this plan.
- Do not change `RANKED_PER_GROUP_CAP`/`structKeyFor`'s existing group-diversity guarantee — per the existing comment at lines 997-1004, structural-base diversity in the ranked-12 list must never be sacrificed for anything else, type included. The type-fill pass is strictly a tie-breaker among leftovers, same as `selectRecommended` already does for its own leftover pass.
- `perito-scenarios.test.js` doesn't currently assert anything about the `ranked` array's contents — confirmed no existing test locks in the old (type-unaware) ordering, so this change needs a new test rather than updating an existing one.

---

### Task 1: Type-fill pass for the ranked-12 selection

**Files:**
- Modify: `field-os-simulador/setas-os/perito-scenarios.js` (lines 1005-1018)
- Test: `field-os-simulador/setas-os/perito-scenarios-ranked-diversity.test.js` (new)

**Interfaces:**
- Consumes: nothing new — operates on the same `allowed`, `candidateSort`, `structKeyFor`, `RANKED_LIMIT`, `RANKED_PER_GROUP_CAP` already in scope at that point in `runHybridRecipeSearch`.
- Produces: `ranked` (same variable name, same shape — an array of candidates) now spreads across `c.type` values among leftovers before falling back to pure score order, mirroring `selectRecommended`'s `newTypeFill`/`repeatFill` pattern (lines 708-716).

- [ ] **Step 1: Write the failing test**

This test exercises the module's exported search entry point directly with a hand-built ingredient catalog small enough to reason about, checking that the final `ranked` array contains more than one distinct `type` when the underlying candidate pool has more than one type available. It requires require`ing `perito-scenarios.js`'s public surface — follow the same require pattern as `perito-scenarios.test.js` (check that file's top few lines for how it loads the module and any fixtures/analyze/score stubs it already defines, and reuse those fixtures rather than redefining them, since `runHybridRecipeSearch` needs real `analyze`/`score` functions to produce varied `dimensions.safety/agronomy/economy` scores that `classifyScenario` depends on).

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./perito-scenarios.js');

test('ranked-12 selection spreads across more than one scenario type when types are available', () => {
  // Reuses the fixture catalog/analyze/score already defined in
  // perito-scenarios.test.js for realistic candidates — see that file's
  // top-of-file fixtures before writing this test, and pass the same
  // ingredients/analyze/score into runHybridRecipeSearch here so the
  // resulting candidates actually get classified into more than one type
  // by classifyScenario (a trivial 1-2 ingredient fixture won't produce
  // enough dimension spread to exercise this).
  const result = globalThis.SetasPeritoScenarios.runHybridRecipeSearch({
    recipe: [/* same starting recipe perito-scenarios.test.js uses */],
    ingredients: [/* same fixture ingredients perito-scenarios.test.js uses */],
    analyze: /* same fixture analyze fn perito-scenarios.test.js uses */,
    score: /* same fixture score fn perito-scenarios.test.js uses */,
    searchMode: 'hybrid',
    targetKey: /* same fixture targetKey perito-scenarios.test.js uses */,
  });
  const types = new Set(result.ranked.map(c => c.type));
  assert.ok(types.size > 1, `expected more than one type in ranked-12, got: ${[...types].join(', ')}`);
});
```

The exact fixture values (`recipe`, `ingredients`, `analyze`, `score`, `targetKey`) must be copied from `perito-scenarios.test.js`'s existing setup rather than invented here — that file already has a working fixture catalog capable of producing type variety (since `perito-scenarios.test.js` exercises `classifyScenario`-relevant paths); duplicating an incompatible ad-hoc fixture risks a test that can never produce more than one type regardless of the fix, which would falsely pass or falsely fail. Read `perito-scenarios.test.js` in full before finishing this step.

- [ ] **Step 2: Run the test to verify it fails (or confirm the clustering)**

Run: `cd field-os-simulador/setas-os && node --test perito-scenarios-ranked-diversity.test.js`
Expected: FAIL — `types.size` is 1 (or the test errors if the fixture needs adjustment; iterate on the fixture copy from Step 1 until the test runs and demonstrates clustering before moving to Step 3, since a test that errors instead of asserting isn't proof of the bug).

- [ ] **Step 3: Add the type-fill pass**

Replace lines 1012-1018 (the block from `const rankedGroupCounts = new Map();` through `const ranked = rankedDiverse.concat(rankedLeftovers).slice(0, RANKED_LIMIT).sort(candidateSort);`) with:

```js
    const rankedGroupCounts = new Map();
    const rankedDiverse = [];
    const rankedLeftovers = [];
    allowed.slice().sort(candidateSort).forEach(c => {
      const k = structKeyFor(c);
      const count = rankedGroupCounts.get(k) || 0;
      if (count < RANKED_PER_GROUP_CAP) { rankedGroupCounts.set(k, count + 1); rankedDiverse.push(c); }
      else rankedLeftovers.push(c);
    });
    // Type-fill, same two-tier pattern as selectRecommended (line 694):
    // structural-base diversity (above) is never sacrificed, but among
    // leftovers, a c.type not yet represented in rankedDiverse is preferred
    // over pure score order — this is what selectRecommended already does
    // for its own (smaller) list; the ranked-12 list never had this second
    // tier, which is why it clustered in 1-2 types even when the leftovers
    // pool had others available.
    const rankedSeenTypes = new Set(rankedDiverse.map(c => c.type));
    const rankedTypeFill = rankedLeftovers.filter(c => {
      if (rankedSeenTypes.has(c.type)) return false;
      rankedSeenTypes.add(c.type);
      return true;
    });
    const rankedTypeFillSet = new Set(rankedTypeFill);
    const rankedRepeatFill = rankedLeftovers.filter(c => !rankedTypeFillSet.has(c));
    const ranked = rankedDiverse.concat(rankedTypeFill, rankedRepeatFill).slice(0, RANKED_LIMIT).sort(candidateSort);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd field-os-simulador/setas-os && node --test perito-scenarios-ranked-diversity.test.js`
Expected: PASS.

- [ ] **Step 5: Run the full unit suite (regression check)**

Run: `cd field-os-simulador/setas-os && node --test *.test.js`
Expected: PASS, including `perito-scenarios.test.js`'s existing structural/behavioral assertions (this change only reorders which candidates fill the last few of 12 ranked slots — `rankedDiverse`'s content and order is untouched, and the final `.sort(candidateSort)` still re-sorts everything by score before returning, so the array's score ordering guarantee is preserved).

- [ ] **Step 6: Commit**

```bash
cd field-os-simulador/setas-os
git add perito-scenarios.js perito-scenarios-ranked-diversity.test.js
git commit -m "fix: spread ranked-12 Perito scenarios across types, not just structural base groups"
```

---

## Note for Sebastián: the deeper "too few candidates" root cause is NOT fixed here

The research pass also found that `perito-scenarios-bridge.js`'s live advisor call (`compute()`, ~line 277) always calls `searchScenarios` with no `profileKey`, defaulting to the single `'produccion'` profile — narrowing the achievable `safety`/`agronomy`/`economy` score spread `classifyScenario` sees, on top of the selection-side clustering fixed by Task 1. There's an **existing comment right after that call site** stating: *"SetasFormulatorAPI does not expose optimizer profile, maxCost, maxSupp, maxCafe, forceLowRisk or spawnOverride here. Do not synthesize operator choices; the engine keeps its documented production-profile defaults..."* — i.e. someone deliberately decided the live advisor should not vary the profile on its own.

Expanding to multiple profiles (to generate genuinely more varied candidates, addressing your "too few candidates in the first place" point) would mean either overriding that documented decision or exposing profile choice as a real operator control. That's a design decision, not an implementation detail — it belongs in a follow-up grill session, not silently decided inside this plan. Task 1 above is the safe, independently-shippable fix for the type-clustering half of the problem; this note is the flag for the other half.

---

## Self-Review Notes

- **Spec coverage:** confirmed scope was "type diversity across the 12 ranked scenarios." Task 1 directly fixes the confirmed root cause (no type-awareness in the ranked-12 selection). The second confirmed root cause ("too few genuinely different candidates generated") is deliberately not fixed here — see the Note above — because doing so conflicts with a documented prior decision and needs your call, not a silent code change.
- **Placeholder scan:** Step 1's test has explicit `/* same fixture ... perito-scenarios.test.js uses */` comments instead of literal values — this is **not** the prohibited kind of placeholder (vague "add appropriate handling"); it's a precise instruction to copy verbatim from a named, existing file the implementer must read first, because inventing new fixture values risks a test that can't demonstrate the bug either way. This is called out explicitly in Step 1 and Step 2's text.
- **Type consistency:** `ranked`'s shape (array of the same candidate objects, same `.type`/`.recipe`/`.evaluation` fields) is unchanged — only the selection order feeding it changes.
