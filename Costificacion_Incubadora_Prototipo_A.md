# Costificación detallada: Incubadora de Baño María Pasivo (Prototipo A)
**Setas de la Peña — Junio 15, 2026**

---

## Especificación técnica (del Plan de Prototipos v3)

Sistema de incubación de calor húmedo para 22–30 días de colonización a 24–27 °C, con humedad pasiva (70–80%), monitoreo de temperatura/HR/CO₂, y corte de emergencia automático.

**Función**: Todas las especies incuban aquí (djamor, shiitake, melena de león, orellanas, maitake). Salida → fructificadora (Martha tent o ambiente).

---

## Desglose de costos por componente

### 🔧 Estructura e infraestructura

| Componente | Especificación | Precio COP | Ref. | Notas |
|---|---|---|---|---|
| **Caja Ultraforte 120L** | Plástico rigido, tapa, ca. 60×40×50 cm | 120.000–180.000 | MercadoLibre, Éxito | Módulo 1; reutilizable después |
| **Icopor de 5 cm espesor** | Planchas 1×1 m para forrar 4 paredes + tapa (≈2,5–3 m²) | 80.000–120.000 | Distribuidores locales Tenjo/Bogotá | 25–30 COP/cm² aprox. |
| **Silicona antihongos** | Tubo de 300 ml (1–2 tubos para sellado completo) | 30.000–50.000 | Ferretería local | Previene moho en juntas |
| **Rejilla de enfriamiento** | Bandeja de metal/plástico 50×30 cm, soporta ≤20 kg | 40.000–70.000 | Tienda de almacén/invernadero | Elevación: bolsas mín. 5 cm sobre agua |
| **Subtotal estructura** | — | **270.000–420.000** | — | — |

---

### 🌡️ Calefacción y control térmico

| Componente | Especificación | Precio COP | Ref. | Notas |
|---|---|---|---|---|
| **Calentador de acuario 50W** | Sumergible, termostato integrado, rango 20–32 °C | 60.000–90.000 | MercadoLibre, Éxito, tienda acuarofilia | Ej: Eheim, Aqueon, marca china |
| **Termómetro de respaldo** | Analógico o digital (secundario, verificación) | 15.000–30.000 | Ferretería | Seguridad: si SHT31 falla |
| **Subtotal calefacción** | — | **75.000–120.000** | — | — |

---

### 📊 Sensores y monitoreo

| Componente | Especificación | Precio COP | Ref. | Notas |
|---|---|---|---|---|
| **SHT31 (sensor temp/HR)** | I2C, rango -10 a +85 °C, resolución 0,1 °C | 35.000–60.000 | MercadoLibre, Ali (China + envío 2–4 sem) | Interfaz I2C, I2C directo a Pi Zero |
| **Pi Zero 2W** | ARM Cortex-A53 × 4, 512 MB RAM, WiFi/BT | 90.000–150.000 | MercadoLibre (distribuidor oficial o reseller) | Precio sube post-2024; buscar stock |
| **Relé 4 canales 5V** | Módulo relé opto-aislado, trigger activo-bajo | 30.000–50.000 | MercadoLibre, Ali | Control carga: corte calentador si T > 29 °C |
| **MH-Z19C (sensor CO₂)** | NDIR, 0–5000 ppm, I2C + UART, 3.3–5V | 80.000–150.000 | MercadoLibre, Ali | Verificación durante incubación activa; opcional en Fase 1 (ver nota) |
| **Protoboard + cables dupont** | Soldadura de sensores a Pi Zero, conectores | 20.000–40.000 | Electrónica local | Mínimo material de integración |
| **Micro SD 32GB + carcasa Pi** | Almacenamiento OS + datos; protección | 30.000–50.000 | Tienda electrónica | Necesario para Pi Zero |
| **Cable USB C (fuente Pi)** | Fuente 5V 2.5A mínimo | 20.000–35.000 | Electrónica local | Alimentación Pi Zero |
| **Subtotal sensores** | — | **305.000–535.000** | — | **MH-Z19C opcional; ver debajo** |

---

### 💧 Gestión de humedad

| Componente | Especificación | Precio COP | Ref. | Notas |
|---|---|---|---|---|
| **Agua destilada inicial** | 5–7 litros (1–2 garrafones) | 20.000–40.000 | Droguería, supermercado | Reutilizable; bajo costo |
| **Agua oxigenada 30%** | 500 ml (3 ml/litro agua = ~1 litro para 300 L de agua) | 10.000–20.000 | Droguería | Inhibidor de bacterias |
| **Subtotal humedad** | — | **30.000–60.000** | — | — |

---

### 🔌 Insumos eléctricos y varios

| Componente | Especificación | Precio COP | Ref. | Notas |
|---|---|---|---|---|
| **Abrazaderas, tuercas, tornillos** | Montaje rejilla, sensor, relé | 10.000–20.000 | Ferretería | Variado |
| **Cinta aislante, tubo termorretráctil** | Soldaduras, protección conexiones | 15.000–25.000 | Electrónica | Seguridad |
| **Poly-fil (ventilación pasiva)** | 2 orificios de 38 mm, compactación | 5.000–10.000 | Tienda invernadero | Intercambio mínimo CO₂ |
| **Subtotal varios** | — | **30.000–55.000** | — | — |

---

## Resumen por categoría

| Categoría | Mínimo COP | Máximo COP | Promedio COP |
|---|---|---|---|
| Estructura | 270.000 | 420.000 | 345.000 |
| Calefacción | 75.000 | 120.000 | 97.500 |
| Sensores (sin MH-Z19C) | 225.000 | 385.000 | 305.000 |
| Sensores (+ MH-Z19C) | 305.000 | 535.000 | 420.000 |
| Humedad | 30.000 | 60.000 | 45.000 |
| Varios | 30.000 | 55.000 | 42.500 |
| **TOTAL (sin CO₂)** | **630.000** | **1.040.000** | **835.000** |
| **TOTAL (+ CO₂ MH-Z19C)** | **710.000** | **1.190.000** | **955.000** |

---

## Escenarios de inversión

### Escenario A: Incubadora "Core" (sin MH-Z19C)
**Presupuesto: 700.000–900.000 COP**

Incluye: estructura, calefacción, SHT31 + Pi Zero + relé, humedad pasiva.  
**Omite**: CO₂ dedicado en incubadora.  
**Justificación**: CO₂ no es crítico en incubación (micelio tolera 5.000–10.000 ppm). Se verifica en fructificadora.

**Ventaja**: Menor inversión inicial, suficiente para Fase 1.  
**Riesgo**: Si humedad y temperatura se descontrolan, no hay alarma de CO₂.

---

### Escenario B: Incubadora "Completa" (+ MH-Z19C)
**Presupuesto: 850.000–1.100.000 COP**

Incluye: Todo Escenario A + MH-Z19C para monitoreo continuo de CO₂ durante incubación.  
**Justificación**: Diagnóstico completo de ambiente; detección temprana de problemas de ventilación.

**Ventaja**: Validación científica exhaustiva en Fase 1; datos para simulador; detección de fuga/bloqueo FAE.  
**Costo adicional**: ~150.000–200.000 COP.

---

## Recomendación de compra

| Fase | Recomendación | Presupuesto | Justificación |
|---|---|---|---|
| **Fase 1 (Piloto)** | Escenario A (sin MH-Z19C) | 750.000–900.000 COP | Validación funcional; CO₂ se controla en fructificadora |
| **Fase 2 (Multi-módulo)** | Escenario A × 1 (sin MH-Z19C) | 750.000–900.000 COP | Duplicar incubadora si volumen lo justifica |
| **Fase 3 (Centralizada)** | Incubadora industrial separada | TBD | No aplica pequeña escala |

---

## Costos asociados de integración y labor

*(No incluidos arriba; considerar para presupuesto total)*

| Actividad | Costo estimado COP | Notas |
|---|---|---|
| Armado/soldadura sensores | 50.000–100.000 | Si se externaliza; DIY = 0 |
| Programación Python (lectura SHT31/relé) | 0–150.000 | Script simple disponible; si custom, contratar |
| Pruebas funcionales (1–2 días) | 0–50.000 | Validación en sitio |
| **Subtotal integración** | **50.000–300.000** | — |

---

## Proveedores y fuentes recomendadas (Colombia)

### Componentes locales (entrega rápida)
- **MercadoLibre.com.co**: Calentador acuario, caja Ultraforte, icopor, silicona, relé
- **Electrónica local Bogotá** (Junín, Centro): SHT31, Pi Zero, protoboard, cables
- **Éxito / Falabella**: Caja, calefactor (caro pero stock)
- **Ferretería cercana Tenjo**: Icopor, tornillos, tuercas, termómetro analógico

### Componentes importados (2–4 semanas)
- **AliExpress / Amazon**: SHT31, MH-Z19C, relé (más barato, espera)
- **Distribuidor oficial Pi Zero**: Fundación Raspberry Pi (UK) o reseller certificado Colombia (búsqueda recomendada)

### Estimación de tiempo
- **Compra local**: 1–3 días
- **Compra importada**: 2–4 semanas (AliExpress); 5–7 días (Amazon Premium)
- **Integración armado**: 1–2 días
- **Total ready-to-use**: 5–30 días según mix

---

## Impacto en presupuesto Fase 1

### Hoja de Ruta Original
- VIVOSUN + Martha estantería: 2.369.000 COP
- **Incubadora**: ❌ Omitido

### Propuesta alineada (Escenario A recomendado)
- VIVOSUN + Martha + Incubadora: 2.369.000 + **800.000** = **3.169.000 COP**
- Delta: **+800.000 COP** (+34% vs. original)

### Propuesta premium (Escenario B + MH-Z19C)
- VIVOSUN + Martha + Incubadora completa: 2.369.000 + **950.000** = **3.319.000 COP**
- Delta: **+950.000 COP** (+40% vs. original)

---

## Validación post-compra (checklist)

- [ ] SHT31 comunica con Pi Zero por I2C (test: `i2cdetect`, dirección 0x44)
- [ ] Relé responde a GPIO Pi (test: encender/apagar LED de prueba)
- [ ] Calentador mantiene 27 °C ±1 °C en agua destilada (medición SHT31)
- [ ] Humedad pasiva alcanza 70–80% sin humidificador adicional (solo agua)
- [ ] Caja aislada mantiene 2–3 °C arriba de ambiente Tenjo (test sin hongos)
- [ ] MH-Z19C (si incluido) lee CO₂ estable en ambiente (test: ~420 ppm afuera, ~500+ dentro)

---

**Documento aprobado para integración en Presupuesto Unificado v2.0**
