const fs = require("fs");

const ScenarioEngine =
  require("./engine/scenario.js");

const TimelineEngine =
  require("./engine/timeline.js");

const EffectEngine =
  require("./engine/effects.js");


const file =
  "./scenarios/earth-stops.json";

const raw =
  fs.readFileSync(file, "utf8");

const scenarioData =
  JSON.parse(raw);


const scenario =
  new ScenarioEngine(scenarioData);

const timeline =
  new TimelineEngine(
    scenario.getEvents()
  );


const effects =
  new EffectEngine();


effects.register(
  "earth.normal",
  () => "NORMAL ROTATION"
);

effects.register(
  "earth.decelerate",
  () => "ROTATION DECELERATING"
);

effects.register(
  "earth.stop",
  () => "EARTH STOPPED"
);

effects.register(
  "earth.consequences",
  () => "CONSEQUENCES ACTIVE"
);


console.log("===== JSON SCENARIO TEST =====");

console.log(
  "FILE:",
  file
);

console.log(
  "SCENARIO:",
  scenario.getScenario().id
);

console.log(
  "TITLE:",
  scenario.getScenario().title
);

console.log(
  "VERSION:",
  scenario.getScenario().version
);

console.log(
  "DURATION:",
  scenario.getDuration()
);


for (const time of [0, 7, 15, 25]) {

  const result =
    timeline.update(time);

  const event =
    result.event;

  console.log("");
  console.log("TIME:", time);
  console.log("EVENT:", event?.id);

  if (event?.effect) {
    console.log(
      "EFFECT:",
      effects.run(event.effect)
    );
  }
}


console.log("");
console.log("JSON PIPELINE: OK");
