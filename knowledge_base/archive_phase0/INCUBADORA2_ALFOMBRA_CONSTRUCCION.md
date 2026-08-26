---
title: Incubadora 2 — Alfombra Térmica + Aislamiento Mejorado
subtitle: Especificación de construcción y lista de materiales
date: 2026-07-09
category: equipment
---

# Incubadora 2: Construcción Paso a Paso

## Materiales Requeridos

### Estructura e Aislamiento
| Componente | Especificación | Cantidad | Precio COP | Fuente |
|---|---|---|---|---|
| **Caja contenedor** | Ultraforte 120L o similar 60×40×50 cm | 1 | 120–180 K | MercadoLibre, Éxito |
| **Icopor 7 cm espesor** | Planchas 1×1 m para base (1–1.5 m²) | 1.5 m² | 120–180 K | Distribuidor Tenjo/Bogotá |
| **Icopor 5 cm espesor** | Planchas para paredes (interior, 3–3.5 m²) | 3.5 m² | 70–105 K | Distribuidor local |
| **Silicona antihongos** | Tubo 300 ml (2–3 tubos para sellado completo) | 3 | 50–75 K | Ferretería |
| **Papel aluminio (reflexión)** | Rollo 1 m × 50 m (opcional para 2B) | 0.5 | 30–50 K | Supermercado |
| **Subtotal estructura** | — | — | **390–590 K** | — |

### Calefacción
| Componente | Especificación | Cantidad | Precio COP | Notas |
|---|---|---|---|---|
| **QuietWarmth 45W** | Alfombrilla térmica con termostato 24–32 °C | 1 | 80–120 K | MercadoLibre (importada) |
| **Termómetro respaldo** | Analógico o digital para verificación | 1 | 15–30 K | Ferretería |
| **Subtotal calefacción** | — | — | **95–150 K** | — |

### Humidificación (Activa)
| Componente | Especificación | Cantidad | Precio COP | Notas |
|---|---|---|---|---|
| **Humidificador ultrasónico** | 3L, difusor, 25–30W, 80–150 ml/h | 1 | 80–150 K | MercadoLibre, Éxito |
| **Agua destilada inicial** | 5–7 L (garrafones) | 2 | 20–40 K | Droguería |
| **Subtotal humidificación** | — | — | **100–190 K** | — |

### Sensores y Control
| Componente | Especificación | Cantidad | Precio COP | Notas |
|---|---|---|---|---|
| **SHT31 sensor T/HR** | I2C, interfaz digital | 1 | 35–60 K | MercadoLibre, Ali |
| **Arduino Nano 33 IoT** O **Pi Pico W** | Microcontrolador con WiFi (opción económica) | 1 | 60–100 K | MercadoLibre (Nano más caro; Pico + WiFi ~$40 K) |
| **Relé 4 canales 5V** | Módulo relé opto-aislado | 1 | 30–50 K | MercadoLibre |
| **Protoboard + cables Dupont** | Conexiones de prueba | 1 | 15–30 K | Electrónica local |
| **Micro SD + carcasa** | 16–32 GB (si usa Pi Pico) | 1 | 15–30 K | Electrónica |
| **Fuente alimentación** | USB-C 5V 2A (para Nano/Pico) | 1 | 15–25 K | Electrónica |
| **Subtotal sensores** | — | — | **170–295 K** | — |

### Varios (Accesorios)
| Componente | Especificación | Cantidad | Precio COP | Notas |
|---|---|---|---|---|
| **Poly-fil para FAE** | Fibra sintética compactable | 100 g | 5–10 K | Tienda invernadero |
| **Tornillos, tuercas, abrazaderas** | Montaje sensores y estructura | 1 set | 15–25 K | Ferretería |
| **Cinta aislante, termorretráctil** | Protección conexiones eléctricas | 1 | 10–20 K | Electrónica |
| **Rejilla pequeña (opcional)** | Elevación del humidificador 2 cm sobre base | 1 | 20–40 K | Tienda almacén |
| **Subtotal varios** | — | — | **50–95 K** | — |

---

## Presupuesto Consolidado Incubadora 2

| Categoría | Costo |
|---|---|
| Estructura | 390–590 K |
| Calefacción | 95–150 K |
| Humidificación | 100–190 K |
| Sensores | 170–295 K |
| Varios | 50–95 K |
| **TOTAL** | **805–1.320 K** |
| **Promedio** | **~1.060 K** |

**Nota**: Si se omite humidificador activo (prueba pasiva), se baja a 705–1.130 K.

---

## Construcción: Paso a Paso

### Fase 1: Preparación de la Caja (30 min)

1. **Limpiar la caja** con alcohol + paño (desinfección previa)
2. **Marcar cortes en icopor**:
   - Base: 2 piezas de 60×40 cm a 7 cm espesor (una para debajo de la caja, otra adentro)
   - Paredes interiores: 4 piezas 40×50 cm (3 paredes) + 2 piezas 60×50 cm (frente/atrás)
3. **Cortar icopor** con cuchillo caliente o serrucho (si tiene acceso a herramienta)
4. **Encajar piezas de icopor en interior** de la caja (presionadas, sin pegar aún)

### Fase 2: Aislamiento Exterior (Base) (20 min)

1. Colocar **2 piezas de icopor 7 cm bajo la caja** (debajo de toda su huella):
   - Pieza 1: parte frontal 60×40 cm
   - Pieza 2: parte trasera 60×40 cm (o una pieza única si cabe)
   - Asegurar con cinta transparente o bloques de madera laterales

2. Esto crea un colchón aislante bajo toda la caja.

### Fase 3: Sellado de Junturas Internas (30 min)

1. **Aplicar silicona antihongos** en todas las juntas internas icopor↔icopor:
   - Esquinas de las 4 paredes
   - Unión pared↔base interna
   - Dejar 24 h para curado

2. **Opcional para 2B (reflexión)**: Forrar interior con papel aluminio (refleja calor, reduce pérdida)
   - Aplicar con silicona o cinta de aluminio
   - No es crítico si aislamiento es bueno

### Fase 4: Colocación de QuietWarmth (15 min)

1. **Bajo la caja aislada**:
   - Desenrollar QuietWarmth
   - Centrar bajo la caja (área máxima de contacto)
   - Fijar con cinta transparente para evitar movimiento

2. **Conexión eléctrica**:
   - Enchufe a contacto cercano (cable extensión si necesario)
   - Termostato ajustado a **24 °C** (para djamor) o **22 °C** (para shiitake)

> **Jerarquía de control (decisión de diseño).** El termostato propio de la QuietWarmth es el **control primario** de temperatura. El relé gobernado por el SHT31 es exclusivamente **corte de seguridad de segundo nivel** (sobretemperatura), no un lazo de regulación. No intentar regular con el relé: produciría ciclado rápido y desgaste del contacto.

> **Setpoints — pendiente de validación.** Los valores 24 °C / 22 °C son de **incubación (colonización)**, no de fructificación. Los parámetros de fructificación validados por especie viven en `knowledge_base/01_species/` y en la nota de memoria `parametros_especificos_especies`. Confirmar el setpoint de colonización por especie antes de fijarlo como operacional: *P. djamor* tolera colonización más cálida que *H. erinaceus*. Hasta esa validación, tratar estos números como **hipótesis de trabajo**.

### Fase 5: Instalación del Humidificador (20 min)

1. **Posición**: Esquina inferior frontal de la caja (acceso fácil para rellenado)
2. **Elevación**: Si hay espacio, colocar sobre rejilla 2–3 cm sobre el suelo (mejor difusión)
3. **Llenado inicial**: 3 L agua destilada
4. **Tubo de difusión**: Orientado hacia el interior sin apuntar directo a bolsas

### Fase 6: Instalación del SHT31 (25 min)

1. **Ubicación**: Centro de la caja, altura media (entre bolsas y tapa)
2. **Protección**: Montar en pequeño soporte plástico (no sobre bolsas)
3. **Conexiones I2C**:
   - SDA → GPIO de Arduino/Pi Pico
   - SCL → GPIO de Arduino/Pi Pico
   - GND y 3.3V (o 5V si es SHT31 tolerante)
4. **Cable**: Pasar por un pequeño orificio lateral (sellado después)

### Fase 7: Instalación del Relé (20 min)

1. **Posición**: Fuera de la caja (caja IP65/IP67 pequeña; no protoboard expuesta en operación)
2. **Conexión — usar contacto NO (normally open), no NC**:
   - Entrada: Pin GPIO del ESP32/Arduino
   - **NO (normally open)** del relé → alimentación de la QuietWarmth
   - Lógica: el GPIO debe **energizar activamente** el relé para que la resistencia reciba corriente
3. **Testeo**: Verificar que relé abre/cierra con comando GPIO, y que al desconectar el microcontrolador la QuietWarmth queda **apagada**

> **Corrección de seguridad (fail-safe).** La versión previa de este documento especificaba contacto **NC**. Con NC, un cuelgue, reset o pérdida de firmware del microcontrolador deja el contacto cerrado y la QuietWarmth **energizada sin supervisión** — el modo de falla peligroso. Con **NO**, cualquier fallo del controlador o de su alimentación corta la resistencia (falla al lado seguro). El termostato interno de la alfombra sigue actuando como límite independiente.
>
> Estado: **decisión adoptada**, pendiente de verificación en banco antes de operar con bolsas.

### Fase 8: Ventilación Pasiva (FAE) (20 min)

> **Revisar antes de perforar.** Esta es una incubadora de **colonización**, no de fructificación. Durante la colonización el CO₂ elevado no es un problema y en varias especies favorece el crecimiento vegetativo del micelio; las tasas altas de FAE (5–8 cambios/h en *P. djamor*) corresponden a **fructificación**. Además, si las bolsas ya llevan filtro de intercambio gaseoso (ver `EQUIPAMIENTO_REAL_Bolsas_Filtros.md`), el intercambio ocurre a nivel de bolsa y la ventilación de la caja es en gran medida redundante.
>
> Recomendación: **empezar con un solo orificio de 38 mm** (o ninguno, si las bolsas son con filtro) y añadir el segundo únicamente si la validación de 48 h muestra condensación persistente o CO₂ fuera de rango. Perforar es irreversible; añadir después es trivial. Estado: **recomendación**, no parámetro validado.

1. **Dos orificios laterales opuestos** de 38 mm cada uno:
   - Uno inferior (extracción de CO₂, que es denso)
   - Uno superior (entrada de aire fresco)

2. **Relleno con Poly-fil compactado**:
   - Compactar el Poly-fil para reducir flujo pero permitir intercambio mínimo
   - Objetivo: ~50 ppm CO₂ más que ambiente

3. **Alternativa**: Usar tubos de plástico 38 mm con Poly-fil adentro (fácil desmontaje)

### Fase 9: Instalación de la Tapa (15 min)

1. **Icopor en tapa** (opcional pero recomendado para 2A):
   - Forrar interior de tapa con Icopor 5 cm (pegado con silicona)
   - Dejar 24 h de curado

2. **Cierre**: Presionar tapa sin atornillar (debe ser removible)

### Fase 10: Configuración de Sensores (45 min — si no se ha hecho)

> **Alineación con la arquitectura de automatización del proyecto.** La línea definida para Setas de la Peña es **ESP32 + ESPHome + Home Assistant en RPi4** (ver `Arquitectura_Automatizacion_Setas_de_la_Pena.docx`, `cloudlab_esp32.yaml`, `plan_ha_v1.md`). El prototipo de esta incubadora debe usar la misma pila, no firmware C++ suelto sobre Arduino Nano/Pico: así el corte de seguridad, el logging y las alarmas quedan en HA junto con el resto de los módulos, sin una segunda base de código que mantener.
>
> El bloque Arduino de abajo se conserva únicamente como **referencia de banco de pruebas rápido**. No es la implementación de destino.

**ESPHome (implementación de destino):**
```yaml
# Fragmento — integrar en el paquete ESPHome del módulo
i2c:
  sda: GPIO21
  scl: GPIO22

sensor:
  - platform: sht3xd
    address: 0x44
    update_interval: 30s
    temperature:
      name: "Inc2 Temperatura"
      id: inc2_t
      on_value_range:
        # Corte de seguridad: por encima de 28 °C se desenergiza el relé
        above: 28.0
        then:
          - switch.turn_off: inc2_calefaccion
        below: 26.0
        then:
          - switch.turn_on: inc2_calefaccion
    humidity:
      name: "Inc2 Humedad Relativa"

switch:
  - platform: gpio
    pin: GPIO5
    id: inc2_calefaccion
    name: "Inc2 QuietWarmth"
    restore_mode: ALWAYS_OFF   # fail-safe: tras reinicio queda apagada

# Si el sensor deja de reportar, cortar la calefacción
interval:
  - interval: 60s
    then:
      - if:
          condition:
            lambda: 'return isnan(id(inc2_t).state);'
          then:
            - switch.turn_off: inc2_calefaccion
```

Notas sobre este fragmento:

- `restore_mode: ALWAYS_OFF` implementa el fail-safe en firmware, complementando el contacto NO del relé.
- El bloque `interval` cubre el caso de **sensor caído**: sin lectura válida no hay supervisión, así que se corta la calefacción en vez de asumir que todo está bien.
- La histéresis 26–28 °C es amplia a propósito: este lazo es corte de seguridad, no regulación.

**Arduino Nano (solo banco de pruebas, no producción):**
```cpp
#include <Wire.h>
#include <Adafruit_SHT31.h>

Adafruit_SHT31 sht31 = Adafruit_SHT31();
const int RELAY_PIN = 5; // GPIO5 -> bobina del relé, contacto NO

void setup() {
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // arranque seguro: relé sin energizar = calefacción OFF
  if (!sht31.begin(0x44)) {
    Serial.println("SHT31 no responde — calefaccion permanece OFF");
    while (1) { delay(1000); } // sin sensor no hay supervision: no energizar
  }
}

void loop() {
  float t = sht31.readTemperature();
  float hr = sht31.readHumidity();

  if (isnan(t)) {
    digitalWrite(RELAY_PIN, LOW); // lectura invalida -> corte
    Serial.println("Lectura invalida — corte de calefaccion");
    delay(30000);
    return;
  }

  Serial.print("T="); Serial.print(t); Serial.print("C HR="); Serial.print(hr); Serial.println("%");

  if (t > 28.0) {
    digitalWrite(RELAY_PIN, LOW);  // desenergiza relé -> corta QuietWarmth
  } else if (t < 26.0) {
    digitalWrite(RELAY_PIN, HIGH); // energiza relé -> permite QuietWarmth
  }

  delay(30000); // Lectura cada 30 seg
}
```

**Testeo**:
- [ ] SHT31 comunica (`i2cdetect` debe mostrar 0x44)
- [ ] Relé responde a GPIO (verificar con multímetro continuidad)
- [ ] Humidificador prende/apaga manualmente
- [ ] QuietWarmth llega a 24 °C en agua de prueba

---

## Validación Pre-Hongos (48 horas)

Antes de introducir bolsas inoculadas:

1. **Rampup**: Prender Inc 2, grabar T° y HR cada 30 min por 4 h (¿alcanza 24 °C?)
2. **Estabilidad**: Apagar humidificador, verificar que HR baja naturalmente (no hay condensación extrema)
3. **Oscuridad**: Cerrar tapa, verificar obscuridad total (no entra luz visible)
4. **Flujo de aire**: Colocar incienso cerca de orificios Poly-fil → debe circular ligeramente (sin corrientes fuertes)
5. **Seguridad**: Verificar que no hay cables sueltos ni riesgo de electrodoméstico mojado
6. **Prueba de fail-safe (obligatoria)**: con la QuietWarmth encendida y el relé energizado, **desconectar la alimentación del ESP32**. La resistencia debe apagarse de inmediato. Repetir desconectando el sensor SHT31: la calefacción debe cortarse dentro de 60 s. Si en cualquiera de los dos casos la resistencia sigue energizada, el cableado del relé está en NC — corregir antes de continuar.

**Si todo pasa**: Listo para inocular.

---

## Diferencia Inc 1 vs Inc 2 en Construcción

| Aspecto | Inc 1 (Baño María) | Inc 2 (Alfombra) |
|---|---|---|
| **Tiempo construcción** | ~6 h (incluye curado silicona) | ~5 h (más compacta) |
| **Complejidad eléctrica** | Media (Pi Zero + I2C) | Similar (Arduino/Pico + relé) |
| **Mantenimiento semanal** | Nivel de agua (+nivel) | Rellenar humidificador |
| **Riesgo falla crítica** | Calentador submergido | Relé de corte del humidificador |
| **Facilidad escalado** | Media | Alta (módulos totalmente independientes) |

---

## Timeline Recomendado

- **Día 1**: Compra de materiales (local day + online en paralelo)
- **Días 2–3**: Construcción Inc 2
- **Días 4–5**: Validación sin hongos (48 h banco de pruebas)
- **Día 6**: Paralela con Inc 1 (si aún no construida) o inicio colonización

Ambas operando simultáneamente a partir de **Día 6–7**.

---

**Próximos pasos**: ¿Validamos lista de compras consolidada para ambas incubadoras?
