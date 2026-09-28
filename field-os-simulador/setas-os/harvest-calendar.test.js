'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const hc = require('./harvest-calendar.js');
const engine = require('./flush-forecast-engine.js');

const NOW = '2026-09-28T15:00:00Z'; // referencia fija para todas las pruebas

test('Setas OS — Calendario de Cosecha y Ventas (harvest-calendar)', async (t) => {

  await t.test('1. buildHarvestEvents genera un evento por oleada restante de un lote activo', () => {
    const lots = [{
      id: 'LP-0012',
      bags: 100,
      kgPerBag: 1.5,
      moisture: 65,
      eb: 90,
      fechaInoculacion: '2026-08-01',
      sKey: 'p_ostreatus_gris',
      estado: 'incubacion',
    }];
    const events = hc.buildHarvestEvents(lots, { now: NOW, horizonDays: 90 });
    assert.equal(events.length, 3, 'Orellana Gris tiene 3 oleadas comerciales');
    events.forEach((e) => {
      assert.equal(e.lotId, 'LP-0012');
      assert.equal(e.speciesId, 'p_ostreatus_gris');
      assert.ok(['proxima', 'en_ventana', 'vencida'].includes(e.status));
      assert.ok(e.kgExpected > 0);
    });
  });

  await t.test('2. Excluye lotes cerrados (completado/descartado)', () => {
    const base = { bags: 50, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris' };
    const lots = [
      { ...base, id: 'A', estado: 'completado' },
      { ...base, id: 'B', estado: 'descartado' },
      { ...base, id: 'C', estado: 'incubacion' },
    ];
    const events = hc.buildHarvestEvents(lots, { now: NOW, horizonDays: 90 });
    const lotIds = new Set(events.map((e) => e.lotId));
    assert.ok(!lotIds.has('A') && !lotIds.has('B'), 'lotes cerrados/descartados excluidos');
    assert.ok(lotIds.has('C'), 'lote activo incluido');
  });

  await t.test('3. Excluye lotes con especie o fecha de inoculación faltante (robustez)', () => {
    const lots = [
      { id: 'SIN_ESPECIE', bags: 50, kgPerBag: 1.5, fechaInoculacion: '2026-08-01' },
      { id: 'SIN_FECHA', bags: 50, kgPerBag: 1.5, sKey: 'p_ostreatus_gris' },
      { id: 'FECHA_INVALIDA', bags: 50, sKey: 'p_ostreatus_gris', fechaInoculacion: 'no-es-una-fecha' },
      { id: null }, // basura
    ];
    const events = hc.buildHarvestEvents(lots, { now: NOW });
    assert.equal(events.length, 0, 'ningún lote con datos incompletos debe generar eventos');
  });

  await t.test('4. Clasifica status vencida/en_ventana/proxima según la fecha de referencia', () => {
    const lot = {
      id: 'LP-STATUS', bags: 50, kgPerBag: 1.5, moisture: 65, eb: 90,
      fechaInoculacion: '2026-01-01', sKey: 'p_ostreatus_gris', estado: 'produccion',
    };
    // "now" muy adelante: todas las oleadas ya deben estar vencidas.
    const eventsLate = hc.buildHarvestEvents([lot], { now: '2026-12-01T12:00:00Z', horizonDays: 400 });
    assert.ok(eventsLate.every((e) => e.status === 'vencida'));

    // "now" muy atrás: todas deben ser próximas.
    const eventsEarly = hc.buildHarvestEvents([lot], { now: '2026-01-02T12:00:00Z', horizonDays: 400 });
    assert.ok(eventsEarly.every((e) => e.status === 'proxima'));
  });

  await t.test('5. Respeta el horizonte: descarta oleadas cuyo pico cae después de horizonDays', () => {
    const lot = {
      id: 'LP-HORIZ', bags: 50, kgPerBag: 1.5, moisture: 65, eb: 90,
      fechaInoculacion: '2026-08-01', sKey: 'shiitake', // flushes muy espaciados (92/122/152 días)
    };
    const shortHorizon = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 30 });
    const longHorizon = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 400 });
    assert.ok(shortHorizon.length < longHorizon.length);
    assert.equal(longHorizon.length, 3);
  });

  await t.test('6. kgLow/kgHigh son una banda de ±25% sobre kgExpected', () => {
    const lot = { id: 'LP-BAND', bags: 80, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris' };
    const events = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 90 });
    events.forEach((e) => {
      assert.ok(Math.abs(e.kgLow - e.kgExpected * 0.75) < 0.01);
      assert.ok(Math.abs(e.kgHigh - e.kgExpected * 1.25) < 0.01);
    });
  });

  await t.test('7. currentFlush excluye oleadas ya cosechadas del calendario', () => {
    const lot = {
      id: 'LP-CF', bags: 50, kgPerBag: 1.5, moisture: 65, eb: 90,
      fechaInoculacion: '2026-06-01', sKey: 'p_ostreatus_gris',
      currentFlush: 1, lastFlushDate: '2026-07-05',
    };
    const events = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 200 });
    assert.ok(events.every((e) => e.flush > 1), 'F1 ya cosechado no debe reaparecer');
  });

  await t.test('8. aggregateByDay preserva la suma total de kgExpected del evento', () => {
    const events = [{
      lotId: 'X', speciesId: 'p_ostreatus_gris', flush: 1,
      windowStart: '2026-10-01', windowEnd: '2026-10-05', peakDate: '2026-10-03',
      kgExpected: 10, kgLow: 7.5, kgHigh: 12.5, status: 'proxima',
    }];
    const days = hc.aggregateByDay(events);
    const totalExpected = days.reduce((s, d) => s + d.kgExpected, 0);
    const totalLow = days.reduce((s, d) => s + d.kgLow, 0);
    assert.ok(Math.abs(totalExpected - 10) < 0.01, `suma preservada, obtuvo ${totalExpected}`);
    assert.ok(Math.abs(totalLow - 7.5) < 0.01);
    assert.equal(days.length, 5, 'ventana de 5 días => 5 buckets diarios');
    // Forma triangular: el día pico (2026-10-03) debe tener el mayor kg.
    const peakDay = days.find((d) => d.key === '2026-10-03');
    assert.ok(days.every((d) => d.kgExpected <= peakDay.kgExpected));
  });

  await t.test('9. aggregateByDay agrega bySpecies y la lista de events (ids) correctamente', () => {
    const events = [
      { lotId: 'A', speciesId: 'p_ostreatus_gris', flush: 1, windowStart: '2026-10-01', windowEnd: '2026-10-01', peakDate: '2026-10-01', kgExpected: 5, kgLow: 3.75, kgHigh: 6.25, status: 'proxima' },
      { lotId: 'B', speciesId: 'shiitake', flush: 1, windowStart: '2026-10-01', windowEnd: '2026-10-01', peakDate: '2026-10-01', kgExpected: 3, kgLow: 2.25, kgHigh: 3.75, status: 'proxima' },
    ];
    const days = hc.aggregateByDay(events);
    assert.equal(days.length, 1);
    assert.equal(days[0].bySpecies.p_ostreatus_gris, 5);
    assert.equal(days[0].bySpecies.shiitake, 3);
    assert.deepEqual(new Set(days[0].events), new Set(['A-f1', 'B-f1']));
  });

  await t.test('10. aggregateByWeek produce claves ISO-8601 (YYYY-Www) ordenadas', () => {
    const lot = { id: 'LP-W', bags: 100, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris' };
    const events = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 90 });
    const weeks = hc.aggregateByWeek(events);
    weeks.forEach((w) => assert.match(w.key, /^\d{4}-W\d{2}$/));
    const sorted = weeks.map((w) => w.key).slice().sort();
    assert.deepEqual(weeks.map((w) => w.key), sorted, 'las semanas deben venir ordenadas');
    const totalWeekKg = weeks.reduce((s, w) => s + w.kgExpected, 0);
    const totalEventKg = events.reduce((s, e) => s + e.kgExpected, 0);
    assert.ok(Math.abs(totalWeekKg - totalEventKg) < 0.05, 'la suma semanal debe conservar el total de eventos');
  });

  await t.test('11. matchDemand clasifica cubierto/ajustado/déficit/excedente', () => {
    const weeks = [
      { key: '2026-W40', kgExpected: 10, kgLow: 7.5, kgHigh: 12.5, bySpecies: { p_ostreatus_gris: 10 }, events: [] },
      { key: '2026-W41', kgExpected: 9, kgLow: 6.75, kgHigh: 11.25, bySpecies: { p_ostreatus_gris: 9 }, events: [] },
      { key: '2026-W42', kgExpected: 5, kgLow: 3.75, kgHigh: 6.25, bySpecies: { p_ostreatus_gris: 5 }, events: [] },
      { key: '2026-W43', kgExpected: 15, kgLow: 11.25, kgHigh: 18.75, bySpecies: { p_ostreatus_gris: 15 }, events: [] },
    ];
    const commitments = [
      { client: 'Rest A', speciesId: 'p_ostreatus_gris', kgPerWeek: 10, fromWeek: '2026-W40', toWeek: '2026-W43' },
    ];
    const demand = hc.matchDemand(weeks, commitments);
    const byWeek = Object.fromEntries(demand.weeks.map((w) => [w.week, w]));
    assert.equal(byWeek['2026-W40'].status, 'cubierto'); // 10/10 = 100%
    assert.equal(byWeek['2026-W41'].status, 'ajustado'); // 9/10 = 90%
    assert.equal(byWeek['2026-W42'].status, 'déficit');  // 5/10 = 50%
    assert.equal(byWeek['2026-W43'].status, 'excedente'); // 15/10 = 150% > 130%
  });

  await t.test('12. matchDemand.alerts solo incluye semanas en déficit', () => {
    const weeks = [
      { key: '2026-W40', kgExpected: 2, kgLow: 1.5, kgHigh: 2.5, bySpecies: {}, events: [] },
      { key: '2026-W41', kgExpected: 20, kgLow: 15, kgHigh: 25, bySpecies: {}, events: [] },
    ];
    const commitments = [
      { client: 'Rest A', speciesId: 'x', kgPerWeek: 10, fromWeek: '2026-W40', toWeek: '2026-W41' },
    ];
    const demand = hc.matchDemand(weeks, commitments);
    assert.equal(demand.alerts.length, 1);
    assert.equal(demand.alerts[0].week, '2026-W40');
    assert.ok(demand.alerts[0].deficitKg > 0);
  });

  await t.test('13. matchDemand sin compromisos: todo cubierto/excedente por ausencia de demanda', () => {
    const weeks = [{ key: '2026-W40', kgExpected: 5, kgLow: 3.75, kgHigh: 6.25, bySpecies: { p_ostreatus_gris: 5 }, events: [] }];
    const demand = hc.matchDemand(weeks, []);
    assert.equal(demand.weeks[0].status, 'excedente');
    assert.equal(demand.weeks[0].demand, 0);
    assert.equal(demand.alerts.length, 0);
  });

  await t.test('14. peakLoad ordena los días de mayor a menor kg y calcula horas heurísticas', () => {
    const days = [
      { key: '2026-10-01', kgExpected: 4, kgLow: 3, kgHigh: 5, bySpecies: {}, events: [] },
      { key: '2026-10-02', kgExpected: 16, kgLow: 12, kgHigh: 20, bySpecies: {}, events: [] },
    ];
    const peaks = hc.peakLoad(days, { harvestKgPerOperatorHour: 8 });
    assert.equal(peaks.days[0].date, '2026-10-02', 'el día con más kg debe ir primero');
    assert.equal(peaks.days[0].laborHours, 2);
    assert.equal(peaks.days[1].laborHours, 0.5);
    assert.match(peaks.basis, /[Hh]eurística/);
  });

  await t.test('15. toICS produce CRLF, escapado y ventanas de día completo con DTEND exclusivo', () => {
    const events = [{
      lotId: 'LP-0012, "Sala A"', speciesId: 'p_ostreatus_gris', flush: 2,
      windowStart: '2026-10-10', windowEnd: '2026-10-12', peakDate: '2026-10-11',
      kgExpected: 4.3, kgLow: 3.2, kgHigh: 5.4, status: 'proxima',
    }];
    const ics = hc.toICS(events, { calendarName: 'Prueba', now: '2026-09-28T12:00:00Z' });

    assert.ok(ics.includes('\r\n'), 'debe usar CRLF');
    assert.ok(!/[^\r]\n/.test(ics), 'no debe haber LF sin CR precedente');
    assert.match(ics, /BEGIN:VCALENDAR\r\n/);
    assert.match(ics, /END:VCALENDAR\r\n$/);
    assert.match(ics, /DTSTART;VALUE=DATE:20261010/);
    assert.match(ics, /DTEND;VALUE=DATE:20261013/, 'DTEND debe ser el día siguiente al fin de ventana (exclusivo)');
    assert.match(ics, /UID:LP-0012\\, "Sala A"-f2@setas-os/, 'la coma en el lotId debe escaparse');
    assert.match(ics, /DTSTAMP:20260928T120000Z/);
    assert.match(ics, /SUMMARY:Cosecha F2 · Lote LP-0012\\, "Sala A" · ~4\.3 kg/);
  });

  await t.test('16. toICS pliega líneas largas a 75 octetos por línea física', () => {
    const events = [{
      lotId: 'LOTE-CON-UN-CODIGO-MUY-LARGO-PARA-FORZAR-EL-PLEGADO-DE-LINEA-ICS-0001',
      speciesId: 'p_ostreatus_gris', flush: 1,
      windowStart: '2026-10-10', windowEnd: '2026-10-10', peakDate: '2026-10-10',
      kgExpected: 1.234, kgLow: 0.9, kgHigh: 1.5, status: 'proxima',
    }];
    const ics = hc.toICS(events, { now: '2026-09-28T12:00:00Z' });
    const physicalLines = ics.split('\r\n');
    physicalLines.forEach((line) => {
      if (line === '') return;
      const byteLen = Buffer.byteLength(line, 'utf8');
      assert.ok(byteLen <= 75, `línea física excede 75 octetos: ${byteLen} -> "${line}"`);
    });
    // Debe existir al menos una línea de continuación (empieza con espacio).
    assert.ok(physicalLines.some((l) => l.startsWith(' ')), 'debe haber al menos una línea plegada');
  });

  await t.test('17. buildHarvestCalendar compone events/days/weeks/demand/peaks y confidence low|medium', () => {
    const lots = [
      { id: 'LP-1', bags: 100, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris' },
      { id: 'LP-2', bags: 60, kgPerBag: 1.5, moisture: 65, eb: 85, fechaInoculacion: '2026-08-10', sKey: 'nameko' },
    ];
    const commitments = [{ client: 'Rest A', speciesId: 'p_ostreatus_gris', kgPerWeek: 3 }];
    const cal = hc.buildHarvestCalendar({ lots, commitments, now: NOW, horizonDays: 90 });

    assert.ok(Array.isArray(cal.events) && cal.events.length > 0);
    assert.ok(Array.isArray(cal.days));
    assert.ok(Array.isArray(cal.weeks));
    assert.ok(Array.isArray(cal.demand.weeks));
    assert.ok(Array.isArray(cal.peaks.days));
    assert.ok(['low', 'medium'].includes(cal.confidence));
    assert.ok(!['high'].includes(cal.confidence), 'nunca debe declarar alta confianza');
    assert.equal(typeof cal.basis, 'string');
    assert.match(cal.basis, /proyección|modelo/i);
  });

  await t.test('18. buildHarvestCalendar con pocos eventos declara confidence "low"', () => {
    const lots = [{ id: 'LP-1', bags: 10, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_djamor_rosa' }];
    const cal = hc.buildHarvestCalendar({ lots, commitments: [], now: NOW, horizonDays: 90 });
    assert.equal(cal.confidence, 'low');
  });

  await t.test('19. Bucketing por fecha local de Bogotá (UTC-5) es correcto en el borde de medianoche UTC', () => {
    // 2026-09-28T04:30:00Z corresponde a 2026-09-27 23:30 en Bogotá (UTC-5).
    assert.equal(hc.toBogotaDateStr('2026-09-28T04:30:00Z'), '2026-09-27');
    // 2026-09-28T05:30:00Z corresponde a 2026-09-28 00:30 en Bogotá.
    assert.equal(hc.toBogotaDateStr('2026-09-28T05:30:00Z'), '2026-09-28');
  });

  await t.test('20. Lote sin lots/commitments no revienta y produce un calendario vacío coherente', () => {
    const cal = hc.buildHarvestCalendar({ lots: [], commitments: [], now: NOW });
    assert.deepEqual(cal.events, []);
    assert.deepEqual(cal.days, []);
    assert.deepEqual(cal.weeks, []);
    assert.equal(cal.demand.weeks.length, 0);
    assert.equal(cal.demand.alerts.length, 0);
    assert.equal(cal.peaks.days.length, 0);
    assert.equal(cal.confidence, 'low');
  });

  await t.test('21. Reutiliza flush-forecast-engine: los kg de los eventos coinciden con calculateRemainingFlushes', () => {
    const lot = { id: 'LP-CONSIST', bags: 40, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris' };
    const proj = engine.calculateRemainingFlushes(lot, {});
    const events = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 400 });
    assert.equal(events.length, proj.remainingFlushes.length);
    events.forEach((e, i) => {
      assert.equal(e.peakDate, proj.remainingFlushes[i].date);
      assert.ok(Math.abs(e.kgExpected - proj.remainingFlushes[i].kg) < 0.01);
    });
  });

  // -------------------------------------------------------------------
  // Hallazgo de revisión #7 — lifecycleState canónico y quarantine excluidos
  // -------------------------------------------------------------------

  await t.test('22. Excluye lotes por lifecycleState canónico (closed/discarded/failed/quarantine)', () => {
    const base = { bags: 50, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris' };
    const lots = [
      { ...base, id: 'A', lifecycleState: 'closed' },
      { ...base, id: 'B', lifecycleState: 'discarded' },
      { ...base, id: 'C', lifecycleState: 'failed' },
      { ...base, id: 'D', lifecycleState: 'quarantine' },
      { ...base, id: 'E', lifecycleState: 'incubation' },
    ];
    const events = hc.buildHarvestEvents(lots, { now: NOW, horizonDays: 90 });
    const lotIds = new Set(events.map((e) => e.lotId));
    assert.ok(!lotIds.has('A') && !lotIds.has('B') && !lotIds.has('C') && !lotIds.has('D'),
      'lotes cerrados/descartados/fallidos/en cuarentena (canónicos) deben excluirse');
    assert.ok(lotIds.has('E'), 'lote activo (incubation) debe incluirse');
  });

  await t.test('23. lifecycleState tiene prioridad sobre estado/status legacy', () => {
    const lot = {
      id: 'LP-LC', bags: 50, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris',
      estado: 'incubacion', lifecycleState: 'closed',
    };
    const events = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 90 });
    assert.equal(events.length, 0, 'lifecycleState=closed debe excluir el lote aunque estado legacy diga activo');
  });

  // -------------------------------------------------------------------
  // Hallazgo de revisión #8 — normalización de especie en matchDemand
  // -------------------------------------------------------------------

  await t.test('24. matchDemand normaliza alias de especie (orellana_gris) contra la clave canónica de la oferta', () => {
    const weeks = [
      { key: '2026-W40', kgExpected: 10, kgLow: 7.5, kgHigh: 12.5, bySpecies: { p_ostreatus_gris: 10 }, events: [] },
    ];
    const commitments = [
      { client: 'Rest A', speciesId: 'orellana_gris', kgPerWeek: 8, fromWeek: '2026-W40', toWeek: '2026-W40' },
    ];
    const demand = hc.matchDemand(weeks, commitments);
    const week = demand.weeks[0];
    assert.equal(Object.keys(week.bySpecies).length, 1, 'oferta y demanda del mismo hongo deben quedar en una sola clave normalizada');
    const entry = week.bySpecies.p_ostreatus_gris;
    assert.ok(entry, 'debe existir la entrada bajo la clave canónica p_ostreatus_gris');
    assert.equal(entry.supply, 10);
    assert.equal(entry.demand, 8);
    assert.notEqual(entry.status, 'déficit', 'no debe haber déficit falso por alias sin normalizar');
  });

  // -------------------------------------------------------------------
  // Hallazgo de revisión #16 — provenance de valores heurísticos
  // -------------------------------------------------------------------

  await t.test('25. HEURISTICS expone provenance {class, note} para windowRadius, banda ±25% y kg/hora-operario', () => {
    assert.ok(Object.isFrozen(hc.HEURISTICS));
    ['windowRadiusDivisor', 'yieldBandFraction', 'harvestKgPerOperatorHour'].forEach((key) => {
      const entry = hc.HEURISTICS[key];
      assert.ok(entry, `debe existir HEURISTICS.${key}`);
      assert.equal(entry.class, 'heuristic');
      assert.ok(typeof entry.note === 'string' && entry.note.length > 0);
      assert.ok(typeof entry.value === 'number');
    });
    assert.equal(hc.HEURISTICS.yieldBandFraction.value, 0.25);
    assert.equal(hc.HEURISTICS.harvestKgPerOperatorHour.value, 8);
  });

  // -------------------------------------------------------------------
  // Hallazgo de revisión #18 — confidence no se basa en conteo de eventos
  // -------------------------------------------------------------------

  await t.test('26. buildHarvestCalendar declara "low" aun con muchos eventos, salvo opts.calibrated === true', () => {
    const lots = [
      { id: 'LP-1', bags: 200, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris' },
      { id: 'LP-2', bags: 200, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-05', sKey: 'shiitake' },
    ];
    const calDefault = hc.buildHarvestCalendar({ lots, commitments: [], now: NOW, horizonDays: 400 });
    assert.ok(calDefault.events.length >= 5, 'precondición: debe haber al menos 5 eventos proyectados');
    assert.equal(calDefault.confidence, 'low', 'muchos eventos proyectados no son evidencia; sigue siendo low');

    const calCalibrated = hc.buildHarvestCalendar({ lots, commitments: [], now: NOW, horizonDays: 400, calibrated: true });
    assert.equal(calCalibrated.confidence, 'medium', 'calibrated:true (de calibrateFlushProfileFromHarvests) sí sube a medium');
  });

  // -------------------------------------------------------------------
  // Hallazgo de revisión #20 — ambientTemp nunca se pasaba al motor
  // -------------------------------------------------------------------

  await t.test('27. ambientTempByLot / lot.ambientTempC se pasan al motor y desplazan la proyección', () => {
    const lot = { id: 'LP-TEMP', bags: 50, kgPerBag: 1.5, moisture: 65, eb: 90, fechaInoculacion: '2026-08-01', sKey: 'p_ostreatus_gris' };
    const coldTemp = 18; // tRef=24 para p_ostreatus_gris: más frío retrasa la proyección (Q10).

    const eventsDefault = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 200 });
    const eventsColdByOpt = hc.buildHarvestEvents([lot], { now: NOW, horizonDays: 200, ambientTempByLot: { 'LP-TEMP': coldTemp } });
    const eventsColdByLotField = hc.buildHarvestEvents([{ ...lot, ambientTempC: coldTemp }], { now: NOW, horizonDays: 200 });

    assert.notEqual(eventsColdByOpt[0].peakDate, eventsDefault[0].peakDate,
      'ambientTempByLot debe desplazar la fecha proyectada respecto a la temperatura de referencia');
    assert.equal(eventsColdByOpt[0].peakDate, eventsColdByLotField[0].peakDate,
      'lot.ambientTempC debe producir el mismo resultado que ambientTempByLot para ese lote');

    // Debe coincidir exactamente con pasarle la temperatura directo al motor.
    const proj = engine.calculateRemainingFlushes(lot, { ambientTemp: coldTemp });
    assert.equal(eventsColdByOpt[0].peakDate, proj.remainingFlushes[0].date);

    // opts.ambientTempByLot tiene prioridad sobre lot.ambientTempC.
    const eventsPriority = hc.buildHarvestEvents(
      [{ ...lot, ambientTempC: 30 }],
      { now: NOW, horizonDays: 200, ambientTempByLot: { 'LP-TEMP': coldTemp } }
    );
    assert.equal(eventsPriority[0].peakDate, eventsColdByOpt[0].peakDate,
      'ambientTempByLot debe ganar sobre lot.ambientTempC cuando ambos están presentes');
  });
});
