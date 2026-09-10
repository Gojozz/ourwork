const AIAdapter = require("./ai-adapter");
const TopicGenerator = require("./topic-generator");
const TopicValidator = require("./topic-validator");
const TopicQualityGate = require("./topic-quality-gate");
const TopicEngine = require("./topic-engine");
const UsedTopicStore = require("./used-topic-store");
const ResearchPipeline = require("./research-pipeline");
const TopicStrategyLoop = require("./topic-strategy-loop");

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

    this.strategyLoop = new TopicStrategyLoop({
      validator: this.validator,
      qualityGate: this.qualityGate,
      maxAttempts:
        options.maxTopicAttempts || 3,
      minAccepted:
        options.minAcceptedTopics || 1
    });

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
    const maxAttempts =
      options.maxTopicAttempts ||
      this.strategyLoop.maxAttempts;

    const strategy =
      await this.strategyLoop.run({
        maxAttempts,
        minAccepted:
          options.minAcceptedTopics ||
          1,

        usedTopicIds:
          this.usedStore
            .list()
            .map(topic => topic.id),

        generate: async ({ attempt, previousResults }) => {
          const attemptPrompt =
            attempt === 1
              ? prompt
              : `${prompt}

IMPORTANT RETRY:
The previous topic generation attempt did not produce
enough acceptable topics.

Generate a fresh batch of topics.

Avoid repeating topics from previous attempts.
Avoid generic explanatory questions.
Use specific hypothetical "What If" scenarios
with clear changes and consequences.

Previous attempt results:
${JSON.stringify(previousResults)}
`;

          const rawOutput =
            await this.adapter.generate(
              attemptPrompt,
              {
                ...options,
                attempt,
                stage: "topic"
              }
            );

          return this.generator.generate(
            rawOutput
          );
        }
      });

    if (!strategy.success) {
      const rejectionSummary =
        strategy.rejected
          .map(item => {
            const id =
              item.topic && item.topic.id
                ? item.topic.id
                : "unknown";

            return `${id}: ${
              item.errors.join(", ")
            }`;
          })
          .join("; ");

      throw new Error(
        `No acceptable topics after ${strategy.attempts} attempts` +
        (rejectionSummary
          ? `: ${rejectionSummary}`
          : "")
      );
    }

    const generated =
      strategy.history.flatMap(
        attempt => attempt.generated
      );

    const accepted =
      strategy.accepted;

    const freshTopics =
      accepted.filter(
        topic => !this.usedStore.has(topic)
      );

    if (!freshTopics.length) {
      throw new Error(
        "All accepted topics have already been used"
      );
    }

    this.engine.addMany(freshTopics);

    const ranking =
      this.engine.rank();

    const selected =
      this.engine.next();

    if (!selected) {
      throw new Error(
        "No topic available after deduplication"
      );
    }

    this.usedStore.add(selected);

    let research = null;

    if (options.researchOutput) {
      research =
        this.researchPipeline.process(
          selected,
          options.researchOutput
        );
    }

    return {
      generated,
      quality: {
        accepted,
        rejected:
          strategy.rejected
      },
      fresh: freshTopics,
      added: freshTopics.length,
      ranking,
      selected,
      research,
      strategy: {
        success: strategy.success,
        attempts: strategy.attempts,
        history: strategy.history
      }
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
