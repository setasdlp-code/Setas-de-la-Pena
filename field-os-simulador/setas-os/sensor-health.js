'use strict';

/**
 * @file sensor-health.js — Capa determinística de salud y confianza de sensores para Setas OS.
 *
 * Módulo puro, sin IA ni dependencias externas. Transforma lecturas crudas y metadatos
 * de transporte/calibración en un estado operacional explícito, auditable y visible:
 *   · healthy          Lectura fresca, en rango físico, transporte activo y consistente.
 *   · degraded         Divergencia entre sensores redundantes, jitter alto o calidad sospechosa.
 *   · stale            Sin lecturas válidas dentro de la ventana de frescura (>90 s).
 *   · quarantined      Lectura físicamente imposible o rechazada por telemetry-contract.
 *   · calibration_due  Calibración vencida o requerida por especificación del sensor.
 *   · offline          Sin paquetes ni telemetría en ningún transporte (>15 min).
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const telemetryContract = isNode
    ? require('./telemetry-contract.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasTelemetry : null);

  const DEFAULT_FRESH_MS = 90 * 1000;         // 90 segundos: por encima de esto se considera stale
  const DEFAULT_OFFLINE_MS = 15 * 60 * 1000;  // 15 minutos: por encima de esto el nodo está offline
  const DEFAULT_MAX_TEMP_DIVERGENCE_C = 2.0;  // Divergencia máxima tolerable entre sondas de T (°C)
  const DEFAULT_MAX_RH_DIVERGENCE_PCT = 7.0;  // Divergencia máxima tolerable entre sondas de RH (%)
  const DEFAULT_MAX_CO2_DIVERGENCE_PPM = 250; // Divergencia máxima tolerable entre sensores CO2 (ppm)

  const HEALTH_PRIORITY = {
    offline: 0,
    quarantined: 1,
    calibration_due: 2,
    stale: 3,
    degraded: 4,
    healthy: 5,
  };

  const getWorstStatus = (statuses = []) => {
    if (!statuses.length) return 'offline';
    let worst = 'healthy';
    for (const s of statuses) {
      if ((HEALTH_PRIORITY[s] ?? 99) < (HEALTH_PRIORITY[worst] ?? 99)) {
        worst = s;
      }
    }
    return worst;
  };

  /**
   * Evalúa la salud de una lectura individual contra el reloj del sistema.
   */
  const evaluateReadingHealth = (rawReading, { now = Date.now(), freshMs = DEFAULT_FRESH_MS } = {}) => {
    if (!rawReading) {
      return {
        status: 'offline',
        isFresh: false,
        ageMs: null,
        reasons: ['reading_null_or_undefined'],
      };
    }

    const reading = telemetryContract ? telemetryContract.normalizeTelemetry(rawReading) : rawReading;
    const observedMs = reading.observed_at ? new Date(reading.observed_at).getTime() : null;
    const reasons = Array.isArray(reading.quality_reasons) ? [...reading.quality_reasons] : [];

    if (!observedMs || !Number.isFinite(observedMs)) {
      return {
        status: 'offline',
        isFresh: false,
        ageMs: null,
        reasons: ['invalid_observed_at', ...reasons],
        reading,
      };
    }

    const ageMs = Math.max(0, now - observedMs);
    const isFresh = ageMs <= freshMs;

    if (reading.quality === 'quarantined') {
      return {
        status: 'quarantined',
        isFresh,
        ageMs,
        reasons: reasons.length ? reasons : ['quarantined_by_contract'],
        reading,
      };
    }

    if (reading.quality === 'calibration_due') {
      return {
        status: 'calibration_due',
        isFresh,
        ageMs,
        reasons: reasons.length ? reasons : ['calibration_required'],
        reading,
      };
    }

    if (!isFresh) {
      reasons.push(`stale_age_${Math.round(ageMs / 1000)}s`);
      return {
        status: 'stale',
        isFresh: false,
        ageMs,
        reasons,
        reading,
      };
    }

    if (reading.quality === 'suspect' || reading.quality === 'missing' || reading.value == null) {
      return {
        status: 'degraded',
        isFresh: true,
        ageMs,
        reasons: reasons.length ? reasons : ['suspect_reading_quality'],
        reading,
      };
    }

    return {
      status: 'healthy',
      isFresh: true,
      ageMs,
      reasons,
      reading,
    };
  };

  /**
   * Evalúa la salud de un dispositivo físico a partir de sus lecturas y metadatos.
   */
  const evaluateDeviceHealth = (deviceId, readingsForDevice = [], {
    now = Date.now(),
    freshMs = DEFAULT_FRESH_MS,
    offlineMs = DEFAULT_OFFLINE_MS,
    calibrationMetadata = {},
  } = {}) => {
    const cleanId = String(deviceId || 'unknown').trim();
    if (!readingsForDevice.length) {
      return {
        deviceId: cleanId,
        status: 'offline',
        lastSeenAt: null,
        ageMs: null,
        reasons: ['no_readings_received'],
      };
    }

    let latestObservedMs = -Infinity;
    let latestIso = null;
    const evaluatedReadings = readingsForDevice.map(r => {
      const evalRes = evaluateReadingHealth(r, { now, freshMs });
      const obsMs = r.observed_at ? new Date(r.observed_at).getTime() : 0;
      if (obsMs > latestObservedMs) {
        latestObservedMs = obsMs;
        latestIso = r.observed_at;
      }
      return evalRes;
    });

    const ageMs = latestObservedMs > 0 ? Math.max(0, now - latestObservedMs) : null;
    const reasons = [];

    // Verificación de expiración de calibración explícita
    const calMeta = calibrationMetadata[cleanId] || {};
    const calExpiryMs = calMeta.expiresAt ? new Date(calMeta.expiresAt).getTime() : null;
    const isCalExpired = calExpiryMs && Number.isFinite(calExpiryMs) && now > calExpiryMs;

    if (ageMs == null || ageMs > offlineMs) {
      reasons.push(`offline_silent_for_${Math.round((ageMs || 0) / 1000)}s`);
      return {
        deviceId: cleanId,
        status: 'offline',
        lastSeenAt: latestIso,
        ageMs,
        reasons,
      };
    }

    if (isCalExpired || calMeta.calibrationDue) {
      reasons.push('device_calibration_expired');
      return {
        deviceId: cleanId,
        status: 'calibration_due',
        lastSeenAt: latestIso,
        ageMs,
        reasons,
      };
    }

    const statuses = evaluatedReadings.map(e => e.status);
    const worst = getWorstStatus(statuses);

    return {
      deviceId: cleanId,
      status: worst,
      lastSeenAt: latestIso,
      ageMs,
      reasons: [...new Set(evaluatedReadings.flatMap(e => e.reasons))],
    };
  };

  /**
   * Evalúa la salud ambiental consolidada de una sala, detectando redundancias y divergencias.
   */
  const evaluateRoomSensorHealth = ({
    roomId = 'SALA_DEFAULT',
    readings = [],
    devices = {},
    transports = {},
    now = Date.now(),
    config = {},
  } = {}) => {
    const freshMs = config.freshMs || DEFAULT_FRESH_MS;
    const offlineMs = config.offlineMs || DEFAULT_OFFLINE_MS;
    const maxTempDiv = config.maxTempDiv || DEFAULT_MAX_TEMP_DIVERGENCE_C;
    const maxRhDiv = config.maxRhDiv || DEFAULT_MAX_RH_DIVERGENCE_PCT;
    const maxCo2Div = config.maxCo2Div || DEFAULT_MAX_CO2_DIVERGENCE_PPM;

    // Agrupar lecturas por métrica
    const metricGroups = {
      temperature_c: [],
      rh_pct: [],
      co2_ppm: [],
      substrate_temperature_c: [],
    };

    // Agrupar lecturas por dispositivo
    const deviceGroups = {};

    readings.forEach(raw => {
      const normalized = telemetryContract ? telemetryContract.normalizeTelemetry(raw) : raw;
      if (!normalized) return;
      if (metricGroups[normalized.metric]) {
        metricGroups[normalized.metric].push(normalized);
      }
      const devId = normalized.device_id || 'unknown';
      if (!deviceGroups[devId]) deviceGroups[devId] = [];
      deviceGroups[devId].push(normalized);
    });

    // Evaluar cada métrica
    const metricReports = {};
    const metricStatuses = [];

    for (const [metric, mReadings] of Object.entries(metricGroups)) {
      if (!mReadings.length) {
        metricReports[metric] = {
          metric,
          status: 'offline',
          value: null,
          unit: telemetryContract?.METRICS?.[metric]?.unit || null,
          isFresh: false,
          ageMs: null,
          reasons: ['no_telemetry_for_metric'],
          description: 'Sin señal de sensor',
        };
        continue;
      }

      // Ordenar por observed_at descendente (la más reciente primero)
      const sorted = [...mReadings].sort((a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime());
      const latest = sorted[0];
      const evaluated = evaluateReadingHealth(latest, { now, freshMs });

      let metricStatus = evaluated.status;
      const reasons = [...evaluated.reasons];
      let divergenceVal = null;

      // Comprobación de divergencia entre sensores redundantes si existen múltiples lecturas frescas de distintos nodos
      const freshReadings = sorted.filter(r => {
        const obs = new Date(r.observed_at).getTime();
        return Number.isFinite(obs) && (now - obs) <= freshMs && Number.isFinite(Number(r.value)) && r.quality === 'valid';
      });

      if (freshReadings.length >= 2) {
        const distinctDevices = [...new Set(freshReadings.map(r => r.device_id))];
        if (distinctDevices.length >= 2) {
          const values = freshReadings.map(r => Number(r.value));
          const min = Math.min(...values);
          const max = Math.max(...values);
          const diff = max - min;
          divergenceVal = Math.round(diff * 100) / 100;

          let limit = Infinity;
          if (metric === 'temperature_c' || metric === 'substrate_temperature_c') limit = maxTempDiv;
          else if (metric === 'rh_pct') limit = maxRhDiv;
          else if (metric === 'co2_ppm') limit = maxCo2Div;

          if (diff > limit) {
            metricStatus = 'degraded';
            reasons.push(`sensor_divergence_${divergenceVal}_exceeds_${limit}`);
          }
        }
      }

      const ageSec = evaluated.ageMs != null ? Math.round(evaluated.ageMs / 1000) : null;
      let description = 'válido';
      if (metricStatus === 'healthy') {
        description = ageSec != null ? `válido · hace ${ageSec} s` : 'válido';
      } else if (metricStatus === 'stale') {
        description = ageSec != null ? `desactualizado · hace ${ageSec} s` : 'desactualizado';
      } else if (metricStatus === 'degraded') {
        description = reasons.some(r => r.includes('divergence'))
          ? `degradado · divergencia entre sensores (Δ ${divergenceVal})`
          : 'degradado · calidad dudosa';
      } else if (metricStatus === 'calibration_due') {
        description = 'degradado · calibración pendiente';
      } else if (metricStatus === 'quarantined') {
        description = 'en cuarentena · lectura imposible';
      } else if (metricStatus === 'offline') {
        description = 'offline · sin señal';
      }

      metricReports[metric] = {
        metric,
        status: metricStatus,
        value: latest.value,
        unit: latest.unit || telemetryContract?.METRICS?.[metric]?.unit || null,
        deviceId: latest.device_id,
        observed_at: latest.observed_at,
        isFresh: evaluated.isFresh,
        ageMs: evaluated.ageMs,
        divergence: divergenceVal,
        reasons,
        description,
      };

      metricStatuses.push(metricStatus);
    }

    // Evaluar cada dispositivo
    const deviceReports = {};
    const allDeviceIds = new Set([...Object.keys(devices), ...Object.keys(deviceGroups)]);
    for (const devId of allDeviceIds) {
      deviceReports[devId] = evaluateDeviceHealth(devId, deviceGroups[devId] || [], {
        now,
        freshMs,
        offlineMs,
        calibrationMetadata: devices,
      });
    }

    const overallStatus = getWorstStatus(metricStatuses);

    return {
      roomId,
      overallStatus,
      metrics: metricReports,
      devices: deviceReports,
      transports,
      evaluatedAt: new Date(now).toISOString(),
    };
  };

  /**
   * Genera el perfil de confiabilidad de telemetría para un ciclo completo (CycleEvidence).
   */
  const summarizeCycleTelemetryHealth = (readings = [], cycleWindow = {}) => {
    if (!Array.isArray(readings) || !readings.length) {
      return {
        totalReadings: 0,
        validCount: 0,
        validPct: 0,
        degradedCount: 0,
        degradedPct: 0,
        quarantinedCount: 0,
        calibrationDueCount: 0,
        reliabilityGrade: 'NONE',
        provenanceNote: 'Sin telemetría registrada en el ciclo.',
      };
    }

    let validCount = 0;
    let degradedCount = 0;
    let quarantinedCount = 0;
    let calibrationDueCount = 0;
    let missingCount = 0;

    readings.forEach(r => {
      const q = r.quality || 'valid';
      if (q === 'valid') validCount++;
      else if (q === 'quarantined') quarantinedCount++;
      else if (q === 'calibration_due') calibrationDueCount++;
      else if (q === 'suspect') degradedCount++;
      else if (q === 'missing') missingCount++;
      else validCount++;
    });

    const total = readings.length;
    const validPct = Math.round((validCount / total) * 1000) / 10;
    const degradedPct = Math.round(((degradedCount + calibrationDueCount) / total) * 1000) / 10;

    let reliabilityGrade = 'HIGH';
    let provenanceNote = `Telemetría ${validPct}% válida (alta confiabilidad).`;

    if (validPct < 70 || quarantinedCount > (total * 0.1)) {
      reliabilityGrade = 'LOW';
      provenanceNote = `Telemetría ${validPct}% válida (${quarantinedCount} en cuarentena). Ponderación reducida para Perito.`;
    } else if (validPct < 90 || quarantinedCount > 0 || calibrationDueCount > 0) {
      reliabilityGrade = 'ACCEPTABLE';
      provenanceNote = `Telemetría ${validPct}% válida (${degradedPct}% degradada o pendiente de calibración).`;
    }

    return {
      totalReadings: total,
      validCount,
      validPct,
      degradedCount,
      degradedPct,
      quarantinedCount,
      calibrationDueCount,
      missingCount,
      reliabilityGrade,
      provenanceNote,
    };
  };

  const api = {
    DEFAULT_FRESH_MS,
    DEFAULT_OFFLINE_MS,
    DEFAULT_MAX_TEMP_DIVERGENCE_C,
    DEFAULT_MAX_RH_DIVERGENCE_PCT,
    DEFAULT_MAX_CO2_DIVERGENCE_PPM,
    evaluateReadingHealth,
    evaluateDeviceHealth,
    evaluateRoomSensorHealth,
    summarizeCycleTelemetryHealth,
    getWorstStatus,
  };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasSensorHealth = api;
})();
