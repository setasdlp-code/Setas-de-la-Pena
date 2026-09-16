'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const traceIdentity = require('./trace-identity.js');
const publicTraceDto = require('./public-trace-dto.js');
const navigationState = require('./navigation-state.js');

const TRACE_HTML_PATH = path.join(__dirname, 'public', 'trace.html');
const SIMULADOR_APP_PATH = path.join(__dirname, 'simulador-app.jsx');
const PUBLIC_SYNC_PATH = path.join(__dirname, 'firebase', 'public-trace-sync.js');

// ────────────────────────────────────────────────────────────────────────────
// 1. RESOLUCIÓN DE IDENTIDAD QR (LOTE, BOLSA, FLUSH, CANASTILLA)
// ────────────────────────────────────────────────────────────────────────────

test('Identidad QR: Lote maestro se resuelve idénticamente desde texto crudo, URL pública y URL de Setas OS', () => {
  const rawCode = 'SDP-260904-SHI-R01';
  const publicUrl = `https://setasdlp-code.github.io/Setas-de-la-Pena/public/trace.html?codigo=${rawCode}`;
  const osUrl = `https://setasdlp-code.github.io/Setas-de-la-Pena/Setas%20OS%20v5.dc.html?view=bitacora&lote=${rawCode}`;

  const resRaw = traceIdentity.resolveTraceIdentity(rawCode);
  const resPublic = traceIdentity.resolveTraceIdentity(publicUrl);
  const resOs = traceIdentity.resolveTraceIdentity(osUrl);

  for (const res of [resRaw, resPublic, resOs]) {
    assert.equal(res.valid, true);
    assert.equal(res.kind, 'batch');
    assert.equal(res.batchCode, rawCode);
    assert.equal(res.bagCode, null);
    assert.equal(res.bagNumber, null);
    assert.equal(res.flush, null);
    assert.equal(res.crateCode, null);
  }
});

test('Identidad QR: Bolsa individual extrae lote padre, código completo y número de bolsa con normalización B1 -> B01', () => {
  const bagWithPad = 'SDP-260904-SHI-R01-B02';
  const res1 = traceIdentity.resolveTraceIdentity(bagWithPad);
  assert.equal(res1.valid, true);
  assert.equal(res1.kind, 'bag');
  assert.equal(res1.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(res1.bagCode, 'SDP-260904-SHI-R01-B02');
  assert.equal(res1.bagNumber, 2);

  // URL con parámetros separados ?lote=...&bolsa=B2
  const urlSeparated = 'https://setas.local/trace.html?lote=SDP-260904-SHI-R01&bolsa=B2';
  const res2 = traceIdentity.resolveTraceIdentity(urlSeparated);
  assert.equal(res2.valid, true);
  assert.equal(res2.kind, 'bag');
  assert.equal(res2.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(res2.bagCode, 'SDP-260904-SHI-R01-B02');
  assert.equal(res2.bagNumber, 2);
});

test('Identidad QR: Flush u oleada extrae entero positivo y asocia el lote padre', () => {
  const flushUrl = 'https://setas.local/trace.html?codigo=SDP-260904-SHI-R01&flush=3';
  const res = traceIdentity.resolveTraceIdentity(flushUrl);
  assert.equal(res.valid, true);
  assert.equal(res.kind, 'flush');
  assert.equal(res.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(res.flush, 3);
});

test('Identidad QR: Canastilla física (CAN-01) y deep-link ?crate=CAN-01 tienen precedencia determinista', () => {
  const crateCode = 'CAN-01';
  const crateUrl = 'https://setas.local/trace.html?crate=CAN-01';

  const res1 = traceIdentity.resolveTraceIdentity(crateCode);
  const res2 = traceIdentity.resolveTraceIdentity(crateUrl);

  for (const res of [res1, res2]) {
    assert.equal(res.valid, true);
    assert.equal(res.kind, 'crate');
    assert.equal(res.crateCode, 'CAN-01');
    assert.equal(res.batchCode, null);
    assert.equal(res.bagCode, null);
  }
});

test('Identidad QR: Parámetros contradictorios (ej: crate vs batch incompatible) se rechazan con ambiguous-target', () => {
  const conflictedUrl = 'https://setas.local/trace.html?crate=CAN-01&lote=SDP-260904-SHI-R01';
  const res = traceIdentity.resolveTraceIdentity(conflictedUrl);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'ambiguous-target');
});

// ────────────────────────────────────────────────────────────────────────────
// 2. PRIVACIDAD POR DISEÑO: DTO PÚBLICO V2 Y ALLOWLIST POSITIVA
// ────────────────────────────────────────────────────────────────────────────

test('Privacidad: El DTO público no expone costos, proveedores, operarios ni notas privadas', () => {
  const privateLot = {
    id: 'BIT_123',
    codigo: 'SDP-260904-SHI-R01',
    especie: 'Shiitake',
    especieCientifico: 'Lentinula edodes',
    fechaInoculacion: '2026-09-04',
    numBolsas: 24,
    estado: 'fructificacion',
    // Campos estrictamente privados
    costoTotalCOP: 185000,
    costoPorBolsa: 7708,
    costoKg: 12500,
    precioVentaKg: 28000,
    operadorEmail: 'operador@setasdelapena.com',
    operadorNombre: 'Carlos Gómez',
    proveedorSemilla: 'BioFungus Lab S.A.S.',
    proveedorSustrato: 'Aserrío Tenjo Central',
    precioCompraInsumos: 94000,
    notas: 'Ajustar esterilización a 122°C porque hubo condensación interna',
    recetaPrivada: [{ id: 'roble', pct: 80 }, { id: 'salvado', pct: 20, secretRatio: 1.2 }]
  };

  const privateEvents = [
    {
      id: 'EV_1',
      type: 'watering',
      title: 'Riego con microaspersión',
      at: '2026-09-10T14:30:00.000Z',
      stage: 'fructificacion',
      scope: 'batch',
      bagId: null,
      meta: {
        temperatura: 18.5,
        humedad: 88,
        co2: 750,
        observacionPublica: 'Excelente brotación de primordios',
        // Claves prohibidas que deben ser ignoradas
        costoAguaCOP: 1500,
        operadorTurno: 'operador@setasdelapena.com',
        fallaElectrica: false,
        claveSecreta: 'internal-data'
      }
    }
  ];

  const publicDoc = publicTraceDto.buildPublicTraceDocument(privateLot, [], [], privateEvents);

  assert.equal(publicDoc.schemaVersion, 2);
  assert.equal(publicDoc.codigo, 'SDP-260904-SHI-R01');
  assert.equal(publicDoc.especie, 'Shiitake');

  // Verificar que NINGUNO de los campos privados exista en la raíz
  assert.equal(publicDoc.costoTotalCOP, undefined);
  assert.equal(publicDoc.costoPorBolsa, undefined);
  assert.equal(publicDoc.costoKg, undefined);
  assert.equal(publicDoc.precioVentaKg, undefined);
  assert.equal(publicDoc.operadorEmail, undefined);
  assert.equal(publicDoc.operadorNombre, undefined);
  assert.equal(publicDoc.proveedorSemilla, undefined);
  assert.equal(publicDoc.proveedorSustrato, undefined);
  assert.equal(publicDoc.precioCompraInsumos, undefined);
  assert.equal(publicDoc.notas, undefined);
  assert.equal(publicDoc.recetaPrivada, undefined);

  // Verificar el evento saneado
  assert.equal(publicDoc.lifecycleEvents.length, 1);
  const ev = publicDoc.lifecycleEvents[0];
  assert.equal(ev.type, 'watering');
  assert.equal(ev.meta.temperatura, 18.5);
  assert.equal(ev.meta.humedad, 88);
  assert.equal(ev.meta.co2, 750);
  assert.equal(ev.meta.observacionPublica, 'Excelente brotación de primordios');

  // Metadatos privados descartados en el evento
  assert.equal(ev.meta.costoAguaCOP, undefined);
  assert.equal(ev.meta.operadorTurno, undefined);
  assert.equal(ev.meta.claveSecreta, undefined);
});

// ────────────────────────────────────────────────────────────────────────────
// 3. FICHA PÚBLICA RESILIENTE (public/trace.html)
// ────────────────────────────────────────────────────────────────────────────

test('Ficha Pública: trace.html incluye el script trace-identity.js y elimina el callejón sin salida', () => {
  const traceSource = fs.readFileSync(TRACE_HTML_PATH, 'utf8');

  // Scripts de identidad y DTO cargados
  assert.match(traceSource, /<script\s+src=["']\.\.\/trace-identity\.js["']><\/script>/i);
  assert.match(traceSource, /<script\s+src=["']\.\.\/public-trace-dto\.js["']><\/script>/i);
  assert.match(traceSource, /buildPublicTraceDocument/);

  // No muestra "Código no encontrado" como mensaje terminal
  assert.doesNotMatch(traceSource, /<h1>Código no encontrado<\/h1>/i);

  // Contiene el renderizado de la Ficha Provisional Honesta
  assert.match(traceSource, /Ficha Provisional/i);
  assert.match(traceSource, /Pendiente de Sincronización/i);
  assert.match(traceSource, /Abrir registro operativo en Setas OS/i);

  // Contiene el Bloque 2.5: Registro de Eventos de Ciclo
  assert.match(traceSource, /Registro de Eventos y Trazabilidad de Ciclo/i);
  assert.match(traceSource, /timeline-list/i);

  // Contiene botón para canastillas
  assert.match(traceSource, /Abrir canastilla.*en Setas OS/i);
});

// ────────────────────────────────────────────────────────────────────────────
// 4. DEEP-LINKING Y PROTECCIÓN DE CARGA EN SETAS OS (simulador-app.jsx)
// ────────────────────────────────────────────────────────────────────────────

test('Deep-Linking: navigation-state.js expone resolveOperationalTarget compatible con trace-identity', () => {
  assert.equal(typeof navigationState.resolveOperationalTarget, 'function');
  const target = navigationState.resolveOperationalTarget('?view=bitacora&lote=SDP-260904-SHI-R01&bolsa=B02');
  assert.ok(target);
  assert.equal(target.kind, 'bag');
  assert.equal(target.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(target.bagCode, 'SDP-260904-SHI-R01-B02');
});

test('Setas OS: simulador-app.jsx implementa bitLotesLoaded e initialDeepLinkHandled para evitar drop de deep links', () => {
  const appSource = fs.readFileSync(SIMULADOR_APP_PATH, 'utf8');

  assert.match(appSource, /const \[bitLotesLoaded,\s*setBitLotesLoaded\]\s*=\s*useState\(false\);/);
  assert.match(appSource, /const initialDeepLinkHandled\s*=\s*useRef\(false\);/);

  // bitLotesLoaded se activa en finally de la carga de localStorage
  assert.match(appSource, /finally\s*\{\s*setBitLotesLoaded\(true\);?\s*\}/);

  // useEffect que observa [bitLotesLoaded, bitLotes] y resuelve el target
  assert.match(appSource, /resolveOperationalTarget/);
  assert.match(appSource, /initialDeepLinkHandled\.current\s*=\s*true/);
  assert.match(appSource, /setBitActiveLoteId\(found\.id\)/);
  assert.match(appSource, /goBitTab\('bit_ficha',\s*true\)/);

  // Aviso honesto cuando el lote no está en datos locales
  assert.match(appSource, /Lote no encontrado localmente/);
});

// ────────────────────────────────────────────────────────────────────────────
// 5. ROUND-TRIP SIMÉTRICO Y COMPATIBILIDAD CON ETIQUETAS TÉRMICAS
// ────────────────────────────────────────────────────────────────────────────

test('Round-Trip: De identidad a URL pública, luego deep-link de Setas OS, luego target operativo', () => {
  const originalIdentity = {
    valid: true,
    kind: 'bag',
    batchCode: 'SDP-260904-SHI-R01',
    bagCode: 'SDP-260904-SHI-R01-B02',
    bagNumber: 2,
    flush: null,
    crateCode: null
  };

  // 1. Generar URL de trazabilidad para QR físico impreso
  const traceUrl = traceIdentity.buildTraceUrl(originalIdentity);
  assert.match(traceUrl, /codigo=SDP-260904-SHI-R01-B02/);

  // 2. Escaneo en iPhone decodifica y resuelve la identidad en trace.html
  const scannedIdentity = traceIdentity.resolveTraceIdentity(traceUrl);
  assert.equal(scannedIdentity.kind, 'bag');
  assert.equal(scannedIdentity.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(scannedIdentity.bagCode, 'SDP-260904-SHI-R01-B02');

  // 3. Botón "Abrir en Setas OS" genera el deep-link
  const osUrl = traceIdentity.buildSetasOSUrl(scannedIdentity);
  assert.match(osUrl, /view=bitacora/);
  assert.match(osUrl, /lote=SDP-260904-SHI-R01/);
  assert.match(osUrl, /bolsa=SDP-260904-SHI-R01-B02/);

  // 4. Setas OS resuelve el deep-link a la misma entidad operativa
  const operationalTarget = navigationState.resolveOperationalTarget(osUrl);
  assert.ok(operationalTarget);
  assert.equal(operationalTarget.kind, 'bag');
  assert.equal(operationalTarget.batchCode, 'SDP-260904-SHI-R01');
  assert.equal(operationalTarget.bagCode, 'SDP-260904-SHI-R01-B02');
  assert.equal(operationalTarget.bagNumber, 2);
});

// ────────────────────────────────────────────────────────────────────────────
// 6. HERRAMIENTAS ADMINISTRATIVAS Y ACCIONES EN BITÁCORA
// ────────────────────────────────────────────────────────────────────────────

test('Setas OS: Bitácora expone sincronización de fichas públicas y soporte de canastillas', () => {
  const appSource = fs.readFileSync(SIMULADOR_APP_PATH, 'utf8');

  // Función de sincronización administrativa
  assert.match(appSource, /const sincronizarFichasPublicas = async/);
  assert.match(appSource, /openThermalForCrate/);

  // Botones presentes en bit-context-actions
  assert.match(appSource, /Sincronizar Fichas/);
  assert.match(appSource, /Canastilla/);

  // Modal térmico soporta alcance crate
  assert.match(appSource, /thermalScope === 'crate'/);
  assert.match(appSource, /CANASTILLA REUTILIZABLE/);
  assert.match(appSource, /value="crate"/);

  // PublicTraceabilityModal recibe bolsas y expone botón de publicación directa
  assert.match(appSource, /Publicar ahora/);
  assert.match(appSource, /bolsas=\{bitBolsas\}/);
});
