# Fuentes, Diagnóstico y Referencias: Swiss Botanical
**Síntesis de Sistemas y Decodificación de Referencias Externas**
*Setas de la Peña · 2026*

---

## 1. Diagnóstico de los Tres Sistemas del Repositorio

Swiss Botanical sintetiza tres esfuerzos previos en el repositorio canónico sin mezclar directamente sus hojas de estilo:

### 1.1. FOS v3 (`docs/brand/DESIGN_SYSTEM_CANONICAL.md`)
- **Aporte:** El rigor taxonómico, la filosofía *de la parcela a la mesa*, la ausencia de folclore esotérico o New Age, y la calibración bimodal de color para sustratos físicos y pantallas OLED.
- **Limitación superada:** Estaba fuertemente inclinado hacia la operación técnica interna y la bitácora de cultivo, dejando la experiencia del comprador en segundo plano.

### 1.2. DS-2026 (`08_brand/ds-2026/`)
- **Aporte:** La definición de ocho roles cromáticos primitivos, el packaging físico, los grabados botánicos y el modelo de verificación mediante scripts en Python y Node.js.
- **Limitación superada:** Sus fichas eran estáticas y la interfaz tendía a replicar plantillas rígidas sin la soltura editorial de una publicación viva.

### 1.3. FOS Identity (`08_brand/field-os-identity/`)
- **Aporte:** El catálogo tipográfico local de *Gaya Patched* e *IBM Plex*, tokens CSS ricos y pautas de movimiento.
- **Limitación superada:** Presentaba inversiones jerárquicas ocasionales (sobreuso de Gaya Italic en bloques de texto largo) y un acoplamiento directo con la interfaz de Setas OS.

### 1.4. El Cuarto Modo: Culinary Market
FOS v3 y DS-2026 resolvieron el archivo botánico (Archive), el proceso de campo (Field) y la bitácora de telemetría (Control). Swiss Botanical introduce de forma canónica el cuarto modo: **Culinary Market**, transformando el diseño en una herramienta de decisión para cocineros y clientes mediante la secuencia de 7 pasos:
*Qué es → A qué sabe → Cómo se usa → Qué formato existe → Disponibilidad → Origen → Próximo paso.*

---

## 2. Matriz de Decisiones Arquitectónicas

| Dimensión | Qué se Reutiliza | Qué se Descarta | Qué se Adapta | Decisión Nueva (Swiss Botanical) |
| --- | --- | --- | --- | --- |
| **Tipografía** | Fuentes locales (Gaya, IBM Plex Sans y Mono) | Gaya Italic en texto continuo | Escala de cuerpos a mínimos de 16px/17px | Gaya Black/Bold como titular monumental de impacto comercial |
| **Color** | Sustrato de papel marfil e tinta carbón | Colores genéricos de software | Acentos de FOS a identidades por especie | Paleta botánico-organoléptica (Shiitake Roble `#6E472D`, Melena Ocre `#9D6F28`) |
| **Estructura** | Concepto de cuaderno botánico | Cuadrículas repetitivas de 3 tarjetas | Fichas técnicas de laboratorio | Portada comercial con retícula asimétrica y módulo de selección por uso |
| **Trazabilidad** | Datos de altitud, presión y lote | Métricas crudas en el primer pliegue | Desglose biológico a lenguaje claro | Cápsula de Trazabilidad Progresiva en Home y Producto |
| **Movimiento** | Filosofía sobria sin efectos 3D | Animaciones instantáneas secas | Feedback de clic | Cinemática editorial pausada (400-500ms) |

---

## 3. Análisis de Referencias Externas

Se analizaron diez casos internacionales de diseño editorial, tipografía y packaging contemporáneo. No se copiaron sus estilos visuales particulares, sino que se extrajeron **decisiones transferibles de diseño**:

1. **FLOR ([Fonts In Use 57468](https://fontsinuse.com/uses/57468/flor)):**
   - *Decisión transferible:* El uso de la serifa humanista como ancla orgánica en empaque de alimentos limpios, combinada con palo seco técnico para el gramaje y lote.
2. **Goldi ([Fonts In Use 69728](https://fontsinuse.com/uses/69728/goldi)):**
   - *Decisión transferible:* Asimetría generosa en la composición tipográfica; el producto se presenta con calma y espacio blanco abundante sin llenar cada rincón de adornos.
3. **God Soppjakt! ([Fonts In Use 61619](https://fontsinuse.com/uses/61619/god-soppjakt-by-mette-alstad)):**
   - *Decisión transferible:* El grabado y la ilustración micológica presentados como un sistema de serie coleccionable, no como mera estampa nostálgica.
4. **RootSeller ([Fonts In Use 60562](https://fontsinuse.com/uses/60562/rootseller-website)):**
   - *Decisión transferible:* Enfoque comercial donde la primera lectura explica claramente qué es el producto, cómo se cultiva y cómo ordenarlo sin perder identidad campesina de alta gama.
5. **Taboocha ([Fonts In Use 76878](https://fontsinuse.com/uses/76878/taboocha-kombucha)):**
   - *Decisión transferible:* Codificación cromática vibrante pero disciplinada para diferenciar perfiles organolépticos entre variedades hermanas.
6. **Qatsi Tea ([Fonts In Use 76757](https://fontsinuse.com/uses/76757/qatsi-tea)):**
   - *Decisión transferible:* La información de origen, altitud y cosecha expuesta como un sello notarial sobrio que valida la calidad botánica del lote.
7. **Plant Good Seed ([Fonts In Use 74512](https://fontsinuse.com/uses/74512/plant-good-seed)):**
   - *Decisión transferible:* Fichas prácticas que enseñan a conservar, manipular y preparar el producto inmediatamente.
8. **Tempus Olive Oil ([Fonts In Use 71574](https://fontsinuse.com/uses/71574/tempus-olive-oil)):**
   - *Decisión transferible:* Tono sereno, culto y sobrio. La excelencia agrícola se demuestra con datos de extracción y suelo, no con superlativos publicitarios.
9. **BESIDE Magazine, Issue 16 ([Fonts In Use 78927](https://fontsinuse.com/uses/78927/beside-magazine-issue-16)):**
   - *Decisión transferible:* Ritmo de maquetación editorial con marginalia, notas técnicas laterales y letras capitulares bien proporcionadas.
10. **Gaya en Fonts In Use ([Typefaces 167778](https://fontsinuse.com/typefaces/167778/gaya)):**
    - *Decisión transferible:* Tratamiento de Gaya como tipografía de firma y carácter botánico, complementada por la neutralidad precisa de IBM Plex.

---

## 4. Síntesis de la Investigación Externa: El Taller Botánico Culinario

La dirección de Swiss Botanical adopta el concepto del **«Taller Botánico Culinario»**: abandona la retórica de biblioteca mística o de archivo intocable y se comporta como un obrador contemporáneo de alimentos vivos.

### 4.1. Análisis de los 8 Casos Clave de Referencia
1. **Goldi (Australia, c. 2022-2025):** Uso pionero de Gaya Italic en retail gastronómico cotidiano. Demuestra que Gaya aporta calidez de despensa cuando se combina con envases utilitarios.
2. **Plant Good Seed (EE. UU., 2024-2026):** Catálogo agrícola con Exchange y Mallory. Disciplina para modular datos biológicos complejos sin sobrecargar al usuario.
3. **Tempus Olive Oil (Italia/Reino Unido, 2024):** Intersección entre retícula suiza y trazabilidad. El fechado de cosecha como argumento primario de calidad.
4. **Qatsi Tea (2025-2026):** Fichas técnicas organolépticas en tipografía monoespaciada (altitud, temperatura, notas de cata) integradas al packaging comercial.
5. **BESIDE Magazine (Canadá, Edición 16, 2026):** Ritmo editorial reposado con silencios, amplios márgenes y citas destacadas para el Cuaderno Editorial.
6. **Noma Projects (Dinamarca, 2022-2026):** Estructura de ficha de producto pedagógica: *«¿Qué es?», «¿A qué sabe?», «¿Cómo se usa en casa?»*.
7. **Smallhold (EE. UU., 2020-2025):** Hongos frescos listos para cocinar: educación en empaque sobre almacenamiento en frío y salteado en sartén sin agua.
8. **Materia / Mucho Colombia (Colombia, 2021-2025):** Expresión territorial sobria de la sabana y montaña andina sin recurrir al folclorismo visual ni al exotismo.

### 4.2. Correcciones Factuales y Ética Agronómica
- **Eliminación estricta de aserciones no verificadas:** Se descartan menciones a sustratos de roble silvestre de la Peña de Juaica, captación de agua de niebla o supuestos aumentos de umami por altitud.
- **Veracidad en etiquetado:** Se comunica el clima frío de la Sabana de Bogotá (Tenjo), el control ambiental en salas de fructificación y el uso de subproductos agrícolas locales formulados biológicamente.
