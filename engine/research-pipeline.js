const ResearchEngine = require("./research-engine");
const FactChecker = require("./fact-checker");

class ResearchPipeline {
  constructor(options = {}) {
    this.research = new ResearchEngine({
      minClaims: options.minClaims || 1,
      maxClaims: options.maxClaims || 20
    });

    this.factChecker = new FactChecker({
      minConfidence:
        options.minConfidence !== undefined
          ? options.minConfidence
          : 7,

      minImportance:
        options.minImportance !== undefined
          ? options.minImportance
          : 0
    });
  }

  process(topic, rawOutput) {
    if (!topic || typeof topic !== "object") {
      throw new Error("Topic is required");
    }

    const researchResult = this.research.research(
      topic,
      rawOutput
    );

    const factCheckResult = this.factChecker.check(
      researchResult.claims
    );

    if (!factCheckResult.valid) {
      throw new Error(
        "No verified scientific claims available"
      );
    }

    return {
      topic,
      claims: researchResult.claims,
      verifiedClaims: factCheckResult.verified,
      rejectedClaims: factCheckResult.rejected,
      totalClaims: factCheckResult.total,
      verifiedCount: factCheckResult.verified.length,
      rejectedCount: factCheckResult.rejected.length
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = ResearchPipeline;
}
