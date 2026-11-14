// Hub de integración IoT: lista de nodos, generador de firmware y consola webhook.
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito y genera simulador-app.js. No se carga solo.

const handleTestWebhook = (rawJson, onInjectReading, setSelectedClimateRoom, setNoticeDlg, firestoreEnabled = true) => {
  try {
    const data = JSON.parse(rawJson);
    const roomId = data.room_id || data.roomId || 'martha_01';
    const temp = Number(data.temperature_c ?? data.temp ?? data.temperature ?? 18.0);
    const rh = Number(data.rh_pct ?? data.rh ?? data.humidity ?? 85.0);
    const co2 = Number(data.co2_ppm ?? data.co2 ?? 700);
    const subTemp = data.substrate_temperature_c != null ? Number(data.substrate_temperature_c) : null;
    
    if (typeof onInjectReading === 'function') {
      onInjectReading({
        roomId,
        temp,
        rh,
        co2,
        subTemp,
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }
    if (typeof setSelectedClimateRoom === 'function') {
      setSelectedClimateRoom(roomId);
    }
    // Sincronización en la nube hacia Firestore — respeta el toggle "Firestore"
    // de la pestaña Conexión: si el operario lo desmarcó, la lectura de prueba
    // no debe filtrarse a telemetria_lecturas/telemetria_salas de producción.
    if (firestoreEnabled && typeof window !== 'undefined' && window.SetasFirebase && typeof window.SetasFirebase.pushClimateReading === 'function') {
      window.SetasFirebase.pushClimateReading({
        roomId,
        temperature_c: temp,
        rh_pct: rh,
        co2_ppm: co2,
        substrate_temperature_c: subTemp,
        source: 'iot_hub_webhook'
      }).catch(e => console.warn('[IoT Hub] Error sincronizando a Firestore:', e));
    }
    return {
      success: true,
      msg: `Telemetría recibida con éxito para sala "${roomId}": ${temp.toFixed(1)}°C, ${rh.toFixed(1)}% HR, ${co2.toFixed(0)} ppm CO2.`
    };
  } catch (err) {
    return {
      success: false,
      msg: `Error al procesar JSON: ${err.message}`
    };
  }
};

const IoTHubModal = ({ isOpen, onClose, selectedRoomId = 'martha_01', onInjectReading, setSelectedClimateRoom, setNoticeDlg, liveTelemetry = null }) => {
  const [tab, setTab] = useState('nodos');
  const [nodes, setNodes] = useState(DEFAULT_IOT_NODES);
  const [fwMcu, setFwMcu] = useState('esp32dev');
  const [fwSensors, setFwSensors] = useState(['sht3xd', 'scd30']);
  const [fwRelays, setFwRelays] = useState(['ch1_humidifier', 'ch2_fae']);
  const [fwRoom, setFwRoom] = useState(selectedRoomId || 'martha_01');
  const [fwWifiSsid, setFwWifiSsid] = useState('SetasPeña_2.4G');
  const [fwWifiPass, setFwWifiPass] = useState('**********');
  const [fwServerHost, setFwServerHost] = useState('192.168.1.100');
  const [fwServerPort, setFwServerPort] = useState('8080');
  const [fwFormat, setFwFormat] = useState('esphome');
  // Formulario de conexión en vivo. Se siembra con la configuración vigente del
  // puente: sin esto el operario no tiene forma de apuntar la app a su gateway
  // o su broker, y los transportes WebSocket/MQTT quedan inalcanzables.
  const liveCfg = (liveTelemetry && liveTelemetry.config) || {};
  const [connWs, setConnWs] = useState(liveCfg.websocketUrl || '');
  const [connMqtt, setConnMqtt] = useState(liveCfg.mqttUrl || '');
  const [connTopics, setConnTopics] = useState((liveCfg.mqttTopics || ['setas/+/+/#']).join(', '));
  const [connFirestore, setConnFirestore] = useState(liveCfg.firestore !== false);
  const [connPressure, setConnPressure] = useState(String(liveCfg.pressureHpa || 745));
  const [connSaved, setConnSaved] = useState(false);

  const [webhookJson, setWebhookJson] = useState(`{\n  "room_id": "${selectedRoomId || 'martha_01'}",\n  "temperature_c": 18.4,\n  "rh_pct": 89.2,\n  "co2_ppm": 710,\n  "substrate_temperature_c": 19.3\n}`);
  const [webhookFeedback, setWebhookFeedback] = useState(null);

  // Automation rules
  const [autoRhMin, setAutoRhMin] = useState(85);
  const [autoRhTarget, setAutoRhTarget] = useState(90);
  const [autoCo2Max, setAutoCo2Max] = useState(900);
  const [autoFaeDuration, setAutoFaeDuration] = useState(35);
  const [autoSubTempMax, setAutoSubTempMax] = useState(28.0);

  if (!isOpen) return null;

  const generatedCode = fwFormat === 'esphome'
    ? generateESPHomeYaml({ deviceName: `setas-${fwRoom}`, roomId: fwRoom, mcu: fwMcu, sensors: fwSensors, relays: fwRelays, wifiSsid: fwWifiSsid, wifiPass: fwWifiPass, serverHost: fwServerHost, serverPort: fwServerPort })
    : fwFormat === 'arduino'
    ? generateArduinoIno({ deviceName: `setas-${fwRoom}`, roomId: fwRoom, wifiSsid: fwWifiSsid, wifiPass: fwWifiPass, serverHost: fwServerHost, serverPort: fwServerPort })
    : generateCurlPayload({ roomId: fwRoom, temp: 18.4, rh: 89.2, co2: 710, subTemp: 19.3, serverHost: fwServerHost, serverPort: fwServerPort });

  const toggleSensor = id => {
    setFwSensors(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleRelay = id => {
    setFwRelays(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <AccessibleModal
      onClose={onClose}
      label="Hub de Integración IoT & Telemetría"
      dialogClassName="inv-modal iot-hub-dialog"
      backdropClassName="inv-modal-bg iot-hub-backdrop"
      dialogStyle={{ width: 'min(860px, 94vw)', padding: 0, background: 'var(--paper-0)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--sim-radius-sm, 2px)', overflow: 'hidden', boxShadow: '0 12px 40px rgba(26,20,16,0.18)' }}
    >
      {/* Header */}
      <div className="iot-hub-header" style={{ background: 'var(--ink-0)', color: 'var(--paper-50)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AppIcon name="temp" size={20} color="var(--accent-olive)" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: 0, fontWeight: 700 }}>
              Hub de Integración IoT & Hardware de Bajo Costo
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--paper-300)', marginTop: 2 }}>
              Setas de la Peña · Tenjo (2.587 msnm) · ESP32 / Sonoff / SHT3x / SCD30
            </div>
          </div>
        </div>
        <button type="button" className="modal-icon-close" aria-label="Cerrar Hub IoT" style={{ color: 'var(--paper-50)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }} onClick={onClose}><AppIcon name="close" size={12} /></button>
      </div>

      <div className="iot-hub-navigation">
        <div className="iot-hub-pills" role="tablist" aria-label="Secciones del Hub IoT" onKeyDown={e=>{
          const keys=['nodos','firmware','webhook','conexion','reglas'];
          const index=keys.indexOf(tab);
          const next=e.key==='ArrowRight'?(index+1)%keys.length:e.key==='ArrowLeft'?(index+keys.length-1)%keys.length:e.key==='Home'?0:e.key==='End'?keys.length-1:null;
          if(next===null)return;
          e.preventDefault();setTab(keys[next]);
          e.currentTarget.querySelector(`#iot-hub-tab-${keys[next]}`)?.focus();
        }}>
          {[
            ['nodos',`Nodos en Finca (${nodes.length})`,'radio'],
            ['firmware','Generador de Firmware','bolt'],
            ['webhook','Consola Webhook / Test','flask'],
            ['conexion','Conexión en Vivo','plug'],
            ['reglas','Reglas de Automatización','gear'],
          ].map(([key,label,icon])=><button key={key} type="button" id={`iot-hub-tab-${key}`} role="tab" aria-selected={tab===key} aria-controls="iot-hub-panel" tabIndex={tab===key?0:-1} className={`iot-hub-pill ${tab===key?'on':''}`} onClick={()=>setTab(key)}>
            <AppIcon name={icon} size={14} style={{marginRight:6}}/>{label}
          </button>)}
        </div>
      </div>

      <div className="iot-hub-body" role="tabpanel" id="iot-hub-panel" aria-labelledby={`iot-hub-tab-${tab}`} tabIndex={0}>
        {tab === 'nodos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-2)' }}>
                Nodos ESP32 y microcontroladores transmitiendo telemetría activa en las carpas de Tenjo:
              </div>
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={() => setTab('firmware')}
                style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                + Configurar Nuevo Dispositivo
              </button>
            </div>

            {nodes.map(n => (
              <div key={n.id} className="iot-node-card">
                <div className="iot-node-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink-0)' }}>
                        {n.name}
                      </span>
                      <span className="iot-node-badge online">
                        ● {n.status}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', marginTop: 2 }}>
                      IP: {n.ip} · MAC: {n.mac} · RSSI: {n.rssi} dBm (Excelente) · Visto {n.lastSeen}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn--sm"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                      onClick={() => {
                        if (typeof setSelectedClimateRoom === 'function') setSelectedClimateRoom(n.roomId);
                        onClose();
                      }}
                    >
                      Ver Sala en Clima
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginTop: 10 }}>
                  <div style={{ background: 'var(--paper-100)', padding: '8px 10px', borderRadius: 2, border: '1px solid var(--border-hairline)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Temperatura</div>
                    <div style={{ fontFamily: 'var(--font-num)', fontSize: 16, fontWeight: 700, color: 'var(--ink-0)', marginTop: 2 }}>{n.metrics.temp.toFixed(1)}°C</div>
                  </div>
                  <div style={{ background: 'var(--paper-100)', padding: '8px 10px', borderRadius: 2, border: '1px solid var(--border-hairline)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Humedad Relativa</div>
                    <div style={{ fontFamily: 'var(--font-num)', fontSize: 16, fontWeight: 700, color: 'var(--ink-0)', marginTop: 2 }}>{n.metrics.rh.toFixed(1)}%</div>
                  </div>
                  <div style={{ background: 'var(--paper-100)', padding: '8px 10px', borderRadius: 2, border: '1px solid var(--border-hairline)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Dióxido de Carbono</div>
                    <div style={{ fontFamily: 'var(--font-num)', fontSize: 16, fontWeight: 700, color: 'var(--ink-0)', marginTop: 2 }}>{n.metrics.co2} ppm</div>
                  </div>
                  {n.metrics.subTemp != null && (
                    <div style={{ background: 'var(--paper-100)', padding: '8px 10px', borderRadius: 2, border: '1px solid var(--border-hairline)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Sonda Sustrato</div>
                      <div style={{ fontFamily: 'var(--font-num)', fontSize: 16, fontWeight: 700, color: 'var(--ink-0)', marginTop: 2 }}>{n.metrics.subTemp.toFixed(1)}°C</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'firmware' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div>
                <label htmlFor="iot-fw-mcu" style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Microcontrolador</label>
                <select id="iot-fw-mcu" name="iot-fw-mcu" className="field-input" value={fwMcu} onChange={e => setFwMcu(e.target.value)} style={{ width: '100%', fontSize: 12 }}>
                  <option value="esp32dev">ESP32 NodeMCU / WROOM-32 (Recomendado)</option>
                  <option value="esp32c3">ESP32-C3 SuperMini (Compacto)</option>
                  <option value="esp8266">ESP8266 Wemos D1 Mini</option>
                  <option value="sonoff_th16">Sonoff TH16 / DualR3 (Tasmota)</option>
                </select>
              </div>

              <div>
                <label htmlFor="iot-fw-room" style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Sala Asignada</label>
                <select id="iot-fw-room" name="iot-fw-room" className="field-input" value={fwRoom} onChange={e => setFwRoom(e.target.value)} style={{ width: '100%', fontSize: 12 }}>
                  <option value="martha_01">Carpa 01 · Fructificación Orellanas</option>
                  <option value="martha_02">Carpa 02 · Fructificación Shiitake</option>
                  <option value="incubacion_01">Sala 03 · Incubación Térmica</option>
                </select>
              </div>

              <div>
                <div className="iot-hub-server-fields">
                  <div><label htmlFor="iot-fw-host">Host del servidor Setas OS</label>
                    <input id="iot-fw-host" name="iot-fw-host" type="text" className="field-input" autoComplete="off" spellCheck={false} value={fwServerHost} onChange={e=>setFwServerHost(e.target.value)}/>
                  </div>
                  <div><label htmlFor="iot-fw-port">Puerto del servidor</label>
                    <input id="iot-fw-port" name="iot-fw-port" type="text" inputMode="numeric" className="field-input" autoComplete="off" value={fwServerPort} onChange={e=>setFwServerPort(e.target.value)}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Sensores y Relés */}
            <div style={{ background: 'var(--paper-100)', padding: 12, borderRadius: 4, marginBottom: 16, border: '1px solid var(--border-hairline)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Sensores Conectados:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={fwSensors.includes('sht3xd')} onChange={() => toggleSensor('sht3xd')} />
                  SHT3x / SHT45 (T/HR I2C)
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={fwSensors.includes('scd30')} onChange={() => toggleSensor('scd30')} />
                  SCD30 NDIR CO2 (I2C · 2.587 msnm)
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={fwSensors.includes('ds18b20')} onChange={() => toggleSensor('ds18b20')} />
                  DS18B20 Sonda de Sustrato (OneWire)
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={fwSensors.includes('dht22')} onChange={() => toggleSensor('dht22')} />
                  DHT22 Sensor Digital
                </label>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, margin: '12px 0 8px', textTransform: 'uppercase' }}>Actuadores / Relés:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={fwRelays.includes('ch1_humidifier')} onChange={() => toggleRelay('ch1_humidifier')} />
                  Relé Ch1: Humidificador Ultrasónico T7
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={fwRelays.includes('ch2_fae')} onChange={() => toggleRelay('ch2_fae')} />
                  Relé Ch2: Extractor FAE Cloudline H4
                </label>
              </div>
            </div>

            {/* Selector de formato de exportación */}
            <div className="iot-hub-export" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className={`iot-hub-pill ${fwFormat === 'esphome' ? 'on' : ''}`} onClick={() => setFwFormat('esphome')}>
                  <AppIcon name="file" size={12} style={{marginRight:6}} /> ESPHome (YAML)
                </button>
                <button type="button" className={`iot-hub-pill ${fwFormat === 'arduino' ? 'on' : ''}`} onClick={() => setFwFormat('arduino')}>
                  <AppIcon name="wrench" size={12} style={{marginRight:6}} /> Arduino C++ (.ino)
                </button>
                <button type="button" className={`iot-hub-pill ${fwFormat === 'curl' ? 'on' : ''}`} onClick={() => setFwFormat('curl')}>
                  <AppIcon name="globe" size={12} style={{marginRight:6}} /> cURL / Webhook
                </button>
              </div>

              <button
                type="button"
                className="iot-copy-btn"
                onClick={() => {
                  navigator.clipboard?.writeText?.(generatedCode);
                  if (typeof setNoticeDlg === 'function') {
                    setNoticeDlg({ title: 'Código Copiado', msg: 'La configuración de firmware ha sido copiada al portapapeles.' });
                  } else {
                    alert('Código copiado al portapapeles');
                  }
                }}
              >
                <AppIcon name="print" size={12} /> Copiar Código
              </button>
            </div>

            <pre className="iot-code-box">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}

        {tab === 'webhook' && (
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-1)', marginBottom: 12 }}>
              Simula el envío de una petición HTTP POST desde un sensor o pasarela MQTT hacia Setas OS. Al procesarse, los datos validarán el contrato canónico y actualizarán en vivo la sala seleccionada:
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setWebhookJson(`{\n  "room_id": "${selectedRoomId || 'martha_01'}",\n  "temperature_c": 18.2,\n  "rh_pct": 91.0,\n  "co2_ppm": 680,\n  "substrate_temperature_c": 19.0\n}`)}
              >
                Cargar Lectura Nominal (18.2°C · 91% HR)
              </button>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setWebhookJson(`{\n  "room_id": "${selectedRoomId || 'martha_01'}",\n  "temperature_c": 19.5,\n  "rh_pct": 76.5,\n  "co2_ppm": 1150,\n  "substrate_temperature_c": 20.2\n}`)}
              >
                Cargar Alerta (CO2 Alto · HR Baja)
              </button>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setWebhookJson(`{\n  "room_id": "incubacion_01",\n  "temperature_c": 24.2,\n  "rh_pct": 70.0,\n  "co2_ppm": 2600,\n  "substrate_temperature_c": 29.1\n}`)}
              >
                Cargar Alerta Incubación (Sustrato 29.1°C)
              </button>
            </div>

            <label htmlFor="iot-webhook-json">JSON de telemetría de prueba</label>
            <textarea
              id="iot-webhook-json" name="iot-webhook-json" spellCheck={false}
              className="field-input"
              rows={8}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--ink-900)', color: 'var(--surface-recessed)', padding: 12, borderRadius: 4, boxSizing: 'border-box' }}
              value={webhookJson}
              onChange={e => setWebhookJson(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  const res = handleTestWebhook(webhookJson, onInjectReading, setSelectedClimateRoom, setNoticeDlg, connFirestore);
                  setWebhookFeedback(res);
                }}
              >
                <AppIcon name="rocket" size={13} style={{marginRight:6}} /> Inyectar Telemetría de Prueba
              </button>

              {webhookFeedback && (
                <div role="status" aria-live="polite" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: webhookFeedback.success ? 'var(--moss-800)' : 'var(--accent-terracotta)', fontWeight: 700 }}>
                  {webhookFeedback.success ? <AppIcon name="check" size={11} style={{marginRight:4}} /> : <AppIcon name="close" size={11} style={{marginRight:4}} />} {webhookFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'conexion' && (
          <div data-testid="iot-hub-conexion">
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-2)', marginBottom: 14 }}>
              El puente ingiere por los tres transportes a la vez y deduplica las lecturas repetidas:
              si el WebSocket cae, Firestore ya venía llenando el mismo buffer y la curva no queda con un hueco.
              El de mayor prioridad con datos frescos es el que se reporta como fuente activa.
            </div>

            {liveTelemetry && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 16 }}>
                {(liveTelemetry.status.transports || []).map(t => (
                  <div key={t.kind} style={{ padding: '8px 10px', border: '1px solid var(--border-hairline)', borderRadius: 4, background: 'var(--paper-100)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{t.kind}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>
                      {t.state}{t.fresh ? ' · datos frescos' : t.lastDataAt ? ' · sin datos recientes' : ''}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>
                      {t.readingsIn} lecturas · {t.attempts} reintento{t.attempts === 1 ? '' : 's'}
                    </div>
                    {t.lastError && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-terracotta)' }}>{t.lastError}</div>}
                  </div>
                ))}
                {(liveTelemetry.status.transports || []).length === 0 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>
                    Ningún transporte configurado todavía.
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label htmlFor="iot-conn-ws" style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  WebSocket del gateway (prioridad 1 · menor latencia)
                </label>
                <input type="text" id="iot-conn-ws" name="iot-conn-ws" className="field-input" value={connWs} onChange={e => { setConnWs(e.target.value); setConnSaved(false); }}
                  placeholder="wss://gateway.setasdelapena.local/telemetry" style={{ width: '100%', fontSize: 12 }} />
              </div>
              <div>
                <label htmlFor="iot-conn-mqtt" style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  Broker MQTT sobre WebSocket (prioridad 2)
                </label>
                <input type="text" id="iot-conn-mqtt" name="iot-conn-mqtt" className="field-input" value={connMqtt} onChange={e => { setConnMqtt(e.target.value); setConnSaved(false); }}
                  placeholder="wss://broker.setasdelapena.local:9001" style={{ width: '100%', fontSize: 12 }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', marginTop: 3 }}>
                  Mosquitto necesita <code>listener 9001</code> + <code>protocol websockets</code>. Topics: <code>setas/&lt;sala&gt;/&lt;nodo&gt;/&lt;métrica&gt;</code>.
                </div>
              </div>
              <div>
                <label htmlFor="iot-conn-topics" style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Topics suscritos</label>
                <input type="text" id="iot-conn-topics" name="iot-conn-topics" className="field-input" value={connTopics} onChange={e => { setConnTopics(e.target.value); setConnSaved(false); }}
                  style={{ width: '100%', fontSize: 12 }} />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={connFirestore} onChange={() => { setConnFirestore(v => !v); setConnSaved(false); }} />
                  Firestore (prioridad 3 · sobrevive a NAT y firewalls)
                </label>
                <div>
                  <label htmlFor="iot-conn-pressure" style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Presión barométrica local (hPa)
                  </label>
                  <input type="number" id="iot-conn-pressure" name="iot-conn-pressure" className="field-input" value={connPressure} onChange={e => { setConnPressure(e.target.value); setConnSaved(false); }}
                    style={{ width: 120, fontSize: 12 }} />
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>
                745 hPa es la nominal de Tenjo (2.600 msnm). De ella sale el factor ≈1,36× que corrige la subestimación
                de los NDIR. Cambiarla solo con barómetro propio: un valor equivocado desplaza todo el CO₂ histórico.
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button type="button" className="btn btn--sm btn--primary" disabled={!liveTelemetry}
                  onClick={() => {
                    liveTelemetry.setConfig({
                      websocketUrl: connWs.trim(),
                      mqttUrl: connMqtt.trim(),
                      mqttTopics: connTopics.split(',').map(t => t.trim()).filter(Boolean),
                      firestore: connFirestore,
                      pressureHpa: Number(connPressure) || 745,
                    });
                    setConnSaved(true);
                  }}>
                  Guardar y reconectar
                </button>
                {connSaved && (
                  <span role="status" aria-live="polite" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--moss-800)', fontWeight: 700 }}>
                    <AppIcon name="check" size={12} style={{marginRight:4}} /> Puente reiniciado con la configuración nueva
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'reglas' && (
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-1)', marginBottom: 14 }}>
              Configurar los umbrales de actuación local por histéresis y pulsos de recambio de aire (FAE) para las carpas de cultivo en Tenjo:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div style={{ background: 'var(--paper-100)', padding: 14, borderRadius: 4, border: '1px solid var(--border-hairline)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <AppIcon name="droplet" size={13} style={{marginRight:6}} /> Humidificación (Bang-Bang con Histéresis)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label htmlFor="iot-rule-rh-min" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, display: 'block' }}>HR Mínima de Arranque (%)</label>
                    <input type="number" id="iot-rule-rh-min" name="iot-rule-rh-min" className="field-input" value={autoRhMin} onChange={e => setAutoRhMin(Number(e.target.value))} style={{ width: '100%', fontSize: 12 }} />
                  </div>
                  <div>
                    <label htmlFor="iot-rule-rh-target" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, display: 'block' }}>HR Target de Reposo (%)</label>
                    <input type="number" id="iot-rule-rh-target" name="iot-rule-rh-target" className="field-input" value={autoRhTarget} onChange={e => setAutoRhTarget(Number(e.target.value))} style={{ width: '100%', fontSize: 12 }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--paper-100)', padding: 14, borderRadius: 4, border: '1px solid var(--border-hairline)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <AppIcon name="wind" size={13} style={{marginRight:6}} /> Renovación de Aire FAE (Extractor Cloudline)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label htmlFor="iot-rule-co2-max" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, display: 'block' }}>Límite Máximo CO2 (ppm)</label>
                    <input type="number" id="iot-rule-co2-max" name="iot-rule-co2-max" className="field-input" value={autoCo2Max} onChange={e => setAutoCo2Max(Number(e.target.value))} style={{ width: '100%', fontSize: 12 }} />
                  </div>
                  <div>
                    <label htmlFor="iot-rule-fae-duration" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, display: 'block' }}>Duración Pulso FAE (segundos)</label>
                    <input type="number" id="iot-rule-fae-duration" name="iot-rule-fae-duration" className="field-input" value={autoFaeDuration} onChange={e => setAutoFaeDuration(Number(e.target.value))} style={{ width: '100%', fontSize: 12 }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--paper-100)', padding: 14, borderRadius: 4, border: '1px solid var(--border-hairline)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <AppIcon name="temp" size={13} style={{marginRight:6}} /> Seguridad Biológica de Sustrato
                </div>
                <div>
                  <label htmlFor="iot-rule-sub-temp" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, display: 'block' }}>Temperatura Crítica de Sustrato (°C)</label>
                  <input type="number" step="0.5" id="iot-rule-sub-temp" name="iot-rule-sub-temp" className="field-input" value={autoSubTempMax} onChange={e => setAutoSubTempMax(Number(e.target.value))} style={{ width: '100%', fontSize: 12 }} />
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--ink-2)', marginTop: 4 }}>
                    Si la temperatura de sustrato supera 28 °C durante incubación, se dispara alerta de riesgo de daño al micelio.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  if (typeof setNoticeDlg === 'function') {
                    setNoticeDlg({ title: 'Reglas Actualizadas', msg: 'Las reglas de automatización climática para carpas han sido guardadas.' });
                  }
                  onClose();
                }}
              >
                Guardar Parámetros de Automatización
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="iot-hub-footer" style={{ padding: '12px 24px', background: 'var(--paper-100)', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="inv-btn inv-btn-pri" onClick={onClose} style={{ fontSize: 11 }}>
          Cerrar
        </button>
      </div>
    </AccessibleModal>
  );
};
