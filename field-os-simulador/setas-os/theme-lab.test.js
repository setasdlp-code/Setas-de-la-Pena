'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const lab = fs.readFileSync(path.join(ROOT, 'theme-lab.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

test('theme lab consumes only the canonical DS-2026 operations public bundle', () => {
  assert.match(lab, /<link rel="stylesheet" href="ds-2026\/operations\.css">/);
  assert.doesNotMatch(lab, /ds-2026\/index\.css/);
  assert.doesNotMatch(lab, /ds-2026\/tokens\/tokens\.css/);
  assert.doesNotMatch(lab, /ds-2026\/components\//);
  assert.doesNotMatch(lab, /sim\.css/);
});

test('theme lab previews canonical Criterio component APIs, not parallel os-* components', () => {
  for (const cls of ['sdp-btn', 'sdp-lote', 'sdp-reading', 'sdp-provenance', 'sdp-task', 'sdp-band', 'sdp-species']) {
    assert.match(lab, new RegExp('class="[^"]*\\b' + cls.replace('-', '\\-') + '\\b'));
  }
  assert.doesNotMatch(lab, /class="[^"]*\bos-(?:batch|provenance|task|alert|room)/);
});

test('theme lab loads all five packaged canonical token sources', () => {
  assert.match(lab, /names=\["primitives","semantic","typography","spacing","domain"\]/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/"\+n\+"\.json"/);
});

test('theme lab exposes normalized export builders for all five canonical JSON documents', () => {
  for (const fn of [
    'buildPrimitivesExport',
    'buildSemanticExport',
    'buildTypographyExport',
    'buildSpacingExport',
    'buildDomainExport',
  ]) {
    assert.match(lab, new RegExp('function ' + fn + '\\(\\)'));
  }
  assert.match(lab, /function exportsByName\(\)/);
  assert.match(lab, /Descargar 5 JSON/);
});

test('theme lab implements click-to-edit inspect mode with overlay and keyboard controls', () => {
  assert.match(lab, /id="inspect-toggle"/);
  assert.match(lab, /id="inspect-overlay-box"/);
  assert.match(lab, /id="inspect-tooltip"/);
  assert.match(lab, /id="inspector-panel"/);
  assert.match(lab, /function toggleInspect\(/);
  assert.match(lab, /function selectElement\(/);
  assert.match(lab, /e\.altKey&&e\.key\.toLowerCase\(\)==="i"/);
  assert.match(lab, /e\.key==="Escape"/);
});

test('inspector resolves canonical components and refuses to invent tokens for unknown nodes', () => {
  assert.match(lab, /function resolveElementTokens\(/);
  assert.match(lab, /function nearestInspectable\(/);
  assert.match(lab, /classList\.contains\("sdp-btn--primary"\)/);
  assert.match(lab, /classList\.contains\("sdp-species__common"\)/);
  assert.match(lab, /classList\.contains\("sdp-reading__value"\)/);
  assert.match(lab, /classList\.contains\("sdp-provenance"\)/);
  assert.match(lab, /computedOnly:true/);
  assert.match(lab, /no hay ruta canónica conocida/i);
});

test('inspector can edit semantic mappings, typography, spacing and domain working copies', () => {
  assert.match(lab, /function makeSemanticControl\(/);
  assert.match(lab, /function renderTypography\(/);
  assert.match(lab, /function renderSpacing\(/);
  assert.match(lab, /function renderDomain\(/);
  assert.match(lab, /applyTypographyLive\(\)/);
  assert.match(lab, /applySpacingLive\(\)/);
  assert.match(lab, /applyDomainLive\(\)/);
});

test('inspector exposes provenance through canonical data-provenance attributes', () => {
  for (const value of ['measured', 'calculated', 'manual', 'estimated']) {
    assert.match(lab, new RegExp('data-provenance="' + value + '"'));
  }
  assert.match(lab, /domain\.provenance/);
});

test('live contrast guardrails use current semantic mappings', () => {
  assert.match(lab, /TEXT PRIMARY \/ PAGE/);
  assert.match(lab, /TEXT METADATA \/ PAGE/);
  assert.match(lab, /INVERSE \/ ACTION PRIMARY/);
  assert.match(lab, /ACTION ACCENT TEXT \/ ACCENT/);
  assert.match(lab, /WARNING TEXT \/ PAGE/);
  assert.match(lab, /function semanticHex\(/);
});

test('Apply to Repo is permission-gated, validates the working copy and writes only canonical token JSON', () => {
  assert.match(lab, /showDirectoryPicker/);
  assert.match(lab, /function validateWorkingCopy\(/);
  assert.match(lab, /APPLY BLOQUEADO/);
  assert.match(lab, /childDir\(rootDir,"08_brand"\)/);
  assert.match(lab, /childDir\(d1,"ds-2026"\)/);
  assert.match(lab, /childDir\(d2,"tokens"\)/);
  assert.match(lab, /getFileHandle\(name\+"\.json"/);
  assert.doesNotMatch(lab, /getDirectoryHandle\("field-os-simulador"/);
});

test('Apply to Repo hard gates core accessibility contracts', () => {
  assert.match(lab, /size\("body",16\)/);
  assert.match(lab, /size\("data",13\)/);
  assert.match(lab, /size\("label",11\)/);
  assert.match(lab, /size\("micro-screen",11\)/);
  assert.match(lab, /tapTargetMin debe ser ≥44px/);
  assert.match(lab, /fieldCellMinHeight debe ser ≥48px/);
  assert.match(lab, /Contraste AA falla/);
});

test('theme lab covers the four canonical surface profiles', () => {
  for (const mode of ['field', 'control', 'culinary', 'archive']) {
    assert.match(lab, new RegExp('<option value="' + mode + '">' + mode + '<\\/option>'));
  }
});

test('theme lab embedded JavaScript parses', () => {
  const match = lab.match(/<script>([\s\S]*)<\/script>\s*<\/body>/);
  assert.ok(match, 'embedded script found');
  assert.doesNotThrow(() => new Function(match[1]));
});

test('package exposes an explicit local Theme Lab preview command', () => {
  assert.equal(pkg.scripts['theme-lab'], 'python3 -m http.server 4173');
});

test('rule thickness is a canonical spacing token, not a Theme Lab-only override', () => {
  const canonicalSpacing = JSON.parse(fs.readFileSync(path.join(ROOT, '..', '..', '08_brand', 'ds-2026', 'tokens', 'spacing.json'), 'utf8'));
  assert.deepEqual(canonicalSpacing.structure.rule, { hairline: '1px', heavy: '2px', frame: '1px' });
  assert.match(lab, /spacing\.structure\.rule/);
});
