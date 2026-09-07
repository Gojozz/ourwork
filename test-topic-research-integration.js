const fs = require("fs");
const TopicAIEngine = require("./engine/topic-ai-engine");

const testFile = "./lab/topics/test-topic-research-used.json";

if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
}

console.log("===== TOPIC AI → RESEARCH INTEGRATION =====");

const engine = new TopicAIEngine({
  usedTopicsFile: testFile,
  minIdeas: 1,
  maxIdeas: 5,
  provider: async () => {
    return JSON.stringify({
      topics: [
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
        }
      ]
    });
  }
});

const researchOutput = JSON.stringify({
  claims: [
    {
      id: "rotation",
      statement: "Earth rotates on its axis.",
      importance: 10,
      confidence: 10,
      type: "established-fact"
    },
    {
      id: "atmosphere-motion",
      statement: "The atmosphere would initially retain motion relative to Earth's surface.",
      importance: 9,
      confidence: 9,
      type: "consequence"
    },
    {
      id: "weak-claim",
      statement: "Every object would immediately fly into space.",
      importance: 8,
      confidence: 2,
      type: "consequence"
    }
  ]
});

(async () => {
  try {
    const result = await engine.generate(
      "Generate scientific What If topics",
      {
        researchOutput
      }
    );

    console.log("\n===== TOPIC RESULT =====");
    console.log("GENERATED:", result.generated.length);
    console.log("FRESH:", result.fresh.length);
    console.log("SELECTED:", result.selected.id);

    console.log("\n===== RESEARCH RESULT =====");

    console.log(
      "TOTAL CLAIMS:",
      result.research.totalClaims
    );

    console.log(
      "VERIFIED:",
      result.research.verifiedCount
    );

    console.log(
      "REJECTED:",
      result.research.rejectedCount
    );

    console.log("\nVERIFIED CLAIMS:");

    for (const claim of result.research.verifiedClaims) {
      console.log(
        "OK ->",
        claim.id,
        "| confidence:",
        claim.confidence
      );
    }

    console.log("\nREJECTED CLAIMS:");

    for (const item of result.research.rejectedClaims) {
      console.log(
        "REJECT ->",
        item.claim.id,
        "|",
        item.reason
      );
    }

    if (
      result.selected &&
      result.research &&
      result.research.topic.id === result.selected.id &&
      result.research.totalClaims === 3 &&
      result.research.verifiedCount === 2 &&
      result.research.rejectedCount === 1
    ) {
      console.log("\nTOPIC → RESEARCH: OK");
    } else {
      console.log("\nTOPIC → RESEARCH: FAILED");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\nERROR:", error.message);
    process.exitCode = 1;
  } finally {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  }
})();
