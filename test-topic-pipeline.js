const TopicPipeline = require("./engine/topic-pipeline");

const pipeline = new TopicPipeline({
  minIdeas: 1,
  maxIdeas: 10
});

const aiOutput = JSON.stringify({
  topics: [
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
      id: "moon-disappears",
      title: "What If the Moon Suddenly Disappeared?",
      curiosity: 9.7,
      visual: 9.8,
      shortForm: 9.4,
      novelty: 9.1,
      educational: 9.3
    },
    {
      id: "gravity-doubles",
      title: "What If Earth's Gravity Suddenly Doubled?",
      curiosity: 9.6,
      visual: 9.3,
      shortForm: 9.5,
      novelty: 8.9,
      educational: 9.6
    }
  ]
});

console.log("===== TOPIC PIPELINE =====");

const result = pipeline.process(aiOutput);

console.log("GENERATED:", result.topics.length);
console.log("ADDED:", result.added);
console.log();

console.log("RANKING:");

for (const topic of result.ranking) {
  console.log(
    `${topic.score.toFixed(2)} -> ${topic.id}`
  );
}

console.log();
console.log("SELECTED:", result.selected.id);
console.log("TITLE:", result.selected.title);

console.log();
console.log("TOPIC PIPELINE: OK");
