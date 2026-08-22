'use strict';
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace } = require('./helpers.js');

// E2E-08 — el selector Operario/Producción/Dirección vivía en el módulo
// "Sesión" (module 'inicio'), retirado al consolidar Control · Hoy/Sesión/
// Cámaras/Métricas en un único destino "Hoy". El selector se migró dentro
// del cockpit de React de "Hoy" y ya renderiza sus <button> normalmente —
// ver E2E_SCENARIOS.md.
test('selector de rol (Operario/Producción/Dirección) renderiza en Hoy', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'control');
  await page.getByRole('tab', { name: 'Hoy' }).click();

  await expect(page.locator('[data-testid="role-selector"] button')).toHaveCount(3);
});
