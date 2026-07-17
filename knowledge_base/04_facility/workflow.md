---
title: Flujo de Trabajo de Producción
category: facility
load_priority: selective
last_reviewed: 2026-06-29
confidence: high
primary_sources:
  - Internal protocols
  - Stamets 2000
  - Cotter 2014
related_documents:
  - master_blueprint.md
  - fruiting.md
  - incubation.md
  - 06_operations/production_schedule.md
  - 06_operations/batch_tracking.md
---

# Executive Summary
Flujo de trabajo completo desde sustrato hasta cosecha. Referencia operacional para el cuidador en campo.

# Technical Details

## Ciclo Completo — P. djamor (Especie Prioridad)

```
DÍA 0: PREPARACIÓN DE SUSTRATO
├── Hidratar paja de trigo (remojo 12–24h)
├── Pasteurizar (80°C, 60 min en agua caliente)
├── Escurrir y enfriar (<30°C)
└── Verificar FC (pocas gotas al exprimir)

DÍA 0 (mismo día o DÍA 1): INOCULACIÓN
├── Preparar área de inoculación (alcohol 70%, guantes, mascarilla)
├── Mezclar spawn con sustrato (15% peso seco)
├── Empacar en bolsas
├── Sellar bolsas
└── Etiquetar: especie, fecha, lote

DÍAS 1–18: INCUBACIÓN (SPAWN RUN)
├── T°: 24–28°C
├── Sin luz
├── Inspección visual cada 48h (sin abrir bolsas)
├── Registrar % colonización en bitácora
└── Aislar contaminados inmediatamente

DÍA 14–18: INICIO FRUITING
├── Verificar colonización completa (micelio blanco uniforme)
├── Hacer cortes en bolsa (2–3 cortes por bloque)
├── Colocar en cámara fructificación
├── Configurar parámetros:
│   ├── HR: 85–90%
│   ├── Ventilación: control por CO₂; línea base tras commissioning
│   ├── CO₂: objetivo 500–1.500 ppm; alarma >2.000 ppm
│   └── Luz: 750–1,500 lux, 4h/día (timer)
└── Registrar inicio de fruiting en bitácora

DÍAS 22–27: PRIMERA COSECHA (FLUSH 1)
├── Indicador: borde de caps comienza a enrollar
├── Cosechar torciéndolos suavemente (no cortar)
├── Limpiar zona de fructificación (remover muñones)
├── Pesar y registrar yield
└── Calcular BE: peso fresco / peso seco sustrato × 100

DÍAS 28–42: SEGUNDA OLEADA (FLUSH 2)
├── Remojar bloque en agua limpia 12–24h
├── Devolver a cámara
├── Repetir condiciones
└── Esperar 10–14 días adicionales

DÍAS 43–55: FLUSH 3 (SI APLICA)
└── Repetir proceso de rehidratación
```

## Bitácora por Lote — Campos Obligatorios

```
LOTE #___
Especie: _______________
Fecha inoculación: _______
Sustrato: ______________ FC estimado: ____%
Spawn usado: ________ kg  Proporción: ____%
Número de bloques: ___

INCUBACIÓN:
Día 3 — % colonización: ___  Observaciones: ___
Día 7 — % colonización: ___  Observaciones: ___
Día 14 — % colonización: ___  Observaciones: ___
Contaminación: ___% bloques — Tipo: ___

FRUCTIFICACIÓN:
Fecha inicio: ________
Día 1 HR: ___ T°: ___ CO₂: ___
Fecha primeros pins: ________
Flush 1: Fecha _______ Peso _______ g
Flush 2: Fecha _______ Peso _______ g
BE Total: _______ %
```

## Tiempos Estimados de Trabajo (por Lote de 10 Bloques)

| Actividad | Tiempo |
|---|---|
| Preparar y pasteurizar sustrato | 3–4 h |
| Inoculación | 1–2 h |
| Revisión diaria incubación | 10 min/día |
| Setup cámara fruiting | 30 min |
| Revisión diaria fruiting | 15 min/día |
| Cosecha | 30–60 min/flush |
| Limpieza post-cosecha | 30 min |

**Total dedicación / semana (lote activo):** ~3–5 horas.

# Best Practices
- Nunca mezclar lotes de diferentes fechas en la misma cámara si es posible.
- El cuidador debe leer la bitácora del lote anterior antes de iniciar uno nuevo.
- Si hay dudas sobre un paso: pausar y consultar con Sebastián antes de continuar.

# Common Failure Modes
- Apresurar la transición incubación→fruiting sin colonización completa → rendimiento bajo.
- No remojar bloques entre flushes → segunda oleada deficiente.
- No registrar en bitácora → sin datos para mejorar.

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
