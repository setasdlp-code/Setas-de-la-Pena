'use strict';
const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const storageStatePath = path.join(__dirname, 'e2e/.auth/state.json');
  console.log('Using storage state from:', storageStatePath);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: storageStatePath
  });
  const page = await context.newPage();

  console.log('Navigating to app on http://127.0.0.1:8744/Setas%20OS%20v5.dc.html ...');
  await page.goto('http://127.0.0.1:8744/Setas%20OS%20v5.dc.html');

  console.log('Waiting for auth gate to hide...');
  await page.locator('#setas-auth-gate').waitFor({ state: 'hidden', timeout: 20000 });
  await page.locator('.rail-btn[data-workspace]').first().waitFor();

  console.log('App loaded and authenticated. Executing probe inside page context...');
  const probeResult = await page.evaluate(async () => {
    const mod = window.SetasFieldEventCallableTransport;
    const fb = window.SetasFirebase;
    const contracts = window.SetasFieldEventContracts;
    const models = window.SetasFieldEvents;

    if (!mod) return { error: 'SetasFieldEventCallableTransport not found on window' };
    if (!models) return { error: 'SetasFieldEvents not found on window' };
    if (!contracts) return { error: 'SetasFieldEventContracts not found on window' };
    if (!fb || !fb.auth || !fb.auth.currentUser) return { error: 'No authenticated Firebase user' };

    const user = fb.auth.currentUser;
    const projectId = fb.app.options.projectId;

    const transport = mod.createCallableTransport({
      projectId,
      getIdToken: () => user.getIdToken(),
    });

    const fakeBatchId = `probe-nonexistent-${Date.now()}`;
    const event = models.createFieldEvent(
      fakeBatchId,
      'inoculated',
      'incubation',
      user.uid,
      new Date().toISOString(),
      0
    );

    const envelope = contracts.buildRequestEnvelope(event, user.uid);

    try {
      const receipt = await transport(envelope);
      return { success: true, receipt };
    } catch (err) {
      return {
        success: false,
        code: err.code,
        message: err.message,
      };
    }
  });

  console.log('\n--- PROBE RESPONSE ---');
  console.log(JSON.stringify(probeResult, null, 2));
  console.log('----------------------\n');

  await browser.close();

  if (probeResult && probeResult.code === 'batch_not_found') {
    console.log('✅ SUCCESS: Probe confirmed code === "batch_not_found".');
    console.log('Cloud Run acceptFieldEvent is reachable from the browser with CORS and authentication verified!');
    process.exit(0);
  } else {
    console.error('❌ Probe did not receive expected batch_not_found:', probeResult);
    process.exit(1);
  }
})();
