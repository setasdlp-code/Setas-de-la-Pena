// Vista previa de la ficha pública de trazabilidad de un lote.
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito y genera simulador-app.js. No se carga solo.

const PublicTraceabilityModal=({loteId,loteCode,lotes=[],cosechas=[],bolsas=[],onClose})=>{
  const lote=lotes.find(l=>l.id===loteId||l.codigo===loteCode||l.id===loteCode)||lotes[0];
  const harvests=lote?cosechas.filter(c=>c.loteId===lote.id):[];
  const totalKg=harvests.reduce((s,c)=>s+(parseFloat(c.pesoFresco)||0),0)/1000;
  const spImg=lote?.especieKey?(IMG[lote.especieKey]||IMG.p_ostreatus_gris):IMG.p_ostreatus_gris;
  const [copied,setCopied]=useState(false);
  const [syncing,setSyncing]=useState(false);
  const [syncResult,setSyncResult]=useState(lote?.publicTrace||null);
  const traceUrl=lote?.codigo?`${PUBLIC_TRACE_BASE_URL}?codigo=${encodeURIComponent(lote.codigo)}`:(typeof window!=='undefined'?window.location.href:PUBLIC_TRACE_BASE_URL);
  const qrDataUrl=generateQrSvgDataUrl(traceUrl);

  const diasIncubacion=(()=>{
    if(!lote?.fechaInoculacion) return null;
    const start=new Date(lote.fechaInoculacion);
    const now=new Date();
    const diff=Math.max(0,Math.floor((now-start)/(1000*60*60*24)));
    return diff;
  })();

  const recetaItems=lote?.recetaSnapshot?.ingredientes||lote?.receta||[];

  return(
    <AccessibleModal
      onClose={onClose}
      label="Pasaporte Digital de Trazabilidad · Setas de la Peña"
      dialogStyle={{width:'min(560px,94vw)',padding:0,background:'var(--paper-50)',border:'1px solid var(--border-soft)',borderRadius:'var(--r-md,6px)',overflow:'hidden',boxShadow:'var(--shadow-lift)'}}
    >
      <div style={{background:'var(--ink-900)',color:'var(--paper-50)',padding:'22px 22px 18px',position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{display:'flex',gap:14,alignItems:'center'}}>
            <img src={resolveLogo('_standalone_imgs/logo-sdlp.png')} alt="Setas de la Peña" width="60" height="32" style={{width:60,height:'auto',maxHeight:34,objectFit:'contain',filter:'brightness(1.1) drop-shadow(0 2px 8px rgba(0,0,0,0.4))'}} />
            <div>
              <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--paper-300)'}}>
                <AppIcon name="globe" size={13} color="var(--moss-500)" /> Trazabilidad de Origen · Tenjo, Colombia
              </div>
              <h2 style={{fontFamily:'var(--font-body)',fontSize:22,fontWeight:900,color:'var(--paper-50)',margin:'4px 0 2px',letterSpacing:'-.01em'}}>
                {lote?.especie||'Seta Cultivada'}
              </h2>
              <div style={{fontFamily:'var(--font-sci)',fontStyle:'italic',fontSize:13,color:'var(--paper-200)'}}>
                {lote?.especieCientifico||'Pleurotus ostreatus'}
              </div>
            </div>
          </div>
          <button type="button" className="modal-icon-close" style={{color:'var(--paper-200)',background:'rgba(255,255,255,.08)',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}} onClick={onClose} aria-label="Cerrar ficha"><AppIcon name="close" size={12} /></button>
        </div>
      </div>

      <div style={{padding:'20px 22px',display:'flex',flexDirection:'column',gap:16}}>
        {/* ESTADO DE SINCRONIZACIÓN EN FIRESTORE */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'var(--paper-100)',borderRadius:4,border:'1px solid var(--border-soft)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--ink-500)'}}>
              Ficha en Nube:
            </span>
            <span style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 3,
              background: syncResult?.status === 'synced' ? 'var(--moss-tint)' : syncResult?.status === 'failed' ? 'var(--coral-100)' : 'var(--paper-200)',
              color: syncResult?.status === 'synced' ? 'var(--moss-700)' : syncResult?.status === 'failed' ? 'var(--status-error)' : 'var(--ink-600)'
            }}>
              {syncResult?.status === 'synced' ? <span style={{display:'inline-flex',alignItems:'center',gap:4}}><AppIcon name="check" size={11} /> Publicado</span> : syncResult?.status === 'failed' ? <span style={{display:'inline-flex',alignItems:'center',gap:4}}><AppIcon name="alert" size={11} /> Error al publicar</span> : 'Pendiente de Sincronización'}
            </span>
            {syncResult?.lastPublishedAt && (
              <span style={{fontSize: 10, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)'}}>
                {new Date(syncResult.lastPublishedAt).toLocaleDateString('es-CO')}
              </span>
            )}
            {syncResult?.lastError && (
              <span style={{fontSize: 10, color: 'var(--coral-700)', fontFamily: 'var(--font-mono)'}}>
                ({syncResult.lastError})
              </span>
            )}
          </div>
          <button
            type="button"
            className="inv-btn inv-btn-sec"
            disabled={syncing || !lote}
            style={{fontSize:10.5,padding:'4px 10px',minHeight:32,display:'flex',alignItems:'center',gap:4}}
            onClick={async () => {
              if (!window.SetasPublicTraceDB?.publicarLote) {
                setSyncResult({ status: 'failed', lastError: 'SetasPublicTraceDB no disponible' });
                return;
              }
              setSyncing(true);
              try {
                const loteBolsas = bolsas.filter(b => b.loteId === lote.id);
                const res = await window.SetasPublicTraceDB.publicarLote(lote, harvests, loteBolsas);
                if (res && res.ok) {
                  setSyncResult({ status: 'synced', lastPublishedAt: new Date().toISOString(), lastError: null, publicSchemaVersion: 2 });
                } else {
                  setSyncResult({ status: 'failed', lastError: res?.reason || 'Error' });
                }
              } catch (err) {
                setSyncResult({ status: 'failed', lastError: err?.message || 'Error' });
              } finally {
                setSyncing(false);
              }
            }}
          >
            {syncing ? 'Sincronizando...' : 'Publicar ahora'}
          </button>
        </div>

        {/* CABECERA CON QR MATRIX Y METADATOS DE FINCA */}
        <div style={{display:'flex',gap:16,alignItems:'center',background:'var(--paper-100)',padding:'12px 14px',borderRadius:'var(--sim-r-sm,4px)',border:'1px solid var(--border-soft)'}}>
          <div style={{background:'var(--paper-50)',padding:4,borderRadius:4,border:'1px solid var(--border-soft)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <img src={qrDataUrl} alt={`QR Lote ${lote?.codigo||''}`} width="76" height="76" style={{display:'block'}} />
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <strong style={{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--ink-900)'}}>Lote #{lote?.codigo||'SDP-LOTE'}</strong>
              <span style={{fontSize:10,fontWeight:700,padding:'2px 6px',background:'var(--moss-tint)',color:'var(--moss-700)',borderRadius:3,textTransform:'uppercase'}}>
                {lote?.estado||'Activo'}
              </span>
            </div>
            <div style={{fontFamily:'var(--font-sans)',fontSize:11.5,color:'var(--ink-600)',marginTop:3}}>
              Finca Santa Isabel · Tenjo, Cundinamarca · 2.587 msnm
            </div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10.5,color:'var(--ink-500)',marginTop:2}}>
              {traceUrl}
            </div>
          </div>
        </div>

        {/* TIMELINE BIOLÓGICO Y RENDIMIENTO */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          <div style={{background:'var(--paper-0)',border:'1px solid var(--border-soft)',borderRadius:4,padding:'10px 12px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9.5,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--ink-500)'}}>Inoculación</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:12.5,fontWeight:700,color:'var(--ink-900)',marginTop:2}}>
              {lote?.fechaInoculacion||'—'}
            </div>
          </div>
          <div style={{background:'var(--paper-0)',border:'1px solid var(--border-soft)',borderRadius:4,padding:'10px 12px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9.5,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--ink-500)'}}>Días en Proceso</div>
            <div style={{fontFamily:'var(--font-num)',fontSize:14,fontWeight:700,color:'var(--ink-900)',marginTop:2}}>
              {diasIncubacion!=null?`${diasIncubacion} días`:'—'}
            </div>
          </div>
          <div style={{background:'var(--paper-0)',border:'1px solid var(--border-soft)',borderRadius:4,padding:'10px 12px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9.5,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--ink-500)'}}>Cosecha Total</div>
            <div style={{fontFamily:'var(--font-num)',fontSize:14,fontWeight:700,color:'var(--moss-700)',marginTop:2}}>
              {totalKg>0?`${totalKg.toFixed(2)} kg`:'En sala'}
            </div>
          </div>
        </div>

        {/* COMPOSICIÓN DE SUSTRATO & CERTIFICACIÓN LIMPIA */}
        {recetaItems.length>0&&(
          <div style={{background:'var(--paper-0)',border:'1px solid var(--border-soft)',borderRadius:4,padding:'10px 12px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9.5,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--ink-500)',marginBottom:6}}>
              Fórmula de Sustrato Lignocelulósico
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {recetaItems.map((item,idx)=>{
                const g=typeof INGS!=='undefined'?INGS.find(i=>i.id===item.id):null;
                return (
                  <span key={idx} style={{fontSize:11,padding:'2px 8px',background:'var(--paper-100)',borderRadius:3,border:'1px solid var(--border-soft)',color:'var(--ink-800)'}}>
                    <strong>{item.p||item.pct}%</strong> {g?.name||item.id}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div style={{background:'var(--surface-accent-soft)',border:'1px solid var(--moss-300)',borderRadius:4,padding:'12px 14px'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,color:'var(--moss-900)',fontFamily:'var(--font-body)',fontWeight:800,fontSize:12}}>
            <AppIcon name="check" size={14} color="var(--moss-700)" /> Sustrato 100% Botánico Limpio
          </div>
          <p style={{fontFamily:'var(--font-sans)',fontSize:11.5,color:'var(--moss-900)',margin:'4px 0 0',lineHeight:1.45}}>
            Cultivado a 2.587 msnm sin pesticidas químicos ni fertilizantes sintéticos. Hidratado con agua pura de montaña y pasteurizado térmicamente.
          </p>
        </div>

        {/* ACCIONES DEL MODAL */}
        <div style={{display:'flex',gap:8,justifyContent:'space-between',alignItems:'center',marginTop:4}}>
          <span style={{fontSize:11,color:copied?'var(--moss-700)':'var(--ink-500)',fontWeight:copied?700:400}}>
            {copied?<span style={{display:'inline-flex',alignItems:'center',gap:4}}><AppIcon name="check" size={11} /> Enlace QR copiado al portapapeles</span>:'Enlace público para clientes y auditorías'}
          </span>
          <div style={{display:'flex',gap:8}}>
            <button
              type="button"
              className="inv-btn inv-btn-sec"
              style={{fontSize:11,display:'flex',alignItems:'center',gap:6}}
              onClick={()=>{
                navigator.clipboard?.writeText?.(traceUrl);
                setCopied(true);
                setTimeout(()=>setCopied(false),2500);
              }}
            >
              <AppIcon name="globe" size={13} /> {copied?'Copiado':'Copiar Enlace'}
            </button>
            <button type="button" className="inv-btn inv-btn-pri" onClick={onClose} style={{fontSize:11}}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </AccessibleModal>
  );
};
