'use strict';

/**
 * @file field-event-callable-transport.js — Transporte real hacia acceptFieldEvent.
 *
 * El SDK de Cloud Functions no está vendorizado y la aplicación no tiene
 * bundler, así que en vez de incorporar un SDK entero para una sola llamada se
 * habla directamente el protocolo callable: POST { data }, respuesta
 * { result } o { error }.
 *
 * La función lanza HttpsError con el código del contrato en `details.code`.
 * Ese código es lo que decide si el motor reintenta o da el evento por
 * terminado, así que se propaga tal cual en vez de inferirlo del mensaje.
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;

  const getContracts = () => (isNode
    ? require('./field-event-contracts.js')
    : (typeof globalThis !== 'undefined' ? globalThis.SetasFieldEventContracts : null));

  const DEFAULT_REGION = 'us-central1';
  const FUNCTION_NAME = 'acceptFieldEvent';

  // El servidor ya antepone el código a su mensaje, así que volver a anteponerlo
  // produce "batch_not_found: batch_not_found: L-123" — y ese texto llega al
  // operario tal cual en el error de la hoja de acción.
  const fail = (code, detail) => {
    const clean = detail && String(detail).startsWith(`${code}:`)
      ? String(detail).slice(code.length + 1).trim()
      : detail;
    return Object.assign(new Error(clean ? `${code}: ${clean}` : code), { code });
  };

  const endpointFor = (projectId, region) =>
    `https://${region}-${projectId}.cloudfunctions.net/${FUNCTION_NAME}`;

  /**
   * @param {object} deps
   * @param {() => Promise<string>} deps.getIdToken  token de la sesión actual
   * @param {string} deps.projectId
   * @param {string} [deps.region]
   * @param {Function} [deps.fetchImpl]  inyectable para pruebas
   */
  const createCallableTransport = ({ getIdToken, projectId, region = DEFAULT_REGION, fetchImpl }) => {
    if (typeof getIdToken !== 'function') throw new Error('getIdToken es obligatorio');
    if (!projectId) throw new Error('projectId es obligatorio');

    const doFetch = fetchImpl || (typeof globalThis !== 'undefined' ? globalThis.fetch : null);
    if (typeof doFetch !== 'function') throw new Error('fetch no está disponible');

    const url = endpointFor(projectId, region);

    return async function transport(envelope) {
      let token;
      let response;
      try {
        token = await getIdToken();
        response = await doFetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: envelope }),
        });
      } catch (err) {
        // Fallo de red o de sesión: reintentable. No se descarta el evento.
        throw fail('network_error', err && err.message);
      }

      let body = null;
      try {
        body = await response.json();
      } catch (e) {
        // Un 5xx sin cuerpo JSON sigue siendo un fallo de transporte.
        throw fail('network_error', `respuesta ilegible (HTTP ${response.status})`);
      }

      if (!response.ok || (body && body.error)) {
        const error = (body && body.error) || {};
        const code = error.details && error.details.code;
        const contracts = getContracts();
        // Sólo se acepta un código del vocabulario compartido. Cualquier otra
        // cosa (un 500 inesperado, un proxy que responde HTML) es transporte:
        // tratarla como terminal descartaría trabajo del operario por un fallo
        // que un reintento habría resuelto.
        const known = contracts && contracts.ERROR_CODES && contracts.ERROR_CODES[code];
        throw fail(known ? code : 'network_error', error.message);
      }

      const receipt = body && body.result;
      const contracts = getContracts();
      if (contracts && typeof contracts.validateReceipt === 'function') {
        contracts.validateReceipt(receipt);
      }
      return receipt;
    };
  };

  const api = { createCallableTransport, endpointFor, DEFAULT_REGION, FUNCTION_NAME };

  if (isNode) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.SetasFieldEventCallableTransport = api;
})();
