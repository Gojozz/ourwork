const ScenarioPipeline = require("./engine/scenario-pipeline");
const EffectRegistry = require("./engine/effect-registry");

console.log("===== SCENARIO PIPELINE TEST =====");

const registry = new EffectRegistry();

registry.register("earth.normal");
registry.register("earth.decelerate");
registry.register("earth.stop");
registry.register("earth.consequences");

const pipeline = new ScenarioPipeline({
  validatorOptions: {
    registry
  }
});

const topic = {
  id: "earth-stops-rotating",
  title: "What If Earth Suddenly Stopped Rotating?",
  description:
    "Explore the consequences if Earth's rotation suddenly stopped."
};

const verifiedClaims = [
  {
    id: "rotation",
    statement:
      "Earth rotates once approximately every 24 hours.",
    importance: 10,
    confidence: 10,
    type: "fact"
  },
  {
    id: "atmosphere-motion",
    statement:
      "The atmosphere would initially retain significant motion relative to the surface.",
    importance: 9,
    confidence: 9,
    type: "consequence"
  }
];

const rawOutput = JSON.stringify({
  id: "earth-stops-rotating",
  title: "Earth Stops Rotating",
  version: 1,
  duration: 30,
  events: [
    {
      id: "normal",
      start: 0,
      end: 6,
      effect: "earth.normal"
    },
    {
      id: "decelerating",
      start: 6,
      end: 12,
      effect: "earth.decelerate"
    },
    {
      id: "stopped",
      start: 12,
      end: 20,
      effect: "earth.stop"
    },
    {
      id: "consequences",
      start: 20,
      end: 30,
      effect: "earth.consequences"
    }
  ]
});

console.log("\n===== PROCESS =====");

const result = pipeline.process(
  topic,
  verifiedClaims,
  rawOutput
);

console.log("TOPIC:", result.topic.id);
console.log("SCENARIO:", result.scenario.id);
console.log("TITLE:", result.scenario.title);
console.log("DURATION:", result.scenario.duration);
console.log("EVENTS:", result.scenario.events.length);
console.log("VALID:", result.validation.valid);

console.log("\n===== EVENTS =====");

for (const event of result.scenario.events) {
  console.log(
    `${event.start}-${event.end} -> ${event.effect}`
  );
}

console.log("\n===== ENGINE =====");

console.log(
  "LOADED:",
  pipeline.getScenario().id
);

console.log(
  "ENGINE EVENTS:",
  pipeline.getEvents().length
);

console.log(
  "ENGINE DURATION:",
  pipeline.getDuration()
);

if (
  result.scenario.id === "earth-stops-rotating" &&
  result.validation.valid === true &&
  pipeline.getScenario().id === "earth-stops-rotating" &&
  pipeline.getEvents().length === 4 &&
  pipeline.getDuration() === 30
) {
  console.log("\nSCENARIO PIPELINE: OK");
} else {
  console.log("\nSCENARIO PIPELINE: FAILED");
  process.exit(1);
}
