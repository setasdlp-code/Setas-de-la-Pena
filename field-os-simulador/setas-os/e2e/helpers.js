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

module.exports = { APP_PATH, openApp, goWorkspace, activeWorkspace, breadcrumbText, activeContextTab };
