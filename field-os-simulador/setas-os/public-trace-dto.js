'use strict';

/**
 * @file public-trace-dto.js — Constructor Canónico del DTO Público de Trazabilidad (Schema V2).
 *
 * Aplica privacidad por diseño mediante ALLOWLIST POSITIVA ESTRICTA:
 * Nunca usa listas negras ni exclusiones dinámicas (delete clean.cost).
 * Solo los campos explícitamente autorizados son emitidos hacia la ficha
 * pública (public_lotes). Todo dato interno (costos, proveedores, fórmulas
 * de receta completas, notas privadas, correos e IDs de operador) es
 * estructuralmente descartado.
 */

(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.SetasPublicTraceDTO = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const SCHEMA_VERSION = 2;

  /**
   * Sanea los campos básicos de un lote de cultivo para consumo público.
   *
   * @param {object} lote
   * @returns {{
   *   codigo: string,
   *   especie: string,
   *   especieCientifico: string,
   *   fechaInoculacion: string,
   *   numBolsas: number|null,
   *   estado: string
   * }}
   */
  function sanearLote(lote) {
    if (!lote || typeof lote !== 'object') {
      return {
        codigo: '',
        especie: '',
        especieCientifico: '',
        fechaInoculacion: '',
        numBolsas: null,
        estado: 'incubacion'
      };
    }

    const numBolsasRaw = Number(lote.numBolsas);
    const numBolsas = Number.isFinite(numBolsasRaw)
      ? Math.max(0, Math.min(100000, Math.floor(numBolsasRaw)))
      : null;

    return {
      codigo: String(lote.codigo || '').trim().slice(0, 64),
      especie: String(lote.especie || '').trim().slice(0, 128),
      especieCientifico: String(lote.especieCientifico || '').trim().slice(0, 128),
      fechaInoculacion: String(lote.fechaInoculacion || '').trim().slice(0, 32),
      numBolsas,
      estado: String(lote.estado || 'incubacion').trim().slice(0, 32)
    };
  }

  /**
   * Sanea una cosecha para la ficha pública.
   * Solo incluye calidad si es un número entero válido en 0..5 (omite observaciones no registradas).
   *
   * @param {object} cosecha
   * @returns {object}
   */
  function sanearCosecha(cosecha) {
    if (!cosecha || typeof cosecha !== 'object') {
      return { id: '', fecha: '', pesoFresco: 0, flush: 1 };
    }

    const pesoFrescoRaw = Number(cosecha.pesoFresco);
    const pesoFresco = Number.isFinite(pesoFrescoRaw)
      ? Math.max(0, Math.min(10000000, pesoFrescoRaw))
      : 0;

    const flushRaw = Number(cosecha.flush);
    const flush = Number.isFinite(flushRaw)
      ? Math.max(1, Math.min(100, Math.floor(flushRaw)))
      : 1;

    const res = {
      id: String(cosecha.id || '').trim().slice(0, 64),
      fecha: String(cosecha.fecha || '').trim().slice(0, 32),
      pesoFresco,
      flush
    };

    if (
      cosecha.calidad != null &&
      cosecha.calidad !== '' &&
      Number.isFinite(Number(cosecha.calidad))
    ) {
      res.calidad = Math.max(0, Math.min(5, Math.floor(Number(cosecha.calidad))));
    }

    return res;
  }

  /**
   * Sanea el objeto de metadatos de un evento mediante ALLOWLIST POSITIVA ESTRICTA.
   * Cualquier campo fuera de la lista es omitido.
   *
   * @param {object} meta
   * @returns {object}
   */
  function sanearMetaPublica(meta) {
    if (!meta || typeof meta !== 'object') return {};

    const clean = {};

    if (Number.isFinite(Number(meta.temperatura))) {
      clean.temperatura = Math.max(-20, Math.min(60, Number(meta.temperatura)));
    }
    if (Number.isFinite(Number(meta.humedad))) {
      clean.humedad = Math.max(0, Math.min(100, Number(meta.humedad)));
    }
    if (Number.isFinite(Number(meta.co2))) {
      clean.co2 = Math.max(0, Math.min(10000, Number(meta.co2)));
    }
    if (typeof meta.tipoInspeccion === 'string' && meta.tipoInspeccion.trim()) {
      clean.tipoInspeccion = meta.tipoInspeccion.trim().slice(0, 64);
    }
    if (typeof meta.resultadoInspeccion === 'string' && meta.resultadoInspeccion.trim()) {
      clean.resultadoInspeccion = meta.resultadoInspeccion.trim().slice(0, 64);
    }
    if (Number.isInteger(Number(meta.flush)) && Number(meta.flush) >= 1 && Number(meta.flush) <= 100) {
      clean.flush = Number(meta.flush);
    }
    if (Number.isFinite(Number(meta.pesoCosecha)) && Number(meta.pesoCosecha) >= 0) {
      clean.pesoCosecha = Math.max(0, Math.min(10000000, Number(meta.pesoCosecha)));
    }
    if (typeof meta.fase === 'string' && meta.fase.trim()) {
      clean.fase = meta.fase.trim().slice(0, 32);
    }
    if (typeof meta.observacionPublica === 'string' && meta.observacionPublica.trim()) {
      clean.observacionPublica = meta.observacionPublica.trim().slice(0, 500);
    }

    return clean;
  }

  /**
   * Sanea un evento individual de la línea de tiempo (lifecycleEvents / historial).
   *
   * @param {object} evt
   * @returns {object}
   */
  function sanearEventoPublico(evt) {
    if (!evt || typeof evt !== 'object') {
      return {
        id: '',
        type: 'event',
        title: 'Evento',
        at: '',
        stage: '',
        scope: 'batch',
        bagId: null,
        meta: {}
      };
    }

    const type = String(evt.type || evt.action || evt.tipo || 'event').trim().slice(0, 32);
    const title = String(evt.title || (evt.type || evt.action || evt.tipo || 'Evento')).trim().slice(0, 64);
    const at = String(evt.at || evt.timestamp || '').trim().slice(0, 32);
    const stage = String(evt.stage || evt.to || evt.fase || '').trim().slice(0, 32);
    const hasBag = Boolean(evt.bagId || evt.scope === 'bag');
    const scope = hasBag ? 'bag' : 'batch';
    const bagId = evt.bagId ? String(evt.bagId).trim().slice(0, 64) : null;

    const rawMeta = evt.meta || evt.payload || {};
    const meta = sanearMetaPublica(rawMeta);

    return {
      id: String(evt.id || '').trim().slice(0, 64),
      type,
      title,
      at,
      stage,
      scope,
      bagId,
      meta
    };
  }

  /**
   * Calcula el resumen estadístico público de bolsas de un lote.
   *
   * @param {object} lote
   * @param {Array<object>} [bolsas=[]]
   * @returns {{ total: number, sanas: number, completadas: number }}
   */
  function computePublicBagsSummary(lote, bolsas = []) {
    if (Array.isArray(bolsas) && bolsas.length > 0) {
      let sanas = 0;
      let completadas = 0;
      for (const b of bolsas) {
        if (!b) continue;
        const st = String(b.estado || '').toLowerCase();
        if (st === 'descartada' || st === 'contaminada' || st === 'baja') {
          // bolsa no sana
        } else if (st === 'completado' || st === 'fructificacion' || st === 'cosecha') {
          completadas += 1;
          sanas += 1;
        } else {
          sanas += 1;
        }
      }
      return {
        total: bolsas.length,
        sanas,
        completadas
      };
    }

    const total = Number.isFinite(Number(lote?.numBolsas))
      ? Math.max(0, Math.floor(Number(lote.numBolsas)))
      : 0;

    return {
      total,
      sanas: total,
      completadas: 0
    };
  }

  /**
   * Construye el documento canónico completo para public_lotes/{batchCode}.
   *
   * @param {object} lote Lote canónico de Bitácora / Producción
   * @param {Array<object>} [cosechas=[]] Cosechas registradas
   * @param {Array<object>} [bolsas=[]] Bolsas individuales registradas
   * @param {object} [options={}] Opciones opcionales (timestamps inyectables)
   * @returns {object} DTO seguro para escritura pública
   */
  function buildPublicTraceDocument(lote, cosechas = [], bolsas = [], options = {}) {
    if (!lote || !lote.codigo) {
      throw new Error('No se puede construir un DTO de trazabilidad pública sin código de lote.');
    }

    const baseLote = sanearLote(lote);

    const rawEvents = Array.isArray(options)
      ? options
      : (Array.isArray(options?.events)
          ? options.events
          : (Array.isArray(lote.lifecycleEvents)
              ? lote.lifecycleEvents
              : (Array.isArray(lote.historial) ? lote.historial : [])));

    const lifecycleEvents = rawEvents.map(sanearEventoPublico);
    const bags = computePublicBagsSummary(lote, bolsas);
    const harvests = (Array.isArray(cosechas) ? cosechas : []).map(sanearCosecha);

    const nowIso = options.nowIso || new Date().toISOString();

    return {
      schemaVersion: SCHEMA_VERSION,
      codigo: baseLote.codigo,
      especie: baseLote.especie,
      especieCientifico: baseLote.especieCientifico,
      fechaInoculacion: baseLote.fechaInoculacion,
      numBolsas: baseLote.numBolsas,
      estado: baseLote.estado,
      lifecycleEvents,
      bags,
      harvests,
      traceability: {
        publishedAt: options.publishedAt || nowIso,
        updatedAt: options.updatedAt || nowIso,
        schemaVersion: SCHEMA_VERSION
      }
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    sanearLote,
    sanearCosecha,
    sanearMetaPublica,
    sanearEventoPublico,
    computePublicBagsSummary,
    buildPublicTraceDocument
  });
});
