class LlamaProvider {
  constructor(options = {}) {
    this.baseUrl = (
      options.baseUrl ||
      process.env.LLAMA_BASE_URL ||
      "http://127.0.0.1:8080"
    ).replace(/\/+$/, "");

    this.model = (
      options.model ||
      process.env.LLAMA_MODEL ||
      "local-model"
    );

    this.temperature =
      options.temperature !== undefined
        ? options.temperature
        : 0.7;

    this.maxTokens =
      options.maxTokens ||
      1024;
  }

  async generate(prompt, options = {}) {
    if (typeof prompt !== "string" || !prompt.trim()) {
      throw new Error("Prompt is required");
    }

    const url = `${this.baseUrl}/v1/chat/completions`;

    const body = {
      model: options.model || this.model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature:
        options.temperature !== undefined
          ? options.temperature
          : this.temperature,
      max_tokens:
        options.maxTokens || this.maxTokens
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        `llama.cpp HTTP ${response.status}: ${text}`
      );
    }

    const data = await response.json();

    const content =
      data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error(
        "Invalid llama.cpp response: missing message content"
      );
    }

    return content.trim();
  }
}

if (typeof module !== "undefined") {
  module.exports = LlamaProvider;
}
