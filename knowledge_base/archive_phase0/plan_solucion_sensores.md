# Plan Solución Sensores — Medida Confiable
**Setas de la Peña | Junio 2026**

---

## DIAGNÓSTICO

| Sensor | Problema | Impacto |
|---|---|---|
| **VIVOSUN H05** | Sensor HR saturado (lee 99-100% real ~65%) | Control automático cyclea mal, inestable |
| **Inkbird IBS-TH2 Plus ×2** | Desviados 10°C entre sí; desviado vs referencia | Medida no confiable, no apto para control |
| **Analógico resorte** | ±2-3°C tolerancia de fábrica | Solo referencia relativa |
| **SHT31** (en plan para Carpa 2) | Probablemente igual sesgo que otros HR baratos | Control Carpa 2 sería problemático |

**Raíz:** sensores baratos (<$10) en HR/T° no tienen precisión manufacturera garantizada.

---

## SOLUCIÓN: SENSORES CONFIABLES

### Opción 1: Sensirion SHT45 (RECOMENDADO)
- **Precisión:** ±1.5% RH, ±0.2°C T° (certificado)
- **Precio:** ~$15 USD
- **Interfaz:** I2C (compatible ESP32)
- **Durabilidad:** industrial, bajo drift temporal
- **Calibración:** mínima (viene calibrada de fábrica), solo validar
- **Disponibilidad:** Digi-Key, Mouser, Amazon (buscar en AliExpress si Amazon no tiene)

**vs SHT31:**
- SHT45 es generación nueva, mejor calibración
- SHT31 tiene ±3-4% RH típico (mucha deriva)

### Opción 2: DHT22 / AM2302
- **Precisión:** ±2% RH, ±0.5°C (comercial, no industrial)
- **Precio:** ~$5-8 USD
- **Interfaz:** 1-wire (requiere librería especializada, más frágil)
- **Problema:** sensibilidad a EMI, calibración puede derivar con humedad extrema
- **Verdict:** menos confiable que SHT45 para ambiente saturado

### Opción 3: Mantener Inkbirds + Calibración + Validación
- **Calibrar offset** vía app Bluetooth cada Inkbird
- **Validar contra punto conocido** (agua destilada 25°C = humedad saturada ~100%)
- **Riesgo:** si Inkbirds tienen hardware defectuoso, offset no lo arregla
- **Costo:** $0, pero riesgo alto

---

## RECOMENDACIÓN: Sensirion SHT45 ×2 + Validación

**Dónde usarlos:**
- **SHT45 #1:** Carpa 1 (reemplaza Inkbird como sensor de referencia)
- **SHT45 #2:** Carpa 2 (control automático via ESP32 + relay)
- **Inkbirds:** mantén como backup visual (alertas HA solo), sin confiar en números

---

## PLAN DE CALIBRACIÓN

### Paso 1: Validación en Punto Conocido (24h antes de uso)

**Setup:**
1. Toma vaso con agua destilada 500ml
2. Introduce termómetro de referencia (analógico) + SHT45
3. Cubre con plástico para atmosfera saturada = 100% RH
4. Espera 2h en habitación a ~22°C

**Expected:**
- Analógico: ~22°C ±1°C
- SHT45: ~22°C ±0.2°C, ~98-100% RH

**Si SHT45 lee diferente > ±1°C o >5% RH:** unidad defectuosa, reemplaza

### Paso 2: Validación en Punto Seco (antes de desplegar)

**Setup:**
1. Introduce SHT45 + analógico en frasco con sílica gel (secador)
2. Espera 1h

**Expected:**
- RH: ~20-30%
- T°: ambiente (~22°C)

**Si SHT45 lee RH > 50% en frasco de sílica:** sensor atrapó humedad, deseca 2h en 50°C (horno suave)

### Paso 3: Log de línea base
Anota:
- Temperatura ambiente actual
- RH en sala (si tienes humidímetro digital confiable)
- SHT45 #1 y #2 lecturas

Esto es tu "ground truth" para futura comparación.

---

## INTEGRACIÓN ESPHOME

### Carpa 1: SHT45 solo (lectura, sin control)
```yaml
i2c:
  sda: GPIO21
  scl: GPIO22

sensor:
  - platform: sht4x
    temperature:
      name: "Carpa 1 Temperatura"
      accuracy_decimals: 1
    humidity:
      name: "Carpa 1 RH%"
      accuracy_decimals: 1
    update_interval: 30s
```

**Rol:** lectura confiable, HA reporta a operador

---

### Carpa 2: SHT45 + Relay (control automático)
```yaml
i2c:
  sda: GPIO21
  scl: GPIO22

sensor:
  - platform: sht4x
    humidity:
      name: "Carpa 2 RH%"
      id: carpa2_rh
      accuracy_decimals: 1
    update_interval: 30s

output:
  - platform: gpio
    pin: GPIO12  # Relay 3 del ESP32
    id: humidifier_relay

switch:
  - platform: template
    name: "Carpa 2 Humidificador"
    turn_on_action:
      - output.turn_on: humidifier_relay
    turn_off_action:
      - output.turn_off: humidifier_relay

automation:
  - alias: "Carpa 2 RH Control - Histeresis"
    trigger:
      - platform: numeric_state
        entity_id: sensor.carpa2_rh
        above: 93
    action:
      - switch.turn_off: switch.carpa2_humidificador

  - alias: "Carpa 2 RH Control - On"
    trigger:
      - platform: numeric_state
        entity_id: sensor.carpa2_rh
        below: 89
    action:
      - switch.turn_on: switch.carpa2_humidificador
```

**Comportamiento:** 
- RH < 89% → VIVOSUN ON
- RH > 93% → VIVOSUN OFF
- Banda muerta 4% evita cycling

---

## HARDWARE: RELAY PARA VIVOSUN

VIVOSUN H05 es 110V AC. Necesitas **relay de potencia** (no relay lógico barato):

| Opción | Costo | Pros | Contras |
|---|---|---|---|
| **Relay 4-20A 110V AC (genérico)** | ~$8-12 | Robusto, aislamiento galvánico | Wiring más cuidadoso |
| **Solid-State Relay (SSR) AC** | ~$15-20 | Cero chispa, ciclo vida infinito | Requiere disipador térmico |
| **Smart Plug relay 110V** | ~$25-40 | Fácil instalación, enchufable | Menos confiable en mojado |

**Recomendación:** SSR 25A 110V AC (~$18) + aislamiento GPIO ESP32 vía optoacoplador.

---

## TIMELINE DE IMPLEMENTACIÓN

| Acción | Tiempo | Bloqueante |
|---|---|---|
| Ordena SHT45 ×2 (Aliexpress o Digi-Key) | 0h | No, paralelo con resto |
| Calibración + validación SHT45 | 3-4h | Sí, antes de desplegar |
| Ordena SSR + montaje | 1-2 semanas | No, paralelo |
| Actualizas código ESPHome | 2-3h | No, puedes hacerlo localmente |
| Deploy en carpas | 1h | Después calibración |

**Timeline total:** 2-3 semanas si todo es paralelo

---

## DATOS PARA COMPRA

### Amazon / Aliexpress
- **Sensirion SHT45-AD1B-R2** (versión comercial recomendada) ×2: ~$15 c/u
  - Buscar: "Sensirion SHT45" o "SHT45 I2C"
  - Verificar que diga "Sensirion" (no clones)
  
- **SSR AC 25A 110V** (Fotek, Crydom): ~$15-20
  - Buscar: "25A AC SSR" o "Solid State Relay AC"
  
- **Optoacoplador 4N35 o PC817** (aislamiento GPIO): ~$0.5 c/u (pack de 10)

### Local Colombia
- Termómetro digital calibrado (±0.5°C) si quieres validación con mejor referencia: ~$20-30 (buscar en ferretería electrónica)

---

## CHECKLIST PRE-OPERACIONAL

- ✅ SHT45 ×2 llegan
- ✅ Calibración punto húmedo (agua destilada, 2h)
- ✅ Calibración punto seco (sílica gel, 1h)
- ✅ Log de línea base (T° ambiente, RH ambiente)
- ✅ SSR + wiring 110V → VIVOSUN (seguro)
- ✅ ESPHome config + upload a ESP32 Carpa 2
- ✅ Prueba en vacío: RH > 93% → relay OFF, RH < 89% → relay ON
- ✅ 24h observación en carpa sin bolsas (estabilidad)
- ✅ Documentar curva de RH en tiempo (gráfico) antes de inocular

---

## RIESGO RESIDUAL

Si SHT45 viene defectuoso desde fábrica (raro <1% tasa):
- **Backup:** Inkbirds siguen como alerta visual (no confíes en número)
- **Fallback:** control manual hasta que llegue reemplazo

**Mitigation:** valida ambas unidades en punto húmedo inmediatamente al llegar.

