'use strict';

// Verifica que el puente de telemetría en vivo esté realmente CONECTADO a la
// app y no solo escrito al lado. Es la trampa exacta en la que ya cayó
// `subscribeToLiveClimate`: existía, tenía pruebas, y nadie lo invocaba.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const jsx = read('simulador-app.jsx');
const css = read('sim.css');
const authGate = read('firebase/auth-gate.js');
const shell = read('Setas OS v5.dc.html');

test('auth-gate carga el contrato, el adaptador y el puente en orden de dependencia', () => {
  const order = ['climate-math.js', 'telemetry-contract.js', 'esp32-telemetry-adapter.js', 'anomaly-thresholds.js', 'live-telemetry-bridge.js']
    .map(f => authGate.indexOf(`"../${f}"`));
  order.forEach((idx, i) => assert.ok(idx > -1, `${i}: falta el script en PROTECTED_APP_SCRIPTS`));
  for (let i = 1; i < order.length; i++) {
    assert.ok(order[i] > order[i - 1], 'cada módulo lee el global que publica el anterior: el orden importa');
  }
  // Igual que climate-math: no deben descargarse en la pantalla de login.
  assert.doesNotMatch(shell, /<script src="live-telemetry-bridge\.js"><\/script>/);
  assert.doesNotMatch(shell, /<script src="anomaly-thresholds\.js"><\/script>/);
});

test('el shell monta el hook de telemetría en vivo una sola vez', () => {
  assert.match(jsx, /function useLiveTelemetry\(/);
  assert.match(jsx, /const liveTelemetry = useLiveTelemetry\(\{ bands: ROOM_TARGET_BANDS \}\)/);
  // Un hook llamado dos veces abriría dos WebSockets y duplicaría cada alerta.
  assert.equal((jsx.match(/= useLiveTelemetry\(/g) || []).length, 1);
  assert.match(jsx, /createLiveTelemetryBridge\(\{/);
  assert.match(jsx, /createAnomalyEngine\(\{ bands \}\)/);
  assert.match(jsx, /factories: bridgeLib\.browserFactories/);
  assert.match(jsx, /bridge\.start\(\)/);
  // Sin el cleanup, cada cambio de configuración deja un socket colgado.
  assert.match(jsx, /clearInterval\(timer\);\s*\n\s*bridge\.stop\(\);/);
});

test('los tres transportes se configuran y ninguno se declara sin URL', () => {
  assert.match(jsx, /function buildLiveTransports\(config\)/);
  assert.match(jsx, /kind: 'websocket', url: config\.websocketUrl/);
  assert.match(jsx, /kind: 'mqtt', url: config\.mqttUrl, topics: config\.mqttTopics/);
  assert.match(jsx, /kind: 'firestore'/);
  assert.match(jsx, /if \(config\.websocketUrl\)/);
  assert.match(jsx, /if \(config\.mqttUrl\)/);
  // Firestore solo si Firebase ya publicó su suscripción curriada.
  assert.match(jsx, /window\.SetasFirebase\.subscribeToLiveClimate === 'function'/);
});

test('el cockpit de Hoy consume telemetría real, no constantes escritas a mano', () => {
  assert.match(jsx, /data-testid="today-climate-strip"/);
  assert.match(jsx, /const live = liveTelemetry\.roomLive\(r\.id\)/);
  assert.match(jsx, /isLive\('temperature_c'\) \? sample\.temperature_c : demo\.temperature_c/);

  // Las constantes que había incrustadas en el strip ya no pueden estar ahí:
  // eran mediciones inventadas presentadas como lecturas de sonda.
  const stripStart = jsx.indexOf('data-testid="today-climate-strip"');
  const stripEnd = jsx.indexOf('queue.length===0', stripStart);
  const strip = jsx.slice(stripStart, stripEnd);
  assert.ok(stripStart > -1 && stripEnd > stripStart);
  assert.doesNotMatch(strip, /const t = isMartha \? 17\.2 : 18\.4/);
  assert.doesNotMatch(strip, /const rh = isMartha \? 91\.5 : 88\.0/);
  assert.doesNotMatch(strip, /const co2 = isMartha \? 680 : 750/);
  // Y el respaldo de demo se muestra siempre etiquetado como tal.
  assert.match(strip, /today-climate-card--demo/);
  assert.match(strip, /sin telemetría · valores de referencia/);
});

test('Hoy publica las alertas de umbral con su acción correctiva', () => {
  assert.match(jsx, /data-testid="hoy-live-alerts"/);
  assert.match(jsx, /Alertas de cámara en vivo/);
  assert.match(jsx, /liveTelemetry\.alerts\.slice\(0,6\)/);
  // Cada alerta lleva a la sala afectada, no a una vista genérica.
  assert.match(jsx, /setSelectedClimateRoom\(a\.roomId\); goTab\('clima'\);/);
  assert.match(jsx, /\{a\.action\}/);
  assert.match(jsx, /data-testid="live-telemetry-status"/);
  assert.match(jsx, /LIVE_CONNECTIVITY_LABEL\[liveTelemetry\.status\.connectivity\]/);
});

test('las bandas objetivo tienen una sola definición para Hoy y para Cámaras', () => {
  assert.match(jsx, /const ROOM_TARGET_BANDS = \{/);
  ['martha_01', 'cloudlab_844', 'incubacion_01'].forEach(room => {
    assert.match(jsx, new RegExp(`${room}: \\{\\s*\\n\\s*temperature_c:`), `falta la banda de ${room}`);
  });
  // El dashboard ya no redefine sus propios targets por sala.
  assert.match(jsx, /const defaultTargets = ROOM_TARGET_BANDS\[selectedClimateRoom\] \|\| ROOM_TARGET_BANDS\.martha_01;/);
  assert.doesNotMatch(jsx, /const defaultTargets = selectedClimateRoom === 'martha_01'/);
  // Y las bandas declaran límites críticos, que es lo que le permite al motor
  // saltarse el dwell cuando de verdad hace falta.
  assert.match(jsx, /criticalMax: 26\.0/);
});

test('el dashboard de Cámaras prioriza la lectura medida sobre la sintética', () => {
  assert.match(jsx, /const roomLive = liveTelemetry\.roomLive\(selectedClimateRoom\)/);
  assert.match(jsx, /const currentMetrics = \{ \.\.\.baseMetrics, \.\.\.physicalMetrics, \.\.\.\(injected\|\|\{\}\), \.\.\.liveMetrics \};/);
  assert.match(jsx, /const liveSeriesFor=\(metric,fallback\)=>/);
  assert.match(jsx, /const tempSeries=liveSeriesFor\('temperature_c'/);
  assert.match(jsx, /const co2Series=liveSeriesFor\('co2_ppm'/);
  assert.match(jsx, /data-testid="climate-series-provenance"/);
  assert.match(jsx, /data-testid="climate-live-alerts"/);
});

test('el CO₂ en vivo no se compensa por altitud dos veces', () => {
  // El puente corrige en el ingreso. La tarjeta de KPI corregía otra vez sobre
  // el mismo número: 700 ppm crudos habrían aparecido como 1.276 ppm y habrían
  // disparado alertas de CO₂ que no existen.
  assert.match(jsx, /const ndirCorr = co2Correction\s*\n\s*\? \{ correctedPpm: co2Correction\.correctedPpm/);
  assert.match(jsx, /data-co2-live=\{ndirCorr\.live\?'true':'false'\}/);
  assert.doesNotMatch(jsx, /calcBarometricCO2Correction\(currentMetrics\.co2, 745\.0, currentMetrics\.temp\)/);
});

test('el dashboard no muestra dos veces la misma alerta de la sala', () => {
  // El diagnóstico instantáneo de evalClimateHealth dice lo mismo que el motor
  // de umbrales pero sin dwell ni histéresis. Con telemetría real, mostrar los
  // dos duplica cada problema y la copia sin filtrar parpadea.
  assert.match(jsx, /\{liveRoomAlerts\.length === 0 && climateHealth\.alerts\.length > 0 && \(/);
});

test('los bloques en vivo se montan en el cockpit que de verdad se renderiza', () => {
  // TodayV2 define <h1>Hoy</h1> pero no lo monta nadie: el cockpit real es el
  // Tablero de Control del tab 'home'. Poner ahí las alertas es la diferencia
  // entre que el operario las vea y que existan solo en el código.
  assert.equal((jsx.match(/<TodayV2\s*\/>/g) || []).length, 0, 'si TodayV2 se monta, revisar esta prueba');
  assert.match(jsx, /className="home-live-telemetry"/);
  const homeStart = jsx.indexOf('className="home-live-telemetry"');
  const homeBlock = jsx.slice(homeStart, homeStart + 400);
  ['<LiveTelemetryStatusBar/>', '<LiveAlertsSection/>', '<LiveClimateStrip/>'].forEach(tag => {
    assert.ok(homeBlock.includes(tag), `falta ${tag} en el cockpit home`);
  });
  // Una sola definición de cada pieza: dos copias del markup vuelven a abrir la
  // puerta a que un cockpit muestre un criterio de severidad y el otro, otro.
  ['LiveTelemetryStatusBar', 'LiveAlertsSection', 'LiveClimateStrip'].forEach(name => {
    assert.equal((jsx.match(new RegExp(`const ${name}=\\(\\)=>`, 'g')) || []).length, 1);
  });
});

test('sim.css define el estado del puente y las alertas de umbral', () => {
  ['.live-telemetry-status', '.live-telemetry-dot', '.os-live-alert', '.os-live-alerts',
   '.climate-live-alerts', '.today-climate-card--live', '.today-climate-card--demo',
   '.today-climate-card__prov'].forEach(sel => {
    assert.ok(css.includes(`.sim-root ${sel}`), `falta ${sel} en sim.css`);
  });
  // La severidad no puede depender solo del punto de color: en pantalla al sol
  // se pierde. Debe haber también un canal no cromático (el borde izquierdo).
  assert.match(css, /\.sim-root \.os-live-alert--critico \{[\s\S]*?border-left-color/);
  assert.match(css, /\.sim-root \.os-live-alert \{[\s\S]*?border-left-width: 3px/);
  // Y el bloque debe seguir siendo usable en celular de campo.
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.os-live-alert \{ flex-wrap: wrap; \}/);
});

test('el Hub IoT deja configurar los tres transportes y la presión local', () => {
  assert.match(jsx, /data-testid="iot-hub-conexion"/);
  assert.match(jsx, /Conexión en Vivo/);
  assert.match(jsx, /liveTelemetry\.setConfig\(\{/);
  assert.match(jsx, /websocketUrl: connWs\.trim\(\)/);
  assert.match(jsx, /mqttUrl: connMqtt\.trim\(\)/);
  assert.match(jsx, /firestore: connFirestore/);
  assert.match(jsx, /pressureHpa: Number\(connPressure\) \|\| 745/);
  // El modal recibe el hook: sin este prop el panel se renderiza muerto.
  assert.match(jsx, /liveTelemetry=\{liveTelemetry\}/);
  assert.match(jsx, /liveTelemetry = null \}\) => \{/);
});

test('Firestore conserva la bandera de compensación de CO₂', () => {
  // Sin ella, un firmware que ya compensó (SCD30 con presión ambiente) vería su
  // lectura corregida otra vez al releerla el puente: +36 % y alertas falsas.
  const sync = read('firebase/telemetria-sync.js');
  assert.match(sync, /co2_pressure_compensated: reading\.co2_pressure_compensated === true/);
  const bridge = read('live-telemetry-bridge.js');
  assert.match(bridge, /if \(data\.co2_pressure_compensated === true\) packet\.co2_pressure_compensated = true;/);
});

test('el puente reutiliza el contrato canónico en vez de inventar otro shape', () => {
  const bridge = read('live-telemetry-bridge.js');
  assert.match(bridge, /require\('\.\/telemetry-contract\.js'\)/);
  assert.match(bridge, /require\('\.\/esp32-telemetry-adapter\.js'\)/);
  assert.match(bridge, /telemetryAdapter\.adaptESP32Payload/);
  // La compensación por altitud sale de climate-math, no de una constante nueva.
  assert.match(bridge, /climateMath\.calcBarometricCO2Correction/);
  assert.match(bridge, /TENJO_NOMINAL_PRESSURE_HPA/);
});
