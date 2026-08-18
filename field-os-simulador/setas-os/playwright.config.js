// @ts-check
const fs = require('fs');
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

// Carga .env sin depender de un paquete extra: E2E_TEST_EMAIL/E2E_TEST_PASSWORD
// para el login automático en global-setup.js (ver .env.example).
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = (m[2] || '').trim();
  }
}

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false, // la app comparte localStorage/estado entre specs; correr en serie evita flakiness
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  globalSetup: require.resolve('./e2e/global-setup.js'),
  use: {
    baseURL: 'http://127.0.0.1:8744',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Generado por global-setup.js al iniciar sesión contra Firebase (sdlp-os)
    // con la cuenta de prueba — evita repetir el login en cada spec.
    storageState: './e2e/.auth/state.json',
  },
  webServer: {
    command: 'python3 -m http.server 8744 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8744/Setas%20OS%20v5.dc.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
