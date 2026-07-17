#!/usr/bin/env python3
"""
Setas de la Peña — Sistema de Decisiones Automáticas
ECC Implementation for Mushroom Cultivation

Main orchestrator for agents, skills, and data workflows.
"""

import json
import sys
import argparse
from pathlib import Path
from datetime import datetime
import importlib.util

# Estructura del proyecto
PROJECT_ROOT = Path(__file__).parent
CONFIG_DIR = PROJECT_ROOT / "config"
DATA_DIR = PROJECT_ROOT / "data"
HOOKS_DIR = PROJECT_ROOT / "hooks"
REPORTS_DIR = PROJECT_ROOT / "reports"
SKILLS_DIR = PROJECT_ROOT / "skills"

# Crear directorios si no existen
for dir_path in [CONFIG_DIR, DATA_DIR, HOOKS_DIR, REPORTS_DIR, SKILLS_DIR]:
    dir_path.mkdir(exist_ok=True)


class SetasECCSystem:
    """Sistema principal de orquestación."""

    def __init__(self):
        self.config = self.load_config()
        self.state = {}
        self.agents_active = False

    def load_config(self):
        """Carga configuración desde archivos JSON."""
        config = {}
        for config_file in CONFIG_DIR.glob("*.json"):
            with open(config_file) as f:
                config[config_file.stem] = json.load(f)
        return config

    def execute_hook(self, hook_name):
        """Ejecuta un hook (script en hooks/)."""
        hook_file = HOOKS_DIR / f"{hook_name}.py"
        if not hook_file.exists():
            print(f"❌ Hook no encontrado: {hook_name}")
            return False

        try:
            spec = importlib.util.spec_from_file_location(hook_name, hook_file)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            if hasattr(module, 'main'):
                module.main()
            return True
        except Exception as e:
            print(f"❌ Error ejecutando {hook_name}: {e}")
            return False

    def start_monitoring(self):
        """Inicia monitoreo automático."""
        print("\n🚀 Iniciando Sistema de Decisiones Automáticas...\n")

        workflow = self.config.get("workflow_template", {})
        automated_actions = workflow.get("automated_actions", {})
        if not automated_actions.get("enabled", False):
            blockers = automated_actions.get("blocked_until", [])
            print("⛔ Automatización bloqueada: configuración no comisionada.")
            for blocker in blockers:
                print(f"  - {blocker}")
            print("El modo de consulta y validación permanece disponible.\n")
            return False

        # Hook de inicio
        if not self.execute_hook("session_start"):
            return False

        self.agents_active = True
        self.state = {
            "status": "running",
            "start_time": datetime.now().isoformat(),
            "agents": [
                "monitoring-agent",
                "growth-intelligence-agent",
                "quality-control-agent",
                "cost-optimizer-agent",
                "orchestration-agent"
            ]
        }

        # Guardar estado
        with open(DATA_DIR / "system_state.json", "w") as f:
            json.dump(self.state, f, indent=2)

        return True

    def generate_daily_report(self):
        """Genera resumen diario."""
        return self.execute_hook("daily_summary")

    def show_status(self):
        """Muestra estado actual del sistema."""
        print("\n📊 Estado del Sistema Setas de la Peña\n")
        print(f"Agentes activos: {len(self.state.get('agents', []))}")
        print(f"Estado: {self.state.get('status', 'unknown')}")

        # Mostrar datos más recientes
        latest_sensor = DATA_DIR / "sensor_readings.jsonl"
        if latest_sensor.exists():
            lines = latest_sensor.read_text().strip().split('\n')
            if lines:
                latest = json.loads(lines[-1])
                print(f"\n📈 Última lectura de sensores:")
                for key in ['temperature', 'humidity', 'co2', 'light']:
                    if key in latest:
                        print(f"  {key}: {latest[key]}")

        alerts_file = DATA_DIR / "alerts.jsonl"
        if alerts_file.exists():
            alert_count = len(alerts_file.read_text().strip().split('\n'))
            print(f"\n⚠️ Alertas registradas: {alert_count}")

        print()

    def show_config(self):
        """Muestra configuración cargada."""
        print("\n⚙️ Configuración Cargada:\n")
        for config_name, config_data in self.config.items():
            print(f"  ✓ {config_name}")
            if isinstance(config_data, dict):
                for key in list(config_data.keys())[:3]:
                    print(f"      - {key}")
        print()

    def test_skills(self):
        """Verifica que todos los skills estén documentados."""
        print("\n🧪 Verificando Skills...\n")
        skills_doc = PROJECT_ROOT / "skills" / "SKILLS.md"
        if skills_doc.exists():
            print("✅ Documentación de skills encontrada")
            with open(skills_doc) as f:
                content = f.read()
                skill_count = content.count("###")
                print(f"   {skill_count} skills documentados")
        else:
            print("❌ Documentación de skills no encontrada")
        print()

    def show_help(self):
        """Muestra ayuda de comandos."""
        help_text = """
🍄 Setas de la Peña — Sistema de Decisiones Automáticas

Comandos disponibles:

  start               Inicia el sistema de monitoreo
  status              Muestra estado actual
  daily-report        Genera resumen del día
  config              Muestra configuración cargada
  test-skills         Verifica que skills estén listos
  help                Muestra esta ayuda

Ejemplo:
  python main.py start
  python main.py status
  python main.py daily-report

Archivos de configuración:
  config/thresholds.json         → Rangos óptimos de sensores
  config/workflow_template.json  → Fases del ciclo de cultivo

Estructura de datos:
  data/                          → Lecturas de sensores, ciclos, alertas
  reports/                       → Reportes diarios y análisis
  hooks/                         → Scripts de automatización

Documentación:
  AGENTS.md                      → Definición de agentes
  skills/SKILLS.md              → Definición de skills
"""
        print(help_text)


def main():
    """Punto de entrada principal."""
    parser = argparse.ArgumentParser(
        description="Setas de la Peña — Sistema de Decisiones Automáticas"
    )
    parser.add_argument(
        "command",
        nargs="?",
        default="help",
        choices=["start", "status", "daily-report", "config", "test-skills", "help"]
    )

    args = parser.parse_args()
    system = SetasECCSystem()

    if args.command == "start":
        system.start_monitoring()
    elif args.command == "status":
        system.show_status()
    elif args.command == "daily-report":
        system.generate_daily_report()
    elif args.command == "config":
        system.show_config()
    elif args.command == "test-skills":
        system.test_skills()
    else:
        system.show_help()


if __name__ == "__main__":
    main()
