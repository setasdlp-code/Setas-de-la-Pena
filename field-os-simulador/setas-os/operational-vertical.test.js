'use strict';

/**
 * @file operational-vertical.test.js — Prueba de integración vertical de Setas OS.
 *
 * Los tests existentes (batch-sheet.test.js, task-engine.test.js, day-close.test.js,
 * setas-os-workflow.test.js) prueban cada módulo puro por separado: la arquitectura
 * modular. Este archivo prueba otra cosa — que una jornada real de cultivo se puede
 * ejecutar de principio a fin ENCADENANDO esos módulos sin reconstruir nada después
 * desde memoria, papel o WhatsApp. Es el criterio de éxito nuevo.
 *
 * Reloj: siempre inyectado, nunca Date.now() real. Arranca un día fijo y avanza en
 * pasos explícitos de `DIA` milisegundos para simular el paso del tiempo operativo.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const sheetApi = require('./batch-sheet.js');
const taskApi = require('./task-engine.js');
const dayCloseApi = require('./day-close.js');
const workflow = require('./setas-os-workflow.js');

const DIA = 86400000;
let ahora = Date.parse('2026-09-16T07:00:00-05:00');
const iso = ms => new Date(ms).toISOString();

// ---------------------------------------------------------------------------
// ESCENARIO 1 — el ciclo completo del lote
// ---------------------------------------------------------------------------

test('escenario 1: el ciclo completo del lote se recorre de planned a closed sin romper el historial', () => {
  let t = ahora;
  const operatorId = 'op-maria';

  let lote = {
    id: 'LOTE_E2E_1',
    codigo: 'OST-260916-01',
    especie: 'Ostra gris',
    sKey: 'p_ostreatus_gris',
    lifecycleState: 'planned',
    sala: null,
    numBolsas: 4,
    peseSeco: 8,
    recipeRef: null,
    spawnLotId: null,
    ingredientLots: [],
  };
  let bolsas = [
    { id: 'B1', loteId: 'LOTE_E2E_1', codigo: 'OST-260916-01-B01', estado: 'sana' },
    { id: 'B2', loteId: 'LOTE_E2E_1', codigo: 'OST-260916-01-B02', estado: 'sana' },
    { id: 'B3', loteId: 'LOTE_E2E_1', codigo: 'OST-260916-01-B03', estado: 'sana' },
    { id: 'B4', loteId: 'LOTE_E2E_1', codigo: 'OST-260916-01-B04', estado: 'sana' },
  ];
  let cosechas = [];
  let log = [];
  const transitionsSeen = [];

  const build = () => sheetApi.buildBatchSheet({ lote, bolsas, cosechas, events: log, nowMs: t });

  // Ejecuta una acción de campo real: construye la ficha, comprueba que la acción
  // está entre las ofrecidas AHORA, declara consecuencias y las aplica. Esto es
  // exactamente lo que la UI de campo hace en un solo toque.
  const doAction = (action, payload, extra = {}) => {
    const sheet = build();
    assert.ok(
      sheet.actions.some(a => a.action === action),
      `"${action}" debe estar disponible en estado "${sheet.state}"`
    );
    const consequences = sheetApi.actionConsequences(sheet, action, payload, {
      operatorId, at: iso(t), bolsas: bolsas.filter(b => b.loteId === lote.id), ...extra,
    });
    const result = sheetApi.applyConsequences(sheet, consequences, { log });
    log = result.log;
    lote = Object.assign({}, lote, { lifecycleState: result.state }, consequences.batchPatch);
    if (consequences.bagUpdates.length) {
      bolsas = bolsas.map(b => {
        const u = consequences.bagUpdates.find(x => x.bagId === b.id);
        return u ? Object.assign({}, b, u.fields) : b;
      });
    }
    if (result.state !== sheet.state) transitionsSeen.push(result.state);
    return sheet;
  };

  // LÍMITE ACTUAL: actionConsequences() sólo traduce a `transition` las acciones
  // 'contamination', 'colonization', 'move' y 'advance_stage' — para
  // 'prepare_mix', 'start_thermal_treatment', 'complete_thermal_treatment',
  // 'inoculate' y 'discard' IGNORA el `transitionsTo` que sí está declarado en
  // ACTION_CATALOG (batch-sheet.js), así que llamarlas vía
  // actionConsequences+applyConsequences registra el evento pero NO mueve el
  // estado del lote — se queda en el estado anterior. applyAction() sí respeta
  // ACTION_CATALOG.transitionsTo. Este test usa applyAction() para esas cinco
  // acciones y actionConsequences+applyConsequences para el resto, que es lo que
  // la API real permite hoy sin reconstruir la transición a mano.
  const doCatalogTransitionAction = (action, payload) => {
    const sheet = build();
    assert.ok(
      sheet.actions.some(a => a.action === action),
      `"${action}" debe estar disponible en estado "${sheet.state}"`
    );
    const result = sheetApi.applyAction({ sheet, action, operatorId, payload, log, at: iso(t) });
    log = result.log;
    lote = Object.assign({}, lote, { lifecycleState: result.state });
    if (result.transitioned) transitionsSeen.push(result.state);
    return sheet;
  };

  // 1. crear lote (planned) → preparar mezcla
  doCatalogTransitionAction('prepare_mix', { recetaId: 'R-OST-01' });
  lote.recipeRef = { id: 'R-OST-01', name: 'Ostra en paja', version: 1 };
  assert.equal(lote.lifecycleState, 'mix_prepared');
  t += DIA;

  // 2. tratamiento térmico
  doCatalogTransitionAction('start_thermal_treatment', {});
  assert.equal(lote.lifecycleState, 'thermal_treatment');
  t += DIA;

  // 3. cierre del tratamiento → enfriamiento
  doCatalogTransitionAction('complete_thermal_treatment', {});
  assert.equal(lote.lifecycleState, 'cooling');
  t += DIA;

  // 4. inocular
  doCatalogTransitionAction('inoculate', { spawnLotId: 'SPW-260916-01' });
  lote.spawnLotId = 'SPW-260916-01';
  assert.equal(lote.lifecycleState, 'inoculated');
  t += DIA;

  // LÍMITE ACTUAL: batch-sheet.ACTION_PRIORITY['inoculated'] es
  // ['inspection','contamination','photo','move'] — no incluye 'advance_stage', y
  // setas-os-workflow.ACTIONS_BY_STATE['inoculated'] tampoco lo incluye. No existe
  // ninguna acción de campo, vía contextualActions/actionConsequences/applyAction,
  // que mueva un lote de 'inoculated' a 'incubation'. Es un salto de estado sin
  // acción operativa asociada en la API actual. Para poder seguir recorriendo el
  // ciclo de vida completo, este test hace la transición directamente con
  // setas-os-workflow.transitionEvent (el mismo primitivo que applyConsequences usa
  // por debajo), y la encadena a mano con appendBatchEvent — no es un camino que un
  // operario de campo pueda tomar hoy con la ficha.
  {
    const sheet = build();
    const transition = workflow.transitionEvent({
      batchId: lote.id, from: sheet.state, to: 'incubation', operatorId, at: iso(t),
      reason: 'inicio de incubación (transición sin acción de campo asociada)',
    });
    log = sheetApi.appendBatchEvent(log, {
      batchId: lote.id, action: 'advance_stage', type: 'batch_state_transition',
      operatorId, at: transition.at, payload: { from: transition.from, to: transition.to, reason: transition.reason },
    });
    lote = Object.assign({}, lote, { lifecycleState: 'incubation' });
    transitionsSeen.push('incubation');
  }
  assert.equal(build().state, 'incubation');
  t += DIA;

  // 5. inspeccionar (colonización 100%: en incubación es la acción de inspección de
  // campo real, disponible en ACTION_PRIORITY — 'inspection' puro no lo está para
  // este estado, ver nota en escenario 3) y avanza a la siguiente etapa
  doAction('colonization', { porcentaje: 100 });
  assert.equal(lote.lifecycleState, 'maturation'); // primer destino válido desde incubation
  t += DIA;

  // 6. inspección de campo (aquí sí está disponible como acción propia)
  doAction('inspection', { observacion: 'colonización uniforme, sin olores extraños' });
  t += DIA;

  // 7. mover de sala
  doAction('move', { salaDestinoId: 'fructificacion_02' });
  assert.equal(lote.sala, 'fructificacion_02');
  t += DIA;

  // 8. avanzar hacia fructificación (maturation → induction → fruiting: el motor
  // sólo ofrece el primer destino válido de DEFAULT_TRANSITIONS, así que llegar a
  // 'fruiting' exige dos pasos de avance, no uno)
  doAction('advance_stage', {});
  assert.equal(lote.lifecycleState, 'induction');
  t += DIA;
  doAction('advance_stage', {});
  assert.equal(lote.lifecycleState, 'fruiting');
  t += DIA;

  // 9. cosechar
  doAction('harvest', { pesoFresco: 1500, flush: 1 });
  cosechas = [...cosechas, { id: 'C1', loteId: lote.id, flush: 1, fecha: iso(t), pesoFresco: '1500', calidad: 4 }];
  t += DIA;

  // LÍMITE ACTUAL: actionConsequences('advance_stage', …) sólo puede proponer el
  // PRIMER destino de DEFAULT_TRANSITIONS[estado] (firstValidAdvanceTransition);
  // desde 'fruiting' ese primer destino es 'resting', no 'closed', y desde
  // 'resting' es 'fruiting' de nuevo — con esa función nunca se llega a 'closed'.
  // applyAction sí acepta un `targetState` explícito que se valida contra
  // workflow.canTransition, así que el cierre real de un lote sólo es alcanzable
  // hoy por esa vía, no por actionConsequences/applyConsequences.
  {
    const sheet = build();
    const applied = sheetApi.applyAction({
      sheet, action: 'advance_stage', operatorId, at: iso(t), targetState: 'closed',
    });
    log = applied.log;
    lote = Object.assign({}, lote, { lifecycleState: applied.state });
    transitionsSeen.push(applied.state);
  }
  assert.equal(lote.lifecycleState, 'closed');

  // El historial nunca se rompió, a pesar de mezclar los dos caminos (el normal vía
  // applyConsequences y el de los dos límites documentados arriba).
  assert.equal(sheetApi.verifyEventChain(log).valid, true);

  // La secuencia de transiciones ocurrió en el orden esperado del ciclo de vida.
  assert.deepEqual(transitionsSeen, [
    'mix_prepared', 'thermal_treatment', 'cooling', 'inoculated', 'incubation',
    'maturation', 'induction', 'fruiting', 'closed',
  ]);

  const final = build();
  assert.equal(final.state, 'closed');
  assert.equal(final.stateLabel, 'Cerrado');
  // Con receta, semilla, cosecha y eventos, la trazabilidad debe ser alta (sólo la
  // sala vinculada por id-de-sala real falta, pues 'fructificacion_02' no resuelve
  // a un objeto `room`, así que sigue contando como enlazada porque roomId existe).
  assert.ok(final.completenessPct >= 80, `completenessPct=${final.completenessPct}`);
});

// ---------------------------------------------------------------------------
// ESCENARIO 2 — la cascada de la contaminación
// ---------------------------------------------------------------------------

test('escenario 2: una sola decisión de aislar produce todas las consecuencias encadenadas', () => {
  const t0 = ahora;
  const operatorId = 'op-julian';

  const lote2 = {
    id: 'LOTE_E2E_2', codigo: 'SHI-260910-05', especie: 'Shiitake', sKey: 'shiitake',
    lifecycleState: 'incubation', sala: 'incubacion_03', numBolsas: 50,
    recipeRef: { id: 'R-SHI-01', version: 2 }, spawnLotId: 'SPW-260910-01',
  };
  const bolsas2 = Array.from({ length: 50 }, (_, i) => ({
    id: `B${i + 1}`, loteId: 'LOTE_E2E_2',
    codigo: `SHI-260910-05-B${String(i + 1).padStart(2, '0')}`, estado: 'sana',
  }));

  // Escanear B17 en campo resuelve a la bolsa y a su lote — no a un menú genérico.
  const scan = sheetApi.resolveScan('SHI-260910-05-B17', { lotes: [lote2], bolsas: bolsas2 });
  assert.equal(scan.kind, 'bag');
  assert.equal(scan.bagId, 'B17');
  assert.equal(scan.batchId, 'LOTE_E2E_2');

  const sheet = sheetApi.buildBatchSheet({ lote: lote2, bolsas: bolsas2, nowMs: t0 });
  assert.ok(sheet.actions.some(a => a.action === 'contamination'));
  assert.equal(sheet.bagsActive, 50);
  assert.equal(sheet.bagsIsolated, 0);

  // UNA sola acción: registrar contaminación con decisión "aislar" sobre B17.
  const consequences = sheetApi.actionConsequences(sheet, 'contamination', {
    foto: 'data:image/jpeg;base64,ZZZ', extension: '1_bolsa', ubicacion: 'costado de la bolsa',
    decision: 'aislar', bagIds: ['B17'],
  }, { operatorId, at: iso(t0), bolsas: bolsas2 });

  const applied = sheetApi.applyConsequences(sheet, consequences, { log: [] });

  // 1) el evento quedó en el log, encadenado.
  assert.equal(applied.log.length, 1);
  assert.equal(applied.log[0].action, 'contamination');
  assert.equal(sheetApi.verifyEventChain(applied.log).valid, true);

  // 2) B17 pasó a estado 'aislada' vía bagUpdates.
  assert.equal(consequences.bagUpdates.length, 1);
  assert.equal(consequences.bagUpdates[0].bagId, 'B17');
  assert.equal(consequences.bagUpdates[0].fields.estado, 'aislada');
  const bolsas2Tras = bolsas2.map(b => (b.id === 'B17' ? Object.assign({}, b, { estado: 'aislada' }) : b));

  // 3) contador de activas baja, aisladas sube.
  assert.equal(consequences.batchPatch.bagsActive, 49);
  assert.equal(consequences.batchPatch.bagsIsolated, 1);
  const sheetTras = sheetApi.buildBatchSheet({ lote: lote2, bolsas: bolsas2Tras, nowMs: t0 });
  assert.equal(sheetTras.bagsActive, 49);
  assert.equal(sheetTras.bagsIsolated, 1);
  // La ficha muestra la anomalía de aislamiento, sin necesidad de otro registro.
  assert.ok(sheetTras.anomalies.some(a => a.kind === 'isolation'));

  // 4) se generó un followUp de reinspección a D+3.
  assert.equal(consequences.followUps.length, 1);
  assert.equal(consequences.followUps[0].type, 'reinspection');
  assert.equal(consequences.followUps[0].offsetDays, 3);

  // 5) ese followUp, pasado por tasksFromFollowUps, produce una Tarea real.
  //
  // LÍMITE ACTUAL: actionConsequences('contamination', …) pone
  // `followUps[i].generatedBy = 'contamination'` (un string plano), pero
  // task-engine.createTask exige `generatedBy` con forma `{source, ref}` — y
  // tasksFromFollowUps sólo aplica su valor por defecto `{source:'operator',...}`
  // cuando `fu.generatedBy` es falsy, así que un string no-vacío pasa de largo
  // ese default y createTask lanza `generatedBy.source desconocido: undefined`.
  // Pasar el followUp de batch-sheet.js tal cual a tasksFromFollowUps ROMPE hoy.
  // Este test normaliza la forma antes de llamarlo, como tendría que hacerlo
  // cualquier capa de integración real mientras no se corrija en el origen.
  const followUpsNormalizados = consequences.followUps.map(fu => Object.assign({}, fu, {
    generatedBy: { source: 'operator', ref: fu.generatedBy || null },
  }));
  const tasks = taskApi.tasksFromFollowUps(followUpsNormalizados, { objectId: lote2.id, at: iso(t0) });
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].type, 'reinspection');
  assert.equal(tasks[0].dueAt, iso(t0 + 3 * DIA));

  // 6) esa tarea aparece en Hoy tres días después, y NO antes: antes de D+3 su
  // vencimiento aún no ha llegado, por lo que classifyTodayItem la manda a 'later'
  // (no es accionable hoy); en D+3 ya vence "ahora" o está vencida.
  const index = { batches: { [lote2.id]: { code: lote2.codigo, room: lote2.sala } }, rooms: { incubacion_03: { name: 'Incubación 3' } } };
  const hoyAntes = taskApi.buildTodayFromTasks(tasks, index, t0 + DIA); // D+1
  assert.equal(hoyAntes.find(r => r.taskId === tasks[0].id).bucket, 'later');

  const hoyEnPunto = taskApi.buildTodayFromTasks(tasks, index, t0 + 3 * DIA); // D+3 exacto
  const filaEnPunto = hoyEnPunto.find(r => r.taskId === tasks[0].id);
  assert.ok(['now', 'overdue'].includes(filaEnPunto.bucket), `bucket=${filaEnPunto.bucket}`);
});

// ---------------------------------------------------------------------------
// ESCENARIO 3 — inoculación programa el trabajo futuro
// ---------------------------------------------------------------------------

test('escenario 3: inocular programa tareas SOP que aparecen, se cumplen y no se duplican', () => {
  const t0 = ahora;
  const batchId = 'LOTE_E2E_3';
  const operatorId = 'op-carla';
  const index = { batches: { [batchId]: { code: 'ENO-260916-02', room: 'incubacion_01' } }, rooms: { incubacion_01: { name: 'Incubación 1' } } };

  // Al inocular, tasksFromTransition genera las tareas SOP para 'inoculated':
  // inspección D+7, inspección D+14, verificación de colonización D+21.
  const sopTasks = taskApi.tasksFromTransition({ batchId, toState: 'inoculated', at: iso(t0), nowMs: t0 });
  assert.equal(sopTasks.length, 3);

  let tasks = taskApi.mergeTasks([], sopTasks);

  // En D+0 ninguna de esas tareas aparece como vencida.
  const hoyD0 = taskApi.buildTodayFromTasks(tasks, index, t0);
  assert.equal(hoyD0.filter(r => r.bucket === 'overdue').length, 0, 'nada debe estar vencido el día de la inoculación');

  // En D+7 la primera inspección aparece en Hoy, en el bucket de vencida o de ahora.
  const t7 = t0 + 7 * DIA;
  const hoyD7 = taskApi.buildTodayFromTasks(tasks, index, t7);
  const primeraInspeccion = tasks.find(x => x.reason.includes('D+7'));
  const filaD7 = hoyD7.find(r => r.taskId === primeraInspeccion.id);
  assert.ok(['now', 'overdue'].includes(filaD7.bucket), `bucket=${filaD7.bucket}`);

  // Registrar la inspección y cerrarla con completeTask la saca de Hoy.
  const eventoInspeccion = { batchId, action: 'inspection', operatorId, at: iso(t7), payload: { observacion: 'colonización al 60%' } };
  const log = sheetApi.appendBatchEvent([], eventoInspeccion);
  tasks = taskApi.completeTask(tasks, primeraInspeccion.id, log[0].id);
  const hoyTrasCompletar = taskApi.buildTodayFromTasks(tasks, index, t7);
  assert.equal(hoyTrasCompletar.some(r => r.taskId === primeraInspeccion.id), false);

  // mergeTasks aplicado dos veces sobre la misma transición no duplica filas en Hoy.
  const tasksTrasSegundoMerge = taskApi.mergeTasks(tasks, sopTasks);
  assert.equal(tasksTrasSegundoMerge.length, tasks.length, 'no debe crecer: la tarea ya completada no se reabre ni se duplica');
  const hoyTrasDobleMerge = taskApi.buildTodayFromTasks(tasksTrasSegundoMerge, index, t7);
  assert.equal(hoyTrasDobleMerge.some(r => r.taskId === primeraInspeccion.id), false, 'la completada sigue sin reaparecer tras el segundo merge');
});

// ---------------------------------------------------------------------------
// ESCENARIO 4 — la jornada se cierra y el relevo recibe contexto
// ---------------------------------------------------------------------------

test('escenario 4: la jornada no cierra con cambios sin sincronizar, y cierra con contexto para el relevo', () => {
  const t0 = ahora;
  const shiftStartMs = t0;
  const shiftEndMs = t0 + 8 * 3600 * 1000; // turno de 8 horas
  const operatorId = 'op-julian';

  // Reutiliza el lote con la bolsa aislada del escenario 2, para que el relevo
  // reciba ese contexto en la nota de cierre.
  const lote2 = {
    id: 'LOTE_E2E_2', codigo: 'SHI-260910-05', lifecycleState: 'incubation', sala: 'incubacion_03',
  };
  const bolsas2Aislada = [{ id: 'B17', loteId: 'LOTE_E2E_2', estado: 'aislada' }];
  const sheetConAisladas = sheetApi.buildBatchSheet({ lote: lote2, bolsas: bolsas2Aislada, nowMs: shiftEndMs });

  const events = [
    { type: 'contamination', at: iso(shiftStartMs + 3600000), batchId: 'LOTE_E2E_2' },
  ];
  const tasks = taskApi.tasksFromFollowUps(
    [{ type: 'reinspection', offsetDays: 3, priority: 'high', reason: 'Reinspección tras contaminación: se decidió aislar las bolsas afectadas', generatedBy: { source: 'operator', ref: null } }],
    { objectId: 'LOTE_E2E_2', at: iso(shiftStartMs) },
  );

  // Con 2 cambios sin sincronizar, readyToClose es false y closeDay lanza: es la
  // única garantía de no perder trabajo capturado en campo antes de llegar al
  // servidor.
  const reporteBloqueado = dayCloseApi.buildDayCloseReport({
    events, tasks, sheets: [sheetConAisladas], pendingSyncCount: 2,
    shiftStartMs, nowMs: shiftEndMs, operatorId,
  });
  assert.equal(reporteBloqueado.readyToClose, false);
  assert.throws(() => dayCloseApi.closeDay(reporteBloqueado, { operatorId, at: shiftEndMs }), /sin sincronizar/);

  // Con 0 pendientes, cierra, y la nota de relevo menciona el lote con la bolsa aislada.
  const reporteListo = dayCloseApi.buildDayCloseReport({
    events, tasks, sheets: [sheetConAisladas], pendingSyncCount: 0,
    shiftStartMs, nowMs: shiftEndMs, operatorId,
  });
  assert.equal(reporteListo.readyToClose, true);
  const cierre = dayCloseApi.closeDay(reporteListo, { operatorId, at: shiftEndMs });
  assert.equal(cierre.closed, true);

  const nota = dayCloseApi.buildHandoffNote(reporteListo);
  assert.match(nota, /SHI-260910-05/, 'la nota de relevo debe nombrar el lote con la bolsa aislada');
  // buildHandoffNote imprime `detail`, no `kind`: el texto legible de la anomalía
  // de aislamiento, no la palabra clave interna 'isolation'.
  assert.match(nota, /bolsa\(s\) aislada\(s\) en observación/);

  // El trabajo de mañana (la reinspección a D+3, que cae dentro de las próximas
  // 24h desde el cierre sólo si el turno cierra cerca de esa ventana — aquí el
  // cierre es el mismo día, así que la reinspección de D+3 NO cae en "tomorrow";
  // se agrega una tarea que sí vence dentro de las próximas 24h para comprobar
  // que "tomorrow" sí la recoge.
  const tareaManana = taskApi.createTask({
    type: 'inspection', objectType: 'batch', objectId: 'LOTE_E2E_2',
    dueAt: iso(shiftEndMs + 4 * 3600 * 1000), priority: 'normal', reason: 'Inspección de rutina',
  });
  const reporteConManana = dayCloseApi.buildDayCloseReport({
    events, tasks: [...tasks, tareaManana], sheets: [sheetConAisladas], pendingSyncCount: 0,
    shiftStartMs, nowMs: shiftEndMs, operatorId,
  });
  assert.ok(reporteConManana.tomorrow.some(g => g.type === 'inspection' && g.objectIds.includes('LOTE_E2E_2')));
});

// ---------------------------------------------------------------------------
// ESCENARIO 5 — Hoy responde las cuatro preguntas
// ---------------------------------------------------------------------------

test('escenario 5: cada fila de Hoy responde qué, dónde, por qué y qué acción tomar', () => {
  const t0 = ahora;
  const batchId = 'LOTE_E2E_5';
  const index = {
    batches: { [batchId]: { code: 'REI-260916-09', room: 'fructificacion_01' } },
    rooms: { fructificacion_01: { name: 'Fructificación 1' } },
  };

  const tasks = taskApi.tasksFromTransition({ batchId, toState: 'fruiting', at: iso(t0), nowMs: t0 });
  assert.ok(tasks.length > 0);

  const hoy = taskApi.buildTodayFromTasks(tasks, index, t0);
  assert.ok(hoy.length > 0);

  hoy.forEach(fila => {
    ['what', 'where', 'why', 'action'].forEach(campo => {
      assert.equal(typeof fila[campo], 'string', `${campo} debe ser string`);
      assert.ok(fila[campo].length > 0, `${campo} no debe estar vacío`);
    });
    // 'where' debe mostrar el CÓDIGO del lote (código de trazabilidad de campo),
    // no su id interno, cuando el lote está resuelto en el index.
    assert.match(fila.where, /REI-260916-09/);
    assert.doesNotMatch(fila.where, new RegExp(batchId));
  });
});
