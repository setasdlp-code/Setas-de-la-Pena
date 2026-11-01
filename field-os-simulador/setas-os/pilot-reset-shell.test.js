'use strict';
// El shell descarta su registro del turno cuando Bitácora pidió el reinicio
// para el piloto. Se ejecuta el loadPersisted real del shell, aislado.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {PILOT_RESET_MARKER}=require('./prototype-readiness.js');
const html=fs.readFileSync(path.join(__dirname,'Setas OS v5.dc.html'),'utf8');
const start=html.indexOf('  loadPersisted(){'),end=html.indexOf('\n  _syncOutcome(',start);
assert.ok(start>-1&&end>start,'no se encontró loadPersisted en el shell');
const body=html.slice(start+'  loadPersisted(){'.length,html.lastIndexOf('}',end));
const memory=init=>{const m=new Map(Object.entries(init));return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),has:k=>m.has(k)};};
const run=storage=>{
  const loaded=[];
  const fn=new Function('localStorage','PILOT_RESET_KEY','stripShellDemoState',body);
  fn.call({setState:d=>loaded.push(d)},storage,'setas_os_pilot_reset_v1',d=>d);
  return loaded;
};
const turno=JSON.stringify({containers:[{id:'C-PRUEBA'}],ledger:[{type:'observacion'}],seq:3,salidas:[],yields:[]});
test('con la marca de reinicio el shell arranca vacío y consume la marca',()=>{
  const storage=memory({setas_os_state:turno,setas_os_pilot_reset_v1:'1',[PILOT_RESET_MARKER]:'2026-10-31T12:00:00Z'});
  assert.deepEqual(run(storage),[]);
  assert.equal(storage.has('setas_os_state'),false);
  assert.equal(storage.has(PILOT_RESET_MARKER),false);
});
test('sin la marca el registro del turno se carga como siempre',()=>{
  const storage=memory({setas_os_state:turno,setas_os_pilot_reset_v1:'1'});
  const loaded=run(storage);
  assert.equal(loaded.length,1);assert.deepEqual(loaded[0].containers,[{id:'C-PRUEBA'}]);
  assert.equal(storage.has('setas_os_state'),true);
});
