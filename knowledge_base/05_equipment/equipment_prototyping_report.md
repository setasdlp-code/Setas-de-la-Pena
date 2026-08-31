---
title: Equipos y maquinaria — uso productivo y prototipado
category: equipment
last_reviewed: 2026-08-14
source_of_truth:
  - ../metadata/equipment.yaml
  - ../metadata/consumables.yaml
status: active
---

# Equipos y maquinaria — uso productivo y prototipado

## Cámaras de cultivo

### Martha Tent Terra Fungus 63 in
**Cantidad:** 1.  
**Descripción:** cámara tipo Martha de aproximadamente 165 × 70 × 51 cm (alto × ancho × fondo).  
**Estado:** operacional.  
**Uso productivo previsto:** fructificación, cuarentena y lotes de ensayo.  
**Uso actual en prototipos:** pruebas de humedad relativa, FAE, circulación, ubicación de sensores y configuración de estantes.

### AC Infinity CLOUDLAB 844
**Cantidad:** 1.  
**Descripción:** tienda de cultivo de 48 × 48 × 80 in / 122 × 122 × 203 cm; huella aproximada de 1.49 m² y volumen geométrico aproximado de 3.02 m³.  
**Estado:** operacional.  
**Uso productivo previsto:** cámara piloto de fructificación.  
**Uso actual en prototipos:** ensayos de distribución de humedad, circulación, extracción y comportamiento ambiental con mayor carga de bolsas.

### Tienda de cultivo de hongos con LED y temporizador
**Cantidad:** 1.  
**Descripción:** cámara de cultivo con iluminación LED integrada y temporizador programable; dimensiones no registradas.  
**Estado:** disponible.  
**Uso productivo previsto:** ensayos y lotes pequeños.  
**Uso actual en prototipos:** pruebas de ciclos de iluminación y temporización.

## Humidificación

### VIVOSUN AeroStream H05
**Cantidad:** 1.  
**Descripción:** humidificador ultrasónico de 5 L con Wi-Fi y control mediante aplicación.  
**Estado:** operacional.  
**Uso productivo previsto:** humidificación de cámaras pequeñas.  
**Uso actual en prototipos:** humidificación de la Martha y medición de recuperación de HR frente a ventilación.

### AC Infinity CloudForge T7
**Cantidad:** 1.  
**Descripción:** humidificador de 15 L.  
**Estado:** operacional.  
**Uso productivo previsto:** humidificación de cámaras de mayor volumen.  
**Uso actual en prototipos:** humidificación del CLOUDLAB 844.

## Ventilación y circulación

### AC Infinity CLOUDLINE H4
**Cantidad:** 2.  
**Descripción:** ventiladores de conducto de 4 in, motor EC, regulación de velocidad y clasificación IP65.  
**Estado:** operacionales.  
**Uso productivo previsto:** extracción y FAE.  
**Uso actual en prototipos:** medición de efecto de extracción sobre CO2, HR y temperatura.

### Noctua NF-P12 redux-1700 PWM
**Cantidad:** 1.  
**Descripción:** ventilador de 120 mm, PWM de 4 pines, velocidad máxima de 1700 RPM.  
**Estado:** disponible.  
**Uso productivo previsto:** circulación interna.  
**Uso actual en prototipos:** pruebas de movimiento de aire dentro de cámaras.

### GDSTIME IP68
**Cantidad:** 2.  
**Descripción:** ventiladores axiales de 80 × 80 × 25 mm, 12 V DC, clasificación IP68.  
**Estado:** disponibles.  
**Uso productivo previsto:** circulación en cámaras y módulos húmedos.  
**Uso actual en prototipos:** circulación del módulo de incubación.

## Sensores ambientales

### Inkbird IBS-TH2 Plus
**Cantidad:** 2.  
**Descripción:** termohigrómetros Bluetooth con sonda externa.  
**Estado:** operacionales.  
**Uso:** referencia independiente de temperatura y humedad.

### Sensirion SHT3x / AC Infinity
**Cantidad:** 2.  
**Descripción:** sensores digitales de temperatura y humedad.  
**Estado:** operacionales.  
**Uso:** medición ambiental conectada al sistema de control.

### Klanata SHT45
**Cantidad:** 1.  
**Descripción:** sonda SHT45 en carcasa de acero inoxidable 304, IP67, I2C, 3.3 V.  
**Estado:** disponible.  
**Uso:** medición de temperatura y humedad en prototipos.

### SHT45 breakout
**Cantidad:** 2.  
**Descripción:** placas con sensor Sensirion SHT45 para integración con Arduino/ESP32.  
**Estado:** disponibles.  
**Uso:** desarrollo de nodos ambientales.

### EC Buying MH-Z19C
**Cantidad:** 1.  
**Descripción:** módulo NDIR para medición de CO2.  
**Estado:** disponible.  
**Uso:** medición de CO2 y ensayos de control de FAE.

## Controladores y computación

### ESP32-WROOM-32 ACEIRMC
**Cantidad:** 3.  
**Descripción:** microcontroladores con Wi-Fi/Bluetooth y entradas/salidas para sensores y actuadores.  
**Estado:** operacionales.  
**Uso:** control local de prototipos.

### Raspberry Pi Zero 2 W
**Cantidad:** 1.  
**Descripción:** SBC quad-core de 64 bits con Wi-Fi y Bluetooth.  
**Estado:** disponible.  
**Uso:** gateway, registro y pruebas de servicios locales.

### Vilros Raspberry Pi 4 Model B
**Cantidad:** 1 kit.  
**Descripción:** Raspberry Pi 4 con 4 GB RAM, caja, fuente de alimentación y accesorios.  
**Estado:** disponible.  
**Uso:** Home Assistant, registro y supervisión.

### Adaptador USB-C 5 V / 3 A
**Cantidad:** 1.  
**Descripción:** fuente USB-C de 5 V y 3 A.  
**Estado:** disponible.  
**Uso:** alimentación del Raspberry Pi 4.

## Calefacción e incubación

### QuietWarmth QWARM1.5X5F120
**Cantidad:** 1.  
**Descripción:** alfombrilla eléctrica para suelo flotante de 1.5 × 5 ft / 45.7 × 152.4 cm, 120 V.  
**Estado:** disponible.  
**Uso actual en prototipos:** fuente térmica para ensayos de incubación y medición de gradientes y consumo.

## Potencia y protección eléctrica

### Mean Well LRS-50-12
**Cantidad:** 2.  
**Descripción:** fuentes conmutadas de 50 W, salida de 12 V DC y 4.2 A.  
**Estado:** disponibles.  
**Uso:** alimentación de ventiladores y otros circuitos de 12 V.

### Hosyond 2-channel relay
**Cantidad:** 6 módulos.  
**Descripción:** módulos de 2 relés a 5 V DC con optoacoplador.  
**Estado:** disponibles.  
**Uso:** conmutación experimental de cargas.

### Fastronix relay terminals
**Cantidad:** 10.  
**Descripción:** zócalos y conectores con sellado contra humedad para relés automotrices.  
**Estado:** disponibles.

### WAGO 221
**Cantidad:** 28.  
**Descripción:** conectores eléctricos con palanca.  
**Estado:** disponibles.

### Prensaestopas IP68
**Cantidad:** 20.  
**Descripción:** prensaestopas roscados de nailon, clasificación IP68.  
**Estado:** disponibles.

### Fusibles ZIPCCI
**Cantidad:** 80.  
**Descripción:** fusibles automotrices de cuchilla de varios amperajes.  
**Estado:** disponibles.

### TICONN IP67
**Cantidad:** 2.  
**Descripción:** cajas para componentes eléctricos/electrónicos con clasificación IP67.  
**Estado:** operacionales.

### ELEGOO Dupont
**Cantidad:** 120 cables.  
**Descripción:** cables macho-macho, hembra-hembra y macho-hembra para prototipado.  
**Estado:** disponibles.

## Tratamiento térmico y preparación

### All American
**Cantidad:** 1.  
**Descripción:** esterilizador a presión; capacidad reportada de aproximadamente 44 L, pendiente de verificación en placa.  
**Estado:** en sitio; commissioning pendiente.  
**Uso:** desarrollo de cargas y ciclos térmicos de bolsas de sustrato.

### Estufa doble industrial a gas propano
**Cantidad:** 1.  
**Descripción:** estufa de dos quemadores alimentada con gas propano.  
**Estado:** operacional.  
**Uso:** fuente de calor para el All American.

### Mesón metálico
**Cantidad:** 1.  
**Descripción:** mesón metálico de 1.50 m de longitud.  
**Estado:** operacional.  
**Uso:** preparación, mezcla y embolsado.

## Almacenamiento

### Racks metálicos
**Cantidad:** 3.  
**Descripción:** estanterías metálicas; dimensiones no registradas.  
**Estado:** operacionales.

### Tujurich 5 niveles
**Cantidad:** 1.  
**Descripción:** estantería metálica de 5 niveles, 36.4 in / 92.5 cm de ancho, patas ajustables.  
**Estado:** disponible.

## Consumibles directamente ligados a equipos

### Bolsas Unicorn con filtro
**Cantidad:** 100.  
**Descripción:** polipropileno, 8 × 5 × 20 in / 20.3 × 12.7 × 50.8 cm, espesor registrado de 0.315 mm, autoclavables y con parche de filtro micrométrico.  
**Estado:** disponibles.  
**Nota de reconciliación:** el registro anterior denominado “Terra Fungus” correspondía a este mismo lote de 100 bolsas; no existe un segundo lote separado.

### Bolsas PP 50 × 20 × 12 cm
**Cantidad:** 20.  
**Descripción:** bolsas de polipropileno de 50 × 20 × 12 cm.  
**Estado:** disponibles.

### Vermiculita gruesa
**Cantidad:** pendiente.  
**Descripción:** vermiculita expandida de granulometría gruesa.  
**Estado:** disponible; cantidad pendiente de medir.

## Excluidos o no disponibles

- SCD30 ×2: pedido imposible de entregar; no disponible.
- Relé 3.3 V de 4 canales: pedido cancelado; no disponible.
- Inkbird ICC-500T + S-01: no adquirido; sin compra prevista actualmente.
- UPS APC BE600M1: no adquirida.
- JoyTube: eliminado del inventario y del reporte por corrección del propietario.
