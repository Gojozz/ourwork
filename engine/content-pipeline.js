const Strategist = require("./strategist");
const TopicAIEngine = require("./topic-ai-engine");
const ResearchEngine = require("./research-engine");
const FactChecker = require("./fact-checker");
const ScenarioPipeline = require("./scenario-pipeline");
const NarrationGenerator = require("./narration-generator");
const TTSAdapter = require("./tts-adapter");
const AudioMuxRenderer = require("./audio-mux-renderer");
const AIAdapter = require("./ai-adapter");

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

    this.narration =
      options.narration ||
      new NarrationGenerator(
        options.narrationOptions
      );

    this.tts =
      options.tts ||
      new TTSAdapter(
        options.ttsProvider || null
      );

    this.audioMux =
      options.audioMux ||
      new AudioMuxRenderer(
        options.audioMuxOptions
      );

    this.provider = options.provider || null;

    this.diagnostics =
      options.diagnostics || {};

    this.ai =
      options.ai ||
      new AIAdapter(options.provider || null);
  }

  setProvider(provider) {
    const valid =
      typeof provider === "function" ||
      (provider && typeof provider.generate === "function");

    if (!valid) {
      throw new Error(
        "AI provider must be a function or an object with generate()"
      );
    }

    this.provider = provider;
    this.ai.setProvider(provider);
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

  async generateScenario(
    topic,
    verifiedClaims,
    scenarioPrompt,
    options = {}
  ) {
    const maxRetries =
      Number.isInteger(options.maxScenarioRetries)
        ? Math.max(0, options.maxScenarioRetries)
        : 2;

    let prompt = scenarioPrompt;
    let rawOutput = null;
    let lastError = null;

    for (
      let attempt = 0;
      attempt <= maxRetries;
      attempt++
    ) {
      rawOutput =
        await this.ai.generate(
          prompt,
          {
            stage: "scenario",
            topic,
            verifiedClaims,
            attempt,
            maxTokens: 1200,
            reasoningEffort: "none"
          }
        );

      if (this.diagnostics.scenarioRawPath) {
        const fs = require("fs");

        fs.appendFileSync(
          this.diagnostics.scenarioRawPath,
          `
===== SCENARIO ATTEMPT ${attempt} =====
${String(rawOutput)}
`
        );
      }

      try {
        return this.processScenario(
          topic,
          verifiedClaims,
          rawOutput
        );
      } catch (error) {
        lastError = error;

        if (attempt >= maxRetries) {
          throw new Error(
            `Scenario generation failed after ${attempt + 1} attempts: ${error.message}`
          );
        }

        prompt = `
You are repairing an invalid WHAT IF LAB simulation scenario.

The previous AI output failed validation.

VALIDATION ERROR:
${error.message}

ORIGINAL SCENARIO REQUEST:
${scenarioPrompt}

INVALID AI OUTPUT:
${String(rawOutput)}

REPAIR RULES:
- Return JSON only.
- Return exactly one scenario object.
- Preserve the scientific meaning of the scenario.
- Fix every validation error.
- Do not invent fields, operations, handlers, JavaScript, or Three.js code.
- Every event must use a declarative "action".
- The "operation" field MUST be exactly one of:
  "set"
  "multiply"
  "add"
  "subtract"
  "remove"
  "enable"
  "disable"
- NEVER use "update", "change", "modify", "rotate",
  "scale", "transform", "increment", "decrement",
  or any other operation name.
- Ensure initialState.entities and initialState.variables exist.
- initialState.entities MUST be a plain JSON object with at least 1 entity.
- Every entity MUST have numeric x/y directly or through position.x/position.y.
- Every entity MUST have at least one renderable visual property such as radius, width, height, shape, or color.
- Ensure all events are chronological and non-overlapping.
- Ensure every action contains:
  domain
  property
  operation
  value
- At least ONE event MUST change a visible entity property.
- For every visual change, action.domain MUST be exactly "entity.<entityId>".
- The <entityId> MUST exactly match an entity ID in initialState.entities.
- Valid visual property examples:
  appearance.radius
  appearance.opacity
  appearance.color
  appearance.width
  appearance.height
  position.x
  position.y
  rotation
- Do NOT use a bare domain such as "earth", "gravity", or "atmosphere" for visual entity changes.
- Do NOT put visual changes only in variables.
- The operation MUST be one of: set, multiply, add, subtract, remove, enable, disable.

Return the COMPLETE corrected scenario JSON.
`.trim();
      }
    }

    throw lastError ||
      new Error("Scenario generation failed");
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
        await this.ai.generate(
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

      if (this.diagnostics.scenarioPromptPath) {
        const fs = require("fs");

        fs.writeFileSync(
          this.diagnostics.scenarioPromptPath,
          String(scenarioPrompt)
        );
      }

      scenario =
        await this.generateScenario(
          selected,
          research.verifiedClaims,
          scenarioPrompt,
          options
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

    if (options.narrate) {
      result.narration =
        this.narration.generate(
          selected,
          research.verifiedClaims,
          scenario.scenario
        );
    }

    if (options.tts) {
      if (!result.narration) {
        result.narration =
          this.narration.generate(
            selected,
            research.verifiedClaims,
            scenario.scenario
          );
      }

      result.audio =
        await this.tts.synthesize(
          result.narration.text,
          options.ttsOptions || {}
        );
    }

    if (options.muxAudio) {
      if (!result.render) {
        throw new Error(
          "Render result is required for audio mux"
        );
      }

      if (!result.audio) {
        throw new Error(
          "Audio result is required for audio mux"
        );
      }

      result.final =
        this.audioMux.render({
          videoPath:
            result.render.mp4.outputPath,

          audioPath:
            result.audio.audioPath ||
            result.audio.outputPath,

          outputPath:
            options.muxOptions &&
            options.muxOptions.outputPath
        });
    }

    return result;
  }
}

if (typeof module !== "undefined") {
  module.exports = ContentPipeline;
}
