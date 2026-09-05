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

test('packaged DS-2026 tokens stay in sync with canonical 08_brand/ds-2026', () => {
  const tokenFiles = ['tokens/tokens.css', 'tokens/fonts.css', 'tokens/colors.json', 'tokens/typography.json', 'tokens/spacing.json'];
  for (const f of tokenFiles) {
    assert.equal(read(PACKAGED_DS, f), read(CANON_DS, f), `Drift detected in ${f}`);
  }
});

test('packaged DS-2026 components stay in sync with canonical 08_brand/ds-2026', () => {
  const compFiles = ['components/base.css', 'components/components.css', 'components/editorial.css'];
  for (const f of compFiles) {
    assert.equal(read(PACKAGED_DS, f), read(CANON_DS, f), `Drift detected in ${f}`);
  }
});

test('packaged DS-2026 font and icon assets exist and are non-empty', () => {
  const sampleFonts = [
    'assets/fonts/GayaPatched-Medium.otf',
    'assets/fonts/GayaPatched-Bold.otf',
    'assets/fonts/IBMPlexSans-Regular.ttf',
    'assets/fonts/IBMPlexMono-Regular.ttf'
  ];
  for (const fontPath of sampleFonts) {
    const fullPath = path.join(PACKAGED_DS, fontPath);
    assert.ok(fs.existsSync(fullPath), `Font missing: ${fontPath}`);
    assert.ok(fs.statSync(fullPath).size > 1000, `Font empty or corrupted: ${fontPath}`);
  }
  const sampleSpecies = [
    'assets/img/species/reishi.png',
    'assets/img/species/lions-mane.png',
    'assets/img/species/shiitake.png'
  ];
  for (const imgPath of sampleSpecies) {
    const fullPath = path.join(PACKAGED_DS, imgPath);
    assert.ok(fs.existsSync(fullPath), `Species img missing: ${imgPath}`);
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
