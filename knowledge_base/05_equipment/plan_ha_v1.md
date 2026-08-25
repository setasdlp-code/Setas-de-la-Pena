# Plan de Automatización — Home Assistant

**Estado:** diseño validado con inventario físico (Agosto 2026), pendiente comisionamiento en banco  
**Última revisión:** 2026-08-25  
**Fuente de estado:** `knowledge_base/CURRENT_OPERATIONS.md`  
**Fuente de parámetros:** `knowledge_base/05_equipment/environmental_control.md`

Este documento define la arquitectura de supervisión y el protocolo de commissioning para los nodos ESP32/ESPHome integrados con Home Assistant en Setas de la Peña (Tenjo, Cundinamarca).

## Arquitectura Objetivo

```text
SHT45 (I²C) + MH-Z19C (UART) ──> ESP32/ESPHome ──> control local seguro en lazo cerrado
                                        │
                                        └──> Home Assistant: historial, alarmas y supervisión

Inkbird IBS-TH2 Plus ──────────> verificación cruzada independiente (BLE)
Operador ──────────────────────> paro manual y control disponible en todo momento
```

- Cada ambiente usa `ENV-XXXX`; equipos y sensores usan `EQ-XXXX` y `SNS-XXXX`.
- El ESP32 conserva la lógica crítica local con `restore_mode: ALWAYS_OFF` y `min_idle_time: 120s` ante caída de red.
- Home Assistant no sustituye límites físicos, fusibles bimetálicos ni inspección humana.
- El sensor HR integrado del VIVOSUN H05 permanece invalidado.

## Parámetros Operacionales de Control por Especie

| Variable | P. ostreatus (Lote 01) | H. erinaceus | P. djamor (Tropical) | Alarma / Condición Crítica |
|---|:---:|:---:|:---:|:---:|
| **Temperatura** | 14–20 °C | 15–20 °C | 20–28 °C | < 12 °C o > 30 °C |
| **Humedad Relativa (HR)** | 85–90% | 85–92% | 85–90% | < 80% o > 95% |
| **CO₂ Máximo** | ≤ 1.000 ppm | ≤ 900 ppm | ≤ 1.200 ppm | > 1.500 ppm |
| **Ventilación (FAE)** | Pulsos 30–45s | Pulsos 30–45s | Pulsos 30–45s | Extractor H4 en Velocidad 1–2 |

## Commissioning Obligatorio

1. **Alimentación y Seguridad Eléctrica:** Verificar tierra, prensaestopas en caja TICONN IP67, conectores WAGO 221 y estado seguro al reiniciar (`ALWAYS_OFF`).
2. **Protocolos de Comunicación:**
   - Confirmar I²C `0x44` para sonda Klanata SHT45.
   - Confirmar UART a 9600 baud para sensor MH-Z19C.
3. **Calibración Barométrica Tenjo (2.600 m s.n.m.):**
   - Configurar en ESPHome `filters: - multiply: 1.369` en el sensor `mhz19`.
   - **Desactivar obligatoriamente el autocalibrado:** `automatic_baseline_calibration: false`.
4. **Commissioning de Ventilación (Cloudline H4):**
   - Ajustar perilla de velocidad del extractor a Nivel 1 o 2.
   - Configurar alivio de CO₂ en pulsos cortos de 30–45s para no desplomar la humedad del CloudForge T7.
5. **Pruebas de Fallo en Banco (48–72h):**
   - Simular pérdida de Wi-Fi y verificar continuidad del lazo local del ESP32.
   - Simular desconexión de sonda SHT45 y verificar apagado inmediato del humidificador.
   - Contrastar lecturas SHT45 vs. Inkbird IBS-TH2 Plus (delta ≤ 3% RH).
6. **Aprobación de Arranque:** Registrar firma de prueba antes de introducir sustrato colonizado a la carpa CLOUDLAB 844.

## Entidades Mínimas en Home Assistant

- `sensor.cloudlab01_temperatura` (SHT45, °C)
- `sensor.cloudlab01_humedad` (SHT45, % RH)
- `sensor.cloudlab01_co2` (MH-Z19C compensado, ppm)
- `sensor.cloudlab01_delta_humedad_inkbird` (Auditoría cruzada, %)
- `switch.cloudlab01_humidificador` (Relé CloudForge T7)
- `switch.cloudlab01_extractor_fae` (Relé Cloudline H4)

## Condiciones para Habilitar Automatización en Producción

```text
[ ] inventory_verified (Confirmado Agosto 2026)
[ ] electrical_safety_verified (TICONN IP67 + WAGO 221)
[ ] sensors_cross_checked (SHT45 vs. Inkbird BLE)
[ ] barometric_compensation_applied (MH-Z19C x1.369 / ABC=OFF)
[ ] ventilation_pulsed_commissioned (Cloudline H4 Vel 1-2)
[ ] manual_override_tested
[ ] failure_modes_tested (48h en banco de pruebas)
[ ] CURRENT_OPERATIONS updated with dated evidence
```

