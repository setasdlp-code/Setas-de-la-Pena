'use strict';

/**
 * @file room-node-setpoints.js — Consignas de compilación del nodo ESP32 desde
 * el ciclo de sala activo (room-cycle.v1).
 *
 * Opción A (DEC-001): el control vive en el ESP32 y Setas OS solo lee. Este
 * módulo NO manda nada al nodo: produce las sustituciones `-s clave valor` con
 * las que el operario valida y compila el firmware (cloudlab_esp32.yaml y el
 * paquete esphome/modulo-fructificacion.package.yaml). Sin ellas el firmware no
 * valida (marcadores PENDIENTE_*).
 *
 * Reglas:
 *  - Solo un ciclo `active`, válido (room-cycle.js) y vigente en `now`, de la
 *    sala del perfil.
 *  - Banda `temperature_c` con min y max: heat_setpoint_c = min + histéresis
 *    (el termostato arranca en min y para en min + 2·histéresis) y
 *    temp_max_c = max (techo: alarma y calefacción OFF). Exige
 *    min + 2·histéresis <= max.
 *  - La histéresis NO está en el ciclo ni en knowledge_base/ para
 *    fructificación: la aporta el operario (`operator.histeresis_c`).
 *  - Una banda con source 'kb-literature' se RECHAZA salvo confirmación
 *    explícita del operario para esa métrica (`operator.confirmations`).
 *  - No inventa ni redondea consignas: copia los números del ciclo.
 *
 * Patrón UMD como el resto de módulos puros; reloj inyectable (`now`).
 */
(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const roomCycle = isNode ? require('./room-cycle.js') : globalThis.SetasRoomCycle;
  const targets = isNode ? require('./room-cycle-targets.js') : globalThis.SetasRoomCycleTargets;

  const SCHEMA = 'setas.node-setpoints.v1';
  const CONTROL_METRIC = 'temperature_c';

  const resolveNow = now => (typeof now === 'function' ? now() : (now == null ? Date.now() : (now instanceof Date ? now.getTime() : Number(now))));
  const safeId = value => String(value || '').replace(/[^A-Za-z0-9_.:-]/g, '_').slice(0, 60);
  const fmt = n => String(n);
  const compactTime = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const confirmationFor = (operator, metric) => {
    const c = operator && operator.confirmations && operator.confirmations[metric];
    if (!c || typeof c !== 'object') return null;
    const by = typeof c.confirmedBy === 'string' ? c.confirmedBy.trim() : '';
    const at = Date.parse(c.confirmedAt);
    return by && Number.isFinite(at) ? { confirmedBy: by, confirmedAt: new Date(at).toISOString() } : null;
  };

  /**
   * @param {object} args
   * @param {object} args.profile  entrada de node-control-profiles.json
   * @param {object[]} args.cycles ciclos de sala (room-cycle.v1)
   * @param {object} [args.operator] { histeresis_c, confirmations: { metric: { confirmedBy, confirmedAt } }, photoperiod: { onHour, offHour, confirmedBy } }
   * @param {number|Date|Function} [args.now]
   * @returns {{ ok: boolean, errors: string[], warnings: string[], substitutions: object, args: string[], provenance: object|null }}
   */
  const buildNodeSubstitutions = ({ profile, cycles = [], operator = {}, now } = {}) => {
    const errors = [];
    const warnings = [];
    const fail = () => ({ schema: SCHEMA, ok: false, errors, warnings, substitutions: {}, args: [], provenance: null });
    const nowMs = resolveNow(now);
    if (!Number.isFinite(nowMs)) { errors.push('invalid clock'); return fail(); }
    if (!profile || !profile.roomId) { errors.push('missing room profile'); return fail(); }
    if (!profile.heating || profile.heating.metric !== CONTROL_METRIC) { errors.push(`profile ${profile.roomId}: heating.metric must be ${CONTROL_METRIC}`); return fail(); }

    const cycle = targets.activeCycleForRoom(cycles, profile.roomId, nowMs);
    if (!cycle) { errors.push(`no active room cycle for ${profile.roomId}`); return fail(); }
    const cycleErrors = roomCycle.validateRoomCycle(cycle);
    if (cycleErrors.length) { cycleErrors.forEach(e => errors.push(`cycle ${cycle.id || '?'}: ${e}`)); return fail(); }
    const normalized = roomCycle.normalizeRoomCycle(cycle);

    const band = normalized.targets[CONTROL_METRIC];
    if (!band) { errors.push(`${CONTROL_METRIC}: band missing in cycle ${normalized.id}`); return fail(); }
    if (band.min == null) errors.push(`${CONTROL_METRIC}: min required to derive a heating setpoint`);
    if (band.max == null) errors.push(`${CONTROL_METRIC}: max required for the over-temperature limit`);
    if (band.min != null && band.max != null && band.min > band.max) errors.push(`${CONTROL_METRIC}: min exceeds max`);

    const bandsUsed = { [CONTROL_METRIC]: band };
    const confirmations = {};
    for (const [metric, b] of Object.entries(bandsUsed)) {
      if (b.source !== 'kb-literature') continue;
      const c = confirmationFor(operator, metric);
      if (!c) errors.push(`${metric}: band source is kb-literature (not an approved setpoint); explicit operator confirmation required`);
      else confirmations[metric] = c;
    }
    for (const metric of Object.keys(normalized.targets)) {
      if (metric !== CONTROL_METRIC) warnings.push(`${metric}: not controlled by this node; band ignored`);
    }

    const h = operator && typeof operator.histeresis_c === 'number' ? operator.histeresis_c : NaN;
    if (!Number.isFinite(h) || h <= 0) errors.push('histeresis_c: positive operator value required (no source in knowledge_base/)');
    else if (band.min != null && band.max != null && band.min + 2 * h > band.max) errors.push(`histeresis_c: min + 2·histeresis (${band.min + 2 * h}) exceeds max (${band.max})`);

    const subs = {};
    const p = operator && operator.photoperiod;
    if (p != null) {
      const okHours = Number.isInteger(p.onHour) && Number.isInteger(p.offHour) && p.onHour >= 0 && p.offHour > p.onHour && p.offHour <= 24;
      if (!okHours) errors.push('photoperiod: onHour/offHour must be integers with 0 <= onHour < offHour <= 24');
      else if (typeof p.confirmedBy !== 'string' || !p.confirmedBy.trim()) errors.push('photoperiod: confirmedBy required (no approved photoperiod in knowledge_base/)');
      else { subs.luz_on_hora = fmt(p.onHour); subs.luz_off_hora = fmt(p.offHour); }
    }

    if (errors.length) return fail();

    const heatSetpoint = Math.round((band.min + h) * 1000) / 1000;
    const consignaId = `${safeId(normalized.id)}@${compactTime(nowMs)}`;
    Object.assign(subs, {
      heat_setpoint_c: fmt(heatSetpoint),
      histeresis_c: fmt(h),
      temp_max_c: fmt(band.max),
      consigna_id: consignaId,
    });
    const args = Object.entries(subs).flatMap(([k, v]) => ['-s', k, v]);
    return {
      schema: SCHEMA,
      ok: true,
      errors,
      warnings,
      substitutions: subs,
      args,
      provenance: {
        roomId: profile.roomId,
        firmware: profile.firmware || null,
        cycleId: normalized.id,
        speciesId: normalized.speciesId,
        stage: normalized.stage,
        band: { min: band.min, max: band.max, source: band.source },
        hysteresis: { value: h, source: 'manual' },
        confirmations,
        generatedAt: new Date(nowMs).toISOString(),
        commissioned: profile.commissioned === true,
      },
    };
  };

  const api = { SCHEMA, CONTROL_METRIC, buildNodeSubstitutions };
  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasRoomNodeSetpoints = api;
})();
