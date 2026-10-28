'use strict';

// Umbrales de KPI como funciones puras: meta de eficiencia biologica (BE) por
// especie y semaforo de contaminacion por lote.
//
// PROCEDENCIA (agronomic-claims): son PROPUESTAS de la corroboracion 2026-10,
// no mediciones de esta finca. Se toman tal cual de
//   knowledge_base/06_operations/production_schedule.md ("Propuesta de umbrales de BE
//   por especie") y knowledge_base/02_substrates/contamination.md ("Semaforo de
//   contaminacion por lote"). Confianza media-baja (ganoderma media; djamor y hericium
//   baja). Base seca, ciclo total, referencia de literatura. Cuando exista corpus de
//   campo se calibran contra el y se separan por numero de cosecha. La KB manda: si
//   cambian alla, cambian aqui (check_kb_sync.py vigila las cifras).
(function initKpiThresholds() {
// Especie desconocida: los valores escalares que la app usaba antes (KPI.beAlert/
// beTarget/beOptimal), rango documentado 40-70 % de production_schedule.md.
const FALLBACK_BE = Object.freeze({ alert: 40, target: 55, optimal: 70 });

const BE_THRESHOLDS = Object.freeze({
  pleurotus_ostreatus: Object.freeze({ alert: 40, target: 60, optimal: 80 }),
  pleurotus_djamor:    Object.freeze({ alert: 30, target: 50, optimal: 70 }),
  lentinula_edodes:    Object.freeze({ alert: 40, target: 55, optimal: 75 }),
  hericium_erinaceus:  Object.freeze({ alert: 30, target: 50, optimal: 80 }),
  ganoderma_lucidum:   Object.freeze({ alert: 5,  target: 10, optimal: 15 }),
});

// Techos de cada nivel (% de bolsas contaminadas, <= incluyente). 'stop' (>=15) es el
// limite inferior del "Critico >=15-20 %" de la KB: detener el lote y auditar proceso.
const CONTAM_GREEN_MAX = 5;
const CONTAM_AMBER_MAX = 10;
const CONTAM_STOP_MIN = 15;

function beThresholds(speciesKey) {
  const t = Object.prototype.hasOwnProperty.call(BE_THRESHOLDS, speciesKey) ? BE_THRESHOLDS[speciesKey] : null;
  return t ? { ...t, source: 'species' } : { ...FALLBACK_BE, source: 'fallback' };
}

// Clave de umbral a partir del nombre cientifico del catalogo ("Pleurotus ostreatus" ->
// "pleurotus_ostreatus"). Solo coincidencias exactas: P. florida, eryngii, enoki o nameko
// no tienen fila en la KB y caen al fallback, no a la especie "mas parecida".
function beKeyFromScientific(sci) {
  if (typeof sci !== 'string') return null;
  const k = sci.trim().toLowerCase().replace(/\s+/g, '_');
  return Object.prototype.hasOwnProperty.call(BE_THRESHOLDS, k) ? k : null;
}

const BE_RANK = Object.freeze({ alert: 0, warn: 1, ok: 2, optimal: 3 });

// Grupo de lotes de varias especies: cada especie se compara con SUS umbrales y se
// devuelve la peor. Promediar umbrales mezcla escalas (Ganoderma meta 10, Pleurotus 60)
// y el resultado dependeria de cuantos lotes hay de cada una, no de como rindieron.
// entries: [{ speciesKey, be }]. Devuelve null si ninguna BE es numerica.
function worstBeStatus(entries) {
  const groups = new Map();
  (Array.isArray(entries) ? entries : []).forEach(e => {
    const v = Number(e && e.be);
    if (e == null || e.be == null || !Number.isFinite(v)) return;
    const key = e.speciesKey && Object.prototype.hasOwnProperty.call(BE_THRESHOLDS, e.speciesKey) ? e.speciesKey : null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(v);
  });
  const bySpecies = [...groups].map(([speciesKey, vals]) => {
    const be = vals.reduce((a, x) => a + x, 0) / vals.length;
    const t = beThresholds(speciesKey);
    return { speciesKey, be, n: vals.length, status: classifyBe(be, t), source: t.source };
  });
  if (!bySpecies.length) return null;
  const worst = bySpecies.reduce((w, r) => (BE_RANK[r.status] < BE_RANK[w.status] ? r : w));
  return { ...worst, bySpecies };
}

// alert < t.alert <= warn < t.target <= ok < t.optimal <= optimal
function classifyBe(be, thresholds) {
  const t = thresholds || FALLBACK_BE;
  const v = Number(be);
  if (!Number.isFinite(v)) return null;
  if (v >= t.optimal) return 'optimal';
  if (v >= t.target) return 'ok';
  if (v >= t.alert) return 'warn';
  return 'alert';
}

// 'green' <=5 | 'amber' >5-10 (revisar protocolo) | 'red' >10 (auditar) | 'stop' >=15 (detener).
function contamLevel(pct) {
  const v = Number(pct);
  if (pct === null || pct === undefined || pct === '' || !Number.isFinite(v) || v < 0) return null;
  if (v >= CONTAM_STOP_MIN) return 'stop';
  if (v > CONTAM_AMBER_MAX) return 'red';
  if (v > CONTAM_GREEN_MAX) return 'amber';
  return 'green';
}

const api = { FALLBACK_BE, BE_THRESHOLDS, CONTAM_GREEN_MAX, CONTAM_AMBER_MAX, CONTAM_STOP_MIN, beThresholds, beKeyFromScientific, worstBeStatus, classifyBe, contamLevel };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof globalThis !== 'undefined') globalThis.SetasKpiThresholds = api;
})();
