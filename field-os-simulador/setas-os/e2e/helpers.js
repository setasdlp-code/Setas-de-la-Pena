'use strict';

const APP_PATH = '/Setas%20OS%20v5.dc.html';

/** @param {import('@playwright/test').Page} page */
async function openApp(page) {
  await page.goto(APP_PATH);
  await page.locator('.rail-btn[data-workspace]').first().waitFor();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'formular'|'produccion'|'bitacora'|'control'} workspace
 */
async function goWorkspace(page, workspace) {
  await page.locator(`.rail-btn[data-workspace="${workspace}"]`).click();
}

/** @param {import('@playwright/test').Page} page */
async function activeWorkspace(page) {
  return page.locator('.rail-btn[data-workspace][aria-current="page"]').getAttribute('data-workspace');
}

/** @param {import('@playwright/test').Page} page */
async function breadcrumbText(page) {
  const candidates = page.locator('.topbar-crumb, [class*="crumb"]');
  if (await candidates.count()) return (await candidates.first().textContent())?.trim();
  // Fallback: primer texto corto en la esquina superior del header, según lo observado en vivo.
  return null;
}

/** @param {import('@playwright/test').Page} page */
async function activeContextTab(page) {
  const active = page.locator('[role="tab"][aria-selected="true"]');
  if (!(await active.count())) return null;
  return (await active.first().textContent())?.trim();
}

/**
 * Escribe datos en localStorage ANTES de que la app monte (via addInitScript),
 * para que los useEffect de carga inicial (setas_v6, sdp_bit_lotes, etc.) los
 * encuentren ya puestos. Debe llamarse antes de openApp().
 * @param {import('@playwright/test').Page} page
 * @param {Record<string, any>} data - clave de localStorage -> valor (se serializa a JSON)
 */
async function seedLocalStorage(page, data) {
  await page.addInitScript((entries) => {
    for (const [k, v] of entries) {
      window.localStorage.setItem(k, JSON.stringify(v));
    }
  }, Object.entries(data));
}

/**
 * Cierra el ConfirmDlg genérico de la app (reemplazo de window.confirm) si
 * está visible — p.ej. "Reemplazar receta activa" al cargar una receta con
 * cambios sin guardar. No falla si no aparece.
 * @param {import('@playwright/test').Page} page
 */
async function confirmDialogIfPresent(page, label = 'Confirmar') {
  const modal = page.locator('.inv-modal-bg');
  try {
    await modal.waitFor({ state: 'visible', timeout: 3000 });
  } catch {
    return; // no apareció — no había receta activa sin guardar, sigue de largo.
  }
  await modal.getByRole('button', { name: label, exact: true }).click();
  await modal.waitFor({ state: 'hidden', timeout: 3000 });
}

/** Selecciona una especie desde el contexto persistente del Formulador. */
async function selectSpecies(page, sKey) {
  await page.locator('#form-species-context-select').selectOption(sKey);
}

/** Busca un ingrediente por nombre en el catálogo del Formulador y lo agrega a la receta activa. */
async function addIngredientByName(page, name) {
  await page.locator('.search').fill(name);
  await page.getByRole('button', { name: `Agregar ${name} a la receta`, exact: true }).click();
  await page.locator('.search').fill('');
}

/** Fija el porcentaje exacto de un ingrediente ya agregado a la receta (buscado por nombre visible, no hay id en el DOM). */
async function setIngredientPct(page, ingredientName, pct) {
  await page.locator('.rec-row', { hasText: ingredientName }).locator('input.rec-pct-input').fill(String(pct));
}

/** Lee el porcentaje actual mostrado para un ingrediente ya agregado a la receta. */
async function getIngredientPct(page, ingredientName) {
  return page.locator('.rec-row', { hasText: ingredientName }).locator('input.rec-pct-input').inputValue();
}

module.exports = {
  APP_PATH,
  openApp,
  goWorkspace,
  activeWorkspace,
  breadcrumbText,
  activeContextTab,
  seedLocalStorage,
  confirmDialogIfPresent,
  selectSpecies,
  addIngredientByName,
  setIngredientPct,
  getIngredientPct,
};
