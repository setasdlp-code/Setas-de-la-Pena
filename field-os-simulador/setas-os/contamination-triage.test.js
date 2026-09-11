'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const contamination = require('./contamination-workflow.js');
const workflow = require('./setas-os-workflow.js');

test('Catálogo de patógenos contiene los 5 fitopatógenos fungícolas canónicos con protocolos', () => {
  const catalog = contamination.PATHOGENS_CATALOG;
  assert.ok(catalog.trichoderma, 'Trichoderma debe estar presente');
  assert.ok(catalog.neurospora, 'Neurospora debe estar presente');
  assert.ok(catalog.cobweb, 'Dactylium/Cobweb debe estar presente');
  assert.ok(catalog.bacillus, 'Bacillus debe estar presente');
  assert.ok(catalog.mycogone, 'Mycogone debe estar presente');

  assert.equal(catalog.trichoderma.dangerLevel, 'critical');
  assert.ok(catalog.trichoderma.biosecurityProtocol.some(p => p.includes('FAE')));
  assert.ok(catalog.cobweb.biosecurityProtocol.some(p => p.toLowerCase().includes('sal') || p.toLowerCase().includes('salting')));
  assert.ok(catalog.bacillus.biosecurityProtocol.some(p => p.includes('12 horas')));
});

test('calculateContaminationLoss calcula porcentajes, bolsas sanas y costos COP con precisión', () => {
  // Lote de 20 bolsas, costo 4.000 COP por bolsa
  const batch = {
    id: 'LOT-TEST-01',
    numBolsas: 20,
    costoBolsa: 4000
  };

  // 1. Pérdida leve (1 bolsa de 20 = 5%)
  const loss1 = contamination.calculateContaminationLoss({
    batch,
    affectedBags: 1,
    totalBags: 20
  });
  assert.equal(loss1.affectedBags, 1);
  assert.equal(loss1.totalBags, 20);
  assert.equal(loss1.healthyBags, 19);
  assert.equal(loss1.lossPct, 5);
  assert.equal(loss1.lossCostCop, 4000);
  assert.equal(loss1.suggestedAction, 'isolate_bags');
  assert.equal(loss1.severity, 'warning');

  // 2. Pérdida moderada (5 bolsas de 20 = 25%) -> Sugiere cuarentena
  const loss2 = contamination.calculateContaminationLoss({
    batch,
    affectedBags: 5,
    totalBags: 20
  });
  assert.equal(loss2.lossPct, 25);
  assert.equal(loss2.lossCostCop, 20000);
  assert.equal(loss2.suggestedAction, 'quarantine');
  assert.equal(loss2.severity, 'critical');

  // 3. Pérdida crítica masiva (12 bolsas de 20 = 60%) -> Sugiere descarte
  const loss3 = contamination.calculateContaminationLoss({
    batch,
    affectedBags: 12,
    totalBags: 20
  });
  assert.equal(loss3.lossPct, 60);
  assert.equal(loss3.lossCostCop, 48000);
  assert.equal(loss3.suggestedAction, 'discard');
  assert.equal(loss3.severity, 'critical');
});

test('calculateContaminationLoss utiliza costoIngKg y pesoHumedo cuando no hay costoBolsa explícito', () => {
  const batch = {
    id: 'LOT-TEST-02',
    numBolsas: 10,
    costoIngKg: 2000,
    pesoHumedo: 2.5 // 2.5 kg * 2.000 $/kg = 5.000 $/bolsa
  };

  const loss = contamination.calculateContaminationLoss({
    batch,
    affectedBags: 2,
    totalBags: 10
  });
  assert.equal(loss.unitCostCop, 5000);
  assert.equal(loss.lossCostCop, 10000);
  assert.equal(loss.lossPct, 20);
});

test('determineTargetLifecycleState mapea decisiones operativas a la máquina de estados canónica', () => {
  // Lote en incubación
  assert.equal(contamination.determineTargetLifecycleState('incubation', 'isolate_bags', 10), 'incubation');
  assert.equal(contamination.determineTargetLifecycleState('incubation', 'quarantine', 10), 'quarantine');
  assert.equal(contamination.determineTargetLifecycleState('incubation', 'isolate_bags', 30), 'incubation'); // forzado mantener
  assert.equal(contamination.determineTargetLifecycleState('incubation', 'quarantine', 25), 'quarantine');
  assert.equal(contamination.determineTargetLifecycleState('incubation', 'discard', 20), 'discarded');
  assert.equal(contamination.determineTargetLifecycleState('incubation', 'quarantine', 55), 'discarded'); // >50% es descarte

  // Lote en fructificación
  assert.equal(contamination.determineTargetLifecycleState('fruiting', 'quarantine', 20), 'quarantine');
  assert.equal(contamination.determineTargetLifecycleState('fruiting', 'discard', 10), 'discarded');

  // Integración con setas-os-workflow.js
  assert.ok(workflow.canTransition('incubation', 'quarantine'));
  assert.ok(workflow.canTransition('fruiting', 'quarantine'));
  assert.ok(workflow.canTransition('quarantine', 'discarded'));
});

test('buildContaminationEvent construye un evento inmutable con esquema y trazabilidad completa', () => {
  const event = contamination.buildContaminationEvent({
    batchId: 'SDP-260909-OST-R01',
    pathogenKey: 'trichoderma',
    affectedBags: 3,
    totalBags: 12,
    location: 'Estantería B · Nivel 2 · Martha Tent 01',
    decision: 'quarantine',
    operatorId: 'operador-tenjo',
    notes: 'Esporulación verde detectada en tercio superior de las bolsas',
    lossCostCop: 10500,
    at: '2026-09-09T23:00:00.000Z'
  });

  assert.equal(event.type, 'contamination_incident');
  assert.equal(event.batchId, 'SDP-260909-OST-R01');
  assert.equal(event.pathogenId, 'trichoderma');
  assert.equal(event.pathogenName, 'Moho Verde');
  assert.equal(event.dangerLevel, 'critical');
  assert.equal(event.affectedBags, 3);
  assert.equal(event.totalBags, 12);
  assert.equal(event.lossPct, 25);
  assert.equal(event.lossCostCop, 10500);
  assert.equal(event.decision, 'quarantine');
  assert.equal(event.operatorId, 'operador-tenjo');
  assert.equal(event.at, '2026-09-09T23:00:00.000Z');
  assert.ok(Object.isFrozen(event));
});

test('auth-gate.js registra contamination-workflow.js en DC_RUNTIME_SCRIPTS', () => {
  const authGate = fs.readFileSync(path.join(__dirname, 'firebase/auth-gate.js'), 'utf8');
  assert.match(authGate, /"\.\.\/contamination-workflow\.js"/);
});

test('simulador-app.jsx y simulador-app.js integran el modal de triaje y estados de cuarentena', () => {
  const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, 'simulador-app.js'), 'utf8');

  // Integración de estado y modal
  assert.match(jsx, /data-testid="biosecurity-triage-modal"/);
  assert.match(jsx, /openContaminationTriage/);
  assert.match(jsx, /cuarentena:\s*'quarantine'/);
  assert.match(jsx, /quarantine:\s*'Cuarentena'/);
  assert.match(jsx, /🛡️ Triaje de Bioseguridad & Cuarentena/);
  assert.match(jsx, /showTriageModal/);

  // Bundle compilado sincronizado
  assert.match(js, /biosecurity-triage-modal/);
  assert.match(js, /openContaminationTriage/);
  assert.match(js, /cuarentena/);
});

test('sim.css contiene clases de estilo de bioseguridad FOS v2', () => {
  const css = fs.readFileSync(path.join(__dirname, 'sim.css'), 'utf8');
  assert.match(css, /\.sim-root \.biosecurity-triage-modal/);
  assert.match(css, /\.sim-root \.triage-pathogen-grid/);
  assert.match(css, /\.sim-root \.triage-impact-grid/);
  assert.match(css, /\.sim-root \.triage-protocol-banner/);
  assert.match(css, /\.sim-root \.triage-decision-option/);
});

test('TodayV2 prioriza lotes en cuarentena como críticos y bloqueados', () => {
  const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  assert.match(jsx, /isQuarantine=lote\.estado==='cuarentena'\|\|lote\.lifecycleState==='quarantine'/);
  assert.match(jsx, /Lote en Cuarentena · Revisión Fitosanitaria/);
});
