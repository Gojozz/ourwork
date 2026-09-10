class AIAdapter {
  constructor(provider = null) {
    this.provider = provider;
  }

  setProvider(provider) {
    const valid =
      typeof provider === "function" ||
      (
        provider &&
        typeof provider.generate === "function"
      );

    if (!valid) {
      throw new Error("Invalid AI provider");
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

    const result =
      typeof this.provider === "function"
        ? await this.provider(prompt, options)
        : await this.provider.generate(prompt, options);

    if (typeof result !== "string") {
      throw new Error("AI provider must return a string");
    }

    return result.trim();
  }
}

if (typeof module !== "undefined") {
  module.exports = AIAdapter;
}
