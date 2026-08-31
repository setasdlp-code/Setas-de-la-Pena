---
title: Caseta Compacta (2× CloudLab 844) — Checklist de Construcción
document_id: DOC-0103
category: facility
load_priority: selective
last_reviewed: 2026-08-29
confidence: LOW
status: draft — pendiente de verificación en sitio
primary_sources:
  - Sesión de diseño con Sebastián, 2026-08-29
  - home_rnd_lab.md (DOC-0020)
  - metadata/materials.yaml
  - 05_equipment/equipment_prototyping_report.md
related_documents:
  - home_rnd_lab.md
  - caseta_compacta_structural_handoff.md
  - caseta_compacta_site_visit_checklist.md
  - caseta_compacta_shopping_list.md
  - Main.dc.html
  - ZoneCrossSection.dc.html
  - canvas.json
  - ../metadata/materials.yaml
  - ../FARM_BRAIN.md
---

# Executive Summary

Este documento consolida las decisiones y pendientes de la sesión de diseño de una **caseta compacta** en la terraza de Bogotá, dimensionada únicamente para alojar las dos tiendas CLOUDLAB 844 (fructificación), con un pequeño buffer de entrada. No es la caseta de tres zonas (laboratorio/incubación/fructificación) descrita en `home_rnd_lab.md` — es un subconjunto más pequeño y específico, construido a partir de 7 paneles de set de televisión recuperados.

El diseño visual vive en un canvas publicado (`Main.dc.html` + `ZoneCrossSection.dc.html` + `canvas.json`, en este mismo directorio). Este documento es la lista de verificación en texto; el canvas es la referencia visual. Todo lo que ya no se puede resolver por diseño remoto — mediciones físicas, pesajes, llamadas de seguimiento — está reunido en `caseta_compacta_site_visit_checklist.md` (DOC-0105), pensado para llevar a la visita en sitio.

**Estado (2026-08-29):** ninguna construcción ha iniciado. La capacidad estructural de la placa fue **aprobada** por un ingeniero estructural (ver DOC-0104) — ya no es un bloqueante. Los puntos restantes en "Bloquea la construcción" (sellado de panel, refuerzo de bloqueo) tienen especificación definida, pendiente solo de verificación de disponibilidad local antes de comprar.

---

# Resumen del diseño

| Parámetro | Valor |
|---|---|
| Función | Fructificación (2× CLOUDLAB 844) + buffer de entrada/EPP |
| Preparación/inoculación | Permanece en garaje/laboratorio; esta caseta no las aloja |
| Cámara principal (interior) | ~1.66 m × 3.44 m, 2.40 m de alto |
| Arrangement de tiendas | Frente a frente, pasillo central de 1.0 m |
| Estructura de muros | 7 paneles de set recuperados, cortados **por la mitad exacta** (1.20 m + 1.20 m cada uno, no en el punto asimétrico del diagrama de referencia original) |
| Techo | Cabios + teja de PVC ondulada (cubierta rígida) + lona Toolcraft gris existente como piel secundaria (no paneles) |
| Ventilación | 2× AC Infinity CLOUDLINE H4 existentes (intake/extracción) |
| Humidificación | AC Infinity CloudForge T7 (15 L) existente |
| Sensores | SHT3x / SHT45 existentes, uno por tienda + pasillo |

---

# Presupuesto de paneles

7 pares disponibles → 7 pares usados, 0 sobrantes:

| Muro | Pares de panel |
|---|---|
| Muro corto de entrada | 1 |
| Muros largos (2×) | 4 (2 cada uno) |
| Muro corto de fondo | 1 |
| Buffer/vestíbulo | 1 |
| **Total** | **7 / 7** |

**Corrección importante (2026-08-29):** el corte real fue **por la mitad exacta** (1.20 m + 1.20 m), no el corte asimétrico del diagrama de referencia (1.60 m + 0.80 m sobre travesaño). El corte real cae **dentro de la cavidad 2**, sin travesaño en el borde — ver `ZoneCrossSection.dc.html` para el detalle de empalme corregido. Cada pieza de 1.20 m tiene 1 cavidad completa + media cavidad abierta en el borde de corte.

---

# Checklist

## ✅ Bloqueantes originales resueltos

- [x] **Capacidad estructural de la placa de terraza — APROBADO por ingeniero estructural, 2026-08-29.** Ficha completa en `caseta_compacta_structural_handoff.md` (DOC-0104): carga estimada ~750–1,150 kg (~95–150 kg/m² sobre la huella de ~7.9 m²) evaluada y aprobada para la huella propuesta. Resultado fue pass/fail — las cifras específicas (carga admisible en kg/m², líneas estructurales preferentes, puntos de anclaje exactos) no se registraron todavía; ver DOC-0104 Sección 7 para el seguimiento pendiente. No bloquea el inicio de construcción.
- [x] **Medir mantas isotérmicas — CONFIRMADO 2026-08-29.** Ficha de producto: 210×160 cm, 67 g, poliéster aluminizado (3 mantas por paquete, 2 paquetes comprados). Cubren exactamente las 3 posiciones de muro restantes tras Mylar — 2 mantas por posición, orientadas con 1.60 m en vertical y 2.10 m en horizontal, traslapadas ~40 cm para alcanzar los 2.40 m de alto; ancho de 2.10 m excede el 1.86 m necesario, recortar sobrante. **Las 6 posiciones de muro quedan cubiertas con material 100% en inventario** — no se requiere comprar más lámina reflectiva. Registrado en `metadata/materials.yaml` (`MAT-INS-THERMAL-BLANKET-001`).

## 🔴 Bloquea la construcción (resolver antes de cortar/ensamblar)

- [ ] **Sellado de la cara interior del panel — especificado 2026-08-29, PROVEEDORES CONFIRMADOS 2026-08-29, pendiente solo de cotización de precio final.** Decisión: **tablero PVC espumado 5–6 mm** en la cámara principal (26.78 m², ~10 hojas de 1.22×2.44 m, fijación mecánica con tornillo de cabeza ancha en cuadrícula ~300 mm, cabezas tapadas, juntas selladas con silicona resistente a moho o moldura H de PVC, zócalo curvo de PVC sellado al piso); **pintura epóxica 2 componentes** en el buffer (~2.2 m², sellar juntas/huecos con silicona antes de pintar, imprimante sellador + mínimo 2 manos, aplicar con ventilación abierta lejos de fructificación activa). Forro aplicado en banco sobre cada pieza ANTES de erigir en terraza; costuras en sitio selladas después del herraje de bloqueo/empalme.
  - **Proveedores en Bogotá (verificados por búsqueda web 2026-08-29):** Línea Gráfica SA ([lineagrafica.com.co](https://www.lineagrafica.com.co/products/lamina-de-pvc-board-blanca-1-22-x2-44-m)) — PVC Board blanco, 1.22×2.44 m, calibres 3/5/10 mm, entrega en Bogotá en 24 h hábiles; **el tamaño de hoja de 1.22×2.44 m usado en el cálculo de ~10 hojas queda confirmado, no supuesto**. Acento Suministros & Proyectos (Av Rojas Cra 70 #79a-19, Local 102) — PVC espumado macizo blanco, 4/5/6/8/10 mm. Portelli SAS ([portelli.com.co](http://portelli.com.co/pvc-board/)). MercadoLibre — mismo formato 1.22×2.44 m listado directamente, mismo canal ya usado para Thermolon/Mylar/mantas.
  - **Pendiente:** precio final por hoja no confirmado (una referencia sin proveedor específico menciona ~$90.000 COP para calibre 6mm con 10% de descuento, sin verificar) — cotizar directamente antes de comprar.
  - Confianza subida a MEDIA-ALTA para disponibilidad; MEDIA para precio. Detalle visual en `ZoneCrossSection.dc.html`.
- [ ] **Refuerzo de bloqueo en cada línea de corte — especificado 2026-08-29, pendiente solo de verificar dimensión real de largueros antes de comprar listón.** Listón de bloqueo min. 38×63 mm, ~1.70–1.75 m (ancho libre interior), empotrado a ras del borde de corte, atornillado a los largueros (2 tornillos #8×50 mm por extremo, preferible con escuadra galvanizada ~40×40 mm) + a la cara del tablero (tornillo/grapa cada 100–150 mm). Placa de unión: contrachapado 12 mm o platina galvanizada, ≥150 mm de alto, tornillos #8×32 mm cada 150 mm sobre ambos listones. 14 listones en total (7 paneles × 2 mitades), ~26 m de listón lineal (~11 piezas si se compra en tramos de 2.4 m). Secuencia actualizada: ensamblar en seco → marcar posiciones → **en el borde de corte (madera a la vista + interior de la cavidad): sellador tapaporos o barniz exterior diluido ~10–20% → lijado suave → 2 manos de barniz exterior/marino a fuerza completa, antes de cualquier herraje** (el MDF/OSB del panel absorbe de forma despareja sin sellador previo, sobre todo en la veta de corte) → fijar listones → posicionar mitades → fijar placa de unión → sellar la costura (después del herraje, antes del aislamiento). **Verificar antes de comprar:** dimensión real de los largueros del panel original — el listón asume una sección similar o mayor, no confirmada por foto. El listón resta espacio al hueco de aire que necesita la barrera radiante; mantener sección delgada. Detalle visual en `ZoneCrossSection.dc.html`.

## 🟡 Necesario para construir, aún no especificado

- [x] **Tratamiento de la cara exterior del panel — ESPECIFICADO 2026-08-29. Vacío de diseño detectado: se había especificado el forro interior (PVC/epóxico) pero nunca el lado que queda expuesto al clima.**
  - **Cara exterior (expuesta al clima):** barniz exterior/marino o sellador impermeabilizante para madera exterior — NO barniz de interior, no resiste UV/lluvia de Bogotá a largo plazo y se pela.
  - **Imprimación previa (todas las superficies, MDF/OSB del panel absorbe de forma despareja):** sellador tapaporos, o el mismo barniz exterior diluido ~10–20%, aplicado antes de las manos a fuerza completa. Sin esto, la veta de corte en particular puede hincharse o "afelpar" al primer contacto con líquido, y el barniz queda parejo pero mal anclado en zonas muy porosas. Lijado suave entre la imprimación y las manos de acabado.
  - **Bordes de corte (las 14 líneas de empalme) — prioridad más alta para la imprimación:** sellador tapaporos → lijado → 2 manos de barniz exterior a fuerza completa, sobre la veta de corte + interior de cavidad, **antes de instalar el herraje de bloqueo**, no después — la veta de corte absorbe humedad más rápido que cualquier otra parte del panel, y es justo donde va el herraje que después no se puede inspeccionar. Ya incorporado en la secuencia de la especificación de bloqueo, arriba.
  - **Caras planas exteriores:** mismo tratamiento (imprimación + barniz), menos crítico que los bordes de corte pero recomendado para mayor durabilidad.
  - **Cara interior:** no requiere barniz — ya queda cubierta por el forro PVC/epóxico, sería un paso redundante.
  - **Actualización 2026-08-29 — el barniz se mantiene aunque la lona uso rudo ahora cubra el exterior de los muros (ver ítem de techo/cobertura arriba).** La lona es una capa adicional sobre la madera sellada, no un sustituto: los muros quedan expuestos durante la construcción antes de que la lona esté instalada, la lona no es un sello perfecto permanente (costuras, puntos de fijación, desgaste con los años), y los bordes de corte —la zona de mayor riesgo— siguen necesitando protección propia sin importar qué los cubra después.
- [x] **Cantidad de rollos de manta EVA — CONFIRMADO 2026-08-29: comprar 4 rollos, no 3.** El rollo de 110 cm de ancho no cubre el ancho de 1.86 m de una posición de muro en una sola tira — requiere 1 tira completa (110 cm) + 1 tira angosta (76 cm) por posición, con traslape ~5–7 cm. Consumo real ≈4.63 m²/posición × 6 posiciones ≈27.8 m², lo que deja 3 rollos (27.9 m² provistos) sin margen de maniobra para cortes, desperdicio de esquina o recorte alrededor de los listones de bloqueo. 4 rollos dan 37.2 m² (~34% de margen).
- [x] **Puerta del buffer — ESPECIFICADO 2026-08-29, dos aberturas distintas, no una.**
  - **Puerta exterior (terraza → buffer):** abre hacia AFUERA (el buffer solo tiene 0.8 m de fondo — una puerta que abre hacia adentro deja casi nada de espacio útil). Tamaño ~0.80 × 2.00 m. Hoja: marco liviano (mismo listón 38×63 mm de la especificación de bloqueo) + cara de tablero PVC 5–6 mm (mismo material del forro lavable, un solo sistema de materiales). 2–3 bisagras exteriores galvanizadas o inoxidables. Sello: burlete de espuma de celda cerrada o caucho, comprimido al cerrar. Pestillo con llave o candado con argolla — no solo gancho-y-ojo, hay equipo dentro. Umbral inclinado y sellado, evita encharcamiento en el marco. **No usar la pieza de repuesto del panel 7 para esta puerta** — esa pieza queda como stock de reparación genuino; construir la puerta con material nuevo/comprado.
  - **Abertura interior (buffer → cámara): cortina de tiras de PVC**, no puerta con bisagra. Tiras de ~20 cm, traslape ~50%, montadas en riel de aluminio o PVC atornillado sobre el vano. Elegida porque no necesita espacio de giro en el buffer angosto, se pasa con las manos ocupadas (guantes, toallas, bandejas), es lavable, y el objetivo aquí es una barrera parcial de aire/humedad, no un sello hermético — una puerta con bisagra sería la herramienta equivocada para este tránsito.
- [x] **Sistema de techo y cobertura exterior de muros — REVISADO 2026-08-29 (decisión del propietario, se aparta deliberadamente de un principio de DOC-0020).**
  - **⚠️ Desviación documentada — ahora contra DOS fuentes, no una.** `home_rnd_lab.md` (DOC-0020) establece que la lona nunca debe ser la cubierta estructural/única del techo. Además, `DECISIONS.md` línea 434 registra formalmente: *"La lona Toolcraft 5×7m es una segunda piel de cubierta; no reemplaza la envolvente rígida"* — una decisión formal, no solo un principio de diseño. Sebastián decidió el 2026-08-29 usar esta misma lona como **cobertura exterior única del techo Y de los muros** (parcial, ver abajo), sin la teja de PVC rígida especificada anteriormente. Decisión explícita del propietario para esta caseta compacta específica — ni DOC-0020 ni la decisión de DECISIONS.md se modifican, ambas siguen rigiendo la visión de la caseta completa de tres zonas. Documentado aquí por trazabilidad, no aplicado silenciosamente.
  - **Identidad del material corregida 2026-08-29:** "lona uso rudo" no es un material nuevo distinto — es la misma **Lona Impermeable Gris Reforzada Toolcraft Uso Rudo, 5×7 m**, ya referenciada en DOC-0020 y DECISIONS.md. **Ya está en inventario** (confirmado por el propietario, registrada en `metadata/materials.yaml` como `MAT-TARP-TOOLCRAFT-001`): HDPE, tejido 14×14 hilos/pulgada², 180 g/m², ojillos de aluminio, refuerzos remachados, doble costura en bordes. No es una compra pendiente.
  - **Cobertura parcial, no total (decisión del propietario):** una sola lámina de 5×7 m = 35 m². Techo (~7.9 m²) + los 6 muros de la cámara principal (~26.78 m²) = ~34.68 m² — deja solo ~0.3 m² de margen, prácticamente sin holgura para traslape/desperdicio. Con esta exclusión el margen sigue siendo muy ajustado; priorizar un sellado impecable del techo (lo más crítico) sobre traslapes generosos en los muros.
  - **Muro del lado de la puerta (buffer) — RESUELTO 2026-08-29: retal de tablero PVC espumado, no lona.** La puerta exterior ya lleva cara de tablero PVC 5–6 mm (especificación de puerta, arriba) — la única superficie de panel realmente expuesta en ese muro es la pieza alrededor del marco de la puerta, ~0.6 m² una vez descontada la puerta misma. Se cubre con un retal de las ~10 hojas de tablero PVC ya compradas para el forro interior — no requiere material nuevo. Secuencia: mismo proceso de imprimación → lijado → barniz que el resto del panel, luego el retal de PVC atornillado encima (fijación mecánica, cabezas tapadas, silicona en bordes), igual que el forro interior. Mylar y mantas isotérmicas descartados para este uso — las 6+6 unidades ya están comprometidas por completo en la barrera radiante interior (`materials.yaml`), y ninguno de los dos materiales está pensado para exposición exterior permanente (se rasgan con facilidad, sin clasificación de resistencia UV/lluvia).
  - **El barniz se mantiene de todas formas** — ver ítem de tratamiento de cara exterior. La lona es una capa adicional sobre la madera sellada, no un sustituto.
  - **Cabios:** listón 38×89 mm, ~50 cm entre ejes, apoyados en durmientes sobre el borde superior de los muros — se mantienen como estructura de soporte de la lona, sin cubierta rígida entre cabios y lona
  - **Consecuencia — riesgo de encharcamiento sube:** sin cubierta rígida debajo, cualquier hundimiento de la lona acumula agua en vez de escurrirla. La tensión y la pendiente importan más ahora, no menos. Ajustar la lona con tensores/pretensado adecuado, no solo prensado en los bordes.
  - **Consecuencia — lógica de condensación cambia:** el diseño anterior resolvía la condensación del techo dejándola caer dentro de la cámara de aire entre teja y lona. Sin la teja, ese espacio de aire ya no existe de la misma forma — **nuevo punto abierto:** vigilar si se forma condensación en la cara inferior de la lona en noches frías y gotea hacia el espacio de cabios/cámara. Sin resolver todavía.
  - **Consecuencia — nota de carga (positiva, recalculada con el peso real):** quitar la teja de PVC reduce el peso del techo frente a la estimación anterior de DOC-0104. Con el dato real de 180 g/m² (antes se asumía 300–500 g/m² genérico), la lona completa de 35 m² pesa solo ~6.3 kg — mucho más liviana de lo estimado. Dentro del margen ya aprobado, no amerita nueva visita.
  - **Pendiente:** monopendiente, un lado ~5–8 cm más alto sobre el tramo de 1.86 m (~3–5°), inclinada AWAY de la baranda y de la chimenea — se mantiene, más importante ahora sin cubierta rígida
  - **Durmiente superior:** el borde superior de cada muro es el borde ORIGINAL sin cortar de la pieza superior del panel — conserva el marco de fábrica intacto, a diferencia del empalme a media altura. Listón continuo (mismo perfil 38×63 mm de la especificación de bloqueo) atornillado a ese marco existente en cada muro largo, recibe los cabios
  - **Sello del punto de falla real (advertido en DOC-0020, sigue aplicando):** tapajuntas (metal o PVC) que cubre el borde superior de cada muro — sobre el forro PVC y el panel — y se mete BAJO el borde de la lona del techo, para que el agua escurra hacia el techo y nunca detrás del tapajuntas hacia la cara del panel. **Aún más importante sin cubierta rígida** — la lona sola tiene más riesgo de filtración en el borde que una teja rígida bien traslapada.
  - **Fijación de la lona (techo y muros):** prensado continuo en los bordes, no ojillos; nunca fijada a la baranda ni a la chimenea (regla ya existente en DOC-0020, sigue aplicando aunque la lona cambió de rol). Orientar la lona de forma que el traslape natural dirija el agua hacia afuera, no hacia las costuras.
- [ ] **Drenaje de condensado — parcialmente especificado 2026-08-29.** Dos rutas de agua distintas: (1) condensación en la cara inferior de la teja de PVC del techo — cae dentro de la cámara ventilada, fuera de la envolvente de la cámara, ya resuelto por el diseño de techo; (2) condensado del piso de la cámara (humedad al abrir puertas CLOUDLAB, deriva de nebulización) — **sin resolver**. Inventario actual: solo 2 tapetes de caucho de 50×50 cm (0.5 m², `metadata/materials.yaml`), muy por debajo de los ~7.9 m² de huella. Se requiere forro de piso impermeable adicional (más tapetes de caucho o membrana pintable) inclinado hacia el desagüe existente de la terraza. **Bloqueado por la ubicación del desagüe existente, sin confirmar** (`home_rnd_lab.md` ya lo marca pendiente).
- [ ] **Ruta eléctrica — especificado 2026-08-29.** Carga modesta: 2× CLOUDLINE H4, CloudForge T7, ESP32 + sensores. Un solo circuito dedicado con protección diferencial (RCD/GFCI). Cableado dentro de las cavidades a lo largo del encuentro muro-piso, evitando la capa reflectiva (sin engrapar sobre ella, regla ya establecida) y rodeando los listones de bloqueo de los empalmes. Caja de conexión y controlador ESP32 ubicados en el **buffer** (menor exposición a HR), no en la cámara húmeda. Tomas y prensaestopas con clasificación IP dentro de la cámara.
- [x] **Ruta de transferencia de material — mapeada 2026-08-29.** Contenedor cerrado: garaje/laboratorio → escalera → puerta exterior (buffer) → cambio de guantes/EPP → cortina de PVC → cámara. Encadena especificaciones ya hechas (puerta exterior, cortina interior) en una secuencia única, sin abrir nuevas decisiones.
- [ ] **Holgura de puerta de CLOUDLAB — parcialmente verificado 2026-08-29.** La puerta es una solapa de cremallera de tela (no puerta rígida con bisagra); AC Infinity no publica una holgura frontal mínima para este modelo. El pasillo de 1.0 m supera la guía general de la comunidad de cultivo (60–90 cm), pero esto **no es una cifra de fabricante verificada** — es una prueba física pendiente: confirmar con la primera tienda en posición, antes de fijar el lugar definitivo de la segunda.
- [ ] **Ubicación exacta en la terraza irregular — un criterio resuelto 2026-08-29, sigue sin poder cerrarse en remoto.** Criterios que debe cumplir el lugar elegido: (1) despejado de la baranda; (2) despejado de la chimenea — ubicación exacta aún sin medir; (3) ~~sobre zona estructuralmente aprobada~~ **RESUELTO — el ingeniero confirmó que no hay líneas estructurales específicas requeridas, toda el área de la huella está adecuadamente soportada (ver DOC-0104 §7)**; (4) la pendiente del techo debe drenar lejos de la baranda Y de la chimenea a la vez — la orientación de la caseta depende de dónde esté realmente la chimenea, así que este punto no se puede fijar hasta medirla. La geometría de `home_rnd_lab.md` (cuadrilátero irregular, ~21.9 m² brutos) no tiene todavía un punto fijo asignado para esta huella de ~1.66 × 4.24 m — **el único criterio pendiente ahora es la medición de la chimenea**, ya incluida en `caseta_compacta_site_visit_checklist.md` (DOC-0105).

## 🟢 Puede esperar hasta después de construir la cámara

- [ ] Carga de viento sobre el techo de lona a nivel de terraza (vale la pena revisar, no bloquea el inicio).
- [ ] Permiso de administración/copropiedad para estructura en terraza, si aplica al edificio.
- [ ] Setpoints y lógica de control — la arquitectura ESP32/Home Assistant ya existe y *L. edodes* ya es la especie establecida (`FARM_BRAIN.md`); esta cámara solo necesita conectarse a esa arquitectura una vez construida.

---

# Plan de aislamiento (sin EPS disponible)

**Confianza: BAJA — pendiente de validación térmica.**

Sistema de barrera radiante, no relleno de volumen:

```
Tablero exterior
  ↓
Espacio de aire (aquí vive el valor aislante real)
  ↓
Mylar / manta isotérmica — cara reflectiva hacia el espacio de aire
  ↓
Manta EVA 2 mm — barrera de humedad + amortiguación de vibración
  ↓
Tablero interior + forro lavable
```

- **Mylar (6 láminas, 1.2 × 1.8 m = 12.96 m²):** apiladas 2 en vertical = 2.40 m, coincide casi exacto con la altura del muro. Cubre 3 de 6 posiciones a altura completa.
- **Mantas isotérmicas (6 unidades, 210×160 cm confirmado):** cubren las 3 posiciones restantes exactamente — 2 por posición, orientadas 1.60 m vertical / 2.10 m horizontal, traslape ~40 cm. **Las 6 posiciones de muro quedan cubiertas con material 100% en inventario.**
- **Thermolon 15 mm (3.6 m² en inventario):** cubre solo ~13% del área total; rol complementario, no principal.
- **Manta EVA (rollo, 9.3 m²): comprar 4 rollos, no 3** — el rollo de 110 cm no cubre el ancho de 1.86 m de una posición en una sola tira, así que el corte real deja 3 rollos sin margen de maniobra.

**Manipulación — Mylar y mantas se rasgan con facilidad:**
- No engrapar directamente sobre la lámina; sujetar el borde entre listón y tablero.
- Cortar y posicionar antes de cerrar la cavidad, sin estirar sobre marco ya armado.
- Cubrir con manta EVA inmediatamente después de colocar cada lámina reflectiva.
- Traslapar costuras 5–10 cm, no unir a tope.
- Tratar como aporte complementario (barrera radiante parcial), no como sistema sellado. El control real de humedad recae en la manta EVA y el forro interior lavable.

---

# Equipos existentes asignados (sin compra nueva)

| Equipo | Rol en esta cámara |
|---|---|
| 2× AC Infinity CLOUDLINE H4 | Intake (extremo cámara) / extracción (extremo buffer, sin retorno a vivienda) |
| AC Infinity CloudForge T7 (15 L) | Humidificación central, dimensionado para volumen combinado de las dos tiendas |
| SHT3x / SHT45 | Un sensor por tienda + uno en el pasillo central |

---

# Referencias

- `home_rnd_lab.md` (DOC-0020) — geometría de terraza, principios de envolvente, advertencia sobre filtración lona-panel.
- `metadata/materials.yaml` — Thermolon, Mylar, mantas isotérmicas, EVA, paneles recuperados.
- `05_equipment/equipment_prototyping_report.md` — especificaciones de CLOUDLAB 844, H4, T7, sensores.
- `FARM_BRAIN.md` — especie prioritaria (*L. edodes*), arquitectura de control ESP32/Home Assistant.
- Canvas de diseño publicado: `Main.dc.html`, `ZoneCrossSection.dc.html`, `canvas.json` (este directorio).
