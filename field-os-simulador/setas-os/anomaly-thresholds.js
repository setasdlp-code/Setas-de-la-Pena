'use strict';

/**
 * @file anomaly-thresholds.js — Motor de umbrales y alertas en vivo para Setas OS.
 *
 * `climate-math.evalClimateHealth()` evalúa una lectura *instantánea*: sirve para
 * pintar un semáforo, pero si se conecta directo a un flujo de telemetría real
 * (1 lectura cada 5-30 s) produce alertas que parpadean — una sonda que oscila
 * alrededor de 20.0 °C con ±0.2 °C de ruido dispara y limpia la misma alerta
 * decenas de veces por hora, y el cockpit de Hoy se vuelve inservible.
 *
 * Este motor agrega las tres cosas que faltan para operar con datos reales:
 *
 *   1. DWELL (permanencia): un desvío debe sostenerse `dwellMs` antes de
 *      convertirse en alerta. Un pico de 1 lectura no despierta a nadie.
 *   2. HISTÉRESIS: para limpiarse, el valor debe volver *dentro* de la banda con
 *      un margen (fracción del ancho de banda), no apenas rozar el límite.
 *   3. DERIVA (rate-of-change): un valor todavía dentro de banda pero subiendo a
 *      420 ppm/h ya es accionable — avisa antes de que la cámara se salga.
 *
 * Más: detección de sensor caído (`staleMs` sin lecturas) y escalamiento de
 * severidad por magnitud del desvío. Los niveles siguen el modelo aviso /
 * alarma / crítico que ya usan climate-bench e `incidencias_climaticas`.
 *
 * El motor es puro y determinista: recibe el reloj por inyección (`clock`), así
 * que los tests avanzan el tiempo sin timers reales.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const climateMath = isNode
    ? require('./climate-math.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasClimate : null);

  // ── Configuración por defecto ────────────────────────────────────────────
  // dwellMs por métrica: la inercia térmica de una carpa es lenta (un desvío de
  // T° sostenido 6 min es real), mientras que el CO₂ se dispara rápido cuando el
  // extractor falla y no conviene esperar tanto para avisar.
  const DEFAULT_DWELL_MS = {
    temperature_c: 6 * 60 * 1000,
    rh_pct: 4 * 60 * 1000,
    co2_ppm: 3 * 60 * 1000,
    substrate_temperature_c: 10 * 60 * 1000,
    vpd_kpa: 5 * 60 * 1000,
  };
  const DEFAULT_DWELL_FALLBACK_MS = 5 * 60 * 1000;

  // Margen de reentrada como fracción del ancho de banda (min..max). Con una
  // banda de HR 85–95 % (ancho 10) e histéresis 0.12, una alerta de "humedad
  // alta" solo se limpia cuando la HR baja de 93.8 %, no al tocar 95.0 %.
  const DEFAULT_HYSTERESIS = 0.12;

  // Tiempo que el valor debe permanecer recuperado antes de limpiar la alerta.
  const DEFAULT_CLEAR_DWELL_MS = 3 * 60 * 1000;

  // Sin lecturas por más de esto → el nodo se considera caído.
  const DEFAULT_STALE_MS = 12 * 60 * 1000;

  // Derivas máximas toleradas (unidad de la métrica por hora) antes de avisar.
  const DEFAULT_MAX_RATE_PER_HOUR = {
    temperature_c: 3.0,
    rh_pct: 15.0,
    co2_ppm: 400,
    substrate_temperature_c: 2.5,
    vpd_kpa: 0.35,
  };

  const METRIC_LABELS = {
    temperature_c: 'Temperatura',
    rh_pct: 'Humedad relativa',
    co2_ppm: 'CO₂',
    substrate_temperature_c: 'Temperatura de sustrato',
    vpd_kpa: 'VPD',
  };

  // Género gramatical de cada métrica: "CO₂ alta" y "VPD baja" se leen como un
  // error de la app, no como una alerta que alguien redactó.
  const METRIC_GENDER = {
    temperature_c: 'f',
    rh_pct: 'f',
    co2_ppm: 'm',
    substrate_temperature_c: 'f',
    vpd_kpa: 'm',
  };

  const deviationWord = (metric, direction) => {
    const high = direction === 'high';
    return METRIC_GENDER[metric] === 'm' ? (high ? 'alto' : 'bajo') : (high ? 'alta' : 'baja');
  };

  const METRIC_UNITS = {
    temperature_c: '°C',
    rh_pct: '%',
    co2_ppm: 'ppm',
    substrate_temperature_c: '°C',
    vpd_kpa: 'kPa',
  };

  // Acción correctiva sugerida por métrica y dirección del desvío. Mismo
  // vocabulario operativo que ya usa `detectChamberAlerts()` en el shell
  // (Enfriar / Calentar / Ventilar / Humidificar) para que el operario no tenga
  // que aprender dos jergas distintas.
  const SUGGESTED_ACTIONS = {
    temperature_c: { high: 'Enfriar', low: 'Calentar' },
    rh_pct: { high: 'Ventilar', low: 'Humidificar' },
    co2_ppm: { high: 'Ventilar', low: 'Reducir FAE' },
    substrate_temperature_c: { high: 'Enfriar sustrato', low: 'Aislar / calentar sala' },
    vpd_kpa: { high: 'Humidificar', low: 'Ventilar' },
  };

  const round = (value, decimals = 1) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    const f = Math.pow(10, decimals);
    return Math.round(n * f) / f;
  };

  const decimalsFor = (metric) => (metric === 'co2_ppm' ? 0 : metric === 'vpd_kpa' ? 2 : 1);

  const fmt = (metric, value) => {
    const r = round(value, decimalsFor(metric));
    return r == null ? '—' : `${r} ${METRIC_UNITS[metric] || ''}`.trim();
  };

  /**
   * Severidad por magnitud del desvío, medida en "anchos de banda" fuera del
   * límite. Un desvío de 10 % del ancho es un aviso; uno de más del 50 % ya es
   * crítico. Si la banda define `criticalMin` / `criticalMax` explícitos, esos
   * mandan sobre el cálculo proporcional.
   *
   * @returns {'aviso'|'alarma'|'critico'}
   */
  const gradeSeverity = (value, band, direction) => {
    if (!band) return 'aviso';
    const criticalLimit = direction === 'high' ? band.criticalMax : band.criticalMin;
    if (criticalLimit != null && (direction === 'high' ? value >= criticalLimit : value <= criticalLimit)) return 'critico';

    const span = bandSpan(band);
    const limit = direction === 'high' ? band.max : band.min;
    if (limit == null || !Number.isFinite(span) || span <= 0) return 'alarma';

    const excess = Math.abs(value - limit) / span;
    // Un `criticalMax` / `criticalMin` explícito es la palabra del operario sobre
    // qué cuenta como crítico en esa sala: mientras no se cruce ese número, la
    // escalada proporcional se detiene en 'alarma'. Sin este tope, una banda de
    // CO₂ 400-900 con criticalMax 2500 declaraba crítico a los 1150 ppm y se
    // saltaba el dwell — exactamente el parpadeo que este motor viene a evitar.
    if (excess >= 0.5) return criticalLimit != null ? 'alarma' : 'critico';
    if (excess >= 0.15) return 'alarma';
    return 'aviso';
  };

  // Ancho de la banda objetivo. Cuando solo hay un límite (p. ej. CO₂ con `max`
  // pero sin `min` real), se usa una fracción del propio límite para no dividir
  // por cero ni volver la histéresis absurdamente estrecha.
  const bandSpan = (band) => {
    if (!band) return 1;
    if (band.min != null && band.max != null && band.max > band.min) return band.max - band.min;
    const single = band.max != null ? band.max : band.min;
    if (single != null && Number.isFinite(single) && single !== 0) return Math.abs(single) * 0.25;
    return 1;
  };

  const SEVERITY_RANK = { aviso: 1, alarma: 2, critico: 3 };
  // Mapeo al vocabulario de `climate-math.evalClimateHealth()` para que el resto
  // de la UI (badges, colores) siga leyendo un solo conjunto de valores.
  const SEVERITY_TO_LEVEL = { aviso: 'warning', alarma: 'alert', critico: 'critical' };

  const highestSeverity = (alerts = []) => alerts.reduce((worst, a) => (
    (SEVERITY_RANK[a.severity] || 0) > (SEVERITY_RANK[worst] || 0) ? a.severity : worst
  ), null) || null;

  /**
   * Crea el motor de anomalías. Mantiene una máquina de estados por
   * (sala, métrica, dirección) — `ok → pendiente → activa → recuperando → ok`.
   *
   * @param {object} [options]
   * @param {object} [options.bands] Bandas objetivo por sala: { [roomId]: { temperature_c: {min,max,target}, ... } }
   * @param {object|number} [options.dwellMs] Permanencia antes de disparar (por métrica o global)
   * @param {number} [options.clearDwellMs] Permanencia recuperada antes de limpiar
   * @param {number} [options.hysteresis] Margen de reentrada como fracción del ancho de banda
   * @param {number} [options.staleMs] Sin lecturas → alerta de sensor caído
   * @param {object} [options.maxRatePerHour] Deriva tolerada por métrica
   * @param {Function} [options.clock] Fuente de tiempo inyectable (default Date.now)
   * @param {Function} [options.onAlert] Callback en cada transición (fire/escalate/clear)
   */
  const createAnomalyEngine = (options = {}) => {
    const clock = typeof options.clock === 'function' ? options.clock : Date.now;
    const hysteresis = Number.isFinite(options.hysteresis) ? options.hysteresis : DEFAULT_HYSTERESIS;
    const clearDwellMs = Number.isFinite(options.clearDwellMs) ? options.clearDwellMs : DEFAULT_CLEAR_DWELL_MS;
    const staleMs = Number.isFinite(options.staleMs) ? options.staleMs : DEFAULT_STALE_MS;
    const maxRatePerHour = Object.assign({}, DEFAULT_MAX_RATE_PER_HOUR, options.maxRatePerHour || {});
    const onAlert = typeof options.onAlert === 'function' ? options.onAlert : null;
    let bands = Object.assign({}, options.bands || {});

    const dwellFor = (metric) => {
      if (Number.isFinite(options.dwellMs)) return options.dwellMs;
      if (options.dwellMs && Number.isFinite(options.dwellMs[metric])) return options.dwellMs[metric];
      return DEFAULT_DWELL_MS[metric] != null ? DEFAULT_DWELL_MS[metric] : DEFAULT_DWELL_FALLBACK_MS;
    };

    // Estado por sala: máquinas de estado por métrica+dirección, última muestra
    // vista y última muestra usada para calcular deriva.
    const rooms = new Map();

    const roomState = (roomId) => {
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { id: roomId, tracks: new Map(), lastSampleAt: null, lastSample: null, ratePrev: {}, offline: null });
      }
      return rooms.get(roomId);
    };

    const emit = (transition, alert) => { if (onAlert) { try { onAlert(transition, alert); } catch (e) { /* el consumidor no debe tumbar el motor */ } } };

    const buildAlert = (roomId, metric, direction, track, value, band, now) => ({
      key: `${roomId}:${metric}:${direction}`,
      roomId,
      metric,
      metricLabel: METRIC_LABELS[metric] || metric,
      direction,
      value: round(value, decimalsFor(metric)),
      peak: round(track.peak, decimalsFor(metric)),
      limit: round(direction === 'high' ? band.max : band.min, decimalsFor(metric)),
      target: band.target != null ? round(band.target, decimalsFor(metric)) : null,
      unit: METRIC_UNITS[metric] || '',
      severity: track.severity,
      level: SEVERITY_TO_LEVEL[track.severity] || 'warning',
      action: (SUGGESTED_ACTIONS[metric] || {})[direction] || 'Revisar',
      since: track.since,
      firedAt: track.firedAt,
      ageMs: track.firedAt != null ? Math.max(0, now - track.firedAt) : 0,
      msg: `${METRIC_LABELS[metric] || metric} ${deviationWord(metric, direction)} — ${fmt(metric, value)} ${direction === 'high' ? '>' : '<'} ${fmt(metric, direction === 'high' ? band.max : band.min)}`,
      kind: 'band',
    });

    /**
     * Avanza la máquina de estados de una (métrica, dirección) con un valor nuevo.
     * `outside` dice si el valor viola el límite; `recovered` si volvió dentro de
     * la banda con el margen de histéresis aplicado. Entre ambos existe una zona
     * muerta deliberada: ahí una alerta activa se mantiene activa y una inactiva
     * se mantiene inactiva — eso es exactamente lo que impide el parpadeo.
     */
    const stepTrack = (state, roomId, metric, direction, value, band, now) => {
      const trackKey = `${metric}:${direction}`;
      let track = state.tracks.get(trackKey);
      if (!track) {
        track = { status: 'ok', since: null, firedAt: null, recoveredAt: null, peak: null, severity: 'aviso' };
        state.tracks.set(trackKey, track);
      }

      const limit = direction === 'high' ? band.max : band.min;
      if (limit == null || !Number.isFinite(value)) return null;

      const margin = bandSpan(band) * hysteresis;
      const outside = direction === 'high' ? value > limit : value < limit;
      // Reentrada exigente: hay que cruzar el límite *hacia adentro* por `margin`.
      const recovered = direction === 'high' ? value <= limit - margin : value >= limit + margin;

      if (outside) {
        track.recoveredAt = null;
        if (track.status === 'ok') {
          track.status = 'pendiente';
          track.since = now;
          track.peak = value;
        } else {
          track.peak = direction === 'high'
            ? Math.max(track.peak != null ? track.peak : value, value)
            : Math.min(track.peak != null ? track.peak : value, value);
        }

        const severity = gradeSeverity(value, band, direction);
        const dwellElapsed = now - (track.since || now) >= dwellFor(metric);
        // Un desvío crítico no espera el dwell completo: si la sala ya cruzó el
        // límite crítico explícito, la inercia térmica dejó de ser una excusa.
        const bypassDwell = severity === 'critico';

        if (track.status === 'pendiente' && (dwellElapsed || bypassDwell)) {
          track.status = 'activa';
          track.firedAt = now;
          track.severity = severity;
          const alert = buildAlert(roomId, metric, direction, track, value, band, now);
          emit('fire', alert);
          return alert;
        }

        if (track.status === 'activa') {
          if (SEVERITY_RANK[severity] > SEVERITY_RANK[track.severity]) {
            track.severity = severity;
            const alert = buildAlert(roomId, metric, direction, track, value, band, now);
            emit('escalate', alert);
            return alert;
          }
          return buildAlert(roomId, metric, direction, track, value, band, now);
        }

        return null; // sigue en dwell — todavía no molestamos a nadie
      }

      if (recovered) {
        if (track.status === 'pendiente') {
          // Nunca llegó a disparar: fue un pico. Se descarta sin ruido.
          state.tracks.set(trackKey, { status: 'ok', since: null, firedAt: null, recoveredAt: null, peak: null, severity: 'aviso' });
          return null;
        }
        if (track.status === 'activa') {
          track.status = 'recuperando';
          track.recoveredAt = now;
          return buildAlert(roomId, metric, direction, track, value, band, now);
        }
        if (track.status === 'recuperando') {
          if (now - (track.recoveredAt || now) >= clearDwellMs) {
            const cleared = buildAlert(roomId, metric, direction, track, value, band, now);
            cleared.status = 'resuelta';
            state.tracks.set(trackKey, { status: 'ok', since: null, firedAt: null, recoveredAt: null, peak: null, severity: 'aviso' });
            emit('clear', cleared);
            return null;
          }
          return buildAlert(roomId, metric, direction, track, value, band, now);
        }
        return null;
      }

      // Zona muerta de histéresis: dentro de la banda pero sin margen suficiente.
      if (track.status === 'activa' || track.status === 'recuperando') {
        // Volvió a acercarse al límite: se cancela la cuenta de recuperación.
        if (track.status === 'recuperando') { track.status = 'activa'; track.recoveredAt = null; }
        return buildAlert(roomId, metric, direction, track, value, band, now);
      }
      return null;
    };

    /**
     * Deriva: pendiente por hora entre la muestra anterior y la actual. Solo se
     * evalúa con al menos `minRateGapMs` de separación — dos lecturas separadas
     * por 5 s amplifican el ruido del sensor a cifras por hora absurdas.
     */
    const MIN_RATE_GAP_MS = 90 * 1000;
    const stepRate = (state, roomId, metric, value, now) => {
      const prev = state.ratePrev[metric];
      if (!prev || !Number.isFinite(prev.value)) {
        state.ratePrev[metric] = { value, at: now };
        return null;
      }
      const gap = now - prev.at;
      if (gap < MIN_RATE_GAP_MS) return null;

      const ratePerHour = (value - prev.value) / (gap / 3600000);
      state.ratePrev[metric] = { value, at: now };

      const tolerance = maxRatePerHour[metric];
      if (!Number.isFinite(tolerance) || Math.abs(ratePerHour) <= tolerance) return null;

      const rising = ratePerHour > 0;
      return {
        key: `${roomId}:${metric}:deriva`,
        roomId,
        metric,
        metricLabel: METRIC_LABELS[metric] || metric,
        direction: rising ? 'high' : 'low',
        value: round(value, decimalsFor(metric)),
        ratePerHour: round(ratePerHour, decimalsFor(metric)),
        tolerance,
        unit: METRIC_UNITS[metric] || '',
        severity: Math.abs(ratePerHour) > tolerance * 2 ? 'alarma' : 'aviso',
        level: Math.abs(ratePerHour) > tolerance * 2 ? 'alert' : 'warning',
        action: (SUGGESTED_ACTIONS[metric] || {})[rising ? 'high' : 'low'] || 'Revisar',
        since: now,
        firedAt: now,
        ageMs: 0,
        msg: `${METRIC_LABELS[metric] || metric} ${rising ? 'subiendo' : 'bajando'} ${Math.abs(round(ratePerHour, decimalsFor(metric)))} ${METRIC_UNITS[metric] || ''}/h (tolerancia ${tolerance})`,
        kind: 'deriva',
      };
    };

    /**
     * Procesa una muestra agregada de una sala.
     *
     * @param {string} roomId
     * @param {object} sample { temperature_c, rh_pct, co2_ppm, substrate_temperature_c, observed_at }
     * @param {number} [nowMs] Instante de evaluación (default: reloj inyectado)
     * @returns {{roomId:string, alerts:Array, severity:string|null, vpd:number|null, dewPoint:number|null}}
     */
    const evaluate = (roomId, sample = {}, nowMs) => {
      const now = Number.isFinite(nowMs) ? nowMs : clock();
      const state = roomState(roomId);
      const band = bands[roomId] || {};
      const alerts = [];

      state.lastSampleAt = now;
      state.lastSample = sample;
      if (state.offline) { emit('clear', state.offline); state.offline = null; }

      // VPD y punto de rocío se derivan aquí para que la deriva y las bandas
      // puedan vigilarlos igual que a una métrica medida.
      const tC = Number(sample.temperature_c);
      const rh = Number(sample.rh_pct);
      const vpd = climateMath && Number.isFinite(tC) && Number.isFinite(rh) ? climateMath.calcVPD(tC, rh) : null;
      const dewPoint = climateMath && Number.isFinite(tC) && Number.isFinite(rh) ? climateMath.calcDewPoint(tC, rh) : null;

      const values = {
        temperature_c: tC,
        rh_pct: rh,
        co2_ppm: Number(sample.co2_ppm),
        substrate_temperature_c: Number(sample.substrate_temperature_c),
        vpd_kpa: vpd,
      };

      Object.entries(values).forEach(([metric, value]) => {
        if (!Number.isFinite(value)) return;
        const metricBand = band[metric];
        if (metricBand) {
          ['high', 'low'].forEach((direction) => {
            const alert = stepTrack(state, roomId, metric, direction, value, metricBand, now);
            if (alert) alerts.push(alert);
          });
        }
        const drift = stepRate(state, roomId, metric, value, now);
        if (drift) alerts.push(drift);
      });

      // Riesgo de condensación: no es una banda, es una relación entre dos
      // métricas. Se evalúa aparte y siempre a severidad alarma — agua libre
      // sobre primordios es bacteriosis en 24 h.
      if (Number.isFinite(tC) && dewPoint != null && tC - dewPoint < 0.8) {
        alerts.push({
          key: `${roomId}:dew_point:condensacion`,
          roomId,
          metric: 'dew_point',
          metricLabel: 'Punto de rocío',
          direction: 'low',
          value: round(tC - dewPoint, 1),
          unit: '°C',
          severity: 'alarma',
          level: 'alert',
          action: 'Ventilar',
          since: now,
          firedAt: now,
          ageMs: 0,
          msg: `Riesgo de condensación — ΔT aire-rocío ${round(tC - dewPoint, 1)} °C (< 0.8 °C)`,
          kind: 'condensacion',
        });
      }

      return { roomId, alerts, severity: highestSeverity(alerts), vpd, dewPoint, at: now };
    };

    /**
     * Barrido de salas sin lecturas recientes. Se llama desde un intervalo del
     * consumidor (o desde los tests avanzando el reloj) — un sensor caído no
     * genera muestras, así que nadie más puede detectarlo.
     */
    const checkStale = (nowMs) => {
      const now = Number.isFinite(nowMs) ? nowMs : clock();
      const offline = [];
      rooms.forEach((state, roomId) => {
        if (state.lastSampleAt == null) return;
        const silence = now - state.lastSampleAt;
        if (silence < staleMs) return;
        if (!state.offline) {
          state.offline = {
            key: `${roomId}:sensor:offline`,
            roomId,
            metric: 'sensor',
            metricLabel: 'Nodo de sensores',
            direction: 'low',
            value: Math.round(silence / 60000),
            unit: 'min',
            severity: silence > staleMs * 3 ? 'critico' : 'alarma',
            level: silence > staleMs * 3 ? 'critical' : 'alert',
            action: 'Revisar nodo',
            since: state.lastSampleAt,
            firedAt: now,
            ageMs: silence,
            msg: `Sin telemetría hace ${Math.round(silence / 60000)} min — nodo posiblemente caído`,
            kind: 'offline',
          };
          emit('fire', state.offline);
        } else {
          state.offline.ageMs = silence;
          state.offline.value = Math.round(silence / 60000);
        }
        offline.push(state.offline);
      });
      return offline;
    };

    /** Todas las alertas activas de todas las salas, ordenadas por severidad. */
    const activeAlerts = (nowMs) => {
      const now = Number.isFinite(nowMs) ? nowMs : clock();
      const out = [];
      rooms.forEach((state, roomId) => {
        if (state.offline) out.push(state.offline);
        const band = bands[roomId] || {};
        state.tracks.forEach((track, trackKey) => {
          if (track.status !== 'activa' && track.status !== 'recuperando') return;
          const [metric, direction] = trackKey.split(':');
          const metricBand = band[metric];
          if (!metricBand) return;
          const last = state.lastSample || {};
          const value = metric === 'vpd_kpa'
            ? (climateMath ? climateMath.calcVPD(last.temperature_c, last.rh_pct) : null)
            : Number(last[metric]);
          out.push(Object.assign(
            buildAlert(roomId, metric, direction, track, value, metricBand, now),
            { status: track.status }
          ));
        });
      });
      return out.sort((a, b) => (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0) || (a.firedAt || 0) - (b.firedAt || 0));
    };

    return {
      evaluate,
      checkStale,
      activeAlerts,
      setBands: (next) => { bands = Object.assign({}, next || {}); },
      getBands: () => Object.assign({}, bands),
      resetRoom: (roomId) => { rooms.delete(roomId); },
      reset: () => { rooms.clear(); },
      // Expuesto para tests e inspección; no forma parte del flujo normal.
      _rooms: rooms,
    };
  };

  const api = {
    createAnomalyEngine,
    gradeSeverity,
    bandSpan,
    highestSeverity,
    DEFAULT_DWELL_MS,
    DEFAULT_CLEAR_DWELL_MS,
    DEFAULT_HYSTERESIS,
    DEFAULT_STALE_MS,
    DEFAULT_MAX_RATE_PER_HOUR,
    METRIC_LABELS,
    METRIC_UNITS,
    METRIC_GENDER,
    deviationWord,
    SUGGESTED_ACTIONS,
    SEVERITY_RANK,
    SEVERITY_TO_LEVEL,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasAnomaly = api;
})();
