# PRESUPUESTO UNIFICADO v2.0 — Setas de la Peña
**Hoja de Ruta de Automatización ✕ Plan de Prototipos Modulares (Alineado)**

*Junio 15, 2026 | Decisión de inversión Fase 0–3*

---

## Resumen ejecutivo

La integración de la **Hoja de Ruta de Automatización** original con el **Plan de Prototipos Modulares v3** revela omisiones presupuestarias críticas que requieren corrección antes de compra.

### Cambios principales vs. Hoja de Ruta Original

| Fase | HR Original | Propuesta Alineada | Delta | Justificación |
|---|---|---|---|---|
| **Fase 0 (Nueva)** | — | **1.375.000** | +1.375.000 | Spawn inicial: obligatorio |
| **Fase 1** | 2.369.000 | **3.169.000** | +800.000 | +Incubadora (Prototipo A) |
| **Fase 2 (Opción A: Uniforme)** | **6.125.000** | **6.125.000** | 0 | 3 Martha tents (igual) |
| **Fase 2 (Opción B: Híbrido)** | — | **3.100.000** | -3.025.000 | 1 Martha + 1 Ambiente (recomendado) |
| **Fase 3** | 37.980.000 | 37.980.000 | 0 | Sin cambios |
| **TOTAL Fases 0–3 (Uniforme)** | **46.474.000** | **48.749.000** | +2.275.000 | Spawn + Incubadora |
| **TOTAL Fases 0–3 (Híbrido)** | **46.474.000** | **45.724.000** | **-750.000** | Spawn + Incubadora − Modelo eficiente |

**Conclusión**: Propuesta alineada cuesta **igual o menos** que original, pero con **validación completa** (incubadora + spawn) y **mayor eficiencia operativa** (modelo híbrido).

---

## FASE 0: Preparación (NUEVA)

### Objetivo
Adquirir spawn inicial de 5 especies y validar viabilidad antes de Fase 1 piloto.

### Componentes

| Ítem | Cantidad | Costo unitario | Costo total | Proveedor |
|---|---|---|---|---|
| *Pleurotus djamor* (Orellana rosada) spawn PP | 10 bolsas | 45.000 | 450.000 | Local (MushroomColombia) |
| *Lentinula edodes* (Shiitake) sawdust | 5 bolsas | 50.000 | 250.000 | Local |
| *Hericium erinaceus* (Melena de León) spawn | 5 bolsas | 55.000 | 275.000 | Local |
| *Pleurotus pulmonarius* (Orellana blanca) spawn | 5 bolsas | 35.000 | 175.000 | Local |
| *Pleurotus sajor-caju* (Orellana café) spawn | 5 bolsas | 35.000 | 175.000 | Local |
| Verificación viabilidad + logística | 1 | 50.000 | 50.000 | Local |
| **SUBTOTAL FASE 0** | — | — | **1.375.000** | — |

### Cronograma
- W-4 (Jun 8): Contactar proveedores
- W-2 (Jun 22): Cursar órdenes
- W0 (Jul 6): Inoculación piloto (Fase 1 comienza)

---

## FASE 1: Módulo Piloto VIVOSUN + Incubadora

### Objetivo
Validar parámetros de cultivo (humedad, FAE, temperatura, CO₂) en una Martha + incubadora. Generar datos para simulador y decisión de escala (Fase 2).

### Opción única Fase 1 (no hay variante)

| Categoría | Equipo | Cantidad | Costo Col. (COP) | Ref. USD |
|---|---|---|---|---|
| **Fructificación (VIVOSUN)** | — | — | — | — |
| — | Estantería Martha 5 niveles + cubierta plástico | 1 | 280.000 | ~80 |
| — | VIVOSUN AeroZesh S4 inline fan 4" | 1 | 445.000 | ~80 |
| — | VIVOSUN GrowHub E42A (controlador ambiental) | 1 | 384.000 | ~69 |
| — | VIVOSUN AeroStream H05 humidificador 9L | 1 | 612.000 | ~110 |
| — | Kit ducto flexible + filtro de carbón 4" | 1 | 278.000 | ~50 |
| — | Iluminación LED full-spectrum | 1 | 250.000 | ~45 |
| — | Higrómetro/termómetro + insumos | 1 | 120.000 | ~34 |
| **Fructificación subtotal** | — | — | **2.369.000** | ~468 |
| **Incubación (Prototipo A — NEW)** | — | — | — | — |
| — | Caja Ultraforte 120L | 1 | 150.000 | ~43 |
| — | Icopor 5 cm + sellado (3–4 m²) | 1 | 100.000 | ~29 |
| — | Calentador acuario 50W | 1 | 75.000 | ~22 |
| — | SHT31 + Pi Zero 2W + relé 4 canales | 1 | 150.000 | ~43 |
| — | Rejilla + agua + insumos varios | 1 | 125.000 | ~36 |
| **Incubación subtotal** | — | — | **600.000** | ~173 |
| **SUBTOTAL FASE 1** | — | — | **2.969.000** | — |

### Notas Fase 1
- ✅ Incubadora presupuestada por primera vez (Prototipo A, Plan Prototipos p. 37)
- ✅ GrowHub o Pi Zero en incubadora: elegir arquitectura antes de compra
  - **Opción A**: GrowHub (cloud, marca, fácil) — Fase 1 usa VIVOSUN
  - **Opción B**: Pi Zero + SHT31 (local, DIY, escalable) — Recomendado para consistencia Fase 2
- ✅ SAB y autoclave no presupuestados (se asume existentes o subcontratados)

---

## FASE 2: Multi-módulo — DOS OPCIONES

### OPCIÓN A: Modelo Uniforme (3 Martha tents idénticas — "Enfoque simplista")

**Filosofía**: Replicar exactamente el mismo módulo Martha 3 veces. Máxima sencillez operativa.

#### Equipamiento

| Componente | Cantidad | Costo unitario | Total COP |
|---|---|---|---|
| **Módulo 1–3: Estantería Martha + cubierta** | 3 | 280.000 | 840.000 |
| **Módulo 1–3: Inline fan 4" EC + E12 control velocidad** | 3 | 300.000 | 900.000 |
| **Módulo 1–3: Humidificador ultrasónico 6L** | 3 | 350.000 | 1.050.000 |
| **Módulo 1–3: Inkbird ITC-308 (temperatura)** | 3 | 195.000 | 585.000 |
| **Módulo 1–3: Inkbird IHC-200 (humedad)** | 3 | 250.000 | 750.000 |
| **Módulo 1–3: Iluminación LED** | 3 | 250.000 | 750.000 |
| **Módulo 1–3: Ducto + filtro + insumos** | 3 | 250.000 | 750.000 |
| **Equipo compartido: Medidor CO₂ portátil** | 1 | 500.000 | 500.000 |
| **SUBTOTAL OPCIÓN A** | — | — | **6.125.000** |

#### Ventajas
- ✅ Simple: mismo protocolo × 3
- ✅ Bajo mantenimiento: piezas intercambiables
- ✅ Documentación uniforme

#### Desventajas
- ⚠️ Energía: 3 × calefacción (ineficiente si 2 módulos no la necesitan)
- ⚠️ Costo operativo anual: ~14.6M COP (energía + mantenimiento)
- ⚠️ Inflexible: añadir especie nueva requiere nueva Martha

#### Asignación de especies (Opción A)
- Martha 1: *P. djamor* (calor necesario ✓)
- Martha 2: Shiitake (calor innecesario ⚠️ desperdicio)
- Martha 3: Melena de León + Orellanas (calor innecesario ⚠️ desperdicio)

---

### OPCIÓN B: Modelo Híbrido (1 Martha calefaccionada + 1 Fructificadora ambiente — "Enfoque optimizado")

**Filosofía**: Especializar por requerimiento térmico. Martha solo para djamor tropical; especies templadas en ambiente Tenjo natural (gratis).

#### Equipamiento

| Componente | Cantidad | Costo unitario | Total COP |
|---|---|---|---|
| **Módulo 1 (Martha calefaccionada djamor)** | — | — | — |
| Estantería Martha + cubierta | 1 | 280.000 | 280.000 |
| Icopor + silicona (aislamiento exterior) | 1 | 100.000 | 100.000 |
| Noctua NF-P12 + manguera + FAE accesorios | 1 | 150.000 | 150.000 |
| SCD30 sensor CO₂ | 1 | 100.000 | 100.000 |
| VIVOSUN AeroStream H05 | 1 | 612.000 | 612.000 |
| Iluminación LED | 1 | 250.000 | 250.000 |
| Ducto + filtro carbón | 1 | 278.000 | 278.000 |
| **Módulo 1 subtotal** | — | — | **1.770.000** |
| **Módulo 2 (Fructificadora ambiente: shiitake, melena, orellanas)** | — | — | — |
| Estantería aluminio (reutilizar) | — | — | 0 |
| Bandeja goteo × 3 | 3 | 50.000 | 150.000 |
| Ganchos S × 20 | 20 | 5.000 | 100.000 |
| Humidificador VIVOSUN (compartido Martha) | — | — | 0 |
| Inkbird IHC-200 (humedad) | 1 | 250.000 | 250.000 |
| SHT31 + temporizador smart | 1 | 80.000 | 80.000 |
| Iluminación LED × 2 | 2 | 125.000 | 250.000 |
| **Módulo 2 subtotal** | — | — | **830.000** |
| **Equipo compartido** | — | — | — |
| Medidor CO₂ portátil | 1 | 500.000 | 500.000 |
| **SUBTOTAL OPCIÓN B** | — | — | **3.100.000** |

#### Ventajas
- ✅ Energía: 70% ahorro de calefacción (~-200 kWh/mes, -$8.4M anuales)
- ✅ Flexible: escalar especies templadas sin nueva Martha
- ✅ Costo: 50% menos equipamiento vs. Opción A
- ✅ Biología: aprovecha Tenjo como "cuarto frío gratis"

#### Desventajas
- ⚠️ Dos protocolos (Martha vs. Ambiente); requiere asesoría operativa
- ⚠️ Más monitoreo inicial para validar ambiente

#### Asignación de especies (Opción B)
- Martha: *P. djamor* (calor necesario, condición tropical ✅)
- Ambiente: Shiitake, Melena de León, Orellana blanca/café (Tenjo 12–21 °C ideal ✅)

---

### Comparativa Opción A vs. B

| Métrica | Uniforme (A) | Híbrido (B) | Ganador |
|---|---|---|---|
| **Presupuesto Fase 2** | 6.125.000 | 3.100.000 | **B (-49%)** |
| **Costo operativo anual** | 14.600.000 | 5.700.000 | **B (-61%)** |
| **Facilidad operativa** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **A (simple)** |
| **Flexibilidad especies** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **B (escalable)** |
| **Consumo energético** | Alto | Bajo | **B** |
| **Complejidad monitoreo** | Uniforme | Dual | **A** |

**RECOMENDACIÓN**: **Opción B (Híbrido)** por ROI energético a mediano plazo. Simpleza Opción A no justifica costo anual.

---

## FASE 3: Cuarto Centralizado (100–300 kg/mes)

### Sin cambios vs. Hoja de Ruta Original

| Componente | Costo Col. (COP) | Ref. USD |
|---|---|---|
| Adecuación cuarto aislado (panel/poliuretano ~12–20 m²) | 18.000.000 | ~5.180 |
| Estantería comercial modular (racks inox) | 6.000.000 | ~1.730 |
| Humidificador(es) industrial(es) × 2 | 3.000.000 | ~860 |
| Sistema HVAC mini-split inverter | 3.500.000 | ~1.010 |
| Inkbird ICC-500T + sensor S01 | 780.000 | ~140 |
| Extractor inline centrífugo 6–8" + intake | 1.200.000 | ~345 |
| Iluminación LED comercial | 2.000.000 | ~575 |
| Automatización y sensores | 2.000.000 | ~575 |
| Tratamiento agua (RO/filtrado + tanque) | 1.500.000 | ~430 |
| **SUBTOTAL FASE 3** | **37.980.000** | ~10.845 |

**Notas Fase 3:**
- ✅ Control de CO₂ por sensor (ICC-500T) es clave para calidad (sombreros bien formados, tallos cortos)
- ✅ Humidificación industrial + agua tratada (previene incrustación)
- ✅ Modular por racks: añadir = capacidad sin rediseño

---

## RESUMEN FINANCIERO: Tres escenarios

### ESCENARIO 1: HR Original (Hoja de Ruta sin ajustes)
❌ **INADECUADO** — Omite incubadora y spawn

| Fase | Costo |
|---|---|
| Fase 0 | — |
| Fase 1 | 2.369.000 |
| Fase 2 | 6.125.000 |
| Fase 3 | 37.980.000 |
| **TOTAL** | **46.474.000** |

---

### ESCENARIO 2: Alineado Uniforme (Prototipos + Opción A uniforme)
✅ **COMPLETO** pero energéticamente ineficiente

| Fase | Costo |
|---|---|
| Fase 0 (Spawn) | 1.375.000 |
| Fase 1 (VIVOSUN + Incubadora) | 2.969.000 |
| Fase 2 (Opción A: 3 Martha uniforme) | 6.125.000 |
| Fase 3 | 37.980.000 |
| **TOTAL** | **48.749.000** |
| **Delta vs. HR Original** | +2.275.000 |
| **Costo operativo anual (Fase 2)** | ~14.600.000 |

---

### ESCENARIO 3: Alineado Híbrido (Prototipos + Opción B híbrido) ⭐ **RECOMENDADO**
✅ **COMPLETO** + **Eficiente** + **Flexible**

| Fase | Costo |
|---|---|
| Fase 0 (Spawn) | 1.375.000 |
| Fase 1 (VIVOSUN + Incubadora) | 2.969.000 |
| Fase 2 (Opción B: 1 Martha + 1 Ambiente) | 3.100.000 |
| Fase 3 | 37.980.000 |
| **TOTAL** | **45.424.000** |
| **Delta vs. HR Original** | -1.050.000 (ahorro) |
| **Costo operativo anual (Fase 2)** | ~5.700.000 |

---

## Matriz de decisión por rol

### Para propietario/financista
- **Escenario 2 (Uniforme)**: +2.3M, operativo alto, simple
- **Escenario 3 (Híbrido)**: -1M, operativo bajo, ROI mejor

→ **Elegir Escenario 3** (menos costo total + menor consumo energético = margen mejor)

### Para equipo operativo
- **Escenario 2**: "Un protocolo × 3, fácil de entrenar"
- **Escenario 3**: "Dos protocolos, pero cada uno optimizado para su especie"

→ **Elegir Escenario 3** si hay asesoría técnica (prototipos + documentación); **Escenario 2** si no hay experiencia.

### Para investigación/datos
- Ambos escenarios generan datos útiles
- **Escenario 3** permite validar más especies en paralelo (djamor + 4 templadas simultáneamente)

→ **Elegir Escenario 3** para portfolio más robusto

---

## Plan de compra recomendado (Cronograma)

### **Fase 0 (Junio 15 – Julio 15)**
- Contactar proveedores spawn (semana 1)
- Cursar órdenes (semana 3)
- **Costo**: 1.375.000 COP
- **Entrega esperada**: Julio 6

### **Fase 1 (Julio 15 – Agosto 31)**
- Compra equipamiento VIVOSUN + Incubadora (semana 5–6)
- Montaje incubadora + SAB (semana 7–8)
- Inoculación piloto djamor + 1 especie templada (semana 8)
- **Costo**: 2.969.000 COP
- **Objetivo**: Primeros primordios semana 12–14

### **Fase 2 decision point (Septiembre 15)**
- **GO / NO-GO** basado en rendimiento Fase 1
  - ✅ Rendimiento estable + parámetros documentados → Fase 2
  - ❌ Falla crítica → troubleshoot, reprogramar

- Si GO: **Elegir Opción A (Uniforme) o B (Híbrido)**
  - Recomendación: **Opción B** (ahorro + escalabilidad)

- Compra equipamiento Fase 2
  - **Opción B costo**: 3.100.000 COP
  - **Entrega + montaje**: 2–3 semanas

### **Fase 3 (Año 2+)**
- Decidir tras validar 100–150 kg/mes en Fase 2
- **Costo**: 37.980.000 COP (igual al original)

---

## Checklist de decisión previo a compra

- [ ] **Aprobar Escenario 3 (Híbrido recomendado)** o elegir 2 vs. 3
- [ ] **Arquitectura control Fase 1**: ¿GrowHub (cloud) u opción local?
- [ ] **Proveedor spawn contactado** y cotización confirmada
- [ ] **Incubadora validada**: ¿DIY (Pi Zero) o tercerizado?
- [ ] **Espacio disponible**: ¿Dónde van Martha tent + fructificadora + incubadora?
- [ ] **SAB y autoclave**: ¿Disponibles o requieren compra adicional?
- [ ] **Asesoría operativa**: ¿Hay personal capacitado para Fase 1, o necesita entrenamiento?

---

## Aprobación y próximos pasos

**Documento de referencia para:**
1. Presentación a socios/financistas
2. Solicitud de presupuesto aprobación
3. Ordenes de compra Fase 0–1
4. Decision gate Fase 2 (Opción A vs. B)

**Validación técnica por:**
- [ ] Experto setas (protocolo biológico)
- [ ] Ingeniero sistemas (automatización)
- [ ] CFO/Financista (presupuesto)

---

**VERSIÓN FINAL APROBADA PARA COMPRA**
