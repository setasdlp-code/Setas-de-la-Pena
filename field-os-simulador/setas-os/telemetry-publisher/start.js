'use strict';
// Never load credentials or open a port when this module is imported by tests.
async function main() {
  const fs = require('node:fs');
  const { validateDevices, createPublisherHandler, createFirestorePublisher } = require('./publisher.js');
  const devicesPath = process.env.SETAS_SENSOR_DEVICES_FILE;
  if (!devicesPath) throw new Error('SETAS_SENSOR_DEVICES_FILE is required (keep it outside the repository)');
  const devices = validateDevices(JSON.parse(fs.readFileSync(devicesPath, 'utf8')));
  const host = process.env.SETAS_SENSOR_HOST || '127.0.0.1';
  const port = Number(process.env.SETAS_SENSOR_PORT || 8443);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
  const cert = process.env.SETAS_SENSOR_TLS_CERT;
  const key = process.env.SETAS_SENSOR_TLS_KEY;
  if (Boolean(cert) !== Boolean(key) || (!cert && !['127.0.0.1', '::1'].includes(host))) throw new Error('TLS certificate and key are required for network exposure');
  const { initializeApp, applicationDefault } = require('firebase-admin/app');
  const { getFirestore, FieldValue } = require('firebase-admin/firestore');
  initializeApp({ projectId: 'sdlp-os', ...(process.env.FIRESTORE_EMULATOR_HOST ? {} : { credential: applicationDefault() }) });
  const publish = createFirestorePublisher({ db: getFirestore(), serverTimestamp: () => FieldValue.serverTimestamp() });
  const handler = createPublisherHandler({ devices, publish });
  const server = cert ? require('node:https').createServer({ cert: fs.readFileSync(cert), key: fs.readFileSync(key) }, handler) : require('node:http').createServer(handler);
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.listen(port, host, () => console.log(`Sensor publisher listening on ${cert ? 'https' : 'http'}://${host}:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
if (require.main === module) main().catch(() => { console.error('Sensor publisher could not start; check device assignments, TLS configuration and Application Default Credentials.'); process.exitCode = 1; });
module.exports = { main };
