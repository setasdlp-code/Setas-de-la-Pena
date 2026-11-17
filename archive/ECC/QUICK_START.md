# 🚀 Inicio Rápido — 5 Minutos

## Paso 1: Verificar Python
```bash
python3 --version  # Debe ser 3.9+
```

## Paso 2: Instalar dependencias
```bash
cd ECC
pip install -r requirements.txt
```

## Paso 3: Ejecutar sistema
```bash
# Iniciar (crea estructuras iniciales)
python main.py start

# Ver estado
python main.py status

# Generar resumen del día
python main.py daily-report
```

## Paso 4: Configurar tus sensores
Edita estos archivos con tus valores reales:

**config/thresholds.json**
- Cambia rangos óptimos (temperatura, humedad, CO₂, luz)

**config/workflow_template.json**
- Ajusta duración de fases del ciclo si es diferente de 14 días
- Añade tus tareas específicas

## Paso 5: Conectar sensores
Copia datos de sensores a `data/sensor_readings.jsonl`:

```json
{"timestamp": "2026-06-11T14:30:00Z", "temperature": 21.5, "humidity": 87, "co2": 1200, "light": 750}
```

O integra tu API:
- MQTT → Escucha en `mushroom/sensors/#`
- HTTP → Fetch periódico
- CSV → Importa histórico

## ✅ Listo

Sistema iniciado. Ahora:
1. Los agentes monitorean datos automáticamente
2. Hooks ejecutan cada noche (resumen diario)
3. Datos se guardan en `data/`
4. Reportes se generan en `reports/`

---

**Ver README.md para documentación completa.**
