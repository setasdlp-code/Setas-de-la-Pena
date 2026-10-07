'use strict';

/**
 * @file room-cycle-targets.js — Bandas sugeridas para un ciclo de sala.
 *
 * Al iniciar un ciclo de sala (room-cycle.js) el formulario propone bandas de
 * clima por especie y etapa. La fuente es knowledge_base/metadata/species.yaml,
 * que separa tres clases de valor (agronomic-claims):
 *
 *   - operativo (`incubation_temp_c`, `fruiting_temp_c`, `humidity_percent`,
 *     `fruiting_co2_ppm_max`, `incubation_core_temp_max_c`): aprobado para la
 *     granja → source 'kb-operational';
 *   - literatura (`literature_*`): referencia publicada, no aprobada como
 *     consigna → source 'kb-literature';
 *   - null: sin valor; no se sugiere nada y el operario decide.
 *
 * Lo que el operario confirma o escribe es una consigna de la granja (setpoint):
 * la banda guardada en el ciclo lleva `source` para que nadie confunda una
 * referencia de literatura con una consigna aprobada.
 *
 * KB_SPECIES es una copia de species.yaml; room-cycle-targets.test.js la
 * compara con el archivo para que no se desincronicen.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const KB_SOURCE = 'knowledge_base/metadata/species.yaml';

  const KB_SPECIES = Object.freeze({
    pleurotus_ostreatus: {
      incubation_temp_c: [20, 24],
      incubation_core_temp_max_c: 28,
      fruiting_temp_c: [13, 24],
      humidity_percent: [85, 95],
      fruiting_co2_ppm_max: 1000,
    },
    lentinula_edodes: {
      incubation_temp_c: [21, 27],
      incubation_temp_optimal_c: 25,
      incubation_core_temp_max_c: 28,
      fruiting_temp_c: null,
      literature_humidity_percent: [80, 95],
      humidity_percent: null,
      fruiting_co2_ppm_max: null,
    },
    hericium_erinaceus: {
      literature_fruiting_temp_c: [16, 24],
      literature_incubation_temp_c: [21, 25],
      literature_humidity_percent: [85, 95],
      fruiting_temp_c: null,
      humidity_percent: null,
      fruiting_co2_ppm_max: null,
    },
    pleurotus_djamor: {
      literature_fruiting_temp_c: [22, 32],
      literature_incubation_temp_c: [24, 32],
      literature_humidity_percent: [80, 90],
      fruiting_temp_c: null,
      humidity_percent: null,
      fruiting_co2_ppm_max: null,
    },
    ganoderma_lucidum: {
      fruiting_temp_c: [27, 32],
      incubation_temp_c: [25, 32],
      humidity_percent: [30, 90],
      fruiting_co2_ppm_max: 2000,
    },
  });

  // Clave de especie de la app (flush-forecast-engine / SPP) → id de species.yaml.
  // Orellana blanca es Pleurotus ostreatus var. florida: comparte ficha.
  // Las especies sin ficha en species.yaml no reciben sugerencia.
  const APP_TO_KB = Object.freeze({
    p_ostreatus_gris: 'pleurotus_ostreatus',
    p_ostreatus_blanco: 'pleurotus_ostreatus',
    orellana_gris: 'pleurotus_ostreatus',
    orellana_blanca: 'pleurotus_ostreatus',
    p_djamor_rosa: 'pleurotus_djamor',
    orellana_rosa: 'pleurotus_djamor',
    shiitake: 'lentinula_edodes',
    lions_mane: 'hericium_erinaceus',
    melena_de_leon: 'hericium_erinaceus',
    reishi: 'ganoderma_lucidum',
  });

  const STAGE_LABELS = Object.freeze({
    cooling: 'Enfriamiento',
    incubation: 'Incubación',
    maturation: 'Maduración',
    induction: 'Inducción',
    fruiting: 'Fructificación',
    resting: 'Reposo',
    quarantine: 'Cuarentena',
  });

  // Orden de avance de etapa; cuarentena y enfriamiento no se sugieren como
  // "siguiente" porque no son parte del avance normal de una sala.
  const NEXT_STAGE = Object.freeze({
    incubation: 'induction',
    maturation: 'induction',
    induction: 'fruiting',
    fruiting: 'resting',
    resting: 'fruiting',
  });

  const SOURCE_LABELS = Object.freeze({
    'kb-operational': 'Consigna aprobada (KB)',
    'kb-literature': 'Literatura (KB) · sin aprobar',
    manual: 'Consigna de la granja',
  });

  const norm = key => String(key || '').trim().toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[-\s]+/g, '_');

  const kbIdFor = speciesKey => APP_TO_KB[norm(speciesKey)] || (KB_SPECIES[norm(speciesKey)] ? norm(speciesKey) : null);

  const range = (operational, literature, extra = {}) => {
    if (Array.isArray(operational)) return { min: operational[0], max: operational[1], ...extra, source: 'kb-operational' };
    if (Array.isArray(literature)) return { min: literature[0], max: literature[1], source: 'kb-literature' };
    return null;
  };

  /**
   * Bandas sugeridas para especie × etapa.
   * @returns {{ kbId: string|null, targets: object, citation: string }}
   *   targets: { metric: { min?, max?, target?, source } } — solo métricas con valor
   */
  const suggestTargets = (speciesKey, stage) => {
    const kbId = kbIdFor(speciesKey);
    const s = kbId ? KB_SPECIES[kbId] : null;
    const targets = {};
    if (!s) return { kbId: null, targets, citation: KB_SOURCE };

    if (stage === 'incubation' || stage === 'maturation') {
      const t = range(s.incubation_temp_c, s.literature_incubation_temp_c,
        Number.isFinite(s.incubation_temp_optimal_c) ? { target: s.incubation_temp_optimal_c } : {});
      if (t) targets.temperature_c = t;
      // Techo de NÚCLEO, no consigna: solo max (ver species.yaml).
      if (Number.isFinite(s.incubation_core_temp_max_c)) {
        targets.substrate_temperature_c = { max: s.incubation_core_temp_max_c, source: 'kb-operational' };
      }
    } else if (stage === 'induction' || stage === 'fruiting' || stage === 'resting') {
      const t = range(s.fruiting_temp_c, s.literature_fruiting_temp_c);
      if (t) targets.temperature_c = t;
      const rh = range(s.humidity_percent, s.literature_humidity_percent);
      if (rh) targets.rh_pct = rh;
      if (Number.isFinite(s.fruiting_co2_ppm_max)) targets.co2_ppm = { max: s.fruiting_co2_ppm_max, source: 'kb-operational' };
    }
    return { kbId, targets, citation: KB_SOURCE };
  };

  /**
   * Bandas que usa el motor de anomalías: las de la sala, y encima las del
   * ciclo activo de esa sala, métrica por métrica. Una métrica sin banda en el
   * ciclo conserva la de la sala.
   *
   * @param {object} roomBands  ROOM_TARGET_BANDS
   * @param {object[]} cycles   ciclos de sala (room-cycle.v1)
   * @param {number} [now]
   */
  const effectiveBands = (roomBands = {}, cycles = [], now = Date.now()) => {
    const out = {};
    for (const [roomId, bands] of Object.entries(roomBands || {})) out[roomId] = { ...bands };
    for (const c of activeCycles(cycles, now)) {
      const merged = { ...(out[c.roomId] || {}) };
      for (const [metric, band] of Object.entries(c.targets || {})) {
        if (!band || (band.min == null && band.max == null)) continue;
        const clean = {};
        if (band.min != null) clean.min = band.min;
        if (band.max != null) clean.max = band.max;
        if (band.target != null) clean.target = band.target;
        merged[metric] = clean;
      }
      out[c.roomId] = merged;
    }
    return out;
  };

  /** Ciclos activos ahora (estado 'active' y dentro de su ventana). */
  const activeCycles = (cycles = [], now = Date.now()) => (cycles || []).filter(c => {
    if (!c || c.state !== 'active') return false;
    const start = Date.parse(c.startAt);
    const end = c.endAt ? Date.parse(c.endAt) : null;
    return Number.isFinite(start) && start <= now && (end == null || !Number.isFinite(end) || end >= now);
  });

  const activeCycleForRoom = (cycles, roomId, now = Date.now()) =>
    activeCycles(cycles, now).filter(c => c.roomId === roomId)
      .sort((a, b) => String(b.startAt).localeCompare(String(a.startAt)))[0] || null;

  const api = {
    KB_SOURCE,
    KB_SPECIES,
    APP_TO_KB,
    STAGE_LABELS,
    NEXT_STAGE,
    SOURCE_LABELS,
    kbIdFor,
    suggestTargets,
    effectiveBands,
    activeCycles,
    activeCycleForRoom,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasRoomCycleTargets = api;
})();
