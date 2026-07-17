---
title: Blueprint General de la Instalación
category: facility
load_priority: selective
last_reviewed: 2026-06-29
confidence: medium
primary_sources:
  - Internal design
  - Stamets 2000
  - Cotter 2014
related_documents:
  - laboratory.md
  - incubation.md
  - fruiting.md
  - workflow.md
  - home_rnd_lab.md
  - 05_equipment/environmental_control.md
---

# Executive Summary
Diseño modular de la instalación de Setas de la Peña en Tenjo. La filosofía es construir por fases: primero la cámara de fructificación (CLOUDLAB 844), luego expandir con recinto climatizado y laboratorio. Cada zona es independiente para minimizar contaminación cruzada.

# Core Principles
- Flujo unidireccional: sustrato preparado → inoculación → incubación → fructificación → cosecha → almacenamiento.
- Zonas separadas para "sucio" (preparación sustrato) y "limpio" (inoculación, incubación).
- Presión positiva de aire en zona limpia (filtrado).
- Cada módulo de fructificación es autónomo.

# Technical Details

## Zonas de la Instalación

### Zona 1: Preparación de Sustrato (Sucio)
- Actividades: hidratación paja, pasteurización, enfriamiento
- Equipos: olla/tanque pasteurización, área de escurrido
- Requiere: fuente de agua, desagüe, calor
- Separación física de zona limpia: obligatoria

### Zona 2: Inoculación (Limpio)
- Actividades: mezcla spawn + sustrato, sellado de bolsas
- Equipos: LAF (Fase 2) o cámara improvisada con HEPA
- Requiere: superficies desinfectables, alcohol, guantes, mascarilla
- Presión positiva: deseable

### Zona 3: Incubación
- Actividades: spawn run (colonización)
- Equipos: estanterías, termómetro, oscuridad o luz mínima
- T° objetivo: 20–24°C (según especie)
- Separada de fruiting para control de T° independiente

### Zona 4: Fructificación
- Actividades: fruiting, pinning, cosecha
- Equipos: CLOUDLAB 844, T7, H4, ESP32/ESPHome, sensores
- Control ambiental automatizado: HR, T°, CO₂, FAE, luz
- Estado actual de Martha Tent: verificación de campo requerida

### Zona 5: Almacenamiento y Procesamiento
- Actividades: pesaje, limpieza, refrigeración, empaque
- Equipos: refrigerador, balanza, empacadora al vacío (futuro)

## Secuencia de Implementación

| Fase | Zonas | Estado |
|---|---|---|
| Verificación actual | Inventario de todas las zonas | Pendiente |
| Fase 0 | Zona 4 (Martha Tent) | Último reporte activo; verificar |
| Fase 1 | Zona 4 (CLOUDLAB 844) + Zona 1–2 básicas | Diseño; ejecución por verificar |
| Fase 2 | Recinto PIR/PUR + Zona 3 independiente | Pendiente |
| Fase 3 | Laboratorio (Zona 2 profesional + agar + LAF) | Largo plazo |

## Recinto Principal — Especificaciones Preliminares

**Tipo:** PIR/PUR (poliisocianurato) o equivalente
**Dimensiones objetivo:** ~2.5 × 2.5 × 2.2 m
**Contenido:** 1–2 CLOUDLAB 844 + sistema de automatización
**Aislamiento:** R-value suficiente para mantener T° ± 2°C del exterior en Tenjo
**Ventilación:** Intake con filtro MERV-13 + exhaust H4
**Proveedor a cotizar:** FrigoMaster (Bogotá)

## Flujo de Trabajo Simplificado
```
Paja/Sustrato → Pasteurizar → Enfriar → Inocular → Bolsas a Incubación
                                                           ↓
                                              Bloque colonizado → Cámara Fruiting
                                                                        ↓
                                                              Pinning → Cosecha → Almacenamiento
```

# Best Practices
- No llevar materiales de zona sucia (paja sin pasteurizar, tierra) a zona limpia.
- Tener calzado dedicado para zona de fructificación.
- Limpiar la zona de fructificación entre flushes y entre lotes diferentes.

# Common Failure Modes
- Mezclar zonas sucias y limpias → contaminación sistemática.
- No tener zona de incubación separada → temperatura fruiting afecta spawn run.

# Open Questions
- Cotización y lead time de recinto PIR/PUR FrigoMaster.
- ¿Espacio físico disponible en Tenjo para recinto 2.5×2.5m?
- ¿Fuente eléctrica suficiente para CLOUDLAB 844 + automatización?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
