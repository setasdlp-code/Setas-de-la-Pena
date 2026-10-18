'use strict';
// Compose existing approved illustrations and brand typography; no new photography.
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const { chromium } = require(path.join(root, 'field-os-simulador/setas-os/node_modules/@playwright/test'));
(async () => {
  const server = http.createServer((request, response) => {
    const file = path.resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); return response.end(); }
    response.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf','.otf':'font/otf'})[path.extname(file)] || 'application/octet-stream');
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
    await page.goto(`http://127.0.0.1:${server.address().port}/assets/social/card.html`);
    await page.evaluate(async () => {await document.fonts.ready; await Promise.all([...document.images].map(i=>i.decode()));});
    await page.screenshot({path:path.join(root,'assets/social/setas-de-la-pena.png')});
    console.log('Rendered assets/social/setas-de-la-pena.png: 1200 × 630');
  } finally {await browser.close(); await new Promise(resolve => server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
