'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const { releaseHash } = require('../release-assets.cjs');
const { stampServiceWorker } = require('../build.js');

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'setas-sw-browser-'));
  const prefix = '/Setas-de-la-Pena/';
  const shell = 'Setas OS v5.dc.html';
  const write = (name, contents) => {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), contents);
  };
  const html = '<!doctype html><link rel="stylesheet" href="sim.css"><div id="value"></div><script src="simulador-app.js"></script><script src="vendor/model.js"></script><script src="runtime-model.js"></script><script>navigator.serviceWorker.register("./sw.js");</script>';
  write(shell, html);
  write('sw.js', fs.readFileSync(path.join(__dirname, '../sw.js')));
  write('simulador-app.js', 'window.renderFixture=()=>{document.querySelector("#value").textContent=[window.MODEL,window.VENDOR,window.EXTRA||"none"].join("/");};');
  write('sim.css', 'body{--release:one}');
  write('runtime-model.js', 'window.MODEL="one";window.renderFixture();');
  write('vendor/model.js', 'window.VENDOR="vendor-one";');
  write('private-deferred.js', 'window.deferred=true;');
  write('vendor/jsQR.js', '// QR boot asset');
  write('error-buffer.js', '// boot errors');
  write('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>');
  write('_standalone_imgs/logo-sdlp.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT5sAAAAASUVORK5CYII=', 'base64'));
  stampServiceWorker(releaseHash(root), root);
  const firstWorker = fs.readFileSync(path.join(root, 'sw.js'));
  stampServiceWorker(releaseHash(root), root);
  assert.deepEqual(fs.readFileSync(path.join(root, 'sw.js')), firstWorker, 'repeat build must be stable');
  let rejectNewAsset = false, deferredRequests = 0;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const name = decodeURIComponent(url.pathname.slice(prefix.length)) || shell;
    if (name === 'private-deferred.js') deferredRequests++;
    const file = path.resolve(root, name);
    if (!url.pathname.startsWith(prefix) || !file.startsWith(root + path.sep) || !fs.existsSync(file) || rejectNewAsset && name === 'added-module.js') { res.writeHead(404); res.end(); return; }
    const types = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.SETAS_CHROMIUM_EXECUTABLE || undefined });
    const context = await browser.newContext();
    let page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}${prefix}${encodeURIComponent(shell)}`;
    await page.goto(url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect(page.locator('#value')).toHaveText('one/vendor-one/none');
    await page.waitForFunction(async () => {
      const names = await caches.keys();
      return (await (await caches.open(names.find(n => n.startsWith('setas-os-')))).match('./simulador-app.js')) != null;
    });
    assert.equal(deferredRequests, 0, 'fresh install must preserve deferred loading');
    await page.evaluate(async () => {
      localStorage.setItem('draft', 'preserved operator draft');
      await (await caches.open('another-app')).put('./unrelated', new Response('keep me'));
    });
    const oldHash = releaseHash(root);
    write('sim.css', 'body{--release:two}');
    write('vendor/model.js', 'window.VENDOR="vendor-two";');
    write('runtime-model.js', 'window.MODEL="two";import("./added-module.js").then(()=>window.renderFixture());');
    write('added-module.js', 'window.EXTRA="added";');
    assert.notEqual(releaseHash(root), oldHash, 'CSS/module/vendor-only upgrade must change version');
    stampServiceWorker(releaseHash(root), root);

    // A missing new asset must reject installation, preserving the old runtime.
    rejectNewAsset = true;
    const failedState = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      const state = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('failed install did not become redundant')), 15000);
        reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        worker.addEventListener('statechange', () => { if (worker.state === 'redundant') { clearTimeout(timer); resolve(worker.state); } });
      }, { once: true });
      });
      await reg.update();
      return state;
    });
    assert.equal(failedState, 'redundant');
    await context.setOffline(true);
    await page.close();
    page = await context.newPage();
    await page.goto(url);
    await expect(page.locator('#value')).toHaveText('one/vendor-one/none');

    // Complete the background upgrade, then close without an online reload.
    await context.setOffline(false);
    rejectNewAsset = false;
    await page.evaluate(async () => {
      const changed = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('complete upgrade did not activate')), 15000);
        navigator.serviceWorker.addEventListener('controllerchange', () => { clearTimeout(timer); resolve(); }, { once: true });
      });
      await (await navigator.serviceWorker.getRegistration()).update();
      await changed;
    });
    await context.setOffline(true);
    await page.close();
    page = await context.newPage();
    await page.goto(url);
    await expect(page.locator('#value')).toHaveText('two/vendor-two/added');
    const state = await page.evaluate(async () => ({
      style: getComputedStyle(document.body).getPropertyValue('--release').trim(),
      draft: localStorage.getItem('draft'),
      caches: await caches.keys(),
      unrelated: await (await (await caches.open('another-app')).match('./unrelated')).text(),
    }));
    assert.equal(state.style, 'two');
    assert.equal(state.draft, 'preserved operator draft');
    assert.equal(state.unrelated, 'keep me');
    assert.equal(state.caches.filter(n => n.startsWith('setas-os-')).length, 1);
    console.log('PASS Pages-subpath upgrade: CSS/module/vendor-only version, failed install retains offline runtime, complete background upgrade reopens offline with a new module, draft and unrelated cache preserved.');
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
