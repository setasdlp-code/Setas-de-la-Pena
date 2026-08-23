'use strict';
const { test, expect } = require('@playwright/test');
const {
  openApp,
  goWorkspace,
  activeWorkspace,
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

test('Mesa de Mezcla y Generador son paneles separados y navegables', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await openApp(page);
  await goWorkspace(page, 'formular');

  const mesaTab = page.getByRole('tab', { name: /Mesa de Mezcla/ });
  const generatorTab = page.getByRole('tab', { name: /Generador de Recetas/ });
  await expect(mesaTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#formular-panel-mesa')).toBeVisible();
  await expect(page.locator('#formular-panel-generador')).toHaveCount(0);

  await generatorTab.click();
  await expect(generatorTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#formular-panel-generador')).toBeVisible();
  await expect(page.locator('#formular-panel-mesa')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('el solver C:N calcula una receta y la carga en la Mesa de Mezcla', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');
  await page.getByRole('tab', { name: /Generador de Recetas/ }).click();
  await page.getByRole('button', { name: 'Por objetivo C:N' }).click();

  await page.locator('#inv-base').selectOption('paja_trigo');
  await page.locator('#inv-supp').selectOption('salvado_trigo');
  await page.getByRole('button', { name: /Calcular proporciones exactas/ }).click();

  await expect(page.locator('.inv-result')).toBeVisible();
  await expect(page.locator('.inv-result')).not.toContainText(/no alcanzable|demasiado similares/i);
  await page.getByRole('button', { name: /Cargar en Mesa de Mezcla/ }).click();

  await expect(page.getByRole('tab', { name: /Mesa de Mezcla/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#form-species-context-select')).toHaveValue('p_ostreatus_gris');
  await expect(page.locator('.form-species-context')).toContainText('Orellana Gris');
  await expect.poll(()=>page.locator('#setas-main').evaluate(el=>el.scrollTop)).toBe(0);
  await expect(page.locator('.rec-row')).toHaveCount(3);
  await expect(page.locator('.rec-row', { hasText: 'Paja de trigo' })).toBeVisible();
  await expect(page.getByTestId('formulator-next-action')).toContainText('Preparar lote');
});

test('la acción móvil principal guía especie → balance → preparación', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');
  await addIngredientByName(page, 'Paja de trigo');

  const nextAction = page.getByTestId('formulator-next-action');
  await expect(nextAction).toContainText('Elegir especie');
  await nextAction.click();
  await expect(page.locator('#form-species-context-select')).toBeFocused();

  await selectSpecies(page, 'p_ostreatus_gris');
  await expect(nextAction).toContainText('Balancear 100%');
  await nextAction.click();
  await expect(page.locator('.rec-row input.rec-pct-input')).toHaveValue('100');
  await expect(nextAction).toContainText('Preparar lote');

  await nextAction.click();
  expect(await activeWorkspace(page)).toBe('produccion');
});

test('el inicio rápido móvil pone especie, origen y selección de insumos en la primera pantalla', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'La superficie de inicio rápido solo se muestra en móvil');
  await openApp(page);
  await goWorkspace(page, 'formular');

  const quickStart = page.getByTestId('form-mobile-start');
  await expect(quickStart).toBeVisible();
  await expect(page.locator('.form-flow')).toBeHidden();
  await expect(page.getByRole('tab', { name: /Mesa de Mezcla/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Generador de Recetas/ })).toBeVisible();

  await selectSpecies(page, 'p_ostreatus_gris');
  await quickStart.getByRole('button', { name: 'Catálogo', exact: true }).click();
  await quickStart.getByRole('button', { name: 'Elegir insumos', exact: true }).click();

  const search = page.locator('#bl-ingredientes .search');
  await expect(search).toBeFocused();
  await expect(search).toBeInViewport();
});

test('la barra móvil permite volver a la receta editable desde el catálogo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'El salto fijo se valida en el recorrido móvil');
  await openApp(page);
  await goWorkspace(page, 'formular');
  await selectSpecies(page, 'p_ostreatus_gris');
  await page.getByTestId('form-mobile-start').getByRole('button', { name: 'Catálogo', exact: true }).click();
  await page.getByTestId('form-mobile-start').getByRole('button', { name: 'Elegir insumos', exact: true }).click();
  await addIngredientByName(page, 'Paja de trigo');

  const reviewRecipe = page.getByTestId('formulator-review-recipe');
  await expect(reviewRecipe).toBeInViewport();
  await reviewRecipe.click();

  const pctInput = page.locator('#bl-receta .rec-pct-input').first();
  await expect(pctInput).toBeFocused();
  await expect(pctInput).toBeInViewport();
});
