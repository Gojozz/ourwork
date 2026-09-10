const fs = require("fs");

const ContentPipeline = require("./engine/content-pipeline");

const testFile = "./lab/topics/test-content-pipeline-used.json";

if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
}

const generatedTopics = {
  topics: [
    {
      id: "earth-loses-magnetic-field",
      title: "What If Earth's Magnetic Field Suddenly Disappeared?",
      curiosity: 9.8,
      visual: 9.7,
      shortForm: 9.5,
      novelty: 9.4,
      educational: 9.8
    },
    {
      id: "oceans-evaporate",
      title: "What If Earth's Oceans Suddenly Evaporated?",
      curiosity: 9.6,
      visual: 9.8,
      shortForm: 9.4,
      novelty: 9.3,
      educational: 9.5
    }
  ]
};

const researchOutput = {
  claims: [
    {
      id: "magnetic-field",
      statement: "Earth's magnetic field helps deflect charged particles from the solar wind.",
      importance: 10,
      confidence: 10,
      type: "established"
    },
    {
      id: "solar-radiation",
      statement: "The loss of Earth's magnetic field would change the interaction between the solar wind and Earth's upper atmosphere.",
      importance: 9,
      confidence: 9,
      type: "established"
    },
    {
      id: "weak-claim",
      statement: "Every person on Earth would immediately be harmed.",
      importance: 3,
      confidence: 2,
      type: "speculative"
    }
  ]
};

const scenarioOutput = {
  id: "earth-loses-magnetic-field",
  title: "What If Earth's Magnetic Field Suddenly Disappeared?",
  version: 1,
  duration: 2,

  initialState: {
    entities: {
      earth: {
        x: 540,
        y: 700,
        radius: 260,
        appearance: {
          shape: "circle",
          color: "#4da6ff"
        }
      },
      solarWind: {
        x: 540,
        y: 1100,
        appearance: {
          shape: "line",
          length: 500,
          color: "#ffffff",
          strokeWidth: 10,
          opacity: 0.7
        }
      }
    },

    variables: {
      "physics.gravity": 9.8
    }
  },

  events: [
    {
      id: "field-lost",
      start: 0,
      end: 1,
      action: {
        domain: "physics",
        property: "gravity",
        operation: "multiply",
        value: 2
      }
    },
    {
      id: "gravity-reset",
      start: 1,
      end: 2,
      action: {
        domain: "physics",
        property: "gravity",
        operation: "set",
        value: 9.8
      }
    }
  ]
};

const calls = [];

async function mockProvider(prompt, options = {}) {
  calls.push({
    prompt,
    options
  });

  if (options.stage === "topic") {
    return JSON.stringify(generatedTopics);
  }

  if (options.stage === "research") {
    return JSON.stringify(researchOutput);
  }

  if (options.stage === "scenario") {
    return JSON.stringify(scenarioOutput);
  }

  throw new Error(`Unexpected AI stage: ${options.stage}`);
}

const registry = new (require("./engine/effect-registry"))();

[
  "earth.normal",
  "earth.magnetic-field-off",
  "earth.solar-wind",
  "earth.consequences"
].forEach(name => registry.register(name));

const pipeline = new ContentPipeline({
  provider: mockProvider,
  strategist: {
    buildPrompt: options => {
      return `Generate ${options.count || 5} scientific What If topics`;
    }
  },
  scenarioOptions: {
    validatorOptions: {
      registry
    }
  },
  topicAIOptions: {
    usedTopicsFile: "./lab/topics/test-content-pipeline-used.json"
  }
});

(async () => {
  console.log("===== CONTENT PIPELINE TEST =====");

  const outputDir =
    "./output/test/content-pipeline-e2e";

  const outputPath =
    "./output/test/content-pipeline-e2e/content-pipeline.mp4";

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, {
      recursive: true,
      force: true
    });
  }

  const result = await pipeline.run({
    count: 2,
    render: true,
    renderOptions: {
      fps: 10,
      outputDir,
      outputPath
    }
  });

  console.log("\n===== TOPIC =====");
  console.log("SELECTED:", result.topic.selected.id);
  console.log("TITLE:", result.topic.selected.title);

  console.log("\n===== RESEARCH =====");
  console.log("TOTAL CLAIMS:", result.research.totalClaims);
  console.log("VERIFIED:", result.research.verifiedCount);
  console.log("REJECTED:", result.research.rejectedCount);

  console.log("\n===== SCENARIO =====");
  console.log("ID:", result.scenario.scenario.id);
  console.log("TITLE:", result.scenario.scenario.title);
  console.log("DURATION:", result.scenario.scenario.duration);
  console.log("EVENTS:", result.scenario.scenario.events.length);
  console.log("VALID:", result.scenario.validation.valid);

  console.log("\n===== RENDER =====");
  console.log(
    "FRAMES:",
    result.render.frames.length
  );
  console.log(
    "MP4:",
    result.render.mp4.outputPath
  );
  console.log(
    "MP4 SIZE:",
    result.render.mp4.size
  );

  console.log("\n===== AI CALLS =====");
  console.log("COUNT:", calls.length);
  console.log(
    "STAGES:",
    calls.map(call => call.options.stage).join(" -> ")
  );

  if (
    result.topic.selected &&
    result.research.verifiedCount === 2 &&
    result.research.rejectedCount === 1 &&
    result.scenario.validation.valid === true &&
    result.scenario.scenario.events.length === 2 &&
    result.scenario.scenario.initialState &&
    result.render &&
    result.render.frames.length === 20 &&
    result.render.mp4 &&
    result.render.mp4.size > 0 &&
    calls.length === 3
  ) {
    console.log("\nCONTENT PIPELINE: OK");
  } else {
    throw new Error("CONTENT PIPELINE: FAILED");
  }

  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
})().catch(error => {
  console.error("\nCONTENT PIPELINE: FAILED");
  console.error(error.message);

  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }

  process.exit(1);
});
