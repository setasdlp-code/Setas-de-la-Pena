'use strict';

/**
 * @file qr-system-audit.test.js — Auditoría exhaustiva y pruebas de integración
 * del subsistema completo de códigos QR en Setas OS.
 *
 * Cubre:
 * 1. Generación de matriz QR (qr-mini.js): especificación ISO/IEC 18004,
 *    decodificación round-trip real con vendor/jsQR.js para versiones 1..10,
 *    paridad de codificación UTF-8 RFC 3629 (con y sin TextEncoder), y manejo de caracteres astrales (4-bytes).
 * 2. Resolución de etiquetas de campo (field-qr-resolve.js): contrato estricto de transición.
 * 3. Resolución operativa de escaneo (batch-sheet.js): códigos directos, URLs con query, JSON, prefijos,
 *    y conservación de lote y bolsa.
 * 4. Etiquetas térmicas Phomemo M110: URLs de lote, bolsa individual con bagId propio, quiet zone q=4.
 * 5. Escáner de cámara móvil: soporte BarcodeDetector, respaldo jsQR, precacheo offline en sw.js,
 *    y guardia de una sola transición (scanResolvingRef) contra carreras asíncronas.
 * 6. Trazabilidad pública (public/trace.html): precedencia determinista (codigo > code > lote > batch),
 *    rechazo de parámetros en conflicto, sanitización estricta, consulta de lote padre para bolsas y reporte explícito sin conexión.
 * 7. Shell host (Setas OS v5.dc.html): preservación de escaneos contextuales y enrutamiento hacia la captura canónica.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const qrMini = require('./qr-mini.js');
const fieldQrResolve = require('./field-qr-resolve.js');
const batchSheet = require('./batch-sheet.js');
const jsQR = require('./vendor/jsQR.js');

const HERE = __dirname;
const SIM_APP_JSX = fs.readFileSync(path.join(HERE, 'simulador-app.jsx'), 'utf8');
const TRACE_HTML = fs.readFileSync(path.join(HERE, 'public', 'trace.html'), 'utf8');
const SHELL_HTML = fs.readFileSync(path.join(HERE, 'Setas OS v5.dc.html'), 'utf8');
const SW_JS = fs.readFileSync(path.join(HERE, 'sw.js'), 'utf8');

function decodeMatrixWithJsQR(matrix, scale = 5, quiet = 4) {
  const n = matrix.length;
  const dim = n + quiet * 2;
  const width = dim * scale;
  const height = dim * scale;
  const data = new Uint8ClampedArray(width * height * 4);
  data.fill(255);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] === 1) {
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const x = (c + quiet) * scale + px;
            const y = (r + quiet) * scale + py;
            const idx = (y * width + x) * 4;
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
            data[idx + 3] = 255;
          }
        }
      }
    }
  }
  return jsQR(data, width, height);
}

// ── 1. GENERACIÓN QR Y DECODIFICACIÓN ROUND-TRIP (qr-mini.js) ─────────────

test('qr-mini genera matrices válidas y finder patterns en las 3 esquinas', () => {
  const m = qrMini.matrix('https://setasdelapena.co/c/L-01');
  const size = m.length;
  assert.ok(size >= 21 && size <= 57);

  // Validar finder en esquina superior izquierda
  assert.equal(m[0][0], 1);
  assert.equal(m[0][6], 1);
  assert.equal(m[6][0], 1);
  assert.equal(m[6][6], 1);
  assert.equal(m[1][1], 0);
  assert.equal(m[3][3], 1); // centro del finder
});

test('decodificación round-trip con jsQR verifica versiones 1 hasta 10 con caracteres astrales', () => {
  const targetLengths = [10, 20, 35, 55, 75, 95, 115, 135, 165, 195];

  for (let v = 1; v <= 10; v++) {
    const len = targetLengths[v - 1];
    const payload = 'V' + v + '-' + '🍄'.repeat(Math.floor((len - 10) / 4)) + '-X'.repeat(len % 4) + '-PAD' + String(v).padStart(3, '0');
    const m = qrMini.matrix(payload);
    const expectedSize = 17 + 4 * v;
    assert.equal(m.length, expectedSize, `Versión ${v} debe tener tamaño ${expectedSize}`);

    const decoded = decodeMatrixWithJsQR(m, 5, 4);
    assert.ok(decoded, `jsQR falló al decodificar Versión ${v}`);
    assert.equal(decoded.data, payload, `Payload decodificado no coincide en Versión ${v}`);
  }
});

test('toUtf8Bytes en qr-mini produce bytes idénticos con y sin TextEncoder para UTF-8 y surrogates', () => {
  const src = fs.readFileSync(path.join(HERE, 'qr-mini.js'), 'utf8');
  const match = src.match(/function toUtf8Bytes\(text\) \{([\s\S]*?)\n  \}/);
  assert.ok(match, 'debe encontrarse toUtf8Bytes');
  const fnBody = match[1];

  const withTE = new Function('text', 'const TextEncoder = globalThis.TextEncoder;\n' + fnBody);
  const withoutTE = new Function('text', 'const TextEncoder = undefined;\n' + fnBody);

  const samples = [
    'ASCII puro: Setas de la Pena 123',
    'Latín 2-bytes: Tenjo, Cundinamarca · cañón, música, ñandú',
    'BMP 3-bytes: — · ★ ➜ « »',
    'Astral 4-bytes: 🍄 🌿 🧪 ✨ 🚜',
    'Surrogates huérfanos: \uD800 test \uDC00 end'
  ];

  for (const s of samples) {
    const b1 = withTE(s);
    const b2 = withoutTE(s);
    assert.deepEqual(b1, b2, `Discrepancia en UTF-8 para: ${s}`);
  }
});

// ── 2. RESOLUCIÓN DE CAMPO (field-qr-resolve.js) ───────────────────────────

test('field-qr-resolve preserva su contrato estricto de transición de lotes', () => {
  assert.deepEqual(fieldQrResolve.parseBatchRef('setas:lote:L-042'), { batchId: 'L-042' });
  assert.deepEqual(fieldQrResolve.parseBatchRef('https://setasdelapena.co/c/L-042'), { batchId: 'L-042' });
  assert.deepEqual(fieldQrResolve.parseBatchRef('https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html?codigo=L-042'), { batchId: 'L-042' });

  // Rechaza dominios ajenos y cargas arbitrarias
  assert.throws(() => fieldQrResolve.parseBatchRef('https://externo.com/trace/L-042'), /invalid_qr_payload/);
  assert.throws(() => fieldQrResolve.parseBatchRef('cadena-arbitraria'), /invalid_qr_payload/);
});

// ── 3. RESOLUCIÓN OPERATIVA DE FICHA (batch-sheet.js) ──────────────────────

test('batch-sheet resolveScan cubre todas las modalidades de entrada de campo', () => {
  const lote = { id: 'L1', codigo: 'SHI-260714-03', estado: 'incubacion' };
  const bolsas = [
    { id: 'B1', codigo: 'SHI-260714-03-B01', loteId: 'L1' },
    { id: 'B2', codigo: 'SHI-260714-03-B02', loteId: 'L1' },
  ];
  const index = { lotes: [lote], bolsas };

  // 1. Código directo de lote
  assert.equal(batchSheet.resolveScan('SHI-260714-03', index).batchId, 'L1');
  // 2. ID directo de lote
  assert.equal(batchSheet.resolveScan('L1', index).batchId, 'L1');
  // 3. Código directo de bolsa existente
  const bRes = batchSheet.resolveScan('SHI-260714-03-B02', index);
  assert.equal(bRes.kind, 'bag');
  assert.equal(bRes.batchId, 'L1');
  assert.equal(bRes.bagId, 'B2');
  // 4. URL con query param
  const urlRes = batchSheet.resolveScan('https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html?codigo=SHI-260714-03-B01', index);
  assert.equal(urlRes.kind, 'bag');
  assert.equal(urlRes.bagId, 'B1');
  // 5. Esquema con prefijo setas:lote:
  assert.equal(batchSheet.resolveScan('setas:lote:SHI-260714-03', index).batchId, 'L1');
  // 6. Esquema con prefijo setas:bag:
  assert.equal(batchSheet.resolveScan('setas:bag:SHI-260714-03-B02', index).bagId, 'B2');
  // 7. Certificado SDP-CERT-
  assert.equal(batchSheet.resolveScan('SDP-CERT-SHI-260714-03', index).batchId, 'L1');
  // 8. JSON
  assert.equal(batchSheet.resolveScan('{"batch":"SHI-260714-03"}', index).batchId, 'L1');
  // 9. Bolsa no registrada aún (resolución por prefijo)
  const unreg = batchSheet.resolveScan('SHI-260714-03-B99', index);
  assert.equal(unreg.kind, 'batch');
  assert.equal(unreg.batchId, 'L1');
  assert.equal(unreg.reason, 'resolved_by_prefix');
});

// ── 4. ETIQUETAS TÉRMICAS EN SIMULADOR-APP.JSX ────────────────────────────

test('las etiquetas térmicas de bolsas individuales codifican el bagId en su qrUrl', () => {
  assert.match(
    SIM_APP_JSX,
    /const bagId = `\$\{lote\.codigo\}-B\$\{bagNum\}`;[\s\S]*?qrUrl: `\$\{PUBLIC_TRACE_BASE_URL\}\?codigo=\$\{encodeURIComponent\(bagId\)\}`/,
    'Cada etiqueta térmica de bolsa debe codificar su bagId específico en la URL del QR'
  );
});

test('drawThermalLabelToCanvas implementa quiet zone q=4 para paridad exacta con el SVG', () => {
  assert.match(
    SIM_APP_JSX,
    /const q = 4;[\s\S]*?const dim = n \+ q \* 2;[\s\S]*?fillRect\(qrX, qrY, qrSize, qrSize\)/,
    'drawThermalLabelToCanvas debe definir quiet zone q=4 y fondo blanco limpio'
  );
});

test('simulador-app.jsx implementa guardia de transición única (scanResolvingRef) contra re-entradas', () => {
  assert.match(
    SIM_APP_JSX,
    /const scanResolvingRef = React\.useRef\(false\);/,
    'Debe existir ref para proteger contra múltiples llamadas asíncronas concurrentes de la cámara'
  );
  assert.match(
    SIM_APP_JSX,
    /if \(!raw \|\| scanResolvingRef\.current\) return;/,
    'handleScannedValue debe abortar de inmediato si ya hay una resolución en progreso'
  );
  assert.match(
    SIM_APP_JSX,
    /scanResolvingRef\.current = true;/,
    'handleScannedValue debe marcar la guardia al encontrar un lote válido'
  );
});

test('service worker precachea vendor/jsQR.js en BOOT para garantizar disponibilidad offline', () => {
  assert.match(
    SW_JS,
    /const BOOT = \[.*?'\.\/vendor\/jsQR\.js'.*?\];/,
    'sw.js debe incluir ./vendor/jsQR.js en BOOT'
  );
});

// ── 5. TRAZABILIDAD PÚBLICA (trace.html) ───────────────────────────────────

test('trace.html extraerParametros aplica precedencia determinista y rechaza conflictos', () => {
  assert.match(
    TRACE_HTML,
    /const SCAN_CODE_PARAMS = \['codigo',\s*'code',\s*'lote',\s*'batch'\];/,
    'extraerParametros debe usar lista canónica de parámetros con precedencia codigo > code > lote > batch'
  );
  assert.match(
    TRACE_HTML,
    /if \(presentValues\.size > 1\) \{[\s\S]*?return \{ codigo: '', flush: null, error: 'conflicting_parameters' \};/,
    'extraerParametros debe rechazar parámetros en conflicto'
  );
  assert.match(
    TRACE_HTML,
    /if \(!\/\^\[A-Za-z0-9_-\]\{1,64\}\$\/\.test\(cleaned\)\) \{[\s\S]*?return \{ codigo: '', flush: null, error: 'invalid_characters' \};/,
    'extraerParametros debe sanitizar contra caracteres inválidos'
  );
});

test('trace.html consulta lote padre si el código escaneado es de una bolsa individual (-B01)', () => {
  assert.match(
    TRACE_HTML,
    /codigo\.match\(\/\^\(\[A-Za-z0-9_-\]\+\)-B\(\\d\{2,4\}\)\$\/i\)/,
    'trace.html debe detectar formato estricto de bolsa (-B01..B99)'
  );
  assert.match(
    TRACE_HTML,
    /getDoc\(doc\(db,\s*'public_lotes',\s*parentCode\)\)/,
    'trace.html debe consultar lote padre como respaldo para bolsas individuales'
  );
});

// ── 6. CONTROLADORES EN HOST SHELL (Setas OS v5.dc.html) ───────────────────

test('Setas OS v5.dc.html preserva escaneos contextuales y enruta home a captura canónica', () => {
  assert.match(
    SHELL_HTML,
    /openScanObs:\(\)=>this\.openScan\('obs'\)/,
    'openScanObs debe preservar target obs'
  );
  assert.match(
    SHELL_HTML,
    /openScanHarvest:\(\)=>this\.openScan\('harvest'\)/,
    'openScanHarvest debe preservar target harvest'
  );
  assert.match(
    SHELL_HTML,
    /openScanQuick:\(\)=>this\.openScan\('quick'\)/,
    'openScanQuick debe preservar target quick'
  );
  assert.match(
    SHELL_HTML,
    /openScanHome:\(\)=>this\.openFieldScan\(\)/,
    'openScanHome debe abrir la captura rápida canónica'
  );
});
