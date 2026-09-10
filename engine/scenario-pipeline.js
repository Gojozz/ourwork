const ScenarioGenerator = require("./scenario-generator");
const ScenarioAIValidator = require("./scenario-ai-validator");
const ScenarioEngine = require("./scenario");
const SimulationRenderer =
  require("./simulation-renderer");

const SimulationRenderPipeline =
  require("./simulation-render-pipeline");

class ScenarioPipeline {
  constructor(options = {}) {
    this.generator =
      options.generator ||
      new ScenarioGenerator(options.generatorOptions);

    this.validator =
      options.validator ||
      new ScenarioAIValidator(options.validatorOptions);

    this.engine = null;

    this.renderer =
      options.renderer ||
      new SimulationRenderer(
        options.rendererOptions
      );

    this.renderPipeline =
      options.renderPipeline ||
      new SimulationRenderPipeline(
        options.renderPipelineOptions
      );
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

  getRenderer() {
    return this.renderer;
  }

  getRenderPipeline() {
    return this.renderPipeline;
  }

  render(options = {}) {
    if (!this.engine) {
      throw new Error(
        "Scenario engine is not configured"
      );
    }

    const scenario =
      this.engine.getScenario();

    this.renderPipeline.configure(
      scenario
    );

    return this.renderPipeline.render(
      options
    );
  }

  renderEvent(event, options = {}) {
    if (!this.engine) {
      throw new Error(
        "Scenario engine is not configured"
      );
    }

    return this.renderer.update(
      event,
      options
    );
  }

  reset() {
    if (this.engine) {
      this.engine.reset();
    }

    this.renderer.reset();
    this.renderPipeline.reset();
  }
}

if (typeof module !== "undefined") {
  module.exports = ScenarioPipeline;
}
