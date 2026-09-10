const TopicQualityGate = require("./engine/topic-quality-gate");

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERT FAILED: ${message}`);
  }
}

const gate = new TopicQualityGate();

const goodTopics = [
  {
    id: "humans-dont-eat-for-one-week",
    title: "What If Humans Didn't Eat for One Week?",
    curiosity: 9,
    visual: 8,
    shortForm: 9,
    novelty: 8,
    educational: 9
  },
  {
    id: "earth-loses-atmosphere",
    title: "What If Earth's Atmosphere Suddenly Disappeared?",
    curiosity: 10,
    visual: 10,
    shortForm: 9,
    novelty: 8,
    educational: 10
  },
  {
    id: "internet-disappears-for-one-month",
    title: "What If the Internet Disappeared for One Month?",
    curiosity: 9,
    visual: 8,
    shortForm: 9,
    novelty: 8,
    educational: 8
  }
];

const badTopics = [
  {
    id: "light-speed-remains-constant",
    title: "What If Light Speed Remained Constant in a Vacuum?",
    curiosity: 5,
    visual: 6,
    shortForm: 5,
    novelty: 6,
    educational: 4
  },
  {
    id: "technology-is-important",
    title: "Why Is Technology Important?",
    curiosity: 4,
    visual: 3,
    shortForm: 4,
    novelty: 2,
    educational: 7
  },
  {
    id: "humans-live",
    title: "What If Humans Lived?",
    curiosity: 3,
    visual: 2,
    shortForm: 3,
    novelty: 2,
    educational: 3
  }
];

console.log("===== TOPIC QUALITY GATE TEST =====");

for (const topic of goodTopics) {
  const result = gate.check(topic);

  console.log(`GOOD: ${topic.id}`);
  console.log("VALID:", result.valid);
  console.log("SCORE:", result.score);

  assert(
    result.valid,
    `Expected valid topic: ${topic.id}`
  );
}

for (const topic of badTopics) {
  const result = gate.check(topic);

  console.log(`BAD: ${topic.id}`);
  console.log("VALID:", result.valid);
  console.log("ERRORS:", result.errors);

  assert(
    !result.valid,
    `Expected rejected topic: ${topic.id}`
  );
}

const filtered = gate.filter([
  ...goodTopics,
  ...badTopics
]);

console.log("ACCEPTED:", filtered.accepted.length);
console.log("REJECTED:", filtered.rejected.length);

assert(
  filtered.accepted.length === 3,
  "Expected 3 accepted topics"
);

assert(
  filtered.rejected.length === 3,
  "Expected 3 rejected topics"
);

console.log("TOPIC QUALITY GATE: OK");
