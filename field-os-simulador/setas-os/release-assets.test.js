'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { releaseHash, runtimeAssets } = require('./release-assets.cjs');

test('CSS, modules, vendor, fonts, shell and asset additions/removals change the release', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'setas-release-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (name, data) => {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), data);
  };
  write('simulador-app.js', 'unchanged compiled JSX');
  for (const name of ['sim.css', 'pure-engine.js', 'firebase/auth-gate.js', 'vendor/firebase/firebase-auth.js', 'ds-2026/assets/fonts/font.otf', 'Setas OS v5.dc.html', 'extraction-factors.json']) {
    const before = releaseHash(root);
    write(name, 'version one');
    const added = releaseHash(root);
    assert.notEqual(added, before, name + ' addition');
    write(name, Buffer.from([0, 1, 2, 255]));
    assert.notEqual(releaseHash(root), added, name + ' change');
    fs.unlinkSync(path.join(root, name));
    assert.equal(releaseHash(root), before, name + ' removal');
  }
  write('sw.js', "// build:cache-version\nconst CACHE_VERSION = 'old';\nworkerLogic();");
  const beforeStamp = releaseHash(root);
  write('sw.js', "// build:cache-version\nconst CACHE_VERSION = 'new';\nworkerLogic();");
  assert.equal(releaseHash(root), beforeStamp, 'the generated stamp cannot hash itself');
  write('sw.js', "// build:cache-version\nconst CACHE_VERSION = 'new';\nnewWorkerLogic();");
  assert.notEqual(releaseHash(root), beforeStamp, 'worker logic is part of the release');
  const beforeDev = releaseHash(root);
  for (const name of ['e2e/.auth/state.json', 'node_modules/library.js', 'functions/shared/model.js', 'pure-engine.test.js', '__harness.html', 'index.html', 'ground-truth-fixtures.json']) write(name, 'not a runtime asset');
  assert.equal(releaseHash(root), beforeDev, 'development, credentials, field fixtures and the generated index alias are excluded');
});

test('the production release includes shell, model, CSS, authentication, fonts and QR vendor', () => {
  const files = runtimeAssets(__dirname);
  for (const name of ['Setas OS v5.dc.html', 'simulador-app.js', 'production-readiness.js', 'sim.css', 'firebase/auth-gate.js', 'ds-2026/operations.css', 'ds-2026/assets/fonts/GayaPatched-Bold.otf', 'vendor/jsQR.js', 'vendor/firebase/firebase-auth.js', '_standalone_imgs/logo-sdlp.png']) assert.ok(files.includes(name), name);
  assert.equal(new Set(files).size, files.length);
});
