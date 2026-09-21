'use strict';
// Extrae declaraciones `const NOMBRE=` de nivel superior de simulador-app.jsx y las
// evalúa juntas, para probar funciones puras del JSX sin cargar React.
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'simulador-app.jsx'), 'utf8');

function sliceDeclaration(name) {
  const re = new RegExp(`(^|\\n)const ${name}\\s*=`);
  const m = re.exec(SRC);
  if (!m) throw new Error(`const ${name}= no encontrado en simulador-app.jsx`);
  const start = m.index + m[1].length;
  let i = SRC.indexOf('=', start) + 1;
  let depth = 0, inStr = null;
  for (; i < SRC.length; i++) {
    const c = SRC[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if ((c === ';' || c === '\n') && depth === 0) {
      const rest = SRC.slice(i + 1).trimStart();
      if (c === ';' || rest.startsWith('const ') || rest.startsWith('function ') || rest.startsWith('//')) break;
    }
  }
  return SRC.slice(start, i).replace(/;?\s*$/, ';');
}

// Nombres que ya NO viven en el JSX: se extrajeron a módulos propios y se
// require()n de verdad, en vez de re-parsearse. Cada uno que se mueve aquí es
// una porción del monolito que dejó de necesitar este hack.
//
// Los tests no se enteran: piden 'INGS' igual que antes y reciben el mismo
// objeto — pero ahora es EL objeto de producción, no una copia evaluada aparte.
const MODULES = [
  { path: '../substrate-catalog.js', names: ['SPP', 'INGS', 'CATS', 'PRESETS'] },
  { path: '../substrate-analysis.js', names: ['analyze', 'EB_PENALTY_BALANCE_BAND'] },
  { path: '../substrate-diagnosis.js', names: ['diagnose'] },
];

const fromModules = {};
for (const mod of MODULES) {
  const api = require(path.join(__dirname, mod.path));
  for (const name of mod.names) {
    if (!(name in api)) throw new Error(`${mod.path} ya no exporta ${name}`);
    fromModules[name] = api[name];
  }
}

function extractConsts(names) {
  const sliced = names.filter((n) => !(n in fromModules));
  const resolved = names.filter((n) => n in fromModules);

  // Las declaraciones que siguen en el JSX pueden referirse a las que ya se
  // extrajeron (p. ej. `calcBatch(...,ings=INGS,...)`), así que los módulos se
  // inyectan como parámetros del Function en vez de re-declararse.
  const body = sliced.map(sliceDeclaration).join('\n')
    + `\nreturn { ${[...sliced, ...resolved].join(', ')} };`;
  const injected = Object.keys(fromModules);
  // eslint-disable-next-line no-new-func
  return new Function(...injected, body)(...injected.map((n) => fromModules[n]));
}

module.exports = { extractConsts };
