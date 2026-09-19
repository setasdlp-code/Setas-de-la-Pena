'use strict';

/**
 * @file task-engine.js — Motor de tareas de Setas OS.
 *
 * La cola de "Hoy" no debe derivarse al vuelo de los lotes: eso obliga a
 * reimplementar en cada pantalla la pregunta "¿qué toca ahora?". Este módulo
 * hace de la Tarea un objeto de primera clase, persistible, con una forma
 * canónica única, y separa tres responsabilidades que antes se mezclaban:
 *
 *   1. generar tareas (por SOP al transicionar de estado, o por followUps
 *      que otro módulo como batch-sheet.js decide que hacen falta),
 *   2. fusionarlas con lo que ya existe sin duplicar ni reabrir lo cerrado,
 *   3. proyectar las tareas 'pending' a la cola de Hoy, delegando el
 *      bucketing y el orden a setas-os-workflow.js (no se reimplementa aquí).
 *
 * Es lógica pura (mismo patrón UMD que batch-sheet.js / setas-os-workflow.js):
 * no toca React, ni red, ni DOM, y se prueba con `node --test task-engine.test.js`.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // Igual que en batch-sheet.js: la dependencia se resuelve en cada llamada,
  // no al cargar el módulo, porque en el navegador el orden de carga entre
  // listas de <script> no está garantizado.
  const workflowRef = () => (isNode ? require('./setas-os-workflow.js') : (glob && glob.SetasOSWorkflow) || null);

  const TASK_TYPES = Object.freeze([
    'inspection',
    'colonization_check',
    'move',
    'harvest',
    'reinspection',
    'cleaning',
    'unblock',
    'advance_stage',
  ]);

  const OBJECT_TYPES = Object.freeze(['batch', 'room', 'inventory']);

  const TASK_PRIORITIES = Object.freeze(['critical', 'high', 'normal', 'low']);

  const TASK_STATUSES = Object.freeze(['pending', 'done', 'cancelled']);

  const GENERATED_BY_SOURCES = Object.freeze([
    'sop',
    'state',
    'sensor',
    'incident',
    'operator',
    'perito',
    'schedule',
    'inventory',
  ]);

  // Reglas SOP por estado de destino del ciclo de vida. Los nombres de estado
  // son los canónicos de setas-os-workflow.js (NORMAL_STATES): no se inventan
  // etiquetas locales aquí.
  const SOP_RULES = Object.freeze({
    inoculated: Object.freeze([
      Object.freeze({ type: 'inspection', offsetDays: 7, priority: 'normal', reason: 'Inspección de rutina D+7 tras inoculación' }),
      Object.freeze({ type: 'inspection', offsetDays: 14, priority: 'normal', reason: 'Inspección de rutina D+14 tras inoculación' }),
      Object.freeze({ type: 'colonization_check', offsetDays: 21, priority: 'high', reason: 'Verificación de colonización D+21 tras inoculación' }),
    ]),
    incubation: Object.freeze([
      Object.freeze({ type: 'colonization_check', offsetDays: 7, priority: 'normal', reason: 'Verificación de colonización D+7 en incubación' }),
    ]),
    fruiting: Object.freeze([
      Object.freeze({ type: 'harvest', offsetDays: 3, priority: 'high', reason: 'Cosecha esperada D+3 tras entrar a fructificación' }),
      Object.freeze({ type: 'inspection', offsetDays: 1, priority: 'normal', reason: 'Inspección D+1 tras entrar a fructificación' }),
    ]),
    resting: Object.freeze([
      Object.freeze({ type: 'inspection', offsetDays: 5, priority: 'normal', reason: 'Inspección D+5 en descanso' }),
    ]),
  });

  const DAY_MS = 86400000;

  const isoDay = value => {
    const d = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(d.getTime())) throw new Error('fecha inválida');
    return d.toISOString().slice(0, 10);
  };

  /**
   * Deriva un id determinista para una tarea. Es la base de la idempotencia:
   * generar la misma tarea dos veces (misma transición, mismo followUp) debe
   * producir el mismo id, para que mergeTasks() no la duplique.
   */
  const deriveTaskId = (objectId, type, dueAt) => `${objectId}-${type}-${isoDay(dueAt)}`;

  /**
   * Crea una tarea canónica congelada. Valida la forma completa: tipo,
   * objeto, prioridad conocidos, objectId y dueAt presentes y parseables.
   * Si no se pasa `id`, se deriva de forma determinista de objectId+type+día.
   */
  const createTask = ({
    id = null,
    type,
    objectType,
    objectId,
    dueAt,
    priority = 'normal',
    reason,
    status = 'pending',
    generatedBy = null,
    completedByEventId = null,
  } = {}) => {
    if (!TASK_TYPES.includes(type)) throw new Error(`Tipo de tarea desconocido: ${type}`);
    if (!OBJECT_TYPES.includes(objectType)) throw new Error(`objectType desconocido: ${objectType}`);
    if (!objectId) throw new Error('objectId es requerido para crear una tarea');
    if (!dueAt) throw new Error('dueAt es requerido para crear una tarea');
    if (!Number.isFinite(Date.parse(dueAt))) throw new Error(`dueAt no es una fecha parseable: ${dueAt}`);
    if (!TASK_PRIORITIES.includes(priority)) throw new Error(`priority desconocida: ${priority}`);
    if (!TASK_STATUSES.includes(status)) throw new Error(`status desconocido: ${status}`);
    if (!reason) throw new Error('reason es requerido para crear una tarea (explica por qué aparece ahora)');
    if (generatedBy) {
      if (!GENERATED_BY_SOURCES.includes(generatedBy.source)) {
        throw new Error(`generatedBy.source desconocido: ${generatedBy.source}`);
      }
    }

    const dueAtIso = new Date(dueAt).toISOString();
    return Object.freeze({
      id: id || deriveTaskId(objectId, type, dueAtIso),
      type,
      objectType,
      objectId,
      dueAt: dueAtIso,
      priority,
      reason,
      status,
      generatedBy: generatedBy ? Object.freeze({ ...generatedBy }) : null,
      completedByEventId,
    });
  };

  /**
   * Convierte las reglas SOP del estado de destino de una transición en
   * tareas futuras. Si el estado no tiene reglas registradas, no hay nada
   * que programar: no es un error, es el caso normal para la mayoría de
   * estados del ciclo de vida.
   */
  const tasksFromTransition = ({ batchId, toState, at, nowMs = Date.now() } = {}) => {
    if (!batchId) throw new Error('batchId es requerido');
    const rules = SOP_RULES[toState];
    if (!rules || !rules.length) return [];
    const baseMs = at ? Date.parse(at) : nowMs;
    if (!Number.isFinite(baseMs)) throw new Error(`at no es una fecha parseable: ${at}`);

    return rules.map(rule => createTask({
      type: rule.type,
      objectType: 'batch',
      objectId: batchId,
      dueAt: new Date(baseMs + rule.offsetDays * DAY_MS).toISOString(),
      priority: rule.priority,
      reason: rule.reason,
      generatedBy: { source: 'sop', ref: toState },
    }));
  };

  /**
   * Convierte "intenciones de seguimiento" (followUps) en tareas reales. Es
   * el punto de acoplamiento con batch-sheet.js: ese módulo decide QUÉ hace
   * falta seguir (p.ej. una recontaminación) sin saber nada de Tareas, y este
   * módulo decide CÓMO se convierte eso en una tarea persistible. Ninguno de
   * los dos importa al otro.
   */
  const tasksFromFollowUps = (followUps = [], { objectId, objectType = 'batch', at } = {}) => {
    if (!objectId) throw new Error('objectId es requerido');
    const baseMs = at ? Date.parse(at) : Date.now();
    if (!Number.isFinite(baseMs)) throw new Error(`at no es una fecha parseable: ${at}`);

    return (followUps || []).map(fu => {
      let generatedBy = fu.generatedBy;
      if (generatedBy == null) {
        generatedBy = { source: 'operator', ref: null };
      } else if (
        typeof generatedBy !== 'object' || Array.isArray(generatedBy) ||
        !GENERATED_BY_SOURCES.includes(generatedBy.source)
      ) {
        // Un contrato roto debe avisar: un `generatedBy` con forma inválida no
        // debe llegar a createTask() a fallar de forma opaca ("source desconocido:
        // undefined"), sino explicar aquí qué forma se esperaba.
        throw new Error(
          `followUp.generatedBy inválido: se esperaba un objeto {source, ref} con source en ` +
          `[${GENERATED_BY_SOURCES.join(', ')}]; se recibió ${JSON.stringify(generatedBy)}`
        );
      }
      return createTask({
        type: fu.type,
        objectType,
        objectId,
        dueAt: new Date(baseMs + (fu.offsetDays || 0) * DAY_MS).toISOString(),
        priority: fu.priority || 'normal',
        reason: fu.reason,
        generatedBy,
      });
    });
  };

  /**
   * Fusiona tareas nuevas con las existentes sin mutar ninguno de los dos
   * arreglos. Idempotente por diseño: si el id ya existe y está 'done' o
   * 'cancelled', se conserva tal cual (no se reabre); si está 'pending', se
   * conserva la existente (no se pisa con una copia recién generada). Esto
   * es lo que evita que registrar dos veces el mismo evento llene Hoy de
   * tareas duplicadas.
   */
  const mergeTasks = (existing = [], incoming = []) => {
    const byId = new Map(existing.map(t => [t.id, t]));
    incoming.forEach(task => {
      if (!byId.has(task.id)) byId.set(task.id, task);
      // si ya existe (en cualquier estado) se conserva la existente.
    });
    return [...byId.values()];
  };

  /**
   * Cierra una tarea. Una tarea sólo se marca 'done' junto con el evento que
   * la cumple: no existe una vía para marcarla hecha "a mano" sin eventId,
   * porque eso rompería la trazabilidad tarea → evento.
   */
  const completeTask = (tasks = [], taskId, eventId) => {
    if (!eventId) throw new Error('eventId es requerido para completar una tarea');
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) throw new Error(`Tarea no encontrada: ${taskId}`);
    const next = [...tasks];
    next[idx] = Object.freeze({ ...tasks[idx], status: 'done', completedByEventId: eventId });
    return next;
  };

  /** Cancela una tarea (p.ej. porque el lote fue descartado). */
  const cancelTask = (tasks = [], taskId, reason) => {
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) throw new Error(`Tarea no encontrada: ${taskId}`);
    const next = [...tasks];
    next[idx] = Object.freeze({ ...tasks[idx], status: 'cancelled', reason: reason || tasks[idx].reason });
    return next;
  };

  /** Tareas pendientes de un objeto, ordenadas por vencimiento ascendente. */
  const openTasksFor = (tasks = [], objectId) => tasks
    .filter(t => t.objectId === objectId && t.status === 'pending')
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));

  const TASK_LABELS = Object.freeze({
    inspection: 'Inspeccionar',
    colonization_check: 'Verificar colonización',
    move: 'Mover de sala',
    harvest: 'Cosechar',
    reinspection: 'Reinspeccionar',
    cleaning: 'Limpiar',
    unblock: 'Desbloquear',
    advance_stage: 'Avanzar etapa',
  });

  const ACTION_LABELS = Object.freeze({
    inspection: 'Registrar inspección',
    colonization_check: 'Registrar colonización',
    move: 'Mover de sala',
    harvest: 'Registrar cosecha',
    reinspection: 'Registrar inspección',
    cleaning: 'Registrar limpieza',
    unblock: 'Resolver bloqueo',
    advance_stage: 'Avanzar etapa',
  });

  const resolveWhere = (task, index) => {
    if (task.objectType === 'batch') {
      const batch = index && index.batches && index.batches[task.objectId];
      if (!batch) return task.objectId;
      const room = batch.room && index.rooms && index.rooms[batch.room];
      const roomName = room ? room.name : batch.room;
      return roomName ? `${batch.code || task.objectId} · ${roomName}` : (batch.code || task.objectId);
    }
    if (task.objectType === 'room') {
      const room = index && index.rooms && index.rooms[task.objectId];
      return room ? room.name : task.objectId;
    }
    return task.objectId;
  };

  const BUCKET_LABELS = Object.freeze({
    critical: 'crítica',
    overdue: 'vencida',
    now: 'para ahora',
    blocked: 'bloqueada',
    later: 'más tarde',
    context: 'sin fecha',
  });

  /**
   * Construye la cola de trabajo de Hoy a partir de las tareas 'pending'. El
   * bucketing y el orden vienen de setas-os-workflow.js (buildTodayQueue /
   * classifyTodayItem): aquí sólo se mapea cada tarea a la forma que esa
   * función espera (severity, blocked, dueAt) y se resuelven los cuatro
   * campos explícitos que la fila debe responder: qué, dónde, por qué y qué
   * acción tomar.
   */
  const buildTodayFromTasks = (tasks = [], index = { batches: {}, rooms: {} }, nowMs = Date.now()) => {
    const workflow = workflowRef();
    const pending = tasks.filter(t => t.status === 'pending');

    const items = pending.map(task => ({
      taskId: task.id,
      objectId: task.objectId,
      objectType: task.objectType,
      dueAt: task.dueAt,
      priority: task.priority,
      severity: task.priority === 'critical' ? 'critical' : null,
      blocked: task.type === 'unblock',
      __task: task,
    }));

    const queued = workflow ? workflow.buildTodayQueue(items, nowMs) : items;

    return queued.map(item => {
      const task = item.__task;
      return {
        taskId: task.id,
        objectId: task.objectId,
        objectType: task.objectType,
        dueAt: task.dueAt,
        priority: task.priority,
        bucket: item.bucket,
        what: TASK_LABELS[task.type] || task.type,
        where: resolveWhere(task, index),
        why: `${task.reason} (${BUCKET_LABELS[item.bucket] || item.bucket})`,
        action: ACTION_LABELS[task.type] || 'Registrar',
      };
    });
  };

  /** Estadísticas agregadas de un conjunto de tareas. */
  const taskStats = (tasks = [], nowMs = Date.now()) => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending');
    const done = tasks.filter(t => t.status === 'done').length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;
    const overdue = pending.filter(t => Date.parse(t.dueAt) < nowMs).length;
    const dueToday = pending.filter(t => isoDay(t.dueAt) === isoDay(nowMs)).length;
    return { total, pending: pending.length, done, cancelled, overdue, dueToday };
  };

  const api = {
    TASK_TYPES,
    TASK_PRIORITIES,
    TASK_STATUSES,
    SOP_RULES,
    createTask,
    tasksFromTransition,
    tasksFromFollowUps,
    mergeTasks,
    completeTask,
    cancelTask,
    openTasksFor,
    buildTodayFromTasks,
    taskStats,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasTaskEngine = api;
})();
