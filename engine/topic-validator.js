class TopicValidator {
  constructor() {
    this.scoreFields = [
      "curiosity",
      "visual",
      "shortForm",
      "novelty",
      "educational"
    ];
  }

  validate(topic) {
    const errors = [];

    if (!topic || typeof topic !== "object" || Array.isArray(topic)) {
      return {
        valid: false,
        errors: ["Topic must be an object"]
      };
    }

    if (typeof topic.id !== "string" || !topic.id.trim()) {
      errors.push("Invalid topic id");
    }

    if (typeof topic.title !== "string" || !topic.title.trim()) {
      errors.push("Invalid topic title");
    }

    for (const field of this.scoreFields) {
      const value = topic[field];

      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {
        errors.push(`Invalid ${field} score`);
        continue;
      }

      if (value < 0 || value > 10) {
        errors.push(
          `${field} must be between 0 and 10`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateMany(topics) {
    if (!Array.isArray(topics)) {
      return {
        valid: false,
        errors: [
          {
            id: "unknown",
            error: "Topics must be an array"
          }
        ]
      };
    }

    const errors = [];

    for (const topic of topics) {
      const result = this.validate(topic);

      if (!result.valid) {
        for (const error of result.errors) {
          errors.push({
            id: topic && topic.id ? topic.id : "unknown",
            error
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = TopicValidator;
}
