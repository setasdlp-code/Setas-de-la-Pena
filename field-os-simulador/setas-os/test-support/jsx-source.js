'use strict';
// Texto JSX completo del bundle: las fuentes de jsx-sources.cjs unidas igual que
// las une build.js. Los tests de contrato sobre el fuente leen esto en vez de
// simulador-app.jsx, para no depender de en qué archivo vive cada componente.
const path = require('node:path');
const { readSources } = require(path.join(__dirname, '..', 'build.js'));

module.exports = { readJsxSource: () => readSources() };
