/**
 * Swiss Botanical · Mockup Renderer (Playwright)
 * Serves mockups over a local HTTP server and captures desktop & mobile PNGs.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json',
  '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
};

async function run() {
  console.log("=== Iniciando Renderizador Swiss Botanical ===");

  let chromium;
  try {
    const candidatePaths = [
      process.env.SB_PLAYWRIGHT_PATH,
      'playwright',
      path.resolve(ROOT, '../../field-os-simulador/setas-os/node_modules/playwright'),
      path.resolve(process.env.HOME || '', '.npm-global/lib/node_modules/playwright')
    ].filter(Boolean);
    for (const p of candidatePaths) {
      try {
        const mod = require(p);
        chromium = mod.chromium || mod.default?.chromium;
        if (chromium) {
          console.log(`Playwright cargado exitosamente desde: ${p}`);
          break;
        }
      } catch (_) {}
    }
  } catch (err) {
    console.log("Nota: Buscando módulo Playwright...");
  }

  if (!chromium) {
    console.log("AVISO: Playwright no está disponible en este entorno local.");
    console.log("Los mockups HTML/CSS son 100% autocontenidos y visualizables directamente en el navegador.");
    throw new Error('Playwright requerido para validar renderizados. Usa SB_PLAYWRIGHT_PATH si está instalado en otro checkout.');
  }

  const server = createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT + path.sep) || !existsSync(file)) { res.writeHead(404).end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch (e) { res.writeHead(500).end(String(e)); }
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  console.log(`Servidor de render local activo en: ${base}`);

  const manifest = JSON.parse(await readFile(path.join(ROOT, 'mockups/manifest.json'), 'utf8'));
  const outDir = path.join(ROOT, 'mockups/out');
  await mkdir(outDir, { recursive: true });

  let browser;
  try {
  browser = await chromium.launch();
  for (const job of manifest) {
    const page = await browser.newPage({
      viewport: { width: job.width, height: job.height },
      deviceScaleFactor: job.scale || 2
    });
    const url = `${base}/${job.url}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (const font of ['700 32px "Gaya Patched"', '500 italic 24px "Gaya Patched"', '400 16px "IBM Plex Sans"', '400 14px "IBM Plex Mono"']) {
        const faces = await document.fonts.load(font);
        if (!faces.length || faces.some(f => f.status !== 'loaded')) throw new Error(`Fuente no cargada: ${font}`);
      }
      if ([...document.images].some(i => !i.complete || !i.naturalWidth)) throw new Error('Imagen no cargada');
      if (document.documentElement.scrollWidth > innerWidth + 1) {
        const overflow = [...document.querySelectorAll('main *, header *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map(e => `${e.tagName}.${e.className}: ${e.textContent.trim().slice(0, 45)}`);
        throw new Error(`Desbordamiento horizontal: ${overflow.join('; ')}`);
      }
    });
    const outPath = path.join(outDir, `${job.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`[RENDERIZADO] -> ${job.name}.png (${job.width}x${job.height} @${job.scale || 2}x)`);
    await page.close();
  }

  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Renderizado completo en mockups/out/");
}

run().catch(e => {
  console.error("Error durante el renderizado:", e);
  process.exitCode = 1;
});
