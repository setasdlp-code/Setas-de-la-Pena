'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
// yaml is already supplied by the locked Firebase CLI toolchain.
const YAML = require('yaml');
const workflows = path.resolve(__dirname, '../../.github/workflows');
const read = name => YAML.parse(fs.readFileSync(path.join(workflows, name), 'utf8'));

test('Pages deploys only main after the same-commit repository and authenticated application gates succeed', () => {
  const workflow = read('deploy.yml');
  assert.deepEqual(workflow.on.push.branches, ['main']);
  const [deployId, deploy] = Object.entries(workflow.jobs).find(([, job]) => job.steps?.some(s => s.uses?.startsWith('actions/deploy-pages@')));
  assert.ok(deployId);
  assert.equal(deploy.if, "github.ref == 'refs/heads/main'");
  const required = deploy.needs.map(id => workflow.jobs[id]);
  assert.equal(required.length, 2);
  const app = required.find(job => job.uses === './.github/workflows/field-os-simulador-quality.yml');
  assert.ok(required.some(job => job.uses === './.github/workflows/quality.yml'));
  assert.equal(app.with['require-auth'], true);
  assert.equal(app.secrets, 'inherit');
  for (const job of [deploy, ...required]) {
    assert.equal(job['continue-on-error'], undefined);
    assert.doesNotMatch(job.if || '', /always\(|failure\(|cancelled\(/);
    for (const step of job.steps || []) assert.equal(step.with?.ref, undefined, 'checkout must use the tested event commit');
  }
  for (const name of ['field-os-simulador-quality.yml', 'quality.yml']) {
    const called = read(name);
    assert.ok(Object.hasOwn(called.on, 'workflow_call'));
    assert.equal(called.on.push, undefined, 'main runs through the deployment dependency graph');
  }
});
