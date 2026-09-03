// Bootstrap mínimo para la pantalla de acceso de Setas OS.
//
// Mantiene Firebase Auth disponible antes de iniciar servicios de datos
// pesados. Firestore, IA, telemetría y respaldos se inicializan solamente
// después de que auth-gate.js confirma una sesión válida.
import { initializeApp } from "../vendor/firebase/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "../vendor/firebase/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.SetasFirebase = {
  ...(window.SetasFirebase || {}),
  app,
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
};
window.dispatchEvent(new CustomEvent("setas-firebase-auth-ready"));

export {
  app,
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
};
