class FactChecker {
  constructor(options = {}) {
    this.minConfidence = options.minConfidence !== undefined
      ? options.minConfidence
      : 7;

    this.minImportance = options.minImportance !== undefined
      ? options.minImportance
      : 0;
  }

  validateClaim(claim) {
    if (!claim || typeof claim !== "object") {
      return {
        valid: false,
        reason: "Invalid claim"
      };
    }

    if (
      typeof claim.id !== "string" ||
      !claim.id.trim()
    ) {
      return {
        valid: false,
        reason: "Invalid claim id"
      };
    }

    if (
      typeof claim.statement !== "string" ||
      !claim.statement.trim()
    ) {
      return {
        valid: false,
        reason: "Invalid claim statement"
      };
    }

    if (
      typeof claim.importance !== "number" ||
      !Number.isFinite(claim.importance) ||
      claim.importance < 0 ||
      claim.importance > 10
    ) {
      return {
        valid: false,
        reason: "Invalid importance score"
      };
    }

    if (
      typeof claim.confidence !== "number" ||
      !Number.isFinite(claim.confidence) ||
      claim.confidence < 0 ||
      claim.confidence > 10
    ) {
      return {
        valid: false,
        reason: "Invalid confidence score"
      };
    }

    if (
      typeof claim.type !== "string" ||
      !claim.type.trim()
    ) {
      return {
        valid: false,
        reason: "Invalid claim type"
      };
    }

    if (claim.confidence < this.minConfidence) {
      return {
        valid: false,
        reason: `Confidence below threshold: ${claim.confidence}`
      };
    }

    if (claim.importance < this.minImportance) {
      return {
        valid: false,
        reason: `Importance below threshold: ${claim.importance}`
      };
    }

    return {
      valid: true,
      reason: null
    };
  }

  check(claims) {
    if (!Array.isArray(claims)) {
      throw new Error("Claims must be an array");
    }

    const verified = [];
    const rejected = [];

    for (const claim of claims) {
      const result = this.validateClaim(claim);

      if (result.valid) {
        verified.push(claim);
      } else {
        rejected.push({
          claim,
          reason: result.reason
        });
      }
    }

    return {
      valid: verified.length > 0,
      verified,
      rejected,
      total: claims.length
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = FactChecker;
}
