'use strict';
// Real Chromium and the actual globalSetup, with synthetic Auth-shaped data.
// No Firebase account, token, service or production write is used.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const globalSetup=require('./global-setup.js');

(async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'setas-auth-storage-'));
  const envKeys=['E2E_TEST_EMAIL','E2E_TEST_PASSWORD','E2E_REQUIRE_AUTH','E2E_AUTH_UNAVAILABLE'];
  const previous=Object.fromEntries(envKeys.map(key=>[key,process.env[key]]));
  let encoded=false;
  const server=http.createServer((req,res)=>{
    res.setHeader('Content-Type','text/html');
    res.end(`<!doctype html><title>Synthetic Auth storage</title>
      <div id="setas-auth-gate"><form id="fixture-form">
        <input id="setas-auth-email" type="email"><input id="setas-auth-password" type="password">
        <button id="setas-auth-submit" type="submit">Ingresar</button>
      </form></div><script>
      window.SetasFirebase={auth:{app:{name:'[DEFAULT]',options:{apiKey:'synthetic'}},currentUser:{uid:'fixture-user'}}};
      const key='firebase:authUser:synthetic:[DEFAULT]';
      const open=()=>new Promise((resolve,reject)=>{
        const request=indexedDB.open('firebaseLocalStorageDb',1);
        request.onupgradeneeded=()=>request.result.createObjectStore('firebaseLocalStorage',{keyPath:'fbase_key'});
        request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
      });
      const write=async records=>{
        const db=await open();
        await new Promise((resolve,reject)=>{
          const tx=db.transaction('firebaseLocalStorage','readwrite');
          for(const record of records)tx.objectStore('firebaseLocalStorage').put(record);
          tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
        });db.close();
      };
      document.getElementById('fixture-form').addEventListener('submit',async event=>{
        event.preventDefault();document.getElementById('setas-auth-gate').style.display='none';
        // Neither the right UID for another app nor a stale user for this app
        // may satisfy the durable-session wait.
        await write([
          {fbase_key:'firebase:authUser:other-app:[DEFAULT]',value:{uid:'fixture-user'}},
          {fbase_key:key,value:{uid:'stale-user'}}
        ]);
        setTimeout(()=>{
          const user={uid:'fixture-user'};
          if(${encoded})user.displayName=undefined;
          write([{fbase_key:key,value:user}]);
        },350);
      });
      </script>`);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const baseURL=`http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    process.env.E2E_TEST_EMAIL='synthetic@example.invalid';
    process.env.E2E_TEST_PASSWORD='fixture-only';
    process.env.E2E_REQUIRE_AUTH='true';
    browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
    for(encoded of [false,true]){
      const storageState=path.join(directory,encoded?'encoded.json':'plain.json');
      await globalSetup({projects:[{use:{baseURL,storageState}}]});
      const state=JSON.parse(fs.readFileSync(storageState,'utf8'));
      const database=state.origins.find(origin=>origin.origin===baseURL).indexedDB.find(db=>db.name==='firebaseLocalStorageDb');
      const records=database.stores.find(store=>store.name==='firebaseLocalStorage').records;
      assert.equal(records.some(record=>Object.hasOwn(record,'valueEncoded')),encoded);
      // Restore the exported snapshot in a fresh context, exactly like workers.
      const context=await browser.newContext({storageState});
      try{
        const page=await context.newPage();await page.goto(baseURL);
        const restored=await page.evaluate(()=>new Promise((resolve,reject)=>{
          const request=indexedDB.open('firebaseLocalStorageDb');
          request.onerror=()=>reject(request.error);
          request.onsuccess=()=>{
            const db=request.result;
            const read=db.transaction('firebaseLocalStorage','readonly').objectStore('firebaseLocalStorage').get('firebase:authUser:synthetic:[DEFAULT]');
            read.onerror=()=>{db.close();reject(read.error);};
            read.onsuccess=()=>{const user=read.result.value;db.close();resolve({uid:user.uid,hasOptionalField:Object.hasOwn(user,'displayName'),optionalFieldUndefined:user.displayName===undefined});};
          };
        }));
        assert.equal(restored.uid,'fixture-user','capture must wait past stale and wrong-app records');
        assert.equal(restored.hasOptionalField,encoded);
        if(encoded)assert.equal(restored.optionalFieldUndefined,true);
      }finally{await context.close();}
      console.log(`PASS globalSetup: delayed durable Auth, exact app/user and ${encoded?'valueEncoded':'value'} storageState roundtrip.`);
    }
  }finally{
    await browser?.close();await new Promise(resolve=>server.close(resolve));
    fs.rmSync(directory,{recursive:true,force:true});
    for(const key of envKeys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
