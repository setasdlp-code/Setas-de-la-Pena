'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SetasOSWorkflow = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const NORMAL_STATES = Object.freeze([
    'planned',
    'mix_prepared',
    'thermal_treatment',
    'cooling',
    'inoculated',
    'incubation',
    'maturation',
    'induction',
    'fruiting',
    'resting',
    'closed',
  ]);

  const EXCEPTION_STATES = Object.freeze(['quarantine', 'discarded', 'failed']);
  const TERMINAL_STATES = new Set(['closed', 'discarded', 'failed']);

  const DEFAULT_TRANSITIONS = Object.freeze({
    planned: ['mix_prepared', 'discarded'],
    mix_prepared: ['thermal_treatment', 'discarded'],
    thermal_treatment: ['cooling', 'failed'],
    cooling: ['inoculated', 'failed'],
    inoculated: ['incubation', 'quarantine', 'failed'],
    incubation: ['maturation', 'induction', 'fruiting', 'quarantine', 'failed'],
    maturation: ['induction', 'fruiting', 'quarantine', 'failed'],
    induction: ['fruiting', 'quarantine', 'failed'],
    fruiting: ['resting', 'closed', 'quarantine', 'failed'],
    resting: ['fruiting', 'closed', 'quarantine', 'failed'],
    quarantine: ['incubation', 'maturation', 'induction', 'fruiting', 'discarded', 'failed'],
    closed: [],
    discarded: [],
    failed: [],
  });

  const ACTIONS_BY_STATE = Object.freeze({
    planned: ['prepare_mix', 'note', 'discard'],
    mix_prepared: ['start_thermal_treatment', 'note', 'discard'],
    thermal_treatment: ['complete_thermal_treatment', 'note', 'report_problem'],
    cooling: ['inoculate', 'note', 'report_problem'],
    inoculated: ['move', 'inspection', 'contamination', 'note'],
    incubation: ['inspection', 'move', 'contamination', 'note', 'advance_stage'],
    maturation: ['inspection', 'move', 'contamination', 'note', 'advance_stage'],
    induction: ['inspection', 'move', 'contamination', 'note', 'advance_stage'],
    fruiting: ['inspection', 'harvest', 'move', 'contamination', 'note', 'advance_stage'],
    resting: ['inspection', 'move', 'contamination', 'note', 'advance_stage'],
    quarantine: ['inspection', 'contamination', 'note', 'discard', 'advance_stage'],
    closed: ['note'],
    discarded: ['note'],
    failed: ['note'],
  });

  const PRIORITY_WEIGHT = Object.freeze({ critical: 0, overdue: 1, now: 2, blocked: 3, later: 4, context: 5 });

  function isKnownState(state) {
    return NORMAL_STATES.includes(state) || EXCEPTION_STATES.includes(state);
  }

  function canTransition(from, to, transitions = DEFAULT_TRANSITIONS) {
    if (!isKnownState(from) || !isKnownState(to)) return false;
    return Array.isArray(transitions[from]) && transitions[from].includes(to);
  }

  function assertTransition(from, to, transitions = DEFAULT_TRANSITIONS) {
    if (!canTransition(from, to, transitions)) {
      throw new Error(`Invalid Setas OS batch transition: ${from} -> ${to}`);
    }
    return true;
  }

  function validActions(state, role = 'operario') {
    const actions = ACTIONS_BY_STATE[state] || [];
    if (role === 'direccion') return [...actions];
    if (role === 'produccion') return [...actions];
    return actions.filter(action => !['discard'].includes(action));
  }

  function transitionEvent({ batchId, from, to, operatorId, at, reason = null, metadata = {} }) {
    assertTransition(from, to);
    if (!batchId) throw new Error('batchId is required');
    if (!operatorId) throw new Error('operatorId is required');
    return Object.freeze({
      type: 'batch_state_transition',
      batchId,
      from,
      to,
      operatorId,
      at: at || new Date().toISOString(),
      reason,
      metadata: { ...metadata },
    });
  }

  function classifyTodayItem(item, nowMs = Date.now()) {
    if (item.severity === 'critical') return 'critical';
    if (item.blocked) return 'blocked';
    const dueMs = item.dueAt ? Date.parse(item.dueAt) : NaN;
    if (Number.isFinite(dueMs)) {
      if (dueMs < nowMs) return 'overdue';
      if (dueMs - nowMs <= 60 * 60 * 1000) return 'now';
      return 'later';
    }
    return 'context';
  }

  function buildTodayQueue(items, nowMs = Date.now()) {
    return (items || [])
      .map((item, index) => ({ ...item, bucket: classifyTodayItem(item, nowMs), __index: index }))
      .sort((a, b) => {
        const pa = PRIORITY_WEIGHT[a.bucket] ?? 99;
        const pb = PRIORITY_WEIGHT[b.bucket] ?? 99;
        if (pa !== pb) return pa - pb;
        const ad = a.dueAt ? Date.parse(a.dueAt) : Infinity;
        const bd = b.dueAt ? Date.parse(b.dueAt) : Infinity;
        if (ad !== bd) return ad - bd;
        return a.__index - b.__index;
      })
      .map(({ __index, ...item }) => item);
  }

  function provenance(kind, detail = {}) {
    const allowed = new Set(['measured', 'calculated', 'estimated', 'target', 'manual', 'simulated']);
    if (!allowed.has(kind)) throw new Error(`Unknown provenance kind: ${kind}`);
    return Object.freeze({ kind, ...detail });
  }

  return Object.freeze({
    NORMAL_STATES,
    EXCEPTION_STATES,
    DEFAULT_TRANSITIONS,
    ACTIONS_BY_STATE,
    isKnownState,
    canTransition,
    assertTransition,
    validActions,
    transitionEvent,
    classifyTodayItem,
    buildTodayQueue,
    provenance,
    isTerminalState: state => TERMINAL_STATES.has(state),
  });
});
