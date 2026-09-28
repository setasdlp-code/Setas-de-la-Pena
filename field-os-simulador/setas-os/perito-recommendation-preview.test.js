'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { applyOptToRecipe } = require('./recipe-optimizer.js');
const jsx = fs.readFileSync(`${__dirname}/simulador-app.jsx`, 'utf8');
const start = jsx.indexOf('const describePeritoChanges=');
const end = jsx.indexOf('const PeritoChangePreview=', start);
assert.ok(start >= 0 && end > start, 'preview helper must exist');
const describe = vm.runInNewContext(`${jsx.slice(start, end)};describePeritoChanges`, { applyOptToRecipe });
const ingredients = [{ id: 'base', name: 'Base' }, { id: 'supp', name: 'Suplemento' }, { id: 'mineral', name: 'Mineral' }];
const recipe = [{ id: 'base', p: 80 }, { id: 'supp', p: 20 }];
test('preview includes rebalance and matches actual application without mutating inputs', () => {
  const original = JSON.stringify(recipe);
  const op = { mode: 'set', id: 'supp', value: 15 };
  const rows = describe(recipe, op, [], ingredients);
  assert.equal(rows.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(rows)), [
    { id: 'base', name: 'Base', before: 80, after: 85 },
    { id: 'supp', name: 'Suplemento', before: 20, after: 15 },
  ]);
  assert.equal(JSON.stringify(recipe), original);
});
test('combined preview includes new ingredient and respects locks', () => {
  const ops = [{ mode: 'set', id: 'supp', value: 15 }, { mode: 'add', id: 'mineral', delta: 2 }];
  const result = applyOptToRecipe(recipe, ops, ['base'], ingredients);
  const rows = describe(recipe, ops, ['base'], ingredients);
  assert.ok(!rows.some(row => row.id === 'base'));
  assert.equal(rows.find(row => row.id === 'mineral').before, 0);
  for (const row of rows) assert.equal(row.after, result.find(r => r.id === row.id)?.p || 0);
  assert.equal(JSON.stringify(rows), JSON.stringify(describe(recipe, ops, ['base'], ingredients)));
});
test('no operation or unchanged proposal produces no changes', () => {
  assert.equal(describe(recipe, null, [], ingredients).length, 0);
  assert.equal(describe(recipe, { mode: 'set', id: 'supp', value: 20 }, [], ingredients).length, 0);
});
