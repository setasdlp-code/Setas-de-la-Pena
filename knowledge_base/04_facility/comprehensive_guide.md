# Adecuación de Espacios para Cultivos de Setas
## Guía Completa de Diseño, Equipamiento y Operación

**Documento compilado desde la Knowledge Base de Setas de la Peña**
**Última actualización: 2026-07-23**

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Principios Fundamentales](#principios-fundamentales)
3. [Arquitectura General de Zonas](#arquitectura-general-de-zonas)
4. [Tratamiento de Sustrato: Pasteurización y Esterilización](#tratamiento-de-sustrato--pasteurización-y-esterilización)
5. [Adecuación por Tipo de Espacio](#adecuación-por-tipo-de-espacio)
6. [Laboratorio de I+D y Producción de Spawn](#laboratorio-de-id-y-producción-de-spawn)
7. [Zona de Incubación](#zona-de-incubación)
8. [Cámara de Fructificación](#cámara-de-fructificación)
9. [Control Ambiental y Automatización](#control-ambiental-y-automatización)
10. [Equipamiento Crítico](#equipamiento-crítico)
11. [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
12. [Protocolos de Asepsia](#protocolos-de-asepsia)
13. [Limpieza, Desinfección y Biosecurity Procedural](#limpieza-desinfección-y-biosecurity-procedural)
14. [Identificación y Prevención de Contaminantes](#identificación-y-prevención-de-contaminantes)
15. [Mejores Prácticas](#mejores-prácticas)
16. [Modos de Fallo Común](#modos-de-fallo-común)

---

## Resumen Ejecutivo

La adecuación de espacios para cultivo de setas requiere separación física y funcional de zonas según el nivel de contaminación esperado. El diseño modular, basado en flujo unidireccional (zona sucia → zona limpia → incubación → fructificación), minimiza contaminación cruzada y permite escalamiento progresivo.

**Estructura de 5 Zonas:**
- **Zona 1:** Preparación de sustrato (sucio)
- **Zona 2:** Inoculación (limpio, crítico)
- **Zona 3:** Incubación (control de T°)
- **Zona 4:** Fructificación (control ambiental completo)
- **Zona 5:** Almacenamiento y procesamiento

Cada zona puede ser física (cuartos separados) o temporal (sequencia horaria en mismo espacio), dependiendo de presupuesto y escala.

---

## Principios Fundamentales

### 1. Flujo Unidireccional
El material se mueve de zonas sucias a limpias, NUNCA en dirección inversa. Los operarios deben tener calzado y EPP dedicados para las zonas limpias.

```
Sustrato Preparado → Inoculación → Incubación → Fructificación → Cosecha → Almacenamiento
      ↓
 (No regresa)
```

### 2. Separación Física Sucio/Limpio
La inoculación NO PUEDE ocurrir en la intemperie ni cerca de fuentes de contaminación (cocina, baños, mascotas). Requiere:
- Barrera física (puerta, cortina)
- Superficies limpias y desinfectables
- Sin corrientes de aire exterior

### 3. Control de Temperatura Independiente
La incubación (20–24°C) y la fructificación (varía por especie, típicamente 13–30°C) necesitan control separado de T° para no interferirse.

### 4. Presión Positiva en Zona Limpia
El aire debe fluir desde zonas limpias hacia zonas sucias, NO al revés. Esto evita que contaminantes transportados por aire entren en la zona de inoculación.

### 5. Oscuridad en Incubación, Luz Controlada en Fructificación
- **Incubación:** Micelio no necesita luz; la oscuridad reduce contaminantes fotosintéticos.
- **Fructificación:** Luz necesaria para inducción de fructificación (750–1,500 lux, 3–5h/día).

---

## Arquitectura General de Zonas

### Zona 1: Preparación de Sustrato (Sucio)

**Localización:** Garaje, bodega, cuarto con acceso a agua y calor.

**Actividades:**
- Almacenamiento de materia prima seca (paja, aserrín, pellets, salvado, cal)
- Hidratación de sustrato
- Pasteurización
- Embolsado

**Equipamiento:**
- Olla o tanque de pasteurización (40–100 L)
- Mesón metálico para trabajo
- Racks metálicos para almacenamiento (contenedores sellados)
- Fuente de calor (autoclave, olla de presión, estufa industrial)
- Desagüe

**Consideraciones:**
- Separación física con cortina o panel de la zona limpia
- Ventilación adecuada si se usa propano (riesgo de CO)
- Protección de materia prima contra plagas y humedad (bolsas abiertas = contaminación)
- Piso lavable o cubierto

**Flujo de salida:** Bolsas inoculadas suben a Zona 3 (Incubación), nunca regresan a Zona 1.

---

## Tratamiento de Sustrato: Pasteurización y Esterilización

### Diferencia: Pasteurización vs. Esterilización

| Aspecto | Pasteurización | Esterilización |
|---------|---|---|
| Temperatura | 75–82°C | **121°C** (presión 15 psi) |
| Tiempo | 60–90 minutos | 2–4 horas |
| Elimina | Organismos competidores (Trichoderma, bacterias) | Todo (incluso esporas) |
| Microbiota beneficiosa | Preserva algo | Terreno completamente limpio |
| Equipo | Olla, tanque, fuente de calor | Autoclave o olla de presión |
| Costo | Bajo (US$0–50 por batch) | Medio (US$200–2,000 equipo) |
| Uso recomendado | Sustratos simples (paja sin suplementar) | Sustratos complejos (Master's Mix, salvado >10%) |
| Especies | P. djamor, P. ostreatus (bajo riesgo) | L. edodes, H. erinaceus (alto riesgo) |

### Pasteurización — Métodos

#### Método 1: Inmersión en Agua Caliente (Recomendado para Tenjo)

**Protocolo paso-a-paso:**

```
1. PREPARACIÓN (la noche anterior)
   └─ Hidratar paja: sumergir en agua limpia 12–24h
   
2. CALENTAMIENTO (mañana del día 0)
   └─ Llenar olla/tanque con agua; calentar a 80–82°C
   └─ Usar termómetro de cocina para verificar
   
3. PASTEURIZACIÓN
   └─ Sumergir paja en bolsa de malla o directamente
   └─ Mantener 80–82°C por exactamente 60–90 minutos
   └─ CRÍTICO: Verificar termómetro en el CENTRO de la masa (no solo superficie)
   
4. ESCURRIMIENTO
   └─ Sacar bolsa o colar sustrato en colador/malla
   └─ Dejar drenar 10–15 minutos
   
5. ENFRIAMIENTO
   └─ Extender sustrato en superficie limpia y desinfectada
   └─ Esperar hasta <30°C (1–3 horas en clima Tenjo)
   └─ NO dejar a la intemperie — proteger contra insectos/polvo
   
6. VERIFICACIÓN DE FC (Field Capacity)
   └─ Tomar puñado de sustrato enfriado
   └─ Exprimir fuerte → si gotean 1–3 gotas = FC correcto (~65%)
   └─ Si gotea en chorro = muy húmedo → escurrir más
   └─ Si sale polvo seco = muy seco → agregar agua
   
7. INOCULACIÓN
   └─ Inocular inmediatamente (NO esperar >24h)
   └─ Seguir protocolo de Zona 2
```

**Cálculo de agua para FC objetivo:**

Si tienes paja seca con 12% humedad y quieres 65% FC:

```
Agua a agregar (L) = Peso seco sustrato (kg) × (0.65 - 0.12) / (1 - 0.65)
                   = Kg paja × 0.53 / 0.35
                   = Kg paja × 1.51

Ejemplo: 10 kg de paja seca → 15.1 L de agua
```

#### Método 2: Pasteurización con Vapor

- Usar vapor a 100°C en cámara cerrada o olla sin presurizar
- Más eficiente que inmersión para grandes volúmenes
- Temperatura en el centro alcanza 80°C en 45–60 minutos
- Útil para escala: +20 kg por batch

#### Método 3: Cal Hidratada (Alternativa sin Calor)

- Mezclar sustrato con solución de cal hidratada (pH 12) por 12–18h
- No requiere calor — el pH alto elimina competidores
- Enjuagar o neutralizar antes de inocular
- Costo: Muy bajo
- Riesgo: Mayor variabilidad — usar solo en prototipo

### Esterilización — Para Sustratos Complejos

**Cuándo es NECESARIA:**
- Salvado o suplementación N >10%
- Master's Mix (paja + salvado + cal + yeso)
- Cultivo de Shiitake, Lion's Mane, Ganoderma
- Objetivo BE >100%

**Parámetros de esterilización:**

| Parámetro | Valor |
|-----------|-------|
| Temperatura | 121°C |
| Presión | 15 psi (presión manométrica — el gauge ya lo mide) |
| Tiempo mínimo | 2 h (bolsas <2.5 kg) |
| Tiempo estándar | 2.5–3 h (bolsas 2.5–5 kg) |
| Tiempo para bloques grandes | 3–4 h (bloques >5 kg) |

**Nota Altitud (Tenjo 2,600 m):**
- El agua hierve a ~91°C en lugar de 100°C
- La olla de presión a 15 psi sobre presión local SIGUE alcanzando 121°C
- NO ajustar la presión por altitud — el manómetro ya lo considera

#### Equipos para Esterilización

| Opción | Capacidad | Costo | Adecuado para |
|--------|-----------|-------|---------------|
| Olla de presión doméstica (23L, Presto) | 10–15 bolsas/ciclo | US$60–100 | Prototipo, pequeña escala |
| All-American 921 (21 qt) | 15–20 bolsas/ciclo | US$350–450 | Producción pequeña |
| All-American 941 (41 qt) | 30–40 bolsas/ciclo | US$550–700 | Producción mediana |
| Autoclave industrial | 50+ bolsas | >US$2,000 | Escala grande |

#### Protocolo de Esterilización (Olla de Presión)

```
1. PREPARACIÓN
   └─ Preparar sustrato a 65% FC en bolsas PP (polipropileno)
   └─ NO usar bolsas de polietileno (PE) — se derriten a 121°C
   └─ Sellar bolsas: algodón + papel aluminio O tapa con filtro microporo
   
2. CARGA
   └─ Colocar rejilla en fondo de olla (bolsas NO tocan agua directamente)
   └─ Agregar 2–3 cm de agua en el fondo
   └─ Colocar bolsas verticalmente, sin apilar excesivamente
   
3. ESTERILIZACIÓN
   └─ Cerrar olla; calentar a fuego fuerte
   └─ Cuando la válvula comience a silbar, empezar a contar tiempo
   └─ Reducir calor para mantener presión estable a 15 psi
   └─ Mantener 2.5–3 horas desde que alcanza presión
   
4. ENFRIAMIENTO
   └─ Apagar fuego — DEJAR ENFRIAR COMPLETAMENTE en la olla (8–12h)
   └─ NUNCA abrir con presión residual (riesgo de quemadura por vapor)
   
5. EXTRACCIÓN
   └─ Cuando presión = 0 psi, abrir olla lentamente
   └─ Sacar bolsas cuando <50°C
   └─ Dejar enfriar a temperatura ambiente antes de inocular
   
6. INOCULACIÓN
   └─ Inocular SOLO cuando sustrato ≤25°C
   └─ Usar LAF/SAB — sustrato estéril requiere máxima asepsia
```

### Bolsas para Esterilización

| Tipo | Material | Temp. Máx | Uso | ✓ |
|------|----------|-----------|-----|---|
| Polipropileno (PP) estándar | PP | 130°C | Esterilización | ✓ |
| Con filtro de microporo | PP | 130°C | Ideal — respira | ✓ |
| Polietileno (PE) — bolsas de cocina | PE | 80–90°C | **NO — se derrite** | ✗ |
| Mason jars vidrio | Vidrio | 150°C+ | Válido para pequeños volúmenes | ✓ |

### Mejores Prácticas: Pasteurización y Esterilización

- Siempre verificar temperatura en el **centro de la masa**, no en superficie
- Enfriar sustrato en área **protegida de insectos y polvo** — contaminación post-tratamiento es frecuente
- Inocular **lo antes posible** después de enfriar (no esperar >24h)
- Si no se inocula el mismo día: mantener en bolsa cerrada, <20°C
- Marcar bolsas con **fecha y tipo de sustrato** antes de tratar
- Para autoclave: inspeccionar junta de silicona cada 50 ciclos

---

### Zona 2: Inoculación (Limpio — Crítico)

**Localización:** Pasillo cerrado, cuarto independiente, o área dedicada con control de acceso.

**Características obligatorias:**
- Paredes y pisos lavables (pintura epoxi, baldosa, PVC)
- Sin alfombras ni materiales porosos
- Sellado de juntas
- Acceso separado de zona de producción (idealmente escaleras o nivel distinto)
- Mínimo 2×2 metros

**Equipamiento:**
- **LAF (Laminar Air Flow) o SAB (Still Air Box)**
  - LAF: Flujo laminar horizontal o vertical con filtro HEPA
  - SAB: Caja cerrada con acceso por puertos laterales (opción económica)
- Mechero Bunsen o alcohol para desinfección de herramientas
- Mesón de trabajo con luz
- Frasco dispensador de alcohol 70%
- Guantes de nitrilo, mascarilla N95/FFP2
- Frascos de agar, cultivos líquidos, equipamiento de esterilización

**Protocolo de entrada:**
1. Cambiar calzado
2. Desinfectar manos
3. Ponerse EPP (guantes, mascarilla)
4. Limpiar superficies con alcohol 70%

**Control ambiental deseable (no obligatorio en Fase 0):**
- Presión positiva con mini-filtro HEPA (opcional)
- HR 40–60% (para evitar condensación en cultivos)
- T° 18–24°C

---

### Zona 3: Incubación (Spawn Run)

**Localización:** Cuarto interior, sótano, armario, o sección cerrada de azotea.

**Características:**
- Oscuridad total o luz mínima (micelio no necesita luz)
- Sin corrientes de aire exterior
- Estantería de metal o madera (bolsas NO en piso)
- Termómetro digital con registro
- Ventilación pasiva o control de humedad si ambiente es muy seco

**Parámetros por Especie:**

| Especie | T° Óptima | Duración | HR Ambiente |
|---------|-----------|----------|-------------|
| P. djamor | 24–28°C | 10–18 días | 70% (en bolsa) |
| P. ostreatus | 20–24°C | 10–18 días | 70% (en bolsa) |
| H. erinaceus | 20–24°C | 14–21 días | 70% (en bolsa) |
| L. edodes | 20–24°C | 60–120 días | 70% (en bolsa) |
| G. lucidum | 24–28°C | 30–60 días | 70% (en bolsa) |

**Dimensionamiento:**
- Densidad de carga: ~1 m³ de cuarto por cada 3.7 kg de sustrato
- Para 10 kg de sustrato: mínimo 2.7 m³ de volumen

**Equipamiento según clima:**
- **Climas fríos (Tenjo, 12–18°C):** Calefactor cerámico PTC con termostato (~50–200W)
- **Climas cálidos (>23°C):** Ventilación pasiva o deshumidificador

**Desinfección previa del cuarto:**
- Solución de formol comercial al 0.3% en pisos y anaqueles (o alternativas menos tóxicas)
- Espolvorear carbonato de calcio (CaCO₃) para reducir riesgo de hongos e insectos

**Cobertura de clima (Tenjo 12–18°C):**
- Plástico **negro** en salón de incubación (retiene calor)
- Plástico **transparente** en salón de fructificación (permite luz)

---

### Zona 4: Fructificación (Producción)

**Localización:** Cámara climatizada, carpa de cultivo, o recinto aislado.

**Características:**
- Control de HR (85–95%, dependiendo de especie)
- Control de T° (rango según especie)
- Control de CO₂ (<1,500 ppm típicamente)
- Ventilación activa (extractores, intake filtrado)
- Luces con timer (750–1,500 lux, 3–5h/día)
- Posibilidad de automatización (ESP32/ESPHome/HA)

**Equipos comunes:**

| Equipo | Función | Ejemplos |
|--------|---------|----------|
| Cámara | Estructura aislada | Martha Tent 63", CLOUDLAB 844 |
| Humidificador | Control de HR | AC Infinity T7, VIVOSUN H05 |
| Extractor | FAE + CO₂ | AC Infinity H4 |
| Sensor T/HR | Monitoreo | AC Infinity SHT3x, Inkbird |
| Sensor CO₂ | Monitoreo | Sensirion SCD30 |
| Luz | Fotoperíodo | Timer + LED/HPS |
| Microcontrolador | Automatización | ESP32 + ESPHome |

**Posicionamiento de elementos:**
```
┌─────────────────────────────┐
│      [EXHAUST ARRIBA]       │ ← Extractor en techo
│                             │
│  [BLOQUES EN ESTANTERÍA]    │
│                             │
│  [SENSOR MONITOREO]        │ ← A altura de bloques
│                             │
│    [DIFUSOR ABAJO]         │ ← Humidificador lateral/abajo
└─────────────────────────────┘
    ↑ INTAKE (con filtro)
```

---

### Zona 5: Almacenamiento y Procesamiento

**Localización:** Cuarto independiente o refrigerador dedicado.

**Equipamiento:**
- Refrigerador (4–8°C) para almacenamiento post-cosecha
- Balanza de precisión para pesaje
- Empacadora al vacío (futuro)
- Área de limpieza con agua potable

---

## Adecuación para Laboratorio de I+D

### Escenario: Laboratorio de Casa (Multi-nivel)

Para instalaciones pequeñas en casa (garaje + pasillo + azotea), se aplica el modelo de **gradiente vertical**:

**Nivel 1 — Planta Baja (Garaje):**
- Zona sucia: pasteurización, embolsado
- Almacenamiento de materia prima
- Autoclave (sobre estufa industrial)
- Mesón de trabajo
- Racks para bodega

**Nivel 2 — Intermedio (Pasillo cerrado):**
- Zona limpia: LAF o SAB
- Trabajo en agar
- Inoculación de grano y sustrato
- Rack pequeño para bolsas en espera

**Nivel 3 — Azotea/Terraza:**
- Incubación: gabinetes aislados
- Fructificación: Martha Tent o CLOUDLAB
- Desagüe y punto de energía IP65

**Ventajas del gradiente vertical:**
- Material sube; no baja
- Flujo unidireccional natural
- Separación física automática
- Aprovecha luz natural en azotea

**Área mínima:**
- Garaje: 15–20 m² (preparación + bodega + esterilización)
- Pasillo: 3–4 m² (laboratorio)
- Azotea: 15–25 m² (incubación + fructificación)

---

## Laboratorio de I+D y Producción de Spawn

### Equipo por Prioridad

#### Prioridad 1 — Necesario para Trabajo en Agar

| Equipo | Función | Costo Estimado |
|--------|---------|-----------------|
| Autoclave / Olla de presión | Esterilización de medios y vidrio | US$150–400 (olla) / US$500+ (autoclave) |
| LAF o SAB | Inoculación aséptica | US$100–200 (DIY) / US$300–800 (comercial) |
| Mechero Bunsen o alcohol | Desinfección de herramientas | <US$30 |

#### Prioridad 2 — Para Laboratorio Completo

| Equipo | Función |
|--------|---------|
| Microscopio | Verificación de contaminación microscópica |
| pH metro | Calibración de medios de agar |
| Balanza analítica (0.1 g precisión) | Preparación exacta de medios |
| Agitador magnético | Cultivos líquidos |
| Incubadora (opcional) | T° controlada para agar |

### LAF Casero (DIY) — Opción Económica

**Materiales necesarios:**
- Caja de madera/PVC (~60×60×40 cm)
- Filtro HEPA H13 (~US$50–80)
- Ventilador centrífugo 12V, alta presión estática
- Luz UV-C para desinfección pre-uso (opcional)
- Sellante de silicona

**Costo total DIY:** US$100–200
**Costo LAF comercial:** US$300–800+

**Especificaciones técnicas mínimas:**

| Parámetro | Mínimo | Recomendado |
|-----------|--------|-------------|
| Filtro HEPA | H13 | H14 |
| Velocidad de flujo | 0.45 m/s | 0.45–0.54 m/s |
| Pre-filtro | G4 o F5 | Obligatorio (extiende vida del HEPA) |
| Luz UV | Opcional | Útil para descontaminación |

**Test de validación DIY LAF:**
1. Preparar 3 cajas Petri con MEA (Malt Extract Agar)
2. Abrir las cajas dentro del LAF durante 30 minutos sin tocarlas
3. Incubar 5–7 días a temperatura ambiente
4. **Resultado esperado:** 0 colonias en las 3 cajas = LAF funcional
5. Si hay contaminación: revisar juntas, velocidad de flujo, integridad del HEPA

### Still Air Box (SAB) — Alternativa Económica

Para presupuesto muy limitado, un SAB optimizado (caja cerrada con puertos laterales) es suficiente para agar work y tissue cloning con tasa de éxito >90% si se sigue disciplina de asepsia:

**Construcción:**
- Caja Tupperware o caja de madera (~50×50×30 cm)
- Filtro HEPA en tapa (optional)
- Puertos laterales sellados (acceso con guantes)
- Luz interior

**Protocolo SAB:**
1. Spray alcohol 70% en todas las superficies 15 min antes
2. Encender luz 10 min antes de usar
3. Dejar sedimentar polvo (5–10 min sin movimiento)
4. Trabajar con movimientos controlados y lentos
5. No hablar ni estornudar hacia el área de trabajo

---

## Zona de Incubación

### Setup Básico

**Opción 1: Sin Equipo Especializado (Mínimo Viable)**
1. Cuarto interior, armario o caja cerrada
2. Estantes de metal o madera (no piso)
3. Termómetro digital con registro
4. Oscuridad (cuarto oscuro o tela oscura)
5. Calefactor cerámico PTC con termostato (si T° <20°C)

**Opción 2: Con Control Activo**
1. Incubadora estándar (laboratorio, fotografía, etc.)
2. Control de T° a ±0.5°C
3. Sensor de HR (opcional)
4. Espacio para ~50–100 bloques

### Señales de Progreso Normal

| Visual | Interpretación |
|--------|-----------------|
| Micelio blanco expandiéndose desde punto de inoculación | Normal ✅ |
| Micelio amarillo limón / dorado | Estrés (T°, HR) — no contaminación |
| Condensación interior de bolsa | Normal — metabólicamente activo |
| Olor a champiñón, tierra fresca | Normal ✅ |
| Bloques se calientan ligeramente | Normal — calor metabólico del micelio |
| Verde, negro, rosa en interior de bolsa | Contaminación 🔴 |
| Olor agrio, fétido | Contaminación bacteriana 🔴 |

### Protocolo de Inspección (Cada 48h)

```
1. SIN ABRIR BOLSAS — solo inspección visual y olfativa
2. Verificar expansión de micelio blanco (marcador con plumón en bolsa)
3. Buscar manchas de color diferente a blanco/crema
4. Si hay contaminación: aislar y sacar de zona
5. Registrar en bitácora: % colonización estimado, observaciones
```

### Mejores Prácticas en Incubación

- Mantener T° constante — fluctuaciones >3°C ralentizan colonización
- No apilar bolsas muy juntas — calor metabólico crea puntos calientes
- Separar físicamente bloques de especies con T° óptima diferente
- No abrir bolsas durante incubación (rompe hermetismo)

---

## Cámara de Fructificación

### Parámetros por Especie

| Parámetro | P. djamor | H. erinaceus | P. ostreatus | L. edodes |
|-----------|-----------|--------------|--------------|-----------|
| T° | 20–30°C | 16–24°C | 13–24°C | 12–20°C |
| HR | 85–90% | 85–90% | 85–95% | 80–95% |
| CO₂ | <1,500 ppm | <1,000 ppm | <1,000 ppm | <1,000 ppm |
| FAE | 5–8 ACH (provisional) | Ajustar por CO₂ | Ajustar por CO₂ | Ajustar por CO₂ |
| Luz | 750–1,500 lux, 3–5h | 750+ lux, 3–5h | 750–1,500 lux | 750–1,500 lux |

### Inducción de Fructificación (Trigger de Pinning)

| Especie | Método Principal |
|---------|------------------|
| P. djamor | Hacer cortes en bolsa + FAE correcto + HR 85–90% |
| H. erinaceus | T° baja (<22°C) + CO₂ <1,000 ppm + alta HR |
| L. edodes | Cold shock: sumergir en agua fría 12–24h |
| P. ostreatus | Hacer cortes + reducir T° |

### Checklist Diario de Fructificación

```
☐ Verificar HR en dashboard — en rango para especie activa
☐ Verificar CO₂ — en rango para especie activa
☐ Verificar T° — en rango
☐ Confirmar extractor operativo, CO₂ en rango y ausencia de zonas muertas
☐ Inspección visual de bloques — buscar pins o señales de contaminación
☐ Verificar agua en humidificador — rellenar si <20% capacidad
☐ Anotar observaciones en bitácora
```

### Cosecha

- Cosechar cuando borde de caps comienza a enrollar
- Torcer suavemente desde la base (no cortar con cuchillo)
- Limpiar muñones y materia vegetativa
- Pesar y registrar yield
- Calcular Biologic Efficiency (BE): peso fresco / peso seco sustrato × 100

### Flushes (Oleadas Múltiples)

Después de la primera cosecha:
1. Limpiar zona de fructificación (remover muñones)
2. Remojar bloque en agua limpia 12–24 horas
3. Devolver a cámara con mismos parámetros
4. Esperar 10–14 días para segunda oleada

**Rendimiento típico:**
- Flush 1: 60–70% del BE total
- Flush 2: 20–30% del BE total
- Flush 3: 5–10% (si aplica)

---

## Control Ambiental y Automatización

### Arquitectura Recomendada

```
[Sensor SHT3x (T/HR)]──┐
[Sensor SCD30 (CO₂)]───┤
[Sensor Inkbird (BLE)]  │──► [ESP32] ──► WiFi ──► [Home Assistant]
                        │         │
[Humidificador T7]─────┤         ├──► [Relay 1] ──► T7 ON/OFF
[Extractor H4]─────────┘         └──► [Relay 2] ──► H4 ON/OFF
```

**Principio clave:** ESP32 por carpa = autonomía local. Home Assistant = supervisión, no dependencia.

### Sensores Críticos

#### AC Infinity SHT3x (Temperatura + HR)
- Interfaz: I²C, dirección 0x44
- Precisión: ±0.2°C / ±2% RH
- Ubicación: A altura de bloques, protegida de spray directo

#### Sensirion SCD30 (CO₂)
- Interfaz: I²C, dirección 0x61
- **Parámetro crítico:** `altitude_compensation: 2600` (para Tenjo)
- Precisión: ±30 ppm + 3% del valor
- Ubicación: Protegida en caja estanca con tubo de muestreo

#### Inkbird IBS-TH2 Plus (Redundancia — BLE)
- Comparar vs SHT3x semanalmente
- Delta aceptable: ±0.5°C / ±3% HR

### Actuadores

#### AC Infinity T7 (Humidificador)
- Control: Relay simple ON/OFF
- Modo: Manual % (nunca usar sensor integrado H05)
- Lógica: ON si HR < (setpoint - 2%), OFF si HR > setpoint
- Agua: Filtrada <30 ppm TDS

#### AC Infinity H4 (Extractor — FAE)
- Control: Relay simple ON/OFF
- Caudal nominal: 212 CFM (no equivale al caudal instalado)
- Control primario: CO₂ con límites de seguridad
- **Validar caudal efectivo en la instalación** (con filtros, ductos, curvas)

### Commissioning de Ventilación

Para un CLOUDLAB 844 (~2.88 m³):

**Fórmula ACH (Air Changes per Hour):**
```
ACH = Q efectivo medido (CFM) × duty_cycle × 60 / volumen (CFM)
```

**Pasos:**
1. Medir caudal efectivo con anemómetro en al menos 3 velocidades
2. Confirmar mezcla de aire y ausencia de zonas muertas
3. Registrar respuesta del CO₂ con cámara cargada
4. Definir velocidad/línea base mínima
5. Configurar control automático por CO₂

### ESPHome — Configuración Base

```yaml
# setas_martha_01.yaml

esphome:
  name: setas-martha-01
  friendly_name: Martha 01

esp32:
  board: esp32dev

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

api:
  encryption:
    key: !secret api_key

i2c:
  sda: GPIO21
  scl: GPIO22
  scan: true

sensor:
  - platform: sht3xd
    temperature:
      name: "Martha01 Temperatura"
    humidity:
      name: "Martha01 Humedad"
    address: 0x44
    update_interval: 30s

  - platform: scd30
    co2:
      name: "Martha01 CO2"
    temperature:
      name: "Martha01 CO2 Temp"
    humidity:
      name: "Martha01 CO2 HR"
    altitude_compensation: 2600
    update_interval: 30s

switch:
  - platform: gpio
    name: "Martha01 Humidificador"
    pin: GPIO26
    id: relay_humidificador

  - platform: gpio
    name: "Martha01 Extractor"
    pin: GPIO27
    id: relay_extractor
```

### Home Assistant — Automatización HR

```yaml
automation:
  - alias: "Martha01 — Control HR"
    trigger:
      platform: numeric_state
      entity_id: sensor.martha01_humedad
      below: 83
    action:
      service: switch.turn_on
      target:
        entity_id: switch.martha01_humidificador

  - alias: "Martha01 — Apagar Humidificador"
    trigger:
      platform: numeric_state
      entity_id: sensor.martha01_humedad
      above: 90
    action:
      service: switch.turn_off
      target:
        entity_id: switch.martha01_humidificador
```

---

## Equipamiento Crítico

### Esterilización

#### Autoclave All American (Presión 44 L)
- Ubicación: Garaje (sobre estufa industrial)
- Ventilación: Portón entreabierto (evacuación de CO propano)
- Ciclo estándar: 15 PSI, 121°C, 20–30 minutos
- Carga: Según capacidad real (verificar placa del equipo)

**Alternativa económica:** Olla de presión de cocina
- Rango de presión: 8–15 PSI
- Tiempo: 30–45 minutos
- Capacidad: 6–8 L (para bolsas pequeñas)

### Filtración de Aire

#### MERV-13 Intake Filter
- Ubicación: Entrada de aire fresco a cámara
- Cambio: Cada 3–6 meses (depende de uso)
- Función: Retiene partículas, esporas, insectos

#### Filtro HEPA
- Ubicación: LAF o cámara limpia
- Tipo: H13 (mínimo) o H14 (recomendado)
- Vida útil: 2–5 años con pre-filtro, meses sin él
- Pre-filtro: Obligatorio (extiende vida del HEPA)

### Humidificación

#### AC Infinity T7 (15L)
- Ubicación: Fructificación (cámara climatizada)
- Control: Relay ON/OFF (nunca sensor integrado)
- Consumo: ~20h a plena carga
- Agua: Filtrada <30 ppm TDS

#### VIVOSUN H05
- Ubicación: Martha Tent (prototipo)
- Sensor integrado: **DESCARTADO** — sesgo de +30–35% HR
- Operación: Modo manual % usando Inkbird como referencia
- Rol futuro: Backup cuando llegue T7

### Ventilación

#### AC Infinity H4 (4", IP65)
- Caudal nominal: 212 CFM (solo referencia)
- Ubicación: Exhaust en techo de cámara
- Control: Relay ON/OFF con lógica CO₂
- Presupuesto: Medir caudal efectivo en instalación

#### Ductos y Compuertas
- Ducto: Galvanizado o plástico reforzado
- Compuertas: Regulables para ajuste fino de FAE
- Filtro intake: MERV-13 mínimo

---

## Flujo de Trabajo Completo

### Ciclo P. djamor (Especie Prioridad — 5–6 Semanas Total)

```
DÍA 0: PREPARACIÓN DE SUSTRATO (3–4 horas)
├── Hidratar paja de trigo (remojo 12–24h)
├── Pasteurizar (80°C, 60 minutos en agua caliente)
├── Escurrir y enfriar (<30°C)
└── Verificar FC (pocas gotas al exprimir)

DÍA 0–1: INOCULACIÓN (1–2 horas)
├── Preparar área de inoculación (alcohol 70%, guantes, mascarilla)
├── Mezclar spawn con sustrato (15% peso seco)
├── Empacar en bolsas (500–1,000 g por bloque)
├── Sellar bolsas (grapar o heat-seal)
└── Etiquetar: especie, fecha, número de lote

DÍAS 1–18: INCUBACIÓN (10 min/día inspección)
├── T°: 24–28°C
├── Sin luz, en oscuridad total
├── Inspección visual cada 48h (SIN ABRIR)
├── Registrar % colonización en bitácora
└── Aislar contaminados inmediatamente

DÍA 14–18: INICIO FRUITING (30 min setup)
├── Verificar colonización completa (micelio blanco uniforme)
├── Hacer cortes en bolsa (2–3 cortes, NO en parte inferior)
├── Colocar en cámara fructificación
├── Configurar parámetros:
│   ├── HR: 85–90%
│   ├── Ventilación: Línea base tras commissioning
│   ├── CO₂: Objetivo 500–1,500 ppm
│   └── Luz: 750–1,500 lux, 4h/día (timer)
└── Registrar inicio en bitácora

DÍAS 22–27: PRIMERA COSECHA (30–60 min cosecha)
├── Indicador: Borde de caps comienza a enrollar
├── Cosechar torciéndolos suavemente (no cortar)
├── Limpiar zona de fructificación (remover muñones)
├── Pesar y registrar yield en gramos
└── Calcular BE: peso fresco / peso seco sustrato × 100

DÍAS 28–42: SEGUNDA OLEADA (10–14 días espera)
├── Remojar bloque en agua limpia 12–24h
├── Devolver a cámara con mismos parámetros
├── Esperar 10–14 días adicionales
└── Cosechar segunda tanda

DÍAS 43–55: FLUSH 3 (SI APLICA)
└── Repetir proceso de rehidratación y fructificación
```

### Bitácora por Lote

**Campos obligatorios:**
```
LOTE #___
Especie: _______________
Fecha inoculación: _______
Sustrato: ______________ FC estimado: ____%
Spawn usado: ________ kg  Proporción: ____%
Número de bloques: ___

INCUBACIÓN:
Día 3 — % colonización: ___  Observaciones: ___
Día 7 — % colonización: ___  Observaciones: ___
Día 14 — % colonización: ___ Observaciones: ___
Contaminación: ___% bloques — Tipo: ___

FRUCTIFICACIÓN:
Fecha inicio: ________
Día 1 HR: ___ T°: ___ CO₂: ___
Fecha primeros pins: ________
Flush 1: Fecha _______ Peso _______ g
Flush 2: Fecha _______ Peso _______ g
BE Total: _______ %
```

### Dedicación Horaria (por Lote de 10 Bloques)

| Actividad | Tiempo |
|-----------|--------|
| Preparar y pasteurizar sustrato | 3–4 h |
| Inoculación | 1–2 h |
| Revisión diaria incubación | 10 min/día × 18 días = 3 h |
| Setup cámara fruiting | 30 min |
| Revisión diaria fruiting | 15 min/día × 50 días = 12.5 h |
| Cosecha (3 flushes) | 30–60 min/flush × 3 = 2–3 h |
| Limpieza post-cosecha | 30 min |
| **TOTAL** | ~25–30 horas |
| **Promedio/semana** | ~3–5 horas |

---

## Protocolos de Asepsia

### Protocolo Básico de Inoculación

#### Preparación del Área (15 minutos antes)
1. Spray alcohol 70% en todas las superficies
2. Esperar evaporación (no usar papel — dejar aire seque)
3. Encender LAF/SAB y dejar estabilizar
4. Colocar todo material dentro del campo de flujo
5. Si LAF tiene UV: encender 15–20 min, apagar antes de trabajar

#### Durante el Trabajo
1. **Todos los movimientos:** De atrás hacia adelante (nunca cruzar entre filtro y cultivo)
2. **Flameado:** Asa o aguja entre cada transferencia
3. **Apertura de recipientes:** En ángulo, NUNCA hacia arriba
4. **Restricciones:** No hablar, no toser, no estornudar hacia el campo

#### Después (5 minutos)
1. Limpiar superficie con alcohol 70%
2. Apagar ventilador
3. Dejar cabina cubierta o cerrada

### Equipo de Protección Personal (EPP)

**Mínimo obligatorio:**
- Guantes de nitrilo (nitrilo, no latex — mejor agarre)
- Mascarilla N95 o FFP2
- Calzado dedicado a zona limpia

**Recomendado:**
- Bata de laboratorio o delantal
- Gafas de seguridad (si se trabaja con llama)
- Papel toalla desechable (no usar tela)

---

## Limpieza, Desinfección y Biosecurity Procedural

### Principios de Contaminación Prevention

Contamination prevention funciona en **tres dimensiones integradas:**

1. **Limpieza física:** Remover debris orgánico (lo que protege microorganismos)
2. **Desinfección química:** Inactivar microorganismos en superficies
3. **Biosecurity procedural:** Flujo de trabajo, separación de materiales, movimiento de operarios

Sin las tres, falla la prevención.

### Desinfectantes: Concentraciones y Tiempos

| Agente | Concentración | Tiempo Contacto | Uso | Notas |
|--------|---|---|---|---|
| Alcohol etílico 70% | 70% | 30 seg | Superficies, herramientas, LAF | Evaporación rápida |
| Isopropanol 70% | 70% | 30 seg | Igual a etanol; más económico | Evaporación más lenta |
| Hipoclorito de sodio (cloro) | 0.5–1% (5,000–10,000 ppm) | 5–10 min | Pisos, paredes, áreas amplias | Corrosivo en metal — NO en herramientas de acero |
| Peróxido de hidrógeno | 3% | 5 min | Alternativa a cloro | No deja residuos |
| Flameado | — | Hasta rojo | Asas de inoculación, bisturís | Permite enfriar sin tocar superficies |

### Frecuencia de Limpieza por Zona

#### Zona Limpia (Inoculación) — MÁXIMO RIESGO

**Antes de cada sesión de inoculación (15 min):**
- Remover todo debris de superficies de trabajo
- Spray alcohol 70% en todas las superficies
- Limpiar con movimiento unidireccional (de atrás hacia adelante — NO de ida y vuelta)
- Limpiar interior de LAF/SAB con alcohol 70%
- Flamear asas y bisturís hasta rojo brillante; dejar enfriar

**Después de cada sesión (5 min):**
- Repetir limpieza con alcohol 70%
- Desechar materiales usados (placas Petri, muestras) en bolsa de biohazard
- Mantener zona cerrada mínimo 2 horas antes de siguiente uso

**Semanalmente (30 min — limpieza profunda):**
- Desinfectar todas superficies con hipoclorito 0.5–1%
- Limpiar paredes y anaqueles del LAF/SAB
- Enjuagar con agua destilada; dejar secar al aire
- **NUNCA usar hipoclorito en herramientas de acero** — usar alcohol 70% en su lugar

#### Zona de Fructificación — RIESGO MODERADO

**Diaria (durante fructificación — 10 min):**
- Remover caps caídos, debris, materia muerta de piso y bases de bloques
- **NO limpiar con spray agresivo** (daña cuerpos de fructificación)
- Inspección visual: buscar verde, naranja, bacterias
- Registrar en bitácora

**Post-cosecha/Flush (15 min):**
- Limpiar bases de bloques con alcohol 70%
- Remover restos de tallos usando herramienta estéril
- Limpiar estanterías con alcohol 70% o hipoclorito 0.5%
- Enjuagar superficies tratadas con agua destilada; secar al aire

**Entre lotes (limpieza profunda — 45 min):**
- Remover TODOS los bloques de la cámara
- Limpiar paredes, piso, techo con hipoclorito 0.5–1%
- Limpiar entradas de aire (louvers, difusores) — remover polvo/biofilm
- Inspeccionar y limpiar o reemplazar difusor del humidificador
- Limpiar/reemplazar filtro de extracción si hay biofilm visible
- Dejar secar 24–48 horas antes de introducir nuevo lote
- Registrar fecha de limpieza en bitácora del lote

**Si se detecta contaminación (Procedimiento emergencia — 30 min):**
- Cubrir bloque contaminado con bolsa opaca INMEDIATAMENTE (prevenir dispersión de esporas)
- Remover con bolsa cerrada sin agitar
- Discontinuar fructificación en esa cámara
- Aplicar hipoclorito 1% a todas superficies; contacto 10+ minutos
- Enjuagar; dejar secar completamente
- Cuarentena mínimo 48 horas antes de nuevo lote
- Registrar evento, tipo de contaminación, acciones en bitácora

#### Zona de Incubación — RIESGO BAJO

**Semanalmente (15 min):**
- Limpiar estanterías con alcohol 70%
- Inspeccionar bolsas: fotografiar cualquier crecimiento sospechoso
- Remover bloques contaminados en bolsa de biohazard

**Post-evento de contaminación:**
- Limpieza profunda con hipoclorito 0.5–1%
- Inspeccionar lotes restantes; considerar relocalización si contaminación activa

### Herramientas y Equipos

**Antes de usar:**
- Flamear scalpels e asas de inoculación hasta rojo; dejar enfriar sin tocar superficies contaminadas
- Limpiar cuchillos de cosecha con alcohol 70% entre cada bloque
- Cambiar guantes de nitrilo entre sesiones

**Después de usar:**
- Sumergir herramientas reutilizables en alcohol 70% u horno de esterilización
- **NO reutilizar artículos de un solo uso** (placas Petri, pipetas, swabs)

### Mantenimiento de Humidificador (AC Infinity T7 o VIVOSUN H05)

Los difusores ultrasónicos acumulan minerales y biofilm bacteriano → contaminación de aire.

**Cada 80+ horas de operación o mensualmente:**

```
1. Apagar y desconectar del tomacorriente
2. Vaciar tanque completamente
3. Llenar con solución de vinagre blanco 10% (ácido débil disuelve minerales)
4. Remojar 30–60 minutos
5. Cepillar suavemente con cepillo blando: interior, disco ultrasónico
6. Enjuagar 3× con agua destilada
7. Limpiar disco ultrasónico con hisopo de algodón + agua destilada
8. Secar completamente antes de rellenar
9. Probar operación antes de reconectar a cámara
10. Registrar fecha de mantenimiento
```

**Si hay biofilm bacteriano o moho visible:**
- Sumergir difusor en isopropanol 70% 10 minutos
- Repetir ciclo de vinagre
- Inspeccionar transductor ultrasónico por corrosión; reemplazar si está dañado

### Biosecurity Procedural — Flujo de Operarios

**Directriz principal:** El aire y los materiales deben fluir **inoculación → incubación → fructificación**. Los operarios **NUNCA** regresan desde fructificación a inoculación sin decontaminación.

```
ENTRADA A ZONA LIMPIA (Inoculación)
├─ Cambiar calzado exterior por calzado dedicado a zona limpia
├─ Lavar manos
├─ Ponerse guantes limpios
├─ Ponerse mascarilla
└─ Entrar a LAF/SAB

DURANTE TRABAJO EN LAF
└─ Trabajar en dirección unidireccional
└─ No tocar nada fuera del campo
└─ Flamear herramientas entre transferencias

SALIDA DE ZONA LIMPIA
├─ Quitarse guantes en basura de biohazard
├─ Lavar manos
├─ Cambiar calzado
└─ Luego puede entrar a otras zonas

ENTRADA A ZONA DE FRUCTIFICACIÓN
└─ Usar EPP limpio
└─ Cambiar guantes nuevamente
└─ Inspeccionar visualmente antes de entrar (ausencia de contaminación visible)

REGLA DE ORO
└─ Si trabajas en fructificación/cosecha, NO regreses a inoculación sin:
   ├─ Cambio completo de guantes
   ├─ Cambio de calzado
   └─ Lavado de manos y cara
```

### Separación de Herramientas por Zona

| Zona | Herramientas | Desinfección |
|------|--------------|--------------|
| Inoculación | Asas, bisturís, pipetas, mechero | Flamear + alcohol 70% |
| Incubación | Bandeja de inspección, lupa, plumón | Alcohol 70% |
| Fructificación | Cuchillo de cosecha, tijeras, bandejas | Alcohol 70% entre bloques |

**Regla:** Herramientas de inoculación NUNCA tocan zona de fructificación. Herramientas de fructificación NUNCA regresan a inoculación.

### Agua para Humidificadores

- **Recomendado:** Destilada o filtrada <30 ppm TDS (Total Dissolved Solids)
- Agua de grifo con minerales altos causa acumulación rápida en difusor
- Revisar tanque diariamente — cambiar agua si se nota turbiedad

---

## Mejores Prácticas

### Generales

1. **No llevar materiales sucios a zona limpia:** Materia prima sin pasteurizar, tierra, residuos de cosechas anteriores = contaminación segura.

2. **Separación funcional:** Incluso en mismo cuarto, separar espacios con plástico o cortina entre zona sucia y limpia.

3. **EPP dedicado:** Calzado diferente para zona limpia; no reingresar a garaje con botas del laboratorio.

4. **Documentación:** Bitácora obligatoria. Sin datos = imposible mejorar.

5. **Pruebas en pequeña escala primero:** No multiplicar un problema a escala antes de validar en lote piloto.

### Incubación

- Mantener T° lo más constante posible — fluctuaciones >3°C ralentizan colonización 30–50%
- No apilar bolsas directamente — dejar espacio entre capas (5–10 cm)
- Inspección visual solamente — nunca abrir bolsa durante incubación
- Marcar punto de inoculación con plumón para seguimiento de expansión

### Fructificación

- Hacer los cortes de fruiting en 2–3 lados de la bolsa, **no en la parte inferior** (acumula agua)
- Cosechar antes de que los caps suelten esporas (nube visible)
- Limpiar la cámara con alcohol 70% entre lotes
- Verificar drenaje y ausencia de agua estancada

### Laboratorio

- El pre-filtro es tan importante como el HEPA — protege vida útil del HEPA
- Cambiar pre-filtro cada 6 meses (o cuando se vea visualmente saturado)
- HEPA dura 2–5 años con pre-filtro; sin él, meses
- Registrar fecha de instalación del HEPA en etiqueta física

### Limpieza y Desinfección

- Mantener spray de alcohol 70% siempre disponible en zona limpia; refrescar semanalmente
- **NUNCA mezclar hipoclorito con alcohol u otros desinfectantes** — produce gases tóxicos
- **NUNCA usar hipoclorito en herramientas de acero** — corroe; usar alcohol 70% en su lugar
- Usar guantes de nitrilo cuando se maneja hipoclorito (irritante en piel)
- Dejar superficies con alcohol que se sequen naturalmente (evaporación completa)
- Dejar hipoclorito en contacto con superficie 5–10 minutos antes de enjuagar
- Registrar TODA limpieza post-batch en bitácora: fecha, agente usado, zonas limpiadas
- Cambiar guantes entre zonas y después de manipular material contaminado
- Fotografiar cualquier contaminación sospechosa ANTES de remover (para identificar patrones)

---

## Identificación y Prevención de Contaminantes

### Tabla de Contaminantes Comunes

| Patógeno | Apariencia | Olor | Causa Raíz | Prevención | Acción |
|----------|-----------|------|-----------|-----------|--------|
| **Trichoderma** | Verde brillante, forma de colonia | Agrio, a vinagre | Pasteurización insuficiente (<75°C); inoculación en área sucia | Validar T° en centro; usar LAF; desinfectar superficies | Aislar; remover bloque; limpiar cámara con hipoclorito 1% |
| **Neurospora** | Rosa, naranja, o rojo | Fétido | Contaminación post-pasteurización; enfriamiento en área sin limpiar | Enfriar en espacio desinfectado; cubrir mientras enfría | Aislar; remover; desinfectar |
| **Bacterias (slime bacteriano)** | Humedad anormal, aspecto "mojado", colores variables | Fétido, podrido | HR >92% + FAE insuficiente; inoculación en sustrato aún caliente | Reducir HR; aumentar ventilación; enfriar antes de inocular | Aumentar FAE; reducir HR a 88–90%; remover bloque si es severo |
| **Aspergillus (negro)** | Negro o marrón oscuro | Sin olor característico | Esporas en aire; FAE insuficiente | Filtro MERV-13 en intake; aumentar FAE; mejorar aire | Remover bloque; mejorar ventilación |
| **Penicillium (azul-verde)** | Azul claro, polvo fino | Sin olor | Similar a Trichoderma | Pasteurización; LAF; desinfección | Aislar; remover |

### Señales de Progreso Normal vs. Contaminación

| Visual | T° Incubación | Interpretación | Acción |
|--------|---|---|---|
| Micelio blanco expandiéndose | 20–28°C | Normal ✅ | Continuar |
| Micelio amarillo/dorado | 20–28°C | Estrés (T°, HR), NO contaminación | Verificar T° y humedad |
| Condensación interior bolsa | 20–28°C | Normal — micelio activo metabólicamente | Continuar |
| Olor a champiñón, tierra fresca | 20–28°C | Normal ✅ | Continuar |
| Bolsas calientes al tocar | 20–28°C | Normal — calor metabólico | Separar si >28°C |
| **Verde brillante** | Cualquiera | Trichoderma 🔴 | Aislar inmediatamente |
| **Naranja/rosa** | Cualquiera | Neurospora 🔴 | Aislar inmediatamente |
| **Olor agrio/fétido** | Cualquiera | Contaminación bacteriana 🔴 | Aislar inmediatamente |
| **Negro/marrón** | Cualquiera | Aspergillus u otro contaminante 🔴 | Aislar inmediatamente |

---

## Modos de Fallo Común

### En Preparación de Sustrato

| Problema | Causa | Solución |
|----------|-------|----------|
| Materia prima con moho | Bolsa abierta + humedad alta + roedores | Almacenar en contenedores sellados; usar bolsas cerradas |
| Sustrato con contaminación visible post-pasteurización | Pasteurización insuficiente (T° <75°C o tiempo <60 min) | Verificar termómetro contra referencia; mantener 80°C mínimo 60 min |
| Bolsas embolsadas fría | Sustrato no enfriado adecuadamente | Esperar mínimo 6–8 horas post-pasteurización antes de inocular |
| Trichoderma post-inoculación | Pasteurización insuficiente en zona sucia | Validar que termómetro marque 80°C en el centro de la masa |
| Bacterias (olor agrio) | Inoculación con sustrato aún caliente (>30°C) | Enfriar completamente antes de inocular; verificar con termómetro |
| FC muy alto (sustrato encharcado) | Exceso de agua en hidratación | Escurrir más sustrato; test FC antes: solo 1–3 gotas al exprimir |

### En Inoculación

| Problema | Causa | Solución |
|----------|-------|----------|
| Contaminación generalizada tras inoculación | Inocular a la intemperie; área sin higiene | Usar pasillo cerrado; desinfectar superficies; validar LAF/SAB |
| Colonia contaminada en agar | Técnica aséptica deficiente | Usar mechero; flamear asa entre transferencias; validar LAF |
| Spawn graneado sin colonizar | Spawn viejo o deshidratado | Usar spawn fresco; almacenar en bolsa sellada <20°C |

### En Incubación

| Problema | Causa | Solución |
|----------|-------|----------|
| Colonización muy lenta (>3 semanas) | T° <20°C | Agregar calefactor PTC; verificar termómetro |
| Bolsas se calientan en exceso | Demasiadas apiladas; T° ambiente alta | Separar bolsas; crear espacio entre capas |
| Micelio se detiene a 50% colonización | T° irregular; sustrato muy húmedo | Estabilizar T°; verificar FC inicial |
| Contaminación generalizada | Problema en pasteurización/esterilización | Revisar proceso; validar autoclave; aumentar tiempo |

### En Fructificación

| Problema | Causa | Solución |
|----------|-------|----------|
| No aparecen pins | HR insuficiente, T° fuera de rango, FAE excesivo | Verificar todos parámetros; esperar 3–5 días más |
| Tallos elongados (tall & thin) | Ventilación insuficiente (CO₂ alto) | Verificar sensor CO₂; aumentar FAE gradualmente |
| Contaminación en fruiting | HR >92% + FAE insuficiente | Reducir HR a 88–90%; aumentar FAE; verificar que no hay condensación en techo |
| Caps muy pequeños | Exceso CO₂ o T° alta | Verificar CO₂ con SCD30; reducir T° si es posible |
| Pocos bloques completamente colonizados en fruiting | Spawn débil; inoculación desigual | Validar calidad de spawn; verificar inoculación uniforme |

### Problemas Eléctricos / Automatización

| Problema | Causa | Solución |
|----------|-------|----------|
| Sensor SHT3x no aparece en I²C | Pinout incorrecto; pull-ups faltantes | Verificar con multímetro; agregar resistencias 4.7kΩ |
| SCD30 lecturas erráticas | Sin compensación de altitud | Configurar `altitude_compensation: 2600` en ESPHome |
| Relay no activa actuador | Pin GPIO incorrecto; lógica activo bajo | Verificar pinout; invertir lógica si necesario |
| ESP32 se desconecta de HA | WiFi inestable; señal débil en ubicación | Verificar RSSI; mover router o caja de electrónica |

---

## Checklist de Validación Inicial

Antes de iniciar producción, verificar:

### Zona Sucia (Preparación)
- [ ] Área de trabajo con mesón estable y limpio
- [ ] Acceso a agua caliente (para pasteurización)
- [ ] Fuente de calor (autoclave, estufa, olla)
- [ ] Contenedores sellados para almacenar materia prima
- [ ] Separación física clara de zona limpia

### Zona Limpia (Inoculación)
- [ ] LAF o SAB construida y validada (test de Petri pasado)
- [ ] Superficie de trabajo desinfectable
- [ ] Alcohol 70% disponible
- [ ] EPP: guantes, mascarilla, calzado dedicado
- [ ] Acceso separado (escaleras, puerta con cierre)
- [ ] Sin corrientes de aire exterior

### Zona de Incubación
- [ ] Termómetro calibrado (verificar contra otro termómetro)
- [ ] Oscuridad total (sin luz residual)
- [ ] Estanterías de metal o madera (no piso)
- [ ] Calefactor PTC con termostato (si T° <20°C)
- [ ] Dimensionamiento correcto (1 m³ por 3.7 kg de sustrato)

### Zona de Fructificación
- [ ] CLOUDLAB o Martha Tent construida/instalada
- [ ] Humidificador (T7 o H05) operativo
- [ ] Extractor de aire instalado (H4 o equivalente)
- [ ] Sensores T/HR conectados y calibrados
- [ ] Sensor CO₂ instalado y compensado a altitud
- [ ] Timer para luz configurado (3–5h/día)
- [ ] Desagüe funcional
- [ ] Punto de energía IP65

### Automatización
- [ ] ESP32 flasheado con ESPHome
- [ ] Conexión a Home Assistant validada
- [ ] Automations de HR y FAE configuradas
- [ ] Alarmas de CO₂ alerta configuradas (>2,000 ppm)
- [ ] Relay conectados correctamente
- [ ] Caja electrónica IP67 instalada fuera de cámara

### Documentación
- [ ] Bitácora preparada con campos obligatorios
- [ ] Estándares de identificación de lotes definidos
- [ ] Protocolos de EPP y asepsia pegados en zona limpia
- [ ] Números de teléfono y contacto de emergencia registrados

---

## Referencias y Fuentes

### Libros y Manuales de Referencia
- Stamets, P. (2000). *Growing Gourmet and Medicinal Mushrooms*. Ten Speed Press.
- Cotter, T. (2014). *Organic Mushroom Farming and Mycoremediation*. Chelsea Green.
- Zied, D.C. & Pardo-Giménez, A. (2017). *Edible and Medicinal Mushrooms*. Wiley-Blackwell.
- Rodríguez Valencia, N. & Jaramillo López, C. (2005). *Cultivo de hongos medicinales en residuos agrícolas de la zona cafetera*. Cenicafé/FNC, Chinchiná, Caldas.

### Documentación Técnica
- AC Infinity. *CLOUDLAB 844 Setup Guide* y *CLOUDLINE H4 Manual*.
- ESPHome Documentation. https://esphome.io
- Home Assistant Documentation. https://home-assistant.io
- Sensirion SCD30 Datasheet.

### Recursos Técnicos
- CDC. *Air Changes per Hour (ACH) Formula*. https://stacks.cdc.gov/view/cdc/157087/
- Field & Forest Products. Mushroom cultivation guides.
- Shroomery Forum. DIY equipment documentation.

---

**Documento compilado desde la Knowledge Base de Setas de la Peña**
**Última revisión: 2026-07-23 (Completado)**
**Completitud: 90% — Cubre todas las zonas, parámetros, equipamiento, protocolos, limpieza y troubleshooting**
**Confianza: Media-Alta (diseños probados; instalación real pendiente de validación de campo)**

### Historial de Versiones
- **v1.0 (2026-07-23):** Compilación inicial — 70% de contenido
- **v2.0 (2026-07-23):** Completado con pasteurización, esterilización, limpieza, biosecurity y contaminantes — 90% de contenido
