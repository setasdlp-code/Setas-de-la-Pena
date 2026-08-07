// Monitoreo de errores del cliente — sin servicio externo (Sentry, etc.):
// escribe en la colección "app_errors" de Firestore, que ya tiene caché
// offline persistente (ver firebase-init.js), así que un error capturado
// sin conexión igual queda encolado y se sincroniza solo al reconectar.
//
// Los listeners de window.onerror/unhandledrejection viven en un <script>
// clásico al inicio de <head> (ver Setas OS v5.dc.html), no aquí — este
// módulo se ejecuta después de todos los scripts clásicos (type="module"
// siempre se aplaza), así que por su cuenta se perdería los errores más
// tempranos y más graves. Aquí solo se drena ese buffer (window.__errorLog)
// y se registra como su "sink" para lo que ocurra de ahora en adelante.
import { db, auth } from "./firebase-init.js";
import { collection, addDoc, serverTimestamp } from "../vendor/firebase/firebase-firestore.js";

const MAX_LOGS_PER_SESSION = 20; // cortafuego ante un error en bucle (p.ej. en un render)
const seen = new Set();
let sent = 0;

function report(entry) {
  if (sent >= MAX_LOGS_PER_SESSION) return;
  const key = (entry.message || "") + "@" + (entry.stack || "").slice(0, 200);
  if (seen.has(key)) return; // no duplicar el mismo error repetido en la misma sesión
  seen.add(key);
  sent++;

  const payload = {
    message: String(entry.message || "").slice(0, 2000),
    stack: String(entry.stack || "").slice(0, 4000),
    source: entry.source || null,
    line: entry.line || null,
    col: entry.col || null,
    url: location.href,
    userAgent: navigator.userAgent,
    uid: auth.currentUser ? auth.currentUser.uid : null,
    email: auth.currentUser ? auth.currentUser.email : null,
    createdAt: serverTimestamp(),
  };

  // Nunca debe este módulo generar un error no capturado propio.
  addDoc(collection(db, "app_errors"), payload).catch(() => {});
}

window.__errorSink = report;
(window.__errorLog || []).forEach(report);
