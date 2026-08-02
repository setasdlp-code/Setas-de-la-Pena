// Config del proyecto Firebase "SdlP - OS" (sdlp-os).
// apiKey/appId NO son secretos — Firestore/Auth se protegen con las Security Rules
// (firebase/firestore.rules), no ocultando esta config. Aun así este archivo no
// debe versionarse con datos reales de otro proyecto ajeno al equipo.
//
// Rellena los campos que faltan desde:
// Firebase Console → sdlp-os → ⚙️ Configuración del proyecto → General →
// "Tus apps" → agrega una app Web (</>) si no existe → copia el objeto firebaseConfig.
export const firebaseConfig = {
  apiKey: "AIzaSyAulvM9pauq-eqCOmN6a29dVXQg33DKP1g",
  authDomain: "sdlp-os.firebaseapp.com",
  projectId: "sdlp-os",
  storageBucket: "sdlp-os.firebasestorage.app",
  messagingSenderId: "416230541912",
  appId: "1:416230541912:web:c0a30861c7132e4c65d82d",
  // measurementId (Google Analytics) omitido a propósito: esto es una app interna
  // de operación de la granja, no un producto con usuarios externos que analizar.
  // Si más adelante lo quieres, vendorizar vendor/firebase/firebase-analytics.js
  // y agregar measurementId: "G-SY68T31FTV" aquí.
};
