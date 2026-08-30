# Claude Code Router Integration Plan

## Overview

Claude Code Router (CCR) will serve as a **local model gateway and control plane** for the Setas de la Peña multi-agent system. It enables:

- **Cost optimization**: Route different task types to cheaper models (e.g., Haiku for simple searches, Sonnet for complex reasoning)
- **Provider flexibility**: Switch between Anthropic, OpenAI, Gemini without changing agent config
- **Centralized observability**: Track token usage, latency, and costs across all agents
- **Resilience**: Automatic fallback to backup providers if primary fails

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Claude Code / Codex / Antigravity            │
│              (Agent Frontends)                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓ (requests to http://127.0.0.1:3456)
┌─────────────────────────────────────────────────────┐
│      Claude Code Router (Local Control Plane)        │
│  - Add/manage API providers (Anthropic, OpenAI)      │
│  - Route requests based on model/cost rules          │
│  - Track usage, latency, estimated costs             │
│  - Log and retry failed requests                     │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
   ┌────────┐ ┌────────┐ ┌────────┐
   │Anthropic│ │ OpenAI │ │ Gemini │
   │  API    │ │  API   │ │  API   │
   └────────┘ └────────┘ └────────┘
```

Alongside:
- **MCP Server** (`setas_mcp.py`) — provides domain knowledge and tools
- **Setas OS v5** — main application (unchanged)
- **Knowledge Base** — canonical source of truth (unchanged)

## Installation

### Option 1: Desktop App (Recommended)

1. Download from https://github.com/musistudio/claude-code-router/releases
2. Install for your OS (macOS/Windows/Linux)
3. Launch the application

### Option 2: CLI (for automated setups)

```bash
# Requires Node.js 22+
npm install -g @musistudio/claude-code-router
ccr ui
```

### Option 3: Docker

```bash
# In a folder with docker-compose.yml
docker compose up -d --build
```

## Configuration

### Step 1: Add Providers

In CCR UI, go to **Providers** → **Add Provider**:

**Anthropic (Primary)**
- Preset: `Anthropic` 
- API Key: Your Anthropic key
- Models: If not auto-populated, click **Add Model** and enter:
  - `claude-opus-5`
  - `claude-sonnet-5`
  - `claude-haiku-4-5-20251001`

**OpenAI (Cost-optimized fallback)**
- Preset: `OpenAI`
- API Key: Your OpenAI key  
- Models: If not auto-populated, add:
  - `gpt-4o`
  - `gpt-4-turbo`
  - `gpt-4o-mini`

**Gemini (Optional expansion)**
- Preset: `Google Gemini`
- API Key: Your Gemini key
- Models: If not auto-populated, add:
  - `gemini-2.0-flash`
  - `gemini-1.5-pro`

**Troubleshooting:** If models show "0" and don't auto-populate, manually add each model ID using the **Add Model** button. CCR sometimes requires this depending on the provider API response.

### Step 2: Start the Gateway

1. Go to **Server** section
2. Click **Start**
3. Verify it's running on `http://127.0.0.1:3456`
4. Check **Logs** to confirm status

### Step 3: Configure Routing Rules

In **Routing** section, set up cost-optimized rules:

**Rule 1: Use Haiku for simple queries**
```
Condition: prompt_tokens < 2000 AND NOT contains("reasoning", "planning")
Route to: claude-haiku-4-5-20251001
```

**Rule 2: Use Sonnet for complex reasoning**
```
Condition: contains("reasoning", "planning", "architecture", "debug")
Route to: claude-sonnet-5
```

**Rule 3: Fallback to OpenAI if Anthropic fails**
```
Condition: provider_error OR rate_limited
Fallback: openai.gpt-4o-mini
Retry: 3 attempts with 2s backoff
```

### Step 4: Connect Claude Code

Claude Code can connect to CCR by setting the endpoint in its environment or configuration:

**Option A: Environment Variable** (local)
```bash
export ANTHROPIC_API_ENDPOINT="http://127.0.0.1:3456"
```

**Option B: Update `.claude/settings.json`** (project-scoped)
```json
{
  "model": "claude-sonnet-5",
  "modelEndpoint": "http://127.0.0.1:3456",
  "enableTokenTracking": true
}
```

## Usage

### Normal Operation

1. Start CCR desktop app or `ccr ui` in the background
2. Run Claude Code sessions as usual
3. Monitor requests in CCR **Logs** tab
4. Check **Analytics** for cost breakdown by model, provider, agent

### Cost Tracking

CCR displays in real time:
- **Tokens used** (input/output per request)
- **Latency** (ms per request)
- **Estimated cost** (by provider and model)
- **Request logs** (searchable by agent, model, timestamp)

Example view:
```
📊 Session Summary
├─ Claude Opus: 45 requests, 2.1M tokens, $0.32/session
├─ Claude Sonnet: 120 requests, 3.5M tokens, $0.12/session
├─ Claude Haiku: 89 requests, 1.2M tokens, $0.01/session
└─ Total: 254 requests, 6.8M tokens, $0.45/session
```

### Switching Providers

To test a different provider or model:

1. In CCR UI, go to **Agent Config**
2. Select your agent (Claude Code, Codex, etc.)
3. Change the model dropdown
4. Click **Apply Profile**
5. No agent restart needed

## Governance

### Agent Task Cards

When using CCR-routed agents, update the task card with:

```text
Model Routing: CCR-managed
  Primary: claude-sonnet-5 (reasoning tasks)
  Fallback: claude-haiku-4-5 (simple queries), gpt-4o-mini (if Anthropic fails)
  Cost target: <estimate>
```

### Compatibility

- ✅ **Compatible**: Claude Code, Codex, Antigravity (via custom integration)
- ✅ **Alongside**: Existing MCP server (`setas_mcp.py`), Setas OS v5
- ⚠️ **Note**: Antigravity IDE may need manual endpoint configuration

### Monitoring

In `.claude/settings.json`, enable cost tracking:

```json
{
  "enableModelRouting": true,
  "modelRoutingGateway": "http://127.0.0.1:3456",
  "trackCosts": true,
  "costWarningThreshold": "$5.00"
}
```

## Troubleshooting

### CCR not reachable

```bash
# Check if CCR is running
curl http://127.0.0.1:3456/health

# If unavailable, restart CCR app or run: ccr ui
```

### Agent not using CCR

1. Verify **Server** shows "Running" in CCR UI
2. Check **Agent Config** has correct endpoint
3. Look at **Logs** tab to see if requests are coming through
4. Run: `echo $ANTHROPIC_API_ENDPOINT` to confirm env var

### Requests failing

1. Go to CCR **Logs** and find the failed request
2. Check the error message (rate limit, invalid key, etc.)
3. Verify API key is valid in **Providers**
4. Try **Routing** → add a retry/fallback rule

### Costs higher than expected

1. Review **Analytics** to see which models are being used
2. Adjust **Routing** rules to use cheaper models for appropriate tasks
3. Check if fallback provider is being triggered unnecessarily

## Next Steps

1. **Install**: Choose desktop app, CLI, or Docker installation
2. **Configure**: Add your API providers and set up routing rules
3. **Test**: Run a Claude Code session and verify logs in CCR
4. **Monitor**: Review cost analytics and optimize routing rules
5. **Document**: Update this file with your specific routing rules and cost targets

## References

- **CCR GitHub**: https://github.com/musistudio/claude-code-router
- **CCR Documentation**: https://ccrdesk.top
- **Setas de la Peña AGENTS.md**: AGENTS.md (agent operating system)
- **Anthropic Models**: claude-opus-5, claude-sonnet-5, claude-haiku-4-5-20251001
