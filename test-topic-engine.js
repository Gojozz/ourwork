const fs = require("fs");

const TopicEngine =
  require("./engine/topic-engine.js");


const topics =
  JSON.parse(
    fs.readFileSync(
      "./lab/topics/seed-topics.json",
      "utf8"
    )
  );


const engine =
  new TopicEngine();


const added =
  engine.addMany(topics);


console.log("===== TOPIC ENGINE TEST =====");

console.log(
  "ADDED:",
  added
);

console.log(
  "TOTAL:",
  engine.list().length
);

console.log("");
console.log("===== RANKING =====");

for (const topic of engine.rank()) {
  console.log(
    topic.score.toFixed(2),
    "->",
    topic.id
  );
}


console.log("");
console.log("===== NEXT TOPIC =====");

const next =
  engine.next();

console.log(
  "SELECTED:",
  next.id
);

console.log(
  "TITLE:",
  next.title
);

console.log(
  "REMAINING:",
  engine.remaining()
);


console.log("");
console.log("===== USED TOPIC TEST =====");

const again =
  engine.next();

console.log(
  "NEXT:",
  again.id
);

console.log(
  "REMAINING:",
  engine.remaining()
);


if (
  added === 5 &&
  next &&
  again &&
  next.id !== again.id &&
  engine.remaining() === 3
) {
  console.log("");
  console.log("TOPIC ENGINE: OK");
} else {
  process.exit(1);
}
