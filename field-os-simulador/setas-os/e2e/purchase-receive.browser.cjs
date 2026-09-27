'use strict';
// La brecha que esto cierra: una compra sólo tenía un estado ('registrada,
// con lotes ya nacidos'). Un pedido encargado al proveedor y todavía no
// descargado en bodega no existía — o se inflaba el físico registrándolo
// antes de tiempo, o quedaba fuera del sistema hasta que llegaba. Ahora
// "Por recibir" no toca la bodega y sólo se proyecta como `entrante`;
// "Registrar recepción" es lo único que mueve el físico. Este arnés monta
// la app de verdad porque un test que lee el .jsx como texto no puede
// probar que los kilos NO se muevan (ni que luego sí se muevan).
// Ejecutar: node e2e/purchase-receive.browser.cjs
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');

const stockDe=async(page,id)=>page.evaluate(ing=>{
  const lotes=JSON.parse(localStorage.getItem('sdp_lotes')||'[]');
  return lotes.filter(l=>l.ingredienteId===ing&&l.activo)
    .reduce((s,l)=>s+(Number(l.cantidadKgDisponible)||0),0);
},id);

(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  const body=fs.readFileSync(file);
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
  res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.SETAS_CHROMIUM_EXECUTABLE||undefined});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errores=[];page.on('pageerror',e=>errores.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>{
   localStorage.setItem('sdp_seeded','1');
   // "paja_trigo" ya tiene 5 kg físicos en bodega — así la fila existe en la
   // tabla de Stock desde el arranque (ingIds sólo lista ingredientes con
   // lote activo) y se ve con claridad que comprar más NO toca ese físico
   // hasta que se recibe.
   localStorage.setItem('sdp_lotes',JSON.stringify([
     {id:'fx-1',ingredienteId:'paja_trigo',compraId:'compra_fx',activo:true,cantidadKgTotal:5,cantidadKgDisponible:5,precioPorKgCOP:1000,fechaIngreso:'2026-01-01',unidad:'kg'},
   ]));
   localStorage.setItem('sdp_movimientos','[]');
   localStorage.setItem('sdp_proveedores',JSON.stringify([{id:'prov_test',nombre:'Proveedor de Prueba',tipo:'directo',municipio:'Tenjo'}]));
   localStorage.setItem('sdp_compras','[]');
   localStorage.setItem('sdp_inv_reservas','[]');
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/__harness.html?view=inventario`);
  await page.waitForFunction(()=>window.SetasPurchases&&typeof window.SetasPurchases.receiveCompra==='function');

  const tabla=page.locator('.inventory-stock-table');
  await page.locator('.inv-subtab-bar button',{hasText:'Compra'}).click();

  await page.selectOption('#purchase-provider','prov_test');
  await page.locator('select[aria-label="Ingrediente de la compra"]').selectOption('paja_trigo');
  await page.locator('input[placeholder="kg"]').fill('10');
  await page.locator('input[placeholder="$/kg"]').fill('1200');

  // ── 1. "Por recibir" NO mueve físico, sí muestra entrante ────────────────
  await page.locator('[data-testid="cmp-estado-pendiente"]').click();
  const fechaLabel=await page.locator('label[for="purchase-date"]').innerText();
  assert.match(fechaLabel,/esperada/i,`la etiqueta de fecha no cambió a "esperada": ${fechaLabel}`);
  const botonRegistrar=page.getByRole('button',{name:/Registrar pedido/});
  await expect(botonRegistrar).toBeVisible();
  await botonRegistrar.click();

  const pajaAntesDeRecibir=await stockDe(page,'paja_trigo');
  assert.equal(pajaAntesDeRecibir,5,'"Por recibir" ya movió el físico de bodega');

  // El aviso de confirmación dice explícitamente que el físico no cambió.
  const banner=page.locator('[data-testid="purchase-confirm-banner"]');
  await expect(banner).toBeVisible();
  const avisoTexto=await banner.innerText();
  assert.match(avisoTexto,/Pedido registrado/,`el aviso no dice "Pedido registrado": ${avisoTexto}`);
  assert.match(avisoTexto,/no cambi/i,`el aviso no dice que el físico no cambió: ${avisoTexto}`);
  const itemsTexto=await page.locator('.inv-section').first().innerText();
  assert.match(itemsTexto,/en camino/i,`el resumen no muestra los kg en camino: ${itemsTexto}`);
  await page.getByRole('button',{name:/Registrar otra compra/}).click();

  // ── 2. La tabla de Stock muestra Entrante, Físico sigue en 0 ─────────────
  await page.locator('.inv-subtab-bar button',{hasText:'Stock'}).click();
  await tabla.first().waitFor({state:'visible'});
  const cabeceras=await tabla.first().locator('th').allInnerTexts();
  assert.ok(cabeceras.some(h=>/Entrante/i.test(h)),`cabeceras: ${cabeceras.join(' | ')}`);
  const filaEntrante=await tabla.first().locator('[data-label="Entrante"]').first().innerText();
  assert.match(filaEntrante,/10\.0 kg/,`Entrante no muestra los 10 kg pedidos: ${filaEntrante}`);
  const filaFisico=await tabla.first().locator('[data-label="Físico"]').first().innerText();
  assert.match(filaFisico,/5\.0 kg/,`Físico se movió antes de recibir: ${filaFisico}`);

  // ── 3. La compra aparece en el panel de pendientes ───────────────────────
  await page.locator('.inv-subtab-bar button',{hasText:'Compra'}).click();
  const panelPendientes=page.locator('[data-testid="pending-purchases"]');
  await expect(panelPendientes).toBeVisible();
  const filaPendiente=page.locator('[data-testid="pending-purchase"]');
  await expect(filaPendiente).toHaveCount(1);
  const textoPendiente=await filaPendiente.innerText();
  assert.match(textoPendiente,/Proveedor de Prueba/,`la fila pendiente no nombra el proveedor: ${textoPendiente}`);
  assert.match(textoPendiente,/10\s*kg/,`la fila pendiente no muestra los kg: ${textoPendiente}`);

  // El botón "Registrar recepción" se pulsa con guantes: ≥48px de alto de verdad.
  const botonRecibir=filaPendiente.getByRole('button',{name:/Registrar recepción/});
  const cajaBoton=await botonRecibir.boundingBox();
  assert.ok(cajaBoton,'no se pudo medir el botón "Registrar recepción"');
  assert.ok(cajaBoton.height>=48,`el botón mide ${cajaBoton.height}px de alto, menos de 48px`);

  // El selector "Ya la recibí / Por recibir" se pulsa con los mismos guantes.
  // Nota: en [data-mode="field"] el design system impone
  // min-height:var(--tap-target-min,44px)!important a TODO botón
  // (ds-2026/components/core/interaction.css), así que un minHeight inline de
  // 48 no gana: hay que llevar la clase sdp-btn--field. Esto lo mide de verdad.
  for(const tid of ['cmp-estado-recibida','cmp-estado-pendiente']){
    const caja=await page.locator(`[data-testid="${tid}"]`).boundingBox();
    assert.ok(caja,`no se pudo medir ${tid}`);
    assert.ok(caja.height>=48,`${tid} mide ${caja.height}px de alto, menos de 48px`);
  }

  // ── 4. Recibir SÍ mueve el físico y el entrante vuelve a 0 ───────────────
  await botonRecibir.click();
  const dlg=page.getByRole('dialog',{name:'Registrar recepción',exact:true});
  await expect(dlg).toBeVisible();
  const textoModal=await dlg.innerText();
  assert.match(textoModal,/Proveedor de Prueba/,`el modal de confirmación no nombra el proveedor: ${textoModal}`);
  assert.match(textoModal,/10\.0 kg/,`el modal de confirmación no dice los kg: ${textoModal}`);
  await dlg.getByRole('button',{name:/Confirmar recepción/}).click();

  await expect.poll(async()=>await stockDe(page,'paja_trigo')).toEqual(15);
  await page.locator('.inv-modal-actions button',{hasText:'Aceptar'}).click();

  await page.locator('.inv-subtab-bar button',{hasText:'Stock'}).click();
  await tabla.first().waitFor({state:'visible'});
  const filaFisicoDespues=await tabla.first().locator('[data-label="Físico"]').first().innerText();
  assert.match(filaFisicoDespues,/15\.0 kg/,`el físico no reflejó la recepción: ${filaFisicoDespues}`);
  const filaEntranteDespues=await tabla.first().locator('[data-label="Entrante"]').first().innerText();
  assert.match(filaEntranteDespues.trim(),/^—$/,`el entrante no volvió a 0 tras recibir: ${filaEntranteDespues}`);

  // Y el pedido ya no aparece como pendiente.
  await page.locator('.inv-subtab-bar button',{hasText:'Compra'}).click();
  await expect(page.locator('[data-testid="pending-purchases"]')).toHaveCount(0);

  // El historial refleja el estado final "Recibida".
  await page.locator('.inv-subtab-bar button',{hasText:'Historial'}).click();
  const filaHistorial=page.locator('.inv-table tbody tr').first();
  await filaHistorial.waitFor({state:'visible'});
  const textoHistorial=await filaHistorial.innerText();
  assert.match(textoHistorial,/Recibida/i,`el historial no marca la compra como Recibida: ${textoHistorial}`);

  assert.deepEqual(errores,[]);
  console.log('OK e2e/purchase-receive: "Por recibir" no mueve bodega y se proyecta como entrante; "Registrar recepción" sí mueve el físico');
 }finally{
  if(browser)await browser.close();
  server.close();
 }
})().catch(err=>{console.error(err);process.exit(1);});
