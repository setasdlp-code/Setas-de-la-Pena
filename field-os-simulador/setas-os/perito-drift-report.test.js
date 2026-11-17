'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseArgs, loadReferenceRecipes, runModel, buildDrift, main, EXIT, NOT_VALIDATION,
} = require('./perito-drift-report.js');

test('parseArgs: valores por defecto y opciones', () => {
  assert.deepEqual(parseArgs([]), { baseline: 'HEAD~1', failOnDrift: false, json: false });
  const opts = parseArgs(['--baseline=main', '--fail-on-drift', '--json']);
  assert.equal(opts.baseline, 'main');
  assert.equal(opts.failOnDrift, true);
  assert.equal(opts.json, true);
  assert.deepEqual(parseArgs(['--nope']).unknown, ['--nope']);
});

test('una opción desconocida es error operativo, no un pase', () => {
  assert.equal(main(['--nope']), EXIT.OPERATIONAL);
});

test('las recetas de referencia de producción se evalúan todas', () => {
  const recipes = loadReferenceRecipes(__dirname);
  assert.ok(recipes.length > 0);
  const results = runModel(__dirname, recipes);
  assert.equal(results.length, recipes.length);
  const failed = results.filter((r) => r.error);
  assert.deepEqual(failed, [], 'un preset referencia una especie o ingrediente fuera del catálogo');
  results.forEach((r) => {
    assert.ok(Number.isFinite(r.eb), `${r.key}: eb`);
    assert.ok(Number.isFinite(r.score), `${r.key}: score`);
  });
});

test('buildDrift: sin cambios no reporta nada', () => {
  const run = [{ key: 'a', sKey: 's', eb: 80, cn: 35, score: 70, status: 'good' }];
  assert.deepEqual(buildDrift(run, run.map((r) => ({ ...r }))), []);
});

test('buildDrift: detecta cambio de EB, de score solo y de evaluabilidad', () => {
  const base = [
    { key: 'a', sKey: 's', eb: 80, cn: 35, score: 70, status: 'good' },
    { key: 'b', sKey: 's', eb: 90, cn: 40, score: 60, status: 'good' },
    { key: 'c', sKey: 's', error: 'ingrediente ausente: x' },
    { key: 'd', sKey: 's', eb: 50, cn: 30, score: 40, status: 'warn' },
  ];
  const now = [
    { key: 'a', sKey: 's', eb: 82.5, cn: 35, score: 70, status: 'good' },
    { key: 'b', sKey: 's', eb: 90, cn: 40, score: 55, status: 'warn' },
    { key: 'c', sKey: 's', eb: 70, cn: 33, score: 65, status: 'good' },
    { key: 'd', sKey: 's', eb: 50, cn: 30, score: 40, status: 'warn' },
  ];
  const drift = buildDrift(now, base);
  assert.deepEqual(drift.map((d) => d.key), ['a', 'b', 'c']);
  assert.deepEqual(drift[0].changed, ['eb']);
  assert.deepEqual(drift[1].changed, ['score', 'status']);
  assert.ok(drift[2].changed.includes('error'));
});

test('buildDrift: una receta nueva sin contraparte en la base no cuenta como deriva', () => {
  assert.deepEqual(buildDrift([{ key: 'nueva', sKey: 's', eb: 1, cn: 1, score: 1, status: 'good' }], []), []);
});

test('el reporte se declara como no validación', () => {
  assert.match(NOT_VALIDATION, /No es validación/);
});
