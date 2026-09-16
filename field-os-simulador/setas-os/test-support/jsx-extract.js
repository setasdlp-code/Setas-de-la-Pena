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

function extractConsts(names) {
  const body = names.map(sliceDeclaration).join('\n') + `\nreturn { ${names.join(', ')} };`;
  // eslint-disable-next-line no-new-func
  return new Function(body)();
}

module.exports = { extractConsts };
