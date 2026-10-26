# Parametros de P. djamor, G. lucidum, sustratos y KPI - corroboracion de Setas OS v5

Fecha: 2026-10-26. Autor: Investigador de Productividad y Especies Tropicales/Medicinales.
Alcance: solo lectura del repo; nada editado.

## 0. Limites del metodo (leer primero)

- WebFetch no pudo abrir ningun dominio (error DNS/proxy). Todo lo "web" proviene de **resumenes de WebSearch** (titulos, URL y fragmentos). No pude leer textos completos ni extraer DOI. Donde no hay autor/ano verificable lo digo; no se inventan citas.
- Fuentes ya curadas en la KB del repo (DOI incluidos en `pleurotus_djamor.md`) se citan como "KB" y no las re-verifique en linea.
- Tiers: A = revisado por pares/experimental; B = extension/boletin institucional/revision; C = cultivadores/proveedores/patente-practica.
- Los rangos "propuestos" son mi sintesis; los marcados **(juicio)** no tienen soporte directo en una fuente y deben tratarse como hipotesis de piloto.
- BE = eficiencia biologica = peso fresco de hongo / peso seco de sustrato x 100 (convencion dominante). Algunos trabajos reportan sobre sustrato humedo y salen 2.5-3x mas bajos; esto explica parte de las discrepancias.

## 1. Lo que dice hoy el repo (contexto)

- `pleurotus_djamor.md` (audit 2026-07-23, confianza media) **ya retiro** la BE universal 80-130 %, el CO2 500-1500/ >1500 ppm y 5-8 ACH, y dice que djamor es candidato futuro, no especie activa. La app (KB_SPP) sigue con be [80,130], co2 2000, cycle [28,40]: **la app esta desfasada respecto a la KB**.
- `ganoderma_lucidum.md` ya da parametros por etapa (Cenicafe 2005) y BE ~13-15 %; la app conserva be [13,40] y hr [30,90] (mezcla fases).
- `production_schedule.md`: BE de referencia 40-70 %, "sin validar". `substrate_library.md`: Master's Mix 80-120 % se cita como referencia de literatura para H. erinaceus y L. edodes, **no** para Pleurotus; "no existe meta de BE del proyecto".
- `contamination.md`: revisar protocolo si >10 %; fila de fallo >20 %.

## 2. Pleurotus djamor

### 2.1 Evidencia

| Fuente | Tier | Dato | Nota |
|---|---|---|---|
| Zurbano, Bellere & Savilla 2017, CLSU Int. J. Sci. Technol. 2(1), doi:10.22137/ijst.2017.v2n1.03 (KB) | A | BE max 31,1 % (paja arroz:cocopeat:salvado 7:3:1); incubacion 32 C | una cepa, Filipinas |
| Salmones 2017, Scientia Fungorum 46:73-85, doi:10.33885/sf.2017.46.1177 (KB) | A/B revision | 22-30 C en estudios citados; BE muy dispersa | revision narrativa |
| ICAR-DMR 2020, "Growing Oyster Mushroom" (KB) | B | spawn run/fructificacion 24-32 C; BE 80-100 % en boletin; vida util 3-4 d; HR 80-85 % | sin diseno experimental publicado |
| Estudio ICAR sobre DMRP-205 en paja de trigo (resultado de busqueda: https://jabonline.in/admin/php/uploads/1247_pdf.pdf u otros de epubs.icar.org.in; no pude abrir el PDF ni confirmar autores) | A (sin verificar autor) | BE 75,11 % con 0,5 % urea; el N es "determinante mayor" | autor/ano no verificados |
| Estudio de paja de trigo/arroz/garbanzo (resultado de busqueda, NBU: https://ir.nbu.ac.in/bitstreams/03c36edb-b496-4b27-a29c-7e348c3f5f3a/download) | A (sin verificar autor) | paja de trigo 44 % BE (440 g/kg seco) | autor/ano no verificados |
| Estudio de 9 meses en paja (https://phytojournal.com/archives/2020/vol9issue5/PartAI/9-5-458-133.pdf, segun fragmento) | A (sin verificar) | BE 45-46 % mejor en julio; correlacion con T negativa y no significativa | sin gradiente termico controlado |
| ICAR, "Influence of environmental conditions on spawn run, pin head formation and BE of Pleurotus djamor" (https://epubs.icar.org.in/index.php/IPPJ/article/view/17440) | A/B | existe; no pude leer valores | pendiente de lectura completa |
| Hoja de cepa comercial North Spore (https://northspore.com/products/pink-oyster-mushroom-culture-plate) | C | fructifica 70-90 F (21-32 C); "no recomendada para produccion en epoca fria" | |
| Root Lab (https://www.rootlab.com.au/product/colonized-mushroom-mycelium-on-agar-plate-pink-oyster-pleurotus-djamor/) | C | fructificacion 18-30 C; sensible al frio, no guardar <10 C | |
| Korean study (12 cepas Pleurotus, grupos baja/media/alta T) y Hungarian pre-fruiting study (https://dea.lib.unideb.hu/items/a16bf1c9-0a20-4a80-a897-328aaf7bdc9a/full; https://m.earticle.net/Article/A194071) | A | la tolerancia al frio varia por cepa dentro de Pleurotus; el ciclo se alarga al bajar T | no es especifico de djamor |
| Estudio colombiano en hojas de platano (resultado de busqueda; sin autor verificado) | A? | BE 24,1 +/- 7,0 % | sustrato pobre |

Busque una cepa de djamor que fructifique a ~15 C: **no hay evidencia** (resultado negativo en la busqueda).

### 2.2 Discrepancias y causas

- BE 24-31 % (Zurbano, banano) vs 44-46 % (paja trigo) vs 75 % (urea, DMRP-205) vs 80-100 % (boletin ICAR): cepa, sustrato, suplemento N, numero de cosechas contadas, base seca vs humeda y ausencia de diseno experimental en el boletin. La app usa el extremo del boletin (80-130) y lo presenta como rango tipico: **no sostenible**.
- El 130 % no tiene fuente que yo haya podido verificar.
- CO2 2000 ppm: la KB ya concluyo que la lectura ">1500 ppm" del boletin ICAR puede ser error editorial. No hay estudio primario. 

### 2.3 Propuesta

| Parametro | App | Rango propuesto | Setpoint | Confianza | Base |
|---|---|---|---|---|---|
| incT (corrida de micelio) | [24,28] | [24,30] | 26 | media | Salmones 2017, ICAR 2020, cepas comerciales (25-30) |
| fruitT | [22,30] | [22,30]; minimo operativo 20 | 26 | media-baja | Salmones; Root Lab 18-30 (C); North Spore |
| hr (fructificacion) | [85,90] | [85,90] | 88 | media-baja | ICAR da 80-85, otras guias 85-90; resolver con piloto. No es HR de incubacion (bolsa cerrada) |
| co2 (fructificacion) | 2000 | objetivo <1000; alerta 1500 **(juicio)** | n/a | **baja** | sin estudio primario; 2000 no se sostiene. Solo reportar morfologia (estipe largo/pileo pequeno = CO2 alto) |
| be (ciclo total, cosechas 1-3, base seca) | [80,130] | [35,75] | 50 | media-baja | 24-31 % a 75 %; 80-100 % solo en boletin |
| cycle (inoculacion a fin de 1a cosecha) | [28,40] | [28,45] | 35 | baja | corrida 10-11 d (ICAR) + fructificacion rapida; sin dato primario de ciclo total |

### 2.4 Viabilidad en Tenjo (T media 13-14 C)

- Djamor es la Pleurotus mas termofila; ninguna fuente verificada lo muestra produciendo a 13 C. A <18-20 C el crecimiento se frena y el ciclo se alarga (patron general de Pleurotus). **No es viable sin recinto calefaccionado** (conclusion consistente con la KB: "no se afirma que Tenjo sea suficiente").
- Estimacion de ingenieria propia (no es cita): camara aislada 3x3x2,5 m (22 m3, ~48 m2 de envolvente, U~0,4 W/m2K => UA~19 W/K) + ventilacion 4 ACH (~29 W/K) => ~48 W/K. Subir de 13 a 26 C (dT=13 K) = ~0,6 kW continuo = ~15 kWh/dia = ~450 kWh/mes por camara, sin contar humidificacion ni perdida por aperturas. Con tarifa de ~COP 800-1000/kWh (supuesto, verificar factura) = ~COP 360-450 mil/mes por camara. La incubacion de bloques genera calor metabolico propio que reduce algo la carga; la fructificacion de 2-4 semanas es la parte cara. Tratarlo como orden de magnitud (+/-50 %), a medir con un datalogger y submedidor.
- Alternativa de bajo costo: calentar solo una zona pequena/incubadora (manta, aislamiento mayor, bolsas en contenedor), o priorizar especies de clima frio (ostreatus 13-24, shiitake 10-16 en fruiting) y dejar djamor para verano/ piloto.

## 3. Ganoderma lucidum: valores POR FASE

### 3.1 Evidencia

| Fuente | Tier | Dato |
|---|---|---|
| Rodriguez Valencia & Jaramillo Lopez 2005, Cenicafe (KB, paper_006) | B | incubacion 25-32 C, sustrato 65-70 % humedad, 30-60 d; primordios 30 C, HR >90 %; sombrero HR 70-80 %; final 30-40 %; CO2 ~350 ppm al abrir bolsa (~d50); luz 50-450 lux; BE 1a cosecha ~15 % (T12 13,1 %) |
| US Patent 4472907, "Method of cultivating Ganoderma lucidum (Fr.) Karst." (https://patents.google.com/patent/US4472907A/en) | C (patente) | colonizacion 15-35 C y HR 40-80 %; primordio HR >=90 %, 100-300 lux; sombrero HR 60-80 %, 600-5000 lux |
| Estudio coreano en agar (https://koreascience.kr/article/JAKO200414364646440.pdf; autores/ano no verificados) | A (agar, no sustrato) | crecimiento vegetativo optimo >3000 ppm CO2; iniciacion acelerada >3000 ppm; no cambia numero/tamano de primordios |
| Stamets 2000; Wachtel-Galor et al. 2011; Zied & Pardo-Gimenez 2017 (KB) | B/C | concordancia general; CO2 alto => antler |
| Sri Lanka, aserrin de caucho/mango/jack (https://jfa.sljol.info/articles/5208; autores no verificados) | A | BE 5,1-5,7 % en el primer mes tras primordios |
| Vietnam 2026 (https://vjol.vista.gov.vn/upt/article/view/135392 - segun resultado; no verificado) | A? | colonizacion 26 d, primera cosecha 84 d, BE total 16,13 % |
| India (ICAR, Mushroom Research; https://epubs.icar.org.in/index.php/MR/article/view/48932; epubs.icar.org.in/index.php/MR/article/view/62436) | A/B | BE 12-15 % (cascarilla de arroz/aserrin de caucho); aserrin de mango +10 % salvado a 500-800 lux mejor |

### 3.2 Tabla por fase (propuesta)

| Fase | T (C) | HR aire (%) | CO2 (ppm) | Luz | Notas | Confianza |
|---|---|---|---|---|---|---|
| Incubacion (bolsa cerrada, 30-60 d) | 25-30 (sp 28) | no controla (humedad del sustrato 60-70 %) | no controlar; en bolsa sube a >3000 sin dano | oscuridad/baja | KB 25-32; patente 15-35 | media |
| Primordio / antler (d~40-60) | 28-30 | >=90 | 1500-5000 si se quiere antler; abrir bolsa si se quiere sombrero | 100-300 lux | patente + Cenicafe | media |
| Desarrollo de sombrero | 27-30 | 70-85 (sp 80) | <1000 (sp ~600-800; 350 es ambiente exterior, inalcanzable en sala cerrada) **(juicio)** | 500-800 lux | Cenicafe 70-80, patente 60-80 | media-baja |
| Maduracion / esporulacion | 26-30 | 50-70 **(juicio)** | <1000 | 500-1000 lux | Cenicafe da 30-40 % HR, patente 60-80 %; 30-40 % no tiene respaldo independiente => discrepancia no resuelta | **baja** |

Para la app: separar `hr` y `co2` por fase. El [30,90] y 2000 actuales mezclan fases y no son setpoints utiles. Si hay un solo escalar, usar HR 80-90 en fructificacion y CO2 <1000 en sombrero.

### 3.3 BE y ciclo

- BE publicada con verificacion razonable: 5-16 % (Sri Lanka, Vietnam, India, Cenicafe 13-15 %). El techo de 40 % de la app **no tiene respaldo** en lo que pude encontrar (las 2das cosechas de Cenicafe, 25-50 % de la primera, no llevan a 40 % de BE).
- Propuesta: BE total [5,20], sp 12; 1a cosecha sp 10. Confianza media.
- Ciclo [90,180] -> [90,150]; sp 110 (primera cosecha ~84 d en Vietnam, 90-120 d Cenicafe). Confianza media.
- Calefaccion: igual que djamor pero 27-30 C durante meses (3-5 meses) => costo energetico mayor por kg; el producto es seco/extracto, con precio/kg alto. Viabilidad economica pendiente (pregunta abierta de la KB).

## 4. KB_SUB.masters_mix.be [80,120]

- Origen: Master's Mix 50:50 aserrin duro:cascarilla de soya, atribuida a T.R. Davis (Earth Angel Mushrooms), por pruebas con 10-70 % de soya (https://grocycle.com/what-is-masters-mix/; Tier C). 
- Busque BE revisada por pares: **no encontre ninguna** para esta formula especifica. Las afirmaciones de 80-120 % vienen de proveedores y cultivadores (Tier C).
- Aptitud por especie (Tier C): ostra y melena de leon, bien; shiitake mal ajustado (puede dar rendimientos menores y cuerpos deformes; prefiere aserrin con poco salvado). Primera cosecha fuerte, cosechas posteriores menores.
- Propuesta: no usar un rango unico. Por especie: P. ostreatus/djamor 50-100 (sp 70); Hericium 50-100 (sp 70); shiitake **no recomendado** para MM 50/50 (usar aserrin con 10-20 % salvado). Confianza baja; marcar como "referencia de cultivadores".
- Nota: la KB solo cita 80-120 % para H. erinaceus y L. edodes en "condiciones controladas", pero el listado de la propia KB (y esta busqueda) no sustenta esa BE para shiitake.

## 5. KPI.yieldPerBlock = 800 g

- No hay fuente; el valor solo tiene sentido si se declara el tamano de bloque, humedad y BE. Relacion: rendimiento fresco = BE x masa seca. Con bloque 3 kg humedo, 60-65 % humedad (masa seca ~1,05-1,2 kg): BE 70 % => ~0,75-0,85 kg (el 800 g actual); BE 55 % => ~0,6-0,65 kg; bloque 2 kg => ~0,5-0,55 kg a BE 70 %.
- Propuesta: reemplazar el escalar por una funcion `yieldPerBlock = BE_target(especie) x masa_seca_bloque`; mostrar BE en base seca. Sin tamano de bloque estandar definido en la KB, 800 g solo vale para ~3 kg a BE ~70 % (Pleurotus, no Ganoderma ni shiitake con BE objetivo menor).

## 6. Umbrales de BE por especie (ciclo total, base seca; "1a cosecha" = flush 1)

Evidencia disponible: shiitake en aserrin 69-86 % (resultados de busqueda: PeerJ 2025, https://peerj.com/articles/18622, "Nabhan et al." segun el resumen de busqueda; DOI no verificado; Royse & Bahler 1986, PMC239248 y Royse 1990, PMC183364; estudios indios 69,4 % y 85,6 % DMRO-388s); Cenicafe T2 shiitake 57,6 % (KB); Hericium: sin BE numerica verificada (Atila et al. 2021 Scientia Horticulturae solo para T de fructificacion 15-25 C segun cepa; Thuy et al. 2019 mejor sustrato 87 % aserrin + salvados, BE no leida; tesis india 15 %); ostreatus 43-76 % en paja/aserrin segun estudios de busqueda; KB cita 70-100 (ostreatus), 40-70 (shiitake). La separacion 1a cosecha vs total viene de patron general (Royse 1990: la mayoria del aumento en 1a cosecha); **los umbrales de 1a cosecha son juicio**, aproximadamente 55-65 % del total para Pleurotus y 40-50 % para shiitake/Hericium.

| Especie | Alerta (<) | Meta | Optimo (>=) | 1a cosecha: alerta / meta | Confianza |
|---|---|---|---|---|---|
| P. ostreatus (paja) | 40 | 60 | 80 | 25 / 40 | media-baja |
| P. djamor | 30 | 50 | 70 | 20 / 30 | baja |
| Shiitake (aserrin suplementado) | 40 | 55 | 75 | 20 / 30 | media-baja |
| Hericium (aserrin/MM) | 30 | 50 | 80 | 20 / 30 | baja (sin BE numerica verificada) |
| Ganoderma | 5 | 10 | 15 | 4 / 8 | media |

El escalar actual (40/55/70) queda dentro del rango de ostreatus y shiitake pero pinta como "optimo" una Ganoderma imposible (nunca alcanza 40) y como "alerta" a Ganoderma sana (12 %).
Hasta tener BE propia: etiquetar como "referencia de literatura, no medido en la finca".

## 7. Contaminacion: 10 % vs 15 %

- Busqueda: **no existe norma publica** de contaminacion aceptable. Datos: guia de finca especializada (SARE Specialty Mushroom Farm Book, https://projects.sare.org/media/pdf/S/p/e/Specialty_Mushroom_Farm_Book__FINAL_1922.pdf; Tier B/C) dice que bolsas con <=40 % de area contaminada aun pueden fructificar, pero el spawn contaminado se descarta; relato de cultivador: 2 % con flujo laminar; India: 12,7-20,7 % en spawn de granos (Indian J. Agric. Sci. 2020, resultado de busqueda); encuesta de Bangladesh: ~30 % en incubacion, <20 % en invierno.
- Propuesta operativa **(juicio)**, por lote: verde <=5 %; ambar 5-10 % (revisar protocolo, = `contamMax` 10); rojo >10 %; critico >=15-20 % (detener, auditoria de esterilizacion; `contamAlert` 15 es defendible como nivel de parada, y la KB ya tiene fila >20 %). Spawn/ grano: alerta >3-5 %. Separar por etapa (incubacion vs fructificacion) y por proceso (autoclave vs pasteurizacion; en paja pasteurizada es mas alta).
- Los dos valores de la app (10/15) no son contradictorios si se rotulan: 10 = ambar/revisar, 15 = rojo/parar. Falta unificar con `contamination.md` ("si supera 10 %, revisar"; ">20 %" fallo de proceso). Confianza media-baja.

## 8. Hallazgos clave

1. La app esta desfasada respecto a la KB ya auditada: be 80-130 de djamor y co2 2000 contradicen `pleurotus_djamor.md`; la evidencia verificable da BE 24-75 % (boletin de 80-100 % es la unica fuente alta).
2. Ganoderma: be [13,40] no tiene respaldo; la literatura da 5-16 %. HR y CO2 deben ir por fase; la HR de maduracion de Cenicafe (30-40 %) choca con la patente (60-80 %) y queda sin resolver.
3. Master's Mix 80-120 % es dato de cultivadores, no de revision por pares, y no aplica a shiitake. yieldPerBlock 800 g debe derivarse de BE x masa seca.
4. Djamor y Ganoderma en Tenjo exigen calefaccion; orden de magnitud ~450 kWh/mes/camara de 22 m3 (estimacion propia).

## 9. Pendientes para verificar (no resueltos aqui)

- Leer completos: ICAR IPPJ 17440 (djamor, ambiente), Atila et al. 2021 (Hericium), Thuy et al. 2019, estudio coreano de CO2.
- Buscar BE revisada por pares de Hericium y de Master's Mix en Pleurotus; BE por flush de shiitake.
- Medir en finca: perdida energetica real, BE propia por lote, tasa de contaminacion por etapa.
