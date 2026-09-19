'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const APP_ROOT = __dirname;
const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');
const CANON_DS = path.join(REPO_ROOT, '08_brand', 'ds-2026');
const PACKAGED_DS = path.join(APP_ROOT, 'ds-2026');

function read(base, rel) {
  return fs.readFileSync(path.join(base, rel), 'utf8');
}

function loadManifest() {
  const canonManifestPath = path.join(CANON_DS, 'distribution-manifest.json');
  assert.ok(fs.existsSync(canonManifestPath), 'Canonical distribution-manifest.json must exist');
  return JSON.parse(fs.readFileSync(canonManifestPath, 'utf8'));
}

test('distribution-manifest.json is synchronized and valid', () => {
  const manifest = loadManifest();
  assert.equal(manifest.name, 'ds-2026-distribution-manifest');
  assert.ok(manifest.version.includes('criterio'));
  assert.equal(
    read(PACKAGED_DS, 'distribution-manifest.json'),
    read(CANON_DS, 'distribution-manifest.json'),
    'Drift detected in distribution-manifest.json'
  );
});

test('packaged DS-2026 tokens stay in sync with canonical 08_brand/ds-2026 according to manifest', () => {
  const manifest = loadManifest();
  assert.ok(manifest.tokens && manifest.tokens.length >= 8, 'Manifest must declare full layered token suite');
  for (const f of manifest.tokens) {
    assert.equal(read(PACKAGED_DS, f), read(CANON_DS, f), `Drift detected in token file ${f}`);
  }
});

test('packaged DS-2026 components stay in sync with canonical 08_brand/ds-2026 according to manifest', () => {
  const manifest = loadManifest();
  assert.ok(manifest.components && manifest.components.length >= 20, 'Manifest must declare all modular component layers and facades');
  for (const f of manifest.components) {
    assert.equal(read(PACKAGED_DS, f), read(CANON_DS, f), `Drift detected in component file ${f}`);
  }
});

test('packaged DS-2026 public entrypoints and governance stay in sync with canonical 08_brand/ds-2026', () => {
  const manifest = loadManifest();
  for (const f of manifest.files) {
    assert.equal(read(PACKAGED_DS, f), read(CANON_DS, f), `Drift detected in root file ${f}`);
  }
});

test('packaged DS-2026 font and icon assets exist and are non-empty according to manifest', () => {
  const manifest = loadManifest();
  for (const fontPath of manifest.assets.fonts) {
    const fullPath = path.join(PACKAGED_DS, fontPath);
    assert.ok(fs.existsSync(fullPath), `Font missing from package: ${fontPath}`);
    assert.ok(fs.statSync(fullPath).size > 1000, `Font empty or corrupted: ${fontPath}`);
  }
  for (const imgPath of manifest.assets.species_images) {
    const fullPath = path.join(PACKAGED_DS, imgPath);
    assert.ok(fs.existsSync(fullPath), `Species img missing from package: ${imgPath}`);
    assert.ok(fs.statSync(fullPath).size > 1000, `Species img empty: ${imgPath}`);
  }
});

test('fonts.css provides Gaya, Gaya Patched, and GayaPatched @font-face declarations', () => {
  const fontsCss = read(PACKAGED_DS, 'tokens/fonts.css');
  assert.match(fontsCss, /font-family:\s*'Gaya Patched'/);
  assert.match(fontsCss, /font-family:\s*'Gaya'/);
  assert.match(fontsCss, /font-family:\s*'GayaPatched'/);
  assert.match(fontsCss, /--font-editorial:\s*'Gaya Patched',\s*'Gaya'/);
  assert.match(fontsCss, /--font-serif:\s*'Gaya Patched',\s*'Gaya'/);
});

test('production shell preloads Gaya and links ds-2026/tokens/fonts.css in head', () => {
  const html = fs.readFileSync(path.join(APP_ROOT, 'Setas OS v5.dc.html'), 'utf8');
  assert.match(html, /<link rel="stylesheet" href="ds-2026\/tokens\/fonts\.css">/);
  assert.match(html, /<link rel="preload" href="ds-2026\/assets\/fonts\/GayaPatched-Bold\.otf"/);
  assert.match(html, /font-family:var\(--font-editorial,\s*var\(--font-serif,\s*'Gaya Patched',\s*'Gaya'/);
});
