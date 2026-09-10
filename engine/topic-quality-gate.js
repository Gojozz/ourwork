class TopicQualityGate {
  constructor(options = {}) {
    this.minScore =
      options.minScore !== undefined
        ? options.minScore
        : 6;

    this.minCuriosity =
      options.minCuriosity !== undefined
        ? options.minCuriosity
        : 5;

    this.minVisual =
      options.minVisual !== undefined
        ? options.minVisual
        : 5;

    this.minShortForm =
      options.minShortForm !== undefined
        ? options.minShortForm
        : 5;

    this.minEducational =
      options.minEducational !== undefined
        ? options.minEducational
        : 5;
  }

  check(topic) {
    const errors = [];

    if (!topic || typeof topic !== "object") {
      return {
        valid: false,
        score: 0,
        errors: ["Topic must be an object"]
      };
    }

    const title =
      typeof topic.title === "string"
        ? topic.title.trim()
        : "";

    if (!title) {
      errors.push("Missing topic title");

      return {
        valid: false,
        score: 0,
        errors
      };
    }

    const scores = {
      curiosity: Number(topic.curiosity) || 0,
      visual: Number(topic.visual) || 0,
      shortForm: Number(topic.shortForm) || 0,
      novelty: Number(topic.novelty) || 0,
      educational: Number(topic.educational) || 0
    };

    const score =
      scores.curiosity * 0.30 +
      scores.visual * 0.25 +
      scores.shortForm * 0.20 +
      scores.novelty * 0.15 +
      scores.educational * 0.10;

    /*
     * A good WHAT IF scenario should describe
     * a changed condition, not a normal state.
     */

    const normalized =
      title.toLowerCase().replace(/\s+/g, " ");

    const whatIf =
      /\bwhat\s+if\b/.test(normalized);

    if (!whatIf) {
      errors.push("Not a What If scenario");
    }

    /*
     * Detect vague/general questions.
     */

    const genericPatterns = [
      /^why\s+/,
      /^how\s+important\s+/,
      /^what\s+is\s+/,
      /^why\s+is\s+/,
      /^how\s+does\s+/,
      /^how\s+do\s+/,
      /^what\s+are\s+/
    ];

    if (
      genericPatterns.some(pattern =>
        pattern.test(normalized)
      )
    ) {
      errors.push(
        "Topic is a generic explanatory question"
      );
    }

    /*
     * Detect hypothetical change indicators.
     */

    const changePatterns = [
      /\bsuddenly\b/,
      /\bdisappear(?:ed|s)?\b/,
      /\bvanish(?:ed|es)?\b/,
      /\bstop(?:ped|s)?\b/,
      /\bdouble[ds]?\b/,
      /\bhalf\b/,
      /\btriple[ds]?\b/,
      /\blose\b/,
      /\blost\b/,
      /\bwithout\b/,
      /\bnever\b/,
      /\bno longer\b/,
      /\bbecame?\b/,
      /\bbecome\b/,
      /\bchanged?\b/,
      /\bremoved?\b/,
      /\bfailed?\b/,
      /\bexploded?\b/,
      /\bstarted\b/,
      /\bturned\b/,
      /\bincreased?\b/,
      /\bdecreased?\b/,
      /\bstopped\b/,
      /\bvanished\b/,
      /\bdisappeared\b/,
      /\bfor one\b/,
      /\bfor a day\b/,
      /\bfor a week\b/,
      /\bfor a month\b/,
      /\bfor 24 hours\b/
    ];

    const hasChange =
      changePatterns.some(pattern =>
        pattern.test(normalized)
      );

    if (!hasChange) {
      errors.push(
        "No clear hypothetical change detected"
      );
    }

    /*
     * Prevent obvious tautological / normal-condition
     * scenarios that do not actually change anything.
     */

    const normalConditionPatterns = [
      /\blight speed remains constant\b/,
      /\blight speed stays constant\b/,
      /\bgravity remains constant\b/,
      /\btime remains constant\b/,
      /\bearth continues rotating\b/,
      /\bwater remains liquid\b/,
      /\bhumans continue living\b/,
      /\bthe sun continues shining\b/
    ];

    if (
      normalConditionPatterns.some(pattern =>
        pattern.test(normalized)
      )
    ) {
      errors.push(
        "Scenario describes a normal or unchanged condition"
      );
    }

    /*
     * Very short titles usually lack enough context
     * to produce a meaningful scenario.
     */

    const words =
      normalized
        .replace(/[?!.,]/g, "")
        .split(/\s+/)
        .filter(Boolean);

    if (words.length < 5) {
      errors.push(
        "Topic is too vague or too short"
      );
    }

    /*
     * Score thresholds.
     */

    if (scores.curiosity < this.minCuriosity) {
      errors.push(
        `Curiosity score below minimum (${this.minCuriosity})`
      );
    }

    if (scores.visual < this.minVisual) {
      errors.push(
        `Visual score below minimum (${this.minVisual})`
      );
    }

    if (scores.shortForm < this.minShortForm) {
      errors.push(
        `Short-form score below minimum (${this.minShortForm})`
      );
    }

    if (
      scores.educational <
      this.minEducational
    ) {
      errors.push(
        `Educational score below minimum (${this.minEducational})`
      );
    }

    if (score < this.minScore) {
      errors.push(
        `Overall quality score below minimum (${this.minScore})`
      );
    }

    return {
      valid: errors.length === 0,
      score,
      errors
    };
  }

  filter(topics = []) {
    if (!Array.isArray(topics)) {
      return {
        accepted: [],
        rejected: [
          {
            topic: topics,
            errors: ["Topics must be an array"]
          }
        ]
      };
    }

    const accepted = [];
    const rejected = [];

    for (const topic of topics) {
      const result = this.check(topic);

      if (result.valid) {
        accepted.push({
          ...topic,
          qualityScore: result.score
        });
      } else {
        rejected.push({
          topic,
          score: result.score,
          errors: result.errors
        });
      }
    }

    return {
      accepted,
      rejected
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = TopicQualityGate;
}
