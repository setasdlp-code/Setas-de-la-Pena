---
title: "Auditoría — Selección de material biológico de shiitake y validación local (reporte externo 2026-11-02)"
document_id: DOC-0132
category: research
load_priority: selective
last_reviewed: 2026-11-03
confidence: low
status: draft
primary_sources:
  - "Reporte externo asistido por IA, corte 2026-11-02: «Selección de Material Biológico y Diseño de Validación Local de Lentinula edodes para Setas de la Peña». El texto original no está archivado en el repo; lo conservado aquí es el registro de hechos y la auditoría."
  - "Alberti et al. 2022, Braz. Arch. Biol. Technol. 65:e22210246 (ya en references/bibliography.md)"
related_documents:
  - shiitake_verificacion_web_2026-10-25.md
  - climate_agroecology_tenjo_tabio_claim_audit_2026-08-05.md
  - unresolved_questions.md
  - ../01_species/lentinula_edodes.md
  - ../06_operations/lote1_shiitake_especificacion_ambiental.md
  - ../06_operations/piloto_shiitake_incubacion_protocolo.md
  - ../05_equipment/autoclaves.md
  - ../07_business/suppliers.md
  - ../07_business/colombian_market.md
  - ../DECISIONS.md
---

# Alcance y límites

Audita un reporte externo asistido por IA que compara rutas de abastecimiento de inóculo de *L. edodes* (agar, cultivo líquido, spawn en grano, bloque precolonizado) y propone un ensayo de validación en tres etapas para Tenjo. **No es evidencia Tier 1.** Ninguna fuente citada se abrió completa en esta sesión: todo valor procede del texto del reporte. Nada de este documento se promueve a `01_species/lentinula_edodes.md` sin leer la fuente primaria.

Niveles (los mismos de `shiitake_verificacion_web_2026-10-25.md`):

- **A:** ya está en una fuente primaria del KB.
- **B:** artículo revisado por pares o norma oficial, citado por el reporte y no reabierto.
- **C:** proveedor, catálogo, guía de extensión o blog. Es práctica, no evidencia controlada.
- **N:** sin identidad de fuente o no verificable.

# Hallazgos del reporte

1. **Ningún proveedor nacional cumple hoy los cuatro excluyentes sin confirmación escrita.** Los excluyentes son: legalidad en Colombia (KO-1), presentación compatible sin laboratorio (KO-2), código de cepa y lote (KO-3), pureza y soporte estéril (KO-4). El reporte no declara ganador.
2. **El único precio público fechado es Setas de Siecha:** COP 70.000 por un tubo Falcon con 10–15 mL de agar MEA, rango declarado 16–24 °C, «2 presentaciones configurables» sin desglosar, entrega de días a un mes. Un tubo de agar no inocula bloques: exige pasar por placa, grano madre y grano comercial.
3. **Nutrisetas (Bogotá) y Los Fungis Colombia** figuran con actividad o catálogo públicos, sin ficha de shiitake, sin código de cepa ni precio B2B. Se tratan como candidatos que dependen de un cuestionario.
4. **MercadoLibre (COP 85.000–102.333) y la oferta de Etsy se descartan:** sin productor, cepa, lote ni registro ICA, y en Etsy el material es grano secado con esporas.
5. **Importar inóculo está pendiente de verificar.** La consulta SISPAP-ICA por «MICELIO» devolvió 0 registros; sin requisitos publicados hay que escribir a Cuarentena Vegetal. Las cepas 3782 (Australia, EE. UU., UE) e IW43 (Intiwasi, Ecuador) quedan fuera del arranque.
6. **El clima exterior de Tenjo no sirve para incubar.** El tipo térmico L/M/H/B de una cepa describe la fructificación, no la colonización: todas incuban mejor a 20–27 °C. El exterior (media 13–14 °C, mínimas 9–10 °C) frena la colonización y favorece mohos, pero cabe en la ventana de fructificación de cepas frías y templadas.
7. **EB no es kilos vendibles.** Alberti 2022 (ICFC 510/03, bloques de 2 kg, 7 % de spawn, 25 °C): inducir a 30, 50 y 70 días dio EB de 32,0 %, 72,8 % y 88,6 %, con setas pequeñas a 30–50 días y grandes a 70.
8. **Modelo de costos por 100 bloques de 2,5 kg (reporte):** spawn en grano a tarifa B2B ≈ COP 7.350 por bloque útil; propagar desde agar ≈ COP 10.400; un bloque precolonizado solo sale si la maquila queda por debajo de COP 18.000–20.000 por bloque. Son estimaciones del reporte, con supuestos de merma sin respaldo medido.
9. **Ensayo propuesto:** recepción con cuarentena de 5–7 días, ensayo exploratorio con incubación de 55 frente a 70 días, y confirmación con dos lotes independientes. Resultados en ITT (todos los bloques asignados, los perdidos cuentan 0 g) y PP (solo los que completan el ciclo).

# Registro de hechos con nivel

| Hecho | Lo que dice el reporte | Nivel | Consecuencia |
|---|---|:---:|---|
| Incubación óptima 20–27 °C en todos los tipos térmicos | Verma et al. y Deepa Rani et al.: diámetro de colonia a 14 d de 84,07 mm a 25 °C y 38,07 mm a 15 °C | B | Consistente con el piloto de incubación con control de temperatura. Leer las fuentes antes de citar cifras |
| EB creciente con el tiempo de incubación | Alberti 2022, n = 8, ver punto 7 | A (cifras no recontrastadas) | La fuente ya está en `bibliography.md`; contrastar las cifras con el artículo antes de usarlas |
| Fructificar sobre 17 °C oscurece el interior del estípite (cepa M113) | Estudio transcriptómico en PMC | B | Solo contexto; sin evidencia de que aplique a la cepa del piloto |
| Líneas degeneradas de L808 colonizan y hacen pardeamiento normales y no fructifican | MDPI J. Fungi 2026 | B | Un buen pardeamiento no descarta degeneración; no diagnosticar degeneración por foto |
| Clima Tenjo–Tabio: media 13–14 °C, máxima 17–19 °C, mínima 9–10 °C, HR 80–89 % | IDEAM y notas regionales | B/C | Ya auditado en `climate_agroecology_tenjo_tabio_claim_audit_2026-08-05.md`; no duplicar |
| Siecha: COP 70.000, tubo Falcon MEA, 16–24 °C, entrega hasta 1 mes | Tienda del proveedor, consulta 2026-11-02 | C | Candidato condicionado; pendiente de cuestionario |
| Siecha estima COP 200–300 USD/mes de spawn para 500 bloques | Guía técnica del proveedor | C | Orden de magnitud; no es cotización |
| Nutrisetas y Los Fungis ofrecen shiitake (fresco, agar, líquido, autocultivo) | Sitios web | C | Sin ficha ni precio |
| Anuncios de MercadoLibre y Etsy | Listados | N | Descartados |
| IW43 a USD 16–18/kg con mínimo de 3 kg; 3782 en AU/US/UE | Catálogos | C | Bloqueado por importación |
| SISPAP: 0 registros para micelio; exige DRFI, PAPF y eventual cuarentena | Consulta a la base del ICA | B (no reproducida) | Escribir a `cuarentena.vegetal@ica.gov.co` solo si fallan los nacionales |
| Resoluciones ICA 090832/2021, 68370/2020, 19328/2024 y Circular 1/2024 | Citadas por número | N | Verificar texto y vigencia antes de actuar sobre ellas |
| Shiitake fresco en Bogotá COP 70.500–90.000/kg | Comercios y tiendas | C | Cruzar con `docs/research/precios-setas-colombia-2026-11.md` |

# Observaciones de la auditoría

Puntos donde el reporte no coincide con el KB o no se sostiene solo.

1. **Fungiilab no aparece.** El reporte no sabe del proveedor del lote 1 (DEC-019). Sus candidatos se suman a Fungiilab y no lo reemplazan. Tampoco se debe asumir que Fungiilab y Los Fungis Colombia sean la misma empresa.
2. **Su línea base de infraestructura está desactualizada.** Supone que no se sabe si hay autoclave o flujo laminar. El KB documenta un All American 1941X no eléctrico de 39 L (`05_equipment/autoclaves.md`) y un documento de flujo laminar, ambos sin comisionar. La pregunta V-01 pasa a ser si ese autoclave puede esterilizar la carga del ensayo, no si existe. Esa capacidad es chica: condiciona cuántos bloques de 2 kg caben por ciclo.
3. **El tamaño del ensayo excede el piloto vigente.** El lote 1 es de 30 bloques de 2,0 kg. El reporte pide 16–24 bloques por candidato, es decir 32–72 con dos o tres candidatos, más controles. Con 24 bloques por candidato, dos tiempos de incubación, tres alturas de estantería y dos tandas quedan 2 bloques por celda, no los n = 8–12 que declara. O se reduce el diseño o se acepta que es exploratorio sin potencia estadística.
4. **Los umbrales de decisión son hipótesis del reporte.** EB comercializable ≥ 60 % (ITT) y ≥ 70 % (PP), ≥ 80 % de cosecha Grado A y CV ≤ 15 % entre lotes no salen de la literatura citada. Alberti reporta EB total, no comercializable. No fijarlos como compuertas hasta que el propietario los apruebe.
5. **Unidades dudosas en el balance de masa.** El reporte cita «94,2 kg por tonelada seca» y a la vez «94,2 % de EB», que son cantidades distintas (≈ 9,4 % frente a 94,2 %). No usar esa cifra hasta leer PMC10142386.
6. **Contradice una frase de `colombian_market.md`.** Esa nota afirma que no hay productor local de shiitake fresco en Bogotá. El reporte dice que Nutrisetas lo produce. Sin verificar ninguna de las dos.
7. **Puntaje ponderado.** Los puntajes de 1 a 5 del reporte (3,78; 3,74; 2,92…) mezclan datos con valores «neutros» asignados por falta de información. Sirven para ordenar contactos, no para decidir una compra.
8. **Mezcla de fechas climáticas.** Cita alertas del IDEAM de 2025 junto a una mínima de Sopó de septiembre de 2026 sin fuente directa. Verificar antes de dimensionar calefacción.

# Preguntas pendientes que abre el reporte

Registradas como SH12–SH15 en `unresolved_questions.md`.

| ID | Pregunta |
|---|---|
| SH12 | ¿Siecha, Nutrisetas o Los Fungis entregan spawn en grano estéril o bloques colonizados de *L. edodes* con código de cepa y lote? |
| SH13 | ¿Cuál es el precio B2B, el mínimo de pedido y el plazo de cada uno para 5, 15 y 30 kg de spawn? |
| SH14 | ¿Se puede ampliar o rediseñar el lote de 30 bloques para comparar un segundo proveedor sin perder el control del piloto? |
| SH15 | ¿Qué requisitos tiene el ICA para importar micelio de *L. edodes* y qué plazo y costo implican? |

# Cuestionario para proveedores

Para enviar a Setas de Siecha, Nutrisetas y Los Fungis Colombia antes de cualquier orden de compra. Criterio de paso entre paréntesis.

| N.° | Pregunta | Criterio de aceptación |
|---|---|---|
| Q-01 | ¿Con qué código o referencia identifican su línea de *L. edodes*, cuál es el origen de la cepa madre y cada cuánto verifican que fructifica con vigor? | Código propietario fijo y verificación periódica |
| Q-02 | ¿Qué generación entregan (P1–P3 en líquido o G1–G3 en grano) y qué queda en la etiqueta: lote, fecha de inoculación, soporte? | Hasta G2 o P2/P3, con lote y fecha |
| Q-03 | ¿Pueden entregar spawn en grano estéril (cereal, kg por bolsa, filtro) o bloques colonizados (peso húmedo, madera, % de salvado, fase)? | Spawn estéril o bloque de madera dura sin coníferas con 10–20 % de salvado |
| Q-04 | Para esa cepa, ¿qué tiempos reales de colonización a 22–25 °C, pardeamiento a 18–22 °C, rango de fructificación y peso medio y diámetro de seta observan en primera oleada? | Coherente con Tenjo y con setas comerciales de 5 cm o más |
| Q-05 | ¿Precio por volumen (5, 15 y 30 kg de spawn, o 20, 50 y 100 bloques), mínimo de pedido, plazo y cómo evitan más de 28 °C en tránsito a Tenjo? | Plazo de 30 días o menos, despacho terrestre y precio B2B |
| Q-06 | ¿Cuál es su política de reposición ante contaminación en bolsa cerrada y tienen registro ICA vigente como productor o comercializador? | Reposición 1:1 y registro ICA |

Para Siecha, añadir: ¿la segunda «presentación configurable» del producto de COP 70.000 es bolsa de grano, y cuál es su código de lote?

# Regla de paso (propuesta, sin aprobar)

Un candidato pasa a ensayo exploratorio solo con respuesta escrita que cumpla Q-02, Q-03 y Q-06. Una respuesta que no la cumple no lo descarta del KB: se registra como «sin respuesta» o «no cumple». Esto es DEC-021.

# Qué NO hace este documento

- No declara ninguna cepa como «óptima para Tenjo».
- No aprueba proveedor, setpoint, receta ni umbral de decisión.
- No cambia el catálogo, los cálculos C:N/EB ni nada de Setas OS.
- No sustituye a DEC-019: el lote 1 sigue con Fungiilab.
