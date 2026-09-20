// e2e/launch-inventory.spec.js
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace, seedLocalStorage, selectSpecies, addIngredientByName, setIngredientPct } = require('./helpers');

test('Lanzar Lote descuenta el plan exacto con Calcular apagado y deja trazabilidad', async ({ page }) => {
  await seedLocalStorage(page, {
    sdp_seeded: true,
    sdp_lotes: [
      { id: 'lp1', ingredienteId: 'paja_trigo', cantidadKgTotal: 50, precioPorKgCOP: 1200, fechaIngreso: '2026-06-01', cantidadKgDisponible: 50, activo: true },
      { id: 'lc1', ingredienteId: 'carbonato_calcio', cantidadKgTotal: 5, precioPorKgCOP: 3000, fechaIngreso: '2026-06-01', cantidadKgDisponible: 5, activo: true },
    ],
    sdp_inventory_ops: [],
  });
  await openApp(page);
  await goWorkspace(page, 'formular');
  await selectSpecies(page, 'p_ostreatus_gris');
  await addIngredientByName(page, 'Paja de trigo');
  await addIngredientByName(page, 'Carbonato de calcio');
  await setIngredientPct(page, 'Paja de trigo', 98);
  await setIngredientPct(page, 'Carbonato de calcio', 2);
  // Con "Calcular" apagado el único lanzador es el botón de la barra de receta
  // ("Lanzar Lote"); "Lanzar Producción de Lote (…)" solo existe con Calcular encendido.
  await page.getByRole('button', { name: /^(?:🚀\s*)?Lanzar Lote$/ }).click();
  const modal = page.getByTestId('prod-launch-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Carbonato de calcio');
  await modal.getByRole('button', { name: /Lanzar/ }).last().click();
  const state = await page.evaluate(() => ({
    lotes: JSON.parse(localStorage.getItem('sdp_lotes')),
    ops: JSON.parse(localStorage.getItem('sdp_inventory_ops')),
    bit: JSON.parse(localStorage.getItem('sdp_bit_lotes')),
  }));
  expect(state.ops).toHaveLength(1);
  const op = state.ops[0];
  const paja = op.allocations.find(a => a.lotId === 'lp1');
  const cal = op.allocations.find(a => a.lotId === 'lc1');
  expect(cal.quantity).toBeLessThan(1);
  expect(state.lotes.find(l => l.id === 'lp1').cantidadKgDisponible).toBeCloseTo(50 - paja.quantity, 3);
  expect(state.lotes.find(l => l.id === 'lc1').cantidadKgDisponible).toBeCloseTo(5 - cal.quantity, 3);
  const lote = state.bit.find(l => l.id === op.loteId);
  expect(lote.ingredientLots.map(a => a.lotId).sort()).toEqual(['lc1', 'lp1']);
});
