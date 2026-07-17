---
title: Principios Operacionales — Setas de la Peña
category: project
load_priority: selective
last_reviewed: 2026-06-29
confidence: high
primary_sources:
  - Internal definition
  - Stamets 2000
  - Cotter 2014
related_documents:
  - mission.md
  - 06_operations/quality_control.md
---

# Executive Summary
Principios no negociables que rigen todas las decisiones técnicas, operacionales y de comunicación en Setas de la Peña.

# Core Principles

## 1. Evidencia Antes de Aplicar
Toda práctica de cultivo debe respaldarse en fuentes Tier 1 (papers científicos, estudios) o Tier 2 (libros técnicos reconocidos, fabricantes, Cornell, NAMA) antes de implementarse en producción.

## 2. Modularidad y Escalabilidad
Cada Martha Tent / cámara de fructificación es un módulo autónomo. El diseño permite agregar unidades sin rediseñar el sistema. Una falla en un módulo no afecta los demás.

## 3. Automatización como Redundancia, no como Reemplazo
El ESP32 controla condiciones localmente aunque HA o la red fallen. HA es supervisión, no control crítico. El cuidador puede intervenir manualmente en cualquier momento.

## 4. Registro y Trazabilidad
Todo lote tiene: especie, fecha inoculación, receta de sustrato, número de módulo. Sin trazabilidad, no hay aprendizaje ni control de calidad.

## 5. Registro Técnico-Agrónomo
Lenguaje preciso y técnico en todos los documentos. Sin términos místicos, espirituales ni ambiguos. Los hongos son organismos con parámetros medibles.

## 6. Banco de Pruebas Antes de Producción
Ningún componente nuevo (sensor, actuador, sustrato, especie) entra a producción sin validación previa en banco de pruebas o prototipo.

## 7. Fuente de Verdad Técnica
Claude (Cowork, MCP Setas de la Peña) es la fuente de verdad para datos técnicos. ChatGPT es el motor creativo y de marketing. Las dos fuentes no deben contradecirse — si lo hacen, la fuente técnica tiene prioridad.

# Technical Details

## Jerarquía de Fuentes (Tier System)

| Tier | Tipo | Ejemplos |
|---|---|---|
| Tier 1 | Papers científicos peer-reviewed | ResearchGate, PubMed, journals micología |
| Tier 2 | Libros técnicos / instituciones reconocidas | Stamets, Cotter, Cornell, NAMA, Field & Forest |
| Tier 3 | Cultivadores experimentados con datos | Shroomery, cultivadores documentados |
| ❌ | Anécdotas sin datos | Foros sin fuente, YouTube sin referencias |

Antes de dar información como verdad operacional: verificar tier.

# Best Practices
- Documentar toda variación respecto a protocolo estándar con razón y resultado.
- Revisar parámetros activos al menos 1 vez al día en HA dashboard.
- Comparar sensores cruzados (SHT3x vs Inkbird) semanalmente.

# Common Failure Modes
- Saltarse el tier system bajo presión de tiempo → errores costosos.
- No documentar excepciones → el mismo error se repite.
- Confundir correlación con causalidad en observaciones de campo.

# Open Questions
- ¿Cómo estructurar el sistema de trazabilidad de lotes a escala (>10 módulos)?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
