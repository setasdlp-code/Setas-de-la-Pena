'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');

function load(file, env, modules = {}) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'e2e', file), 'utf8'), {
    module, process: { env }, console: { warn() {} },
    require: name => modules[name] || require(name),
  }, { filename: file });
  return module.exports;
}

function setup(t, env, fail = false) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'setas-auth-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const state = path.join(dir, 'state.json');
  fs.writeFileSync(state, 'stale prior authenticated state');
  const calls = { launched: 0, closed: 0 };
  const page = {
    goto: async () => { if (fail) throw Error('sensitive mocked browser error'); },
    locator: () => ({ waitFor: async () => {}, fill: async () => {}, click: async () => {} }),
    waitForTimeout: async () => {},
    context: () => ({ storageState: async options => {
      assert.equal(options.indexedDB, true);
      fs.writeFileSync(options.path, JSON.stringify({ origins: ['authenticated'] }));
    } }),
  };
  const chromium = { launch: async () => {
    calls.launched++;
    return { newPage: async () => page, close: async () => { calls.closed++; } };
  } };
  const policy = load('auth-policy.cjs', env);
  const run = load('global-setup.js', env, { '@playwright/test': { chromium }, './auth-policy.cjs': policy });
  return { run: () => run({ projects: [{ use: { baseURL: 'http://local.test', storageState: state } }] }), state, calls };
}

test('release validation fails without either credential and clears stale sessions before launch', async t => {
  for (const credentials of [{}, { E2E_TEST_EMAIL: 'fake@example.invalid' }, { E2E_TEST_PASSWORD: 'fake-only' }]) {
    const s = setup(t, { ...credentials, E2E_REQUIRE_AUTH: 'true' });
    await assert.rejects(s.run, /requiere E2E_TEST_EMAIL y E2E_TEST_PASSWORD/);
    assert.equal(fs.existsSync(s.state), false);
    assert.equal(s.calls.launched, 0);
  }
});

test('optional local runs explicitly skip absent credentials and replace stale auth state with an empty session', async t => {
  const env = {};
  const s = setup(t, env);
  await s.run();
  assert.equal(env.E2E_AUTH_UNAVAILABLE, 'true');
  assert.deepEqual(JSON.parse(fs.readFileSync(s.state)), { cookies: [], origins: [] });
  assert.equal(s.calls.launched, 0);
});

test('provided credentials with a failed login fail both optional and release runs without leaking browser error text', async t => {
  for (const required of ['false', 'true']) {
    const env = { E2E_REQUIRE_AUTH: required, E2E_TEST_EMAIL: 'fake@example.invalid', E2E_TEST_PASSWORD: 'fake-only' };
    const s = setup(t, env, true);
    await assert.rejects(s.run, error => {
      assert.match(error.message, /validación ha fallado/);
      assert.doesNotMatch(error.message, /sensitive|fake-only/);
      return true;
    });
    assert.equal(env.E2E_AUTH_UNAVAILABLE, undefined);
    assert.equal(fs.existsSync(s.state), false);
    assert.equal(s.calls.closed, 1);
  }
});

test('successful login resets an inherited skip flag and saves IndexedDB auth state', async t => {
  const env = { E2E_REQUIRE_AUTH: 'true', E2E_AUTH_UNAVAILABLE: 'true', E2E_TEST_EMAIL: 'fake@example.invalid', E2E_TEST_PASSWORD: 'fake-only' };
  const s = setup(t, env);
  await s.run();
  assert.equal(env.E2E_AUTH_UNAVAILABLE, undefined);
  assert.deepEqual(JSON.parse(fs.readFileSync(s.state)), { origins: ['authenticated'] });
  assert.equal(s.calls.closed, 1);
});

test('a required session cannot be skipped, and a session lost after setup fails the real helper', async () => {
  const policy = load('auth-policy.cjs', { E2E_REQUIRE_AUTH: 'true', E2E_AUTH_UNAVAILABLE: 'true' });
  assert.throws(() => policy.skipIfAuthUnavailable({ skip() { assert.fail('release must not skip'); } }), /requiere una sesión/);
  const helper = load('helpers.js', {}, { './auth-policy.cjs': load('auth-policy.cjs', {}), '@playwright/test': { test: { skip() { assert.fail('lost session must not skip'); } } } });
  await assert.rejects(() => helper.openApp({ goto: async () => {}, locator: () => ({ waitFor: async () => { throw Error('session lost'); } }) }), /session lost/);
});
