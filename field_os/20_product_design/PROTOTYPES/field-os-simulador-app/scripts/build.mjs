import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const persistenceSourcePath = resolve(appDir, 'src', 'persistence.js');
const assetsDir = resolve(appDir, 'assets');

const TARGETS = [
  { name: 'simulador', sourcePath: resolve(appDir, 'src', 'simulador.source.html'), outputHtmlPath: resolve(appDir, 'simulador.html'), requireInline: true },
  { name: 'sesion', sourcePath: resolve(appDir, 'src', 'sesion.source.html'), outputHtmlPath: resolve(appDir, 'sesion.html'), requireInline: false }
];

await mkdir(assetsDir, { recursive: true });
await copyFile(persistenceSourcePath, resolve(assetsDir, 'persistence.js'));

const buildTarget = async ({ name, sourcePath, outputHtmlPath, requireInline }) => {
  const sourceHtml = await readFile(sourcePath, 'utf8');
  const babelBlocks = [...sourceHtml.matchAll(/<script type="text\/babel">([\s\S]*?)<\/script>/g)];
  const inlineBlocks = [...sourceHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];

  if (babelBlocks.length !== 2) {
    throw new Error(`[${name}] Se esperaban 2 bloques Babel y se encontraron ${babelBlocks.length}.`);
  }
  if (requireInline && inlineBlocks.length === 0) {
    throw new Error(`[${name}] Se esperaba al menos un bloque inline para generar bootstrap.js.`);
  }

  const appSource = babelBlocks[0][1].replace(/\blocalStorage\b/g, 'window.FieldStore');
  const tweaksSource = babelBlocks[1][1];

  const entry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
const ReactDOM = { createRoot };
window.React = React;

(async () => {
  await window.FieldStore.ready;
  ${appSource}
  window.dispatchEvent(new Event('field-os:ready'));
})().catch((error) => {
  console.error('No fue posible iniciar Field OS.', error);
  const root = document.getElementById('root');
  if (root) root.innerHTML = '<div style="padding:24px;font-family:sans-serif">No fue posible iniciar Field OS. Revisa la conexión con el servidor de datos.</div>';
});
`;

  await build({
    stdin: {
      contents: entry,
      loader: 'jsx',
      resolveDir: appDir,
      sourcefile: `${name}-app.jsx`
    },
    outfile: resolve(assetsDir, `${name}.app.min.js`),
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['es2020'],
    platform: 'browser',
    format: 'iife',
    legalComments: 'none',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  const wrappedTweaks = `
window.addEventListener('field-os:ready', () => {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ${tweaksSource}
  }));
}, { once: true });
`;

  await writeFile(resolve(assetsDir, `${name}.tweaks.js`), wrappedTweaks.trimStart(), 'utf8');
  if (inlineBlocks.length > 0) {
    await writeFile(
      resolve(assetsDir, `${name}.bootstrap.js`),
      inlineBlocks.map((block) => block[1].trim()).filter(Boolean).join('\n\n'),
      'utf8'
    );
  }

  let productionHtml = sourceHtml
    .replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g, '')
    .replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/g, '')
    .replace(/<script src="https:\/\/unpkg\.com\/lucide[^\n]*<\/script>\s*/g, '')
    .replace(/<script src="https:\/\/unpkg\.com\/react@[^\n]*<\/script>\s*/g, '')
    .replace(/<script src="https:\/\/unpkg\.com\/react-dom@[^\n]*<\/script>\s*/g, '')
    .replace(/<script src="https:\/\/unpkg\.com\/@babel[^\n]*<\/script>\s*/g, '')
    .replace(/<script src="recipe-recommender\.js"><\/script>\s*/g, '')
    .replace(
      babelBlocks[0][0],
      `<script src="assets/persistence.js"></script>\n<script defer src="assets/${name}.app.min.js"></script>`
    )
    .replace(babelBlocks[1][0], `<script defer src="assets/${name}.tweaks.js"></script>`)
    .replace(
      '</head>',
      '<meta name="generator" content="Field OS production build">\n</head>'
    );

  for (const [index, block] of inlineBlocks.entries()) {
    productionHtml = productionHtml.replace(
      block[0],
      index === 0 ? `<script src="assets/${name}.bootstrap.js"></script>` : ''
    );
  }

  await writeFile(outputHtmlPath, productionHtml, 'utf8');
  console.log(`BUILD PASS — ${name}`);
};

for (const target of TARGETS) {
  await buildTarget(target);
}

console.log('- JSX precompilado y minificado para todos los módulos');
console.log('- React production incluido en assets/*.app.min.js');
console.log('- HTML de producción libre de Babel y CDN');
