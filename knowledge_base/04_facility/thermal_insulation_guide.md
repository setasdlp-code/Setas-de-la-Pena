---
title: Aislamiento Térmico y Control de Condensación en Cultivo de Setas
category: facility
load_priority: selective
last_reviewed: 2026-08-25
confidence: high
primary_sources:
  - Principios de Psicrometría y Termodinámica de Edificaciones (ASHRAE)
  - Metecno Colombia — Ficha Técnica Frigowall PUR/PIR
  - Stamets (2000) — Mushroom Cultivation Facility Design
  - Investigación profunda de ingeniería agosto 2026
related_documents:
  - master_blueprint.md
  - fruiting.md
  - incubation.md
  - 05_equipment/environmental_control.md
  - 07_business/economics.md
---

# Executive Summary
Guía de ingeniería térmica y control psicrométrico para el diseño y construcción de cámaras de incubación y fructificación en Tenjo, Cundinamarca (2.600 m s.n.m.). Detalla la selección de materiales aislantes para ambientes saturados (>90–95% HR), cálculo de punto de rocío, diseño de techos anti-goteo, análisis energético y comparativa entre paneles industriales vs. retrofit DIY en Colombia.

---

# 1. Física de Materiales bajo Humedad Extrema (>90–95% HR)

En instalaciones micológicas, la combinación de alta humedad continua (>85–95% HR), condensación superficial y gradientes térmicos descalifica a la mayoría de aislamientos convencionales.

## Matriz Comparativa de Materiales Aislantes

| Material | Estructura | Permeancia al Vapor | Absorción de Agua (Inmersión) | Pérdida de Valor R en Húmedo | Resistencia Microbiológica | Veredicto Micológico |
|---|---|---|---|---|---|---|
| **PIR (Poliisocianurato)** | Célula cerrada (>95%) | <0.8 Perms (muy baja) | <1.5% vol. | Nula (conserva 100%) | Excelente (inorgánico) | **⭐⭐⭐⭐⭐ Óptimo (Estándar de Oro)** |
| **PUR (Poliuretano)** | Célula cerrada (>90%) | <1.0 Perms (muy baja) | <2.0% vol. | Nula (conserva 100%) | Excelente | **⭐⭐⭐⭐⭐ Óptimo** |
| **XPS (Poliestireno Extruido)** | Célula cerrada de alta densidad | 0.4–1.5 Perms | <0.7% vol. | Mínima (<5%) | Excelente | **⭐⭐⭐⭐ Excelente para DIY / Suelo** |
| **EPS (Icopor / Expandido)** | Perlas abiertas con intersticios | 2.0–5.0 Perms (alta) | 10–20% vol. a largo plazo | **Severa (pierde hasta 50%)** | ⚠️ Reservorio de bacterias/moho | **❌ No recomendado en salas húmedas** |
| **Lana Mineral / Vidrio** | Fibrosa abierta | >50 Perms (abierta) | >100% peso (absorbe agua) | **Total (colapso térmico)** | ❌ Se pudre / aloja patógenos | **🚫 Prohibido en áreas húmedas** |
| **Aislamiento Reflectivo (Aluminio burbuja)** | Lámina barrera | <0.05 Perms | 0% | N/A (requiere cámara de aire) | Buena | **⭐⭐⭐ Solo como barrera de vapor auxiliar** |

> [!CAUTION]
> **Prohibido el uso de lanas de vidrio/roca o EPS sin revestimiento estanco** en salas de fructificación. El vapor de agua satura los intersticios, provocando pérdida irreversible del aislamiento térmico y convirtiéndose en un foco incontrolable de *Trichoderma* y *Pseudomonas*.

---

# 2. Psicrometría, Punto de Rocío y Barreras de Vapor

## Dinámica del Punto de Rocío (Dew Point) en Tenjo

A 2.600 m s.n.m. (presión barométrica ~74.5 kPa), las condiciones típicas de una cámara de fructificación son:
- **Temperatura interior ($T_{\text{int}}$):** 20.0°C
- **Humedad Relativa interior ($HR$):** 95%
- **Punto de rocío interior ($T_{\text{dp}}$):** **~19.1°C**
- **Temperatura exterior nocturna en Tenjo ($T_{\text{ext}}$):** 6.0°C (promedio nocturno 6–10°C)

$$P_{\text{vapor, int}} \approx 22.2 \text{ mbar} \quad \text{vs.} \quad P_{\text{vapor, ext}} \approx 7.5 \text{ mbar} \quad (\Delta P_{\text{vapor}} \approx 14.7 \text{ mbar})$$

### Consecuencias de Ingeniería:
1. **Flujo de Vapor Unidireccional:** Existe una fuerte presión de vapor de **adentro hacia afuera**. El vapor intentará atravesar paredes y techos constantemente.
2. **Margen de Condensación Mínimo (0.9°C):** Si la cara interna de la pared o techo se enfría a menos de **19.1°C**, el aire superficial alcanza el 100% de saturación y condensa agua líquida de inmediato.
3. **Ubicación de la Barrera de Vapor:** La barrera de vapor (<0.1 Perms) debe ubicarse **estrictamente en la cara interior** (lado caliente y húmedo). Si se coloca en el exterior, el vapor entrará al aislamiento, chocará con la cara fría exterior y condensará dentro del cerramiento.

---

# 3. Diseño de Techos Anti-Goteo (Slope Engineering)

El goteo de agua de condensación desde el techo sobre los bloques de cultivo es el **vector #1 de contaminación por mancha bacteriana (*Pseudomonas tolaasii*)** y aborto de primordios.

```
                  TECHO INCLINADO (5° a 15°)
                  ═══════════════════════════╗  ← Superficie lisa (PVC / Acero prepintado)
                  \                           ║
                   \  Flujo de condensación   ║
                    \ (resbala por tensión)   ║
                     \                        ║
                      \                       ║
                       \                      ║
                      ┌─▼─────────────────────╢
                      │ CANALETA PERIMETRAL   ║
                      └─┬─────────────────────╢
                        │ Desagüe sifonado    ║
```

### Reglas de Diseño:
1. **Pendiente Obligatoria de 5° a 15° (9% a 25% de inclinación):** En este ángulo, la fuerza de adhesión y tensión superficial del agua supera la gravedad de una gota estática suspendida. El agua condensada no se desprende, sino que resbala como una película continua hacia el borde inferior.
2. **Canaleta Perimetral Colectora:** En el extremo inferior de la pendiente se instala una canaleta plástica/PVC que conduce el agua condensada directamente al drenaje sifonado del suelo.
3. **Circulación de Aire Perimetral:** Mantener un flujo de aire laminar suave cerca del techo para limitar la acumulación de gotas gruesas.

---

# 4. Dimensionamiento Energético y Cálculo de Aislamiento (Tenjo)

### Caso de Estudio: Módulo de Cultivo Estándar
- **Dimensiones:** $2.5\text{ m} \times 2.5\text{ m} \times 2.2\text{ m}$ (Volumen: $13.75\text{ m}^3$, Área de envolvente: $A = 34.5\text{ m}^2$).
- **Condición de Incubación:** $T_{\text{int}} = 24.0^\circ\text{C}$ (Noche $T_{\text{ext}} = 6.0^\circ\text{C} \rightarrow \Delta T_{\text{max}} = 18.0^\circ\text{C}$; $\Delta T_{\text{promedio}} \approx 11.0^\circ\text{C}$).
- **Costo Eléctrico Referencia:** 800 COP / kWh.

## Pérdidas Térmicas por Conducción ($Q = U \cdot A \cdot \Delta T$)

| Configuración de Envolvente | Espesor | Coeficiente $U$ (W/m²K) | Potencia Térmica Pico (W) | Consumo Mensual Estimado (kWh) | Costo Eléctrico Mensual (COP) | Ahorro vs. Sin Aislar |
|---|---|---|---|---|---|---|
| **Carpa de tela / Lona simple** | ~1 mm | 2.50 | 1,552 W | 683 kWh | ~$546,000 COP | 0% (Base) |
| **Panel PUR / PIR 50mm** | 50 mm | 0.45 | 279 W | 123 kWh | ~$98,400 COP | **82.0%** |
| **Panel PUR / PIR 75mm (Sweet Spot)** | 75 mm | 0.30 | 186 W | 82 kWh | ~$65,600 COP | **88.0%** |
| **Panel PUR / PIR 100mm** | 100 mm | 0.22 | 136 W | 60 kWh | ~$48,000 COP | **91.2%** |

> [!TIP]
> **Recomendación para Tenjo:** El **Panel PUR de 50mm a 75mm** representa el punto óptimo de retorno de inversión (ROI). Reduce el costo eléctrico de calefacción en más de un 80%, requiriendo una resistencia de solo 300–500W para mantener 24°C estables durante las noches frías de la Sabana.

---

# 5. Acabados Sanitarios, Sellos y Perfilería

### Revestimiento Interior
- **Acero Galvanizado Prepintado (Poliéster / PVDF):** Estándar de los paneles tipo sándwich. Altamente lavable, soporta nebulización continua.
- **PVC Sanitario Machihembrado:** Excelente alternativa. 100% impermeable, químicamente inerte, no se oxida y oculta tornillería.

### Sellado de Juntas
- **Masilla Híbrida MS Polymer (Grado Alimenticio):** Sellador y adhesivo elástico superior. No se despega con variaciones térmicas y soporta desinfectantes.
- **Prohibición de Silicona Ácida:** La silicona acética común libera ácido al curar, corroyendo agresivamente la lámina galvanizada y dañando los núcleos de PUR. Usar únicamente silicona neutra o MS Polymer.

### Encuentros Piso-Pared (Media Caña Sanitaria)
- Instalación de perfil cóncavo (media caña) en PVC o aluminio anodizado ($12,000–$25,000 COP / metro lineal).
- Elimina los ángulos rectos de 90° en el piso, permitiendo el lavado por inundación y evitando la acumulación de esporas y lodos.

---

# 6. Opciones Constructivas en Colombia

| Criterio | Opción A: Paneles Industriales Modulares | Opción B: Retrofit DIY / Madera y PVC |
|---|---|---|
| **Estructura** | Paneles sándwich autoportantes PUR/PIR (Metecno Frigowall) | Perfiles galvanizados drywall + listones inmunizados |
| **Aislante** | Núcleo inyectado de PUR/PIR de alta densidad (40 kg/m³) | Placas de XPS de 50mm ($40,000/m²) + polietileno 6 mil |
| **Acabado Interior** | Acero prepintado integrado en panel | Cielo raso en PVC sanitario pesado ($20,000/m²) |
| **Costo Aprox. Materiales** | **$80,000 – $150,000 COP / m²** | **$50,000 – $85,000 COP / m²** |
| **Velocidad de Armado** | Rápida (1–2 días) | Media (3–5 días) |
| **Hermeticidad y Vida Útil** | ⭐⭐⭐⭐⭐ Máxima (>15 años) | ⭐⭐⭐⭐ Alta (depende del sellado manual con MS Polymer) |
| **Proveedores Sabana** | Metecno Colombia (CEDI Bogotá), FrigoMaster, Antioqueña de Refrigeración | Homecenter, distribuidoras de PVC en Puente Aranda |

---

# References
- ASHRAE Handbook — Fundamentals. Psychrometrics and Building Insulation.
- Metecno Colombia. *Manual Técnico Panel Frigowall y Frigodock*.
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Rodríguez Valencia, N. (2005). *Infraestructura para el cultivo de hongos en Colombia*. Cenicafé.
