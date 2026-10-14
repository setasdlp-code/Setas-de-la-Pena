'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Runtime roots, including nested vendor imports, fonts and images. Development
// directories, backups and authentication state are never read by this scanner.
const DIRECTORIES = new Set(['assets', 'ds-2026', 'firebase', 'public', 'utils', 'vendor', '_standalone_imgs']);
const STATIC = /\.(?:js|css|html|otf|ttf|woff2?|svg|png|jpe?g|webp|ico|webmanifest)$/i;
const VERSION_LINE = /(\/\/ build:cache-version\n)const CACHE_VERSION = '[^']*';/;
const ASSETS_LINE = /(\/\/ build:release-assets\n)const RELEASE_ASSETS = \[[^\n]*\];/;

function runtimeAssets(root) {
  const files = [];
  function visit(dir, prefix = '') {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const relative = prefix + item.name;
      if (item.name.startsWith('.') || item.name === 'node_modules') continue;
      if (item.isDirectory()) {
        if (prefix || DIRECTORIES.has(item.name)) visit(path.join(dir, item.name), relative + '/');
      } else if (item.isFile()) {
        if (/\.(?:test|spec|browser)\.[cm]?js$/.test(item.name) || item.name.startsWith('__') || relative === 'index.html') continue;
        const publicJson = relative === 'setas-os.json' || relative === 'extraction-factors.json'
          || /^(?:assets|ds-2026|public)\/.*\.json$/.test(relative);
        if (STATIC.test(item.name) || publicJson) files.push(relative);
      }
    }
  }
  visit(root);
  return files.sort();
}

function releaseHash(root) {
  const hash = crypto.createHash('sha256');
  for (const relative of runtimeAssets(root)) {
    let bytes = fs.readFileSync(path.join(root, relative));
    // Include worker logic, but exclude its generated version to avoid a cycle.
    if (relative === 'sw.js') bytes = Buffer.from(bytes.toString('utf8')
      .replace(VERSION_LINE, '$1const CACHE_VERSION = \'release\';')
      .replace(ASSETS_LINE, '$1const RELEASE_ASSETS = [];'));
    hash.update(relative + '\0' + bytes.length + '\0');
    hash.update(bytes);
  }
  return hash.digest('hex');
}

module.exports = { runtimeAssets, releaseHash, VERSION_LINE, ASSETS_LINE };
