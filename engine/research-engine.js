class ResearchEngine {
  constructor(options = {}) {
    this.minClaims = options.minClaims || 1;
    this.maxClaims = options.maxClaims || 20;
  }

  buildPrompt(topic) {
    if (!topic || typeof topic !== "object") {
      throw new Error("Topic is required");
    }

    if (!topic.id || !topic.title) {
      throw new Error("Topic id and title are required");
    }

    return `
You are the Research Engine for WHAT IF LAB.

Research the following scientific What If topic:

ID: ${topic.id}
TITLE: ${topic.title}

OBJECTIVES:
- Identify the scientifically relevant facts.
- Identify the main cause-and-effect relationships.
- Separate established facts from uncertain claims.
- Focus on information useful for a 30–60 second educational simulation.
- Avoid sensational claims that are not scientifically supported.

OUTPUT RULES:
- Return JSON only.
- Return an object with a "claims" array.
- Each claim must contain:
  id
  statement
  importance
  confidence
  type
- importance must be a number from 0 to 10.
- confidence must be a number from 0 to 10.
- type must describe the claim category.
- Do not include markdown.
- Do not include explanations outside JSON.
`.trim();
  }

  parse(rawOutput) {
    if (typeof rawOutput !== "string" || !rawOutput.trim()) {
      throw new Error("Research output is empty");
    }

    let cleaned = rawOutput.trim();

    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    let data;

    try {
      data = JSON.parse(cleaned);
    } catch (error) {
      throw new Error("Invalid research JSON output");
    }

    const claims = Array.isArray(data)
      ? data
      : data && Array.isArray(data.claims)
        ? data.claims
        : data && typeof data === "object"
          ? [data]
          : [];

    if (
      claims.length < this.minClaims ||
      claims.length > this.maxClaims
    ) {
      throw new Error(
        `Research claims count must be between ${this.minClaims} and ${this.maxClaims}`
      );
    }

    return claims;
  }

  research(topic, rawOutput) {
    const prompt = this.buildPrompt(topic);
    const claims = this.parse(rawOutput);

    return {
      topic,
      prompt,
      claims
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = ResearchEngine;
}
