'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const JSX_PATH = path.join(ROOT, 'simulador-app.jsx');
const JS_PATH = path.join(ROOT, 'simulador-app.js');
const jsx = fs.readFileSync(JSX_PATH, 'utf8');
const js = fs.readFileSync(JS_PATH, 'utf8');

const sweepJournal = require('./sweep-journal.js');
const bitacoraModel = require('./bitacora-model.js');
const batchSheet = require('./batch-sheet.js');

test('simulador-app.jsx: implementa selector de tres modos (ronda, cosecha rápida, barrido)', () => {
  assert.match(jsx, /setQrScanMode\(['"]round['"]\)/, 'Debe incluir botón para Modo Ronda');
  assert.match(jsx, /setQrScanMode\(['"]harvest['"]\)/, 'Debe incluir botón para Modo Cosecha Rápida');
  assert.match(jsx, /setQrScanMode\(['"]sweep['"]\)/, 'Debe incluir botón para Modo Barrido');
  assert.match(jsx, /Báscula Cosecha/, 'Debe tener etiqueta visual Báscula Cosecha');
  assert.match(jsx, /Barrido Sala/, 'Debe tener etiqueta visual Barrido Sala');
});

test('simulador-app.jsx: implementa guardia de pausa de decodificador (isDecodingPausedRef)', () => {
  assert.match(jsx, /const isDecodingPausedRef = React\.useRef\(false\);/, 'Debe definir ref para pausar el decodificador');
  assert.match(jsx, /if \(!raw \|\| scanResolvingRef\.current\) return;/, 'Debe mantener el guard canónico contra reentradas');
  assert.match(jsx, /if \(isDecodingPausedRef\.current\) return;/, 'handleScannedValue debe abortar si la decodificación está pausada');
  assert.match(jsx, /isDecodingPausedRef\.current = true;/, 'Debe pausar el decodificador al escanear una canastilla');
});

test('simulador-app.jsx: implementa captura rápida de cosecha con cálculo neto en vivo y guarda doble clic', () => {
  assert.match(jsx, /const isSavingHarvestRef = React\.useRef\(false\);/, 'Debe tener guardia de guardado doble');
  assert.match(jsx, /handleSaveHarvestCrate/, 'Debe implementar handler para guardar pesada rápida');
  assert.match(jsx, /harvestGrossInput/, 'Debe registrar input numérico de peso bruto');
  assert.match(jsx, /harvestTareInput/, 'Debe registrar input o tara de la canastilla');
  assert.match(jsx, /Tara \(\{tare\}g\) excede el peso bruto/, 'Debe validar que la tara no supere el peso bruto');
  assert.match(jsx, /harvestSessionStats/, 'Debe llevar el acumulado de la sesión de pesaje');
});

test('simulador-app.jsx: implementa cola de barrido masivo con feedback sonoro y háptico', () => {
  assert.match(jsx, /playSweepBeep/, 'Debe implementar feedback sonoro via Web Audio API');
  assert.match(jsx, /triggerHaptic/, 'Debe implementar feedback háptico via navigator.vibrate');
  assert.match(jsx, /handleApplySweepColonizacion/, 'Debe implementar handler de aplicación masiva de colonización');
  assert.match(jsx, /handleApplySweepRisk/, 'Debe implementar handler de observación de riesgo en barrido');
  assert.match(jsx, /sweepQueue/, 'Debe gestionar la cola temporal de bolsas escaneadas');
});

test('simulador-app.js: bundle generado está sincronizado con simulador-app.jsx y contiene los flujos', () => {
  const hash = crypto.createHash('sha256').update(jsx, 'utf8').digest('hex');
  assert.match(js, new RegExp(`// source-hash: ${hash}`), 'simulador-app.js debe tener el hash exacto de simulador-app.jsx');
  assert.match(js, /handleSaveHarvestCrate/, 'Bundle debe contener handler de cosecha rápida');
  assert.match(js, /handleApplySweepColonizacion/, 'Bundle debe contener handler de barrido');
});

test('Integración de Contrato: canastillas -> resolución uniforme -> normalización de cosecha', () => {
  // 1. Resolver canastilla registrada
  const scan = batchSheet.resolveScan('CAN-01', {
    crates: batchSheet.CONFIG_CRATES,
  });
  assert.equal(scan.kind, 'crate');
  assert.equal(scan.crateCode, 'CAN-01');

  // 2. Normalizar pesada con tara verificada
  const normVerified = bitacoraModel.normalizeHarvestCapture({
    crateId: scan.crateId,
    crateCode: scan.crateCode,
    pesoBrutoGramos: 1500,
    taraGramos: 420,
    taraSource: 'field_measured',
    flush: 1,
  });
  assert.equal(normVerified.pesoFrescoGramos, 1080);
  assert.equal(normVerified.netCalculationStatus, 'verified');

  // 3. Normalizar pesada con tara null (no verificada)
  const normMissing = bitacoraModel.normalizeHarvestCapture({
    crateId: scan.crateId,
    crateCode: scan.crateCode,
    pesoBrutoGramos: 1500,
    taraGramos: scan.taraGramos, // null
    taraSource: scan.taraSource, // unverified
    flush: 1,
  });
  assert.equal(normMissing.pesoBrutoGramos, 1500);
  assert.equal(normMissing.pesoFrescoGramos, null);
  assert.equal(normMissing.netCalculationStatus, 'blocked_missing_tare');
});
