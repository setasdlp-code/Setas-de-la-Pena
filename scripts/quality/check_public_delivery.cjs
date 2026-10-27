'use strict';
// Delivery contracts independent of the functional recipe/inquiry suite.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const { chromium } = require(path.join(root, 'field-os-simulador/setas-os/node_modules/@playwright/test'));
const output = process.env.SETAS_EXPORT_AUDIT_DIR;
assert.ok(output, 'SETAS_EXPORT_AUDIT_DIR is required');
const publicDir = process.env.SETAS_EXPORT_DIR || path.join(output, 'public');
const base = process.env.SETAS_EXPORT_BASE_URL || 'http://127.0.0.1:4188/';
const origin = 'https://setas-de-la-pena.pages.dev';
const report = { checks: [], errors: [] };
(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(output,'export-audit.json')));
  const css = fs.readFileSync(path.join(publicDir,manifest.commercialCss),'utf8');
  assert.ok(!/@import\b/.test(css));
  assert.ok(css.trim().split('\n').length <= 2, 'commercial CSS is minified');
  assert.ok(!/Trial Bricolage|Trial Libre|\.ttf|\.otf/.test(css));
  assert.ok(css.includes('.woff2'));
  for (const item of manifest.files.filter(i=>i.file.startsWith('_assets/'))) {
    assert.match(item.file,/\.[a-f0-9]{12}\./);
    assert.ok(item.sha256.startsWith(item.file.match(/\.([a-f0-9]{12})\./)[1]));
  }
  const png = fs.readFileSync(path.join(publicDir,'assets/social/setas-de-la-pena.png'));
  assert.equal(png.readUInt32BE(16),1200); assert.equal(png.readUInt32BE(20),630);
  report.checks.push({type:'minified-css-woff2-content-hashes-social',result:'passed'});
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const context = await browser.newContext({reducedMotion:'reduce'});
    const page = await context.newPage();
    page.on('pageerror',e=>report.errors.push(e.message));
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      for (const route of ['home','setas','cocina','restaurantes','mundo-micelar','shiitake','recetas','recetas-eryngii','recetas-melena','especies/shiitake','especies/melena-de-leon','especies/eryngii']) {
        const requests=[];
        const listener=request=>requests.push(request.url());
        page.on('request',listener);
        await page.goto(base+route+'?pairing=bricolage',{waitUntil:'networkidle'});
        await page.evaluate(()=>document.fonts.ready);
        page.off('request',listener);
        assert.equal(await page.locator('html').getAttribute('data-pairing'),'mono');
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),origin+'/'+route);
        assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'),origin+'/'+route);
        assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute('content'),'summary_large_image');
        const ogImage=await page.locator('meta[property="og:image"]').getAttribute('content');
        assert.equal(ogImage,origin+'/assets/social/setas-de-la-pena.png');
        const organization=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
        assert.equal(organization['@type'],route.startsWith('especies/')?'Article':'Organization');
        assert.ok(!['telephone','email','offers','openingHours','address'].some(k=>k in organization));
        assert.equal(await page.locator('link[rel=stylesheet]').count(),1);
        assert.ok(!requests.some(url=>/typography-trials|Bricolage|LibreBaskerville/.test(url)));
        assert.deepEqual(await page.locator('a[href]').evaluateAll(nodes=>nodes.filter(a=>a.origin===location.origin && /\/(?:home|index|shiitake|recetas)\.html$/.test(a.pathname)).map(a=>a.href)),[]);
        const tiny=await page.locator('.t-label,.t-micro,label,.origin-emblem,.card-meta,.footer-bottom').evaluateAll(nodes=>nodes.filter(el=>el.getClientRects().length && getComputedStyle(el).visibility!=='hidden' && parseFloat(getComputedStyle(el).fontSize)<12).map(el=>({text:el.textContent,size:getComputedStyle(el).fontSize})));
        assert.deepEqual(tiny,[],`${route} labels at ${width}`);
        assert.equal(await page.locator('img[srcset]').count(),await page.locator('img').count());
        assert.ok(await page.evaluate(()=>[...document.images].every(i=>i.getAttribute('sizes'))));
        report.checks.push({type:'metadata-type-links-labels-responsive-images',route,width,result:'passed'});
      }
    }
    await page.goto(base+'setas#coleccion');
    const opener=page.locator('.specimen-button[data-species="shiitake"]');
    await opener.focus(); await page.keyboard.press('Enter');
    const dialog=page.locator('#species-dialog');
    assert.equal(await dialog.getAttribute('aria-describedby'),'dialog-description');
    assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('dialog-close')),true);
    for(let i=0;i<12;i++) { await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>document.activeElement.closest('dialog')?.id),'species-dialog'); }
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.species),'shiitake');
    for (const [key, image] of [['melena', 'lions-mane'], ['eryngii', 'cardo']]) {
      await page.locator(`.specimen-button[data-species="${key}"]`).click();
      await page.locator('#dialog-image').evaluate(i=>i.decode());
      assert.match(await page.locator('#dialog-image').getAttribute('src'),new RegExp(image+'.*\\.webp$'));
      assert.ok((await page.locator('#dialog-image').getAttribute('srcset')).includes('320w'));
      assert.equal(await page.locator('#dialog-order').isVisible(),false);
      await page.keyboard.press('Escape');
    }
    report.checks.push({type:'keyboard-dialog-focus-responsive-dynamic-images',result:'passed'});
    for (const [route,status,type] of [['nonexistent-audit-page',404,'text/html'],['nested/missing/page',404,'text/html'],['robots.txt',200,'text/plain'],['sitemap.xml',200,'application/xml']]) {
      const response=await context.request.get(base+route);
      assert.equal(response.status(),status,route);
      assert.ok(response.headers()['content-type'].includes(type) || (route==='sitemap.xml' && response.headers()['content-type'].includes('text/xml')));
      if(status===404) assert.match(await response.text(),/No encontramos esta página/);
      assert.equal(response.headers()['x-robots-tag'],'noindex, nofollow');
    }
    for (const retired of ['proyecto', 'proyecto.html']) {
      const response = await context.request.get(base + retired + '?pairing=bricolage', {maxRedirects: 0});
      assert.equal(response.status(), 301);
      assert.equal(response.headers().location, '/home?pairing=bricolage');
    }
    assert.ok(!manifest.routes['/proyecto']);
    assert.ok(!manifest.files.some(item => item.file === 'proyecto.html'));
    report.checks.push({type:'retired-project-redirects',result:'passed'});
    const htmlResponse=await context.request.get(base+'home');
    assert.ok(!htmlResponse.headers()['cache-control'].includes('immutable'));
    const assetResponse=await context.request.get(base+manifest.commercialCss.replace(/^\//,''));
    assert.match(assetResponse.headers()['cache-control'],/31536000.*immutable/);
    report.checks.push({type:'static-404-discovery-and-cache',result:'passed',note:'Local server contracts; repeat against actual Cloudflare after deployment.'});
    assert.deepEqual(report.errors,[]);
    fs.writeFileSync(path.join(output,'delivery-verification.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({result:'passed',checks:report.checks.length,errors:report.errors.length}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
