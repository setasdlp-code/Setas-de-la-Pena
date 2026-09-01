'use strict';
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace, selectSpecies } = require('./helpers.js');

// E2E-07 — "Calcular" produce diversidad estructural real. Protege la
// política de group-cap + backfill de perito-scenarios.js (RANKED_LIMIT=12,
// RANKED_PER_GROUP_CAP=3) contra regresiones: sin ella, el top-12 puede
// colapsar a una sola base estructural repetida.
test('Calcular produce >=4 firmas de base distintas en el top-12, sin ninguna en más de 3 posiciones', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');
  await selectSpecies(page, 'p_ostreatus_gris');

  // Orellana Gris tiene >=4 bases compatibles en el catálogo. El control de
  // origen cambia de etiqueta en la superficie de inicio rápido móvil.
  const quickStart = page.getByTestId('form-mobile-start');
  if (await quickStart.isVisible()) {
    await quickStart.getByRole('button', { name: 'Catálogo', exact: true }).click();
  } else {
    await page.getByRole('group', { name: 'Origen de ingredientes' })
      .getByRole('button', { name: 'Paleta completa', exact: true }).click();
  }

  await page.getByRole('tab', { name: /Generador de Recetas/ }).click();
  const generator = page.locator('#formular-panel-generador');
  await expect(generator).toBeVisible();
  await generator.getByRole('button', { name: 'Calcular', exact: true }).click();

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

test('mobile: Generador conserva tabs válidos, anuncia resultados y no desborda', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Contrato específico del Generador móvil');

  await openApp(page);
  await goWorkspace(page, 'formular');
  await selectSpecies(page, 'p_ostreatus_gris');
  await page.getByTestId('form-mobile-start').getByRole('button', { name: 'Catálogo', exact: true }).click();

  const modeTabs = page.locator('.formular-mode-nav[role="tablist"]').getByRole('tab');
  await expect(modeTabs).toHaveCount(2);
  await expect(modeTabs.nth(0)).toHaveAttribute('aria-controls', 'formular-panel-mesa');
  await expect(modeTabs.nth(1)).toHaveAttribute('aria-controls', 'formular-panel-generador');

  const coFormToggle = page.getByTestId('co-form-toggle');
  await expect(coFormToggle).toHaveAttribute('aria-pressed', 'false');
  await expect(coFormToggle).not.toHaveAttribute('role', 'tab');

  const generatorTab = modeTabs.nth(1);
  await generatorTab.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(modeTabs.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(generatorTab).toBeFocused();

  await generatorTab.click();
  const generator = page.locator('#formular-panel-generador');
  await expect(generator.getByRole('heading', { name: /Automejora.*Generador de recetas/i, level: 2 })).toBeVisible();
  await generator.getByRole('button', { name: 'Calcular', exact: true }).click();

  const status = generator.getByRole('status');
  await expect(status).toContainText(/\d+ escenario|No hay ingredientes en stock|No hay combinaciones válidas|No se pudieron calcular/i);
  await expect(generator.locator('#generator-results-heading')).toBeFocused();
  await expect(generator).toEvaluate((node) => node.scrollWidth <= node.clientWidth);
  await expect(generator.locator('.opt-result')).not.toHaveCount(0);
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

test('browser: stock-only excludes incompatible ingredients and Formulador rejects a non-100% external proposal', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');

  const result = await page.evaluate(async () => {
    const catalog = [
      { id: 'base', role: 'base_carbono', cs: ['target'], cost: 10 },
      { id: 'supp', role: 'suplemento_n', cs: ['target'], cost: 20 },
      { id: 'foreign', role: 'aireador', cs: ['other_species'], cost: 1 },
    ];
    const spp = { target: { supplementation_max: 20 } };
    const scenarios = window.SetasPeritoScenarios.searchScenarios({
      recipe: [{ id: 'base', p: 90 }, { id: 'supp', p: 10 }],
      ingredients: catalog,
      context: { sKey: 'target', spp },
      targetKey: 'target',
      spp,
      analyze: recipe => ({
        tot: recipe.reduce((sum, row) => sum + row.p, 0),
        cafeP: 0,
        foreign: recipe.some(row => row.id === 'foreign'),
      }),
      score: analysis => ({
        score: analysis.foreign ? 99 : 60,
        dimensions: { safety: { score: 90 }, agronomy: { score: analysis.foreign ? 99 : 60 }, economy: { score: 90 } },
        uncertainty: { eb: { confidence: 'low' }, risk: { confidence: 'low' } },
      }),
      useStock: true,
      stockIds: new Set(['base', 'supp', 'foreign']),
      generations: 1,
      roleCaps: { base_carbono: 100, suplemento_n: 20, aireador: 20 },
    });
    const before = window.SetasFormulatorAPI.getRecipe();
    const invalidApply = await window.SetasFormulatorAPI.applyRecipe([{ id: 'base', p: 110 }], { force: true });
    return {
      foreignRanked: scenarios.ranked.some(candidate => candidate.recipe.some(row => row.id === 'foreign')),
      foreignRecommended: scenarios.recommended.some(candidate => candidate.recipe.some(row => row.id === 'foreign')),
      invalidApply,
      before,
      after: window.SetasFormulatorAPI.getRecipe(),
    };
  });

  expect(result.foreignRanked).toBe(false);
  expect(result.foreignRecommended).toBe(false);
  expect(result.invalidApply.ok).toBe(false);
  expect(result.after).toEqual(result.before);
});
