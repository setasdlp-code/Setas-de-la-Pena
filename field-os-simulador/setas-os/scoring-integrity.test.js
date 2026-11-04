'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SCORING_PATH = path.join(__dirname, 'scoring.js');
// Reference updated for ADR-0007 prediction-band corrections: confidence caps
// at medium without independent validation; weak history retains the width floor.
// Central EB, weights, dimensions, severity and scenario ranking are unchanged.
const EXPECTED_SHA256 = '3e0952e954d2271a85e8273eb6de93fcfc58ce43eac798c5e5c35633ea9b66c4';

test('ADR-0004: scoring.js es estrictamente inmutable y coincide con el hash SHA-256 de referencia', () => {
  assert.ok(fs.existsSync(SCORING_PATH), 'scoring.js debe existir en field-os-simulador/setas-os/');
  const content = fs.readFileSync(SCORING_PATH);
  const actualHash = crypto.createHash('sha256').update(content).digest('hex');
  assert.equal(
    actualHash,
    EXPECTED_SHA256,
    `Violación de ADR-0004: scoring.js fue modificado. Hash actual: ${actualHash}, esperado: ${EXPECTED_SHA256}`
  );
});

test('ADR-0004: scoring.js exporta SetasScoring con métodos canónicos puros', () => {
  const Scoring = require('./scoring.js');
  assert.ok(Scoring, 'SetasScoring debe estar definido');
  assert.equal(typeof Scoring.scoreRecipe, 'function', 'scoreRecipe debe ser función');
  assert.equal(typeof Scoring.assessSeverity, 'function', 'assessSeverity debe ser función');
  assert.equal(typeof Scoring.detectSeverity, 'function', 'detectSeverity debe ser función');
});
