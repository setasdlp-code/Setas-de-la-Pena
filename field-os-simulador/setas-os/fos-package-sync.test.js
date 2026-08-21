'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const APP_ROOT = __dirname;
const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');
const CANON = path.join(REPO_ROOT, '08_brand', 'field-os-identity', 'tokens');
const PACKAGED = path.join(APP_ROOT, '_ds', 'setas-de-la-pe-a-field-operating-system-d39a2369-cff1-4759-ac62-d7b102a27e2e', 'tokens');

function read(dir, name) {
  return fs.readFileSync(path.join(dir, name), 'utf8');
}

function vars(css) {
  const out = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match;
  while ((match = re.exec(css))) out.set(match[1], match[2].trim());
  return out;
}

function assertVariablesMatch(file, required) {
  const source = vars(read(CANON, file));
  const packaged = vars(read(PACKAGED, file));
  for (const key of required) {
    assert.equal(packaged.get(key), source.get(key), `${file} drifted for ${key}`);
  }
}

test('packaged FOS colors keep canonical accessible line and status tokens', () => {
  assertVariablesMatch('colors.css', [
    '--paper-0','--ink-0','--line-0','--line-1','--line-2',
    '--accent-olive','--accent-terracotta','--accent-blue-grey','--accent-mushroom','--accent-rust',
    '--status-active','--status-attention','--status-info','--status-archived','--status-error',
    '--focus-ring',
  ]);
});

test('packaged FOS typography keeps canonical operational minimums', () => {
  assertVariablesMatch('typography.css', [
    '--text-xs','--text-sm','--text-base','--text-prose','--text-md','--text-lg',
    '--text-min-prose','--text-min-operative','--leading-field','--leading-table',
    '--print-code-x-height','--print-pictogram-min','--pictogram-min-screen',
  ]);
});

test('packaged FOS structure keeps canonical field interaction geometry', () => {
  assertVariablesMatch('structure.css', [
    '--radius-none','--radius-sm','--radius-md','--rule-hairline','--rule-strong','--rule-heavy',
    '--focus-outline','--field-cell-min-height','--field-print-margin','--tap-target-min','--tap-target-gap-min',
    '--pictogram-grid','--pictogram-safe','--pictogram-stroke',
  ]);
});

test('packaged spacing tokens stay in sync with canonical FOS', () => {
  assert.equal(read(PACKAGED, 'spacing.css'), read(CANON, 'spacing.css'));
});

test('Setas OS operational component extension is packaged byte-for-byte', () => {
  assert.equal(read(PACKAGED, 'setas-os-components.css'), read(CANON, 'setas-os-components.css'));
});
