class TopicGenerator {
  constructor(options = {}) {
    this.minIdeas = options.minIdeas || 1;
    this.maxIdeas = options.maxIdeas || 20;
  }

  parse(rawOutput) {
    if (typeof rawOutput !== "string") {
      throw new Error("AI output must be a string");
    }

    let text = rawOutput.trim();

    // Bersihkan markdown code fence jika AI menggunakannya
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error("Invalid AI JSON output");
    }

    // AI boleh mengembalikan array langsung
    if (Array.isArray(data)) {
      return data;
    }

    // Atau { "topics": [...] }
    if (data && Array.isArray(data.topics)) {
      return data.topics;
    }

    // Atau satu topic
    if (data && typeof data === "object") {
      return [data];
    }

    throw new Error("AI output does not contain valid topics");
  }

  generate(rawOutput) {
    const topics = this.parse(rawOutput);

    if (topics.length < this.minIdeas) {
      throw new Error(`Too few ideas: ${topics.length}`);
    }

    if (topics.length > this.maxIdeas) {
      throw new Error(`Too many ideas: ${topics.length}`);
    }

    return topics;
  }
}

if (typeof module !== "undefined") {
  module.exports = TopicGenerator;
}
