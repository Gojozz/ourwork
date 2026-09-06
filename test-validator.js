const fs = require("fs");

const ScenarioValidator =
  require("./engine/validator.js");


const scenario =
  JSON.parse(
    fs.readFileSync(
      "./scenarios/earth-stops.json",
      "utf8"
    )
  );


console.log("===== VALID SCENARIO =====");

const valid =
  ScenarioValidator.validate(scenario);

console.log("VALID:", valid.valid);
console.log("ERRORS:", valid.errors);


console.log("");
console.log("===== INVALID SCENARIO =====");


const invalidScenario = {
  id: "",
  title: "",
  duration: 5,

  events: [
    {
      id: "bad-event",
      start: -2,
      end: 1,
      effect: ""
    },
    {
      id: "overlap",
      start: 0,
      end: 10,
      effect: "earth.stop"
    }
  ]
};


const invalid =
  ScenarioValidator.validate(
    invalidScenario
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
  console.log("ERROR:", error);
}


if (
  valid.valid &&
  !invalid.valid &&
  invalid.errors.length > 0
) {
  console.log("");
  console.log("VALIDATOR: OK");
} else {
  process.exit(1);
}
