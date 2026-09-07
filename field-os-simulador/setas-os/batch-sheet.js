'use strict';

/**
 * @file batch-sheet.js — Ficha operativa canónica del lote para Setas OS.
 *
 * El lote es el núcleo de trazabilidad (SETAS_OS_UX_ARCHITECTURE_V2.md §3). Este
 * módulo reúne en un solo objeto todo lo que la ficha debe exponer —código, especie,
 * etapa y días en etapa, sala, bolsas activas, receta y versión, lote de semilla,
 * inventario consumido, eventos, cosechas, costos, anomalías, próxima acción,
 * bloqueos y evidencia fotográfica— y deriva de ahí:
 *
 *   escanear → resolver lote → mostrar estado → elegir acción válida → registrar → actualizar estado
 *
 * Es lógica pura (mismo patrón UMD que bitacora-model.js / setas-os-workflow.js):
 * no toca React, ni red, ni DOM, y se prueba con `node --test batch-sheet.test.js`.
 *
 * La máquina de estados vive en setas-os-workflow.js y no se duplica aquí: este
 * módulo la consume para validar transiciones y derivar acciones.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // Las dependencias se resuelven en cada llamada, no al cargar: en el navegador
  // auth-gate.js carga los scripts en listas separadas y el orden entre listas no
  // está garantizado. Un require() de Node sí es estable.
  const workflowRef = () => (isNode ? require('./setas-os-workflow.js') : (glob && glob.SetasOSWorkflow) || null);
  const bitacoraRef = () => (isNode ? require('./bitacora-model.js') : (glob && glob.SetasBitacora) || null);

  const DAY_MS = 86400000;

  /**
   * Vocabulario legado de `lote.estado` → ciclo de vida canónico.
   * La UI no debe inventar nombres locales de etapa (arquitectura §4).
   */
  const LEGACY_STATE_ALIASES = Object.freeze({
    planificado: 'planned',
    planeado: 'planned',
    mezcla: 'mix_prepared',
    mezcla_preparada: 'mix_prepared',
    pasteurizacion: 'thermal_treatment',
    esterilizacion: 'thermal_treatment',
    tratamiento_termico: 'thermal_treatment',
    enfriamiento: 'cooling',
    inoculado: 'inoculated',
    inoculacion: 'inoculated',
    incubacion: 'incubation',
    maduracion: 'maturation',
    induccion: 'induction',
    fructificacion: 'fruiting',
    descanso: 'resting',
    reposo: 'resting',
    completado: 'closed',
    cerrado: 'closed',
    cuarentena: 'quarantine',
    descartado: 'discarded',
    fallido: 'failed',
    activo: 'incubation',
  });

  const STATE_LABELS = Object.freeze({
    planned: 'Planificado',
    mix_prepared: 'Mezcla preparada',
    thermal_treatment: 'Tratamiento térmico',
    cooling: 'Enfriamiento',
    inoculated: 'Inoculado',
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

  /**
   * Catálogo de acciones de campo. `requires` es el mínimo que la captura debe
   * pedir antes de registrar el evento; `transitionsTo` marca las que además
   * mueven el estado del lote.
   */
  const ACTION_CATALOG = Object.freeze({
    prepare_mix: { label: 'Preparar mezcla', requires: ['recetaId'], transitionsTo: 'mix_prepared' },
    start_thermal_treatment: { label: 'Iniciar tratamiento térmico', requires: [], transitionsTo: 'thermal_treatment' },
    complete_thermal_treatment: { label: 'Cerrar tratamiento térmico', requires: [], transitionsTo: 'cooling' },
    inoculate: { label: 'Inocular', requires: ['spawnLotId'], transitionsTo: 'inoculated' },
    inspection: { label: 'Registrar inspección', requires: ['observacion'] },
    colonization: { label: 'Registrar colonización', requires: ['porcentaje'] },
    contamination: { label: 'Registrar contaminación', requires: ['foto', 'extension', 'ubicacion', 'decision'] },
    photo: { label: 'Adjuntar foto', requires: ['foto'] },
    move: { label: 'Mover de sala', requires: ['salaDestinoId'] },
    note: { label: 'Nota de campo', requires: ['nota'] },
    harvest: { label: 'Registrar cosecha', requires: ['pesoFresco', 'flush'] },
    advance_stage: { label: 'Avanzar etapa', requires: [] },
    report_problem: { label: 'Reportar problema', requires: ['observacion'] },
    discard: { label: 'Descartar lote', requires: ['motivo'], transitionsTo: 'discarded' },
  });

  /**
   * Orden de preferencia por estado: la ficha muestra de 3 a 5 acciones, no un
   * formulario universal. Lo que no está en esta lista queda fuera del cajón
   * principal aunque el workflow lo permita.
   */
  const ACTION_PRIORITY = Object.freeze({
    planned: ['prepare_mix', 'note', 'photo', 'discard'],
    mix_prepared: ['start_thermal_treatment', 'note', 'photo', 'discard'],
    thermal_treatment: ['complete_thermal_treatment', 'report_problem', 'note', 'photo'],
    cooling: ['inoculate', 'report_problem', 'note', 'photo'],
    inoculated: ['inspection', 'contamination', 'photo', 'move'],
    incubation: ['colonization', 'contamination', 'photo', 'move', 'advance_stage'],
    maturation: ['inspection', 'contamination', 'photo', 'move', 'advance_stage'],
    induction: ['inspection', 'contamination', 'photo', 'move', 'advance_stage'],
    fruiting: ['harvest', 'inspection', 'contamination', 'photo', 'advance_stage'],
    resting: ['inspection', 'contamination', 'photo', 'advance_stage'],
    quarantine: ['contamination', 'inspection', 'photo', 'discard', 'advance_stage'],
    closed: ['note', 'photo'],
    discarded: ['note', 'photo'],
    failed: ['note', 'photo'],
  });

  // `colonization` y `photo` son capturas específicas de campo que se apoyan en
  // los permisos de `inspection` y `note` de la máquina de estados.
  const ACTION_PERMISSION_BASE = Object.freeze({ colonization: 'inspection', photo: 'note' });

  const MAX_CONTEXTUAL_ACTIONS = 5;

  const toDate = value => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  };

  const daysBetween = (fromValue, toMs) => {
    const from = toDate(fromValue);
    if (!from) return null;
    return Math.max(0, Math.floor((toMs - from.getTime()) / DAY_MS));
  };

  /** Normaliza cualquier `estado` legado al vocabulario canónico del ciclo de vida. */
  const normalizeLifecycleState = (raw, fallback = 'planned') => {
    if (!raw) return fallback;
    const workflow = workflowRef();
    const key = String(raw).trim().toLowerCase();
    if (workflow && workflow.isKnownState(key)) return key;
    return LEGACY_STATE_ALIASES[key] || fallback;
  };

  const stateLabel = state => STATE_LABELS[state] || state;

  /**
   * Resuelve el contenido de una etiqueta QR a un objeto operativo.
   *
   * Acepta el código de lote crudo, el id interno, un código de bolsa
   * (`<lote>-B03`), una URL de trazabilidad (`.../trace/<codigo>`) y payloads
   * JSON `{"batch":"..."}`. Devuelve siempre un resultado explícito para que la
   * UI nunca aterrice en un menú genérico.
   *
   * @param {string} raw Texto leído del QR
   * @param {object} index { lotes, bolsas }
   * @returns {{kind:'batch'|'bag'|'unknown', batchId:?string, batchCode:?string, bagId:?string, raw:string, reason:?string}}
   */
  const resolveScan = (raw, { lotes = [], bolsas = [] } = {}) => {
    const text = raw == null ? '' : String(raw).trim();
    const miss = reason => ({ kind: 'unknown', batchId: null, batchCode: null, bagId: null, raw: text, reason });
    if (!text) return miss('empty_payload');

    let candidate = text;
    if (text.startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        candidate = parsed.batch || parsed.batchCode || parsed.codigo || parsed.id || parsed.bag || text;
      } catch (err) { /* payload no-JSON: se sigue tratando como texto */ }
    }
    // URL de trazabilidad o deep-link: el último segmento no vacío es el código.
    if (/[:/]/.test(candidate)) {
      const segments = candidate.split(/[?#]/)[0].split('/').filter(Boolean);
      if (segments.length) candidate = decodeURIComponent(segments[segments.length - 1]);
    }
    candidate = candidate.replace(/^(?:SDP-CERT-|CAN-)/i, '').trim();
    if (!candidate) return miss('empty_payload');

    const norm = s => String(s == null ? '' : s).trim().toLowerCase();
    const target = norm(candidate);

    const bag = bolsas.find(b => norm(b.codigo) === target || norm(b.id) === target);
    if (bag) {
      const lote = lotes.find(l => l.id === bag.loteId) || null;
      return {
        kind: 'bag',
        batchId: bag.loteId || (lote ? lote.id : null),
        batchCode: lote ? (lote.codigo || lote.id) : null,
        bagId: bag.id,
        raw: text,
        reason: null,
      };
    }

    const exact = lotes.find(l => norm(l.codigo) === target || norm(l.id) === target);
    if (exact) {
      return { kind: 'batch', batchId: exact.id, batchCode: exact.codigo || exact.id, bagId: null, raw: text, reason: null };
    }

    // Etiqueta de bolsa cuyo registro aún no existe: `<codigoLote>-B07`.
    const prefixed = lotes.find(l => l.codigo && target.startsWith(norm(l.codigo) + '-'));
    if (prefixed) {
      return { kind: 'batch', batchId: prefixed.id, batchCode: prefixed.codigo, bagId: null, raw: text, reason: 'resolved_by_prefix' };
    }

    return miss('no_match');
  };

  const buildEventTimeline = ({ lote, bolsas, cosechas, events, incidencias, nowMs }) => {
    const timeline = [];

    const push = (at, type, title, meta, kind, extra) => {
      timeline.push(Object.assign({ at: at || null, type, title, meta: meta || '', provenance: kind || 'manual' }, extra || {}));
    };

    if (lote.fechaMezcla) push(lote.fechaMezcla, 'mix_prepared', 'Mezcla preparada', lote.fechaMezcla, 'manual');
    if (lote.fechaInoculacion) {
      const spawn = lote.spawnLotId || (lote.spawnLot && lote.spawnLot.id) || null;
      push(lote.fechaInoculacion, 'inoculated', 'Inoculación', spawn ? `spawn ${spawn}` : lote.fechaInoculacion, 'manual');
    }

    bolsas.forEach(b => {
      if (b.col100) push(b.col100, 'colonization', `Colonización 100% · ${b.codigo || b.id}`, b.col100, 'manual', { bagId: b.id });
      if (b.estado === 'contaminada') {
        push(b.fechaDescarte || b.fechaContaminacion || null, 'contamination', `Contaminación · ${b.codigo || b.id}`,
          b.motivoDescarte || b.observaciones || 'Sin causa registrada', 'manual', { bagId: b.id, photo: b.foto || null });
      }
    });

    cosechas.forEach(c => {
      push(c.fecha, 'harvest', `Cosecha · flush ${c.flush || 1}`, `${c.pesoFresco || 0} g · ${c.codigo || ''}`.trim(), 'measured', { cosechaId: c.id });
    });

    incidencias.forEach((inc, i) => {
      push(inc.at || inc.startAt || inc.fecha || null, 'incident', inc.title || inc.msg || 'Incidencia ambiental',
        inc.detail || inc.roomId || '', 'measured', { incidentId: inc.id || `inc-${i}` });
    });

    // Eventos ya persistidos en el lote (transiciones de estado y capturas de campo).
    events.forEach(ev => {
      if (ev.type === 'batch_state_transition') {
        push(ev.at, ev.type, `Transición ${stateLabel(ev.from)} → ${stateLabel(ev.to)}`, ev.reason || ev.operatorId || '', 'manual', { eventId: ev.id || null });
      } else {
        const spec = ACTION_CATALOG[ev.action || ev.type];
        push(ev.at, ev.type || ev.action || 'event', (spec && spec.label) || ev.title || 'Evento de campo',
          ev.nota || ev.observacion || ev.reason || '', ev.provenance || 'manual',
          { eventId: ev.id || null, photo: ev.foto || ev.photo || null });
      }
    });

    return timeline.sort((a, b) => {
      const ta = toDate(a.at);
      const tb = toDate(b.at);
      const va = ta ? ta.getTime() : nowMs;
      const vb = tb ? tb.getTime() : nowMs;
      return vb - va;
    });
  };

  /**
   * Construye la ficha operativa canónica del lote.
   *
   * @param {object} params
   * @param {object} params.lote Lote de bitácora/producción
   * @param {Array<object>} [params.bolsas] Bolsas de todos los lotes (se filtran por loteId)
   * @param {Array<object>} [params.cosechas] Cosechas de todos los lotes
   * @param {Array<object>} [params.events] Eventos ya registrados del lote
   * @param {Array<object>} [params.incidencias] Incidencias ambientales
   * @param {object} [params.room] Sala actual resuelta por id
   * @param {object} [params.recipe] Receta vinculada resuelta por id
   * @param {Array<object>} [params.inventoryLots] Lotes de insumo consumidos
   * @param {object} [params.spawnLot] Lote de semilla resuelto
   * @param {string} [params.role] Rol del operador para derivar acciones
   * @param {number} [params.nowMs] Reloj inyectable
   * @returns {object} Ficha canónica `setas.batch-sheet.v1`
   */
  const buildBatchSheet = ({
    lote,
    bolsas = [],
    cosechas = [],
    events = [],
    incidencias = [],
    room = null,
    recipe = null,
    inventoryLots = null,
    spawnLot = null,
    role = 'operario',
    nowMs = Date.now(),
  } = {}) => {
    if (!lote || !lote.id) throw new Error('lote válido con id es requerido');

    const bitacora = bitacoraRef();
    const batchId = lote.id;
    const loteBolsas = bolsas.filter(b => b.loteId === batchId);
    const loteCosechas = cosechas.filter(c => c.loteId === batchId);
    const loteEventos = events.filter(e => !e.batchId || e.batchId === batchId);
    const loteIncidencias = incidencias.filter(inc => {
      if (Array.isArray(inc.loteIds)) return inc.loteIds.includes(batchId);
      if (inc.loteId) return inc.loteId === batchId;
      return false;
    });

    const state = normalizeLifecycleState(lote.lifecycleState || lote.estado);
    const stats = bitacora && bitacora.calcLoteStats ? bitacora.calcLoteStats(lote, loteBolsas, loteCosechas) : null;

    // Días en la etapa actual: la última transición manda; si el lote nunca ha
    // transicionado se usa la inoculación y, en su defecto, la mezcla.
    const transitions = loteEventos.filter(e => e.type === 'batch_state_transition' && e.to === state);
    const lastTransitionAt = transitions.length
      ? transitions.map(e => e.at).sort().slice(-1)[0]
      : (lote.stageSince || null);
    const stageSince = lastTransitionAt || lote.fechaInoculacion || lote.fechaMezcla || null;

    const bagsActive = loteBolsas.length
      ? loteBolsas.filter(b => b.estado !== 'descartada' && b.estado !== 'contaminada').length
      : (parseInt(lote.numBolsas, 10) || 0);

    const recipeRef = recipe || lote.recipeRef || lote.recetaSnapshot || null;
    const recipeId = (recipeRef && (recipeRef.id || recipeRef.recipeId)) || lote.recetaId || null;
    const recipeVersion = (recipeRef && (recipeRef.version || recipeRef.v)) || lote.recetaVersion || null;

    const resolvedSpawn = spawnLot || lote.spawnLot ||
      (lote.spawnLotId ? { id: lote.spawnLotId } : null) ||
      (lote.spawnKg ? { id: null, kg: lote.spawnKg, costKg: lote.spawnCostKg } : null);

    const consumedInventory = (inventoryLots || lote.ingredientLots || lote.insumoLots || []).map(x => ({
      lotId: x.lotId || x.id || null,
      ingredienteId: x.ingredienteId || x.ingredientId || null,
      nombre: x.nombre || x.name || null,
      kg: x.kg != null ? x.kg : (x.cantidad != null ? x.cantidad : null),
      costoCop: x.costoCop != null ? x.costoCop : (x.costo != null ? x.costo : null),
    }));

    const roomId = (room && room.id) || lote.sala || lote.ubicacion || lote.roomId || null;

    const timeline = buildEventTimeline({ lote, bolsas: loteBolsas, cosechas: loteCosechas, events: loteEventos, incidencias: loteIncidencias, nowMs });
    const photos = timeline.filter(e => e.photo).map(e => ({ at: e.at, type: e.type, photo: e.photo, bagId: e.bagId || null }));

    // Anomalías: lo que exige decisión operativa aunque nadie haya abierto un ticket.
    const anomalies = [];
    if (stats && stats.contPct > 0) {
      anomalies.push({
        kind: 'contamination',
        severity: stats.contPct >= 20 ? 'critical' : 'warning',
        detail: `${stats.bolsasContaminadas}/${stats.numBolsas} bolsas contaminadas (${stats.contPct.toFixed(0)}%)`,
      });
    }
    loteIncidencias.forEach(inc => {
      anomalies.push({ kind: 'environment', severity: inc.severity || 'warning', detail: inc.title || inc.msg || inc.detail || 'Incidencia ambiental', incidentId: inc.id || null });
    });
    if (stats && stats.varianzaEB != null && stats.varianzaEB <= -15) {
      anomalies.push({ kind: 'yield', severity: 'warning', detail: `EB real ${stats.be.toFixed(0)}% vs ${stats.ebEstimada}% estimada de la receta` });
    }

    // Bloqueos: lo que impide avanzar. Se muestran para explicar por qué falta
    // una acción, no para ofrecer una transición inválida.
    const blocks = [];
    if (!recipeId) blocks.push({ code: 'recipe_unlinked', detail: 'El lote no tiene receta vinculada por id' });
    if (!roomId) blocks.push({ code: 'room_unlinked', detail: 'El lote no tiene sala asignada' });
    if (!resolvedSpawn || !resolvedSpawn.id) blocks.push({ code: 'spawn_unlinked', detail: 'El lote no registra lote de semilla' });
    if (stats && stats.contPct >= 20) blocks.push({ code: 'contamination_threshold', detail: 'Contaminación ≥20%: requiere decisión antes de avanzar etapa' });

    const traceability = {
      recipeLinked: Boolean(recipeId),
      roomLinked: Boolean(roomId),
      spawnLinked: Boolean(resolvedSpawn && resolvedSpawn.id),
      inventoryLinked: consumedInventory.some(i => i.lotId),
      harvestsLinked: loteCosechas.length > 0,
      eventsLinked: timeline.length > 0,
    };
    const traceabilityKeys = Object.keys(traceability);
    const completenessPct = Math.round((traceabilityKeys.filter(k => traceability[k]).length / traceabilityKeys.length) * 1000) / 10;

    const sheet = {
      schema: 'setas.batch-sheet.v1',
      batchId,
      code: lote.codigo || batchId,
      species: lote.especie || lote.sKey || null,
      speciesScientific: lote.especieCientifico || null,
      state,
      stateLabel: stateLabel(state),
      stageSince,
      daysInStage: daysBetween(stageSince, nowMs),
      ageDays: daysBetween(lote.fechaInoculacion || lote.fechaMezcla, nowMs),
      room: room ? { id: room.id, name: room.name || room.id } : (roomId ? { id: roomId, name: roomId } : null),
      bagsActive,
      bagsTotal: loteBolsas.length || (parseInt(lote.numBolsas, 10) || 0),
      recipe: recipeId || recipeRef ? {
        id: recipeId,
        name: (recipeRef && (recipeRef.name || recipeRef.nombre)) || null,
        version: recipeVersion,
      } : null,
      spawnLot: resolvedSpawn ? Object.assign({}, resolvedSpawn) : null,
      consumedInventory,
      timeline,
      harvests: loteCosechas.map(c => ({
        id: c.id, flush: c.flush || 1, fecha: c.fecha || null,
        pesoFrescoG: parseFloat(c.pesoFresco) || 0, calidad: c.calidad != null ? c.calidad : null,
      })),
      costs: stats ? {
        incurredTotalCop: stats.costoIncurridoTotal,
        perBagCop: stats.costoIncurridoPorBolsa,
        perKgHarvestedCop: stats.costoRealPorKgCosechado,
        breakdown: stats.costoDesglose,
        revenueCop: stats.ingresoRealTotal,
        marginCop: stats.margenRealTotal,
      } : null,
      outcomes: stats ? {
        biologicalEfficiencyPct: stats.be,
        totalFreshKg: stats.totalFresco,
        contaminationPct: stats.contPct,
        colonizationDays: stats.diasCol,
      } : null,
      anomalies,
      blocks,
      photos,
      traceability,
      completenessPct,
      generatedAt: new Date(nowMs).toISOString(),
    };

    sheet.actions = contextualActions(sheet, { role });
    sheet.nextAction = sheet.actions.length ? sheet.actions[0] : null;
    return sheet;
  };

  /**
   * Deriva las acciones válidas AHORA a partir del estado y de los permisos del
   * rol. Devuelve como máximo cinco: la ficha ofrece decisiones, no un formulario
   * universal. Las transiciones inválidas no se devuelven deshabilitadas —
   * simplemente no están.
   *
   * @param {object} sheet Ficha construida por buildBatchSheet (o `{state, blocks}`)
   * @param {object} [options] { role, limit }
   * @returns {Array<{action:string,label:string,requires:string[],transitionsTo:?string,blockedBy:?string}>}
   */
  const contextualActions = (sheet, { role = 'operario', limit = MAX_CONTEXTUAL_ACTIONS } = {}) => {
    const workflow = workflowRef();
    if (!sheet || !sheet.state) return [];
    const state = sheet.state;
    const allowed = new Set(workflow ? workflow.validActions(state, role) : []);
    const blocks = sheet.blocks || [];
    const hardBlock = blocks.find(b => b.code === 'contamination_threshold') || null;

    const ordered = ACTION_PRIORITY[state] || [];
    const out = [];
    ordered.forEach(action => {
      if (out.length >= limit) return;
      const permissionKey = ACTION_PERMISSION_BASE[action] || action;
      if (!allowed.has(permissionKey)) return;
      const spec = ACTION_CATALOG[action];
      if (!spec) return;
      // Un bloqueo duro no oculta la acción de avance: se muestra con su motivo
      // porque el operario necesita saber por qué no puede avanzar.
      const blockedBy = action === 'advance_stage' && hardBlock ? hardBlock.code : null;
      out.push({
        action,
        label: spec.label,
        requires: [...spec.requires],
        transitionsTo: spec.transitionsTo || null,
        blockedBy,
      });
    });
    return out;
  };

  const hashEvent = payload => {
    // Hash FNV-1a de 32 bits en hex: encadena los eventos para detectar
    // reescrituras del historial sin arrastrar una dependencia de crypto al
    // navegador. No es criptográfico y no pretende serlo.
    const text = JSON.stringify(payload);
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  };

  /**
   * Añade un evento inmutable al historial del lote. Cada evento queda congelado
   * y encadenado al anterior por `prevHash`, de modo que el historial sólo crece:
   * corregir un dato exige un evento nuevo, no editar uno viejo.
   *
   * @param {Array<object>} log Historial existente (no se muta)
   * @param {object} event { batchId, action|type, operatorId, at, payload }
   * @returns {Array<object>} Historial nuevo con el evento añadido
   */
  const appendBatchEvent = (log = [], event = {}) => {
    const action = event.action || event.type;
    if (!event.batchId) throw new Error('batchId es requerido para registrar un evento de lote');
    if (!action) throw new Error('action es requerida para registrar un evento de lote');
    if (!event.operatorId) throw new Error('operatorId es requerido para registrar un evento de lote');

    const spec = ACTION_CATALOG[action];
    if (spec) {
      const payload = event.payload || {};
      const missing = spec.requires.filter(field => payload[field] == null || payload[field] === '');
      if (missing.length) {
        throw new Error(`Faltan campos obligatorios para "${action}": ${missing.join(', ')}`);
      }
    }

    const prev = log.length ? log[log.length - 1] : null;
    const seq = prev ? prev.seq + 1 : 1;
    const base = {
      id: event.id || `${event.batchId}-${seq}`,
      seq,
      batchId: event.batchId,
      type: event.type && event.type !== action ? event.type : 'batch_event',
      action,
      operatorId: event.operatorId,
      at: event.at || new Date().toISOString(),
      payload: Object.freeze(Object.assign({}, event.payload || {})),
      prevHash: prev ? prev.hash : null,
    };
    const entry = Object.freeze(Object.assign(base, { hash: hashEvent(base) }));
    return Object.freeze([...log, entry]);
  };

  /** Verifica que un historial no haya sido reescrito ni reordenado. */
  const verifyEventChain = (log = []) => {
    for (let i = 0; i < log.length; i++) {
      const entry = log[i];
      const prev = i > 0 ? log[i - 1] : null;
      if (entry.seq !== i + 1) return { valid: false, brokenAt: i, reason: 'seq_out_of_order' };
      if (entry.prevHash !== (prev ? prev.hash : null)) return { valid: false, brokenAt: i, reason: 'prev_hash_mismatch' };
      const { hash, ...rest } = entry;
      if (hashEvent(rest) !== hash) return { valid: false, brokenAt: i, reason: 'payload_tampered' };
    }
    return { valid: true, brokenAt: null, reason: null };
  };

  /**
   * Acción rápida de contaminación: foto, extensión, ubicación y decisión son
   * obligatorias, porque una contaminación sin esos cuatro datos no sirve para
   * decidir ni para aprender.
   */
  const contaminationEvent = ({ batchId, operatorId, foto, extension, ubicacion, decision, bagIds = [], nota = '', at = null }) => {
    const DECISIONS = ['aislar', 'descartar_bolsa', 'descartar_lote', 'observar'];
    if (!DECISIONS.includes(decision)) {
      throw new Error(`decision debe ser una de: ${DECISIONS.join(', ')}`);
    }
    return {
      batchId,
      action: 'contamination',
      operatorId,
      at,
      payload: { foto, extension, ubicacion, decision, bagIds: [...bagIds], nota },
    };
  };

  /**
   * Aplica una acción a la ficha: valida que sea válida ahora, construye el
   * evento inmutable y devuelve el estado resultante. Es el paso
   * `registrar → actualizar estado` del flujo de captura.
   *
   * @returns {{event:object, log:Array<object>, state:string, transitioned:boolean}}
   */
  const applyAction = ({ sheet, action, operatorId, payload = {}, log = [], role = 'operario', at = null, targetState = null }) => {
    const workflow = workflowRef();
    const available = contextualActions(sheet, { role });
    const match = available.find(a => a.action === action);
    if (!match) throw new Error(`Acción "${action}" no es válida para un lote en estado "${sheet.state}"`);
    if (match.blockedBy) throw new Error(`Acción "${action}" bloqueada por: ${match.blockedBy}`);

    const nextLog = appendBatchEvent(log, { batchId: sheet.batchId, action, operatorId, at, payload });

    let state = sheet.state;
    let transitioned = false;
    const desired = targetState || match.transitionsTo ||
      (action === 'advance_stage' && workflow ? (workflow.DEFAULT_TRANSITIONS[sheet.state] || [])[0] : null);

    if (desired && workflow && workflow.canTransition(sheet.state, desired)) {
      const transition = workflow.transitionEvent({
        batchId: sheet.batchId, from: sheet.state, to: desired, operatorId,
        at: at || undefined, reason: payload.motivo || null,
      });
      state = desired;
      transitioned = true;
      return {
        event: nextLog[nextLog.length - 1],
        log: appendBatchEvent(nextLog, {
          batchId: sheet.batchId, action: 'advance_stage', type: 'batch_state_transition',
          operatorId, at: transition.at, payload: { from: transition.from, to: transition.to, reason: transition.reason },
        }),
        state,
        transitioned,
      };
    }
    if (desired && !transitioned) {
      throw new Error(`Transición inválida de "${sheet.state}" a "${desired}"`);
    }

    return { event: nextLog[nextLog.length - 1], log: nextLog, state, transitioned };
  };

  /**
   * Indicadores de éxito del modelo de ficha, calculados sobre las fichas ya
   * construidas. Lo que no se puede derivar de una ficha (intentos de transición
   * inválida, operaciones iniciadas por QR) se inyecta como contadores del runtime.
   *
   * @param {Array<object>} sheets Fichas construidas por buildBatchSheet
   * @param {object} [counters] { invalidTransitionAttempts, qrStartedOps, totalFieldOps, inspectionDurationsMs }
   */
  const batchScoreboard = (sheets = [], counters = {}) => {
    const total = sheets.length;
    const pct = n => (total ? Math.round((n / total) * 1000) / 10 : null);
    const closed = sheets.filter(s => s.state === 'closed');
    const durations = counters.inspectionDurationsMs || [];

    return {
      batches: total,
      // % de eventos vinculados a un lote: por construcción la ficha sólo contiene
      // eventos del lote, así que aquí se mide cuántas fichas tienen historial.
      eventsLinkedPct: pct(sheets.filter(s => s.timeline.length > 0).length),
      batchesWithoutNextActionPct: pct(sheets.filter(s => !s.nextAction).length),
      batchesWithoutRecipeOrRoomPct: pct(sheets.filter(s => !s.traceability.recipeLinked || !s.traceability.roomLinked).length),
      avgTraceabilityCompletenessPct: total
        ? Math.round((sheets.reduce((sum, s) => sum + s.completenessPct, 0) / total) * 10) / 10
        : null,
      closedBatchTraceabilityPct: closed.length
        ? Math.round((closed.reduce((sum, s) => sum + s.completenessPct, 0) / closed.length) * 10) / 10
        : null,
      blockedBatches: sheets.filter(s => s.blocks.length > 0).length,
      invalidTransitionAttempts: counters.invalidTransitionAttempts || 0,
      qrStartedOpsPct: counters.totalFieldOps
        ? Math.round(((counters.qrStartedOps || 0) / counters.totalFieldOps) * 1000) / 10
        : null,
      medianInspectionMs: durations.length
        ? [...durations].sort((a, b) => a - b)[Math.floor(durations.length / 2)]
        : null,
    };
  };

  const api = {
    LEGACY_STATE_ALIASES,
    STATE_LABELS,
    ACTION_CATALOG,
    ACTION_PRIORITY,
    MAX_CONTEXTUAL_ACTIONS,
    normalizeLifecycleState,
    stateLabel,
    resolveScan,
    buildBatchSheet,
    contextualActions,
    appendBatchEvent,
    verifyEventChain,
    contaminationEvent,
    applyAction,
    batchScoreboard,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasBatchSheet = api;
})();
