'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { safePolyline, finiteNumber, sparkPointLabel } = require('./climate-sparkline.js');

const shell = fs.readFileSync(path.join(__dirname, 'Setas OS v5.dc.html'), 'utf8');
const authGate = fs.readFileSync(path.join(__dirname, 'firebase/auth-gate.js'), 'utf8');

test('safePolyline accepts valid SVG coordinate pairs and rejects raw template values', () => {
  assert.equal(safePolyline('0,56 140.5,28 280,0'), '0,56 140.5,28 280,0');
  assert.equal(safePolyline('{{ cm.tempSpark }}'), '');
  assert.equal(safePolyline('0,NaN 280,0'), '');
});

test('sparkline defaults malformed numeric values safely', () => {
  assert.equal(finiteNumber('14.5', 0), 14.5);
  assert.equal(finiteNumber('NaN', 56), 56);
  assert.equal(sparkPointLabel({ hoursAgo: 3, temp: 19.4, hum: 86, co2: 1100 }), 'Hace 3 h — 19.4°C · 86% HR · 1100 ppm CO₂');
});

test('camera sparklines are rendered by the authenticated component rather than raw SVG moustache attributes', () => {
  assert.match(authGate, /"\.\.\/climate-sparkline\.js"/);
  assert.match(shell, /component-from-global-scope="SetasClimateSparkline"[\s\S]*temp-points="\{\{ cm\.tempSpark \}\}"/);
  assert.match(shell, /component-from-global-scope="SetasClimateSparkline"[\s\S]*temp-points="\{\{ camDetail\.tempSpark \}\}"/);
  assert.doesNotMatch(shell, /<polyline points="\{\{ (?:cm|camDetail)\.(?:tempSpark|humSpark|co2Spark) \}\}"/);
  assert.doesNotMatch(shell, /<circle cx="280" cy="\{\{ (?:cm|camDetail)\.(?:tempSparkEndY|humSparkEndY|co2SparkEndY) \}\}"/);
});
