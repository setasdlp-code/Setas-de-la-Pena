'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const os=require('node:os');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
(async()=>{
 const artifacts=fs.mkdtempSync(path.join(os.tmpdir(),'setas-thermal-label-'));
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  for(const width of [1280,390]){
   const page=await browser.newPage({viewport:{width,height:900},timezoneId:'America/Bogota'});
   await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   await page.addInitScript(()=>localStorage.setItem('sdp_bit_lotes',JSON.stringify([{id:'label-test',codigo:'SDP-261024-SHI-R01',especie:'Shiitake',fechaInoculacion:'2026-10-24',numBolsas:1,estado:'incubacion'}])));
   const url=`http://127.0.0.1:${server.address().port}`;
   await page.goto(url+'/__harness.html?view=bitacora');
   await page.getByTitle('Imprimir etiquetas térmicas del lote', {exact:true}).first().click();
   await page.getByRole('button',{name:/50.*70/}).click();
   const card=page.locator('.thermal-card-preview.thermal-card-50x70').first();
   await expect(card).toBeVisible();await expect(card).toHaveAttribute('data-fonts-ready','true');
   await expect(card.locator('.thermal-date-value')).toHaveText('24 oct 2026');
   await expect(card.locator('.thermal-date-label')).toHaveText('INOCULACIÓN');
   assert.match((await card.locator('.thermal-code').innerText()).replace(/\s/g,''),/^SDP-261024-SHI-R01$/);
   const bounds=await card.evaluate(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,overflow:[...el.querySelectorAll('.thermal-code,.thermal-species,.thermal-badge,.thermal-date-value')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.className)}));
   assert.ok(Math.abs(bounds.w-50*96/25.4)<1);assert.ok(Math.abs(bounds.h-70*96/25.4)<1);assert.deepEqual(bounds.overflow,[]);
   assert.ok(await card.locator('.thermal-wordmark').evaluate(img=>img.complete&&img.naturalWidth>0));
   await card.screenshot({path:path.join(artifacts,`preview-${width}.png`)});
   const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Compartir',exact:true}).click();
   const download=await downloadPromise;await download.saveAs(path.join(artifacts,`share-${width}.png`));
   await page.addScriptTag({url:url+'/vendor/jsQR.js'});
   const decoded=await page.evaluate(async data=>{
    const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();
    const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
    const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const p=ctx.getImageData(0,0,c.width,c.height);
    return{w:c.width,h:c.height,qr:window.jsQR(p.data,c.width,c.height)?.data};
   },fs.readFileSync(path.join(artifacts,`share-${width}.png`)).toString('base64'));
   assert.equal(decoded.w,600);assert.equal(decoded.h,840);assert.ok(decoded.qr?.includes('SDP-261024-SHI-R01-B01'),JSON.stringify(decoded));
   await page.emulateMedia({media:'print'});const printed=page.locator('.thermal-card-print.thermal-card-50x70').first();await expect(printed).toBeVisible();
   await printed.screenshot({path:path.join(artifacts,`print-${width}.png`)});await page.close();
   console.log(`PASS preview, print, PNG and QR decoding at ${width}px`);
  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.rmSync(artifacts,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
