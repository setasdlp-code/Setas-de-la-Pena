'use strict';

const { test, expect } = require('@playwright/test');

const APP = '/Setas%20OS%20v5.dc.html';

async function openApp(page, init = null) {
  if (init) await page.addInitScript(init);
  await page.goto(APP);
  await expect(page.locator('.app-shell')).toBeVisible();
  await expect(page.locator('.app-rail')).toBeVisible();
}

function workspaceButton(page, key) {
  return page.locator(`[data-workspace="${key}"]`);
}

function selectedContextTab(page) {
  return page.locator('.workspace-subnav [role="tab"][aria-selected="true"]');
}

function contextTab(page, name) {
  return page.locator('.workspace-subnav [role="tab"]', { hasText: name }).first();
}

function breadcrumb(page) {
  return page.locator('main.app-main > div').first().locator('span').first();
}

async function expectWorkspace(page, key, tabLabel) {
  await expect(workspaceButton(page, key)).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-workspace][aria-current="page"]')).toHaveCount(1);
  await expect(selectedContextTab(page)).toHaveCount(1);
  await expect(selectedContextTab(page)).toContainText(tabLabel);
  await expect(breadcrumb(page)).not.toHaveText('');
}

test.describe('desktop navigation contract', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only behavioral suite');
  });

  test('four workspaces keep rail and contextual tab synchronized', async ({ page }) => {
    await openApp(page);

    await workspaceButton(page, 'formular').click();
    await expectWorkspace(page, 'formular', 'Formular');

    await workspaceButton(page, 'produccion').click();
    // Operario entra directamente a Preparar mezcla; roles elevados pueden ver Planificar.
    const selectedProduction = selectedContextTab(page);
    await expect(selectedProduction).toBeVisible();
    await expect(selectedProduction).toContainText(/Preparar mezcla|Planificar/);
    await expect(workspaceButton(page, 'produccion')).toHaveAttribute('aria-current', 'page');

    await workspaceButton(page, 'bitacora').click();
    await expectWorkspace(page, 'bitacora', 'Lotes');

    await workspaceButton(page, 'control').click();
    await expectWorkspace(page, 'control', 'Tablero de Control');
  });

  test('internal React tab changes remain synchronized with shell navigation', async ({ page }) => {
    await openApp(page);

    await workspaceButton(page, 'formular').click();
    await contextTab(page, 'Recetario').click();
    await expectWorkspace(page, 'formular', 'Recetario');

    await contextTab(page, 'Formular').click();
    await expectWorkspace(page, 'formular', 'Formular');

    await workspaceButton(page, 'produccion').click();
    await contextTab(page, 'Bodega').click();
    await expectWorkspace(page, 'produccion', 'Bodega');

    await contextTab(page, 'Preparar mezcla').click();
    await expectWorkspace(page, 'produccion', 'Preparar mezcla');
  });

  test('loading a saved recipe from Recetario lands in Formulador', async ({ page }) => {
    await openApp(page, () => {
      localStorage.setItem('setas_v6', JSON.stringify([
        {
          id: 'e2e-recipe-1',
          name: 'E2E_RECETA_CARGADA',
          sKey: 'p_ostreatus_gris',
          date: '2026-08-19',
          recipe: [
            { id: 'paja_trigo', p: 80 },
            { id: 'salvado_trigo', p: 15 },
            { id: 'yeso', p: 2 },
            { id: 'carbonato_calcio', p: 3 },
          ],
        },
      ]));
    });

    await workspaceButton(page, 'formular').click();
    await contextTab(page, 'Recetario').click();
    await expectWorkspace(page, 'formular', 'Recetario');

    const card = page.locator('.dash-card').filter({ hasText: 'E2E_RECETA_CARGADA' });
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Cargar', exact: true }).click();

    await expectWorkspace(page, 'formular', 'Formular');
    await expect(breadcrumb(page)).toContainText(/Formul/i);
    await expect(selectedContextTab(page)).not.toContainText('Recetario');
  });

  test('repeated hostile navigation sequence does not accumulate stale state', async ({ page }) => {
    await openApp(page);

    for (let pass = 0; pass < 2; pass += 1) {
      await workspaceButton(page, 'formular').click();
      await contextTab(page, 'Recetario').click();
      await expectWorkspace(page, 'formular', 'Recetario');

      await workspaceButton(page, 'produccion').click();
      await contextTab(page, 'Bodega').click();
      await expectWorkspace(page, 'produccion', 'Bodega');

      await workspaceButton(page, 'bitacora').click();
      await expectWorkspace(page, 'bitacora', 'Lotes');

      await workspaceButton(page, 'control').click();
      await expectWorkspace(page, 'control', 'Tablero de Control');

      await workspaceButton(page, 'formular').click();
      await expectWorkspace(page, 'formular', 'Formular');
      await expect(page.locator('body')).not.toContainText(/Cannot read|undefined is not|blank screen/i);
    }
  });

});

test.describe('mobile navigation contract', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', '390px mobile-only suite');
  });

  test('bottom rail has exactly four workspace buttons and no horizontal scroll', async ({ page }) => {
    await openApp(page);

    const rail = page.locator('.app-rail');
    const workspaces = rail.locator('[data-workspace]');
    await expect(workspaces).toHaveCount(4);

    const metrics = await page.evaluate(() => {
      const railEl = document.querySelector('.app-rail');
      const buttons = [...railEl.querySelectorAll('[data-workspace]')];
      return {
        railScrollWidth: railEl.scrollWidth,
        railClientWidth: railEl.clientWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        buttons: buttons.map(b => {
          const r = b.getBoundingClientRect();
          return { left: r.left, right: r.right, width: r.width, top: r.top, bottom: r.bottom };
        }),
      };
    });

    expect(metrics.railScrollWidth).toBeLessThanOrEqual(metrics.railClientWidth + 1);
    expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    for (const r of metrics.buttons) {
      expect(r.width).toBeGreaterThan(0);
      expect(r.left).toBeGreaterThanOrEqual(-1);
      expect(r.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    }
  });

  test('species bridge never overlaps the bottom rail', async ({ page }) => {
    await openApp(page);
    await workspaceButton(page, 'formular').click();
    await contextTab(page, 'Formular').click();

    const bridge = page.locator('.species-bridge');
    await expect(bridge).toBeVisible();
    await page.locator('main.app-main').evaluate(el => { el.scrollTop = el.scrollHeight; });

    const overlap = await page.evaluate(() => {
      const a = document.querySelector('.species-bridge')?.getBoundingClientRect();
      const b = document.querySelector('.app-rail')?.getBoundingClientRect();
      if (!a || !b) return null;
      const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return width * height;
    });

    expect(overlap).not.toBeNull();
    expect(overlap).toBe(0);

    for (const key of ['formular', 'produccion', 'bitacora', 'control']) {
      await workspaceButton(page, key).click();
      await expect(workspaceButton(page, key)).toHaveAttribute('aria-current', 'page');
    }
  });
});
