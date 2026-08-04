'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { SRC, OUT, sourceHash } = require('./build.js');

test('simulador-app.js is up to date with simulador-app.jsx', () => {
  const src = fs.readFileSync(SRC, 'utf8');
  const compiled = fs.readFileSync(OUT, 'utf8');
  const expected = sourceHash(src);
  const match = compiled.match(/^\/\/ source-hash: ([0-9a-f]{64})$/m);

  assert.ok(match, 'simulador-app.js is missing its "// source-hash: ..." banner — run `node build.js`');
  assert.equal(
    match[1],
    expected,
    'simulador-app.js is stale (its source-hash does not match simulador-app.jsx) — run `node build.js` and commit the result'
  );
});
