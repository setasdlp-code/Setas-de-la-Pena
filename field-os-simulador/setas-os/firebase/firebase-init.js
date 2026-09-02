// Servicios de datos de Firebase para Setas OS.
//
// Auth carga primero firebase-auth-bootstrap.js para pintar el acceso sin
// descargar Firestore. auth-gate.js importa este módulo solo después de
// confirmar una sesión, y luego publica los servicios de datos en
// window.SetasFirebase para el shell clásico.
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "../vendor/firebase/firebase-firestore.js";
import {
  app,
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "./firebase-auth-bootstrap.js";
import { initSetasAI } from "./ai-logic.js";
import { pushClimateReading, subscribeToLiveClimate } from "./telemetria-sync.js";

// Caché local persistente (IndexedDB) con soporte multi-pestaña: las escrituras
// hechas sin señal quedan encoladas y se sincronizan solas al reconectar — es
// el punto que resuelve "cada dispositivo puede tener una versión distinta de
// la verdad" (hallazgo P0 de la auditoría UX).
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// ai-logic.js puede inicializar SetasAI al detectar el bootstrap de Auth. No
// se duplica el evento ni el objeto global si ya ocurrió durante su evaluación.
const ai = window.SetasAI || initSetasAI(app);

Object.assign(window.SetasFirebase, {
  app,
  db,
  auth,
  ai,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  pushClimateReading: (reading) => pushClimateReading(db, reading),
  subscribeToLiveClimate: (cb) => subscribeToLiveClimate(db, cb)
});
window.dispatchEvent(new CustomEvent("setas-firebase-ready"));
window.dispatchEvent(new CustomEvent("setas-firebase-data-ready"));

export { app, db, auth, ai, pushClimateReading, subscribeToLiveClimate };
