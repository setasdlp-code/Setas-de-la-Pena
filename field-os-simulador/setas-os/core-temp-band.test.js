'use strict';
// El techo de temperatura de núcleo vive en dos archivos del lado de la app:
// `incCoreMaxT` en KB_SPP (el shell .dc.html, que es lo que vigila
// check_kb_sync contra knowledge_base) y la banda `substrate_temperature_c` de
// ROOM_TARGET_BANDS (el jsx, que es lo que de verdad dispara la alerta). No
// pueden verse entre sí: KB_SPP es un const de módulo en el shell y el jsx no lo
// importa. Sin esta prueba, alguien corrige uno, deja el otro, y la alerta queda
// disparando contra un umbral que ya nadie reconoce como canónico.
//
// Se comparan textualmente porque es la única forma de leer los dos: el shell no
// es requerible y el jsx no se evalúa en Node.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const shell = fs.readFileSync(path.join(HERE, 'Setas OS v5.dc.html'), 'utf8');
const jsx = fs.readFileSync(path.join(HERE, 'simulador-app.jsx'), 'utf8');

// Especies con techo de núcleo documentado en knowledge_base (ADR-0008).
const DOCUMENTED = ['pleurotus_ostreatus', 'lentinula_edodes'];
// Las demás NO deben heredarlo: extrapolar un umbral de seguridad a una especie
// sin valor documentado es inventarlo.
const UNDOCUMENTED = ['pleurotus_djamor', 'hericium_erinaceus', 'ganoderma_lucidum'];

const kbSppRow = (speciesId) => {
  const m = shell.match(new RegExp(`^\\s*${speciesId}\\s*:\\s*\\{([^}]*)\\}`, 'm'));
  assert.ok(m, `no se encontró la fila de ${speciesId} en KB_SPP`);
  return m[1];
};

const incCoreMaxT = (speciesId) => {
  const m = kbSppRow(speciesId).match(/incCoreMaxT\s*:\s*([0-9.]+)/);
  return m ? Number(m[1]) : null;
};

const incubationBand = () => {
  const room = jsx.match(/incubacion_01:\s*\{([\s\S]*?)\n\s{2}\},/);
  assert.ok(room, 'no se encontró la sala incubacion_01 en ROOM_TARGET_BANDS');
  const band = room[1].match(/substrate_temperature_c:\s*\{([^}]*)\}/);
  assert.ok(band, 'incubacion_01 no declara banda de substrate_temperature_c');
  const field = (name) => {
    const m = band[1].match(new RegExp(`\\b${name}\\s*:\\s*([0-9.]+)`));
    return m ? Number(m[1]) : null;
  };
  return { max: field('max'), criticalMax: field('criticalMax'), min: field('min'), target: field('target') };
};

test('las dos especies documentadas declaran el mismo techo de núcleo', () => {
  const values = DOCUMENTED.map(incCoreMaxT);
  values.forEach((v, i) => assert.equal(typeof v, 'number', `${DOCUMENTED[i]} no declara incCoreMaxT`));
  assert.equal(new Set(values).size, 1, `los techos de núcleo divergen: ${JSON.stringify(values)}`);
  assert.equal(values[0], 28);
});

test('ninguna especie sin valor documentado hereda el techo de núcleo', () => {
  UNDOCUMENTED.forEach(id => {
    assert.equal(incCoreMaxT(id), null, `${id} no tiene techo de núcleo documentado y aun así lo declara`);
  });
});

test('la banda de la sala de incubación usa el mismo número que KB_SPP', () => {
  assert.equal(incubationBand().max, incCoreMaxT('pleurotus_ostreatus'));
});

test('la banda de núcleo no inventa piso ni consigna', () => {
  const band = incubationBand();
  // Un piso de núcleo no está documentado en ninguna fuente: inventarlo dispara
  // alarmas falsas cada noche fría.
  assert.equal(band.min, null);
  // Un núcleo no es una consigna — se regula el aire, el núcleo es consecuencia.
  assert.equal(band.target, null);
});

test('el crítico de núcleo está por encima del techo y dentro del rango documentado', () => {
  const band = incubationBand();
  assert.ok(band.criticalMax > band.max, 'el crítico tiene que estar por encima del techo');
  // 01_species/lentinula_edodes.md: el estrés térmico y el aborto empiezan al
  // "superar 30–32 °C". Se toma el extremo bajo del rango, que es el lado seguro.
  assert.equal(band.criticalMax, 30);
});

test('la banda de aire de incubación sigue por debajo del techo de núcleo', () => {
  // Es la relación que la corrección de 2026-10-03 estableció: el núcleo corre
  // 4–8 °C por encima del aire (paper_026), así que la consigna de aire tiene
  // que ir por debajo del techo de núcleo. Si alguien sube el aire hasta tocarlo,
  // el núcleo ya está cocido y esta prueba lo detiene.
  const room = jsx.match(/incubacion_01:\s*\{([\s\S]*?)\n\s{2}\},/)[1];
  const airMax = Number(room.match(/temperature_c:\s*\{[^}]*\bmax:\s*([0-9.]+)/)[1]);
  assert.ok(airMax < incubationBand().max,
    `el techo de aire (${airMax}) no puede alcanzar el de núcleo (${incubationBand().max})`);
});

test('el motor de anomalías sabe tratar la métrica de núcleo', () => {
  // La banda sola no sirve si el motor no tiene etiqueta, unidad y acción para
  // la métrica: la alerta saldría como "undefined" en la UI del operario.
  const anomaly = require('./anomaly-thresholds.js');
  const probe = anomaly.createAnomalyEngine({
    bands: { incubacion_01: { substrate_temperature_c: { max: 28.0, criticalMax: 30.0 } } },
    dwellMs: 0,
  });
  const at = Date.now();
  probe.evaluate('incubacion_01', { substrate_temperature_c: 31.5, observed_at: new Date(at).toISOString() });
  const [alert] = probe.activeAlerts();
  assert.ok(alert, 'un núcleo a 31,5 °C tiene que generar alerta');
  assert.equal(alert.metric, 'substrate_temperature_c');
  assert.equal(alert.direction, 'high');
  assert.equal(alert.severity, 'critico');
  assert.equal(alert.action, 'Enfriar sustrato');
  assert.ok(/[Tt]emperatura de sustrato/.test(alert.msg), `mensaje inesperado: ${alert.msg}`);
  assert.ok(alert.msg.includes('°C'), `el mensaje debe traer unidad: ${alert.msg}`);
});

test('un núcleo dentro de banda no genera alerta', () => {
  const anomaly = require('./anomaly-thresholds.js');
  const probe = anomaly.createAnomalyEngine({
    bands: { incubacion_01: { substrate_temperature_c: { max: 28.0, criticalMax: 30.0 } } },
    dwellMs: 0,
  });
  probe.evaluate('incubacion_01', { substrate_temperature_c: 24.8, observed_at: new Date().toISOString() });
  assert.deepEqual(probe.activeAlerts(), []);
});

test('sin piso declarado, un núcleo frío no dispara una alerta inventada', () => {
  const anomaly = require('./anomaly-thresholds.js');
  const probe = anomaly.createAnomalyEngine({
    bands: { incubacion_01: { substrate_temperature_c: { max: 28.0, criticalMax: 30.0 } } },
    dwellMs: 0,
  });
  probe.evaluate('incubacion_01', { substrate_temperature_c: 9.0, observed_at: new Date().toISOString() });
  assert.deepEqual(probe.activeAlerts(), []);
});
