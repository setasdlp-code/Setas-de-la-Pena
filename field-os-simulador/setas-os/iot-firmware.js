(function () {
'use strict';
// Nodos IoT por defecto y generadores de firmware y payloads de prueba para el
// Hub IoT. Extraído de simulador-app.jsx sin cambios de contenido. Solo produce
// texto: no abre conexiones ni escribe en Firestore.

const DEFAULT_IOT_NODES = [
  {
    id: 'node_martha_01',
    name: 'Nodo Carpa 01 · Fructificación Orellanas',
    roomId: 'martha_01',
    mcu: 'esp32dev',
    ip: '192.168.1.101',
    mac: '24:6F:28:B4:72:01',
    rssi: -58,
    status: 'online',
    sensors: ['sht3xd', 'scd30'],
    relays: ['ch1_humidifier', 'ch2_fae'],
    lastSeen: 'hace 12s',
    metrics: { temp: 18.2, rh: 89.5, co2: 720, subTemp: 19.1 }
  },
  {
    id: 'node_martha_02',
    name: 'Nodo Carpa 02 · Fructificación Shiitake',
    roomId: 'martha_02',
    mcu: 'esp32c3',
    ip: '192.168.1.102',
    mac: '24:6F:28:C9:14:02',
    rssi: -64,
    status: 'online',
    sensors: ['sht45', 'scd30'],
    relays: ['ch1_humidifier', 'ch2_fae'],
    lastSeen: 'hace 18s',
    metrics: { temp: 17.5, rh: 85.0, co2: 840, subTemp: 18.0 }
  },
  {
    id: 'node_incubacion',
    name: 'Nodo Incubación · Sala Oscura Térmica',
    roomId: 'incubacion_01',
    mcu: 'sonoff_th16',
    ip: '192.168.1.105',
    mac: 'E8:DB:84:9A:88:05',
    rssi: -52,
    status: 'online',
    sensors: ['dht22', 'ds18b20'],
    relays: ['ch1_humidifier'],
    lastSeen: 'hace 35s',
    metrics: { temp: 23.4, rh: 72.0, co2: 2400, subTemp: 24.8 }
  }
];

const generateESPHomeYaml = ({ deviceName = 'setas-carpa-01', roomId = 'martha_01', mcu = 'esp32dev', sensors = ['sht3xd', 'scd30'], relays = ['ch1_humidifier', 'ch2_fae'], wifiSsid = 'SetasPeña_2.4G', wifiPass = '**********', serverHost = '192.168.1.100', serverPort = '8080' }) => {
  return `# ==============================================================================
# Setas de la Peña — Tenjo, Cundinamarca (2.587 msnm)
# ESPHome Telemetry & Actuation Firmware
# ==============================================================================

substitutions:
  device_name: "${deviceName}"
  room_id: "${roomId}"
  adapter_host: "${serverHost}"
  adapter_port: "${serverPort}"

esphome:
  name: \${device_name}
  friendly_name: "\${device_name} (Tenjo)"

${mcu.includes('esp8266') || mcu.includes('sonoff') ? `esp8266:
  board: ${mcu.includes('sonoff') ? 'esp01_1m' : 'd1_mini'}` : `esp32:
  board: ${mcu}
  framework:
    type: arduino`}

wifi:
  ssid: "${wifiSsid}"
  password: "${wifiPass}"
  fast_connect: true
  ap:
    ssid: "Setas-Fallback-\${device_name}"
    # Definir en secrets.yaml durante el aprovisionamiento; no incluir
    # contraseñas de recuperación en un firmware exportado.
    password: !secret fallback_password

captive_portal:
logger:
  level: INFO

ota:
  # La clave OTA es única por nodo y vive fuera del firmware versionado.
  password: !secret ota_password

i2c:
  sda: ${mcu.includes('esp8266') ? 'GPIO4' : 'GPIO21'}
  scl: ${mcu.includes('esp8266') ? 'GPIO5' : 'GPIO22'}
  scan: true
  id: bus_a

sensor:
${sensors.includes('sht3xd') ? `  - platform: sht3xd
    i2c_id: bus_a
    address: 0x44
    temperature:
      name: "Temperatura Sala"
      id: room_temp
      accuracy_decimals: 1
    humidity:
      name: "Humedad Relativa Sala"
      id: room_humidity
      accuracy_decimals: 1
    update_interval: 15s
` : ''}${sensors.includes('scd30') ? `  - platform: scd30
    i2c_id: bus_a
    address: 0x61
    altitude_compensation: 2587m # Compensación barométrica de Tenjo
    co2:
      name: "CO2 NDIR Sala"
      id: room_co2
      accuracy_decimals: 0
    update_interval: 15s
` : ''}${sensors.includes('ds18b20') ? `  - platform: dallas
    address: 0x28...
    name: "Temperatura Sonda Sustrato"
    id: sub_temp
    update_interval: 20s
` : ''}${sensors.includes('dht22') ? `  - platform: dht
    pin: GPIO14
    model: DHT22
    temperature:
      name: "Temperatura Incubación"
      id: room_temp
    humidity:
      name: "Humedad Incubación"
      id: room_humidity
    update_interval: 15s
` : ''}
switch:
${relays.includes('ch1_humidifier') ? `  - platform: gpio
    pin: ${mcu.includes('esp8266') ? 'GPIO12' : 'GPIO25'}
    id: relay_humidifier
    name: "Relé Humidificador T7 (Ch1)"
    inverted: false
` : ''}${relays.includes('ch2_fae') ? `  - platform: gpio
    pin: ${mcu.includes('esp8266') ? 'GPIO13' : 'GPIO26'}
    id: relay_fae
    name: "Relé Extractor FAE (Ch2)"
    inverted: false
` : ''}
http_request:
  verify_ssl: false

interval:
  - interval: 15s
    then:
      - http_request.post:
          url: !lambda |-
            return "http://" + id(adapter_host) + ":" + id(adapter_port) + "/api/telemetry";
          headers:
            Content-Type: application/json
          json: |-
            root["room_id"] = "${roomId}";
            root["observed_at"] = "";
            root["temperature_c"] = id(room_temp).state;
            root["rh_pct"] = id(room_humidity).state;
            ${sensors.includes('scd30') ? 'root["co2_ppm"] = id(room_co2).state;' : ''}
            ${sensors.includes('ds18b20') ? 'root["substrate_temperature_c"] = id(sub_temp).state;' : ''}
`;
};

const generateArduinoIno = ({ deviceName = 'setas-carpa-01', roomId = 'martha_01', wifiSsid = 'SetasPeña_2.4G', wifiPass = '**********', serverHost = '192.168.1.100', serverPort = '8080' }) => {
  return `/* ==============================================================================
 * Setas de la Peña — Tenjo, Cundinamarca (2.587 msnm)
 * Sketch Nativo Arduino C++ para Telemetría ESP32 / Setas OS
 * ============================================================================== */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_SHT31.h>

const char* ssid = "${wifiSsid}";
const char* password = "${wifiPass}";
const char* serverUrl = "http://${serverHost}:${serverPort}/api/telemetry";
const char* roomId = "${roomId}";

Adafruit_SHT31 sht31 = Adafruit_SHT31();

unsigned long lastSend = 0;
const unsigned long sendInterval = 15000; // Cada 15s

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // I2C SDA=21, SCL=22
  
  if (!sht31.begin(0x44)) {
    Serial.println("Error: Sensor SHT31 no encontrado en 0x44");
  }

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi en Tenjo...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi conectado. IP: " + WiFi.localIP().toString());
}

void loop() {
  if (millis() - lastSend >= sendInterval) {
    lastSend = millis();
    
    if (WiFi.status() == WL_CONNECTED) {
      float t = sht31.readTemperature();
      float h = sht31.readHumidity();
      
      if (!isnan(t) && !isnan(h)) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        
        String jsonPayload = String("{\\"room_id\\":\\"") + roomId + 
                             "\\",\\"temperature_c\\":" + String(t, 2) + 
                             ",\\"rh_pct\\":" + String(h, 2) + "}";
        
        int httpCode = http.POST(jsonPayload);
        Serial.println("POST a Setas OS [" + String(httpCode) + "]: " + jsonPayload);
        http.end();
      }
    }
  }
}
`;
};

const generateCurlPayload = ({ roomId = 'martha_01', temp = 18.2, rh = 89.5, co2 = 720, subTemp = 19.0, serverHost = '192.168.1.100', serverPort = '8080' }) => {
  return `curl -X POST "http://${serverHost}:${serverPort}/api/telemetry" \\
  -H "Content-Type: application/json" \\
  -d '{
    "room_id": "${roomId}",
    "observed_at": "${new Date().toISOString()}",
    "temperature_c": ${temp},
    "rh_pct": ${rh},
    "co2_ppm": ${co2},
    "substrate_temperature_c": ${subTemp}
  }'`;
};

const api = { DEFAULT_IOT_NODES, generateESPHomeYaml, generateArduinoIno, generateCurlPayload };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof globalThis !== 'undefined') globalThis.SetasIotFirmware = api;

})();
