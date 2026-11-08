'use strict';

const { expect } = require('@playwright/test');

// The expert workspace in sim.css places selection beside review on desktop,
// then stacks both panels at the mobile breakpoint. Do not compare the Y
// position of an ingredient panel with content nested inside the other column.
async function expectDesktopWorkspace(page) {
  const layout = await page.evaluate(() => {
    const rect = selector => {
      const { left, right, top, bottom } = document.querySelector(selector).getBoundingClientRect();
      return { left, right, top, bottom };
    };
    return {
      workspace: rect('.form-recipe-workspace'),
      ingredients: rect('.form-recipe-workspace > .builder-left'),
      review: rect('#formulator-review'),
      evaluation: rect('#recipe-live-evaluation'),
    };
  });
  expect(layout.ingredients.right).toBeLessThanOrEqual(layout.review.left);
  expect(layout.review.right).toBeLessThanOrEqual(layout.workspace.right + 1);
  expect(layout.review.top).toBeLessThan(layout.evaluation.top);
  expect(layout.evaluation.left).toBeGreaterThanOrEqual(layout.review.left);
  expect(layout.evaluation.right).toBeLessThanOrEqual(layout.review.right);
  await expect(page.locator('#formulator-review #recipe-live-evaluation')).toHaveCount(1);
}

async function expectDesktopIngredientScroll(page) {
  const sidebar = page.locator('.form-recipe-workspace > .builder-left');
  const list = page.locator('#bl-ingredientes .ing-list');
  const metrics = await sidebar.evaluate(el => ({
    position: getComputedStyle(el).position,
    overflowY: getComputedStyle(el).overflowY,
    clientHeight: el.clientHeight,
    scrollHeight: el.scrollHeight,
    viewportHeight: innerHeight,
  }));
  expect(metrics.position).toBe('sticky');
  expect(metrics.overflowY).toBe('auto');
  expect(metrics.clientHeight).toBeLessThan(metrics.viewportHeight);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  const inner = await list.evaluate(el => ({
    overflowY: getComputedStyle(el).overflowY,
    maxHeight: getComputedStyle(el).maxHeight,
    clientHeight: el.clientHeight,
    scrollHeight: el.scrollHeight,
  }));
  expect(inner.overflowY).toBe('visible');
  expect(inner.maxHeight).toBe('none');
  expect(inner.scrollHeight).toBeLessThanOrEqual(inner.clientHeight + 1);
  await sidebar.evaluate(el => { el.scrollTop = 0; });
  await sidebar.hover();
  await page.mouse.wheel(0, 900);
  await expect.poll(() => sidebar.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect.poll(() => list.evaluate(el => el.scrollTop)).toBe(0);
  const lastGroup = page.locator('.role-group-hdr').last();
  await lastGroup.scrollIntoViewIfNeeded();
  await expect(lastGroup).toBeInViewport();
}

async function expectMobileWorkspace(page) {
  const layout = await page.evaluate(() => {
    const side = document.querySelector('.form-recipe-workspace > .builder-left');
    const review = document.querySelector('#formulator-review');
    return {
      sidebarBottom: side.getBoundingClientRect().bottom,
      reviewTop: review.getBoundingClientRect().top,
      position: getComputedStyle(side).position,
      overflowY: getComputedStyle(side).overflowY,
      maxHeight: getComputedStyle(side).maxHeight,
      contentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
    };
  });
  expect(layout.reviewTop).toBeGreaterThanOrEqual(layout.sidebarBottom);
  expect(layout.position).toBe('static');
  expect(layout.overflowY).toBe('visible');
  expect(layout.maxHeight).toBe('none');
  expect(layout.contentWidth).toBeLessThanOrEqual(layout.viewportWidth);
}

module.exports = { expectDesktopWorkspace, expectDesktopIngredientScroll, expectMobileWorkspace };
