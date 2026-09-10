const fs = require("fs");

const TopicAIEngine = require("./engine/topic-ai-engine");

const testFile = "./lab/topics/test-topic-ai-engine-used.json";

if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
}

async function main() {
  console.log("===== TOPIC AI ENGINE =====");

  const engine = new TopicAIEngine({
    minIdeas: 2,
    maxIdeas: 10,
    usedTopicsFile: testFile
  });

  engine.setProvider(async (prompt, options) => {
    console.log("PROMPT:", prompt);
    console.log("MODEL:", options.model || "default");

    return JSON.stringify({
      topics: [
        {
          id: "black-hole-replaces-sun",
          title: "What If a Black Hole Replaced the Sun?",
          curiosity: 9.9,
          visual: 9.9,
          shortForm: 9.7,
          novelty: 9.5,
          educational: 9.4
        },
        {
          id: "earth-stops-rotating",
          title: "What If Earth Suddenly Stopped Rotating?",
          curiosity: 9.8,
          visual: 9.7,
          shortForm: 9.6,
          novelty: 9.0,
          educational: 9.8
        },
        {
          id: "moon-disappears",
          title: "What If the Moon Suddenly Disappeared?",
          curiosity: 9.7,
          visual: 9.8,
          shortForm: 9.5,
          novelty: 9.1,
          educational: 9.3
        }
      ]
    });
  });

  const result = await engine.generate(
    "Generate 3 scientific What If topics",
    {
      model: "mock-model"
    }
  );

  console.log();
  console.log("GENERATED:", result.generated.length);
  console.log("ADDED:", result.added);

  console.log();
  console.log("RANKING:");

  for (const topic of result.ranking) {
    console.log(
      `${topic.score.toFixed(2)} -> ${topic.id}`
    );
  }

  console.log();
  console.log("SELECTED:", result.selected.id);
  console.log("TITLE:", result.selected.title);

  console.log();
  console.log("REMAINING:", engine.remaining());

  console.log();
  console.log("TOPIC AI ENGINE: OK");

  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
}

main().catch(error => {
  console.error("TEST FAILED:", error.message);

  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }

  process.exit(1);
});
