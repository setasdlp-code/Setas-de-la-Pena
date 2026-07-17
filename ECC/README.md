# 🍄 Setas de la Peña — Sistema de Decisiones Automáticas

Sistema modular de automatización y análisis para cultivo de setas basado en **ECC (agent harness performance optimization)**.

> **Estado actual:** prototipo de software no comisionado. Las acciones automáticas están deshabilitadas en `config/workflow_template.json` hasta verificar inventario, sensores, ventilación y control manual. El sistema puede usarse para consulta y pruebas sin actuadores.

**Objetivo:** Decisiones automáticas de bajo costo basadas en datos de sensores, documentación de operaciones, análisis histórico y orquestación de tareas.

---

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar/navegar al directorio del proyecto
cd /path/to/Setas\ de\ la\ Peña/ECC

# Crear entorno virtual (opcional pero recomendado)
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Primera ejecución

```bash
# Iniciar sistema (ejecuta hooks de configuración)
python main.py start

# Ver estado actual
python main.py status

# Mostrar ayuda
python main.py help
```

---

## 📁 Estructura del Proyecto

```
ECC/
├── main.py                          # Orquestador principal
├── requirements.txt                 # Dependencias Python
├── README.md                        # Este archivo
│
├── AGENTS.md                        # Definición de 5 agentes
├── config/
│   ├── thresholds.json             # Rangos óptimos de sensores
│   └── workflow_template.json      # Fases del ciclo (14 días)
│
├── skills/
│   └── SKILLS.md                   # 20+ skills reutilizables
│
├── hooks/                           # Scripts de automatización
│   ├── session_start.py            # Al iniciar sistema
│   └── daily_summary.py            # Resumen cada noche
│
├── data/                            # Almacenamiento de datos
│   ├── sensor_readings.jsonl       # Lecturas de sensores (línea por línea)
│   ├── alerts.jsonl                # Alertas y anomalías
│   ├── current_cycle.json          # Estado del ciclo actual
│   ├── system_state.json           # Estado del sistema
│   └── ... (otros datos)
│
└── reports/                         # Reportes generados
    ├── daily_2026-06-11.md         # Resumen del día
    ├── cycle_report_2026-06-01.md  # Análisis del ciclo completo
    └── ... (otros reportes)
```

---

## 🧠 Agentes (Decisiones Automáticas)

| Agente | Función | Triggers |
|--------|---------|----------|
| **monitoring-agent** | Lee sensores, detecta anomalías, ejecuta acciones | Cada 5-15 min |
| **growth-intelligence-agent** | Predice cosechas, sugiere optimizaciones | Diario |
| **quality-control-agent** | Registra calidad, detecta defectos | En cosecha |
| **cost-optimizer-agent** | Rastraza gastos, identifica ineficiencias | Semanal |
| **orchestration-agent** | Coordina ciclos complejos, maneja fallos | Por ciclo |

---

## 🛠️ Skills (Funcionalidades)

Cada agente ejecuta **skills** reutilizables:

### Monitoreo
- `sensor-data-ingestion` — Lee y normaliza datos
- `anomaly-detection` — Detecta valores fuera de rango
- `action-trigger` — Ejecuta acciones automáticas

### Inteligencia
- `growth-pattern-learning` — Aprende de datos históricos
- `harvest-date-predictor` — Predice cosecha ±3 días
- `optimization-suggester` — Propone mejoras

### Calidad
- `harvest-inspection` — Registra calidad en tiempo real
- `defect-root-cause` — Identifica por qué hay problemas

### Costos
- `cost-tracking` — Registra gastos
- `efficiency-ratio` — Calcula costo/kg
- `energy-optimizer` — Reduce consumo eléctrico

### Orquestación
- `workflow-scheduler` — Planifica ciclos
- `parallel-task-executor` — Ejecuta múltiples tareas
- `failure-recovery` — Se recupera de fallos

Ver `skills/SKILLS.md` para descripción completa de cada skill.

---

## ⚙️ Configuración

### Configurar rangos de sensores
Edita `config/thresholds.json`:

```json
{
  "temperature": {
    "optimal_min": 20,
    "optimal_max": 30,
    "unit": "Celsius"
  },
  "humidity": {
    "optimal_min": 85,
    "optimal_max": 90,
    "unit": "percent"
  },
  ...
}
```

### Configurar workflow del ciclo
Edita `config/workflow_template.json`:

```json
{
  "phases": [
    {
      "phase_name": "Inoculación",
      "days": "1",
      "tasks": ["Plantar micelio", "Riego inicial"],
      "optimal_conditions": {...}
    },
    ...
  ]
}
```

---

## 📊 Datos

### Formato de lecturas de sensores
`data/sensor_readings.jsonl` (una línea = un JSON):

```json
{"timestamp": "2026-06-11T14:30:00Z", "temperature": 21.5, "humidity": 87, "co2": 1200, "light": 750}
{"timestamp": "2026-06-11T14:35:00Z", "temperature": 21.6, "humidity": 86, "co2": 1210, "light": 751}
```

### Formato de alertas
`data/alerts.jsonl`:

```json
{"timestamp": "2026-06-11T14:45:00Z", "severity": "warning", "parameter": "humidity", "value": 82, "message": "Humedad bajo rango óptimo"}
```

### Ciclo actual
`data/current_cycle.json`:

```json
{
  "planted_date": "2026-06-01",
  "current_day": 10,
  "predicted_harvest": "2026-06-13",
  "prediction_confidence": 0.85
}
```

---

## 🔄 Hooks (Automatización)

Los hooks son scripts que se ejecutan en eventos específicos:

### `session_start.py` → Al iniciar
- Carga configuración
- Inicializa agentes y skills
- Muestra estado del sistema

**Ejecutar manualmente:**
```bash
python hooks/session_start.py
```

### `daily_summary.py` → Cada noche (23:00)
- Agrega lecturas del día
- Calcula estadísticas
- Detecta patrones
- Genera resumen Markdown

**Ejecutar manualmente:**
```bash
python hooks/daily_summary.py
```

---

## 📈 Reportes

Generados automáticamente en `reports/`:

### Resumen Diario
`daily_2026-06-11.md`
- Promedios de sensores
- Alertas del día
- Estado del ciclo
- Recomendaciones

### Análisis del Ciclo
`cycle_report_2026-06-01.md`
- kg producidos
- Costo/kg
- Calidad (% premium)
- Lecciones aprendidas
- Comparación con ciclos anteriores

---

## 🔌 Integración con Sensores

### Opciones de conexión:

**1. MQTT (recomendado para bajo costo)**
```python
import paho.mqtt.client as mqtt

client = mqtt.Client()
client.connect("your_mqtt_broker", 1883, 60)
client.subscribe("mushroom/sensors/#")

def on_message(client, userdata, msg):
    # Procesar datos y guardar en sensor_readings.jsonl
    pass
```

**2. HTTP API**
```python
import requests

response = requests.get("https://your_api/sensors/latest")
sensor_data = response.json()
# Guardar en sensor_readings.jsonl
```

**3. CSV/Excel (para pruebas)
```python
import pandas as pd

df = pd.read_csv("sensor_data.csv")
# Procesar y guardar en sensor_readings.jsonl
```

---

## 📊 Dashboard (Futuro)

Una vez que el sistema está funcionando, puedes crear un dashboard con:

```bash
# Con Streamlit (rápido)
pip install streamlit
streamlit run dashboard.py

# Con FastAPI + React (más robusto)
pip install fastapi uvicorn
python api.py
```

---

## 🧪 Testing

```bash
# Verificar que skills estén documentados
python main.py test-skills

# Ver configuración cargada
python main.py config

# Ver estado actual
python main.py status
```

---

## 🛡️ Seguridad

- ✅ Los datos se almacenan localmente en `data/`
- ✅ No hay envío a cloud sin configuración explícita
- ✅ Sensores se validan antes de ejecutar acciones
- ✅ Fallos no afectan el ciclo (fail-safe)

---

## 📝 Documentación

- **AGENTS.md** — Qué hace cada agente
- **skills/SKILLS.md** — Qué hace cada skill
- **config/** — Configuración por archivo JSON
- **hooks/** — Scripts de automatización

---

## 🚦 Próximos Pasos

### Fase 1 (Esta semana)
- [ ] Instalar sensores y configurar API
- [ ] Llenar `config/thresholds.json` con tus valores
- [ ] Ejecutar `python main.py start`
- [ ] Verificar que hook de sesión funciona

### Fase 2 (Próxima semana)
- [ ] Conectar datos de sensores (MQTT/API)
- [ ] Ejecutar primer ciclo de cultivo con monitoreo
- [ ] Revisar reportes diarios
- [ ] Ajustar umbrales según observaciones

### Fase 3 (Mes 2-3)
- [ ] Acumular datos históricos (3-5 ciclos)
- [ ] Entrenar predictor de cosechas
- [ ] Implementar optimizaciones de costo
- [ ] Crear dashboard para visualización

---

## 💡 Ejemplos de Uso

### Ver datos de hoy
```bash
tail -20 data/sensor_readings.jsonl | python -m json.tool
```

### Generar resumen del día
```bash
python main.py daily-report
cat reports/daily_*.md | head -50
```

### Cargar ciclo actual
```bash
cat data/current_cycle.json | python -m json.tool
```

---

## 📞 Soporte

- 📧 Contacto: tu_email@example.com
- 📚 Docs: Ver `*.md` en este directorio
- 🔧 Issues: Revisar `data/failures.jsonl`

---

**🍄 Setas de la Peña — Cultivo Inteligente, Bajo Costo, Escalable**
