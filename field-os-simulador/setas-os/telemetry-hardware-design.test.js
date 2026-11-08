'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const base = path.join(__dirname, 'telemetry-publisher');
const design = require('./telemetry-publisher/hardware-design.json');
const equipment = YAML.parse(fs.readFileSync(path.join(__dirname, '../../knowledge_base/metadata/equipment.yaml'), 'utf8'));

test('proposed node allocation fits recorded owned stock and excludes unowned sensors', () => {
  const totals = new Map();
  const allocations = design.nodes.flatMap(node => node.allocations)
    .concat(design.referenceOnly, design.unallocatedSensors,
      [[design.topology.homeAssistant.equipmentId, 1], [design.topology.publisher.equipmentId, 1]]);
  for (const [id, count] of allocations) totals.set(id, (totals.get(id) || 0) + count);
  for (const [id, count] of totals) {
    const entry = equipment.inventory.find(row => row.id === id);
    assert.ok(entry, `no ownership record for ${id}`);
    assert.ok(['on_hand', 'operational'].includes(entry.status), `${id} is not available stock`);
    assert.ok(count <= entry.quantity, `${id}: ${count} allocated, only ${entry.quantity} recorded`);
  }
  assert.equal(design.nodes.length, 3);
  assert.equal(new Set(design.nodes.map(node => node.deviceId)).size, 3);
  assert.equal(new Set(design.nodes.map(node => node.roomId)).size, 3);
});

test('all node YAML sources parse and every include exists; only one node allocates CO2', () => {
  let co2Nodes = 0;
  for (const filename of fs.readdirSync(base).filter(name => name.endsWith('.yaml'))) {
    const source = fs.readFileSync(path.join(base, filename), 'utf8');
    const doc = YAML.parseDocument(source, { customTags: ['!include', '!secret'].map(tag => ({ tag, resolve: value => value })) });
    assert.deepEqual(doc.errors, [], filename);
    for (const match of source.matchAll(/!include\s+([^\s]+\.yaml)/g)) assert.ok(fs.existsSync(path.join(base, match[1])), `${filename} missing ${match[1]}`);
  }
  for (const node of design.nodes) {
    const source = fs.readFileSync(path.join(base, node.profile), 'utf8');
    assert.ok(source.includes(node.deviceId));
    if (source.includes('esphome-mhz19.package.yaml')) co2Nodes++;
    assert.ok(!source.includes('platform: scd30'));
    assert.ok(!source.includes('platform: dallas_temp'));
  }
  assert.equal(co2Nodes, 1);
  const common = fs.readFileSync(path.join(base, 'esphome-publish.package.yaml'), 'utf8');
  assert.ok(!common.includes('id(room_co2)'), 'T/HR-only nodes cannot depend on a missing CO2 sensor ID');
});
