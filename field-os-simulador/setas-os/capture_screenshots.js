const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

function startServer(dir, port = 8089) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.jsx': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let safePath = path.normalize(decodeURIComponent(req.url)).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/') safePath = '/Setas OS v5.dc.html';
    const filePath = path.join(dir, safePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      console.log(`HTTP Server running at http://127.0.0.1:${port}/`);
      resolve(server);
    });
  });
}

async function dismissGate(page) {
  await page.evaluate(() => {
    const gate = document.getElementById('setas-auth-gate');
    if (gate) gate.remove();
    const overlays = document.querySelectorAll('[id*="auth"], [class*="auth-gate"]');
    overlays.forEach(o => o.remove());
  });
  await page.waitForTimeout(300);
}

async function capture() {
  const setasDir = __dirname;
  const outputDirDocs = path.join(__dirname, '../../docs/assets/screenshots');
  const outputDirSetas = path.join(__dirname, 'assets/screenshots');
  fs.mkdirSync(outputDirDocs, { recursive: true });
  fs.mkdirSync(outputDirSetas, { recursive: true });

  const server = await startServer(setasDir, 8089);
  const baseUrl = 'http://127.0.0.1:8089/Setas%20OS%20v5.dc.html';

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  console.log('Navigating to:', baseUrl);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await dismissGate(page);

  // 1. Formular
  console.log('Capturing Formular...');
  await page.click('.rail-btn[data-workspace="formular"]');
  await dismissGate(page);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDirDocs, 'screenshot_formular.png') });
  fs.copyFileSync(path.join(outputDirDocs, 'screenshot_formular.png'), path.join(outputDirSetas, 'screenshot_formular.png'));

  // 2. Control / Home
  console.log('Capturing Control...');
  await page.click('.rail-btn[data-workspace="control"]');
  await dismissGate(page);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDirDocs, 'screenshot_control.png') });
  fs.copyFileSync(path.join(outputDirDocs, 'screenshot_control.png'), path.join(outputDirSetas, 'screenshot_control.png'));

  // 3. Produccion
  console.log('Capturing Produccion...');
  await page.click('.rail-btn[data-workspace="produccion"]');
  await dismissGate(page);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDirDocs, 'screenshot_produccion.png') });
  fs.copyFileSync(path.join(outputDirDocs, 'screenshot_produccion.png'), path.join(outputDirSetas, 'screenshot_produccion.png'));

  // 4. Bitacora
  console.log('Capturing Bitacora...');
  await page.click('.rail-btn[data-workspace="bitacora"]');
  await dismissGate(page);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDirDocs, 'screenshot_bitacora.png') });
  fs.copyFileSync(path.join(outputDirDocs, 'screenshot_bitacora.png'), path.join(outputDirSetas, 'screenshot_bitacora.png'));

  // 5. Mobile View Capture
  console.log('Capturing Mobile View...');
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);
  await dismissGate(mobilePage);
  await mobilePage.click('.rail-btn[data-workspace="formular"]');
  await dismissGate(mobilePage);
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(outputDirDocs, 'screenshot_mobile_home.png') });
  fs.copyFileSync(path.join(outputDirDocs, 'screenshot_mobile_home.png'), path.join(outputDirSetas, 'screenshot_mobile_home.png'));

  await browser.close();
  server.close();
  console.log('Screenshots captured successfully with auth gate dismissed!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
