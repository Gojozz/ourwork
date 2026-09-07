const ResearchPipeline = require("./engine/research-pipeline");

console.log("===== RESEARCH → FACT CHECK PIPELINE =====");

const pipeline = new ResearchPipeline({
  minClaims: 1,
  maxClaims: 10,
  minConfidence: 7
});

const topic = {
  id: "earth-stops-rotating",
  title: "What If Earth Suddenly Stopped Rotating?"
};

const rawOutput = JSON.stringify({
  claims: [
    {
      id: "rotation",
      statement: "Earth rotates on its axis.",
      importance: 10,
      confidence: 10,
      type: "established-fact"
    },
    {
      id: "atmosphere",
      statement: "The atmosphere would initially retain motion.",
      importance: 9,
      confidence: 9,
      type: "consequence"
    },
    {
      id: "weak-claim",
      statement: "All oceans would instantly fly into space.",
      importance: 8,
      confidence: 2,
      type: "consequence"
    }
  ]
});

const result = pipeline.process(
  topic,
  rawOutput
);

console.log("TOPIC:", result.topic.id);
console.log("TOTAL CLAIMS:", result.totalClaims);
console.log("VERIFIED:", result.verifiedCount);
console.log("REJECTED:", result.rejectedCount);

console.log("\nVERIFIED:");

for (const claim of result.verifiedClaims) {
  console.log(
    "OK ->",
    claim.id,
    "| confidence:",
    claim.confidence
  );
}

console.log("\nREJECTED:");

for (const item of result.rejectedClaims) {
  console.log(
    "REJECT ->",
    item.claim.id,
    "|",
    item.reason
  );
}

if (
  result.topic.id === "earth-stops-rotating" &&
  result.totalClaims === 3 &&
  result.verifiedCount === 2 &&
  result.rejectedCount === 1 &&
  result.verifiedClaims.some(
    claim => claim.id === "rotation"
  ) &&
  result.verifiedClaims.some(
    claim => claim.id === "atmosphere"
  ) &&
  result.rejectedClaims.some(
    item => item.claim.id === "weak-claim"
  )
) {
  console.log("\nRESEARCH PIPELINE: OK");
} else {
  console.log("\nRESEARCH PIPELINE: FAILED");
  process.exit(1);
}
