// Arranque del piloto (lote 1, shiitake): Setas OS no debe traer datos de ejemplo
// ni monitoreo simulado presentado como lectura real.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const shell = fs.readFileSync(path.join(__dirname, 'Setas OS v5.dc.html'), 'utf8');
const jsx = fs.readFileSync(path.join(__dirname, 'simulador-app.jsx'), 'utf8');

function stateBlock() {
  const i = shell.indexOf('class Component extends DCLogic {');
  const j = shell.indexOf('dialogIsOpen(s){', i);
  return shell.slice(i, j);
}

function loadStripper() {
  const i = shell.indexOf("const DEMO_CONTAINER_IDS");
  const j = shell.indexOf('// Monitoreo de cámaras simulado', i);
  // eslint-disable-next-line no-new-func
  return new Function(shell.slice(i, j) + '\nreturn stripShellDemoState;')();
}

test('el estado inicial del shell no trae contenedores, eventos, salidas ni rendimientos de ejemplo', () => {
  const block = stateBlock();
  for (const key of ['containers', 'ledger', 'reviewSessions', 'reviewEvents', 'salidas', 'yields']) {
    assert.match(block, new RegExp(`\\n\\s+${key}: \\[\\],`), `${key} debe arrancar vacío`);
  }
  assert.match(block, /workLog:\[\],/);
  assert.doesNotMatch(block, /C-04\d\d|L-26\d\d|R-14/);
});

test('las tablas fijas de plan, inventario y recetas del shell están vacías', () => {
  for (const name of ['SCHEDULE_ROWS', 'INVENTORY_ROWS', 'RECIPES']) {
    assert.match(shell, new RegExp(`const ${name} = \\[\\];`));
  }
  assert.doesNotMatch(shell, /\$612\.000|OP-2609|Restaurante Aldea', note|note:'20 jul'/);
});

test('la limpieza única quita solo los registros de ejemplo conocidos', () => {
  const strip = loadStripper();
  const out = strip({
    containers: [{ id: 'C-0414', batch: 'L-2609' }, { id: 'C-0416', batch: '2026-11-LE-001' }],
    ledger: [
      { type: 'observacion', container: 'C-0412' },
      { type: 'clima', container: 'Incubación' },
      { type: 'inoculacion', container: 'C-0416' },
    ],
    salidas: [{ lote: 'L-2605' }, { lote: '2026-12-LE-001' }],
    yields: [{ lote: 'L-2604' }],
    seq: 416,
    operator: 'Germán',
  });
  assert.deepEqual(out.containers.map(c => c.id), ['C-0416']);
  assert.deepEqual(out.ledger.map(e => e.container), ['C-0416']);
  assert.deepEqual(out.salidas.map(x => x.lote), ['2026-12-LE-001']);
  assert.deepEqual(out.yields, []);
  assert.equal(out.seq, 416);
  assert.equal(out.operator, 'Germán');
});

test('loadPersisted aplica la limpieza una sola vez con marca versionada', () => {
  assert.match(shell, /const PILOT_RESET_KEY = 'setas_os_pilot_reset_v1';/);
  assert.match(shell, /localStorage\.getItem\(PILOT_RESET_KEY\)!=='1'[\s\S]{0,200}stripShellDemoState\(d\)/);
});

test('el monitoreo de cámaras simulado queda apagado salvo opt-in explícito', () => {
  assert.match(shell, /window\.__setasClimateSim === true/);
  assert.match(shell, /liveMonitor\(cm\)\{\n\s+if\(!climateSimEnabled\(\)\)\{/);
  assert.match(shell, /detectChamberAlerts\(\)\{\n\s+if\(!climateSimEnabled\(\)\) return;/);
  assert.match(shell, /onClimateAlert\(d\)\{\n\s+if\(!climateSimEnabled\(\)\) return;/);
  assert.match(shell, /if\(climateSimEnabled\(\)\) this\._climaTick = setInterval/);
});

test('el simulador no trae siembras de inventario ni valores de sala de ejemplo en la ficha del lote', () => {
  assert.doesNotMatch(jsx, /SEED_(PROVEEDORES|LOTES|COMPRAS|MOVIMIENTOS)/);
  assert.doesNotMatch(jsx, /demoMetrics|hasDemo/);
  assert.match(jsx, /if \(!hasLive\) return \{ key: metricKey, label, empty: true \};/);
});
