'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const sweepJournal = require('./sweep-journal.js');

test('SetasSweepJournal: exports expected methods and constants', () => {
  assert.equal(typeof sweepJournal.createSweepEntry, 'function');
  assert.equal(typeof sweepJournal.applySweepOperation, 'function');
  assert.ok(Array.isArray(sweepJournal.VALID_REGRESSION_REASONS));
  assert.ok(Array.isArray(sweepJournal.VALID_RISK_TYPES));
});

test('createSweepEntry creates normalized queue entries with expectedRevision', () => {
  const bag = { id: 'bag-1', codigo: 'OST-01-B01', loteId: 'LOTE_1', estado: 'sana', colonizacion: 40, revision: 2 };
  const entry = sweepJournal.createSweepEntry(bag, { scannedAt: 123456789 });
  assert.deepEqual(entry, {
    bagId: 'bag-1',
    codigo: 'OST-01-B01',
    loteId: 'LOTE_1',
    estado: 'sana',
    colonizacion: 40,
    col100: null,
    expectedRevision: 2,
    scannedAt: 123456789,
  });
});

test('applySweepOperation: applies 100% colonization and sets col100 date if not present', () => {
  const bags = [
    { id: 'b1', codigo: 'B-01', estado: 'sana', colonizacion: 50, revision: 1 },
    { id: 'b2', codigo: 'B-02', estado: 'sana', colonizacion: 75, revision: 1 },
  ];
  const queue = [
    sweepJournal.createSweepEntry(bags[0]),
    sweepJournal.createSweepEntry(bags[1]),
  ];

  const now = new Date('2026-09-15T12:00:00Z').getTime();
  const res = sweepJournal.applySweepOperation({
    allBolsas: bags,
    sweepQueue: queue,
    targetColonizacion: 100,
    now,
  });

  assert.equal(res.status, 'applied');
  assert.equal(res.totalScanned, 2);
  assert.equal(res.totalUpdated, 2);

  const b1After = res.updatedBolsas.find(b => b.id === 'b1');
  assert.equal(b1After.colonizacion, 100);
  assert.equal(b1After.col100, '2026-09-15');
  assert.equal(b1After.revision, 2);
  assert.ok(b1After.sweepOpRef.startsWith('SWEEP_'));

  const b2After = res.updatedBolsas.find(b => b.id === 'b2');
  assert.equal(b2After.colonizacion, 100);
  assert.equal(b2After.col100, '2026-09-15');
});

test('applySweepOperation: preserves historical col100 date if already set', () => {
  const bags = [
    { id: 'b1', codigo: 'B-01', estado: 'sana', colonizacion: 100, col100: '2026-08-20', revision: 3 },
  ];
  const queue = [sweepJournal.createSweepEntry(bags[0])];

  const now = new Date('2026-09-15T12:00:00Z').getTime();
  const res = sweepJournal.applySweepOperation({
    allBolsas: bags,
    sweepQueue: queue,
    targetColonizacion: 100,
    now,
  });

  assert.equal(res.status, 'applied');
  const b1After = res.updatedBolsas.find(b => b.id === 'b1');
  assert.equal(b1After.col100, '2026-08-20'); // Preserved!
});

test('applySweepOperation: protects contaminated bags from being overwritten as sana or 100%', () => {
  const bags = [
    { id: 'b1', codigo: 'B-01', estado: 'sana', colonizacion: 50, revision: 1 },
    { id: 'b2_contam', codigo: 'B-02', estado: 'contaminada', colonizacion: 20, revision: 1 },
  ];
  const queue = [
    sweepJournal.createSweepEntry(bags[0]),
    sweepJournal.createSweepEntry(bags[1]),
  ];

  const res = sweepJournal.applySweepOperation({
    allBolsas: bags,
    sweepQueue: queue,
    targetColonizacion: 100,
  });

  assert.equal(res.status, 'partial');
  assert.equal(res.totalScanned, 2);
  assert.equal(res.totalUpdated, 1);

  const rej = res.results.find(r => r.bagId === 'b2_contam');
  assert.equal(rej.updated, false);
  assert.equal(rej.reason, 'contaminated_bag_protected');

  const b2After = res.updatedBolsas.find(b => b.id === 'b2_contam');
  assert.equal(b2After.estado, 'contaminada');
  assert.equal(b2After.colonizacion, 20);
});

test('applySweepOperation: rejects revision conflict under optimistic concurrency', () => {
  const bag = { id: 'b1', codigo: 'B-01', estado: 'sana', colonizacion: 50, revision: 5 };
  // Queue was created with expectedRevision: 4 (stale)
  const entry = { ...sweepJournal.createSweepEntry(bag), expectedRevision: 4 };

  const res = sweepJournal.applySweepOperation({
    allBolsas: [bag],
    sweepQueue: [entry],
    targetColonizacion: 100,
  });

  assert.equal(res.status, 'failed');
  assert.equal(res.totalUpdated, 0);
  assert.equal(res.results[0].updated, false);
  assert.equal(res.results[0].reason, 'revision_conflict');
  assert.equal(res.results[0].expectedRevision, 4);
  assert.equal(res.results[0].actualRevision, 5);
});

test('applySweepOperation: enforces non-regression unless structured reason is provided', () => {
  const bag = { id: 'b1', codigo: 'B-01', estado: 'sana', colonizacion: 80, revision: 1 };
  const queue = [sweepJournal.createSweepEntry(bag)];

  // 1. Without structured reason -> rejected
  const resFail = sweepJournal.applySweepOperation({
    allBolsas: [bag],
    sweepQueue: queue,
    targetColonizacion: 40,
  });
  assert.equal(resFail.status, 'failed');
  assert.equal(resFail.results[0].reason, 'regression_requires_structured_reason');

  // 2. With valid structured reason -> accepted
  const resOk = sweepJournal.applySweepOperation({
    allBolsas: [bag],
    sweepQueue: queue,
    targetColonizacion: 40,
    structuredReason: 'damage_observed',
  });
  assert.equal(resOk.status, 'applied');
  assert.equal(resOk.totalUpdated, 1);
  const updated = resOk.updatedBolsas.find(b => b.id === 'b1');
  assert.equal(updated.colonizacion, 40);
  assert.equal(updated.sweepReason, 'damage_observed');
});

test('applySweepOperation: records risk observation without mutating formal estado', () => {
  const bag = { id: 'b1', codigo: 'B-01', estado: 'sana', colonizacion: 60, revision: 2 };
  const queue = [sweepJournal.createSweepEntry(bag)];

  const res = sweepJournal.applySweepOperation({
    allBolsas: [bag],
    sweepQueue: queue,
    isRiskObservation: true,
    riskType: 'micelio_debil',
    riskNota: 'Crecimiento lento en tercio inferior',
    operationId: 'OP_RISK_123',
  });

  assert.equal(res.status, 'applied');
  const b1 = res.updatedBolsas.find(b => b.id === 'b1');
  assert.equal(b1.estado, 'sana'); // Not mutated to cuarentena!
  assert.equal(b1.riskObsRef, 'OP_RISK_123');
  assert.equal(b1.riskType, 'micelio_debil');
  assert.equal(b1.riskNota, 'Crecimiento lento en tercio inferior');
  assert.equal(b1.revision, 3);
});
