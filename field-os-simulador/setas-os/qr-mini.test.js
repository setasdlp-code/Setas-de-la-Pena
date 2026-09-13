'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const QRMini = require('./qr-mini.js');

const EXPECTED_FINDER = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

function checkFinder(m, startR, startC) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      assert.equal(
        m[startR + r][startC + c],
        EXPECTED_FINDER[r][c],
        `Finder mismatch at relative (${r}, ${c}) from (${startR}, ${startC})`
      );
    }
  }
}

test('QRMini exports matrix function in CommonJS environment', () => {
  assert.equal(typeof QRMini, 'object');
  assert.equal(typeof QRMini.matrix, 'function');
});

test('genera matrices cuadradas válidas con valores binarios 0 o 1', () => {
  const m = QRMini.matrix('SETAS-OS');
  assert.ok(Array.isArray(m), 'debe ser un array');
  assert.ok(m.length >= 21, 'versión 1 mínima tiene 21x21');
  for (let r = 0; r < m.length; r++) {
    assert.equal(m[r].length, m.length, `la fila ${r} debe tener la misma longitud que la matriz`);
    for (let c = 0; c < m[r].length; c++) {
      assert.ok(m[r][c] === 0 || m[r][c] === 1, `celda (${r}, ${c}) debe ser 0 o 1, recibio: ${m[r][c]}`);
    }
  }
});

test('contiene los tres patrones de búsqueda (find patterns) estándar de 7x7', () => {
  const m = QRMini.matrix('https://setasdelapena.co/c/CONT-123');
  const size = m.length;

  // Superior izquierdo: (0, 0)
  checkFinder(m, 0, 0);

  // Superior derecho: (0, size - 7)
  checkFinder(m, 0, size - 7);

  // Inferior izquierdo: (size - 7, 0)
  checkFinder(m, size - 7, 0);
});

test('las líneas de sincronización (timing patterns) alternan 1 y 0', () => {
  const m = QRMini.matrix('SHI-260714-03');
  const size = m.length;

  // Fila 6 (horizontal) entre finders: de col 8 a col size - 9
  for (let c = 8; c < size - 8; c++) {
    const expected = c % 2 === 0 ? 1 : 0;
    assert.equal(m[6][c], expected, `Timing horizontal en (6, ${c}) debe ser ${expected}`);
  }

  // Columna 6 (vertical) entre finders: de row 8 a row size - 9
  for (let r = 8; r < size - 8; r++) {
    const expected = r % 2 === 0 ? 1 : 0;
    assert.equal(m[r][6], expected, `Timing vertical en (${r}, 6) debe ser ${expected}`);
  }
});

test('codifica exitosamente todas las URLs y esquemas operativos de Setas OS', () => {
  const payloads = [
    // 1. Código simple de lote
    'SHI-260714-03',
    // 2. Código de bolsa
    'SHI-260714-03-B04',
    // 3. Esquema canónico interno
    'setas:lote:SHI-260714-03',
    // 4. URL de etiqueta térmica en GitHub Pages (lote)
    'https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html?codigo=SHI-260714-03',
    // 5. URL de etiqueta térmica de cosecha (con parámetro flush)
    'https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html?codigo=SHI-260714-03&flush=2',
    // 6. Enlace canónico de contenedor
    'https://setasdelapena.co/c/CONT-123',
    // 7. Enlace de trazabilidad de dominio propio
    'https://setasdelapena.co/public/trace.html?codigo=SHI-260714-03',
    // 8. JSON de lote de extracción
    JSON.stringify({
      id: 'EXT-20260913-01',
      spp: 'hericium_erinaceus',
      mth: 'double_extraction',
      bio: 500,
      yld: 50,
      cost: 25000,
      date: '2026-09-13T10:49:17.000Z',
    }),
  ];

  for (const p of payloads) {
    const m = QRMini.matrix(p);
    assert.ok(m.length >= 21 && m.length <= 57, `Tamaño de matriz ${m.length} fuera de rango para payload: ${p}`);
    checkFinder(m, 0, 0);
  }
});

test('soporta texto UTF-8 con tildes y caracteres especiales', () => {
  const m = QRMini.matrix('Setas de la Peña — Tenjo 2.600 msnm · Ostra Rosa & Melena de León');
  assert.ok(m.length >= 21);
  checkFinder(m, 0, 0);
});

test('respeta el límite de capacidad de versión 10 (213 bytes) y rechaza cargas mayores', () => {
  // Capacidad máxima de versión 10 en Level M es 213 bytes
  const maxPayload = 'A'.repeat(213);
  const m = QRMini.matrix(maxPayload);
  assert.equal(m.length, 57, 'Versión 10 debe medir exactamente 57x57 (17 + 4*10)');

  // 214 bytes debe lanzar error
  assert.throws(
    () => QRMini.matrix('A'.repeat(214)),
    /QR: payload too long/
  );
});
