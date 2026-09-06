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

  const roomId = reading.roomId;
  const temp = Number(reading.temperature_c ?? reading.temp ?? 0);
  const rh = Number(reading.rh_pct ?? reading.rh ?? 0);
  const co2 = reading.co2_ppm != null ? Number(reading.co2_ppm) : null;
  const subTemp = reading.substrate_temperature_c != null ? Number(reading.substrate_temperature_c) : null;
  
  // Cálculo estequiométrico/físico de Presión de Vapor Saturada y DPV (kPa) a 2.600 msnm
  const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  const vpd = Number((svp * (1 - rh / 100)).toFixed(3));

  const payload = {
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
