---
title: Economía del Programa Inicial de Shiitake
document_id: DOC-0035
category: business
load_priority: on_request
last_reviewed: 2026-07-24
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
