'use strict';

/**
 * @file day-close.js — Cierre de jornada y relevo de turno para Setas OS.
 *
 * Hoy la operación termina y lo ocurrido se reconstruye después desde memoria,
 * WhatsApp o papel. Este módulo lo elimina: al cerrar el turno el sistema
 * resume eventos, tareas e incidencias abiertas del turno y entrega ese
 * contexto, en texto plano, a la siguiente persona que entra.
 *
 * Es lógica pura (mismo patrón UMD que batch-sheet.js / setas-os-workflow.js):
 * no toca React, ni red, ni DOM, y se prueba con `node --test day-close.test.js`.
 *
 * No calcula incidencias por su cuenta: las deriva de las fichas de lote que
 * ya produce batch-sheet.js (`anomalies` y `blocks`), para no duplicar esa
 * lógica ni desalinearse de ella.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // Las dependencias se resuelven en cada llamada, no al cargar: en el navegador
  // auth-gate.js carga los scripts en listas separadas y el orden entre listas no
  // está garantizado. Un require() de Node sí es estable.
  const batchSheetRef = () => (isNode ? require('./batch-sheet.js') : (glob && glob.SetasBatchSheet) || null);

  const DAY_MS = 86400000;

  const toMs = value => {
    if (value == null) return null;
    const t = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(t) ? t : null;
  };

  const SEVERITY_RANK = Object.freeze({ critical: 0, warning: 1 });
  const severityRank = sev => (SEVERITY_RANK[sev] != null ? SEVERITY_RANK[sev] : 2);

  /**
   * Construye el reporte de cierre de jornada.
   *
   * @param {object} params
   * @param {Array<object>} [params.events] Eventos crudos del turno, cada uno con `type` y `at`
   * @param {Array<object>} [params.tasks] Tareas del motor de tareas, con `status` y `dueAt`
   * @param {Array<object>} [params.sheets] Fichas de lote (setas.batch-sheet.v1) de batch-sheet.js
   * @param {number} [params.pendingSyncCount] Cambios locales aún no sincronizados
   * @param {number} params.shiftStartMs Inicio del turno (epoch ms)
   * @param {number} params.nowMs Fin del turno / reloj inyectado (epoch ms)
   * @param {string} params.operatorId Operador que cierra
   * @returns {object} Reporte congelado `setas.day-close.v1`
   */
  const buildDayCloseReport = ({
    events = [],
    tasks = [],
    sheets = [],
    pendingSyncCount = 0,
    shiftStartMs,
    nowMs,
    operatorId = null,
  } = {}) => {
    if (!Array.isArray(sheets)) throw new Error('sheets debe ser un arreglo de fichas de lote');
    if (!Array.isArray(events)) throw new Error('events debe ser un arreglo de eventos');
    if (!Array.isArray(tasks)) throw new Error('tasks debe ser un arreglo de tareas');
    if (!Number.isFinite(nowMs)) throw new Error('nowMs debe ser un número finito');
    if (!Number.isFinite(shiftStartMs)) throw new Error('shiftStartMs debe ser un número finito');

    // Sólo cuenta lo ocurrido dentro de la ventana del turno: un evento previo al
    // arranque no es trabajo de esta persona en este turno.
    const shiftEvents = events.filter(ev => {
      const at = toMs(ev && ev.at);
      return at != null && at >= shiftStartMs && at <= nowMs;
    });

    const eventsByType = {};
    shiftEvents.forEach(ev => {
      const type = (ev && (ev.type || ev.action)) || 'desconocido';
      eventsByType[type] = (eventsByType[type] || 0) + 1;
    });

    const tasksCompleted = tasks.filter(t => t && t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t && t.status === 'pending');
    const tasksPending = pendingTasks.length;
    const tasksOverdue = pendingTasks.filter(t => {
      const due = toMs(t.dueAt);
      return due != null && due < nowMs;
    }).length;

    // Incidentes abiertos: se derivan de las fichas de lote ya construidas, no se
    // recalculan aquí. Un lote con anomalía crítica encabeza la lista.
    const openIncidents = [];
    sheets.forEach(sheet => {
      if (!sheet) return;
      const objectId = sheet.batchId || sheet.code || null;
      const label = sheet.code || objectId || 'lote';
      (sheet.anomalies || []).forEach(a => {
        openIncidents.push({ objectId, label, detail: a.detail || a.kind || 'anomalía', severity: a.severity || 'warning' });
      });
      (sheet.blocks || []).forEach(b => {
        openIncidents.push({ objectId, label, detail: b.detail || b.code || 'bloqueo', severity: b.severity || 'warning' });
      });
    });
    openIncidents.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

    // Trabajo previsto: tareas pendientes cuyo vencimiento cae en las próximas 24h
    // desde el cierre, agrupadas por tipo para que el relevo sepa qué se viene.
    const tomorrowWindowEnd = nowMs + DAY_MS;
    const tomorrowGroups = new Map();
    pendingTasks.forEach(t => {
      const due = toMs(t.dueAt);
      if (due == null || due < nowMs || due > tomorrowWindowEnd) return;
      const type = t.type || 'tarea';
      if (!tomorrowGroups.has(type)) tomorrowGroups.set(type, { type, count: 0, objectIds: [] });
      const group = tomorrowGroups.get(type);
      group.count += 1;
      if (t.objectId != null) group.objectIds.push(t.objectId);
    });
    const tomorrow = [...tomorrowGroups.values()];

    const pendingSync = pendingSyncCount || 0;
    const blockers = [];
    // Un turno con cambios sin sincronizar no se puede cerrar limpio: es la regla
    // que impide perder trabajo entre el dispositivo de campo y el servidor.
    if (pendingSync > 0) blockers.push(`${pendingSync} cambios sin sincronizar`);

    const report = {
      schema: 'setas.day-close.v1',
      shiftStart: new Date(shiftStartMs).toISOString(),
      shiftEnd: new Date(nowMs).toISOString(),
      operatorId,
      eventsLogged: shiftEvents.length,
      eventsByType,
      tasksCompleted,
      tasksPending,
      tasksOverdue,
      openIncidents,
      tomorrow,
      pendingSync,
      readyToClose: blockers.length === 0,
      blockers,
      generatedAt: new Date(nowMs).toISOString(),
    };
    return Object.freeze(report);
  };

  /**
   * Construye la nota de relevo: texto plano listo para que lo lea la siguiente
   * persona al entrar, sin markdown ni emojis. Reemplaza el mensaje de WhatsApp.
   *
   * @param {object} report Reporte de buildDayCloseReport
   * @returns {string}
   */
  const buildHandoffNote = report => {
    const lines = [];
    lines.push('RELEVO DE TURNO');
    lines.push(`Turno: ${report.shiftStart} a ${report.shiftEnd}`);
    lines.push(`Operador: ${report.operatorId || 'sin identificar'}`);
    lines.push('');
    lines.push('EVENTOS REGISTRADOS');
    lines.push(`Total: ${report.eventsLogged}`);
    Object.keys(report.eventsByType).forEach(type => {
      lines.push(`  ${type}: ${report.eventsByType[type]}`);
    });
    lines.push('');
    lines.push('TAREAS');
    lines.push(`Completadas: ${report.tasksCompleted}`);
    lines.push(`Pendientes: ${report.tasksPending} (${report.tasksOverdue} vencidas)`);
    lines.push('');
    lines.push('INCIDENTES ABIERTOS');
    if (report.openIncidents.length) {
      report.openIncidents.forEach(inc => {
        lines.push(`  [${inc.severity}] ${inc.label}: ${inc.detail}`);
      });
    } else {
      lines.push('Ninguno');
    }
    lines.push('');
    lines.push('PARA MAÑANA');
    if (report.tomorrow.length) {
      report.tomorrow.forEach(g => {
        lines.push(`  ${g.type}: ${g.count} (${g.objectIds.join(', ') || 'sin lote asociado'})`);
      });
    } else {
      lines.push('Sin tareas previstas en 24 h');
    }
    lines.push('');
    lines.push('CAMBIOS SIN SINCRONIZAR');
    lines.push(String(report.pendingSync));
    return lines.join('\n');
  };

  /**
   * Cierra formalmente el turno. Cerrar con trabajo sin sincronizar no es un
   * warning: se bloquea, porque es la única garantía de no perder lo capturado
   * en campo antes de que llegue al servidor.
   *
   * @param {object} report Reporte de buildDayCloseReport
   * @param {object} options { operatorId, at }
   * @returns {{closed:true, closedAt:string, closedBy:string, report:object}}
   */
  const closeDay = (report, { operatorId, at = Date.now() } = {}) => {
    if (!report || !report.readyToClose) {
      const reason = (report && report.blockers && report.blockers[0]) || 'el turno no está listo para cerrar';
      throw new Error(`No se puede cerrar el turno: ${reason}`);
    }
    const closedAtMs = toMs(at);
    return Object.freeze({
      closed: true,
      closedAt: new Date(closedAtMs != null ? closedAtMs : Date.now()).toISOString(),
      closedBy: operatorId || report.operatorId || null,
      report,
    });
  };

  const api = {
    buildDayCloseReport,
    buildHandoffNote,
    closeDay,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasDayClose = api;
})();
