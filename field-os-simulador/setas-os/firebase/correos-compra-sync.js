// Bandeja de correos de compra (Bodega → Compra → Correos).
//
// La función programada `importarCorreosCompra` (functions/) lee Gmail y crea
// un documento por correo en `correos_compra`. Este módulo sólo LEE esa
// colección en vivo y marca un correo como importado o descartado; nunca crea
// ni borra (las reglas tampoco lo permiten). Qué es un correo de compra, cómo
// se fusiona y qué transiciones valen vive en purchase-email-inbox.js.
import { db } from "./firebase-init.js";
import {
  collection, doc, onSnapshot, runTransaction, serverTimestamp,
} from "../vendor/firebase/firebase-firestore.js";

const COLECCION = "correos_compra";

export function suscribirCorreos(onData, onError) {
  return onSnapshot(
    collection(db, COLECCION),
    (snap) => onData({
      docs: snap.docs.map((d) => ({ id: d.id, ...d.data(), origen: "gmail" })),
      fromCache: snap.metadata.fromCache,
    }),
    (err) => { if (typeof onError === "function") onError(err); },
  );
}

// Sólo nueva → importada | descartada. La transacción descarta el cambio si
// otro equipo ya lo movió, en vez de pisarlo.
export async function marcarCorreo(id, estado, { compraId = null } = {}) {
  if (!id || !["importada", "descartada"].includes(estado)) throw new Error("Marca de correo inválida.");
  const r = doc(db, COLECCION, id);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(r);
    if (!snap.exists() || snap.data().estado !== "nueva") return { changed: false };
    tx.update(r, { estado, compraId: compraId || null, revisadoEn: serverTimestamp() });
    return { changed: true };
  });
}

// El bundle React no es un módulo ES: se expone en window igual que
// remote-sync.js con window.SetasRemoteSyncDB.
window.SetasCorreosCompraDB = { suscribirCorreos, marcarCorreo };
window.dispatchEvent(new CustomEvent("setas-correos-compra-ready"));
