// Lectura en tiempo real de las alertas de clima que escribe la función
// programada (functions/climate-alerts.js) en `climate_alerts`.
// Solo lectura: las reglas no permiten que el cliente escriba alertas.
import { collection, onSnapshot } from "../vendor/firebase/firebase-firestore.js";

/**
 * @param {Object} db - Instancia de Firestore
 * @param {(docs: Array<Object>) => void} onUpdate - recibe los documentos con su id
 * @param {(err: Error) => void} [onError]
 * @returns {Function} unsubscribe
 */
export function subscribeToClimateAlerts(db, onUpdate, onError) {
  if (!db || typeof onUpdate !== "function") return () => {};
  return onSnapshot(collection(db, "climate_alerts"), (snapshot) => {
    const docs = [];
    snapshot.forEach((docSnap) => docs.push({ ...docSnap.data(), id: docSnap.id }));
    onUpdate(docs);
  }, (err) => {
    console.warn("[ClimateAlerts] No se pudieron leer las alertas de clima:", err);
    if (typeof onError === "function") onError(err);
  });
}
