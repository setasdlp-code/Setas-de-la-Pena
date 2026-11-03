# Plan comercial a 12 meses — Setas de la Peña (nov 2026 – oct 2027)

Borrador. Parte de la investigación de mercado [`precios-setas-colombia-2026-11.md`](./precios-setas-colombia-2026-11.md) y respeta las reglas de [`knowledge_base/07_business/pricing.md`](../../knowledge_base/07_business/pricing.md):

- No se publica ningún precio antes de conocer el costo por kg vendible.
- No se hacen afirmaciones medicinales.
- No se compromete volumen antes de validar ciclos.

Estado de partida (`CURRENT_OPERATIONS.md`, 28 oct 2026): pre-producción en Tenjo, 0 lotes, shiitake como producto inicial.

## Producto y orden de entrada

1. **Shiitake fresco**: es el producto piloto. Se venden dos grados, provisionales y pendientes de definir con los compradores.
2. **Shiitake seco** (al mes 6 o más): absorbe el producto de segunda y la merma, sin crear un grado comercial nuevo con producto descartado.
3. **Melena de león y eryngii frescos** (al mes 7 o más, solo con decisión en `DECISIONS.md`): hay poca oferta visible y la melena se vende a ≈$148.000/kg, que es el precio más alto del mercado.
4. **Transformados de melena** (al mes 10 o más, solo si hay excedente): requieren registro INVIMA y mucha marca. Quedan fuera del primer año.

## Referencias de mercado (no son precio propio)

| Producto | Detal observado | Lectura |
|---|---|---|
| Shiitake fresco | $65–90/g (≈$65.000–90.000/kg) | Techo para la venta directa (D2C) |
| Shiitake caja 1 kg | ≈$42.000/kg (Bio Bio, dato viejo) | Piso orientativo para venta al por mayor y a restaurantes |
| Melena fresca | ≈$148.000/kg (un solo dato) | Requiere validar |
| Shiitake seco | $200–440/g | Salida para la merma |

El precio mínimo se calcula con la fórmula de `pricing.md`: costo variable + logística + merma + margen aprobado.

## Sensibilidad del precio mínimo (hipotética, sin datos de finca)

**Clase de dato: escenario.** Ningún valor de esta sección está medido en la finca, porque hay 0 lotes y por eso no hay costo ni rendimiento propios. La tabla solo muestra cómo se mueve el piso de precio. Hay que reemplazarla con los datos del lote piloto antes de cotizar.

Fórmula (`economics.md` y `pricing.md`):

```
costo variable por kg vendible = costo variable por bloque / kg vendibles por bloque
precio mínimo por kg = (costo por kg vendible + logística por kg) / (1 − margen)
```

Supuestos de la tabla, todos elegidos por el autor e ilustrativos: logística de $5.000/kg y margen de contribución del 40 %. El margen real lo decide Sebastián.

| Costo variable por bloque ↓ / kg vendibles por bloque → | 0,3 kg | 0,5 kg | 0,8 kg |
|---|---|---|---|
| $4.000 | $30.600/kg | $21.700/kg | $16.700/kg |
| $7.000 | $47.200/kg | $31.700/kg | $22.900/kg |
| $10.000 | $63.900/kg | $41.700/kg | $29.200/kg |

Cómo leerla frente al mercado: el shiitake fresco se vende al detal a ≈$65.000–90.000/kg y en caja de 1 kg a ≈$42.000/kg (Bio Bio, dato viejo).

- Si el rendimiento vendible por bloque es bajo y el costo alto (esquina inferior izquierda, ≈$64.000/kg), solo alcanza para vender al detal.
- Con rendimientos medios o altos también caben los restaurantes.

El dato que más pesa es **kg vendibles por bloque**, y se mide en T1.

## Fases

### T1 · Nov 2026 – Ene 2027 — Validar antes de vender
- [ ] Cerrar el lote piloto de shiitake: kg cosechados, kg vendibles, merma y vida útil a 3 °C.
- [ ] Calcular el costo variable por kg vendible con `economics.md` y `procurement_cost_registry.md`.
- [ ] Hacer 10 entrevistas de precio con la plantilla de `pricing.md`:
  - 4 restaurantes de Bogotá y Chía.
  - 3 tiendas especializadas: Vida Orgánica, Bio Bio y Nutrisetas como referencia.
  - 2 puestos de Paloquemao: locales 81-296 y 81-297.
  - 1 tienda de Tenjo.
- [ ] Pedir por WhatsApp los precios mayoristas de Setas Doradas y de Paloquemao.
- [ ] Definir el empaque: bandeja de 200 g para detal y caja de 1 kg para restaurantes. Etiqueta con lote y fecha.
- [ ] Formalizar la facturación (RUT/factura electrónica) y revisar `regulatory_framework.md`.

**Puerta de salida:** precio mínimo calculado y al menos 3 compradores interesados en recibir muestra.

### T2 · Feb – Abr 2027 — Pruebas pagadas
- [ ] Entregar muestras y luego hacer de 2 a 3 pedidos pagados por comprador.
- [ ] Atender 3 o 4 restaurantes y 1 o 2 tiendas, con un volumen limitado a lo que producen los ciclos validados.
- [ ] Abrir un canal D2C pequeño (WhatsApp/Instagram, entrega en Tenjo, Chía y el norte de Bogotá) en bandejas de 200 g.
- [ ] Registrar por pedido el precio neto, la logística, los rechazos y el motivo.

**Puerta de salida:** margen de contribución positivo en al menos 2 canales y rechazo por calidad menor al 10 %.

### T3 · May – Jul 2027 — Ordenar y estandarizar
- [ ] Publicar la lista de precios v1 por canal: detal, tienda y restaurante, con las condiciones de pago.
- [ ] Hacer acuerdos de frecuencia fija (semanal) con los 2 o 3 mejores compradores.
- [ ] Hacer una prueba de shiitake seco con la merma: bolsa de 50–100 g, con precio por debajo del importado.
- [ ] Decidir si se cultiva melena y eryngii (registrar DEC) según la capacidad y los resultados del I+D.

**Puerta de salida:** al menos el 70 % de la producción vendida bajo acuerdo recurrente.

### T4 · Ago – Oct 2027 — Crecer
- [ ] Aumentar el volumen al ritmo de la capacidad. No sumar compradores sin producción que los respalde.
- [ ] Si la decisión del T3 fue positiva, piloto comercial de melena fresca con 1 o 2 restaurantes.
- [ ] Explorar 1 tienda gourmet o de mercado orgánico para el seco.
- [ ] Revisión anual del precio, el margen por canal y los clientes que conviene mantener o soltar.

## Indicadores mensuales

- kg vendidos por canal y precio neto promedio en COP/kg.
- Margen de contribución por canal.
- Merma: pre-venta y rechazos.
- Número de compradores activos y recurrentes.
- Días de cartera.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Producción irregular | Vender solo volumen validado y mantener una lista de espera |
| Competencia de Setas Doradas o de importado barato | Competir por frescura (cosecha del día), trazabilidad y origen Tenjo, no por precio |
| Vida útil corta | Entregas de 1 a 2 días después de cosecha y salida a seco para la merma |
| Regulatorio en transformados | Fuera del alcance del primer año |

## Decisiones pendientes para Sebastián

1. El margen de contribución mínimo aprobado.
2. Quién hace la logística de entrega y con qué costo.
3. Cuándo empezar con la melena y el eryngii (DEC nueva).
