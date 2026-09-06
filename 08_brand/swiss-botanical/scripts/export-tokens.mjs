import { readFile, readdir, writeFile } from 'node:fs/promises';
const root = new URL('../tokens/', import.meta.url);
const tokens = {};
for (const file of (await readdir(root)).filter(f => f.endsWith('.css')).sort()) {
  const css = (await readFile(new URL(file, root), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, name, value] of css.matchAll(/(--sb-[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] ??= value.trim();
  }
}
await writeFile(new URL('tokens.json', root), JSON.stringify({
  source: 'Generated from base CSS declarations; reduced-motion overrides remain in CSS.', tokens
}, null, 2) + '\n');
