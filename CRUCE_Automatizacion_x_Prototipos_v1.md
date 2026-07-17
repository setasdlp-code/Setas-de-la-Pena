# Cruce: Hoja de Ruta Automatización × Plan de Prototipos Modulares
**Análisis de alineación, gaps y tensiones**  
*Junio 15, 2026*

---

## Resumen ejecutivo

La **Hoja de Ruta de Automatización** (3 fases, 46M COP) y el **Plan de Prototipos Modulares** (v3) son documentos complementarios pero con **desalineaciones críticas** en:

1. **Incubación**: no presupuestada en la hoja de ruta, pero esencial en prototipos
2. **Distribución de especies**: la hoja de ruta asume replicación de Martha tents; prototipos dicen que 5 de 6 especies NO la necesitan
3. **Sensores y control**: arquitecturas diferentes (Pi Zero + SHT31 vs. Inkbird)
4. **Spawn inicial**: no presupuestado en hoja de ruta

**Recomendación**: Revisar Fase 1 presupuestaria para incorporar incubadora + spawn, y ajustar Fase 2 modelo hacia fructificadora de ambiente (más económico) en lugar de 3 Martha tents adicionales.

---

## Tabla de alineación por fase

### FASE 1 — Piloto (Hoja de Ruta: 2.369.000 COP)

| Aspecto | Hoja de Ruta | Plan Prototipos | Alineación | Gap/Tensión |
|---|---|---|---|---|
| **Objetivo** | Validar parámetros, generar datos | Mismo + caracterizar 6 especies | ✅ Alineados | — |
| **Equipo fructificación** | VIVOSUN + Martha estantería 5 niveles | Martha tent (Prototipo B: calefaccionada para djamor) | ⚠️ Parcial | Hoja de ruta es genérica; prototipos especifican que djamor sí necesita Martha calefaccionada, otras no |
| **Incubación** | ❌ No presupuestado | Prototipo A detallado (caja, calentador acuario, SHT31, Pi Zero, MH-Z19C) | ❌ **Desalineado** | **GAP CRÍTICO**: Hoja de ruta omite incubadora. Prototipos la asumen como etapa obligatoria |
| **Controlador ambiental** | GrowHub E42A VIVOSUN (384k COP) | Pi Zero 2W + SHT31 (incubadora); sin detalle para Martha Fase 1 | ⚠️ Diferente | GrowHub es cloud/marca; Pi Zero es local/DIY. Plan prototipos implica independencia |
| **Control humedad** | GrowHub automático | VIVOSUN (Fase 1) o manual + Poly-fil en incubadora | ✅ Compatible | — |
| **Medidor CO₂** | No en Fase 1 | SHT31 en incubadora, MH-Z19C como referencia | ⚠️ Diferente | Hoja de ruta lo trae en Fase 2 (portátil); prototipos lo asumen Fase 1 en incubadora |
| **Spawn/cepas** | ❌ No presupuestado | "Spawn de shiitake, melena de León, orellanas" listado como gap | ❌ **FALTA** | Ambos omiten presupuestar adquisición de spawn inicial |
| **Maitake** | No mencionado | Excluido explícitamente de Fase 1, reservado Fase 2 | ✅ Implícitamente alineados | — |
| **Costo estimado incubadora** | 0 COP (no incluido) | ~500–800k (caja + calentador + sensores, asumo) | ❌ **BRECHA DE 500k–800k** | Hoja de ruta subestima Fase 1 si incubación es requisito |

**Veredicto Fase 1**: La hoja de ruta es funcional pero incompleta. Presupuesta solo fructificación (VIVOSUN + Martha); omite la incubación que prototipos establecen como obligatoria.

---

### FASE 2 — Multi-módulo (Hoja de Ruta: 6.125.000 COP, 3 módulos adicionales)

| Aspecto | Hoja de Ruta | Plan Prototipos | Alineación | Gap/Tensión |
|---|---|---|---|---|
| **Número y tipo de módulos** | 3 Martha adicionales (× 1.875k cada una) | 1 Martha calefaccionada (djamor) + 1 fructificadora ambiente (shiitake, melena, orellanas) | ❌ **Desalineado** | **TENSIÓN MAYOR**: Hoja de ruta replica Martha tents; prototipos proponen modelo híbrido más eficiente |
| **Razón del modelo** | Escala horizontal (muchas unidades pequeñas) | Optimización por especie (calor solo para tropical, ambiente para templadas) | ❌ Filosofías diferentes | Hoja de ruta = indiferenciado; prototipos = especializado |
| **Controladores** | Inkbird ITC-308 + IHC-200 por módulo | Plan prototipos no especifica Fase 2 control (asume escalación del Pi Zero o migración a Inkbird) | ⚠️ Compatible pero no detallado | Prototipos validan Inkbird en Fase 2 para independencia de marca; hoja de ruta lo propone |
| **CO₂ monitoreo** | Portátil Inkbird/similar (500k compartido) | SCD30 en Martha (Prototipo B); tabla de CO₂ por especie | ⚠️ Diferente estrategia | Hoja de ruta = verificación puntual; prototipos = monitoreo continuo por especie |
| **Fructificadora de ambiente** | ❌ No presupuestado | Propuesto como alternativa a Martha tents para 5 especies (caja transparente + VIVOSUN compartido) | ❌ **FALTA** | Costo potencial **~30–40% menor** que Martha tent adicional no explorado en hoja de ruta |
| **Spawn** | ❌ No presupuestado | Gap identificado pero no costificado | ❌ **Falta en ambos** | — |
| **Costo real vs. propuesto** | 6.125k COP (3 Martha × 1.875k + equipo compartido) | Alternativa: 1 Martha + 1 fructificadora ≈ ~2.5–2.8k COP por módulo (estimado) | ❌ **Potencial overbudget en 3–4M COP** | Si se sigue prototipos, Fase 2 podría costar 50–60% menos |

**Veredicto Fase 2**: Hay una **elección estratégica fundamental** que la hoja de ruta no documenta: ¿replicar Marthas (uniforme pero costoso) o especializar por especie (híbrido, más barato)? El plan de prototipos propone lo segundo, pero la hoja de ruta presupuesta lo primero.

---

### FASE 3 — Cuarto centralizado (Hoja de Ruta: 37.980.000 COP)

| Aspecto | Hoja de Ruta | Plan Prototipos | Alineación | Gap/Tensión |
|---|---|---|---|---|
| **Concepto** | Sala centralizada 100–300 kg/mes | Plan prototipos no detalla Fase 3 (enfocado en Fase 1–2) | ⚠️ Complementario | Prototipos son hoja de ruta *técnica* de Fase 1–2; Fase 3 es decisión empresarial |
| **Control de CO₂ crítico** | ICC-500T con sensor S01 (780k) | SCD30 mencionado para Martha; protocolo por especie | ✅ Alineado en filosofía | Hoja de ruta especifica ICC-500T; prototipos (genéricamente) requieren sensor con lógica por especie |
| **Humidificación industrial** | 2 ultrasónicos alta capacidad (3M) | Plan prototipos no aborda Fase 3 humidificación | ⚠️ Complementario | — |
| **Agua tratada** | RO/filtrado + tanque (1.5M) | Prototipos advierten sobre agua dura de Tenjo desde Fase 2 | ✅ Alineado | Hoja de ruta incorpora la recomendación de prototipos |

**Veredicto Fase 3**: Generalmente alineado; hoja de ruta presupuesta a nivel de infraestructura, prototipos a nivel técnico/biológico. Sin conflictos mayores.

---

## Desalineaciones críticas (resumen)

### 1️⃣ **Incubadora omitida en presupuesto**

| Elemento | Hoja de Ruta | Prototipos | Implicación |
|---|---|---|---|
| Incubadora | ❌ No presupuestado | ✅ Prototipo A obligatorio | **Costo oculto ~500–800k COP en Fase 1** |
| Ubicación en flujo | — | Paso 1: esterilización → inoculación → **INCUBADORA** → fructificación | Sin incubadora, no hay reproducción de hongos |

**Recomendación**: Añadir línea presupuestaria en Fase 1:
- Caja Ultraforte 120L: ~150k
- Calentador acuario 50W: ~80k
- SHT31 + Pi Zero 2W: ~150k
- Relé, icopor, insumos: ~100k
- **Subtotal: ~480k COP** → Fase 1 real = 2.849.000 COP (no 2.369.000)

---

### 2️⃣ **Modelo de escalamiento incompatible**

**Hoja de Ruta Fase 2:**
- 3 Martha tents adicionales (uniforme)
- Costo: 1.875k × 3 + 500k compartido = 6.125k COP

**Plan Prototipos:**
- 1 Martha calefaccionada (djamor) + 1 fructificadora de ambiente (5 especies templadas)
- Costo estimado (prototipos no lo costifica): 1.875k + ~1.2k = ~3.075k COP (por par)
- Para escalar a 4 especies = ~2–3 pares = **~6–9M COP comparable** pero con **mayor eficiencia productiva**

**Tensión**: ¿Uniformidad o especialización?

| Criterio | Martha replicada (HR) | Híbrido (Prototipos) | Ganador |
|---|---|---|---|
| Costo equipo Fase 2 | 6.125k | ~6–6.5k (estimado) | ~Empate |
| Flexibilidad especies | Baja (todas usan Martha) | Alta (ambiente para templadas) | Prototipos |
| Uso energético | Alto (calentar 3 Martha) | Bajo (solo djamor calentada) | Prototipos |
| Mantenimiento | Uniforme (simple) | Dual (2 protocolos) | Hoja de Ruta |
| Escalabilidad futura | Linear | Modular por especie | Prototipos |

**Recomendación**: Redocumentar Fase 2 con modelo híbrido como **opción A** (especializado) vs. modelo uniforme como **opción B** (simple). Prototipos favorecen A; hoja de ruta describe B.

---

### 3️⃣ **Arquitectura de sensores y control divergente**

**Fase 1:**
- HR: GrowHub E42A (Vivosun, cloud/marca, 384k)
- Prototipos: Pi Zero 2W + SHT31 en incubadora (local, DIY, ~100–150k)
- **Gap**: Hoja de ruta no menciona control de incubadora en Fase 1

**Fase 2:**
- HR: Inkbird ITC-308 + IHC-200 (local, sin cloud, 195k + 250k = 445k por módulo)
- Prototipos: Asumen escalación lógica de Fase 1 + SCD30 para CO₂ (no especifican)
- **Alineación**: Ambos migran a local en Fase 2 ✅

**Implicación**: 
- Si Fase 1 usa GrowHub (cloud), hay paso medio que Fase 2 debe abandonar → costo de migración
- Si Fase 1 usa Pi Zero (local), escalado natural a Inkbird en Fase 2

**Recomendación**: Considerar **opción alternativa Fase 1** con Pi Zero + SHT31 (sin GrowHub) para consistencia con Fase 2.

---

### 4️⃣ **CO₂ monitoreo: verificación puntual vs. continuo**

**Hoja de Ruta Fase 2:**
- Medidor portátil compartido (500k) → uso puntual para calibración

**Plan Prototipos:**
- SCD30 en Martha Prototipo B → monitoreo continuo
- Tabla de CO₂ máximo **diferenciado por especie** (melena: 800 ppm; shiitake: 1.200 ppm)
- Lógica: FAE se activa cuando CO₂ > límite especie

**Brecha**: Hoja de ruta no especifica lógica de control de FAE por CO₂ en Fase 2. Si solo hay medidor portátil, el FAE (Inkbird ITC + fan) no sabe cuándo encenderse más allá de humedad/horario.

**Recomendación**: Añadir SCD30 o similar en cada módulo Fase 2 para FAE inteligente (si sensibilidad a CO₂ es diferente por especie). Costo adicional: ~300–500k COP por módulo.

---

### 5️⃣ **Spawn inicial no presupuestado**

**Gap común a ambos documentos:**
- Hoja de Ruta: No hay línea "adquisición de spawn"
- Prototipos: Identifica como gap (p. 245): "Spawn de shiitake, melena de León, orellanas blanca/café | 🟡 Media"

**Implicación**: Fase 1 requiere spawn de mínimo 1–2 especies para validación; Fase 2 requiere 5–6.

**Recomendación**: Presupuestar en Fase 0 o Fase 1 presupuesto complementario:
- Spawn de djamor: ~50–100k COP (10 bolsas)
- Spawn de shiitake: ~150–200k COP (complejidad, troncos o bloques)
- Spawn de 3 orellanas: ~100–150k COP
- **Subtotal: ~300–450k COP** que no aparece en presupuesto base

---

## Recomendaciones de alineación

### Corto plazo (antes de compra Fase 1)

1. **Presupuestar incubadora explícitamente** (+480–800k COP a Fase 1)
   - Define si incubación en situ (Prototipo A) o externa/subcontratada
   
2. **Decidir arquitectura de control Fase 1**
   - Opción A (Hoja de Ruta): GrowHub + VIVOSUN (nube, marca)
   - Opción B (Prototipos): Pi Zero + SHT31 en incubadora (local, DIY, compatible Fase 2)
   - Recomendación: **Opción B** para consistencia futura

3. **Presupuestar spawn inicial** (+300–450k COP)
   - Allocate to Fase 1 o "Fase 0 — Preparación"

4. **Documentar decisión de modelo Fase 2**
   - Uniforme (Martha tents × 3) vs. Híbrido (Martha + fructificadora ambiente)
   - Prototipos favorecen híbrido; requiere redocumentación de hoja de ruta

### Mediano plazo (Fase 2)

5. **Implementar FAE inteligente por CO₂ + especie**
   - Agregar SCD30 por módulo (+300–500k)
   - Codificar thresholds por especie en Inkbird o Pi

6. **Validar eficiencia energética del modelo elegido**
   - Si híbrido: cuantificar ahorro de calefacción
   - Si uniforme: documentar por qué

### Largo plazo (Fase 3)

7. **Fase 3 presupuestaría es sólida**
   - Solo ajustar si Fase 2 datos cambian el volumen target

---

## Tabla de síntesis: Qué cambiar en hoja de ruta

| Sección | Cambio propuesto | Justificación | Costo |
|---|---|---|---|
| Fase 1 — Subtotal | +480k (incubadora) → **2.849.000 COP** | Obligatorio en flujo de prototipos | +480k |
| Fase 1 — Equipo | Añadir línea "Incubadora (caja, calentador, SHT31, Pi Zero)" | Hoy omitido | — |
| Fase 1 — Control | Considerar "Opción B: Pi Zero + SHT31" en lugar de solo GrowHub | Consistencia Fase 2, independencia marca | ~-100k o similar |
| Fase 2 — Opción A | Mantener 3 Martha (uniforme) | Simplicidad operativa | 6.125k |
| Fase 2 — Opción B | 1 Martha + 1 fructificadora × 2–3 pares (híbrido especializado) | Eficiencia energética, flexibilidad | ~6–6.5k (similar) |
| Fase 2 — Subtotal CO₂ | +300–500k por módulo (SCD30) | Control inteligente FAE por especie | +900k–1.5M |
| Fase 0 (Nueva) | Spawn inicial (djamor, shiitake, orellanas) | Requisito Fase 1, no presupuestado | +300–450k |

---

## Conclusión

**Hoja de Ruta** y **Plan de Prototipos** son documentos complementarios de buenos fundamentos (fases lógicas, modularidad, independencia de nube). Pero tienen **desalineaciones operacionales** que deben resolverse antes de compra:

1. **Incubación**: presupuestar ~480–800k en Fase 1
2. **Modelo Fase 2**: elegir uniforme (HR) o híbrido (Prototipos) y documentar ambas opciones
3. **Spawn**: presupuestar ~300–450k en Fase 0 o Fase 1
4. **Control**: optar por arquitectura local (Pi Zero) o nube (GrowHub) desde Fase 1, no migrar después
5. **CO₂ inteligente**: si especies tienen thresholds distintos, incluir sensor por módulo en Fase 2

**Impacto presupuestario total Fase 1–2**: +1.5–2.5M COP si se incorporan incubadora + spawn + CO₂ por módulo.  
**ROI**: Validación de parámetros más rápida, menor riesgo de fracaso al escalar.

---

**Próximos pasos:**
- [ ] Revisar con socios/equipo
- [ ] Costificar incubadora (Prototipo A) en detalle
- [ ] Decidir modelo Fase 2: uniforme vs. híbrido
- [ ] Cotizar spawn inicial
- [ ] Redocumentar presupuesto unificado
