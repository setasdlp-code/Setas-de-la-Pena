# Decisiones Clave — Setas de la Peña
**Última actualización: 19 Junio 2026 — post validación sensores**

> **Documento histórico, supersedido.** Conserva decisiones consideradas en junio, pero no es fuente operacional vigente. Consultar `knowledge_base/DECISIONS.md`, `knowledge_base/FARM_BRAIN.md` y `knowledge_base/CURRENT_OPERATIONS.md`.

---

## ARQUITECTURA GENERAL

- **1 carpa de fructificación** (Martha Tent 65") como Fase 1 — piloto
- **Operación remota**: Sebastián no vive en Tenjo — cuidador visita 1 vez al día
- **Filosofía de control**: cada función crítica tiene control local autónomo, independiente de nube
- **Principio**: validar Fase 1 con un ciclo completo antes de comprar Fase 2

---

## ESTÁNDARES DE INSTALACIÓN — OBLIGATORIOS

### Sensores — Arquitectura definitiva

- **Sensor de control**: Adafruit SHT45 (#5665)
  - Ubicación: 30–40 cm del difusor H05, a la altura de los cuerpos fructíferos
  - Cable: JST/Qwiic 30–50 cm pasado por prensaestopa IP67 desde la caja externa
  - Electrónica (Pi Zero / ESP32 + relay) en caja IP65 *fuera* de la carpa
  - Razón: I2C estable a esa longitud, chip Sensirion verificado, $18 vs $41 de módulos OEM genéricos
- **Sensor de auditoría**: Inkbird IBS-TH2 Plus ×2 — referencia cruzada permanente. Genera alerta si diverge del SHT45 de forma sostenida. **Nunca controla actuadores.**
- **Descartados**:
  - Módulos OEM genéricos con cable largo (SHT40 2M) — chip no verificable, I2C inestable a >1M
  - Vaisala / Rotronic — fuera de presupuesto y escala innecesaria

### Electrónica

- **Toda la electrónica** (Pi Zero, relés, bornes, conexiones) montada en **caja IP65 fuera de la carpa**
- **Dentro de la carpa**: solo sensores — SHT45, SCD30, IBS-TH2 Plus ×2
- **SCD30 dentro**: CO₂ se estratifica — leerlo cerca de los cuerpos fructíferos da datos reales
- **Cables de entrada**: prensaestopas IP67 en cada punto de entrada a la caja
- **Conectores**: apropiados para ambientes húmedos — no dupont volantes, no cinta como sellado
- **Razón**: HR >85% sostenida destruye PCBs y relés expuestos en semanas

---

## FASE 1 — PILOTO (lo que aplica ahora)

### Humedad — DECISIÓN ACTUALIZADA 2026-06-19

- **Control primario**: Pi Zero 2W + SHT45 → relay 4ch → VIVOSUN H05 en manual al 100%
- **Sensor de control**: Adafruit SHT45 (#5665) — montado en caja IP65, orientado hacia abajo, ≥30cm del difusor H05
- **Sensor de verificación**: Inkbird IBS-TH2 Plus ×2 → monitoreo BLE
- **H05 en modo**: MANUAL al 100% — actúa solo como actuador, NO controla con su propio sensor
- **⚠️ DESCARTADO**: H05 en modo auto — sensor propio lee 30-35% más alto que la realidad (confirmado 2026-06-19 con medidor analógico + 2x Inkbird). Saturación por proximidad a niebla ultrasónica, fenómeno físico documentado. No hay falla específica del H05, pero su sensor es inútil para control.
- **Objetivo HR**: 91% (fructificación P. djamor)

### Ventilación FAE / CO₂

- **Fan**: AC Infinity Cloudline H4 4" IP65 (~$99) — compra Fase 1. Mismo modelo que Fase 2 → arquitectura estandarizada
- **Sensor CO₂**: SCD30 NDIR (~$29) — I2C corto al Pi Zero
- **Control**: Pi Zero lee SCD30 → activa/apaga fan vía relay
- **Lógica**: CO₂ > 900ppm → fan ON / CO₂ < 700ppm → fan OFF
- **Backup FAE**: watchdog por software en Pi Zero (reinicio automático) — NO timer mecánico (interfiere con control CO₂)
- **⚠️ DESCARTADO**: timer mecánico como backup del fan — cicla el fan independiente del CO₂, puede causar sobreventilación o subventilación
- **Noctua**: circulación interna suave solamente, NO extracción FAE

### Temperatura

- **Control**: Pi Zero → relay 4ch → CHE cerámico 75W (socket E27)
- **Sensor**: SHT31 (mismo que humedad)
- **Monitoreo**: IBS-TH2 Plus BLE → alertas celular
- **⚠️ DESCARTADO**: QuietWarmth heat mat — calor por conducción desde abajo, no calienta el volumen de aire; susceptible a falla en alta humedad; insuficiente para noches frías de Tenjo con ventilación activa

### Circulación interna

- **Fan**: Noctua NF-P12 (ya disponible) — velocidad fija baja

---

## FASE 2 — MULTI-MÓDULO (después de GO/NO-GO Fase 1)

### Humedad

- **Control primario**: AC Infinity CloudForge T7 15L — **1 por carpa, se compra con la carpa** (kit por módulo, no inventario general)
- **Backup Carpa 1**: H05 en manual controlado por Pi Zero (mismo setup Fase 1)
- **Razón T7**: opera offline sin cloud, VPD integrado, no requiere integración HA
- **Sensor nivel agua T7**: sensor flotador 3.3V por cada T7 — alerta independiente por módulo

### Ventilación FAE / CO₂

- **Fan**: AC Infinity Cloudline H4 4" IP65 × 2 ($99 c/u)
- **Control CO₂**: ESP32-WROOM-32E con relay 4ch integrado × 2 ($17.99 c/u)
- **Sensor CO₂**: SCD30 NDIR × 2 ($28.99 c/u)
- **Lógica**: CO₂ > 1000ppm → H4 ON / CO₂ < 800ppm → H4 OFF
- **Failsafe H4 (criterio vigente):** línea base local validada por caudal/CO₂ y alarma; no usar timer fijo como sustituto de ACH

### Temperatura

- **Control**: BN-LINK thermostat digital × 2 ($18.99 c/u) — standalone
- **Calefactor**: CHE cerámico 75W × 2 por carpa (socket E27, compra local Colombia)

### Circulación interna

- **Fan**: GDSTIME 120mm IP67 AC + speed controller × 2 ($29.99 c/u)

---

## INCUBADORA (Prototipo A — paralelo a Fase 1)

- **Contenedor**: Caja Ultraforte 120L (disponible)
- **Calefacción**: hygger 50W en baño maría
- **Suplemento calor**: QuietWarmth heat mat bajo la caja — contacto seco exterior
- **Control**: Pi Zero 2W + relay 4ch + SHT31
- **CO₂**: MH-Z19C
- **⚠️ Acción pendiente**: probar estabilidad del hygger antes de inocular bolsas

---

## HUB CENTRAL — HOME ASSISTANT (Fase 2+)

- **Hardware**: Pi 4 4GB + SanDisk Extreme 256GB
- **Rol**: monitoreo, alertas, dashboard remoto — NO punto de fallo para control local
- **Sensores BLE**: IBS-TH2 Plus via passive_ble_monitor (HACS)
- **Cámara**: TP-Link Tapo C100 (~$25)
- **Alerta agua**: sensor flotador 3.3V (~$5)
- **UPS**: APC BE600M1 (~$45)

---

## TABLA DE REDUNDANCIAS — FASE 1

| Función | Control primario | Backup |
|---|---|---|
| Humedad | Pi Zero + SHT31 → relay → H05 manual | Ajuste manual por caretaker |
| CO₂ / ventilación | Control local + SCD30 → relay → fan | Línea base comisionada + alarma/manual |
| Temperatura | Pi Zero → relay → CHE cerámico 75W | Alerta IBS-TH2 → celular |
| Monitoreo HR/T° | IBS-TH2 Plus ×2 BLE | Inspección visual caretaker |

---

## DECISIONES DESCARTADAS

| Opción | Descartada por |
|---|---|
| H05 en modo auto | Sensor propio inútil — sesgo +30-35% confirmado con analógico + 2x Inkbird (2026-06-19) |
| T7 en Fase 1 | No validar antes de escalar — primero un ciclo completo con lo disponible |
| $835 USD de Amazon en una orden | Mezcla Fase 1 y Fase 2 — riesgo de comprar equipo sin datos reales del cultivo |
| ICC-500T (controlador CO₂ Inkbird) | ESP32 + SCD30 más flexible y barato (Fase 2) |
| GDSTIME 12V + fuente separada | Reemplazado por versión AC con adaptador integrado |
| QuietWarmth heat mat (calefacción carpa) | Calor por conducción, no calienta aire; insuficiente en noches frías Tenjo con FAE activo; riesgo en alta humedad. Reemplazado por CHE cerámico 75W |
| T7 compartido entre 2 carpas | Riesgo de cross-contamination, distribución irregular |

---

## IMPORTACIÓN A COLOMBIA

- Órdenes < $200 USD evitan cargo de importación elevado (~35% del valor)
- En Fase 1 solo se compra SCD30 + AeroZesh S4 → ~$157, una sola orden
