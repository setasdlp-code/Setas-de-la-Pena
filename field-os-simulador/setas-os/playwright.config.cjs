'use strict';

const { defineConfig, devices } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const APP_DIR = path.resolve(__dirname);
const envPath = path.join(APP_DIR, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = (match[2] || '').trim();
  }
}

module.exports = defineConfig({
  testDir: path.join(APP_DIR, 'e2e'),
  testMatch: '**/*.spec.cjs',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  globalSetup: require.resolve('./e2e/global-setup.js'),
  use: {
    baseURL: 'http://127.0.0.1:4173',
    navigationTimeout: 30000,
    actionTimeout: 10000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: path.join(APP_DIR, 'e2e/.auth/state.json'),
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-390',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    cwd: APP_DIR,
    url: 'http://127.0.0.1:4173/Setas%20OS%20v5.dc.html',
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});
