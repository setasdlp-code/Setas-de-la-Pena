// Puerta de acceso para el shell "Setas OS v5.dc.html".
// Ese archivo usa el runtime .dc (clases + templates), no React puro, así que
// no podemos envolverlo en un <AuthGate> como se hizo en simulador.html.
//
// IMPORTANTE: el runtime .dc clona el <body> original dentro de un contenedor
// #dc-root para hidratarlo — cualquier HTML estático que pongamos como hermano
// de <x-dc> se duplica (una copia oculta original + una copia visible dentro
// de #dc-root), y con IDs duplicados document.getElementById() siempre agarra
// la copia equivocada (la oculta). Por eso el gate se construye 100% por JS y
// se inyecta directo en document.body — nace después de esa clonación, así que
// nunca se duplica.
import { auth } from "./firebase-init.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "../vendor/firebase/firebase-auth.js";

const ERRORES = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "Correo inválido.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  "auth/network-request-failed": "Sin conexión — revisa tu internet.",
};
const traducirError = (code) => ERRORES[code] || "No se pudo iniciar sesión. Inténtalo de nuevo.";

function buildGate() {
  const gate = document.createElement("div");
  gate.id = "setas-auth-gate";
  Object.assign(gate.style, {
    position: "fixed", inset: "0", zIndex: "999999", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "var(--paper-0, #f6f4ec)",
  });

  gate.innerHTML = `
    <form id="setas-auth-form" style="width:320px;padding:28px;background:#fff;border:1px solid var(--border-hairline,#ddd8c8);border-radius:10px;display:flex;flex-direction:column;gap:12px;box-shadow:0 4px 24px rgba(0,0,0,.06);font-family:var(--font-sans, Georgia, serif);">
      <div style="font-family:Georgia,serif;font-style:italic;font-size:22px;font-weight:700;color:var(--ink-0,#1a1410);">Setas de la Peña</div>
      <div id="setas-auth-status" style="font-family:var(--font-mono,monospace);font-size:11px;color:#8a8577;">Conectando…</div>
      <input id="setas-auth-email" type="email" required placeholder="correo@ejemplo.com" style="padding:10px 12px;border:1px solid var(--border-hairline,#ddd8c8);border-radius:6px;font:inherit;display:none;">
      <input id="setas-auth-password" type="password" required placeholder="Contraseña" style="padding:10px 12px;border:1px solid var(--border-hairline,#ddd8c8);border-radius:6px;font:inherit;display:none;">
      <div id="setas-auth-err" style="color:#C53030;font-size:12px;font-family:var(--font-mono,monospace);"></div>
      <button id="setas-auth-submit" type="submit" style="padding:11px 12px;background:var(--ink-0,#1a1410);color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;display:none;">Ingresar</button>
    </form>
  `;

  const signoutBtn = document.createElement("button");
  signoutBtn.id = "setas-auth-signout";
  signoutBtn.textContent = "Cerrar sesión";
  Object.assign(signoutBtn.style, {
    position: "fixed", top: "8px", right: "8px", zIndex: "999998",
    padding: "5px 10px", background: "#fff", border: "1px solid var(--border-hairline,#ddd8c8)",
    borderRadius: "6px", fontFamily: "var(--font-mono,monospace)", fontSize: "10px",
    color: "#8a8577", cursor: "pointer", display: "none",
  });

  document.body.appendChild(gate);
  document.body.appendChild(signoutBtn);

  return {
    gate,
    signoutBtn,
    status: gate.querySelector("#setas-auth-status"),
    email: gate.querySelector("#setas-auth-email"),
    password: gate.querySelector("#setas-auth-password"),
    err: gate.querySelector("#setas-auth-err"),
    submit: gate.querySelector("#setas-auth-submit"),
    form: gate.querySelector("#setas-auth-form"),
  };
}

function init() {
  const el = buildGate();
  let busy = false;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      el.gate.style.display = "none";
      el.signoutBtn.style.display = "block";
      el.signoutBtn.title = user.email || "";
    } else {
      el.gate.style.display = "flex";
      el.signoutBtn.style.display = "none";
      el.status.style.display = "none";
      el.email.style.display = "block";
      el.password.style.display = "block";
      el.submit.style.display = "block";
    }
  });

  el.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    el.err.textContent = "";
    el.submit.textContent = "Ingresando…";
    el.submit.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, el.email.value.trim(), el.password.value);
      // onAuthStateChanged se encarga de ocultar el gate al confirmar la sesión.
    } catch (ex) {
      el.err.textContent = traducirError(ex.code);
    }
    el.submit.textContent = "Ingresar";
    el.submit.disabled = false;
    busy = false;
  });

  el.signoutBtn.addEventListener("click", () => signOut(auth));

  // Expuesto para que el menú de operador del shell (Setas OS v5.dc.html,
  // fuera de este módulo) pueda cerrar sesión sin duplicar el botón flotante.
  window.__setasSignOut = () => signOut(auth);
}

if (document.body) init();
else document.addEventListener("DOMContentLoaded", init, { once: true });
