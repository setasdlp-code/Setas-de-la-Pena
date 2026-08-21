'use strict';
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace } = require('./helpers.js');

// E2E-08 — EXPECTED FAILURE. El <sc-for> de roleOptions en
// "Setas OS v5.dc.html" está vacío: el modelo genera la lista pero no hay
// <button> dentro del bucle, así que el selector Operario/Producción/
// Dirección nunca renderiza nada clicable. Se deja como fallo esperado a
// propósito — si algún día esto empieza a pasar, Playwright lo reporta como
// "unexpected pass" y hay que investigarlo como una regresión normal (ver
// E2E_SCENARIOS.md).
test('selector de rol (Operario/Producción/Dirección) — bug conocido, sc-for sin <button>', async ({ page }) => {
  test.fail(true, 'Bug conocido: ver E2E_SCENARIOS.md E2E-08 — <sc-for> de roleOptions no renderiza <button>.');

  await openApp(page);
  await goWorkspace(page, 'control');
  await page.getByRole('tab', { name: 'Sesión' }).click();

  await expect(page.locator('[data-testid="role-selector"] button')).toHaveCount(3);
});
