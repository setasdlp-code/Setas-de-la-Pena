/**
 * Swiss Botanical · Mockup Renderer (Playwright)
 * Serves mockups over a local HTTP server and captures desktop & mobile PNGs.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
      'playwright',
      path.resolve(ROOT, '../../field-os-simulador/setas-os/node_modules/playwright'),
      path.resolve(process.env.HOME || '', '.npm-global/lib/node_modules/playwright')
    ];
    for (const p of candidatePaths) {
      try {
        const mod = await import(p);
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
    return;
  }

  const server = createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404).end('Not found'); return; }
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

  const browser = await chromium.launch();
  for (const job of manifest) {
    const page = await browser.newPage({
      viewport: { width: job.width, height: job.height },
      deviceScaleFactor: job.scale || 2
    });
    const url = `${base}/${job.url}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    const outPath = path.join(outDir, `${job.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`[RENDERIZADO] -> ${job.name}.png (${job.width}x${job.height} @${job.scale || 2}x)`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log("Renderizado completo en mockups/out/");
}

run().catch(e => {
  console.error("Error durante el renderizado:", e);
});
