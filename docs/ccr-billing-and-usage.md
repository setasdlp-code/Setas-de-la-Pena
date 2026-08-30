# Claude Code Router — Billing & Usage Tracking

How CCR counts against your API usage and billing.

## How It Works

CCR is a **transparent proxy**—all requests route through YOUR API keys to the actual provider APIs.

```
Your Agent (Claude Code)
         ↓
    CCR Gateway (localhost:3456)
         ↓
  Your API Key (stored in CCR)
         ↓
Provider API (Anthropic, OpenAI, etc.)
         ↓
Billed to YOUR account
```

**Result**: Every request counts as normal usage against your account.

## Billing: Anthropic

When you configure CCR with your Anthropic API key:

### Each Request Counts Toward:
- ✅ Your account's **monthly token quota**
- ✅ Your account's **monthly bill** (pay-as-you-go)
- ✅ Your account's **rate limits** (requests/minute, tokens/minute)
- ✅ Your account's **usage analytics** in console.anthropic.com

### Example: 1M Token Day

```
You consume: 1,000,000 tokens through CCR
    ↓
CCR routes through your Anthropic API key
    ↓
Counts as: 1M tokens in YOUR Anthropic account
    ↓
Bill: Charged to your Anthropic account (at current rates)
```

### Viewing Usage in Anthropic Dashboard

1. Go to https://console.anthropic.com
2. Select your organization
3. Go to **Usage** tab
4. You'll see all tokens consumed (including via CCR)
   ```
   Today's Usage:
   ├─ Tokens: 1,234,567
   ├─ Requests: 456
   ├─ Estimated cost: $5.23
   └─ Models used: Opus, Sonnet, Haiku
   ```

5. **CCR requests show up here** with the same detail as direct API calls

### Understanding Your Bill

**Anthropic Pricing (current):**
```
Claude Opus 5:
├─ Input: $3.00 per 1M tokens
└─ Output: $15.00 per 1M tokens

Claude Sonnet 5:
├─ Input: $3.00 per 1M tokens
└─ Output: $15.00 per 1M tokens

Claude Haiku 4.5:
├─ Input: $0.80 per 1M tokens
└─ Output: $4.00 per 1M tokens
```

**Your bill = (Tokens consumed via CCR) × (Rate for that model)**

Example:
```
Today via CCR:
├─ Opus: 100K input, 20K output
│  Cost: (100 × $3) + (20 × $15) = $600
├─ Sonnet: 500K input, 300K output
│  Cost: (500 × $3) + (300 × $15) = $6,000
├─ Haiku: 200K input, 150K output
│  Cost: (200 × $0.80) + (150 × $4) = $760
└─ Total daily: $7,360

This all shows in Anthropic console usage dashboard.
```

## Rate Limits: How CCR Interacts

Your Anthropic account has rate limits:
- **Requests per minute (RPM)**: e.g., 1,000 RPM
- **Tokens per minute (TPM)**: e.g., 40,000 TPM

**CCR respects these limits:**
- If you hit the limit, CCR queues requests
- Requests wait with exponential backoff
- Falls back to other providers (if configured)
- You never trigger rate-limit errors

**Configuration in CCR per-model:**
```json
{
  "rateLimit": {
    "requestsPerMinute": 60,      // Should not exceed your account limit
    "tokensPerMinute": 40000      // Should not exceed your account limit
  }
}
```

## Tracking Usage in CCR vs. Anthropic Console

### In CCR (Real-time, granular):
- **Logs** tab: Every request with tokens, latency, model
- **Analytics** tab: Aggregated by model, provider, time
- **Estimated cost**: Based on configured pricing

### In Anthropic Console (Official, authoritative):
- **Usage** tab: Official token count (billing source)
- **Cost breakdown** by model
- **Billing history** and invoices
- **Rate limit status** and usage

**Important**: Anthropic console is the **source of truth** for billing. CCR's "estimated cost" is useful for monitoring, but your actual bill comes from Anthropic.

## Reconciling CCR Estimates vs. Actual Bill

**CCR shows estimated cost based on:**
```json
{
  "estimatedCost": {
    "inputPerMTok": 0.003,   // $3 per 1M input tokens
    "outputPerMTok": 0.015   // $15 per 1M output tokens
  }
}
```

**Your Anthropic bill is:**
```
Official rate × Actual tokens consumed
```

**Why they might differ:**
1. CCR estimates are slightly delayed (might not include latest tokens)
2. Rounding differences
3. CCR configuration out of sync with current Anthropic pricing

**Solution:**
1. Check Anthropic console for official usage
2. Compare to CCR's Analytics
3. Adjust CCR cost estimates if they're consistently off

## Cost Caps: Setting Boundaries

Use per-model cost caps in CCR to prevent overspending:

```json
{
  "costCap": {
    "daily": "$50.00",     // Stop routing if exceeded today
    "monthly": "$1000.00"  // Alert if monthly spending approaches
  }
}
```

**When cost cap is hit:**
- CCR logs warning
- Future requests fall back to cheaper models
- You get notified in CCR UI
- **Your Anthropic account is NOT blocked** (caps are in CCR, not upstream)

**Use case:**
```
Budget: $100/month
├─ Opus: $20/day cap (intentionally conservative)
├─ Sonnet: $30/day cap
├─ Haiku: $10/day cap
└─ Emergency: $5/day cap
Total: $65/day × 30 = $1,950/month cushion
```

## Multi-Provider Billing

If you use multiple providers through CCR:

```
CCR Configuration:
├─ Anthropic API key
│  └─ Requests → Billed to Anthropic account
├─ OpenAI API key
│  └─ Requests → Billed to OpenAI account
└─ Gemini API key
   └─ Requests → Billed to Google Cloud account
```

**Each provider charges independently:**
- CCR routes based on rules/fallback
- Each request uses the corresponding API key
- Bills go to respective provider accounts

**Track multiple bills:**
```
Total LLM cost = Anthropic bill + OpenAI bill + Gemini bill
(viewed in 3 separate dashboards)
```

## Usage Reporting: Task Cards

When documenting CCR-routed work, include:

```text
Model Routing: CCR-managed
  Estimated tokens: 50,000
  Estimated cost: $0.35 (50K tokens @ mix of models)
  Actual cost: [from Anthropic console after execution]
  Models used: Haiku, Sonnet
  
Billing impact:
  ✓ Counted against Anthropic account
  ✓ Visible in console.anthropic.com → Usage
  ✓ Includes in this month's bill
```

## Monitoring Spending

### Daily Check (in CCR):
1. Open CCR UI → **Analytics**
2. View today's spend by model
3. Check daily cost cap remaining
4. Note: This is estimated

### Weekly Check (Anthropic Console):
1. Go to https://console.anthropic.com
2. **Usage** tab → review actual tokens consumed
3. Compare to CCR's analytics
4. Verify no unexpected spikes

### Monthly (Billing):
1. Check your Anthropic invoice
2. Compare to CCR analytics
3. Note any discrepancies
4. Adjust CCR routing if needed

## Common Questions

### Q: Does CCR add any cost?
**A:** No. CCR is free and local. You only pay for API calls to Anthropic/OpenAI/etc.

### Q: Do CCR requests count as normal usage?
**A:** Yes, 100%. Every request through CCR counts as normal API usage against your account.

### Q: Can I see CCR usage in Anthropic dashboard?
**A:** Yes. Go to console.anthropic.com → Usage tab. All requests (direct or via CCR) appear there with the same detail.

### Q: What if I hit my Anthropic rate limit?
**A:** CCR queues requests and retries with backoff. If configured, it falls back to OpenAI or another provider.

### Q: Is CCR billing transparent?
**A:** Yes. CCR uses your API key and passes requests through directly. You get the same usage/cost visibility as calling the API directly.

### Q: How do I control spending?
**A:** Set per-model daily/monthly cost caps in CCR. When a cap is hit, requests fall back to cheaper models.

### Q: What's the difference between CCR estimated cost and my actual bill?
**A:** CCR estimates based on configured pricing; Anthropic bills based on actual tokens. Minor discrepancies are normal. Anthropic console is authoritative.

## Setup Checklist

- ✅ Add your Anthropic API key to CCR
- ✅ Configure per-model cost caps (prevent runaway spending)
- ✅ Set realistic rate limits (don't exceed your account limits)
- ✅ Check Anthropic console weekly (verify usage)
- ✅ Document in task cards (expected vs. actual cost)
- ✅ Monitor CCR Analytics daily (stay aware of spending)
- ✅ Reconcile monthly (CCR estimates vs. Anthropic bill)

## References

- **Anthropic Pricing**: https://www.anthropic.com/pricing
- **Console Usage Dashboard**: https://console.anthropic.com/usage
- **Rate Limits Help**: https://support.anthropic.com/en/articles/9147791
- **CCR Model Settings**: [`ccr-model-settings.md`](./ccr-model-settings.md)
