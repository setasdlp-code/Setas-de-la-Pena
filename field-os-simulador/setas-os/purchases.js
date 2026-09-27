'use strict';

/**
 * @file purchases.js — Estado de una compra de insumos en Setas OS.
 *
 * El hueco concreto que cierra: `availability()` (inventory-ledger.js) ya
 * calcula `entrante`, pero todos sus llamadores le pasaban `incoming: []`,
 * porque una compra no tenía estado — `registrarCompra` creaba los lotes de
 * insumo con `activo:true` en el mismo clic, así que todo lo comprado era
 * físico desde el instante en que se registraba. Un pedido encargado al
 * proveedor y todavía no descargado en bodega no existía: o se inflaba el
 * físico registrándolo antes de tiempo, o se registraba al recibirlo y
 * mientras tanto el pedido sólo vivía en WhatsApp.
 *
 * DECISIÓN DE DISEÑO — una compra pendiente NO crea lote de insumo:
 * el lote sólo nace al recibir. Un lote existe cuando hay kilos que se pueden
 * pesar; representar lo pedido como un lote (aunque fuera con `activo:false`)
 * metería en `sdp_lotes` filas que no son materia, y `stockActual`
 * (inventario.js) — la única fuente de verdad del físico — tendría que
 * aprender a distinguirlas. Lo pendiente vive en la compra misma
 * (`estado:'pendiente'`) y se proyecta como `incoming` para `availability`.
 * Así `stockActual` y el camino FIFO de consumo no cambian ni una línea.
 *
 * Compatibilidad: una compra sin `estado` es una compra histórica que YA
 * generó sus lotes, así que se lee como `recibida`. Sólo cuenta como entrante
 * lo que dice `estado:'pendiente'` de forma explícita.
 *
 * Es lógica pura (mismo patrón UMD que inventory-ledger.js / batch-sheet.js):
 * no toca React, ni red, ni DOM, ni localStorage. Se prueba con
 * `node --test purchases.test.js`.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const round3 = x => Math.round(x * 1000) / 1000;

  const COMPRA_ESTADOS = {
    PENDIENTE: 'pendiente',
    RECIBIDA: 'recibida',
  };

  const COMPRA_ESTADO_LABELS = {
    pendiente: 'Por recibir',
    recibida: 'Recibida',
  };

  /**
   * Estado efectivo de una compra. Una compra sin `estado` es histórica: se
   * registró cuando registrar era recibir, y sus lotes ya existen.
   */
  const compraEstado = compra => {
    if (!compra) return null;
    return compra.estado === COMPRA_ESTADOS.PENDIENTE
      ? COMPRA_ESTADOS.PENDIENTE
      : COMPRA_ESTADOS.RECIBIDA;
  };

  const isPendiente = compra => compraEstado(compra) === COMPRA_ESTADOS.PENDIENTE;

  /** Compras por recibir, más antigua primero (la que lleva más esperando). */
  const pendingCompras = (compras = []) =>
    (compras || [])
      .filter(isPendiente)
      .slice()
      .sort((a, b) => String(a.fechaEsperada || a.fecha || '').localeCompare(String(b.fechaEsperada || b.fecha || '')));

  /**
   * Proyecta las compras pendientes a la forma que `availability()` espera en
   * `incoming`: un elemento por ítem, con `estado:'pendiente'` y `cantidadKg`.
   * Ítems sin ingrediente o sin kilos positivos no se proyectan: no son una
   * cantidad con la que se pueda contar.
   */
  const incomingFromCompras = (compras = []) => {
    const out = [];
    for (const compra of pendingCompras(compras)) {
      for (const item of compra.items || []) {
        const kg = Number(item.kg ?? item.cantidadKg) || 0;
        if (!item.ingredienteId || kg <= 0) continue;
        out.push({
          compraId: compra.id,
          ingredienteId: item.ingredienteId,
          estado: COMPRA_ESTADOS.PENDIENTE,
          cantidadKg: round3(kg),
          precioPorKgCOP: Number(item.precio ?? item.precioPorKgCOP) || 0,
          fechaEsperada: compra.fechaEsperada || compra.fecha || null,
        });
      }
    }
    return out;
  };

  /** Kilos entrantes de un ingrediente (atajo para paneles de bodega). */
  const incomingKg = (ingredienteId, compras = []) =>
    round3(
      incomingFromCompras(compras)
        .filter(c => c.ingredienteId === ingredienteId)
        .reduce((s, c) => s + c.cantidadKg, 0)
    );

  /**
   * Recibir una compra: describe el cambio, no lo aplica. Devuelve la compra
   * con `estado:'recibida'` y los lotes y movimientos que hay que sumar a
   * `sdp_lotes` y `sdp_movimientos` — los mismos campos que escribía
   * `registrarCompra`, para que exista UN solo constructor de lote de insumo.
   *
   * `at` es la fecha en que los kilos entraron a bodega (YYYY-MM-DD), y es la
   * que va en `fechaIngreso`: el FIFO de `inventario.js` ordena por ella, y lo
   * que manda para el FIFO es cuándo llegó, no cuándo se encargó.
   *
   * `idSeed` permite ids deterministas en pruebas; por defecto usa `Date.now()`.
   */
  const receiveCompra = (compra, { at, idSeed } = {}) => {
    if (!compra || !compra.id) throw new Error('receiveCompra requiere una compra con id');
    if (!isPendiente(compra)) throw new Error(`La compra ${compra.id} no está pendiente de recepción`);
    const fechaRecepcion = at || compra.fechaEsperada || compra.fecha || null;
    if (!fechaRecepcion) throw new Error('receiveCompra requiere una fecha de recepción');

    const seed = idSeed != null ? idSeed : Date.now();
    const items = (compra.items || []).filter(it => it.ingredienteId && (Number(it.kg ?? it.cantidadKg) || 0) > 0);
    if (!items.length) throw new Error(`La compra ${compra.id} no tiene ítems con cantidad para recibir`);

    const lots = items.map((it, i) => {
      const kg = round3(Number(it.kg ?? it.cantidadKg) || 0);
      return {
        id: `lote_${seed}_${i}`,
        compraId: compra.id,
        ingredienteId: it.ingredienteId,
        cantidadKgTotal: kg,
        precioPorKgCOP: Number(it.precio ?? it.precioPorKgCOP) || 0,
        fechaIngreso: fechaRecepcion,
        cantidadKgDisponible: kg,
        activo: true,
      };
    });

    const movements = lots.map(l => ({
      id: `mov_${seed}_${l.id}`,
      loteId: l.id,
      ingredienteId: l.ingredienteId,
      tipo: 'entrada',
      cantidadKg: l.cantidadKgTotal,
      fecha: fechaRecepcion,
      referencia: compra.id,
    }));

    return {
      compra: { ...compra, estado: COMPRA_ESTADOS.RECIBIDA, fechaRecepcion },
      lots,
      movements,
    };
  };

  const api = {
    COMPRA_ESTADOS,
    COMPRA_ESTADO_LABELS,
    compraEstado,
    isPendiente,
    pendingCompras,
    incomingFromCompras,
    incomingKg,
    receiveCompra,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPurchases = api;
})();
