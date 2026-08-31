function textFromContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(textFromContent).filter(Boolean).join("\n");
  }

  if (!content || typeof content !== "object") {
    return "";
  }

  if (typeof content.text === "string") {
    return content.text;
  }

  if (typeof content.content === "string") {
    return content.content;
  }

  return textFromContent(content.content);
}

function lastUserTextFromResponsesInput(requestInput) {
  if (typeof requestInput === "string") {
    return requestInput;
  }

  if (!Array.isArray(requestInput)) {
    return "";
  }

  for (let index = requestInput.length - 1; index >= 0; index -= 1) {
    const item = requestInput[index];
    if (item?.role === "user") {
      return textFromContent(item.content);
    }
  }

  return "";
}

const text =
  input.summary?.lastUserText ||
  lastUserTextFromResponsesInput(input.body?.input) ||
  "";
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
