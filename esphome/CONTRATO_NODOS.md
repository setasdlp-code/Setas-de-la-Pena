# Contrato de nodos de control por sala

Opción A (DEC-001): el control vive en el ESP32; Setas OS solo lee. No existe
ruta de red que escriba en un relé.

## Piezas

| Pieza | Archivo | Qué es |
|---|---|---|
| Paquete de control | `esphome/modulo-fructificacion.package.yaml` | Lógica común: relé de 4 canales, calefacción con histéresis y tiempos mínimos, alarmas, reanudación, estado del nodo |
| Paquete de publicación | `field-os-simulador/setas-os/telemetry-publisher/esphome-publish.package.yaml` | Envío HTTPS al publicador; adjunta `node_status` si un paquete de control llena `setas_node_status` |
| Archivo de nodo | p. ej. `cloudlab_esp32.yaml` | Identidad, pines, sensores (`room_temp` con `timeout`, `room_humidity`) e inclusión de los dos paquetes |
| Perfil de sala | `field-os-simulador/setas-os/node-control-profiles.json` | Sala permitida, relés y alarmas que el nodo puede reportar, parámetros del operario, bloqueos |
| Asignación privada | archivo del publicador (fuera del repo) | `deviceId → { roomId, token, position }` |
| Generador de consignas | `field-os-simulador/setas-os/room-node-setpoints.js` | Ciclo de sala activo + perfil + parámetros del operario → `-s clave valor` |

## Estado del nodo — `setas.node-status.v1`

```json
{
  "schema": "setas.node-status.v1",
  "observed_at": "2026-11-14T15:00:00Z",
  "commissioned": false,
  "control_state": "starting | auto | disabled | locked | alarm",
  "heating_enabled": true,
  "uptime_s": 600,
  "relays": { "light": false, "circulation": true, "heat": true, "spare": false },
  "relay_on_s": { "light": 0, "circulation": 300, "heat": 200 },
  "alarms": ["sensor_invalid", "over_temperature", "heating_locked"],
  "setpoints": { "consigna_id": "rc-1@20261114T150000Z", "heat_setpoint_c": 13.5, "hysteresis_c": 0.5, "temp_max_c": 24 }
}
```

- `relays` es el estado **comandado** por el firmware, no medición del contacto.
  Procedencia en Setas OS: `reported`.
- Se valida con `validateNodeStatus(status, perfil)` (`telemetry-contract.js`):
  los relés y alarmas deben ser los del perfil.
- Viaja en el mismo POST que las lecturas. Un paquete solo con estado es válido
  (sensor inválido = sin lecturas, pero la alarma debe llegar).
- Persistencia (sin colecciones nuevas): último estado en
  `telemetria_salas/{roomId}.device_readings.{deviceId}.node_status` (un estado
  atrasado no reemplaza a uno más nuevo); historia en `telemetria_lecturas` con
  `record_type: "node_status"`, id = SHA-256 de sala/dispositivo/hora:
  reintento idéntico = sin cambios; contenido distinto = HTTP 409.
- `summarizeNodeStatus(historia, ciclo)` resume por ciclo (fracción del tiempo con
  calefacción comandada, alarmas, consignas) para cruzarlo con la cosecha.

## Añadir una sala (p. ej. Martha) sin tocar código

1. `node-control-profiles.json`: confirmar el `roomId` en `rooms` (Martha,
   `martha_01`, ya está) y añadir `profiles.martha_01` con `relays`, `alarms`,
   `heating`, `operatorParams`, `blocked`, `deviceId`, `firmware`.
2. Crear `esphome/martha.yaml` copiando la estructura de `cloudlab_esp32.yaml`:
   sus pines, sus sensores (mismos ids `room_temp`/`room_humidity`), su
   `sensor_device_id`, y los dos `packages`. No se edita el paquete común.
3. Añadir la asignación privada del dispositivo en el publicador.
4. Crear el ciclo de sala en Setas OS y generar las sustituciones con
   `buildNodeSubstitutions({ profile, cycles, operator, now })`.
5. Ejecutar el protocolo de banco equivalente (`PROTOCOLO_BANCO_CLOUDLAB.md`).

Límite: si la sala necesita otros actuadores (humidificador, extractor) o un
relé con otro papel, eso es un paquete nuevo y un cambio de perfil revisado,
no solo configuración.

## Componer con la incubadora sin editar `esphome/incubadora_piloto.yaml`

La incubadora y el perfil solo-telemetría `esphome-incubacion.yaml` comparten
identidad (`setas-incubacion-01`): un ESP32 graba un solo firmware. Para
publicar desde el firmware de control, un archivo envoltorio (no creado aquí):

```yaml
# esphome/incubadora_publicacion.yaml (propuesta, no validada)
substitutions:
  sensor_device_id: setas-incubacion-01
packages:
  control: !include incubadora_piloto.yaml
  publicacion: !include ../field-os-simulador/setas-os/telemetry-publisher/esphome-publish.package.yaml
sensor:
  # Espejos con los ids que exige el paquete de publicación.
  - platform: copy
    source_id: t_aire
    id: room_temp
    on_value: !include ../field-os-simulador/setas-os/telemetry-publisher/esphome-capture-temp.yaml
  - platform: copy
    source_id: hr_aire
    id: room_humidity
    on_value: !include ../field-os-simulador/setas-os/telemetry-publisher/esphome-capture-rh.yaml
```

Para que publique también su estado haría falta un paquete propio de estado de
la incubadora (que lea `rele_calefactor` y sus alarmas y llene
`setas_node_status`) y un perfil `incubacion_01` en `node-control-profiles.json`.
Hasta entonces el publicador rechaza `node_status` de esa sala (422).
