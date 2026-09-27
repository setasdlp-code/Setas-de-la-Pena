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

// Versioned, immutable preparation specification. All numbers are planned, not
// observations of an executed batch. Preserve target recipe and rounded mass separately.
const precise = x => Math.round(x * 1e9) / 1e9;
const finite = x => x !== '' && x != null && Number.isFinite(Number(x));
const freeze = value => { if(value && typeof value === 'object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value; };
function buildPreparationSnapshot({recipe=[], ingredients=[], moistureOverrides={}, lockedIds=[], speciesKey='', bags, kgPerBag, moistureTarget, scaleG=0.1, spawnPct=8}={}) {
  const locks=new Set(lockedIds), byId=new Map(ingredients.map(g=>[g.id,g]));
  const composition=recipe.map(r=>({id:r.id,p:Number(r.p??r.pct),locked:locks.has(r.id)}));
  if(!composition.length || new Set(composition.map(r=>r.id)).size!==composition.length || composition.some(r=>!Number.isFinite(r.p)||r.p<=0) || Math.abs(composition.reduce((s,r)=>s+r.p,0)-100)>0.15) throw new Error('La receta debe cerrar al 100% ±0,15%.');
  if(!finite(bags)||!Number.isInteger(Number(bags))||Number(bags)<=0||!finite(kgPerBag)||Number(kgPerBag)<=0) throw new Error('Tamaño de lote inválido.');
  if(!finite(moistureTarget)||Number(moistureTarget)<=0||Number(moistureTarget)>=100) throw new Error('Objetivo de humedad inválido.');
  if(!finite(scaleG)||Number(scaleG)<=0) throw new Error('Resolución de báscula inválida.');
  // Existing calcBatch effective clamps; not new biological thresholds.
  const h=Math.min(0.85,Math.max(0.40,Number(moistureTarget)/100));
  const rate=Math.min(0.15,Math.max(0.05,(Number(spawnPct)||8)/100));
  const wet=Number(bags)*Number(kgPerBag), dry=wet*(1-h);
  const items=composition.map(r=>{
    const g=byId.get(r.id);if(!g)throw new Error(`Ingrediente desconocido: ${r.id}`);
    const measured=moistureOverrides[r.id]!=null&&moistureOverrides[r.id]!=='';
    const raw=measured?moistureOverrides[r.id]:g.moisture;
    if(!finite(raw)||Number(raw)<0||Number(raw)>92)throw new Error(`Falta una humedad válida: ${r.id}`);
    const m=Number(raw)/100, targetDry=dry*r.p/100, theoretical=targetDry/(1-m);
    const received=precise(Math.round(theoretical*1000/Number(scaleG)+1e-9)*Number(scaleG)/1000);
    return {ingredientId:r.id,name:g.name||r.id,percentage:r.p,moisture:{pct:Number(raw),basis:'wet',source:measured?'operator-measured':'catalog-estimate',reference:measured?'Entrada del operador para esta preparación':'Catálogo activo; no es medición del lote'},targetDryKg:precise(targetDry),theoreticalWetKg:precise(theoretical),asReceivedKg:received,dryKg:precise(received*(1-m)),intrinsicWaterKg:precise(received*m),inventoryKg:round3(received)};
  });
  const actualDry=items.reduce((s,i)=>s+i.dryKg,0), intrinsic=items.reduce((s,i)=>s+i.intrinsicWaterKg,0), received=items.reduce((s,i)=>s+i.asReceivedKg,0);
  const neededWater=actualDry*h/(1-h), water=Math.max(0,neededWater-intrinsic), prepared=received+water;
  const value={schemaVersion:1,speciesKey,recipeBasis:'dry-substrate',quantityBasis:'as-received-wet',recipe:composition,target:{bags:Number(bags),kgPerBag:Number(kgPerBag),wetKg:precise(wet),dryKg:precise(dry),requestedMoisturePct:Number(moistureTarget),moisturePct:precise(h*100)},weighing:{resolutionG:Number(scaleG),inventoryResolutionG:1,inventoryConversion:'round-to-nearest-gram'},items,totals:{dryKg:precise(actualDry),asReceivedKg:precise(received),intrinsicWaterKg:precise(intrinsic),waterToAddKg:precise(water),waterExcessKg:precise(Math.max(0,intrinsic-neededWater)),preparedWetKg:precise(prepared),resultingMoisturePct:precise((intrinsic+water)/prepared*100)},spawn:{ingredientId:'spawn_grano',pct:precise(rate*100),kg:precise(wet*rate),basis:'target-wet-substrate-excluding-spawn'}};
  let hash=2166136261;for(const ch of JSON.stringify(value))hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  return freeze({...value,revision:'prep-v1-'+hash.toString(16).padStart(8,'0')});
}
const isPreparationCurrent=(preview,current)=>!!preview&&!!current&&JSON.stringify(preview)===JSON.stringify(current);

function buildLaunchPlan({
  recipe = [], bags, kgPerBag, moistureTarget, ingredients = [], inventoryLots = [],
  moistureOverrides = {}, scaleG = 0, spawn = null, bagUnit = null, unitIngredientIds = [], preparation = null,
} = {}) {
  if(preparation){
    if(preparation.schemaVersion!==1)throw new Error('Versión de preparación desconocida.');
    recipe=preparation.recipe;bags=preparation.target.bags;kgPerBag=preparation.target.kgPerBag;moistureTarget=preparation.target.moisturePct;
    ingredients=preparation.items.map(i=>({id:i.ingredientId,name:i.name,moisture:i.moisture.pct,cost:ingredients.find(g=>g.id===i.ingredientId)?.cost||0}));
    moistureOverrides={};scaleG=preparation.weighing.resolutionG;spawn=preparation.spawn;
  }
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
  if(preparation){
    for(const item of items){const spec=preparation.items.find(i=>i.ingredientId===item.ingredientId);item.dryKg=round3(spec.dryKg);}
  }
  return {
    totals: {
      wetKg: round3(wetKg), dryKg: round3(dryKg),
      asReceivedKg: round3(items.reduce((s, i) => s + i.asReceivedKg, 0)),
      intrinsicWaterKg: round3(intrinsic),
      waterToAddKg: preparation ? preparation.totals.waterToAddKg : round3(Math.max(0, totalWater - intrinsic)),
    },
    items, spawnItem, unitItems, allocations, shortfalls,
    ...(preparation?{preparation}:{}),
  };
}

// Construye el lote de Bitácora y sus bolsas a partir del plan de lanzamiento.
// Puro: no toca localStorage ni Firestore — eso lo hace el componente.
// `estado` decide en qué etapa NACE el lote. Por defecto sigue siendo
// 'incubacion', que es como nacía siempre: el lote aparecía ya inoculado y en
// incubación, saltándose mezcla, tratamiento térmico, enfriado e inoculación —
// cuatro etapas que sí ocurren en la finca y que nadie registraba. El camino de
// planificación pasa 'planificado' (→ `planned` vía LEGACY_STATE_ALIASES) para
// que esas etapas se registren cuando de verdad pasan. Se escribe `estado`, el
// campo legado, y nunca `lifecycleState`: ese lo escribe el servidor
// (client-invariants.test.js lo vigila).
function buildLoteRecords({ form, plan, analysis = null, treatmentName = null, recipe = [], sKey, recipeName = '', score = 0, now, estado = 'incubacion', objetivo = null }) {
  const spec=plan.preparation;
  const nb = spec ? spec.target.bags : Number(form.numBolsas) || 0;
  const kb = spec ? spec.target.kgPerBag : Number(form.pesoHumedo) || 0;
  const hm = spec ? spec.target.moisturePct : Number(form.humedad) || 0;
  const loteId = 'BIT_' + now;
  const lote = {
    id: loteId,
    codigo: form.codigo,
    especie: form.especie,
    especieCientifico: form.especieCientifico,
    cepa: form.cepa,
    fechaMezcla: form.fechaMezcla,
    fechaInoculacion: form.fechaInoculacion,
    numBolsas: nb,
    pesoHumedo: kb,
    peseSeco: parseFloat((nb * kb * (1 - hm / 100)).toFixed(3)),
    spawnPct: spec ? spec.spawn.pct : analysis?.dynSpawn || 8,
    ...(spec?{preparation:JSON.parse(JSON.stringify(spec)),spawnKg:spec.spawn.kg}:{}),
    humedad: hm,
    tratamiento: treatmentName || 'Pasteurización Térmica',
    costoIngKg: analysis ? Math.round(analysis.cost) : 0,
    operador: form.operador,
    objetivo: objetivo || 'Lanzamiento directo desde Formulador',
    notas: form.notas,
    estado,
    veredicto: '',
    sala: form.sala,
    ubicacion: form.sala,
    ingredientLots: (plan.allocations || []).map(a => ({ ...a })),
    recipeRef: {
      id: now,
      name: recipeName || `Receta ${form.especie} (${form.codigo})`,
      sKey: spec ? spec.speciesKey : sKey,
      recipe: (spec ? spec.recipe : recipe).map(r => ({ ...r })),
      cn: analysis ? Number(analysis.cn).toFixed(1) : '—',
      eb: analysis ? Number(analysis.eb).toFixed(0) : '—',
      score: score || 0,
      cost: analysis ? Math.round(analysis.cost) : 0,
    },
    createdAt: new Date(now).toISOString(),
  };
  const bolsas = Array.from({ length: nb }, (_, idx) => {
    const i = idx + 1;
    const nn = String(i).padStart(2, '0');
    return {
      id: 'BOLSA_' + now + '_' + i, loteId, codigo: `${form.codigo}-B${nn}`, num: i, estado: 'sana',
      col25: null, col50: null, col100: null, pesoInicial: kb, fechaDescarte: null, motivoDescarte: '', observaciones: '', foto: null,
    };
  });
  return { lote, bolsas };
}

const api = { buildPreparationSnapshot, isPreparationCurrent, buildLaunchPlan, buildLoteRecords, unidadDe, cantidadDisponible };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasLaunchPlan = api;
}
})();
