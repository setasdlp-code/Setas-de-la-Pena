'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const thermal = require('./thermal-label.js');

test('el módulo también se publica como global para el navegador', () => {
  assert.equal(globalThis.SetasThermalLabel.THERMAL_LABEL_SPECS, thermal.THERMAL_LABEL_SPECS);
});

test('las tres medidas de etiqueta declaran ancho, alto y QR en milímetros', () => {
  assert.deepEqual(Object.keys(thermal.THERMAL_LABEL_SPECS), ['40x30', '50x30', '50x70']);
  Object.entries(thermal.THERMAL_LABEL_SPECS).forEach(([key, spec]) => {
    assert.ok(Number.isFinite(spec.qrMm) && spec.qrMm > 0, `${key}: qrMm`);
  });
  assert.equal(thermal.THERMAL_LABEL_SPECS['40x30'].qrMm, 23.5);
  assert.equal(thermal.THERMAL_LABEL_SPECS['50x30'].qrMm, 26);
  assert.equal(thermal.THERMAL_LABEL_SPECS['50x70'].qrMm, 34);
  assert.equal(thermal.THERMAL_LABEL_SPECS['50x70'].layout, 'vertical');
});

test('la conversión de px CSS a canvas respeta la resolución de 12 px/mm', () => {
  assert.equal(thermal.THERMAL_PX_PER_MM, 12);
  const oneMmInCssPx = 96 / 25.4;
  assert.ok(Math.abs(thermal.cssPxToCanvas(oneMmInCssPx) - 12) < 1e-9);
});

test('sin la librería QR cargada, generateQrSvgDataUrl no lanza', () => {
  const saved = globalThis.QRMini;
  delete globalThis.QRMini;
  try {
    assert.doesNotThrow(() => thermal.generateQrSvgDataUrl('https://example.test/x'));
  } finally {
    if (saved) globalThis.QRMini = saved;
  }
});

test('con la librería QR, el resultado es un data URL SVG', () => {
  const saved = globalThis.QRMini;
  globalThis.QRMini = require('./qr-mini.js');
  try {
    const url = thermal.generateQrSvgDataUrl('https://example.test/x');
    assert.match(url, /^data:image\/svg\+xml/);
  } finally {
    if (saved) globalThis.QRMini = saved; else delete globalThis.QRMini;
  }
});

test('wrapCanvasText parte el texto según el ancho medido y no pierde palabras', () => {
  const ctx = { measureText: (s) => ({ width: s.length * 10 }) };
  const text = 'Orellana rosada de cultivo artesanal';
  const lines = thermal.wrapCanvasText(ctx, text, 120);
  assert.ok(lines.length > 1);
  assert.equal(lines.join(' ').replace(/\s+/g, ' '), text);
});

test('todo nombre del módulo que usa simulador-app.jsx está en el puente', () => {
  // Una extracción que olvida un nombre no falla en Node: falla en el navegador
  // con ReferenceError al renderizar. Este test lo detecta antes.
  const fs = require('node:fs');
  const path = require('node:path');
  const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');
  const bridge = jsx.split('\n').find((l) => l.endsWith('=SetasThermalLabelApi;'));
  assert.ok(bridge, 'no se encontró el puente a thermal-label.js');
  const imported = new Set(bridge.slice(bridge.indexOf('{') + 1, bridge.indexOf('}')).split(','));
  const rest = jsx.replace(bridge, '');
  // Se parte de las declaraciones del fuente, no de lo exportado: un nombre que
  // falta en `api` es justo el caso que hay que detectar.
  const src = fs.readFileSync(path.join(__dirname, 'thermal-label.js'), 'utf8');
  const declared = [...src.matchAll(/^(?:const|let|var|class|(?:async\s+)?function\*?)\s+([A-Za-z_$][\w$]*)/gm)]
    .map((m) => m[1]).filter((n) => n !== 'api');
  assert.ok(declared.includes('loadThermalWordmark'));
  declared.forEach((name) => {
    if (new RegExp(`\\b${name}\\b`).test(rest)) assert.ok(imported.has(name), `${name} se usa en el JSX sin importarse`);
  });
  imported.forEach((name) => assert.ok(name in thermal, `${name} no lo exporta thermal-label.js`));
});
