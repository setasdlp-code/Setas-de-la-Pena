import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIM_APP_JSX = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
const SIM_CSS = fs.readFileSync(path.join(__dirname, 'sim.css'), 'utf8');
const TRACE_HTML = fs.readFileSync(path.join(__dirname, 'public/trace.html'), 'utf8');

test('simulador-app.jsx prioriza jsQR en WebKit/iOS evitando la trampa de BarcodeDetector experimental', () => {
  assert.match(
    SIM_APP_JSX,
    /isWebKit = \/iPad\|iPhone\|iPod\/\.test\(navigator\.userAgent\)/,
    'detectQrSupport debe identificar explícitamente dispositivos iOS/iPadOS'
  );
  assert.match(
    SIM_APP_JSX,
    /navigator\.platform === 'MacIntel' && navigator\.maxTouchPoints > 1/,
    'detectQrSupport debe identificar iPadOS en Desktop Mode (MacIntel + multi-touch)'
  );
  assert.match(
    SIM_APP_JSX,
    /if \(isWebKit\) return false;/,
    'En WebKit/iOS debe devolver false para priorizar jsQR garantizado'
  );
});

test('attachCameraStream fija atributos DOM playsinline y webkit-playsinline para Safari iOS', () => {
  assert.match(
    SIM_APP_JSX,
    /v\.setAttribute\('playsinline',\s*'true'\);/,
    'Debe establecer atributo DOM playsinline en el video'
  );
  assert.match(
    SIM_APP_JSX,
    /v\.setAttribute\('webkit-playsinline',\s*'true'\);/,
    'Debe establecer atributo DOM webkit-playsinline para versiones previas de Safari'
  );
});

test('startCameraScanner implementa cadena escalonada de constraints para tolerar iPadOS', () => {
  assert.match(
    SIM_APP_JSX,
    /const constraintsTiers = \[/,
    'Debe definir niveles escalonados de constraints de cámara'
  );
  assert.match(
    SIM_APP_JSX,
    /facingMode: \{ ideal: 'environment' \},\s*width: \{ ideal: 1920 \}/,
    'Tier 1: 1080p con cámara trasera ideal'
  );
  assert.match(
    SIM_APP_JSX,
    /\{ video: true \}/,
    'Tier final: fallback infalible a cualquier video disponible para evitar OverconstrainedError'
  );
});

test('startCameraScanner desbloquea proactivamente AudioContext para sonido en iOS', () => {
  assert.match(
    SIM_APP_JSX,
    /window\.__setasAudioCtx\.state === 'suspended'/,
    'Debe detectar estado suspendido de AudioContext'
  );
  assert.match(
    SIM_APP_JSX,
    /window\.__setasAudioCtx\.resume\(\)/,
    'Debe reanudar AudioContext dentro del gesto de usuario'
  );
});

test('el detector de cámara cuenta con fallback dinámico a jsQR ante errores continuos', () => {
  assert.match(
    SIM_APP_JSX,
    /if \(nativeFailures >= 3\) \{[\s\S]*?const fallbackJsQR = await loadJsQR\(\);[\s\S]*?startJsQRLoop\(fallbackJsQR\);/,
    'Debe cambiar dinámicamente a jsQR si el detector nativo falla 3 veces consecutivas'
  );
});

test('etiquetas térmicas DS-2026 maximizan tamaño de QR a 23.5mm y 26mm con jerarquía visual de alto contraste', () => {
  assert.match(
    SIM_APP_JSX,
    /'40x30':\s*\{[^}]*?qrMm:\s*23\.5/,
    'THERMAL_LABEL_SPECS para 40x30 debe especificar qrMm: 23.5'
  );
  assert.match(
    SIM_APP_JSX,
    /'50x30':\s*\{[^}]*?qrMm:\s*26/,
    'THERMAL_LABEL_SPECS para 50x30 debe especificar qrMm: 26'
  );
  assert.match(
    SIM_CSS,
    /\.sim-root \.thermal-card-40x30 \.thermal-qr-img\s*\{[^}]*?width:\s*23\.5mm;[^}]*?height:\s*23\.5mm;/s,
    'sim.css debe dimensionar .thermal-card-40x30 .thermal-qr-img a 23.5mm x 23.5mm'
  );
  assert.match(
    SIM_CSS,
    /\.sim-root \.thermal-card-50x30 \.thermal-qr-img\s*\{[^}]*?width:\s*26mm;[^}]*?height:\s*26mm;/s,
    'sim.css debe dimensionar .thermal-card-50x30 .thermal-qr-img a 26mm x 26mm'
  );
  assert.match(
    SIM_CSS,
    /\.sim-root \.thermal-divider\s*\{/,
    'sim.css debe definir el separador suizo .thermal-divider'
  );
  assert.match(
    SIM_CSS,
    /\.sim-root \.thermal-badge\s*\{/,
    'sim.css debe definir el badge invertido .thermal-badge'
  );
  assert.match(
    SIM_CSS,
    /\.sim-root \.thermal-species\s*\{/,
    'sim.css debe definir .thermal-species con serif Gaya Patched'
  );
});

test('trace.html extrae parámetros de canastillas (?crate= y ?canastilla=) y preserva el código CAN-', () => {
  assert.match(
    TRACE_HTML,
    /const CRATE_CODE_PARAMS = \['crate',\s*'canastilla'\];/,
    'trace.html debe reconocer parámetros crate y canastilla'
  );
  assert.match(
    TRACE_HTML,
    /clean = val\.replace\(\/\^\(\?:setas:\(\?:lote\|bag\|bolsa\|crate\):\|SDP-CERT-\)\/i,\s*''\)/,
    'No debe recortar el prefijo CAN- de los códigos de canastillas'
  );
  assert.match(
    TRACE_HTML,
    /function renderCrate\(crateCode\) \{/,
    'trace.html debe implementar vista dedicada para canastillas'
  );
  assert.match(
    TRACE_HTML,
    /if \(isCrate \|\| \/\^CAN-\\d\+\/i\.test\(codigo\)\) \{\s*renderCrate\(codigo\);/s,
    'trace.html debe renderizar la canastilla de inmediato sin error de lote no encontrado'
  );
});
