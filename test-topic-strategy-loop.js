const TopicStrategyLoop =
  require("./engine/topic-strategy-loop");

const loop =
  new TopicStrategyLoop({
    maxAttempts: 3,
    minAccepted: 1
  });

let calls = 0;

async function generate() {
  calls++;

  if (calls === 1) {
    return [
      {
        id: "technology-is-important",
        title: "Technology Is Important",
        curiosity: 3,
        visual: 3,
        shortForm: 3,
        novelty: 3,
        educational: 3
      }
    ];
  }

  return [
    {
      id: "humans-dont-eat-for-one-week",
      title: "What If Humans Didn't Eat for One Week?",
      curiosity: 9,
      visual: 9,
      shortForm: 9,
      novelty: 8,
      educational: 9
    }
  ];
}

(async () => {
  const result =
    await loop.run({
      generate
    });

  console.log(
    "===== TOPIC STRATEGY LOOP TEST ====="
  );

  console.log(
    "SUCCESS:",
    result.success
  );

  console.log(
    "ATTEMPTS:",
    result.attempts
  );

  console.log(
    "ACCEPTED:",
    result.accepted.length
  );

  console.log(
    "REJECTED:",
    result.rejected.length
  );

  console.log(
    "SELECTED:",
    result.accepted[0].id
  );

  console.log(
    "HISTORY:",
    result.history.length
  );

  if (
    !result.success ||
    result.attempts !== 2 ||
    result.accepted.length !== 1 ||
    result.rejected.length !== 1 ||
    result.accepted[0].id !==
      "humans-dont-eat-for-one-week" ||
    result.history.length !== 2
  ) {
    throw new Error(
      "TOPIC STRATEGY LOOP TEST FAILED"
    );
  }

  console.log(
    "TOPIC STRATEGY LOOP: OK"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
