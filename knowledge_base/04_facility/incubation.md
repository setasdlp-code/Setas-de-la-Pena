---
title: Zona de Incubación — Setup y Operación
category: facility
load_priority: selective
last_reviewed: 2026-08-23
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - Rodríguez Valencia & Jaramillo López 2005 (Cenicafé — paper_006)
  - 09_research/incubation_fruiting_chambers_2026.md
related_documents:
  - fruiting.md
  - master_blueprint.md
  - 02_substrates/contamination.md
---

# Executive Summary
La zona de incubación mantiene los bloques inoculados a temperatura óptima para spawn run. Debe estar separada de la zona de fructificación para control de temperatura independiente. En Tenjo (~15–18°C ambiente), puede ser necesario calefacción leve para alcanzar los 20–24°C requeridos por Pleurotus.

# Core Principles
- T° de incubación según especie: 20–24°C para varias especies; *P. djamor* y *G. lucidum* pueden requerir más. Controlar la temperatura del bloque y revisar cualquier aproximación al límite específico.
- Medir aire y centro de bloques testigo: el calor metabólico puede elevar el sustrato aunque el cuarto esté en rango.
- Oscuridad total no es requisito universal; evitar radiación solar, calentamiento y señales prematuras de fructificación. Usar luz tenue para inspección.
- Las bolsas con filtro intercambian gases. La sala no requiere el FAE de fructificación, pero necesita retirar calor y mantener condiciones seguras.
- Inspección visual cada 48h para detectar contaminación temprana.

# Technical Details

## Parámetros de Incubación por Especie

| Especie | T° Óptima | Duración Estimada | HR Ambiente |
|---|---|---|---|
| P. djamor | 24–28°C | 10–18 días | 70% (bolsa sellada) |
| P. ostreatus | 20–24°C | 10–18 días | 70% |
| H. erinaceus | 20–24°C | 14–21 días | 70% |
| L. edodes | 20–24°C | **60–120 días** | 70% |
| G. lucidum | 24–28°C | 30–60 días | 70% |

## Setup Básico de Incubación (Sin Equipo Especializado)

Para Tenjo con temperatura ambiente 14–18°C:
1. Cuarto interior (sin corrientes de aire exterior).
2. Estantes de metal o madera — bolsas no deben estar en el piso.
3. Calefacción leve si T° <20°C: calefactor cerámico PTC con termostato.
4. Termómetro digital con registro mínimo.
5. Control de luz: evitar sol directo y calentamiento; permitir luz tenue durante inspección.

## Temperatura del Bloque y Densidad de Carga

La temperatura de aire no representa necesariamente la temperatura interna del sustrato. Durante el primer lote y cada cambio de formulación, masa de bolsa o densidad:

1. Colocar una sonda limpia en el centro de bloques testigo no destinados a venta.
2. Medir simultáneamente aire en entrada, centro y zona más cargada durante 48–72 h.
3. Registrar `ΔT = T_bloque − T_aire`, el máximo y su duración.
4. Separar o reducir carga si el bloque se acerca al límite de la especie, aunque el aire permanezca en rango.
5. Repetir el mapeo si cambian estanterías, calefacción, ventilación o tamaño de lote.

No existe todavía un ΔT universal validado para Setas de la Peña. Ver síntesis y protocolo de commissioning en `09_research/incubation_fruiting_chambers_2026.md`.

## Dimensionamiento y Acondicionamiento del Cuarto (Cenicafé)

- **Densidad de carga:** Cenicafé reporta ~**1 m³ de cuarto por cada 3,7 kg de sustrato** para cuartos específicos sin aislamiento térmico. Es referencia histórica, no regla universal; validar capacidad local por ΔT, acceso sanitario y contaminación.
- **Desinfección histórica:** Cenicafé documentó formol comercial al 0,3% y CaCO₃ en piso/anaqueles. No se adopta como SOP actual por el peligro del formaldehído; cualquier uso requeriría evaluación formal de SST, ventilación, EPP, etiquetado y normativa colombiana. Preferir limpieza física y un desinfectante autorizado con concentración y tiempo de contacto validados.
- **Cobertura por clima (plástico), para climas fríos 12–18°C como Tenjo:** salones de incubación en plástico **negro** y salones de fructificación en plástico **transparente**. En zonas cálidas (>23°C) se invierte el criterio (plástico blanco reflectante + capa de pasto seco en techo).
- **Separar incubación de fructificación:** no todo el material alcanza condiciones de fructificación al mismo tiempo; no mezclar géneros distintos en un mismo cuarto.

## Señales de Progreso Normal

| Visual | Interpretación |
|---|---|
| Micelio blanco expandiéndose desde punto de inoculación | Normal ✅ |
| Micelio amarillo limón / dorado | Estrés (temperatura, humedad) — no contaminación |
| Condensación interior de bolsa | Normal — metabólicamente activo |
| Olor a champiñón, tierra fresca | Normal ✅ |
| Bloques se calientan ligeramente | Normal — micelio genera calor metabólico |
| Verde, negro, rosa en interior | Contaminación 🔴 |
| Olor agrio, fétido | Contaminación bacteriana 🔴 |

## Protocolo de Inspección (Cada 48h)

```
1. Sin abrir bolsas — inspección solo visual y olfativa.
2. Verificar expansión de micelio blanco (marcador con plumón en bolsa).
3. Buscar manchas de color diferente a blanco/crema.
4. Si se detecta contaminación: aislar y sacar de zona.
5. Registrar en bitácora: % colonización estimado, observaciones.
```

# Best Practices
- Mantener temperatura lo más constante posible — fluctuaciones >3°C ralentizan colonización.
- No apilar bolsas demasiado juntas — el calor metabólico puede crear puntos calientes.
- Separar físicamente bloques de diferentes especies si tienen T° óptima diferente.
- Definir capacidad útil por desempeño térmico con carga real, no por número de bolsas que caben geométricamente.
- Mantener acceso visual y espacio para retirar una bolsa contaminada sin mover el lote completo.

# Common Failure Modes
| Problema | Causa | Solución |
|---|---|---|
| Colonización muy lenta | T° <20°C | Calefacción suave |
| Bolsas se calientan en exceso | Demasiado apiladas, T° ambiente alta | Separar bolsas; ventilación pasiva |
| Contaminación generalizada | Problema en pasteurización/esterilización | Revisar proceso de tratamiento |
| Micelio se detiene a 50% colonización | Temperatura irregular o sustrato muy húmedo | Estabilizar T°; verificar FC inicial |

# Open Questions
- ¿Calefactor PTC o manta calefactora para incubación a pequeña escala?
- ¿Temperatura mínima real nocturna del cuarto de incubación en Tenjo?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Rodríguez Valencia, N. & Jaramillo López, C. (2005). *Cultivo de hongos medicinales en residuos agrícolas de la zona cafetera*. Cenicafé/FNC, Chinchiná, Caldas. [paper_006]
