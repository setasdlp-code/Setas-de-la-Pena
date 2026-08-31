---
title: Caseta Compacta — Checklist de Visita en Sitio
document_id: DOC-0105
category: facility
load_priority: selective
last_reviewed: 2026-08-29
confidence: N/A
status: draft — checklist de campo, ninguna medición ejecutada todavía
primary_sources:
  - caseta_compacta_build_checklist.md (DOC-0103)
  - caseta_compacta_structural_handoff.md (DOC-0104)
  - home_rnd_lab.md (DOC-0020)
related_documents:
  - caseta_compacta_build_checklist.md
  - caseta_compacta_structural_handoff.md
  - home_rnd_lab.md
---

# Propósito

Este documento consolida en un solo lugar **todo lo que ya no se puede resolver por diseño remoto** — mediciones físicas, pesajes y llamadas de seguimiento — reunidas desde `caseta_compacta_build_checklist.md` (DOC-0103) y `caseta_compacta_structural_handoff.md` (DOC-0104). Está pensado para llevarse impreso o en el teléfono durante la visita, no para leerse de corrido.

Cada ítem indica **qué llevar**, **qué medir/hacer**, y **qué documento actualiza** el resultado — así el dato vuelve a su lugar sin tener que releer todo el diseño.

---

# 🧰 Antes de salir

- [ ] Cinta métrica (mínimo 5 m)
- [ ] Báscula (de baño o de equipaje, con capacidad ≥40 kg)
- [ ] Calibrador o regla para medir espesor de largueros
- [ ] Cámara/teléfono para fotos de referencia
- [ ] Tiza o cinta de enmascarar para marcar puntos en el piso
- [ ] Copia de este documento y de `Main.dc.html` (plano de planta) para comparar in situ

---

# 📍 En la terraza

## Geometría y despejes

- [ ] **Huella de la chimenea/ducto:** medir dimensiones exactas y distancia a la baranda más cercana. *(Actualiza: `home_rnd_lab.md` §Geometría provisional, y determina la orientación de la caseta en DOC-0103 — la pendiente del techo debe drenar lejos de la chimenea Y de la baranda a la vez.)*
- [ ] **Retícula de piso:** medir dos módulos consecutivos para confirmar si son 60×60 cm (o si dos módulos suman 1.20 m). *(Actualiza: `home_rnd_lab.md` §Geometría provisional.)*
- [ ] **Despeje de la baranda:** confirmar el margen de seguridad real disponible antes del vacío. *(Actualiza: DOC-0103, criterio de ubicación.)*
- [ ] **Verificar que la huella de ~1.66 × 4.24 m realmente cabe** en el cuadrilátero irregular de la terraza, en un punto que cumpla los cuatro criterios de DOC-0103 (baranda, chimenea, zona estructural, drenaje del techo). Marcar el punto elegido con cinta/tiza y fotografiar.
- [ ] **Ancho útil del pasillo** (garaje → escalera → terraza), si la ruta de transferencia de material pasa por ahí. *(Actualiza: `home_rnd_lab.md`, ya lo marcaba pendiente antes de esta caseta.)*

## Servicios existentes

- [ ] **Ubicación del desagüe existente de la terraza.** Bloquea la especificación de drenaje de condensado del piso de la cámara (DOC-0103). Sin esto, no se puede orientar la inclinación del piso ni confirmar si el forro de caucho actual (2 tapetes, 0.5 m²) es siquiera la estrategia correcta.
- [ ] **Punto de agua y tablero eléctrico más cercano** — referencia general para planear la ruta del circuito dedicado (DOC-0103, ruta eléctrica).

---

# 📦 En casa — paneles y equipos

## Paneles recuperados

- [ ] **Pesar una pieza de panel real** (una de las 14, 1.20 × 1.86 m). *(Actualiza: `caseta_compacta_structural_handoff.md` DOC-0104 §2.1 — el rango de 470–625 kg total es un estimado visual, no medido.)*
- [ ] **Medir el espesor y ancho real de los largueros** (el marco de madera visible en los bordes). *(Actualiza: DOC-0103, especificación de listón de bloqueo — el listón de 38×63 mm asume una sección similar o mayor, no confirmada por foto.)*

## Equipos

- [ ] **Confirmar peso vacío de cada CLOUDLAB 844** — ficha de fabricante o pesar directamente si es accesible. *(Actualiza: DOC-0104 §2.2 — actualmente 15–25 kg es un estimado, no un dato de ficha.)*
- [ ] **Probar la holgura real de puerta** una vez la primera CLOUDLAB esté en posición: abrir ambas solapas de cremallera con las manos ocupadas (ej. cargando un bloque de sustrato) y confirmar que el pasillo de 1.0 m es suficiente antes de fijar la posición de la segunda tienda. *(Actualiza: DOC-0103 — no hay cifra de fabricante para esto, es una prueba física.)*

---

# 📞 Seguimientos que no son medición física

- [ ] **Llamar/escribir al ingeniero estructural** por las cinco cifras específicas que la aprobación pass/fail no incluyó: carga admisible en kg/m², líneas estructurales preferentes, necesidad de base de reparto, puntos de anclaje exactos, y confirmación de que el rango estimado (~750–1,150 kg) coincide con lo que él calculó. *(Actualiza: `caseta_compacta_structural_handoff.md` DOC-0104 §7.)*
- [ ] **Preguntar a administración/curaduría** si existen planos estructurales del edificio. Si aparecen, entregarlos al ingeniero aunque la aprobación ya se haya dado — ayuda a las cifras específicas del punto anterior.
- [ ] **Cotizar precio final del tablero PVC espumado** con Línea Gráfica SA, Acento Suministros, Portelli SAS o MercadoLibre (proveedores ya confirmados en DOC-0103) — la disponibilidad está verificada, el precio no.

---

# Cómo registrar los resultados

No edites este documento con los datos medidos — es una checklist de campo, no el registro final. Cuando vuelvas de la visita:

1. Los datos de geometría de terraza y chimenea van a `home_rnd_lab.md`.
2. Los pesos de panel y CLOUDLAB van a `caseta_compacta_structural_handoff.md` (DOC-0104), reemplazando los estimados marcados como "BAJA confianza".
3. La dimensión real de largueros va a la especificación de bloqueo en `caseta_compacta_build_checklist.md` (DOC-0103).
4. La ubicación del desagüe y del punto de anclaje elegido van a `caseta_compacta_build_checklist.md` (DOC-0103) y pueden requerir actualizar `Main.dc.html`.

Marca cada casilla aquí solo como registro de que la visita cubrió ese punto — el dato en sí vive en el documento de destino.
