'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const workflow = fs.readFileSync(
  path.join(ROOT, '..', '..', '.github', 'workflows', 'setas-os-v5-lighthouse.yml'),
  'utf8'
);

test('Lighthouse CI instala el toolchain bloqueado y no re-resuelve dependencias en cada runner', () => {
  assert.match(workflow, /^\s+run:\s*npm ci\s*$/m);
  assert.match(workflow, /^\s+run:\s*npm run lhci\s*$/m);
  assert.doesNotMatch(workflow, /^\s+run:\s*npm install --no-save @lhci\/cli\s*$/m);
});
