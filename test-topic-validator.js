const fs = require("fs");

const TopicValidator =
  require("./engine/topic-validator.js");


const topics =
  JSON.parse(
    fs.readFileSync(
      "./lab/topics/seed-topics.json",
      "utf8"
    )
  );


console.log("===== VALID TOPICS =====");


const valid =
  TopicValidator.validateMany(topics);


console.log(
  "VALID:",
  valid.valid
);

console.log(
  "ERRORS:",
  valid.errors
);


console.log("");
console.log("===== INVALID TOPIC =====");


const invalidTopic = {
  id: "",
  title: "",
  curiosity: 15,
  visual: -2,
  shortForm: 8,
  novelty: "high",
  educational: 11
};


const invalid =
  TopicValidator.validate(
    invalidTopic
  );


console.log(
  "VALID:",
  invalid.valid
);

console.log(
  "ERROR COUNT:",
  invalid.errors.length
);


for (const error of invalid.errors) {
  console.log(
    "ERROR:",
    error
  );
}


if (
  valid.valid &&
  !invalid.valid &&
  invalid.errors.length >= 6
) {
  console.log("");
  console.log("TOPIC VALIDATOR: OK");
} else {
  process.exit(1);
}
