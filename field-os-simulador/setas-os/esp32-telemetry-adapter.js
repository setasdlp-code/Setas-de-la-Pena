'use strict';

/**
 * @file esp32-telemetry-adapter.js — Adaptador de Telemetría ESP32 / Sensores Ambientales para Setas OS.
 *
 * Transforma payloads de hardware (SHT3x, SHT45, SCD30, MH-Z19C sobre ESP32/ESPHome)
 * al contrato canónico `setas.telemetry.v1` y los vincula con el `RoomCycle` activo.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const telemetryContract = isNode
    ? require('./telemetry-contract.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasTelemetry : null);

  const roomCycleContract = isNode
    ? require('./room-cycle.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasRoomCycle : null);

  const safeId = value => String(value || '').replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 180);

  const METRIC_ALIASES = {
    // Temperatura ambiente
    temp: 'temperature_c',
    temperature: 'temperature_c',
    temperature_c: 'temperature_c',
    temp_c: 'temperature_c',
    t: 'temperature_c',
    ambiente_temp: 'temperature_c',

    // Humedad relativa
    rh: 'rh_pct',
    humidity: 'rh_pct',
    rh_pct: 'rh_pct',
    humidity_pct: 'rh_pct',
    hr: 'rh_pct',
    hum: 'rh_pct',

    // Dióxido de carbono
    co2: 'co2_ppm',
    co2_ppm: 'co2_ppm',
    carbon_dioxide: 'co2_ppm',
    co2_raw: 'co2_ppm',

    // Temperatura de sustrato
    sub_temp: 'substrate_temperature_c',
    substrate_temp: 'substrate_temperature_c',
    substrate_temperature_c: 'substrate_temperature_c',
    t_sustrato: 'substrate_temperature_c',
    probe_temp: 'substrate_temperature_c'
  };

  /**
   * Encuentra el ciclo activo para una sala y un timestamp específico.
   * @param {string} roomId 
   * @param {string|Date} observedAt 
   * @param {Array} cycles 
   * @returns {object|null}
   */
  const findActiveCycle = (roomId, observedAt, cycles = []) => {
    if (!roomId || !Array.isArray(cycles) || cycles.length === 0) return null;
    const timeMs = new Date(observedAt).getTime();
    if (!Number.isFinite(timeMs)) return null;

    return cycles.find(c => {
      if (!c) return false;
      const rId = String(c.roomId || c.room_id || '').trim();
      if (rId !== String(roomId).trim()) return false;
      const state = c.state || 'planned';
      if (state !== 'active') return false;

      const startMs = c.startAt ? new Date(c.startAt).getTime() : null;
      const endMs = c.endAt ? new Date(c.endAt).getTime() : Infinity;
      if (!Number.isFinite(startMs)) return false;

      return timeMs >= startMs && timeMs <= endMs;
    }) || null;
  };

  /**
   * Evalúa si una lectura está dentro de los targets del RoomCycle.
   * @param {object} reading 
   * @param {object} cycle 
   * @returns {object}
   */
  const evaluateCycleTargets = (reading, cycle) => {
    if (!cycle?.targets || !reading?.metric) {
      return { outOfBand: false, deltaTarget: null, targetBand: null };
    }

    const band = cycle.targets[reading.metric];
    if (!band || typeof band !== 'object') {
      return { outOfBand: false, deltaTarget: null, targetBand: null };
    }

    const val = reading.value;
    if (!Number.isFinite(val)) {
      return { outOfBand: false, deltaTarget: null, targetBand: band };
    }

    let outOfBand = false;
    if (band.min != null && val < band.min) outOfBand = true;
    if (band.max != null && val > band.max) outOfBand = true;

    const deltaTarget = band.target != null ? val - band.target : null;

    return {
      outOfBand,
      deltaTarget,
      targetBand: {
        min: band.min,
        max: band.max,
        target: band.target
      }
    };
  };

  /**
   * Adapta un payload crudo de hardware (ESP32) al contrato setas.telemetry.v1.
   * @param {object|Array} raw 
   * @param {object} options
   * @param {Array} [options.cycles] Lista de RoomCycles para asociar
   * @param {Date|string} [options.now] Timestamp por defecto
   * @returns {Array<object>} Lista de lecturas normalizadas
   */
  const adaptESP32Payload = (raw, options = {}) => {
    if (!raw) return [];
    const payloads = Array.isArray(raw) ? raw : [raw];
    const cycles = options.cycles || [];
    const defaultTime = options.now ? new Date(options.now).toISOString() : new Date().toISOString();

    const normalizedReadings = [];

    payloads.forEach(packet => {
      if (!packet || typeof packet !== 'object') return;

      const roomId = String(packet.room_id || packet.roomId || packet.room || '').trim();
      const deviceId = String(packet.device_id || packet.deviceId || packet.device || 'esp32_unknown').trim();
      const observedAt = packet.observed_at || packet.timestamp || packet.time || defaultTime;
      const calibrationId = packet.calibration_id || packet.calibrationId || null;
      const source = packet.source || 'esp32_sensor';

      const activeCycle = findActiveCycle(roomId, observedAt, cycles);

      // Caso 1: Array explícito de readings [ { metric, value, unit } ]
      if (Array.isArray(packet.readings)) {
        packet.readings.forEach(item => {
          if (!item) return;
          const canonicalMetric = METRIC_ALIASES[item.metric] || item.metric;
          const base = {
            room_id: roomId,
            device_id: deviceId,
            metric: canonicalMetric,
            value: item.value,
            unit: item.unit,
            observed_at: item.observed_at || observedAt,
            calibration_id: item.calibration_id || calibrationId,
            source: item.source || source,
            quality: item.quality || 'valid'
          };
          const norm = telemetryContract ? telemetryContract.normalizeTelemetry(base) : base;

          const targetEval = evaluateCycleTargets(norm, activeCycle);
          const docId = safeId([norm.room_id, norm.device_id, norm.metric, norm.observed_at].join('__'));

          normalizedReadings.push({
            ...norm,
            id: docId,
            cycle_id: activeCycle ? activeCycle.id : null,
            batch_ids: activeCycle ? (activeCycle.batchIds || []) : [],
            species_id: activeCycle ? activeCycle.speciesId : null,
            stage: activeCycle ? activeCycle.stage : null,
            out_of_band: targetEval.outOfBand,
            delta_target: targetEval.deltaTarget,
            target_band: targetEval.targetBand
          });
        });
        return;
      }

      // Caso 2: Objeto plano con métricas directas (ej: { temperature: 18.2, humidity: 90.5, co2: 700 })
      Object.entries(packet).forEach(([key, val]) => {
        const canonicalMetric = METRIC_ALIASES[key];
        if (!canonicalMetric) return; // Ignorar claves de metadatos (roomId, deviceId, etc.)

        const base = {
          room_id: roomId,
          device_id: deviceId,
          metric: canonicalMetric,
          value: val,
          observed_at: observedAt,
          calibration_id: calibrationId,
          source,
          quality: 'valid'
        };
        const norm = telemetryContract ? telemetryContract.normalizeTelemetry(base) : base;

        const targetEval = evaluateCycleTargets(norm, activeCycle);
        const docId = safeId([norm.room_id, norm.device_id, norm.metric, norm.observed_at].join('__'));

        normalizedReadings.push({
          ...norm,
          id: docId,
          cycle_id: activeCycle ? activeCycle.id : null,
          batch_ids: activeCycle ? (activeCycle.batchIds || []) : [],
          species_id: activeCycle ? activeCycle.speciesId : null,
          stage: activeCycle ? activeCycle.stage : null,
          out_of_band: targetEval.outOfBand,
          delta_target: targetEval.deltaTarget,
          target_band: targetEval.targetBand
        });
      });
    });

    return normalizedReadings;
  };

  /**
   * Crea un buffer en memoria para agregar lecturas cada N minutos antes de persistir.
   */
  const createTelemetryBuffer = ({ onFlush, windowMs = 5 * 60 * 1000 } = {}) => {
    let buffer = [];
    let timer = null;

    const flush = () => {
      if (buffer.length === 0) return;
      const batch = [...buffer];
      buffer = [];
      if (typeof onFlush === 'function') {
        onFlush(batch);
      }
    };

    return {
      add(readings) {
        const list = Array.isArray(readings) ? readings : [readings];
        buffer.push(...list);
        if (!timer && windowMs > 0) {
          timer = setTimeout(() => {
            timer = null;
            flush();
          }, windowMs);
        }
      },
      flush,
      size: () => buffer.length,
      clear: () => { buffer = []; if (timer) { clearTimeout(timer); timer = null; } }
    };
  };

  const actuatorController = isNode
    ? require('./actuator-controller.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasActuators : null);

  const climateMath = isNode
    ? require('./climate-math.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasClimate : null);

  /**
   * Crea un servidor HTTP ligero en Node.js para recibir peticiones POST del ESP32 y gobernar actuadores.
   */
  const createTelemetryServer = ({ port = 8080, onReadings, getActiveCycles } = {}) => {
    if (!isNode) throw new Error('createTelemetryServer solo está disponible en entorno Node.js.');
    const http = require('node:http');

    const roomActuatorStates = {};

    const server = http.createServer((req, res) => {
      // CORS headers para pruebas locales
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'setas-esp32-telemetry-adapter', time: new Date().toISOString() }));
        return;
      }

      if (req.method === 'GET' && (req.url === '/api/active-cycles' || req.url === '/active-cycles')) {
        const cycles = typeof getActiveCycles === 'function' ? (getActiveCycles() || []) : [];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ cycles }));
        return;
      }

      if (req.method === 'GET' && (req.url === '/api/actuators/status' || req.url === '/actuators/status')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', actuatorStates: roomActuatorStates }));
        return;
      }

      if (req.method === 'POST' && (req.url === '/api/actuators/override' || req.url === '/actuators/override')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const roomId = parsed.room_id || 'martha_01';
            roomActuatorStates[roomId] = Object.assign(roomActuatorStates[roomId] || {}, {
              override: true,
              manualCommands: {
                relay_ch1_humidifier: parsed.relay_ch1 || 'AUTO',
                relay_ch2_fae: parsed.relay_ch2 || 'AUTO'
              },
              overrideAt: new Date().toISOString()
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, room_id: roomId, state: roomActuatorStates[roomId] }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'JSON inválido', detail: err.message }));
          }
        });
        return;
      }

      if (req.method === 'POST' && (req.url === '/api/telemetry' || req.url === '/telemetry')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const cycles = typeof getActiveCycles === 'function' ? (getActiveCycles() || []) : [];
            const adapted = adaptESP32Payload(parsed, { cycles });

            const roomId = parsed.room_id || (adapted[0] && adapted[0].roomId) || 'martha_01';
            const activeCycle = findActiveCycle(roomId, new Date().toISOString(), cycles);

            // Extraer métricas para el controlador de actuadores
            let tVal = null, rhVal = null, co2Val = null;
            adapted.forEach(r => {
              if (r.metric === 'temperature_c') tVal = r.value;
              if (r.metric === 'rh_pct') rhVal = r.value;
              if (r.metric === 'co2_ppm') co2Val = r.value;
            });

            const vpd = climateMath && tVal != null && rhVal != null ? climateMath.calcVPD(tVal, rhVal) : null;
            const dewPoint = climateMath && tVal != null && rhVal != null ? climateMath.calcDewPoint(tVal, rhVal) : null;

            let actuatorDecision = null;
            if (actuatorController) {
              actuatorDecision = actuatorController.evaluateActuators({
                metrics: { temp: tVal, rh: rhVal, co2: co2Val, vpd, dewPoint },
                targets: activeCycle?.targets || {},
                currentState: roomActuatorStates[roomId] || {},
                now: Date.now()
              });
              roomActuatorStates[roomId] = actuatorDecision;
            }

            if (typeof onReadings === 'function') {
              onReadings(adapted, actuatorDecision);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              count: adapted.length,
              readings: adapted,
              commands: actuatorDecision ? actuatorDecision.commands : {},
              actuator_state: actuatorDecision
            }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'JSON inválido', detail: err.message }));
          }
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    });

    return {
      server,
      getActuatorStates: () => roomActuatorStates,
      listen: (cb) => server.listen(port, cb),
      close: (cb) => server.close(cb)
    };
  };

  const api = {
    METRIC_ALIASES,
    findActiveCycle,
    evaluateCycleTargets,
    adaptESP32Payload,
    createTelemetryBuffer,
    createTelemetryServer
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasTelemetryAdapter = api;
})();
