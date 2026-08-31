---
title: Proveedores — Prioridades del Programa de Shiitake
document_id: DOC-0037
category: business
load_priority: on_request
last_reviewed: 2026-08-21
confidence: medium
primary_sources:
  - Internal records
  - Manufacturer and retailer listings reviewed 2026-08-05
related_documents:
  - economics.md
  - procurement_cost_registry.md
  - ../03_spawn/grain_spawn.md
  - ../02_substrates/substrate_library.md
  - ../04_facility/incubation.md
  - ../05_equipment/autoclaves.md
  - ../05_equipment/environmental_control.md
  - ../09_research/incubation_module_engineering_review_2026-08-05.md
  - ../10_ai_workflows/OAP-0001-modular-incubation-validation.md
---

# Estado

No hay proveedor de spawn ni formulación de sustrato aprobados para el lote 1. La prioridad de abastecimiento es shiitake. Las compras de paja y spawn de *P. djamor* quedan fuera del arranque.

La compra en volumen de cajas modulares de incubación también está bloqueada bajo DEC-015. Se autoriza cotizar y adquirir hasta tres muestras para calificación; ninguna referencia comercial está aprobada como sistema de incubación. La ruta operativa de validación de 30 días está detallada en `../10_ai_workflows/OAP-0001-modular-incubation-validation.md`.

Los proveedores de electrónica y equipos se registran en `metadata/equipment.yaml`; este documento se limita a insumos recurrentes y decisiones de compra pendientes. La investigación granular de precios, presentaciones y referencias de mercado se consolida en `procurement_cost_registry.md`.

# Prioridad 1 — Spawn de shiitake

Solicitar y registrar:

| Campo | Requisito |
|---|---|
| Especie | *Lentinula edodes* |
| Cepa | Nombre, código comercial o identificador del proveedor |
| Clase térmica | Baja, media, alta o información equivalente |
| Lote y fecha | Obligatorios |
| Tipo de spawn | Grano, aserrín u otro |
| Tasa recomendada | Con base húmeda/seca explícita |
| Maduración e inducción | Instrucciones específicas de la cepa |
| Condición de transporte | Tiempo, temperatura y empaque cuando esté disponible |
| Evidencia de viabilidad | Muestra o lote pequeño antes de escalar |

Estado: sin proveedor confirmado. La falta de trazabilidad bloquea la compra para producción.

# Prioridad 2 — Materias primas del sustrato

La familia prioritaria es serrín de madera dura suplementado. Antes de cotizar volumen:

- identificar especie y procedencia de la madera;
- confirmar que no contenga pinturas, adhesivos, preservantes o mezclas desconocidas;
- definir suplemento y porcentaje;
- confirmar tamaño de partícula y humedad;
- exigir trazabilidad por lote;
- conseguir bolsas compatibles con el ciclo térmico;
- preparar una carga representativa para validar el autoclave.

La formulación T2 de café es candidata de investigación, no receta aprobada. Requiere disponibilidad local de borra, aserrín de tallo y salvado, además de validación en Tenjo.

# Prioridad 3 — Consumibles de Proceso

| Insumo | Estado |
|---|---|
| Bolsas PP con filtro y especificación térmica | Proveedor pendiente |
| Guantes de nitrilo | Verificar inventario/proveedor |
| Alcohol e insumos de limpieza | Verificar inventario/proveedor |
| Etiquetas resistentes a humedad/calor | Proveedor pendiente |
| Indicadores o materiales definidos por el SOP de validación térmica | Pendiente del protocolo |
| Empaque piloto | Pendiente de especificación y vida útil |

# Prioridad 4 — Módulos de Incubación

## Especificación de Solicitud de Cotización

Toda cotización debe separar los siguientes componentes:

| Componente | Información requerida |
|---|---|
| Caja | Referencia exacta, fabricante, resina y grado HDPE/PP, contenido reciclado si aplica, lote/fecha de fabricación, dimensiones externas e internas, peso, carga útil, carga de apilamiento, rango térmico y garantía |
| Tapa | Referencia, material, lote, tolerancia de planitud/deformación, mecanismo de cierre y reposición independiente |
| Junta | EPDM de celda cerrada, perfil, dureza, dimensiones, adhesivo o retención mecánica, compresión recomendada, compatibilidad química y reposición |
| Cierres | Cantidad, material, carga, ciclo de vida y posibilidad de reemplazo |
| Aislamiento | Material, espesor, conductividad térmica, absorción de agua, temperatura de servicio, comportamiento frente al fuego, revestimiento lavable y forma de desmontaje |
| Interior | Rejilla elevada y bandeja removible; materiales, carga y limpieza |
| Ventilación | Área libre, filtro si aplica, pérdida de carga, material y acceso para limpieza |
| Sensores/control | SHT45 con membrana o capuchón, tres DS18B20, SCD30 temporal, ESP32, gabinete, relés, fuente, cableado y conectores |
| Calefacción | PTC, ventilador, plenum, termostato físico, fusible térmico, interbloqueo, protección de circuito y RCD/GFCI cuando aplique |
| Comercial | Precio por muestra y por volumen, IVA, flete a Tenjo, plazo, mínimo de compra, disponibilidad de repuestos y notificación de cambios |

No solicitar ni aceptar “MERV-13 para drenaje”. MERV aplica a dispositivos de limpieza de aire. Si se usa medio filtrante en una entrada de aire, debe cotizarse como componente de ventilación con área y pérdida de carga.

## Candidatos Locales Revisados

Precios observados en páginas públicas el 2026-08-05. No equivalen a cotización empresarial ni garantizan inventario.

| Proveedor / referencia | Datos publicados | Precio observado | Estado |
|---|---|---:|---|
| Estra — canastilla cerrada 60 × 40 × 41 cm | HDPE; rango −30 a 80 °C; 25 kg de contenido; resistencia nominal de apilamiento 500 kg; garantía 1 año | COP 50.807 caja | **Candidato principal para muestra** |
| Estra — tapa 60 × 40 cm | PE; protege de polvo/agua; apilable; torsión admitida hasta 5 mm en esquinas y 10 mm en centro; garantía 3 meses | COP 30.250 tapa | Requiere prueba de planitud, junta y cierres |
| PlastiMarket — PS6040 | PP de alto impacto; 60 × 40 × 40 cm; 40 kg; apilamiento 250 kg; tapa abisagrada | Cotización | Candidato comparativo |
| Energy Plus / Homecenter — 60 × 40 × 40 cm | PP; 30 kg; apilamiento 250 kg; cierre plástico; garantía 3 meses | COP 189.900 unidad | Candidato minorista comparativo |

Costo minorista observado de caja Estra + tapa: **COP 81.057 por conjunto**, antes de junta, cierres, aislamiento, rejilla, bandeja, sensores, calefacción, control, flete y mano de obra. Este valor no debe usarse como costo por torre ni como presupuesto de producción.

## Evaluación de Candidatos

### Estra 60 × 40 × 41 cm

Ventajas documentadas: fabricante colombiano, HDPE declarado, geometría nominal correcta, superficie cerrada/lisa, carga y temperatura publicadas, tapa y caja reemplazables por separado.

Faltantes: grado de resina, contenido reciclado, lote de fabricación, dimensiones internas, comportamiento real de la tapa bajo carga, junta, cierre de compresión, ventilación, compatibilidad con el desinfectante operativo, fluencia cargada a 30 días, masa segura de una caja con bloques y precio formal por volumen.

### PlastiMarket PS6040

Ventajas documentadas: PP declarado, mayor carga útil publicada, tapa abisagrada y sede comercial en Bogotá.

Faltantes: precio, grado de resina, contenido reciclado, lote, rango térmico, garantía, dimensiones internas, tolerancia de tapa, reposición de componentes, compatibilidad química y fluencia prolongada.

### Energy Plus / Homecenter

Ventajas documentadas: acceso minorista rápido, PP declarado y referencia física comparable.

Faltantes: costo alto frente a Estra, garantía corta, especificación limitada, ausencia de junta, sin evidencia de cierre uniforme y sin mecanismo de control de cambios del fabricante.

## Control de Recepción y Cambios

Una referencia comercial aprobada no se considera equivalente a cualquier unidad con el mismo nombre. Para cada entrega:

1. Registrar proveedor, fabricante, referencia, lote/fecha, cantidad y documentos recibidos.
2. Comparar dimensiones, masa, color, marcación de resina, tapa, junta y cierres contra una **unidad patrón retenida**.
3. Inspeccionar fisuras, deformación, rebabas, olor, superficies y componentes sustituidos.
4. Seleccionar al menos una unidad por lote para prueba funcional abreviada cuando cambie el lote, el molde o la procedencia.
5. Cuarentenar la entrega si existe diferencia no documentada.
6. Exigir notificación previa de cambios en resina, contenido reciclado, molde, planta, tapa, junta, cierre o proveedor secundario.
7. Repetir los gates afectados antes de liberar una configuración modificada.

La unidad patrón no entra en producción y conserva etiquetas, fotografías, mediciones y BOM aprobados.

# Gate Comercial para Compra en Volumen

La orden superior a tres unidades requiere expediente aprobado con:

1. Tres cotizaciones comparables o justificación documentada si el mercado no las ofrece.
2. Tres muestras físicas del candidato principal.
3. Gate mecánico inicial de siete días y gate de fluencia de al menos 30 días o un ciclo biológico completo.
4. Gates de limpieza, térmico, gas/ventilación, condensación, eléctrico y operativo aprobados según `../04_facility/incubation.md`.
5. Cotización del costo total por torre, no únicamente de la caja.
6. Precio y plazo de reposición de caja, tapa, junta y cierres por separado.
7. Garantía escrita, fichas de producto y lote de fabricación archivados.
8. Acuerdo de control de cambios o evidencia equivalente del fabricante/proveedor.
9. Unidad patrón retenida y formato de inspección de recepción aprobado.
10. Aprobación de una configuración después del primer ciclo biológico piloto.

**Blocker vigente:** falta validar tapa/junta, ventilación, perfil térmico/CO₂ cargado, calefacción segura, protección eléctrica, 30 ciclos de limpieza, fluencia prolongada, control de recepción/cambios y costo total. Compra en volumen no autorizada.

# Criterios Generales de Aprobación

- Cotizar al menos tres opciones cuando el mercado lo permita.
- Comprar una muestra antes de volumen; para módulos de incubación, comprar tres muestras.
- Registrar precio, presentación, lote/referencia, lead time y condiciones de reposición.
- Separar disponibilidad declarada de disponibilidad verificada.
- No importar material biológico sin revisar requisitos sanitarios y de ingreso a Colombia.
- No programar lote hasta tener físicamente los insumos críticos y verificar su condición.
- No convertir una ficha logística en una especificación sanitaria o térmica sin ensayo.
- No asumir equivalencia entre lotes o entregas sin inspección de recepción.

# Preguntas Abiertas

- ¿Qué laboratorios o productores colombianos ofrecen spawn de shiitake con cepa identificada?
- ¿Qué maderas duras limpias y trazables están disponibles en Cundinamarca?
- ¿Qué suplemento local permite una formulación repetible?
- ¿Qué bolsas soportan el ciclo validado del autoclave en la carga real?
- ¿Estra suministra grado de resina, contenido reciclado, ficha dimensional interna, tolerancias de tapa y cotización para 3/18/54 unidades?
- ¿Estra acepta notificar cambios de resina, molde o planta y mantener referencias/lotes trazables?
- ¿Qué proveedor local fabrica junta EPDM cerrada y cierres reemplazables para el prototipo?

# Fuentes Comerciales Consultadas

- Estra, “Canastilla plástica cerrada 60x40x41 cm”, SKU 4-1000966: https://www.estra.com/caja-plastica-toda-carrada-de-60x40x41-cm-gris--1013/p
- Estra, “Tapa para caja plástica 60x40 cm”, SKU 4-1019230: https://www.estra.com/tapa-para-caja-plastica-60x40-cm-gris--992/p
- PlastiMarket, “Caja con tapa plástica PS6040”: https://www.plastimarket.com.co/producto/caja-plastica-tapa-abisagrada-ref-cs6040ps/
- Homecenter, “Caja de seguridad plástica 60x40x40 cm con tapa abisagrada”, código 3041155: https://www.homecenter.com.co/homecenter-co/product/3041155/caja-de-seguridad-plastica-60x40x40-cm-con-tapa-abisagrada/3041155/
