// Sincronización en dos sentidos entre dispositivos (ADR-0009).
//
// bitacora-sync.js solo escribe. Este módulo agrega lo que faltaba para que
// varios dispositivos compartan los mismos datos:
//
//   - escrituras genéricas por ruta, que la cola de sincronización
//     (sync-queue.js) despacha igual que las de Bitácora;
//   - el libro de asientos de Bodega, que solo se crea y nunca se modifica;
//   - lectura en vivo (onSnapshot) de las colecciones compartidas.
//
// La fusión de lo leído con la copia local es lógica pura en sync-merge.js e
// inventory-entries.js; aquí no se decide nada, solo se lee y se escribe.
import { db } from "./firebase-init.js";
import {
  collection, doc, onSnapshot, runTransaction, serverTimestamp, setDoc,
} from "../vendor/firebase/firebase-firestore.js";

// Únicas colecciones que la app sincroniza en dos sentidos. Una ruta fuera de
// esta lista es un error de programación, no algo que deba escribirse.
export const COLECCIONES = Object.freeze([
  "bitacora_lotes",
  "bitacora_bolsas",
  "bitacora_cosechas",
  "inventario_asientos",
  "inventario_movimientos",
  "inventario_compras",
  "inventario_proveedores",
  "inventario_reservas",
  "room_cycles",
]);

function ref(path) {
  const [coleccion, id, ...rest] = String(path || "").split("/");
  if (!COLECCIONES.includes(coleccion) || !id || rest.length) {
    throw new Error(`Ruta de sincronización inválida: ${path}`);
  }
  return { coleccion, ref: doc(db, coleccion, id) };
}

// Mismo motivo que stripFoto en bitacora-sync.js: la foto de una bolsa es un
// data URL de cientos de KB y las reglas la rechazan.
function limpiar(coleccion, data) {
  const { syncedAt, ...rest } = data || {};
  if (coleccion === "bitacora_bolsas") delete rest.foto;
  return rest;
}

export async function crearDocumento(path, data) {
  const { coleccion, ref: r } = ref(path);
  return setDoc(r, { ...limpiar(coleccion, data), syncedAt: serverTimestamp() });
}

// Una reserva solo avanza (held → expired/released/consumed). Un dispositivo
// que estuvo sin red puede subir un estado anterior al que ya tiene el
// servidor; la transacción lo descarta en vez de retroceder la reserva.
export const RANGO_RESERVA = Object.freeze({ held: 0, expired: 1, released: 2, consumed: 3 });

export async function actualizarDocumento(path, fields) {
  const { coleccion, ref: r } = ref(path);
  const data = { ...limpiar(coleccion, fields), syncedAt: serverTimestamp() };
  if (coleccion !== "inventario_reservas" || !("status" in data)) {
    return setDoc(r, data, { merge: true });
  }
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(r);
    const actual = snap.exists() ? snap.data().status : null;
    if (actual != null && (RANGO_RESERVA[actual] ?? -1) > (RANGO_RESERVA[data.status] ?? -1)) {
      delete data.status;
    }
    tx.set(r, data, { merge: true });
  });
}

// Lápida en vez de deleteDoc: un documento borrado desaparece sin dejar
// rastro y los demás dispositivos no podrían distinguirlo de uno que aún no
// leyeron.
export async function eliminarDocumento(path) {
  const { ref: r } = ref(path);
  return setDoc(r, { deleted: true, deletedAt: serverTimestamp(), syncedAt: serverTimestamp() }, { merge: true });
}

// Asiento del libro de Bodega: se crea una sola vez. Si otro dispositivo ya
// escribió el mismo id (la apertura de un lote restaurado en dos equipos), se
// conserva el primero y este dispositivo lo adopta en la siguiente lectura.
export async function crearAsientoInventario(entry) {
  if (!entry?.id || !entry?.lotId || !entry?.kind) throw new Error("Asiento de inventario inválido.");
  const r = doc(db, "inventario_asientos", entry.id);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(r);
    if (snap.exists()) return { created: false };
    tx.set(r, { ...entry, syncedAt: serverTimestamp() });
    return { created: true };
  });
}

// Lectura en vivo de una colección. `fromCache` indica que Firestore todavía
// no confirmó con el servidor: la fusión no infiere borrados en ese caso.
export function suscribirColeccion(coleccion, onData, onError) {
  if (!COLECCIONES.includes(coleccion)) throw new Error(`Colección no sincronizable: ${coleccion}`);
  return onSnapshot(
    collection(db, coleccion),
    { includeMetadataChanges: true },
    (snap) => onData({
      coleccion,
      // El id guardado en los datos manda: conserva su tipo (un proveedor con
      // id numérico seguiría coincidiendo con compra.proveedorId). El id del
      // documento solo cubre lápidas sin datos.
      docs: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
      fromCache: snap.metadata.fromCache,
      at: Date.now(),
    }),
    (err) => { if (typeof onError === "function") onError({ coleccion, error: err }); },
  );
}

// Mismo patrón que bitacora-sync.js: el bundle React no es un módulo ES.
window.SetasRemoteSyncDB = {
  COLECCIONES,
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento,
  crearAsientoInventario,
  suscribirColeccion,
};
window.dispatchEvent(new CustomEvent("setas-remote-sync-ready"));
