const ScenarioGenerator = require("./engine/scenario-generator");

console.log("===== SCENARIO GENERATOR TEST =====");

const generator = new ScenarioGenerator({
  defaultDuration: 30,
  maxEvents: 10
});

const topic = {
  id: "earth-stops-rotating",
  title: "What If Earth Suddenly Stopped Rotating?"
};

const verifiedClaims = [
  {
    id: "rotation",
    statement: "Earth rotates on its axis.",
    importance: 10,
    confidence: 10,
    type: "established-fact"
  },
  {
    id: "atmosphere",
    statement: "The atmosphere would initially retain motion relative to Earth's surface.",
    importance: 9,
    confidence: 9,
    type: "consequence"
  }
];

const prompt = generator.buildPrompt(
  topic,
  verifiedClaims
);

console.log("PROMPT CREATED:", !!prompt);
console.log(
  "HAS WHAT IF LAB:",
  prompt.includes("WHAT IF LAB")
);
console.log(
  "HAS TOPIC:",
  prompt.includes(topic.title)
);
console.log(
  "HAS VERIFIED CLAIMS:",
  prompt.includes("VERIFIED SCIENTIFIC CLAIMS")
);
console.log(
  "HAS EFFECTS:",
  prompt.includes("earth.stop")
);
console.log(
  "NO THREE.JS CODE:",
  prompt.includes("Do not generate Three.js code")
);

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

const result = generator.generate(
  topic,
  verifiedClaims,
  rawOutput
);

console.log("\n===== GENERATED SCENARIO =====");

console.log(
  "ID:",
  result.scenario.id
);

console.log(
  "TITLE:",
  result.scenario.title
);

console.log(
  "DURATION:",
  result.scenario.duration
);

console.log(
  "EVENTS:",
  result.scenario.events.length
);

for (const event of result.scenario.events) {
  console.log(
    `${event.start}-${event.end} -> ${event.effect}`
  );
}

if (
  result.scenario.id === "earth-stops-rotating" &&
  result.scenario.duration === 30 &&
  result.scenario.events.length === 4 &&
  result.scenario.events[0].effect === "earth.normal" &&
  result.scenario.events[2].effect === "earth.stop"
) {
  console.log("\nSCENARIO GENERATOR: OK");
} else {
  console.log("\nSCENARIO GENERATOR: FAILED");
  process.exit(1);
}
