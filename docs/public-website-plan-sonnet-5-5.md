# Plan de implementación para Claude Sonnet 5.5

**Proyecto:** web pública de Setas de la Peña.

**Fecha:** 11 de octubre de 2026 · Colombia.

**Estado:** plan para desarrollo posterior; las funciones descritas como nuevas todavía no están implementadas.

## 1. Objetivo y punto de partida

Ayudar al visitante a elegir una preparación, calcular cuánto shiitake necesita y preparar una consulta comercial clara. Conservar la identidad ilustrada y la lectura editorial de la marca.

La [PR #365](https://github.com/setasdlp-code/Setas-de-la-Pena/pull/365) está integrada en `main`. Base verificada al redactar este plan: `c37e0205944c8b1f70abc15074941ed2d5279258`; implementación original: `12f4e7549cef67eee790bbbebe5fee7c42e5d779`. Volver a verificar `main` al iniciar el trabajo.

Ya existen:

- Portada con colección, filtros, ventanas de especie, origen y enlaces a recetas y consulta.
- Ficha de shiitake con perfil culinario, cantidad, municipio, mensaje revisable, copia, conservación e impresión.
- Tres recetas con fuentes, ingredientes, instrucciones y gouaches: arepa, sopa de coco y patacones.
- Gaya + IBM Plex predeterminados; alternativas tipográficas optativas.
- Chequeo de navegador reproducible: 26 comprobaciones pasaron en la entrega anterior. Son evidencia histórica, no el resultado de una futura ejecución.

La documentación de funcionamiento está en [public-website.md](public-website.md). La web es estática y distinta de la aplicación operativa Setas OS. El workflow actual de Pages publica Setas OS; la web pública de la raíz todavía requiere su propia configuración de publicación.

## 2. Contrato de trabajo para Claude

```text
Goal: completar una fase seleccionada y entregar un resultado verificable.
Scope: web pública de la raíz, sus recursos, docs/public-website*.md y chequeo de navegador.
Baseline: main actualizado; inspeccionar cambios locales antes de editar.
Mode: implement, después de seleccionar la fase.
Owner: Claude Sonnet 5.5; un agente para las fases locales de esta web.
Evidence: AGENTS.md, docs/public-website.md, este plan y archivos de la fase.
Acceptance: criterios de la fase + recorrido de compra/consulta existente preservado.
Authority: edición local y pruebas reversibles de la fase autorizada.
GitHub: publicar commits/PR solo dentro de la autorización vigente del usuario.
Stop when: criterios de la fase cumplidos, evidencia guardada y bloqueos concretos descritos.
```

Trabajar por fases pequeñas. No ejecutar todas las fases como un rediseño general. Corregir los fallos introducidos por la fase antes de avanzar. Si falta un dato comercial, solicitarlo mientras se completa el trabajo independiente; un campo vacío no autoriza inventarlo.

Antes de editar, leer `AGENTS.md`, ejecutar `git status --short --branch`, `git diff --stat` y `git worktree list`. Usar el checkout existente y una rama propia desde `main`; no reutilizar una rama ya integrada. Preservar trabajo ajeno. No crear worktrees adicionales salvo petición explícita.

## 3. Identidad y alcance que se conservan

| Aspecto | Regla de implementación |
| --- | --- |
| DS | Único entrypoint público: `08_brand/ds-2026/market.css`. Reutilizar tokens y componentes; no introducir una segunda paleta. |
| Tipografía | Gaya en títulos, IBM Plex Sans en lectura e interfaz y Plex Mono en datos/textos breves. |
| Especies | Grabados contenidos con `object-fit: contain`; conservar nombre científico y rótulo de ilustración. |
| Cocina | Gouache con lápiz, fondo de papel y platos completos. Reutilizar las tres piezas aprobadas. |
| Fotografía | Uso excepcional de imágenes propias confirmadas cuando aporten evidencia del cultivo o producto. |
| Lenguaje | Español claro para compradores en Colombia; pesos en gramos y precios en COP. |
| Referencias | Foraged: cercanía al ingrediente y su uso. North Spore: proceso comprensible. Las referencias de Fonts In Use orientan jerarquía y composición. |
| Plataforma | HTML/CSS/JS existentes; añadir módulos pequeños solo cuando resuelvan una necesidad de la fase. |

No introducir carrito, pago, cuentas, Firebase ni conexión con inventario por iniciativa propia. No modificar el DS canónico, SOPs o Setas OS para implementar funciones de esta web. No atribuir beneficios medicinales, certificaciones, stock o vida útil sin información confirmada.

Referencias visuales ya elegidas por el usuario: [Gaya](https://fontsinuse.com/typefaces/167778/gaya?filters=all), [God soppjakt](https://fontsinuse.com/uses/61619/god-soppjakt-by-mette-alstad), [James Ensor](https://fontsinuse.com/uses/60895/james-ensor-inspired-by-brussels), [Mohamed Elali](https://fontsinuse.com/uses/61172/mohamed-elali-website), [Flor](https://fontsinuse.com/uses/57468/flor) y [Nous étions là…](https://fontsinuse.com/uses/64311/nous-etions-la-pour-votre-premier-cri-entende). No repetir la investigación completa para iniciar la fase 1.

## 4. Orden de implementación

| Fase | Resultado | Dependencia |
| --- | --- | --- |
| 0 | Base y validación preparadas | Checkout y herramientas locales |
| 1 | Receta → cantidad → consulta | Independiente de precios y WhatsApp |
| 2 | Cantidades ajustables sin acumulación de redondeo | Contrato de contexto de fase 1 |
| 3 | Compartir y retomar una receta | URL pública para compartir fuera del entorno |
| 4 | Guía breve para elegir una seta | Información culinaria con fuente |
| 5 | Activar los datos comerciales disponibles | Información real del negocio |
| 6 | Preparar publicación y descubrimiento | Hosting y dominio elegidos por el usuario |

La fase 5 puede realizarse antes cuando lleguen los datos. La ausencia de esos datos no bloquea las fases 1, 2 y 4. La fase 3 puede implementarse y probarse localmente con una URL de prueba, sin presentar un enlace local como una receta públicamente compartible.

## Fase 0 — Preparar la continuidad

**Leer:** `docs/public-website.md`, `commercial-data.js`, `recetas.js`, `shiitake.js` y `scripts/quality/check_public_website.cjs`.

1. Confirmar que el checkout contiene la web integrada por la PR #365.
2. Verificar el navegador y Playwright disponibles. Reutilizar las dependencias existentes; no cambiar lockfiles para esta fase.
3. Servir la raíz del repositorio, no el directorio de Setas OS:

   ```sh
   python3 -m http.server 4187 --bind 127.0.0.1 --directory .
   ```

4. En otra terminal, ejecutar `node scripts/quality/check_public_website.cjs`. Registrar fallos preexistentes separados de los introducidos después.
5. Guardar renders de referencia de portada, ficha y receta antes de los cambios.

**Aceptación:** las páginas y sus recursos cargan; se conoce el resultado real del chequeo. No afirmar que la web está publicada por el hecho de levantar el servidor local.

## Fase 1 — De la receta a la consulta

**Prioridad máxima. Archivos:** `recetas.html`, `recetas.js`, `shiitake.html`, `shiitake.js`, `website.css`, chequeo de navegador y un pequeño `recipe-data.js` compartido si hace falta centralizar el contexto.

### Datos de referencia existentes

| ID estable | Shiitake fresco limpio en la receta base | Rendimiento publicado, estimado |
| --- | --- | --- |
| `receta-arepa` | 300 g | 4 arepas pequeñas · 2 personas |
| `receta-sopa` | 300 g | 4 entradas o 2 porciones grandes |
| `receta-patacones` | 250 g | 8 bases pequeñas · 2–4 personas |

Estos valores vienen de `recetas.html`; no sustituirlos por el valor inicial de 250 g del formulario comercial. Mantener el aviso de prueba culinaria pendiente.

### Implementación

1. Añadir una acción «Quiero cocinar esto» a cada receta, con texto auxiliar que explique la cantidad de shiitake solicitada.
2. Usar un contrato de URL estable, por ejemplo `shiitake.html?recipe=receta-arepa&scale=1#producto`. Conservar `pairing` cuando está seleccionado.
3. Resolver el nombre y peso desde los IDs conocidos; no aceptar nombres de receta o HTML arbitrarios de la URL. Inicialmente admitir solo `scale=1`; la fase 2 amplía los factores.
4. Mostrar el contexto en la ficha: «Para la arepa necesitas 300 g de shiitake». Permitir editar la cantidad o quitar el contexto.
5. Sin presentaciones comerciales, precargar la cantidad solicitada en gramos.
6. Con presentaciones confirmadas, mantener separadas la cantidad que requiere la receta y el número de envases. **300 g nunca debe convertirse en 300 presentaciones.** Proponer `ceil(gramos necesarios / gramos por presentación)`, mostrar peso entregado y diferencia y permitir ajustar la propuesta.
7. Incluir receta, cantidad solicitada y, cuando corresponda, presentación/peso ofrecido en el mensaje. Mantener separados subtotal y envío.
8. Si cambia cantidad, presentación o contexto, invalidar el mensaje anterior y su enlace de WhatsApp. Conservar el municipio que el usuario ya escribió durante esa edición.
9. Para IDs desconocidos, factores inválidos o ausencia de contexto, mostrar la consulta normal sin errores ni mensajes comerciales ficticios. Usar `textContent` y APIs de URL.

**Aceptación:** las tres recetas abren el formulario con 300/300/250 g; se conserva el contexto correcto en el mensaje; el usuario puede editarlo. Casos adicionales: presentación única/múltiple, cantidad mayor que un envase, precio pendiente, sin stock, sin teléfono, parámetros malformados y combinación con `pairing`. No enviar mensajes durante las pruebas.

**Entrega:** cambio local verificable, tests relevantes y renders del recorrido móvil y escritorio. Primera PR sugerida: «Conectar recetas con la consulta de shiitake».

## Fase 2 — Ajustar cantidades

**Archivos:** recetario, modelo de recetas de fase 1, `website.css` y chequeo de navegador.

1. Empezar con «Receta base / Doble / Triple» (`×1`, `×2`, `×3`). El rendimiento actual de sopa y patacones tiene alternativas; no convertirlo silenciosamente en un número único de comensales. El selector 2/4/6 personas se añade cuando existe una base de porciones definida.
2. Representar cantidades numéricas y rangos de forma explícita: cantidad, unidad, ingrediente y opcionalidad. Mantener aparte «al gusto», «si hace falta» e instrucciones del envase. No intentar extraer cantidades de toda la prosa con expresiones regulares.
3. Calcular siempre desde los valores originales inmutables. Cambiar `×1 → ×3 → ×1` debe recuperar exactamente la receta base.
4. Actualizar únicamente ingredientes y rendimientos que puedan escalarse. Conservar el tiempo como estimación de referencia y los consejos de cocción; duplicar ingredientes no duplica automáticamente el tiempo.
5. Mantener las cantidades base legibles sin JavaScript. Si hay un modelo y una proyección HTML de respaldo, añadir una verificación de concordancia de sus cantidades e IDs.
6. Actualizar el peso enviado a la consulta: arepa `×2` solicita 600 g; patacones `×3`, 750 g. Al recargar un enlace con `scale`, recuperar ese estado.
   El factor pertenece a una receta identificada, no se aplica globalmente a las tres. Los enlaces compartidos deben identificar receta y factor; cambiar de receta no hereda accidentalmente el factor de la anterior.
7. La impresión debe mostrar el factor elegido, cantidades visibles y el aviso de estimación. Restaurar después el estado de las instrucciones.

**Aceptación:** factores `×1/×2/×3`, restauración exacta, rangos y opcionales, cantidad de shiitake, navegación de teclado, recarga y PDF coherentes. La selección no atribuye a la receta una validación culinaria que todavía no existe.

## Fase 3 — Compartir una receta

**Archivos:** recetario, configuración mínima de URL pública si corresponde, metadatos del `<head>`, recursos sociales y tests.

1. Compartir nombre del plato y URL con fragmento de receta y factor seleccionado. No incluir municipio, cantidades comerciales editadas ni otros datos del formulario.
2. Usar `navigator.share` cuando esté disponible, con alternativa para copiar enlace y una acción de WhatsApp a elección del visitante. Cancelar la hoja nativa no debe mostrarse como un fallo.
3. Abrir el destino externo solo por una acción del usuario. Probar codificación y destinos sin enviar nada.
4. Obtener la URL pública del sitio antes de activar enlaces públicos. Evitar enlaces que apunten a `localhost`, rutas del workspace o un dominio inventado.
5. Añadir una vista previa estática del recetario con imagen ilustrada, título y descripción. **Los fragmentos `#receta-…` y el JavaScript no crean metadatos Open Graph diferentes para cada receta.** Si se requieren vistas previas individuales, proponer páginas estáticas por receta como una ampliación de esta fase, con sus propios metadatos y rutas revisadas.

**Aceptación:** enlace directo abre la receta y factor correctos; compartir, cancelar y copiar funcionan con mensajes accesibles; ninguna ruta privada/local se presenta como enlace público. Verificar la vista previa real después de publicar.

## Fase 4 — Ayudar a elegir una seta

**Archivos:** `index.html`, `website.js`, `website.css` y tests. Ampliar fichas solo si lo requiere la guía.

1. Incorporar una guía breve junto a la colección: preparación deseada, perfil de sabor y textura. Reutilizar tarjetas y filtros existentes.
2. Mantener shiitake como la especie con recorrido comercial completo. Melena y orellana pueden conservar fichas informativas hasta tener datos reales de venta.
3. Mantener reishi en el archivo; no tratarlo como una alternativa culinaria equivalente.
4. Reutilizar únicamente descripciones con fuente. Verificar antes cualquier comparación nueva, en particular referencias que describen una variedad de orellana distinta de la mostrada.
5. Favorecer enlaces claros a especie y receta. No añadir preguntas que simulen un diagnóstico nutricional o medicinal.

**Aceptación:** un visitante puede llegar desde una preparación a la ficha adecuada; hay un estado visible para quitar filtros y volver a todas las opciones; funciona con teclado y móvil. La guía no convierte una especie del archivo en stock disponible.

## Fase 5 — Completar la información comercial

**Archivos:** `commercial-data.js`, ficha, portada cuando corresponda y fixtures del chequeo.

Solicitar únicamente datos aún pendientes:

| Dato | Acción que habilita |
| --- | --- |
| WhatsApp comercial internacional | Abrir la consulta revisada en el canal real |
| Presentaciones, peso y precio en COP | Elegir envases y calcular subtotal |
| Disponibilidad y su fecha de confirmación | Mostrar un estado comercial actual |
| Zonas, días y costo de entrega | Explicar cobertura y envío |
| Medios de pago | Informar cómo se confirma y paga el pedido |
| Lote, cosecha y conservación del producto | Mostrar información propia de una cosecha |

Incorporar los datos proporcionados por el negocio y registrar su fecha/procedencia de forma mantenible. No usar precios de competidores como precios de Setas de la Peña. La mera integración de la PR #365 no demuestra que empezó la producción.

El número de WhatsApp puede activar consultas aunque el precio siga pendiente. La ausencia de precio o stock mantiene una consulta, no una promesa de pedido aceptado. `deliveryFeeCOP: 0` significa costo confirmado de cero; `null` significa desconocido. Mantener la cobertura separada del costo.

**Aceptación:** dato desconocido, precio conocido, falta de stock y entrega fuera de cobertura tienen textos coherentes. Los datos de prueba se usan exclusivamente en tests. Ningún cliente ve un lote, precio o contacto de fixture.

## Fase 6 — Preparar publicación y descubrimiento

**Archivos:** documentación de hosting, metadatos, recursos públicos, tests y workflow solo cuando se elige una estrategia.

1. Confirmar hosting y dominio de la web pública. Preparar primero el paquete estático y su validación, luego ejecutar el despliegue cuando esté autorizado.
2. Evitar publicar la raíz entera del repositorio: contiene código operativo y documentos internos. Generar un directorio de salida con las páginas públicas y únicamente los recursos que necesitan, incluidos imports CSS, fuentes, imágenes e iconos del DS.
3. Elegir una publicación independiente de Setas OS. No reemplazar su artefacto de Pages por esta web ni crear workflows que compitan por el mismo destino sin una decisión explícita.
4. Probar la web desde el directorio de salida: todas las rutas, imports CSS, ilustraciones y fuentes deben resolver también si se usa una ruta base de proyecto.
   Revisar también enlaces actuales a documentación del repositorio: publicar una atribución pública pertinente o ajustar el enlace; no copiar documentos internos solo para evitar un 404.
5. Añadir canonical, Open Graph, sitemap y robots con la URL real. Mantener el estudio tipográfico fuera de indexación. No añadir datos estructurados `Offer`, reseñas, stock o valoraciones ficticios. Cualquier esquema `Recipe` debe corresponder al contenido visible y a sus límites de validación.
6. Medir rendimiento y accesibilidad en móvil. Corregir problemas observados de foco, etiquetas, contraste, imágenes o fuentes sin cambiar el DS por intuición. Mantener texto HTML y acciones útiles con JavaScript desactivado.
7. Conservar caché y tamaños de imágenes coherentes; documentar peso del paquete, ruta pública, versión y comprobación posterior al despliegue.

**Aceptación:** paquete público sin documentos internos, navegación completa desde la salida, URL real verificada después del despliegue autorizado y Setas OS conserva su publicación. Medición de rendimiento y accesibilidad con resultados registrados; no prometer puntuaciones no medidas.

## 5. Validación y entrega de cada fase

Para cambios de comportamiento público, ampliar el chequeo existente con los casos nuevos y ejecutar:

```sh
node scripts/quality/check_public_website.cjs
git diff --check
```

Para una entrega por PR, ejecutar además `bash scripts/quality/run.sh`, revisar el diff exacto y seguir el protocolo GitHub de `AGENTS.md`. No repetir suites ajenas a esta web sin cambios o fallos que lo justifiquen.

Revisar visualmente 320, 390, 768 y 1440 px. Comprobar teclado, foco, copiado denegado, URL inválida, falta de datos y vista sin JavaScript cuando afecten al cambio. Mantener pruebas significativas de resultado, sin duplicar cada detalle de CSS.

Guardar fuera del contenido publicado:

- Capturas de los estados cambiados y PDFs cuando cambia impresión.
- `audit.json` con commit, viewport, URL/estado, fecha, hashes y resultados reales.
- Nota breve de cambios, validación, limitación y siguiente acción.

Los datos comerciales de prueba se interceptan en el navegador; no se guardan en la configuración pública. No publicar informes con datos de clientes. Después de crear una PR, verificar su SHA y checks; no confundir push, merge y despliegue.

## 6. Trabajo que requiere intervención humana

Se puede completar la implementación local y sus pruebas antes de solicitar decisiones de negocio. Permanecen externas al trabajo del agente:

- Confirmar WhatsApp, precios, stock, entregas, pagos y documentación del producto.
- Cocinar las adaptaciones para validar cantidades, tiempos y rendimiento. Claude puede preparar una ficha de prueba; no declarar una cata realizada.
- Aportar fotografías propias si se decide mostrar una cosecha o proceso real.
- Elegir hosting/dominio y aportar accesos por los mecanismos seguros disponibles.
- Autorizar publicación y merge cuando corresponda. Preparar un resultado concreto antes de pedir la autorización pendiente.

No bloquear la fase 1 por estos datos: la consulta editable ya tiene una alternativa de copia y estados pendientes.

## 7. Prompt listo para iniciar Claude Sonnet 5.5

```text
Trabaja en setasdlp-code/Setas-de-la-Pena con Claude Sonnet 5.5.
Lee AGENTS.md, docs/public-website.md y docs/public-website-plan-sonnet-5-5.md.

Implementa únicamente la fase 1: receta → cantidad de shiitake → consulta.
Parte de main actualizado y preserva cualquier cambio local ajeno.
Verifica que la web de la PR #365 está integrada antes de editar.

Usa 300 g para arepa, 300 g para sopa y 250 g para patacones en la receta base.
Conserva Gaya + IBM Plex, el DS canónico, los grabados de especies y el gouache culinario.
Mantén separados gramos requeridos y número de presentaciones comerciales.
No inventes datos de precio, stock, entrega o WhatsApp.

Completa la implementación local y las pruebas del recorrido,
incluidos contexto inválido, presentación confirmada y precio pendiente.
Guarda renders auditables y actualiza la documentación necesaria.
No añadas carrito, pagos ni integración con Setas OS.
No ejecutes las fases siguientes ni publiques cambios sin autorización vigente.

Entrega: cambios y motivo, checks realmente ejecutados,
renders, limitaciones concretas y siguiente acción.
```
