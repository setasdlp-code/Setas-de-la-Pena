# ESP32 → publisher → Firestore → Módulos

Status: local implementation; not commissioned, started on a farm host, or deployed.
Database inspected read-only on 2026-11-08: `sdlp-os`, `(default)`, Standard,
Native mode, `southamerica-east1`. No database writes were performed.

The ESP32 sends HTTPS `POST /api/telemetry` to an always-on LAN gateway.
The gateway authenticates a per-device bearer token, assigns the device to its
configured room, validates observations through the existing telemetry contract,
and commits history plus the latest room snapshot in one Firestore transaction.
Setas OS's existing authenticated subscription reads `telemetria_salas`.
No actuator routes or commands are exposed by this service.

## Inventory-grounded design

See [hardware-design.md](hardware-design.md) for the repository reconciliation, proposed device allocations and unresolved ownership/material conflicts. The three telemetry-only node profiles are `esphome-martha.yaml`, `esphome-cloudlab.yaml`, and `esphome-incubacion.yaml`. They allocate the one recorded MH-Z19C only to Cloudlab; other modules do not require or synthesize CO2. Pi 4 retains Home Assistant; Pi Zero 2 W is the proposed publisher host, subject to verifying its OS, storage and power.

## Configuration outside the repository

Create an owner-readable JSON file on the gateway (mode `0600`). Each key is the
actual ESP32 device ID; values contain `roomId` and a unique random `token` of at
least 32 characters. Allowed room IDs are `martha_01`, `cloudlab_844`, and
`incubacion_01`. Multiple nodes may belong to a room. Do not copy example device
IDs into production without checking their physical assignment.

Example shape only (replace the token before use):

```json
{
  "setas-node-01": {
    "roomId": "martha_01",
    "token": "REPLACE_WITH_UNIQUE_RANDOM_TOKEN_AT_LEAST_32_CHARS"
  }
}
```

Set these environment variables on the gateway:

- `SETAS_SENSOR_DEVICES_FILE`: absolute path to the private JSON file.
- `SETAS_SENSOR_HOST`: gateway's LAN interface address; default is loopback.
- `SETAS_SENSOR_PORT`: listening port; default is `8443`.
- `SETAS_SENSOR_TLS_CERT` and `SETAS_SENSOR_TLS_KEY`: certificate/key paths.
- Application Default Credentials for an approved service identity with access
  to Firestore in `sdlp-os`. Firebase CLI login is not a gateway service identity.
  Never put a service-account key on the ESP32 or in the web application.

Network exposure requires TLS. The certificate must match the hostname used by
the ESP32. Plain HTTP is permitted only on loopback for local development.
After human approval of credentials and production operation, start from the
Setas OS directory:

```sh
npm run sensors:publish
```

This is an always-on process: closing its terminal stops publishing. Use the
host's process supervisor for commissioning; its identity/paths must be chosen
for the actual host. This change does not install a service automatically.

## ESPHome integration

`esphome-publish.package.yaml` handles T/HR and optional CO2. It requires
`room_temp` and `room_humidity` sensor IDs with their capture callbacks;
the three supplied node profiles attach `esphome-capture-temp.yaml` and
`esphome-capture-rh.yaml` to each sensor child's `on_value` action. Cloudlab
alone includes `esphome-mhz19.package.yaml`, which captures CO2 independently.
No absent `room_co2` ID is referenced by the common package.

Copy the relevant profile and shared packages into the node's configuration
directory. Review sensor IDs and wiring. These telemetry-only profiles are
starting points, not replacements for existing commissioned control firmware.
Merge transport and timestamp callbacks into existing firmware to preserve its
control behavior. No relay or cultivation settings are added.

In the node's private `secrets.yaml`, set `setas_publisher_url` to the full HTTPS
URL ending in `/api/telemetry`, and `setas_publisher_authorization` to `Bearer `
followed by that node's token. Set `sensor_device_id` to its configured gateway
assignment. Wi-Fi secrets stay in the existing node configuration.

TLS verification stays enabled. For a private CA, configure
`ca_certificate_path` with its PEM file; never disable verification. See
[ESPHome HTTP Request](https://esphome.io/components/http_request/).
SNTP must synchronize before sending observations; see
[ESPHome Time](https://esphome.io/components/time/).

Check whether the node already pressure-compensates its CO2. Only then change
`co2_pressure_compensated` to `true`; otherwise the existing app bridge applies
its correction. Omit absent metrics. Nodes without CO2 simply omit the MH-Z19C package, as the Martha and incubation profiles already do.

The package records each metric’s time in its sensor `on_value` callback and sends available observations every 60 seconds. A cached value retains its original observation time. It warns on failure;
it has no persistent offline queue. A network outage may therefore leave a gap,
not fabricated historical observations. Validate with the installed ESPHome
version and physical node before flashing. No firmware was flashed here.

## Persistence and observation semantics

Each `telemetria_lecturas` document is identified by a SHA-256 hash of
room/device/metric/observation time; retries do not add duplicate history rows.
Each `telemetria_salas/{roomId}` contains a `metric_readings` map. Its metric
entries preserve value, unit, device, source, observation time and CO2 flag.
New temperature cannot refresh old CO2. Delayed packets are kept in history
but cannot replace newer metric snapshots. The bridge still accepts legacy
flat room documents; after commissioning this publisher for a room, avoid
concurrent legacy writers for that room.

Unchanged retries leave the original receipt time intact. A conflicting value for an existing device/metric/time returns HTTP 409 and changes no records.

The gateway returns HTTP 200 only after the transaction commits. A Firestore
failure returns retryable HTTP 503. Invalid/unauthorized packets never publish.
The gateway currently rejects the whole packet if any supplied metric is
invalid, keeping acceptance explicit to the sender.

## Verification and commissioning gate

Local checks:

ESPHome 2026.10.2 accepted and fully compiled all three prepared node profiles with ESP-IDF 5.5.6 on 2026-11-08 using synthetic secrets. See [firmware-validation.json](firmware-validation.json) for profile results and test-binary hashes. A compiler error in the timestamp callbacks was fixed before the successful builds. These validation-only binaries must not be flashed. To repeat without exposing local secrets or modifying the profiles:

```sh
python3 telemetry-publisher/validate-esphome.py --esphome /path/to/esphome
```

Add `--compile` to build the firmware as well; this may download the ESP32 toolchain. The script never flashes or contacts a node. Configuration validation is not firmware compilation or physical commissioning.


```sh
node --test telemetry-publisher.test.js live-telemetry-bridge.test.js
node e2e/module-sensors.browser.cjs
npm test
```

HTTP tests use an in-memory Firestore transaction double. Browser tests use
simulated subscriptions. They prove local contracts, not live IAM, Firestore
connectivity, certificate trust or physical measurements. Separate ESPHome
configuration and full firmware builds passed as recorded above.
Before claiming the connection operational, obtain human approval to run the
publisher with its service identity, validate/flash the reviewed node package,
and verify a real timestamped reading appears under the assigned module.
Observe a sensor interruption and confirm that its displayed freshness expires.
Production writes, deployment, credential provisioning and flashing remain
human-authorized commissioning actions.
