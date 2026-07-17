---
title: Construcción Paso a Paso — Incubadora 1 + 2
subtitle: Guía completa desde cero. Sin preámbulos.
date: 2026-07-09
---

# CONSTRUCCIÓN INCUBADORA 1: BAÑO MARÍA PASIVO

## FASE 1A: Preparación de la Caja (30 min)

### Materiales necesarios
- Caja Ultraforte 120L
- Icopor 5 cm (3.5 m² total)
- Silicona antihongos × 2 tubos
- Alcohol 70% + paño
- Cuchillo o serrucho para icopor

### Pasos

**1. Limpiar la caja**
```
1. Lavar interior y exterior con agua + jabón
2. Secar completamente con paño
3. Desinfectar interior con alcohol 70%
4. Dejar secar 10 min
```

**2. Cortar icopor para las 4 paredes interiores**
```
Medidas INTERIORES de caja: ~55×35×45 cm

Piezas a cortar (5 cm espesor):
- 2 piezas frontal/trasera: 55 × 45 cm
- 2 piezas laterales: 35 × 45 cm
- 1 pieza tapa interior: 55 × 35 cm (opcional, para más aislamiento)

Herramienta: cuchillo caliente (encendedor en hilo) o serrucho lento
Técnica: marcar con regla, cortar sin prisa (icopor se raja fácil)
```

**3. Encajar icopor en interior**
```
SIN PEGAR AÚN. Solo presionar:

- Pared frontal: encajar y presionar contra la pared interior frontal
- Pared trasera: igual
- Paredes laterales: encajar entre frontal y trasera
- Tapa: presionar en techo interior (si hay espacio)

Objetivo: que queden ajustadas por compresión, sin moverse
```

**Checkpoint 1A**
- [ ] Caja limpia y seca
- [ ] Icopor cortado en 4 piezas (frontal, trasera, 2 laterales)
- [ ] Piezas encajadas sin pegar

---

## FASE 1B: Sellado de Juntas Interiores (45 min + 24h curado)

### Materiales
- Silicona antihongos × 2 tubos
- Pistola de silicona
- Paleta o cucharilla

### Pasos

**1. Aplicar silicona en juntas icopor↔icopor**
```
JUNTURAS CRÍTICAS:
- Esquina frontal-izquierda (donde se unen 3 piezas)
- Esquina frontal-derecha
- Esquina trasera-izquierda
- Esquina trasera-derecha
- Línea piso↔pared frontal (junta horizontal inferior)
- Línea piso↔pared trasera
- Línea piso↔laterales (ambas)

TÉCNICA:
1. Cargar pistola de silicona
2. Aplicar cordón de silicona (línea continua, ~1 cm ancho)
3. Pasar paleta mojada en agua para alisar y presionar
4. Dejar correr el tiempo de curado: 24 HORAS
```

**2. Sellado de tapa (si aplica)**
```
Si la tapa tiene icopor interior:
- Aplicar silicona en junta tapa↔paredes
- Dejar que la tapa descanse sobre el icopor de paredes (sin pegar la tapa a la caja, para poder abrirla después)
```

**ESPERAR 24 HORAS ANTES DE CONTINUAR**

**Checkpoint 1B**
- [ ] Silicona aplicada en todas las juntas principales
- [ ] Silicona curada 24 h (no pegajosa al tocar)
- [ ] Juntas visibles, sin grietas

---

## FASE 1C: Instalación de Rejilla y Agua (30 min)

### Materiales
- Rejilla metal/plástico 50×30 cm
- Agua destilada 6–7 L
- Agua oxigenada 30% (20 ml para 6 L de agua)
- Calentador acuario 50W
- Termómetro analógico (respaldo)

### Pasos

**1. Llenar caja con agua**
```
1. Medir 6–7 L de agua destilada en recipiente
2. Agregar 20 ml de agua oxigenada 30% (aprox. 3 ml por litro)
   → Esto inhibe bacterias sin afectar el micelio
3. Verter agua lentamente en el fondo de la caja
   → Agua llena el fondo unos 5–7 cm de altura
```

**2. Colocar rejilla sobre el agua**
```
1. Posicionar rejilla metal/plástico horizontalmente sobre la superficie del agua
2. La rejilla debe estar elevada mínimo 5 cm sobre el nivel del agua
   → Las bolsas NO deben tocar el agua directamente
3. Verificar que rejilla NO se hunde (si se hunde, sacarla y ajustar)
```

**3. Instalar calentador de acuario**
```
1. Sumergir calentador de acuario 50W completamente en el agua (debajo de la rejilla)
2. Asegurar con pinza o ventosa si es necesario (para que no se mueva)
3. Conectar a corriente (extensión si es necesario)
4. Ajustar termostato a 27 °C (rotuleta en el calentador)
   
NOTA: Esto calienta el agua a 27°C → convección → aire interno ~24–26°C ✅
```

**4. Colocar termómetro de respaldo**
```
1. Sumergir termómetro analógico en el agua (o pegado en la pared interior a mitad de altura)
2. Verificación: debe marcar temperatura ambiente inicial (~14–16 °C en Tenjo)
```

**Checkpoint 1C**
- [ ] Agua destilada + H₂O₂ en la caja (6–7 L, nivel ~5–7 cm)
- [ ] Rejilla presionada horizontalmente sobre agua, sin hundir
- [ ] Calentador sumergido, conectado, termostato a 27 °C
- [ ] Termómetro analógico colocado (lectura verificable)

---

## FASE 1D: Instalación de Sensores SHT31 + Pi Zero (1 hora)

### Materiales
- SHT31 sensor T/HR (dirección I2C 0x44)
- Pi Zero 2W + Micro SD 32GB
- Cables Dupont (M/H para conexión)
- Protoboard 830 puntos
- Resistencias pull-up 4.7kΩ (×2, si el sensor no las tiene)
- USB-C 5V 2.5A (fuente alimentación Pi)

### Pasos

**1. Preparar Pi Zero**
```
1. Instalar Micro SD en Pi Zero
2. Flashear imagen OS:
   a. Descargar Raspberry Pi OS Lite (https://www.raspberrypi.com/software/)
   b. Usar Raspberry Pi Imager para escribir en Micro SD
   c. Al escribir: habilitar SSH + WiFi (SSID + password en imager)
3. Conectar cable USB-C a fuente 5V 2.5A
4. Pi Zero debería bootear (LED rojo = power, LED verde = actividad)
5. Esperar 30–60 seg para que levante el sistema operativo

NOTA: Este paso requiere computadora. Si no tienes acceso, ver alternativa con Arduino abajo.
```

**2. Montar SHT31 en protoboard**
```
CONEXIONES SHT31 (típicamente 4 pines):
- VCC (rojo) → 3.3V o 5V del Pi Zero
- GND (negro) → GND del Pi Zero
- SDA (azul) → GPIO2 (Pin 3 físico del Pi Zero)
- SCL (verde) → GPIO3 (Pin 5 físico del Pi Zero)

TÉCNICA:
1. Encajar SHT31 en protoboard (lado izquierdo, dejar espacio a la derecha)
2. Tomar 4 cables Dupont M/H
3. Conectar:
   - Cable rojo: SHT31 VCC → protoboard fila power (+)
   - Cable negro: SHT31 GND → protoboard fila GND (-)
   - Cable azul: SHT31 SDA → protoboard (recordar: GPIO2)
   - Cable verde: SHT31 SCL → protoboard (recordar: GPIO3)

PULL-UPS (si sensor no los trae):
- 4.7kΩ resistencia: conectar entre VCC y SDA
- 4.7kΩ resistencia: conectar entre VCC y SCL
(Típicamente el SHT31 ya los trae, pero verifica en el datasheet)
```

**3. Conectar protoboard a Pi Zero**
```
Buscar GPIO header del Pi Zero (fila de 40 pines en la esquina):

Mapeo de pines (contando desde esquina):
Pin 1 (esquina) = 3.3V
Pin 2 = 5V
Pin 3 = GPIO2 (SDA)
Pin 4 = 5V
Pin 5 = GPIO3 (SCL)
Pin 6 = GND
...
Pin 9 = GND (otra opción)

Conexiones:
- Protoboard (+) rojo → Pin 1 o Pin 2 (3.3V)
- Protoboard (-) negro → Pin 6 o Pin 9 (GND)
- Protoboard azul (SDA) → Pin 3 (GPIO2)
- Protoboard verde (SCL) → Pin 5 (GPIO3)

TÉCNICA: Usar cables Dupont M/H, presionar firmemente en los pines (requiere fuerza)
```

**4. Instalar librería I2C en Pi Zero**
```
SSH al Pi Zero (desde computadora o desde Tenjo si tienes conexión):
ssh pi@<IP_del_pi_zero>
password: raspberry (por defecto)

Comandos:
$ sudo apt-get update
$ sudo apt-get install -y python3-smbus python3-dev i2c-tools
$ sudo raspi-config
  → Interfacing Options → I2C → Enable
  → Reboot

Verificar que SHT31 aparece en el bus I2C:
$ i2cdetect -y 1
    0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00: -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- 44 -- -- -- -- -- -- -- -- -- -- --   ← AQUÍ debe aparecer "44"
...

Si aparece 0x44: ✅ Sensor conectado correctamente
Si NO aparece: revisa conexiones SDA/SCL, pin 3 vs 5
```

**5. Script Python para leer SHT31**
```python
# archivo: sht31_reader.py
import smbus
import time

bus = smbus.SMBus(1)  # I2C bus 1 (RPi)
addr = 0x44  # Dirección SHT31

def read_sht31():
    try:
        # Enviar comando de lectura (típico SHT31)
        bus.write_i2c_block_data(addr, 0x2C, [0x06])  # CMD: High precision
        time.sleep(0.5)  # Esperar lectura
        
        # Leer 6 bytes (T°, HR, checksum)
        data = bus.read_i2c_block_data(addr, 0x00, 6)
        
        # Decodificar (ver datasheet SHT31)
        temp_raw = (data[0] << 8) | data[1]
        hr_raw = (data[3] << 8) | data[4]
        
        # Convertir a valores reales
        temp_c = -45 + (175 * temp_raw / 65535.0)
        hr_pct = 100 * hr_raw / 65535.0
        
        return temp_c, hr_pct
    except Exception as e:
        print(f"Error leyendo SHT31: {e}")
        return None, None

# Loop de lectura
while True:
    t, hr = read_sht31()
    if t is not None:
        print(f"T={t:.2f}°C  HR={hr:.1f}%  {time.strftime('%Y-%m-%d %H:%M:%S')}")
    time.sleep(30)  # Lectura cada 30 seg
```

**Cargar script:**
```
$ python3 sht31_reader.py

Salida esperada:
T=14.32°C  HR=65.3%  2026-07-09 10:15:30
T=14.35°C  HR=65.5%  2026-07-09 10:16:00
T=14.38°C  HR=65.6%  2026-07-09 10:16:30
...
```

**Checkpoint 1D**
- [ ] Pi Zero bootea, acceso SSH funciona
- [ ] SHT31 aparece en i2cdetect (0x44)
- [ ] Script Python lee T° y HR correctamente
- [ ] Lecturas cambian en tiempo real (no congeladas)

---

## FASE 1E: Instalación del Relé (30 min)

### Materiales
- Relé 4 canales 5V (opto-aislado)
- Cables Dupont
- Protoboard adicional (o extensión de existente)
- Enchufe con corte de alimentación (para QuietWarmth si existe; para Inc 1 opcional)

### Pasos

**1. Montar relé en protoboard**
```
Típicamente relé tiene 8 pines (4 pares):
- Fila izquierda: GND, IN1, IN2, IN3 (entradas desde Pi)
- Fila derecha: COM (común), NC1, NO1, NO2 (salidas hacia actuador)

Encajar relé en protoboard, lado derecho
```

**2. Conectar relé a Pi Zero**
```
ENTRADAS (desde Pi):
- IN1 → GPIO17 (Pin 11)
- GND → GND (Pin 9 o 6)
- VCC (jVCC del relé) → 5V (Pin 2 o 4)

SALIDAS (para corte de emergencia del calentador):
- NC1 (Normally Closed) → Cable positivo del calentador
- COM → Neutral de la toma de corriente
(Si se abre el relé, corta la alimentación del calentador)

NOTA: Si el relé es "opto-aislado", el voltaje de entrada (Pi) y salida (calentador) están aislados eléctricamente ✅ Más seguro
```

**3. Script Python para control del relé**
```python
# archivo: relay_control.py
import RPi.GPIO as GPIO
import time

RELAY_PIN = 17  # GPIO17 (Pin 11)

GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)

# Cortar relé (safety)
GPIO.output(RELAY_PIN, GPIO.HIGH)  # Abre relé = corta calentador

print(f"Relé abierto (seguro). Conecta alimentación del calentador si lo deseas.")

time.sleep(5)

# Cerrar relé (permite calentador)
GPIO.output(RELAY_PIN, GPIO.LOW)   # Cierra relé = permite calentador
print("Relé cerrado (calentador encendido)")

time.sleep(10)

# Abrir relé nuevamente
GPIO.output(RELAY_PIN, GPIO.HIGH)
print("Relé abierto (calentador apagado)")

GPIO.cleanup()
```

**Testeo:**
```
$ python3 relay_control.py

Esperado:
- Relé abierto (seguro). Conecta alimentación del calentador si lo deseas.
- [5 seg de espera]
- Relé cerrado (calentador encendido)
  [Deberías escuchar "click" del relé]
- [10 seg de espera]
- Relé abierto (calentador apagado)
  [Otro "click"]
```

**Checkpoint 1E**
- [ ] Relé montado en protoboard, encajado firmemente
- [ ] Conexiones IN1, GND, VCC → Pi Zero verificadas
- [ ] Script Python ejecuta sin errores
- [ ] Relé emite "click" cuando se activa/desactiva
- [ ] Multímetro: mide continuidad NC1↔COM cuando relé cierra

---

## FASE 1F: Validación Banco de Pruebas (2 horas)

### Setup de prueba
```
Mantener Inc 1 en mesada (no inocular aún)
Ambiente: temperatura ambiente de Tenjo (~14–16 °C)
```

### Prueba 1: Rampup de temperatura
```
1. Encender calentador de acuario (termostato 27 °C)
2. Grabar T° del SHT31 cada 5 min durante 1 hora
3. Gráfico esperado:

   27 °C ████████████████ ← meta
   26 °C 
   25 °C 
   24 °C         ████
   23 °C     ███
   22 °C   ██
   21 °C  █
   20 °C █
   19 °C █
   18 °C
   17 °C
   16 °C █ ← inicio (ambiente)
   
   Tiempo →
   
   Conclusión: T° debe subir lentamente y estabilizar en ~24–26 °C
   Tiempo esperado: 3–5 horas para alcanzar 24 °C
```

### Prueba 2: Estabilidad térmica
```
1. Dejar correr 24 h sin tocar nada
2. Grabar T° cada 30 min (48 lecturas)
3. Calcular:
   - T° máxima
   - T° mínima
   - T° promedio
   - Desviación estándar (varianza)
   
Criterio de éxito: ± 1 °C de variación (máx 25, mín 23)
```

### Prueba 3: HR pasiva
```
1. Encender calentador
2. Grabar HR cada 30 min durante 24 h
3. HR esperada: 70–80% (pasiva por evaporación)
   Si sube a 90%+: hay condensación excesiva, abrir FAE
   Si baja a 60%-: agua se está evaporando mucho, rellenar
```

### Prueba 4: Relé de seguridad
```
1. Mantener calentador prendido
2. Cuando T° suba a 27 °C: ejecutar
   $ python3 -c "import RPi.GPIO as GPIO; GPIO.setmode(GPIO.BCM); GPIO.setup(17, GPIO.OUT); GPIO.output(17, GPIO.HIGH)"
   (Esto abre el relé)
3. Verificar que calentador se apaga (~3 min después)
4. Esperar a que T° baje a 24 °C, cerrar relé nuevamente
5. Verificar que calentador se enciende

Criterio: relé corta alimentación efectivamente cuando T > 28 °C
```

### Prueba 5: Oscuridad
```
1. Cerrar tapa de Inc 1
2. Dentro de la caja: ¿hay luz visible? 
   → Si sí, sellar grietas con silicona negra
   → Si no, ✅ oscuridad total
```

### Prueba 6: FAE pasivo
```
1. Colocar incienso o humo cerca de orificio Poly-fil inferior
2. ¿El humo se aspira lentamente?
   → Si sí, FAE funciona (intercambio mínimo CO₂) ✅
   → Si no, aflojar Poly-fil compactado
```

**Checkpoint 1F — Validación**
- [ ] Rampup 14°C → 24°C en <6 horas
- [ ] Estabilidad térmica ± 1.5 °C en 24 h
- [ ] HR pasiva 70–80% sin condensación excesiva
- [ ] Relé abre/cierra correctamente
- [ ] Oscuridad total (sin luz visible)
- [ ] FAE pasivo funciona (aire circula lentamente)

**Si todo pasa: Incubadora 1 LISTA para inoculación ✅**

---

---

# CONSTRUCCIÓN INCUBADORA 2: ALFOMBRA TÉRMICA + AISLAMIENTO

## FASE 2A: Preparación de la Caja (30 min)

### Materiales
- Segunda caja Ultraforte 120L
- Icopor 5 cm (3.5 m² interior)
- Icopor 7 cm (1.5 m² base)
- Silicona antihongos × 2–3 tubos
- Papel aluminio (opcional, reflexión)
- Alcohol + paño

### Pasos (idénticos a 1A, pero para segunda caja)

**1. Limpiar y desinfectar**
```
Igual que Inc 1
```

**2. Cortar icopor INTERIOR (paredes)**
```
Igual que Inc 1:
- 2 piezas frontal/trasera: 55 × 45 cm (5 cm espesor)
- 2 piezas laterales: 35 × 45 cm (5 cm espesor)
```

**3. Colocar icopor EXTERIOR BAJO LA CAJA (base aislada)**
```
DIFERENCIA CON INC 1:
- Bajo la caja (sin estar dentro): 2 planchas icopor 7 cm
  Medida: 60 × 40 cm cada una (cubierta total de la base de la caja)
- Fijar con cinta transparente o bloques de madera laterales
- Esto crea un colchón aislante bajo toda la caja
```

**4. Encajar icopor interior**
```
Igual que Inc 1: presionar sin pegar paredes interiores
```

**Checkpoint 2A**
- [ ] Caja limpia
- [ ] Icopor 7 cm bajo la caja (base aislada, 2 planchas)
- [ ] Icopor 5 cm interior (paredes) encajado sin pegar

---

## FASE 2B: Sellado de Juntas + Aislamiento de Tapa (45 min + 24h)

### Pasos (igual a 1B, más reflexión opcional)

**1. Aplicar silicona en juntas interiores**
```
Igual que Inc 1 (todas las esquinas icopor↔icopor)
Esperar 24 h curado
```

**2. OPCIONAL — Reflexión Interior (Variante 2B)**
```
Si deseas optimizar para rampup rápido:
- Forrar interior de las 4 paredes con papel aluminio
- Pegarlo con silicona o cinta de aluminio
- Refleja calor, reduce pérdida térmica
- NO es crítico, solo optimización

Si NO haces esto: Variante 2A (solo aislamiento), rampup ligeramente más lento pero igual de funcional
```

**3. Tapa con air gap (Variante 2A recomendada)**
```
Crear "cámara de aire" entre tapas de caja:
- Caja original (tapa plástica) queda abierta
- Sobre ella, colocar una segunda lámina (cartón grueso o madera compensada) con 3–5 cm de aire
- Sobre eso, cubrir con icopor 5 cm
- Resultado: 3 capas con aire como aislante

ALTERNATIVA SIMPLE: Solo icopor 5 cm pegado a tapa interior
```

**Checkpoint 2B**
- [ ] Silicona curada 24 h
- [ ] Reflexión interior (si variante 2B)
- [ ] Tapa aislada (icopor pegado o air gap preparado)

---

## FASE 2C: Instalación de QuietWarmth (30 min)

### Materiales
- QuietWarmth 45W (alfombra térmica)
- Cinta transparente
- Termómetro analógico (respaldo)

### Pasos

**1. Posicionar QuietWarmth bajo la caja**
```
1. Desenrollar la alfombra
2. Colocarla completamente bajo la caja aislada (todo su perímetro)
3. Ajustar para máximo contacto con la base
4. Fijar con cinta transparente en 4–6 puntos (esquinas y lados)
   → Evita que se mueva
```

**2. Conectar a corriente**
```
1. Cable de alimentación: llevar a enchufe cercano (extensión si es necesario)
2. Termostato: Ajustar a 24 °C (para djamor) o 22 °C (para shiitake)
   → Rotuleta o dial en el cable
3. Verificar que luz indicadora prende (confirma alimentación)
```

**3. Colocar termómetro analógico**
```
- Pegar termómetro en interior de la caja (altura media, acceso visual)
- Permite verificación sin abrir (verificar temperatura sin sensor)
```

**Checkpoint 2C**
- [ ] QuietWarmth bajo la caja, fijado con cinta
- [ ] Cable conectado a corriente, luz indicadora prende
- [ ] Termostato ajustado a 24 °C
- [ ] Termómetro analógico colocado y legible

---

## FASE 2D: Instalación del Humidificador (30 min)

### Materiales
- Humidificador ultrasónico 3L
- Agua destilada
- Tubo/manguera difusión (si viene con humidificador)

### Pasos

**1. Llenar humidificador**
```
1. Llenar tanque con 3 L de agua destilada (no agua del grifo)
2. Cerrar tapa del tanque
3. Verificar que sello no pierde agua
```

**2. Posicionar en la caja**
```
1. Colocar humidificador en **esquina FRONTAL INFERIOR** de Inc 2
   → Acceso fácil para rellenar cada 3–5 días
2. Si hay rejilla pequeña disponible: elevar humidificador 2–3 cm
   → Mejor distribución del vapor
3. Tubo de difusión: orientarlo hacia el INTERIOR, no apuntar directo a bolsas
```

**3. Conectar a corriente**
```
1. Enchufe a tomacorriente (extensión si es necesario)
2. Verificar que difusor empieza a expulsar vapor (niebla blanca)
3. Ajustar intensidad si el humidificador tiene dial
```

**Checkpoint 2D**
- [ ] Humidificador lleno con agua destilada
- [ ] Posicionado en esquina frontal inferior (acceso fácil)
- [ ] Conectado, expulsando vapor/niebla
- [ ] Tubo difusión orientado al interior (no hacia bolsas)

---

## FASE 2E: Instalación de Sensores SHT31 + Arduino Nano/Pico W (1 hora)

### Materiales (opción económica — Pico W)
- Pi Pico W (o Arduino Nano 33 si prefieres)
- SHT31 sensor T/HR
- Cables Dupont
- Protoboard
- Micro SD (si usa Pico)
- USB-C 5V 2A fuente

### Pasos para Pi Pico W (más barato)

**1. Preparar Pi Pico W**
```
1. Conectar Pico a computadora via USB-C
2. Descargar MicroPython: https://micropython.org/download/rp2-pico-w/
3. Flashear usando Thonny IDE (IDE para Pico):
   - Descargar Thonny: https://thonny.org
   - Conectar Pico, Thonny detecta automáticamente
   - Cargar archivo MicroPython descargado
4. Pico está listo para programar en Python
```

**2. Montar SHT31 en protoboard (igual que Inc 1)**
```
- VCC → 3.3V
- GND → GND
- SDA → GPIO4 (Pin 6)
- SCL → GPIO5 (Pin 7)
(Mapeo de pines Pico distinto al Pi Zero, ver esquema)
```

**3. Conectar a Pico W**
```
Pico W tiene GPIO header de 40 pines (similar a Pi):
- Pin 36: 3.3V
- Pin 38: GND
- Pin 6: GPIO4 (SDA)
- Pin 7: GPIO5 (SCL)

Técnica igual: cables Dupont M/H, presionar firmemente
```

**4. Script MicroPython para SHT31 + Relé**
```python
# archivo: main.py (copiar a Pico via Thonny)
from machine import I2C, Pin
import time

# Configurar I2C (SDA=GPIO4, SCL=GPIO5)
i2c = I2C(0, scl=Pin(5), sda=Pin(4), freq=100000)

# Dirección SHT31
SHT31_ADDR = 0x44

# Configurar relé (GPIO22 = Pin 29, por ejemplo)
relay_pin = Pin(22, Pin.OUT)
relay_pin.off()  # Relé abierto inicialmente (seguro)

def read_sht31():
    try:
        # Comando lectura SHT31
        i2c.writeto(SHT31_ADDR, b'\x2C\x06')  # High precision
        time.sleep(0.5)
        data = i2c.readfrom(SHT31_ADDR, 6)
        
        # Decodificar
        temp_raw = (data[0] << 8) | data[1]
        hr_raw = (data[3] << 8) | data[4]
        
        temp_c = -45 + (175 * temp_raw / 65535.0)
        hr_pct = 100 * hr_raw / 65535.0
        
        return temp_c, hr_pct
    except:
        return None, None

# Loop principal
setpoint = 24.0  # °C

while True:
    t, hr = read_sht31()
    if t is not None:
        print(f"T={t:.2f}°C HR={hr:.1f}%")
        
        # Control simple:
        if t > 26.0:
            relay_pin.on()  # Abre relé = corta humidificador
        elif t < 22.0:
            relay_pin.off()  # Cierra relé = permite humidificador
    
    time.sleep(30)  # Lectura cada 30 seg
```

**Copiar a Pico:**
```
1. En Thonny, crear archivo nuevo
2. Pegar código arriba
3. Guardar como "main.py" en Pico
4. Pico ejecuta automáticamente al reiniciar
```

**Checkpoint 2E**
- [ ] Pico W flasheado con MicroPython, conectado
- [ ] SHT31 aparece en i2c.scan() [verificar en Thonny REPL]
- [ ] Script ejecuta, lee T° y HR correctamente
- [ ] Relé emite "click" cuando T varía

---

## FASE 2F: Instalación del Relé (20 min)

### Pasos (similar a 1E, pero diferente GPIO)

**1. Montar relé**
```
Relé de 4 canales en protoboard
```

**2. Conectar a Pico W**
```
ENTRADAS:
- IN1 → GPIO22 (Pin 29, ejemplo)
- GND → GND
- VCC → 5V

SALIDAS:
- NC (Normally Closed) → cable del humidificador
- COM → neutro de la toma

Cuando Pico abre el relé: corta alimentación del humidificador
```

**Checkpoint 2F**
- [ ] Relé montado en protoboard
- [ ] Conexiones IN1, GND, VCC verificadas
- [ ] Relé emite "click" en respuesta a GPIO
- [ ] Script controla relé sin errores

---

## FASE 2G: Ventilación Pasiva (FAE) (20 min)

### Pasos (idéntico a Inc 1)

**1. Hacer 2 orificios de 38 mm**
```
- Uno en pared INFERIOR frontal (extracción CO₂, denso)
- Uno en pared SUPERIOR trasera (entrada aire fresco)
Distancia entre ellos: máxima (diagonal opuesta)
```

**2. Compactar Poly-fil en los orificios**
```
1. Rellenar orificio con Poly-fil
2. Presionar/compactar con dedo para reducir flujo
3. Objetivo: aire circula pero lentamente (~50 ppm CO₂ más que ambiente)
```

**Checkpoint 2G**
- [ ] 2 orificios hechos (superior e inferior, opuestos)
- [ ] Poly-fil compactado en ambos
- [ ] Flujo de aire verificable pero lento

---

## FASE 2H: Validación Banco de Pruebas (2 horas)

### Prueba 1: Rampup
```
1. Encender QuietWarmth (termostato 24 °C)
2. Grabar T° cada 5 min durante 1 hora
3. Esperado: sube desde 14 °C hacia 24 °C en 3–4 horas
   (Más rápido que Inc 1 por alfombra bajo base)
```

### Prueba 2: Estabilidad
```
1. Dejar 24 h sin tocar
2. Varianza esperada: ± 1.5 °C (menos estable que baño maría, pero aceptable)
```

### Prueba 3: HR control activo
```
1. Encender humidificador
2. Grabar HR cada 30 min durante 24 h
3. Esperado: sube a 80–85% (activo, no pasivo)
4. Si sube a 95%+: relé corta el humidificador, HR baja
5. Ciclo debe ser visible (humidificador ON/OFF automático)
```

### Prueba 4: Relé seguridad
```
1. Ejecutar script, forzar relé abierto
2. Humidificador se apaga
3. Verificar visualmente (difusor deja de expulsar vapor)
```

### Prueba 5: Oscuridad
```
Igual que Inc 1
```

### Prueba 6: FAE
```
Igual que Inc 1
```

**Checkpoint 2H**
- [ ] Rampup 14°C → 24°C en 3–4 h
- [ ] Estabilidad ± 1.5 °C en 24 h
- [ ] HR sube a 80–85%, relé abre/cierra automáticamente
- [ ] Oscuridad total
- [ ] FAE pasivo funciona

**Si todo pasa: Incubadora 2 LISTA para inoculación ✅**

---

---

# RESUMEN: ANTES DE INOCULAR

## Checklist Final Incubadora 1
- [ ] Estructura: caja + icopor + silicona curada
- [ ] Agua: 6–7 L destilada + H₂O₂
- [ ] Rejilla: elevada 5 cm sobre agua, sin hundirse
- [ ] Calentador: sumergido, 27 °C, encendido
- [ ] SHT31: conectado, leyendo T° y HR correctamente
- [ ] Pi Zero: SSH funciona, script Python ejecuta
- [ ] Relé: abre/cierra correctamente, corta emergencia funciona
- [ ] Validación: 24 h de datos estables, T° 24–26 °C, HR 70–80%
- [ ] Oscuridad: total
- [ ] FAE: circulación de aire lenta pero verificable

## Checklist Final Incubadora 2
- [ ] Estructura: caja + icopor interior + icopor 7 cm bajo base
- [ ] QuietWarmth: bajo caja, 24 °C, encendido
- [ ] Humidificador: lleno, difusor expulsando vapor
- [ ] SHT31: conectado, leyendo correctamente
- [ ] Pico W: MicroPython ejecutando script
- [ ] Relé: abre/cierra, corta humidificador
- [ ] Validación: 24 h de datos, T° 24–26 °C, HR 80–85%, ciclos relé visibles
- [ ] Oscuridad: total
- [ ] FAE: aire circula lentamente

**Cuando ambas pasen validación: LISTAS PARA HONGOS**

---

## Próximo paso

¿En qué fase estás ahora? ¿Necesitas que profundice en alguna sección específica?

Ejemplo: "Estoy en Fase 1C, tengo la caja aislada, necesito help con la instalación del SHT31"
