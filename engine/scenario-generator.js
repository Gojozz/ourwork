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
- Describe WHAT changes in the simulation, not HOW it is implemented.
- Use declarative actions only.
- Do not choose JavaScript handlers.
- Do not invent JavaScript.
- Do not generate Three.js code.
- Do not include unsupported scientific claims.

DECLARATIVE ACTION:
Each event must contain an "action" object with:
- domain: the scientific or simulation domain
- property: the state property that changes
- operation: how the property changes
- value: the target value or operation value

STRICT OPERATION CONTRACT:

The "operation" field MUST be exactly ONE of these seven strings:

"set"
"multiply"
"add"
"subtract"
"remove"
"enable"
"disable"

These are the ONLY supported simulation operations.

NEVER output any other operation name.

INVALID examples that MUST NOT be used:
"update"
"change"
"modify"
"rotate"
"scale"
"transform"
"setValue"
"increment"
"decrement"

If a requested change cannot be expressed using one of the seven
supported operations above, choose the closest valid declarative
operation or omit that action.

The action describes the intended state change.
The simulation engine decides how to implement it.

OUTPUT RULES:
- Return JSON only.
- Return one scenario object.
- Required fields:
  id
  title
  version
  duration
  initialState
  events

- initialState must contain:
  entities
  variables

- entities and variables must be plain JSON objects.
- Entities describe what exists in the simulation.
- Entity appearance must use declarative properties only.
- Do not include JavaScript, Three.js, functions, or executable code.

- Each event must contain:
  id
  start
  end
  action

- Each action must contain:
  domain
  property
  operation
  value
- operation MUST be exactly one of:
  set, multiply, add, subtract, remove, enable, disable
- Never invent operation names.
- Never use implementation-specific commands.

- Do not include an "effect" field unless explicitly required for legacy compatibility.
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
