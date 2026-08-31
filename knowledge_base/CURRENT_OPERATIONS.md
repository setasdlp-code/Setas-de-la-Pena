---
title: Estado Operacional Actual — Setas de la Peña
document_id: DOC-0051
category: meta
load_priority: always
last_updated: 2026-08-03
last_reviewed: 2026-08-03
---

# CURRENT_OPERATIONS

Estado operacional granular. Actualizar en cada visita al cultivo o cada vez que cambie un parámetro activo. Este archivo complementa `FARM_BRAIN.md` (visión estratégica) con datos tácticos de campo.

**Responsable de actualización:** Sebastián (remoto) o cuidador in situ.
**Frecuencia mínima:** Cada 48 horas durante producción activa.

---

## FASE ACTUAL

**Fase del proyecto:** Pre-producción — Hardware en tránsito / Banco de pruebas
**Fecha de inicio producción estimada:** Sin fecha; condicionada a spawn de shiitake, receta de sustrato y validación del ciclo de autoclave
**Lotes activos:** 0

---

## HARDWARE — ESTADO HOY

| Ítem | Estado | Ubicación |
|---|---|---|
| Martha Tent (prototipado) | Operacional | Tenjo |
| VIVOSUN H05 humidificador | Operacional (sensor HR descartado) | Tenjo |
| Inkbird IBS-TH2 Plus | Operacional — sensor de referencia | Tenjo |
| CLOUDLAB 844 grow tent | **En tránsito** (Amazon) | — |
| AC Infinity T7 fan controller | **En tránsito** (Amazon) | — |
| ESP32-WROOM-32 ×3 | **En tránsito** (Amazon) | — |
| Sensirion SCD30 ×2 | **En tránsito** (Amazon) | — |
| Sensirion SHT3x ×2 (sonda AC Infinity) | **En tránsito** (Amazon) | — |
| TICONN IP67 enclosure ×2 | **En tránsito** (Amazon) | — |
| H4 humidifier ×2 | **En tránsito** (Amazon) | — |
| RPi4 (Home Assistant) | Pendiente de configuración inicial | Tenjo |

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
| Confirmar llegada de pedidos Amazon | Sebastián | 2026-07-07 | ⏳ Pendiente |
| Instalar RPi4 + Home Assistant | Sebastián / cuidador | 2026-07-10 | ⏳ Pendiente |
| Configurar primer ESP32 en banco de pruebas | Sebastián | 2026-07-14 | ⏳ Pendiente |
| Validar SHT3x vs Inkbird (calibración cruzada) | Sebastián | 2026-07-14 | ⏳ Pendiente |
| Conseguir spawn de shiitake con cepa identificada | Sebastián | Por definir | Pendiente |
| Levantar configuración as-built y validar distribución térmica con carga simulada | Sebastián | Por definir | Pendiente |
| Comisionar autoclave y documentar ciclo con carga representativa | Sebastián | Por definir | Pendiente |
| Definir formulación control y plan comparativo de contaminación | Sebastián | Después de comisionar autoclave | Pendiente |
| Aprobar formulación inicial de sustrato shiitake | Sebastián | Después de revisar piloto | Bloqueado |
| Esterilizar e inocular primer lote piloto | Cuidador + Sebastián | Después de validaciones previas | Bloqueado |

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
