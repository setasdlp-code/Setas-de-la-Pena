'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SCORING_PATH = path.join(__dirname, 'scoring.js');
const EXPECTED_SHA256 = 'e1178425d70c573e74a82bd7e3cc8f6506dc35a997f95b3928263bd1aad21f9d';

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
