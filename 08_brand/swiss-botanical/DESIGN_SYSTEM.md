# Manual del Sistema de Diseño: Swiss Botanical
**FOSV3 / DS-2026 / FOS · Setas de la Peña**
*Versión:* 1.1.0 · *Fecha:* Septiembre 2026 · *Estado:* Prototipo aislado para revisión; no sustituye el canon de producción.

---

## 1. Principios Rectores de Diseño

### 1.1. Alimento Cultivado sobre Archivo Frío
Swiss Botanical rompe la estética de laboratorio impenetrable. La marca comunica apetito, frescura, técnica culinaria y respeto por el reino Fungi. La trazabilidad y la biología no son barreras técnicas, sino garantías de calidad disponibles para quien desee profundizar.

### 1.2. Asimetría Suiza Controlada
Se prohíben las cuadrículas simétricas monótonas de e-commerce genérico (filas de tres tarjetas idénticas). Las pantallas se organizan como pliegos de imprenta suiza: titulares de gran tamaño con pesos contrastados, columnas de lectura cómodas, márgenes generosos y módulos visuales que alternan escala.

### 1.3. Honestidad de Materiales (Sin Efectos Cosméticos)
- **Prohibido:** Degradados decorativos de fondo, sombras flotantes borrosas (`box-shadow: 0 20px 40px ...`), bordes redondeados tipo app genérica (`border-radius: 24px`) y píldoras flotantes sin función semántica.
- **Permitido y Mandatorio:** Fondos planos de papel marfil, filetes definidos de 1px a 2px, esquinas casi rectas (`2px` a `4px`) y retroalimentación táctil de pulsación mecánica (`translateY(1px)`).

---

## 1.4. Arquitectura de Cuatro Modos: El Sistema como Herramienta de Decisión

Swiss Botanical formaliza cuatro modos de interfaz y estructura, preservando el rigor del archivo y agregando la capa comercial y culinaria activa:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────────────┐
│     ARCHIVE     │      FIELD      │     CONTROL     │     CULINARY MARKET     │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────────┤
│ • Taxonomía     │ • Cultivo       │ • Lotes         │ • Elección & Sabor      │
│ • Territorio    │ • Sustratos     │ • Fechas y corte│ • Técnica de Cocina     │
│ • Herbario      │ • Inoculación   │ • Pesos         │ • Formato y Gramaje     │
│ • Memoria       │ • Observación   │ • Telemetría    │ • Disponibilidad        │
│ • Pliegos print │ • Protocolos SOP│ • Trazabilidad  │ • Acción de Compra      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘
```

### La Secuencia Cognitiva del Modo Culinary Market (7 Pasos)
El modo comercial no es un catálogo decorativo, sino una **herramienta estructurada de decisión gastronómica**:

1. **Qué es:** Identidad botánica, nombre común y especie taxonómica (*Lentinula edodes*).
2. **A qué sabe:** Perfil organoléptico contrastado (umami de roble, sotobosque andino, avellana).
3. **Cómo se usa:** Técnica gastronómica probada (fuego vivo, sartén de hierro, sellado sin hervir en su jugo; conservación en bolsa transpirable).
4. **Qué formato existe:** Opciones de empaque según usuario (250g Cata Hogar, 500g Cesta Cocina, 1.5kg Caja Chef).
5. **Disponibilidad:** Estado en tiempo real del ciclo biológico (Cosecha activa del día, corte al alba).
6. **Origen:** Anclaje territorial objetivo (Tenjo, Cundinamarca, 2.592 msnm, Lote `SDP-26-SH-04`).
7. **Próximo paso:** Llamada a la acción clara (añadir al pedido, cotizar para hostelería o profundizar en el cuaderno editorial).

---

## 1.5. Los Dos Recorridos de Usuario: Hogar vs. Chef / HORECA

Swiss Botanical no divide la marca en dos entidades visuales separadas. En su lugar, organiza **dos entradas y dos jerarquías de información** dentro del mismo Design System, respondiendo a las necesidades probadas de cada segmento:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DOS RECORRIDOS EN EL MISMO DESIGN SYSTEM                    │
├──────────────────────────────────────┬──────────────────────────────────────┤
│    COCINA EN CASA (HOGAR / RETAIL)   │    CHEF / PROFESIONAL (HORECA)       │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 1. Qué es (Identidad y carpóforo)    │ 1. Ficha técnica (Humedad y merma)   │
│ 2. Cómo lo cocino (Tres pautas)      │ 2. Calibre (4-6 cm, pie recortado)   │
│ 3. Cuánto necesito (200g / 400g)     │ 3. Volumen (Cajas 1kg, 3kg, 5kg)     │
│ 4. Cómo lo conservo (2-4°C en kraft) │ 4. Regularidad (Suministro anual)    │
│ 5. Está disponible (Cosecha activa)  │ 5. Entrega (Cadena de frío y rutas)  │
│                                      │ 6. Contacto (Muestras y lista B2B)   │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 1.5.1. Recorrido Hogar (Cocina Doméstica)
- **Foco:** Eliminar el miedo a arruinar el producto o lavarlo mal; evitar el desperdicio por compra excesiva.
- **Pautas de sartén obligatorias en PDP:**
  1. *Limpieza en seco:* Nunca lavar con agua; limpiar con paño seco o cepillo suave.
  2. *Fuego medio-alto:* Dorar 3-4 minutos sin mover para caramelizar y no hervir en su jugo.
  3. *Terminación:* Sal marina, mantequilla o grasa vegetal y hierbas frescas al final.
- **Formatos:** 200 g (cena 1-2 personas) y 400 g (familiar 3-4 porciones).
- **Conservación:** 2°C a 4°C en bolsa transpirable (vida útil real: 5 a 7 días).

### 1.5.2. Recorrido Chef / HORECA (Profesionales)
- **Foco:** Estandarización de mise en place, cálculo de merma y seguridad de abastecimiento para cartas de temporada.
- **Parámetros técnicos visibles:**
  - Diámetro de sombrero (4 a 6 cm uniforme) y pie recortado a ras.
  - Humedad residual controlada (86%–88%, sin exceso de agua libre).
  - Merma en cocción a fuego vivo < 12%.
  - Empaques en cajas ventiladas de 1 kg, 3 kg y 5 kg.
  - Despachos programados martes y viernes en vehículo refrigerado a Bogotá y Sabana Centro.
  - Canal de atención técnica directa vía chefs@setasdelapena.co.

---

## 1.6. Matriz de Aplicación de Imagen y Dirección Fotográfica

Para evitar la confusión del cliente con grabados abstractos, las imágenes se clasifican rígidamente por función:

| Estilo de Imagen | Función Principal | Canal Primario en DS |
| --- | --- | --- |
| **Fotografía de Producto Fresco (Estudio)** | Verificación de compra, color real, láminas limpias | Ficha comercial (PDP), carrito |
| **Fotografía Culinaria en Uso** | Generación de apetito, escala en plato, método de sartén | Portada comercial, cuaderno editorial |
| **Fotografía Documental del Cultivo** | Trazabilidad real, escala humana e infraestructura | Cuaderno de lote, página de origen |
| **Ilustración Botánica Didáctica** | Identificación morfológica, pedagogía de corte | Empaque, reverso de ficha |
| **Grabado Científico Histórico** | Sello de rigor identitario, marcas de agua y acento | Folios institucionales, cintas de cierre |

---

### 1.7. Nombres Sencillos y Verificación Culinaria Honesta

Para preservar la honestidad agronómica y culinaria de Setas de la Peña, el sistema impone el uso **estricto de nombres comunes sencillos y directos**, eliminando por completo nombres poéticos o editoriales (como «Umami Roble», «Pizarra Bruma», «Ocre Dorado», «Arcilla Coral» o «Shiitake de Montaña»).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   NOMENCLATURA SENCILLA Y VERIFICACIÓN                      │
├─────────────────────────┬─────────────────────────┬─────────────────────────┤
│ 1. NOMBRE SENCILLO      │ 2. PERFIL SENSORIAL     │ 3. USO RECOMENDADO      │
│    (Común + Científico) │    VALIDADO (Cata Real) │    COMPROBADO (Técnica) │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Shiitake              │ • Comprobado o          │ • Comprobado o          │
│ • Orellana              │   Por confirmar         │   Por confirmar         │
│ • Melena de León        │ • Exige testeo empírico │ • Exige validación en   │
│ • Orellana Rosada       │   en cocina             │   sartén/fuego real     │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### Reglas de Aplicación
1. **Nombres directos y comprensibles:** Se utilizan únicamente los nombres comunes reconocidos (*Shiitake*, *Orellana*, *Melena de León*, *Orellana Rosada*) junto a su binomio botánico (*Lentinula edodes*, *Pleurotus ostreatus*, *Hericium erinaceus*, *Pleurotus djamor*). No se usan epítetos líricos, metáforas de madera ni adornos de montaña.
2. **La Ficha de Producto desglosa con honestidad:**
   - *Nombre común:* Nombre directo y especie botánica.
   - *Perfil sensorial validado:* Notas comprobadas empíricamente (ej. *textura firme y notas tostadas en salteado*) o explícitamente marcado como `[Por confirmar]`.
   - *Uso recomendado comprobado:* Técnica contrastada (ej. *salteado en sartén de hierro a fuego vivo*) o marcado como `[Por confirmar]` para otras preparaciones.
3. **Cero promesas no respaldadas:** No se inventan notas organolépticas ni se convierten conjeturas en afirmaciones culinarias.

---

## 2. Tipografía: La Trinidad Tipográfica

El sistema utiliza tres familias tipográficas vendorizadas en local (`assets/fonts/`):

```
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│       GAYA PATCHED        │       IBM PLEX SANS       │       IBM PLEX MONO       │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ • Firma de identidad      │ • Interfaz comercial      │ • Lotes (SDP-26-SH-04)    │
│ • Titulares de gran escala│ • Lectura continua        │ • Fechas y horas de corte │
│ • Nombre de especie       │ • Botones de compra       │ • Medidas (2.592 m, 70%)  │
│ • Monograma editorial     │ • Guías de cocción        │ • Folios y notas marginal │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

### Reglas de Corrección Tipográfica
1. **Gaya Patched Italic (Uso Controlado y Notas Sensoriales):**
   - **Usos autorizados:**
     a) Nomenclatura taxonómica binominal obligatoria (*Lentinula edodes*, *Pleurotus ostreatus*).
     b) Citas culinarias y editoriales breves (máx. 3 líneas).
     c) **Notas sensoriales muy breves** (ej. *profundo, terroso, limpio*).
   - **Límites normativos estrictos:**
     - **Máximo tres líneas:** Prohibida para párrafos largos, instrucciones o recetas continuas.
     - **Perfil sensorial validado:** Solo se aplica cuando la cata y notas organolépticas han sido comprobadas en cocina o laboratorio.
     - **Cero invención gastronómica:** Queda terminantemente prohibido usar Gaya Italic para simular una voz poética o gastronómica si el dato no existe empíricamente. Se restringe rigurosamente a la nomenclatura taxonómica binominal obligatoria (*Lentinula edodes*, *Pleurotus ostreatus*) y a citas editoriales breves. Queda terminantemente prohibido su uso en párrafos continuos de instrucciones o lectura.
2. **Piso de lectura continua:** El texto continuo en IBM Plex Sans tiene un piso de `16px` a `17px` con interlineado generoso (`1.5` a `1.65`) para garantizar confort visual prolongado.

---

## 3. Paleta de Color: Código Botánico-Organoléptico

La paleta combina papel marfil y tinta carbón con acentos que identifican especies. Los nombres cromáticos son referencias visuales, no descripciones sensoriales ni afirmaciones de cultivo.

### 3.1. Sustratos y Tintas
- `--sb-paper-0: #F7F4EC;` (Fondo de página, marfil cálido)
- `--sb-paper-1: #EFEBE0;` (Paneles, tarjetas y módulos)
- `--sb-paper-2: #E5DFD0;` (Pozos rehundidos, bandas alternas)
- `--sb-paper-3: #DCD5C2;` (Estados activos y prensados)
- `--sb-ink-0: #1E1D19;` (Texto principal de alta lectura · Contraste 15.35:1)
- `--sb-ink-1: #3C392F;` (Texto secundario · Contraste 10.51:1)
- `--sb-ink-2: #6B6759;` (Metadatos y leyendas · Contraste 5.15:1, cumple WCAG AA)
- `--sb-ink-inverse: #F7F4EC;` (Texto sobre fondos oscuros o acentos sólidos)

### 3.2. Especies y Acentos Cromáticos
- **Shiitake (*Lentinula edodes*):** `--sb-accent-shiitake: #6E472D;` y `--sb-accent-shiitake-deep: #5A3725;` (Marrón castaño de sombrero fresco).
- **Orellana (*Pleurotus ostreatus*):** `--sb-accent-orellana: #5E7080;` (Gris pizarra de láminas).
- **Melena de León (*Hericium erinaceus*):** `--sb-accent-melena: #9D6F28;` (Ocre tostado · Contraste 3.83:1).
- **Orellana Rosada (*Pleurotus djamor*):** `--sb-accent-rosa: #A85C32;` (Coral salmón de cuerpo joven · Contraste 4.09:1).

### 3.3. Filetes y Bordes
- `--sb-line-hairline: #988C6C;` (3.03:1 en papel, cumple WCAG 1.4.11 no-textual).
- `--sb-line-strong: #8C7F5B;` (3.60:1 en papel).
- `--sb-line-heavy: #1E1D19;` (15.35:1 en papel).

### Texto en etiquetas pequeñas
Las etiquetas de 12,5 px requieren 4,5:1. Usar `--sb-accent-orellana-text` (#465968), `--sb-accent-melena-text` (#79531C) y `--sb-accent-rosa-text` (#854523) sobre sus tintes correspondientes: 5,83:1, 5,92:1 y 6,04:1. Los acentos originales se conservan para bordes e identidad. El ocre de advertencia y `--sb-ink-3` no deben usarse para texto informativo.

---

## 4. Componentes y Pautas de Interacción

### 4.1. Estados de confianza y disponibilidad

Todo dato comercial, culinario o de trazabilidad debe llevar un estado legible. El color es un refuerzo y nunca el único indicador.

| Estado | Uso | Ejemplo de copy |
|---|---|---|
| `verified` | Dato revisado con una fuente o registro | `Origen verificado` |
| `available` | Producto o formato confirmado para consulta | `Disponible` |
| `pending` | Dato aún no publicado o por confirmar | `Precio por confirmar` |
| `unavailable` | Producto o formato no disponible | `Agotado por ahora` |
| `development` | Módulo editorial o comercial en preparación | `Ficha en desarrollo` |
| `editorial` | Referencia histórica, crónica o cuaderno de archivo | `Crónica de cosecha` |

Clases: `.sb-badge.sb-status--verified`, `.sb-status--available`, `.sb-status--pending`, `.sb-status--unavailable`, `.sb-status--development` y `.sb-status--editorial`. No se deben usar para afirmar cosecha, conservación, sabor o precio si el dato no está validado.

### 4.2. Selección de formato
La ficha ofrece radios nativos con formatos ilustrativos: 250 g, 500 g y 1,5 kg. El botón muestra un resumen local accesible. No hay reserva ni compra conectada. El antiguo selector Hogar/Chef conserva estilos como referencia, pero no se presenta como control operativo.

### 4.3. Cápsula de Trazabilidad Progresiva (`.sb-traceability-capsule`)
Presenta un acceso al registro de origen. Solo muestra identificador, procedencia y fecha cuando existen datos verificables. La muestra navega a `traceability.html`, que declara los campos pendientes y no representa un lote operativo.

### 4.4. Visor Botánico de Producto
Marco editorial con ilustración de especie y cartela. La portada permite filtrar las especies; el visor de producto contiene una imagen fija. En móvil, el nombre y la selección preceden al visor.

### 4.5. Botones con Tacto de Prensa (`.sb-btn`)
Los botones tienen un diseño plano de alta legibilidad y sufren un microdesplazamiento de 1px hacia abajo en `:active` (`--sb-press-shift`), simulando la pulsación de un tipo móvil de imprenta.
- **Variantes:** Primario (`.sb-btn--primary`), Acento (`.sb-btn--accent`), Secundario (`.sb-btn--secondary`) y Sutil (`.sb-btn--subtle`).
- **Tamaños:** Pequeño (`.sb-btn--sm`), Regular y Grande (`.sb-btn--lg`).
- **Estados:** Reposo, `:hover`, `:active` (prensado físico), `:focus-visible` (anillo de foco accesible) y `:disabled` / `[aria-disabled="true"]` / `.sb-btn--disabled` (opacidad al 50%, anulación de pulsación física y cursor inactivo).

### 4.6. Pliego Interactivo de Componentes y Gobernanza de Datos (`components.html`)
El archivo `mockups/components.html` funciona como catálogo integral y banco de pruebas accesible de todos los componentes y estados del sistema:
1. **Selector de Audiencia Accesible (`.sb-segment-switch`):**
   - Implementación semántica con `role="tablist"`, `role="tab"`, `aria-selected` y paneles `role="tabpanel"`.
   - Soporta navegación por teclado mediante flechas (`ArrowLeft` / `ArrowRight`).
   - Diferencia la jerarquía informativa para **Hogar** (pautas de sartén en seco, porciones 200g/400g, conservación en frío) y **Chef / HORECA** (calibre uniforme 4-6cm, estipe a ras, humedad 86-88%, merma en sartén <12%).
2. **Tablas de Merma y Calculadora de Rendimiento:**
   - Tabla técnica `.sb-specs-table` documentando mermas empíricas observadas según técnica de calor.
   - Calculadora interactiva con **tasa porcentual editable por el usuario** y campo de entrada en gramos.
   - **Rótulo obligatorio de transparencia:** Toda salida proyectada incluye la leyenda normativa: *«Estimación ilustrativa calculada; no constituye una especificación garantizada de lote»*.
3. **Cajas Epistémicas de Procedencia (`.sb-epistemic-card`):**
   - Estructura visual para distinguir con nitidez los tres niveles de conocimiento:
     - *Nivel 1 (Hecho Medido):* Datos validados en Tenjo con sensores o balanzas (`.sb-status--verified`).
     - *Nivel 2 (Parámetro en Desarrollo):* Valores preliminares o en estudio (`.sb-status--pending`).
     - *Nivel 3 (Memoria Editorial):* Crónica, contexto cultural y grabados históricos (`.sb-status--editorial`).
   - **Criterio Rector:** El pliego demuestra el sistema y su rigor de datos; no convierte hipótesis culinarias, agronómicas o logísticas en especificaciones de producto.

---

## 5. Cinemática Editorial Pausada

- **Tiempos de transición:** 400ms a 500ms (`--sb-duration-editorial: 450ms;`).
- **Curva de aceleración:** `cubic-bezier(0.22, 1, 0.36, 1)` (desaceleración suave y elegante).
- **Accesibilidad:** En entornos con `@media (prefers-reduced-motion: reduce)`, las transiciones se desactivan instantáneamente (`0.01ms`).
