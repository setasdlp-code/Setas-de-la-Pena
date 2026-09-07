'use strict';

/**
 * @file field-action-sheet.js — Modelo de vista y confirmación de transiciones de campo.
 *
 * Módulo puro: buildActionSheetModel no realiza I/O, no consulta IndexedDB ni
 * captura fechas en su forma de retorno. La persistencia ocurre únicamente en
 * confirmTransition bajo confirmación explícita del operario.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const getModel = () => (isNode ? require('./field-events-model.js') : (typeof globalThis !== 'undefined' ? globalThis.SetasFieldEvents : null));
  const getQueue = () => (isNode ? require('./field-event-queue.js') : (typeof globalThis !== 'undefined' ? globalThis.SetasFieldEventQueue : null));
  const getWorkflow = () => (isNode ? require('./setas-os-workflow.js') : (typeof globalThis !== 'undefined' ? globalThis.SetasOSWorkflow : null));
  const getContracts = () => (isNode ? require('./field-event-contracts.js') : (typeof globalThis !== 'undefined' ? globalThis.SetasFieldEventContracts : null));

  // Fuente única compartida de estado inicial (definida en field-event-contracts.js):
  // los lotes creados antes del cuaderno de campo no llevan workflowState y
  // su jornada operativa arranca autoritativamente en Inoculación.
  const DEFAULT_INITIAL_STATE = (getContracts() && getContracts().DEFAULT_INITIAL_STATE) || 'inoculated';

  const STATE_LABELS = Object.freeze({
    planned: 'Planificado',
    mix_prepared: 'Mezcla preparada',
    thermal_treatment: 'Tratamiento térmico',
    cooling: 'Enfriamiento',
    inoculated: 'Inoculación',
    incubation: 'Incubación',
    maturation: 'Maduración',
    induction: 'Inducción',
    fruiting: 'Fructificación',
    resting: 'Descanso',
    closed: 'Cerrado',
    quarantine: 'Cuarentena',
    discarded: 'Descartado',
    failed: 'Fallido',
  });

  const STATUS_LABELS = Object.freeze({
    idle: 'Listo para registrar',
    saved_local: 'Guardado en este equipo',
    sending: 'Enviando al servidor...',
    confirmed: 'Confirmado por el servidor',
    conflict: 'Conflicto de revisión',
    rejected: 'Rechazado por el servidor',
  });

  const resolveTransitionClass = (to) => {
    try {
      const m = getModel();
      if (m && typeof m.transitionClass === 'function') {
        return m.transitionClass(to);
      }
    } catch (_) {}
    if (to === 'discarded') return 'discard';
    if (to === 'quarantine' || to === 'failed') return 'exception';
    return 'advance';
  };

  /**
   * Construye el modelo de vista puro para la hoja de acción.
   *
   * @param {object} params
   * @param {object} [params.batch]
   * @param {string} [params.batchId]
   * @param {string} [params.state]
   * @param {string[]} [params.allowedTransitions]
   * @param {string} [params.operatorRole]
   * @param {object} [params.queueEntry]
   * @param {boolean} [params.inFlight]
   */
  const buildActionSheetModel = ({
    batch = null,
    batchId = null,
    state = null,
    allowedTransitions = null,
    operatorRole = 'operario',
    queueEntry = null,
    inFlight = false,
    simulated = false,
  } = {}) => {
    const resolvedBatchId = batchId || batch?.id || batch?.codigo || '';

    // Resolver estado: el servidor (accept-field-event.js) lee workflowState o
    // asume DEFAULT_INITIAL_STATE ('inoculated'). Nunca lee 'estado' para evitar
    // divergencias entre cliente y servidor.
    const resolvedState = state || batch?.workflowState || batch?.state || DEFAULT_INITIAL_STATE;

    const title = resolvedBatchId
      ? `Lote ${batch?.codigo || resolvedBatchId}`
      : 'Lote';

    const subtitle = batch?.especie
      ? batch.especie
      : (resolvedState ? `Estado actual: ${STATE_LABELS[resolvedState] || resolvedState}` : '');

    // Calcular transiciones permitidas si no se suministran explícitamente
    let transitions = allowedTransitions;
    if (!Array.isArray(transitions)) {
      try {
        const wf = getWorkflow();
        const m = getModel();
        const candidates = (resolvedState && wf?.DEFAULT_TRANSITIONS?.[resolvedState]) || [];
        const permitted = (m && m.ROLE_PERMISSIONS?.[operatorRole]) || ['advance'];
        transitions = candidates.filter(to => permitted.includes(m ? m.transitionClass(to) : resolveTransitionClass(to)));
      } catch (_) {
        transitions = [];
      }
    }

    const options = transitions.map(to => ({
      to,
      label: STATE_LABELS[to] || to,
      transitionClass: resolveTransitionClass(to),
    }));

    // El estado deriva EXCLUSIVAMENTE de queueEntry e inFlight, jamás de escrituras optimistas.
    let status = 'idle';
    if (inFlight === true) {
      status = 'sending';
    } else if (queueEntry) {
      const qStatus = queueEntry.status;
      if (qStatus === 'pending' || qStatus === 'retry_wait') {
        status = 'saved_local';
      } else if (qStatus === 'confirmed') {
        status = 'confirmed';
      } else if (qStatus === 'conflict') {
        status = 'conflict';
      } else if (qStatus === 'rejected') {
        status = 'rejected';
      }
    }

    // Un recibo simulado nunca debe leerse como confirmación del servidor: el
    // valor entero del cuaderno es que "confirmado" signifique que el servidor
    // lo tiene, y un prototipo que mienta sobre eso enseña a desconfiar del
    // estado que sí es real.
    const statusLabel = (status === 'confirmed' && simulated)
      ? 'Confirmado (simulado — sin servidor)'
      : (STATUS_LABELS[status] || status);
    const canConfirm = status === 'idle' && options.length > 0;
    const canRefresh = status === 'conflict';

    return {
      title,
      subtitle,
      state: resolvedState,
      options,
      status,
      statusLabel,
      simulated: Boolean(simulated) && status === 'confirmed',
      canConfirm,
      canRefresh,
    };
  };

  /**
   * Persiste una transición tras confirmación explícita del operario.
   */
  const confirmTransition = async ({
    db,
    batch,
    from,
    to,
    accountId,
    operatorId,
    operatorRole = 'operario',
    expectedBatchRevision = null,
    confirmed = false,
  }) => {
    if (confirmed !== true) {
      throw new Error('operator_confirmation_required');
    }

    const model = getModel();
    if (!model) {
      throw new Error('field_events_model_unavailable: field-events-model.js aún no se ha cargado');
    }
    const queue = getQueue();
    if (!queue) {
      throw new Error('field_event_queue_unavailable: field-event-queue.js aún no se ha cargado');
    }

    // Asegurar que el lote tiene una propiedad state consistente para validateTransition
    const batchWithState = batch ? {
      ...batch,
      state: batch.state || batch.workflowState || DEFAULT_INITIAL_STATE,
    } : null;

    // Validar transición contra la máquina de estados y el rol antes de tocar la base de datos
    model.validateTransition(batchWithState, from, to, operatorRole);

    const batchId = batch.id || batch.codigo || batch.batchId;
    const occurredAt = new Date().toISOString();

    // Si expectedBatchRevision no es entero, inferir de batch.revision o defaultear a 0
    const revision = Number.isInteger(expectedBatchRevision)
      ? expectedBatchRevision
      : (Number.isInteger(batch?.revision) ? batch.revision : 0);

    const event = model.createFieldEvent(
      batchId,
      from,
      to,
      operatorId,
      occurredAt,
      revision
    );

    const queueEntry = {
      eventId: event.id,
      accountId,
      status: 'pending',
      attempts: 0,
      enqueuedAt: occurredAt,
    };

    await queue.persistFieldEvent(db, event, queueEntry, accountId);

    return { event, queueEntry };
  };

  const api = {
    DEFAULT_INITIAL_STATE,
    STATE_LABELS,
    STATUS_LABELS,
    buildActionSheetModel,
    confirmTransition,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldActionSheet = api;
})();
