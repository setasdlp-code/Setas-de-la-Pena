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

**En Claude Code no hace falta ninguna.** `.mcp.json` lanza ambos servidores a
través de `mcp/run_server.sh`, que crea `.venv/` e instala `mcp/requirements.txt`
la primera vez que arranca (~10 s) y después solo hace `exec`. Como `.venv/` está
en `.gitignore`, ese bootstrap es lo que hace que los servidores funcionen en un
checkout nuevo — contenedor de agente, clon limpio u otra máquina — en vez de
fallar con `ENOENT` por un intérprete que nadie instaló.

Para instalarlo a mano (Claude Desktop, MCP Inspector, ejecución suelta):

```bash
# Desde la raíz del repo
python3 -m venv .venv
.venv/bin/python -m pip install -r mcp/requirements.txt

# Verificar que ambos arrancan y exponen sus tools
sh mcp/run_server.sh setas_mcp.py          # 9 tools
sh mcp/run_server.sh setas_bridge_mcp.py   # 8 tools
# Se quedan esperando JSON-RPC por stdin: eso es que arrancaron bien. Ctrl-C.

# MCP Inspector (opcional)
npx @modelcontextprotocol/inspector sh mcp/run_server.sh setas_mcp.py
```

`run_server.sh` reinstala solo si `mcp/requirements.txt` cambió (guarda su SHA-256
dentro del venv). Toda su salida va a **stderr**: stdout es el transporte JSON-RPC
y cualquier cosa impresa ahí rompe el protocolo.

## Conectar a Claude Desktop

Agrega el bloque de `claude_desktop_config_snippet.json` al archivo de configuración de Claude Desktop. El snippet apunta al intérprete del entorno `.venv`; si mueves el proyecto, actualiza ambas rutas absolutas. Alternativa más robusta: apuntar a `sh <ruta>/mcp/run_server.sh` con el nombre del servidor como argumento, que se autoinstala igual que en Claude Code.

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
