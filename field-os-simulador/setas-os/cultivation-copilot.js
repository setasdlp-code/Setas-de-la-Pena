'use strict';

/**
 * @file cultivation-copilot.js — Copiloto de Cultivo de Setas OS.
 *
 * Compone, SIN reimplementar su matemática, las cuatro salidas de:
 *   - biological-clock.js       (SetasBiologicalClock)
 *   - contamination-risk.js     (SetasContaminationRisk)
 *   - vision-diagnosis.js       (SetasVisionDiagnosis)
 *   - harvest-calendar.js       (SetasHarvestCalendar)
 * en una única "briefing" operativa: qué lote/sala/etapa necesita atención
 * ahora, por qué (con números, no vaguedad), y con qué confianza.
 *
 * IMPORTANTE (ver .claude/skills/agronomic-claims/SKILL.md):
 * - Este módulo NUNCA decide por sí mismo transicionar el estado de un lote,
 *   ejecutar una acción de actuador ni confirmar un diagnóstico de
 *   contaminación. Solo SUGIERE, en español, próximas acciones para que un
 *   humano las revise y las ejecute.
 * - `confidence` en cada acción/insight es siempre 'low' o 'medium' — nunca
 *   'high' —, heredado de motores que ya tienen ese tope estructural.
 * - Si un motor subyacente no está disponible, este módulo lo reporta en
 *   `enginesMissing` y sigue funcionando en modo degradado con los motores
 *   que sí tiene, en vez de fallar por completo.
 *
 * Patrón UMD idéntico al resto de motores de Setas OS: IIFE, puro (sin
 * React/DOM/red), `now` siempre explícito (nunca `Date.now()` implícito
 * dentro de una función de negocio), resolución de dependencias vía
 * `require()` en Node y `globalThis` en navegador.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // ---------------------------------------------------------------------
  // Resolución perezosa y con degradación de los 4 motores + task-engine.
  // No se capturan en tiempo de carga: en el navegador el orden de <script>
  // entre estos archivos no está garantizado (ver ARCHITECTURE.md / notas de
  // orden de carga en auth-gate.js), así que cada función pública vuelve a
  // resolverlos en el momento en que se llama.
  // ---------------------------------------------------------------------
  const resolveEngine = (nodePath, globalName) => {
    if (isNode) {
      try { return require(nodePath); } catch (e) { /* no disponible en este entorno */ }
    }
    if (glob && glob[globalName]) return glob[globalName];
    return null;
  };

  const resolveEngines = () => ({
    BiologicalClock: resolveEngine('./biological-clock.js', 'SetasBiologicalClock'),
    ContaminationRisk: resolveEngine('./contamination-risk.js', 'SetasContaminationRisk'),
    VisionDiagnosis: resolveEngine('./vision-diagnosis.js', 'SetasVisionDiagnosis'),
    HarvestCalendar: resolveEngine('./harvest-calendar.js', 'SetasHarvestCalendar'),
    FlushForecast: resolveEngine('./flush-forecast-engine.js', 'SetasFlushForecast'),
    TaskEngine: resolveEngine('./task-engine.js', 'SetasTaskEngine'),
  });

  const ENGINE_LABELS = Object.freeze({
    BiologicalClock: 'biological-clock',
    ContaminationRisk: 'contamination-risk',
    VisionDiagnosis: 'vision-diagnosis',
    HarvestCalendar: 'harvest-calendar',
    FlushForecast: 'flush-forecast-engine',
    TaskEngine: 'task-engine',
  });

  const engineReport = (engines) => {
    const used = [];
    const missing = [];
    Object.keys(ENGINE_LABELS).forEach((key) => {
      if (engines[key]) used.push(ENGINE_LABELS[key]);
      else missing.push(ENGINE_LABELS[key]);
    });
    return { enginesUsed: used, enginesMissing: missing };
  };

  // ---------------------------------------------------------------------
  // Utilidades genéricas
  // ---------------------------------------------------------------------
  const round1 = (v) => Math.round((v + Number.EPSILON) * 10) / 10;
  const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

  const toMillis = (t) => {
    if (t instanceof Date) return isNaN(t.getTime()) ? NaN : t.getTime();
    if (typeof t === 'number') return Number.isFinite(t) ? t : NaN;
    if (typeof t === 'string' && t.trim()) {
      const parsed = new Date(t.trim());
      return isNaN(parsed.getTime()) ? NaN : parsed.getTime();
    }
    return NaN;
  };

  const toIso = (ms) => (Number.isFinite(ms) ? new Date(ms).toISOString() : null);

  const stripAccents = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /** Confianza tope 'low'|'medium': nunca 'high', sin importar lo que reporte el motor de origen. */
  const capConfidence = (c) => (c === 'medium' ? 'medium' : 'low');

  /** Combina varias confianzas: 'medium' solo si TODAS las que llegan son 'medium'. */
  const combineConfidence = (...values) => {
    const present = values.filter((v) => v === 'low' || v === 'medium');
    if (!present.length) return 'low';
    return present.every((v) => v === 'medium') ? 'medium' : 'low';
  };

  // ---------------------------------------------------------------------
  // normalizeStage — canonicaliza estado del ciclo de vida (canónico inglés
  // de setas-os-workflow.js NORMAL_STATES/EXCEPTION_STATES, o los valores en
  // español heredados que aparecen en Bitácora/lotes reales del repo:
  // 'planificado', 'produccion', 'incubacion', 'fructificacion',
  // 'cosechada'/'completado', 'contaminada'/'cuarentena', 'descartada'/
  // 'descartado', etc.) a una de las etapas que los 4 motores entienden.
  // ---------------------------------------------------------------------
  const STAGE_ALIASES = Object.freeze({
    // Canónicos (setas-os-workflow.js NORMAL_STATES)
    planned: 'planned',
    mix_prepared: 'planned',
    thermal_treatment: 'planned',
    cooling: 'planned',
    inoculated: 'incubation',
    incubation: 'incubation',
    maturation: 'maturation',
    induction: 'induction',
    fruiting: 'fruiting',
    resting: 'resting',
    closed: 'closed',
    // Canónicos (EXCEPTION_STATES)
    quarantine: 'quarantine',
    discarded: 'closed',
    failed: 'closed',
    // Español heredado (bitácora / lotes reales)
    planificado: 'planned',
    produccion: 'incubation',
    activo: 'incubation',
    recibida: 'planned',
    pendiente: 'planned',
    inoculado: 'incubation',
    incubacion: 'incubation',
    colonizacion: 'incubation',
    maduracion: 'maturation',
    induccion: 'induction',
    fructificacion: 'fruiting',
    pinning: 'induction',
    descanso: 'resting',
    cosechada: 'closed',
    completado: 'closed',
    cerrado: 'closed',
    cancelado: 'closed',
    contaminada: 'quarantine',
    contaminado: 'quarantine',
    cuarentena: 'quarantine',
    aislada: 'quarantine',
    descartada: 'closed',
    descartado: 'closed',
  });

  /**
   * Normaliza un estado de ciclo de vida (canónico o español heredado) a una
   * de las etapas que entienden los motores agronómicos:
   * 'planned' | 'incubation' | 'maturation' | 'induction' | 'fruiting' |
   * 'resting' | 'quarantine' | 'closed' | 'desconocido'.
   *
   * Un estado desconocido/vacío devuelve 'desconocido', NO 'incubation'.
   * Antes caía a 'incubation' "por conservador", pero eso hacía justo lo
   * contrario a lo previsto: un lote con `estado` mal escrito o ausente se
   * proyectaba silenciosamente como si estuviera en incubación real (reloj
   * biológico, riesgo de contaminación por etapa, acción de "listo_probable"
   * incluidos), en vez de señalar que no se sabe en qué etapa está. Con
   * 'desconocido', buildLotInsights/recommendActions omiten explícitamente
   * las acciones basadas en etapa para ese lote (ver buildLotInsights).
   */
  const normalizeStage = (lifecycleState) => {
    const clean = stripAccents(lifecycleState);
    if (!clean) return 'desconocido';
    return STAGE_ALIASES[clean] || 'desconocido';
  };

  const isClosedStage = (stage) => stage === 'closed';
  const isUnknownStage = (stage) => stage === 'desconocido';

  // ---------------------------------------------------------------------
  // buildLotInsights — un lote a la vez
  // ---------------------------------------------------------------------

  /**
   * Construye el panorama agronómico de un lote combinando reloj biológico
   * (tiempo térmico) y riesgo de contaminación (exposición climática), sin
   * recalcular ninguno de los dos: se delega en biological-clock.js y
   * contamination-risk.js respectivamente.
   *
   * @param {object} params
   * @param {object} params.lot Forma libre; se leen alias comunes de Bitácora
   *   (id/codigo, especie/speciesId/sKey, estado/lifecycleState,
   *   fechaInoculacion/stageStartAt, sala/ubicacion/roomId).
   * @param {Array<object>} [params.series] Telemetría cruda del lote/sala
   *   [{t, temperature_c, rh_pct, co2_ppm}].
   * @param {object} [params.roomHistory] { contaminationEventsLast30d, pathogenIds }
   * @param {(string|number|Date)} params.now Instante de evaluación explícito.
   * @returns {object} { lotId, speciesId, stage, biologicalClock, contaminationRisk, alerts, confidence, enginesUsed, enginesMissing }
   */
  const buildLotInsights = ({ lot = {}, series = [], roomHistory = null, now } = {}) => {
    const engines = resolveEngines();
    const { enginesUsed, enginesMissing } = engineReport(engines);

    const l = lot || {};
    const lotId = l.id || l.codigo || l.lotId || null;
    const speciesId = l.speciesId || l.especie || l.sKey || l.speciesKey || null;
    const lifecycleState = l.lifecycleState || l.estado || l.status || null;
    const stage = normalizeStage(lifecycleState);
    const safeSeries = Array.isArray(series) ? series : [];
    const alerts = [];

    // Etapa desconocida (estado ausente, vacío o no reconocido): no se
    // invoca biological-clock.js con ella. Ese motor tiene su PROPIA tabla
    // de normalización (LIFECYCLE_STAGE_MAP) que no conoce 'desconocido' y
    // caería a 'incubation' por defecto, proyectando tiempo térmico y
    // generando la acción "listo_probable" como si el lote sí estuviera en
    // incubación real. Omitir la llamada aquí es lo que hace explícita la
    // regla "etapa desconocida -> sin acciones basadas en etapa" (ver
    // normalizeStage), en vez de heredar el valor por defecto de otro motor.
    let biologicalClock = null;
    if (engines.BiologicalClock && !isUnknownStage(stage)) {
      try {
        biologicalClock = engines.BiologicalClock.buildLotBiologicalClock(
          { id: lotId, speciesId, lifecycleState: stage, stageStartAt: l.stageStartAt || l.startAt || l.fechaInoculacion || l.inocDate || null },
          safeSeries,
          { now }
        );
        (biologicalClock.alerts || []).forEach((a) => alerts.push({ ...a, engine: 'biological-clock' }));
      } catch (e) {
        biologicalClock = null;
      }
    }

    let contaminationRisk = null;
    if (engines.ContaminationRisk) {
      try {
        contaminationRisk = engines.ContaminationRisk.assessLotRisk({
          lot: { id: lotId, stage, lifecycleState: stage, daysSinceInoculation: Number.isFinite(l.daysSinceInoculation) ? l.daysSinceInoculation : undefined, substratePh: l.substratePh },
          series: safeSeries,
          roomHistory,
          now: toMillis(now),
        });
        if (contaminationRisk.overallLevel === 'alto' || contaminationRisk.overallLevel === 'crítico') {
          alerts.push({
            level: contaminationRisk.overallLevel === 'crítico' ? 'critical' : 'warning',
            code: 'riesgo_contaminacion',
            message: `Riesgo de contaminación ${contaminationRisk.overallLevel} (score ${contaminationRisk.overallScore}/100) en lote ${lotId || 'sin ID'}: patógeno principal ${(contaminationRisk.pathogens[0] || {}).pathogenId || 'desconocido'}.`,
            engine: 'contamination-risk',
          });
        }
      } catch (e) {
        contaminationRisk = null;
      }
    }

    const confidence = combineConfidence(
      biologicalClock ? biologicalClock.projection && biologicalClock.projection.confidence : null,
      contaminationRisk ? contaminationRisk.confidence : null
    );

    return {
      lotId,
      speciesId,
      stage,
      biologicalClock,
      contaminationRisk,
      alerts,
      confidence: capConfidence(confidence),
      enginesUsed,
      enginesMissing,
    };
  };

  // ---------------------------------------------------------------------
  // recommendActions — "próximas mejores acciones" agregadas
  // ---------------------------------------------------------------------

  const PRIORITY_RANK = Object.freeze({ critical: 0, high: 1, normal: 2, low: 3 });

  const addHours = (ms, hours) => ms + hours * 3600000;
  const addDays = (ms, days) => ms + days * 86400000;

  const dedupeAndSort = (actions, cap) => {
    const seen = new Map();
    actions.forEach((a) => {
      if (!a || !a.id) return;
      if (!seen.has(a.id)) seen.set(a.id, a);
    });
    const list = Array.from(seen.values());
    list.sort((a, b) => {
      const pa = PRIORITY_RANK[a.priority] ?? 99;
      const pb = PRIORITY_RANK[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      const da = toMillis(a.dueAt);
      const db = toMillis(b.dueAt);
      if (Number.isFinite(da) && Number.isFinite(db) && da !== db) return da - db;
      return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
    });
    return Number.isFinite(cap) && cap > 0 ? list.slice(0, cap) : list;
  };

  /**
   * Construye la lista priorizada de próximas mejores acciones a partir del
   * estado agregado de todos los lotes/salas activos, el calendario de
   * cosecha proyectado y los compromisos comerciales.
   *
   * @param {object} params
   * @param {Array<object>} [params.lots] Lotes activos (forma libre, ver buildLotInsights).
   * @param {object} [params.seriesByRoom] { [roomId]: series[] } telemetría por sala.
   * @param {object} [params.roomHistoryByRoom] { [roomId]: roomHistory }
   * @param {Array<object>} [params.commitments] Compromisos comerciales (ver harvest-calendar.js matchDemand).
   * @param {(string|number|Date)} params.now
   * @param {number} [params.limit=12] Tope de acciones devueltas.
   * @returns {Array<object>} Acciones { id, kind, priority, title, why, lotId?, roomId?, dueAt, confidence, source }
   */
  const recommendActions = ({ lots = [], seriesByRoom = {}, roomHistoryByRoom = {}, commitments = [], now, limit = 12 } = {}) => {
    const engines = resolveEngines();
    const nowMs = toMillis(now);
    const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    const list = Array.isArray(lots) ? lots.filter(Boolean) : [];
    const actions = [];

    const roomIdOf = (lot) => lot.roomId || lot.sala || lot.ubicacion || lot.room || null;

    list.forEach((lot) => {
      const lotId = lot.id || lot.codigo || lot.lotId || 'lote-sin-id';
      const roomId = roomIdOf(lot);
      const lifecycleState = lot.lifecycleState || lot.estado || lot.status || null;
      const stage = normalizeStage(lifecycleState);
      if (isClosedStage(stage)) return; // lote cerrado: sin acciones de cultivo pendientes

      const series = (Array.isArray(lot.series) && lot.series.length)
        ? lot.series
        : (roomId && Array.isArray(seriesByRoom[roomId]) ? seriesByRoom[roomId] : []);
      const roomHistory = roomId ? roomHistoryByRoom[roomId] || null : null;

      const insights = buildLotInsights({ lot: { ...lot, roomId }, series, roomHistory, now });

      // --- Regla: telemetría insuficiente → "revisar sensores" ---
      const bcConfidence = insights.biologicalClock && insights.biologicalClock.projection ? insights.biologicalClock.projection.confidence : null;
      const bcStatus = insights.biologicalClock && insights.biologicalClock.projection ? insights.biologicalClock.projection.status : null;
      const crCoverage = insights.contaminationRisk && insights.contaminationRisk.coverage ? insights.contaminationRisk.coverage.coverageRatio : null;
      const noTelemetry = (bcStatus === 'sin_datos') && (!Number.isFinite(crCoverage) || crCoverage === 0);
      if (noTelemetry) {
        actions.push({
          id: `datos:${lotId}:${new Date(safeNowMs).toISOString().slice(0, 10)}`,
          kind: 'datos',
          priority: 'low',
          title: `Revisar sensores del lote ${lotId}`,
          why: `Sin telemetría suficiente de temperatura/humedad para proyectar el reloj biológico ni el riesgo de contaminación del lote ${lotId}${roomId ? ` (sala ${roomId})` : ''}.`,
          lotId,
          roomId: roomId || undefined,
          dueAt: toIso(addDays(safeNowMs, 1)),
          confidence: 'low',
          source: 'cultivation-copilot',
        });
      }

      // --- Regla: riesgo de contaminación alto/crítico → inspeccionar/ventilar ---
      if (insights.contaminationRisk && (insights.contaminationRisk.overallLevel === 'alto' || insights.contaminationRisk.overallLevel === 'crítico')) {
        const cr = insights.contaminationRisk;
        const top = cr.pathogens[0] || {};
        const critico = cr.overallLevel === 'crítico';
        const dueHours = critico ? 4 : 12;
        const topFactorLabels = (cr.topFactors || []).slice(0, 2).map((f) => f.label).join('; ');
        actions.push({
          id: `contaminacion:${lotId}:${cr.overallLevel}`,
          kind: 'contaminacion',
          priority: critico ? 'critical' : 'high',
          title: `Inspeccionar y ventilar lote ${lotId} (riesgo ${cr.overallLevel})`,
          why: `Índice heurístico de riesgo de contaminación ${cr.overallLevel} (score ${cr.overallScore}/100), patógeno principal ${top.pathogenId || 'desconocido'}. Factores: ${topFactorLabels || 'exposición climática acumulada'}.`,
          lotId,
          roomId: roomId || undefined,
          dueAt: toIso(addHours(safeNowMs, dueHours)),
          confidence: capConfidence(cr.confidence),
          source: 'contamination-risk',
        });
      }

      // --- Regla: estrés térmico (calor) → acción de clima ---
      const heatAlert = (insights.alerts || []).find((a) => a.code === 'heat_stress_sostenido');
      if (heatAlert) {
        actions.push({
          id: `clima:${lotId}:heat_stress`,
          kind: 'clima',
          priority: 'high',
          title: `Bajar temperatura de sala del lote ${lotId}`,
          why: heatAlert.message,
          lotId,
          roomId: roomId || undefined,
          dueAt: toIso(addHours(safeNowMs, 2)),
          confidence: capConfidence(insights.biologicalClock && insights.biologicalClock.projection ? insights.biologicalClock.projection.confidence : 'low'),
          source: 'biological-clock',
        });
      }

      // --- Regla: reloj biológico 'listo_probable' → chequeo de transición de etapa (nunca auto-transición) ---
      if (bcStatus === 'listo_probable') {
        const proj = insights.biologicalClock.projection;
        actions.push({
          id: `etapa:${lotId}:${proj.stage}:listo_probable`,
          kind: 'etapa',
          priority: 'normal',
          title: `Verificar avance de etapa del lote ${lotId} (${proj.stage === 'incubation' ? 'incubación' : 'inducción/fructificación'})`,
          why: `Tiempo térmico acumulado alcanzó ${proj.progressPct}% del requerimiento estimado de la etapa (${proj.effectiveDegreeHours} °h de ${proj.requiredHours} °h). Sugerido: verificar en persona antes de avanzar de etapa — este copiloto no transiciona lotes automáticamente.`,
          lotId,
          roomId: roomId || undefined,
          dueAt: toIso(addHours(safeNowMs, 6)),
          confidence: capConfidence(bcConfidence),
          source: 'biological-clock',
        });
      }
    });

    // --- Regla: eventos de cosecha en ventana → acción de cosecha ---
    let harvestCalendar = null;
    if (engines.HarvestCalendar) {
      try {
        harvestCalendar = engines.HarvestCalendar.buildHarvestCalendar({ lots: list, commitments, now });
      } catch (e) {
        harvestCalendar = null;
      }
    }

    if (harvestCalendar) {
      (harvestCalendar.events || []).forEach((ev) => {
        if (ev.status !== 'en_ventana') return;
        const lot = list.find((l) => (l.id || l.codigo || l.lotId) === ev.lotId);
        const roomId = lot ? roomIdOf(lot) : null;
        actions.push({
          id: `cosecha:${ev.lotId}:f${ev.flush}`,
          kind: 'cosecha',
          priority: 'high',
          title: `Cosechar lote ${ev.lotId} (oleada ${ev.flush})`,
          why: `Ventana de cosecha activa (${ev.windowStart} a ${ev.windowEnd}), ~${ev.kgExpected} kg esperados (rango ${ev.kgLow}–${ev.kgHigh} kg) según proyección del modelo de oleadas.`,
          lotId: ev.lotId,
          roomId: roomId || undefined,
          dueAt: toIso(new Date(`${ev.windowEnd}T23:59:59Z`).getTime()),
          confidence: capConfidence(harvestCalendar.confidence),
          source: 'harvest-calendar',
        });
      });

      // --- Regla: semana(s) con déficit de demanda → sugerencia de siembra ---
      if (harvestCalendar.demand && Array.isArray(harvestCalendar.demand.alerts)) {
        harvestCalendar.demand.alerts.slice(0, 3).forEach((deficitWeek) => {
          let sowing = null;
          if (engines.FlushForecast && typeof engines.FlushForecast.calculateSowingRequirement === 'function') {
            const dominantSpecies = list.length
              ? (list[0].especie || list[0].speciesId || list[0].sKey || 'p_ostreatus_gris')
              : 'p_ostreatus_gris';
            try {
              sowing = engines.FlushForecast.calculateSowingRequirement(deficitWeek.deficitKg, dominantSpecies, {});
            } catch (e) {
              sowing = null;
            }
          }
          actions.push({
            id: `demanda:${deficitWeek.week}`,
            kind: 'demanda',
            priority: 'normal',
            title: `Programar siembra adicional para la semana ${deficitWeek.week}`,
            why: sowing
              ? sowing.message
              : `Déficit proyectado de ${deficitWeek.deficitKg} kg en la semana ${deficitWeek.week} (oferta ${deficitWeek.supply} kg vs. demanda comprometida ${deficitWeek.demand} kg).`,
            dueAt: toIso(safeNowMs), // el déficit ya está identificado: la decisión de siembra es urgente, no la fecha del evento
            confidence: 'low', // combina proyección de calendario + proyección de siembra: nunca supera 'low' aquí
            source: 'harvest-calendar+flush-forecast-engine',
          });
        });
      }
    }

    return dedupeAndSort(actions, limit);
  };

  // ---------------------------------------------------------------------
  // toTasks — proyección de acciones a tareas de task-engine.js
  // ---------------------------------------------------------------------

  // Mapa de traducción a los tipos cerrados de task-engine.js (TASK_TYPES).
  // El copiloto sugiere ideas nuevas ('clima', 'demanda', 'datos') que ese
  // catálogo no anticipó; se aproximan al tipo existente más parecido en vez
  // de ampliar TASK_TYPES aquí (eso es decisión de task-engine.js, no de este
  // módulo). 'cosecha' y 'contaminacion'/'etapa' sí tienen tipo dedicado o
  // casi-dedicado.
  const KIND_TO_TASK_TYPE = Object.freeze({
    clima: 'inspection',
    contaminacion: 'inspection',
    etapa: 'colonization_check',
    cosecha: 'harvest',
    demanda: 'inspection',
    datos: 'inspection',
  });

  const KIND_TO_OBJECT_TYPE = Object.freeze({
    clima: 'room',
    contaminacion: 'batch',
    etapa: 'batch',
    cosecha: 'batch',
    demanda: 'inventory',
    datos: 'batch',
  });

  /**
   * Convierte acciones de recommendActions() en tareas de task-engine.js
   * (SetasTaskEngine.createTask), si ese motor está disponible.
   *
   * @param {Array<object>} actions Salida de recommendActions().
   * @param {object} [opts] { now } — reservado para futura lógica de vencimiento relativo a `now`.
   * @returns {Array<object>} Tareas canónicas (o [] si SetasTaskEngine no está disponible).
   */
  const toTasks = (actions = [], opts = {}) => {
    const engines = resolveEngines();
    if (!engines.TaskEngine || typeof engines.TaskEngine.createTask !== 'function') return [];

    const list = Array.isArray(actions) ? actions : [];
    const tasks = [];
    list.forEach((action) => {
      if (!action) return;
      const objectId = action.lotId || action.roomId || action.id;
      if (!objectId) return;
      const type = KIND_TO_TASK_TYPE[action.kind] || 'inspection';
      const objectType = KIND_TO_OBJECT_TYPE[action.kind] || 'batch';
      try {
        tasks.push(engines.TaskEngine.createTask({
          type,
          objectType,
          objectId,
          dueAt: action.dueAt,
          priority: action.priority || 'normal',
          reason: `${action.title} — ${action.why}`,
          generatedBy: { source: 'copiloto' },
        }));
      } catch (e) {
        // Una acción con forma inesperada no debe tumbar la conversión de las demás.
      }
    });
    return tasks;
  };

  // ---------------------------------------------------------------------
  // buildCopilotBriefing — resumen operativo de una sola vista
  // ---------------------------------------------------------------------

  const DISCLAIMER =
    'Copiloto de cultivo: sugerencias heurísticas compuestas a partir de motores de Setas OS ' +
    '(reloj biológico térmico, riesgo de contaminación, tamizaje visual y calendario de cosecha). ' +
    'No diagnostica, no transiciona lotes ni ejecuta acciones — toda sugerencia requiere revisión ' +
    'y decisión de un operario. Confianza siempre baja o media, nunca alta (ver agronomic-claims).';

  /**
   * Construye el resumen ("briefing") de una sola vista para el cockpit de
   * Hoy: titular en español, acciones priorizadas, resumen del calendario de
   * cosecha y riesgo por sala.
   *
   * @param {object} input Mismos parámetros que recommendActions(), más
   *   `harvestDaysAhead` (default 14) para el resumen de cosecha.
   * @returns {object} { headline, actions, harvestCalendar, riskByRoom, enginesUsed, enginesMissing, confidence, disclaimer }
   */
  const buildCopilotBriefing = (input = {}) => {
    const engines = resolveEngines();
    const { enginesUsed, enginesMissing } = engineReport(engines);
    const nowMs = toMillis(input.now);
    const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    const lots = Array.isArray(input.lots) ? input.lots.filter(Boolean) : [];
    const seriesByRoom = input.seriesByRoom || {};
    const roomHistoryByRoom = input.roomHistoryByRoom || {};
    const commitments = input.commitments || [];
    const harvestDaysAhead = Number.isFinite(input.harvestDaysAhead) ? input.harvestDaysAhead : 14;

    const actions = recommendActions({ lots, seriesByRoom, roomHistoryByRoom, commitments, now: input.now, limit: input.limit });

    // --- Resumen de calendario de cosecha (próximos N días) ---
    let harvestSummary = { kgNext14d: 0, nextDeficitWeek: null, confidence: 'low', basis: null };
    if (engines.HarvestCalendar) {
      try {
        const cal = engines.HarvestCalendar.buildHarvestCalendar({ lots, commitments, now: input.now, horizonDays: Math.max(56, harvestDaysAhead) });
        const horizonEndMs = addDays(safeNowMs, harvestDaysAhead);
        const kgWindow = (cal.days || [])
          .filter((d) => {
            const dMs = toMillis(`${d.key}T00:00:00Z`);
            return Number.isFinite(dMs) && dMs >= safeNowMs - 86400000 && dMs <= horizonEndMs;
          })
          .reduce((sum, d) => sum + (d.kgExpected || 0), 0);
        const nextDeficit = (cal.demand && cal.demand.alerts && cal.demand.alerts[0]) || null;
        harvestSummary = {
          kgNext14d: round1(kgWindow),
          nextDeficitWeek: nextDeficit ? { week: nextDeficit.week, deficitKg: nextDeficit.deficitKg, supply: nextDeficit.supply, demand: nextDeficit.demand } : null,
          confidence: capConfidence(cal.confidence),
          basis: cal.basis,
        };
      } catch (e) {
        harvestSummary = { kgNext14d: 0, nextDeficitWeek: null, confidence: 'low', basis: null };
      }
    }

    // --- Riesgo de contaminación por sala ---
    const riskByRoom = {};
    if (engines.ContaminationRisk) {
      const roomIds = new Set();
      lots.forEach((l) => {
        const rid = l.roomId || l.sala || l.ubicacion || l.room;
        if (rid) roomIds.add(rid);
      });
      Object.keys(seriesByRoom).forEach((rid) => roomIds.add(rid));

      roomIds.forEach((roomId) => {
        const roomLots = lots.filter((l) => (l.roomId || l.sala || l.ubicacion || l.room) === roomId);
        try {
          riskByRoom[roomId] = engines.ContaminationRisk.assessRoomRisk({
            roomId,
            lots: roomLots.map((l) => ({ id: l.id || l.codigo || l.lotId, stage: normalizeStage(l.lifecycleState || l.estado || l.status), series: Array.isArray(l.series) ? l.series : undefined })),
            series: seriesByRoom[roomId] || [],
            roomHistory: roomHistoryByRoom[roomId] || null,
            now: safeNowMs,
          });
        } catch (e) {
          riskByRoom[roomId] = null;
        }
      });
    }

    // --- Titular (1 sola frase, en español) ---
    const critCount = actions.filter((a) => a.priority === 'critical').length;
    const highCount = actions.filter((a) => a.priority === 'high').length;
    const accionPlural = (n) => (n === 1 ? 'acción' : 'acciones');
    let headline;
    if (critCount > 0) {
      headline = `${critCount} ${accionPlural(critCount)} crítica${critCount === 1 ? '' : 's'} requiere${critCount === 1 ? '' : 'n'} atención inmediata: revisa la lista de abajo antes de continuar la ronda.`;
    } else if (highCount > 0) {
      headline = `${highCount} ${accionPlural(highCount)} de prioridad alta pendiente${highCount === 1 ? '' : 's'} — sin incidencias críticas por ahora.`;
    } else if (actions.length > 0) {
      headline = `${actions.length} sugerencia${actions.length === 1 ? '' : 's'} de rutina del copiloto; operación dentro de lo esperado.`;
    } else {
      headline = 'Sin sugerencias del copiloto en este momento: lotes y salas dentro de lo esperado con los datos disponibles.';
    }

    const overallConfidence = capConfidence(combineConfidence(...actions.map((a) => a.confidence), harvestSummary.confidence));

    return {
      headline,
      actions,
      harvestCalendar: harvestSummary,
      riskByRoom,
      enginesUsed,
      enginesMissing,
      confidence: overallConfidence,
      disclaimer: DISCLAIMER,
    };
  };

  const api = {
    normalizeStage,
    buildLotInsights,
    recommendActions,
    toTasks,
    buildCopilotBriefing,
    DISCLAIMER,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasCultivationCopilot = api;
  if (typeof window !== 'undefined') window.SetasCultivationCopilot = api;
})();
