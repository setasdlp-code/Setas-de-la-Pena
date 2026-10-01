'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {lowStockAlerts,reserve}=require('./inventory-ledger.js');
const NOW=Date.parse('2026-09-30T15:00:00Z');
const ingredients=[{id:'paja',name:'Paja'},{id:'salvado',name:'Salvado'},{id:'ausente',name:'No manejado'}];
const lots=[{ingredienteId:'paja',activo:true,cantidadKgDisponible:10},{ingredienteId:'salvado',activo:true,cantidadKgDisponible:0}];
test('alerts track registered active ingredients, including depleted stock, not the whole catalog',()=>{
 const alerts=lowStockAlerts({ingredients,lots,thresholds:{ausente:5},nowMs:NOW});
 assert.deepEqual(alerts.map(a=>a.ing.id),['salvado']);
 assert.deepEqual(lowStockAlerts({ingredients,lots:[],nowMs:NOW}),[]);
 assert.deepEqual(lowStockAlerts({ingredients,lots:lots.map(l=>({...l,activo:false})),nowMs:NOW}),[]);
});
test('reservations reduce alert availability; incoming does not replace physical stock',()=>{
 const ledger=[reserve({ingredienteId:'paja',kg:9,batchId:'A',at:NOW})];
 const incoming=[{ingredienteId:'paja',estado:'pendiente',cantidadKg:20}];
 const alerts=lowStockAlerts({ingredients,lots,ledger,incoming,nowMs:NOW});
 assert.equal(alerts[0].ing.id,'paja');assert.equal(alerts[0].stockKg,1);assert.equal(alerts[0].entranteKg,20);
 assert.equal(lots[0].cantidadKgDisponible,10);
});
test('configured zero, exact threshold and fractional limits are respected',()=>{
 assert.deepEqual(lowStockAlerts({ingredients,lots,thresholds:{paja:10,salvado:0},nowMs:NOW}),[]);
 assert.equal(lowStockAlerts({ingredients,lots,thresholds:{paja:10.5,salvado:0},nowMs:NOW})[0].threshold,10.5);
 assert.equal(lowStockAlerts({ingredients,lots,thresholds:{paja:'bad'},nowMs:NOW})[0].ing.id,'salvado');
});
test('expired reservations and unknown inventory IDs do not create false critical items',()=>{
 const ledger=[reserve({ingredienteId:'paja',kg:9,batchId:'A',at:NOW-2000,expiresAt:new Date(NOW-1000).toISOString()})];
 assert.deepEqual(lowStockAlerts({ingredients,lots:[...lots,{ingredienteId:'bolsa',activo:true,cantidadKgDisponible:0}],ledger,nowMs:NOW}).map(a=>a.ing.id),['salvado']);
});
