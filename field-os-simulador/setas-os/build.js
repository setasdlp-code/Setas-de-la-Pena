#!/usr/bin/env node
'use strict';

// Precompiles simulador-app.jsx -> simulador-app.js using the vendored Babel
// standalone build (same transform the browser used to run at request time
// via support.js's x-import loader: presets ['react','typescript']).
// Run this after every edit to simulador-app.jsx and commit the result —
// the browser no longer has Babel available to transpile JSX at runtime.
// build.test.js checks simulador-app.js against this hash so a forgotten
// rebuild fails `node --test` instead of shipping stale code silently.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = path.join(__dirname, 'simulador-app.jsx');
const OUT = path.join(__dirname, 'simulador-app.js');

function sourceHash(src) {
  return crypto.createHash('sha256').update(src, 'utf8').digest('hex');
}

function build() {
  const Babel = require('./vendor/babel.min.js');
  const src = fs.readFileSync(SRC, 'utf8');
  const { code } = Babel.transform(src, {
    filename: 'simulador-app.jsx',
    presets: ['react', 'typescript'],
  });

  const banner =
    '// AUTO-GENERATED from simulador-app.jsx by build.js — do not edit directly.\n' +
    '// Run `node build.js` after changing simulador-app.jsx and commit this file.\n' +
    `// source-hash: ${sourceHash(src)}\n`;

  fs.writeFileSync(OUT, banner + code);
  console.log(`Built ${path.relative(process.cwd(), OUT)} (${code.length} bytes)`);
}

module.exports = { SRC, OUT, sourceHash };

if (require.main === module) build();
