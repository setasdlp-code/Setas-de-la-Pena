// Respaldo de Bitácora en Firestore — un solo sentido (write-through).
// La app nunca lee de aquí: localStorage sigue siendo la única fuente de
// verdad para la UI. Mismo patrón fire-and-forget que crearLoteProduccion
// en db.js. Usa el id local como id del documento (a diferencia de
// crearLoteProduccion, que deja que Firestore genere el id) porque
// Bitácora actualiza y borra registros por ese id local más adelante.
import { db } from "./firebase-init.js";
import {
  doc, setDoc, deleteDoc, serverTimestamp, writeBatch,
} from "../vendor/firebase/firebase-firestore.js";

// bolsa.foto es un data URL base64 (ver compressImageToDataURL en
// simulador-app.jsx) — cientos de KB por bolsa. Se excluye del respaldo
// a propósito: no aporta al motor de calibración ni a la trazabilidad
// estructurada, y multiplicaría el costo/tamaño de almacenamiento.
const stripFoto = (obj) => {
  const { foto, ...rest } = obj || {};
  return rest;
};

export async function guardarLote(lote) {
  return setDoc(doc(db, "bitacora_lotes", lote.id), { ...lote, syncedAt: serverTimestamp() });
}

export async function actualizarLote(loteId, fields) {
  return setDoc(doc(db, "bitacora_lotes", loteId), { ...fields, syncedAt: serverTimestamp() }, { merge: true });
}

// writeBatch en vez de Promise.all de escrituras independientes: si una
// bolsa fallara a mitad del lote, Promise.all dejaría el resto ya escrito
// — huérfanas sin la bolsa que faltó, sin forma de detectarlo después
// porque este módulo nunca lee de Firestore. El batch hace que las N
// bolsas de un lote se escriban todas o ninguna.
export async function guardarBolsas(bolsas) {
  const batch = writeBatch(db);
  (bolsas || []).forEach((b) => {
    batch.set(doc(db, "bitacora_bolsas", b.id), { ...stripFoto(b), syncedAt: serverTimestamp() });
  });
  return batch.commit();
}

export async function actualizarBolsa(bolsaId, fields) {
  return setDoc(doc(db, "bitacora_bolsas", bolsaId), { ...stripFoto(fields), syncedAt: serverTimestamp() }, { merge: true });
}

export async function guardarCosecha(cosecha) {
  return setDoc(doc(db, "bitacora_cosechas", cosecha.id), { ...cosecha, syncedAt: serverTimestamp() });
}

export async function eliminarCosecha(id) {
  return deleteDoc(doc(db, "bitacora_cosechas", id));
}

// Mismo motivo que guardarBolsas: un borrado en cascada a medias deja
// documentos huérfanos que este módulo, al no leer nunca de Firestore, no
// puede detectar ni reconciliar después.
export async function eliminarLoteCascade(loteId, bolsaIds, cosechaIds) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "bitacora_lotes", loteId));
  (bolsaIds || []).forEach((id) => batch.delete(doc(db, "bitacora_bolsas", id)));
  (cosechaIds || []).forEach((id) => batch.delete(doc(db, "bitacora_cosechas", id)));
  return batch.commit();
}

// simulador.html es un <script type="text/babel"> clásico (no un módulo
// ES), así que no puede hacer `import` de este archivo — se expone en
// window igual que firebase-init.js hace con window.SetasFirebase y
// db.js con window.SetasDB.
window.SetasBitacoraDB = {
  guardarLote, actualizarLote, guardarBolsas, actualizarBolsa,
  guardarCosecha, eliminarCosecha, eliminarLoteCascade,
};
window.dispatchEvent(new CustomEvent("setas-bitacora-db-ready"));
