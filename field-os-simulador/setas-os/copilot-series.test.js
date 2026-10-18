'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildCopilotSeriesByRoom } = require('./copilot-series.js');

const NOW_MS = Date.parse('2026-10-17T12:00:00.000Z');
const MIN_MS = 60 * 1000;

function makePoints(count, newestAgeMs, valueBase = 18) {
  const newestT = NOW_MS - newestAgeMs;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const idxFromEnd = count - 1 - i;
    pts.push({ t: newestT - idxFromEnd * 5 * MIN_MS, v: valueBase + i * 0.1 });
  }
  return pts;
}

test('sala sin datos → missing', () => {
  const empty = buildCopilotSeriesByRoom({}, { nowMs: NOW_MS });
  assert.deepEqual(empty.stateByRoom, {});
  assert.deepEqual(empty.seriesByRoom, {});

  const roomWithoutPoints = buildCopilotSeriesByRoom(
    { martha_01: { id: 'martha_01', series: { temperature_c: [], rh_pct: [], co2_ppm: [] }, latest: {} } },
    { nowMs: NOW_MS },
  );
  assert.equal(roomWithoutPoints.stateByRoom.martha_01, 'missing');
  assert.deepEqual(roomWithoutPoints.seriesByRoom, {});
});

test('serie fresca y suficiente → measured', () => {
  const rooms = {
    martha_01: {
      id: 'martha_01',
      series: {
        temperature_c: makePoints(6, 1 * MIN_MS, 18),
        rh_pct: makePoints(6, 1 * MIN_MS, 88),
        co2_ppm: makePoints(6, 1 * MIN_MS, 750),
      },
    },
  };
  const res = buildCopilotSeriesByRoom(rooms, { nowMs: NOW_MS });
  assert.equal(res.stateByRoom.martha_01, 'measured');
  assert.ok(Array.isArray(res.seriesByRoom.martha_01));
  assert.equal(res.seriesByRoom.martha_01.length, 6);
  for (const pt of res.seriesByRoom.martha_01) {
    assert.equal(typeof pt.t, 'number');
    assert.ok(Number.isFinite(pt.t));
    assert.equal(typeof pt.temperature_c, 'number');
    assert.equal(typeof pt.rh_pct, 'number');
    assert.equal(typeof pt.co2_ppm, 'number');
  }
});

test('serie obsoleta no alimenta al copiloto', () => {
  const rooms = {
    martha_01: {
      id: 'martha_01',
      series: {
        temperature_c: makePoints(6, 31 * MIN_MS, 18),
        rh_pct: makePoints(6, 31 * MIN_MS, 88),
        co2_ppm: makePoints(6, 31 * MIN_MS, 750),
      },
    },
  };
  const res = buildCopilotSeriesByRoom(rooms, { nowMs: NOW_MS });
  assert.equal(res.stateByRoom.martha_01, 'stale');
  assert.equal(res.seriesByRoom.martha_01, undefined);
  assert.deepEqual(res.seriesByRoom, {});
});

test('serie corta → insufficient', () => {
  const rooms = {
    martha_01: {
      id: 'martha_01',
      series: {
        temperature_c: makePoints(3, 1 * MIN_MS, 18),
        rh_pct: makePoints(3, 1 * MIN_MS, 88),
        co2_ppm: makePoints(3, 1 * MIN_MS, 750),
      },
    },
  };
  const res = buildCopilotSeriesByRoom(rooms, { nowMs: NOW_MS });
  assert.equal(res.stateByRoom.martha_01, 'insufficient');
  assert.equal(res.seriesByRoom.martha_01, undefined);
  assert.deepEqual(res.seriesByRoom, {});
});
