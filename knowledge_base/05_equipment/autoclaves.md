---
title: Autoclaves y Esterilización
document_id: DOC-0025
category: equipment
load_priority: selective
last_reviewed: 2026-08-19
confidence: high
primary_sources:
  - All American 1930 — 1941X manufacturer specification, accessed 2026-08-19
  - Registro visual interno del equipo, 2026-07-14
  - Stamets (2000)
  - ../09_research/commissioning_validation_research.md
related_documents:
  - laminar_flow.md
  - ../02_substrates/sterilization.md
  - ../04_facility/laboratory.md
  - ../06_operations/operational_commissioning.md
  - ../06_operations/quality_control.md
  - ../09_research/commissioning_validation_research.md
---

# Executive Summary

El equipo térmico relevante para el commissioning actual es el **All American 1941X no eléctrico** físicamente disponible para Setas de la Peña. La especificación vigente del fabricante indica **41 qt / 39 L** de capacidad nominal. El valor histórico de 44 L fue una cifra reportada por el propietario y no debe utilizarse para cálculos de capacidad.

La capacidad nominal del recipiente tampoco determina cuántas bolsas de sustrato pueden procesarse de forma válida por ciclo. La capacidad operacional depende de dimensiones y masa de bolsa, formulación, humedad, geometría de carga, fuente de calor y comportamiento térmico demostrado en estudios de distribución y penetración.

Este documento describe el equipo y su puesta en marcha. Los criterios de validación térmica pertenecen a `../06_operations/operational_commissioning.md`; la base de evidencia se conserva en `../09_research/commissioning_validation_research.md`.

# Current Equipment — All American 1941X

La placa fotografiada el 2026-07-14 confirma el modelo `1941X` y el serial `C0046139`. Este registro visual no valida el funcionamiento ni sustituye el commissioning; ver `visual_records/autoclave_all_american_1941x_2026-07-14.md`.

## Especificación verificada de fabricante

| Campo | Valor |
|---|---|
| Fabricante | All American 1930 |
| Modelo | `1941X Sterilizer` |
| Tipo | Esterilizador no eléctrico / vapor a presión |
| Capacidad nominal | **41 qt / 39 L** |
| Altura exterior aproximada | 19 in |
| Diámetro aproximado | 15.25 in |
| Peso aproximado | 44 lb |
| Fuente de calor | Externa; fabricante indica una fuente de calor efectiva |
| Accesorios | Contenedor interior y rack según especificación de producto |
| Uso declarado por fabricante | Esterilización de apósitos e instrumental |
| Capacidad en bolsas de sustrato | **No especificada por fabricante; requiere medición local** |

La configuración disponible en el proyecto usa una **estufa industrial doble a gas propano** como fuente de calor. La estabilidad, potencia efectiva, interacción con el recipiente y consumo de combustible deben medirse durante commissioning; no se asumen desde la potencia nominal de la estufa.

# Architectural Role

El 1941X es actualmente la línea candidata de vapor a presión para el programa inicial de sustrato suplementado de shiitake. Su rol es establecer un baseline reproducible antes de comparar alternativas de mayor capacidad o procesos térmicos distintos.

No se adquiere otro recipiente a presión solo porque un cálculo teórico sugiera mayor throughput. Primero se mide la capacidad real del 1941X y se identifica si el tratamiento térmico es efectivamente el cuello de botella del sistema completo.

# Commissioning Requirements

Antes de considerar el equipo disponible para producción normal:

1. Confirmar placa/modelo y configuración física contra la documentación del fabricante.
2. Inspeccionar integridad general, superficies de sellado, válvulas, manómetro y componentes de seguridad según instrucciones del fabricante.
3. Confirmar que no existan modificaciones no documentadas del sistema de presión.
4. Identificar y verificar los instrumentos que se usarán para decisiones de commissioning.
5. Definir una carga representativa: receta, humedad, bolsa, masa, número de bolsas y geometría.
6. Ejecutar estudio `HEAT_DISTRIBUTION` de la configuración cargada.
7. Ejecutar estudio `HEAT_PENETRATION` dentro de bolsas candidatas a peor caso.
8. Repetir cargas representativas para medir variabilidad entre ciclos.
9. Registrar consumo de propano, tiempos de proceso, enfriamiento, trabajo del operador y capacidad real.
10. Vincular los lotes inoculados con `thermal_cycle_id` y seguir contaminación, integridad de bolsa y desempeño biológico.
11. Promover un ciclo a estándar operacional únicamente mediante la compuerta definida en `quality_control.md` y `operational_commissioning.md`.

# Thermal Process Principles

## No existe un ciclo genérico aprobado

Los valores de literatura como `121 °C`, `15 psi` o `2–4 h` **no son un protocolo de operación del 1941X de Setas de la Peña**.

Un ciclo válido debe corresponder a una configuración versionada. No se fija el tiempo de hold hasta caracterizar distribución y penetración térmica de la carga real.

## Presión no equivale automáticamente a temperatura del sustrato

Registrar:

- tipo de manómetro;
- presión manométrica vs absoluta cuando corresponda;
- temperatura de cámara;
- temperatura del producto durante estudios de penetración;
- condiciones iniciales y fuente de calor.

La presión del recipiente puede ser una variable de control útil, pero no sustituye la medición del historial tiempo-temperatura del sustrato en commissioning.

## Altitud

Tenjo opera a presión atmosférica menor que el nivel del mar. No utilizar una regla simplificada de “15 psi siempre produce exactamente 121 °C en el producto” como criterio de aceptación. Seguir límites e instrucciones del fabricante, distinguir presión gauge/absoluta y validar el producto con medición térmica.

# Capacity — Measurement, Not Nameplate

Las antiguas estimaciones de bolsas por ciclo para modelos All American se retiran como datos operacionales porque no estaban sustentadas por especificación de fabricante ni por ensayo con las bolsas reales.

Para el 1941X registrar por configuración:

- `bag_dimensions`
- `wet_mass_per_bag`
- `bag_count`
- `total_load_mass`
- `rack_configuration`
- `load_pattern`
- `cycle_elapsed_time`
- `operator_minutes`
- `propane_consumed`
- `cooldown_time`
- `thermal_validation_state`.

La capacidad semanal se deriva después de la validación:

`validated_bags_per_cycle × feasible_validated_cycles_per_week`

Luego debe compararse contra los demás cuellos de botella; no se programa producción únicamente desde esta cifra.

# Safety

- No operar el recipiente fuera de las instrucciones y límites del fabricante.
- No abrir con presión residual.
- No bloquear, sustituir ni alterar dispositivos de seguridad con componentes no aprobados.
- No fabricar o convertir recipientes artesanales en cámaras presurizadas para aumentar capacidad.
- No modificar válvulas, pesos, manómetros o venteos para alcanzar presiones no especificadas.
- Mantener la zona de trabajo estable, ventilada y apta para una fuente de calor a gas.
- Cualquier anomalía mecánica, fuga, daño del cierre o comportamiento de presión no explicado detiene el ensayo hasta revisión.

# Failure Interpretation

No usar el momento de detección como prueba automática de causa.

| Observación | Interpretación válida durante commissioning |
|---|---|
| Contaminación temprana | Puede originarse en materia prima, proceso térmico, enfriamiento, bolsa o inoculación; investigar trazabilidad |
| Bolsa deformada | Revisar material, contacto térmico, carga, presión/temperatura y especificación de bolsa |
| Curva térmica diferente entre ciclos | Revisar masa, humedad, geometría, fuente de calor, sensor y procedimiento |
| Presión nominal alcanzada, producto lento | Es evidencia de penetración térmica insuficientemente caracterizada, no de un ciclo validado |
| Bolsa centinela contaminada | Acota el problema a etapas anteriores a inoculación, pero no identifica por sí sola la causa raíz |

# Near-Term Roadmap

1. Verificar identidad y condición del 1941X.
2. Definir una sola configuración representativa del primer sustrato de shiitake.
3. Verificar sondas y sistema de registro.
4. Mapear distribución térmica.
5. Mapear penetración térmica y peor caso.
6. Repetir el estudio para caracterizar variabilidad.
7. Congelar una versión candidata de carga/ciclo solo cuando exista evidencia suficiente.
8. Medir bolsas/ciclo, propano/ciclo, minutos-operador/ciclo y tiempo total de ocupación.
9. Comparar la capacidad térmica validada con mezcla, embolsado, inoculación, incubación y fructificación antes de justificar nueva compra.

# Procurement Trigger for Additional Thermal Capacity

La compra de una segunda unidad o equipo mayor se justifica únicamente cuando:

- el 1941X está comisionado;
- su throughput validado es insuficiente para la cadencia aprobada;
- tratamiento térmico es el cuello de botella real, no solo uno aparente;
- se han considerado mejoras de programación/carga que no comprometan validación;
- la alternativa propuesta reduce costo, trabajo o riesgo de forma medible.

No usar umbrales arbitrarios como “20–30” o “>50 bolsas/semana” para activar compra sin el análisis completo.

# Open Questions

- ¿La placa física confirma `1941X` y coincide con la configuración actual del fabricante?
- ¿Cuál es la configuración de carga con peor distribución térmica?
- ¿Cuál es la posición y zona interna de bolsa con calentamiento más lento?
- ¿Cuántas bolsas reales caben en una carga reproducible sin comprometer circulación/penetración?
- ¿Cuál es el tiempo de ocupación total del equipo por ciclo, incluido calentamiento y enfriamiento?
- ¿Cuánto propano consume cada configuración?
- ¿Qué variabilidad existe entre ciclos nominalmente idénticos?
- ¿A qué throughput semanal validado el 1941X se convierte realmente en cuello de botella?

# References

- All American 1930. `1941X Sterilizer`, manufacturer product specification, accessed 2026-08-19.
- `../02_substrates/sterilization.md` — biological/process context.
- `../06_operations/operational_commissioning.md` — commissioning and thermal-study protocol.
- `../09_research/commissioning_validation_research.md` — evidence, transfer limits and research basis.
