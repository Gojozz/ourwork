const ContentPipeline = require("./engine/content-pipeline");
const AIAdapter = require("./engine/ai-adapter");

console.log("===== SCENARIO AI RETRY TEST =====");

const invalidScenario = JSON.stringify({
  id: "retry-test",
  title: "Retry Test",
  duration: 10,
  initialState: {
    entities: {},
    variables: {}
  },
  events: [{
    id: "event-1",
    start: 0,
    end: 10,
    action: {
      domain: "earth",
      property: "rotation",
      operation: "update",
      value: 0
    }
  }]
});

const validScenario = JSON.stringify({
  id: "retry-test",
  title: "Retry Test",
  duration: 10,
  initialState: {
    entities: {},
    variables: {}
  },
  events: [{
    id: "event-1",
    start: 0,
    end: 10,
    action: {
      domain: "earth",
      property: "rotation",
      operation: "multiply",
      value: 0
    }
  }]
});

let calls = 0;

const provider = {
  async generate() {
    calls++;

    if (calls === 1) {
      return invalidScenario;
    }

    return validScenario;
  }
};

const adapter = new AIAdapter(provider);

const pipeline = new ContentPipeline({
  ai: adapter
});

const topic = {
  id: "retry-test",
  title: "Retry Test",
  description: "Automatic scenario repair test"
};

const verifiedClaims = [
  {
    statement:
      "Earth rotation can be represented as a simulation variable.",
    source: "test"
  }
];

const scenarioPrompt = `
Generate a WHAT IF LAB simulation scenario.
Return JSON only.
`.trim();

(async () => {
  try {
    const result = await pipeline.generateScenario(
      topic,
      verifiedClaims,
      scenarioPrompt,
      { maxScenarioRetries: 2 }
    );

    const scenario = result.scenario;

    if (calls !== 2) {
      throw new Error(
        `Expected exactly 2 AI calls, got ${calls}`
      );
    }

    if (!scenario) {
      throw new Error("Scenario result is missing");
    }

    if (
      scenario.events[0].action.operation !==
      "multiply"
    ) {
      throw new Error(
        "Invalid operation was not repaired"
      );
    }

    if (
      !result.validation ||
      result.validation.valid !== true
    ) {
      throw new Error(
        "Repaired scenario failed validation"
      );
    }

    console.log("FIRST OUTPUT: update -> rejected");
    console.log("SECOND OUTPUT: multiply -> accepted");
    console.log("AI CALLS:", calls);
    console.log("VALID:", result.validation.valid);
    console.log("");
    console.log("SCENARIO AI RETRY TEST: OK");
  } catch (error) {
    console.error("");
    console.error("SCENARIO AI RETRY TEST: FAILED");
    console.error(error.stack || error);
    process.exit(1);
  }
})();
