const TopicValidator = require("./topic-validator");
const TopicQualityGate = require("./topic-quality-gate");

class TopicStrategyLoop {
  constructor(options = {}) {
    this.validator =
      options.validator ||
      new TopicValidator();

    this.qualityGate =
      options.qualityGate ||
      new TopicQualityGate(
        options.qualityGateOptions
      );

    this.maxAttempts =
      options.maxAttempts || 3;

    this.minAccepted =
      options.minAccepted || 1;
  }

  evaluate(topics = [], options = {}) {
    const usedTopicIds =
      new Set(
        Array.isArray(options.usedTopicIds)
          ? options.usedTopicIds
          : []
      );

    const acceptedTopicIds =
      new Set(
        Array.isArray(options.acceptedTopicIds)
          ? options.acceptedTopicIds
          : []
      );

    const validation =
      this.validator.validateMany(topics);

    const validTopics = topics.filter(
      (topic, index) => {
        const topicResult =
          this.validator.validate(topic);

        return topicResult.valid;
      }
    );

    const invalidTopics = topics.filter(
      topic => {
        const result =
          this.validator.validate(topic);

        return !result.valid;
      }
    );

    const quality =
      this.qualityGate.filter(validTopics);

    const duplicateRejected = [];
    const accepted = [];

    for (const topic of quality.accepted) {
      const id = topic && topic.id;

      if (
        id &&
        (
          usedTopicIds.has(id) ||
          acceptedTopicIds.has(id)
        )
      ) {
        duplicateRejected.push({
          topic,
          stage: "deduplication",
          score: topic.qualityScore,
          errors: [
            "Topic has already been used or accepted"
          ]
        });

        continue;
      }

      accepted.push(topic);
    }

    const acceptedIds =
      new Set(
        accepted
          .map(topic => topic.id)
          .filter(Boolean)
      );

    const rejected =
      [
        ...invalidTopics.map(topic => ({
          topic,
          stage: "validator",
          errors:
            this.validator.validate(topic).errors
        })),
        ...quality.rejected.map(item => ({
          ...item,
          stage: "quality-gate"
        })),
        ...duplicateRejected
      ];

    return {
      validation,
      accepted,
      rejected,
      acceptedIds
    };
  }

  async run(options = {}) {
    if (
      typeof options.generate !== "function"
    ) {
      throw new Error(
        "generate function is required"
      );
    }

    const maxAttempts =
      options.maxAttempts ||
      this.maxAttempts;

    const minAccepted =
      options.minAccepted ||
      this.minAccepted;

    const history = [];

    let allRejected = [];
    let allAccepted = [];

    const usedTopicIds =
      new Set(
        Array.isArray(options.usedTopicIds)
          ? options.usedTopicIds
          : []
      );

    const acceptedTopicIds =
      new Set();

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      const topics =
        await options.generate({
          attempt,
          previousResults: history
        });

      if (!Array.isArray(topics)) {
        throw new Error(
          "generate must return an array of topics"
        );
      }

      const evaluation =
        this.evaluate(topics, {
          usedTopicIds: [
            ...usedTopicIds
          ],
          acceptedTopicIds: [
            ...acceptedTopicIds
          ]
        });

      const accepted =
        evaluation.accepted;

      const rejected =
        evaluation.rejected;

      history.push({
        attempt,
        generated: topics,
        accepted,
        rejected
      });

      allAccepted =
        [...allAccepted, ...accepted];

      for (const topic of accepted) {
        if (topic && topic.id) {
          acceptedTopicIds.add(topic.id);
        }
      }

      allRejected =
        [...allRejected, ...rejected];

      if (
        allAccepted.length >= minAccepted
      ) {
        return {
          success: true,
          attempts: attempt,
          accepted: allAccepted,
          rejected: allRejected,
          history
        };
      }
    }

    return {
      success: false,
      attempts: maxAttempts,
      accepted: allAccepted,
      rejected: allRejected,
      history
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = TopicStrategyLoop;
}
