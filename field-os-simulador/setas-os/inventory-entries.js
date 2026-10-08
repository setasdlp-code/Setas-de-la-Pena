'use strict';

/**
 * @file inventory-entries.js — Libro de asientos de Bodega (ADR-0009).
 *
 * El stock de un lote de insumo no se sincroniza como un número: si dos
 * dispositivos descuentan del mismo lote a la vez y cada uno sube "lo que
 * queda", uno de los dos descuentos se pierde. Se sincronizan asientos
 * append-only y el stock se calcula sumándolos:
 *
 *   - open:  el lote nace (atributos + kg iniciales);
 *   - delta: cambio de kg disponibles (consumo, ajuste, recepción);
 *   - patch: cambio de atributos (precio, ingrediente, activo…).
 *
 * Los deltas conmutan: dos consumos simultáneos suman los dos. Los atributos
 * se resuelven por el asiento más reciente (`at`, y `id` para desempatar).
 *
 * El resto de la app sigue leyendo y escribiendo `sdp_lotes` como antes.
 * `captureChanges` compara esa lista con lo que el libro proyecta y convierte
 * cualquier diferencia en asientos nuevos; así ningún camino de escritura
 * existente (compras, consumo, ajuste manual, preparación) tiene que cambiar.
 *
 * Lógica pura (patrón UMD): sin red, DOM ni localStorage.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const SCHEMA = 'setas.inventory-entry.v1';
  const QTY = 'cantidadKgDisponible';
  // Campo derivado: cuántos kg se descontaron de más entre dispositivos.
  const OVERDRAW = 'sobregiroKg';
  const DERIVED = Object.freeze([QTY, OVERDRAW]);
  const EPS = 0.0005;

  const round3 = x => Math.round(x * 1000) / 1000;

  const mergeApi = () => (isNode ? require('./sync-merge.js') : globalThis.SetasSyncMerge);

  const safe = v => String(v == null ? '' : v).replace(/[^a-zA-Z0-9_.:-]/g, '_');

  const attrsOf = lot => {
    const out = {};
    for (const k of Object.keys(lot || {})) if (!DERIVED.includes(k) && lot[k] !== undefined) out[k] = lot[k];
    return out;
  };

  const order = (a, b) => (String(a.at).localeCompare(String(b.at)) || String(a.id).localeCompare(String(b.id)));

  const isValidEntry = e => Boolean(e
    && e.schema === SCHEMA
    && typeof e.id === 'string' && e.id
    && typeof e.lotId === 'string' && e.lotId
    && ['open', 'delta', 'patch'].includes(e.kind)
    && typeof e.at === 'string'
    && (e.kind === 'patch' || Number.isFinite(e.kg))
    && (e.kind === 'delta' || (e.fields && typeof e.fields === 'object')));

  /**
   * Proyecta el libro en la lista de lotes que usa la app.
   * `cantidadKgDisponible` nunca baja de 0; si la suma da negativo (dos
   * dispositivos consumieron los mismos kilos) el exceso queda en
   * `sobregiroKg` para que alguien recuente el lote.
   */
  const project = (entries = []) => {
    const sorted = (entries || []).filter(isValidEntry).slice().sort(order);
    const lots = new Map();
    for (const e of sorted) {
      if (e.kind === 'open') {
        if (lots.has(e.lotId)) continue; // la primera apertura manda
        lots.set(e.lotId, { attrs: { ...e.fields, id: e.lotId }, kg: e.kg, pending: [] });
      }
    }
    for (const e of sorted) {
      const lot = lots.get(e.lotId);
      if (!lot) continue; // asiento cuyo lote aún no llegó
      if (e.kind === 'delta') lot.kg += e.kg;
      else if (e.kind === 'patch') {
        for (const [k, v] of Object.entries(e.fields)) {
          if (k === 'id' || DERIVED.includes(k)) continue;
          if (v === null) delete lot.attrs[k];
          else lot.attrs[k] = v;
        }
      }
    }
    return [...lots.values()].map(({ attrs, kg }) => {
      const raw = round3(kg);
      const out = { ...attrs, [QTY]: Math.max(0, raw) };
      if (raw < -EPS) out[OVERDRAW] = round3(-raw);
      return out;
    });
  };

  /** Suma cruda (puede ser negativa) por lote. */
  const rawBalances = (entries = []) => {
    const opened = new Set();
    const kg = new Map();
    for (const e of (entries || []).filter(isValidEntry).slice().sort(order)) {
      if (e.kind === 'open') {
        if (opened.has(e.lotId)) continue;
        opened.add(e.lotId);
        kg.set(e.lotId, (kg.get(e.lotId) || 0) + e.kg);
      } else if (e.kind === 'delta') kg.set(e.lotId, (kg.get(e.lotId) || 0) + e.kg);
    }
    for (const id of [...kg.keys()]) if (!opened.has(id)) kg.delete(id);
    return kg;
  };

  /**
   * Convierte las diferencias entre `lotes` (lo que la app tiene) y la
   * proyección del libro en asientos nuevos.
   *
   * Un aumento de kg sobre un lote sobregirado es un recuento físico (las
   * compras crean lotes nuevos y el consumo solo resta), así que se registra
   * contra la suma cruda y deja el lote exactamente en lo contado.
   *
   * @param {object[]} entries libro actual
   * @param {object[]} lotes   lista de lotes de la app
   * @param {{ deviceId: string, at: string, nonce?: string }} ctx
   * @returns {object[]} asientos nuevos (no incluye los existentes)
   */
  const captureChanges = (entries = [], lotes = [], { deviceId, at, nonce = '' } = {}) => {
    if (!deviceId) throw new Error('captureChanges requiere deviceId');
    if (!at) throw new Error('captureChanges requiere at');
    const { sameValue } = mergeApi();
    const projected = new Map(project(entries).map(l => [l.id, l]));
    const raw = rawBalances(entries);
    const stamp = safe(at) + (nonce ? '_' + safe(nonce) : '');
    const out = [];
    for (const lot of lotes || []) {
      if (!lot || lot.id == null) continue;
      const lotId = String(lot.id);
      const kgLocal = Number(lot[QTY]) || 0;
      const prev = projected.get(lotId);
      if (!prev) {
        out.push({
          schema: SCHEMA, id: `open_${safe(lotId)}`, kind: 'open', lotId,
          at, deviceId, kg: round3(kgLocal), fields: attrsOf(lot),
        });
        continue;
      }
      const shown = Number(prev[QTY]) || 0;
      if (Math.abs(kgLocal - shown) > EPS) {
        const rawKg = raw.get(lotId) || 0;
        const delta = kgLocal > shown && rawKg < 0 ? kgLocal - rawKg : kgLocal - shown;
        out.push({
          schema: SCHEMA, id: `delta_${safe(lotId)}_${safe(deviceId)}_${stamp}`, kind: 'delta', lotId,
          at, deviceId, kg: round3(delta),
        });
      }
      const fields = {};
      const a = attrsOf(lot);
      const b = attrsOf(prev);
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
        if (k === 'id') continue;
        if (!sameValue(a[k], b[k])) fields[k] = a[k] === undefined ? null : a[k];
      }
      if (Object.keys(fields).length) {
        out.push({
          schema: SCHEMA, id: `patch_${safe(lotId)}_${safe(deviceId)}_${stamp}`, kind: 'patch', lotId,
          at, deviceId, fields,
        });
      }
    }
    return out;
  };

  /**
   * Une el libro local con el del servidor. Los asientos son inmutables: si
   * el mismo id aparece en ambos, gana el del servidor (la primera escritura
   * que llegó). El resultado queda ordenado.
   */
  const mergeEntries = (local = [], remote = []) => {
    const byId = new Map();
    for (const e of local || []) if (isValidEntry(e)) byId.set(e.id, e);
    for (const e of remote || []) {
      if (!isValidEntry(e)) continue;
      const { syncedAt, ...clean } = e;
      byId.set(e.id, clean);
    }
    return [...byId.values()].sort(order);
  };

  /** Lotes con más consumo registrado que existencia. */
  const overdrawn = lotes => (lotes || []).filter(l => (Number(l[OVERDRAW]) || 0) > EPS);

  const api = {
    SCHEMA,
    QTY,
    OVERDRAW,
    isValidEntry,
    project,
    rawBalances,
    captureChanges,
    mergeEntries,
    overdrawn,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasInventoryEntries = api;
})();
