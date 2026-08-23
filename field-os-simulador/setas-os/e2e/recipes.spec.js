'use strict';
const { test, expect } = require('@playwright/test');
const {
  openApp,
  goWorkspace,
  activeContextTab,
  seedLocalStorage,
  confirmDialogIfPresent,
  selectSpecies,
  addIngredientByName,
  setIngredientPct,
  getIngredientPct,
} = require('./helpers.js');
const { E2E_RECETA_CARGADA } = require('./fixtures.js');

// E2E-03 — Reproduce la regresión histórica de loadR(): cargar una receta
// desde Recetario debe aterrizar en Formular, no quedarse en Recetario.
test('cargar una receta desde Recetario aterriza en Formulador', async ({ page }) => {
  await seedLocalStorage(page, { setas_v6: [E2E_RECETA_CARGADA] });
  await openApp(page);
  await goWorkspace(page, 'formular');
  await page.getByRole('tab', { name: 'Recetario' }).click();

  const card = page.locator(`[data-recipe-id="${E2E_RECETA_CARGADA.id}"]`);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Cargar' }).click();
  await confirmDialogIfPresent(page);

  expect(await activeContextTab(page)).toBe('Formular');
  await expect(page.locator('[data-testid="breadcrumb"]')).toContainText(/formulador/i);
});

// E2E-05 — La composición de una receta sin guardar sobrevive al cambio de
// workspace: el componente React nunca se desmonta al cambiar de espacio.
test('la composición de la receta sin guardar sobrevive Producción → Control → Formular', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');
  await selectSpecies(page, 'p_ostreatus_gris');
  await addIngredientByName(page, 'Paja de trigo');
  await setIngredientPct(page, 'Paja de trigo', 63.5);

  await goWorkspace(page, 'produccion');
  await goWorkspace(page, 'control');
  await goWorkspace(page, 'formular');

  expect(await getIngredientPct(page, 'Paja de trigo')).toBe('63.5');
});

// E2E-06 — La especie activa persiste igual que la composición, por
// separado: protege el caso en que solo se resetea sKey y no recipe.
test('la especie seleccionada sobrevive Producción → Control → Formular', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');
  await selectSpecies(page, 'p_ostreatus_gris');
  await addIngredientByName(page, 'Paja de trigo');

  await goWorkspace(page, 'produccion');
  await goWorkspace(page, 'control');
  await goWorkspace(page, 'formular');

  await expect(page.locator('.form-species-context')).toContainText('Orellana Gris');
  await expect(page.locator('#form-species-context-select')).toHaveValue('p_ostreatus_gris');
});
