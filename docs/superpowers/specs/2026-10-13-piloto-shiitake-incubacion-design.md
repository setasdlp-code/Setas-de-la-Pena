# Piloto de shiitake: incubación con control automático de temperatura

Fecha: 2026-10-13. Estado: borrador para aprobación de Sebastián.
Ubicación de trabajo: Tenjo (terraza). Rama: `kb/inventario-cable-calefactor-silicona`.

Convención: **[Decisión]** la tomó Sebastián. **[Mi decisión]** la tomé yo al redactar y debe revisarse. **[KB]** viene de `knowledge_base/`. Las cifras marcadas como estimación no están medidas.

## 1. Intención

Setas de la Peña no ha iniciado el cultivo y diseña antes de producir. El primer lote será de *Lentinula edodes* (shiitake), la especie prioritaria de arranque según `knowledge_base/01_species/lentinula_edodes.md`.

El piloto busca dos cosas:

1. Validar con datos medidos el diseño de la incubación y su control automático de temperatura, antes de dimensionar el centro comercial.
2. Obtener los primeros datos reales de ciclo, contaminación y temperatura de núcleo, sin proyectar rendimientos a partir de la literatura (regla del KB en `07_business/economics.md`).

## 2. Alcance

### Objetivos
- **[Decisión]** 30 bloques de 2,0 kg (60 kg de sustrato húmedo), incubados solo en la incubadora nueva.
- **[Decisión]** La incubadora lleva solo control de temperatura por ahora.
- Probar el lazo de control de temperatura, el registro y las alarmas, con los criterios de la sección 7.
- Obtener un mapa térmico (base, centro, parte superior) y la temperatura de núcleo de un bloque testigo.

### No objetivos
- Control de humedad ni de CO₂ en la incubadora. La HR y el CO₂ solo se registran como diagnóstico.
- Automatizar la fructificación en la CLOUDLAB 844. Es un trabajo posterior.
- Dimensionar el centro comercial, proyectar kg de cosecha o calcular márgenes.
- Comprar equipo en volumen. DEC-015 limita las compras de cajas apilables a tres muestras.

### Anti-objetivos (el piloto fracasa aunque "funcione")
- Lotes contaminados por falta de validar el ciclo de autoclave.
- Un control que depende de Wi‑Fi o Home Assistant para ser seguro.
- Un setpoint copiado de otra cepa o de la literatura sin identificar la cepa.
- Resultados que no sean trazables al lote, la cepa y el sensor que los midió.

## 3. Decisiones tomadas

| Tema | Decisión | Origen |
|---|---|---|
| Escala | 30 bloques × 2,0 kg = 60 kg de sustrato húmedo | [Decisión] |
| Proveedor del spawn | Fungiilab, micelio nacional de *L. edodes*, bolsa de 2 kg a $48.000 COP | [Decisión] |
| Dónde incuba | Solo en la incubadora nueva, no en la CLOUDLAB 844 | [Decisión] |
| Control en incubadora | Solo temperatura | [Decisión] |
| Incubadora | 80 × 60 × 100 cm, interior de mylar, varias capas de icopor, exterior de paneles de cielorraso PVC (como la caseta de la CLOUDLAB) | [Decisión] |
| Calefactor | 2 cables de silicona con fibra de carbono de 5,2 m conectados **en serie** | [Decisión] |
| Ubicación | Terraza | [Decisión] |
| Ventilación | Un ventilador de 12 V con entrada y salida de aire pasivas | [Decisión] |
| Fructificación posterior | CLOUDLAB 844, ya instalada en la terraza | [Mi decisión] |

## 4. Restricciones

- **[KB]** No hay setpoint de incubación aprobado. La banda depende de la cepa y su clase térmica (fría, media o alta). El rango de literatura 20–24 °C solo sirve para diseñar el piloto, no para controlar.
- **[KB]** Ciclo total provisional: 90–150 días entre inoculación y primera cosecha (maduración del bloque de 50–120 días según la cepa).
- **[KB]** Gates antes del lote 1: cepa y spawn trazables, formulación aprobada, ciclo de autoclave validado con carga representativa (All American 1941X, 39 L) y registro de temperatura y HR reales.
- **[KB]** La protección térmica física es independiente de ESPHome y Home Assistant. Calefactor, ventilador y electrónica quedan fuera del volumen que contiene las bolsas.
- **[KB]** Las bolsas conservan su parche filtrante libre. La incubadora no es hermética. No se humidifica con bolsas selladas.
- **[KB]** Instalación eléctrica con revisión RETIE y protección diferencial, por estar en terraza (zona húmeda).
- Los datos del cable calefactor vienen del anuncio y no están verificados (`EQ-HEATER-SILICONE-CABLE-001`).

## 5. Diseño

### 5.1 Calefacción

- **[Decisión]** Dos cables de 5,2 m en serie. Con 33 Ω/m cada uno: 171,6 Ω por cable, 343,2 Ω en serie. A 120 V da unos **42 W**. Un solo cable daría ~84 W y dos en paralelo ~168 W. Estimación basada en la resistencia del anuncio.
- Pérdida estimada de la caja: 25–30 W con 5 cm de icopor y 10 °C de diferencia con el ambiente. Estimación mía, con espesor supuesto y sin medir.
- **[Mi decisión]** Los cables no se cortan ni se superponen. Se montan separados entre sí sobre una placa o rejilla metálica dentro de un plenum bajo la rejilla de bolsas, con un ventilador que reparta el aire (Noctua NF-P12 o GDSTIME IP68 del inventario). Los cables y el plenum no tocan el icopor.
- **[Mi decisión]** Conmutación con un relé Hosyond (aislamiento óptico) para la línea de 120 V. Hay que verificar en la ficha del módulo su corriente y tensión nominales antes de usarlo con carga de red.
- Antes de instalar se mide con multímetro la resistencia real de cada cable. Si la potencia calculada con la medición se aparta de ~42 W, se revisa esta sección.

### 5.2 Seguridad (independiente del firmware)

- Termostato bimetálico de corte a 35 °C y fusible térmico en serie con la línea del calefactor. Es el último recurso. La alerta de núcleo (sección 5.3) actúa antes.
- Protección diferencial de alta sensibilidad y revisión RETIE.
- Relé en estado OFF al reiniciar. El ventilador del plenum y el calefactor tienen interbloqueo: sin ventilador, calefactor apagado.
- Sensor inválido o ausente: calefactor apagado y alarma.

### 5.3 Medición y control

- **Control local:** ESP32 con ESPHome, un lazo por incubadora, con histéresis. Funciona aunque Home Assistant o la red fallen. Home Assistant solo supervisa y guarda históricos.
- **Sensor de control del aire:** SHT45 con membrana (breakout disponible en inventario) protegido de goteo y de radiación directa, lejos del calefactor.
- **Mapa térmico:** tres DS18B20 (base, centro, parte superior) comparados juntos durante 48–72 h antes del ensayo, con offsets registrados. Pull-up de 4,7 kΩ y direcciones fijas en el YAML.
- **Sonda de núcleo:** una DS18B20 inox de 100 mm en el centro de un bloque testigo. Filtro de media móvil (EWMA, α ≈ 0,1). Alerta si el núcleo supera 28 °C o está más de 5 °C sobre el aire (valores del KB).
- **Diagnóstico:** HR del SHT45 y CO₂ con un SCD30 temporal (una sola estrategia de compensación de altitud). Sin actuadores asociados.
- Registro local cada 60 s como máximo.
- **[Mi decisión]** Sin enfriamiento: la incubadora solo calienta. Si el aire supera la banda (por ejemplo por sol o calor metabólico), el sistema apaga el calefactor, enciende la ventilación y alarma, pero no baja la temperatura por sí solo.
- **[Mi decisión]** Las alarmas llegan por Home Assistant (notificación a Sebastián y al cuidador) y tienen un indicador local en la incubadora. Requiere cobertura Wi‑Fi en la terraza, que no está verificada.
- **Banda de temperatura:** pendiente de la cepa. El piloto no arranca sin una especificación de lote versionada con banda, histéresis y límites.

### 5.4 Incubadora y carga

- Bolsas elevadas del piso sobre rejilla lavable, sin apoyarse en agua ni en aislamiento poroso.
- Los 30 bloques caben, según estimación mía, en dos niveles de repisa de 0,48 m² con espacio de aire (bolsa Unicorn de ~20 × 13 × 51 cm). Hay que probarlo con bolsas reales.
- Cielorraso PVC en el exterior es compatible con el KB (piel exterior lavable y desmontable). El interior debe ser lavable y sin bordes de mylar que retengan condensación.
- El calor metabólico del micelio puede subir el núcleo 4–8 °C sobre el aire [KB]. Con una caja bien aislada y 42 W, el riesgo principal puede ser sobrecalentar, no enfriar.

- **[Decisión]** Ventilación: un ventilador de 12 V, con entrada y salida de aire pasivas (aberturas sin ventilador propio).
- **[Mi decisión]** El ventilador de 12 V del inventario (Noctua NF-P12 o GDSTIME IP68) se alimenta con la Mean Well LRS-50-12 y funciona en el plenum, repartiendo el aire caliente. El intercambio con el exterior depende solo de las aberturas pasivas, de modo que no hay renovación forzada. Esto es una interpretación mía de tu respuesta: confirma si el ventilador es de circulación o de extracción.
- **[Mi decisión]** El tamaño y la posición de las aberturas no se fijan de antemano. Se ajustan en las fases 1 y 2 midiendo CO₂ dentro y fuera, y la temperatura de núcleo. Las aberturas deben llevar filtro o malla contra polvo y estar protegidas de lluvia y sol directo, y no pueden quedar bloqueadas por las bolsas.
- **[Mi decisión]** Si el CO₂ o la temperatura de núcleo suben más de lo permitido y las aberturas pasivas no alcanzan, el diseño pasa a ventilación forzada. Se registra como cambio de diseño, no como ajuste del piloto.
- El ventilador debe detectarse apagado: con un modelo con salida de tacómetro (el Noctua lo tiene) o midiendo la corriente. Si el ventilador falla, el calefactor se apaga (interbloqueo de la sección 5.2).

## 6. Plan de pruebas

| Fase | Duración | Qué se hace | Se pasa a la siguiente si |
|---|---|---|---|
| 0. Perfil del sitio | ≥14 días | Registrar temperatura y HR de la terraza, con mínimos nocturnos | Se conoce el rango real del ambiente |
| 1. Vacío | 72 h | Incubadora sin carga, control encendido | Mantiene la banda de prueba, sin sobreimpulso fuera de límites y sin alarmas falsas |
| 2. Carga simulada | 72 h | Bolsas con masa térmica equivalente y ventilación prevista | Cumple los criterios de la sección 7 |
| 3. Fallos | 1 día | Sensor desconectado, ventilador detenido, corte y retorno de energía | El calefactor queda apagado o contenido por la protección física en cada caso |
| 4. Biológica | Un ciclo (90–150 días, provisional) | Los 30 bloques con la cepa y la especificación de lote | Se cierra el ciclo y se registran los resultados |

La fase 4 no empieza hasta cumplir los gates del KB (sección 4). Fungiilab tarda en entregar: pedir el spawn unas 3 semanas antes de inocular (criterio de la hoja de ruta v2).

## 7. Criterios de éxito (provisionales)

Son los del KB (`04_facility/incubation.md`) salvo donde se indica. Se ajustan con los datos del piloto.

- ΔT base–centro–tope ≤ 2 °C durante ≥ 95 % de los intervalos.
- Temperatura de núcleo ≤ 28 °C y diferencia núcleo–aire ≤ 5 °C durante la colonización.
- Sin agua libre sobre bolsas, aislamiento, cableado o calefactor.
- Tras un corte de energía el sistema arranca en estado seguro y retoma el control sin intervención.
- Sensor inválido, ventilador detenido o sobretemperatura generan alarma y apagan el calefactor.
- Por cada lote se registran cepa, spawn (lote y fecha), masa del bloque, fechas y contaminación, con trazabilidad al sensor.

Qué se aprende: estabilidad y sobreimpulso, consumo, diferencia entre núcleo y aire, BE por bloque, duración de cada fase y tasa de contaminación. Esto alimenta el dimensionamiento posterior.

## 8. Pendientes

**De Sebastián (cambian lo que se construye):**
1. **Cepa de shiitake:** Fungiilab no la informa. Resuelto por DEC-019: cepa "no identificada" aceptada para el lote 1 y caracterizada en el piloto. Pendiente: aprobar la banda de temperatura provisional (ver `knowledge_base/06_operations/lote1_shiitake_especificacion_ambiental.md`).
2. **Banda de temperatura de incubación** y su histéresis, definidas a partir de la cepa.
3. **Ventilación de la incubadora:** ya definida como ventilador de 12 V con entrada y salida pasivas. Falta confirmar el modelo y la función del ventilador (circulación o extracción) y las dimensiones de las aberturas, que se ajustan con las pruebas de las fases 1 y 2.
4. **Formulación del sustrato** de los bloques de 2,0 kg (aprobada o pendiente) y validación del ciclo de autoclave con esa carga (cuántas bolsas caben en 39 L).

**Compras o verificaciones (mi lectura del inventario):**
- Cobertura Wi‑Fi en la terraza para ESP32 y Home Assistant.
- 4 sondas DS18B20 (3 de mapa, 1 de núcleo) y resistencias de 4,7 kΩ. No figuran en el inventario.
- Termostato bimetálico de 35 °C y fusible térmico. No figuran.
- Protección diferencial. No figura.
- SCD30: `CURRENT_OPERATIONS.md` lista 2 y `hardware_inventory_august_2026.md` no los lista. Confirmar en sitio.
- Ficha del relé Hosyond para carga de 120 V.

**Del constructor (las decide quien planifique):** disposición exacta de bolsas, referencias de componentes, esquema eléctrico, YAML de ESPHome y formato de registro.

## 9. Costos conocidos

- Spawn: 2 bolsas de 2 kg × $48.000 = **$96.000 COP**, con dosis de 5–7 % del peso del bloque (3,0–4,2 kg de spawn en total). La dosis real la confirma Fungiilab.
- Resto: sin cotizar.
