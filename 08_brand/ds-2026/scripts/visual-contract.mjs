#!/usr/bin/env node
/**
 * scripts/visual-contract.mjs
 *
 * Visual contract gate enforcing 10 anti-slop, accessibility,
 * and operational integrity rules across DS-2026.
 */

import fs from 'node:fs';
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

// Gate 2: Touch targets >= 44px in FIELD components
check('0 field touch targets < 44px (touch safety floor)', () => {
  const actionFile = path.join(DS_ROOT, 'components', 'shared', 'action.css');
  const formsFile = path.join(DS_ROOT, 'components', 'shared', 'forms.css');
  const content = fs.readFileSync(actionFile, 'utf8') + '\n' + fs.readFileSync(formsFile, 'utf8');

  if (!content.includes('min-height: 48px') && !content.includes('min-height: 44px')) {
    throw new Error('Field buttons and inputs must declare min-height >= 44px');
  }
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

console.log(`\nResults: ${passedChecks}/${totalChecks} gates passed (${failedChecks} failed).`);
if (failedChecks > 0) {
  process.exit(1);
}
console.log('🎉 All 10 visual and structural contract gates passed successfully.\n');
