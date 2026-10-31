'use strict';
// Bandeja de correos de compra (Bodega → Compra → Correos). Monta la app de
// verdad para probar el recorrido completo: el correo se revisa en el
// formulario, entra como "Por recibir" (sin mover físico), las líneas que no
// entran se avisan antes de registrar, el correo sale de la bandeja y queda
// enlazado a la compra, y un archivo de fetch_gmail.py importado dos veces no
// duplica nada. El lector de facturas (IA) se reemplaza por uno fijo.
// Ejecutar: node e2e/purchase-email-inbox.browser.cjs
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const inbox=require('../purchase-email-inbox.js');

const CORREO_HC=inbox.normalizeCorreo({messageId:'<hc-1@homecenter.com.co>',from:'Homecenter <pedidos@homecenter.com.co>',subject:'Confirmación de tu pedido #123',date:'2026-10-30T15:00:00Z',body:'Paja de trigo 10 kg $1.200/kg · Guantes nitrilo x2',origen:'archivo'});
const CORREO_OTRO=inbox.normalizeCorreo({messageId:'<promo@rappi.com>',from:'Rappi <news@rappi.com>',subject:'Tu recibo de Rappi',date:'2026-10-29T15:00:00Z',body:'Pizza',origen:'archivo'});

const leer=(page,key)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'[]'),key);

(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'setas-correos-'));
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:390,height:900}});
  const errores=[];page.on('pageerror',e=>errores.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(([correos])=>{
   if(sessionStorage.getItem('sembrado')) return;
   sessionStorage.setItem('sembrado','1');
   localStorage.setItem('sdp_seeded','1');
   localStorage.setItem('sdp_lotes',JSON.stringify([
     {id:'fx-1',ingredienteId:'paja_trigo',compraId:'compra_fx',activo:true,cantidadKgTotal:5,cantidadKgDisponible:5,precioPorKgCOP:1000,fechaIngreso:'2026-01-01',unidad:'kg'},
   ]));
   localStorage.setItem('sdp_movimientos','[]');
   localStorage.setItem('sdp_proveedores',JSON.stringify([{id:'prov_hc',nombre:'Homecenter Tenjo',tipo:'industrial',municipio:'Tenjo',remitenteCorreo:'homecenter.com.co'}]));
   localStorage.setItem('sdp_compras','[]');
   localStorage.setItem('sdp_inv_reservas','[]');
   localStorage.setItem('sdp_correos_compra',JSON.stringify(correos));
  },[[CORREO_HC,CORREO_OTRO]]);
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=inventario`);
  await page.waitForFunction(()=>window.SetasPurchaseEmailInbox&&window.SetasPurchases);
  await page.evaluate(()=>{
    window.SetasAI={parseInvoiceText:async({text})=>{
      window.__textoLeido=text;
      return {proveedor:'Homecenter',fecha:'2026-10-30',items:[
        {ingrediente:'paja_trigo',kg:10,precio:1200},
        {ingrediente:'Guantes nitrilo',kg:'',precio:8000},
      ]};
    }};
  });

  // ── 1. La pestaña Compra avisa cuántos correos hay por revisar ──────────
  const subCompra=page.locator('.inv-subtab-bar button',{hasText:'Compra'});
  await expect(subCompra).toHaveText(/Compra · 2/);
  await subCompra.click();
  await expect(page.locator('[data-testid="purchase-email-banner"]')).toContainText('2 correos');
  await page.locator('[data-testid="purchase-email-banner"]').click();
  const correos=page.locator('[data-testid="purchase-email"]');
  await expect(correos).toHaveCount(2);
  await expect(correos.first()).toContainText('Proveedor: Homecenter Tenjo');
  // Sin desbordar a 390 px.
  const ancho=await page.evaluate(()=>document.documentElement.scrollWidth);
  assert.ok(ancho<=390,`la bandeja desborda horizontalmente: ${ancho}px`);

  // ── 2. Revisar: formulario lleno, proveedor reconocido, "Por recibir" ───
  await correos.first().getByRole('button',{name:'Revisar y registrar'}).click();
  await expect(page.locator('[data-testid="purchase-email-reviewing"]')).toContainText('Confirmación de tu pedido');
  assert.equal(await page.locator('#purchase-provider').inputValue(),'prov_hc');
  assert.equal(await page.locator('#purchase-date').inputValue(),'2026-10-30');
  assert.match(await page.evaluate(()=>window.__textoLeido),/Asunto: Confirmación de tu pedido/);
  await expect(page.locator('[data-testid="cmp-estado-pendiente"]')).toHaveAttribute('style',/var\(--ink-0\)/);
  await expect(page.getByText('“Guantes nitrilo” sin coincidencia')).toBeVisible();

  // ── 3. Registrar: aviso de la línea que no entra, luego pedido ──────────
  await page.getByRole('button',{name:/Registrar pedido/}).click();
  const dlg=page.getByRole('dialog',{name:'Hay líneas que no se registrarán'});
  await expect(dlg).toContainText('Guantes nitrilo — sin ingrediente');
  await dlg.getByRole('button',{name:'Registrar sin ellas'}).click();
  await expect(page.locator('[data-testid="purchase-confirm-banner"]')).toContainText('Pedido registrado');

  const compras=await leer(page,'sdp_compras');
  assert.equal(compras.length,1);
  assert.equal(compras[0].estado,'pendiente');
  assert.equal(compras[0].origenCorreoId,CORREO_HC.id);
  assert.equal(compras[0].fuenteCaptura,'email');
  assert.equal(compras[0].items.length,1);
  const lotes=await leer(page,'sdp_lotes');
  assert.equal(lotes.reduce((s,l)=>s+l.cantidadKgDisponible,0),5,'un correo movió el físico de bodega');
  const guardados=await leer(page,'sdp_correos_compra');
  assert.equal(guardados.find(c=>c.id===CORREO_HC.id).estado,'importada');
  assert.equal(guardados.find(c=>c.id===CORREO_HC.id).compraId,compras[0].id);
  await expect(subCompra).toHaveText(/Compra · 1/);

  // ── 4. Descartar el que no es una compra de insumos ─────────────────────
  await page.getByRole('button',{name:/Registrar otra compra/}).click();
  await page.locator('[data-testid="cmp-mode-correo"]').click();
  await expect(correos).toHaveCount(1);
  await correos.first().getByRole('button',{name:/Descartar/}).click();
  await page.getByRole('dialog',{name:'Descartar correo'}).getByRole('button',{name:'Descartar'}).click();
  await expect(page.getByText('Sin correos de compra por revisar.')).toBeVisible();
  await expect(subCompra).toHaveText(/^Compra$/);

  // ── 5. Archivo de fetch_gmail.py: importar dos veces no duplica ─────────
  const archivo=path.join(tmp,'sdp_emails.json');
  fs.writeFileSync(archivo,JSON.stringify({generado:'2026-10-31',emails:[
    {id:'imap_1_homecenter',messageId:'<hc-1@homecenter.com.co>',from:'Homecenter <pedidos@homecenter.com.co>',subject:'Confirmación de tu pedido #123',date:'2026-10-30',body:'repetido'},
    {id:'imap_9_homecenter',messageId:'<hc-2@homecenter.com.co>',from:'Homecenter <pedidos@homecenter.com.co>',subject:'Factura electrónica',date:'2026-10-31',body:'Cal agrícola 25 kg'},
  ]}));
  await page.locator('[data-testid="purchase-email-file"]').setInputFiles(archivo);
  await expect(page.getByRole('dialog',{name:'Correos importados'})).toContainText('1 correo nuevo');
  await page.locator('.inv-modal-actions button',{hasText:'Aceptar'}).click();
  await expect(correos).toHaveCount(1);
  await expect(correos.first()).toContainText('Factura electrónica');
  await page.locator('[data-testid="purchase-email-file"]').setInputFiles(archivo);
  await expect(page.getByRole('dialog',{name:'Correos importados'})).toContainText('ya estaban');
  await page.locator('.inv-modal-actions button',{hasText:'Aceptar'}).click();
  await expect(correos).toHaveCount(1);

  // ── 6. Cancelar mientras la IA lee: la respuesta tardía no llena el form ─
  await page.evaluate(()=>{
    const original=window.SetasAI.parseInvoiceText;
    window.SetasAI.parseInvoiceText=args=>new Promise(r=>setTimeout(()=>r(original(args)),600));
  });
  await correos.first().getByRole('button',{name:'Revisar y registrar'}).click();
  await page.getByRole('button',{name:'Cancelar revisión'}).click();
  await page.waitForTimeout(900);
  const ingredientes=await page.locator('select[aria-label="Ingrediente de la compra"]').evaluateAll(els=>els.map(e=>e.value));
  assert.deepEqual(ingredientes,[''],`una lectura cancelada llenó el formulario: ${ingredientes}`);
  // El cuerpo de un correo que ya salió de la bandeja no se guarda en el equipo.
  const guardados2=await leer(page,'sdp_correos_compra');
  assert.equal(guardados2.find(c=>c.id===CORREO_HC.id).cuerpo,'');

  // ── 7. Factura DIAN adjunta: se leen las líneas del XML, no el cuerpo ───
  // Factura sintética, con la forma que deja functions/invoice-attachments.js.
  fs.writeFileSync(archivo,JSON.stringify({emails:[{
    messageId:'<dian-1@homecenter.com.co>',from:'Homecenter <facturacion@homecenter.com.co>',subject:'Factura electrónica SETP99',date:'2026-11-01T15:00:00Z',body:'Adjunto factura electrónica.',
    factura:{tipo:'factura',numero:'SETP99',fecha:'2026-10-28',proveedor:'Proveedor Ficticio S.A.S.',nit:'900000001',moneda:'COP',total:12000,lineasOmitidas:0,
      lineas:[{descripcion:'Paja de trigo picada',cantidad:10,unidad:'kg',unidadCodigo:'KGM',precioUnitario:1200,total:12000,kg:10,precioKg:1200}]},
    adjuntos:[{nombre:'z900000001.zip',tipo:'zip',bytes:2048,estado:'leido'}],
  }]}));
  // Lector fijo sin fecha: así se ve la que pone revisarCorreo.
  await page.evaluate(()=>{window.__textoLeido='';window.SetasAI.parseInvoiceText=async({text})=>{window.__textoLeido=text;return {proveedor:null,fecha:null,items:[{ingrediente:'paja_trigo',kg:10,precio:1200}]};};});
  await page.locator('[data-testid="cmp-mode-correo"]').click();
  await page.locator('[data-testid="purchase-email-file"]').setInputFiles(archivo);
  await page.locator('.inv-modal-actions button',{hasText:'Aceptar'}).click();
  await expect(correos.first()).toContainText('Factura electrónica SETP99');
  await expect(correos.first().locator('[data-testid="purchase-email-adjunto"]')).toHaveText('Factura electrónica SETP99: 1 ítem leído del XML.');
  await correos.first().getByRole('button',{name:'Revisar y registrar'}).click();
  await expect.poll(()=>page.evaluate(()=>window.__textoLeido||'')).toMatch(/- Paja de trigo picada — 10 kg — \$1\.200 por kg/);
  assert.doesNotMatch(await page.evaluate(()=>window.__textoLeido),/Adjunto factura electrónica/);
  // La fecha de la compra es la de la factura, no la del correo.
  assert.equal(await page.locator('#purchase-date').inputValue(),'2026-10-28');

  assert.deepEqual(errores,[]);
  console.log('OK e2e/purchase-email-inbox: correo → revisión → "Por recibir" sin mover físico; líneas caídas avisadas; descartar; archivo idempotente; factura adjunta leída del XML');
 }finally{
  if(browser)await browser.close();
  server.close();
  fs.rmSync(tmp,{recursive:true,force:true});
 }
})().catch(err=>{console.error(err);process.exit(1);});
