'use strict';
// Lógica pura de la Bitácora (registro de lotes experimentales) — extraída de
// simulador-app.jsx para que sea testeable con `node --test` sin depender del
// estado de React. Mismo patrón UMD que scoring.js / perito-evidence.js.
(function () {
  const DEFAULT_FRESH_PRICES = {
    p_ostreatus_gris: 20000,
    p_ostreatus_blanco: 22000,
    p_djamor_rosa: 25000,
    p_eryngii: 35000,
    shiitake: 38000,
    lions_mane: 55000,
    reishi: 60000,
    enoki: 28000,
    nameko: 32000
  };

  const knownNumber=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null;
  const economicEvidence=(lote,estimatedCost,harvestValue,totalFresh)=>{
    const components=['sustrato','spawn','energia','consumibles'].map(id=>{
      const row=lote.recordedCosts?.[id],amount=knownNumber(row?.amountCop);
      return {id,amountCop:amount,source:row?.source||null,recorded:amount!==null&&typeof row?.source==='string'&&row.source.trim()!==''};
    });
    const complete=components.every(c=>c.recorded);
    const partialTotal=components.filter(c=>c.recorded).reduce((n,c)=>n+c.amountCop,0);
    const sales=Array.isArray(lote.sales)?lote.sales:null;
    const validSales=sales&&sales.every(s=>s.id&&knownNumber(s.amountCop)!==null&&s.recordedAt)&&new Set(sales.map(s=>s.id)).size===sales.length;
    const revenue=validSales?sales.reduce((n,s)=>n+Number(s.amountCop),0):null;
    return {schema:'setas.batch-economics.v2',estimatedCostCop:estimatedCost,estimatedHarvestValueCop:harvestValue,components,recordedCostCop:complete?partialTotal:null,partialRecordedCostCop:partialTotal,costComplete:complete,recordedRevenueCop:revenue,recordedMarginCop:complete&&revenue!==null?revenue-partialTotal:null,totalCostPerFreshKgCop:complete&&totalFresh>0?partialTotal/totalFresh:null};
  };
  const calcLoteStats = (lote, bolsas = [], cosechas = []) => {
    if (!lote) return null;
    if (!bolsas.length) return null;
    const bolsasSanas = bolsas.filter(b => b.estado === 'sana').length;
    const bolsasContaminadas = bolsas.filter(b => b.estado === 'contaminada').length;
    const contPct = bolsas.length ? (bolsasContaminadas / bolsas.length) * 100 : 0;
    const totalFresco = cosechas.reduce((s, c) => s + (parseFloat(c.pesoFresco) || 0), 0) / 1000;
    const peseSeco = parseFloat(lote.peseSeco) || 0;
    // EB = fresco cosechado / sustrato SECO, con el spawn FUERA del denominador.
    // Es la convención mayoritaria de la literatura, así que la serie sigue
    // comparable con lo publicado; lo que cambia es que ya no es implícita. El
    // valor no se toca: `beBasis` sólo declara qué significa (ver ADR-0008).
    const be = peseSeco > 0 ? (totalFresco / peseSeco) * 100 : null;
    // Fechas de col100 corruptas o anteriores a la inoculación (typo de captura) se
    // descartan del promedio en vez de contaminarlo con un NaN o un negativo.
    const col100s = bolsas
      .filter(b => b.col100 && lote.fechaInoculacion)
      .map(b => Math.round((new Date(b.col100) - new Date(lote.fechaInoculacion)) / 86400000))
      .filter(d => Number.isFinite(d) && d >= 0);
    const diasCol = col100s.length ? col100s.reduce((s, d) => s + d, 0) / col100s.length : null;

    // Costeo económico e inversión real incurrida del lote
    const sustCost = lote.costoIngKg > 0 && peseSeco > 0 ? lote.costoIngKg * peseSeco : (peseSeco * 1200);
    const spawnKg = lote.spawnKg != null ? parseFloat(lote.spawnKg) : (peseSeco > 0 ? (peseSeco / (1 - 0.67)) * 0.08 : bolsas.length * 0.16);
    const spawnCostKg = knownNumber(lote.spawnCostKg) ?? 12000;
    const spawnCostTotal = spawnKg * spawnCostKg;
    const energyCopKg = knownNumber(lote.energyCopKg) ?? 350;
    const energyCostTotal = peseSeco * energyCopKg;
    const bagConsumableCostUnit = knownNumber(lote.bagConsumableCostUnit) ?? 300;
    const bagConsumableCostTotal = bolsas.length * bagConsumableCostUnit;
    const costoIncurridoTotal = sustCost + spawnCostTotal + energyCostTotal + bagConsumableCostTotal;
    const costoIncurridoPorBolsa = bolsas.length > 0 ? costoIncurridoTotal / bolsas.length : 0;

    // Ingresos de cosecha y margen real en COP
    const sKey = lote.sKey || 'p_ostreatus_gris';
    const precioVentaKg = knownNumber(lote.precioVentaKg) ?? DEFAULT_FRESH_PRICES[sKey] ?? 22000;
    const ingresoRealTotal = totalFresco * precioVentaKg;
    const margenRealTotal = totalFresco > 0 ? ingresoRealTotal - costoIncurridoTotal : 0;
    const margenRealPct = ingresoRealTotal > 0 ? (margenRealTotal / ingresoRealTotal) * 100 : 0;
    const costoRealPorKgCosechado = totalFresco > 0 ? costoIncurridoTotal / totalFresco : null;

    // Comparativa vs Estimación teórica de la receta
    const ebEstimada = parseFloat(lote.ebEstimada || lote.eb) || null;
    const varianzaEB = (be != null && ebEstimada != null) ? be - ebEstimada : null;
    const kgEstimados = (peseSeco > 0 && ebEstimada != null) ? peseSeco * (ebEstimada / 100) : null;
    const varianzaKg = (totalFresco != null && kgEstimados != null) ? totalFresco - kgEstimados : null;

    // Desglose por oleadas (flushes)
    const flushMap = {};
    cosechas.forEach(c => {
      const fNum = c.flush || 1;
      const kgF = (parseFloat(c.pesoFresco) || 0) / 1000;
      if (!flushMap[fNum]) flushMap[fNum] = { flush: fNum, kg: 0, count: 0 };
      flushMap[fNum].kg += kgF;
      flushMap[fNum].count += 1;
    });
    const flushes = Object.values(flushMap).map(f => ({
      flush: f.flush,
      kg: f.kg,
      pctTotal: totalFresco > 0 ? (f.kg / totalFresco) * 100 : 0,
      ingreso: f.kg * precioVentaKg
    })).sort((a, b) => a.flush - b.flush);

    // Mantenemos costoKg por compatibilidad retroactiva con tests existentes
    const costoKg = totalFresco > 0 && lote.costoIngKg > 0 ? (lote.costoIngKg * peseSeco) / totalFresco : null;

    return {
      economics: economicEvidence(lote,costoIncurridoTotal,ingresoRealTotal,totalFresco),
      bolsasSanas, bolsasContaminadas, contPct,
      totalFresco, be, diasCol, costoKg,
      beBasis: 'fresh_over_dry_substrate',
      beSpawnIncludedInDenominator: false,
      numBolsas: bolsas.length,
      costoIncurridoTotal, costoIncurridoPorBolsa,
      costoDesglose: {
        sustrato: sustCost,
        spawn: spawnCostTotal,
        energia: energyCostTotal,
        consumibles: bagConsumableCostTotal
      },
      precioVentaKg, ingresoRealTotal, margenRealTotal, margenRealPct,
      costoRealPorKgCosechado,
      ebEstimada, varianzaEB, kgEstimados, varianzaKg,
      flushes
    };
  };

  const calcLoteScore = (stats) => {
    if (!stats || stats.totalFresco === 0) return null;
    let s = 0;
    if (stats.be != null) s += Math.min(40, (stats.be / 150) * 40);
    s += (1 - stats.contPct / 100) * 30;
    s += stats.diasCol != null ? (stats.diasCol <= 18 ? 15 : stats.diasCol <= 25 ? 10 : 5) : 7;
    s += stats.costoKg != null ? (stats.costoKg <= 2000 ? 15 : stats.costoKg <= 4000 ? 10 : 5) : 7;
    return Math.max(0, Math.min(100, Math.round(s)));
  };

  // Usado tanto para validar la entrada del operador (rechazar el guardado) como
  // para filtrar datos ya guardados antes de promediar en calcLoteStats.
  const isFechaColValida = (fechaCol, fechaInoculacion) => {
    if (!fechaCol || !fechaInoculacion) return true; // campo vacío: nada que validar aún
    const dCol = new Date(fechaCol);
    const dIno = new Date(fechaInoculacion);
    if (isNaN(dCol.getTime()) || isNaN(dIno.getTime())) return false;
    return dCol.getTime() >= dIno.getTime();
  };

  // Capture boundaries: legacy pesoFresco is grams; peseSeco/pesoHumedo are kg.
  // Empty input is unknown, never an observed zero. Bounds are physical/type
  // constraints, not recommended biological operating thresholds.
  const captureNumber = value => value == null || String(value).trim() === '' ? null : Number(value);
  const captureError = (value, {required=false,min=0,max=Infinity,integer=false}={}) => {
    const n=captureNumber(value);
    if(n===null) return required?'Campo obligatorio.':'';
    if(!Number.isFinite(n)) return 'Falta un número válido.';
    if(integer&&!Number.isInteger(n)) return 'Se requiere un número entero.';
    if(n<min||n>max) return `Valor fuera de rango (${min}–${max===Infinity?'∞':max}).`;
    return '';
  };
  const normalizeTrialCapture = form => ({...form,
    numBolsas:captureNumber(form.numBolsas),pesoHumedo:captureNumber(form.pesoHumedo),
    peseSeco:captureNumber(form.peseSeco),spawnPct:captureNumber(form.spawnPct),humedad:captureNumber(form.humedad),
    fechaMezcla:form.fechaMezcla||null,fechaInoculacion:form.fechaInoculacion||null,
    tratamiento:form.tratamiento||null
  });
  // Calidad de cosecha: pesos por grado, firmeza ordinal y defectos de campo.
  // Los criterios de grado no tienen versión ni aprobación: se declaran como tales.
  const HARVEST_QUALITY = Object.freeze({
    CRITERIA: 'provisional_unversioned',
    FIRMNESS_METHOD: 'tacto_ordinal',
    FIRMNESS_SCALE: 'v0_texto',
    // provisional: pendiente de aprobación del usuario
    FIRMNESS_ANCHORS: Object.freeze({
      1: 'Blando: cede con presión leve',
      3: 'Firme: resiste presión moderada',
      5: 'Muy firme: no cede al presionar',
    }),
    GRADE_FIELDS: Object.freeze(['pesoPrimera', 'pesoSegunda', 'pesoDescarte']),
    GAP_TOLERANCE_PCT: 0.01,
    GAP_TOLERANCE_G: 5,
    FIELD_DEFECTS: Object.freeze([
      Object.freeze({ key: 'bacterial_suspect', label: 'Manchas bacterianas', v01Code: 'bacterial_suspect' }),
      Object.freeze({ key: 'surface_dryness', label: 'Deshidratación', v01Code: 'surface_dryness' }),
      Object.freeze({ key: 'mechanical_damage', label: 'Daño mecánico', v01Code: 'mechanical_damage' }),
      Object.freeze({ key: 'sporulation', label: 'Esporulación', v01Code: null }),
      Object.freeze({ key: 'stipe_elongated', label: 'Estípite alargado', v01Code: null }),
      Object.freeze({ key: 'edge_curl_lost', label: 'Borde enrollado perdido', v01Code: null }),
    ]),
  });
  const fieldDefectsFor = speciesKey =>
    HARVEST_QUALITY.FIELD_DEFECTS.filter(d => d.v01Code !== null || (speciesKey !== 'lions_mane' && speciesKey !== 'reishi'));
  const harvestGradeGap = cosecha => {
    const c = cosecha || {};
    const factor = (c.unit || c.unidad) === 'kg' ? 1000 : 1;
    const toG = v => { const n = captureNumber(v); return n === null || !Number.isFinite(n) ? null : n * factor; };
    const grades = HARVEST_QUALITY.GRADE_FIELDS.map(f => toG(c[f]));
    const declared = grades.filter(g => g !== null);
    const netG = toG(c.pesoFrescoGramos ?? c.pesoFresco);
    const out = { status: null, sumG: null, netG, gapG: null, toleranceG: null };
    if (!declared.length) return { ...out, status: 'no_grades' };
    const sumG = declared.reduce((a, b) => a + b, 0);
    if (netG === null) return { ...out, sumG, status: 'no_net_weight' };
    if (declared.length < grades.length) return { ...out, sumG, status: 'incomplete' };
    const gapG = Math.abs(sumG - netG);
    const toleranceG = Math.max(HARVEST_QUALITY.GAP_TOLERANCE_PCT * netG, HARVEST_QUALITY.GAP_TOLERANCE_G);
    return { status: gapG <= toleranceG ? 'ok' : 'over_tolerance', sumG, netG, gapG, toleranceG };
  };
  // Valida los campos de calidad antes de guardar (la captura por canastilla no
  // pasa por captureFields). Devuelve '' o el primer error, en español.
  const harvestQualityError = q => {
    const v = q || {};
    const labels = { pesoPrimera: 'Primera', pesoSegunda: 'Segunda', pesoDescarte: 'Descarte' };
    for (const f of HARVEST_QUALITY.GRADE_FIELDS) {
      const e = captureError(v[f], { min: 0, integer: true });
      if (e) return `Peso ${labels[f]}: ${e}`;
    }
    const e = captureError(v.firmeza, { min: 1, max: 5, integer: true });
    return e ? `Firmeza: ${e}` : '';
  };
  const normalizeHarvestCapture = form => {
    const rawPesoFresco = captureNumber(form.pesoFresco ?? form.pesoFrescoGramos);
    const bruto = captureNumber(form.pesoBrutoGramos ?? form.pesoBruto);
    const tara = captureNumber(form.taraGramos ?? form.tara);
    const flush = captureNumber(form.flush);
    const calidad = captureNumber(form.calidad);

    let neto = rawPesoFresco;
    let netCalculationStatus = form.netCalculationStatus || (rawPesoFresco !== null ? 'verified' : 'blocked_missing_tare');

    if (bruto !== null) {
      if (tara !== null) {
        if (tara > bruto) {
          throw new Error('tara_exceeds_gross_weight');
        }
        neto = bruto - tara;
        netCalculationStatus = 'verified';
      } else {
        neto = null;
        netCalculationStatus = 'blocked_missing_tare';
      }
    } else if (rawPesoFresco !== null) {
      neto = rawPesoFresco;
      netCalculationStatus = 'verified';
    }

    const bagId = form.bagId || form.bolsaId || null;
    const pesoPrimera = captureNumber(form.pesoPrimera);
    const pesoSegunda = captureNumber(form.pesoSegunda);
    const pesoDescarte = captureNumber(form.pesoDescarte);
    const firmeza = captureNumber(form.firmeza);
    const defectCodes = Array.isArray(form.defectCodes)
      ? [...new Set(form.defectCodes.map(d => String(d || '').trim()).filter(Boolean))]
      : [];
    const defectosCampo = Array.isArray(form.defectosCampo)
      ? [...new Set(form.defectosCampo.map(d => String(d || '').trim()).filter(Boolean))]
      : [];
    // Solo coincidencias exactas con el vocabulario v0.1 pasan a defectCodes.
    const v01 = new Set(HARVEST_QUALITY.FIELD_DEFECTS.map(d => d.v01Code).filter(Boolean));
    defectosCampo.forEach(d => { if (v01.has(d) && !defectCodes.includes(d)) defectCodes.push(d); });
    const { colorOrdinal: _noColor, ...rest } = form;

    return {
      ...rest,
      bagId,
      bolsaId: bagId,
      crateId: form.crateId || null,
      crateCode: form.crateCode || null,
      pesoBrutoGramos: bruto,
      taraGramos: tara,
      taraSource: form.taraSource || (tara !== null ? 'manual' : 'unverified'),
      pesoFresco: neto,
      pesoFrescoGramos: neto,
      netCalculationStatus,
      unit: form.unit || form.unidad || 'g',
      unidad: form.unit || form.unidad || 'g',
      flush,
      calidad,
      // Fenotipo: subconjunto de phenotype_dictionary_v0.1 capturable con
      // calibrador y sin protocolo de imagen. Es la variable de respuesta que
      // falta para relacionar exposición a CO₂ con morfología — la literatura no
      // trae curva dosis-respuesta, así que sólo se obtiene midiendo aquí.
      // Opcional por diseño: un campo obligatorio que estorba se llena con
      // cualquier cosa, y un dato inventado es peor que un hueco declarado.
      // El vocabulario se valida en lot-record.js, no aquí: esta función
      // normaliza la captura, no juzga el contenido.
      capDiameterMm: captureNumber(form.capDiameterMm),
      stipeLengthMm: captureNumber(form.stipeLengthMm),
      defectCodes,
      pesoPrimera,
      pesoSegunda,
      pesoDescarte,
      criterioGrado: [pesoPrimera, pesoSegunda, pesoDescarte].some(v => v !== null) ? HARVEST_QUALITY.CRITERIA : null,
      firmeza,
      firmezaMetodo: firmeza !== null ? HARVEST_QUALITY.FIRMNESS_METHOD : null,
      firmezaEscala: firmeza !== null ? HARVEST_QUALITY.FIRMNESS_SCALE : null,
      defectosCampo,
      phenotypeStage: form.phenotypeStage || null,
      observerNotes: form.observerNotes || null,
    };
  };
  // Both local collections must persist before UI state changes. Roll back the
  // first key if the second write fails; callers keep their draft on failure.
  const persistCapture = (storage, entries) => {
    const before=entries.map(([key])=>[key,storage.getItem(key)]);
    try { entries.forEach(([key,value])=>storage.setItem(key,JSON.stringify(value))); }
    catch(error) { before.forEach(([key,value])=>{try{value===null?storage.removeItem(key):storage.setItem(key,value);}catch{}}); throw error; }
  };
  // Lectura manual de temperatura de SUPERFICIE de una bolsa (termómetro
  // infrarrojo). No es temperatura de núcleo: sirve para comparar bolsa contra
  // aire, bolsa contra bolsa y visita contra visita (DEC-023). Se agrega al
  // historial de la bolsa; nunca reemplaza una lectura anterior.
  const SURFACE_READING_LIMIT = 200;
  const appendSurfaceReading = (bolsa, { tempC, airC = null, at, operador } = {}) => {
    const surface = captureNumber(tempC);
    if (!Number.isFinite(surface) || surface < -10 || surface > 80) return { ok: false, error: 'Superficie: ingresar una temperatura entre -10 y 80 °C.' };
    const hasAir = airC !== null && airC !== undefined && String(airC).trim() !== '';
    const air = hasAir ? captureNumber(airC) : null;
    if (hasAir && (!Number.isFinite(air) || air < -10 || air > 60)) return { ok: false, error: 'Aire: ingresar una temperatura entre -10 y 60 °C o dejar vacío.' };
    const when = new Date(at || Date.now());
    if (isNaN(when.getTime())) return { ok: false, error: 'Fecha de lectura inválida.' };
    const reading = {
      tempC: surface, airC: air,
      deltaC: air === null ? null : Math.round((surface - air) * 10) / 10,
      at: when.toISOString(), operador: String(operador || 'operario_local'),
      metodo: 'infrarrojo_superficie',
    };
    const previous = Array.isArray(bolsa && bolsa.lecturasSuperficie) ? bolsa.lecturasSuperficie : [];
    return { ok: true, reading, lecturasSuperficie: [...previous, reading].slice(-SURFACE_READING_LIMIT) };
  };
  const api = { appendSurfaceReading, economicEvidence, calcLoteStats, calcLoteScore, isFechaColValida, captureNumber, captureError, normalizeTrialCapture, normalizeHarvestCapture, persistCapture, HARVEST_QUALITY, fieldDefectsFor, harvestGradeGap, harvestQualityError };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasBitacora = api;
})();
