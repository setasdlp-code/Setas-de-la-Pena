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

// Promedio de umbrales de varias especies (un sustrato agrupa lotes de especies
// distintas). Con una sola especie conocida devuelve las de esa especie; sin
// especies, el fallback.
function mixThresholds(speciesKeys) {
  const list = (Array.isArray(speciesKeys) ? speciesKeys : []).map(beThresholds);
  if (!list.length) return beThresholds(null);
  const avg = k => list.reduce((a, t) => a + t[k], 0) / list.length;
  const known = list.filter(t => t.source === 'species').length;
  return { alert: avg('alert'), target: avg('target'), optimal: avg('optimal'), source: known === list.length ? 'species' : (known ? 'mixed' : 'fallback') };
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

const api = { FALLBACK_BE, BE_THRESHOLDS, CONTAM_GREEN_MAX, CONTAM_AMBER_MAX, CONTAM_STOP_MIN, beThresholds, mixThresholds, classifyBe, contamLevel };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof globalThis !== 'undefined') globalThis.SetasKpiThresholds = api;
})();
