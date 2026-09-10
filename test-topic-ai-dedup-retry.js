const fs = require("fs");

const TopicAIEngine =
  require("./engine/topic-ai-engine");

const usedTopicsFile =
  "./lab/topics/test-topic-ai-dedup-retry-used.json";

if (fs.existsSync(usedTopicsFile)) {
  fs.unlinkSync(usedTopicsFile);
}

let calls = 0;

const provider = async (prompt, options = {}) => {
  calls++;

  console.log(
    `AI CALL ${calls} | STAGE: ${options.stage}`
  );

  if (calls === 1) {
    return JSON.stringify({
      topics: [
        {
          id: "earth-stops-rotating",
          title: "What If Earth Suddenly Stopped Rotating?",
          curiosity: 9,
          visual: 9,
          shortForm: 9,
          novelty: 9,
          educational: 9
        }
      ]
    });
  }

  return JSON.stringify({
    topics: [
      {
        id: "humans-dont-eat-for-one-week",
        title: "What If Humans Didn't Eat for One Week?",
        curiosity: 9,
        visual: 9,
        shortForm: 9,
        novelty: 8,
        educational: 9
      }
    ]
  });
};

(async () => {
  try {
    fs.writeFileSync(
      usedTopicsFile,
      JSON.stringify(
        [
          {
            id: "earth-stops-rotating",
            title:
              "What If Earth Suddenly Stopped Rotating?",
            usedAt:
              new Date().toISOString()
          }
        ],
        null,
        2
      )
    );

    const engine =
      new TopicAIEngine({
        provider,
        maxTopicAttempts: 3,
        usedTopicsFile
      });

    const result =
      await engine.generate(
        "Generate scientific What If topics"
      );

    console.log();
    console.log(
      "===== TOPIC AI DEDUP RETRY TEST ====="
    );

    console.log(
      "AI CALLS:",
      calls
    );

    console.log(
      "ATTEMPTS:",
      result.strategy.attempts
    );

    console.log(
      "ACCEPTED:",
      result.quality.accepted.length
    );

    console.log(
      "REJECTED:",
      result.quality.rejected.length
    );

    console.log(
      "SELECTED:",
      result.selected.id
    );

    const duplicate =
      result.quality.rejected.find(
        item =>
          item.stage ===
            "deduplication" &&
          item.topic &&
          item.topic.id ===
            "earth-stops-rotating"
      );

    console.log(
      "DUPLICATE DETECTED:",
      Boolean(duplicate)
    );

    if (
      calls !== 2 ||
      result.strategy.attempts !== 2 ||
      result.quality.accepted.length !== 1 ||
      !duplicate ||
      result.selected.id !==
        "humans-dont-eat-for-one-week"
    ) {
      throw new Error(
        "TOPIC AI DEDUP RETRY TEST FAILED"
      );
    }

    console.log(
      "TOPIC AI DEDUP RETRY: OK"
    );
  } finally {
    if (fs.existsSync(usedTopicsFile)) {
      fs.unlinkSync(usedTopicsFile);
    }
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
