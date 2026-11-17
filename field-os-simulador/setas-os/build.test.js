'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SOURCES, OUT, sourceHash, readSources } = require('./build.js');

test('simulador-app.js is up to date with its JSX sources', () => {
  const compiled = fs.readFileSync(OUT, 'utf8');
  const expected = sourceHash(readSources());
  const match = compiled.match(/^\/\/ source-hash: ([0-9a-f]{64})$/m);

  assert.ok(match, 'simulador-app.js is missing its "// source-hash: ..." banner — run `node build.js`');
  assert.equal(
    match[1],
    expected,
    'simulador-app.js is stale (its source-hash does not match the files in jsx-sources.cjs) — run `node build.js` and commit the result'
  );
});

test('jsx-sources.cjs lists every JSX source exactly once, simulador-app.jsx last', () => {
  assert.equal(new Set(SOURCES).size, SOURCES.length, 'archivo repetido en jsx-sources.cjs');
  assert.equal(SOURCES[SOURCES.length - 1], 'simulador-app.jsx');
  SOURCES.forEach((rel) => assert.ok(fs.existsSync(path.join(__dirname, rel)), `no existe ${rel}`));
  const onDisk = fs.readdirSync(path.join(__dirname, 'views')).filter((f) => f.endsWith('.jsx')).map((f) => `views/${f}`);
  onDisk.forEach((rel) => assert.ok(SOURCES.includes(rel), `${rel} no está en jsx-sources.cjs: no entraría al bundle`));
});

test('ningún nombre de nivel superior se declara en dos fuentes JSX', () => {
  const seen = new Map();
  SOURCES.forEach((rel) => {
    const text = fs.readFileSync(path.join(__dirname, rel), 'utf8');
    const names = [...text.matchAll(/^(?:const|let|var|class|(?:async\s+)?function\*?)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
    names.forEach((name) => {
      assert.ok(!seen.has(name) || seen.get(name) === rel, `${name} se declara en ${seen.get(name)} y en ${rel}`);
      seen.set(name, rel);
    });
  });
});
