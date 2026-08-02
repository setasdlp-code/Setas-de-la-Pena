import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const html = readFileSync(resolve(import.meta.dirname, '..', 'src', 'simulador.source.html'), 'utf8');

test('el perfil Rescate rechaza por completo suplemento por encima del límite (exclusión dura)', () => {
  assert.match(html, /if\(suppOverLimit&&profileKey==='rescate'\) return;/);
});

test('el veredicto crítico domina el puntaje numérico (modelo de score compuesto v9)', () => {
  assert.match(html, /const status=score>=85\?'excellent':score>=65\?'good':score>=40\?'needs_work':'critical';/);
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
  assert.match(html, /aria-label=\{`Quitar \$\{g\??\.name(\|\|'ingrediente')?\} de la receta`\}/);
  assert.match(html, /aria-label=\{`Porcentaje de \$\{g\.name\}`\}/);
});
