---
title: Economía del Programa Inicial de Shiitake
document_id: DOC-0035
category: business
load_priority: on_request
last_reviewed: 2026-11-03
confidence: low
primary_sources:
  - Internal records
related_documents:
  - pricing.md
  - suppliers.md
  - ../06_operations/production_schedule.md
  - ../06_operations/quality_control.md
---

# Estado

El proyecto está en preproducción, con 0 lotes activos. DEC-013 establece *Lentinula edodes* como especie de arranque. Las proyecciones anteriores basadas en paja, spawn de *P. djamor*, BE supuesta y venta semanal quedan retiradas del modelo activo.

No existe todavía un costo por kilogramo, margen, punto de equilibrio ni capacidad comercial validados.

# Regla de modelación

El modelo financiero comienza con el lote piloto y usa datos trazables. No se proyectan ingresos a partir de BE de literatura, precios sin cotización o capacidad nominal de las cámaras.

# Costos hundidos y capex

El inventario y los pagos reales deben reconciliarse contra facturas y `metadata/equipment.yaml`. El valor aproximado de US$870 registrado en junio de 2026 se conserva como snapshot histórico, no como total contable definitivo.

Separar:

- capex ya pagado;
- equipo presente no comisionado;
- consumibles del lote;
- mano de obra;
- energía medida;
- merma y descarte;
- logística y empaque;
- depreciación, si se decide incorporarla.

# Ficha económica del lote piloto

| Campo | Estado |
|---|---|
| Cepa/proveedor de spawn | Pendiente |
| Precio y cantidad de spawn | Pendiente |
| Formulación y costo de materias primas | Pendiente |
| Bolsas y consumibles | Pendiente |
| Energía de esterilización | Pendiente de medición |
| Mano de obra por etapa | Pendiente de registro |
| Rendimiento vendible | Pendiente del piloto |
| Pérdida y descarte | Pendiente del piloto |
| Precio validado por canal | Pendiente de entrevistas/cotizaciones |

# Medición de energía y comparación de rutas

Incorporación de [DOC-0133, F03/F07](../09_research/factibilidad_shiitake_tenjo_evaluacion_2026-11-03.md). Ficha documental para completar durante pruebas autorizadas; no acredita mediciones ni habilita compras.

| Registro por lote/etapa | Unidad y evidencia |
|---|---|
| Preparación, tratamiento térmico, incubación, fructificación y frío | Lectura inicial/final kWh, fecha, horas y equipo/medidor |
| Condiciones y ocupación | Temperatura exterior/interior, carga y etapa; fuente del registro |
| Tarifa efectiva | Factura/contrato, período, clase de servicio y COP/kWh; indicar contribución incluida o separada |
| Cargos fijos | COP/período y criterio de asignación; no confundir con costo variable |
| Agua y descarga | m³ por período/actividad, tarifa y soporte de conexión/factura |
| Denominador | kg cosechados, liberados y efectivamente vendidos; masa seca inicial para BE |

`kWh/kg liberado = energía atribuida al lote / kg liberados`. Si faltan lecturas, distribución de consumo compartido o kg liberados, registrar **pendiente**, sin convertir potencia nominal × 24 h en consumo medido. Evitar doble conteo entre etapas y de contribuciones/impuestos ya incluidos en factura.

Para comparar bloque comprado precolonizado con producción interna, usar idéntico horizonte y grado comercial: costo puesto en Tenjo, aceptación/descarte, trazabilidad y madurez del bloque, kg vendibles acumulados, mano de obra, energía, frío, empaque, logística y días de ocupación/cartera. Separar capex nuevo de equipo existente. No asumir que ambas rutas tienen la misma BE, ciclos o riesgo; la alternativa no reemplaza el microlote vigente sin revisión.

El precio mínimo y el margen de contribución se rigen por [pricing.md](pricing.md) y DEC-020. No sumar merma otra vez si el costo ya está dividido entre kg vendibles. No reconocer ingresos por SMS o ahorro de briquetas sin validación técnica/comercial separada.

# Fórmulas

- Costo variable del lote = insumos + energía + mano de obra + empaque + logística + descarte atribuible.
- Costo por kg vendible = costo variable del lote / kg liberados para venta.
- Margen de contribución por kg = precio neto cobrado / kg − costo variable / kg.
- Rendimiento vendible = masa liberada para venta / masa fresca total.
- BE acumulada se reporta como indicador biológico separado; no sustituye rendimiento vendible ni margen.

# Condiciones antes de proyectar escala

1. Cerrar al menos un ciclo completo y trazable.
2. Medir costo real de la carga térmica.
3. Registrar horas de trabajo por etapa.
4. Validar vida útil, merma y grado comercial.
5. Obtener precios observados de compradores de shiitake.
6. Repetir el ciclo antes de extrapolar capacidad.

La expansión no se justifica por el número de carpas disponibles. Depende de proceso repetible, demanda y margen medido.

# Preguntas abiertas

- ¿Qué spawn de shiitake trazable está disponible y a qué costo puesto en Tenjo?
- ¿Qué formulación es viable con insumos locales y cuál es su costo seco?
- ¿Cuánto consume un ciclo validado del autoclave?
- ¿Qué precio pagan los restaurantes objetivo por shiitake fresco local y trazable?
- ¿Cuál es la merma real entre cosecha y entrega?
