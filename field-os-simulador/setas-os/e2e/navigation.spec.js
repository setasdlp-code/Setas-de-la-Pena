'use strict';
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace, activeWorkspace, activeContextTab } = require('./helpers.js');

// E2E-01 — Los cuatro workspaces mantienen una sola navegación coherente.
test('los 4 workspaces sincronizan rail, pestaña contextual y breadcrumb', async ({ page }) => {
  await openApp(page);

  // El label de la pestaña contextual y el del breadcrumb son vocabularios
  // independientes en el shell (ver SIM_CRUMB en Setas OS v5.dc.html) — p.ej.
  // la pestaña "Preparar mezcla" cae en el breadcrumb "Producción · Ficha de
  // siembra". Se verifican por separado, no se deriva uno del otro.
  const expected = {
    formular: { tab: 'Formular', crumb: /formulador/i },
    produccion: { tab: 'Preparar mezcla', crumb: /ficha de siembra/i },
    bitacora: { tab: 'Lotes', crumb: /bitácora/i },
    control: { tab: 'Hoy', crumb: /hoy/i },
  };

  for (const [workspace, { tab: expectedTab, crumb }] of Object.entries(expected)) {
    await goWorkspace(page, workspace);

    await expect(page.locator('.rail-btn[data-workspace][aria-current="page"]')).toHaveCount(1);
    expect(await activeWorkspace(page)).toBe(workspace);

    await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);
    expect(await activeContextTab(page)).toBe(expectedTab);

    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText(crumb);
  }
});

// E2E-02 — Una pestaña interna de React actualiza también el shell.
test('cambiar de pestaña contextual dentro de Formular actualiza el shell (React -> shell)', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');

  await page.getByRole('tab', { name: 'Recetario' }).click();
  await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveText('Recetario');
  await expect(page.locator('[data-testid="breadcrumb"]')).toContainText(/recetario/i);
  expect(await activeWorkspace(page)).toBe('formular');

  await page.getByRole('tab', { name: 'Formular' }).click();
  await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveText('Formular');
  await expect(page.locator('[data-testid="breadcrumb"]')).toContainText(/formulador/i);
});
