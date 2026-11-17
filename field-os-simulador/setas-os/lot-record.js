'use strict';
// SETAS OS — `setas.lot-record.v1`: el registro por lote.
//
// POR QUÉ EXISTE
// Tres parámetros de cultivo están bloqueados y la literatura ya se agotó como
// fuente para los tres (ver knowledge_base/09_research/intake/
// app_kb_parameter_discrepancies_2026-09-28.md):
//
//   1. umbrales de EB por especie y por oleada,
//   2. la clase térmica de cepa de P. ostreatus,
//   3. el umbral de CO₂ para morfología de asta.
//
// Ninguno se desbloquea leyendo más papers. Los tres se desbloquean con lo
// mismo: lotes propios registrados de forma que admitan estratificación. Este
// módulo define qué tiene que traer un lote para contar en cada una de esas tres
// preguntas, y —cuando no lo trae— lo dice en vez de rellenarlo.
//
// QUÉ NO ES
// No es un almacén nuevo ni un modelo nuevo. Casi todo lo que necesita ya se
// captura: `bitacora-model.js` tiene `peseSeco`, `spawnKg` y `flush`;
// `room-cycle.js` tiene etapa, ventana y bandas objetivo por métrica;
// `telemetry-contract.js` tiene `co2_ppm` y `substrate_temperature_c`. Esto es
// una proyección de solo lectura sobre eso, más tres campos de captura que
// faltaban (identidad de cepa, fenotipo de cosecha, vínculo lote↔ciclo).
//
// REGLA DE DISEÑO — no se duplica criterio ajeno:
//   · «resultado final elegible» lo decide `historical-calibration.js`
//     (`batchOutcome`), igual que en `build-ground-truth-corpus.js`. Aquí se
//     delega, no se re-implementa.
//   · el vocabulario de fenotipo es el de
//     `knowledge_base/09_research/phenotype_dictionary_v0.1.md`. No se inventa
//     uno nuevo ni se amplía su enum de defectos desde aquí.
//   · la agregación ambiental es `telemetry-contract.aggregateTelemetry`.
//
// CLASES DE DATO (ver .claude/skills/agronomic-claims): `metrics` es medición;
// `targets` es consigna. Viajan en claves distintas y nunca se funden, aunque
// hoy coincidan en valor. Lo mismo con `dryBasisKg` y `spawnDryKg`: separados a
// propósito, ver §EB abajo.
(function () {
  const SCHEMA = 'setas.lot-record.v1';

  const getTelemetry = () => (typeof module !== 'undefined' && module.exports)
    ? require('./telemetry-contract.js') : globalThis.SetasTelemetry;
  const getRoomCycle = () => (typeof module !== 'undefined' && module.exports)
    ? require('./room-cycle.js') : globalThis.SetasRoomCycle;
  const getHistory = () => (typeof module !== 'undefined' && module.exports)
    ? require('./historical-calibration.js') : globalThis.SetasHistoricalCalibration;

  // ── EB: la base del denominador, declarada ────────────────────────────────
  //
  // `calcLoteStats` calcula `be = fresco / peseSeco * 100`, con `peseSeco` =
  // sustrato seco y el spawn FUERA del denominador. Eso coincide con la
  // convención mayoritaria de la literatura, así que los números siguen siendo
  // comparables con lo publicado — pero hasta ahora era implícito, y un
  // denominador implícito es exactamente lo que hace incomparables dos series.
  //
  // Queda declarado aquí, y `spawnDryKg` viaja al lado sin sumarse: quien
  // quiera recalcular sobre masa seca total puede hacerlo desde el registro,
  // sin reinterpretar historia ni perder la serie original. Fundir los dos
  // campos en uno destruiría esa opción para siempre.
  const BE_BASIS = 'fresh_over_dry_substrate';

  // Fracción de masa seca del grano de spawn. Es un supuesto de conversión, no
  // una medición de esta finca: se declara para que el número derivado nunca se
  // lea como pesado en báscula.
  const SPAWN_DRY_FRACTION = 0.55;
  const SPAWN_DRY_FRACTION_BASIS = 'assumed_literature_grain_dry_matter';

  // Etapas en las que una banda de CO₂ tiene sentido operativo. Un régimen por
  // fase necesita que la exposición se lea por etapa y no promediada sobre el
  // ciclo entero: promediar incubación con fructificación borra justamente el
  // contraste que se quiere medir.
  const CO2_REGIME_STAGES = new Set(['induction', 'fruiting']);

  // Vocabulario de defectos v0.1, copiado del diccionario canónico. Se valida
  // contra él y lo que no esté se reporta como `other_declared` con el valor
  // original preservado: un código desconocido es un dato de campo, no basura.
  const DEFECT_CODES = new Set([
    'abort', 'surface_dryness', 'cracking_excess', 'yellowing', 'deformation',
    'mechanical_damage', 'water_damage', 'bacterial_suspect', 'mold_suspect',
    'overmature', 'undersized', 'other_declared',
  ]);

  // Etapa de la OBSERVACIÓN de fenotipo. Es el enum del diccionario, que no es
  // el de `room-cycle.VALID_STAGES`: uno describe el momento de desarrollo del
  // carpóforo, el otro el estado de la sala. Se mantienen separados a propósito.
  const PHENOTYPE_STAGES = new Set(['initiation', 'early_development', 'maturation', 'harvest']);

  const num = (value) => {
    if (value == null || value === '' || typeof value === 'boolean') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const positive = (value) => {
    const n = num(value);
    return n != null && n > 0 ? n : null;
  };
  const ms = (value) => {
    if (!value) return null;
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : null;
  };
  const toKg = (value, unit) => {
    const n = num(value);
    if (n == null) return null;
    return unit === 'kg' ? n : n / 1000; // Bitácora registra cosecha en gramos.
  };

  // ── genética ──────────────────────────────────────────────────────────────
  //
  // `strainId` es identidad, no clase. La decisión está en ADR-0008: no se
  // modela una clase térmica, porque las clases comerciales de ostreatus se
  // solapan y no particionan el espacio — un enum obligaría a clasificar mal.
  // La clase, si aparece, se inferirá de los datos cuando haya lotes.
  //
  // `supplierNote` es el campo `cepa` que ya existía: texto libre del
  // proveedor. Se conserva aparte en vez de promoverlo a identidad, porque dos
  // operarios escriben el mismo proveedor de tres formas distintas.
  const buildGenetics = (lote) => {
    const strainId = String(lote.strainId || '').trim() || null;
    const spawnLotId = String(lote.spawnLotId || lote.spawnLot?.id || '').trim() || null;
    const supplierNote = String(lote.cepa || '').trim() || null;
    return {
      speciesKey: lote.sKey || null,
      strainId,
      spawnLotId,
      supplierNote,
      // Un lote solo entra en una comparación estratificada por cepa si la cepa
      // tiene identidad. Sin ella el lote sigue siendo válido para EB agregada,
      // pero no para separar genética de ambiente.
      stratifiableByStrain: strainId != null,
      thermalClass: null,
      thermalClassBasis: 'not_modelled_see_ADR-0008',
    };
  };

  // ── EB por oleada ─────────────────────────────────────────────────────────
  const biologicalEfficiency = (lote, cosechas, finalOutcome) => {
    const dryBasisKg = positive(lote.peseSeco);
    const spawnKg = positive(lote.spawnKg);

    const byFlush = new Map();
    let totalFreshKg = 0;
    cosechas.forEach((c) => {
      const flush = Math.trunc(num(c.flush) ?? 1) || 1;
      const freshKg = toKg(c.pesoFresco, c.unit) ?? 0;
      const marketableKg = toKg(c.pesoComercial, c.unit);
      const rejectedKg = toKg(c.pesoDescarte, c.unit);
      if (!byFlush.has(flush)) {
        byFlush.set(flush, { flush, freshKg: 0, marketableKg: 0, rejectedKg: 0, records: 0, hasMarketable: false, hasRejected: false });
      }
      const row = byFlush.get(flush);
      row.freshKg += freshKg;
      if (marketableKg != null) { row.marketableKg += marketableKg; row.hasMarketable = true; }
      if (rejectedKg != null) { row.rejectedKg += rejectedKg; row.hasRejected = true; }
      row.records += 1;
      totalFreshKg += freshKg;
    });

    const flushes = [...byFlush.values()].sort((a, b) => a.flush - b.flush).map((row) => ({
      flush: row.flush,
      freshKg: row.freshKg,
      // La EB por oleada usa el MISMO denominador que la EB del lote: la masa
      // seca inicial. No se reparte entre oleadas, porque el sustrato no se
      // reinicia en cada una — repartirlo haría que las EB por oleada sumaran
      // la del lote por construcción y perdieran todo contenido.
      bePct: dryBasisKg != null ? (row.freshKg / dryBasisKg) * 100 : null,
      sharePct: totalFreshKg > 0 ? (row.freshKg / totalFreshKg) * 100 : null,
      marketableKg: row.hasMarketable ? row.marketableKg : null,
      rejectedKg: row.hasRejected ? row.rejectedKg : null,
      records: row.records,
    }));

    return {
      basis: BE_BASIS,
      spawnIncludedInDenominator: false,
      dryBasisKg,
      spawnWetKg: spawnKg,
      spawnDryKg: spawnKg != null ? spawnKg * SPAWN_DRY_FRACTION : null,
      spawnDryKgBasis: SPAWN_DRY_FRACTION_BASIS,
      // `bePct` es el resultado final elegible según historical-calibration, no
      // un promedio recalculado aquí. Si el lote no cerró, es null y la razón
      // viaja en `outcomeExclusionReason` del registro.
      bePct: finalOutcome.be,
      totalFreshKg,
      flushes,
      // Una EB por oleada solo es comparable entre lotes si todos cosecharon el
      // mismo número de oleadas o se estratifica por número de oleada. Se
      // declara para que un consumidor no promedie lotes de 2 y de 4 oleadas.
      flushesRecorded: flushes.length,
    };
  };

  // ── ambiente por etapa ────────────────────────────────────────────────────
  //
  // Esto es lo que vuelve medible «CO₂ como régimen por fase». Un lote puede
  // pasar por varios ciclos de sala; cada ciclo declara su etapa, su ventana y
  // sus bandas objetivo. La exposición se agrega por ETAPA, no por ciclo ni por
  // lote, y la consigna viaja al lado de la medición sin mezclarse.
  const environmentByStage = (lote, cycles, telemetry) => {
    const telem = getTelemetry();
    const rc = getRoomCycle();
    const own = cycles.filter((c) => rc.containsBatch(c, lote.id));

    const byStage = new Map();
    own.forEach((cycle) => {
      const stage = cycle.stage || 'unknown';
      if (!byStage.has(stage)) byStage.set(stage, { stage, cycles: [], readings: [] });
      const row = byStage.get(stage);
      row.cycles.push(cycle);
      row.readings.push(...telemetry.filter((r) => telem.readingBelongsToCycle(r, cycle)));
    });

    return [...byStage.values()].map(({ stage, cycles: stageCycles, readings }) => {
      const metrics = telem.aggregateTelemetry(readings);
      // Si dos ciclos de la misma etapa declaran bandas distintas, no se elige
      // una en silencio: se reportan todas y el consumidor decide o rechaza.
      const targets = {};
      stageCycles.forEach((cycle) => {
        Object.entries(cycle.targets || {}).forEach(([metric, band]) => {
          if (!band) return;
          if (!targets[metric]) targets[metric] = [];
          if (!targets[metric].some((b) => b.min === band.min && b.max === band.max && b.target === band.target)) {
            targets[metric].push(band);
          }
        });
      });

      const starts = stageCycles.map((c) => ms(c.startAt)).filter((t) => t != null);
      const ends = stageCycles.map((c) => ms(c.endAt)).filter((t) => t != null);
      const closed = stageCycles.every((c) => c.endAt);

      return {
        stage,
        cycleIds: stageCycles.map((c) => c.id),
        window: {
          startAt: starts.length ? new Date(Math.min(...starts)).toISOString() : null,
          endAt: closed && ends.length ? new Date(Math.max(...ends)).toISOString() : null,
          closed,
        },
        metrics,                                  // medido
        targets,                                  // consigna — nunca lo mismo
        exposure: exposureAgainstBands(readings, targets, telem),
        co2RegimeRelevant: CO2_REGIME_STAGES.has(stage),
      };
    }).sort((a, b) => String(a.stage).localeCompare(String(b.stage)));
  };

  // Fracción de lecturas válidas fuera de banda, por métrica. Es la variable de
  // exposición que una curva dosis-respuesta necesita: un promedio de CO₂ no
  // distingue un ciclo estable en 1.400 ppm de uno que osciló entre 600 y 2.200.
  const exposureAgainstBands = (readings, targets, telem) => {
    const out = {};
    const valid = readings.map((r) => telem.normalizeTelemetry(r)).filter((r) => r.quality === 'valid' && r.value != null);
    Object.entries(targets).forEach(([metric, bands]) => {
      // Con bandas en conflicto no hay un «fuera de banda» definido.
      if (bands.length !== 1) { out[metric] = { resolvable: false, reason: 'conflicting_target_bands' }; return; }
      const band = bands[0];
      const sample = valid.filter((r) => r.metric === metric);
      if (!sample.length) { out[metric] = { resolvable: false, reason: 'no_valid_readings' }; return; }
      const above = band.max != null ? sample.filter((r) => r.value > band.max).length : null;
      const below = band.min != null ? sample.filter((r) => r.value < band.min).length : null;
      out[metric] = {
        resolvable: true,
        validReadings: sample.length,
        fractionAboveMax: above != null ? above / sample.length : null,
        fractionBelowMin: below != null ? below / sample.length : null,
      };
    });
    return out;
  };

  // ── ventanas por etapa derivadas del log de eventos ───────────────────────
  //
  // `room-cycle.js` modela esto bien pero no está conectado a la UI, y pedir que
  // alguien declare un ciclo a mano por etapa es pedir un registro que no va a
  // ocurrir. No hace falta: los estados de ciclo de vida que `batch-sheet.js` ya
  // persiste como eventos `batch_state_transition` (`cooling`, `incubation`,
  // `maturation`, `induction`, `fruiting`, `resting`, `quarantine`) coinciden
  // exactamente con `room-cycle.VALID_STAGES`. La ventana de cada etapa es el
  // intervalo entre su transición de entrada y la siguiente.
  //
  // Esto es derivación, no almacenamiento: el log de eventos sigue siendo la
  // verdad y la ventana se recalcula al leer (DATA_MODEL DM-2/DM-3).
  //
  // `targetsByStage` entra por parámetro porque las bandas son CONSIGNA externa
  // (la KB de especie), no algo que el lote posea. Sin ellas la exposición no se
  // calcula y se dice por qué, en vez de inventar una banda.
  const deriveStageCycles = (lote, events = [], targetsByStage = {}) => {
    const rc = getRoomCycle();
    const transitions = events
      .filter((e) => e && e.type === 'batch_state_transition' && (!e.batchId || e.batchId === lote.id))
      .map((e) => ({ at: ms(e.at), to: e.to, room: e.roomId || e.salaDestinoId || null }))
      .filter((e) => e.at != null && rc.VALID_STAGES.has(e.to))
      .sort((a, b) => a.at - b.at);

    let room = lote.sala || null;
    return transitions.map((entry, i) => {
      // Una transición puede traer la sala destino; mientras no la traiga, se
      // arrastra la última conocida.
      if (entry.room) room = entry.room;
      const next = transitions[i + 1];
      const endAt = next ? new Date(next.at).toISOString() : null;
      return {
        schema: 'setas.room-cycle.v1',
        id: `${lote.id}:${entry.to}:${i}`,
        roomId: room || '',
        speciesId: lote.sKey || '',
        batchIds: [lote.id],
        stage: entry.to,
        state: endAt ? 'closed' : 'active',
        startAt: new Date(entry.at).toISOString(),
        endAt,
        targets: targetsByStage[entry.to] || {},
        recipeVersionIds: [],
        notes: null,
        provenance: { type: 'derived_from_batch_state_transitions' },
      };
    });
  };

  // ── fenotipo ──────────────────────────────────────────────────────────────
  //
  // Subconjunto de phenotype_dictionary_v0.1 que un operario puede capturar en
  // campo con calibrador y sin protocolo de imagen. `capStipeLengthRatio` es la
  // comparación derivada que el propio diccionario nombra como «environmental
  // exposure vs elongation» para Pleurotus — es decir, la variable de respuesta
  // de la pregunta de CO₂.
  //
  // Estas medidas NO son canónicas todavía: el diccionario tiene una compuerta
  // de promoción explícita. Viajan marcadas como experimentales.
  const phenotypeObservations = (cosechas) => cosechas.map((c) => {
    const capDiameterMm = positive(c.capDiameterMm);
    const stipeLengthMm = positive(c.stipeLengthMm);
    const declared = Array.isArray(c.defectCodes) ? c.defectCodes : [];
    const known = [];
    const unknown = [];
    declared.map((d) => String(d || '').trim()).filter(Boolean).forEach((d) => {
      (DEFECT_CODES.has(d) ? known : unknown).push(d);
    });
    const stage = PHENOTYPE_STAGES.has(c.phenotypeStage) ? c.phenotypeStage : null;
    return {
      harvestId: c.id || null,
      bagId: c.bagId || c.bolsaId || null,
      flush: Math.trunc(num(c.flush) ?? 1) || 1,
      stage,
      capDiameterMm,
      stipeLengthMm,
      capStipeLengthRatio: capDiameterMm != null && stipeLengthMm != null && stipeLengthMm > 0
        ? capDiameterMm / stipeLengthMm : null,
      defectCodes: known,
      undeclaredDefectCodes: unknown,
      observerNotes: c.observerNotes || null,
      measured: capDiameterMm != null || stipeLengthMm != null || known.length > 0,
      vocabulary: 'phenotype_dictionary_v0.1',
      promotionStatus: 'experimental_not_canonical',
    };
  }).filter((o) => o.measured);

  // ── huecos ────────────────────────────────────────────────────────────────
  //
  // Lo que este lote NO puede responder, y por qué. Mismo patrón que
  // `assessHistory`: un lote inelegible no desaparece, se reporta con su razón.
  // Un hueco en silencio es un lote que parece servir y no sirve.
  const QUESTIONS = {
    EB_BY_SPECIES_AND_FLUSH: 'eb_by_species_and_flush',
    STRAIN_STRATIFICATION: 'strain_stratification',
    CO2_DOSE_RESPONSE: 'co2_dose_response',
  };

  const findGaps = ({ genetics, be, stages, phenotype, finalOutcome }) => {
    const gaps = [];
    const add = (code, blocks, detail) => gaps.push({ code, blocks, detail });

    if (finalOutcome.outcome.status !== 'completed-success' && finalOutcome.outcome.status !== 'completed-zero-yield') {
      add('outcome_not_final', [QUESTIONS.EB_BY_SPECIES_AND_FLUSH, QUESTIONS.STRAIN_STRATIFICATION, QUESTIONS.CO2_DOSE_RESPONSE],
        finalOutcome.exclusionReason || `estado del resultado: ${finalOutcome.outcome.status}`);
    }
    if (be.dryBasisKg == null) {
      add('dry_substrate_mass_missing', [QUESTIONS.EB_BY_SPECIES_AND_FLUSH],
        'sin peseSeco no hay denominador de EB');
    }
    if (!genetics.speciesKey) {
      add('species_missing', [QUESTIONS.EB_BY_SPECIES_AND_FLUSH], 'el lote no declara especie');
    }
    if (!genetics.stratifiableByStrain) {
      add('strain_unidentified', [QUESTIONS.STRAIN_STRATIFICATION],
        genetics.supplierNote
          ? `solo hay nota de proveedor en texto libre ("${genetics.supplierNote}"), que no es identidad`
          : 'sin strainId no se puede separar genética de ambiente');
    }
    if (!be.flushes.length) {
      add('no_harvest_recorded', [QUESTIONS.EB_BY_SPECIES_AND_FLUSH, QUESTIONS.CO2_DOSE_RESPONSE],
        'ninguna cosecha registrada');
    }
    const fruiting = stages.filter((s) => s.co2RegimeRelevant);
    if (!fruiting.length) {
      add('no_fruiting_cycle_linked', [QUESTIONS.CO2_DOSE_RESPONSE],
        'el lote no está vinculado a ningún ciclo de sala en inducción o fructificación');
    } else if (!fruiting.some((s) => (s.metrics.co2_ppm?.validCount || 0) > 0)) {
      add('co2_not_measured_in_fruiting', [QUESTIONS.CO2_DOSE_RESPONSE],
        'hay ciclo de fructificación pero sin lecturas válidas de CO₂ en su ventana');
    }
    if (!phenotype.length) {
      add('phenotype_unrecorded', [QUESTIONS.CO2_DOSE_RESPONSE],
        'sin medidas de píleo/estípite ni códigos de defecto no hay variable de respuesta morfológica');
    }
    return gaps;
  };

  /**
   * Proyecta el registro por lote a partir de lo ya capturado.
   *
   * @param {object} params
   * @param {object} params.lote Lote de Bitácora/producción (requiere `id`)
   * @param {Array<object>} [params.bolsas] Bolsas del lote
   * @param {Array<object>} [params.cosechas] Cosechas del lote
   * @param {Array<object>} [params.cycles] Ciclos de sala declarados
   *   (`setas.room-cycle.v1`). Si se pasan, manda lo declarado.
   * @param {Array<object>} [params.events] Eventos del lote. Sin `cycles`, las
   *   ventanas por etapa se derivan de sus `batch_state_transition`.
   * @param {object} [params.targetsByStage] Bandas objetivo por etapa, de la KB
   *   de especie. Son consigna externa: el lote no las posee.
   * @param {Array<object>} [params.telemetry] Lecturas crudas de telemetría
   * @param {string} [params.recordedAt] Momento de la proyección (inyectable)
   * @returns {object} Registro `setas.lot-record.v1`
   */
  const buildLotRecord = ({
    lote,
    bolsas = [],
    cosechas = [],
    cycles = null,
    events = [],
    targetsByStage = {},
    telemetry = [],
    recordedAt = null,
  } = {}) => {
    if (!lote || !lote.id) throw new Error('lote válido con id es requerido');

    const loteBolsas = bolsas.filter((b) => !b.loteId || b.loteId === lote.id);
    const loteCosechas = cosechas.filter((c) => !c.loteId || c.loteId === lote.id);
    const effectiveCycles = Array.isArray(cycles) && cycles.length
      ? cycles
      : deriveStageCycles(lote, events, targetsByStage);

    const finalOutcome = getHistory().batchOutcome(lote, loteCosechas);
    const genetics = buildGenetics(lote);
    const be = biologicalEfficiency(lote, loteCosechas, finalOutcome);
    const stages = environmentByStage(lote, effectiveCycles, telemetry);
    const phenotype = phenotypeObservations(loteCosechas);
    const gaps = findGaps({ genetics, be, stages, phenotype, finalOutcome });

    const blocked = new Set(gaps.flatMap((g) => g.blocks));
    const answers = Object.fromEntries(
      Object.values(QUESTIONS).map((q) => [q, !blocked.has(q)])
    );

    return {
      schema: SCHEMA,
      lotId: lote.id,
      lotCode: lote.codigo || null,
      recordedAt: recordedAt || new Date().toISOString(),
      roomId: lote.sala || null,
      stageWindowSource: Array.isArray(cycles) && cycles.length
        ? 'declared_room_cycles' : 'derived_from_batch_state_transitions',
      inoculatedAt: lote.fechaInoculacion || null,
      bagsTotal: loteBolsas.length,
      batchState: lote.lifecycleState || lote.estado || null,
      outcome: finalOutcome.outcome,
      outcomeExclusionReason: finalOutcome.exclusionReason || null,
      genetics,
      biologicalEfficiency: be,
      environmentByStage: stages,
      phenotype,
      gaps,
      // `answers` no dice que el lote pruebe nada: dice si puede ENTRAR en el
      // análisis de esa pregunta. Un lote elegible sigue siendo una
      // observación, no un experimento controlado (ver experiment-model.js).
      answers,
      experimentId: lote.experimentId || null,
      armId: lote.armId || null,
      provenance: {
        biological: 'measured_calculated_from_bitacora',
        genetics: genetics.strainId ? 'identified' : 'unidentified',
        environment: stages.some((s) => Object.values(s.metrics).some((m) => m.validCount > 0))
          ? 'measured' : 'missing',
        phenotype: phenotype.length ? 'observed_field_measured' : 'missing',
        evidenceClass: 'observational',
      },
    };
  };

  /**
   * Separa un conjunto de registros en los elegibles para una pregunta y los
   * excluidos con su razón. Es el puente hacia un corpus estratificado: no
   * decide umbrales, solo quién puede votar.
   */
  const selectForQuestion = (records = [], question) => {
    if (!Object.values(QUESTIONS).includes(question)) {
      throw new Error(`pregunta desconocida: ${question}`);
    }
    const eligible = [];
    const excluded = [];
    records.forEach((r) => {
      if (!r || r.schema !== SCHEMA) {
        excluded.push({ lotId: r?.lotId || null, reasons: ['wrong_schema'] });
        return;
      }
      const reasons = r.gaps.filter((g) => g.blocks.includes(question)).map((g) => g.code);
      if (reasons.length) excluded.push({ lotId: r.lotId, reasons });
      else eligible.push(r);
    });
    return { question, eligible, excluded, eligibleN: eligible.length, excludedN: excluded.length };
  };

  const api = {
    SCHEMA, BE_BASIS, SPAWN_DRY_FRACTION, DEFECT_CODES, PHENOTYPE_STAGES,
    CO2_REGIME_STAGES, QUESTIONS, deriveStageCycles, buildLotRecord, selectForQuestion,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasLotRecord = api;
})();
