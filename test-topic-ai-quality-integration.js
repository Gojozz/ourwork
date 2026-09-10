const fs = require("fs");

const TopicAIEngine = require("./engine/topic-ai-engine");

const testFile =
  "./lab/topics/test-topic-ai-quality-integration-used.json";

if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
}

async function main() {
  console.log("===== TOPIC AI QUALITY INTEGRATION =====");

  const engine = new TopicAIEngine({
    minIdeas: 1,
    maxIdeas: 5,
    usedTopicsFile: testFile
  });

  engine.setProvider(async () => {
    return JSON.stringify({
      topics: [
        {
          id: "humans-dont-eat-for-one-week",
          title: "What If Humans Didn't Eat for One Week?",
          curiosity: 9,
          visual: 9,
          shortForm: 9,
          novelty: 9,
          educational: 9
        },
        {
          id: "technology-is-important",
          title: "Technology Is Important",
          curiosity: 2,
          visual: 2,
          shortForm: 2,
          novelty: 2,
          educational: 2
        }
      ]
    });
  });

  const result = await engine.generate(
    "Generate scientific What If topics"
  );

  console.log("GENERATED:", result.generated.length);
  console.log("ACCEPTED:", result.quality.accepted.length);
  console.log("REJECTED:", result.quality.rejected.length);
  console.log("ADDED:", result.added);

  console.log("\n===== ACCEPTED =====");

  for (const topic of result.quality.accepted) {
    console.log(
      topic.id,
      "->",
      topic.qualityScore
    );
  }

  console.log("\n===== REJECTED =====");

  for (const item of result.quality.rejected) {
    console.log(
      item.topic.id,
      "->",
      item.errors
    );
  }

  console.log("\n===== RANKING =====");

  for (const topic of result.ranking) {
    console.log(
      `${topic.score.toFixed(2)} -> ${topic.id}`
    );
  }

  console.log("\n===== USED TOPICS =====");

  const used = engine.usedTopics();

  for (const topic of used) {
    console.log(topic.id);
  }

  const acceptedIds =
    result.quality.accepted.map(topic => topic.id);

  const rejectedIds =
    result.quality.rejected.map(item => item.topic.id);

  const rankingIds =
    result.ranking.map(topic => topic.id);

  const usedIds =
    used.map(topic => topic.id);

  const passed =
    result.generated.length === 2 &&
    result.quality.accepted.length === 1 &&
    result.quality.rejected.length === 1 &&
    result.added === 1 &&
    acceptedIds.includes(
      "humans-dont-eat-for-one-week"
    ) &&
    rejectedIds.includes(
      "technology-is-important"
    ) &&
    rankingIds.includes(
      "humans-dont-eat-for-one-week"
    ) &&
    !rankingIds.includes(
      "technology-is-important"
    ) &&
    usedIds.includes(
      result.selected.id
    ) &&
    !usedIds.includes(
      "technology-is-important"
    );

  if (!passed) {
    throw new Error(
      "QUALITY GATE INTEGRATION: FAILED"
    );
  }

  console.log(
    "\nQUALITY GATE INTEGRATION: OK"
  );
}

main()
  .catch(error => {
    console.error(
      "\nQUALITY GATE INTEGRATION: FAILED"
    );
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });
