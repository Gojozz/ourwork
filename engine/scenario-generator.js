class ScenarioGenerator {
  constructor(options = {}) {
    this.defaultDuration = options.defaultDuration || 30;
    this.maxEvents = options.maxEvents || 20;
  }

  buildPrompt(topic, verifiedClaims) {
    if (!topic || typeof topic !== "object") {
      throw new Error("Topic is required");
    }

    if (!topic.id || !topic.title) {
      throw new Error("Topic id and title are required");
    }

    if (!Array.isArray(verifiedClaims) || !verifiedClaims.length) {
      throw new Error("Verified claims are required");
    }

    const claimsText = verifiedClaims
      .map((claim, index) => {
        return `${index + 1}. ${claim.statement}`;
      })
      .join("\n");

    return `
You are the Scenario Generator for WHAT IF LAB.

Create a scientifically grounded simulation scenario.

TOPIC:
ID: ${topic.id}
TITLE: ${topic.title}

VERIFIED SCIENTIFIC CLAIMS:
${claimsText}

OBJECTIVES:
- Convert verified scientific claims into a clear cause-and-effect timeline.
- Suitable for a 30–60 second YouTube Shorts simulation.
- Events must have explicit start and end times.
- Events must not overlap.
- Use only registered effect names.
- Do not invent JavaScript.
- Do not generate Three.js code.
- Do not include unsupported scientific claims.

REGISTERED EFFECT EXAMPLES:
earth.normal
earth.decelerate
earth.stop
earth.consequences
camera.shake

OUTPUT RULES:
- Return JSON only.
- Return one scenario object.
- Required fields:
  id
  title
  version
  duration
  events
- Each event must contain:
  id
  start
  end
  effect
- duration must be greater than zero.
- Event start must be >= 0.
- Event end must be greater than start.
- Events must be ordered chronologically.
- Events must not overlap.
- Do not include markdown.
- Do not include explanations outside JSON.
`.trim();
  }

  parse(rawOutput) {
    if (typeof rawOutput !== "string" || !rawOutput.trim()) {
      throw new Error("Scenario output is empty");
    }

    let cleaned = rawOutput.trim();

    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    let scenario;

    try {
      scenario = JSON.parse(cleaned);
    } catch (error) {
      throw new Error("Invalid scenario JSON output");
    }

    if (
      !scenario ||
      typeof scenario !== "object" ||
      Array.isArray(scenario)
    ) {
      throw new Error("Scenario must be an object");
    }

    if (!Array.isArray(scenario.events)) {
      throw new Error("Scenario events must be an array");
    }

    if (scenario.events.length < 1) {
      throw new Error("Scenario must contain at least one event");
    }

    if (scenario.events.length > this.maxEvents) {
      throw new Error(
        `Scenario cannot contain more than ${this.maxEvents} events`
      );
    }

    return scenario;
  }

  generate(topic, verifiedClaims, rawOutput) {
    const prompt = this.buildPrompt(
      topic,
      verifiedClaims
    );

    const scenario = this.parse(rawOutput);

    return {
      topic,
      verifiedClaims,
      prompt,
      scenario
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = ScenarioGenerator;
}
