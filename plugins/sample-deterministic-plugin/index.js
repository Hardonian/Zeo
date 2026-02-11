export function registerDecisionType() {
  return { id: "PLUGIN_DECISION", label: "Plugin Decision" };
}

export function registerPolicy() {
  return { id: "plugin-policy", version: "1.0.0", rules: ["deterministic-only"] };
}

export function registerEvidenceExtractor() {
  return { id: "plugin-extractor", kinds: ["text"] };
}
