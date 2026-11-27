// Módulo de sincronización en tiempo real de Telemetría IoT para Setas OS.
// Sincroniza lecturas microclimáticas de sensores ESP32 (SHT31/SCD30/DS18B20)
// hacia Cloud Firestore con soporte de persistencia local offline (IndexedDB).

import {
  collection,
  doc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "../vendor/firebase/firebase-firestore.js";

// Valor numérico o null. Un sensor que no reporta (null, '', NaN) se guarda
// como null — nunca como 0 °C / 0 % HR, que el puente en vivo y el motor de
// anomalías tomarían como una lectura real.
const metricOrNull = (v) => {
  if (v == null || typeof v === "boolean" || (typeof v === "string" && v.trim() === "")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Construye el documento de una lectura climática, o null si la lectura no
 * trae ninguna métrica numérica. Exportada para poder probarla sin Firestore.
 */
export function buildClimatePayload(reading) {
  if (!reading || !reading.roomId) return null;

  const roomId = reading.roomId;
  const temp = metricOrNull(reading.temperature_c ?? reading.temp);
  const rh = metricOrNull(reading.rh_pct ?? reading.rh);
  const co2 = metricOrNull(reading.co2_ppm);
  const subTemp = metricOrNull(reading.substrate_temperature_c);
  if (temp == null && rh == null && co2 == null && subTemp == null) return null;

  // Presión de Vapor Saturada y DPV (kPa): solo con temperatura y HR medidas.
  let vpd = null;
  if (temp != null && rh != null) {
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    vpd = Number((svp * (1 - Math.min(100, Math.max(0, rh)) / 100)).toFixed(3));
  }

  return {
    room_id: roomId,
    temperature_c: temp,
    rh_pct: rh,
    co2_ppm: co2,
    substrate_temperature_c: subTemp,
    dpv_kpa: vpd,
    // Bandera de procedencia del CO2, no un adorno: el puente en vivo
    // (live-telemetry-bridge.js) relee estos documentos y compensa por altitud
    // toda lectura NDIR que no la traiga. Si el firmware ya compensó (un SCD30
    // al que se le pasa la presion ambiente lo hace) y este campo se pierde al
    // escribir, el puente aplica el factor ~1.36 encima del valor ya corregido
    // y el CO2 aparece inflado un 36 % con alertas que no existen.
    co2_pressure_compensated: reading.co2_pressure_compensated === true,
    source: reading.source || "esp32_hardware",
    device_id: reading.deviceId || `esp32-${roomId}`,
    created_at: serverTimestamp(),
    timestamp_local: new Date().toISOString()
  };
}

/**
 * Registra una lectura climática validada en la colección 'telemetria_lecturas'
 * y actualiza el estado más reciente de la sala en 'telemetria_salas/{roomId}'.
 *
 * @param {Object} db - Instancia de Firestore
 * @param {Object} reading - Datos de la lectura ({ roomId, temperature_c, rh_pct, co2_ppm, substrate_temperature_c, dpv_kpa, source })
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function pushClimateReading(db, reading) {
  if (!db || !reading || !reading.roomId) {
    return { success: false, error: "Parámetros de telemetría inválidos o incompletos." };
  }
  const payload = buildClimatePayload(reading);
  if (!payload) {
    return { success: false, error: "La lectura no trae ninguna métrica numérica." };
  }
  const roomId = payload.room_id;
  const vpd = payload.dpv_kpa;

  try {
    // 1. Guardar evento histórico en la serie de tiempo
    const logRef = await addDoc(collection(db, "telemetria_lecturas"), payload);

    // 2. Actualizar el snapshot en vivo de la sala para el cockpit operativo
    const roomStateRef = doc(db, "telemetria_salas", roomId);
    await setDoc(roomStateRef, {
      ...payload,
      last_updated: serverTimestamp()
    }, { merge: true });

    return { success: true, id: logRef.id, dpv_kpa: vpd };
  } catch (err) {
    console.error(`[TelemetriaSync] Error al enviar lectura para sala ${roomId}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Escucha en tiempo real el estado climático actual de todas las salas de cultivo.
 *
 * @param {Object} db - Instancia de Firestore
 * @param {Function} onUpdate - Callback invocado con el mapa de salas actualizado { [roomId]: data }
 * @returns {Function} unsubscribe - Función para cancelar el listener
 */
export function subscribeToLiveClimate(db, onUpdate) {
  if (!db || typeof onUpdate !== "function") return () => {};

  const colRef = collection(db, "telemetria_salas");
  return onSnapshot(colRef, (snapshot) => {
    const liveMap = {};
    snapshot.forEach((docSnap) => {
      liveMap[docSnap.id] = {
        id: docSnap.id,
        ...docSnap.data()
      };
    });
    onUpdate(liveMap);
  }, (err) => {
    console.warn("[TelemetriaSync] Error en la suscripción en vivo a telemetría:", err);
  });
}
