const AIAdapter = require("./ai-adapter");
const TopicGenerator = require("./topic-generator");
const TopicValidator = require("./topic-validator");
const TopicQualityGate = require("./topic-quality-gate");
const TopicEngine = require("./topic-engine");
const UsedTopicStore = require("./used-topic-store");
const ResearchPipeline = require("./research-pipeline");

class TopicAIEngine {
  constructor(options = {}) {
    this.adapter = new AIAdapter(options.provider || null);

    this.generator = new TopicGenerator({
      minIdeas: options.minIdeas || 1,
      maxIdeas: options.maxIdeas || 10
    });

    this.validator = new TopicValidator();

    this.qualityGate = new TopicQualityGate(
      options.qualityGateOptions
    );

    this.engine = new TopicEngine({
      weights: options.weights
    });

    this.usedStore = new UsedTopicStore(
      options.usedTopicsFile || "./lab/topics/used-topics.json"
    );

    this.researchPipeline = new ResearchPipeline({
      minClaims: options.minClaims || 1,
      maxClaims: options.maxClaims || 20,
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

  setProvider(provider) {
    this.adapter.setProvider(provider);
    return this;
  }

  async generate(prompt, options = {}) {
    const rawOutput = await this.adapter.generate(prompt, options);

    const topics = this.generator.generate(rawOutput);

    const validation = this.validator.validateMany(topics);

    if (!validation.valid) {
      throw new Error(
        `Invalid generated topics: ${validation.errors
          .map(error => error.error)
          .join("; ")}`
      );
    }

    const quality = this.qualityGate.filter(topics);

    if (!quality.accepted.length) {
      throw new Error(
        "No generated topics passed the quality gate"
      );
    }

    const freshTopics =
      quality.accepted.filter(
        topic => !this.usedStore.has(topic)
      );

    if (!freshTopics.length) {
      throw new Error(
        "All generated topics have already been used"
      );
    }

    this.engine.addMany(freshTopics);

    const ranking = this.engine.rank();

    const selected = this.engine.next();

    if (!selected) {
      throw new Error("No topic available after deduplication");
    }

    this.usedStore.add(selected);

    let research = null;

    if (options.researchOutput) {
      research = this.researchPipeline.process(
        selected,
        options.researchOutput
      );
    }

    return {
      generated: topics,
      quality,
      fresh: freshTopics,
      added: freshTopics.length,
      ranking,
      selected,
      research
    };
  }


  research(topic, rawOutput) {
    return this.researchPipeline.process(topic, rawOutput);
  }

  list() {
    return this.engine.list();
  }

  remaining() {
    return this.engine.remaining();
  }

  usedTopics() {
    return this.usedStore.list();
  }

  resetUsed() {
    this.usedStore.clear();
    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports = TopicAIEngine;
}
