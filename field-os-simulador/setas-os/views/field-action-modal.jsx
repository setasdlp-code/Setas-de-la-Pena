// Hoja de acción de campo (captura rápida desde QR o desde Hoy).
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito y genera simulador-app.js. No se carga solo.

const FieldActionModal = ({
  onClose,
  lote,
  db,
  operatorRole = 'produccion',
  operatorId = 'operario_local',
  accountId = 'setas_default_account',
  onTransitionConfirmed,
  captureContent,
}) => {
  const [selectedTo, setSelectedTo] = React.useState('');
  const [inFlight, setInFlight] = React.useState(false);
  const [queueEntry, setQueueEntry] = React.useState(null);
  const [actionError, setActionError] = React.useState('');
  const [actionSuccess, setActionSuccess] = React.useState('');
  const [localBatch, setLocalBatch] = React.useState(lote);

  React.useEffect(() => {
    setLocalBatch(lote);
    setSelectedTo('');
    setActionError('');
    setActionSuccess('');
  }, [lote]);

  React.useEffect(() => {
    if (!localBatch || !db) return;
    let active = true;
    const queue = typeof window !== 'undefined' ? window.SetasFieldEventQueue : null;
    if (queue && typeof queue.getReservation === 'function') {
      const batchId = localBatch.id || localBatch.codigo;
      queue.getReservation(db, accountId, batchId).then(reservation => {
        if (!active) return;
        if (!reservation) {
          setQueueEntry(null);
          return;
        }
        try {
          const tx = db.transaction('queue_entries', 'readonly');
          const req = tx.objectStore('queue_entries').get(reservation.eventId);
          req.onsuccess = () => {
            if (active) setQueueEntry(req.result || null);
          };
          req.onerror = () => {
            if (active) setQueueEntry(null);
          };
        } catch (_) {
          if (active) setQueueEntry(null);
        }
      }).catch(() => {
        if (active) setQueueEntry(null);
      });
    }
    return () => { active = false; };
  }, [localBatch, db, accountId]);

  const actionSheetModule = typeof window !== 'undefined' ? window.SetasFieldActionSheet : null;
  // acceptFieldEvent ya está desplegada, así que la confirmación es real salvo
  // que alguien haya pedido el simulacro a propósito.
  const model = actionSheetModule && typeof actionSheetModule.buildActionSheetModel === 'function'
    ? actionSheetModule.buildActionSheetModel({
        simulated: fieldMockRequested(),
        batch: localBatch,
        batchId: localBatch?.id || localBatch?.codigo,
        state: localBatch?.workflowState || localBatch?.state,
        operatorRole,
        queueEntry,
        inFlight,
      })
    : {
        title: localBatch ? `Lote ${localBatch.codigo || localBatch.id}` : 'Lote',
        subtitle: localBatch?.especie || '',
        state: localBatch?.workflowState || localBatch?.estado || 'inoculated',
        options: [],
        status: 'idle',
        statusLabel: 'Listo para registrar',
        canConfirm: false,
        canRefresh: false,
      };

  React.useEffect(() => {
    if (model.options && model.options.length > 0 && !selectedTo) {
      setSelectedTo(model.options[0].to);
    }
  }, [model.options, selectedTo]);

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'saved_local': return <AppIcon name="qr" size={13} />;
      case 'sending': return <AppIcon name="radio" size={13} />;
      case 'confirmed': return <AppIcon name="check" size={13} />;
      case 'simulated': return <AppIcon name="flask" size={13} />;
      case 'conflict': return <AppIcon name="alert" size={13} />;
      case 'rejected': return <AppIcon name="close" size={13} />;
      default: return null;
    }
  };

  const handleConfirm = async () => {
    if (!selectedTo) return;
    setActionError('');
    setActionSuccess('');
    setInFlight(true);

    try {
      if (!actionSheetModule || typeof actionSheetModule.confirmTransition !== 'function') {
        throw new Error('field_action_sheet_unavailable: módulo de hoja de acción no cargado');
      }
      if (!db) {
        throw new Error('db_unavailable: base de datos local no inicializada');
      }

      const fromState = model.state;
      const expectedBatchRevision = Number.isInteger(localBatch?.revision) ? localBatch.revision : 0;

      const result = await actionSheetModule.confirmTransition({
        db,
        batch: localBatch,
        from: fromState,
        to: selectedTo,
        accountId,
        operatorId,
        operatorRole,
        expectedBatchRevision,
        confirmed: true,
      });

      setQueueEntry(result.queueEntry);
      setActionSuccess(`Transición guardada localmente: ${model.state} → ${selectedTo}`);

      // Sincronizar de inmediato. Sin esto el evento se quedaría en
      // "Guardado en este equipo" para siempre, que es justo el estado que el
      // operario no debe confundir con una confirmación.
      await runFieldSync(db, accountId, result.event.id, setQueueEntry);
      setInFlight(false);

      if (typeof onTransitionConfirmed === 'function') {
        onTransitionConfirmed(localBatch.id, selectedTo, result.event);
      }
    } catch (err) {
      setInFlight(false);
      setActionError(err.message || 'Error al confirmar transición');
    }
  };

  const handleRefresh = () => {
    setQueueEntry(null);
    setActionError('');
    setActionSuccess('');
  };

  return (
    <AccessibleModal
      onClose={onClose}
      label="Hoja de acción de campo (QR)"
      dialogStyle={{
        width: 'min(480px, 94vw)',
        padding: '20px 18px',
        background: 'var(--paper-1)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-md, 3px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 2 }}>
            Registro de campo · Acciones del lote
          </div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif, "Gaya", Georgia, serif)', fontSize: 18, color: 'var(--ink-0)', fontWeight: 700 }}>
            {model.title}
          </h2>
          {model.subtitle && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-1)', marginTop: 2 }}>
              {model.subtitle}
            </div>
          )}
        </div>
        <button
          type="button"
          className="modal-icon-close"
          aria-label="Cerrar hoja de acción"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--ink-2)' }}
        >
          <AppIcon name="close" size={14} />
        </button>
      </div>

      <div style={{ padding: '10px 12px', background: 'var(--paper-0)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--sim-radius-sm, 2px)', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-2)', display: 'block' }}>
            Estado Actual
          </span>
          <strong style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-0)' }}>
            {actionSheetModule?.STATE_LABELS?.[model.state] || model.state}
          </strong>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)', background: 'var(--paper-100)', padding: '3px 7px', borderRadius: 2 }}>
          Rol: {operatorRole}
        </span>
      </div>

      {['saved_local', 'sending', 'confirmed', 'conflict', 'rejected'].includes(model.status) && (
        <div
          data-testid={`status-${model.status.replace('_', '-')}`}
          data-simulated={model.simulated ? 'true' : 'false'}
          style={{
            padding: '12px 14px',
            marginBottom: 14,
            background: model.statusPalette.bg,
            border: `1.5px solid ${model.statusPalette.border}`,
            borderRadius: 3,
            color: model.statusPalette.fg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <span>{renderStatusIcon(model.simulated ? 'simulated' : model.status)}</span>
            <span>{model.statusHeading}</span>
          </div>
          {model.showStatusLabel && (
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
              {model.statusLabel}
            </div>
          )}
          <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.4, color: model.statusPalette.sub }}>
            {model.statusDetail}
          </div>
        </div>
      )}

      {captureContent}

      {model.status === 'sending' && (
        <div
          data-testid="status-sending"
          style={{
            padding: '12px 14px',
            marginBottom: 14,
            background: 'color-mix(in srgb, var(--status-info) 10%, var(--paper-50))',
            border: '1px solid var(--status-info)',
            borderRadius: 3,
            color: 'var(--status-info)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12 }}>
            <AppIcon name="clock" size={13} /> <span>ENVIANDO AL SERVIDOR...</span>
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            Transmitiendo evento de campo al servidor central...
          </div>
        </div>
      )}

      {model.status === 'conflict' && (
        <div
          data-testid="status-conflict"
          style={{
            padding: '12px 14px',
            marginBottom: 14,
            background: 'var(--status-error-bg)',
            border: '1.5px solid var(--status-error)',
            borderRadius: 3,
            color: 'var(--status-error)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12 }}>
            <AppIcon name="alert" size={13} /> <span>CONFLICTO DE REVISIÓN</span>
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            El lote cambió de versión en el servidor o fue actualizado desde otro equipo.
          </div>
          <button
            type="button"
            className="inv-btn inv-btn-sec"
            style={{ marginTop: 8, padding: '5px 10px', fontSize: 11, background: 'var(--paper-50)' }}
            onClick={handleRefresh}
          >
            <AppIcon name="rotate" size={12} style={{marginRight:4}} /> Refrescar lote
          </button>
        </div>
      )}

      {actionError && (
        <div style={{ padding: '8px 10px', background: 'var(--status-error-bg)', color: 'var(--status-error)', borderLeft: '3px solid var(--status-error)', borderRadius: 2, fontSize: 11, marginBottom: 12 }}>
          <><AppIcon name="alert" size={12} style={{marginRight:4}} /> {actionError}</>
        </div>
      )}
      {actionSuccess && (
        <div style={{ padding: '8px 10px', background: 'var(--status-ok-bg)', color: 'var(--status-ok)', borderLeft: '3px solid var(--status-ok-marker)', borderRadius: 2, fontSize: 11, marginBottom: 12 }}>
          <><AppIcon name="check" size={12} style={{marginRight:4}} /> {actionSuccess}</>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-1)', marginBottom: 8 }}>
          Transiciones Disponibles
        </div>

        {model.options.length === 0 ? (
          <div style={{ padding: '12px', background: 'var(--paper-0)', border: '1px dashed var(--border-hairline)', borderRadius: 3, fontSize: 12, color: 'var(--ink-2)', textAlign: 'center' }}>
            No hay transiciones disponibles para este lote en su estado actual ({model.state}).
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {model.options.map(opt => {
              const isSelected = selectedTo === opt.to;
              const isDiscard = opt.transitionClass === 'discard';
              const isException = opt.transitionClass === 'exception';

              return (
                <label
                  key={opt.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: isSelected ? 'var(--paper-0)' : 'var(--paper-50)',
                    border: isSelected ? '2px solid var(--accent-olive)' : '1px solid var(--border-hairline)',
                    borderRadius: 3,
                    cursor: model.canConfirm ? 'pointer' : 'default',
                    opacity: model.canConfirm ? 1 : 0.7,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="transitionTarget"
                      value={opt.to}
                      checked={isSelected}
                      disabled={!model.canConfirm}
                      onChange={() => setSelectedTo(opt.to)}
                    />
                    <div>
                      <strong style={{ fontSize: 13, color: isDiscard ? 'var(--coral-700)' : (isException ? 'var(--ochre-700)' : 'var(--ink-0)') }}>
                        {opt.label}
                      </strong>

                    </div>
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 2,
                    background: isDiscard ? 'var(--status-error-bg)' : (isException ? 'var(--status-warn-bg)' : 'color-mix(in srgb, var(--status-info) 10%, var(--paper-50))'),
                    color: isDiscard ? 'var(--status-error)' : (isException ? 'var(--status-warn-text)' : 'var(--status-info)'),
                  }}>
                    {{advance:'Avance',exception:'Excepción',discard:'Descarte'}[opt.transitionClass]||'Cambio'}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap:'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <button
          type="button"
          className="inv-btn inv-btn-sec"
          onClick={onClose}
          style={{ minHeight: 48, padding: '0 14px', fontSize: 12 }}
        >
          Cerrar
        </button>

        {model.canRefresh && (
          <button
            type="button"
            className="inv-btn inv-btn-pri"
            onClick={handleRefresh}
            style={{ minHeight: 48, padding: '0 16px', fontSize: 12, background: 'var(--accent-terracotta)' }}
          >
            <AppIcon name="rotate" size={12} style={{marginRight:4}} /> Refrescar Lote
          </button>
        )}

        <button
          type="button"
          className="inv-btn inv-btn-pri"
          disabled={!model.canConfirm || inFlight || !selectedTo}
          onClick={handleConfirm}
          data-testid="btn-confirm-field-transition"
          style={{
            minHeight: 48,
            maxWidth:'100%',whiteSpace:'normal',
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            background: model.canConfirm && selectedTo ? 'var(--accent-olive)' : 'var(--border-soft)',
            cursor: model.canConfirm && selectedTo ? 'pointer' : 'not-allowed',
          }}
        >
          {inFlight ? <><AppIcon name="clock" size={12} style={{marginRight:4}} /> Guardando...</> : (selectedTo ? `Confirmar: ${model.options.find(option=>option.to===selectedTo)?.label||selectedTo}` : 'Confirmar transición')}
        </button>
      </div>
    </AccessibleModal>
  );
};
