'use strict';
// stdin → minified CSS. Import expansion and asset rebasing belong to the exporter.
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require(path.join(__dirname, '../field-os-simulador/setas-os/node_modules/esbuild'));
const result = esbuild.transformSync(fs.readFileSync(0, 'utf8'), { loader: 'css', minify: true, target: ['chrome100', 'firefox100', 'safari15.4'], legalComments: 'none' });
if (result.warnings.length) throw new Error(result.warnings.map(w => w.text).join('\n'));
process.stdout.write(result.code);
