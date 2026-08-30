# Claude Code Router — Per-Model Settings

Configure individual settings for each model to optimize cost, performance, and behavior.

## Model Configuration Options

In CCR UI, when you add a model, you can set:

### 1. **Model Identification**
- **Model ID**: `claude-opus-5` (exact identifier from provider)
- **Display Name**: "Opus 5" (for UI readability)
- **Provider**: Anthropic (which API to use)

### 2. **Cost & Limits**
- **Max monthly cost cap**: e.g., `$50.00` (alert/block if exceeded)
- **Max daily cost cap**: e.g., `$10.00` 
- **Input cost (per MTok)**: `$3.00` (for tracking)
- **Output cost (per MTok)**: `$15.00` (for tracking)
- **Max input tokens**: e.g., `200000` (context limit)
- **Max output tokens**: e.g., `4096` (generation limit)

### 3. **Rate Limiting**
- **Requests per minute**: e.g., `60` (RPM limit)
- **Tokens per minute**: e.g., `100000` (TPM limit)
- **Timeout (seconds)**: e.g., `120` (how long to wait)

### 4. **Routing & Availability**
- **Enabled**: Toggle to enable/disable this model
- **Priority**: `1` = highest priority, `10` = lowest (for fallback order)
- **Auto-fallback on error**: Yes/No (fallback to next model if fails)
- **Retry attempts**: e.g., `3` (auto-retry on transient errors)
- **Retry backoff**: e.g., `2000ms` (wait between retries)

### 5. **Performance Tuning**
- **Temperature override**: Default from provider, or custom (0-2)
- **Top-P override**: Default from provider, or custom (0-1)
- **Frequency penalty**: Optional adjustment
- **Presence penalty**: Optional adjustment

## Recommended Settings by Model

### Claude Opus 5
**Use case**: Complex reasoning, long-context analysis, research synthesis

```
Model: claude-opus-5
Enabled: Yes
Priority: 1 (use first for heavy tasks)
Max daily cost: $20.00 (budget for expensive model)
Requests/min: 30
Tokens/min: 50000
Auto-fallback: No (if Opus fails, use Sonnet instead)
Temperature: Default (0.7)
```

### Claude Sonnet 5
**Use case**: General implementation, code review, most tasks

```
Model: claude-sonnet-5
Enabled: Yes
Priority: 2 (fallback from Opus)
Max daily cost: $30.00 (most budget here)
Requests/min: 60
Tokens/min: 100000
Auto-fallback: Yes (to Haiku on failure)
Temperature: Default (0.7)
```

### Claude Haiku 4.5
**Use case**: Simple queries, formatting, quick classifications

```
Model: claude-haiku-4-5-20251001
Enabled: Yes
Priority: 3 (use for cheap tasks)
Max daily cost: $10.00 (mostly covered by savings)
Requests/min: 100
Tokens/min: 150000 (fast model)
Auto-fallback: Yes (to Sonnet on failure)
Temperature: Default (0.7)
```

### GPT-4o-mini (Emergency Fallback)
**Use case**: When Anthropic is rate-limited or down

```
Model: gpt-4o-mini
Provider: OpenAI
Enabled: Yes
Priority: 10 (last resort)
Max daily cost: $5.00 (emergency budget only)
Requests/min: 50
Tokens/min: 80000
Auto-fallback: No (final fallback)
```

## How to Set Per-Model Settings in CCR

### In CCR UI:

1. Go to **Providers** → select your provider (Anthropic)
2. Find the model in the list (e.g., `claude-opus-5`)
3. Click the **gear icon** or **settings** button next to it
4. Configure:
   - Cost caps
   - Rate limits
   - Retry behavior
   - Priorities
5. Click **Save**

### Via Configuration File (if supported):

```json
{
  "providers": {
    "anthropic": {
      "models": [
        {
          "id": "claude-opus-5",
          "displayName": "Opus 5",
          "enabled": true,
          "priority": 1,
          "costCap": {
            "daily": "$20.00",
            "monthly": "$500.00"
          },
          "rateLimit": {
            "requestsPerMinute": 30,
            "tokensPerMinute": 50000
          },
          "retry": {
            "attempts": 3,
            "backoffMs": 2000
          },
          "autoFallback": false,
          "estimatedCost": {
            "inputPerMTok": 0.003,
            "outputPerMTok": 0.015
          }
        },
        {
          "id": "claude-sonnet-5",
          "displayName": "Sonnet 5",
          "enabled": true,
          "priority": 2,
          "costCap": {
            "daily": "$30.00",
            "monthly": "$600.00"
          },
          "rateLimit": {
            "requestsPerMinute": 60,
            "tokensPerMinute": 100000
          },
          "retry": {
            "attempts": 3,
            "backoffMs": 2000
          },
          "autoFallback": true,
          "fallbackTo": "claude-haiku-4-5-20251001"
        },
        {
          "id": "claude-haiku-4-5-20251001",
          "displayName": "Haiku",
          "enabled": true,
          "priority": 3,
          "costCap": {
            "daily": "$10.00",
            "monthly": "$200.00"
          },
          "rateLimit": {
            "requestsPerMinute": 100,
            "tokensPerMinute": 150000
          },
          "retry": {
            "attempts": 3,
            "backoffMs": 2000
          },
          "autoFallback": true,
          "fallbackTo": "gpt-4o-mini"
        }
      ]
    }
  }
}
```

## Cost Capping Strategy

Set individual daily/monthly cost caps per model to prevent overspending:

| Model | Daily Cap | Monthly Cap | Rationale |
|-------|-----------|-------------|-----------|
| Opus | $20 | $500 | Reserve for deep work only |
| Sonnet | $30 | $600 | General-purpose workhorse |
| Haiku | $10 | $200 | Cheap queries (will rarely hit) |
| GPT-4o-mini | $5 | $100 | Emergency fallback only |
| **Total** | **$65** | **$1400** | Monthly budget ceiling |

When a model hits its daily cap:
- CCR logs a warning
- Next request falls back to next available model
- You get notified in CCR UI

## Rate Limiting per Model

Prevent hitting provider rate limits by configuring per-model limits:

```
Opus: 30 requests/min (conservative for expensive model)
Sonnet: 60 requests/min (normal usage)
Haiku: 100 requests/min (can handle higher throughput)
```

If you hit the limit:
- Request waits in queue
- CCR retries after backoff (e.g., 2 seconds)
- Transparent to the agent

## Retry Behavior per Model

Configure how CCR handles transient failures:

```json
{
  "retry": {
    "attempts": 3,           // Try up to 3 times
    "backoffMs": 2000,       // Wait 2s, 4s, 8s exponentially
    "onErrorFallback": true  // Use next model if all retries fail
  }
}
```

## Auto-Fallback Chain

Set up a fallback chain so requests succeed even if primary model fails:

```
Request → Opus (fails) 
       → Retry with backoff 
       → Fallback to Sonnet ✓ (succeeds)
```

Configure in each model's `autoFallback` and `fallbackTo` settings.

## Monitoring Per-Model Settings

In CCR UI → **Analytics**, view per-model stats:

```
Claude Opus 5:
├─ Requests today: 5
├─ Tokens: 450K input, 25K output
├─ Cost: $1.50
├─ Avg latency: 2.3s
└─ Daily cap remaining: $18.50

Claude Sonnet 5:
├─ Requests today: 45
├─ Tokens: 520K input, 180K output
├─ Cost: $3.15
├─ Avg latency: 0.8s
└─ Daily cap remaining: $26.85

Claude Haiku:
├─ Requests today: 120
├─ Tokens: 200K input, 80K output
├─ Cost: $0.52
├─ Avg latency: 0.3s
└─ Daily cap remaining: $9.48
```

## Quick Setup: Copy-Paste Settings

Use these settings as a starting point, then adjust based on your needs:

**Lightweight (budget-conscious):**
```
Opus: Disabled (never use)
Sonnet: Daily cap $10
Haiku: Daily cap $15 (primary model)
```

**Balanced (typical):**
```
Opus: Daily cap $20
Sonnet: Daily cap $30 (primary)
Haiku: Daily cap $10 (secondary)
```

**Heavy (research/deep work):**
```
Opus: Daily cap $50 (primary for hard problems)
Sonnet: Daily cap $40 (secondary)
Haiku: Daily cap $10 (quick tasks)
```

## Troubleshooting Per-Model Settings

| Issue | Solution |
|-------|----------|
| Model not appearing | Verify model ID is correct (e.g., `claude-opus-5`, not `opus-5`) |
| Cost cap too low | Increase daily cap or check if model is overused in routing rules |
| Rate limit errors | Increase requests/min or tokens/min cap in model settings |
| Fallback not working | Check `autoFallback: true` and `fallbackTo` is set to valid model |
| Settings not applied | Restart CCR Server after saving |

## References

- CCR main guide: [`claude-code-router-integration.md`](./claude-code-router-integration.md)
- Cost analysis: [`ccr-cost-analysis.md`](./ccr-cost-analysis.md)
- Official CCR docs: https://ccrdesk.top
