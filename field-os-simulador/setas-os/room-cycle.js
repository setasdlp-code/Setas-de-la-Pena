'use strict';
// SETAS OS — RoomCycle: une sala, etapa biológica, lotes y ventana temporal.
// Es lógica pura deliberadamente separada de React/Firebase para poder validarla
// antes de persistir o usarla para asociar telemetría.
(function () {
  const VALID_STAGES = new Set([
    'cooling', 'incubation', 'maturation', 'induction', 'fruiting', 'resting', 'quarantine'
  ]);
  const VALID_STATES = new Set(['planned', 'active', 'closed', 'cancelled']);

  const parseTime = (value) => {
    if (!value) return null;
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
  };

  const numericOrNull = (value) => {
    if (value == null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const normalizeBand = (band) => {
    if (!band || typeof band !== 'object') return null;
    return {
      min: numericOrNull(band.min),
      max: numericOrNull(band.max),
      target: numericOrNull(band.target),
    };
  };

  const normalizeRoomCycle = (input = {}) => ({
    schema: 'setas.room-cycle.v1',
    id: String(input.id || '').trim(),
    roomId: String(input.roomId || '').trim(),
    speciesId: String(input.speciesId || '').trim(),
    batchIds: [...new Set((input.batchIds || []).map(String).map(x => x.trim()).filter(Boolean))],
    stage: input.stage || null,
    state: input.state || 'planned',
    startAt: input.startAt || null,
    endAt: input.endAt || null,
    targets: Object.fromEntries(
      Object.entries(input.targets || {}).map(([metric, band]) => [metric, normalizeBand(band)])
    ),
    recipeVersionIds: [...new Set((input.recipeVersionIds || []).map(String).filter(Boolean))],
    notes: input.notes || null,
    provenance: input.provenance || { type: 'manual' },
  });

  const validateRoomCycle = (input = {}) => {
    const cycle = normalizeRoomCycle(input);
    const errors = [];
    if (!cycle.id) errors.push('missing id');
    if (!cycle.roomId) errors.push('missing roomId');
    if (!cycle.speciesId) errors.push('missing speciesId');
    if (!cycle.batchIds.length) errors.push('at least one batchId is required');
    if (!VALID_STAGES.has(cycle.stage)) errors.push(`invalid stage: ${cycle.stage}`);
    if (!VALID_STATES.has(cycle.state)) errors.push(`invalid state: ${cycle.state}`);

    const start = parseTime(cycle.startAt);
    const end = parseTime(cycle.endAt);
    if (start == null) errors.push('invalid startAt');
    if (cycle.endAt && end == null) errors.push('invalid endAt');
    if (start != null && end != null && end < start) errors.push('endAt precedes startAt');
    if (cycle.state === 'closed' && end == null) errors.push('closed cycle requires endAt');

    for (const [metric, band] of Object.entries(cycle.targets)) {
      if (!band) {
        errors.push(`${metric}: invalid target band`);
        continue;
      }
      if (band.min != null && band.max != null && band.min > band.max) errors.push(`${metric}: min exceeds max`);
      if (band.target != null && band.min != null && band.target < band.min) errors.push(`${metric}: target below min`);
      if (band.target != null && band.max != null && band.target > band.max) errors.push(`${metric}: target above max`);
    }
    return errors;
  };

  const isActiveAt = (cycle, at) => {
    const start = parseTime(cycle?.startAt);
    const end = parseTime(cycle?.endAt);
    const t = parseTime(at);
    if (start == null || t == null || t < start) return false;
    return end == null || t <= end;
  };

  const containsBatch = (cycle, batchId) => (cycle?.batchIds || []).includes(batchId);

  const api = { VALID_STAGES, VALID_STATES, normalizeRoomCycle, validateRoomCycle, isActiveAt, containsBatch };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasRoomCycle = api;
})();
