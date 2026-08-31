---
title: Registro de Abastecimiento y Costos — Insumos y Consumibles
document_id: DOC-PRC-001
category: business
load_priority: on_request
last_reviewed: 2026-08-19
confidence: medium
primary_sources:
  - Internal procurement research, August 2026
  - Public Colombian supplier and marketplace observations, 2026-08-19
related_documents:
  - suppliers.md
  - economics.md
  - ../05_equipment/
  - ../06_operations/operational_commissioning.md
---

# Alcance

Este documento centraliza investigación de abastecimiento y costos para insumos, consumibles y materiales de Setas de la Peña. Su función es registrar referencias de mercado sin confundirlas con precios transaccionales verificados.

Los equipos permanentes y su estado operativo continúan registrándose en `../05_equipment/` y en los registros estructurados correspondientes. Las relaciones con proveedores se resumen en `suppliers.md`.

# Estado de la investigación — 2026-08-19

Se consolidó una primera ronda de investigación para **87 insumos**, priorizando Bogotá, Cundinamarca y Sabana de Bogotá, y usando mercado colombiano nacional cuando no apareció una referencia local.

Cobertura actual:

- **23/87** con confianza alta: oferta comercial identificable y normalizable a COP/kg.
- **18/87** con confianza media: existe referencia cercana, pero falta equivalencia exacta de especie, proceso, grado o presentación.
- **46/87** con confianza baja: no existe todavía un precio público defendible; requieren RFQ, cotización directa o prueba logística medida.

Hasta que una cotización o compra sea confirmada directamente, cualquier precio debe tratarse como referencia de mercado y no como costo operativo aprobado.

# Clasificación de evidencia de precio

| Estado | Definición | Uso permitido |
|---|---|---|
| `observed_market` | Precio visible en una fuente comercial identificable, con fecha y presentación | Comparación preliminar y shortlist |
| `quoted` | Cotización directa vigente emitida por proveedor | Planeación de compra dentro de vigencia |
| `purchased` | Precio efectivamente pagado en una transacción | Costo histórico y referencia de reposición |
| `estimated` | Estimación derivada de mercado, equivalencia o rango | Solo modelación; nunca tratar como precio confirmado |
| `unverified` | Precio sin fuente o sin condiciones suficientes | No usar para decisión de compra |

# Modelo de costo para residuos y subproductos

El campo `precio_material` no debe confundirse con el costo efectivo del material listo para entrar a producción. Para residuos recuperables o subproductos se deben separar, cuando aplique:

- `source_gate_price`
- `collection_cost`
- `transport_cost`
- `drying_cost`
- `size_reduction_cost`
- `storage_loss`
- `reconditioning_cost`
- `landed_usable_cost_per_kg`

Para materiales húmedos, el indicador económico preferido para comparación técnica es **COP/kg seco utilizable puesto en Tenjo**, siempre que exista medición confiable de humedad. Comparar directamente COP/kg húmedo de residuos con COP/kg seco de salvados o minerales puede inducir decisiones erróneas.

`Gratis` no significa `COP 0/kg puesto en finca`. Los 10 ítems marcados como `Gratis` en el catálogo requieren algún costo económico de recuperación, clasificación, transporte, secado, trituración, almacenamiento o acondicionamiento.

# Tabla maestra — investigación 2026-08-19

| item_id | nombre | catálogo COP/kg | investigado COP/kg | confianza | estado | fuente / referencia | notas |
|---|---|---:|---:|---|---|---|---|
| algas_marinas | Algas marinas molidas | 18.000 | 16.550 | Media | observed_market | Mercado Libre Colombia, Alga 600 1 kg | Bioestimulante a base de algas; no equivalencia química perfecta con kelp meal. |
| carbonato_calcio | Carbonato de calcio | 3.000 | 2.000 | Alta | observed_market | https://tienda.bioespacio.co/ | Referencia retail local. |
| cascarilla_huevo_molida | Cascarilla de huevo molida | 1.200 | 42.000 | Alta | observed_market | Mercado Libre Colombia, abono de cáscara de huevo 1 kg | Precio de producto limpio, seco, molido y empacado; no residuo a granel. |
| ceniza_vegetal | Ceniza vegetal | 3.000 | 0 en origen propio; ~38.000 retail preparado | Alta | observed_market | Mercado Libre Colombia, ceniza de madera/hojas | `Gratis` solo para materia propia; tamizado y manejo tienen costo. |
| melaza | Melaza | 6.500 | 2.490 | Alta | observed_market | https://frescorganico.com/producto/melaza | 30 kg / $74.700; descuento mayorista puede reducir costo. |
| sulfato_magnesio | Sulfato de magnesio | 10.000 | 6.476–7.585 | Alta | observed_market | Mercado Libre Colombia, sacos 25 kg | Verificar grado agrícola y pureza. |
| tiamina | Tiamina (Vit. B1) | 120.000 | 598.840–634.900 | Alta | observed_market | Mercado Libre Colombia, tiamina HCl 1 kg | El catálogo subestima vitamina pura; especificar pureza y dosis. |
| yeso | Yeso agrícola | 2.200 | 2.500 | Alta | observed_market | https://tienda.bioespacio.co/ | Retail local; bulto agrícola puede ser menor. |
| zeolita | Zeolita natural | 8.500 | 9.000 | Alta | observed_market | https://tienda.bioespacio.co/ | Catálogo cercano al retail observado. |
| aserrin_alamo | Aserrín de álamo/sauce | 1.800 | 2.380–4.000 proxy local | Media | estimated | Casalimpia / BioEspacio Bogotá | No se verificó segregación específica de álamo/sauce. |
| aserrin_caucho | Aserrín de caucho (*Hevea brasiliensis*) | 9.000 | N/D | Baja | unverified | https://www.asoheca.org/secciones/empresa/quienessomos.php | No hay oferta pública colombiana 2026 por kg. Requiere RFQ y flete Caquetá/Meta→Tenjo. |
| aserrin_eucalipto | Aserrín de eucalipto | 2.000 | ~4.000 retail | Media | estimated | https://bioespacio.co/sustratos/aserrin-en-polvo-sustratos/ | Confirmar lote 100 % eucalipto, sin inmunizantes/MDF. |
| aserrin_pino | Aserrín de pino fresco | 1.500 | 2.380–4.000 | Media | estimated | Casalimpia / BioEspacio | Precio de categoría; pretratamiento se costea aparte. |
| aserrin_roble | Aserrín de roble | 2.500 | ~4.000 retail | Media | estimated | BioEspacio | No es cotización de lote puro de roble. |
| aserrin_pino_compostado | Aserrín de pino compostado | 2.200 | ≥2.380–4.000 antes de compostaje | Media | estimated | Casalimpia / BioEspacio | `Gratis` no representa compostaje, espacio, agua, volteos ni inventario. |
| bagazo_caña | Bagazo de caña fresco | 1.200 | N/D | Baja | unverified | — | Cotizar trapiche; alta humedad y baja densidad hacen dominante el flete. |
| carton_corrugado | Cartón corrugado troceado | 800 | N/D | Baja | unverified | https://asociacionrecicladoresasorelle.org/carton/ | Tiene valor de recuperación; retirar cintas, clasificar y triturar cuesta. |
| carton_huevo | Cartón de huevo | 1.200 | N/D | Baja | unverified | Mercado de papel/cartón recuperado Bogotá | `Gratis` debe reclasificarse como residuo recuperado. |
| cascarilla_arroz | Cascarilla de arroz | 4.000 | 1.667–4.000 | Alta | observed_market | Mercado Libre 45 kg/$75.000; BioEspacio 1 kg/$4.000 | Fuerte efecto volumen. |
| chips_poda_urbana | Chips de poda urbana | 300 | N/D | Baja | unverified | https://www.uaesp.gov.co/content/poda-arboles-y-corte-cesped | Flujo físico existe; no venta pública por kg. |
| corteza_molida | Corteza de árbol molida | 1.400 | ~8.000 retail | Media | estimated | BioEspacio / Mercado Libre corteza de pino | No confundir corteza industrial en bruto con producto hortícola acondicionado. |
| cascarilla_coco | Fibra de coco | 8.500 | 9.900 | Alta | observed_market | Homecenter Colombia, Sustracoco 1 kg | Para bloques comprimidos comparar kg seco, no litros. |
| fibra_palma | Fibra de palma de aceite | 1.800 | N/D | Baja | unverified | https://palmagro.com/fibra-de-mesocarpio-de-aceite-de-palma/ | Cotizar extractora; revisar aceite residual y flete. |
| fique_cabuya | Fique / cabuya | 4.500 | N/D | Baja | unverified | https://croper.com/products/6234-fibra-natural-de-fique-cabuya | Producto reconocido, sin precio público. |
| guadua | Guadua astillada | 2.500 | N/D | Baja | unverified | Mercado colombiano de guadua | Cotizar residuo de transformación, no culmo de construcción. |
| heno_pangola | Heno de pangola | 6.500 | ~13.000 retail exacto; 425 heno genérico mayorista | Alta | observed_market | Mercado Libre Pangola; https://frescorganico.com/producto/heno | El MOQ mayorista hace incomparable el precio bajo con piloto. |
| hojarasca | Hojarasca de bosque | 200 | 4.500 proxy mantillo | Media | estimated | https://tienda.bioespacio.co/organicos/1004-mantillo-tierra-de-hojas-1-kilo-2-litros.html | $200 puede quedar como costo interno provisional, no precio de mercado. Medir min/kg. |
| kikuyo | Kikuyo seco | 1.400 | ~425 proxy heno mayorista | Media | estimated | Frescorgánico / Croper | No es cotización específica de kikuyo. |
| paja_soya | Paja/rastrojo de soya | 500 | N/D | Baja | unverified | — | Estacional; flete puede superar valor de material. |
| paja_arroz | Paja de arroz | 1.800 | N/D | Baja | unverified | — | No confundir con cascarilla de molino. |
| paja_avena | Paja de avena | 2.200 | N/D | Baja | unverified | — | Cotizar por paca con peso real. |
| paja_cebada | Paja de cebada | 2.400 | N/D | Baja | unverified | — | No confundir con cebada grano ni afrecho cervecero. |
| paja_trigo | Paja de trigo | 2.500 | N/D | Baja | unverified | — | Depende de enfardado y distancia. |
| papel_periodico | Papel periódico / kraft | 1.500 | ~3.000 | Alta | observed_market | https://www.pinturastorcaza.com/product/papel-periodico/ | Recuperado directo puede costar menos pero requiere clasificación/trituración. |
| pulpa_papel | Pulpa de papel, residuo industrial | 1.800 | N/D | Baja | unverified | — | Requiere acuerdo B2B; medir humedad y químicos de proceso. |
| rastrojo_maiz | Rastrojo de maíz | 1.200 | N/D | Baja | unverified | — | Costo real incluye recolección, picado/enfardado y flete. |
| retamo_espinoso | Retamo espinoso | 400 | N/D | Baja | unverified | — | No existe mercado verificable; no asumir suministro estable. |
| tallo_girasol | Tallo de girasol triturado | 1.200 | N/D | Baja | unverified | — | Triturado ya incorpora procesamiento. |
| tamo_trigo | Tamo de trigo | 1.600 | N/D | Baja | unverified | — | Cotizar por paca/tonelada con peso comprobado. |
| turba_coco_buferizada | Turba de coco buferizada | 8.500 | 5.000 local; banda 5.000–8.000 | Alta | observed_market | https://tienda.bioespacio.co/702-organicos?p=2 ; https://sacredganjah.com.co/productos/sustrato-de-coco-buferizado-4l-1kg/ | Mejor referencia local observada: 1 kg/4 L por $5.000. |
| tusa_maiz | Tuza/zuro de maíz | 1.500 | N/D | Baja | unverified | — | Requiere acopio y trituración. |
| borra_cafe | Borra de café (SCG) | 1.200 | $0 posible en origen; puesto Tenjo N/D | Media | estimated | https://nosotros.tostao.com/eco/ | Húmeda/perecedera; costear ruta, canecas, secado y almacenamiento. |
| cascara_cafe | Cáscara de café | 3.000 | 4.000–8.800 | Alta | observed_market | Mercado Libre Colombia | Beneficio cafetero directo puede ser más barato. |
| pulpa_cafe | Pulpa de café | 2.500 | N/D | Baja | unverified | Literatura colombiana de beneficio de café | Muy húmeda y estacional; estabilización y transporte dominan. |
| compost_maduro | Compost maduro | 2.500 | 798–3.500 | Alta | observed_market | https://tumatera.co/products/bulto-compost-x-50-kg ; BioEspacio | Precio de 50 kg competitivo pero stock debe verificarse. |
| lombricompost | Lombricompost | 5.000 | 1.700–2.123 | Alta | observed_market | Homecenter / Confiabonos | Verificar composición y humedad. |
| raices_hidroponicas | Raíces hidropónicas + SMS | 1.800 | N/D | Baja | unverified | — | Formulación propia, no commodity. Costear componentes y mezcla. |
| sms | Sustrato agotado propio | 0 | 0 material; manejo N/D | Media | estimated | Literatura colombiana de SMS | Mantener $0 solo en `material_cost`; medir debagging, movimiento, trituración y re-tratamiento. |
| vermicompost | Vermicompost | 6.000 | 1.700–2.123 | Alta | observed_market | Homecenter / Confiabonos | Se solapa comercialmente con humus/lombricompost. |
| estierc_gallina_deshid | Estiércol de gallina deshidratado | 2.200 | 1.700–4.000 proxy | Media | estimated | Viveros de Colombia / BioEspacio | Falta equivalencia exacta de humedad/proceso. |
| estiercol_equino | Estiércol equino | 1.800 | ~1.250 proxy retail procesado | Media | estimated | https://frescorganico.com/producto/abono-de-caballo-boniga | Confirmar asociación precio/presentación. |
| gallinaza | Gallinaza compostada | 2.500 | 1.700 | Alta | observed_market | Viveros de Colombia, bulto 40 kg/$68.000 | Retail pequeño puede ser ~4.000/kg. |
| capacho_uchuva | Capacho de uchuva | 1.200 | N/D | Baja | unverified | — | `Gratis` no equivale a costo puesto en finca; requiere convenio, secado/picado y flete. |
| cascara_arveja | Cáscara de arveja | 1.400 | N/D | Baja | unverified | — | Estacional y húmeda. |
| cascara_cacao | Cáscara de cacao | 3.500 | N/D | Baja | unverified | — | Diferenciar cascarilla de grano, cáscara de mazorca y material fermentado. |
| cascara_maní | Cáscara de maní | 300 | N/D | Baja | unverified | — | Baja densidad; flete crítico. |
| cascara_papa | Cáscara de papa | 1.500 | N/D | Baja | unverified | Gestores de orgánicos Bogotá | `Gratis` en origen puede ser posible; traslado y estabilización cuestan. |
| cascara_uchuva | Cáscara de uchuva (capacho) | 500 | N/D | Baja | unverified | — | Probable duplicado semántico de `capacho_uchuva`; resolver nomenclatura. |
| follaje_crisantemo | Follaje de crisantemo | 1.200 | N/D | Baja | unverified | https://agronet.gov.co/noticias/compostaje-de-flores-una-practica-nutritiva-para-los-suelos | Revisar residuos de agroquímicos antes de uso. |
| pulpa_alfalfa | Pulpa de alfalfa | 4.000 | N/D | Baja | unverified | — | Nombre comercial ambiguo; definir proceso/origen físico. |
| rastrojo_frijol | Rastrojo de fríjol | 1.600 | N/D | Baja | unverified | — | Estacional; incluir secado/enfardado/flete. |
| rastrojo_papa | Rastrojo de papa | 1.200 | N/D | Baja | unverified | — | Origen regional plausible, falta proveedor/cotización. |
| residuo_clavel | Residuo de clavel | 1.000 | N/D | Baja | unverified | Agronet / corredor Madrid–Facatativá | `Gratis` puede existir en origen; retiro, trituración y control de agroquímicos no son $0. |
| tallo_floricultura | Tallo de rosa/clavel | 200 | N/D | Baja | unverified | Agronet / residuos florícolas Sabana | Prioridad alta para RFQ directo por cercanía a Tenjo. |
| tallo_rosa | Tallo de rosa molido | 1.500 | N/D | Baja | unverified | Sector florícola Cundinamarca | `Molido` implica energía y mano de obra. |
| afrecho_cerveceria | Afrecho de cervecería | 2.500 | 1.125; ~1.013 desde 3 t | Alta | observed_market | https://frescorganico.com/producto/afrecho-de-cerveza | MOQ 10×40 kg ≈400 kg; `Gratis` es falso para compra comercial. |
| cascarilla_girasol | Cascarilla de girasol | 3.500 | N/D | Baja | unverified | — | No usar precio de semilla/torta como proxy. |
| cascarilla_quinua | Cascarilla de quinua | 4.500 | N/D | Baja | unverified | — | Candidato a RFQ en Boyacá; revisar saponinas. |
| cascarilla_soya | Cascarilla de soya | 5.800 | N/D | Baja | unverified | https://haciendasas.com/materiasprimas/ | Buen candidato RFQ por cercanía de Facatativá. |
| harina_alfalfa | Harina de alfalfa | 8.000 | N/D feed-grade | Media | estimated | Mercado Libre importado no representativo | Cotizar bulto pecuario; no usar retail importado como costo operacional. |
| harina_maiz | Harina de maíz / “afrecho” | 1.000 | ~2.715 proxy maíz grano | Media | estimated | https://frescorganico.com/producto/maiz-grano | El nombre mezcla dos productos; normalizar antes de cotizar. |
| harina_pescado | Harina de pescado | 14.000 | N/D | Baja | unverified | Mercado Libre Colombia | Solicitar feed-grade con proteína, humedad y cenizas. |
| harina_soya | Harina de soya tostada | 8.500 | ~4.303 proxy torta/meal | Media | estimated | https://frescorganico.com/producto/torta-de-soya | Torta de soya es económicamente comparable, no idéntica. |
| harina_trigo | Harina de trigo integral | 1.200 | ~1.860 proxy mogolla | Media | estimated | https://frescorganico.com/producto/mogolla-de-trigo | Definir si se necesita harina o subproducto tipo mogolla/salvado. |
| hemp_hurds | Hemp hurds | 28.000 | N/D | Baja | unverified | — | Material reconocible pero sin oferta colombiana 2026 verificable. |
| polvo_hueso | Polvo/harina de hueso | 8.500 | 8.000 | Alta | observed_market | BioEspacio Bogotá | Catálogo cercano al retail local. |
| salvado_arroz | Salvado de arroz | 4.200 | ~3.353 proxy arroz subproducto | Media | estimated | https://frescorganico.com/producto/harina-de-arroz | No es químicamente idéntico; cotizar polvillo/salvado en molino. |
| salvado_avena | Salvado de avena | 7.500 | 16.275–16.536 | Alta | observed_market | Mercado Libre Colombia, 1 kg | Retail alimentario; buscar bulto de molino antes de descartar. |
| salvado_maiz | Salvado de maíz | 3.800 | ~5.958 | Alta | observed_market | Mercado Libre Colombia, 25 kg | Confirmar que sea salvado/mogolla y no gluten feed. |
| salvado_trigo | Salvado de trigo | 5.200 | 4.650–5.200 | Alta | observed_market | Mercado Libre Colombia, 10 kg / 1 kg | Catálogo bien calibrado para compra pequeña/media. |
| torta_girasol | Torta de girasol | 4.800 | N/D | Baja | unverified | — | Requiere RFQ con distribuidor pecuario. |
| bagazo_lulo | Bagazo de lulo/mora | 1.500 | N/D | Baja | unverified | Gestores de orgánicos Bogotá | `Gratis` en puerta puede existir; retiro rápido, recipientes y flete cuestan. |
| cascara_aguacate | Cáscara de aguacate | 1.400 | N/D | Baja | unverified | — | Cotizar procesadores de pulpa/restauración. |
| cascara_platano | Cáscara de plátano | 1.500 | N/D | Baja | unverified | — | Muy húmeda; COP/kg seco será mucho mayor que COP/kg recibido. |
| hoja_platano | Hoja de plátano seca | 2.500 | N/D | Baja | unverified | — | Cotizar productor, no retail gastronómico. |
| pseudotallo_platano | Pseudotallo de plátano | 1.200 | N/D | Baja | unverified | — | Extremadamente húmedo/voluminoso; transporte y secado dominan. |
| pulpa_cacao | Pulpa/mucílago de cacao | 4.500 | N/D | Baja | unverified | — | Perecedero; necesita uso inmediato o estabilización. |

# Hallazgos prioritarios

## Coco buferizado

`turba_coco_buferizada` deja de ser una estimación por analogía. La mejor referencia local observada fue **$5.000/kg** en Bogotá, con banda observable aproximada de **$5.000–8.000/kg**. Mantener el estado `observed_market` hasta verificar disponibilidad por volumen o compra efectiva.

## Aserrín de caucho

`aserrin_caucho` continúa **sin precio validado**. La cadena de *Hevea brasiliensis* existe en Caquetá y ASOHECA es una contraparte útil, pero no se encontró oferta pública 2026 de aserrín de Hevea por kilogramo. Antes de activarlo para compras normales se requiere RFQ que incluya especie, ausencia de MDF/inmunizantes, humedad, granulometría, toneladas/mes, precio EXW y punto exacto de cargue; después debe añadirse flete a Tenjo mediante cotización vigente/SICE-TAC.

## Hojarasca

El valor de catálogo de **$200/kg** no es un precio de mercado. Puede conservarse como **costo interno provisional** si la biomasa procede de predio controlado, pero debe sustituirse por un time study de recolección, selección, ensacado, movimiento y eventual secado/triturado. No tratar bosque natural como fuente abierta sin verificar el régimen aplicable con la CAR.

## SMS

Para SMS propio, `material_cost = 0` es defendible. No lo son `handling_cost`, `internal_transport_cost`, `size_reduction_cost`, `storage_cost` o `reconditioning_cost`. El costo de reincorporación debe acumular esas actividades por separado.

## Insumos marcados `Gratis`

Los 10 tags `Gratis` del catálogo no deben modelarse como COP 0/kg entregado y acondicionado:

`ceniza_vegetal`, `aserrin_pino_compostado`, `carton_corrugado`, `carton_huevo`, `borra_cafe`, `capacho_uchuva`, `cascara_papa`, `residuo_clavel`, `afrecho_cerveceria`, `bagazo_lulo`.

En algunos casos la materia puede obtenerse a $0 en origen; el costo puesto-utilizable sigue siendo >0 por logística y procesamiento.

# Nomenclatura y duplicados detectados

- `capacho_uchuva` y `cascara_uchuva` probablemente describen la misma corriente física; resolver si son calidades/procesos distintos o un duplicado.
- `lombricompost` y `vermicompost` se solapan comercialmente; definir si existe una diferencia de especificación real.
- `harina_maiz` mezcla “harina” y “afrecho”; deben separarse si representan productos distintos.
- `pulpa_alfalfa` necesita definición física/comercial antes de recibir precio.
- `raices_hidroponicas` es una formulación propia con SMS, no una commodity externa.
- `tamo_trigo` y `paja_trigo` pueden solaparse regionalmente; conservar separados solo si existe especificación de origen/proceso.

# Próximos RFQ prioritarios

Antes de más búsqueda web, priorizar cotizaciones directas para materiales con buena lógica geográfica alrededor de Tenjo/Sabana:

1. Residuos florícolas: tallo de rosa, clavel y follaje.
2. Aserrín segregado por especie y sin madera tratada.
3. Cascarilla de soya / materias primas pecuarias en Facatativá.
4. Borra de café mediante convenios de recolección.
5. Capacho de uchuva y residuos de papa.

# Integración con proveedores y commissioning

`suppliers.md` conserva el resumen de relaciones y criterios de aprobación. Este registro contiene el detalle granular de investigación de costos. Cuando un proveedor pase de referencia de mercado a relación validada, debe actualizarse `suppliers.md` con precio, calidad y lead time verificados por transacción.

Para `cost_events` y KPIs de `../06_operations/operational_commissioning.md`, los estados `observed_market`, `estimated` y `unverified` pueden usarse en escenarios o presupuestos identificados como tales, pero no deben registrarse como costo real de un `PROCESS_BATCH_ID`. Los costos reales de lote deben derivarse de evidencia `purchased`, de una cotización aplicable al lote cuando corresponda, o de costos internos medidos y trazables.