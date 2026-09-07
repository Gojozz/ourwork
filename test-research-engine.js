const ResearchEngine = require("./engine/research-engine");

console.log("===== RESEARCH ENGINE TEST =====");

const engine = new ResearchEngine({
  minClaims: 1,
  maxClaims: 5
});

const topic = {
  id: "earth-stops-rotating",
  title: "What If Earth Suddenly Stopped Rotating?"
};

const prompt = engine.buildPrompt(topic);

console.log("PROMPT CREATED:", !!prompt);
console.log("HAS WHAT IF LAB:", prompt.includes("WHAT IF LAB"));
console.log("HAS TOPIC:", prompt.includes(topic.title));
console.log("HAS JSON RULE:", prompt.includes("JSON only"));
console.log("HAS CLAIMS:", prompt.includes('"claims"'));

const rawOutput = JSON.stringify({
  claims: [
    {
      id: "rotation-stops",
      statement: "Earth's rotation provides the angular motion that produces the normal length of a day.",
      importance: 10,
      confidence: 10,
      type: "established-fact"
    },
    {
      id: "atmosphere-motion",
      statement: "The atmosphere would initially retain much of its existing motion relative to Earth's surface.",
      importance: 9,
      confidence: 9,
      type: "consequence"
    }
  ]
});

const result = engine.research(topic, rawOutput);

console.log("CLAIMS:", result.claims.length);
console.log("FIRST:", result.claims[0].id);

if (
  prompt &&
  prompt.includes("WHAT IF LAB") &&
  prompt.includes(topic.title) &&
  result.claims.length === 2
) {
  console.log("\nRESEARCH ENGINE: OK");
} else {
  console.log("\nRESEARCH ENGINE: FAILED");
  process.exit(1);
}
