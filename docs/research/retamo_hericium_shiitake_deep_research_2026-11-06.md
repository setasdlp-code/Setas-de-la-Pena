# Retamo espinoso (*Ulex europaeus*) para melena de león y shiitake — segunda pasada (2026-11-06)

Complementa `knowledge_base/09_research/retamo_espinoso_shiitake_2026-10-31.md` (DOC-0129). Este documento registra **solo lo nuevo** frente a esa nota y añade lo que faltaba sobre *Hericium erinaceus*. No modifica el catálogo, el piloto ni ninguna decisión.

**Método:** investigación multiagente con verificación adversarial (3 votos por afirmación; hacen falta 2 refutaciones para descartarla). Las dos corridas se cortaron por límite de sesión antes de la síntesis y no verificaron 7 afirmaciones legales. Para cerrar el reporte se releyeron directamente:
- Pesenti 2017 (BioResources)
- Tighe-Neira 2014 (PDF de Redalyc, convertido a texto)
- Tesis de la Universidad Distrital (PDF completo, 158 págs.)

## Dictamen

| Especie | Evidencia directa sobre retamo | Dictamen |
|---|---|---|
| Shiitake (*L. edodes*) | Ninguna | Sin cambios frente a DOC-0129. No entra al piloto ni al microlote. El microensayo exploratorio de DOC-0129 §5 sigue siendo la única vía. |
| Melena de león (*H. erinaceus*) | Ninguna, ni siquiera un análogo leguminoso | **Más riesgo que shiitake.** Fuera de cualquier ensayo hasta que el retamo pase la placa y T1/T2 de shiitake sin problemas. |
| Orellana (*P. pulmonarius*) | Una tesis de pregrado, Bogotá 2016 | El 30 % de retamo no inhibió al hongo. Respalda la compatibilidad con *Pleurotus* que ya tiene el catálogo. |

### Por qué *Hericium* tiene más riesgo
- `knowledge_base/01_species/hericium_erinaceus.md` registra que *H. erinaceus* fracasó con orujo de nuez verde al 20 % (Atila 2019), lo que muestra una alta sensibilidad a taninos y polifenoles.
- El análisis UHPLC-MS de la SDA (2020) sobre biomasa residual de retamo encontró que **predominan fenólicos, flavonoides y saponinas** (ver §2).
- Los extractos de *Ulex* inhiben hongos *in vitro* (Carvajal 2021, ya en DOC-0129).
- Este perfil es justamente el tipo de química al que *Hericium* ha respondido mal. Es una inferencia, no un resultado medido, pero basta para no ponerlo por delante de shiitake.
- El catálogo de Setas OS (`substrate-catalog.js`) ya excluye `lions_mane` y `shiitake` de la compatibilidad del retamo. Esta pasada no da motivo para cambiarlo.

## 1. Evidencia nueva de cultivo: *P. pulmonarius* en retamo (Bogotá)

Gavidia Sandival y León Martínez (2016), tesis de Licenciatura en Biología, Universidad Distrital. [Repositorio](https://repository.udistrital.edu.co/handle/11349/2933).

**Diseño:**
- 5 tratamientos × 15 bolsas de unos 0,5 kg, en dos siembras.
- T4 = 70 % aserrín y viruta de urapán (*Fraxinus*) + 30 % «tamo» de retamo de los cerros orientales.
- El retamo se secó, se desramó y se **licuó o pulverizó para que las espinas no perforaran las bolsas**.
- Pasteurización a 80 °C.

**Resultados del retamo (T4), leídos del texto completo:**
- **Siembra 1:**
  - Arranque micelial a los 20–23 días; T4 y el control arrancaron primero.
  - Primordios hacia el día 17 de la fase siguiente; primera fructificación a los 42–43 días.
  - En la primera cosecha, T4 tuvo el **mayor peso** (Tukey; p de la cosecha = 0,00013).
  - En el total de la siembra no hubo diferencias entre tratamientos (p = 0,084).
  - Los autores dicen que el retamo fue «el menos afectado por la contaminación».
- **Siembra 2:**
  - T4 tardó más en formar primordios (unos 28 días frente a 23 en los demás).
  - Los mejores fueron fríjol y arveja; hubo diferencias globales (p = 3e-5), pero Tukey no separó pares.
- No reporta eficiencia biológica, materia seca inicial ni el peso de T4 en cifras. Los pesos solo aparecen en gráficas.

**Lectura:**
- Es la única prueba directa de un hongo cultivado en retamo que se encontró.
- El rigor es bajo: pregrado, pasteurización y no esterilización, sin BE, y una especie mucho más tolerante que shiitake o *Hericium*.
- Muestra que el 30 % de retamo en polvo con aserrín no impide el cultivo de *Pleurotus*.
- No dice nada sobre shiitake ni *Hericium*.
- Confirma en la práctica el riesgo de las espinas (DOC-0129 §4): hubo que pulverizar.

## 2. Química: alcaloides y fenólicos en biomasa procesada

Informe técnico de la SDA, el Fondo de Desarrollo Local de San Cristóbal e IDIPRON (julio de 2020; convenio 1295 de 2019). [OAB](https://oab.ambientebogota.gov.co/descargar/14998).

- **Antecedente citado** (Duhart 2012): alcaloides quinolizidínicos en *Ulex*, incluidos citisina, anagirina, caulofilina y lupanina, en tallos verdes y semillas.
- **Medición propia** (UHPLC-MS de biomasa residual bioextruida, mezcla de *Ulex* y *Genista*):
  - Identificó 78 compuestos, sobre todo fenólicos, flavonoides (glicósidos de quercetina, derivados de apigenina, isoflavonas) y saponinas.
  - **No detectó alcaloides.**
  - Responde en parte al vacío n.º 3 de DOC-0129. La muestra era mezclada y procesada, no leño fresco de *Ulex* solo, así que no prueba que el leño esté libre de alcaloides.
- **Para hongos:** la carga de alcaloides puede ser menor de lo que se suponía en material procesado. La carga fenólica sí está presente, y es la que más importa para *Hericium*.

Otros datos verificados en esta pasada:
- **Extractivos del tallo, 6,7 %** (Pesenti 2017, releído). Los autores los consideran «muy altos» frente a otras fuentes de fibra y los relacionan con la defensa contra ataques microbianos.
- **Compost:** el compost de 100 % *Ulex* terminó algo **más fitotóxico** que los de estiércol (registro ANID). Esto concuerda con Tighe-Neira 2014, donde la germinación fue de 58,66 ± 25,75 % sin acelerador frente a 96 ± 3,05 % con acelerador y al mínimo de la NCh 2880 de más de 80 %. El compostaje no elimina por sí solo lo que inhibe.

### Correcciones de cifras de DOC-0129
| Dato | DOC-0129 | Releído 2026-11-06 | Fuente |
|---|---|---|---|
| Celulosa | 47,0 % | **47,5 %** | Pesenti 2017, texto de resultados |
| Hemicelulosa | 21,7 % | **22,2 %** | ídem |
| Extractivos | 6,6 % | **6,7 %** | ídem |
| Lignina / cenizas | 24,5 / 1,46 % | 24,5 / 1,46 % (sin cambio) | ídem |
| Brotes 1–2 años: N / C / C:N | 1,80 / 53,6 / 29,8 | sin cambio (Cuadro 1 confirmado) | Tighe-Neira 2014 |
| Germinación del compost 100 % *Ulex* sin acelerador | «no superó» | **58,66 ± 25,75 %** (con acelerador, 96 ± 3,05 %; NCh 2880 exige más de 80 %) | Tighe-Neira 2014, Cuadro 3 |

La Tabla 3 de Pesenti es una imagen. Las cifras corregidas salen del texto de resultados, que puede redondear distinto que la tabla.

## 3. Análogo leguminoso: qué se refutó

- **Confirmado** (Xu et al. 2025, *Front. Nutr.*): todo sustituto de roble con madera agroforestal (*Caragana*, espino amarillo, goji) bajó el rendimiento de shiitake entre 19 y 54 %. La formulación con 20 % de *Caragana* se eligió por un índice compuesto, no por rendimiento: 244 g/kg frente a 311 g/kg del roble.
- **Refutado (0-3):** que *Caragana* al 78 % reemplace uno a uno la madera dura en shiitake (BMC Genomics 2024). Sigue sin haber datos por encima del 30 % de un arbusto leguminoso en shiitake, como ya decía DOC-0129.

## 4. Abastecimiento y marco legal

**Verificado:**
- El protocolo de erradicación bajo la Res. MADS 0684 de 2018, tal como lo aplica Bogotá (informe SDA 2020), separa dos flujos:
  - Leñoso: tallos, raíces y tocones.
  - Verde: ramas con flor y semilla.
- Ambos van a CERESA y se chipean por separado. El chip verde se bioextruye para destruir la semilla.
- **Por tanto, ya existe un flujo legal de chip leñoso de retamo, sin semilla, separado del verde.** Es la fuente más limpia posible para un ensayo y coincide con la fracción que DOC-0129 recomienda (tallo de más de 1 cm, sin follaje ni semilla).
- Los lineamientos de la SDA exigen cortar y embolsar flores y semillas antes de manejar la parte leñosa. Para la biomasa cortada listan compostaje o bioextrusión (Jardín Botánico), incineración controlada o dejarla en sitio. **No mencionan el uso como sustrato de hongos**, ni para permitirlo ni para prohibirlo.
- La Res. SDA 7615 de 2009 prohíbe plantar, trasplantar, vender, distribuir y comercializar retamo. Su título se confirmó en el registro distrital. Es una norma de Bogotá: **no aplica en Tenjo**, que está bajo jurisdicción de la CAR.

**No confirmado — no usar para decidir:**
- **Res. CAR 469 de 2009** («veda» del retamo en la jurisdicción CAR): la cita el texto de la SDA, pero no apareció en ninguna búsqueda directa. Hay que confirmar con la CAR su número, vigencia y alcance.
- **Proyecto de resolución nacional de MinAmbiente** (consulta pública desde 2017): no se sabe si se expidió. Una afirmación sobre su contenido se refutó 1-2, la de que solo permite compostaje o bioextrusión y que el sustrato con semillas viables no puede usarse.
- **Si la Res. 684 de 2018 contempla solo la incineración:** una fuente (UPTC) dice que es el método sugerido; los lineamientos de la SDA listan también compostaje y dejar en sitio. Queda sin resolver.

**Pendiente para Tenjo (igual que DOC-0129 §4):** qué permiso o autorización de la CAR hace falta para recibir chip de retamo, transportarlo y disponer del sustrato agotado. Por precaución, el sustrato agotado debería tratarse como material de retamo y no salir del predio sin ese visto bueno.

## 5. Qué cambia en la propuesta de ensayo (DOC-0129 §5)

Ajustes propuestos, sin aprobar:
1. **Origen del retamo:** pedir el chip **leñoso** de CERESA o de la CAR, con constancia de origen, en lugar de cortar plantas uno mismo. Medir N y C de ese lote (vacío n.º 1).
2. **Molienda:** pulverizar o moler fino, como hizo la tesis, y tamizar. Las espinas son el principal riesgo físico confirmado.
3. **Placa (paso 0):** probar shiitake **y *Hericium*** en agar con decocción de retamo al 0, 1, 5 y 10 %. Para *Hericium* es la única prueba justificable por ahora.
4. **Bolsas:** solo shiitake. *Hericium* pasa a bolsas únicamente si su placa no muestra inhibición **y** T1/T2 de shiitake (15–30 % de retamo) colonizan sin problemas. Empezar con el tratamiento de menos retamo (10–15 %).
5. **Testigo positivo opcional:** un tratamiento de orellana al 30 % de retamo, que replica la tesis, permite separar «el retamo de este lote es inhibitorio» de «la especie no lo tolera».

## 6. Vacíos que siguen abiertos
1. N, C:N y cenizas del **chip leñoso** real (CERESA o CAR), no de brote ni de planta entera.
2. Perfil de fenólicos y alcaloides del leño de *Ulex* solo, y su cambio tras el autoclave.
3. Cualquier dato de *Hericium* sobre leguminosas leñosas. No se encontró ninguno.
4. Requisitos de la CAR para Tenjo, incluida la confirmación o descarte de la Res. CAR 469 de 2009.
5. BE de *Pleurotus* en retamo, que la tesis no reporta.

## Fuentes
- Gavidia Sandival, B. A. y León Martínez, Y. M. (2016). Tesis, Universidad Distrital. https://repository.udistrital.edu.co/handle/11349/2933 — texto completo leído.
- SDA / FDL San Cristóbal / IDIPRON (2020). Informe técnico de aprovechamiento de biomasa de retamo. https://oab.ambientebogota.gov.co/descargar/14998
- SDA. Lineamientos para el control de retamo liso y espinoso. https://www.ambientebogota.gov.co/documents/10184/412485/Lineamientos+Control+retamos+liso+y+espinoso.pdf/1638e4d4-a444-485f-b721-1360be1629b7
- Res. SDA 7615 de 2009. https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=65721
- Pesenti, H. et al. (2017). *BioResources* 12(2). https://bioresources.cnr.ncsu.edu/resources/characterizing-cellulosic-fibers-from-ulex-europaeus/ — releído.
- Tighe-Neira, R. et al. (2014). *Agron. Mesoam.* 25(2):347–355. https://www.redalyc.org/pdf/437/43731480012.pdf — releído.
- Registro ANID de compostaje de *U. europaeus*. https://investigadores.anid.cl/es/public_search/work?id=654362
- Carvajal, D. et al. (2021). *Agric. Nat. Resour.* https://li01.tci-thaijo.org/index.php/anres/article/view/253593
- Xu et al. (2025). *Front. Nutr.* 12. https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1538039/full
- Núñez-Moreno et al. (2020). UPTC. https://redcol.minciencias.gov.co/Record/REPOUPTC2_90b21e0fe4a03893a69dd8e872e22ef4
- Proyecto de resolución de MinAmbiente (sin confirmar si se expidió). https://www.minambiente.gov.co/wp-content/uploads/2021/10/proy-res-prevencion-control-manejo-invasiones-retamo-espinoso-y-retamo-liso.docx
