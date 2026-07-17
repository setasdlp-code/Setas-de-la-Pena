import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const html = readFileSync(resolve(import.meta.dirname, '..', 'src', 'simulador.source.html'), 'utf8');

test('los perfiles de bajo riesgo rechazan suplemento por encima del límite', () => {
  assert.match(html, /if\(suppOverLimit&&profile\.forceLowRisk\) return;/);
});

test('el veredicto crítico domina el puntaje numérico', () => {
  assert.match(html, /const status=criticals>0\?'critical':warnings>0\?'good'/);
  assert.match(html, /disabled=\{status==='critical'\}/);
});

test('el resumen no llama excelente a una receta que conserva advertencias', () => {
  assert.match(html, /else if\(s\.some\(x=>x\.t==='warning'\)\) main='Receta funcional con ajustes requeridos antes de escalar\.'/);
});

test('la penalización de suplemento no depende de una condición imposible', () => {
  assert.doesNotMatch(html, /suppP>sp\.supplementation_max&&!needsAutoclave/);
  assert.match(html, /if\(needsAutoclave\) eb\*=\.90;/);
});

test('los controles simbólicos esenciales tienen nombre accesible', () => {
  assert.match(html, /aria-label=\{`Agregar \$\{ing\.name\} a la receta`\}/);
  assert.match(html, /aria-label=\{`Quitar \$\{g\.name\} de la receta`\}/);
  assert.match(html, /aria-label=\{`Porcentaje de \$\{g\.name\}`\}/);
});
