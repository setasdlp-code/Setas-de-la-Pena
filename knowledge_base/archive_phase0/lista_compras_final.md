# Lista de Compras — Setas de la Peña
**Última actualización: 19 Junio 2026**

---

## LO QUE YA TIENES (no comprar)

| Equipo | Uso |
|---|---|
| Martha Tent 65" Terra Fungus | Carpa 1 — Fase 1 |
| VIVOSUN H05 5L | Humidificador Carpa 1 — MANUAL al 100%, controlado por Pi Zero |
| Inkbird IBS-TH2 Plus ×2 | Verificación cruzada HR/T° — referencia confiable validada |
| Pi Zero 2W + relay 4ch | Control local humedad + CO₂ + temperatura Carpa 1 |
| SHT31 | Sensor T°/HR Carpa 1 — sensor de control principal |
| Noctua NF-P12 | Circulación interna suave |
| Pi 4 4GB + SanDisk Extreme 256GB | Hub HA (Fase 2+) |
| Arducam IMX477 | Time-lapse |
| MH-Z19C | CO₂ incubadora |
| QuietWarmth heat mat | Calefacción Carpa 1 vía relay Pi Zero |
| Calentador acuario hygger 50W | Incubadora baño maría |
| Caja Ultraforte 120L | Incubadora |
| Autoclave All American 44L | Esterilización bloques |
| SAB casero (caja 120L) | Inoculación aséptica |
| 50 bolsas (20 sin filtro + 30 con filtro) | Cultivo Fase 1 |
| Spawn viejo ×4 especies | Dato de degradación para simulador — no para producción |

---

## ✅ COMPRAR AHORA — FASE 1

### Amazon (~$145 USD — una sola orden, bajo umbral importación)

| Ítem | Cant. | USD | Notas |
|---|---|---|---|
| AC Infinity Cloudline H4 4" IP65 | 1 | ~$99 | FAE Carpa 1. Controlado por Pi Zero relay |
| SCD30 NDIR Sensirion | 1 | ~$29 | CO₂ Carpa 1 → I2C Pi Zero. `altitude_compensation: 2600` |
| Adafruit SHT45 breakout (#5665) | 1 | ~$18 | T°/HR Carpa 1. Montado en caja IP65, orientado hacia abajo, ≥30cm del difusor H05 |

**Total Amazon Fase 1: ~$146 USD**

### Local Colombia (~$485.000–935.000 COP)

| Ítem | Cant. | COP est. | Dónde |
|---|---|---|---|
| Ducto flexible aluminio 4" × 1m | 1 | ~$15.000 | Ferretería |
| Abrazaderas metálicas 4" | 2 | ~$5.000 | Ferretería |
| CHE cerámico 75W socket E27 | 1 | ~$25.000 | Mercado Libre / ferretería eléctrica |
| Portalámpara E27 con cable | 1 | ~$8.000 | Ferretería eléctrica |
| Caja estanca IP65 (~15×10×7cm) | 1 | ~$18.000 | Mercado Libre — para Pi Zero + relay |
| Prensaestopas PG7 o PG9 (pack ×5) | 1 | ~$8.000 | Mercado Libre / ferretería eléctrica |
| Caja estanca IP65 (~15×10×7cm) | 1 | ~$18.000 | Mercado Libre — para Pi Zero + relay |
| **Spawn fresco P. djamor** (10 bolsas) | 1 pedido | ~$450.000 | Proveedor local — pedir con 3 semanas anticipación |

> ❌ Timer mecánico eliminado — interfiere con control CO₂. Backup del fan = watchdog por software en Pi Zero.
> ❌ QuietWarmth heat mat eliminado — reemplazado por CHE cerámico.
> ✅ Toda la electrónica va en caja IP65 con prensaestopas — HR >85% destruye PCBs expuestos.

**Total local Fase 1: ~$534.000 COP**

---

## 🔜 COMPRAR EN FASE 2 — después de GO/NO-GO primer ciclo

### Humedad

| Ítem | Cant. | USD | Notas |
|---|---|---|---|
| AC Infinity CloudForge T7 15L | 2 | $169 c/u | Una por carpa. VPD autónomo offline |

### Ventilación FAE

| Ítem | Cant. | USD | Notas |
|---|---|---|---|
| AC Infinity Cloudline H4 4" IP65 | 1 | $99 | Carpa 2 (Carpa 1 usa el de Fase 1) |

### Control CO₂

| Ítem | Cant. | USD | Notas |
|---|---|---|---|
| ESP32-WROOM-32E + relay 4ch AC | 2 | $17.99 c/u | Uno por carpa, ESPHome autónomo |
| SCD30 NDIR Sensirion | 1 | $28.99 | Carpa 2 (Carpa 1 usa el de Fase 1) |
| SHT45 Sensirion | 1 | ~$12 | T°/HR Carpa 2 — comparación directa vs SHT31 Carpa 1. Mismos I2C pins, mismo driver ESPHome |

### Estructura

| Ítem | Cant. | USD | Notas |
|---|---|---|---|
| Martha Tent 65" Terra Fungus | 1 | $119.90 | Carpa 2 |

### Circulación interna

| Ítem | Cant. | USD | Notas |
|---|---|---|---|
| GDSTIME 120mm IP67 AC + speed ctrl | 2 | $29.99 c/u | Uno por carpa |

### Monitoreo y seguridad

| Ítem | Cant. | USD | Notas |
|---|---|---|---|
| TP-Link Tapo C100 | 1 | ~$25 | Ojos remotos — integración nativa HA |
| Sensor flotador nivel agua 3.3V | 2 | ~$5 c/u | Uno por T7 (un kit por módulo) |
| Sensor fuga de agua (XKC-Y26) | 2 | ~$8 c/u | Uno por carpa — detección goteo en piso |
| UPS APC BE600M1 | 1 | ~$45 | Protege Pi 4 + router |
| GFCI 20A | 1 | ~$20 | Seguridad eléctrica |
| Regleta supresor pico 6 tomas | 2 | ~$15 c/u | Una por carpa |

### Repuestos críticos (Fase 2)

| Ítem | Cant. | USD | Notas |
|---|---|---|---|
| ESP32-WROOM-32E spare | 1 | ~$8 | Falla de microcontrolador = módulo muerto sin spare |
| Relay 4ch 5V spare | 1 | ~$7 | Componente de desgaste por arco eléctrico |
| PSU 5V 3A USB-C spare | 1 | ~$8 | Alimentación Pi Zero / ESP32 — falla sin aviso |

**Total estimado Fase 2: ~$889 USD**
> Dividir en órdenes < $200 USD para evitar cargo importación Colombia (~35%)

### Agrupación sugerida Fase 2 (órdenes < $200)

| Orden | Ítems | Total |
|---|---|---|
| 1 | T7 #1 | $169.00 |
| 2 | T7 #2 | $169.00 |
| 3 | H4 #1 + GDSTIME ×2 + BN-LINK | $183.97 |
| 4 | H4 #2 + ESP32 ×2 + SCD30 | $162.97 |
| 5 | Martha Tent + Tapo + flotador + GFCI | $169.90 |

> ⚠️ T7 y H4 son AC Infinity — Amazon puede consolidar aunque sean órdenes distintas.

---

## RESUMEN FINANCIERO

| Etapa | Cuándo | Inversión |
|---|---|---|
| **Fase 1 — Amazon** | Ahora | ~$146 USD |
| **Fase 1 — Local Colombia** | Ahora | ~$534.000 COP |
| **Spawn fresco** | Ahora (pedir ya) | ~$450.000 COP |
| **Fase 1 TOTAL** | | **~$146 USD + ~$939.000 COP** |
| Fase 2 | Después de GO/NO-GO | ~$889 USD |

---

## NOTAS TÉCNICAS CLAVE

- **H05**: siempre en MANUAL. Sensor propio descartado — sesgo +30–35% confirmado (2026-06-19) con analógico + 2× Inkbird. Causa: saturación por niebla ultrasónica.
- **SHT31**: sensor de control principal para humedad y temperatura. Validado como confiable.
- **IBS-TH2 Plus ×2**: verificación cruzada permanente y alertas. Solo lectura BLE, sin relay.
- **SCD30**: requiere `altitude_compensation: 2600` en ESPHome — crítico a 2.600 msnm Tenjo.
- **Noctua**: circulación interna suave únicamente. No apto para FAE.
- **Pi Zero relay — asignación Fase 1**:
  - Relay 1 → H05 (humedad, lazo cerrado con SHT31)
  - Relay 2 → AeroZesh S4 (CO₂, lazo cerrado con SCD30)
  - Relay 3 → QuietWarmth heat mat (temperatura)
  - Relay 4 → libre
- **Spawn**: pedir con mínimo 3 semanas de anticipación al proveedor local.
