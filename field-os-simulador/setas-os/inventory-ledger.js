'use strict';

/**
 * @file inventory-ledger.js — Libro de reservas de inventario para Setas OS.
 *
 * El bug concreto que resuelve: un lote de insumo tiene `cantidadKgDisponible`
 * (lo que existe físicamente) y `buildLaunchPlan` (launch-plan.js) calcula
 * faltantes CONTRA ESE FÍSICO. Como no hay reservas, si se planifican dos
 * lotes de producción para el viernes, los dos ven los mismos kilos, los dos
 * se declaran viables, y el segundo revienta al ejecutarse (no hay insumo
 * cuando se intenta consumir). Este módulo introduce la cantidad que faltaba:
 * DISPONIBLE = físico − reservado, el único número contra el que se puede
 * decidir si un plan nuevo es viable.
 *
 * DECISIÓN DE DISEÑO — la reserva NO es un campo del lote de insumo:
 * es un asiento en un libro aparte (este módulo), porque una reserva
 * pertenece a un LOTE DE PRODUCCIÓN (batchId) y hay que poder liberarla
 * completa cuando ese lote se descarta — un contador dentro del lote de
 * insumo no sabe quién lo reservó ni cómo revertir sólo su parte. Además,
 * mutar los lotes de insumo para reservar enturbiaría el camino de consumo
 * FIFO que ya funciona en inventario.js (`consumirInventarioFIFO`) y en
 * inventory-consumption.js (`applyLocal`): ese camino sigue leyendo y
 * escribiendo `cantidadKgDisponible` exactamente igual que hoy. El libro de
 * reservas vive al lado, nunca dentro.
 *
 * Es lógica pura (mismo patrón UMD que batch-sheet.js / recipe-lifecycle.js):
 * no toca React, ni red, ni DOM, ni localStorage. Se prueba con
 * `node --test inventory-ledger.test.js`.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const glob = typeof globalThis !== 'undefined' ? globalThis : this;

  // Igual que en batch-sheet.js / recipe-lifecycle.js: la dependencia se
  // resuelve en cada llamada, no al cargar el módulo, porque en el navegador
  // el orden de carga entre <script> no está garantizado.
  const inventarioRef = () => (isNode ? require('./inventario.js') : (glob && glob.SetasInventario) || null);

  const round1 = x => Math.round(x * 10) / 10;
  const round3 = x => Math.round(x * 1000) / 1000;

  const RESERVATION_STATES = Object.freeze(['held', 'consumed', 'released', 'expired']);

  const RESERVATION_STATE_LABELS = Object.freeze({
    held: 'Reservada',
    consumed: 'Consumida',
    released: 'Liberada',
    expired: 'Vencida',
  });

  // Id determinista a partir de batchId+ingredienteId: reservar dos veces el
  // mismo insumo para el mismo lote de producción no debe duplicar el
  // compromiso (p.ej. si el operador vuelve a guardar el plan del lote).
  const reservationId = (batchId, ingredienteId) => `RSV_${batchId}_${ingredienteId}`;

  /**
   * Crea un asiento de reserva nuevo (congelado). No lo añade a ningún
   * libro — eso lo hace `addReservations`, que decide si fusionarlo.
   */
  const reserve = ({ ingredienteId, kg, batchId, at, expiresAt = null, lotId = null, reason = null } = {}) => {
    if (!ingredienteId) throw new Error('reserve requiere ingredienteId');
    if (!batchId) throw new Error('reserve requiere batchId');
    if (!at) throw new Error('reserve requiere at');
    if (!Number.isFinite(kg) || kg <= 0) throw new Error(`reserve requiere kg finito y > 0 (recibido: ${kg})`);

    return Object.freeze({
      id: reservationId(batchId, ingredienteId),
      ingredienteId,
      lotId,
      kg: round3(kg),
      batchId,
      status: 'held',
      createdAt: at,
      expiresAt,
      consumedByEventId: null,
      reason,
    });
  };

  /**
   * Fusiona reservas nuevas en un libro existente, sin mutar. Una reserva
   * cuyo id ya existe no se duplica ni se reabre si ya está en un estado
   * terminal (`consumed`/`released`) o vencida (`expired`): una reserva ya
   * resuelta no vuelve a `held` sólo porque el plan se recalculó otra vez.
   */
  const addReservations = (ledger = [], reservations = []) => {
    const byId = new Map(ledger.map(r => [r.id, r]));
    for (const r of reservations) {
      const existing = byId.get(r.id);
      if (existing && existing.status !== 'held') continue; // ya resuelta: no se reabre
      byId.set(r.id, r);
    }
    return Array.from(byId.values());
  };

  const withStatus = (ledger, reservationId, patch) => {
    const idx = ledger.findIndex(r => r.id === reservationId);
    if (idx === -1) throw new Error(`No existe la reserva ${reservationId}`);
    const current = ledger[idx];
    const updated = Object.freeze({ ...current, ...patch });
    const next = [...ledger];
    next[idx] = updated;
    return next;
  };

  /** Libera una reserva puntual (p.ej. el operador ajustó el plan a mano). */
  const release = (ledger, reservationId, { reason = null, at } = {}) => {
    if (!at) throw new Error('release requiere at');
    return withStatus(ledger, reservationId, { status: 'released', releasedAt: at, reason: reason || null });
  };

  /**
   * Consume una reserva. Exige `eventId`: una reserva sólo pasa a consumida
   * con el evento que lo registra — mismo principio de trazabilidad que el
   * resto del sistema (una tarea sólo se cierra con su evento, no con un
   * booleano suelto). Sin eventId no hay prueba de qué consumo la cerró.
   */
  const consume = (ledger, reservationId, { eventId, at } = {}) => {
    if (!eventId) throw new Error('consume requiere eventId');
    if (!at) throw new Error('consume requiere at');
    return withStatus(ledger, reservationId, { status: 'consumed', consumedByEventId: eventId, consumedAt: at });
  };

  /**
   * Libera TODAS las reservas `held` de un lote de producción. Es lo que
   * evita que un lote descartado deje kilos bloqueados para siempre: sin
   * esto, cada insumo reservado para un lote que nunca se ejecutó quedaría
   * restado de `disponible` indefinidamente.
   */
  const releaseForBatch = (ledger = [], batchId, { reason = null, at } = {}) => {
    if (!batchId) throw new Error('releaseForBatch requiere batchId');
    if (!at) throw new Error('releaseForBatch requiere at');
    return ledger.map(r => (r.batchId === batchId && r.status === 'held')
      ? { ...r, status: 'released', releasedAt: at, reason: reason || 'Lote de producción descartado' }
      : r);
  };

  /**
   * Vence las reservas `held` cuyo `expiresAt` ya pasó. Existe porque una
   * reserva eterna de un lote que nunca se ejecutó es igual de dañina que no
   * tener reservas: bloquea insumo para siempre sin que nadie lo libere a
   * propósito. `expireDue` es el mecanismo de limpieza automática.
   */
  const expireDue = (ledger = [], nowMs) => {
    if (!Number.isFinite(nowMs)) throw new Error('expireDue requiere nowMs numérico');
    return ledger.map(r => (r.status === 'held' && r.expiresAt != null && new Date(r.expiresAt).getTime() <= nowMs)
      ? { ...r, status: 'expired' }
      : r);
  };

  // Reservas `held` vigentes (no vencidas) de un ingrediente, a `nowMs`.
  const activeHeld = (ledger, ingredienteId, nowMs) => ledger.filter(r => (
    r.ingredienteId === ingredienteId
    && r.status === 'held'
    && !(r.expiresAt != null && Number.isFinite(nowMs) && new Date(r.expiresAt).getTime() <= nowMs)
  ));

  /**
   * Disponibilidad real de un ingrediente: físico, reservado, disponible y
   * entrante. `disponible` es el único número con el que decidir si un plan
   * nuevo cabe.
   */
  const availability = (ingredienteId, { lots = [], ledger = [], incoming = [], nowMs } = {}) => {
    if (!ingredienteId) throw new Error('availability requiere ingredienteId');
    const inv = inventarioRef();
    if (!inv) throw new Error('availability requiere SetasInventario (inventario.js) disponible');

    // fisico: NO se recalcula aquí — se delega en stockActual, que ya excluye
    // lotes inactivos y es la única fuente de verdad para el físico.
    const fisico = round3(inv.stockActual(ingredienteId, lots));

    const reservado = round3(activeHeld(ledger, ingredienteId, nowMs).reduce((s, r) => s + r.kg, 0));

    const entrante = round3((incoming || [])
      .filter(c => c.ingredienteId === ingredienteId && c.estado === 'pendiente')
      .reduce((s, c) => s + (Number(c.cantidadKg ?? c.kg) || 0), 0));

    let disponible = round3(fisico - reservado);
    let sobrereservado = 0;
    if (disponible < 0) {
      // Un dato inconsistente (más reservado que físico) no se esconde
      // devolviendo un disponible negativo silencioso: se reporta cuánto se
      // pasa y se expone 0, que es lo único que tiene sentido para planificar.
      sobrereservado = round3(-disponible);
      disponible = 0;
    }

    const unidad = (lots.find(l => l.ingredienteId === ingredienteId) || {}).unidad || 'kg';

    return { fisico, reservado, disponible, entrante, unidad, ...(sobrereservado > 0 ? { sobrereservado } : {}) };
  };

  /**
   * Reevalúa la salida de `buildLaunchPlan` (launch-plan.js) contra
   * DISPONIBLE en vez de físico. `buildLaunchPlan` ya resuelve asignación
   * FIFO y faltantes contra el físico bruto; este módulo no repite ese
   * cálculo, sólo lo vuelve a mirar con el número correcto (disponible).
   *
   * `ok` es false si hay algún faltante, pero este módulo NO decide si eso
   * bloquea la producción — sólo informa. Bloquear o no un lanzamiento por
   * un faltante que llega mañana es una decisión de la interfaz (puede
   * preferir avisar y dejar seguir), no de este libro de reservas.
   */
  const checkPlan = (plan, { lots = [], ledger = [], incoming = [], nowMs } = {}) => {
    if (!plan) throw new Error('checkPlan requiere un plan (buildLaunchPlan)');

    const neededByIngredient = new Map();
    for (const a of (plan.allocations || [])) {
      const prev = neededByIngredient.get(a.ingredientId) || { needed: 0, unidad: a.unidad };
      prev.needed += a.quantity;
      neededByIngredient.set(a.ingredientId, prev);
    }
    // Los faltantes que ya detectó buildLaunchPlan contra el físico también
    // cuentan como necesidad, para no perder ese ingrediente si no tenía
    // ninguna allocation (stock cero desde el arranque).
    for (const s of (plan.shortfalls || [])) {
      const prev = neededByIngredient.get(s.ingredientId) || { needed: 0, unidad: s.unidad };
      prev.needed = Math.max(prev.needed, s.needed);
      neededByIngredient.set(s.ingredientId, prev);
    }

    const lines = [];
    const blockers = [];
    for (const [ingredienteId, { needed, unidad }] of neededByIngredient) {
      const av = availability(ingredienteId, { lots, ledger, incoming, nowMs });
      const faltante = Math.max(0, round3(needed - av.disponible));
      const cubiertoPorEntrante = faltante > 0 && av.entrante >= faltante;
      lines.push({
        ingredienteId,
        necesario: round3(needed),
        disponible: av.disponible,
        faltante,
        entrante: av.entrante,
        cubiertoPorEntrante,
        unidad,
      });
      if (faltante > 0) {
        const cantidad = `${round1(faltante).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unidad}`;
        blockers.push(cubiertoPorEntrante
          ? `Faltan ${cantidad} de ${ingredienteId} ahora, pero hay entrante suficiente en camino`
          : `Faltan ${cantidad} de ${ingredienteId}`);
      }
    }

    const ok = lines.every(l => l.faltante === 0);
    const mensaje = ok ? 'Insumo disponible para todo el plan' : blockers.join(' · ');

    return { ok, lines, blockers, mensaje };
  };

  /**
   * Puente entre planificar y comprometer: convierte las `allocations` de
   * `buildLaunchPlan` (una por lote de insumo asignado) en asientos de
   * reserva listos para `addReservations`. Se agrupa por ingrediente, no
   * por lote de insumo asignado: la reserva compromete kilos del
   * ingrediente para el lote de producción, no ata la reserva a qué lote
   * físico concreto la cubrirá al momento de consumir (eso lo decide FIFO
   * en el momento del consumo real, vía consumirInventarioFIFO).
   */
  const reservationsForPlan = (plan, { batchId, at, expiresAt = null } = {}) => {
    if (!plan) throw new Error('reservationsForPlan requiere un plan (buildLaunchPlan)');
    if (!batchId) throw new Error('reservationsForPlan requiere batchId');
    if (!at) throw new Error('reservationsForPlan requiere at');

    const byIngredient = new Map();
    for (const a of (plan.allocations || [])) {
      const prev = byIngredient.get(a.ingredientId) || 0;
      byIngredient.set(a.ingredientId, prev + a.quantity);
    }

    return Array.from(byIngredient.entries())
      .filter(([, kg]) => kg > 0)
      .map(([ingredienteId, kg]) => reserve({ ingredienteId, kg, batchId, at, expiresAt }));
  };

  /** Recuento del libro: para paneles de bodega ("cuántos kg comprometidos hay"). */
  const ledgerStats = (ledger = [], nowMs) => {
    const vencidas = Number.isFinite(nowMs) ? expireDue(ledger, nowMs) : ledger;
    const stats = { held: 0, consumed: 0, released: 0, expired: 0 };
    const batchesConReserva = new Set();
    for (const r of vencidas) {
      stats[r.status] = (stats[r.status] || 0) + 1;
      if (r.status === 'held') batchesConReserva.add(r.batchId);
    }
    return { ...stats, batchesConReserva: batchesConReserva.size };
  };

  const api = {
    RESERVATION_STATES,
    RESERVATION_STATE_LABELS,
    reserve,
    addReservations,
    release,
    consume,
    releaseForBatch,
    expireDue,
    availability,
    checkPlan,
    reservationsForPlan,
    ledgerStats,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasInventoryLedger = api;
})();
