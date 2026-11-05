---
title: "Microclima verificable y operación recuperable en Tenjo — investigación consultiva"
document_id: DOC-0142
category: research
load_priority: on_request
status: draft
authority: advisory_research
confidence: medium
last_reviewed: 2026-11-05
research_cutoff: 2026-11-04
local_validation: pending
source_sha256: 74c792bb06bb3ccfb5f38c045913d0a215ed5ba18a0c835c32481eb67a2233b7
related_documents:
  - bibliografia.md
  - ../active_research_knowledge.md
---

> **Incorporación autorizada: 2026-11-05.** Cambio editorial/de investigación interpretativa. Se conserva el corte y el estado documental del informe del 2026-11-04; no se declara una inspección ni actualización operacional del 2026-11-05. El contrato de solo lectura y los comentarios sobre archivos externos del cuerpo describen la investigación original, anterior a esta incorporación. No son restricciones ni acciones pendientes de esta edición.
>
> **Autoridad:** investigación consultiva, pendiente de validación local; no modifica SOPs, decisiones, umbrales, protecciones, firmware ni capacidad aprobada. S01–S26 son identificadores locales del dossier y no sustituyen el catálogo global de fuentes. Las limitaciones de acceso a S15/S20 se conservan. Los originales externos permanecen intactos; el SHA-256 del frontmatter identifica el original antes de añadir metadatos y sustituir un enlace a worktree por una nota histórica portable.
>
> **Integración:** rama `codex/kb-microclima-operacion-remota-20261105`, base `bb3851ba72a08e247f8b5ba72ef936b74e090a00`. Las citas del cuerpo permanecen fijadas a sus revisiones de investigación. La incorporación no revalida ni promueve esas revisiones a estado actual del cultivo.

# Microclima verificable y operación recuperable en Tenjo

**Informe consultivo — línea 03. Corte de búsqueda: 4 de noviembre de 2026, America/Bogota.** Responsable: Codex, único investigador de este chat. No es SOP, especificación de compra, autorización de ensayo productivo ni configuración activa. No contiene resultados de campo nuevos.

La decisión inmediata que la evidencia respalda es **calificar la medición y el funcionamiento sin red de un módulo existente antes de automatizar su clima o declarar capacidad**. El inventario permite comenzar una campaña; no demuestra todavía exactitud instalada, caudal efectivo ni autonomía. Se necesitan tres evidencias separadas: instrumentos confiables, respuesta física con carga y respuesta biológica del lote.

## 1. Pregunta, alcance y contrato

**Pregunta:** ¿cómo caracterizar y controlar de forma verificable y recuperable incubación y fructificación a aproximadamente 2600 m, usando los instrumentos y módulos existentes?

**Decisiones que informa:** selección del sensor y su compensación; ubicación representativa y de peor caso; ventilación/humidificación suficientes; secuencia manual → control local; duración tolerable de una falla y capacidad que se puede calificar.

| Campo | Contrato y evidencia |
|---|---|
| Modo / responsable | Research; Codex como responsable único, sin subagentes |
| Baseline | `origin/main` local: `751b8ceff8599c0137507c02ae29a6bf26e07dfd`, comprobado al inicio; sin actualizar refs ni verificar actualidad del remoto |
| Checkout compartido | `feat/web-mockups-derivados`, HEAD inicial `608c5443`; cambios preexistentes en `.claude/launch.json` y archivos no rastreados, preservados |
| Fuentes internas | Lectura mediante `git show origin/main:ruta`; gobernanza, control ambiental, incubación, investigación de altitud/cámaras, ARK, decisiones y estado operacional |
| Autoridad | Solo lectura del repositorio; escritura exclusiva de este informe y bibliografía externos |
| Exclusiones | Firmware, setpoints activos, obras/cumplimiento del edificio, equipos presurizados, mercados, compras, contactos y publicaciones GitHub |
| Aceptación | Fuentes primarias abiertas o límites de acceso explícitos; matriz por afirmación; campaña reproducible; archivos verificados; ningún cambio al repositorio por este trabajo |
| Cierre | Entregar informe y bibliografía con incertidumbres, prioridades y tres decisiones pendientes |

Hipótesis de trabajo: las mayores incertidumbres controlables son metrológicas y de distribución/recuperación, antes que falta de una plataforma más compleja. Se contrasta con manuales, balances y estudios; se deja de buscar cuando cada decisión tiene soporte y se identifican las mediciones que la literatura no puede sustituir.

## 2. Posición documentada del proyecto

La fuente de estado de referencia es el contenido de **main local**, no la rama de diseño ni el inventario de otra investigación. [CURRENT_OPERATIONS](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/CURRENT_OPERATIONS.md), revisado el 2026-11-03, declara preproducción, cero lotes activos y ausencia de evidencia recibida de siembra del microlote. [FARM_BRAIN](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/FARM_BRAIN.md) declara capacidad validada de **0 kg/mes**. Estas son declaraciones documentales; no son una inspección de hoy.

DEC-013 prioriza shiitake. DEC-015 mantiene las cajas secundarias en calificación. DEC-019 permite cepa no identificada para el primer piloto, conservando trazabilidad del spawn y aprobación de la especificación. Por eso, “pendiente de cepa identificada” en documentos anteriores no debe interpretarse como revocación de esa excepción. La clase térmica desconocida sigue limitando especialmente inducción y fructificación. [Decisiones congeladas](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/DECISIONS.md).

Activos **declarados**, a reconfirmar físicamente: CLOUDLAB 844 y Martha; dos H4; T7 y H05 manual; dos SCD30 y un MH-Z19C; SHT45 protegido, dos breakouts SHT45, SHT3x e Inkbird; tres ESP32; Raspberry Pi y gabinetes. DS18B20, barómetro, anemómetro, registrador independiente, medidor de energía y balanza requieren confirmar existencia y condición: un documento que los pide no demuestra disponibilidad. Tampoco queda demostrada la compatibilidad eléctrica de las sondas comerciales SHT3x con I²C accesible.

Hay fechas mezcladas: FARM_BRAIN tiene revisión de noviembre y pie de actualización de agosto; pendientes de septiembre siguen abiertos; la columna “operacional” del hardware coexiste con pruebas ambientales pendientes y campos de lectura vacíos. Se usa el estado explícito de preproducción, sin declarar equipos calificados.

La especificación [DOC-0122](https://github.com/setasdlp-code/Setas-de-la-Pena/blob/751b8ceff8599c0137507c02ae29a6bf26e07dfd/knowledge_base/06_operations/lote1_shiitake_especificacion_ambiental.md) continúa como borrador sin aprobar y declara un piloto de **30 bloques de 2,0 kg**. CURRENT_OPERATIONS describe además un microlote documental de **cuatro bolsas** con otra masa. Ninguna escala califica automáticamente a la otra. DOC-0122 describe restaurar el preset del lote al retorno de energía; el prototipo genérico de control ambiental arranca en OFF. Debe resolverse cuál contrato rige el equipo que se ensaye antes de aprobar recuperación.

Investigación previa ya útil: el informe de altitud del 2026-08-05 rechaza multiplicar ACH universalmente; la síntesis de cámaras del 2026-08-23 exige mapas, carga y fallback; ARK-012 prohíbe importar constantes EWMA y alarmas. El trabajo de factibilidad del 2026-11-03 ya propone medir consumo y estudiar enfriamiento exterior. No se repiten sus mercados ni tratamiento térmico. Se inspeccionaron diferencias/rutas de los worktrees recientes de factibilidad, selección de shiitake y mercado; el intake modular del 2026-11-04 se leyó como material consultivo no verificado y no como decisión. Incluso su referencia a DEC-017 difiere de la prioridad DEC-013 comprobada en main. Véase inventario de fuentes internas en la bibliografía.

## 3. Hallazgos verificados

### 3.1 Presión: distinguir concentración, sensor y transporte de aire

La atmósfera estándar NASA produce aproximadamente **73,84 kPa** a 2600 m mediante `Tstd = 15,04 − 0,00649 h` y `P = 101,29 [(Tstd+273,1)/288,08]^5,256`. Es cálculo de referencia, no presión ni temperatura medidas de Tenjo. `101,325/73,84 ≈ 1,372` expresa una relación de volumen a igual temperatura y cantidad molar; no corrige automáticamente ppm, ventiladores o ACH. [S01, NASA](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/earth-atmosphere-equation-metric/).

La fracción molar de CO₂ se expresa en ppm; la presión parcial es `pCO2 = xCO2 × P`. Una respuesta biológica a menor presión no se deduce de “menos moléculas” sin separar gas en bolsa, difusión, fase, cepa y demanda. ALT07 permanece abierto: no se encontró aquí una validación directa de shiitake a la presión de Tenjo que permita fijar un ajuste biológico universal.

**SCD30.** El manual permite presión ambiente en **mbar**, intervalo de entrada **700–1400**, y esta sustituye la compensación de altitud. La alternativa de altitud fija se conserva si no hay presión confiable. No se añade multiplicador posterior. Registrar estrategia, valor enviado y origen; la presión debe ser absoluta del sitio, no presión meteorológica reducida al nivel del mar. [S02, interfaz §§1.4.1 y 1.4.8](https://sensirion.com/media/documents/D7CEEF4A/6165372F/Sensirion_CO2_Sensors_SCD30_Interface_Description.pdf).

El componente ESPHome consultado presenta una entrada de presión, no una prueba de alimentación barométrica dinámica del firmware instalado. Se verificó además su código de versión 2026.10.2: recibe bar y convierte a mbar. Por tanto, las unidades del manual del sensor no se copian sin conversión a la capa de configuración. No se propone editarla aquí. [S03, documentación](https://esphome.io/components/sensor/scd30/), [implementación de conversión](https://github.com/esphome/esphome/blob/2026.10.2/esphome/components/scd30/scd30.h).

**MH-Z19C.** El manual oficial enlazado por Winsen es **v1.2, 2021-05-14**, no la v1.6 citada en la KB. No documenta comando de presión ni coeficiente universal 1,369. Sí exige ambiente sin condensación, recomienda desactivar autocalibración en aplicaciones agrícolas y fija su cero en 400 ppm. Hay instrucciones de estabilización distintas dentro del manual: más de 20 minutos en la sección de cero y más de 30 en notas; cualquier procedimiento debe resolver esa discrepancia y usar gas conocido. [S04, pp. 3, 7–8 del PDF](https://www.winsen-sensor.com/d/files/manual/mh-z19c.pdf).

**Dictamen:** el factor fijo del MH en `environmental_control.md` y CURRENT_OPERATIONS queda **no verificado para esa unidad**, aunque el mecanismo de sensibilidad a densidad sea plausible. Conservar salida original y cualquier transformación ya existente por separado; no modificarla en producción ni tratarla como referencia certificada. Comparar MH y ambos SCD30 con referencia trazable a la misma presión y en varios niveles estables dentro del rango de uso. Dos sensores concordantes pueden compartir sesgo.

### 3.2 Calibración y condensación: el montaje forma parte del instrumento

Sensirion permite recalibración forzada del SCD30 con referencia conocida y pide funcionamiento previo estable; la autocalibración supone exposición periódica a un fondo que identifica como 400 ppm. En cultivo, ese supuesto puede fallar. La propuesta es verificar ASC y referencia de cada unidad; no ejecutar un “cero al exterior” suponiendo concentración exacta. Comparación cruzada, ajuste y calibración trazable son actividades distintas. [S05, Field Calibration, pp. 1–2](https://sensirion.com/media/documents/33C09C07/620638B8/Sensirion_SCD30_Field_Calibration.pdf).

El SHT4x puede sobrevivir condensación, pero agua líquida sobre el elemento impide seguir cambios de HR; durante el calentamiento sus especificaciones no son válidas. El datasheet consultado es **v7.3, junio 2026**, con duty máximo del heater de **10%**; no se prescribe un ciclo de secado. La exactitud del chip no certifica la sonda ensamblada, membrana, cable ni comportamiento cerca de saturación. [S06, §§4.9 y especificaciones](https://sensirion.com/resource/datasheet/sht4x).

Propuesta de medición: sombra y protección contra gotas, montaje permeable, separación de paredes/calefactores y del chorro de niebla; fotografía del montaje y comparación antes/después. No encerrar NDIR en caja hermética: la guía SCD30 requiere intercambio con el ambiente y evita flujo directo intenso sobre el sensor. [S07, Design-In §§3.1–3.4](https://sensirion.com/media/documents/84D49268/616536CB/Sensirion_CO2_Sensors_SCD30_Design-In_Guidelines_D1.pdf).

Un tubo desecante no es una protección metrológicamente neutra: puede añadir retardo y cambiar la base húmeda/seca de la muestra; algunos materiales pueden alterar el gas. Alternativa sencilla: alojamiento ventilado protegido de goteo, sin secante, y medir su respuesta. Cualquier muestreo remoto necesita comparación lado a lado y prueba de tiempo de respuesta antes de usarlo para eventos rápidos. Esto es una **hipótesis de diseño**, no un montaje validado.

### 3.3 Caudal efectivo, ACH y distribución

H4 figura con **212 CFM** en la ficha del fabricante; no significa caudal instalado continuo, ni por cada nivel del controlador. El mismo producto retiene velocidad después del corte de alimentación: el retorno de energía exige prueba con el controlador real. [S08, ficha H4](https://acinfinity.com/cloudline-h4-humidity-proof-inline-fan-4-with-speed-controller/). El manual A/H también documenta memoria de velocidad. [S09, p. 8](https://store-238e9.mybigcommerce.com/content/CLAB2312X1_231218_CLOUDLINE%20A-H%20Manual.pdf).

El punto real se determina por interacción curva del ventilador–resistencia del sistema. Ductos, filtros, entradas, compuertas y carga cambian esa resistencia; las leyes de ventiladores no autorizan restar un porcentaje fijo de caudal por altitud. AMCA distingue ventiladores volumétricos y presión corregida por densidad. [S10, curvas](https://www.amca.org/educate/articles-and-technical-papers/amca-inmotion-articles/straightening-out-fan-curves.html), [S11, selección y densidad](https://www.amca.org/educate/inmotion-rvsd/duplicate-of-amca-inmotion-magazine-library/duplicate-of-specifying-fans-for-industrial-environments.html).

El intervalo **8,5–13,6 CFM** que aparece al final de `environmental_control.md` es una cifra documental sin medición local examinada aquí. No se adopta como requerimiento de ninguna carga ni se usa para cerrar ALT03.

**Medir:** área interna de sección y promedio de velocidad mediante recorrido de puntos o campana, con configuración completa documentada. `Q = Σ(v_i A_i)` en m³/s. Un anemómetro junto a una rejilla turbulenta, un único punto central o una bolsa que introduce contrapresión no bastan para aprobar caudal. Si no se puede hacer recorrido representativo, registrar limitación y contratar/prestar instrumento o servicio apropiado; no comprar por este informe.

`ACH = 3600 Q/V` para Q en m³/s y V en m³. Con intermitencia, `ACHmedio = 3600 Q_ON d/V` solo si Q_ON se mantiene y `d = tiempo_ON/tiempo_total`; no describe el máximo de CO₂ durante OFF. Declarar si V es geométrico interior o volumen de aire libre y mantenerlo consistente. La recirculación mezcla: no se cuenta como renovación exterior.

NIOSH muestra que mezcla, posición de impulsión/extracción y geometría cambian la dilución; el resultado procede de modelos de espacios confinados, no de bloques fúngicos. No importar sus ACH ni una altura universal de extracción. [S12, discusión pp. 137–140](https://stacks.cdc.gov/view/cdc/205873/cdc_205873_DS1.pdf).

Ensayar posición con extremos, alturas y referencia fija. Si solo hay dos sensores CO₂, dejar uno fijo y rotar otro; repetir posiciones bajo estados equivalentes y registrar el desfase temporal. Una rotación durante cambios de respiración o ventilación no equivale a mapa simultáneo. Usar cintas ligeras o visualización inocua fuera de producto para explorar trayectoria; no introducir humo/residuos en cultivos.

### 3.4 CO₂ y calor: balances útiles, constantes no transferibles

Balance aproximado de cámara mezclada, P y T casi constantes:

```text
n = P V / (R T)                          [mol de gas en cámara]
n dx/dt = G_CO2 + F (x_exterior − x)      [mol/s]
F ≈ P Q / (R T)                         [mol/s de aire]
Q_estacionario = G_CO2 R T / [P (x − x_exterior)]
```

Usar `x = ppm × 10^-6`, T en kelvin y unidades coherentes de P/R. Son balances físicos derivados, no modelos biológicos calibrados. Requieren mezcla, fuente caracterizada y denominador positivo; con P/T variables, condensación o base seca/húmeda distinta hace falta corregir el modelo. CO₂ exterior debe medirse; no fijarlo por conveniencia.

En cámara **sin fuente**, fondo estable y buena mezcla, `k = −pendiente{ln[(C−Cext)/(C0−Cext)]}` estima renovación efectiva; si tiempo está en horas, k queda en h⁻¹. En cámara con respiración no nula, ajustar generación y ventilación o separar ensayo; el decaimiento simple puede dar resultado sesgado. NIST aplicó decaimiento de trazador con múltiples puntos: respalda método y necesidad de representatividad, no una tasa de Tenjo. [S13, estudio y abstract institucional](https://www.nist.gov/publications/continous-measurements-air-change-rates-occupied-house-one-year-effect-temperature-wind). No se recomienda liberar CO₂/SF₆ por cuenta propia; si hace falta trazador deliberado, requiere protocolo y responsable competente. La recuperación de CO₂ natural puede usarse exploratoriamente si hay señal suficiente.

Para calor: `C_eff dT/dt ≈ H_calefactor + H_metab + H_entorno − ρ Q c_p(Tint−Text) − L_v E`, con E positiva al evaporar. La forma es una simplificación; aire, superficie y núcleo no son un único nodo. La masa simulada caracteriza pérdidas/inercia, **no** generación metabólica ni capacidad de enfriamiento con cultivo. No asignar W/kg sin calorimetría o balance local cerrado. Tampoco inferir calor de CO₂ con un coeficiente universal sin sustrato y cociente respiratorio conocidos.

La referencia `Shi et al. 2026, Computers and Electronics in Agriculture 218, 108722` de incubación/control ambiental es bibliográficamente incorrecta: Crossref asigna ese número a **FireViTNet**, 2024. [S14, metadatos del editor depositados en Crossref](https://api.crossref.org/works/10.1016/j.compag.2024.108722).

El trabajo real de Shi es **Agriculture 16(13), 1454, 2026**, DOI `10.3390/agriculture16131454`. Las secciones recuperadas describen Ganoderma, Pleurotus y Auricularia, memoria térmica y ajuste EWMA por conjunto de datos; no son validación de shiitake en Tenjo ni de un controlador cerrado. No respaldan trasladar `α≈0,1`, alarmas de 28 °C/ΔT 5 °C, ni el sobrecalentamiento universal de 4–8 °C que aparece en la KB. No se demuestra que tales cifras sean falsas: **su soporte citado no las establece**. El acceso directo al artículo falló; se recuperaron secciones indexadas del editor y se verificó identidad con Crossref, sin declarar lectura integral. [S15, editor](https://www.mdpi.com/2077-0472/16/13/1454), [metadatos](https://api.crossref.org/works/10.3390/agriculture16131454).

La oportunidad de medir núcleo sí concuerda con ARK-012. Mantener máximos crudos y derivar filtros fuera de línea: filtrar alarmas puede ocultar picos. Cualquier inserción en un bloque requiere testigo de investigación, técnica aprobada y registro del efecto de la sonda; no perforar bolsas sanas comerciales como rutina derivada de este informe.

Matiz de autoridad: DOC-0122 también presenta esos límites como decisiones conservadoras de diseño del piloto, con otras referencias internas. Detectar que una publicación no los demuestra no autoriza eliminarlos ni cambiar una protección. Hay que separar justificación de ingeniería, evidencia biológica y estado de aprobación. Esta investigación solicita revisar su fundamento y coherencia; conserva todas las protecciones existentes.

### 3.5 Humedad, rocío, agua libre y desecación

HR alta puede coexistir con superficie mojada en zona fría y desecación junto a un chorro. Diagnosticar por posición con T/HR, temperatura superficial cuando sea posible, velocidad, pérdida de masa y gotas; una lectura central de HR no decide por sí sola. NPL define HR mediante presión de vapor y proporciona la aproximación Magnus. [S16, ecuaciones 1–2](https://www.npl.co.uk/resources/q-a/dew-point-and-relative-humidity).

```text
e_s(T) = 611,2 exp[17,62 T/(243,12+T)]        [Pa; T en °C]
e = (HR/100) e_s(T)
γ = ln(HR/100) + 17,62 T/(243,12+T)
T_rocio = 243,12 γ/(17,62−γ)                [°C]
VPD_aire = e_s(Taire) − e                   [Pa]
margen_rocio = Tsuperficie − T_rocio        [°C]
```

Ejemplo **calculado, no setpoint**: T=20 °C y HR=90% dan rocío ≈18,31 °C y VPD≈233 Pa. Una superficie a 18 °C tiene margen≈−0,31 °C. La incertidumbre puede superar ese margen; no declarar condensación ausente con una diferencia pequeña. Para potencial de secado superficial usar `e_s(Tsuperficie)−e_aire`; VPD de aire supone misma temperatura y no mide por sí solo pérdida de agua fúngica.

Balance de agua propuesto: `dM_v/dt ≈ E_humidificador + E_bloques + Qρv_entrada − Qρv_salida − condensacion`. `ρv = e/(R_v T)`; si se usa humedad específica, incluir presión y masa de aire seco. Pesar agua consumida, recargas, depósitos, bandejas y bloques; distinguir agua atomizada de vapor efectivamente incorporado. Balance de masa total del bloque incluye respiración/cosecha, por lo que pérdida de peso no equivale automáticamente a evaporación.

El manual T7 pide evitar manguera en U y condensado retenido, usar agua destilada y mantener depósito/equipo; el control UIS puede sustituir los ajustes locales. [S17, instalación T7 pp. 13–16; conexión/limpieza pp. 22–24](https://acinfinity.com/content/CF2409X1_240927_CLOUDFORGE%20Manual.pdf). Verificar revisión contra la unidad física. Ningún VPD de una interfaz diseñada para plantas se adopta como objetivo de shiitake; comprobar compatibilidad y respuesta real del equipo antes de asumir que un relé externo equivale a orden de niebla.

En incubación con bolsas selladas, la KB ya dispone HR diagnóstica y ausencia de humidificación interna: conservar esa frontera. En fructificación, comparar niebla dirigida/difusa y recuperación sin mojar producto. “Sin agua libre” no significa eliminar la hidratación biológica definida por el lote: esta investigación no cambia su manejo.

### 3.6 Evidencia contraria a parámetros universales

Kashino et al. 2016 ensayaron en fase de cultivo de shiitake **20–28 °C** y **1700–4500 ppm**; su abstract informa máximo a **22 °C** y ausencia de efecto de CO₂ sobre rendimiento dentro de ese ensayo. Esto desafía un límite universal de CO₂ para todas las fases; no demuestra ausencia de efecto morfológico en fructificación ni seguridad laboral. Se verificó abstract del editor y disponibilidad del PDF japonés, sin una traducción integral del diseño. [S18](https://www.jstage.jst.go.jp/article/bimi/15/1/15_5/_article/-char/en).

Kashino et al. 2018 reportan ahorro de **25%** en una instalación japonesa durante un año al seleccionar modos de ventilación por T interior/exterior. Su utilidad local es plantear comparación energética; no proyectar ese ahorro ni adquirir recuperador. Aire frío exterior puede reducir calor sensible y aumentar demanda de agua o condensación en superficies. [S19, abstract editorial](https://www.jstage.jst.go.jp/article/bimi/16/2/16_4/_article/-char/en).

Donoghue y Denison 1995 es una referencia pertinente de intercambio gaseoso en bolsa, pero la lectura directa del editor fue bloqueada; no se usan sus cifras ni se afirma relectura completa. El CO₂ de cámara no sustituye gases internos ni oxígeno disponible a través del parche. Cenicafé es una fuente colombiana de cultivo, no certificación del clima actual de esta finca; se verificó su registro editorial y alcance, sin extraer setpoints. [S20, editor](https://www.tandfonline.com/doi/abs/10.1080/00275514.1995.12026525), [S21, Cenicafé](https://publicaciones.cenicafe.org/index.php/bot/article/view/1315).

### 3.7 Autonomía real y recuperación

“Corre localmente” no demuestra “continúa durante una falla”. La documentación ESPHome consultada establece reinicio por defecto de **15 minutos** sin cliente API y también **15 minutos** sin Wi‑Fi, con condiciones específicas. Un ensayo breve puede ocultarlo. No se conoce la versión ni configuración efectivamente instalada. [S22, API](https://esphome.io/components/api/), [S23, Wi‑Fi](https://esphome.io/components/wifi/).

La documentación GPIO advierte que interlocks de software no previenen estados transitorios del arranque y recomienda protección física. `ALWAYS_OFF` no prueba ausencia de pulsos de relé antes de ejecutar código. [S24](https://esphome.io/components/switch/gpio/). Medir salida física y energía, no solo estado del dashboard. Los registros deben distinguir orden emitida de confirmación de flujo/niebla/calor.

Arquitectura propuesta: protección física independiente → lectura/control por módulo → registro local que sobreviva pérdida de red → supervisión central → aviso al cuidador. Una Pi en la LAN puede cubrir pérdida de Internet; no cubre por sí sola caída de Wi‑Fi, API ni de la propia Pi. No se asume que ESPHome almacene y reenvíe todos los datos perdidos. Si la instrumentación actual solo transmite, declarar huecos; para calificación, un registrador independiente o captura local comprobada es dependencia, no funcionalidad existente.

## 4. Matriz de afirmaciones y evidencia

Tier según CANON: Tier 1 = estudio revisado por pares/universidad/agencia pública; Tier 2 = fabricante o referencia técnica; Tier 3 = práctica/hipótesis. “Calidad” indica soporte de la afirmación concreta; no es confianza en transferencia local. **Field-measured nuevo: ninguno.** El sesgo H05 es antecedente declarado por KB, sin serie original examinada aquí.

| Afirmación / decisión | Fuente directa | Tier / calidad | Aplicabilidad y madurez máxima |
|---|---|---|---|
| Presión estándar no es observación de la finca | S01 NASA | T1 oficial; alta para modelo | Cálculo contextual; medir ALT01 |
| SCD30: una estrategia de presión/altitud | S02 §§1.4.1/1.4.8 | T2 fabricante; alta | Insight aplicable; verificar configuración y referencia |
| Bar/mbar dependen de capa | S03 docs y código versionado | T2 software primario; alta | Implicación de diseño; comprobar firmware real |
| Factor MH 1,369 no acreditado por manual leído | S04 + KB ambiental | T2 para manual; factor no verificado | Hipótesis, comparar unidad instalada |
| ASC depende del entorno de referencia | S05 | T2 fabricante; alta | Insight; evaluar exposición real y trazabilidad |
| Sensor mojado/heater no es lectura ambiental válida | S06 | T2 fabricante; alta | Insight; comparar montaje y recuperación |
| Proteger sin volumen muerto | S07 | T2 fabricante; alta | Implicación; medir retardo instalado |
| Nominal H4 no prueba Q de cámara | S08–S11 | T2 fabricantes/asociación técnica; alta | Medición ALT03; sin capacidad demostrada |
| Mezcla/posición importan | S12 discusión | T1 experimental; alta en su modelo | Condicional; no trasladar ACH del estudio |
| Decaimiento requiere interpretación de fuente/mezcla | S13 + balance declarado | T1 estudio; balance físico | Método condicional, no prueba actual |
| Bibliografía 108722 incorrecta | S14 depósito Crossref | Metadatos primarios; alta | Corregir en revisión humana; ninguna regla biológica derivada |
| Memoria térmica merece registro, no α universal | S15 secciones indexadas + ARK-012 | T1 artículo; acceso parcial | Oportunidad de medición; transferencia limitada a otras especies |
| Rocío y potencial de secado dependen de temperatura | S16 | T1 metrología pública; alta | Cálculo diagnóstico, incorporar incertidumbre |
| Manguera/depósito T7 afectan agua libre | S17 | T2 manual; alta | Condicional a revisión y montaje del equipo |
| CO₂/temperatura por fase, no universales | S18 abstract | T1 estudio; detalle metodológico parcial | Contraste conceptual; no setpoint local |
| Aire exterior puede ahorrar energía en un sistema | S19 abstract | T1 estudio; transferencia baja | Hipótesis comparativa; medir costo hídrico y térmico |
| Gases dentro de bolsa difieren de recinto | S20 inaccesible + KB | Soporte local indirecto; no revalidado | Pregunta experimental, sin cifras nuevas |
| Reinicios por falta de conectividad pueden ocurrir | S22/S23 | T2 software oficial; alta | Ensayo de falla; estado instalado desconocido |
| Seguridad por software no basta | S24 | T2 oficial; alta | Implicación; verificación física profesional |
| Clima exterior de Tenjo necesita serie identificada | S25/S26 IDEAM | T1 oficial; alta para acceso, sin serie extraída | Oportunidad ALT01/SH06; no climatología local inventada |

Enlaces completos y localizadores S01–S26: [bibliografía externa](./bibliografia.md). Las hipótesis de diseño y criterios propuestos abajo no reciben Tier 1 por estar cerca de una cita.

## 5. Campaña de medición y ensayos reversibles

**Solo propuesta, sin ejecución autorizada por este informe.** Primero revisión humana de protocolo, seguridad y disponibilidad. Intervención en cultivo activo, energía o sensores invasivos requiere aprobación específica. La duración propuesta organiza evidencia; no garantiza representatividad anual ni causalidad.

### 5.1 Instrumentos, mapa y calidad

Antes de comparar controladores, inventariar ID/serie, modelo exacto, rango, firmware, compensación/ASC, fecha de comparación, montaje, resolución, exactitud aplicable y fuente de tiempo. Registrar instrumento de referencia y certificado, o declarar explícitamente “comparación sin trazabilidad”. No asignar precisión del chip a una sonda comercial completa.

Distribución mínima de trabajo: referencia de recinto fuera del módulo; aire de entrada; zona de carga baja/central/alta; esquina alejada; salida; punto frío superficial si existe sonda adecuada; bloque testigo si se autoriza. Registrar coordenadas relativas al piso y racks, distancia al producto y foto. No se exige comprar un sensor por punto: hacer campañas por módulo y rotación con referencia fija, aceptando límites de simultaneidad. Los dos SCD30 comparten dirección I²C; no presuponer conexión simultánea al mismo bus sin arquitectura compatible.

Comparar T/HR juntos durante **48–72 h**, según plan vigente de KB; cubrir más de una condición de uso sin mojar deliberadamente sensores no aptos. Documentar diferencia, dispersión, retardo y comportamiento después de exposición húmeda normal. Conservar valores crudos; offsets versionados no borran originales. Con sonda rota, valores congelados o mojado, marcar calidad y suspender inferencias.

Para cada par, usar tolerancias del fabricante en ese rango y añadir incertidumbre de referencia, montaje y resolución. Como pantalla conservadora: `B_diferencia ≈ B_sensor1 + B_sensor2 + B_montaje`; no tratarla como intervalo estadístico de 95%. Un gradiente menor que ese presupuesto no queda resuelto. Para rocío, recalcular extremos de T/HR y temperatura superficial; reportar margen con intervalo, no solo centésimas. Para Q, propagar error de área/velocidad y sesgo del recorrido. Tolerancia de control debe superar una incertidumbre compatible; de lo contrario se mejora medición, no se ajusta una histéresis ficticiamente precisa.

### 5.2 Etapas y criterios

| Etapa | Diseño y duración | Métricas / criterio de aceptación propuesto | Dependencia y límite |
|---|---|---|---|
| M0 — Identidad/configuración | Inspección sin actuadores energizados; comparación conjunta 48–72 h | IDs, presión/altitud y estados ASC documentados; diferencia estable explicable por presupuesto; sin datos mojados presentados como válidos | Referencia trazable para afirmar calibración; si falta, resultado solo comparativo |
| M1 — Línea base del sitio | **14 días** continuos: exterior protegido, recinto y módulo disponible; repetir en otra condición estacional | Distribuciones y extremos T/HR/rocío, ciclo día/noche, hueco máximo; uptime válido **≥95%** como mínimo de CANON; declarar si se perdieron las noches críticas | No extrapolar 14 días a clima anual. IDEAM sirve de contexto con estación/altitud/fechas identificadas, no sustituto |
| M2 — Cámara vacía | **72 h**, configuración estable; Q por estados utilizables; maniobras cortas solo supervisadas | Q y método documentados, mapa sin chorros sobre zona producto; recuperación y agua libre; sin control oscilante | Base de KB. No demuestra carga biológica |
| M3 — Masa simulada | **72 h** con masa, geometría y separación registradas, sin cambiar a la vez entrada, niebla y ventilación | ΔT vertical **≤2 °C durante ≥95%** de intervalos, criterio provisional ya existente; interpretarlo con offsets/incertidumbre; sin agua libre sobre zonas críticas | No equiparar masa térmica a respiración. Si no puede resolverse 2 °C con instrumentación, resultado inconcluso |
| M4 — Perfil biológico | Un ciclo liberado con lotes/testigos identificados; muestrear fases distintas | Tnúcleo−Taire y máximos; CO₂ por posición/edad; pérdida de masa ajustada por cosecha/recarga; morfología y calidad | SH06/SH09/ALT04; un ciclo es exploratorio, no permiso de escala |
| M5 — Fallos/recuperación | Banco sin cultivo: Internet, HA/API, Wi‑Fi, sensor y alimentación por separado | Calefacción segura, actuación observable, huecos identificados, recuperación sin acciones inesperadas; prueba de red propuesta **45 min** o más que el mayor timeout real | 45 min es margen de ensayo de ingeniería sobre defaults de 15 min, no autonomía biológica aprobada |
| M6 — Comparación manual/automática | Mismo módulo y carga simulada en bloques alternados; después piloto comparable autorizado | Desviación, exposición fuera de banda, energía, agua, trabajo, ciclos y fallos; automatización no inferior en seguridad y clima y mejor en objetivo previamente elegido | No declarar causalidad biológica por minutos de telemetría. Repetir lotes y tratar módulo/periodo como unidad experimental |

M1–M3 pueden solaparse en tiempo si el exterior y recinto quedan como referencia continua. Guardar T/HR con intervalo propuesto de **30 s** (ya usado en plantillas), sin superar el máximo de **60 s** pedido por incubación. Registrar CO₂ al ritmo útil del instrumento; más frecuencia no elimina tiempo de respuesta. Registrar eventos de relé, puerta, reinicio, niebla y desconexión al ocurrir, aunque el archivo de ambiente sea periódico.

Para un ensayo de respuesta, fijar antes la definición de “recuperado”: retorno a la banda del ensayo durante una ventana estable elegida a partir de su línea base. Registrar tiempo de inicio, máximo, pendiente y persistencia. No comparar tiempos usando bandas distintas entre tratamientos.

### 5.3 Ensayos pequeños que resuelven decisiones

**E1 — Compensación de CO₂.** Comparación simultánea, misma ubicación sin aliento cercano, con referencia trazable y P/T/HR registradas. Evaluar SCD30 con su estrategia documentada y MH con salida original más transformación existente como columna separada. Repetir niveles estables que cubran el uso previsto, sin liberar gas deliberadamente fuera de un protocolo profesional. Analizar sesgo por concentración, deriva y retardo; validar ajuste en un periodo/nivel no usado para estimarlo. Aceptación: residuales compatibles con presupuesto de exactitud de instrumento/referencia en todo el rango de interés. Sin referencia no se “calibra” ni aprueba factor MH. Cierra ALT02 y reduce ALT01; no cierra SH09.

**E2 — Distribución, una variable por vez.** Comparar orientación/posición removible de circulación manteniendo extracción, carga y niebla constantes; después comparar estados medidos de extracción manteniendo geometría. Registrar máximos por posición y CO₂ de fondo. La decisión favorece la configuración con menores gradientes y agua libre sin mayor pérdida de masa del testigo ni consumo injustificado. Si cambios de HR/T acompañan ventilación, describir efecto del sistema completo, sin atribuir morfología solamente a CO₂. La comparación no autoriza modificar rutas entre módulos o dispersar contaminación.

**E3 — Agua y rocío.** En vacío/masa simulada, comparar ubicación removible de descarga del T7 a igual agua suministrada o tiempo de funcionamiento documentado. Pesar bandeja y depósito; observar gotas, margen de rocío y recuperación de HR. Aceptación funcional: ausencia de agua libre en sensores/electricidad y sobre zonas de carga definidas como secas por la KB; recuperación de lectura demostrada. La velocidad de secado que protege carpóforos solo puede aprobarse con cultivo, morfología y pérdida de masa del lote.

**E4 — Calor propio.** Comparar aire y testigo en varias edades del ciclo con masa/posición constantes y ambiente registrado. Estimar desfase y pico diferencial; no llamarlo “calor metabólico puro” porque convección, evaporación y temperatura inicial también contribuyen. Una sonda superficial no representa automáticamente núcleo. El máximo admisible y la banda requieren aprobación por lote; los 28 °C/5 °C de la referencia cuestionada no se incorporan aquí.

**E5 — Manual frente a automatización.** Primero modo observador: guardar qué habría ordenado el controlador sin actuar. Luego banco con las mismas bandas de ensayo aprobadas; alternar periodos manual/local bajo condiciones exteriores comparables y replicar orden para reducir efecto día/noche. En biología, bloquear por edad, proveedor, masa/formulación y posición; varios bloques en una misma cámara no son réplicas ambientales independientes. Un microlote pequeño permite factibilidad, no prueba estadística de superioridad. El tamaño para inferencia se calcula tras estimar variación entre ciclos y diferencia mínima útil, no de forma arbitraria.

Métricas comparables, con fórmulas y denominadores explícitos:

- **Uptime válido:** tiempo con dato fresco y calidad válida / tiempo total del ensayo. Separar “sensor funcionando” de “registro disponible”.
- **Exposición fuera de banda:** minutos por debajo/encima y `∫ distancia_a_banda dt`, en °C·min o ppm·min; banda versionada antes del ensayo.
- **Uniformidad:** `max(Tpos)−min(Tpos)` por instante; percentiles y tiempo sobre criterio. Para CO₂, equivalente por posición y diferencia frente a referencia fija.
- **Recuperación:** tiempo desde evento hasta recuperación definida; máximo y duración de pico, además de promedio.
- **Recursos:** kWh y agua por módulo·día en banco; por lote y kg vendible solo al existir cosecha medida. Trabajo manual en min/módulo·día.
- **Agua libre:** masa recogida y observación por ubicación/periodo; no convertir inspecciones puntuales en garantía continua.
- **Morfología:** fotos a distancia/iluminación constantes con escala; tamaño de sombrero, longitud de estípite, deformación, grietas, área afectada y masa comercial según criterio previo. No existe corte universal adoptado por este informe.

## 6. Fallos y fallback local: matriz a demostrar

La operación manual es base de comparación; también necesita cobertura del cuidador. “Abrir todo” o “mantener último relé” no es fallback universal: puede desecar, enfriar, dispersar contaminación o mantener calor peligroso. La lógica concreta se aprueba tras observar el módulo y la fase.

| Falla ensayada en banco | Respuesta candidata / evidencia exigida |
|---|---|
| Solo Internet | Mantener lectura/control local autorizado y registro LAN; medir qué aviso puede salir realmente sin WAN |
| HA/API caída | Control local verificable más allá de timeout; registro independiente o hueco explícito; ninguna orden retenida de HA se ejecuta sin validación al reconectar |
| Wi‑Fi caída | Comprobar sensor/actuación física y reinicios; no afirmar continuidad de históricos centrales; medir recuperación y hueco |
| Sensor desconectado, congelado o mojado | Detectar por frescura/calidad, no solo valor; inhibición de calefacción/niebla según protocolo; verificación con sensor independiente y cuidador |
| Ventilador parado | Confirmación de flujo/rotación independiente de orden; bloquear calefacción mediante protección adecuada; ensayo no debe implicar bloquear mecánicamente un equipo energizado |
| Corte/retorno de energía | Registrar salida física de relés/controladores y memoria H4/T7; aprobar antes qué contrato aplica: OFF del prototipo genérico o preset del piloto DOC-0122. No dar por resuelta esa diferencia ni reanudar modos no autorizados |
| Relé pegado | Simulación segura por profesional; demostrar corte térmico independiente. No puentear ni probar averías de potencia por instrucciones de este informe |
| Pi/almacenamiento/tiempo fallan | Demostrar mecanismo de copia/recuperación y marcar reloj no sincronizado; evitar registros aparentemente actuales con hora inválida |

Autonomía eléctrica y autonomía de red son distintas. Propuesta de cálculo para evaluación, sin compra: `t_respaldo ≈ energía_útil_Wh × eficiencia / carga_media_W`, con incertidumbre y ensayo real de arranque. Un respaldo de sensores no alimenta necesariamente extractor/humidificador; tiempo biológicamente tolerable se deriva del ensayo de deriva ambiental con masa y después carga biológica autorizada. El cuidador debe llegar antes del menor tiempo validado para alcanzar el límite aprobado, descontando detección, aviso y margen acordado. Sin ese dato, no se declara operación desatendida recuperable.

## 7. Archivos de registro propuestos

Son nombres/esquemas para un futuro ensayo; **no se han creado datos de campo**. Guardar registros fuera de documentos narrativos, exportables como CSV UTF‑8 y con diccionario, unidades y versión. Usar UTC ISO‑8601 en datos y presentación America/Bogota. No guardar credenciales, SSID privados ni secretos del firmware en el paquete de resultados.

| Archivo | Columnas mínimas |
|---|---|
| `instrumentos.csv` | sensor_id, serie, modelo, firmware_version, posicion_id, referencia_id, certificado_id, fecha_verificacion, incertidumbre/tolerancia, fuente, ASC_estado, compensacion_tipo, compensacion_valor, unidad, fecha_configuracion |
| `ambiente_raw.csv` | timestamp_utc, monotonic_ms, boot_id, seq, ensayo_id, modulo_id, lote_id, fase, posicion_id, sensor_id, variable, valor_raw, unidad, calidad, edad_dato_s, reloj_valido |
| `transformaciones.csv` | version, sensor_id, variable, metodo, parametros, fundamento, vigente_desde, responsable; conserva presión y factor sin sobrescribir raw |
| `eventos_actuadores.csv` | timestamp_utc, boot_id, evento, actuador_id, orden, estado_confirmado, modo, causa, fuente_local/remota, version_control, operador |
| `caudal_mapa.csv` | ensayo_id, configuracion_id, posicion/area, velocidad, Q, unidad, instrumento_id, P_abs, T, filtro_estado, nivel_ventilador, puerta_estado, metodo, incertidumbre |
| `agua_energia_carga.csv` | tiempo_inicio/fin, ensayo_id, lote/bloque_id, masa_inicial/final, cosecha/recargas, agua_deposito, agua_bandeja, kWh_inicio/fin, instrumento_id, observaciones |
| `fallos_recuperacion.csv` | fallo_id, inicio, fin, causa_inyectada, respuesta_esperada, respuesta_observada, reinicios, hueco_max, tiempo_deteccion/aviso/recuperacion, resultado, responsable |
| `fotos_manifest.csv` | archivo, timestamp_utc, lote_id, bloque_id, posicion_id, escala, vista, observador, defecto/medida; enlaza foto original |
| `ensayo.md` | pregunta, hipótesis falsable, tratamientos/control, variables fijas, unidad experimental, secuencia/aleatorización, bandas aprobadas y fuente, criterios/parada, desviaciones y firmas |

Separar raw, derivados y resumen; conservar log de cambios, archivos originales y copia verificada por checksum. Un hueco no se rellena con el último valor y se etiqueta como medición. No interpolar sobre un fallo para calcular cumplimiento; reportar por separado tiempo válido y desconocido. Cambios de sensores, ductos, firmware, carga o configuración abren una nueva versión de ensayo.

## 8. Acuerdo, conflicto y novedad frente a KB

| Relación | Evidencia y consecuencia consultiva |
|---|---|
| **Apoya** | Altitud 2026-08-05: balances/medición antes de ACH; ALT01–ALT06 y SH06/SH09 siguen siendo las preguntas correctas |
| **Apoya** | Incubación/control ambiental: cajas ventiladas, HR diagnóstica, núcleo/carga, protección física y control modular |
| **Apoya** | ARK-012/013: conservar historia térmica y calificar espacialmente; un sensor central no demuestra capacidad |
| **Conflicto documental** | CANON §7 conserva SHT3x como primario; ambiental/estado privilegian SHT45. No se resuelve aquí cambiando autoridad: verificar disponibilidad, aprobar elección mediante ruta documental pertinente |
| **Conflicto de soporte** | Factor MH fijo y cita v1.6 frente a manual oficial v1.2; mantener como pendiente metrológico y candidato a revisión, sin edición automática |
| **Conflicto de soporte** | Referencia Shi 108722 y umbrales incorporados a incubación/control; ARK-012 prohíbe trasladarlos. Mantener oportunidad de medir; revisar bibliografía/umbrales con responsable antes de uso |
| **Conflicto de contrato por resolver** | Arranque OFF del prototipo genérico frente a preset de lote en DOC-0122; prueba y criterio deben corresponder al módulo/versión aprobados. Un borrador no acredita firmware desplegado |
| **Novedad** | Prueba de caída más allá de reboot_timeout; diferencia entre pérdida de nube, LAN, Wi‑Fi y energía; registro no se presume persistente |
| **Novedad** | Presupuesto de incertidumbre para gradiente/rocío, conservación raw y prueba de respuesta del montaje; no basta comparar promedios |
| **Novedad** | Relacionar retorno de energía con memoria del controlador comercial, además del relé ESP32; registrar orden y estado físico separados |

Estos son candidatos `applicable_insight`, `design_implication` y `measurement_opportunity`. Su destino eventual sería investigación/ARK; mediciones reales irían a registros de ensayo y estado, y cambios aprobados a decisiones/SOP. Este trabajo no ingresa ni promueve contenido a ninguna capa del repositorio.

## 9. Prioridades, incertidumbres y dependencias humanas

**Prioridad inmediata:** comprobar instrumentos/firmware y resolver qué valores son raw, compensados o calibrados; levantar línea base y mapa de un módulo; demostrar fallos en banco. Es posible avanzar metrología y ensayo vacío sin esperar el ciclo biológico. La validación de cultivo depende de las compuertas de liberación del lote, fuera del alcance de esta línea.

**Prioridad siguiente:** caudal y agua con masa simulada; luego núcleo/CO₂/morfología en piloto liberado. Solo después comparar automatización contra operación manual y ampliar carga. CFD, predicción ML, nube adicional o control predictivo quedan condicionados a que una opción sencilla no satisfaga las métricas.

| Incertidumbre | Qué falta para resolverla |
|---|---|
| Presión real y si hay sensor disponible | Lectura absoluta identificada y comparación; IDEAM con estación, altura, fecha y tipo de presión si se usa contexto |
| Estado y exactitud de cada unidad | Inspección, configuración exportada sin secretos, comparación y certificado de referencia |
| Caudal, volumen y fugas de módulo | Geometría interior, método de Q, mapa con ductos/carga y fondo medido |
| Cepa/clase desconocida | Trazabilidad exigida por DEC-019 y caracterización local; no heredar comportamiento de otro lote |
| Calor/respiración y pérdida hídrica | Registro por edad, masa, bolsa/filtro y posición; piloto representativo |
| Capacidad de fallback | Prueba más allá de timeouts, registro independiente y tiempo real del cuidador |
| Límite seguro de falla | Especificación humana aprobada y ensayo de deriva; no hay autonomía horaria demostrada |
| Estacionalidad | Repetición en condiciones exteriores distintas y contraste con series oficiales identificadas |

Sebastián debe aprobar protocolo, bandas del lote, criterios de interrupción, roles y cobertura presencial. Un profesional competente debe revisar pruebas/protecciones eléctricas y fallos de potencia; un laboratorio o servicio metrológico puede ser necesario para la referencia CO₂/caudal. Sensor de cultivo y CO₂ para morfología no sustituyen evaluación de aire respirable y SST. No se determina cumplimiento del edificio ni se realizan adquisiciones por esta investigación.

**Las tres decisiones que más evidencia necesitan:**

1. **Qué cadena CO₂ es confiable para Tenjo.** Presión absoluta, estrategia SCD30, ASC, comparación trazable y error real del MH antes de mantener o sustituir su factor.
2. **Qué carga y recorrido de aire puede sostener cada módulo sin sobrecalentar, mojar o desecar.** Q medido, gradientes, núcleo, agua y respuesta de la cepa; ningún ACH o ppm de literatura lo cierra solo.
3. **Cuándo puede reemplazarse vigilancia manual por automatización local recuperable.** Fallos prolongados de red/energía, datos persistentes, estados físicos seguros y llegada del cuidador antes del límite validado.

## 10. Alcance de búsqueda y comprobación

Se buscó en español e inglés: manuales SCD30/MH-Z19C/SHT4x, guías de montaje/calibración, ESPHome API/Wi‑Fi/GPIO, H4/T7, balances/ventiladores/trazador, temperatura de bloques y estudios de shiitake de la KB. Se abrieron fuentes de fabricante, NASA, NPL, NIST, NIOSH, IDEAM, Cenicafé y editores científicos. No hubo acceso NotebookLM y no fue necesario para completar esta revisión. No se realizó revisión sistemática exhaustiva ni visita a finca.

Los PDFs se consultaron por texto/locatores relevantes; no se extrajeron cifras de gráficos ilegibles. Los artículos japoneses se usaron por abstract editorial; no se afirma revisión metodológica íntegra. MDPI presentó 429/403 y el editor de Mycologia 403; sus límites están declarados. Crossref confirmó identidades, no resultados biológicos. Búsqueda hasta el 2026-11-04: evidencia posterior o estado remoto no comprobado quedan fuera.

Se conservaron cambios ajenos. Se crearon únicamente este informe y su bibliografía en el directorio externo autorizado; no se ejecutó ningún ensayo, modificación del producto, commit, push, PR, compra ni intervención.

**Comprobación final de concurrencia:** otra actividad actualizó `origin/main` local a `e9ded3021c73e821b19d192ea772ae00408b7bbd` durante esta sesión. Se comparó con el baseline: los documentos de estado, incubación, sensores y DOC-0122 no cambiaron; DECISIONS añadió DEC-022 sobre formatos de producto, fuera de este alcance, sin alterar DEC-013/015/019. Se conserva el baseline inicial en todas las citas. Este investigador no actualizó refs ni verificó publicación remota. Los enlaces locales y estructura de ambos archivos se comprobaron; `git diff --check` del checkout no reportó errores.
