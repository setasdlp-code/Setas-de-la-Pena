# Plan de Automatización — Home Assistant

**Estado:** diseño provisional, no comisionado  
**Última revisión:** 2026-07-16  
**Fuente de estado:** `knowledge_base/CURRENT_OPERATIONS.md`  
**Fuente de parámetros:** `knowledge_base/01_species/pleurotus_djamor.md`

Este documento no certifica que el hardware esté recibido, instalado o configurado. Ninguna salida automática debe habilitarse antes de completar el inventario físico, la validación eléctrica, la comparación de sensores y el commissioning de ventilación.

## Arquitectura Objetivo

```text
SHT3x + SCD30 ──> ESP32/ESPHome ──> control local seguro
                         │
                         └──> Home Assistant: historial, alarmas y supervisión

Inkbird ──> verificación cruzada independiente
Operador ──> paro y control manual disponibles en todo momento
```

- Cada ambiente usa `ENV-XXXX`; equipos y sensores usan `EQ-XXXX` y `SNS-XXXX`.
- El ESP32 conserva la lógica crítica local si HA o la red fallan.
- HA no sustituye límites físicos, fusibles, protecciones ni inspección humana.
- El sensor HR integrado del VIVOSUN H05 está invalidado.

## Estado de Inventario

Todos los equipos permanecen en `verification_required` hasta registrar foto, ubicación, número de serie y prueba funcional en `knowledge_base/metadata/equipment.yaml`.

No usar expresiones como “inventario real”, “instalado” o “activo” basadas únicamente en pedidos o fechas estimadas de entrega.

## Parámetros Provisionales — P. djamor

| Variable | Objetivo | Alarma / condición |
|---|---:|---:|
| Temperatura | 20–30°C | <18°C o >32°C |
| HR | 85–90% | <82% o >92% |
| CO₂ | 500–1.500 ppm | >2.000 ppm |
| Luz | 750–1.500 lux, 3–5 h/día | Verificar respuesta biológica |
| Ventilación | 5–8 ACH provisional | Solo después de medir caudal efectivo |

Los umbrales no son resultados de producción local. Deben actualizarse después de obtener datos de lotes trazables.

## Commissioning Obligatorio

1. Verificar alimentación, tierra, fusibles, relés y estado seguro al reiniciar.
2. Confirmar I²C `0x44` para SHT3x y `0x61` para SCD30.
3. Configurar `altitude_compensation: 2600` y comparar sensores contra referencia.
4. Medir volumen y caudal efectivo del extractor con filtros, ductos y compuertas instalados.
5. Calcular `ACH = caudal efectivo_CFM × duty_cycle × 60 / volumen_ft3`.
6. Cargar la cámara con masa térmica representativa y registrar la curva de CO₂/HR.
7. Definir la línea base mínima y el control por CO₂; documentar zonas muertas.
8. Probar pérdida de WiFi/HA, sensor inválido, relay pegado y recuperación de energía.
9. Obtener aprobación humana antes de habilitar acciones automáticas.

Un timer mecánico no demuestra ACH y no es el control primario. Cualquier respaldo debe definirse desde el riesgo real y probarse durante commissioning.

## Entidades Mínimas en Home Assistant

- T°, HR y CO₂ por `ENV-XXXX` con su `SNS-XXXX` de origen.
- Estado y disponibilidad de cada actuador `EQ-XXXX`.
- Delta SHT3x–Inkbird y alerta de sensor sin cambios.
- Horas dentro de rango por lote `BT-XXXX`.
- Caudal/ACH de commissioning como metadato, no como lectura inferida del timer.

## Condiciones para Habilitar Automatización

```text
[ ] inventory_verified
[ ] electrical_safety_verified
[ ] sensors_cross_checked
[ ] ventilation_commissioned
[ ] manual_override_tested
[ ] failure_modes_tested
[ ] CURRENT_OPERATIONS updated with dated evidence
```

Hasta completar todos los puntos, `ECC/config/workflow_template.json` mantiene `automated_actions.enabled: false` y `cloudlab_esp32.yaml` se considera configuración de banco de pruebas.
