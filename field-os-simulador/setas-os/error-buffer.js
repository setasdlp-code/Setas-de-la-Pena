// Buffer de errores tempranos — debe cargar ANTES de cualquier otro script.
// firebase/error-monitor.js es type="module" y por eso siempre se ejecuta
// después de los scripts clásicos (react, support.js, scoring.js…); sin este
// buffer sincrónico, cualquier error que ocurra durante esa carga temprana
// (el más probable de romper la app entera) nunca llegaría a reportarse.
// error-monitor.js drena __errorLog en cuanto Firebase está listo.
//
// Archivo externo a propósito (no inline <script>): el runtime .dc de
// "Setas OS v5.dc.html" parece descartar el contenido de <script> inline
// puestos en el <head> real al reconstruir el documento, pero conserva los
// <script src="..."> externos (react.production.min.js, support.js, etc.
// sobreviven; un <script> inline con el mismo código no lo hacía).
(function () {
  window.__errorLog = [];
  function push(entry) {
    window.__errorLog.push(entry);
    if (window.__errorSink) { try { window.__errorSink(entry); } catch (_) {} }
  }
  window.addEventListener("error", function (e) {
    push({ message: e.message, stack: e.error && e.error.stack, source: e.filename || null, line: e.lineno || null, col: e.colno || null });
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    push({ message: (r && r.message) || String(r), stack: (r && r.stack) || null, source: "unhandledrejection" });
  });
})();
