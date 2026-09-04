---
title: Estado Operacional Actual — Setas de la Peña
document_id: DOC-0051
category: meta
load_priority: always
last_updated: 2026-09-03
last_reviewed: 2026-09-03
---

# CURRENT_OPERATIONS

Estado operacional granular. Actualizar en cada visita al cultivo o cada vez que cambie un parámetro activo. Este archivo complementa `FARM_BRAIN.md` (visión estratégica) con datos tácticos de campo.

**Responsable de actualización:** Sebastián (remoto) o cuidador in situ.
**Frecuencia mínima:** Cada 48 horas durante producción activa.

---

## FASE ACTUAL

**Fase del proyecto:** Pre-producción — Equipamiento en sitio en Tenjo / Banco de pruebas y comisionamiento
**Fecha de inicio producción estimada:** Condicionada a validación de ciclo de autoclave All American 1941X, aprobación de formulación de sustrato y adquisición de spawn de shiitake trazable con clase térmica identificada.
**Lotes activos:** 0 (Material biológico en refrigeración: ~2.0 kg P. djamor, ~2.0 kg H. erinaceus, ~2.0 kg P. ostreatus mantenidos a 2–4 °C para ensayos preliminares de cámara).

---

## HARDWARE — ESTADO HOY (Inventario Físico en Tenjo)

| Ítem | Cantidad | Estado | Ubicación / Rol |
|---|:---:|---|---|
| AC Infinity CLOUDLAB 844 (4×4×6.7 ft) | 1 | Operacional | Tenjo — Carpa principal de fructificación Fase 1 |
| Martha Tent Terra Fungus 63" | 1 | Operacional | Tenjo — Carpa de I+D / prototipado y cuarentena |
| AC Infinity CloudForge T7 (15 L) | 1 | Operacional | Tenjo — Humidificador principal CLOUDLAB 844 |
| VIVOSUN AeroStream H05 (5 L) | 1 | Operacional (manual) | Tenjo — Humidificador auxiliar Martha Tent (sensor HR descartado) |
| AC Infinity Cloudline H4 4" (IP65) | 2 | Operacionales | Tenjo — Extracción y FAE principal |
| Klanata SHT45 (sonda inox IP67, I²C) | 1 | Disponible | Tenjo — Sensor principal T/HR dentro de CLOUDLAB 844 |
| Sensirion SHT3x (sondas AC Infinity) | 2 | Operacionales | Tenjo — Sensores secundarios T/HR |
| Sensirion SHT45 Breakouts | 2 | Disponibles | Tenjo — Monitoreo para incubadora y banco de pruebas |
| EC Buying MH-Z19C (NDIR CO₂) | 1 | Disponible | Tenjo — Sensor CO₂ con ABC=OFF y factor 1.369 para 2600 m |
| Sensirion SCD30 (NDIR CO₂) | 2 | Disponibles | Tenjo — Sensores CO₂ referencia (compensación altitud 2600m) |
| Inkbird IBS-TH2 Plus | 2 | Operacionales | Tenjo — Termohigrómetros Bluetooth para verificación cruzada |
| ESP32-WROOM-32 ACEIRMC | 3 | Operacionales | Tenjo — Controladores de borde ESPHome |
| Vilros Raspberry Pi 4 Model B (4GB kit) | 1 | Disponible | Tenjo — Servidor central Home Assistant OS + MQTT |
| Raspberry Pi Zero 2 W | 1 | Disponible | Tenjo — Nodo auxiliar / gateway de respaldo |
| Cajas TICONN IP67 | 2 | Operacionales | Tenjo — Gabinetes estancos para electrónica |
| All American 1941X (41 qt / 39 L) | 1 | En sitio | Tenjo — Esterilizador no eléctrico (autoclave) para comisionamiento |
| Estufa Industrial a Propano (2 quemadores) | 1 | Operacional | Tenjo — Fuente térmica para esterilización |
| Malla radiante QuietWarmth (90W, 120V) | 1 | Disponible | Tenjo — Calefacción para incubación |
| Racks metálicos y Mesón inox 1.50 m | 4 | Operacionales | Tenjo — Almacenamiento vertical y área de trabajo limpio |

---

## SENSORES — LECTURAS DE REFERENCIA

*(Actualizar con lecturas reales del cuidador)*

| Sensor | Última lectura | Fecha/Hora | Notas |
|---|---|---|---|
| Inkbird IBS-TH2 Plus (HR) | — | — | Fuente de verdad hasta SHT3x |
| Inkbird IBS-TH2 Plus (T°) | — | — | — |
| VIVOSUN H05 (HR) | ~~NO USAR~~ | — | Sesgo +30–35% — descartado |

**Punto de rocío calculado:** — (requiere T° y HR reales)

---

## ESPECIFICACIÓN AMBIENTAL DEL LOTE 1

No hay setpoints operacionales aprobados para el lote 1. *Lentinula edodes* presenta clases térmicas de cepa y respuestas de inducción distintas; los rangos de literatura en `01_species/lentinula_edodes.md` sirven para diseñar el piloto, no para controlar producción sin una especificación versionada.

| Variable | Estado actual | Condición para aprobar |
|---|---|---|
| Temperatura de incubación y maduración | Pendiente | Identidad/clase de cepa, ficha del proveedor y prueba de cámara |
| Temperatura y método de inducción | Pendiente | Criterio de madurez definido y respuesta documentada de la cepa |
| HR de fructificación | Pendiente | Piloto instrumentado y verificación del sensor principal |
| CO₂ y FAE | Pendiente | Volumen efectivo y caudal medidos; respuesta morfológica registrada |
| Luz | Pendiente | Especificación de cepa/proveedor y prueba local |
| Criterio de cosecha | Pendiente | Estándar comercial y de calidad definido antes de la primera fructificación |

Antes de inocular, `06_operations/quality_control.md` exige spawn trazable, formulación aprobada y ciclo de autoclave validado con carga representativa. Antes de inducir, el lote debe tener un criterio de madurez documentado. El choque frío no se presume obligatorio.

---

## LOTES ACTIVOS

*Sin lotes activos. Iniciar registro en formato abajo cuando arranque producción.*

### Plantilla de lote activo

```
**Lote ID:** YYYY-MM-LE-001 (LE = Lentinula edodes; registrar el código en `06_operations/batch_tracking.md` antes del primer lote si aún no existe)
**Fecha inoculación:** YYYY-MM-DD
**Cepa / proveedor:** [Identificación trazable]
**Sustrato:** Serrín de madera dura suplementado o formulación aprobada — X kg en base seca
**Tratamiento:** Ciclo de esterilización validado — referencia del ciclo
**Spawn:** Y% del peso seco = Z g
**Contenedor:** [Bolsa | Tote | Block] — dimensiones
**Ubicación:** [Martha Tent | CLOUDLAB 844 — posición]

**Estado actual:** [Colonización | Fructificación — flush #N | Completado]
**Días desde inoculación:** N
**Contaminación detectada:** Sí / No — descripción si aplica

**Lecturas sensor (hoy):**
- T°: XX°C
- HR: XX%
- CO₂: XXXX ppm

**Próxima acción:** [Descripción] — Fecha
```

---

## PENDIENTES CRÍTICOS — SEMANA ACTUAL

| Tarea | Responsable | Fecha límite | Estado |
|---|---|---|---|
| Recepción física de activos de cultivo en Tenjo | Sebastián / cuidador | 2026-08-14 | ✅ Completado |
| Poner en marcha RPi4 + Home Assistant OS con backup local | Sebastián | 2026-09-10 | ⏳ En curso |
| Comparación cruzada de sensores SHT45, SHT3x e Inkbird en banco | Sebastián | 2026-09-12 | ⏳ En curso |
| Calibrar MH-Z19C y SCD30 con ABC=OFF y compensación barométrica de 2600 m | Sebastián | 2026-09-15 | ⏳ Pendiente |
| Comisionar All American 1941X con estufa a propano y registrar curvas de penetración | Sebastián / cuidador | 2026-09-20 | ⏳ Pendiente |
| Monitorear viabilidad y refrigeración de spawn en banco (P. djamor, H. erinaceus, P. ostreatus) | Cuidador | Continuo | ⏳ Activo |
| Adquirir spawn de *Lentinula edodes* con ficha técnica, cepa y clase térmica confirmada | Sebastián | 2026-09-25 | ⏳ Pendiente |
| Definir formulación piloto de serrín de roble suplementado (base seca estricta) | Sebastián | Post-autoclave | Bloqueado |
| Ejecutar ciclo de esterilización e inoculación de lote piloto LE-001 | Sebastián / cuidador | Post-validaciones | Bloqueado |

---

## INCIDENTES ACTIVOS

*Sin incidentes activos.*

### Plantilla de incidente

```
**Incidente ID:** INC-YYYY-MM-NNN
**Detectado:** YYYY-MM-DD HH:MM
**Síntoma:** Descripción de lo observado
**Hipótesis:** Causa probable
**Acción tomada:** Descripción
**Estado:** Abierto / Resuelto
**Resolución:** Descripción (si cerrado)
**→ Lección aprendida:** LESSONS_LEARNED.md #L-NNN (si aplica)
```

---

## INSTRUCCIONES PARA EL CUIDADOR (HOY)

*(Actualizar instrucciones específicas aquí para la persona que visita el cultivo físicamente)*

**Visita programada:** Por confirmar

**Acciones esta visita:**
1. Registrar lectura Inkbird (HR y T°) en este archivo
2. Verificar que VIVOSUN H05 está encendido y produciendo niebla
3. Confirmar que Martha Tent no tiene signos de contaminación visual (manchas verdes/negras)
4. Fotografiar estado general y enviar a Sebastián via WhatsApp

**Señales de alarma — contactar a Sebastián inmediatamente si:**
- Manchas de color (verde, negro, naranja) en el sustrato
- Olor a fermentación o podrido
- Temperatura <15°C o >32°C según Inkbird
- Humidificador no produce niebla

---

*Este archivo es la interfaz operacional con el cuidador in situ.*
*Para contexto estratégico → `FARM_BRAIN.md`*
*Para decisiones técnicas → `DECISIONS.md`*
*Para lecciones de lotes pasados → `LESSONS_LEARNED.md`*
