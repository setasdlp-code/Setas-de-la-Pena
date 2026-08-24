'use strict';
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace, activeWorkspace, activeContextTab, seedLocalStorage, confirmDialogIfPresent } = require('./helpers.js');
const { E2E_RECETA_CARGADA, E2E_LOTES } = require('./fixtures.js');

async function breadcrumb(page) {
  return (await page.locator('[data-testid="breadcrumb"]').textContent())?.trim();
}

async function assertCoherent(page, expectedWorkspace) {
  await expect(page.locator('.rail-btn[data-workspace][aria-current="page"]')).toHaveCount(1);
  expect(await activeWorkspace(page)).toBe(expectedWorkspace);
  const tabs = page.locator('[role="tab"][aria-selected="true"]');
  if (await tabs.count()) await expect(tabs).toHaveCount(1);
  return { workspace: expectedWorkspace, tab: await activeContextTab(page), crumb: await breadcrumb(page) };
}

// E2E-11 — Navegación repetida no acumula desincronización. Secuencia
// hostil (carga de receta, apertura de lote, vuelta a Control) repetida dos
// veces sin recargar la página: el segundo recorrido debe producir
// exactamente el mismo estado de navegación que el primero en cada paso.
test('secuencia hostil de navegación repetida dos veces produce el mismo estado en cada paso', async ({ page }) => {
  await seedLocalStorage(page, {
    setas_v6: [E2E_RECETA_CARGADA],
    sdp_bit_lotes: E2E_LOTES,
  });
  await openApp(page);

  const runSequence = async () => {
    const trace = [];

    await goWorkspace(page, 'formular');
    trace.push(await assertCoherent(page, 'formular'));

    await page.getByRole('tab', { name: 'Recetario' }).click();
    trace.push(await assertCoherent(page, 'formular'));

    await page.locator(`[data-recipe-id="${E2E_RECETA_CARGADA.id}"]`).getByRole('button', { name: 'Cargar' }).click();
    await confirmDialogIfPresent(page);
    trace.push(await assertCoherent(page, 'formular'));

    await goWorkspace(page, 'produccion');
    trace.push(await assertCoherent(page, 'produccion'));

    await page.getByRole('tab', { name: 'Bodega' }).click();
    trace.push(await assertCoherent(page, 'produccion'));

    await goWorkspace(page, 'bitacora');
    trace.push(await assertCoherent(page, 'bitacora'));

    await page.locator(`[data-lote-id="${E2E_LOTES[0].id}"]`).first().click();
    trace.push(await assertCoherent(page, 'bitacora'));
    await expect(page.locator('[data-testid="active-lote"]')).toHaveAttribute('data-lote-id', E2E_LOTES[0].id);

    await goWorkspace(page, 'control');
    trace.push(await assertCoherent(page, 'control'));

    await page.getByRole('tab', { name: 'Tablero de Control' }).click();
    trace.push(await assertCoherent(page, 'control'));

    await goWorkspace(page, 'formular');
    trace.push(await assertCoherent(page, 'formular'));

    return trace;
  };

  const firstPass = await runSequence();
  const secondPass = await runSequence();

  expect(secondPass).toEqual(firstPass);
});
