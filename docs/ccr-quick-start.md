# Claude Code Router — Quick Start

Get Claude Code Router running in 10 minutes.

## 1. Install (3 min)

**Desktop (easiest):**
```bash
# Download from: https://github.com/musistudio/claude-code-router/releases
# Extract and run the app for your OS
```

**CLI (if you prefer terminal):**
```bash
npm install -g @musistudio/claude-code-router
ccr ui
```

The UI opens at `http://localhost:3456`.

## 2. Add Your API Keys (2 min)

### Anthropic (primary)
1. Go to **Providers** → **Add Provider**
2. Select preset: `Anthropic`
3. Paste your key from https://console.anthropic.com
4. **If models don't auto-populate:** Click **Add Model** and manually enter:
   - `claude-opus-5`
   - `claude-sonnet-5`
   - `claude-haiku-4-5-20251001`
5. Click **Save**

### OpenAI (optional fallback)
1. **Add Provider** again
2. Select preset: `OpenAI`  
3. Paste your key from https://platform.openai.com/api-keys
4. Models: `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`
   - Sol = flagship, Terra = mid-tier (and Codex's routed default), Luna = budget.
   - The older `gpt-4o` / `gpt-4o-mini` IDs are superseded and will not match the live
     routing rules. See [`ccr-routing-strategy.md`](./ccr-routing-strategy.md) for the
     rules themselves and [`ccr-model-settings.md`](./ccr-model-settings.md) for the
     per-model pricing fields.
5. Click **Save**

## 3. Start the Gateway (1 min)

1. Go to **Server** tab
2. Click **Start**
3. Wait for status → "Running"
4. Should show: `Gateway listening on http://127.0.0.1:3456`

✅ **You're online!**

## 4. Test with Claude Code (2 min)

Open a terminal and set the endpoint:

```bash
export ANTHROPIC_API_ENDPOINT="http://127.0.0.1:3456"
claude
```

Ask Claude a quick question. Then:

1. In CCR, go to **Logs** tab
2. You should see your request listed with:
   - Model used
   - Tokens (input/output)
   - Latency
   - Cost estimate

✅ **Connected!**

## 5. Optional: Set Up Cost Routing (2 min)

In CCR, go to **Routing** and add this rule:

**Use Haiku for small tasks** (saves money)
```
Condition: prompt_tokens < 1000
Route to: claude-haiku-4-5-20251001
```

Or use the UI to drag conditions and set routes.

## 6. View Your Costs

**Analytics** tab shows:
- Total tokens by model
- Cost breakdown
- Latency averages
- Provider stats

## Persistent Setup (Optional)

If you want CCR to start automatically:

**macOS:**
```bash
# Add to ~/.zshrc
alias start-ccr='ccr ui > ~/.ccr.log 2>&1 &'
start-ccr  # then use whenever you start a session
```

**Or in `.claude/settings.json`:**
```json
{
  "modelRoutingGateway": "http://127.0.0.1:3456",
  "enableTokenTracking": true
}
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "No provider models" shown | Click **Add Model** and manually enter model IDs (e.g., `claude-opus-5`) |
| Can't connect | Check CCR **Server** tab shows "Running" |
| API key error | Verify key is correct in **Providers**; test with `curl -H "Authorization: Bearer YOUR_KEY" https://api.anthropic.com/` |
| Costs seem high | Check **Analytics** → reduce model tier in **Routing** |
| Requests slow | Check **Logs** for latency; consider closer provider |

## Next Steps

- Read full guide: [`docs/claude-code-router-integration.md`](./claude-code-router-integration.md)
- Fine-tune routing rules for your tasks
- Monitor costs and adjust model selection over time
