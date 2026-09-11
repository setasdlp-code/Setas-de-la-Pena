// Respaldo de eventos de cultivo reportados por QR — un solo sentido
// (write-through), mismo patrón que bitacora-sync.js: la app nunca lee de
// aquí, y usa el id local (batch-sheet.js:buildCultivoEvento) como id del
// documento porque ese id ya es único y determinista, sin depender de que
// Firestore genere uno.
import { db } from "./firebase-init.js";
import { doc, setDoc, serverTimestamp } from "../vendor/firebase/firebase-firestore.js";

export async function registrarEvento(evento) {
  if (!evento || !evento.id) throw new Error('evento con id es requerido para registrar en eventos_cultivo');
  return setDoc(doc(db, "eventos_cultivo", evento.id), { ...evento, syncedAt: serverTimestamp() });
}

// simulador.html es un <script type="text/babel"> clásico (no un módulo
// ES), así que no puede hacer `import` de este archivo — se expone en
// window igual que bitacora-sync.js hace con window.SetasBitacoraDB.
window.SetasEventosCultivoDB = { registrarEvento };
window.dispatchEvent(new CustomEvent("setas-eventos-cultivo-db-ready"));
