# Modelo Híbrido Fase 2: Martha Calefaccionada + Fructificadora de Ambiente
**Setas de la Peña — Especificación técnica**  
*Junio 15, 2026*

---

## Resumen ejecutivo

En lugar de replicar 3 Martha tents idénticas en Fase 2, este modelo propone:

**Módulo 1 — Martha Tent Calefaccionada** (Prototipo B)
- Especie: *Pleurotus djamor* (Orellana rosada tropical)
- Temperatura: 20–28 °C (necesita calor, Tenjo es frío)
- Control: Inkbird ITC-308 (temperatura) + FAE inteligente por CO₂ (SCD30)

**Módulo 2 — Fructificadora de Ambiente** (sin calefacción)
- Especies: Shiitake, Melena de León, Orellana blanca, Orellana café
- Temperatura: 12–21 °C (Tenjo natural es ideal)
- Control: Inkbird IHC-200 (humedad) + FAE pasiva/programada

**Ventajas sobre modelo uniforme (3 Martha tents):**
- ✅ Energía: solo djamor consume calefacción (ahorro 60–70% vs. 3 Martha)
- ✅ Simplificidad operativa: cada módulo tiene protocolo claro por especie
- ✅ Flexibilidad: añadir especies nuevas en fructificadora sin rediseño
- ✅ Costo: similar o menor que 3 Martha tents replicadas

**Desventaja:**
- ⚠️ Dos protocolos paralelos (vs. uniforme); requiere documentación clara

---

## MÓDULO 1: Martha Tent Calefaccionada (djamor)

### Biología y parámetros objetivo

| Parámetro | Rango óptimo | Notas |
|---|---|---|
| **Temperatura incubación** | 24–28 °C | Ningún choque frío tolerable |
| **Temperatura fructificación** | 20–30 °C | Óptimo 22–26 °C |
| **HR fructificación** | 90–95% | Crítica; baja HR = deformación |
| **CO₂ máx. fructificación** | <1.000 ppm | Exceso causa coraling (deformación) |
| **Choque térmico** | ❌ PROHIBIDO | No aplica a djamor |
| **Ciclo completo (incub. + flush 1)** | 30–38 días | BE esperado 25–30% |
| **Rendimiento (10 bolsas)** | 2,0–2,5 kg por flush | 3–4 flushes antes de descarte |

**Diferenciador de mercado**: djamor es raro en Colombia (visual: color rosa), precio ~2–3× más alto que orellana gris. Baja producción de volumen pero alto margen.

---

### Diseño del módulo (Prototipo B revisado)

#### **Capa 1: Aislamiento exterior**
- Láminas de icopor ~5 cm forrando los 4 lados + tapa de la Martha tent
- Fijación: cinta + silicona
- **Efecto**: Reduce pérdida térmica 40–50% → necesidad de calefacción disminuye de 8–12 °C a 4–6 °C de diferencia

#### **Capa 2: Calor radiant bajo la carpa**
- Alfombrilla QuietWarmth bajo la base de la Martha (NO dentro)
- Activa ~24 °C por termostato integrado
- **Efecto**: Calor sube por convección lentamente, sin corrientes de aire directo que sequen hongos
- **Parámetro**: SHT31 monitorea T interior; relé corta si > 27 °C

#### **Capa 3: Niebla tibia VIVOSUN**
- Humidificador VIVOSUN AeroStream 5L con agua calentada
- Calentador acuario 50W en depósito (agua a 30–32 °C)
- **Efecto**: Niebla sale ~25–28 °C → aporta 2–4 °C + humedad sin corrientes turbias

**Resultado combinado:**
- Icopor: -3 °C de diferencia a cubrir
- QuietWarmth: +3 °C
- Niebla tibia: +2 °C  
- **Total estimado: +2–4 °C sobre ambiente Tenjo (12–16 °C) = 16–20 °C interior**
- ⚠️ **Insuficiente para djamor** (necesita 20–28 °C)

**Solución complementaria**: Si invierno Tenjo baja a 8–10 °C (noches extremas), añadir manta térmica 100W adicional (~$40–70k COP). Validar con datos termométricos locales.

---

### Equipamiento Módulo 1

| Ítem | Cantidad | Función | Proveedor estimado |
|---|---|---|---|
| Martha estantería 5 niveles + cubierta plástico | 1 | Estructura base | Mercado local |
| Alfombrilla QuietWarmth (inventario existente) | 1 | Calor radiant bajo carpa | Disponible |
| Láminas icopor 5 cm | 3–4 m² | Aislamiento exterior | Tenjo/Bogotá |
| Silicona antihongos | 1–2 tubos | Sellado icopor | Ferretería |
| VIVOSUN AeroStream H05 9L | 1 | Humidificación | MercadoLibre |
| Calentador acuario 50W | 1 | Agua tibia VIVOSUN | Tienda acuarofilia |
| SHT31 + relé 4 canales | 1 | Monitoreo T, corte emergencia | Electrónica local |
| Noctua NF-P12 (ventilador FAE) | 1 | Extracción CO₂ acumulado base | Proveedor electrónica |
| SCD30 (sensor CO₂) | 1 | FAE inteligente (ON si > 900 ppm) | MercadoLibre/Ali |
| Manguera reforzada ~10 cm | 1 | Ducción Noctua salida carpa | Tienda de jardinería |
| Poly-fil compactado | Puñado | Entrada aire fresco, apertura superior | Tienda invernadero |
| **Subtotal Módulo 1** | — | — | — |

---

### Flujo de producción diario (Módulo 1)

```
DÍA 0: Inoculación bolsas djamor en SAB → bolsas a incubadora (24–27 °C)
│
├─ DÍAS 1–22: Incubación + colonización (SHT31 monitorea T/HR pasiva)
│  ├─ T: 24–27 °C (QuietWarmth en base, sin sobrecalor)
│  ├─ HR: 70–80% (pasiva, sin adicional)
│  └─ CO₂: 5.000–10.000 ppm tolerable
│
└─ DÍA 22: Colonización completa, bolsas a Martha tent calefaccionada
   │
   ├─ DÍAS 23–30: Preparación primordios (T: 20–28 °C, HR: 90–95%, FAE cíclico)
   │  ├─ SCD30 monitorea CO₂: ON Noctua si > 900 ppm, OFF si < 700 ppm
   │  ├─ GrowHub o Inkbird ITC controla T (si > 27 °C, corta calefacción)
   │  └─ Humidificador VIVOSUN en ciclos: 15 min ON / 45 min OFF
   │
   ├─ DÍA 30: Primeros priordios visibles → FLUSH 1
   │  └─ Cosecha DÍA 35–38: 2,0–2,5 kg (10 bolsas, esperado)
   │
   └─ DÍAS 39–45: Resto y recuperación
      └─ DÍA 45: Reenumedad (spray 24h), FLUSH 2–3–4 (cada 7–10 días)
```

---

### Protocolos operacionales

#### **Temperatura (SHT31 + Relé)**
- Seteo: 27 °C máximo (relé corta QuietWarmth si supera)
- Monitoreo: Lectura cada 15 min (Python en Pi Zero)
- Alerta: Email/Slack si T < 20 °C o > 28 °C por >1h

#### **CO₂ (SCD30 + Noctua FAE)**
- Threshold djamor: 900 ppm (alerta); máximo seguro: 1.000 ppm
- Lógica: 
  - Si CO₂ > 900 ppm → Noctua ON (velocidad media, ~50% PWM)
  - Si CO₂ < 700 ppm → Noctua OFF
  - Histéresis de 200 ppm para evitar ciclo rápido
- Lectura: Cada 5 min (SCD30)
- Alerta: Correo si CO₂ sostenido > 1.200 ppm (potencial bloqueo FAE)

#### **Humedad (VIVOSUN)**
- Seteo: ciclos automáticos 15 ON / 45 OFF (GrowHub) o manual (Inkbird)
- Objetivo: 90–95% HR (validar con SHT31)
- Si HR cae < 85%, aumentar ciclo a 20 ON / 40 OFF

#### **Luz**
- Fotoperiodo: 12h luz / 12h oscuridad (temporizador LED)
- Espectro: Full-spectrum blanco frío (4.000–6.500 K)

---

## MÓDULO 2: Fructificadora de Ambiente (especies templadas)

### Biología y parámetros

| Especie | T óptima | HR | CO₂ máx. | Ciclo completo | BE |
|---|---|---|---|---|---|
| **Shiitake** (*Lentinula edodes*) | 10–20 °C | 85–95% | 1.200 ppm | 60–90 días* | 40–60%** |
| **Melena de León** (*Hericium erinaceus*) | 15–18 °C | 85–95% | 800 ppm | 35–50 días | 20–30% |
| **Orellana blanca** (*P. pulmonarius*) | 13–21 °C | 85–95% | 1.000 ppm | 35–45 días | 20–25% |
| **Orellana café** (*P. sajor-caju*) | 13–21 °C | 85–95% | 1.000 ppm | 35–45 días | 20–25% |

*Shiitake: incubación muy larga (30–90 días según bloque); fructificación adicional 7–14 días  
**Shiitake: BE sobre bloque/tronco seco, no bolsa; el nuestro en bolsa = 20–25% BE más realista

**Ventaja climática Tenjo**: Ambiente nativo 12–16 °C es **óptimo para todas estas especies**. No requieren calefacción ni enfriamiento adicional en ciclo normal.

**Excepción Shiitake**: Requiere **choque térmico obligatorio** (4 °C × 24h) para inducir primordios. Solución: nevera doméstica o ambiente exterior Tenjo nocturno (8–10 °C).

---

### Concepto: Fructificadora open-air o caja semiabierta

**Opción A: Sistema abierto (recomendado para Fase 2)**
- Bolsas colgadas en estantería de aluminio (existente)
- Espacio alrededor: ≥30 cm en 4 lados (FAE natural por convección)
- Humidificador VIVOSUN compartido con Martha (uso en ciclos alternos, mañana/tarde)
- Ventilación: Apertura/cierre manual programada (p. ej. 10:00–14:00 = abrir, luego cerrar)
- **Costo**: ~400–600k COP (estantería + humidificador compartido)

**Opción B: Caja cerrada con FAE pasiva (futuro, Fase 3)**
- Caja de plástico grande (~1 m³) con tapa
- 2–4 orificios con Poly-fil en paredes opuestas (inferior/superior)
- **Costo**: ~200–400k adicional (caja + ductería)
- **Ventaja**: Control de HR más estable; transición hacia sala centralizada

**Recomendación Fase 2**: **Opción A** (abierto, simple, bajo costo) validar primero.

---

### Equipamiento Módulo 2

| Ítem | Cantidad | Función | Proveedor |
|---|---|---|---|
| Estantería aluminio 5 niveles (inventario) | 1 | Soporte bolsas colgadas | Disponible |
| Bandeja/bandeja de goteo (base) | 2–3 | Agua condensada/spray | Tienda invernadero |
| Ganchos S para colgar bolsas | ~20 | Sujeción bolsas perforadas | Ferretería |
| Humidificador VIVOSUN AeroStream 5L | 1 | Compartido con Martha (ciclos) | MercadoLibre |
| Inkbird IHC-200 (controlador humedad) | 1 | Control automático ciclos | MercadoLibre |
| SHT31 + termómetro | 1 | Monitoreo T/HR | Electrónica |
| Temporizador manual o smart | 1 | Apertura/cierre puerta programada | Tienda electrónica |
| Lámparas LED (2–3 paneles) | 2–3 | Fotoperiodo (opcional, mejora calidad) | MercadoLibre |
| **Subtotal Módulo 2** | — | — | — |

---

### Flujo de producción diario (Módulo 2 — ejemplo shiitake)

```
DÍA 0: Inoculación bolsas shiitake en SAB → bolsas a incubadora
│
├─ DÍAS 1–22: Incubación normal (24–27 °C, como djamor)
│
└─ DÍA 22: Colonización completa, bolsas a fructificadora ambiente
   │
   ├─ DÍAS 23–60: Colonización adicional en frio (10–16 °C ambiente Tenjo)
   │  └─ HR mantenida 85–90% por Inkbird IHC-200 + humidificador
   │
   ├─ DÍA 60: INDUCCIÓN DE PRIORDIOS (choque térmico obligatorio)
   │  ├─ Opción A: Bolsas a nevera 4 °C × 24h (casa)
   │  └─ Opción B: Bolsas a ambiente exterior Tenjo nocturno (8–10 °C)
   │
   ├─ DÍA 61: Retorno a fructificadora 15–18 °C, HR 90–95%
   │  └─ Primeros primordios en 2–3 días
   │
   ├─ DÍA 65–70: FLUSH 1 cosecha
   │  └─ Rendimiento: ~1.6–2.4 kg (10 bolsas de shiitake en bolsa = realista)
   │
   └─ DÍAS 71+: Reposo + FLUSH 2–3 (cada 10–15 días, decreciente)
```

---

### Protocolos operacionales

#### **Humedad (Inkbird IHC-200 + VIVOSUN)**
- Seteo: 85–95% HR (rango fructificación)
- Lógica: 
  - Si HR < 80% → humidificador ON (15 min)
  - Si HR > 95% → humidificador OFF
  - Inkbird registra ciclos automáticamente
- Lectura: Cada 15 min (SHT31)

#### **Temperatura (pasiva, monitoreo)**
- Rango esperado: 12–21 °C (Tenjo natural)
- Alerta si T < 10 °C o > 25 °C (posible calor externa anómalo)
- No hay control activo; es validación de clima Tenjo

#### **CO₂ (FAE pasiva + sensibilidad por especie)**
- Melena de León: máx. 800 ppm (más restrictivo)
  - Si CO₂ > 700 ppm → apertura manual adicional ~30 min
- Shiitake / Orellanas: máx. 1.000–1.200 ppm
  - Apertura/cierre programada 10:00–14:00 diaria (2–3 horas)
- **Sin sensor continuo en Fase 2** (medidor portátil calibra)
- Consideración Fase 2: agregar SCD30 en esta zona si melena de león se cultiva aquí ($0.5M adicional)

#### **Luz**
- Fotoperiodo: 12h / 12h (temporizador LED 2–3 paneles)
- Espectro: White full-spectrum (4.000–6.500 K)

---

## Comparativa: Híbrido vs. Uniforme (3 Martha tents)

### Costos operacionales anuales (estimado)

| Factor | Uniforme (3 Martha) | Híbrido (1 Martha + 1 Ambiente) | Diferencia |
|---|---|---|---|
| **Electricidad calefacción** | 3 × 100 kWh/mes = 300 kWh | 1 × 100 kWh + 0 = 100 kWh | **-200 kWh/mes** |
| Costo energético annual @3.500 COP/kWh | 12.600.000 COP | 4.200.000 COP | **-8.400.000 COP** |
| Mantenimiento equipos (desgaste) | 3 × 2M (limpieza, cambios) | 2 × 1.5M | **-1.500.000 COP** |
| **Total anual operativo** | ~14.600.000 COP | ~5.700.000 COP | **-8.900.000 COP** |

**Nota**: Estimación rough; valores reales dependen de tarifa local energía + protocolos específicos.

### Flexibilidad y escalabilidad

| Aspecto | Uniforme | Híbrido |
|---|---|---|
| Añadir nueva especie | Requiere nueva Martha | Se añade a fructificadora ambiente (sin costo equipo) |
| Cambiar volumen djamor | Proporcional (1 Martha = X kg) | Independiente; escalar ambiente no afecta djamor |
| Riesgo de contaminación cruzada | Bajo (aislamiento por Martha) | Bajo (Martha > Ambiente, sin FAE común) |
| Documentación operativa | Simple (mismos pasos × 3) | Dual (2 protocolos) pero clara |

**Conclusión**: Híbrido es más flexible a largo plazo; uniforme es más simple inicialmente.

---

## Presupuesto Fase 2 — Opción Híbrida

| Componente | Cantidad | Costo unitario COP | Costo total COP |
|---|---|---|---|
| **Módulo 1: Martha Calefaccionada** | 1 | — | — |
| Estantería + cubierta | 1 | 280.000 | 280.000 |
| Icopor 5 cm + silicona | 1 | 100.000 | 100.000 |
| Calentador acuario (compartido incubadora, ajuste) | — | — | 0 |
| Noctua NF-P12 + manguera + Poly-fil | 1 | 150.000 | 150.000 |
| SCD30 (sensor CO₂) | 1 | 100.000 | 100.000 |
| SHT31 + relé (compartido monitoreo) | — | — | 0 |
| VIVOSUN AeroStream H05 | 1 | 612.000 | 612.000 |
| Iluminación LED | 1 | 250.000 | 250.000 |
| Ducto + filtro carbón | 1 | 278.000 | 278.000 |
| **Subtotal Módulo 1** | — | — | **1.770.000** |
| **Módulo 2: Fructificadora Ambiente** | 1 | — | — |
| Estantería aluminio (inventario) | — | — | 0 |
| Bandeja goteo × 3 | 3 | 50.000 | 150.000 |
| Ganchos S × 20 | 20 | 5.000 | 100.000 |
| Humidificador VIVOSUN (compartido Martha) | — | — | 0 |
| Inkbird IHC-200 | 1 | 250.000 | 250.000 |
| SHT31 + temporizador smart | 1 | 80.000 | 80.000 |
| Iluminación LED × 2 | 2 | 125.000 | 250.000 |
| **Subtotal Módulo 2** | — | — | **830.000** |
| **Equipamiento compartido Fase** | — | — | — |
| Medidor CO₂ portátil | 1 | 500.000 | 500.000 |
| **Subtotal compartido** | — | — | **500.000** |
| **TOTAL FASE 2 (Modelo Híbrido)** | — | — | **3.100.000** |

**Comparativa:**
- Hoja de Ruta Original Fase 2 (3 Martha): **6.125.000 COP**
- Propuesta Híbrida: **3.100.000 COP**
- **Ahorro: -3.025.000 COP (-49%)**

⚠️ **Nota**: Cifras asumen reutilización de algunos equipos (VIVOSUN, sensores). Si se requiere duplicación por aislamiento, costos suben. Revisar con equipo operativo.

---

## Recomendación

✅ **Implementar Modelo Híbrido en Fase 2**

**Por qué:**
1. Energía: 70% ahorro de calefacción vs. 3 Martha
2. Costo: 50% menos presupuesto vs. uniforme
3. Flexibilidad: fácil escalar especies templadas sin duplicar calefacción
4. Biología: aprovecha Tenjo como "cuarto frío gratis"

**Próximo paso:**
- Redocumentar Presupuesto Unificado mostrando ambas opciones (uniforme vs. híbrido)
- Validar con stakeholders: ¿simplicidad (uniforme) o eficiencia (híbrido)?

---

**Documento aprobado para integración en Presupuesto Unificado v2.0**
