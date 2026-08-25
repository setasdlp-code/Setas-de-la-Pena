// Inicialización única de Firebase para Setas OS.
// Se carga como <script type="module" src="firebase/firebase-init.js"></script>
// y expone window.SetasFirebase para que simulador.html / Setas OS.dc.html
// (que no son módulos ES, son scripts clásicos con Babel-en-navegador) puedan
// usarlo sin necesitar ellos mismos un <script type="module">.
import { initializeApp } from "../vendor/firebase/firebase-app.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "../vendor/firebase/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "../vendor/firebase/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { initSetasAI } from "./ai-logic.js";

const app = initializeApp(firebaseConfig);

// Caché local persistente (IndexedDB) con soporte multi-pestaña: las escrituras
// hechas sin señal quedan encoladas y se sincronizan solas al reconectar — es
// el punto que resuelve "cada dispositivo puede tener una versión distinta de
// la verdad" (hallazgo P0 de la auditoría UX).
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const auth = getAuth(app);
const ai = initSetasAI(app);

window.SetasFirebase = { app, db, auth, ai, onAuthStateChanged, signInWithEmailAndPassword, signOut };
window.dispatchEvent(new CustomEvent("setas-firebase-ready"));

export { app, db, auth, ai };

