---
title: Cámaras de Fructificación — Comisionamiento para Shiitake
document_id: DOC-0019
category: facility
load_priority: selective
last_reviewed: 2026-07-24
confidence: medium
primary_sources:
  - Chang & Miles 2004 (book_007, capítulo 13)
  - AC Infinity CLOUDLAB 844 manual
  - Rodríguez Valencia & Jaramillo López 2005 (paper_006)
related_documents:
  - master_blueprint.md
  - incubation.md
  - ../05_equipment/environmental_control.md
  - ../01_species/lentinula_edodes.md
  - ../06_operations/quality_control.md
---

# Executive Summary

CLOUDLAB 844 es el módulo principal y Terra Fungus Martha el módulo de I+D, cuarentena y respaldo. Ambos deben comisionarse para el programa inicial de shiitake. No hay setpoints activos de temperatura, HR, CO₂, luz o FAE hasta identificar la cepa y aprobar la especificación del lote.

# Arquitectura

Cada cámara opera con control local en ESP32/ESPHome. Home Assistant supervisa y registra; una pérdida de red no debe eliminar las funciones locales aprobadas.

| Componente | Función | Estado requerido |
|---|---|---|
| SHT3x/SHT31 | Temperatura y HR principal | Verificación cruzada documentada |
| SCD30 | CO₂ de cámara | Compensación de altitud a 2.600 m |
| H4 | Extracción | Caudal medido con la resistencia real |
| T7/H05 | Humidificación | Actuación independiente de sensores descartados |
| Noctua | Mezcla interna | Flujo suave, sin desecar bloques |
| ESP32 | Control local | Banco de pruebas aprobado |
| Home Assistant | Tendencias y alertas | Registro continuo |

La posición de extracción, entrada, humidificación y sensores se valida mediante medición. No se justifica por una regla simplificada sobre el peso del CO₂. El sensor debe representar la zona de los bloques y quedar fuera del chorro directo de niebla o aire.

# Estado de parámetros

| Variable | Estado | Método de aprobación |
|---|---|---|
| Temperatura | Pendiente por cepa/clase térmica | Ficha de spawn + piloto |
| HR | Pendiente | Piloto instrumentado y respuesta superficial del bloque |
| CO₂ | Pendiente | Morfología + serie de datos |
| FAE / ACH | Pendiente | Volumen efectivo + caudal medido |
| Luz | Pendiente | Especificación de cepa y prueba local |
| Inducción | Pendiente | Criterio de madurez + respuesta de la cepa |
| Criterio de cosecha | Pendiente | Especificación de calidad y comprador |

No usar valores antiguos de *P. djamor* ni convertir un ciclo ON/OFF en ACH.

# Comisionamiento por cámara

1. Verificar sellos, drenaje, seguridad eléctrica y ubicación de actuadores.
2. Medir volumen efectivo y registrar configuración de estanterías.
3. Verificar SHT3x contra Inkbird; descartar la lectura integrada del H05.
4. Configurar SCD30 con compensación de altitud y comparar respuesta de tendencia.
5. Medir caudal del H4 con ductos, filtros y restricciones instalados.
6. Ejecutar una prueba vacía y otra con masa térmica/hídrica representativa.
7. Mapear temperatura y HR en más de una posición.
8. Documentar recuperación tras apertura de puerta, humidificación y extracción.
9. Aprobar alertas solo después de definir la especificación del lote.
10. Registrar versión de firmware, configuración física y fecha.

# Checklist diario durante piloto

```
[ ] Cámara, lote y versión de especificación confirmados
[ ] Datos de T/HR/CO₂ presentes y sin huecos críticos
[ ] Actuadores responden y el ciclo ejecutado coincide con el registro
[ ] Sin condensación libre sobre bloques ni acumulación peligrosa de agua
[ ] Sin contaminación, plagas, viscosidad u olor anormal
[ ] Morfología y estado de superficie fotografiados
[ ] Aperturas de puerta, rellenos y ajustes anotados
```

# Inducción de shiitake

La inducción se aplica solo después de aprobar la madurez del bloque. Según la cepa, puede involucrar descenso térmico, remojo, fluctuación natural u otra combinación. El choque frío y el remojo de 12–24 horas son técnicas descritas en literatura, no pasos automáticos para toda cepa.

Registrar método, temperatura, duración, condición inicial del bloque y respuesta. No repetir una inducción fallida sin revisión de causa.

# Fallos a investigar

| Señal | Hipótesis | Evidencia mínima |
|---|---|---|
| Sin primordios | Bloque inmaduro o inducción incompatible con la cepa | Criterio de madurez, clase térmica, registro de inducción |
| Tallos largos/sombreros pequeños | CO₂, luz o densidad de carga | Serie CO₂, caudal, posición, fotografías |
| Superficie seca | Flujo directo o HR inadecuada | Mapa de aire/HR y posición |
| Condensación o viscosidad | Niebla directa, exceso de humedad o baja evaporación | Ciclos, temperatura de superficies, inspección |
| Variación por estante | Mezcla o distribución desigual | Mapa multipunto y ubicación de bloques |

# Preguntas abiertas

- ¿Qué clase térmica tendrá la cepa adquirida?
- ¿Qué densidad de bloques mantiene uniformidad en cada módulo?
- ¿Qué volumen efectivo y caudal real tiene cada configuración?
- ¿Qué estrategia de inducción produce respuesta repetible?
