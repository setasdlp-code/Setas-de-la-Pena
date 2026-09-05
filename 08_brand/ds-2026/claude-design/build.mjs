/**
 * Assemble the Claude Design upload bundle for DS-2026.
 *
 * Mirrors the layout the app already consumes for this brand (see
 * field-os-identity/): a root styles.css whose @import closure covers every
 * token and component sheet, cards one directory deep carrying an @dsCard
 * marker on line 1, and fonts vendored beside them.
 *
 * A rendered design receives ONLY styles.css's transitive @import closure —
 * so anything a card needs must be reachable from that file, not linked
 * separately by the card.
 *
 * Output: ds-bundle/   (derived; regenerate rather than hand-edit)
 * Run: node claude-design/build.mjs
 */
import { mkdir, cp, writeFile, readFile, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(SRC, 'ds-bundle');

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// ── stylesheets ──────────────────────────────────────────────────────────
await mkdir(path.join(OUT, 'tokens'), { recursive: true });
await mkdir(path.join(OUT, 'components'), { recursive: true });
await cp(path.join(SRC, 'tokens/tokens.css'), path.join(OUT, 'tokens/tokens.css'));
await cp(path.join(SRC, 'components/base.css'), path.join(OUT, 'components/base.css'));
await cp(path.join(SRC, 'components/components.css'), path.join(OUT, 'components/components.css'));
await cp(path.join(SRC, 'components/editorial.css'), path.join(OUT, 'components/editorial.css'));

// fonts move from assets/fonts/ to fonts/, so the @font-face srcs must follow
const fonts = await readFile(path.join(SRC, 'tokens/fonts.css'), 'utf8');
await writeFile(path.join(OUT, 'tokens/fonts.css'), fonts.replaceAll('../assets/fonts/', '../fonts/'));

// ── root entry: the whole system reachable from one file ─────────────────
await writeFile(path.join(OUT, 'styles.css'), `/* ─────────────────────────────────────────────────────────────
   Setas de la Peña · DS-2026 — root entry point.
   Import this one file to get fonts, tokens, base layer and every
   component. A rendered design receives exactly this import closure.
   ───────────────────────────────────────────────────────────── */
@import url('./tokens/fonts.css');
@import url('./tokens/tokens.css');
@import url('./components/base.css');
@import url('./components/components.css');
@import url('./components/editorial.css');
`);

// ── assets ───────────────────────────────────────────────────────────────
await cp(path.join(SRC, 'assets/fonts'), path.join(OUT, 'fonts'), { recursive: true });
await cp(path.join(SRC, 'assets/img'), path.join(OUT, 'assets/img'), { recursive: true });
await cp(path.join(SRC, 'assets/icons'), path.join(OUT, 'assets/icons'), { recursive: true });
await cp(path.join(SRC, 'assets/textures'), path.join(OUT, 'assets/textures'), { recursive: true });

// the .jpg is only the regeneration source for the cutout; the bundle ships the cutout
await rm(path.join(OUT, 'assets/img/reishi-botanical-engraving.jpg'), { force: true });

// ── conventions header — what the design agent reads ────────────────────
await cp(path.join(SRC, 'claude-design/README.md'), path.join(OUT, 'README.md'));

// ── cards ────────────────────────────────────────────────────────────────
await cp(path.join(SRC, 'claude-design/cards'), path.join(OUT, 'guidelines'), { recursive: true });

// ── verify every card declares a well-formed @dsCard on line 1 ───────────
const cards = (await readdir(path.join(OUT, 'guidelines'))).filter(f => f.endsWith('.html')).sort();
const problems = [];
const seen = new Map();
for (const f of cards) {
  const first = (await readFile(path.join(OUT, 'guidelines', f), 'utf8')).split('\n')[0];
  const m = first.match(/^<!--\s*@dsCard\s+(.*?)\s*-->$/);
  if (!m) { problems.push(`${f}: line 1 is not an @dsCard marker`); continue; }
  const attrs = Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map(x => [x[1], x[2]]));
  for (const need of ['group', 'viewport', 'name']) {
    if (!attrs[need]) problems.push(`${f}: @dsCard missing ${need}`);
  }
  if (attrs.viewport && !/^\d+x\d+$/.test(attrs.viewport)) problems.push(`${f}: viewport "${attrs.viewport}" must be WxH`);
  if (attrs.name && seen.has(attrs.name)) problems.push(`${f}: duplicate card name "${attrs.name}" (also ${seen.get(attrs.name)})`);
  if (attrs.name) seen.set(attrs.name, f);
  seen.set(f, attrs);
}

const groups = [...new Set(cards.map(f => (seen.get(f) || {}).group).filter(Boolean))];
console.log(`bundle → ds-bundle/`);
console.log(`  ${cards.length} cards in ${groups.length} groups: ${groups.join(', ')}`);
if (problems.length) { console.error('\nCARD PROBLEMS:\n' + problems.map(p => '  ! ' + p).join('\n')); process.exit(1); }
console.log('  every card declares a valid @dsCard marker');
