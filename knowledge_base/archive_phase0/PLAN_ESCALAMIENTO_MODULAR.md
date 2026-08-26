# Plan Maestro de Escalamiento Modular
**Setas de la Peña — De Martha Tents a Granja Comercial**
**Versión: 1.1 — Actualizado 19 Junio 2026**

> **Estado: borrador histórico de diseño.** No representa inventario ni configuración actual. Para estado vigente usar `knowledge_base/FARM_BRAIN.md`; para automatización usar `plan_ha_v1.md` y `knowledge_base/05_equipment/environmental_control.md`.

---

## Principios de diseño

1. Ningún componente comprado en las primeras etapas debe quedar obsoleto al escalar.
2. Cada módulo debe poder operar de forma independiente ante una falla de otros módulos.
3. La automatización crítica debe ejecutarse localmente; el servidor central solo supervisa, registra datos y genera alertas.
4. Las pruebas de nuevas especies, recetas y tecnologías deben realizarse aisladas de la producción principal.
5. La infraestructura debe crecer por módulos repetibles en lugar de requerir rediseños completos.
6. **[AÑADIDO 2026-06-19]** Todo sensor usado para control automático debe validarse contra al menos una referencia independiente antes del primer ciclo productivo. La experiencia con el VIVOSUN H05 confirmó que sensores integrados en actuadores pueden tener sesgo severo (>30%) sin indicación visual de falla.

---

## Fase 1 – Plataforma piloto (propuesta histórica)

### Objetivo
Validar protocolos de cultivo, automatización y operación diaria con **una Martha Tent**. La segunda carpa se incorpora solo después de un GO/NO-GO con datos reales del primer ciclo.

### Infraestructura

- 1 Martha Tent 65" Terra Fungus (disponible)
- Control ambiental autónomo local (Pi Zero + relay 4ch)
- Sensores validados: SHT31 (control), 2× Inkbird IBS-TH2 Plus (verificación cruzada)
- Sensor CO₂: SCD30 NDIR con compensación altitud 2.600 msnm
- Fan FAE: AC Infinity Cloudline H4 4" IP65 controlado por Pi Zero
- Circulación interna: Noctua NF-P12 (velocidad fija baja)
- Incubadora Prototipo A: Pi Zero + relay + SHT31 + MH-Z19C
- Registro histórico local en CSV

### Validación de sensores — paso obligatorio antes del primer ciclo

**Lección aprendida (2026-06-19):** El VIVOSUN H05 en modo auto usa su propio sensor, que lee 30–35% más alto que la realidad. Confirmado con medidor analógico + 2× Inkbird IBS-TH2 Plus. Causa probable: saturación del sensor por proximidad a niebla ultrasónica — fenómeno físico documentado en múltiples marcas de humidificadores ultrasónicos.

**Protocolo de validación obligatoria:**
1. Instalar mínimo 2 sensores independientes en la carpa antes de activar control automático
2. Dejar estabilizar 1 hora con carpa cerrada
3. Diferencia aceptable entre sensores: ≤ 5% RH, ≤ 1°C
4. Si difieren más: identificar cuál es el outlier con un tercer referente (analógico u otro)
5. Solo el sensor validado como confiable se usa para el lazo de control
6. El actuador (humidificador, fan) nunca controla con su propio sensor integrado sin validación

### Control de humedad — arquitectura validada

```
SHT31 (sensor confiable, validado)
    ↓
Pi Zero 2W (lógica de control local)
    ↓
Relay 4ch → VIVOSUN H05 en MANUAL al 100%
              (actúa solo como actuador, sensor propio ignorado)

IBS-TH2 Plus ×2 → verificación cruzada + alertas celular
```

### Control CO₂ / FAE

```
SCD30 NDIR (I2C → Pi Zero)
    ↓
Pi Zero: CO₂ > 900 ppm → H4 ON
         CO₂ < 700 ppm → H4 OFF
    ↓
Failsafe local y línea base definidos después de commissioning (sin timer fijo)
```

### Producción Fase 1

- Orellana rosada (*P. djamor*) — carpa Martha
- Orellana gris (*P. pulmonarius*) — ambiente Tenjo (control comparativo)

### Objetivos técnicos

- Validar protocolo de control con sensores confiables
- Estandarizar receta de sustrato y spawn para djamor
- Construir base de datos ambiental (CSV: T°, HR, CO₂, primordios, cosecha)
- Establecer SOP de producción replicable
- Alimentar Simulador de Recetas v4.0 con datos reales

---

## Fase 2 – Expansión modular (después de GO/NO-GO Fase 1)

### Objetivo
Incrementar capacidad sin modificar la arquitectura. Segunda carpa + humidificadores con VPD autónomo.

### Infraestructura

Agregar módulos idénticos. Cada unidad mantiene:
- Humidificación propia (AC Infinity CloudForge T7)
- Extracción propia (H4 4" IP65)
- Calefacción propia (CHE cerámico + BN-LINK thermostat)
- Sensores propios (IBS-TH2 Plus + SCD30)
- ESP32 propio (ESPHome, autónomo sin HA)

Solo se comparte:
- Home Assistant (Pi 4) — monitoreo, alertas, dashboard
- Base de datos histórica
- Sistema de alertas celular

### Beneficios

- Fallas aisladas por módulo
- Escalamiento lineal sin rediseño
- Comparación de parámetros entre módulos

---

## Fase 3 – Salas de fructificación (Año 1–2)

### Objetivo
Reducir costo operativo por kg producido con humidificación y ventilación industriales.

Las Martha Tents **continúan operativas** con roles permanentes:

1. **I+D**: nuevos sustratos, cepas, suplementos, algoritmos de control
2. **Especies premium**: melena de león, nameko, reishi, enoki — parámetros específicos
3. **Cuarentena biológica**: todo cultivo nuevo de terceros pasa primero por una Martha
4. **Producción de nicho**: pedidos especiales, restaurantes, ferias, clientes gourmet
5. **Laboratorio de automatización**: nuevos sensores, firmware ESP32, algoritmos PID, visión por computador — solo se despliega en producción tras validar aquí
6. **Respaldo operativo**: resguardo de genética, continuidad durante mantenimiento de sala principal

---

## Fase 4 – Centro de producción consolidado (Año 2+)

Producción masiva en salas especializadas. Martha Tents como infraestructura estratégica permanente para investigación, innovación, bioseguridad, producción especializada, capacitación y respaldo.

---

## Arquitectura tecnológica objetivo

```
                 Home Assistant (Pi 4)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    Martha 1        Martha 2       Sala Comercial
        │               │               │
    Pi Zero           ESP32        Control Local
        │               │               │
   SHT31+SCD30     SCD30+IBS-TH2   T/HR+CO₂
        │               │               │
   H05 (manual)       T7 VPD       Humidif. industrial
        │               │               │
   AeroZesh S4        H4 IP65       HVAC / FAE
        │               │               │
  CHE cerámico     CHE cerámico    Calefacción
```

---

## Estrategia de inversión

**Comprar pensando a largo plazo:**
- Sensores de alta calidad y marca conocida (Sensirion, Inkbird)
- Siempre validar sensores con referencia independiente antes de usar en control
- ESP32 por módulo — autónomo, no depende de nube
- Sistemas eléctricos seguros (GFCI, UPS, supresor de pico)
- Componentes reutilizables entre fases

**Evitar:**
- Sensores integrados en actuadores sin validación externa
- Equipos que dependan de un único punto de fallo
- Automatizaciones no replicables o que requieran conexión cloud para funcionar
- Componentes propietarios que limiten futuras integraciones

---

## Meta a cinco años

Instalación donde las salas centralizadas generan el mayor volumen comercial, mientras las Martha Tents funcionan como laboratorio vivo para experimentación, conservación de genética, producción de nicho y validación tecnológica — aportando valor continuo en lugar de convertirse en activos subutilizados.
