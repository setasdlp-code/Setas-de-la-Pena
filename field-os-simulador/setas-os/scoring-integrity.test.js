'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SCORING_PATH = path.join(__dirname, 'scoring.js');
// Referencia actualizada por la corrección explícita de suplementación efectiva.
// No cambia pesos/umbrales ni introduce historial productivo en el ranking (ADR-0004).
const EXPECTED_SHA256 = '284154845f323ae3e814220c8fecdba8d34e3ef5dfbcfc2eee5a7c3d2007f47b';

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
