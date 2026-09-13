'use strict';

// Plan de lanzamiento de lote: cantidades por insumo (base seca → kg tal cual se
// recibe, porque así se registra la bodega), ítems en unidades, asignación FIFO
// y faltantes. Puro: no toca inventario ni almacenamiento.
(function initLaunchPlan() {
const EPS = 1e-6;
const round3 = x => Math.round(x * 1000) / 1000;
const clampMoisture = pct => Math.min(0.92, Math.max(0, (Number(pct) || 0) / 100));
const lotTime = l => new Date(l.fechaIngreso || l.fechaCompra || 0).getTime() || 0;

const unidadDe = (lot, unitIngredientIds = []) =>
  lot.unidad || (unitIngredientIds.includes(lot.ingredienteId) ? 'ud' : 'kg');
const cantidadDisponible = lot => Number(lot.cantidadKgDisponible) || 0;

function allocate(inventoryLots, ingredientId, needed, unidad, unitIngredientIds) {
  const lots = inventoryLots
    .filter(l => l.activo && l.ingredienteId === ingredientId && cantidadDisponible(l) > EPS && unidadDe(l, unitIngredientIds) === unidad)
    .sort((a, b) => lotTime(a) - lotTime(b));
  const allocations = [];
  let remaining = needed;
  for (const l of lots) {
    if (remaining <= EPS) break;
    const take = Math.min(cantidadDisponible(l), remaining);
    allocations.push({ ingredientId, lotId: l.id, quantity: unidad === 'ud' ? take : round3(take), unidad });
    remaining -= take;
  }
  const missing = remaining > EPS ? (unidad === 'ud' ? remaining : round3(remaining)) : 0;
  return { allocations, missing };
}

function buildLaunchPlan({
  recipe = [], bags, kgPerBag, moistureTarget, ingredients = [], inventoryLots = [],
  moistureOverrides = {}, scaleG = 0, spawn = null, bagUnit = null, unitIngredientIds = [],
} = {}) {
  if (!(Number(bags) > 0) || !(Number(kgPerBag) > 0)) throw new Error('bags y kgPerBag deben ser > 0');
  if (!(Number(moistureTarget) > 0 && Number(moistureTarget) < 100)) throw new Error('moistureTarget fuera de rango (0–100)');
  const byId = new Map(ingredients.map(i => [i.id, i]));
  const unitIds = [...new Set([...(unitIngredientIds || []), ...(bagUnit ? [bagUnit.ingredientId] : [])])];

  const wetKg = bags * kgPerBag;
  const dryKg = wetKg * (1 - moistureTarget / 100);
  const items = [];
  let intrinsic = 0;
  for (const row of recipe) {
    const g = byId.get(row.id);
    if (!g) throw new Error(`Ingrediente desconocido: ${row.id}`);
    const pct = parseFloat(row.p ?? row.pct) || 0;
    if (pct <= 0) continue;
    const m = clampMoisture(moistureOverrides[row.id] ?? g.moisture);
    const itemDry = dryKg * pct / 100;
    let asReceived = itemDry / (1 - m);
    // Redondeo al incremento de báscula más cercano; +1e-9 absorbe el error de coma flotante (0.35/0.8 = 0.43749999…).
    if (scaleG > 0) asReceived = Math.round((asReceived * 1000) / scaleG + 1e-9) * scaleG / 1000;
    const water = asReceived * m;
    intrinsic += water;
    items.push({
      ingredientId: g.id, name: g.name, unidad: 'kg',
      dryKg: round3(itemDry), asReceivedKg: round3(asReceived), intrinsicWaterKg: round3(water),
      cost: Math.round(asReceived * (Number(g.cost) || 0)),
    });
  }

  const spawnItem = spawn && spawn.kg > 0 ? { ingredientId: spawn.ingredientId, unidad: 'kg', asReceivedKg: round3(spawn.kg) } : null;
  const unitItems = bagUnit && bagUnit.units > 0 ? [{ ingredientId: bagUnit.ingredientId, unidad: 'ud', units: bagUnit.units }] : [];

  const allocations = [];
  const shortfalls = [];
  const need = [
    ...items.map(i => [i.ingredientId, i.asReceivedKg, 'kg']),
    ...(spawnItem ? [[spawnItem.ingredientId, spawnItem.asReceivedKg, 'kg']] : []),
    ...unitItems.map(u => [u.ingredientId, u.units, 'ud']),
  ];
  for (const [ingredientId, needed, unidad] of need) {
    const r = allocate(inventoryLots, ingredientId, needed, unidad, unitIds);
    allocations.push(...r.allocations);
    if (r.missing > 0) {
      const available = unidad === 'ud' ? needed - r.missing : round3(needed - r.missing);
      shortfalls.push({ ingredientId, needed, available, missing: r.missing, unidad });
    }
  }

  const totalWater = wetKg - dryKg;
  return {
    totals: {
      wetKg: round3(wetKg), dryKg: round3(dryKg),
      asReceivedKg: round3(items.reduce((s, i) => s + i.asReceivedKg, 0)),
      intrinsicWaterKg: round3(intrinsic),
      waterToAddKg: round3(Math.max(0, totalWater - intrinsic)),
    },
    items, spawnItem, unitItems, allocations, shortfalls,
  };
}

const api = { buildLaunchPlan, unidadDe, cantidadDisponible };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasLaunchPlan = api;
}
})();
