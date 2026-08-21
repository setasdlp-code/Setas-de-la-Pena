// Respaldo de Bitácora en Firestore — un solo sentido (write-through).
// La app nunca lee de aquí: localStorage sigue siendo la única fuente de
// verdad para la UI. Mismo patrón fire-and-forget que crearLoteProduccion
// en db.js. Usa el id local como id del documento (a diferencia de
// crearLoteProduccion, que deja que Firestore genere el id) porque
// Bitácora actualiza y borra registros por ese id local más adelante.
import { db } from "./firebase-init.js";
import {
  doc, setDoc, deleteDoc, serverTimestamp,
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

export async function guardarBolsas(bolsas) {
  return Promise.all(
    (bolsas || []).map((b) =>
      setDoc(doc(db, "bitacora_bolsas", b.id), { ...stripFoto(b), syncedAt: serverTimestamp() })
    )
  );
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

export async function eliminarLoteCascade(loteId, bolsaIds, cosechaIds) {
  return Promise.all([
    deleteDoc(doc(db, "bitacora_lotes", loteId)),
    ...(bolsaIds || []).map((id) => deleteDoc(doc(db, "bitacora_bolsas", id))),
    ...(cosechaIds || []).map((id) => deleteDoc(doc(db, "bitacora_cosechas", id))),
  ]);
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
