// Export landing hero drafts to PNG. Run from the repo root:
//   NODE_PATH=field-os-simulador/setas-os/node_modules node assets/banners/landing-2026-10/export.cjs
const path = require('path');
const { chromium } = require('playwright');

const dir = __dirname;
const pages = ['a-frontispicio', 'b-la-pena', 'c-recorrido'];
const sizes = [[1920, 800], [390, 844]];
// Extra viewports for QA only (not deliverables): --qa writes to qa/.
const qa = process.argv.includes('--qa');
const qaSizes = [[768, 1024], [1024, 768], [1366, 768], [1440, 900], [1920, 1080]];

(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of (qa ? qaSizes : sizes)) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 760 ? 2 : 1 });
    for (const name of pages) {
      await page.goto('file://' + path.join(dir, name + '.html'));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('networkidle');
      const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight + ' ' + f.style));
      const out = path.join(dir, qa ? 'qa' : '', `${name}-${w < 760 ? w + 'w' : w + 'x' + h}.png`);
      // Mobile heroes size to their content, so capture the section itself.
      if (w < 760 || (qa && h > w)) await page.locator('.hero').screenshot({ path: out });
      else await page.screenshot({ path: out });
      console.log(out, '| fonts:', [...new Set(fonts)].join(', '));
    }
    await page.close();
  }
  await browser.close();
})();
