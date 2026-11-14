'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');
const { requiresAuth } = require('./auth-policy.cjs');

// Inicia sesión una sola vez contra el Firebase real del proyecto (sdlp-os)
// con una cuenta de prueba, y guarda la sesión resultante para que todos los
// specs la reutilicen sin volver a pasar por #setas-auth-gate.
//
// Requiere E2E_TEST_EMAIL / E2E_TEST_PASSWORD en el entorno (ver env.example).
// No se toca auth-gate.js ni ninguna lógica de Firebase — esto solo automatiza
// lo que un operador haría a mano en el formulario del gate.
module.exports = async (config) => {
  delete process.env.E2E_AUTH_UNAVAILABLE;
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  const { baseURL, storageState } = config.projects[0].use;

  if (storageState) {
    const authDir = path.dirname(storageState);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    // Nunca reutilizar una sesión anterior si falta o falla la autenticación.
    fs.rmSync(storageState, { force: true });
  }

  if (!email || !password) {
    if (requiresAuth()) {
      throw new Error('La validación de release requiere E2E_TEST_EMAIL y E2E_TEST_PASSWORD. Configura ambos secrets; no se ejecutaron las pruebas autenticadas.');
    }
    process.env.E2E_AUTH_UNAVAILABLE = 'true';
    if (storageState && !fs.existsSync(storageState)) {
      fs.writeFileSync(storageState, JSON.stringify({ cookies: [], origins: [] }));
    }
    console.warn(
      'Faltan E2E_TEST_EMAIL / E2E_TEST_PASSWORD en el entorno. ' +
      'Se omitirán las pruebas que requieren sesión real de Firebase.'
    );
    return;
  }
  let browser;
  let stage = 'abrir navegador';
  try {
    browser = await chromium.launch({ executablePath: process.env.SETAS_CHROMIUM_EXECUTABLE || undefined });
    const page = await browser.newPage();

    stage = 'cargar acceso';
    await page.goto(`${baseURL}/Setas%20OS%20v5.dc.html`);
    await page.locator('#setas-auth-email').waitFor({ state: 'visible', timeout: 10_000 });
    await page.locator('#setas-auth-email').fill(email);
    await page.locator('#setas-auth-password').fill(password);
    stage = 'enviar acceso';
    await page.locator('#setas-auth-submit').click();
    stage = 'esperar sesión y runtime';

    // El gate se oculta (display:none) cuando onAuthStateChanged confirma la sesión.
    await page.locator('#setas-auth-gate').waitFor({ state: 'hidden', timeout: 15_000 });

    // Wait for the persisted Auth record instead of a fixed delay. A visible
    // app only proves the in-memory session; workers need the IndexedDB copy.
    stage = 'persistir sesión en IndexedDB';
    let persistedState;
    await expect.poll(async () => {
      persistedState = await page.context().storageState({indexedDB:true});
      return persistedState.origins.some(origin => origin.indexedDB?.some(database =>
        database.name === 'firebaseLocalStorageDb' && database.stores.some(store =>
          store.name === 'firebaseLocalStorage' && store.records.some(record =>
            typeof record.value?.fbase_key === 'string' && record.value.fbase_key.startsWith('firebase:authUser:') && record.value.value?.uid))));
    }, {timeout:10000, message:'Firebase Auth debe quedar persistido antes de iniciar los workers'}).toBe(true);
    fs.writeFileSync(storageState, JSON.stringify(persistedState));
  } catch (error) {
    if (storageState) fs.rmSync(storageState, { force: true });
    // El error de Playwright puede incluir el contenido de campos de login.
    // Only the known stage and error class: raw errors may contain credentials.
    const errorType = error?.name === 'TimeoutError' ? 'TimeoutError' : 'Error';
    throw new Error(`No se pudo completar Firebase Auth durante globalSetup: ${stage} (${errorType}). Las pruebas autenticadas no se ejecutaron; la validación ha fallado.`);
  } finally {
    if (browser) await browser.close();
  }
};
