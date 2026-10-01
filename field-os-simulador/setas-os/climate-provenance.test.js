'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {extractConsts}=require('./test-support/jsx-extract.js');
const {climateMetricProvenance}=extractConsts(['climateMetricProvenance']);
test('no telemetry is model provenance, never measured',()=>{
 assert.equal(climateMetricProvenance({metric:'temperature_c'}).kind,'model');
});
test('partial telemetry assigns provenance to each metric separately',()=>{
 const roomLive={sample:{temperature_c:0},latest:{temperature_c:{ingest_source:'firestore'}},freshMetrics:{temperature_c:true},metricAgeMs:{temperature_c:3000}};
 assert.equal(climateMetricProvenance({metric:'temperature_c',roomLive}).kind,'measured');
 assert.equal(climateMetricProvenance({metric:'temperature_c',roomLive}).ageMs,3000);
 assert.equal(climateMetricProvenance({metric:'co2_ppm',roomLive}).kind,'model');
});
test('a fresh temperature packet cannot revive stale CO2; unknown age remains unknown',()=>{
 const roomLive={sample:{temperature_c:18,co2_ppm:800},freshMetrics:{temperature_c:true,co2_ppm:false},metricAgeMs:{temperature_c:0,co2_ppm:200000},ageMs:0};
 assert.equal(climateMetricProvenance({metric:'co2_ppm',roomLive}).freshness,'stale');
 assert.equal(climateMetricProvenance({metric:'temperature_c',roomLive:{sample:{temperature_c:18}}}).freshness,'unknown');
});
test('manual/test data remains entered even when delivered through live transport',()=>{
 const roomLive={sample:{rh_pct:80},latest:{rh_pct:{ingest_source:'manual'}},freshMetrics:{rh_pct:true},metricAgeMs:{rh_pct:0}};
 assert.equal(climateMetricProvenance({metric:'rh_pct',roomLive}).kind,'entered');
 assert.equal(climateMetricProvenance({metric:'rh_pct',injected:{rh:0,timestamp:'12:00'}}).kind,'entered');
 assert.equal(climateMetricProvenance({metric:'substrate_temperature_c',injected:{subTemp:null}}).kind,'model');
});
