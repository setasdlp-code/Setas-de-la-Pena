'use strict';

/**
 * @file cycle-out-of-band.js — Horas fuera de banda por etapa y métrica para la
 * ficha de lote, calculadas con la telemetría de cada ciclo de sala del lote.
 *
 * Reglas (agronomic-claims: nunca un número sin base):
 *   - La banda es la del ciclo de sala (`cycle.targets`), no la fija de la sala.
 *     Una métrica sin banda en el ciclo no se calcula.
 *   - Solo cuentan lecturas del ciclo (telemetry-contract.readingBelongsToCycle)
 *     con calidad `valid`.
 *   - El tiempo se pondera por muestra: una lectura representa el tramo hasta la
 *     siguiente lectura del mismo dispositivo. Un hueco mayor que `gapMaxMs` no
 *     se cuenta ni como dentro ni como fuera de banda (no se inventa), y la
 *     última lectura no aporta tramo propio: la misma convención que
 *     contamination-risk.extractClimateExposure.
 *   - Con varios dispositivos en la sala, un instante cuenta como fuera de banda
 *     si CUALQUIER dispositivo con tramo vigente está fuera (la banda es de la
 *     sala; una posición fuera de ella es exposición real) y como cubierto si
 *     alguno lo cubre.
 *   - Cobertura = tiempo cubierto / duración de la ventana del ciclo (hasta
 *     `now` si sigue abierto). Con cobertura menor que `minCoverageRatio` el
 *     resultado es `insufficient` y NO lleva horas: se informa la cobertura. Las
 *     horas, cuando se informan, son sobre el tiempo cubierto; nunca se
 *     extrapolan al resto del ciclo.
 *
 * Parámetros heredados (no inventados): `gapMaxMs` toma
 * contamination-risk.EXPOSURE_THRESHOLDS.gapMaxMinutes (90 min, convención
 * operativa de continuidad de telemetría) y `minCoverageRatio` es 0,5, el mismo
 * corte con el que contamination-risk pasa de confianza «medium» a «low» por
 * cobertura (coverageConfidence). Ambos se pueden sobrescribir por argumento.
 *
 * Lógica pura (UMD): sin React, red, DOM ni almacenamiento.
 */
(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : {};
  const telemetryRef = () => (isNode ? require('./telemetry-contract.js') : glob.SetasTelemetry) || null;
  const targetsRef = () => (isNode ? require('./room-cycle-targets.js') : glob.SetasRoomCycleTargets) || null;
  const exposureRef = () => (isNode ? require('./contamination-risk.js') : glob.SetasContaminationRisk) || null;

  const HOUR_MS = 3600000;
  // Respaldo literal solo si contamination-risk no está cargado; el test de
  // paridad lo compara con EXPOSURE_THRESHOLDS.gapMaxMinutes.
  const FALLBACK_GAP_MAX_MS = 90 * 60 * 1000;
  // Mismo corte que contamination-risk.coverageConfidence (0,5).
  const MIN_COVERAGE_RATIO = 0.5;

  const METRIC_LABELS = Object.freeze({
    temperature_c: 'Temperatura',
    rh_pct: 'Humedad relativa',
    co2_ppm: 'CO₂',
    substrate_temperature_c: 'Temperatura de sustrato',
  });

  const defaultGapMaxMs = () => {
    const risk = exposureRef();
    const m = risk && risk.EXPOSURE_THRESHOLDS && risk.EXPOSURE_THRESHOLDS.gapMaxMinutes;
    return m && Number.isFinite(m.value) ? m.value * 60 * 1000 : FALLBACK_GAP_MAX_MS;
  };

  const resolveNow = now => (typeof now === 'function' ? now() : (now == null ? Date.now() : (now instanceof Date ? now.getTime() : Number(now))));
  const round1 = n => Math.round(n * 10) / 10;

  /**
   * Tramos [s, e) de una serie de un dispositivo, con su relación con la banda.
   * `points` ordenado por tiempo. Un tramo solo existe entre dos lecturas
   * consecutivas separadas por no más de gapMaxMs.
   */
  const segmentsOf = (points, band, gapMaxMs) => {
    const out = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const p = points[i];
      const next = points[i + 1];
      const dt = next.t - p.t;
      if (dt <= 0 || dt > gapMaxMs) continue;
      out.push({
        s: p.t,
        e: next.t,
        below: band.min != null && p.v < band.min,
        above: band.max != null && p.v > band.max,
      });
    }
    return out;
  };

  /**
   * Une los tramos de todos los dispositivos con un barrido por eventos:
   * tiempo cubierto, tiempo fuera de banda (cualquiera), bajo y sobre la banda.
   */
  const mergeSegments = segments => {
    const events = [];
    segments.forEach(seg => {
      events.push({ t: seg.s, d: 1, below: seg.below ? 1 : 0, above: seg.above ? 1 : 0 });
      events.push({ t: seg.e, d: -1, below: seg.below ? -1 : 0, above: seg.above ? -1 : 0 });
    });
    events.sort((a, b) => a.t - b.t);
    let active = 0; let below = 0; let above = 0; let prev = null;
    let covered = 0; let out = 0; let belowMs = 0; let aboveMs = 0;
    events.forEach(ev => {
      if (prev != null && ev.t > prev && active > 0) {
        const len = ev.t - prev;
        covered += len;
        if (below > 0 || above > 0) out += len;
        if (below > 0) belowMs += len;
        if (above > 0) aboveMs += len;
      }
      active += ev.d; below += ev.below; above += ev.above;
      prev = ev.t;
    });
    return { coveredMs: covered, outOfBandMs: out, belowMs, aboveMs };
  };

  const effectiveWindow = (cycle, nowMs) => {
    const start = Date.parse(cycle.startAt);
    if (!Number.isFinite(start)) return null;
    const end = cycle.endAt ? Date.parse(cycle.endAt) : NaN;
    const hi = Number.isFinite(end) ? Math.min(end, nowMs) : nowMs;
    if (!(hi > start)) return null;
    return { start, end: hi };
  };

  /**
   * @param {object} args
   * @param {object[]} args.cycles    ciclos de sala del lote (ya filtrados por batchIds)
   * @param {object[]} args.readings  telemetría (sdp_telemetry_v1 o equivalente)
   * @param {number|Date|Function} [args.now]
   * @param {number} [args.gapMaxMs]
   * @param {number} [args.minCoverageRatio]
   * @returns {{ gapMaxMs, minCoverageRatio, hasCycles: boolean, rows: object[], skippedCycles: object[] }}
   */
  const buildCycleOutOfBand = ({ cycles = [], readings = [], now, gapMaxMs, minCoverageRatio } = {}) => {
    const telemetry = telemetryRef();
    const targets = targetsRef();
    const nowMs = resolveNow(now);
    const gap = Number.isFinite(gapMaxMs) && gapMaxMs > 0 ? gapMaxMs : defaultGapMaxMs();
    const minCov = Number.isFinite(minCoverageRatio) ? minCoverageRatio : MIN_COVERAGE_RATIO;
    const stageLabels = (targets && targets.STAGE_LABELS) || {};
    const result = { gapMaxMs: gap, minCoverageRatio: minCov, hasCycles: false, rows: [], skippedCycles: [] };
    if (!telemetry || !Number.isFinite(nowMs)) return result;

    const usable = (cycles || [])
      .filter(c => c && typeof c === 'object' && (c.state === 'active' || c.state === 'closed'))
      .sort((a, b) => String(a.startAt).localeCompare(String(b.startAt)));
    result.hasCycles = usable.length > 0;

    const normalized = (readings || []).filter(r => r && typeof r === 'object').map(r => telemetry.normalizeTelemetry(r));

    usable.forEach(cycle => {
      const win = effectiveWindow(cycle, nowMs);
      const stageLabel = stageLabels[cycle.stage] || cycle.stage || 'Etapa sin nombre';
      const metrics = Object.entries(cycle.targets || {})
        .filter(([metric, band]) => telemetry.METRICS[metric] && band && (band.min != null || band.max != null));
      if (!win || !metrics.length) {
        result.skippedCycles.push({ cycleId: cycle.id, stage: cycle.stage, stageLabel, reason: !win ? 'sin ventana de tiempo' : 'sin bandas en el ciclo' });
        return;
      }
      const windowMs = win.end - win.start;
      const inCycle = normalized.filter(r => r.quality === 'valid' && r.value != null
        && telemetry.readingBelongsToCycle(r, cycle) && Date.parse(r.observed_at) <= win.end);

      metrics.forEach(([metric, band]) => {
        const byDevice = new Map();
        inCycle.filter(r => r.metric === metric).forEach(r => {
          const list = byDevice.get(r.device_id) || [];
          list.push({ t: Date.parse(r.observed_at), v: r.value });
          byDevice.set(r.device_id, list);
        });
        const segments = [];
        let readingCount = 0;
        byDevice.forEach(points => {
          points.sort((a, b) => a.t - b.t);
          readingCount += points.length;
          segments.push(...segmentsOf(points, band, gap));
        });
        const merged = mergeSegments(segments);
        const coverageRatio = windowMs > 0 ? Math.min(1, merged.coveredMs / windowMs) : 0;
        const base = {
          cycleId: cycle.id,
          roomId: cycle.roomId,
          stage: cycle.stage,
          stageLabel,
          cycleState: cycle.state,
          metric,
          metricLabel: METRIC_LABELS[metric] || metric,
          unit: telemetry.METRICS[metric].unit,
          band: { min: band.min == null ? null : band.min, max: band.max == null ? null : band.max, source: band.source || null },
          windowMs,
          coveredMs: merged.coveredMs,
          coverageRatio,
          readingCount,
        };
        if (!(coverageRatio >= minCov) || merged.coveredMs <= 0) {
          result.rows.push({ ...base, status: 'insufficient', outOfBandMs: null, outOfBandHours: null, belowHours: null, aboveHours: null, coveredHours: round1(merged.coveredMs / HOUR_MS) });
          return;
        }
        result.rows.push({
          ...base,
          status: 'ok',
          outOfBandMs: merged.outOfBandMs,
          outOfBandHours: round1(merged.outOfBandMs / HOUR_MS),
          belowHours: round1(merged.belowMs / HOUR_MS),
          aboveHours: round1(merged.aboveMs / HOUR_MS),
          coveredHours: round1(merged.coveredMs / HOUR_MS),
        });
      });
    });
    return result;
  };

  const api = { MIN_COVERAGE_RATIO, FALLBACK_GAP_MAX_MS, METRIC_LABELS, defaultGapMaxMs, buildCycleOutOfBand };
  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasCycleOutOfBand = api;
})();
