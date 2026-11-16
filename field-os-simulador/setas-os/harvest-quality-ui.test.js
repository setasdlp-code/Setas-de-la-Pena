'use strict';
// Prueba de cableado sobre fuentes: la sección "Calidad" del formulario de cosecha.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const sources = require('./jsx-sources.cjs');
const app = read('simulador-app.jsx');
const component = read('views/harvest-quality-fields.jsx');

test('jsx-sources incluye el componente antes de simulador-app.jsx', () => {
  const i = sources.indexOf('views/harvest-quality-fields.jsx');
  assert.ok(i >= 0, 'falta views/harvest-quality-fields.jsx');
  assert.ok(i < sources.indexOf('simulador-app.jsx'));
});

test('el formulario usa HarvestQualityFields con idPrefix="harvest"', () => {
  assert.match(app, /<HarvestQualityFields[^>]*idPrefix="harvest"/);
});

test('captureFields valida los cuatro campos nuevos', () => {
  for (const id of ['peso-primera', 'peso-segunda', 'peso-descarte']) {
    assert.match(app, new RegExp(`'harvest-${id}':\\[[^\\]]*\\{min:0,integer:true\\}\\]`), id);
  }
  assert.match(app, /'harvest-firmeza':\[[^\]]*\{min:1,max:5,integer:true\}\]/);
});

test('la etiqueta de estrellas pasa a "Puntaje global (heredado)"', () => {
  assert.ok(app.includes('Puntaje global (heredado)'));
  assert.ok(!app.includes('Calidad · opcional'));
});

test('el componente no tiene campo de color', () => {
  assert.ok(!component.includes('color'));
});

test('la sección va antes del bloque de poscosecha', () => {
  const q = app.indexOf('<HarvestQualityFields');
  const adv = app.indexOf('data-testid="harvest-postharvest-advisor"');
  assert.ok(q > 0 && adv > 0 && q < adv);
});

test('el flush por defecto de la hoja de campo ya no es 1 fijo', () => {
  const i = app.indexOf("tipo === 'cosecha_parcial'");
  assert.ok(i > 0);
  const block = app.slice(i, i + 700);
  assert.ok(!/flush:\s*1,/.test(block));
});

test('la canastilla ofrece calidad opcional colapsada sin tocar el selector 1ra/2da/Merma', () => {
  assert.match(app, /<HarvestQualityFields[^>]*idPrefix="crate"[^>]*defaultOpen=\{false\}|<HarvestQualityFields[^>]*defaultOpen=\{false\}[^>]*idPrefix="crate"/);
  assert.match(app, /const \[harvestQuality, setHarvestQuality\] = useState\(/);
  assert.match(app, /\{ val: 1, lbl: '1ra' \}/);
  assert.match(app, /onClick=\{\(\) => setHarvestCalidad\(q\.val\)\}/);
  const i = app.indexOf('const harvestRecord = {');
  assert.ok(i > 0 && /\.\.\.harvestQuality/.test(app.slice(i, i + 900)));
});

test('la canastilla valida la calidad antes de guardar (peso negativo o decimal, firmeza)', () => {
  const i = app.indexOf('const handleSaveHarvestCrate');
  assert.ok(i > 0);
  const body = app.slice(i, i + 2200);
  assert.match(body, /harvestQualityError\(harvestQuality\)/);
  assert.ok(body.indexOf('harvestQualityError') < body.indexOf('const harvestRecord'));
});

test('los pesos por grado son gramos enteros', () => {
  assert.match(component, /inputMode="numeric"/);
  assert.match(component, /step=\{1\}/);
  assert.ok(!component.includes('step="any"'));
});

test('el filtro de defectos reutiliza la clave de especie del lote (incluido el nombre)', () => {
  assert.match(component, /loteSppKeyOf\(lote\)/);
  assert.match(app, /const loteSppKeyOf=lote=>/);
});
