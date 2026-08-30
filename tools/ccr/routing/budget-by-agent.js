const text = input.summary.lastUserText ?? "";
const budgetHeading = /^\s*(?:luna|quick factual pass|evidence intake|repository triage|inventory reconciliation|formatting pass|test-output triage)\s*:/i;

if (!budgetHeading.test(text)) {
  return null;
}

return {
  model: "Codex API/gpt-5.6-luna",
  fallback: {
    mode: "model-chain",
    models: ["Codex API/gpt-5.6-terra", "Codex API/gpt-5.6-sol"],
    retryCount: 0
  }
};
