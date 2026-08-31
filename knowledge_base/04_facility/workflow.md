---
title: Flujo de Trabajo — Piloto Inicial de Shiitake
document_id: DOC-0024
category: facility
load_priority: selective
last_reviewed: 2026-07-24
confidence: medium
primary_sources:
  - DEC-013
  - book_007
  - paper_006
related_documents:
  - master_blueprint.md
  - fruiting.md
  - incubation.md
  - ../06_operations/production_schedule.md
  - ../06_operations/batch_tracking.md
  - ../06_operations/quality_control.md
---

# Executive Summary

Flujo de trabajo para el primer piloto de *Lentinula edodes*. Avanza por compuertas verificables y no por un calendario fijo. El lote 1 permanece bloqueado hasta contar con spawn trazable, formulación aprobada y ciclo de autoclave validado con carga representativa.

# Flujo

```
Aprobar spawn y formulación
  -> preparar y registrar sustrato
  -> esterilizar con ciclo validado
  -> enfriar y liberar carga
  -> inocular y trazar lote LE
  -> incubar y evaluar madurez
  -> aprobar estrategia de inducción
  -> fructificar bajo especificación versionada
  -> cosechar, clasificar y almacenar
  -> revisar métricas y cerrar lote
```

# Compuertas

| Transición | Condición |
|---|---|
| Compra -> preparación | Proveedor, lote y cepa/código de spawn registrados; formulación versionada |
| Preparación -> esterilización | Pesos, humedad, insumos y empaque completos |
| Esterilización -> inoculación | Ciclo validado y registro de la carga aprobado |
| Inoculación -> incubación | ID LE, operador, tasa real y ubicación registrados |
| Incubación -> inducción | Criterio de madurez específico del lote cumplido |
| Inducción -> fructificación | Método, tiempo, temperatura y respuesta inicial documentados |
| Fructificación -> cosecha | Criterio de cosecha y condición de producto aprobados |
| Cosecha -> cierre | Pesos por flush, grados, descartes, almacenamiento y desviaciones completos |

# Registro mínimo del lote

```
Lote: YYYY-MM-LE-###
Spawn: proveedor / cepa o código / lote / fecha
Formulación: ID y versión
Sustrato: peso seco / peso húmedo / humedad medida
Esterilización: equipo / ciclo / carga / operador / aprobación
Inoculación: fecha / operador / tasa real / contenedor
Incubación: ubicación / ambiente / inspecciones / madurez
Inducción: método / parámetros / fecha / respuesta
Fructificación: ambiente / actuadores / morfología / desviaciones
Cosecha: fecha / flush / peso / grado / descarte / destino
Cierre: BE acumulada / contaminación / pérdidas / aprendizaje
```

# Tiempos

La planificación provisional del ciclo total es de 90–150 días, pero ninguna transición ocurre por alcanzar un día específico. El primer lote es único y aislado. La cadencia siguiente se decide después de observar colonización sana, proceso aséptico controlado y un ciclo completo.

# Reglas de operación

- No mezclar lotes o formulaciones en el primer piloto.
- No cambiar más de una variable deliberada dentro del mismo ensayo.
- No abrir bolsas durante incubación para “comprobar” colonización.
- Aislar cualquier material sospechoso y registrar evidencia.
- Pausar una transición si falta una compuerta; no completar datos de memoria.
- Leer el cierre del lote anterior antes de autorizar el siguiente.

# Fallos comunes

- Inocular una carga sin validación térmica.
- Aplicar choque frío por rutina sin conocer la cepa.
- Mover bloques por calendario antes de madurez.
- Cambiar setpoints sin versionar la especificación.
- Calcular BE con peso húmedo de sustrato.
- Escalar antes de cerrar el piloto.
