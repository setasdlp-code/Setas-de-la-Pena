'use strict';

const { test, expect } = require('@playwright/test');

const APP = '/Setas%20OS%20v5.dc.html';

async function openApp(page, init = null) {
  if (init) await page.addInitScript(init);
  await page.goto(APP);
  await expect(page.locator('.app-shell')).toBeVisible();
  await expect(page.locator('.app-rail')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.locator('main.app-main').waitFor({ state: 'visible' });
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
  return page.locator('[data-testid="breadcrumb"]');
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
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.getByRole('button', { name: 'Cargar', exact: true }).click();

    await expectWorkspace(page, 'formular', 'Formular');
    await expect(breadcrumb(page)).toContainText(/Formul/i);
    await expect(selectedContextTab(page)).not.toContainText('Recetario');
  });

  test('Formular keeps species and live recipe evaluation visible before advanced tools', async ({ page }) => {
    await openApp(page, () => localStorage.setItem('sim_preselect_spp', 'p_ostreatus_gris'));
    await workspaceButton(page, 'formular').click();
    await contextTab(page, 'Formular').click();

    const species = page.locator('.form-species-context');
    const liveSummary = page.locator('.sim-live-dashboard');
    const recipe = page.locator('#bl-receta');
    const evaluation = page.locator('#recipe-live-evaluation');
    const summary = page.locator('#bl-receta-summary');
    const ingredients = page.locator('#bl-ingredientes');
    const advanced = page.locator('.form-advanced-tools-head');

    await expect(species).toBeVisible();
    await expect(species).toContainText('Orellana Gris');
    // Before any ingredient is added, the sticky bar is the single "Receta activa" home —
    // it stays visible (no longer disappears) and shows the empty-state prompt.
    await expect(liveSummary).toBeVisible();
    await expect(recipe).toBeVisible();
    await expect(recipe).toContainText('Sin ingredientes aún');
    await expect(evaluation).toBeVisible();
    await expect(evaluation).toContainText('Evaluación en vivo');
    // The score/gauges/batch summary panel only renders once a recipe exists.
    await expect(summary).toBeHidden();
    await expect(advanced).toContainText('Perito + Automejora');

    const layoutBefore = await page.evaluate(() => {
      const rect = sel => document.querySelector(sel).getBoundingClientRect();
      const e = rect('#recipe-live-evaluation');
      const i = rect('#bl-ingredientes');
      const a = rect('.form-advanced-tools-head');
      return { evaluationTop:e.top, ingredientsTop:i.top, advancedTop:a.top };
    });
    expect(layoutBefore.ingredientsTop).toBeGreaterThan(layoutBefore.evaluationTop);
    expect(layoutBefore.advancedTop).toBeGreaterThan(layoutBefore.ingredientsTop);

    await page.getByRole('button', { name: 'Agregar Paja de trigo a la receta', exact: true }).click();
    await expect(liveSummary).toBeVisible();
    await expect(liveSummary).toContainText('Paja de trigo');
    // Editing lives only in the sticky tray now — the summary panel below has no row list.
    await expect(recipe).toContainText('Paja de trigo');
    await expect(summary).toBeVisible();
    await expect(summary).not.toContainText('Paja de trigo');

    // The score/gauges panel keeps its two-column layout alongside RecipeGauges.
    const layoutAfter = await page.evaluate(() => {
      const rect = sel => document.querySelector(sel).getBoundingClientRect();
      const s = rect('#bl-receta-summary');
      const e = rect('#recipe-live-evaluation');
      return { summaryTop:s.top, evaluationTop:e.top, summaryLeft:s.left, evaluationLeft:e.left };
    });
    expect(Math.abs(layoutAfter.summaryTop-layoutAfter.evaluationTop)).toBeLessThan(3);
    expect(layoutAfter.evaluationLeft).toBeGreaterThan(layoutAfter.summaryLeft);

    await page.locator('main.app-main').evaluate(el => { el.scrollTop = el.scrollHeight / 2; });
    const sticky = await liveSummary.evaluate(el => {
      const r = el.getBoundingClientRect();
      return { top:r.top, bottom:r.bottom, viewport:window.innerHeight };
    });
    expect(sticky.top).toBeGreaterThanOrEqual(120);
    expect(sticky.bottom).toBeLessThan(sticky.viewport);
  });

  test('ingredient groups use the workspace scroll and collapse independently', async ({ page }) => {
    test.setTimeout(45000);
    await openApp(page);
    await workspaceButton(page, 'formular').click();
    await contextTab(page, 'Formular').click();
    await page.getByRole('button', { name: 'Paleta completa', exact: true }).click();

    const list = page.locator('#bl-ingredientes .ing-list');
    await expect(list).toBeVisible();
    const scrollContract = await list.evaluate(el => {
      const style = getComputedStyle(el);
      const left = el.closest('.builder-left');
      return {
        listOverflowY: style.overflowY,
        listMaxHeight: style.maxHeight,
        listClientHeight: el.clientHeight,
        listScrollHeight: el.scrollHeight,
        leftOverflowY: left ? getComputedStyle(left).overflowY : null,
      };
    });
    expect(scrollContract.listOverflowY).toBe('visible');
    expect(scrollContract.listMaxHeight).toBe('none');
    expect(scrollContract.listScrollHeight).toBeLessThanOrEqual(scrollContract.listClientHeight + 1);
    expect(scrollContract.leftOverflowY).toBe('visible');

    const headers = page.locator('.role-group-hdr');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(4);
    const first = headers.nth(0);
    const second = headers.nth(1);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'true');

    await first.click();
    await expect(first).toBeVisible();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(second).toHaveAttribute('aria-expanded', 'true');

    await second.click();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(headers).toHaveCount(headerCount);

    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
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

  test('Formular omits the species bridge and remaining bridges never overlap the bottom rail', async ({ page }) => {
    await openApp(page);
    await workspaceButton(page, 'formular').click();
    await contextTab(page, 'Formular').click();

    const bridge = page.locator('.species-bridge');
    await expect(bridge).toHaveCount(0);

    await contextTab(page, 'Recetario').click();
    await expect(bridge).toBeVisible();
    await page.locator('.species-bridge').waitFor({ state: 'visible', timeout: 10000 });
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
