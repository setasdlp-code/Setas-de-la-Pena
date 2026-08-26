# Plan de Prototipos Modulares — Setas de la Peña
**Revisión v3:** Junio 12, 2026 | Multi-especie | Calefacción revisada

---

## Hallazgo estratégico: Tenjo es ventaja competitiva, no obstáculo

El clima de Tenjo (12–16 °C ambiente) no es el problema que parecía. Es la **temperatura de fructificación ideal para 5 de las 6 especies del portafolio**. Solo *Pleurotus djamor* necesita calor adicional para fructificar.

Esto redefine completamente la lógica de los prototipos:

- La Martha tent calefaccionada es solo para djamor (y eventualmente reishi)
- Shiitake, melena de león, orellana blanca, orellana café y maitake **fructifican directamente en el ambiente de Tenjo**, sin equipos adicionales
- La incubadora (24–28 °C) sí sirve para todas las especies por igual

Tenjo tiene el clima de un cuarto frío permanente y gratuito.

---

## Tabla maestra de especies — Parámetros completos

| Especie | Incubación T° | Fructificación T° | HR fruct. | CO₂ fruct. | Choque térmico | Fructifica en Tenjo ambient. |
|---|---|---|---|---|---|---|
| *P. djamor* (Orellana rosada) | 24–28 °C | 20–30 °C | 90–95% | <1.000 ppm | ❌ Prohibido | ❌ Necesita Martha tent |
| *P. pulmonarius* (Orellana blanca) | 22–26 °C | 13–21 °C | 85–95% | <1.000 ppm | Leve (opcional) | ✅ Sí |
| *P. pulmonarius/sajor-caju* (Orellana café) | 22–26 °C | 13–21 °C | 85–95% | <1.000 ppm | Leve (opcional) | ✅ Sí |
| *Lentinula edodes* (Shiitake) | 21–24 °C | 10–20 °C | 85–95% | 800–1.200 ppm | ✅ Obligatorio (4 °C / 24h) | ✅ Sí (con choque en nevera) |
| *Hericium erinaceus* (Melena de León) | 21–24 °C | 15–18 °C | 85–95% | 500–800 ppm | No (solo reducir CO₂) | ✅ Sí |
| *Grifola frondosa* (Maitake) | 20–24 °C | 10–18 °C | 85–95% | 1.000–1.200 ppm | Leve | ✅ Sí — Fase 2, colonización lenta (4–6 meses) |

**Nota CO₂ crítica:** Melena de León es la especie más sensible (500–800 ppm). Si se fructifica junto a otras especies en la misma cámara, el CO₂ objetivo de toda la cámara se rige por el límite más estricto.

**Nota Maitake:** Colonización muy lenta y técnicamente demandante. Excluir del prototipo inicial; incorporar en Fase 2 cuando haya procesos estables.

---

## PROTOTIPO A — Incubadora de Calor Húmedo (Wet Heat / Baño María Pasivo)

### Concepto revisado: calentador de pecera + agua + rejilla

En lugar de la alfombrilla QuietWarmth (que calienta en seco y acelera la evaporación del sustrato), se usa el **calentador de acuario 50W como fuente dual de calor y humedad**. Esto se llama sistema *Tub-in-Tub* o incubadora de calor húmedo.

La QuietWarmth queda liberada para la Martha tent, donde es más necesaria.

### Por qué es más viable para la incubadora

| Criterio | QuietWarmth (opción anterior) | Calentador pecera + agua |
|---|---|---|
| Temperatura | Activa a ≈24°C, no regulable | Regulable con termostato integrado del calentador |
| Estabilidad térmica | Media (fluctúa con el ambiente) | Alta (masa térmica del agua amortigua picos) |
| Humedad | Seca el fondo de las bolsas | Genera HR pasiva por evaporación |
| Distribución de calor | Puntual (base) | Uniforme (agua rodea todo) |
| Riesgo de quemadura de micelio | Alto si la rejilla es baja | Bajo (agua como buffer) |
| Gestión de bacterias en agua | N/A | Requiere H₂O₂ en el agua |

### Construcción

**Materiales del inventario:**
- Caja Ultraforte 120L (módulo 1) / Caja organizadora alta resistencia (módulo 2)
- Calentador de acuario 50W
- Rejilla de enfriamiento grande (plataforma elevada para bolsas)
- Láminas de icopor (aislamiento interior paredes + tapa)
- Silicona antihongos (sellado de juntas de icopor)
- SHT31 + Pi Zero 2W + relé 4 canales (monitoreo y corte de emergencia)
- MH-Z19C (verificación de CO₂ durante incubación activa)
- Agua destilada o filtrada + 3 ml de agua oxigenada por litro de agua

**Montaje:**
1. Forrar el interior de la caja con icopor en las 4 paredes y la tapa. Sellar juntas con silicona antihongos.
2. Llenar el fondo con **5–7 cm de agua** (suficiente para sumergir el calentador pero no tocar la rejilla).
3. Agregar 3 ml de agua oxigenada por litro de agua → inhibe bacterias sin afectar el micelio.
4. Colocar el **calentador de acuario 50W** sumergido, configurado a **27 °C** (crea un ambiente interior de 24–26 °C por convección).
5. Colocar la **rejilla de enfriamiento** sobre el agua como plataforma, dejando las bolsas elevadas mínimo 5 cm sobre el nivel del agua.
6. Instalar el **SHT31** en la parte media de la caja (no sobre el agua, no sobre las bolsas).
7. 2 orificios de 38 mm con Poly-fil en lados opuestos para ventilación pasiva de CO₂ e intercambio mínimo.
8. El **relé** controla el calentador de forma de seguridad (corta si T > 29 °C), aunque el termostato del calentador es la primera línea de control.

### Parámetros objetivo y qué sirve para qué especie

| Parámetro | Valor incubadora | Compatible con |
|---|---|---|
| Temperatura | 24–27 °C | Todas las especies (ajustar calentador a 24°C para shiitake/melena) |
| HR interna | 70–80% (pasiva del agua) | Todas las especies |
| CO₂ | 5.000–10.000 ppm (tolerable en incubación) | Todas las especies |
| Luz | Oscuridad total | Todas las especies |

**Para shiitake y melena de León:** bajar el termostato del calentador a 24°C (no 27°C) para incubación más fría y conservadora.

### Escalabilidad modular

Cada caja adicional = un módulo paralelo. Comparten el Pi Zero 2W si se conectan varios SHT31 en bus I2C (hasta 4 sensores por bus, distintas direcciones). La replicación tiene costo casi nulo: solo el costo de la caja y un segundo calentador de acuario barato.

---

## PROTOTIPO B — Fructificadora Martha Tent: Sistema de Calefacción Revisado

### El problema real de calefacción en Tenjo

La Martha tent para *P. djamor* debe mantener 20–28 °C cuando el ambiente es 12–16 °C. Hay que añadir 8–12 °C de diferencia. El desafío: **calentar sin secar el aire**.

### Por qué el calentador cerámico PTC es la peor opción

Un PTC expulsa aire caliente y extremadamente seco. Activa el humidificador en ciclos frenéticos para compensar, crea gradientes térmicos que estresan los hongos, y el chorro directo de aire caliente sobre bolsas o primordios los reseca y aborta. Descartado.

### Solución elegida: Calor radiant pasivo + niebla tibia (inventario existente)

Sistema en dos capas con lo que ya está disponible:

**Capa 1 — Aislamiento exterior de la carpa (costo cero):**
- Envolver la carpa Martha externamente con láminas de icopor del inventario, fijadas con cinta y silicona.
- Esto reduce la pérdida de calor en ≈40–50%, bajando la demanda de calefacción de 8–12 °C a 4–6 °C de diferencia a cubrir.

**Capa 2 — QuietWarmth bajo la carpa (inventario existente, antes asignada a incubadora):**
- La alfombrilla se coloca **bajo** la base de la carpa Martha.
- Calienta el piso de la carpa por conducción, y ese calor asciende lentamente por convección.
- Al no estar dentro de la carpa, no genera flujo de aire que seque los hongos.
- La alfombrilla activa a ≈24 °C → exactamente en el rango de djamor.
- El SHT31 monitorea → el relé corta la alfombrilla si T > 27 °C.

**Capa 3 — VIVOSUN con agua tibia (inventario existente):**
- El **calentador de acuario 50W** se coloca en el depósito de agua del VIVOSUN AeroStream.
- Agua a 30–32 °C → niebla sale a mayor temperatura → efecto doble: humedad + aporte térmico suave.
- Esto añade 2–4 °C adicionales al interior de la carpa de forma invisible y sin corrientes de aire.

**Resultado combinado:**
- Icopor exterior: reduce pérdida → necesita cubrir 4–6 °C
- QuietWarmth bajo carpa: aporta 3–5 °C de calor radiant
- Niebla tibia VIVOSUN: aporta 2–4 °C adicionales
- **Total estimado cubierto: 5–9 °C sobre ambiente**
- Con ambiente de 14–16 °C → interior de la carpa: 20–25 °C ✅ Rango de djamor

Si Tenjo tiene noches muy frías (≤10 °C), el sistema puede ser insuficiente en invierno. En ese caso, la única adquisición necesaria sería una **manta térmica de 100W adicional** (~$40.000–$70.000 COP). No un PTC.

### Fructificadora para las demás especies (sin calefacción)

Para shiitake, melena de León, orellana blanca y café, la Martha tent **NO es necesaria para fructificación**. Se puede construir una **fructificadora de ambiente** con los recursos ya disponibles:

- Caja transparente o espacio abierto y húmedo a temperatura ambiente de Tenjo (12–16 °C)
- VIVOSUN compartido en ciclos con la Martha tent (o un humidificador más simple)
- La estantería de aluminio sirve como estructura base
- Bolsas abiertas o perforadas colgadas con ganchos S

Esto significa que los recursos de automatización pueden enfocarse en la Martha tent (djamor) mientras que las demás especies se manejan con protocolos más simples.

**Excepción — Shiitake:** Necesita choque térmico obligatorio de 2–4 °C por 24h para inducir primordios. En Tenjo esto se resuelve fácilmente: colocar las bolsas directamente en el ambiente exterior nocturno de Tenjo (que puede bajar a 8–10 °C) por una noche, o usar la nevera doméstica por 24h.

---

## Sistema de ventilación FAE revisado (sin reductor de conductos)

El reductor de conductos galvanizado queda fuera del diseño. La solución de FAE se simplifica:

**Martha tent (djamor):**
- **Noctua NF-P12** montado en la parte **inferior** de la carpa, extrayendo CO₂ acumulado en la base (el CO₂ es gas denso, se acumula abajo).
- La salida del Noctua va directamente a un trozo de **manguera de jardín reforzada** (~10 cm) que conduce el aire hacia fuera de la carpa. Sin reductor, sin adaptadores complejos.
- Entrada de aire fresco: apertura controlada en la parte **superior** de la carpa cubierta con Poly-fil compactado.
- El Pi 4 controla el Noctua por relé según lectura del SCD30: ON si CO₂ > 900 ppm, OFF si < 700 ppm.

**Fructificadora de ambiente (especies templadas):**
- FAE natural por apertura/cierre programada o manual.
- Si se usa una caja cerrada: 2–4 orificios con Poly-fil en posiciones inferior y superior.
- Sin ventilación forzada activa necesaria a escala de prototipo.

---

## Flujo de producción multi-especie

```
                    ┌─────────────────────────────────────┐
                    │         AUTOCLAVE 44L                │
                    │  (Esterilización bolsas PP 20×50)    │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │         SAB (Inoculación)            │
                    │  Todas las especies en la misma      │
                    │  estación de trabajo                 │
                    └──────────┬───────────────────────────┘
                               │
          ┌────────────────────▼────────────────────────┐
          │       INCUBADORA (Wet Heat, 24–27 °C)        │
          │   Todas las especies incuban aquí 22–30 días │
          └───┬───────────────────────────┬─────────────┘
              │                           │
    ┌─────────▼──────────┐   ┌────────────▼──────────────────┐
    │  MARTHA TENT       │   │  FRUCTIFICADORA DE AMBIENTE   │
    │  (Calefaccionada)  │   │  (Tenjo ambient. 12–16 °C)    │
    │  20–28 °C          │   │  Sin calefacción              │
    │                    │   │                               │
    │  P. djamor         │   │  Shiitake (+ choque nevera)   │
    │  (tropical)        │   │  Melena de León               │
    │                    │   │  Orellana blanca              │
    │                    │   │  Orellana café                │
    └────────┬───────────┘   └────────────┬──────────────────┘
             │                            │
             └──────────────┬─────────────┘
                            │
                    ┌───────▼────────┐
                    │    COSECHA     │
                    │  3–4 flushes   │
                    └────────────────┘
```

---

## Tabla de sensibilidad CO₂ y ventilación por especie

Esta es la variable más crítica y diferenciadora entre especies. El SCD30 debe estar configurado con alertas por especie.

| Especie | CO₂ máx. seguro | CO₂ alerta | Consecuencia de exceso |
|---|---|---|---|
| Melena de León | 800 ppm | 700 ppm | Espinas alargadas, forma coraliforme — pérdida total de calidad |
| Orellana blanca / café | 800–1.000 ppm | 900 ppm | Tallos largos, sombreros pequeños |
| *P. djamor* | 1.000 ppm | 900 ppm | Deformación, coraling |
| Shiitake | 1.200 ppm | 1.000 ppm | Sombreros pequeños, crecimiento atrofiado |
| Maitake (Fase 2) | 1.200 ppm | 1.000 ppm | Rosetas subdesarrolladas |

**Implicación práctica:** Si se decide fructificar melena de León en la Martha tent junto a djamor, el CO₂ objetivo de toda la tent baja a <800 ppm → el Noctua debe encenderse con mayor frecuencia → mayor pérdida de humedad → el VIVOSUN trabaja más. Por esto se recomienda **fructificar melena de León en la zona de ambiente**, donde el FAE natural es mayor.

---

## Asignación revisada del inventario de calefacción

| Item | Uso anterior | Uso revisado |
|---|---|---|
| Alfombrilla QuietWarmth | Incubadora A | **Martha tent** (bajo la base, calor radiant) |
| Calentador acuario 50W | Auxiliar / VIVOSUN | **Incubadora A** (baño maría pasivo + HR) + también calienta agua VIVOSUN |
| Láminas de icopor | Incubadora A | Incubadora A (interior) **+ Martha tent (exterior)** |
| VIVOSUN AeroStream 5L | Martha tent | Martha tent (con agua tibia desde calentador acuario) |

Se necesitan **2 calentadores de acuario**: uno en la incubadora y uno en el depósito del VIVOSUN. El inventario solo tiene uno. Solución: usar el mismo calentador en la incubadora, y para el VIVOSUN usar un recipiente con agua calentada manualmente (termo) en el corto plazo, o adquirir un segundo calentador barato (~$15.000–$25.000 COP).

---

## Gaps actualizados

| Gap | Prioridad | Solución |
|---|---|---|
| Segundo calentador de acuario (para VIVOSUN) | 🔴 Alta | Comprar uno económico $15.000–$25.000 COP |
| Choque térmico shiitake | 🟡 Media | Nevera doméstica o ambiente exterior nocturno Tenjo |
| PWM para Noctua (control de velocidad) | 🟡 Media | Transistor NPN + GPIO del Pi 4 (componente ~$2.000 COP) |
| Fructificadora de ambiente con humedad controlada | 🟡 Media | Caja con tapa de plástico del inventario + VIVOSUN en ciclos |
| Spawn de shiitake, melena de León, orellanas blanca/café | 🟡 Media | Adquisición de semilla para expandir portafolio (aún no en inventario) |
| Manta térmica adicional (si noches < 10 °C en Tenjo) | 🟢 Baja | Solo si el sistema de 3 capas es insuficiente en invierno |
| Maitake spawn + protocolo largo | 🟢 Baja | Fase 2, no antes de 6 meses de operación estable |

---

## Producción estimada multi-especie en régimen estable

Asumiendo rotación escalonada entre especies:

| Especie | Ciclo completo (incub. + flush 1) | BE estimada | kg/flush (10 bolsas) |
|---|---|---|---|
| *P. djamor* | 30–38 días | 25–30% | 2,0–2,5 kg |
| Orellana blanca/café | 35–45 días | 20–25% | 1,6–2,0 kg |
| Shiitake | 60–90 días | 40–60% (sobre tronco/bloque) | 3,2–4,8 kg |
| Melena de León | 35–50 días | 20–30% | 1,6–2,4 kg |

**Diferenciador de mercado:** La combinación de djamor (visual, rosa, raro), shiitake (precio premium, alta BE), y melena de León (medicinal, precio muy alto) en un mismo prototipo crea un portafolio que puede apuntar a restaurantes, tiendas gourmet y mercados de salud simultáneamente desde el mismo espacio de producción.
