'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = rel => fs.readFileSync(path.join(__dirname, rel), 'utf8');
const db = read('firebase/db.js');
const bridge = read('production-learning-bridge.js');
const learningBlock = db.slice(db.indexOf('// ── Production Learning Loop'));

test('Firestore persiste RoomCycle, telemetría y CycleEvidence con IDs deterministas', () => {
  assert.match(learningBlock, /setDoc\(doc\(db, "room_cycles"/);
  assert.match(learningBlock, /setDoc\(doc\(db, "telemetry_readings"/);
  assert.match(learningBlock, /setDoc\(doc\(db, "cycle_evidence"/);
  assert.match(learningBlock, /telemetryDocId/);
  assert.doesNotMatch(learningBlock.slice(0, learningBlock.indexOf('// ── Incidencias climáticas')), /addDoc\(/);
});

test('db.js carga el bridge después de publicar SetasDB', () => {
  const expose = db.indexOf('window.SetasDB =');
  const load = db.indexOf("import('../production-learning-bridge.js')");
  assert.ok(expose >= 0 && load > expose);
});

test('bridge usa los contratos canónicos de ciclo, telemetría y evidencia', () => {
  assert.match(bridge, /import '\.\/room-cycle\.js'/);
  assert.match(bridge, /import '\.\/telemetry-contract\.js'/);
  assert.match(bridge, /import '\.\/cycle-evidence\.js'/);
  assert.match(bridge, /SetasRoomCycle/);
  assert.match(bridge, /SetasTelemetry/);
  assert.match(bridge, /buildCycleEvidence/);
});

test('materialización enlaza exclusivamente el lote correcto de Bitácora', () => {
  assert.match(bridge, /readJson\('sdp_bit_lotes'\)\.find\(x => x\.id === batchId\)/);
  assert.match(bridge, /readJson\('sdp_bit_bolsas'\)\.filter\(x => x\.loteId === batchId\)/);
  assert.match(bridge, /readJson\('sdp_bit_cosechas'\)\.filter\(x => x\.loteId === batchId\)/);
  assert.match(bridge, /if \(!cycle\.batchIds\.includes\(batchId\)\)/);
});

test('CycleEvidence queda local y se sincroniza a Firestore con identidad estable', () => {
  assert.match(bridge, /sdp_cycle_evidence_v1/);
  assert.match(bridge, /const evidenceKey = x => `\$\{x\.sourceId\}__\$\{x\.batchId\}`/);
  assert.match(bridge, /SetasDB\?\.guardarCycleEvidence/);
});

test('Perito recibe historicalEvidence como contexto y resultado explicable', () => {
  assert.match(bridge, /historicalEvidence: historicalEvidenceFor/);
  assert.match(bridge, /context: \{ \.\.\.\(options\?\.context \|\| \{\}\), \.\.\.learned \}/);
  assert.match(bridge, /result\.historicalEvidence = learned\.historicalEvidence/);
  assert.match(bridge, /result\.productionLearning = learned\.productionLearning/);
  assert.doesNotMatch(bridge, /SetasScoring|scoreRecipe|historyCalibration/);
});

test('bridge no importa ni reemplaza el motor fuente ni scoring', () => {
  assert.doesNotMatch(bridge, /import '\.\/scoring\.js'/);
  assert.doesNotMatch(bridge, /import '\.\/perito-scenarios\.js'/);
  assert.match(bridge, /const original = engine\.searchScenarios\.bind\(engine\)/);
});
