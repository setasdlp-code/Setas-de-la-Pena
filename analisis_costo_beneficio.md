# Análisis Costo-Beneficio — Optimización Presupuesto
**Setas de la Peña | Junio 2026**

---

## MATRIZ: ¿DÓNDE VALE LA PENA GASTAR? ¿DÓNDE CORTAR?

### 🟢 MANTENER SÍ O SÍ (críticos para confiabilidad)

| Equipo | Costo | Razón | Alternativa |
|---|---|---|---|
| **ESP32 + SCD30** | $93.96 | Control CO₂ autónomo local. Sin esto, VPD falla si HA cae. | Ninguna viable. No hay sensor CO₂ más barato que sea NDIR. |
| **AC Infinity H4 ×2** | $198 | IP65, durabilidad, control remoto. En ambiente saturado de humedad, un fan barato falla en meses. | VIVOSUN 4" (~$50 c/u): más barato pero menor durabilidad. **ROI negativo a 6 meses.** |
| **BN-LINK thermostat ×2** | $37.98 | Standalone, backup físico si ESP32 falla. Es tu red de seguridad. | Ninguna a este precio con misma independencia. |
| **UPS 600VA + GFCI** | ~$65 | Sin UPS, corte de 5min pierde HA, alertas, Pi 4 (riesgo de corrupción SD). GFCI es obligatorio en alta humedad. | No substituible. |

**Subtotal crítico:** $394.94 USD

---

### 🟡 REVISAR — MEJOR HERRAMIENTA PERO COSTO ALTO

#### **CloudForge T7 ×2** — $338 (2 × $169 + 2 × $55 envío)

**Qué hace:** VPD integrado, offline-capable, humedad autónoma sin HA.

**El problema:** $55 USD envío cada uno = sobrecosto.

**Alternativas evaluadas:**

| Opción | Costo | Pros | Contras |
|---|---|---|---|
| **Mantener T7 (actual)** | $338 | VPD autónomo, offline, menor riesgo operacional | Caro, envío elevado |
| **A: VIVOSUN H05 ×2 + SHT31 + ESP32** | $120 (H05) + $20 (SHT31) = $140 | Ahorras $198. Sigues con control automático vía ESP32 | Requiere calibración SHT31, control menos sofisticado que VPD real. Si ESP32 falla, cero automático. |
| **B: T7 ×1 + H05 ×1** | $169 + $55 + (ya tienes H05) = $224 | Carpa 1 con VPD autónomo, Carpa 2 con backup H05. Ahorras $114. | Desbalance entre carpas. Carpa 2 depende más de HA. |
| **C: Buscar T7 usado en Mercado Libre CO** | ~$200-250 | Ahorras $88-138 | Toma tiempo, riesgo de producto defectuoso |
| **D: Humidificador ultrasónico genérico ×2 + SHT31** | ~$60 (genéricos) + $20 (SHT31) = $80 | Ahorras $258 | Poca confiabilidad, requiere control muy fino vía HA, riesgo de fallo mecánico |

**RECOMENDACIÓN:** **Opción B** — mantén un T7 para Carpa 1 (prototipo, donde pruebas VPD). Carpa 2 usa H05 + control SHT31 vía ESP32. 
- **Ahorras:** $114 USD
- **Riesgo:** bajo (H05 como backup ya estaba en plan)
- **Ganancia operacional:** validas VPD en Carpa 1 real antes de replicar en Carpa 2

**Alternativamente:** Busca T7 usado en Mercado Libre CO mientras ordenas resto. Si lo encuentras a $200-250 c/u, ahorras.

---

### 🔵 COMPRA FUERA DE AMAZON — MERCADO LOCAL COLOMBIA

| Equipo | Amazon | Mercado Local | Ahorro |
|---|---|---|---|
| **Socket cerámico E27 + bombilla CHE 75W** | ~$15 c/u (2 conjuntos) | ~$3-5 c/u ferretería Bogotá | $20-24 |
| **Cables DUPONT macho-hembra ×40** | $5 (Amazon) | $1-2 localmente | $3 |
| **Ductos flexibles 4", abrazaderas** | $16 (Amazon) | ~$8-10 ferretería/constructor | $6-8 |
| **Relés y pequeño hardware** | varío | ferretería local | varía |

**Total potencial:** ~$30-35 USD ahorrados si compras localmente.

---

### ⏸️ POSTERGABLES (no críticos para MVP)

| Equipo | Costo | Razón postergable |
|---|---|---|
| **Cámara Tapo C100** | ~$25 | Monitoreo visual es comodidad, no crítico. Puedes ver carpas por cámara del celular inicial. Agrega después. |
| **Sensor nivel agua flotador** | ~$5 | Útil pero no imprescindible MVP. H05 es pequeño, verás cuándo está bajo. |

**Total que puedes quitar inicialmente:** ~$30 USD

---

## PRESUPUESTO OPTIMIZADO — MEJOR HERRAMIENTAS, COSTO MITIGADO

### Escenario A: "Máxima confiabilidad, presupuesto controlado"

| Rubro | Original | Optimizado | Ahorro |
|---|---|---|---|
| En carro Amazon | $835 | $722 | -$113 |
| Pendiente comprar | $171 | $106 | -$65 |
| **Subtotal** | **$1,006** | **$828** | **-$178** |
| Local Colombia (hardware) | $0 | -$30 | -$30 |
| **TOTAL OPTIMIZADO** | **$1,006** | **$798** | **-$208 USD (21% reducción)** |

**Cambios:**
- T7 ×1 (Carpa 1) en lugar de ×2
- H05 existente como primario Carpa 2 + SHT31 control
- Postergadas cámara Tapo + sensor nivel agua
- Hardware local en Colombia

**Trade-off:** Carpa 2 sin VPD autónomo, pero controlada vía HA + ESP32 + SHT31. Es más trabajo, pero funciona.

---

### Escenario B: "Balance óptimo — T7 ×1, todo lo demás best-in-class"

| Rubro | USD |
|---|---|
| Martha Tent 65" | $119.90 |
| T7 (Carpa 1 primario) | $224 ($169 + $55 envío) |
| H4 ×2 | $198 |
| BN-LINK timer ×1 pack | $24.99 |
| ESP32 ×2 + SCD30 ×2 | $93.96 |
| GDSTIME ×2 | $59.98 |
| SHT31 ×2 (HR control para Carpa 2) | ~$20 |
| **Amazon subtotal** | **$740.73** |
| --- | --- |
| TP-Link Tapo C100 | $25 |
| UPS 600VA + GFCI | ~$65 |
| Local Colombia (cerámicos, ductos, etc.) | -$30 |
| **TOTAL** | **$800.73 USD** |

**Outcome:** Mejor herramientas donde importa (H4, ESP32, T7 en Carpa 1). Carpas balanceadas. Costo contenido.

---

## PLAN DE ACCIÓN INMEDIATO

### AHORA (próximas 48h)
1. ✅ Revisar Mercado Libre CO por **T7 usado** (búsqueda "CloudForge T7") — si hay entre $200-250 c/u, compra 2
2. ✅ Buscar en ferreterías Bogotá precios de **socket E27 + bombilla CHE 75W** (confirma ~$3-5 c/u)
3. ✅ Revisar Amazon si **SHT31 está disponible** (sensor HR, necesario para Carpa 2)

### Orden Amazon — OPCIÓN B (recomendada)
Consolidar en **2 órdenes** (< $200 c/u = sin cargo importación):

**Orden 1** (~$199)
- Martha Tent 65": $119.90
- H4 #1: $99.00

**Orden 2** (~$199)
- H4 #2: $99.00
- GDSTIME ×2: $59.98
- BN-LINK timer pack: $24.99

**Orden 3** (~$150)
- ESP32 ×2: $35.98
- SCD30 ×2: $57.98
- SHT31 ×2: ~$20 (buscar en AliExpress si Amazon es más caro)
- Cables DUPONT: $5

**Orden 4** (separada — T7)
- T7 ×1: $224 (si no encuentras usado)

### Local Colombia (mientras llegan órdenes)
- Compra socket E27 + CHE ×4 en ferretería Bogotá: ~$12-20
- Ductos 4", abrazaderas: ~$8-10
- Fusibles GFCI 20A: ~$15

---

## RESUMEN FINAL

| Métrica | Escenario A | Escenario B |
|---|---|---|
| **Presupuesto total** | $798 USD | $800.73 USD |
| **T7 (VPD autónomo)** | 1 | 1 |
| **Redundancia HR** | SHT31 + ESP32 | SHT31 + ESP32 |
| **Riesgo operacional** | Bajo (Carpa 2 sin VPD) | Muy bajo (T7 en prototipo) |
| **Ahorro vs original** | 21% | 20% |

**Verdict:** Escenario B es preferible. Máxima calidad en herramientas que importan (H4, ESP32, T7), presupuesto controlado, riesgo operacional muy bajo.

---

**Próximo paso:** ¿Procedo con Escenario B y armo órdenes Amazon + búsqueda local?
