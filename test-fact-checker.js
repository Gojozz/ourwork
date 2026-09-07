const FactChecker = require("./engine/fact-checker");

console.log("===== FACT CHECKER TEST =====");

const checker = new FactChecker({
  minConfidence: 7
});

const claims = [
  {
    id: "fact-1",
    statement: "Earth rotates on its axis.",
    importance: 10,
    confidence: 10,
    type: "established-fact"
  },
  {
    id: "fact-2",
    statement: "The atmosphere would initially retain motion.",
    importance: 9,
    confidence: 9,
    type: "consequence"
  },
  {
    id: "uncertain-1",
    statement: "Every building would immediately collapse.",
    importance: 8,
    confidence: 3,
    type: "consequence"
  },
  {
    id: "invalid-1",
    statement: "Invalid confidence example.",
    importance: 8,
    confidence: 15,
    type: "claim"
  }
];

const result = checker.check(claims);

console.log("TOTAL:", result.total);
console.log("VERIFIED:", result.verified.length);
console.log("REJECTED:", result.rejected.length);

console.log("\nVERIFIED CLAIMS:");

for (const claim of result.verified) {
  console.log("OK ->", claim.id);
}

console.log("\nREJECTED CLAIMS:");

for (const item of result.rejected) {
  console.log("REJECT ->", item.claim.id, "|", item.reason);
}

if (
  result.total === 4 &&
  result.verified.length === 2 &&
  result.rejected.length === 2 &&
  result.rejected.some(
    item => item.claim.id === "uncertain-1"
  ) &&
  result.rejected.some(
    item => item.claim.id === "invalid-1"
  )
) {
  console.log("\nFACT CHECKER: OK");
} else {
  console.log("\nFACT CHECKER: FAILED");
  process.exit(1);
}
