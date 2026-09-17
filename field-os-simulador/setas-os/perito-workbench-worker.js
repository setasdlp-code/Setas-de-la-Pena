'use strict';

/**
 * @file perito-workbench-worker.js — Dedicated Web Worker para el Workbench Perito & Optimizador
 *
 * Ejecuta fuera del hilo principal (off-main-thread):
 * 1. Búsqueda combinatoria de escenarios multiobjetivo (searchScenarios).
 * 2. Filtrado O(n²) de la frontera de Pareto multiobjetivo.
 * 3. Análisis de trayectoria de morphing a lo largo de alpha in [0, 1].
 *
 * Mantiene la UI a 60 fps y descarta peticiones obsoletas mediante requestId.
 */

(function () {
  const isWorkerScope = typeof self !== 'undefined' && typeof self.postMessage === 'function';
  const isNode = typeof module !== 'undefined' && module.exports;

  // Carga de dependencias puras según el entorno
  let Scoring = null;
  let Scenarios = null;
  let Workbench = null;

  if (typeof importScripts === 'function') {
    try {
      importScripts('scoring.js', 'perito-scenarios.js', 'perito-workbench-core.js');
      Scoring = self.SetasScoring;
      Scenarios = self.SetasPeritoScenarios;
      Workbench = self.SetasPeritoWorkbench;
    } catch (e) {
      console.warn('Worker importScripts fallback:', e);
    }
  } else if (isNode) {
    try {
      Scoring = require('./scoring.js');
      Scenarios = require('./perito-scenarios.js');
      Workbench = require('./perito-workbench-core.js');
    } catch (e) {
      // Ignorar si se ejecuta en browser bundled
    }
  }

  /**
   * Procesa un mensaje entrante y ejecuta el cálculo correspondiente de forma síncrona o asíncrona dentro del worker.
   */
  const handleWorkerMessage = (data = {}) => {
    const { type, requestId, payload = {} } = data;

    if (type === 'PING') {
      return { type: 'PONG', requestId };
    }

    if (type === 'FILTER_PARETO') {
      const candidates = payload.candidates || [];
      const filterFn = Workbench?.filterParetoFrontier || Scenarios?.paretoFront;
      const paretoFrontier = filterFn ? filterFn(candidates) : candidates;
      return {
        type: 'PARETO_COMPLETE',
        requestId,
        paretoFrontier,
      };
    }

    if (type === 'ANALYZE_MORPH_TRAJECTORY') {
      if (!Workbench?.analyzeMorphTrajectory) {
        return { type: 'ERROR', requestId, error: 'Workbench.analyzeMorphTrajectory no disponible' };
      }
      const res = Workbench.analyzeMorphTrajectory(payload);
      return {
        type: 'MORPH_TRAJECTORY_COMPLETE',
        requestId,
        result: res,
      };
    }

    if (type === 'SEARCH_SCENARIOS') {
      if (!Scenarios?.searchScenarios) {
        return { type: 'ERROR', requestId, error: 'Scenarios.searchScenarios no disponible' };
      }

      const {
        targetKey,
        recipe = [],
        lockedIds = [],
        ingredients = [],
        spp = {},
        invLotes = [],
        stockMap = {},
        useStock = false,
        maxCost = null,
        profileKeys = ['rescate', 'produccion', 'premium'],
      } = payload;

      const byProfile = {};
      let noStock = false;

      // Adaptador de análisis puro en el worker
      const analyzeAdapter = (rec) => {
        const p = Object.fromEntries(rec.map(r => [r.id, Number(r.p || r.pct || 0)]));
        const ingById = new Map(ingredients.map(g => [g.id, g]));
        const sp = spp[targetKey] || {};

        let totC = 0;
        let totN = 0;
        let suppP = 0;
        let cost = 0;
        let avgPh = 6.5;
        let tot = 0;

        rec.forEach(r => {
          const g = ingById.get(r.id);
          const pct = Number(r.p || 0);
          tot += pct;
          if (g) {
            const m = Math.min(0.92, Math.max(0, Number(g.moisture || 0) / 100));
            const dryFrac = pct * (1 - m);
            if (Number(g.cn) > 0 && g.role !== 'aditivo_ph' && g.role !== 'aditivo_estructura') {
              totC += Number(g.c || 0) * dryFrac;
              totN += Number(g.n || 0) * dryFrac;
            }
            if (g.role === 'suplemento_n' || g.role === 'suplemento_medio') {
              suppP += pct;
            }
            cost += (Number(g.cost || 0) / (1 - m)) * (pct / 100);
          }
        });

        const cn = totN > 0 ? totC / totN : 999;
        const avgN = totN;
        const ebBaseline = Number(sp.eb_baseline || 80);
        const ebOptimal = Number(sp.eb_optimal || 120);
        const eb = Math.min(ebOptimal, ebBaseline + (suppP * 1.5));
        const trichoderma = suppP > (sp.supplementation_max || 20) + 8;

        return {
          tot,
          cn,
          avgN,
          avgPh,
          cost,
          eb,
          suppP,
          trichoderma,
          sp,
        };
      };

      // Adaptador de score puro
      const scoreAdapter = (an, ctx) => {
        if (!Scoring?.scoreRecipe) return { score: 75, status: 'acceptable' };
        return Scoring.scoreRecipe(an, { recipe: ctx.recipe, stockIds: useStock ? new Set(Object.keys(stockMap)) : undefined });
      };

      profileKeys.forEach(pk => {
        try {
          const out = Scenarios.searchScenarios({
            targetKey,
            recipe,
            context: { sKey: targetKey, spp, stockIds: new Set(Object.keys(stockMap)) },
            searchMode: 'hybrid',
            spp,
            ingredients,
            analyze: analyzeAdapter,
            score: scoreAdapter,
            history: [],
            generations: 3,
            beamWidth: 14,
            stepPct: 4,
            useStock,
            stockIds: new Set(Object.keys(stockMap)),
            invLotes,
            stockMap,
            profileKey: pk,
            maxCost,
            lockedIds: new Set(lockedIds || []),
          });

          noStock = noStock || !!out.noStock;
          byProfile[pk] = (out.ranked || []).slice(0, 12);
          byProfile[`_pareto_${pk}`] = (out.pareto || []).slice(0, 12);
          byProfile[`_diag_${pk}`] = out.diagnostics || null;
        } catch (err) {
          byProfile[pk] = [];
          byProfile[`_diag_${pk}`] = { error: err.message || String(err) };
        }
      });

      return {
        type: 'SEARCH_COMPLETE',
        requestId,
        byProfile,
        noStock,
      };
    }

    return { type: 'UNKNOWN_COMMAND', requestId };
  };

  // Enlace del listener del Web Worker en el navegador
  if (isWorkerScope && typeof self.addEventListener === 'function') {
    self.addEventListener('message', (event) => {
      const response = handleWorkerMessage(event.data);
      if (response) {
        self.postMessage(response);
      }
    });
  }

  const api = {
    handleWorkerMessage,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasPeritoWorkbenchWorker = api;
})();
