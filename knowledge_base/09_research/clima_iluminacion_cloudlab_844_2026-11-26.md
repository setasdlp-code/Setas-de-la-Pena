---
title: "CLOUDLAB 844 — auditoría de control, calefacción e iluminación"
document_id: DOC-0150
category: research
load_priority: on_request
last_reviewed: 2026-11-27
status: draft
authority: advisory_research
confidence: medium
related_documents:
  - ../04_facility/fruiting.md
  - ../05_equipment/environmental_control.md
  - ../DECISIONS.md
  - ../05_equipment/hardware_inventory_august_2026.md
  - unresolved_questions.md
---

# CLOUDLAB 844 — auditoría de control, calefacción e iluminación

**Pregunta.** ¿Qué puede comisionarse con los equipos reportados en Tenjo y qué evidencia falta para seleccionar calefacción y luz de fructificación? Fuentes públicas consultadas el 26 de noviembre de 2026. Propuesta de diseño y pruebas, pendiente de aprobación antes de energizar o comprar.

## Inventario y configuración propuesta

El [inventario](../metadata/equipment.yaml) registra una CLOUDLAB 844, dos extractores CLOUDLINE H4 y un humidificador CLOUDFORGE T7. Los **dos CONTROLLER 69 PRO** están reportados por el propietario, pendientes de identificación física, ubicación y prueba. El T7 del inventario es el **humidificador CLOUDFORGE**, modelo distinto del calefactor THERMOFORGE T7. Los THERMOFORGE y las luminarias candidatas de esta auditoría quedan como opciones de compra. El inventario ya incluye una tira Neon Flex USB de 5 V y una carpa con LED integrado para prototipos. Identificar su ubicación y comprobar iluminancia y aptitud para humedad antes de decidir si la tira existente cubre el ensayo.

**Controller 69 Pro (CTR69P), Tier 2.** Cuatro puertos UIS con programación independiente y diez niveles, una sonda ambiental compartida por los puertos, disparadores de temperatura/HR/VPD, ciclos y horarios. La app usa Bluetooth o Wi-Fi de 2,4 GHz. La ficha declara 35–85 % HR para el equipo. Montar el controlador fuera de la carpa, con la sonda en la zona representativa de los bloques, protegida de chorro y condensación. Confirmar por separado el límite de la sonda y su comportamiento a HR alta. [Ficha oficial](https://acinfinity.com/controller-69-pro-smart-climate-controller-uis-4-port-with-temp-humidity-vpd-sensor/) · [Guía de programación](https://acinfinity.com/pages/controller-programming/controller-69-pro-overview.html) · [Guía rápida](https://acinfinity.com/content/CTR69P2305X1_230510_%20Quick%20Start%20Guide.pdf)

| Puerto propuesto | Equipo | Programa sujeto a comisionamiento |
|---|---|---|
| 1 | CLOUDLINE H4 de CLOUDLAB | Ciclo o nivel a partir del caudal medido y la ficha del lote. El operario ajusta con la serie de CO₂ del ESP32. |
| 2 | CLOUDFORGE T7 | Disparador por HR baja, con límites de intensidad y transición según la ficha del lote y la respuesta medida. |
| 3 | THERMOFORGE, si se aprueba | Modo calefacción por temperatura baja. Mínimo 0 para el estado sin demanda y máximo según prueba. Verificar el resultado ante corte y sensor inválido. |
| 4 | Reserva | Si se valida un UIS Control Plug para una fuente LED, puede programar el horario. La regulación de intensidad sigue en el dimmer de 24 V. |

La asignación es una propuesta para **una cámara** bajo [DEC-025](../DECISIONS.md#dec-025--controlador-comercial-uis-ac-infinity-controller-69-pro-para-h4-y-t7-de-fructificación-el-esp32-sigue-como-única-fuente-de-datos), que sigue pendiente de aprobación. Mantener el segundo 69 Pro en reserva hasta verificarlo y decidir su asignación. Martha conserva circuito de aire y control independientes. ESP32/ESPHome mantiene SHT3x como referencia primaria y SCD30 como candidato para CO₂, sujeto a calificación. Setas OS sigue en lectura desde el nodo; los eventos de actuación UIS requieren registro separado para cotejarlos con T/HR/CO₂. Usar temperatura y HR de la especificación del lote. El FAQ del CTR69P documenta que conserva sus ajustes tras un corte. Ensayar por separado actuación tras retorno eléctrico, control local sin internet, discrepancias entre sondas y estabilidad. [FAQ CTR69P, p. 70](https://acinfinity.com/content/CW2306X1_230626_CLOUDWAY%20Manual.pdf#page=70)

## Calefacción — selección por aire de entrada

| Candidato | Especificación publicada de EE. UU. | Control y alcance |
|---|---|---|
| [THERMOFORGE S7, AC-SFS7](https://acinfinity.com/thermoforge-s7-plant-heater-1000w-with-10-heating-and-air-intake-levels/) | 1.000 W, 120 V CA, 10 A de ficha, 30–65 % HR incluido el aire entrante | Calor/ventilador local por nivel y control climático por UIS. Ducto de 4 pulgadas, manguera por separado. Primera opción de 1.000 W si el 69 Pro gobierna el lazo. |
| [THERMOFORGE T7, AC-SFT7](https://acinfinity.com/thermoforge-t7-plant-heater-1000w-with-ai-powered-vpd-temp-controller/) | 1.000 W, 120 V CA, 10 A de ficha, 30–65 % HR incluido el aire entrante | Sonda y control autónomo de temperatura/VPD. Ducto de 4 pulgadas, manguera por separado. Evaluar cuando haga falta control autónomo explícito. |
| [THERMOFORGE T3, AC-SFT3](https://acinfinity.com/thermoforge-t3-plant-heater-530w-vpd-temp-controls-with-extendable-tubing/) | 530 W, 100–120 V CA, 60 Hz, 5 A de ficha, 30–85 % HR de operación | Sonda, control autónomo y extensión de salida incluida. Candidato de menor potencia. Confirmar por escrito si la revisión vendida admite la HR medida en la toma. |

**Fuentes Tier 2.** Las fichas de S7/T7 excluyen alta humedad y recirculación cerrada con humidificador. La [guía rápida serie 7, SFH2602X1](https://acinfinity.com/content/SFH2602X1_THERMOFORGE%207%20Quick%20Start%20Guide.pdf) también excluye tomar aire de recintos con humidificador. En el T7, la sonda autónoma y el cable UIS ocupan el mismo puerto; se elige un modo de control. La [guía de programación](https://acinfinity.com/pages/thermoforge-programming-guide.html) distingue los tres controles. El [manual SFT2511X1](https://acinfinity.com/content/SFT2511X1_251114_THERMOFORGE%20Manual.pdf), enlazado por la ficha del T3, documenta montaje exterior en p. 13 y prioridad de la programación y sonda UIS sobre los mandos del equipo en p. 18. El FAQ genérico de esa revisión (p. 36) indica 85 % HR para instalación interior, mientras el [manual anterior SFT2311X1](https://acinfinity.com/content/SFT2311X1_231120_THERMOFORGE%20Manual.pdf) indica 65 % en p. 35. Para S7/T7 gobierna el límite específico más restrictivo de la ficha actual. En Tenjo se propone montaje externo para los tres. Confianza alta en los valores publicados, pendiente la aptitud de cada SKU/revisión en campo.

1. **Medir antes de comprar.** Registrar T/HR en el punto real de admisión, en el ambiente exterior al equipo y a altura de bloques durante noches frías y húmedas, con la extracción, la niebla y la carga representativas. Guardar extremos de HR, duración de excursiones, incertidumbre del sensor, recuperación térmica, condensación y caudal/CO₂. Si se cumple la banda del lote, aplazar calefacción. Si hay déficit, evaluar sellado y aislamiento compatibles con FAE y limpieza, y estimar pérdidas con caudal real antes de dimensionar.
2. **Admisión y ambiente secos, 30–65 % HR con margen de medición.** Si se justifican 1.000 W, priorizar S7 con UIS. Elegir T7 solo si se requiere la sonda y el control autónomo y se prueba el modo seleccionado. T3 puede ser suficiente si la demanda admite 530 W y cumple la revisión eléctrica.
3. **Admisión o ambiente por encima de 65 % y hasta 85 % HR.** Excluir S7/T7 con esa toma. Considerar T3 solo con aire sin condensación ni niebla, confirmación del fabricante para esa admisión y revisión, margen respecto al límite y capacidad térmica demostrada. Si falta una condición, buscar una toma seca o acondicionar la habitación de servicio con equipo adecuado.
4. **Por encima de 85 %, por debajo de 30 %, con condensación o con valores que no permiten demostrar margen.** Mantener los tres fuera de servicio en ese punto. Reubicar la admisión a un recinto interior seco o evaluar calefacción fija de la habitación diseñada para el ambiente y las protecciones locales. Mantener FAE y vigilar CO₂ con cualquier alternativa.

### Montaje y seguridad eléctrica

- Colocar el calefactor estable y seco fuera de la tienda, en un recinto interior de servicio. Impulsar por un pasamuros bajo con ducto térmico del modelo y entrada desde aire seco; usar circuito abierto, sin retorno de la carpa humidificada. Mantener toma/salida libres y dirigir el chorro lejos de bolsas, sondas y tela. Respetar las holguras de la revisión instalada (el manual SFT2511X1 pide 0,9 m frente a combustibles). Revisar goteos, contraflujo, sellos y condensación con extractor y humidificador en sus estados normales.
- Usar el tomacorriente fijo de pared, sin extensiones, regletas, adaptadores de enchufe ni relés domésticos interpuestos. S7/T7 exigen toma aterrizada con protección contra sobretensión y sin carga compartida en esa toma. El manual anterior SFT2311X1, advertencia 12, prohíbe unidades con protección contra sobretensión y tomas GFCI; el manual SFT2511X1, p. 7, exige conexión directa y omite esa prohibición. Confirmar por escrito el manual aplicable al SKU y la compatibilidad con la instalación prevista. Mantener las protecciones exigidas. Ante una incompatibilidad o duda sin resolver, descartar el montaje.
- Antes de energizar, un electricista competente debe verificar placa, tensión/frecuencia, capacidad con cargas simultáneas, puesta a tierra, sobrecorriente, protección diferencial GFCI/RCD y sobretensión según corresponda, e instalación en zona seca conforme al RETIE aplicable. Verificar corte físico térmico independiente, medio accesible de desconexión y estado seguro tras fallas conforme al [diseño ambiental](../05_equipment/environmental_control.md#interbloqueos-y-estado-seguro). La ficha S7/T7 menciona autorrearranque por sobretemperatura; ensayar retorno de red y pérdida de sonda por separado en banco supervisado. Si no se verifica calefacción desenergizada en el estado exigido, la operación remota queda bloqueada. [RETIE — Ministerio de Minas y Energía](https://minenergia.gov.co/es/misional/energia-electrica-2/reglamentos-tecnicos/reglamento-t%C3%A9cnico-de-instalaciones-el%C3%A9ctricas-retie/)

## Iluminación — propuesta para un ensayo de estantería

LED blanco día **5.000–6.500 K, 24 V CC regulable**, por nivel, con temporizador independiente y **12 h luz / 12 h oscuridad** como programa inicial de ensayo. Cornell documenta el uso de luminarias blancas corrientes y tiras LED en fructificación (Tier 1, extensión). La temperatura de color, la tensión y el horario son decisiones de diseño para evaluar en Tenjo. [Cornell Small Farms, etapa de fructificación](https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/2-seven-stages-of-cultivation/)

| Especie | Objetivo inicial en el plano de fructificación | Base y límites |
|---|---|---|
| Melena de león, *Hericium erinaceus* | 150–200 lux | Tier 1 indirecto. Un estudio reportó cuerpos blancos con ≤200 lux/12 h tras observar color rosado alrededor de 500 lux/24 h. Cambiaron intensidad y duración y el resultado varió por cepa. La [ficha del proyecto](../01_species/hericium_erinaceus.md) cita 1.000 lux/8 h como otra condición. [Estudio](https://www.mdpi.com/2077-0472/15/5/460) |
| Shiitake, *Lentinula edodes* | 300 lux de partida; 300–500 lux como ventana exploratoria | Tier 1 para el punto de 300 lux, usado a altura del cultivo en un estudio de morfología con varios espectros y una cepa. El extremo superior es hipótesis de diseño. Esta prueba de fructificación es distinta de la pregunta SH16 sobre pardeamiento. [Estudio](https://www.mdpi.com/2076-3417/11/15/6997) |
| Orellana blanca, si se confirma *P. ostreatus* | 500–1.000 lux; comenzar por 750 lux si se sigue la referencia interna | Hipótesis de mapeo; solapa con 750–1.500 lux/8–12 h de la [ficha](../01_species/pleurotus_ostreatus.md). También se ha estudiado fructificación con 10–200 lux/8 h en otra cepa y con objetivos distintos (Tier 1). Identificar la especie del proveedor antes de aplicar el rango. [Estudio](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0262279) |
| Orellana rosada, *P. djamor* | 600–800 lux de partida; capacidad de ajuste 500–1.000 lux | Hipótesis de mapeo, confianza baja. La [ficha](../01_species/pleurotus_djamor.md) cita 600–800 lux. La tabla 3 de la [compilación OCDE](https://one.oecd.org/document/ENV/JM/MONO%282005%2917/en/pdf) recoge 750–1.500 lux de fuentes secundarias. Pendiente prueba por cepa. |

Son objetivos exploratorios pendientes de inicio. Registrar fecha de inicio tras aprobación, revisar dentro de 90 días y conservar un ajuste solo con evidencia de cobertura repetible y respuesta de la cepa frente al comparador. Registrar fecha, cepa y etapa, aparición de primordios, color/morfología, rendimiento y ambiente. Cambiar un factor a la vez y retirar el ensayo ante un problema de seguridad, condensación en componentes o desecación atribuible a la instalación.

**Mapa por estante.** El [inventario de hardware](../05_equipment/hardware_inventory_august_2026.md) registra un estante Tujurich de cinco niveles y 92,5 cm de ancho previsto para CLOUDLAB. Confirmar instalación, niveles ocupados y espacio útil. Usar una línea de luz por nivel, bajo el estante superior o en el bastidor, regulable por nivel o zona. Montar por encima de la cara productiva, sin cruzar la descarga de niebla y con acceso para higiene. Con luxómetro, cerrar la carpa y medir fondo con luz apagada; encender, estabilizar y medir a altura y con orientación representativa del frente productivo. Anotar al menos izquierda/centro/derecha en filas anterior y posterior por nivel, primero vacío y luego con carga representativa y sombras reales. Registrar nivel, posición, lux, ajuste del dimmer, mínimo, mediana y máximo. Ajustar posición o intensidad hasta cubrir las posiciones de la cepa; repetir tras mover luminarias, estantes o carga. Confirmar horario y recuperación tras corte. Los lux sirven para comparar posiciones bajo la misma fuente; evitar equiparar espectros distintos mediante lux.

**Límites de humedad.** Para toda parte que entre en la carpa, exigir ficha para la HR real y exposición prevista, incluidos terminales, empalmes y extremos sellados tras corte. Buscar IP65 como mínimo frente a salpicaduras y preferir IP67 si existe un montaje completo compatible. El código IP y la aptitud para condensación sostenida se comprueban por separado. Mantener fuente aislada, dimmer, temporizador, conexiones de red y tomas fuera de la zona húmeda; prever pasamuros, alivio de tensión y lazos antigoteo. Verificar la protección del montaje y que 24 V CC sea admisible bajo la clasificación eléctrica del sitio. El RETIE prevé un límite de 12 V para ciertas instalaciones húmedas. Si aplica a la carpa, seleccionar un montaje conforme antes de comprar. [RETIE compilado, Resolución 40284 de 2026, Libro 3 art. 3.27.2](https://minenergia.gov.co/documents/16522/Resolucion-40284-23062026-compilada.pdf) El IONBEAM S11 ofrece UIS y barras IP65, pero la ficha declara 35–85 % HR para el producto. El manual (p. 6, advertencia 5) prohíbe usarlo en atmósferas mojadas. Para el montaje interior propuesto, excluirlo por exposición a niebla o condensación. [Ficha IONBEAM S11](https://acinfinity.com/ionbeam-s11-supplemental-grow-light-bars-11-full-spectrum-led/) · [Manual IONBEAM](https://acinfinity.com/content/NE2501X1_250123_IONBEAM%20Manual.pdf)

## Actualización de diseño lumínico — 2026-11-27

Propuesta aportada por el propietario y adoptada como base documental del proto-piloto, no como consigna biológica aprobada ni autorización de compra/energización. Para la CLOUDLAB 844 de la caseta de Bogotá se prioriza LED blanco de baja intensidad, 5.000–6.500 K, regulable por PWM y distribuido verticalmente. Programa inicial de ensayo: 08:00–20:00 (hora local), 12 h luz/12 h oscuridad.

| Especie | Ventana experimental propuesta |
|---|---|
| Hericium erinaceus (melena de león) | 150–250 lux; empezar por 150–200 lux, extender a 250 solo como hipótesis experimental |
| Lentinula edodes (shiitake) | 300–500 lux |
| Pleurotus ostreatus (orellana blanca, confirmar identidad) | 500–1.000 lux |
| Pleurotus djamor (orellana rosada) | 500–1.000 lux |

Las referencias científicas y límites de inferencia de la sección previa se mantienen. Comparar por cepa, con carga representativa; no publicar estos rangos como setpoints de producción.

### BOM candidata por carpa (no adquirida)

| Componente | Cantidad / especificación | Referencia de compra | USD orientativos |
|---|---|---|---:|
| BTF-LIGHTING FCOB blanco 6000 K | 1 rollo 5 m, 24 V CC, IP67, regulable; ASIN aportado por propietario sin verificar | [Amazon B0CNRBNQB1](https://www.amazon.com/dp/B0CNRBNQB1) | 27 |
| Mean Well GST60A24-P1J | 1 fuente candidata 24 V/60 W | [Amazon](https://www.amazon.com/s?k=Mean+Well+GST60A24-P1J) | 30 |
| BTF-LIGHTING C01W | 1 dimmer PWM monocromático, si no se usa ESPHome | [Amazon](https://www.amazon.com/s?k=BTF+LIGHTING+C01W) | 19 |
| UNI-T UT383BT | 1 luxómetro compartido entre cámaras | [Amazon](https://www.amazon.com/s?k=UNI-T+UT383BT) | 36 |
| Perfiles de aluminio, conectores, sellado | 3 m de perfil inicial, 4 conectores estancos de 2 pines, sellado de extremos con sistema compatible y RTV neutra apta para electrónica cuando proceda | Cotizar | 15 |
| AC Infinity UIS Control Plug | 1 opcional para horario ON/OFF, no PWM | [Amazon](https://www.amazon.com/s?k=AC+Infinity+UIS+Control+Plug) | 30 |

Presupuesto orientativo de referencia: USD 127 para sistema básico incluyendo luxómetro, USD 157 con UIS opcional; sin flete, impuestos ni verificación de precios. No duplicar luxómetro por cámara. Confirmar ASIN, variante, dimensiones, potencia W/m, corriente, compatibilidad del conector de fuente, protección y disponibilidad. La fuente de 60 W es candidata: seleccionar capacidad nominal ≥1,25 × potencia total instalada (para 60 W, carga objetivo ≤48 W), verificando derating y corriente del dimmer. No confundir esta fuente de iluminación con la calefacción de incubadora a 120 V.

### Montaje y control propuestos

- Dos tramos verticales de 1,5 m en lados opuestos del bastidor, fuera del chorro de niebla. Comparar contra distribución por estante si el mapa con bloques revela sombras; no presuponer uniformidad.
- Preferir protección IP67/IP68 del conjunto instalado; IP por sí solo no acredita condensación sostenida. Confirmar aptitud explícita del fabricante, extremos cortados, empalmes, conectores, perfiles, sellos, disipación, pasamuros y limpieza. Fuente, dimmer y conexiones de red fuera de la carpa; revisión eléctrica competente, incluyendo si aplica el límite de 12 V del RETIE ya citado. Si aplica, rediseñar en 12 V con componentes compatibles antes de comprar.
- Alternativa preferente para integración local: ESP32/ESPHome con etapa MOSFET PWM DC dimensionada para la tira, entrada compatible con 3,3 V, protección de circuito y comportamiento seguro al reinicio. Evitar dependencia de Tuya si se valida esta alternativa. C01W es opción independiente; UIS Control Plug es opcional y solo programa encendido/apagado. Probar recuperación de intensidad y horario tras corte, sin red, y evitar doble programación contradictoria.
- Medir lux a la altura y orientación del frente productivo por nivel, vacío y cargado, con registro de intensidad, posiciones, mínimo/mediana/máximo, sombras y repetibilidad; ajustar y registrar el fotoperiodo antes de liberar el ensayo. Mantener el luxómetro seco.
- No seleccionar IONBEAM S11/S16 para el interior húmedo en esta fase; límite de HR publicado de 85% para la familia según propuesta, verificar por SKU si se reconsideran. Mantener luz azul 450–470 nm como futura variable independiente para investigación en maduración/fructificación de shiitake, con blanco como referencia; para comparar espectros usar medición radiométrica apropiada y no equiparar lux.

Sin cambios en firmware, inventario adquirido, DEC-025, CANON ni especificaciones de lote. Pendientes: confirmar fichas y precios de los candidatos, clasificación eléctrica, condensación, potencia, montaje y validación por cepa. Esta actualización no modifica la estrategia de calefacción nocturna independiente de la caseta ni autoriza traslado de equipos.

## Abastecimiento — referencias para cotizar

| Elemento | Enlace | Verificación y condición |
|---|---|---|
| Calefactor + ducto | Fichas oficiales de la tabla de calefacción · [Manguera de salida AC-DTH4-8 para S7/T7](https://acinfinity.com/thermal-resistant-hose-8-for-thermoforge-s7-and-t7/) | Cotizar después de medir admisión/carga y revisar la instalación. Verificar revisión, tensión, cable UIS, ducto térmico compatible y accesorios incluidos. La AC-DTH4-8 corresponde a la salida caliente, y la admisión usa ducto compatible de 4 pulgadas por separado. |
| Tira LED 24 V blanca regulable | [BTF-LIGHTING, familia FCOB IP67](https://www.btf-lighting.com/en-intl/collections/fcob-led-strip/products/fcob-480leds-ip67-waterproof-dimmable-24v) · [Amazon EE. UU., B0FNMHYPJB](https://www.amazon.com/dp/B0FNMHYPJB) | El fabricante lista variante 24 V / 6.000 K y vende la fuente aparte. El ASIN discutido para 5.000 K queda sin verificar; cotejar variante y certificados por SKU. |
| Variante BTF de 12 V mencionada | [Amazon EE. UU., B0CNRFD8MM](https://www.amazon.com/dp/B0CNRFD8MM) | ASIN sin verificar. Si la etiqueta confirma 12 V, requiere fuente propia de 12 V y queda fuera del diseño de 24 V. |
| Active Grow Blue Sun 4 ft | [Fabricante](https://activegrowled.com/collections/integrated-led-grow-lights/products/active-grow-integrated-strip-t5-4ft-led-mushroom-grow-light-blue-sun-spectrum) · [Amazon EE. UU., B09C6R7Q4G](https://www.amazon.com/dp/B09C6R7Q4G) | Alternativa de investigación espectral. El fabricante anuncia conexiones IP65; confirmar dimensiones, potencia, regulación, HR del conjunto y coincidencia con el ASIN. Con una barra nominal de 4 ft, medir el espacio útil antes de cotizar. |
| Control de luz y medición | [AC Infinity UIS Control Plug, documentación](https://acinfinity.com/pages/ac-infinity-ecosystem/controlling-outlet-devices.html) · cotización local de fuente 24 V, dimmer, temporizador y luxómetro | El Control Plug solo conmuta ON/OFF y exige que la fuente reanude al recibir energía. Probar también la recuperación del nivel del dimmer. Dimensionar fuente y dimmer por W/m de la variante y longitud total; incluir soportes, sellos, conectores y cableado compatibles. |

Amazon bloqueó la verificación directa de las fichas enlazadas. Quedan pendientes precio, stock, vendedor, variante, certificaciones, garantía, envío a Colombia, impuestos y costo entregado. Comparar primero cotizaciones locales y completar la identificación física del equipo existente. Seguimiento en [I08–I10](unresolved_questions.md#infraestructura-y-control-del-piloto-actual).
