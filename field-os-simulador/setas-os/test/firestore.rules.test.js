// Pruebas de las reglas de Firestore para public_lotes (ficha pública de
// trazabilidad). Requiere el emulador de Firestore corriendo:
//
//   npm run test:rules
//   (equivalente a: firebase emulators:exec --only firestore "mocha test/firestore.rules.test.js")
//
// O en dos terminales:
//   firebase emulators:start --only firestore
//   npm run test:rules:only   # asume el emulador ya corriendo en :8080
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const { doc, setDoc, deleteDoc } = require('firebase/firestore');

const RULES_PATH = path.join(__dirname, '..', 'firebase', 'firestore.rules');
const PROJECT_ID = 'setas-os-rules-test';

const loteValido = {
  codigo: 'SDP-260904-SHI-R01',
  especie: 'Shiitake',
  especieCientifico: 'Lentinula edodes',
  fechaInoculacion: '2026-09-04',
  numBolsas: 12,
  estado: 'incubacion',
};

const cosechaValida = {
  fecha: '2026-09-20',
  pesoFresco: 850,
  calidad: 4,
  flush: 1,
};

describe('firestore.rules · public_lotes', function () {
  this.timeout(20000);
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: fs.readFileSync(RULES_PATH, 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  after(async () => {
    if (testEnv) await testEnv.cleanup();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  it('lectura pública: cualquiera (sin auth) puede leer un lote publicado', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'public_lotes/SDP-260904-SHI-R01'), loteValido);
    });
    const anon = testEnv.unauthenticatedContext();
    const { getDoc } = require('firebase/firestore');
    const snap = await assertSucceeds(
      getDoc(doc(anon.firestore(), 'public_lotes/SDP-260904-SHI-R01')),
    );
    assert.equal(snap.data().especie, 'Shiitake');
  });

  it('un usuario autenticado normal (sin claim, sin rol admin) NO puede escribir en public_lotes', async () => {
    const operador = testEnv.authenticatedContext('operador_1', {});
    await assertFails(
      setDoc(doc(operador.firestore(), 'public_lotes/SDP-260904-SHI-R01'), loteValido),
    );
  });

  it('una cuenta sin autenticar tampoco puede escribir en public_lotes', async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(
      setDoc(doc(anon.firestore(), 'public_lotes/SDP-260904-SHI-R01'), loteValido),
    );
  });

  it('el "sync service" (custom claim sync_service=true) SÍ puede escribir un documento válido', async () => {
    const syncSvc = testEnv.authenticatedContext('sync_bot', { sync_service: true });
    await assertSucceeds(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01'), loteValido),
    );
  });

  it('el "sync service" SÍ puede escribir una cosecha válida en la subcolección', async () => {
    const syncSvc = testEnv.authenticatedContext('sync_bot', { sync_service: true });
    await assertSucceeds(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01'), loteValido),
    );
    await assertSucceeds(
      setDoc(
        doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01/cosechas/COS_1'),
        cosechaValida,
      ),
    );
  });

  it('un usuario con rol admin (usuarios/{uid}.rol == "admin") también puede escribir', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'usuarios/admin_1'), { rol: 'admin' });
    });
    const admin = testEnv.authenticatedContext('admin_1', {});
    await assertSucceeds(
      setDoc(doc(admin.firestore(), 'public_lotes/SDP-260904-SHI-R01'), loteValido),
    );
  });

  it('rechaza un documento que incluya un campo prohibido (costo), incluso desde el sync service', async () => {
    const syncSvc = testEnv.authenticatedContext('sync_bot', { sync_service: true });
    await assertFails(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01'), {
        ...loteValido,
        costo: 12000,
      }),
    );
  });

  it('rechaza un documento con campo prohibido "recetaSnapshot"', async () => {
    const syncSvc = testEnv.authenticatedContext('sync_bot', { sync_service: true });
    await assertFails(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01'), {
        ...loteValido,
        recetaSnapshot: { ingredientes: [] },
      }),
    );
  });

  it('rechaza numBolsas fuera de rango o no entero', async () => {
    const syncSvc = testEnv.authenticatedContext('sync_bot', { sync_service: true });
    await assertFails(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01'), {
        ...loteValido,
        numBolsas: -1,
      }),
    );
    await assertFails(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01'), {
        ...loteValido,
        numBolsas: 3.5,
      }),
    );
  });

  it('rechaza calidad de cosecha fuera de 0..5', async () => {
    const syncSvc = testEnv.authenticatedContext('sync_bot', { sync_service: true });
    await assertSucceeds(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01'), loteValido),
    );
    await assertFails(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01/cosechas/COS_bad'), {
        ...cosechaValida,
        calidad: 99,
      }),
    );
  });

  it('el sync service puede borrar (delete) documentos públicos, un operador normal no', async () => {
    const syncSvc = testEnv.authenticatedContext('sync_bot', { sync_service: true });
    await assertSucceeds(
      setDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01'), loteValido),
    );
    const operador = testEnv.authenticatedContext('operador_1', {});
    await assertFails(
      deleteDoc(doc(operador.firestore(), 'public_lotes/SDP-260904-SHI-R01')),
    );
    await assertSucceeds(
      deleteDoc(doc(syncSvc.firestore(), 'public_lotes/SDP-260904-SHI-R01')),
    );
  });
});

describe('firestore.rules · eventos_cultivo', function () {
  this.timeout(20000);
  let testEnv;

  const eventoValido = (overrides = {}) => ({
    batchId: 'LOTE_1',
    bagId: null,
    tipo: 'riego',
    operatorId: 'operador_1',
    nota: '',
    at: '2026-09-11T09:00:00-05:00',
    source: 'qr_scan',
    ...overrides,
  });

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: fs.readFileSync(RULES_PATH, 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  after(async () => {
    if (testEnv) await testEnv.cleanup();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  it('un operador autenticado puede reportar un evento propio', async () => {
    const operador = testEnv.authenticatedContext('operador_1', {});
    await assertSucceeds(
      setDoc(doc(operador.firestore(), 'eventos_cultivo/EVC_1'), eventoValido()),
    );
  });

  it('una cuenta sin autenticar no puede reportar eventos', async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(
      setDoc(doc(anon.firestore(), 'eventos_cultivo/EVC_1'), eventoValido()),
    );
  });

  it('un operador no puede atribuir un evento a otro operador (operatorId debe ser el propio uid)', async () => {
    const operador = testEnv.authenticatedContext('operador_1', {});
    await assertFails(
      setDoc(doc(operador.firestore(), 'eventos_cultivo/EVC_1'), eventoValido({ operatorId: 'operador_2' })),
    );
  });

  it('rechaza un tipo de evento fuera del catálogo', async () => {
    const operador = testEnv.authenticatedContext('operador_1', {});
    await assertFails(
      setDoc(doc(operador.firestore(), 'eventos_cultivo/EVC_1'), eventoValido({ tipo: 'inventado' })),
    );
  });

  it('rechaza una nota más larga que el límite permitido', async () => {
    const operador = testEnv.authenticatedContext('operador_1', {});
    await assertFails(
      setDoc(doc(operador.firestore(), 'eventos_cultivo/EVC_1'), eventoValido({ nota: 'x'.repeat(2001) })),
    );
  });

  it('un evento reportado no se puede editar ni borrar, ni siquiera por su propio autor', async () => {
    const operador = testEnv.authenticatedContext('operador_1', {});
    await assertSucceeds(
      setDoc(doc(operador.firestore(), 'eventos_cultivo/EVC_1'), eventoValido()),
    );
    await assertFails(
      setDoc(doc(operador.firestore(), 'eventos_cultivo/EVC_1'), eventoValido({ nota: 'corregido' })),
    );
    await assertFails(
      deleteDoc(doc(operador.firestore(), 'eventos_cultivo/EVC_1')),
    );
  });

  it('un usuario autenticado puede leer los eventos de cultivo', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'eventos_cultivo/EVC_1'), eventoValido());
    });
    const otro = testEnv.authenticatedContext('operador_2', {});
    const { getDoc } = require('firebase/firestore');
    await assertSucceeds(getDoc(doc(otro.firestore(), 'eventos_cultivo/EVC_1')));
  });
});
