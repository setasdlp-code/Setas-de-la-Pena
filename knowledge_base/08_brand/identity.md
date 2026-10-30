---
title: Identidad de Marca — Setas de la Peña
document_id: DOC-0038
category: brand
load_priority: on_request
last_reviewed: 2026-10-30
confidence: high
primary_sources:
  - docs/brand-guidelines.md (Identidad comercial v1.1, 12 y 27 oct 2026)
  - .claude/brand-voice-guidelines.md (Guía de voz v2.2)
  - 08_brand/ds-2026/DESIGN_SYSTEM.md
related_documents:
  - illustration_style.md
  - packaging.md
  - 07_business/colombian_market.md
---

# Executive Summary
Resumen de la identidad comercial vigente de Setas de la Peña para agentes y consultas rápidas. **La fuente de autoridad es [`docs/brand-guidelines.md`](../../docs/brand-guidelines.md)**; este documento la resume y no la sustituye. Ante cualquier diferencia, prevalece la guía.

La versión anterior de este archivo (julio de 2026) proponía otra paleta, Playfair/Inter, el tagline «Cultivadas en la Sabana. Cosechadas con criterio» y generación de identidad con herramientas de imagen. Todo ello queda reemplazado. Ver [auditoría de marca, oct 2026](../../docs/brand/brand-audit-2026-10.md), P2-2.

# Core Principles

## Posicionamiento
**Hongos para cocinar con criterio.** Setas de la Peña acerca el mundo de los hongos a la cocina desde Tenjo, Cundinamarca: ayuda a reconocer una especie, imaginar una preparación con ingredientes cercanos y reunir una consulta comercial. El origen y el proceso se cuentan con información comprobable.

No es:
- Una marca mística o *new age* de hongos.
- Un productor industrial ni un proveedor con abastecimiento regular confirmado.
- Una marca de promesas medicinales.

Es:
- Un proyecto de cultivo técnico, con parámetros y registros.
- Un interlocutor preciso para chefs; también para hogares.
- Una sola marca. «Las setas», «En la cocina», «Origen» y «El cuaderno» son secciones, no submarcas. Setas OS es el ámbito operativo.

## Valores

| Valor | Expresión |
|---|---|
| Rigor técnico | Parámetros y registros por lote; vocabulario técnico solo cuando ayuda. |
| Origen | Tenjo · Cundinamarca · Colombia, como dato, nunca como folclore. |
| Calidad verificable | Una afirmación sobre la cosecha necesita su dato (fecha, lote, peso). |
| Transparencia | Precio y disponibilidad se marcan como pendientes hasta confirmarse. |
| Escala humana | Supervisión directa de cada lote. |

# Technical Details

## Nombre y mensajes

| Pieza | Texto | Uso |
|---|---|---|
| Nombre | **Setas de la Peña** | Con ñ y tilde. Sin abreviar a «SdP» en piezas comerciales. |
| Frase principal | **Del micelio a la mesa.** | Portadas, presentación y cierre. |
| Descriptor | **Hongos para cocinar con criterio.** | Presentación comercial y materiales para cocina. |
| Titular de entrada | **Conocer la seta. Imaginar el plato.** | Campañas; subordinado a la frase principal. |
| Firma territorial | **Tenjo · Cundinamarca · Colombia** | Origen del proyecto, no garantía de origen de cada lote. No usar «Valle de Tenjo» ni «Sabana de Bogotá» como firma. |
| Expresión de oficio | **Cultivar. Observar. Aprender.** | Sección de proceso. |

## Firma
«Setas» en Gaya Bold + «de la Peña» en Gaya Medium, horizontal o apilada, en musgo sobre papel, tinta a una tinta o papel sobre musgo. SVG en `08_brand/ds-2026/brand-kit/assets/`. No se usa un isotipo que sustituya el nombre. La licencia comercial de Gaya está **pendiente de confirmar** antes de producción o distribución.

## Color (DS-2026)

| Token | Hex | Función |
|---|---|---|
| `paper-100` | `#FAF8F3` | Fondo principal |
| `paper-50` | `#FEFDFB` | Superficie clara y firma inversa |
| `ink-900` | `#1A1410` | Texto y firma a una tinta |
| `moss-700` | `#2E3B2F` | Firma y acción principal |
| `coral-500` | `#B8614D` | Acento gráfico; no texto pequeño |
| `coral-700` | `#8A3E2D` | Texto de acento sobre papel |
| `slate-500` | `#4E6A7A` | Acento secundario y datos |

Papel y tinta dominan; el musgo identifica; el coral es puntual. Las paletas FOS (`08_brand/field-os-identity/`) son del ámbito operativo, no comercial.

## Tipografía

| Familia | Función |
|---|---|
| Gaya Patched | Firma, titulares y especie; itálica para el nombre científico |
| IBM Plex Sans | Lectura, navegación, instrucciones y acciones |
| IBM Plex Mono | Cantidades, códigos y rótulos breves; no párrafos |

Entrada única para piezas comerciales: `08_brand/ds-2026/market.css`.

## Imagen
- **Especie:** grabado micológico o lámina, silueta completa, nombre común primero y científico en itálica.
- **Cocina:** gouache con lápiz, plato completo e ingredientes reconocibles.
- **Fotografía:** propia y excepcional, como evidencia con fecha y contexto. Sin stock que simule la finca o la cosecha.
- Superficies planas, bordes rectos, sin sombras, degradados decorativos ni sellos inventados.

## Voz
- Cercana, cuidadosa y precisa. Primera persona del plural para la marca («cultivamos»).
- **Sin tuteo ni ustedeo**: frases centradas en el producto y acciones en infinitivo («Consultar disponibilidad», «Retirar el laurel y colar»).
- Sin exclamaciones, superlativos («premium», «el mejor», «único»), misticismo ni promesas medicinales.
- Nombre común primero; latín en cursiva, una vez.
- Detalle completo en `.claude/brand-voice-guidelines.md`.

## Audiencias

| Segmento | Qué busca | Lenguaje |
|---|---|---|
| Chef / equipo de cocina | Uso del ingrediente; cantidad, presentación, fecha y entrega | Técnico-culinario; la conversación empieza en el plato |
| Hogar | Especie → receta → cantidad → consulta | Pasos accesibles, ingredientes disponibles en Colombia |
| Interés en salud funcional | Información sobre especies como melena de león | Solo evidencia; cualquier línea funcional requiere revisión regulatoria (INVIMA) antes de redactar |

# Best Practices
- Generar piezas desde el kit de `08_brand/ds-2026/`, no recrear la identidad en cada pieza.
- No inventar pesos, lotes, precios, teléfonos ni QR en maquetas.
- Una ilustración no demuestra producto disponible.
- Empaque y etiqueta comunican fecha de cosecha y lote cuando existan datos reales.

# Open Questions
- Licencia comercial de Gaya, o redibujo de la firma como logotipo propio.
- Sello de escala pequeña para favicon, avatar y etiqueta (conceptos en la auditoría de oct 2026, pendientes de elección).
- ¿Existe en Colombia una marca de setas con nombre similar? (búsqueda marcaria no realizada).

# References
- [Identidad comercial v1.1](../../docs/brand-guidelines.md)
- [Guía de voz v2.2](../../.claude/brand-voice-guidelines.md)
- [DS-2026](../../08_brand/ds-2026/DESIGN_SYSTEM.md)
- [Auditoría de marca, oct 2026](../../docs/brand/brand-audit-2026-10.md)
