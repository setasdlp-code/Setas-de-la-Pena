#!/usr/bin/env node
'use strict';

// Precompiles simulador-app.jsx -> simulador-app.js using esbuild (devDependency
// — run `npm install` once before the first `node build.js`).
// Run this after every edit to simulador-app.jsx and commit the result —
// the browser no longer transpiles JSX at request time.
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
  let esbuild;
  try {
    esbuild = require('esbuild');
  } catch (err) {
    throw new Error('esbuild is not installed — run `npm install` in field-os-simulador/setas-os/ before `node build.js`.');
  }
  const src = fs.readFileSync(SRC, 'utf8');
  const { code } = esbuild.transformSync(src, {
    loader: 'jsx',
    target: 'es2020',
    jsx: 'transform',
    charset: 'utf8',
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
