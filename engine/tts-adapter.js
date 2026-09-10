class TTSAdapter {
  constructor(provider = null) {
    this.provider = provider;
  }

  setProvider(provider) {
    const valid =
      typeof provider === "function" ||
      (
        provider &&
        typeof provider.synthesize === "function"
      );

    if (!valid) {
      throw new Error("Invalid TTS provider");
    }

    this.provider = provider;
    return this;
  }

  async synthesize(text, options = {}) {
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("TTS text is required");
    }

    if (!this.provider) {
      throw new Error("TTS provider is not configured");
    }

    const result =
      typeof this.provider === "function"
        ? await this.provider(
            text,
            options
          )
        : await this.provider.synthesize(
            text,
            options
          );

    if (!result) {
      throw new Error("TTS provider returned no result");
    }

    return result;
  }
}

if (typeof module !== "undefined") {
  module.exports = TTSAdapter;
}
