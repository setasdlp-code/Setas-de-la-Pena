'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  extractValidInvoiceJson,
  buildInvoicePrompt,
  initSetasAI,
} = require('./firebase/ai-logic.js');

test('extractValidInvoiceJson parses direct JSON cleanly', () => {
  const input = JSON.stringify({
    proveedor: 'Molino San Cayetano',
    fecha: '2026-08-24',
    items: [
      { ingrediente: 'Salvado de trigo', kg: 120, precio: 1200 },
      { ingrediente: 'Yeso agrícola', kg: 50, precio: 800 }
    ]
  });

  const parsed = extractValidInvoiceJson(input);
  assert.equal(parsed.proveedor, 'Molino San Cayetano');
  assert.equal(parsed.fecha, '2026-08-24');
  assert.equal(parsed.items.length, 2);
  assert.equal(parsed.items[0].kg, 120);
});

test('extractValidInvoiceJson extracts JSON surrounded by markdown or conversational text', () => {
  const rawResponse = `
    Hola, he analizado la factura adjunta. Aquí está el resultado en JSON:
    \`\`\`json
    {
      "proveedor": "Distribuidora Agrícola de la Sabana",
      "fecha": "2026-08-20",
      "items": [
        { "ingrediente": "Afrecho de cebada", "kg": 200, "precio": 950 }
      ]
    }
    \`\`\`
    Espero que te sea útil.
  `;

  const parsed = extractValidInvoiceJson(rawResponse);
  assert.equal(parsed.proveedor, 'Distribuidora Agrícola de la Sabana');
  assert.equal(parsed.items[0].ingrediente, 'Afrecho de cebada');
  assert.equal(parsed.items[0].kg, 200);
});

test('extractValidInvoiceJson throws on invalid or empty text', () => {
  assert.throws(() => extractValidInvoiceJson(''), /Respuesta vacía o inválida/);
  assert.throws(() => extractValidInvoiceJson('Esto no contiene JSON'), /No se encontró una estructura JSON válida/);
});

test('buildInvoicePrompt includes known ingredients list and schema rules', () => {
  const ingredients = [
    { id: 'paja_trigo', name: 'Paja de trigo' },
    { id: 'salvado_trigo', name: 'Salvado de trigo' }
  ];

  const prompt = buildInvoicePrompt(ingredients, 'Compra realizada en Corabastos');
  assert.match(prompt, /Paja de trigo, Salvado de trigo/);
  assert.match(prompt, /Compra realizada en Corabastos/);
  assert.match(prompt, /"proveedor":/);
  assert.match(prompt, /"items":/);
});

test('initSetasAI sets up the client interface and exposes methods', async () => {
  const setasAI = initSetasAI(null);
  assert.equal(typeof setasAI.isAvailable, 'function');
  assert.equal(setasAI.isAvailable(), true);
  assert.equal(typeof setasAI.parseInvoiceImage, 'function');
  assert.equal(typeof setasAI.parseInvoiceText, 'function');
});
