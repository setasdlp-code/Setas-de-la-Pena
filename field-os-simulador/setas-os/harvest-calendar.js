'use strict';

/**
 * @file harvest-calendar.js — Calendario de Cosecha y Planificación de Ventas (Setas OS).
 *
 * Construye, a partir de los lotes activos, un calendario de eventos de cosecha
 * (oleadas restantes por lote), lo agrega por día y por semana ISO-8601, lo
 * empareja contra compromisos comerciales, estima carga de trabajo pico y lo
 * exporta como iCalendar (RFC 5545).
 *
 * REGLA DURA: este módulo NO reimplementa la física de rendimiento/oleadas.
 * Toda la matemática de kg/EB/oleadas se delega a `flush-forecast-engine.js`
 * (global `SetasFlushForecast`, o `require('./flush-forecast-engine.js')` en
 * Node). Aquí solo se hace planificación de calendario: ventanas de cosecha,
 * agregación temporal y emparejamiento de oferta/demanda.
 *
 * Confianza: las salidas de este módulo son PROYECCIONES DE MODELO, no
 * observaciones medidas. `confidence` solo puede ser 'low' o 'medium' — nunca
 * 'high' — porque no hay aquí evidencia experimental replicada (ver skill
 * agronomic-claims). Las bandas kgLow/kgHigh son un ±25% heurístico sobre
 * kgExpected, no un intervalo calibrado contra datos held-out.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  // Motor canónico de pronóstico de oleadas/rendimiento — única fuente de la física.
  const engine = isNode
    ? require('./flush-forecast-engine.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasFlushForecast : undefined);

  if (!engine) {
    throw new Error(
      'harvest-calendar.js requiere flush-forecast-engine.js (SetasFlushForecast). ' +
      'Cárguelo antes que este módulo.'
    );
  }

  const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

  // Estados de lote que se excluyen del calendario de cosecha (lote ya cerrado).
  const CLOSED_LOT_STATES = ['completado', 'descartado', 'cerrado', 'cancelado'];

  // ---------------------------------------------------------------------
  // Utilidades de fecha, independientes de la zona horaria del host.
  // Bogotá = UTC-5 fijo, sin horario de verano.
  // ---------------------------------------------------------------------

  const BOGOTA_OFFSET_MS = 5 * 3600000;

  /** Formatea un instante UTC (ms desde época) como 'YYYY-MM-DD' usando getters UTC. */
  const dateStrFromUTCms = (ms) => {
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const da = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${mo}-${da}`;
  };

  /**
   * Convierte cualquier fecha/hora (Date, ISO, timestamp, 'YYYY-MM-DD') a la
   * fecha calendario local de Bogotá ('YYYY-MM-DD'), sin depender de la zona
   * horaria del proceso que ejecuta el código (Date.getTime() es siempre UTC).
   */
  const toBogotaDateStr = (input) => {
    const d = engine.parseDateSafe(input) || new Date();
    return dateStrFromUTCms(d.getTime() - BOGOTA_OFFSET_MS);
  };

  /** Suma (o resta) días calendario a un string 'YYYY-MM-DD', en aritmética UTC pura. */
  const addDaysToDateStr = (dateStr, days) => {
    const [y, mo, da] = dateStr.split('-').map(Number);
    return dateStrFromUTCms(Date.UTC(y, mo - 1, da) + days * 86400000);
  };

  /** Compara dos 'YYYY-MM-DD': -1, 0, 1. Válido por ser formato fijo y cero-rellenado. */
  const compareDateStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  /** Enumera, inclusive, todas las fechas 'YYYY-MM-DD' entre start y end. */
  const enumerateDates = (start, end) => {
    const out = [];
    let cur = start;
    let guard = 0;
    while (compareDateStr(cur, end) <= 0 && guard < 400) {
      out.push(cur);
      cur = addDaysToDateStr(cur, 1);
      guard++;
    }
    return out;
  };

  /** Clave de semana ISO-8601 ('YYYY-Www') para un 'YYYY-MM-DD', en UTC puro. */
  const isoWeekKeyFromDateStr = (dateStr) => {
    const [y, mo, da] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(y, mo - 1, da));
    const dayNum = (d.getUTCDay() + 6) % 7; // lunes=0 .. domingo=6
    d.setUTCDate(d.getUTCDate() - dayNum + 3); // jueves de esa semana
    const isoYear = d.getUTCFullYear();
    const jan4 = new Date(Date.UTC(isoYear, 0, 4));
    const jan4Day = (jan4.getUTCDay() + 6) % 7;
    const week1Monday = jan4.getTime() - jan4Day * 86400000;
    const weekNum = Math.round((d.getTime() - week1Monday) / (7 * 86400000)) + 1;
    return `${isoYear}-W${String(weekNum).padStart(2, '0')}`;
  };

  /** Lunes (fecha 'YYYY-MM-DD') de una semana ISO 'YYYY-Www'. */
  const mondayOfISOWeek = (weekKey) => {
    const m = /^(\d{4})-W(\d{2})$/.exec(weekKey || '');
    if (!m) return null;
    const year = parseInt(m[1], 10);
    const week = parseInt(m[2], 10);
    const jan4 = Date.UTC(year, 0, 4);
    const jan4Dow = (new Date(jan4).getUTCDay() + 6) % 7;
    const week1Monday = jan4 - jan4Dow * 86400000;
    return dateStrFromUTCms(week1Monday + (week - 1) * 7 * 86400000);
  };

  /** Enumera claves de semana ISO entre fromWeek y toWeek, inclusive, en orden. */
  const iterateWeeksBetween = (fromWeek, toWeek) => {
    const fromMonday = mondayOfISOWeek(fromWeek);
    const toMonday = mondayOfISOWeek(toWeek);
    if (!fromMonday || !toMonday) return [fromWeek, toWeek].filter(Boolean);
    const out = [];
    let cur = fromMonday;
    let guard = 0;
    while (compareDateStr(cur, toMonday) <= 0 && guard < 520) {
      out.push(isoWeekKeyFromDateStr(cur));
      cur = addDaysToDateStr(cur, 7);
      guard++;
    }
    return out;
  };

  /** True si la semana `wk` cae dentro de [fromWeek, toWeek] (límites opcionales). */
  const weekInRange = (wk, fromWeek, toWeek) => {
    if (fromWeek && compareDateStr(wk, fromWeek) < 0) return false;
    if (toWeek && compareDateStr(wk, toWeek) > 0) return false;
    return true;
  };

  // ---------------------------------------------------------------------
  // 1. Eventos de cosecha por lote/oleada
  // ---------------------------------------------------------------------

  /**
   * Construye eventos de cosecha (uno por oleada restante de cada lote activo)
   * dentro del horizonte de planificación.
   *
   * @param {Array<object>} lots Lotes (formato Bitácora: id/codigo, especie/sKey,
   *   fechaInoculacion, estado, bags, kgPerBag, moisture, eb, currentFlush, ...).
   * @param {object} options { now, horizonDays }
   * @returns {Array<object>} Eventos { lotId, speciesId, flush, windowStart,
   *   windowEnd, peakDate, kgExpected, kgLow, kgHigh, status }
   */
  const buildHarvestEvents = (lots = [], options = {}) => {
    const opts = options || {};
    const nowDateStr = toBogotaDateStr(opts.now || new Date());
    const horizonDays = Number.isFinite(opts.horizonDays) ? opts.horizonDays : 56;
    const horizonEndStr = addDaysToDateStr(nowDateStr, horizonDays);

    const list = Array.isArray(lots) ? lots : [];
    const events = [];

    list.forEach((lot) => {
      if (!lot || typeof lot !== 'object') return;

      const estado = String(lot.estado || lot.status || '').trim().toLowerCase();
      if (CLOSED_LOT_STATES.includes(estado)) return; // lote cerrado/descartado: excluido

      const speciesRaw = lot.especie || lot.sKey || lot.speciesKey;
      const inocRaw = lot.fechaInoculacion || lot.inocDate;
      if (!speciesRaw || !inocRaw) return; // especie o fecha faltante: excluido (robustez)

      const inocDate = engine.parseDateSafe(inocRaw);
      if (!inocDate) return; // fecha no parseable: excluido

      let proj;
      try {
        proj = engine.calculateRemainingFlushes(lot, {});
      } catch (e) {
        return; // lote con datos incalculables: excluido, no se fabrica una proyección
      }
      if (!proj || !Array.isArray(proj.remainingFlushes)) return;

      const lotId = lot.id || lot.codigo || 'LOTE';
      const speciesId = proj.speciesKey;
      const profile = engine.getSpeciesFlushProfile(speciesId);
      const restDays = profile.restDaysBetweenFlushes || 14;
      // Radio heurístico de la ventana de cosecha alrededor del pico: proporcional
      // al descanso entre oleadas de la especie, acotado a un mínimo operable.
      const windowRadius = Math.max(2, Math.round(restDays / 6));

      proj.remainingFlushes.forEach((f) => {
        if (!f || !f.date) return;
        if (compareDateStr(f.date, horizonEndStr) > 0) return; // fuera del horizonte

        const windowStart = addDaysToDateStr(f.date, -windowRadius);
        const windowEnd = addDaysToDateStr(f.date, windowRadius);

        let status;
        if (compareDateStr(windowEnd, nowDateStr) < 0) status = 'vencida';
        else if (compareDateStr(windowStart, nowDateStr) <= 0) status = 'en_ventana';
        else status = 'proxima';

        events.push({
          lotId,
          speciesId,
          flush: f.flush,
          windowStart,
          windowEnd,
          peakDate: f.date,
          kgExpected: round2(f.kg),
          kgLow: round2(f.kg * 0.75),
          kgHigh: round2(f.kg * 1.25),
          status,
        });
      });
    });

    return events;
  };

  // ---------------------------------------------------------------------
  // 2. Agregación temporal — reparto triangular preservando la suma
  // ---------------------------------------------------------------------

  /**
   * Reparte el kg de un evento entre los días de su ventana, con forma
   * triangular simétrica centrada en peakDate (pico=windowRadius+1,
   * bordes=1), preservando exactamente la suma total del evento.
   */
  const distributeEventDaily = (event) => {
    const days = enumerateDates(event.windowStart, event.windowEnd);
    const n = days.length;
    const radius = Math.floor((n - 1) / 2);
    const denom = (radius + 1) * (radius + 1);
    return days.map((day, i) => {
      const w = radius + 1 - Math.abs(i - radius);
      const frac = denom > 0 ? w / denom : 1 / n;
      return { day, frac };
    });
  };

  /**
   * Agrega eventos de cosecha por día calendario ('YYYY-MM-DD').
   * @returns {Array<object>} Buckets ordenados { key, kgExpected, kgLow, kgHigh, bySpecies, events }
   */
  const aggregateByDay = (events = []) => {
    const buckets = {};
    (events || []).forEach((e) => {
      if (!e || !e.windowStart || !e.windowEnd) return;
      const parts = distributeEventDaily(e);
      const eventId = `${e.lotId}-f${e.flush}`;
      parts.forEach(({ day, frac }) => {
        if (!buckets[day]) {
          buckets[day] = { key: day, kgExpected: 0, kgLow: 0, kgHigh: 0, bySpecies: {}, events: new Set() };
        }
        const b = buckets[day];
        b.kgExpected += e.kgExpected * frac;
        b.kgLow += e.kgLow * frac;
        b.kgHigh += e.kgHigh * frac;
        b.bySpecies[e.speciesId] = (b.bySpecies[e.speciesId] || 0) + e.kgExpected * frac;
        b.events.add(eventId);
      });
    });

    return Object.keys(buckets)
      .sort()
      .map((key) => {
        const b = buckets[key];
        const bySpecies = {};
        Object.keys(b.bySpecies).forEach((sk) => { bySpecies[sk] = round2(b.bySpecies[sk]); });
        return {
          key,
          kgExpected: round2(b.kgExpected),
          kgLow: round2(b.kgLow),
          kgHigh: round2(b.kgHigh),
          bySpecies,
          events: Array.from(b.events),
        };
      });
  };

  /**
   * Agrega eventos de cosecha por semana ISO-8601 ('YYYY-Www'), a partir del
   * mismo reparto diario triangular (garantiza consistencia día/semana).
   * @returns {Array<object>} Buckets ordenados { key, kgExpected, kgLow, kgHigh, bySpecies, events }
   */
  const aggregateByWeek = (events = []) => {
    const days = aggregateByDay(events);
    const buckets = {};
    days.forEach((d) => {
      const wk = isoWeekKeyFromDateStr(d.key);
      if (!buckets[wk]) buckets[wk] = { key: wk, kgExpected: 0, kgLow: 0, kgHigh: 0, bySpecies: {}, events: new Set() };
      const b = buckets[wk];
      b.kgExpected += d.kgExpected;
      b.kgLow += d.kgLow;
      b.kgHigh += d.kgHigh;
      Object.keys(d.bySpecies).forEach((sk) => { b.bySpecies[sk] = (b.bySpecies[sk] || 0) + d.bySpecies[sk]; });
      d.events.forEach((id) => b.events.add(id));
    });

    return Object.keys(buckets)
      .sort()
      .map((key) => {
        const b = buckets[key];
        const bySpecies = {};
        Object.keys(b.bySpecies).forEach((sk) => { bySpecies[sk] = round2(b.bySpecies[sk]); });
        return {
          key,
          kgExpected: round2(b.kgExpected),
          kgLow: round2(b.kgLow),
          kgHigh: round2(b.kgHigh),
          bySpecies,
          events: Array.from(b.events),
        };
      });
  };

  // ---------------------------------------------------------------------
  // 3. Emparejamiento de oferta proyectada vs demanda comprometida
  // ---------------------------------------------------------------------

  /** Clasifica un par oferta/demanda en supply/demand/balance/coverageRatio/status. */
  const buildMatchEntry = (supply, demand) => {
    const s = round2(supply || 0);
    const d = round2(demand || 0);
    const balance = round2(s - d);
    let coverageRatio;
    let status;
    if (d <= 0) {
      coverageRatio = s > 0 ? null : 1;
      status = s > 0 ? 'excedente' : 'cubierto';
    } else {
      coverageRatio = round2(s / d);
      if (coverageRatio > 1.3) status = 'excedente';
      else if (coverageRatio >= 1.0) status = 'cubierto';
      else if (coverageRatio >= 0.9) status = 'ajustado';
      else status = 'déficit';
    }
    return { supply: s, demand: d, balance, coverageRatio, status };
  };

  /**
   * Empareja oferta proyectada semanal (de aggregateByWeek) contra compromisos
   * comerciales por especie y en total.
   *
   * @param {Array<object>} weeks Salida de aggregateByWeek
   * @param {Array<object>} commitments [{ client, speciesId, kgPerWeek, fromWeek?, toWeek? }]
   * @returns {object} { weeks: [...], alerts: [...] } por semana, especie y total
   */
  const matchDemand = (weeks = [], commitments = []) => {
    const weekList = Array.isArray(weeks) ? weeks : [];
    const commList = Array.isArray(commitments) ? commitments : [];

    const weekMap = {};
    weekList.forEach((w) => { if (w && w.key) weekMap[w.key] = w; });

    const weekKeys = new Set(Object.keys(weekMap));
    commList.forEach((c) => {
      if (c && c.fromWeek && c.toWeek) {
        iterateWeeksBetween(c.fromWeek, c.toWeek).forEach((wk) => weekKeys.add(wk));
      } else if (c && c.fromWeek) {
        weekKeys.add(c.fromWeek);
      } else if (c && c.toWeek) {
        weekKeys.add(c.toWeek);
      }
    });

    const sortedWeeks = Array.from(weekKeys).sort();

    const perWeek = sortedWeeks.map((wk) => {
      const supplyWeek = weekMap[wk];
      const supplyTotal = supplyWeek ? supplyWeek.kgExpected : 0;
      const bySpeciesSupply = supplyWeek ? supplyWeek.bySpecies : {};

      const speciesDemand = {};
      let demandTotal = 0;
      commList.forEach((c) => {
        if (!c || !weekInRange(wk, c.fromWeek, c.toWeek)) return;
        const kg = parseFloat(c.kgPerWeek) || 0;
        const sKey = c.speciesId || c.especie || 'desconocida';
        demandTotal += kg;
        speciesDemand[sKey] = (speciesDemand[sKey] || 0) + kg;
      });

      const speciesKeys = new Set([...Object.keys(bySpeciesSupply), ...Object.keys(speciesDemand)]);
      const bySpecies = {};
      speciesKeys.forEach((sk) => {
        bySpecies[sk] = buildMatchEntry(bySpeciesSupply[sk] || 0, speciesDemand[sk] || 0);
      });

      const total = buildMatchEntry(supplyTotal, demandTotal);
      return { week: wk, ...total, bySpecies };
    });

    const alerts = perWeek
      .filter((w) => w.status === 'déficit')
      .map((w) => ({ week: w.week, supply: w.supply, demand: w.demand, deficitKg: round2(w.demand - w.supply) }));

    return { weeks: perWeek, alerts };
  };

  // ---------------------------------------------------------------------
  // 4. Carga de trabajo pico (heurística)
  // ---------------------------------------------------------------------

  /**
   * Estima los días de mayor carga de cosecha y las horas-operario heurísticas
   * requeridas (kg proyectado / kg por hora-operario).
   *
   * @param {Array<object>} days Salida de aggregateByDay
   * @param {object} options { harvestKgPerOperatorHour = 8 }
   */
  const peakLoad = (days = [], options = {}) => {
    const opts = options || {};
    const rate = Number.isFinite(opts.harvestKgPerOperatorHour) && opts.harvestKgPerOperatorHour > 0
      ? opts.harvestKgPerOperatorHour
      : 8;

    const sorted = (Array.isArray(days) ? days.slice() : [])
      .sort((a, b) => (b.kgExpected || 0) - (a.kgExpected || 0))
      .map((d) => ({
        date: d.key,
        kgExpected: d.kgExpected,
        laborHours: round2((d.kgExpected || 0) / rate),
      }));

    return {
      days: sorted,
      harvestKgPerOperatorHour: rate,
      basis: 'Heurística operativa: horas-operario = kg proyectado / kg cosechados por hora-operario. No es un estándar medido de productividad de cosecha.',
    };
  };

  // ---------------------------------------------------------------------
  // 5. Exportación iCalendar (RFC 5545)
  // ---------------------------------------------------------------------

  const utf8ByteLength = (str) => {
    let bytes = 0;
    const chars = Array.from(str);
    chars.forEach((ch) => {
      const code = ch.codePointAt(0);
      if (code <= 0x7f) bytes += 1;
      else if (code <= 0x7ff) bytes += 2;
      else if (code <= 0xffff) bytes += 3;
      else bytes += 4;
    });
    return bytes;
  };

  /** Escapa , ; \ y saltos de línea según RFC 5545 §3.3.11. */
  const icsEscape = (str) => String(str == null ? '' : str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');

  /** Pliega una línea de contenido a un máximo de 75 octetos por línea física (RFC 5545 §3.1). */
  const foldLine = (line) => {
    const maxFirst = 75;
    const maxCont = 74; // 75 - 1 octeto del espacio de continuación
    const chars = Array.from(line);
    let out = '';
    let current = '';
    let currentBytes = 0;
    let isFirst = true;

    chars.forEach((ch) => {
      const chBytes = utf8ByteLength(ch);
      const limit = isFirst ? maxFirst : maxCont;
      if (currentBytes + chBytes > limit && current.length > 0) {
        out += current + '\r\n';
        current = ' ' + ch;
        currentBytes = 1 + chBytes;
        isFirst = false;
      } else {
        current += ch;
        currentBytes += chBytes;
      }
    });
    out += current;
    return out;
  };

  const icsDateCompact = (dateStr) => dateStr.replace(/-/g, '');

  /** DTSTAMP en UTC básico 'YYYYMMDDTHHMMSSZ' a partir de `now`. */
  const icsTimestamp = (now) => {
    const d = engine.parseDateSafe(now) || new Date();
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  };

  /**
   * Exporta eventos de cosecha como iCalendar (RFC 5545): eventos de día
   * completo (DTSTART;VALUE=DATE / DTEND;VALUE=DATE exclusivo), CRLF, plegado
   * de línea a 75 octetos y escape de texto.
   *
   * @param {Array<object>} events Salida de buildHarvestEvents
   * @param {object} options { calendarName, now }
   * @returns {string} Contenido .ics completo
   */
  const toICS = (events = [], options = {}) => {
    const opts = options || {};
    const calendarName = opts.calendarName || 'Setas OS · Cosechas';
    const dtstamp = icsTimestamp(opts.now || new Date());

    const lines = [];
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//Setas de la Pena//Setas OS Harvest Calendar//ES');
    lines.push('CALSCALE:GREGORIAN');
    lines.push(`X-WR-CALNAME:${icsEscape(calendarName)}`);

    (events || []).forEach((e) => {
      if (!e || !e.windowStart || !e.windowEnd) return;
      const dtstart = icsDateCompact(e.windowStart);
      // DTEND es exclusivo en eventos de día completo: día siguiente al último día de ventana.
      const dtend = icsDateCompact(addDaysToDateStr(e.windowEnd, 1));
      const uid = `${e.lotId}-f${e.flush}@setas-os`;
      const kgLabel = Number.isFinite(e.kgExpected) ? e.kgExpected.toFixed(1) : '0.0';
      const summary = `Cosecha F${e.flush} · Lote ${e.lotId} · ~${kgLabel} kg`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${icsEscape(uid)}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
      lines.push(`DTEND;VALUE=DATE:${dtend}`);
      lines.push(`SUMMARY:${icsEscape(summary)}`);
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    return lines.map(foldLine).join('\r\n') + '\r\n';
  };

  // ---------------------------------------------------------------------
  // 6. Composición completa del calendario
  // ---------------------------------------------------------------------

  /**
   * Construye el calendario de cosecha y ventas completo a partir de lotes
   * activos y compromisos comerciales.
   *
   * @param {object} params { lots, commitments, now, horizonDays }
   * @returns {object} { events, days, weeks, demand, peaks, confidence, basis }
   */
  const buildHarvestCalendar = (params = {}) => {
    const p = params || {};
    const events = buildHarvestEvents(p.lots || [], { now: p.now, horizonDays: p.horizonDays });
    const days = aggregateByDay(events);
    const weeks = aggregateByWeek(events);
    const demand = matchDemand(weeks, p.commitments || []);
    const peaks = peakLoad(days, {});

    // Confianza estructuralmente acotada a low/medium: son proyecciones de
    // modelo (perfiles de oleada + cinética térmica), nunca evidencia medida.
    const confidence = events.length >= 5 ? 'medium' : 'low';
    const basis = 'Proyección de modelo (perfiles biológicos de oleada por especie + cinética térmica Q10 de ' +
      'flush-forecast-engine.js), no evidencia medida. Bandas kgLow/kgHigh = kgExpected ±25%, heurística de ' +
      'incertidumbre sobre EB y timing de fructificación, no un intervalo calibrado contra datos held-out. ' +
      "Confianza 'medium' requiere ≥5 eventos de cosecha proyectados en el horizonte; con menos, 'low'.";

    return { events, days, weeks, demand, peaks, confidence, basis };
  };

  const api = {
    buildHarvestEvents,
    aggregateByDay,
    aggregateByWeek,
    matchDemand,
    peakLoad,
    toICS,
    buildHarvestCalendar,
    // Utilidades expuestas para pruebas/reuso (no reimplementan física del motor).
    toBogotaDateStr,
    addDaysToDateStr,
    compareDateStr,
    isoWeekKeyFromDateStr,
    iterateWeeksBetween,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasHarvestCalendar = api;
})();
