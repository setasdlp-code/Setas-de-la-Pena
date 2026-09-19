#!/usr/bin/env node
/**
 * scripts/visual-contract.mjs
 *
 * Visual contract gate enforcing 10 anti-slop, accessibility,
 * and operational integrity rules across DS-2026.
 */

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DS_ROOT = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(name, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`ok   [gate ${totalChecks.toString().padStart(2, '0')}] ${name}`);
    passedChecks++;
  } catch (err) {
    console.error(`FAIL [gate ${totalChecks.toString().padStart(2, '0')}] ${name}: ${err.message}`);
    failedChecks++;
  }
}

console.log('🏛️  DS-2026 Visual Contract & Integrity Gate\n');

// Gate 1: 0 text < 11px on screen (11px micro floor)
check('0 screen text < 11px (micro floor enforcement)', () => {
  const cssDir = path.join(DS_ROOT, 'components');
  const files = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  }
  collect(cssDir);

  const violations = [];
  const bannedSizes = /(?:font-size:\s*(?:[1-9]|10)px\b)/i;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Ignore print-specific media queries or explicit print class
      if (line.includes('micro-print') || line.includes('@media print')) return;
      if (bannedSizes.test(line)) {
        violations.push(`${path.relative(DS_ROOT, file)}:${idx + 1} -> ${line.trim()}`);
      }
    });
  }
  if (violations.length > 0) {
    throw new Error(`Found text sizes < 11px on screen:\n  ${violations.join('\n  ')}`);
  }
});

// Gate 2: Canonical FIELD interaction primitives must bind to the touch contract.
check('FIELD controls bind to canonical >=44px touch tokens', () => {
  const actions = fs.readFileSync(path.join(DS_ROOT, 'components/shared/actions.css'), 'utf8');
  const forms = fs.readFileSync(path.join(DS_ROOT, 'components/shared/forms.css'), 'utf8');
  const interaction = fs.readFileSync(path.join(DS_ROOT, 'components/core/interaction.css'), 'utf8');
  const task = fs.readFileSync(path.join(DS_ROOT, 'components/operations/task.css'), 'utf8');

  const required = [
    [actions, /\.sdp-btn\s*\{[\s\S]*?min-height:\s*var\(--tap-target-min\)/, '.sdp-btn'],
    [forms, /\.sdp-input[^\{]*\{[\s\S]*?min-height:\s*var\(--tap-target-min\)/, '.sdp-input/.sdp-select'],
    [interaction, /\[data-mode="field"\][\s\S]*?min-height:\s*44px/, '[data-mode="field"]'],
    [task, /\.sdp-task\s*\{[\s\S]*?min-height:\s*var\(--field-cell-min-height\)/, '.sdp-task']
  ];
  const missing = required.filter(([source, re]) => !re.test(source)).map(([, , name]) => name);
  if (missing.length) throw new Error('Touch contract missing from: ' + missing.join(', '));
});

// Gate 3: 0 diffuse box-shadows in components
check('0 diffuse box-shadows (borders and hairlines only)', () => {
  const cssDir = path.join(DS_ROOT, 'components');
  const files = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  }
  collect(cssDir);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (/\bbox-shadow:\s*(?!none\b)[^;]+;/i.test(content)) {
      throw new Error(`Diffuse box-shadow found in ${path.relative(DS_ROOT, file)}`);
    }
  }
});

// Gate 4: 0 backdrop-filter in components
check('0 backdrop-filter (no glassmorphism slop)', () => {
  const cssDir = path.join(DS_ROOT, 'components');
  const files = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  }
  collect(cssDir);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (/backdrop-filter/i.test(content)) {
      throw new Error(`backdrop-filter found in ${path.relative(DS_ROOT, file)}`);
    }
  }
});

// Gate 5: 0 unapproved gradients in components
check('0 unapproved gradients in components', () => {
  const cssDir = path.join(DS_ROOT, 'components');
  const files = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  }
  collect(cssDir);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (/(?:linear-gradient|radial-gradient|conic-gradient)/i.test(content)) {
      throw new Error(`Unapproved gradient found in ${path.relative(DS_ROOT, file)}`);
    }
  }
});

// Gate 6: 0 raw hex colors in components/**/*.css
check('0 raw hex colors in components (tokens only)', () => {
  const cssDir = path.join(DS_ROOT, 'components');
  const files = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  }
  collect(cssDir);

  const violations = [];
  const hexPattern = /#([0-9a-fA-F]{3,8})\b/;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Ignore comments or URLs
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
      if (hexPattern.test(line)) {
        violations.push(`${path.relative(DS_ROOT, file)}:${idx + 1} -> ${line.trim()}`);
      }
    });
  }
  if (violations.length > 0) {
    throw new Error(`Found raw hex in component CSS:\n  ${violations.join('\n  ')}`);
  }
});

// Gate 7: 0 undefined CSS variables referenced in components
check('0 undefined CSS variables in components', () => {
  const defined = new Set();

  // Read from tokens.css and fonts.css
  const tokenFiles = [
    path.join(DS_ROOT, 'tokens', 'tokens.css'),
    path.join(DS_ROOT, 'tokens', 'fonts.css')
  ];
  for (const tf of tokenFiles) {
    if (fs.existsSync(tf)) {
      const content = fs.readFileSync(tf, 'utf8');
      for (const m of content.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g)) {
        defined.add(`--${m[1]}`);
      }
    }
  }

  // Also collect local definitions in components (e.g. :root in archive.css)
  const cssDir = path.join(DS_ROOT, 'components');
  const files = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  }
  collect(cssDir);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const m of content.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g)) {
      defined.add(`--${m[1]}`);
    }
  }

  const missing = new Set();
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const m of content.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) {
      const varName = m[1];
      if (!defined.has(varName)) {
        missing.add(`${varName} in ${path.relative(DS_ROOT, file)}`);
      }
    }
  }
  if (missing.size > 0) {
    throw new Error(`Undefined CSS variables referenced:\n  ${Array.from(missing).join('\n  ')}`);
  }
});

// Gate 8: All mockups declare data-content-status="illustrative"
check('All mockups declare data-content-status="illustrative"', () => {
  const mockupsDir = path.join(DS_ROOT, 'mockups');
  const htmlFiles = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'out') collect(full);
      } else if (entry.name.endsWith('.html')) {
        htmlFiles.push(full);
      }
    }
  }
  collect(mockupsDir);

  const missingStatus = [];
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('data-content-status="illustrative"')) {
      missingStatus.push(path.relative(DS_ROOT, file));
    }
  }
  if (missingStatus.length > 0) {
    throw new Error(`Mockups missing data-content-status="illustrative":\n  ${missingStatus.join('\n  ')}`);
  }
});

// Gate 9: Shell declares visible illustrative warning banner
check('Visible illustrative warning banner in _shell.css', () => {
  const shellFile = path.join(DS_ROOT, 'mockups', '_shell.css');
  const content = fs.readFileSync(shellFile, 'utf8');
  if (!content.includes('data-content-status="illustrative"') || !content.includes('PROTOTIPO · DATOS ILUSTRATIVOS')) {
    throw new Error('_shell.css must declare ::before banner with "PROTOTIPO · DATOS ILUSTRATIVOS"');
  }
});

// Gate 10: Valid JSON syntax in all 6 token files
check('Valid JSON syntax in all token files', () => {
  const tokenFiles = [
    'primitives.json',
    'semantic.json',
    'domain.json',
    'typography.json',
    'spacing.json',
    'colors.json'
  ];
  for (const f of tokenFiles) {
    const p = path.join(DS_ROOT, 'tokens', f);
    if (!fs.existsSync(p)) throw new Error(`Missing token file: ${f}`);
    const raw = fs.readFileSync(p, 'utf8');
    try {
      JSON.parse(raw);
    } catch (e) {
      throw new Error(`JSON syntax error in ${f}: ${e.message}`);
    }
  }
});


// Gate 11: Generated artifacts are current.
check('generated token artifacts match canonical JSON sources', () => {
  const proc = spawnSync(process.execPath, ['scripts/build-tokens.mjs', '--check'], {
    cwd: DS_ROOT, encoding: 'utf8'
  });
  if (proc.status !== 0) throw new Error((proc.stderr || proc.stdout || 'token compiler drift').trim());
});

// Gate 12: Border semantic tokens are colors; rule tokens carry width/style.
check('border semantic tokens are color-only and rule tokens carry geometry', () => {
  const css = fs.readFileSync(path.join(DS_ROOT, 'tokens/tokens.css'), 'utf8');
  for (const name of ['border-hairline', 'border-heavy']) {
    const m = css.match(new RegExp('--' + name + ':\\s*([^;]+);'));
    if (!m) throw new Error('Missing --' + name);
    if (/\\b(?:solid|dashed|dotted|px)\\b/.test(m[1])) throw new Error('--' + name + ' must resolve to color only, got: ' + m[1]);
  }
  for (const name of ['rule-hairline', 'rule-heavy', 'rule-frame']) {
    const m = css.match(new RegExp('--' + name + ':\\s*([^;]+);'));
    if (!m || !/\\b(?:solid|dashed|dotted)\\b/.test(m[1])) throw new Error('--' + name + ' must carry border geometry');
  }
});

// Gate 13: Raw warning pigment may not carry component semantics directly.
check('components never use low-contrast --status-warn directly', () => {
  const violations = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.css')) {
        fs.readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
          if (line.includes('var(--status-warn)')) violations.push(path.relative(DS_ROOT, full) + ':' + (i + 1));
        });
      }
    }
  }
  walk(path.join(DS_ROOT, 'components'));
  if (violations.length) throw new Error('Use --status-warn-marker/bg/text instead: ' + violations.join(', '));
});

// Gate 14: A canonical root .sdp-* selector has one owning module.
check('canonical root selectors have a single module owner', () => {
  const owners = new Map();
  const roots = ['core', 'shared', 'operations', 'market'];
  for (const root of roots) {
    const dir = path.join(DS_ROOT, 'components', root);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.css')) continue;
      const file = path.join(dir, entry.name);
      const css = fs.readFileSync(file, 'utf8');
      for (const m of css.matchAll(/(?:^|\n)\s*(\.sdp-[A-Za-z0-9_-]+)\s*\{/g)) {
        const selector = m[1];
        if (!owners.has(selector)) owners.set(selector, new Set());
        owners.get(selector).add(path.relative(DS_ROOT, file));
      }
    }
  }
  const dupes = [...owners.entries()].filter(([, files]) => files.size > 1);
  if (dupes.length) throw new Error(dupes.map(([s, files]) => s + ' -> ' + [...files].join(', ')).join(' | '));
});

// Gate 15: Public bundles are alternatives, never nested bundles.
check('public bundle contract is non-nested', () => {
  for (const file of ['index.css', 'operations.css', 'market.css']) {
    const css = fs.readFileSync(path.join(DS_ROOT, file), 'utf8');
    if (/[@]import\s+["'](?:index|operations|market)\.css["']/.test(css)) {
      throw new Error(file + ' must not import another public bundle');
    }
  }
});

console.log(`\nResults: ${passedChecks}/${totalChecks} gates passed (${failedChecks} failed).`);
if (failedChecks > 0) {
  process.exit(1);
}
console.log('🎉 All 10 visual and structural contract gates passed successfully.\n');
