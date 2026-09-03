---
title: "Deep Research Bloque 1: Climatización Andina, FAE Entálpico y Visión Artificial Edge AI"
category: research
load_priority: normal
last_reviewed: 2026-08-25
confidence: very_high
primary_sources:
  - literature_database.md
  - ASHRAE / IEEE / MDPI Smart Agricultural Technology
related_documents:
  - deep_research_synthesis_2026.md
  - literature_database.md
  - ../04_facility/fruiting.md
  - ../04_facility/ventilation.md
  - ../05_equipment/esp32_firmware.md
---

# Deep Research Bloque 1: Climatización Andina, FAE Entálpico y Edge AI
**Centro de Cultivo e Innovación Setas de la Peña — Tenjo, Cundinamarca (2.600 msnm)**

---

## 1. Climatización Pasiva y Recuperación Entálpica en Clima Frío Andino

### 1.1 El Desafío Termodinámico de Tenjo
En la Sabana de Bogotá (2.600 msnm), el diferencial térmico día/noche es extremo:
* **Día:** $18\text{–}21\text{ °C}$, $\text{HR } 50\text{–}65\%$.
* **Noche:** $4\text{–}9\text{ °C}$ (con heladas esporádicas a $<2\text{ °C}$), $\text{HR } 85\text{–}95\%$.
* **Cámara de fructificación (*P. djamor*):** Requiere $22\text{–}25\text{ °C}$ continuos y $CO_2 < 900\text{ ppm}$.

Para mantener el nivel de $CO_2$ por debajo de $900\text{ ppm}$ en una cámara con 100 kg de sustrato activo, se requiere un caudal de aire exterior (FAE) de **$45\text{ a }60\text{ m}^3\text{/h}$**. 
Inyectar $50\text{ m}^3\text{/h}$ de aire a $6\text{ °C}$ directamente a una sala a $24\text{ °C}$ genera una pérdida térmica sensible continua:

$$q_{sens} = \dot{m} \cdot C_p \cdot \Delta T = \left(50\frac{\text{m}^3}{\text{h}} \cdot 0.95\frac{\text{kg}}{\text{m}^3} \cdot \frac{1\text{ h}}{3600\text{ s}}\right) \cdot 1005\frac{\text{J}}{\text{kg}\cdot\text{K}} \cdot (24 - 6)\text{ K} \approx \mathbf{239\text{ W}}$$

Sumado a las pérdidas por transmisión en paredes PIR ($\approx 65\text{ W}$), la demanda de calefacción nocturna asciende a **$>300\text{ W}$ continuos**, disparando el consumo eléctrico si se utilizan resistencias resistivas directas.

```
                   ARQUITECTURA DE VENTILACIÓN ENTÁLPICA CON PRE-FILTRADO

                                            AIRE DE EXTRACCIÓN (Viciado, CO2 Alto, 24°C, 88% HR)
                                                               │
                                                               ▼
                                                  ┌─────────────────────────┐
                                                  │ Pre-filtro G4 + F7      │ (Retención >99% esporas)
                                                  └────────────┬────────────┘
                                                               │
                                                               ▼
  AIRE EXTERIOR FRÍO ────────► ┌───────────────────────────────────────────────┐ ─────► AIRE EXPULSADO AL EXTERIOR
  (6°C, Tenjo Noche)           │   INTERCAMBIADOR DE CALOR DE FLUJO CRUZADO    │        (11°C, Frío, Saturado)
                               │        (HRV / Heat Recovery Core)             │
                               └───────────────────────┬───────────────────────┘
                                                       │
                                                       ▼
                                            AIRE PRE-CALENTADO A ~19.5°C
                                                       │
                                                       ▼
                                          ┌─────────────────────────┐
                                          │ Cámara Preacondicionado │ (Post-calefactor PTC + Nebulizador)
                                          └────────────┬────────────┘
                                                       │
                                                       ▼
                                           INYECCIÓN A SALA DE CULTIVO
                                             (24°C, 88% HR, CO2 < 800 ppm)
```

### 1.2 Solución: Recuperación de Calor (HRV) Resistente a Humedad y Esporas
1. **Intercambiador de Placas de Polipropileno / Aluminio Marino:**
   * Eficiencia térmica sensible ($\varepsilon$): $75\%\text{ a }82\%$.
   * El aire exterior a $6\text{ °C}$ se precalienta pasivamente hasta **$19.5\text{–}20.5\text{ °C}$** absorbiendo la energía del aire viciado de salida a $24\text{ °C}$.
   * **Ahorro energético en calefacción:** Reduce la potencia requerida de $239\text{ W}$ a solo **$\approx 48\text{ W}$** (ahorro del **$80\%$**).
2. **Protocolo de Protección contra Esporas:**
   * La corriente de extracción debe atravesar obligatoriamente una etapa de prefiltro lavable **G4 (malla metálica)** seguida de un filtro de pliegues **F7/MERV 13** antes del núcleo del intercambiador para evitar que las esporas de *Pleurotus* colmaten las placas.
3. **Cámara de Preacondicionamiento en el Field OS:**
   * El aire precalentado ($20\text{ °C}$) pasa por un pequeño ducto de mezcla donde un sensor SHT45 y un calefactor cerámico PTC modulado por PWM (ESP32) ajustan los últimos $3\text{–}4\text{ °C}$ y el transductor ultrasónico inyecta la micro-niebla antes de ingresar a las bolsas de fructificación.

---

## 2. Visión Artificial en el Edge y Diagnóstico Temprano (Field OS)

### 2.1 Topología de Hardware y Modelos Ligeros
Para evitar dependencias de la nube y mantener el monitoreo en tiempo real con latencias $<500\text{ ms}$:

```
  ┌─────────────────────────────────┐           ┌─────────────────────────────────────────┐
  │         ESP32-CAM / S3          │  RTSP /   │        Raspberry Pi 4B / 5 (Local)      │
  │ • Sensor OV2640 (2 MP)          │  HTTP     │ • Docker container Field-OS Engine      │
  │ • Iluminación LED CRI >95 4000K ├──────────►│ • ONNX Runtime / NCNN / TFLite          │
  │ • Captura periódica (cada 15m)  │           │ • Inferencia YOLOv8-nano (Int8 quant)   │
  └─────────────────────────────────┘           └────────────────────┬────────────────────┘
                                                                     │
                                                                     ▼
                                                ┌─────────────────────────────────────────┐
                                                │      Home Assistant / Field OS MQTT     │
                                                │ • Alerta temprana Trichoderma           │
                                                │ • Conteo de primordios (Pinheads)       │
                                                │ • % Madurez de cosecha                  │
                                                └─────────────────────────────────────────┘
```

### 2.2 Tareas de Inferencia y Métricas de Rendimiento

#### A. Diagnóstico Temprano de *Trichoderma spp.* (Moho Verde)
* **Fase Crítica:** En las primeras 48–72 h de infección, *Trichoderma* se manifiesta como un micelio blanco algodonoso y denso (*cottony patch*), indistinguible al ojo humano del micelio de *Pleurotus*. A las 96 h ocurre la esporulación verde masiva.
* **Modelo:** Clasificador convolucional basado en **MobileNetV3-Small / SqueezeNet** con cuantización Int8 ($<4\text{ MB}$ de peso).
* **Entrada:** Recorte de parches de sustrato ($224\times 224\text{ px}$) analizados por gradiente de textura y desviación espectral en canal verde-amarillo ($a^*, b^*$ en espacio CIELAB).
* **Precisión:** F1-score $>0.92$ en detección de textura antes del viraje a verde, permitiendo aislar la bolsa antes de la liberación de bioaerosoles.

#### B. Detección de Primordios y Conteo de Cabezas (Pinhead Count)
* **Modelo:** **YOLOv8n (Nano)** entrenado con el dataset fúngico (*Data in Brief 2024* / *paper_014*).
* **Salida:** Bounding boxes con clasificación de clases:
  1. `pinhead` (diámetro $<10\text{ mm}$)
  2. `juvenile` ($10\text{–}30\text{ mm}$)
  3. `mature_ready` (sombrero horizontal, margen aplanado)
  4. `overmature_sporing` (margen ondulado/levantado, inicio de esporulación)
* **Métrica:** mAP@50 $\ge 0.89$, tiempo de inferencia $\approx 110\text{ ms}$ en CPU de Raspberry Pi 4.

#### C. Disparo Automático de Cosecha en Bitácora
Cuando el ratio de detección:
$$\text{Harvest Index} = \frac{N(\text{mature\_ready})}{N(\text{juvenile}) + N(\text{mature\_ready})} \ge 0.70$$
El Field OS genera una notificación prioritaria al operador: *"Lote #X listo para cosecha — Cosechar en las próximas 4 horas para evitar esporulación en cámara"*.

---

## 3. Integración en el Field OS y Arquitectura ESP32

```yaml
# Configuración ESPHome para Inferencia de Cámara y Control Entálpico
esp32:
  board: esp32cam
  framework:
    type: esp-idf

esp32_camera:
  name: "Camara Fructificacion 01"
  external_clock:
    pin: GPIO0
    frequency: 20MHz
  i2c_pins:
    sda: GPIO26
    scl: GPIO27
  data_pins: [GPIO5, GPIO18, GPIO19, GPIO21, GPIO36, GPIO39, GPIO34, GPIO35]
  vsync_pin: GPIO25
  href_pin: GPIO23
  pixel_clock_pin: GPIO22
  resolution: 800x600
  jpeg_quality: 10
  vertical_flip: false

# Sensor de Temperatura y Presión para Compensación Entálpica
sensor:
  - platform: bme280_i2c
    temperature:
      name: "Temp Entrada FAE"
      id: fae_in_temp
    humidity:
      name: "HR Entrada FAE"
      id: fae_in_rh
    pressure:
      name: "Presion Barometrica Tenjo"
      id: baro_tenjo
    address: 0x76
    update_interval: 15s

# Control PWM de Precalentador PTC de Entrada
output:
  - platform: ledc
    pin: GPIO14
    id: ptc_heater_pwm
    frequency: 1000Hz

climate:
  - platform: pid
    name: "Precalentador FAE PID"
    sensor: fae_in_temp
    default_target_temperature: 20.0
    cool_output: ptc_heater_pwm
    kp: 0.45
    ki: 0.02
    kd: 0.10
```
