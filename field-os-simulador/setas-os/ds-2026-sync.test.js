'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const APP_ROOT = __dirname;
const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');
const CANON_DS = path.join(REPO_ROOT, '08_brand', 'ds-2026');
const PACKAGED_DS = path.join(APP_ROOT, 'ds-2026');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(CANON_DS, 'distribution-manifest.json'), 'utf8'));

function walkFiles(root, relBase = '') {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (['.DS_Store', 'node_modules', '.git'].includes(entry.name)) continue;
    const abs = path.join(root, entry.name);
    const rel = path.join(relBase, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(abs, rel));
    else out.push(rel);
  }
  return out;
}

function declaredNonAssetFiles() {
  return ['distribution-manifest.json', ...MANIFEST.files, ...MANIFEST.tokens, ...MANIFEST.components]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();
}

test('packaged DS-2026 manifest-declared files stay byte-identical to canonical', () => {
  for (const rel of declaredNonAssetFiles()) {
    const canonical = path.join(CANON_DS, rel);
    const packaged = path.join(PACKAGED_DS, rel);
    assert.ok(fs.existsSync(packaged), `Packaged file missing: ${rel}`);
    assert.deepEqual(fs.readFileSync(packaged), fs.readFileSync(canonical), `Drift detected in ${rel}`);
  }
});

test('packaged DS-2026 asset trees have exact file-list and byte parity', () => {
  for (const tree of MANIFEST.assetTrees || []) {
    const canonicalRoot = path.join(CANON_DS, tree);
    const packagedRoot = path.join(PACKAGED_DS, tree);
    assert.ok(fs.existsSync(packagedRoot), `Packaged asset tree missing: ${tree}`);
    const canonicalFiles = walkFiles(canonicalRoot);
    const packagedFiles = walkFiles(packagedRoot);
    assert.deepEqual(packagedFiles, canonicalFiles, `Asset file-list drift in ${tree}`);
    for (const rel of canonicalFiles) {
      assert.deepEqual(
        fs.readFileSync(path.join(packagedRoot, rel)),
        fs.readFileSync(path.join(canonicalRoot, rel)),
        `Asset content drift in ${path.join(tree, rel)}`
      );
    }
  }
});

test('packaged DS-2026 representative brand assets exist and are non-empty', () => {
  const required = [
    'assets/fonts/GayaPatched-Medium.otf',
    'assets/fonts/GayaPatched-Bold.otf',
    'assets/fonts/IBMPlexSans-Regular.ttf',
    'assets/fonts/IBMPlexMono-Regular.ttf',
    'assets/icons/mushroom.svg',
    'assets/icons/room.svg',
    'assets/img/species/shiitake.png',
    'assets/img/species/lions-mane.png',
    'assets/img/species/reishi.png',
    'assets/textures/paper-grain.png'
  ];
  for (const rel of required) {
    const full = path.join(PACKAGED_DS, rel);
    assert.ok(fs.existsSync(full), `Brand asset missing: ${rel}`);
    assert.ok(fs.statSync(full).size > 0, `Brand asset empty: ${rel}`);
  }
});

test('fonts.css provides Gaya Patched and IBM Plex canonical face declarations', () => {
  const css = fs.readFileSync(path.join(PACKAGED_DS, 'tokens/fonts.css'), 'utf8');
  assert.match(css, /font-family:\s*'Gaya Patched'/);
  assert.match(css, /font-family:\s*'IBM Plex Sans'/);
  assert.match(css, /font-family:\s*'IBM Plex Mono'/);
  assert.match(css, /--font-editorial:\s*'Gaya Patched'/);
  assert.match(css, /--font-sans:\s*'IBM Plex Sans'/);
  assert.match(css, /--font-mono:\s*'IBM Plex Mono'/);
});

test('production shell preloads Gaya and links a packaged DS-2026 stylesheet', () => {
  const html = fs.readFileSync(path.join(APP_ROOT, 'Setas OS v5.dc.html'), 'utf8');
  assert.match(html, /<link rel="preload" href="ds-2026\/assets\/fonts\/GayaPatched-Bold\.otf"/);
  assert.match(html, /<link rel="stylesheet" href="ds-2026\/(?:index|operations|tokens\/fonts|tokens\/tokens)\.css">/);
});
