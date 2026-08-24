'use strict';
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace } = require('./helpers.js');

// E2E-07 — "Calcular" produce diversidad estructural real. Protege la
// política de group-cap + backfill de perito-scenarios.js (RANKED_LIMIT=12,
// RANKED_PER_GROUP_CAP=3) contra regresiones: sin ella, el top-12 puede
// colapsar a una sola base estructural repetida.
test('Calcular produce >=4 firmas de base distintas en el top-12, sin ninguna en más de 3 posiciones', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');

  // Especie objetivo por defecto (Orellana Gris) tiene >=4 bases compatibles
  // en el catálogo — paleta completa, no solo bodega, para no artificialmente
  // limitar la diversidad disponible.
  await page.getByRole('button', { name: 'Paleta completa' }).click();
  await page.getByRole('button', { name: 'Calcular' }).click();

  const results = page.locator('.opt-result');
  await expect(results).not.toHaveCount(0, { timeout: 15_000 });
  const count = await results.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(12);

  const signatures = await results.evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-base-signature')));

  const distinct = new Set(signatures);
  expect(distinct.size).toBeGreaterThanOrEqual(Math.min(4, count));

  const counts = {};
  for (const sig of signatures) counts[sig] = (counts[sig] || 0) + 1;
  for (const [sig, n] of Object.entries(counts)) {
    expect(n, `firma de base "${sig}" aparece ${n} veces en el top-${count}`).toBeLessThanOrEqual(3);
  }

  // Sin duplicados exactos de receta (mismos ingredientes + mismos %).
  const recipeKeys = await results.evaluateAll((nodes) =>
    nodes.map((n) => Array.from(n.querySelectorAll('.opt-pill')).map((p) => p.textContent.trim()).sort().join('|'))
  );
  expect(new Set(recipeKeys).size).toBe(recipeKeys.length);
});

// Prueba de vida del adaptador nativo: el Formulador debe registrarse ante
// SetasFormulatorAPI apenas monta, sin depender de ninguna interacción del
// usuario. Si esto falla con adapterType()==='dom' (o undefined), el
// useEffect de registro en simulador-app.jsx no está corriendo — no arreglar
// aquí, es una señal de regresión en el wiring del adaptador nativo.
test('Formulador registra el adaptador nativo del Perito al montar', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');
  const adapterType = await page.evaluate(() => window.SetasFormulatorAPI?.adapterType?.());
  expect(adapterType).toBe('native');
});
