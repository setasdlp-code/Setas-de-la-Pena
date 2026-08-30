'use strict';
// Un archivo plantilla (*.example, *.sample, *.template) existe para ser
// copiado y COMPLETADO por cada quien en su copia local ignorada por git. Su
// contrato es no llevar valores: en cuanto uno se rellena, deja de ser
// plantilla y pasa a ser una credencial versionada.
//
// Esto no es hipotético. env.example estuvo con la contraseña real de la cuenta
// de pruebas de sdlp-os durante 11 commits, en un repositorio público, hasta que
// se detectó por casualidad al revisar un diff. El escaneo de secretos de
// GitHub tampoco lo garantiza: reconoce patrones de proveedores conocidos
// (tokens de AWS, Stripe, GitHub), y una contraseña arbitraria no encaja en
// ninguno.
//
// La regla es deliberadamente absoluta —toda clave vacía, sin excepciones por
// nombre— porque cualquier lista de "claves sensibles" se queda corta: el email
// filtrado aquel día no habría entrado en ninguna. Si alguna plantilla futura
// necesita un valor por defecto no secreto, va en un comentario:
//
//   # PORT: por defecto 4173
//   PORT=
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE_RE = /\.(example|sample|template)$/i;
// KEY=valor, ignorando comentarios y líneas en blanco. El valor se captura tal
// cual para poder trimear: "KEY= secreto" (con espacio) es el error real que
// ocurrió, y sin trim pasaría por vacío.
const ASSIGNMENT_RE = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/;

const templateFiles = () => {
  // Solo archivos rastreados: lo no versionado no puede filtrarse al remoto, y
  // así no se inspecciona node_modules ni artefactos locales.
  const out = execFileSync('git', ['ls-files', '-z'], {
    cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  return out.split('\0').filter((f) => f && TEMPLATE_RE.test(f));
};

test('las plantillas *.example no llevan valores rellenados', () => {
  const offenders = [];

  for (const rel of templateFiles()) {
    const lines = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (/^\s*#/.test(line)) return;
      const m = line.match(ASSIGNMENT_RE);
      if (!m) return;
      const [, key, rawValue] = m;
      const value = rawValue.trim();
      if (value !== '') {
        // No se reproduce el valor: el mensaje de un test acaba en logs de CI
        // públicos, y volcarlo ahí repetiría la filtración que esto previene.
        offenders.push(`${rel}:${i + 1} — ${key} tiene un valor (${value.length} caracteres)`);
      }
    });
  }

  assert.deepEqual(offenders, [], [
    'Hay plantillas con valores rellenados:',
    ...offenders.map((o) => `  ${o}`),
    '',
    'Vacía esas claves y mueve el valor real a tu archivo local ignorado por git',
    '(.env). Si ya se publicó, rota la credencial: borrarla de un commit no la',
    'invalida.',
  ].join('\n'));
});

// Sin plantillas que revisar, el test anterior pasaría trivialmente y nadie se
// enteraría de que dejó de proteger nada — el mismo pase vacuo que
// perito-regression evita al salir no-cero sin corpus.
test('el guard encuentra al menos una plantilla que vigilar', () => {
  const found = templateFiles();
  assert.ok(
    found.length > 0,
    'no se encontró ninguna plantilla (*.example/*.sample/*.template): el guard ' +
    'no está protegiendo nada. Si de verdad ya no existen, borra este test en vez ' +
    'de dejarlo pasando en vacío.',
  );
});
