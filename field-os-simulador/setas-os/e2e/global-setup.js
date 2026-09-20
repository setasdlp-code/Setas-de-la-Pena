'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

// Inicia sesión una sola vez contra el Firebase real del proyecto (sdlp-os)
// con una cuenta de prueba, y guarda la sesión resultante para que todos los
// specs la reutilicen sin volver a pasar por #setas-auth-gate.
//
// Requiere E2E_TEST_EMAIL / E2E_TEST_PASSWORD en el entorno (ver env.example).
// No se toca auth-gate.js ni ninguna lógica de Firebase — esto solo automatiza
// lo que un operador haría a mano en el formulario del gate.
module.exports = async (config) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  const { baseURL, storageState } = config.projects[0].use;

  if (storageState) {
    const authDir = path.dirname(storageState);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
  }

  if (!email || !password) {
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
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/Setas%20OS%20v5.dc.html`);
  await page.locator('#setas-auth-email').waitFor({ state: 'visible' });
  await page.locator('#setas-auth-email').fill(email);
  await page.locator('#setas-auth-password').fill(password);
  await page.locator('#setas-auth-submit').click();

  // El gate se oculta (display:none) cuando onAuthStateChanged confirma la sesión.
  await page.locator('#setas-auth-gate').waitFor({ state: 'hidden', timeout: 15_000 });

  // Firebase Auth persiste la sesión en IndexedDB de forma asíncrona, después de
  // que onAuthStateChanged ya notificó en memoria — sin esta espera, storageState()
  // puede capturarse antes de que esa escritura termine y quedar sin sesión real.
  await page.waitForTimeout(1500);

  // indexedDB:true es obligatorio — Firebase Auth persiste la sesión ahí, no en
  // localStorage, y storageState() la omite por defecto.
  await page.context().storageState({ path: storageState, indexedDB: true });
  await browser.close();
};
