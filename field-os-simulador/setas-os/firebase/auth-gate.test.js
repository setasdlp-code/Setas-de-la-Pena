'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('auth-gate.js exports traducirError function', () => {
  const src = read('auth-gate.js');
  assert.match(src, /export const traducirError/, 'traducirError debe ser exportado');
});

test('auth-gate.js exports buildGate function', () => {
  const src = read('auth-gate.js');
  assert.match(src, /export function buildGate/, 'buildGate debe ser exportado');
});

test('traducirError maps all known error codes correctly', () => {
  const src = read('auth-gate.js');
  const errorMappings = [
    ['auth/invalid-credential', 'Correo o contraseña incorrectos.'],
    ['auth/invalid-email', 'Correo inválido.'],
    ['auth/user-not-found', 'No existe una cuenta con ese correo.'],
    ['auth/wrong-password', 'Contraseña incorrecta.'],
    ['auth/too-many-requests', 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'],
    ['auth/network-request-failed', 'Sin conexión — revisa tu internet.'],
  ];

  errorMappings.forEach(([code, message]) => {
    assert.match(
      src,
      new RegExp(`"${code}":\\s*"${message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
      `error mapping for ${code} debe existir`
    );
  });
});

test('traducirError has default message for unknown errors', () => {
  const src = read('auth-gate.js');
  assert.match(
    src,
    /ERRORES\[code\]\s*\|\|\s*"No se pudo iniciar sesión\./,
    'debe tener mensaje por defecto para errores desconocidos'
  );
});

test('buildGate creates auth gate container with correct ID and styling', () => {
  const src = read('auth-gate.js');
  assert.match(src, /gate\.id\s*=\s*"setas-auth-gate"/, 'gate debe tener id setas-auth-gate');
  assert.match(src, /position:\s*"fixed"/, 'gate debe tener posición fixed');
  assert.match(src, /zIndex:/, 'gate debe tener z-index');
  assert.match(src, /display:\s*"flex"/, 'gate debe usar flexbox');
  assert.match(src, /alignItems:\s*"center"/, 'gate debe centrar items vertically');
});

test('buildGate creates form with id setas-auth-form', () => {
  const src = read('auth-gate.js');
  assert.match(src, /id="setas-auth-form"/, 'debe crear form con id setas-auth-form');
});

test('auth gate has email input with proper attributes', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('gate.innerHTML');
  const formEnd = src.indexOf('document.body.appendChild(gate)');
  const formHTML = src.slice(formStart, formEnd);

  assert.match(formHTML, /id="setas-auth-email"/, 'email input debe tener id setas-auth-email');
  assert.match(formHTML, /type="email"/, 'email input debe ser de tipo email');
  assert.match(formHTML, /required/, 'email input debe ser required');
  assert.match(formHTML, /autocomplete="email"/, 'email input debe tener autocomplete email');
  assert.match(formHTML, /placeholder="correo@ejemplo\.com"/, 'email input debe tener placeholder correo');
});

test('auth gate has password input with proper attributes', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('gate.innerHTML');
  const formEnd = src.indexOf('document.body.appendChild(gate)');
  const formHTML = src.slice(formStart, formEnd);

  assert.match(formHTML, /id="setas-auth-password"/, 'password input debe tener id setas-auth-password');
  assert.match(formHTML, /type="password"/, 'password input debe ser de tipo password');
  assert.match(formHTML, /required/, 'password input debe ser required');
  assert.match(formHTML, /autocomplete="current-password"/, 'password input debe tener autocomplete current-password');
});

test('auth gate has accessible labels for inputs', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('gate.innerHTML');
  const formEnd = src.indexOf('document.body.appendChild(gate)');
  const formHTML = src.slice(formStart, formEnd);

  assert.match(formHTML, /<label[^>]*for="setas-auth-email"/, 'debe tener label for email input');
  assert.match(formHTML, /<label[^>]*for="setas-auth-password"/, 'debe tener label for password input');
  assert.doesNotMatch(formHTML, /font-weight:800/, 'el login usa el peso Bold ya precargado y evita descargar Gaya Black');
});

test('auth gate has accessible status region with aria-live', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('gate.innerHTML');
  const formEnd = src.indexOf('document.body.appendChild(gate)');
  const formHTML = src.slice(formStart, formEnd);

  assert.match(formHTML, /id="setas-auth-status"/, 'debe tener status div con id setas-auth-status');
  assert.match(formHTML, /role="status"/, 'status debe tener role status');
  assert.match(formHTML, /aria-live="polite"/, 'status debe tener aria-live polite');
});

test('auth gate has accessible error alert with aria-live', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('gate.innerHTML');
  const formEnd = src.indexOf('document.body.appendChild(gate)');
  const formHTML = src.slice(formStart, formEnd);

  assert.match(formHTML, /id="setas-auth-err"/, 'debe tener error div con id setas-auth-err');
  assert.match(formHTML, /role="alert"/, 'error debe tener role alert');
  assert.match(formHTML, /aria-live="assertive"/, 'error debe tener aria-live assertive');
});

test('auth gate has submit button with correct type and ID', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('gate.innerHTML');
  const formEnd = src.indexOf('document.body.appendChild(gate)');
  const formHTML = src.slice(formStart, formEnd);

  assert.match(formHTML, /id="setas-auth-submit"/, 'submit button debe tener id setas-auth-submit');
  assert.match(formHTML, /type="submit"/, 'submit button debe ser type submit');
  assert.match(formHTML, /Ingresar al sistema/, 'submit button debe tener texto Ingresar al sistema');
});

test('auth gate creates signout button with correct ID and positioning', () => {
  const src = read('auth-gate.js');
  assert.match(src, /signoutBtn\.id\s*=\s*"setas-auth-signout"/, 'signout button debe tener id setas-auth-signout');
  assert.match(src, /position:\s*"fixed"/, 'signout button debe tener posición fixed');
  assert.match(src, /Cerrar sesión/, 'signout button debe tener texto Cerrar sesión');
});

test('buildGate returns object with all required DOM element references', () => {
  const src = read('auth-gate.js');
  const buildGateStart = src.indexOf('export function buildGate()');
  const buildGateEnd = src.indexOf('function init()');
  const buildGateBody = src.slice(buildGateStart, buildGateEnd);

  const requiredProps = ['gate', 'signoutBtn', 'status', 'emailLabel', 'passwordLabel', 'email', 'password', 'err', 'submit', 'form'];
  requiredProps.forEach(prop => {
    assert.match(buildGateBody, new RegExp(`${prop}[\\s,:=]`), `return object debe incluir ${prop}`);
  });
});

test('init function attaches gate and signout button to document.body', () => {
  const src = read('auth-gate.js');
  assert.match(src, /document\.body\.appendChild\(gate\)/, 'debe adjuntar gate a document.body');
  assert.match(src, /document\.body\.appendChild\(signoutBtn\)/, 'debe adjuntar signoutBtn a document.body');
});

test('init function exposes window.__setasSignOut', () => {
  const src = read('auth-gate.js');
  assert.match(src, /window\.__setasSignOut\s*=\s*\(\)\s*=>\s*signOut\(auth\)/, 'debe exponer window.__setasSignOut como función que llama signOut');
});

test('form submission handler prevents default and trims email', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('el.form.addEventListener("submit"');
  const formEnd = src.indexOf('el.signoutBtn.addEventListener("click"');
  const formHandler = src.slice(formStart, formEnd);

  assert.match(formHandler, /e\.preventDefault\(\)/, 'form submission debe prevenir default');
  assert.match(formHandler, /el\.email\.value\.trim\(\)/, 'email debe ser trimado antes de envío');
});

test('form submission handles authentication errors and displays translated messages', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('el.form.addEventListener("submit"');
  const formEnd = src.indexOf('el.signoutBtn.addEventListener("click"');
  const formHandler = src.slice(formStart, formEnd);

  assert.match(formHandler, /catch\s*\(ex\)/, 'debe tener catch para errores');
  assert.match(formHandler, /traducirError\(ex\.code\)/, 'debe llamar traducirError con código de error');
  assert.match(formHandler, /el\.err\.textContent/, 'debe mostrar error traducido');
});

test('form submission shows loading state on button during sign in', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('el.form.addEventListener("submit"');
  const formEnd = src.indexOf('el.signoutBtn.addEventListener("click"');
  const formHandler = src.slice(formStart, formEnd);

  assert.match(formHandler, /el\.submit\.textContent\s*=\s*"Ingresando…"/, 'debe mostrar "Ingresando…" durante envío');
  assert.match(formHandler, /el\.submit\.disabled\s*=\s*true/, 'debe desabilitar botón durante envío');
  assert.match(formHandler, /el\.submit\.textContent\s*=\s*"Ingresar"/, 'debe restaurar texto del botón después');
  assert.match(formHandler, /el\.submit\.disabled\s*=\s*false/, 'debe habilitar botón después');
});

test('form submission uses busy flag to prevent multiple concurrent submissions', () => {
  const src = read('auth-gate.js');
  const initStart = src.indexOf('function init()');
  const initEnd = src.indexOf('if (document.body)');
  const initBody = src.slice(initStart, initEnd);

  assert.match(initBody, /let busy\s*=\s*false/, 'debe declarar busy flag');
  assert.match(initBody, /if\s*\(busy\)\s*return/, 'debe retornar si busy es true');
  assert.match(initBody, /busy\s*=\s*true/, 'debe setear busy a true antes de sign in');
  assert.match(initBody, /busy\s*=\s*false/, 'debe setear busy a false después de sign in');
});

test('error display is cleared before form submission', () => {
  const src = read('auth-gate.js');
  const formStart = src.indexOf('el.form.addEventListener("submit"');
  const formEnd = src.indexOf('el.signoutBtn.addEventListener("click"');
  const formHandler = src.slice(formStart, formEnd);

  const errClear = formHandler.indexOf('el.err.textContent = ""');
  const signIn = formHandler.indexOf('signInWithEmailAndPassword');
  assert.ok(errClear < signIn, 'error debe ser limpiado antes del intento de sign in');
});

test('onAuthStateChanged shows/hides gate based on user login state', () => {
  const src = read('auth-gate.js');
  const authStart = src.indexOf('onAuthStateChanged(auth, async (user) => {');
  const authEnd = src.indexOf('el.form.addEventListener("submit"');
  const authHandler = src.slice(authStart, authEnd);

  assert.match(authHandler, /if\s*\(user\)/, 'debe verificar si user existe');
  assert.match(authHandler, /await loadDataRuntime\(\)/, 'debe preparar servicios de datos antes de montar la app');
  assert.match(authHandler, /el\.gate\.style\.display\s*=\s*"none"/, 'debe ocultar gate cuando hay usuario y datos listos');
  assert.match(authHandler, /el\.signoutBtn\.style\.display\s*=\s*"block"/, 'debe mostrar signout cuando hay usuario');
  assert.match(authHandler, /el\.signoutBtn\.title\s*=\s*user\.email/, 'debe mostrar email en title del botón');
  assert.match(authHandler, /el\.gate\.style\.display\s*=\s*"flex"/, 'debe mostrar gate cuando no hay usuario');
  assert.match(authHandler, /el\.signoutBtn\.style\.display\s*=\s*"none"/, 'debe ocultar signout cuando no hay usuario');
});

test('auth state gates the protected runtime and publishes a mount signal', () => {
  const src = read('auth-gate.js');
  const shell = read('../Setas OS v5.dc.html');
  const app = read('../simulador-app.jsx');

  assert.match(src, /window\.__setasAuthState\s*=\s*authenticated/, 'debe guardar el estado de auth para el puente React');
  assert.match(src, /new CustomEvent\(AUTH_STATE_EVENT,\s*\{\s*detail:\s*\{\s*authenticated\s*\}\s*\}\)/, 'debe publicar el cambio de auth');
  assert.match(src, /syncAuthGatedResources\(authenticated\)/, 'debe hidratar recursos solo con sesión válida');
  assert.match(src, /querySelectorAll\("\[data-auth-src\]"\)/, 'debe localizar recursos diferidos');
  assert.match(src, /node\.setAttribute\("src",\s*node\.dataset\.authSrc\)/, 'debe iniciar el iframe solo al autenticar');
  assert.match(src, /node\.removeAttribute\("src"\)/, 'debe liberar el iframe al cerrar sesión');

  assert.match(shell, /<html[^>]*data-setas-auth-state="pending"/, 'el shell debe empezar protegido antes de que Firebase responda');
  assert.match(shell, /class="sim-root setas-auth-gated"/, 'el simulador debe estar marcado como superficie protegida');
  assert.match(shell, /<iframe class="setas-auth-gated" data-auth-src="climate-bench\.html"/, 'el banco climático debe diferir su carga');
  assert.match(shell, /<img data-auth-src="_standalone_imgs\/logo-sdlp\.png"/, 'el logo del rail debe esperar la sesión');
  assert.doesNotMatch(shell, /<img src="_standalone_imgs\/logo-sdlp\.png"/, 'el logo oculto no debe descargarse en el login');
  assert.match(shell, /content-visibility:\s*hidden/, 'la superficie protegida debe omitir paint mientras no hay sesión');

  assert.match(app, /function SimuladorShell\(props\)/, 'la aplicación pesada debe vivir detrás del shell de auth');
  assert.match(app, /window\.addEventListener\('setas-auth-state',onAuthState\)/, 'el shell React debe escuchar la señal de auth');
  assert.match(app, /return isAuthenticated\?<SimuladorShell \{\.\.\.props\}\/>:null/, 'el simulador no debe montar antes de autenticar');
});

test('los servicios Firestore solo se importan después de confirmar Auth', () => {
  const src = read('auth-gate.js');
  const shell = read('../Setas OS v5.dc.html');
  const bootstrap = read('firebase-auth-bootstrap.js');
  const dataRuntime = read('firebase-init.js');

  assert.match(src, /await import\("\.\/firebase-init\.js"\)/);
  assert.match(src, /import\("\.\/error-monitor\.js"\)/);
  assert.match(src, /import\("\.\/db\.js"\)/);
  assert.match(src, /import\("\.\/bitacora-sync\.js"\)/);
  assert.match(src, /await import\("\.\.\/simulador-app\.js"\)/, 'el shell React debe cargarse después de los servicios de datos');
  assert.ok(
    src.indexOf('await import("../simulador-app.js")') > src.indexOf('import("./bitacora-sync.js")'),
    'el shell React debe esperar al runtime de Bitácora'
  );
  assert.match(src, /new CustomEvent\(DATA_READY_EVENT\)/);
  assert.doesNotMatch(shell, /<script type="module" src="firebase\/firebase-init\.js"><\/script>/);
  assert.doesNotMatch(shell, /<script type="module" src="firebase\/db\.js"><\/script>/);
  assert.doesNotMatch(shell, /<x-import[^>]+\sfrom="\.\/simulador-app\.js"/, 'el login no debe tener un x-import estático del bundle React');
  assert.match(shell, /<x-import component-from-global-scope="SimuladorApp"\s+tab=/, 'el runtime debe conservar el punto de montaje global');
  assert.match(bootstrap, /from "\.\.\/vendor\/firebase\/firebase-auth\.js"/);
  assert.doesNotMatch(bootstrap, /firebase-firestore\.js/);
  assert.match(dataRuntime, /from "\.\.\/vendor\/firebase\/firebase-firestore\.js"/);
});

test('signout button listener calls signOut(auth)', () => {
  const src = read('auth-gate.js');
  assert.match(src, /el\.signoutBtn\.addEventListener\("click",\s*\(\)\s*=>\s*signOut\(auth\)\)/, 'signout button debe llamar signOut');
});

test('module auto-initializes on DOM ready', () => {
  const src = read('auth-gate.js');
  assert.match(src, /if\s*\(document\.body\)\s*init\(\)/, 'debe correr init si document.body existe');
  assert.match(src, /document\.addEventListener\("DOMContentLoaded",\s*init/, 'debe correr init en DOMContentLoaded si es necesario');
});

test('Setas OS v5.dc.html loads auth-gate.js as module', () => {
  const shell = read('../Setas OS v5.dc.html');
  assert.match(shell, /<script[^>]*type="module"[^>]*src="firebase\/auth-gate\.js"/, 'Setas OS v5 debe cargar auth-gate como módulo');
});
