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

    this.timeoutMs =
      options.timeoutMs !== undefined
        ? options.timeoutMs
        : 300000;

    this.retries =
      options.retries !== undefined
        ? options.retries
        : 1;
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

    let response;
    let lastError;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      const startedAt = Date.now();
      const controller = new AbortController();

      const timer = setTimeout(() => {
        controller.abort();
      }, this.timeoutMs);

      try {
        console.log(
          `[LlamaProvider] request start attempt=${attempt + 1}/${this.retries + 1} ` +
          `maxTokens=${body.max_tokens}`
        );

        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timer);

        console.log(
          `[LlamaProvider] response headers status=${response.status} ` +
          `elapsedMs=${Date.now() - startedAt}`
        );

        break;
      } catch (error) {
        clearTimeout(timer);
        lastError = error;

        const elapsedMs = Date.now() - startedAt;
        const isAbort = error && error.name === "AbortError";
        const isTransportError =
          isAbort ||
          (error &&
            (error.code === "UND_ERR_HEADERS_TIMEOUT" ||
             error.code === "UND_ERR_CONNECT_TIMEOUT" ||
             error.code === "ECONNRESET" ||
             error.code === "ECONNREFUSED" ||
             error.code === "ETIMEDOUT"));

        console.error(
          `[LlamaProvider] request failed attempt=${attempt + 1}/${this.retries + 1} ` +
          `elapsedMs=${elapsedMs} ` +
          `error=${error && error.message ? error.message : error}`
        );

        if (!isTransportError || attempt >= this.retries) {
          throw error;
        }

        console.log("[LlamaProvider] retrying...");
      }
    }

    if (!response) {
      throw lastError || new Error("llama.cpp request failed");
    }

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
