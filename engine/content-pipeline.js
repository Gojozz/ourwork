const Strategist = require("./strategist");
const TopicAIEngine = require("./topic-ai-engine");
const ResearchEngine = require("./research-engine");
const FactChecker = require("./fact-checker");
const ScenarioPipeline = require("./scenario-pipeline");

class ContentPipeline {
  constructor(options = {}) {
    this.strategist =
      options.strategist ||
      new Strategist(options.strategistOptions);

    this.topicAI =
      options.topicAI ||
      new TopicAIEngine({
        ...(options.topicAIOptions || {}),
        provider: options.provider || null
      });

    this.researchEngine =
      options.researchEngine ||
      new ResearchEngine(options.researchOptions);

    this.factChecker =
      options.factChecker ||
      new FactChecker(options.factCheckOptions);

    this.scenarioPipeline =
      options.scenarioPipeline ||
      new ScenarioPipeline(options.scenarioOptions);

    this.provider = options.provider || null;
  }

  setProvider(provider) {
    if (typeof provider !== "function") {
      throw new Error("AI provider must be a function");
    }

    this.provider = provider;
    this.topicAI.setProvider(provider);

    return this;
  }

  buildTopicPrompt(options = {}) {
    return this.strategist.buildPrompt(options);
  }

  async generateTopics(options = {}) {
    const prompt = this.buildTopicPrompt(options);

    const result =
      await this.topicAI.generate(
        prompt,
        {
          ...(options.topicAIOptions || {}),
          stage: "topic"
        }
      );

    return {
      prompt,
      ...result
    };
  }

  buildResearchPrompt(topic) {
    return this.researchEngine.buildPrompt(topic);
  }

  processResearch(topic, rawOutput) {
    const result =
      this.researchEngine.research(
        topic,
        rawOutput
      );

    const validation =
      this.factChecker.check(result.claims);

    if (!validation.valid) {
      throw new Error(
        `Research fact check failed: ${validation.rejected
          .map(item => item.id || "unknown")
          .join(", ")}`
      );
    }

    return {
      topic,
      prompt: result.prompt,
      claims: result.claims,
      verifiedClaims: validation.verified,
      rejectedClaims: validation.rejected,
      totalClaims: validation.total,
      verifiedCount: validation.verified.length,
      rejectedCount: validation.rejected.length
    };
  }

  buildScenarioPrompt(topic, verifiedClaims) {
    const generator =
      this.scenarioPipeline.generator;

    return generator.buildPrompt(
      topic,
      verifiedClaims
    );
  }

  processScenario(topic, verifiedClaims, rawOutput) {
    return this.scenarioPipeline.process(
      topic,
      verifiedClaims,
      rawOutput
    );
  }

  async run(options = {}) {
    if (!this.provider) {
      throw new Error("AI provider is not configured");
    }

    const topicResult =
      await this.generateTopics(options);

    const selected =
      topicResult.selected;

    if (!selected) {
      throw new Error("No topic selected");
    }

    let research;

    if (options.researchOutput) {
      research =
        this.processResearch(
          selected,
          options.researchOutput
        );
    } else {
      const researchPrompt =
        this.buildResearchPrompt(selected);

      const rawResearch =
        await this.provider(
          researchPrompt,
          {
            stage: "research",
            topic: selected
          }
        );

      research =
        this.processResearch(
          selected,
          rawResearch
        );
    }

    let scenario;

    if (options.scenarioOutput) {
      scenario =
        this.processScenario(
          selected,
          research.verifiedClaims,
          options.scenarioOutput
        );
    } else {
      const scenarioPrompt =
        this.buildScenarioPrompt(
          selected,
          research.verifiedClaims
        );

      const rawScenario =
        await this.provider(
          scenarioPrompt,
          {
            stage: "scenario",
            topic: selected,
            verifiedClaims: research.verifiedClaims
          }
        );

      scenario =
        this.processScenario(
          selected,
          research.verifiedClaims,
          rawScenario
        );
    }

    const result = {
      topic: topicResult,
      research,
      scenario
    };

    if (options.render) {
      result.render =
        this.scenarioPipeline.render(
          options.renderOptions || {}
        );
    }

    return result;
  }
}

if (typeof module !== "undefined") {
  module.exports = ContentPipeline;
}
