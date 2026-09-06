const TopicGenerator = require("./topic-generator");
const TopicValidator = require("./topic-validator");
const TopicEngine = require("./topic-engine");

class TopicPipeline {
  constructor(options = {}) {
    this.generator = new TopicGenerator({
      minIdeas: options.minIdeas || 1,
      maxIdeas: options.maxIdeas || 20
    });

    this.validator = new TopicValidator();

    this.engine = new TopicEngine(options.weights);
  }

  process(rawOutput) {
    // 1. Parse AI output
    const topics = this.generator.generate(rawOutput);

    // 2. Validate semua topic
    const validation = this.validator.validateMany(topics);

    if (!validation.valid) {
      const errors = validation.errors.map(
        error => `${error.id || "unknown"}: ${error.error}`
      );

      throw new Error(
        `Topic validation failed:\n${errors.join("\n")}`
      );
    }

    // 3. Masukkan topic valid ke Topic Engine
    const added = this.engine.addMany(topics);

    // 4. Ranking
    const ranking = this.engine.rank();

    // 5. Pilih topic terbaik
    const selected = this.engine.next();

    return {
      topics,
      added,
      ranking,
      selected
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = TopicPipeline;
}
