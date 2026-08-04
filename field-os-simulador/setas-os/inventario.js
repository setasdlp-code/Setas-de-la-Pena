'use strict';
// ── inventario.js — lógica de stock, costo promedio y consumo FIFO ──
// Módulo puro: sin dependencias del DOM ni de React. Misma razón de ser que
// scoring.js — es la única fuente de verdad para la lógica que mueve dinero
// e inventario real, así Bodega y Ficha de Producción no pueden divergir.
//
// Consumido por simulador-app.jsx vía <script src="./inventario.js"> (global
// SetasInventario) y por inventario.test.js vía require() en Node.

// kg totales disponibles de un ingrediente, sumando solo lotes activos.
const stockActual = (ingredienteId, lotes) =>
  lotes
    .filter((l) => l.activo && l.ingredienteId === ingredienteId)
    .reduce((s, l) => s + (l.cantidadKgDisponible || 0), 0);

// Precio promedio ponderado por kg disponible, entre los lotes activos con stock > 0.
// Devuelve null si no hay stock (evita división por cero / NaN silencioso en la UI).
const precioPonderado = (ingredienteId, lotes) => {
  const active = lotes.filter(
    (l) => l.activo && l.ingredienteId === ingredienteId && l.cantidadKgDisponible > 0
  );
  const totalKg = active.reduce((s, l) => s + l.cantidadKgDisponible, 0);
  if (!totalKg) return null;
  return active.reduce((s, l) => s + l.precioPorKgCOP * l.cantidadKgDisponible, 0) / totalKg;
};

// Descuenta inventario FIFO (lote más antiguo primero) para uno o más ingredientes
// a la vez. No muta `lotes` — devuelve un array nuevo.
// rows: [{ id: ingredienteId, krKg: kgNecesarios }]
// Si el stock no alcanza para un ingrediente, descuenta todo lo disponible y deja
// ese ingrediente en 0 — el llamador es responsable de advertir el faltante
// (ver el aviso "stock insuficiente" antes de confirmar la ejecución del lote).
const consumirInventarioFIFO = (lotes, rows) => {
  let updated = [...lotes];
  for (const row of rows) {
    let remaining = row.krKg;
    const lotesIng = updated
      .filter((l) => l.activo && l.ingredienteId === row.id)
      .sort((a, b) => new Date(a.fechaIngreso) - new Date(b.fechaIngreso));
    for (const lote of lotesIng) {
      if (remaining <= 0.001) break;
      const consume = Math.min(lote.cantidadKgDisponible, remaining);
      updated = updated.map((l) =>
        l.id === lote.id
          ? { ...l, cantidadKgDisponible: Math.max(0, Math.round((l.cantidadKgDisponible - consume) * 1000) / 1000) }
          : l
      );
      remaining -= consume;
    }
  }
  return updated;
};

const api = { stockActual, precioPonderado, consumirInventarioFIFO };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SetasInventario = api;
}
