'use strict';
const { test, expect } = require('@playwright/test');
const { openApp, goWorkspace } = require('./helpers.js');

test.use({ viewport: { width: 390, height: 844 } });

// E2E-09 — Mobile 390px: rail inferior de cuatro botones, todos dentro del
// viewport y sin scroll horizontal.
test('mobile 390px: el rail inferior muestra los 4 espacios sin scroll horizontal', async ({ page }) => {
  await openApp(page);

  const buttons = page.locator('.app-rail [data-workspace]');
  await expect(buttons).toHaveCount(4);

  const viewportWidth = 390;
  for (const workspace of ['formular', 'produccion', 'bitacora', 'control']) {
    const btn = page.locator(`.app-rail [data-workspace="${workspace}"]`);
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 1); // +1 tolerancia de subpíxel
  }

  const docScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(docScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);

  const railScrollWidth = await page.locator('.app-rail').evaluate((el) => el.scrollWidth);
  const railClientWidth = await page.locator('.app-rail').evaluate((el) => el.clientWidth);
  expect(railScrollWidth).toBeLessThanOrEqual(railClientWidth + 1);

  for (const workspace of ['produccion', 'bitacora', 'control', 'formular']) {
    await goWorkspace(page, workspace);
    await expect(page.locator(`.app-rail [data-workspace="${workspace}"][aria-current="page"]`)).toHaveCount(1);
  }
});

// E2E-10 — Mobile: la barra de especie (species-bridge) nunca tapa el rail
// de navegación — intersección geométrica debe ser cero, y los 4 botones
// deben seguir respondiendo al clic.
test('mobile: la barra de especie no tapa el rail de navegación', async ({ page }) => {
  await openApp(page);
  await goWorkspace(page, 'formular');

  const bridge = page.locator('[data-testid="species-bridge"]');
  await expect(bridge).toBeVisible();
  const bridgeBox = await bridge.boundingBox();
  const railBox = await page.locator('.app-rail').boundingBox();
  expect(bridgeBox).not.toBeNull();
  expect(railBox).not.toBeNull();

  const overlapX = Math.max(0, Math.min(bridgeBox.x + bridgeBox.width, railBox.x + railBox.width) - Math.max(bridgeBox.x, railBox.x));
  const overlapY = Math.max(0, Math.min(bridgeBox.y + bridgeBox.height, railBox.y + railBox.height) - Math.max(bridgeBox.y, railBox.y));
  expect(overlapX * overlapY).toBe(0);

  for (const workspace of ['produccion', 'bitacora', 'control', 'formular']) {
    await goWorkspace(page, workspace);
    await expect(page.locator(`.app-rail [data-workspace="${workspace}"][aria-current="page"]`)).toHaveCount(1);
  }
});
