const Strategist = require("./engine/strategist");

console.log("===== STRATEGIST TEST =====");

const strategist = new Strategist({
  defaultIdeas: 5
});

const prompt = strategist.buildPrompt({
  ideas: 5,
  usedTopics: [
    {
      id: "earth-stops-rotating",
      title: "What If Earth Suddenly Stopped Rotating?"
    },
    {
      id: "moon-disappears",
      title: "What If the Moon Suddenly Disappeared?"
    },
    {
      id: "gravity-doubles",
      title: "What If Earth's Gravity Suddenly Doubled?"
    }
  ]
});

console.log(prompt);

console.log();
console.log("===== CHECKS =====");

const checks = [
  ["HAS WHAT IF LAB", prompt.includes("WHAT IF LAB")],
  ["HAS IDEAS COUNT", prompt.includes("Generate 5")],

  [
    "HAS EARTH TOPIC",
    prompt.includes("What If Earth Suddenly Stopped Rotating?")
  ],

  [
    "HAS MOON TOPIC",
    prompt.includes("What If the Moon Suddenly Disappeared?")
  ],

  [
    "HAS GRAVITY TOPIC",
    prompt.includes("What If Earth's Gravity Suddenly Doubled?")
  ],

  ["HAS JSON RULE", prompt.includes("Return JSON only")],
  ["HAS SCORING", prompt.includes("curiosity: 0-10")],
  ["HAS VISUAL", prompt.includes("Strong visual potential")],
  ["HAS SHORT FORM", prompt.includes("30–60 second videos")],
  ["HAS CAUSE EFFECT", prompt.includes("Clear cause-and-effect consequences")]
];

let failed = false;

for (const [name, result] of checks) {
  console.log(`${name}:`, result ? "OK" : "FAIL");

  if (!result) {
    failed = true;
  }
}

console.log();
console.log("===== STRING TOPIC TEST =====");

const stringPrompt = strategist.buildPrompt({
  ideas: 3,
  usedTopics: [
    "What If the Sun Suddenly Disappeared?",
    "What If Earth's Atmosphere Vanished?"
  ]
});

const stringChecks = [
  [
    "HAS SUN",
    stringPrompt.includes("What If the Sun Suddenly Disappeared?")
  ],
  [
    "HAS ATMOSPHERE",
    stringPrompt.includes("What If Earth's Atmosphere Vanished?")
  ]
];

for (const [name, result] of stringChecks) {
  console.log(`${name}:`, result ? "OK" : "FAIL");

  if (!result) {
    failed = true;
  }
}

if (failed) {
  console.log();
  console.log("STRATEGIST: FAILED");
  process.exit(1);
}

console.log();
console.log("STRATEGIST: OK");
