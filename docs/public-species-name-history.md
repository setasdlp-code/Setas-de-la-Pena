# Historia y nombres de las fichas de especies

Revisión y ampliación: **17 de noviembre de 2026**. Se incorporan unas notas breves a las fichas, sin cambiar cocina, conservación, investigación clínica, datos comerciales ni el registro del cultivo. El segundo párrafo de las notas ocupa todo el ancho en móvil para conservar su legibilidad.

```text
Goal: ampliar moderadamente historia, etimología y curiosidades documentadas de las tres fichas.
Scope: especies/{shiitake,melena-de-leon,eryngii}.html species-editorial.css (ajuste mínimo de lectura móvil) y este registro de fuentes; sin cambios de JS, recetas, Knowledge Base ni Setas OS.
Baseline: 631e2610, rama propia codex/apply-species-notebook limpia al comenzar; origin/main 63719dd9 incorporado; continuación del PR #523 aún abierto.
Mode: research + implement + deliver.
Owner: Codex; un agente, ampliación editorial acotada.
Evidence: notas y bibliografía de las tres fichas; Cornell, Clark University, Kew, MAFF/Japan Tourism Agency, AMINT e Index Fungorum indicados abajo.
Acceptance checks: afirmaciones enlazadas a fuentes consultadas, IDs anteriores preservados, comprobación de móvil/escritorio y del paquete publicable.
Authority: ampliar estas fichas; mismo flujo de commit/push/PR/deploy autorizado en la conversación. Merge a main reservado a aprobación humana.
GitHub: actualización del PR #523.
Stop when: notas incorporadas y publicación verificada.
```

## Evidencia utilizada

| Afirmación pública | Fuente y pasaje consultado | Clase y confianza |
| --- | --- | --- |
| Shiitake une el árbol *shii* y *take*, hongo | [Clark University, 2016](https://www.clarku.edu/news/2016/06/23/a-great-cultural-export-from-asia-to-the-rest-of-the-world/), apartado «The Japan connection», explicación de *shii* + *take*. También [Cornell, Shiitake Mushroom Basics](https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/1-shiitake-mushroom-basics/). | Tier 2, divulgación universitaria y explicación de un investigador; alta para el significado citado. |
| Una práctica antigua acercaba troncos con setas a otros sin ellas y esperaba dispersión de esporas por el viento | Cornell, «Shiitake Mushroom Basics», párrafo que comienza «The origins of shiitake cultivation…». | Tier 1, extensión universitaria; alta para lo que relata. Se atribuye a Cornell y no se convierte en protocolo de cultivo. |
| *Agaricus edodes* precede al nombre actual *Lentinula edodes* | [Index Fungorum, registro 316467](https://www.indexfungorum.org/names/NamesRecord.asp?RecordID=316467), campos «Basionym» y «Current name». | Tier 2, registro nomenclatural curado; alta. No se traslada una fecha de publicación: el registro presenta fechas de edición/impresión entre corchetes. |
| *Hericium* y *erinaceus* remiten al erizo, mientras melena de león describe sus dientes colgantes | [Royal Botanic Gardens, Kew](https://www.kew.org/read-and-watch/lions-mane-fungus), «What does lion’s mane look like?». | Tier 2, institución científica; alta para morfología y etimología citadas. No se usan los pasajes promocionales o de salud de esa página. |
| *Yamabushitake* alude a los adornos del pecho del vestuario yamabushi | [Ministerio de Agricultura, Silvicultura y Pesca de Japón — MAFF, 2016](https://www.maff.go.jp/j/pr/aff/1610/spe1_03.html), entrada ヤマブシタケ: «山伏の衣装の胸飾りに似ていることが名前の由来». Traducción de sentido: el nombre procede del parecido con los adornos del pecho del vestuario yamabushi. | Tier 2, explicación institucional de una tradición nominal; alta. |
| Los yamabushi son ascetas de montaña de Shugendō y su vestuario incluye una banda con pompones | [Japan Tourism Agency, «Mountain High»](https://www.mlit.go.jp/tagengo-db/en/R1-01588.html), sección inglesa, descripción de «mountain ascetics» y «pompom sash». | Tier 2, descripción cultural institucional; alta para ese contexto. No prueba consumo de la seta ni efectos sobre la meditación. |
| *Pleurotus* significa oreja lateral; *eryngii* remite a *Eryngium*; *cardoncello* es un nombre italiano | [AMINT, ficha de *Pleurotus eryngii*](https://www.funghiitaliani.it/topic/8438-pleurotus-eryngii%C2%A0dc-fr-qu%C3%A9l-1872/), secciones «Etimologia» y «Nome comune». Ficha firmada por Mario Iannotti y aprobada/revisada por el CLR Micologico de AMINT. | Tier 3, fuente micológica especializada; confianza alta para los términos explícitos. La explicación general de *Pleurotus* coincide con el extracto indexado de [UF/IFAS PP384](https://ask.ifas.ufl.edu/publication/PP384); esta última no se añade como fuente pública porque su apertura presentó un bucle de redirección. |
| *Agaricus eryngii* figura en 1815 y *Pleurotus eryngii* en 1872 | [Index Fungorum, registro 170772](https://www.indexfungorum.org/names/namesrecord.asp?RecordID=170772), encabezado y campo «Basionym». | Tier 2, registro nomenclatural curado; alta para esos nombres y fechas. |

## Decisiones editoriales

- No se fija una fecha única para el comienzo del cultivo de shiitake: las narraciones consultadas difieren en localización y cronología. Se conserva el contexto asiático y se añade la práctica que Cornell describe, atribuida a esa fuente.
- No se identifica el árbol *shii* como un roble concreto ni se añade una especie de árbol que las fuentes citadas no precisen de modo consistente.
- Se explica el nombre japonés de melena por la vestimenta, sin recuperar el relato anterior sobre realeza o monjes que la consumían para concentrarse.
- La procedencia de cada lote de eryngii sigue diferenciada de su distribución natural; el párrafo existente se traslada a la columna de ecología y se usa la nota lateral para explicar los nombres.
- Se conservan los números y URLs de las referencias anteriores; las nuevas se añaden al final. La fecha de estas consultas se distingue de las fechas de revisión anteriores.
- No se incorporan afirmaciones sobre biología experimental, rendimientos, plazos de cultivo ni beneficios de salud.

## Verificación de esta ampliación

- `check_public_species.cjs`: 15 disposiciones en cinco anchos y 6 recorridos, sin errores del navegador.
- `check_public_export.cjs`: 84 comprobaciones, sin errores.
- `check_public_delivery.cjs`: 60 comprobaciones, sin errores.
- Se revisaron las notas en móvil y escritorio para las tres especies; se preservan los IDs y enlaces anteriores, así como el contenido de investigación, conservación y registro del cultivo.
- `git diff --check`: sin errores. El paquete exportado contiene 340 archivos; la comprobación pública general no se declara validada por el fallo de Chromium documentado en la revisión anterior.

## Relatos visibles en las fichas

Continuación del 17 de noviembre de 2026 desde `main` (`9f7df105`), rama `codex/species-historical-stories`. Se desarrolla un relato breve en cada ficha, visible desde el HTML y sin necesidad de desplegar un acordeón. Las notas etimológicas permanecen junto al relato; se reducen las repeticiones entre ambas columnas.

- **Shiitake, «Cuando el cultivo esperaba al viento».** Cornell, «About Shiitake Mushrooms» y «Basics of Shiitake Production»: práctica antigua con troncos y esporas, investigación posterior en Japón y China y uso de micelio cultivado. Tier 1, extensión universitaria; confianza alta para el relato atribuido. Se mantiene sin fecha ni localidad inicial precisa.
- **Melena, «Un nombre entre los senderos de montaña».** Se conservan MAFF y Japan Tourism Agency para el nombre, los yamabushi y la banda con pompones *yuigesa*. Se añade [UNESCO, montes Kii](https://whc.unesco.org/en/list/1142/), «Brief synthesis» y «Authenticity», para el paisaje y sus más de 1.200 años de tradición de montañas sagradas. Tier 2, fuente institucional de patrimonio; confianza alta para ese contexto. La antigüedad del paisaje no fecha el nombre de la seta ni demuestra consumo o efectos sobre la meditación.
- **Eryngii, «Un cardo en una flora francesa».** [Index Fungorum, registro 468015](https://www.indexfungorum.org/names/NamesRecord.asp?RecordID=468015), encabezado y «Host-Substratum/Locality»: *Flore française*, 1815, raíces muertas de *Eryngium* y Francia. Se combina con el registro 170772 ya citado para la combinación de Quélet de 1872. Tier 2, registro curado; confianza alta. No se atribuye el descubrimiento de la especie a esa publicación.

Los relatos no añaden escenas imaginadas, diálogos, personajes o leyendas presentadas como hechos. Cocina, conservación, investigación clínica, recetas y registro del cultivo quedan fuera de esta edición.

Verificación de los relatos: `check_public_species.cjs` completó 15 disposiciones en cinco anchos y seis recorridos sin errores de navegador. La comprobación específica de los relatos completó otros 15 casos: visibles al cargar, enlaces y contenido protegido conservados y diez referencias por especie. Los tres PDFs sin JavaScript incluyen el relato. El paquete de 340 archivos pasó 84 comprobaciones de exportación y 60 de entrega; `git diff --check` no detectó errores. Evidencia de esta continuación en `/workspace/reports/species-stories-20261117/`.
