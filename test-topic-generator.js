const TopicGenerator = require("./engine/topic-generator");

const generator = new TopicGenerator({
  minIdeas: 1,
  maxIdeas: 10
});

console.log("===== ARRAY OUTPUT =====");

const arrayOutput = JSON.stringify([
  {
    id: "earth-loses-gravity",
    title: "What If Earth Suddenly Lost Gravity?",
    curiosity: 9.8,
    visual: 9.5,
    shortForm: 9.2,
    novelty: 8.7,
    educational: 9.4
  },
  {
    id: "moon-explodes",
    title: "What If the Moon Suddenly Exploded?",
    curiosity: 9.7,
    visual: 9.8,
    shortForm: 9.4,
    novelty: 8.9,
    educational: 8.8
  }
]);

const topics1 = generator.generate(arrayOutput);

console.log("COUNT:", topics1.length);
console.log("FIRST:", topics1[0].id);


console.log();
console.log("===== OBJECT OUTPUT =====");

const objectOutput = JSON.stringify({
  topics: [
    {
      id: "sun-disappears",
      title: "What If the Sun Suddenly Disappeared?",
      curiosity: 9.9,
      visual: 9.8,
      shortForm: 9.5,
      novelty: 9.0,
      educational: 9.7
    }
  ]
});

const topics2 = generator.generate(objectOutput);

console.log("COUNT:", topics2.length);
console.log("FIRST:", topics2[0].id);


console.log();
console.log("===== MARKDOWN JSON =====");

const markdownOutput = `
\`\`\`json
[
  {
    "id": "gravity-doubles",
    "title": "What If Gravity Suddenly Doubled?",
    "curiosity": 9.6,
    "visual": 9.4,
    "shortForm": 9.3,
    "novelty": 8.8,
    "educational": 9.5
  }
]
\`\`\`
`;

const topics3 = generator.generate(markdownOutput);

console.log("COUNT:", topics3.length);
console.log("FIRST:", topics3[0].id);


console.log();
console.log("===== INVALID OUTPUT =====");

try {
  generator.generate("this is not json");
  console.log("ERROR: invalid output was accepted");
  process.exit(1);
} catch (error) {
  console.log("REJECTED:", error.message);
}


console.log();
console.log("TOPIC GENERATOR: OK");
