const fs = require("fs");

const TopicAIEngine =
  require("./engine/topic-ai-engine");

const usedTopicsFile =
  "./lab/topics/test-topic-ai-retry-used.json";

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
          id: "technology-is-important",
          title: "Technology Is Important",
          curiosity: 3,
          visual: 3,
          shortForm: 3,
          novelty: 3,
          educational: 3
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
      "===== TOPIC AI RETRY TEST ====="
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
      "GENERATED:",
      result.generated.length
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

    console.log(
      "TITLE:",
      result.selected.title
    );

    if (
      calls !== 2 ||
      result.strategy.attempts !== 2 ||
      result.quality.accepted.length !== 1 ||
      result.quality.rejected.length !== 1 ||
      result.selected.id !==
        "humans-dont-eat-for-one-week"
    ) {
      throw new Error(
        "TOPIC AI RETRY TEST FAILED"
      );
    }

    console.log(
      "TOPIC AI RETRY: OK"
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
