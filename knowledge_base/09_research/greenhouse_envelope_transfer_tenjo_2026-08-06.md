---
title: Transferencia de evidencia de invernaderos a la envolvente de la marranera — Tenjo
document_id: DOC-0054
category: research
load_priority: on_request
status: active
confidence: medium
last_reviewed: 2026-08-06
primary_sources:
  - source_manifest_greenhouse_envelope_2026-08-06.yaml
  - ../references/greenhouse_envelope_transfer_bibliography_2026-08-06.md
related_documents:
  - facility_adaptation_literature_2026-08-03.md
  - high_altitude_microclimate_shiitake_hericium_2026-08-05.md
  - unresolved_questions.md
  - ../04_facility/marranera_medium_scale_design_basis.md
  - ../04_facility/master_blueprint.md
---

# Propósito

Auditar la síntesis externa titulada “Diseño de Envolvente Térmica y Optimización Microclimática para Cultivos Protegidos en Tenjo, Cundinamarca” y determinar qué evidencia puede enriquecer el diseño de la marranera de Setas de la Peña.

El texto recibido mezcla datos municipales de Tenjo, resultados de invernaderos florícolas de la Sabana, dimensiones de un caso específico en El Rosal, propiedades comerciales de películas agrícolas y recomendaciones horarias presentadas como si fueran normas regionales. Este documento conserva los principios útiles, corrige atribuciones y evita transferir parámetros de producción vegetal a recintos de incubación y fructificación de hongos.

No autoriza construcción, compra de materiales, apertura de ventilaciones, instalación de pantallas ni cambio de setpoints. Su función es definir hipótesis y pruebas para la envolvente exterior y las celdas interiores.

# Conclusiones principales

- La Alcaldía de Tenjo respalda una altitud aproximada de 2.592 m, temperatura media de 13,7 °C, precipitación anual de 805 mm y clasificación climática semihúmeda fría seca. No respalda por sí sola perfiles horarios, extremos de helada, HR, radiación o viento para la finca.
- El estudio de inventario de invernaderos en Tenjo documenta aproximadamente 60 sistemas productivos, 361,62 ha bajo cubierta y un solo predio clasificado como fungicultor. Es evidencia territorial y de uso de recursos, no una caracterización microclimática de la marranera.
- Los rangos de 7–19 °C, viento de 4,2–6,7 km/h, invernadero de 5.610 m², 15 naves de 6,9 m, aperturas cenitales de 0,53 m, laterales de 2 m y orientación este–oeste corresponden al caso de El Rosal modelado por Duarte-Gualdrón et al. (2022). No son recomendaciones para Tenjo.
- El coeficiente global usado en ese modelo fue 4,7 W·m⁻²·K⁻¹, no 7 W·m⁻²·K⁻¹. La radiación de 380,9 W·m⁻², el viento de 1,22 m·s⁻¹ y la evapotranspiración de 3,7 mm·día⁻¹ fueron condiciones de frontera del caso de rosas, no promedios regionales.
- La literatura de invernaderos sí respalda que la geometría, las entradas, los retornos, la permeabilidad de pantallas, las fuentes de humedad y la carga biológica alteran el campo térmico. La transferencia válida es metodológica: medir y modelar el sistema real.
- Las pantallas térmicas pueden reducir intercambio radiativo y pérdidas en algunos invernaderos, pero su desempeño depende de emisividad, transmisividad infrarroja, permeabilidad al aire, humedad, control y calefacción. Los porcentajes de ahorro de otros estudios no se transfieren a la marranera.
- Para Setas de la Peña, una pantalla reflectiva o segunda piel bajo la cubierta metálica puede estudiarse como barrera radiativa del cascarón exterior. No reemplaza la celda interior aislada, sellada, lavable y controlada.
- Las películas transparentes de 200 µm, difusión de luz, anti-goteo y bloqueo UV responden a cultivos fotosintéticos. No son la envolvente sanitaria preferida para incubación o fructificación de hongos.
- Las purgas a las 17:30, el cierre a las 18:00 y objetivos de 40–50 ACH no se adoptan. El control debe usar temperatura, HR, punto de rocío, CO₂, presión, calidad del aire exterior y respuesta de la celda.

# 1. Auditoría de atribuciones

| Afirmación recibida | Fuente real o problema | Dictamen para el repositorio |
|---|---|---|
| Tenjo está a 2.592 m y tiene temperatura media de 13,7 °C | Alcaldía de Tenjo | Conservar como contexto municipal; medir la finca |
| Tenjo tiene 7–19 °C y viento de 4,2–6,7 km/h | El artículo de 2022 atribuye esos valores a El Rosal y usa fuentes meteorológicas secundarias | No atribuir a Tenjo ni usar para diseño |
| HR nocturna 95–100 %, ráfagas >35 km/h e índice UV 11,74 | No se cerró estación, periodo ni localizador primario | Convertir en variables de campaña; no conservar como hechos locales |
| Heladas por debajo de 3 °C | IDEAM define helada meteorológica como ≤0 °C a 1,5–2 m; daño agrícola puede comenzar a otras temperaturas según tejido | Usar riesgo de enfriamiento/helada, sin umbral inventado |
| U de plástico monocapa ≈7 W·m⁻²·K⁻¹ | El caso de Duarte-Gualdrón usa 4,7 W·m⁻²·K⁻¹ | Retirar 7; calcular la envolvente real |
| Evapotranspiración de 3,7 mm·día⁻¹ | Valor de rosas usado en la simulación | No transferir a hongos; medir humedad y calor biológicos por carga |
| Alturas de 3–4 m y 8,2–10 m, 15 naves y 30–50 m de ancho son diseño recomendado | Son geometría y escala de casos de invernadero; no una norma para Tenjo | No usar para la marranera ni proponer un nuevo multitúnel |
| Orientación E–O es ideal | El artículo describe la orientación del caso; no prueba optimalidad universal | Mantener orientación existente y evaluar asoleación/viento real |
| Ventana cenital mínima de 0,53 m y laterales de 2 m | Dimensiones del invernadero modelado | No convertir en criterio de la marranera |
| Pendiente >6 % optimiza captación matutina | Mezcla drenaje con captación solar sin demostración aplicable | Verificar pendiente por estructura y drenaje; no por una regla solar |
| Plástico térmico 200 µm con 50–60 % de difusión | Especificación comercial/agronómica para plantas | Solo aplicable a anexos transparentes; no a celdas húmedas sanitarias |
| Pantalla aluminizada reduce 20 % las pérdidas y aumenta 30 % el rendimiento | Resultados de cultivos, estructuras y protocolos específicos; la fuente colombiana suministrada no fue cotejada completamente | Conservar como señal experimental, no expectativa de desempeño |
| Desplegar siempre a las 18:00 y purgar a las 17:30 | Horarios de ensayos o recomendaciones de manejo vegetal | Sustituir por control basado en sensores y condición exterior |
| Malla debe permitir 40–50 ACH | Tasa de ventilación vegetal no demostrada para salas de hongos | Dimensionar por CO₂, humedad, calor, bioseguridad y caudal medido |

# 2. Qué aporta la literatura vegetal al proyecto

## 2.1 Campo espacial y carga biológica

Los modelos CFD de invernaderos demuestran que una fuente biológica de vapor modifica la temperatura y la HR espacial. En el caso de rosas, incorporar evapotranspiración cambió el campo simulado y reveló zonas de saturación. Para hongos, la variable equivalente no es la evapotranspiración vegetal: es la generación conjunta de calor, CO₂ y humedad por bloques, humidificadores, superficies mojadas, personas y aperturas.

**Transferencia:** la celda piloto debe mapearse vacía, con carga simulada y con lote real. No se debe derivar uniformidad desde una sonda central.

## 2.2 Reducción de intercambio radiativo

Las pantallas nocturnas y superficies de baja emisividad pueden reducir intercambio de radiación infrarroja en invernaderos. El desempeño depende de:

- emisividad de ambas caras;
- transmisividad infrarroja;
- permeabilidad al aire;
- sellado perimetral;
- temperatura de cubierta y pantalla;
- humedad transportada a través de la pantalla;
- régimen de calefacción y ventilación;
- puentes térmicos y área real.

**Transferencia:** ensayar una segunda piel reflectiva o pantalla técnica en el espacio bajo la cubierta metálica de la marranera, separada de las celdas y accesible para inspección. El objetivo es reducir ganancia solar diurna y/o pérdida radiativa nocturna del cascarón; no crear un recinto de cultivo textil.

## 2.3 Cámara de aire y doble piel

Una separación ventilada entre cubierta metálica y barrera secundaria puede desacoplar parte de la carga solar y permitir evacuar calor acumulado. En tiempo frío, la misma cámara puede convertirse en una zona de pérdida si queda excesivamente ventilada o si la barrera no controla radiación e infiltración.

**Transferencia:** la estrategia debe admitir modos estacionales o diarios: cámara ventilada cuando domina ganancia solar y cámara controlada cuando conviene conservar calor. El cambio de modo se valida con temperaturas de superficies, exterior y espacio intermedio.

## 2.4 Masa térmica

El agua puede amortiguar variación térmica por su capacidad calorífica, pero mangas flexibles o recipientes abiertos generan riesgos de fuga, limpieza, carga estructural, plagas y pérdida de espacio.

**Transferencia:** mantener como experimento de baja prioridad mediante depósitos rígidos, cerrados, limpiables y ubicados en un área seca o técnica. Calcular masa necesaria, carga sobre placa, energía realmente almacenada y capacidad de intercambio. No colocar bolsas o mangas de agua entre racks de producción.

## 2.5 Condensación

La literatura vegetal enfatiza condensación sobre película y follaje. En la marranera, la preocupación equivalente es:

- condensación bajo cubierta metálica;
- goteo sobre celdas, instalaciones o rutas limpias;
- condensación dentro de paneles y juntas;
- superficie del bloque o carpóforo por debajo del punto de rocío;
- retención de humedad detrás de barreras reflectivas.

**Transferencia:** medir temperatura superficial del techo, barrera secundaria, caras de panel, puertas y puentes térmicos. La aprobación depende de ausencia de condensación no controlada y capacidad de drenaje/inspección.

# 3. Arquitectura resultante para la marranera

La evidencia no cambia el principio ya adoptado:

`cubierta existente de marranera → espacio técnico/aire inspeccionable → celdas interiores opacas, aisladas, lavables y sellables`

## Cascarón exterior

Puede proporcionar:

- sombra y protección de lluvia;
- reducción de carga solar directa sobre celdas;
- soporte para una segunda piel o pantalla técnica;
- corredor de aire exterior amortiguado;
- infraestructura para canalizar goteo de cubierta sin ingresar a las celdas.

No debe asumirse hermético, sanitario ni térmicamente suficiente.

## Celda interior

Debe resolver por sí misma:

- barrera de aire continua;
- aislamiento protegido;
- superficie lavable;
- control de infiltración;
- drenaje y condensado;
- impulsión, retorno y extracción medidos;
- seguridad eléctrica y de incendio;
- limpieza y acceso.

Una película agrícola transparente no cumple automáticamente estas funciones.

# 4. Ensayo propuesto para barrera radiativa bajo cubierta

## Hipótesis

Una barrera de baja emisividad instalada bajo una sección de cubierta metálica, con cámara de aire controlada, puede reducir la temperatura máxima de la cara superior de una celda durante radiación alta y disminuir el enfriamiento radiativo nocturno, sin generar condensación oculta ni impedir inspección.

## Diseño A/B

- **A — referencia:** cubierta existente sin barrera añadida.
- **B — ensayo:** misma orientación y geometría con barrera reflectiva técnica, separación definida y bordes configurados según el modo de ventilación.

## Medición

- temperatura exterior sombreada;
- temperatura de cara superior e inferior de cubierta;
- temperatura sobre y bajo la barrera;
- temperatura de cara superior de la celda;
- HR en cámara de aire;
- punto de rocío;
- radiación o proxy de irradiancia;
- presencia de condensado;
- velocidad de aire en la cámara;
- temperatura y HR dentro de la celda simulada.

## Periodos mínimos

- día despejado de radiación alta;
- noche despejada y fría;
- evento de lluvia;
- mañana con condensación;
- prueba con cámara de aire abierta y controlada.

## Criterios de continuidad

La alternativa solo avanza si:

- reduce carga térmica o amplitud de forma medible y repetible;
- no crea condensación inaccesible;
- conserva acceso para limpieza e inspección;
- no compromete ventilación de cubierta ni drenaje;
- el material cuenta con comportamiento al fuego y durabilidad adecuados;
- el ahorro esperado justifica estructura, actuadores y mantenimiento.

# 5. Datos de campo requeridos

Antes de especificar películas, pantallas, aislamiento o masa térmica:

1. registrar T/HR exterior, bajo cubierta y dentro de la marranera durante al menos dos semanas representativas;
2. medir temperatura superficial de cubierta al mediodía, atardecer, madrugada y amanecer;
3. registrar lluvia, condensación y rutas de goteo;
4. medir orientación, pendiente, material, corrosión, uniones y ventilación existente de la cubierta;
5. levantar sombras de árboles, edificaciones y aleros;
6. medir viento local o instalar un anemómetro temporal;
7. medir la respuesta de una celda de prueba con masa simulada;
8. comparar costo y riesgo de pantalla, cielo raso técnico, panel rígido y aislamiento continuo.

# 6. Elementos que no se incorporan al diseño

- nuevo invernadero multitúnel de 30–50 m;
- altura de cumbrera de 8,2–10 m;
- orientación E–O como mandato;
- aperturas cenitales de 0,53 m por nave;
- películas transparentes como pared sanitaria de fructificación;
- horarios fijos de purga y cierre;
- 40–50 ACH por analogía con rosas;
- rendimientos agrícolas atribuidos a una pantalla;
- mangas flexibles de agua dentro de producción;
- cifras climáticas de El Rosal atribuidas a Tenjo.

# 7. Preguntas abiertas

- ¿Cuál es la temperatura superficial mínima y máxima de la cubierta metálica de la marranera?
- ¿La cubierta produce goteo sobre las futuras celdas y en qué rutas?
- ¿Una barrera radiativa bajo techo reduce carga sin acumular humedad?
- ¿Conviene una cámara de aire ventilada, controlada o estacional?
- ¿Qué material ofrece baja emisividad, resistencia al fuego, lavabilidad y durabilidad en ambiente agrícola?
- ¿La placa soporta una estrategia de masa térmica y existe una ubicación seca compatible?
- ¿Qué parte del ahorro potencial proviene de sombrear la celda y qué parte de reducir radiación nocturna?
- ¿Qué diferencias aparecen entre el costado oriental, occidental y el centro de la marranera?

# Referencias

Ver `source_manifest_greenhouse_envelope_2026-08-06.yaml` para procedencia, clasificación y límites; y `../references/greenhouse_envelope_transfer_bibliography_2026-08-06.md` para referencias formales.