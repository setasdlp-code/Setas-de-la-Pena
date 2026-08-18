'use strict';
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace, seedLocalStorage } = require('./helpers.js');
const { E2E_LOTES } = require('./fixtures.js');

// E2E-04 — Abrir un lote siempre conserva la identidad del lote seleccionado.
// Detecta cualquier intento de navegar a un estado inexistente como el
// antiguo bit_lote_detalle (ver ARCHITECTURE.md).
test('abrir un lote muestra exactamente ese lote, incluso al alternar entre dos', async ({ page }) => {
  await seedLocalStorage(page, { sdp_bit_lotes: E2E_LOTES });
  await openApp(page);
  await goWorkspace(page, 'bitacora');

  const [lote1, lote2] = E2E_LOTES;

  await page.locator(`[data-lote-id="${lote1.id}"]`).first().click();
  const activeLote = page.locator('[data-testid="active-lote"]');
  await expect(activeLote).toHaveAttribute('data-lote-id', lote1.id);
  await expect(activeLote).toContainText(lote1.codigo);

  await page.getByRole('tab', { name: 'Lotes' }).click();
  await page.locator(`[data-lote-id="${lote2.id}"]`).first().click();
  await expect(activeLote).toHaveAttribute('data-lote-id', lote2.id);
  await expect(activeLote).toContainText(lote2.codigo);
});
