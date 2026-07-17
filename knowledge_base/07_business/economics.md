---
title: Economía del Cultivo — Costos y Proyecciones
category: business
load_priority: on_request
last_reviewed: 2026-06-29
confidence: medium
primary_sources:
  - Internal records
  - Market research Colombia 2026
related_documents:
  - colombian_market.md
  - pricing.md
  - suppliers.md
  - 06_operations/production_schedule.md
---

# Executive Summary
Análisis de costos e ingresos proyectados para Setas de la Peña, Fase 1. Las proyecciones son conservadoras basadas en parámetros técnicos validados y precios de mercado colombiano. Requieren ajuste con datos reales del primer trimestre de producción.

# Core Principles
- Los números son estimaciones hasta que existan datos reales de campo.
- Costo variable por kg producido es el KPI financiero más importante en Fase 1.
- No escalar antes de validar rentabilidad en escala pequeña.

# Technical Details

## Inversión Inicial (Capex) — Ya Realizado

| Categoría | Costo (USD) |
|---|---|
| CLOUDLAB 844 | ~$280 |
| AC Infinity T7 | ~$150 |
| SHT3x ×2 + ESP32 ×3 + SCD30 ×2 + TICONN ×2 | ~$120 |
| H4 ×2 | ~$90 |
| Electrónica (PSU, relay, WAGO, etc.) | ~$130 |
| Martha Tent + H05 (prototipo) | ~$100 |
| **Total capex estimado** | **~$870** |

## Costos Variables por Lote (10 bloques, 1 kg sustrato seco c/u)

| Item | Cantidad | Precio Estimado | Costo Total |
|---|---|---|---|
| Paja de trigo | 10 kg seco | 3,000 COP/kg | 30,000 COP |
| Spawn P. djamor | 1.5 kg (15%) | 8,000 COP/kg | 12,000 COP |
| Yeso | 200 g | 1,500 COP/kg | 300 COP |
| Bolsas de cultivo | 10 unidades | 500 COP/u | 5,000 COP |
| Energía (humidificador, extractor, luces) | ~30 kWh/ciclo | 700 COP/kWh | 21,000 COP |
| Mano de obra cuidador (4h/semana × 8 semanas) | 32h | 8,000 COP/h | 256,000 COP |
| **Total costo variable por lote** | | | **~324,000 COP** |

*Nota: Costo MO es estimado; depende de acuerdo laboral con cuidador.*

## Proyección de Ingresos por Lote

| Escenario | BE | Yield (10 bloques) | Precio/kg | Ingreso bruto |
|---|---|---|---|---|
| Conservador | 70% | 7 kg | 18,000 COP | 126,000 COP |
| Base | 85% | 8.5 kg | 20,000 COP | 170,000 COP |
| Optimista | 100% | 10 kg | 22,000 COP | 220,000 COP |

**Resultado escenario base: 170,000 − 324,000 = −154,000 COP por lote** (negativo en Fase 1 por MO + amortización).

## Camino a Rentabilidad

La rentabilidad en Fase 1 depende de:
1. **Reducir costo MO** (automatización reduce supervisión activa).
2. **Escalar volumen** (costos fijos se diluyen con más módulos).
3. **Precio premium** (restaurantes, mercado gourmet vs. minorista).
4. **Reducir desperdicio** (BE alta, baja contaminación).

### Con 4 módulos simultáneos (escala moderada):
- Yield semanal: ~15–20 kg
- Costo variable/semana: ~150,000 COP (economías de escala)
- Ingreso bruto/semana: 300,000–400,000 COP
- **Margen positivo posible a partir de ~3–4 módulos activos**

## Precios de Referencia — Colombia 2026

| Canal | Precio P. djamor | Notas |
|---|---|---|
| Minorista (plaza/mercado) | 12,000–15,000 COP/kg | Competido, bajo margen |
| Supermercado | 18,000–25,000 COP/kg | Requiere presentación y volumen |
| Restaurante gourmet | 22,000–35,000 COP/kg | Mejor margen; requiere consistencia |
| Venta directa (delivery/domicilio) | 20,000–28,000 COP/kg | Sin intermediario |
| Deshidratado | 80,000–150,000 COP/kg | Alto valor añadido |

*Tasas de cambio aproximadas: 1 USD ≈ 4,200 COP (junio 2026)*

# Best Practices
- Buscar primero canal de restaurantes para precio premium antes de producir.
- Calcular BE y costo/kg real después de cada lote y comparar con proyecciones.
- No invertir en más capex antes de validar modelo financiero en los primeros 2–3 lotes.

# Common Failure Modes
- Producir sin cliente asegurado → producto perecedero sin salida.
- Precio muy bajo para ganar clientes → margen insostenible.
- Subestimar costo de mano de obra → P&L irreal.

# Open Questions
- ¿Precio real de spawn de P. djamor en Cundinamarca?
- ¿Precio real de paja de trigo en Tenjo o municipios cercanos?
- ¿Restaurantes o tiendas gourmet en Bogotá interesados? (Investigar)

# References
- Internal records Setas de la Peña.
- Dane. Precios insumos agropecuarios Colombia 2026.
