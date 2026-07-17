---
title: Esterilización de Sustratos
category: substrates
load_priority: selective
last_reviewed: 2026-07-04
confidence: high
primary_sources:
  - Stamets 2000
  - Cotter 2014
  - Zied & Pardo-Giménez 2017
  - Rodríguez Valencia & Jaramillo López 2005 (Cenicafé — paper_006, ruta atmosférica)
related_documents:
  - pasteurization.md
  - supplementation.md
  - contamination.md
  - 05_equipment/autoclaves.md
---

# Executive Summary
La esterilización elimina toda forma de vida microbiana (incluyendo esporas). Es obligatoria para sustratos altamente suplementados (Master's Mix, salvado >10%) y para cultivos de Lion's Mane y Shiitake. Requiere autoclave o olla de presión. Proceso más complejo y costoso que pasteurización pero necesario para BE alta y sustratos enriquecidos.

# Research Consensus

## Esterilización vs. Pasteurización en Sustratos Suplementados
**Consensus**
Supported by:
- Stamets 2000
- Cotter 2014
- Zied 2017
- Field & Forest Products

Sustratos con suplementación nitrogenada >10% requieren esterilización a 121°C. Pasteurización de Master's Mix produce tasas de contaminación >60%.
**Strength of evidence:** ★★★★★
**Conflicting evidence:** Ninguno en sustratos altamente suplementados.

# Core Principles
- **Condición de esterilización:** 121°C, 15 psi, 2–4 horas (dependiendo del volumen).
- Solo equipos con control de presión (autoclave o olla de presión calibrada) garantizan 121°C.
- Después de esterilización: terreno completamente limpio. La inoculación debe ser aséptica.
- El tiempo de esterilización aumenta con el volumen: bolsas de 2 kg = 2h; 5 kg = 3–4h.

# Technical Details

## Parámetros de Esterilización

| Parámetro | Valor |
|---|---|
| Temperatura | **121°C** |
| Presión | **15 psi (1 atm sobre presión atmosférica)** |
| Tiempo mínimo | 2 h (bolsas <2.5 kg) |
| Tiempo estándar | 2.5–3 h (bolsas 2.5–5 kg) |
| Tiempo para bloques grandes | 3–4 h (bloques >5 kg) |

⚠️ En Tenjo (2600 m s.n.m.) el agua hierve a ~92°C en lugar de 100°C. La olla de presión compensa esto: **15 psi sobre presión local** sigue alcanzando 121°C. No ajustar la presión por altitud.

## Equipos para Esterilización

### 1. Autoclave de Laboratorio
- Control preciso de T° y presión.
- Capacidad: 20–100 L típico.
- Costo: US$300–2,000 (nuevos), menos de segunda mano.
- Para Setas de la Peña: inversión para Fase 2 (cuando se produzca Shiitake/Lion's Mane).

### 2. Olla de Presión Doméstica (Presto / All-American)
- 23–41 qt (21–39 L) — suficiente para 3–6 bolsas de 1 kg.
- All-American 921 (21 qt) = referencia en comunidad cultivadora.
- Costo: US$150–400.
- Requiere válvula de peso; no de jiggle-top para control exacto.
- **Limitación:** Solo para volúmenes pequeños y sustratos en bolsas medianas.

### 3. Modificación de Olla Grande + Olla de Presión (Hack económico)
- Olla grande de acero = cámara de vapor a presión casera.
- Técnica documentada en comunidad cultivadora para escalar sin autoclave industrial.
- Requiere adaptaciones de soldadura y válvula de seguridad.
- Costo: US$50–150. Riesgo: presión no controlada con precisión.

### 4. Vapor a Presión Atmosférica (ruta artesanal de bajo capex) — validar antes de usar
*Fuente: Rodríguez Valencia & Jaramillo López 2005 (Cenicafé/FNC — paper_006).*

Vapor fluente en olla/recipiente metálico **sin presión**, manteniendo el sustrato sobre una parrilla por encima del agua durante **5 horas contadas desde que el termómetro marca la temperatura de ebullición local** (~91°C a 2.600 m; Cenicafé usó 94,5°C en zona cafetera). Cenicafé produjo shiitake y ganoderma comerciales con este método usando ollas de ~190 L (hasta 60 kg de sustrato, 25 L de agua).

⚠️ **Esto NO es esterilización real:** a presión atmosférica no se destruyen esporas termorresistentes. Es una **pasteurización intensa prolongada**. Riesgos documentados por la propia fuente: contaminación visible ~día 8 y aparición de *Neurospora* si el sustrato queda dentro del esterilizador tras el tratamiento.

- **Estado:** *Supported Hypothesis* — no adoptar para Master's Mix ni sustratos suplementados >10% N sin banco de pruebas en Tenjo con tasa de contaminación medida.
- **Ventaja:** capex mínimo (sin autoclave ni olla a presión), escala grande.
- **Cuándo considerar:** sustratos de café / lignocelulósicos de menor suplementación; nunca como sustituto del estándar 121°C para sustratos altamente enriquecidos.

## Protocolo de Esterilización

```
1. Preparar sustrato a FC (65%) en bolsas de polipropileno de alta temperatura.
   - NO usar bolsas de polietileno regular → se derriten.
2. Sellar bolsas con filtro de microporo o tyvek + tape.
3. Cargar autoclave/olla sin amontonar (vapor debe circular).
4. Llevar a 15 psi. Mantener 2–3h según volumen.
5. Apagar calor. Dejar enfriar DENTRO del autoclave sin abrir.
   - Tiempo de enfriamiento: 2–4h según carga.
6. Extraer bolsas cuando <50°C. Dejar enfriar a temperatura ambiente.
7. Inocular en flujo laminar o área de inoculación limpia (ver laboratorio.md).
```

## Bolsas para Esterilización
| Tipo | Material | Temperatura Máx | Uso |
|---|---|---|---|
| Polipropileno (PP) | PP | 130–135°C | **Correcto** para autoclave |
| Con filtro de microporo | PP | 130°C | Ideal — permite respiración |
| Polyethylene (PE) | PE | 80–90°C | **Incorrecto** — se derrite en autoclave |
| Mason jars | Vidrio | 150°C+ | Válido para volúmenes pequeños |

# Best Practices
- Usar bolsas PP de alta temperatura con filtro — evitan contaminación post-esterilización.
- Nunca abrir el autoclave con presión residual — riesgo de explosión de vapor.
- Marcar bolsas con fecha y contenido antes de esterilizar.
- Si se usa olla de presión: colocar rejilla en el fondo (bolsas no deben tocar agua directamente).

# Common Failure Modes
| Fallo | Causa | Solución |
|---|---|---|
| Sustrato no llega a 121°C | Olla a nivel del mar: ok. A 2600m: verificar psi en gauge | Usar gauge de presión calibrado |
| Contaminación post-esterilización | Inoculación en área no limpia | Mejorar protocolo de inoculación (flujo laminar) |
| Bolsas se derriten | Uso de PE en vez de PP | Comprar bolsas PP específicas para autoclave |
| Tiempo insuficiente (< 2h) | Bloques grandes no esterilizan por completo | Aumentar tiempo según volumen |

# Open Questions
- ¿Proveedor de bolsas PP con filtro microporo en Colombia?
- ¿All-American 921 disponible en Colombia o necesita importar?
- Prioridad para adquirir autoclave: ¿después del CLOUDLAB 844 o simultáneo?

# References
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press. pp. 63–75.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Zied, D.C. & Pardo-Giménez, A. (2017). *Edible and Medicinal Mushrooms*. Wiley-Blackwell.
