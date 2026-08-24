# Setas de la Peña — MCP Servers

Dos servidores MCP locales (stdio), independientes entre sí:

| Servidor | Datos | Uso |
|---|---|---|
| `setas_mcp.py` | Parámetros de cultivo embebidos en el código (especies, FAE, automatización, inventario) | Consultas rápidas y estables sobre cultivo — no requiere que el repo esté clonado localmente para responder |
| `setas_bridge_mcp.py` | Lee `knowledge_base/`, `field_os/`, `field-os-simulador/` y docs del repo **en vivo desde disco** — sin datos hardcodeados | Puente de lectura/escritura para que cualquier agente (Claude, ChatGPT, Codex, Antigravity) vea el estado actual del repo y coordine cambios (`CHANGELOG.md`, `FARM_BRAIN.md`) sin editar el filesystem a ciegas |

Ambos pueden correr en paralelo — no comparten estado ni se importan entre sí.

## Archivos

| Archivo | Descripción |
|---|---|
| `setas_mcp.py` | Servidor MCP principal (FastMCP/Python) — datos de cultivo embebidos |
| `setas_bridge_mcp.py` | Servidor puente (FastMCP/Python) — lectura/escritura en vivo sobre el repo |
| `claude_desktop_config_snippet.json` | Snippet para `claude_desktop_config.json` (ambos servidores) |
| `chatgpt_system_prompt.md` | System prompt para Custom GPT en OpenAI |

## Instalación

```bash
# 1. Crear un entorno e instalar dependencias estables
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r mcp/requirements.txt

# 2. Verificar que corre
.venv/bin/python "/Users/sebastianpinzon/Documents/Claude/Projects/Setas de la Peña/mcp/setas_mcp.py"
# No debe lanzar errores

# 3. Testear con MCP Inspector (opcional)
npx @modelcontextprotocol/inspector python3 "/Users/sebastianpinzon/Documents/Claude/Projects/Setas de la Peña/mcp/setas_mcp.py"
```

## Conectar a Claude Desktop

Agrega el bloque de `claude_desktop_config_snippet.json` al archivo de configuración de Claude Desktop. El snippet apunta al intérprete del entorno `.venv`; si mueves el proyecto, actualiza ambas rutas absolutas.

Reinicia Claude Desktop. En cualquier conversación podrás usar los tools directamente.

## Conectar a ChatGPT

ChatGPT no soporta MCP nativo. La integración es vía **system prompt** (`chatgpt_system_prompt.md`):
1. Abre platform.openai.com → GPTs → Create
2. Pega el contenido de `chatgpt_system_prompt.md` en "Instructions"
3. El GPT tendrá el contexto embebido; para datos técnicos en tiempo real usará a Claude como fuente de verdad

## Tools disponibles — `setas_mcp.py`

| Tool | Descripción |
|---|---|
| `setas_list_tools` | Catálogo de tools — primer call recomendado |
| `setas_get_contexto_proyecto` | Resumen ejecutivo del proyecto |
| `setas_get_parametros` | T°/HR/CO₂/FAE/luz por especie y fase |
| `setas_get_fae` | Protocolo FAE detallado por especie |
| `setas_get_sensores` | Estado operacional de sensores |
| `setas_get_automatizacion` | Arquitectura ESP32/ESPHome/HA |
| `setas_get_inventario` | Inventario hardware y consumibles |
| `setas_get_pedidos_pendientes` | Recepciones por verificar + pendientes de compra |
| `setas_generar_sop` | Genera SOPs: inoculacion, fruiting_setup, cosecha, fae_check, sensor_check |

## Tools disponibles — `setas_bridge_mcp.py`

Todas las rutas son relativas a la raíz del repo. Las tools de lectura recorren el filesystem en cada llamada (sin caché ni datos embebidos); las de escritura solo pueden **agregar** contenido a `CHANGELOG.md` y `FARM_BRAIN.md` — nunca sobrescriben ni borran.

| Tool | Tipo | Descripción |
|---|---|---|
| `setas_bridge_list_tools` | lectura | Catálogo de tools de este servidor |
| `setas_bridge_read_file` | lectura | Lee un archivo del repo en vivo (path relativo) |
| `setas_bridge_list_directory` | lectura | Lista archivos/subdirectorios de una carpeta |
| `setas_bridge_search` | lectura | Busca texto literal en archivos bajo un directorio |
| `setas_bridge_get_farm_brain` | lectura | Atajo: `knowledge_base/FARM_BRAIN.md` completo |
| `setas_bridge_get_index` | lectura | Atajo: `knowledge_base/INDEX.yaml` completo |
| `setas_bridge_append_changelog` | escritura | Agrega una entrada a `CHANGELOG.md` |
| `setas_bridge_append_farm_brain_note` | escritura | Agrega una nota fechada a `FARM_BRAIN.md` |

Archivos con credenciales (`gmail_credentials.json`, `gmail_token.json`, `firebase/` bajo `setas-os/`, cualquier ruta que contenga `secret`/`credentials`/`token.json`/`.env`) están bloqueados en ambas direcciones.

## División Claude / ChatGPT

| Claude | ChatGPT |
|---|---|
| Protocolos técnicos, SOPs | Marketing, redes sociales, copy |
| Arquitectura de automatización | Naming de productos, empaques |
| Documentación interna | Conceptos visuales (DALL-E) |
| Base de conocimiento técnico | Segunda opinión de negocio |
| Análisis sensores y parámetros | Contenido para clientes |

## Extender el MCP

Para agregar un nuevo tool:
1. Define un Pydantic `BaseModel` para el input
2. Agrega `@mcp.tool(name="setas_...", annotations={...})` antes de la función
3. Documenta con docstring completo
4. Actualiza el dict en `setas_list_tools`
