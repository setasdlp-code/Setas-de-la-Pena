# Consolidación editorial de las fichas

19 de noviembre de 2026. Continuación del PR #526 desde `ea7f194d`, en la rama propia `codex/species-illustrated-stories`. Objetivo: concentrar cada explicación y conservar datos únicos, referencias y navegación. Alcance: tres HTML y estilos; sin nuevos datos científicos, cambios en JS, imágenes, recetas, Knowledge Base o Setas OS. Un agente responsable: Codex. Publicación autorizada en la conversación; merge reservado a aprobación humana.

## Dónde queda cada explicación

| Contenido | Lugar principal |
| --- | --- |
| Nombres y etimología | Nota `#curiosidades`; contexto yamabushi en el relato `#historia` |
| Anatomía | Detalles de la lámina; ecología en `#identidad` y `#vida` |
| Cortes y aplicaciones | `#cortes`, con los enlaces originales a las recetas |
| Transformación durante la cocción | `#cambios`, sin volver a enumerar los cortes |
| Contexto culinario | `#tradicion` |
| Secado y sabor de shiitake | `#secado`, que las preguntas pueden abrir directamente |
| Aviso completo de cocción del shiitake | `#coccion`, conservado íntegro; los recordatorios enlazan allí |
| Composición, base y método | `#nutricion`, conservado íntegro |

Se eliminan tres bloques que duplicaban etimología/ecología, además de explicaciones de cortes repetidas en los pasos de cocina. Las nueve preguntas se convierten en enlaces directos a sus respuestas completas, sin un acordeón intermedio ni volver a copiar los párrafos. La comparación del medallón de eryngii con una vieira se conserva en su corte; la cualificación de la rama evocadora de shiitake pasa al pie de la ilustración.

El aviso de perfil culinario general permanece junto al perfil inicial. Las fechas de consulta se reúnen en una nota por ficha; no se confunde la fecha de edición con una consulta nueva. Todos los IDs y URLs anteriores se conservan: `lectura-title` pasa al encabezado de la nota lateral. Las bibliografías mantienen íntegros su orden, contenido y números.

## Verificación

La comprobación compara contra `ea7f194d` los IDs, enlaces, bibliografías y bloques protegidos: nutrición, investigación, conservación, registro del cultivo, aviso completo de cocción, receta destacada y lámina. También comprueba los nueve enlaces de preguntas con teclado, con JavaScript y sin él, sus destinos visibles y el fragmento anterior `#lectura-title`.

El texto de `.species-sheet`, excluida la bibliografía, pasa de 1.431 a 1.237 palabras en shiitake, de 1.304 a 1.093 en melena y de 1.407 a 1.197 en eryngii. Las cifras nutricionales y los límites de los estudios se mantienen sin cambios. Evidencia local: `/workspace/reports/species-consolidation-20261119/`.

Resultados: pruebas de fichas, 15 disposiciones y seis recorridos sin errores de navegador; consolidación, seis recorridos con y sin JS en cinco anchos, sin pérdida de IDs, URLs o bibliografías. Los tres PDFs finales incluyen nutrición, preguntas y fuentes, y conservan la información única trasladada. El paquete de 352 archivos pasó 84 comprobaciones de exportación y 60 de entrega. `git diff --check` correcto.
