# Claude Code Router Integration

This directory contains documentation and configuration for integrating **Claude Code Router (CCR)** with Setas de la Peña's multi-agent system.

## What is Claude Code Router?

CCR is a **local AI model gateway** that centrally manages multiple Claude Code agents and LLM providers. It enables:

- 🎯 **Cost optimization**: Route tasks to cheaper models (Haiku for simple queries, Sonnet for complex reasoning)
- 🔄 **Provider flexibility**: Switch between Anthropic, OpenAI, Gemini without code changes
- 📊 **Cost tracking**: Real-time visibility into token usage and estimated costs
- 🛡️ **Resilience**: Automatic fallback to backup providers if primary fails

## Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[`ccr-quick-start.md`](./ccr-quick-start.md)** | Get CCR running in 10 minutes | 5 min |
| **[`claude-code-router-integration.md`](./claude-code-router-integration.md)** | Complete integration guide | 15 min |
| **[`ccr-model-settings.md`](./ccr-model-settings.md)** | Configure individual model settings (cost caps, rate limits, fallbacks) | 10 min |
| **[`ccr-billing-and-usage.md`](./ccr-billing-and-usage.md)** | How billing works, tracking usage, reconciling with Anthropic | 8 min |
| **[`ccr-cost-analysis.md`](./ccr-cost-analysis.md)** | Understand potential savings (23% typical) | 10 min |
| **[`ccr-settings-template.json`](./ccr-settings-template.json)** | Configuration template | Reference |

## Getting Started (10 minutes)

### 1. Install

Choose one:
- **Desktop app** (recommended): Download from [releases](https://github.com/musistudio/claude-code-router/releases)
- **CLI**: `npm install -g @musistudio/claude-code-router` then `ccr ui`
- **Script**: `bash scripts/setup-ccr.sh`

### 2. Configure

1. Open CCR UI (`http://localhost:3456`)
2. Add provider: **Providers** → **Add Provider** → **Anthropic** → paste API key
3. Start gateway: **Server** → **Start**
4. Test: `export ANTHROPIC_API_ENDPOINT=http://127.0.0.1:3456; claude`

### 3. Monitor

Check **Logs** tab to see your requests, tokens, and estimated costs.

## How It Works

```
Claude Code / Codex agents
         ↓
Claude Code Router (localhost:3456)
   ├─ Add/switch providers
   ├─ Route by model/task type
   ├─ Track costs in real time
   └─ Automatic fallback on errors
         ↓
   Anthropic / OpenAI / Gemini APIs
```

## Architecture Diagram

```
Setas de la Peña Multi-Agent System
┌─────────────────────────────────────────────────────┐
│                                                       │
│  Claude Code      Codex         Antigravity         │
│  (Implementation) (Forensics)   (Read-only audits)  │
│                                                       │
└───────────────────────┬─────────────────────────────┘
                        │ (requests via CCR)
                        ↓
        ┌───────────────────────────────┐
        │   Claude Code Router           │
        │  ✓ Cost optimization           │
        │  ✓ Provider switching          │
        │  ✓ Usage tracking              │
        │  ✓ Fallback resilience         │
        └───────┬───────────────┬────────┘
                │               │
        ┌───────▼─────┐  ┌──────▼────────┐
        │  Anthropic  │  │  OpenAI       │
        │  API Keys   │  │  (fallback)   │
        └─────────────┘  └───────────────┘

Existing (unchanged):
├─ MCP Server (setas_mcp.py)
├─ Setas OS v5 (field-os-simulador/setas-os/)
├─ Knowledge Base (knowledge_base/)
└─ AGENTS.md (agent operating system)
```

## Key Features

### Cost Optimization

**Example monthly savings: 23%** (from $90 to $70)

Model routing rules:
- Haiku for simple queries: **92% cheaper** than Opus
- Sonnet for general work: Same price but excellent performance
- Opus for deep analysis: Only when needed
- GPT-4o-mini as fallback: **96% cheaper** than Opus

### Real-Time Analytics

Track in CCR UI → **Analytics**:
- Tokens by model
- Tokens by provider
- Cost breakdown
- Latency metrics

Example:
```
Today: 1.1M tokens consumed
├─ Haiku: 40% volume, 12% cost
├─ Sonnet: 55% volume, 49% cost
└─ Opus: 5% volume, 19% cost
```

### Automatic Resilience

If Anthropic rate-limits or fails:
```
Request → Anthropic (fails)
        → Retry with backoff
        → Fallback to OpenAI
        → Succeed (transparent to agent)
```

## Integration with Setas de la Peña

### Compatible With

- ✅ Claude Code (main implementation)
- ✅ Codex (forensics, tests, CI)
- ✅ Antigravity (audits, read-only exploration)
- ✅ MCP Server (`setas_mcp.py`) — works alongside
- ✅ Setas OS v5 — no changes needed

### Task Card Addition

When using CCR-routed agents, add to task card:

```text
Model Routing: CCR-managed
  Primary: claude-sonnet-5 (general reasoning)
  Fallback: claude-haiku-4-5 (simple queries), gpt-4o-mini (on Anthropic failure)
  Estimated cost: $1.50 (vs $2.00 without routing)
```

### AGENTS.md Compliance

CCR fits within existing agent governance:
- **Claude Code** stays the lead for long-horizon work
- **One lead per task** is enforced by AGENTS.md, unchanged
- CCR just optimizes *how* the lead executes (which model/provider)
- Audit trail in CCR Logs for cost tracking and debugging

## Configuration

### Basic Setup

```json
{
  "modelRouting": {
    "enabled": true,
    "gateway": "http://127.0.0.1:3456"
  },
  "tracking": {
    "enableCostTracking": true
  },
  "environment": {
    "ANTHROPIC_API_ENDPOINT": "http://127.0.0.1:3456"
  }
}
```

### Advanced: Custom Routing Rules

```json
{
  "routingRules": [
    {
      "name": "Use Haiku for small tasks",
      "condition": "prompt_tokens < 1500",
      "route": "claude-haiku-4-5-20251001"
    },
    {
      "name": "Fallback to OpenAI on rate limit",
      "condition": "provider_error",
      "fallback": "openai.gpt-4o-mini"
    }
  ]
}
```

See `ccr-settings-template.json` for full configuration options.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CCR not reachable | Check **Server** tab shows "Running" |
| API key error | Verify key in **Providers** is correct |
| Costs unexpectedly high | Check **Analytics** — may be using expensive model |
| Routing not working | Verify `ANTHROPIC_API_ENDPOINT=http://127.0.0.1:3456` |

See `ccr-quick-start.md` for more troubleshooting.

## Cost Projections

| Workload | Monthly Cost | With CCR | Savings |
|----------|-------------|----------|---------|
| 1M tokens | $9.00 | $6.97 | **23%** |
| 5M tokens | $45.00 | $34.85 | **23%** |
| 10M tokens | $90.00 | $69.70 | **23%** |

See `ccr-cost-analysis.md` for detailed breakdowns.

## Official Resources

- **GitHub**: https://github.com/musistudio/claude-code-router
- **Documentation**: https://ccrdesk.top
- **Releases**: https://github.com/musistudio/claude-code-router/releases

## Setup Script

Automate initial setup:

```bash
bash scripts/setup-ccr.sh
```

This script:
- Checks for Node.js and optionally installs CCR CLI
- Creates documentation references
- Prompts for API keys
- Sets up `.claude/settings.json`
- Lists next steps

## Summary

| Aspect | Benefit |
|--------|---------|
| **Cost** | Save 20-30% on LLM costs |
| **Control** | One dashboard for all agents |
| **Visibility** | Real-time cost tracking |
| **Resilience** | Auto-fallback providers |
| **Complexity** | Zero changes to existing agents |
| **Integration** | Complements MCP server, unchanged Setas OS |

**Next step**: Read [`ccr-quick-start.md`](./ccr-quick-start.md) (5 minutes) or run `bash scripts/setup-ccr.sh`.

---

Last updated: Aug 29, 2026
