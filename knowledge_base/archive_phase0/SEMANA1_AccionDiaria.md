# SEMANA 1: Plan de acción diaria (Jun 17–21, 2026)
**Setas de la Peña — Fase 0 → Fase 1**

*Objetivo: Validar infraestructura + comprar materiales Prototipo A + test viabilidad spawn*

---

## 📋 Resumen ejecutivo

**6 tareas en paralelo. Ninguna es bloqueadora de otra.**

| Tarea | Prioridad | Tiempo | Resultado |
|---|---|---|---|
| Compra materiales | 🔴 URGENTE | 2h | Caja, icopor, calentador en mano |
| SAB test sellado | 🟡 Media | 30 min | SAB hermético validado |
| Autoclave test | 🟡 Media | 1h | Autoclave funciona OK |
| Spawn viabilidad | 🟢 Baja | 5 min setup + 72h espera | Dato viabilidad |
| Estudiar Prototipo A | 🟡 Media | 2–3h | Blueprint construcción |
| Receta sustrato | 🟡 Media | 1–2h | Protocolo listo |

**Total hands-on esta semana: ~7–8h**

---

## 🗓️ Cronograma diario

### LUNES 17 Junio

#### Mañana: Compra + Estudio (2h)

```
08:00 — Abre laptop
        Busca MercadoLibre:
        - Caja Ultraforte 120L (o similar, plástico, tapa)
          → Keyword: "caja transparente 120 litros"
          → Target: 120–180k COP, entrega esta semana
        
        - Icopor 5 cm (planchas para forrar, ~3–4 m² total)
          → Keyword: "icopor 5cm láminas" o "poliestireno expandido"
          → Target: 100–150k COP
        
        - Calentador acuario 50W
          → Keyword: "calentador acuario 50w" o "heater aquarium"
          → Target: 60–90k COP
        
        - SHT31 sensor (si no tienes)
          → Keyword: "SHT31 sensor temperatura humedad"
          → Target: 40–60k COP (MercadoLibre)
        
        - Relé 4 canales (si no tienes)
          → Keyword: "relé 4 canales optoacoplado 5v"
          → Target: 30–50k COP
        
        - Rejilla elevación 50×30 cm
          → Keyword: "rejilla metal enfriamiento" o "cooling rack"
          → Target: 50–70k COP
        
        - Agua destilada 2L + agua oxigenada 30%
          → Droguería cercana, disponible inmediato
          → ~20–30k total

09:00 — Cursa órdenes MercadoLibre (en carrito)
        Urgencia: "Entrega antes del viernes 21"
        Si algún item no tiene stock, busca alternativa o compra local (tienda física)

10:00 — Comienza lectura Plan de Prototipos v3, pp. 37–77 (Prototipo A)
        Objetivo: Entender diseño + parámetros + montaje
        Tiempo: ~1.5h lectura + tomar notas
```

#### Tarde: Infraestructura (1h)

```
14:00 — Test SAB casero
        1. Abre caja SAB
        2. Limpia interior con alcohol 70%
        3. Cierra tapa bien
        4. Espera 5 min
        5. Rocía desinfectante dentro (poco, vapor)
        6. Cierra tapa 15 min
        7. Abre → ¿Olor a químico persiste?
           → Sí = SAB hermético ✓
           → No = Tiene fugas, sellar con tape + silicona
        
        FOTO: Interior SAB + tapa cerrada bien

15:00 — Test autoclave All American 44L
        1. Llena con 2L agua destilada
        2. Cierra tapa (sigue manual autoclave)
        3. Abre válvula presión
        4. Enciende a fuego medio
        5. Espera que suba a 15 PSI (manómetro)
        6. Mantén 10 min a presión
        7. Apaga, espera enfríe sin abrir (20 min)
        8. Abre lentamente (escape presión)
        9. Verifica: ¿Agua aún destilada? ¿Sin fugas?
        
        FOTO: Manómetro a 15 PSI + termómetro >120°C
        DOCUMENTO: Autoclave_Test_Jun17.txt (fecha + resultado)
```

---

### MARTES 18 Junio — ENTRENAMIENTO 1: Inoculación práctica

#### Mañana: Inoculación + Test viabilidad (1.5h total)

```
08:00 — ENTRENAMIENTO INOCULACIÓN #1 (Primera vez en SAB)
        
        OBJETIVO: Aprender protocolo aséptico + practicar técnica
        
        SETUP SAB:
        1. Desinfecta interior con alcohol 70%
        2. Cierra tapa, espera 10 min (se seque)
        3. Abre, revisa: ¿olor a químico? (confirmación hermético)
        4. Enciende luz interior si tienes (ver bien)
        
        MATERIALES preparados (FUERA del SAB, listos):
        - 3 bolsas PP 20×50 vacías (o más si quieres practicar)
        - 150g sustrato pre-esterilizado (hoy: puedes usar aserrín cocido + agua, 
          o simplemente papa cocida desmenuzada como mock-sustrato)
        - 100g spawn Rosa (para 3 bolsas = ~33g cada una)
        - Cucharas limpias (para mezclar)
        - Papel/marcador (etiquetar)
        
        PROTOCOLO INOCULACIÓN (DENTRO SAB):
        1. Coloca 3 bolsas vacías en SAB
        2. Toma bolsa #1, abre boca (cuidado asepsia)
        3. Añade ~50g sustrato (base)
        4. Añade ~33g spawn Rosa
        5. Mezcla dentro bolsa (30 seg, aséptico)
        6. Sella bolsa (nudo triple, o sellador si tienes)
        7. Etiqueta: "Rosa_Entrenamiento1_Jun18"
        8. Repite para bolsa #2 y #3
        9. Saca bolsas del SAB
        
        DONDE VAN:
        - A incubadora TÚ ELIGES:
          A. Ambiente Tenjo (12–16°C, sin calor) — Datos térmicos realistas
          B. Bolsa cerrada en armario (sin control) — Realista para usuario DIY
          C. SAB mismo cerrado (control menor) — Práctico
        
        Recomendación: OPCIÓN A (Tenjo) para datos posteriores
        
        RESULTADO:
        - 3 bolsas "mini-batch" en incubación
        - Experiencia SAB + técnica inoculación
        - Dato: "Spawn Rosa viejo + técnica DIY → colonización?"
        
        FOTOS:
        - SAB abierta mostrando setup interior
        - Bolsas etiquetadas antes de sellar
        - Bolsas etiquetadas después de sellar (baseline)
        
        DOCUMENTO: Entrenamiento1_Jun18.md
        # Entrenamiento 1: Rosa Batch DIY
        - Fecha: Jun 18
        - Spawn: Rosa vieja (6+ semanas nevera)
        - Técnica: Manual en SAB
        - Bolsas: 3
        - Destino incubación: Tenjo ambiente
        - Observaciones: [qué salió bien, qué mal]
```

#### Tarde: Test viabilidad en paralelo (5 min setup)

```
14:00 — SETUP test viabilidad (rápido, paralelo)
        
        Mientras spawn de entrenamiento está en incubadora,
        haz el test de viabilidad clásico:
        
        - 4 platos hondos con agar/papa cocida
        - 5g cada cepa (Rosa, Gris, Blanca, Melena)
        - A 25°C, espera 3–5 días
        
        DOCUMENTO: Viabilidad_Test.csv
        Cepa | Día1 | Día3 | Día5 | % Colonización | % Contaminación | Notas
        Rosa | — | — | — | — | — |
        Gris | — | — | — | — | — |
        Blanca | — | — | — | — | — |
        Melena | — | — | — | — | — |
```

#### Tarde: Completar lectura Prototipo A + Receta sustrato

```
14:00 — Termina lectura Plan de Prototipos v3 (pp. 37–77)
        
        Toma notas en documento:
        - Materiales exactos
        - Pasos de construcción (1–7, pp. 68–76)
        - Parámetros objetivo (24–27°C, 70–80% HR, etc.)
        - Qué haces para validar después (pp. 78–82)
        
        Resultado: Resumen_Prototipo_A.md (tu cheat sheet para construcción)

16:00 — Define receta sustrato base
        
        Decide: ¿Cuál es TU receta?
        
        Opciones comunes:
        A. Aserrín roble 80% + paja 10% + cal 1% + goma 1% (clásico)
        B. Aserrín 90% + paja 5% + cal 2% + goma 3% (denso)
        C. Otro (escribe cuál)
        
        Una vez decides, documenta:
        
        DOCUMENTO: Sustrato_Receta_Base.md
        
        # Receta Sustrato Base v1
        
        ## Ingredientes (10 kg total)
        - Aserrín roble: X kg
        - Paja triturada: X kg
        - Cal apagada: X g
        - Goma guar (aglutinante): X g
        
        ## Preparación
        1. Mezcla seco
        2. Humedece a 65% (agrega agua destilada gradualmente)
        3. Verifica humedad (aprieta, debe gotear poco)
        
        ## Esterilización (All American 44L)
        - Bolsas: 10 × PP 20×50 (tienes 20, así que 2 batches)
        - Presión: 15 PSI
        - Temperatura: 121°C
        - Tiempo: 2.5 horas (desde que alcanza presión)
        - Enfriamiento: SIN ABRIR 48h
        
        ## Densidad esperada
        - Compactación: ~700 kg/m³ (medio apretado)
        - Peso bolsa seca pre-esterilización: ~200g
        - Peso bolsa húmeda pre-esterilización: ~320g
        
        ## Yield esperado
        - djamor: 25–30% BE
        - gris: 22–26% BE
        
        (Este documento se repite para cada receta variante)
```

---

### MIÉRCOLES 19 Junio

#### Mañana: Recepción compras + Inventario

```
08:00 — Revisa MercadoLibre/tienda
        ¿Llegaron compras?
        - Si sí: Recibe, verifica que todo esté OK (sin daños)
        - Si no: Confirma entrega (llamar si necesario)
        
        CHECKLIST recepción:
        [ ] Caja Ultraforte 120L (intacta, cierra bien tapa)
        [ ] Icopor láminas ~3m² (sin aplastadas)
        [ ] Calentador acuario 50W (con termostato visible)
        [ ] SHT31 sensor (con datasheet)
        [ ] Relé 4 canales (con pines visibles)
        [ ] Rejilla elevación (sin óxido, plana)
        [ ] Agua destilada 2L (botellas cerradas)
        [ ] Agua oxigenada 30% (botella oscura)
        [ ] Silicona antihongos
        
        FOTO: Todos items sobre mesa, etiquetados
        DOCUMENTO: Materiales_Recibidos_Jun19.txt
```

#### Tarde: Organizar espacio de trabajo

```
14:00 — Prepara espacio construcción Prototipo A (Semana 2)
        
        Necesitas:
        - Mesa amplia (mín. 2m × 1m)
        - Cuchillo/sierra (cortar icopor)
        - Marcador (etiquetar)
        - Periódicos (evitar desorden)
        - Luz buena (ver bien lo que haces)
        
        Organiza:
        - Zona 1: Icopor + herramientas corte
        - Zona 2: Caja Ultraforte + agua
        - Zona 3: Sensores + calentador (NO tocar aún)
        
        FOTO: Espacio listo para construcción

16:00 — Observa test viabilidad spawn (Día 2)
        
        Revisa 4 platos:
        - ¿Primeros signos micelio?
        - ¿Contaminación visible?
        
        FOTOS: Platos día 2 (misma posición)
        ACTUALIZA: Viabilidad_Test.csv (columna Día3)
```

---

### JUEVES 20 Junio

#### Mañana: Revisión infraestructura + Lectura Prototipo B

```
08:00 — Reviesa todos tests hechos:
        
        Checklist:
        [ ] SAB hermético (sin fugas, test hecho)
        [ ] Autoclave funciona (15 PSI, 121°C, mantiene presión)
        [ ] Spawn test viabilidad en curso (día 3, revisar)
        [ ] Materiales Prototipo A recibidos (todos?)
        [ ] Espacio construcción listo (mañana comienza)
        
        Si algo falla → ACTUAR (sellar SAB, revisar autoclave, etc.)

09:00 — Comienza lectura Plan de Prototipos v3, pp. 95–132 (Prototipo B)
        
        Objetivo: Entender Martha tent setup (para Semana 2–3)
        Tiempo: ~1h lectura
        
        Toma notas:
        - Capa 1: Aislamiento icopor exterior
        - Capa 2: Calor radiant (QuietWarmth bajo carpa) — ¿tienes?
        - Capa 3: Niebla tibia (VIVOSUN + calentador)
        - FAE inteligente: Noctua + SCD30 (monitoreo CO₂)
        - Sensores: SHT31 interior, relé corte emergencia
        
        Resultado: Resumen_Prototipo_B.md
```

#### Tarde: Observa spawn + Análisis viabilidad

```
14:00 — Revisa test viabilidad spawn (Día 3)
        
        Documentación:
        FOTOS: Cada plato (zoom en colonización + contaminación)
        
        ANÁLISIS:
        - Rosa: ¿% colonización? ¿Contaminado?
        - Gris: ¿% colonización? ¿Contaminado?
        - Blanca: ¿% colonización? ¿Contaminado?
        - Melena: ¿% colonización? ¿Contaminado?
        
        DECISIÓN INMEDIATA:
        Si viabilidad > 60% en todas → USAR para inoculación (Semana 2)
        Si viabilidad 40–60% → RIESGO, quizá compra emergente
        Si viabilidad < 40% → COMPRA SPAWN NUEVO (no vale gastar tiempo)
        
        DOCUMENTO: Viabilidad_Test_RESULTADOS.md
        - Cepa | Viabilidad % | Contaminación % | Recomendación
```

---

### VIERNES 21 Junio

#### Mañana: Revisión final + Preparación Semana 2

```
08:00 — Completa test viabilidad spawn (Día 5, final)
        
        FOTOS FINALES: Cada plato (resultado conclusivo)
        
        Análisis final:
        ¿Cuál cepa usarás para inoculación? ¿Rosa, Gris, ambas, ninguna?
        
        DOCUMENTO FINAL: Viabilidad_Test_Conclusiones.md

10:00 — Repasa todo lo hecho esta semana
        
        Checklist:
        [ ] Materiales Prototipo A ¿Todos en mano?
        [ ] SAB ¿Hermético y limpio?
        [ ] Autoclave ¿Validado y funciona?
        [ ] Receta sustrato ¿Documentada?
        [ ] Spawn viabilidad ¿Testeado y resultado claro?
        [ ] Espacio construcción ¿Listo?
        [ ] Resúmenes Prototipo A + B ¿Escritos?
        
        Si algo falta → HACE HOY (no pasa al fin de semana)

12:00 — Prepara lista final materiales

        DOCUMENTO: Semana2_ChecklistConstruccion.md
        
        Prototipo A construcción comienza lunes 24.
        Lista exacta de materiales, paso a paso.
        
        Materiales ordenados por orden de uso:
        1. Icopor + caja (forrado)
        2. Agua + calentador
        3. Rejilla
        4. Sensores + relé
        5. Insumos finales
```

#### Tarde: Descanso 🎉

```
15:00 — Fin Semana 1
        
        RESUMEN ENTREGABLES:
        1. Resumen_Prototipo_A.md (tu blueprint construcción)
        2. Resumen_Prototipo_B.md (tu blueprint Martha)
        3. Sustrato_Receta_Base.md (protocolo esterilización)
        4. Viabilidad_Test_Conclusiones.md (dato spawn)
        5. Materiales_Recibidos_Jun19.txt (inventario)
        6. Semana2_ChecklistConstruccion.md (LISTO PARA EMPEZAR)
        
        TODO LISTO PARA:
        Semana 2 (Jun 24): Construcción Prototipo A
        Semana 3 (Jul 1): Inoculación + autoclave bloques
```

---

## 📊 Indicadores de éxito

| Hito | Resultado esperado |
|---|---|
| SAB test | Hermético sin fugas |
| Autoclave test | Presión 15 PSI, T 121°C, sin fugas |
| Materiales | Todo recibido antes de viernes |
| Spawn viabilidad | Rosa + Gris viables > 50% |
| Documentación | 6 documentos listos |
| Prototipo A spec | Claro, listo para construcción |

---

## ⚠️ Si algo falla

| Problema | Solución |
|---|---|
| Material no llega viernes | Compra local tienda física (sábado mañana) |
| SAB tiene fugas | Sella con silicona + tape extra, test nuevamente |
| Autoclave no sube presión | Revisar válvula, limpiar, llamar técnico si necesario |
| Spawn tiene viabilidad < 40% | Compra spawn nuevo ASAP (afecta Semana 2–3) |

---

**¿COMENZAMOS LUNES?**

Si responde "sí", te confirmo:
- Tu cronograma está listo
- Tus tareas para hoy/mañana están claras
- Semana 2 construcción Prototipo A arranca

Prepara: laptop, MercadoLibre, teléfono (llamar tiendas si necesario), ánimo.
