import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(appDir, 'simulador.html');
const sourceHtmlPath = resolve(appDir, 'src', 'simulador.source.html');
const failures = [];

const requireCondition = (condition, message) => {
  if (!condition) failures.push(message);
};

const requiredFiles = [
  'simulador.html',
  'src/simulador.source.html',
  'src/persistence.js',
  'assets/bootstrap.js',
  'assets/app.min.js',
  'assets/app.min.js.map',
  'assets/persistence.js',
  'assets/tweaks.js',
  'server/server.mjs',
  'server/store.mjs',
  'recipe-sim-v2.css',
  'recipe-recommender.js',
  'ds-bridge.css',
  'fieldos-tokens.css',
  '_standalone_imgs/banner.png'
];

for (const relativePath of requiredFiles) {
  const absolutePath = resolve(appDir, relativePath);
  requireCondition(existsSync(absolutePath), `Falta archivo requerido: ${relativePath}`);
  if (existsSync(absolutePath)) {
    requireCondition(statSync(absolutePath).size > 0, `Archivo vacío: ${relativePath}`);
  }
}

if (!existsSync(htmlPath)) {
  console.error('QUALITY FAIL\n- No existe simulador.html');
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf8');
const sourceHtml = readFileSync(sourceHtmlPath, 'utf8');
const bundle = readFileSync(resolve(appDir, 'assets', 'app.min.js'), 'utf8');

requireCondition(/<html\s+lang="es"/i.test(html), 'El documento debe declarar lang="es".');
requireCondition(/<meta\s+name="viewport"/i.test(html), 'Falta meta viewport.');
requireCondition(/<meta\s+name="description"/i.test(html), 'Falta descripción SEO.');
requireCondition(/class="skip-link"\s+href="#main-content"/.test(html), 'Falta enlace para saltar al contenido.');
requireCondition(/className="wrap"\s+role="main"\s+id="main-content"/.test(sourceHtml), 'Falta landmark principal accesible.');
requireCondition(/aria-label="Módulos principales"/.test(sourceHtml), 'La navegación principal no tiene nombre accesible.');

// El artefacto de producción debe ser completamente local y precompilado.
requireCondition(!/type="text\/babel"/.test(html), 'Producción todavía contiene Babel en navegador.');
requireCondition(
  !/(?:src|href)=["']https?:\/\//i.test(html),
  'Producción todavía contiene dependencias CDN.'
);
requireCondition(!/react\.development|babel\.min|unpkg\.com/.test(html), 'Producción todavía referencia librerías de desarrollo.');
requireCondition(/assets\/app\.min\.js/.test(html), 'Falta el bundle local de la aplicación.');
requireCondition(/assets\/bootstrap\.js/.test(html), 'Falta el bootstrap local de recursos.');
requireCondition(/assets\/persistence\.js/.test(html), 'Falta el cliente de persistencia central.');
requireCondition(!/<script>([\s\S]*?)<\/script>/.test(html), 'Producción todavía contiene scripts inline incompatibles con CSP.');
requireCondition(!/react\.development|jsx-dev-runtime/.test(bundle), 'El bundle contiene React development.');
requireCondition(bundle.length < 1_000_000, 'El bundle minificado supera 1 MB.');

// Invariantes operativas: una regresión aquí puede autorizar una receta riesgosa.
requireCondition(
  /if\(suppOverLimit&&profile\.forceLowRisk\) return;/.test(sourceHtml),
  'Los perfiles de bajo riesgo deben excluir recetas sobre el límite de suplemento.'
);
requireCondition(
  /const status=criticals>0\?'critical':warnings>0\?'good'/.test(sourceHtml),
  'El veredicto debe priorizar problemas críticos y advertencias.'
);
requireCondition(
  /else if\(s\.some\(x=>x\.t==='warning'\)\) main='Receta funcional con ajustes requeridos antes de escalar\.'/.test(sourceHtml),
  'El resumen no debe declarar excelente una receta que conserva advertencias.'
);
requireCondition(
  /disabled=\{status==='critical'\}/.test(sourceHtml),
  'La acción Producir debe quedar deshabilitada ante un veredicto crítico.'
);
requireCondition(
  !sourceHtml.includes("suppP>sp.supplementation_max&&!needsAutoclave"),
  'Reapareció la condición imposible que anulaba la penalización por suplemento.'
);
requireCondition(
  /label:'Suplementación sobre el límite'/.test(sourceHtml),
  'El Perito debe explicar la suplementación sobre el límite.'
);

// Controles esenciales que antes se anunciaban solo como "+", "–", "○" o "✕".
for (const accessiblePattern of [
  /aria-label=\{`Agregar \$\{ing\.name\} a la receta`\}/,
  /aria-label=\{`Quitar \$\{g\.name\} de la receta`\}/,
  /aria-label=\{`Porcentaje de \$\{g\.name\}`\}/,
  /aria-label="Especie objetivo del optimizador"/,
  /aria-label="Costo máximo por kilogramo"/
]) {
  requireCondition(accessiblePattern.test(sourceHtml), `Falta contrato accesible: ${accessiblePattern}`);
}

// Valida referencias locales escritas literalmente. Las expresiones JSX se excluyen.
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
    `Referencia local inexistente: ${reference}`
  );
}

if (failures.length > 0) {
  console.error(`QUALITY FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('QUALITY PASS');
console.log(`- ${requiredFiles.length} archivos esenciales presentes`);
console.log('- referencias locales válidas');
console.log('- bundle local de producción sin Babel, CDN ni React development');
console.log('- persistencia central y guardas operativas presentes');
