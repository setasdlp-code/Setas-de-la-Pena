# Auditoría de marca — Setas de la Peña (comercial)

**Fecha:** 29 de octubre de 2026
**Alcance:** marca comercial: firma, piezas pequeñas, tipografía, color, imagen, voz y web pública (`index.html`, recetas, especies, metadatos).
**Referencias vigentes:** [Identidad comercial v1.1](../brand-guidelines.md) · [DS-2026](../../08_brand/ds-2026/DESIGN_SYSTEM.md) · [Guía de voz v2.2](../../.claude/brand-voice-guidelines.md).
**Antecedente:** [Auditoría de Setas OS, agosto 2026](./setas-os-brand-audit-2026-08.md), que trató el producto operativo. Esta revisa la cara comercial.
**Hoja de conceptos:** [brand-audit-2026-10-concepts.html](./brand-audit-2026-10-concepts.html).

Este documento no modifica la guía vigente. Cada hallazgo indica su estado: **regla confirmada** (la guía ya lo decide y la pieza no cumple), **propuesta** (requiere elección) o **pregunta abierta**.

## Dictamen

**La estrategia está resuelta; la ejecución tiene cuatro fugas.**

El posicionamiento («Del micelio a la mesa», «Hongos para cocinar con criterio»), la disciplina de afirmaciones y el sistema DS-2026 (papel, tinta, musgo, Gaya + IBM Plex, superficies planas) son específicos y coherentes. La web pública los aplica bien en estructura y tono visual. No hace falta otra identidad.

Las fugas son:

1. La tipografía de la firma es una versión de prueba parcheada de Gaya, y la exportación pública la distribuye.
2. La marca no tiene forma a tamaño pequeño: el favicon es un icono genérico y el icono de app es un grabado ilegible a 48 px.
3. Hay dos firmas en circulación (la de julio, en minúsculas, y la de DS-2026, en mayúscula inicial).
4. La web y los metadatos contradicen la guía de voz vigente (tuteo, descriptor operativo, «Valle de Tenjo»).

| Dimensión | Estado | Lectura |
|---|---|---|
| Posicionamiento y mensajes | Sólido | Frase, descriptor y titular jerarquizados; afirmaciones gobernadas por evidencia. |
| Sistema visual (DS-2026) | Sólido | Tokens con rol, contraste auditado, planitud coherente. |
| Firma | Irregular | Dos versiones vivas; licencia sin resolver. |
| Escala pequeña | Ausente | Sin favicon, avatar ni sello propio. |
| Imagen | Aceptable | Tres registros (grabado mono, lámina a color, gouache); falta una regla que diga cuál va dónde. |
| Voz en la web | Desviada | Unos 30 casos de segunda persona en páginas públicas tras la decisión del 23 oct. |
| Gobierno de fuentes | Disperso | La KB, que el MCP sirve como fuente de verdad, conserva la identidad de julio. |

## Lo que debe preservarse

- **La jerarquía de mensajes** de la guía v1.1 §1: frase, descriptor, titular, firma territorial y expresión de oficio, cada uno con su lugar.
- **La política de afirmaciones**: una ilustración no prueba una cosecha, y los precios y la disponibilidad se marcan como pendientes. Pocas marcas pequeñas lo tienen, y protege ante chefs.
- **La gramática lámina → nota → plato** (grabado para reconocer, gouache para imaginar).
- **DS-2026 como única entrada comercial** (`market.css`) y la paleta papel/tinta/musgo con coral puntual.
- **La regla «no hay isotipo que sustituya el nombre».** Las propuestas de abajo la respetan: el sello solo aparece donde el nombre no cabe.

## Hallazgos

> **Actualización 30 oct 2026:** P1-2, P1-3, P2-1 y P2-2 quedan aplicados. Se pasaron unos 600 imperativos y formas de segunda persona a infinitivo o a frases centradas en el producto en las páginas públicas. También se actualizaron el título, las descripciones y la firma territorial, y se reescribió `knowledge_base/08_brand/identity.md`. P0-1, P0-2, P1-1, P2-3 y P2-4 siguen pendientes de decisión.


### P0-1 · La firma depende de una Gaya de prueba parcheada, y se publica

- **Evidencia:** `08_brand/ds-2026/SOURCES.md:134-137` describe `GayaPatched-*` como «un parche local de diacríticos sobre la Gaya de prueba… No se distribuyen fuera del equipo». `tokens/fonts.css:14-17` las carga en todo el sistema. `scripts/export_public_website.py:75-82` convierte las OTF referenciadas a WOFF2 y las incluye en la exportación pública. El JSON-LD de `index.html:23` declara como `logo` público `wordmark-horizontal-moss.svg`, cuyos metadatos dicen «Licencia comercial pendiente de verificación». La guía v1.1 §4 ya lo marca como pendiente.
- **Riesgo:** la ñ, la letra más propia del nombre, sale de un glifo añadido localmente a una fuente de prueba. Una tipografía de prueba modificada y servida en un dominio público es justo lo que las licencias de prueba suelen prohibir. Esto no es una conclusión legal; la licencia concreta no está documentada en el repo. Mitiga que el sitio lleve `X-Robots-Tag: noindex` (`public-headers.txt:5`), pero sigue siendo accesible.
- **Estado:** regla confirmada (la guía exige resolverlo antes de distribuir). La exportación pública ya distribuye.
- **Propuesta:**
  1. Comprar la licencia de escritorio y web de Gaya en su fundición y pedir la ñ o los diacríticos completos en la versión comercial, en lugar del parche.
  2. Mientras tanto, regenerar los seis SVG de firma desde la versión licenciada y servir en la web una alternativa con licencia abierta para titulares, manteniendo la firma como SVG.
  3. Antes de imprimir empaque o registrar marca, decidir si la firma pasa a ser un dibujo propio (logotipo redibujado sobre Gaya, con derechos cedidos). Así deja de depender de una fuente.

### P0-2 · La marca no existe a tamaño pequeño

- **Evidencia:** el favicon (`index.html:26`) es `08_brand/ds-2026/assets/icons/mushroom.svg`, un icono de línea del DS con `stroke-width="1.5"` sobre una retícula de 48. A 16 px el trazo mide unos 0,5 px y el color es `currentColor`, que en la pestaña sale negro, no musgo. La guía lo llama «recurso de interfaz, no símbolo exclusivo». `assets/icon-512.png` e `icon-192.png` son un grabado de la Peña con setas, detallado e ilegible a 48 px. El mínimo de la firma apilada es 120 px (guía §4), y un avatar de WhatsApp o Instagram se ve a 40-110 px.
- **Por qué importa:** para una marca que conversa con chefs por mensajería, el avatar es la superficie que más se ve. Hoy esa superficie no lleva la marca.
- **Estado:** propuesta (requiere elección; la guía no prevé una forma pequeña).
- **Propuesta:** un **sello de escala pequeña** construido desde la firma, que solo aparece donde el nombre no cabe: favicon, avatar, esquina de etiqueta y cinta de empaque. Hay tres conceptos en la hoja de conceptos:
  - **A · Virgulilla.** La tilde de la ñ se dibuja con el perfil de la Peña de Juaica (subida suave y cara de roca abrupta). Es una letra que solo existe en español y está en el nombre. Funciona a 16 px como un único trazo. Es el más propio y el más abstracto, así que necesita aparecer junto al nombre hasta que se reconozca.
  - **B · Sombrero-Peña.** El sombrero de una seta, cuyo borde superior es el perfil de la roca. Se lee de inmediato, pero se acerca a los iconos genéricos de setas.
  - **C · Sello de origen.** Un círculo con «SETAS DE LA PEÑA · TENJO · COLOMBIA» en IBM Plex Mono y A en el centro. Sirve para empaque y etiqueta desde 18 mm. No es para favicon.
  - **Recomendación:** A para el favicon y el avatar, y C (que contiene a A) para el empaque. Esto no es prueba de unicidad marcaria.

### P1-1 · Dos firmas en circulación

- **Evidencia:** la firma vigente (guía §4) es «Setas» en Gaya Bold y «de la Peña» en Gaya Medium, con mayúscula inicial, en `08_brand/ds-2026/brand-kit/assets/wordmark-*.svg` y en la web. En paralelo sigue viva la firma de julio, en minúsculas («setas / de la peña», «de la» en itálica, más ancha y redondeada), con y sin grabado: `assets/logo-primary.png` y `field-os-simulador/setas-os/_standalone_imgs/logo-sdlp.png`, usada en la cabecera de Setas OS (`simulador-app.jsx:2680`, `:13823`). Ahí aparece a 54-60 px de ancho y con `drop-shadow`, que el DS prohíbe.
- **Lectura:** la versión de julio tiene más carácter y probablemente reconocimiento interno. La de DS-2026 es más legible, ya está vectorizada y es la que ve el público. Mantener las dos sin regla diluye ambas.
- **Estado:** pregunta abierta. Opciones:
  - **(a) Recomendada.** Mantener DS-2026 como firma única y retirar la de julio de las piezas comerciales. En Setas OS, sustituirla por la firma DS-2026 o por el sello A, sin sombra.
  - **(b)** Promover la versión en minúsculas a firma principal y regenerar el kit.
  - **(c)** Mantener la de julio solo como pieza ilustrada de portada (lockup con grabado), documentada como tal.

### P1-2 · La web pública contradice la guía de voz v2.2

- **Evidencia:** la regla §3.3 (23 oct) prohíbe el tuteo, el ustedeo y los imperativos dirigidos al lector, y no tiene excepción para los pasos de receta. Casos en páginas públicas:
  - Segunda persona en sentido estricto: `index.html:46` «Conoce las especies, descubre cómo prepararlas y sigue…»; `index.html:102` «También puedes leer…»; `recetas.html:41` «Shiitake, a tu manera»; `restaurantes.html` «también puedes incluirlas»; «si quieres» y «Elige cantidades…» en `recetas-melena.html`.
  - Imperativos de receta: unos 20 casos («Retira el laurel», «Limpia…», «Para guardar lo que sobre, sigue…») en `recetas-melena.html` y `recetas-eryngii.html`.
- **Estado:** regla confirmada. La corrección es mecánica: infinitivo en los pasos («Retirar el laurel y colar») y frases centradas en el producto en el hero. Las recetas están escritas a mano en el HTML, no se generan desde `recipe-data.js`.
- **Pregunta derivada:** confirmar que los pasos de receta van en infinitivo. Es el registro habitual de recetario en español y cumple §3.3.

### P1-3 · Los metadatos venden el cultivo, no la cocina

- **Evidencia:** `index.html:11-12, 19-20` dicen `og:title`/`twitter:title` «Cultivo de hongos en Tenjo» y la descripción «Cultivo por módulos, mediciones y registros del proceso». `<title>` repite «Cultivo de hongos en Tenjo». El segundo párrafo del hero (`index.html:47`) abre con trazabilidad y la FAO. La guía §3 pide no encabezar piezas comerciales con vocabulario técnico. El descriptor confirmado es «Hongos para cocinar con criterio».
- **Por qué importa:** el título y la descripción son lo que aparece al compartir un enlace por WhatsApp. Es el primer contacto de un chef con la marca.
- **Estado:** regla confirmada. Propuesta de texto:
  - `title` / `og:title`: «Setas de la Peña · Hongos para cocinar con criterio»
  - `og:description`: «Especies, recetas y consulta para cocinas desde Tenjo, Cundinamarca. Del micelio a la mesa.»
  - Pasar el párrafo de trazabilidad del hero a la sección de origen.

### P2-1 · El nombre del territorio varía

- **Evidencia:** en los HTML de la raíz aparece «Tenjo, Cundinamarca» 29 veces, «Valle de Tenjo» 17 (incluido el pie de `index.html:106`) y «Sabana de Bogotá» 4. La firma territorial confirmada es «Tenjo · Cundinamarca · Colombia».
- **Estado:** regla confirmada para piezas comerciales. «Sabana de Bogotá» puede quedar como contexto geográfico en prosa, nunca como firma.

### P2-2 · La KB sirve la identidad de julio como fuente de verdad

- **Evidencia:** `knowledge_base/08_brand/identity.md` (revisado el 2026-07-24) propone la paleta `#4A5E3A`/`#C4622D`, Playfair/Cormorant + Inter/DM Sans y JetBrains Mono, el tagline «Cultivadas en la Sabana. Cosechadas con criterio» (hoy histórico según la guía §1) y reparte la identidad visual a «ChatGPT + DALL-E». `CLAUDE.md` define `knowledge_base/` como fuente de verdad, y el MCP `setas` la expone a otros agentes.
- **Riesgo:** cualquier agente que genere una pieza desde la KB reproducirá la identidad anterior.
- **Estado:** regla confirmada. Reescribir `identity.md` como resumen de la guía v1.1 con enlace a ella, o marcarlo `superseded`, y revisar `packaging.md` e `illustration_style.md` con el mismo criterio.

### P2-3 · Tres registros de imagen sin regla de uso

- **Evidencia:** grabado monocromo (hero de `index.html`, iconos de app), lámina naturalista a color (`assets/social/setas-de-la-pena.png`, tarjetas de especie) y gouache culinario (recetas). La guía §6 nombra «grabado micológico» para especie y gouache para cocina, pero no distingue el grabado monocromo de la lámina a color.
- **Estado:** propuesta. Fijar que la **lámina a color** se usa para la especie individual (ficha, tarjeta, social) y el **grabado monocromo** para el territorio y las portadas (la Peña, conjuntos), nunca como icono. El **gouache** queda solo para platos.

### P2-4 · Restos de Field OS en la raíz

- **Evidencia:** `og.png` («FIELD OS · Registro operativo») y `manifest.webmanifest` («Field OS») están en la raíz del sitio. Ninguna página pública los enlaza, así que hoy no son una fuga visible.
- **Estado:** pregunta abierta, de prioridad baja: moverlos bajo `field-os-simulador/` o excluirlos de la exportación pública para que no aparezcan si alguien comparte la raíz.

## Sistema propuesto para cerrar las fugas

Se añade solo lo que falta; el resto de la guía v1.1 no cambia.

| Nivel | Pieza | Uso | Mínimo |
|---|---|---|---|
| 1 · Firma | «Setas de la Peña», horizontal y apilada (DS-2026) | Toda pieza donde el nombre se lee | 180 px / 45 mm (horizontal) · 120 px / 30 mm (apilada) |
| 2 · Sello | Concepto A (virgulilla-Peña) en cuadrado musgo o papel | Favicon, icono de app, avatar, esquina de etiqueta | 16 px / 5 mm |
| 3 · Sello de origen | Concepto C (círculo con texto mono y A al centro) | Empaque, cinta, sello de caja | 18 mm |

**Reglas del sello:**

- Nunca sustituye el nombre en una pieza donde la firma cabe.
- Dos colores: musgo `#2E3B2F` con papel `#FAF8F3`, o tinta sobre papel. Sin coral (el coral no se usa en texto pequeño ni en marcas mínimas).
- Construido sobre una retícula de 16 px, con un trazo de al menos 2 px a 16 px y esquinas rectas, como el DS.

## Plan de acción

| Orden | Acción | Tipo |
|---|---|---|
| 1 | Resolver la licencia de Gaya (compra comercial o redibujo de la firma). Mientras tanto, decidir si la exportación pública sigue sirviendo GayaPatched. | Decisión del responsable |
| 2 | Corregir la voz y los metadatos de la web (P1-2, P1-3, P2-1). | Mecánico, ya decidido |
| 3 | Reescribir `knowledge_base/08_brand/identity.md` (P2-2). | Mecánico, ya decidido |
| 4 | Elegir el concepto de sello (A, B o C) y la suerte de la firma de julio (a, b o c). | Elección creativa |
| 5 | Producir el sello elegido como SVG, junto con favicon, icono de app y avatar, y añadirlo al kit y a la guía §4. | Tras el paso 4 |
| 6 | Validar con cuatro chefs, como prevé la guía §8, incluyendo el avatar en una conversación de WhatsApp simulada. | Investigación |

## Criterios de aceptación

- Ningún archivo tipográfico sin licencia comercial documentada en la exportación pública.
- La marca es reconocible a 16 px y a 40 px (pestaña y avatar).
- Una sola firma en piezas comerciales y en la cabecera de Setas OS, sin sombra.
- Cero formas de segunda persona en las páginas que lista `COMMERCIAL` en `scripts/export_public_website.py`.
- Título y descripción públicos con el descriptor confirmado.
- La KB no contradice la guía comercial vigente.
