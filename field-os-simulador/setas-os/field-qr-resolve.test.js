'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { parseBatchRef, resolveBatch } = require('./field-qr-resolve.js');

const lookupFor = (batches) => async (id) => batches[id] || null;

test('acepta la URL de trazabilidad que ya emite el certificado', () => {
  assert.deepEqual(parseBatchRef('https://setasdelapena.com/trace/L-042'), { batchId: 'L-042' });
  assert.deepEqual(parseBatchRef('https://setasdelapena.com/trace/L-042/'), { batchId: 'L-042' });
});

test('acepta el esquema corto de etiqueta térmica', () => {
  assert.deepEqual(parseBatchRef('setas:lote:L-042'), { batchId: 'L-042' });
});

test('acepta la URL que imprime de verdad la etiqueta térmica', () => {
  // generateQrSvgDataUrl() codifica `<base>/public/trace.html?codigo=<codigo>`.
  // Sin este formato el lector canónico rechaza las etiquetas de la propia casa.
  const base = 'https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html';
  assert.deepEqual(parseBatchRef(`${base}?codigo=L-042`), { batchId: 'L-042' });
  assert.deepEqual(parseBatchRef(`${base}?codigo=L-042&flush=2`), { batchId: 'L-042' });
  // Sigue siendo una lista blanca: el mismo formato en otro dominio no vale.
  assert.throws(() => parseBatchRef('https://otrositio.com/public/trace.html?codigo=L-042'), /invalid_qr_payload/);
});

test('ambos formatos apuntan al mismo lote', () => {
  assert.equal(
    parseBatchRef('https://setasdelapena.com/trace/L-042').batchId,
    parseBatchRef('setas:lote:L-042').batchId
  );
});

test('rechaza un QR que no es una etiqueta de lote', () => {
  for (const bad of ['garbage', '', 'https://otrositio.com/trace/L-1', 'setas:receta:R-1', null]) {
    assert.throws(() => parseBatchRef(bad), /invalid_qr_payload/, `debería rechazar: ${bad}`);
  }
});

test('un lote inexistente se reporta como tal', async () => {
  await assert.rejects(
    () => resolveBatch('setas:lote:L-999', lookupFor({}), 'operario'),
    /batch_not_found/
  );
});

test('escanear no escribe nada', async () => {
  // La garantía es estructural, no de comportamiento: el módulo no recibe la
  // base ni la alcanza, así que no existe camino por el que escanear escriba.
  const src = require('node:fs').readFileSync('field-qr-resolve.js', 'utf8');
  assert.ok(!/indexedDB|\.transaction\(|objectStore/.test(src),
    'el módulo no debe tocar IndexedDB');
  assert.ok(!/require\('\.\/field-event-queue/.test(src),
    'el módulo no debe importar la cola');

  // Y el lookup inyectado es la única fuente de datos: se le llama una vez.
  const calls = [];
  const r = await resolveBatch(
    'setas:lote:L-1',
    async (id) => { calls.push(id); return { lifecycleState: 'incubation' }; },
    'operario'
  );
  assert.deepEqual(calls, ['L-1']);
  assert.ok(r.allowedTransitions.length > 0);
});

test('un operario no ve el descarte entre las transiciones ofrecidas', async () => {
  const batches = { 'L-1': { lifecycleState: 'quarantine' } };

  const asOperario = await resolveBatch('setas:lote:L-1', lookupFor(batches), 'operario');
  assert.ok(!asOperario.allowedTransitions.includes('discarded'));

  const asDireccion = await resolveBatch('setas:lote:L-1', lookupFor(batches), 'direccion');
  assert.ok(asDireccion.allowedTransitions.includes('discarded'));
});

test('un operario tampoco ve las transiciones de excepción', async () => {
  const batches = { 'L-1': { lifecycleState: 'incubation' } };

  const asOperario = await resolveBatch('setas:lote:L-1', lookupFor(batches), 'operario');
  assert.ok(!asOperario.allowedTransitions.includes('quarantine'));
  assert.ok(asOperario.allowedTransitions.includes('maturation'), 'sí debe ver los avances');

  const asProduccion = await resolveBatch('setas:lote:L-1', lookupFor(batches), 'produccion');
  assert.ok(asProduccion.allowedTransitions.includes('quarantine'));
});

test('el flujo principal ofrece incubation desde inoculated', async () => {
  const r = await resolveBatch('setas:lote:L-1', lookupFor({ 'L-1': { lifecycleState: 'inoculated' } }), 'operario');
  assert.deepEqual(r.allowedTransitions, ['incubation']);
});

test('un lote en estado terminal no ofrece transiciones, y no es un error', async () => {
  const r = await resolveBatch('setas:lote:L-1', lookupFor({ 'L-1': { lifecycleState: 'closed' } }), 'direccion');
  assert.deepEqual(r.allowedTransitions, []);
});

test('un lote heredado sin lifecycleState arranca en el estado inicial, como el servidor', async () => {
  // Antes devolvía null y no ofrecía nada, dejando la hoja vacía para todos los
  // lotes existentes. Ahora resuelve igual que accept-field-event.js.
  const { normalizeLifecycleState } = require('./batch-sheet.js');
  const r = await resolveBatch('setas:lote:L-1', lookupFor({ 'L-1': { estado: 'activo' } }), 'operario');
  assert.equal(r.state, normalizeLifecycleState('activo', 'inoculated'),
    'misma regla que el servidor, o la confirmación fallará');
  assert.ok(r.allowedTransitions.length > 0);
});

test('un campo `state` en el lote no manda: las reglas no lo protegen', async () => {
  // Si `state` ganara, un cliente podría escribirlo y saltarse etapas, porque
  // las reglas desplegadas sólo protegen lifecycleState y revision.
  const r = await resolveBatch('setas:lote:L-1', lookupFor({ 'L-1': { state: 'fruiting' } }), 'direccion');
  assert.equal(r.state, 'inoculated', 'un `state` del cliente no debe mandar');
  assert.ok(!r.allowedTransitions.includes('resting'), 'no debe ofrecer transiciones de fruiting');
});

test('un rol desconocido se rechaza', async () => {
  await assert.rejects(
    () => resolveBatch('setas:lote:L-1', lookupFor({ 'L-1': { lifecycleState: 'incubation' } }), 'banana'),
    /unknown_role/
  );
});
