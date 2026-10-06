'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('./sync-merge.js');

test('stableStringify ignora el orden de claves que Firestore no conserva', () => {
  assert.equal(M.stableStringify({ b: 1, a: { d: 2, c: [3, { f: 1, e: 0 }] } }),
    M.stableStringify({ a: { c: [3, { e: 0, f: 1 }], d: 2 }, b: 1 }));
  assert.ok(!M.sameValue([1, 2], [2, 1]), 'el orden de un array sí importa');
});

test('mergeDoc: cambio solo local se conserva, cambio solo remoto se adopta', () => {
  const base = { id: 'L1', estado: 'activo', sala: 'A' };
  const { doc, conflicts } = M.mergeDoc({
    local: { ...base, estado: 'incubacion' },
    base,
    remote: { ...base, sala: 'B' },
  });
  assert.deepEqual(doc, { id: 'L1', estado: 'incubacion', sala: 'B' });
  assert.deepEqual(conflicts, []);
});

test('mergeDoc: mismo campo cambiado en ambos lados gana local y se reporta', () => {
  const base = { id: 'L1', estado: 'activo' };
  const { doc, conflicts } = M.mergeDoc({ local: { id: 'L1', estado: 'a' }, base, remote: { id: 'L1', estado: 'b' } });
  assert.equal(doc.estado, 'a');
  assert.deepEqual(conflicts, ['estado']);
});

test('mergeDoc: un resolvedor decide el conflicto', () => {
  const base = { id: 'L1', ev: [{ id: 1, at: '1' }] };
  const { doc } = M.mergeDoc({
    local: { id: 'L1', ev: [{ id: 1, at: '1' }, { id: 2, at: '2' }] },
    base,
    remote: { id: 'L1', ev: [{ id: 1, at: '1' }, { id: 3, at: '3' }] },
    resolvers: { ev: M.unionList },
  });
  assert.deepEqual(doc.ev.map(e => e.id), [1, 2, 3]);
});

test('mergeDoc sin base: gana el servidor y se conservan los campos solo locales', () => {
  const { doc } = M.mergeDoc({
    local: { id: 'L1', estado: 'viejo', notaLocal: 'x' },
    base: undefined,
    remote: { id: 'L1', estado: 'nuevo' },
  });
  assert.deepEqual(doc, { id: 'L1', estado: 'nuevo', notaLocal: 'x' });
});

test('mergeDoc: los campos ignorados conservan la copia local', () => {
  const { doc } = M.mergeDoc({
    local: { id: 'B1', foto: 'data:…', estado: 'ok' },
    base: { id: 'B1', estado: 'ok' },
    remote: { id: 'B1', estado: 'contaminada' },
    ignore: ['foto'],
  });
  assert.deepEqual(doc, { id: 'B1', foto: 'data:…', estado: 'contaminada' });
});

test('mergeCollection: documento solo local se crea en el servidor', () => {
  const r = M.mergeCollection({ local: [{ id: 'a', x: 1 }], base: [], remote: [] });
  assert.deepEqual(r.pushes, [{ op: 'create', id: 'a', doc: { id: 'a', x: 1 } }]);
  assert.deepEqual(r.local, [{ id: 'a', x: 1 }]);
  assert.equal(r.changed, false);
});

test('mergeCollection: no repite un create que ya está en cola', () => {
  const r = M.mergeCollection({ local: [{ id: 'a', x: 1 }], remote: [], pendingIds: ['a'] });
  assert.deepEqual(r.pushes, []);
});

test('mergeCollection: documento nuevo en el servidor llega al dispositivo', () => {
  const r = M.mergeCollection({ local: [], base: [], remote: [{ id: 'a', x: 1, syncedAt: { seconds: 1 } }] });
  assert.deepEqual(r.local, [{ id: 'a', x: 1 }]);
  assert.deepEqual(r.base, [{ id: 'a', x: 1 }]);
  assert.deepEqual(r.pushes, []);
  assert.equal(r.changed, true);
});

test('mergeCollection: un cambio local sin encolar se envía como update', () => {
  const r = M.mergeCollection({
    local: [{ id: 'a', x: 2, y: 1 }],
    base: [{ id: 'a', x: 1, y: 1 }],
    remote: [{ id: 'a', x: 1, y: 5 }],
  });
  assert.deepEqual(r.local, [{ id: 'a', x: 2, y: 5 }]);
  assert.deepEqual(r.pushes, [{ op: 'update', id: 'a', fields: { x: 2 } }]);
});

test('mergeCollection: lápida remota borra la copia local aunque haya cambios', () => {
  const r = M.mergeCollection({
    local: [{ id: 'a', x: 9 }, { id: 'b' }],
    base: [{ id: 'a', x: 1 }],
    remote: [{ id: 'a', deleted: true }, { id: 'b' }],
  });
  assert.deepEqual(r.local, [{ id: 'b' }]);
  assert.deepEqual(r.removed, ['a']);
  assert.ok(!r.base.some(d => d.id === 'a'));
});

test('mergeCollection: borrado local sin cambios remotos se propaga', () => {
  const r = M.mergeCollection({ local: [], base: [{ id: 'a', x: 1 }], remote: [{ id: 'a', x: 1 }] });
  assert.deepEqual(r.pushes, [{ op: 'delete', id: 'a' }]);
  assert.deepEqual(r.local, []);
});

test('mergeCollection: borrado local de algo que otro dispositivo cambió se revierte', () => {
  const r = M.mergeCollection({ local: [], base: [{ id: 'a', x: 1 }], remote: [{ id: 'a', x: 2 }] });
  assert.deepEqual(r.local, [{ id: 'a', x: 2 }]);
  assert.deepEqual(r.pushes, []);
});

test('mergeCollection: lectura de caché nunca infiere borrados', () => {
  const r = M.mergeCollection({ local: [{ id: 'a', x: 1 }], base: [{ id: 'a', x: 1 }], remote: [], fromCache: true });
  assert.deepEqual(r.local, [{ id: 'a', x: 1 }]);
  assert.deepEqual(r.base, [{ id: 'a', x: 1 }]);
  assert.deepEqual(r.pushes, []);
});

test('mergeCollection: desaparecido en el servidor y sin cambios aquí se borra', () => {
  const r = M.mergeCollection({ local: [{ id: 'a', x: 1 }], base: [{ id: 'a', x: 1 }], remote: [] });
  assert.deepEqual(r.local, []);
  assert.deepEqual(r.removed, ['a']);
});

test('mergeCollection: desaparecido en el servidor pero cambiado aquí se recrea', () => {
  const r = M.mergeCollection({ local: [{ id: 'a', x: 2 }], base: [{ id: 'a', x: 1 }], remote: [] });
  assert.deepEqual(r.pushes, [{ op: 'create', id: 'a', doc: { id: 'a', x: 2 } }]);
});

test('mergeCollection: resultado estable — segunda pasada no genera nada', () => {
  const first = M.mergeCollection({
    local: [{ id: 'a', x: 2 }],
    base: [{ id: 'a', x: 1 }],
    remote: [{ id: 'a', x: 1, z: 3 }, { id: 'b', y: 1 }],
  });
  // El servidor aplica el update y devuelve el eco.
  const echo = [{ id: 'a', x: 2, z: 3 }, { id: 'b', y: 1 }];
  const second = M.mergeCollection({ local: first.local, base: first.base, remote: echo });
  assert.deepEqual(second.pushes, []);
  assert.equal(second.changed, false);
  assert.deepEqual(second.base, echo);
});

test('byRank conserva el estado más avanzado', () => {
  const pick = M.byRank({ held: 0, expired: 1, released: 2, consumed: 3 });
  assert.equal(pick('held', 'consumed'), 'consumed');
  assert.equal(pick('consumed', 'expired'), 'consumed');
});

test('mergeCollection: filas locales sin id se conservan en su lugar', () => {
  const r = M.mergeCollection({ local: [{ x: 'legado' }, { id: 'a', x: 1 }], base: [{ id: 'a', x: 1 }], remote: [{ id: 'a', x: 1 }] });
  assert.deepEqual(r.local, [{ x: 'legado' }, { id: 'a', x: 1 }]);
  assert.equal(r.changed, false);
});

test('mergeCollection: un id numérico local no se convierte en texto', () => {
  const r = M.mergeCollection({ local: [{ id: 7, n: 'p' }], base: [{ id: 7, n: 'p' }], remote: [{ id: 7, n: 'q' }] });
  assert.deepEqual(r.local, [{ id: 7, n: 'q' }]);
});
