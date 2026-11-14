---
title: "Verificación bibliográfica de extraction-factors.json (Hericium y Ganoderma)"
category: research
document_id: pendiente
status: "PENDIENTE DE VALIDACIÓN"
confidence: low
date: 2026-11-13
last_reviewed: 2026-11-13
species:
  - "Hericium erinaceus"
  - "Ganoderma lucidum"
scope:
  - yield_factor (rendimiento de extracción)
  - optimal_alcohol_pct, optimal_time_hrs, optimal_temp_c
  - cost_per_liter_solvent (solo plausibilidad de orden de magnitud)
related:
  - "field-os-simulador/setas-os/extraction-factors.json"
  - "knowledge_base/09_research/deep_research_synthesis_2026.md"
  - "knowledge_base/09_research/corroboracion_2026-10/extraction.md"
  - "knowledge_base/09_research/intake/app_kb_parameter_discrepancies_2026-09-28.md"
---

# Verificación bibliográfica de `extraction-factors.json`

> Estado: **PENDIENTE DE VALIDACIÓN**. Esta ficha no modifica la app, el JSON ni
> ningún documento del KB. Registra qué respalda la literatura para cada
> parámetro, para que Sebastián decida qué documentar, etiquetar o medir.

## 1. Pregunta y alcance

`python3 scripts/quality/check_kb_sync.py` (2026-11-13) reporta 19 parámetros
"app-only": presentes en `extraction-factors.json` sin respaldo en
`knowledge_base/`. El checker los agrupa por especie y método (12 combinaciones:
orellana gris, shiitake, melena de león y reishi × hidroalcohólica, acuosa,
ultrasonido; para melena y reishi omite los campos de temperatura y % de alcohol
que sí compara contra `deep_research_synthesis_2026.md`).

Pregunta: ¿se pueden defender con literatura los valores de `yield_factor`,
`optimal_alcohol_pct`, `optimal_time_hrs`, `optimal_temp_c` y es plausible el
orden de magnitud de `cost_per_liter_solvent`?

Alcance de esta ronda: **melena de león (*Hericium erinaceus*) y reishi
(*Ganoderma lucidum*)**, 6 combinaciones × 5 campos = 30 campos (incluidos los
6 campos de temperatura/alcohol que el checker ya enfrenta con el KB, porque ese
KB tampoco cita fuente). Orellana gris y shiitake no se re-investigaron aquí:
ver §7.

## 2. Qué hace la app con estos valores

`lab-extraction.jsx` (`calculateYield`): `yieldGrams = biomassGrams * yield_factor`.
La interfaz rotula la entrada como "Biomasa seca procesada: N g". Es decir, la
app **trata `yield_factor` como g de extracto por g de hongo seco** (fracción de
masa), pero el JSON no lo define ni indica solvente-base, compuesto objetivo ni
si el extracto está seco. `calculateCost` suma `(solventLiters * cost_per_liter_solvent)`
más el costo de biomasa (por defecto 45.000 COP/kg). `optimal_*` son parámetros
informativos de protocolo.

## 3. Tabla de verificación (melena de león y reishi)

Veredictos permitidos: `respaldado` / `plausible pero fuera del rango citado` /
`contradicho` / `sin evidencia encontrada` / `no es dato de literatura`.
Las claves [F#] remiten a la lista de fuentes (§6). Todo valor externo viene de
**resúmenes y fragmentos devueltos por la búsqueda web**; ningún texto completo se
pudo abrir (§8).

### 3.1 Melena de león (*H. erinaceus*)

| Método | Campo | App | Qué dice la literatura (rango y condiciones) | Fuentes (tier) | Veredicto |
|---|---|---|---|---|---|
| Hidroalcohólica (doble) | yield_factor | 0,11 | No se halló % p/p de extracto etanólico de cuerpo fructífero. Un extracto con **metanol** de 2,0 kg de cuerpo fructífero seco dio 225 g de goma cruda (~11 %): solvente distinto, no ensayo de etanol. | [F9] (1; solo snippet) | sin evidencia encontrada |
| Hidroalcohólica | optimal_alcohol_pct | 75 | Dos etapas con etanol 95 % y luego 85 % sobre **micelio** liofilizado (patente, sin rendimiento); UAE 80 % para erinacina A en biomasa fúngica (Valu); "doble extracción con etanol moderado" en cuerpo fructífero para ergotioneína/lovastatina/ergosterol (no hericenonas). | [F1] (1), [F8] (1), [F10] (3 patente) | plausible pero fuera del rango citado |
| Hidroalcohólica | optimal_time_hrs | 96 | Ningún estudio localizado mide maceración de 96 h. Los estudios de UAE usan 45 min. | [F1] | sin evidencia encontrada |
| Hidroalcohólica | optimal_temp_c | 25 | Sin estudio localizado de maceración a 25 °C para Hericium. | — | sin evidencia encontrada |
| Acuosa | yield_factor | 0,13 | Extracción enzimática de polisacáridos de cuerpo fructífero: 13,46 ± 0,37 %, descrito como +67,72 % sobre agua caliente; **por cálculo mío** el agua caliente de ese estudio sería ~8,0 %. Patente CN1453295A: ~7 % de precipitado alcohólico (1 kg, 96 °C, 3 h; vía corroboración previa, no re-verificada). El KB (`deep_research_synthesis_2026.md` §1.1) afirma 18–25 % p/p sin cita. | [F6] (1; snippet), [F12] (3), KB sin fuente | plausible pero fuera del rango citado |
| Acuosa | optimal_alcohol_pct | 0 | Agua como único solvente en los estudios citados. | [F5], [F6] | respaldado |
| Acuosa | optimal_time_hrs | 3,5 | RSM Box-Behnken sobre polisacárido crudo: 3,8 h, 81 °C, 25 mL/g (material no confirmado). Patente: 3 h a 96 °C. | [F5] (1), [F12] (3) | respaldado |
| Acuosa | optimal_temp_c | 88 | 81 °C (RSM) y 96 °C (patente); 88 queda entre ambos. | [F5], [F12] | plausible pero fuera del rango citado |
| Ultrasonido | yield_factor | 0,16 | Sin dato de masa de extracto etanólico por UAE para Hericium. Un estudio de UAE + enzima reporta 5,87 ± 0,16 % (polisacárido). Valu mide contenido de erinacina A, no masa de extracto. | [F1], [F7] (1; snippet) | sin evidencia encontrada |
| Ultrasonido | optimal_alcohol_pct | 80 | Valu et al. 2020: etanol 80 %, relación 1:30 g/mL, 45 min, **sobre biomasa fúngica (micelio) de cultivo sólido** (80/1:30/45 min visto vía fuente secundaria del fabricante Hielscher y snippet; no el texto del artículo). | [F1] (1), [F2] (3) | respaldado (para erinacina A en micelio) |
| Ultrasonido | optimal_time_hrs | 1,2 (72 min) | Valu: 45 min. | [F1], [F2] | plausible pero fuera del rango citado |
| Ultrasonido | optimal_temp_c | 45 | La temperatura de Valu no se pudo confirmar. El KB indica 45–50 °C sin cita. | KB sin fuente | sin evidencia encontrada |

### 3.2 Reishi (*G. lucidum*)

| Método | Campo | App | Qué dice la literatura (rango y condiciones) | Fuentes (tier) | Veredicto |
|---|---|---|---|---|---|
| Hidroalcohólica | yield_factor | 0,09 | Rendimiento de extracto 4,9 ± 0,6 % con UAE en etanol 89,5 % (cuerpo fructífero; contenido de triterpenos del extracto 435,6 ± 21,1 mg/g). Patente: 3,1 g de extracto de etanol 50 % (maceración 7 días, 9 mL/g; masa de partida no vista). | [F3] (1), [F11] (3) | plausible pero fuera del rango citado |
| Hidroalcohólica | optimal_alcohol_pct | 80 | Optimizaciones de triterpenos: 62,5 % (calor, 90 °C, 78,9 min), 89,5 % (UAE), 100 % a 60,2 °C 6 h (ácido ganodérico H: 0,88 → 2,09 mg/g polvo). | [F3], [F4] (1) | respaldado (dentro del rango 62,5–100 %) |
| Hidroalcohólica | optimal_time_hrs | 120 | Optimizaciones RSM de triterpenos: 6 h (a 60 °C) y 79 min (a 90 °C). La maceración a temperatura ambiente de la patente dura 7 días (práctica, no optimización). | [F3], [F4], [F11] | plausible pero fuera del rango citado |
| Hidroalcohólica | optimal_temp_c | 28 | Los óptimos citados para triterpenos son 60–90 °C; 28 °C no tiene estudio de optimización localizado. | [F3], [F4] | plausible pero fuera del rango citado |
| Acuosa | yield_factor | 0,10 | Extracto acuoso total: 5,3 / 7,6 / 10,7 / 13,2 % a temperatura ambiente / 50 / 100 / 200 °C (J Food Drug Anal; atribución exacta no verificada). Polisacárido precipitado en agua caliente: 2,97 % (92,4 °C, 5 h 5 min, 21:1) y 3,8 % (otro estudio). | [F13] (1; atribución dudosa), [F14] (1), [F15] (1) | respaldado (para masa de extracto total; no para β-glucanos) |
| Acuosa | optimal_alcohol_pct | 0 | Agua. | [F13], [F14] | respaldado |
| Acuosa | optimal_time_hrs | 2,5 | Óptimos de polisacárido: 4,6 h (87,8 °C) y 5 h 5 min (92,4 °C); otro estudio probó 15–90 min a 70–130 °C. | [F14], [F16] | plausible pero fuera del rango citado |
| Acuosa | optimal_temp_c | 88 | 87,8 °C y 92,4 °C. | [F14], [F16] | respaldado |
| Ultrasonido | yield_factor | 0,13 | UAE etanol 89,5 %: 4,9 ± 0,6 % (Taofiq). UAE etanol 50 %: polisacáridos 0,63 % y triterpenos 0,38 % (Zheng). UAE en agua: 2,78 % (Zhai, polisacárido). Ningún estudio localizado da 13 % para UAE. | [F3], [F17] (1), [F18] (1) | contradicho |
| Ultrasonido | optimal_alcohol_pct | 75 | 89,5 % (Taofiq, triterpenos), 50 % (Zheng, polisacáridos + triterpenos simultáneos). | [F3], [F17] | respaldado (dentro del rango 50–89,5 %) |
| Ultrasonido | optimal_time_hrs | 1,5 (90 min) | 40 min (Taofiq), 34 min (Zhai), 58 min (Alzorqi), 100 min (Zheng). | [F3], [F17], [F18], [F19] | respaldado (dentro del rango 34–100 min) |
| Ultrasonido | optimal_temp_c | 50 | 70 °C (Zhai), 80 °C (Zheng), 81 °C (Alzorqi); la de Taofiq no se vio. | [F17], [F18], [F19] | plausible pero fuera del rango citado |

### 3.3 `cost_per_liter_solvent` (COP/L)

| Especie | Método | App (COP/L) | Veredicto |
|---|---|---|---|
| Melena | hidroalcohólica | 20.000 | no es dato de literatura |
| Melena | acuosa | 2.000 | no es dato de literatura |
| Melena | ultrasonido | 24.000 | no es dato de literatura |
| Reishi | hidroalcohólica | 22.000 | no es dato de literatura |
| Reishi | acuosa | 2.000 | no es dato de literatura |
| Reishi | ultrasonido | 25.000 | no es dato de literatura |

Plausibilidad: **dato comercial local sin verificar.** La búsqueda de esta
ronda ("alcohol etílico 96 % grado alimenticio precio Colombia") no devolvió
ningún precio en COP (solo listados mexicanos y fichas técnicas). La
corroboración previa (`corroboracion_2026-10/extraction.md` §6) reporta listados
de MercadoLibre Colombia de ~24.900–39.000 COP/L para etanol 96 % de 1 L
(retail, sin fecha, vistos por snippet): este documento **no lo re-verificó**.
Si ese dato es correcto, el orden de magnitud de 18.000–25.000 es compatible
con el etanol 96 % comprado por litro, pero la app asigna el mismo costo a
mezclas de distinto % de alcohol y a 2.000 COP/L de agua (el agua potable no
parece costar eso: **estimación mía, sin verificar**).

## 4. Ambigüedades de definición

1. **Qué mide `yield_factor`.** El JSON no lo define; el código lo multiplica por
   gramos de "biomasa seca". Lectura asumida: g de extracto (seco o concentrado,
   no declarado) / g de hongo seco. Los estudios citados miden cosas distintas:
   masa de extracto total (Taofiq 4,9 %; J Food Drug Anal 5,3–13,2 %),
   **polisacárido precipitado** (2–4 % en reishi, ~7 % en patente de Hericium) o
   **contenido de un compuesto** (0,38 % triterpenos, mg/g de ácido ganodérico H).
   No son intercambiables con `yield_factor`.
2. **Compuesto objetivo.** Un mismo método rinde más masa si arrastra azúcares y
   proteínas, y menos si apunta a triterpenos. La app no registra marcador.
3. **Material de partida.** Las erinacinas se estudian sobre micelio (Valu); las
   hericenonas están en cuerpo fructífero (según `deep_research_synthesis_2026.md`
   §1.2, sin cita verificada en esta ronda). El negocio produce cuerpo fructífero;
   la app no distingue.
4. **Base seca vs fresca.** Los estudios usan polvo seco; la app dice "biomasa
   seca" en la UI pero el JSON no lo exige.
5. **Un solvente por método.** Los óptimos de la literatura (Taofiq: 62,5 % con
   calor, 89,5 % con UAE) cambian de solvente según el método, y la app fija un
   solo `optimal_alcohol_pct` por combinación, pese a que el nombre de la
   hidroalcohólica de Hericium es "Doble" (dos solventes, un solo costo/rendimiento).
6. **Contradicción interna del KB:** §1.1 de `deep_research_synthesis_2026.md`
   afirma 18–25 % p/p para la fracción hidrosoluble de Hericium sin cita; la app
   usa 0,13. Los valores localizados en esta ronda (~7–8 %) no respaldan ninguno de los dos.
7. **Ultrasonido > agua.** La app pone el brazo UAE (etanol) con el mayor
   `yield_factor` en melena (0,16 > 0,13 > 0,11) y reishi (0,13 > 0,10 > 0,09). En reishi
   los valores localizados van en sentido contrario para masa de extracto
   (etanol/UAE ~5 %, agua 100 °C ~10,7 %). Para Hericium no hay dato de UAE-etanol.

## 5. Resumen de veredictos (melena de león + reishi, 30 campos)

| Veredicto | N |
|---|---|
| respaldado | 9 |
| plausible pero fuera del rango citado | 9 |
| contradicho | 1 (reishi UAE `yield_factor` 0,13) |
| sin evidencia encontrada | 5 |
| no es dato de literatura | 6 (`cost_per_liter_solvent`) |

"Respaldado" significa que el valor cae dentro de lo que reporta al menos una
fuente en condiciones comparables **según el fragmento visto**; no significa que
sea un óptimo ni que se haya verificado el texto completo. El 0 % de alcohol de
los brazos acuosos cuenta como respaldado de forma trivial.

## 6. Fuentes

Tier 1 = revisado por pares / institucional; Tier 2 = libro técnico/fabricante;
Tier 3 = patente, vendedor, blog. Todas se conocieron por **resultado de
búsqueda web (título/resumen)**; ninguna se abrió completa.

- [F1] Valu, M.-V. et al. (2020). Optimization of Ultrasonic Extraction to Obtain Erinacine A and Polyphenols with Antioxidant Activity from the Fungal Biomass of *Hericium erinaceus*. *Foods* 9(12):1889. DOI 10.3390/foods9121889 (visto en la URL de MDPI). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7766035/ . Tier 1. Mide extracción de erinacina A y polifenoles en biomasa fúngica; el diseño experimental (Box-Behnken, según el JSON) **no se confirmó** (el buscador no pudo confirmarlo).
- [F2] Hielscher Ultrasonics, nota de aplicación sobre extracto de melena de león. https://www.hielscher.com/lions-mane-extract-made-with-ultrasonics.htm . Tier 3 (fabricante). Reporta 80 % etanol, 1:30 g/mL, 45 min.
- [F3] Taofiq, O. et al. (2018). Optimization of ultrasound-assisted extraction of triterpenoids and phenolics from *Ganoderma lucidum* (comparación con extracción asistida por calor). *Food & Function* 9:209–226. DOI 10.1039/c7fo01601h (visto en URL). https://pubmed.ncbi.nlm.nih.gov/29215673/ . Tier 1. Autores completos y título exacto no confirmados (el nombre del primer autor viene del resumen de búsqueda). Un resumen de congreso de 2017 etiqueta el óptimo 78,9 min/62,5 % como maceración y no como calor: **etiquetado del método no resuelto**.
- [F4] Ruan, W. et al. (2014), optimización por RSM de la extracción de triterpenoides de *G. lucidum* (óptimo 100 % etanol, 60,22 °C, 6 h; ácido ganodérico H 0,88 → 2,09 mg/g polvo). Material suplementario en figshare con DOI 10.1080/14786419.2014.938337 (el prefijo sugiere *Natural Product Research*; revista, autores y título completos **no confirmados**). Tier 1 (por confirmar).
- [F5] Optimización Box-Behnken de polisacárido crudo de *H. erinaceus* (3,8 h, 25 mL/g, 81 °C). *中国农业科技导报* 2017, 19(3):131–136. DOI 10.13304/j.nykjdb.2016.622. https://nkdb.magtechjournal.com/CN/Y2017/V19/I3/131 . Tier 1. Rendimiento máximo y material (cuerpo fructífero vs micelio) no vistos.
- [F6] Extracción asistida por enzima de polisacárido de *H. erinaceus* (13,46 ± 0,37 %, +67,72 % vs agua caliente). https://bvbvf1.bib-bvb.de/vufind/PrimoRecord/cdi_proquest_miscellaneous_1465176110 . Tier 1 (registro bibliográfico; autores y revista no vistos).
- [F7] UAE asistida por enzima de polisacárido de *H. erinaceus* (5,87 ± 0,16 %); mencionada en el mismo resultado de búsqueda que [F5]; fuente primaria no identificada. Tier 1 por confirmar.
- [F8] Molecules 2025, 30(15):3094. DOI 10.3390/molecules30153094; PMC12348041. "Influence of Plant-Based Substrate Composition and Extraction Method on Accumulation of Bioactive Compounds in *Hericium erinaceus* Fruiting Bodies". Tier 1. Solo se vio que la doble extracción con etanol moderado fue la más eficaz para ergotioneína, lovastatina y ergosterol (no hericenonas).
- [F9] Hericenonas aisladas de cuerpo fructífero con metanol (2,0 kg → 225 g de goma cruda). https://www.nature.com/articles/ja2010112 . Tier 1 por confirmar (título/autores no vistos; se infiere que es un artículo de *J. Antibiotics*, sin confirmar).
- [F10] Patente de heripenes de micelio de *H. erinaceus* (etanol 95 % 1:25, luego 85 %, con sonicación). https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11648233 . Tier 3.
- [F11] Patente, maceración de reishi en etanol 50 %, 7 días, 9 mL/g, 3,1 g de extracto. https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7618638 . Tier 3 (masa de partida no vista).
- [F12] Patente CN1453295A (agua 20:1, 96 °C, 3 h, ~7 % de precipitado). Citada solo vía `corroboracion_2026-10/extraction.md`; **no re-verificada**. Tier 3.
- [F13] Extracto acuoso de reishi 5,3 / 7,6 / 10,7 / 13,2 % a TA / 50 / 100 / 200 °C, *J Food Drug Anal* (jfda-online.com/journal/vol12/iss1/3, atribución según la corroboración previa, **no re-verificada**). Tier 1 por confirmar.
- [F14] *G. lucidum*, RSM de polisacárido crudo: 92,4 °C, 5 h 5 min, 21:1, 2,967 ± 0,228 % (*Chinese Pharmaceutical Journal* 2025 según el resumen). https://castjournals.cast.org.cn/joweb/zgyxzz/EN/1195009886493852257 . Tier 1.
- [F15] Polisacárido de *G. lucidum* por agua caliente 3,8 % (mencionado en una revisión; https://pmc.ncbi.nlm.nih.gov/articles/PMC7774858). Tier 1 (revisión; cita primaria no vista).
- [F16] Ultrafine powder *G. lucidum*: 4,60 h, 87,83 °C; y estudio de *lingzhi* rojo de la Universidad de Can Tho (70–130 °C, 15–90 min). https://ctujs.ctu.edu.vn/index.php/ctujs/article/download/265/265 . Tier 1 (según resumen).
- [F17] Zheng, S. et al. (2020). UAE simultánea de polisacáridos y triterpenoides de *G. lucidum*, etanol 50 %, 210 W, 80 °C, 50 mL/g, 100 min; 0,63 % y 0,38 %. *PLoS ONE* (enero 2020, https://doaj.org/article/3dff07aade1f4637a121902fcb8d1176). Tier 1. Primer autor inferido por la búsqueda; título y DOI no confirmados.
- [F18] Zhai et al. (2012), UAE de *G. lucidum*: 320 W, 70 °C, 34 min, 2,78 %. *Modern Food Science and Technology* (https://xdspkj.ijournals.cn/xdspkjen/article/pdf/20121223). Tier 1 (en chino, solo resumen).
- [F19] Alzorqi, I. et al. (2017). UAE de β-glucano de *G. lucidum* (Box-Behnken, 590 W, 58 min, 81 °C; 52,33 mg predicho para 0,25 L). *Resource-Efficient Technologies*. https://reffit-tech.tpu.ru/res-eff/article/view/104 . Tier 1; DOI y material no confirmados.
- Fuentes de precio: sin fuente verificada en esta ronda (§3.3).

## 7. Orellana gris y shiitake (fuera de esta ronda)

Los 6 combinaciones de *P. ostreatus* y *L. edodes* no se buscaron de nuevo.
La corroboración previa (`corroboracion_2026-10/extraction.md`) ya los trató con
la misma limitación (solo snippets) y concluyó "sin evidencia" para ambas
hidroalcohólicas; en la app, shiitake acuosa y UAE ya se ajustaron a 0,12 y 0,13.
Quedan como `sin evidencia encontrada`/`no verificado` hasta una ronda propia.

## 8. Límites de esta verificación

- **Ningún texto completo pudo abrirse.** `WebFetch` falló con
  `getaddrinfo ENOTFOUND` para `pmc.ncbi.nlm.nih.gov` y `pubs.rsc.org`: esos
  hosts no están permitidos en la red de esta sesión (habría que permitirlos para
  leer Valu 2020 y Taofiq 2018 completos). `WebSearch` sí funcionó, pero devuelve
  resúmenes redactados por un modelo; los valores numéricos de este documento son
  tan fiables como esos resúmenes.
- Varias citas están incompletas (autores/revista/DOI no vistos) y se marcaron
  como tales; no se completaron de memoria.
- Los valores de Valu et al. 2020 (80 %, 1:30, 45 min) se vieron solo vía fuente
  secundaria de un fabricante y el buscador; temperatura y diseño no confirmados.
- No se halló ningún % p/p de extracto etanólico de cuerpo fructífero de Hericium
  ni estudio de maceración de 96–120 h a 25–28 °C.
- No se encontró precio de etanol ni de agua en COP en esta ronda; el único dato
  local viene de la corroboración previa, no re-verificado.
- Varios estudios miden polisacárido precipitado o contenido de un compuesto, no
  masa de extracto total: la comparación con `yield_factor` es aproximada.
- Un resultado derivado (agua caliente ~8,0 % en [F6]) es un cálculo mío a partir
  de dos cifras del snippet.

## 9. Recomendación de enrutamiento

**Podrían documentarse en el KB con su fuente (tras leer el texto completo):**
temperatura y tiempo de la decocción acuosa de reishi ([F14], [F16]); % de
alcohol y tiempo de UAE de reishi ([F3], [F17], [F18]); etanol 80 % para erinacina
A en micelio ([F1]); decocción acuosa de Hericium 3–3,8 h ([F5]). Cada una con su
material (cuerpo fructífero vs micelio) y compuesto objetivo.

**Deberían etiquetarse como estimación en la app (no editar hasta decidir):**
todos los `yield_factor` de melena y reishi (en especial reishi UAE 0,13, que
contradice ~4,9 %, y los de melena UAE/hidroalcohólica, sin dato); y los
parámetros de maceración (96 h/25 °C melena; 120 h/28 °C reishi), que solo tienen
respaldo de práctica herbolaria no localizado. Añadir `basis`, `marker`,
`feedstock` y `source`/`confidence` por método, como ya propuso
`corroboracion_2026-10/extraction.md` §8.

**Requieren medición local:** rendimiento real (g de extracto seco / g de hongo
seco) por solvente con el cuerpo fructífero de Tenjo, con marcador (β-glucano %,
triterpenos %); y cotización de etanol 96 % y agua a granel en Colombia para
derivar `cost_per_liter_solvent` de la fórmula en lugar de un valor fijo por método.

**Pendiente regulatorio (no verificado aquí):** venta de extractos/tinturas de
reishi y melena y su registro sanitario ante INVIMA (ver corroboración previa §7).
