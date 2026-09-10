class NarrationGenerator {
  constructor(options = {}) {
    this.maxWords =
      options.maxWords !== undefined
        ? options.maxWords
        : 130;
  }

  generate(topic, verifiedClaims = [], scenario = null) {
    if (!topic || typeof topic !== "object") {
      throw new Error("Topic is required");
    }

    if (!Array.isArray(verifiedClaims)) {
      throw new Error("Verified claims must be an array");
    }

    const title =
      topic.title ||
      (scenario && scenario.title);

    if (typeof title !== "string" || !title.trim()) {
      throw new Error("Narration title is required");
    }

    const lines = [];

    lines.push(title.trim());

    for (const claim of verifiedClaims) {
      if (
        claim &&
        typeof claim.statement === "string" &&
        claim.statement.trim()
      ) {
        lines.push(claim.statement.trim());
      }
    }

    const text = lines.join(" ");

    const words = text
      .split(/\s+/)
      .filter(Boolean);

    const limited =
      words.length > this.maxWords
        ? words.slice(0, this.maxWords)
        : words;

    return {
      title: title.trim(),
      text: limited.join(" "),
      wordCount: limited.length,
      maxWords: this.maxWords
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = NarrationGenerator;
}
