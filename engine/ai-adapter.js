class AIAdapter {
  constructor(provider = null) {
    this.provider = provider;
  }

  setProvider(provider) {
    if (typeof provider !== "function") {
      throw new Error("AI provider must be a function");
    }

    this.provider = provider;
    return this;
  }

  async generate(prompt, options = {}) {
    if (!this.provider) {
      throw new Error("AI provider is not configured");
    }

    if (typeof prompt !== "string" || !prompt.trim()) {
      throw new Error("Prompt is required");
    }

    const result = await this.provider(prompt, options);

    if (typeof result !== "string") {
      throw new Error("AI provider must return a string");
    }

    return result.trim();
  }
}

if (typeof module !== "undefined") {
  module.exports = AIAdapter;
}
