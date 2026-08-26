'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const shell = fs.readFileSync(path.join(ROOT, 'Setas OS v5.dc.html'), 'utf8');
const jsx = fs.readFileSync(path.join(ROOT, 'simulador-app.jsx'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'sim.css'), 'utf8');

const {
  calcVPsat,
  calcVPact,
  calcVPD,
  calcDewPoint,
  evalClimateHealth,
  generateSvgPolyline
} = require('./climate-math.js');

test('climate-math computes vapor pressure, VPD, and dew point correctly', () => {
  // A 18°C y 90% HR en Martha Tent:
  const vpd = calcVPD(18, 90);
  assert.equal(vpd, 0.21); // kPa

  const tdp = calcDewPoint(18, 90);
  assert.equal(tdp, 16.3); // °C

  // Margin of safety against condensation (18 - 16.3 = 1.7°C > 0.8°C)
  const health = evalClimateHealth({
    tC: 18,
    rhPct: 90,
    co2Ppm: 680,
    targets: {
      temperature_c: { min: 14, max: 20, target: 17 },
      rh_pct: { min: 85, max: 95, target: 90 },
      co2_ppm: { min: 400, max: 900, target: 600 }
    }
  });
  assert.equal(health.severity, 'optimal');
  assert.equal(health.vpd, 0.21);
  assert.equal(health.condensationRisk, false);
});

test('climate-math flags severe condensation risk when RH is saturated', () => {
  const health = evalClimateHealth({
    tC: 18,
    rhPct: 98,
    co2Ppm: 1100,
    targets: {
      temperature_c: { min: 14, max: 20, target: 17 },
      rh_pct: { min: 85, max: 95, target: 90 },
      co2_ppm: { min: 400, max: 900, target: 600 }
    }
  });
  assert.equal(health.severity, 'critical');
  assert.equal(health.condensationRisk, true);
  assert.ok(health.alerts.some(a => a.metric === 'dew_point'));
  assert.ok(health.alerts.some(a => a.metric === 'co2_ppm'));
});

test('simulador-app.jsx integrates live telemetry dashboard and Today widget', () => {
  assert.match(jsx, /data-testid="climate-dashboard"/);
  assert.match(jsx, /climate-module-grid/);
  assert.match(jsx, /props\.hoyCamarasJson/);
  assert.match(jsx, /tempSeries/);
  assert.match(jsx, /CAMERA_TO_ROOM=\{incub:'incubacion_01',martha:'martha_01',cloudlab:'cloudlab_844'\}/);
  assert.match(jsx, /data-testid="today-climate-strip"/);
  assert.match(jsx, /martha_01/);
  assert.match(jsx, /cloudlab_844/);
  assert.match(jsx, /tab==='clima'&&ClimateDashboardSection\(\)/);
  assert.match(jsx, /clima:'Cámaras & Telemetría IoT'/);
});

test('Setas OS v5.dc.html exposes one merged Cameras and IoT route', () => {
  assert.match(shell, /<script src="climate-math\.js"><\/script>/);
  assert.match(shell, /contextTab\('Cámaras & IoT',/);
  assert.doesNotMatch(shell, /contextTab\('Telemetría IoT',/);
  assert.doesNotMatch(shell, /contextTab\('Cámaras',/);
  assert.match(shell, /closeCam:\(\)=>this\.goSimTab\('clima'\)/);
  assert.match(shell, /tempSeries:c\.tempSeries/);
  assert.match(shell, /viewAlias=\{camaras:'clima',iot:'clima',telemetria:'clima'\}/);
  assert.match(shell, /url\.searchParams\.set\('view',tab\)/);
});

test('sim.css defines climate telemetry styles and responsive cards', () => {
  assert.match(css, /\.climate-dashboard/);
  assert.match(css, /\.climate-module-card/);
  assert.match(css, /\.climate-kpi-card/);
  assert.match(css, /\.today-climate-strip/);
  assert.match(css, /\.climate-svg-wrap/);
  assert.match(css, /\.climate-actuators-panel/);
  assert.match(css, /\.climate-actuator-card/);
});

test('simulador-app.jsx renders relay actuator controls and interactive overrides', () => {
  assert.match(jsx, /data-testid="climate-actuators-panel"/);
  assert.match(jsx, /Relay Ch1 · T7\/H05/);
  assert.match(jsx, /Relay Ch2 · Cloudline H4/);
  assert.match(jsx, /Disparar Pulso FAE/);
  assert.match(jsx, /Forzar Humidificación/);
});
