const AIAdapter = require("./ai-adapter");
const TopicGenerator = require("./topic-generator");
const TopicValidator = require("./topic-validator");
const TopicEngine = require("./topic-engine");

class TopicAIEngine {
  constructor(options = {}) {
    this.adapter = new AIAdapter(options.provider || null);

    this.generator = new TopicGenerator({
      minIdeas: options.minIdeas || 1,
      maxIdeas: options.maxIdeas || 20
    });

    this.validator = new TopicValidator();

    this.engine = new TopicEngine(options.weights);
  }

  setProvider(provider) {
    this.adapter.setProvider(provider);
    return this;
  }

  async generate(prompt, options = {}) {
    // 1. Ask AI
    const rawOutput = await this.adapter.generate(
      prompt,
      options
    );

    // 2. Parse AI output
    const topics = this.generator.generate(rawOutput);

    // 3. Validate
    const validation = this.validator.validateMany(topics);

    if (!validation.valid) {
      const errors = validation.errors.map(
        error => `${error.id}: ${error.error}`
      );

      throw new Error(
        `Topic validation failed:\n${errors.join("\n")}`
      );
    }

    // 4. Add to topic engine
    const added = this.engine.addMany(topics);

    // 5. Rank
    const ranking = this.engine.rank();

    // 6. Select best
    const selected = this.engine.next();

    return {
      rawOutput,
      topics,
      added,
      ranking,
      selected
    };
  }

  list() {
    return this.engine.list();
  }

  remaining() {
    return this.engine.remaining();
  }

  resetUsed() {
    this.engine.resetUsed();
  }
}

if (typeof module !== "undefined") {
  module.exports = TopicAIEngine;
}
