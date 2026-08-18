'use strict';
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
  if (!email || !password) {
    throw new Error(
      'Faltan E2E_TEST_EMAIL / E2E_TEST_PASSWORD en el entorno. ' +
      'Copia env.example a .env, complétalo con la cuenta de prueba de Firebase ' +
      '(console.firebase.google.com/project/sdlp-os/authentication/users) y vuelve a correr los tests.'
    );
  }

  const { baseURL, storageState } = config.projects[0].use;
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
