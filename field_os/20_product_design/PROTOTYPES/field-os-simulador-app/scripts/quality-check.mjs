import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const requireCondition = (condition, message) => {
  if (!condition) failures.push(message);
};

const requiredFiles = [
  'simulador.html',
  'sesion.html',
  'src/simulador.source.html',
  'src/sesion.source.html',
  'src/persistence.js',
  'assets/simulador.bootstrap.js',
  'assets/simulador.app.min.js',
  'assets/simulador.app.min.js.map',
  'assets/sesion.app.min.js',
  'assets/sesion.app.min.js.map',
  'assets/persistence.js',
  'assets/simulador.tweaks.js',
  'assets/sesion.tweaks.js',
  'server/server.mjs',
  'server/store.mjs',
  'server/ledger-store.mjs',
  'server/photo-store.mjs',
  'server/inventory-store.mjs',
  'recipe-sim-v2.css',
  'recipe-recommender.js',
  'ds-bridge.css',
  'fieldos-tokens.css',
  'sesion.css',
  '_standalone_imgs/banner.png'
];

for (const relativePath of requiredFiles) {
  const absolutePath = resolve(appDir, relativePath);
  requireCondition(existsSync(absolutePath), `Falta archivo requerido: ${relativePath}`);
  if (existsSync(absolutePath)) {
    requireCondition(statSync(absolutePath).size > 0, `Archivo vacío: ${relativePath}`);
  }
}

if (failures.length > 0) {
  console.error(`QUALITY FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

// ---- Generic per-module production checks ---------------------------------

const MODULES = [
  { name: 'simulador', htmlPath: 'simulador.html', bundlePath: 'assets/simulador.app.min.js', bootstrapRef: 'assets/simulador.bootstrap.js' },
  { name: 'sesion', htmlPath: 'sesion.html', bundlePath: 'assets/sesion.app.min.js', bootstrapRef: null }
];

for (const mod of MODULES) {
  const html = readFileSync(resolve(appDir, mod.htmlPath), 'utf8');
  const bundle = readFileSync(resolve(appDir, mod.bundlePath), 'utf8');

  requireCondition(/<html\s+lang="es"/i.test(html), `[${mod.name}] El documento debe declarar lang="es".`);
  requireCondition(/<meta\s+name="viewport"/i.test(html), `[${mod.name}] Falta meta viewport.`);
  requireCondition(/<meta\s+name="description"/i.test(html), `[${mod.name}] Falta descripción SEO.`);
  requireCondition(/class="skip-link"\s+href="#main-content"/.test(html), `[${mod.name}] Falta enlace para saltar al contenido.`);

  requireCondition(!/type="text\/babel"/.test(html), `[${mod.name}] Producción todavía contiene Babel en navegador.`);
  requireCondition(!/(?:src|href)=["']https?:\/\//i.test(html), `[${mod.name}] Producción todavía contiene dependencias CDN.`);
  requireCondition(!/react\.development|babel\.min|unpkg\.com/.test(html), `[${mod.name}] Producción todavía referencia librerías de desarrollo.`);
  requireCondition(new RegExp(`assets/${mod.name}\\.app\\.min\\.js`).test(html), `[${mod.name}] Falta el bundle local de la aplicación.`);
  requireCondition(/assets\/persistence\.js/.test(html), `[${mod.name}] Falta el cliente de persistencia central.`);
  if (mod.bootstrapRef) {
    requireCondition(html.includes(mod.bootstrapRef), `[${mod.name}] Falta el bootstrap local de recursos.`);
  }
  requireCondition(!/<script>([\s\S]*?)<\/script>/.test(html), `[${mod.name}] Producción todavía contiene scripts inline incompatibles con CSP.`);
  requireCondition(!/react\.development|jsx-dev-runtime/.test(bundle), `[${mod.name}] El bundle contiene React development.`);
  requireCondition(bundle.length < 1_000_000, `[${mod.name}] El bundle minificado supera 1 MB.`);

  const referencePattern = /\b(?:src|href)=["']([^"']+)["']/g;
  for (const match of html.matchAll(referencePattern)) {
    const reference = match[1];
    if (
      reference.startsWith('http://') ||
      reference.startsWith('https://') ||
      reference.startsWith('#') ||
      reference.startsWith('data:') ||
      reference.startsWith('blob:')
    ) continue;
    const cleanReference = reference.split(/[?#]/)[0];
    requireCondition(
      existsSync(resolve(appDir, cleanReference)),
      `[${mod.name}] Referencia local inexistente: ${reference}`
    );
  }
}

// ---- Simulador-specific accessibility + operational invariants -------------

const simuladorSourceHtml = readFileSync(resolve(appDir, 'src/simulador.source.html'), 'utf8');

requireCondition(/className="wrap"\s+role="main"\s+id="main-content"/.test(simuladorSourceHtml), 'Falta landmark principal accesible (simulador).');
requireCondition(/aria-label="Módulos principales"/.test(simuladorSourceHtml), 'La navegación principal no tiene nombre accesible (simulador).');

requireCondition(
  /if\(suppOverLimit&&profile\.forceLowRisk\) return;/.test(simuladorSourceHtml),
  'Los perfiles de bajo riesgo deben excluir recetas sobre el límite de suplemento.'
);
requireCondition(
  /const status=criticals>0\?'critical':warnings>0\?'good'/.test(simuladorSourceHtml),
  'El veredicto debe priorizar problemas críticos y advertencias.'
);
requireCondition(
  /else if\(s\.some\(x=>x\.t==='warning'\)\) main='Receta funcional con ajustes requeridos antes de escalar\.'/.test(simuladorSourceHtml),
  'El resumen no debe declarar excelente una receta que conserva advertencias.'
);
requireCondition(
  /disabled=\{status==='critical'\}/.test(simuladorSourceHtml),
  'La acción Producir debe quedar deshabilitada ante un veredicto crítico.'
);
requireCondition(
  !simuladorSourceHtml.includes("suppP>sp.supplementation_max&&!needsAutoclave"),
  'Reapareció la condición imposible que anulaba la penalización por suplemento.'
);
requireCondition(
  /label:'Suplementación sobre el límite'/.test(simuladorSourceHtml),
  'El Perito debe explicar la suplementación sobre el límite.'
);

for (const accessiblePattern of [
  /aria-label=\{`Agregar \$\{ing\.name\} a la receta`\}/,
  /aria-label=\{`Quitar \$\{g\.name\} de la receta`\}/,
  /aria-label=\{`Porcentaje de \$\{g\.name\}`\}/,
  /aria-label="Especie objetivo del optimizador"/,
  /aria-label="Costo máximo por kilogramo"/
]) {
  requireCondition(accessiblePattern.test(simuladorSourceHtml), `Falta contrato accesible: ${accessiblePattern}`);
}

// ---- Sesión-specific accessibility + ledger invariants ---------------------

const sesionSourceHtml = readFileSync(resolve(appDir, 'src/sesion.source.html'), 'utf8');

requireCondition(/role="main"\s+id="main-content"/.test(sesionSourceHtml), 'Falta landmark principal accesible (sesión).');
requireCondition(/aria-label="Pantallas de sesión"/.test(sesionSourceHtml), 'La navegación de sesión no tiene nombre accesible.');
requireCondition(
  /causa_raiz: subtype === 'contaminacion' \? causaRaiz\.trim\(\) : null/.test(sesionSourceHtml),
  'La causa raíz de contaminación debe seguir siendo obligatoria antes de enviar.'
);
requireCondition(
  /if \(subtype === 'contaminacion' && !causaRaiz\.trim\(\)\) return;/.test(sesionSourceHtml),
  'El evento rápido de contaminación debe bloquear el envío sin causa raíz.'
);
requireCondition(
  !/localStorage/.test(sesionSourceHtml.replace(/window\.FieldStore/g, '')),
  'La sesión debe usar el store central, no localStorage directo.'
);
requireCondition(
  /await append\('anulacion', \{ ref_event_id: eventId \}/.test(sesionSourceHtml),
  'Deshacer debe registrar un evento de anulación, nunca borrar o reescribir el original.'
);

if (failures.length > 0) {
  console.error(`QUALITY FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('QUALITY PASS');
console.log(`- ${requiredFiles.length} archivos esenciales presentes`);
console.log('- referencias locales válidas en simulador.html y sesion.html');
console.log('- bundles de producción sin Babel, CDN ni React development');
console.log('- persistencia central, ledger append-only y guardas operativas presentes');
