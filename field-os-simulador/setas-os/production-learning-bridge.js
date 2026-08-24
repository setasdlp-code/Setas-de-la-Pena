'use strict';
import './room-cycle.js';
import './telemetry-contract.js';
import './cycle-evidence.js';

(function attachProductionLearningBridge() {
  if (globalThis.__setasProductionLearningLoaded) return;
  globalThis.__setasProductionLearningLoaded = true;

  const KEYS = {
    cycles: 'sdp_room_cycles',
    telemetry: 'sdp_telemetry_v1',
    evidence: 'sdp_cycle_evidence_v1',
  };

  const readJson = (key, fallback = []) => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  };
  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  };
  const upsertBy = (rows, row, keyFn) => {
    const key = keyFn(row);
    const next = (rows || []).filter(x => keyFn(x) !== key);
    next.push(row);
    return next;
  };
  const fireAndForget = (fn, ...args) => {
    try {
      const p = fn?.(...args);
      if (p?.catch) p.catch(err => console.warn('[SetasProductionLearning] sync error', err));
    } catch (err) {
      console.warn('[SetasProductionLearning] sync error', err);
    }
  };

  const upsertRoomCycle = input => {
    const api = globalThis.SetasRoomCycle;
    if (!api) throw new Error('SetasRoomCycle unavailable');
    const errors = api.validateRoomCycle(input);
    if (errors.length) throw new Error(`RoomCycle inválido: ${errors.join('; ')}`);
    const cycle = api.normalizeRoomCycle(input);
    writeJson(KEYS.cycles, upsertBy(readJson(KEYS.cycles), cycle, x => x.id));
    fireAndForget(globalThis.SetasDB?.guardarRoomCycle, cycle);
    window.dispatchEvent(new CustomEvent('setas-room-cycle-updated', { detail: cycle }));
    return cycle;
  };

  const ingestTelemetry = raw => {
    const api = globalThis.SetasTelemetry;
    if (!api) throw new Error('SetasTelemetry unavailable');
    const errors = api.validateTelemetry(raw);
    if (errors.length) throw new Error(`Telemetría inválida: ${errors.join('; ')}`);
    const reading = api.normalizeTelemetry(raw);
    const keyFn = x => [x.room_id, x.device_id, x.metric, x.observed_at].join('__');
    writeJson(KEYS.telemetry, upsertBy(readJson(KEYS.telemetry), reading, keyFn));
    fireAndForget(globalThis.SetasDB?.guardarTelemetry, reading);
    window.dispatchEvent(new CustomEvent('setas-telemetry-ingested', { detail: reading }));
    return reading;
  };

  const extractTraceability = lote => ({
    recipeSnapshot: lote?.recipeSnapshot || lote?.recetaSnapshot || lote?.recipeRef?.snapshot || lote?.recipeRef || null,
    ingredientLots: lote?.ingredientLots || lote?.insumoLots || lote?.ingredientLotRefs || [],
    spawnLot: lote?.spawnLot || lote?.loteSpawn || null,
  });

  const materializeCycleEvidence = ({ cycleId, batchId, recordedAt = null } = {}) => {
    const evidenceApi = globalThis.SetasCycleEvidence;
    if (!evidenceApi) throw new Error('SetasCycleEvidence unavailable');
    const cycle = readJson(KEYS.cycles).find(x => x.id === cycleId);
    if (!cycle) throw new Error(`RoomCycle no encontrado: ${cycleId}`);
    if (!cycle.batchIds.includes(batchId)) throw new Error(`Lote ${batchId} no pertenece al ciclo ${cycleId}`);

    const lotes = readJson('sdp_bit_lotes');
    const lote = lotes.find(x => x.id === batchId);
    if (!lote) throw new Error(`Lote de Bitácora no encontrado: ${batchId}`);
    const bolsas = readJson('sdp_bit_bolsas').filter(x => x.loteId === batchId);
    const cosechas = readJson('sdp_bit_cosechas').filter(x => x.loteId === batchId);
    const telemetry = readJson(KEYS.telemetry);
    const trace = extractTraceability(lote);

    const evidence = evidenceApi.buildCycleEvidence({
      cycle,
      lote,
      bolsas,
      cosechas,
      telemetry,
      ...trace,
      recordedAt,
    });
    const evidenceKey = x => `${x.sourceId}__${x.batchId}`;
    writeJson(KEYS.evidence, upsertBy(readJson(KEYS.evidence), evidence, evidenceKey));
    fireAndForget(globalThis.SetasDB?.guardarCycleEvidence, evidence);
    window.dispatchEvent(new CustomEvent('setas-cycle-evidence-updated', { detail: evidence }));
    return evidence;
  };

  const historicalEvidenceFor = ({ speciesId = null, recipeVersionId = null } = {}) => {
    const api = globalThis.SetasCycleEvidence;
    if (!api) throw new Error('SetasCycleEvidence unavailable');
    return api.buildHistoricalEvidence(readJson(KEYS.evidence), { speciesId, recipeVersionId });
  };

  const contextForPerito = ({ speciesId = null, recipeVersionId = null } = {}) => ({
    historicalEvidence: historicalEvidenceFor({ speciesId, recipeVersionId }),
    productionLearning: {
      cycles: readJson(KEYS.cycles).length,
      telemetryReadings: readJson(KEYS.telemetry).length,
      evidenceRecords: readJson(KEYS.evidence).length,
    },
  });

  globalThis.SetasProductionLearning = {
    KEYS,
    upsertRoomCycle,
    ingestTelemetry,
    materializeCycleEvidence,
    historicalEvidenceFor,
    contextForPerito,
  };

  // Inyección no invasiva: el motor recibe historicalEvidence dentro de context,
  // pero scoring.js no se modifica y searchScenarios sigue decidiendo exactamente
  // igual. El resultado conserva el contexto para que UI/Perito puedan explicarlo.
  const attachPeritoEvidenceContext = () => {
    const engine = globalThis.SetasPeritoScenarios;
    if (!engine?.searchScenarios || engine.__productionLearningWrapped) return false;
    const original = engine.searchScenarios.bind(engine);
    engine.searchScenarios = options => {
      const speciesId = options?.context?.sKey || options?.targetKey || null;
      const learned = contextForPerito({ speciesId });
      const enriched = {
        ...options,
        context: { ...(options?.context || {}), ...learned },
      };
      const result = original(enriched);
      if (result && typeof result === 'object') {
        result.historicalEvidence = learned.historicalEvidence;
        result.productionLearning = learned.productionLearning;
      }
      return result;
    };
    engine.__productionLearningWrapped = true;
    return true;
  };

  attachPeritoEvidenceContext();
  // Capture garantiza que, cuando el modelo del Perito dispara por primera vez,
  // el wrapper se instala antes del listener de cálculo aunque el motor haya
  // terminado de cargar después de este módulo.
  window.addEventListener('setas-perito-model', attachPeritoEvidenceContext, { capture: true });

  window.dispatchEvent(new CustomEvent('setas-production-learning-ready'));
})();
