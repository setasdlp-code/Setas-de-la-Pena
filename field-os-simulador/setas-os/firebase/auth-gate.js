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
    position: "fixed", inset: "0", zIndex: "var(--z-overlay, 1000)", display: "flex",
    alignItems: "center", justifyContent: "center",
    padding: "16px", background: "var(--paper-1, #efebe0)",
  });

  gate.innerHTML = `
    <form id="setas-auth-form" style="width:min(396px,calc(100vw - 32px));padding:6px;background:var(--paper-2,#e5dfd0);border:1px solid var(--ink-0,#1a1410);border-radius:var(--radius-md,3px);box-shadow:var(--shadow-panel-lift,0 18px 50px rgba(26,20,16,.16));font-family:var(--font-sans,Georgia,serif);">
      <div style="display:flex;flex-direction:column;gap:12px;padding:26px 24px 24px;background:var(--paper-0,#f7f4ec);border:1px solid var(--border-hairline,#8c7f5b);">
        <div style="display:flex;align-items:center;gap:9px;font-family:var(--font-mono,monospace);font-size:10.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--accent-terracotta,#a85c32);"><span aria-hidden="true" style="width:22px;height:2px;background:currentColor;"></span>Setas OS · Operación Tenjo</div>
        <h1 style="margin:2px 0 0;font-family:var(--font-display,Georgia,serif);font-size:30px;line-height:1.05;font-weight:700;color:var(--ink-0,#1a1410);">Setas de la Peña</h1>
        <p style="margin:0 0 4px;font-size:13px;line-height:1.5;color:var(--ink-2,#6b6759);">Acceso reservado al equipo de cultivo, trazabilidad y formulación.</p>
        <div id="setas-auth-status" role="status" aria-live="polite" style="font-family:var(--font-mono,monospace);font-size:11px;color:var(--ink-2,#6b6759);">Conectando…</div>
        <label for="setas-auth-email" style="display:none;font-size:12px;font-weight:800;color:var(--ink-0,#1a1410);">Correo</label>
        <input id="setas-auth-email" name="email" type="email" required autocomplete="email" spellcheck="false" placeholder="correo@ejemplo.com" style="min-height:46px;padding:10px 12px;border:1px solid var(--border-hairline,#8c7f5b);border-radius:var(--radius-sm,2px);background:var(--paper-0,#f7f4ec);color:var(--ink-0,#1a1410);font:inherit;display:none;">
        <label for="setas-auth-password" style="display:none;font-size:12px;font-weight:800;color:var(--ink-0,#1a1410);">Contraseña</label>
        <input id="setas-auth-password" name="password" type="password" required autocomplete="current-password" placeholder="Contraseña" style="min-height:46px;padding:10px 12px;border:1px solid var(--border-hairline,#8c7f5b);border-radius:var(--radius-sm,2px);background:var(--paper-0,#f7f4ec);color:var(--ink-0,#1a1410);font:inherit;display:none;">
        <div id="setas-auth-err" role="alert" aria-live="assertive" style="min-height:18px;color:var(--status-error,#c53030);font-size:12px;font-family:var(--font-mono,monospace);"></div>
        <button id="setas-auth-submit" type="submit" style="min-height:46px;padding:11px 14px;background:var(--ink-0,#1a1410);color:var(--paper-0,#f7f4ec);border:1px solid var(--ink-0,#1a1410);border-radius:var(--radius-sm,2px);font-weight:800;letter-spacing:.04em;cursor:pointer;display:none;">Ingresar al sistema</button>
      </div>
    </form>
  `;

  const signoutBtn = document.createElement("button");
  signoutBtn.id = "setas-auth-signout";
  signoutBtn.textContent = "Cerrar sesión";
  Object.assign(signoutBtn.style, {
    position: "fixed", top: "10px", right: "10px", zIndex: "var(--z-fab, 65)",
    minHeight: "44px", padding: "8px 12px", background: "var(--paper-0,#f7f4ec)", border: "1px solid var(--border-hairline,#8c7f5b)",
    borderRadius: "var(--radius-sm,2px)", fontFamily: "var(--font-mono,monospace)", fontSize: "10.5px", fontWeight: "700",
    color: "var(--ink-2,#6b6759)", cursor: "pointer", display: "none",
  });

  document.body.appendChild(gate);
  document.body.appendChild(signoutBtn);

  return {
    gate,
    signoutBtn,
    status: gate.querySelector("#setas-auth-status"),
    emailLabel: gate.querySelector('label[for="setas-auth-email"]'),
    passwordLabel: gate.querySelector('label[for="setas-auth-password"]'),
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
      el.emailLabel.style.display = "block";
      el.password.style.display = "block";
      el.passwordLabel.style.display = "block";
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
