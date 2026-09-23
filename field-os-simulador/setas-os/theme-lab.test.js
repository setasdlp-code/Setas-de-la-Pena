'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const lab = fs.readFileSync(path.join(ROOT, 'theme-lab.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const typography = JSON.parse(fs.readFileSync(path.join(ROOT, 'ds-2026', 'tokens', 'typography.json'), 'utf8'));
const fontsCss = fs.readFileSync(path.join(ROOT, 'ds-2026', 'tokens', 'fonts.css'), 'utf8');


test('theme lab consumes only the canonical DS-2026 operations public bundle', () => {
  assert.match(lab, /<link rel="stylesheet" href="ds-2026\/operations\.css">/);
  assert.doesNotMatch(lab, /ds-2026\/index\.css/);
  assert.doesNotMatch(lab, /ds-2026\/tokens\/tokens\.css/);
  assert.doesNotMatch(lab, /ds-2026\/components\//);
  assert.doesNotMatch(lab, /sim\.css/);
});

test('theme lab previews canonical Criterio component APIs, not parallel os-* components', () => {
  for (const cls of [
    'sdp-btn',
    'sdp-lote',
    'sdp-reading',
    'sdp-provenance',
    'sdp-task',
    'sdp-band',
  ]) {
    assert.match(lab, new RegExp('class="[^"]*\\b' + cls.replace('-', '\\-') + '\\b'));
  }
  assert.doesNotMatch(lab, /class="[^"]*\bos-(?:batch|provenance|task|alert|room)/);
});

test('theme lab loads all five canonical packaged token sources', () => {
  assert.match(lab, /fetch\("ds-2026\/tokens\/primitives\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/semantic\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/typography\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/spacing\.json"/);
  assert.match(lab, /fetch\("ds-2026\/tokens\/domain\.json"/);
});

test('theme lab exposes normalized export builders for all five canonical token sources', () => {
  assert.match(lab, /function buildPrimitivesExport\(\)\{return clone\(state\.primitives\)\}/);
  assert.match(lab, /function buildSemanticExport\(\)\{return clone\(state\.semantic\)\}/);
  assert.match(lab, /function buildTypographyExport\(\)\{return clone\(state\.typography\)\}/);
  assert.match(lab, /function buildSpacingExport\(\)\{return clone\(state\.spacing\)\}/);
  assert.match(lab, /function buildDomainExport\(\)\{return clone\(state\.domain\)\}/);
  assert.match(lab, /window\.CriterioThemeLab\s*=\s*\{/);
  assert.match(lab, /buildPrimitivesExport/);
  assert.match(lab, /buildSemanticExport/);
  assert.match(lab, /buildTypographyExport/);
  assert.match(lab, /buildSpacingExport/);
  assert.match(lab, /buildDomainExport/);
  assert.match(lab, /download\("primitives\.json"/);
  assert.match(lab, /download\("semantic\.json"/);
  assert.match(lab, /download\("typography\.json"/);
  assert.match(lab, /download\("spacing\.json"/);
  assert.match(lab, /download\("domain\.json"/);
});

test('theme lab integrates granular diff inspector, per-token revert and pre-flight gates', () => {
  assert.match(lab, /computeDetailedDiff/);
  assert.match(lab, /renderDiffTable/);
  assert.match(lab, /runPreflightGates/);
  assert.match(lab, /revert-btn/);
  assert.match(lab, /JSON valid/);
  assert.match(lab, /semantic refs resolve/);
  assert.match(lab, /body >= 16px/);
  assert.match(lab, /screen metadata >= 11px/);
  assert.match(lab, /FIELD target >= 44px/);
  assert.match(lab, /contrast sanctioned pairs/);
  assert.match(lab, /unknown keys preserved/);
  assert.match(lab, /canonical repo selected/);
});

test('theme lab includes live contrast guardrails for critical sanctioned pairs', () => {
  assert.match(lab, /TEXT PRIMARY \/ PAGE/);
  assert.match(lab, /TEXT METADATA \/ PAGE/);
  assert.match(lab, /INVERSE \/ ACTION PRIMARY/);
  assert.match(lab, /ACTION ACCENT TEXT \/ ACCENT/);
  assert.match(lab, /WARNING TEXT \/ PAGE/);
  assert.match(lab, /ERROR \/ PAGE/);
  assert.match(lab, /data-pass/);
});

test('theme lab covers the four canonical surface profiles', () => {
  for (const mode of ['field', 'control', 'culinary', 'archive']) {
    assert.match(lab, new RegExp('<option value="' + mode + '">' + mode + '<\\/option>'));
  }
});

test('theme lab exposes canonical provenance through data-provenance', () => {
  for (const value of ['measured', 'calculated', 'manual', 'estimated', 'target']) {
    assert.match(lab, new RegExp('data-provenance="' + value + '"'));
  }
});

test('theme lab integrates Phomemo M110 physical simulator with 1-bit thermal mode', () => {
  assert.match(lab, /id="phomemo-container"/);
  assert.match(lab, /data-size="40x30"/);
  assert.match(lab, /data-onebit/);
  assert.match(lab, /40\s*×\s*30\s*mm/);
  assert.match(lab, /50\s*×\s*30\s*mm/);
  assert.match(lab, /qr-mini\.js/);
  assert.match(lab, /renderPhomemoQR/);
});

test('theme lab integrates agronomic formulator canvas with explicit provenance', () => {
  assert.match(lab, /species-targets\.js/);
  assert.match(lab, /Relación C:N/);
  assert.match(lab, /Eficiencia Biológica \(BE\)/);
  assert.match(lab, /Pleurotus eryngii/);
  assert.match(lab, /CALCULATED · RECETA/);
});

test('theme lab integrates safe File System Access API targeting canonical tokens only', () => {
  assert.match(lab, /showDirectoryPicker/);
  assert.match(lab, /08_brand\/ds-2026\/tokens/);
  assert.match(lab, /node 08_brand\/ds-2026\/scripts\/build-tokens\.mjs && node 08_brand\/ds-2026\/scripts\/sync-consumers\.mjs/);
});

test('package exposes an explicit local Theme Lab preview command', () => {
  assert.equal(pkg.scripts['theme-lab'], 'python3 -m http.server 4173');
});


test('theme lab implements click-to-edit inspect mode with overlay, sidebar and keyboard controls', () => {
  assert.match(lab, /id="inspect-toggle"/);
  assert.match(lab, /data-subpanel="inspector"/);
  assert.match(lab, /id="subpanel-inspector"/);
  assert.match(lab, /id="inspect-overlay-box"/);
  assert.match(lab, /id="inspect-tooltip"/);
  assert.match(lab, /function inspectToggle\(/);
  assert.match(lab, /function inspectSelect\(/);
  assert.match(lab, /e\.altKey&&e\.key\.toLowerCase\(\)==="i"/);
  assert.match(lab, /e\.key==="Escape"/);
});

test('inspector resolves nearest canonical component and never invents tokens for unknown nodes', () => {
  assert.match(lab, /function inspectResolve\(/);
  assert.match(lab, /function inspectNearest\(/);
  assert.match(lab, /computedOnly:true/);
  assert.match(lab, /Sin ruta canónica conocida/);
  assert.match(lab, /classList\.contains\("sdp-btn--primary"\)/);
  assert.match(lab, /classList\.contains\("sdp-reading__value"\)/);
  assert.match(lab, /classList\.contains\("sdp-provenance"\)/);
  assert.match(lab, /classList\.contains\("sdp-lote"\)/);
  assert.match(lab, /classList\.contains\("sdp-task"\)/);
});

test('inspector edits semantic, typography, spacing and domain working copies', () => {
  assert.match(lab, /function inspectMakeSemantic\(/);
  assert.match(lab, /function inspectRenderType\(/);
  assert.match(lab, /function inspectRenderSpacing\(/);
  assert.match(lab, /function inspectRenderDomain\(/);
  assert.match(lab, /onTokenModified\(\)/);
  assert.match(lab, /applyTypographyLive\(\)/);
  assert.match(lab, /applySpacingLive\(\)/);
  assert.match(lab, /applyDomainLive\(\)/);
});

test('inspector can jump from selected element to canonical sidebar token controls', () => {
  assert.match(lab, /function inspectFocusPath\(/);
  assert.match(lab, /data-token-path/);
  assert.match(lab, /Ir a Token en Sidebar/);
  assert.match(lab, /inspect-token-flash/);
});

test('rule geometry is canonical spacing data and is compiled instead of preview-only CSS', () => {
  const canonicalSpacing = JSON.parse(fs.readFileSync(path.join(ROOT, '..', '..', '08_brand', 'ds-2026', 'tokens', 'spacing.json'), 'utf8'));
  assert.deepEqual(canonicalSpacing.structure.rule, { hairline: '1px', heavy: '2px', frame: '1px' });
  assert.match(lab, /spacing\.structure\.rule/);
  assert.match(lab, /state\.spacing\.structure\.rule\.hairline/);
});

test('Theme Lab pre-flight covers operative typography, field cells and rule geometry', () => {
  assert.match(lab, /operative data >= 13px/);
  assert.match(lab, /label >= 11px/);
  assert.match(lab, /FIELD cell >= 48px/);
  assert.match(lab, /rule geometry 1–5px/);
});

test('embedded Theme Lab JavaScript parses after Inspector integration', () => {
  const match = lab.match(/<script>([\s\S]*)<\/script>\s*<\/body>/);
  assert.ok(match, 'embedded script found');
  assert.doesNotThrow(() => new Function(match[1]));
});


test('Gaya Patched exposes all six real weights with matching italic faces', () => {
  assert.deepEqual(typography.families.editorial.weights, [100, 300, 400, 500, 700, 900]);
  assert.deepEqual(typography.families.editorial.styles, ['normal', 'italic']);
  assert.equal(typography.families.editorial.weights.includes(600), false, 'Gaya has no vendored Semibold 600 face');

  const faces = [
    ['Thin', 100],
    ['Light', 300],
    ['Regular', 400],
    ['Medium', 500],
    ['Bold', 700],
    ['Black', 900],
  ];
  for (const [name, weight] of faces) {
    const normalFile = 'GayaPatched-' + name + '.otf';
    const italicFile = name === 'Regular' ? 'GayaPatched-Italic.otf' : 'GayaPatched-' + name + 'Italic.otf';
    assert.ok(fs.existsSync(path.join(ROOT, 'ds-2026', 'assets', 'fonts', normalFile)), normalFile + ' exists');
    assert.ok(fs.existsSync(path.join(ROOT, 'ds-2026', 'assets', 'fonts', italicFile)), italicFile + ' exists');
    assert.match(fontsCss, new RegExp(normalFile.replace('.', '\\.')));
    assert.match(fontsCss, new RegExp(italicFile.replace('.', '\\.')));
    assert.match(fontsCss, new RegExp('font-weight:' + weight + ';\\s*font-style:italic'));
  }
});

test('Theme Lab exposes Gaya Patched Normal/Italic per role and the 12-face matrix', () => {
  assert.match(lab, /id="typography-family-style-controls"/);
  assert.match(lab, /Gaya Patched · 12 Faces Reales/);
  assert.match(lab, /id="gaya-face-matrix"/);
  assert.match(lab, /function typographyFamilyMeta\(/);
  assert.match(lab, /styles:\["normal","italic"\]/);
  assert.match(lab, /weights:\[100,300,400,500,700,900\]/);
  assert.match(lab, /Gaya Patched/);
  assert.match(lab, /Italic/);
});

test('Theme Lab can apply Gaya Italic to every editorial role without changing its real weight', () => {
  assert.match(lab, /id="gaya-all-italic"/);
  assert.match(lab, /id="gaya-all-normal"/);
  assert.match(lab, /item&&item\.family==="editorial"/);
  assert.match(lab, /item\.style="italic"/);
  assert.match(lab, /delete item\.style/);
});

test('Inspector uses family-aware Gaya weights and exposes style as a canonical typography property', () => {
  assert.match(lab, /typographyFamilyMeta\(spec\.family\)/);
  assert.match(lab, /Estilo · typography\.scale\./);
  assert.match(lab, /normalizeTypographyFace\(fs\)/);
  assert.match(lab, /ssel\.value==="normal"/);
});

test('pre-flight rejects synthesized or unsupported typography faces', () => {
  assert.match(lab, /font faces supported/);
  assert.match(lab, /meta\.weights\.indexOf\(Number\(item\.weight\)\)<0/);
  assert.match(lab, /meta\.styles\.indexOf\(style\)<0/);
});


test('Theme Lab shows an explicit Gaya Patched Italic direct selector with all six real weights', () => {
  assert.match(lab, /Gaya Patched · Selector Directo/);
  assert.match(lab, /id="gaya-direct-role"/);
  assert.match(lab, /id="gaya-direct-style"/);
  assert.match(lab, /<option value="italic">Gaya Patched Italic<\/option>/);
  assert.match(lab, /id="gaya-direct-weight"/);
  for (const weight of ['100', '300', '400', '500', '700', '900']) {
    assert.match(lab, new RegExp('<option value="' + weight + '">'));
  }
  assert.doesNotMatch(lab, /<option value="600">600 · Semibold<\/option>/);
  assert.match(lab, /id="gaya-direct-apply"/);
  assert.match(lab, /function applyGayaDirectSelection\(/);
});

test('Theme Lab dominance menu exposes Gaya Patched Italic explicitly', () => {
  assert.match(lab, /<option value="gaya-italic">Gaya Patched Italic Dominant<\/option>/);
  assert.match(lab, /this\.value==="gaya-italic"/);
});
