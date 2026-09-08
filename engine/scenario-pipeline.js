const ScenarioGenerator = require("./scenario-generator");
const ScenarioAIValidator = require("./scenario-ai-validator");
const ScenarioEngine = require("./scenario");

class ScenarioPipeline {
  constructor(options = {}) {
    this.generator =
      options.generator ||
      new ScenarioGenerator(options.generatorOptions);

    this.validator =
      options.validator ||
      new ScenarioAIValidator(options.validatorOptions);

    this.engine = null;
  }

  process(topic, verifiedClaims, rawOutput) {
    const generated =
      this.generator.generate(
        topic,
        verifiedClaims,
        rawOutput
      );

    const validation =
      this.validator.validate(
        generated.scenario
      );

    if (!validation.valid) {
      throw new Error(
        `Scenario validation failed: ${validation.errors.join("; ")}`
      );
    }

    // Only create ScenarioEngine after validation succeeds.
    this.engine =
      new ScenarioEngine(
        generated.scenario
      );

    return {
      topic,
      verifiedClaims,
      prompt: generated.prompt,
      scenario: generated.scenario,
      validation
    };
  }

  getScenario() {
    if (!this.engine) {
      return null;
    }

    return this.engine.getScenario();
  }

  getEvents() {
    if (!this.engine) {
      return [];
    }

    return this.engine.getEvents();
  }

  getDuration() {
    if (!this.engine) {
      return 0;
    }

    return this.engine.getDuration();
  }

  reset() {
    if (this.engine) {
      this.engine.reset();
    }
  }
}

if (typeof module !== "undefined") {
  module.exports = ScenarioPipeline;
}
