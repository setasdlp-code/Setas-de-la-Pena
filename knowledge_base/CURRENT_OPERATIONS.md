---
title: Estado Operacional Actual — Setas de la Peña
category: meta
load_priority: always
last_updated: 2026-07-16
confidence: low
---

# CURRENT_OPERATIONS

La última instantánea de campo encontrada es del 2026-06-29. Este documento no afirma recepciones, instalaciones ni producción que no estén respaldadas por una verificación posterior.

## Fase Actual

**Fase verificable:** preproducción, con inventario físico pendiente.  
**Fecha de inicio:** no programada hasta cerrar inventario, pruebas ambientales, spawn y paja.  
**Lotes activos documentados:** 0; confirmar en campo.

## Hardware — Verificación Requerida

| Ítem | Último estado documentado | Comprobación necesaria |
|---|---|---|
| Martha Tent | Reportada en Tenjo como prototipo | Foto, ubicación, integridad y prueba |
| VIVOSUN H05 | Reportado en modo manual | Prueba de niebla; no usar su sensor HR |
| Inkbird IBS-TH2 Plus ×2 | Reportados como referencia | Lectura actual y comparación cruzada |
| CLOUDLAB 844 | Pedido; llegada estimada 2026-07-05/06 | Recepción, dimensiones, montaje y ubicación |
| AC Infinity T7 humidificador | Pedido; llegada estimada 2026-06-28 | Recepción y prueba funcional |
| AC Infinity H4 extractor ×2 | Pedido; ventana estimada 2026-07-03 a 2026-07-18 | Recepción, caudal y commissioning |
| ESP32-WROOM-32 ×3 | Pedido; llegada estimada 2026-06-28 | Recepción, pinout, firmware y prueba |
| SCD30 ×2 / SHT3x ×2 | Pedido; llegada estimada 2026-06-28 | Recepción, direcciones I²C y calibración |
| TICONN IP67 ×2 | Pedido; llegada estimada 2026-06-28 | Recepción e inspección |
| RPi4 + Home Assistant | Registros previos contradictorios | Presencia, versión, acceso y configuración |

La nomenclatura correcta es T7 = humidificador y H4 = extractor.

## Lecturas de Referencia

No hay lecturas actuales fechadas. Antes de operar, registrar T°, HR y CO₂ con hora, sensor (`SNS-XXXX`) y ambiente (`ENV-XXXX`). La lectura HR del H05 permanece invalidada.

## Parámetros Provisionales — P. djamor

| Parámetro | Colonización | Fructificación |
|---|---|---|
| Temperatura | 24–28°C | 20–30°C |
| Humedad relativa ambiente | No crítica en bolsa sellada | 85–90% |
| CO₂ | Alto en bolsa; documentar | 500–1.500 ppm; alarma >2.000 ppm |
| Ventilación | Según proceso | 5–8 ACH provisional, solo después de medir caudal efectivo |
| Luz | No requerida | 750–1.500 lux, 3–5 h/día |

No existe un ciclo ON/OFF de producción validado. El control debe basarse en CO₂, caudal efectivo, volumen, HR y morfología.

## Lotes Activos

No hay registros `BT-XXXX` activos en el repositorio.

```text
Lote: BT-XXXX
Bloques: BL-XXXX
Sustrato: SB-XXXX
Spawn: GS-XXXX
Ambiente: ENV-XXXX
Fecha de inoculación: YYYY-MM-DD
Estado: colonización | fructificación | completado | descartado
Lecturas: T° / HR / CO₂ con fecha y SNS-XXXX
Próxima acción y fecha: ...
```

## Pendientes Críticos

| Tarea | Evidencia de cierre | Estado |
|---|---|---|
| Inventario físico completo | Fotos + ubicación + estado por equipo | Pendiente |
| Confirmar RPi4/HA/ESP32 | Captura de versión/configuración y prueba | Pendiente |
| Validar sensores | Lecturas cruzadas y direcciones I²C | Pendiente |
| Commissioning de ventilación | Caudal efectivo, ACH estimado y curva de CO₂ | Pendiente |
| Conseguir spawn | Proveedor, lote `GS-XXXX` y trazabilidad | Pendiente |
| Conseguir paja | Proveedor/lote `RM-XXXX` y costo | Pendiente |

## Incidentes Activos

No hay incidentes actuales documentados; confirmar durante inventario.

```text
Incidente: INC-XXXX
Detectado: YYYY-MM-DD HH:MM
Entidad afectada: PREFIX-XXXX
Síntoma y evidencia: ...
Hipótesis: ...
Acción: ...
Estado: abierto | resuelto
Lección vinculada: LL-XXXX o N/A
```

## Instrucciones para la Próxima Visita

1. No energizar equipos mojados o con cableado sin inspeccionar.
2. Fotografiar cada equipo y registrar presencia, ubicación y condición.
3. Registrar lecturas de Inkbird; no usar HR del H05.
4. Confirmar si existe material biológico o lote no documentado y, si existe, ponerlo en cuarentena documental hasta asignar trazabilidad.
5. Reportar cualquier incidente con `INC-XXXX` y evidencia.

*Actualizar solo desde evidencia de campo fechada. Visión ejecutiva: `FARM_BRAIN.md`; inventario estructurado: `metadata/equipment.yaml`.*
