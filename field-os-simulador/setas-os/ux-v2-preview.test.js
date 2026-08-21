'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'ux-v2-preview.html'), 'utf8');
const components = fs.readFileSync(path.join(__dirname, '_ds', 'setas-de-la-pe-a-field-operating-system-d39a2369-cff1-4759-ac62-d7b102a27e2e', 'tokens', 'setas-os-components.css'), 'utf8');

test('UX v2 reference exposes Hoy and canonical batch detail surfaces', () => {
  assert.match(html, /data-testid="ux-v2-today"/);
  assert.match(html, /data-testid="ux-v2-batch-detail"/);
  assert.match(html, /data-route="today"/);
  assert.match(html, /data-route="batches"/);
  assert.match(html, /data-route="rooms"/);
});

test('UX v2 reference uses the shared workflow contract for queue and actions', () => {
  assert.match(html, /SetasOSWorkflow/);
  assert.match(html, /W\.buildTodayQueue/);
  assert.match(html, /W\.validActions\('incubation','operario'\)/);
});

test('UX v2 field capture components meet the intended 48px mobile preference', () => {
  assert.match(components, /@media \(max-width: 700px\)[\s\S]*\.os-action,[\s\S]*\.os-icon-action \{ min-height:48px; \}/);
  assert.match(html, /class="os-scan-target"/);
  assert.match(components, /\.os-sticky-actions/);
});

test('UX v2 reference does not add raw hex colors', () => {
  assert.doesNotMatch(html, /#[0-9a-f]{3,8}\b/i);
});
