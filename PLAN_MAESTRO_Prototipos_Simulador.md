# PLAN MAESTRO: Desarrollo de Prototipos + Simulador de Recetas
**Setas de la Peña — Junio 26, 2026**

*Integración: Prototipo A (Incubadora) + Prototipo B (Martha tent) + Bloques/Sustrato + Simulador de Recetas v4.0*

---

## Visión

Tú tienes:
- ✅ Spawn viejo (datos degradación)
- ✅ Autoclave (producción bloques/sustrato)
- ✅ Martha tent + VIVOSUM (Prototipo B)
- ✅ Simulador de recetas (requiere datos reales)
- ✅ SAB casero

**Objetivo**: En 4–5 semanas, desarrollar dos **prototipos replicables** que **cualquier socio/empleado pueda reproducir**, alimentados con datos que mejoren el simulador de recetas.

**Diferenciador**: No es solo automatización. Es un **ecosistema de aprendizaje**:
- Datos reales → Simulador predice → Validas → Ajustas → Siguiente batch
- Prototipos documentados para que otros los repliquen
- Herramientas (sensores, código) están integradas en el proceso

---

## Infraestructura que tienes

| Equipo | Uso | Estado |
|---|---|---|
| **Autoclave All American 44L** | Producción bloques/sustrato | ✅ Listo |
| **Martha tent Terra Fungus** | Prototipo B — fructificación djamor | ✅ Listo |
| **VIVOSUN 5L humidificador** | Martha tent + humedad | ✅ Listo |
| **SAB casero (caja 120L)** | Inoculación aséptica | ✅ Funcional (con limitaciones) |
| **Spawn existente** (2 kg rosa, 2 kg gris, 2 kg blanco, 2 kg melena) | Inoculación | ⚠️ Viejo, riesgo viabilidad |
| **SHT31 + Pi Zero** | Sensores temperatura/HR | ❓ ¿Listo o requiere setup? |
| **Simulador Recetas v4.0** | Optimización + feedback | ✅ Existe, requiere datos |

---

## FASE 1: Construcción Prototipo A (Incubadora) — Semana 1

### 1.1 Estudio y especificación (Día 1–2)

**Referencia**: Plan de Prototipos v3, pp. 37–46 (Prototipo A: Incubadora de Calor Húmedo)

**Tu tarea**: Leer especificación completa y listar:
- [ ] Materiales necesarios (caja, icopor, calentador, sensores)
- [ ] Qué tienes en inventario
- [ ] Qué necesitas comprar URGENTE (esto semana)
- [ ] Presupuesto 

**Documento entrega**: `Prototipo_A_BOM.md` (Bill of Materials)
- Item | Especificación | Tienes? | Costo | Proveedor | Entrega

---

### 1.2 Ensamblaje (Día 3–4)

Siguiendo Prototipo A (pp. 68–76):

**Construcción paso a paso:**
1. Forrar interior caja Ultraforte con icopor 5 cm
2. Sellar juntas con silicona antihongos
3. Llenar fondo: 5–7 cm agua destilada + agua oxigenada
4. Instalar calentador acuario 50W (sumergido, ajustado a 27°C)
5. Colocar rejilla de enfriamiento elevada
6. Instalar SHT31 en posición media (monitoreo T/HR)
7. Orificios Poly-fil (ventilación pasiva)

**Resultado esperado**: Caja sellada, aislada, con calor pasivo + humedad + monitoreo

**Documento entrega**: `Prototipo_A_Ensamblaje.md` (fotos + checklist verificación)

---

### 1.3 Validación (Día 5–7)

**Sin hongos aún**: Solo validar que sistema funciona

```
Test de estabilidad térmica (48h):
- Llena con agua + sensores
- Mantén 27°C
- Registra T/HR cada hora
- ¿Fluctuación < ±1°C? → Pase
- ¿HR alcanza 70–80% solo con agua? → Pase
```

**Documento entrega**: `Prototipo_A_Validacion.md` (gráfico T/HR estabilidad)

---

## FASE 2: Construcción Prototipo B (Martha tent con sensores) — Semana 2

### 2.1 Adaptación Martha tent (Día 8–10)

**Referencia**: Plan de Prototipos v3, pp. 95–132 (Prototipo B: Martha tent calefaccionada para djamor)

Tu Martha tent Terra Fungus ya existe. **Misión**: Instrumentarla según Prototipo B.

**Tareas**:
1. Icopor aislamiento exterior (plan prototipos: 40–50% reducción pérdida térmica)
2. Calentador acuario en depósito VIVOSUN (agua tibia)
3. Noctua NF-P12 + SCD30 (FAE inteligente por CO₂)
4. SHT31 en interior (monitoreo T/HR en fructificación)
5. Relé 4 canales para corte emergencia (si T > 27°C)

**Documento entrega**: `Prototipo_B_Setup.md` (diagrama + checklist)

---

### 2.2 Programación sensores (Día 10–11)

**Si SHT31 + Pi Zero no está listo, hazlo AHORA**:

```python
# Script mínimo (30 líneas)
import board
import busio
import adafruit_sht31d
import csv
from datetime import datetime

i2c = busio.I2C(board.SCL, board.SDA)
sensor = adafruit_sht31d.Adafruit_SHT31D(i2c)

while True:
    temp = sensor.temperature
    humidity = sensor.relative_humidity
    
    with open('Martha_readings.csv', 'a') as f:
        writer = csv.writer(f)
        writer.writerow([datetime.now(), temp, humidity])
    
    time.sleep(900)  # Cada 15 minutos
```

**Entrega**: Código + instrucciones instalación

---

### 2.3 Validación Martha (Día 12)

Idem Prototipo A: 24–48h sin hongos, solo verificar:
- T mantiene 24–27°C (rango djamor)
- HR alcanza 90–95%
- SCD30 lee CO₂ ~400–500 ppm (baseline ambiente)
- Noctua responde a señal FAE

---

## FASE 3: Producción de Bloques/Sustrato — Semana 2–3

### 3.1 Receta de sustrato (Día 8–9)

**Decisión crítica**: ¿Qué sustrato vas a usar?

**Opciones comunes para setas**:
- A. Aserrín duro (roble, encina) + aglutinante (almidón o goma)
- B. Paja de trigo + cal + aserrín
- C. Compost + aglutinante
- Otras (específico por especie)

**Para el simulador**: necesitarás registrar:
- Composición % (aserrín, paja, cal, etc.)
- Humedad pre-esterilización
- Densidad compactación
- Esterilización: T, presión, tiempo

**Documento entrega**: `Sustrato_Receta_Base.md`
```
# Receta Sustrato Base

Ingredientes (por 10 kg):
- Aserrín roble: 8 kg
- Paja triturada: 1 kg
- Cal apagada: 100 g
- Goma guar (aglutinante): 20 g

Humedad pre-autoclaving: 65%
Densidad compactación: ~700 kg/m³

Esterilización: 15 PSI, 2.5 horas (All American 44L)
```

---

### 3.2 Preparación bloques (Día 10–12)

Usando autoclave All American 44L:

```
Procedimiento:
1. Mezcla sustrato según receta
2. Humedece a 65%
3. Llena bolsas de cultivo (10 × 20×50 cm por batch)
4. Compacta uniformemente
5. Esteriliza en autoclave:
   - 15 PSI (1 atm)
   - 121°C mínimo
   - 2.5 horas mantención
   - Enfría sin abrir (48h)
6. Traslada a SAB estéril antes de inocular
```

**Documento entrega**: `Autoclave_Log.md`
```
Batch | Fecha | Especie | Bolsas | Presión | Tiempo | Resultado |
1     | Jun26 | Rosa    | 10     | 15 PSI  | 2:30   | OK        |
```

---

## FASE 4: Inoculación + Captura de Datos — Semana 2–3

### 4.1 Inoculación djamor (Día 13)

**Rosa (tropical)**: primer batch crítico

```
Inoculación en SAB (caja 120L):
- Desinfecta interior con alcohol
- Espera 15 min
- Abre bolsa sustrato
- Inocula: 50g spawn (viabilidad testada) en bolsa sustrato
  → Mezcla bien (1–2 min agitación)
- Sella bolsa (triple nudo, sellador si tienes)
- FOTO (baseline)
- A Prototipo A incubadora: 24–27°C, oscuridad, 70–80% HR

Esperado:
- Día 3–5: Primer crecimiento micelio visible
- Día 10: 50% colonizado
- Día 18–22: 100% colonizado
```

**Captura datos INCUBACIÓN** (Prototipo A):

```
CSV: Batch_Rosa_Jun26_Incubacion.csv

Día | Hora | Temp (°C) | HR (%) | Colonización (%) | Contaminación | Notas
0   | 10am | 25       | 72    | 0%              | No            | Inoculado
3   | 10am | 25       | 73    | 5%              | No            | Micelio visible
7   | 10am | 25       | 71    | 20%             | No            | Avance rápido
...
22  | 10am | 25       | 75    | 100%            | No            | Listo fructificación
```

**Sensores automáticos** (si SHT31 listo):
- CSV automático: timestamp, T, HR
- Manual: fotos diarias, colonización visual, contaminación

---

### 4.2 Inoculación orellana gris (Día 13 también)

**Gris (templada)**: control comparativo, ambiente Tenjo

```
Mismo proceso Rosa, pero:
- A ambiente Tenjo (NO incubadora)
- Temperatura ambiente ~12–18°C
- HR natural ~60–70% (sin control)

Esperado:
- Colonización más LENTA (frío)
- Días 25–30 para 100% (vs. día 22 Rosa)
- Pero sin costo energético
```

---

## FASE 5: Fructificación + Datos simulador — Semana 3–4

### 5.1 Movimiento a fructificación

**Día 22–25** (Rosa colonizada):

```
Orellana Rosa → Prototipo B (Martha tent):
- Abre bolsa (3–5 perforaciones)
- Coloca en Martha: 24–28°C, HR 90–95%, luz 12h, FAE cíclico
- SHT31 monitorea interior
- SCD30 monitorea CO₂ (target: < 900 ppm para djamor)

Orellana Gris → Ambiente Tenjo abierto:
- Abre bolsa
- Caja/estantería abierta: 12–18°C, HR 85–95% (spray manual), luz opcional, FAE natural
- SHT31 monitorea
```

**Captura datos FRUCTIFICACIÓN**:

```
CSV: Batch_Rosa_Jun26_Fructificacion.csv

Día | Hora | Temp | HR | CO₂ | Primordios? | Tamaño (mm) | Peso est. (g) | Cosecha (s/n) | Peso real (g)
0   | 10am | 25   | 92 | 450 | No         | —           | —             | No            | —
3   | 10am | 24   | 93 | 500 | No         | —           | —             | No            | —
5   | 10am | 25   | 91 | 680 | Sí         | 5           | ~150–200      | No            | —
10  | 10am | 26   | 89 | 720 | Sí         | 20          | ~400–500      | No            | —
14  | 10am | 25   | 91 | 650 | Sí         | Listo       | ~500–600      | Sí            | 520
```

---

### 5.2 Cosecha + cálculo BE

**Flush 1 (Día 14–16)**:

```
Rosa (10 bolsas esperadas):
- Bolsa 1: 520 g
- Bolsa 2: 510 g
- Bolsa 3: 495 g
- Bolsa 4: 515 g
- Bolsa 5: 505 g
- Bolsa 6: 530 g
- Bolsa 7: 500 g
- Bolsa 8: 485 g
- Bolsa 9: 520 g
- Bolsa 10: 510 g
TOTAL: 5.085 kg

Peso sustrato seco por bolsa: ~200g × 10 = 2 kg
BE = (5.085 / 2) × 100 = 254.5% 
⚠️ Esto está muy alto; revisar si es error o sustrato ultra-húmedo

BE realista rosa esperado: 25–30%
```

---

## FASE 6: Alimentar simulador — Semana 4–5

### 6.1 Estructura de datos para simulador v4.0

**El simulador de recetas necesita**:

```
ENTRADA (from your batches):
{
  "receta": "Rosa Batch 1",
  "especie": "Pleurotus djamor",
  "sustrato": {
    "composicion": "aserrín roble 80%, paja 10%, cal 1%, goma 1%",
    "humedad_pre": 65,
    "densidad": 700,
    "esterilizacion": "121°C, 15 PSI, 2.5h"
  },
  "spawn": {
    "cepa": "rosa vieja",
    "viabilidad_estimada": 60,  // ← DATO: degradación por envejecimiento
    "cantidad": 50  // g por bolsa
  },
  "incubacion": {
    "temperatura": 25,
    "humedad": 73,
    "dias": 22,
    "colonizacion_dia_22": 100,
    "contaminacion": false
  },
  "fructificacion": {
    "temperatura": 25,
    "humedad": 91,
    "co2_ppm": 720,
    "dias": 14,
    "primordios_dia": 5
  },
  "cosecha": {
    "peso_fresco_total": 5085,  // g
    "bolsas": 10,
    "sustrato_seco_total": 2000,  // g
    "be_calculado": 254.5,  // ⚠️ revisar
    "be_esperado": 28,
    "calidad": "sombreros bien formados, tallos cortos"
  }
}

OUTPUT (simulador predice próximo batch):
"Si repites exactamente con spawn NUEVO (viabilidad 90%),
 BE debería aumentar a 35–38% (ajuste por viabilidad +25%)"
```

---

### 6.2 Carga al simulador

**Tarea**: Integrar datos a `simulador_sustrato_v4.0.html`

¿Cómo funciona el simulador?
- [ ] ¿Toma JSON por input form?
- [ ] ¿Lee CSV y parsea?
- [ ] ¿Tiene API?

**Necesito que clari**: ¿Cómo alimentas datos al `recipe-recommender.js`?

---

## FASE 7: Documentación Prototipos (Semana 4–5)

### 7.1 Prototipo A — Manual de construcción

Documento: `Prototipo_A_Manual_Construccion.md`

```
# Prototipo A: Incubadora de Baño María Pasivo

## Para qué sirve
Incubación de micelio (colonización) a 24–27°C con HR pasiva 70–80%,
para TODAS las especies (djamor, shiitake, melena, orellanas).
Tiempo: 18–25 días colonización.

## Qué necesitas
- Caja Ultraforte 120L (~150k COP)
- Icopor 5 cm (~100k)
- Calentador acuario 50W (~75k)
- SHT31 + Pi Zero (~150k)
- Agua + silicona + insumos (~200k)
TOTAL: ~675k COP

## Paso a paso construcción
[detallado, con fotos]

## Validación
[checklist]

## Costos variables: sustrato, spawn, bolsas
```

---

### 7.2 Prototipo B — Manual de configuración Martha

Documento: `Prototipo_B_Manual_Martha.md`

```
# Prototipo B: Martha Tent Calefaccionada (djamor)

## Para qué sirve
Fructificación de Pleurotus djamor a 20–28°C con HR 90–95%,
ciclos FAE inteligentes por CO₂ (< 900 ppm).
Tiempo flush: 10–15 días desde primordios.

## Qué necesitas
- Martha tent + VIVOSUN existente (tienes)
- Icopor aislamiento (~100k)
- Noctua + SCD30 (~250k)
- SHT31 + relé (~150k)
TOTAL incremental: ~500k COP

## Setup paso a paso
[diagrama + checklist]

## Cuidados operativos
[protocolo diario]
```

---

### 7.3 Receta Base Sustrato

Documento: `Sustrato_Receta_Base_Publicable.md`

```
# Sustrato Base para Cultivo en Bloques

Replicable, bajo costo, validado en Tenjo.

Ingredientes (10 kg):
...

Esterilización (All American 44L):
...

Rendimiento esperado:
- djamor: 25–30% BE
- gris: 22–26% BE
- blanca: 20–25% BE
```

---

## 📊 Cronograma comprimido

| Semana | Hito | Entregables |
|---|---|---|
| **W1** (Jun 17–23) | Prototipo A construcción + validación | BOM + ensamblaje + gráfico validación |
| **W2** (Jun 24–30) | Prototipo B setup + inoculación | Setup + inoculación Rosa + Gris |
| **W3** (Jul 1–7) | Incubación en progreso + bloques | Datos incubación diarios + bloques producidos |
| **W4** (Jul 8–14) | Fructificación + cosecha | Datos fructificación + peso cosecha |
| **W5** (Jul 15–21) | Simulador + análisis | Datos al simulador + recetas optimizadas |

---

## 🎯 Deliverables finales (para replicación)

1. **Prototipo A Manual** — "Cómo construir incubadora" (PDF)
2. **Prototipo B Manual** — "Cómo instrumentar Martha" (PDF)
3. **Receta Sustrato Base** — "Composición + protocolo esterilización" (PDF)
4. **Dataset Completo Batch 1** — CSVs T/HR/colonización/cosecha
5. **Análisis Simulador** — "Qué aprendimos, próximas iteraciones"

**Uso**: Empleado/socio nuevo recibe 5 documentos + SAB + autoclave → replica Prototipos A + B en 2 semanas.

---

## ⚠️ Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Spawn viejo fracasa (viabilidad < 50%) | Rosa no coloniza, pérdida time | Test viabilidad día 1; tener plan B (compra emergente) |
| SAB casero: 50–80% contaminación | Datos sucios | Documentar patrón contaminación (ubicación, tipo); es dato valioso |
| SHT31 no funciona | Datos manuales solo (menos precisos) | Sensores no son bloqueador; datos manuales + fotos validar |
| Martha tent no mantiene T | Primordios retrasados | Agregar aislamiento icopor exterior (contingencia) |
| Simulador no entiende formato datos | Datos no se cargan | Flexibilidad: si necesita JSON, lo hago; si CSV, lo hago |

---

## 🔬 Validaciones cruzadas

**Antes de empezar**, confirma:

1. ¿Autoclave funciona? (test: destila agua, presión, temp)
2. ¿SHT31 + Pi Zero están listos O puedo montarlos esta semana?
3. ¿SAB casero fue testeado (sellado, sin fugas)?
4. ¿Tengo 50 bolsas PP 20×50 vacías para cultivo?
5. ¿Simulador v4.0 HTML — cómo exactamente alimento datos?

**Si hay bloqueador en 1–5, comunicame ASAP para ajustar plan.**

---

## Mindset

✅ **Esto NO es producción. Es I+D con restricciones reales.**
- Spawn viejo = dato de degradación
- SAB casero contaminado = dato de riesgo DIY
- Batches "imperfectos" = input más valioso para simulador
- Objetivo: prototipo replicable, no perfecto

✅ **Herramientas (sensores, simulador, protocolos) son el producto.**
- El batch de setas es el vehículo
- Lo que importa es: ¿Puedo predecir BE en batch siguiente?
- Si el simulador acierta, tienes diferenciador defensible

✅ **Ecosistema iterativo**:
- Batch 1 → Datos → Simulador aprende → Predice Batch 2
- Batch 2 valida/refuta → Ajusta modelo
- Cycle: ~4 semanas por batch

---

**LISTO PARA COMENZAR?**

Si respondes esto, empezamos Semana 1 (construcción Prototipo A) mañana lunes Jun 17.
