---
title: "Retamo espinoso (Ulex europaeus) como sustrato para shiitake y melena de león — evidencia y Formulador (2026-10-31, act. 2026-11-06)"
document_id: DOC-0129
category: research
load_priority: selective
last_reviewed: 2026-11-06
confidence: low
status: draft
primary_sources:
  - "Xu et al. 2025, Front. Nutr. 12, DOI:10.3389/fnut.2025.1538039 (verificado 2026-10-31)"
  - "Pesenti et al. 2017, BioResources 12(2):2660–2672 (texto de resultados releído 2026-11-06)"
  - "Tighe-Neira et al. 2014, Agron. Mesoam. 25(2):347–355, redalyc 43731480012 (Cuadros 1 y 3 releídos 2026-11-06)"
  - "Gavidia Sandival y León Martínez 2016, tesis Lic. Biología, Universidad Distrital, hdl:11349/2933 (texto completo leído 2026-11-06)"
  - "SDA / FDL San Cristóbal / IDIPRON 2020, informe técnico de aprovechamiento de biomasa de retamo (convenio 1295 de 2019), oab.ambientebogota.gov.co/descargar/14998"
  - "Resolución SDA 7615 de 2009 (Bogotá D.C.)"
  - "Núñez-Moreno, Barbieri y Gordillo 2020, Rev. Fac. Ing. UPTC 29(54), DOI:10.19053/01211129.v29.n54.2020.10454"
  - "Carvajal et al. 2021, Agric. Nat. Resour., DOI:10.34044/j.anres.2021.55.6.14"
  - "Resolución 684 de 2018 (MinAmbiente); Lineamientos SDA Bogotá para control de retamos, 2014"
  - "Motor del Formulador de Setas OS (runHybridRecipeSearch), corrida 2026-10-31"
related_documents:
  - auditoria_pellets_maderas_shiitake_2026-10-31.md
  - intake/pellets_maderas_shiitake_colombia_reporte_externo_2026-10-28.md
  - unresolved_questions.md
  - ../02_substrates/substrate_library.md
  - ../02_substrates/shiitake_pellets_microlote_receta_v1.md
  - ../07_business/procurement_cost_registry.md
  - ../01_species/lentinula_edodes.md
  - ../01_species/hericium_erinaceus.md
  - ../../docs/research/retamo_hericium_shiitake_deep_research_2026-11-06.md
---

# Pregunta y posición del proyecto

**Pregunta:** ¿puede el retamo espinoso (*Ulex europaeus*), invasor abundante en la Sabana, ser sustrato o componente de sustrato para shiitake (*Lentinula edodes*) o melena de león (*Hericium erinaceus*)?

**Actualización 2026-11-06:** segunda pasada de investigación. Añade *Hericium*, una tesis colombiana con *Pleurotus* en retamo, el perfil químico de biomasa procesada (SDA 2020), cifras releídas y el estado legal. El detalle está en `docs/research/retamo_hericium_shiitake_deep_research_2026-11-06.md` (fuera del KB). Las secciones marcadas «(2026-11-06)» son las nuevas o corregidas.

**Posición actual:**
- El catálogo de Setas OS (`substrate-catalog.js`) marca el retamo como compatible solo con orellanas (*P. ostreatus* gris y blanca, *P. djamor*). Esa compatibilidad se estimó «por analogía con arbustos leñosos», sin ensayo.
- La composición del catálogo (N 1,4–1,6 %, C:N 30–34, lignina 23–24,5 %) viene de una ficha técnica que entregó el usuario y no se ha verificado con fuente primaria.
- `procurement_cost_registry.md` lo listaba sin mercado verificable. El reporte externo del 2026-10-28 menciona pellets de retamo de Mandra Renovable; el registro se actualizó con estado `unverified`.

**Tipo de cambio:** investigación. No modifica el catálogo, la receta del piloto ni ninguna decisión.

# Dictamen

**No hay evidencia publicada de cultivo de shiitake en retamo.** La compatibilidad no está demostrada y el retamo **no debe entrar en los bloques del piloto de shiitake** (30 bloques, DOC-0122/0123) ni en el microlote de pellets (DOC-0127). Lo que se puede justificar hoy es, como mucho, un microensayo exploratorio separado (sección 5).

**Melena de león (2026-11-06):**
- No hay evidencia publicada de *H. erinaceus* sobre retamo ni sobre ninguna leguminosa leñosa.
- El riesgo se juzga **mayor que en shiitake**:
  - La ficha de la especie registra que *H. erinaceus* fracasó con orujo de nuez verde al 20 % (Atila 2019), lo que indica sensibilidad a taninos y polifenoles.
  - En la biomasa procesada de retamo predominan fenólicos, flavonoides y saponinas (SDA 2020, §3).
  - Este riesgo es una inferencia, no un resultado medido.
- *Hericium* queda fuera de cualquier ensayo en bolsa. Solo se justifica la prueba en placa (§5, paso 0).
- Pasa a bolsas únicamente si su placa no muestra inhibición **y** T1/T2 de shiitake colonizan sin problemas.

**Orellana (2026-11-06):**
- Una tesis de pregrado de Bogotá (2016) cultivó *P. pulmonarius* con 30 % de retamo pulverizado sin que el hongo se inhibiera (§1).
- Respalda, con evidencia débil, la compatibilidad con *Pleurotus* que ya tiene el catálogo.
- No dice nada sobre shiitake ni *Hericium*.
- El catálogo **no cambia**: `lions_mane` y `shiitake` siguen fuera de la compatibilidad del retamo.

# 1. Evidencia directa e indirecta

| Afirmación | Nivel | Fuente |
|---|---|---|
| No se halló ningún estudio de *L. edodes*, *Pleurotus*, *Ganoderma* ni *Hericium* sobre *Ulex*, en EN/ES/PT/GL | Sin evidencia (búsqueda limitada, sin acceso directo a Scholar) | Investigación del 2026-10-31 |
| Arbusto leguminoso análogo, *Caragana korshinskii*, reemplazando roble al 10/20/30 % con 20 % de salvado, 1 % de azúcar y 1 % de CaCO₃: BE 46,1 / 48,9 / 50,5 % frente a 62,2 % del control de roble. Primera cosecha a 119 / 146 / 147 días frente a 111. El artículo no tiene datos por encima del 30 % | Tier 1 (revisado por pares; verificado el 2026-10-31) | Xu et al. 2025, DOI 10.3389/fnut.2025.1538039 |
| *Robinia pseudoacacia*, leguminosa leñosa, al 78 % + 20 % de salvado: BE ~97 %. Ser leguminosa no excluye por sí solo al shiitake, pero *Robinia* no es comparable con un arbusto espinoso | Tier 2 (solo resumen leído) | Zhou et al. 2025, *Fermentation* 11:245 |
| Mandra Renovable clasifica su pélet de retamo para *Pleurotus* sp. | Declaración comercial (no reverificada) | Reporte externo 2026-10-28 |
| **(2026-11-06)** *P. pulmonarius* en 70 % aserrín y viruta de urapán + 30 % «tamo» de retamo, seco y pulverizado. Pasteurización a 80 °C; 15 bolsas de ~0,5 kg; dos siembras. Siembra 1: primera fructificación a los 42–43 días; T4 fue el de mayor peso en la primera cosecha (Tukey, p = 0,00013), pero sin diferencias en el total de la siembra (p = 0,084), y fue «el menos afectado por la contaminación». Siembra 2: primordios más tardíos que el resto (~28 frente a 23 días) y mejor rendimiento de fríjol y arveja. No reporta BE ni materia seca | Tier 2 (tesis de pregrado; texto completo leído) | Gavidia Sandival y León Martínez 2016, Universidad Distrital, hdl:11349/2933 |
| **(2026-11-06)** *Caragana* al 78 % reemplazando uno a uno la madera dura en shiitake | **Refutada** (0-3 en verificación adversarial) | BMC Genomics 2024, s12864-024-10666-8 |
| **(2026-11-06)** Ningún estudio de *H. erinaceus* sobre *Ulex* ni sobre leguminosas leñosas | Sin evidencia (dos corridas de búsqueda) | Investigación del 2026-11-06 |

# 2. Composición: la ficha y el nitrógeno, en ambas direcciones

| Parámetro | Dato | Parte de la planta | Fuente | Nivel |
|---|---|---|---|---|
| Lignina / celulosa / hemicelulosa | 24,5 / **47,5 / 22,2 %** (corregido 2026-11-06; antes 47,0 / 21,7) | Tallo de 6–7 años (Valdivia, Chile) | Pesenti 2017 | Tier 1 (releído) |
| Extractivos / cenizas | **6,7 %** (antes 6,6) / 1,46 % | Tallo | Pesenti 2017 | Tier 1 (releído) |
| N / C / C:N | 1,80 % / 53,6 % / 29,8 | Brotes de 1–2 años | Tighe-Neira 2014 | Tier 1 (Cuadro 1 releído) |
| N / C (C:N ≈ 46) | 1,0 % / 45,6 % | Briqueta 50 % tronco + 50 % follaje (Colombia) | Núñez-Moreno 2020 | Tier 1* |
| Cenizas | 0,84 % (tronco) y 6,7–8,3 % (con follaje) | Tronco frente a mezcla | Núñez-Moreno 2020 | Tier 1* |
| N del leño solo | Sin dato | — | — | Sin evidencia |
| pH, densidad aparente tras molienda | Sin dato | — | — | Sin evidencia |

\* Tier 1*: la fuente existe (DOI/URL resuelven el 2026-10-31), pero las cifras las leyó la investigación delegada y no se releyeron. El sitio de la UPTC (Núñez-Moreno) bloqueó la verificación directa. Releerlas antes de usarlas para decidir.

El 2026-11-06 se releyeron Pesenti (texto de resultados) y Tighe-Neira (PDF). La Tabla 3 de Pesenti es una imagen: las cifras corregidas salen del texto, que puede redondear distinto. Núñez-Moreno sigue en Tier 1*.

Lectura:
- Lignina, celulosa y hemicelulosa de la ficha **coinciden** con la literatura.
- El N de 1,4–1,6 % y la C:N de 30–34 de la ficha **corresponden a brote joven** o a biomasa mixta con follaje.
- El leño probablemente tiene menos N, pero **nadie lo ha medido**. Es una inferencia.
- Antes de cualquier uso hay que analizar en laboratorio el N y el C (Kjeldahl o combustión) de la fracción exacta que se usaría: tallo de más de 1 cm, sin follaje ni semillas.

**Corrida del Formulador (2026-10-31), con los valores de la ficha:**
- Con stock retamo + salvado de trigo + cal (carbonato o hidratada), la búsqueda para shiitake da 0 candidatos, por el filtro de compatibilidad.
- Forzando la compatibilidad, la mejor mezcla es retamo al 100 %: C:N 31 (objetivo 35–70), N 1,5 % (máximo 1,2 %), riesgo de *Trichoderma* activado y seguridad en *hold*.
- Añadiendo aserrín de roble, el motor propone roble ~38 % / retamo ~58 % / salvado ~1 % / CaCO₃ ~3 % (C:N 50).
- **Ninguna de estas cifras es una proporción recomendada.** El ~58 % depende del N de la ficha (brote joven) y queda fuera de toda evidencia: el único análogo publicado llega al 30 % y aun así pierde rendimiento y se retrasa. Si el leño tiene menos N, la proporción calculada cambiaría, pero la tolerancia del shiitake al resto de la química del retamo seguiría sin probarse.
- El motor no tiene datos de campo calibrados, así que sus EB solo sirven para ordenar candidatos. Detalle de la corrida: `docs/research/formulador_retamo_salvado_cal_2026-10-31.md` (fuera del KB).

**Afirmación contradicha:** el reporte externo del 2026-10-28 dice que 80 % de pellets de retamo + 20 % de salvado da una C:N por debajo de 20:1. Con los valores de la ficha, el Formulador da ~27 para 79/20. Con el dato colombiano de planta entera (C:N ≈ 46), la mezcla quedaría más alta todavía. La afirmación no se adopta. La conclusión de no usar retamo como base para shiitake se sostiene por la falta de evidencia, no por esa cifra.

# 3. Compuestos inhibitorios

- **Tier 1–2 (fuentes que resuelven; leídas por investigación delegada):** *Ulex* contiene alcaloides quinolizidínicos (anagirina, citisina, N-metilcitisina, lupanina) y terpenoides. Sus extractos inhiben *in vitro* patógenos de plantas: 100 % de *Gibberella fujikuroi* y *Phytophthora cinnamomi*, 65 % de *Botrytis* (Carvajal et al. 2021). No hay pruebas con hongos de pudrición blanca ni con shiitake.
- **Tier 2:** mulch y extractos de *Ulex* son fitotóxicos en avena (Briones Rizo et al. 2023; solo resumen). El compost de 100 % *Ulex* sin acelerador no superó el criterio de toxicidad por germinación (Tighe-Neira 2014).
  - **Cifras releídas 2026-11-06** (Cuadro 3): germinación 58,66 ± 25,75 % sin acelerador frente a 96 ± 3,05 % con acelerador. La NCh 2880 exige más de 80 %.
  - Un segundo estudio chileno (registro ANID) encontró el compost de *Ulex* algo más fitotóxico que los de estiércol.
  - El compostaje no elimina por sí solo lo que inhibe.
- **Tier 1–2 (2026-11-06), biomasa procesada** (informe SDA/IDIPRON 2020):
  - Analizaron por UHPLC-MS biomasa residual bioextruida, mezcla de *Ulex* y *Genista*.
  - Identificaron 78 compuestos, sobre todo fenólicos, flavonoides (glicósidos de quercetina, derivados de apigenina, isoflavonas) y saponinas.
  - **No detectaron alcaloides.** El mismo informe cita alcaloides quinolizidínicos en tallo verde y semilla (Duhart 2012).
  - La muestra era mezclada y procesada, así que no prueba que el leño fresco de *Ulex* esté libre de alcaloides.
  - Lectura: en material procesado la carga de alcaloides puede ser menor de lo que se suponía. La carga fenólica sí está presente, y es la que más importa para *Hericium*.
- **Sin evidencia:**
  - Concentración de alcaloides por parte de la planta. Se presume menor en el leño que en follaje y semillas, pero es una inferencia.
  - Efecto del autoclave, el lavado o el compostaje sobre esos compuestos en un sustrato para hongos.
- El reporte externo añade pterocarpanos e isoflavonas antifúngicas (maackiaina, genisteína). No se verificó.

# 4. Riesgos prácticos y marco legal

- **Espinas y astillas:** pueden perforar las bolsas de PP. Usar solo tallo de más de 1 cm, tamizar e inspeccionar las bolsas antes y después del autoclave.
- **Pellet comercial:** según el reporte externo, el arbusto se chipea entero (espinas, vainas, corteza), lo que acerca su composición a la de la biomasa mixta, rica en N y cenizas. Un pellet de retamo comercial no equivale a «leño de retamo».
- **Normativa:**
  - La Resolución 684 de 2018 (MinAmbiente) exige disponer adecuadamente ramas, tallos, raíces y semillas después del corte (art. 6, Anexo 3). No prohíbe usar la biomasa.
  - Los lineamientos de la SDA (2014) permiten compostar troncos y ramas y piden manejar aparte flores y semillas.
  - **Pendiente:** el Anexo 3, la Resolución Conjunta 001 de 2017 de la SDA y los permisos de la CAR para cortar, transportar y dar destino al sustrato agotado.
- **Abastecimiento y normativa (2026-11-06):**
  - **Verificado (informe SDA 2020):** en Bogotá, el protocolo de erradicación bajo la Res. 684 de 2018 separa el flujo leñoso (tallos, raíces y tocones) del verde (ramas con flor y semilla).
    - Ambos van a CERESA y se chipean por separado; el chip verde se bioextruye para destruir la semilla.
    - Ya existe, por tanto, un **chip leñoso de retamo legal y sin semilla**. Es la fracción que recomienda este documento y la fuente preferida para cualquier ensayo.
  - **Verificado (lineamientos SDA):** primero se cortan y embolsan flores y semillas.
    - Para la biomasa cortada se listan compostaje o bioextrusión (Jardín Botánico), incineración controlada o dejarla en sitio.
    - No se menciona el uso como sustrato de hongos, ni para permitirlo ni para prohibirlo.
  - **Verificado:** la Res. SDA 7615 de 2009 prohíbe plantar, trasplantar, vender, distribuir y comercializar retamo. Es una norma de Bogotá D.C. y **no aplica en Tenjo**, que está bajo jurisdicción de la CAR.
  - **No confirmado:**
    - La Res. CAR 469 de 2009, una supuesta «veda» en la jurisdicción CAR. La cita un texto de la SDA, pero no apareció en ninguna búsqueda directa.
    - Si el proyecto de resolución nacional de MinAmbiente (consulta desde 2017) llegó a expedirse.
    - Una afirmación sobre su contenido se refutó (1-2): la de que solo permite compostaje o bioextrusión y que el sustrato con semillas viables no puede usarse.
  - **En conflicto:** una fuente de la UPTC dice que la Res. 684 de 2018 sugiere la incineración. Los lineamientos de la SDA listan además compostaje y dejar en sitio. Sin resolver.
  - **Precaución:** hasta tener el visto bueno de la CAR, tratar el sustrato agotado con retamo como material de retamo y no sacarlo del predio.

# 5. Microensayo exploratorio (propuesta, sin aprobar)

Separado del piloto y del microlote DOC-0127. Requiere registro en `experiment-model` antes de ejecutarse.

0. **Placa:** micelio de la cepa del piloto en agar con decocción autoclavada de retamo al 0, 1, 5 y 10 % p/v. Medir el crecimiento radial a los 3, 7 y 10 días para descartar toxicidad grave.
1. **Bolsas pequeñas** (0,5–1 kg), mismo proceso que el piloto (autoclave validado, humedad, inóculo). Retamo de tallo seco de más de 1 cm, sin follaje ni semillas, en base de madera dura:

   | Tratamiento | Retamo | Madera dura | Salvado | CaCO₃ |
   |---|---:|---:|---:|---:|
   | T0 | 0 % | 78–80 % | 20 % | 1 % |
   | T1 | 15 % | ~65 % | 20 % | 1 % |
   | T2 | 30 % | ~50 % | 20 % | 1 % |
   | T3 | 30 % | ~58 % | 10–12 % | 1 % |
   | T4 (opcional) | 50 % | ~38 % | 10–12 % | 1 % |

   T4 se hace solo si T1 y T2 no muestran problemas.
2. **Medir por bolsa:**
   - N y C del lote de retamo y de cada mezcla.
   - pH antes y después del autoclave.
   - Bolsas perforadas.
   - Días a 25, 50 y 100 % de colonización.
   - Contaminación, por tipo.
   - Días a la película marrón y a la primera cosecha.
   - Rendimiento y BE con la materia seca como denominador.
3. **Lectura:** con 8–10 bolsas por tratamiento es un tamizaje exploratorio, no una prueba comparativa.

**Ajustes propuestos (2026-11-06), sin aprobar:**
- **Origen:** pedir chip **leñoso** a CERESA o a la CAR, con constancia de origen, en lugar de cortar plantas. El N y el C se miden sobre ese lote.
- **Molienda:** moler fino y tamizar, como hizo la tesis, que tuvo que pulverizar por las espinas.
- **Paso 0:** la placa con decocción de retamo se hace con la cepa de shiitake **y** con la de *H. erinaceus*.
- **Bolsas:** solo shiitake. *Hericium* pasa a bolsas únicamente si su placa no muestra inhibición **y** T1/T2 de shiitake colonizan sin problemas. Empieza con el tratamiento de menos retamo (10–15 %).
- **Testigo positivo opcional:** orellana al 30 % de retamo, que replica la tesis. Permite separar «este lote es inhibitorio» de «la especie no lo tolera».

# 6. Vacíos

1. N, C:N y cenizas del leño de retamo de la Sabana, medidos por parte de la planta. **(2026-11-06)** Medirlos sobre el chip leñoso real de CERESA o la CAR.
2. Búsqueda directa en repositorios gallegos (USC, UVigo), chilenos (UACh, UdeC) y colombianos (UNAL, La Sabana) que no se indexaron. La Universidad Distrital ya se cubrió (2026-11-06).
3. Perfil de alcaloides por tejido y efecto del autoclave sobre ellos. **Parcial (2026-11-06):** en biomasa procesada y mezclada no se detectaron alcaloides; falta el leño fresco de *Ulex* solo y los fenólicos tras el autoclave.
4. Requisitos de la CAR y el Anexo 3 de la Res. 684/2018. **(2026-11-06)** Incluye confirmar o descartar la Res. CAR 469 de 2009.
5. Composición real del pélet de retamo de Mandra (tejidos incluidos, cenizas, humedad).
6. **(2026-11-06)** Cualquier dato de *H. erinaceus* sobre leguminosas leñosas. No se encontró ninguno.
7. **(2026-11-06)** BE de *Pleurotus* en retamo, que la tesis de la Universidad Distrital no reporta.

Fuentes no abiertas o leídas parcialmente: Bonilla & Bonilla 2021 (403), texto completo de Zhou 2025 y de Briones 2023, y el último tercio de Xu 2025.
