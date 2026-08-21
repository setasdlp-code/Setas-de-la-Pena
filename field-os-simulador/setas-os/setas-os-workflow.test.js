'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const workflow = require('./setas-os-workflow.js');

test('batch lifecycle exposes the canonical normal and exception vocabulary', () => {
  assert.deepEqual(workflow.NORMAL_STATES, [
    'planned','mix_prepared','thermal_treatment','cooling','inoculated',
    'incubation','maturation','induction','fruiting','resting','closed',
  ]);
  assert.deepEqual(workflow.EXCEPTION_STATES, ['quarantine','discarded','failed']);
});

test('state transitions reject impossible jumps', () => {
  assert.equal(workflow.canTransition('incubation', 'fruiting'), true);
  assert.equal(workflow.canTransition('planned', 'fruiting'), false);
  assert.throws(() => workflow.assertTransition('planned', 'fruiting'), /Invalid Setas OS batch transition/);
});

test('every state transition creates a traceable event', () => {
  const event = workflow.transitionEvent({
    batchId: 'SHI-260820-03',
    from: 'incubation',
    to: 'maturation',
    operatorId: 'op-1',
    at: '2026-08-20T22:00:00-05:00',
  });
  assert.equal(event.type, 'batch_state_transition');
  assert.equal(event.batchId, 'SHI-260820-03');
  assert.equal(event.operatorId, 'op-1');
  assert.equal(event.from, 'incubation');
  assert.equal(event.to, 'maturation');
});

test('field actions are derived from lifecycle state', () => {
  assert.ok(workflow.validActions('fruiting', 'operario').includes('harvest'));
  assert.ok(workflow.validActions('incubation', 'operario').includes('inspection'));
  assert.equal(workflow.validActions('incubation', 'operario').includes('harvest'), false);
  assert.equal(workflow.validActions('planned', 'operario').includes('discard'), false);
  assert.equal(workflow.validActions('planned', 'produccion').includes('discard'), true);
});

test('Hoy orders critical, overdue, now, blocked, later and context work', () => {
  const now = Date.parse('2026-08-20T12:00:00Z');
  const queue = workflow.buildTodayQueue([
    { id: 'later', dueAt: '2026-08-20T18:00:00Z' },
    { id: 'context' },
    { id: 'blocked', blocked: true },
    { id: 'overdue', dueAt: '2026-08-20T10:00:00Z' },
    { id: 'now', dueAt: '2026-08-20T12:30:00Z' },
    { id: 'critical', severity: 'critical' },
  ], now);
  assert.deepEqual(queue.map(item => item.id), ['critical','overdue','now','blocked','later','context']);
});

test('provenance accepts only the canonical data-origin vocabulary', () => {
  assert.deepEqual(workflow.provenance('measured', { sensor: 'SHT45' }), { kind: 'measured', sensor: 'SHT45' });
  assert.throws(() => workflow.provenance('guessed'), /Unknown provenance kind/);
});
