#!/usr/bin/env node
/**
 * scripts/sync-consumers.mjs
 *
 * Sincronizador determinista impulsado por distribution-manifest.json desde el
 * Design System canónico (08_brand/ds-2026) hacia Setas OS (field-os-simulador/setas-os/ds-2026/).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANON_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(CANON_DIR, '..', '..');
const TARGET_DIR = path.join(REPO_ROOT, 'field-os-simulador', 'setas-os', 'ds-2026');
const MANIFEST_PATH = path.join(CANON_DIR, 'distribution-manifest.json');

console.log('🔄 Sincronizando DS-2026 Canónico -> Setas OS Package...');
console.log(`   Origen:   ${CANON_DIR}`);
console.log(`   Destino:  ${TARGET_DIR}`);
console.log(`   Manifest: ${MANIFEST_PATH}`);

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ ERROR: distribution-manifest.json no encontrado.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

function copyFile(relPath) {
  const src = path.join(CANON_DIR, relPath);
  const dest = path.join(TARGET_DIR, relPath);
  if (!fs.existsSync(src)) {
    throw new Error(`Archivo fuente no existe: ${relPath}`);
  }
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry === '.DS_Store' || entry === 'node_modules' || entry === '.git') continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Copiar manifiesto
copyFile('distribution-manifest.json');

// 2. Copiar archivos raíz declarados
console.log('📦 Sincronizando archivos raíz...');
for (const file of manifest.files) {
  copyFile(file);
}

// 3. Sincronizar tokens declarados
console.log('📦 Sincronizando tokens declarados en manifiesto...');
for (const token of manifest.tokens) {
  copyFile(token);
}

// 4. Sincronizar componentes modulares y fachadas
console.log('📦 Sincronizando componentes declarados...');
for (const comp of manifest.components) {
  copyFile(comp);
}

// 5. Sincronizar assets
console.log('📦 Sincronizando assets completos...');
copyRecursive(path.join(CANON_DIR, 'assets'), path.join(TARGET_DIR, 'assets'));

// 6. Verificación de paridad byte a byte contra el manifiesto
console.log('🔍 Verificando paridad exacta byte a byte...');
const allFilesToVerify = [
  'distribution-manifest.json',
  ...manifest.files,
  ...manifest.tokens,
  ...manifest.components,
  ...manifest.assets.fonts,
  ...manifest.assets.species_images
];

let errors = 0;
for (const rel of allFilesToVerify) {
  const src = path.join(CANON_DIR, rel);
  const dest = path.join(TARGET_DIR, rel);
  if (!fs.existsSync(dest)) {
    console.error(`❌ Faltante en destino: ${rel}`);
    errors++;
    continue;
  }
  const srcBuf = fs.readFileSync(src);
  const destBuf = fs.readFileSync(dest);
  if (!srcBuf.equals(destBuf)) {
    console.error(`❌ Discrepancia en contenido (drift): ${rel}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n❌ Error: Se detectaron ${errors} problemas de sincronización.`);
  process.exit(1);
}

console.log(`✅ Sincronización verificada: ${allFilesToVerify.length} archivos validados con 0 drift.`);
