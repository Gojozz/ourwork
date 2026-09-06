const fs = require("fs");
const http = require("http");

const TopicAIEngine = require("./engine/topic-ai-engine");

const testFile = "./lab/topics/test-ai-used-topics.json";

if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
}

const mockTopics = [
  {
    id: "earth-stops-rotating",
    title: "What If Earth Suddenly Stopped Rotating?",
    curiosity: 9,
    visual: 9,
    shortForm: 9,
    novelty: 8,
    educational: 9
  },
  {
    id: "moon-disappears",
    title: "What If the Moon Suddenly Disappeared?",
    curiosity: 9,
    visual: 10,
    shortForm: 9,
    novelty: 9,
    educational: 9
  },
  {
    id: "gravity-doubles",
    title: "What If Earth's Gravity Suddenly Doubled?",
    curiosity: 10,
    visual: 9,
    shortForm: 10,
    novelty: 9,
    educational: 10
  }
];

const server = http.createServer((req, res) => {
  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", () => {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify({
              topics: mockTopics
            })
          }
        }
      ]
    }));
  });
});

server.listen(18768, "127.0.0.1", async () => {
  try {
    console.log("===== TOPIC AI DEDUP TEST =====");

    const engine = new TopicAIEngine({
      usedTopicsFile: testFile,
      minIdeas: 1,
      maxIdeas: 5,
      provider: async () => {
        return JSON.stringify({
          topics: mockTopics
        });
      }
    });

    console.log("\n===== FIRST GENERATION =====");

    const result1 = await engine.generate(
      "Generate scientific What If topics"
    );

    console.log("GENERATED:", result1.generated.length);
    console.log("FRESH:", result1.fresh.length);
    console.log("ADDED:", result1.added);
    console.log("SELECTED:", result1.selected.id);

    console.log("\nUSED AFTER FIRST:");
    console.log(engine.usedTopics());

    console.log("\n===== SECOND GENERATION =====");

    const result2 = await engine.generate(
      "Generate scientific What If topics"
    );

    console.log("GENERATED:", result2.generated.length);
    console.log("FRESH:", result2.fresh.length);
    console.log("ADDED:", result2.added);
    console.log("SELECTED:", result2.selected.id);

    console.log("\nUSED AFTER SECOND:");
    console.log(engine.usedTopics());

    const used = engine.usedTopics();

    const uniqueIds = new Set(used.map(topic => topic.id));

    if (
      result1.selected.id !== result2.selected.id &&
      used.length === 2 &&
      uniqueIds.size === 2 &&
      result2.fresh.length === 2
    ) {
      console.log("\nDEDUPLICATION: OK");
    } else {
      console.log("\nDEDUPLICATION: FAILED");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\nERROR:", error.message);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    });
  }
});
