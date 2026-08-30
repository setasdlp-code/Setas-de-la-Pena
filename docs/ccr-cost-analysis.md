# Claude Code Router Cost Analysis

## Potential Savings with Model Routing

Setas de la Peña runs multiple Claude Code agents for different tasks. By routing intelligently, you can reduce costs significantly.

### Model Pricing (as of Aug 2026)

| Model | Input Cost | Output Cost | Best For | Savings vs Opus |
|-------|-----------|------------|----------|-----------------|
| **Claude Opus 5** | $3/MTok | $15/MTok | Complex reasoning, long-context | Baseline |
| **Claude Sonnet 5** | $3/MTok | $15/MTok | General purpose, medium complexity | 0% (same price) |
| **Claude Haiku 4.5** | $0.80/MTok | $4/MTok | Simple queries, classification | **92%** |
| **GPT-4o** | $5/MTok | $15/MTok | Fallback, emergencies | -66% (more expensive) |
| **GPT-4o-mini** | $0.15/MTok | $0.60/MTok | Budget fallback | **96%** |

### Example: Monthly Setas de la Peña Workload

Assume ~1M tokens/month across all agents:

```
Current (all Sonnet):
├─ 500k input @ $3/MTok   = $1.50
└─ 500k output @ $15/MTok = $7.50
   Total: $9.00/month

With CCR Routing (optimized):
├─ Haiku (simple, 300k tokens)
│  ├─ 150k input @ $0.80/MTok   = $0.12
│  └─ 150k output @ $4/MTok     = $0.60
│
├─ Sonnet (complex, 500k tokens)
│  ├─ 250k input @ $3/MTok      = $0.75
│  └─ 250k output @ $15/MTok    = $3.75
│
└─ Opus (research, 200k tokens)
   ├─ 100k input @ $3/MTok       = $0.30
   └─ 100k output @ $15/MTok     = $1.50
   
   Total: $6.97/month
   Savings: $2.03/month (23%)
```

### Scaling Up

If workload grows to 10M tokens/month:

```
Without routing: $90/month
With routing:    $69.70/month
Savings:         $20.30/month (23%)
```

### Cost-Saving Strategies

#### 1. **Use Haiku for Small Queries**
```
Haiku suitable for:
✓ Simple fact lookups
✓ Code reformatting
✓ Quick classifications
✓ Template generation
✓ Prompt refinement

Savings: 92% vs Opus
```

#### 2. **Use Sonnet for Most Work**
```
Sonnet suitable for:
✓ Most implementation tasks
✓ Code reviews
✓ Architecture discussions
✓ Bug diagnosis
✓ Testing strategies

Savings: 0% (same as Opus for this use case)
```

#### 3. **Reserve Opus for Deep Analysis**
```
Opus suitable for:
✓ Large context analysis (100k+ tokens)
✓ Cross-domain synthesis
✓ Complex reasoning chains
✓ Multi-modal analysis

Cost: Higher, but necessary for the hardest problems
```

#### 4. **Use GPT-4o-mini as Emergency Fallback**
```
When Anthropic APIs are rate-limited or down:
- Automatically fall back to GPT-4o-mini
- 96% cheaper than Opus
- Good enough for unblocking work
- Requires OpenAI API key setup
```

### Real-World Scenario: Setas OS Development

Typical monthly tasks:

| Task | Est. Tokens | Best Model | Cost | Notes |
|------|-----------|-----------|------|-------|
| Perito scenario search | 50k | Haiku | $0.15 | Simple data lookup |
| Field-OS architecture review | 200k | Sonnet | $2.10 | Complex reasoning |
| E2E test fixes | 150k | Haiku | $0.45 | Pattern matching |
| Data migration planning | 300k | Opus | $4.95 | Deep analysis |
| Knowledge base synthesis | 200k | Sonnet | $2.10 | Research integration |
| Bug investigation | 100k | Sonnet | $1.05 | Debugging |
| **Total** | **1M** | **Mixed** | **$10.80** | 23% savings |

### Implementation Timeline

**Week 1:** Install & Configure
- Install CCR desktop app
- Add API keys (Anthropic, OpenAI)
- Test routing with one agent

**Week 2:** Monitor & Learn
- Run normal development workload
- Check CCR Analytics daily
- Identify which tasks use which models

**Week 3-4:** Optimize
- Fine-tune routing rules based on actual usage
- Adjust model selection by task type
- Document your routing preferences

**Month 2+:** Steady Savings
- Expected 20-30% cost reduction
- Automated tracking in CCR
- Quarterly reviews to catch optimization opportunities

### Governance: Cost Tracking

In task cards, track estimated vs actual costs:

```text
Cost Estimate: Using Haiku for simple queries, Sonnet for complex
  Estimated cost: $0.50/session
  Actual cost (from CCR): [will show after execution]
  Savings vs all-Opus: 30%
```

### Monitoring Dashboard

Monitor in CCR UI → Analytics:

```
Today's Usage:
├─ Haiku: 450k tokens, $1.35 (12% of cost, 40% of volume)
├─ Sonnet: 600k tokens, $5.40 (49% of cost, 55% of volume)
├─ Opus: 50k tokens, $2.10 (19% of cost, 5% of volume)
└─ Total: 1.1M tokens, $8.85 (↓ 22% from all-Sonnet baseline)
```

### Cost Alerts

Set up alerts in `.claude/settings.json`:

```json
{
  "tracking": {
    "costWarningThreshold": "$10.00",
    "dailyCostBudget": "$5.00"
  }
}
```

CCR will notify you if you exceed thresholds.

### Break-Even Analysis

If you have **10+ agents** or **>5M tokens/month**, CCR pays for itself through:
1. Model routing savings (20-30%)
2. Reduced overspending on expensive models
3. Automated fallback preventing rate-limit bottlenecks

For smaller workloads, benefits are modest but still positive (23% in example above).

## Estimated Impact for Setas de la Peña

| Metric | Current | With CCR | Improvement |
|--------|---------|----------|-------------|
| Monthly cost | $50-100 | $35-75 | -25% |
| Model waste | ~20% (wrong tier) | ~5% | -75% |
| Rate-limit impact | Occasional | Rare (auto-fallback) | ~95% reduction |
| Team visibility | None | Full (CCR Analytics) | +100% |

## Next Steps

1. **Try it free**: Start with Anthropic key only, see costs in CCR
2. **Add fallback**: OpenAI API key for emergencies
3. **Optimize**: After 1 month, adjust routing based on real usage
4. **Monitor**: Review CCR Analytics monthly
5. **Document**: Update task cards with cost estimates

---

**Questions?** Check:
- Full guide: `docs/claude-code-router-integration.md`
- Quick start: `docs/ccr-quick-start.md`
- Official docs: https://ccrdesk.top
