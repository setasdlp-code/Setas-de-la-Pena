---
title: Modelo de Negocio — Canvas y Unit Economics
category: business
load_priority: on_request
last_reviewed: 2026-08-25
confidence: medium
primary_sources:
  - economics.md
  - pricing.md
  - suppliers.md
  - Investigación profunda agosto 2026
related_documents:
  - colombian_market.md
  - economics.md
  - pricing.md
  - suppliers.md
  - 06_operations/production_schedule.md
---

# Executive Summary
Modelo de negocio integral para Setas de la Peña. Define la propuesta de valor, segmentos de cliente, canales, estructura de costos y flujo de ingresos. Incluye unit economics validados con datos de investigación de mercado agosto 2026.

# Lean Canvas — Setas de la Peña

## 1. Problema
- Setas gourmet frescas son escasas y caras en Bogotá/Sabana — dominadas por champiñón industrial
- Restaurantes gourmet quieren variedad, trazabilidad y frescura pero no tienen proveedores confiables
- El consumidor urbano consciente no encuentra hongos funcionales/gourmet de producción local

## 2. Segmentos de Cliente

| Segmento | Perfil | Prioridad |
|----------|--------|-----------|
| **Restaurantes gourmet Bogotá** | Chefs que buscan ingredientes diferenciados y trazables | 🔴 Prioridad #1 |
| **Plataformas orgánicas/agroecológicas** | La Canasta, Sembrando Confianza, Escarola — mercados a domicilio | 🟡 Prioridad #2 |
| **Mercados campesinos** | Consumidores conscientes, familias, foodies | 🟡 Prioridad #2 |
| **Tiendas especializadas** | Biomarkets, tiendas naturales en Bogotá norte | 🟢 Prioridad #3 |
| **Consumidor directo (D2C)** | Delivery vía Nequi/Daviplata en Tenjo-Bogotá | 🟢 Prioridad #3 |

## 3. Propuesta de Valor
- Setas gourmet **frescas** (cosechadas < 24h), cultivadas en **Tenjo** con trazabilidad lote-a-lote
- Producción con **automatización IoT** (ESP32/HA) = consistencia de calidad
- **Variedades premium** que el mercado masivo no ofrece: Pink Oyster, Lion's Mane, Shiitake
- Sin pesticidas, sin transgénicos — proceso documentado y auditable
- **Marca "Sombra y Silencio"** — posicionamiento premium desde el día 1

## 4. Canales (verificados agosto 2026)

| Canal | Cómo entrar | Costo de entrada | Margen |
|-------|-------------|-------------------|--------|
| Restaurantes B2B | Muestra gratuita al chef (250–500g) + presentación técnica | Bajo (costo producto) | Alto ($22K–35K/kg) |
| Plataformas orgánicas | Inscripción en La Canasta, Sembrando Confianza, Huerta Don Iván | Bajo (registro) | Medio-alto |
| Mercados campesinos | Inscripción gratuita — Secretaría Desarrollo Económico (portal *Conexión*). RUT + cert. Alcaldía Tenjo | Gratis | Medio ($18K–25K/kg) |
| D2C / Redes sociales | Instagram + WhatsApp + Rappi/MercadoLibre | Bajo | Medio-alto |

## 5. Flujo de Ingresos

### Fase 1 — Validación (meses 1–3)
| Producto | Precio/kg | Volumen semanal | Ingreso semanal |
|----------|-----------|-----------------|-----------------|
| P. djamor fresco (Grade A) | $25,000 COP | 8–10 kg | $200K–250K COP |
| P. djamor fresco (Grade B) | $18,000 COP | 2–3 kg | $36K–54K COP |
| **Total semanal estimado** | | | **$236K–304K COP** |

### Fase 2 — Escalamiento (meses 4–12, 4 módulos)
| Producto | Precio/kg | Volumen semanal | Ingreso semanal |
|----------|-----------|-----------------|-----------------|
| P. djamor fresco | $28,000 COP promedio | 20–25 kg | $560K–700K COP |
| P. ostreatus fresco | $22,000 COP | 10–15 kg | $220K–330K COP |
| **Total semanal estimado** | | | **$780K–1,030K COP** |

### Fase 3 — Diversificación (año 2+)
- Lion's Mane fresco: $35K–50K COP/kg
- Deshidratados: $80K–150K COP/kg
- Extractos (requiere INVIMA como suplemento dietario): $150K–400K COP/100g
- Kits de cultivo doméstico: $35K–60K COP/kit

## 6. Estructura de Costos

### Unit Economics — 1 Lote de 10 bloques (1 módulo)

| Concepto | Costo | % del total |
|----------|-------|-------------|
| **Sustrato** (paja 10kg) | $30,000 COP | 9% |
| **Spawn** P. djamor (1.5kg al 15%) | $12,000 COP | 4% |
| **Suplementos** (yeso, cal) | $2,000 COP | 1% |
| **Bolsas de cultivo** (10 u) | $5,000 COP | 2% |
| **Energía** (humidificador, extractor, luces — 30 kWh) | $21,000 COP | 6% |
| **Mano de obra** (4h/sem × 5 sem × $8,000/h) | $160,000 COP | 49% |
| **Empaque y transporte** | $20,000 COP | 6% |
| **Amortización capex** ($870 USD ÷ 52 lotes/año) | $70,000 COP | 22% |
| **Total costo por lote** | **~$320,000 COP** | 100% |

### Métricas Clave

| Métrica | Valor | Notas |
|---------|-------|-------|
| Costo variable / kg producido | ~$8,200 COP | Sin MO ni amortización |
| Costo total / kg (con MO) | ~$37,600 COP | A 8.5 kg/lote (BE 85%) |
| Precio venta promedio / kg | ~$25,000 COP | Mix de canales Fase 1 |
| **Margen bruto / kg (sin MO)** | **~$16,800 COP (67%)** | |
| **Margen neto / kg (con MO)** | **−$12,600 COP** | ⚠️ Negativo en 1 módulo |
| **Punto de equilibrio** | **~3 módulos simultáneos** | MO se diluye con volumen |

### Camino a Rentabilidad

```
1 módulo  → Margen negativo (MO > ingreso)
     ↓
3 módulos → Punto de equilibrio (~$720K ingreso/lote, $640K costo)
     ↓
4 módulos → Margen positivo (~15%)
     ↓
6+ módulos → Margen >25% con economías de escala
```

> **El modelo de 1 módulo es un laboratorio de validación, no un negocio rentable.** La rentabilidad comienza a 3+ módulos.

## 7. Ventaja Competitiva

| Ventaja | Descripción | Defensibilidad |
|---------|-------------|----------------|
| Automatización IoT | ESP32/HA = consistencia y datos que competidores artesanales no tienen | 🟡 Media (replicable pero requiere know-how) |
| Knowledge Base sistemática | KB de 60+ docs técnicos = curva de aprendizaje acelerada | 🟢 Alta (acumulación de conocimiento) |
| Ubicación (Tenjo) | 30 min de Bogotá, clima fresco natural (reduce costos energéticos) | 🟢 Alta (geográfica) |
| Marca premium | "Sombra y Silencio" — posicionamiento desde día 1 | 🟡 Media |
| Diversificación de especies | Roadmap a Lion's Mane, Shiitake, Reishi = portafolio amplio | 🟡 Media |

## 8. Métricas Clave (KPIs)

| KPI | Frecuencia | Objetivo Fase 1 |
|-----|------------|-----------------|
| BE (Biological Efficiency) | Por lote | ≥85% |
| Tasa de contaminación | Por lote | <10% |
| Costo variable / kg | Mensual | <$10,000 COP |
| Precio promedio de venta / kg | Mensual | >$22,000 COP |
| Clientes activos restaurante | Mensual | ≥3 |
| Yield semanal (kg) | Semanal | ≥8 kg |

## 9. Regulación (Estrategia INVIMA)

| Fase | Categoría INVIMA | Normativa | Claims permitidos |
|------|-----------------|-----------|-------------------|
| 1–2 | **Alimento** | Resolución 2674/2013 | Nutricionales: "alto en proteína", "fuente de fibra" |
| 3+ | **Suplemento dietario** | Decreto 3249/2006 | Funcionales: "apoya el sistema inmune" (con soporte FDA/EFSA/Codex) |

> ⚠️ **Colombia NO tiene categoría legal de "alimento funcional".** No usar claims de salud hasta tener registro como suplemento dietario.

# Best Practices
- Validar unit economics con datos reales después de cada lote — no confiar solo en proyecciones.
- Priorizar canal restaurantes desde el inicio — mejor margen y relación directa con el chef.
- No escalar módulos antes de validar BE >80% y tasa de contaminación <10% consistente.
- Separar costos fijos (capex, MO fija) de variables (sustrato, spawn, energía) para tomar decisiones de escalamiento.

# Common Failure Modes
- Producir sin cliente asegurado → producto perecedero sin salida
- Escalar antes de validar → multiplica pérdidas en vez de ganancias
- Subestimar MO → P&L irreal que no muestra el verdadero punto de equilibrio
- No diferenciar Grade A vs B → todo se vende al precio más bajo

# Open Questions
- ¿Margen real después de los 3 primeros lotes? (valida o invalida proyecciones)
- ¿Demanda real del segmento de plataformas orgánicas? (volumen semanal que absorben)
- ¿Costo real de transporte Tenjo → Bogotá por entrega?
- ¿Modelo de MO: cuidador part-time vs. emprendedor-operador en Fase 1?

# References
- economics.md — Costos y proyecciones detalladas
- pricing.md — Estrategia de precios por especie y canal
- suppliers.md — Proveedores verificados y precios de insumos
- Investigación profunda agosto 2026 — Canales de distribución, precios de mercado, regulación INVIMA
