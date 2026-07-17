---
title: Flujo Laminar (LAF) — Cabina de Siembra
category: equipment
load_priority: selective
last_reviewed: 2026-06-29
confidence: high
primary_sources:
  - Stamets (2000)
  - Internal records
related_documents:
  - autoclaves.md
  - ../04_facility/laboratory.md
  - ../03_spawn/agar.md
---

# Executive Summary
El flujo laminar (LAF — Laminar Air Flow hood) es un equipamiento de evolución operativa que mejora la productividad, reproducibilidad y control de contaminación en trabajos de laboratorio. Agar work, tissue cloning y spawning pueden iniciarse con un Still Air Box (SAB) optimizado. Laminar flow representa el siguiente paso en la madurez de capacidad de laboratorio.

# Core Principles
- LAF no es prerequisito para comenzar agar work — el SAB optimizado es el punto de partida.
- LAF mejora la tasa de éxito y escala la capacidad de laboratorio una vez que la técnica aséptica ha sido validada bajo disciplina SAB.
- LAF no reemplaza la asepsia: el técnico también debe usar EPP, alcohol 70%, mechero.
- DIY LAF es viable con presupuesto limitado (~$100–200 USD en materiales).
- Referencia: CANON, sección 5 — Laboratory Philosophy.

# Technical Details

## Tipos de Flujo Laminar

| Tipo | Flujo | Protege | Uso en Setas |
|---|---|---|---|
| Horizontal (HLF) | Hacia el operador | El cultivo | Trabajo con agar y spawn — uso principal |
| Vertical (VLF) | Hacia abajo | El cultivo + operador | Mayor protección; más costoso |
| Cámara de flujo (HEPA Box) | Contenida | El cultivo | Opción DIY — más económica |

**Para Setas de la Peña:** Flujo horizontal o cámara HEPA — suficiente para trabajo axénico de hongos.

## Especificaciones Técnicas Mínimas

| Parámetro | Valor mínimo | Recomendado |
|---|---|---|
| Filtro HEPA | H13 (99.95% partículas ≥0.3μm) | H14 |
| Velocidad de flujo | 0.45 m/s | 0.45–0.54 m/s |
| Pre-filtro | Sí (G4 o F5) | Obligatorio — extiende vida del HEPA |
| Luz UV | Opcional | Útil para descontaminación de superficie |
| Enchufe | 110V o 220V | Verificar instalación Tenjo |

## DIY LAF — Opción Económica Fase 2

**Materiales necesarios:**
- Caja de madera o PVC (50×60×30 cm mínimo)
- Ventilador centrífugo 120V / 110CFM mínimo
- Filtro HEPA H13 (panel de tamaño adecuado)
- Pre-filtro de espuma de poliuretano
- Luz UV 254nm (germicida — 8W suficiente)
- Sellante de silicona para juntas

**Costo estimado DIY:** $100–200 USD en materiales
**Costo LAF comercial básico:** $300–600 USD importado

**Referencia:** Múltiples cultivadores han documentado DIY LAF funcionales en Shroomery y foros especializados. Validar construcción con prueba de partículas o test de agar expuesto.

## Protocolo de Uso

### Antes de usar
1. Encender LAF al menos 15–30 min antes de trabajar (estabilizar flujo).
2. Encender UV 15–20 min (si disponible) → apagar antes de trabajar (riesgo ocular).
3. Limpiar superficie de trabajo con alcohol 70% — esperar evaporación.
4. Colocar todo el material dentro del campo de flujo antes de empezar.

### Durante el trabajo
1. Todos los movimientos van de atrás hacia adelante (nunca cruzar entre el filtro y el cultivo).
2. Flamear el asa o aguja entre cada transferencia.
3. Abrir recipientes en ángulo, nunca hacia arriba.
4. No hablar, no toser, no estornudar hacia el campo de trabajo.

### Después
1. Limpiar superficie con alcohol 70%.
2. Apagar ventilador.
3. Dejar la cabina cubierta o cerrada.

## Test de Validación DIY LAF

Para verificar que el LAF funciona correctamente:
1. Preparar 3 cajas Petri con MEA (Malt Extract Agar).
2. Abrir las cajas Petri dentro del LAF durante 30 min sin tocarlas.
3. Incubar las cajas 5–7 días a temperatura ambiente.
4. **Resultado esperado:** 0 colonias en las 3 cajas = LAF funcional.
5. Si hay contaminación: revisar juntas, velocidad de flujo, integridad del HEPA.

## Estrategia de Transición

**Current Implementation:**
Still Air Box (SAB) optimizado con protocolo de asepsia validado. Agar work y tissue cloning bajo disciplina de cambios de aire mínimos y movimientos controlados.

**Near-Term Roadmap:**
1. Validar técnica SAB con tasa de éxito >90% en 5+ transferencias consecutivas.
2. Construir DIY LAF con HEPA H13 + ventilador centrífugo cuando la capacidad SAB sea estable.
3. Validar construcción DIY LAF con test de Petri.
4. Transferir operaciones de inoculación de grano y trabajo con agar a LAF.

**Long-Term Architecture:**
- Evaluación de LAF comercial si volumen de trabajo supera 10h/semana.
- Integración LAF con sistema de cultivo de larga duración — library preservation.

# Best Practices
- El pre-filtro es tan importante como el HEPA — protege la vida útil del HEPA.
- Cambiar pre-filtro cada 6 meses (o cuando se vea visualmente saturado).
- El HEPA dura 2–5 años con pre-filtro → sin pre-filtro puede durar meses.
- Registrar fecha de instalación del HEPA en la caja.

# Common Failure Modes
- Juntas mal selladas entre ventilador, pre-filtro y HEPA → contamina el flujo.
- Trabajar sin calentamiento previo → flujo turbulento en los primeros minutos.
- UV encendida durante el trabajo → daño ocular y mutaciones en cultivos.
- Movimientos bruscos dentro del campo → disrumpen el flujo laminar.

# Open Questions
- ¿Disponibilidad de filtros HEPA H13 en panel en Colombia?
- ¿Ventilador centrífugo de 110V / 110 CFM disponible en MercadoLibre Colombia?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*, Cap. 4 — Laboratory Equipment.
- Ver también: `04_facility/laboratory.md` y `03_spawn/agar.md`
