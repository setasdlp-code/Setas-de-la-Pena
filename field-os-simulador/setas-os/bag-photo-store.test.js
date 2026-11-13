'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { IDBFactory } = require('fake-indexeddb');
const photos = require('./bag-photo-store.js');

const A = 'data:image/jpeg;base64,AAAA';
const B = 'data:image/jpeg;base64,BBBB';

test('splitInlinePhotos separa la foto en línea y deja la bolsa sin el campo', () => {
  const bolsas = [{ id: 'b1', codigo: 'X-B01', foto: A }, { id: 'b2', foto: null }, { id: 'b3' }];
  const { stripped, inline } = photos.splitInlinePhotos(bolsas);
  assert.deepEqual(inline, { b1: A });
  assert.deepEqual(stripped, [{ id: 'b1', codigo: 'X-B01' }, { id: 'b2', foto: null }, { id: 'b3' }]);
  assert.equal(bolsas[0].foto, A, 'no muta la entrada');
  assert.deepEqual(photos.splitInlinePhotos(null), { stripped: [], inline: {} });
});

test('withPhotos reinyecta las fotos para un respaldo sin tocar bolsas sin foto', () => {
  const out = photos.withPhotos([{ id: 'b1' }, { id: 'b2' }], { b1: A, zz: B });
  assert.deepEqual(out, [{ id: 'b1', foto: A }, { id: 'b2' }]);
});

test('el almacén guarda, lee, lista y borra fotos por bolsa', async () => {
  const store = photos.createStore({ indexedDB: new IDBFactory() });
  assert.equal(store.available, true);
  await store.putMany({ b1: A, b2: B });
  assert.equal(await store.get('b1'), A);
  assert.equal(await store.get('nope'), null);
  assert.deepEqual(await store.getAll(), { b1: A, b2: B });
  await store.removeMany(['b1']);
  assert.deepEqual(await store.getAll(), { b2: B });
  await store.clear();
  assert.deepEqual(await store.getAll(), {});
});

test('las fotos persisten entre aperturas de la misma base', async () => {
  const idb = new IDBFactory();
  await photos.createStore({ indexedDB: idb }).putMany({ b1: A });
  assert.deepEqual(await photos.createStore({ indexedDB: idb }).getAll(), { b1: A });
});

test('sin IndexedDB el almacén se declara no disponible y rechaza escribir', async () => {
  const store = photos.createStore({ indexedDB: null });
  assert.equal(store.available, false);
  assert.deepEqual(await store.getAll(), {});
  await assert.rejects(() => store.putMany({ b1: A }), /bag_photo_store_unavailable/);
});

test('putMany rechaza valores que no son data URL de imagen', async () => {
  const store = photos.createStore({ indexedDB: new IDBFactory() });
  await assert.rejects(() => store.putMany({ b1: 'hola' }), /bag_photo_invalid/);
  assert.deepEqual(await store.getAll(), {});
});
