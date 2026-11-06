import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('./substrate-catalog.js',import.meta.url),'utf8'),ctx);
const g=ctx.SetasSubstrateCatalog.INGS.find(g=>g.id==='retamo_espinoso');
test('retamo price stays on received pellet basis with unresolved variant',()=>{
 assert.equal(g.cost,9000);
 assert.match(g.notes,/producto recibido/);
 assert.match(g.notes,/acacia\/cerezo por defecto/);
 const price=g.provenance.claims.find(c=>c.fields.includes('cost'));
 assert.equal(price.method,'reported');assert.equal(price.confidence,'low');
 assert.match(g.provenance.sources[price.sourceIds[0]].url,/MCO4083366706/);
});
test('unmeasured retamo nutrient values cannot become freshly verified',()=>{
 for(const field of ['cn','n','c']){
  const claim=g.provenance.claims.find(c=>c.fields.includes(field));
  assert.equal(claim.confidence,'unknown');assert.equal(claim.method,'legacy');
  assert.equal(claim.verifiedAt,undefined);
 }
 assert.match(g.notes,/humedad provisional/);
 assert.ok(!g.cs.includes('shiitake'));
 assert.ok(!g.cs.includes('lions_mane'));
});
